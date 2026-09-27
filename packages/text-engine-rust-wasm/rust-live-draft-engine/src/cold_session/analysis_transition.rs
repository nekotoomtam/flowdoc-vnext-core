// Bounded analysis-run transitions. Source delimiters certify ICU context;
// actual old/new interior concat flags certify the unchanged shaping edges.
use super::{
    command_work::Meter,
    commands::facts,
    local_window::{equal, has, part, reserve, retained_safe, safe, scalar, shifted},
    model::*,
    ownership::Selection,
    position::{Delta, Positioned},
    runtime::Session,
    tree::{Tree, TreeWork},
};
use unicode_script::{Script, UnicodeScript};

fn copy<T: Positioned>(v: &T, m: &mut Meter) {
    m.payload_copy_calls += 1;
    m.payload_elements_copied += v.copy_elements() as u64;
    m.payload_string_bytes_copied += v.copy_string_bytes() as u64;
    m.payload_vector_bytes_copied += v.copy_vector_bytes() as u64;
}
fn key_eq(a: &str, b: &str, m: &mut Meter) -> bool {
    a.len() == b.len()
        && a.bytes().zip(b.bytes()).all(|(a, b)| {
            m.context_key_comparison_bytes += 1;
            a == b
        })
}
fn id(r: &mut Run, m: &mut Meter) {
    r.key.provider_run_id = format!(
        "{}-{}-{}",
        r.key.script.to_ascii_lowercase(),
        r.start,
        r.end
    );
    m.provider_run_id_encoding_passes += 1;
    m.provider_run_id_encoded_bytes += r.key.provider_run_id.len() as u64;
}
fn resolve(
    s: &Session,
    o: &Selection,
    script: &str,
    text: &str,
    start: usize,
    end: usize,
    start_byte: usize,
    end_byte: usize,
    m: &mut Meter,
    w: &TreeWork,
) -> Result<Run, &'static str> {
    let authored = o.span.language.as_deref().unwrap_or("und");
    let language = s
        .provider
        .policy
        .language_rules
        .iter()
        .find(|r| {
            m.policy_rule_visits += 1;
            key_eq(&r.authored_language, authored, m) && key_eq(&r.script, script, m)
        })
        .ok_or("missing-language-rule")?;
    let (route, features) = s
        .provider
        .policy
        .font_route_rules
        .iter()
        .zip(&s.provider.policy.feature_rules)
        .find(|(r, _)| {
            m.policy_rule_visits += 1;
            key_eq(&r.style_key, o.span.style_key.as_deref().unwrap_or(""), m)
                && key_eq(&r.language, &language.language, m)
                && key_eq(&r.script, script, m)
        })
        .ok_or("missing-font-route")?;
    if route.resources.len() != 1 {
        return Err("uncertified-seam");
    }
    reserve(m, w, end - start, 0)?;
    let mut resource = None;
    for resource_id in &route.resources {
        for (i, font) in s.provider.fonts.iter().enumerate() {
            m.policy_rule_visits += 1;
            if !key_eq(&font.resource_id, resource_id, m) {
                continue;
            }
            m.font_parse_calls += 1;
            m.font_parse_input_bytes += font.bytes.len() as u64;
            let face = rustybuzz::Face::from_slice(&font.bytes, 0).ok_or("provider-failure")?;
            let mut covered = true;
            for c in text.chars() {
                reserve(m, w, c.len_utf16(), 0)?;
                m.property_scalar_visits += 1;
                m.property_scan_utf16 += c.len_utf16() as u64;
                if face.glyph_index(c).is_none() {
                    covered = false;
                    break;
                }
            }
            if covered {
                resource = Some(i);
                break;
            }
        }
        if resource.is_some() {
            break;
        }
    }
    let mut r = Run {
        start,
        end,
        start_byte,
        end_byte,
        key: Key {
            script: script.into(),
            direction: route.direction.clone(),
            provider_run_id: String::new(),
            paragraph_base_direction: s.paragraph.base_direction.clone(),
            writing_mode: s.paragraph.writing_mode.clone(),
            language: route.language.clone(),
            font_id: route.font_id.clone(),
            features: features.features.clone(),
            provider_id: s.provider.provider_id.clone(),
            provider_revision: s.provider.provider_revision.clone(),
        },
        span_indexes: vec![o.index + s.span_index_base].into(),
        resource_index: resource.ok_or("unsupported-font-script")?,
    };
    id(&mut r, m);
    copy(&r, m);
    m.payload_vector_bytes_copied += std::mem::size_of::<usize>() as u64;
    Ok(r)
}
fn class(c: char, m: &mut Meter, w: &TreeWork) -> Result<Script, &'static str> {
    reserve(m, w, 2 * c.len_utf16(), 0)?;
    m.property_scalar_visits += 2;
    m.property_scan_utf16 += 2 * c.len_utf16() as u64;
    let script = c.script();
    let data = icu_segmenter::provider::Baked::SINGLETON_SEGMENTER_BREAK_LINE_V1;
    let line = data.property_table.get32(c as u32);
    if c == ' '
        || c.is_ascii_alphabetic()
        || script == Script::Thai && line == data.complex_property
    {
        Ok(script)
    } else {
        Err("uncertified-seam")
    }
}
fn empty(start: usize, end: usize) -> Shard {
    Shard {
        run_index: 0,
        start_offset: start,
        end_offset: end,
        glyphs: vec![],
        concat_unsafe: vec![],
        line_breaks: vec![],
        grapheme_boundaries: vec![],
        start_safe: true,
        end_safe: true,
    }
}
fn extend(out: &mut Shard, p: Shard, m: &mut Meter) {
    copy(&p, m);
    out.glyphs.extend(p.glyphs);
    out.concat_unsafe.extend(p.concat_unsafe);
    out.line_breaks.extend(p.line_breaks);
    for b in p.grapheme_boundaries {
        m.boundary_comparisons += 1;
        if out.grapheme_boundaries.last() != Some(&b) {
            out.grapheme_boundaries.push(b)
        }
    }
}
fn compare(a: &Shard, b: &Shard, m: &mut Meter) -> bool {
    equal(&a.glyphs, &b.glyphs, m)
        && equal(&a.concat_unsafe, &b.concat_unsafe, m)
        && equal(&a.line_breaks, &b.line_breaks, m)
        && equal(&a.grapheme_boundaries, &b.grapheme_boundaries, m)
}
fn replay(
    s: &Session,
    text: &str,
    left: usize,
    runs: &[(Run, usize, usize)],
    m: &mut Meter,
    w: &TreeWork,
) -> Result<Vec<Shard>, &'static str> {
    let mut result = vec![];
    for (r, a, b) in runs {
        // All validated scalars in this profile are one UTF-16 unit.
        let n = r.end - r.start;
        reserve(m, w, 2 * n, 3 * n)?;
        result.push(facts(&text[*a..*b], r.start, r, &s.provider, m, false)?);
    }
    // Per-run segmentation is not a seam proof. Replace it with actual
    // concatenated source segmentation, including all affected SA segments.
    let n = runs.last().ok_or("uncertified-seam")?.0.end - left;
    reserve(m, w, n, 2 * n)?;
    let (g, l) = super::tail_seam::segment(text, left, m);
    for sh in &mut result {
        sh.grapheme_boundaries = g
            .iter()
            .copied()
            .filter(|p| {
                m.boundary_comparisons += 1;
                *p >= sh.start_offset && *p <= sh.end_offset
            })
            .collect();
        sh.line_breaks = l
            .iter()
            .copied()
            .filter(|p| {
                m.line_filter_visits += 1;
                *p >= sh.start_offset
                    && (*p < sh.end_offset || *p == left + n && *p == sh.end_offset)
            })
            .collect();
        m.payload_copy_calls += 1;
        m.payload_elements_copied += (sh.grapheme_boundaries.len() + sh.line_breaks.len()) as u64;
        m.payload_vector_bytes_copied += ((sh.grapheme_boundaries.len() + sh.line_breaks.len())
            * std::mem::size_of::<usize>()) as u64;
    }
    Ok(result)
}
pub(super) fn edit(
    s: &Session,
    o: &Selection,
    start: usize,
    end: usize,
    replacement: &str,
    m: &mut Meter,
    w: &mut TreeWork,
    before_provider: impl FnOnce(&mut Meter) -> Result<(), &'static str>,
) -> Result<(Tree<Run>, Tree<Shard>, usize, Delta), &'static str> {
    if o.edge || replacement.len() > 24 || end - start > 16 {
        return Err("uncertified-seam");
    }
    m.seam_search_windows += 1;
    let n = s.source.utf16();
    let mut left = start;
    while left > 0 {
        if start - left >= 24 {
            return Err("budget-exhaustion");
        }
        left -= 1;
        if scalar(s, left, m, w)? == ' '
            && start - left >= if end == n { 8 } else { 1 }
            && retained_safe(s, left + 1, m, w)
        {
            break;
        }
    }
    let cut = if left == 0 { 0 } else { left + 1 };
    let previous = if left > 0 {
        let c = scalar(s, left - 1, m, w)?;
        let script = class(c, m, w)?;
        if !matches!(script, Script::Latin | Script::Thai) {
            return Err("uncertified-seam");
        }
        Some(script)
    } else {
        None
    };
    let mut right = end;
    while right < n {
        if right - end >= 24 {
            return Err("budget-exhaustion");
        }
        if scalar(s, right, m, w)? == ' '
            && right + 1 > end
            && right + 1 < n
            && retained_safe(s, right + 1, m, w)
        {
            right += 1;
            break;
        }
        right += 1;
    }
    let mut stop = right;
    while stop < n {
        if stop - right >= 24 {
            return Err("budget-exhaustion");
        }
        if scalar(s, stop, m, w)? == ' ' {
            stop += 1;
            break;
        }
        stop += 1;
    }
    if left < o.span.start_offset || stop > o.span.end_offset {
        return Err("uncertified-seam");
    }
    let old_n = stop - left;
    reserve(m, w, old_n + replacement.len() + 12, 0)?;
    w.source_allowance(
        m.source_scan_utf16 + m.property_scan_utf16 + (old_n + replacement.len() + 12) as u64,
    );
    let old = s.source.window(left, stop, w)?;
    let mut bytes = vec![];
    for (b, c) in old.char_indices() {
        w.source_index_utf16 += c.len_utf16() as u64;
        if c.len_utf16() != 1 {
            return Err("scalar-unsafe");
        }
        bytes.push(b)
    }
    bytes.push(old.len());
    reserve(m, w, 2, 0)?;
    w.source_offset_lookups += 2;
    let a = bytes[start - left];
    let b = bytes[end - left];
    let mut units = 0;
    for c in replacement.chars() {
        units += c.len_utf16();
        m.source_scan_utf16 += c.len_utf16() as u64;
        m.replacement_scalars_decoded += 1;
    }
    let new = format!("{}{}{}", &old[..a], replacement, &old[b..]);
    m.source_copy_calls += 1;
    m.source_copy_bytes += new.len() as u64;
    m.source_copied_utf16 += (old_n - (end - start) + units) as u64;
    let mut d = Delta {
        units: units as isize - (end - start) as isize,
        bytes: replacement.len() as isize - (b - a) as isize,
        runs: 0,
    };
    let first_run = s.runs.containing(left, w).ok_or("missing-anchor")?;
    let last_run = s.runs.containing(stop - 1, w).ok_or("missing-anchor")?;
    let mut old_runs = vec![];
    let mut original = vec![];
    for i in first_run.index..=last_run.index {
        let mut r = s.runs.at(i, w).unwrap().materialize(w);
        m.context_run_visits += 1;
        if r.span_indexes.as_ref() != [o.index + s.span_index_base] {
            return Err("uncertified-seam");
        }
        copy(&r, m);
        original.push(r.clone());
        r.start = r.start.max(left);
        r.end = r.end.min(stop);
        w.position_rewrites += 2;
        reserve(m, w, 2, 0)?;
        w.source_offset_lookups += 2;
        old_runs.push((r.clone(), bytes[r.start - left], bytes[r.end - left]));
        copy(&r, m);
    }
    reserve(m, w, 2 * old_n, 0)?;
    let mut old_scripts = Vec::new();
    for c in old.chars() {
        old_scripts.push(class(c, m, w)?);
    }
    m.payload_copy_calls += 1;
    m.payload_elements_copied += old_scripts.len() as u64;
    m.payload_vector_bytes_copied += (old_scripts.len() * std::mem::size_of::<Script>()) as u64;
    let mut resolved = vec![];
    let mut prior = previous;
    reserve(m, w, 3 * d.unit(old_n), 0)?;
    for (index, (byte, c)) in new.char_indices().enumerate() {
        reserve(m, w, 2, 0)?;
        m.source_scan_utf16 += c.len_utf16() as u64;
        let script = if index < start - left {
            reserve(m, w, 1, 0)?;
            m.property_scalar_visits += 1;
            m.property_scan_utf16 += 1;
            old_scripts[index]
        } else if index >= start - left + units {
            reserve(m, w, 1, 0)?;
            m.property_scalar_visits += 1;
            m.property_scan_utf16 += 1;
            old_scripts[index - units + (end - start)]
        } else {
            class(c, m, w)?
        };
        if matches!(script, Script::Latin | Script::Thai) {
            prior = Some(script)
        }
        resolved.push((byte, prior));
    }
    m.payload_copy_calls += 1;
    m.payload_elements_copied += resolved.len() as u64;
    m.payload_vector_bytes_copied +=
        (resolved.len() * std::mem::size_of::<(usize, Option<Script>)>()) as u64;
    if previous.is_none() {
        let mut next = None;
        for (_, script) in resolved.iter_mut().rev() {
            reserve(m, w, 1, 0)?;
            m.property_scalar_visits += 1;
            m.property_scan_utf16 += 1;
            if script.is_some() {
                next = *script
            } else {
                *script = next
            }
        }
    }
    // Original run can start before the source window; use source's bounded
    // byte lookup rather than scanning its preceding text.
    w.source_allowance(m.source_scan_utf16 + m.property_scan_utf16);
    let base_byte = s.source.byte_offset(left, w)?;
    let mut new_runs = vec![];
    let mut i = 0;
    while i < resolved.len() {
        reserve(m, w, 1, 0)?;
        m.property_scalar_visits += 1;
        m.property_scan_utf16 += 1;
        let script = resolved[i].1.ok_or("unsupported-font-script")?;
        let mut j = i + 1;
        while j < resolved.len() {
            reserve(m, w, 1, 0)?;
            m.property_scalar_visits += 1;
            m.property_scan_utf16 += 1;
            if resolved[j].1 != Some(script) {
                break;
            }
            j += 1
        }
        reserve(m, w, 2, 0)?;
        w.source_offset_lookups += 2;
        let a = resolved[i].0;
        let b = resolved.get(j).map_or(new.len(), |v| v.0);
        let r = resolve(
            s,
            o,
            script.full_name(),
            &new[a..b],
            left + i,
            left + j,
            base_byte + a,
            base_byte + b,
            m,
            w,
        )?;
        new_runs.push((r, a, b));
        i = j;
    }
    before_provider(m)?;
    let before = replay(s, &old, left, &old_runs, m, w)?;
    let after = replay(s, &new, left, &new_runs, m, w)?;
    let compare_stop = if stop == n { stop } else { stop - 1 };
    let mut expected = empty(cut, compare_stop);
    let first = s.shards.containing(cut, w).ok_or("missing-anchor")?;
    let last = s.shards.containing(stop - 1, w).ok_or("missing-anchor")?;
    let mut retained = vec![];
    for index in first.index..=last.index {
        let sh = s.shards.at(index, w).unwrap().materialize(w);
        extend(
            &mut expected,
            part(
                &sh,
                cut.max(sh.start_offset),
                compare_stop.min(sh.end_offset),
                stop == n,
                m,
            ),
            m,
        );
        retained.push(sh)
    }
    let mut old_fact = empty(cut, compare_stop);
    for sh in &before {
        extend(
            &mut old_fact,
            part(
                sh,
                cut.max(sh.start_offset),
                compare_stop.min(sh.end_offset),
                stop == n,
                m,
            ),
            m,
        )
    }
    if !compare(&old_fact, &expected, m) {
        return Err("uncertified-seam");
    }
    if !has(&expected.grapheme_boundaries, start, m) || !has(&expected.grapheme_boundaries, end, m)
    {
        return Err("uncertified-boundary");
    }
    let mut new_fact = empty(cut, d.unit(compare_stop));
    for sh in &after {
        extend(
            &mut new_fact,
            part(
                sh,
                cut.max(sh.start_offset),
                d.unit(compare_stop).min(sh.end_offset),
                stop == n,
                m,
            ),
            m,
        )
    }
    if cut > 0 && (!safe(&expected, cut, m) || !safe(&new_fact, cut, m)) {
        return Err("uncertified-seam");
    }
    if right < n {
        if !safe(&expected, right, m) || !safe(&new_fact, d.unit(right), m) {
            return Err("uncertified-seam");
        }
        let old_guard = part(&old_fact, right, compare_stop, stop == n, m);
        let new_guard = shifted(
            part(&new_fact, d.unit(right), d.unit(compare_stop), stop == n, m),
            d.inverse(),
            w,
        );
        if !compare(&old_guard, &new_guard, m) {
            return Err("uncertified-seam");
        }
    }
    for (r, _, _) in &new_runs {
        if !has(&new_fact.grapheme_boundaries, r.start, m) && r.start >= cut
            || !has(&new_fact.grapheme_boundaries, r.end, m) && r.end <= d.unit(compare_stop)
        {
            return Err("uncertified-boundary");
        }
    }
    let mut runs: Vec<Run> = new_runs.into_iter().map(|(r, _, _)| r).collect();
    let head = &original[0];
    let tail = original.last().unwrap();
    if left > head.start {
        if !key_eq(&runs[0].key.script, &head.key.script, m) {
            return Err("uncertified-seam");
        }
        runs[0].start = head.start;
        runs[0].start_byte = head.start_byte;
        w.position_rewrites += 2;
    }
    if stop < tail.end {
        let last = runs.last_mut().ok_or("uncertified-seam")?;
        if !key_eq(&last.key.script, &tail.key.script, m) {
            return Err("uncertified-seam");
        }
        last.end = d.unit(tail.end);
        last.end_byte = d.byte(tail.end_byte);
        w.position_rewrites += 2;
    }
    for r in &mut runs {
        id(r, m);
    }
    d.runs = runs.len() as isize - original.len() as isize;
    let rank_for = |p: usize, m: &mut Meter| -> Result<usize, &'static str> {
        runs.iter()
            .position(|r| {
                m.context_run_visits += 1;
                p >= r.start && p < r.end
            })
            .map(|i| first_run.index + s.run_index_base + i)
            .ok_or("missing-anchor")
    };
    let mut values = vec![];
    for sh in &retained {
        if sh.start_offset < cut {
            let mut p = part(sh, sh.start_offset, cut, false, m);
            p.run_index = rank_for(p.start_offset, m)?;
            w.position_rewrites += 1;
            values.push(p)
        }
    }
    for sh in &after {
        let a = cut.max(sh.start_offset);
        let b = d.unit(right).min(sh.end_offset);
        if a < b {
            let mut p = part(sh, a, b, right == n, m);
            p.run_index = rank_for(a, m)?;
            w.position_rewrites += 1;
            values.push(p)
        }
    }
    for sh in &retained {
        if sh.end_offset > right {
            let mut p = shifted(
                part(
                    sh,
                    right.max(sh.start_offset),
                    sh.end_offset,
                    sh.end_offset == n,
                    m,
                ),
                Delta { runs: 0, ..d },
                w,
            );
            p.run_index = rank_for(p.start_offset, m)?;
            w.position_rewrites += 1;
            values.push(p)
        }
    }
    let next_runs = s.runs.splice(
        first_run.index,
        last_run.index + 1,
        runs,
        Delta { runs: 0, ..d },
        w,
    );
    let next_shards = s.shards.splice(first.index, last.index + 1, values, d, w);
    Ok((next_runs, next_shards, units, Delta { runs: 0, ..d }))
}
