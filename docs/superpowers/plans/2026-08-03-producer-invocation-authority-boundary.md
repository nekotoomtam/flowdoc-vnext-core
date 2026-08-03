# Producer Invocation Authority Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the untrusted detached producer-ceiling bootstrap with one
Core-owned, one-shot, process-local Producer Invocation Authority and close the
Phase 5B-2A Evidence V2 gate without regressing any current producer consumer.

**Architecture:** Core creates the exact request/material tuple and returns a
separate invocation authority whose private record owns per-unit evaluators,
lifecycle, and factual work. The adapter executes a parallel authorized seam,
charging the authority before every owned operation; Core acceptance consumes
the same exact terminal authority. The old producer and acceptance seams remain
available only while the parallel units are proved, then one atomic cutover
removes the generic `evidence-response-nodes` path and migrates all callers.

**Tech Stack:** TypeScript 6, ESM, Vitest 4, private `WeakMap`/`WeakSet`
registries, deterministic fixed-point text-engine fixtures, Node-native and
checked-in MR1-range WASM runtime functions.

**Execution baseline:** `320715f` on
`phase-5b-unified-incremental-root-transition`.

**Recovery evidence:** Do not restore stash
`c711c1135a3e3808d6b0da042c6d2eadec484431`. It is rejected diagnostic WIP,
not implementation input. Its stable patch id is
`ebd09d2cab51c1c6b40f0195f25668c60a2dad68`.

## Global Constraints

- Core-only and process-local; Editor and Backend repositories remain
  unchanged.
- Root V2 and Persistent Scene V2 remain the active lane; Root V1/Scene V1 are
  frozen compatibility and QA reference only.
- Frozen `5b-1-v3`, Root V2, Persistent Scene V2, Attempt V1, and all accepted
  fingerprints remain exact.
- The bounded capability claim applies only to a Core-authorized producer
  invocation.
- Request, source material, runtime identity, detached response/failure, and
  process-local authority remain separate.
- Source-material ceilings are integrity/observation facts only and cannot
  construct a meter, select policy, or select execution.
- Core alone mints the authority and owns its evaluators, lifecycle, and
  factual ledger.
- Missing authority returns constant adapter-local `not-invoked` before any
  request, material, runtime, or fingerprint observation.
- Clone, stale, replay, consumed, cross-tuple, runtime-mismatched, or
  collision-shaped authority cannot register Evidence or fallback authority.
- Every producer and Core-acceptance operation is charged to exactly one
  reviewed owner row before observation or emission.
- Runtime calls are charged before invocation and bounded by exact
  Core-derived input-scalar slots. No claim covers instruction count,
  allocation count, or wall-clock inside Node/Rust/WASM.
- Authority remains on the process-local host and is never transferred to a
  Worker.
- Invalid and failure paths retain factual completed and attempted work; no
  counter may be reset, clamped, or fabricated.
- The producer returns no dirty range, line/band choice, reconvergence, reuse,
  fallback decision, partial candidate, complete next input, or complete
  suffix.
- Core acceptance alone registers Evidence V2 or mints exact proof-failed or
  work-limit fallback authority.
- `importsCoreAsPublicPackage: true` and `coreImportsAdapterBack: false` remain
  exact; do not create a shared authority framework or reverse import.
- The process-local authority appears in no canonical JSON, detached data,
  fingerprint, Root, Scene, or delivery contract.
- No complete next-input/tree/suffix/scene/oracle traversal enters the hot
  path.
- No wall-clock or estimated payload byte count selects execution.
- Do not push, merge, start original re-baseline Task 4, or activate
  production in this plan.
- Use TDD for every task. Commit only after the task gate, type-check, and
  `git diff --check` pass.

---

## File Responsibility Map

### New Core files

- `src/layout/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.ts` owns only
  the ordered Phase 5B-2A evidence owner rows and their exact owner/ledger
  metadata. It is not the future whole-pipeline Task 10 registry.
- `src/layout/textBlockUnifiedLayoutProducerInvocationAuthorityV2.ts` owns the
  authority state machine, private records, per-unit producer evaluators,
  runtime-identity binding, terminal close, and Core-only consumption.

### Existing Core files

- `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts` owns the stage
  work-unit string union and the compatibility aggregate work shape.
- `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts` owns exact internal
  evidence-calibration policies and preserves the frozen V3 policy exactly.
- `src/layout/textBlockUnifiedLayoutEvidenceContractV2.ts` owns public
  TypeScript shapes for the process-local authority control methods, detached
  producer facts, and request-result execution envelope.
