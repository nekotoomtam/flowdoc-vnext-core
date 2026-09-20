use serde::{Serialize, Serializer};
use std::alloc::{GlobalAlloc, Layout, System};
use std::cell::Cell;

// QA-only, per-thread accounting of *all* Rust allocations, including provider,
// parsing, hashing, response encoding and temporary buffers. No sampling.
#[derive(Clone, Copy, Default)]
pub(super) struct Allocations {
    pub alloc_calls: u64,
    pub alloc_bytes: u64,
    pub free_calls: u64,
    pub free_bytes: u64,
}
thread_local! {
    static ACTIVE: Cell<bool> = const { Cell::new(false) };
    static COUNTS: Cell<Allocations> = const { Cell::new(Allocations { alloc_calls: 0, alloc_bytes: 0, free_calls: 0, free_bytes: 0 }) };
}
struct Metered;
#[global_allocator]
static ALLOCATOR: Metered = Metered;
fn count(bytes: usize, free: bool) {
    let _ = ACTIVE.try_with(|active| {
        if active.get() {
            let _ = COUNTS.try_with(|cell| {
                let mut c = cell.get();
                if free {
                    c.free_calls += 1;
                    c.free_bytes += bytes as u64;
                } else {
                    c.alloc_calls += 1;
                    c.alloc_bytes += bytes as u64;
                }
                cell.set(c);
            });
        }
    });
}
unsafe impl GlobalAlloc for Metered {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        let p = System.alloc(layout);
        if !p.is_null() {
            count(layout.size(), false);
        }
        p
    }
    unsafe fn alloc_zeroed(&self, layout: Layout) -> *mut u8 {
        let p = System.alloc_zeroed(layout);
        if !p.is_null() {
            count(layout.size(), false);
        }
        p
    }
    unsafe fn dealloc(&self, p: *mut u8, layout: Layout) {
        count(layout.size(), true);
        System.dealloc(p, layout);
    }
    unsafe fn realloc(&self, p: *mut u8, layout: Layout, size: usize) -> *mut u8 {
        let q = System.realloc(p, layout, size);
        if !q.is_null() {
            count(layout.size(), true);
            count(size, false);
        }
        q
    }
}
pub(super) fn begin_transfer() {
    ACTIVE.with(|a| assert!(!a.replace(true)));
    COUNTS.with(|c| c.set(Allocations::default()));
}
pub(super) fn end_transfer() {
    ACTIVE.with(|a| a.set(false));
}
pub(super) fn allocation_count(field: u32) -> u64 {
    COUNTS.with(|c| {
        let c = c.get();
        match field {
            0 => c.alloc_calls,
            1 => c.alloc_bytes,
            2 => c.free_calls,
            3 => c.free_bytes,
            _ => 0,
        }
    })
}
pub(super) struct Scope {
    owns_meter: bool,
}
impl Scope {
    // The QA adapter opens an outer window before wasm-bindgen copies input,
    // and closes it only after its output conversion and frees have completed.
    // Native tests and direct low-level calls get an inner-only fallback.
    pub fn begin() -> Self {
        let owns_meter = ACTIVE.with(|a| !a.get());
        if owns_meter {
            begin_transfer();
        }
        Self { owns_meter }
    }
    pub fn snapshot(&self) -> Allocations {
        COUNTS.with(Cell::get)
    }
}
impl Drop for Scope {
    fn drop(&mut self) {
        if self.owns_meter {
            end_transfer();
        }
    }
}

// Fixed-width encoding lets the second, allocation-free response pass include
// exact allocation and ABI counts without changing its own output length.
#[derive(Clone, Copy, Default)]
pub(super) struct Hex(pub u64);
impl Serialize for Hex {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let mut bytes = [b'0'; 16];
        for (i, byte) in bytes.iter_mut().enumerate() {
            *byte = b"0123456789abcdef"[((self.0 >> ((15 - i) * 4)) & 15) as usize];
        }
        serializer.serialize_str(std::str::from_utf8(&bytes).unwrap())
    }
}
#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct Work {
    pub provider_flag_bytes: u64,
    pub source_index_utf16: u64,
    pub policy_hash_bytes: u64,
    pub font_hash_bytes: u64,
    pub resource_visits: u64,
    pub font_parse_calls: u64,
    pub font_parse_input_bytes: u64,
    pub policy_rule_visits: u64,
    pub rule_match_visits: u64,
    pub source_input_utf16: u64,
    pub source_copy_bytes: u64,
    pub span_visits: u64,
    pub unicode_scalar_visits: u64,
    pub boundary_resolution_visits: u64,
    pub coverage_scalar_visits: u64,
    pub shaping_calls: u64,
    pub shaping_input_utf16: u64,
    pub glyph_visits: u64,
    pub segmentation_setup_calls: u64,
    pub segmentation_calls: u64,
    pub segmentation_input_utf16: u64,
    pub segmentation_boundary_visits: u64,
    pub tree_nodes: u64,
    pub tree_construction_visits: u64,
    pub source_hash_bytes: u64,
    pub descriptor_hash_bytes: u64,
    pub facts_hash_bytes: u64,
    pub descriptor_span_visits: u64,
    pub receipt_random_bytes: u64,
    pub receipt_hash_bytes: u64,
    pub validation_comparisons: u64,
    pub offset_lookup_comparisons: u64,
    pub boundary_lookup_comparisons: u64,
    pub shard_boundary_visits: u64,
    pub shard_fact_visits: u64,
    pub run_scalar_visits: u64,
    pub span_cursor_advances: u64,
    pub canonical_value_passes: u64,
    pub canonical_json_passes: u64,
    pub canonical_encoded_bytes: u64,
    pub deferred_work: u64,
    pub command_work: u64,
}
