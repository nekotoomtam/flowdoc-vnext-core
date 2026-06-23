# Text Engine Rustybuzz Smoke Package Boundary

Status: Phase 113 rustybuzz native smoke package.

Phase 113 introduces the first real rustybuzz execution path, but keeps it
inside `packages/text-engine-rust-wasm` instead of the core `src/**` package.
The goal is to prove that copied vNext font assets can be shaped by a pinned
rustybuzz revision before any TypeScript adapter binding, WASM loading, ICU4X
segmentation, or production measurement replacement is introduced.

## Evidence

- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml` declares the
  package-local smoke crate and pins `rustybuzz = "=0.20.1"`.
- `packages/text-engine-rust-wasm/rust-shaper/src/main.rs` reads an explicit
  font path, parses it with `rustybuzz::Face::from_slice`, builds a
  `rustybuzz::UnicodeBuffer`, runs `rustybuzz::shape`, and prints glyph ids,
  clusters, advances, offsets, glyph count, and units-per-em as JSON.
- `packages/text-engine-rust-wasm/package.json` exposes
  `npm run rustybuzz:smoke` as the bounded manual smoke command.
- `packages/text-engine-rust-wasm/fixtures/rustybuzz-native-smoke.sarabun.v1.json`
  records the raw JSON output from the first successful Sarabun smoke run. This
  is smoke evidence only, not accepted FlowDoc glyph evidence.
- `tests/textEngineRustybuzzSmokePackage.test.ts` proves the rustybuzz smoke
  stays package-local and the core package still does not import the adapter
  or rustybuzz.

The smoke uses rustybuzz because the crate documents `Face::from_slice` for
font data, `UnicodeBuffer` for shaping input, `shape(...)` for shaping, and
`GlyphBuffer` accessors for glyph infos and positions.

API references:

- https://docs.rs/rustybuzz/latest/rustybuzz/struct.Face.html
- https://docs.rs/rustybuzz/latest/rustybuzz/struct.UnicodeBuffer.html
- https://docs.rs/rustybuzz/latest/rustybuzz/fn.shape.html
- https://docs.rs/rustybuzz/latest/rustybuzz/struct.GlyphBuffer.html

## Boundary

Allowed:

- install and build a package-local Rust dependency for smoke verification;
- read copied vNext font assets from `assets/fonts` through an explicit smoke
  command;
- emit raw rustybuzz glyph facts for engineering inspection;
- keep a raw package-local smoke-output fixture for regression review;
- keep the TypeScript adapter mock evidence path intact until a later binding
  phase.

Blocked:

- importing rustybuzz, HarfBuzz, ICU4X, WASM, font parsers, browser APIs, PDF,
  or DOCX dependencies from `src/**`;
- using raw rustybuzz cluster values as accepted FlowDoc evidence before the
  adapter maps byte/scalar/UTF-16 offsets deliberately;
- converting smoke output into pagination measurement drafts;
- production measurement binding or pagination measurer replacement;
- browser/worker WASM loading.

## Result

Phase 113 turns rustybuzz from a planned dependency into an adapter-package
smoke implementation. It deliberately does not close the WASM runtime risk:
this workstation has `cargo` and `rustc`, but does not currently expose
`wasm-pack` or `wasm-bindgen` on `PATH`.

## Non-goals

No ICU4X execution, WASM build, WASM loading, browser runtime loader,
production adapter binding, accepted glyph evidence fixture, Thai oracle
comparison, pagination draft mutation, renderer output, backend route, artifact
write, storage write, or package/document schema change is introduced in this
phase.
