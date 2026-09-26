use super::{
    command_work::FIELD_NAMES,
    runtime::Runtime,
    structural,
    tests::{create, fixture, retained_observable},
};
use serde_json::{json, Value};
fn invoke(rt: &mut Runtime, c: Value) -> Value {
    serde_json::from_str(&structural::apply(rt, &c.to_string())).unwrap()
}
fn enter(rt: &mut Runtime, r: &str, c: usize) -> Value {
    invoke(
        rt,
        json!({"operation":"enter","receipt":r,"expectedRevision":0,"caretOffset":c,"composition":"committed"}),
    )
}
fn join(rt: &mut Runtime, l: &str, r: &str) -> Value {
    invoke(
        rt,
        json!({"operation":"join","receipt":l,"expectedRevision":0,"rightReceipt":r,"rightRevision":0,"composition":"committed"}),
    )
}
fn normalize(rt: &Runtime, r: &str) -> Value {
    let s = rt.session(r);
    let mut v = retained_observable(s);
    for (i, span) in v["spans"].as_array_mut().unwrap().iter_mut().enumerate() {
        span.as_object_mut().unwrap().remove("origin");
        span["spanId"] = json!(format!("span-{i}"));
    }
    for run in v["runs"].as_array_mut().unwrap() {
        for i in run["spanIndexes"].as_array_mut().unwrap() {
            *i = json!(i.as_u64().unwrap() - s.span_index_base as u64);
        }
    }
    v
}
fn oracle(text: &str) -> (Runtime, String) {
    let mut rt = Runtime::default();
    let mut f = fixture(text);
    if text.is_empty() {
        f["authoredSpans"] = json!([]);
    }
    let o = create(&mut rt, &f);
    assert_eq!(o["status"], "Created");
    (rt, o["receipt"].as_str().unwrap().into())
}
#[test]
fn structural_provider_oracle_matrix_and_exact_inverse() {
    for text in ["AB", "กA", "office", ""] {
        let mut cuts = vec![0, text.encode_utf16().count()];
        if !text.is_empty() {
            cuts.push(if text == "office" { 3 } else { 1 });
        }
        cuts.sort();
        cuts.dedup();
        for c in cuts {
            let (mut rt, parent) = oracle(text);
            let before = normalize(&rt, &parent);
            let split = enter(&mut rt, &parent, c);
            assert_eq!(split["status"], "Accepted", "{text}:{c} {split}");
            let l = split["receipts"][0].as_str().unwrap().to_owned();
            let r = split["receipts"][1].as_str().unwrap().to_owned();
            let byte = text
                .char_indices()
                .map(|(b, _)| b)
                .chain(std::iter::once(text.len()))
                .find(|b| text[..*b].encode_utf16().count() == c)
                .unwrap();
            for (receipt, part) in [(&l, &text[..byte]), (&r, &text[byte..])] {
                let (o, or) = oracle(part);
                assert_eq!(
                    normalize(&rt, receipt),
                    normalize(&o, &or),
                    "child {text}:{c}"
                );
            }
            for name in ["sourceFactsUtf16", "propertyFactsUtf16"] {
                assert!(split["affectedSummary"]["work"][name].as_u64().unwrap() <= 512);
            }
            assert!(
                split["affectedSummary"]["work"]["shapingSegmentationInputUtf16"]
                    .as_u64()
                    .unwrap()
                    <= 1024
            );
            let joined = join(&mut rt, &l, &r);
            assert_eq!(joined["status"], "Accepted", "{joined}");
            assert_eq!(
                normalize(&rt, joined["receipts"][0].as_str().unwrap()),
                before
            );
            for name in FIELD_NAMES {
                let e = u128::from_str_radix(
                    split["affectedSummary"]["acceptedCumulativeWork"][name]
                        .as_str()
                        .unwrap(),
                    16,
                )
                .unwrap();
                let j = joined["affectedSummary"]["work"][name].as_u64().unwrap() as u128;
                assert_eq!(
                    u128::from_str_radix(
                        joined["affectedSummary"]["acceptedCumulativeWork"][name]
                            .as_str()
                            .unwrap(),
                        16
                    )
                    .unwrap(),
                    e + j
                );
            }
            assert_eq!(rt.live_count(), 1);
        }
    }
}
#[test]
fn structural_rejects_reversed_and_replayed_siblings() {
    let (mut rt, parent) = oracle("AB");
    let split = enter(&mut rt, &parent, 1);
    assert_eq!(split["status"], "Accepted", "{split}");
    let l = split["receipts"][0].as_str().unwrap();
    let r = split["receipts"][1].as_str().unwrap();
    assert_eq!(join(&mut rt, r, l)["reason"], "not-unchanged-siblings");
    assert_eq!(join(&mut rt, l, l)["reason"], "not-unchanged-siblings");
    assert_eq!(enter(&mut rt, &parent, 1)["reason"], "unknown-receipt");
    assert_eq!(rt.live_count(), 2);
    assert_eq!(join(&mut rt, l, r)["status"], "Accepted");
    assert_eq!(join(&mut rt, l, r)["reason"], "unknown-receipt");
}
#[test]
fn structural_small_seam_inside_long_unchanged_outer_runs() {
    let texts = ["ก".repeat(300), "office".into(), "ข".repeat(300)];
    let mut rt = Runtime::default();
    let f = super::tests::span_fixture(&texts.iter().map(String::as_str).collect::<Vec<_>>());
    let o = create(&mut rt, &f);
    let p = o["receipt"].as_str().unwrap();
    let outer_left = rt.session(p).shards.payload(0);
    let last = rt.session(p).shards.len - 1;
    let outer_right = rt.session(p).shards.payload(last);
    let split = enter(&mut rt, p, 303);
    assert_eq!(split["status"], "Accepted", "{split}");
    let l = split["receipts"][0].as_str().unwrap();
    let r = split["receipts"][1].as_str().unwrap();
    assert!(std::sync::Arc::ptr_eq(
        &outer_left,
        &rt.session(l).shards.payload(0)
    ));
    assert!(std::sync::Arc::ptr_eq(
        &outer_right,
        &rt.session(r).shards.payload(rt.session(r).shards.len - 1)
    ));
    for (receipt, parts) in [
        (l, vec![texts[0].as_str(), "off"]),
        (r, vec!["ice", texts[2].as_str()]),
    ] {
        let mut reference = Runtime::default();
        let expected = create(&mut reference, &super::tests::span_fixture(&parts));
        assert_eq!(
            normalize(&rt, receipt),
            normalize(&reference, expected["receipt"].as_str().unwrap())
        );
    }
    assert!(
        split["affectedSummary"]["work"]["sourceFactsUtf16"]
            .as_u64()
            .unwrap()
            < 100
    );
    assert_eq!(split["affectedSummary"]["work"]["wholeParagraphScans"], 0);
    assert_eq!(split["affectedSummary"]["work"]["unboundedSuffixWork"], 0);
    assert_eq!(join(&mut rt, l, r)["status"], "Accepted");
}
#[test]
fn structural_fault_checkpoints_leave_both_children_unpublished() {
    for point in [
        "stage5-after-left",
        "stage5-after-right",
        "stage5-after-receipts",
        "stage5-after-output",
        "stage5-after-ledger",
    ] {
        let (mut rt, parent) = oracle("office");
        let before = normalize(&rt, &parent);
        let armed = super::faults::arm(
            &mut rt,
            &json!({"receipt":parent,"expectedRevision":0,"point":point}).to_string(),
        );
        assert_eq!(
            serde_json::from_str::<Value>(&armed).unwrap()["status"],
            "Armed",
            "{armed}"
        );
        let failed = enter(&mut rt, &parent, 3);
        assert_eq!(failed["status"], "NotAdmissible", "{point}: {failed}");
        assert_eq!(rt.live_count(), 1);
        assert_eq!(normalize(&rt, &parent), before);
        assert_eq!(failed["affectedSummary"]["work"]["faultsConsumed"], 1);
        assert!(rt.session(&parent).accepted_work.0.iter().all(|v| *v == 0));
        assert_eq!(enter(&mut rt, &parent, 3)["status"], "Accepted");
    }
}
#[test]
fn structural_origin_defaults_and_input_meaning_are_preserved() {
    let mut rt = Runtime::default();
    let mut f = fixture("office");
    f["authoredSpans"][0]
        .as_object_mut()
        .unwrap()
        .remove("language");
    let defaults = json!({"version":"document-v1","language":null,"styleKey":"inherited-body"});
    f["paragraphContext"]["defaults"] = json!({"version":"document-v1","styleKey":"inherited-body","digest":super::policy::hash(&super::policy::canonical(&defaults,&mut Default::default()))});
    let o = create(&mut rt, &f);
    assert_eq!(o["status"], "Created", "{o}");
    let p = o["receipt"].as_str().unwrap();
    let split = enter(&mut rt, p, 3);
    assert_eq!(split["status"], "Accepted", "{split}");
    for (i, range) in [(0, (0, 3)), (1, (3, 6))] {
        let child = rt.session(split["receipts"][i].as_str().unwrap());
        let span = child.spans.payload(0);
        assert!(span.language.is_none());
        assert_eq!(span.style_key.as_deref(), Some("body"));
        let origin = span.origin.as_ref().unwrap();
        assert_eq!(origin.span_id, "span-1");
        assert_eq!((origin.start_offset, origin.end_offset), range);
        assert_eq!(
            child
                .paragraph
                .defaults
                .as_ref()
                .unwrap()
                .style_key
                .as_deref(),
            Some("inherited-body")
        );
    }
    // Explicit document metadata does not invent a cascade for absent styleKey.
    f["authoredSpans"][0]
        .as_object_mut()
        .unwrap()
        .remove("styleKey");
    assert_eq!(create(&mut rt, &f)["reason"], "invalid-authored-spans");
    f["paragraphContext"]["defaults"]["digest"] = json!("forged");
    assert_eq!(create(&mut rt, &f)["reason"], "invalid-paragraph-defaults");
}
#[test]
fn structural_rejected_attempts_and_ordinary_mutation_preserve_shared_accounting() {
    let (mut rt, parent) = oracle("AB");
    let family = rt.session(&parent).lifecycle.clone();
    let split = enter(&mut rt, &parent, 1);
    let l = split["receipts"][0].as_str().unwrap().to_owned();
    let r = split["receipts"][1].as_str().unwrap().to_owned();
    assert!(std::rc::Rc::ptr_eq(
        &rt.session(&l).lifecycle,
        &rt.session(&r).lifecycle
    ));
    assert_eq!(family.borrow().accepted_events, 1);
    let rejected = invoke(
        &mut rt,
        json!({"operation":"enter","receipt":l,"expectedRevision":0,"caretOffset":0,"composition":"active"}),
    );
    assert_eq!(rejected["reason"], "composition-active");
    assert_eq!(family.borrow().rejected_attempts, 1);
    let anchor = rt.session(&l).spans.payload(0).span_id.clone();
    let changed:Value=serde_json::from_str(&rt.apply(&json!({"receipt":l,"expectedRevision":0,"startOffset":1,"endOffset":1,"replacementText":"C","composition":"committed","anchorSpanId":anchor}).to_string())).unwrap();
    assert_eq!(changed["status"], "Accepted", "{changed}");
    assert_eq!(
        changed["affectedSummary"]["structuralWork"]["lineageScalarWrites"],
        109
    );
    let next = changed["nextReceipt"].as_str().unwrap();
    assert_eq!(
        invoke(
            &mut rt,
            json!({"operation":"join","receipt":next,"expectedRevision":1,"rightReceipt":r,"rightRevision":0,"composition":"committed"})
        )["reason"],
        "not-unchanged-siblings"
    );
    assert_eq!(family.borrow().accepted_events, 2);
}
#[test]
fn structural_disposal_counts_once_and_preserves_surviving_ancestry() {
    let (mut rt, parent) = oracle("AB");
    let family = rt.session(&parent).lifecycle.clone();
    let split = enter(&mut rt, &parent, 1);
    let l = split["receipts"][0].as_str().unwrap();
    let r = split["receipts"][1].as_str().unwrap();
    let prior = rt.session(r).accepted_work;
    let disposed: Value = serde_json::from_str(&structural::dispose(&mut rt, l)).unwrap();
    assert_eq!(disposed["status"], "Disposed");
    assert_eq!(rt.session(r).accepted_work, prior);
    assert!(rt.session(r).sibling.is_none());
    assert_eq!(family.borrow().disposals, 1);
    assert_eq!(
        disposed["affectedSummary"]["structuralWork"]["lineageScalarWrites"],
        101
    );
    assert_eq!(join(&mut rt, l, r)["reason"], "unknown-receipt");
    assert_eq!(family.borrow().accepted_events, 1);
    assert_eq!(rt.live_count(), 1);
    assert!(family.borrow().attempts.0.iter().sum::<u128>() > prior.0.iter().sum::<u128>());
    let final_dispose: Value = serde_json::from_str(&structural::dispose(&mut rt, r)).unwrap();
    assert_eq!(final_dispose["status"], "Disposed");
    assert_eq!(family.borrow().disposals, 2);
    assert_eq!(rt.live_count(), 0);
}
#[test]
fn structural_no_accepted_child_may_depend_on_a_removed_strong_script() {
    let (mut rt, parent) = oracle(" A");
    let split = enter(&mut rt, &parent, 1);
    assert_eq!(split["reason"], "uncertified-seam", "{split}");
    assert_eq!(rt.live_count(), 1);
}
#[test]
fn structural_every_accepted_contextual_child_matches_complete_provider() {
    for text in [
        "AกขB",
        "A B",
        "AB ก",
        "กขคA",
        "Aกขค",
        "กAก",
        "AกA",
        "officeก",
        "กoffice",
        "A ก",
        "ก A",
    ] {
        for caret in 1..text.encode_utf16().count() {
            let (mut rt, parent) = oracle(text);
            let split = enter(&mut rt, &parent, caret);
            if split["status"] != "Accepted" {
                continue;
            }
            let byte = text
                .char_indices()
                .map(|(b, _)| b)
                .find(|b| text[..*b].encode_utf16().count() == caret)
                .unwrap();
            for (i, part) in [&text[..byte], &text[byte..]].into_iter().enumerate() {
                let (o, r) = oracle(part);
                assert_eq!(
                    normalize(&rt, split["receipts"][i].as_str().unwrap()),
                    normalize(&o, &r),
                    "{text}:{caret} side {i}"
                );
            }
        }
    }
}

