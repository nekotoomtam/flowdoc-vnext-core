# Core layout runtime retirement

## Authority Boundary

Owner repository: Core. Scope: the nine retired layout sources, public API
absence, and their repository-local regression evidence. This is code-adjacent
documentation, not FlowDoc-wide status, compatibility promotion, release
readiness, Editor/Backend readiness, or map truth. Project Control governs the
decision in `docs/domains/core-v1-closeout-plan-2026-09-05.md` (D1/D2), under
`flowdoc-product-development-resumption > flowdoc-frontend-expert-roadmap`,
Phase `phase-core-v1-runtime-retirement`, Checklist
`checklist-core-v1-runtime-retirement`, Evidence target
`evidence-core-v1-runtime-retirement-2026-09-05`.

## Runtime boundary

The retired sources under `src/layout/` are:

- `textBlockUnifiedLayoutRootV1.ts`
- `textBlockUnifiedLayoutRootContractV1.ts`
- `textBlockUnifiedLayoutRootAuthorityInternalsV1.ts`
- `textBlockUnifiedLayoutSceneV1.ts`
- `textBlockUnifiedLayoutSceneContractV1.ts`
- `textBlockAuthoredBoxGeometryV1.ts`
- `textBlockSpatialWrappingLayoutV1.ts`
- `textBlockSpatialIndexV1.ts`
- `textBlockFlowRegionProviderV1.ts`

The RootV1/SceneV1 public exports are removed. Consumers use the retained V2
boundaries. This is deliberate old-API retirement, not backward compatibility
for the removed entrypoints. Shared V1-named kernels, initial-flow, multi-run,
source, transaction, line-tree, and work-policy contracts are separate retained
dependencies. No package schema version is retired by this change.

Historical Phase 5A/5B manifests retain their original bytes and phase-local
claims. Their old non-retirement or compatibility fields describe those
historical phases; current runtime absence is checked separately. Native/WASM
artifacts and the historical compatibility fixture are retained unchanged.

## Root and Scene evidence replacement matrix

Baseline for every old test reference below:
`e3b9888b25fe963ef4316fe8066d086bae55db47`. Paths in the table are under `tests/`.
Retired-only dispositions remove promises about an API that no longer exists;
they do not claim the old API still works. Shared obligations remain executable.