- `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts` owns Core request
  and material descriptor/context work plus integrity-only aggregate producer
  ceilings.
- `src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts` owns runtime
  identity registration, exact request tuple orchestration, detached Evidence
  validation, and public acceptance boundaries. It delegates authority state
  and ledgers to the new authority file.
- `src/index.ts` exports only the reviewed authority TypeScript type beside the
  existing V2 data types and existing runtime functions. It exports no mint,
  registry, inspector, evaluator, or policy selector.

### Adapter file

- `packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.ts` owns the
  bounded producer algorithm and adapter-local result union. The corrected
  public function is a thin authorized entry; it does not own Core policy or
  authority registries.

### Tests and fixtures

- `tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts` pins exact
  evidence owner order, uniqueness, metadata, policy coverage, and frozen V3
  noninterference.
- `tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts` pins
  exact identity, lifecycle, first charge, ceilings, runtime binding, terminal
  close, and replay behavior.
- `tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts` pins authorized
  producer work and Node/WASM parity without mirrored magic formulas.
- `tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts` pins exact Core
  acceptance/failure authority and the zero-limit vertical proof.
- `tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts` pins Core-owned
  request/material work and integrity-only detached ceilings.
- `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts` pins evidence-policy
  threshold behavior and frozen V3 facts.
- `tests/helpers/textBlockUnifiedIncremental5b2.ts` owns only reusable admitted
  Root/change/runtime fixtures and exact Core request bundles.
- `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts` and
  `tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts` are mandatory producer
  consumers and migrate in the atomic cutover.
- `tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts` and
  `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts` guard public/private
  boundaries and frozen V1/V3 behavior.

---

### Task 1: Exact Evidence Owner Registry and Calibration Policies

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.ts`
- Create: `tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`

**Interfaces:**

- Consumes: existing `VNextTextBlockUnifiedLayoutStageUnitV1`,
  `VNextTextBlockUnifiedLayoutWorkPolicyV1`, and frozen
  `VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3`.
- Produces:
  `VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2`,
  `VNextTextBlockUnifiedLayout5B2AEvidenceUnitInternalV2`,
  `VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_AUTHORITY_TEST_ONLY_INTERNAL_V2`,
  and
  `createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2(...)`.

- [ ] **Step 1: Write the owner-roster RED test**

Create a test that requires the exact ordered rows from the approved design:

```ts
const expected = [
  ["evidence-request-descriptors", "core-preflight"],
  ["evidence-context-atoms", "core-materialization"],
  ["evidence-material-descriptors", "core-materialization"],
  ["evidence-producer-descriptors", "producer"],
  ["evidence-runtime-invocations", "producer"],
  ["evidence-runtime-input-scalars", "producer"],
  ["evidence-glyphs", "producer"],
  ["evidence-clusters", "producer"],
  ["evidence-breaks", "producer"],
  ["evidence-guards", "producer"],
  ["evidence-proof-facts", "producer"],
  ["evidence-response-facts", "producer"],
  ["evidence-acceptance-descriptors", "core-acceptance"],
  ["evidence-acceptance-comparisons", "core-acceptance"],
  ["evidence-acceptance-registrations", "core-acceptance"],
] as const

expect(rows.map(({ unit, owner }) => [unit, owner])).toEqual(expected)
expect(new Set(rows.map((row) => row.unit)).size).toBe(rows.length)
expect(rows.every((row) => row.stage === "evidence"
  && row.ledger === "incrementalCandidateWork")).toBe(true)
```

Also assert that every new unit is accepted by the stage-unit type and that
the frozen V3 policy still has 21 rows and its existing fingerprint.

- [ ] **Step 2: Run the roster test and verify RED**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
```

Expected: FAIL because the owner registry, new unit strings, and authority
calibration policy do not exist.

- [ ] **Step 3: Add the exact stage-unit strings and owner metadata**

Add the fourteen new strings to
`VNextTextBlockUnifiedLayoutStageUnitV1`; retain the existing
`evidence-context-atoms` string and the two pre-activation legacy strings until
Task 5 removes their active use.

Create the registry as frozen data:

```ts
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2 =
  Object.freeze([
    { stage: "evidence", unit: "evidence-request-descriptors", owner: "core-preflight", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-context-atoms", owner: "core-materialization", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-material-descriptors", owner: "core-materialization", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-producer-descriptors", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-runtime-invocations", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-runtime-input-scalars", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-glyphs", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-clusters", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-breaks", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-guards", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-proof-facts", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-response-facts", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-acceptance-descriptors", owner: "core-acceptance", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-acceptance-comparisons", owner: "core-acceptance", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-acceptance-registrations", owner: "core-acceptance", ledger: "incrementalCandidateWork" },
  ] as const)

export type VNextTextBlockUnifiedLayout5B2AEvidenceUnitInternalV2 =
  typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2[number]["unit"]
```

