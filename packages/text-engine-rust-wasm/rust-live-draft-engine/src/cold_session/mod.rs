mod commands;
mod derive;
mod ledger;
mod model;
mod policy;
mod position;
mod runtime;
mod source;
mod tree;
use runtime::Runtime;
use std::cell::RefCell;
use wasm_bindgen::prelude::wasm_bindgen;

thread_local! { static SESSIONS: RefCell<Runtime> = RefCell::new(Runtime::default()); }

// These symbols exist only in the opt-in QA WASM build. There is no inspection
// or snapshot export. The default/package entrypoints remain unchanged.
#[wasm_bindgen]
pub fn stage3_create(input: &str) -> String {
    SESSIONS.with(|s| s.borrow_mut().create(input))
}
#[wasm_bindgen]
pub fn stage3_dispose(receipt: &str) -> String {
    SESSIONS.with(|s| s.borrow_mut().dispose(receipt).to_string())
}
#[wasm_bindgen]
pub fn stage4_apply(input: &str) -> String {
    SESSIONS.with(|s| s.borrow_mut().apply(input))
}
#[wasm_bindgen]
pub fn stage3_live_count() -> u32 {
    SESSIONS.with(|s| s.borrow().live_count() as u32)
}
// Primitive-only meter controls: no strings or output allocations of their own.
// These expose counters, never session state or provider facts.
#[wasm_bindgen]
pub fn stage3_begin_transfer() {
    ledger::begin_transfer();
}
#[wasm_bindgen]
pub fn stage3_end_transfer() {
    ledger::end_transfer();
}
#[wasm_bindgen]
pub fn stage3_allocation_count(field: u32) -> u64 {
    ledger::allocation_count(field)
}

#[cfg(test)]
mod tests;
