# Whole-Document V4 Columns Bounded Composition

Status: Phase 372 implemented bounded Columns-flow pagination and its common
fragment-window adapter. The sequential composer remains inactive.

## Outcome

Phase 372 makes Columns the fifth common Composition window producer after
Text-flow, Utility-flow, Media-flow, and TOC generated-flow. Core can now plan
bounded top-level Columns pages with exact per-page cursors, normalize a
short-remainder move into fresh-page demand, and project accepted nested page
evidence into strict `columns-flow` common windows.

The established Phase 289 complete-call paginator remains behaviorally
unchanged. Both complete-call and bounded pagination use the same lane and
nested page planner, preventing the adapter path from becoming a second Columns
layout engine.

## Public API

Phase 372 exports:

- `planVNextColumnsV4NestedPage(...)` as the shared family page planner;
- `paginateVNextColumnsFlowV4(...)`;
- `createVNextColumnsFlowV4SourceFingerprint(...)`;
- `createVNextColumnsFlowV4CursorFingerprint(...)`;
- `hasValidVNextColumnsFlowV4WindowPaginationFingerprint(...)`;
- `VNextColumnsFlowV4PaginationCursor` and retained page/result types; and
- `createVNextColumnsCompositionWindowV1(...)` plus its context type.

The package root exports bounded pagination and adapter modules through
`src/index.ts`.

## Shared Page Planner

`src/pagination/columnsV4NestedPagination.ts` retains all family semantics:

- independent lane planning from one cursor snapshot;
- longest-lane page height;
- atomic sibling cursor reconciliation;
- legal text-fragment checkpoints;
- completed-lane empty continuation;
- parent-width and remaining-height propagation;
- recursive nested Columns through depth three;
- minimum-height handling; and
- no-progress and oversized-fragment blocking.

Phase 372 exposes the existing one-page planner and calls it from both the
complete-call paginator and the new bounded orchestrator. The common adapter
does not inspect or reproduce lane placements.

## Bounded Cursor

The composition cursor wraps the established recursive lane cursor and adds:

- exact Columns root id;
- compact source fingerprint;
- next family page index;
- next common fragment index;
- terminal-fragment committed state; and
- derived complete state.

The source fingerprint is compacted from geometry, minimum height, ordered lane
and child identity, and child-family fingerprints. It does not duplicate all
prepared text candidates in every cursor.

`terminalFragmentCommitted` distinguishes lanes that are already empty or
complete from a Columns root whose final box has actually entered a committed
page. Completion is true only when every lane is complete and that terminal
fragment is committed.

## Page Checkpoints

Every bounded page retains:

- cursor-before and cursor-after;
- the exact accepted Phase 289 nested page fragment; and
- a compact checkpoint fingerprint over both cursors and page facts.

Each commit advances page and fragment indexes exactly once. Page index equals
cursor-before `nextPageIndex`; fragment index is independent of document start
page and therefore remains stable across a nonzero document page offset.

Window status is `complete` when the terminal page commits and `partial` when
the selected page bound is reached first. Accepted pages remain available on a
partial result rather than being discarded as a page-limit blocker.

## Fresh-Page Normalization

When a fitting `prefer-together` child cannot fit the short first remainder,
the shared planner returns zero state progress and family fresh-page evidence.
The bounded paginator emits `fresh-page-required` with:

- unchanged cursor;
- no retained page checkpoint;
- one recorded family page attempt and zero-progress advance; and
- no committed common page, fragment, or cursor work.

Retrying the same cursor at full page-body height places the child normally.
Fresh demand from an already full page remains a no-progress blocker.

## Terminal Minimum Height

Columns with complete empty lanes can still own a positive authored minimum
height. The composition cursor begins incomplete until that terminal box is
committed. A positive minimum-height page therefore advances only terminal
state and completes once.

An empty Columns root with zero minimum height produces zero family extent.
The common adapter returns `columns-composition-zero-extent-unsupported`
instead of inventing a positive placement or silently deleting the root.

## Common Adapter

`createVNextColumnsCompositionWindowV1(...)` validates:

