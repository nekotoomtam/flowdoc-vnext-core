# Whole-Document V4 Table Common Adapter

Status: Phase 375 implemented the strict common `table-flow` adapter. The
sequential whole-document composer remains inactive.

## Outcome

Bounded Table pagination can now emit the common Composition fragment-window
contract. Each accepted Table family page becomes one positive `table-flow`
placement while synchronized rows, cells, split state, and repeated headers
remain Table-owned checkpoint evidence.

The adapter validates retained facts; it does not paginate, measure, reconcile
cells, repeat headers, or infer cursors from page contents.

## Public API

Core exports `createVNextTableCompositionWindowV1(...)`,
`VNextTableCompositionWindowContextV1`, and Table adapter source/version facts
from `src/composition/tableFragmentWindowV1.ts`.

## Cursor And Checkpoint Validation

The adapter verifies exact Table/source/profile ownership, cursor
self-fingerprints, page/fragment indexes, completion truth, per-page checkpoint
fingerprints, cursor-chain continuity, and final-cursor equality.

Checkpoint cumulative-work deltas must equal retained page work. Window work
must equal the sum of all checkpoint deltas. This prevents consumers from
dropping expensive row/header attempts or resetting work while preserving page
geometry.

## Geometry

Every accepted family page must retain the requested first remainder or full
page-body capacity. Body, available, used, and remaining heights must agree.
Rows must remain inside the used page extent.

One family page maps to one common placement with `blockOffsetPt=0` and
`blockExtentPt=page.usedHeightPt`. Zero extent and pages without retained row
fragments block instead of inventing a box.

## Family Evidence

The common placement references the Table page checkpoint fingerprint. It does
not copy rows, cells, candidates, repeated-header fragments, or active row/cell
cursors into the common schema. Renderer/export can later join the authoritative
document page plan to family evidence without relayout.

## Status Mapping

- `complete` and `partial` retain one common page/fragment/cursor commit per
  accepted Table checkpoint.
- `fresh-page-required` retains the exact common cursor, no pages, and no
  committed common work.
- family `blocked` becomes a valid common blocked window with family issues and
  no committed pages/cursor.
- adapter validation failure returns no common window.

## Failure Contract

Required adapter blockers include pagination/result/cursor/checkpoint
fingerprint drift, owner/profile mismatch, malformed indexes, broken cursor or
cumulative-work chains, capacity/geometry drift, zero extent, invalid row
geometry, terminal mismatch, final-cursor mismatch, work-sum mismatch, and
status/completion disagreement.

## Responsibility Boundary

Core owns Table evidence validation and common projection. Backend later owns
window scheduling, durable cursor/checkpoint retention, retries, expiry, and
storage. Editor later owns progress/blocker presentation. Renderer/export waits
for a complete authoritative document page plan and does not relayout Table
rows or cells.

## PASS

- Table is now a strict common `table-flow` window producer.
- Common output contains one positive placement per accepted family page.
- Cursor, checkpoint, cumulative work, geometry, and completion chains are
  validated before projection.
- Fresh and blocked outcomes preserve common atomicity.

## FAIL / BLOCKER

- Empty and zero-extent Table policy remains blocked.
- Deep semantic tamper cases and terminal replay matrix remain Phase 376.
- The 1,000-row/250-page bounded common scale gate remains Phase 377.
- No sequential composer or consumer runtime is activated.

## RISK

- Active wide split rows can produce large family cursors even though common
  cursor references stay compact.
- Common pages deliberately do not expose row-level hit testing or rendering
  facts.
- Fresh diagnostic work is family evidence and not committed common work.

## UNKNOWN

- Product policy for empty Tables.
- Packed checkpoint storage cost for production-wide rows.
- Mixed-document 200-300 page memory and timing.
- Backend cursor expiry and retry policy.

## Intentionally Not Changed

- Table schema, row/cell pagination, repeated-header, colSpan, or rowSpan rules;
- complete or bounded Table pagination output;
- common fragment-window schema;
- Table renderer projection;
- backend/editor/storage behavior;
- sequential composition; and
- List of Tables generation.

## Next Recommended Direction

Run Phase 376 hardening over split-row/cell cursor tampering, repeated-header
progress, stale ownership/profile pins, checkpoint work/geometry drift,
terminal replay, blocked/fresh invariants, and empty/zero-extent policy evidence
before the large scale gate.
