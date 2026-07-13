# Whole-Document V4 Composition Architecture Lock

Status: Phase 366 architecture lock. No composer runtime is activated by this
phase.

## Outcome

Whole-document v4 composition is a renderer-neutral core boundary that consumes
ordered, family-owned fragment windows and produces one authoritative document
page plan and heading-page map. It coordinates accepted layout evidence; it
does not measure text, split Table rows, reconcile Columns lanes, resolve field
values, decode media, render artifacts, persist jobs, or mutate editor state.

The term **Composition Node Family** means a group of authored block nodes with
the same composition behavior. It does not mean a CSS or font family.

Current core evidence is not sufficient to implement a correct composer yet.
Text-block lacks first-remainder and resumable pagination, utility/media blocks
lack isolated v4 fragment contracts, and current Columns/Table results do not
retain per-page resume checkpoints. This phase records those facts as
prerequisites instead of adapting incompatible output optimistically.

## Canonical Traversal

The source order is canonical document order:

1. document sections in array order;
2. each section's body zone in `zoneIds` order;
3. each body zone's direct `childIds` order; and
4. family-owned descendants remain internal to their root block.

Each section starts on a fresh document page in composition v1. This preserves
section page geometry, static-zone selection, and page-number ownership without
silently carrying remainder across incompatible page settings.

Header, footer, first-page-header, and first-page-footer zones are static
section inputs. They are attached to composed section pages through retained
static-zone evidence; they do not enter body flow or consume body remainder.

`column`, `table-row`, and `table-cell` are structural internals owned by their
root `columns` or `table` family. Composer traversal must never flatten them
into sibling body items.

## Composition Node Family Inventory

The canonical v4 schema has 12 authored block/structural node types. Composition
v1 exposes six families across eight body block types.

| Canonical node type | Composition role | Composition Node Family | Current evidence | Composer v1 status |
|---|---|---|---|---|
| `zone` | structural owner | none | canonical child order and role validation | structural input |
| `text-block` | body block; heading when role says so | `text-flow` | measured lines, bounded remainder/cursor pages, common adapter | PARTIAL: family window ready; no document composer |
| `columns` | body container root | `columns-flow` | first remainder, lane cursor, nested depth-three pages | PARTIAL: no per-page retained checkpoint |
| `column` | Columns internal | none | parent-owned lane cursor | internal only |
| `table` | body container root | `table-flow` | first remainder, row cursor, repeated headers, synchronized pages | PARTIAL: no per-page retained checkpoint |
| `table-row` | Table internal | none | parent-owned row cursor | internal only |
| `table-cell` | Table internal | none | synchronized cell candidates | internal only |
| `toc` | generated body block | `generated-flow` | measured rows, bounded partial cursor, one-page common adapter, final page resolution | PARTIAL: family window ready; no document composer |
| `page-break` | forced flow control | `utility-flow` | explicit forced-page effect and common window | PARTIAL: directive ready; no composer |
| `divider` | atomic measured block | `utility-flow` | exact pt geometry, atomic fit, common window | PARTIAL: family window ready; no composer |
| `spacer` | atomic measured block | `utility-flow` | exact height, atomic fit, common window | PARTIAL: family window ready; no composer |
| `image` | atomic measured block | `media-flow` | resolved owner/frame, atomic fit, common window | PARTIAL: family window ready; no decode/renderer/composer |

Inline `text`, `field-ref`, `page-number`, `line-break`, and `inline-image`
remain owned by `text-flow`; they are not independent composer items.

## Evidence Basis

- `src/schema/documentV4Target.ts` defines the 12 authored node types, canonical
  section/zone/container child references, and allowed child families;
  `tests/documentV4Target.test.ts` proves strict containment and body-only
  page-break policy.
- `src/schema/documentV4ImageTarget.ts` keeps inline image inside text-block
  grammar and block image as its own authored node; matching image-target tests
  prove source/frame/reference validation without body pagination.
- `paginateVNextTextBlockV4Lines(...)` in
  `src/pagination/textBlockV4Pagination.ts` accepts full page-body height and an
  optional start page only. `tests/textBlockV4Pagination.test.ts` proves its
  accepted full-page fragments and bounded scale; no first-remainder or cursor
  contract exists there.
