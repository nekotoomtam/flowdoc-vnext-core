use super::{
    runtime::Runtime,
    tests::{create, fixture, retained_observable},
};
use serde_json::{json, Value};

#[derive(Clone, Copy, Default)]
pub(super) struct PublicationProbe {
    pub observed: bool,
    pub before_publication: [u64; 4],
    pub after_publication: [u64; 4],
    pub before_final_pass: [u64; 4],
    pub after_final_pass: [u64; 4],
    pub after_assignment: [u64; 4],
    pub length_before_final: usize,
    pub length_after_final: usize,
    pub serde_calls: usize,
    pub serde_output_lengths: [usize; 3],
    pub slot_writes: u64,
    pub slot_bytes: u64,
}
pub(super) fn record_response_serialization(length: usize) {
    PUBLICATION_PROBE.with(|p| {
        let mut probe = p.get();
        probe.serde_output_lengths[probe.serde_calls] = length;
        probe.serde_calls += 1;
        p.set(probe);
    });
}
pub(super) fn record_scalar_slot(length: usize) {
    PUBLICATION_PROBE.with(|p| {
        let mut probe = p.get();
        probe.slot_writes += 1;
        probe.slot_bytes += length as u64;
        p.set(probe);
    });
}
thread_local! {
    pub(super) static PUBLICATION_PROBE: std::cell::Cell<PublicationProbe> =
        std::cell::Cell::new(PublicationProbe::default());
}
fn cumulative(value: &Value) -> u128 {
    let wire = value
        .as_str()
        .expect("cumulative counters are fixed-width hex");
    assert_eq!(wire.len(), 32);
    u128::from_str_radix(wire, 16).unwrap()
}

#[test]
fn cumulative_red_publication_retirement_is_included_before_allocation_free_final_pass() {
    use super::ledger::Scope;
    let mut rt = Runtime::default();
    let created = create(&mut rt, &fixture("AB"));
    let receipt = created["receipt"].as_str().unwrap();
    // Isolate just the same BTreeMap remove/insert used by apply publication.
    // Even the weaker same-receipt move must be allocation/free invariant if a
    // complete final allocator snapshot is to be frozen before this boundary.
    let prepared_key = receipt.to_string();
    let scope = Scope::begin();
    let before = scope.snapshot();
    let session = rt.sessions.remove(receipt).unwrap();
    rt.sessions.insert(prepared_key, session);
    let after = scope.snapshot();
    drop(scope);
    assert_eq!(
        (
            after.alloc_calls - before.alloc_calls,
            after.alloc_bytes - before.alloc_bytes,
            after.free_calls - before.free_calls,
            after.free_bytes - before.free_bytes
        ),
        (0, 0, 1, 71),
        "the isolated counterexample remains actual receipt retirement work"
    );
    PUBLICATION_PROBE.with(|p| p.set(PublicationProbe::default()));
    let result: Value = serde_json::from_str(
        &rt.apply(
            &json!({
                "receipt":receipt,"expectedRevision":0,"startOffset":2,"endOffset":2,
                "replacementText":"C","anchorSpanId":"span-1","composition":"committed"
            })
            .to_string(),
        ),
    )
    .unwrap();
    assert_eq!(result["status"], "Accepted");
    let probe = PUBLICATION_PROBE.with(std::cell::Cell::get);
    assert!(
        probe.observed,
        "real publication/finalization must expose its test-only probe"
    );
    assert!(probe.after_publication[2] > probe.before_publication[2]);
    assert!(probe.after_publication[3] >= probe.before_publication[3] + 71);
    assert_eq!(probe.before_final_pass, probe.after_final_pass);
    assert_eq!(probe.after_final_pass, probe.after_assignment);
    assert_eq!(probe.length_before_final, probe.length_after_final);
    assert_eq!(probe.serde_calls, 2);
    assert_eq!(
        result["affectedSummary"]["work"]["responseEncodingPasses"],
        2
    );
    assert_eq!(
        result["affectedSummary"]["work"]["responseEncodedBytes"],
        probe.serde_output_lengths.iter().sum::<usize>()
    );
    assert_eq!(probe.slot_writes, 184);
    assert_eq!(probe.slot_bytes, 4784);
    assert_eq!(
        result["affectedSummary"]["work"]["responseScalarSlotWrites"],
        probe.slot_writes
    );
    assert_eq!(
        result["affectedSummary"]["work"]["responseScalarSlotBytes"],
        probe.slot_bytes
    );
    eprintln!(
        "publication={:?}->{:?}; slots={:?}->{:?}; assignment={:?}; wire={}, serde={:?}, slotWrites={}, slotBytes={}",
        probe.before_publication,
        probe.after_publication,
        probe.before_final_pass,
        probe.after_final_pass,
        probe.after_assignment,
        probe.length_after_final,
        probe.serde_output_lengths,
        probe.slot_writes,
        probe.slot_bytes
    );
    let next = rt.session(result["nextReceipt"].as_str().unwrap());
    assert_eq!(
        result["affectedSummary"]["acceptedCumulativeWork"],
        serde_json::to_value(next.accepted_work).unwrap()
    );
    assert_eq!(
        result["affectedSummary"]["structuralSnapshot"],
        serde_json::to_value(next.structures).unwrap()
    );
    assert_eq!(next.source.stats(), next.source.recursive_stats());
    assert_eq!(next.spans.stats(), next.spans.recursive_stats());
    assert_eq!(next.runs.stats(), next.runs.recursive_stats());
    assert_eq!(next.shards.stats(), next.shards.recursive_stats());
    for (i, key) in [
        "allocationCalls",
        "allocatedBytes",
        "deallocationCalls",
        "deallocatedBytes",
    ]
    .iter()
    .enumerate()
    {
        assert_eq!(
            result["affectedSummary"]["work"][key],
            probe.after_assignment[i]
        );
        assert_eq!(
            cumulative(&result["affectedSummary"]["acceptedCumulativeWork"][key]),
            u128::from(probe.after_assignment[i])
        );
    }
}

