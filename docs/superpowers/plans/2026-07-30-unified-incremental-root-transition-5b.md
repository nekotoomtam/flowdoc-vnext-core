# Unified Incremental Root Transition 5B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Core-only, process-local Root V2-to-Root V2 incremental
transition lane, Persistent Scene V2 delivery, independent complete fallback,
bounded producer evidence, exact/translated reconvergence, and deterministic
work gates defined by the approved Phase 5B design.

**Architecture:** Keep Root V1 and Scene V1 frozen as compatibility and QA
references. Complete bootstrap and complete fallback consume independently
supplied complete material through one private complete Root V2 construction
kernel, producing a task-specific persistent source state, layout-only flow
tree, exclusion index, Flow Region Provider authority, persistent line tree,
authored box summary, and Persistent Scene V2.
Incremental attempts validate one closed
tagged change, request only Core-derived bounded producer facts, execute private
stages under locked deterministic policies, and atomically register a next Root
V2 only after all child, scene, delivery, and authority checks pass.

**Tech Stack:** TypeScript 6 ESM, Vitest 4, existing strict data-envelope and
fixed-point layout conventions, canonical JSON plus compact SHA-256
fingerprints, existing Phase 4B V2 complete-layout kernels, and existing
Node-native / browser-Worker-WASM text-engine fixtures.

## Global Constraints

- Tasks 1-10 were implemented locally through `5750fd2`, but their original
  5B-1 close claim is provisional after the approved 2026-07-31 design
  corrections. Before Task 11, execute and independently review
  `docs/superpowers/plans/2026-07-31-unified-incremental-root-transition-5b-1-corrective.md`.
  Phase 5B-2 remains blocked until that corrective stop-gate passes and the
  user explicitly authorizes continuation.
- Before Task 1, re-read the applicable `AGENTS.md`, fetch/prune all three
  repositories, and revalidate branch, HEAD, upstream divergence, and working
  trees. This plan is based on Core `main` at
  `29d3a61377791208bdb65c7ebf36e123003cfc7e`, clean and 59 commits ahead of
  `origin/main`, with Editor/Backend clean and equal to their origins. Stop and
  report any difference before implementation, except an explicitly reviewed
  local commit containing only this plan. Record the authorized execution base
  SHA before Task 1.
- Implementation, local task commits, execution workspace/worktree choice, and
  checkpoint continuation each require the user's later authorization. This
  plan never authorizes push or merge.
- Work only in `flowdoc-vnext-core`; do not modify `flowdoc-vnext-editor` or
  `flowdoc-vnext-backend`.
- Root V2 and Persistent Scene V2 are the only active Phase 5B root/scene lane.
- Root V1 and Scene V1 remain frozen compatibility and QA references. Do not
  add Phase 5B behavior, fields, or exports to their contracts.
- Complete Root V2 bootstrap and complete fallback must not call the Root V1
  builder or materialize Scene V1 as a production dependency.
- The incremental hot path accepts only one exact previous Root V2, one strict
  tagged change, and exact accepted bounded evidence when required.
- Complete next canonical material must not be accepted, prefetched, traversed,
  or compared by evidence-request creation or the incremental attempt.
- Caller input never owns dirty ranges, affected lines, spatial bands,
  reconvergence points, reuse, fallback mode, or work-policy selection.
- Required change families must start a real incremental attempt. Block size,
  implementation complexity, preference, and wall-clock timing are forbidden
  planned-complete reasons.
- Fallback is a two-step protocol: an attempt returns an exact process-local
  fallback request; independent complete material enters only through the
  complete-fallback boundary after the attempt ends.
- Candidate tree, index, lines, geometry, scene, ranges, summaries, and hints
  must not enter complete fallback.
- Keep `incrementalCandidateWork`, `completeFallbackWork`, and
  `completeOracleWork` as separate ledgers. Oracle work never enters a
  production transition result.
- Accepted incremental paths must report zero complete next-input traversal,
  zero complete suffix traversal, zero complete scene traversal, zero complete
  child re-hash, and zero Scene V1 materialization.
- Every next line has exactly one primary disposition: `E`, `T`, `R`, or `N`.
  Removed previous lines are reported separately; line-internals, geometry, and
  scene work counters remain orthogonal.
- Strict translated reuse requires unchanged line internals and
  source/provenance, one constant y delta, compatible destination spatial
  context, no boundary crossing, valid authored bounds, and replacement
  positioned geometry plus scene chunks.
- Persistent source, flow, line, spatial, and scene structures remain
  TextBlock-transition-specific. Do not extract a generic persistent
  collection, graph patch engine, CRDT, history store, or public random-access
  mutation API.
- Delivery uses zero-based half-open immutable previous/next domains and only
  canonical `retain-range` / `splice-range` operations.
- Retain proof uses the unique left-to-right maximal-subtree cover.
- Retain-cover uniqueness is relative to the exact registered tree authority,
  versioned tree-policy fingerprint, and half-open ordinal range. Foreign,
  cloned, unregistered, or policy-mismatched alternate shapes block.
- Fingerprint equality proves deterministic integrity, never process-local
  authority. Exact authority uses weak-key process-local registries.
- Root semantic identity excludes construction provenance, work policy,
  fixture calibration revision, and payload observations. Root composite
  authority identity binds the active work policy and construction facts.
- Persistent Scene semantic fingerprints exclude payload-estimation policy,
  payload observations, and build/path-copy work. Delivery binds the semantic
  Scene fingerprint and a separate payload-observation fingerprint.
- Payload size remains observational only and cannot appear in execution
  stage work, work-policy limits, fallback reasons, or path selection.
- Core derives the closed true-no-op/semantic-only/paint-affecting/
  geometry-affecting classification and `semanticIdentityChanged`; callers
  cannot provide or override it.
- Work limits are deterministic, stage-specific, fixture-evidenced, versioned,
  and fingerprinted. Wall-clock observations never choose an execution path.
- The Core-owned policy evolves by explicit checkpoint version. A stage is
  `inactive`, `prelock`, or `locked`; an inactive stage cannot execute, a
  prelock stage has an exact versioned fixture-derived safety ceiling, and only
  the design-assigned checkpoint may mark it locked. A Root built under an
  older policy fingerprint blocks transition as stale-policy input and must be
  rebuilt explicitly; callers cannot select or upgrade policy.
- Every accepted or blocked result retains `stagedEditorApply: false`,
  `mayPublishLayout: false`, and `productionBinding: false`.
- Structured issues use closed codes and canonical ordering. Timing, stack
  traces, engine-specific error strings, and memory observations never enter a
  deterministic result or fingerprint.
- Do not add Worker sessions/handles/releases, revisions, scheduling,
  cancellation, coalescing, Editor visible state, Backend transport or
  persistence, fixed-height behavior, image loading/decode lifecycle,
  Columns/Table integration, production activation, V1 retirement, or data
  binding runtime behavior.
- Future data binding remains an architectural constraint only: rendered
  equality must not erase source identity or provenance.
- Follow `AGENTS.md`, `docs/WORKSPACE_BOUNDARY.md`,
  `docs/CROSS_REPO_OPERATING_MAP.md`,
  `docs/LIVE_DRAFT_MR1_UNIFIED_TEXT_BLOCK_ROOT_5A.md`,
  `docs/superpowers/specs/2026-07-28-unified-incremental-live-draft-product-readiness-design.md`,
  and
  `docs/superpowers/specs/2026-07-30-unified-incremental-root-transition-5b-design.md`.
- Human-facing Markdown is reviewed directly. Automated scope guards verify
  public exports, runtime contracts, capability flags, manifests, and blocked
  behavior rather than matching prose.

---

## Checkpoint And Review Order

1. **5B-1 Transition and Persistent Scene Foundation** — Tasks 1-10.
   The original implementation stop is superseded by the separately reviewed
   5B-1 corrective plan. Stop again after that plan.
2. **5B-2 Text and Style Incremental Transition** — Tasks 11-15.
   Stop for independent review after Task 15.
3. **5B-3 Image, Spatial, and Scale Closure** — Tasks 16-18.
   Stop for final Phase 5B review after Task 18.

No task in a later checkpoint starts before the preceding checkpoint's focused
gate, policy manifest, lifetime gate, public-boundary guard, and review pass.
In particular, Task 11 cannot start from `5750fd2` alone.

## Target File Structure

### New production contracts and private structures

- `src/layout/textBlockUnifiedLayoutChangeContractV1.ts` — closed tagged change
  union plus strict source/range/identity payload types.
- `src/layout/textBlockUnifiedLayoutEvidenceContractV1.ts` — bounded request,
  producer response/runtime, accepted evidence, and evidence work types.
- `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts` — validated target
  binding, fallback, result, issue, line-disposition, work-ledger, capability,
  and inspector types.
- `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts` — stage unit definitions,
  deterministic effective-limit arithmetic, locked checkpoint policies, and
  policy fingerprints.
- `src/layout/textBlockUnifiedLayoutSourceStateContractV1.ts` — transition-only
  persistent semantic/source/provenance/paint state.
- `src/layout/textBlockUnifiedLayoutSourceStateV1.ts` — complete source-state
  build, summary-guided lookup, path copy, and strict inspection.
- `src/layout/textBlockIncrementalFlowTreeContractV1.ts` — layout-only,
  offset-independent text/hard-break/inline-image flow facts.
- `src/layout/textBlockIncrementalFlowTreeV1.ts` — complete flow-tree build,
  path copy, summary proofs, and exact inspection.
- `src/layout/textBlockUnifiedSpatialStateContractV1.ts` — Root V2 exclusion
  entry/index contracts independent of a complete Initial Flow wrapper.
- `src/layout/textBlockUnifiedSpatialStateV1.ts` — complete exclusion-index
  build, insert/delete/move/resize path copy, band queries, and inspection.
- `src/layout/textBlockPersistentLayoutLineContractV1.ts` — persistent line
  records, line internals, positioned geometry, provenance, summaries,
  dispositions, and authored-box summary.
- `src/layout/textBlockPersistentLayoutLineTreeV1.ts` — one-line leaves,
  eight-child branches, complete build, path copy, canonical covers, and
  bounded exact/translated summary proofs.
- `src/layout/textBlockPersistentSceneContractV2.ts` — data-only chunks,
  one-chunk leaves, eight-child branches, summaries, work, and inspection.
- `src/layout/textBlockPersistentSceneV2.ts` — complete and incremental scene
  construction, path copy, compositional payload estimation, and authority.
- `src/layout/textBlockSceneDeliveryContractV2.ts` — canonical retain/splice
  plan and complete recovery delivery contracts.
- `src/layout/textBlockSceneDeliveryV2.ts` — delivery construction and bounded
  plan/complete-delivery inspectors.
- `src/layout/textBlockUnifiedLayoutRootContractV2.ts` — Root V2 dependency,
  complete build, work, capability, result, and inspection contracts.
- `src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.ts` — weak-key
  exact Root/Scene/request/evidence/fallback tuple authority without strong
  previous-root chains.
- `src/layout/textBlockUnifiedLayoutRootV2.ts` — independent complete Root V2
  bootstrap and bounded inspector.
- `src/layout/textBlockUnifiedLayoutTransitionChangeInternalsV1.ts` — strict
  descriptor-safe change validation, Core-owned target derivation, and
  eligibility classification.
- `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts` — bounded request
  creation and exact producer-response acceptance.
- `src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts` — private
  source/flow dirty derivation and path-copy transition.
- `src/layout/textBlockUnifiedLayoutTransitionSpatialInternalsV1.ts` — private
  spatial seed, update, and query transition.
- `src/layout/textBlockUnifiedLayoutTransitionLayoutInternalsV1.ts` — private
  bounded line recomputation and reconvergence proof.
- `src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts` — private
  authored geometry reuse/reprojection.
- `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts` — private
  scene path copy and delivery-plan assembly.
- `src/layout/textBlockUnifiedLayoutTransitionV1.ts` — public unified attempt
  orchestration and atomic acceptance.
- `src/layout/textBlockUnifiedLayoutFallbackV1.ts` — independent complete
  fallback boundary and target binding.

### New producer adapter

- `packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV1.ts` — exact
  Node-native/WASM producer response to a Core-owned bounded request.

### New tests, fixtures, and helpers

- `tests/helpers/textBlockUnifiedLayoutRootV2.ts`
- `tests/helpers/textBlockUnifiedIncremental5b.ts`
- `tests/textBlockUnifiedLayoutTransitionContractV1.test.ts`
- `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- `tests/textBlockIncrementalFlowTreeV1.test.ts`
- `tests/textBlockUnifiedSpatialStateV1.test.ts`
- `tests/textBlockPersistentLayoutLineTreeV1.test.ts`
- `tests/textBlockPersistentSceneV2.test.ts`
- `tests/textBlockSceneDeliveryV2.test.ts`
- `tests/textBlockUnifiedLayoutRootV2.test.ts`
- `tests/textBlockUnifiedLayoutFallbackV1.test.ts`
- `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`
- `tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts`
- `tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts`
- `tests/textBlockUnifiedLayoutReconvergenceV1.test.ts`
- `tests/textBlockUnifiedLayoutImageSpatialTransitionV1.test.ts`
- `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`
- `tests/textBlockUnifiedLayoutScaleV2.test.ts`
- `tests/textBlockUnifiedLayoutNodeWasmParityV2.test.ts`
- `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`
- `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`

### Modified files

- `packages/text-engine-rust-wasm/src/index.ts` — package-local producer export
  only when required by the existing package convention.
- `src/index.ts` — reviewed Root V2, transition, fallback, inspector, and
  delivery exports; no private stage exports.
- `README.md` — current Core capability evidence.
- `docs/PHASE_LEDGER.md` — checkpoint status and test evidence.
- `docs/LIVE_DRAFT_MR1_UNIFIED_INCREMENTAL_ROOT_5B.md` — final Phase 5B
  handoff, ownership map, policy/fixture manifest link, PASS/FAIL/RISK/UNKNOWN.

---

## 5B-1 Transition And Persistent Scene Foundation

### Task 1: Closed Change, Result, Work, And Policy Contracts

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutChangeContractV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutEvidenceContractV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutTransitionChangeInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutTransitionContractV1.test.ts`

**Interfaces:**

- Put only the closed change payloads and their source/range primitives in
  `textBlockUnifiedLayoutChangeContractV1.ts`; evidence envelopes/work live in
  `textBlockUnifiedLayoutEvidenceContractV1.ts`; target/fallback/result/issue/
  ledger contracts live in `textBlockUnifiedLayoutTransitionContractV1.ts`.

- Produces the exact closed union:

