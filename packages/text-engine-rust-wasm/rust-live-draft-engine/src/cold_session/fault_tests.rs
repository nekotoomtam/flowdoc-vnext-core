use super::{
    faults,
    model::{Run, Shard, Span},
    runtime::Runtime,
    source::Source,
    tests::{create, fixture, retained_observable},
};
use serde_json::{json, Value};
use std::sync::Arc;

struct Snapshot {
    value: Value,
    binding: String,
    revision: u64,
    live: usize,
    source: Arc<Source>,
    spans: Vec<Arc<Span>>,
    runs: Vec<Arc<Run>>,
    shards: Vec<Arc<Shard>>,
}
impl Snapshot {
    fn take(rt: &Runtime, receipt: &str) -> Self {
        let s = rt.session(receipt);
        Self {
            value: retained_observable(s),
            binding: s.source_binding.clone(),
            revision: s.revision,
            live: rt.live_count(),
            source: s.source.clone(),
            spans: (0..s.spans.len).map(|i| s.spans.payload(i)).collect(),
            runs: (0..s.runs.len).map(|i| s.runs.payload(i)).collect(),
            shards: (0..s.shards.len).map(|i| s.shards.payload(i)).collect(),
        }
    }
    fn assert_unchanged(&self, rt: &Runtime, receipt: &str) {
        let s = rt.session(receipt);
        assert_eq!(self.value, retained_observable(s));
        assert_eq!(self.binding, s.source_binding);
        assert_eq!(self.revision, s.revision);
        assert_eq!(self.live, rt.live_count());
        assert!(Arc::ptr_eq(&self.source, &s.source));
        assert_eq!(self.spans.len(), s.spans.len);
        assert_eq!(self.runs.len(), s.runs.len);
        assert_eq!(self.shards.len(), s.shards.len);
        for (i, p) in self.spans.iter().enumerate() {
            assert!(Arc::ptr_eq(p, &s.spans.payload(i)));
        }
        for (i, p) in self.runs.iter().enumerate() {
            assert!(Arc::ptr_eq(p, &s.runs.payload(i)));
        }
        for (i, p) in self.shards.iter().enumerate() {
            assert!(Arc::ptr_eq(p, &s.shards.payload(i)));
        }
    }
}
fn arm(rt: &mut Runtime, receipt: &str, revision: u64, point: &str) -> Value {
    serde_json::from_str(&faults::arm(
        rt,
        &json!({"receipt":receipt,"expectedRevision":revision,"point":point}).to_string(),
    ))
    .unwrap()
}
fn command(receipt: &str) -> Value {
    json!({"receipt":receipt,"expectedRevision":0,"startOffset":301,"endOffset":303,
        "replacementText":"XY","composition":"committed","anchorSpanId":"span-1"})
}
fn apply(rt: &mut Runtime, value: &Value) -> Value {
    serde_json::from_str(&rt.apply(&value.to_string())).unwrap()
}

#[test]
fn all_fault_points_preserve_every_authoritative_payload_then_retry_once() {
    for (point, reason, shapes, checkpoints) in [
        ("cancel-before-provider", "cancelled", 0, 1),
        ("provider-failure", "provider-failure", 1, 2),
        ("cancel-after-provider", "cancelled", 2, 3),
        ("publication-refusal", "publication-refused", 2, 5),
    ] {
        let text = format!("{}ABCDE{}", "ก".repeat(300), "ข".repeat(300));
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture(&text));
        let receipt = c["receipt"].as_str().unwrap();
        let before = Snapshot::take(&rt, receipt);
        assert_eq!(arm(&mut rt, receipt, 0, point)["status"], "Armed");
        before.assert_unchanged(&rt, receipt);
        let cmd = command(receipt);
        let rejected = apply(&mut rt, &cmd);
        assert_eq!(rejected["reason"], reason, "{point}: {rejected}");
        assert_eq!(rejected["unchangedReceipt"], receipt);
        assert_eq!(rejected["unchangedRevision"], 0);
        let work = &rejected["affectedSummary"]["work"];
        assert_eq!(work["shapingCalls"], shapes);
        assert_eq!(work["segmentationCalls"], shapes * 2);
        assert_eq!(work["faultCheckpoints"], checkpoints);
        assert_eq!(work["faultsConsumed"], 1);
        assert_eq!(
            work["receiptRandomBytes"],
            if point == "publication-refusal" {
                32
            } else {
                0
            }
        );
        before.assert_unchanged(&rt, receipt);
        let retry = apply(&mut rt, &cmd);
        assert_eq!(retry["status"], "Accepted", "{retry}");
        assert_eq!(retry["nextRevision"], 1);
        assert_eq!(retry["affectedSummary"]["work"]["faultsConsumed"], 0);
        let mut oracle = Runtime::default();
        let expected = create(
            &mut oracle,
            &fixture(&format!("{}AXYDE{}", "ก".repeat(300), "ข".repeat(300))),
        );
        assert_eq!(
            retained_observable(rt.session(retry["nextReceipt"].as_str().unwrap())),
            retained_observable(oracle.session(expected["receipt"].as_str().unwrap()))
        );
        assert_eq!(apply(&mut rt, &cmd)["reason"], "unknown-receipt");
        assert_eq!(rt.live_count(), 1);
    }
}

