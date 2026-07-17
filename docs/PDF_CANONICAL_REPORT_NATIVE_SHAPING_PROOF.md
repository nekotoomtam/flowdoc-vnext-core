# PDF Canonical Report Native Shaping Proof

Status: PDF-PILOT-08B-R2C-D native shaping accepted.

## Objective

R2C-D binds the accepted report measurement profile to the external native
rustybuzz adapter lane and executes real shaping against the registered IBM
Plex Sans Thai Regular and Bold assets. It preserves every R2C-C request while
deduplicating engine work and retaining run-level font overrides.

This phase creates glyph ids, point advances, offsets, and UTF-16 cluster
ranges only. It does not claim break opportunities, line boxes, layout,
pagination, browser/worker WASM parity, or PDF rendering.

## Accepted Inputs

- R2C-C table projection fingerprint:
  `f1a756ec9d3028a0eba9cc455bec852eea16cbac9702cd825c4e29bc4113fc2c`;
- native shaping plan fingerprint:
  `0d68a40d45b56582b5e180794b92822a0b2297d773f0f764e07a7f7ba0eae9d1`;
- raw native evidence fingerprint:
  `a810f30f9964567b56cec7fc88470a8f99b450fe39e6f3abc6b596791e79cae8`;
- accepted mapped bundle fingerprint:
  `cec16cbc479dc9964014418e5fd887d2093c74388b86239bfcfe4bd78634395f`.

The builder verifies both registered font files against their manifest
SHA-256 identities before execution. Raw outputs retain repository-relative
font paths only.

## Run-Aware Binding

The 782 R2C-C block requests contain 896 authored runs. Of those, 114 label
runs override a Regular block with Bold. Shaping a whole block with one font
would therefore be incorrect.

R2C-D binds each run to an effective font and font size, then records three
separate identity layers:

- 782 source consumers preserve document/table lineage;
- 412 width-sensitive measurement variants prepare later line breaking;
- 434 font-, size-, and text-sensitive native shaping executions serve 895
  non-empty source runs.

One empty mapped table cell remains a zero-glyph run and does not call
rustybuzz. Deduplication removes 461 redundant native executions without
merging source consumer identities.

## Native Execution

The package-local Rust binary executes `rustybuzz = 0.20.1` against IBM Plex
Sans Thai Regular and Bold. Raw UTF-8 byte clusters are mapped through the
external adapter boundary into UTF-16 offsets used by FlowDoc.

Accepted evidence contains:

- 434 native executions;
- 10,032 mapped glyphs;
- zero missing glyphs;
- 329 zero-advance glyphs;
- 344 repeated-cluster glyphs from complex shaping;
- 179 Bold and 255 Regular execution keys.

The zero-advance and repeated-cluster counts are expected shaping facts, not
errors. Missing glyph id `0` is the blocking condition and remains absent.

## Honest Line Boundary

The existing raw mapper can construct a single-line smoke envelope, but R2C-D
does not retain that synthetic line as report evidence. Only its validated
glyph facts are copied into the report bundle.

Line breaking remains blocked because:

- the accepted measurement profile still names `icu4x-planned` and
  `icu4x-data-planned`, not a concrete executable revision;
- the R2B style catalog pins font sizes but not native line heights;
- the pinned WASM artifact exposes readiness identity only and has not
  qualified a report shaping export.

These are explicit downstream blockers. They do not invalidate the accepted
node-native glyph evidence.

## Boundaries

The accepted bundle records profile/style/font binding, run decomposition,
native rustybuzz execution, glyph mapping, and source consumer lineage.
Break opportunities, line boxes, layout, pagination, and PDF rendering remain
absent. Production measurement binding remains false.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-native-shaping
npx vitest run tests/pdfRendererPilotCanonicalReportNativeShaping.test.ts
npm run check
```

## Evidence

- `fixtures/pdf-pilot-canonical-report-native-shaping.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-native-shaping-raw.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-native-shaping-qa.v1.json`;
- `packages/pdf-renderer-pilot/src/canonicalReportNativeShaping.ts`;
- `tests/pdfRendererPilotCanonicalReportNativeShaping.test.ts`.

Next phase: `PDF-PILOT-08B-R2C-E` concrete ICU4X and line-height binding for
line-break execution.
