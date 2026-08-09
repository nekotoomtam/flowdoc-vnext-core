# Unified Incremental Root Transition 5B-2 Plan A Source Authority Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock the complete private 5B-2 work-owner topology, introduce exact
pre-activation policy/candidate-work authority, and replace the Source
history/style-clone seams with bounded persistent physical-index and
style-refcount sidecars plus full Source-stage authority.

**Architecture:** Keep public Root V2, Transition V1, Candidate Work V1, and
the frozen `5b-1-v3` policy byte-for-byte exact. A private 80-row composition
and process-local work authority sit beside the public compatibility work
object. The existing proven Source range splice remains the Source-tree owner;
new task-specific persistent sidecars use exact safe-integer position keys and
are bound into one full Source-stage authority without entering canonical
fingerprints or public JSON.

**Tech Stack:** TypeScript 6 strict ESM, Vitest 4, immutable frozen objects,
process-local `WeakMap`/`WeakSet` authority, task-specific fixed-eight-way B+
structures, canonical JSON fingerprints as integrity facts only.

## Global Constraints

- Exact implementation baseline is commit
  `10cd962e0beb86b8533c6af4b7b75a8b64a113d7`.
- Normative design is
  `docs/superpowers/specs/2026-08-09-unified-incremental-root-transition-5b2-continuation-rebaseline-design.md`.
- Core-only and process-local; Editor and Backend repositories remain
  unchanged.
- Root V2 and Persistent Scene V2 remain the active structural lane; Root
  V1/Scene V1 remain frozen compatibility/QA evidence.
- Do not modify `src/index.ts` or expose the owner registry, policy composer,
  meters, sidecars, authority registries, test factories, or inspectors.
- Do not widen or reinterpret public Transition V1, Candidate Work V1, Source
  State V1 canonical facts, Source State V1 policy fingerprint, Root semantic
  identity, or the frozen `5b-1-v3` roster/fingerprint.
- The accepted 5B-2A Evidence slice is exactly fifteen rows and its producer,
  acceptance, post-begin work-limit, and terminal-consumption semantics remain
  exact.
- The only work ledgers are `incrementalCandidateWork`,
  `completeFallbackWork`, and `completeOracleWork`; a complete-kernel receipt
  is not a fourth ledger.
- Private granular receipts never validate themselves from detached public
  `stageWork`.
- Every charge occurs before the first payload read, comparison, key read,
  entry read/emission, bucket read, node visit, or node creation it owns.
- No complete next input, Source suffix, Source tree, Scene, or oracle traversal
  may enter an accepted incremental path.
- No wall clock or payload estimate selects an execution path.
- Partial Source, sidecar, candidate-work, or authority objects never enter
  fallback.
- **Approved Task 3/Task 6 ownership amendment (2026-08-09):** Task 3 owns
  foundation/Evidence candidate-work publication and must fail closed when
  `source-items` is nonzero. Task 6 owns the first nonzero Source publication
  and may modify the candidate-work authority module and its focused test to
  bind publication to the exact one-shot Source commit ticket. No forward or
  generic producing-stage registry is introduced in Task 3.
- **Approved Task 5 Source-candidate amendment (2026-08-09):** Task 5 may
  extend the existing private Source path-copy candidate record with exact
  frozen `removedItems` and `nextPhysicalItems`. `nextPhysicalItems` is the
  exact frozen form of the existing local `createdItems` sequence; it is not a
  rename or reuse of `nextLeafItems`, which also contains retained items. No
  separate candidate registry or caller-reconstructed array is introduced.
- **Approved Task 5 meter-binding amendment (2026-08-09):** the existing
  Source replacement authority and prepared Source candidate record carry the
  exact public `change` object registered by preflight. CandidateWorkAuthority
  exposes one read-only boolean matcher that accepts only an eligible exact
  meter whose seed is bound by `===` to the supplied Root/change/composition.
  The Source-sidecar coordinator derives Root/composition from the exact
  previous-sidecar registration, obtains change from the exact Source
  candidate authority, and validates this tuple before its first payload
  observation. The matcher exposes no seed, candidate work, receipt, resolver,
  forward owner, or generic registry.
- Position keys are signed safe integers, process-local only, and excluded from
  Source/Root/Scene canonical identity and public JSON.
- `source-position-key-space-exhausted` is an exact candidate-free structural
  cause, never relabeled as a work limit.
- Mandatory text/style/resolved-field families do not become
  `planned-complete` because implementation is difficult or a block is large.
- No generic tree, registry, authority, work-meter, identity, or transport
  framework is introduced.
- Every implementation task uses RED → focused GREEN → type-check/diff hygiene
  → one scoped commit → fresh task review.
- Do not push, merge, pop/apply/drop the diagnostic stash, or start Plan B.

---

## File responsibility map

### New production-internal files

- `src/layout/textBlockUnifiedLayoutWorkOwnerRegistryV1.ts` — closed 80-row
  reserved catalog, exact task-owned slices, metadata, and no runtime meters.
- `src/layout/textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.ts` —
  exact registered Plan A test compositions, activation/inactive facts,
  limits, and Root-to-composition binding.
- `src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts` —
  process-local begin/complete work permits, ordered receipts, compatibility
  aggregate checks, and exact candidate-work authority.
- `src/layout/textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.ts` —
  task-specific identity/order roots, Source-position allocation, bounded
  lookup, and persistent path copy.
- `src/layout/textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.ts` —
  task-specific style-key/collision-bucket/refcount persistent tree.
- `src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts` — complete
  sidecar construction, incremental coordination, exact sidecar registry, and
  Source candidate binding. It does not implement either tree kernel itself.

### New tests

- `tests/textBlockUnifiedLayoutWorkOwnerRegistryV1.test.ts`
- `tests/textBlockUnifiedLayoutWorkPolicyCompositionV1.test.ts`
- `tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts`
- `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`

### Existing files changed only at their owned seams

- `src/layout/textBlockUnifiedLayoutTrivialAdmissionInternalsV1.ts` — split
  exact membership lookup from post-charge admission payload resolution.
- `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts` — register
  foundation/preflight receipts and exact no-Evidence candidate authority.
- `src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts` — attach the
  already-reviewed fifteen-row terminal/acceptance receipt to candidate-work
  authority without changing Evidence output.
- `src/layout/textBlockUnifiedLayoutSourceStateV1.ts` — delegate 5B-2 physical
  lookup/style resolution to sidecars, retain Source-tree splice, and remove
  5B-2 `range-delta`/whole-style-clone ownership.
- `src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts` — bind the
  full Source-stage tuple while retaining narrow downstream compatibility
  inspectors.
- `src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts` — use the
  private meter/sidecars and publish exact Source-stage authority.
- `tests/helpers/textBlockUnifiedIncremental5b2.ts` — explicit Plan A root and
  Source fixtures; existing 5B-2A fixture semantics stay available.
- `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`
- `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- `tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts`
- `tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts`
- `tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts`
- `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`
- `tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts`
- `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`

### Explicitly unchanged

- `src/index.ts`
- `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- `src/layout/textBlockUnifiedLayoutSourceStateContractV1.ts`
- `src/layout/textBlockUnifiedLayoutRootContractV2.ts`
- `src/layout/textBlockUnifiedLayoutRootV2.ts`
- `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`
- Editor and Backend repositories

## Execution checkpoints

- **Plan A-1 — Owner and Work Authority Foundation:** Tasks 1-3. Exit only
  after the exact 80-row topology, private policy composition, candidate-work
  permits, and accepted 5B-2A regression gate pass review.
