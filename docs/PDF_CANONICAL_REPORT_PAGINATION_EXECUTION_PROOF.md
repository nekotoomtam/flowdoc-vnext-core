# PDF Canonical Report Pagination Execution Proof

Status: PDF-PILOT-08B-R2C-J bounded pagination and authoritative thirteen-page plan accepted; rendering remains blocked.

## Objective

R2C-J consumes the exact R2C-I pagination inputs, R2C-F measured composition,
and R2C-H spacing bindings. It executes every family paginator through the Core
composition transition, retains resumable checkpoints, and finalizes one
authoritative Core page plan without creating renderer or PDF output.

## Accepted Sources

- R2C-I pagination-input fingerprint:
  `53b7625803925243bbb62ca9a7afcb12257f3fd47e82deebc7de3162ae63de00`;
- R2C-F measured-composition fingerprint:
  `d23b90b440286d7e9061859b60f3a68dc317ac25138b098c5381c63e97bed108`;
- R2C-H section-reconciliation fingerprint:
  `4b538abb9c849abad3cee9a6bfd498f55c351e1adc31300dcae0f82c94def972`;
- pagination-ready Core manifest fingerprint:
  `sha256:e168b089540c1022cf40da1f62a6750f58b4e8950b2eb67e0fac7ddb535f3e42`.

## Bounded Execution

Every Core transition is restricted to:

- one family page;
- one family fragment;
- one accepted placement;
- one emitted closed page.

The complete run uses 185 transitions grouped into twelve retained slices of at
most sixteen transitions. Each slice retains its before/after checkpoint
fingerprints, trace fingerprints, and emitted page indexes. Re-executing with a
one-transition slice limit produces the byte-identical transition trace, page
plan, heading map, and terminal checkpoint.

The execution distribution is:

- 159 text-flow transitions;
- twenty table-flow transitions;
- six media-flow transitions;
- seven fresh-page retries;
- zero unowned structure-resume transitions.

## Spacing And Tables

The R2C-H demand/window spacing bridge executes for every family demand. Final
committed first-fragment spacing is 881pt across 165 placements. Twelve
fresh-page or continuation decisions suppress 78pt of attempted page-top
spacing. A fresh-page-required window commits neither content nor gap.

All fifteen table inputs use `repeat-leading-headers`. Five table continuation
pages retain five repeated header fragments. No table content is deleted or
scaled to force the target page count.

## Page Result

The authoritative result is thirteen Letter pages, not the twelve-page target:

- 173 body roots are present;
- 178 placements are retained because five tables continue onto another page;
- twelve heading placements populate the Core heading-page map;
- page indexes are consecutive from zero through twelve;
- every page remains inside its `641.952756pt` body height;
- no intentional blank page is produced.

The final page contains only the second fragment of
`table-gdim-expected-fields-gdim-expected-fields`. It uses 328pt and retains
`313.952756pt` below it. This proves that the earlier thirteen-capacity-unit
warning was real; page-top suppression and current repeated-header behavior do
not recover the twelve-page target.

## Fingerprints

- terminal checkpoint:
  `sha256:06597f4ae707eb24870197af84975bbd09c1709517becd7119ed380de1349c22`;
- Core page plan:
  `sha256:a8e66333fbbb7f1a7cffeafcee2379c62b64278cfc20595cd4148b8cc34146d6`;
- Core composition:
  `sha256:29e2a3bace769c9008aa9c98b3ae68167f0206eb508af39cddda0de517ee2409`;
- heading-page map:
  `sha256:b00c0a1f11da91868c44b86623b545da6603cce5978a00d95eb1aac9dbc9f433`;
- accepted R2C-J bundle:
  `75390eb748762fff6a6f181c5da9503208a7632b5f63d14e1f29f1bad23888c6`.

## Boundary

R2C-J owns bounded family pagination, spacing-aware document transitions,
closed-page chaining, final page assignments, and the heading-page map. It does
not own page-specific generated footer expansion, static-zone paint instances,
renderer display lists, PDF bytes, or visual acceptance.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-pagination-execution
npm test -- --run tests/pdfRendererPilotCanonicalReportPaginationExecution.test.ts
```

Primary retained evidence:

- `fixtures/pdf-pilot-canonical-report-pagination-execution.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-pagination-execution-qa.v1.json`;
- `packages/pdf-renderer-pilot/src/canonicalReportPaginationExecution.ts`;
- `tests/pdfRendererPilotCanonicalReportPaginationExecution.test.ts`.

Next phase: `PDF-PILOT-08B-R2C-K` generated static-zone instances and renderer
handoff. The twelve-page fidelity miss remains a separate evidence-backed
layout-calibration decision; R2C-K must not hide it by dropping content.