- `paginateVNextTextFlowV4(...)` in
  `src/pagination/textFlowV4WindowPagination.ts` adds exact first remainder,
  bounded partial/resume, compact measurement ownership, and per-page cursor
  checkpoints without changing Phase 279. The adapter in
  `src/composition/textFlowFragmentWindowV1.ts` is the first retained common
  fragment-window producer; matching Phase 368 tests prove resume, failure,
  tamper rejection, source immutability, and 6,000-line/250-page scale.
- `paginateVNextColumnsV4(...)` in
  `src/pagination/columnsV4Pagination.ts` accepts first-page remainder and a
  lane cursor. `tests/columnsV4Pagination.test.ts` proves atomic longest-lane
  reconciliation and all-or-blocked output, while the result retains only
  cursor-before/cursor-after for the complete call rather than each page.
- `paginateVNextTableRowsV1(...)` in `src/table/tablePaginationV1.ts` accepts
  first-page remainder and a synchronized row cursor.
  `tests/tablePaginationV1.test.ts` proves split rows and repeated family-owned
  progress, while current page records retain no per-page cursor checkpoint.
- `paginateVNextTocV4(...)` in `src/toc/tocV4Pagination.ts` already exposes
  bounded partial/resume and first-page remainder.
  `tests/tocV4Pagination.test.ts` proves one-shot-equivalent resume;
  `src/toc/tocV4PageResolution.ts` proves final page-reference resolution does
  not rerun measurement or pagination.
- `src/pagination/measuredPagination.ts` and
  `tests/measuredPagination.test.ts` are document-v3 path evidence for utility,
  static-zone, and mixed-flow behavior. They are not canonical v4 composition
  input and must not be reused as the new runtime contract.
- `src/pagination/atomicBlockV4Evidence.ts`,
  `src/pagination/atomicBlockV4Pagination.ts`, and
  `src/composition/atomicBlockFragmentWindowV1.ts` retain exact Utility/Media
  geometry, resolved image ownership, atomic fit/fresh/oversize behavior, and
  explicit forced-page effects. Phase 369 tests prove no auto-scale/decode,
  stale/tamper failure, intentional blank-page directive facts, immutability,
  and 1,000-node scale.
- `docs/V4_INTEGRATED_DOCUMENT_STRESS_READINESS_CLOSE_AUDIT.md` records the
  missing integrated page count and production heading-page map that this
  architecture is intended to unlock.

## Family-Owned Fragment Window

Composer input must use a common strict contract produced by a family adapter.
The adapter validates and projects accepted family pagination; it must not move
family layout rules into the composer.

Each fragment window must retain at least:

- contract version and Composition Node Family;
- document, section, zone, root node, and source-order identity;
- compact source/measurement/pagination owner pins;
- requested page-body height and exact first-page available height;
- cursor before and cursor after, both pinned to the same owner;
- zero or more ordered page fragments with used and remaining height;
- fragment identity and family continuation facts;
- first-fragment heading identity when the root is a heading text-block;
- complete, partial, fresh-page-required, or blocked status;
- exact bounded work facts and structured issues.

The common window contains placement facts, not renderer commands. Family
payloads may retain typed references to accepted family evidence, but must not
copy content-sized fingerprints into every placement.

The composer never asks a window to fit a different remainder. If a supplied
window was planned for 120 pt and the current page has 100 pt, composition must
request a new family-owned window or block; it must not clip, scale, or repack
the existing result.

## Adapter Boundary

A Composition Node Family adapter owns four responsibilities:

1. accept only the exact family measurement/pagination result it understands;
2. validate root identity, owner pins, cursor continuity, capacity, and page
   geometry;
3. project accepted family pages into common fragment windows; and
4. report unsupported, stale, incomplete, or no-progress evidence atomically.

Adapters do not resolve external fields, measure text, paginate another family,
render, persist, retry, or choose editor policy. A higher orchestration loop may
request a family window and then call the pure composer, but the pure composer
does not call family paginators through hidden callbacks.

## Composer Input

The v1 request must pin:

