use super::{ledger::Work, model::*, policy};
use icu_segmenter::{GraphemeClusterSegmenter, LineSegmenter};
use unicode_script::{Script, UnicodeScript};

struct Scalar {
    ch: char,
    byte: usize,
    offset: usize,
    span: usize,
    script: Script,
}

fn boundary_index(boundaries: &[usize], offset: usize, work: &mut Work) -> Result<usize, usize> {
    boundaries.binary_search_by(|p| {
        work.boundary_lookup_comparisons += 1;
        p.cmp(&offset)
    })
}
fn to_utf16(
    scalars: &[Scalar],
    source_bytes: usize,
    total_units: usize,
    byte: usize,
    work: &mut Work,
) -> Result<usize, &'static str> {
    if byte == source_bytes {
        return Ok(total_units);
    }
    scalars
        .binary_search_by(|s| {
            work.offset_lookup_comparisons += 1;
            s.byte.cmp(&byte)
        })
        .map(|i| scalars[i].offset)
        .map_err(|_| "invalid-provider-boundary")
}

pub(super) fn build(
    input: &mut Input,
    work: &mut Work,
) -> Result<(String, Vec<Span>, Vec<Run>, Vec<Shard>), &'static str> {
    let paragraph = &input.paragraph_context;
    if !policy::id(&paragraph.paragraph_id) {
        return Err("invalid-paragraph");
    }
    // The named first profile admits horizontal LTR paragraphs only. No bidi
    // controls, neutral RTL inference or Hebrew shaping is silently admitted.
    if paragraph.base_direction != "ltr" {
        return Err("unsupported-font-script");
    }
    if paragraph.writing_mode != "horizontal-tb" {
        return Err("unsupported-writing-mode");
    }
    let mut source = String::new();
    let mut spans: Vec<Span> = Vec::new();
    let mut offset = 0;
    for span in std::mem::take(&mut input.authored_spans) {
        work.span_visits += 1;
        let units = span.text.encode_utf16().count();
        work.source_input_utf16 += units as u64;
        if !policy::id(&span.span_id)
            || span.text.is_empty()
            || span.start_offset != offset
            || span.end_offset != offset + units
            || spans.iter().any(|s| {
                work.validation_comparisons += 1;
                s.span_id == span.span_id
            })
            || span.language.as_deref().is_some_and(|v| !policy::id(v))
            || span.style_key.as_deref().is_none_or(|v| !policy::id(v))
        {
            return Err("invalid-authored-spans");
        }
        work.source_copy_bytes += span.text.len() as u64;
        source.push_str(&span.text);
        offset += units;
        spans.push(Span {
            span_id: span.span_id,
            start_offset: span.start_offset,
            end_offset: span.end_offset,
            language: span.language,
            style_key: span.style_key,
        });
    }
    let total_units = offset;
    let mut scalars = Vec::new();
    let mut span_index = 0;
    offset = 0;
    for (byte, ch) in source.char_indices() {
        work.unicode_scalar_visits += 1;
        while span_index + 1 < spans.len() && spans[span_index].end_offset <= offset {
            span_index += 1;
            work.span_cursor_advances += 1;
        }
        let script = ch.script();
        if !matches!(
            script,
            Script::Latin | Script::Thai | Script::Common | Script::Inherited
        ) || ch.is_control()
            || matches!(ch as u32, 0x200b..=0x200f | 0x202a..=0x202e | 0x2060..=0x206f | 0xfeff)
        {
            return Err("unsupported-font-script");
        }
        scalars.push(Scalar {
            ch,
            byte,
            offset,
            span: span_index,
            script,
        });
        offset += ch.len_utf16();
    }
    // Named attachment policy: Common/Inherited choose previous strong script;
    // leading neutral scalars choose the next strong script. No strong script
    // means unsupported, not a paragraph-wide first-strong label.
    let mut previous = None;
    for scalar in &mut scalars {
        work.boundary_resolution_visits += 1;
        if matches!(scalar.script, Script::Latin | Script::Thai) {
            previous = Some(scalar.script);
        } else if let Some(script) = previous {
            scalar.script = script;
        }
    }
    let mut next = None;
    for scalar in scalars.iter_mut().rev() {
        work.boundary_resolution_visits += 1;
        if matches!(scalar.script, Script::Latin | Script::Thai) {
            next = Some(scalar.script);
        } else {
            scalar.script = next.ok_or("unsupported-font-script")?;
        }
    }
    work.segmentation_setup_calls += 2;
    let grapheme_provider = GraphemeClusterSegmenter::new();
    let line_provider = LineSegmenter::new_auto(Default::default());
    work.segmentation_calls += 2;
    work.segmentation_input_utf16 += (2 * total_units) as u64;
    let graphemes = grapheme_provider
        .segment_str(&source)
        .map(|b| to_utf16(&scalars, source.len(), total_units, b, work))
        .collect::<Result<Vec<_>, _>>()?;
    let lines = line_provider
        .segment_str(&source)
        .map(|b| to_utf16(&scalars, source.len(), total_units, b, work))
        .collect::<Result<Vec<_>, _>>()?;
    work.segmentation_boundary_visits += (graphemes.len() + lines.len()) as u64;
    for span in &spans {
        work.span_visits += 1;
        if boundary_index(&graphemes, span.start_offset, work).is_err()
            || boundary_index(&graphemes, span.end_offset, work).is_err()
        {
            return Err("unsafe-authored-boundary");
        }
    }
    let mut runs: Vec<Run> = Vec::new();
    let provider = &input.provider_context;
    let mut cursor = 0;
    while cursor < scalars.len() {
        work.run_scalar_visits += 1;
        let first = &scalars[cursor];
        let script = first.script.full_name();
        let (route, features) = policy::resolve(provider, &spans[first.span], script, work)?;
        let mut end = cursor + 1;
        let mut span_indexes = vec![first.span];
        while end < scalars.len() {
            work.run_scalar_visits += 1;
            let scalar = &scalars[end];
            if scalar.script != first.script {
                break;
            }
            let (other, other_features) =
                policy::resolve(provider, &spans[scalar.span], script, work)?;
            if policy::font_key(other) != policy::font_key(route)
                || other.font_id != route.font_id
                || other_features.features != features.features
            {
                break;
            }
            if span_indexes.last() != Some(&scalar.span) {
                span_indexes.push(scalar.span);
            }
            end += 1;
        }
        let end_offset = scalars.get(end).map_or(total_units, |s| s.offset);
        if boundary_index(&graphemes, first.offset, work).is_err()
            || boundary_index(&graphemes, end_offset, work).is_err()
        {
            return Err("unsafe-analysis-boundary");
        }
        let mut resource_index = None;
        for resource in &route.resources {
            let index = provider
                .fonts
                .iter()
                .position(|font| {
                    work.validation_comparisons += 1;
                    &font.resource_id == resource
                })
                .ok_or("invalid-font-route")?;
            let font = &provider.fonts[index];
            work.font_parse_calls += 1;
            work.font_parse_input_bytes += font.bytes.len() as u64;
            let face =
                rustybuzz::Face::from_slice(&font.bytes, 0).ok_or("invalid-font-resource")?;
            let mut covered = true;
            for scalar in &scalars[cursor..end] {
                work.coverage_scalar_visits += 1;
                if face.glyph_index(scalar.ch).is_none() {
                    covered = false;
                }
            }
            if covered {
                resource_index = Some(index);
                break;
            }
        }
        let resource_index = resource_index.ok_or("unsupported-font-script")?;
        let provider_run_id = format!(
            "{}-{}-{}",
            script.to_ascii_lowercase(),
            first.offset,
            end_offset
        );
        runs.push(Run {
            start: first.offset,
            end: end_offset,
            start_byte: first.byte,
            end_byte: scalars.get(end).map_or(source.len(), |s| s.byte),
            key: Key {
                script: script.into(),
                direction: route.direction.clone(),
                provider_run_id,
                paragraph_base_direction: paragraph.base_direction.clone(),
                writing_mode: paragraph.writing_mode.clone(),
                language: route.language.clone(),
                font_id: route.font_id.clone(),
                features: features.features.clone(),
                provider_id: provider.provider_id.clone(),
                provider_revision: provider.provider_revision.clone(),
            },
            span_indexes,
            resource_index,
        });
        cursor = end;
    }
    let mut shards = Vec::new();
    for (run_index, run) in runs.iter().enumerate() {
        let font = &provider.fonts[run.resource_index];
        work.font_parse_calls += 1;
        work.font_parse_input_bytes += font.bytes.len() as u64;
        let face = rustybuzz::Face::from_slice(&font.bytes, 0).ok_or("invalid-font-resource")?;
        let text = &source[run.start_byte..run.end_byte];
        let mut buffer = rustybuzz::UnicodeBuffer::new();
        buffer.push_str(text);
        buffer.set_direction(rustybuzz::Direction::LeftToRight);
        buffer.set_script(if run.key.script == "Thai" {
            rustybuzz::script::THAI
        } else {
            rustybuzz::script::LATIN
        });
        buffer.set_language(
            run.key
                .language
                .parse()
                .map_err(|_| "unsupported-language-rule")?,
        );
        let features = run
            .key
            .features
            .iter()
            .map(|f| {
                f.parse::<rustybuzz::Feature>()
                    .map_err(|_| "unsupported-feature")
            })
            .collect::<Result<Vec<_>, _>>()?;
        work.shaping_calls += 1;
        work.shaping_input_utf16 += (run.end - run.start) as u64;
        let shaped = rustybuzz::shape(&face, &features, buffer);
        let mut glyphs = Vec::new();
        for (info, position) in shaped.glyph_infos().iter().zip(shaped.glyph_positions()) {
            work.glyph_visits += 1;
            if info.glyph_id == 0 {
                return Err("unsupported-font-script");
            }
            let cluster = to_utf16(
                &scalars,
                source.len(),
                total_units,
                run.start_byte + info.cluster as usize,
                work,
            )?;
            if cluster < run.start || cluster >= run.end {
                return Err("invalid-provider-boundary");
            }
            glyphs.push(Glyph {
                glyph_id: info.glyph_id,
                cluster,
                x_advance: position.x_advance,
                y_advance: position.y_advance,
                x_offset: position.x_offset,
                y_offset: position.y_offset,
                unsafe_to_break: info.unsafe_to_break(),
            });
        }
        if glyphs.is_empty()
            || glyphs.windows(2).any(|p| {
                work.validation_comparisons += 1;
                p[0].cluster > p[1].cluster
            })
        {
            return Err("unsupported-provider-order");
        }
        // Cold construction may shape the entire run (charged above). Shards
        // partition those exact facts at real grapheme/cluster/unsafe boundaries;
        // no reshaping, artificial break, or uncharged whole-paragraph repair.
        // One pass per glyph cluster; certify every glyph in a cluster, then
        // search the small sorted list instead of rescanning all provider facts.
        let mut safe = Vec::new();
        let mut g = 0;
        while g < glyphs.len() {
            let cluster = glyphs[g].cluster;
            let mut safe_cluster = true;
            while g < glyphs.len() && glyphs[g].cluster == cluster {
                work.shard_boundary_visits += 1;
                safe_cluster &= !glyphs[g].unsafe_to_break;
                g += 1;
            }
            if safe_cluster && boundary_index(&graphemes, cluster, work).is_ok() {
                safe.push(cluster);
            }
        }
        let mut start = run.start;
        let mut iter = glyphs.into_iter().peekable();
        while start < run.end {
            let end = if run.end - start <= 512 {
                run.end
            } else {
                let index = safe.partition_point(|&p| {
                    work.boundary_lookup_comparisons += 1;
                    p <= start + 512
                });
                safe.get(index.wrapping_sub(1))
                    .copied()
                    .filter(|&p| p > start)
                    .ok_or("uncertified-shard-boundary")?
            };
            let mut part = Vec::new();
            while iter.peek().is_some_and(|g| g.cluster < end) {
                work.shard_fact_visits += 1;
                part.push(iter.next().unwrap());
            }
            let line_start = lines.partition_point(|&p| {
                work.boundary_lookup_comparisons += 1;
                p < start
            });
            let line_end = lines.partition_point(|&p| {
                work.boundary_lookup_comparisons += 1;
                p < end || end == total_units && p == end
            });
            let grapheme_start =
                boundary_index(&graphemes, start, work).map_err(|_| "invalid-provider-boundary")?;
            let grapheme_end =
                boundary_index(&graphemes, end, work).map_err(|_| "invalid-provider-boundary")?;
            work.shard_fact_visits +=
                (line_end - line_start + grapheme_end - grapheme_start + 1) as u64;
            shards.push(Shard {
                run_index,
                start_offset: start,
                end_offset: end,
                glyphs: part,
                line_breaks: lines[line_start..line_end].to_vec(),
                grapheme_boundaries: graphemes[grapheme_start..=grapheme_end].to_vec(),
                start_safe: true,
                end_safe: true,
            });
            start = end;
        }
    }
    Ok((source, spans, runs, shards))
}