#[test]
fn cumulative_red_every_meter_field_has_an_explicit_additive_classification() {
    use std::collections::BTreeSet;
    let deterministic = [
        "responseScalarSlotWrites",
        "responseScalarSlotBytes",
        "publicationPreparationPasses",
        "ownershipSpanVisits",
        "anchorComparisonBytes",
        "policyRuleVisits",
        "contextRunVisits",
        "contextKeyComparisonBytes",
        "sourceCopyBytes",
        "sourceCopiedUtf16",
        "sourceCopyCalls",
        "sourceScanUtf16",
        "replacementScalarsDecoded",
        "sourceIndexUtf16",
        "sourceOffsetLookups",
        "propertyScalarVisits",
        "propertyScanUtf16",
        "payloadCopyCalls",
        "payloadElementsCopied",
        "payloadStringBytesCopied",
        "payloadVectorBytesCopied",
        "positionRewrites",
        "providerRunIdEncodingPasses",
        "providerRunIdEncodedBytes",
        "canonicalValuePasses",
        "canonicalJsonPasses",
        "boundaryComparisons",
        "factComparisons",
        "lineFilterVisits",
        "concatEdgeChecks",
        "providerOffsetLookups",
        "sourceFactsUtf16",
        "propertyFactsUtf16",
        "shapingSegmentationInputUtf16",
        "shapingCalls",
        "shapingInputUtf16",
        "segmentationInputUtf16",
        "oldNewShapingCalls",
        "tailRepairShapingCalls",
        "oldNewProviderInputUtf16",
        "tailRepairProviderInputUtf16",
        "segmentationCalls",
        "segmentationSetupCalls",
        "fontParseCalls",
        "languageParseCalls",
        "languageParseBytes",
        "featureParseCalls",
        "featureParseBytes",
        "providerOffsetSlotsInitialized",
        "providerBufferCalls",
        "providerBufferInputUtf16",
        "providerBufferInputBytes",
        "providerFlagParseBytes",
        "providerFlagEntries",
        "providerFlagBytes",
        "fontParseInputBytes",
        "glyphVisits",
        "wholeParagraphScans",
        "fullSerializations",
        "unboundedSuffixWork",
        "absoluteOffsetReindexing",
        "treePathCopies",
        "treeNodeVisits",
        "sharedSubtrees",
        "lazyShiftedSubtrees",
        "hashCalls",
        "hashInputUtf16",
        "receiptRandomBytes",
        "abiInputBytes",
        "responseValuePasses",
        "commandParseCalls",
        "seamSearchGlyphs",
        "seamSearchWindows",
        "faultSlotProbes",
        "faultCheckpoints",
        "faultBindingChecks",
        "faultRevisionChecks",
        "faultPointChecks",
        "faultsConsumed",
        "faultsCleared",
    ];
    let measured = [
        "canonicalEncodedBytes",
        "hashInputBytes",
        "receiptBindingBytes",
        "publicationPreparationBytes",
        "faultReceiptComparisonBytes",
        "allocationCalls",
        "allocatedBytes",
        "deallocationCalls",
        "deallocatedBytes",
        "abiOutputBytes",
        "responseEncodingPasses",
        "responseEncodedBytes",
    ];
    let certificates = [
        "boundedOwnership",
        "seamCertified",
        "lineCertified",
        "unsafeEdgesCertified",
    ];
    let mut rt = Runtime::default();
    let created = create(&mut rt, &fixture("AB"));
    let result: Value = serde_json::from_str(
        &rt.apply(
            &json!({
                "receipt":created["receipt"],"expectedRevision":0,
                "startOffset":2,"endOffset":2,"replacementText":"C",
                "anchorSpanId":"span-1","composition":"committed"
            })
            .to_string(),
        ),
    )
    .unwrap();
    assert_eq!(result["status"], "Accepted");
    let work = result["affectedSummary"]["work"].as_object().unwrap();
    let additive: BTreeSet<_> = deterministic.iter().chain(&measured).copied().collect();
    assert_eq!(
        additive.len(),
        deterministic.len() + measured.len(),
        "A/B must be disjoint"
    );
    let all: BTreeSet<_> = additive.iter().copied().chain(certificates).collect();
    assert_eq!(all.len(), additive.len() + certificates.len());
    assert_eq!(
        work.keys().map(String::as_str).collect::<BTreeSet<_>>(),
        all,
        "every serialized Meter/FaultWork key needs an explicit classification"
    );
    for name in &additive {
        assert!(work[*name].is_u64(), "{name} must be additive u64 work");
    }
    for name in certificates {
        assert!(
            work[name].is_boolean(),
            "{name} must be a per-attempt certificate"
        );
    }
    let cumulative = result["affectedSummary"]["acceptedCumulativeWork"].as_object()
        .expect("every numeric field, including measured response/allocation work, needs a cumulative value");
    assert_eq!(
        cumulative
            .keys()
            .map(String::as_str)
            .collect::<BTreeSet<_>>(),
        additive
    );
    for name in additive {
        assert_eq!(
            crate::cold_session::accounting_tests::cumulative(&cumulative[name]),
            u128::from(work[name].as_u64().unwrap()),
            "revision one must checked-add {name} from zero"
        );
    }
}

