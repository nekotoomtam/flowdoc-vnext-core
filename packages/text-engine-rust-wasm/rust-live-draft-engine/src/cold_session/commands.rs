use super::{
    ledger::{Scope, Work},
    model::*,
    policy::{canonical, hash},
    position::Delta,
    runtime::Runtime,
    source::Source,
    tree::{Tree, TreeWork},
};
use icu_segmenter::{GraphemeClusterSegmenter, LineSegmenter};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Command {
    receipt: String,
    expected_revision: u64,
    start_offset: usize,
    end_offset: usize,
    replacement_text: String,
    composition: String,
    anchor_span_id: String,
}
#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct Meter {
    source_facts_utf16: u64,
    property_facts_utf16: u64,
    shaping_segmentation_input_utf16: u64,
    shaping_calls: u64,
    segmentation_calls: u64,
    provider_flag_bytes: u64,
    font_parse_input_bytes: u64,
    glyph_visits: u64,
    whole_paragraph_scans: u64,
    full_serializations: u64,
    unbounded_suffix_work: u64,
    absolute_offset_reindexing: u64,
    tree_path_copies: u64,
    tree_node_visits: u64,
    shared_subtrees: u64,
    lazy_shifted_subtrees: u64,
    hash_input_bytes: u64,
    hash_input_utf16: u64,
    receipt_binding_bytes: u64,
    receipt_random_bytes: u64,
    allocation_calls: u64,
    allocated_bytes: u64,
    deallocation_calls: u64,
    deallocated_bytes: u64,
    abi_input_bytes: u64,
    abi_output_bytes: u64,
    response_encoding_passes: u64,
    response_encoded_bytes: u64,
    seam_certified: bool,
    line_certified: bool,
    unsafe_edges_certified: bool,
    seam_search_glyphs: u64,
    seam_search_windows: u64,
}
pub(super) fn concat_flags(
    buffer: &rustybuzz::GlyphBuffer,
    face: &rustybuzz::Face,
) -> (Vec<bool>, usize) {
    let flags = rustybuzz::SerializeFlags::NO_GLYPH_NAMES
        | rustybuzz::SerializeFlags::NO_CLUSTERS
        | rustybuzz::SerializeFlags::NO_POSITIONS
        | rustybuzz::SerializeFlags::GLYPH_FLAGS;
    let wire = buffer.serialize(face, flags);
    if wire.is_empty() {
        return (Vec::new(), 0);
    }
    (
        wire.split('|')
            .map(|g| {
                g.split_once('#')
                    .map_or(false, |(_, n)| u32::from_str_radix(n, 16).unwrap() & 2 != 0)
            })
            .collect(),
        wire.len(),
    )
}
fn byte(text: &str, unit: usize) -> Option<usize> {
    let mut u = 0;
    for (b, c) in text.char_indices() {
        if u == unit {
            return Some(b);
        }
        u += c.len_utf16()
    }
    (u == unit).then_some(text.len())
}
fn facts(
    text: &str,
    base: usize,
    run: &Run,
    provider: &Provider,
    m: &mut Meter,
) -> Result<Shard, &'static str> {
    let n = text.encode_utf16().count();
    m.shaping_segmentation_input_utf16 += 3 * n as u64;
    if m.shaping_segmentation_input_utf16 > 1024 {
        return Err("budget-exhaustion");
    }
    let font = &provider.fonts[run.resource_index];
    m.font_parse_input_bytes += font.bytes.len() as u64;
    let face = rustybuzz::Face::from_slice(&font.bytes, 0).ok_or("provider-failure")?;
    let mut buffer = rustybuzz::UnicodeBuffer::new();
    buffer.push_str(text);
    buffer.set_flags(rustybuzz::BufferFlags::PRODUCE_UNSAFE_TO_CONCAT);
    buffer.set_direction(rustybuzz::Direction::LeftToRight);
    buffer.set_script(if run.key.script == "Thai" {
        rustybuzz::script::THAI
    } else {
        rustybuzz::script::LATIN
    });
    buffer.set_language(run.key.language.parse().map_err(|_| "provider-failure")?);
    let features = run
        .key
        .features
        .iter()
        .map(|f| {
            f.parse::<rustybuzz::Feature>()
                .map_err(|_| "provider-failure")
        })
        .collect::<Result<Vec<_>, _>>()?;
    m.shaping_calls += 1;
    let shaped = rustybuzz::shape(&face, &features, buffer);
    let serialized = shaped.serialize(
        &face,
        rustybuzz::SerializeFlags::NO_GLYPH_NAMES
            | rustybuzz::SerializeFlags::NO_CLUSTERS
            | rustybuzz::SerializeFlags::NO_POSITIONS
            | rustybuzz::SerializeFlags::GLYPH_FLAGS,
    );
    m.provider_flag_bytes += serialized.len() as u64;
    let flags = if serialized.is_empty() {
        vec![]
    } else {
        serialized
            .split('|')
            .map(|g| {
                g.split_once('#')
                    .map_or(false, |(_, n)| u32::from_str_radix(n, 16).unwrap() & 2 != 0)
            })
            .collect()
    };
    let mut offsets = vec![usize::MAX; text.len() + 1];
    let mut u = base;
    for (b, c) in text.char_indices() {
        offsets[b] = u;
        u += c.len_utf16()
    }
    offsets[text.len()] = u;
    let mut glyphs = Vec::new();
    for (info, pos) in shaped.glyph_infos().iter().zip(shaped.glyph_positions()) {
        m.glyph_visits += 1;
        if info.glyph_id == 0 {
            return Err("unsupported-font-script");
        }
        glyphs.push(Glyph {
            glyph_id: info.glyph_id,
            cluster: offsets[info.cluster as usize],
            x_advance: pos.x_advance,
            y_advance: pos.y_advance,
            x_offset: pos.x_offset,
            y_offset: pos.y_offset,
            unsafe_to_break: info.unsafe_to_break(),
        });
    }
    m.segmentation_calls += 2;
    let grapheme_boundaries = GraphemeClusterSegmenter::new()
        .segment_str(text)
        .map(|b| offsets[b])
        .collect();
    let line_breaks = LineSegmenter::new_auto(Default::default())
        .segment_str(text)
        .map(|b| offsets[b])
        .collect();
    Ok(Shard {
        run_index: 0,
        start_offset: base,
        end_offset: base + n,
        glyphs,
        line_breaks,
        grapheme_boundaries,
        start_safe: true,
        end_safe: true,
        concat_unsafe: flags,
    })
}
struct Candidate {
    source: Arc<Source>,
    spans: Tree<Span>,
    runs: Tree<Run>,
    shards: Tree<Shard>,
    binding: String,
    receipt: String,
    revision: u64,
    digest: String,
}
fn plan(
    rt: &Runtime,
    c: &Command,
    m: &mut Meter,
    tw: &mut TreeWork,
) -> Result<Candidate, &'static str> {
    let s = rt.sessions.get(&c.receipt).ok_or("unknown-receipt")?;
    if c.expected_revision != s.revision {
        return Err("stale-revision");
    }
    if c.composition != "committed" {
        return Err("composition-active");
    }
    let n = s.source.utf16();
    if c.start_offset > c.end_offset || c.end_offset > n {
        return Err("invalid-range");
    }
    let insert = c.start_offset == c.end_offset && !c.replacement_text.is_empty();
    let delete =
        c.end_offset == n && c.start_offset < c.end_offset && c.replacement_text.is_empty();
    if !insert && !delete {
        return Err("unsupported-command-shape");
    }
    let middle = insert && c.start_offset < n;
    let locate = if c.start_offset == n {
        n.checked_sub(1).ok_or("missing-anchor")?
    } else {
        c.start_offset
    };
    let span_at = s.spans.containing(locate, tw).ok_or("missing-anchor")?;
    let span = span_at.materialize();
    if span.span_id != c.anchor_span_id {
        return Err("ambiguous-anchor");
    }
    if c.end_offset > span.end_offset {
        return Err("unsupported-command-shape");
    }
    if middle && (s.spans.len != 1 || c.start_offset == span.start_offset) {
        return Err("unsupported-command-shape");
    }
    let run_at = s.runs.containing(locate, tw).ok_or("missing-anchor")?;
    let run = run_at.materialize();
    let shard_at = s.shards.containing(locate, tw).ok_or("missing-anchor")?;
    let shard = shard_at.materialize();
    if c.end_offset > shard.end_offset {
        return Err("budget-exhaustion");
    }
    let old = s.source.window(shard.start_offset, shard.end_offset, tw)?;
    let a = byte(&old, c.start_offset - shard.start_offset).ok_or("scalar-unsafe")?;
    let b = byte(&old, c.end_offset - shard.start_offset).ok_or("scalar-unsafe")?;
    if !shard.grapheme_boundaries.contains(&c.start_offset)
        || !shard.grapheme_boundaries.contains(&c.end_offset)
    {
        return Err("uncertified-boundary");
    }
    // The first middle profile preserves the existing Latin AL line class.
    if insert
        && (run.key.script != "Latin"
            || !c.replacement_text.chars().all(|x| x.is_ascii_alphabetic()))
    {
        return Err("uncertified-seam");
    }
    if middle && !old.chars().all(|x| x.is_ascii_alphabetic()) {
        return Err("uncertified-seam");
    }
    let new = format!("{}{}{}", &old[..a], c.replacement_text, &old[b..]);
    let old_units = shard.end_offset - shard.start_offset;
    let new_units = new.encode_utf16().count();
    m.source_facts_utf16 = (old_units + new_units) as u64;
    m.property_facts_utf16 = old_units as u64;
    if m.source_facts_utf16 > 512
        || m.property_facts_utf16 > 512
        || 3 * (old_units + new_units) > 1024
    {
        return Err("budget-exhaustion");
    }
    let mut before = facts(&old, shard.start_offset, &run, &s.provider, m)?;
    // ICU reports artificial text edges. Keep only retained paragraph/window ownership.
    before.line_breaks.retain(|p| {
        (*p != shard.start_offset || shard.line_breaks.contains(p))
            && (*p != shard.end_offset || shard.line_breaks.contains(p))
    });
    if before.glyphs != shard.glyphs
        || before.grapheme_boundaries != shard.grapheme_boundaries
        || before.line_breaks != shard.line_breaks
    {
        return Err("uncertified-seam");
    }
    let mut after = facts(&new, shard.start_offset, &run, &s.provider, m)?;
    let d = Delta {
        units: new_units as isize - old_units as isize,
        bytes: new.len() as isize - old.len() as isize,
    };
    {
        // Joining requires both old and new left edges to be concat-safe. Right
        // edge proof requires an interior provider cluster, not inferred safety.
        if shard.start_offset > run.start
            && (shard.concat_unsafe.first() != Some(&false)
                || after.concat_unsafe.first() != Some(&false))
        {
            // Inspect retained provider flags outward, without re-shaping or
            // copying sibling facts. Every inspected glyph is charged. A new
            // provider attempt is forbidden when the cumulative budget is gone.
            for distance in 1..=4 {
                for index in [
                    shard_at.index.checked_sub(distance),
                    shard_at
                        .index
                        .checked_add(distance)
                        .filter(|i| *i < s.shards.len),
                ]
                .into_iter()
                .flatten()
                {
                    if m.source_facts_utf16 >= 512 || m.property_facts_utf16 >= 512 {
                        break;
                    }
                    let neighbor = s.shards.at(index, tw).unwrap();
                    if neighbor.value.run_index != shard.run_index {
                        continue;
                    }
                    m.seam_search_windows += 1;
                    for flag in &neighbor.value.concat_unsafe {
                        if m.source_facts_utf16 >= 512 || m.property_facts_utf16 >= 512 {
                            break;
                        }
                        m.source_facts_utf16 += 1;
                        m.property_facts_utf16 += 1;
                        m.seam_search_glyphs += 1;
                        if !*flag {
                            break;
                        }
                    }
                }
                if m.source_facts_utf16 >= 512 || m.property_facts_utf16 >= 512 {
                    break;
                }
            }
            m.tree_node_visits = tw.visits;
            return Err("uncertified-seam");
        }
        if shard.end_offset < run.end {
            return Err("uncertified-seam");
        }
    }
    after.run_index = shard.run_index;
    after.line_breaks.retain(|p| {
        (*p != after.start_offset || shard.line_breaks.contains(&shard.start_offset))
            && (*p != after.end_offset || shard.end_offset == n)
    });
    let mut next_span = span;
    next_span.end_offset = d.unit(next_span.end_offset);
    let mut next_run = run;
    next_run.end = d.unit(next_run.end);
    next_run.end_byte = d.byte(next_run.end_byte);
    next_run.key.provider_run_id = format!(
        "{}-{}-{}",
        next_run.key.script.to_ascii_lowercase(),
        next_run.start,
        next_run.end
    );
    let source = s
        .source
        .replace(c.start_offset, c.end_offset, &c.replacement_text, tw)?;
    let spans = s.spans.replace_and_shift(span_at.index, next_span, d, tw);
    let runs = if next_run.start == next_run.end {
        s.runs.without_last(tw)
    } else {
        s.runs.replace_and_shift(run_at.index, next_run, d, tw)
    };
    let shards = if new.is_empty() {
        let mut pruned = s.shards.without_last(tw);
        if pruned.len > 0 {
            let previous = pruned.at(pruned.len - 1, tw).unwrap().materialize();
            let previous_run = s.runs.at(previous.run_index, tw).unwrap().materialize();
            let previous_text = s
                .source
                .window(previous.start_offset, previous.end_offset, tw)?;
            m.source_facts_utf16 += 2 * (previous.end_offset - previous.start_offset) as u64;
            m.property_facts_utf16 += (previous.end_offset - previous.start_offset) as u64;
            if m.source_facts_utf16 > 512 || m.property_facts_utf16 > 512 {
                return Err("budget-exhaustion");
            }
            let mut repaired = facts(
                &previous_text,
                previous.start_offset,
                &previous_run,
                &s.provider,
                m,
            )?;
            if repaired.glyphs != previous.glyphs
                || repaired.grapheme_boundaries != previous.grapheme_boundaries
            {
                return Err("uncertified-seam");
            }
            repaired.run_index = previous.run_index;
            repaired
                .line_breaks
                .retain(|p| *p != previous.start_offset || previous.line_breaks.contains(p));
            pruned = pruned.replace_and_shift(pruned.len - 1, repaired, Delta::default(), tw);
        }
        pruned
    } else {
        s.shards.replace_and_shift(shard_at.index, after, d, tw)
    };
    let revision = s.revision.checked_add(1).ok_or("revision-limit")?;
    let mut hw = Work::default();
    let binding_bytes = canonical(
        &(
            &s.source_binding,
            c.start_offset,
            c.end_offset,
            &c.replacement_text,
            revision,
        ),
        &mut hw,
    );
    m.hash_input_bytes += binding_bytes.len() as u64;
    m.hash_input_utf16 = c.replacement_text.encode_utf16().count() as u64;
    let binding = hash(&binding_bytes);
    let mut entropy = [0u8; 32];
    getrandom::getrandom(&mut entropy).map_err(|_| "entropy-unavailable")?;
    m.receipt_random_bytes = 32;
    let receipt_bytes = canonical(
        &(
            entropy,
            &s.paragraph,
            &s.provider.policy_digest,
            &binding,
            revision,
        ),
        &mut hw,
    );
    m.receipt_binding_bytes = receipt_bytes.len() as u64;
    m.hash_input_bytes += receipt_bytes.len() as u64;
    let receipt = hash(&receipt_bytes);
    if rt.sessions.contains_key(&receipt) {
        return Err("receipt-collision");
    }
    m.tree_node_visits = tw.visits;
    m.tree_path_copies = tw.copies;
    m.shared_subtrees = tw.shared_subtrees;
    m.lazy_shifted_subtrees = tw.shifted_subtrees;
    m.seam_certified = true;
    m.line_certified = true;
    m.unsafe_edges_certified = true;
    let state_bytes = canonical(&(&binding, revision, &new), &mut hw);
    m.hash_input_bytes += state_bytes.len() as u64;
    let digest = hash(&state_bytes);
    Ok(Candidate {
        source,
        spans,
        runs,
        shards,
        binding,
        receipt,
        revision,
        digest,
    })
}
pub(super) fn apply(rt: &mut Runtime, input: &str) -> String {
    let scope = Scope::begin();
    let mut meter = Meter {
        abi_input_bytes: input.len() as u64,
        ..Meter::default()
    };
    let command = serde_json::from_str::<Command>(input);
    let mut tw = TreeWork::default();
    let result = command
        .as_ref()
        .map_err(|_| "invalid-command")
        .and_then(|c| plan(rt, c, &mut meter, &mut tw));
    meter.tree_node_visits = tw.visits;
    meter.tree_path_copies = tw.copies;
    meter.shared_subtrees = tw.shared_subtrees;
    meter.lazy_shifted_subtrees = tw.shifted_subtrees;
    let mut response = match &result {
        Ok(p) => {
            json!({"status":"Accepted","nextReceipt":p.receipt,"nextRevision":p.revision,"affectedSummary":{"sourceBindingDigest":p.binding,"revisionDigest":p.digest,"work":{}}})
        }
        Err(reason) => {
            let c = command.as_ref().ok();
            let session = c.and_then(|c| rt.sessions.get(&c.receipt));
            json!({"status":"NotAdmissible","reason":reason,"unchangedReceipt":c.map(|c|&c.receipt),"unchangedRevision":session.map(|s|s.revision),"affectedSummary":{"work":{}}})
        }
    };
    response["affectedSummary"]["work"] = serde_json::to_value(&meter).unwrap();
    let mut bytes = Vec::with_capacity(8192);
    // The compact reply is encoded before publication to reserve its complete
    // capacity. Subsequent passes only update existing numeric fields.
    serde_json::to_writer(&mut bytes, &response).unwrap();
    let mut passes = 1u64;
    let mut encoded_bytes = bytes.len() as u64;
    let mut estimate = bytes.len();
    if let Ok(p) = result {
        let c = command.as_ref().unwrap();
        let mut s = rt.sessions.remove(&c.receipt).unwrap();
        s.source = p.source;
        s.spans = p.spans;
        s.runs = p.runs;
        s.shards = p.shards;
        s.source_binding = p.binding;
        s.revision = p.revision;
        rt.sessions.insert(p.receipt, s);
    }
    loop {
        passes += 1;
        let counts = scope.snapshot();
        let work = &mut response["affectedSummary"]["work"];
        work["allocationCalls"] = json!(counts.alloc_calls);
        work["allocatedBytes"] = json!(counts.alloc_bytes);
        work["deallocationCalls"] = json!(counts.free_calls);
        work["deallocatedBytes"] = json!(counts.free_bytes);
        work["abiOutputBytes"] = json!(estimate);
        work["responseEncodingPasses"] = json!(passes);
        work["responseEncodedBytes"] = json!(encoded_bytes + estimate as u64);
        bytes.clear();
        serde_json::to_writer(&mut bytes, &response).unwrap();
        let actual = bytes.len();
        encoded_bytes += actual as u64;
        if actual == estimate {
            break;
        }
        estimate = actual;
    }
    String::from_utf8(bytes).unwrap()
}