- **Plan A-2 — Persistent Source Sidecars:** Tasks 4-5. Exit only after complete
  and incremental position/style roots, threshold triples, collision rows, and
  zero retained-suffix rewrite pass review.
- **Plan A-3 — Full Source Authority Closure:** Tasks 6-7. Exit only after the
  full Source tuple, three-state Source checkpoint chain, complete Plan A/Core
  gates, independent review, and Thai report pass.

Every task still receives its own scoped review. A checkpoint review covers
the combined committed tasks and may send a bounded finding back to its owning
task.

## Task 1: Lock the complete private 80-row work-owner topology

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutWorkOwnerRegistryV1.ts`
- Create: `tests/textBlockUnifiedLayoutWorkOwnerRegistryV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts`
- Test: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`

**Interfaces:**

- Consumes: the exact three foundation rows, exact accepted fifteen Evidence
  rows, and the 62 Plan A-D rows in umbrella-design Section 9.
- Produces:

```ts
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_UNIT_IDS_INTERNAL_V1 =
  Object.freeze([
    "admission-authority-lookups",
    "source-coverage-nodes",
    "source-coverage-items",
    "evidence-request-descriptors",
    "evidence-context-atoms",
    "evidence-material-descriptors",
    "evidence-producer-descriptors",
    "evidence-runtime-invocations",
    "evidence-runtime-input-scalars",
    "evidence-glyphs",
    "evidence-clusters",
    "evidence-breaks",
    "evidence-guards",
    "evidence-proof-facts",
    "evidence-response-facts",
    "evidence-acceptance-descriptors",
    "evidence-acceptance-comparisons",
    "evidence-acceptance-registrations",
    "source-items",
    "source-tree-lookup-nodes",
    "source-tree-path-copy-nodes",
    "source-leaf-slots",
    "source-index-nodes",
    "source-index-entries",
    "source-index-comparisons",
    "source-style-nodes",
    "source-style-buckets",
    "source-style-entries",
    "flow-nodes",
    "flow-atoms",
    "flow-path-copy-nodes",
    "break-lookup-nodes",
    "break-path-copy-nodes",
    "break-boundary-entries",
    "break-groups",
    "break-created-nodes",
    "spatial-alias-authority-lookups",
    "spatial-alias-registrations",
    "line-seed-lookup-nodes",
    "line-tree-lookup-nodes",
    "line-break-groups",
    "line-flow-atoms",
    "line-placement-atoms",
    "line-source-lookup-nodes",
    "line-source-entries",
    "line-fragments",
    "line-records",
    "recomputed-lines",
    "line-cover-proof-nodes",
    "line-cover-path-nodes",
    "line-splice-copied-nodes",
    "line-splice-created-nodes",
    "reconvergence-summary-nodes",
    "geometry-recomputed-lines",
    "geometry-fragments",
    "scene-lookup-nodes",
    "scene-path-copy-nodes",
    "scene-replacement-chunks",
    "scene-created-nodes",
    "delivery-retain-cover-nodes",
    "delivery-operations",
    "atomic-root-authority-lookups",
    "atomic-root-registrations",
    "fallback-previous-logical-items",
    "fallback-complete-logical-items",
    "fallback-logical-spans",
    "complete-source-items",
    "complete-flow-atoms",
    "complete-break-boundaries",
    "complete-spatial-entries",
    "complete-lines",
    "complete-scene-chunks",
    "complete-delivery-operations",
    "complete-root-registrations",
    "oracle-logical-items",
    "oracle-break-boundaries",
    "oracle-lines",
    "oracle-scene-chunks",
    "oracle-delivery-operations",
    "oracle-comparisons",
  ] as const)

export type VNextTextBlockUnifiedLayout5B2WorkUnitInternalV1 =
  typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_UNIT_IDS_INTERNAL_V1[number]

export type VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1 =
  | "source-items"
  | "source-tree-lookup-nodes"
  | "source-tree-path-copy-nodes"
  | "source-leaf-slots"
  | "source-index-nodes"
  | "source-index-entries"
  | "source-index-comparisons"
  | "source-style-nodes"
  | "source-style-buckets"
  | "source-style-entries"

export interface VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1 {
  readonly unit: VNextTextBlockUnifiedLayout5B2WorkUnitInternalV1
  readonly owner:
    | "core-admission" | "core-preflight" | "core-materialization"
    | "producer" | "core-acceptance" | "source-tree"
    | "source-index" | "source-style" | "plan-b-flow"
    | "plan-b-break" | "plan-b-spatial" | "plan-c-line"
    | "plan-c-reconvergence" | "plan-c-geometry" | "plan-d-scene"
    | "plan-d-delivery" | "plan-d-root" | "plan-d-fallback"
    | "plan-d-complete" | "plan-d-oracle"
  readonly stage:
    | "admission" | "preflight" | "evidence" | "source" | "flow"
    | "break" | "spatial" | "line" | "reconvergence" | "geometry"
    | "scene" | "delivery" | "atomic-root" | "fallback"
    | "complete" | "oracle"
  readonly ledger:
    | "incrementalCandidateWork"
    | "completeFallbackWork"
    | "completeOracleWork"
  readonly exactBase:
    | "sourceItems" | "flowAtoms" | "breakBoundaries" | "lines"
    | "sceneChunks" | "logicalItems" | "registrations"
  readonly firstObservableBoundary:
    `before-${VNextTextBlockUnifiedLayout5B2WorkUnitInternalV1}`
  readonly activationPlan: "foundation" | "A" | "B" | "C" | "D"
}
```

The module exposes the exact frozen slice objects and one final concatenation:

```ts
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_FOUNDATION_OWNER_ROWS_INTERNAL_V1
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_EVIDENCE_OWNER_ROWS_INTERNAL_V1
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_SOURCE_OWNER_ROWS_INTERNAL_V1
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_B_OWNER_ROWS_INTERNAL_V1
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_C_OWNER_ROWS_INTERNAL_V1
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_D_OWNER_ROWS_INTERNAL_V1
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1
```

- [ ] **Step 1: Write the owner-roster RED test**

Use an independent literal of the exact 80 IDs from umbrella-design Section 9.
Do not import a production helper to produce the expected list.

```ts
it("locks the exact ordered 80-row 5B-2 owner topology", () => {
  expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1)
    .toHaveLength(80)
  expect(rows.map((row) => row.unit)).toEqual(EXPECTED_80_UNITS)
  expect(new Set(rows.map((row) => row.unit)).size).toBe(80)
  expect(rows.map((row) => row.firstObservableBoundary))
    .toEqual(EXPECTED_80_UNITS.map((unit) => `before-${unit}`))
})
```

The same test asserts exact slice lengths `3 / 15 / 10 / 10 / 17 / 25`, the
three allowed ledger values, exact activation plan, owner, stage, and base for
every row. Group bases as follows:

- admission, preflight, Evidence, and Source rows: `sourceItems`;
- Flow rows: `flowAtoms`;
- Break rows: `breakBoundaries`;
- Spatial-alias and atomic-Root rows: `registrations`;
- Line seed/tree/record/splice/reconvergence/geometry rows: `lines`;
- Line Flow/placement rows: `flowAtoms`;
- Line Source lookup/entry rows: `sourceItems`;
- Scene and Delivery rows: `sceneChunks`;
- fallback and logical-oracle rows: `logicalItems`;
- complete/oracle family rows use their matching Source/Flow/Break/Line/Scene
  base, with delivery `sceneChunks` and Root `registrations`.

