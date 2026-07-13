# Sequential Whole-Document V4 Ordered Scheduling

Status: Phase 381 implemented for complete family windows. Fresh, partial, and
family-blocked handling remain inactive until Phase 382.

## Outcome

Phase 381 implements the pure sequential transition over Phase 380 state
contracts. It initializes canonical section flow, emits one exact family
demand, accepts at most one matching complete common window, projects accepted
document-level placements, closes immutable pages in order, and returns either
the next demand, an output-limit checkpoint, or terminal completion.

The transition never invokes a family paginator, remeasures content, inspects
family internals, renders output, persists state, retries work, or mutates
editor state.

## Public API

`src/composition/documentCompositionTransitionV1.ts` exports:

- `VNextDocumentCompositionTransitionLimitsV1`;
- exact per-transition work and result types;
- `initializeVNextDocumentCompositionV1(...)`; and
- `advanceVNextDocumentCompositionV1(...)`.

The package root exports the module. Existing family and consumer APIs remain
unchanged.

## Initialization

Initialization parses the retained manifest, opens section zero with its exact
geometry/static-zone pins, walks empty leading sections within the closed-page
output bound, activates the first canonical body item, and emits
`needs-family-window` with the exact fresh-page demand.

A document containing no body items still retains one page per section. The
final empty section closes with `document-complete`; earlier empty sections
close with `section-boundary`.

Initialization is deterministic and source-immutable. It does not create a
special unvalidated bootstrap cursor: the first returned cursor pins the real
open-page checkpoint.

## Exact Window Acceptance

Before projection, the transition validates:

- retained common-window schema, semantics, and fingerprint;
- document, section, zone, source order, root, root type, and family identity;
- stable document/projection/family-source/measurement owner pins;
- exact demanded cursor-before;
- exact body/first-page capacity and family page/fragment bounds;
- per-transition family page and placement work;
- remaining manifest placement capacity; and
- minimum closed-page capacity needed for an atomic complete window.

The per-call pagination fingerprint remains window-owned and must itself be a
valid compact owner pin. It is not compared with a stable manifest field.

Malformed, stale, capacity-mismatched, out-of-order, or over-limit windows block
with cursor-before and zero committed work. No cursor-after, open-page-after, or
closed pages are exposed.

## Content Projection

For `place-content`, the first family page begins at the current open-page used
height. Common fragment offsets are translated by that base exactly once.
Later family pages begin on fresh pages at offset zero.

Each projected document placement retains root/item/family identity, common
fragment id/index, document block geometry, continuation, and compact family
evidence fingerprints. Orchestration-window identity is deliberately excluded
so valid one-shot and resumed schedules close byte-identical pages. Text,
Columns, Table, TOC, Utility, and Media internal geometry is not flattened or
recomputed.

All non-final family pages with an incomplete family cursor close as
`family-continuation`. A complete final family page stays open so the next root
in the same section can consume its exact remainder.

## Canonical Root And Section Order

After a complete window, the body-item index advances exactly once. The next
item in the same section becomes active on the same open page. A later section
closes the current page as `section-boundary`, opens section page zero with the
new section geometry/static zones, and emits a fresh-page demand.

No family window may skip, repeat, or reorder a manifest body item. Family-
owned descendants never enter document traversal.

## Page Break

A complete `force-page-advance` window creates no placement. It closes the
current page as `page-break` and opens the next page in the same section.

When the closed page has no placements and zero used height, it is marked
intentional blank. Consecutive page-break roots therefore retain consecutive
intentional blank pages and advance the body-item cursor exactly once each.

## Closed Prefix And Cursor Commit

Every closed page recomputes its page fingerprint and chains it to the prior
closed prefix. Placement and heading counts advance from page facts, not caller
claims.

The transition uses an internal temporary prefix only between closing one page
and opening the next. It finalizes a retained cursor only at a valid commit
point with either:

- one exact open-page checkpoint; or
- terminal complete state with no open page.

The retained cursor therefore never weakens the Phase 380 invariant merely to
represent an internal intermediate step.

## Output Bounds And Resume

Each call selects positive bounds for closed pages, new placements, family
pages, and family fragments. The exact demand includes the selected family
bounds and remaining document capacity.

A complete window that cannot fit atomically inside its required family-page/
placement output bounds blocks before commit. Structural work after an accepted
window may stop cleanly at `output-limit`; the returned cursor/open page/prefix
resume section or document completion without replaying the accepted window.

Per-transition work reports accepted windows, family pages, closed pages,
placements, completed body items, page advances, and family cursor commits.
Cumulative cursor work excludes schedule-dependent window count and advances
only family pages, placements, completed items, page advances, and cursor
commits so one-shot and valid resume converge on the same terminal cursor.

## Active States

Phase 381 activates only common `complete` windows. Valid `partial`,
`fresh-page-required`, and family `blocked` windows are recognized as retained
common evidence but return `unsupported-window-state` with zero committed work.
Phase 382 will implement their distinct commit/recovery behavior and preserve
family issues.

## PASS

- Initialization emits the exact first canonical demand.
- Multiple complete roots share one page remainder without overlap.
- Section transitions start fresh and retain exact static-zone ownership.
- Multi-page family windows produce ordered append-only document pages.
- Consecutive page breaks retain consecutive intentional blank pages.
- Output-limit state resumes structural completion without replaying a window.
- Stale/tampered/out-of-order and inactive window states commit nothing.

## FAIL / BLOCKER

- Partial family cursor continuation is not active yet.
- Fresh-page-required transition is not active yet.
- Valid family-blocked issue propagation is not active yet.
- No authoritative final page plan or heading-page map is finalized yet.
- Backend/editor/renderer consumers remain inactive.

## RISK

- Phase 382 must close a partial family page before demanding continuation on a
  fresh document page.
- Fresh-page handling must advance document state without advancing the family
  cursor or accepted-window work.
- Family-blocked issues must remain distinguishable from malformed transport.
- Retry must prove byte-identical result fingerprints and source immutability.

## UNKNOWN

- Mixed 200-300 page transition throughput and retained chunk size.
- Final static-zone artifact and page-number cycle behavior.
- Empty Table policy before manifest construction.
- Durable backend transaction and expiry policy.

## Files Changed

- `src/composition/documentCompositionTransitionV1.ts`
- `src/index.ts`
- `tests/documentCompositionTransitionV1.test.ts`
- `tests/sequentialWholeDocumentV4OrderedScheduling.test.ts`
- `docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_ORDERED_SCHEDULING.md`
- `README.md`
- `docs/CROSS_REPO_OPERATING_MAP.md`
- `docs/PHASE_LEDGER.md`

## Behavior Changed

Core can now initialize and advance pure whole-document state through exact
complete common family windows. Existing family pagination and all consumers
remain unchanged.

## Tests Run

- focused transition happy-path/order/page-break/output-limit tests;
- focused Phase 381 documentation contract test;
- core type-check; and
- full core test suite.

## Risks Left

Fresh/partial/blocked recovery, authoritative finalization, scale, and consumer
integration remain separate phases.

## Intentionally Not Changed

- canonical document/node/field/media schemas;
- common fragment-window or family adapter contracts;
- family measurement/pagination internals;
- backend scheduling, persistence, routes, jobs, auth, retry, or storage;
- editor canvas, DOM, selection, history, viewport, or WYSIWYG runtime; and
- renderer, PDF, DOCX, preview, or artifact output.

## Next Recommended Direction

Implement Phase 382 fresh, partial, blocked, and retry behavior over this exact
transition. Add adversarial re-fingerprinted state/window cases and prove each
failure commits zero state while valid retries remain byte-identical.