#[test]
fn cumulative_red_accepted_work_survives_receipt_replacement() {
    // Catches replacing the accepted ledger with the current attempt's meter.
    let mut rt = Runtime::default();
    let created = create(&mut rt, &fixture("AB"));
    let first: Value = serde_json::from_str(
        &rt.apply(
            &json!({
                "receipt":created["receipt"],"expectedRevision":0,
                "startOffset":2,"endOffset":2,"replacementText":"C",
                "anchorSpanId":"span-1","composition":"committed"
            })
            .to_string(),
        ),
    )
    .unwrap();
    assert_eq!(first["status"], "Accepted");
    let second: Value = serde_json::from_str(
        &rt.apply(
            &json!({
                "receipt":first["nextReceipt"],"expectedRevision":1,
                "startOffset":3,"endOffset":3,"replacementText":"D",
                "anchorSpanId":"span-1","composition":"committed"
            })
            .to_string(),
        ),
    )
    .unwrap();
    assert_eq!(second["status"], "Accepted");
    assert_eq!(second["nextRevision"], 2);
    // Shared-source views: 20 for AB -> ABC, 30 for the cross-piece ABC -> ABCD;
    // each includes one new tail-dispatch property classification.
    assert_eq!(first["affectedSummary"]["work"]["sourceFactsUtf16"], 20);
    assert_eq!(second["affectedSummary"]["work"]["sourceFactsUtf16"], 30);
    assert_eq!(
        cumulative(&second["affectedSummary"]["acceptedCumulativeWork"]["sourceFactsUtf16"]),
        50,
        "accepted work must accumulate across the authoritative receipt chain"
    );
}