Do not export this registry from `src/index.ts`.

- [ ] **Step 4: Add exact internal authority-calibration policies**

Keep the existing V3 object byte-for-byte equivalent. Add a separate internal
5B-2 authority test policy whose evidence prefix is derived from the owner
registry, followed by the unchanged 21 V3 rows.

Add a private `WeakSet` of exact calibration policies and this internal-only
factory:

```ts
export function createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2(
  limits: Readonly<Partial<Record<
    VNextTextBlockUnifiedLayout5B2AEvidenceUnitInternalV2,
    number
  >>>,
): VNextTextBlockUnifiedLayoutWorkPolicyV1
```

The factory must reject unknown units and non-safe/negative limits, assign
8,192 to unspecified evidence rows, retain the unchanged V3 tail, freeze and
fingerprint the result, and register only the exact returned object. Extend
`isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(...)` to accept those
registered internal policies without accepting clones.

For an evidence-row limit `L`, use exactly
`smallBlockFloor: L`, `absoluteStageLimit: L`, `relativeNumerator: 0`, and
`relativeDenominator: 1`. This makes the evaluator's effective limit exactly
`L`, including the zero-limit fixture, without adding a caller policy selector.

- [ ] **Step 5: Add owner-derived threshold tests**

For each registry row, construct a calibration policy with that row set to
`3` and assert:

```ts
expect(evaluate(policy, unit, 2).status).toBe("within-limit")
expect(evaluate(policy, unit, 3).status).toBe("within-limit")
expect(evaluate(policy, unit, 4)).toMatchObject({
  status: "limit-exceeded",
  attemptedWork: 4,
  effectiveLimit: 3,
})
```

Assert a structured clone is rejected by exact policy recognition. Derive the
expected evidence row count from `registry.length`; do not write a second
numeric roster count.

- [ ] **Step 6: Run Task 1 GREEN and guards**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
npm run type-check
git diff --check
```

Expected: PASS; V3 still has its exact 21 rows and accepted fingerprint.

- [ ] **Step 7: Commit Task 1**

```powershell
git add -- src/layout/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
git commit -m "feat(layout): register phase 5b2a evidence work owners"
```

---

### Task 2: Core-Owned One-Shot Invocation Authority and Request Envelope

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutProducerInvocationAuthorityV2.ts`
- Create: `tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts`
- Modify: `src/layout/textBlockUnifiedLayoutEvidenceContractV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`
- Modify: `src/index.ts`
- Modify: `tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts`

**Interfaces:**

- Consumes: exact Task 1 evidence owner rows and exact registered 5B-2
  calibration policy.
- Produces:
  `VNextTextBlockTransitionProducerInvocationAuthorityV2`,
  `createVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(...)`,
  `registerVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(...)`,
  and a required request result carrying exact
  `producerInvocationAuthority` separately from detached request/material.

- [ ] **Step 1: Write authority lifecycle and request-envelope RED tests**

Add tests for:

```ts
const bundle = createAuthorizedRequestBundle({
  policy: createEvidencePolicy({ "evidence-producer-descriptors": 0 }),
})

expect(bundle.status).toBe("required")
expect(bundle.producerInvocationAuthority).toEqual(expect.any(Object))
expect(Object.isFrozen(bundle.producerInvocationAuthority)).toBe(true)
expect("producerInvocationAuthority" in bundle.sourceMaterial).toBe(false)
expect(JSON.stringify(bundle.request)).not.toContain("InvocationAuthority")
```

Exercise the exact control methods directly:

- exact request/material begin succeeds once;
- a spread/copied-method receiver and cross-tuple begin reject without payload
  observation;
- first descriptor charge at limit zero returns exact attempted `1`, completed
  `0`, and effective limit `0`;
- registered runtime identity binds once after a charged descriptor read;
- unregistered or cross-requirement runtime identity rejects;
- terminal close succeeds once;
- post-close charge and second close reject; and
- `expect(() => structuredClone(authority)).toThrow()` because the authority
  contains function-valued process-local control methods; a separate
  `{ ...authority }` copied-method receiver must return `rejected`.

