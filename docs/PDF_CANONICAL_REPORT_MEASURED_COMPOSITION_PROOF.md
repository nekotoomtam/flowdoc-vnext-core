# PDF Canonical Report Measured Composition Proof

Status: PDF-PILOT-08B-R2C-F natural composition evidence accepted.

## Objective

R2C-F consumes the accepted report projection, native shaping, and native
line-breaking bundles. It submits every concrete consumer line result to the
public Core measured-line acceptance boundary, derives source-safe text block
heights, prepares authored and materialized table rows through the existing
Core table pipeline, and inventories top-level zone flow in authored order.

This phase closes natural block and whole-row preparation only. It does not
bind inter-block spacing, assign coordinates or pages, repeat table headers,
split rows, paginate, or render PDF bytes.

## Accepted Inputs

- R2C-C projection fingerprint:
  `f1a756ec9d3028a0eba9cc455bec852eea16cbac9702cd825c4e29bc4113fc2c`;
- R2C-D native shaping fingerprint:
  `cec16cbc479dc9964014418e5fd887d2093c74388b86239bfcfe4bd78634395f`;
- R2C-E line-breaking fingerprint:
  `10276a106ef11b275de4866d1597a1d6a6c19621f1fe6e41ff6bd1d9e9056c56`;
- measured-composition plan fingerprint:
  `cfe5a2d3db3f786e224045bd50b42ff02764f587904a0cdab2e73f8f61d9f1a2`;
- accepted measured-composition bundle fingerprint:
  `d23b90b440286d7e9061859b60f3a68dc317ac25138b098c5381c63e97bed108`.

Each source bundle is self-hash checked. The D-to-C and E-to-D lineage links,
measurement-profile identity, complete glyph coverage, and zero-overflow gate
must remain exact before composition can run.

## Core Acceptance

R2C-E stores 441 line boxes across 412 deduplicated measurement variants.
R2C-F expands those variants back to all 782 concrete source consumers and
calls `acceptVNextTextBlockV4MeasuredLines` with each consumer's exact Core
request. All 782 are accepted, producing 832 consumer-specific line records
with mapped authored/resolved source endpoints.

The document lane contains 165 accepted text blocks and 168 lines. Their
natural heights total `2548pt`. Five fixed `instance-media` image frames retain
their authored 170mm width and 105/78mm heights, totaling `1182.047243pt`.
No x or y coordinate is introduced.

## Table Preparation

The phase reuses the existing Core pipeline:

1. `createVNextTableTextFragmentEvidenceV1`;
2. `createVNextTablePreparedAuthoredCellsV1`;
3. `createVNextTablePreparedMaterializedCellsV1`;
4. `createVNextTablePreparedRowsV1`.

The fifteen projected tables prepare 146 rows and 617 cells. This includes 15
authored header rows and 131 materialized body rows. Every cell retains the
R2C-C geometry, including `4pt` insets, source-safe line candidates, vertical
alignment, and break policy.

Natural whole-row height is exactly
`max(minimumFirstFragmentHeightPt, maximumCellOuterHeightPt)`. Current rows
range from `19pt` to `30pt`; 47 cells are multi-line and one cell is an
intentional empty line. Natural table heights total `3240pt` before any table
spacing, header repetition, or row fragmentation.

## Ordered Flow Readiness

The twelve sections contain 36 zone flows and 197 top-level nodes:

- 173 body nodes ready;
- 12 header nodes ready;
- 12 footer page-number blocks explicitly deferred;
- 185 total ready nodes;
- `6970.047243pt` total ready natural height before inter-block spacing.

Every zone preserves authored `childIds` order. Each ready entry points to its
accepted text, prepared table, or fixed image evidence. The deferred footer
entries retain the reason `page-number-requires-generated-expansion` rather
than guessing page-number text or height.

## Boundaries

R2C-F owns Core measured-line acceptance, natural text/image height, table text
fragment evidence, prepared table cells and rows, natural whole-row height, and
ordered zone-flow inventory.

It does not own inter-block spacing, x/y placement, page assignment, header-row
repetition, row splitting, pagination, or PDF bytes. The accepted source
measurement profile remains pilot-only; native/WASM parity and production
measurement binding are still separate qualification work.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-measured-composition
npx vitest run tests/pdfRendererPilotCanonicalReportMeasuredComposition.test.ts
npm run check
```

## Evidence

- `fixtures/pdf-pilot-canonical-report-measured-composition.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-measured-composition-qa.v1.json`;
- `packages/pdf-renderer-pilot/src/canonicalReportMeasuredComposition.ts`;
- `tests/pdfRendererPilotCanonicalReportMeasuredComposition.test.ts`.

Next phase: `PDF-PILOT-08B-R2C-G` vertical flow spacing and page-capacity
composition.
