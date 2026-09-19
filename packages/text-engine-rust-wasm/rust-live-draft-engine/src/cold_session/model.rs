use serde::{Deserialize, Serialize};

// All configuration schemas reject extensions, including fact-shaped fields.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct Input {
    pub provider_context: Provider,
    pub paragraph_context: Paragraph,
    pub authored_spans: Vec<SpanInput>,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct Provider {
    pub provider_id: String,
    pub provider_revision: String,
    pub policy_digest: String,
    pub policy: Policy,
    pub fonts: Vec<Font>,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct Font {
    pub resource_id: String,
    pub digest: String,
    pub bytes: Vec<u8>,
}
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct Policy {
    pub schema_version: u32,
    pub unicode_version: String,
    pub script_revision: String,
    pub bidi_revision: String,
    pub grapheme_revision: String,
    pub line_revision: String,
    pub shaping_revision: String,
    pub run_boundary_policy: String,
    pub language_rules: Vec<LanguageRule>,
    pub font_route_rules: Vec<FontRule>,
    pub feature_rules: Vec<FeatureRule>,
}
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct LanguageRule {
    pub authored_language: String,
    pub script: String,
    pub language: String,
}
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct FontRule {
    pub style_key: String,
    pub language: String,
    pub script: String,
    pub direction: String,
    pub writing_mode: String,
    pub font_id: String,
    pub resources: Vec<String>,
    pub coverage: String,
}
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct FeatureRule {
    pub style_key: String,
    pub language: String,
    pub script: String,
    pub direction: String,
    pub writing_mode: String,
    pub features: Vec<String>,
}
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct Paragraph {
    pub paragraph_id: String,
    pub base_direction: String,
    pub writing_mode: String,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct SpanInput {
    pub span_id: String,
    pub start_offset: usize,
    pub end_offset: usize,
    pub text: String,
    #[serde(default, deserialize_with = "present_string")]
    pub language: Option<String>,
    #[serde(default, deserialize_with = "present_string")]
    pub style_key: Option<String>,
}
fn present_string<'de, D: serde::Deserializer<'de>>(
    deserializer: D,
) -> Result<Option<String>, D::Error> {
    String::deserialize(deserializer).map(Some)
}
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct Span {
    pub span_id: String,
    pub start_offset: usize,
    pub end_offset: usize,
    pub language: Option<String>,
    pub style_key: Option<String>,
}
#[derive(Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct Key {
    pub script: String,
    pub direction: String,
    pub provider_run_id: String,
    pub paragraph_base_direction: String,
    pub writing_mode: String,
    pub language: String,
    pub font_id: String,
    pub features: Vec<String>,
    pub provider_id: String,
    pub provider_revision: String,
}
// The only retained source is Session.source; every span/run/shard uses ranges.
pub(super) struct Run {
    pub start: usize,
    pub end: usize,
    pub start_byte: usize,
    pub end_byte: usize,
    pub key: Key,
    pub span_indexes: Vec<usize>,
    pub resource_index: usize,
}
#[derive(Serialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub(super) struct Glyph {
    pub glyph_id: u32,
    pub cluster: usize,
    pub x_advance: i32,
    pub y_advance: i32,
    pub x_offset: i32,
    pub y_offset: i32,
    pub unsafe_to_break: bool,
}
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct Shard {
    pub run_index: usize,
    pub start_offset: usize,
    pub end_offset: usize,
    pub glyphs: Vec<Glyph>,
    pub line_breaks: Vec<usize>,
    pub grapheme_boundaries: Vec<usize>,
    pub start_safe: bool,
    pub end_safe: bool,
}
