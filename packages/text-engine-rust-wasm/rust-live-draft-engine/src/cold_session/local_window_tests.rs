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
            assert_eq!(sums.len(), 95);
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

#[test]
fn analysis_transition_insert_before_neutral() {
    let text = "office AV ".repeat(30);
    let mut rt = Runtime::default();
    let c = create(&mut rt, &fixture(&text));
    let r = apply(&mut rt, c["receipt"].as_str().unwrap(), 0, 149, 149, "ก");
    assert_eq!(r["status"], "Accepted", "{r}");
    let expected = format!("{}ก{}", &text[..149], &text[149..]);
    let q: Value = serde_json::from_str(&qa_compare::verify(&rt, r["nextReceipt"].as_str().unwrap(), &fixture(&expected).to_string())).unwrap();
    assert_eq!(q["status"], "Equal", "{q}");
}


#[test]
fn analysis_transition_initial_seventy_five() {
    let mut failures=vec![];
    for (language,seed) in [("latin","office AV "),("thai","ภาษาไทย กิ้ "),("mixed","ภาษาไทย office AV กิ้ ")] {
        for size in [256,1024,2048,4096,8192] {
            for op in ["append","backspace","mid-insert","replacement","composition-update"] {
                let mut chars:Vec<_>=seed.chars().cycle().take(size-1).collect();chars.push(if op=="composition-update"{'ก'}else{'A'});
                let text:String=chars.iter().collect();
                let middle=(0..=size/2).rev().find(|i|chars[*i]==' ').unwrap();
                let (start,end,replacement)=match op {"append"=>(size,size,"ก"),"backspace"=>(size-1,size,""),"mid-insert"=>(middle,middle,"ก"),"replacement"=>(middle,middle+1,"ก"),_=>(size-1,size,"กำ")};
                let mut rt=Runtime::default();let c=create(&mut rt,&fixture(&text));
                let r=apply(&mut rt,c["receipt"].as_str().unwrap(),0,start,end,replacement);
                if r["status"]!="Accepted" {failures.push(format!("{language}/{size}/{op}: {} source={} property={} provider={}",r["reason"],r["affectedSummary"]["work"]["sourceFactsUtf16"],r["affectedSummary"]["work"]["propertyFactsUtf16"],r["affectedSummary"]["work"]["shapingSegmentationInputUtf16"]));continue}
                let expected=chars[..start].iter().collect::<String>()+replacement+&chars[end..].iter().collect::<String>();
                let q:Value=serde_json::from_str(&qa_compare::verify(&rt,r["nextReceipt"].as_str().unwrap(),&fixture(&expected).to_string())).unwrap();
                if q["status"]!="Equal"{failures.push(format!("{language}/{size}/{op}: {q}"))}
            }
        }
    }
    assert!(failures.is_empty(),"{}",failures.join("\n"));
}

#[test]
fn analysis_transition_committed_streams() {
    for seed in ["office AV ","ภาษาไทย กิ้ ","ภาษาไทย office AV กิ้ "] {
        let mut text=seed.repeat(40)+"A";
        let mut rt=Runtime::default();let c=create(&mut rt,&fixture(&text));
        let mut receipt=c["receipt"].as_str().unwrap().to_owned();
        let mut totals=std::collections::BTreeMap::<String,u128>::new();
        for revision in 0..16 {
            let chars:Vec<_>=text.chars().collect();let n=chars.len();
            let middle=(0..=n/2).rev().find(|i|chars[*i]==' ').unwrap();
            let (start,end,replacement)=match revision%8 {
                0=>(n,n,"ก"),1=>(n-1,n,""),
                2=>(middle,middle,"ก"),3=>(middle-1,middle,""),
                4=>(n-1,n,"ก"),5=>(n-1,n,"กำ"),6=>(n-2,n,"ก"),_=>(n-1,n,"A")
            };
            let r=apply(&mut rt,&receipt,revision,start,end,replacement);
            assert_eq!(r["status"],"Accepted","seed={seed}, rev={revision}, reason={} work={}",r["reason"],r["affectedSummary"]["work"]);
            text=chars[..start].iter().collect::<String>()+replacement+&chars[end..].iter().collect::<String>();
            receipt=r["nextReceipt"].as_str().unwrap().to_owned();
            let q:Value=serde_json::from_str(&qa_compare::verify(&rt,&receipt,&fixture(&text).to_string())).unwrap();
            assert_eq!(q["status"],"Equal","seed={seed} rev={revision}: {q}");
            for (k,v) in r["affectedSummary"]["acceptedCumulativeWork"].as_object().unwrap(){let total=totals.entry(k.clone()).or_default();*total+=r["affectedSummary"]["work"][k].as_u64().unwrap() as u128;assert_eq!(*total,u128::from_str_radix(v.as_str().unwrap(),16).unwrap())}
            assert_eq!(totals.len(),95);
        }
    }
}

