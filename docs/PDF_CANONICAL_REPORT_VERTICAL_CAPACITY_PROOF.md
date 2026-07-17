# PDF Canonical Report Vertical Capacity Proof

Status: PDF-PILOT-08B-R2C-G capacity evidence accepted; twelve-page fidelity blocked.

## Objective

R2C-G consumes the accepted R2C-C projection and R2C-F measured composition.
It binds exact inter-root spacing evidence, derives Letter page-region capacity,
checks static header/footer reservations, proves that every body root can make
fresh-page progress, and finalizes a Core document-composition manifest.

The phase prepares composition inputs only. It does not mutate Document v4,
apply spacing inside the Core transition, expand generated page numbers, place
roots, split table rows, repeat headers, assign pages, or render PDF bytes.

## Accepted Inputs

- R2C-C projection fingerprint:
  `f1a756ec9d3028a0eba9cc455bec852eea16cbac9702cd825c4e29bc4113fc2c`;
- R2C-F measured-composition fingerprint:
  `d23b90b440286d7e9061859b60f3a68dc317ac25138b098c5381c63e97bed108`;
- vertical-capacity plan fingerprint:
  `2f260b4c9f98ed839430f31eed05a26b2a4a4c38bf38c6d3c92716377b491b1a`;
- Core composition-manifest fingerprint:
  `sha256:a5af7493019f73d69382afbf3872ebd14c58d325c06924ff0898c4a4788bdb49`;
- accepted vertical-capacity bundle fingerprint:
  `5926711cbca1000888e4d7accb99d000f4c6549d504b2359c4b97884272bc994`.

Both source bundles are self-hash checked and R2C-F must retain the exact R2C-C
lineage before capacity preparation can run.

## Spacing Profile

Document v4 does not currently define paragraph/root margins, and Core document
composition does not consume inter-root spacing. R2C-G therefore records a
fail-closed pilot profile rather than treating every gap as zero or silently
changing the source document.

The profile derives all gaps from accepted R2C-E line heights:

| Adjacency | Gap | Applied |
| --- | ---: | ---: |
| report title to body | 15pt | 1 |
| section heading to body | 11pt | 11 |
| body to body | 3pt | 114 |
| body to image | 12pt | 5 |
| image to table label | 12pt | 3 |
| body to table label | 12pt | 3 |
| table label to table | 6pt | 15 |
| table to next table label | 12pt | 9 |

All 161 non-initial adjacencies match exactly one rule. Twelve section-start
items have zero leading gap. Preserving every gap produces `808pt` of spacing;
spacing before the first fragment on a fresh page is marked for suppression,
but that behavior is not executed in this phase.

## Page Regions

Every section retains portrait Letter geometry:

- page: `612 x 792pt`;
- margins: `51.023622pt` top/bottom and `56.692913pt` left/right;
- header/footer reservations: `24pt` each;
- body origin: `(56.692913, 75.023622)pt`;
- body size: `498.614173 x 641.952756pt`.

All twelve measured `12pt` headers fit their reservation with `12pt` slack.
All twelve generated footers reserve the same expected single-line height and
slack, but remain explicitly unmeasured until page-number expansion.

## Core Manifest And Progress

Core `finalizeVNextDocumentCompositionManifestV1` accepts twelve sections and
173 body roots in authored order:

- 153 text-flow roots;
- 15 table-flow roots;
- five media-flow roots.

Every owner pin and initial cursor uses a compact SHA-256 fingerprint. All 173
roots have a legal fresh-page progress unit. The largest atomic media demand is
the cover image at `297.637795pt`. One whole table, `gdim-expected-fields`, is
`804pt` and cannot fit atomically, but its repeated-header plus maximum-row
progress unit is only `50pt`, so table splitting remains feasible.

## Twelve-Page Fidelity Gate

Natural body height totals `6826.047243pt`; preserving all accepted gaps raises
the demand to `7634.047243pt`. Ignoring section boundaries, these values occupy
11 and 12 body-capacity units respectively.

Core composition closes the current page at each section boundary. Under that
real boundary, natural height alone requires at least 17 pages. Preserved-gap
capacity requires 18. The 12-page fidelity target is therefore blocked by a
minimum natural delta of five pages before table header repetition or any other
pagination overhead.

The natural multi-page sections are OCR accuracy (2), native extraction (3),
mapping (2), and appendix evidence (2). Spacing makes latency/cost/size require
a second capacity unit as well. This mismatch comes from current content density
and fresh-section semantics, not from text shaping or line breaking.

## Boundaries

R2C-G owns the line-height-ratio spacing profile, exact adjacency coverage,
Letter region geometry, static-zone reservation checks, Core composition
manifest, root progress checks, and mathematical section-capacity floor.

It does not own source-document spacing mutation, the Core spacing transition
bridge, generated footer measurement, coordinates, page assignment, row
splitting, repeated headers, pagination, or PDF bytes.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-vertical-capacity
npx vitest run tests/pdfRendererPilotCanonicalReportVerticalCapacity.test.ts
npm run check
```

## Evidence

- `fixtures/pdf-pilot-canonical-report-vertical-capacity.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-vertical-capacity-qa.v1.json`;
- `packages/pdf-renderer-pilot/src/canonicalReportVerticalCapacity.ts`;
- `tests/pdfRendererPilotCanonicalReportVerticalCapacity.test.ts`.

Next phase: `PDF-PILOT-08B-R2C-H` section-capacity reconciliation and Core
spacing transition bridge.