#[test]
fn cumulative_red_rejection_reports_attempt_without_advancing_accepted_work() {
    // Catches either charging rejected work to the accepted baseline or losing it.
    let mut rt = Runtime::default();
    let created = create(&mut rt, &fixture("AB"));
    let accepted: Value = serde_json::from_str(
        &rt.apply(
            &json!({
                "receipt":created["receipt"],"expectedRevision":0,
                "startOffset":2,"endOffset":2,"replacementText":"C",
                "anchorSpanId":"span-1","composition":"committed"
            })
            .to_string(),
        ),
    )
    .unwrap();
    assert_eq!(accepted["status"], "Accepted");
    let receipt = accepted["nextReceipt"].as_str().unwrap();
    let before = retained_observable(rt.session(receipt));
    let rejected: Value = serde_json::from_str(
        &rt.apply(
            &json!({
                "receipt":receipt,"expectedRevision":1,
                "startOffset":3,"endOffset":3,"replacementText":"X".repeat(10000),
                "anchorSpanId":"span-1","composition":"committed"
            })
            .to_string(),
        ),
    )
    .unwrap();
    assert_eq!(rejected["reason"], "budget-exhaustion");
    assert_eq!(rejected["unchangedRevision"], 1);
    assert_eq!(retained_observable(rt.session(receipt)), before);
    assert_eq!(rejected["affectedSummary"]["work"]["sourceFactsUtf16"], 511);
    assert!(
        rejected["affectedSummary"].get("attemptWork").is_none(),
        "work is the canonical current-attempt view; do not duplicate it"
    );
    assert_eq!(
        cumulative(&rejected["affectedSummary"]["acceptedCumulativeWork"]["sourceFactsUtf16"]),
        20
    );
}

#[test]
fn cumulative_red_tail_pruning_reports_current_height_not_cold_height() {
    use super::{
        ledger::Work,
        model::Span,
        tree::{Tree, TreeWork},
    };
    // Catches stale retained height after a root is replaced by its left child.
    let tree = Tree::build(
        (0..3)
            .map(|i| Span {
                origin: None,
                span_id: format!("s{i}"),
                start_offset: i,
                end_offset: i + 1,
                language: None,
                style_key: None,
            })
            .collect(),
        &mut Work::default(),
    );
    assert_eq!(tree.height, 2);
    let pruned = tree
        .without_last(&mut TreeWork::default())
        .without_last(&mut TreeWork::default());
    assert_eq!(pruned.len, 1);
    assert_eq!(pruned.height, 1, "one retained node has height one");
    assert_eq!(pruned.stats(), pruned.recursive_stats());
}

