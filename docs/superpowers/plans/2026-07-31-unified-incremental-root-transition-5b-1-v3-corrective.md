# Unified Incremental Root Transition 5B-1 V3 Corrective Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the three remaining Phase 5B-1 review findings by making every
bounded work claim operation-owned, making fallback authority arise only from
the branch that actually failed, and making detached complete delivery prove
all nested identities that its own canonical facts can support.

**Architecture:** Keep Root V2, Persistent Scene V2, Transition V1, and Scene
Delivery V2 as the runtime contract versions. Instrument the existing
TextBlock-specific persistent operations while public wrappers still use the
frozen `5b-1-v2` policy; derive and review a private 21-row `5b-1-v3` policy;
then add branch-owned proof/limit authorities and atomically move every active
Core boundary to V3. Complete delivery remains descriptor-safe and detached:
it recomposes locally provable identities through owner-specific private
helpers without treating fingerprints as process-local authority.

**Tech Stack:** TypeScript 6 ESM, Vitest 4, immutable task-specific persistent
trees, canonical JSON plus SHA-256 fingerprints, weak-key process-local
authority registries, and checked-in JSON fixture evidence.

## Global Execution Constraints

- Work only in
  `C:\Users\nekot\Documents\GitHub\flowdoc-vnext-core\.worktrees\phase-5b-unified-incremental-root-transition`.
  Do not modify the Editor or Backend repositories.
- Before Task 1, re-read `AGENTS.md`, `README.md`,
  `docs/WORKSPACE_BOUNDARY.md`, `docs/LEGACY_MIGRATION_GATE.md`, and the two
  approved 5B design documents. Revalidate branch, HEAD, working tree, and
  actual divergence from `origin/main`. Stop and report any unreviewed change.
- The approved design baseline is commit `9789c6b`, plus the plan-status and
  sequencing corrections committed with this plan. The historical V2 plan and
  review artifacts remain unchanged evidence.
- Do not push, merge, publish, activate production behavior, or touch V1
  compatibility structures.
- This plan authorizes only the corrective 5B-1 work. It does not authorize
  5B-2 text/style transition, 5B-3 image/spatial/scale work, Worker lifecycle,
  Editor apply, Backend persistence, data binding, Columns/Table, or V1
  retirement.
- Runtime contract versions stay Root V2 = 2, Persistent Scene V2 = 2,
  Transition V1 = 1, and Scene Delivery V2 = 2. Policy identity and fixture
  calibration revision are independent version axes.
- V2 remains the sole public active policy throughout 5B-1C-1. V3 remains a
  private candidate until the explicit numeric-policy review stop and until
  proof/limit fallback authorities exist in 5B-1C-2.
- When V3 activates, all public constructors, transition/fallback wrappers,
  Root validation, tests, and the manifest move atomically. Do not add an
  adapter or operate V2 and V3 as two active lanes.
- Existing V2 Roots then fail with `invalid-work-policy`; callers recover only
  by complete V3 bootstrap. V2 may remain private only where a frozen
  historical regression fixture needs it.
- Every policy-bound V3 `stageWork` ledger has exactly the 21 policy rows in
  policy order, including factual zeros. Missing, duplicate, reordered, and
  extra rows are invalid. No `?? 1`, caller estimate, or orchestration default
  may create nonzero work.
- Counts originate where operations occur. The transition orchestrator only
  aggregates exact operation results.
- A countable visit checks its exact limit before the visit. Completed detail
  excludes the rejected visit; the policy attempt and limit reason include the
  rejected next unit. No traversal continues after exhaustion.
- Payload bytes remain observation only. They never influence policy limits,
  fallback selection, or Root/Scene semantic identity.
- Complete fallback and complete bootstrap continue to call the one private
  `prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2` kernel.
- Keep `incrementalCandidateWork`, `completeFallbackWork`, and
  `completeOracleWork` separate. A partial incremental candidate never enters
  complete fallback.
- Use TDD for every task: write one focused failing behavior, run it and observe
  the expected RED, implement the smallest coherent change, rerun the focused
  gate plus `npm run type-check`, self-review the diff, and commit.
- Never claim a checkpoint complete from an earlier run. Run its stated gate
  after its last code change and record the fresh result.

## Canonical V3 Work Vocabulary

The five added unit literals are reused only at the following seven ordered
rows:

| Order addition | Stage | Unit |
| ---: | --- | --- |
| 1 | `source-flow` | `source-lookup-nodes` |
| 2 | `source-flow` | `source-path-copy-nodes` |
| 3 | `source-flow` | `source-leaf-items` |
| 4 | `structural-reuse-proof` | `line-tree-lookup-nodes` |
| 5 | `scene` | `line-tree-lookup-nodes` |
| 6 | `scene` | `scene-tree-lookup-nodes` |
| 7 | `delivery-plan` | `scene-tree-lookup-nodes` |

Together with the existing 14 V2 rows, V3 has exactly 21 rows: 13 locked and
eight inactive. Preserve the existing relative order of the 14 rows and place
each new row immediately after the related existing unit within its stage.

Detailed operation work extends the current contract without changing its
version:

