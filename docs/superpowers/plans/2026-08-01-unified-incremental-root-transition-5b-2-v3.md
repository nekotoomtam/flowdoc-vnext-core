# Unified Incremental Root Transition 5B-2 V3 Implementation Plan

> **PAUSED — DO NOT EXECUTE TASK 2 OR LATER.** The 2026-08-02 risk audit found
> an evidence/source ordering cycle and V1 protocol gaps. The approved
> direction is documented in
> `../specs/2026-08-02-unified-incremental-transition-evidence-v2-design-correction.md`.
> This plan must be rewritten and reviewed before implementation resumes.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activate bounded Core-only text, resolved-field, and supported-style
Root V2 transitions over the accepted 5B-1 V3 foundation, including exact
producer evidence, canonical E/T/R/N dispositions, exact/strict translated
reconvergence, deterministic policy limits, independent fallback, and QA-only
complete-oracle parity.

**Architecture:** Keep the public attempt as one process-local Root V2 stage
pipeline, but move new work into focused private producer, source/flow, line,
reconvergence, disposition, and geometry modules. Every operation consumes
exact Core-minted authority and evaluates its own visit before reading or
copying a node. Publish `5b-2-v1` only after factual calibration; public
bootstrap then creates policy-bound 5B-2 Roots while `5b-1-v3` remains frozen
QA evidence.

**Tech Stack:** TypeScript 6 ESM, Vitest 4, fixed-point layout units, canonical
JSON plus compact SHA-256 fingerprints, existing Node-native and
browser-Worker-WASM MR1 range runtimes, Persistent Source/Flow/Line/Scene V2
foundations, and package-local `npm run check`.

## Global Constraints

- Normative design:
  `docs/superpowers/specs/2026-08-01-unified-incremental-root-transition-5b-2-v3-amendment-design.md`.
- Work only in `flowdoc-vnext-core`; Editor and Backend remain read-only and
  unchanged.
- Use the existing isolated worktree and branch. Do not push or merge.
- Before Task 1, re-read `AGENTS.md`, `README.md`,
  `docs/WORKSPACE_BOUNDARY.md`, `docs/LEGACY_MIGRATION_GATE.md`, and the current
  Phase 5B ledger/handoff.
- Before Task 1, fetch/prune and record branch, HEAD, upstream, divergence, and
  working-tree state for Core, Editor, and Backend. Stop before implementation
  if any state differs from the user-reviewed handoff except the reviewed
  design/plan commits.
- Record the clean reviewed plan commit as the execution base. The design base
  is `35d60a7`; do not assume that SHA remains HEAD after this plan is committed.
- Root V2 and Persistent Scene V2 remain the only active lane. Root V1/Scene V1
  stay frozen compatibility and QA reference only.
- The public caller never selects a work policy, range, affected line/band,
  reconvergence, reuse, fallback, or oracle result.
- The text-engine adapter imports transition producer contracts only through
  type-only exports from `@flowdoc/vnext-core`. Type visibility grants no
  process-local authority. Runtime-identity factories, registries, inspectors,
  Root/change inputs, and evidence acceptance remain Core-owned and private to
  the adapter.
- Complete next canonical material is absent from request derivation and the
  incremental attempt. Complete fallback receives independent material later.
- Required common changes never use planned-complete because of size,
  complexity, payload bytes, or time.
- Wall clock and payload size never select execution. Payload estimates remain
  observations only.
- Every visit limit is checked by the operation owner before the visit.
- No partial Source, Flow, Line, Geometry, Scene, cover, or delivery candidate
  crosses the complete-fallback boundary.
- Exact authority always requires registered object identity; fingerprint
  equality alone is insufficient.
- E/T/R/N is canonical, mutually exclusive, and exhaustive. Removed previous
  lines are counted separately.
- Strict translated reuse proves unchanged line internals/source/provenance,
  one constant safe delta, destination spatial compatibility, authored bounds,
  and boundary semantics. Missing proof disables `T`.
- `5b-1-v3` and its fingerprint remain immutable. `5b-2-v1` is a new policy.
- No executable policy row may remain `prelock`.
- Exact 5B-2 numeric limits are produced only from checked-in factual fixture
  observations. If an inherited V3 row must change, stop, rerun the complete
  5B-1 binding/threshold matrix, and request explicit review before continuing.
- Use TDD for every task. Commit only after its focused test, type-check where
  listed, and `git diff --check` pass.
- Stop after each sub-checkpoint review if a Critical/Important finding,
  inherited V3 policy change, capability overclaim, or unexpected external
  repository change appears.
- Stop after 5B-2E for user review. Do not begin 5B-3.

## Execution Preflight

Run from the isolated Core worktree:

```powershell
Get-Content AGENTS.md
git status --short
git branch --show-current
git rev-parse HEAD
git branch -vv
git fetch --prune
git rev-list --left-right --count origin/main...HEAD
npm run check
```

Run the equivalent read-only status/fetch/divergence checks in
`C:\Users\nekot\Documents\GitHub\flowdoc-vnext-editor` and
`C:\Users\nekot\Documents\GitHub\flowdoc-vnext-backend`.

Expected Core baseline before implementation: clean reviewed plan HEAD on
`phase-5b-unified-incremental-root-transition`; type-check passes; the last
reviewed runtime baseline is 453 test files / 2,512 tests. Report rather than
guess if upstream or test counts changed.

## File Responsibility Map

New focused files:

- `packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV1.ts` — answer
  one exact transition evidence request with request-scoped Node/WASM facts.
- `src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts` — classify
  and path-copy text/field/style Source State changes.
- `src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts` — project
  accepted evidence into a bounded Flow Tree candidate.
- `src/layout/textBlockUnifiedLayoutTransitionLineInternalsV1.ts` — recompute
  changed lines only; it does not decide reconvergence.
- `src/layout/textBlockUnifiedLayoutReconvergenceInternalsV1.ts` — prove exact
  or strict translated suffix authority from summaries.
- `src/layout/textBlockUnifiedLayoutDispositionInternalsV1.ts` — build and
  validate one canonical E/T/R/N cover.
- `src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts` — project
  disposition-specific text/style authored geometry only.
- `tests/helpers/textBlockUnifiedIncremental5b2.ts` — fixture authorship,
  independent complete material, and QA normalization only.

Existing large files receive only narrow owner seams or orchestration wiring;
do not move unrelated logic or turn any new module into a generic framework.

## Sub-checkpoints

1. **5B-2A Contract and Evidence Activation** — Tasks 1-2.
2. **5B-2B Source and Flow Transition** — Tasks 3-4.
3. **5B-2C Bounded Layout and E/T/R/N** — Tasks 5-6.
4. **5B-2D Geometry, Scene, Fallback, and Oracle Closure** — Tasks 7-8.
5. **5B-2E Work-Policy Calibration and Review Gate** — Tasks 9-10.

---

## 5B-2A Contract and Evidence Activation

### Task 1: Policy-Bound Evidence Work Ownership

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`

**Interfaces:**

- Consumes: exact validated-change authority and its registered
  `workPolicy`; existing evidence request/response work.
- Produces: policy-neutral candidate-work validation and three evidence-stage
  units without changing the frozen V3 policy object.

```ts
export type VNextTextBlockUnifiedLayoutStageUnitV1 =
  | "evidence-request-lookup-nodes"
  | "evidence-context-atoms"
  | "evidence-response-nodes"
  // retain every existing V1 unit

export interface VNextTextBlockIncrementalCandidateWorkV1 {
  readonly evidence: {
    readonly requestCount: number
    readonly visitedRequestLookupNodeCount: number
    readonly materializedContextAtomCount: number
    readonly requestedAtomCount: number
    readonly requestedClusterCount: number
    readonly consumedAtomCount: number
    readonly consumedClusterCount: number
    readonly unusedCoverageRenderedUtf16Length: number
    readonly visitedEvidenceNodeCount: number
  }
  // retain every existing work lane and zero-forbidden traversal field
}