- bounded result and page-checkpoint fingerprints;
- exact root/source ownership and cursor completion truth;
- contiguous cursor chains and page/fragment index progress;
- top-level Columns page ownership and depth;
- first-remainder/full-page capacity sequence;
- used/remaining geometry;
- positive common extent; and
- page, terminal-cursor, and result completion agreement.

Each accepted family page becomes one common page with one `columns-flow`
placement. Nested lanes, child placements, x offsets, signatures, and recursive
cursors remain in family evidence and are referenced through the compact page
checkpoint fingerprint.

## Parity And Scale

Direct evidence proves:

- bounded one-page resume produces byte-equal Phase 289 pages and the same
  final recursive lane cursor;
- multi-page bounded windows retain exact common checkpoint chains;
- depth-three nested placements preserve parent remainder and width;
- fresh retry and minimum-height terminal commit are deterministic;
- source input remains immutable; and
- 6,000 prepared text fragments traverse depth three into 250 one-page common
  windows with 750 lane plans, 500 nested plans, 250 checkpoint lookups, and
  6,000 consumed fragments.

All 250 scale pages equal the existing complete-call pages. This is retained
core evidence, not mixed-document, renderer, backend, or editor throughput.

## Failure Contract

Required blockers include:

- invalid capacity, page bound, or start page;
- stale root/source cursor owner;
- malformed completion or page/fragment indexes;
- depth, width, lane order, child identity, or fragment-bound drift;
- oversized family fragments and full-page no-progress;
- pagination or page-checkpoint fingerprint mismatch;
- broken checkpoint chain or page completion drift; and
- zero common extent.

A family blocker retains cursor-before and issues but no cursor-after or pages.
An adapter validation failure returns no common window. Inputs remain immutable.

## Responsibility Boundary

Core owns Columns family page planning, bounded cursor/checkpoint contracts,
fresh normalization, common projection, compact ownership, exact work, and
diagnostics.

Backend later owns window scheduling, durable retention, retries, expiry,
authorization, and storage. Editor later owns progress/blocker presentation,
viewport/selection behavior, and Columns authoring UX. Renderer/export later
consumes authoritative document page plans plus nested Columns evidence without
relayout.

## PASS

- Columns emits strict bounded `columns-flow` common windows.
- Per-page cursors are retained rather than inferred from complete output.
- Phase 289 and bounded paths share one family page planner.
- Partial results preserve accepted pages; fresh demand preserves the cursor.
- Positive minimum height commits exactly once; zero extent blocks explicitly.
- Depth-three 6,000-fragment/250-page parity and deterministic work pass.

## FAIL / BLOCKER

- Zero-extent empty Columns composition policy is not selected.
- Mixed Columns child families beyond prepared fragments/nested Columns remain
  blocked upstream.
- Table does not yet emit bounded common windows.
- No sequential composer consumes Columns-flow windows.

## RISK

- Recursive cursor size grows with active nested continuations.
- Source ownership trusts accepted child-family fingerprints; those producers
  must preserve their own tamper and stale-evidence gates.
- Tiny page windows increase orchestration calls and durable cursor count.
- Longest-lane semantics intentionally retain blank sibling space.
- Future richer keep policies can add new fresh/no-progress cases.

## UNKNOWN

- Product policy for zero-extent empty Columns roots.
- Production mixed-document memory/time at 200-300 pages.
- Durable cursor expiry and packed-package performance.
- Mixed image, utility, Table, or generated child-family behavior inside
  Columns.
- Incremental page-tail convergence thresholds.

## Intentionally Not Changed

- canonical document/Columns schemas and depth-three limit;
- Phase 289 complete-call output and lane/nested semantics;
- Columns authoring operations or product controls;
- Table pagination and adapter contracts;
- common fragment-window schema;
- sequential composition and heading-page production;
- backend/editor/renderer runtime behavior; and
- rowSpan, floating media, text wrap, or generated-index schemas.

## Next Recommended Direction

Implement the Table composition-oriented bounded paginator and common adapter.
Retain full Table plus active split-row/cell cursor checkpoints per page,
preserve repeated-header/body progress atomically, normalize short-remainder
fresh demand, prove complete-call parity and 250-page scale, and keep the
existing renderer on completed authoritative Table evidence.
