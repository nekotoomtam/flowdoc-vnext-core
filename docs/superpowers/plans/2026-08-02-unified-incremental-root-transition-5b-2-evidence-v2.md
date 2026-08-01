# Unified Incremental Root Transition 5B-2 Evidence V2 Implementation Plan

Status: written plan awaiting user review. This plan does not authorize
implementation until the user explicitly approves it.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activate bounded Core-only text, resolved-field, and supported-style
Root V2 transitions over the accepted 5B-1 V3 foundation, including exact
producer evidence, canonical E/T/R/N dispositions, exact/strict translated
reconvergence, deterministic policy limits, independent fallback, and QA-only
complete-oracle parity.

**Architecture:** Keep the public attempt as one process-local Root V2 stage
pipeline. Insert a Core-owned bounded change preflight before producer
execution, activate Transition Evidence V2 with exact source-material
authority, and keep producer, source/flow, line, reconvergence, disposition,
geometry, and Root/Scene ownership in focused modules. Every operation checks
its exact work limit before a visit. Publish `5b-2-v1` only after factual
calibration while `5b-1-v3` remains frozen QA evidence.

**Tech Stack:** TypeScript 6 ESM, Vitest 4, fixed-point layout units, canonical
JSON plus compact SHA-256 fingerprints, existing Node-native and
browser-Worker-WASM MR1 range runtimes, Persistent Source/Flow/Line/Scene V2
foundations, Core `npm run check`, and package-local `npm run type-check`.

## Global Constraints

- Normative design:
  `docs/superpowers/specs/2026-08-02-unified-incremental-transition-evidence-v2-design-correction.md`, followed by the non-conflicting portions of
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
- Record the clean reviewed plan commit as the execution base. The accepted
  written design base is `6b145a5`; do not assume that SHA remains HEAD after
  this plan is committed.
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
- Transition Evidence V1 remains frozen 5B-1 compatibility/QA evidence.
  Transition Evidence V2 is the only executable 5B-2 producer lane.
- Text insertion/replacement accepts only one unambiguous exact style binding
  registered by the previous Root. Unknown, novel, or collision-ambiguous
  style keys structured-block and are not overclaimed as supported.
- Effect classification and `producerEvidence` are derived only after bounded
  Core preflight resolves exact previous/next source and style facts.
- Changed, evidence-target, shape-verification, and coverage ranges remain
  distinct absolute half-open UTF-16 ranges owned by Core.
- Generated-page-number may appear only as passive retained producer context.
  Generated mutation, empty-block incremental layout, and arbitrary novel
  style insertion remain inactive.
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
reviewed runtime baseline is 453 test files / 2,517 tests. Report rather than
guess if upstream or test counts changed.

## File Responsibility Map

New focused files:

- `src/layout/textBlockUnifiedLayoutEvidenceContractV2.ts` — Transition
  Evidence V2 request/material/response/failure data shapes only.
- `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts` — Core-owned
  bounded change analysis, effect classification, range derivation, exact
  style resolution, and registered source-material authority.
- `src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts` — exact V2
  request/material/runtime response/failure acceptance and evidence authority.
- `src/layout/textBlockUnifiedLayoutTransitionContractV2.ts` — version-honest
  public V2 attempt input only; it reuses the existing transition result.
- `src/layout/textBlockUnifiedLayoutTransitionV2.ts` — final 5B-2 policy-bound
  orchestration and two-step fallback conversion only.
- `packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.ts` — answer
  one exact V2 transition request with request-scoped Node/WASM facts.
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

1. **5B-2A Contract and Evidence Activation** — Tasks 1-3.
2. **5B-2B Source and Flow Transition** — Tasks 4-5.
3. **5B-2C Bounded Layout and E/T/R/N** — Tasks 6-7.
4. **5B-2D Geometry, Scene, Fallback, and Oracle Closure** — Tasks 8-9.
5. **5B-2E Work-Policy Calibration and Review Gate** — Tasks 10-11.

---

## 5B-2A Contract and Evidence Activation

### Task 1: Policy-Bound Evidence Work Ownership — Complete

Implemented by `85f644c`, `7bac202`, and `28e0c80`; independently reviewed
with no open finding. The frozen V3 gate passed at 453 files / 2,517 tests.
Do not repeat or amend this task while executing the V2 plan.

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
Root fingerprints outside focused tests, and deleted in Task 10 when the exact
fixture-derived policy is published. These ceilings collect factual counts;
they are never candidate production limits.

- [x] **Step 1: Add RED tests for policy-bound work validation**

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

- [x] **Step 2: Run RED**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
```

Expected: FAIL because evidence request/context ownership fields and
policy-neutral stage-work validation do not exist.

- [x] **Step 3: Extend the work contract without mutating V3 rows**

Add the three stage-unit literals and the two request-side evidence counts.
Keep `visitedEvidenceNodeCount` as the response-side owner count. Update every
zero-work constructor to include exact zeros. Do not append the new units to
`VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages`.

- [x] **Step 4: Replace hard-coded V3 candidate-work inspection**

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

- [x] **Step 5: Add request-owner visit evaluation**

Before every Source summary lookup or context atom materialization in request
derivation, call `evaluateNextVNextTextBlockStageVisitInternalV1(...)` with
the matching evidence unit, then commit the counter only on `accepted`.
Return its exact evaluator authority on limit exhaustion.

- [x] **Step 6: Add the finite private calibration policy seam**

Create the one exact test-only policy constant and permit it only in internal
complete Root/test-stage construction. Generalize exact-policy checks from
`value === V3` to `value === V3 || value === calibrationTestOnly`; public
bootstrap and public attempt remain hard-bound to V3. Add public-boundary tests
that the constant and any policy-selection input are absent.

- [x] **Step 7: Run GREEN and compatibility gate**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

Expected: PASS; V3 fingerprint and 5B-1 counts are unchanged.

- [x] **Step 8: Commit**

```powershell
git add src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutRootV2.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
git commit -m "refactor(layout): own transition evidence work"
```

### Task 2: Core-Owned Bounded Change Preflight and Material Authority

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutEvidenceContractV2.ts`
- Create: `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts`
- Create: `tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockIncrementalFlowTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `tests/helpers/textBlockUnifiedLayoutRootV2.ts`

**Interfaces:**

- Consumes: exact previous Root V2, exact V1 tagged change, exact Root-bound
  work policy, existing V3 change-shape/root-binding authority, Source State,
  and Flow Tree summaries.
- Produces: one exact process-local V2 preflight authority; exact bounded
  previous/next source facts; effect classification; evidence requirement;
  four Core-owned range classes per lane; and exact registered Producer Source
  Material V2 when evidence is required.
- Does not invoke Node/WASM, build next Source/Flow trees, inspect complete next
  material, or export style/material authority factories.

Add these data contracts in
`textBlockUnifiedLayoutEvidenceContractV2.ts`:

```ts
export interface VNextTextBlockTransitionProducerLaneRangesV2 {
  readonly changedSourceRange: VNextTextBlockSourceRangeV1
  readonly evidenceTargetRange: VNextTextBlockSourceRangeV1
  readonly shapeVerificationRange: VNextTextBlockSourceRangeV1
  readonly coverageRange: VNextTextBlockSourceRangeV1
}