- [ ] **Step 2: Run the owner-roster RED test**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutWorkOwnerRegistryV1.test.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts
```

Expected: FAIL because the complete registry module does not exist. The
existing Evidence registry test remains GREEN independently.

- [ ] **Step 3: Implement the closed slices and exact concatenation**

Import and enrich the accepted Evidence rows; do not rename or recreate its
fifteen unit IDs. Construct every other row with a local helper that freezes
the row and sets `firstObservableBoundary` to the exact template literal.

```ts
const row = <U extends VNextTextBlockUnifiedLayout5B2WorkUnitInternalV1>(
  input: Omit<VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1,
    "unit" | "firstObservableBoundary"> & { readonly unit: U },
) => Object.freeze({
  ...input,
  firstObservableBoundary: `before-${input.unit}` as const,
})
```

At module initialization, throw on any duplicate unit, unknown ledger, empty
slice, row/ID length mismatch, or row order differing from
`VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_UNIT_IDS_INTERNAL_V1`. Do not
hardcode 80 as a runtime policy fact; the test owns the expected design count.

- [ ] **Step 4: Prove the old Evidence and frozen V3 surfaces did not drift**

Add assertions that the Evidence slice uses the exact imported unit order and
that:

```ts
expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages)
  .toHaveLength(21)
expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.fingerprint).toBe(
  "sha256:896f2163367070bd1f1e6fa0d9b34c0f47e371e6256cc9c15bd27e898c185982",
)
```

- [ ] **Step 5: Run Task 1 GREEN and hygiene**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutWorkOwnerRegistryV1.test.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
npm run type-check
git diff --check
```

Expected: all pass; `src/index.ts` has no diff.

- [ ] **Step 6: Commit Task 1**

```powershell
git add src/layout/textBlockUnifiedLayoutWorkOwnerRegistryV1.ts tests/textBlockUnifiedLayoutWorkOwnerRegistryV1.test.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts
git commit -m "feat(layout): lock phase 5b2 work owner topology"
```

Stop for a task-scoped review. Do not start Task 2 with a duplicate/missing row
or an open Critical/Important finding.

## Task 2: Add exact private Plan A policy composition

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutWorkPolicyCompositionV1.test.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`
- Test: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`
- Test: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`

**Interfaces:**

- Consumes: the exact six frozen slice identities from Task 1 and an exact
  registered public Root work-policy object.
- Produces:

```ts
export interface VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1 {
  readonly sourceItems: number
  readonly sourceTreeLookupNodes: number
  readonly sourceTreePathCopyNodes: number
  readonly sourceLeafSlots: number
  readonly sourceIndexNodes: number
  readonly sourceIndexEntries: number
  readonly sourceIndexComparisons: number
  readonly sourceStyleNodes: number
  readonly sourceStyleBuckets: number
  readonly sourceStyleEntries: number
}

export interface VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1 {
  readonly source: "vnext-text-block-unified-layout-5b2-policy-composition-internal-v1"
  readonly contractVersion: 1
  readonly semanticContractVersion: 1
  readonly policyCompositionVersion: 1
  readonly fixtureCalibrationRevision: 0
  readonly publicWorkPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly rows: readonly VNextTextBlockUnifiedLayout5B2PolicyRowInternalV1[]
  readonly fingerprint: string
}

export function createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1(
  input: {
    readonly publicWorkPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
    readonly sourceLimits:
      VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1
  },
): VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1

export function registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
  input: {
    readonly root: VNextTextBlockUnifiedLayoutRootV2
    readonly composition:
      VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  },
): boolean

export function resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1 | null
```

Rows use exactly three states:

- foundation/Evidence: `accepted-foundation`, bound to existing exact
  authority and not recalibrated;
- the ten Source rows: `test-active`, each with the exact finite nonnegative
  test limit supplied to the private factory; and
- Plans B-D: `inactive`, with exact reason
  `reserved-until-plan-B-v1`, `reserved-until-plan-C-v1`, or
  `reserved-until-plan-D-v1`.

There is no production `5b-2-v1` policy, manifest change, or calibration claim
in Plan A. Plan E owns final factual calibration.

- [ ] **Step 1: Write policy identity/composition RED tests**

```ts
it("composes exact slices without changing frozen public policy identity", () => {
  const composition = planAPolicy({ sourceIndexComparisons: 3 })
  expect(composition.publicWorkPolicy).toBe(FIVE_B2_TEST_POLICY)
  expect(composition.rows.map((row) => row.ownerRow))
    .toEqual(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1)
  expect(composition.rows.filter((row) => row.execution.kind === "test-active"))
    .toHaveLength(10)
  expect(FIVE_B2_TEST_POLICY.fingerprint).toBe(PRE_TASK_FINGERPRINT)
})

it("rejects clones, reordered slices, unknown limits, and cross-Root binding", () => {
  expect(resolve(cloneRoot(root))).toBeNull()
  expect(register({ root, composition: structuredClone(composition) }))
    .toBe(false)
})
```

Also cover negative/unsafe/fractional limits, inherited fields, own accessors,
missing/extra Source limit keys, duplicate Root registration, and exact
composition fingerprint determinism.

- [ ] **Step 2: Run Task 2 RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutWorkPolicyCompositionV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
```

Expected: FAIL because the private composition and Root binding do not exist.

- [ ] **Step 3: Implement exact registered composition**

Capture own data properties once, validate the exact ten-key limit record, and
create all 80 policy rows in owner order. The factory registers only the exact
returned object in a `WeakSet`; a structurally equal clone is invalid. The
Root binding requires:

```ts
root.workPolicy === composition.publicWorkPolicy
&& exactCompositions.has(composition)
&& inspectVNextTextBlockUnifiedLayoutRootBindingInternalV2(root).status
   === "valid"
```

Do not add the composition or its fingerprint to Root canonical facts.

- [ ] **Step 4: Add an explicit Plan A root fixture without changing old helpers**

Add:

```ts
export function admitted5B2PlanARootFixture(input: {
  readonly sourceLimits?: Partial<
    VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1
  >
  readonly text?: string
} = {}): {
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly composition:
    VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
}
```

The helper fills omitted test limits with `Number.MAX_SAFE_INTEGER`, creates an
exact registered composition, registers it to the exact already-registered
5B-2 Root, and throws if either registration fails. This value is test-only;
it is never a production limit or execution recommendation.

- [ ] **Step 5: Prove public and frozen boundaries remain exact**

Assert the new filenames/symbols are absent from `src/index.ts`, the old 5B-1
manifest is byte-identical, V3 remains 21 rows with its exact fingerprint, and
the existing 5B-2A helper functions still return their prior public objects.

- [ ] **Step 6: Run Task 2 GREEN and hygiene**

```powershell
npx vitest run tests/textBlockUnifiedLayoutWorkPolicyCompositionV1.test.ts tests/textBlockUnifiedLayoutWorkOwnerRegistryV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 7: Commit Task 2**

```powershell
git add src/layout/textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.ts tests/textBlockUnifiedLayoutWorkPolicyCompositionV1.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "feat(layout): compose private phase 5b2 plan a policy"
```

Stop for task review. A detached ceiling, caller-controlled runtime limit, or
public/frozen identity drift blocks Plan A.

## Task 3: Introduce candidate-work permits and bind accepted foundation work

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTrivialAdmissionInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts`

**Interfaces:**

- Consumes: exact Root-bound composition from Task 2, exact admission,
  preflight, Producer terminal, and Evidence acceptance owner records.
