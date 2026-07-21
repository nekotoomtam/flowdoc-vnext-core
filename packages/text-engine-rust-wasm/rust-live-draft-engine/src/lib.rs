use icu_segmenter::LineSegmenter;
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};

pub const FLOWDOC_TEXT_ENGINE_WASM_BOUNDARY_VERSION: &str =
    "flowdoc-text-engine-wasm-live-draft-xr1-v1";
pub const FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION: &str =
    "flowdoc-text-engine-wasm-live-draft-mr1-v1";
pub const FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION: &str =
    "flowdoc-text-engine-wasm-live-draft-mr1-range-v1";
pub const FLOWDOC_RUSTYBUZZ_NATIVE_SOURCE: &str = "flowdoc-rustybuzz-native-smoke";
pub const FLOWDOC_RUSTYBUZZ_WASM_SOURCE: &str = "flowdoc-rustybuzz-wasm-live-draft-smoke";
pub const FLOWDOC_RUSTYBUZZ_REVISION: &str = "rustybuzz-0.20.1";
pub const FLOWDOC_ICU4X_NATIVE_SOURCE: &str = "flowdoc-icu4x-native-line-segmenter";
pub const FLOWDOC_ICU4X_WASM_SOURCE: &str = "flowdoc-icu4x-wasm-line-segmenter";
pub const FLOWDOC_RUSTYBUZZ_RANGE_NATIVE_SOURCE: &str = "flowdoc-rustybuzz-native-contextual-range";
pub const FLOWDOC_RUSTYBUZZ_RANGE_WASM_SOURCE: &str = "flowdoc-rustybuzz-wasm-contextual-range";
pub const FLOWDOC_ICU4X_RANGE_NATIVE_SOURCE: &str = "flowdoc-icu4x-native-bounded-range";
pub const FLOWDOC_ICU4X_RANGE_WASM_SOURCE: &str = "flowdoc-icu4x-wasm-bounded-range";
pub const FLOWDOC_ICU4X_SEGMENTER_REVISION: &str = "icu_segmenter-2.2.0";
pub const FLOWDOC_ICU4X_DATA_REVISION: &str = "icu_segmenter_data-2.2.0";

fn escape_json(value: &str) -> String {
    let mut escaped = String::with_capacity(value.len());
    for ch in value.chars() {
        match ch {
            '"' => escaped.push_str("\\\""),
            '\\' => escaped.push_str("\\\\"),
            '\n' => escaped.push_str("\\n"),
            '\r' => escaped.push_str("\\r"),
            '\t' => escaped.push_str("\\t"),
            ch if ch.is_control() => escaped.push_str(&format!("\\u{:04x}", ch as u32)),
            ch => escaped.push(ch),
        }
    }
    escaped
}

pub fn flowdoc_text_engine_shape_json(
    font_data: &[u8],
    text: &str,
    font_id: &str,
    font_path: &str,
    source: &str,
) -> Result<String, String> {
    if text.is_empty() {
        return Err("text must not be empty".to_string());
    }
    let face = rustybuzz::Face::from_slice(font_data, 0)
        .ok_or_else(|| format!("failed to parse font bytes for `{font_id}`"))?;
    let mut buffer = rustybuzz::UnicodeBuffer::new();
    buffer.push_str(text);
    let glyph_buffer = rustybuzz::shape(&face, &[], buffer);
    let infos = glyph_buffer.glyph_infos();
    let positions = glyph_buffer.glyph_positions();
    if infos.is_empty() {
        return Err("rustybuzz returned no glyphs".to_string());
    }
    let glyphs = infos
        .iter()
        .zip(positions.iter())
        .enumerate()
        .map(|(index, (info, position))| {
            format!(
                "{{\"index\":{index},\"glyphId\":{},\"cluster\":{},\"xAdvance\":{},\"yAdvance\":{},\"xOffset\":{},\"yOffset\":{}}}",
                info.glyph_id,
                info.cluster,
                position.x_advance,
                position.y_advance,
                position.x_offset,
                position.y_offset,
            )
        })
        .collect::<Vec<_>>()
        .join(",");

    Ok(format!(
        "{{\"source\":\"{}\",\"shaperRevision\":\"{}\",\"fontId\":\"{}\",\"fontPath\":\"{}\",\"text\":\"{}\",\"textByteLength\":{},\"textScalarCount\":{},\"unitsPerEm\":{},\"ascentFontUnit\":{},\"descentFontUnit\":{},\"lineGapFontUnit\":{},\"glyphCount\":{},\"glyphs\":[{}]}}",
        source,
        FLOWDOC_RUSTYBUZZ_REVISION,
        escape_json(font_id),
        escape_json(font_path),
        escape_json(text),
        text.len(),
        text.chars().count(),
        face.units_per_em(),
        face.ascender(),
        face.descender(),
        face.line_gap(),
        infos.len(),
        glyphs,
    ))
}

