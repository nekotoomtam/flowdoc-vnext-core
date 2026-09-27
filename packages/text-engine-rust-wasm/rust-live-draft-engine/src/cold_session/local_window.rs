use super::{
    command_work::Meter,
    commands::facts,
    model::*,
    position::{Delta, Positioned},
    runtime::Session,
    tree::{Tree, TreeWork},
};
use unicode_script::{Script, UnicodeScript};

fn reserve(m: &Meter, w: &TreeWork, source: usize, provider: usize) -> Result<(), &'static str> {
    if m.source_scan_utf16
        + m.property_scan_utf16
        + w.source_index_utf16
        + w.source_offset_lookups
        + source as u64
        > 512
        || m.shaping_segmentation_input_utf16 + provider as u64 > 1024
    {
        Err("budget-exhaustion")
    } else {
        Ok(())
    }
}
fn scalar(s: &Session, p: usize, m: &mut Meter, w: &mut TreeWork) -> Result<char, &'static str> {
    reserve(m, w, 4, 0)?;
    w.source_allowance(m.source_scan_utf16 + m.property_scan_utf16 + 2);
    let text = s.source.window(p, p + 1, w)?;
    m.source_scan_utf16 += 1;
    text.chars().next().ok_or("scalar-unsafe")
}
fn has(xs: &[usize], p: usize, m: &mut Meter) -> bool {
    xs.iter().any(|x| {
        m.boundary_comparisons += 1;
        *x == p
    })
}
fn equal<T: PartialEq>(a: &[T], b: &[T], m: &mut Meter) -> bool {
    a.len() == b.len()
        && a.iter().zip(b).all(|(a, b)| {
            m.fact_comparisons += 1;
            a == b
        })
}
fn safe(shard: &Shard, p: usize, m: &mut Meter) -> bool {
    let mut found = false;
    for (g, flag) in shard.glyphs.iter().zip(&shard.concat_unsafe) {
        m.seam_search_glyphs += 1;
        if g.cluster == p {
            found = true;
            m.concat_edge_checks += 1;
            if *flag || g.unsafe_to_break {
                return false;
            }
        }
    }
    found && has(&shard.grapheme_boundaries, p, m)
}
fn retained_safe(s: &Session, p: usize, m: &mut Meter, w: &mut TreeWork) -> bool {
    let Some(at) = s.shards.containing(p, w) else {
        return false;
    };
    safe(&at.value, at.delta.inverse().unit(p), m)
}
// Keep the existing whole-shard rejection classification when bounded search
// cannot establish a smaller certificate. This only chooses the rejection;
// it neither invokes that path nor spends speculative provider work.
fn search_exhausted(
    s: &Session,
    start: usize,
    end: usize,
    replacement: &str,
    m: &mut Meter,
    w: &mut TreeWork,
) -> &'static str {
    let Some(at) = s.shards.containing(start, w) else {
        return "uncertified-seam";
    };
    let old = at.value.end_offset - at.value.start_offset;
    if end > at.delta.unit(at.value.end_offset) || reserve(m, w, replacement.len(), 0).is_err() {
        return "budget-exhaustion";
    }
    let units = replacement.encode_utf16().count();
    m.source_scan_utf16 += units as u64;
    let new = old - (end - start) + units;
    if 5 * old + 4 * new + units + 4 > 512 {
        "budget-exhaustion"
    } else {
        "uncertified-seam"
    }
}
fn shifted(shard: Shard, d: Delta, w: &mut TreeWork) -> Shard {
    w.payload_copy_calls += 1;
    w.payload_elements_copied += shard.copy_elements() as u64;
    w.payload_vector_bytes_copied += shard.copy_vector_bytes() as u64;
    w.position_rewrites += shard.position_rewrites() as u64;
    shard.shifted(d, w)
}
fn part(shard: &Shard, start: usize, end: usize, eof: bool, m: &mut Meter) -> Shard {
    let mut out = Shard {
        run_index: shard.run_index,
        start_offset: start,
        end_offset: end,
        glyphs: vec![],
        concat_unsafe: vec![],
        line_breaks: vec![],
        grapheme_boundaries: vec![],
        start_safe: true,
        end_safe: true,
    };
    for (g, f) in shard.glyphs.iter().zip(&shard.concat_unsafe) {
        m.fact_comparisons += 1;
        if g.cluster >= start && g.cluster < end {
            out.glyphs.push(g.clone());
            out.concat_unsafe.push(*f);
        }
    }
    for p in &shard.line_breaks {
        m.line_filter_visits += 1;
        if *p >= start && (*p < end || eof && *p == end) {
            out.line_breaks.push(*p);
        }
    }
    for p in &shard.grapheme_boundaries {
        m.boundary_comparisons += 1;
        if *p >= start && *p <= end {
            out.grapheme_boundaries.push(*p);
        }
    }
    m.payload_copy_calls += 1;
    m.payload_elements_copied += out.copy_elements() as u64;
    m.payload_vector_bytes_copied += out.copy_vector_bytes() as u64;
    out
}
// A space is an actual non-SA delimiter, not an authored/run fence. For this
// bounded profile all other line classes must be SA or ASCII AL. Thus there is
// no OP/QU/SP* lookbehind, RI parity, LB9 CM/ZWJ state, or non-local line rule.
// The actual scalar before the leading unchanged SP is also certified AL/SA;
// SP alone is not a universal reset. Both shaping cuts are real interior safe
// clusters after SP. The right guard contains a complete unchanged SA segment
// and its non-SA terminator (or actual EOF). Artificial terminal concat flags
// are never used as witnesses or published. All affected SA segments are whole.
pub(super) fn edit(
    s: &Session,
    run: &Run,
    rank: usize,
    start: usize,
    end: usize,
    replacement: &str,
    m: &mut Meter,
    w: &mut TreeWork,
) -> Result<(Tree<Run>, Tree<Shard>, usize, Delta), &'static str> {
    if start <= run.start || end > run.end || replacement.len() > 24 || end - start > 16 {
        return Err("uncertified-seam");
    }
    let mut left = start;
    loop {
        if start - left >= 24 {
            return Err(search_exhausted(s, start, end, replacement, m, w));
        }
        if left == run.start {
            return Err("uncertified-seam");
        }
        left -= 1;
        // Candidate selection only: distance eight is not an independence
        // claim. Retained AND old/new provider witnesses below decide safety.
        if scalar(s, left, m, w)? == ' ' && start - left >= 8 && retained_safe(s, left + 1, m, w) {
            break;
        }
    }
    let mut right = end;
    while right < run.end {
        if right - end >= 24 {
            return Err(search_exhausted(s, start, end, replacement, m, w));
        }
        if scalar(s, right, m, w)? == ' '
            && right + 1 > end
            && right + 1 < run.end
            && retained_safe(s, right + 1, m, w)
        {
            right += 1;
            break;
        }
        right += 1;
    }
    let eof = right == s.source.utf16();
    if right == run.end && !eof {
        return Err("uncertified-seam");
    }
    let mut stop = right;
    if !eof {
        while stop < run.end {
            if stop - right >= 24 {
                return Err(search_exhausted(s, start, end, replacement, m, w));
            }
            if scalar(s, stop, m, w)? == ' ' {
                stop += 1;
                break;
            }
            stop += 1;
        }
        if stop == run.end && stop != s.source.utf16() {
            return Err("uncertified-seam");
        }
    }
    let cut = left + 1;
    let compare_stop = if stop == s.source.utf16() {
        stop
    } else {
        stop - 1
    };
    let old_n = stop - left;
    reserve(m, w, 2 * replacement.len(), 0)?;
    let replacement_n = replacement.encode_utf16().count();
    m.source_scan_utf16 += replacement_n as u64;
    // Reserve decoding, classification, byte indexing, old/new provider scans,
    // replacement index and source edge views before any of those operations.
    let new_n = old_n - (end - start) + replacement_n;
    reserve(
        m,
        w,
        5 * old_n + 4 * new_n + 2 * replacement.len() + 32,
        3 * (old_n + new_n),
    )?;
    m.replacement_scalars_decoded += replacement.chars().count() as u64;
    m.source_scan_utf16 += replacement_n as u64;
    w.source_allowance(
        m.source_scan_utf16
            + m.property_scan_utf16
            + (5 * old_n + 4 * new_n + replacement.len() + 20) as u64,
    );
    let old = s.source.window(left, stop, w)?;
    let mut a = None;
    let mut b = None;
    let mut u = left;
    for (at, c) in old.char_indices() {
        m.source_scan_utf16 += c.len_utf16() as u64;
        if u == start {
            a = Some(at);
        }
        if u == end {
            b = Some(at);
        }
        u += c.len_utf16();
    }
    if end == stop {
        b = Some(old.len());
    }
    let a = a.ok_or("scalar-unsafe")?;
    let b = b.ok_or("scalar-unsafe")?;
    let new = format!("{}{}{}", &old[..a], replacement, &old[b..]);
    m.source_copy_calls += 1;
    m.source_copy_bytes += new.len() as u64;
    m.source_copied_utf16 += new_n as u64;
    let data = icu_segmenter::provider::Baked::SINGLETON_SEGMENTER_BREAK_LINE_V1;
    // The character BEFORE the selected SP is part of the certificate. An
    // arbitrary OP/QU/SP* prefix cannot be hidden behind this window edge.
    let exterior = scalar(s, left.checked_sub(1).ok_or("uncertified-seam")?, m, w)?;
    reserve(m, w, 1, 0)?;
    m.property_scalar_visits += 1;
    m.property_scan_utf16 += 1;
    let exterior_property = data.property_table.get32(exterior as u32);
    if !(exterior.is_ascii_alphabetic() || exterior_property == data.complex_property) {
        return Err("uncertified-seam");
    }
    for text in [&old, &new] {
        for c in text.chars() {
            reserve(m, w, 2 * c.len_utf16(), 0)?;
            m.property_scalar_visits += 1;
            m.property_scan_utf16 += c.len_utf16() as u64;
            let property = data.property_table.get32(c as u32);
            let valid = if c == ' ' {
                true
            } else if run.key.script == "Latin" {
                c.is_ascii_alphabetic()
            } else {
                m.property_scalar_visits += 1;
                m.property_scan_utf16 += c.len_utf16() as u64;
                c.script() == Script::Thai && property == data.complex_property
            };
            if !valid {
                return Err("uncertified-seam");
            }
        }
    }
    let first = s.shards.containing(left, w).ok_or("missing-anchor")?;
    let last = s.shards.containing(stop - 1, w).ok_or("missing-anchor")?;
    if last.index - first.index > 2 {
        return Err("budget-exhaustion");
    }
    let mut retained = Vec::new();
    for index in first.index..=last.index {
        let shard = s.shards.at(index, w).unwrap().materialize(w);
        if shard.run_index != rank + s.run_index_base {
            return Err("uncertified-seam");
        }
        retained.push(shard);
    }
    let mut expected = Shard {
        run_index: rank + s.run_index_base,
        start_offset: left,
        end_offset: stop,
        glyphs: vec![],
        concat_unsafe: vec![],
        line_breaks: vec![],
        grapheme_boundaries: vec![],
        start_safe: true,
        end_safe: true,
    };
    for sh in &retained {
        let p = part(
            sh,
            cut.max(sh.start_offset),
            compare_stop.min(sh.end_offset),
            stop == s.source.utf16(),
            m,
        );
        expected.glyphs.extend(p.glyphs);
        expected.concat_unsafe.extend(p.concat_unsafe);
        expected.line_breaks.extend(p.line_breaks);
        for p in p.grapheme_boundaries {
            m.boundary_comparisons += 1;
            if expected.grapheme_boundaries.last() != Some(&p) {
                expected.grapheme_boundaries.push(p);
            }
        }
    }
    // Moving the selected facts into the contiguous replay buffer still
    // materializes another vector payload, separate from allocator accounting.
    m.payload_copy_calls += 1;
    m.payload_elements_copied += expected.copy_elements() as u64;
    m.payload_vector_bytes_copied += expected.copy_vector_bytes() as u64;
    if !has(&expected.grapheme_boundaries, start, m)
        || !has(&expected.grapheme_boundaries, end, m)
        || !safe(&expected, cut, m)
        || !eof && !safe(&expected, right, m)
    {
        return Err("uncertified-boundary");
    }
    reserve(
        m,
        w,
        2 * (old_n + new_n) + replacement.len() + 20,
        3 * (old_n + new_n),
    )?;
    let raw_before = facts(&old, left, run, &s.provider, m, false)?;
    let before = part(&raw_before, cut, compare_stop, stop == s.source.utf16(), m);

    if !equal(&before.glyphs, &expected.glyphs, m)
        || !equal(&before.concat_unsafe, &expected.concat_unsafe, m)
        || !equal(
            &before.grapheme_boundaries,
            &expected.grapheme_boundaries,
            m,
        )
        || !equal(&before.line_breaks, &expected.line_breaks, m)
    {
        return Err("uncertified-seam");
    }
    let after = facts(&new, left, run, &s.provider, m, false)?;
    let d = Delta {
        units: replacement_n as isize - (end - start) as isize,
        bytes: replacement.len() as isize - (b - a) as isize,
        runs: 0,
    };
    if !safe(&after, cut, m) || !eof && !safe(&after, d.unit(right), m) {
        return Err("uncertified-seam");
    }
    if !eof {
        let old_guard = part(&before, right, compare_stop, stop == s.source.utf16(), m);
        let mut new_guard = part(
            &after,
            d.unit(right),
            d.unit(compare_stop),
            stop == s.source.utf16(),
            m,
        );
        new_guard = shifted(new_guard, d.inverse(), w);
        if !equal(&old_guard.glyphs, &new_guard.glyphs, m)
            || !equal(&old_guard.concat_unsafe, &new_guard.concat_unsafe, m)
            || !equal(
                &old_guard.grapheme_boundaries,
                &new_guard.grapheme_boundaries,
                m,
            )
            || !equal(&old_guard.line_breaks, &new_guard.line_breaks, m)
        {
            return Err("uncertified-seam");
        }
    }
    let mut values = vec![];
    let head = &retained[0];
    if head.start_offset < cut {
        values.push(part(head, head.start_offset, cut, false, m));
    }
    let mut replacement_shard = part(&after, cut, d.unit(right), eof, m);
    replacement_shard.run_index = rank + s.run_index_base;

    values.push(replacement_shard);
    for sh in &retained {
        if sh.end_offset > right {
            let suffix = part(
                sh,
                right.max(sh.start_offset),
                sh.end_offset,
                sh.end_offset == s.source.utf16(),
                m,
            );
            values.push(shifted(suffix, d, w));
        }
    }
    let mut next = s.runs.at(rank, w).unwrap().materialize(w);
    next.end = d.unit(next.end);
    next.end_byte = d.byte(next.end_byte);
    w.position_rewrites += 2;
    next.key.provider_run_id = format!(
        "{}-{}-{}",
        next.key.script.to_ascii_lowercase(),
        next.start,
        next.end
    );
    w.provider_run_id_encoding_passes += 1;
    w.provider_run_id_encoded_bytes += next.key.provider_run_id.len() as u64;
    Ok((
        s.runs.replace_and_shift(rank, next, d, w),
        s.shards.splice(first.index, last.index + 1, values, d, w),
        replacement_n,
        d,
    ))
}