#[test]
fn cumulative_late_headroom_and_known_overflow_reject_without_publication_then_retry_once() {
    use super::{
        command_work::{AcceptedWork, FIELD_NAMES, LATE_FIELDS},
        fault_tests::Snapshot,
        faults,
    };
    for name in LATE_FIELDS.into_iter().chain([
        "sourceFactsUtf16",
        "responseScalarSlotWrites",
        "responseScalarSlotBytes",
        "responseEncodingPasses",
        "responseEncodedBytes",
        "abiOutputBytes",
    ]) {
        let mut rt = Runtime::default();
        let created = create(&mut rt, &fixture("AB"));
        let receipt = created["receipt"].as_str().unwrap();
        let index = FIELD_NAMES.iter().position(|n| *n == name).unwrap();
        rt.sessions.get_mut(receipt).unwrap().accepted_work.0[index] =
            if LATE_FIELDS.contains(&name) {
                u128::MAX - u128::from(u64::MAX) + 1
            } else {
                u128::MAX
            };
        let before = Snapshot::take(&rt, receipt);
        let arm: Value = serde_json::from_str(&faults::arm(
            &mut rt,
            &json!({
                "receipt":receipt,"expectedRevision":0,"point":"tail-repair-provider-failure"
            })
            .to_string(),
        ))
        .unwrap();
        assert_eq!(arm["status"], "Armed");
        let command = json!({"receipt":receipt,"expectedRevision":0,"startOffset":2,"endOffset":2,
            "replacementText":"C","anchorSpanId":"span-1","composition":"committed"})
        .to_string();
        PUBLICATION_PROBE.with(|p| p.set(PublicationProbe::default()));
        let rejected: Value = serde_json::from_str(&rt.apply(&command)).unwrap();
        assert_eq!(rejected["reason"], "cumulative-work-overflow", "{name}");
        let probe = PUBLICATION_PROBE.with(std::cell::Cell::get);
        assert_eq!(
            probe.serde_calls, 3,
            "overflow after success preparation encodes its rejection too"
        );
        assert_eq!(
            rejected["affectedSummary"]["work"]["responseEncodingPasses"],
            3
        );
        assert_eq!(
            rejected["affectedSummary"]["work"]["responseEncodedBytes"],
            probe.serde_output_lengths.iter().sum::<usize>()
        );
        assert_eq!((probe.slot_writes, probe.slot_bytes), (184, 4784));
        assert_eq!(
            rejected["affectedSummary"]["work"]["responseScalarSlotWrites"],
            184
        );
        assert_eq!(
            rejected["affectedSummary"]["work"]["responseScalarSlotBytes"],
            4784
        );
        assert_eq!(rejected["affectedSummary"]["work"]["faultsCleared"], 0);
        assert!(!PUBLICATION_PROBE.with(std::cell::Cell::get).observed);
        before.assert_unchanged(&rt, receipt);
        assert_eq!(
            rejected["affectedSummary"]["acceptedCumulativeWork"],
            serde_json::to_value(rt.session(receipt).accepted_work).unwrap()
        );
        // Test-only removal of the invalid seeded baseline; same live capability
        // and fault slot retry, without rebuilding or replacing the Session.
        rt.sessions.get_mut(receipt).unwrap().accepted_work = AcceptedWork::default();
        let accepted: Value = serde_json::from_str(&rt.apply(&command)).unwrap();
        assert_eq!(accepted["status"], "Accepted");
        assert_eq!(
            accepted["affectedSummary"]["work"]["responseEncodingPasses"],
            2
        );
        assert_eq!(accepted["nextRevision"], 1);
        assert_eq!(accepted["affectedSummary"]["work"]["faultsCleared"], 1);
        assert_eq!(
            cumulative(&accepted["affectedSummary"]["acceptedCumulativeWork"]["sourceFactsUtf16"]),
            20
        );
        assert_eq!(
            accepted["affectedSummary"]["acceptedCumulativeWork"],
            serde_json::to_value(
                rt.session(accepted["nextReceipt"].as_str().unwrap())
                    .accepted_work
            )
            .unwrap()
        );
    }
}

#[test]
fn cumulative_scalar_writes_are_exact_for_known_and_unknown_rejections() {
    let mut rt = Runtime::default();
    let created = create(&mut rt, &fixture("AB"));
    let known = json!({"receipt":created["receipt"],"expectedRevision":1,"startOffset":2,
        "endOffset":2,"replacementText":"C","anchorSpanId":"span-1","composition":"committed"})
    .to_string();
    for (input, calls, bytes) in [
        (known.as_str(), 184, 4784),
        ("{}", 92, 1840),
        ("{", 92, 1840),
    ] {
        let wire = rt.apply(input);
        let result: Value = serde_json::from_str(&wire).unwrap();
        assert_eq!(result["status"], "NotAdmissible");
        let probe = PUBLICATION_PROBE.with(std::cell::Cell::get);
        assert_eq!(probe.serde_calls, 2);
        assert_eq!(probe.serde_output_lengths[2], 0);
        assert_eq!(
            result["affectedSummary"]["work"]["responseEncodingPasses"],
            2
        );
        assert_eq!(
            result["affectedSummary"]["work"]["responseEncodedBytes"],
            probe.serde_output_lengths.iter().sum::<usize>()
        );
        assert_eq!((probe.slot_writes, probe.slot_bytes), (calls, bytes));
        assert_eq!(
            result["affectedSummary"]["work"]["responseScalarSlotWrites"],
            calls
        );
        assert_eq!(
            result["affectedSummary"]["work"]["responseScalarSlotBytes"],
            bytes
        );
        assert_eq!(
            result["affectedSummary"]["work"]["abiOutputBytes"],
            wire.len()
        );
        assert_eq!(probe.before_final_pass, probe.after_final_pass);
    }
}

