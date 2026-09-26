// Private Stage 5. Certificates are generated from Rust-owned facts and never
// accepted from the caller. No source, provider facts or mutable trees escape.
use super::{
    command_work::{AcceptedWork, Meter, PreparedReply},
    commands,
    faults::Point,
    ledger::{Scope, Work},
    model::*,
    policy::{canonical, hash},
    position::{Delta, Positioned},
    runtime::{Runtime, Session},
    structure::Structures,
    tree::{Tree, TreeWork},
};
use serde::Deserialize;
use serde_json::{json, Value};
use std::sync::Arc;

pub(super) struct Split {
    parent: Session,
    caret: usize,
    left: String,
    right: String,
    event: String,
}
#[derive(Deserialize)]
#[serde(tag = "operation", rename_all = "kebab-case", deny_unknown_fields)]
enum Command {
    #[serde(rename_all = "camelCase")]
    Enter {
        receipt: String,
        expected_revision: u64,
        caret_offset: usize,
        composition: String,
    },
    #[serde(rename_all = "camelCase")]
    Join {
        receipt: String,
        expected_revision: u64,
        right_receipt: String,
        right_revision: u64,
        composition: String,
    },
}
impl Command {
    fn anchor(&self) -> (&str, u64, &str) {
        match self {
            Self::Enter {
                receipt,
                expected_revision,
                composition,
                ..
            }
            | Self::Join {
                receipt,
                expected_revision,
                composition,
                ..
            } => (receipt, *expected_revision, composition),
        }
    }
}
struct Candidate {
    remove: Vec<String>,
    insert: Vec<(String, Session)>,
    certificate: Value,
    event: String,
}
fn identity(m: &mut Meter) -> Result<String, &'static str> {
    let mut bytes = [0u8; 32];
    getrandom::getrandom(&mut bytes).map_err(|_| "entropy-unavailable")?;
    m.receipt_random_bytes += 32;
    m.hash_calls += 1;
    m.hash_input_bytes += 32;
    Ok(hash(&bytes))
}
fn binding<T: serde::Serialize>(value: &T, m: &mut Meter) -> String {
    let mut w = Work::default();
    let bytes = canonical(value, &mut w);
    m.canonical_value_passes += w.canonical_value_passes;
    m.canonical_json_passes += w.canonical_json_passes;
    m.canonical_encoded_bytes += w.canonical_encoded_bytes;
    m.hash_calls += 1;
    m.hash_input_bytes += bytes.len() as u64;
    hash(&bytes)
}
fn clone_session(s: &Session, m: &mut Meter) -> Session {
    m.structural.session_record_clones += 1;
    m.payload_copy_calls += 1;
    m.payload_elements_copied += 1 + 91 + 8;
    m.payload_string_bytes_copied += (s.source_binding.len()
        + s.last_event.len()
        + s.paragraph.paragraph_id.len()
        + s.paragraph.base_direction.len()
        + s.paragraph.writing_mode.len()) as u64;
    if let Some(d) = &s.paragraph.defaults {
        m.payload_string_bytes_copied += (d.version.len()
            + d.digest.len()
            + d.language.as_ref().map_or(0, String::len)
            + d.style_key.as_ref().map_or(0, String::len))
            as u64;
    }
    s.clone()
}
fn clone_payload<T: Positioned>(v: &T, w: &mut TreeWork) -> T {
    w.payload_copy_calls += 1;
    w.payload_elements_copied += v.copy_elements() as u64;
    w.payload_string_bytes_copied += v.copy_string_bytes() as u64;
    w.payload_vector_bytes_copied += v.copy_vector_bytes() as u64;
    v.clone()
}
fn structures(s: &mut Session) -> Result<(), &'static str> {
    s.structures = s.structures.next(Structures {
        source: s.source.stats(),
        spans: s.spans.stats(),
        runs: s.runs.stats(),
        shards: s.shards.stats(),
    })?;
    Ok(())
}
fn span_parts(
    s: &Session,
    c: usize,
    event: &str,
    delta: Delta,
    w: &mut TreeWork,
) -> Result<(Tree<Span>, Tree<Span>, usize), &'static str> {
    let n = s.source.utf16();
    if c == 0 {
        return Ok((s.spans.slice(0, 0, Delta::default(), w), s.spans.clone(), 0));
    }
    if c == n {
        return Ok((
            s.spans.clone(),
            s.spans.slice(0, 0, Delta::default(), w),
            s.spans.len,
        ));
    }
    let at = s.spans.containing(c, w).ok_or("missing-anchor")?;
    let p = at.materialize(w);
    if c == p.start_offset {
        return Ok((
            s.spans.slice(0, at.index, Delta::default(), w),
            s.spans.slice(at.index, s.spans.len, delta, w),
            at.index,
        ));
    }
    let mut left = clone_payload(&p, w);
    let mut right = clone_payload(&p, w);
    let origin = p.origin.clone().unwrap_or(SpanOrigin {
        span_id: p.span_id.clone(),
        source_binding: s.source_binding.clone(),
        start_offset: p.start_offset,
        end_offset: p.end_offset,
    });
    let cut = origin.start_offset + c - p.start_offset;
    left.origin = Some(SpanOrigin {
        end_offset: cut,
        ..origin.clone()
    });
    right.origin = Some(SpanOrigin {
        start_offset: cut,
        ..origin
    });
    left.span_id = format!("{}:L", event);
    right.span_id = format!("{}:R", event);
    left.end_offset = c;
    right.start_offset = c;
    Ok((
        s.spans
            .replace_and_shift(at.index, left, Delta::default(), w)
            .slice(0, at.index + 1, Delta::default(), w),
        s.spans
            .replace_and_shift(at.index, right, Delta::default(), w)
            .slice(at.index, s.spans.len, delta, w),
        at.index,
    ))
}
fn same_glyphs(a: &Shard, b: &Shard, m: &mut Meter) -> bool {
    a.glyphs.len() == b.glyphs.len()
        && a.glyphs.iter().zip(&b.glyphs).all(|(x, y)| {
            m.fact_comparisons += 1;
            x == y
        })
        && {
            m.fact_comparisons +=
                (a.grapheme_boundaries.len() + a.concat_unsafe.len() + a.line_breaks.len()) as u64;
            a.grapheme_boundaries == b.grapheme_boundaries
                && a.concat_unsafe == b.concat_unsafe
                && a.line_breaks
                    .iter()
                    .copied()
                    .filter(|v| {
                        (*v != a.start_offset && *v != a.end_offset) || b.line_breaks.contains(v)
                    })
                    .collect::<Vec<_>>()
                    == b.line_breaks
        }
}
fn endpoint_certificate(
    s: &Session,
    c: usize,
    direction: &str,
    m: &mut Meter,
    w: &mut TreeWork,
) -> Result<Value, &'static str> {
    let n = s.source.utf16();
    m.boundary_comparisons += 2;
    m.structural.endpoint_validations += 2;
    m.structural.context_rebinds += 1;
    let context = binding(
        &(
            &s.source_binding,
            &s.paragraph,
            &s.provider.provider_id,
            &s.provider.provider_revision,
            &s.provider.policy_digest,
        ),
        m,
    );
    let mut side = |is_left: bool| -> Result<Value, &'static str> {
        let empty = if is_left { c == 0 } else { c == n };
        let authored_edge = if s.spans.len == 0 {
            None
        } else {
            let rank = if c == 0 { 0 } else { s.spans.len - 1 };
            m.ownership_span_visits += 1;
            Some(s.spans.at(rank, w).unwrap().materialize(w))
        };
        let origin = json!({"authoredEdge":authored_edge,"parentParagraphId":s.paragraph.paragraph_id,"parentRevision":s.revision,"caretOffset":c,"side":if is_left{"left"}else{"right"}});
        if empty {
            return Ok(
                json!({"kind":"empty","runKey":null,"range":[c,c],"origin":origin,"defaults":s.paragraph.defaults,
            "beforeFacts":[],"afterFacts":[],"endpointBoundary":[0],"validity":"true-source-endpoint","contextBinding":context}),
            );
        }
        let rank = if is_left { s.runs.len - 1 } else { 0 };
        let run = s.runs.at(rank, w).ok_or("missing-anchor")?.materialize(w);
        m.context_run_visits += 1;
        let shard_rank = if is_left { s.shards.len - 1 } else { 0 };
        let shard = s.shards.at(shard_rank, w).ok_or("missing-anchor")?;
        let a = shard.delta.unit(shard.value.start_offset);
        let b = shard.delta.unit(shard.value.end_offset);
        let span_rank = if is_left { s.spans.len - 1 } else { 0 };
        let span = s.spans.at(span_rank, w).unwrap().materialize(w);
        m.ownership_span_visits += 1;
        // This names the authenticated immutable retained payload, not a new
        // digest obtained by traversing its glyphs. The exact same payload is
        // shared with the child; paragraph identity is not a shaping input.
        let facts = json!({"sourceBinding":s.source_binding,"shardRank":shard_rank,"contextBinding":context,"provenance":"validated-cold-or-accepted-provider-facts"});
        Ok(
            json!({"kind":"nonempty","runKey":run.key,"range":[a,b],"origin":origin,"authoredEdge":span,
            "beforeFacts":facts,"afterFacts":facts,"outsideRangeValidity":{"ranges":[[0,a],[b,n]],"proof":"identical-retained-subtrees-and-source","contextBinding":context}}),
        )
    };
    Ok(
        json!({"variant":"endpoint","direction":direction,"left":side(true)?,"right":side(false)?,
        "providerBinding":{"providerId":s.provider.provider_id,"providerRevision":s.provider.provider_revision,"policyDigest":s.provider.policy_digest},
        "paragraphContext":s.paragraph,"contextBinding":context}),
    )
}
fn certify_join(
    parent: &Session,
    left: &Session,
    right: &Session,
    c: usize,
    m: &mut Meter,
    w: &mut TreeWork,
) -> Result<Value, &'static str> {
    let n = parent.source.utf16();
    if c == 0 || c == n {
        return endpoint_certificate(parent, c, "join", m, w);
    }
    let first = parent.runs.containing(c - 1, w).ok_or("missing-anchor")?;
    let last = parent.runs.containing(c, w).ok_or("missing-anchor")?;
    let a = first.delta.unit(first.value.start);
    let b = last.delta.unit(last.value.end);
    if b - a > 32 {
        return Err("budget-exhaustion");
    }
    let mut before = Vec::new();
    let mut after = Vec::new();
    // Child-before facts are independently shaped in their child-local context.
    for (child, at) in [(left, left.source.utf16() - 1), (right, 0)] {
        let run = child
            .runs
            .containing(at, w)
            .ok_or("missing-anchor")?
            .materialize(w);
        let shard = child
            .shards
            .containing(at, w)
            .ok_or("missing-anchor")?
            .materialize(w);
        let text = child.source.window(run.start, run.end, w)?;
        m.property_scan_utf16 += (run.end - run.start) as u64;
        let measured = commands::facts(&text, run.start, &run, &child.provider, m, false)?;
        if !same_glyphs(&measured, &shard, m) {
            return Err("uncertified-seam");
        }
        before.push(binding(&(&run.key, &measured), m));
    }
    // Joined-after facts are generated from the original source and analysis
    // context, not concatenated from the two child glyph sequences.
    for rank in first.index..=last.index {
        let run = parent.runs.at(rank, w).unwrap().materialize(w);
        let shard = parent
            .shards
            .containing(run.start, w)
            .ok_or("missing-anchor")?
            .materialize(w);
        let text = parent.source.window(run.start, run.end, w)?;
        m.property_scan_utf16 += (run.end - run.start) as u64;
        let measured = commands::facts(&text, run.start, &run, &parent.provider, m, false)?;
        if !same_glyphs(&measured, &shard, m) {
            return Err("uncertified-seam");
        }
        after.push(binding(&(&run.key, &measured), m));
    }
    Ok(
        json!({"variant":"interior","direction":"join","ranges":[[a,c],[c,b]],"beforeChildFactDigests":before,"afterJoinedFactDigests":after,
        "outsideRangeValidity":{"proof":"exact-unchanged-siblings-retain-parent-source-and-context","ranges":[[0,a],[b,n]]}}),
    )
}
fn repair(
    s: &Session,
    c: usize,
    byte: usize,
    left: &mut Session,
    right: &mut Session,
    m: &mut Meter,
    w: &mut TreeWork,
) -> Result<Value, &'static str> {
    let n = s.source.utf16();
    // Endpoint rebind has identical source, policy, verified resources and
    // provider context. Immutable fact subtrees are the before/after witness.
    // ICU's [0] zero-input boundary is metadata, not a source-covering shard.
    if c == 0 || c == n {
        return endpoint_certificate(s, c, "enter", m, w);
    }
    let delta = Delta {
        units: -(c as isize),
        bytes: -(byte as isize),
    };
    let right_at = s.runs.containing(c, w).ok_or("missing-anchor")?;
    let right_run = right_at.materialize(w);
    let left_at = s.runs.containing(c - 1, w).ok_or("missing-anchor")?;
    let left_run = left_at.materialize(w);
    let first = left_at.index;
    let last = right_at.index;
    if last - first > 1 {
        return Err("uncertified-seam");
    }
    // ICU dictionary/word status may cross an analysis-run boundary. Only an
    // ASCII-AL interior run has the retained outside-line witness in this
    // profile. Other scripts require the entire bounded seam context; never
    // claim an unchanged outer break merely because the style/script changed.
    let outside = left_run.start > 0 || right_run.end < n;
    if outside && (first != last || left_run.key.script != "Latin") {
        return Err("uncertified-seam");
    }
    // ICU 2.2.0 line.rs: line_handle_complex_language_utf8 stops at
    // the first non-SA scalar; AL/AL is Keep (LB28). Require actual Thai
    // consonants (SA), not merely a Thai run key, at each retained boundary.
    // Removing the far end of a nonempty AL sequence preserves those exact
    // dictionary inputs and boundary properties; no CM/ZWJ/numeric lookahead
    // or removed SA context is admitted. Shaping remains run-owned and each
    // retained edge fact is authenticated below against the provider.
    let mut outside_edges = Vec::new();
    if outside {
        for at in [
            left_run.start.checked_sub(1),
            if right_run.end < n {
                Some(right_run.end)
            } else {
                None
            },
        ]
        .into_iter()
        .flatten()
        {
            let neighbor = s.source.window(at, at + 1, w)?;
            m.property_scan_utf16 += 1;
            m.property_scalar_visits += 1;
            if !neighbor
                .chars()
                .all(|ch| ('\u{0e01}'..='\u{0e2e}').contains(&ch))
            {
                return Err("uncertified-seam");
            }
            outside_edges.push(json!({"offset":at,"scalar":neighbor,"lineClass":"SA","dictionaryInput":"unchanged-contiguous-SA","adjacentClassBefore":"AL","adjacentClassAfter":"AL"}));
        }
    }
    let inspected = right_run.end - left_run.start;
    // Reserve all repeated source, property and provider reads before touching
    // the seam. A long analysis context is rejected, never reconstructed.
    if inspected > 32 {
        return Err("budget-exhaustion");
    }
    let mut left_runs = s.runs.clone();
    let mut right_runs = s.runs.clone();
    let mut left_shards = s.shards.clone();
    let mut right_shards = s.shards.clone();
    let mut left_shard_end = 0;
    let mut right_shard_start = 0;
    let mut keys = Vec::new();
    let mut before_facts = Vec::new();
    let mut after_facts = Vec::new();
    for index in first..=last {
        let run = s.runs.at(index, w).unwrap().materialize(w);
        let shard_at = s.shards.containing(run.start, w).ok_or("missing-anchor")?;
        let shard = shard_at.materialize(w);
        if shard.start_offset != run.start || shard.end_offset != run.end {
            return Err("uncertified-seam");
        }
        let text = s.source.window(run.start, run.end, w)?;
        if outside {
            m.property_scan_utf16 += (run.end - run.start) as u64;
            if !text.chars().all(|ch| {
                m.property_scalar_visits += 1;
                ch.is_ascii_alphabetic()
            }) {
                return Err("uncertified-seam");
            }
        }
        m.property_scan_utf16 += (run.end - run.start) as u64;
        let before = commands::facts(&text, run.start, &run, &s.provider, m, false)?;
        if !same_glyphs(&before, &shard, m) {
            return Err("uncertified-seam");
        }
        if c > run.start && c < run.end && !before.grapheme_boundaries.contains(&c) {
            return Err("uncertified-boundary");
        }
        before_facts.push(binding(&(&run.key, &before), m));
        keys.push(run.key.clone());
        let mut cut = 0;
        let mut units = run.start;
        for (b, ch) in text.char_indices() {
            m.source_scan_utf16 += ch.len_utf16() as u64;
            if units == c {
                cut = b;
                break;
            }
            units += ch.len_utf16();
            cut = b + ch.len_utf8();
        }
        if run.start < c && c < run.end && units != c {
            return Err("unsafe-surrogate-pair");
        }
        for is_left in [true, false] {
            let a = if is_left { run.start } else { run.start.max(c) };
            let b = if is_left { run.end.min(c) } else { run.end };
            if a >= b {
                continue;
            }
            let part = if c <= run.start || c >= run.end {
                text.as_str()
            } else if is_left {
                &text[..cut]
            } else {
                &text[cut..]
            };
            // Revalidate the bounded child portion under the existing named
            // script-attachment policy; a removed future strong scalar cannot
            // lend its script to an all-neutral new paragraph.
            use unicode_script::UnicodeScript;
            let mut strong = false;
            for ch in part.chars() {
                m.property_scalar_visits += 1;
                m.property_scan_utf16 += ch.len_utf16() as u64;
                strong |= ch.script().full_name() == run.key.script;
            }
            if !strong {
                return Err("uncertified-seam");
            }
            // A newly leading Common/Inherited scalar can change script attachment.
            // The profile does not infer a replacement run key for that case.
            if !is_left && a == c {
                m.property_scalar_visits += 1;
                m.property_scan_utf16 += part.chars().next().unwrap().len_utf16() as u64;
                if part.chars().next().unwrap().script().full_name() != run.key.script {
                    return Err("uncertified-seam");
                }
            }
            let mut next = clone_payload(&run, w);
            next.start = a;
            next.end = b;
            next.start_byte = if a == run.start { run.start_byte } else { byte };
            next.end_byte = if b == run.end { run.end_byte } else { byte };
            next.key.provider_run_id =
                format!("{}-{}-{}", next.key.script.to_ascii_lowercase(), a, b);
            m.provider_run_id_encoding_passes += 1;
            m.provider_run_id_encoded_bytes += next.key.provider_run_id.len() as u64;
            // Only the repaired run's authored membership is sliced. Other
            // runs keep their immutable membership array and session base.
            if next.span_indexes.len() > 32 {
                return Err("budget-exhaustion");
            }
            next.span_indexes = next
                .span_indexes
                .iter()
                .copied()
                .filter(|i| {
                    m.ownership_span_visits += 1;
                    if is_left {
                        *i < s.span_index_base + left.spans.len
                    } else {
                        *i >= right.span_index_base
                    }
                })
                .collect::<Vec<_>>()
                .into();
            let mut after = commands::facts(part, a, &next, &s.provider, m, false)?;
            after.run_index = shard.run_index;
            let child_start = if is_left { 0 } else { c };
            if a != child_start && !shard.line_breaks.contains(&a) {
                after.line_breaks.retain(|v| *v != a);
            }
            after_facts.push(binding(&(&next.key, &after), m));
            if is_left {
                left_runs = left_runs.replace_and_shift(index, next, Delta::default(), w);
                left_shards =
                    left_shards.replace_and_shift(shard_at.index, after, Delta::default(), w);
                left_shard_end = shard_at.index + 1;
            } else {
                // A nonterminal run's endpoint is a source boundary, not the
                // paragraph sentinel. Preserve its proved outside membership.
                if run.end < n && !shard.line_breaks.contains(&run.end) {
                    after.line_breaks.retain(|v| *v != run.end);
                }
                right_runs = right_runs.replace_and_shift(index, next, Delta::default(), w);
                right_shards =
                    right_shards.replace_and_shift(shard_at.index, after, Delta::default(), w);
                right_shard_start = shard_at.index;
            }
        }
    }
    left.runs = left_runs.slice(0, first + 1, Delta::default(), w);
    right.runs = right_runs.slice(last, s.runs.len, delta, w);
    left.shards = left_shards.slice(0, left_shard_end, Delta::default(), w);
    right.shards = right_shards.slice(right_shard_start, s.shards.len, delta, w);
    right.run_index_base = s.run_index_base + last;
    let context = binding(
        &(
            &s.source_binding,
            &s.paragraph,
            &s.provider.provider_id,
            &s.provider.provider_revision,
            &s.provider.policy_digest,
        ),
        m,
    );
    Ok(
        json!({"variant":"interior","direction":"enter","ranges":[[left_run.start,c],[c,right_run.end]],"runKeys":keys,
        "beforeParentFactDigests":before_facts,"afterChildFactDigests":after_facts,"contextBinding":context,
        "outsideRangeValidity":{"ranges":[[0,left_run.start],[right_run.end,n]],"inspectedEdges":outside_edges,
        "proof":if outside {"icu-2.2-SA-dictionary-input-identical-AL-boundary-state-preserved"}else{"no-source-outside-repaired-context"}}}),
    )
}
fn enter_parts(
    s: &Session,
    c: usize,
    event: &str,
    m: &mut Meter,
    w: &mut TreeWork,
    faults: &mut super::faults::Controls,
    receipt: &str,
) -> Result<(Session, Session, Value), &'static str> {
    let n = s.source.utf16();
    if c > n {
        return Err("invalid-caret");
    }
    // Source splitting is limited to one retained piece; its index lookup also
    // checks surrogate safety before any provider or mutation work.
    m.structural.source_partitions += 1;
    let (a, b, byte) = s.source.split(c, w)?;
    let delta = Delta {
        units: -(c as isize),
        bytes: -(byte as isize),
    };
    let (spans_a, spans_b, span_base) = span_parts(s, c, event, delta, w)?;
    let mut left = clone_session(s, m);
    let mut right = clone_session(s, m);
    left.sibling = None;
    right.sibling = None;
    left.source = a;
    right.source = b;
    left.spans = spans_a;
    right.spans = spans_b;
    right.span_index_base = s.span_index_base + span_base;
    if c == 0 {
        left.runs = s.runs.slice(0, 0, Delta::default(), w);
        left.shards = s.shards.slice(0, 0, Delta::default(), w);
    }
    if c == n {
        right.runs = s.runs.slice(0, 0, Delta::default(), w);
        right.shards = s.shards.slice(0, 0, Delta::default(), w);
    }
    let certificate = repair(s, c, byte, &mut left, &mut right, m, w)?;
    left.paragraph.paragraph_id = format!("{}:L", event);
    right.paragraph.paragraph_id = format!("{}:R", event);
    left.revision = 0;
    right.revision = 0;
    left.last_event = event.into();
    right.last_event = event.into();
    left.source_binding = binding(&(&s.source_binding, event, c, "left", &left.paragraph), m);
    right.source_binding = binding(&(&s.source_binding, event, c, "right", &right.paragraph), m);
    structures(&mut left)?;
    m.structural.child_candidates += 1;
    faults.checkpoint(
        receipt,
        s.revision,
        Point::Stage5AfterLeft,
        &mut m.fault_work,
    )?;
    structures(&mut right)?;
    m.structural.child_candidates += 1;
    faults.checkpoint(
        receipt,
        s.revision,
        Point::Stage5AfterRight,
        &mut m.fault_work,
    )?;
    Ok((left, right, certificate))
}
fn plan(
    rt: &mut Runtime,
    c: &Command,
    m: &mut Meter,
    w: &mut TreeWork,
) -> Result<Candidate, &'static str> {
    let (receipt, revision, composition) = c.anchor();
    let s = rt.sessions.get(receipt).ok_or("unknown-receipt")?;
    if s.revision != revision {
        return Err("stale-revision");
    }
    if composition != "committed" {
        return Err("composition-active");
    }
    match c {
        Command::Enter { caret_offset, .. } => {
            let event = identity(m)?;
            let l = identity(m)?;
            let r = identity(m)?;
            rt.faults.checkpoint(
                receipt,
                revision,
                Point::Stage5AfterReceipts,
                &mut m.fault_work,
            )?;
            let (mut left, mut right, certificate) =
                enter_parts(s, *caret_offset, &event, m, w, &mut rt.faults, receipt)?;
            let mut parent = clone_session(s, m);
            parent.sibling = None;
            let split = Arc::new(Split {
                parent,
                caret: *caret_offset,
                left: l.clone(),
                right: r.clone(),
                event: event.clone(),
            });
            left.sibling = Some((split.clone(), true));
            right.sibling = Some((split, false));
            Ok(Candidate {
                remove: vec![receipt.into()],
                insert: vec![(l, left), (r, right)],
                certificate,
                event,
            })
        }
        Command::Join {
            right_receipt,
            right_revision,
            ..
        } => {
            let other = rt.sessions.get(right_receipt).ok_or("unknown-receipt")?;
            if other.revision != *right_revision {
                return Err("stale-revision");
            }
            let (split, side) = s.sibling.as_ref().ok_or("not-unchanged-siblings")?;
            let (other_split, other_side) =
                other.sibling.as_ref().ok_or("not-unchanged-siblings")?;
            m.context_run_visits += 2;
            m.boundary_comparisons += 8;
            m.structural.lineage_identity_checks += 8;
            if !*side
                || *other_side
                || !Arc::ptr_eq(split, other_split)
                || split.left != receipt
                || split.right != *right_receipt
                || revision != 0
                || *right_revision != 0
                || s.accepted_work != other.accepted_work
                || s.last_event != split.event
                || other.last_event != split.event
            {
                return Err("not-unchanged-siblings");
            }
            let event = identity(m)?;
            let next = identity(m)?;
            rt.faults.checkpoint(
                receipt,
                revision,
                Point::Stage5AfterReceipts,
                &mut m.fault_work,
            )?;
            // Re-execute the reverse direction's provider witness against the
            // immutable original source. Never concatenate child glyphs.
            let mut certificate = certify_join(&split.parent, s, other, split.caret, m, w)?;
            certificate["direction"] = json!("join");
            certificate["splitEvent"] = json!(split.event);
            m.structural.inverse_candidates += 1;
            let mut joined = clone_session(&split.parent, m);
            joined.sibling = None;
            joined.revision = 0;
            joined.paragraph.paragraph_id = event.clone();
            joined.last_event = event.clone();
            joined.accepted_work = s.accepted_work;
            rt.faults
                .checkpoint(receipt, revision, Point::Stage5AfterLeft, &mut m.fault_work)?;
            rt.faults.checkpoint(
                receipt,
                revision,
                Point::Stage5AfterRight,
                &mut m.fault_work,
            )?;
            joined.source_binding = binding(
                &(
                    &s.source_binding,
                    &other.source_binding,
                    &event,
                    &joined.paragraph,
                ),
                m,
            );
            Ok(Candidate {
                remove: vec![receipt.into(), right_receipt.clone()],
                insert: vec![(next, joined)],
                certificate,
                event,
            })
        }
    }
}
fn tree_meter(m: &mut Meter, w: &TreeWork) {
    m.tree_node_visits = w.visits;
    m.tree_path_copies = w.copies;
    m.shared_subtrees = w.shared_subtrees;
    m.lazy_shifted_subtrees = w.shifted_subtrees;
    m.payload_copy_calls += w.payload_copy_calls;
    m.payload_elements_copied += w.payload_elements_copied;
    m.payload_string_bytes_copied += w.payload_string_bytes_copied;
    m.payload_vector_bytes_copied += w.payload_vector_bytes_copied;
    m.position_rewrites = w.position_rewrites;
    m.provider_run_id_encoding_passes += w.provider_run_id_encoding_passes;
    m.provider_run_id_encoded_bytes += w.provider_run_id_encoded_bytes;
    m.source_copy_bytes += w.source_copy_bytes;
    m.source_copied_utf16 += w.source_copied_utf16;
    m.source_copy_calls += w.source_copy_calls;
    m.source_index_utf16 = w.source_index_utf16;
    m.source_offset_lookups = w.source_offset_lookups;
    m.source_facts_utf16 = m.source_scan_utf16
        + m.source_index_utf16
        + m.source_offset_lookups
        + m.property_scan_utf16;
    m.property_facts_utf16 = m.property_scan_utf16;
}
fn response(
    result: &Result<Candidate, &'static str>,
    prior: Option<AcceptedWork>,
    lifetime: Option<AcceptedWork>,
    structural_prior: super::structural_work::Totals,
    m: &mut Meter,
) -> Value {
    m.response_value_passes += 1;
    m.structural.lineage_scalar_writes = (result.as_ref().map_or(0, |p| p.insert.len()) * 99
        + if lifetime.is_some() { 100 } else { 0 }) as u64;
    match result {
        Ok(p) => {
            json!({"status":"Accepted","receipts":p.insert.iter().map(|(r,_)|r).collect::<Vec<_>>(),"revision":0,"coldConstructionId":p.insert[0].1.lifecycle.borrow().cold_id,
            "affectedSummary":{"work":m,"acceptedCumulativeWork":prior,"lifecycleCumulativeWork":lifetime,"structuralWork":m.structural,"acceptedStructuralWork":structural_prior.total(&m.structural),"eventId":p.event,"certificate":p.certificate}})
        }
        Err(reason) => {
            json!({"status":"NotAdmissible","reason":reason,"affectedSummary":{"work":m,"acceptedCumulativeWork":prior,"lifecycleCumulativeWork":lifetime,"structuralWork":m.structural,"acceptedStructuralWork":structural_prior}})
        }
    }
}
pub(super) fn apply(rt: &mut Runtime, input: &str) -> String {
    #[cfg(test)]
    super::accounting_tests::PUBLICATION_PROBE.with(|p| p.set(Default::default()));
    let scope = Scope::begin();
    let mut m = Meter::default();
    let mut w = TreeWork::default();
    m.abi_input_bytes = input.len() as u64;
    m.command_parse_calls = 1;
    let command = serde_json::from_str::<Command>(input);
    let life = command
        .as_ref()
        .ok()
        .and_then(|c| rt.sessions.get(c.anchor().0))
        .map(|s| s.lifecycle.clone());
    let structural_prior = command
        .as_ref()
        .ok()
        .and_then(|c| rt.sessions.get(c.anchor().0))
        .map_or(Default::default(), |s| s.structural_accepted);
    let lifecycle_overflow = life
        .as_ref()
        .is_some_and(|l| l.borrow().can_record().is_err());
    let lifetime = if lifecycle_overflow {
        None
    } else {
        life.as_ref().map(|l| l.borrow().attempts)
    };
    let prior = command
        .as_ref()
        .ok()
        .and_then(|c| rt.sessions.get(c.anchor().0))
        .map(|s| s.accepted_work);
    let mut result = command
        .as_ref()
        .map_err(|_| "invalid-command")
        .and_then(|c| {
            if lifecycle_overflow {
                Err("lifecycle-overflow")
            } else {
                plan(rt, c, &mut m, &mut w)
            }
        });
    tree_meter(&mut m, &w);
    if result.is_ok() {
        if let Err(e) = structural_prior.preflight() {
            result = Err(e);
        }
    }
    if result.is_ok()
        && (m.source_facts_utf16 > 512
            || m.property_facts_utf16 > 512
            || m.shaping_segmentation_input_utf16 > 1024)
    {
        result = Err("budget-exhaustion");
    }
    if result.is_ok() {
        let c = command.as_ref().unwrap();
        if let Err(e) = rt.faults.checkpoint(
            c.anchor().0,
            c.anchor().1,
            Point::PublicationRefusal,
            &mut m.fault_work,
        ) {
            result = Err(e);
        }
    }
    let mut output = response(&result, prior, lifetime, structural_prior, &mut m);
    if lifecycle_overflow {
        output["affectedSummary"]["attemptAccounting"] = json!("reported-not-accumulated-overflow");
        output["affectedSummary"]["lifecyclePriorWork"] =
            json!(life.as_ref().unwrap().borrow().attempts);
    }
    let mut prepared = PreparedReply::new(output, Vec::with_capacity(8192), &mut m);
    if result.is_ok() {
        if let Err(e) = prior
            .unwrap()
            .preflight(&m)
            .and_then(|_| life.as_ref().unwrap().borrow().preflight(&m))
        {
            result = Err(e);
            let output = response(&result, prior, lifetime, structural_prior, &mut m);
            prepared = PreparedReply::new(output, prepared.into_buffer(), &mut m);
        }
    }
    if result.is_ok() {
        let c = command.as_ref().unwrap();
        for point in [Point::Stage5AfterOutput, Point::Stage5AfterLedger] {
            if let Err(e) =
                rt.faults
                    .checkpoint(c.anchor().0, c.anchor().1, point, &mut m.fault_work)
            {
                result = Err(e);
                let output = response(&result, prior, lifetime, structural_prior, &mut m);
                prepared = PreparedReply::new(output, prepared.into_buffer(), &mut m);
                break;
            }
        }
        // Check the final checkpoint counters too, before the publication point.
        if result.is_ok() {
            if let Err(e) = prior
                .unwrap()
                .preflight(&m)
                .and_then(|_| life.as_ref().unwrap().borrow().preflight(&m))
            {
                result = Err(e);
                let output = response(&result, prior, lifetime, structural_prior, &mut m);
                prepared = PreparedReply::new(output, prepared.into_buffer(), &mut m);
            }
        }
    }
    // All fallible work has ended. BTree publication and fixed-slot finalization
    // occur under exclusive Runtime ownership; only OOM/process traps can abort.
    let mut keys: Vec<String> = Vec::new();
    if let Ok(candidate) = result {
        for old in &candidate.remove {
            rt.sessions.remove(old);
        }
        for (receipt, session) in candidate.insert {
            keys.push(receipt.clone());
            rt.sessions.insert(receipt, session);
        }
        drop(candidate.certificate);
        drop(candidate.event);
    }
    // Obtain pointers only after ALL BTree mutations. No map operation occurs
    // below until these pointers are discarded; exclusive Runtime borrowing
    // prevents re-entry. This lets temporary capability strings be reclaimed
    // before the allocator meter and cumulative wire slots are frozen.
    let published: [Option<*mut Session>; 2] = std::array::from_fn(|i| {
        keys.get(i)
            .map(|k| rt.sessions.get_mut(k).unwrap() as *mut Session)
    });
    drop(keys);
    drop(command);
    let accepted = published[0].is_some();
    if let Some(lifetime) = lifetime {
        prepared.bind_lifecycle(lifetime);
    }
    let total = prepared.finish(&mut m, prior, accepted, &scope);
    for pointer in published.into_iter().flatten() {
        // SAFETY: pointers were obtained above after the final map mutation,
        // are distinct live sessions, and do not outlive this exclusive borrow.
        unsafe {
            (*pointer).accepted_work = total.unwrap();
            (*pointer).structural_accepted = structural_prior.total(&m.structural);
        }
    }
    if !lifecycle_overflow {
        if let Some(life) = life {
            life.borrow_mut().finish(&m, accepted);
        }
    }
    prepared.into_string()
}

