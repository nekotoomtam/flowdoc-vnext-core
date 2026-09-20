use super::{
    runtime::Runtime,
    tests::{create, fixture, retained_observable},
};
use serde_json::{json, Value};

#[test]
fn admitted_paths_charge_actual_source_and_provider_operations() {
    // Independently hand-counted: replacement length scan, two byte searches,
    // two provider mapping scans/window, actual property visits, source copies/index.
    for (text, start, end, replacement, scan, properties, copies, index, provider) in [
        ("AB", 2, 2, "C", 15, 1, 11, 3, 15),
        ("ABCDE", 4, 5, "", 28, 9, 17, 4, 27),
        ("ABCDE", 2, 2, "X", 29, 6, 23, 6, 33),
        ("ABCDE", 1, 3, "XY", 28, 10, 20, 5, 30),
        ("ABCDE", 1, 3, "", 22, 8, 14, 3, 24),
    ] {
        let mut rt = Runtime::default();
        let created = create(&mut rt, &fixture(text));
        let result: Value = serde_json::from_str(&rt.apply(&json!({"receipt":created["receipt"],"expectedRevision":0,
            "startOffset":start,"endOffset":end,"replacementText":replacement,"anchorSpanId":"span-1","composition":"committed"}).to_string())).unwrap();
        assert_eq!(result["status"], "Accepted", "{result}");
        let w = &result["affectedSummary"]["work"];
        assert_eq!(
            w["sourceFactsUtf16"],
            scan + properties + index + 4,
            "{text}: {w}"
        );
        assert_eq!(w["sourceScanUtf16"], scan);
        assert_eq!(w["propertyFactsUtf16"], properties);
        assert_eq!(w["sourceCopiedUtf16"], copies);
        assert_eq!(w["sourceIndexUtf16"], index);
        assert_eq!(w["shapingSegmentationInputUtf16"], provider);
        assert_eq!(w["oldNewShapingCalls"], 2);
        assert_eq!(w["tailRepairShapingCalls"], 0);
        assert_eq!(w["fontParseCalls"], 2);
        assert_eq!(w["languageParseCalls"], 2);
        assert_eq!(w["segmentationSetupCalls"], 4);
        assert_eq!(
            w["providerOffsetSlotsInitialized"],
            (text.len() + (text.len() - (end - start) + replacement.len()) + 2) as u64
        );
        assert_eq!(w["providerFlagParseBytes"], w["providerFlagBytes"]);
        assert!(w["lineFilterVisits"].as_u64().unwrap() > 0);
        assert!(w["payloadStringBytesCopied"].as_u64().unwrap() > 0);
        assert!(w["payloadVectorBytesCopied"].as_u64().unwrap() > 0);
        assert!(w["positionRewrites"].as_u64().unwrap() > 0);
        assert_eq!(w["canonicalValuePasses"], 3);
        assert_eq!(w["canonicalJsonPasses"], 3);
        assert_eq!(w["hashCalls"], 3);
        assert_eq!(w["providerRunIdEncodingPasses"], 3);
        assert_eq!(w["providerBufferCalls"], 2);
        assert_eq!(w["providerBufferInputUtf16"], provider / 3);
        assert_eq!(w["commandParseCalls"], 1);
        assert_eq!(w["responseValuePasses"], 2);
        let next_text = format!("{}{}{}", &text[..start], replacement, &text[end..]);
        let mut cold = Runtime::default();
        let oracle = create(&mut cold, &fixture(&next_text));
        assert_eq!(
            retained_observable(rt.session(result["nextReceipt"].as_str().unwrap())),
            retained_observable(cold.session(oracle["receipt"].as_str().unwrap()))
        );
    }
}

