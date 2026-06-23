# FlowDoc Text Engine Rust/WASM Adapter

Status: Phase 112 scaffold package.

This package is the future external text engine adapter boundary for
rustybuzz/WASM and ICU4X work. Phase 112 keeps it as a mock evidence scaffold:
it consumes public vNext core adapter request/evidence types, returns
deterministic mock glyph evidence, and proves the package direction before any
real engine dependency is introduced.

## Boundary

Allowed:

- consume `VNextTextEngineAdapterRequest` from `@flowdoc/vnext-core`;
- return `VNextTextEngineAdapterEvidence`;
- provide deterministic mock glyph ids, advances, offsets, clusters, and line
  boxes for root tests;
- remain external to `src/**` core.

Blocked:

- rustybuzz/HarfBuzz dependency;
- ICU4X dependency;
- WASM build or loading;
- font-file reads;
- production measurement binding;
- pagination measurer replacement.
