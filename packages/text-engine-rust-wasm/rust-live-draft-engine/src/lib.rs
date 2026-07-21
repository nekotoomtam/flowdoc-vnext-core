use icu_segmenter::LineSegmenter;
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};

pub const FLOWDOC_TEXT_ENGINE_WASM_BOUNDARY_VERSION: &str =
    "flowdoc-text-engine-wasm-live-draft-xr1-v1";
pub const FLOWDOC_TEXT_ENGINE_MR1_WASM_BOUNDARY_VERSION: &str =
    "flowdoc-text-engine-wasm-live-draft-mr1-v1";
pub const FLOWDOC_RUSTYBUZZ_NATIVE_SOURCE: &str = "flowdoc-rustybuzz-native-smoke";
pub const FLOWDOC_RUSTYBUZZ_WASM_SOURCE: &str = "flowdoc-rustybuzz-wasm-live-draft-smoke";
pub const FLOWDOC_RUSTYBUZZ_REVISION: &str = "rustybuzz-0.20.1";
pub const FLOWDOC_ICU4X_NATIVE_SOURCE: &str = "flowdoc-icu4x-native-line-segmenter";
pub const FLOWDOC_ICU4X_WASM_SOURCE: &str = "flowdoc-icu4x-wasm-line-segmenter";
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
