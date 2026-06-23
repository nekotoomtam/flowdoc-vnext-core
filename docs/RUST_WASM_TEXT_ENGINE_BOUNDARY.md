# Rust/WASM Text Engine Boundary

Status: Phase 105 boundary decision.

Phase 105 clears where the future rustybuzz + ICU4X engine may live. The
decision is to keep the vNext core package dependency-clean and receive
measurement facts from an external adapter package.

This phase does not install Rust packages, build WASM, import WASM, execute
shaping, execute segmentation, or replace pagination measurement.

## Decision

The selected direction is:

```text
@flowdoc/vnext-core
  -> owns profile identity, cache identity, renderer-backed measurement adapter
  -> does not import WASM or Rust packages

external adapter package
  -> owns rustybuzz / ICU4X / WASM build and runtime loading
  -> consumes measurementProfileId ingredients
  -> returns renderer-backed text measurement facts
  -> feeds createVNextRendererBackedTextMeasurer(...)
```

The external adapter remains future work. The core boundary only records the
contract and blockers.

## Boundary

The boundary lives in `src/renderer/rustWasmTextEngineBoundary.ts`.

It exposes:

- `VNEXT_RUST_WASM_TEXT_ENGINE_SOURCE`;
- `VNEXT_RUST_WASM_TEXT_ENGINE_MODE`;
- `createVNextRustWasmTextEngineBoundaryPlan(...)`.

The plan records:

- selected placement;
- adapter package name;
- rustybuzz and ICU4X revisions;
- ICU4X data revision;
- runtime targets;
- core dependency policy;
- runtime/network policy;
- warning for missing WASM digest before production.

## Truth

This boundary may clear the Rust/WASM package boundary.

This boundary must not:

- install Rust or JS dependencies;
- build or load WASM;
- import rustybuzz, ICU4X, HarfBuzz, browser APIs, PDF, or DOCX libraries;
- execute shaping or segmentation;
- replace `measureVNextText(...)` or measured pagination;
- mutate package/document schema;
- write artifacts, cache files, or storage records.

## Acceptance Evidence

- `tests/rustWasmTextEngineBoundary.test.ts` proves the external adapter
  decision, blocks direct core dependency/WASM imports, blocks unpinned or
  nondeterministic runtime decisions, checks source independence, and verifies
  the documentation trail.
- `src/index.ts` exports the boundary without adding engine dependencies.

## Non-Goals

No concrete adapter package, Rust crate setup, WASM build, ICU4X data bundle,
runtime loader, browser worker, Node worker, glyph output, segmentation output,
pagination replacement, artifact output, backend route, storage adapter, or
schema change is introduced in this phase.
