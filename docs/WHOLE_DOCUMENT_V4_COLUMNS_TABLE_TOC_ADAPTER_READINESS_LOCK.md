# Whole-Document V4 Columns Table And TOC Adapter Readiness Lock

Status: Phase 370 architecture lock; Phases 371 and 372 implement the selected
TOC and Columns slices. Table remains pending.

## Outcome

Phase 370 compares the retained Columns, Table, and TOC pagination contracts
against the common Composition fragment-window contract. It selects the
smallest honest path for each family instead of projecting complete-call
cursors onto pages that never retained those checkpoints.

The implementation order is:

1. TOC one-page common adapter;
2. Columns composition-oriented bounded pagination and adapter; and
3. Table composition-oriented bounded pagination and adapter.

TOC can already produce a resumable one-page result. Columns and Table cannot:
their current page limits block atomically and discard all pages. They need a
bounded partial boundary before a common adapter can claim per-page cursor
continuity.

## Evidence Basis

- `paginateVNextNestedColumnsV4(...)` in
  `src/pagination/columnsV4NestedPagination.ts` accepts an exact first-page
  remainder and a family cursor. Its loop owns a cursor after every internal
  page plan, but `VNextColumnsV4NestedPageFragment` does not retain that cursor.
  Reaching `maximumPageCount` returns `blocked`, `pages: null`, and
  `cursorAfter: null`.
- `paginateVNextTableRowsV1(...)` in `src/table/tablePaginationV1.ts` accepts
  an exact first-page remainder and synchronized Table cursor. It commits row
  state while building each page, but `VNextTablePageV1` retains no page
  cursor. Reaching a page or row-plan limit blocks the complete call and
  discards all pages.
- `paginateVNextTocV4(...)` in `src/toc/tocV4Pagination.ts` accepts an exact
  first-page remainder, measurement-pinned cursor, and bounded page count. A
  one-page call returns `partial` or `complete` with exact call-level cursors,
  so those cursors are also the exact checkpoint for its single page.
- `tests/v4IntegratedDocumentStressFailureRecovery.test.ts` proves TOC
  one-page resume and proves only all-or-blocked recovery for stale Columns and
  Table cursors.
- `src/composition/fragmentWindowV1.ts` requires every accepted common page to
  retain an exact progressing cursor pair, non-negative geometry, and positive
  placement extent. Fresh-page demand is a separate zero-page state.

## Capability Matrix

| Capability | Columns | Table | TOC |
|---|---|---|---|
| exact first remainder | PASS | PASS | PASS |
| resumable family cursor | PASS at complete-call boundary | PASS at complete-call boundary | PASS at bounded-window boundary |
| bounded partial result | FAIL: limit blocks | FAIL: limit blocks | PASS |
| per-page retained cursor | FAIL | FAIL | DERIVABLE only from a one-page call |
| stable page/fragment identity | PASS: signature and fragment id | PASS: row fragment ids | PASS: TOC fragment id and row identity |
| family geometry retained | PASS | PASS | PASS with forced-overflow exception |
| compact composition owner pin | REQUIRED | REQUIRED | REQUIRED |
| common adapter readiness | BLOCKED pending bounded paginator | BLOCKED pending bounded paginator | READY with constraints below |

`DERIVABLE` does not permit slicing a multi-page result. The TOC adapter must
accept exactly one returned page or an explicit fresh-page demand. It may not
invent intermediate cursors for a larger result.

## TOC Adapter Slice

The first implementation slice may consume only a TOC pagination call with
`maximumPageCount: 1`. It must pin the exact measurement fingerprint and a
compact fingerprint of the accepted pagination evidence.

For a content page, the adapter projects one `generated-flow` placement whose
extent equals the retained TOC page used height. The family payload continues
to own title, row, warning, and generated-entry geometry; the common placement
does not flatten those rows.

The adapter must preserve these special states:

- a page with `freshPageAdvance: true` becomes common
  `fresh-page-required`; it is not committed as a blank TOC page and its
  advanced TOC cursor is not accepted as semantic content progress;
