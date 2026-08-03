# Unified Incremental Root Transition 5B-2 Rebaseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activate a bounded, Core-only, process-local Root V2 text/field/style
transition lane over an image-free, trivial-Spatial, unchanged auto-height Root
profile while preserving the frozen 5B-1 V3/Attempt V1 lane exactly.

**Architecture:** Add a distinct 5B-2 bootstrap and Attempt V2. The complete
5B-2 kernel registers exact admission, Source-sidecar, Flow/Break, Spatial,
Line, Scene, Delivery, and Root authority. Incremental work reopens Tasks 2-5
before replacing the unaccepted Task 6 path; it uses exact E/R/N disposition,
candidate-independent fallback, and an independent complete oracle. Strict
translated reuse remains inactive with `T = 0`.

**Tech Stack:** TypeScript 6 ESM, Vitest 4, fixed-point layout units, canonical
JSON plus compact SHA-256 integrity fingerprints, process-local WeakMap
authority, existing Persistent Source/Flow/Line/Scene structures, Node and
browser-Worker-WASM evidence runtimes, `npm run type-check`, and `npm test`.

## Global Constraints

- Normative precedence starts with
  `docs/superpowers/specs/2026-08-03-unified-incremental-root-transition-5b-2-plan-lock-design-correction.md`.
  Nonconflicting requirements remain active from the 2026-08-02 Evidence V2,
  Source-topology/fallback-target, 2026-08-01 V3 amendment, and original 5B
  design documents.
- Work only in `flowdoc-vnext-core`. Editor and Backend remain read-only.
- Use branch `phase-5b-unified-incremental-root-transition` in the existing
  isolated worktree. Do not push or merge.
- Preserve `createVNextTextBlockUnifiedLayoutRootV2(...)`, Attempt V1, the V3
  policy object, V3 runtime facts, and V3 fingerprints exactly.
- Add `createVNextTextBlockUnifiedLayoutRoot5B2V1(...)` and
  `attemptVNextTextBlockUnifiedLayoutRootTransitionV2(...)`; do not add a caller
  policy selector.
- Attempt V2 admits only exact registered 5B-2 Roots that are image-free, use
  canonical trivial Spatial State, and retain an unchanged supported
  auto-height authored box without clipping or overflow.
- Ordinary insertion/replacement rejects `CR`, `LF`, `U+2028`, `U+2029`, and
  `U+FFFC`; an ordinary range cannot cross or mutate a structural hard break or
  inline image.
- Evidence request creation and every later incremental stage must not inspect
  complete next canonical input, a complete suffix, complete Line Tree,
  complete Scene, or complete delivery.
- The caller never supplies dirty ranges, affected lines/bands,
  reconvergence, dispositions, reuse, fallback target, or oracle output.
- Every owner checks its exact deterministic unit before the first observable
  payload read or emission. Wall clock and estimated payload bytes never select
  execution.
- Keep `incrementalCandidateWork`, `completeFallbackWork`, and
  `completeOracleWork` separate. Complete-kernel construction work is not
  relabeled as incremental work.
- Partial Source, Flow, Break, Spatial, Line, Scene, Delivery, or Root
  candidates never enter fallback authority.
- Fingerprints are integrity facts only. Exact registered object identity is
  required, including forced equal-digest fixtures.
- The private Break Topology mirrors the exact Flow Tree shape and remains a
  task-specific process-local sidecar; public Flow V1 and Root V2 runtime shapes
  do not change.
- E/T/R/N remains mutually exclusive and exhaustive at the contract level.
  Active 5B-2 emits only E/R/N. `T` is always empty and has no executable
  Geometry, Scene, Delivery, or policy path.
- A selected constant-translation suffix returns candidate-free fallback
  before suffix enumeration. It is never disguised as R.
- Complete bootstrap and complete fallback call one private 5B-2 complete
  kernel and differ only in envelope and provenance.
- Complete oracle code is tests-only and may not import incremental
  candidate/splice helpers or select production execution.
- Lifetime claims are limited to object-graph retention. GC timing and
  product-scale memory remain unknown.
- Use TDD for each task. Every task ends with focused tests, type-check,
  `git diff --check`, a focused commit, and a Thai review summary.
- Stop on any open Critical or Important finding, V3 identity drift, public
  shape drift, unmetered first observation, complete-suffix access, or
  capability overclaim.
- Do not start 5B-3, Worker, Editor, Backend, production activation, fixed
  height, asset lifecycle, or V1 retirement.

## Approved Execution Correction — Private 5B-2 Kernel Ordering

Approved by the user on 2026-08-03 after the Task 2 pre-TDD gate found that the
only existing complete Root creator belongs to the frozen V3 lane.

- Task 2 creates the private 5B-2 complete-kernel scaffold before it creates
  admission authority. It does not change or wrap the frozen V3 public
  bootstrap.
- The private kernel accepts an exact internal work-policy object and an exact
  construction kind of `complete-bootstrap` or `complete-fallback`. Before
  Task 10, tests may call it only with the exact internal 5B-2 calibration/test
  policy.
- The Task 2 test helper calls the private kernel directly. No public 5B-2
  bootstrap, Attempt V2, fallback completion, manifest capability, or package
  export is activated by Task 2.
- Tasks 4, 5, 8, and 9A extend the same private kernel's atomic child/sidecar
  registration as their owners become available. They do not create parallel
  complete builders.
- Task 9B calls this same private kernel with `complete-fallback`; it does not
  introduce a second fallback builder.
- Task 10 adds only the public
  `createVNextTextBlockUnifiedLayoutRoot5B2V1(...)` bootstrap wrapper, binds the
  exact active 5B-2 policy, and activates Attempt V2 atomically.
- `createVNextTextBlockUnifiedLayoutRootV2(...)`, Attempt V1, V3 policy/runtime
  facts/fingerprints, and V3 Root registration remain exact throughout.

## Execution Preflight and Recovery of the Unaccepted Task 6 Diff

The reviewed plan commit is based on `d9e30f7`. Before implementation, inspect
Core, Editor, and Backend state again and compare it with the reviewed handoff.
Fetch/prune is read-only with respect to local work; do not push or merge.

```powershell
Get-Content AGENTS.md
git status --short
git branch --show-current
git rev-parse HEAD
git branch -vv
git fetch --prune
git rev-list --left-right --count origin/main...HEAD
```

Run equivalent status, branch, HEAD, fetch/prune, and divergence checks in:

```text
C:\Users\nekot\Documents\GitHub\flowdoc-vnext-editor
C:\Users\nekot\Documents\GitHub\flowdoc-vnext-backend
```

The current uncommitted Task 6 files are RED evidence, not an implementation
base. Preserve them recoverably before Task 2, then restore only these exact
paths to reviewed HEAD:

```powershell
$red = '.superpowers/sdd/2026-08-03-unified-incremental-root-transition-5b-2-rebaseline/unaccepted-task6-red'
New-Item -ItemType Directory -Force -Path $red | Out-Null
git diff --binary -- src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts | Set-Content -LiteralPath "$red/tracked.patch"
Copy-Item -LiteralPath src/layout/textBlockUnifiedLayoutTransitionLineInternalsV1.ts -Destination "$red/textBlockUnifiedLayoutTransitionLineInternalsV1.ts"
Copy-Item -LiteralPath tests/textBlockUnifiedLayoutLineTransitionV1.test.ts -Destination "$red/textBlockUnifiedLayoutLineTransitionV1.test.ts"
Get-FileHash -Algorithm SHA256 "$red/tracked.patch", "$red/textBlockUnifiedLayoutTransitionLineInternalsV1.ts", "$red/textBlockUnifiedLayoutLineTransitionV1.test.ts"
git restore --source=HEAD --worktree -- src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
Remove-Item -LiteralPath src/layout/textBlockUnifiedLayoutTransitionLineInternalsV1.ts, tests/textBlockUnifiedLayoutLineTransitionV1.test.ts
git status --short
```

Expected: the three ignored RED evidence files remain recoverable under
`.superpowers/sdd`; the tracked implementation worktree is clean. If any other
path is dirty, stop and report it rather than restoring it.

Run the clean baseline:

```powershell
npm run type-check
npm test
```

Record actual file/test counts and failures. Do not copy the historic 454-file
or 2,586-test numbers as current facts.

## File Responsibility Map

### New focused implementation files

- `src/layout/textBlockUnifiedLayoutTrivialAdmissionInternalsV1.ts` — exact
  Root-bound 5B-2 admission registration and lookup only.
- `src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts` — private
  task-specific persistent physical-index and registered-style/refcount trees.
- `src/layout/textBlockIncrementalBreakTopologyContractInternalV1.ts` — private
  relative Break node, summary, group, work, and result types only.
- `src/layout/textBlockIncrementalBreakTopologyV1.ts` — complete build,
  path-copy, exact alias, group lookup, and process-local authority.
- `src/layout/textBlockUnifiedLayoutTransitionSpatialInternalsV1.ts` — exact
  trivial-Spatial rebinding from previous Source to next Source.
- `src/layout/textBlockUnifiedLayoutTransitionLineInternalsV1.ts` — one-line
  provisional recomputation and single-use cursor only.
- `src/layout/textBlockUnifiedLayoutReconvergenceInternalsV1.ts` — exact
  reconvergence summary proof and constant-translation fallback detection.
- `src/layout/textBlockUnifiedLayoutDispositionInternalsV1.ts` — canonical
  E/R/N cover and removed-line accounting; T is validated empty.
