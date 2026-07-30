# Unified Incremental Root Transition 5B-1 Corrective Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the implemented Phase 5B-1 foundation so its contracts and
evidence honestly separate structural reuse, semantic identity, payload
observation, work policy, calibration evidence, and process-local authority
before Phase 5B-2 begins.

**Architecture:** Preserve the existing Root V2 and Persistent Scene V2
task-specific graph, exact weak-key authority registries, shared complete
construction kernel, and paint-only path copying. Add explicit semantic versus
composite identity layers, move payload estimation out of semantic summaries
and execution work, report whole-subtree reuse under its own bounded stage,
derive effect classification inside Core, and bind delivery to both semantic
and payload-observation facts.

**Tech Stack:** TypeScript 6 ESM, Vitest 4, canonical JSON plus compact SHA-256
fingerprints, immutable persistent TextBlock-specific trees, and the existing
FlowDoc Core fixture/policy manifest.

## Global Constraints

- Execute only after the user has approved
  `docs/superpowers/specs/2026-07-30-unified-incremental-root-transition-5b-design.md`
  through the 2026-07-31 identity refinement. The approved design commit is
  `fc60c18`.
- Before Task 1, re-read `AGENTS.md`, `README.md`,
  `docs/WORKSPACE_BOUNDARY.md`, `docs/LEGACY_MIGRATION_GATE.md`,
  `docs/PHASE_LEDGER.md`, and the tests named by each task. Revalidate branch,
  HEAD, working tree, and `origin/main` divergence. Stop and report any
  difference other than the reviewed plan-only commit.
- Work only in `flowdoc-vnext-core`. Do not modify `flowdoc-vnext-editor` or
  `flowdoc-vnext-backend`.
- This plan is a corrective Phase 5B-1 gate. It does not authorize Phase 5B-2,
  Phase 5B-3, Phase 5C, Editor/Backend work, publication, production
  activation, or V1 retirement.
- Root V1 and Scene V1 remain frozen compatibility/QA references. Do not add
  fields, behavior, or exports to them.
- Root V2 and Persistent Scene V2 remain the active process-local lane. The
  corrective patch replaces the unreviewed local 5B-1 contract shape before
  any product publication; their existing `contractVersion: 2` identifiers
  remain the only accepted V2 runtime shape.
- Runtime `contractVersion`, `workPolicyId`/work-policy fingerprint, and
  manifest `fixtureCalibrationRevision` are independent axes.
- Publish active work policy `5b-1-v2`. Preserve the existing locked numeric
  limits, add structural-reuse proof `(floor=1, absolute=4, relative=1/1)`,
  remove payload bytes from execution policy, and keep `5b-1-v1` only as
  superseded evidence.
- Root `semanticFingerprint` excludes construction provenance, work policy,
  fixture calibration revision, work ledgers, and payload observations.
- Root composite `fingerprint` continues to bind construction provenance,
  exact dependency fingerprints, and the active work policy.
- Persistent Scene `fingerprint` is structural-semantic for the exact
  scene-tree topology and scene-tree policy. It excludes payload-estimation
  policy, byte observations, and build/path-copy work.
- Every Scene subtree and Scene wrapper carries a separate compositional
  `payloadObservationFingerprint` plus
  `estimatedCanonicalPayloadByteCount`.
- Payload estimates are observational only. They do not appear in
  `stageWork`, work-policy rows, effective-limit bases, fallback reasons, or
  execution-path selection.
- Paint-only accepted results must satisfy:

```text
result.root.lineTree === previousRoot.lineTree
lineTreeWrapperAllocationCount = 0
completeLineTreeTraversalCount = 0
```

- Whole-subtree proof is reported only as `structural-reuse-proof`. It is not
  layout reconvergence, does not enumerate every line, and leaves the
  5B-1 `layout-reconvergence` stage inactive.
- Complete bootstrap and complete fallback call the same private
  `prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2` kernel.
  Fallback still validates exact request/policy authority and target binding
  before atomic registration.
- Canonical retain-cover uniqueness is relative to
  `(treePolicyFingerprint, exact registered tree authority, ordinal range)`.
  Foreign, cloned, unregistered, or policy-mismatched alternate shapes block.
- Core derives effect classification; the caller cannot provide it. The closed
  classes are `true-no-op`, `semantic-only-change`,
  `paint-affecting-change`, and `geometry-affecting-change`, accompanied by
  `semanticIdentityChanged`.
- Semantic-only transition execution remains inactive in 5B-1. Tests may
  exercise the private classification kernel without claiming that resolved
  field or style transition capability is open.
- Keep `incrementalCandidateWork`, `completeFallbackWork`, and
  `completeOracleWork` separate. Preserve zero complete-next-input,
  complete-suffix, and complete-scene traversal claims on accepted hot paths.
- Use TDD for every task: add the failing focused test, run it and observe the
  expected failure, implement the minimum contract-preserving change, rerun
  the focused gate and `npm run type-check`, then commit only the coherent
  passing task.
- Do not push or merge.

---

## File Responsibility Map

- `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts` — effect
  classification, structural-reuse work, observational payload facts, and
  closed stage/unit contracts.
- `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts` — active `5b-1-v2`
  execution policy and deterministic stage limits.
- `src/layout/textBlockPersistentSceneContractV2.ts` — structural-semantic
  Scene summaries/nodes plus separate payload observations.
- `src/layout/textBlockPersistentSceneV2.ts` — semantic and payload
  fingerprint composition, complete build, paint path copy, and Scene
  authority inspection.
- `src/layout/textBlockSceneDeliveryContractV2.ts` — retain/splice and complete
  delivery bindings for both semantic Scene identity and payload observation.
- `src/layout/textBlockSceneDeliveryV2.ts` — canonical cover selection,
  bounded verification, payload observation, and complete delivery.
- `src/layout/textBlockUnifiedLayoutRootContractV2.ts` — Root semantic and
  composite identity fields.
- `src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.ts` — exact shell,
  dependency, semantic fingerprint, and composite fingerprint inspection.
