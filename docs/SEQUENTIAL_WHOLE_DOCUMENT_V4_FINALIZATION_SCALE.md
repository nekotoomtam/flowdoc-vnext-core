# Sequential Whole-Document V4 Finalization And Scale

Status: Phase 383 implemented. Consumer activation remains closed until the
Phase 384 readiness and cross-repo gate.

## Outcome

Phase 383 converts a complete terminal cursor plus ordered closed-page chunks
into one authoritative renderer-neutral document page plan and one
authoritative heading-page map. Both outputs share one compact composition
owner fingerprint.

It also composes and finalizes a 250-page synthetic document through the real
sequential transition across all six common families. No renderer, artifact,
backend scheduler, persistence, or editor presentation is activated.

## Manifest Heading Declaration

Each manifest body item now declares `headingLevel: 1..6 | null`. Only a
`text-flow`/`text-block` root may declare a heading.

The transition requires the initial accepted content window for a declared
heading to expose exactly one matching first-fragment heading identity. A
non-heading root or resumed family cursor must expose none. Fresh and blocked
windows carry no heading placement.

This declaration lets finalization distinguish an ordinary Text-block from a
missing heading first fragment without guessing from node type.

## Public Finalizer

`src/composition/documentCompositionFinalizerV1.ts` exports:

- strict page-plan source/version/result types;
- `parseVNextDocumentCompositionPagePlanV1(...)`; and
- `finalizeVNextDocumentCompositionV1(...)`.

Finalization accepts the exact manifest, one terminal cursor, and ordered
closed-page chunks. It does not accept an open page or incomplete cursor.

## Closed Prefix Validation

The finalizer parses every closed-page envelope independently, then performs
one linear chain pass over:

- document page index/number order;
- previous and current closed-prefix fingerprints;
- cumulative page/placement/heading counts;
- section and section-page order;
- exact manifest section geometry/static-zone owners;
- exact manifest body-item/root/family owners;
- canonical placement order;
- root-scoped fragment uniqueness;
- heading level, identity, order, and complete declared coverage; and
- terminal prefix/cumulative semantic work equality.

Missing, reordered, duplicated, stale, re-fingerprinted, or owner-drifted pages
block the complete result. The finalizer never publishes a partial plan or map.

## Authoritative Page Plan

The complete plan retains:

- document/manifest/terminal-cursor identity;
- final closed-prefix fingerprint;
- one compact `compositionFingerprint`;
- ordered immutable closed pages;
- exact page, placement, heading, intentional-blank, and section counts; and
- one compact plan fingerprint.

The standalone parser revalidates retained page envelopes, order, prefix chain,
summary, composition owner, and plan fingerprint. Manifest-specific heading and
owner checks remain in authoritative finalization where the manifest exists.

## Authoritative Heading Map

Heading entries are derived only from accepted page placements carrying the
declared first-fragment identity. Each entry retains heading node, section,
source fragment, document page index, and one-based page number.

The map's `documentPaginationFingerprint` equals the page plan's
`compositionFingerprint`. Heading-map fingerprints are now compact SHA-256
rather than content-sized serialized JSON. Existing final TOC page-reference
resolution continues to consume the complete map without measurement,
pagination, relayout, rendering, persistence, or authored mutation.

Duplicate, missing, out-of-order, wrong-level, or out-of-range headings block
both plan and map publication.

## Mixed-Family Scale

The Phase 383 scale fixture builds 250 canonical body roots in repeating order:

1. `text-flow` Text-block;
2. `columns-flow` Columns;
3. `table-flow` Table;
4. `generated-flow` TOC;
5. `utility-flow` Divider; and
6. `media-flow` block Image.

Each accepted root occupies one 100 pt page. The next root first receives zero
remainder, emits valid fresh-page demand, then commits on the fresh page. The
complete run proves:

- 500 pure calls including initialization;
- 250 accepted family pages and placements;
- 250 ordered closed pages;
- 42 declared heading destinations;
- exact terminal page/placement/heading/work counts;
- cursor below 2.5 KB;
- open-page checkpoint below 3.5 KB;
- common window below 7 KB;
- authoritative page plan below 1.5 MB; and
- heading-page map below 20 KB.

