// Private native QA: repeated commands, independent cold states, and actual work.
use super::{
    command_work::{FIELD_COUNT, FIELD_NAMES},
    fault_tests::Snapshot,
    runtime::{Runtime, Session},
    tests::{create, fixture, retained_observable, span_fixture},
};
use serde_json::{json, Value};
use std::{collections::BTreeSet, sync::Arc};

const MEASURED: [&str; 12] = [
    "canonicalEncodedBytes", "hashInputBytes", "receiptBindingBytes",
    "publicationPreparationBytes", "faultReceiptComparisonBytes",
    "allocationCalls", "allocatedBytes", "deallocationCalls", "deallocatedBytes",
    "abiOutputBytes", "responseEncodingPasses", "responseEncodedBytes",
];

// Each literal post-state is authored independently of command implementation.
// Offsets are relative to the unchanged Thai prefix; each adjacent pair restores AB|CDE.
const STEPS: [(usize, usize, &str, &str, &str, &str); 10] = [
    (5, 5, "F", "span-2", "AB", "CDEF"),
    (5, 6, "", "span-2", "AB", "CDE"),
    (1, 1, "X", "span-1", "AXB", "CDE"),
    (1, 2, "", "span-1", "AB", "CDE"),
    (3, 5, "XY", "span-2", "AB", "CXY"),
    (3, 5, "DE", "span-2", "AB", "CDE"),
    (3, 5, "", "span-2", "AB", "C"),
    (3, 3, "DE", "span-2", "AB", "CDE"),
    (2, 2, "X", "span-1", "ABX", "CDE"),
    (2, 3, "", "span-1", "AB", "CDE"),
];

fn hex(value: &Value) -> u128 {
    let wire = value.as_str().expect("fixed-width cumulative hex");
    assert_eq!(wire.len(), 32);
    u128::from_str_radix(wire, 16).unwrap()
}

fn structural(session: &Session, previous: &Value, reply: &Value) -> Value {
    let recursive = json!({
        "source":session.source.recursive_stats(), "spans":session.spans.recursive_stats(),
        "runs":session.runs.recursive_stats(), "shards":session.shards.recursive_stats()
    });
    let stored = serde_json::to_value(session.structures).unwrap();
    assert_eq!(stored["current"], recursive);
    assert_eq!(reply["affectedSummary"]["structuralSnapshot"], stored);
    for tree in ["source", "spans", "runs", "shards"] {
        let n = recursive[tree]["nodeCount"].as_u64().unwrap();
        let h = recursive[tree]["height"].as_u64().unwrap();
        // Independent ceil(log2(n + 1)), not production bit-length arithmetic.
        let mut power = 1u128;
        let mut ceil = 0;
        while power < u128::from(n) + 1 { power *= 2; ceil += 1; }
        assert!(if n == 0 { h == 0 } else { h > 0 && h <= 2 * ceil }, "{tree}: n={n}, h={h}");
        for field in ["nodeCount", "height"] {
            let current = recursive[tree][field].as_u64().unwrap();
            let prior = previous["max"][tree][field].as_u64().unwrap();
            assert_eq!(stored["max"][tree][field], current.max(prior));
        }
    }
    stored
}

fn accounting(session: &Session, reply: &Value, totals: &mut [u128; FIELD_COUNT]) {
    let work = reply["affectedSummary"]["work"].as_object().unwrap();
    let returned = &reply["affectedSummary"]["acceptedCumulativeWork"];
    let stored = serde_json::to_value(session.accepted_work).unwrap();
    assert_eq!(returned, &stored);
    assert_eq!(returned.as_object().unwrap().len(), FIELD_COUNT);
    assert_eq!(work.values().filter(|v| v.is_u64()).count(), FIELD_COUNT);
    assert_eq!(work.values().filter(|v| v.is_boolean()).count(), 4);
    for (i, field) in FIELD_NAMES.iter().enumerate() {
        totals[i] = totals[i].checked_add(u128::from(work[*field].as_u64().unwrap())).unwrap();
        assert_eq!(hex(&returned[*field]), totals[i], "cumulative {field}");
    }
    for (field, cap) in [("sourceFactsUtf16", 512), ("propertyFactsUtf16", 512), ("shapingSegmentationInputUtf16", 1024)] {
        assert!(work[field].as_u64().unwrap() <= cap, "{field}: {}", work[field]);
    }
    for field in ["wholeParagraphScans", "fullSerializations", "unboundedSuffixWork", "absoluteOffsetReindexing"] {
        assert_eq!(work[field], 0, "{field}");
    }
    assert_eq!(work["sourceFactsUtf16"].as_u64().unwrap(),
        ["sourceScanUtf16", "sourceIndexUtf16", "sourceOffsetLookups", "propertyScanUtf16"].iter().map(|f| work[*f].as_u64().unwrap()).sum::<u64>());
    assert_eq!(work["propertyFactsUtf16"], work["propertyScanUtf16"]);
}

