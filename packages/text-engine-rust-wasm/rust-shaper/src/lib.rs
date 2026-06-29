pub const FLOWDOC_TEXT_ENGINE_WASM_BOUNDARY_VERSION: &str =
    "flowdoc-text-engine-wasm-boundary-v1";

#[no_mangle]
pub extern "C" fn flowdoc_text_engine_wasm_readiness_marker() -> u32 {
    1
}

#[no_mangle]
pub extern "C" fn flowdoc_text_engine_wasm_boundary_version_len() -> usize {
    FLOWDOC_TEXT_ENGINE_WASM_BOUNDARY_VERSION.len()
}
