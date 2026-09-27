// Full reconstruction exists ONLY in this private QA comparator. Neither live
// command calls it. Expected inputs are independently constructed immutable
// source/provider configuration; no caller facts enter the live session.
use super::{
    runtime::{Runtime, Session},
    tree::TreeWork,
};
use serde_json::{json, Value};
fn observed(s: &Session) -> Value {
    let mut w = TreeWork::default();
    let source = s.source.qa_text();
    let mut spans = Vec::new();
    let mut runs = Vec::new();
    let mut run_keys_valid = true;
    let mut glyphs = Vec::new();
    let mut lines = Vec::new();
    let mut graphemes = Vec::new();
    let mut edges = true;
    let mut shard_rows = Vec::new();
    let mut run_rows = Vec::new();
    let mut concat = Vec::new();
    for i in 0..s.spans.len {
        let span = s.spans.at(i, &mut w).unwrap().materialize(&mut w);
        // Only fresh implementation IDs are normalized through ordered origin
        // mapping. Source, properties, keys, facts and offsets remain exact.
        spans.push(json!({"spanId":span.origin.as_ref().map_or(span.span_id.as_str(),|o|o.span_id.as_str()),"startOffset":span.start_offset,"endOffset":span.end_offset,"language":span.language,"styleKey":span.style_key}));
    }
    for i in 0..s.runs.len {
        let at = s.runs.at(i, &mut w).unwrap();
        let raw = &at.value;
        run_keys_valid &= raw.key.provider_run_id
            == format!(
                "{}-{}-{}",
                raw.key.script.to_ascii_lowercase(),
                raw.start,
                raw.end
            );
        let run = at.materialize(&mut w);
        runs.push(json!({"start":run.start,"end":run.end,"startByte":run.start_byte,"endByte":run.end_byte,"key":run.key,
    "spanIndexes":run.span_indexes.iter().map(|v|v.checked_sub(s.span_index_base)).collect::<Vec<_>>() }));
        run_rows.push(run);
    }
    for i in 0..s.shards.len {
        let shard = s.shards.at(i, &mut w).unwrap().materialize(&mut w);
        concat.extend(shard.concat_unsafe.clone());
        shard_rows.push(shard.clone());
        glyphs.extend(shard.glyphs);
        lines.extend(shard.line_breaks);
        graphemes.extend(shard.grapheme_boundaries);
    }
    // Physical partition is not an oracle fact. Validate its integrity instead:
    // complete ordered coverage, authentic run membership, complete flag arrays,
    // and grapheme/cluster/unsafe-safe edges. Semantic arrays remain exact.
    let mut cursor = 0;
    for shard in &shard_rows {
        let run = shard
            .run_index
            .checked_sub(s.run_index_base)
            .and_then(|i| run_rows.get(i));
        edges &= shard.start_offset == cursor
            && shard.end_offset > cursor
            && shard.end_offset <= s.source.utf16()
            && run.is_some_and(|r| r.start <= shard.start_offset && shard.end_offset <= r.end)
            && shard.concat_unsafe.len() == shard.glyphs.len()
            && !shard.glyphs.is_empty()
            && shard
                .glyphs
                .iter()
                .all(|g| shard.start_offset <= g.cluster && g.cluster < shard.end_offset)
            && shard
                .glyphs
                .windows(2)
                .all(|v| v[0].cluster <= v[1].cluster)
            && shard.grapheme_boundaries.first() == Some(&shard.start_offset)
            && shard.grapheme_boundaries.last() == Some(&shard.end_offset)
            && shard.grapheme_boundaries.windows(2).all(|v| v[0] < v[1])
            && shard.line_breaks.windows(2).all(|v| v[0] < v[1])
            && shard
                .line_breaks
                .iter()
                .all(|p| shard.start_offset <= *p && *p <= shard.end_offset);
        for (edge, claimed) in [
            (shard.start_offset, shard.start_safe),
            (shard.end_offset, shard.end_safe),
        ] {
            let safe = run.is_some_and(|r| {
                edge == r.start
                    || edge == r.end
                    || (glyphs.iter().any(|g| g.cluster == edge)
                        && glyphs
                            .iter()
                            .filter(|g| g.cluster == edge)
                            .all(|g| !g.unsafe_to_break))
            }) && graphemes.contains(&edge);
            edges &= claimed && safe;
        }
        cursor = shard.end_offset;
    }
    edges &= cursor == s.source.utf16();
    lines.sort_unstable();
    lines.dedup();
    graphemes.sort_unstable();
    graphemes.dedup();
    json!({"source":source,"spans":spans,"runs":runs,"glyphs":glyphs,"lines":lines,"graphemes":graphemes,
  "edges":edges && run_keys_valid,"concatUnsafe":concat,"emptyState":if s.source.utf16()==0 {json!({"sourceUtf16":0,"spans":s.spans.len,"runs":s.runs.len,"shards":s.shards.len,"endpointBoundary":[0]})}else{Value::Null},
  "context":{"baseDirection":s.paragraph.base_direction,"writingMode":s.paragraph.writing_mode,"defaults":s.paragraph.defaults},
  "provider":{"id":s.provider.provider_id,"revision":s.provider.provider_revision,"policyDigest":s.provider.policy_digest,
  "resources":s.provider.fonts.iter().map(|f|(&f.resource_id,&f.digest)).collect::<Vec<_>>()}})
}
pub(super) fn verify(rt: &Runtime, receipt: &str, input: &str) -> String {
    let Some(session) = rt.sessions.get(receipt) else {
        return json!({"status":"UnknownReceipt","qaOnly":true}).to_string();
    };
    let request: Value = match serde_json::from_str(input) {
        Ok(v) => v,
        Err(_) => return json!({"status":"InvalidOracle","qaOnly":true}).to_string(),
    };
    let (configuration, origins) = if request.get("input").is_some() {
        (&request["input"], request.get("authoredOrigins"))
    } else {
        (&request, None)
    };
    let mut oracle = Runtime::default();
    let created: Value = serde_json::from_str(&oracle.create(&configuration.to_string())).unwrap();
    let Some(expected) = created["receipt"].as_str() else {
        return json!({"status":"InvalidOracle","qaOnly":true,"reason":created["reason"]})
            .to_string();
    };
    let actual = observed(session);
    let reference = observed(oracle.session_internal(expected));
    let mut origin_work = TreeWork::default();
    let expected_origins = origins.and_then(Value::as_array);
    let origins_equal = (expected_origins.is_none()
        || expected_origins.unwrap().len() == session.spans.len)
        && (0..session.spans.len).all(|i| {
            let span = session
                .spans
                .at(i, &mut origin_work)
                .unwrap()
                .materialize(&mut origin_work);
            let actual_origin = serde_json::to_value(&span.origin).unwrap();
            let expected_origin = expected_origins.map_or(&Value::Null, |v| &v[i]);
            &actual_origin == expected_origin
                && if span.origin.is_none() {
                    configuration["authoredSpans"][i]["spanId"] == span.span_id
                } else {
                    configuration["authoredSpans"][i]["spanId"]
                        == span.origin.as_ref().unwrap().span_id
                }
        });
    let mut checks = actual
        .as_object()
        .unwrap()
        .iter()
        .map(|(name, value)| (name.clone(), json!(reference[name] == *value)))
        .collect::<serde_json::Map<_, _>>();
    checks.insert("authoredOrigins".into(), json!(origins_equal));
    let valid_edges = actual["edges"] == true && reference["edges"] == true;
    checks.insert("edges".into(), json!(valid_edges));
    json!({"status":if actual==reference && origins_equal && valid_edges{"Equal"}else{"Different"},"qaOnly":true,"comparisons":checks,"oracleColdWork":created["coldSummary"]}).to_string()
}
#[cfg(test)]
mod foundation_tests {
    use super::*;
    use crate::cold_session::{
        ledger::Work,
        tests::{create, fixture},
        tree::Tree,
    };
    #[test]
    fn foundation_qa_accepts_repartition_and_rejects_corruption() {
        let mut rt = Runtime::default();
        let input = fixture("ABCD");
        let made = create(&mut rt, &input);
        let receipt = made["receipt"].as_str().unwrap();
        let mut w = TreeWork::default();
        let whole = rt
            .session(receipt)
            .shards
            .at(0, &mut w)
            .unwrap()
            .materialize(&mut w);
        let mut left = whole.clone();
        let mut right = whole.clone();
        left.end_offset = 2;
        right.start_offset = 2;
        let cut = whole.glyphs.partition_point(|g| g.cluster < 2);
        left.glyphs = whole.glyphs[..cut].to_vec();
        right.glyphs = whole.glyphs[cut..].to_vec();
        left.concat_unsafe = whole.concat_unsafe[..cut].to_vec();
        right.concat_unsafe = whole.concat_unsafe[cut..].to_vec();
        left.grapheme_boundaries.retain(|v| *v <= 2);
        right.grapheme_boundaries.retain(|v| *v >= 2);
        left.line_breaks.retain(|v| *v < 2);
        right.line_breaks.retain(|v| *v >= 2);
        rt.sessions.get_mut(receipt).unwrap().shards =
            Tree::build(vec![left.clone(), right.clone()], &mut Work::default());
        let verify = |rt: &Runtime| -> Value {
            serde_json::from_str(&super::verify(rt, receipt, &input.to_string())).unwrap()
        };
        assert_eq!(verify(&rt)["status"], "Equal");
        for corruption in 0..10 {
            let mut a = left.clone();
            let mut b = right.clone();
            match corruption {
                0 => b.start_offset = 3,
                1 => b.start_offset = 1,
                2 => b.run_index = 9,
                3 => a.end_safe = false,
                4 => a.glyphs[0].x_advance += 1,
                5 => a.concat_unsafe[0] = !a.concat_unsafe[0],
                6 => b.line_breaks.clear(),
                7 => {
                    a.grapheme_boundaries.remove(1);
                }
                8 => {
                    a.concat_unsafe.pop();
                }
                9 => {
                    b.glyphs[0].unsafe_to_break = true;
                }
                _ => unreachable!(),
            };
            rt.sessions.get_mut(receipt).unwrap().shards =
                Tree::build(vec![a, b], &mut Work::default());
            assert_eq!(
                verify(&rt)["status"],
                "Different",
                "corruption {corruption}"
            );
        }
    }
    #[test]
    fn foundation_qa_checks_absolute_child_rank_and_raw_provider_identity() {
        let mut rt = Runtime::default();
        let input = fixture("AB");
        let made = create(&mut rt, &input);
        let r = made["receipt"].as_str().unwrap();
        let verify = |rt: &Runtime| -> Value {
            serde_json::from_str(&super::verify(rt, r, &input.to_string())).unwrap()
        };
        let mut shard = rt.session(r).shards.payload(0).as_ref().clone();
        shard.run_index = 7;
        rt.sessions.get_mut(r).unwrap().run_index_base = 7;
        rt.sessions.get_mut(r).unwrap().shards =
            Tree::build(vec![shard.clone()], &mut Work::default());
        assert_eq!(verify(&rt)["status"], "Equal");
        shard.run_index = 6;
        rt.sessions.get_mut(r).unwrap().shards =
            Tree::build(vec![shard.clone()], &mut Work::default());
        assert_eq!(verify(&rt)["status"], "Different");
        shard.run_index = 7;
        rt.sessions.get_mut(r).unwrap().shards = Tree::build(vec![shard], &mut Work::default());
        let mut run = rt.session(r).runs.payload(0).as_ref().clone();
        run.key.provider_run_id = "forged-provider-run-id".into();
        rt.sessions.get_mut(r).unwrap().runs = Tree::build(vec![run], &mut Work::default());
        assert_eq!(verify(&rt)["status"], "Different");
    }
}