- Produces one private ordered factual ledger and exact authority beside the
  unchanged public `VNextTextBlockIncrementalCandidateWorkV1`.

```ts
export interface VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1 {
  readonly ownerRow:
    VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1
  readonly attemptedWork: number
  readonly completedWork: number
}

export interface VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1 {
  readonly __candidateWorkAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1 {
  readonly __workPermitOpaque: never
}

export interface VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1 {
  readonly __candidateWorkMeterOpaque: never
}

export interface VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityRecordInternalV1 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly composition:
    VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly receipts:
    readonly VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1[]
  readonly producingStageAuthority: object
}

export function registerVNextTextBlockUnifiedLayout5B2FoundationCandidateWorkInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly composition:
      VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly receipts:
      readonly VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1[]
    readonly producingStageAuthority: object
  },
): VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1 | null

export function openVNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly composition:
      VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly candidateWorkAuthority:
      VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  },
): VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1 | null

export function beginVNextTextBlockUnifiedLayout5B2OperationInternalV1(input: {
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1
}):
  | { readonly status: "permitted"; readonly permit:
      VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1 }
  | { readonly status: "limit-exceeded"; readonly evaluatorAuthority: object }
  | { readonly status: "blocked" }

export function completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
  permit: VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1,
): boolean

export function projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): VNextTextBlockIncrementalCandidateWorkV1 | null

export function publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1(
  input: {
    readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly producingStageAuthority: object
  },
): VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1 | null

export function resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly composition:
      VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly candidateWork: VNextTextBlockIncrementalCandidateWorkV1
  },
): VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityRecordInternalV1 | null

export function inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): readonly VNextTextBlockUnifiedLayout5B2WorkReceiptInternalV1[] | null
```

The private ledger always has 80 rows in exact owner order. Inactive rows and
unattempted accepted-foundation rows remain `0 / 0`. An operation changes
`attemptedWork` at `begin`; it changes `completedWork` only after the exact
permit completes. An open permit blocks publication.

- [ ] **Step 1: Write the candidate-authority RED matrix**

Cover exact acceptance, clone/stale/replay/cross-Root/cross-change/
cross-composition rejection, attempted-versus-completed behavior, one-shot
permit completion, open-permit publication block, inactive-unit block, zero
limit before observation, and equal-fingerprint object rejection.

```ts
it("records attempted work before a throwing first observation", () => {
  const begun = begin({ meter, unit: "source-index-entries" })
  expect(begun.status).toBe("permitted")
  expect(() => hostileEntry.value).toThrow("observed")
  expect(inspect(meter, "source-index-entries"))
    .toMatchObject({ attemptedWork: 1, completedWork: 0 })
  expect(publish(meter)).toBeNull()
})

it("rejects detached stageWork even when all values match", () => {
  const clonedWork = deepClone(candidateWork)
  expect(resolveCandidateAuthority({ candidateWork: clonedWork, authority }))
    .toBeNull()
})
```

- [ ] **Step 2: Run the candidate-authority RED test**

```powershell
npx vitest run tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts
```

Expected: FAIL because no private receipt/permit authority exists.

- [ ] **Step 3: Implement exact meter and authority records**

Use private `WeakMap`s for meter, permit, evaluator, and candidate-authority
records. The meter resolves the exact Source row from its exact registered
composition before returning a permit. It must not accept a caller-supplied
row, detached ceiling, fingerprint, base, or stage name.

The foundation `receipts` parameter is comparison material, not authority.
The registrar must resolve the exact `producingStageAuthority` through its
owner registry, independently reconstruct the expected owner rows/counts, and
store newly frozen Core-owned receipt records. Structural receipt equality
alone never authorizes registration: a missing/wrong terminal authority or a
receipt not supported by that exact owner record is rejected.

Publication verifies compatibility aggregates independently:

```text
source-tree-lookup-nodes     == nextCandidateWork.flow.visitedSourceLookupNodeCount
source-tree-path-copy-nodes  == nextCandidateWork.flow.copiedSourcePathNodeCount
source-leaf-slots            == nextCandidateWork.flow.visitedChangedSourceLeafItemCount
```

Task 3 publication accepts only `source-items.completedWork === 0` and the
exact foundation/Evidence `producingStageAuthority`. Any nonzero Source item
count fails closed without publishing authority. Task 6 extends this same
module at the approved seam and checks nonzero `source-items` against the exact
emission count stored in the one-shot Source commit ticket. Index/style rows
have no public aggregate and are validated only from completed Core-owned
permits. Never derive private receipts by rereading
`nextCandidateWork.stageWork`.

The compatibility projector reads only the meter record and its exact seed
candidate. It updates the four existing public Source aggregates/legacy rows
from completed private receipts. It does not register authority. Every blocked
or fallback-required Source exit calls it so factual completed Source work is
retained while attempted/completed distinctions remain in the private
evaluator/proof record.

Projection caching is meter-revision-bound. Every successful permit completion
increments the meter revision and invalidates any earlier projected object. A
projection taken while another permit is open may report the factual completed
work at that moment, but after the permit completes the next projection must be
a newly frozen object with the new completed count. Publication remains blocked
while any permit is open.

- [ ] **Step 4: Split admission membership from admission payload read**

Add a membership-only seam:

```ts
export function hasVNextTextBlockUnifiedLayoutTrivialAdmissionRegistrationInternalV1(
  root: VNextTextBlockUnifiedLayoutRootV2,
): boolean
```

`WeakMap.has(root)` may precede charging. Preflight must charge
`admission-authority-lookups` before calling the existing resolver that reads
and compares Source/Spatial/authored-box/work-policy payload.

- [ ] **Step 5: Meter Source coverage nodes and item slots separately**

Change the private coverage visitor callback from a node-only callback to:

```ts
readonly beforeVisit: (
  unit: "source-coverage-nodes" | "source-coverage-items",
) => VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1 | null
readonly completeVisit: (
  permit: VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1,
) => boolean
```

Charge node access before reading node kind/summary/children. Charge an item
slot before reading `leaf.items[index]`. A thrown getter leaves the exact
receipt attempted but incomplete and produces no preflight candidate.

- [ ] **Step 6: Register no-Evidence and accepted-Evidence work from owner facts**

For a `not-required` preflight, register the candidate-work authority only
after the exact preflight tuple is stored; use the exact preflight authority as
`producingStageAuthority`.

For required Evidence, register/advance only after successful Evidence
registration. Build the fifteen Evidence receipts from
`AuthorityRecordSnapshotV2.completedWork` and the exact acceptance meter
counts already owned inside `textBlockUnifiedLayoutTransitionEvidenceV2.ts`.
Do not reconstruct them from `acceptedWork.stageWork`.

If candidate-authority registration fails, return the existing blocked result
with factual public work and no Evidence authority. Do not change successful
Evidence, request, response, producer-failure, or fallback object shapes.

- [ ] **Step 7: Run focused GREEN and the accepted 5B-2A regression gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
npm run type-check
git diff --check
```

Expected: all pass; accepted Evidence objects remain byte-identical in the
existing exact fixtures.

- [ ] **Step 8: Commit Task 3**

```powershell
git add src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts src/layout/textBlockUnifiedLayoutTrivialAdmissionInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts
git commit -m "feat(layout): bind phase 5b2 candidate work authority"
```

Run a fresh 5B-2A task review. Any changed Producer invocation count, terminal
outcome, Evidence payload, post-begin work-limit result, or recursive retained
Root traversal is a stop condition.

## Task 4: Build complete process-local Source sidecars

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`
- Test: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- Test: `tests/textBlockUnifiedLayoutRootV2.test.ts`