- `src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts` — final
  R/N geometry validation and final Line binding only.
- `src/layout/textBlockUnifiedLayoutTransitionContractV2.ts` — closed public V2
  attempt input and public result aliases only.
- `src/layout/textBlockUnifiedLayoutTransitionV2.ts` — 5B-2 orchestration only.
- `src/layout/textBlockUnifiedLayoutFallbackContractV2.ts` — closed public
  Fallback V2 request/result inspection shapes.
- `src/layout/textBlockUnifiedLayoutFallbackV2.ts` — sanitized single-use
  request, independent complete material boundary, and logical replay.
- `src/layout/textBlockUnifiedLayoutWorkOwnerRegistryV1.ts` — exact ordered
  owner/unit/ledger/base registry and completeness audit.
- `tests/helpers/textBlockUnifiedIncremental5b2.ts` — admitted fixtures,
  independently authored complete material, normalization, and hostile probes.
- `tests/textBlockUnifiedLayoutTrivialAdmissionV1.test.ts`
- `tests/textBlockIncrementalBreakTopologyV1.test.ts`
- `tests/textBlockUnifiedLayoutSpatialAliasV1.test.ts`
- `tests/textBlockUnifiedLayoutReconvergenceV1.test.ts`
- `tests/textBlockUnifiedLayoutDispositionV1.test.ts`
- `tests/textBlockUnifiedLayoutGeometryV1.test.ts`
- `tests/textBlockUnifiedLayoutTextStyleTransitionV2.test.ts`
- `tests/textBlockUnifiedLayoutFallbackV2.test.ts`
- `tests/textBlockUnifiedLayoutOracleV2.test.ts`
- `tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts`
- `fixtures/live-draft-unified-incremental-root-5b2-work-calibration.v1.json`

### Existing files with narrow changes

- `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts` — admission-first
  preflight, structural sentinel rejection, exact ranges, and pre-visit work.
- `src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts` — request/material
  acceptance and exact producer work.
- `src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts` — Source
  stage orchestration and full authority tuple.
- `src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts` — conditional
  exact alias or bounded metadata path-copy plus Break binding.
- `src/layout/textBlockUnifiedLayoutSourceStateV1.ts` — narrow hooks for the
  task-specific sidecars; no public Source State V1 shape change.
- `src/layout/textBlockIncrementalFlowTreeV1.ts` — exact Flow replacement and
  metadata path-copy seams only.
- `src/layout/textBlockPersistentLayoutLineTreeV1.ts` — opaque cover/path splice
  that copies boundary paths without flattening.
- `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts` — text/style
  Scene path-copy from final E/R/N Line authority.
- `src/layout/textBlockUnifiedLayoutRootV2.ts` — shared private 5B-2 complete
  kernel, new bootstrap, and incremental candidate seam.
- `src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.ts` — atomic 5B-2
  child registration and exact current-root registry.
- `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts` — owner-derived policy and
  immutable calibration revision; frozen V3 rows remain byte-for-byte exact.
- `src/index.ts` — reviewed public V2 bootstrap/attempt/fallback exports only.
- `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json` — qualified
  capability and frozen ownership map.
- `docs/LIVE_DRAFT_MR1_UNIFIED_TEXT_BLOCK_ROOT_5A.md` — final 5B-2 handoff truth.

No new file may export a generic rope, B-tree, registry, transform, or renderer
framework. Internal helpers stay in their task owner module.

## Locked Cross-Task Interfaces

```ts
export interface VNextTextBlockUnifiedLayoutTrivialAdmissionAuthorityInternalV1 {}
export interface VNextTextBlockIncrementalBreakTopologyAuthorityInternalV1 {}
export interface VNextTextBlockUnifiedLayoutTrivialSpatialAliasInternalV1 {}
export interface VNextTextBlockUnifiedLayoutProvisionalLineCursorInternalV1 {}
export interface VNextTextBlockUnifiedLayoutReconvergenceAuthorityInternalV1 {}
export interface VNextTextBlockUnifiedLayoutFinalLineAuthorityInternalV1 {}
export interface VNextTextBlockLineTreeBoundaryPathAuthorityInternalV1 {}
export interface VNextTextBlockUnifiedLayoutDispositionAuthorityInternalV1 {}

export interface VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1 {
  readonly source: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly physicalIndexRoot: object
  readonly styleRegistryRoot: object
}

export type VNextTextBlockUnifiedLayoutSourceSidecarPathCopyResultInternalV1 =
  | {
      readonly status: "accepted"
      readonly sidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
      readonly completedWork: VNextTextBlockIncrementalCandidateWorkV1
    }
  | {
      readonly status: "fallback-required"
      readonly sidecars: null
      readonly completedWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly causeAuthority: object
    }

export type VNextTextBlockUnifiedLayoutLineRecomputeStartResultInternalV1 =
  | {
      readonly status: "accepted"
      readonly cursor: VNextTextBlockUnifiedLayoutProvisionalLineCursorInternalV1
      readonly completedWork: VNextTextBlockIncrementalCandidateWorkV1
    }
  | {
      readonly status: "fallback-required"
      readonly cursor: null
      readonly completedWork: VNextTextBlockIncrementalCandidateWorkV1
      readonly causeAuthority: object
    }

export type VNextTextBlockUnifiedLayoutOneLineResultInternalV1 =
  | {
      readonly status: "accepted"
      readonly line: VNextTextBlockUnifiedLayoutRecomputedLineInternalV1
      readonly nextCursor: VNextTextBlockUnifiedLayoutProvisionalLineCursorInternalV1 | null
      readonly completedWork: VNextTextBlockIncrementalCandidateWorkV1
    }
  | {
      readonly status: "fallback-required" | "blocked"
      readonly line: null
      readonly nextCursor: null
      readonly completedWork: VNextTextBlockIncrementalCandidateWorkV1
    }

export type VNextTextBlockUnifiedLayoutFinalLineResultInternalV1 =
  | {
      readonly status: "accepted"
      readonly lineTree: VNextTextBlockPersistentLayoutLineTreeV1
      readonly authority: VNextTextBlockUnifiedLayoutFinalLineAuthorityInternalV1
      readonly completedWork: VNextTextBlockIncrementalCandidateWorkV1
    }
  | {
      readonly status: "fallback-required" | "blocked"
      readonly lineTree: null
      readonly authority: null
      readonly completedWork: VNextTextBlockIncrementalCandidateWorkV1
    }

export function createVNextTextBlockUnifiedLayoutRoot5B2CompleteInternalV1(input: {
  readonly buildInput: VNextTextBlockUnifiedLayoutRootBuildInputV2
  readonly constructionKind: "complete-bootstrap" | "complete-fallback"
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutRootResultV2

export function createVNextTextBlockUnifiedLayoutRoot5B2V1(
  input: VNextTextBlockUnifiedLayoutRootBuildInputV2,
): VNextTextBlockUnifiedLayoutRootResultV2

export function attemptVNextTextBlockUnifiedLayoutRootTransitionV2(
  input: VNextTextBlockUnifiedLayoutTransitionInputV2,
): VNextTextBlockUnifiedLayoutTransitionResultV1
```

The empty authority interfaces are opaque tokens. Their normative tuples live
only in private WeakMap records and are checked by exact identity.

## Checkpoint Sequence

1. **5B-2A — Contract, Admission, and Evidence:** Tasks 2-3.
2. **5B-2B — Source, Flow, Break, and Spatial Foundation:** Tasks 4-5.
3. **5B-2C — Bounded Line, Reconvergence, Disposition, and Geometry:** Tasks 6-8.
4. **5B-2D — Scene, Root, Fallback, and Oracle:** Tasks 9A-9B.
5. **5B-2E — Owner-Derived Calibration, Activation, and Handoff:** Tasks 10-11.

Task 6 cannot begin until the 5B-2A and 5B-2B review stops both pass with no
open Critical or Important finding.

---

## 5B-2A — Contract, Admission, and Evidence

### Task 2: Root-Bound Admission and Corrected Semantic Preflight

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTrivialAdmissionInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutTrivialAdmissionV1.test.ts`
- Create: `tests/helpers/textBlockUnifiedIncremental5b2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutChangeContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts`

**Interfaces:**

- Consumes: exact registered 5B-2 Root, Source, trivial Spatial State, authored
  box, work policy, and V1 change object.
- Produces: exact admission authority, corrected four-range preflight, exact
  evidence-material tuple, private 5B-2 complete-kernel scaffold, or
  candidate-free fallback before producer work.

- [ ] **Step 1: Preserve and remove the unaccepted Task 6 working diff**

Execute the recovery commands in “Execution Preflight”. Verify the three SHA-256
hashes exist and `git status --short` is clean before editing Task 2.

- [ ] **Step 2: Write failing admission and structural-sentinel tests**

Add table-driven fixtures with these exact expected paths:

```ts
const rejectedOrdinaryText = ["\r", "\n", "\u2028", "\u2029", "\ufffc"] as const

it.each(rejectedOrdinaryText)(
  "rejects ordinary replacement sentinel %j before evidence work",
  (text) => {
    const result = attemptPreflight({ root: admittedRoot(), change: replaceText(text) })
    expect(result.status).toBe("fallback-required")
    expect(inspectIncrementalWork(result).evidenceRequestCount).toBe(0)
    expect(producerObserver.calls).toBe(0)
  },
)