```ts
readonly flow: {
  readonly visitedSourceItemCount: number
  readonly visitedSourceLookupNodeCount: number
  readonly copiedSourcePathNodeCount: number
  readonly visitedChangedSourceLeafItemCount: number
  // existing flow fields remain
}
readonly structuralReuseProof: {
  readonly visitedLineTreeNodeCount: number
  readonly selectedExactSubtreeNodeCount: number
  readonly lineTreeWrapperAllocationCount: 0
  readonly completeLineTreeTraversalCount: 0
}
readonly scene: {
  readonly visitedLineTreeNodeCount: number
  readonly visitedSceneTreeNodeCount: number
  readonly copiedSceneNodeCount: number
  readonly replacementChunkCount: number
}
readonly deliveryPlan: {
  readonly visitedSceneTreeNodeCount: number
  readonly deliveryOperationCount: number
  readonly retainCoverNodeCount: number
}
```

`selectedExactSubtreeNodeCount`, `copiedSceneNodeCount`,
`replacementChunkCount`, `deliveryOperationCount`, and
`retainCoverNodeCount` retain their reviewed result-size meanings. Lookup work
is never folded into them.

## File Responsibility Map

- `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts` — closed work,
  fallback, and issue vocabulary.
- `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts` — canonical 21-row ledger,
  exhaustive previous-summary base selection, calibration math, and the exact
  work-limit evaluator.
- `src/layout/textBlockUnifiedLayoutTransitionChangeInternalsV1.ts` — canonical
  zero-work value only; it does not invent accepted work.
- `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts` — exact
  validated-change record and change-binding work.
- `src/layout/textBlockUnifiedLayoutSourceStateV1.ts` — source lookup,
  source-path-copy, source-leaf work, and source-owned paint facts.
- `src/layout/textBlockPersistentLayoutLineContractV1.ts` and
  `src/layout/textBlockPersistentLayoutLineTreeV1.ts` — line lookup/cover work
  and line-owned mapping, lineage, internals, and geometry facts.
- `src/layout/textBlockPersistentSceneContractV2.ts` and
  `src/layout/textBlockPersistentSceneV2.ts` — Scene lookup/copy work and
  Scene-owned fragment/chunk fact composition.
- `src/layout/textBlockSceneDeliveryContractV2.ts` and
  `src/layout/textBlockSceneDeliveryV2.ts` — one internally verified delivery
  candidate, factual delivery work, and detached complete-delivery inspection.
- `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts` — consumes
  exact prepared Scene/Delivery authority; it does not reverify the plan.
- `src/layout/textBlockUnifiedLayoutTransitionV1.ts` — orchestration,
  canonical aggregation, branch result mapping, and atomic Root acceptance.
- `src/layout/textBlockUnifiedLayoutFallbackV1.ts` — branch-owned fallback
  authority registries, exact request creation, and shared-kernel completion.
- `src/layout/textBlockUnifiedLayoutRootV2.ts` — active-policy validation and
  the shared complete Root kernel.
- `src/index.ts` — V3-only active public policy boundary after activation.
- `tests/helpers/textBlockUnifiedLayoutRootV2.ts` — V3 fixture bootstrap after
  activation.
- `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts` — fixed calibration
  matrix and live-to-checked-in evidence equality.
- `fixtures/live-draft-unified-incremental-root-5b-work-calibration.v3.json` —
  raw observations, derived limits, threshold rows, formula version, and
  fixture identities.
- `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json` — active
  policy/fixture identity and frozen capability/ownership claims.

## Calibration Rule And Mandatory Review Stop

Calibration is deterministic, checked in, and test-recomputed. For every one
of the 13 locked rows:

1. collect factual attempted work from the fixed 1, 8, 9, 64, 65, and 128
   fixture matrix across beginning/middle/end targets, minimum/maximum leaf
   width, every produced tree height, true no-op, image semantic no-op, image
   paint change, proof failure, and limit probes;
2. set `smallBlockFloor` to the next power of two at least as large as the
   maximum observed attempt whose exact previous-summary base is at most 9;
3. set `absoluteStageLimit` to the next power of two at least as large as four
   times the maximum observed attempt in the whole matrix;
4. keep `relativeDenominator = 1` and choose the smallest positive safe integer
   `relativeNumerator` for which every accepted calibration observation is at
   or below
   `max(floor, min(absolute, ceil(previousBase * numerator) + exactDelta))`;
5. emit threshold-minus-one, threshold, and threshold-plus-one evaluations for
   each row; and
6. fail closed if a row has no observation, arithmetic is unsafe, or no finite
   result satisfies the matrix.

Zero observed work still produces the minimum finite power-of-two value `1`;
it never produces an unbounded or placeholder limit. The formula is recorded
as `calibrationFormulaVersion: 1`. Changing the formula increments fixture
calibration revision, not runtime contract version.

**Mandatory stop:** Task 5 produces exact numeric values and a private V3
candidate, commits them, and stops. The user must review those values before
Task 6 begins. Plan approval alone does not waive this numeric-policy stop.

---

## Checkpoint 5B-1C-1: Factual Work Foundation

### Task 1: Add Closed Work Vocabulary And Canonical Ledger Composition

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionChangeInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutFallbackV1.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionContractV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutFallbackV1.test.ts`

**Interfaces:**

```ts
export function composeVNextTextBlockStageWorkLedgerInternalV1(input: {
  readonly policy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly factualCounts: readonly VNextTextBlockStageWorkCountV1[]
}): readonly VNextTextBlockStageWorkCountV1[]