#[test]
fn faults_are_isolated_and_early_rejections_do_not_consume_the_slot() {
    for point in [
        "cancel-before-provider",
        "provider-failure",
        "cancel-after-provider",
        "publication-refusal",
    ] {
        let mut rt = Runtime::default();
        let text = format!("{}ABCDE{}", "ก".repeat(300), "ข".repeat(300));
        let target = create(&mut rt, &fixture(&text));
        let other = create(&mut rt, &fixture("ABCDE"));
        let receipt = target["receipt"].as_str().unwrap();
        let other_receipt = other["receipt"].as_str().unwrap();
        let before = Snapshot::take(&rt, receipt);
        assert_eq!(arm(&mut rt, receipt, 0, point)["status"], "Armed");
        assert_eq!(
            arm(&mut rt, "forged", 0, point)["reason"],
            "unknown-receipt"
        );
        assert_eq!(arm(&mut rt, receipt, 1, point)["reason"], "stale-revision");
        assert_eq!(
            arm(&mut rt, other_receipt, 0, point)["reason"],
            "fault-already-armed"
        );
        for (field, value, reason) in [
            ("composition", json!("active"), "composition-active"),
            ("expectedRevision", json!(1), "stale-revision"),
            ("receipt", json!("forged"), "unknown-receipt"),
            ("anchorSpanId", json!("wrong"), "ambiguous-anchor"),
        ] {
            let mut cmd = command(receipt);
            cmd[field] = value;
            let rejection = apply(&mut rt, &cmd);
            assert_eq!(rejection["reason"], reason, "{rejection}");
            assert_eq!(rejection["affectedSummary"]["work"]["faultsConsumed"], 0);
            assert_eq!(rejection["affectedSummary"]["work"]["faultCheckpoints"], 0);
            before.assert_unchanged(&rt, receipt);
        }
        let mut budget = command(receipt);
        budget["startOffset"] = json!(0);
        budget["endOffset"] = json!(1);
        let rejected = apply(&mut rt, &budget);
        assert_eq!(rejected["reason"], "budget-exhaustion");
        assert_eq!(rejected["affectedSummary"]["work"]["faultCheckpoints"], 0);
        before.assert_unchanged(&rt, receipt);
        let mut other_cmd = command(other_receipt);
        other_cmd["startOffset"] = json!(1);
        other_cmd["endOffset"] = json!(3);
        let other_result = apply(&mut rt, &other_cmd);
        assert_eq!(other_result["status"], "Accepted", "{other_result}");
        assert_eq!(other_result["affectedSummary"]["work"]["faultsConsumed"], 0);
        assert_eq!(
            other_result["affectedSummary"]["work"]["faultCheckpoints"],
            5
        );
        before.assert_unchanged(&rt, receipt);
        let target_result = apply(&mut rt, &command(receipt));
        assert_eq!(
            target_result["affectedSummary"]["work"]["faultsConsumed"],
            1
        );
        assert_eq!(target_result["status"], "NotAdmissible");
        before.assert_unchanged(&rt, receipt);
        assert_eq!(apply(&mut rt, &command(receipt))["status"], "Accepted");
    }
}

