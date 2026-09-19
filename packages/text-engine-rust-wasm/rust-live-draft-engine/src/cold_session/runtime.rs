use super::{
    derive,
    ledger::{Hex, Scope, Work},
    model::*,
    policy::{self, canonical, hash},
    tree::Tree,
};
use serde::Serialize;
use serde_json::{json, Value};
use std::collections::BTreeMap;

pub(super) struct Session {
    pub source: String,
    pub spans: Tree<Span>,
    pub runs: Tree<Run>,
    pub shards: Tree<Shard>,
    pub provider: Provider,
    pub paragraph: Paragraph,
    pub revision: u64,
}
#[derive(Default)]
pub(super) struct Runtime {
    sessions: BTreeMap<String, Session>,
}

#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct Summary {
    source_digest: String,
    descriptor_digest: String,
    facts_digest: String,
    policy_digest: String,
    source_utf16: usize,
    spans: usize,
    runs: usize,
    shards: usize,
    tree_height: usize,
    live_sessions: usize,
    work: Work,
    // Allocation counts cover Rust allocator activity, not host JS allocations.
    // All hexadecimal fields use 16 digits so final encoding is allocation-free.
    abi_input_bytes: Hex,
    abi_output_bytes: Hex,
    response_encoding_passes: Hex,
    response_encoded_bytes: Hex,
    allocation_calls: Hex,
    allocated_bytes: Hex,
    deallocation_calls: Hex,
    deallocated_bytes: Hex,
}
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Reply {
    status: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    reason: Option<&'static str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    receipt: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    revision: Option<u64>,
    cold_summary: Summary,
}

pub(super) fn descriptors(
    source: &str,
    spans: &[Span],
    runs: &[Run],
    work: &mut Work,
) -> Vec<Value> {
    runs.iter().enumerate().map(|(i, run)| {
        let properties = run.span_indexes.iter().map(|&index| {
            work.descriptor_span_visits += 1;
            let s = &spans[index]; json!({"spanId":s.span_id, "language":s.language, "styleKey":s.style_key})
        }).collect::<Vec<_>>();
        json!({"runId":format!("provider-run-{i}:{}-{}", run.start, run.end), "startOffset":run.start, "endOffset":run.end,
            "text":&source[run.start_byte..run.end_byte], "authoredSpanIds":run.span_indexes.iter().map(|&s| { work.descriptor_span_visits += 1; &spans[s].span_id }).collect::<Vec<_>>(),
            "authoredProperties":properties, "analysisKey":run.key})
    }).collect()
}

impl Runtime {
    pub fn live_count(&self) -> usize {
        self.sessions.len()
    }

    pub fn create(&mut self, input: &str) -> String {
        let scope = Scope::begin();
        let mut summary = Summary {
            abi_input_bytes: Hex(input.len() as u64),
            ..Summary::default()
        };
        let result = self.construct(input, &mut summary);
        let (status, reason, receipt, revision) = match result {
            Ok(receipt) => ("Created", None, Some(receipt), Some(0)),
            Err(reason) => ("NotCreated", Some(reason), None, None),
        };
        summary.live_sessions = self.live_count();
        let mut reply = Reply {
            status,
            reason,
            receipt,
            revision,
            cold_summary: summary,
        };
        let mut bytes = Vec::with_capacity(8192);
        serde_json::to_writer(&mut bytes, &reply).unwrap();
        let length = bytes.len();
        let allocations = scope.snapshot();
        let s = &mut reply.cold_summary;
        s.abi_output_bytes = Hex(length as u64);
        s.response_encoding_passes = Hex(2);
        s.response_encoded_bytes = Hex((2 * length) as u64);
        s.allocation_calls = Hex(allocations.alloc_calls);
        s.allocated_bytes = Hex(allocations.alloc_bytes);
        s.deallocation_calls = Hex(allocations.free_calls);
        s.deallocated_bytes = Hex(allocations.free_bytes);
        bytes.clear();
        serde_json::to_writer(&mut bytes, &reply).unwrap();
        assert_eq!(length, bytes.len());
        assert_eq!(scope.snapshot().alloc_calls, allocations.alloc_calls);
        // Raw/native counts stop here. The private QA adapter's outer transfer
        // window also includes metadata drops, ABI output lowering and buffer
        // frees, then replaces these fields with its complete frozen snapshot.
        drop(scope);
        String::from_utf8(bytes).unwrap()
    }

    fn construct(&mut self, input: &str, summary: &mut Summary) -> Result<String, &'static str> {
        if input.len() > 8 * 1024 * 1024 {
            return Err("input-limit");
        }
        let mut input: Input = serde_json::from_str(input).map_err(|_| "invalid-input")?;
        let work = &mut summary.work;
        policy::validate(&input.provider_context, work)?;
        let (source, spans, runs, shards) = derive::build(&mut input, work)?;
        summary.source_utf16 = work.source_input_utf16 as usize;
        summary.spans = spans.len();
        summary.runs = runs.len();
        summary.shards = shards.len();
        work.source_hash_bytes += source.len() as u64;
        summary.source_digest = hash(source.as_bytes());
        let descriptor_bytes = canonical(&descriptors(&source, &spans, &runs, work), work);
        work.descriptor_hash_bytes += descriptor_bytes.len() as u64;
        summary.descriptor_digest = hash(&descriptor_bytes);
        let fact_bytes = canonical(&shards, work);
        work.facts_hash_bytes += fact_bytes.len() as u64;
        summary.facts_digest = hash(&fact_bytes);
        summary.policy_digest = input.provider_context.policy_digest.clone();
        let mut entropy = [0u8; 32];
        getrandom::getrandom(&mut entropy).map_err(|_| "entropy-unavailable")?;
        work.receipt_random_bytes += 32;
        // Random capability, explicitly bound to policy, paragraph, source and
        // revision. Public transcript alone cannot calculate a valid receipt.
        let binding = canonical(
            &(
                entropy.as_slice(),
                &input.paragraph_context,
                &summary.policy_digest,
                &summary.source_digest,
                0u64,
            ),
            work,
        );
        work.receipt_hash_bytes += binding.len() as u64;
        let receipt = hash(&binding);
        if self.sessions.contains_key(&receipt) {
            return Err("receipt-collision");
        }
        let spans = Tree::build(spans, work);
        let runs = Tree::build(runs, work);
        let shards = Tree::build(shards, work);
        summary.tree_height = spans.height.max(runs.height).max(shards.height);
        // Single publication point, after all validation/provider/tree work.
        self.sessions.insert(
            receipt.clone(),
            Session {
                source,
                spans,
                runs,
                shards,
                provider: input.provider_context,
                paragraph: input.paragraph_context,
                revision: 0,
            },
        );
        Ok(receipt)
    }

    pub fn dispose(&mut self, receipt: &str) -> Value {
        match self.sessions.remove(receipt) {
            None => json!({"status":"UnknownReceipt"}),
            Some(session) => {
                let resources = session
                    .provider
                    .fonts
                    .iter()
                    .map(|f| f.bytes.len())
                    .sum::<usize>();
                let result = json!({"status":"Disposed", "disposalSummary":{
                    "releasedSourceBytes":session.source.len(), "releasedSpans":session.spans.len,
                    "releasedRuns":session.runs.len, "releasedShards":session.shards.len,
                    "releasedFontBytes":resources, "liveSessions":self.live_count()}});
                drop(session);
                result
            }
        }
    }

    #[cfg(test)]
    pub fn session(&self, receipt: &str) -> &Session {
        &self.sessions[receipt]
    }
}