pub(super) fn dispose(rt: &mut Runtime, receipt: &str) -> String {
    #[cfg(test)]
    super::accounting_tests::PUBLICATION_PROBE.with(|p| p.set(Default::default()));
    let scope = Scope::begin();
    let mut m = Meter::default();
    m.abi_input_bytes = receipt.len() as u64;
    let Some(session) = rt.sessions.get(receipt) else {
        return json!({"status":"UnknownReceipt"}).to_string();
    };
    if session.lifecycle.borrow().can_record().is_err() {
        m.response_value_passes += 1;
        let prior = session.accepted_work;
        let output = json!({"status":"NotDisposed","reason":"lifecycle-overflow","affectedSummary":{"work":m,"acceptedCumulativeWork":prior,"attemptAccounting":"reported-not-accumulated-overflow","lifecyclePriorWork":session.lifecycle.borrow().attempts}});
        let mut prepared = PreparedReply::new(output, Vec::with_capacity(8192), &mut m);
        prepared.finish(&mut m, Some(prior), false, &scope);
        return prepared.into_string();
    }
    let structural_prior = session.structural_accepted;
    let prior = session.accepted_work;
    let mut life = Some(session.lifecycle.clone());
    let lifetime = life.as_ref().unwrap().borrow().attempts;
    let peer = session.sibling.as_ref().map(|(pair, left)| {
        if *left {
            pair.right.clone()
        } else {
            pair.left.clone()
        }
    });
    let last_family = std::rc::Rc::strong_count(life.as_ref().unwrap())
        == 2 + usize::from(
            session
                .sibling
                .as_ref()
                .is_some_and(|(pair, _)| Arc::strong_count(pair) == 1),
        );
    m.structural.lineage_scalar_writes = if last_family { 1 } else { 100 };
    let mut output = json!({"status":"Disposed","disposalSummary":{"releasedSourceBytes":session.source.bytes(),"releasedSpans":session.spans.len,
        "releasedRuns":session.runs.len,"releasedShards":session.shards.len,"releasedFontBytes":session.provider.fonts.iter().map(|f|f.bytes.len()).sum::<usize>(),"liveSessions":rt.live_count()-1},
        "affectedSummary":{"work":m,"acceptedCumulativeWork":prior,"lifecycleCumulativeWork":lifetime,"structuralWork":m.structural,"acceptedStructuralWork":structural_prior}});
    let revision = session.revision;
    m.response_value_passes += 1;
    let retire = rt
        .faults
        .prepare_retirement(receipt, revision, &mut m.fault_work);
    m.fault_work.faults_cleared += u64::from(retire);
    output["disposalSummary"]["faultWork"] = json!(m.fault_work);
    let mut prepared = PreparedReply::new(output, Vec::with_capacity(8192), &mut m);
    // Disposal preserves accepted ancestry. Its actual cleanup is a separate
    // lifecycle attempt, including freeing the last shared parent snapshot.
    if let Err(reason) = life.as_ref().unwrap().borrow().preflight(&m) {
        return json!({"status":"NotDisposed","reason":reason}).to_string();
    }
    if retire {
        rt.faults.commit_retirement();
    }
    if let Some(peer) = &peer {
        if let Some(sibling) = rt.sessions.get_mut(peer) {
            sibling.sibling = None;
        }
    }
    rt.sessions.remove(receipt);
    drop(peer);
    life.as_ref().unwrap().borrow_mut().disposals += 1;
    // Reclaim the final family allocation before measuring when no live child
    // retains it. The outgoing fixed-size baseline remains on the stack.
    if std::rc::Rc::strong_count(life.as_ref().unwrap()) == 1 {
        drop(life.take());
    }
    prepared.bind_lifecycle(lifetime);
    prepared.finish(&mut m, Some(prior), false, &scope);
    if let Some(life) = life {
        let mut family = life.borrow_mut();
        family.attempts = lifetime.total(&m);
        family.structural_attempts = family.structural_attempts.total(&m.structural);
    }
    prepared.into_string()
}