- canonical document id and document-structure fingerprint;
- published/draft resolution snapshot as an upstream compact pin;
- ordered section descriptors and page-body geometry;
- static-zone evidence pins for each section;
- ordered body item descriptors with expected family and node identity;
- supplied family-owned fragment windows;
- cursor before, maximum output page count, and maximum placement count.

Missing required windows produce an explicit `needs-family-window` partial
result with the exact root node, family, cursor, and available height needed.
This is orchestration demand, not a guessed placeholder page.

## Composer Cursor

The first composer cursor version retains only bounded control state:

- document-structure and input-manifest compact pins;
- next section/body-item index;
- active root node/family and its opaque compact family cursor reference;
- next document page index;
- current page used/remaining body height;
- current section page index and first-page state;
- committed page-plan prefix fingerprint;
- complete flag.

The cursor must not embed measured lines, Table rows/cells, Columns lanes,
images, TOC entries, rendered bytes, or the complete page-plan prefix.

One-shot and any valid partial/resume sequence must produce byte-identical
pages, heading-page map, final cursor, summary, and final fingerprint.

## Document Page Plan

Each committed page records:

- zero-based `pageIndex` and one-based `pageNumber`;
- section id and zero-based section page index;
- exact page/body geometry and static-zone evidence references;
- ordered body placements;
- used and remaining body height;
- whether the page is an intentional blank page; and
- compact page fingerprint.

Each placement records root node id, Composition Node Family, family fragment
id/index, block offset, block extent, continuation direction, and compact
family evidence reference. Coordinates inside Columns/Table/Text/TOC remain in
family evidence and are not flattened into document-level placements.

The document plan is renderer-neutral. It does not contain DOM nodes, canvas
objects, SVG/PDF/DOCX commands, storage locations, job progress, or selection
state.

## Heading-Page Map

The page plan and heading-page map are committed by the same composition result
and share the same owner fingerprint. A heading maps to the page containing its
first accepted `text-flow` fragment.

Each entry records heading node id, section id, one-based page number,
document page index, and first source fragment id. Duplicate heading ids,
missing first fragments, source-order drift, or owner mismatch block the map;
the composer must not publish a partial map as authoritative.

TOC uses a two-stage contract:

1. semantic labels and capacity-bounded page-number geometry are measured and
   paginated before whole-document composition;
2. composition produces the authoritative heading-page map, after which final
   TOC page references resolve without relayout.

If field-backed TOC label materialization changes geometry, upstream
measurement and composition are invalidated. Final page resolution may not
silently reflow the TOC.

## Utility And Atomic Policy

- `page-break` always advances exactly one document page. At an empty body page
  it commits that page as an intentional blank page; consecutive breaks retain
  consecutive intentional blank pages.
- `divider`, `spacer`, and block `image` are atomic in composition v1.
- An atomic block that fits a fresh page but not the current remainder requests
  a fresh page.
- An atomic block that exceeds a fresh page body blocks composition with no
  partial placement for that block.
- Inline images remain part of measured `text-flow` lines and do not use the
  block `media-flow` adapter.

## Partial Commit And Failure

Page commit is atomic. A partial result may expose only complete committed pages
plus the exact cursor/window request required to continue. It must not expose a
half Table row, unreconciled Columns lane, clipped image, unresolved utility
placement, or authoritative partial heading map.

Required blocker classes include:

- document/manifest/cursor owner mismatch;
- missing, stale, unsupported, or capacity-mismatched family window;
- family cursor chain break or duplicate fragment identity;
- invalid section/page geometry or static-zone ownership;
- fragment extent drift, negative remainder, or family page-order drift;
- unsupported family/root pairing;
- atomic block larger than a fresh body page;
- family or composer no-progress;
- page/placement/work limit exceeded; and
- heading first-fragment/map inconsistency.

Blocked results retain cursor-before and issues but no cursor-after, new pages,
or heading-page map. Accepted inputs remain immutable.

## Invalidation And Reuse

Composition invalidation starts at the earliest body item whose structure,
family evidence, section geometry, or static-zone pin changed. Pages strictly
before the affected page may be reused only when their compact page and owner
pins still match.