it("rejects a range crossing a retained structural hard break", () => {
  const result = attemptPreflight({
    root: admittedHardBreakRoot(),
    change: replaceRenderedRange(2, 5, "x"),
  })
  expect(result.status).toBe("fallback-required")
  expect(result.reason).toBe("unsupported-structural-change")
})
```

Also test: inline-image Root, nontrivial Spatial Root, authored-box mutation,
fixed-height/overflow Root, generated-page mutation, and unknown style all fail
before Evidence; default and supported nondefault unchanged auto-height Roots
mint admission.

- [ ] **Step 3: Run the admission tests and verify RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutTrivialAdmissionV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts
```

Expected: the new admission lookup and sentinel cases fail because the exact
Root-bound authority and structural rejection do not exist.

- [ ] **Step 4: Create the private 5B-2 complete-kernel scaffold**

Add this internal-only seam in
`src/layout/textBlockUnifiedLayoutRootV2.ts`:

```ts
export function createVNextTextBlockUnifiedLayoutRoot5B2CompleteInternalV1(input: {
  readonly buildInput: VNextTextBlockUnifiedLayoutRootBuildInputV2
  readonly constructionKind: "complete-bootstrap" | "complete-fallback"
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutRootResultV2
```

The function shares the existing complete candidate/construction kernel code
without changing the V3 wrapper or V3 output. It rejects every policy except an
exact registered internal 5B-2 policy, prepares the Root graph, registers the
Task 2 admission sidecar before returning the accepted Root, and records the
construction kind. Do not export it from `src/index.ts`. The Task 2 test helper
may import this internal seam and pass the exact internal calibration/test
policy with `constructionKind: "complete-bootstrap"`.

The scaffold is intentionally incomplete only in owner availability: later
tasks add Source-sidecar, Flow/Break, final-Line, Scene, and Delivery bindings
to this same function. They must not fork its complete construction logic.

- [ ] **Step 5: Implement the exact admission registry**

Implement only these owner seams:

```ts
export function registerVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly source: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  readonly authoredBox: VNextTextBlockAuthoredBoxSummaryV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutTrivialAdmissionAuthorityInternalV1 | null

export function resolveVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutTrivialAdmissionAuthorityInternalV1 | null
```

The registration predicate is the exact conjunction in Design Correction
Section 3.2. Store the tuple in a WeakMap keyed by the exact Root; do not scan
the Source during incremental lookup. Register only after the complete Root
graph is accepted. A forced-equal fingerprint cannot substitute for any tuple
member.

- [ ] **Step 6: Make admission precede all preflight payload access**

At the top of V2 preflight, perform strict public-shape validation, exact Root
registry lookup, cross-lane rejection, and admission lookup. Only an admitted
Root may derive the changed Source range, Evidence target range, shaping
verification range, or coverage range.

Use this closed classification vocabulary:

```ts
export type VNextTextBlockUnifiedLayoutEffectClassV2 =
  | "true-no-op"
  | "semantic-only"
  | "paint-only"
  | "equal-metric"
  | "metric-affecting"
```

Rendered or geometric equality does not collapse a provenance change to
`true-no-op`. True no-op requires exact semantic/source/change equivalence.

- [ ] **Step 7: Correct structural ranges and first-observable work**

Reject all five ordinary sentinels and any range that crosses a structural
item. Keep the four half-open absolute UTF-16 ranges distinct. Charge coverage
node/item, descriptor, atom, style node/bucket/entry, comparison, scalar, and
guard units before reading the corresponding payload. Limit exits retain
factual attempted/completed work and no request authority.

- [ ] **Step 8: Run Task 2 GREEN and regression gates**

```powershell
npx vitest run tests/textBlockUnifiedLayoutTrivialAdmissionV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
npm run type-check
git diff --check
```

Expected: Task 2 fixtures pass; V3 bootstrap/Attempt V1 tests and exact V3
policy/fingerprint assertions remain unchanged.

- [ ] **Step 9: Commit Task 2**

```powershell
git add src/layout/textBlockUnifiedLayoutTrivialAdmissionInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts src/layout/textBlockUnifiedLayoutChangeContractV1.ts src/layout/textBlockUnifiedLayoutRootV2.ts tests/textBlockUnifiedLayoutTrivialAdmissionV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "fix(layout): bind phase 5b2 admission and preflight"
```

### Task 3: Exact Producer Evidence and Acceptance Work

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutEvidenceContractV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts`
- Modify: `packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.ts`
- Modify: `tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`

**Interfaces:**

- Consumes: exact Task 2 preflight/material authority and Core-owned bounded
  Evidence V2 request.
- Produces: exact accepted Evidence V2 binding with factual producer and Core
  acceptance work, or exact producer-failure/fallback authority without a
  partial candidate.

- [ ] **Step 1: Write failing first-observable and hostile-result tests**

```ts
it("charges every producer and acceptance slot before first observation", () => {
  const hostile = producerResultWithThrowingGetters()
  const result = acceptEvidenceWithLimit(hostile, {
    unit: "evidence-response-descriptors",
    limit: 0,
  })
  expect(result.status).toBe("fallback-required")
  expect(hostile.observed).toEqual([])
})

it("rejects cloned and equal-digest evidence by exact request identity", () => {
  const accepted = produceEvidence(admittedMetricEdit())
  expect(acceptEvidence({ ...accepted })).toMatchObject({ status: "blocked" })
  expect(acceptForcedCollisionEvidence(accepted)).toMatchObject({ status: "blocked" })
})
```

Cover request/material/response descriptors, array slots, atoms, glyphs,
clusters, breaks, guards, proof facts, malformed work, cross-runtime identity,
and producer failure. Keep Node and Worker-WASM outputs normalized equal.

- [ ] **Step 2: Run Task 3 tests and verify RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts
```

Expected: at least one getter/slot is observed before its owner limit or one
ordinary sentinel/structural case is still accepted by the producer seam.

- [ ] **Step 3: Close the Evidence V2 data shapes**

Keep request-scoped data only. The public request/material/response must not
contain a Root, complete next Source, complete suffix, caller range, reuse
choice, fallback target, or candidate binding. Preserve exact `breakOffsets`
with ordinary opportunity versus mandatory semantics; do not collapse them to
one break per Flow atom.

- [ ] **Step 4: Meter producer and Core acceptance before observation**

For every registry unit, call the exact policy evaluator before reading or
emitting its payload. Exact WeakMap membership may precede charging; record
payload may not. Invalid/failing evidence retains factual work and produces no
accepted Evidence binding.

- [ ] **Step 5: Prove Node/WASM parity and bounded failure**

Run Latin spaced/unspaced, Thai, field adjacency, retained hard break,
generated-page passive context, equal/metric style, deletion, replacement,
forced collision, and threshold-minus-one/equal/plus-one rows. Assert no full
runtime call and no wall-clock/payload-size branch.

- [ ] **Step 6: Run Task 3 GREEN and type-check**

```powershell
npx vitest run tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockFlowEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 7: Commit Task 3**

```powershell
git add src/layout/textBlockUnifiedLayoutEvidenceContractV2.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "fix(layout): close phase 5b2 producer evidence"
```

### 5B-2A Review Stop

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutTrivialAdmissionV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
npm run type-check
git diff --check
```

Review the Task 2-3 commits against Design Correction Sections 3, 4, and 6.1.
Write a separate Thai review with findings ordered Critical, Important, Minor.
Do not start Task 4 until no Critical or Important finding remains.

---

## 5B-2B — Source, Flow, Break, and Spatial Foundation

### Task 4: Persistent Source Sidecars and Full Structural Authority

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`

**Interfaces:**

- Consumes: exact Task 2 preflight, accepted Evidence or evidence-free
  layout-delta proof, previous Source, canonical local replacement, and exact
  policy.
- Produces: exact next Source, persistent physical-index and style/refcount
  sidecars, completed Source work, and one full structural-target authority.

The Source sidecars use one task-specific, versioned canonical 8-way B+ shape:

```ts
const SOURCE_SIDECAR_POLICY_INTERNAL_V1 = Object.freeze({
  version: 1 as const,
  maximumLeafEntries: 8 as const,
  maximumBranchChildren: 8 as const,
  splitPreference: "canonical-left-to-right" as const,
})
```

Physical-index keys are ordered by `(inlineId, kindOrdinal,
startRenderedUtf16, endRenderedUtf16)`. Plain-text fragments may share
`inlineId`; atomic item keys must remain unique. Style keys are ordered by
`styleFingerprint` and then exact canonical style facts; equal digests form a
bounded exact-comparison bucket. Leaves carry subtree entry/refcount summaries.
The module is private and may not export a reusable B+ tree.

- [ ] **Step 1: Write failing sidecar persistence and authority tests**

```ts
it("path-copies physical index and style refcounts without walking the suffix", () => {
  const previous = admittedSourceWithThirtyThreeLeaves()
  const observed: string[] = []
  const next = transitionMiddleStyle(previous, observeSourceSidecar(observed))
  expect(next.status).toBe("accepted")
  expect(observed).not.toContain("retained-suffix-entry")
  expect(inspectSourceSidecars(next.root).retainedSuffixNodes).toBeGreaterThan(0)
})