export function previousVNextTextBlockStageSummaryBaseInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly unit: VNextTextBlockUnifiedLayoutStageUnitV1
}): number
```

`compose...` rejects unknown rows, inactive nonzero work, duplicate rows,
unsafe counts, and stage/unit mismatches, then emits exactly the policy rows in
policy order with missing factual rows filled as zero. It may create zeros but
never a nonzero count.

- [ ] **Step 1: Write the RED contract tests.** Assert the five new unit
  literals, seven placements, detailed zero fields, and the exact provisional
  V3 row-definition count. Assert duplicate, unknown, out-of-order input,
  unsafe counts, and inactive nonzero facts fail closed. Assert sparse factual
  input canonicalizes to the full policy order with zeros.
- [ ] **Step 2: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
```

Expected: FAIL because the new work fields/units and canonical composer do not
exist and current ledgers are sparse.

- [ ] **Step 3: Implement the vocabulary and pure composition helpers.** Keep
  `VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2` public and active. Add
  only a private provisional V3 row shape whose numeric limits cannot yet pass
  active-policy validation. Move the duplicated previous-summary-base switch
  out of transition/fallback into the policy module.
- [ ] **Step 4: Replace all empty/sparse ledger creation with the canonical
  composer.** Remove every `?? 1` work default found by:

```text
rg -n "\?\? 1|stageWork|previousSummaryBase" src/layout/textBlockUnifiedLayoutTransitionV1.ts src/layout/textBlockUnifiedLayoutFallbackV1.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts
```

- [ ] **Step 5: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts
npm run type-check
```

- [ ] **Step 6: Commit.**

```text
git add src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutTransitionChangeInternalsV1.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts src/layout/textBlockUnifiedLayoutFallbackV1.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts
git commit -m "refactor(layout): canonicalize factual transition work"
```

### Task 2: Make Source Operations Report Exact Lookup, Copy, And Leaf Work

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`

**Interfaces:**

```ts
interface VNextTextBlockSourceLookupWorkInternalV1 {
  readonly visitedSourceLookupNodeCount: number
  readonly visitedSourceItemCount: number
}

interface VNextTextBlockSourceImagePaintTransitionWorkInternalV1 {
  readonly visitedSourceLookupNodeCount: number
  readonly copiedSourcePathNodeCount: number
  readonly visitedChangedSourceLeafItemCount: number
  readonly createdSourceNodeCount: number
}
```

The indexed lookup returns its exact ancestor/leaf visits. The paint operation
counts every copied ancestor/leaf node and every item slot inspected while
rebuilding the one changed leaf. Semantic no-op reports deliberate lookup but
zero path-copy/leaf-rebuild work.

- [ ] **Step 1: Add RED fixtures** for sizes 1, 8, 9, 64, 65, 128; first,
  middle, and last target; minimum and maximum source-leaf width; and at least
  two source-tree heights. Assert exact observed lookup/path/leaf counts and
  that none is inferred from total source size.
- [ ] **Step 2: Add RED semantic-no-op assertions.** Exact prior source/Root
  reuse must coexist with factual source lookup work and zero copy/rebuild
  work.
- [ ] **Step 3: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
```

- [ ] **Step 4: Return work beside the exact indexed item and propagate it.**
  `bindVNextTextBlockUnifiedLayoutChangeInternalV1` performs the lookup once,
  records it beside the existing exact image-paint source-item authority, and
  passes that authority forward. Source transition must not repeat the lookup.
  Task 6 later expands this into the complete validated-change authority
  record; do not pre-create a second competing registry here.
- [ ] **Step 5: Aggregate exact operation results without activating V3
  rows.** Populate the detailed `flow` counters and preserve V2's canonical
  14-row `stageWork` while V2 is active. Task 5 projects `source-items`,
  `source-lookup-nodes`, `source-path-copy-nodes`, and `source-leaf-items` into
  the private V3 calibration ledger; public transitions do not emit those new
  rows until the atomic V3 activation in Task 10.
- [ ] **Step 6: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
npm run type-check
```

- [ ] **Step 7: Commit.**

```text
git add src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
git commit -m "refactor(layout): report factual source transition work"
```

### Task 3: Report Structural Cover Lookup Work Without Renaming It Reconvergence

**Files:**

- Modify: `src/layout/textBlockPersistentLayoutLineContractV1.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockPersistentLayoutLineTreeV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`

**Interfaces:**

```ts
type VNextTextBlockLineDispositionCoverResultV1 =
  | {
      readonly status: "ready"
      readonly cover: VNextTextBlockLineDispositionCoverV1
      readonly work: {
        readonly visitedPreviousLineTreeNodeCount: number
        readonly visitedNextLineTreeNodeCount: number
        readonly selectedExactSubtreeNodeCount: number
      }
      readonly issues: readonly []
    }
  | { readonly status: "blocked"; readonly cover: null; readonly work: ... }
```

Keep the serialized cover shape unchanged. Work is an internal result sidecar.
Paint-only proves
`nextLineTreeDependency === previousRoot.lineTree`; it does not allocate or
compare a replacement wrapper.

- [ ] **Step 1: Add RED multi-shape cover tests.** Cover the same ordinal
  ranges at multiple heights and leaf widths, first/middle/last ranges, and
  canonical left-to-right maximal-subtree selection. Assert exact previous and
  next visit counts and mutually exclusive/exhaustive E/T/R/N dispositions.
