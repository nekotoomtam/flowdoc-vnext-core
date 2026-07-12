# Table V4 Semantic Readiness Close Audit

Status: Phase 298 semantic core-contract close audit.

## Outcome

The Table v4 semantic row-stream slice is ready. Core can validate one
Structure-owned Table Definition, consume an exact-instance pinned collection
snapshot, and resolve deterministic static, empty-state, and collection rows
with stable identity provenance before measurement or pagination.

This close does not claim complete Table node readiness. Descendant content
materialization, item-field capability, prepared cell fragments, synchronized
row pagination, rendering, authoring, backend allocation, and persistence
remain separate work.

## PASS

### Architecture And Boundaries

- `docs/TABLE_V4_SEMANTIC_ARCHITECTURE_LOCK.md` separates semantic and
  authoring lanes, authored graph truth, resolution, measurement, pagination,
  and renderer consumption.
- Document v3 deep split and measured pagination remain evidence only.
- Canonical document v4 schemas and Resolved Document v1 collection rejection
  remain unchanged.

### Table Definition

- `src/table/tableDefinitionV1.ts` binds definitions to an exact Structure
  draft or Published Structure Version.
- Stable columns use positive shares totaling 100.
- Ordered static/collection row sources retain explicit roles, empty policies,
  header policy, break policy, and source row templates.
- Cell occupancy is gap-free and non-overlapping across the full logical grid.
  `colSpan` works now; `rowSpan` remains vocabulary-reserved and v1-blocked
  above one.
- Authored `allowBreak` evidence maps explicitly to `allow`, `strict-keep`, or
  `prefer-keep` without changing the canonical parser.

### Collection Snapshot

- `src/table/tableCollectionSnapshotV1.ts` pins collection records to one exact
  Document Instance revision and one explicit snapshot revision.
- Item order is retained, item keys are nonblank and unique, empty collections
  are explicit, and scalar/image values remain JSON-safe.
- Array index is never used as row identity and core performs no fetch.

### Resolved Row Stream

- `src/table/resolvedTableRowsV1.ts` accepts static-only tables without a
  collection snapshot and mixed tables with exact collection pins.
- Collection field definitions must exist, have `collection` capability, and
  belong to the instance's exact Published Structure Version.
- `header-only`, `empty-row`, and `hide-table` produce explicit deterministic
  results without mutating authored rows.
- Static and empty-state rows retain authored row/cell references. Collection
  occurrences require externally allocated `rowi_` and `celli_` provenance.
- Exact table, row-source, row-template, source-row, item, source-cell,
  Structure version, instance revision, snapshot revision, and resolution scope
  facts are audited all-or-blocked.
- Missing, extra, duplicate, cross-scope, key-drift, and conflicting identity
  assignments return no partial row stream.
- Output records that fetching, authored mutation, descendant content
  materialization, measurement, pagination, and rendering did not run.

## FAIL / BLOCKER

None for the bounded Table v4 semantic row-stream slice.

## RISK

- Collection item values are JSON-safe but do not yet have a published nested
  item-field schema, so cell content cannot validate per-item field capability.
- The resolved row stream retains source cell references; it does not yet clone
  repeated text-block/image descendants or allocate their derived identities.
- Snapshot order is consumed as canonical input order; sort, filter, group,
  subtotal, and group-header rules are not implemented.
- Consumers that skip the resolver or identity batch audit can still construct
  inconsistent ad hoc row records outside core.
- Large-row-count semantic scale is not equivalent to 200-300 page measured
  table scale.

## UNKNOWN

- Published collection item schema and field-key namespace.
- Resolved descendant node/inline identity profiles and allocation ownership.
- Group/subtotal/footer semantics and multi-collection suppression precedence.
- Concrete row/cell measurement and invalidation fingerprints.
- Future `rowSpan` row-group synchronization behavior.

## Tests Run

- Targeted Table architecture, definition, collection snapshot, and resolved
  row suites.
- Complete core type-check and Vitest suite with bounded workers to avoid
  unrelated five-second integration timing contention.
- Backend and editor complete checks after final public exports.

## Intentionally Not Changed

- canonical package 3/document 4 schemas or authored table graph;
- existing table operations/history and v3 pagination;
- Resolved Document v1 collection behavior;
- text-block measurement and Columns pagination;
- descendant graph materialization or item-value binding;
- row/cell pagination, repeated-header fragments, renderer, and export;
- backend allocation, transport, storage, and editor UI/runtime.

## Next Direction

Define the resolved table content materialization identity boundary. Add
derived node/inline identity profiles, clone row-template cell descendants with
source provenance, and bind item-local field references before adapting
prepared text fragments into synchronized row/cell pagination.