**Interfaces:**

- Consumes: one exact complete Source State V1, exact registered Plan A
  composition, and Source items in canonical Source order.
- Produces private identity/order/style roots, one complete receipt, and exact
  Source-sidecar authority. It does not mutate Source State V1 or Root V2.

```ts
export type VNextTextBlockSourcePositionKeyInternalV1 = number

export const VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1 =
  Object.freeze({
    version: 1 as const,
    initialStride: 4_294_967_296 as const,
    representation: "signed-safe-integer" as const,
    batchAllocation: "canonical-even-interior" as const,
  })

export interface VNextTextBlockUnifiedLayoutSourcePhysicalEntryInternalV1 {
  readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
  readonly positionKey: VNextTextBlockSourcePositionKeyInternalV1
  readonly renderedUtf16Length: number
}

export interface VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1 {
  readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly positionPolicy:
    typeof VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1
  readonly identityRoot:
    VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1 | null
  readonly orderRoot:
    VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1 | null
  readonly styleRoot:
    VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 | null
  readonly fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1 {
  readonly __sourceSidecarCandidateAuthorityOpaque: never
}

export function prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly observeBeforeOperation?: (
      unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
    ) => void
  },
):
  | { readonly status: "prepared"; readonly sidecars:
      VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1;
      readonly completeReceipt:
        VNextTextBlockUnifiedLayoutSourceSidecarCompleteReceiptInternalV1;
      readonly candidateAuthority:
        VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1 }
  | { readonly status: "blocked"; readonly sidecars: null;
      readonly completeReceipt:
        VNextTextBlockUnifiedLayoutSourceSidecarCompleteReceiptInternalV1 }

export function registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1(
  input: {
    readonly root: VNextTextBlockUnifiedLayoutRootV2
    readonly composition:
      VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly candidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
  },
): boolean

export function resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly composition:
      VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  },
): VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1 | null
```

The complete receipt is private construction evidence, not an
`incrementalCandidateWork` row and not a fourth ledger.

- [ ] **Step 1: Write complete-sidecar RED tests**

Cover 1/8/9/32/33/128 Source entries, exact root/leaf bounds, same output from
two independent complete builds, exact position-key formula, duplicate text
`inlineId`, duplicate atomic `inlineId` rejection, exact style refcounts,
style digest collision buckets, empty structural construction without an
empty-block capability claim, and clone/cross-Root/cross-composition rejection.

```ts
it("assigns exact centered complete position keys", () => {
  const sidecars = completeSidecars(sourceWithItems(4))
  expect(inspectOrderEntries(sidecars).map((entry) => entry.positionKey))
    .toEqual([
      -6_442_450_944,
      -2_147_483_648,
      2_147_483_648,
      6_442_450_944,
    ])
})

it("keeps same-inline text fragments distinct and atomic ids unique", () => {
  expect(lookupAll(sidecars, "text-inline")).toHaveLength(2)
  expect(prepareComplete(sourceWithDuplicateResolvedFieldId()).status)
    .toBe("blocked")
})
```

Independent tests calculate the keys directly from the design formula; they
must not import the production allocator.

- [ ] **Step 2: Run Task 4 RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts
```

Expected: FAIL because no complete sidecar roots/authority exist.

- [ ] **Step 3: Implement the Source-position allocator and physical roots**

Use the exact formula from the umbrella design for complete keys. Use private
`bigint` only for constant-count arithmetic and convert only after
`Number.isSafeInteger` succeeds.

Before the first complete Source item read, evaluate both endpoint keys from
`sourceState.summary.itemCount` with exact `bigint` arithmetic. An unsafe
endpoint blocks complete sidecar preparation with zero item observations; it
does not reduce the stride or switch representation.

The physical index owns two fixed-eight-way structures:

- identity leaves ordered by `(inlineId, kindOrdinal, positionKey)` and
  pointing to the exact physical entry;
- order leaves ordered by `positionKey`, with subtree `itemCount` and
  `renderedUtf16Length` summaries.

Complete construction inserts entries in Source order one at a time. Do not
call `Array.prototype.sort` over all Source items. Identity insertion compares
bounded keys; order insertion receives already monotonic keys. Leaves have at
most eight entries and branches at most eight children. Use the Source
canonical `9 -> 4/5` rule only; do not extract a generic B+ kernel.

- [ ] **Step 4: Implement the style refcount root**

Compute one style integrity fingerprint from exact canonical style facts. The
tree is ordered by `(measurementStyleKey, effectiveShapingStyleKey,
styleFingerprint)`. One leaf entry owns a bounded collision bucket ordered by
exact canonical style facts; equal digests require exact canonical-fact
comparison. Each bucket item stores the exact frozen style and a positive safe
integer refcount. Bucket insertion compares/emits one item at a time and never
sorts a complete registry.

Insert Source styles one item at a time; do not materialize a whole `Map` and
sort/clone it. Hard breaks and inline images create no style entry.

- [ ] **Step 5: Implement exact complete sidecar registration**

The candidate authority binds exact Source, all three roots, position policy,
complete receipt, and sidecar fingerprint. Registration additionally requires
the exact committed Root whose `root.sourceState === sidecars.sourceState` and
the exact Root-bound Plan A composition. Register by exact Source and
composition identity; reject a second or foreign registration.

Fingerprints are recomputed integrity facts at preparation time but never
authorize a clone.

- [ ] **Step 6: Extend only the explicit Plan A test fixture**

After `admitted5B2PlanARootFixture` has a committed Root and exact composition,
prepare and register complete sidecars. Return the exact sidecars in the helper
result for focused tests. Do not make `admitted5B2RootFixture` or any 5B-1
builder create 5B-2-only sidecars.

- [ ] **Step 7: Prove frozen/canonical non-drift**

For the same complete build input, assert before/after task equality for:

- Source State V1 policy fingerprint;
- Source State V1 canonical fingerprint;
- Root semantic/composite fingerprints;
- Root/Source public JSON;
- `5b-1-v3` policy fingerprint; and
- public export keys.

- [ ] **Step 8: Run Task 4 GREEN and hygiene**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutWorkPolicyCompositionV1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 9: Commit Task 4**

```powershell
git add src/layout/textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "feat(layout): build private phase 5b2 source sidecars"
```

Stop for task review. Building sidecars from any public/5B-1 bootstrap,
allowing absolute offsets as retained authority, or treating a fingerprint as
sidecar authority blocks Plan A.

## Task 5: Path-copy Source physical-index and style-refcount sidecars

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts`
- Test: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`

**Interfaces:**

- Consumes: exact previous sidecars, exact Source replacement authority, exact
  prepared next Source-tree candidate record, and one exact open candidate-work
  meter.
- Produces an unregistered next sidecar candidate with exact retained objects,
  bounded receipts, and candidate-free structural exhaustion.

Task 5 first extends the existing private candidate record in
`textBlockUnifiedLayoutSourceStateV1.ts`:

```ts
export interface VNextTextBlockSourcePathCopyCandidateRecordInternalV1 {
  // Existing exact fields remain unchanged.
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly removedItems:
    readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly nextPhysicalItems:
    readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
}
```

The Source range owner freezes one copy of its existing local `removedItems`
array and one copy of its existing local `createdItems` array only when the
Source candidate reaches `prepared`; those exact objects are stored in the
same candidate record. It keeps the existing `nextLeafItems` field and meaning
unchanged. Blocked/limit paths register none of the three arrays.

Preflight registers the Source replacement with the exact public `change`
object used by CandidateWorkAuthority. The replacement owner copies that
exact reference into the prepared Source candidate record. Before any Source
item, key, entry, style, node, or receipt observation, the sidecar coordinator
calls a read-only CandidateWorkAuthority matcher with the exact previous Root
and composition from the registered previous sidecars plus the exact change
from the Source candidate. A missing, detached, cloned, failed, published,
wrong-Root, wrong-change, or wrong-composition meter blocks without
observation. The matcher returns only `boolean` and never returns its private
meter seed.

```ts
export function allocateVNextTextBlockSourcePositionKeysInternalV1(input: {
  readonly left: VNextTextBlockSourcePositionKeyInternalV1 | null
  readonly right: VNextTextBlockSourcePositionKeyInternalV1 | null
  readonly count: number
  readonly workMeter:
    VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
}):
  | { readonly status: "allocated";
      readonly keys: readonly VNextTextBlockSourcePositionKeyInternalV1[] }
  | { readonly status: "key-space-exhausted"; readonly keys: readonly [] }
  | { readonly status: "invalid"; readonly keys: readonly [] }

