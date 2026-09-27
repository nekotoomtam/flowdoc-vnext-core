use super::{
    faults::Point,
    ledger::{Scope, Work},
    model::*,
    ownership,
    policy::{canonical, hash},
    position::Delta,
    runtime::Runtime,
    source::Source,
    structure::{StructuralHistory, Structures},
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
    #[serde(default)]
    anchor_span_id: String,
}
use super::command_work::{Meter, PreparedReply};
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
fn concat_safe(flags: &[bool], m: &mut Meter) -> bool {
    m.concat_edge_checks += 1;
    flags.first() == Some(&false)
}
fn measured_canonical<T: Serialize>(value: &T, m: &mut Meter) -> Vec<u8> {
    let mut work = Work::default();
    let bytes = canonical(value, &mut work);
    m.canonical_value_passes += work.canonical_value_passes;
    m.canonical_json_passes += work.canonical_json_passes;
    m.canonical_encoded_bytes += work.canonical_encoded_bytes;
    bytes
}
fn measured_hash(bytes: &[u8], m: &mut Meter) -> String {
    m.hash_calls += 1;
    m.hash_input_bytes += bytes.len() as u64;
    hash(bytes)
}
#[cfg(test)]
#[test]
fn provider_rejection_charges_only_executed_calls_and_offset_reads() {
    let mut rt = Runtime::default();
    let c = super::tests::create(&mut rt, &super::tests::fixture("AB"));
    let s = rt.session(c["receipt"].as_str().unwrap());
    let run = s
        .runs
        .at(0, &mut TreeWork::default())
        .unwrap()
        .materialize(&mut TreeWork::default());
    let mut m = Meter::default();
    assert_eq!(
        facts("😀", 0, &run, &s.provider, &mut m, false).err(),
        Some("unsupported-font-script")
    );
    assert_eq!(m.provider_offset_lookups, 0);
    assert_eq!(m.shaping_calls, 1);
    assert_eq!(m.segmentation_calls, 0);
    assert_eq!(m.shaping_segmentation_input_utf16, 2);
    assert_eq!(m.old_new_provider_input_utf16, 2);
    assert_eq!(m.source_scan_utf16, 4);
}
pub(super) fn facts(
    text: &str,
    base: usize,
    run: &Run,
    provider: &Provider,
    m: &mut Meter,
    tail_repair: bool,
) -> Result<Shard, &'static str> {
    let n = text.encode_utf16().count();
    m.source_scan_utf16 += n as u64;
    if m.shaping_segmentation_input_utf16 + 3 * n as u64 > 1024 {
        return Err("budget-exhaustion");
    }
    let font = &provider.fonts[run.resource_index];
    m.font_parse_input_bytes += font.bytes.len() as u64;
    m.font_parse_calls += 1;
    let face = rustybuzz::Face::from_slice(&font.bytes, 0).ok_or("provider-failure")?;
    let mut buffer = rustybuzz::UnicodeBuffer::new();
    m.provider_buffer_calls += 1;
    m.provider_buffer_input_utf16 += n as u64;
    m.provider_buffer_input_bytes += text.len() as u64;
    buffer.push_str(text);
    buffer.set_flags(rustybuzz::BufferFlags::PRODUCE_UNSAFE_TO_CONCAT);
    buffer.set_direction(rustybuzz::Direction::LeftToRight);
    buffer.set_script(if run.key.script == "Thai" {
        rustybuzz::script::THAI
    } else {
        rustybuzz::script::LATIN
    });
    m.language_parse_calls += 1;
    m.language_parse_bytes += run.key.language.len() as u64;
    buffer.set_language(run.key.language.parse().map_err(|_| "provider-failure")?);
    let features = run
        .key
        .features
        .iter()
        .map(|f| {
            m.feature_parse_calls += 1;
            m.feature_parse_bytes += f.len() as u64;
            f.parse::<rustybuzz::Feature>()
                .map_err(|_| "provider-failure")
        })
        .collect::<Result<Vec<_>, _>>()?;
    m.shaping_calls += 1;
    m.shaping_input_utf16 += n as u64;
    m.shaping_segmentation_input_utf16 += n as u64;
    if tail_repair {
        m.tail_repair_shaping_calls += 1;
        m.tail_repair_provider_input_utf16 += n as u64;
    } else {
        m.old_new_shaping_calls += 1;
        m.old_new_provider_input_utf16 += n as u64;
    }
    let shaped = rustybuzz::shape(&face, &features, buffer);
    let serialized = shaped.serialize(
        &face,
        rustybuzz::SerializeFlags::NO_GLYPH_NAMES
            | rustybuzz::SerializeFlags::NO_CLUSTERS
            | rustybuzz::SerializeFlags::NO_POSITIONS
            | rustybuzz::SerializeFlags::GLYPH_FLAGS,
    );
    m.provider_flag_bytes += serialized.len() as u64;
    m.provider_flag_parse_bytes += serialized.len() as u64;
    let flags = if serialized.is_empty() {
        vec![]
    } else {
        serialized
            .split('|')
            .map(|g| {
                m.provider_flag_entries += 1;
                g.split_once('#')
                    .map_or(false, |(_, n)| u32::from_str_radix(n, 16).unwrap() & 2 != 0)
            })
            .collect()
    };
    let mut offsets = vec![usize::MAX; text.len() + 1];
    m.provider_offset_slots_initialized += (text.len() + 1) as u64;
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
        if info.glyph_id == 0 {
            return Err("unsupported-font-script");
        }
        m.provider_offset_lookups += 1;
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
    m.segmentation_setup_calls += 2;
    m.segmentation_input_utf16 += 2 * n as u64;
    m.shaping_segmentation_input_utf16 += 2 * n as u64;
    if tail_repair {
        m.tail_repair_provider_input_utf16 += 2 * n as u64;
    } else {
        m.old_new_provider_input_utf16 += 2 * n as u64;
    }
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
    event: String,
    source: Arc<Source>,
    spans: Tree<Span>,
    runs: Tree<Run>,
    shards: Tree<Shard>,
    binding: String,
    receipt: String,
    revision: u64,
    digest: String,
    structures: StructuralHistory,
}
fn plan(
    rt: &mut Runtime,
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
    if range_edit && c.start_offset == 0 && c.end_offset == n && c.replacement_text.is_empty() {
        return Err("unsupported-command-shape");
    }
    let middle = insert && c.start_offset < n;
    let locate = if c.start_offset == n {
        n.checked_sub(1).ok_or("missing-anchor")?
    } else {
        c.start_offset
    };
    let ownership = ownership::select(
        &s.spans,
        c.start_offset,
        c.end_offset,
        n,
        c.replacement_text.is_empty(),
        &c.anchor_span_id,
        tw,
    )?;
    let edge = ownership.edge;
    m.bounded_ownership = edge;
    if middle && !edge && c.start_offset == ownership.span.start_offset {
        return Err("unsupported-command-shape");
    }
    let run_at = s.runs.containing(locate, tw).ok_or("missing-anchor")?;
    let run = run_at.materialize(tw);
    if edge {
        // A style/font key boundary is not an ICU dictionary-context boundary.
        // Adjacent-context certification is outside this admitted profile.
        for index in [
            run_at.index.checked_sub(1),
            run_at.index.checked_add(1).filter(|i| *i < s.runs.len),
        ]
        .into_iter()
        .flatten()
        {
            let neighbor = s.runs.at(index, tw).unwrap();
            m.context_run_visits += 1;
            let other = &neighbor.value.key.script;
            let same = other.len() == run.key.script.len()
                && other.bytes().zip(run.key.script.bytes()).all(|(a, b)| {
                    m.context_key_comparison_bytes += 1;
                    a == b
                });
            if same {
                return Err("uncertified-seam");
            }
        }
    }
    if insert && c.start_offset == n && c.replacement_text.len() <= 24 && super::tail_seam::opposite(&c.replacement_text, &run.key.script, m) {
        rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::CancelBeforeProvider,&mut m.fault_work)?;
        let repaired = super::tail_seam::prepare(s, &run, &ownership, &c.replacement_text, m, tw)?;
        let (runs, shards) = super::tail_seam::certify(s, &run, repaired, m, tw)?;
        rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::ProviderFailure,&mut m.fault_work)?;
        rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::CancelAfterProvider,&mut m.fault_work)?;
        let units=c.replacement_text.encode_utf16().count();
        m.source_scan_utf16+=units as u64;
        let d=Delta{units:units as isize,bytes:c.replacement_text.len() as isize,runs:0};
        tw.source_allowance(m.source_scan_utf16+m.property_scan_utf16);
        let source=s.source.append(&c.replacement_text,units,tw)?;
        let spans=ownership.publish(&s.spans,c.start_offset,c.end_offset,d,tw);
        return finish_candidate(rt,c,m,tw,source,spans,runs,shards,units,&c.replacement_text);
    }
    if !edge && run.key.script == "Thai" && run.end == n && run.end-run.start <= 24 &&
        c.start_offset >= run.start && c.end_offset <= n && c.replacement_text.len() <= 24 &&
        !(c.start_offset == run.start && c.end_offset == run.end && c.replacement_text.is_empty()) {
        rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::CancelBeforeProvider,&mut m.fault_work)?;
        let (runs,shards,units)=super::tail_seam::thai_edit(s,&run,c.start_offset,c.end_offset,&c.replacement_text,m,tw)?;
        rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::ProviderFailure,&mut m.fault_work)?;
        rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::CancelAfterProvider,&mut m.fault_work)?;
        let d=Delta{units:units as isize-(c.end_offset-c.start_offset) as isize,
            bytes:c.replacement_text.len() as isize-(c.end_offset-c.start_offset) as isize*3,runs:0};
        tw.source_allowance(m.source_scan_utf16+m.property_scan_utf16);
        let source=s.source.replace(c.start_offset,c.end_offset,&c.replacement_text,units,tw)?;
        let spans=ownership.publish(&s.spans,c.start_offset,c.end_offset,d,tw);
        if m.source_scan_utf16+tw.source_index_utf16+tw.source_offset_lookups+m.property_scan_utf16>512 ||
            m.property_scan_utf16>512 || m.shaping_segmentation_input_utf16>1024 {
            return Err("budget-exhaustion");
        }
        return finish_candidate(rt,c,m,tw,source,spans,runs,shards,units,&c.replacement_text);
    }
    if run.key.script == "Latin" && run.end == n && c.start_offset == run.start &&
        c.end_offset == n && c.replacement_text.is_empty() && run.start>0 &&
        run.end-run.start<=24 {
        rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::CancelBeforeProvider,&mut m.fault_work)?;
        let (runs,shards)=super::tail_seam::latin_tail_deletion(s,&run,m,tw)?;
        rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::ProviderFailure,&mut m.fault_work)?;
        rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::CancelAfterProvider,&mut m.fault_work)?;
        tw.source_allowance(m.source_scan_utf16+m.property_scan_utf16);
        let source=s.source.replace(c.start_offset,c.end_offset,"",0,tw)?;
        let d=Delta{units:-((n-run.start) as isize),bytes:-((run.end_byte-run.start_byte) as isize),runs:0};
        let spans=ownership.publish(&s.spans,c.start_offset,c.end_offset,d,tw);
        if m.source_scan_utf16+tw.source_index_utf16+tw.source_offset_lookups+m.property_scan_utf16>512 ||
            m.property_scan_utf16>512 || m.shaping_segmentation_input_utf16>1024 {
            return Err("budget-exhaustion");
        }
        return finish_candidate(rt,c,m,tw,source,spans,runs,shards,0,"");
    }
    if !edge && (range_edit || middle) && run.end-run.start>128 && c.start_offset>run.start && c.end_offset<=run.end {
        rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::CancelBeforeProvider,&mut m.fault_work)?;
        let (runs,shards,units,d)=super::local_window::edit(s,&run,run_at.index,c.start_offset,c.end_offset,&c.replacement_text,m,tw)?;
        rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::ProviderFailure,&mut m.fault_work)?;
        rt.faults.checkpoint(&c.receipt,c.expected_revision,Point::CancelAfterProvider,&mut m.fault_work)?;
        tw.source_allowance(m.source_scan_utf16+m.property_scan_utf16);
        let source=s.source.replace(c.start_offset,c.end_offset,&c.replacement_text,units,tw)?;
        let spans=ownership.publish(&s.spans,c.start_offset,c.end_offset,d,tw);
        return finish_candidate(rt,c,m,tw,source,spans,runs,shards,units,&c.replacement_text);
    }
    let shard_at = s.shards.containing(locate, tw).ok_or("missing-anchor")?;
    let shard = shard_at.materialize(tw);
    if c.end_offset > shard.end_offset {
        return Err("budget-exhaustion");
    }
    tw.source_allowance(m.source_scan_utf16+m.property_scan_utf16);
    let old = s.source.window(shard.start_offset, shard.end_offset, tw)?;
    let old_units = shard.end_offset - shard.start_offset;
    let range_sizes = {
        let mut replacement_units = 0;
        let mut replacement = c.replacement_text.chars();
        while !replacement.as_str().is_empty() {
            // Reserve the maximum scalar width BEFORE decoding the next scalar.
            // This may leave one unit unused; no speculative read is omitted.
            if m.source_scan_utf16 + m.property_scan_utf16 + tw.source_offset_lookups + 2 > 512 {
                return Err("budget-exhaustion");
            }
            let ch = replacement.next().unwrap();
            m.replacement_scalars_decoded += 1;
            let units = ch.len_utf16();
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
        let lookup_units = if tail_repair_units > 0 { 6 } else { 4 };
        if 5 * old_units + 4 * new_units + replacement_units + tail_repair_units + lookup_units + m.property_scan_utf16 as usize
            > 512
        {
            return Err("budget-exhaustion");
        }
        (replacement_units, new_units)
    };
    if (range_edit || edge) && (shard.start_offset != run.start || shard.end_offset != run.end) {
        // Shaping concat flags alone do not certify adjacent Thai line facts.
        return Err("uncertified-seam");
    }
    if edge && (c.start_offset <= run.start || c.end_offset >= run.end) {
        return Err("uncertified-boundary");
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
        && !edge
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
        && !edge
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
    m.source_copied_utf16 += range_sizes.1 as u64;
    m.source_copy_calls += 1;
    if range_edit || edge {
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
    let new_units = range_sizes.1;
    if 3 * (old_units + new_units) > 1024 {
        return Err("budget-exhaustion");
    }
    rt.faults.checkpoint(
        &c.receipt,
        c.expected_revision,
        Point::CancelBeforeProvider,
        &mut m.fault_work,
    )?;
    let mut before = facts(&old, shard.start_offset, &run, &s.provider, m, false)?;
    // ICU reports artificial text edges. Keep only retained paragraph/window ownership.
    before.line_breaks.retain(|p| {
        m.line_filter_visits += 1;
        (*p != shard.start_offset || contains(&shard.line_breaks, *p, m))
            && (*p != shard.end_offset || contains(&shard.line_breaks, *p, m))
    });
    if !equal_facts(&before.glyphs, &shard.glyphs, m)
        || !equal_facts(&before.grapheme_boundaries, &shard.grapheme_boundaries, m)
        || !equal_facts(&before.line_breaks, &shard.line_breaks, m)
    {
        return Err("uncertified-seam");
    }
    rt.faults.checkpoint(
        &c.receipt,
        c.expected_revision,
        Point::ProviderFailure,
        &mut m.fault_work,
    )?;
    let mut after = facts(&new, shard.start_offset, &run, &s.provider, m, false)?;
    if edge {
        let cut = if insert && ownership.span.end_offset == c.start_offset {
            c.start_offset + range_sizes.0
        } else {
            c.start_offset
        };
        if !contains(&after.grapheme_boundaries, cut, m) {
            return Err("uncertified-boundary");
        }
    }
    let d = Delta {
        units: new_units as isize - old_units as isize,
        bytes: new.len() as isize - old.len() as isize, runs: 0 };
    {
        // Joining requires both old and new left edges to be concat-safe. Right
        // edge proof requires an interior provider cluster, not inferred safety.
        if shard.start_offset > run.start
            && (!concat_safe(&shard.concat_unsafe, m) || !concat_safe(&after.concat_unsafe, m))
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
                    let neighbor = s.shards.at(index, tw).unwrap();
                    if neighbor.value.run_index != shard.run_index {
                        continue;
                    }
                    m.seam_search_windows += 1;
                    for flag in &neighbor.value.concat_unsafe {
                        m.seam_search_glyphs += 1;
                        if !*flag {
                            break;
                        }
                    }
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
        m.line_filter_visits += 1;
        (*p != after.start_offset || contains(&shard.line_breaks, shard.start_offset, m))
            && (*p != after.end_offset || shard.end_offset == n)
    });
    rt.faults.checkpoint(
        &c.receipt,
        c.expected_revision,
        Point::CancelAfterProvider,
        &mut m.fault_work,
    )?;
    let mut next_run = run;
    next_run.end = d.unit(next_run.end);
    next_run.end_byte = d.byte(next_run.end_byte);
    tw.position_rewrites += 2;
    next_run.key.provider_run_id = format!(
        "{}-{}-{}",
        next_run.key.script.to_ascii_lowercase(),
        next_run.start,
        next_run.end
    );
    tw.provider_run_id_encoding_passes += 1;
    tw.provider_run_id_encoded_bytes += next_run.key.provider_run_id.len() as u64;
    tw.source_allowance(m.source_scan_utf16+m.property_scan_utf16);
    let source = s.source.replace(
        c.start_offset,
        c.end_offset,
        &c.replacement_text,
        range_sizes.0,
        tw,
    )?;
    let spans = ownership.publish(&s.spans, c.start_offset, c.end_offset, d, tw);
    let runs = if next_run.start == next_run.end {
        s.runs.without_last(tw)
    } else {
        s.runs.replace_and_shift(run_at.index, next_run, d, tw)
    };
    let shards = if new.is_empty() {
        let mut pruned = s.shards.without_last(tw);
        if pruned.len > 0 {
            let previous = pruned.at(pruned.len - 1, tw).unwrap().materialize(tw);
            let previous_run = s.runs.at(previous.run_index - s.run_index_base, tw).unwrap().materialize(tw);
            // Re-deriving a partial Thai run cannot certify dictionary line
            // context outside this shard. Adjacent-context admission stays closed.
            if previous.start_offset != previous_run.start
                || previous.end_offset != previous_run.end
            {
                return Err("uncertified-seam");
            }
            tw.source_allowance(m.source_scan_utf16+m.property_scan_utf16);
            let previous_text = s
                .source
                .window(previous.start_offset, previous.end_offset, tw)?;
            rt.faults.checkpoint(
                &c.receipt,
                c.expected_revision,
                Point::TailRepairProviderFailure,
                &mut m.fault_work,
            )?;
            let mut repaired = facts(
                &previous_text,
                previous.start_offset,
                &previous_run,
                &s.provider,
                m,
                true,
            )?;
            rt.faults.checkpoint(
                &c.receipt,
                c.expected_revision,
                Point::CancelAfterTailRepair,
                &mut m.fault_work,
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
            repaired.line_breaks.retain(|p| {
                m.line_filter_visits += 1;
                *p != previous.start_offset || contains(&previous.line_breaks, *p, m)
            });
            pruned = pruned.replace_and_shift(pruned.len - 1, repaired, Delta::default(), tw);
        }
        pruned
    } else {
        s.shards.replace_and_shift(shard_at.index, after, d, tw)
    };
    finish_candidate(rt,c,m,tw,source,spans,runs,shards,range_sizes.0,&new)
}
fn finish_candidate(rt: &mut Runtime, c: &Command, m: &mut Meter, tw: &mut TreeWork,
    source: Arc<Source>, spans: Tree<Span>, runs: Tree<Run>, shards: Tree<Shard>,
    replacement_units: usize, new: &str) -> Result<Candidate, &'static str> {
    let s=rt.sessions.get(&c.receipt).ok_or("unknown-receipt")?;
    let revision = s.revision.checked_add(1).ok_or("revision-limit")?;
    let binding_bytes = measured_canonical(
        &(
            &s.source_binding,
            c.start_offset,
            c.end_offset,
            &c.replacement_text,
            revision,
        ),
        m,
    );
    m.hash_input_utf16 = replacement_units as u64;
    let binding = measured_hash(&binding_bytes, m);
    let mut entropy = [0u8; 32];
    rt.faults.checkpoint(
        &c.receipt,
        c.expected_revision,
        Point::ReceiptEntropyFailure,
        &mut m.fault_work,
    )?;
    getrandom::getrandom(&mut entropy).map_err(|_| "entropy-unavailable")?;
    m.receipt_random_bytes = 32;
    let receipt_bytes = measured_canonical(
        &(
            entropy,
            &s.paragraph,
            &s.provider.policy_digest,
            &binding,
            revision,
        ),
        m,
    );
    m.receipt_binding_bytes = receipt_bytes.len() as u64;
    let receipt = measured_hash(&receipt_bytes, m);
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
    let state_bytes = measured_canonical(&(&binding, revision, &new), m);
    let digest = measured_hash(&state_bytes, m);
    let structures = s.structures.next(Structures {
        source: source.stats(),
        spans: spans.stats(),
        runs: runs.stats(),
        shards: shards.stats(),
    })?;
    m.payload_copy_calls += 1;
    m.payload_string_bytes_copied += receipt.len() as u64;
    Ok(Candidate {
        event: receipt.clone(),
        source,
        spans,
        runs,
        shards,
        binding,
        receipt,
        revision,
        digest,
        structures,
    })
}
fn rejection(rt: &Runtime, command: Option<&Command>, reason: &str) -> serde_json::Value {
    let session = command.and_then(|c| rt.sessions.get(&c.receipt));
    json!({"status":"NotAdmissible","reason":reason,"unchangedReceipt":command.map(|c|&c.receipt),
        "unchangedRevision":session.map(|s|s.revision),"affectedSummary":{"work":{},
        "acceptedCumulativeWork":session.map(|s|s.accepted_work),"structuralSnapshot":session.map(|s|s.structures)}})
}
pub(super) fn apply(rt: &mut Runtime, input: &str) -> String {
    let scope = Scope::begin();
    #[cfg(test)]
    super::accounting_tests::PUBLICATION_PROBE.with(|p| p.set(Default::default()));
    let mut meter = Meter {
        abi_input_bytes: input.len() as u64,
        ..Meter::default()
    };
    meter.command_parse_calls += 1;
    let command = serde_json::from_str::<Command>(input);
    let lifecycle = command.as_ref().ok().and_then(|c|rt.sessions.get(&c.receipt)).map(|s|s.lifecycle.clone());
    let structural_prior=command.as_ref().ok().and_then(|c|rt.sessions.get(&c.receipt)).map_or(Default::default(),|s|s.structural_accepted);
    let lifecycle_overflow=lifecycle.as_ref().is_some_and(|l|l.borrow().can_record().is_err());
    let mut tw = TreeWork::default();
    let mut result = command
        .as_ref()
        .map_err(|_| "invalid-command")
        .and_then(|c| if lifecycle_overflow {Err("lifecycle-overflow")}else{plan(rt, c, &mut meter, &mut tw)});
    meter.tree_node_visits = tw.visits;
    meter.tree_path_copies = tw.copies;
    meter.shared_subtrees = tw.shared_subtrees;
    meter.lazy_shifted_subtrees = tw.shifted_subtrees;
    meter.payload_copy_calls += tw.payload_copy_calls;
    meter.ownership_span_visits = tw.ownership_span_visits;
    meter.anchor_comparison_bytes = tw.anchor_comparison_bytes;
    meter.payload_elements_copied += tw.payload_elements_copied;
    meter.payload_string_bytes_copied += tw.payload_string_bytes_copied;
    meter.payload_vector_bytes_copied += tw.payload_vector_bytes_copied;
    meter.position_rewrites = tw.position_rewrites;
    meter.provider_run_id_encoding_passes += tw.provider_run_id_encoding_passes;
    meter.provider_run_id_encoded_bytes += tw.provider_run_id_encoded_bytes;
    meter.source_copy_bytes += tw.source_copy_bytes;
    meter.source_copied_utf16 += tw.source_copied_utf16;
    meter.source_copy_calls += tw.source_copy_calls;
    meter.source_index_utf16 = tw.source_index_utf16;
    meter.source_offset_lookups = tw.source_offset_lookups;
    meter.source_facts_utf16 = meter.source_scan_utf16
        + tw.source_index_utf16
        + tw.source_offset_lookups
        + meter.property_scan_utf16;
    meter.property_facts_utf16 = meter.property_scan_utf16;
    let prior = command
        .as_ref()
        .ok()
        .and_then(|c| rt.sessions.get(&c.receipt))
        .map(|s| s.accepted_work);
    meter.structural.lineage_scalar_writes=if lifecycle.is_some() && !lifecycle_overflow {101+if result.is_ok(){8}else{0}}else{0};
    let mut response = match &result {
        Ok(p) => json!({"status":"Accepted","nextReceipt":p.receipt,"nextRevision":p.revision,
            "affectedSummary":{"sourceBindingDigest":p.binding,"revisionDigest":p.digest,"work":{},
            "acceptedCumulativeWork":prior,"structuralSnapshot":p.structures}}),
        Err(reason) => rejection(rt, command.as_ref().ok(), reason),
    };
    response["affectedSummary"]["structuralWork"]=json!(meter.structural);
    if lifecycle_overflow {response["affectedSummary"]["attemptAccounting"]=json!("reported-not-accumulated-overflow");}
    meter.response_value_passes += 1;
    response["affectedSummary"]["work"] = serde_json::to_value(&meter).unwrap();
    let mut bytes = Vec::with_capacity(8192);
    serde_json::to_writer(&mut bytes, &response).unwrap();
    meter.response_encoding_passes = 1;
    meter.response_encoded_bytes = bytes.len() as u64;
    #[cfg(test)]
    super::accounting_tests::record_response_serialization(bytes.len());
    let mut retire_control = false;
    if result.is_ok() {
        meter.publication_preparation_passes += 1;
        meter.publication_preparation_bytes += bytes.len() as u64;
        let c = command.as_ref().unwrap();
        if let Err(reason) = rt.faults.checkpoint(
            &c.receipt,
            c.expected_revision,
            Point::PublicationRefusal,
            &mut meter.fault_work,
        ) {
            result = Err(reason);
            response = rejection(rt, Some(c), reason);
        }
        if result.is_ok() {
            retire_control = rt.faults.prepare_retirement(
                &c.receipt,
                c.expected_revision,
                &mut meter.fault_work,
            );
            // Reserve the known retirement event; it is committed only after
            // preflight succeeds, and removed from rejected attempt counts.
            meter.fault_work.faults_cleared += u64::from(retire_control);
        }
    }
    meter.structural.lineage_scalar_writes=if lifecycle.is_some() && !lifecycle_overflow {101+if result.is_ok(){8}else{0}}else{0};
    response["affectedSummary"]["structuralWork"]=json!(meter.structural);
    meter.response_value_passes += 1;
    response["affectedSummary"]["work"] = serde_json::to_value(&meter).unwrap();
    let mut prepared = PreparedReply::new(response, bytes, &mut meter);
    // Real serialization lengths, output length and exact final slot work are
    // now known. Only the four allocator counters require u64 headroom.
    if result.is_ok() {
        if let Err(reason) = prior.unwrap().preflight(&meter).and_then(|_|structural_prior.preflight()).and_then(|_|lifecycle.as_ref().unwrap().borrow().preflight(&meter)) {
            result = Err(reason);
            meter.fault_work.faults_cleared -= u64::from(retire_control);
            retire_control = false;
            meter.structural.lineage_scalar_writes=101;
            let mut rejected = rejection(rt, command.as_ref().ok(), reason);
            rejected["affectedSummary"]["structuralWork"]=json!(meter.structural);
            meter.response_value_passes += 1;
            rejected["affectedSummary"]["work"] = serde_json::to_value(&meter).unwrap();
            // Overflow after success preparation needs an actual third encoding
            // of the rejection. Keep and report the work of all three outputs.
            prepared = PreparedReply::new(rejected, prepared.into_buffer(), &mut meter);
        }
    }
    let next_receipt = result.as_ref().ok().map(|p| p.receipt.clone());
    let final_structures = result.as_ref().ok().map(|p| p.structures);
    #[cfg(test)]
    let mut probe = {
        let mut p = super::accounting_tests::PUBLICATION_PROBE.with(std::cell::Cell::get);
        p.before_publication = scope.snapshot().array();
        p
    };

    // SOLE LOGICAL PUBLICATION-FINALIZATION CRITICAL SECTION.
    // Exclusive &mut Runtime prevents callbacks/reentry/observation until its
    // ledger is finalized. No typed rejection or recoverable Result below here.
    // OOM/process failure/WASM traps remain excluded from atomic retry.
    if retire_control {
        rt.faults.commit_retirement();
    }
    let mut published = if let Ok(p) = result {
        let c = command.as_ref().unwrap();
        let mut s = rt.sessions.remove(&c.receipt).unwrap();
        s.last_event = p.event;
        s.sibling = None; // An accepted child edit irrevocably invalidates the inverse pair.
        s.source = p.source;
        s.spans = p.spans;
        s.runs = p.runs;
        s.shards = p.shards;
        s.source_binding = p.binding;
        s.revision = p.revision;
        s.structures.current = p.structures.current;
        rt.sessions.insert(p.receipt, s);
        drop(p.digest);
        Some(
            rt.sessions
                .get_mut(next_receipt.as_deref().unwrap())
                .unwrap(),
        )
    } else {
        None
    };
    // All temporary owners are retired while actual allocator accounting is
    // still active, before final response slots are filled.
    drop(command);
    drop(next_receipt);
    #[cfg(test)]
    {
        probe.after_publication = scope.snapshot().array();
        super::accounting_tests::PUBLICATION_PROBE.with(|p| p.set(probe));
    }
    let total = prepared.finish(&mut meter, prior, published.is_some(), &scope);
    if let Some(session) = &mut published {
        session.structural_accepted=structural_prior.total(&meter.structural);
        session.accepted_work = total.unwrap(); // fixed-size scalar assignment
        session.structures = final_structures.unwrap(); // fixed-size accepted maxima
    }
    #[cfg(test)]
    super::accounting_tests::PUBLICATION_PROBE.with(|p| {
        let mut probe = p.get();
        probe.observed = published.is_some();
        probe.after_assignment = scope.snapshot().array();
        p.set(probe);
    });
    if !lifecycle_overflow {if let Some(lifecycle) = lifecycle {lifecycle.borrow_mut().finish(&meter,published.is_some());}}
    prepared.into_string()
}
