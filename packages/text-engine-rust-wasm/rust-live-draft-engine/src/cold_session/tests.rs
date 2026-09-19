use super::*;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

fn digest(value: &Value) -> String {
    format!(
        "sha256:{:x}",
        Sha256::digest(serde_json::to_vec(value).unwrap())
    )
}

fn fixture(text: &str) -> Value {
    let font = include_bytes!("../../../../../assets/fonts/Sarabun/Sarabun-Regular.ttf");
    let policy = json!({
        "schemaVersion": 1, "unicodeVersion": "17.0.0",
        "scriptRevision": "unicode-script-0.5.8",
        "bidiRevision": "thai-latin-ltr-only-v1",
        "graphemeRevision": "icu_segmenter-2.2.0",
        "lineRevision": "icu_segmenter-2.2.0",
        "shapingRevision": "rustybuzz-0.20.1",
        "runBoundaryPolicy": "common-inherited-previous-else-next-v1",
        "languageRules": [
            {"authoredLanguage": "und", "script": "Latin", "language": "en"},
            {"authoredLanguage": "und", "script": "Thai", "language": "th"}
        ],
        "fontRouteRules": [
            {"styleKey":"body", "language":"en", "script":"Latin", "direction":"ltr", "writingMode":"horizontal-tb", "fontId":"Sarabun-Regular", "resources":["sarabun-regular"], "coverage":"all-scalars-or-reject"},
            {"styleKey":"body", "language":"th", "script":"Thai", "direction":"ltr", "writingMode":"horizontal-tb", "fontId":"Sarabun-Thai", "resources":["sarabun-regular"], "coverage":"all-scalars-or-reject"}
        ],
        "featureRules": [
            {"styleKey":"body", "language":"en", "script":"Latin", "direction":"ltr", "writingMode":"horizontal-tb", "features":["kern", "liga"]},
            {"styleKey":"body", "language":"th", "script":"Thai", "direction":"ltr", "writingMode":"horizontal-tb", "features":["kern", "liga"]}
        ]
    });
    json!({
        "providerContext": {"providerId":"rust-stage3-thai-latin", "providerRevision":"v1", "policyDigest":digest(&policy), "policy":policy,
            "fonts":[{"resourceId":"sarabun-regular", "digest":format!("sha256:{:x}", Sha256::digest(font)), "bytes":font.as_slice()}]},
        "paragraphContext":{"paragraphId":"paragraph-stage3", "baseDirection":"ltr", "writingMode":"horizontal-tb"},
        "authoredSpans":[{"spanId":"span-1", "startOffset":0, "endOffset":text.encode_utf16().count(), "text":text, "language":"und", "styleKey":"body"}]
    })
}

fn create(runtime: &mut Runtime, input: &Value) -> Value {
    serde_json::from_str(&runtime.create(&input.to_string())).unwrap()
}

#[test]
fn cold_creation_uses_real_fonts_and_disposes_only_the_authentic_live_receipt() {
    let mut runtime = Runtime::default();
    let result = create(&mut runtime, &fixture("กA"));
    assert_eq!(result["status"], "Created", "{result}");
    assert_eq!(result["revision"], 0);
    assert_eq!(runtime.live_count(), 1);
    assert_eq!(runtime.dispose("forged")["status"], "UnknownReceipt");
    assert_eq!(runtime.live_count(), 1);
    let receipt = result["receipt"].as_str().unwrap();
    assert_eq!(runtime.dispose(receipt)["status"], "Disposed");
    assert_eq!(runtime.live_count(), 0);
    assert_eq!(runtime.dispose(receipt)["status"], "UnknownReceipt");
}

#[test]
fn rejects_fact_shaped_configuration_and_unsupported_script_before_publication() {
    let mut runtime = Runtime::default();
    let mut input = fixture("A");
    input["providerContext"]["runs"] = json!([]);
    assert_eq!(create(&mut runtime, &input)["reason"], "invalid-input");
    assert_eq!(
        create(&mut runtime, &fixture("אA"))["reason"],
        "unsupported-font-script"
    );
    assert_eq!(runtime.live_count(), 0);
}

#[test]
fn rejects_reordered_overlapping_missing_and_tampered_policies() {
    let mut runtime = Runtime::default();
    for kind in ["reorder", "overlap", "missing", "tamper"] {
        let mut input = fixture("กA");
        let rows = input["providerContext"]["policy"]["languageRules"]
            .as_array_mut()
            .unwrap();
        match kind {
            "reorder" => rows.reverse(),
            "overlap" => rows.insert(1, rows[0].clone()),
            "missing" => {
                rows.remove(1);
            }
            _ => rows[0]["language"] = json!("th"),
        }
        if kind != "tamper" {
            input["providerContext"]["policyDigest"] =
                json!(digest(&input["providerContext"]["policy"]));
        }
        assert_eq!(
            create(&mut runtime, &input)["status"],
            "NotCreated",
            "{kind}"
        );
        assert_eq!(runtime.live_count(), 0);
    }
}

