# Table V4 Content Materialization Readiness Close Audit

Status: Phase 306 resolved Table content materialization close audit.

## Outcome

The bounded resolved Table content materialization slice is ready. Core can
validate pinned Published item and placement contracts, accept externally
allocated row/cell/node/inline identity provenance, clone supported collection
row-template descendants without source mutation, and emit item/document value
bindings separately from the cloned graph.

This close does not claim measured Table pagination or public API readiness.
Public callers should submit collection values without `itemKey`; backend
normalization remains responsible for pinning stable internal item identity
before invoking core contracts.

## PASS

### Contracts And Boundaries

- `src/table/collectionItemContractV1.ts` defines Published scalar and image
  item fields with required and type-compatible fallback policy.
- `src/table/tableContentBindingV1.ts` makes document-field and
  collection-item-field scope explicit for every supported placement.
- `src/table/tableContentMaterializationContractV1.ts` owns strict JSON-safe
  request, global binding, result, issue, work-fact, and execution contracts.
- Internal `itemKey` is retained for stable occurrence identity and provenance;
  it is not a required public collection-value field.

### Source And Identity

- `src/table/tableContentSourcePlanV1.ts` indexes supported collection
  row-template cells, nodes, inlines, and field placements in one root scan.
- Text blocks, images, dividers, and spacers are accepted. TOC/generated
  content blocks all-or-nothing before cloning.
- Identity Standard v1 supplies resolution-orchestrator-owned `nodei_` and
  `inli_` profiles under the exact document-resolution scope.
- `src/table/tableContentIdentityAssignmentsV1.ts` accepts strict external
  row/cell/node/inline assignment envelopes without allocating ids in core.
- `src/table/tableContentProvenanceV1.ts` checks exact identity kind, scope,
  origin references, and revision pins for every derived occurrence.
- One combined batch audit covers accepted row, cell, node, and inline
  provenance before output is returned.

### Materialization And Values

- `src/table/tableContentMaterializationV1.ts` recomputes the source plan,
  rejects incomplete or extra assignments, and clones supported collection
  descendants with rewritten node and inline ids.
- Static and empty-state rows remain authored content references rather than
  unnecessary clones.
- Document and item text/image values remain separate binding tables; authored
  graph text is not destructively replaced.
- Missing optional, explicit null, item-contract fallback, authored-placement
  fallback, item-snapshot, and resolved-document sources are distinguishable.
- `src/table/tableContentValuePolicyV1.ts` isolates field compatibility,
  scalar formatting, image-reference recognition, and authored fallback rules.
- Reordering collection records retains identity by stable internal item key,
  not by array index.

### Determinism And Scale

- A 1,000-row fixture materializes twice to byte-identical JSON without source
  mutation.
- The fixture proves 1,000 cloned nodes, 1,000 cloned inlines, 1,000 item
  bindings, 2,000 content provenance records, and exact factual work counts.
- Materialization records one source-plan and one materialization root scan and
  explicitly records that allocation, media fetch, measurement, pagination,
  rendering, and authored mutation did not run.

## FAIL / BLOCKER

None for the bounded resolved Table content materialization slice.

## RISK

- Backend normalization that turns public ordered values into a pinned internal
  collection snapshot with stable `itemKey` is not implemented in this slice.
- Canonical `colSpan` cell occupancy has not yet been adapted into prepared
  materialized cell fragments.
- Media asset existence and ownership are represented as binding facts but are
  not fetched or registry-verified by the materializer.
- Full immutable Published snapshots remain the logical source of truth;
  semantic change sets or storage chunk deduplication remain storage concerns.
- 1,000-row semantic cloning does not prove memory, cache, text measurement, or
  200-300 page pagination performance.

## UNKNOWN

- Public API envelope and backend limits for collection input normalization.
- Production cache boundaries and invalidation fingerprints for materialized
  row/cell/node/inline graphs.
- Final media registry lookup and missing-asset presentation policy.
- Prepared cell-fragment representation for nested Columns and future rowSpan.
- Renderer/export consumption cost after synchronized row pagination.

## Tests Run

- Targeted Table content materialization and 1,000-row determinism suites.
- Complete core type-check and Vitest suite with bounded workers.
- Backend and editor complete checks after final public exports.

## Intentionally Not Changed

- canonical package 3/document 4 authored schemas;
- public API, backend normalization, persistence, or identity allocation;
- authored source graph, operations, history, or editor runtime;
- TOC/generated content, nested collection fields, or rowSpan execution;
- media fetching, registry validation, measurement, pagination, rendering, and
  export.

## Next Direction

Define prepared Table cell fragments from materialized cell content, including
span-aware occupancy and bounded invalidation facts. Then paginate each logical
row from synchronized cell break candidates, repeat headers by policy, and
prove deterministic multi-page behavior before renderer or authoring work.