#[test]
fn oversized_baseline_insert_rejects_before_unbounded_replacement_scan_or_provider() {
    let mut rt = Runtime::default();
    let created = create(&mut rt, &fixture("AB"));
    let receipt = created["receipt"].as_str().unwrap();
    let before = retained_observable(rt.session(receipt));
    let result: Value = serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,
        "startOffset":2,"endOffset":2,"replacementText":"X".repeat(10000),"anchorSpanId":"span-1","composition":"committed"}).to_string())).unwrap();
    assert_eq!(result["reason"], "budget-exhaustion");
    let w = &result["affectedSummary"]["work"];
    assert_eq!(w["sourceFactsUtf16"], 511, "{w}");
    assert_eq!(w["sourceScanUtf16"], 509);
    assert_eq!(w["replacementScalarsDecoded"], 509);
    assert_eq!(w["sourceCopiedUtf16"], 2);
    assert_eq!(w["sourceCopyBytes"], 2);
    assert_eq!(w["sourceCopyCalls"], 1);
    assert_eq!(w["sourceOffsetLookups"], 2);
    assert_eq!(w["sourceIndexUtf16"], 0);
    assert_eq!(w["canonicalValuePasses"], 0);
    assert_eq!(w["canonicalJsonPasses"], 0);
    assert_eq!(w["hashCalls"], 0);
    assert_eq!(w["hashInputBytes"], 0);
    assert_eq!(w["shapingSegmentationInputUtf16"], 0);
    assert_eq!(w["shapingCalls"], 0);
    assert_eq!(w["propertyScalarVisits"], 0);
    assert_eq!(retained_observable(rt.session(receipt)), before);
}

#[test]
fn bounded_replacement_iterator_counts_whole_non_bmp_scalars() {
    for (replacement, scan, decoded, reason, properties) in [
        (
            format!("{}😀{}", "X".repeat(509), "Y".repeat(10000)),
            509,
            509,
            "budget-exhaustion",
            0,
        ),
        (
            format!("{}😀{}", "X".repeat(508), "Y".repeat(10000)),
            510,
            509,
            "budget-exhaustion",
            0,
        ),
        ("😀".to_string(), 6, 1, "uncertified-seam", 2),
    ] {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture("AB"));
        let receipt = c["receipt"].as_str().unwrap();
        let before = retained_observable(rt.session(receipt));
        let r: Value = serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,
            "startOffset":2,"endOffset":2,"replacementText":replacement,"composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
        assert_eq!(r["reason"], reason);
        let w = &r["affectedSummary"]["work"];
        assert_eq!(w["sourceScanUtf16"], scan);
        assert_eq!(w["replacementScalarsDecoded"], decoded);
        assert_eq!(w["sourceFactsUtf16"], scan + 2 + properties);
        assert_eq!(w["propertyFactsUtf16"], properties);
        assert_eq!(w["shapingCalls"], 0);
        assert_eq!(w["sourceCopiedUtf16"], 2);
        assert_eq!(retained_observable(rt.session(receipt)), before);
    }
}

#[test]
fn previous_partial_run_tail_repair_requires_retained_line_context() {
    for text in [
        format!("{}A", "ภาษาไทย".repeat(30)),
        format!("{}A", "ก".repeat(300)),
    ] {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture(&text));
        let receipt = c["receipt"].as_str().unwrap();
        let before = retained_observable(rt.session(receipt));
        let n = text.encode_utf16().count();
        let r: Value = serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,
            "startOffset":n-1,"endOffset":n,"replacementText":"","composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
        assert_eq!(
            r["status"], "NotAdmissible",
            "partial previous run cannot certify ICU context: {r}"
        );
        assert_eq!(r["reason"], "uncertified-seam");
        assert_eq!(retained_observable(rt.session(receipt)), before);
    }
}