#[test]
fn stored_trees_preserve_exact_source_properties_and_real_provider_facts() {
    for text in ["AB", "office", "กA", "ก่A"] {
        let mut runtime = Runtime::default();
        let reply = create(&mut runtime, &fixture(text));
        assert_eq!(reply["status"], "Created", "{reply}");
        let session = runtime.session(reply["receipt"].as_str().unwrap());
        assert_eq!(session.source, text);
        assert_eq!(session.paragraph.paragraph_id, "paragraph-stage3");
        let mut span_count = 0;
        session.spans.visit(|s| {
            span_count += 1;
            assert_eq!(s.span_id, "span-1");
            assert_eq!(s.language.as_deref(), Some("und"));
            assert_eq!(s.style_key.as_deref(), Some("body"));
            assert_eq!(s.end_offset, text.encode_utf16().count());
        });
        assert_eq!(span_count, 1);
        let mut expected_glyphs = Vec::new();
        session.runs.visit(|run| {
            let slice = &session.source[run.start_byte..run.end_byte];
            let raw: Value = serde_json::from_str(
                &crate::flowdoc_text_engine_shape_range_json(
                    &session.provider.fonts[run.resource_index].bytes,
                    slice,
                    "qa-font",
                    "memory",
                    "independent-provider-oracle",
                    0,
                    slice.len(),
                    0,
                    slice.len(),
                )
                .unwrap(),
            )
            .unwrap();
            for glyph in raw["glyphs"].as_array().unwrap() {
                let mut glyph = glyph.clone();
                glyph.as_object_mut().unwrap().remove("index");
                glyph["cluster"] = json!(
                    run.start
                        + slice[..glyph["cluster"].as_u64().unwrap() as usize]
                            .encode_utf16()
                            .count()
                );
                expected_glyphs.push(glyph);
            }
        });
        let mut actual_glyphs = Vec::new();
        let mut actual_breaks: Vec<usize> = Vec::new();
        session.shards.visit(|s| {
            actual_glyphs.extend(s.glyphs.iter().map(|g| serde_json::to_value(g).unwrap()));
            actual_breaks.extend(s.line_breaks.iter().copied());
        });
        assert_eq!(actual_glyphs, expected_glyphs, "{text}");
        let raw_breaks: Value = serde_json::from_str(
            &crate::flowdoc_text_engine_segment_json(text, "independent-provider-oracle").unwrap(),
        )
        .unwrap();
        let expected_breaks = raw_breaks["breakByteOffsets"]
            .as_array()
            .unwrap()
            .iter()
            .map(|b| text[..b.as_u64().unwrap() as usize].encode_utf16().count())
            .collect::<Vec<_>>();
        assert_eq!(actual_breaks, expected_breaks);
    }
}

#[test]
fn large_cold_construction_preserves_every_glyph_and_bounds_shards_without_reshaping() {
    let text = "office ".repeat(180);
    let mut runtime = Runtime::default();
    let reply = create(&mut runtime, &fixture(&text));
    assert_eq!(reply["status"], "Created", "{reply}");
    let session = runtime.session(reply["receipt"].as_str().unwrap());
    let mut end = 0;
    let mut glyphs = 0;
    session.shards.visit(|s| {
        assert_eq!(s.start_offset, end);
        assert!(s.end_offset - s.start_offset <= 512);
        assert!(!s.glyphs[0].unsafe_to_break);
        glyphs += s.glyphs.len();
        end = s.end_offset;
    });
    assert_eq!(end, text.len());
    assert!(glyphs > 0);
    assert_eq!(reply["coldSummary"]["work"]["shardBoundaryVisits"], glyphs);
    assert!(
        reply["coldSummary"]["work"]["shardFactVisits"]
            .as_u64()
            .unwrap()
            >= glyphs as u64
    );
    assert!(
        reply["coldSummary"]["work"]["offsetLookupComparisons"]
            .as_u64()
            .unwrap()
            > 0
    );
    assert!(
        reply["coldSummary"]["work"]["boundaryLookupComparisons"]
            .as_u64()
            .unwrap()
            < 30 * text.len() as u64
    );
    assert_eq!(reply["coldSummary"]["work"]["shapingCalls"], 1);
    assert_eq!(
        reply["coldSummary"]["work"]["shapingInputUtf16"],
        text.len()
    );
    assert!(session.shards.height <= (session.shards.len + 1).ilog2() as usize + 1);
}

