# Deep Table Split Boundary

Status: Phase 97 implementation boundary.

This is a deep table split boundary.

It is not a concrete deep table split engine.

Phase 97 makes table split readiness explicit before attempting a full table
layout engine. The current measured pagination implementation can split
breakable rows whose table-cell children are text blocks. Non-text or mixed
cell content still needs a later deep split engine.

## Boundary

The boundary lives in `src/pagination/deepTableSplit.ts`.

It exposes:

- `VNEXT_DEEP_TABLE_SPLIT_SOURCE`;
- `VNEXT_DEEP_TABLE_SPLIT_MODE`;
- `createVNextDeepTableSplitPlan(...)`.

The plan consumes canonical document v3 table structure and returns:

- table, row, split-candidate, and blocked-row counts;
- row strategies: `text-line-range`, `atomic-row`, `empty-row`, or
  `blocked-deep-content`;
- cell support: `line-range`, `atomic`, `empty`, or `blocked`;
- child policies: `splittable-text`, `atomic-block`, `generated-atomic`,
  `ignored-page-break`, or `unsupported`;
- blocking issues for missing rows/cells, unsupported children, and deferred
  non-text cell child splitting;
- an engine contract with executesPagination = `false`,
  executesConcreteLayout = `false`, mayRelayoutDocument = `false`,
  mutatesDocument = `false`, supportsTextLineSplit = `true`, and
  supportsNonTextChildSplit = `false`.

## Truth

The boundary may classify current table rows and expose whether they can use the
existing text-line split path or must remain blocked for later deep splitting.

The boundary must not:

- call `paginateVNextDocument(...)`;
- call `runVNextLayoutPipeline(...)`;
- execute table layout;
- measure text;
- split non-text cell children;
- mutate package/document data;
- build renderer consumption;
- write storage or artifacts;
- call backend routes;
- import browser, PDF, DOCX, canvas, or headless renderer libraries.

This phase intentionally keeps the previous measured pagination behavior in
place. It gives later implementation work a safe, testable readiness contract
before deep table split execution is attempted.

## Acceptance Evidence

- `tests/deepTableSplit.test.ts` proves text-only line split readiness,
  blocking for breakable mixed/non-text cell children, source independence, and
  documentation trail.
- `tests/measuredPagination.test.ts` remains the executable measured pagination
  behavior for current text-cell row splitting and atomic non-text cell policy.
- `src/index.ts` exports the boundary without changing package/document schema
  or measured pagination behavior.

## Non-Goals

No concrete deep table split engine, non-text cell fragmentation, row group
splitting, spans, border collapsing, repeated nested content, table layout
rewrite, text measurement execution, pagination execution, renderer output,
artifact output, backend route, storage adapter, or schema change is introduced
in this phase.
