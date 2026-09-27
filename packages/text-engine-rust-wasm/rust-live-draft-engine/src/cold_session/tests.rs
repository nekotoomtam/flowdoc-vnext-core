use super::*;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

fn digest(value: &Value) -> String {
    format!(
        "sha256:{:x}",
        Sha256::digest(serde_json::to_vec(value).unwrap())
    )
}

pub(super) fn fixture(text: &str) -> Value {
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

pub(super) fn create(runtime: &mut Runtime, input: &Value) -> Value {
    serde_json::from_str(&runtime.create(&input.to_string())).unwrap()
}

pub(super) fn span_fixture(texts: &[&str]) -> Value {
    let mut input = fixture(&texts.concat());
    let mut offset = 0;
    input["authoredSpans"] = Value::Array(
        texts
            .iter()
            .enumerate()
            .map(|(i, text)| {
                let start = offset;
                offset += text.encode_utf16().count();
                json!({"spanId":format!("span-{i}"),"startOffset":start,"endOffset":offset,
            "text":text,"language":"und","styleKey":"body"})
            })
            .collect(),
    );
    input
}

#[test]
fn command_admission_does_not_copy_unbounded_same_key_span_membership() {
    let mut counts = Vec::new();
    for count in [600, 6000] {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &span_fixture(&vec!["A"; count]));
        assert_eq!(c["status"], "Created", "{c}");
        let receipt = c["receipt"].as_str().unwrap();
        let before = retained_observable(rt.session(receipt));
        let r: Value = serde_json::from_str(
            &rt.apply(
                &json!({"receipt":receipt,"expectedRevision":0,
            "startOffset":count,"endOffset":count,"replacementText":"B","composition":"committed",
            "anchorSpanId":format!("span-{}",count-1)})
                .to_string(),
            ),
        )
        .unwrap();
        assert_eq!(r["status"], "NotAdmissible", "{r}");
        assert_eq!(before, retained_observable(rt.session(receipt)));
        counts.push(
            r["affectedSummary"]["work"]["payloadElementsCopied"]
                .as_u64()
                .unwrap(),
        );
    }
    assert!(
        counts[1] <= counts[0] + 1024,
        "run membership copied before bounded admission: {counts:?}"
    );
    assert!(
        counts.iter().all(|c| *c < 1024),
        "unbounded payload copies: {counts:?}"
    );
    eprintln!("shared same-key membership payload copy counts: {counts:?}");
}

#[test]
fn authored_edge_commands_match_exact_cold_oracle_and_preserve_membership() {
    for (texts, start, end, replacement, anchor, expected) in [
        (["AB", "CD"], 2, 2, "X", "span-0", ["ABX", "CD"]),
        (["AB", "CD"], 2, 2, "X", "span-1", ["AB", "XCD"]),
        (["กข", "คง"], 2, 2, "จ", "span-0", ["กขจ", "คง"]),
        (["กข", "คง"], 2, 2, "จ", "span-1", ["กข", "จคง"]),
        (["AB", "CD"], 1, 3, "", "span-0", ["A", "D"]),
        (["กข", "คง"], 1, 3, "", "span-0", ["ก", "ง"]),
    ] {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &span_fixture(&texts));
        assert_eq!(c["status"], "Created", "{c}");
        let receipt = c["receipt"].as_str().unwrap();
        let membership = rt.session(receipt).runs.payload(0).span_indexes.clone();
        let r: Value = serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,
            "startOffset":start,"endOffset":end,"replacementText":replacement,"composition":"committed",
            "anchorSpanId":anchor}).to_string())).unwrap();
        assert_eq!(r["status"], "Accepted", "{texts:?}/{anchor}: {r}");
        let next = rt.session(r["nextReceipt"].as_str().unwrap());
        let mut oracle = Runtime::default();
        let cold = create(&mut oracle, &span_fixture(&expected));
        assert_eq!(cold["status"], "Created", "{cold}");
        assert_eq!(
            retained_observable(next),
            retained_observable(oracle.session(cold["receipt"].as_str().unwrap()))
        );
        assert!(std::sync::Arc::ptr_eq(
            &membership,
            &next.runs.payload(0).span_indexes
        ));
        let w = &r["affectedSummary"]["work"];
        assert!(w["sourceFactsUtf16"].as_u64().unwrap() <= 512);
        assert!(w["propertyFactsUtf16"].as_u64().unwrap() <= 512);
        assert!(w["shapingSegmentationInputUtf16"].as_u64().unwrap() <= 1024);
    }
}