#[test]
fn many_spans_charge_duplicate_searches_and_preserve_each_authored_identity() {
    let mut input = fixture("A");
    input["authoredSpans"] = Value::Array(
        (0..100)
            .map(|i| {
                json!({
                    "spanId":format!("span-{i}"), "startOffset":i, "endOffset":i+1,
                    "text":"A", "language":"und", "styleKey":"body"
                })
            })
            .collect(),
    );
    let mut runtime = Runtime::default();
    let result = create(&mut runtime, &input);
    assert_eq!(result["status"], "Created");
    assert_eq!(result["coldSummary"]["spans"], 100);
    assert_eq!(result["coldSummary"]["runs"], 1);
    assert!(
        result["coldSummary"]["work"]["validationComparisons"]
            .as_u64()
            .unwrap()
            >= 4950
    );
    assert!(
        result["coldSummary"]["work"]["receiptHashBytes"]
            .as_u64()
            .unwrap()
            > 32
    );
    let s = runtime.session(result["receipt"].as_str().unwrap());
    assert_eq!(s.source, "A".repeat(100));
    assert_eq!(s.revision, 0);
    let mut ids = Vec::new();
    s.spans.visit(|s| ids.push(s.span_id.clone()));
    assert_eq!(
        ids,
        (0..100).map(|i| format!("span-{i}")).collect::<Vec<_>>()
    );
}

#[test]
fn omitted_language_resolves_but_explicit_null_is_not_canonical_input() {
    let mut runtime = Runtime::default();
    let mut input = fixture("A");
    input["authoredSpans"][0]
        .as_object_mut()
        .unwrap()
        .remove("language");
    assert_eq!(create(&mut runtime, &input)["status"], "Created");
    input["authoredSpans"][0]["language"] = Value::Null;
    assert_eq!(create(&mut runtime, &input)["reason"], "invalid-input");
    assert_eq!(runtime.live_count(), 1);
}

#[test]
fn independent_sessions_with_identical_public_input_have_different_receipts_and_isolated_disposal()
{
    let mut a = Runtime::default();
    let mut b = Runtime::default();
    let first = create(&mut a, &fixture("AB"));
    let second = create(&mut b, &fixture("AB"));
    let x = first["receipt"].as_str().unwrap();
    let y = second["receipt"].as_str().unwrap();
    assert_ne!(x, y);
    assert_eq!(b.dispose(x)["status"], "UnknownReceipt");
    assert_eq!(a.dispose(x)["status"], "Disposed");
    assert_eq!(b.live_count(), 1);
    assert_eq!(b.dispose(y)["status"], "Disposed");
}

#[test]
fn rejects_invalid_ranges_unsafe_authored_graphemes_and_unsupported_fonts() {
    let mut runtime = Runtime::default();
    let mut bad_range = fixture("AB");
    bad_range["authoredSpans"][0]["endOffset"] = json!(1);
    assert_eq!(
        create(&mut runtime, &bad_range)["reason"],
        "invalid-authored-spans"
    );
    let mut split = fixture("ก่");
    split["authoredSpans"] = json!([
        {"spanId":"a", "startOffset":0, "endOffset":1, "text":"ก", "language":"und", "styleKey":"body"},
        {"spanId":"b", "startOffset":1, "endOffset":2, "text":"่", "language":"und", "styleKey":"body"}
    ]);
    assert_eq!(
        create(&mut runtime, &split)["reason"],
        "unsafe-authored-boundary"
    );
    let mut font = fixture("AB");
    font["providerContext"]["fonts"][0]["bytes"][0] = json!(123);
    assert_eq!(
        create(&mut runtime, &font)["reason"],
        "font-digest-mismatch"
    );
    assert_eq!(runtime.live_count(), 0);
}

#[test]
fn unknown_fields_at_every_configuration_level_fail_closed() {
    for location in [
        "input",
        "provider",
        "policy",
        "font",
        "language",
        "route",
        "feature",
        "paragraph",
        "span",
    ] {
        let mut input = fixture("AB");
        let obj = match location {
            "input" => &mut input,
            "provider" => &mut input["providerContext"],
            "policy" => &mut input["providerContext"]["policy"],
            "font" => &mut input["providerContext"]["fonts"][0],
            "language" => &mut input["providerContext"]["policy"]["languageRules"][0],
            "route" => &mut input["providerContext"]["policy"]["fontRouteRules"][0],
            "feature" => &mut input["providerContext"]["policy"]["featureRules"][0],
            "paragraph" => &mut input["paragraphContext"],
            _ => &mut input["authoredSpans"][0],
        };
        obj["rawFacts"] = json!([]);
        let mut runtime = Runtime::default();
        assert_eq!(
            create(&mut runtime, &input)["reason"],
            "invalid-input",
            "{location}"
        );
        assert_eq!(runtime.live_count(), 0);
    }
}