- `src/layout/textBlockUnifiedLayoutRootV2.ts` — the one private complete
  construction kernel and incremental Root assembly.
- `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts` — Core-derived
  expected target binding and effect classification.
- `src/layout/textBlockUnifiedLayoutTransitionV1.ts` — no-op/paint orchestration,
  exact line-tree retention, corrected work ledger, and atomic acceptance.
- `src/layout/textBlockUnifiedLayoutFallbackV1.ts` — exact fallback envelope
  and shared-kernel invocation.
- `src/index.ts` — reviewed active-policy/public inspectors only.
- `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json` — runtime
  contract versions, active work-policy identity, independent calibration
  revision, capability status, and exact counter evidence.
- `tests/textBlockPersistentSceneV2.test.ts` — Scene identity split.
- `tests/textBlockSceneDeliveryV2.test.ts` — delivery identity and canonical
  retain-cover proof.
- `tests/textBlockUnifiedLayoutRootV2.test.ts` — Root semantic/composite
  identity.
- `tests/textBlockUnifiedLayoutFallbackV1.test.ts` — shared complete-kernel
  parity and fallback authority.
- `tests/textBlockUnifiedLayoutTransitionContractV1.test.ts` — closed
  classification/work/version contracts.
- `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts` — exact
  paint/no-op reuse and ledger behavior.
- `tests/textBlockUnifiedLayoutAdversarialV2.test.ts` — collision, clone,
  policy, candidate, and authority failures.
- `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts` — public boundary,
  manifest, false capabilities, and checkpoint gate.

## Corrective Review Order

1. Tasks 1-3 establish corrected structural work, Scene, and delivery
   contracts.
2. Tasks 4-5 establish Root identity, complete-kernel parity, and Core-owned
   effect classification.
3. Task 6 closes canonical-cover and adversarial authority evidence.
4. Task 7 freezes `5b-1-v2`, runs the full gate, commits the corrective
   checkpoint, and stops for user review.

No Phase 5B-2 task starts before Task 7 passes and the user explicitly accepts
the corrected 5B-1 checkpoint.

### Task 1: Structural-Reuse Work Contract And Active 5B-1-v2 Policy

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionChangeInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionContractV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`
- Modify: `tests/helpers/textBlockUnifiedLayoutRootV2.ts`

**Interfaces:**

- Consumes: the existing transition V1 result/fallback contracts and the
  fixture-calibrated `5b-1-v1` limits.
- Produces:

```ts
export type VNextTextBlockUnifiedLayoutStageV1 =
  | "change-gate"
  | "evidence"
  | "source-flow"
  | "spatial-index"
  | "structural-reuse-proof"
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
  | "selected-exact-subtree-nodes"
  | "recomputed-lines"
  | "proof-nodes"
  | "reprojected-lines"
  | "visited-fragments"
  | "copied-scene-nodes"
  | "replacement-chunks"
  | "delivery-operations"
  | "retain-cover-nodes"

readonly structuralReuseProof: {
  readonly selectedExactSubtreeNodeCount: number
  readonly lineTreeWrapperAllocationCount: 0
  readonly completeLineTreeTraversalCount: 0
}
readonly deliveryPlan: {
  readonly deliveryOperationCount: number
  readonly retainCoverNodeCount: number
}
readonly observations: {
  readonly estimatedCanonicalPayloadByteCount: number
  readonly payloadObservationFingerprint: string | null
}
readonly stageWork: readonly VNextTextBlockStageWorkCountV1[]
```

- `layout.proofNodeCount` remains available for the inactive 5B-2
  reconvergence lane and is `0` in every 5B-1 accepted result.
- Remove `estimated-canonical-payload-bytes` from the stage-unit union,
  work-policy stages, previous-summary-base selection, and limit evaluation.
- Export active constants:

```ts
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_ID =
  "5b-1-v2" as const

