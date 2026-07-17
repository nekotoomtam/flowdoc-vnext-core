# PDF Canonical Report Measurement-Request Handoff Proof

Status: PDF-PILOT-08B-R2C-B measurement-request handoff accepted.

## Objective

R2C-B converts the accepted R2B Document v4 graph and R2C-A display overlay
into exact text-measurement requests. It locks page and table widths before a
text engine runs, while retaining raw source values and generated-content
boundaries.

This phase prepares requests only. It does not execute shaping, line breaking,
line-box creation, layout, pagination, or PDF rendering.

## Accepted Inputs

- R2A data bundle fingerprint:
  `ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d`;
- R2B template bundle fingerprint:
  `86f4fc3ddea01bfeba013292b09cbddb92dc7731cc07398c6c65f536ab27cf38`;
- R2C-A formatting bundle fingerprint:
  `e4f0411afc7d6868971019fb536146f63aa355b5a6e48c606502342bd6302e26`;
- IBM Plex Sans Thai Regular and Bold target-copy hashes from
  `assets/fonts/font-assets.v1.json`.

The builder rejects source drift before creating a handoff.

## Measurement Identity

The handoff derives one stable `measurementProfileId` through the Core
measurement-profile identity contract. It includes:

- IBM Plex Sans Thai Regular and Bold ids plus SHA-256 identities;
- all six R2B style-key-to-font mappings;
- rustybuzz `0.20.1` shaping identity;
- the planned deterministic ICU4X segmenter/data identity;
- the explicit Thai UAX14 policy, fallback policy, and glyph-line-box output
  shape.

The profile is an identity plan, not a production engine binding. ICU4X and
the text engine are not executed in this phase.

## Width And Geometry Facts

All twelve sections use portrait US Letter pages (`612 x 792pt`). The 20mm
left and right margins produce a `498.614173pt` body width. Authored table
columns total 175mm (`496.062992pt`). Conversion keeps full precision until the
final point value is rounded.

Table cells use the retained pilot inset behavior: `4pt` on every side. Core
Table Cell Geometry v1 prepares 126 header/body-template cell geometries and
fingerprints them before measurement.

## Request Coverage

The accepted bundle contains:

- 150 non-table resolved-document requests;
- 63 authored header-cell requests;
- 476 materialized collection-cell requests;
- 689 ready measurement requests in total;
- 12 deferred footer blocks containing generated page numbers.

All 114 document and 476 collection display bindings reach a request. The
requests carry exact instance revision, section, text-block, style, width,
profile, rendered text, run boundaries, and source field/inline identities.
R2C-A display text is projected through cloned resolved bindings;
R2B source bindings and materializations remain unchanged.

## Generated Content Boundary

The twelve footer blocks remain `generated-inline-deferred`. Core correctly
rejects exact measurement of a `page-number` inline until generated expansion
has supplied its value. R2C-B does not insert placeholder page numbers.

## Geometry Finding

The handoff exposed a template problem before engine execution:

| Collection | Columns | Minimum cell content width |
| --- | ---: | ---: |
| `report.ocr_runs` | 19 | `18.108579pt` |
| `report.native_runs` | 21 | `15.622047pt` |
| `report.runs` | 11 | `37.096636pt` |

The table styles are `9.1pt` body and `9.3pt` header. R2B currently projects
every collection item field into one equal-width horizontal table. Automatic
wrapping cannot correct that presentation choice; it would only produce very
tall, difficult-to-read cells.

The request handoff is accepted because its geometry and lineage are correct.
Report-wide text-engine execution is gated until the table projection is
revised through selected columns, grouped tables, landscape sections, or an
equivalent explicit design decision.

## Boundaries

The accepted bundle records:

- locale display formatting: `consumed`;
- measurement profile identity: `stable`;
- table geometry: `prepared`;
- measurement requests: `prepared`;
- text shaping, line breaking, line boxes, layout, pagination, and PDF
  rendering: `not-run`.

No source value, authored graph, measured line, glyph, coordinate, page, or PDF
byte is introduced.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-measurement-handoff
npx vitest run tests/pdfRendererPilotCanonicalReportMeasurementHandoff.test.ts
npm run check
```

## Evidence

- `fixtures/pdf-pilot-canonical-report-measurement-handoff.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-measurement-handoff-qa.v1.json`;
- `packages/pdf-renderer-pilot/src/canonicalReportMeasurementRequestHandoff.ts`;
- `tests/pdfRendererPilotCanonicalReportMeasurementHandoff.test.ts`.

Next phase: `PDF-PILOT-08B-R2C-C` report table projection and geometry
correction before report-wide text-engine execution.