- [ ] **Step 2: Run authority tests and verify RED**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts
```

Expected: FAIL because the authority type, lifecycle, and request-result field
do not exist.

- [ ] **Step 3: Define the public process-local control type**

Add these task-specific types to the V2 evidence contract:

```ts
export type VNextTextBlockTransitionProducerOwnedWorkUnitV2 =
  | "evidence-producer-descriptors"
  | "evidence-runtime-invocations"
  | "evidence-runtime-input-scalars"
  | "evidence-glyphs"
  | "evidence-clusters"
  | "evidence-breaks"
  | "evidence-guards"
  | "evidence-proof-facts"
  | "evidence-response-facts"

export type VNextTextBlockTransitionProducerChargeResultV2 =
  | { readonly status: "charged"; readonly unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2; readonly completedWork: number; readonly effectiveLimit: number }
  | { readonly status: "limit-exceeded"; readonly unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2; readonly attemptedWork: number; readonly completedWork: number; readonly effectiveLimit: number }
  | { readonly status: "invalid-state"; readonly unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2 }

export interface VNextTextBlockTransitionProducerInvocationAuthorityV2 {
  readonly source: "vnext-text-block-transition-producer-invocation-authority-v2"
  readonly contractVersion: 2
  readonly begin: (
    this: VNextTextBlockTransitionProducerInvocationAuthorityV2,
    request: VNextTextBlockTransitionEvidenceRequestV2,
    sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2,
  ) => { readonly status: "started" | "rejected" }
  readonly charge: (
    this: VNextTextBlockTransitionProducerInvocationAuthorityV2,
    unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2,
  ) => VNextTextBlockTransitionProducerChargeResultV2
  readonly bindRuntimeIdentity: (
    this: VNextTextBlockTransitionProducerInvocationAuthorityV2,
    identity: VNextTextBlockTransitionProducerRuntimeIdentityV2,
  ) => { readonly status: "bound" | "rejected" }
  readonly close: (
    this: VNextTextBlockTransitionProducerInvocationAuthorityV2,
    outcome: "producer-response" | "producer-failure" | "producer-blocked",
  ) => { readonly status: "closed" | "rejected"; readonly visitedEvidenceNodeCount: number }
}
```

The interface exposes control operations but no tuple, registry, evaluator,
policy selector, Root, change, or ledger inspector.

Add `producerInvocationAuthority` to the `required` request-result branch and
`null` to every other branch. Export only the interface/result types from
`src/index.ts`; export no authority value function.

- [ ] **Step 4: Implement the private authority state machine**

Create a private `WeakMap<object, AuthorityRecordV2>` with states:

```ts
type AuthorityStateV2 =
  | "created"
  | "started"
  | "runtime-bound"
  | "producer-response"
  | "producer-failure"
  | "producer-blocked"
  | "acceptance-consumed"
```

The record binds exact Root/change/request/material/policy/runtime requirements,
one evaluator per producer owner row, successful per-unit counts, the first
failed evaluation, exact runtime identity, and terminal state. Each
`charge(unit)` evaluates `completed + 1`; a limit failure records the attempted
unit without incrementing completed work.

Implement every control method as a regular function that resolves the record
with `records.get(this)`. Do not use arrow functions that close over the
original authority. A spread/copied method called with another receiver must
reject before touching the exact record.

Add Core-only functions used by Task 4:

```ts
export function inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
  authority: unknown,
): Readonly<AuthorityRecordSnapshotV2> | null

export function consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
  input: { readonly authority: unknown; readonly request: object; readonly sourceMaterial: object; readonly expectedTerminal: "producer-response" | "producer-failure" | "producer-blocked" },
): { readonly status: "consumed"; readonly snapshot: Readonly<AuthorityRecordSnapshotV2> } | { readonly status: "rejected" }
```

These are relative internal exports only and must not appear in `src/index.ts`.

- [ ] **Step 5: Move runtime-identity membership into the authority owner**

Keep `createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(...)` as
the existing orchestration entry, but make it register the exact frozen
identity through
`registerVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(...)`.
The authority binds only exact registered identities whose font/style/unit and
runtime-requirement fingerprints match the request.

- [ ] **Step 6: Migrate Core preflight to the new Core-owned evidence rows**

Replace active 5B-2 uses of `evidence-request-lookup-nodes` and the generic
`evidence-response-nodes` bootstrap with:

- `evidence-request-descriptors` before request facts are observed/emitted;
- `evidence-context-atoms` before each material atom;
- `evidence-material-descriptors` before material facts are observed/emitted.

Keep `producerWorkCeilings` in detached material, but derive its aggregate
visited ceiling from the exact producer rows in the registered policy. The
adapter must never use this field to construct execution authority.

At exact request registration, create the authority and return:

```ts
return freeze({
  status: "required" as const,
  request,
  sourceMaterial,
  producerInvocationAuthority,
  evaluatorOrProofAuthority: null,
  completedCandidateWork,
  issues: freeze([]),
})
```

Keep compatibility aggregates deterministic:

- `visitedRequestLookupNodeCount` equals completed
  `evidence-request-descriptors` only;
- `materializedContextAtomCount` equals completed
  `evidence-context-atoms`;
- `evidence-material-descriptors` remains exact in `stageWork` and is not
  mislabeled as a request lookup; and
- producer/acceptance rows are present as zero in preflight `stageWork` until
  their owners execute.

- [ ] **Step 7: Add an authority-policy Root fixture without changing frozen fixtures**

Add `admitted5B2AuthorityRootFixture(...)` and
`authorizedEvidenceRequestBundle5B2(...)` to the 5B-2 helper. They must create
the Root with an exact policy from Task 1 and return one exact request,
material, authority, Root, and change tuple. Keep the previous helper available
until Task 5 atomic cutover.

- [ ] **Step 8: Run Task 2 GREEN and public-boundary guards**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
npm run type-check
git diff --check
```

