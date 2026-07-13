# Sequential Whole-Document V4 Contracts

Status: Phase 380 implemented. Sequential scheduling remains inactive.

## Outcome

Phase 380 implements the strict retained contracts required by the Phase 379
sequential composer architecture:

- immutable canonical manifest and exact family demand;
- compact composer cursor;
- separately fingerprinted bounded open-page checkpoint; and
- append-only closed-page chunks with a deterministic prefix chain.

These contracts establish safe state and recovery boundaries. They do not yet
consume common family windows, place fragments, advance sections, finalize a
whole page plan, or produce an authoritative heading-page map.

## Public Modules

The package root exports three responsibility-focused modules:

- `src/composition/documentCompositionManifestV1.ts` owns manifest, section,
  body-item, stable-owner, page-geometry, static-zone, and demand contracts;
- `src/composition/documentCompositionPageV1.ts` owns document placements,
  open pages, closed pages, and closed-prefix fingerprints; and
- `src/composition/documentCompositionCursorV1.ts` owns compact control state
  and exact manifest/cursor/open-page state validation.

No module imports backend, editor, DOM, renderer, storage, or legacy runtime
state.

## Canonical Manifest

`finalizeVNextDocumentCompositionManifestV1(...)` and
`parseVNextDocumentCompositionManifestV1(...)` retain:

- canonical document and resolved-projection compact fingerprints;
- one or more contiguous section descriptors;
- exact point-based page/body geometry;
- unique static-zone roles and ids per section;
- contiguous direct body-item descriptors in section/zone/source order;
- all six common family/root pairings;
- explicit `headingLevel` or `null` on each body root;
- stable family-source and measurement owners;
- exact incomplete initial family cursor references; and
- explicit document, placement, and open-page placement limits.

Body items pin stable owners only. Pagination fingerprint is deliberately not a
manifest field because each short-remainder/fresh-page request owns a distinct
accepted pagination result.

Manifest finalization rejects section gaps, duplicate section/root/static-zone
identity, geometry outside the page, body-item canonical-order drift,
family/root mismatch, stale document/projection owners, invalid initial cursor,
and an open-page limit larger than the document placement limit.

## Exact Demand

`finalizeVNextDocumentCompositionDemandV1(...)` and
`parseVNextDocumentCompositionDemandV1(...)` retain the exact body item,
manifest, stable owners, incomplete family cursor-before, page-body height,
first-page available height, and bounded family page/fragment budget.

Demand rejects family/root drift, family cursor owner/completion drift, and a
first-page capacity larger than the body. Phase 381 will derive this contract
from validated state and compare it with one supplied common window.

## Open Page

The open-page checkpoint retains only one current page:

- document/manifest/section identity;
- page and section-page indexes;
- section geometry and static-zone references;
- ordered document-level placements;
- used and remaining body height;
- intentional-blank state;
- prior closed-prefix fingerprint and counts; and
- a compact fingerprint over all facts.

Placement facts retain item/root/family identity, common fragment identity,
document block offset/extent, continuation, a family evidence fingerprint, and
optional first-fragment heading identity. Orchestration-window identity is not
authoritative page content. Placements do not flatten
Text, Columns, Table, TOC, Utility, or Media internal geometry.

Open-page finalization rejects page-number/index drift, body-height drift,
geometry outside the page, prefix count/owner drift, static-zone duplication,
family/root mismatch, placement gaps in indexes, overlap/out-of-page extent,
duplicate fragment ids, invalid/duplicate heading identity, and non-empty
intentional blank pages.

## Closed Page Prefix

A closed page has the same validated page facts plus one exact close reason:

- `family-page-boundary`;
- `family-continuation`;
- `fresh-page-required`;
- `page-break`;
- `section-boundary`; or
- `document-complete`.

Finalization first hashes the closed-page facts and then hashes
`{ previous, page }` into `closedPagePrefixFingerprint`. Page zero must begin
with a null previous prefix; every later page must retain one. An intentional
blank close is accepted only for `page-break` and only with zero placements and
zero used height.

Parsing recomputes both the page fingerprint and prefix fingerprint. A valid
shape with changed geometry or chain identity is still rejected.

## Compact Cursor

`finalizeVNextDocumentCompositionCursorV1(...)` and
`parseVNextDocumentCompositionCursorV1(...)` retain:

- document and manifest identity;
- section/body-item indexes;
- optional active root and opaque family cursor;
- next page and current open-page position;
- exact open-page fingerprint;
- closed-prefix fingerprint/counts;
- cumulative family pages, placements, completed items, page advances, and
  cursor commits; and
- complete state plus a deterministic cursor fingerprint.

