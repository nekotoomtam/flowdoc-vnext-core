# Table V4 Synchronized Row Pagination Readiness Close Audit

Status: Phase 322 synchronized Table row pagination close audit.

## Outcome

The bounded synchronized Table row pagination slice is ready. Core can consume
complete prepared rows, advance independent cell cursors through legal
candidate checkpoints, reconcile one maximum-height row fragment, commit all
cell cursors atomically, execute row break policies, assemble bounded pages,
and repeat leading authored headers without measurement or source mutation.

This close establishes semantic pagination readiness, including deterministic
250-page evidence. It does not claim renderer/export integration, production
cache/worker behavior, border-collapse presentation, or rowSpan support.

## PASS

### Cell Planning

- `src/table/tableCellPaginationContractV1.ts` publishes strict JSON-safe
  authored/resolved cell cursors with monotonic candidate indexes.
- `src/table/tableCellPaginationV1.ts` uses prepared prefix heights and bounded
  checkpoint lookup without rescanning consumed content.
- Top inset applies only at the initial boundary; bottom inset is reserved only
  when the final candidate completes the cell.
- Empty cells commit top/bottom insets once and consume zero height on later
  row continuations.
- Text-line and atomic image/divider/spacer candidates remain indivisible at
  their prepared boundaries.
- Stale identity, invalid bounds, false completion, oversized candidates, and
  empty-cell boundary insets larger than a page body block before cursor commit.

### Row Synchronization

- `src/table/tableRowPaginationContractV1.ts` retains row identity, source row
  index, fragment index, completion, and canonical cell cursors.
- `src/table/tableRowPaginationV1.ts` snapshots all cell cursors, plans every
  sibling once, and commits all cursor results together or none.
- Unequal cells advance independently while row fragment height uses maximum
  consumed cell height. Early-complete cells remain empty on continuation.
- `allow` splits at legal checkpoints. `prefer-keep` moves a fitting row to a
  fresh page then splits an oversized row. `strict-keep` completes in one
  fragment or blocks.
- First-fragment minimum row height moves to a fresh page when possible, blocks
  when larger than the page body, and is not repeated on continuation.
- Blocked sibling cells, row/cell identity/order drift, prepared-height drift,
  and no-progress states return no partial row cursor.

### Multi-row Pages

- `src/table/tablePaginationContractV1.ts` publishes strict Table cursor, page,
  row-fragment, summary, work, and issue contracts.
- `src/table/tablePaginationV1.ts` packs completed rows into remaining page
  height and carries at most one active split-row cursor to the next page.
- One partial first-page remainder may advance to a fresh page without being
  misclassified as no progress.
- Page and row-plan limits are independent. Every attempt is counted, including
  a legal failed-fit attempt that requests a fresh page.
- Page/row/cell fragments retain source identities, geometry, y offsets,
  completion, and unambiguous JSON-tuple fingerprints.
- Complete cursor continuation, malformed cursor, out-of-range row, page-limit,
  row-plan-limit, and fresh-page loop cases are explicit.

### Repeated Headers

- Only contiguous leading authored rows with role `header` repeat.
- Repeated headers are fresh layout fragments referencing the same authored
  row/cell identities; they allocate no document identity and enter no history.
- Every repeated header is planned from its initial cursor under strict-keep
  semantics on continuation pages.
- Missing leading headers, headers that cannot complete, and headers leaving no
  legal body-row progress block before a header-only loop is emitted.
- Footer repetition is not claimed.

### Determinism And Scale

- A fixture with one 20pt authored header and 1,000 20pt body rows paginates
  twice to byte-identical output.
- Both runs produce exactly 250 full pages, 1,250 row fragments/plans/cell
  plans/checkpoint lookups/candidate consumptions, and 249 repeated headers.
- The final cursor completes 1,001 source rows with no split rows or fresh-page
  advances in the fixture.
- Prepared input remains byte-identical and execution facts record no
  measurement or rendering.

## FAIL / BLOCKER

None for the bounded synchronized Table row pagination slice.

## RISK

- Repeated headers can consume most page height; the progress guard blocks
  impossible pages but product diagnostics still need presentation design.
- Maximum-height synchronization intentionally leaves blank space in shorter
  sibling cells.
- Candidate/page arrays retain rich source facts for deterministic rendering;
  production memory and caching for large mixed-content Tables remain unproven.
- Atomic candidates taller than the page body block; no responsive image-scale
  or clipping policy is inferred.
- Table cursor continuation assumes the caller retains the exact prepared row
  fingerprint and pagination profile outside this bounded contract.
- Wall-clock performance varies by runtime; factual operation counts are the
  retained complexity evidence.

## UNKNOWN

- Renderer border ownership across split rows and repeated headers.
- Border-collapse, background, vertical alignment, and blank sibling-space
  drawing behavior.
- Product-selected page/row-plan limits and user-facing blocked diagnostics.
- Incremental repagination cache and convergence after row edits/reorder.
- Footer repetition, group headers, subtotals, widow/orphan policy, and
  nested generated child families.
- Future rowSpan row-group synchronization and cursor versioning.

## Tests Run

- Targeted cell cursor/planner, synchronized row planner, multi-row paginator,
  repeated-header, and 250-page scale suites.
- Complete core type-check and Vitest suite with bounded workers.
- Backend and editor complete checks after final public exports.

## Intentionally Not Changed

- canonical package 3/document 4 schemas and Table Definition;
- materialization, prepared cells, measurement evidence, or identity allocation;
- existing Text-block and Columns pagination;
- active document v3 Table splitter;
- renderer consumption, PDF/DOCX export, and artifact assembly;
- backend transport/storage and editor authoring/runtime.

## Next Direction

Add Table renderer-consumption facts and a bounded visual adapter over the
accepted page/row/cell fragments. Define split-border and repeated-header border
ownership before connecting preview/export, then add incremental invalidation
and product diagnostics without changing semantic pagination truth.