#[test]
fn authored_edge_rejections_preserve_exact_state_and_authentic_receipt() {
    for (texts, start, end, replacement, anchor, reason) in [
        (vec!["AB", "CD"], 2, 2, "X", "", "missing-anchor"),
        (
            vec!["AB", "CD", "EF"],
            2,
            2,
            "X",
            "span-2",
            "ambiguous-anchor",
        ),
        (vec!["AB", "CD"], 2, 2, "X", "forged-id", "ambiguous-anchor"),
        (vec!["ก่ข", "คง"], 1, 4, "", "span-0", "uncertified-boundary"),
        (vec!["กข", "คง"], 2, 2, "่", "span-1", "uncertified-boundary"),
        (
            vec!["AB", "กข"],
            2,
            2,
            "X",
            "span-0",
            "uncertified-boundary",
        ),
        (vec!["AB", "CD"], 2, 2, "ก", "span-0", "uncertified-seam"),
        (
            vec!["AB", "CD"],
            1,
            3,
            "X",
            "span-0",
            "unsupported-command-shape",
        ),
        (
            vec!["AB", "CD"],
            0,
            3,
            "",
            "span-0",
            "unsupported-command-shape",
        ),
        (
            vec!["AB", "CD"],
            1,
            4,
            "",
            "span-0",
            "unsupported-command-shape",
        ),
        (
            vec!["AB", "CD", "EF"],
            1,
            5,
            "",
            "span-0",
            "unsupported-command-shape",
        ),
        (
            vec![
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            ],
            40,
            40,
            "C",
            "span-0",
            "budget-exhaustion",
        ),
    ] {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &span_fixture(&texts));
        assert_eq!(c["status"], "Created", "{c}");
        let receipt = c["receipt"].as_str().unwrap();
        let before = retained_observable(rt.session(receipt));
        let source = rt.session(receipt).source.clone();
        let shard = rt.session(receipt).shards.payload(0);
        let binding = rt.session(receipt).source_binding.clone();
        let r: Value = serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,
            "startOffset":start,"endOffset":end,"replacementText":replacement,"composition":"committed",
            "anchorSpanId":anchor}).to_string())).unwrap();
        assert_eq!(r["reason"], reason, "{texts:?}: {r}");
        assert_eq!(r["unchangedReceipt"], receipt);
        assert_eq!(r["unchangedRevision"], 0);
        let same = rt.session(receipt);
        assert_eq!(before, retained_observable(same));
        assert_eq!(same.source_binding, binding);
        assert!(std::sync::Arc::ptr_eq(&source, &same.source));
        assert!(std::sync::Arc::ptr_eq(&shard, &same.shards.payload(0)));
        assert_eq!(rt.live_count(), 1);
    }
}

#[test]
fn authored_edge_authentication_failure_retains_exact_state() {
    for forged in [false, true] {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &span_fixture(&["AB", "CD"]));
        let receipt = c["receipt"].as_str().unwrap();
        let before = retained_observable(rt.session(receipt));
        let binding = rt.session(receipt).source_binding.clone();
        let result: Value = serde_json::from_str(
            &rt.apply(
                &json!({"receipt":if forged {"forged"} else {receipt},
            "expectedRevision":if forged {0} else {1}, "startOffset":2,"endOffset":2,
            "replacementText":"X","composition":"committed","anchorSpanId":"span-0"})
                .to_string(),
            ),
        )
        .unwrap();
        assert_eq!(
            result["reason"],
            if forged {
                "unknown-receipt"
            } else {
                "stale-revision"
            }
        );
        assert_eq!(before, retained_observable(rt.session(receipt)));
        assert_eq!(binding, rt.session(receipt).source_binding);
        assert_eq!(rt.session(receipt).revision, 0);
        assert_eq!(rt.live_count(), 1);
    }
}

