// Bounded tail transition certificate. No caller facts or paragraph fallback.
// ICU 2.2 line.rs::line_handle_complex_language_utf8 collects only contiguous
// SA input and stops at the first non-SA. The admitted alphabets are ASCII AL
// and Thai consonant SA. A complete run plus an actual opposite-class outer
// neighbor preserves every external dictionary input and AL/SA boundary. A
// style/run edge alone is never the witness. Appending the opposite class does
// not alter the old shaping run. Local provider replay checks retained facts;
// combined segmentation checks the newly authored seam, not artificial edges.
use super::{
    command_work::Meter,
    commands::facts,
    model::*,
    ownership::Selection,
    position::Delta,
    runtime::Session,
    tree::{Tree, TreeWork},
};
use icu_segmenter::{GraphemeClusterSegmenter, LineSegmenter};

fn class(c: char, m: &mut Meter) -> Option<&'static str> {
    m.property_scalar_visits += 1;
    m.property_scan_utf16 += c.len_utf16() as u64;
    if c.is_ascii_alphabetic() {
        Some("Latin")
    } else if ('\u{0e01}'..='\u{0e2e}').contains(&c) {
        Some("Thai")
    } else {
        None
    }
}
pub(super) fn opposite(text: &str, old: &str, m: &mut Meter) -> bool {
    text.chars()
        .next()
        .and_then(|c| class(c, m))
        .is_some_and(|s| s != old)
}
fn equal<T: PartialEq>(a: &[T], b: &[T], m: &mut Meter) -> bool {
    a.len() == b.len()
        && a.iter().zip(b).all(|(a, b)| {
            m.fact_comparisons += 1;
            a == b
        })
}
fn contains(values: &[usize], p: usize, m: &mut Meter) -> bool {
    values.iter().any(|v| {
        m.boundary_comparisons += 1;
        *v == p
    })
}
fn key_equal(a: &str, b: &str, m: &mut Meter) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.bytes().zip(b.bytes()).all(|(a, b)| {
        m.context_key_comparison_bytes += 1;
        a == b
    })
}
pub(super) struct Prepared {
    old: String,
    text: String,
    run: Run,
    shard: Shard,
    index: usize,
}
pub(super) fn prepare(
    s: &Session,
    old_run: &Run,
    ownership: &Selection,
    text: &str,
    m: &mut Meter,
    w: &mut TreeWork,
) -> Result<Prepared, &'static str> {
    let n = s.source.utf16();
    let old_units = old_run.end - old_run.start;
    // Reserve a fixed upper bound before reading any window: old <=32 and
    // new <=8 one-unit scalars. Even repeated property/coverage scans, three
    // provider offset passes, append indexing and neighbor reads stay <512;
    // provider input is 3*(old+new)+2*(old+new) <=200, below1024.
    // Bytes bound decoding too: these admitted scalars are one UTF-16 unit.
    if old_units > 32 || text.len() > 24 {
        return Err("budget-exhaustion");
    }
    let mut units = 0;
    let mut script = None;
    for c in text.chars() {
        m.replacement_scalars_decoded += 1;
        m.source_scan_utf16 += c.len_utf16() as u64;
        let current = class(c, m).ok_or("uncertified-seam")?;
        if script.is_some_and(|s| s != current) {
            return Err("uncertified-seam");
        }
        script = Some(current);
        units += c.len_utf16();
    }
    if units > 8 || units == 0 {
        return Err("budget-exhaustion");
    }
    let script = script.unwrap();
    if script == old_run.key.script {
        return Err("uncertified-seam");
    }
    let at = s.shards.at(s.shards.len - 1, w).ok_or("missing-anchor")?;
    let shard = at.materialize(w);
    if shard.start_offset != old_run.start || shard.end_offset != n {
        return Err("uncertified-seam");
    }
    let old = s.source.window(old_run.start, n, w)?;
    if !old
        .chars()
        .all(|c| class(c, m) == Some(old_run.key.script.as_str()))
    {
        return Err("uncertified-seam");
    }
    if old_run.start > 0 {
        let neighbor = s.source.window(old_run.start - 1, old_run.start, w)?;
        m.source_scan_utf16 += 1;
        if neighbor.chars().next().and_then(|c| class(c, m)) != Some(script) {
            return Err("uncertified-seam");
        }
        // The actual neighboring source class is the witness, not run identity.
        m.context_run_visits += 1;
    }
    let authored = ownership.span.language.as_deref().unwrap_or("und");
    let mut language = None;
    for rule in &s.provider.policy.language_rules {
        m.policy_rule_visits += 1;
        if key_equal(&rule.authored_language, authored, m) && key_equal(&rule.script, script, m) {
            language = Some(rule.language.as_str());
            break;
        }
    }
    let language = language.ok_or("missing-language-rule")?;
    let mut route = None;
    for (font, features) in s
        .provider
        .policy
        .font_route_rules
        .iter()
        .zip(&s.provider.policy.feature_rules)
    {
        m.policy_rule_visits += 1;
        if key_equal(
            &font.style_key,
            ownership.span.style_key.as_deref().unwrap_or(""),
            m,
        ) && key_equal(&font.language, language, m)
            && key_equal(&font.script, script, m)
        {
            route = Some((font, features));
            break;
        }
    }
    let (route, features) = route.ok_or("missing-font-route")?;
    // All reviewed fonts must cover every scalar, in configured resource order.
    let mut resource = None;
    for id in &route.resources {
        for (i, font) in s.provider.fonts.iter().enumerate() {
            m.policy_rule_visits += 1;
            if !key_equal(&font.resource_id, id, m) {
                continue;
            }
            m.font_parse_calls += 1;
            m.font_parse_input_bytes += font.bytes.len() as u64;
            let face = rustybuzz::Face::from_slice(&font.bytes, 0).ok_or("provider-failure")?;
            let covered = text.chars().all(|c| {
                m.property_scalar_visits += 1;
                m.property_scan_utf16 += c.len_utf16() as u64;
                face.glyph_index(c).is_some()
            });
            if covered {
                resource = Some(i);
                break;
            }
        }
        if resource.is_some() {
            break;
        }
    }
    let resource_index = resource.ok_or("unsupported-font-script")?;
    let run_id = format!("{}-{}-{}", script.to_ascii_lowercase(), n, n + units);
    m.provider_run_id_encoding_passes += 1;
    m.provider_run_id_encoded_bytes += run_id.len() as u64;
    let run = Run {
        start: n,
        end: n + units,
        start_byte: s.source.bytes(),
        end_byte: s.source.bytes() + text.len(),
        key: Key {
            script: script.into(),
            direction: route.direction.clone(),
            provider_run_id: run_id,
            paragraph_base_direction: s.paragraph.base_direction.clone(),
            writing_mode: s.paragraph.writing_mode.clone(),
            language: route.language.clone(),
            font_id: route.font_id.clone(),
            features: features.features.clone(),
            provider_id: s.provider.provider_id.clone(),
            provider_revision: s.provider.provider_revision.clone(),
        },
        span_indexes: vec![ownership.index + s.span_index_base].into(),
        resource_index,
    };
    use super::position::Positioned;
    m.payload_copy_calls += 1;
    m.payload_elements_copied += run.copy_elements() as u64;
    m.payload_string_bytes_copied += run.copy_string_bytes() as u64;
    m.payload_vector_bytes_copied +=
        run.copy_vector_bytes() as u64 + std::mem::size_of::<usize>() as u64;
    m.source_copy_calls += 1;
    m.source_copy_bytes += text.len() as u64;
    m.source_copied_utf16 += units as u64;
    Ok(Prepared {
        old,
        text: text.to_owned(),
        run,
        shard,
        index: at.index,
    })
}
fn segment(text: &str, base: usize, m: &mut Meter) -> (Vec<usize>, Vec<usize>) {
    let mut offsets = vec![usize::MAX; text.len() + 1];
    m.provider_offset_slots_initialized += offsets.len() as u64;
    let mut n = 0;
    for (b, c) in text.char_indices() {
        offsets[b] = base + n;
        n += c.len_utf16();
        m.source_scan_utf16 += c.len_utf16() as u64;
    }
    offsets[text.len()] = base + n;
    m.segmentation_setup_calls += 2;
    m.segmentation_calls += 2;
    m.segmentation_input_utf16 += 2 * n as u64;
    m.shaping_segmentation_input_utf16 += 2 * n as u64;
    m.old_new_provider_input_utf16 += 2 * n as u64;
    let graphemes = GraphemeClusterSegmenter::new()
        .segment_str(text)
        .map(|b| {
            m.provider_offset_lookups += 1;
            offsets[b]
        })
        .collect();
    let lines = LineSegmenter::new_auto(Default::default())
        .segment_str(text)
        .map(|b| {
            m.provider_offset_lookups += 1;
            offsets[b]
        })
        .collect();
    (graphemes, lines)
}
pub(super) fn certify(
    s: &Session,
    old_run: &Run,
    p: Prepared,
    m: &mut Meter,
    w: &mut TreeWork,
) -> Result<(Tree<Run>, Tree<Shard>), &'static str> {
    let Prepared {
        old,
        text,
        run,
        mut shard,
        index,
    } = p;
    let mut before = facts(&old, old_run.start, old_run, &s.provider, m, false)?;
    before.line_breaks.retain(|v| {
        m.line_filter_visits += 1;
        *v != old_run.start || contains(&shard.line_breaks, *v, m)
    });
    if !equal(&before.glyphs, &shard.glyphs, m)
        || !equal(&before.grapheme_boundaries, &shard.grapheme_boundaries, m)
        || !equal(&before.line_breaks, &shard.line_breaks, m)
        || !equal(&before.concat_unsafe, &shard.concat_unsafe, m)
    {
        return Err("uncertified-seam");
    }
    let mut after = facts(&text, run.start, &run, &s.provider, m, false)?;
    let combined = format!("{old}{text}");
    m.source_copy_calls += 1;
    m.source_copy_bytes += combined.len() as u64;
    m.source_copied_utf16 += (run.end - old_run.start) as u64;
    let (graphemes, lines) = segment(&combined, old_run.start, m);
    let old_graphemes: Vec<_> = graphemes
        .iter()
        .copied()
        .filter(|p| {
            m.line_filter_visits += 1;
            *p <= run.start
        })
        .collect();
    let old_lines: Vec<_> = lines
        .iter()
        .copied()
        .filter(|p| {
            m.line_filter_visits += 1;
            *p < run.start && (*p != old_run.start || contains(&shard.line_breaks, *p, m))
        })
        .collect();
    let retained_lines: Vec<_> = shard
        .line_breaks
        .iter()
        .copied()
        .filter(|p| {
            m.line_filter_visits += 1;
            *p < run.start
        })
        .collect();
    m.payload_copy_calls += 1;
    m.payload_elements_copied += retained_lines.len() as u64;
    m.payload_vector_bytes_copied += (retained_lines.len() * std::mem::size_of::<usize>()) as u64;
    if !equal(&old_graphemes, &shard.grapheme_boundaries, m)
        || !equal(&old_lines, &retained_lines, m)
    {
        return Err("uncertified-boundary");
    }
    shard.line_breaks = old_lines;
    after.grapheme_boundaries = graphemes
        .into_iter()
        .filter(|p| {
            m.line_filter_visits += 1;
            *p >= run.start
        })
        .collect();
    after.line_breaks = lines
        .into_iter()
        .filter(|p| {
            m.line_filter_visits += 1;
            *p >= run.start
        })
        .collect();
    after.run_index = s.run_index_base + s.runs.len;
    let runs = s.runs.append(run, w);
    let shards = s
        .shards
        .replace_and_shift(index, shard, Delta::default(), w)
        .append(after, w);
    Ok((runs, shards))
}