Page-tail reuse is an optimization, not a v1 correctness dependency. A later
phase may stop recomposition when a new checkpoint exactly matches an old
checkpoint across body index, active family cursor, page remainder, section
state, and owner pins. Whole-result fingerprint equality alone is insufficient.

## Responsibility Boundary

Core owns canonical traversal, strict common contracts, adapter validation,
pure composition, cursor semantics, document page-plan identity, heading-page
map identity, diagnostics, and invalidation facts.

Backend later owns job scheduling, durable cursor/page-plan retention, retries,
expiry, authorization, tenancy, and artifact storage.

Editor later owns commands, progress/blocker presentation, viewport
virtualization, selection/caret behavior, preview scheduling, and undo UX.

Renderer/export later owns conversion of accepted page/family evidence into
preview, PDF, or DOCX bytes without changing accepted pagination.

## Implementation Phases

1. **Common fragment-window contract (Phase 367 implemented):** strict
   types/parser, compact ownership, per-page cursor checkpoints,
   request/result vocabulary, and invalid fixtures:
   `docs/WHOLE_DOCUMENT_V4_COMMON_FRAGMENT_WINDOW_CONTRACT.md`.
2. **Text-flow remainder/cursor contract (Phase 368 implemented):** exact first
   remainder, bounded partial resume, compact owner pins, per-page checkpoints,
   one-shot equivalence, and the first common adapter:
   `docs/WHOLE_DOCUMENT_V4_TEXT_FLOW_REMAINDER_CURSOR.md`.
3. **Utility/media atomic contracts (Phase 369 implemented):** page-break,
   divider, spacer, resolved block-image evidence, atomic pagination, forced
   page effect, and common adapters:
   `docs/WHOLE_DOCUMENT_V4_UTILITY_MEDIA_ATOMIC_FRAGMENTS.md`.
4. **Columns/Table/TOC adapters:** retain per-page checkpoints or bounded
   windows without moving their family semantics.
5. **Sequential pure composer:** canonical section/body order, remainder,
   partial demand, atomic page commit, and exact work.
6. **Heading-page map and TOC cycle:** first-fragment map produced with the
   page plan and final no-relayout TOC resolution.
7. **Invalidation, scale, failure/recovery, and cross-repo gates.**

## PASS

- Canonical node inventory maps each authored type exactly once.
- Structural owners/internals are separated from six Composition Node Families.
- Family semantics remain owned by existing subsystems.
- The common fragment-window contract now retains compact ownership, exact
  capacity, and per-page progressing cursor checkpoints.
- Input, cursor, output, heading-map, partial, failure, and ownership boundaries
  are locked before runtime implementation.
- Existing capability gaps are explicit and prevent premature activation.

## FAIL / BLOCKER

- No family adapter emits the retained common fragment-window contract yet.
- Text-flow has no whole-document composer consumer yet.
- Columns/Table lack retained per-page checkpoints for bounded composition.
- Utility/Media have no whole-document composer consumer yet.
- No pure whole-document composer or authoritative production heading map
  exists.

## RISK

- Family adapters can become a second pagination engine if projection and
  validation responsibilities are not kept narrow.
- Content-sized owner strings can reintroduce the retained-output amplification
  discovered by integrated TOC stress.
- A page-tail reuse shortcut can accept stale output unless every continuation
  and remainder checkpoint matches.
- TOC field materialization can create a second composition cycle when label
  geometry changes.

## UNKNOWN

- Production memory/time ceilings for mixed 200-300 page documents.
- Final static-zone artifact contract and page-number field cycle.
- Whether future rowSpan, text wrap around media, footnotes, or floating objects
  require new families or a later composition mode.
- Durable cursor expiry and packed-package performance.

## Intentionally Not Changed

- package/document schemas and node grammar;
- family measurement, pagination, rendering, and impact implementations;
- document v3 measured pagination and renderer paths;
- field/materialization and published-version policy;
- backend routes, storage, workers, auth, and tenancy;
- editor canvas, DOM, viewport, input, selection, history, and WYSIWYG runtime.

## Next Recommended Direction

Open the Columns/Table/TOC Common Adapter Readiness Lock. Compare retained page
and cursor evidence, specify the smallest honest per-page checkpoint additions,
and split implementation by family before the sequential composer.