- [ ] **Step 2: Add RED identity tests.** Assert the next line-tree dependency
  is the exact previous object, `lineTreeWrapperAllocationCount = 0`, and no
  complete line traversal occurs. Forced collision, clone, policy mismatch,
  and alternate unregistered shape must block rather than normalize.
- [ ] **Step 3: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
```

- [ ] **Step 4: Instrument the exact recursive cover selector.** Increment
  before each node inspection, preserve deterministic child order, return
  partial completed work on block, and do not add a generic tree walker.
- [ ] **Step 5: Store factual visits only as structural-reuse detail while V2
  remains active.** Keep `layout-reconvergence` inactive and
  `layout.proofNodeCount = 0`. Task 5 projects the detail to
  `structural-reuse-proof/line-tree-lookup-nodes` for private V3 calibration;
  the public ledger gains that row only at Task 10 activation.
- [ ] **Step 6: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 7: Commit.**

```text
git add src/layout/textBlockPersistentLayoutLineContractV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "refactor(layout): account structural cover visits"
```

### Task 4: Report Scene And Delivery Lookup Work And Remove Duplicate Verification

**Files:**

- Modify: `src/layout/textBlockPersistentSceneContractV2.ts`
- Modify: `src/layout/textBlockPersistentSceneV2.ts`
- Modify: `src/layout/textBlockSceneDeliveryContractV2.ts`
- Modify: `src/layout/textBlockSceneDeliveryV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockPersistentSceneV2.test.ts`
- Modify: `tests/textBlockSceneDeliveryV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`

**Interfaces:**

```ts
type VNextTextBlockSceneDeliveryPlanBuildResultV2 =
  | {
      readonly status: "prepared"
      readonly plan: VNextTextBlockSceneDeliveryPlanV2
      readonly work: {
        readonly constructionSceneTreeVisitCount: number
        readonly verificationSceneTreeVisitCount: number
        readonly deliveryOperationCount: number
        readonly retainCoverNodeCount: number
      }
      readonly issues: readonly []
    }
  | { readonly status: "blocked"; readonly plan: null; readonly work: ... }
```

The Scene candidate also returns line-ordinal lookup visits and Scene-ordinal
lookup visits separately from copied nodes/replacement chunks.

- [ ] **Step 1: Add RED Scene tests** at the fixed scales/positions/heights.
  Assert lookup counts come from the existing lookup results and that copied
  path/replacement result-size counters retain current values.
- [ ] **Step 2: Add RED delivery tests.** Assert construction cover visits and
  the builder's one internal verification visits are both reported, while the
  transition wrapper performs no second verification.
- [ ] **Step 3: Install a private test observer around the plan verifier.** One
  transition must invoke it exactly once. Keep the observer test-only and do
  not export it from `src/index.ts`.
- [ ] **Step 4: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
```

- [ ] **Step 5: Thread exact lookup results through Scene and Delivery.** The
  delivery builder constructs, internally verifies, and returns one prepared
  authority plus total factual work. Remove the wrapper call to
  `verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2`; do not remove the
  builder's verification gate.
- [ ] **Step 6: Preserve the new counts as exact Scene/Delivery detail while
  V2 remains active.** No count may equal selected subtree count merely because
  the old implementation used that approximation. Task 5 projects the two new
  Scene rows and one new Delivery row into private V3 calibration; Task 10
  adds them to the public canonical ledger during atomic V3 activation.
- [ ] **Step 7: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 8: Commit.**

```text
git add src/layout/textBlockPersistentSceneContractV2.ts src/layout/textBlockPersistentSceneV2.ts src/layout/textBlockSceneDeliveryContractV2.ts src/layout/textBlockSceneDeliveryV2.ts src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "refactor(layout): account scene delivery tree work"
```

### Task 5: Derive And Freeze The Private V3 Candidate

**Files:**

- Create: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`
- Create: `fixtures/live-draft-unified-incremental-root-5b-work-calibration.v3.json`
- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionContractV1.test.ts`
- Modify: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`

**Interfaces:**

```ts
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3_CANDIDATE_INTERNAL
  : VNextTextBlockUnifiedLayoutWorkPolicyV1 // private

function deriveVNextTextBlockWorkPolicyCalibrationInternalV1(
  observations: readonly VNextTextBlockWorkCalibrationObservationInternalV1[],
): VNextTextBlockWorkPolicyCalibrationInternalV1
```

- [ ] **Step 1: Build the fixed matrix and write the first RED derivation
  test.** The test calls the not-yet-implemented collector/calibration
  functions and asserts the closed fixture-id set, all 21 ordered rows, 13
  finite derived locked rows, eight inactive rows, and threshold triples.
  Empty is marked `structural-calibration`; 128 exclusion is marked
  `inactive-reference` and never executes incremental exclusion.
- [ ] **Step 2: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts --reporter=verbose
```

Expected: FAIL because the collector, calibration function, and private V3
candidate do not exist.

- [ ] **Step 3: Implement the calibration rule and private candidate.** Require
  21 ordered rows, 13 derived locked limits, eight inactive rows, and exact
  fingerprint recomposition. The candidate must not be accepted by public Root
  or transition wrappers yet.