#[test]
fn cumulative_known_response_fields_preflight_exact_deltas_not_full_u64_headroom() {
    use super::command_work::{FIELD_NAMES, LATE_FIELDS};
    assert_eq!(
        LATE_FIELDS,
        [
            "allocationCalls",
            "allocatedBytes",
            "deallocationCalls",
            "deallocatedBytes"
        ]
    );
    for name in [
        "responseScalarSlotWrites",
        "responseScalarSlotBytes",
        "responseEncodingPasses",
        "responseEncodedBytes",
        "abiOutputBytes",
    ] {
        let mut rt = Runtime::default();
        let created = create(&mut rt, &fixture("AB"));
        let receipt = created["receipt"].as_str().unwrap();
        let index = FIELD_NAMES.iter().position(|n| *n == name).unwrap();
        // Less than full u64 headroom, but far more than this bounded reply's
        // exact known delta. Treating this known field as late would reject.
        let baseline = u128::MAX - u128::from(u64::MAX) + 1;
        rt.sessions.get_mut(receipt).unwrap().accepted_work.0[index] = baseline;
        let result: Value = serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,
            "startOffset":2,"endOffset":2,"replacementText":"C","anchorSpanId":"span-1","composition":"committed"}).to_string())).unwrap();
        assert_eq!(result["status"], "Accepted", "{name}");
        let actual = u128::from(result["affectedSummary"]["work"][name].as_u64().unwrap());
        assert_eq!(
            cumulative(&result["affectedSummary"]["acceptedCumulativeWork"][name]),
            baseline.checked_add(actual).unwrap()
        );
        assert_eq!(
            result["affectedSummary"]["acceptedCumulativeWork"],
            serde_json::to_value(
                rt.session(result["nextReceipt"].as_str().unwrap())
                    .accepted_work
            )
            .unwrap()
        );
    }
}

#[test]
fn cumulative_zero_creation_and_two_successes_sum_every_actual_field() {
    use super::command_work::FIELD_NAMES;
    let mut rt = Runtime::default();
    let created = create(&mut rt, &fixture("AB"));
    for name in FIELD_NAMES {
        assert_eq!(cumulative(&created["acceptedCumulativeWork"][name]), 0);
    }
    let mut receipt = created["receipt"].as_str().unwrap().to_string();
    let mut totals = [0u128; super::command_work::FIELD_COUNT];
    for revision in 0..2 {
        let input = json!({"receipt":receipt,"expectedRevision":revision,"startOffset":2+revision,
            "endOffset":2+revision,"replacementText":"C","anchorSpanId":"span-1","composition":"committed"}).to_string();
        let wire = rt.apply(&input);
        let result: Value = serde_json::from_str(&wire).unwrap();
        assert_eq!(result["status"], "Accepted");
        assert_eq!(
            result["affectedSummary"]["work"]["abiOutputBytes"],
            wire.len()
        );
        for (i, name) in FIELD_NAMES.iter().enumerate() {
            totals[i] = totals[i]
                .checked_add(u128::from(
                    result["affectedSummary"]["work"][name].as_u64().unwrap(),
                ))
                .unwrap();
            assert_eq!(
                cumulative(&result["affectedSummary"]["acceptedCumulativeWork"][name]),
                totals[i],
                "{name}"
            );
        }
        receipt = result["nextReceipt"].as_str().unwrap().to_string();
        assert_eq!(rt.session(&receipt).accepted_work.0, totals);
    }
    for input in [
        "{}",
        "{",
        r#"{"receipt":"absent","expectedRevision":0,"startOffset":0,"endOffset":0,"replacementText":"X","anchorSpanId":"span-1","composition":"committed"}"#,
    ] {
        let rejected: Value = serde_json::from_str(&rt.apply(input)).unwrap();
        assert!(rejected["affectedSummary"]["acceptedCumulativeWork"].is_null());
        assert!(rejected["affectedSummary"]["work"]["commandParseCalls"].is_u64());
    }
}