export function prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1(
  input: {
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly replacement:
      VNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1
    readonly removedItems:
      readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
    readonly nextPhysicalItems:
      readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
    readonly previousSidecars:
      VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly workMeter:
      VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  },
):
  | { readonly status: "prepared"; readonly sidecars:
      VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1;
      readonly candidateAuthority:
        VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1;
      readonly issues: readonly [] }
  | { readonly status: "fallback-required";
      readonly cause: "source-position-key-space-exhausted" | "work-limit";
      readonly evaluatorOrProofAuthority: object;
      readonly sidecars: null; readonly issues: readonly [] }
  | { readonly status: "blocked"; readonly sidecars: null;
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[] }
```

`removedItems` and `nextPhysicalItems` must be exact arrays registered in the
Source path-copy candidate record. The sidecar owner never accepts caller-
constructed arrays or searches for a replacement independently.

- [ ] **Step 1: Write the incremental-sidecar RED matrix**

Cover:

- first/middle/last insertion, deletion, replacement, and style change in a
  full eight-item leaf;
- local batches `9`, `10`, `15`, `16`, `17`, and one within-limit batch above
  `16`, including exact `10 -> 8/2` and `17 -> 8/4/5` Source-tree grouping;
- 1/8/9/32/33/128 physical-index entries;
- prefix/replacement/suffix fragments with one logical text `inlineId`;
- atomic ID uniqueness after deletion/replacement;
- refcount decrement-to-zero and increment from zero;
- style digest collision with exact facts remaining distinct;
- exact retained identity/order/style suffix roots;
- correct current absolute rendered ranges after a length-changing prefix edit;
- direct allocator exhaustion and no emitted candidate;
- forced Source/index/style fingerprint collisions; and
- no `range-delta` history-depth growth over three Source states;
- exact candidate-record array identity, including rejection of cloned,
  reordered, truncated, cross-candidate, `nextLeafItems`, and structurally
  equal caller-created arrays; and
- a blocked/limit Source path-copy attempt leaves no registered removed/next
  physical array authority; and
- exact rejection before observation for wrong-Root, wrong-change,
  wrong-composition, detached, cloned, failed, published, and cross-candidate
  meters, including structurally or fingerprint-equal change clones.

```ts
it("retains suffix entries while deriving their shifted current offsets", () => {
  const before = planASource("A|FIELD|Z")
  const suffixEntry = lookupExactEntry(before.sidecars, "suffix")
  const next = insertPrefix(before, "LONG")
  expect(lookupExactEntry(next.sidecars, "suffix")).toBe(suffixEntry)
  expect(lookupRange(next.sidecars, "suffix")).toEqual({
    startRenderedUtf16: previousStart + 4,
    endRenderedUtf16: previousEnd + 4,
  })
  expect(next.observed).not.toContain("retained-suffix-entry")
})

it("returns candidate-free exact key-space exhaustion", () => {
  const result = allocateVNextTextBlockSourcePositionKeysInternalV1({
    left: 10,
    right: 12,
    count: 2,
    workMeter: exactOpenPlanAMeter,
  })
  expect(result).toEqual({ status: "key-space-exhausted", keys: [] })
})
```

- [ ] **Step 2: Run Task 5 RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts
```

Expected: FAIL because current Source lookup uses a history-depth
`range-delta` index and style updates clone a whole registry.

- [ ] **Step 3: Implement canonical local position-key allocation**

The allocator accepts only an exact open Plan A meter already proven by its
coordinator to be bound to the same Root/change/composition; a detached,
closed, cross-candidate, or cloned meter returns `invalid` before neighbor
access. This proof uses the approved read-only exact meter-binding matcher;
neither the allocator nor coordinator may inspect or reconstruct a meter seed.
For `count === 0`,
return `allocated` with an exact empty frozen array and do not read neighbors.
For positive `count`, use the exact mathematical formula and virtual boundary
rules from the design. Charge the index-entry permit before emitting each key
and the comparison permit before reading or comparing each
real/virtual/candidate key.

If interval capacity is insufficient or a virtual boundary/result is unsafe,
mint one exact process-local proof authority bound to previous sidecars,
replacement, neighbor entries, requested count, and factual receipts. Return
no entry, root, or sidecar candidate.

- [ ] **Step 4: Path-copy the identity and order roots**

Resolve exact removed physical entries through the previous identity root and
the registered replacement range. Remove only those entries. Obtain the exact
left/right retained order neighbors, allocate local keys, and insert the exact
next physical entries.

Every node/entry/comparison operation uses begin → payload operation → complete
permits. Retain every untouched subtree by `===`. Do not update a retained
suffix entry's position key and do not enumerate a retained suffix.

Order-root lookup accumulates rendered-length summaries on the search path to
derive current absolute offsets. Identity-root lookup returns all same-inline
text fragments ordered by position key; any same-inline atomic multiplicity
blocks.

- [ ] **Step 5: Path-copy style refcounts**

For each exact removed style-bearing item, decrement one exact style entry;
remove the entry at zero. For each exact next style-bearing item, increment or
insert. Visit only affected search/collision/rebalance paths. Retain untouched
style subtrees and buckets by identity.

Style lookup by `measurementStyleKey` and `effectiveShapingStyleKey` performs a
bounded key-range lookup, then exact canonical-fact comparison within matching
collision buckets. It never filters the whole registry.

- [ ] **Step 6: Remove 5B-2 history/style-clone ownership from Source State**

For a Source State with exact registered Plan A sidecars:

- `visitVNextTextBlockTransitionSourceItemByInlineIdInternalV1` delegates to
  the identity/order roots;
- `resolveVNextTextBlockRegisteredSourceStyleInternalV1` delegates to the
  style root; and
- the text/style Source path-copy stores no new `range-delta` layer and does
  not clone `registeredStylesBySourceState`.

Retain the old complete/index/style records for frozen V1/5B-1 paths. Do not
delete or reinterpret their behavior in Plan A.

