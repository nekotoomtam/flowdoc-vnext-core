# PDF Canonical Report Pagination Inputs Proof

Status: PDF-PILOT-08B-R2C-I pagination inputs and footer capacity proof accepted; pagination remains blocked.

## Objective

R2C-I consumes the accepted R2C-C through R2C-F evidence and the reconciled
R2C-H manifest. It binds every body root to an exact family-owned source,
bounded pagination configuration, initial family cursor, and composition cursor
reference. It also expands one generated page-number capacity sample and sends
it through native shaping, native line segmentation, line wrapping, and Core
measured-line acceptance.

The phase does not execute a family paginator, document transition, spacing
suppression, page assignment, actual per-page number expansion, or PDF render.

## Accepted Inputs

- R2C-C projection fingerprint:
  `f1a756ec9d3028a0eba9cc455bec852eea16cbac9702cd825c4e29bc4113fc2c`;
- R2C-D native-shaping fingerprint:
  `cec16cbc479dc9964014418e5fd887d2093c74388b86239bfcfe4bd78634395f`;
- R2C-E line-breaking fingerprint:
  `10276a106ef11b275de4866d1597a1d6a6c19621f1fe6e41ff6bd1d9e9056c56`;
- R2C-F measured-composition fingerprint:
  `d23b90b440286d7e9061859b60f3a68dc317ac25138b098c5381c63e97bed108`;
- R2C-H section-reconciliation fingerprint:
  `4b538abb9c849abad3cee9a6bfd498f55c351e1adc31300dcae0f82c94def972`;
- R2C-I plan fingerprint:
  `d13f1bf650d515ebccf945c24b254a00363364cf5252185167c6a08e118fcbf2`;
- pagination-ready Core manifest fingerprint:
  `sha256:e168b089540c1022cf40da1f62a6750f58b4e8950b2eb67e0fac7ddb535f3e42`;
- accepted bundle fingerprint:
  `53b7625803925243bbb62ca9a7afcb12257f3fd47e82deebc7de3162ae63de00`.

## Core Boundaries

Core text measurement now accepts an explicit generated page-number binding.
The generated run is not rewritten as authored text: it retains kind
`generated-page-number`, the generated value, the authored inline id, and a
compact generation-owner fingerprint. Omitting the expansion or its owner
continues to fail closed.

Core table-flow now exposes an initial-cursor constructor using the same
prepared-row source fingerprint and profile fingerprint as the paginator. This
lets composition preparation create a real resumable cursor without executing
a table page planner.

## Family Inputs

All 173 reconciled body roots are bound:

- 153 text-flow roots reference their exact R2C-F document block and Core
  accepted measured lines;
- fifteen table-flow roots reference their exact prepared-row stream and pin
  `repeat-leading-headers`;
- five media-flow roots retain newly created Core atomic image evidence from
  the resolved node and exact image binding.

Each input stores a source locator, family source pin, measurement owner,
bounded page/work limits, full initial family cursor, composition cursor
reference, and compact input fingerprint. Large prepared-row packets remain in
the accepted R2C-F bundle; locators retain their SHA-256 identity instead of
duplicating the packets.

The R2C-H manifest used provisional measurement owners. R2C-I replaces all 173
with the owner expected by each family adapter:

- text: `createVNextTextFlowV4MeasurementFingerprint`;
- table: `createVNextTableFlowV4SourceFingerprint`;
- media: atomic evidence fingerprint.

## Generated Footer

The canonical repeating footer is expanded as
`รายงานผลการทดสอบ | หน้า 8888`. Four digits cover the manifest limit of 1,000
pages and follow Core's existing repeated-eight page-number capacity convention.
The expansion is a capacity proof, not the final text for a particular page.

IBM Plex Sans Thai Regular at 9pt is shaped by native rustybuzz, segmented by
native ICU4X, wrapped at the exact `498.614173pt` footer width, and accepted by
Core as one 12pt line. The measured width is `128.52pt`; the 24pt footer
reservation therefore retains 12pt vertical slack. All 28 glyphs are covered
and no missing glyph is present.

The refinalized manifest replaces the deferred footer evidence with this
capacity measurement. Actual page-number glyphs remain blocked until document
pagination establishes final page numbers.

## Remaining Gate

R2C-I does not change the R2C-H capacity result. Gross demand remains thirteen
capacity units against the twelve-page target. Only real document composition
can reveal page-top gap suppression, table-header repetition, continuation
overhead, and final page count.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-pagination-inputs
npx vitest run tests/textBlockV4Measurement.test.ts tests/tableFlowV4WindowPagination.test.ts tests/pdfRendererPilotCanonicalReportPaginationInputs.test.ts
npm run check
```

## Evidence

- `src/pagination/textBlockV4Measurement.ts`;
- `src/table/tableFlowV4WindowPagination.ts`;
- `fixtures/pdf-pilot-canonical-report-pagination-inputs.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-pagination-inputs-raw.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-pagination-inputs-qa.v1.json`;
- `packages/pdf-renderer-pilot/src/canonicalReportPaginationInputs.ts`;
- `tests/pdfRendererPilotCanonicalReportPaginationInputs.test.ts`.

Next phase: `PDF-PILOT-08B-R2C-J` bounded document composition transition and
pagination execution.