it("rejects a structural authority missing the exact next index root", () => {
  const accepted = transitionMiddleText(admittedRoot())
  expect(bindSourceStage({
    ...accepted,
    physicalIndex: clonePhysicalIndex(accepted.physicalIndex),
  })).toMatchObject({ status: "blocked" })
})
```

Cover 1/8/9/32/33/128 entries, duplicate plain-text inline IDs, duplicate
atomic IDs, forced style collision, refcount deletion, root collapse,
left-borrow/right-borrow/left-merge/right-merge, and transition chains of at
least three published Source states.

- [ ] **Step 2: Run Source tests and verify RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts
```

Expected: the current delta-index/history scan or array-style registry either
walks retained history/suffix, lacks the exact sidecar authority, or observes a
payload before its unit.

- [ ] **Step 3: Implement complete and incremental sidecar owners**

Implement these private seams:

```ts
export function createVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1(input: {
  readonly source: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1

export function pathCopyVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1(input: {
  readonly previousSource: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSource: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly replacement: VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1
  readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutSourceSidecarPathCopyResultInternalV1
```

Complete construction inserts Source-order entries deterministically; it does
not use an unmetered sort. Incremental construction copies only search and
rebalance paths, retains exact unaffected nodes, and charges node, entry,
bucket, comparison, refcount, and copied-path units before access.

- [ ] **Step 4: Bind the full Task 4 normative tuple**

The private Source-stage record must bind exactly:

```text
previous Source
+ admission/preflight/change authority
+ accepted Evidence or evidence-free layout-delta proof
+ exact policy
+ canonical local packing rule
+ exact next Source candidate
+ exact physical-index root
+ exact style/refcount root
+ completed work
+ topology-sensitive structural-target authority
```

Remove authority paths that can accept a fingerprint-equal clone, an
unbounded history-depth delta scan, or a whole-registry clone.

- [ ] **Step 5: Prove first-observable and multi-transition behavior**

Use throwing getters/observers at the first Source node, leaf slot, index node,
index entry, comparison, style node, bucket, and style entry. Each zero limit
must stop before observation. Transition 2 and 3 must resolve only from the
latest published Source sidecars, not a bootstrap registry or prior cursor.

- [ ] **Step 6: Run Task 4 GREEN and type-check**

```powershell
npx vitest run tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 7: Commit Task 4**

```powershell
git add src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "fix(layout): persist phase 5b2 source authority"
```

### Task 5: Flow Metadata, Persistent Break Topology, and Trivial Spatial Alias

**Files:**

- Create: `src/layout/textBlockIncrementalBreakTopologyContractInternalV1.ts`
- Create: `src/layout/textBlockIncrementalBreakTopologyV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutTransitionSpatialInternalsV1.ts`
- Create: `tests/textBlockIncrementalBreakTopologyV1.test.ts`
- Create: `tests/textBlockUnifiedLayoutSpatialAliasV1.test.ts`
- Modify: `src/layout/textBlockIncrementalFlowTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`

**Interfaces:**

- Consumes: exact Task 4 Source stage, accepted Evidence or exact alias proof,
  previous Flow/Break authority, exact trivial Spatial State, admission, and
  policy.
- Produces: exact next Flow object, exact relative Break Topology, Flow/Break
  stage authority, exact trivial-Spatial alias, completed work, and Task 6
  group-selection authority.

The private Break representation is locked as:

```ts
export type VNextTextBlockBreakBoundaryDispositionInternalV1 =
  | "prohibited"
  | "opportunity"
  | "mandatory"

export interface VNextTextBlockIncrementalBreakSummaryInternalV1 {
  readonly renderedUtf16Length: number
  readonly atomCount: number
  readonly opportunityCount: number
  readonly mandatoryCount: number
  readonly integrityFingerprint: string
}

export interface VNextTextBlockIncrementalBreakLeafInternalV1 {
  readonly kind: "leaf"
  readonly exactFlowLeaf: VNextTextBlockIncrementalFlowLeafV1
  readonly boundaries: readonly VNextTextBlockBreakBoundaryDispositionInternalV1[]
  readonly summary: VNextTextBlockIncrementalBreakSummaryInternalV1
}

export interface VNextTextBlockIncrementalBreakBranchInternalV1 {
  readonly kind: "branch"
  readonly exactFlowBranch: VNextTextBlockIncrementalFlowBranchV1
  readonly children: readonly VNextTextBlockIncrementalBreakNodeInternalV1[]
  readonly summary: VNextTextBlockIncrementalBreakSummaryInternalV1
}

export type VNextTextBlockIncrementalBreakNodeInternalV1 =
  | VNextTextBlockIncrementalBreakLeafInternalV1
  | VNextTextBlockIncrementalBreakBranchInternalV1

export type VNextTextBlockIncrementalBreakTopologyBuildResultInternalV1 =
  | {
      readonly status: "accepted"
      readonly root: VNextTextBlockIncrementalBreakNodeInternalV1
      readonly authority: VNextTextBlockIncrementalBreakTopologyAuthorityInternalV1
      readonly completedWork: VNextTextBlockIncrementalCandidateWorkV1
    }
  | {
      readonly status: "fallback-required" | "blocked"
      readonly root: null
      readonly authority: null
      readonly completedWork: VNextTextBlockIncrementalCandidateWorkV1
    }

export type VNextTextBlockIncrementalBreakGroupSelectionResultInternalV1 =
  | {
      readonly status: "accepted"
      readonly startAtomOrdinal: number
      readonly endAtomOrdinal: number
      readonly mandatory: boolean
      readonly nextCursor: object | null
      readonly completedWork: VNextTextBlockIncrementalCandidateWorkV1
    }
  | {
      readonly status: "fallback-required" | "blocked"
      readonly completedWork: VNextTextBlockIncrementalCandidateWorkV1
    }
```

Every leaf/branch mirrors its exact Flow counterpart. Boundaries are relative
to atoms; there is no complete revision-wide absolute-offset array.

- [ ] **Step 1: Write failing Flow alias/metadata and Break fixtures**

```ts
it("retains exact Break subtrees across a prefix insertion", () => {
  const previous = admittedUnspacedLatinRoot(2048)
  const next = transitionPrefixInsert(previous, "x")
  expect(next.status).toBe("accepted")
  expect(inspectBreak(next).suffixRoot).toBe(inspectBreak(previous).suffixRoot)
})

it("preserves Thai, spaces, and mandatory hard-break group semantics", () => {
  expect(groupsFor("alpha beta")).toEqual(expectedSpacedLatinGroups)
  expect(groupsFor("ภาษาไทย")).toEqual(expectedThaiGroups)
  expect(groupsForRetainedHardBreak()).toContainEqual({ end: 4, mandatory: true })
})