export function hasCanonicalVNextTextBlockStageWorkInternalV1(input: {
  readonly work: VNextTextBlockIncrementalCandidateWorkV1
  readonly policy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): boolean

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1:
  VNextTextBlockUnifiedLayoutWorkPolicyV1
```

The test-only policy has the final 24-row shape, two inactive spatial rows,
and finite calibration ceilings of floor `8,192`, absolute `32,768`, relative
numerator `8`, denominator `1` for every temporary locked row. It is private,
named test-only, rejected by every public boundary, absent from manifests and
Root fingerprints outside focused tests, and deleted in Task 9 when the exact
fixture-derived policy is published. These ceilings collect factual counts;
they are never candidate production limits.

- [ ] **Step 1: Add RED tests for policy-bound work validation**

Add tests proving candidate work is validated against the exact policy from
validated-change authority rather than the global V3 constant. Preserve the
exact 21-row V3 array/fingerprint and assert new evidence counts are zero for
5B-1 no-op/paint.

```ts
expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages)
  .toHaveLength(21)
expect(v3NoOp.incrementalCandidateWork.evidence).toMatchObject({
  visitedRequestLookupNodeCount: 0,
  materializedContextAtomCount: 0,
  visitedEvidenceNodeCount: 0,
})
expect(hasCanonicalVNextTextBlockStageWorkInternalV1({
  work: v3NoOp.incrementalCandidateWork,
  policy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
})).toBe(true)
```

- [ ] **Step 2: Run RED**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
```

Expected: FAIL because evidence request/context ownership fields and
policy-neutral stage-work validation do not exist.

- [ ] **Step 3: Extend the work contract without mutating V3 rows**

Add the three stage-unit literals and the two request-side evidence counts.
Keep `visitedEvidenceNodeCount` as the response-side owner count. Update every
zero-work constructor to include exact zeros. Do not append the new units to
`VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages`.

- [ ] **Step 4: Replace hard-coded V3 candidate-work inspection**

Implement `hasCanonicalVNextTextBlockStageWorkInternalV1(...)` so the exact
authority record supplies the policy. Map detailed work as follows:

```ts
case "evidence/evidence-request-lookup-nodes":
  return work.evidence.visitedRequestLookupNodeCount
case "evidence/evidence-context-atoms":
  return work.evidence.materializedContextAtomCount
case "evidence/evidence-response-nodes":
  return work.evidence.visitedEvidenceNodeCount
```

Reject rows absent from the exact policy and nonzero counts under inactive
rows. Preserve duplicate-visit rejection and exact evaluator authority.

- [ ] **Step 5: Add request-owner visit evaluation**

Before every Source summary lookup or context atom materialization in request
derivation, call `evaluateNextVNextTextBlockStageVisitInternalV1(...)` with
the matching evidence unit, then commit the counter only on `accepted`.
Return its exact evaluator authority on limit exhaustion.

- [ ] **Step 6: Add the finite private calibration policy seam**

Create the one exact test-only policy constant and permit it only in internal
complete Root/test-stage construction. Generalize exact-policy checks from
`value === V3` to `value === V3 || value === calibrationTestOnly`; public
bootstrap and public attempt remain hard-bound to V3. Add public-boundary tests
that the constant and any policy-selection input are absent.

- [ ] **Step 7: Run GREEN and compatibility gate**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

Expected: PASS; V3 fingerprint and 5B-1 counts are unchanged.

- [ ] **Step 8: Commit**

```powershell
git add src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutRootV2.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
git commit -m "refactor(layout): own transition evidence work"
```

### Task 2: Exact Node/WASM Transition Evidence Producer

**Files:**

- Create: `packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV1.ts`
- Create: `tests/textBlockUnifiedLayoutProducerEvidenceV1.test.ts`
- Modify: `packages/text-engine-rust-wasm/src/index.ts`
- Modify: `src/index.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`

**Interfaces:**

- Consumes: one exact `VNextTextBlockTransitionEvidenceRequestV1`,
  request-scoped `VNextTextBlockTransitionProducerSourceMaterialV1`, and one
  pinned Node-native or Worker-WASM range runtime.
- Produces: one strict `VNextTextBlockTransitionProducerResponseV1`; it does
  not accept complete canonical input or decision-shaped facts.
- Public type seam: `src/index.ts` re-exports only
  `VNextTextBlockTransitionEvidenceRequestV1`,
  `VNextTextBlockTransitionProducerSourceMaterialV1`,
  `VNextTextBlockTransitionProducerResponseV1`, and
  `VNextTextBlockTransitionProducerRuntimeIdentityV1`. It does not export the
  runtime-identity factory, authority registry, or any adapter-facing
  acceptance shortcut.

```ts
export interface FlowDocUnifiedIncrementalEvidenceRuntimeV1 {
  readonly identity: VNextTextBlockTransitionProducerRuntimeIdentityV1
  readonly shapeRange: FlowDocTextEngineIncrementalRangeExecutionRuntimeV1["shapeRange"]
  readonly segmentRange: FlowDocTextEngineIncrementalRangeExecutionRuntimeV1["segmentRange"]
}

export type FlowDocUnifiedIncrementalEvidenceResultV1 =
  | {
      readonly status: "accepted"
      readonly response: VNextTextBlockTransitionProducerResponseV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly response: null
      readonly issues: readonly { readonly code: string; readonly message: string }[]
    }

export function createFlowDocTextEngineUnifiedIncrementalEvidenceV1(input: {
  readonly request: VNextTextBlockTransitionEvidenceRequestV1
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV1
  readonly runtime: FlowDocUnifiedIncrementalEvidenceRuntimeV1
}): FlowDocUnifiedIncrementalEvidenceResultV1
```

- [ ] **Step 1: Write producer RED tests**

Cover Thai/Latin insertion, deletion, replacement, resolved field, and metric
style requests. Answer each request with Node and WASM runtimes and assert
equal normalized response facts and counters.

```ts
const normalizeProducerResponse = (
  response: VNextTextBlockTransitionProducerResponseV1,
) => ({
  previousCoverage: response.previousCoverage,
  nextCoverage: response.nextCoverage,
  shapingRuns: response.shapingRuns,
  breakOffsets: response.breakOffsets,
  sourceTopologyFingerprint: response.sourceTopologyFingerprint,
  work: response.work,
  contracts: response.contracts,
})

expect(normalizeProducerResponse(node.response))
  .toEqual(normalizeProducerResponse(wasm.response))
expect(node.response.contracts).toEqual({
  producerSelectsDirtyRange: false,
  producerSelectsLinesOrBands: false,
  producerSelectsReconvergenceOrReuse: false,
  producerSelectsFallback: false,
  stagedEditorApply: false,
  mayPublishLayout: false,
  productionBinding: false,
})
```

Add gap, overlap, widened/narrowed coverage, wrong request/runtime/font/style/
unit/source-topology identity, unknown field, accessor, symbol, prototype,
unsafe integer, and image-byte/decision-shaped adversaries.