fn compare_oracle(session: &Session, oracle: &Value, label: &str) {
    let actual = retained_observable(session);
    for field in ["source", "spans", "runs", "glyphs", "lines", "graphemes"] {
        assert!(actual[field] == oracle[field], "cold oracle mismatch: {label}, field={field}");
    }
}

fn stale_rejected(rt: &mut Runtime, old_command: &str, receipt: &str, revision: u64) {
    let before = Snapshot::take(rt, receipt);
    let rejected: Value = serde_json::from_str(&rt.apply(old_command)).unwrap();
    assert_eq!(rejected["status"], "NotAdmissible");
    assert_eq!(rejected["reason"], "unknown-receipt");
    assert!(rejected["affectedSummary"]["acceptedCumulativeWork"].is_null());
    before.assert_unchanged(rt, receipt);
    assert_eq!(rt.session(receipt).revision, revision);
}

#[test]
fn sustained_matrix_twins_160_revisions_each_and_repeated_tail_pruning() {
    assert_eq!(FIELD_COUNT, 92);
    let artifact_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("target/stage4-sustained-matrix.jsonl");
    std::fs::create_dir_all(artifact_path.parent().unwrap()).unwrap();
    let mut artifact = std::fs::File::create(&artifact_path).unwrap();
    use std::io::Write;
    writeln!(artifact, "{}", json!({"kind":"manifest", "contexts":[300,3000],"cycles":16,"revisionsPerSession":160,
        "twins":2,"coldOracleEveryRevision":true,"numericFields":92,"measuredFields":MEASURED,
        "profile":"unchanged Thai prefix plus authored AB|CDE; no suffix-context claim"})).unwrap();
    for context in [300, 3000] {
        let prefix = "ก".repeat(context);
        let input = span_fixture(&[&prefix, "AB", "CDE"]);
        let mut twins = [Runtime::default(), Runtime::default()];
        let created = twins.each_mut().map(|rt| create(rt, &input));
        let mut receipts = created.each_ref().map(|c| { assert_eq!(c["status"], "Created"); c["receipt"].as_str().unwrap().to_owned() });
        let mut seen: [BTreeSet<String>; 2] = std::array::from_fn(|t| BTreeSet::from([receipts[t].clone()]));
        let mut totals = [[0u128; FIELD_COUNT]; 2];
        let mut histories = std::array::from_fn::<_, 2, _>(|t| serde_json::to_value(twins[t].session(&receipts[t]).structures).unwrap());
        for t in 0..2 {
            let zero = serde_json::to_value(twins[t].session(&receipts[t]).accepted_work).unwrap();
            assert!(FIELD_NAMES.iter().all(|f| hex(&zero[*f]) == 0));
        }
        for index in 0..160 {
            let (start, end, replacement, anchor, left, right) = STEPS[index % 10];
            let revision = index as u64 + 1;
            let label = format!("context={context}, revision={revision}, pair={}, direction={}", index % 10 / 2, index % 2);
            let mut cold = Runtime::default();
            let cold_created = create(&mut cold, &span_fixture(&[&prefix, left, right]));
            assert_eq!(cold_created["status"], "Created", "{label}");
            let oracle = retained_observable(cold.session(cold_created["receipt"].as_str().unwrap()));
            let mut replies = [Value::Null, Value::Null];
            for t in 0..2 {
                let session = twins[t].session(&receipts[t]);
                let prefix_span = session.spans.payload(0);
                let prefix_run = session.runs.payload(0);
                let membership = session.runs.payload(1).span_indexes.clone();
                let prefix_shards: Vec<_> = (0..session.shards.len - 1).map(|i| session.shards.payload(i)).collect();
                let prefix_pieces: Vec<_> = (0..prefix_shards.len()).map(|i| session.source.payload(i)).collect();
                let cmd = json!({"receipt":receipts[t], "expectedRevision":revision-1,
                    "startOffset":context+start,"endOffset":context+end,"replacementText":replacement,
                    "anchorSpanId":anchor,"composition":"committed"}).to_string();
                let reply: Value = serde_json::from_str(&twins[t].apply(&cmd)).unwrap();
                // Persist actual output before assertions, including the first failure.
                writeln!(artifact, "{}", json!({"kind":"revision","context":context,"twin":t,"revision":revision,"step":index%10,"reply":reply})).unwrap();
                artifact.flush().unwrap();
                assert_eq!(reply["status"], "Accepted", "{label}, twin={t}: {reply}");
                assert_eq!(reply["nextRevision"], revision, "{label}");
                let next_receipt = reply["nextReceipt"].as_str().unwrap().to_owned();
                assert!(seen[t].insert(next_receipt.clone()), "receipt reused: {label}");
                assert!(!twins[t].sessions.contains_key(&receipts[t]));
                assert_eq!(twins[t].live_count(), 1);
                let next = twins[t].session(&next_receipt);
                assert_eq!(next.revision, revision);
                accounting(next, &reply, &mut totals[t]);
                histories[t] = structural(next, &histories[t], &reply);
                compare_oracle(next, &oracle, &label);
                assert!(Arc::ptr_eq(&prefix_span, &next.spans.payload(0)));
                assert!(Arc::ptr_eq(&prefix_run, &next.runs.payload(0)));
                assert!(Arc::ptr_eq(&membership, &next.runs.payload(1).span_indexes));
                for (i, p) in prefix_shards.iter().enumerate() { assert!(Arc::ptr_eq(p, &next.shards.payload(i))); }
                for (i, p) in prefix_pieces.iter().enumerate() { assert!(Arc::ptr_eq(p, &next.source.payload(i))); }
                stale_rejected(&mut twins[t], &cmd, &next_receipt, revision);
                receipts[t] = next_receipt;
                replies[t] = reply;
            }
            for field in FIELD_NAMES.iter().filter(|f| !MEASURED.contains(f)) {
                assert_eq!(replies[0]["affectedSummary"]["work"][*field], replies[1]["affectedSummary"]["work"][*field], "twin {field}: {label}");
            }
            if revision % 16 == 0 { eprintln!("sustained checkpoint: context={context}, twins=2, revision={revision}, oracle/92-field-ledger/structure/identity/stale PASS"); }
        }
        writeln!(artifact, "{}", json!({"kind":"profile-pass","context":context,"acceptedRevisionsPerTwin":160,"staleRejectionsPerTwin":160,"freshColdOracles":160,"finalStructures":histories})).unwrap();
    }

    // Repeatedly remove the whole final run, an already-admitted tail shape.
    // One authored span survives throughout; never delete the whole document.
    let mut text = "ABก".repeat(16);
    let mut rt = Runtime::default();
    let created = create(&mut rt, &fixture(&text));
    assert_eq!(created["status"], "Created");
    let mut receipt = created["receipt"].as_str().unwrap().to_owned();
    let mut history = serde_json::to_value(rt.session(&receipt).structures).unwrap();
    let initial = history.clone();
    let mut totals = [0u128; FIELD_COUNT];
    let mut decreases = 0;
    for revision in 1..=31u64 {
        let remove = if text.ends_with('ก') { 1 } else { 2 };
        let end = text.encode_utf16().count();
        let expected = text.chars().take(end - remove).collect::<String>();
        let cmd = json!({"receipt":receipt,"expectedRevision":revision-1,"startOffset":end-remove,"endOffset":end,
            "replacementText":"","anchorSpanId":"span-1","composition":"committed"}).to_string();
        let reply: Value = serde_json::from_str(&rt.apply(&cmd)).unwrap();
        writeln!(artifact, "{}", json!({"kind":"tail-revision","revision":revision,"reply":reply})).unwrap();
        artifact.flush().unwrap();
        assert_eq!(reply["status"], "Accepted", "tail revision={revision}: {reply}");
        assert_eq!(reply["nextRevision"], revision);
        let next_receipt = reply["nextReceipt"].as_str().unwrap().to_owned();
        let next = rt.session(&next_receipt);
        accounting(next, &reply, &mut totals);
        let next_history = structural(next, &history, &reply);
        for tree in ["source", "runs", "shards"] {
            assert_eq!(next_history["current"][tree]["nodeCount"].as_u64().unwrap() + 1, history["current"][tree]["nodeCount"].as_u64().unwrap());
            if next_history["current"][tree]["height"].as_u64() < history["current"][tree]["height"].as_u64() { decreases += 1; }
            assert_eq!(next_history["max"][tree], initial["max"][tree]);
        }
        let mut cold = Runtime::default();
        let c = create(&mut cold, &fixture(&expected));
        assert_eq!(c["status"], "Created");
        compare_oracle(next, &retained_observable(cold.session(c["receipt"].as_str().unwrap())), &format!("tail revision={revision}"));
        stale_rejected(&mut rt, &cmd, &next_receipt, revision);
        receipt = next_receipt;
        text = expected;
        history = next_history;
    }
    assert_eq!(text, "AB");
    assert!(decreases >= 3);
    writeln!(artifact, "{}", json!({"kind":"matrix-pass","acceptedRevisions":671,"freshColdOracles":351,
        "staleRejections":671,"tailHeightDecreases":decreases,"tailFinalStructures":history})).unwrap();
    eprintln!("sustained matrix PASS: 640 twin revisions + 31 tail revisions; artifact={}", artifact_path.display());
}