- [ ] **Step 7: Run Task 5 GREEN and threshold probes**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts
npm run type-check
git diff --check
```

For each of the ten Source rows, run zero-limit hostile first-observation tests
and explicit limit-minus-one/equal/plus-one tests through the private Plan A
factory. For factual required work `N`: limit `0` stops before the first
observation; limit `N - 1` stops immediately before the `N`th operation; limit
`N` accepts; and limit `N + 1` also accepts with the same factual count `N` and
no invented extra work.

- [ ] **Step 8: Commit Task 5**

```powershell
git add src/layout/textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts
git commit -m "feat(layout): path copy phase 5b2 source sidecars"
```

Stop for task review. Any retained-suffix entry rewrite, history-depth lookup,
whole-style clone, unmetered sort, or candidate-bearing failure blocks Plan A.

## Task 6: Bind the full Source-stage tuple and close Plan A behavior

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`
- Test: `tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts`
- Test: `tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts`

**Interfaces:**

- Consumes: exact preflight/Evidence candidate-work authority, exact previous
  sidecars, exact Source-tree and sidecar candidates, exact Plan A composition,
  and completed Source receipts.
- Produces one exact full Source-stage authority plus the existing narrow
  structural-target/layout-delta authorities derived from it.

```ts
export interface VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1 {
  readonly __sourceStageAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 {
  readonly __sourceStageCommitTicketOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStageAuthorityRecordInternalV1 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
  readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
  readonly composition:
    VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
  readonly packingPolicy:
    typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1
  readonly previousSidecars:
    VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSidecars:
    VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly candidateWorkAuthority:
    VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
}

export function createVNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1(
  input: VNextTextBlockUnifiedLayoutSourceStageAuthorityRecordInternalV1,
): VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1 | null

export function prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
    readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
    readonly composition:
      VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    readonly packingPolicy:
      typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1
    readonly previousSidecars:
      VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSidecars:
      VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    readonly candidateWorkMeter:
      VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly nextSidecarCandidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    readonly producingStageAuthority: object
  },
): VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 | null

export function commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(
  ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
): VNextTextBlockUnifiedLayoutSourceStageAcceptedV1

export function resolveVNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1(
  input: {
    readonly authority: unknown
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  },
): VNextTextBlockUnifiedLayoutSourceStageAuthorityRecordInternalV1 | null
```

Add to the internal accepted Source-stage object:

```ts
readonly sourceStageAuthority:
  VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1
readonly candidateWorkAuthority:
  VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
```

This is an internal interface only; do not change the public transition result.

- [ ] **Step 1: Write full-tuple and Source-stage RED tests**

Cover:

- semantic-only resolved-field update;
- equal-metric and paint-only style updates;
- metric-affecting insertion/replacement/deletion with exact accepted Evidence;
- first/middle/last and multi-leaf Source ranges;
- exact next sidecar roots in Source authority;
- cloned next Source/index/style root rejection;
- stale/replayed/cross-Root/cross-change/cross-Evidence/cross-policy work;
- fingerprint collisions for Source, sidecars, composition, preflight, and
  candidate work;
- partial tree candidate followed by sidecar work limit/key exhaustion returns
  no Source/sidecar/stage authority;
- Task 3 foundation publication rejects nonzero `source-items`, while Task 6
  accepts it only with the exact current Source commit ticket and exact ticket
  emission count;
- cloned, stale, replayed, cross-meter, cross-Root, and cross-change Source
  commit tickets cannot authorize candidate-work publication;
- a forced final-precondition rejection before commit leaves candidate work,
  next sidecars, and Source-stage authority all unresolvable;
- replaying one consumed Source commit ticket is an internal invariant
  rejection and creates no second registration;
- candidate-work public compatibility aggregates match exact Source-tree
  receipts; and
- no Flow, Break, Spatial, Line, Scene, Delivery, or Root candidate is created.

```ts
it("binds exact next Source and all sidecars into one authority", () => {
  const result = runAcceptedSourceStage(fixture)
  const record = resolveSourceStageAuthority({
    authority: result.sourceStageAuthority,
    previousRoot: fixture.root,
    nextSourceState: result.nextSourceState,
    completedCandidateWork: result.completedCandidateWork,
  })
  expect(record?.nextSidecars).toBe(resolveSidecars(result.nextSourceState))
  expect(record?.packingPolicy).toBe(
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1,
  )
})
```

- [ ] **Step 2: Run Task 6 RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
```

Expected: FAIL because current structural authority binds only previous/next
Source and the wrapper still trusts broad compatibility counters.

- [ ] **Step 3: Route Source-tree operations through the private meter**

Map the existing proven Source range-splice operations exactly:

```text
replacement item read/emission -> source-items
Source node lookup/donor visit  -> source-tree-lookup-nodes
created/copied Source node      -> source-tree-path-copy-nodes
affected previous leaf slot     -> source-leaf-slots
```

Each callback begins the exact permit before access/allocation and completes
it after the owned operation succeeds. Preserve the existing canonical local
batch/borrow/merge/root-collapse algorithm and independent topology tests.

- [ ] **Step 4: Execute the Source stage as one candidate transaction**

The exact order is:

1. resolve preflight and candidate-work authorities by exact identity;
2. resolve the exact Root-bound composition and previous sidecars;
3. open one Source work meter;
4. prepare the Source-tree range splice;
5. prepare physical-index and style-refcount path copies;
6. project the factual unchanged-shape public compatibility work object;
7. validate every candidate-work, sidecar, full-tuple, and derived-authority
   precondition, derive the exact Source emission count from the registered
   Source range candidate, and mint one opaque one-shot Source commit ticket
   without any candidate/sidecar publication;
8. consume that ticket in one synchronous no-fail commit tail which publishes
   private candidate-work authority, registers next sidecars, mints the full
   Source-stage authority, and derives the narrow authorities.

No candidate from steps 4-7 is returned on any failure. A work-limit result
uses the meter's exact evaluator authority. Key-space exhaustion uses only the
sidecar proof authority. Other malformed/exact-authority failures are blocked.
Every exit after opening the meter first projects factual compatibility work;
the returned public object reports completed operations, while the exact
private evaluator/proof record retains both attempted and completed counts.

The commit ticket is task-specific, exact-identity-bound, one-shot, and never
enters public JSON or fallback. All fallible checks must finish before it is
minted. After ticket creation there is no work-limit, structural-exhaustion, or
blocked branch: a failed registry write or authority mint is an internal
invariant violation, not a fallback result. This prevents an implementation
from publishing a resolvable half-registered Source candidate.

For the approved Task 6 seam, the Source authority module stores the exact
meter, Root/change/composition, next Source candidate, and completed Source
emission count behind the commit ticket. It exposes one narrow task-specific
ticket resolver. The candidate-work authority module resolves that ticket by
exact identity and accepts nonzero `source-items` only when all bound objects
and the exact ticket emission count match its private receipts and public
compatibility aggregate. The Source authority module must use only type imports
from candidate-work authority so this resolver direction does not create a
runtime module cycle. No neutral/generic producing-stage registry is added.

- [ ] **Step 5: Preserve public Candidate Work V1 compatibility honestly**

Update only existing compatibility aggregates:

```text
flow.visitedSourceItemCount            = completed source-items
flow.visitedSourceLookupNodeCount      = completed source-tree-lookup-nodes
flow.copiedSourcePathNodeCount         = completed source-tree-path-copy-nodes
flow.visitedChangedSourceLeafItemCount = completed source-leaf-slots
```

Project those four values into the existing legacy Source `stageWork` rows
without adding granular IDs to public Transition V1. Index/style facts remain
private Plan A receipts until Plan E introduces the reviewed public V2 lane.

- [ ] **Step 6: Bind the full authority and derive compatibility tokens**

`createVNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1` requires
exact registered membership for every tuple object and verifies the complete
private Source receipt ledger. Only after it succeeds may the module mint the
existing structural-target authority. Mint source-layout-delta authority only
when exact bounded delta layout facts are equal.

Change the narrow authority WeakMap record to reference the full Source-stage
authority; keep the old exact previous/next inspection functions for Plan B
compatibility. Do not let them mint authority independently.

- [ ] **Step 7: Prove three-state sidecar freshness without claiming Root publication**

Run three direct Source checkpoint path copies through exact registered
replacement/sidecar/candidate authorities. Transition two and three must
resolve only the immediately previous Source sidecars. Reject the bootstrap
sidecars, Source 0 cursor, Source 1 authority at Source 2, and all cloned
position/style roots.

Label this test `Source checkpoint chain`, not a published Root transition.
Plan D remains the owner of atomic Root publication and fallback-root
continuation.

- [ ] **Step 8: Run Task 6 focused GREEN and full Plan A behavioral gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutWorkOwnerRegistryV1.test.ts tests/textBlockUnifiedLayoutWorkPolicyCompositionV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

- [ ] **Step 9: Commit Task 6**

```powershell
git add src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "feat(layout): bind full phase 5b2 source stage authority"
```

Stop for task review. Do not proceed with a missing tuple dependency, private
receipt/public aggregate mismatch, or Source-checkpoint test labelled as Root
publication.

## Task 7: Close the Plan A checkpoint and produce the Thai review

**Files:**

- Create: `docs/superpowers/plans/2026-08-09-unified-incremental-root-transition-5b2-plan-a-review-th.md`
- Modify only if a bounded review fix is required: files already listed in
  Tasks 1-6.

**Interfaces:**

- Consumes: final committed Tasks 1-6, the umbrella design, the 5B-2A accepted
  foundation, and fresh verification/review evidence.
- Produces: clean Plan A implementation HEAD, no open Critical/Important
  finding, Thai evidence report, and a user stop before Plan B planning.

- [ ] **Step 1: Run the complete accepted 5B-2A regression gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutTrivialAdmissionV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockFlowEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
```