Expected: PASS; the new authority TypeScript type is visible through Core, but
the mint/inspect/consume/registry values remain absent from public exports.

- [ ] **Step 9: Commit Task 2**

```powershell
git add -- src/layout/textBlockUnifiedLayoutProducerInvocationAuthorityV2.ts src/layout/textBlockUnifiedLayoutEvidenceContractV2.ts src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts src/index.ts tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts
git commit -m "feat(layout): mint exact producer invocation authority"
```

---

### Task 3: Authorized Producer Execution and Factual Producer Work

**Files:**

- Modify: `packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.ts`
- Modify: `tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`

**Interfaces:**

- Consumes: exact Task 2 authority control methods, exact request/material
  references, and registered Node/WASM runtime identity.
- Produces:
  `createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(...)`
  and adapter-local `FlowDocUnifiedIncrementalEvidenceAuthorizedResultV2` with
  `accepted`, factual `blocked`, or constant `not-invoked` outcomes.

- [ ] **Step 1: Write authorized-producer RED tests**

Add a new authorized describe block while leaving the existing public producer
tests unchanged until Task 5. Require this signature:

```ts
createFlowDocTextEngineUnifiedIncrementalEvidenceAuthorizedInternalV2(
  authority,
  request,
  sourceMaterial,
  runtime,
)
```

Test these rows:

- missing, malformed, copied-method receiver, stale, or cross-tuple authority
  returns
  `{ status: "not-invoked", response: null, failure: null }` without triggering
  hostile `ownKeys`, descriptor, prototype, symbol, getter, or runtime calls;
- a caller-authored lookalike whose own methods deliberately return success is
  allowed to run only the raw low-level adapter lane, and the Task 4 Core
  acceptance test must reject its result because no exact Core record exists;
- exact zero `evidence-producer-descriptors` limit stops before the first data
  observation with attempted `1`, completed `0` in the authority result;
- runtime invocation and each input scalar are charged before `shapeRange` or
  `segmentRange`;
- every returned glyph, logical cluster, break, guard, proof fact, and
  response/failure fact is charged to its distinct unit;
- cluster ceiling preserves factual completed clusters and records the next
  attempted cluster without assigning the ceiling to `consumedClusterCount`;
- malformed runtime facts retain charges already completed;
- Node and WASM normalized detached responses remain equal; and
- complete-next traversal/comparison counters remain zero.

Use a test event recorder wrapped around authority control returns. Expected
events must be semantic unit events, not copied descriptor arithmetic such as
`37 + 12 * glyphCount`.

- [ ] **Step 2: Run authorized producer tests and verify RED**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts -t "authorized producer"
```

Expected: FAIL because the authorized internal producer does not exist.

- [ ] **Step 3: Add the adapter-local no-observation entry guard**

Define:

```ts
export type FlowDocUnifiedIncrementalEvidenceAuthorizedResultV2 =
  | FlowDocUnifiedIncrementalEvidenceResultV2
  | { readonly status: "not-invoked"; readonly response: null; readonly failure: null; readonly issues: readonly ["missing-or-mismatched-invocation-authority"] }
