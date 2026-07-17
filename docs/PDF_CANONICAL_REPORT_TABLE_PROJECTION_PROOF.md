# PDF Canonical Report Table Projection Proof

Status: PDF-PILOT-08B-R2C-C table projection accepted.

## Objective

R2C-C replaces six exhaustive report tables with explicit, labelled
presentation views before text-engine execution. The source collection
contracts and values remain unchanged; one collection may now be presented by
more than one table.

This phase projects tables and prepares geometry and measurement requests. It
does not execute shaping, line breaking, line-box creation, layout,
pagination, or PDF rendering.

## Accepted Inputs

- R2A data bundle fingerprint:
  `ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d`;
- R2B template bundle fingerprint:
  `86f4fc3ddea01bfeba013292b09cbddb92dc7731cc07398c6c65f536ab27cf38`;
- R2C-A formatting bundle fingerprint:
  `e4f0411afc7d6868971019fb536146f63aa355b5a6e48c606502342bd6302e26`;
- R2C-B measurement handoff fingerprint:
  `07126bb73a6c9dd7342b1fb9e33cdd696d89cb660056d237cb708118fb2f15d2`.

The projection contract fingerprint is
`028956cc81c16d7f29c42913ee9a154f56faaf20d5b39097fb0c73b62b066f3c`.
The accepted bundle fingerprint is
`f1a756ec9d3028a0eba9cc455bec852eea16cbac9702cd825c4e29bc4113fc2c`.

## Projection Contract

The six collection presentations become fifteen labelled views:

| Collection | Source fields | Views | Projected columns |
| --- | ---: | ---: | ---: |
| `report.ocr_runs` | 19 | 4 | 22 |
| `report.native_runs` | 21 | 5 | 25 |
| `report.mapping_fields` | 8 | 2 | 10 |
| `report.native_missing_concepts` | 2 | 1 | 2 |
| `report.runs` | 11 | 2 | 12 |
| `report.gdim_expected_fields` | 2 | 1 | 2 |

Every one of the 63 source item fields has exactly one `primary` placement.
Ten `context` placements repeat engine, Run ID, or schema path only where a
split view needs row identity; each repeated field also has a primary
placement. Each view has at most six columns, each column receives at least
10% of the 175mm table width, and every view's shares total exactly 100%.

The projection owns view labels, selected columns, width shares, and explicit
context repetition. It does not own or mutate source collection shapes,
source values, or R2C-A display formatting.

## Resolution And Request Coverage

The projected Document v4 graph removes the six source table subtrees and
inserts fifteen title/table pairs in the same section positions. Scoped Core
resolution then materializes:

- 15 projected tables;
- 131 projected collection rows from the original 73 source rows;
- 544 formatted item bindings;
- 165 document requests, including 15 projection-title requests;
- 73 authored header requests and 544 materialized cell requests;
- 782 ready requests in total;
- 12 unchanged generated page-number deferrals.

Repeated contexts create additional presentation rows and bindings, not new
source records. Raw values and identities remain available from the accepted
source bundles; request text consumes the cloned R2C-A display overlay.

## Geometry Correction

All projected tables retain the R2C-B physical width of `496.062992pt` and
`4pt` cell insets. The maximum column count falls from 21 to 6. Minimum cell
content width rises from `15.622047pt` to `41.606299pt`; the largest projected
cell content width is `339.244094pt`.

This closes the table-shape gate found by R2C-B. It does not prove that every
string fits on one line. Wrapping and resulting row height remain facts for
the text engine and later layout phases.

## Boundaries

The accepted bundle records table projection, scalar/image resolution,
collection materialization, display formatting consumption, table geometry,
and measurement-request preparation. Text shaping, line breaking, line boxes,
layout, pagination, and PDF rendering remain `not-run`.

No measured glyph, line, coordinate, page assignment, or PDF byte is
introduced.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-table-projection
npx vitest run tests/pdfRendererPilotCanonicalReportTableProjection.test.ts
npm run check
```

## Evidence

- `fixtures/pdf-pilot-canonical-report-table-projection.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-table-projection-qa.v1.json`;
- `packages/pdf-renderer-pilot/src/canonicalReportTableProjection.ts`;
- `tests/pdfRendererPilotCanonicalReportTableProjection.test.ts`.

Next phase: `PDF-PILOT-08B-R2C-D` text-engine profile binding and execution
boundary.