#[test]
fn all_baseline_paths_keep_inspection_and_copy_work_independent_of_unrelated_context() {
    for count in [300, 3000] {
        for (
            core,
            suffix,
            start,
            end,
            replacement,
            want_source,
            want_property,
            want_copy,
            want_provider,
        ) in [
            ("AB", false, 2, 2, "C", 23, 1, 11, 15),
            ("ABCDE", false, 4, 5, "", 45, 9, 17, 27),
            ("ABCDE", true, 2, 2, "X", 45, 6, 23, 33),
            ("ABCDE", true, 1, 3, "XY", 47, 10, 20, 30),
            ("ABCDE", true, 1, 3, "", 37, 8, 14, 24),
            ("ABก", false, 2, 3, "", 15, 1, 3, 9),
        ] {
            let prefix = "ข".repeat(count);
            let suffix_text = if suffix {
                "ก".repeat(count)
            } else {
                String::new()
            };
            let text = format!("{prefix}{core}{suffix_text}");
            let mut rt = Runtime::default();
            let c = create(&mut rt, &fixture(&text));
            let receipt = c["receipt"].as_str().unwrap();
            let old = rt.session(receipt);
            let prefix_payload = old.shards.payload(0);
            let suffix_payload = old.shards.payload(old.shards.len - 1);
            let r: Value = serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,
                "startOffset":count+start,"endOffset":count+end,"replacementText":replacement,"anchorSpanId":"span-1","composition":"committed"}).to_string())).unwrap();
            assert_eq!(r["status"], "Accepted", "{r}");
            let w = &r["affectedSummary"]["work"];
            assert_eq!(w["sourceFactsUtf16"], want_source);
            assert_eq!(w["propertyFactsUtf16"], want_property);
            assert_eq!(w["sourceCopiedUtf16"], want_copy);
            assert_eq!(w["shapingSegmentationInputUtf16"], want_provider);
            assert_eq!(w["wholeParagraphScans"], 0);
            assert_eq!(w["unboundedSuffixWork"], 0);
            assert!(w["treeNodeVisits"].as_u64().unwrap() < 160);
            assert!(w["treePathCopies"].as_u64().unwrap() < 80);
            let next = rt.session(r["nextReceipt"].as_str().unwrap());
            assert!(std::sync::Arc::ptr_eq(
                &prefix_payload,
                &next.shards.payload(0)
            ));
            if suffix {
                assert!(std::sync::Arc::ptr_eq(
                    &suffix_payload,
                    &next.shards.payload(next.shards.len - 1)
                ));
            }
            let expected_core: String = core
                .chars()
                .take(start)
                .chain(replacement.chars())
                .chain(core.chars().skip(end))
                .collect();
            let mut cold = Runtime::default();
            let oracle = create(
                &mut cold,
                &fixture(&format!("{prefix}{expected_core}{suffix_text}")),
            );
            assert_eq!(
                retained_observable(next),
                retained_observable(cold.session(oracle["receipt"].as_str().unwrap()))
            );
        }
    }
}

#[test]
fn tail_pruning_charges_promoted_lazy_shift_and_preserves_payload_identity() {
    use super::{
        ledger::Work,
        model::Span,
        position::Delta,
        tree::{Tree, TreeWork},
    };
    let spans: Vec<_> = (0..5)
        .map(|i| Span {
            span_id: format!("s{i}"),
            start_offset: i,
            end_offset: i + 1,
            language: None,
            style_key: None,
        })
        .collect();
    let tree = Tree::build(spans, &mut Work::default());
    let mut first = tree
        .at(0, &mut TreeWork::default())
        .unwrap()
        .materialize(&mut TreeWork::default());
    first.end_offset = 2;
    let shifted = tree.replace_and_shift(
        0,
        first,
        Delta { units: 1, bytes: 1 },
        &mut TreeWork::default(),
    );
    let retained = shifted.payload(3);
    let mut work = TreeWork::default();
    let pruned = shifted.without_last(&mut work);
    assert_eq!(pruned.last().unwrap().end_offset, 5);
    assert!(std::sync::Arc::ptr_eq(&retained, &pruned.payload(3)));
    assert_eq!(work.shifted_subtrees, 1);
    assert_eq!(work.shared_subtrees, 2);
    assert_eq!(work.copies, 2);
    assert_eq!(work.visits, 2);
}
