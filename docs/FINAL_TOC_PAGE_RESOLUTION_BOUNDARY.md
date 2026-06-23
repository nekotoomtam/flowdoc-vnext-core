# Final TOC/Page Resolution Boundary

Status: Phase 98 implementation boundary.

This is a final TOC/page resolution boundary.

It is not a pagination or renderer execution engine.

Phase 98 resolves TOC heading page references after measured pagination has
already produced final page indexes and page numbers. It keeps page resolution
as a post-pagination plan and does not mutate authored documents, measured
fragments, renderer commands, or artifact bytes.

## Boundary

The boundary lives in `src/pagination/pageResolution.ts`.

It exposes:

- `VNEXT_FINAL_PAGE_RESOLUTION_SOURCE`;
- `VNEXT_FINAL_PAGE_RESOLUTION_MODE`;
- `resolveVNextFinalPageReferences(...)`.

The plan consumes a canonical document v3 and an existing
`VNextMeasuredPagination`, then returns:

- TOC count, heading count, and resolved heading count;
- resolved TOC entries with heading node id, heading text, heading level,
  page index, and page number;
- page-number inline status, which remains
  `already-resolved-in-measured-pagination`;
- blocking issues for document/pagination id mismatches;
- warning issues for headings that have no measured fragment;
- a resolution contract with mayRelayoutDocument = `false`,
  mutatesDocument = `false`, mutatesMeasuredPagination = `false`, and
  writesArtifacts = `false`.

## Truth

The boundary may resolve page references from existing measured pagination
output. It may report partial resolution if a heading has no measured fragment.

The boundary must not:

- call `paginateVNextDocument(...)`;
- call `runVNextLayoutPipeline(...)`;
- measure text;
- relayout documents;
- change TOC fragment text;
- mutate authored package/document data;
- mutate measured pagination;
- build renderer consumption;
- write storage or artifacts;
- call backend routes;
- import browser, PDF, DOCX, canvas, or headless renderer libraries.

Existing measured pagination still emits `toc-page-resolution-pending` warnings
for placeholder TOC text. This boundary gives later exact-output work a stable
post-pagination page-reference plan before concrete renderer-backed TOC text
replacement or reflow is attempted.

## Acceptance Evidence

- `tests/pageResolution.test.ts` proves resolved TOC heading page references,
  page-number inline status, blocked document/pagination mismatch handling,
  source independence, and documentation trail.
- `tests/measuredPagination.test.ts` remains the executable pagination behavior
  for page-number inline fragments and placeholder TOC measurement.
- `src/index.ts` exports the boundary without changing package/document schema
  or measured pagination behavior.

## Non-Goals

No pagination execution, renderer execution, text measurement execution, TOC
text rewrite, TOC reflow, generated document mutation, measured fragment
mutation, artifact output, backend route, storage adapter, or schema change is
introduced in this phase.