- [ ] **Step 4: Print the stable derived evidence from the test-only collector,
  then add it with `apply_patch`.** Use a task-specific environment switch that
  affects test reporting only:

```text
$env:FLOWDOC_5B1_V3_CALIBRATION_REPORT='1'; npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts --reporter=verbose; Remove-Item Env:FLOWDOC_5B1_V3_CALIBRATION_REPORT
```

Create the JSON from that exact canonical output; do not hand-select limits.
Then add a byte-for-byte live-evidence equality assertion and observe GREEN.
- [ ] **Step 5: Add threshold RED/GREEN cases** for minus-one/equal/plus-one on
  every locked row and verify no payload-size or clock field participates.
- [ ] **Step 6: Update the manifest as candidate evidence only.** Record V2 as
  active, V3 as `frozen-private-candidate`, the calibration file fingerprint,
  formula version, and the exact 13-row numeric table. Do not claim V3
  delivered.
- [ ] **Step 7: Run the 5B-1C-1 gate.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 8: Commit the private candidate evidence.**

```text
git add src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts fixtures/live-draft-unified-incremental-root-5b-work-calibration.v3.json fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json
git commit -m "test(layout): freeze phase 5b-1 v3 work evidence"
```

- [ ] **Step 9: STOP FOR USER REVIEW.** Report the exact 13 limits, policy
  fingerprint, calibration revision, focused test count, and diff summary.
  Do not start Task 6 until the user explicitly accepts these numeric values.

---

## Checkpoint 5B-1C-2: Branch-Owned Fallback

### Task 6: Register One Exact Validated-Change Authority

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutFallbackV1.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutFallbackV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`

**Interfaces:**

```ts
interface VNextTextBlockValidatedChangeAuthorityRecordInternalV1 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly originalChange: VNextTextBlockUnifiedLayoutChangeV1
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly expectedTargetBinding: VNextTextBlockExpectedTargetBindingV1
  readonly bindingWork: VNextTextBlockIncrementalCandidateWorkV1
}

function getVNextTextBlockValidatedChangeAuthorityRecordInternalV1(
  validatedChange: VNextTextBlockValidatedChangeV1,
): VNextTextBlockValidatedChangeAuthorityRecordInternalV1 | null
```

The record is weak-keyed by the exact validated-change object and is created
only after successful binding. It is not public or serializable.

- [ ] **Step 1: Add RED authority tests.** Exact object succeeds; clone,
  reconstructed object, different Root, different policy, and cross-bound
  change fail. Assert fallback preparation never calls change binding again.
- [ ] **Step 2: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
```

- [ ] **Step 3: Register the exact record after binding and consume it in
  transition/fallback internals.** Remove duplicated lookup/rebinding paths but
  keep public detached inspection claims unchanged.
- [ ] **Step 4: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 5: Commit.**

```text
git add src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts src/layout/textBlockUnifiedLayoutFallbackV1.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "refactor(layout): bind exact validated change authority"
```

### Task 7: Issue Proof-Failure Authority Only From The Failed Proof Operation

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts`
- Modify: `src/layout/textBlockSceneDeliveryV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutFallbackV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockSceneDeliveryV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutFallbackV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`

**Interfaces:**

```ts
interface VNextTextBlockReuseProofFailureAuthorityInternalV1 {
  readonly source: "vnext-text-block-reuse-proof-failure-authority-internal-v1"
}

type VNextTextBlockImagePaintSceneTransitionResultInternalV1 =
  | { readonly status: "prepared"; /* exact prepared authorities and work */ }
  | {
      readonly status: "proof-unavailable"
      readonly authority: VNextTextBlockReuseProofFailureAuthorityInternalV1
      readonly work: VNextTextBlockIncrementalCandidateWorkV1
    }
  | { readonly status: "blocked"; readonly issues: readonly ...[]; readonly work: ... }
```

Only canonical retain/replacement-cover inability after valid bounded work is
`proof-unavailable`. Malformed topology, authority mismatch, unsafe data,
collision, inactive behavior, and candidate registration failures are
`blocked`.

- [ ] **Step 1: Add RED classification tests** that force the genuine bounded
  proof-unavailable seam and separately force every immediate-block family.
  Assert only the former yields an opaque registered authority with exact
  partial work.
- [ ] **Step 2: Add RED caller-forgery tests.** Raw tuples, cloned authorities,
  proof reason without operation authority, replay, and proof authority bound
  to another Root/change/policy all fail.
- [ ] **Step 3: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
```

- [ ] **Step 4: Replace the generic fallback mint.** Delete
  `mintVNextTextBlockUnifiedLayoutFallbackAttemptInternalV1`. The proof
  operation registers exact failure facts; fallback request creation accepts
  only the opaque authority and derives mode, reason, stage, proof type,
  target, policy, and work from the registry.
- [ ] **Step 5: Keep planned-complete producerless.** Retain vocabulary for
  future 5B-3 compatibility, but reject any caller-shaped planned-complete
  attempt and keep authored-box change blocked.
- [ ] **Step 6: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
npm run type-check
```

- [ ] **Step 7: Commit.**

```text
git add src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts src/layout/textBlockSceneDeliveryV2.ts src/layout/textBlockUnifiedLayoutFallbackV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
git commit -m "fix(layout): derive fallback from failed reuse proof"
```

### Task 8: Build The Exact Evaluator And Bound Source Work

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`