#[test]
fn cumulative_cached_height_matches_independent_oracle_after_every_small_tree_prune() {
    use super::{
        ledger::Work,
        model::Span,
        tree::{Tree, TreeWork},
    };
    for n in 0..=64 {
        let mut tree = Tree::build(
            (0..n)
                .map(|i| Span {
                origin: None,
                    span_id: format!("s{i}"),
                    start_offset: i,
                    end_offset: i + 1,
                    language: None,
                    style_key: None,
                })
                .collect(),
            &mut Work::default(),
        );
        for remaining in (0..=n).rev() {
            let actual = tree.recursive_stats();
            assert_eq!(tree.stats(), actual);
            assert_eq!((tree.len, tree.height), (actual.node_count, actual.height));
            assert_eq!(actual.node_count, remaining);
            let (mut capacity, mut bound) = (1, 0);
            while capacity < remaining + 1 {
                capacity *= 2;
                bound += 2;
            }
            assert!(actual.height <= bound, "{n} -> {remaining}: {actual:?}");
            tree = tree.without_last(&mut TreeWork::default());
        }
    }
}

#[test]
fn cumulative_tail_pruning_publishes_current_height_but_retains_accepted_maxima() {
    let mut rt = Runtime::default();
    let created = create(&mut rt, &fixture("ABก"));
    let initial = rt.session(created["receipt"].as_str().unwrap()).structures;
    let result: Value = serde_json::from_str(
        &rt.apply(
            &json!({
                "receipt":created["receipt"],"expectedRevision":0,"startOffset":2,"endOffset":3,
                "replacementText":"","anchorSpanId":"span-1","composition":"committed"
            })
            .to_string(),
        ),
    )
    .unwrap();
    assert_eq!(result["status"], "Accepted");
    let next = rt.session(result["nextReceipt"].as_str().unwrap());
    for (old, current) in [
        (initial.current.source, next.structures.current.source),
        (initial.current.runs, next.structures.current.runs),
        (initial.current.shards, next.structures.current.shards),
    ] {
        assert_eq!((old.node_count, old.height), (2, 2));
        assert_eq!((current.node_count, current.height), (1, 1));
    }
    assert_eq!(next.structures.max, initial.max);
    assert_eq!(next.source.stats(), next.source.recursive_stats());
    assert_eq!(next.spans.stats(), next.spans.recursive_stats());
    assert_eq!(next.runs.stats(), next.runs.recursive_stats());
    assert_eq!(next.shards.stats(), next.shards.recursive_stats());
    assert_eq!(
        result["affectedSummary"]["structuralSnapshot"],
        serde_json::to_value(next.structures).unwrap()
    );
    let mut cold = Runtime::default();
    let oracle = create(&mut cold, &fixture("AB"));
    assert_eq!(
        retained_observable(next),
        retained_observable(cold.session(oracle["receipt"].as_str().unwrap()))
    );
}

#[test]
fn cumulative_injected_failure_preserves_nonzero_prior_ledger_and_all_payloads() {
    use super::{fault_tests::Snapshot, faults};
    let mut rt = Runtime::default();
    let created = create(&mut rt, &fixture("AB"));
    let first: Value = serde_json::from_str(
        &rt.apply(
            &json!({
                "receipt":created["receipt"],"expectedRevision":0,"startOffset":2,"endOffset":2,
                "replacementText":"C","anchorSpanId":"span-1","composition":"committed"
            })
            .to_string(),
        ),
    )
    .unwrap();
    assert_eq!(first["status"], "Accepted");
    let receipt = first["nextReceipt"].as_str().unwrap();
    let before = Snapshot::take(&rt, receipt);
    let armed: Value = serde_json::from_str(&faults::arm(
        &mut rt,
        &json!({
            "receipt":receipt,"expectedRevision":1,"point":"publication-refusal"
        })
        .to_string(),
    ))
    .unwrap();
    assert_eq!(armed["status"], "Armed");
    let command = json!({"receipt":receipt,"expectedRevision":1,"startOffset":3,"endOffset":3,
        "replacementText":"D","anchorSpanId":"span-1","composition":"committed"})
    .to_string();
    let rejected: Value = serde_json::from_str(&rt.apply(&command)).unwrap();
    assert_eq!(rejected["reason"], "publication-refused");
    assert_eq!(
        rejected["affectedSummary"]["acceptedCumulativeWork"],
        first["affectedSummary"]["acceptedCumulativeWork"]
    );
    before.assert_unchanged(&rt, receipt);
    let retry: Value = serde_json::from_str(&rt.apply(&command)).unwrap();
    assert_eq!(retry["nextRevision"], 2);
    assert_eq!(
        cumulative(&retry["affectedSummary"]["acceptedCumulativeWork"]["sourceFactsUtf16"]),
        50
    );
    assert_eq!(
        retry["affectedSummary"]["acceptedCumulativeWork"],
        serde_json::to_value(
            rt.session(retry["nextReceipt"].as_str().unwrap())
                .accepted_work
        )
        .unwrap()
    );
}

