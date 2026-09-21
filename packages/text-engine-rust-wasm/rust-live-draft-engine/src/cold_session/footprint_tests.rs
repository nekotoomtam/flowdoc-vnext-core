use super::{
    command_work::{FIELD_COUNT, FIELD_NAMES},
    fault_tests::Snapshot,
    faults,
    runtime::Runtime,
    tests::{create, retained_observable, span_fixture},
};
use serde_json::{json, Value};
use std::sync::Arc;

fn command(
    receipt: &str,
    revision: u64,
    start: usize,
    end: usize,
    text: &str,
    anchor: &str,
) -> Value {
    json!({"receipt":receipt,"expectedRevision":revision,"startOffset":start,"endOffset":end,
        "replacementText":text,"anchorSpanId":anchor,"composition":"committed"})
}

fn apply(rt: &mut Runtime, command: &Value) -> Value {
    serde_json::from_str(&rt.apply(&command.to_string())).unwrap()
}

fn accepted(rt: &Runtime, reply: &Value, expected: &[&str], totals: &mut [u128; FIELD_COUNT]) {
    assert_eq!(reply["status"], "Accepted", "reason={}", reply["reason"]);
    let next = rt.session(reply["nextReceipt"].as_str().unwrap());
    let mut cold = Runtime::default();
    let created = create(&mut cold, &span_fixture(expected));
    assert_eq!(created["status"], "Created");
    assert_eq!(
        retained_observable(next),
        retained_observable(cold.session(created["receipt"].as_str().unwrap()))
    );
    let work = &reply["affectedSummary"]["work"];
    let cumulative = &reply["affectedSummary"]["acceptedCumulativeWork"];
    assert_eq!(
        *cumulative,
        serde_json::to_value(next.accepted_work).unwrap()
    );
    for (i, field) in FIELD_NAMES.iter().enumerate() {
        totals[i] = totals[i]
            .checked_add(work[*field].as_u64().unwrap().into())
            .unwrap();
        assert_eq!(
            u128::from_str_radix(cumulative[*field].as_str().unwrap(), 16).unwrap(),
            totals[i],
            "{field}"
        );
    }
    for (field, cap) in [
        ("sourceFactsUtf16", 512),
        ("propertyFactsUtf16", 512),
        ("shapingSegmentationInputUtf16", 1024),
    ] {
        assert!(work[field].as_u64().unwrap() <= cap, "{field}");
    }
    for field in [
        "wholeParagraphScans",
        "fullSerializations",
        "unboundedSuffixWork",
        "absoluteOffsetReindexing",
    ] {
        assert_eq!(work[field], 0, "{field}");
    }
    assert_eq!(next.source.stats(), next.source.recursive_stats());
    assert_eq!(next.spans.stats(), next.spans.recursive_stats());
    assert_eq!(next.runs.stats(), next.runs.recursive_stats());
    assert_eq!(next.shards.stats(), next.shards.recursive_stats());
    assert_eq!(
        reply["affectedSummary"]["structuralSnapshot"],
        serde_json::to_value(next.structures).unwrap()
    );
    assert_eq!(reply["nextRevision"], next.revision);
    assert_eq!(rt.live_count(), 1);
}

#[test]
fn footprint_multispan_append_inverse_backspace_preserves_exact_siblings_and_ledger() {
    let prefix = "ก".repeat(300);
    let mut rt = Runtime::default();
    let created = create(&mut rt, &span_fixture(&[&prefix, "AB", "CDE"]));
    assert_eq!(created["status"], "Created");
    let mut receipt = created["receipt"].as_str().unwrap().to_owned();
    let siblings = [
        rt.session(&receipt).spans.payload(0),
        rt.session(&receipt).spans.payload(1),
    ];
    let mut totals = [0u128; FIELD_COUNT];
    for (revision, start, end, text, expected) in
        [(0, 305, 305, "F", "CDEF"), (1, 305, 306, "", "CDE")]
    {
        let cmd = command(&receipt, revision, start, end, text, "span-2");
        let reply = apply(&mut rt, &cmd);
        accepted(&rt, &reply, &[&prefix, "AB", expected], &mut totals);
        assert_eq!(reply["nextRevision"], revision + 1);
        assert!(!rt.sessions.contains_key(&receipt));
        receipt = reply["nextReceipt"].as_str().unwrap().to_owned();
        let next = rt.session(&receipt);
        for (i, sibling) in siblings.iter().enumerate() {
            assert!(Arc::ptr_eq(sibling, &next.spans.payload(i)));
        }
        let unchanged = Snapshot::take(&rt, &receipt);
        let stale = apply(&mut rt, &cmd);
        assert_eq!(stale["reason"], "unknown-receipt");
        unchanged.assert_unchanged(&rt, &receipt);
    }
}