**Interfaces:**

```ts
interface VNextTextBlockStageVisitLimitInternalV1 {
  readonly stage: VNextTextBlockUnifiedLayoutStageV1
  readonly unit: VNextTextBlockUnifiedLayoutStageUnitV1
  readonly effectiveLimit: number
}

type VNextTextBlockStageVisitAttemptInternalV1 =
  | { readonly status: "accepted"; readonly attemptedWork: number }
  | {
      readonly status: "limit-exceeded"
      readonly attemptedWork: number
      readonly effectiveLimit: number
      readonly evaluatorAuthority: VNextTextBlockLimitExceededAuthorityInternalV1
    }

function evaluateNextVNextTextBlockStageVisitInternalV1(input: {
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly limit: VNextTextBlockStageVisitLimitInternalV1
  readonly completedWork: number
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}): VNextTextBlockStageVisitAttemptInternalV1
```

The evaluator authority registry binds exact validated change, stage/unit,
effective limit, attempted count, completed detailed work, and canonical ledger
at the stop point. It is minted only when `completedWork + 1` is rejected. The
operation receives accumulated work only from exact prepared results of prior
operations; the evaluator canonicalizes and reconciles it against the
validated-change authority before registration. The orchestrator cannot pass a
caller-shaped ledger.

- [ ] **Step 1: Add RED evaluator boundary tests.** At limit-minus-one and
  exact limit the next permitted visit completes; at limit-plus-one the visit
  does not occur, detailed work remains at the limit, and policy attempted work
  is limit + 1.
- [ ] **Step 2: Add RED evaluator reconciliation tests.** Modified stage/unit,
  attempted work, effective limit, completed detail, canonical ledger, Root,
  change, or policy invalidates inspection. A non-evaluator object cannot mint
  registered limit evidence.
- [ ] **Step 3: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
```

- [ ] **Step 4: Implement the exact task-specific evaluator.** Compute the
  effective limit through the existing policy function and issue authority
  only at the rejected next visit. Keep the authority type private and opaque.
- [ ] **Step 5: Bound change binding and source transition.** Check before
  source lookup, source path-copy, changed-leaf item, and source-item visits.
  Return immediately on exhaustion with exact completed source work and the
  evaluator authority; prove with an observer that the rejected node/item is
  not read.
- [ ] **Step 6: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 7: Commit.**

```text
git add src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "fix(layout): bound exact source work visits"
```

### Task 9: Bound Line, Scene, And Delivery Work At Their Operations

**Files:**

- Modify: `src/layout/textBlockPersistentLayoutLineContractV1.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockPersistentSceneContractV2.ts`
- Modify: `src/layout/textBlockPersistentSceneV2.ts`
- Modify: `src/layout/textBlockSceneDeliveryContractV2.ts`
- Modify: `src/layout/textBlockSceneDeliveryV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockPersistentLayoutLineTreeV1.test.ts`
- Modify: `tests/textBlockPersistentSceneV2.test.ts`
- Modify: `tests/textBlockSceneDeliveryV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`

- [ ] **Step 1: Add RED line-cover limit tests.** For selected-subtree and
  line-tree lookup units, prove exact threshold behavior, retained completed
  work, rejected attempted work, and no visit of the next sibling.
- [ ] **Step 2: Implement line-cover previsit checks and run its focused
  GREEN.**

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
```

- [ ] **Step 3: Add RED Scene limit tests.** Cover line lookup, Scene lookup,
  copied nodes, and replacement chunks independently. Assert the candidate is
  discarded and no later Scene sibling or chunk is read after exhaustion.
- [ ] **Step 4: Implement Scene previsit checks and run its focused GREEN.**

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
```

- [ ] **Step 5: Add RED Delivery limit tests.** Cover Scene lookup,
  operations, and retain-cover nodes in both construction and the one internal
  verification. Assert the wrapper never retries verification after limit
  failure.
- [ ] **Step 6: Implement Delivery previsit checks.** Return the exact
  evaluator authority and completed work from the builder; propagate it through
  Scene transition without translating it into a generic issue.
- [ ] **Step 7: Run the combined GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 8: Commit.**

```text
git add src/layout/textBlockPersistentLayoutLineContractV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockPersistentSceneContractV2.ts src/layout/textBlockPersistentSceneV2.ts src/layout/textBlockSceneDeliveryContractV2.ts src/layout/textBlockSceneDeliveryV2.ts src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
git commit -m "fix(layout): bound persistent transition tree visits"
```

### Task 10: Derive Limit Fallback And Atomically Activate V3

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutFallbackV1.ts`
- Modify: `src/index.ts`
- Modify: `tests/helpers/textBlockUnifiedLayoutRootV2.ts`
- Modify: `tests/textBlockUnifiedLayoutRootV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutFallbackV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`
- Modify: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`
- Modify: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`

**Activation:**

```ts
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_ID =
  "5b-1-v3" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3 =
  createVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(policy5b1V3Stages)
```

- [ ] **Step 1: Add RED limit-fallback derivation tests.** The fallback
  boundary accepts only the exact unconsumed evaluator authority and derives
  `deterministic-work-limit-exceeded`, stage/unit, effective limit, attempted
  work, completed detail, canonical ledger, target binding, and policy from its
  registered record. Raw, cloned, replayed, foreign, and modified facts fail.