const policy5b1V2Stages = Object.freeze([
  locked("source-flow", "source-items", 1, 4, 1),
  inactive("source-flow", "flow-atoms", "5B-2"),
  inactive("source-flow", "flow-tree-nodes", "5B-2"),
  inactive("spatial-index", "spatial-index-nodes", "5B-3"),
  inactive("spatial-index", "spatial-query-bands", "5B-3"),
  locked(
    "structural-reuse-proof",
    "selected-exact-subtree-nodes",
    1,
    4,
    1,
  ),
  inactive("layout-reconvergence", "recomputed-lines", "5B-2"),
  inactive("layout-reconvergence", "proof-nodes", "5B-2"),
  inactive("geometry", "reprojected-lines", "5B-3"),
  inactive("geometry", "visited-fragments", "5B-3"),
  locked("scene", "copied-scene-nodes", 2, 16, 1),
  locked("scene", "replacement-chunks", 1, 4, 1),
  locked("delivery-plan", "delivery-operations", 4, 16, 1),
  locked("delivery-plan", "retain-cover-nodes", 16, 64, 1),
] satisfies readonly VNextTextBlockStageLimitV1[])
```

- Keep the old `5b-1-v1` facts private only if a regression fixture needs
  them; do not export them from `src/index.ts` or use them for new roots.

- [ ] **Step 1: Write failing contract and policy tests**

Add assertions that:

```ts
expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_ID).toBe("5b-1-v2")
expect(activePolicy.stages).toContainEqual(expect.objectContaining({
  stage: "structural-reuse-proof",
  unit: "selected-exact-subtree-nodes",
  lockStatus: "locked",
  smallBlockFloor: 1,
  absoluteStageLimit: 4,
  relativeNumerator: 1,
  relativeDenominator: 1,
}))
expect(activePolicy.stages.some(
  (row) => row.unit === "estimated-canonical-payload-bytes",
)).toBe(false)
```

Also assert the empty work ledger has zero structural proof, null payload
observation fingerprint, and no payload-size `stageWork` entry.

- [ ] **Step 2: Write failing exact paint/no-op reuse tests**

For first/middle/last image paint changes and true no-op, assert:

```ts
expect(paint.root.lineTree).toBe(previous.root.lineTree)
expect(paint.incrementalCandidateWork.structuralReuseProof).toEqual({
  selectedExactSubtreeNodeCount: 1,
  lineTreeWrapperAllocationCount: 0,
  completeLineTreeTraversalCount: 0,
})
expect(paint.incrementalCandidateWork.layout).toMatchObject({
  recomputedLineCount: 0,
  proofNodeCount: 0,
  completeSuffixTraversalCount: 0,
})
expect(paint.incrementalCandidateWork.stageWork).not.toContainEqual(
  expect.objectContaining({ stage: "layout-reconvergence" }),
)
expect(noOp.root).toBe(previous.root)
expect(noOp.persistentScene).toBe(previous.root.persistentScene)
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
```

Expected: FAIL because the structural stage/unit and `5b-1-v2` policy do not
exist, payload bytes still appear as an execution unit, and the whole-subtree
proof is still reported under layout reconvergence.

- [ ] **Step 4: Implement the corrected work, policy, and orchestration**

Add the structural/observation records to
`createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1`, remove the
payload execution unit, add the locked structural row, and update the fixture
helper to build new roots only with
`VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2`.

Rename the orchestration helper to
`allExactStructuralReuseDispositions`, emit only
`structural-reuse-proof/selected-exact-subtree-nodes`, leave
`layout.proofNodeCount` at zero, remove the payload stage-work row and
inactive-stage exceptions, and pass `input.previousRoot.lineTree` directly to
the incremental Root candidate. Until Task 3 adds delivery observation
fingerprints, set `observations.payloadObservationFingerprint` to `null` while
retaining the exact deterministic byte observation.

- [ ] **Step 5: Add structural threshold-boundary assertions**

Evaluate the active structural row at attempted work `3`, `4`, and `5` with
previous summary base `128` and exact delta `1`. Require within-limit,
within-limit, and limit-exceeded respectively. These are policy calibration
tests; accepted 5B-1 fixtures still select one exact root subtree.

- [ ] **Step 6: Run the contract/foundation tests and type-check**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 7: Commit**

```text
git add src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutTransitionChangeInternalsV1.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/helpers/textBlockUnifiedLayoutRootV2.ts
git commit -m "refactor(layout): separate structural reuse work policy"
```

### Task 2: Persistent Scene Semantic And Payload-Observation Identity

**Files:**

- Modify: `src/layout/textBlockPersistentSceneContractV2.ts`
- Modify: `src/layout/textBlockPersistentSceneV2.ts`
- Modify: `src/layout/textBlockSceneDeliveryV2.ts`
- Modify: `tests/textBlockPersistentSceneV2.test.ts`
- Modify: `tests/textBlockSceneDeliveryV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`
- Modify: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`

**Interfaces:**

- Consumes: exact line/source authority and the existing task-specific balanced
  Scene tree.
- Produces:

```ts
export interface VNextTextBlockPersistentScenePayloadPolicyV2 {
  readonly payloadPolicyVersion: 1
  readonly canonicalEncoding: "utf8-canonical-json"
  readonly fieldAllowlistFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentScenePayloadObservationV2 {
  readonly estimatedCanonicalPayloadByteCount: number
  readonly payloadObservationFingerprint: string
}

export interface VNextTextBlockPersistentSceneSummaryV2 {
  readonly chunkCount: number
  readonly lineCount: number
  readonly textFragmentCount: number
  readonly inlineImageFragmentCount: number
  readonly leafCount: number
  readonly nodeCount: number
  readonly sourceRange: VNextTextBlockPersistentLayoutSourceRangeV1
  readonly authoredTopLayoutUnit: number | null
  readonly authoredBottomLayoutUnit: number | null
  readonly lineInternalsFingerprint: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly paintFingerprint: string
  readonly boundarySpatialContextFingerprint: string
}

export interface VNextTextBlockPersistentSceneLeafV2 {
  readonly nodeKind: "leaf"
  readonly height: 0
  readonly chunk: VNextTextBlockPersistentSceneChunkV2
  readonly summary: VNextTextBlockPersistentSceneSummaryV2
  readonly payloadObservation:
    VNextTextBlockPersistentScenePayloadObservationV2
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentSceneBranchV2 {
  readonly nodeKind: "branch"
  readonly height: number
  readonly children: readonly VNextTextBlockPersistentSceneNodeV2[]
  readonly summary: VNextTextBlockPersistentSceneSummaryV2
  readonly payloadObservation:
    VNextTextBlockPersistentScenePayloadObservationV2
  readonly fingerprint: string
}

export interface VNextTextBlockPersistentSceneV2 {
  readonly policy: VNextTextBlockPersistentScenePolicyV2
  readonly payloadPolicy: VNextTextBlockPersistentScenePayloadPolicyV2
  readonly root: VNextTextBlockPersistentSceneRootV2
  readonly summary: VNextTextBlockPersistentSceneSummaryV2
  readonly payloadObservation:
    VNextTextBlockPersistentScenePayloadObservationV2
  readonly work: VNextTextBlockPersistentSceneWorkV2
  readonly fingerprint: string
}
```

- The empty root carries an observation of zero bytes whose fingerprint still
  binds the payload-policy fingerprint and empty semantic-root fingerprint.
- Leaf semantic fingerprints compose chunk fingerprint, semantic summary, and
  Scene-tree policy only. Branch semantic fingerprints compose ordered child
  semantic fingerprints, semantic summary, and Scene-tree policy only.
- Leaf/branch payload observation fingerprints compose semantic node
  fingerprint, payload-policy fingerprint, byte count, and ordered child
  payload-observation fingerprints.
- Scene semantic canonical facts exclude `payloadPolicy`,
  `payloadObservation`, and `work`.
- Valid Scene candidate/registered inspections return both
  `fingerprint` and `payloadObservationFingerprint`; invalid inspections never
  accept a cloned object carrying equal values.
- The private test-only builder may accept a second exact payload-policy object
  with the same encoding but a different policy fingerprint. It remains absent
  from `src/index.ts`.