#[cfg(test)]
mod tests {

    use serde_json::{json, Value};
    #[test]
    fn local_window_fixed_twenty() {
        for size in [256, 1024, 2048, 4096, 8192] {
            for op in [
                "mid-insert",
                "replacement",
                "composition-update",
                "backspace",
            ] {
                let seed = if op == "backspace" {
                    "office AV "
                } else {
                    "ภาษาไทย กิ้ "
                };
                let mut chars: Vec<char> = seed.chars().cycle().take(size - 1).collect();
                chars.push(if op == "composition-update" {
                    'ก'
                } else {
                    'A'
                });
                let text: String = chars.iter().collect();
                let (start, end, replacement) = match op {
                    "backspace" => (size - 1, size, ""),
                    "composition-update" => (size - 1, size, "กำ"),
                    _ => {
                        let start = (0..=size / 2).rev().find(|i| chars[*i] == ' ').unwrap();
                        (start, start + usize::from(op == "replacement"), "ก")
                    }
                };
                let mut rt = super::super::runtime::Runtime::default();
                let c = super::super::tests::create(&mut rt, &super::super::tests::fixture(&text));
                assert_eq!(c["status"], "Created");
                let r:Value=serde_json::from_str(&rt.apply(&json!({"receipt":c["receipt"],"expectedRevision":0,"startOffset":start,"endOffset":end,"replacementText":replacement,"composition":"committed","anchorSpanId":"span-1"}).to_string())).unwrap();
                assert_eq!(r["status"], "Accepted", "{size}/{op}: {r}");
                for (name, cap) in [
                    ("sourceFactsUtf16", 512),
                    ("propertyFactsUtf16", 512),
                    ("shapingSegmentationInputUtf16", 1024),
                ] {
                    assert!(r["affectedSummary"]["work"][name].as_u64().unwrap() <= cap);
                }
                let expected: String = chars[..start]
                    .iter()
                    .chain(replacement.chars().collect::<Vec<_>>().iter())
                    .chain(chars[end..].iter())
                    .collect();
                let q = super::super::qa_compare::verify(
                    &rt,
                    r["nextReceipt"].as_str().unwrap(),
                    &super::super::tests::fixture(&expected).to_string(),
                );
                assert_eq!(
                    serde_json::from_str::<Value>(&q).unwrap()["status"],
                    "Equal",
                    "{size}/{op}: {q}"
                );
                eprintln!(
                    "local-window {size}/{op}: source={} property={} provider={}",
                    r["affectedSummary"]["work"]["sourceFactsUtf16"],
                    r["affectedSummary"]["work"]["propertyFactsUtf16"],
                    r["affectedSummary"]["work"]["shapingSegmentationInputUtf16"]
                );
            }
        }
    }
}
