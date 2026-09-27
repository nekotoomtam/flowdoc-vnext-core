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
use unicode_script::{Script, UnicodeScript};

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

// Complete, short, final Thai run. Both bounded context segmentations are
// replayed with the authentic immediate left source scalar; the old replay
// must reproduce every retained boundary before the replacement is published.
pub(super) fn thai_edit(
    s: &Session, run: &Run, start: usize, end: usize, replacement: &str,
    m: &mut Meter, w: &mut TreeWork,
) -> Result<(Tree<Run>, Tree<Shard>, usize), &'static str> {
    let old_units = run.end - run.start;
    if old_units > 24 || replacement.len() > 24 || start < run.start || end > run.end {
        return Err("budget-exhaustion");
    }
    // Reserve the source-piece rebuild, old/new shaping and segmentation,
    // and both bounded context segmentations before the first source read.
    // All admitted scalars occupy one UTF-16 unit; the actual meter below is
    // checked after the source replacement as a second line of defense.
    let prior = m.source_scan_utf16 + m.property_scan_utf16 + w.source_index_utf16 + w.source_offset_lookups;
    if prior + (8 * old_units + 7 * (old_units + 8) + 64) as u64 > 512 {
        return Err("budget-exhaustion");
    }
    let mut replacement_units = 0;
    for ch in replacement.chars() {
        m.replacement_scalars_decoded += 1;
        m.source_scan_utf16 += ch.len_utf16() as u64;
        replacement_units += ch.len_utf16();
        if replacement_units > 8 { return Err("budget-exhaustion"); }
    }
    let at = s.shards.at(s.shards.len - 1, w).ok_or("missing-anchor")?;
    let shard = at.materialize(w);
    if shard.start_offset != run.start || shard.end_offset != run.end ||
        shard.run_index != s.run_index_base + s.runs.len - 1 {
        return Err("uncertified-seam");
    }
    let old = s.source.window(run.start, run.end, w)?;
    let mut a = None;
    let mut b = None;
    let mut offset = 0;
    for (byte,ch) in old.char_indices() {
        m.source_scan_utf16 += ch.len_utf16() as u64;
        if offset == start-run.start { a = Some(byte); }
        if offset == end-run.start { b = Some(byte); }
        offset += ch.len_utf16();
    }
    if start == run.end { a = Some(old.len()); }
    if end == run.end { b = Some(old.len()); }
    let a = a.ok_or("scalar-unsafe")?;
    let b = b.ok_or("scalar-unsafe")?;
    let new = format!("{}{}{}", &old[..a], replacement, &old[b..]);
    let new_units = old_units - (end-start) + replacement_units;
    m.source_copy_calls += 1;
    m.source_copy_bytes += new.len() as u64;
    m.source_copied_utf16 += new_units as u64;
    if new_units == 0 || new_units > 32 { return Err("uncertified-seam"); }
    for text in [&old, &new] {
        if !text.chars().next().is_some_and(|c| {m.property_scalar_visits+=1;m.property_scan_utf16+=c.len_utf16() as u64; ('\u{0e01}'..='\u{0e2e}').contains(&c)}) ||
            !text.chars().all(|c| {m.property_scalar_visits+=1; m.property_scan_utf16+=c.len_utf16() as u64; c.script()==Script::Thai}) {
            return Err("uncertified-seam");
        }
    }
    let witness = if run.start == 0 { String::new() } else {
        let value = s.source.window(run.start-1, run.start, w)?;
        m.source_scan_utf16 += 1;
        if !value.chars().next().is_some_and(|c| {m.property_scalar_visits+=1;m.property_scan_utf16+=c.len_utf16() as u64;c.is_ascii_alphabetic()}) {
            return Err("uncertified-seam");
        }
        value
    };
    if !contains(&shard.grapheme_boundaries,start,m) || !contains(&shard.grapheme_boundaries,end,m) {
        return Err("uncertified-boundary");
    }
    let mut before = facts(&old, run.start, run, &s.provider, m, false)?;
    before.line_breaks.retain(|p| {m.line_filter_visits+=1; *p!=run.start || contains(&shard.line_breaks,*p,m)});
    if !equal(&before.glyphs,&shard.glyphs,m) ||
        !equal(&before.grapheme_boundaries,&shard.grapheme_boundaries,m) ||
        !equal(&before.line_breaks,&shard.line_breaks,m) ||
        !equal(&before.concat_unsafe,&shard.concat_unsafe,m) {
        return Err("uncertified-seam");
    }
    let mut next_run = s.runs.at(s.runs.len-1,w).ok_or("missing-anchor")?.materialize(w);
    next_run.end = run.start + new_units;
    next_run.end_byte = run.start_byte + new.len();
    next_run.key.provider_run_id = format!("thai-{}-{}",next_run.start,next_run.end);
    w.position_rewrites += 2;
    w.provider_run_id_encoding_passes += 1;
    w.provider_run_id_encoded_bytes += next_run.key.provider_run_id.len() as u64;
    let mut after = facts(&new,run.start,&next_run,&s.provider,m,false)?;
    let old_context = format!("{witness}{old}");
    let new_context = format!("{witness}{new}");
    m.source_copy_calls += 2;
    m.source_copy_bytes += (old_context.len()+new_context.len()) as u64;
    m.source_copied_utf16 += (old_units+new_units+2*witness.len()) as u64;
    let (old_g,old_l)=segment(&old_context,run.start-witness.len(),m);
    let (new_g,new_l)=segment(&new_context,run.start-witness.len(),m);
    let old_g:Vec<_>=old_g.into_iter().filter(|p| {m.line_filter_visits+=1;*p>=run.start}).collect();
    let old_l:Vec<_>=old_l.into_iter().filter(|p| {m.line_filter_visits+=1;*p>=run.start}).collect();
    let new_g:Vec<_>=new_g.into_iter().filter(|p| {m.line_filter_visits+=1;*p>=run.start}).collect();
    let new_l:Vec<_>=new_l.into_iter().filter(|p| {m.line_filter_visits+=1;*p>=run.start}).collect();
    if !equal(&old_g,&shard.grapheme_boundaries,m) || !equal(&old_l,&shard.line_breaks,m) ||
        !contains(&new_g,run.start,m) || !contains(&new_g,next_run.end,m) {
        return Err("uncertified-boundary");
    }
    after.grapheme_boundaries=new_g;
    after.line_breaks=new_l;
    after.run_index=shard.run_index;
    let delta=Delta{units:new_units as isize-old_units as isize,bytes:new.len() as isize-old.len() as isize};
    Ok((s.runs.replace_and_shift(s.runs.len-1,next_run,delta,w),
        s.shards.replace_and_shift(at.index,after,delta,w),replacement_units))
}