- [ ] **Step 1: Write failing semantic/payload split tests**

For one complete Scene and one paint-path-copied Scene, assert:

```ts
expect(scene.summary).not.toHaveProperty(
  "estimatedCanonicalPayloadByteCount",
)
expect(scene.payloadObservation.estimatedCanonicalPayloadByteCount)
  .toBeGreaterThan(0)
expect(scene.payloadObservation.payloadObservationFingerprint)
  .toMatch(/^sha256:/)
expect(scene.root).toHaveProperty("payloadObservation")
```

Build equal semantic material with two test-only payload policies and assert:

```ts
expect(left.scene.fingerprint).toBe(right.scene.fingerprint)
expect(left.scene.root.fingerprint).toBe(right.scene.root.fingerprint)
expect(left.scene.payloadObservation.payloadObservationFingerprint)
  .not.toBe(right.scene.payloadObservation.payloadObservationFingerprint)
```

- [ ] **Step 2: Run the Scene test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentSceneV2.test.ts
```

Expected: FAIL because byte estimates currently participate in summaries,
node fingerprints, Scene canonical facts, and Scene work.

- [ ] **Step 3: Implement semantic and observation composers**

Add private functions with these responsibilities:

```ts
function payloadObservation(
  semanticFingerprint: string,
  estimatedCanonicalPayloadByteCount: number,
  payloadPolicyFingerprint: string,
  childObservationFingerprints: readonly string[],
): VNextTextBlockPersistentScenePayloadObservationV2

function sceneSemanticFacts(
  scene: VNextTextBlockPersistentSceneV2,
): unknown
```

Remove the byte estimate from semantic summaries and work records. Compute the
Scene-level observation as header bytes plus root bytes without inserting that
count or payload policy into `scene.fingerprint`.

- [ ] **Step 4: Adapt existing delivery consumers without changing delivery identity yet**

Replace every read of
`scene.summary.estimatedCanonicalPayloadByteCount` with
`scene.payloadObservation.estimatedCanonicalPayloadByteCount`. Update manual
Scene fixtures to place observations on nodes/Scene wrappers. Preserve the
Task 2 delivery contract shape temporarily so existing delivery behavior stays
green; Task 3 performs the separately reviewable delivery identity split.

- [ ] **Step 5: Preserve exact path-copy authority**

Update sibling references and incremental fragment inspection to bind both
`node.fingerprint` and
`node.payloadObservation.payloadObservationFingerprint`. Retained sibling
identity must still be exact object identity; neither fingerprint grants
authority.

- [ ] **Step 6: Run Scene/delivery/adversarial tests and type-check**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 7: Commit**

```text
git add src/layout/textBlockPersistentSceneContractV2.ts src/layout/textBlockPersistentSceneV2.ts src/layout/textBlockSceneDeliveryV2.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
git commit -m "refactor(layout): split scene semantic and payload identity"
```

### Task 3: Delivery Semantic And Payload Binding

**Files:**

- Modify: `src/layout/textBlockSceneDeliveryContractV2.ts`
- Modify: `src/layout/textBlockSceneDeliveryV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockSceneDeliveryV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`
- Modify: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`

**Interfaces:**

- Consumes: semantic Scene fingerprints, exact prepared/registered Scene
  authority, subtree payload observations, and canonical half-open ranges.
- Produces:

```ts
export type VNextTextBlockSceneDeliveryOperationV2 =
  | {
      readonly kind: "retain-range"
      readonly previousRange: VNextTextBlockSceneDeliveryRangeV2
      readonly nextRange: VNextTextBlockSceneDeliveryRangeV2
      readonly retainedSubtrees: readonly {
        readonly previousPath: readonly number[]
        readonly fingerprint: string
        readonly payloadObservationFingerprint: string
        readonly chunkCount: number
      }[]
    }
  | {
      readonly kind: "splice-range"
      readonly previousRange: VNextTextBlockSceneDeliveryRangeV2
      readonly nextRange: VNextTextBlockSceneDeliveryRangeV2
      readonly replacementChunks:
        readonly VNextTextBlockPersistentSceneChunkV2[]
    }

export interface VNextTextBlockSceneDeliveryPlanV2 {
  readonly previousSceneFingerprint: string
  readonly nextSceneFingerprint: string
  readonly previousPayloadObservationFingerprint: string
  readonly nextPayloadObservationFingerprint: string
  readonly previousTreePolicyFingerprint: string
  readonly nextTreePolicyFingerprint: string
  readonly summary: {
    readonly retainOperationCount: number
    readonly spliceOperationCount: number
    readonly retainedSubtreeCount: number
    readonly replacementChunkCount: number
  }
  readonly observations: {
    readonly estimatedCanonicalPayloadByteCount: number
    readonly payloadObservationFingerprint: string
  }
  readonly work: {
    readonly visitedOperationCount: number
    readonly visitedRetainCoverNodeCount: number
    readonly visitedReplacementChunkCount: number
    readonly completePreviousSceneTraversalCount: 0
    readonly completeNextSceneTraversalCount: 0
  }
  readonly fingerprint: string
}

```

- Delivery `fingerprint` is a composite delivery/integrity fingerprint and
  binds semantic plus observation facts. Payload bytes remain outside `work`.
- Plan verification receives exact previous/next Scene objects, checks exact
  authority, checks tree-policy fingerprints, then checks every retained
  semantic and payload-observation fingerprint without walking a complete
  retained subtree.
- A valid plan inspection returns `fingerprint` and
  `payloadObservationFingerprint` plus the existing bounded coverage/work
  counts.

- [ ] **Step 1: Write failing delivery binding tests**

Assert the plan exposes separate `summary`, `observations`, and `work`, and
assert a forged retained payload observation fails with
`delivery-plan-retain-cover-mismatch`. Complete-delivery separation is tested
in Task 4 after Root semantic identity exists.

Also assert:

```ts
expect(plan.summary).not.toHaveProperty(
  "estimatedCanonicalPayloadByteCount",
)
expect(plan.work).not.toHaveProperty(
  "estimatedCanonicalPayloadByteCount",
)
expect(plan.observations.estimatedCanonicalPayloadByteCount)
  .toBeGreaterThan(0)
```