pub fn flowdoc_text_engine_segment_json(text: &str, source: &str) -> Result<String, String> {
    if text.is_empty() {
        return Err("text must not be empty".to_string());
    }
    let segmenter = LineSegmenter::new_auto(Default::default());
    let break_byte_offsets = segmenter
        .segment_str(text)
        .map(|offset| offset.to_string())
        .collect::<Vec<_>>()
        .join(",");
    Ok(format!(
        "{{\"source\":\"{}\",\"segmenterRevision\":\"{}\",\"dataRevision\":\"{}\",\"text\":\"{}\",\"textByteLength\":{},\"textScalarCount\":{},\"breakByteOffsets\":[{}]}}",
        source,
        FLOWDOC_ICU4X_SEGMENTER_REVISION,
        FLOWDOC_ICU4X_DATA_REVISION,
        escape_json(text),
        text.len(),
        text.chars().count(),
        break_byte_offsets,
    ))
}

fn validate_byte_range(text: &str, start: usize, end: usize, label: &str) -> Result<(), String> {
    if start > end
        || end > text.len()
        || !text.is_char_boundary(start)
        || !text.is_char_boundary(end)
    {
        return Err(format!("{label} must use ordered UTF-8 scalar boundaries"));
    }
    Ok(())
}

pub fn flowdoc_text_engine_shape_range_json(
    font_data: &[u8],
    text: &str,
    font_id: &str,
    font_path: &str,
    source: &str,
    range_start_byte: usize,
    range_end_byte: usize,
    context_start_byte: usize,
    context_end_byte: usize,
) -> Result<String, String> {
    if text.is_empty() {
        return Err("text must not be empty".to_string());
    }
    validate_byte_range(text, range_start_byte, range_end_byte, "shape range")?;
    validate_byte_range(text, context_start_byte, context_end_byte, "shape context")?;
    if range_start_byte == range_end_byte {
        return Err("shape range must not be empty".to_string());
    }
    if context_start_byte > range_start_byte || context_end_byte < range_end_byte {
        return Err("shape context must contain the complete shape range".to_string());
    }

    let face = rustybuzz::Face::from_slice(font_data, 0)
        .ok_or_else(|| format!("failed to parse font bytes for `{font_id}`"))?;
    let mut property_buffer = rustybuzz::UnicodeBuffer::new();
    property_buffer.push_str(text);
    property_buffer.guess_segment_properties();

    let range_text = &text[range_start_byte..range_end_byte];
    let pre_context = &text[context_start_byte..range_start_byte];
    let post_context = &text[range_end_byte..context_end_byte];
    let mut buffer = rustybuzz::UnicodeBuffer::new();
    buffer.push_str(range_text);
    buffer.set_pre_context(pre_context);
    buffer.set_post_context(post_context);
    buffer.set_direction(property_buffer.direction());
    buffer.set_script(property_buffer.script());
    if let Some(language) = property_buffer.language() {
        buffer.set_language(language);
    }
    let glyph_buffer = rustybuzz::shape(&face, &[], buffer);
    let infos = glyph_buffer.glyph_infos();
    let positions = glyph_buffer.glyph_positions();
    if infos.is_empty() {
        return Err("rustybuzz returned no range glyphs".to_string());
    }
    let glyphs = infos
        .iter()
        .zip(positions.iter())
        .enumerate()
        .map(|(index, (info, position))| {
            format!(
                "{{\"index\":{index},\"glyphId\":{},\"cluster\":{},\"xAdvance\":{},\"yAdvance\":{},\"xOffset\":{},\"yOffset\":{},\"unsafeToBreak\":{}}}",
                info.glyph_id,
                info.cluster as usize + range_start_byte,
                position.x_advance,
                position.y_advance,
                position.x_offset,
                position.y_offset,
                info.unsafe_to_break(),
            )
        })
        .collect::<Vec<_>>()
        .join(",");

    Ok(format!(
        "{{\"source\":\"{}\",\"shaperRevision\":\"{}\",\"fontId\":\"{}\",\"fontPath\":\"{}\",\"fullTextByteLength\":{},\"fullTextScalarCount\":{},\"rangeStartByte\":{},\"rangeEndByte\":{},\"contextStartByte\":{},\"contextEndByte\":{},\"rangeText\":\"{}\",\"preContextText\":\"{}\",\"postContextText\":\"{}\",\"unitsPerEm\":{},\"ascentFontUnit\":{},\"descentFontUnit\":{},\"lineGapFontUnit\":{},\"glyphCount\":{},\"glyphs\":[{}]}}",
        source,
        FLOWDOC_RUSTYBUZZ_REVISION,
        escape_json(font_id),
        escape_json(font_path),
        text.len(),
        text.chars().count(),
        range_start_byte,
        range_end_byte,
        context_start_byte,
        context_end_byte,
        escape_json(range_text),
        escape_json(pre_context),
        escape_json(post_context),
        face.units_per_em(),
        face.ascender(),
        face.descender(),
        face.line_gap(),
        infos.len(),
        glyphs,
    ))
}