```

Call `authority.begin(request, sourceMaterial)` before accessing any property
of request, material, or runtime. A missing control method, rejected begin, or
thrown control call returns the constant frozen `not-invoked` value. Do not
read raw request/material fingerprints to construct that result.

- [ ] **Step 4: Replace detached-ceiling metering in the authorized seam**

In the authorized function, delete every use of
`sourceMaterial.producerWorkCeilings` as a meter source. Use a local helper:

```ts
const before = (
  unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2,
): boolean => authority.charge(unit).status === "charged"
```

Charge before every adapter-owned operation. For runtime input strings, iterate
Unicode scalars and charge `evidence-runtime-input-scalars` before consuming
each scalar. Do not use `for...of`, which yields the scalar before the loop body
can charge it. Use an index loop shaped like:

```ts
for (let offset = 0; offset < text.length;) {
  if (!before("evidence-runtime-input-scalars")) return ceilingFailure()
  const codePoint = text.codePointAt(offset)
  if (codePoint == null) return invalidFailure()
  offset += codePoint > 0xffff ? 2 : 1
}
```

Repeat the scalar charges for each exact runtime input, then charge
`evidence-runtime-invocations` immediately before the bounded runtime call.

- [ ] **Step 5: Make producer work factual and owner-derived**

Maintain semantic counters separately:

```ts
let consumedAtomCount = 0
let consumedClusterCount = 0
let unusedCoverageRenderedUtf16Length = 0
```

Increment only after the corresponding work actually completes. On a failed
cluster charge, leave `consumedClusterCount` unchanged. Close the authority as
`producer-response`, `producer-failure`, or `producer-blocked`; use the close
receipt’s producer aggregate for detached `visitedEvidenceNodeCount`.

The response/failure fingerprint remains detached data. It contains no
authority, granular ledger, evaluator, or terminal record.

- [ ] **Step 6: Charge runtime output and response emission explicitly**

Replace broad recursive credit reuse with explicit operations:

- descriptor/prototype/key/slot observation →
  `evidence-producer-descriptors`;
- runtime call → `evidence-runtime-invocations`;
- input scalar → `evidence-runtime-input-scalars`;
- glyph inspection → `evidence-glyphs`;
- logical cluster construction → `evidence-clusters`;
- break inspection/emission → `evidence-breaks`;
- boundary guard inspection → `evidence-guards`;
- shaping/segmentation proof emission → `evidence-proof-facts`;
- top-level response or failure field emission →
  `evidence-response-facts`.

No one operation may be counted under two rows.

- [ ] **Step 7: Run Task 3 GREEN and existing-producer regression**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockFlowEvidenceV2.test.ts
npm run type-check
git diff --check
```

Expected: authorized tests pass; existing public producer tests remain green
through the unchanged temporary public seam.

- [ ] **Step 8: Commit Task 3**

```powershell
git add -- packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "feat(layout): meter authorized producer execution"
```

---

### Task 4: Exact Core Acceptance, Failure, and Vertical Proof

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`

**Interfaces:**

- Consumes: exact Task 2 authority record and Task 3 terminal producer
  response/failure.
- Produces:
  `acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2(...)`,
  `acceptVNextTextBlockUnifiedLayoutAuthorizedProducerFailureInternalV2(...)`,
  exact Evidence registration, and candidate-free fallback authority backed by
  the consumed terminal record.

- [ ] **Step 1: Write acceptance and vertical-proof RED tests**

Require internal authorized acceptance inputs to contain:

```ts
{
  previousRoot,
  change,
  request,
  sourceMaterial,
  producerInvocationAuthority,
  producerRuntimeIdentity,
  responseOrFailure,
}
```

Add the minimal zero-limit vertical proof:

```text
Core request -> exact zero-limit authority -> producer not past first
descriptor -> factual work-ceiling failure -> exact Core failure acceptance
-> candidate-free deterministic-work-limit fallback authority
```

Also test:

- exact positive authority reaches accepted Evidence V2;
- authority clone, request/material clone, cross tuple, stale runtime, replay,
  double acceptance, and forced fingerprint collision block;
- invalid response retains factual producer plus acceptance work;
- failure fallback requires the exact failed terminal unit/evaluation;
- non-ceiling failure cannot impersonate a work-limit terminal;
- `consumedClusterCount` remains the exact emitted count on ceiling;
- acceptance descriptor/comparison/registration limits stop before their
  disallowed operation; and
- no partial candidate enters fallback.

- [ ] **Step 2: Run acceptance tests and verify RED**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts -t "authorized acceptance|vertical authority"
```

Expected: FAIL because authorized acceptance functions do not exist.

- [ ] **Step 3: Implement exact terminal consumption before detached payload**

The internal acceptance functions must first consume the exact authority tuple
and expected terminal through
`consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(...)`.
Exact `WeakMap` membership may precede charging; no detached response/failure
property may be observed before successful consumption and the first
`evidence-acceptance-descriptors` charge.