- [ ] **Step 2: Add RED activation tests.** Public exports expose V3, public
  constructors/wrappers use exact V3, Root inspection rejects V2 with
  `invalid-work-policy`, and no public V2 policy constant remains.
- [ ] **Step 3: Add RED complete-kernel parity tests.** Bootstrap and fallback
  invoke the same private kernel observer, differ only in envelope/provenance,
  and produce equivalent renderer material for the same independent complete
  input. No fallback path reads partial candidate data.
- [ ] **Step 4: Add request-lifecycle tests.** Invalid complete material does
  not consume the request; corrected material succeeds; successful replay
  fails; atomic registration failure does not expose a partial Root.
- [ ] **Step 5: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
```

- [ ] **Step 6: Derive the request from exact evaluator authority.** Delete
  remaining transition-created limit tuples. Recompute and reconcile all
  authority facts against the exact validated-change record and V3 policy;
  consume only the failure authority when creating its one request.
- [ ] **Step 7: Switch every boundary in one patch.** Promote the reviewed
  candidate to V3, make Root validation exhaustive over its 21 rows, switch
  evidence/transition/fallback/bootstrap wrappers and helpers, remove V2 from
  `src/index.ts`, and update the manifest from candidate to active.
- [ ] **Step 8: Search for accidental active V2 references.** Only frozen
  historical/private regression evidence may remain.

```text
rg -n "5b-1-v2|WORK_POLICY_5B1_V2" src tests fixtures docs --glob "!docs/superpowers/plans/2026-07-31-unified-incremental-root-transition-5b-1-corrective.md"
```

- [ ] **Step 9: Run the 5B-1C-2 gate.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 10: Commit and stop at the checkpoint.**

```text
git add src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockUnifiedLayoutRootV2.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts src/layout/textBlockUnifiedLayoutFallbackV1.ts src/index.ts tests/helpers/textBlockUnifiedLayoutRootV2.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json
git commit -m "feat(layout): activate bounded phase 5b-1 v3 policy"
```

Report V3 bootstrap, old-Root rejection, proof fallback, limit fallback, shared
kernel, retry/replay, and work-ledger evidence before Task 11.

---

## Checkpoint 5B-1C-3: Complete-Delivery Integrity And Closure

### Task 11: Extract Owner-Specific Canonical Fact Helpers With Parity Proofs

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockPersistentSceneV2.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- Modify: `tests/textBlockPersistentLayoutLineTreeV1.test.ts`
- Modify: `tests/textBlockPersistentSceneV2.test.ts`

**Private helper ownership:**

```ts
// Source State
canonicalVNextTextBlockTextPaintFactsInternalV1(...)
canonicalVNextTextBlockImagePaintFactsInternalV1(...)
canonicalVNextTextBlockHardBreakPaintFactsInternalV1(...)

// Line Tree
recomposeVNextTextBlockSourceMappingFingerprintInternalV1(...)
recomposeVNextTextBlockLineFragmentLineageInternalV1(...)
recomposeVNextTextBlockLineInternalsIdentityInternalV1(...)
recomposeVNextTextBlockContentLocalGeometryFingerprintInternalV1(...)
recomposeVNextTextBlockAuthoredBoxGeometryFingerprintInternalV1(...)

// Persistent Scene
recomposeVNextTextBlockSceneFragmentIdentityInternalV2(...)
recomposeVNextTextBlockSceneChunkIdentityInternalV2(...)
```

Helpers are typed, pure, task-specific, and absent from `src/index.ts`. Each
accepts the same fingerprint factory already used by its owner so forced-
collision tests continue to exercise process-local authority correctly.

- [ ] **Step 1: Add RED parity tests** around each current construction path.
  Recomposition from accepted canonical facts must equal every existing
  identity exactly; no serialized fingerprint may change.
- [ ] **Step 2: Add hard-break, split-lineage, repeated-lineage, text-run, and
  image crop/fit cases.** Assert hard break uses canonical `{ paint: "none" }`
  and repeated lineage cannot silently merge conflicting paint.
- [ ] **Step 3: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts
```

- [ ] **Step 4: Extract facts from existing builders without changing
  ownership.** Builders and later inspector call the same private functions;
  do not create a generic fingerprint-validation module.
- [ ] **Step 5: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 6: Commit.**

```text
git add src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockPersistentSceneV2.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "refactor(layout): share canonical delivery fact owners"
```

### Task 12: Recompose Detached Complete Delivery From The Inside Out

**Files:**

- Modify: `src/layout/textBlockSceneDeliveryV2.ts`
- Modify: `tests/textBlockSceneDeliveryV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`

**Validation order:** descriptor-safe parse; nested identity recomposition;
cross-record consistency; chunk/summary recomposition; payload observation;
complete-delivery fingerprint. No ordinary property read or canonical
serialization occurs before safe parsing of that record.

- [ ] **Step 1: Add RED nested-mutation tests.** Mutate one mapping,
  line-internals fragment, content/authored geometry, text paint run, image
  fit/crop, hard-break paint, and Scene fragment at a time; retain stale inner
  identities; recompute every outer fragment/chunk/summary/payload/delivery
  hash. Inspection must reject the nested inconsistency.