The test uses the real manifest, common-window finalizer, sequential transition,
closed-page contracts, cursor, and authoritative finalizer. It does not insert
a synthetic page count after composition.

## Failure Evidence

Focused adversarial tests prove:

- a missing final page cannot match terminal prefix;
- reordered pages fail page order and prefix chain;
- a re-fingerprinted static-zone page still fails manifest ownership;
- removing a declared heading first fragment fails complete coverage before
  any partial map is published; and
- retained plan summary/fingerprint tampering fails standalone parsing.

Accepted source manifest, cursor, and pages remain immutable. Repeating the
same finalization produces byte-identical plan and map.

## PASS

- One authoritative plan and heading map are produced from real closed pages.
- Plan and map share one compact composition owner.
- Declared headings have exact first-fragment coverage and page destinations.
- Final TOC resolution remains no-relayout.
- Missing/reordered/re-fingerprinted/tampered evidence blocks atomically.
- Six-family 250-page scale passes with bounded retained state.

## FAIL / BLOCKER

- Backend does not schedule or persist composer transitions/chunks yet.
- Editor does not present progress, blockers, or authoritative pages yet.
- Renderer/export does not consume the page plan yet.
- Empty Table product policy remains upstream of manifest construction.
- Phase 384 full cross-repo readiness gate is not closed yet.

## RISK

- Production backend transactions must retain cursor, open page, and emitted
  closed pages atomically.
- A consumer must not rebuild family geometry from document placements.
- Static-zone artifact and page-number fields may add a later bounded cycle.
- Production 200-300 page content can have more placements per page than the
  one-placement scale fixture.

## UNKNOWN

- Production memory/time ceilings with real measured family evidence.
- Durable chunk retention, retry expiry, and transaction sizing.
- Final PDF/DOCX/static-zone consumer contract.
- Future rowSpan, footnotes, floats, and text wrap around media.

## Files Changed

- `src/composition/documentCompositionManifestV1.ts`
- `src/composition/documentCompositionTransitionV1.ts`
- `src/composition/documentCompositionFinalizerV1.ts`
- `src/toc/tocV4ResolutionInputs.ts`
- `src/index.ts`
- `tests/helpers/documentCompositionV1Fixture.ts`
- `tests/documentCompositionManifestV1.test.ts`
- `tests/documentCompositionCursorV1.test.ts`
- `tests/documentCompositionTransitionV1.test.ts`
- `tests/documentCompositionFinalizerV1.test.ts`
- `tests/documentCompositionScaleV1.test.ts`
- `tests/tocV4ResolutionInputs.test.ts`
- `tests/sequentialWholeDocumentV4FinalizationScale.test.ts`
- `docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_CONTRACTS.md`
- `docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_FINALIZATION_SCALE.md`
- `README.md`
- `docs/CROSS_REPO_OPERATING_MAP.md`
- `docs/PHASE_LEDGER.md`

## Behavior Changed

Core now produces an authoritative complete page plan and heading-page map from
terminal sequential composition. Heading-map fingerprints become compact.
Existing backend/editor/renderer behavior remains unchanged and inactive.

## Tests Run

- focused finalizer/plan/map/tamper tests;
- focused 250-page six-family scale test;
- focused TOC heading-map regression test;
- focused Phase 383 documentation contract test;
- core type-check; and
- full core test suite.

## Risks Left

Full cross-repo compatibility/readiness, production consumers, real evidence
performance, and artifact integration remain open.

## Intentionally Not Changed

- canonical document/node/field/media schemas;
- family measurement/pagination/common-window internals;
- backend scheduler, persistence, routes, jobs, auth, retries, or storage;
- editor canvas, DOM, selection, history, viewport, or WYSIWYG runtime;
- renderer, PDF, DOCX, preview, or artifact output; and
- final TOC geometry or relayout policy.

## Next Recommended Direction

Run Phase 384 sequential composer readiness close. Execute full core, editor,
and backend gates; audit public exports and stale historical blocker claims;
record remaining consumer boundaries; and only then select backend durable
scheduling as the next major topic.
