# TOC V4 Pagination Lane Architecture Lock

Status: Phase 347 architecture lock.

## Outcome

TOC v4 pagination consumes one retained measured TOC layout and groups its
atomic title/entry rows into deterministic page fragments. It preserves
measurement geometry, advances through a fingerprint-pinned cursor, supports
bounded window/resume execution, and reports forced policy exceptions without
remeasuring text or resolving final page numbers.

## Accepted Input

- one successful TOC v4 measurement result;
- positive finite full page-body height;
- first-page available height between zero and full height;
- non-negative starting page index;
- positive maximum output page count; and
- an optional exact-owner cursor.

The measurement width/rows remain source truth. Pagination may rebase measured
y positions into a page placement but must not change row height, label lines,
leader area, number area, styles, or fingerprints.

## Cursor

```text
kind: toc-pagination-cursor
tocNodeId
measurementFingerprint
titlePlaced
nextRowIndex
nextPageIndex
complete
```

The initial cursor starts before title/row zero at the supplied page index.
Resume requires exact TOC id, measurement fingerprint, page index, title state,
and row bounds. A blocked call returns the original cursor and no pages.

## Placement Rules

- Title and first row are treated as `keep-with-first-entry` when their measured
  bundle fits a full page.
- If that bundle does not fit the first-page remainder but fits a full page,
  pagination emits a zero-use first page advance and places both on a fresh page.
- If title and first row each fit a full page but their bundle does not, title is
  placed alone with `title-keep-with-first-unsatisfied`; the first row follows
  on the next page.
- If title alone exceeds a full page, it is force-placed once with an explicit
  title overflow warning so the cursor progresses.
- Rows are atomic and ordered. A row that fits the full page but not the current
  remainder advances to a fresh page without consumption.
- A row taller than the full page is force-placed once on a fresh page, may use
  height beyond available space, and reports its heading identity.
- Empty TOCs may place a title alone or complete without fragments.

## Page Fragments

Each page retains page index, available/used/remaining height, completion,
fresh-page advance, title placement, ordered row placements, forced overflow,
and warning codes. Placements reference measured identities/indexes and page y
offsets; they do not duplicate or mutate full measured geometry.

## Bounded Window And Resume

`maximumPageCount` bounds pages returned by one call. Reaching the bound returns
`partial` with a committed cursor after the emitted pages. Resume continues from
that exact cursor and a full-page height unless the caller explicitly supplies
another valid first-page remainder for the resumed page.

Repeated one-shot and resumed execution must produce equivalent ordered
placements and the same final cursor. Cursor commits are atomic per accepted
page. Page attempts with no cursor progress are allowed only for one transition
from a partial remainder to a fresh full page.

## PASS Criteria

- strict measurement/input/cursor validation and immutable source;
- title-first-row keep behavior with explicit impossible-case warning;
- complete ordered rows with no split, duplication, or omission;
- forced title/row overflow makes exactly one cursor step;
- zero-progress partial remainder advances only to a fresh page;
- bounded partial results and deterministic resume equivalence;
- exact page/placement/work facts and no-progress guard;
- 1,000-row bounded-window scale evidence;
- no measurement, final page reference, rendering, artifact, persistence,
  network, DOM, or editor state.

## RISK

- Impossible title-first bundles explicitly violate keep-with-first rather than
  overflowing both together.
- Forced oversized rows produce negative remaining height by design.
- Many small page windows increase orchestration overhead but keep work bounded.
- Final page-number replacement may still fail retained digit capacity later.

## UNKNOWN

- Product warning presentation for impossible keep and forced overflow.
- Whether an empty untitled TOC should emit a zero-height renderer fragment.
- Future widow/orphan policy across groups of TOC levels.
- Page-number formatting and final resolution convergence.

## Intentionally Not Changed

- TOC semantic and measurement contracts;
- generic v3 pagination and placeholder TOC behavior;
- final v4 heading-page resolution, renderer, PDF, or DOCX execution;
- authoring commands, backend persistence, and editor UI.

## Next Direction

Implement strict cursor/page planning and resume equivalence first, then add
forced-overflow, budget, and 1,000-row evidence before final page resolution.