#[test]
fn authored_edge_does_not_certify_thai_context_across_a_style_run_edge() {
    for (style_index, offset, anchor, expected_texts, expected_lines) in [
        (2, 1, "span-0", ["ภข", "า", "ษาไทย"], vec![0, 1, 5, 8]),
        (0, 2, "span-1", ["ภ", "าข", "ษาไทย"], vec![0, 5, 8]),
    ] {
        let mut input = span_fixture(&["ภ", "า", "ษาไทย"]);
        input["authoredSpans"][style_index]["styleKey"] = json!("zbody");
        let policy = &mut input["providerContext"]["policy"];
        for field in ["fontRouteRules", "featureRules"] {
            let rows = policy[field].as_array_mut().unwrap();
            let mut extras = rows.clone();
            for row in &mut extras {
                row["styleKey"] = json!("zbody");
            }
            rows.extend(extras);
        }
        input["providerContext"]["policyDigest"] =
            json!(digest(&input["providerContext"]["policy"]));
        let mut rt = Runtime::default();
        let created = create(&mut rt, &input);
        assert_eq!(created["status"], "Created", "{created}");
        let receipt = created["receipt"].as_str().unwrap();
        let before = retained_observable(rt.session(receipt));
        assert_eq!(before["lines"], json!([0, 4, 7]));
        let mut expected = input.clone();
        expected["authoredSpans"] = span_fixture(&expected_texts)["authoredSpans"].clone();
        expected["authoredSpans"][style_index]["styleKey"] = json!("zbody");
        let mut oracle = Runtime::default();
        let cold = create(&mut oracle, &expected);
        assert_eq!(cold["status"], "Created", "{cold}");
        assert_eq!(
            retained_observable(oracle.session(cold["receipt"].as_str().unwrap()))["lines"],
            json!(expected_lines)
        );
        let result: Value = serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,
        "startOffset":offset,"endOffset":offset,"replacementText":"ข","composition":"committed","anchorSpanId":anchor}).to_string())).unwrap();
        assert_eq!(result["reason"], "uncertified-seam", "{result}");
        assert_eq!(result["affectedSummary"]["work"]["shapingCalls"], 0);
        assert_eq!(result["unchangedReceipt"], receipt);
        assert_eq!(result["unchangedRevision"], 0);
        assert_eq!(before, retained_observable(rt.session(receipt)));
    }
}