#[test]
fn admitted_paths_charge_actual_source_and_provider_operations() {
    // Independently hand-counted: replacement length scan, two byte searches,
    // two provider mapping scans/window, actual property visits, source copies/index.
    for (text, start, end, replacement, scan, properties, copies, index, lookups, provider) in [
        ("AB", 2, 2, "C", 15, 2, 7, 1, 2, 15),
        ("ABCDE", 4, 5, "", 28, 9, 9, 0, 7, 27),
        ("ABCDE", 2, 2, "X", 29, 6, 13, 1, 12, 33),
        ("ABCDE", 1, 3, "XY", 28, 10, 14, 2, 12, 30),
        ("ABCDE", 1, 3, "", 22, 8, 8, 0, 12, 24),
    ] {
        let mut rt = Runtime::default();
        let created = create(&mut rt, &fixture(text));
        let result: Value = serde_json::from_str(&rt.apply(&json!({"receipt":created["receipt"],"expectedRevision":0,
            "startOffset":start,"endOffset":end,"replacementText":replacement,"anchorSpanId":"span-1","composition":"committed"}).to_string())).unwrap();
        assert_eq!(result["status"], "Accepted", "{result}");
        let w = &result["affectedSummary"]["work"];
        assert_eq!(
            w["sourceFactsUtf16"],
            scan + properties + index + lookups,
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
        ("😀".to_string(), 6, 1, "uncertified-seam", 4),
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
fn previous_partial_run_tail_repair_requires_authentic_consonant_witness() {
    for (text, expected_status) in [
        (format!("{}A", "ภาษาไทย".repeat(30)), "Accepted"),
        (format!("{}A", "ก".repeat(300)), "Accepted"),
    ] {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture(&text));
        let receipt = c["receipt"].as_str().unwrap();
        let before = retained_observable(rt.session(receipt));
        let n = text.encode_utf16().count();
        let r: Value = serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":0,
            "startOffset":n-1,"endOffset":n,"replacementText":"","composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
        assert_eq!(r["status"], expected_status, "{r}");
        if expected_status == "NotAdmissible" {
            assert_eq!(r["reason"], "uncertified-seam");
            assert_eq!(retained_observable(rt.session(receipt)), before);
        } else {
            let mut oracle=Runtime::default();
            let cold=create(&mut oracle,&fixture(&text[..text.len()-1]));
            assert_eq!(retained_observable(rt.session(r["nextReceipt"].as_str().unwrap())),
                retained_observable(oracle.session(cold["receipt"].as_str().unwrap())));
        }
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
            ("AB", false, 2, 2, "C", 20, 2, 7, 15),
            ("ABCDE", false, 4, 5, "", 44, 9, 9, 27),
            ("ABCDE", true, 2, 2, "X", 48, 6, 13, 33),
            ("ABCDE", true, 1, 3, "XY", 52, 10, 14, 30),
            ("ABCDE", true, 1, 3, "", 42, 8, 8, 24),
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
                origin: None,
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
        Delta { units: 1, bytes: 1, runs: 0 },
        &mut TreeWork::default(),
    );
    let retained = shifted.payload(3);
    let mut work = TreeWork::default();
    let pruned = shifted.without_last(&mut work);
    assert_eq!(pruned.last().unwrap().end_offset, 5);
    assert!(std::sync::Arc::ptr_eq(&retained, &pruned.payload(3)));
    assert_eq!(work.shifted_subtrees, 1);
    assert_eq!(work.shared_subtrees, 6);
    assert_eq!(work.copies, 3);
    assert_eq!(work.visits, 2);
}