#[test]
fn structural_qa_detects_origin_context_and_edge_tampering() {
    let (mut rt, parent) = oracle("office");
    let binding = rt.session(&parent).source_binding.clone();
    let split = enter(&mut rt, &parent, 3);
    let l = split["receipts"][0].as_str().unwrap();
    let expected = json!({"input":fixture("off"),"authoredOrigins":[{"spanId":"span-1","sourceBinding":binding,"startOffset":0,"endOffset":3}]});
    let verify = |rt: &Runtime, v: &Value| -> Value {
        serde_json::from_str(&super::qa_compare::verify(rt, l, &v.to_string())).unwrap()
    };
    assert_eq!(verify(&rt, &expected)["status"], "Equal");
    for key in ["spanId", "sourceBinding", "startOffset", "endOffset"] {
        let mut wrong = expected.clone();
        wrong["authoredOrigins"][0][key] = if key.ends_with("Offset") {
            json!(99)
        } else {
            json!("wrong")
        };
        assert_eq!(verify(&rt, &wrong)["comparisons"]["authoredOrigins"], false);
    }
    let mut wrong = expected.clone();
    wrong["input"]["authoredSpans"][0]["language"] = json!("th");
    assert_ne!(verify(&rt, &wrong)["status"], "Equal");
    let mut w = super::tree::TreeWork::default();
    let mut shard = rt.session(l).shards.payload(0).as_ref().clone();
    shard.start_safe = !shard.start_safe;
    rt.sessions.get_mut(l).unwrap().shards =
        rt.session(l)
            .shards
            .replace_and_shift(0, shard, Default::default(), &mut w);
    assert_eq!(verify(&rt, &expected)["comparisons"]["edges"], false);
}
#[test]
fn structural_nested_enter_invalidates_old_inverse_and_join_faults_are_atomic() {
    let (mut rt, parent) = oracle("office");
    let split = enter(&mut rt, &parent, 3);
    let l = split["receipts"][0].as_str().unwrap();
    let r = split["receipts"][1].as_str().unwrap();
    for point in [
        "stage5-after-left",
        "stage5-after-right",
        "stage5-after-receipts",
        "stage5-after-output",
        "stage5-after-ledger",
    ] {
        super::faults::arm(
            &mut rt,
            &json!({"receipt":l,"expectedRevision":0,"point":point}).to_string(),
        );
        let before_l = normalize(&rt, l);
        let before_r = normalize(&rt, r);
        let rejected = join(&mut rt, l, r);
        assert_eq!(rejected["reason"], "cancelled");
        assert_eq!(normalize(&rt, l), before_l);
        assert_eq!(normalize(&rt, r), before_r);
        assert_eq!(rt.live_count(), 2);
    }
    let nested = enter(&mut rt, l, 0);
    assert_eq!(nested["status"], "Accepted");
    assert_eq!(join(&mut rt, l, r)["reason"], "unknown-receipt");
    assert_eq!(
        join(&mut rt, nested["receipts"][0].as_str().unwrap(), r)["reason"],
        "not-unchanged-siblings"
    );
}
#[test]
fn structural_unique_lineage_sums_repeated_events_and_separate_join_facts() {
    let (mut rt, mut parent) = oracle("office");
    let family = rt.session(&parent).lifecycle.clone();
    let cold = family.borrow().cold_id.clone();
    let mut sum = [0u128; 92];
    let mut extra = [0u128; 8];
    for _ in 0..3 {
        let split = enter(&mut rt, &parent, 3);
        let l = split["receipts"][0].as_str().unwrap();
        let r = split["receipts"][1].as_str().unwrap();
        let rejected = join(&mut rt, r, l);
        let joined = join(&mut rt, l, r);
        assert_eq!(joined["status"], "Accepted");
        let cert = &joined["affectedSummary"]["certificate"];
        assert_eq!(cert["direction"], "join");
        assert_ne!(
            cert["beforeChildFactDigests"],
            cert["afterJoinedFactDigests"]
        );
        for output in [&split, &rejected, &joined] {
            for (i, name) in FIELD_NAMES.iter().enumerate() {
                sum[i] += output["affectedSummary"]["work"][name].as_u64().unwrap() as u128;
            }
            for (i, name) in super::structural_work::NAMES.iter().enumerate() {
                extra[i] += output["affectedSummary"]["structuralWork"][name]
                    .as_u64()
                    .unwrap() as u128;
            }
        }
        for output in [&split, &joined] {
            let receipt = output["receipts"][0].as_str().unwrap();
            // Split children are consumed by join; their wire baseline must
            // still equal the prior accepted baseline plus this event once.
            for (i, name) in super::structural_work::NAMES.iter().enumerate() {
                let wire = u128::from_str_radix(
                    output["affectedSummary"]["acceptedStructuralWork"][name]
                        .as_str()
                        .unwrap(),
                    16,
                )
                .unwrap();
                if output["affectedSummary"]["certificate"]["direction"] == "join" {
                    assert_eq!(wire, rt.session(receipt).structural_accepted.0[i]);
                }
                let split_total = u128::from_str_radix(
                    split["affectedSummary"]["acceptedStructuralWork"][name]
                        .as_str()
                        .unwrap(),
                    16,
                )
                .unwrap();
                if output["affectedSummary"]["certificate"]["direction"] == "join" {
                    assert_eq!(
                        wire,
                        split_total
                            + joined["affectedSummary"]["structuralWork"][name]
                                .as_u64()
                                .unwrap() as u128
                    );
                }
                assert_eq!(
                    rejected["affectedSummary"]["acceptedStructuralWork"][name],
                    split["affectedSummary"]["acceptedStructuralWork"][name]
                );
            }
        }
        assert_eq!(family.borrow().attempts.0, sum);
        assert_eq!(family.borrow().structural_attempts.0, extra);
        assert_eq!(family.borrow().cold_id, cold);
        parent = joined["receipts"][0].as_str().unwrap().into();
    }
    assert_eq!(family.borrow().accepted_events, 6);
    assert_eq!(family.borrow().rejected_attempts, 3);
}
#[test]
fn structural_uncertified_context_and_overflow_are_unchanged() {
    for (text, caret, reason) in [
        ("AกขB", 2, "uncertified-seam"),
        (" A", 1, "uncertified-seam"),
        (
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
            20,
            "budget-exhaustion",
        ),
    ] {
        let (mut rt, parent) = oracle(text);
        let before = normalize(&rt, &parent);
        assert_eq!(enter(&mut rt, &parent, caret)["reason"], reason);
        assert_eq!(normalize(&rt, &parent), before);
        assert_eq!(rt.live_count(), 1);
    }
    let (mut rt, parent) = oracle("AB");
    rt.sessions.get_mut(&parent).unwrap().accepted_work.0[FIELD_NAMES
        .iter()
        .position(|name| *name == "commandParseCalls")
        .unwrap()] = u128::MAX;
    let before = normalize(&rt, &parent);
    assert_eq!(
        enter(&mut rt, &parent, 1)["reason"],
        "cumulative-work-overflow"
    );
    assert_eq!(normalize(&rt, &parent), before);
}