#[test]
fn footprint_multispan_middle_insert_replace_delete_keep_both_sibling_payloads() {
    for (start, end, text, expected) in [(3, 3, "X", "CXDE"), (3, 4, "X", "CXE"), (3, 4, "", "CE")]
    {
        let mut rt = Runtime::default();
        let created = create(&mut rt, &span_fixture(&["AB", "CDE", "FG"]));
        assert_eq!(created["status"], "Created");
        let receipt = created["receipt"].as_str().unwrap();
        let left = rt.session(receipt).spans.payload(0);
        let right = rt.session(receipt).spans.payload(2);
        let reply = apply(&mut rt, &command(receipt, 0, start, end, text, "span-1"));
        accepted(&rt, &reply, &["AB", expected, "FG"], &mut [0; FIELD_COUNT]);
        let next = rt.session(reply["nextReceipt"].as_str().unwrap());
        assert_eq!(next.spans.len, 3);
        assert!(Arc::ptr_eq(&left, &next.spans.payload(0)));
        assert!(Arc::ptr_eq(&right, &next.spans.payload(2)));
    }
}

#[test]
fn footprint_multispan_invalid_owner_cross_span_and_existing_safety_gates_do_not_publish() {
    let prefix = "ก".repeat(300);
    let mut rt = Runtime::default();
    let created = create(&mut rt, &span_fixture(&[&prefix, "AB", "CDE"]));
    assert_eq!(created["status"], "Created");
    let receipt = created["receipt"].as_str().unwrap();
    let oversized = "X".repeat(1000);
    for (start, end, text, anchor, revision, reason) in [
        (303, 304, "X", "span-1", 0, "ambiguous-anchor"),
        (303, 304, "X", "", 0, "missing-anchor"),
        (303, 304, "X", "nonexistent", 0, "ambiguous-anchor"),
        (303, 304, "X", "span-2", 1, "stale-revision"),
        (301, 303, "X", "span-1", 0, "unsupported-command-shape"),
        (299, 304, "", "span-0", 0, "unsupported-command-shape"),
        (300, 302, "", "span-1", 0, "unsupported-command-shape"),
        (302, 305, "", "span-2", 0, "unsupported-command-shape"),
        (
            303,
            304,
            oversized.as_str(),
            "span-2",
            0,
            "budget-exhaustion",
        ),
    ] {
        let unchanged = Snapshot::take(&rt, receipt);
        let reply = apply(
            &mut rt,
            &command(receipt, revision, start, end, text, anchor),
        );
        assert_eq!(reply["status"], "NotAdmissible");
        assert_eq!(
            reply["reason"], reason,
            "range={start}..{end}, anchor={anchor}"
        );
        assert_eq!(reply["unchangedReceipt"], receipt);
        assert_eq!(reply["unchangedRevision"], 0);
        unchanged.assert_unchanged(&rt, receipt);
    }
    let mut thai = Runtime::default();
    let created = create(&mut thai, &span_fixture(&["AB", "ก่ข", "CD"]));
    assert_eq!(created["status"], "Created");
    let receipt = created["receipt"].as_str().unwrap();
    let unchanged = Snapshot::take(&thai, receipt);
    let reply = apply(&mut thai, &command(receipt, 0, 3, 4, "", "span-1"));
    assert_eq!(reply["reason"], "uncertified-boundary");
    unchanged.assert_unchanged(&thai, receipt);
}

#[test]
fn footprint_multispan_faults_preserve_state_then_exact_retry_publishes_once() {
    for (point, reason) in [
        ("cancel-before-provider", "cancelled"),
        ("provider-failure", "provider-failure"),
        ("cancel-after-provider", "cancelled"),
        ("publication-refusal", "publication-refused"),
    ] {
        let mut rt = Runtime::default();
        let created = create(&mut rt, &span_fixture(&["AB", "CDE", "FG"]));
        assert_eq!(created["status"], "Created");
        let receipt = created["receipt"].as_str().unwrap();
        let armed: Value = serde_json::from_str(&faults::arm(
            &mut rt,
            &json!({"receipt":receipt,"expectedRevision":0,"point":point}).to_string(),
        ))
        .unwrap();
        assert_eq!(armed["status"], "Armed");
        let cmd = command(receipt, 0, 3, 4, "X", "span-1");
        {
            let unchanged = Snapshot::take(&rt, receipt);
            let rejected = apply(&mut rt, &cmd);
            assert_eq!(rejected["reason"], reason, "{point}");
            unchanged.assert_unchanged(&rt, receipt);
        }
        let retry = apply(&mut rt, &cmd);
        accepted(&rt, &retry, &["AB", "CXE", "FG"], &mut [0; FIELD_COUNT]);
        assert_eq!(retry["nextRevision"], 1);
        assert!(!rt.sessions.contains_key(receipt));
    }
}
