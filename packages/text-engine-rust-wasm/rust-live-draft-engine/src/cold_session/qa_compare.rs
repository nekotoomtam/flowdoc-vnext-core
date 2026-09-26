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
    let mut source = String::new();
    let mut spans = Vec::new();
    let mut runs = Vec::new();
    let mut glyphs = Vec::new();
    let mut lines = Vec::new();
    let mut graphemes = Vec::new();
    let mut edges = Vec::new();
    for i in 0..s.spans.len {
        let span = s.spans.at(i, &mut w).unwrap().materialize(&mut w);
        // Only fresh implementation IDs are normalized through ordered origin
        // mapping. Source, properties, keys, facts and offsets remain exact.
        spans.push(json!({"spanId":span.origin.as_ref().map_or(span.span_id.as_str(),|o|o.span_id.as_str()),"startOffset":span.start_offset,"endOffset":span.end_offset,"language":span.language,"styleKey":span.style_key}));
    }
    for i in 0..s.runs.len {
        let run = s.runs.at(i, &mut w).unwrap().materialize(&mut w);
        runs.push(json!({"start":run.start,"end":run.end,"startByte":run.start_byte,"endByte":run.end_byte,"key":run.key,
    "spanIndexes":run.span_indexes.iter().map(|v|v-s.span_index_base).collect::<Vec<_>>() }));
    }
    for i in 0..s.shards.len {
        let shard = s.shards.at(i, &mut w).unwrap().materialize(&mut w);
        source.push_str(
            &s.source
                .window(shard.start_offset, shard.end_offset, &mut w)
                .unwrap(),
        );
        edges.push(json!({"start":shard.start_offset,"end":shard.end_offset,"runIndex":shard.run_index-s.run_index_base,"startSafe":shard.start_safe,"endSafe":shard.end_safe,"concatUnsafe":shard.concat_unsafe}));
        glyphs.extend(shard.glyphs);
        lines.extend(shard.line_breaks);
        graphemes.extend(shard.grapheme_boundaries);
    }
    lines.sort_unstable();
    lines.dedup();
    graphemes.sort_unstable();
    graphemes.dedup();
    json!({"source":source,"spans":spans,"runs":runs,"glyphs":glyphs,"lines":lines,"graphemes":graphemes,
  "edges":edges,"emptyState":if s.source.utf16()==0 {json!({"sourceUtf16":0,"spans":s.spans.len,"runs":s.runs.len,"shards":s.shards.len,"endpointBoundary":[0]})}else{Value::Null},
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
    json!({"status":if actual==reference && origins_equal{"Equal"}else{"Different"},"qaOnly":true,"comparisons":checks,"oracleColdWork":created["coldSummary"]}).to_string()
}