- [ ] **Step 2: Run delivery tests and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockSceneDeliveryV2.test.ts
```

Expected: FAIL because the plan currently binds only Scene fingerprints and
stores payload bytes in its semantic summary.

- [ ] **Step 3: Implement bounded delivery observation composition**

Compose plan observation fingerprint from:

```ts
{
  previousSceneFingerprint,
  nextSceneFingerprint,
  previousPayloadObservationFingerprint,
  nextPayloadObservationFingerprint,
  estimatedCanonicalPayloadByteCount,
  operationPayloadObservationFingerprints,
}
```

Do not add the observation to work-policy evaluation or fallback selection.

- [ ] **Step 4: Update transition observation binding and plan inspectors**

Read the plan byte count/fingerprint from `plan.observations`, copy those facts
to `incrementalCandidateWork.observations`, and keep them out of `stageWork`.
Update plan inspectors to validate semantic summary, observation, and bounded
work independently. Task 4 binds complete delivery after Root
`semanticFingerprint` exists.

- [ ] **Step 5: Run delivery/transition tests and type-check**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```text
git add src/layout/textBlockSceneDeliveryContractV2.ts src/layout/textBlockSceneDeliveryV2.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
git commit -m "refactor(layout): bind delivery semantic and payload facts"
```

### Task 4: Root Semantic Fingerprint And Shared Complete-Kernel Parity

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutRootContractV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutFallbackV1.ts`
- Modify: `src/layout/textBlockSceneDeliveryContractV2.ts`
- Modify: `src/layout/textBlockSceneDeliveryV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockUnifiedLayoutRootV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutFallbackV1.test.ts`
- Modify: `tests/textBlockSceneDeliveryV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`

**Interfaces:**

- Consumes: semantic child fingerprints, exact child objects, active
  work-policy identity, and the existing private complete-candidate kernel.
- Produces:

```ts
export interface VNextTextBlockUnifiedLayoutRootV2 {
  readonly semanticDependencyFingerprints: {
    readonly sourceState: string
    readonly flowTree: string
    readonly spatialState: string
    readonly flowRegionProviderAuthority: string
    readonly lineTree: string
    readonly authoredBoxSummary: string
    readonly persistentScene: string
  }
  readonly dependencyFingerprints: {
    readonly sourceState: string
    readonly flowTree: string
    readonly spatialState: string
    readonly flowRegionProviderAuthority: string
    readonly lineTree: string
    readonly authoredBoxSummary: string
    readonly persistentScene: string
    readonly workPolicy: string
  }
  readonly constructionKind:
    VNextTextBlockUnifiedLayoutRootConstructionKindV2
  readonly constructionFingerprint: string
  readonly semanticFingerprint: string
  readonly fingerprint: string
}
```

- Root semantic facts contain runtime contract/source identity, document/
  section/TextBlock/layout identity, semantic dependency fingerprints, and
  capability flags. They exclude `inputAuthority`, work policy, construction
  kind/fingerprint, payload observations, and work ledgers.
- Root composite canonical facts contain `semanticFingerprint`,
  `dependencyFingerprints`, `constructionKind`, `constructionFingerprint`,
  exact process-local capability/authority facts, and active work policy.
- Exact authority inspection verifies both fingerprints and every exact child.
- Valid Root inspection returns `fingerprint`, `semanticFingerprint`,
  `persistentSceneFingerprint`, and
  `persistentScenePayloadObservationFingerprint`.
- Valid transition-result inspection returns composite/semantic Root identity
  and semantic/observation Scene identity when a Root exists; all four fields
  are null for fallback-required/blocked results.
- Complete delivery adds:

```ts
export interface VNextTextBlockCompleteSceneDeliveryV2 {
  readonly rootFingerprint: string
  readonly rootSemanticFingerprint: string
  readonly persistentSceneFingerprint: string
  readonly persistentScenePayloadObservationFingerprint: string
  readonly chunks: readonly VNextTextBlockPersistentSceneChunkV2[]
  readonly summary: VNextTextBlockPersistentSceneSummaryV2
  readonly observations:
    VNextTextBlockPersistentScenePayloadObservationV2
  readonly work: {
    readonly completeDeliveryCount: 1
    readonly visitedSceneNodeCount: number
    readonly emittedChunkCount: number
  }
  readonly fingerprint: string
}
```

- Complete delivery `work` excludes payload bytes. Its composite fingerprint
  binds Root composite and semantic identities, Scene semantic and observation
  identities, semantic summary, observations, chunks, and work.
- Keep this single construction signature:

```ts
export function prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
  input: VNextTextBlockUnifiedLayoutRootBuildInputV2,
  workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1,
  constructionKind: "complete-bootstrap" | "complete-fallback",
): VNextTextBlockUnifiedLayoutRootCompleteCandidateResultV2
```

- Add this private test-only observer beside the complete kernel; keep it out
  of `src/index.ts`:

```ts
export function setVNextTextBlockUnifiedLayoutCompleteKernelObserverForTestInternalV2(
  observer:
    | ((constructionKind:
        "complete-bootstrap" | "complete-fallback") => void)
    | null,
): void
```

- `createVNextTextBlockUnifiedLayoutRootCompleteInternalV2` invokes it with
  `"complete-bootstrap"`. The fallback boundary validates exact request/policy
  authority first, then invokes the same function with
  `"complete-fallback"`.

- [ ] **Step 1: Write failing Root identity tests**

For equal complete material built under two valid policy objects, assert:

```ts
expect(left.root.semanticFingerprint)
  .toBe(right.root.semanticFingerprint)
expect(left.root.fingerprint).not.toBe(right.root.fingerprint)
```

For equal semantic material built through bootstrap and fallback, assert equal
semantic dependency fingerprints and Root semantic fingerprints while
construction kinds and composite fingerprints differ.

- [ ] **Step 2: Write failing complete-delivery binding tests**