- any forced title or row overflow blocks common adaptation because current
  common geometry cannot retain negative remainder or out-of-page extent;
- an empty, untitled, zero-page completed TOC remains blocked until a later
  phase selects an explicit zero-geometry skip contract; and
- stale measurement ownership, more than one page, page-index drift, cursor
  mismatch, or content-sized/non-compact owner evidence blocks atomically.

One-page content calls resumed from the exact accepted cursor must combine to
the same TOC family pages and final cursor as one-shot TOC pagination. Fresh
demand is normalized to no common page and retries the unchanged cursor on a
full page, so the old zero-content family page is intentionally not committed.

## Columns Bounded Slice

Columns needs a separate composition-oriented bounded paginator, following the
Phase 368 Text-flow pattern while preserving Phase 289 behavior. It must reuse
the existing family-owned lane and nested reconciliation semantics rather than
reimplementing them in the adapter.

The bounded result must retain:

- exact input, geometry, nesting-depth, profile, and cursor owner pins;
- status `complete`, `partial`, `fresh-page-required`, or `blocked`;
- cursor-before and cursor-after for every committed page;
- longest-lane used height and all existing nested placement/signature facts;
- exact first remainder and fresh-body capacity;
- bounded page, lane, nested-plan, checkpoint, and consumed-fragment work; and
- compact fingerprints that include the source, starting cursor, capacity,
  committed pages, and final cursor.

A zero-progress short-remainder plan becomes `fresh-page-required` with no
committed page and an unchanged cursor. A limit reached after committed pages
returns `partial`; it must not turn accepted page evidence into a blocker.
Existing `paginateVNextNestedColumnsV4(...)` and its public result remain
unchanged until parity tests prove the new boundary.

## Table Bounded Slice

Table follows Columns only after the smaller parallel-flow boundary is proven.
Its composition-oriented paginator must retain a page checkpoint containing
the complete Table cursor, including an active split-row cursor when present.

Each committed page must preserve:

- prepared-Table and pagination-profile compact pins;
- row order, split-row fragment identity, synchronized cell cursors, maximum
  row-fragment height, and exact page geometry;
- repeated-header policy and repeated-header work without treating repeated
  headers as source cursor progress;
- cursor-before and cursor-after at the page boundary;
- bounded page/row/cell/checkpoint/candidate work; and
- complete, partial, fresh-page-required, and blocked outcomes.

Repeated headers plus body progress commit atomically. A header-only page is
still blocked. A short remainder that cannot accept the next family fragment
returns fresh-page demand without committing a page or consuming a row. A page
or work limit after one or more valid pages returns `partial`; malformed
prepared evidence, stale cursor ownership, oversized atomic candidates, and
no-progress remain atomic blockers.

The existing renderer consumes the established full Table pagination result.
This phase does not redirect renderer consumption to bounded windows or claim
that partial windows are renderer-ready artifacts.

## Common Projection Rules

All three adapters remain narrow projections:

- family paginators own splitting, keep policy, sibling reconciliation,
  repeated headers, generated rows, and source continuation;
- adapters validate one exact family result and emit common identity,
  capacity, cursor, page, placement, work, and issue facts;
- adapters never infer a cursor from page contents, rerun measurement, slice a
  multi-page result without checkpoints, or repair stale family evidence; and
- family payload references remain typed evidence references rather than
  content-sized copies in every common placement.

No adapter may claim a complete common window unless the exact family cursor
is complete. No partial window may expose an incomplete page-level commit.

## Generated Index Extension Mark

The current `generated-flow` root remains `toc` only. Future document profiles
need captioned figures and tables plus generated List of Figures and List of
Tables. That direction should share a broader generated-index architecture:
stable figure/table identity, semantic caption content, derived numbering,
final composed page references, and no-relayout index resolution.

This is a marked future requirement, not Phase 370 schema or runtime scope.
The TOC adapter must not hard-code common Composition around heading sources in
a way that prevents later generated-index root types, but no generic index,
caption, figure numbering, or list generation is implemented now.

## Failure Contract

Required blockers include:

- family/root, source, measurement, prepared-input, profile, or cursor owner
  mismatch;