export interface VNextTextBlockTransitionProducerResolvedStyleV2 {
  readonly measurementStyleKey: string
  readonly effectiveShapingStyleKey: string
  readonly paragraphStyleKey: string
  readonly fontFamilyKey: string
  readonly fontFaceId: string
  readonly fontSizeLayoutUnit: number
  readonly textColor: string
  readonly fontWeight: number
  readonly fontStyle: "normal" | "italic"
  readonly textDecoration: "none" | "underline"
  readonly strikethrough: boolean
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionEvidenceRequestV2 {
  readonly source: "vnext-text-block-transition-evidence-request-v2"
  readonly contractVersion: 2
  readonly previousRootFingerprint: string
  readonly changeFingerprint: string
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly previous: VNextTextBlockTransitionProducerLaneRangesV2
  readonly next: VNextTextBlockTransitionProducerLaneRangesV2
  readonly nextSegmentationContextRanges:
    readonly VNextTextBlockSourceRangeV1[]
  readonly requiredStableSegmentationExpansionCount: number
  readonly fontStyleUnitDependencyFingerprint: string
  readonly producerRuntimeRequirementFingerprint: string
  readonly layoutUnitPolicyFingerprint: string
  readonly workPolicyFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionProducerSourceAtomBaseV2 {
  readonly relativeStartRenderedUtf16: number
  readonly relativeEndRenderedUtf16: number
  readonly renderedText: string
  readonly inlineId: string
  readonly sourceFingerprint: string
  readonly provenanceFingerprint: string
  readonly fingerprint: string
}

export type VNextTextBlockTransitionProducerSourceAtomV2 =
  VNextTextBlockTransitionProducerSourceAtomBaseV2 & (
    | {
        readonly kind: "text"
        readonly resolvedStyle:
          VNextTextBlockTransitionProducerResolvedStyleV2
      }
    | {
        readonly kind: "resolved-field"
        readonly fieldKey: string
        readonly resolvedStyle:
          VNextTextBlockTransitionProducerResolvedStyleV2
      }
    | {
        readonly kind: "generated-page-number"
        readonly generatedOwnerFingerprint: string
        readonly resolvedStyle:
          VNextTextBlockTransitionProducerResolvedStyleV2
      }
    | {
        readonly kind: "hard-break"
        readonly boundaryFingerprint: string
      }
    | {
        readonly kind: "inline-image-boundary"
        readonly boundaryFingerprint: string
      }
  )

export interface VNextTextBlockTransitionProducerLaneMaterialV2 {
  readonly ranges: VNextTextBlockTransitionProducerLaneRangesV2
  readonly atoms: readonly VNextTextBlockTransitionProducerSourceAtomV2[]
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionProducerSourceMaterialV2 {
  readonly source:
    "vnext-text-block-transition-producer-source-material-v2"
  readonly contractVersion: 2
  readonly requestFingerprint: string
  readonly previous: VNextTextBlockTransitionProducerLaneMaterialV2
  readonly next: VNextTextBlockTransitionProducerLaneMaterialV2
  readonly paragraphStyleKey: string
  readonly fontFaces: readonly VNextTextBlockInitialFlowFontFaceV1[]
  readonly layoutUnitPolicyFingerprint: string
  readonly sourceTopologyFingerprint: string
  readonly producerWorkCeilings: {
    readonly maximumVisitedEvidenceNodeCount: number
    readonly maximumRequestedAtomCount: number
    readonly maximumRequestedClusterCount: number
  }
  readonly fingerprint: string
}
```

Every atom has exact own data properties for `kind`, coverage-relative start/
end, `renderedText`, `inlineId`, source/provenance fingerprints, and
fingerprint. Text-bearing atoms carry `resolvedStyle`; resolved fields add
`fieldKey`; generated page numbers add `generatedOwnerFingerprint`; hard
breaks and image boundaries add `boundaryFingerprint`. Reject cross-kind
fields rather than making them optional on one broad interface.

Add the private preflight contract:

```ts
export interface VNextTextBlockUnifiedLayoutChangePreflightV2 {
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly eligibility: VNextTextBlockUnifiedLayoutEligibilityV1
  readonly expectedTargetBinding: VNextTextBlockExpectedTargetBindingV1
  readonly effectClassification:
    VNextTextBlockUnifiedLayoutEffectClassificationV1
  readonly producerEvidence: "required" | "not-required"
  readonly previousRanges: VNextTextBlockTransitionProducerLaneRangesV2
  readonly nextRanges: VNextTextBlockTransitionProducerLaneRangesV2
  readonly replacementItems:
    readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly fingerprint: string
}

export type VNextTextBlockUnifiedLayoutOwnedStageFailureV1 =
  | {
      readonly status: "fallback-required"
      readonly evaluatorOrProofAuthority: object
      readonly completedCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly completedCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export type VNextTextBlockTransitionPreflightResultV2 =
  | {
      readonly status: "required"
      readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
      readonly request: VNextTextBlockTransitionEvidenceRequestV2
      readonly sourceMaterial:
        VNextTextBlockTransitionProducerSourceMaterialV2
      readonly completedCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "not-required"
      readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
      readonly request: null
      readonly sourceMaterial: null
      readonly completedCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | VNextTextBlockUnifiedLayoutOwnedStageFailureV1

export function prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  },
): VNextTextBlockTransitionPreflightResultV2
```

- [ ] **Step 1: Write RED contract and classification tests**

In `textBlockUnifiedLayoutTransitionPreflightV2.test.ts`, add exact rows for
true no-op, equal-rendered field provenance, paint-only color, equal-metric
style identity, metric style, and ordinary text changes. Prove classification
happens after bounded replacement facts exist:

```ts
expect(semanticOnly).toMatchObject({
  status: "not-required",
  request: null,
  sourceMaterial: null,
  preflight: {
    producerEvidence: "not-required",
    effectClassification: {
      effectClass: "semantic-only-change",
      semanticIdentityChanged: true,
    },
  },
})
expect(metricStyle).toMatchObject({
  status: "required",
  preflight: {
    producerEvidence: "required",
    effectClassification: { effectClass: "geometry-affecting-change" },
  },
})
```

Assert V1 request/response contract sources and V3 fingerprints are unchanged.

- [ ] **Step 2: Run the focused RED contract test**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts
```

Expected: FAIL because V2 contracts and preflight do not exist.

- [ ] **Step 3: Add exact registered style sidecar tests**

Extend the same test with paragraph style, existing local style, unknown novel
style, and forced-collision rows. The accepted insertion must resolve the exact
previous Source State style object; unknown or ambiguous keys block:

```ts
expect(existingStyle.status).toBe("required")
expect(existingStyle.sourceMaterial.next.atoms)
  .toContainEqual(expect.objectContaining({
    kind: "text",
    resolvedStyle: expect.objectContaining({
      measurementStyleKey: existing.measurementStyleKey,
      effectiveShapingStyleKey: existing.effectiveShapingStyleKey,
      fontFaceId: existing.fontFaceId,
      fontSizeLayoutUnit: existing.fontSizeLayoutUnit,
    }),
  }))
expect(novelStyle).toMatchObject({
  status: "blocked",
  issues: [expect.objectContaining({ code: "unsupported-change-value" })],
})
expect(forcedCollision).toMatchObject({
  status: "blocked",
  issues: [expect.objectContaining({ code: "style-authority-ambiguous" })],
})
```

- [ ] **Step 4: Implement the private Source State style registry**

In `textBlockUnifiedLayoutSourceStateV1.ts`, register exact resolved styles
while complete Source State construction already visits initial-flow atoms.
Use one non-iterable `WeakMap<SourceState, RegisteredStyleSet>`. The set keeps
exact style facts and exact source-item reference counts so Task 4 can update
it from bounded removed/replacement items. Candidate lookup is by both supplied
keys, followed by exact resolved-style comparison; zero candidates returns
unavailable and multiple non-identical candidates returns ambiguous. Do not
serialize, fingerprint, export, or add the sidecar to Root facts.

The existing image-paint Source State path copy changes no text style and must
bind the exact same immutable registered style set to its prepared next Source
State. Add an image-paint-then-text-insertion row proving that propagation does
not traverse Source items or change V3 fingerprints.

Add only these private owner seams:

```ts
export interface VNextTextBlockTransitionSourceCoverageFragmentInternalV1 {
  readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
  readonly itemAbsoluteStartRenderedUtf16: number
  readonly itemAbsoluteEndRenderedUtf16: number
  readonly selectedAbsoluteStartRenderedUtf16: number
  readonly selectedAbsoluteEndRenderedUtf16: number
}

export type VNextTextBlockTransitionSourceCoverageResultInternalV1 =
  | {
      readonly status: "accepted"
      readonly fragments:
        readonly VNextTextBlockTransitionSourceCoverageFragmentInternalV1[]
      readonly visitedNodeCount: number
      readonly emittedItemCount: number
      readonly completeTreeTraversalCount: 0
    }
  | {
      readonly status: "blocked" | "limit-exceeded"
      readonly fragments: null
      readonly visitedNodeCount: number
      readonly emittedItemCount: number
      readonly completeTreeTraversalCount: 0
    }

export function resolveVNextTextBlockRegisteredSourceStyleInternalV1(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly measurementStyleKey: string
  readonly effectiveShapingStyleKey: string
}):
  | { readonly status: "resolved"; readonly style:
      VNextTextBlockUnifiedLayoutSourceStyleV1 }
  | { readonly status: "unavailable" | "ambiguous"; readonly style: null }

export function visitVNextTextBlockTransitionSourceCoverageInternalV1(input: {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly range: VNextTextBlockSourceRangeV1
  readonly beforeVisitNode: () => boolean
  readonly beforeEmitItem: () => boolean
}): VNextTextBlockTransitionSourceCoverageResultInternalV1
```

- [ ] **Step 5: Add RED range, Unicode, and passive-boundary tests**

Cover insertion/deletion/replacement at start/middle/end; a deletion with
zero-length changed next range; `fi`/`ffi`; Thai combining sequences; split
surrogate; hard-break, field, image, and generated-page-number adjacency;
ordinary text carrying newline/U+FFFC; deletion of all content; and multi-style
ranges.

```ts
expect(deletion.preflight.nextRanges.changedSourceRange)
  .toEqual({ startRenderedUtf16: 4, endRenderedUtf16: 4 })
expect(deletion.preflight.nextRanges.evidenceTargetRange)
  .toEqual(expect.objectContaining({
    startRenderedUtf16: expect.any(Number),
    endRenderedUtf16: expect.any(Number),
  }))
expect(
  deletion.preflight.nextRanges.evidenceTargetRange.endRenderedUtf16,
).toBeGreaterThan(
  deletion.preflight.nextRanges.evidenceTargetRange.startRenderedUtf16,
)
expect(splitSurrogate.status).toBe("blocked")
expect(deleteAll.status).toBe("blocked")
```

For every lane assert:

```ts
expect(rangeContains(lane.evidenceTargetRange, lane.changedSourceRange))
  .toBe(true)
expect(rangeContains(lane.shapeVerificationRange, lane.evidenceTargetRange))
  .toBe(true)
expect(rangeContains(lane.coverageRange, lane.shapeVerificationRange))
  .toBe(true)
```

- [ ] **Step 6: Add guarded Source/Flow coverage owner seams**

Implement the Source coverage visitor above and one matching Flow owner seam
in `textBlockIncrementalFlowTreeV1.ts`:

```ts
export interface VNextTextBlockTransitionFlowCoverageFragmentInternalV1 {
  readonly atom: VNextTextBlockIncrementalFlowAtomV1
  readonly atomAbsoluteStartRenderedUtf16: number
  readonly atomAbsoluteEndRenderedUtf16: number
}

export type VNextTextBlockTransitionFlowCoverageResultInternalV1 =
  | {
      readonly status: "accepted"
      readonly fragments:
        readonly VNextTextBlockTransitionFlowCoverageFragmentInternalV1[]
      readonly visitedNodeCount: number
      readonly emittedAtomCount: number
      readonly completeTreeTraversalCount: 0
    }
  | {
      readonly status: "blocked" | "limit-exceeded"
      readonly fragments: null
      readonly visitedNodeCount: number
      readonly emittedAtomCount: number
      readonly completeTreeTraversalCount: 0
    }

export function visitVNextTextBlockTransitionFlowCoverageInternalV1(input: {
  readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly range: VNextTextBlockSourceRangeV1
  readonly beforeVisitNode: () => boolean
  readonly beforeEmitAtom: () => boolean
}): VNextTextBlockTransitionFlowCoverageResultInternalV1
```

Both visitors descend through rendered-length summaries and inspect only
intersecting paths. Source results retain the exact item plus selected local
range facts; Flow results retain the exact whole cluster/boundary atom plus
absolute traversal offsets. Neither visitor forges a clipped persistent
item/atom. Both stop before a visit whose callback returns `false`. They are
5B-2 transition owner seams, not public/general persistent-tree APIs.

- [ ] **Step 7: Implement bounded preflight, ranges, and material registration**

In `textBlockUnifiedLayoutTransitionPreflightV2.ts`:

1. consume the exact Root/change/policy binding seam;
2. validate safe UTF-16 and atomic source boundaries;
3. resolve insertion/replacement style from the exact Root registry, retain
   field style, or resolve the supported style overlay from exact base styles;
4. construct exact replacement items without building a next Source tree;
5. compose expected summary/binding facts from retained summary authorities
   and the bounded replacement summary;
6. derive effect classification and evidence requirement;
7. derive changed, evidence-target, shape-verification, coverage, and ordered
   segmentation context ranges from Source/Flow summaries and prior clusters;
8. evaluate `evidence-request-lookup-nodes` before every Source/Flow node and
   `evidence-context-atoms` before every emitted previous/next material atom;
9. derive producer ceilings exactly: `maximumVisitedEvidenceNodeCount` is the
   active policy's evaluated `evidence-response-nodes` limit;
   `maximumRequestedAtomCount` equals the exact previous-plus-next material
   atom count; and `maximumRequestedClusterCount` equals the exact Unicode
   scalar count of the Core-declared next verification partitions, used only
   as a conservative cluster-slot upper bound; and
10. deep-freeze and register the exact preflight/request/material tuple in
    private WeakMaps.

Material offsets are relative only to their lane coverage start. Generated
page numbers carry passive style/owner facts; hard breaks and image boundaries
carry no style, assets, frame, decode, paint, geometry, or renderer state.

- [ ] **Step 8: Add adversarial and work-limit RED/GREEN rows**

Wrap non-intersecting Source/Flow subtrees in throwing sentinels. Add
threshold-minus-one, threshold, and threshold-plus-one for request lookup and
material atoms. Add clone/cross-Root/cross-change/cross-policy, unsafe integer,
duplicate range, non-nested range, accessor, symbol, prototype, unknown field,
and forced fingerprint-collision rows.

```ts
expect(atLimit.status).toBe("required")
expect(overLimit).toMatchObject({
  status: "fallback-required",
  evaluatorOrProofAuthority: expect.any(Object),
})
expect(overLimit.completedCandidateWork.evidence)
  .toMatchObject({ materializedContextAtomCount: limit })
expect(untouchedSuffixReadCount).toBe(0)
```

- [ ] **Step 9: Run the Task 2 GREEN gate**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockIncrementalFlowTreeV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
npm run type-check
git diff --check
```

Expected: PASS; V1/V3 identities are unchanged; no Node/WASM runtime was
invoked; no complete Source/Flow/suffix traversal occurred.

- [ ] **Step 10: Commit Task 2**

```powershell
git add src/layout/textBlockUnifiedLayoutEvidenceContractV2.ts src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockIncrementalFlowTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts tests/helpers/textBlockUnifiedLayoutRootV2.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts
git commit -m "feat(layout): add bounded transition preflight v2"
```

### Task 3: Exact Node/WASM Evidence V2 Producer and Acceptance

**Files:**

- Create: `packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.ts`
- Create: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts`
- Create: `tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts`
- Create: `tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutEvidenceContractV2.ts`
- Modify: `packages/text-engine-rust-wasm/src/index.ts`
- Modify: `src/index.ts`

**Interfaces:**

- Consumes: exact Task 2 request/material tuple and one exact Core-minted V2
  runtime identity injected beside bounded `shapeRange`/`segmentRange`
  functions.
- Produces: accepted factual V2 response or a closed factual producer failure;
  Core acceptance alone registers exact V2 evidence or mints validated proof/
  limit authority.
- Does not accept Root/change/complete input in the adapter, call `shapeFull`/
  `segmentFull`, select ranges, or return fallback decisions.

Complete the V2 response/failure contracts:

```ts
export interface VNextTextBlockTransitionProducerRuntimeIdentityV2 {
  readonly source: "vnext-text-block-transition-producer-runtime-v2"
  readonly contractVersion: 2
  readonly runtime:
    | "node-native-mr1-range"
    | "browser-worker-wasm-mr1-range"
  readonly engineBuildFingerprint: string
  readonly fontBackendFingerprint: string
  readonly unitPolicyFingerprint: string
  readonly fontStyleUnitDependencyFingerprint: string
  readonly producerRuntimeRequirementFingerprint: string
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionProducerWorkV2 {
  readonly requestedAtomCount: number
  readonly requestedClusterCount: number
  readonly consumedAtomCount: number
  readonly consumedClusterCount: number
  readonly unusedCoverageRenderedUtf16Length: number
  readonly visitedEvidenceNodeCount: number
  readonly completeNextInputTraversalCount: 0
  readonly completeNextInputComparisonCount: 0
}

export interface VNextTextBlockTransitionProducerContractsV2 {
  readonly producerSelectsDirtyRange: false
  readonly producerSelectsLinesOrBands: false
  readonly producerSelectsReconvergenceOrReuse: false
  readonly producerSelectsFallback: false
  readonly stagedEditorApply: false
  readonly mayPublishLayout: false
  readonly productionBinding: false
}

export interface VNextTextBlockTransitionShapingBoundaryProofV2 {
  readonly targetRange: VNextTextBlockSourceRangeV1
  readonly verificationRange: VNextTextBlockSourceRangeV1
  readonly leftBoundary:
    "safe-first-target-glyph" | "exact-style-or-block-start"
  readonly rightBoundary:
    "safe-first-right-guard-glyph" | "exact-style-or-block-end"
  readonly guardGlyphCount: number
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionProducerResponseV2 {
  readonly source: "vnext-text-block-transition-producer-response-v2"
  readonly contractVersion: 2
  readonly requestFingerprint: string
  readonly sourceMaterialFingerprint: string
  readonly runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly nextEvidenceTargetRange: VNextTextBlockSourceRangeV1
  readonly shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  readonly breakOffsets: readonly number[]
  readonly shapingBoundaryProofs:
    readonly VNextTextBlockTransitionShapingBoundaryProofV2[]
  readonly sourceTopologyFingerprint: string
  readonly work: VNextTextBlockTransitionProducerWorkV2
  readonly contracts: VNextTextBlockTransitionProducerContractsV2
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionEvidenceV2 {
  readonly source: "vnext-text-block-transition-evidence-v2"
  readonly contractVersion: 2
  readonly requestFingerprint: string
  readonly sourceMaterialFingerprint: string
  readonly previousRootFingerprint: string
  readonly changeFingerprint: string
  readonly runtimeIdentityFingerprint: string
  readonly nextEvidenceTargetRange: VNextTextBlockSourceRangeV1
  readonly shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  readonly breakOffsets: readonly number[]
  readonly shapingBoundaryProofs:
    readonly VNextTextBlockTransitionShapingBoundaryProofV2[]
  readonly sourceTopologyFingerprint: string
  readonly work: VNextTextBlockTransitionProducerWorkV2
  readonly fingerprint: string
}

export type VNextTextBlockTransitionProducerFailureCodeV2 =
  | "invalid-request-scoped-material"
  | "pinned-font-unavailable"
  | "pinned-font-mismatch"
  | "unsafe-shaping-boundary"
  | "segmentation-not-stable"
  | "missing-glyph"
  | "unsafe-runtime-arithmetic"
  | "work-ceiling-before-visit"

export interface VNextTextBlockTransitionProducerFailureV2 {
  readonly source: "vnext-text-block-transition-producer-failure-v2"
  readonly contractVersion: 2
  readonly requestFingerprint: string
  readonly sourceMaterialFingerprint: string
  readonly runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly code: VNextTextBlockTransitionProducerFailureCodeV2
  readonly completedWork: VNextTextBlockTransitionProducerWorkV2
  readonly contracts: VNextTextBlockTransitionProducerContractsV2
  readonly fingerprint: string
}

export type VNextTextBlockTransitionEvidenceAcceptanceResultV2 =
  | {
      readonly status: "accepted"
      readonly evidence: VNextTextBlockTransitionEvidenceV2
      readonly completedCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly evidence: null
      readonly completedCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export type VNextTextBlockTransitionProducerFailureAcceptanceResultV2 =
  | {
      readonly status: "fallback-required"
      readonly evaluatorOrProofAuthority: object
      readonly completedCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly evaluatorOrProofAuthority: null
      readonly completedCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }

export type VNextTextBlockTransitionEvidenceRequestResultV2 =
  | {
      readonly status: "required"
      readonly request: VNextTextBlockTransitionEvidenceRequestV2
      readonly sourceMaterial:
        VNextTextBlockTransitionProducerSourceMaterialV2
      readonly evaluatorOrProofAuthority: null
      readonly completedCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "not-required"
      readonly request: null
      readonly sourceMaterial: null
      readonly evaluatorOrProofAuthority: null
      readonly completedCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "fallback-required"
      readonly request: null
      readonly sourceMaterial: null
      readonly evaluatorOrProofAuthority: object
      readonly completedCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly request: null
      readonly sourceMaterial: null
      readonly evaluatorOrProofAuthority: null
      readonly completedCandidateWork:
        VNextTextBlockIncrementalCandidateWorkV1
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    }
```

The closed contracts contain the seven existing exact `false` producer
decision/publication fields. Work contains exact requested/consumed atom and
cluster facts, unused coverage, visited evidence nodes, and zero complete
traversal/comparison. `requestedClusterCount` is the Core-declared upper bound,
not an observed cluster count.

Adapter interface:

```ts
export interface FlowDocUnifiedIncrementalEvidenceRuntimeV2 {
  readonly identity: VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly shapeRange:
    FlowDocTextEngineIncrementalRangeExecutionRuntimeV1["shapeRange"]
  readonly segmentRange:
    FlowDocTextEngineIncrementalRangeExecutionRuntimeV1["segmentRange"]
}

export type FlowDocUnifiedIncrementalEvidenceResultV2 =
  | {
      readonly status: "accepted"
      readonly response: VNextTextBlockTransitionProducerResponseV2
      readonly failure: null
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly response: null
      readonly failure: VNextTextBlockTransitionProducerFailureV2
      readonly issues: readonly []
    }

export function createFlowDocTextEngineUnifiedIncrementalEvidenceV2(input: {
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly runtime: FlowDocUnifiedIncrementalEvidenceRuntimeV2
}): FlowDocUnifiedIncrementalEvidenceResultV2
```

Core acceptance interfaces:

```ts
export function createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(
  input: Omit<
    VNextTextBlockTransitionProducerRuntimeIdentityV2,
    "source" | "contractVersion" | "fingerprint"
  >,
): VNextTextBlockTransitionProducerRuntimeIdentityV2

export function createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
  },
): VNextTextBlockTransitionEvidenceRequestResultV2

export function acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly producerRuntimeIdentity:
    VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly response: unknown
}): VNextTextBlockTransitionEvidenceAcceptanceResultV2

export function acceptVNextTextBlockUnifiedLayoutProducerFailureV2(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly producerRuntimeIdentity:
    VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly failure: unknown
}): VNextTextBlockTransitionProducerFailureAcceptanceResultV2
```

- [ ] **Step 1: Write Node/WASM producer RED tests**

Use exact Task 2 bundles for Thai/Latin insertion, deletion, replacement,
resolved field, metric style, multi-style change, `fi`/`ffi`, hard-break/
image/generated-page adjacency, and zero-length changed deletion. Inject Node
and WASM range runtimes and normalize away runtime identity only:

```ts
const comparable = (value: VNextTextBlockTransitionProducerResponseV2) => ({
  nextEvidenceTargetRange: value.nextEvidenceTargetRange,
  shapingRuns: value.shapingRuns,
  breakOffsets: value.breakOffsets,
  shapingBoundaryProofs: value.shapingBoundaryProofs,
  sourceTopologyFingerprint: value.sourceTopologyFingerprint,
  work: value.work,
  contracts: value.contracts,
})
expect(comparable(node.response!)).toEqual(comparable(wasm.response!))
expect(node.response!.nextEvidenceTargetRange)
  .toEqual(bundle.request.next.evidenceTargetRange)
```

- [ ] **Step 2: Run producer RED**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts
```

Expected: FAIL because the V2 adapter does not exist.

- [ ] **Step 3: Implement descriptor-safe V2 material parsing**

Snapshot own data descriptors before ordinary reads. Enforce exact keys,
prototype, symbol, array, safe-integer, nested-range, relative-offset,
kind-specific atom, resolved-style identity, font, topology, unit, request,
and work-ceiling invariants. Reject Root/change, complete text/input, line/
band, reuse/reconvergence, fallback, asset/decode, geometry/Scene, renderer,
and Editor-shaped fields.

Import V2 types only from `@flowdoc/vnext-core`; add no adapter import from
`src/layout/**`.

- [ ] **Step 4: Implement exact style-partitioned bounded shaping**

Compose only the next coverage text. Partition the evidence target by exact
resolved style and hard-break/image boundaries. For each text-bearing
partition, call only `shapeRange` over the Core-declared verification span,
including Core-declared guard material. Verify returned text/range/context,
face and font metrics, safe scalar/cluster offsets, missing glyph count, first
target boundary, first right-guard boundary or exact style/block end, and safe
font-unit-to-LayoutUnit scaling.

Emit only target clusters; guards count in `visitedEvidenceNodeCount`. Adjacent
partitions coalesce only when every exact resolved-style fact is equal. A
fingerprint match alone never coalesces.

- [ ] **Step 5: Implement deterministic bounded segmentation**

Call `segmentRange` for each ordered Core-declared
`nextSegmentationContextRanges` entry. Remove artificial envelope endpoints,
compose explicit hard-break endpoints, and require the configured consecutive
equal target-break count. Stop before a visit over the exact producer ceiling.
Return `segmentation-not-stable` or `work-ceiling-before-visit` rather than
calling `segmentFull`, widening material, or selecting another target.

- [ ] **Step 6: Write and pass factual producer-failure tests**

Add unsafe left/right shaping guard, missing glyph, unavailable/mismatched
font, unstable segmentation, unsafe scaling, and threshold boundary rows:

```ts
expect(unsafeBoundary).toMatchObject({
  status: "blocked",
  response: null,
  failure: { code: "unsafe-shaping-boundary" },
})
expect(overLimit.failure!.completedWork.visitedEvidenceNodeCount)
  .toBe(limit)
expect(shapeFullCalls + segmentFullCalls).toBe(0)
```

- [ ] **Step 7: Write Core acceptance RED tests**

Cover exact accepted tuple, exact factual failure, clone, cross-Root,
cross-change, cross-request, cross-material, cross-runtime, widened/narrowed
target, wrong text/style/cluster/break/boundary/topology/work/fingerprint,
unknown field, accessor, symbol, prototype, unsafe integer, and forced
fingerprint collision.

```ts
expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2(exact))
  .toMatchObject({ status: "accepted", issues: [] })
expect(acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2({
  ...exact,
  sourceMaterial: structuredClone(exact.sourceMaterial),
})).toMatchObject({ status: "blocked", evidence: null })
expect(acceptVNextTextBlockUnifiedLayoutProducerFailureV2(exactFailure))
  .toMatchObject({
    status: "fallback-required",
    evaluatorOrProofAuthority: expect.any(Object),
  })
```

- [ ] **Step 8: Implement exact V2 acceptance and private authority records**

In `textBlockUnifiedLayoutTransitionEvidenceV2.ts`, bind the exact
Root/change/preflight/request/material/runtime tuple through private
WeakMaps/WeakSets. Recompute response text/style/coverage/topology/work from
the exact material and response descriptors. Register evidence only after all
facts pass. Validate factual failures against the same tuple before minting
Core proof/limit authority. Fingerprints remain integrity facts only.

The public request wrapper invokes Task 2 preflight and projects its result
without exposing `preflight`: required rows return the exact registered request
and material references, not clones; not-required rows return neither;
fallback rows return only the exact opaque evaluator/proof authority; blocked
rows return structured issues.

- [ ] **Step 9: Add the type-only public seam and leakage guard**

`src/index.ts` exports only the V2 request/material/response/failure/runtime-
identity data types plus
`createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2`,
`acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2`, and
`acceptVNextTextBlockUnifiedLayoutProducerFailureV2`. Do not export preflight,
style registry, range visitors,
material/runtime factories, authority records/inspectors, policy selection,
or an adapter shortcut.

`packages/text-engine-rust-wasm/src/index.ts` exports the adapter function and
its package-local result/runtime types. Assert:

```ts
expect(adapterPlan.adapterContract).toMatchObject({
  importsCoreAsPublicPackage: true,
  coreImportsAdapterBack: false,
})
expect(Object.keys(publicCore)).not.toEqual(expect.arrayContaining([
  "prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2",
  "resolveVNextTextBlockRegisteredSourceStyleInternalV1",
  "createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2",
]))
```

- [ ] **Step 10: Run the Task 3 GREEN and parity gate**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textEngineMr1RangeFactsV1.test.ts tests/textEngineIncrementalRangeExecutionV1.test.ts tests/textEngineFlowEvidenceNodeWasmV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
npm --prefix packages/text-engine-rust-wasm run type-check
git diff --check
```

Expected: PASS; Node/WASM normalized facts and counters are equal; full-oracle
calls appear only in named QA comparisons; public V1 and V3 identities remain
unchanged.

- [ ] **Step 11: Commit Task 3**

```powershell
git add packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.ts packages/text-engine-rust-wasm/src/index.ts src/index.ts src/layout/textBlockUnifiedLayoutEvidenceContractV2.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts
git commit -m "feat(layout): add bounded transition evidence v2"
```

### 5B-2A Review Stop

Run the Task 1-3 gates together and review only the V2 preflight/evidence
scope. PASS requires post-preflight classification, exact registered style
authority, distinct nested ranges, Node/WASM parity, safe shaping guards,
stable bounded segmentation, no complete-input/suffix reads, exact material
tuple authority, operation-owned pre-visit work, unchanged V1/V3 identity,
and no public producer decision authority. Stop on any Critical/Important
finding before Task 4.

---

## 5B-2B Source and Flow Transition

### Task 4: Text, Field, and Style Source Path Copy

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts`
- Modify: `tests/helpers/textBlockUnifiedLayoutRootV2.ts`

**Interfaces:**

- Consumes: exact Task 2 preflight authority and replacement items, exact
  accepted V2 evidence when required, and operation-owned source visit
  authority. It does not reclassify the change or resolve style again.
- Produces: an unregistered next Source State candidate, exact dirty source
  ranges, exact source-item lineage mapping, and factual source work.

```ts
export interface VNextTextBlockUnifiedLayoutSourceStageAcceptedV1 {
  readonly status: "accepted"
  readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
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
  readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
  readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}):
  | VNextTextBlockUnifiedLayoutSourceStageAcceptedV1
  | VNextTextBlockUnifiedLayoutOwnedStageFailureV1
```

Task 2 adds `VNextTextBlockUnifiedLayoutOwnedStageFailureV1` to the transition
contract before declaring its preflight result; Task 4 reuses it unchanged.

- [ ] **Step 1: Write the complete source RED matrix**

Cover Thai/Latin insertion, deletion, replacement at start/middle/end;
hard-break and field adjacency; identical field text with changed provenance;
changed field text with equal/different metrics; paint-only color; equal-metric
style/provenance; metric style; and Task 2-blocked unsupported style. Assert
Task 4 consumes the exact preflight replacement instead of resolving it again.

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
collision rows. Add a two-transition row proving the first accepted next
Source State owns an exact updated style registry for the second preflight.

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
It must not classify changes or register Root authority. It updates the
process-local style sidecar from exact previous style reference counts plus
bounded removed/replacement items, removes bindings whose exact count reaches
zero, and binds the resulting exact style set to the prepared next Source
State. It never copies a historical style that is absent from the next state
and never traverses the retained suffix to rebuild the registry.

- [ ] **Step 4: Consume preflight classification and replacement facts**

Consume the exact replacement from the registered preflight authority.
Preserve offset-independent suffix item identity. Map effect classes exactly:

```ts
switch (preflight.effectClassification.effectClass) {
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
exact Task 2 replacement record and changed source ranges.

Require accepted exact V2 evidence bound to the same preflight material for
evidence-bearing rows and reject evidence for evidence-free rows.

- [ ] **Step 5: Enforce source visits before work**

For each lookup/path-copy/leaf-item visit, call the exact stage evaluator from
validated-change authority. Commit the count after acceptance only. Convert a
limit result to its evaluator authority; convert proof/identity failure to a
Core-minted proof authority or structured block. Never manufacture fallback
from a caller-shaped reason.

- [ ] **Step 6: Run GREEN and source regressions**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 7: Commit**

```powershell
git add src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts tests/helpers/textBlockUnifiedLayoutRootV2.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts
git commit -m "feat(layout): add text and style source transitions"
```

### Task 5: Evidence-to-Flow Path Copy

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts`
- Modify: `src/layout/textBlockIncrementalFlowTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`

**Interfaces:**

- Consumes: Task 4 Source stage, exact accepted V2 evidence, and previous Flow
  Tree authority.
- Produces: an unregistered next Flow Tree candidate, Core-derived layout seed,
  existing/new lineage facts, and completed flow work.

```ts
export interface VNextTextBlockUnifiedLayoutFlowStageAcceptedV1 {
  readonly status: "accepted"
  readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
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
  readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
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

Convert accepted V2 shaping runs/breaks for the exact evidence target and
Source Stage facts into flow atoms.
For semantic-only and paint-only rows, bind the exact previous Flow Tree to the
new Source State through a narrow alias proof instead of building a wrapper.
Reject any evidence gap, surplus, topology mismatch, or dependency drift.

- [ ] **Step 5: Derive the layout seed and wire private stage sequencing**

The seed comes only from Source/Flow summaries and the exact preflight. Add a
private transition dispatch that reaches Source then Flow for 5B-2 kinds but
still returns the existing inactive-stage result at the public V3 boundary.
This task does not accept a new Root.

- [ ] **Step 6: Run GREEN and fallback regressions**

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockIncrementalFlowTreeV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
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
no public activation. Stop before Task 6 on a Critical/Important finding.

---

## 5B-2C Bounded Layout and E/T/R/N

### Task 6: One-Line Bounded Recompute and Candidate Splice

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionLineInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutLineTransitionV1.test.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`

**Interfaces:**

- Consumes: Task 5 Flow stage, exact previous line/spatial authority, and the
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

### Task 7: Exact Structural Reuse, Reconvergence, and Canonical Dispositions

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutReconvergenceInternalsV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutDispositionInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutReconvergenceV1.test.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionLineInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`

**Interfaces:**

- Consumes: Task 6 recompute cursor/lines and exact previous Line Tree summary
  paths.
- Produces: either one whole-subtree exact structural reuse decision or one
  accepted exact/translated/no-reuse text-layout proof, a prepared next Line
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
  readonly reuseDecision: VNextTextBlockUnifiedLayoutLineReuseDecisionInternalV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly []
}

export type VNextTextBlockUnifiedLayoutLineReuseDecisionInternalV1 =
  | {
      readonly mode: "whole-subtree-exact-structural-reuse"
      readonly previousLineTree: VNextTextBlockPersistentLayoutLineTreeV1
      readonly nextLineTree: VNextTextBlockPersistentLayoutLineTreeV1
      readonly proofFingerprint: string
    }
  | {
      readonly mode: "source-remapped-existing-lineage"
      readonly previousLineRange: VNextTextBlockLineOrdinalRangeV1
      readonly nextLineRange: VNextTextBlockLineOrdinalRangeV1
      readonly proofFingerprint: string
    }
  | {
      readonly mode: "text-layout"
      readonly reconvergence: VNextTextBlockUnifiedLayoutReconvergenceProofInternalV1
    }
```

- [ ] **Step 1: Write structural reuse and exact reconvergence RED tests**

For paint-only rows, assert the next Line Tree dependency is the exact
registered previous Line Tree object:

```ts
expect(result.reuseDecision).toMatchObject({
  mode: "whole-subtree-exact-structural-reuse",
  previousLineTree: previous.root.lineTree,
  nextLineTree: previous.root.lineTree,
})
expect(result.nextLineTree).toBe(previous.root.lineTree)
expect(result.completedCandidateWork.layout.recomputedLineCount).toBe(0)
expect(result.completedCandidateWork.layout.proofNodeCount).toBe(0)
expect(result.completedCandidateWork.structuralReuseProof
  .selectedExactSubtreeNodeCount).toBeGreaterThan(0)
```

Reject a newly constructed wrapper, a cloned/equal-fingerprint tree, or a
foreign exact-looking subtree. This lane is structural proof, never
reconvergence, and it must not claim that every line was visited.

For semantic-only rows, assert a new path-copied Line Tree with `R` existing
lineage only where source/provenance mapping changed, exact `E` elsewhere,
zero line-internals recomputation, zero positioned-geometry recomputation,
and no reconvergence claim:

```ts
expect(semantic.reuseDecision.mode)
  .toBe("source-remapped-existing-lineage")
expect(semantic.nextLineTree).not.toBe(previous.root.lineTree)
expect(semantic.dispositions.counts.R).toBeGreaterThan(0)
expect(semantic.completedCandidateWork.layout.recomputedLineCount).toBe(0)
expect(semantic.completedCandidateWork.layout.proofNodeCount).toBe(0)
```

For layout-affecting rows, cover exact reconvergence after equal-length
start/middle/end replacement, insert/delete, hard-break and field adjacency,
long retained suffix, and selected maximal subtree identity.

```ts
expect(exact.reuseDecision).toMatchObject({
  mode: "text-layout",
  reconvergence: { mode: "exact" },
})
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
expect(valid.reuseDecision).toMatchObject({
  mode: "text-layout",
  reconvergence: {
    mode: "translated",
    constantYDeltaLayoutUnit: expectedDelta,
  },
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

- [ ] **Step 6: Implement structural reuse or recompute-until-proof orchestration**

Before creating a recompute cursor, route paint-only effects through the frozen
5B-1 whole-subtree structural proof. The accepted next Line Tree dependency
must be `===` the exact registered previous Line Tree dependency. Do not
construct a next wrapper, compare an equal fingerprint, visit each line, or
report this branch as reconvergence.

Route semantic-only effects through bounded source-mapping path copy over the
exact layout-only Flow dependency. Replace only affected line records as `R`
existing lineage, retain unchanged lines as exact `E`, and reuse line internals
and positioned geometry. This branch is neither whole-subtree structural reuse
nor reconvergence.

Alternate Task 6 one-line recomputation with Task 7 proof attempts. Stop on
exact/translated proof, end of Flow, proof failure, or exact evaluator limit.
Build the next Line Tree through the Task 6 splice seam. Never walk an accepted
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
distinction between structural reuse and reconvergence. Stop before Task 8 on
any Critical/Important finding.

---

## 5B-2D Geometry, Scene, Fallback, and Oracle Closure

### Task 8: Disposition-Driven Text/Style Geometry

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutTextStyleGeometryV1.test.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`

**Interfaces:**

- Consumes: Task 7 Line stage, next Source State, unchanged 5B-2 Spatial State,
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

### Task 9: Scene/Root Candidate, Exact Fallback, and QA Oracle

**Files:**

- Create: `tests/helpers/textBlockUnifiedIncremental5b2.ts`
- Create: `tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutFallbackV1.ts`
- Modify: `tests/textBlockUnifiedLayoutFallbackV1.test.ts`

**Interfaces:**

- Consumes: Task 4-8 accepted private stages.
- Produces: one prepared Scene/Delivery/Root candidate or one exact
  proof/evaluator failure authority. Public V3 remains inactive until Task 10.

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
Preserve the existing versioned Scene tree-policy fingerprint and its literal
highest-node, left-to-right stored-order greedy cover. For the same retain
range, assert registered canonical shapes produce the one expected cover and
forged alternate/equal-size/noncanonical shapes are rejected rather than
silently selecting an implementation-dependent tie.

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
with Task 4-9 candidate dependencies. Recompose actual target binding and
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

### Task 10: Calibrate, Publish, and Atomically Activate `5b-2-v1`

**Files:**

- Create: `fixtures/live-draft-unified-incremental-root-5b2-work-calibration.v1.json`
- Create: `tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts`
- Create: `src/layout/textBlockUnifiedLayoutTransitionContractV2.ts`
- Create: `src/layout/textBlockUnifiedLayoutTransitionV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutFallbackV1.ts`
- Modify: `src/index.ts`
- Modify: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`
- Modify: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`

**Interfaces:**

- Consumes: factual operation-owned observations from Tasks 1-9 and the exact
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

export type VNextTextBlockUnifiedLayoutTransitionInputV2 =
  | {
      readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
      readonly change: VNextTextBlockUnifiedLayoutChangeV1
      readonly evidence?: VNextTextBlockTransitionEvidenceV2
      readonly evaluatorOrProofAuthority?: never
    }
  | {
      readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
      readonly change: VNextTextBlockUnifiedLayoutChangeV1
      readonly evidence?: never
      readonly evaluatorOrProofAuthority: object
    }

export function attemptVNextTextBlockUnifiedLayoutRootTransitionV2(
  input: VNextTextBlockUnifiedLayoutTransitionInputV2,
): VNextTextBlockUnifiedLayoutTransitionResultV1
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

Run the declared fixture matrix through private Tasks 1-9 stage harnesses in
this exact order:

```text
1 line: true no-op, paint-only color, semantic-only field provenance
8 lines: Thai/Latin start/middle/end insert/delete/replace
32 lines: hard-break adjacency and field adjacency
33 lines: equal-metric and metric-affecting style
128 lines: exact and translated reconvergence
2,048 lines: long retained suffix for insert/delete/replace/style
```

The ordered matrix also includes `fi`/`ffi`, Thai combining boundaries,
zero-length changed deletion, safe/unsafe shape guards, stable/unstable
segmentation, exact registered style, novel-style structured block,
generated-page passive context, and forced style/fingerprint collision. These
rows calibrate only their actual active stage units; blocked capability rows do
not manufacture nonzero execution observations.

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

Change public `createVNextTextBlockUnifiedLayoutRootV2(...)` to use the exact
5B2 policy internally. Add the version-honest public
`attemptVNextTextBlockUnifiedLayoutRootTransitionV2(...)` for V2 evidence and
accepted producer-failure authority. Do not add a public policy parameter.

Keep `attemptVNextTextBlockUnifiedLayoutRootTransitionV1(...)` behavior and
input shape frozen for the 5B-1 QA lane; do not add V2 evidence or failure
authority to its input.

Keep the complete internal builder able to validate exact registered V3 roots
for frozen tests, but require public 5B-2 transition previous Root authority to
be bound to `VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_V1`.

```ts
expect(v2AttemptWithV3Root).toMatchObject({
  status: "blocked",
  issues: [{ code: "previous-root-authority-mismatch" }],
})
expect(v2AttemptWith5b2Root.status).toBe("accepted-incremental")
```

There is no policy migration in the attempt. A caller creates a 5B-2 Root by
calling the ordinary complete public bootstrap after activation.

- [ ] **Step 7: Activate Tasks 1-9 orchestration atomically**

In `textBlockUnifiedLayoutTransitionV2.ts`, execute exact Preflight → accepted
Evidence V2 or accepted producer-failure authority → Source → Flow → Line/
reconvergence/disposition → Geometry → Scene/Delivery → target-binding →
atomic Root registration. A preflight limit or exact accepted producer failure
is converted to the ordinary two-step fallback request here. Each other
failure returns its exact existing blocked/fallback result. No stage is
repaired from complete/oracle material.

After accepted preflight classification, true no-op returns the exact previous
Root/Scene wrappers before Source work. Semantic-only and paint-only continue
through the structural reuse lane because they require a new Root/Scene while
retaining the exact previous Line Tree dependency.

- [ ] **Step 8: Tighten the public export boundary**

Export `VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_V1`,
`VNextTextBlockUnifiedLayoutTransitionInputV2`,
`attemptVNextTextBlockUnifiedLayoutRootTransitionV2`, and the reviewed V2
evidence type/function seam. Preserve the frozen public V1 evidence
surface and the existing exact `5B1_V3` policy export unchanged as frozen QA
compatibility evidence; do not accept it in the V2 attempt or add a caller
policy selector. Assert no owner helper, calibration
factory, policy registry, producer runtime implementation, stage function,
authority map, candidate builder, collision factory, test-only calibration
policy, or QA helper is public.

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
git add fixtures/live-draft-unified-incremental-root-5b2-work-calibration.v1.json fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockUnifiedLayoutRootV2.ts src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts src/layout/textBlockUnifiedLayoutTransitionContractV2.ts src/layout/textBlockUnifiedLayoutTransitionV2.ts src/layout/textBlockUnifiedLayoutFallbackV1.ts src/index.ts tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
git commit -m "feat(layout): activate phase 5b-2 work policy"
```

### Task 11: Capability Handoff, Final Review, and Full Gate

**Files:**

- Create: `.superpowers/sdd/2026-08-02-unified-incremental-root-transition-5b-2/final-verification.md`
- Create: `.superpowers/sdd/2026-08-02-unified-incremental-root-transition-5b-2/final-review-verdict.md`
- Modify: `README.md`
- Modify: `docs/PHASE_LEDGER.md`
- Modify: `docs/LIVE_DRAFT_MR1_UNIFIED_INCREMENTAL_ROOT_5B.md`
- Modify: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`
- Modify: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`

**Interfaces:**

- Consumes: committed Tasks 1-10 and exact calibration identity.
- Produces: capability-honest handoff, final verification evidence, scoped
  review verdict, and one closure commit. It does not start 5B-3.

- [ ] **Step 1: Add final capability RED assertions**

Assert the manifest and public handoff report exactly:

```ts
expect(manifest.capabilities).toMatchObject({
  trueNoOpIncrementalTransition: true,
  imagePaintIncrementalTransition: true,
  textStyleIncrementalTransition: true,
  textInsertionReplacementStyleAuthority: "existing-root-registered-only",
  novelStyleInsertionReplacement: false,
  semanticOnlyIncrementalTransition: true,
  emptyBlockIncrementalTransition: false,
  generatedPageNumberProducerContext: "passive-only",
  generatedPageNumberIncrementalMutation: false,
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
  transitionEvidenceProtocol: "Core-v2",
  producerSourceMaterialAuthority: "Core-process-local-exact",
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
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockUnifiedLayoutLineTransitionV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutTextStyleGeometryV1.test.ts tests/textBlockUnifiedLayoutTextStyleTransitionV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts tests/textEngineMr1RangeFactsV1.test.ts tests/textEngineIncrementalRangeExecutionV1.test.ts tests/textEngineFlowEvidenceNodeWasmV2.test.ts
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
git add -f .superpowers/sdd/2026-08-02-unified-incremental-root-transition-5b-2/final-verification.md .superpowers/sdd/2026-08-02-unified-incremental-root-transition-5b-2/final-review-verdict.md
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

| Accepted design requirement | Plan coverage |
| --- | --- |
| V3 accepted base and immutable identity | Global Constraints, Tasks 1 and 10 |
| Five reviewable slices | Tasks 1-11 and five review stops |
| Post-bounded-preflight effect classification | Task 2 |
| Exact registered-style authority and collision block | Task 2 |
| Distinct changed/target/verification/coverage ranges | Task 2 |
| Evidence V2 material/runtime exact tuple | Tasks 2-3 |
| Safe shaping guards and stable bounded segmentation | Task 3 |
| Node/WASM parity without complete hot-path oracle | Task 3 |
| Passive generated-page context; no generated mutation | Tasks 2-3, 10-11 |
| Empty-block and novel-style capability remain inactive | Tasks 2, 10-11 |
| Pre-visit request/material/producer work limits | Tasks 1-3, 10 |
| V1 evidence frozen; V2 is active producer lane | Global Constraints, Tasks 2-3, 10 |
| Text/field/style Source and Flow path copy | Tasks 4-5 |
| Bounded line work and zero suffix traversal | Task 6 |
| Whole-subtree structural proof remains distinct from reconvergence | Task 7 |
| Exact/strict translated reconvergence | Task 7 |
| Canonical exhaustive E/T/R/N | Task 7 |
| Text/style-only locked geometry; no executable prelock | Tasks 8 and 10 |
| Scene/delivery/atomic Root acceptance | Task 9 |
| Exact two-step candidate-independent fallback | Task 9 |
| External oracle and separate ledgers | Tasks 9 and 11 |
| `5b-2-v1`, factual calibration, threshold gates | Task 10 |
| Bootstrap-bound policy activation | Task 10 |
| Capability-honest handoff and full Core gate | Task 11 |
| Stop before 5B-3 | Task 11 |
