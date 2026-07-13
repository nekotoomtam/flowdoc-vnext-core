# Whole-Document V4 TOC Common Adapter

Status: Phase 371 implemented the constrained TOC one-page common adapter. The
sequential composer remains inactive.

## Outcome

Phase 371 makes TOC the fourth common Composition window producer after
Text-flow, Utility-flow, and Media-flow. Core now validates one exact retained
TOC family page and projects it into a strict `generated-flow` window without
flattening title or generated-row geometry into the common contract.

The adapter supports content placement and short-remainder fresh-page demand.
It blocks forced overflow, empty untitled zero-page output, multi-page evidence,
stale ownership, tampering, cursor drift, and incompatible geometry before
common finalization.

## Public API

`src/composition/tocFragmentWindowV1.ts` exports:

- `VNextTocCompositionWindowContextV1`;
- `createVNextTocV4CursorFingerprint(...)`;
- `hasValidVNextTocV4PaginationFingerprint(...)`; and
- `createVNextTocCompositionWindowV1(...)`.

The package root exports the module through `src/index.ts`.

## Compact Measurement Ownership

The first 1,000-entry one-page scale run exposed a retained-output amplification
problem: TOC measurement fingerprints embedded complete JSON geometry, and
every resumed cursor/pagination result repeated that string. The one-page scale
test exceeded 124 seconds before completion.

`src/toc/tocV4Measurement.ts` now emits compact
`sha256:<64 lowercase hex>` values for geometry, fit, and complete measurement
fingerprints. The hashed facts are unchanged: generated title/rows, styles,
page-number proof, semantic owners, fit capacity, and overflow identities still
determine the fingerprints. Refit preserves the compact geometry owner and
creates new compact fit/measurement owners.

This changes fingerprint representation, not TOC measurement, fit,
pagination, or row-placement semantics. Existing equality/invalidation checks
continue to compare exact retained fingerprints.

## One-Page Acceptance

Accepted TOC adaptation requires:

- exact TOC pagination source and contract version;
- a valid retained pagination fingerprint;
- exact root and measurement ownership across result and both cursors;
- exactly one family page;
- page index equal to cursor-before `nextPageIndex`;
- cursor-after advancing exactly one family page index;
- contiguous row indexes matching cursor row progress;
- title/page/result completion matching cursor state; and
- page available height equal to the requested first remainder.

A multi-page result is not sliced. An empty accepted result is not assigned a
fake cursor or zero-height placement.

## Content Projection

One non-fresh family page becomes one common page and one positive
`generated-flow` placement. The common placement retains:

- TOC page fragment id and family page index;
- root TOC node id;
- zero common block offset and exact family used-height extent;
- previous/next continuation facts from the accepted cursors; and
- compact page-evidence ownership.

Title, generated rows, heading ids, leader geometry, page-number capacity, and
warnings remain in typed TOC family evidence. The common adapter does not copy
or reinterpret them.

## Fresh-Page Normalization

The existing TOC paginator represents a short-remainder move as a zero-content
family page and advances only `nextPageIndex`. Composition cannot commit that as
a blank TOC fragment because no TOC content progressed.

The adapter validates the exact zero-content fresh shape, then emits common
`fresh-page-required` with:

- no page or placement;
- no cursor commit or work;
- cursor-after exactly equal to cursor-before; and
- the requested first remainder strictly below full page-body height.

The orchestrator later advances the document page and retries the same TOC
family cursor with full capacity. Content-window resume remains byte-equal to
one-shot family pagination. Fresh demand is deliberately normalized and is not
counted as a committed family page in common Composition.

## Overflow And Empty Policy

TOC family pagination can force an oversized title/row once and retain a
negative remainder. The common fragment-window contract requires in-page
positive geometry and non-negative remainder, so the adapter returns
`toc-composition-forced-overflow-unsupported` instead of clipping, scaling, or
publishing invalid geometry.

An empty untitled TOC completes family pagination with zero pages. Phase 371
returns `toc-composition-empty-window-unsupported`; it does not silently delete
the authored root or invent a zero-height accepted window. Product skip/remove
policy remains a later explicit decision.