#[test]
fn authored_edge_long_context_preserves_properties_and_shares_unrelated_payloads() {
    for suffix_count in [300, 3000] {
        for (start, end, replacement, expected_pair) in
            [(302, 302, "X", ["ABX", "CD"]), (301, 303, "", ["A", "D"])]
        {
            let prefix = "ก".repeat(300);
            let mut texts = vec![prefix.as_str(), "AB", "CD"];
            texts.extend(vec!["ข"; suffix_count]);
            let mut input = span_fixture(&texts);
            input["authoredSpans"][2]
                .as_object_mut()
                .unwrap()
                .remove("language");
            let mut rt = Runtime::default();
            let c = create(&mut rt, &input);
            assert_eq!(c["status"], "Created", "{c}");
            let receipt = c["receipt"].as_str().unwrap();
            let old = rt.session(receipt);
            let count = old.shards.len;
            let prefix_payload = old.shards.payload(0);
            let suffix_payload = old.shards.payload(count - 1);
            let suffix_span = old.spans.payload(old.spans.len - 1);
            let membership = old.runs.payload(1).span_indexes.clone();
            let r: Value = serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,
                "startOffset":start,"endOffset":end,"replacementText":replacement,"composition":"committed",
                "anchorSpanId":"span-1"}).to_string())).unwrap();
            assert_eq!(r["status"], "Accepted", "{r}");
            let next = rt.session(r["nextReceipt"].as_str().unwrap());
            texts[1] = expected_pair[0];
            texts[2] = expected_pair[1];
            let mut expected = span_fixture(&texts);
            expected["authoredSpans"][2]
                .as_object_mut()
                .unwrap()
                .remove("language");
            let mut oracle = Runtime::default();
            let cold = create(&mut oracle, &expected);
            assert_eq!(cold["status"], "Created", "{cold}");
            assert_eq!(
                retained_observable(next),
                retained_observable(oracle.session(cold["receipt"].as_str().unwrap()))
            );
            assert!(std::sync::Arc::ptr_eq(
                &prefix_payload,
                &next.shards.payload(0)
            ));
            assert!(std::sync::Arc::ptr_eq(
                &suffix_payload,
                &next.shards.payload(count - 1)
            ));
            assert!(std::sync::Arc::ptr_eq(
                &suffix_span,
                &next.spans.payload(next.spans.len - 1)
            ));
            assert!(std::sync::Arc::ptr_eq(
                &membership,
                &next.runs.payload(1).span_indexes
            ));
            let w = &r["affectedSummary"]["work"];
            assert_eq!(w["ownershipSpanVisits"], 2);
            assert_eq!(
                w["sourceFactsUtf16"],
                if replacement.is_empty() { 30 } else { 43 }
            );
            assert_eq!(
                w["propertyFactsUtf16"],
                if replacement.is_empty() { 6 } else { 9 }
            );
            assert_eq!(
                w["sourceCopiedUtf16"],
                if replacement.is_empty() { 10 } else { 19 }
            );
            assert_eq!(
                w["sourceCopyBytes"],
                if replacement.is_empty() { 10 } else { 19 }
            );
            assert_eq!(
                w["oldNewProviderInputUtf16"],
                if replacement.is_empty() { 18 } else { 27 }
            );
            assert!(w["treeNodeVisits"].as_u64().unwrap() < 160);
            assert!(w["treePathCopies"].as_u64().unwrap() < 80);
            assert!(w["payloadElementsCopied"].as_u64().unwrap() < 120);
            eprintln!("edge suffix={suffix_count} replacement={replacement:?}: {w}");
        }
    }
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

