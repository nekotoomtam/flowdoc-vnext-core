# Rustybuzz Shaping Smoke Boundary

Status: Phase 107 shaping smoke boundary.

Phase 107 defines the first rustybuzz shaping smoke contract without executing
rustybuzz, loading WASM, reading font files, or replacing pagination
measurement. It connects Phase 103 copied font hashes, Phase 104 measurement
profile identity, Phase 105 Rust/WASM adapter placement, and Phase 106 Thai
corpus samples into a small set of smoke cases that the future external adapter
must satisfy.

## Evidence

- `fixtures/rustybuzz-shaping-smoke.v1.json` lists smoke cases for Sarabun
  regular, Sarabun bold, and Noto Sans Thai regular.
- `src/renderer/rustybuzzShapingSmoke.ts` validates stable smoke ids,
  measurement profile identity, adapter placement, known copied font assets,
  known Thai corpus samples, output shape version, and required shaping facts.
- `tests/rustybuzzShapingSmoke.test.ts` proves the fixture is ready for future
  adapter-owned smoke execution and blocks direct core shaping, core font-file
  reads, core WASM imports, unknown references, missing shaping facts, duplicate
  cases, unstable profile identity, and production binding.

## Required Shaping Facts

Each smoke case must request:

- glyph ids;
- glyph advances;
- glyph offsets;
- cluster maps;
- source text ranges;
- line box facts.

These are shape requirements only. This phase does not store actual glyph ids,
advance widths, offsets, clusters, or line boxes. The future adapter package
must record those facts after rustybuzz and WASM artifact revisions are pinned.

## Boundary

Allowed:

- validate shaping smoke cases as static data;
- reference copied package font asset ids from `assets/fonts/font-assets.v1.json`;
- reference Thai corpus sample ids from `fixtures/thai-measurement-corpus.v1.json`;
- require a stable Phase 104 `measurementProfileId`;
- require the Phase 105 external adapter package direction;
- publish pure source/mode constants and `createVNextRustybuzzShapingSmokePlan(...)`.

Blocked:

- production measurement binding;
- direct core dependency placement for rustybuzz/WASM;
- core-owned shaping execution;
- core font file reads;
- core WASM imports;
- unknown font asset ids or corpus sample ids;
- missing glyph id, advance, offset, cluster map, text range, or line box
  requirements;
- output shape versions other than `glyph-line-box-v1`;
- document/package schema changes.

## Result

Phase 107 leaves the concrete text engine unimplemented on purpose. It gives
the future Rust/WASM adapter a deterministic smoke checklist and keeps vNext
core as the contract owner instead of the engine runtime owner.

## Non-goals

No Rust package, WASM build, rustybuzz/HarfBuzz execution, font parsing, glyph
inspection, ICU4X execution, Thai oracle execution, pagination replacement,
renderer output, backend route, artifact write, storage write, or
package/document schema change is introduced in this phase.