it("metadata-path-copies Flow when physical Source mappings change", () => {
  const next = transitionPaintThatSplitsSource(admittedRoot())
  expect(next.flow).not.toBe(next.previous.flow)
  expect(next.flow.layoutMetricsFingerprint).toBe(next.previous.flow.layoutMetricsFingerprint)
  expect(next.flow.sourceMappingsFingerprint).not.toBe(next.previous.flow.sourceMappingsFingerprint)
})
```

Add exact Flow alias tests where every stored physical mapping remains exact;
cloned/stale/cross-Root authority must reject. Add Spatial tests proving the
exact trivial object is retained but receives a fresh next-Source binding on
every non-no-op transition.

- [ ] **Step 2: Run Task 5 tests and verify RED**

```powershell
npx vitest run tests/textBlockIncrementalBreakTopologyV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockUnifiedLayoutSpatialAliasV1.test.ts
```

Expected: ordinary opportunities are absent, the current Flow path may alias
stale physical mappings, and no exact next-Source Spatial alias exists.

- [ ] **Step 3: Build Break Topology in the shared complete kernel**

```ts
export function createVNextTextBlockIncrementalBreakTopologyCompleteInternalV1(input: {
  readonly flowTree: VNextTextBlockIncrementalFlowTreeV1
  readonly evidence: VNextTextBlockFlowEvidenceV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockIncrementalBreakTopologyBuildResultInternalV1
```

Map accepted Evidence break facts to exact Flow atoms once. Store
`prohibited/opportunity/mandatory`, local rendered lengths, and compositional
summaries. Bootstrap and fallback call this same function through the private
5B-2 complete kernel.

- [ ] **Step 4: Implement conditional Flow alias and metadata path-copy**

Exact Flow object alias requires exact next physical Source mappings,
provenance, offsets, boundaries, and Break facts. Otherwise path-copy the
affected Flow metadata/source mapping while retaining exact shaping metrics.
Never use layout fingerprint equality as alias authority.

Path-copy the Break tree using the exact previous/next Flow replacement ranges
and accepted Evidence break facts. Retain exact unaffected Break nodes and
compose summaries only on copied paths.

- [ ] **Step 5: Expose bounded Break group selection**

```ts
export function selectVNextTextBlockIncrementalBreakGroupInternalV1(input: {
  readonly authority: VNextTextBlockIncrementalBreakTopologyAuthorityInternalV1
  readonly startAtomOrdinal: number
  readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockIncrementalBreakGroupSelectionResultInternalV1
```

The selector visits/charges tree lookup nodes, boundary entries, and group
emission before access. It returns one canonical group and an opaque next
cursor; it never exposes a flat complete break-offset array.

- [ ] **Step 6: Mint the exact trivial-Spatial alias**

```ts
export function bindVNextTextBlockUnifiedLayoutTrivialSpatialInternalV1(input: {
  readonly previousSource: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSource: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly sourceStageAuthority: VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
  readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  readonly admission: VNextTextBlockUnifiedLayoutTrivialAdmissionAuthorityInternalV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutTrivialSpatialAliasInternalV1 | null
```

The alias is single-transition. Its previous/next Source, Spatial object,
admission, and policy must all match by identity.

- [ ] **Step 7: Prove first-observable, collision, and transition-chain behavior**

Zero each Flow/Break/Spatial unit with hostile observers. Run forced equal
digests, exact aliases, metadata path-copy, prefix/middle/end edits, 1/8/32/33/
128/2,048 structures, and three published Flow/Break transitions. A later
transition must reject the previous transition's stage, cursor, or alias.

- [ ] **Step 8: Run Task 5 GREEN and type-check**

```powershell
npx vitest run tests/textBlockIncrementalBreakTopologyV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockUnifiedLayoutSpatialAliasV1.test.ts tests/textBlockIncrementalFlowTreeV1.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 9: Commit Task 5**

```powershell
git add src/layout/textBlockIncrementalBreakTopologyContractInternalV1.ts src/layout/textBlockIncrementalBreakTopologyV1.ts src/layout/textBlockUnifiedLayoutTransitionSpatialInternalsV1.ts src/layout/textBlockIncrementalFlowTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionFlowInternalsV1.ts src/layout/textBlockUnifiedLayoutRootV2.ts tests/textBlockIncrementalBreakTopologyV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockUnifiedLayoutSpatialAliasV1.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "feat(layout): persist phase 5b2 flow break authority"
```

### 5B-2B Review Stop

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockIncrementalBreakTopologyV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockUnifiedLayoutSpatialAliasV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts
npm run type-check
git diff --check
```

Review exact Source tuple ownership, sidecar balancing/tie-breaking, Flow alias
conditions, Break semantics, first-observable charging, and three-transition
lifecycle. Produce a separate Thai review. Do not resume Task 6 until no
Critical or Important finding remains.

---

## 5B-2C — Bounded Line, Reconvergence, Disposition, and Geometry

### Task 6: Linear One-Line Recompute and Boundary-Path Splice

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionLineInternalsV1.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Create: `tests/textBlockUnifiedLayoutLineTransitionV1.test.ts`
- Modify: `tests/textBlockPersistentLayoutLineTreeV1.test.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`

**Interfaces:**

- Consumes: exact published Root, Task 5 Flow/Break stage, trivial-Spatial
  alias, unchanged authored box, recompute seed, exact policy, and candidate
  ledger.
- Produces: one provisional physical line plus single-use next cursor, factual
  work, or candidate-free fallback. The splice owner consumes only opaque
  cover/path authorities and replacement lines.

- [ ] **Step 1: Write failing canonical one-line tests**

```ts
it("places one spaced Latin line without rerunning the growing prefix", () => {
  const observed = observePlacementAtoms()
  const result = recomputeOneLine(admittedSpacedLatinEdit(), observed)
  expect(result.status).toBe("accepted")
  expect(observed.atomOrdinals).toEqual([...new Set(observed.atomOrdinals)])
})

it("stops a long unbreakable line by atom work rather than line count", () => {
  const result = recomputeWithLimit(longUnbreakableEdit(), {
    unit: "line-placement-atoms",
    limit: 32,
  })
  expect(result.status).toBe("fallback-required")
  expect(result.completedWork.recomputedLines).toBe(0)
  expect(result.completedWork.linePlacementAtoms).toBe(32)
})

it("rejects cursor replay and cross-transition reuse", () => {
  const first = recomputeOneLine(admittedEdit())
  expect(recomputeFromCursor(first.nextCursor).status).toBe("accepted")
  expect(recomputeFromCursor(first.nextCursor).status).toBe("blocked")
})
```

Cover unspaced Latin, spaces, Thai clusters, retained mandatory hard break,
field adjacency, zero-advance-heavy fragments, wrap/no-wrap, first/middle/last
edit, and a 2,048-line fixture.

- [ ] **Step 2: Write failing splice no-traversal tests**

Install observers on line lookup, full inspection, `collectLeaves`, recursive
freeze, suffix leaves, and subtree summary reads. The success fixture passes
opaque prefix/suffix cover/path authorities and must observe only boundary
paths plus replacement lines.

```ts
expect(spliceObserved.collectLeavesCalls).toBe(0)
expect(spliceObserved.completeRootBuildCalls).toBe(0)
expect(spliceObserved.retainedSuffixLeafReads).toBe(0)
expect(nextTree.retainedInterior).toBe(previousTree.retainedInterior)
```

- [ ] **Step 3: Run Task 6 tests and verify RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutLineTransitionV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts
```

Expected: the preserved RED algorithm would infer one group per Flow atom,
rerun placement, flatten with `collectLeaves`, or rebuild a complete root.

- [ ] **Step 4: Implement the single-use provisional cursor**

```ts
export function beginVNextTextBlockUnifiedLayoutLineRecomputeInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly flowStage: VNextTextBlockUnifiedLayoutFlowStageAcceptedV1
  readonly breakAuthority: VNextTextBlockIncrementalBreakTopologyAuthorityInternalV1
  readonly spatialAlias: VNextTextBlockUnifiedLayoutTrivialSpatialAliasInternalV1
  readonly authoredBox: VNextTextBlockAuthoredBoxSummaryV2
  readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutLineRecomputeStartResultInternalV1

export function recomputeVNextTextBlockUnifiedLayoutOneLineInternalV1(input: {
  readonly cursor: VNextTextBlockUnifiedLayoutProvisionalLineCursorInternalV1
}): VNextTextBlockUnifiedLayoutOneLineResultInternalV1
```

The cursor record binds every input by exact identity and is consumed once.
The algorithm visits canonical Break groups in order, visits each Flow/
placement atom at most once for the line, retains a last-opportunity snapshot,
and emits the line at mandatory break, accepted overflow opportunity, or
end-of-flow. It does not rerun placement over a growing prefix.

- [ ] **Step 5: Charge all one-line work before observation**

Charge Line/Flow/Break lookup nodes, Break groups/boundaries, Flow atoms,
placement atoms, Source index nodes/entries, fragments, line-record
construction, and recomputed-line completion. `recomputed-lines = 1` is never
the only bound. A limit result contains factual work and no provisional line.

- [ ] **Step 6: Replace flattening with opaque boundary-path splice**

```ts
export function prepareVNextTextBlockPersistentLayoutLineTreeSpliceInternalV1(input: {
  readonly previousTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly prefixPathAuthority: VNextTextBlockLineTreeBoundaryPathAuthorityInternalV1
  readonly suffixPathAuthority: VNextTextBlockLineTreeBoundaryPathAuthorityInternalV1
  readonly replacementLines: readonly VNextTextBlockPersistentLayoutLineV1[]
  readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockPersistentLayoutLineTreeSpliceResultInternalV1
```

Copy only boundary paths, retain exact interior nodes, and compose summaries
from exact child summaries. Remove the incremental success-path call to
`collectLeaves`; keep any complete/QA helper private to nonincremental paths.

- [ ] **Step 7: Run Task 6 GREEN and boundedness fixtures**

```powershell
npx vitest run tests/textBlockUnifiedLayoutLineTransitionV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockIncrementalBreakTopologyV1.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 8: Commit Task 6**

```powershell
git add src/layout/textBlockUnifiedLayoutTransitionLineInternalsV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts tests/textBlockUnifiedLayoutLineTransitionV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "feat(layout): recompute bounded phase 5b2 lines"
```

### Task 7: Exact Reconvergence and Canonical E/R/N Cover

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutReconvergenceInternalsV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutDispositionInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutReconvergenceV1.test.ts`
- Create: `tests/textBlockUnifiedLayoutDispositionV1.test.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineContractV1.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`

**Interfaces:**

- Consumes: exact previous Line Tree, Task 6 provisional R/N lines and cursor,
  current Source/Flow/Break/Spatial/authored-box authority, policy, and work.
- Produces: exact reconvergence authority, canonical highest-node
  left-to-right E/R/N cover, opaque prefix/suffix boundary paths, removed-line
  count, or constant-translation fallback before suffix enumeration.

- [ ] **Step 1: Write failing reconvergence and disposition tests**

```ts
it("selects the highest exact retained suffix nodes left to right", () => {
  const result = proveReconvergence(exactSuffixFixture(2048))
  expect(result.status).toBe("accepted")
  expect(result.cover).toEqual(expectedCanonicalMaximalCover)
  expect(result.observedSuffixLines).toBe(0)
})

it("returns fallback for a constant-translation suffix with T empty", () => {
  const result = proveReconvergence(constantTranslationSuffixFixture(2048))
  expect(result.status).toBe("fallback-required")
  expect(result.dispositions.T).toEqual([])
  expect(result.observedSuffixLines).toBe(0)
  expect(result.observedSceneChunks).toBe(0)
})

it("emits mutually exclusive exhaustive E/R/N coverage", () => {
  const cover = buildDispositionCover(mixedRecomputeFixture())
  expect(assertExclusiveExhaustiveCover(cover)).toBe(true)
  expect(cover.segments.some((segment) => segment.disposition === "T")).toBe(false)
})
```

Include forced equal-digest/different-object, stale mapping, changed provenance,
boundary semantics, no reconvergence, edit inside a previously exact suffix,
tree shapes at 1/8/32/33/128/2,048, and equal-sized candidate subtrees.

- [ ] **Step 2: Run Task 7 tests and verify RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutDispositionV1.test.ts
```

Expected: the existing cover API accepts raw ordinal authority, T has an
executable path, or suffix selection inspects lines rather than summaries.

- [ ] **Step 3: Implement summary-based exact reconvergence**

Exact E requires exact retained Line object, internals, source mapping,
provenance, content-local geometry, authored-box geometry, boundary semantics,
current Source/Flow/Break/Spatial binding, and exact policy. Compare registered
summary authority first; fingerprints alone never prove E.

If summaries prove one constant delta but not exact geometry, return a
transition-local cause authority for candidate-free fallback immediately.
Do not enumerate, translate, or relabel the suffix.

- [ ] **Step 4: Lock canonical cover selection**

Use the versioned existing Line Tree balancing shape. For each requested exact
range, select the highest stored node wholly contained in the range; visit
children in stored left-to-right order; when two same-height choices exist,
select the leftmost first. Merge adjacent selected ranges only when their
parent is itself wholly contained and exact. This yields one unique maximal
cover for the exact stored tree; foreign tree shapes are blocked, not
normalized by fingerprint.

- [ ] **Step 5: Build E/R/N and opaque splice paths**

E covers exact retained subtrees with zero leaf visits. R contains only
existing lineages actually recomputed or source-remapped with factual work. N
contains only newly minted lineages. Removed previous lines are counted
separately. T is asserted empty. Mint opaque prefix/suffix boundary-path
authorities for the Task 6 splice owner.

- [ ] **Step 6: Run Task 7 GREEN and 2,048-line sentinels**

```powershell
npx vitest run tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutDispositionV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockUnifiedLayoutLineTransitionV1.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 7: Commit Task 7**

```powershell
git add src/layout/textBlockUnifiedLayoutReconvergenceInternalsV1.ts src/layout/textBlockUnifiedLayoutDispositionInternalsV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockPersistentLayoutLineContractV1.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutDispositionV1.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "feat(layout): prove exact phase 5b2 reconvergence"
```

### Task 8: Final Text/Style Geometry and Line Authority

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutGeometryV1.test.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`

**Interfaces:**

- Consumes: exact Task 7 disposition/cover, provisional R/N lines, exact E
  nodes, current Source/Flow/Break, trivial-Spatial alias, unchanged authored
  box, policy, and work.
- Produces: final Line Tree and the only final Line authority accepted by Task
  9A; refreshes current recompute-seed, source-mapping, spatial-line, and
  authored-line sidecars.

- [ ] **Step 1: Write failing final-Line binding tests**

```ts
it("retains E geometry and finalizes only factual R/N lines", () => {
  const result = finalizeGeometry(mixedERNFixture())
  expect(result.geometryWork.E).toBe(0)
  expect(result.geometryWork.R + result.geometryWork.N).toBe(result.changedLineCount)
  expect(result.finalLineTree.exactSuffix).toBe(result.previousLineTree.exactSuffix)
})

it("rejects a copied previous prepared record", () => {
  const forged = prepareFinalLineWithPreviousRecord(admittedEdit())
  expect(registerFinalLine(forged)).toMatchObject({ status: "blocked" })
})
```

Cover semantic-only/paint/equal-metric/metric edits, default and supported
nondefault unchanged boxes, stale Spatial alias, forced collisions, and three
published Roots.

- [ ] **Step 2: Run Task 8 tests and verify RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutGeometryV1.test.ts
```

- [ ] **Step 3: Implement R/N final geometry and exact E retention**

Recompute/validate only actual R/N lines and fragments. E retains exact line,
internals, mappings, and geometry. There is no T branch. Charge geometry line
and fragment units before access.

```ts
export function finalizeVNextTextBlockUnifiedLayoutLineInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly sourceStage: VNextTextBlockUnifiedLayoutSourceStageAcceptedV1
  readonly flowStage: VNextTextBlockUnifiedLayoutFlowStageAcceptedV1
  readonly breakAuthority: VNextTextBlockIncrementalBreakTopologyAuthorityInternalV1
  readonly spatialAlias: VNextTextBlockUnifiedLayoutTrivialSpatialAliasInternalV1
  readonly dispositionAuthority: VNextTextBlockUnifiedLayoutDispositionAuthorityInternalV1
  readonly candidateLineTree: VNextTextBlockPersistentLayoutLineTreeV1
  readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutFinalLineResultInternalV1
```

- [ ] **Step 4: Refresh every final Line sidecar and register atomically**

Bind exact next Source, current Flow/Break, trivial Spatial, authored box,
disposition/cover, final Line Tree, and final geometry. Mint new current
recompute-seed/source-mapping/spatial-line/authored-line sidecars. Never reuse
the preceding transition's prepared record.

- [ ] **Step 5: Run Task 8 GREEN and Checkpoint 5B-2C gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutGeometryV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutDispositionV1.test.ts tests/textBlockUnifiedLayoutLineTransitionV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockIncrementalBreakTopologyV1.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 6: Commit Task 8**

```powershell
git add src/layout/textBlockUnifiedLayoutTransitionGeometryInternalsV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts tests/textBlockUnifiedLayoutGeometryV1.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "feat(layout): finalize phase 5b2 line authority"
```

### 5B-2C Review Stop

Review Tasks 6-8 against Design Correction Sections 6.5, 7, and 8. The Thai
review must explicitly report:

- whether every one-line loop is linear or has a written amortized-linear proof;
- whether accepted splice paths avoid `collectLeaves`, full rebuild, and suffix
  enumeration;
- whether canonical cover tie-breaking is unique for the stored tree;
- whether E/R/N is mutually exclusive/exhaustive and T has zero executable
  paths; and
- whether a 2,048-line exact suffix and constant-translation suffix both show
  zero suffix Line/Scene reads.

Do not start Task 9A until no Critical or Important finding remains.

---

## 5B-2D — Scene, Root, Fallback, and Oracle

### Task 9A: E/R/N Scene, Delivery, and Atomic Incremental Root

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts`
- Modify: `src/layout/textBlockPersistentSceneV2.ts`
- Modify: `src/layout/textBlockSceneDeliveryV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.ts`
- Create: `tests/textBlockUnifiedLayoutTextStyleTransitionV2.test.ts`
- Modify: `tests/textBlockPersistentSceneV2.test.ts`
- Modify: `tests/textBlockSceneDeliveryV2.test.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`

**Interfaces:**

- Consumes: exact current Source/Flow/Break/Spatial/final-Line authority,
  canonical E/R/N cover, previous Scene/Delivery, unchanged authored box,
  exact policy, and audited candidate work.
- Produces: path-copied Persistent Scene V2, canonical retain/splice delivery,
  and one atomically registered incremental Root; any failure exposes no
  partial candidate.

- [ ] **Step 1: Write failing Scene/Delivery/Root tests**

```ts
it("retains E Scene subtrees and replaces only R/N chunks", () => {
  const result = transitionTextStyle(admittedMiddleEdit())
  expect(result.status).toBe("accepted-incremental")
  expect(result.scene.exactSuffix).toBe(result.previousScene.exactSuffix)
  expect(result.delivery.operations).toEqual(expectedRetainSpliceOperations)
})

it("registers no Root when final delivery validation fails", () => {
  const result = transitionWithInvalidDelivery(admittedEdit())
  expect(result.status).toBe("fallback-required")
  expect(inspectRootRegistration(result.candidate)).toBeNull()
  expect(inspectFallback(result).partialCandidate).toBeUndefined()
})
```

Cover semantic-only, paint-only, equal-metric, metric-affecting, no-op,
E-reconvergence, no-reconvergence, exact 2,048-line suffix, forced collision,
and three published Roots.

- [ ] **Step 2: Run Task 9A tests and verify RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutTextStyleTransitionV2.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts
```

- [ ] **Step 3: Path-copy Scene from final Line authority**

E retains exact Scene subtree/chunk objects only when Source/Line renderer facts
remain exact. R/N replace factual chunks and charge lookup, copied-node,
replacement-chunk, and created-node units before access. There is no T or
subtree-transform operation. Payload-byte estimates remain observations and
do not affect policy. Scene semantic identity excludes the estimated-payload
formula. Keep estimation-version/fingerprint in its existing delivery or
inspection integrity lane; if the current public Scene shape cannot represent
that separation, keep the estimate process-local rather than changing the
semantic Scene fingerprint or public Scene V2 shape.

- [ ] **Step 4: Build canonical retain/splice delivery**

Use only `retain-range` and `splice-range`. Retain cover uses the same
highest-node, stored-left-to-right maximal rule as the exact Scene tree.
Estimated delivery bytes remain in the delivery/estimation integrity facts;
they do not authorize retention or select fallback.

- [ ] **Step 5: Register the exact current Root graph atomically**

Require this chain by exact identity:

```text
Source -> Flow/Break
Source -> trivial Spatial
Source/Flow/Break/Spatial -> final Line
Source/Line -> Persistent Scene
Scene -> Delivery
all accepted children -> Root
```

Audit work and target binding before registration. On any failure, discard
every partial candidate reference from the public result and fallback request.
An accepted Root registers fresh current admission, Source sidecars,
Flow/Break, Spatial, Line, Scene, Delivery, and Root records for transition 2.

- [ ] **Step 6: Run Task 9A GREEN and atomicity gates**

```powershell
npx vitest run tests/textBlockUnifiedLayoutTextStyleTransitionV2.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutGeometryV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 7: Commit Task 9A**

```powershell
git add src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts src/layout/textBlockPersistentSceneV2.ts src/layout/textBlockSceneDeliveryV2.ts src/layout/textBlockUnifiedLayoutRootV2.ts src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.ts tests/textBlockUnifiedLayoutTextStyleTransitionV2.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "feat(layout): prepare atomic phase 5b2 roots"
```

### Task 9B: Candidate-Independent Fallback V2 and Independent QA Oracle

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutFallbackContractV2.ts`
- Create: `src/layout/textBlockUnifiedLayoutFallbackV2.ts`
- Create: `tests/textBlockUnifiedLayoutFallbackV2.test.ts`
- Create: `tests/textBlockUnifiedLayoutOracleV2.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`

**Interfaces:**

- Consumes: exact previous Root/change/policy, one consumed sanitized cause
  authority, stopped incremental work, and independently supplied complete
  material provided only after the attempt.
- Produces: a single-use public Fallback Request V2, fresh complete-fallback
  Root from the shared kernel, separate replay work, and tests-only normalized
  oracle comparison.

- [ ] **Step 1: Write failing request-sanitization and independence tests**

```ts
it("mints a candidate-free request with no incremental topology", () => {
  const request = inspectFallbackRequest(forceLineLimit(admittedEdit()))
  expect(Object.keys(request).sort()).toEqual([
    "contractVersion",
    "incrementalWorkAttempted",
    "mode",
    "previousRootFingerprint",
    "reason",
    "skippedOrFailedStage",
    "source",
    "workPolicyFingerprint",
  ])
})

it("builds fallback from independently supplied complete material", () => {
  const request = forceLineLimit(admittedEdit()).fallbackRequest
  const root = completeFallback(request, independentlyAuthoredCompleteMaterial())
  expect(root.status).toBe("accepted")
  expect(root.root.constructionKind).toBe("complete-fallback")
  expect(attemptNextTransition(root.root).status).toBe("accepted-incremental")
})

it("oracle expected facts do not import candidate helpers", () => {
  expect(oracleImportAudit()).toEqual([])
  expect(compareWithIndependentOracle(admittedEdit()).equal).toBe(true)
})
```

Also test request replay, cloned request, cross-policy request, consumed cause,
wrong logical target, fallback Root -> incremental -> third transition, and
separate work ledgers.

- [ ] **Step 2: Run Task 9B tests and verify RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutFallbackV2.test.ts tests/textBlockUnifiedLayoutOracleV2.test.ts
```

- [ ] **Step 3: Implement the closed public request shape**

```ts
export interface VNextTextBlockUnifiedLayoutFallbackRequestV2 {
  readonly source: "vnext-text-block-unified-layout-fallback-request-v2"
  readonly contractVersion: 2
  readonly mode: VNextTextBlockUnifiedLayoutFallbackModeV1
  readonly reason: VNextTextBlockUnifiedLayoutFallbackReasonV1
  readonly skippedOrFailedStage: VNextTextBlockUnifiedLayoutStageV1
  readonly incrementalWorkAttempted: boolean
  readonly previousRootFingerprint: string
  readonly workPolicyFingerprint: string
}

export type VNextTextBlockUnifiedLayoutCompleteFallbackResultV2 =
  | {
      readonly status: "accepted"
      readonly root: VNextTextBlockUnifiedLayoutRootV2
      readonly completeFallbackWork: VNextTextBlockCompleteFallbackWorkV1
    }
  | {
      readonly status: "blocked"
      readonly root: null
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
      readonly completeFallbackWork: VNextTextBlockCompleteFallbackWorkV1
    }

export function completeVNextTextBlockUnifiedLayoutRootFallbackV2(input: {
  readonly request: VNextTextBlockUnifiedLayoutFallbackRequestV2
  readonly completeMaterial: VNextTextBlockUnifiedLayoutRootBuildInputV2
}): VNextTextBlockUnifiedLayoutCompleteFallbackResultV2
```

The private request record stores only exact previous Root/change/policy,
sanitized cause facts, and stopped incremental work. The public and private
records contain no candidate target, local topology, range, summary, cover,
reuse, Scene, or Delivery object.

- [ ] **Step 4: Reuse the Task 2 private 5B-2 kernel**

The Task 2 internal/test bootstrap passes
`constructionKind: "complete-bootstrap"`; fallback passes
`constructionKind: "complete-fallback"`. Both call
`createVNextTextBlockUnifiedLayoutRoot5B2CompleteInternalV1(...)` and receive
the same current sidecar schema. Fallback logical replay compares the requested
logical change target, not local incremental packing. Charge previous logical
items, complete logical items, and logical spans separately from complete
construction.

- [ ] **Step 5: Implement the independent tests-only oracle**

The helper authors the complete logical target directly from the previous
logical Source and change, calls complete 5B-2 construction, and normalizes:

```text
ordered logical source/provenance
break semantics
physical line internals and mappings
geometry and authored box
renderer Scene facts
complete delivery
```

It must not import transition Source/Flow/Line/Reconvergence/Disposition/Scene
candidate helpers. Record complete build, normalization, source/renderer/
geometry comparison, and delivery comparison in `completeOracleWork` only.

- [ ] **Step 6: Run Task 9B GREEN and Checkpoint 5B-2D gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutFallbackV2.test.ts tests/textBlockUnifiedLayoutOracleV2.test.ts tests/textBlockUnifiedLayoutTextStyleTransitionV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 7: Commit Task 9B**

```powershell
git add src/layout/textBlockUnifiedLayoutFallbackContractV2.ts src/layout/textBlockUnifiedLayoutFallbackV2.ts src/layout/textBlockUnifiedLayoutRootV2.ts tests/textBlockUnifiedLayoutFallbackV2.test.ts tests/textBlockUnifiedLayoutOracleV2.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "feat(layout): close phase 5b2 fallback and oracle"
```

### 5B-2D Review Stop

Review candidate independence, shared-kernel equality, atomic Root
registration, Scene/Delivery exact retention, fallback-root lifecycle, oracle
imports, and ledger separation. Produce a separate Thai review. Do not start
Task 10 until no Critical or Important finding remains.

---

## 5B-2E — Owner-Derived Calibration, Activation, and Handoff

### Task 10: Exact Owner Registry, Calibration, and Atomic V2 Activation

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutWorkOwnerRegistryV1.ts`
- Create: `fixtures/live-draft-unified-incremental-root-5b2-work-calibration.v1.json`
- Create: `tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts`
- Create: `src/layout/textBlockUnifiedLayoutTransitionContractV2.ts`
- Create: `src/layout/textBlockUnifiedLayoutTransitionV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `src/index.ts`
- Modify: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`
- Modify: `tests/textBlockUnifiedLayoutTextStyleTransitionV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`

**Interfaces:**

- Consumes: every reviewed runtime work owner from Tasks 2-9, factual fixture
  observations, frozen V3 policy, and complete V2 orchestration.
- Produces: exact ordered owner registry, immutable 5B-2 policy/calibration,
  public bootstrap/Attempt V2/Fallback exports, and qualified manifest
  activation with V3 exact.

- [ ] **Step 1: Define the exact ordered registry before calibration**

The registry entries are ordered exactly by this list; each entry also records
owner, ledger, calibration base, and active/inactive reason:

```ts
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_UNIT_IDS_INTERNAL_V1 = Object.freeze([
  "admission-authority-lookups", "source-coverage-nodes", "source-coverage-items",
  "evidence-request-descriptors", "evidence-context-atoms", "evidence-material-descriptors",
  "evidence-response-descriptors", "evidence-glyphs", "evidence-clusters",
  "evidence-breaks", "evidence-guards", "evidence-proof-facts",
  "source-items", "source-tree-lookup-nodes", "source-tree-path-copy-nodes",
  "source-leaf-slots", "source-index-nodes", "source-index-entries",
  "source-index-comparisons", "source-style-nodes", "source-style-buckets",
  "source-style-entries", "flow-nodes", "flow-atoms", "flow-path-copy-nodes",
  "break-lookup-nodes", "break-path-copy-nodes", "break-boundary-entries",
  "break-groups", "break-created-nodes", "line-seed-lookup-nodes",
  "line-tree-lookup-nodes", "line-break-groups", "line-flow-atoms",
  "line-placement-atoms", "line-source-lookup-nodes", "line-source-entries",
  "line-fragments", "line-records", "recomputed-lines",
  "line-cover-proof-nodes", "line-cover-path-nodes", "line-splice-copied-nodes",
  "line-splice-created-nodes", "reconvergence-summary-nodes",
  "geometry-recomputed-lines", "geometry-fragments", "scene-lookup-nodes",
  "scene-path-copy-nodes", "scene-replacement-chunks", "scene-created-nodes",
  "delivery-retain-cover-nodes", "delivery-operations",
  "fallback-previous-logical-items", "fallback-complete-logical-items",
  "fallback-logical-spans", "complete-source-items", "complete-flow-atoms",
  "complete-break-boundaries", "complete-spatial-entries", "complete-lines",
  "complete-scene-chunks", "complete-delivery-operations", "complete-root-registrations",
  "oracle-logical-items", "oracle-break-boundaries", "oracle-lines",
  "oracle-scene-chunks", "oracle-delivery-operations", "oracle-comparisons",
] as const)
```

There is deliberately no T unit. A meta-test maps every runtime evaluator call
to exactly one registry entry and rejects missing, extra, duplicate, or unknown
owners. The final row count is `registry.length`, never a handwritten number.

- [ ] **Step 2: Write failing registry and first-observable meta-tests**

```ts
it("maps every runtime unit to one exact owner and ledger", () => {
  expect(runtimeOwnerAudit()).toEqual({ missing: [], extra: [], duplicate: [] })
})

it.each(activeRegistryRows)("checks $unit before first observation", (row) => {
  expect(runHostileFirstObservation(row, 0)).toEqual({ observed: 0, status: "limit" })
})

it("keeps V3 policy facts byte-for-byte exact", () => {
  expect(canonicalV3PolicyFacts()).toBe(frozenV3PolicyFactsBefore5B2)
})
```

- [ ] **Step 3: Run registry tests and verify RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
```

- [ ] **Step 4: Generate factual calibration with the locked formula**

For each active row, the checked-in fixture matrix records count and exact base
(`sourceItems`, `flowAtoms`, `breakBoundaries`, `lines`, `sceneChunks`, or
`logicalItems`). Derive limits with:

```ts
smallBlockFloor = nextPowerOfTwo(maximumObservedWherePreviousLinesAtMost32)
absoluteStageLimit = nextPowerOfTwo(4 * maximumObservedWork)
relativeNumerator = max(ceil(observedWork / max(1, exactBase)))
relativeStageLimit = previousExactBase * relativeNumerator + 1
effectiveLimit = max(smallBlockFloor, min(absoluteStageLimit, relativeStageLimit))
```

Record semantic contract version, immutable policy version, calibration formula
version, fixture IDs, fixture SHA-256, observed maxima, exact bases, and
limit-minus-one/limit/limit-plus-one separately. Payload estimates and wall
clock are observations only. The exploratory `8,192 / 32,768 / 8:1` values and
the withdrawn `27 / 25 / 2` claim must not appear.

- [ ] **Step 5: Run every threshold triple and scale matrix**

Cover every active registry row plus 1/8/32/33/128/2,048 structures, long
unbreakable and zero-advance-heavy lines, exact E suffix, translation fallback,
forced collisions, three transitions, and fallback-root continuation. Each row
must have positive calibration evidence or an exact inactive reason/version.

- [ ] **Step 6: Expose the version-honest public V2 lane over the private kernel**

```ts
export type VNextTextBlockUnifiedLayoutTransitionInputV2 =
  | {
      readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
      readonly change: VNextTextBlockUnifiedLayoutChangeV1
      readonly evidence: VNextTextBlockTransitionEvidenceV2
      readonly evaluatorOrProofAuthority: object
    }
  | {
      readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
      readonly change: VNextTextBlockUnifiedLayoutChangeV1
      readonly evidence?: never
      readonly evaluatorOrProofAuthority: object
    }
```

`createVNextTextBlockUnifiedLayoutRoot5B2V1(...)` is a narrow public wrapper
over `createVNextTextBlockUnifiedLayoutRoot5B2CompleteInternalV1(...)` with
`constructionKind: "complete-bootstrap"`; it binds the exact active 5B-2
policy internally. Attempt V2 accepts only registered 5B-2 Roots. V3 Roots are
accepted only by Attempt V1; cross-lane attempts reject before no-op. A same-
lane true no-op returns the exact previous Root and creates no new authority.

- [ ] **Step 7: Tighten public exports and qualified manifest**

Export only the 5B-2 bootstrap, closed V2 attempt input/function, reviewed
Evidence V2 producer seam, Fallback V2 request inspector/completion, and public
policy facts required by the manifest. Do not export internal registries,
sidecars, runtime identities, authority maps, candidate builders, collision
factories, calibration factories, or stage helpers.

Manifest capability must say the accepted Root profile explicitly; inline
image, nontrivial Spatial, authored-box mutation, T, empty block, generated
mutation, Worker, Editor, Backend, publication, production, and V1 retirement
remain false.

- [ ] **Step 8: Run Task 10 GREEN and atomic activation gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutTextStyleTransitionV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 9: Commit Task 10 atomically**

```powershell
git add src/layout/textBlockUnifiedLayoutWorkOwnerRegistryV1.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV2.ts src/layout/textBlockUnifiedLayoutTransitionV2.ts src/layout/textBlockUnifiedLayoutRootV2.ts src/index.ts fixtures/live-draft-unified-incremental-root-5b2-work-calibration.v1.json fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutTextStyleTransitionV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
git commit -m "feat(layout): activate phase 5b2 transition policy"
```

### Task 11: Capability Handoff and Full Core Gate

**Files:**

- Modify: `docs/LIVE_DRAFT_MR1_UNIFIED_TEXT_BLOCK_ROOT_5A.md`
- Modify: `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`
- Create: `.superpowers/sdd/2026-08-03-unified-incremental-root-transition-5b-2-rebaseline/final-verification.md` (ignored evidence)
- Create: `.superpowers/sdd/2026-08-03-unified-incremental-root-transition-5b-2-rebaseline/final-review-th.md` (ignored review)

**Interfaces:**

- Consumes: all reviewed Task 2-10 commits, exact manifest, owner registry,
  fixture SHA, focused gates, and current repository state.
- Produces: truthful handoff, final Thai review, full Core verification, and a
  clean committed branch ready for user review without push or merge.

- [ ] **Step 1: Write the exact handoff truth**

Document:

- V3 bootstrap/Attempt V1 versus 5B-2 bootstrap/Attempt V2 compatibility;
- accepted `complete-bootstrap`, `incremental`, and `complete-fallback` previous
  Root kinds;
- image-free/trivial-Spatial/unchanged-auto-height admission;
- ordinary sentinel and structural mutation rejection;
- private Break Topology and conditional Flow/Line alias semantics;
- E/R/N active, T inactive;
- transition-local authority lifecycle;
- exact policy ID/fingerprint, derived owner roster, calibration revision, and
  fixture SHA;
- separate work ledgers;
- object-graph-retention-only lifetime claim; and
- every 5B-3/product/Worker/Editor/Backend capability that remains false.

- [ ] **Step 2: Run the mandatory focused verification matrix**

```powershell
npx vitest run tests/textBlockUnifiedLayoutTrivialAdmissionV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockIncrementalBreakTopologyV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockUnifiedLayoutSpatialAliasV1.test.ts tests/textBlockUnifiedLayoutLineTransitionV1.test.ts tests/textBlockUnifiedLayoutReconvergenceV1.test.ts tests/textBlockUnifiedLayoutDispositionV1.test.ts tests/textBlockUnifiedLayoutGeometryV1.test.ts tests/textBlockUnifiedLayoutTextStyleTransitionV2.test.ts tests/textBlockUnifiedLayoutFallbackV2.test.ts tests/textBlockUnifiedLayoutOracleV2.test.ts tests/textBlockUnifiedLayoutWorkCalibration5b2V1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

Record exact command, exit code, test-file count, test count, duration as an
observation, and failure list in `final-verification.md`.

- [ ] **Step 3: Run the full fresh Core gate**

```powershell
npm run check
git status --short
git diff --check
```

Do not infer success from focused tests. Record the actual full counts and exit
codes. If the worktree includes unexpected files, stop before committing.

- [ ] **Step 4: Perform final capability/authority/work review**

Read the complete diff from the reviewed plan base. The Thai review must report
Critical, Important, and Minor findings and explicitly challenge:

- suffix/tree/Scene/next-input traversal;
- exact identity versus fingerprints;
- first-observable metering and owner registry completeness;
- candidate-independent fallback and oracle imports;
- multi-transition current authority;
- public V3 drift and capability overclaim; and
- generic-framework/design-debt growth.

Resolve every Critical or Important finding and rerun affected focused tests,
type-check, and the full Core gate.

- [ ] **Step 5: Commit the handoff only after fresh verification**

```powershell
git add docs/LIVE_DRAFT_MR1_UNIFIED_TEXT_BLOCK_ROOT_5A.md fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json
git commit -m "docs: hand off phase 5b2 transition closure"
git show --check --stat --oneline HEAD
git status --short
```

Do not push or merge. Stop for user review. Do not begin 5B-3.

## Plan Self-Review Map

| Design Correction requirement | Implementing task/gate |
| --- | --- |
| Frozen V3 bootstrap/Attempt V1; separate 5B-2 bootstrap/Attempt V2 | Task 10 |
| Image-free, trivial-Spatial, unchanged auto-height admission | Task 2 |
| Ordinary sentinel and structural-range rejection | Task 2 |
| Exact Evidence V2 and first-observable producer work | Task 3 |
| Bounded persistent Source index/style sidecars | Task 4 |
| Conditional Flow alias and metadata path-copy | Task 5 |
| Private persistent relative Break Topology | Task 5 |
| Exact next-Source trivial-Spatial alias | Task 5 |
| Linear/amortized-linear one-line work | Task 6 |
| Boundary-path splice without flatten/full rebuild | Task 6 |
| Exact reconvergence and canonical maximal cover | Task 7 |
| E/R/N active; T empty; translation suffix fallback | Task 7 |
| Final Line binding and refreshed sidecars | Task 8 |
| E/R/N Scene/Delivery and atomic Root | Task 9A |
| Candidate-independent two-step Fallback V2 | Task 9B |
| Independent complete oracle | Task 9B |
| Exact owner registry and fixture-derived limits | Task 10 |
| Three transitions, fallback-root continuation, 2,048 sentinels | Tasks 5, 7, 9B, 10, 11 |
| Qualified manifest, frozen ownership map, lifetime claim | Task 11 |

Implementation is not authorized by this plan commit. After the plan is
written, self-reviewed, and committed, the user must review and explicitly
approve this replacement plan before Task 2 begins.
