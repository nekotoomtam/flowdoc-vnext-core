# PDF Canonical Report Line Breaking Proof

Status: PDF-PILOT-08B-R2C-E native line-box evidence accepted.

## Objective

R2C-E consumes the accepted R2C-D native glyph bundle, binds report line
heights to retained typography calibration, executes a concrete ICU4X native
segmenter, and wraps every width-sensitive report measurement into Core line
box facts.

This phase closes native break-opportunity and line-box evidence only. It does
not mutate the accepted measurement profile, bind production measurement,
qualify browser/worker WASM parity, compose vertical blocks or table rows,
paginate, or render PDF bytes.

## Accepted Inputs

- R2C-D native shaping fingerprint:
  `cec16cbc479dc9964014418e5fd887d2093c74388b86239bfcfe4bd78634395f`;
- retained typography calibration fingerprint:
  `9f3568dd46a1ff9c6a0e40cf8aed66135a63ae74436c92788788ad00726ba04f`;
- line-breaking plan fingerprint:
  `0aadd3a51d4aea8f961089631283ff00fed4befc69649af699d5430a2cabc827`;
- raw native segmentation fingerprint:
  `8461dc9c9dfd1f8d7509ab9b9d8d180b235c9ae03febead5e1f34acaf0c66ea5`;
- accepted line-breaking bundle fingerprint:
  `10276a106ef11b275de4866d1597a1d6a6c19621f1fe6e41ff6bd1d9e9056c56`.

The source R2B profile still says `icu4x-planned` and
`icu4x-data-planned`. R2C-E records the concrete pilot identity separately as
`icu_segmenter-2.2.0` with `icu_segmenter_data-2.2.0`; it does not silently
rewrite the accepted source profile.

## Line Height Binding

All six R2B report styles are bound to retained Phase 08B typography values:

| Report style | Font size | Line height | Calibration source |
| --- | ---: | ---: | --- |
| `report-title` | 24pt | 31pt | `coverTitle` role reuse from 25/31pt |
| `section-heading` | 16pt | 22pt | exact `pageTitle` match |
| `report-body` | 10.5pt | 15pt | exact `body` match |
| `report-caption` | 9pt | 12pt | exact `caption` match |
| `table-header` | 9.3pt | 12pt | exact table header match |
| `table-body` | 9.1pt | 11pt | exact table body match |

The title mismatch is explicit provenance, not an exact-match claim. The
accepted 31pt role line height is reused for the 24pt R2B title pending later
visual calibration.

## Native Segmentation And Offsets

The package-local Rust binary constructs
`LineSegmenter::new_auto(Default::default())` once per execution and retains
ICU4X byte boundaries, including boundary zero. The TypeScript evidence
boundary converts every UTF-8 byte offset to a verified UTF-16 code-unit
offset before Core wrapping.

The 412 measurement variants contain 352 unique non-empty texts. R2C-E runs
352 native segmentations, reuses them for 59 duplicate texts, and handles one
empty table cell through an explicit one-empty-line policy without calling the
segmenter.

ICU4X UAX #14 boundaries remain primary. The report policy adds deterministic
soft breaks after `.`, `_`, `/`, and `-` only when the full text is a machine
identifier. This tailoring supplies 226 of 1,642 retained opportunities and
prevents 22 schema-path overflows observed with unmodified UAX #14 behavior.
Normal Thai and prose text do not receive delimiter tailoring.

## Line Box Acceptance

Accepted evidence contains:

- 782 retained source consumers;
- 412 width-sensitive measurement variants;
- 10,998 measurement glyph references;
- 10,998 glyphs covered exactly once by contiguous line ranges;
- 441 line boxes;
- 29 multi-line measurements;
- zero lines wider than their available width;
- a maximum of two lines per current measurement.

The report title wraps into two 31pt lines. Long schema paths wrap at explicit
identifier delimiters. Every non-empty measurement ends at a mandatory
text-end break, no break splits a shaped cluster, line offsets are contiguous,
and y offsets are exact multiples of the bound line height.

## Boundaries

R2C-E owns calibration-backed line heights, native ICU4X execution, byte to
UTF-16 break mapping, report-specific machine-identifier tailoring,
glyph-advance wrapping, and line-box evidence.

It does not own source values, display formatting, source profile mutation,
vertical block spacing, table row height, pagination, or PDF bytes. Native to
WASM segmentation parity and production measurement binding remain blocked.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-line-breaking
npx vitest run tests/pdfRendererPilotCanonicalReportLineBreaking.test.ts
npm run check
```

## Evidence

- `fixtures/pdf-pilot-canonical-report-line-breaking.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-line-segmentation-raw.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-line-breaking-qa.v1.json`;
- `packages/pdf-renderer-pilot/src/canonicalReportLineBreaking.ts`;
- `tests/pdfRendererPilotCanonicalReportLineBreaking.test.ts`.

Next phase: `PDF-PILOT-08B-R2C-F` line-box acceptance and vertical block/table
composition readiness.