#[test]
fn structural_lifecycle_exhaustion_is_reported_without_publication_or_panic() {
    for field in 0..4 {
        let (mut rt, parent) = oracle("AB");
        let family = rt.session(&parent).lifecycle.clone();
        match field {
            0 => {
                family.borrow_mut().attempts.0[FIELD_NAMES
                    .iter()
                    .position(|n| *n == "commandParseCalls")
                    .unwrap()] = u128::MAX
            }
            1 => family.borrow_mut().structural_attempts.0[0] = u128::MAX,
            2 => family.borrow_mut().disposals = u64::MAX,
            _ => family.borrow_mut().rejected_attempts = u64::MAX,
        }
        let before = normalize(&rt, &parent);
        let frozen = family.borrow().attempts;
        let rejected = enter(&mut rt, &parent, 1);
        assert_eq!(rejected["reason"], "lifecycle-overflow");
        assert_eq!(
            rejected["affectedSummary"]["attemptAccounting"],
            "reported-not-accumulated-overflow"
        );
        assert_eq!(rejected["affectedSummary"]["work"]["commandParseCalls"], 1);
        let ordinary:Value=serde_json::from_str(&rt.apply(&json!({"receipt":parent,"expectedRevision":0,"startOffset":1,"endOffset":1,"replacementText":"C","composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
        assert_eq!(ordinary["reason"], "lifecycle-overflow");
        assert_eq!(
            ordinary["affectedSummary"]["attemptAccounting"],
            "reported-not-accumulated-overflow"
        );
        let disposed: Value = serde_json::from_str(&structural::dispose(&mut rt, &parent)).unwrap();
        assert_eq!(disposed["status"], "NotDisposed");
        assert_eq!(
            disposed["affectedSummary"]["attemptAccounting"],
            "reported-not-accumulated-overflow"
        );
        assert_eq!(normalize(&rt, &parent), before);
        assert_eq!(rt.live_count(), 1);
        assert_eq!(family.borrow().attempts, frozen);
    }
}