#[test]
fn analysis_transition_arbitrary_offsets_and_budget_row() {
    for (text,start,end,replacement) in [
        ("  A ".to_owned()+&"office AV ".repeat(30),2,3,"ก"),
        ("office AV ".repeat(30),143,143,"ก"),
        ("office AV ".repeat(30),146,147,"ก"),
        ("ภาษาไทย กิ้ ".repeat(30),136,136,"A"),
        ("ภาษาไทย กิ้ ".repeat(30),136,137,"A"),
        ("ภาษาไทย office AV กิ้ ".chars().cycle().take(1023).collect::<String>()+"A",505,506,"ก"),
    ] {
        let chars:Vec<_>=text.chars().collect();
        let mut rt=Runtime::default();let c=create(&mut rt,&fixture(&text));
        let r=apply(&mut rt,c["receipt"].as_str().unwrap(),0,start,end,replacement);
        assert_eq!(r["status"],"Accepted","{start}/{end} {replacement}: {} {}",r["reason"],r["affectedSummary"]["work"]);
        let expected=chars[..start].iter().collect::<String>()+replacement+&chars[end..].iter().collect::<String>();
        let q:Value=serde_json::from_str(&qa_compare::verify(&rt,r["nextReceipt"].as_str().unwrap(),&fixture(&expected).to_string())).unwrap();assert_eq!(q["status"],"Equal","{q}");
    }
}

#[test]
fn analysis_transition_rejection_fault_and_fragmented_accounting() {
    for (text,start,end) in [("ก".repeat(300),150,150),("ภาษาไทย กิ้ ".repeat(30),129,130)] {
        let mut rt=Runtime::default();let c=create(&mut rt,&fixture(&text));let receipt=c["receipt"].as_str().unwrap();let before=Snapshot::take(&rt,receipt);
        let r=apply(&mut rt,receipt,0,start,end,"A");assert_eq!(r["status"],"NotAdmissible");before.assert_unchanged(&rt,receipt);
    }
    for point in ["cancel-before-provider","provider-failure","cancel-after-provider","receipt-entropy-failure","publication-refusal"] {
        let text="office AV ".repeat(30);let mut rt=Runtime::default();let c=create(&mut rt,&fixture(&text));let receipt=c["receipt"].as_str().unwrap();let before=Snapshot::take(&rt,receipt);
        let armed:Value=serde_json::from_str(&faults::arm(&mut rt,&json!({"receipt":receipt,"expectedRevision":0,"point":point}).to_string())).unwrap();assert_eq!(armed["status"],"Armed");
        let r=apply(&mut rt,receipt,0,149,149,"ก");assert_eq!(r["status"],"NotAdmissible");before.assert_unchanged(&rt,receipt);
        let r=apply(&mut rt,receipt,0,149,149,"ก");assert_eq!(r["status"],"Accepted");
    }
}


#[test]
fn analysis_transition_fragmented_source_budget() {
    use super::{source::Source,ledger::Work,tree::TreeWork};
    let text="ภาษาไทย office AV กิ้ ".repeat(40);
    let mut rt=Runtime::default();let c=create(&mut rt,&fixture(&text));let receipt=c["receipt"].as_str().unwrap();
    let mut source=Source::cold(String::new(),&[],&mut Work::default());
    for c in text.chars(){source=source.append(&c.to_string(),1,&mut TreeWork::default()).unwrap();}
    rt.sessions.get_mut(receipt).unwrap().source=source;
    let before=Snapshot::take(&rt,receipt);
    let r=apply(&mut rt,receipt,0,505,506,"ก");
    if r["status"]=="Accepted" {
        let chars:Vec<_>=text.chars().collect();let expected=chars[..505].iter().collect::<String>()+"ก"+&chars[506..].iter().collect::<String>();
        let q:Value=serde_json::from_str(&qa_compare::verify(&rt,r["nextReceipt"].as_str().unwrap(),&fixture(&expected).to_string())).unwrap();assert_eq!(q["status"],"Equal");
    }else{assert_eq!(r["reason"],"uncertified-seam");before.assert_unchanged(&rt,receipt);}
}
