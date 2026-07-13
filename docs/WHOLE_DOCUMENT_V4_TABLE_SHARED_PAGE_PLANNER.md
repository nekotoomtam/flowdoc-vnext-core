# Whole-Document V4 Table Shared Page Planner

Status: Phase 373 implemented the shared one-page Table planner. Bounded
composition cursors and the common adapter remain inactive.

## Outcome

Phase 373 separates one-page Table assembly from complete-call orchestration
without changing retained Table pagination output. The existing paginator and
future bounded orchestration can now share one owner for synchronized rows,
active split-row/cell cursors, repeated headers, fresh-page demand, and exact
work facts.

This phase is intentionally a prerequisite slice. It does not claim that Table
can emit a common Composition fragment window yet.

## Public API

Core exports `planVNextTablePageV1(...)`, `VNextTablePagePlanV1`, and
`VNextTablePagePlannerWorkV1` through the package root.

The planner accepts one ready prepared Table, exact Table cursor, page
capacity/index, header policy, and cumulative row-plan budget. Continuation is
derived from retained page/cursor facts rather than trusted from a caller. It
returns either one planned page with its exact cursor/work delta or a blocked
issue set.

## Shared Page Ownership

`src/table/tablePagePlannerV1.ts` now exclusively owns:

- contiguous leading authored-header discovery;
- strict repeated-header planning on continuation pages;
- synchronized body-row and cell planning;
- atomic active split-row cursor commit;
- completed-row, split-row, repeated-header, and fresh-advance facts;
- body-progress guards after repeated headers;
- page geometry and row-fragment identity; and
- cumulative row-plan budget enforcement.

`src/table/tablePaginationV1.ts` retains whole-call validation, page-loop
limits, first-page/full-page capacity selection, summary/work aggregation,
final fingerprinting, and the established all-or-blocked result contract.

## Cursor And Atomicity

The page planner consumes the established Table cursor rather than deriving
progress from emitted fragments. `activeRow` retains the synchronized row
cursor and all child cell cursors. A split row commits its reconciled cursor as
one unit; completed siblings are not independently advanced outside that row
commit.

Repeated headers are layout progress but never advance source `rowIndex`.
Their fragments and the first legal body-row progress are accepted together.
A header-only continuation remains blocked.

## Cumulative Work Bound

`rowPlanCountBefore` carries work already spent by previous page calls.
`maximumRowPlanCount` therefore remains a whole-pagination bound when the
planner is called repeatedly. Resuming one page at a time cannot reset the
budget and obtain unbounded row planning.

Per-page deltas retain row plans, cell plans, checkpoint lookups, consumed
candidates, and repeated-header row plans. The complete paginator sums those
deltas without reopening row or cell evidence.

## Parity And Scale

Direct planner evidence rebuilds complete output one page at a time and compares
exact pages, final cursor, summary, and work facts. Coverage includes:

- packed completed rows followed by fresh demand and a split row;
- a short first-page `prefer-keep` move;
- repeated leading headers; and
- 1,000 body rows producing the established 250 pages.

Existing Phase 319-322 pagination and renderer tests remain unchanged. The
1,000-row complete-call contract still records 1,250 row plans, 249 repeated
header plans, and no prepared-input mutation or measurement execution.

## Fingerprint Finding

Prepared Table ownership is still supplied by `prepared.fingerprint`. Current
fixtures construct this as content-sized JSON, and the complete pagination
fingerprint embeds it. Unlike the Phase 371 TOC correction, Phase 373 does not
change fingerprint representation while extracting page semantics.

The bounded cursor phase must introduce a compact source pin before that value
is repeated across durable cursors or page checkpoints. Consumers must not
invent their own hash or truncate the retained prepared fingerprint.

## Failure Contract

The page planner blocks malformed capacity, page index, prior work, cursor
shape/owner/bounds, complete-cursor replay, missing repeated-header source,
repeated-header overflow, header-only continuation, full-page no progress,
row/cell planner failures, and cumulative row-plan exhaustion.

A blocked page returns no page and no cursor-after. The complete paginator
preserves its established atomic behavior and discards prior local pages when a
later page blocks.

## Responsibility Boundary

Core owns Table row/cell semantics, page planning, cursors, work bounds, and
diagnostics. Backend later owns scheduling, retained cursor storage, retries,
expiry, authorization, and persistence. Editor later owns progress/blocker
presentation and Table authoring UX. Renderer/export continues consuming only
complete authoritative Table pagination evidence.

## Remaining Table Phases

1. Phase 374: compact source ownership plus bounded resumable Table cursor and
   retained per-page checkpoints.
2. Phase 375: common `table-flow` fragment-window adapter.
3. Phase 376: stale/tamper, split-row, repeated-header, terminal, and empty
   policy hardening.
4. Phase 377: 1,000-row/250-page bounded parity and cumulative-work scale gate.
5. Phase 378: architecture close audit and cross-repo integration readiness.

The phases may split further if an ownership or product-policy fork appears.

## PASS

- Complete and future bounded paths have one Table page-semantics owner.
- Existing complete-call pages, cursor, summary, work, and renderer input stay
  behaviorally unchanged.
- Split-row/cell progress and repeated-header/body progress stay atomic.
- Row-plan work remains bounded across one-page resumes.
- Direct 1,000-row/250-page parity passes.

## FAIL / BLOCKER

- No bounded Table composition cursor or retained page checkpoint exists yet.
- Table cannot emit a common Composition window yet.
- Prepared Table source ownership is not yet compact.
- The sequential whole-document composer remains inactive.

## RISK

- Active split-row cursors grow with cell count and descendant continuation
  state.
- Repeated headers increase per-page work but do not advance source rows.
- Content-sized prepared fingerprints would amplify durable bounded evidence.
- Empty or zero-extent Table composition policy is not selected.

## UNKNOWN

- Production cursor packing cost for wide rows with many active cell cursors.
- Durable cursor expiry and retry policy in backend.
- Mixed-document memory/time at the common 200-300 page product scale.
- Final empty Table and zero-extent authoring policy.

## Intentionally Not Changed

- canonical Table/document schemas and rowSpan rejection;
- prepared row/cell, row-break, colSpan, and repeated-header semantics;
- complete pagination result/fingerprint contracts;
- Table renderer projection;
- common fragment-window schema;
- backend/editor behavior;
- concrete storage, rendering, export, or sequential composition; and
- List of Tables generation.

## Next Recommended Direction

Implement Phase 374 as a separate compact, bounded Table cursor/paginator
slice. Retain exact per-page cursor checkpoints, cumulative work, partial and
fresh-page outcomes, and terminal commit truth before adding the common
adapter.
