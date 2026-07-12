# TOC V4 Pagination Lane Readiness Close Audit

Status: Phase 351 close audit.

## Outcome

The TOC v4 pagination lane is ready as a pure bounded page planner over one
retained measured TOC layout. Core can preserve atomic title/entry geometry,
move keep bundles from a short remainder, place ordered rows, report impossible
keep and forced overflow, return resumable page windows, and validate exact
measurement-pinned cursors.

This closes pagination readiness only. It does not claim final heading-page
references, actual page-number text, renderer commands, artifacts, TOC
authoring, backend persistence, or editor UI.

## PASS

- Pagination requires successful measured input, positive full page height,
  valid first remainder/start page/window count, and an exact-owner cursor.
- Cursor contract/version, TOC id, measurement fingerprint, row/page bounds,
  completion truth, title state, and title-before-row order are validated before
  any page commit.
- Blocked calls return the original cursor and no pages.
- Title and first row move together from a short first remainder when their
  measured bundle fits a full page.
- An impossible combined keep places a fitting title alone and reports
  `title-keep-with-first-unsatisfied` instead of silently overflowing.
- Oversized title and row geometry is force-placed once with an explicit warning
  so the cursor always progresses.
- Rows remain complete, ordered, and atomic. Pagination references measured row
  index/identity and page y offset without mutating or duplicating geometry.
- Row gaps appear only between rows placed on the same page; no trailing page
  gap inflates used height.
- A partial remainder may emit one zero-use fresh-page advance. Full-page
  planning cannot loop without semantic cursor progress.
- Each accepted page commits cursor state atomically and retains exact available,
  used, remaining, title, row, warning, completion, and work facts.
- `maximumPageCount` bounds one output window and returns `partial` with retained
  progress instead of discarding remaining work.
- Resumed windows produce the same ordered pages and final cursor as one-shot
  execution.
- A 1,000-row measured TOC produces 167 pages with row indexes 0..999 exactly
  once, no forced overflow, and a complete final cursor.
- Seven-page windows resume in 24 calls and combine to byte-equal one-shot page
  facts and the same final cursor.
- A one-page window returns five placed rows and exact partial progress.
- Measurement, final page resolution, rendering, persistence, network, DOM, and
  editor state are never executed.

## FAIL / BLOCKER

None for the bounded measured-row TOC v4 pagination profile.

Final output remains blocked until heading page references are resolved against
the complete page plan, retained digit capacity is enforced, and renderer
consumption proves no relayout.

## RISK

- Impossible title-first bundles explicitly violate keep-with-first and require
  visible product warning treatment.
- Forced oversized rows intentionally produce negative remaining page height.
- Small page windows increase orchestration calls even though each call remains
  bounded and deterministic.
- Final page values may exceed measured digit capacity and require explicit
  remeasurement/re-pagination.
- Page fragments reference measurement rows; durable systems must retain the
  exact measurement fingerprint and artifact together.

## UNKNOWN

- Product presentation for fresh-page advance, impossible keep, and forced row
  overflow.
- Whether empty untitled TOCs should produce renderer-visible zero geometry.
- Final page-number formatting, prefixes, and capacity policy.
- Future grouped-level widow/orphan behavior.
- Durable cursor expiry and retention policy.

## Files Changed

- Architecture: `docs/TOC_V4_PAGINATION_LANE_ARCHITECTURE_LOCK.md`.
- Cursor/page planning: `src/toc/tocV4Pagination.ts`.
- Public exports, phase trail, title/row/forced/cursor tests, and 1,000-row
  one-shot/window scale evidence.

## Behavior Changed

- Core now turns measured TOC rows into deterministic bounded page fragments.
- Partial pagination returns exact resumable progress rather than failing at a
  page-window limit.
- Impossible keep and oversized geometry become explicit warnings and progress
  facts instead of hidden overlap or no-progress loops.
- Consumer-owned cursors cannot bypass measurement ownership or title ordering.

## Tests Run

- Core before this document: type-check and 277 test files / 1,417 tests.
- Final core: type-check and 278 test files / 1,419 tests.
- Editor: type-check, 27 test files / 157 tests, and production build.
- Backend: type-check, 13 test files / 45 tests, and build.

## Risks Left

- Final v4 heading-page resolution and digit-capacity enforcement remain core
  work.
- Renderer adapters must consume measured rows plus page placements without
  relayout.
- Production text shaping/font evidence remains required for visual exactness.
- Authoring commands/UI and backend cursor/artifact persistence remain separate.

## Intentionally Not Changed

- canonical document, TOC semantic, and TOC measurement contracts;
- generic document v3 pagination and placeholder TOC resolver;
- final v4 page-reference replacement and renderer/artifact execution;
- TOC authoring, backend routes/storage, and editor state/UI.

## Next Recommended Direction

Move to final TOC v4 page-reference resolution. Map every generated entry's
heading id to the completed measured document page plan, enforce retained digit
capacity, preserve semantic/measurement/pagination fingerprints, and return
renderer-ready resolved entry facts without remeasurement or relayout.