Assert complete delivery exposes Root composite/semantic and Scene
semantic/observation fingerprints, stores bytes under `observations`, and does
not expose `estimatedCanonicalPayloadByteCount` under `work`.

- [ ] **Step 3: Run Root/fallback/delivery tests and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockSceneDeliveryV2.test.ts
```

Expected: FAIL because Root has no separate semantic fingerprint and parity is
currently inferred only from individual target-binding fields.

- [ ] **Step 4: Implement Root semantic/composite composition**

Add:

```ts
export function canonicalVNextTextBlockUnifiedLayoutRootSemanticFactsInternalV2(
  root: VNextTextBlockUnifiedLayoutRootV2,
): string
```

Compute `semanticFingerprint` from that canonical string. Include it in the
composite Root canonical facts and in the exact prepared/registered authority
record.

- [ ] **Step 5: Bind complete delivery**

Populate complete delivery from the exact registered Root/Scene pair. Verify
Root semantic/composite fingerprints, Scene semantic/observation fingerprints,
semantic summary, observation, chunks, and traversal work separately.

- [ ] **Step 6: Lock one complete construction kernel**

Keep complete flow/spatial/layout/scene construction only in
`prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2`. Place the
test observer at the first line inside that kernel. Run one bootstrap and one
fallback and require the observer sequence to equal
`["complete-bootstrap", "complete-fallback"]`; reset the observer in a
`finally` block. No bootstrap/fallback boundary may invoke child complete
builders directly.

- [ ] **Step 7: Run Root/fallback/delivery/authority tests and type-check**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 8: Commit**

```text
git add src/layout/textBlockUnifiedLayoutRootContractV2.ts src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.ts src/layout/textBlockUnifiedLayoutRootV2.ts src/layout/textBlockUnifiedLayoutFallbackV1.ts src/layout/textBlockSceneDeliveryContractV2.ts src/layout/textBlockSceneDeliveryV2.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
git commit -m "refactor(layout): separate root semantic authority"
```

### Task 5: Core-Derived Effect Classification

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionContractV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`

**Interfaces:**

- Consumes: exact previous target binding, Core-derived expected target binding,
  and whether the change family requires geometry/layout recomputation.
- Produces:

```ts
export type VNextTextBlockUnifiedLayoutEffectClassV1 =
  | "true-no-op"
  | "semantic-only-change"
  | "paint-affecting-change"
  | "geometry-affecting-change"

export interface VNextTextBlockUnifiedLayoutEffectClassificationV1 {
  readonly effectClass: VNextTextBlockUnifiedLayoutEffectClassV1
  readonly semanticIdentityChanged: boolean
  readonly fingerprint: string
}

export interface VNextTextBlockValidatedChangeV1 {
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly eligibility: VNextTextBlockUnifiedLayoutEligibilityV1
  readonly producerEvidence: "required" | "not-required"
  readonly expectedTargetBinding: VNextTextBlockExpectedTargetBindingV1
  readonly effectClassification:
    VNextTextBlockUnifiedLayoutEffectClassificationV1
  readonly fingerprint: string
}
```

- The private classifier signature is:

```ts
export function deriveVNextTextBlockUnifiedLayoutEffectClassificationInternalV1(
  input: {
    readonly previousTargetBinding:
      VNextTextBlockExpectedTargetBindingV1
    readonly expectedTargetBinding:
      VNextTextBlockExpectedTargetBindingV1
    readonly requiresGeometryRecomputation: boolean
  },
): VNextTextBlockUnifiedLayoutEffectClassificationV1
```

- Classification order is deterministic:

```text
geometry required or layout/authored-box/spatial/content changed
  -> geometry-affecting-change
else paint changed
  -> paint-affecting-change
else semantic/source/provenance changed
  -> semantic-only-change
else every target-binding field equal
  -> true-no-op
```

- For the 5B-1 binder,
  `requiresGeometryRecomputation` is `false` only for `no-op` and
  `image-paint-fact-change`; every inactive text/style/image-topology/spatial/
  authored-box family is conservatively `true`. Phase 5B-2 may pass `false`
  for a resolved-field/style row only after its own bounded Core proof shows
  unchanged rendered content, paint, layout dependency, and geometry.
- `semanticIdentityChanged` is true when semantic, source, or provenance
  fingerprint changes. Visual/rendered equality cannot override it.
- The caller envelope continues to reject `effectClassification`,
  `effectClass`, and `semanticIdentityChanged` as unknown/Core-owned fields.

- [ ] **Step 1: Write failing four-class matrix**

Exercise the private classifier with exact frozen target bindings for:

1. every field equal;
2. source/provenance changed while rendered, paint, and layout facts remain
   equal;
3. paint changed with geometry equal; and
4. layout dependency changed.

Require the four effect classes in order and require
`semanticIdentityChanged: true` only in row 2 and in combined semantic plus
paint/geometry rows.

- [ ] **Step 2: Write failing bound-change tests**

Assert bound no-op is `true-no-op`, unchanged image fit/crop is
`true-no-op`, changed image fit/crop is `paint-affecting-change`, and an
inactive text change is classified `geometry-affecting-change` before it is
blocked by the inactive 5B-2 stage.

- [ ] **Step 3: Run contract/foundation tests and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
```

Expected: FAIL because validated changes do not carry a Core-derived effect
classification.

- [ ] **Step 4: Implement and bind the classifier**

Derive the previous binding with
`deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1`, classify only
after exact Root/change/policy validation succeeds, add classification to the
validated-change fingerprint, and never read classification from caller data.

- [ ] **Step 5: Run classification/change-gate tests and type-check**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts
npm run type-check
```

Expected: PASS without activating text, resolved-field, or style transition.

- [ ] **Step 6: Commit**

```text
git add src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
git commit -m "feat(layout): derive unified transition effects in core"
```

### Task 6: Canonical Retain-Cover And Adversarial Identity Gates

**Files:**

- Modify: `src/layout/textBlockSceneDeliveryV2.ts`
- Modify: `tests/textBlockSceneDeliveryV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutFallbackV1.test.ts`

