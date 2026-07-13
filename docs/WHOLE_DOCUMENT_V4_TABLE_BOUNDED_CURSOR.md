# Whole-Document V4 Table Bounded Cursor

Status: Phase 374 implemented bounded resumable Table pagination. The common
Composition adapter remains inactive.

## Outcome

Table can now retain accepted pages instead of discarding them when a selected
window bound is reached. One-page and multi-page windows share the Phase 373
page planner and return `complete`, `partial`, `fresh-page-required`, or
`blocked` with exact family cursor and work evidence.

## Public API

Core exports `paginateVNextTableFlowV4(...)`, compact source/profile/cursor
fingerprint helpers, cursor/page/result fingerprint validators, and retained
Table-flow cursor/checkpoint/result types from
`src/table/tableFlowV4WindowPagination.ts`.

## Compact Ownership

The source pin hashes the full accepted prepared Table result into one compact
SHA-256 identity. This detects row, cell, candidate, geometry, revision, and
prepared-fingerprint drift without repeating content-sized JSON in every
cursor.

The profile pin covers page-body height, repeated-header policy, and the
cumulative row-plan bound. Resuming with a different profile blocks instead of
silently changing layout or work policy.

## Bounded Cursor

The cursor retains:

- exact Table/source/profile ownership;
- next family page and fragment indexes;
- terminal-fragment and completion truth;
- the established Table cursor, including active synchronized row/cell state;
- cumulative page/row/cell/checkpoint/candidate/header/fresh work; and
- a compact fingerprint over all cursor facts.

Cursor fingerprint validation prevents a consumer from lowering cumulative
work, changing active row state, or rewriting indexes without detection.

## Page Checkpoints

Every committed family page retains cursor-before, cursor-after, the exact
Phase 319-322 Table page, per-page planner work and summary deltas, and a compact
checkpoint fingerprint. Cursor and fragment indexes advance exactly once per
committed page.

A partial result preserves all accepted checkpoints. A complete result marks
the final committed page in both Table state and terminal cursor state.

## Cumulative Work

The cursor carries committed work into the next window and supplies its row-plan
count to the shared page planner. A consumer cannot reset
`maximumRowPlanCount` by requesting one page at a time. The maximum is profile-
pinned, so raising or lowering it during resume is stale input.

Window `work` is the exact delta for that call. Summed one-page deltas and the
terminal cumulative work equal the established complete paginator work for the
same successful page sequence.

## Fresh Page

An empty short-remainder attempt that requests a fresh page returns
`fresh-page-required`, no checkpoint, and the exact unchanged cursor. Attempted
family work remains diagnostic result evidence, but no committed cumulative
work is added to the cursor. Retrying at full body height can then commit.

A full-page no-progress attempt blocks. A page that already committed body rows
before encountering fresh demand remains a legal committed page and carries
its work into the next cursor.

## Failure Contract

Required blockers include non-ready or empty prepared input, invalid capacity
or bounds, stale source/profile owner, malformed Table state, cursor/hash/index/
completion/work drift, completed-cursor replay, cumulative row-plan exhaustion,
repeated-header/body progress failure, and any shared page-planner issue.

Blocked output has no cursor-after or pages. Prepared input remains immutable.

## Parity Evidence

Focused evidence resumes repeated-header and split-row pages one checkpoint at
a time and matches the complete paginator's pages, final Table cursor, and work
facts. It also covers short-remainder fresh retry, cumulative budget exhaustion,
source/profile/cursor/result tampering, and explicit empty-source blocking.

The 1,000-row/250-page bounded scale matrix remains Phase 377 so scale evidence
does not obscure cursor semantics in this phase.

## Responsibility Boundary

Core owns the pure Table family cursor, bounded scheduling semantics, compact
pins, checkpoints, work bounds, and diagnostics. Backend later owns durable
cursor persistence, retries, expiry, authorization, and job scheduling. Editor
later owns progress and blocker presentation. Renderer/export continues using
complete authoritative Table pagination evidence.

## PASS

- Bounded Table calls preserve accepted pages and exact active row/cell state.
- Source, profile, cursor, checkpoint, and result evidence is compactly pinned.
- Cumulative row-plan work cannot reset across committed windows.
- Repeated-header, split-row, fresh, and complete-call parity pass.

## FAIL / BLOCKER

- No common `table-flow` fragment-window adapter exists yet.
- Empty Table composition policy remains blocked.
- No sequential whole-document composer consumes Table checkpoints.
- Backend/editor do not schedule, persist, or present Table windows.

## RISK

- Wide active split rows increase cursor size with synchronized cell cursors.
- Hashing full prepared evidence remains linear per request even though retained
  pins are compact.
- Fresh attempts are diagnostic work but cannot enter an unchanged common
  cursor as committed cumulative work.
- Very small window bounds increase durable checkpoint count.

## UNKNOWN

- Packed cursor size for production-wide rows and nested cell content.
- Empty/zero-extent Table authoring policy.
- Backend cursor expiry and retry limits.
- Production 200-300 page mixed-document memory and time.

## Intentionally Not Changed

- canonical Table/document schemas, colSpan, or rowSpan policy;
- Phase 319-322 complete paginator output;
- shared page-planner semantics;
- Table renderer projection;
- common fragment-window schema or adapter;
- backend/editor/storage behavior; and
- List of Tables generation.

## Next Recommended Direction

Implement Phase 375 as the strict common `table-flow` adapter. Validate every
cursor/checkpoint/result pin, capacity sequence, page geometry, root ownership,
positive extent, and completion chain without reproducing row/cell layout.
