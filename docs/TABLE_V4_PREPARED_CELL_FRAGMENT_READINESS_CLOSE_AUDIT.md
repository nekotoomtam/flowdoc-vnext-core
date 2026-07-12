# Table V4 Prepared Cell Fragment Readiness Close Audit

Status: Phase 315 prepared Table cell fragment close audit.

## Outcome

The bounded prepared Table cell fragment slice is ready. Core can resolve exact
`colSpan` cell geometry, prepare collection and authored text measurement
packets through one Text-block builder, re-accept paired measurement evidence,
adapt supported child families into legal candidates, and assemble complete
authored/materialized rows in resolved order without running pagination.

This close does not claim synchronized row pagination or 200-300 page Table
readiness. Prepared rows are the immutable measurement-complete input for that
next boundary.

## PASS

### Geometry And Scope

- `src/table/tableCellGeometryV1.ts` resolves stable semantic column shares to
  deterministic point tracks once per request.
- Cell width uses exact `columnStart` and `colSpan`; the final column absorbs
  deterministic remainder without occupancy gaps.
- Explicit layout-profile insets produce outer/content widths. Unknown
  overrides and non-positive content widths block before measurement.
- Definition, materialization, geometry, document instance/revision, Structure
  version, style owner, measurement profile, and geometry fingerprint drift
  return no partial prepared rows.

### Measurement Evidence

- `src/pagination/textBlockV4Measurement.ts` exposes one pure resolved-node
  measurement packet builder shared by Resolved Document and Table paths.
- `src/table/tableTextMeasurementPreparationV1.ts` prepares cloned collection
  text using materialized inline bindings and exact cell width.
- `src/table/tableAuthoredTextMeasurementPreparationV1.ts` prepares static,
  header, footer, and empty-state text through exact Resolved Document field,
  image, and style bindings.
- `src/table/tableTextFragmentEvidenceV1.ts` requires paired request/result
  evidence, exact packet equality, complete re-acceptance, UTF-16-safe source
  ranges, and unchanged summary facts.
- Missing, extra, stale-width/profile/revision, altered source-range, and
  altered summary evidence block all output.

### Cell And Row Preparation

- `src/table/tablePreparedCellBuilderV1.ts` is the single child-family policy
  implementation for authored and collection cells.
- Text-block lines remain splittable. Block images, dividers, and spacers emit
  one atomic candidate each with explicit point geometry.
- Image field placements retain resolved asset/owner facts; fixed image frames
  wider than cell content block instead of clipping implicitly.
- Cells retain authored/resolved identity unions, canonical child ranges,
  candidates, zero-based prefix heights, vertical insets, content/outer height,
  geometry facts, and unambiguous JSON-tuple fingerprints.
- Empty cells are valid completed sources. Unsupported TOC/generated/nested
  families block rather than disappear.
- `src/table/tablePreparedRowsV1.ts` restores exact resolved row order and
  blocks missing, duplicate, wrong-kind, out-of-range, or cross-scope rows.
- Row role, break policy, first-fragment minimum height, and maximum prepared
  cell height are retained but not executed.

### Invalidation And Scale

- `src/table/tablePreparedCellImpactV1.ts` emits factual local, table-wide, and
  row-order-tail invalidation lanes without product weight labels.
- Item values retain stable resolved identity while invalidating their affected
  binding/measurement/preparation/pagination path.
- Width, span, inset, and measurement-profile changes invalidate the Table
  measurement path; minimum-height and reorder changes retain measurement
  evidence and invalidate pagination/render placement only.
- A 1,000-row fixture prepares twice to byte-identical JSON with 1,000 cells,
  visited nodes, text candidates, and exact linear work counts.
- Inputs remain source-immutable and execution facts record that pagination and
  rendering did not run.

## FAIL / BLOCKER

None for the bounded prepared Table cell fragment slice.

## RISK

- Measurement execution remains external; paired evidence proves acceptance
  and scope, not production shaper throughput or scheduling behavior.
- Border collapse, border ownership, and per-renderer box styling are not
  inferred. Layout profiles currently supply explicit cell insets only.
- Fixed block-image frames provide deterministic geometry but missing media,
  decoding, responsive scaling, and intrinsic-size fallback remain external.
- Document-field changes may affect many rows; the impact contract requires
  the caller to provide exact affected row/cell facts.
- Flattened per-cell candidates intentionally favor direct checkpoint lookup;
  production memory/cache behavior for very large mixed-child tables remains
  unmeasured.
- Atomic children taller than a fresh page are retained as facts; the future
  paginator must block them without clipping or looping.

## UNKNOWN

- Concrete border-collapse and repeated-header border semantics.
- Product layout-profile defaults for cell insets and image overflow policy.
- Production text measurement cache, worker scheduling, cancellation, and
  convergence behavior after edits.
- Nested Columns/Table/TOC prepared-fragment contracts.
- Future rowSpan row-group preparation and synchronized pagination behavior.
- Renderer/export consumption cost after 200-300 page Table pagination.

## Tests Run

- Targeted geometry, collection/authored measurement, paired evidence,
  materialized/authored cell preparation, row assembly, invalidation, and
  1,000-row scale suites.
- Complete core type-check and Vitest suite with bounded workers.
- Backend and editor complete checks after final public exports.

## Intentionally Not Changed

- canonical package 3/document 4 schemas and Table Definition semantics;
- content materialization, identity allocation, or persistence;
- Text-block/Columns accepted measurement and pagination contracts;
- active document v3 table splitting;
- synchronized row cursors, break-policy execution, repeated headers,
  no-progress guards, renderer, and export;
- backend transport/storage and editor authoring/runtime.

## Next Direction

Implement synchronized Table row pagination over these prepared cells. Add
monotonic cell cursors, one-plan-per-active-cell page attempts, atomic commit,
maximum consumed row-fragment height, allow/prefer-keep/strict-keep execution,
oversized/no-progress diagnostics, and repeated-leading-header progress guards.