Rejected authority returns a blocked result with no Evidence and no fallback
authority.

- [ ] **Step 4: Replace mirrored work formulas with authority-ledger validation**

Remove acceptance formulas that reconstruct producer descriptor work using
constants such as `37`, `12`, or `44`. Validate:

- detached semantic counts from canonical response facts;
- detached producer aggregate against the producer rows in the consumed
  authority snapshot; and
- candidate `stageWork` against the complete Core-owned preflight, producer,
  and acceptance rows.

For compatibility aggregates, detached
`VNextTextBlockTransitionProducerWorkV2.visitedEvidenceNodeCount` is the sum of
successful producer-owned rows only. Final
`VNextTextBlockIncrementalCandidateWorkV1.evidence.visitedEvidenceNodeCount` is
the sum of successful producer-owned and acceptance-owned rows. Exact
per-owner facts remain in `stageWork`; neither aggregate selects execution.

Charge each detached descriptor, semantic comparison, and Evidence/fallback
registration to its distinct acceptance owner.

- [ ] **Step 5: Separate completed work from failed attempted work**

For a work-limit terminal, require:

```ts
failedEvaluation.attemptedWork === completedByUnit[failedUnit] + 1
failedEvaluation.effectiveLimit === completedByUnit[failedUnit]
```

Do not require or assign a semantic consumed counter to equal that limit. Mint
fallback authority only from the exact consumed terminal snapshot and retain
the existing separate incremental/fallback/oracle ledgers.

- [ ] **Step 6: Run Task 4 GREEN and frozen fallback guards**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
npm run type-check
git diff --check
```

Expected: authorized acceptance and the vertical proof pass; frozen 5B-1
fallback/Attempt V1 behavior remains exact.

- [ ] **Step 7: Commit Task 4**

```powershell
git add -- src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/helpers/textBlockUnifiedIncremental5b2.ts
git commit -m "feat(layout): consume exact producer authority"
```

---

### Task 5: Atomic Public Cutover and Complete Consumer Closure

**Files:**

- Modify: `packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutEvidenceContractV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `tests/helpers/textBlockUnifiedIncremental5b2.ts`
- Modify: `tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`
- Modify: `tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts`
- Modify: `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`

**Interfaces:**

- Consumes: reviewed parallel authorized producer and Core acceptance seams
  from Tasks 2-4.
- Produces: the corrected public
  `createFlowDocTextEngineUnifiedIncrementalEvidenceV2(authority, request,
  sourceMaterial, runtime)` and existing public Core request/acceptance names
  requiring the exact authority, with every known caller migrated.

- [ ] **Step 1: Write the atomic-cutover RED assertions**

Before switching implementation, update the four consumer groups to require:

```ts
const prepared = createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({
  previousRoot,
  change,
})
if (prepared.status !== "required") throw new Error("evidence request missing")

const produced = createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
  prepared.producerInvocationAuthority,
  prepared.request,
  prepared.sourceMaterial,
  runtime,
)
```

Acceptance must pass the same exact authority. Create a fresh request/material/
authority tuple for every Node/WASM comparison, replay row, and adversarial
case; one authority cannot drive two producer attempts.

Add a raw one-argument hostile call whose envelope getter throws and assert
constant `not-invoked` with zero getter/runtime observations.