#[test]
fn disposal_clears_only_its_own_fault_binding() {
    let mut rt = Runtime::default();
    let a = create(&mut rt, &fixture("ABCDE"));
    let b = create(&mut rt, &fixture("ABCDE"));
    let ar = a["receipt"].as_str().unwrap();
    let br = b["receipt"].as_str().unwrap();
    assert_eq!(
        arm(&mut rt, ar, 0, "publication-refusal")["status"],
        "Armed"
    );
    assert_eq!(rt.dispose("forged")["status"], "UnknownReceipt");
    assert_eq!(rt.dispose(br)["status"], "Disposed");
    assert_eq!(
        arm(&mut rt, ar, 0, "cancel-before-provider")["reason"],
        "fault-already-armed"
    );
    assert_eq!(rt.dispose(ar)["status"], "Disposed");
    let c = create(&mut rt, &fixture("ABCDE"));
    assert_eq!(
        arm(
            &mut rt,
            c["receipt"].as_str().unwrap(),
            0,
            "cancel-before-provider"
        )["status"],
        "Armed"
    );
}

#[test]
fn tail_repair_faults_preserve_all_payloads_and_retry_exactly_once() {
    for (point, reason, shapes) in [
        ("tail-repair-provider-failure", "provider-failure", 2),
        ("cancel-after-tail-repair", "cancelled", 3),
    ] {
        let mut rt = Runtime::default();
        let input = fixture(&format!("{}ABก", "ข".repeat(300)));
        let created = create(&mut rt, &input);
        let receipt = created["receipt"].as_str().unwrap();
        let before = Snapshot::take(&rt, receipt);
        let armed = arm(&mut rt, receipt, 0, point);
        assert_eq!(armed["status"], "Armed", "{point}: {armed}");
        let cmd = json!({"receipt":receipt,"expectedRevision":0,"startOffset":302,"endOffset":303,
            "replacementText":"","composition":"committed","anchorSpanId":"span-1"});
        let rejected = apply(&mut rt, &cmd);
        assert_eq!(rejected["status"], "NotAdmissible", "{point}: {rejected}");
        assert_eq!(rejected["reason"], reason);
        assert_eq!(rejected["unchangedReceipt"], receipt);
        assert_eq!(rejected["unchangedRevision"], 0);
        let work = &rejected["affectedSummary"]["work"];
        assert_eq!(work["shapingCalls"], shapes);
        assert_eq!(work["oldNewShapingCalls"], 2);
        assert_eq!(work["tailRepairShapingCalls"], shapes - 2);
        assert_eq!(work["oldNewProviderInputUtf16"], 3);
        assert_eq!(work["tailRepairProviderInputUtf16"], (shapes - 2) * 6);
        assert_eq!(work["sourceFactsUtf16"], if shapes == 2 { 11 } else { 15 });
        assert_eq!(work["propertyFactsUtf16"], 1);
        assert_eq!(work["sourceCopiedUtf16"], 3);
        assert_eq!(work["sourceCopyBytes"], 5);
        assert_eq!(work["sourceOffsetLookups"], 6);
        assert_eq!(work["faultsConsumed"], 1);
        assert_eq!(work["receiptRandomBytes"], 0);
        before.assert_unchanged(&rt, receipt);
        let retry = apply(&mut rt, &cmd);
        assert_eq!(retry["status"], "Accepted", "{retry}");
        assert_eq!(retry["nextRevision"], 1);
        let mut cold = Runtime::default();
        let oracle = create(&mut cold, &fixture(&format!("{}AB", "ข".repeat(300))));
        let next = rt.session(retry["nextReceipt"].as_str().unwrap());
        assert_eq!(
            retained_observable(next),
            retained_observable(cold.session(oracle["receipt"].as_str().unwrap()))
        );
        for i in 0..before.shards.len() - 2 {
            assert!(Arc::ptr_eq(&before.shards[i], &next.shards.payload(i)));
        }
        assert_eq!(apply(&mut rt, &cmd)["reason"], "unknown-receipt");
        assert_eq!(rt.live_count(), 1);
    }
}

