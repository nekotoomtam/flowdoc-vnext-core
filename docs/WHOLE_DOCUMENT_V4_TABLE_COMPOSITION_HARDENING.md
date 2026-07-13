# Whole-Document V4 Table Composition Hardening

Status: Phase 376 hardened bounded Table cursors and common adaptation against
semantically forged evidence. The 250-page scale gate remains next.

## Outcome

Phase 376 proves that compact fingerprints are identity checks, not the sole
trust boundary. Cursor and checkpoint evidence that has been modified and then
re-fingerprinted still blocks when its Table semantics are impossible.

## Prepared-State Validation

Every resumed active row is checked against the exact prepared row identity,
fragment state, ordered cell set, cell identity, candidate bounds, completion
truth, and the requirement that at least one cell remains incomplete.

Complete Table state must point after the final prepared row. Incomplete state
must point to an existing row. Only the initial empty state may be complete
without a committed terminal fragment; non-empty terminal replay blocks.

## Row And Header Validation

The common adapter now requires one contiguous row stack whose height equals
the used page height. Non-repeated body row and fragment indexes must follow the
cursor-before state. An incomplete split row must be final and must match the
active cursor-after fragment.

Repeated headers must be complete authored header fragments at the start of a
page. They cannot appear after body progress or advance the source row cursor.

## Work Validation

Completed-row, split-row, repeated-header fragment/plan, fresh advance, and
row-plan facts must agree with retained page rows. Cell-plan work must cover all
retained row cells. Cursor cumulative fresh/header work must remain within its
page/row-plan totals.

## Adversarial Evidence

Tests recompute cursor, checkpoint, and result SHA-256 fingerprints after
tampering. Required blockers cover:

- active cell candidate index outside prepared bounds;
- completed cursor rewritten as an uncommitted terminal replay;
- overlapping row stack geometry;
- repeated header inserted after body progress;
- forged completed-row work; and
- fresh-page cursor progress with no committed page.

These are semantic failures after valid replacement fingerprints, not simple
hash-mismatch tests.

## Empty Policy

Empty prepared Tables and non-empty Tables that produce zero family extent
remain explicit blockers. Phase 376 records this policy gap without inventing
an empty-state box, silently deleting the root, or treating zero height as
committed common content.

## Responsibility Boundary

Core owns prepared-state, cursor, row/header, work, geometry, and common-window
validation. Backend/editor remain inactive and must preserve exact issues rather
than repairing evidence. Renderer/export still waits for authoritative complete
document composition.

## PASS

- Re-fingerprinted semantic cursor and checkpoint tampering blocks.
- Active split-row/cell ownership and bounds are prepared-source checked.
- Repeated-header/body order and row cursor progress are retained invariants.
- Page stack, split cursor, and work summaries agree before common projection.

## FAIL / BLOCKER

- Empty/zero-extent product policy is not selected.
- The 1,000-row/250-page bounded common scale gate remains Phase 377.
- No sequential composer, backend scheduler, editor presentation, or renderer
  integration is active.

## RISK

- Exact prepared-state validation adds work proportional to active row width,
  not total Table size.
- Wide split rows still enlarge durable family cursors.
- New row/header policies will require matching semantic invariants.

## UNKNOWN

- Product behavior for empty Tables.
- Production cursor/checkpoint compression.
- Mixed 200-300 page document memory/time.

## Intentionally Not Changed

- Table schemas, row/cell planners, colSpan, or rowSpan policy;
- complete and bounded successful page output;
- common fragment-window schema;
- renderer, backend, editor, or storage runtime; and
- List of Tables generation.

## Next Recommended Direction

Run Phase 377 with 1,000 body rows, repeated authored headers, 250 one-page
bounded windows, exact complete-call page/final-cursor/work parity, common
window validation, compact cursor/checkpoint size evidence, and immutable input.