```ts
export type VNextTextBlockUnifiedLayoutChangeKindV1 =
  | "no-op"
  | "text-insertion"
  | "text-deletion"
  | "text-replacement"
  | "resolved-field-rendered-value-change"
  | "supported-style-change"
  | "inline-image-insertion"
  | "inline-image-deletion"
  | "inline-image-movement"
  | "image-frame-resize"
  | "image-vertical-alignment-change"
  | "image-paint-fact-change"
  | "exclusion-insertion"
  | "exclusion-deletion"
  | "exclusion-movement"
  | "exclusion-resize"
  | "authored-box-width-inset-change"

interface VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly source: "vnext-text-block-unified-layout-change-v1"
  readonly contractVersion: 1
  readonly kind: VNextTextBlockUnifiedLayoutChangeKindV1
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly expectedPreviousRootFingerprint: string
  readonly expectedPreviousSourceFingerprint: string
}

export interface VNextTextBlockSourceRangeV1 {
  readonly startRenderedUtf16: number
  readonly endRenderedUtf16: number
}

export interface VNextTextBlockSourceIdentityV1 {
  readonly lineageId: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
}

export interface VNextTextBlockNoOpChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "no-op"
}

export interface VNextTextBlockTextInsertionChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "text-insertion"
  readonly atRenderedUtf16: number
  readonly insertedText: string
  readonly insertedSource: VNextTextBlockSourceIdentityV1
  readonly measurementStyleKey: string
  readonly effectiveShapingStyleKey: string
}

export interface VNextTextBlockTextDeletionChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "text-deletion"
  readonly removedRange: VNextTextBlockSourceRangeV1
  readonly expectedRemovedContentFingerprint: string
  readonly expectedRemovedSourceFingerprint: string
  readonly expectedRemovedProvenanceFingerprint: string
}

export interface VNextTextBlockTextReplacementChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "text-replacement"
  readonly removedRange: VNextTextBlockSourceRangeV1
  readonly expectedRemovedContentFingerprint: string
  readonly expectedRemovedSourceFingerprint: string
  readonly expectedRemovedProvenanceFingerprint: string
  readonly insertedText: string
  readonly insertedSource: VNextTextBlockSourceIdentityV1
  readonly measurementStyleKey: string
  readonly effectiveShapingStyleKey: string
}

export interface VNextTextBlockResolvedFieldValueChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "resolved-field-rendered-value-change"
  readonly inlineId: string
  readonly fieldKey: string
  readonly expectedPreviousRenderedValueFingerprint: string
  readonly nextRenderedText: string
  readonly nextSource: VNextTextBlockSourceIdentityV1
}

export interface VNextTextBlockSupportedStyleChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "supported-style-change"
  readonly range: VNextTextBlockSourceRangeV1
  readonly expectedPreviousStyleFingerprint: string
  readonly expectedPreviousStyleProvenanceFingerprint: string
  readonly nextStyle: TextRunStyleV4Target
  readonly nextStyleFingerprint: string
  readonly nextStyleProvenanceFingerprint: string
}

export interface VNextTextBlockInlineImageInsertionChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "inline-image-insertion"
  readonly atRenderedUtf16: number
  readonly inlineImage: InlineImageV4Target
  readonly resolvedAssetId: string
  readonly insertedSource: VNextTextBlockSourceIdentityV1
}

export interface VNextTextBlockInlineImageDeletionChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "inline-image-deletion"
  readonly inlineId: string
  readonly expectedRenderedUtf16: number
  readonly expectedImageSourceFingerprint: string
  readonly expectedImageDependencyFingerprint: string
}

export interface VNextTextBlockInlineImageMovementChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "inline-image-movement"
  readonly inlineId: string
  readonly fromRenderedUtf16: number
  readonly toRenderedUtf16AfterRemoval: number
  readonly expectedImageSourceFingerprint: string
  readonly expectedImageDependencyFingerprint: string
}

export interface VNextTextBlockImageFrameResizeChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "image-frame-resize"
  readonly inlineId: string
  readonly expectedImageSourceFingerprint: string
  readonly expectedImageDependencyFingerprint: string
  readonly nextWidth: ImageFrameV4Target["width"]
  readonly nextHeight: ImageFrameV4Target["height"]
}

export interface VNextTextBlockImageVerticalAlignmentChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "image-vertical-alignment-change"
  readonly inlineId: string
  readonly expectedImageSourceFingerprint: string
  readonly expectedImageDependencyFingerprint: string
  readonly nextVerticalAlign: InlineImageV4Target["verticalAlign"]
}

export interface VNextTextBlockImagePaintFactChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "image-paint-fact-change"
  readonly inlineId: string
  readonly expectedImageSourceFingerprint: string
  readonly expectedImageDependencyFingerprint: string
  readonly nextFit: ImageFrameV4Target["fit"]
  readonly nextCrop: NonNullable<ImageFrameV4Target["crop"]> | null
}

export interface VNextTextBlockExclusionInsertionChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "exclusion-insertion"
  readonly entry: VNextTextBlockSyntheticPositionedObjectInputV1
}

export interface VNextTextBlockExclusionDeletionChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "exclusion-deletion"
  readonly objectId: string
  readonly expectedGeometryOwnerFingerprint: string
  readonly expectedEntryFingerprint: string
}

export interface VNextTextBlockExclusionMovementChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "exclusion-movement"
  readonly objectId: string
  readonly expectedGeometryOwnerFingerprint: string
  readonly expectedEntryFingerprint: string
  readonly nextXLayoutUnit: number
  readonly nextYLayoutUnit: number
}

export interface VNextTextBlockExclusionResizeChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "exclusion-resize"
  readonly objectId: string
  readonly expectedGeometryOwnerFingerprint: string
  readonly expectedEntryFingerprint: string
  readonly nextWidthLayoutUnit: number
  readonly nextHeightLayoutUnit: number
}

export interface VNextTextBlockAuthoredBoxWidthInsetChangeV1
  extends VNextTextBlockUnifiedLayoutChangeBaseV1 {
  readonly kind: "authored-box-width-inset-change"
  readonly expectedAuthoredBoxPlanFingerprint: string
  readonly nextAuthoredBoxPlan: VNextAuthoredBoxPlanV1
}

export type VNextTextBlockUnifiedLayoutChangeV1 =
  | VNextTextBlockNoOpChangeV1
  | VNextTextBlockTextInsertionChangeV1
  | VNextTextBlockTextDeletionChangeV1
  | VNextTextBlockTextReplacementChangeV1
  | VNextTextBlockResolvedFieldValueChangeV1
  | VNextTextBlockSupportedStyleChangeV1
  | VNextTextBlockInlineImageInsertionChangeV1
  | VNextTextBlockInlineImageDeletionChangeV1
  | VNextTextBlockInlineImageMovementChangeV1
  | VNextTextBlockImageFrameResizeChangeV1
  | VNextTextBlockImageVerticalAlignmentChangeV1
  | VNextTextBlockImagePaintFactChangeV1
  | VNextTextBlockExclusionInsertionChangeV1
  | VNextTextBlockExclusionDeletionChangeV1
  | VNextTextBlockExclusionMovementChangeV1
  | VNextTextBlockExclusionResizeChangeV1
  | VNextTextBlockAuthoredBoxWidthInsetChangeV1
```

- Text insertion positions are previous-source ordinals; deletion/replacement
  ranges are nonempty previous-source ranges; image movement destinations use
  the post-removal source domain. Validators reject ambiguous or mixed-domain
  coordinates.
- `nextCrop: null` means remove authored crop. Omission is never overloaded as
  removal, so descriptor-safe validation can distinguish every paint target.
- Exclusion movement changes only x/y, resize changes only width/height, and
  wrap policy/clearance changes are outside the V1 union rather than silently
  treated as resize.
- Authored-box change carries the expected plan fingerprint and a complete next
  `VNextAuthoredBoxPlanV1`; its eligibility is `permitted`. Validation compares
  the complete plan and permits only width/inset-affecting facts. A simultaneous
  fill, border-color/style, page-split, owner, or unsupported height/overflow
  change blocks instead of hiding extra mutations inside this family.
- Eligibility mapping is closed: the first 16 kinds are `required`;
  `authored-box-width-inset-change` is `permitted`; no V1 kind is
  `complete-only`. Unknown future structural kinds or unsupported style/image/
  exclusion mutations block as unknown/unsupported contracts rather than
  entering planned-complete.
- Produces internal:

```ts
export function validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1(
  change: unknown,
): VNextTextBlockValidatedChangeShapeV1
  | VNextTextBlockUnifiedLayoutBlockedStageV1
```

- Produces `VNextTextBlockUnifiedLayoutWorkPolicyV1`,
  `VNextTextBlockStageLimitV1`, the three separate work ledgers, line
  disposition covers, fallback modes, stage statuses, issue codes, evidence/
  fallback data contracts, and inspector-safe scalar result facts. Root/Scene-
  bearing transition result types are added to the same contract in Task 9
  after Root V2 and Persistent Scene V2 exist; Task 1 has no forward import of
  a file that has not been created.
- Each policy stage entry has
  `lockStatus: "inactive" | "prelock" | "locked"`, exact unit/limit fields, a
  checkpoint owner, and its own fingerprint. Public orchestration rejects an
  inactive stage before work and never treats `prelock` as a final checkpoint
  lock.
- All three work ledgers are recursively frozen scalar/count records with
  stage/unit keys only. They cannot retain Root, tree, scene, request, evidence,
  producer material, range-proof, or candidate object references.
- Name the ledger contracts exactly
  `VNextTextBlockIncrementalCandidateWorkV1`,
  `VNextTextBlockCompleteFallbackWorkV1`, and
  `VNextTextBlockCompleteOracleWorkV1`. The first is the only work object in a
  production attempt/fallback request, the second appears only at fallback
  completion, and the third exists only in QA helper records.
- `effectiveStageLimitV1(...)` implements safe integer
  `max(smallBlockFloor, min(absoluteStageLimit, relativeStageLimit))` and never
  reads time.
- Lock the stage and unit vocabularies in the same contract:

```ts
export type VNextTextBlockUnifiedLayoutStageV1 =
  | "change-gate"
  | "evidence"
  | "source-flow"
  | "spatial-index"
  | "layout-reconvergence"
  | "geometry"
  | "scene"
  | "delivery-plan"
  | "atomic-acceptance"

export type VNextTextBlockUnifiedLayoutStageUnitV1 =
  | "source-items"
  | "flow-atoms"
  | "flow-tree-nodes"
  | "spatial-index-nodes"
  | "spatial-query-bands"
  | "recomputed-lines"
  | "proof-nodes"
  | "reprojected-lines"
  | "visited-fragments"
  | "copied-scene-nodes"
  | "replacement-chunks"
  | "delivery-operations"
  | "retain-cover-nodes"
  | "estimated-canonical-payload-bytes"

export interface VNextTextBlockLayoutSeedRegionV1 {
  readonly previousSourceRange: VNextTextBlockSourceRangeV1
  readonly nextSourceRange: VNextTextBlockSourceRangeV1
  readonly previousSpatialBand: {
    readonly topLayoutUnit: number
    readonly bottomLayoutUnit: number
  } | null
  readonly nextSpatialBand: {
    readonly topLayoutUnit: number
    readonly bottomLayoutUnit: number
  } | null
  readonly mandatorySpatialUnion: {
    readonly topLayoutUnit: number
    readonly bottomLayoutUnit: number
  } | null
  readonly fingerprint: string
}
```

The seed is Core output from validated source/spatial stages. It is never a
public caller field.

- [ ] **Step 1: Write failing compile/runtime contract tests**

```ts
const noOp = Object.freeze({
  source: "vnext-text-block-unified-layout-change-v1",
  contractVersion: 1,
  kind: "no-op",
  documentId: "document-1",
  sectionId: "section-1",
  textBlockId: "text-block-1",
  expectedPreviousRootFingerprint: "root-fingerprint",
  expectedPreviousSourceFingerprint: "source-fingerprint",
})
expect(validateChangeShape(noOp)).toMatchObject({
  status: "accepted",
  change: { kind: "no-op" },
})
```

Add `satisfies` assertions for all 17 variants and runtime rows proving unknown
version/kind/field, symbol, accessor, proxy, custom prototype, mutable nested
record, blank identity/fingerprint, unsafe range, and caller-supplied
`dirtyRange`, `affectedLines`, `fallbackMode`, or `workPolicy` block before
stage work.

- [ ] **Step 2: Run the focused contract test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts
```

Expected: FAIL because the contract and validator modules do not exist.

- [ ] **Step 3: Implement exact contracts and descriptor-safe validation**

Use own-data descriptor inspection before reading values; require ordinary or
null-prototype records, dense ordinary arrays, no symbols/accessors/extras,
already-recursively-frozen input, safe integer arithmetic, nonblank
identities/fingerprints, and canonical issue ordering by `path`, `code`, then
message. Validation never freezes or otherwise mutates caller data. Exact
previous Root binding is added after Root V2 exists in Task 8.

- [ ] **Step 4: Implement and test deterministic limit arithmetic**

```ts
expect(effectiveStageLimitV1({
  smallBlockFloor: 32,
  absoluteStageLimit: 256,
  relativeStageLimit: 31,
})).toBe(32)
expect(effectiveStageLimitV1({
  smallBlockFloor: 32,
  absoluteStageLimit: 256,
  relativeStageLimit: 400,
})).toBe(256)
```

Add `Number.MAX_SAFE_INTEGER` overflow rows and a guard that temporarily
replaces `performance.now`, `Date.now`, and `process.hrtime` with throwing
functions while eligibility and limit results remain unchanged.

- [ ] **Step 5: Run contract tests and type-check**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```text
git add src/layout/textBlockUnifiedLayoutChangeContractV1.ts src/layout/textBlockUnifiedLayoutEvidenceContractV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockUnifiedLayoutTransitionChangeInternalsV1.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts
git commit -m "feat(layout): lock Phase 5B transition contracts"
```

### Task 2: Transition-Native Source State And Layout-Only Flow Tree

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutSourceStateContractV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Create: `src/layout/textBlockIncrementalFlowTreeContractV1.ts`
- Create: `src/layout/textBlockIncrementalFlowTreeV1.ts`
- Create: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- Create: `tests/textBlockIncrementalFlowTreeV1.test.ts`

**Interfaces:**

- `VNextTextBlockUnifiedLayoutSourceStateV1` owns source lineage, rendered
  content, semantic identity, provenance, authored image frame including paint,
  style source, authored-box plan, and compositional summaries.
- `VNextTextBlockIncrementalFlowTreeV1` owns only layout-affecting atom facts.
  Text color and image `fit/crop` are absent from its atom and subtree
  fingerprints.
- Both structures use offset-independent leaf items, maximum eight items per
  leaf, maximum eight children per branch, equal leaf depth, and summary-guided
  rendered-offset lookup.
- Canonical edits use nonempty 1-8-item leaves, 2-8-child non-root branches,
  no unary root, split 9 entries as left 4/right 5, borrow from the left before
  the right on underflow, otherwise merge with the left before the right, and
  collapse a unary root. Tests reject alternate local packing for the same
  exact previous tree and change.
- Produces private complete builders and inspectors:

```ts
export function createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1(
  input: {
    initialFlow: VNextTextBlockInitialFlowV1
    evidence: VNextTextBlockFlowEvidenceV2
  },
): VNextTextBlockUnifiedLayoutSourceStateBuildResultV1

export function createVNextTextBlockIncrementalFlowTreeCompleteInternalV1(
  input: {
    sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    evidence: VNextTextBlockFlowEvidenceV2
  },
): VNextTextBlockIncrementalFlowTreeBuildResultV1
```

- Source summaries separately compose `semanticFingerprint`,
  `contentFingerprint`, `sourceFingerprint`, `provenanceFingerprint`, and
  `paintFingerprint`.
- Source state also retains the exact font-face/style/unit-policy and producer
  requirement facts needed to derive a future bounded evidence request; it
  does not retain the complete accepted evidence object.
- Flow summaries compose rendered length, atom/item/node counts,
  `lineInternalsDependencyFingerprint`, and boundary fingerprints.
- The new structures are private Root V2 children; they are not exported from
  `src/index.ts`.
- Complete and incremental structure builders return unregistered prepared
  candidates. Task 7 adds module-private registration hooks guarded by the
  unexported graph-commit token owned by
  `textBlockUnifiedLayoutRootAuthorityInternalsV2.ts`; until then no child
  candidate has process-local accepted authority.

- [ ] **Step 1: Write failing complete-build and separation tests**

Build two complete inputs differing only in image `fit/crop`, and two differing
only in text color:

```ts
expect(nextSourceState.fingerprint).not.toBe(previousSourceState.fingerprint)
expect(nextSourceState.summary.paintFingerprint)
  .not.toBe(previousSourceState.summary.paintFingerprint)
expect(nextFlowTree.fingerprint).toBe(previousFlowTree.fingerprint)
```

Also prove changed font size and changed image width produce different
layout-only flow fingerprints. Exact flow-tree object reuse for paint-only
image transition is proved in Task 9 and paint-only text style transition in
Tasks 12-14; independent complete builds prove deterministic fingerprint
equality without interning objects by digest.

- [ ] **Step 2: Run both focused tests and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockIncrementalFlowTreeV1.test.ts
```

