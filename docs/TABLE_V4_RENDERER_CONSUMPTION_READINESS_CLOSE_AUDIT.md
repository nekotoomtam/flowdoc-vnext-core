# Table V4 Renderer Consumption Readiness Close Audit

Status: Phase 327 close audit.

## Outcome

Table v4 renderer consumption is ready as a core-owned, renderer-neutral,
no-relayout command boundary. Accepted synchronized pagination now carries all
required geometry and source facts into deterministic page, segment,
background, row, cell, candidate, and single-owner border commands.

This closes renderer **consumption readiness**. It does not claim production
PDF/DOCX bytes, font/media loading, backend export jobs, or editor canvas
replacement.

## PASS

- Measured text and width survive text evidence and prepared candidates.
- Image candidates retain width, height, alignment, asset identity, and owner.
- Prepared cells and row fragments retain vertical alignment, content width,
  and insets.
- Authored and materialized rows retain semantic row roles through pagination.
- Page origins and style profiles are strict, versioned, finite, and
  fingerprint-pinned.
- Projection rejects missing/extra/duplicate origins, stale pagination,
  invalid page/row/cell/candidate bounds, width drift, and missing required
  media before returning any partial commands.
- Command order is deterministic: page, segment, backgrounds, row/cell and
  candidates, internal borders, then outer borders.
- Vertical alignment uses only unused height inside one physical row fragment;
  it never moves content across pages.
- Outer segment, internal column, internal row, continuation, and repeated
  header edges have one owner and duplicate edge ownership is blocked.
- Missing media follows explicit `block` or `draw-placeholder` policy.
- SVG geometry evidence is deterministic, bounded, XML-safe, and performs no
  media fetch or relayout.
- PDF/DOCX adapter plans retain one operation per command and expose no-paint or
  fallback mappings instead of silently changing layout.
- The 1,000-body-row fixture produces 250 pages and 6,250 byte-stable commands
  with exact linear page/row/cell/candidate/border work counts.
- Active document v3 renderer consumption and adapters remain independent.

## FAIL / BLOCKER

None for the renderer-consumption scope.

Production artifact readiness remains intentionally blocked until concrete
font/media loading, PDF/DOCX execution, capability acceptance, and export job
contracts exist.

## RISK

- SVG is geometry evidence, not a final typography or media preview.
- DOCX continuation-border ownership currently requires an explicit adapter
  fallback and may not reproduce physical PDF edges exactly.
- Border widths are centered on accepted edge coordinates; concrete adapters
  must agree on clipping semantics.
- Text-line commands retain measured text/source ranges and a fallback color,
  but complete rich-run paint/style projection remains future work.
- Command arrays are deterministic but may need streaming or workers for much
  larger production documents.

## UNKNOWN

- Final product border/background presets and style inheritance.
- Font embedding, glyph fallback, image decode, and asset authorization.
- Accepted PDF/DOCX capability matrix and visual-diff tolerances.
- Editor hit-testing and selection over split/repeated Table fragments.
- Production streaming, cancellation, retry, and memory thresholds.

## Files Changed

- Renderer fact flow: `src/table/tableTextFragmentEvidenceV1.ts`,
  `src/table/tableContentMaterializationContractV1.ts`,
  `src/table/tableContentMaterializationV1.ts`,
  `src/table/tablePreparedCellContractV1.ts`,
  `src/table/tablePreparedCellBuilderV1.ts`,
  `src/table/tablePreparedMaterializedCellsV1.ts`, and
  `src/table/tablePreparedAuthoredCellsV1.ts`.
- Pagination output: `src/table/tableRowPaginationContractV1.ts`,
  `src/table/tableRowPaginationV1.ts`, `src/table/tablePaginationContractV1.ts`,
  and `src/table/tablePaginationV1.ts`.
- Renderer contracts/projection/adapters:
  `src/table/tableRendererContractV1.ts`,
  `src/table/tableRendererProjectionV1.ts`, and
  `src/table/tableRendererAdaptersV1.ts`.
- Public exports, phase docs, and focused/scale/close-audit tests.

## Behavior Changed

- Core output no longer requires a renderer to reopen authored Table nodes for
  text, image alignment, row role, vertical alignment, width, or inset facts.
- Consumers can request a complete renderer-neutral command list pinned to one
  accepted pagination fingerprint and explicit physical page origins.
- Missing media, geometry drift, and ownership ambiguity block before paint.
- SVG/PDF/DOCX consumers have bounded plans without permission to remeasure or
  repaginate.

## Tests Run

- Core: type-check and 253 test files / 1,350 tests before this close document.
- Editor: type-check, 27 test files / 157 tests, and production build.
- Backend: type-check, 13 test files / 45 tests, and build.
- Final core type-check/full suite is required after adding this close audit.

## Risks Left

- Production adapter execution and visual fidelity remain open.
- Rich-run paint facts and concrete font/media capability checks remain open.
- Large-output streaming policy remains open despite linear 250-page evidence.

## Intentionally Not Changed

- canonical Table/document/package schemas beyond additive renderer facts;
- Table materialization, measurement, prepared geometry, or pagination
  decisions;
- active document v3 renderer contracts and adapters;
- backend routes, storage, jobs, retries, or artifact persistence;
- editor React state, canvas, selection, history, or preview runtime;
- production PDF/DOCX artifact bytes.

## Next Recommended Direction

Enter the Table authoring lane now that semantic, pagination, and renderer
consumption boundaries are stable. Lock v4-native authored row/column/cell
commands, selection/impact contracts, and guarded structure edits before wiring
the editor UI. Keep production artifact execution as a separate later topic.