**Interfaces:**

- Consumes: exact prepared previous/next Scene authority, exact Scene-tree
  policy fingerprint, and a zero-based half-open ordinal range.
- Produces the unique cover for the tuple:

```text
(scene.policy.fingerprint, exact scene.root object, range.start, range.end)
```

- The selector visits children in stored left-to-right order. It selects a node
  immediately when the node is wholly contained and never descends below a
  selected node. It rejects gaps, overlap, reordering, nonmaximal
  decomposition, cloned nodes, foreign Scenes, and policy mismatch.
- The fixtures assert the active tree policy exactly:

```ts
expect(scene.policy).toMatchObject({
  policyVersion: 1,
  maximumBranchChildren: 8,
  splitOverflowLeftCount: 4,
  splitOverflowRightCount: 5,
  underflowBorrowOrder: ["left", "right"],
  underflowMergeOrder: ["left", "right"],
  collapseUnaryRoot: true,
})
```

  “Largest” means the highest fully contained ancestor, so equal numeric
  subtree sizes do not create a tie; stored child order is the only
  left-to-right order.
- Different registered histories are not constructible in 5B-1 because
  insert/delete topology transition is inactive. The manifest records that
  capability as false; tests must not introduce a generic test-only tree
  mutation API to simulate it.

- [ ] **Step 1: Write failing deterministic-cover fixtures**

Use 8-, 9-, 17-, and 33-chunk Scenes and ranges that begin/end inside
different branches. Assert exact left-to-right `previousPath` arrays and that
every selected node is the highest fully contained ancestor.

- [ ] **Step 2: Write failing alternate-authority fixtures**

Assert all of the following block:

- reversed retained-subtree order;
- leaf-level decomposition where a parent is fully contained;
- a cloned retained subtree with equal fingerprints;
- a second complete Scene with equal normalized renderer chunks but different
  exact node identity;
- a forged Scene-tree policy fingerprint; and
- a retained subtree whose semantic fingerprint matches but payload
  observation fingerprint does not.

- [ ] **Step 3: Run delivery/adversarial tests and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
```

Expected: FAIL first because
`previousTreePolicyFingerprint`/`nextTreePolicyFingerprint` and retained
`payloadObservationFingerprint` are missing from the current plan contract.

- [ ] **Step 4: Tighten exact tuple verification**

Keep `selectMaximalNodes` private and task-specific. Verify exact Scene
authority before selection, bind both Scene-tree policy fingerprints in the
plan, compare paths in left-to-right order, and compare exact selected node
identity before semantic/observation fingerprints.

- [ ] **Step 5: Add complete-kernel and collision adversarial rows**

Require:

- bootstrap/fallback equal semantic fingerprints under equal complete material;
- different construction/composite fingerprints;
- target mismatch candidates remain unregistered;
- forced semantic digest collision cannot confer exact Scene or Root authority;
  and
- fallback never receives a partial incremental candidate.

- [ ] **Step 6: Run authority gates and type-check**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 7: Commit**

```text
git add src/layout/textBlockSceneDeliveryV2.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts
git commit -m "test(layout): lock canonical retain cover authority"
```

### Task 7: Manifest, Public Gate, Full Verification, And 5B-1 Review Stop

**Files:**

- Modify: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`
- Modify: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`
- Modify: `src/index.ts`
- Modify: `README.md`
- Modify: `docs/PHASE_LEDGER.md`
- Create: `docs/LIVE_DRAFT_MR1_UNIFIED_INCREMENTAL_ROOT_5B.md`

**Interfaces:**

- The manifest top level records:

```json
{
  "manifestVersion": 1,
  "runtimeContractVersions": {
    "rootV2": 2,
    "persistentSceneV2": 2,
    "transitionV1": 1,
    "sceneDeliveryV2": 2
  },
  "fixtureCalibrationRevision": 2,
  "policy": {
    "policyId": "5b-1-v2"
  }
}
```

- The exact active locked rows are:

```text
source-flow/source-items                         1, 4, 1/1
structural-reuse-proof/selected-exact-subtree-nodes
                                                  1, 4, 1/1
