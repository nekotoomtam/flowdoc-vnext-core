# Sequential Whole-Document V4 Composer Architecture Lock

Status: Phase 379 architecture locked. No composer runtime or consumer
orchestration is activated by this phase.

## Outcome

The sequential whole-document v4 composer is a pure, renderer-neutral state
machine over the six accepted common Composition families. It consumes
canonical body-item order and one caller-supplied family window at a time,
closes immutable document pages in order, and emits the exact next demand.

The composer coordinates already accepted layout evidence. It does not call a
family paginator through callbacks, measure content, inspect Table cells or
Columns lanes, resolve fields, decode media, render artifacts, persist jobs,
retry work, or mutate editor state.

All six common family producers are now ready:

- `text-flow` for `text-block`;
- `columns-flow` for `columns`;
- `table-flow` for `table`;
- `generated-flow` for `toc`;
- `utility-flow` for `page-break`, `divider`, and `spacer`; and
- `media-flow` for block `image`.

Phase 379 replaces the prerequisite uncertainty recorded by Phase 366 with the
exact scheduling, cursor, open-page, page-plan, heading-map, and recovery
boundaries needed before implementation.

## Canonical Manifest

The composer accepts one strict immutable manifest. It pins the canonical
document structure, resolved projection, ordered sections, section page/body
geometry, static-zone evidence, and ordered direct body roots.

Each body-item descriptor retains:

- section, zone, root node, root node type, family, and source-order identity;
- stable document, projection, family-source, and measurement owner pins; and
- the initial opaque family cursor reference.

The per-call pagination fingerprint is intentionally not a stable manifest
pin. It belongs to the supplied common window because a fresh-page retry uses
a different first-page capacity and therefore a different accepted pagination
result. The family cursor chain and stable owner pins prevent that freedom from
becoming a stale-window escape.

Traversal remains section array order, body zone order, then direct `childIds`
order. Family-owned descendants remain internal. Every section begins on a
fresh document page with its own geometry and static-zone pins.

## Transition Boundary

One transition accepts:

1. the exact manifest;
2. the compact composer cursor before the transition;
3. the current open-page checkpoint;
4. zero or one common fragment window for the demanded body item; and
5. exact per-transition page, placement, and work limits.

Zero supplied windows produces `needs-family-window`. One valid demanded
window may advance the state. More than one window is not accepted by the
primitive transition; a later pure bounded runner may repeat transitions over
an ordered caller-supplied queue.

This one-window primitive keeps retry atomic and makes backend scheduling
explicit. Core returns demand facts; backend later decides when to produce,
retain, or retry the requested family window.

## Demand Contract

A `needs-family-window` demand identifies exactly:

- document, section, zone, root, root type, family, and source order;
- stable source and measurement owner pins;
- expected family cursor reference;
- page-body height and exact first-page available height; and
- maximum family pages and fragments allowed by remaining composer budgets.

The caller must return a common window for that exact demand. The composer
parses the retained window fingerprint, checks identity and stable owner pins,
requires exact first capacity, requires the demanded cursor-before, and checks
that window work fits the remaining transition budgets. It never clips,
rescales, repacks, repairs, or accepts an out-of-order window.

## Compact Composer Cursor

The compact cursor retains control state only:

- manifest and document owner fingerprints;
- section and body-item indexes;
- active root/family and exact opaque family cursor reference, or `null`;
- next document page index and current section page index;
- current page used and remaining body height;
- open-page checkpoint fingerprint;
- committed closed-page prefix fingerprint and counts;
- complete state; and
- its own deterministic fingerprint.

It must not embed measured lines, Table rows/cells, Columns lanes, TOC rows,
media payloads, the complete page-plan prefix, or the full heading map.

## Open-Page Checkpoint

A compact cursor alone cannot resume a page that already contains placements
from earlier roots. The composer therefore retains one separate, strict,
fingerprinted `open-page checkpoint`.

The checkpoint contains only the current document page descriptor, section and
static-zone identity, ordered placements already accepted on that page,
used/remaining geometry, intentional-blank state, and bounded heading-first-
fragment facts for that page. Its fingerprint is pinned by the cursor.