## Fingerprint And Cursor Validation

The adapter recomputes the retained TOC pagination fingerprint before common
projection. Common owner pins compact document structure, resolved projection,
family source, measurement, and pagination evidence. Cursor references retain
only compact measurement owner and compact cursor-state fingerprints.

Changed page height, rows, cursor, owner, or completion with the old
fingerprint blocks. Recomputed malformed evidence still fails semantic page,
row, title, geometry, or completion validation.

## Resume And Scale

Direct evidence proves:

- one-page content windows combine to the exact one-shot TOC pages and final
  family cursor;
- fresh demand retries from the unchanged family cursor on a full page;
- common finalize/parse is byte-stable;
- source measurement remains immutable; and
- 1,000 generated entries adapt through 167 deterministic one-page common
  windows, with one page, one placement, and one cursor commit per window.

The scale evidence is core-contract evidence. It does not include mixed
document composition, renderer output, persistence, or network scheduling.

## Generated Index Extension Mark

Phase 370's future requirement remains open: captioned Figures/Tables and List
of Figures/List of Tables should later share a broader generated-index
architecture. Phase 371 implements only the canonical `toc` root and does not
add captions, numbering, generic index schemas, or new root types.

The common adapter stays rooted in `generated-flow` so later explicit generated
index roots can be added without moving heading-specific row semantics into the
composer.

## Responsibility Boundary

Core owns TOC measurement/pagination ownership, one-page adapter validation,
fresh normalization, common projection, compact identity, and diagnostics.

Backend later owns scheduling, cursor/window retention, retries, expiry,
authorization, and storage. Editor later owns progress and blocker
presentation, viewport/selection behavior, and authoring UX. Renderer/export
later consumes authoritative document page plans plus TOC evidence without
relayout.

## PASS

- TOC emits strict `generated-flow` content windows.
- Fresh-page demand preserves the exact family cursor and commits no blank TOC
  fragment.
- Forced overflow, empty output, multiple pages, stale ownership, tampering,
  and semantic drift block explicitly.
- Measurement, fit, cursor, page, pagination, and common owner fingerprints are
  compact at the Composition boundary.
- One-page resume equals one-shot content pagination.
- 1,000 generated entries produce deterministic bounded windows.

## FAIL / BLOCKER

- Forced TOC overflow cannot enter the common non-overflow page contract.
- Empty untitled TOC composition policy is not selected.
- Columns and Table do not yet emit common windows.
- No sequential composer or authoritative production heading-page map consumes
  the generated-flow windows.

## RISK

- One-page windows increase orchestration calls even after retained fingerprint
  amplification is removed.
- Compact fingerprint migration changes retained identity strings; any future
  durable cache must version and invalidate old non-compact TOC evidence.
- Fresh normalization intentionally differs from the old family paginator's
  zero-content page accounting.
- Product diagnostics must distinguish impossible TOC geometry from missing or
  stale evidence.

## UNKNOWN

- Product policy for empty untitled TOC roots.
- Whether a future overflow-capable page contract is desirable.
- Production mixed-document memory/time at 200-300 pages.
- Durable cursor expiry and packed-package performance.
- Future generated-index schema and caption authoring UX.

## Intentionally Not Changed

- canonical document/TOC schemas and semantic row collection;
- measured TOC title/row geometry or pagination placement policy;
- final page-reference resolution and page-number capacity policy;
- common fragment-window schema;
- Columns/Table pagination or adapters;
- sequential composition and heading-page production;
- backend/editor/renderer runtime behavior; and
- captions, Figure/Table numbering, List of Figures, or List of Tables.

## Next Recommended Direction

Implement the Columns composition-oriented bounded paginator and common adapter.
Reuse existing nested lane reconciliation, retain exact per-page cursors,
normalize short-remainder fresh demand, prove complete-call parity and
depth-three behavior, reject stale/tampered evidence, and repeat the established
250-page scale without changing Phase 289 output. Phase 372 now implements this
slice; continue with Table bounded composition:
`docs/WHOLE_DOCUMENT_V4_COLUMNS_BOUNDED_COMPOSITION.md`.