| Old evidence / obligation | Retained evidence or explicit disposition |
| --- | --- |
| `textBlockUnifiedLayoutRootV1.test.ts`: exact mixed dependency chain; reusable fixture; 20 content/alignment/exclusion/barrier/requery rows | `textBlockUnifiedLayoutRetirementV2.test.ts` retains all 20 rows through the V2 public boundary and checks source/flow/line/Scene identities and closed capabilities. `textBlockUnifiedLayoutGeometryV2.ts` constructs direct V2 children for existing line-tree/Scene/delivery assertions. |
| Same: first ordered RootV1 stage failures; undefined/fixed-height/accessor/symbol/class/proxy envelopes | Old RootV1 stage-specific codes retire with that wrapper. `textBlockUnifiedLayoutRootV2.test.ts` retains closed-null rejection including hostile envelopes, production flags, cloned sources, bad entries, fixed-height extras, and unrecognized work policies. |
| Same: unresolved inline-image evidence | Retained `textBlockUnifiedLayoutRootV2.test.ts` “keeps unresolved inline-image material behind the evidence gate”. |
| Same: unregistered candidates/clones/foreign children; constant top-level registration; nested accessor registration; accessor proxy inspection | Old V1 registration API retires. RootV2 atomic registration and eight-dependency inspection tests remain; `textBlockUnifiedLayoutRetirementV2.test.ts` rejects replaced/cloned/refingerprinted root and child objects. No copied V1 registrar survives. |
| Same: direct Phase 4B and normalized V1 text-only geometry | V2 authored-geometry projection tests remain. SpatialWrappingV2 retains a frozen independent old text-only reference; RootV2 retains the five old layout counts/dimensions below. |
| `textBlockUnifiedLayoutRootAdversarialV1.test.ts`: clone/equal replacement/reordered Scene/mutable wrapper/refingerprinted clone; every foreign retained child | V1-specific shell/Scene registration retires. The V2 retirement corpus tests reject substituted roots/children; `textBlockPersistentSceneV2.test.ts` rejects clone/foreign pairing/accessors; `textBlockSceneDeliveryV2.test.ts` retains reordered/foreign/refingerprinted delivery and identity rejection. |
| Same: foreign Initial Flow/evidence and unsafe spatial entries | Existing RootV2 closed-null rejection and SourceState/SpatialIndexV2 authority tests remain. |
| Same: accessor/class/symbol/throwing proxy/present undefined production input | RootV2 closed-null hostile-envelope rows retain these input classes and zero getter reads. |
| Same: attempted mutation does not invalidate original authority | V2 retirement corpus checks failed mutation and continued valid original Root authority. |
| `textBlockUnifiedLayoutRootScaleV1.test.ts`: short/long text and mixed fingerprints; constant wrapper work; real 128-entry treap pruning; no duration in semantic records | Migrated to `textBlockUnifiedLayoutRootScaleV2.test.ts`: independently constructed equivalent sources retain deterministic V2 Root/Scene fingerprints, counts/payload scale, constant eight-dependency inspection, complete-build work facts, and direct V2 spatial query pruning. These determinism assertions are not substitutes for old/V2 parity. |
| `textBlockUnifiedLayoutSceneV1.test.ts`: clone-safe mixed projection; text/image/mixed rows; distinct hard-break chunks and chain order | Retained current `textBlockPersistentSceneV2.test.ts` exact clone-safe chunks, text/image identities and chunk ordering; the former Root corpus retains content variants. Old SceneV1 absolute-coordinate wire shape retires. |
| Same: non-authoritative/accessor envelopes; clone/reordered/refingerprinted authority | PersistentSceneV2 and SceneDeliveryV2 descriptor-safe provenance, foreign pairing, reordered chunks/scripts and refingerprinted identity rejection remain. Old SceneV1 WeakSet registration retires. |
| `liveDraftMr1UnifiedLayoutRoot5a.test.ts`: exact public export list, privileged helper absence, public construction/inspection, closed capabilities and production/fixed-height rejection | Same file now tests V2 public construction/inspection/rejection, exact retained exports and explicit old export/source absence. |
| `textBlockUnifiedLayoutRootV2.test.ts`: RootV1/SceneV1 non-use spies | Successful V2 bootstrap remains; public-boundary test additionally requires the five old source files to be absent. There is no runtime available for a hidden old construction call. |
| Same: normalized Phase 5A reference comparison | Frozen old RootV1 expected facts captured before removal: 2 lines, 2 text fragments, 1 image fragment, outer width 100,000,000 and outer height 32,000,000 layout units. Test uses literal expected values, never another V2 result as the old oracle. |
| `textEngineFlowEvidenceNodeWasmV2.test.ts`: native/WASM Root parity | Same independent native and WASM producer evidence comparison, now through RootV2. Complete root objects and Scene/Root fingerprints remain compared. |
| `textBlockPersistentLayoutLineTreeV1.test.ts`, `textBlockPersistentSceneV2.test.ts`, `textBlockSceneDeliveryV2.test.ts`: old Root setup | Direct V2 geometry fixture replaces old Root setup; existing source, geometry, work, fingerprint, provenance and delivery assertions remain. |
| `helpers/textBlockUnifiedLayoutRootV1.ts`: repeated source-only factory | Factory body retained in `helpers/textBlockUnifiedLayoutSource.ts`; source-only consumers change import path only. Old accepted RootV1 factory retires. |
| `liveDraftMr1UnifiedIncrementalRoot5b.test.ts`: old public retention assertions and historical manifest facts | Current assertions require absent old functions. Historical manifest expectations remain explicitly historical; fixture bytes are unchanged. |

## Four-wrapper evidence replacement matrix

The historical `tests/fixtures/text-block-v1-layout-compatibility.v1.json`
remains byte-for-byte unchanged, with SHA-256
`a886e21c5eb30ed19171b8c88bf60cf8aff550939e371b9176e2f2a1dc9a1f96`.
Historical fingerprints and rejection records remain historical facts; they do
not grant process-local V2 authority or promise old wrapper error codes on V2.
The current V2 geometry tests compare against those independent old facts.