- missing or invented page cursor checkpoints;
- accepting a multi-page TOC result as a one-page checkpoint;
- negative remainder or forced TOC overflow;
- duplicate/drifted page or fragment identity;
- Columns lane/nested reconciliation drift;
- Table row/cell/repeated-header cursor drift;
- family or adapter no-progress; and
- page, fragment, row-plan, or work limit overflow that occurs before any
  committable partial boundary.

Blocked results retain cursor-before and issues but no cursor-after, pages, or
common placements. Accepted source evidence remains immutable.

## Responsibility Boundary

Core owns family paginator contracts, strict common adapters, compact identity,
cursor continuity, geometry validation, deterministic work, and diagnostics.

Backend later owns window scheduling, durable cursor/evidence retention,
retries, expiry, authorization, and storage. Editor later owns progress,
blocker presentation, viewport/selection behavior, and authoring UX. Renderers
consume only completed authoritative document page plans and family evidence;
they do not compose or relayout these windows.

## Implementation Phases

1. **Phase 370 readiness lock:** capability matrix, honest checkpoint gaps,
   family order, constrained TOC path, and generated-index extension mark.
2. **TOC one-page adapter:** accepted content, fresh demand, forced-overflow
   blocker, exact resume equivalence, compact ownership, and scale.
3. **Columns bounded paginator and adapter:** per-page cursor, partial/fresh
   outcomes, parity, nesting, tamper, and 250-page scale.
4. **Table bounded paginator and adapter:** split-row/repeated-header page
   checkpoints, partial/fresh outcomes, parity, tamper, and 250-page scale.
5. **Cross-family adapter close audit:** common parser, recovery, amplification,
   and full repository gates before sequential composition.

## PASS

- The three families are compared against one explicit common contract.
- TOC has a truthful one-page adapter path without changing semantic
  pagination.
- Columns and Table checkpoint gaps are explicit and are not hidden by result
  slicing.
- Bounded pagination work is split by real family responsibility and risk.
- Fresh-page and forced-overflow mismatches have explicit outcomes.
- Future figure/table generated indexes are marked without expanding current
  runtime scope.

## FAIL / BLOCKER

- Table still lacks bounded partial results and retained page cursor
  checkpoints.
- No common adapter exists for Table.
- No sequential whole-document composer consumes any family windows.

## RISK

- Refactoring internal Columns/Table page planners could drift from the
  established complete-call contracts unless parity tests compare every page.
- Table repeated-header work can be mistaken for semantic source progress.
- TOC forced-overflow behavior is accepted by its family contract but cannot
  be represented by the stricter common geometry contract.
- Full JSON pagination fingerprints in older family results are too large for
  repeated common ownership and require compact adapter-owned pins.
- Tiny one-page windows increase orchestration calls and cursor retention.

## UNKNOWN

- Product policy for empty untitled TOC roots in composed body flow.
- Whether forced TOC overflow should remain a hard composition blocker or gain
  a future overflow-capable page contract.
- Production memory/time ceilings for mixed 200-300 page compositions.
- Future generated-index schema and caption authoring UX.
- Durable cursor expiry and packed-package performance.

## Intentionally Not Changed

- canonical package/document schemas and authored node grammar;
- Columns/Table pagination implementations and TOC pagination placement
  semantics;
- common fragment-window schema;
- existing Table renderer projection;
- document v3 measured pagination and renderer paths;
- backend/editor/renderer runtime behavior; and
- captions, figure/table numbering, List of Figures, or List of Tables.

## Next Recommended Direction

Implement the constrained TOC one-page common adapter first was Phase 370's
recorded handoff; Phase 371 now implements it. Continue with the Columns
composition-oriented bounded paginator and common adapter. Preserve nested lane
reconciliation, retain exact per-page cursors, normalize fresh demand, and prove
parity plus depth-three 250-page scale before changing Table pagination:
Phase 372 now implements that Columns slice. Continue with Table bounded
composition:
`docs/WHOLE_DOCUMENT_V4_COLUMNS_BOUNDED_COMPOSITION.md`.
