# Whole-Document V4 Utility And Media Atomic Fragment Contracts

Status: Phase 369 implemented Utility/Media atomic evidence, pagination, and
common fragment-window adapters. The sequential composer remains inactive.

## Outcome

`page-break`, `divider`, `spacer`, and resolved block `image` now have isolated
v4 atomic contracts. They derive exact canonical geometry and media ownership,
choose current-page placement versus fresh-page demand without splitting, and
project accepted facts into the Phase 367 Common Fragment-Window Contract.

Block image follows the locked v1 policy:

1. place the complete authored frame when it fits the current remainder;
2. request a fresh page when it fits a fresh body but not the remainder;
3. block when it exceeds fresh page height or available width; and
4. never auto-scale, crop, split, decode, or render during pagination.

## Evidence And Public API

Canonical evidence comes from:

- `src/schema/documentV4Target.ts` for Utility node shape and body placement;
- `src/schema/documentV4ImageTarget.ts` for block-image frame/source/accessibility;
- `src/resolution/resolvedDocument.ts` for resolved image asset, owner, and value
  source;
- `src/table/tablePreparedCellBuilderV1.ts` for retained point conversion and
  atomic Divider/Spacer/Image geometry precedent; and
- `tests/measuredPagination.test.ts` for old-path forced page-break evidence,
  used only as behavior evidence rather than canonical v4 input.

Phase 369 exports:

- `createVNextAtomicBlockV4Evidence(...)`;
- `paginateVNextAtomicBlockV4(...)`;
- `createVNextAtomicBlockCompositionWindowV1(...)`;
- compact evidence/cursor/pagination verification helpers; and
- strict cursor/result/evidence types through `src/index.ts`.

## Common Flow Effect

Common fragment-window pages now require one explicit `flowEffect`:

- `place-content`; or
- `force-page-advance`.

Text-flow and placed atomic blocks use `place-content`.

`force-page-advance` is valid only for one complete `utility-flow` page-break
window with zero used height, full remainder, no placements, and a progressed
cursor. A page-break encoded as ordinary content is rejected.

This effect preserves the future composer rule:

- when the current document page has content, close it and open the next page;
- when it is already empty, commit an intentional blank page and open the next;
- consecutive page-breaks therefore retain consecutive intentional blanks.

Phase 369 records the directive; it does not create document pages yet.

## Atomic Evidence

`createVNextAtomicBlockV4Evidence(...)` strictly parses the canonical node and
requires positive finite available width.

### Page Break

Retains zero extent, `utility-flow`, `force-page-advance`, and explicit
`intentionalBlankWhenPageEmpty=true`.

### Divider

Converts margin-before, thickness, and margin-after from pt/mm to points using
the retained six-decimal conversion. Total vertical extent must be positive.
Color and line style remain evidence facts; no paint command is produced.

### Spacer

Retains its canonical positive point height as atomic extent.

### Block Image

Requires the exact `VNextResolvedImageBindingV1` for the placement. Evidence
retains:

- authored frame width/height, fit, crop, and alignment;
- resolved asset id;
- published-static or instance-media owner;
- authored/data/fallback value source; and
- `decodeExecution=false`.

An empty binding, wrong placement, mismatched authored-static owner, missing
asset, or frame wider than available body width blocks evidence. Pagination
does not invent a placeholder or infer intrinsic image dimensions.

Every accepted evidence object has a compact fingerprint over normalized facts.
Caller nodes and bindings remain immutable.

## Atomic Cursor

The cursor retains only node id, evidence fingerprint, and complete state.
Starting from malformed, stale, or already-complete cursor blocks atomically.

Fresh-page demand returns cursor-after byte-identical to cursor-before. A
successful placement or forced-page directive commits the cursor exactly once.

## Atomic Pagination

Atomic pagination accepts exact page-body height and optional first-page
remainder. It has a fixed one-page/one-fragment maximum:

- `place-content` fitting the remainder emits one complete page and fragment;
- `place-content` fitting only a fresh page emits `fresh-page-required`;
- `place-content` exceeding a fresh page emits `blocked`;
- `force-page-advance` emits one complete zero-height directive page; and
- no result can be partial or split.

Accepted result fingerprints cover evidence ownership, capacity, cursor, page,
fragment, work, and issues. Adapter verification rejects any changed retained
fact before common finalization.