| Old evidence / obligation | Retained evidence or explicit disposition |
| --- | --- |
| `textBlockAuthoredBoxGeometryV1.test.ts`: accepted identity/immutability, clones/refingerprints, equivalent fingerprints and top-inset sensitivity | Existing `textBlockAuthoredBoxGeometryV2.test.ts` authority/projection tests plus `textBlockAuthoredBoxRetainedGeometryV2.test.ts` deterministic fingerprints, inset sensitivity and ordered rejection. |
| Same: zero inset, one-line/no-exclusion geometry | `textBlockV1LayoutCompatibility.test.ts` compares V2 geometry/source ranges against unchanged historical no-exclusion/middle-exclusion facts. `textBlockSpatialWrappingLayoutV2.test.ts` uses frozen pre-retirement V1 normalized text-only geometry. |
| Same: authored origin/insets once, exact width, overlay extent, multi-interval source/range translation, barrier before box origin | `textBlockAuthoredBoxRetainedGeometryV2.test.ts` retains exact inset/width/multi-interval/barrier cases; existing AuthoredBoxGeometryV2 overlay extent assertions remain. |
| Same: move composition and second-deepest extent after shrink | Existing AuthoredBoxGeometryV2 moved-index reprojection and SpatialIndexV2 move/resize tests; full two-entry before/after shrink case migrated to AuthoredBoxRetainedGeometryV2 with independent expected 70/55 million maximum bottoms and 74/59 million outer heights. |
| Same: invalid authored point/width, translated-y overflow and outer-height overflow | `textBlockRetainedGeometryKernelsV1.test.ts` checks the retained shared kernels directly with independent failure codes and closed-null output. |
| Same: unsupported text-only Initial Flow capabilities, old request-shaped validation/accessors/production flags, initial-flow binding codes and spatial-blocker message formatting | V1-only wrapper/request restrictions and message formatting retire with that API. Current V2 exact-envelope/authority/capability checks remain in AuthoredBoxGeometryV2 and SpatialWrappingV2. AuthoredBoxRetainedGeometryV2 explicitly checks production, tree and index rejection order; the original raw V1 error facts remain byte-pinned. |
| `textBlockSpatialIndexV1.test.ts`: deterministic immutable tree, ordinal code-unit ordering including combining characters | `textBlockSpatialIndexRetainedV2.test.ts` retains independent equivalent input orderings, frozen tree/fingerprint equality and explicit expected ordinal ordering. Existing SpatialIndexV2 tests retain exact authority and closed capabilities. |
| Same: duplicate/blank IDs, malformed owner, unsupported wrap, unsafe integer, zero dimensions, clearance boundary, addition overflow, horizontal overflow, extra key | Same invalid-entry table in SpatialIndexRetainedV2 with closed-null indexes and independent expected codes. Extra-key rejection uses V2's existing `invalid-input` exact-envelope precedence; other retained semantic codes remain asserted. |
| Same: 1,024-entry narrow half-open query, max-bottom pruning and boundary exclusion | SpatialIndexRetainedV2 checks exact result IDs, excluded adjacent band and visited-node count below total. RootScaleV2 also retains a real 128-entry query. |
| Same: V1 query invalid-band/identity/stale wrapper result | V1 query envelope retires. Current public band/identity checks remain in FlowRegionProviderV2 and FlowRegionRetainedV2; retained V2 internal query delegates to the shared kernel. |
| `textBlockFlowRegionProviderV1.test.ts`: seven deterministic interval/barrier/overlay/event rows, zero-query fast path, insets/bands/identity/refingerprint rejection | `textBlockFlowRegionRetainedV2.test.ts` and existing FlowRegionProviderV2 retain these facts. Fixture uses 100-point content rather than the old 200-point content minus 100-point inset; explicit expected intervals remain independent. |
| `textBlockSpatialWrappingLayoutV1.test.ts`: one-line geometry/no-exclusion, break-safe middle groups, left/right/multiple exclusions, full barrier/overlay/zero-space advancement | Frozen V1 text-only geometry in SpatialWrappingV2; exact three-group/two-interval placement retained directly in RetainedGeometryKernelsV1; current interval/exclusion placement and blocking-advance cases; historical middle-exclusion geometry/source facts in compatibility test. |
| Same: zero-paint hard break, expanded tall band and monotonic candidate height after tall group moves | SpatialWrappingV2 retains field/image/page-break source and hard-break coverage, image-expanded requery and mixed-text sizing. RetainedGeometryKernelsV1 asserts exact two-line ranges, y positions, monotonic heights and requery work. |
| Same: foreign tree/index, production binding, unsafe y, oversized group, cloned/refingerprinted output | Existing SpatialWrappingV2 closed-null authority/overflow/oversized/clone tests remain. Old wrapper-specific result shape retires. |
| Same: move/resize composition without replacing flow tree | Existing SpatialIndexV2 move/resize provider checks and AuthoredBoxGeometryV2 moved-index reprojection remain. |
| IndexV1, ProviderV1 and WrappingV1 AST delegation/metamorphic lexical guards | Assertions about the deleted wrapper source retire. Shared algorithm bodies remain unchanged; direct shared-kernel and current V2 behavioral tests retain the algorithm obligations. This does not claim the obsolete lexical mutation harness still executes. |
| `helpers/textBlockAuthoredBoxGeometryV1.ts` | Migrated to `helpers/textBlockAuthoredBoxGeometryV2.ts`, using current flow evidence/tree/index authority for historical source geometry. |
| Shared provider type dependencies | `VNextTextBlockFlowIntervalV1`, `VNextTextBlockFlowRegionIssueCodeV1`, and `VNextTextBlockFlowRegionWorkV1` move unchanged into `src/layout/textBlockFlowRegionContractInternalV1.ts`; four shared import paths change only. |

## Verification boundary

Use focused RootV2, PersistentSceneV2, SceneDeliveryV2, PersistentLayoutLineTreeV1,
SpatialWrappingV2, native/WASM producer and affected helper tests, then the full
Core `npm run check`. A clean dedicated worktree does not repair missing files
in another checkout or establish Editor setup/Creator readiness. Project Control
accepts the owner handoff and owns integration and shared reporting.