pub fn flowdoc_text_engine_segment_range_json(
    text: &str,
    source: &str,
    target_start_byte: usize,
    target_end_byte: usize,
    context_start_byte: usize,
    context_end_byte: usize,
) -> Result<String, String> {
    if text.is_empty() {
        return Err("text must not be empty".to_string());
    }
    validate_byte_range(
        text,
        target_start_byte,
        target_end_byte,
        "segmentation target",
    )?;
    validate_byte_range(
        text,
        context_start_byte,
        context_end_byte,
        "segmentation context",
    )?;
    if target_start_byte == target_end_byte {
        return Err("segmentation target must not be empty".to_string());
    }
    if context_start_byte > target_start_byte || context_end_byte < target_end_byte {
        return Err("segmentation context must contain the complete target range".to_string());
    }
    let context_text = &text[context_start_byte..context_end_byte];
    let segmenter = LineSegmenter::new_auto(Default::default());
    let context_break_byte_offsets = segmenter
        .segment_str(context_text)
        .map(|offset| (context_start_byte + offset).to_string())
        .collect::<Vec<_>>()
        .join(",");
    Ok(format!(
        "{{\"source\":\"{}\",\"segmenterRevision\":\"{}\",\"dataRevision\":\"{}\",\"fullTextByteLength\":{},\"fullTextScalarCount\":{},\"targetStartByte\":{},\"targetEndByte\":{},\"contextStartByte\":{},\"contextEndByte\":{},\"contextText\":\"{}\",\"contextBreakByteOffsets\":[{}]}}",
        source,
        FLOWDOC_ICU4X_SEGMENTER_REVISION,
        FLOWDOC_ICU4X_DATA_REVISION,
        text.len(),
        text.chars().count(),
        target_start_byte,
        target_end_byte,
        context_start_byte,
        context_end_byte,
        escape_json(context_text),
        context_break_byte_offsets,
    ))
}

#[wasm_bindgen]
pub fn flowdoc_text_engine_wasm_readiness_marker() -> u32 {
    2
}

#[wasm_bindgen]
pub fn flowdoc_text_engine_wasm_boundary_version() -> String {
    FLOWDOC_TEXT_ENGINE_WASM_BOUNDARY_VERSION.to_string()
}

#[wasm_bindgen]
pub fn flowdoc_text_engine_mr1_wasm_boundary_version() -> String {
    FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION.to_string()
}

#[wasm_bindgen]
pub fn flowdoc_text_engine_mr1_range_wasm_boundary_version() -> String {
    FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION.to_string()
}

#[wasm_bindgen]
pub fn flowdoc_text_engine_wasm_shape_json(
    font_data: &[u8],
    text: &str,
    font_id: &str,
) -> Result<String, JsValue> {
    flowdoc_text_engine_shape_json(
        font_data,
        text,
        font_id,
        &format!("wasm-memory:{font_id}"),
        FLOWDOC_RUSTYBUZZ_WASM_SOURCE,
    )
    .map_err(|message| JsValue::from_str(&message))
}

#[wasm_bindgen]
pub fn flowdoc_text_engine_wasm_segment_json(text: &str) -> Result<String, JsValue> {
    flowdoc_text_engine_segment_json(text, FLOWDOC_ICU4X_WASM_SOURCE)
        .map_err(|message| JsValue::from_str(&message))
}

#[wasm_bindgen]
pub fn flowdoc_text_engine_wasm_shape_range_json(
    font_data: &[u8],
    text: &str,
    font_id: &str,
    range_start_byte: u32,
    range_end_byte: u32,
    context_start_byte: u32,
    context_end_byte: u32,
) -> Result<String, JsValue> {
    flowdoc_text_engine_shape_range_json(
        font_data,
        text,
        font_id,
        &format!("wasm-memory:{font_id}"),
        FLOWDOC_RUSTYBUZZ_RANGE_WASM_SOURCE,
        range_start_byte as usize,
        range_end_byte as usize,
        context_start_byte as usize,
        context_end_byte as usize,
    )
    .map_err(|message| JsValue::from_str(&message))
}

#[wasm_bindgen]
pub fn flowdoc_text_engine_wasm_segment_range_json(
    text: &str,
    target_start_byte: u32,
    target_end_byte: u32,
    context_start_byte: u32,
    context_end_byte: u32,
) -> Result<String, JsValue> {
    flowdoc_text_engine_segment_range_json(
        text,
        FLOWDOC_ICU4X_RANGE_WASM_SOURCE,
        target_start_byte as usize,
        target_end_byte as usize,
        context_start_byte as usize,
        context_end_byte as usize,
    )
    .map_err(|message| JsValue::from_str(&message))
}