## Common Fragment-Window Adapter

`createVNextAtomicBlockCompositionWindowV1(...)` validates pagination
fingerprint and cursor ownership, then maps:

- Utility roots to `utility-flow`;
- block image to `media-flow`;
- evidence/pagination fingerprints to compact common owner pins;
- atomic cursor to opaque common cursor references;
- placed extent to one renderer-neutral placement; and
- page-break to `force-page-advance` with no placement.

Valid family-blocked results remain valid fingerprinted blocked common windows.
Malformed or tampered pagination returns adapter failure with no window.

## Image Page Policy

For body height 700 pt, remainder 200 pt, and authored image height 300 pt:

```text
current remainder: insufficient
fresh page body: sufficient
result: fresh-page-required
next request on fresh page: place complete 300 pt image
```

For authored image height 701 pt:

```text
fresh page body: insufficient
result: blocked / atomic-block-exceeds-page-body
scale: not run
crop: not changed
decode: not run
```

Inline image is not part of this contract. It remains inside accepted Text-flow
line measurement.

## Failure And Recovery

- Invalid canonical nodes or available width block evidence.
- Zero-total Divider blocks to prevent no-progress content.
- Missing/empty/mismatched image binding blocks evidence.
- Horizontally oversized image blocks instead of scaling.
- Vertically oversized atomic content blocks instead of splitting.
- Stale evidence/cursor and tampered pagination block.
- Fresh-page retry with unchanged cursor and full body deterministically
  completes when the atomic extent fits.
- Inputs remain source-immutable and JSON-safe.

## Scale Evidence

Direct evidence creates, paginates, and adapts 1,000 independent Spacer nodes.
All windows complete deterministically and retain 1,000 distinct fingerprints
from distinct node/source-order identity.

Atomic work remains constant per node: at most one page attempt, one fragment,
and one cursor commit. This is core-contract evidence, not mixed-document or
artifact throughput evidence.

## Responsibility Boundary

Core owns canonical geometry conversion, resolved media ownership acceptance,
atomic fit/fresh/oversize policy, forced-page directive identity, common
projection, and diagnostics.

Core does not decode media bytes, inspect intrinsic dimensions, auto-scale,
crop, render, persist jobs, or mutate editor state.

Backend retains media byte access, job scheduling, durable cursor/window
retention, retries, storage, auth, and tenancy. Editor retains image/property
commands, progress/blocker UX, viewport, selection, and preview scheduling.
Renderer/export retains image decode and artifact commands while honoring the
accepted authored frame and page plan.

## PASS

- Utility and resolved block-image evidence is strict, compact, and immutable.
- Image moves whole to a fresh page and never auto-scales or splits.
- Page-break has an explicit forced-page effect and cursor progress.
- Divider/Spacer/Image emit one atomic placement when they fit.
- Oversize, stale, empty-media, width, and tamper failures are atomic.
- Utility/Media are the second and third common window producers after
  Text-flow.
- 1,000-node atomic scale passes with constant per-node work.

## FAIL / BLOCKER

- Columns, Table, and TOC do not yet emit common windows.
- No sequential composer consumes forced-page effects or atomic placements.
- No document page plan, authoritative heading-page map, renderer artifact,
  backend job, or editor integration exists.

## RISK

- Intrinsic media dimensions are intentionally ignored; authored frame truth
  must be validated by authoring/product policy before generation.
- Empty dynamic image policy currently blocks; future skip/placeholder behavior
  requires an explicit authored policy rather than adapter inference.
- Common `flowEffect` is new retained vocabulary and must be consumed exactly by
  the future composer.

## UNKNOWN

- Production image decode/memory profile and corrupt-byte behavior.
- Future explicit `scale-down`, placeholder, or skip policies.
- Mixed page-break/static-zone/page-number behavior in the real composer.

## Intentionally Not Changed

- canonical package/document and image schemas;
- resolved document/media registries;
- Text, Columns, Table, and TOC pagination;
- image frame/crop/fit authoring behavior;
- renderer/export, backend, and editor runtime behavior.

## Next Recommended Direction

Open the Columns/Table/TOC Common Adapter Readiness Lock. Compare their retained
page/cursor evidence, define the smallest honest per-page checkpoint additions,
and split implementation by family instead of forcing three incompatible
pagination results through one adapter patch.