- [ ] **Step 2: Run RED**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutProducerEvidenceV1.test.ts
```

Expected: FAIL because the producer adapter does not exist.

- [ ] **Step 3: Implement strict request-scoped material parsing**

Snapshot own data descriptors before ordinary reads. Validate exact request
fingerprint, previous/next coverage, atom-kind/style/boundary invariants,
font faces, topology, unit policy, and runtime identity. Reject any field that
could carry dirty ranges, lines, bands, reuse, fallback, complete input, asset
bytes, or decoded state. Import the four Core producer contract types from
`@flowdoc/vnext-core`; do not import `src/layout/**` from the adapter package.

- [ ] **Step 4: Execute bounded MR1 range shaping and segmentation**

Materialize only the request-declared left/change/right coverage. Invoke the
injected Node or WASM `shapeRange`/`segmentRange` functions, normalize facts,
and compose response work from the bounded material:

```ts
const work = Object.freeze({
  requestedAtomCount,
  requestedClusterCount,
  consumedAtomCount,
  consumedClusterCount,
  unusedCoverageRenderedUtf16Length,
  visitedEvidenceNodeCount,
  completeNextInputTraversalCount: 0 as const,
  completeNextInputComparisonCount: 0 as const,
})
```

- [ ] **Step 5: Bind response acceptance to exact tuple authority**

The producer returns its factual response without importing the Core
acceptance boundary. In the focused Core integration test, the caller that
already owns the exact request, previous Root, validated change, and
Core-minted runtime identity feeds the response through
`acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV1(...)`. Prove clone,
digest collision, cross-root, cross-change, cross-request, and cross-runtime
responses cannot gain authority. Assert that no runtime-identity factory,
authority registry, Root/change input, or adapter acceptance shortcut is
exported from either public package surface.

- [ ] **Step 6: Run GREEN and range regressions**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutProducerEvidenceV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textEngineMr1RangeFactsV1.test.ts tests/textEngineIncrementalRangeExecutionV1.test.ts tests/textEngineFlowEvidenceNodeWasmV2.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 7: Commit**

```powershell
git add packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV1.ts packages/text-engine-rust-wasm/src/index.ts src/index.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts tests/textBlockUnifiedLayoutProducerEvidenceV1.test.ts
git commit -m "feat(layout): add bounded transition evidence producer"
```

### 5B-2A Review Stop

Run the Task 1-2 gates together and review only the new evidence scope. PASS
requires exact Node/WASM parity, no complete-input/suffix reads, exact tuple
authority, operation-owned request/response visits, unchanged V3 identity,
and no public producer decision authority. Stop on any Critical/Important
finding before Task 3.

---

## 5B-2B Source and Flow Transition

### Task 3: Text, Field, and Style Source Path Copy

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Modify: `tests/helpers/textBlockUnifiedLayoutRootV2.ts`

**Interfaces:**

- Consumes: exact previous Root V2, validated text/field/style change,
  accepted evidence when required, and operation-owned source visit authority.
- Produces: an unregistered next Source State candidate, exact dirty source
  ranges, exact source-item lineage mapping, and factual source work.

```ts
export interface VNextTextBlockUnifiedLayoutSourceStageAcceptedV1 {
  readonly status: "accepted"
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly previousSourceRange: VNextTextBlockSourceRangeV1
  readonly nextSourceRange: VNextTextBlockSourceRangeV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly existingLineageIds: readonly string[]
  readonly insertedLineageIds: readonly string[]
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly []
}

export interface VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1 {
  readonly previousRange: VNextTextBlockSourceRangeV1
  readonly nextItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly expectedPreviousContentFingerprint: string
  readonly expectedPreviousSourceFingerprint: string
  readonly expectedPreviousProvenanceFingerprint: string
  readonly fingerprint: string
}

export type VNextTextBlockSourceRangePathCopyResultInternalV1 =
  | {
      readonly status: "prepared"
      readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
      readonly visitedLookupNodeCount: number
      readonly copiedPathNodeCount: number
      readonly visitedChangedLeafItemCount: number
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked" | "limit-exceeded"
      readonly sourceState: null
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export function transitionVNextTextBlockUnifiedLayoutSourceInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly evidence: VNextTextBlockTransitionEvidenceV1 | null
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}):
  | VNextTextBlockUnifiedLayoutSourceStageAcceptedV1
  | VNextTextBlockUnifiedLayoutOwnedStageFailureV1
```

`VNextTextBlockUnifiedLayoutOwnedStageFailureV1` is added to the transition
contract in this task:

```ts
export type VNextTextBlockUnifiedLayoutOwnedStageFailureV1 =
  | {
      readonly status: "fallback-required"
      readonly evaluatorOrProofAuthority: object
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }
```

- [ ] **Step 1: Write the complete source RED matrix**

Cover Thai/Latin insertion, deletion, replacement at start/middle/end;
hard-break and field adjacency; identical field text with changed provenance;
changed field text with equal/different metrics; paint-only color; equal-metric
style/provenance; metric style; and unsupported style.

```ts
expect(semanticOnly.status).toBe("accepted")
expect(semanticOnly.nextSourceState.summary.provenanceFingerprint)
  .not.toBe(previous.root.sourceState.summary.provenanceFingerprint)
expect(semanticOnly.nextSourceState.summary.contentFingerprint)
  .toBe(previous.root.sourceState.summary.contentFingerprint)
expect(metricStyle.completedCandidateWork.flow.completeSuffixTraversalCount)
  .toBe(0)
```

Use throwing sentinels beyond the expected boundary paths and assert zero
reads. Add clone/foreign/changed authority, unsafe range arithmetic, split
surrogate, invalid hard-break/image-boundary, duplicate lineage, and forced
collision rows.

- [ ] **Step 2: Run RED**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts
```

Expected: FAIL because the source transition module does not exist.

- [ ] **Step 3: Add one narrow Source State owner seam**

Inside `textBlockUnifiedLayoutSourceStateV1.ts`, expose only this private
task-specific helper; keep node constructors and balancing internals private:

```ts
export function prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1(input: {
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly replacement: VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1
  readonly beforeVisit: (unit:
    | "source-lookup-nodes"
    | "source-path-copy-nodes"
    | "source-leaf-items") => boolean
}): VNextTextBlockSourceRangePathCopyResultInternalV1
```

The helper performs summary lookup, boundary-leaf split, local rebalance under
the fixed eight-item/eight-child policy, and copied-path summary composition.
It must not classify changes or register the result.

- [ ] **Step 4: Implement source-stage classification and replacement facts**

Derive the exact replacement from validated change/evidence. Preserve
offset-independent suffix item identity. Map effect classes exactly:

```ts
switch (validatedChange.effectClassification.effectClass) {
  case "true-no-op":
    throw new TypeError("true no-op must not enter source transition")
  case "semantic-only-change":
  case "paint-affecting-change":
  case "geometry-affecting-change":
    return "prepare-range-path-copy"
}
```

Use the returned closed action only to call
`prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1(...)` with the
exact replacement record derived earlier in the same function.

Require accepted exact evidence for evidence-bearing rows and reject evidence
for evidence-free rows.

- [ ] **Step 5: Enforce source visits before work**

For each lookup/path-copy/leaf-item visit, call the exact stage evaluator from
validated-change authority. Commit the count after acceptance only. Convert a
limit result to its evaluator authority; convert proof/identity failure to a
Core-minted proof authority or structured block. Never manufacture fallback
from a caller-shaped reason.

- [ ] **Step 6: Run GREEN and source regressions**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 7: Commit**

```powershell
git add src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts tests/helpers/textBlockUnifiedLayoutRootV2.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts
git commit -m "feat(layout): add text and style source transitions"
```

### Task 4: Evidence-to-Flow Path Copy

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts`
- Modify: `src/layout/textBlockIncrementalFlowTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`

**Interfaces:**

- Consumes: Task 3 Source stage, exact accepted evidence, and previous Flow
  Tree authority.
- Produces: an unregistered next Flow Tree candidate, Core-derived layout seed,
  existing/new lineage facts, and completed flow work.

```ts
export interface VNextTextBlockUnifiedLayoutFlowStageAcceptedV1 {
  readonly status: "accepted"
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextFlowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly seedRegion: VNextTextBlockLayoutSeedRegionV1
  readonly existingLineageIds: readonly string[]
  readonly insertedLineageIds: readonly string[]
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly []
}

export type VNextTextBlockIncrementalFlowRangePathCopyResultInternalV1 =
  | {
      readonly status: "prepared"
      readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
      readonly visitedFlowAtomCount: number
      readonly visitedFlowTreeNodeCount: number
      readonly reusedFlowTreeNodeCount: number
      readonly createdFlowTreeNodeCount: number
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked" | "limit-exceeded"
      readonly flowTree: null
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export function transitionVNextTextBlockUnifiedLayoutFlowInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly sourceStage: VNextTextBlockUnifiedLayoutSourceStageAcceptedV1
  readonly evidence: VNextTextBlockTransitionEvidenceV1 | null
}):
  | VNextTextBlockUnifiedLayoutFlowStageAcceptedV1
  | VNextTextBlockUnifiedLayoutOwnedStageFailureV1
```

- [ ] **Step 1: Write Flow RED tests**

Reuse the source matrix and assert:

```ts
expect(semanticOnly.nextFlowTree)
  .toBe(previous.root.flowTree)
expect(paintOnly.nextFlowTree)
  .toBe(previous.root.flowTree)
expect(metricChange.nextFlowTree).not.toBe(previous.root.flowTree)
expect(metricChange.completedCandidateWork.flow).toMatchObject({
  completeTreeRebuildCount: 0,
  completeSemanticPassCount: 0,
  completeSuffixTraversalCount: 0,
})
```

Cover retained prefix/suffix identity, boundary leaf splits, 1/8/32/33/128/
2,048-line source scales, request coverage drift, changed style/font/unit
dependencies, throwing suffix sentinels, and every flow unit limit.

- [ ] **Step 2: Run RED**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts
```

Expected: FAIL because the Flow transition module does not exist.

- [ ] **Step 3: Add one narrow Flow Tree owner seam**

```ts
export function prepareVNextTextBlockIncrementalFlowRangePathCopyInternalV1(input: {
  readonly previousFlowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly replacementAtoms: readonly VNextTextBlockIncrementalFlowAtomV1[]
  readonly previousRange: VNextTextBlockSourceRangeV1
  readonly nextRange: VNextTextBlockSourceRangeV1
  readonly beforeVisit: (unit: "flow-atoms" | "flow-tree-nodes") => boolean
}): VNextTextBlockIncrementalFlowRangePathCopyResultInternalV1
```

The owner retains exact paint-neutral suffix subtrees, creates only replacement
and copied-path nodes, composes summaries locally, and registers nothing.

- [ ] **Step 4: Project evidence into canonical replacement atoms**

Convert accepted shaping runs/breaks and Source Stage facts into flow atoms.
For semantic-only and paint-only rows, bind the exact previous Flow Tree to the
new Source State through a narrow alias proof instead of building a wrapper.
Reject any evidence gap, surplus, topology mismatch, or dependency drift.

- [ ] **Step 5: Derive the layout seed and wire private stage sequencing**

The seed comes only from Source/Flow summaries and the validated change. Add a
private transition dispatch that reaches Source then Flow for 5B-2 kinds but
still returns the existing inactive-stage result at the public V3 boundary.
This task does not accept a new Root.

- [ ] **Step 6: Run GREEN and fallback regressions**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockIncrementalFlowTreeV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 7: Commit**

```powershell
git add src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts src/layout/textBlockIncrementalFlowTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts
git commit -m "feat(layout): add bounded text and style flow transitions"
```

### 5B-2B Review Stop

PASS requires exact source/provenance preservation, exact Flow reuse for
semantic/paint-only rows, local path copy for metric rows, zero complete tree/
semantic/suffix work, pre-visit enforcement, candidate non-registration, and
no public activation. Stop before Task 5 on a Critical/Important finding.

---

## 5B-2C Bounded Layout and E/T/R/N

### Task 5: One-Line Bounded Recompute and Candidate Splice

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionLineInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutLineTransitionV1.test.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`

**Interfaces:**

- Consumes: Task 4 Flow stage, exact previous line/spatial authority, and the
  existing fixed-point line-break/placement kernels.
- Produces: one recomputed line at a time plus a continuation cursor; it does
  not decide reconvergence or disposition.

```ts
export interface VNextTextBlockUnifiedLayoutLineRecomputeCursorInternalV1 {
  readonly source: "vnext-text-block-line-recompute-cursor-internal-v1"
  readonly previousLineOrdinal: number
  readonly nextLineOrdinal: number
  readonly nextFlowAtomOrdinal: number
  readonly nextYLayoutUnit: number
  readonly spatialContinuationFingerprint: string
  readonly boundaryFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutRecomputedLineInternalV1 {
  readonly status: "accepted"
  readonly line: VNextTextBlockPersistentLayoutLineV1
  readonly lineage: "existing" | "new"
  readonly previousLineOrdinal: number | null
  readonly nextCursor: VNextTextBlockUnifiedLayoutLineRecomputeCursorInternalV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly []
}

export function recomputeNextVNextTextBlockUnifiedLayoutLineInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly flowStage: VNextTextBlockUnifiedLayoutFlowStageAcceptedV1
  readonly cursor: VNextTextBlockUnifiedLayoutLineRecomputeCursorInternalV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}):
  | VNextTextBlockUnifiedLayoutRecomputedLineInternalV1
  | VNextTextBlockUnifiedLayoutOwnedStageFailureV1
```

The Line Tree owner also exposes one narrow assembly seam:

```ts
export function prepareVNextTextBlockPersistentLayoutLineTreeSpliceInternalV1(input: {
  readonly previousTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly retainedPrefixEnd: number
  readonly replacementLines: readonly VNextTextBlockPersistentLayoutLineV1[]
  readonly retainedSuffix:
    | { readonly mode: "none" }
    | {
        readonly mode: "exact" | "translated"
        readonly previousRange: VNextTextBlockLineOrdinalRangeV1
        readonly constantYDeltaLayoutUnit: number
      }
}): VNextTextBlockPersistentLayoutLineTreeSpliceResultInternalV1

export type VNextTextBlockPersistentLayoutLineTreeSpliceResultInternalV1 =
  | {
      readonly status: "prepared"
      readonly lineTree: VNextTextBlockPersistentLayoutLineTreeV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly lineTree: null
      readonly issues: readonly VNextTextBlockPersistentLayoutLineTreeIssueV1[]
    }
```

- [ ] **Step 1: Write one-line recompute RED tests**

Cover equal-length replacement, insert/delete, hard-break adjacency, field
adjacency, start/middle/end, mixed Thai/Latin, wrap/no-wrap, and existing/new
lineage. Assert fixed-point line facts equal the independent complete fixture
for each recomputed line.

```ts
const normalizeLine = (line: VNextTextBlockPersistentLayoutLineV1) => ({
  lineageId: line.lineageId,
  lineInternals: line.lineInternals,
  sourceMapping: line.sourceMapping,
  sourceFingerprint: line.sourceFingerprint,
  provenanceFingerprint: line.provenanceFingerprint,
  boundarySpatialContextFingerprint: line.boundarySpatialContextFingerprint,
  contentLocalGeometry: line.contentLocalGeometry,
  authoredBoxGeometry: line.authoredBoxGeometry,
  translatedGeometryFingerprint: line.translatedGeometryFingerprint,
})

expect(step.status).toBe("accepted")
expect(normalizeLine(step.line)).toEqual(complete.normalizedLines[0])
expect(step.completedCandidateWork.layout.recomputedLineCount).toBe(1)
expect(step.completedCandidateWork.layout.completeSuffixTraversalCount).toBe(0)
```

Add throwing previous-line and flow sentinels beyond the one-line cursor and a
limit-minus-one/limit/limit-plus-one owner test.

- [ ] **Step 2: Run RED**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutLineTransitionV1.test.ts
```

Expected: FAIL because the line recompute module and splice seam are missing.

- [ ] **Step 3: Implement exact cursor validation**

Bind the cursor to previous Root, Flow stage, spatial continuation, authored
y, boundary semantics, and work policy through private WeakMap authority.
Reject cloned, foreign, stale, unsafe, skipped, or reused cursors before line
work.

- [ ] **Step 4: Implement one-line fixed-point recomputation**

Evaluate `layout-reconvergence/recomputed-lines` before invoking break/
placement work. Consume Flow atoms only until one canonical line is complete.
Create an existing-lineage record only when exact previous lineage mapping is
proved; otherwise create new lineage. Return the next cursor without reading a
future suffix.

- [ ] **Step 5: Implement the Line Tree splice owner**

Use exact retained prefix/suffix subtree authority, create replacement leaves,
and compose copied-path summaries. For translated suffix input, retain line
internals but create translated line records; do not call this exact reuse.
The helper validates an already-proved suffix but does not search for one.

- [ ] **Step 6: Run GREEN and line regressions**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutLineTransitionV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockSpatialWrappingLayoutV2.test.ts tests/textBlockAuthoredBoxGeometryV2.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 7: Commit**

```powershell
git add src/layout/textBlockUnifiedLayoutTransitionLineInternalsV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutLineTransitionV1.test.ts
git commit -m "feat(layout): add bounded line recomputation"
```

### Task 6: Exact/Translated Reconvergence and Canonical Dispositions

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutReconvergenceInternalsV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutDispositionInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutReconvergenceV1.test.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionLineInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`

**Interfaces:**

- Consumes: Task 5 recompute cursor/lines and exact previous Line Tree summary
  paths.
- Produces: one accepted exact/translated/no-reuse proof, a prepared next Line
  Tree, and one canonical E/T/R/N cover.

```ts
export type VNextTextBlockUnifiedLayoutReconvergenceProofInternalV1 =
  | { readonly mode: "none"; readonly proofFingerprint: string }
  | {
      readonly mode: "exact"
      readonly previousRange: VNextTextBlockLineOrdinalRangeV1
      readonly nextRange: VNextTextBlockLineOrdinalRangeV1
      readonly selectedPreviousSubtrees: readonly object[]
      readonly proofFingerprint: string
    }
  | {
      readonly mode: "translated"
      readonly previousRange: VNextTextBlockLineOrdinalRangeV1
      readonly nextRange: VNextTextBlockLineOrdinalRangeV1
      readonly constantYDeltaLayoutUnit: number
      readonly selectedPreviousSubtrees: readonly object[]
      readonly proofFingerprint: string
    }

export function proveVNextTextBlockUnifiedLayoutReconvergenceInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly flowStage: VNextTextBlockUnifiedLayoutFlowStageAcceptedV1
  readonly cursor: VNextTextBlockUnifiedLayoutLineRecomputeCursorInternalV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}):
  | {
      readonly status: "accepted"
      readonly proof: VNextTextBlockUnifiedLayoutReconvergenceProofInternalV1
      readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | VNextTextBlockUnifiedLayoutOwnedStageFailureV1

export interface VNextTextBlockUnifiedLayoutLineStageAcceptedV1 {
  readonly status: "accepted"
  readonly nextLineTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly dispositions: VNextTextBlockLineDispositionCoverV1
  readonly reconvergence: VNextTextBlockUnifiedLayoutReconvergenceProofInternalV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly []
}
```

- [ ] **Step 1: Write exact reconvergence RED tests**

Cover equal-length start/middle/end replacement, insert/delete, hard-break and
field adjacency, long retained suffix, and selected maximal subtree identity.

```ts
expect(exact.reconvergence.mode).toBe("exact")
expect(exact.dispositions.counts.E).toBeGreaterThan(0)
expect(exact.completedCandidateWork.layout.completeSuffixTraversalCount)
  .toBe(0)
```

Reject equal digests with foreign/cloned authority, changed cursor, line
internals, source/provenance, spatial continuation, authored position,
boundary facts, or work policy.

- [ ] **Step 2: Write strict translation RED tests**

Accept one safe constant-y delta. Reject multiple deltas, unsafe arithmetic,
changed internals/provenance, destination exclusion mismatch, page/box/
flow-region/barrier/semantic boundary crossing, invalid authored bounds, and
missing compatibility facts.

```ts
expect(valid.reconvergence).toMatchObject({
  mode: "translated",
  constantYDeltaLayoutUnit: expectedDelta,
})
expect(incompatible.dispositions.counts.T).toBe(0)
```

- [ ] **Step 3: Write E/T/R/N cover RED tests**

Assert canonical left-to-right maximal covers, pairwise disjoint next ranges,
complete next-line coverage, valid previous mappings, and separate removed
count. Add gaps, overlaps, duplicate assignment, nonmaximal segments,
reordered covers, invalid E identity, invalid T delta, overflow, and forced
collision cases.

```ts
const { E, T, R, N, removed } = result.dispositions.counts
expect(E + T + R + N).toBe(result.nextLineTree.summary.lineCount)
expect(removed).toBe(
  previous.root.lineTree.summary.lineCount - E - T - R,
)
```

- [ ] **Step 4: Run RED**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts
```

Expected: FAIL because real summary reconvergence and changed-layout
disposition orchestration do not exist.

- [ ] **Step 5: Implement summary proof in required order**

Evaluate `layout-reconvergence/proof-nodes` before each summary/node read.
Compare cursor, line internals, source/provenance, spatial/boundary, authored
geometry, exact subtree authority, and policy identity. Only after exact proof
fails may strict translation test one safe delta and every compatibility fact.
Return `mode: "none"` without guessing when no proof is available within the
current bounded window.

- [ ] **Step 6: Implement recompute-until-proof orchestration**

Alternate Task 5 one-line recomputation with Task 6 proof attempts. Stop on
exact/translated proof, end of Flow, proof failure, or exact evaluator limit.
Build the next Line Tree through the Task 5 splice seam. Never walk an accepted
suffix after selecting its maximal subtree authority.

- [ ] **Step 7: Implement canonical disposition owner**

Move changed-layout disposition assembly into the focused disposition module.
Use existing `createVNextTextBlockLineDispositionCoverInternalV1(...)` only as
the final Line Tree owner verifier. Route actual reconvergence visits to
`layout-reconvergence/proof-nodes`; keep the 5B-1 whole-tree structural proof
on `structural-reuse-proof/*` unchanged.

- [ ] **Step 8: Run GREEN and the 5B-2C gate**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutLineTransitionV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockSpatialWrappingLayoutV2.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 9: Commit**

```powershell
git add src/layout/textBlockUnifiedLayoutReconvergenceInternalsV1.ts src/layout/textBlockUnifiedLayoutDispositionInternalsV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionLineInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts
git commit -m "feat(layout): add bounded text layout reconvergence"
```

### 5B-2C Review Stop

PASS requires operation-owned pre-visit line/proof work, zero complete suffix
traversal, exact authority for E, every strict translation fact for T,
canonical exhaustive E/T/R/N, separate removed lines, and continued semantic
distinction between structural reuse and reconvergence. Stop before Task 7 on
any Critical/Important finding.

---

## 5B-2D Geometry, Scene, Fallback, and Oracle Closure

### Task 7: Disposition-Driven Text/Style Geometry

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutTextStyleGeometryV1.test.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`

**Interfaces:**

- Consumes: Task 6 Line stage, next Source State, unchanged 5B-2 Spatial State,
  and exact disposition authority.
- Produces: text/style-only authored geometry facts and completed geometry
  work. It cannot accept image, exclusion, authored-box, fixed-height, or
  overflow changes.

```ts
export interface VNextTextBlockUnifiedLayoutGeometryStageAcceptedV1 {
  readonly status: "accepted"
  readonly nextLineTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly authoredBoxSummary: VNextTextBlockAuthoredBoxSummaryV2
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly []
}

export function projectVNextTextBlockUnifiedLayoutTextStyleGeometryInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly flowStage: VNextTextBlockUnifiedLayoutFlowStageAcceptedV1
  readonly lineStage: VNextTextBlockUnifiedLayoutLineStageAcceptedV1
}):
  | VNextTextBlockUnifiedLayoutGeometryStageAcceptedV1
  | VNextTextBlockUnifiedLayoutOwnedStageFailureV1
```

- [ ] **Step 1: Write disposition projection RED tests**

Assert exact behavior per disposition:

```ts
expect(exactE.completedCandidateWork.geometry).toEqual({
  reprojectedLineCount: 0,
  visitedFragmentCount: 0,
})
expect(semanticR.completedCandidateWork.geometry).toEqual({
  reprojectedLineCount: 0,
  visitedFragmentCount: 0,
})
expect(translatedT.completedCandidateWork.geometry.reprojectedLineCount)
  .toBe(translatedT.lineStage.dispositions.counts.T)
expect(metricRN.completedCandidateWork.geometry.reprojectedLineCount)
  .toBe(metricRN.lineStage.dispositions.counts.R
    + metricRN.lineStage.dispositions.counts.N)
```

Verify authored bounds and exact complete-oracle geometry for start/middle/end,
equal/different line counts, positive/negative safe translation, and 1/8/32/
33/128/2,048-line suffixes.

- [ ] **Step 2: Write capability and limit adversaries**

Reject every image/exclusion/authored-box/fixed-height-shaped entry, forged
disposition cover, invalid translated delta, changed Spatial State,
out-of-bounds geometry, unsafe arithmetic, missing fragment provenance, and
every geometry limit edge. Throw beyond selected E/T/R/N subtree paths.

- [ ] **Step 3: Run RED**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleGeometryV1.test.ts
```

Expected: FAIL because text/style geometry projection is missing and geometry
is still inactive.

- [ ] **Step 4: Implement strict text/style admission**

Require an exact validated text/field/style change and the unchanged exact
previous Spatial State. Reject other change kinds before geometry visits.
Bind the Line stage/disposition cover by process-local authority.

- [ ] **Step 5: Project by disposition with pre-visit work**

Evaluate `geometry/reprojected-lines` and `geometry/visited-fragments` before
each T/R/N projection or fragment read. E retains exact line authority.
Semantic-only R retains line internals and positioned geometry but updates its
source mapping outside geometry work. T applies only its proved constant safe
delta. Compose authored summary from selected subtree summaries.

- [ ] **Step 6: Prove no executable prelock path**

Keep the public V3 attempt blocked. Unit tests invoke the private geometry
owner under exact test visit authority only. Add a guard asserting production
`auditVNextTextBlockUnifiedLayoutFinalStageWorkInternalV1(...)` rejects any
candidate with a `prelock` row and no code path treats `prelock` as executable.

- [ ] **Step 7: Run GREEN and geometry regressions**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleGeometryV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockAuthoredBoxGeometryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 8: Commit**

```powershell
git add src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts tests/textBlockUnifiedLayoutTextStyleGeometryV1.test.ts
git commit -m "feat(layout): project text and style transition geometry"
```

### Task 8: Scene/Root Candidate, Exact Fallback, and QA Oracle

**Files:**

- Create: `tests/helpers/textBlockUnifiedIncremental5b2.ts`
- Create: `tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutFallbackV1.ts`
- Modify: `tests/textBlockUnifiedLayoutFallbackV1.test.ts`

**Interfaces:**

- Consumes: Task 3-7 accepted private stages.
- Produces: one prepared Scene/Delivery/Root candidate or one exact
  proof/evaluator failure authority. Public V3 remains inactive until Task 9.

```ts
export interface VNextTextBlockUnifiedLayoutTextStyleSceneStageAcceptedV1 {
  readonly status: "prepared"
  readonly scene: VNextTextBlockPersistentSceneV2
  readonly deliveryPlan: VNextTextBlockSceneDeliveryPlanV2
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly []
}

export function prepareVNextTextBlockUnifiedLayoutTextStyleSceneTransitionInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly flowStage: VNextTextBlockUnifiedLayoutFlowStageAcceptedV1
  readonly lineStage: VNextTextBlockUnifiedLayoutLineStageAcceptedV1
  readonly geometryStage: VNextTextBlockUnifiedLayoutGeometryStageAcceptedV1
}):
  | VNextTextBlockUnifiedLayoutTextStyleSceneStageAcceptedV1
  | VNextTextBlockUnifiedLayoutOwnedStageFailureV1
```

QA helper only:

```ts
export interface VNextTextBlockUnifiedLayout5b2QaComparisonV1 {
  readonly incrementalRenderer: { readonly chunks: readonly unknown[]; readonly summary: unknown }
  readonly completeFallbackRenderer: { readonly chunks: readonly unknown[]; readonly summary: unknown }
  readonly completeOracleRenderer: { readonly chunks: readonly unknown[]; readonly summary: unknown }
  readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly completeFallbackWork: VNextTextBlockCompleteFallbackWorkV1
  readonly completeOracleWork: VNextTextBlockCompleteOracleWorkV1
}
```

- [ ] **Step 1: Write Scene/Delivery RED tests**

For semantic-only, paint-only, metric R/N, exact E suffix, and translated T
suffix cases, assert only affected chunk paths are copied and one canonical
retain/splice plan is produced.

```ts
expect(scene.status).toBe("prepared")
expect(scene.completedCandidateWork.completeSceneTraversalCount).toBe(0)
expect(scene.deliveryPlan.summary.finalChunkCount)
  .toBe(scene.scene.summary.chunkCount)
expect(inspectVNextTextBlockSceneDeliveryPlanV2({
  previousScene: previous.root.persistentScene,
  nextScene: scene.scene,
  plan: scene.deliveryPlan,
}).status).toBe("valid")
```

Cover source-mapping-only Scene replacement, text color, T geometry, R/N line
changes, canonical retain covers, 9/17/33 chunk shapes, descriptor/prototype/
accessor/symbol/cycle/unsafe/unknown-field inputs, and forced collisions.

- [ ] **Step 2: Write atomic candidate and fallback RED tests**

Force proof and limit failures at evidence, source, flow, line, proof, geometry,
Scene, and delivery stages. Assert one exact request and no registered
candidate. Supply independent complete material later and assert the shared
complete kernel accepts only exact target binding.

```ts
expect(attempt).toMatchObject({ status: "fallback-required" })
expect(observedFallbackCandidates).toHaveLength(1)
expect(observedFallbackCandidates[0]).toBe(fallback.root)
expect(fallback.completeFallbackWork).toMatchObject({
  completeRootV2BuildCount: 1,
  completeSceneV2BuildCount: 1,
})
```

Reject fabricated/cross-attempt request, changed target, leaked candidate
object/range/summary, complete material on the attempt, and partial candidate
passed to fallback.

Assert the observer is empty after the attempt and before completion. Then
populate `observedFallbackCandidates` with the existing private
`setVNextTextBlockUnifiedLayoutFallbackCandidateObserverForTestInternalV1(...)`
around the complete-fallback call; its only value must be the independently
built accepted fallback Root. Clear the observer in `finally`.

- [ ] **Step 3: Write independent oracle RED tests**

Build complete target material from fixture authorship after the attempt.
Compare semantic/source/provenance, flow, line/fragment geometry, ordered
renderer chunks/summary, payload observation under the same estimate contract,
and complete delivery. Do not compare composite Root fingerprints across
different construction provenance.

```ts
expect(comparison.incrementalRenderer)
  .toEqual(comparison.completeOracleRenderer)
expect(comparison.completeFallbackRenderer)
  .toEqual(comparison.completeOracleRenderer)
expect(Object.keys(comparison)).toContain("completeOracleWork")
expect(comparison.incrementalCandidateWork)
  .not.toHaveProperty("completeOracleBuildCount")
```

Add a frozen V1 normalization assertion in the helper and spy that no V1
constructor/materialization runs in production attempt/fallback.

- [ ] **Step 4: Run RED**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts
```

Expected: FAIL because general text/style Scene/Root orchestration and QA helper
do not exist.

- [ ] **Step 5: Implement disposition-driven Scene path copy**

Reuse Scene/Delivery owner helpers from 5B-1. E retains a chunk only when
source mapping and paint are unchanged. Semantic-only R and paint-only E lines
replace affected source/paint chunks. T/R/N replace positioned chunks. Enforce
Scene and delivery visits before work and return exact evaluator/proof
authority.

- [ ] **Step 6: Assemble and verify an unregistered Root candidate**

Use `prepareVNextTextBlockUnifiedLayoutRootIncrementalCandidateInternalV2(...)`
with Task 3-8 candidate dependencies. Recompose actual target binding and
compare every field with validated expected target binding. Call
`registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(...)` only
after final work audit and delivery validation pass. This private integration
remains unreachable from the public V3 attempt.

- [ ] **Step 7: Route all failures through exact authority**

Reuse the existing evaluator/proof-to-fallback protocol. Never accept direct
mode/reason/stage/limit/work fields. Prove candidate work stops at the attempt,
complete fallback work starts in completion, and oracle work exists only in
the QA comparison record.

- [ ] **Step 8: Implement the QA-only comparison helper**

Keep it under `tests/helpers`. It imports public complete bootstrap/delivery
and fixture authorship, not private production stage functions. Add a test that
removing/skipping the helper does not change production candidate, fallback,
work, or fingerprint facts.

- [ ] **Step 9: Run GREEN and the 5B-2D gate**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutTextStyleGeometryV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 10: Commit**

```powershell
git add src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts src/layout/textBlockUnifiedLayoutRootV2.ts src/layout/textBlockUnifiedLayoutFallbackV1.ts tests/helpers/textBlockUnifiedIncremental5b2.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts
git commit -m "feat(layout): assemble text and style Root V2 candidates"
```

### 5B-2D Review Stop

PASS requires disposition-honest geometry/Scene work, no executable prelock,
canonical delivery, exact target binding, atomic registration, exact deferred
fallback, no candidate contamination, external oracle, separate work ledgers,
and no V1 production materialization. Stop before policy publication on any
Critical/Important finding.

---

## 5B-2E Work-Policy Calibration and Review Gate

### Task 9: Calibrate, Publish, and Atomically Activate `5b-2-v1`

**Files:**

- Create: `fixtures/live-draft-unified-incremental-root-5b2-work-calibration.v1.json`
- Create: `tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutFallbackV1.ts`
- Modify: `src/index.ts`
- Modify: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`
- Modify: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`

**Interfaces:**

- Consumes: factual operation-owned observations from Tasks 1-8 and the exact
  V3 calibration formula.
- Produces: one immutable public `5b-2-v1` policy, calibration revision `4`,
  policy-bound public bootstrap/attempt, and an explicit V3-root rejection.

```ts
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_V1:
  VNextTextBlockUnifiedLayoutWorkPolicyV1

export type VNextTextBlockWorkPolicyCalibrationFormulaVersionV1 =
  | "5b-1-v3-calibration-v1"
  | "5b-2-v1-calibration-v1"

export function deriveVNextTextBlock5b2WorkPolicyCalibrationInternalV1(
  observations: readonly VNextTextBlockWorkCalibrationObservationInternalV1[],
): VNextTextBlockWorkPolicyCalibrationInternalV1

export function isRegisteredVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(
  value: unknown,
): value is VNextTextBlockUnifiedLayoutWorkPolicyV1
```

The new policy has exactly 24 ordered rows:

1. three locked evidence rows;
2. six locked source/flow rows;
3. two inactive spatial rows;
4. two locked structural-reuse rows;
5. two locked layout/reconvergence rows;
6. two locked text/style geometry rows owned by `5B-2`;
7. four locked Scene rows; and
8. three locked delivery rows.

- [ ] **Step 1: Record the deterministic calibration observations**

Run the declared fixture matrix through private Tasks 1-8 stage harnesses in
this exact order:

```text
1 line: true no-op, paint-only color, semantic-only field provenance
8 lines: Thai/Latin start/middle/end insert/delete/replace
32 lines: hard-break adjacency and field adjacency
33 lines: equal-metric and metric-affecting style
128 lines: exact and translated reconvergence
2,048 lines: long retained suffix for insert/delete/replace/style
```

For each row record previous item/line/chunk counts, exact change delta, every
stage/unit count, disposition counts, removed lines, forbidden traversal zeros,
and payload observation separately. No duration field is permitted.

Use a report-only environment flag in the calibration test:

```powershell
$env:FLOWDOC_5B2_V1_CALIBRATION_REPORT='1'
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts --reporter=verbose
Remove-Item Env:FLOWDOC_5B2_V1_CALIBRATION_REPORT
```

The report is evidence, not an execution-path input. Copy the exact canonical
JSON facts into
`fixtures/live-draft-unified-incremental-root-5b2-work-calibration.v1.json`
and record its SHA-256 in the handoff manifest.

- [ ] **Step 2: Add policy RED assertions from the checked-in calibration**

Parse the calibration fixture and derive each row using:

```ts
smallBlockFloor = nextPowerOfTwo(maxSmallBlockObservedWork)
absoluteStageLimit = nextPowerOfTwo(4 * maximumObservedWork)
relativeNumerator = minPositiveInteger(
  max(ceil(workUnit / Math.max(1, previousSummaryBase))),
)
relativeDenominator = 1
```

Assert exact generated floor/absolute/relative values, limit-minus-one/limit/
limit-plus-one outcomes, 24-row order, 22 locked rows, two inactive spatial
rows, no prelock, no duration, and payload outside the policy.

```ts
expect(policy.policyId).toBe("5b-2-v1")
expect(policy.stages).toHaveLength(24)
expect(policy.stages.filter(row => row.lockStatus === "locked"))
  .toHaveLength(22)
expect(policy.stages.filter(row => row.lockStatus === "inactive"))
  .toHaveLength(2)
expect(policy.stages.some(row => row.lockStatus === "prelock"))
  .toBe(false)
```

- [ ] **Step 3: Run RED**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
```

Expected: FAIL because `5b-2-v1`, its exact fingerprint, and calibration
revision 4 are not published.

- [ ] **Step 4: Audit inherited V3 rows before publication**

Compare each row shared with `5b-1-v3` by stage/unit, lock meaning, and numeric
values. Expected: all inherited locked numeric values remain identical; the
geometry owner/lock change is the approved 5B-2 amendment, flow/layout/evidence
rows are newly activated, and spatial remains inactive.

If any inherited locked numeric value differs, stop. Do not patch around the
failure. Rerun all 5B-1 fixtures/thresholds and request explicit user review as
required by the design.

- [ ] **Step 5: Publish the exact policy and calibration identity**

Add `VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_V1` with the exact derived
constants and computed fingerprint. Generalize policy registration only to the
two exact known objects, V3 and 5B2; do not add caller registration or a generic
policy registry. Delete
`VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1`
and migrate every stage test to the final exact policy. Assert the test-only id
and its `8,192/32,768/8:1` ceilings are absent from source, manifest, public
exports, accepted Root facts, and handoff evidence.

Update the manifest with exact policy fingerprint, calibration file SHA,
`fixtureCalibrationRevision: 4`, active text/style/semantic-only capabilities,
Core-owned text layout reconvergence, text/style-only geometry ownership, and
all 5B-3/product capabilities false.

- [ ] **Step 6: Make activation bootstrap-bound and caller-free**

Change public `createVNextTextBlockUnifiedLayoutRootV2(...)` and public
`attemptVNextTextBlockUnifiedLayoutRootTransitionV1(...)` to use the exact
5B2 policy internally. Do not add a public policy parameter.

Keep the complete internal builder able to validate exact registered V3 roots
for frozen tests, but require public 5B-2 transition previous Root authority to
be bound to `VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_V1`.

```ts
expect(publicAttemptWithV3Root).toMatchObject({
  status: "blocked",
  issues: [{ code: "previous-root-authority-mismatch" }],
})
expect(publicAttemptWith5b2Root.status).toBe("accepted-incremental")
```

There is no policy migration in the attempt. A caller creates a 5B-2 Root by
calling the ordinary complete public bootstrap after activation.

- [ ] **Step 7: Activate Tasks 1-8 orchestration atomically**

Replace the public inactive text/style dispatch with the exact Source → Flow →
Line/reconvergence/disposition → Geometry → Scene/Delivery → target-binding →
atomic Root registration pipeline. Each failure returns its exact existing
blocked/fallback result. No stage is repaired from complete/oracle material.

- [ ] **Step 8: Tighten the public export boundary**

Export `VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_V1` and reviewed V1
evidence/transition contracts/functions. Remove `5B1_V3` from `src/index.ts`;
it remains private frozen QA evidence. Assert no owner helper, calibration
factory, policy registry, producer runtime implementation, stage function,
authority map, candidate builder, collision factory, V1/V2/V3 old policy, or
QA helper is public.

- [ ] **Step 9: Run policy, activation, and 5B-1 binding gates**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
git diff --check
```

Expected: all mandatory common rows are accepted-incremental or exact no-op;
large rows never planned-complete; proof/limit rows return exact fallback;
V3 fixtures remain unchanged; public activation is only `5b-2-v1`.

- [ ] **Step 10: Commit**

```powershell
git add fixtures/live-draft-unified-incremental-root-5b2-work-calibration.v1.json fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockUnifiedLayoutRootV2.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts src/layout/textBlockUnifiedLayoutFallbackV1.ts src/index.ts tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
git commit -m "feat(layout): activate phase 5b-2 work policy"
```

### Task 10: Capability Handoff, Final Review, and Full Gate

**Files:**

- Create: `.superpowers/sdd/2026-08-01-unified-incremental-root-transition-5b-2/final-verification.md`
- Create: `.superpowers/sdd/2026-08-01-unified-incremental-root-transition-5b-2/final-review-verdict.md`
- Modify: `README.md`
- Modify: `docs/PHASE_LEDGER.md`
- Modify: `docs/LIVE_DRAFT_MR1_UNIFIED_INCREMENTAL_ROOT_5B.md`
- Modify: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`
- Modify: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`

**Interfaces:**

- Consumes: committed Tasks 1-9 and exact calibration identity.
- Produces: capability-honest handoff, final verification evidence, scoped
  review verdict, and one closure commit. It does not start 5B-3.

- [ ] **Step 1: Add final capability RED assertions**

Assert the manifest and public handoff report exactly:

```ts
expect(manifest.capabilities).toMatchObject({
  trueNoOpIncrementalTransition: true,
  imagePaintIncrementalTransition: true,
  textStyleIncrementalTransition: true,
  semanticOnlyIncrementalTransition: true,
  emptyBlockIncrementalTransition: false,
  exclusionIncrementalTransition: false,
  authoredBoxIncrementalTransition: false,
  fixedHeightOverflowPolicy: false,
  workerSessionProtocol: false,
  editorApply: false,
  backendPersistence: false,
  productionActivation: false,
  rootV1SceneV1Retirement: false,
})
expect(manifest.ownershipMap).toMatchObject({
  structuralReuseProof: "Core",
  textLayoutReconvergence: "Core",
  geometryProjection: "Core-text-style-only",
  completeOracle: "QA-only",
})
```

Assert payload sizing remains observational, lifetime remains object-graph
retention only, complete oracle is absent from production hot path, and all
three work ledgers remain separate.

- [ ] **Step 2: Run the complete focused 5B-2 gate**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockUnifiedLayoutLineTransitionV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutTextStyleGeometryV1.test.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts tests/textEngineMr1RangeFactsV1.test.ts tests/textEngineIncrementalRangeExecutionV1.test.ts tests/textEngineFlowEvidenceNodeWasmV2.test.ts
npm run type-check
git diff --check
```

Record exact final file/test counts; do not reuse counts from an earlier run.

- [ ] **Step 3: Run the full Core gate**

```powershell
npm run check
git diff --check
```

Expected: exit 0. Record exact type-check and file/test counts in final
verification evidence.

- [ ] **Step 4: Perform a scoped review from the plan-only base**

Review commit range and working diff for:

```text
Critical: complete next/suffix/oracle on hot path; caller policy/range/reuse;
          partial candidate in fallback; forged authority accepted
Important: post-visit limits; non-exhaustive E/T/R/N; weak T proof;
           executable prelock; mandatory common fallback/planned-complete;
           V3 row drift; public internal leakage; broad geometry overclaim
Normal:    duplicated task-specific owners; stale terminology/counts;
           files accumulating unrelated responsibilities
```

Search public exports, complete traversal markers, `planned-complete`,
`prelock`, payload/time selection, V1 materialization, merged ledgers, generic
framework vocabulary, and stale V2/V3 documentation. Resolve every Critical/
Important finding and rerun Steps 2-4. Record remaining risks/unknowns
separately from findings.

- [ ] **Step 5: Update handoff documents from exact evidence**

Document active policy id/fingerprint, calibration revision/file SHA, exact
locked/inactive row counts, fixture matrix, focused/full counts, renderer
parity, fallback/oracle separation, E/T/R/N semantics, text/style-only geometry,
object-graph-only lifetime claim, public/private boundary, and all inactive
5B-3/product capabilities. Add an explicit stop before 5B-3.

- [ ] **Step 6: Write final evidence files**

`final-verification.md` records commands, exit codes, exact counts, policy
identity, branch/worktree, diff hygiene, and no Editor/Backend/push/merge.

`final-review-verdict.md` records review range, PASS/FAIL/BLOCKER/RISK/UNKNOWN,
resolved findings, no-open-Critical/Important verdict, public boundary, and
the required 5B-3 stop.

- [ ] **Step 7: Stage exact closure scope and inspect it**

```powershell
git status --short
git diff --check
git diff --stat
git add README.md docs/PHASE_LEDGER.md docs/LIVE_DRAFT_MR1_UNIFIED_INCREMENTAL_ROOT_5B.md fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
git add -f .superpowers/sdd/2026-08-01-unified-incremental-root-transition-5b-2/final-verification.md .superpowers/sdd/2026-08-01-unified-incremental-root-transition-5b-2/final-review-verdict.md
git diff --cached --check
git diff --cached --stat
```

Stop if staged scope contains unrelated changes.

- [ ] **Step 8: Commit the 5B-2 closure**

```powershell
git commit -m "docs: close phase 5b-2 text and style gate"
git status --short
git log -5 --oneline --decorate
```

Expected: clean worktree. Do not push or merge.

### 5B-2E Final Review Stop

Report:

- **PASS:** exact accepted capabilities and verification evidence;
- **FAIL / BLOCKER:** any unresolved finding or changed repository state;
- **RISK:** threshold headroom, fallback frequency, and file-growth risk;
- **UNKNOWN:** product-scale memory, Worker/browser lifetime and transport,
  scheduling, Editor/Backend behavior, fixed-height, assets, and 5B-3 scale;
- files and behavior changed;
- exact tests run;
- intentionally inactive capabilities; and
- no push/merge plus clean worktree.

Stop for user review. Do not begin Phase 5B-3 without separate explicit
authorization.

---

## Plan Self-Review Map

| Amendment requirement | Plan coverage |
| --- | --- |
| V3 accepted base and immutable identity | Global Constraints, Tasks 1 and 9 |
| Five reviewable slices | Tasks 1-10 and five review stops |
| Core-owned bounded producer evidence | Tasks 1-2 |
| Text/field/style Source and Flow path copy | Tasks 3-4 |
| Bounded line work and zero suffix traversal | Task 5 |
| Exact/strict translated reconvergence | Task 6 |
| Canonical exhaustive E/T/R/N | Task 6 |
| Text/style-only locked geometry; no executable prelock | Tasks 7 and 9 |
| Scene/delivery/atomic Root acceptance | Task 8 |
| Exact two-step candidate-independent fallback | Task 8 |
| External oracle and separate ledgers | Tasks 8 and 10 |
| `5b-2-v1`, factual calibration, threshold gates | Task 9 |
| Bootstrap-bound policy activation | Task 9 |
| Capability-honest handoff and full Core gate | Task 10 |
| Stop before 5B-3 | Task 10 |
