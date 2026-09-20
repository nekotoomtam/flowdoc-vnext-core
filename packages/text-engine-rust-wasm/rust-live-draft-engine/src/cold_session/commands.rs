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
use unicode_script::{Script, UnicodeScript};

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
    source_copy_bytes: u64,
    source_scan_utf16: u64,
    source_index_utf16: u64,
    source_offset_lookups: u64,
    property_scalar_visits: u64,
    property_scan_utf16: u64,
    payload_copy_calls: u64,
    payload_elements_copied: u64,
    canonical_value_passes: u64,
    canonical_json_passes: u64,
    canonical_encoded_bytes: u64,
    boundary_comparisons: u64,
    fact_comparisons: u64,
    provider_offset_lookups: u64,
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
fn byte(text: &str, unit: usize, meter: &mut Meter) -> Option<usize> {
    let mut u = 0;
    for (b, c) in text.char_indices() {
        meter.source_scan_utf16 += c.len_utf16() as u64;
        if u == unit {
            return Some(b);
        }
        u += c.len_utf16()
    }
    (u == unit).then_some(text.len())
}
fn contains(values: &[usize], value: usize, meter: &mut Meter) -> bool {
    values.iter().any(|v| {
        meter.boundary_comparisons += 1;
        *v == value
    })
}
fn equal_facts<T: PartialEq>(a: &[T], b: &[T], meter: &mut Meter) -> bool {
    a.len() == b.len()
        && a.iter().zip(b).all(|(x, y)| {
            meter.fact_comparisons += 1;
            x == y
        })
}
fn facts(
    text: &str,
    base: usize,
    run: &Run,
    provider: &Provider,
    m: &mut Meter,
) -> Result<Shard, &'static str> {
    let n = text.encode_utf16().count();
    m.source_scan_utf16 += n as u64;
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
        m.source_scan_utf16 += c.len_utf16() as u64;
        offsets[b] = u;
        u += c.len_utf16()
    }
    offsets[text.len()] = u;
    let mut glyphs = Vec::new();
    for (info, pos) in shaped.glyph_infos().iter().zip(shaped.glyph_positions()) {
        m.glyph_visits += 1;
        m.provider_offset_lookups += 1;
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
        .map(|b| {
            m.provider_offset_lookups += 1;
            offsets[b]
        })
        .collect();
    let line_breaks = LineSegmenter::new_auto(Default::default())
        .segment_str(text)
        .map(|b| {
            m.provider_offset_lookups += 1;
            offsets[b]
        })
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
    let range_edit = c.start_offset < c.end_offset;
    if !insert && !range_edit {
        return Err("unsupported-command-shape");
    }
    if range_edit
        && (s.spans.len != 1
            || (c.start_offset == 0 && c.end_offset == n && c.replacement_text.is_empty()))
    {
        return Err("unsupported-command-shape");
    }
    let middle = insert && c.start_offset < n;
    let locate = if c.start_offset == n {
        n.checked_sub(1).ok_or("missing-anchor")?
    } else {
        c.start_offset
    };
    let span_at = s.spans.containing(locate, tw).ok_or("missing-anchor")?;
    let span = span_at.materialize(tw);
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
    let run = run_at.materialize(tw);
    let shard_at = s.shards.containing(locate, tw).ok_or("missing-anchor")?;
    let shard = shard_at.materialize(tw);
    if c.end_offset > shard.end_offset {
        return Err("budget-exhaustion");
    }
    let old = s.source.window(shard.start_offset, shard.end_offset, tw)?;
    let old_units = shard.end_offset - shard.start_offset;
    let range_sizes = if range_edit {
        let mut replacement_units = 0;
        for ch in c.replacement_text.chars() {
            let units = ch.len_utf16();
            if m.source_scan_utf16 + units as u64 > 512 {
                return Err("budget-exhaustion");
            }
            m.source_scan_utf16 += units as u64;
            replacement_units += units;
        }
        let new_units = old_units - (c.end_offset - c.start_offset) + replacement_units;
        // Upper bound before performing either byte search, classification,
        // provider offset mapping or source-index construction. It includes
        // repeated reads; observed counters below report actual work, not this bound.
        let tail_repair_units = if new_units == 0 && shard.end_offset == n && s.shards.len > 1 {
            let previous = s.shards.at(s.shards.len - 2, tw).unwrap();
            2 * (previous.value.end_offset - previous.value.start_offset)
        } else {
            0
        };
        if 5 * old_units + 4 * new_units + replacement_units + tail_repair_units > 512 {
            return Err("budget-exhaustion");
        }
        Some((replacement_units, new_units))
    } else {
        None
    };
    if range_edit && (shard.start_offset != run.start || shard.end_offset != run.end) {
        // Shaping concat flags alone do not certify adjacent Thai line facts.
        return Err("uncertified-seam");
    }
    let a = byte(&old, c.start_offset - shard.start_offset, m).ok_or("scalar-unsafe")?;
    let b = byte(&old, c.end_offset - shard.start_offset, m).ok_or("scalar-unsafe")?;
    if !contains(&shard.grapheme_boundaries, c.start_offset, m)
        || !contains(&shard.grapheme_boundaries, c.end_offset, m)
    {
        return Err("uncertified-boundary");
    }
    // The first middle profile preserves the existing Latin AL line class.
    if insert
        && (run.key.script != "Latin"
            || !c.replacement_text.chars().all(|x| {
                m.property_scalar_visits += 1;
                m.property_scan_utf16 += x.len_utf16() as u64;
                x.is_ascii_alphabetic()
            }))
    {
        return Err("uncertified-seam");
    }
    if middle
        && !old.chars().all(|x| {
            m.property_scalar_visits += 1;
            m.property_scan_utf16 += x.len_utf16() as u64;
            x.is_ascii_alphabetic()
        })
    {
        return Err("uncertified-seam");
    }
    let new = format!("{}{}{}", &old[..a], c.replacement_text, &old[b..]);
    m.source_copy_bytes += new.len() as u64;
    if range_edit {
        // Old grapheme boundaries do not certify newly authored run edges.
        // Keep neighbor context unchanged until an adjacent-window proof exists.
        if !new.is_empty()
            && ((c.start_offset == run.start && run.start > 0)
                || (c.end_offset == run.end && run.end < n))
        {
            return Err("uncertified-boundary");
        }
        // Preserve the existing analysis key. A script transition or removal
        // of an interior run requires a separate multi-run seam proof.
        if (new.is_empty() && shard.end_offset != n)
            || !old.chars().chain(new.chars()).all(|ch| {
                m.property_scalar_visits += 1;
                m.property_scan_utf16 += ch.len_utf16() as u64;
                match run.key.script.as_str() {
                    "Latin" => ch.is_ascii_alphabetic(),
                    "Thai" => ch.script() == Script::Thai,
                    _ => false,
                }
            })
        {
            return Err("uncertified-seam");
        }
    }
    let new_units = if let Some((_, units)) = range_sizes {
        units
    } else {
        let units = new.encode_utf16().count();
        m.source_scan_utf16 += units as u64;
        units
    };
    m.source_facts_utf16 = (old_units + new_units) as u64;
    m.property_facts_utf16 = if range_edit {
        (old_units + new_units) as u64
    } else {
        old_units as u64
    };
    if m.source_facts_utf16 > 512
        || m.property_facts_utf16 > 512
        || 3 * (old_units + new_units) > 1024
    {
        return Err("budget-exhaustion");
    }
    let mut before = facts(&old, shard.start_offset, &run, &s.provider, m)?;
    // ICU reports artificial text edges. Keep only retained paragraph/window ownership.
    before.line_breaks.retain(|p| {
        (*p != shard.start_offset || contains(&shard.line_breaks, *p, m))
            && (*p != shard.end_offset || contains(&shard.line_breaks, *p, m))
    });
    if !equal_facts(&before.glyphs, &shard.glyphs, m)
        || !equal_facts(&before.grapheme_boundaries, &shard.grapheme_boundaries, m)
        || !equal_facts(&before.line_breaks, &shard.line_breaks, m)
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
            if range_edit {
                return Err("uncertified-seam");
            }
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
        (*p != after.start_offset || contains(&shard.line_breaks, shard.start_offset, m))
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
            let previous = pruned.at(pruned.len - 1, tw).unwrap().materialize(tw);
            let previous_run = s.runs.at(previous.run_index, tw).unwrap().materialize(tw);
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
            if !equal_facts(&repaired.glyphs, &previous.glyphs, m)
                || !equal_facts(
                    &repaired.grapheme_boundaries,
                    &previous.grapheme_boundaries,
                    m,
                )
            {
                return Err("uncertified-seam");
            }
            repaired.run_index = previous.run_index;
            repaired
                .line_breaks
                .retain(|p| *p != previous.start_offset || contains(&previous.line_breaks, *p, m));
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
    m.hash_input_utf16 = if let Some((units, _)) = range_sizes {
        units as u64
    } else {
        let units = c.replacement_text.encode_utf16().count() as u64;
        m.source_scan_utf16 += units;
        units
    };
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
    m.canonical_value_passes = hw.canonical_value_passes;
    m.canonical_json_passes = hw.canonical_json_passes;
    m.canonical_encoded_bytes = hw.canonical_encoded_bytes;
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
    meter.payload_copy_calls = tw.payload_copy_calls;
    meter.payload_elements_copied = tw.payload_elements_copied;
    meter.source_copy_bytes += tw.source_copy_bytes;
    meter.source_index_utf16 = tw.source_index_utf16;
    meter.source_offset_lookups = tw.source_offset_lookups;
    if command
        .as_ref()
        .is_ok_and(|c| c.start_offset < c.end_offset)
    {
        meter.source_facts_utf16 =
            meter.source_scan_utf16 + tw.source_index_utf16 + meter.property_scan_utf16;
        meter.property_facts_utf16 = meter.property_scan_utf16;
    }
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
