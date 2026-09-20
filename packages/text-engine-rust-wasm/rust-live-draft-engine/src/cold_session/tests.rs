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
fn append_retains_exact_rust_owned_source_descriptors_and_facts() {
    let mut runtime = Runtime::default();
    let created = create(&mut runtime, &fixture("AB"));
    let receipt = created["receipt"].as_str().unwrap();
    let accepted: Value = serde_json::from_str(
        &runtime.apply(
            &json!({
                "receipt": receipt, "expectedRevision": 0, "startOffset": 2, "endOffset": 2,
                "replacementText": "C", "composition": "committed", "anchorSpanId": "span-1"
            })
            .to_string(),
        ),
    )
    .unwrap();
    let next = accepted["nextReceipt"].as_str().unwrap();
    let session = runtime.session(next);
    assert_eq!(session.source.tail_from(0), "ABC");
    assert_eq!(session.revision, 1);
    assert_eq!(session.spans.last().unwrap().end_offset, 3);
    assert_eq!(session.runs.last().unwrap().end, 3);
    assert_eq!(session.shards.last().unwrap().end_offset, 3);
    assert!(!session.shards.last().unwrap().glyphs.is_empty());
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
fn tail_deletion_exact_full_provider_oracle() {
    for (text, start, expected) in [
        ("AB", 1, "A"),
        ("กข", 1, "ก"),
        ("Aก", 1, "A"),
        ("Aก่", 1, "A"),
    ] {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture(text));
        let reply:Value=serde_json::from_str(&rt.apply(&json!({"receipt":c["receipt"],"expectedRevision":0,"startOffset":start,"endOffset":text.encode_utf16().count(),"replacementText":"","composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
        assert_eq!(reply["status"], "Accepted", "{reply}");
        let mut oracle = Runtime::default();
        let o = create(&mut oracle, &fixture(expected));
        assert_eq!(
            retained_observable(rt.session(reply["nextReceipt"].as_str().unwrap())),
            retained_observable(oracle.session(o["receipt"].as_str().unwrap())),
            "{text}"
        );
    }
}

#[test]
fn mixed_run_middle_matches_full_oracle_and_shares_untouched_suffix() {
    use std::sync::Arc;
    let text = format!("{}AB{}", "ก".repeat(300), "ข".repeat(300));
    let expected = format!("{}ACB{}", "ก".repeat(300), "ข".repeat(300));
    let mut rt = Runtime::default();
    let c = create(&mut rt, &fixture(&text));
    let receipt = c["receipt"].as_str().unwrap();
    let count = rt.session(receipt).shards.len;
    let suffix = rt.session(receipt).shards.payload(count - 1);
    let reply:Value=serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,"startOffset":301,"endOffset":301,"replacementText":"C","composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
    assert_eq!(reply["status"], "Accepted", "{reply}");
    let next = rt.session(reply["nextReceipt"].as_str().unwrap());
    let mut oracle = Runtime::default();
    let o = create(&mut oracle, &fixture(&expected));
    assert_eq!(
        retained_observable(next),
        retained_observable(oracle.session(o["receipt"].as_str().unwrap()))
    );
    assert!(Arc::ptr_eq(&suffix, &next.shards.payload(count - 1)));
    eprintln!(
        "mixed middle counters: {}",
        reply["affectedSummary"]["work"]
    );
}

fn retained_observable(session: &runtime::Session) -> Value {
    let mut spans = Vec::new();
    session
        .spans
        .visit(|s| spans.push(serde_json::to_value(s).unwrap()));
    let mut runs = Vec::new();
    session.runs.visit(|r|runs.push(json!({"start":r.start,"end":r.end,"startByte":r.start_byte,"endByte":r.end_byte,"key":r.key,"spanIndexes":r.span_indexes})));
    let mut glyphs = Vec::new();
    let mut lines: Vec<usize> = Vec::new();
    let mut graphemes: Vec<usize> = Vec::new();
    session.shards.visit(|s| {
        glyphs.extend(s.glyphs.iter().map(|g| serde_json::to_value(g).unwrap()));
        lines.extend(&s.line_breaks);
        graphemes.extend(&s.grapheme_boundaries);
    });
    lines.sort_unstable();
    lines.dedup();
    graphemes.sort_unstable();
    graphemes.dedup();
    json!({"source":session.source.tail_from(0),"spans":spans,"runs":runs,"glyphs":glyphs,"lines":lines,"graphemes":graphemes})
}

#[test]
fn bounded_replacements_and_deletions_match_full_provider_oracle() {
    for (text, start, end, replacement, expected) in [
        ("ABCDE", 1, 3, "XY", "AXYDE"),
        ("กขคง", 1, 2, "จ", "กจคง"),
        ("AกขคB", 2, 3, "ง", "AกงคB"),
        ("office", 1, 3, "xx", "oxxice"),
        ("ABCDE", 1, 2, "", "ACDE"),
        ("ABCDE", 2, 3, "", "ABDE"),
        ("กขคง", 1, 2, "", "กคง"),
        ("AกขคB", 2, 3, "", "AกคB"),
    ] {
        let mut rt = Runtime::default();
        let created = create(&mut rt, &fixture(text));
        let reply: Value = serde_json::from_str(
            &rt.apply(
                &json!({
                    "receipt": created["receipt"], "expectedRevision": 0,
                    "startOffset": start, "endOffset": end, "replacementText": replacement,
                    "composition": "committed", "anchorSpanId": "span-1"
                })
                .to_string(),
            ),
        )
        .unwrap();
        assert_eq!(reply["status"], "Accepted", "{text}: {reply}");
        let mut oracle = Runtime::default();
        let expected_session = create(&mut oracle, &fixture(expected));
        assert_eq!(
            retained_observable(rt.session(reply["nextReceipt"].as_str().unwrap())),
            retained_observable(oracle.session(expected_session["receipt"].as_str().unwrap())),
            "{text}"
        );
        assert_eq!(rt.live_count(), 1);
        assert_eq!(reply["nextRevision"], 1);
    }
}

#[test]
fn replacement_rejections_preserve_exact_retained_state() {
    for (text, start, end, replacement, revision, anchor, forged, reason) in [
        ("ก่ข", 1, 2, "ค", 0, "span-1", false, "uncertified-boundary"),
        ("AกขB", 1, 2, "่", 0, "span-1", false, "uncertified-boundary"),
        ("ABC", 1, 2, "ก", 0, "span-1", false, "uncertified-seam"),
        ("AกB", 1, 2, "", 0, "span-1", false, "uncertified-seam"),
        (
            "ABC",
            0,
            3,
            "",
            0,
            "span-1",
            false,
            "unsupported-command-shape",
        ),
        ("ABC", 1, 2, "X", 1, "span-1", false, "stale-revision"),
        ("ABC", 1, 2, "X", 0, "wrong", false, "ambiguous-anchor"),
        ("ABC", 1, 2, "X", 0, "span-1", true, "unknown-receipt"),
    ] {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture(text));
        let receipt = c["receipt"].as_str().unwrap();
        let before = retained_observable(rt.session(receipt));
        let binding = rt.session(receipt).source_binding.clone();
        let reply: Value = serde_json::from_str(&rt.apply(&json!({ "receipt": if forged {"forged"} else {receipt}, "expectedRevision": revision,
            "startOffset": start, "endOffset": end, "replacementText": replacement, "composition": "committed", "anchorSpanId": anchor }).to_string())).unwrap();
        assert_eq!(reply["reason"], reason, "{reply}");
        assert_eq!(before, retained_observable(rt.session(receipt)));
        assert_eq!(rt.session(receipt).source_binding, binding);
        assert_eq!(rt.session(receipt).revision, 0);
        assert_eq!(rt.live_count(), 1);
    }
}

#[test]
fn range_edit_long_suffix_matches_oracle_and_retains_payload_identity() {
    use std::sync::Arc;
    for (replacement, expected_middle) in [("XY", "AXYDE"), ("", "ADE")] {
        let text = format!("{}ABCDE{}", "ก".repeat(300), "ข".repeat(300));
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture(&text));
        let receipt = c["receipt"].as_str().unwrap();
        let count = rt.session(receipt).shards.len;
        let suffix = rt.session(receipt).shards.payload(count - 1);
        let result: Value = serde_json::from_str(&rt.apply(&json!({"receipt": receipt, "expectedRevision":0,
            "startOffset":301,"endOffset":303,"replacementText":replacement,"composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
        assert_eq!(result["status"], "Accepted", "{result}");
        let next = rt.session(result["nextReceipt"].as_str().unwrap());
        let mut oracle = Runtime::default();
        let expected = create(
            &mut oracle,
            &fixture(&format!(
                "{}{}{}",
                "ก".repeat(300),
                expected_middle,
                "ข".repeat(300)
            )),
        );
        assert_eq!(
            retained_observable(next),
            retained_observable(oracle.session(expected["receipt"].as_str().unwrap()))
        );
        assert!(Arc::ptr_eq(&suffix, &next.shards.payload(count - 1)));
    }
}

#[test]
fn budget_and_malformed_scalar_rejections_preserve_exact_state() {
    for (text, malformed) in [("A".repeat(80), false), ("ABC".to_owned(), true)] {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture(&text));
        let receipt = c["receipt"].as_str().unwrap();
        let before = retained_observable(rt.session(receipt));
        let command = json!({"receipt":receipt,"expectedRevision":0,"startOffset":1,"endOffset":2,
            "replacementText":"X","composition":"committed","anchorSpanId":"span-1"})
        .to_string();
        let wire = if malformed {
            command.replace(r#""X""#, r#""\ud800""#)
        } else {
            command
        };
        let result: Value = serde_json::from_str(&rt.apply(&wire)).unwrap();
        assert_eq!(
            result["reason"],
            if malformed {
                "invalid-command"
            } else {
                "budget-exhaustion"
            }
        );
        assert_eq!(before, retained_observable(rt.session(receipt)));
        assert_eq!(rt.session(receipt).revision, 0);
        assert_eq!(rt.live_count(), 1);
    }
}

#[test]
fn partial_run_range_preserves_exact_state_without_adjacent_line_certificate() {
    let mut rt = Runtime::default();
    let c = create(&mut rt, &fixture(&"ก".repeat(150)));
    let receipt = c["receipt"].as_str().unwrap();
    let before = retained_observable(rt.session(receipt));
    let result: Value = serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,
        "startOffset":148,"endOffset":149,"replacementText":"ข","composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
    assert_eq!(result["reason"], "uncertified-seam");
    assert_eq!(result["unchangedReceipt"], receipt);
    assert_eq!(result["unchangedRevision"], 0);
    assert_eq!(result["affectedSummary"]["work"]["shapingCalls"], 0);
    assert_eq!(before, retained_observable(rt.session(receipt)));
    assert_eq!(rt.live_count(), 1);
}
#[test]
fn repeated_middle_publications_preserve_exact_offsets_and_suffix_identity() {
    use std::sync::Arc;
    let mut text = format!("{}AB{}", "ก".repeat(300), "ข".repeat(300));
    let mut rt = Runtime::default();
    let c = create(&mut rt, &fixture(&text));
    let mut receipt = c["receipt"].as_str().unwrap().to_owned();
    let count = rt.session(&receipt).shards.len;
    let suffix = rt.session(&receipt).shards.payload(count - 1);
    for revision in 0..10 {
        let reply:Value=serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":revision,"startOffset":301,"endOffset":301,"replacementText":"C","composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
        assert_eq!(reply["status"], "Accepted", "{reply}");
        text.insert(901, 'C');
        receipt = reply["nextReceipt"].as_str().unwrap().to_owned();
        let next = rt.session(&receipt);
        let mut oracle = Runtime::default();
        let o = create(&mut oracle, &fixture(&text));
        assert_eq!(
            retained_observable(next),
            retained_observable(oracle.session(o["receipt"].as_str().unwrap()))
        );
        assert!(Arc::ptr_eq(&suffix, &next.shards.payload(count - 1)));
        assert_eq!(next.revision, revision + 1);
        assert_eq!(rt.live_count(), 1);
    }
}
#[test]
fn append_exact_full_provider_oracle_including_all_positions_and_facts() {
    for text in ["AB".to_string(), format!("{}AB", "ก".repeat(598))] {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture(&text));
        let reply:Value=serde_json::from_str(&rt.apply(&json!({"receipt":c["receipt"],"expectedRevision":0,"startOffset":text.encode_utf16().count(),"endOffset":text.encode_utf16().count(),"replacementText":"B","composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
        assert_eq!(reply["status"], "Accepted", "{reply}");
        let mut oracle = Runtime::default();
        let o = create(&mut oracle, &fixture(&format!("{text}B")));
        assert_eq!(
            retained_observable(rt.session(reply["nextReceipt"].as_str().unwrap())),
            retained_observable(oracle.session(o["receipt"].as_str().unwrap()))
        );
    }
}
#[test]
fn middle_source_and_position_tree_share_suffix_payloads() {
    use super::{position::Delta, tree::TreeWork};
    use std::sync::Arc;
    let mut rt = Runtime::default();
    let c = create(&mut rt, &fixture(&"A".repeat(600)));
    let s = rt.session(c["receipt"].as_str().unwrap());
    let old_suffix = s.shards.payload(4);
    let mut work = TreeWork::default();
    let source = s.source.replace(300, 300, "B", &mut work).unwrap();
    assert_eq!(
        source.tail_from(0),
        format!("{}B{}", "A".repeat(300), "A".repeat(300))
    );
    assert_eq!(s.source.tail_from(0), "A".repeat(600));
    let located = s.shards.containing(300, &mut work).unwrap();
    let mut changed = located.materialize(&mut work);
    changed.end_offset += 1;
    let candidate = s.shards.replace_and_shift(
        located.index,
        changed,
        Delta { units: 1, bytes: 1 },
        &mut work,
    );
    assert!(Arc::ptr_eq(&old_suffix, &candidate.payload(4)));
    assert_eq!(candidate.last().unwrap().end_offset, 601);
    assert_eq!(s.shards.last().unwrap().end_offset, 600);
    assert!(work.copies > 0 && work.copies < 20);
}
#[test]
fn middle_missing_concat_certificate_preserves_exact_state() {
    let mut rt = Runtime::default();
    let c = create(&mut rt, &fixture(&"A".repeat(600)));
    let receipt = c["receipt"].as_str().unwrap();
    let before = retained_observable(rt.session(receipt));
    let reply:Value=serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,"startOffset":300,"endOffset":300,"replacementText":"B","composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
    assert_eq!(reply["reason"], "uncertified-seam", "{reply}");
    assert_eq!(before, retained_observable(rt.session(receipt)));
    assert_eq!(rt.session(receipt).revision, 0);
    assert_eq!(rt.live_count(), 1);
}

#[test]
fn middle_provider_concat_boundary_diagnostic() {
    let mut runtime = Runtime::default();
    let created = create(&mut runtime, &fixture(&"A".repeat(600)));
    let session = runtime.session(created["receipt"].as_str().unwrap());
    let mut safe = Vec::new();
    let mut total = 0;
    session.shards.visit(|shard| {
        for (g, unsafe_concat) in shard.glyphs.iter().zip(&shard.concat_unsafe) {
            total += 1;
            if !unsafe_concat {
                safe.push(g.cluster)
            }
        }
    });
    eprintln!("provider concat flags: total={total}, safe={safe:?}");
    assert_eq!(total, 600);
    assert!(safe.is_empty());
}

#[test]
fn stored_trees_preserve_exact_source_properties_and_real_provider_facts() {
    for text in ["AB", "office", "กA", "ก่A"] {
        let mut runtime = Runtime::default();
        let reply = create(&mut runtime, &fixture(text));
        assert_eq!(reply["status"], "Created", "{reply}");
        let session = runtime.session(reply["receipt"].as_str().unwrap());
        assert_eq!(session.source.tail_from(0), text);
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
            let retained_source = session.source.tail_from(0);
            let slice = &retained_source[run.start_byte..run.end_byte];
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
    assert_eq!(s.source.tail_from(0), "A".repeat(100));
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