- [ ] **Step 2: Run the complete consumer set and verify RED**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts
```

Expected: FAIL because the public producer and public Core acceptance still
use the temporary pre-cutover seams.

- [ ] **Step 3: Switch the public adapter entry atomically**

Make the existing exported function delegate only to the authorized producer:

```ts
export function createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
  authority: VNextTextBlockTransitionProducerInvocationAuthorityV2,
  request: VNextTextBlockTransitionEvidenceRequestV2,
  sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2,
  runtime: FlowDocUnifiedIncrementalEvidenceRuntimeV2,
): FlowDocUnifiedIncrementalEvidenceAuthorizedResultV2
```

Retain a runtime catch-all overload only to return constant `not-invoked`
without inspecting arguments. Delete `producerResponseLimit(...)`, the detached
ceiling bootstrap, raw post-limit fingerprint reads, and the old generic meter
path.

- [ ] **Step 4: Switch public Core acceptance atomically**

Keep the existing public function names, add required
`producerInvocationAuthority`, and delegate to the authorized internal
acceptance functions. Delete the request-keyed generic
`acceptanceEvaluators`, generic `evidence-response-nodes` acceptance meter,
mirrored descriptor-count formulas, and any fallback mint not derived from the
exact consumed terminal authority.

- [ ] **Step 5: Remove active legacy 5B-2 evidence rows and fixture paths**

Change the default 5B-2 test helper to the Task 1 authority policy. Remove the
old internal 5B-2 calibration policy if it has no remaining consumer. Active
5B-2 request/producer/acceptance work must use only the 15 reviewed evidence
rows. Legacy string members may remain in the V1 union only if a frozen V1
consumer still references them; they must not appear in the active 5B-2
policy, authority, or candidate ledger.

Update `producerWorkCeilings` tests to prove integrity mismatch blocking, not
execution selection. Threshold tests must vary exact internal policy or
workload through Core-owned fixtures, never rehash detached material to choose
a limit.

- [ ] **Step 6: Add package and call-site graph guards**

Assert Core public exports contain the authority type only at compile time and
do not expose these runtime names:

```ts
const forbidden = [
  "createVNextTextBlockTransitionProducerInvocationAuthorityInternalV2",
  "inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2",
  "consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2",
  "createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2",
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2",
] as const
```

Run a source scan for
`createFlowDocTextEngineUnifiedIncrementalEvidenceV2(` and classify every
result. The expected implementation caller is the function declaration plus
the four test consumer groups named in the File Responsibility Map. No
one-argument compatibility execution call may remain except the explicit
`not-invoked` hostile test.

- [ ] **Step 7: Run the complete Task 5 gate**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutTrivialAdmissionV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockFlowEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
```

Expected: all files pass; Node/WASM normalize equally; all current consumers
use exact one-shot authorities; V3 guards remain exact.

- [ ] **Step 8: Commit Task 5**

```powershell
git add -- packages/text-engine-rust-wasm/src/unifiedIncrementalEvidenceV2.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.ts src/layout/textBlockUnifiedLayoutEvidenceContractV2.ts src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts tests/helpers/textBlockUnifiedIncremental5b2.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
git commit -m "fix(layout): cut over exact producer authority"
```

---

## Spec Coverage Index

The approved 12 acceptance criteria map to this plan as follows:

1. authority before producer observation — Tasks 2-3;
2. Core-owned exact record/evaluator/ledger — Tasks 1-2;
3. detached ceilings cannot select execution — Tasks 2-3 and Task 5 removal;
4. distinct producer and acceptance owner rows — Tasks 1, 3, and 4;
5. zero-limit and threshold boundaries — Tasks 1-2 and Task 4 vertical proof;
6. factual nonclamped invalid/failure work — Tasks 3-4;
7. Node/WASM normalized equality — Tasks 3 and 5;
8. clone/stale/replay/cross-tuple/runtime/collision rejection — Tasks 2 and 4;
9. complete producer-consumer migration — Task 5;
10. frozen 5B-1/V3 exactness — every task gate, with final guards in Task 5;
11. no complete next-input/tree/suffix/scene/oracle traversal — Global
    Constraints plus Tasks 3-5 assertions; and
12. fresh review with no open Critical/Important finding — 5B-2A Review Stop.

Self-review found no approved criterion without an implementation task or
verification gate.

---

## 5B-2A Review Stop

Do not start original re-baseline Task 4 at the end of Task 5.

1. Run the complete Task 5 gate again from the unchanged committed tree.
2. Run `npm run check` once because the public producer call contract and Core
   acceptance boundary changed.
3. Run `rg -n "createFlowDocTextEngineUnifiedIncrementalEvidenceV2\\(" -g
   "!node_modules" -g "!target"` and record every classified caller.
4. Run `git diff --check 320715f..HEAD` and confirm `git status --short` is
   clean.
5. Request a fresh independent review against all 12 acceptance criteria in
   `docs/superpowers/specs/2026-08-03-producer-invocation-authority-boundary-design.md`.
6. Produce a separate Thai review ordered Critical, Important, Minor, then
   list PASS, FAIL/BLOCKER, RISK, UNKNOWN, changed files, behavior, tests,
   remaining risks, and intentionally unchanged scope.
7. Correct every Critical or Important finding through bounded fix rounds and
   rerun the affected task plus complete Task 5 gate.
8. Ask the user to review the final 5B-2A evidence before original re-baseline
   Task 4 is unblocked.

The checkpoint passes only when:

- all 12 design acceptance criteria have direct test/file evidence;
- the fresh review has no open Critical or Important finding;
- the complete Task 5 gate, full `npm run check`, type-check, and diff hygiene
  pass from the final committed tree;
- the worktree is clean;
- no implementation or fallback path uses detached payload ceilings as
  authority; and
- the user explicitly approves resuming original re-baseline Task 4.