Incomplete cursors require one open page. Complete cursors require no active
root/open page and exact equality between next-page index and closed-page
count. Active roots must own the current item and an incomplete family cursor.
Completed-item work must equal the current body-item index.

The cursor contains no measured lines, Table rows/cells, Columns lanes, TOC
rows, media payloads, complete page prefix, or heading map.

Schedule-dependent accepted-window count is transition work only. It is not
retained in the cursor because one-shot and valid resumed schedules may use a
different number of windows while reaching the same semantic page/cursor end
state.

## State Acceptance

`parseVNextDocumentCompositionStateV1(...)` first parses every retained
envelope independently, then validates their relationships:

- cursor document/manifest ownership;
- section/body-item bounds and terminal coverage;
- exact open-page fingerprint, index, geometry, and static-zone owner;
- exact closed-prefix fingerprint and cumulative counts;
- exact current-page used/remaining geometry;
- closed plus open placement work equality;
- manifest page/open-page/document placement limits; and
- active root/item/family/measurement ownership.

Re-fingerprinting one stale component does not bypass state acceptance because
the relationship checks compare the independently valid envelopes.

## Fingerprints And Immutability

Every retained contract uses browser-safe compact SHA-256 and strict Zod
objects. Finalizers clone normalized input and do not mutate caller data.
Parsers strip only retained fingerprint envelope fields, recompute normalized
facts, and reject unknown properties or fingerprint mismatch.

The closed-page prefix is append-only. The open-page checkpoint is separately
bounded and referenced by the compact cursor; it is not copied into the cursor.

## Boundedness

Static schema ceilings are:

- 10,000 sections;
- 100,000 body items;
- four static zones per section;
- 100,000 placements on one page;
- common-window ceilings of 10,000 family pages and 100,000 fragments per
  demand; and
- explicit manifest limits up to 1,000,000 document pages and 10,000,000
  document placements.

Each manifest selects smaller operational limits. Phase 381 must check all
remaining transition budgets before accepting a family window.

## PASS

- Manifest, demand, cursor, open-page, and closed-page contracts are strict,
  compact, deterministic, JSON-safe, and public.
- All six common family/root pairs are accepted at the manifest boundary.
- Open-page state is separate from the compact cursor and page prefixes are
  append-only.
- Re-fingerprinted owner drift is blocked by whole-state validation.
- Focused contract tests and core type-check pass.

## FAIL / BLOCKER

- No common family window is consumed by these contracts yet.
- No sequential transition advances body items or sections yet.
- No authoritative whole-document page plan or heading-page map exists yet.
- Backend/editor/renderer consumers remain inactive.

## RISK

- Phase 381 must validate a supplied window against exact demand before any
  placement is projected.
- Transition code must not duplicate the semantic checks already owned here.
- A caller that persists cursor without its exact open page cannot resume.
- Full-plan finalization must validate every closed-prefix link, not only the
  terminal fingerprint.

## UNKNOWN

- Production mixed-family cursor/open-page transaction size.
- Final static-zone artifact and page-number field cycle behavior.
- Empty Table policy before manifest construction.
- Durable backend retention and expiry policy.

## Files Changed

- `src/composition/documentCompositionManifestV1.ts`
- `src/composition/documentCompositionPageV1.ts`
- `src/composition/documentCompositionCursorV1.ts`
- `src/index.ts`
- `tests/documentCompositionManifestV1.test.ts`
- `tests/documentCompositionPageV1.test.ts`
- `tests/documentCompositionCursorV1.test.ts`
- `tests/sequentialWholeDocumentV4Contracts.test.ts`
- `docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_CONTRACTS.md`
- `README.md`
- `docs/CROSS_REPO_OPERATING_MAP.md`
- `docs/PHASE_LEDGER.md`

## Behavior Changed

Core now exposes inactive retained state contracts for future sequential
composition. Existing family pagination, common windows, consumers, rendering,
and export behavior do not change.

## Tests Run

- focused manifest/demand/page/cursor/state tests;
- focused Phase 380 documentation contract test;
- core type-check; and
- full core test suite.

## Risks Left

Window acceptance, scheduling, fresh/partial recovery, finalization, scale, and
consumer integration remain separate phases.

## Intentionally Not Changed

- canonical document/node/field/media schemas;
- common fragment-window or family adapter contracts;
- family measurement and pagination semantics;
- backend scheduling, storage, routes, jobs, auth, or retries;
- editor canvas, DOM, selection, history, viewport, or WYSIWYG runtime; and
- renderer, PDF, DOCX, preview, or artifact output.

## Next Recommended Direction

Implement Phase 381 ordered bounded scheduling. Derive exact demand from one
validated manifest/cursor/open-page state, accept at most one matching common
family window, and project only already accepted family geometry into the open
page and append-only closed-page chunks.