#[test]
fn publication_retires_an_unreached_tail_control_without_orphaning_the_slot() {
    let mut rt = Runtime::default();
    let c = create(&mut rt, &fixture("ABCDE"));
    let receipt = c["receipt"].as_str().unwrap();
    assert_eq!(
        arm(&mut rt, receipt, 0, "cancel-after-tail-repair")["status"],
        "Armed"
    );
    let cmd = json!({"receipt":receipt,"expectedRevision":0,"startOffset":1,"endOffset":3,
        "replacementText":"XY","composition":"committed","anchorSpanId":"span-1"});
    let accepted = apply(&mut rt, &cmd);
    assert_eq!(accepted["status"], "Accepted");
    assert_eq!(accepted["affectedSummary"]["work"]["faultsConsumed"], 0);
    assert_eq!(accepted["affectedSummary"]["work"]["faultsCleared"], 1);
    assert_eq!(
        arm(
            &mut rt,
            accepted["nextReceipt"].as_str().unwrap(),
            1,
            "cancel-before-provider"
        )["status"],
        "Armed"
    );
    assert_eq!(rt.dispose(receipt)["status"], "UnknownReceipt");
    assert_eq!(rt.dispose("forged")["status"], "UnknownReceipt");
    let mut next_cmd = cmd.clone();
    next_cmd["receipt"] = accepted["nextReceipt"].clone();
    next_cmd["expectedRevision"] = json!(1);
    assert_eq!(apply(&mut rt, &next_cmd)["reason"], "cancelled");
}

#[test]
fn entropy_failure_preserves_executed_identity_work_and_retry() {
    let mut rt = Runtime::default();
    let c = create(
        &mut rt,
        &fixture(&format!("{}ABCDE{}", "ก".repeat(300), "ข".repeat(300))),
    );
    let receipt = c["receipt"].as_str().unwrap();
    let before = Snapshot::take(&rt, receipt);
    let armed = arm(&mut rt, receipt, 0, "receipt-entropy-failure");
    assert_eq!(armed["status"], "Armed", "{armed}");
    let cmd = command(receipt);
    let r = apply(&mut rt, &cmd);
    assert_eq!(r["reason"], "entropy-unavailable", "{r}");
    let w = &r["affectedSummary"]["work"];
    assert_eq!(w["canonicalValuePasses"], 1);
    assert_eq!(w["canonicalJsonPasses"], 1);
    assert_eq!(w["hashCalls"], 1);
    assert_eq!(w["canonicalEncodedBytes"], w["hashInputBytes"]);
    assert!(w["hashInputBytes"].as_u64().unwrap() > 0);
    assert_eq!(w["receiptRandomBytes"], 0);
    assert_eq!(w["receiptBindingBytes"], 0);
    assert_eq!(w["publicationPreparationPasses"], 0);
    assert_eq!(w["faultsConsumed"], 1);
    before.assert_unchanged(&rt, receipt);
    let retry = apply(&mut rt, &cmd);
    assert_eq!(retry["status"], "Accepted");
    let mut clean = Runtime::default();
    let fresh = create(
        &mut clean,
        &fixture(&format!("{}ABCDE{}", "ก".repeat(300), "ข".repeat(300))),
    );
    let plain = apply(&mut clean, &command(fresh["receipt"].as_str().unwrap()));
    let deterministic = |value: &Value| {
        let mut work = value["affectedSummary"]["work"]
            .as_object()
            .unwrap()
            .clone();
        // Entropy's decimal JSON width changes receipt canonical/hash byte counts,
        // allocation sizes and response digit widths, never deterministic operations.
        for name in [
            "canonicalEncodedBytes",
            "hashInputBytes",
            "receiptBindingBytes",
            "allocatedBytes",
            "deallocatedBytes",
            "allocationCalls",
            "deallocationCalls",
            "abiOutputBytes",
            "responseEncodedBytes",
            "responseEncodingPasses",
            "publicationPreparationBytes",
        ] {
            work.remove(name);
        }
        work
    };
    assert_eq!(deterministic(&retry), deterministic(&plain));
    let mut cold = Runtime::default();
    let oracle = create(
        &mut cold,
        &fixture(&format!("{}AXYDE{}", "ก".repeat(300), "ข".repeat(300))),
    );
    assert_eq!(
        retained_observable(rt.session(retry["nextReceipt"].as_str().unwrap())),
        retained_observable(cold.session(oracle["receipt"].as_str().unwrap()))
    );
    assert_eq!(apply(&mut rt, &cmd)["reason"], "unknown-receipt");
}