Record the fresh file/test totals; do not reuse the baseline `14 / 312` result.

- [ ] **Step 2: Run the complete Plan A gate and full Core check**

```powershell
npx vitest run tests/textBlockUnifiedLayoutWorkOwnerRegistryV1.test.ts tests/textBlockUnifiedLayoutWorkPolicyCompositionV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run check
git diff --check 10cd962..HEAD
git status --short
```

Expected: all tests/type-check pass and the worktree is clean before review.

- [ ] **Step 3: Run exact scope and public-boundary scans**

```powershell
git diff --name-only 10cd962..HEAD
rg -n "WorkOwnerRegistryV1|WorkPolicyCompositionInternalsV1|CandidateWorkAuthorityInternalsV1|SourcePhysicalIndexInternalsV1|SourceStyleRefcountsInternalsV1|SourceSidecarsInternalsV1" src/index.ts
rg -n "completeKernelWork|range-delta|Array\.prototype\.sort|\.sort\(" src/layout -g "textBlockUnifiedLayoutSource*.ts" -g "textBlockUnifiedLayoutTransitionSourceInternalsV1.ts"
git stash list
```

Classify every result. Expected public-boundary scan: no match. Any `.sort(`
inside new sidecar construction/path-copy code requires removal or a written
proof that it is bounded local collision-bucket ordering, never a complete
Source/style sort. The diagnostic stash
`c711c1135a3e3808d6b0da042c6d2eadec484431` remains untouched.

- [ ] **Step 4: Request fresh task and checkpoint reviews**

Use `superpowers:requesting-code-review`. Review against:

1. exact 80-row topology and slice identities;
2. frozen public/V3/retained-V1 facts;
3. no private receipt self-validation from `stageWork`;
4. owner-before-observation for all ten Source rows;
5. no absolute-offset retained authority/history-depth index/style clone;
6. exact position-key allocation and candidate-free exhaustion;
7. full Source-stage tuple and sidecar identity;
8. collision/clone/stale/replay/cross-policy rejection;
9. no complete suffix/tree/next-input/Scene/oracle hot-path traversal;
10. complete/incremental ledger separation;
11. Source checkpoint chain honesty; and
12. Plan B-D/public activation/out-of-scope boundaries.

- [ ] **Step 5: Correct review findings with bounded TDD fix rounds**

For each Critical/Important finding: reproduce one focused RED, make the
minimum correction, rerun its task gate plus the complete Plan A and 5B-2A
gates, and commit one scoped fix. Do not broaden into Plan B or a generic
framework. Minor findings must be fixed or receive an explicit written ruling.

- [ ] **Step 6: Write the separate Thai review**

The Thai review must contain, in this order:

```text
Critical
Important
Minor
PASS
FAIL / BLOCKER
RISK
UNKNOWN
ไฟล์ที่เปลี่ยน
พฤติกรรมที่เปลี่ยน
การทดสอบที่รันและผลจริง
ความเสี่ยงที่เหลือ
สิ่งที่ตั้งใจไม่เปลี่ยน
คำตัดสิน Plan A
```

State explicitly that Plan A has no public activation, no Root publication,
no fallback completion, no Flow/Break/Spatial/Line/Scene/Delivery work, and no
production calibration claim.

- [ ] **Step 7: Commit the final Plan A review record**

```powershell
git add docs/superpowers/plans/2026-08-09-unified-incremental-root-transition-5b2-plan-a-review-th.md
git commit -m "docs: close phase 5b2 plan a source authority"
```

- [ ] **Step 8: Rerun final-tree verification and stop for the user**

Rerun the complete Plan A gate, 5B-2A regression gate, `npm run check`,
`git diff --check 10cd962..HEAD`, `git status --short`, and stash check from the
unchanged final commit. Report exact fresh totals and commit hash.

Do not write Plan B until the user reviews the Thai report and explicitly
authorizes the next just-in-time planning cycle.

---

## Plan A prerequisite-audit closure

| Audit requirement | Owning task |
| --- | --- |
| Every consumed type/function exists at `10cd962` or is produced earlier | File map; Tasks 1-6 Interfaces |
| Every operation has an exact reserved owner row | Task 1 |
| Active Source rows have evaluator and ledger destination | Tasks 2-3 |
| Every output has exact next-stage authority | Tasks 3 and 6 |
| Complete and incremental Source sidecars share exact entry semantics only | Tasks 4-5 |
| No later-plan authority is consumed | Global Constraints; Tasks 4-6 |
| Frozen/public contracts have non-drift guards | Every task gate; Task 7 |
| First-observable and limit exits are independently testable | Tasks 3 and 5 |
| Files remain task-specific rather than generic frameworks | File map; reviews |
| Absolute-offset suffix rewrite gap is closed | Tasks 4-5 |

## Spec coverage index

| Umbrella requirement | Plan A evidence |
| --- | --- |
| Complete reserved owner catalog | Task 1 |
| Exact slice ordering/composition | Tasks 1-2 |
| Admission/source coverage/Evidence reconciliation | Task 3 |
| Private canonical candidate-work authority | Task 3 |
| Complete physical-index/style sidecars | Task 4 |
| Incremental bounded persistent sidecars | Task 5 |
| Full Source structural authority | Task 6 |
| Three-state current Source-sidecar freshness | Task 6 |
| Threshold/hostile/collision tests | Tasks 3, 5, and 6 |
| Frozen V3/retained V1/public boundary | every task; Task 7 |
| Thai review and user gate | Task 7 |

Self-review must treat any missing row, ambiguous interface, unspecified
failure shape, later-plan dependency, or public-surface drift as a plan defect,
not an implementation choice.
