use super::{
    fault_tests::Snapshot,
    faults, qa_compare,
    runtime::Runtime,
    tests::{create, fixture},
};

#[test]
fn local_window_failed_reservation_keeps_executed_replacement_scan() {
    let mut rt = Runtime::default();
    let created = create(&mut rt, &fixture(&"ภาษาไทย กิ้ ".repeat(30)));
    let session = rt.session(created["receipt"].as_str().unwrap());
    let mut w = super::tree::TreeWork::default();
    let run = session.runs.at(0, &mut w).unwrap().materialize(&mut w);
    let mut meter = super::command_work::Meter::default();
    meter.source_scan_utf16 = 240;
    let result = super::local_window::edit(session, &run, 0, 127, 127, "ก", &mut meter, &mut w);
    assert_eq!(result.err(), Some("budget-exhaustion"));
    // Eight left-search, five right-search and eight complete-guard scalars,
    // then one executed replacement-width scan. No subsequent scan/provider.
    assert_eq!(meter.source_scan_utf16, 262);
    assert_eq!(meter.replacement_scalars_decoded, 0);
    assert_eq!(meter.shaping_calls, 0);
    assert!(meter.source_scan_utf16 + w.source_offset_lookups <= 512);
}
use serde_json::{json, Value};
fn apply(
    rt: &mut Runtime,
    receipt: &str,
    revision: u64,
    start: usize,
    end: usize,
    replacement: &str,
) -> Value {
    let r:Value=serde_json::from_str(&rt.apply(&json!({"receipt":receipt,"expectedRevision":revision,"startOffset":start,"endOffset":end,"replacementText":replacement,"composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
    for (name, cap) in [
        ("sourceFactsUtf16", 512),
        ("propertyFactsUtf16", 512),
        ("shapingSegmentationInputUtf16", 1024),
    ] {
        assert!(
            r["affectedSummary"]["work"][name].as_u64().unwrap() <= cap,
            "{name}: {r}"
        );
    }
    r
}
#[test]
fn local_window_sequences_negatives_and_fault_retry() {
    for middle in [true, false] {
        let mut text = format!("{}ก", "ภาษาไทย กิ้ ".repeat(25));
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture(&text));
        let mut receipt = c["receipt"].as_str().unwrap().to_owned();
        let mut sums = std::collections::BTreeMap::<String, u128>::new();
        let middle_at = text
            .chars()
            .enumerate()
            .filter(|(i, c)| *i < 140 && *c == ' ')
            .last()
            .unwrap()
            .0;
        for revision in 0..12 {
            let chars: Vec<_> = text.chars().collect();
            let (start, end, replacement) = if middle {
                (
                    middle_at,
                    middle_at + (revision as usize % 2),
                    if revision % 2 == 0 { "ก" } else { "" },
                )
            } else {
                (
                    chars.len() - if text.ends_with("กำ") { 2 } else { 1 },
                    chars.len(),
                    if text.ends_with("กำ") {
                        "ก"
                    } else {
                        "กำ"
                    },
                )
            };
            let r = apply(&mut rt, &receipt, revision, start, end, replacement);
            assert_eq!(
                r["status"], "Accepted",
                "middle={middle} revision={revision}: {}",
                r["reason"]
            );
            text = chars[..start].iter().collect::<String>()
                + replacement
                + &chars[end..].iter().collect::<String>();
            receipt = r["nextReceipt"].as_str().unwrap().to_owned();
            let q: Value = serde_json::from_str(&qa_compare::verify(
                &rt,
                &receipt,
                &fixture(&text).to_string(),
            ))
            .unwrap();
            assert_eq!(q["status"], "Equal", "{q}");
            for (k, total) in r["affectedSummary"]["acceptedCumulativeWork"]
                .as_object()
                .unwrap()
            {
                let sum = sums.entry(k.clone()).or_default();
                *sum += r["affectedSummary"]["work"][k].as_u64().unwrap() as u128;
                assert_eq!(
                    *sum,
                    u128::from_str_radix(total.as_str().unwrap(), 16).unwrap()
                );
            }
            assert_eq!(sums.len(), 92);
        }
    }
    let negative = [
        ("ก".repeat(300), 150, 150, "ข"),
        (
            format!("{} {}", "ก".repeat(150), "ข".repeat(150)),
            150,
            151,
            "",
        ),
        ("กิ้ ".repeat(80), 160, 160, "ก"),
        ("ภาษาไทย กิ้ ".repeat(30), 129, 130, "ก"),
    ];
    for (text, start, end, replacement) in negative {
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture(&text));
        assert_eq!(c["status"], "Created");
        let receipt = c["receipt"].as_str().unwrap();
        let before = Snapshot::take(&rt, receipt);
        let r = apply(&mut rt, receipt, 0, start, end, replacement);
        assert_eq!(r["status"], "NotAdmissible");
        before.assert_unchanged(&rt, receipt);
    }
    for point in [
        "cancel-before-provider",
        "provider-failure",
        "cancel-after-provider",
        "receipt-entropy-failure",
        "publication-refusal",
    ] {
        let text = "ภาษาไทย กิ้ ".repeat(30);
        let start = 127;
        let mut rt = Runtime::default();
        let c = create(&mut rt, &fixture(&text));
        let receipt = c["receipt"].as_str().unwrap();
        let before = Snapshot::take(&rt, receipt);
        let armed: Value = serde_json::from_str(&faults::arm(
            &mut rt,
            &json!({"receipt":receipt,"expectedRevision":0,"point":point}).to_string(),
        ))
        .unwrap();
        assert_eq!(armed["status"], "Armed");
        let rejected = apply(&mut rt, receipt, 0, start, start, "ก");
        assert_eq!(rejected["status"], "NotAdmissible");
        before.assert_unchanged(&rt, receipt);
        let accepted = apply(&mut rt, receipt, 0, start, start, "ก");
        assert_eq!(
            accepted["status"], "Accepted",
            "{point}: {}",
            accepted["reason"]
        );
    }
}