Expected: FAIL because both transition-native structures are missing.

- [ ] **Step 3: Implement complete source-state construction**

Snapshot accepted Initial Flow atoms into fixed source items. Store absolute
rendered positions only in traversal results; node payloads retain local lengths
and offset-independent lineage. Pack complete levels left-to-right in groups of
eight, except a trailing group of one repartitions the final nine entries as
left 4/right 5. Compute each summary from ordered child fingerprints and safe
integer counts.

- [ ] **Step 4: Implement the layout-only flow tree**

Project text cluster advances/metrics, hard breaks, image outer width/height,
and vertical alignment. Keep source/provenance fingerprints in proof summaries
without putting paint facts into layout dependency fingerprints. Apply the same
complete-level packing and local edit split/borrow/merge rules as source state.

- [ ] **Step 5: Add identity, collision, and complete-build work tests**

Assert complete builders report complete visited/created work, make no reuse
claim, reject cloned/foreign/mutable dependencies, and return unregistered
prepared candidates. Verify canonical candidate facts under the test-only
forced digest-collision seam; exact registered authority and cloned-child
rejection are completed through the atomic Root graph in Task 7.

- [ ] **Step 6: Run focused and Phase 4B regression tests**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockIncrementalFlowTreeV1.test.ts tests/textBlockPersistentFlowTreeV2.test.ts tests/textBlockUnifiedLayoutRootV1.test.ts
npm run type-check
```

Expected: PASS with unchanged Root V1 and existing persistent-flow V2 output.

- [ ] **Step 7: Commit**

```text
git add src/layout/textBlockUnifiedLayoutSourceStateContractV1.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockIncrementalFlowTreeContractV1.ts src/layout/textBlockIncrementalFlowTreeV1.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockIncrementalFlowTreeV1.test.ts
git commit -m "feat(layout): add transition-native source and flow state"
```

### Task 3: Root V2 Spatial State

**Files:**

- Create: `src/layout/textBlockUnifiedSpatialStateContractV1.ts`
- Create: `src/layout/textBlockUnifiedSpatialStateV1.ts`
- Create: `tests/textBlockUnifiedSpatialStateV1.test.ts`

**Interfaces:**

- Produces `VNextTextBlockUnifiedSpatialStateV1`, a task-specific persistent
  exclusion treap bound to document/section/TextBlock, content width, unit
  policy, and exact geometry-owner facts but not to a complete Initial Flow,
  complete producer evidence, or flow-tree wrapper.
- Reuses the accepted treap/query kernels from
  `textBlockSpatialIndexInternalsV1.ts`; it does not alter
  `VNextTextBlockSpatialIndexV2`.
- Produces:

```ts
export function createVNextTextBlockUnifiedSpatialStateCompleteInternalV1(
  input: {
    sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
  },
): VNextTextBlockUnifiedSpatialStateBuildResultV1

export function verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1(
  value: unknown,
): VNextTextBlockUnifiedSpatialStateInspectionV1
```

- Stores separate content-width/context and entry-root fingerprints so text and
  paint changes can reuse the exact spatial state.

- [ ] **Step 1: Write failing complete spatial-state tests**

```ts
expect(empty.summary.entryCount).toBe(0)
expect(empty.root).toBeNull()
expect(paintOnlyCompleteSpatialState.fingerprint)
  .toBe(previousCompleteSpatialState.fingerprint)
expect(verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1(
  empty,
)).toMatchObject({ status: "valid-candidate" })
```

Include unregistered-candidate, 128-entry pruning, and owner/context mismatch
rows. Exact registered/clone authority is asserted after Task 7 commits the
complete Root graph; exact spatial-state identity reuse for a transition is
asserted in Tasks 9 and 12 rather than inferred from two complete builds.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedSpatialStateV1.test.ts
```

Expected: FAIL because the spatial-state modules do not exist.

- [ ] **Step 3: Implement complete construction and exact inspection**

Use the existing canonical entry validator and treap node materializer. Bind the
new root only to transition source identity, content width, unit policy, and
entry facts and return it as an unregistered prepared candidate. Task 7 adds
the token-guarded internal registration hook used by atomic graph commit.

- [ ] **Step 4: Prove no-exclusion fast path and V2 parity**

For the accepted Phase 5A fixtures, normalize entries, summaries, query
intervals, affected bands, and fingerprints and compare with
`VNextTextBlockSpatialIndexV2`. Keep the new source/version distinct.

- [ ] **Step 5: Run spatial regressions and type-check**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedSpatialStateV1.test.ts tests/textBlockSpatialIndexV2.test.ts tests/textBlockSpatialIndexUpdateV1.test.ts tests/textBlockSpatialWrappingLayoutV2.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```text
git add src/layout/textBlockUnifiedSpatialStateContractV1.ts src/layout/textBlockUnifiedSpatialStateV1.ts tests/textBlockUnifiedSpatialStateV1.test.ts
git commit -m "feat(layout): add Root V2 spatial state"
```

### Task 4: Persistent Layout Line Tree And Disposition Covers

**Files:**

- Create: `src/layout/textBlockPersistentLayoutLineContractV1.ts`
- Create: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Create: `tests/textBlockPersistentLayoutLineTreeV1.test.ts`

**Interfaces:**

- A leaf owns exactly one logical line. A non-root branch owns two to eight
  equal-height children; the root is either a leaf or a 2-8-child branch and is
  never unary. Empty layout uses a registered empty root sentinel specific to
  this contract. Nine-child overflow splits left 4/right 5; underflow borrows
  left before right, otherwise merges left before right, and collapses a unary
  root.
- A line separates:
  - immutable line internals and break/fragment lineage;
  - source/provenance facts;
  - content-local positioned geometry;
  - authored-box projected geometry.
- Pure paint dependencies stay in source state and Persistent Scene V2, not in
  the layout-line fingerprint. This lets image `fit/crop` and text-color
  changes retain the exact line tree while replacing only affected scene
  chunks.
- Line leaves store stable lineage plus leaf-local source coordinates. Absolute
  line ordinals and rendered UTF-16 offsets are traversal results and never
  enter a reusable leaf or subtree fingerprint; insertion before a retained
  suffix therefore does not invalidate it merely by renumbering.
- Subtree summaries contain line/fragment counts, source ranges, authored-y
  bounds, line-internals fingerprint, source/provenance fingerprint,
  boundary/spatial-context fingerprint, and subtree fingerprint.
- Produces:

```ts
export function createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1(
  input: {
    sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    flowTree: VNextTextBlockIncrementalFlowTreeV1
    spatialState: VNextTextBlockUnifiedSpatialStateV1
    spatialLayout: Extract<VNextTextBlockSpatialWrappingLayoutResultV2, {
      status: "accepted"
    }>
    authoredBoxGeometry: Extract<VNextTextBlockAuthoredBoxGeometryResultV2, {
      status: "accepted"
    }>
  },
): VNextTextBlockPersistentLayoutLineTreeBuildResultV1

export function createVNextTextBlockLineDispositionCoverInternalV1(input: {
  previousTree: VNextTextBlockPersistentLayoutLineTreeV1
  nextTree: VNextTextBlockPersistentLayoutLineTreeV1
  segments: readonly VNextTextBlockLineDispositionSegmentV1[]
}): VNextTextBlockLineDispositionCoverResultV1
```

- Disposition covers are canonical maximal-subtree covers. One root-node cover
  represents all `E` lines in a no-op without enumerating lines.

- [ ] **Step 1: Write failing complete-tree and disposition tests**

```ts
expect(tree.summary.lineCount).toBe(geometry.summary.lineCount)
expect(noOpCover.covers).toEqual([{
  disposition: "E",
  previousRange: { start: 0, end: tree.summary.lineCount },
  nextRange: { start: 0, end: tree.summary.lineCount },
  subtreeFingerprints: [tree.root.fingerprint],
}])
expect(noOpCover.counts).toEqual({
  E: tree.summary.lineCount, T: 0, R: 0, N: 0, removed: 0,
})
```

Add overlap, gap, non-maximal decomposition, wrong source/provenance,
incompatible boundary, and non-exhaustive count rows.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts
```

Expected: FAIL because the contract/tree modules do not exist.

- [ ] **Step 3: Implement complete build and compositional summaries**

Convert each exact Phase 4B complete line into one leaf. Build deterministic
eight-way levels left-to-right, repartition a trailing one plus its preceding
eight as left 4/right 5, fingerprint only ordered child fingerprints and summary
facts, explicitly omit text color and image `fit/crop` from line facts, and
return an unregistered prepared tree. Task 7 adds the token-guarded
registration hook used only by central graph commit.

- [ ] **Step 4: Implement canonical cover creation and inspection**

At each left edge, choose the largest aligned subtree wholly contained in the
segment. Block alternate decompositions, duplicate nodes, reordered nodes,
nonconstant `T` delta, source/provenance drift for `E`/`T`, and unsafe counts.

- [ ] **Step 5: Run line-tree, geometry, and scene V1 regressions**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockSpatialWrappingLayoutV2.test.ts tests/textBlockAuthoredBoxGeometryV2.test.ts tests/textBlockUnifiedLayoutSceneV1.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```text
git add src/layout/textBlockPersistentLayoutLineContractV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts
git commit -m "feat(layout): add persistent layout line tree"
```

### Task 5: Persistent Scene V2

**Files:**

- Create: `src/layout/textBlockPersistentSceneContractV2.ts`
- Create: `src/layout/textBlockPersistentSceneV2.ts`
- Create: `tests/textBlockPersistentSceneV2.test.ts`

**Interfaces:**

- `VNextTextBlockPersistentSceneV2` is renderer-consumption data for one
  TextBlock. It is not a layout authority, generic sequence, document graph,
  scheduler, history, asset store, or random-access mutation API.
- A leaf owns exactly one renderer chunk. A non-root branch owns two to eight
  equal-height children; root/overflow/underflow rules exactly match the line
  tree and reject unary/alternate packing. Each subtree summary contains chunk, line,
  text-fragment, image-fragment, source-range, authored-y, and estimated
  canonical payload-byte facts plus line-internals, source/provenance,
  boundary/spatial-context, and subtree fingerprints.
- Scene chunks identify their logical line and source mappings by stable
  lineage plus leaf-local offsets. Absolute `chunkIndex`, `lineIndex`, and
  document-wide rendered offsets are produced only while inspecting or
  delivering a traversal and never enter reusable chunk payloads,
  fingerprints, or retained subtree summaries.
- Payload policy version 1 defines:

```ts
chunkEstimatedByteCount =
  utf8ByteCount(canonicalJson({
    payloadPolicyVersion: 1,
    chunk,
  }))

sceneEstimatedByteCount =
  utf8ByteCount(canonicalJson({
    payloadPolicyVersion: 1,
    source: "vnext-text-block-persistent-scene-v2",
    contractVersion: 2,
  }))
  + sum(chunkEstimatedByteCount)
```

- Store the deterministic fact only as
  `estimatedCanonicalPayloadByteCount`; do not expose aliases that could be
  mistaken for JavaScript heap size, structured-clone allocation, actual
  transfer bytes, or duration.
- Produces:

```ts
export function createVNextTextBlockPersistentSceneCompleteInternalV2(input: {
  lineTree: VNextTextBlockPersistentLayoutLineTreeV1
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
}): VNextTextBlockPersistentSceneBuildResultV2

export function verifyVNextTextBlockPersistentSceneCandidateInternalV2(
  value: unknown,
): VNextTextBlockPersistentSceneInspectionV2

export function inspectVNextTextBlockPersistentSceneV2(
  value: unknown,
): VNextTextBlockPersistentSceneInspectionV2
```

- Complete construction reports complete visited/emitted work and no
  incremental reuse. Incremental path-copy helpers remain private to the scene
  transition stage added in Task 9.

- [ ] **Step 1: Write failing complete-scene tests**

```ts
expect(scene.summary.chunkCount).toBe(lineTree.summary.lineCount)
expect(scene.work.completeSceneProjectionCount).toBe(1)
expect(scene.work.incrementalCopiedNodeCount).toBe(0)
expect(structuredClone(scene)).toEqual(scene)
expect(verifyVNextTextBlockPersistentSceneCandidateInternalV2(scene))
  .toMatchObject({ status: "valid-candidate" })
expect(inspectVNextTextBlockPersistentSceneV2(scene))
  .toMatchObject({ status: "invalid" })
expect(inspectVNextTextBlockPersistentSceneV2(
  structuredClone(scene),
)).toMatchObject({ status: "invalid" })
```

Assert exact chunk mapping, text/image/source facts, compositional fingerprint
parity, empty scene behavior, exact payload estimates, and that neither the
original prepared candidate nor its clone gains process-local authority before
Task 7 commits a complete Root graph.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentSceneV2.test.ts
```

Expected: FAIL because the V2 scene modules do not exist.

- [ ] **Step 3: Implement the dedicated scene tree**

Project chunks only from exact prepared line/source candidates whose
dependency records match, deep-freeze data-only chunk payloads,
create one-chunk leaves, build deterministic
eight-child levels with the same trailing-one 4/5 repartition rule, and compose
summaries without a linear suffix chain. Return an unregistered prepared Scene
and leave process-local registration to the token-guarded hook added by Task 7.

- [ ] **Step 4: Implement bounded inspection**

Complete-scene inspection may validate the complete tree only when explicitly
called as a complete inspector. Add a separate internal incremental inspection
entry that accepts copied paths, replacement nodes, and sibling
summary/fingerprint references and rejects any request to enumerate the
complete previous/next scene.

- [ ] **Step 5: Add forced-collision and non-capability tests**

Use an unexported test-only fingerprint provider seam to create equal digests
for unequal chunks. Prove the candidate verifier rejects unequal dependency
records despite digest equality; Task 7 then proves exact registered object
authority rejects the foreign scene. Assert every generic mutation/scheduler/
history capability is absent from the runtime shape and `src/index.ts`.

- [ ] **Step 6: Run scene and Phase 5A regressions**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockUnifiedLayoutSceneV1.test.ts tests/textBlockUnifiedLayoutRootV1.test.ts
npm run type-check
```

Expected: PASS with unchanged Scene V1 fingerprints and exports.

- [ ] **Step 7: Commit**

```text
git add src/layout/textBlockPersistentSceneContractV2.ts src/layout/textBlockPersistentSceneV2.ts tests/textBlockPersistentSceneV2.test.ts
git commit -m "feat(layout): add persistent scene v2"
```

### Task 6: Canonical Incremental And Complete Scene Delivery

**Files:**

- Create: `src/layout/textBlockSceneDeliveryContractV2.ts`
- Create: `src/layout/textBlockSceneDeliveryV2.ts`
- Create: `tests/textBlockSceneDeliveryV2.test.ts`

**Interfaces:**

```ts
export type VNextTextBlockSceneDeliveryOperationV2 =
  | {
      kind: "retain-range"
      previousRange: { start: number; end: number }
      nextRange: { start: number; end: number }
      retainedSubtrees: readonly {
        previousPath: readonly number[]
        fingerprint: string
        chunkCount: number
      }[]
    }
  | {
      kind: "splice-range"
      previousRange: { start: number; end: number }
      nextRange: { start: number; end: number }
      replacementChunks: readonly VNextTextBlockPersistentSceneChunkV2[]
    }

export interface VNextTextBlockSceneDeliveryPlanV2 {
  source: "vnext-text-block-scene-delivery-plan-v2"
  contractVersion: 2
  status: "accepted"
  previousSceneFingerprint: string
  nextSceneFingerprint: string
  previousChunkCount: number
  nextChunkCount: number
  operations: readonly VNextTextBlockSceneDeliveryOperationV2[]
  summary: {
    retainOperationCount: number
    spliceOperationCount: number
    retainedSubtreeCount: number
    replacementChunkCount: number
    estimatedCanonicalPayloadByteCount: number
  }
  work: {
    visitedOperationCount: number
    visitedRetainCoverNodeCount: number
    visitedReplacementChunkCount: number
    completePreviousSceneTraversalCount: 0
    completeNextSceneTraversalCount: 0
  }
  fingerprint: string
}