scene/copied-scene-nodes                          2, 16, 1/1
scene/replacement-chunks                          1, 4, 1/1
delivery-plan/delivery-operations                 4, 16, 1/1
delivery-plan/retain-cover-nodes                 16, 64, 1/1
```

- Remove payload bytes from `lockedStageLimits`, `inactiveUnits`,
  `inactiveUnitExceptions`, and `thresholdRows`. Keep exact payload byte counts
  only inside each fixture `observations`.
- Every fixture records `capabilityStatus` and `transitionExecuted`.
  `5b1-empty-structural` is `structural-calibration` with
  `transitionExecuted: false`; `5b1-128-line-exclusion` is
  `inactive-reference` with `transitionExecuted: false`.
- Record these false capabilities:

```json
{
  "emptyBlockIncrementalTransition": false,
  "exclusionIncrementalTransition": false,
  "semanticOnlyIncrementalTransition": false,
  "alternateRegisteredTreeHistoryNormalization": false,
  "workerSessionProtocol": false,
  "editorApply": false,
  "backendPersistence": false,
  "productionActivation": false
}
```

- Public exports replace the active `5b-1-v1` policy constant with
  `VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2`. Test-only payload
  policy builders, collision factories, selectors, registries, classification
  helpers, complete candidate kernel, and fallback candidate observer remain
  private.

- [ ] **Step 1: Write failing manifest/public-boundary assertions**

Assert the exact runtime versions, calibration revision, active policy ID,
six locked rows, no payload execution unit, structural threshold row, explicit
fixture capability statuses, and false capability map. Assert private helpers
are absent from `src/index.ts`. Build one Root before and after changing only
an in-memory manifest clone from `fixtureCalibrationRevision: 2` to `3`;
because the manifest is not a runtime builder input, assert the same exact
Root semantic/composite fingerprints and assert neither Root nor Scene exposes
`fixtureCalibrationRevision`.

- [ ] **Step 2: Run the handoff test and verify RED**

Run:

```text
npx vitest run --config vitest.config.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
```

Expected: FAIL because the manifest still identifies `5b-1-v1`, lacks the
independent calibration revision/capability statuses, and carries payload bytes
as an inactive execution unit.

- [ ] **Step 3: Update manifest and public surface**

Write exact observed counters from the passing deterministic fixtures. Compute
the active policy fingerprint from
`VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2.fingerprint` and place that
exact value in the manifest; the handoff test must compare equality rather than
match a pattern.

- [ ] **Step 4: Update handoff documentation**

In `README.md`, `docs/PHASE_LEDGER.md`, and
`docs/LIVE_DRAFT_MR1_UNIFIED_INCREMENTAL_ROOT_5B.md`, report:

- whole-subtree exact structural reuse, not reconvergence;
- semantic/payload observation identity split;
- Root semantic/composite identity split;
- one shared complete construction kernel;
- object-graph reachability/retention proof only;
- active/inactive capability facts; and
- unchanged Editor, Backend, Phase 5C, publication, and production status.

- [ ] **Step 5: Run the complete focused corrective gate**

Run:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

Expected: PASS.

- [ ] **Step 6: Run the complete Core gate**

Run:

```text
npm run check
```

Expected: PASS for the full Vitest suite and TypeScript type-check.

- [ ] **Step 7: Inspect final scope**

Run:

```text
git status --short
git diff --stat fc60c18..HEAD
git diff --name-only fc60c18..HEAD
git diff --stat
git diff --cached --stat
git diff --cached --name-only
```

Expected: only the Core Phase 5B-1 files listed in this plan, no Root/Scene V1
behavior changes, no Editor/Backend files, no Phase 5B-2/5C implementation, and
no unrelated user changes.

- [ ] **Step 8: Commit the corrective checkpoint**

```text
git add src/index.ts fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts README.md docs/PHASE_LEDGER.md docs/LIVE_DRAFT_MR1_UNIFIED_INCREMENTAL_ROOT_5B.md
git commit -m "test(layout): close corrected Phase 5B-1 gate"
```

**5B-1 corrective review stop:** Stop after this commit. Report PASS,
FAIL/BLOCKER, RISK, UNKNOWN, changed files/behavior, exact tests and counts,
risks left, and intentionally unchanged capabilities/repositories. Do not
start Phase 5B-2 until the user reviews and explicitly authorizes it.

---

## Forward Checkpoint Amendments

After the corrected 5B-1 review passes, the existing
`docs/superpowers/plans/2026-07-30-unified-incremental-root-transition-5b.md`
continues with 5B-2 and 5B-3 subject to these locked amendments:

- 5B-2 target/oracle comparisons use Root `semanticFingerprint`, semantic
  dependency facts, normalized ordered renderer data, and separate payload
  observations; they never require composite fingerprint equality across
  construction provenance.
- 5B-2 activates real layout reconvergence separately from the already locked
  structural-reuse stage.
- 5B-2 resolved-field/style fixtures distinguish true no-op, semantic-only,
  paint-affecting, and geometry-affecting paths without treating rendered
  equality as semantic equality.
- Every later work-policy revision preserves the separation between runtime
  contract version, work-policy ID/fingerprint, and fixture calibration
  revision.
- 5B-3 authored-box fixtures use the exact Section 9 matrix: top/bottom inset
  with unchanged content width, compensated left/right inset with unchanged
  content width, local rewrap, derived whole-block impact, inconsistent outer
  width/insets, and fixed-height/overflow-shaped input. Width or block size
  alone never selects `planned-complete`.
- 5B-3 validates different registered topology histories only when
  insertion/deletion can create them; until then the capability remains false.

## Design Coverage Map

| Approved design requirement | Corrective task |
| --- | --- |
| Runtime/work-policy/calibration version layers | Tasks 1, 4, and 7 |
| Shared complete construction kernel | Tasks 4 and 6 |
| Core-derived effect classification | Task 5 |
| Exact paint line-tree identity | Task 1 |
| Structural proof is not reconvergence | Task 1 |
| Semantic/payload Scene identity split | Task 2 |
| Delivery binds semantic plus observation facts | Task 3 |
| Payload cannot select execution/fallback | Tasks 1, 3, and 7 |
| Root semantic/composite identity split | Task 4 |
| Canonical cover relative to exact tree/policy/range | Tasks 3 and 6 |
| Object-graph retention claim only | Task 7 handoff |
| Forced collision and exact authority | Tasks 2, 4, and 6 |
| Explicit false/inactive capabilities | Tasks 6 and 7 |
| Authored-box exact policy matrix | Forward 5B-3 amendment |
| 5B-1 independent review stop | Task 7 |

## Plan Self-Review Checklist

- Every 2026-07-31 approved design correction maps to an implementation task or
  an explicit forward-checkpoint amendment.
- The plan does not call structural reuse reconvergence.
- Paint-only next Root retains the exact previous line-tree object and reports
  zero line-tree wrapper allocation/traversal.
- Scene semantic fingerprints exclude payload policy, payload observations,
  and build/path-copy work.
- Root semantic fingerprints exclude construction, work policy, calibration,
  payload observation, and work ledgers.
- Composite Scene delivery and Root authority fingerprints retain all required
  integrity bindings.
- Payload byte estimates appear only as observations and never as stage work,
  limits, fallback reasons, or execution selectors.
- The active `5b-1-v2` limits are exact and fixture-calibrated.
- Complete bootstrap and fallback share one private complete kernel while
  fallback remains candidate-independent.
- Effect classification is Core-owned, closed, fingerprinted, and does not
  falsely activate semantic-only transition execution.
- Canonical cover is deterministic relative to exact tree authority and policy,
  with no generic persistent framework or test-only topology mutation API.
- Empty and 128-exclusion fixtures remain explicit calibration/reference rows,
  not capability claims.
- Lifetime wording remains object-graph reachability/retention only.
- No task authorizes 5B-2, 5B-3, Worker protocol, Editor/Backend behavior,
  publication, production activation, V1 retirement, or push/merge.
