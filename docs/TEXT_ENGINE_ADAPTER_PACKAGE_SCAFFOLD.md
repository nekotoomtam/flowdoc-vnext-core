# Text Engine Adapter Package Scaffold

Status: Phase 112 package scaffold.

Phase 112 creates the first external text engine adapter package scaffold at
`packages/text-engine-rust-wasm`. The package consumes public vNext core
request/evidence types and returns deterministic mock evidence so the package
shape can be tested before rustybuzz, ICU4X, WASM, or font-file access are
introduced.

## Evidence

- `packages/text-engine-rust-wasm/package.json` declares the external adapter
  package `@flowdoc/text-engine-rust-wasm`.
- `packages/text-engine-rust-wasm/tsconfig.json` and the root `tsconfig.json`
  provide local type-check resolution for the public `@flowdoc/vnext-core`
  package name.
- `packages/text-engine-rust-wasm/src/index.ts` imports core contracts with
  `import type` from `@flowdoc/vnext-core` and returns mock
  `VNextTextEngineAdapterEvidence`.
- `tests/textEngineAdapterPackageScaffold.test.ts` proves Phase 108 requests
  can flow through the scaffold, Phase 109 can accept the mock evidence, and
  Phase 110 can derive a measurement draft from it.

## Boundary

Allowed:

- define package metadata and TypeScript scaffold files;
- consume public vNext core request/evidence types;
- produce deterministic mock glyph ids, advances, cluster ranges, and line
  boxes;
- test the adapter package from the root package without importing it back from
  `src/**`.

Blocked:

- production measurement binding;
- rustybuzz/HarfBuzz dependency;
- ICU4X dependency;
- WASM build or loading;
- font-file reads;
- real shaping or segmentation;
- core importing the adapter package.

## Result

The external package lane now exists and proves the adapter shape end to end
with mock evidence. Phase 113 can replace the mock evidence generator with the
first rustybuzz/WASM smoke without changing the core-side contracts.

## Non-goals

No rustybuzz/HarfBuzz execution, ICU4X execution, WASM build, WASM loading,
font parsing, font-file reads, Thai oracle execution, production measurement
binding, pagination measurer replacement, renderer output, backend route,
artifact write, storage write, or package/document schema change is introduced
in this phase.