// Removing an AL terminator cannot change the preceding contiguous SA input.
// Check the actual source class and retained endpoint; carry the previous
// shard payload with only its newly owned paragraph EOF line endpoint added.
pub(super) fn latin_tail_deletion(
    s:&Session, run:&Run, m:&mut Meter, w:&mut TreeWork,
) -> Result<(Tree<Run>,Tree<Shard>),&'static str> {
    let units=run.end-run.start;
    let prior=m.source_scan_utf16+m.property_scan_utf16+w.source_index_utf16+w.source_offset_lookups;
    if units==0 || units>24 || s.shards.len<2 || s.runs.len<2 || prior+(8*units+64) as u64>512 {
        return Err("budget-exhaustion");
    }
    let last=s.shards.at(s.shards.len-1,w).ok_or("missing-anchor")?;
    let shard=last.materialize(w);
    if shard.start_offset!=run.start || shard.end_offset!=run.end ||
        shard.run_index!=s.run_index_base+s.runs.len-1 {return Err("uncertified-seam");}
    let previous_at=s.shards.at(s.shards.len-2,w).ok_or("missing-anchor")?;
    let mut previous=previous_at.materialize(w);
    m.boundary_comparisons+=1;
    if previous.end_offset!=run.start || previous.grapheme_boundaries.last()!=Some(&run.start) ||
        previous.run_index==shard.run_index {return Err("uncertified-seam");}
    let witness=s.source.window(run.start-1,run.start,w)?;
    m.source_scan_utf16+=1;
    if !witness.chars().next().is_some_and(|c| {m.property_scalar_visits+=1;m.property_scan_utf16+=c.len_utf16() as u64;('\u{0e01}'..='\u{0e2e}').contains(&c)}) {
        return Err("uncertified-seam");
    }
    let old=s.source.window(run.start,run.end,w)?;
    if !old.chars().all(|c| {m.property_scalar_visits+=1;m.property_scan_utf16+=c.len_utf16() as u64;c.is_ascii_alphabetic()}) {
        return Err("uncertified-seam");
    }
    let mut before=facts(&old,run.start,run,&s.provider,m,false)?;
    before.line_breaks.retain(|p| {m.line_filter_visits+=1;*p!=run.start || contains(&shard.line_breaks,*p,m)});
    if !equal(&before.glyphs,&shard.glyphs,m) ||
        !equal(&before.grapheme_boundaries,&shard.grapheme_boundaries,m) ||
        !equal(&before.line_breaks,&shard.line_breaks,m) ||
        !equal(&before.concat_unsafe,&shard.concat_unsafe,m) {
        return Err("uncertified-seam");
    }
    let context=format!("{witness}{old}");
    m.source_copy_calls+=1;
    m.source_copy_bytes+=context.len() as u64;
    m.source_copied_utf16+=(units+1) as u64;
    let (g,l)=segment(&context,run.start-1,m);
    let suffix_g:Vec<_>=g.iter().copied().filter(|p| {m.line_filter_visits+=1;*p>=run.start}).collect();
    let suffix_l:Vec<_>=l.iter().copied().filter(|p| {m.line_filter_visits+=1;*p>run.start}).collect();
    let retained_l:Vec<_>=shard.line_breaks.iter().copied().filter(|p| {m.line_filter_visits+=1;*p>run.start}).collect();
    let copied=suffix_g.len()+suffix_l.len()+retained_l.len();
    m.payload_copy_calls+=3;
    m.payload_elements_copied+=copied as u64;
    m.payload_vector_bytes_copied+=(copied*std::mem::size_of::<usize>()) as u64;
    if !equal(&suffix_g,&shard.grapheme_boundaries,m) ||
        !equal(&suffix_l,&retained_l,m) ||
        !contains(&g,run.start,m) || !contains(&g,run.end,m) || !contains(&l,run.end,m) {
        return Err("uncertified-boundary");
    }
    if !contains(&previous.line_breaks,run.start,m) {
        previous.line_breaks.push(run.start);
        m.payload_copy_calls += 1;
        m.payload_elements_copied += 1;
        m.payload_vector_bytes_copied += std::mem::size_of::<usize>() as u64;
    }
    Ok((s.runs.without_last(w),s.shards.without_last(w).replace_and_shift(s.shards.len-2,previous,Delta::default(),w)))
}
