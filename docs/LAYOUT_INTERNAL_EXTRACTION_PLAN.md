# Layout Internal Extraction Plan

Status: implementation baseline complete.

This document owns Phase 17 after the Lane C public pipeline baseline.

## Goal

Reduce the measured pagination monolith by moving stable contracts and fragment
construction out of `paginateVNextDocument(...)` before deeper text/table
layout and wrap improvements.

## Extraction Boundaries

| Module | Owns | Must Not Own |
|---|---|---|
| `src/pagination/measuredTypes.ts` | measured pagination options, warning, page, fragment, and pagination contracts | placement algorithms |
| `src/pagination/measuredFragments.ts` | measured page creation, source-item lookup, fragment ids, fragment geometry rounding, body/static bucket assignment, missing-source warnings | text wrapping or page-breaking decisions |
| `src/pagination/measuredPagination.ts` | current behavior-preserving placement engine | owning all measured contracts |
| renderer/export/layout pipeline consumers | measured contracts from `measuredTypes.ts` | importing types from the placement engine |

## Current Implementation

- `measuredTypes.ts` is the shared measured pagination contract module.
- `measuredFragments.ts` creates measured pages and appends fragments using
  pagination source item metadata.
- `paginateVNextDocument(...)` now uses the measured fragment builder instead
  of owning fragment construction inline.
- `rendererConsumption.ts`, `exportReadiness.ts`, `layoutPipeline.ts`, and
  `editorBridge/runtime.ts` import measured contracts from `measuredTypes.ts`.
- `measuredPagination.ts` re-exports measured contracts for compatibility with
  existing imports.

## Current Behavior Contract

- Fragment ids remain document-run ordered.
- Missing source items still emit `missing-source-item` warnings and keep the
  fallback source item id.
- Body and header/footer fragment id buckets are assigned by zone role.
- Fragment geometry is still rounded to two decimals before renderer
  consumption.
- Existing measured pagination behavior remains covered by current tests.

## Not Changed

- Text wrapping and line splitting behavior was not changed.
- Table row/cell pagination behavior was not changed.
- `paginateVNextDocument(...)` still owns the actual placement algorithm.
- The pipeline measurement job records still schedule work; they do not yet
  execute isolated measurement jobs.
- No renderer-backed measurement profile or concrete PDF/DOCX adapter was
  added.

## Next Internal Split

The next safe extraction target is text-block layout:

- move line-slice planning out of `paginateVNextDocument(...)`;
- keep page movement decisions explicit at the stage boundary;
- add wrap-focused tests before changing measurement quality;
- only then improve wrap behavior itself.

## Verification

- `tests/measuredFragments.test.ts` covers measured page creation, source-item
  backed fragment appending, geometry rounding, fragment bucket assignment, and
  missing-source warning behavior.
- Existing measured pagination, renderer-consumption, export-readiness, and
  layout pipeline tests must continue to pass.
- `npm run check` must pass.