export function inspectVNextTextBlockSceneDeliveryPlanV2(input: {
  previousScene: VNextTextBlockPersistentSceneV2
  nextScene: VNextTextBlockPersistentSceneV2
  plan: unknown
}): VNextTextBlockSceneDeliveryPlanInspectionV2

export function verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: {
    previousScene: VNextTextBlockPersistentSceneV2
    nextScene: VNextTextBlockPersistentSceneV2
    plan: unknown
  },
): VNextTextBlockSceneDeliveryPlanInspectionV2

export type VNextTextBlockCompleteSceneDeliveryResultV2 =
  | {
      status: "accepted"
      delivery: {
        source: "vnext-text-block-complete-scene-delivery-v2"
        contractVersion: 2
        rootFingerprint: string
        persistentSceneFingerprint: string
        chunks: readonly VNextTextBlockPersistentSceneChunkV2[]
        summary: VNextTextBlockPersistentSceneSummaryV2
        work: {
          completeDeliveryCount: 1
          visitedSceneNodeCount: number
          emittedChunkCount: number
          estimatedCanonicalPayloadByteCount: number
        }
        stagedEditorApply: false
        mayPublishLayout: false
        productionBinding: false
        fingerprint: string
      }
      issues: readonly []
    }
  | {
      status: "blocked"
      delivery: null
      issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export function prepareVNextTextBlockPersistentSceneCompleteDeliveryInternalV2(
  input: {
    persistentScene: VNextTextBlockPersistentSceneV2
    rootFingerprint: string
  },
): VNextTextBlockCompleteSceneDeliveryResultV2
```

- Operations form one monotonic script over immutable domains:
  - ranges never move backwards;
  - adjacent operations of the same kind are merged;
  - an insertion is a splice with empty previous range;
  - a deletion is a splice with empty next range;
  - both ranges may not be empty;
  - when an insertion and retain share a boundary, splice precedes retain;
  - retain lengths must match;
  - each retain uses the greedy left-to-right maximal-subtree cover.
- Inspection work is bounded by operation count, retain-cover node count, and
  replacement payload. It reads only previous subtree references named by the
  plan and next copied/replacement paths supplied by exact authority.
- The internal complete-delivery preparation emits all chunks, records the
  supplied Root V2 fingerprint and Scene V2 fingerprint, is
  structured-clone-safe, and reports one complete-delivery count. It creates no
  authority. Task 10 adds the public exact-Root wrapper after Root V2 and the
  locked 5B-1 policy exist.

- [ ] **Step 1: Write failing canonical plan tests**

Create prepared-candidate retain-only, insert, delete, replace, and
shifted-suffix plans and verify them through the private candidate verifier.
Assert gaps, overlap, alternate covers, reordered operations, unmerged adjacent
operations, wrong retained fingerprint, wrong replacement count, and final
summary/fingerprint mismatch block.

```ts
expect(verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
  previousScene,
  nextScene,
  plan: retainOnly,
})).toMatchObject({
  status: "valid",
  previousCoverageCount: previousScene.summary.chunkCount,
  nextCoverageCount: nextScene.summary.chunkCount,
  completePreviousSceneTraversalCount: 0,
  completeNextSceneTraversalCount: 0,
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockSceneDeliveryV2.test.ts
```

Expected: FAIL because delivery contracts and inspectors do not exist.

- [ ] **Step 3: Implement plan normalization and inspection**

Build canonical operations during transition; do not accept a caller-authored
plan at a public constructor. Inspector input exists for verification and
adversarial tests only. Resolve retained paths by summary-guided descent and
verify the exact greedy cover. The private candidate verifier checks canonical
facts without granting authority; the public inspector additionally requires
both exact registered scenes and is exercised after Task 9 atomic transition.

- [ ] **Step 4: Implement complete recovery delivery**

Prepare delivery only from a candidate Scene produced by the private scene
builder or an exact registered Scene supplied by the later public wrapper. Emit
chunks in ordinal order, retain no Core authority in the clone-safe result, and
record visited/emitted/payload work separately from transition work. Task 10
must reject an unregistered/foreign Root or Scene before invoking preparation.

- [ ] **Step 5: Run delivery, scene, and structured-clone tests**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockPersistentSceneV2.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```text
git add src/layout/textBlockSceneDeliveryContractV2.ts src/layout/textBlockSceneDeliveryV2.ts tests/textBlockSceneDeliveryV2.test.ts
git commit -m "feat(layout): add canonical scene delivery v2"
```

### Task 7: Independent Root V2 Complete Bootstrap And Exact Authority

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutRootContractV2.ts`
- Create: `src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.ts`
- Create: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Create: `tests/helpers/textBlockUnifiedLayoutRootV2.ts`
- Create: `tests/textBlockUnifiedLayoutRootV2.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockIncrementalFlowTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedSpatialStateV1.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockPersistentSceneV2.ts`

**Interfaces:**

```ts
export interface VNextTextBlockAuthoredBoxSummaryV2 {
  source: "vnext-text-block-authored-box-summary-v2"
  contractVersion: 2
  authoredBoxPlanFingerprint: string
  contentLeftLayoutUnit: number
  contentWidthLayoutUnit: number
  outerWidthLayoutUnit: number
  outerHeightLayoutUnit: number
  lineCount: number
  authoredGeometryFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockUnifiedFlowRegionProviderAuthorityV2 {
  source: "vnext-text-block-flow-region-provider-authority-v2"
  contractVersion: 2
  spatialStateFingerprint: string
  layoutContextFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutRootBuildInputV2 {
  inputAuthority: "core-synthetic-qa-only"
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  spatialEntries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
  bindProductionLayout?: boolean
}

export interface VNextTextBlockUnifiedLayoutRootV2 {
  source: "vnext-text-block-unified-layout-root-v2"
  contractVersion: 2
  inputAuthority: "core-synthetic-qa-only"
  documentId: string
  instanceRevision: number
  sectionId: string
  textBlockId: string
  layoutId: string
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  flowTree: VNextTextBlockIncrementalFlowTreeV1
  spatialState: VNextTextBlockUnifiedSpatialStateV1
  flowRegionProviderAuthority:
    VNextTextBlockUnifiedFlowRegionProviderAuthorityV2
  lineTree: VNextTextBlockPersistentLayoutLineTreeV1
  authoredBoxSummary: VNextTextBlockAuthoredBoxSummaryV2
  persistentScene: VNextTextBlockPersistentSceneV2
  workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  dependencyFingerprints: {
    sourceState: string
    flowTree: string
    spatialState: string
    flowRegionProviderAuthority: string
    lineTree: string
    authoredBoxSummary: string
    persistentScene: string
    workPolicy: string
  }
  constructionKind:
    | "complete-bootstrap"
    | "incremental"
    | "complete-fallback"
  constructionFingerprint: string
  contracts: {
    unifiedTextBlockAuthority: true
    processLocalImmutableRoot: true
    persistentIncrementalTransition: true
    completeNextInputOnHotPath: false
    stagedEditorApply: false
    mayPublishLayout: false
    productionBinding: false
  }
  stagedEditorApply: false
  mayPublishLayout: false
  productionBinding: false
  fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutCompleteBuildWorkV2 {
  completeRootV2BuildCount: number
  completeSourceItemVisitCount: number
  completeFlowAtomVisitCount: number
  completeSpatialEntryVisitCount: number
  completeLineVisitCount: number
  completeFragmentVisitCount: number
  completeSceneNodeVisitCount: number
  completeSceneProjectionCount: number
  completeChildGraphTraversalCount: number
  completeChildRehashCount: number
}

export type VNextTextBlockUnifiedLayoutRootResultV2 =
  | {
      status: "accepted"
      root: VNextTextBlockUnifiedLayoutRootV2
      persistentScene: VNextTextBlockPersistentSceneV2
      deliveryPlan: null
      completeBuildWork: VNextTextBlockUnifiedLayoutCompleteBuildWorkV2
      issues: readonly []
    }
  | {
      status: "blocked"
      root: null
      persistentScene: null
      deliveryPlan: null
      completeBuildWork: VNextTextBlockUnifiedLayoutCompleteBuildWorkV2
      issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export function prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
  input: VNextTextBlockUnifiedLayoutRootBuildInputV2,
  workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1,
  constructionKind: "complete-bootstrap" | "complete-fallback",
): VNextTextBlockUnifiedLayoutRootCompleteCandidateResultV2

export function createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
  input: VNextTextBlockUnifiedLayoutRootBuildInputV2,
  workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1,
): VNextTextBlockUnifiedLayoutRootResultV2

export function inspectVNextTextBlockUnifiedLayoutRootV2(
  value: unknown,
): VNextTextBlockUnifiedLayoutRootInspectionV2
```

- During Tasks 7-9, tests call the private
  `createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(input, workPolicy)`
  with an exact fixture policy. Task 10 locks the evidence-derived 5B-1 policy,
  adds the public `createVNextTextBlockUnifiedLayoutRootV2(input)` wrapper that
  selects only that Core-owned policy, and exports the wrapper. No public or
  caller-supplied work-policy parameter exists.

- Root V2 retains exact `sourceState`, `flowTree`, `spatialState`, `lineTree`,
  `flowRegionProviderAuthority`, `authoredBoxSummary`, `persistentScene`, and
  `workPolicy` dependencies plus compositional fingerprints. The Root V2
  contract defines a V2-native
  `VNextTextBlockUnifiedFlowRegionProviderAuthorityV2` bound to the exact
  spatial-state/layout-context fingerprints; it does not extend the frozen V1
  authority type. Root V2 does not retain Initial Flow, complete evidence, flat
  spatial layout, flat authored geometry, Root V1, or Scene V1 after complete
  construction returns.
- The complete builder may call accepted Phase 4B lower-level complete
  functions to obtain ephemeral complete layout/geometry facts. It may not call
  `createVNextTextBlockUnifiedLayoutRootV1` or
  `projectVNextTextBlockUnifiedLayoutSceneV1`.
- Exact authority uses:
  - `WeakMap<RootV2, RootBindingV2>` for root-to-child bindings;
  - nested weak-key tuple registries for request/evidence/change/root
    relationships; and
  - scalar/fingerprint snapshots in WeakMap values where retaining a previous
    root wrapper would form a history chain.
- Root V2 registration occurs only after all children and cross-dependency
  checks pass.
- Add token-guarded child registration hooks to the source/flow/spatial/line/
  scene modules. Only
  `registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(...)` in the
  authority module can create the unexported commit token and invoke all hooks;
  any missing, duplicate, reordered, or partial registration attempt blocks
  before the first WeakMap write.
- The `prepare...CompleteCandidateInternalV2` boundary builds the complete
  graph and scalar work/fingerprint facts but registers no Root, Scene, or child
  wrapper. The normal complete bootstrap validates the prepared candidate and
  commits it atomically. Task 8 reuses the same preparation pipeline but delays
  commit until exact fallback-target validation passes.

- [ ] **Step 1: Write failing independent bootstrap tests**

Spy on Root V1 and Scene V1 constructors and assert zero calls while Root V2
builds equal normalized semantic/layout/geometry/renderer facts:

```ts
expect(result.status).toBe("accepted")
expect(result.root.contractVersion).toBe(2)
expect(result.root.persistentScene.contractVersion).toBe(2)
expect(rootV1BuildCount).toBe(0)
expect(sceneV1ProjectionCount).toBe(0)
expect(result.completeBuildWork.completeRootV2BuildCount).toBe(1)
```

Prepare the same graph once without commit and assert every child/Scene/Root
inspector reports unregistered. Commit through the complete bootstrap and
assert every exact wrapper becomes valid together while every structured clone
remains renderer data only.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV2.test.ts
```

Expected: FAIL because Root V2 does not exist.

- [ ] **Step 3: Implement ordered complete bootstrap**

Implement the unregistered preparation pipeline: validate Initial Flow/evidence
exact authority, create source/flow/spatial state, create the V2 Flow Region
Provider authority, compute ephemeral complete V2 layout and authored geometry,
build the persistent line tree and scene, assemble authored-box summary, and
verify all fingerprints/capabilities. The complete-bootstrap internal wrapper
then registers every prepared child, Scene V2, and Root V2 in one atomic commit.

- [ ] **Step 4: Implement bounded root inspection**

Inspect fixed dependency references and stored fingerprints without traversing
child trees. Report exact top-level dependency count, zero complete child graph
traversal, zero complete child re-hash, and one root-wrapper inspection. The
fixed top-level dependency count is eight:
source/flow/spatial/provider/line/authored-box/scene/policy.

- [ ] **Step 5: Add blocked-stage and fixture-helper tests**

Cover invalid Initial Flow/evidence/spatial input, unresolved image, unsafe
arithmetic, fixed-height-shaped input, production request, child inspection
failure, and scene failure. Every blocked result must contain:

```ts
{
  root: null,
  persistentScene: null,
  deliveryPlan: null,
}
```

Add `acceptedUnifiedLayoutRootFixtureV2(...)` that builds independent complete
material without prebuilding Root V1.

- [ ] **Step 6: Run Root V2, Phase 5A, and type checks**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutRootV1.test.ts tests/textBlockUnifiedLayoutRootAdversarialV1.test.ts tests/textBlockUnifiedLayoutRootScaleV1.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 7: Commit**

```text
git add src/layout/textBlockUnifiedLayoutRootContractV2.ts src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.ts src/layout/textBlockUnifiedLayoutRootV2.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockIncrementalFlowTreeV1.ts src/layout/textBlockUnifiedSpatialStateV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockPersistentSceneV2.ts tests/helpers/textBlockUnifiedLayoutRootV2.ts tests/textBlockUnifiedLayoutRootV2.test.ts
git commit -m "feat(layout): add independent unified root v2"
```

### Task 8: Evidence Request And Deferred Complete-Fallback Protocol

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutFallbackV1.ts`
- Create: `tests/textBlockUnifiedLayoutFallbackV1.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutEvidenceContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionContractV1.test.ts`

**Interfaces:**

```ts
export interface VNextTextBlockExpectedTargetBindingV1 {
  readonly semanticFingerprint: string
  readonly renderedContentFingerprint: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly paintFingerprint: string
  readonly layoutDependencyFingerprint: string
  readonly authoredBoxPlanFingerprint: string
  readonly spatialEntrySetFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockValidatedChangeV1 {
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly eligibility: "required" | "permitted" | "complete-only"
  readonly producerEvidence: "required" | "not-required"
  readonly expectedTargetBinding: VNextTextBlockExpectedTargetBindingV1
  readonly fingerprint: string
}

export type VNextTextBlockUnifiedLayoutFallbackReasonV1 =
  | {
      readonly code: "allowlisted-whole-block-spatial-impact"
      readonly policyFact: "authored-box-width-or-inset"
    }
  | {
      readonly code: "bounded-reuse-proof-unavailable"
      readonly stage:
        | "source-flow"
        | "spatial-index"
        | "layout-reconvergence"
        | "geometry"
        | "scene"
        | "delivery-plan"
      readonly proof:
        | "source-binding"
        | "flow-path-copy"
        | "spatial-path-copy"
        | "exact"
        | "translated"
        | "retain-cover"
    }
  | {
      readonly code: "stage-unit-limit-exceeded"
      readonly stage: VNextTextBlockUnifiedLayoutStageV1
      readonly unit: VNextTextBlockUnifiedLayoutStageUnitV1
      readonly effectiveLimit: number
      readonly attemptedWork: number
    }

export interface VNextTextBlockUnifiedLayoutFallbackRequestV1 {
  readonly source: "vnext-text-block-unified-layout-fallback-request-v1"
  readonly contractVersion: 1
  readonly mode:
    | "planned-complete"
    | "incremental-proof-failed"
    | "deterministic-work-limit-exceeded"
  readonly reason: VNextTextBlockUnifiedLayoutFallbackReasonV1
  readonly skippedOrFailedStage: VNextTextBlockUnifiedLayoutStageV1
  readonly incrementalWorkAttempted: boolean
  readonly previousRootFingerprint: string
  readonly changeFingerprint: string
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly expectedTargetBinding: VNextTextBlockExpectedTargetBindingV1
  readonly workPolicyFingerprint: string
  readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly fingerprint: string
}

export function bindVNextTextBlockUnifiedLayoutChangeInternalV1(input: {
  previousRoot: VNextTextBlockUnifiedLayoutRootV2
  change: VNextTextBlockUnifiedLayoutChangeV1
  workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockValidatedChangeResultV1

export function createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1(
  input: {
    previousRoot: VNextTextBlockUnifiedLayoutRootV2
    change: VNextTextBlockUnifiedLayoutChangeV1
    workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  },
): VNextTextBlockTransitionEvidenceRequestResultV1

export function acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV1(
  input: {
    request: VNextTextBlockTransitionEvidenceRequestV1
    previousRoot: VNextTextBlockUnifiedLayoutRootV2
    change: VNextTextBlockUnifiedLayoutChangeV1
    producerRuntimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV1
    response: unknown
  },
): VNextTextBlockTransitionEvidenceAcceptanceResultV1

export type VNextTextBlockUnifiedLayoutCompleteFallbackResultV1 =
  | {
      readonly status: "accepted-complete-fallback"
      readonly root: VNextTextBlockUnifiedLayoutRootV2
      readonly persistentScene: VNextTextBlockPersistentSceneV2
      readonly deliveryPlan: null
      readonly completeFallbackWork:
        VNextTextBlockCompleteFallbackWorkV1
      readonly issues: readonly []
      readonly stagedEditorApply: false
      readonly mayPublishLayout: false
      readonly productionBinding: false
    }
  | {
      readonly status: "blocked"
      readonly root: null
      readonly persistentScene: null
      readonly deliveryPlan: null
      readonly completeFallbackWork:
        VNextTextBlockCompleteFallbackWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
      readonly stagedEditorApply: false
      readonly mayPublishLayout: false
      readonly productionBinding: false
    }

export function completeVNextTextBlockUnifiedLayoutRootFallbackInternalV1(input: {
  request: VNextTextBlockUnifiedLayoutFallbackRequestV1
  completeMaterial: VNextTextBlockUnifiedLayoutRootBuildInputV2
  workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutCompleteFallbackResultV1
```

- Root/change binding first calls the Task 1 shape validator, then validates
  exact previous Root authority, document/section/TextBlock identity, and stale
  previous-root/source fingerprints before any source lookup.
- Invalid/foreign/stale previous Root or policy authority returns `blocked`
  with no fallback request. Recovery requires the caller to invoke complete
  bootstrap explicitly; the attempt never converts root invalidity into
  implicit fallback.
- The binder derives `expectedTargetBinding` by summary-guided composition from
  the exact previous Root plus the closed change payload. It may inspect only
  changed summary paths and referenced siblings; it cannot register a
  candidate child, walk a complete suffix, or accept target facts from the
  caller. The family-neutral binding includes semantic, rendered-content,
  source, provenance, paint, layout-dependency, authored-box-plan, and spatial
  entry-set fingerprints so complete fallback cannot satisfy an exclusion,
  paint, image-frame, or authored-box request with the wrong target while
  matching text alone.
- Evidence request creation uses validated change payload plus source/flow
  summaries to derive previous/next ranges, left/right context, style/font/unit
  dependencies, maximum coverage, policy fingerprint, and request fingerprint.
  It reports zero complete suffix and next-input traversal.
- No-op, image paint-only, exclusion-only, and image geometry-only changes
  return `not-required` and create no producer request.
- Accepted producer output must exactly cover the request with no gap, overlap,
  widening, or narrowing and cannot contain caller-derived ranges, affected
  lines/bands, reconvergence, reuse, fallback, or capability grants.
- Fallback request stores only the design-specified scalar/fingerprint facts and
  exact factual candidate work. Its registry value does not strongly retain
  candidate graphs or the previous Root wrapper.
- Complete fallback calls the same independent unregistered Root V2 preparation
  pipeline used by bootstrap, derives the same family-neutral target binding
  from the independent candidate, validates every field against the exact
  fallback request/change target, and only then atomically registers children,
  Scene V2, and Root V2. It returns `accepted-complete-fallback` or a structured
  block.

- [ ] **Step 1: Write failing request-authority tests**

Assert cloned, cross-root, cross-change, widened, narrowed, stale-policy, wrong
runtime, and digest-colliding responses block. Assert request creation under
proxies that throw on unrequested source subtrees remains bounded and does not
read a complete suffix.

- [ ] **Step 2: Write failing two-step fallback tests**

```ts
const attempt = makeWorkLimitFallback(previousRoot, change)
expect(attempt.status).toBe("fallback-required")
expect(attempt).not.toHaveProperty("completeMaterial")
expect(attempt.fallbackRequest.candidateTree).toBeUndefined()

const completed = completeVNextTextBlockUnifiedLayoutRootFallbackInternalV1({
  request: attempt.fallbackRequest,
  completeMaterial: independentlyBuiltCompleteMaterial,
  workPolicy: fixtureWorkPolicy,
})
expect(completed.status).toBe("accepted-complete-fallback")
expect(completed.completeFallbackWork.completeRootV2BuildCount).toBe(1)
```

Add a target mismatch and a fixture that poisons discarded candidate objects;
the independently built result must remain identical. Capture the prepared
mismatch wrappers through a test-only observation seam and assert every
child/Scene/Root inspector still reports unregistered after the block.

- [ ] **Step 3: Run focused tests and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts
```

Expected: FAIL because request/fallback boundaries are missing.

- [ ] **Step 4: Implement exact request/evidence tuple authority**

Bind the exact frozen change to the previous Root first and store only the
validated scalar target binding in the internal change record. Use nested
WeakMaps keyed by request, previous Root, and exact frozen change. Store runtime
identity as an exact registered dependency. Evidence objects retain derived
response facts, not the previous Root wrapper.

- [ ] **Step 5: Implement independent fallback completion**

Validate exact fallback-request registration, build complete Root V2 from only
`completeMaterial` as an unregistered prepared candidate, compare every
family-neutral target-binding fingerprint, register the complete children/
scene/root atomically only after equality, and keep complete work separate.
Target mismatch discards the prepared candidate without registering any part.

- [ ] **Step 6: Run fallback, root, and evidence tests**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 7: Commit**

```text
git add src/layout/textBlockUnifiedLayoutEvidenceContractV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutFallbackV1.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts
git commit -m "feat(layout): add deferred Root V2 fallback protocol"
```

### Task 9: No-Op And Paint-Only Atomic Transition

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Create: `tests/helpers/textBlockUnifiedIncremental5b.ts`
- Create: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`

**Interfaces:**

```ts
export type VNextTextBlockUnifiedLayoutTransitionResultV1 =
  | {
      readonly status: "accepted-no-op"
      readonly root: VNextTextBlockUnifiedLayoutRootV2
      readonly persistentScene: VNextTextBlockPersistentSceneV2
      readonly deliveryPlan: null
      readonly dispositions: VNextTextBlockLineDispositionCoverV1
      readonly incrementalCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
      readonly stagedEditorApply: false
      readonly mayPublishLayout: false
      readonly productionBinding: false
    }
  | {
      readonly status: "accepted-incremental"
      readonly root: VNextTextBlockUnifiedLayoutRootV2
      readonly persistentScene: VNextTextBlockPersistentSceneV2
      readonly deliveryPlan: VNextTextBlockSceneDeliveryPlanV2
      readonly dispositions: VNextTextBlockLineDispositionCoverV1
      readonly incrementalCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
      readonly stagedEditorApply: false
      readonly mayPublishLayout: false
      readonly productionBinding: false
    }
  | {
      readonly status: "fallback-required"
      readonly root: null
      readonly persistentScene: null
      readonly deliveryPlan: null
      readonly fallbackRequest:
        VNextTextBlockUnifiedLayoutFallbackRequestV1
      readonly incrementalCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
      readonly stagedEditorApply: false
      readonly mayPublishLayout: false
      readonly productionBinding: false
    }
  | {
      readonly status: "blocked"
      readonly root: null
      readonly persistentScene: null
      readonly deliveryPlan: null
      readonly fallbackRequest: null
      readonly incrementalCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
      readonly stagedEditorApply: false
      readonly mayPublishLayout: false
      readonly productionBinding: false
    }

export function attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1(input: {
  previousRoot: VNextTextBlockUnifiedLayoutRootV2
  change: VNextTextBlockUnifiedLayoutChangeV1
  evidence?: VNextTextBlockTransitionEvidenceV1
  workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutTransitionResultV1
```

- Task 9 tests use this private internal attempt with an exact fixture policy.
  Task 10 adds and exports the public
  `attemptVNextTextBlockUnifiedLayoutRootTransitionV1(...)` counterpart, bound
  only to the locked Core-owned 5B-1 policy.

- True no-op returns the exact previous Root V2 and exact previous Persistent
  Scene V2. It creates no root generation, child, scene node, replacement
  chunk, producer request, or scene-delivery plan. Its one root-subtree `E`
  cover supplies all line counts compositionally; the accepted-no-op result
  uses `deliveryPlan: null` because there is no next scene state to apply.
- Image `fit/crop` changes path-copy source/paint state, reuse the exact flow
  tree, spatial state, layout line tree, line geometry, and authored-box
  summary, replace only affected scene paths, and create a canonical delivery
  plan. Text-color style transition is deferred to 5B-2 Tasks 12-14.
- All layout lines remain `E` for pure paint changes. Scene replacements are
  orthogonal to line disposition, so affected scene chunks are spliced while
  line-internals recomputation and geometry reprojection both remain zero.
- Candidate children remain unregistered until line dispositions, scene,
  delivery plan, source target, work policy, and root dependencies all pass.

- [ ] **Step 1: Write failing true no-op identity tests**

```ts
expect(result.status).toBe("accepted-no-op")
expect(result.root).toBe(previousRoot)
expect(result.persistentScene).toBe(previousRoot.persistentScene)
expect(result.deliveryPlan).toBeNull()
expect(result.incrementalCandidateWork.rootWrapperAllocationCount).toBe(0)
```

- [ ] **Step 2: Write failing paint-only replacement tests**

For image `contain` to `cover`, crop add/change/removal, and unchanged paint
requests assert exact child reuse, one source path copy for real changes, exact
line-tree identity, all-`E` line disposition, affected scene replacements only,
zero invalidated lines, zero layout/geometry work, changed source/scene/root
fingerprints, and
normalized equality with a separately bootstrapped complete Root V2 fixture.
Task 14 later centralizes this independent comparison in the QA-only oracle
helper; no production stage imports the fixture comparison.

- [ ] **Step 3: Run the foundation test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
```

Expected: FAIL because the transition orchestrator is missing.

- [ ] **Step 4: Implement private scene path copy**

Resolve affected line/chunk ordinals from source-state summary paths, rebuild
only the affected chunk and copied ancestors, compose next summaries, and emit
the canonical splice/retain script. Validate copied paths without whole-scene
inspection.

- [ ] **Step 5: Implement no-op/paint orchestration and atomic acceptance**

Execute strict change gate, evidence-not-required gate, source path copy,
scene path copy, private candidate delivery verification, Root V2 assembly, and
one atomic registration. The public delivery inspector is used only after an
accepted graph has exact authority. Return no candidate object on any
block/fallback.
Implement the image paint source update as a summary-guided leaf/path copy in
`textBlockUnifiedLayoutSourceStateV1.ts`; do not introduce the general
text/style flow stage before Task 12.

- [ ] **Step 6: Run foundation, fallback, scene, and type checks**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 7: Commit**

```text
git add src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/helpers/textBlockUnifiedIncremental5b.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
git commit -m "feat(layout): add no-op and paint-only Root V2 transitions"
```

### Task 10: 5B-1 Policy Lock, Adversarial Gate, Lifetime Gate, And Public Surface

**Files:**

- Create: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`
- Create: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`
- Create: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`
- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `src/layout/textBlockSceneDeliveryV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootContractV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutFallbackV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `src/index.ts`

**Interfaces:**

- Lock scene/delivery policy rows using deterministic calibration:
  - `smallBlockFloor` is the next power of two greater than or equal to the
    maximum observed unit count among declared fixtures with at most 32 lines;
  - `absoluteStageLimit` is the next power of two greater than or equal to four
    times the maximum observed unit count in the complete declared 5B-1 matrix;
  - `relativeNumerator` is the smallest positive integer covering every
    observed `ceil(workUnit / max(1, previousSummaryBase))`;
  - `relativeDenominator` is `1`;
  - `relativeStageLimit` is
    `ceil(previousSummaryBase * relativeNumerator / relativeDenominator)
    + exactValidatedChangeDelta`;
  - all arithmetic blocks on unsafe integers.
- Publish checkpoint policy version `5b-1-v1`: scene path-copy, replacement
  chunk, delivery-plan, retain-cover, and paint-source-copy units are `locked`;
  text evidence/flow/layout/reconvergence and image/spatial/geometry units are
  `inactive`. The public attempt therefore accepts only the 5B-1 no-op and
  image-`fit/crop` paint-only families; it cannot execute a later stage with an
  unbounded placeholder.
- Manifest rows record fixture id, change family, atom/line/chunk sizes,
  policy class, expected path, work-policy id/fingerprint, exact limit fields,
  threshold rows, oracle id, counters, and invariants.
- Public exports at this checkpoint are limited to Root V2 complete bootstrap
  and inspector, evidence request/acceptance and inspectors, attempt/result
  inspector, fallback completion/request inspector, Persistent Scene V2
  inspector, delivery inspectors, and complete recovery delivery.
- Root/Scene/request/evidence/result/fallback inspectors require exact
  process-local authority and reject structured clones even when fingerprints
  match. Scene-delivery plan/complete-delivery data inspectors validate
  canonical clone-safe renderer data, but that validation never upgrades a
  clone into Core Root/Scene authority.
- Add the public wrappers with no caller-owned policy parameter:

```ts
export function createVNextTextBlockUnifiedLayoutRootV2(
  input: VNextTextBlockUnifiedLayoutRootBuildInputV2,
): VNextTextBlockUnifiedLayoutRootResultV2

export function createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV1(
  input: {
    previousRoot: VNextTextBlockUnifiedLayoutRootV2
    change: VNextTextBlockUnifiedLayoutChangeV1
  },
): VNextTextBlockTransitionEvidenceRequestResultV1

export function attemptVNextTextBlockUnifiedLayoutRootTransitionV1(input: {
  previousRoot: VNextTextBlockUnifiedLayoutRootV2
  change: VNextTextBlockUnifiedLayoutChangeV1
  evidence?: VNextTextBlockTransitionEvidenceV1
}): VNextTextBlockUnifiedLayoutTransitionResultV1

export function completeVNextTextBlockUnifiedLayoutRootFallbackV1(input: {
  request: VNextTextBlockUnifiedLayoutFallbackRequestV1
  completeMaterial: VNextTextBlockUnifiedLayoutRootBuildInputV2
}): VNextTextBlockUnifiedLayoutCompleteFallbackResultV1

export function createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2(
  input: { root: VNextTextBlockUnifiedLayoutRootV2 },
): VNextTextBlockCompleteSceneDeliveryResultV2

export function inspectVNextTextBlockTransitionEvidenceRequestV1(
  value: unknown,
): VNextTextBlockTransitionEvidenceRequestInspectionV1

export function inspectVNextTextBlockTransitionEvidenceV1(
  value: unknown,
): VNextTextBlockTransitionEvidenceInspectionV1

export function inspectVNextTextBlockUnifiedLayoutTransitionResultV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutTransitionResultInspectionV1

export function inspectVNextTextBlockUnifiedLayoutFallbackRequestV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutFallbackRequestInspectionV1

export function inspectVNextTextBlockCompleteSceneDeliveryV2(
  value: unknown,
): VNextTextBlockCompleteSceneDeliveryInspectionV2
```

- [ ] **Step 1: Add deterministic 5B-1 calibration fixtures**

Use empty, 1-line, 8-line, 32-line, 33-line, 128-line,
image-paint-first/image-paint-middle/image-paint-last, no-op, and 128-exclusion
rows. Record copied scene nodes, replacement chunks, delivery
operations/cover nodes, and estimated payload bytes. No timing value enters the
manifest.

- [ ] **Step 2: Lock policy constants and boundary tests**

Commit the exact generated constants to
`textBlockUnifiedLayoutWorkPolicyV1.ts`. For every scene/delivery unit create
limit-minus-one, limit, and limit-plus-one fixtures; assert the first two
attempt and the last returns
`deterministic-work-limit-exceeded` with the exact failed stage/unit.

- [ ] **Step 3: Add adversarial and forced-collision tests**

Cover cloned/foreign/mutable/proxy/accessor/symbol/class inputs, cross-bound
root/change/request/evidence/fallback tuples, forged summaries/covers, policy
fingerprint drift, digest collision, candidate contamination, hidden whole
scene traversal, unsafe arithmetic, production request, and capability grants.

- [ ] **Step 4: Add deterministic lifetime/reachability tests**

Walk only public/root-registry dependency edges and prove:
  - distinct next Root does not reach the previous Root wrapper;
  - distinct next Scene does not reach the previous Scene wrapper;
  - retained child subtrees are reachable only through next children;
  - fallback/blocked results do not reach candidate graphs;
  - no-op is the only exact-wrapper return;
  - global registries expose no iterable strong root history.

Record optional `WeakRef`/forced-GC observations separately and do not use them
as PASS gates.

- [ ] **Step 5: Write the failing public-boundary guard**

Import `src/index.ts`, assert the reviewed function/type surface is present,
private validators/stage helpers/registries are absent, Root/Scene V1 exports
are unchanged, and all false capability facts remain false.

Run:

```text
npx vitest run --config vitest.config.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
```

Expected: FAIL because the reviewed Root V2 orchestration wrappers are not yet
exported.

- [ ] **Step 6: Add reviewed exports and run the 5B-1 focused gate**

Add the Core-owned public wrappers for complete Root V2 bootstrap, transition
attempt, and complete recovery delivery. Each wrapper selects the locked policy
internally and validates exact Root/Scene authority; none accepts a policy from
the caller.

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockIncrementalFlowTreeV1.test.ts tests/textBlockUnifiedSpatialStateV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

Expected: PASS.

- [ ] **Step 7: Review the 5B-1 staged scope**

Run:

```text
git status --short
git diff --stat 29d3a61..HEAD
git diff --name-only 29d3a61..HEAD
git diff --stat
git diff --cached --stat
```

Expected: only Tasks 1-10 files; no Editor, Backend, Phase 5C, V1 behavior, or
unrelated user changes.

- [ ] **Step 8: Commit the 5B-1 checkpoint**

```text
git add src/index.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockSceneDeliveryV2.ts src/layout/textBlockUnifiedLayoutRootContractV2.ts src/layout/textBlockUnifiedLayoutRootV2.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutFallbackV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
git commit -m "test(layout): close Phase 5B-1 foundation gate"
```

**5B-1 review stop:** Do not begin Task 11 until independent review confirms
zero complete scene traversal/suffix re-hash, canonical retain proof, no Scene
V1 materialization, locked policy/manifest evidence, exact authority, and
deterministic lifetime PASS.

---

## 5B-2 Text And Style Incremental Transition

### Task 11: Core-Owned Bounded Producer Evidence

**Files:**

- Create: `packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV1.ts`
- Create: `tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts`
- Modify: `packages/text-engine-rust-wasm/src/index.ts`
- Modify: `src/layout/textBlockUnifiedLayoutEvidenceContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`

**Interfaces:**

```ts
export interface VNextTextBlockTransitionEvidenceRequestV1 {
  source: "vnext-text-block-transition-evidence-request-v1"
  contractVersion: 1
  previousRootFingerprint: string
  changeFingerprint: string
  documentId: string
  sectionId: string
  textBlockId: string
  previousSourceRange: VNextTextBlockSourceRangeV1
  nextSourceRange: VNextTextBlockSourceRangeV1
  leftContextRenderedUtf16Length: number
  rightContextRenderedUtf16Length: number
  fontStyleUnitDependencyFingerprint: string
  producerRuntimeRequirementFingerprint: string
  maximumEvidenceCoverageRenderedUtf16Length: number
  workPolicyFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockTransitionProducerRuntimeIdentityV1 {
  source: "vnext-text-block-transition-producer-runtime-v1"
  contractVersion: 1
  runtime: "node-native-mr1-range" | "browser-worker-wasm-mr1-range"
  engineBuildFingerprint: string
  fontBackendFingerprint: string
  unitPolicyFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockTransitionProducerSourceAtomV1 {
  kind: "text" | "resolved-field" | "hard-break" | "inline-image-boundary"
  relativeStartRenderedUtf16: number
  relativeEndRenderedUtf16: number
  renderedText: string
  inlineId: string
  sourceFingerprint: string
  provenanceFingerprint: string
  measurementStyleKey: string | null
  effectiveShapingStyleKey: string | null
  boundaryFingerprint: string | null
}

export interface VNextTextBlockTransitionProducerSourceMaterialV1 {
  source: "vnext-text-block-transition-producer-source-material-v1"
  contractVersion: 1
  requestFingerprint: string
  previousCoverage: readonly VNextTextBlockTransitionProducerSourceAtomV1[]
  nextCoverage: readonly VNextTextBlockTransitionProducerSourceAtomV1[]
  fontFaces: readonly VNextTextBlockInitialFlowFontFaceV1[]
  layoutUnitPolicyFingerprint: string
  sourceTopologyFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockTransitionProducerResponseV1 {
  source: "vnext-text-block-transition-producer-response-v1"
  contractVersion: 1
  requestFingerprint: string
  runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV1
  previousCoverage: VNextTextBlockSourceRangeV1
  nextCoverage: VNextTextBlockSourceRangeV1
  shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  breakOffsets: readonly number[]
  sourceTopologyFingerprint: string
  work: {
    requestedAtomCount: number
    requestedClusterCount: number
    consumedAtomCount: number
    consumedClusterCount: number
    unusedCoverageRenderedUtf16Length: number
    visitedEvidenceNodeCount: number
    completeNextInputTraversalCount: 0
    completeNextInputComparisonCount: 0
  }
  contracts: {
    producerSelectsDirtyRange: false
    producerSelectsLinesOrBands: false
    producerSelectsReconvergenceOrReuse: false
    producerSelectsFallback: false
    stagedEditorApply: false
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export function createFlowDocTextEngineUnifiedIncrementalEvidenceV1(input: {
  request: VNextTextBlockTransitionEvidenceRequestV1
  sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV1
  runtime: "node-native-mr1-range" | "browser-worker-wasm-mr1-range"
}): VNextTextBlockTransitionProducerResponseV1
```

- `sourceMaterial` contains only text/style/font/source topology needed to
  answer the exact request; it cannot carry complete next canonical input,
  dirty/affected ranges, lines, bands, reconvergence, reuse, or fallback.
- Strict kind invariants require style keys only on text-bearing atoms and
  `boundaryFingerprint` only on hard-break/image-boundary atoms. Image boundary
  material carries no asset bytes, decoded state, frame paint, or layout
  decision and is never shaped as text.
- Core request derivation uses source/flow summary lookup plus change payload.
  It may visit only summary paths and bounded left/right context.
- Accepted evidence reports requested, consumed, unused bounded coverage,
  visited evidence nodes, and zero complete next-input traversal/comparison.
- Node-native and Worker-WASM responses normalize to exact equal accepted Core
  evidence and counters.

- [ ] **Step 1: Write failing request derivation tests**

For insertion, deletion, replacement, resolved field, and metric style rows
assert Core derives exact ranges/context. For paint-only style rows assert
`not-required`, zero producer request, and zero context materialization. Wrap
untouched source subtrees in throwing test proxies and assert zero reads.

```ts
expect(request.previousSourceRange).toEqual(expected.previous)
expect(request.nextSourceRange).toEqual(expected.next)
expect(request.work.completeSuffixTraversalCount).toBe(0)
expect(request.work.completeNextInputTraversalCount).toBe(0)
```

- [ ] **Step 2: Write failing producer/acceptance tests**

Answer one request with both runtimes. Add gap, overlap, widening, narrowing,
wrong source topology, wrong font/style/unit/runtime, unknown extra field,
forged request fingerprint, and capability-grant rows.

- [ ] **Step 3: Run the focused evidence test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts
```

Expected: FAIL because the producer adapter is missing and text/style evidence
requests are not yet accepted.

- [ ] **Step 4: Implement summary-guided request derivation**

Resolve change anchors by source-state subtree summaries, derive the minimum
producer context required by the accepted MR1 range policy, bind exact
font/style/unit/runtime facts, apply maximum coverage before materialization,
and register the request tuple.

- [ ] **Step 5: Implement the exact producer response**

Reuse the accepted contextual range shaping/segmentation implementation under
the request's fixed coverage. Return clusters, advances, breaks, coverage,
runtime/font/style dependencies, and source topology only.

- [ ] **Step 6: Implement acceptance and exact tuple registration**

Snapshot own data descriptors, validate exact coverage and canonical topology,
compare every dependency, freeze the evidence, and register it against the
exact request/root/change/runtime tuple through weak keys.

- [ ] **Step 7: Run evidence, existing range-engine, and type checks**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textEngineMr1RangeFactsV1.test.ts tests/textEngineIncrementalRangeExecutionV1.test.ts tests/textEngineFlowEvidenceNodeWasmV2.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 8: Commit**

```text
git add packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV1.ts packages/text-engine-rust-wasm/src/index.ts src/layout/textBlockUnifiedLayoutEvidenceContractV1.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts
git commit -m "feat(layout): add bounded transition producer evidence"
```

### Task 12: Text, Resolved-Field, And Style Source/Flow Transition

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockIncrementalFlowTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`

**Interfaces:**

```ts
export interface VNextTextBlockUnifiedLayoutFlowStageAcceptedV1 {
  status: "accepted"
  validatedChange: VNextTextBlockValidatedChangeV1
  nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  nextFlowTree: VNextTextBlockIncrementalFlowTreeV1
  seedRegion: VNextTextBlockLayoutSeedRegionV1
  work: VNextTextBlockIncrementalCandidateWorkV1["flow"]
}

export function transitionVNextTextBlockUnifiedLayoutFlowInternalV1(input: {
  previousRoot: VNextTextBlockUnifiedLayoutRootV2
  change: VNextTextBlockValidatedChangeV1
  evidence: VNextTextBlockTransitionEvidenceV1 | null
  limits: VNextTextBlockFlowStageLimitsV1
}): VNextTextBlockUnifiedLayoutFlowStageResultV1
```

- The stage applies text insertion/deletion/replacement, resolved-field value,
  and supported style changes to exact source state, derives dirty
  source/atom ranges, and path-copies layout flow only where layout facts
  change.
- Offset-independent suffix items/subtrees remain exact references after
  insertion/deletion; absolute rendered offsets are traversal results.
- Identical rendered resolved-field text with changed source/provenance changes
  source state and scene mapping but may reuse layout-only flow.
- Every accepted flow-stage result preserves the Core-derived effect
  classification from the validated change. A semantic-only row updates
  source/provenance and scene mapping without forcing paint/layout change;
  paint-affecting and geometry-affecting rows remain distinct even when both
  also change semantic identity.
- Style rows classify:
  - same effective style and provenance: true no-op;
  - paint-only color: source/paint path copy with exact flow reuse;
  - equal metrics with changed style/provenance: source path copy and exact
    layout-flow reuse;
  - metric-affecting supported style: bounded evidence and flow path copy;
  - a style outside the closed supported contract: immediate structured block;
  - a valid supported style whose bounded reuse proof is unavailable: exact
    proof-failed fallback, never planned-complete or an
    implementation-complexity reason.
- Work reports range lookup, visited/reused/created nodes, created canonical
  bytes, requested/consumed evidence, complete tree rebuild count `0`, complete
  semantic pass count `0`, and complete suffix traversal count `0`.

- [ ] **Step 1: Write failing required text-change matrix**

Cover start/middle/end Thai and Latin insertion, deletion, replacement,
hard-break adjacency, field adjacency, equal-length replacement, line-boundary
crossing, and long retained suffix. For every supported row:

```ts
expect(result.status).not.toBe("planned-complete")
expect(result.incrementalCandidateWork.flow.completeTreeRebuildCount).toBe(0)
expect(result.incrementalCandidateWork.flow.completeSemanticPassCount).toBe(0)
expect(result.incrementalCandidateWork.flow.completeSuffixTraversalCount).toBe(0)
```

- [ ] **Step 2: Write failing resolved-field and style matrix**

Include the five resolved-field and six style rows from the design. Assert
source/provenance inequality is retained even when rendered text or effective
metrics are equal.

- [ ] **Step 3: Run the focused transition test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts
```

Expected: FAIL because the flow transition stage is missing.

- [ ] **Step 4: Implement source-state path copy**

Use summary-guided half-open range lookup, split only boundary leaf items,
apply exact source/provenance/paint facts, rebalance locally under the fixed
eight-item/eight-child policy, and compose new source summaries along copied
paths.

- [ ] **Step 5: Implement layout-flow path copy**

Project accepted evidence into replacement layout atoms, retain exact
paint-neutral suffix subtrees, reject coverage or dependency drift, enforce
flow-stage work limits before each node/atom visit, and return
`needs-complete-fallback` with exact factual work on limit/proof failure.

- [ ] **Step 6: Wire the flow stage into the unified attempt**

Require exact accepted evidence for evidence-bearing changes, reject surplus
evidence for evidence-free changes, and keep all candidate children private
until later layout/scene stages pass.

- [ ] **Step 7: Run text/style, source/flow, and fallback tests**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockIncrementalFlowTreeV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts
npm run type-check
```

Expected: PASS for flow-stage assertions; complete accepted Root results remain
pending Task 14.

- [ ] **Step 8: Commit**

```text
git add src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockIncrementalFlowTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts
git commit -m "feat(layout): add text and style flow transitions"
```

### Task 13: Bounded Layout, Exact Reconvergence, And Strict Translation

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionLayoutInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutReconvergenceV1.test.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`

**Interfaces:**

```ts
export interface VNextTextBlockUnifiedLayoutLineStageAcceptedV1 {
  status: "accepted"
  nextLineTree: VNextTextBlockPersistentLayoutLineTreeV1
  dispositions: VNextTextBlockLineDispositionCoverV1
  reconvergence:
    | { mode: "none" }
    | { mode: "exact"; proofFingerprint: string }
    | {
        mode: "translated"
        deltaYLayoutUnit: number
        proofFingerprint: string
      }
  work: VNextTextBlockIncrementalCandidateWorkV1["layout"]
}

export function transitionVNextTextBlockUnifiedLayoutLinesInternalV1(input: {
  previousRoot: VNextTextBlockUnifiedLayoutRootV2
  flowStage: VNextTextBlockUnifiedLayoutFlowStageAcceptedV1
  spatialState: VNextTextBlockUnifiedSpatialStateV1
  seedRegion: VNextTextBlockLayoutSeedRegionV1
  limits: VNextTextBlockLayoutStageLimitsV1
}): VNextTextBlockUnifiedLayoutLineStageResultV1
```

- Recompute begins at the Core-derived dirty source/atom seed and proceeds line
  by line using existing fixed-point break/placement kernels.
- Exact reconvergence requires matching cursor, line internals,
  source/provenance, layout/spatial context, authored y/geometry, exact
  previous-child authority, and work-policy identity.
- Translation proof additionally requires one constant y delta, destination
  spatial compatibility, no page/box/flow-region/barrier/semantic boundary
  crossing, valid authored bounds, unchanged line internals/source/provenance,
  and rebuilt positioned geometry/scene.
- Missing boundary/spatial facts disable translation rather than infer it.
- Reconvergence uses summary paths and stops at an accepted subtree proof; it
  never walks the complete suffix.
- Produces canonical E/T/R/N disposition covers and removed-line count.

- [ ] **Step 1: Write failing exact reconvergence tests**

Cover equal-length replacement, start/middle/end edit, hard-break adjacency,
field adjacency, and a long suffix protected by throwing test sentinels.
Assert exact subtree identity for `E`, proof-node counts, and zero complete
suffix traversal.

- [ ] **Step 2: Write failing strict translation tests**

Cover valid constant-y shift, multiple inconsistent deltas, changed line
internals, changed provenance, destination exclusion mismatch, page/box/
flow-region/barrier boundary crossing, invalid authored bounds, and missing
compatibility facts.

```ts
expect(valid.dispositions.counts.T).toBeGreaterThan(0)
expect(valid.incrementalCandidateWork.layout.completeSuffixTraversalCount)
  .toBe(0)
expect(incompatible.dispositions.counts.T).toBe(0)
```

- [ ] **Step 3: Run the reconvergence test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts
```

Expected: FAIL because the layout transition stage is missing.

- [ ] **Step 4: Implement bounded line recomputation**

Use flow summary cursors and the accepted spatial query provider; enforce
layout line and proof-node limits before each visit. Construct candidate
existing-lineage records as `R` and inserted lineage as `N`.

- [ ] **Step 5: Implement exact and translated summary proof**

Compare compositional summaries in the required order, bind proof nodes to
exact registered previous subtrees, compute/validate one safe constant delta,
and emit `E` or `T` maximal-subtree covers without enumerating accepted suffix
lines.

- [ ] **Step 6: Implement exhaustive disposition inspection**

Prove disjoint next-domain ranges, complete coverage, valid previous mappings,
`E + T + R + N == nextLineCount`, and a separate removed count. Reject any
line assigned twice or not assigned.

- [ ] **Step 7: Run reconvergence and layout regressions**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockSpatialWrappingLayoutV2.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 8: Commit**

```text
git add src/layout/textBlockUnifiedLayoutTransitionLayoutInternalsV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts
git commit -m "feat(layout): add bounded Root V2 reconvergence"
```

### Task 14: Incremental Geometry, Scene Delivery, And Independent Oracle

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutReconvergenceV1.test.ts`

**Interfaces:**

```ts
export interface VNextTextBlockUnifiedLayoutGeometryStageAcceptedV1 {
  status: "accepted"
  nextLineTree: VNextTextBlockPersistentLayoutLineTreeV1
  authoredBoxSummary: VNextTextBlockAuthoredBoxSummaryV2
  work: VNextTextBlockIncrementalCandidateWorkV1["geometry"]
}

export function projectVNextTextBlockUnifiedLayoutGeometryInternalV1(input: {
  previousRoot: VNextTextBlockUnifiedLayoutRootV2
  lineStage: VNextTextBlockUnifiedLayoutLineStageAcceptedV1
  nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  nextSpatialState: VNextTextBlockUnifiedSpatialStateV1
  limits: VNextTextBlockGeometryStageLimitsV1
}): VNextTextBlockUnifiedLayoutGeometryStageResultV1
```

- `E` always retains the exact line subtree. It retains the scene subtree only
  when source-mapping and paint dependencies are also unchanged; Task 9 pure
  paint rows deliberately pair `E` lines with replacement scene chunks.
- `T` retains line internals but rebuilds positioned/authored geometry and scene
  chunks with the proved delta.
- `R` rebuilds an existing-lineage record; source/provenance-only rows report
  zero line-internals and geometry recomputation while still replacing affected
  source-mapped scene chunks. This `R` case is limited to changed source or
  provenance mapping with equal layout facts; pure text-color and image
  `fit/crop` rows keep exact `E` lines, with their transitions implemented in
  Tasks 14 and 9 respectively.
- `N` builds new line, geometry, and scene facts.
- Geometry projection work counts reprojected lines and visited fragments.
- Scene transition path-copies only changed chunk paths and produces one
  canonical retain/splice plan.
- The QA helper builds an independent complete Root V2 from complete material
  after the production attempt ends and compares semantic/source/provenance,
  flow, spatial, line/fragment geometry, scene, complete delivery, and
  normalized fingerprints. It may also normalize Root V1/Scene V1 as a frozen
  reference.
- Oracle normalization compares the ordered logical line/chunk sequence and
  canonical scalar facts independently of persistent-tree packing. It does not
  require an independently complete wrapper to share the incremental wrapper's
  topology fingerprint; exact subtree fingerprints are compared only where the
  transition claims exact retained authority.
- Oracle helper imports no private production stage and cannot feed data into
  change validation, dirty derivation, reconvergence, fallback, repair, or
  acceptance.

- [ ] **Step 1: Extend text/style tests to complete accepted roots**

For every required common fixture with a real target change assert:

```ts
expect(result.status).toBe("accepted-incremental")
expect(result.deliveryPlan.status).toBe("accepted")
expect(result.incrementalCandidateWork.completeOracleBuildCount).toBeUndefined()
expect(result.incrementalCandidateWork.completeSceneTraversalCount).toBe(0)
```

Rows whose validated target binding exactly equals the previous Root use the
Task 9 `accepted-no-op` identity result instead of manufacturing an
`accepted-incremental` Root.

- [ ] **Step 2: Add independent complete Root V2 oracle helper**

Build complete target material from fixture authorship outside the production
attempt. Invoke `createVNextTextBlockUnifiedLayoutRootV2(...)` independently,
record work only under `completeOracleWork`, and compare normalized facts.

- [ ] **Step 3: Run the tests and verify geometry/scene RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts
```

Expected: FAIL because flow/line candidates are not yet projected and accepted
as complete Root V2 results.

- [ ] **Step 4: Implement disposition-driven geometry projection**

Retain or rebuild exact fields according to disposition, enforce geometry work
limits before each line/fragment visit, derive next authored-box summary
compositionally, and block invalid translation/bounds without repairing from
oracle data.

- [ ] **Step 5: Implement scene transition and atomic Root acceptance**

Create replacement chunks from exact next line/source facts, path-copy the
scene, build and privately verify the canonical candidate delivery plan,
assemble the next Root V2, verify every dependency and target fingerprint,
then commit every new child, Scene V2, and Root V2 atomically through the Task 7
graph authority. Run the public plan inspector only on the accepted graph.

- [ ] **Step 6: Add oracle and V1 reference assertions**

Compare every accepted incremental and complete-fallback result with the
independent complete V2 oracle. Keep V1 normalization in test helper code and
assert no Root V1/Scene V1 production constructor call occurs in the attempt.

- [ ] **Step 7: Run the complete text/style/reconvergence gate**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 8: Commit**

```text
git add src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/helpers/textBlockUnifiedIncremental5b.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts
git commit -m "feat(layout): complete text and style Root V2 transitions"
```

### Task 15: 5B-2 Work-Policy Lock And Checkpoint Gate

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`
- Modify: `tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutReconvergenceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`
- Modify: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`

**Interfaces:**

- Publish checkpoint policy version `5b-2-v1`. Lock evidence, flow/tree,
  layout, and reconvergence limits using the exact deterministic calibration
  rule from the corrected 5B-1 gate. Extend active `5b-1-v2`; keep its already
  locked paint-source, structural-reuse, scene, and delivery rows byte-for-byte
  unchanged, and keep payload observations outside the work policy.
- Geometry executes under a `prelock` safety ceiling derived from the declared
  5B-2 text/style fixtures. It is exact, versioned, finite, fingerprinted, and
  threshold-tested, but Task 18 alone may mark geometry `locked` after the
  image/spatial matrix. Image and spatial stages remain `inactive`.
- If text/style fixtures show that a locked 5B-1 scene/delivery value must
  change, stop the checkpoint, version-bump that subpolicy, rerun the complete
  5B-1 binding matrix and independent review, and only then resume 5B-2.
- Required common fixtures are explicitly:
  - Thai and Latin insertion/deletion/replacement at start/middle/end;
  - hard-break and resolved-field adjacency;
  - identical rendered field text with changed provenance;
  - changed field text with equal metrics;
  - changed field text with changed metrics;
  - paint-only color;
  - equal-metric style identity/provenance change;
  - bounded local metric-affecting style;
  - 1-, 8-, 32-, 33-, 128-, and 2,048-line retained suffix scales.
- Every common fixture must be `accepted-incremental`, never planned-complete or
  complete fallback.
- Proof-failure and limit fixtures return exact fallback modes/reasons and keep
  candidate/fallback/oracle work separate.

- [ ] **Step 1: Record exact 5B-2 calibration evidence**

Run the declared fixture matrix in deterministic order and record requested/
consumed evidence, visited/reused/created source/flow nodes, recomputed lines,
proof nodes, disposition counts, reprojected lines/fragments, copied scene
nodes, operations, replacement payload, and zero forbidden traversal counts.
Use geometry observations only to derive the exact `prelock` safety ceiling;
do not label them as the 5B-3 geometry lock.

- [ ] **Step 2: Write failing 5B-2 policy and threshold assertions**

Generate the exact expected evidence/flow/layout/reconvergence lock rows and
geometry prelock rows from Step 1 in the test fixture, then assert source policy
constants, lock statuses, manifest rows, fingerprints, and
limit-minus-one/limit/limit-plus-one outcomes equal them.

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
```

Expected: FAIL because the source policy still has 5B-2 stages inactive and the
manifest does not yet contain the generated rows.

- [ ] **Step 3: Lock policy constants and fingerprints**

Apply the Task 10 calibration formula separately to evidence, flow/tree,
layout, and reconvergence units and mark them `locked`. Commit the exact
geometry `prelock` floor/absolute/relative values separately. Record all values
and the resulting `5b-2-v1` policy fingerprint in source and manifest. Add
limit-minus-one, limit, and limit-plus-one rows for every active or prelock
stage.

- [ ] **Step 4: Add fallback-honesty and hidden-scan tests**

Prove required changes start the real attempt; permitted or unsupported cases
use only allowlisted reasons; a large block alone never selects
planned-complete; and change/evidence request creation cannot traverse complete
next/suffix inputs.

- [ ] **Step 5: Add work-ledger and oracle-isolation tests**

Assert candidate work appears only in the attempt/fallback request, complete
fallback work only in completion, oracle work only in QA records, and disabling
the oracle helper does not change production results or fingerprints.

- [ ] **Step 6: Run the 5B-2 focused checkpoint**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts tests/textEngineMr1RangeFactsV1.test.ts tests/textEngineIncrementalRangeExecutionV1.test.ts
npm run type-check
git diff --check
```

Expected: PASS.

- [ ] **Step 7: Review and commit the 5B-2 checkpoint**

Run:

```text
git status --short
git diff --stat 29d3a61..HEAD
git diff --name-only 29d3a61..HEAD
git diff --stat
git diff --cached --stat
```

Then commit only the listed 5B-2 policy/manifest/test scope:

```text
git add src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
git commit -m "test(layout): close Phase 5B-2 text and style gate"
```

**5B-2 review stop:** Do not begin Task 16 until independent review confirms
required common fixtures are genuinely incremental, evidence requests and
proofs are bounded, E/T/R/N is exhaustive, translated reuse is strict, complete
oracle is external, assigned 5B-2 policies are locked, the geometry ceiling is
explicitly `prelock`, and the manifest contains no placeholder or changed
5B-1 policy without its required version-bump review.

---

## 5B-3 Image, Spatial, And Scale Closure

### Task 16: Inline-Image Incremental Change Families

**Files:**

- Create: `tests/textBlockUnifiedLayoutImageSpatialTransitionV1.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockIncrementalFlowTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionLayoutInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b.ts`

**Interfaces:**

- Extend the existing unified attempt; do not add an image-only public
  transition boundary.
- Required image changes:
  - insertion;
  - deletion;
  - movement within the same TextBlock flow;
  - outer frame width/height resize;
  - vertical alignment;
  - `fit/crop` paint fact.
- Image source/path changes update source state. Flow tree updates only for
  image presence/order, outer frame size, or vertical alignment. `fit/crop`
  remains the Task 9 paint-only path.
- Image changes that introduce no new text shaping facts use no producer
  request. Core updates U+FFFC source topology and break cursors from exact
  source/flow state.
- Image height/vertical alignment changes recompute every intersecting line band
  and re-query the spatial provider when an expanded image band can intersect
  exclusions.
- All required bounded image fixtures start the incremental attempt; no
  image-family case uses planned-complete because of block size or
  implementation complexity.

- [ ] **Step 1: Write failing insertion/deletion/movement tests**

Cover image-only, text-image-text, adjacent images, multiple images, move
forward/backward, start/end insertion, and deletion adjacent to hard break.
Assert exact source/flow path-copy work, zero producer request, correct
E/T/R/N, canonical scene delivery, and complete V2 oracle equality.

- [ ] **Step 2: Write failing frame/alignment/paint tests**

Cover width-only, height-only, width+height, baseline/middle/text-bottom, and
contain/cover/crop changes. Assert:

```ts
expect(paintOnly.incrementalCandidateWork.layout.recomputedLineCount).toBe(0)
expect(frameResize.incrementalCandidateWork.layout.recomputedLineCount)
  .toBeGreaterThan(0)
expect(frameResize.incrementalCandidateWork.evidence.requestCount).toBe(0)
```

- [ ] **Step 3: Write failing expanded-band re-query tests**

Place exclusions immediately outside the original image line band and inside
the resized band. Assert query bands include the stabilized expanded line band,
old/new seed facts are preserved, and the final layout matches complete V2.

- [ ] **Step 4: Run the image/spatial test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutImageSpatialTransitionV1.test.ts
```

Expected: FAIL for image insertion/deletion/movement/frame/alignment paths not
yet handled by the transition flow/layout stages.

- [ ] **Step 5: Implement image source/flow path copy**

Validate exact inline identity/dependency preconditions, apply U+FFFC topology
without shaping text, update layout-only image atoms for outer geometry/
alignment changes, enforce source/flow limits, and retain unaffected
offset-independent subtrees.

- [ ] **Step 6: Implement image-aware layout and geometry transition**

Seed recomputation from changed image source and previous/new line bands,
stabilize image-expanded bands with spatial re-query, attempt strict
reconvergence, then project line/geometry/scene dispositions and canonical
delivery.

- [ ] **Step 7: Run image, Phase 4B, and type checks**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutImageSpatialTransitionV1.test.ts tests/liveDraftMr1InlineImageGeometry4b.test.ts tests/textBlockPersistentFlowTreeV2.test.ts tests/textBlockSpatialWrappingLayoutV2.test.ts tests/textBlockAuthoredBoxGeometryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 8: Commit**

```text
git add src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockIncrementalFlowTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionLayoutInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/helpers/textBlockUnifiedIncremental5b.ts tests/textBlockUnifiedLayoutImageSpatialTransitionV1.test.ts
git commit -m "feat(layout): add incremental inline-image transitions"
```

### Task 17: Exclusion And Authored-Box Spatial Transition

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionSpatialInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockUnifiedSpatialStateV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionLayoutInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockUnifiedLayoutImageSpatialTransitionV1.test.ts`

**Interfaces:**

```ts
export interface VNextTextBlockUnifiedLayoutSpatialStageAcceptedV1 {
  status: "accepted"
  nextSpatialState: VNextTextBlockUnifiedSpatialStateV1
  nextFlowRegionProviderAuthority:
    VNextTextBlockUnifiedFlowRegionProviderAuthorityV2
  seedRegion: VNextTextBlockLayoutSeedRegionV1
  work: VNextTextBlockIncrementalCandidateWorkV1["spatial"]
}

export function transitionVNextTextBlockUnifiedLayoutSpatialInternalV1(input: {
  previousRoot: VNextTextBlockUnifiedLayoutRootV2
  change: VNextTextBlockValidatedChangeV1
  flowStage: VNextTextBlockUnifiedLayoutFlowStageAcceptedV1
  limits: VNextTextBlockSpatialStageLimitsV1
}): VNextTextBlockUnifiedLayoutSpatialStageResultV1
```

- Exclusion insertion/deletion/movement/resize path-copies the task-specific
  exclusion treap and derives:

```text
old affected band union new affected band = mandatory recomputation seed
```

- The union is a minimum seed, never a maximum invalidation boundary. Layout
  continues until exact/translated reconvergence or deterministic limit.
- Overlay-only changes with unchanged flow intervals may retain layout
  internals but must update authored extent/scene facts when geometry requires.
- Authored-box width/inset change is `permitted`. Core derives exact content
  width/origin changes from the complete next authored-box plan, starts a real
  attempt when policy permits, and may return only allowlisted
  `planned-complete` reasons recorded in policy.
- Authored-box policy paths are exact:
  - top/bottom inset only with unchanged content width and flow intervals
    starts a bounded attempt, retains exact line internals, and rebuilds
    affected authored geometry/scene;
  - compensated left/right inset change with unchanged content width starts a
    bounded attempt, retains exact flow/layout internals, and rebuilds shifted
    authored geometry/scene;
  - a width change with local rewrap starts a bounded attempt and continues to
    exact/translated reconvergence or a deterministic limit;
  - a derived whole-block width impact may be `planned-complete` only when an
    allowlisted fact is proven from registered bounded summaries without
    walking the block; otherwise Core starts a bounded attempt and reports
    proof/work-limit fallback factually;
  - inconsistent outer width/insets/content width blocks at the change gate;
    and
  - fixed-height/overflow-shaped input blocks as outside Phase 5B.
- Width, line count, block size, or implementation complexity alone can never
  select `planned-complete`.
- Before the spatial stage, the flow stage path-copies source state to replace
  the authored-box plan and reuses the exact layout-only flow tree. The spatial
  stage consumes that accepted flow result, creates a new spatial-state wrapper
  for changed width/context, and may retain the exact exclusion-treap child
  when entry facts are unchanged.
- Caller input never supplies bands, affected lines, ripple extent, or reuse.

- [ ] **Step 1: Write failing exclusion change matrix**

Cover insert/delete/move/resize for left/right/central/multiple exclusions,
top-bottom barrier, overlay, full-width zero-space advancement, and changes
that ripple beyond the initial seed. Assert exact old/new/union bands,
path-copy index work, spatial queries, reconvergence, and oracle parity.

- [ ] **Step 2: Write failing authored-box matrix**

Cover the exact authored-box policy rows above at first/middle/last affected
regions: top/bottom inset with unchanged content width, compensated left/right
inset with unchanged content width, local rewrap, bounded-summary-proven
whole-block impact, inconsistent outer width/insets/content width, and
fixed-height/overflow-shaped input. Assert the exact attempt,
`planned-complete`, or blocked path and exact reason. Add a large-block row
whose local rewrap still starts incrementally, proving block size alone cannot
select `planned-complete`.

- [ ] **Step 3: Run the spatial transition test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutImageSpatialTransitionV1.test.ts
```

Expected: FAIL because exclusion and authored-box transition stages are absent.

- [ ] **Step 4: Implement exclusion treap updates and seed derivation**

Reuse accepted persistent treap internals, support insert/delete/move/resize
with exact geometry-owner validation, compute old/new bands from registered
entries, union safely, enforce spatial node/query-band limits, and return no
partial index on block/fallback.

- [ ] **Step 5: Implement authored-box source and transition policy**

Validate the exact next plan and current owner/context, derive layout-unit
width/insets through existing conversion kernels, path-copy the source-state
authored-box item while retaining the exact flow tree, classify allowlisted
whole-block impacts, reject any non-width/inset plan drift, and keep
fixed-height/overflow shaped input blocked.

- [ ] **Step 6: Wire spatial seed/ripple through layout, geometry, and scene**

Recompute the complete mandatory seed, proceed line-by-line under layout
limits, stop only at valid reconvergence, reproject authored geometry, path-copy
scene, and emit the canonical delivery plan.

- [ ] **Step 7: Run spatial, image, and Phase 3/4 regressions**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutImageSpatialTransitionV1.test.ts tests/textBlockUnifiedSpatialStateV1.test.ts tests/textBlockSpatialIndexUpdateV1.test.ts tests/textBlockSpatialWrappingLayoutV2.test.ts tests/textBlockAuthoredBoxGeometryV2.test.ts tests/liveDraftMr1SpatialWrapping3a.test.ts tests/liveDraftMr1AuthoredBoxGeometry4a.test.ts tests/liveDraftMr1InlineImageGeometry4b.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 8: Commit**

```text
git add src/layout/textBlockUnifiedLayoutTransitionSpatialInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedSpatialStateV1.ts src/layout/textBlockUnifiedLayoutTransitionLayoutInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutImageSpatialTransitionV1.test.ts
git commit -m "feat(layout): add spatial and authored-box transitions"
```

### Task 18: 5B-3 Policy Lock, Scale/Parity, Public Handoff, And Full Gate

**Files:**

- Create: `tests/textBlockUnifiedLayoutScaleV2.test.ts`
- Create: `tests/textBlockUnifiedLayoutNodeWasmParityV2.test.ts`
- Create: `docs/LIVE_DRAFT_MR1_UNIFIED_INCREMENTAL_ROOT_5B.md`
- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`
- Modify: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`
- Modify: `src/index.ts`
- Modify: `README.md`
- Modify: `docs/PHASE_LEDGER.md`

**Interfaces:**

- Publish final checkpoint policy version `5b-3-v1`. Lock spatial/index/
  query-band, image, and geometry policies using the Task 10 deterministic
  calibration rule; replace the 5B-2 geometry `prelock` entry with the
  fixture-bound `locked` entry.
- Keep locked 5B-1 paint-source/structural-reuse/scene/delivery and 5B-2
  evidence/flow/layout/reconvergence subpolicies unchanged. Any required value
  change triggers an explicit subpolicy version bump plus rerun and independent
  review of its original binding checkpoint before Phase 5B may close.
- Scale rows include small/long text, small/long mixed text/images,
  32/128/2,048/6,000-line TextBlocks, 0/1/128/1,024 exclusions, first/middle/
  last changes, translated and exact suffixes, proof failure, and every
  threshold boundary.
- Node-native and Worker-WASM rows must produce exact equal accepted bounded
  evidence, next Root V2 semantic/layout/spatial/scene facts, normalized
  fingerprints, and deterministic counters.
- Public surface is re-audited against the reviewed Section 6 boundary. No
  stage helper, policy calibrator, registry, test seam, oracle helper, Root V1
  extension, or Scene V1 extension is newly exported.
- Handoff publishes fixture/policy manifest, frozen ownership map, PASS,
  FAIL/BLOCKER, RISK, UNKNOWN, changed files/behavior, tests, work-policy
  evidence, risks left, and intentionally unchanged repositories/capabilities.

- [ ] **Step 1: Add deterministic scale and threshold fixtures**

Assert work grows with copied paths/recomputed regions rather than complete
retained suffix size. For accepted common paths require:

```ts
expect(work.completeNextInputTraversalCount).toBe(0)
expect(work.completeSuffixTraversalCount).toBe(0)
expect(work.completeSceneTraversalCount).toBe(0)
expect(work.completeChildRehashCount).toBe(0)
expect(work.sceneV1MaterializationCount).toBe(0)
```

Record actual deterministic counts in the manifest; keep timing observations
outside outputs/fingerprints and label them fixture/runtime-specific.

- [ ] **Step 2: Add Node-native / Worker-WASM parity**

Run bounded text/style edits and image/spatial rows whose shaping facts remain
equal across runtimes. Compare request, producer response, accepted evidence,
line dispositions, scene delivery, Root V2, complete delivery, and counters.

- [ ] **Step 3: Lock 5B-3 policy constants and boundary rows**

Apply the calibration formula separately for spatial nodes, query bands,
recomputed image lines, geometry lines/fragments, copied scene nodes,
replacement chunks, and plan operations. Keep payload bytes in the separate
observation matrix and never calibrate an execution limit from them. Commit
exact work-limit values, the final `5b-3-v1` policy fingerprint,
limit-minus-one/limit/limit-plus-one results, and oracle identity to source and
manifest. Scene/delivery rows are validation rows against the locked 5B-1
subpolicy, not an implicit recalibration.

- [ ] **Step 4: Complete adversarial, lifetime, and ownership gates**

Add cross-family forged changes, incompatible spatial translation, boundary
crossing, image-expanded-band omission, policy drift, retain-cover forgery,
digest collision, candidate contamination, thousands of sequential accepted
roots with deterministic reachability checks, and public/private ownership
assertions.

- [ ] **Step 5: Re-run the public-boundary guard before export changes**

Run:

```text
npx vitest run --config vitest.config.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
```

Expected: FAIL only for any final reviewed inspector/export not yet present;
private stage helpers must remain unreachable.

- [ ] **Step 6: Finalize the reviewed public exports**

Export only:
  - Root V2 complete bootstrap and inspector;
  - transition evidence request/acceptance and inspectors;
  - unified transition attempt and result inspector;
  - complete fallback and fallback-request inspector;
  - Persistent Scene V2 inspector;
  - incremental scene-delivery inspector; and
  - complete V2 recovery delivery and inspector.

Keep change validator, source/flow/spatial/line builders, stage functions,
authority registries, calibration helpers, collision seam, and oracle helper
private.

- [ ] **Step 7: Write the Phase 5B handoff and ledgers**

Document all three checkpoint commits and review results, exact manifest/policy
fingerprints, frozen Core/Worker/Editor/Backend ownership, V1 reference versus
V2 active roles, process-local authority versus clone-safe data, remaining
product-scale unknowns, and every intentionally false capability. Update
`README.md` and `docs/PHASE_LEDGER.md` without claiming Phase 5C, publication,
production, or V1 retirement.

- [ ] **Step 8: Run the complete focused Phase 5B gate**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockIncrementalFlowTreeV1.test.ts tests/textBlockUnifiedSpatialStateV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutImageSpatialTransitionV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/textBlockUnifiedLayoutScaleV2.test.ts tests/textBlockUnifiedLayoutNodeWasmParityV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

Expected: PASS.

- [ ] **Step 9: Run the full Core gate**

Run:

```text
npm run check
```

Expected: PASS for the complete repository suite and type-check.

- [ ] **Step 10: Inspect final staged scope**

Run:

```text
git status --short
git diff --stat 29d3a61..HEAD
git diff --name-only 29d3a61..HEAD
git diff --stat
git diff --cached --stat
git diff --cached --name-only
```

Expected: only reviewed Phase 5B Core source/tests/fixtures/docs, no Editor,
Backend, Phase 5C, V1 behavior changes, generated noise, or unrelated user
changes.

- [ ] **Step 11: Commit the final 5B-3 checkpoint**

```text
git add src/index.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json tests/textBlockUnifiedLayoutScaleV2.test.ts tests/textBlockUnifiedLayoutNodeWasmParityV2.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts docs/LIVE_DRAFT_MR1_UNIFIED_INCREMENTAL_ROOT_5B.md README.md docs/PHASE_LEDGER.md
git commit -m "feat(layout): complete unified incremental root phase 5b"
```

**5B-3 final review stop:** Phase 5B closes only after all three checkpoints
pass independent review, the complete focused gate and `npm run check` pass,
manifest/policies are frozen, Node/WASM parity and lifetime/collision gates
pass, no forbidden traversal appears, and every Editor/Backend/Phase 5C/
publication/production capability remains unchanged and false.

---

## Design Coverage Map

| Design sections | Plan coverage |
| --- | --- |
| 1-2 Decision and goals | Tasks 1-18 and all three review stops |
| 3 Non-goals | Global constraints; Tasks 10 and 18 public/scope gates |
| 4-5 Ownership and V1/V2 boundary | Tasks 2-7, 10, and 18 |
| 6 Public boundary | Tasks 10 and 18 |
| 7 Bootstrap/private pipeline/atomic acceptance | Tasks 7-9 and 12-17 |
| 8 Tagged change contract | Tasks 1 and 8 |
| 9 Eligibility | Tasks 1, 12, 15-18 |
| 10 Result/fallback/work lanes | Tasks 1, 8-10, 15, and 18 |
| 11 Producer evidence | Tasks 8 and 11 |
| 12 No-op and paint-only | Task 9 |
| 13-14 Dispositions and reconvergence | Tasks 4, 13, and 14 |
| 15 Spatial seed | Tasks 16 and 17 |
| 16 Persistent Scene V2 | Tasks 5, 7, 9, and 14 |
| 17-19 Delivery, payload, recovery | Tasks 5, 6, 10, 14, and 18 |
| 20 Work policies | Tasks 1, 10, 15, and 18 |
| 21 Future binding compatibility | Tasks 1, 2, 12, and 18 |
| 22 Error and recovery | Tasks 1, 7-10, 15, and 18 |
| 23 Lifetime correctness | Tasks 7, 10, and 18 |
| 24 Verification matrices | Tasks 10-18 |
| 25 Checkpoints | Task 10, Task 15, and Task 18 review stops |
| 26 Risks | Global constraints plus adversarial/policy/lifetime gates |
| 27-28 Unknowns and deferred decisions | Task 18 handoff |
| 29 Required handoff artifacts | Task 10 manifest; Task 18 manifest/ownership/report |
| 30 Phase 5B stop-gate | Task 18 focused/full gates and final review stop |
| 2026-07-31 capability/identity corrections | Separate 5B-1 corrective plan plus amended Tasks 12, 15, 17, and 18 |

---

## Plan Self-Review Checklist

- Every Phase 5B design section maps to at least one task.
- All three checkpoints have an explicit independent review stop.
- Root V1 and Scene V1 remain frozen reference lanes.
- Root V2 complete bootstrap and complete fallback are independent of Root V1,
  Scene V1, and incremental candidates.
- Complete fallback prepares an unregistered graph, validates the full
  family-neutral target binding, and only then performs one atomic graph commit.
- Complete next material never enters request creation or the incremental
  attempt.
- The caller never supplies ranges, bands, reconvergence, reuse, fallback, or
  work policy.
- Paint facts are separated from layout-only flow facts.
- Persistent source, flow, spatial, line, and scene structures are
  TextBlock-transition-specific rather than generic frameworks.
- Evidence request creation, line proof, and scene plan inspection are bounded
  by summary paths and declared replacement payload.
- E/T/R/N covers are mutually exclusive, exhaustive, and canonical.
- Strict translated reuse proves internals, source/provenance, constant delta,
  spatial compatibility, authored bounds, and boundary semantics.
- Scene delivery uses immutable domains, canonical operation order, and the
  maximal-subtree retain cover canonical for the exact tree/policy/range tuple.
- Root/Scene semantic fingerprints remain separate from work policy,
  construction provenance, fixture calibration, and payload observation as
  assigned by the approved design.
- Complete bootstrap and fallback use one complete-construction kernel while
  fallback still receives only independently supplied complete material.
- Effect classification is Core-derived and rendered equality cannot erase
  source/provenance identity.
- Exact process-local authority never relies on fingerprint equality and does
  not create strong previous-root history chains.
- Candidate, fallback, and oracle work ledgers remain separate.
- Work policies use deterministic fixture-derived constants, exact boundary
  tests, explicit inactive/prelock/locked status, versioned fingerprints, and
  no wall-clock path selection.
- Required common changes are genuinely incremental.
- Complete oracle is QA-only, independent, and unable to influence production
  decisions.
- Forced digest collision, deterministic lifetime, public/private boundary,
  Node/WASM parity, focused, and full Core gates are present.
- No Worker protocol, Editor/Backend behavior, fixed-height/asset lifecycle,
  Columns/Table, data-binding runtime, production activation, or V1 retirement
  enters the plan.