- [ ] **Step 2: Add RED cross-record tests.** Cover unsafe/unordered spans,
  lineage-kind mismatch, geometry cardinality/order mismatch, text paint gaps
  or overlap, conflicting repeated lineage, missing image fragment, mapping
  without paint except hard break, and aggregate mismatch.
- [ ] **Step 3: Preserve the opaque allowlist.** Tests confirm mapping source,
  provenance, boundary fingerprint, font SHA, alignment policy, and boundary
  spatial context are shape-checked and parent-bound but not falsely claimed
  as rederived upstream truth.
- [ ] **Step 4: Preserve descriptor-safety adversaries.** Prototype, accessor,
  symbol, cycle, unsafe number, and unknown field fail before getter reads or
  serialization.
- [ ] **Step 5: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
```

- [ ] **Step 6: Replace trust in nested identities with owner-helper
  recomposition.** `completeDeliveryChunkIssue` coordinates safe parsed values,
  calls Source/Line/Scene helpers, then recomposes chunk, summary, observation,
  and delivery. Detached valid means canonical self-consistency only; do not
  register detached authority.
- [ ] **Step 7: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/textBlockPersistentSceneV2.test.ts
npm run type-check
```

- [ ] **Step 8: Commit.**

```text
git add src/layout/textBlockSceneDeliveryV2.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "fix(layout): verify nested complete delivery identities"
```

### Task 13: Close Evidence, Documentation, And Final Review Gate

**Files:**

- Modify: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`
- Modify: `README.md`
- Modify: `docs/LIVE_DRAFT_MR1_UNIFIED_TEXT_BLOCK_ROOT_5A.md`
- Modify: `docs/PHASE_LEDGER.md`
- Create: `.superpowers/sdd/2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective/final-verification.md`
- Create: `.superpowers/sdd/2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective/final-review-verdict.md`

- [ ] **Step 1: Add the final public-boundary assertions.** Manifest and docs
  claim only active image paint/no-op 5B-1 behavior, object-graph retention,
  observational payload sizing, and V3 factual work. They explicitly keep
  text/style, exclusion, authored-box, empty-block incremental, Worker,
  Editor, Backend, production, and V1 retirement inactive.
- [ ] **Step 2: Prove renderer parity.** For all active fixtures compare
  incremental output, independently supplied complete-fallback output, and
  complete-oracle renderer material. Compare normalized render facts only;
  keep all three work ledgers separate.
- [ ] **Step 3: Run every focused gate fresh.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
```

- [ ] **Step 4: Run the full repository gate fresh.**

```text
npm run check
git diff --check
git status --short
```

Record exact test-file/test counts and command exit status in
`final-verification.md`. Do not copy historical counts.

- [ ] **Step 5: Perform the final scoped review.** Review the complete range
  from the plan-only commit through current HEAD against both 5B designs and
  this plan. Search specifically for generic framework growth, caller-shaped
  fallback, unreported traversal, public V2 leakage, payload-driven policy,
  stale nested delivery identity, partial-candidate fallback contamination,
  and overclaimed capabilities. Write findings with severity and file/line
  evidence to `final-review-verdict.md`.
- [ ] **Step 6: Fix any Critical or Important finding with a new RED/GREEN
  task-sized commit and rerun Steps 3-5.** Do not waive findings in prose.
- [ ] **Step 7: Update documentation only after all gates pass.** Include exact
  V3 policy fingerprint, fixture calibration revision, test counts, ownership
  map, capability matrix, and the limited object-graph retention claim.
- [ ] **Step 8: Commit closure evidence.**

```text
git add README.md docs/LIVE_DRAFT_MR1_UNIFIED_TEXT_BLOCK_ROOT_5A.md docs/PHASE_LEDGER.md fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json .superpowers/sdd/2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective/final-verification.md .superpowers/sdd/2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective/final-review-verdict.md
git commit -m "docs: close phase 5b-1 v3 corrective gate"
```

- [ ] **Step 9: Stop for user review.** Report branch, HEAD, working-tree
  status, commits by sub-checkpoint, exact verification counts, manifest/policy
  identities, final review verdict, and every remaining inactive capability.
  Do not push, merge, or begin 5B-2.

## Final Acceptance Checklist

- [ ] 5B-1C-1 has operation-owned source, line, Scene, and delivery work with
  the duplicate delivery verification removed.
- [ ] The user explicitly reviewed the exact private V3 calibration values
  before 5B-1C-2.
- [ ] Active V3 has exactly 21 ordered rows, 13 locked and eight inactive, with
  checked-in threshold evidence for every locked row.
- [ ] Accepted and fallback-ledger counts are factual; previsit exhaustion
  preserves completed detail and rejected-attempt policy evidence.
- [ ] Proof and limit fallback requests are issued only from exact registered
  operation branches; generic caller-shaped minting is gone.
- [ ] Planned complete remains producerless in 5B-1.
- [ ] Complete bootstrap/fallback share one Root kernel, invalid material is
  retryable, successful requests are one-shot, and no partial candidate enters
  fallback.
- [ ] Detached complete delivery recomposes every locally provable nested
  identity and does not claim process-local authority.
- [ ] Payload sizing is observational only and lifetime claims are limited to
  object-graph retention.
- [ ] Focused tests, type-check, full `npm run check`, diff hygiene, and final
  review all pass with no Critical or Important finding.
- [ ] No cross-repository, 5B-2, 5B-3, publication, production, or V1-retirement
  work entered the implementation.