The checkpoint is bounded by the maximum placements allowed on one page. It is
not a hidden full-document accumulator. Closed pages leave the checkpoint as
append-only page chunks and are never rewritten by a later transition.

## Content Placement

For a `place-content` family page, common fragment offsets are relative to the
family page. The composer adds the current open-page used height to offsets on
the first family page. Later family pages start at offset zero on newly opened
document pages.

All family pages except possibly the last close a document page. The last page
obeys the family outcome:

- `complete`: the body item completes and the last page remains open so the
  next body item may use its remainder;
- `partial`: the active family cursor advances, the last page closes, and the
  same root is demanded on a fresh document page;
- `fresh-page-required`: no family cursor or placement advances; the current
  page closes and the same root is demanded on one fresh page; and
- `blocked`: the transition blocks atomically and commits nothing.

A valid `fresh-page-required` window is a document-page transition, not family
progress. Repeating it on a fresh page is no-progress and blocks through the
common contract.

## Page Break And Section Rules

A complete `force-page-advance` page-break window closes the current open page
and opens the next page without creating a content placement. If the current
page is empty, the closed page is marked intentional blank. Consecutive page
breaks therefore preserve consecutive intentional blank pages.

Section transition closes the prior section page, even when it still has body
remainder, and opens a fresh page with the next section's geometry and static-
zone pins. Section remainder never carries into another section.

Document completion closes the final open page. Empty sections still retain
one section-owned page; this policy keeps section geometry and static-zone
ownership observable instead of silently deleting the section.

## Closed Page Chunks

Each accepted transition emits zero or more immutable closed pages. A closed
page records:

- document page index/number and section page index;
- section geometry and static-zone evidence references;
- ordered root placements with document-level offsets/extents;
- used and remaining body height;
- intentional-blank state; and
- a fingerprint chained to the previous closed-page prefix.

Family-internal coordinates remain in family evidence. A document placement
retains only root/family identity, common fragment identity/index,
continuation, compact family evidence identity, and document block geometry.

## Authoritative Finalization

Bounded transitions do not repeat the complete retained page prefix on every
resume. Once the cursor is complete, a separate pure finalizer accepts the
ordered closed-page chunks plus the terminal cursor and validates the complete
prefix chain exactly once.

That finalizer emits the authoritative document page plan and authoritative
heading-page map in the same result with one shared owner fingerprint. A
heading destination comes only from the first accepted `text-flow` fragment
carrying heading identity. Duplicate/missing first fragments, page gaps,
source-order drift, prefix mismatch, or terminal cursor mismatch block the
whole finalization; no partial heading map is authoritative.

Final TOC page-reference resolution consumes this map without measurement or
relayout. Geometry-changing TOC label materialization invalidates upstream
measurement and composition instead of creating a hidden second layout pass.

## Result States

The primitive transition has three top-level outcomes:

- `partial`: returns cursor-after, open-page-after, immutable closed-page
  chunks, exact work, and either `needs-family-window` or `output-limit`;
- `complete`: returns the terminal cursor, no unresolved demand, the final
  closed-page chunks, and exact work; and
- `blocked`: returns cursor-before and structured issues, but no cursor-after,
  open-page-after, new closed pages, authoritative plan, or heading map.

Invalid/tampered transport and valid family `blocked` windows both block the
transition, while retaining distinct issue codes. Accepted source inputs remain
immutable.

## Atomicity And Recovery

Each primitive transition is all-or-nothing. Validation of manifest, cursor,
open page, demand, window, geometry, cursor chain, fragment identity, and work
limits completes before any result is committed.

Retry uses the exact same cursor-before and open-page-before. A deterministic
valid retry produces the same cursor, closed pages, demand, work, and
fingerprints. A stale family window cannot advance the document cursor.

The append-only closed-page prefix and one open-page checkpoint are the durable
recovery units. Backend later owns their transaction, expiry, retry, and
storage policy; core owns only their strict pure contracts.

## Bounded Work

Every transition retains exact counts for windows accepted, family pages
consumed, document pages closed, placements accepted, headings observed, body
items completed, page advances, and cursor commits.

Hard limits apply before commit to emitted closed pages, accepted placements,
and transition work. Cursor and open-page checkpoint sizes are bounded
independently of document page count. Full-plan finalization is one explicit
linear pass over retained closed pages and placements.