pub(super) fn retained_observable(session: &runtime::Session) -> Value {
    let mut spans = Vec::new();
    session
        .spans
        .visit(|s| spans.push(serde_json::to_value(s).unwrap()));
    let mut runs = Vec::new();
    session.runs.visit(|r|runs.push(json!({"start":r.start,"end":r.end,"startByte":r.start_byte,"endByte":r.end_byte,"key":r.key,"spanIndexes":r.span_indexes.as_ref()})));
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
    let source = s.source.replace(300, 300, "B", 1, &mut work).unwrap();
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
fn oversized_middle_rejects_before_concat_work_and_preserves_exact_state() {
    let mut rt = Runtime::default();
    let c = create(&mut rt, &fixture(&"A".repeat(600)));
    let receipt = c["receipt"].as_str().unwrap();
    let before = retained_observable(rt.session(receipt));
    let reply:Value=serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,"startOffset":300,"endOffset":300,"replacementText":"B","composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
    assert_eq!(reply["reason"], "budget-exhaustion", "{reply}");
    assert_eq!(reply["affectedSummary"]["work"]["shapingCalls"], 0);
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

#[test]
fn stage5_empty_enter_requires_two_real_capabilities() {
    let mut rt = Runtime::default();
    let mut input = fixture("");
    input["authoredSpans"] = json!([]);
    let created = create(&mut rt, &input);
    let output: Value = serde_json::from_str(&super::structural::apply(&mut rt, &json!({
        "operation":"enter", "receipt":created["receipt"], "expectedRevision":0,
        "caretOffset":0,"composition":"committed"
    }).to_string())).unwrap();
    assert_eq!(output["status"], "Accepted");
    assert_eq!(rt.live_count(), 2);
}

#[test]
fn cross_script_tail_append_matches_independent_cold_provider() {
    let seed: String = "ภาษาไทย กิ้ ".repeat(30).chars().take(255).collect();
    for (text, insertion) in [(format!("{seed}A"), "ก"), ("กAB".into(), "ขค"), ("Aกข".into(), "BC"), ("AB".into(), "ก"), ("กข".into(), "A"), ("A".repeat(32), "กกกกกกกก"), ("ก".repeat(32), "ABCDEFGH")] {
        let mut rt = Runtime::default();
        let created = create(&mut rt, &fixture(&text));
        let n = text.encode_utf16().count();
        let reply: Value = serde_json::from_str(&rt.apply(&json!({"receipt":created["receipt"],"expectedRevision":0,
            "startOffset":n,"endOffset":n,"replacementText":insertion,"anchorSpanId":"span-1","composition":"committed"}).to_string())).unwrap();
        assert_eq!(reply["status"], "Accepted", "{text:?} + {insertion:?}: {reply}");
        assert_eq!(reply["nextRevision"], 1);
        let check: Value = serde_json::from_str(&super::qa_compare::verify(&rt, reply["nextReceipt"].as_str().unwrap(), &fixture(&format!("{text}{insertion}")).to_string())).unwrap();
        assert_eq!(check["status"], "Equal", "{check}");
        for (field, cap) in [("sourceFactsUtf16",512),("propertyFactsUtf16",512),("shapingSegmentationInputUtf16",1024)] {
            assert!(reply["affectedSummary"]["work"][field].as_u64().unwrap() <= cap);
        }
    }
}

#[test]
fn complete_thai_tail_edits_and_latin_tail_removal_match_cold_oracle() {
    let cases = [
        ("Aกขค", 2, 2, "ง", "Aกงขค"),
        ("Aกขค", 2, 3, "ง", "Aกงค"),
        ("Aกขค", 2, 3, "", "Aกค"),
        ("Aกิ้ข", 4, 4, "ง", "Aกิ้งข"),
        ("Aกข", 2, 2, "ำ", "Aกำข"),
        ("กขค", 1, 1, "ง", "กงขค"),
        ("กขค", 1, 2, "ง", "กงค"),
        ("กAB", 1, 3, "", "ก"),
    ];
    for (text, start, end, replacement, expected) in cases {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture(text));
        let reply: Value = serde_json::from_str(&rt.apply(&json!({
            "receipt": c["receipt"], "expectedRevision": 0, "startOffset": start,
            "endOffset": end, "replacementText": replacement, "composition": "committed",
            "anchorSpanId": "span-1"
        }).to_string())).unwrap();
        assert_eq!(reply["status"], "Accepted", "{text:?} {start}..{end}: {reply}");
        let mut oracle = Runtime::default();
        let cold = create(&mut oracle, &fixture(expected));
        assert_eq!(retained_observable(rt.session(reply["nextReceipt"].as_str().unwrap())),
            retained_observable(oracle.session(cold["receipt"].as_str().unwrap())));
        for (field, cap) in [("sourceFactsUtf16", 512), ("propertyFactsUtf16", 512),
            ("shapingSegmentationInputUtf16", 1024)] {
            assert!(reply["affectedSummary"]["work"][field].as_u64().unwrap() <= cap, "{reply}");
        }
    }
    let text = format!("{}AB", "ก".repeat(300));
    let mut rt = Runtime::default();
    let c = create(&mut rt, &fixture(&text));
    let reply: Value = serde_json::from_str(&rt.apply(&json!({
        "receipt": c["receipt"], "expectedRevision": 0, "startOffset": 300,
        "endOffset": 302, "replacementText": "", "composition": "committed",
        "anchorSpanId": "span-1"
    }).to_string())).unwrap();
    assert_eq!(reply["status"], "Accepted", "reason={}", reply["reason"]);
    let mut oracle = Runtime::default();
    let cold = create(&mut oracle, &fixture(&"ก".repeat(300)));
    assert_eq!(retained_observable(rt.session(reply["nextReceipt"].as_str().unwrap())),
        retained_observable(oracle.session(cold["receipt"].as_str().unwrap())));
}

#[test]
fn thai_tail_max_envelope_after_prior_append_shares_prefix_and_rejects_atomically() {
    use std::sync::Arc;
    let mut rt=Runtime::default();
    let created=create(&mut rt,&fixture("A"));
    let first:Value=serde_json::from_str(&rt.apply(&json!({"receipt":created["receipt"],
        "expectedRevision":0,"startOffset":1,"endOffset":1,"replacementText":"ก",
        "anchorSpanId":"span-1","composition":"committed"}).to_string())).unwrap();
    assert_eq!(first["status"],"Accepted");
    let receipt=first["nextReceipt"].as_str().unwrap();
    let prefix=rt.session(receipt).shards.payload(0);
    let bad:Value=serde_json::from_str(&rt.apply(&json!({"receipt":receipt,
        "expectedRevision":1,"startOffset":1,"endOffset":1,"replacementText":"B",
        "anchorSpanId":"span-1","composition":"committed"}).to_string())).unwrap();
    assert_eq!(bad["status"],"NotAdmissible");
    assert_eq!(bad["unchangedReceipt"],receipt);
    assert_eq!(bad["unchangedRevision"],1);
    let mut current=receipt.to_owned();
    for revision in 1..=23 {
        let next:Value=serde_json::from_str(&rt.apply(&json!({"receipt":current,
            "expectedRevision":revision,"startOffset":revision+1,"endOffset":revision+1,
            "replacementText":"ก","anchorSpanId":"span-1","composition":"committed"}).to_string())).unwrap();
        assert_eq!(next["status"],"Accepted","reason={}",next["reason"]);
        current=next["nextReceipt"].as_str().unwrap().into();
    }
    let next:Value=serde_json::from_str(&rt.apply(&json!({"receipt":current,
        "expectedRevision":24,"startOffset":25,"endOffset":25,"replacementText":"ก".repeat(8),
        "anchorSpanId":"span-1","composition":"committed"}).to_string())).unwrap();
    assert_eq!(next["status"],"Accepted","reason={}",next["reason"]);
    let after=rt.session(next["nextReceipt"].as_str().unwrap());
    assert!(Arc::ptr_eq(&prefix,&after.shards.payload(0)));
    let mut oracle=Runtime::default();
    let expected=create(&mut oracle,&fixture(&format!("A{}","ก".repeat(32))));
    assert_eq!(retained_observable(after),retained_observable(oracle.session(expected["receipt"].as_str().unwrap())));
    for (field,cap) in [("sourceFactsUtf16",512),("propertyFactsUtf16",512),
        ("shapingSegmentationInputUtf16",1024)] {
        assert!(next["affectedSummary"]["work"][field].as_u64().unwrap()<=cap);
    }
}

#[test]
fn latin_tail_deletion_requires_actual_thai_consonant_neighbor() {
    for text in ["ก่A", "ก A"] {
        let mut rt=Runtime::default();
        let created=create(&mut rt,&fixture(text));
        let receipt=created["receipt"].as_str().unwrap();
        let before=retained_observable(rt.session(receipt));
        let n=text.encode_utf16().count();
        let reply:Value=serde_json::from_str(&rt.apply(&json!({"receipt":receipt,
            "expectedRevision":0,"startOffset":n-1,"endOffset":n,"replacementText":"",
            "anchorSpanId":"span-1","composition":"committed"}).to_string())).unwrap();
        assert_eq!(reply["status"],"NotAdmissible","{text}: {}",reply["reason"]);
        assert_eq!(reply["unchangedReceipt"],receipt);
        assert_eq!(reply["unchangedRevision"],0);
        assert_eq!(retained_observable(rt.session(receipt)),before);
    }
}

#[test]
fn thai_tail_certificate_rejects_leading_mark_grapheme_split_space_and_oversize() {
    let oversized="ก".repeat(200);
    for (text,start,end,replacement) in [
        ("Aกข",1,1,"่"),
        ("Aกิ้ข",2,2,"ง"),
        ("Aกข",2,2," "),
        ("Aกข",2,2,oversized.as_str()),
    ] {
        let mut rt=Runtime::default();
        let created=create(&mut rt,&fixture(text));
        let receipt=created["receipt"].as_str().unwrap();
        let before=retained_observable(rt.session(receipt));
        let reply:Value=serde_json::from_str(&rt.apply(&json!({"receipt":receipt,
            "expectedRevision":0,"startOffset":start,"endOffset":end,
            "replacementText":replacement,"anchorSpanId":"span-1","composition":"committed"}).to_string())).unwrap();
        assert_eq!(reply["status"],"NotAdmissible","{text}: {}",reply["reason"]);
        assert_eq!(reply["unchangedReceipt"],receipt);
        assert_eq!(reply["unchangedRevision"],0);
        assert_eq!(retained_observable(rt.session(receipt)),before);
    }
}

#[test]
fn tail_transition_rejections_preserve_receipt_source_and_accepted_ledger() {
    for (text, insertion) in [("A", "่"), ("Aก่", "B"), (" A", "ก"), ("กA", "กA"), ("กA", "ก่")] {
        let mut rt=Runtime::default();let c=create(&mut rt,&fixture(text));let receipt=c["receipt"].as_str().unwrap();
        let before=retained_observable(rt.session(receipt));
        let n=text.encode_utf16().count();
        let reply:Value=serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,"startOffset":n,"endOffset":n,"replacementText":insertion,"composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
        assert_eq!(reply["status"],"NotAdmissible","{reply}");assert_eq!(reply["unchangedReceipt"],receipt);assert_eq!(reply["unchangedRevision"],0);
        assert_eq!(before,retained_observable(rt.session(receipt)));
        assert!(rt.session(receipt).accepted_work.0.iter().all(|v|*v==0));
        assert_eq!(rt.session(receipt).lifecycle.borrow().rejected_attempts,1);
        for (field, cap) in [("sourceFactsUtf16",512),("propertyFactsUtf16",512),("shapingSegmentationInputUtf16",1024)] {assert!(reply["affectedSummary"]["work"][field].as_u64().unwrap()<=cap);}
    }
}

#[test]
fn repeated_opposite_script_tail_transitions_share_prefix_and_bound_tree_growth() {
    use std::sync::Arc;
    let mut text="กA".to_owned();let mut rt=Runtime::default();let c=create(&mut rt,&fixture(&text));let mut receipt=c["receipt"].as_str().unwrap().to_owned();
    let prefix=rt.session(&receipt).shards.payload(0);
    let mut totals=[0u128;super::command_work::FIELD_COUNT];
    for revision in 0..24 {
        let insertion=if revision%2==0{"ก"}else{"A"};let n=text.encode_utf16().count();
        let reply:Value=serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":revision,"startOffset":n,"endOffset":n,"replacementText":insertion,"composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
        assert_eq!(reply["status"],"Accepted","{reply}");receipt=reply["nextReceipt"].as_str().unwrap().into();text.push_str(insertion);
        let s=rt.session(&receipt);assert!(Arc::ptr_eq(&prefix,&s.shards.payload(0)));
        for tree in [s.runs.recursive_stats(),s.shards.recursive_stats(),s.source.recursive_stats()] {assert!(tree.height<=2*(tree.node_count+1).ilog2() as usize+1);}
        for(i,name)in super::command_work::FIELD_NAMES.iter().enumerate(){totals[i]+=reply["affectedSummary"]["work"][name].as_u64().unwrap() as u128;assert_eq!(s.accepted_work.0[i],totals[i]);assert_eq!(s.lifecycle.borrow().attempts.0[i],totals[i]);}
        let check:Value=serde_json::from_str(&super::qa_compare::verify(&rt,&receipt,&fixture(&text).to_string())).unwrap();assert_eq!(check["status"],"Equal","{check}");
    }
}

#[test]
fn tail_transition_after_structural_slice_preserves_defaults_origins_and_index_bases() {
    use super::tree::TreeWork;
    let mut rt=Runtime::default();let mut input=fixture("กAB");
    let defaults=json!({"version":"v1","language":"und","styleKey":"body"});
    input["paragraphContext"]["defaults"]=defaults.clone();input["paragraphContext"]["defaults"]["digest"]=json!(digest(&defaults));
    let parent=create(&mut rt,&input);
    let split:Value=serde_json::from_str(&super::structural::apply(&mut rt,&json!({"operation":"enter","receipt":parent["receipt"],"expectedRevision":0,"caretOffset":1,"composition":"committed"}).to_string())).unwrap();
    assert_eq!(split["status"],"Accepted","{split}");let right=split["receipts"][1].as_str().unwrap();
    let span=rt.session(right).spans.at(0,&mut TreeWork::default()).unwrap().materialize(&mut TreeWork::default());
    let origin=serde_json::to_value(&span.origin).unwrap();
    let reply:Value=serde_json::from_str(&rt.apply(&json!({"receipt":right,"expectedRevision":0,"startOffset":2,"endOffset":2,"replacementText":"ก","composition":"committed","anchorSpanId":span.span_id}).to_string())).unwrap();
    assert_eq!(reply["status"],"Accepted","{reply}");
    let mut expected=fixture("ABก");expected["paragraphContext"]=input["paragraphContext"].clone();
    let check:Value=serde_json::from_str(&super::qa_compare::verify(&rt,reply["nextReceipt"].as_str().unwrap(),&json!({"input":expected,"authoredOrigins":[origin]}).to_string())).unwrap();
    assert_eq!(check["status"],"Equal","{check}");
    let second:Value=serde_json::from_str(&rt.apply(&json!({"receipt":reply["nextReceipt"],"expectedRevision":1,
        "startOffset":3,"endOffset":3,"replacementText":"ข","composition":"committed","anchorSpanId":span.span_id}).to_string())).unwrap();
    assert_eq!(second["status"],"Accepted","{second}");
    let mut next_expected=fixture("ABกข");next_expected["paragraphContext"]=input["paragraphContext"].clone();
    let check:Value=serde_json::from_str(&super::qa_compare::verify(&rt,second["nextReceipt"].as_str().unwrap(),&json!({"input":next_expected,"authoredOrigins":[origin]}).to_string())).unwrap();
    assert_eq!(check["status"],"Equal","{check}");
    let join:Value=serde_json::from_str(&super::structural::apply(&mut rt,&json!({"operation":"join","receipt":split["receipts"][0],"expectedRevision":0,"rightReceipt":second["nextReceipt"],"rightRevision":2,"composition":"committed"}).to_string())).unwrap();
    assert_eq!(join["reason"],"not-unchanged-siblings");
}

#[test]
fn latin_tail_deletion_after_structural_slice_preserves_default_origin_and_inverse_guard() {
    use super::tree::TreeWork;
    let mut rt=Runtime::default();let mut input=fixture("กAB");
    let defaults=json!({"version":"v1","language":"und","styleKey":"body"});
    input["paragraphContext"]["defaults"]=defaults.clone();
    input["paragraphContext"]["defaults"]["digest"]=json!(digest(&defaults));
    let parent=create(&mut rt,&input);
    let split:Value=serde_json::from_str(&super::structural::apply(&mut rt,&json!({
        "operation":"enter","receipt":parent["receipt"],"expectedRevision":0,
        "caretOffset":0,"composition":"committed"}).to_string())).unwrap();
    assert_eq!(split["status"],"Accepted");
    let right=split["receipts"][1].as_str().unwrap();
    let span=rt.session(right).spans.at(0,&mut TreeWork::default()).unwrap().materialize(&mut TreeWork::default());
    let origin=serde_json::to_value(&span.origin).unwrap();
    let reply:Value=serde_json::from_str(&rt.apply(&json!({"receipt":right,"expectedRevision":0,
        "startOffset":1,"endOffset":3,"replacementText":"","composition":"committed",
        "anchorSpanId":span.span_id}).to_string())).unwrap();
    assert_eq!(reply["status"],"Accepted","reason={}",reply["reason"]);
    let mut expected=fixture("ก");expected["paragraphContext"]=input["paragraphContext"].clone();
    let check:Value=serde_json::from_str(&super::qa_compare::verify(&rt,reply["nextReceipt"].as_str().unwrap(),
        &json!({"input":expected,"authoredOrigins":[origin]}).to_string())).unwrap();
    assert_eq!(check["status"],"Equal","{check}");
    let join:Value=serde_json::from_str(&super::structural::apply(&mut rt,&json!({"operation":"join",
        "receipt":split["receipts"][0],"expectedRevision":0,"rightReceipt":reply["nextReceipt"],
        "rightRevision":1,"composition":"committed"}).to_string())).unwrap();
    assert_eq!(join["reason"],"not-unchanged-siblings");
}
