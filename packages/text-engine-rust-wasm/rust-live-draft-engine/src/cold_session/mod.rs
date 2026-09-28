mod tail_seam;
mod local_window;
#[cfg(test)]
mod local_window_tests;
mod structural_work;
mod lifecycle;
mod maintenance;
mod structural;
mod commands;
mod command_work;
mod derive;
mod faults;
mod ledger;
mod model;
mod ownership;
mod policy;
mod provider_plans;
mod position;
mod runtime;
mod source;
mod structure;
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
    SESSIONS.with(|s| structural::dispose(&mut s.borrow_mut(),receipt))
}
#[wasm_bindgen]
pub fn stage4_apply(input: &str) -> String {
    SESSIONS.with(|s| s.borrow_mut().apply(input))
}
#[wasm_bindgen]
pub fn stage4_arm_fault(input: &str) -> String {
    SESSIONS.with(|s| faults::arm(&mut s.borrow_mut(), input))
}
#[wasm_bindgen]
pub fn stage3_live_count() -> u32 {
    SESSIONS.with(|s| s.borrow().live_count() as u32)
}
#[wasm_bindgen]
pub fn stage6_maintain(input: &str) -> String {
    SESSIONS.with(|s| maintenance::apply(&mut s.borrow_mut(), input))
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
mod accounting_tests;
#[cfg(test)]
mod sustained_tests;
#[cfg(test)]
mod fault_tests;
#[cfg(test)]
mod footprint_tests;
#[cfg(test)]
mod tests;

#[wasm_bindgen]
pub fn stage5_apply(input: &str) -> String {
    SESSIONS.with(|s| structural::apply(&mut s.borrow_mut(),input))
}

#[cfg(test)]
mod structural_tests;

mod qa_compare;
#[wasm_bindgen]
pub fn stage5_verify(receipt: &str, expected_input: &str) -> String {
    SESSIONS.with(|s|qa_compare::verify(&s.borrow(),receipt,expected_input))
}

mod analysis_transition;