One-shot execution and every valid partial/resume schedule must produce byte-
identical closed pages, terminal cursor, authoritative page plan, heading-page
map, summary, and final fingerprint.

## Responsibility Boundary

Core owns manifest/cursor/open-page/page contracts, strict family-window
acceptance, pure sequential transitions, exact demand and work, authoritative
finalization, heading-map identity, diagnostics, and invalidation facts.

Backend later owns family-window scheduling, durable transition transactions,
cursor/open-page/page retention, retries, expiry, authorization, tenancy, and
artifact storage.

Editor later owns commands, progress and blocker presentation, viewport
virtualization, selection/caret behavior, preview scheduling, and undo UX.

Renderer/export later consumes the authoritative page plan and family evidence
without changing accepted pagination.

## Implementation Phases

1. **Phase 380, contracts:** strict manifest, demand, composer cursor,
   open-page checkpoint, closed-page chunk, and parse/finalize boundaries.
2. **Phase 381, scheduling:** one-window transition, canonical order, content
   placement, section/page transitions, exact limits, and resume equivalence.
3. **Phase 382, failure/recovery:** fresh, partial, family blocked, stale,
   tamper, no-progress, retry, and atomicity matrices.
4. **Phase 383, finalization/scale:** authoritative page plan and heading-page
   map plus mixed-family 200-300 page scale.
5. **Phase 384, readiness close:** full core and cross-repo gates before any
   backend scheduler or editor presentation work.

## PASS

- All six common family producers are ready for strict composer consumption.
- Canonical scheduling, fresh/partial/page-break/section behavior, and exact
  family demand are locked.
- The open-page checkpoint resolves resume across multiple roots on one page
  without growing the cursor by document length.
- Closed pages are append-only and authoritative finalization owns one page
  plan plus one heading-page map.
- Core/backend/editor/renderer responsibilities remain separate.

## FAIL / BLOCKER

- Composer manifest, cursor, open-page, page-chunk, and demand schemas are not
  implemented yet.
- No sequential transition or authoritative production page plan exists yet.
- No production heading-page map is emitted from real composed pages yet.
- Backend/editor/renderer consumers remain inactive.

## RISK

- An open-page checkpoint without a strict per-page placement bound could
  become an unbounded second cursor.
- Closing a partial family page incorrectly could reuse unusable remainder and
  overlap the resumed family root.
- Treating the pagination fingerprint as a stable item pin would reject valid
  fresh-page retries; failing to pin stable owners would accept stale evidence.
- Repeating all closed pages in every transition would reintroduce quadratic
  retained-output growth.
- TOC finalization can become a hidden layout cycle if final labels change
  measured geometry.

## UNKNOWN

- Production memory/time ceilings for mixed 200-300 page documents.
- Final static-zone artifact and page-number field cycle behavior.
- Empty Table product policy before a Table root enters composition.
- Future rowSpan, footnotes, floats, and text wrap around media.
- Durable backend retention and transaction sizing.

## Files Changed

- `docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_COMPOSER_ARCHITECTURE_LOCK.md`
- `tests/sequentialWholeDocumentV4ComposerArchitectureLock.test.ts`
- `README.md`
- `docs/CROSS_REPO_OPERATING_MAP.md`
- `docs/PHASE_LEDGER.md`

## Behavior Changed

None. This phase locks architecture and implementation order only.

## Tests Run

- focused Phase 379 documentation contract test;
- core type-check; and
- full core test suite.

## Risks Left

Runtime contracts, transitions, recovery, finalization, scale, and consumer
integration remain deliberately separate later phases.

## Intentionally Not Changed

- canonical document/node/field/media schemas;
- common family-window schema or any family paginator/adapter;
- existing Table/Columns/Text/TOC/Utility/Media semantics;
- backend routes, scheduling, persistence, jobs, auth, or storage;
- editor canvas, DOM, viewport, selection, history, and WYSIWYG runtime; and
- renderer, PDF, DOCX, or artifact output.

## Next Recommended Direction

Implement Phase 380 strict sequential composer contracts. Start with the
canonical manifest and compact cursor, then add the separately fingerprinted
open-page checkpoint and append-only closed-page chunk before any scheduling
transition is activated.
