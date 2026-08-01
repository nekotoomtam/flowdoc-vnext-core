# Unified Incremental Root Transition 5B-1 Pre-Binding Source Envelope Plan Amendment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace only Tasks 8–10 of the approved Phase 5B-1 V3 corrective
plan so image-paint change binding can check source work before every read
without attempting to mint fallback before an exact validated change and
expected target binding exist.

**Architecture:** Treat bounded image-paint source binding as an acceptance
invariant of every active V3 Root. Complete Source State construction records
the already-computed tree height in its process-local prepared authority; the
shared complete Root V2 kernel verifies the four locked source rows against
that exact authority. A one-shot pre-binding authority guards lookup reads but
cannot create fallback. After binding, one task-specific evaluator owns all
remaining previsit decisions; source-envelope contradictions block, while
valid non-source exhaustion alone can produce one exact limit-fallback
authority. V3 is activated atomically only after these paths and the existing
line, Scene, and Delivery operations are bounded.

**Tech Stack:** TypeScript 6 ESM, Vitest 4, immutable TextBlock-specific
persistent trees, canonical JSON plus SHA-256 fingerprints, weak-key
process-local authority registries, and checked-in JSON fixture evidence.

## Global Execution Constraints

- Work only in
  `C:\Users\nekot\Documents\GitHub\flowdoc-vnext-core\.worktrees\phase-5b-unified-incremental-root-transition`.
  Do not modify the Editor or Backend repositories.
- This document supersedes only Tasks 8, 9, and 10 of
  `docs/superpowers/plans/2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective.md`.
  Tasks 1–7 remain completed historical execution evidence. Tasks 11–13 remain
  pending and unchanged after this amendment checkpoint.
- The approved design authority for this amendment is
  `docs/superpowers/specs/2026-07-31-unified-incremental-root-transition-5b-1-prebinding-source-envelope-amendment-design.md`
  at commit `bb91ec8`. Re-read it plus `AGENTS.md` before Task 8A.
- Revalidate branch, HEAD, working tree, and divergence from `origin/main`
  before implementation. Stop and report any unreviewed change.
- Do not push, merge, publish, activate production behavior, or touch V1
  compatibility structures.
- This amendment does not activate text/style, exclusion, authored-box,
  empty-block incremental behavior, Worker lifecycle, Editor apply, Backend
  persistence, data binding, Columns/Table, production, or V1 retirement.
- Keep runtime contract versions unchanged: Root V2 = 2, Persistent Scene V2
  = 2, Transition V1 = 1, Scene Delivery V2 = 2, and Source State V1 = 1.
  The V3 work-policy identity and calibration revision are separate axes.
- Keep the reviewed 13 locked numeric rows and V3 candidate fingerprint
  unchanged. The source rows remain `1/4/1`, `2/16/1`, `2/16/1`, and `8/32/1`.
- V2 stays the sole public active policy through Tasks 8A–9C. The private V3
  candidate may be passed only to explicitly internal test/prepare paths.
- Do not add tree height to Source State, Root, Scene, delivery payload,
  serialized canonical facts, or any fingerprint. The existing node `height`
  field is not authority; the construction-owned registry value is.
- Complete bootstrap and complete fallback must continue to call the one
  private `prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2`
  kernel. Do not fork bootstrap and fallback builders.
- Every countable operation checks before the read or mutation. Completed
  detailed work excludes the rejected visit; attempted work is completed plus
  one. No traversal continues after rejection.
- Pre-binding source exhaustion and post-binding exhaustion for any of the
  four source-envelope rows are invariant failures. They block with
  `previous-root-authority-mismatch` at `source-flow` and never mint fallback.
- Only a valid non-source post-binding evaluator failure can mint deterministic
  limit fallback. No generic caller-shaped limit tuple remains after Task 10A.
- `incrementalCandidateWork`, `completeFallbackWork`, and
  `completeOracleWork` stay separate. Payload size and wall clock never affect
  envelope acceptance, visit guards, or fallback choice.
- Use TDD per task: add one focused RED behavior, run and observe its expected
  failure, implement the smallest coherent change, rerun focused GREEN plus
  type-check, inspect the diff, and commit.
- Do not begin Task 11 until the user reviews the Task 10 checkpoint report.

## Locked Internal Interfaces

These names and ownership boundaries are part of this plan. They remain
private to `src/layout` and are not exported from `src/index.ts`.

```ts
// textBlockUnifiedLayoutSourceStateV1.ts
interface VNextTextBlockPreparedSourceEnvelopeFactsInternalV1 {
  readonly sourceItemCount: number
  readonly treeHeight: number
  readonly maximumLeafOccupancy: 8
  readonly deliberateItemResolutionCount: 1
}

function inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1(
  sourceState: VNextTextBlockUnifiedLayoutSourceStateV1,
): VNextTextBlockPreparedSourceEnvelopeFactsInternalV1 | null

// textBlockUnifiedLayoutWorkPolicyV1.ts
interface VNextTextBlockSourceEnvelopeLimitInternalV1 {
  readonly unit:
    | "source-items"
    | "source-lookup-nodes"
    | "source-path-copy-nodes"
    | "source-leaf-items"
  readonly attemptedWork: number
  readonly effectiveLimit: number
}

type VNextTextBlockSourceWorkEnvelopeEvaluationInternalV1 =
  | {
      readonly status: "accepted"
      readonly effectiveLimits: readonly VNextTextBlockSourceEnvelopeLimitInternalV1[]
    }
  | {
      readonly status: "rejected"
      readonly unit:
        | "source-items"
        | "source-lookup-nodes"
        | "source-path-copy-nodes"
        | "source-leaf-items"
      readonly attemptedWork: number
      readonly effectiveLimit: number
    }
  | { readonly status: "invalid-policy" }

function evaluateVNextTextBlockSourceWorkEnvelopeInternalV1(input: {
  readonly policy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly sourceItemCount: number
  readonly treeHeight: number
  readonly maximumLeafOccupancy: 8
  readonly deliberateItemResolutionCount: 1
}): VNextTextBlockSourceWorkEnvelopeEvaluationInternalV1

// textBlockUnifiedLayoutRootV2.ts
interface VNextTextBlockRootSourceEnvelopeAuthorityInternalV1 {
  readonly __rootSourceEnvelopeAuthorityOpaque: never
}

function getVNextTextBlockRootSourceEnvelopeAuthorityInternalV1(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockRootSourceEnvelopeAuthorityInternalV1 | null

// textBlockUnifiedLayoutTransitionEvidenceV1.ts
interface VNextTextBlockChangeBindingAttemptAuthorityInternalV1 {
  readonly __changeBindingAttemptAuthorityOpaque: never
}

type VNextTextBlockPreBindingVisitAttemptInternalV1 =
  | { readonly status: "accepted"; readonly completedWork: number }
  | {
      readonly status: "invariant-blocked"
      readonly completedWork: number
      readonly attemptedWork: number
      readonly effectiveLimit: number
    }

function evaluateNextVNextTextBlockPreBindingVisitInternalV1(input: {
  readonly attemptAuthority: VNextTextBlockChangeBindingAttemptAuthorityInternalV1
  readonly unit: "source-lookup-nodes" | "source-items"
  readonly completedWork: number
}): VNextTextBlockPreBindingVisitAttemptInternalV1

// textBlockUnifiedLayoutTransitionEvidenceV1.ts
interface VNextTextBlockLimitExceededAuthorityInternalV1 {
  readonly __limitExceededAuthorityOpaque: never
}

type VNextTextBlockStageVisitAttemptInternalV1 =
  | { readonly status: "accepted"; readonly attemptedWork: number }
  | {
      readonly status: "limit-exceeded"
      readonly attemptedWork: number
      readonly effectiveLimit: number
      readonly evaluatorAuthority: VNextTextBlockLimitExceededAuthorityInternalV1
    }
  | {
      readonly status: "invariant-blocked"
      readonly attemptedWork: number
      readonly effectiveLimit: number
    }

function evaluateNextVNextTextBlockStageVisitInternalV1(input: {
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly stage: VNextTextBlockUnifiedLayoutStageV1
  readonly unit: VNextTextBlockUnifiedLayoutStageUnitV1
  readonly completedWork: number
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}): VNextTextBlockStageVisitAttemptInternalV1
```

The source-envelope evaluator is a pure, TextBlock-specific policy function
so threshold tests can use literal facts without allocating a height-17 tree.
The Source State inspector accepts no caller facts: it reads only the exact
prepared-state registry. The Root authority is registered only for an exact
accepted Root graph and contains the exact Source State registry record and
four recomputed limits.

The pre-binding attempt record binds exact Root, original change, exact V3
policy, exact Root source-envelope authority, and exact completed change-gate
work. It contains no expected target binding and is not accepted by fallback.
Successful binding consumes it into the existing exact validated-change
record. The post-binding evaluator registry binds validated-change authority,
policy, stage/unit, limit, completed detailed work, canonical 21-row ledger,
and attempted work. It issues an opaque fallback-capable authority only for
non-source rows.

---

## Checkpoint 5B-1C-2A: Source Envelope Foundation

### Task 8A: Record Prepared Source Height Without Changing Canonical Identity

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`

- [ ] **Step 1: Add RED prepared-height tests.** Build leaf and multi-height
  Source States and assert the internal inspector reports canonical tree
  height as leaf = 1 and branch = child maximum + 1. Exercise the pure empty
  calibration fact as height 0 without claiming empty-block capability.
- [ ] **Step 2: Add RED identity-parity tests.** Snapshot Source State, root
  node, summary, and Root fingerprints before/after the prepared-height path;
  assert no canonical field or serialized payload gains envelope facts.
- [ ] **Step 3: Add RED authority adversaries.** Cloned, detached,
  reconstructed, accessor-bearing, and forced-fingerprint-collision Source
  States return `null`; mutating visible `root.height` in a detached clone
  cannot alter the registered fact.
- [ ] **Step 4: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
```

- [ ] **Step 5: Extend the existing `preparedStates` record.** Compute
  `treeHeight` during `buildRoot`/complete construction, store leaf = 1 and
  branch = existing node height + 1, and retain the same value during image
  paint path-copy preparation. Do not derive authority later by trusting a
  detached node field.
- [ ] **Step 6: Implement the exact prepared-facts inspector.** Return a new
  frozen facts object only when the exact Source State key exists in
  `preparedStates`; use policy constant 8 and deliberate resolution count 1.
- [ ] **Step 7: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 8: Commit.**

```text
git add src/layout/textBlockUnifiedLayoutSourceStateV1.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "refactor(layout): retain prepared source envelope facts"
```

### Task 8B: Evaluate And Enforce The V3 Source Envelope In The Shared Kernel

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionContractV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutRootV2.ts`
- Modify: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutRootV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutFallbackV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`

- [ ] **Step 1: Add RED pure-envelope threshold tests.** For each of the four
  source rows, assert `limit - 1` and `limit` accept and `limit + 1` rejects
  with the exact unit, attempted work, and recomputed effective limit. Cover
  absolute height ceiling 16 separately from the relative/effective checks.
- [ ] **Step 2: Add RED policy adversaries.** Wrong policy object, V2 policy,
  cloned V3 facts, missing/duplicate/reordered source rows, unsafe integers,
  and altered row limits return `invalid-policy` and never throw.
- [ ] **Step 3: Add RED shared-kernel rejection tests.** Use a private
  test-only prepared-authority seam, unavailable from `src/index.ts`, to bind a
  literal one-over envelope to an otherwise valid exact prepared Source State.
  Expect `source-work-envelope-exceeded` at `source-flow`, before flow/line/
  Scene construction observers and before any Root graph registration. The
  seam must not accept detached/cloned Source States and must be absent from
  all public production wrappers.
- [ ] **Step 4: Add RED bootstrap/fallback parity and retry tests.** Both
  construction kinds call the same envelope-verifier observer. A rejected
  complete fallback preserves its exact request; corrected complete material
  succeeds; no partial Source/Root/Scene authority becomes inspectable.
- [ ] **Step 5: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
```

- [ ] **Step 6: Add the issue code and pure evaluator.** Add only
  `source-work-envelope-exceeded` to the Transition V1 issue-code union. Use
  `evaluateVNextTextBlockStageWorkLimitInternalV1` with
  `previousSummaryBase = sourceItemCount` and delta 1 for all four rows, then
  apply the explicit height ceiling 16.
- [ ] **Step 7: Enforce immediately after complete Source State preparation.**
  The shared complete kernel obtains exact prepared facts by Source State
  registry lookup. Under private V3 it rejects before building downstream
  children. Under still-active public V2 it preserves current behavior until
  Task 10's atomic switch.
- [ ] **Step 8: Register Root envelope authority atomically.** Store it only
  after successful complete Root graph registration. For an image-paint
  incremental Root, recompute from the exact prepared next Source State,
  require equality with the previous Root envelope facts, and register only
  with the new Root graph. No inspector accepts a candidate Root.
- [ ] **Step 9: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 10: Commit.**

```text
git add src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedLayoutTransitionContractV1.ts src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockUnifiedLayoutRootV2.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "fix(layout): enforce v3 source work envelope"
```

### Task 8C: Guard Change Binding Before Every Source Read

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`

- [ ] **Step 1: Add RED attempt-authority tests.** It is created only after
  exact change shape, registered Root, exact V3 policy, target ids, and stale
  fingerprint checks pass. Wrong/clone Root, change, policy, or envelope
  authority blocks without registering an attempt.
- [ ] **Step 2: Add RED previsit tests.** At limit - 1 and limit, lookup/item
  reads complete. At limit + 1, the rejected node/item observer is not called,
  completed detail stays at limit, attempted work equals limit + 1, and the
  issue is `previous-root-authority-mismatch` at `source-flow`.
- [ ] **Step 3: Add RED capability-boundary tests.** The pre-binding attempt
  cannot be passed to the fallback boundary, cloned, replayed, inspected as a
  validated change, or used after successful consumption.
- [ ] **Step 4: Add RED accepted-Root proof.** Exercise every active image
  paint fixture at the reviewed V3 policy and prove binding never naturally
  exhausts and never repeats source lookup in transition or fallback prep.
- [ ] **Step 5: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
```

- [ ] **Step 6: Register and thread the opaque attempt.** Create it inside
  `bindVNextTextBlockUnifiedLayoutChangeInternalV1` after all preconditions,
  pass it into image-paint source lookup, and make lookup check the exact
  source lookup-node and deliberate item-resolution budgets before each read.
- [ ] **Step 7: Consume into validated-change authority.** On success delete
  the attempt record, retain exact lookup/item work and the exact source-item
  authority in the validated-change records, and ensure fallback prep never
  performs lookup. On invariant failure delete the attempt and block.
- [ ] **Step 8: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 9: Commit and report checkpoint 5B-1C-2A.**

```text
git add src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "fix(layout): guard exact source binding visits"
```

Report canonical-identity parity, envelope thresholds, shared-kernel rejection,
request retry, previsit observer results, and one-shot attempt lifecycle.

---

## Checkpoint 5B-1C-2B: Post-Binding Operation Limits

### Task 9A: Create The Exact Post-Binding Stage-Visit Evaluator

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`

- [ ] **Step 1: Add RED evaluator threshold tests.** Exact limit permits the
  next operation; limit + 1 returns completed detail at limit and attempted
  work at limit + 1. The canonical ledger has all 21 rows in policy order.
- [ ] **Step 2: Add RED authority-reconciliation tests.** Modified stage/unit,
  Root, change, policy, completed detail, canonical ledger, attempted count,
  duplicate invocation, clone, and non-evaluator input cannot obtain or reuse
  a registered authority.
- [ ] **Step 3: Add RED source-row exclusion tests.** All four source units
  return `invariant-blocked`, never `limit-exceeded` with an authority, even
  when literal test work exceeds the accepted envelope.
- [ ] **Step 4: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
```

- [ ] **Step 5: Implement the private evaluator registry.** Resolve the exact
  validated-change authority, recompute the policy row and effective limit,
  reconcile detailed work with the operation-owned canonical ledger, and mint
  only on the rejected next non-source visit.
- [ ] **Step 6: Remove end-of-pipeline decision ownership.** Keep a temporary
  assertion-only final ledger audit in `textBlockUnifiedLayoutTransitionV1.ts`;
  it may detect an internal mismatch but cannot create a fallback tuple.
- [ ] **Step 7: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 8: Commit.**

```text
git add src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "refactor(layout): own exact postbinding visit limits"
```

### Task 9B: Bound Source Path-Copy And Line-Cover Operations

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineContractV1.ts`
- Modify: `src/layout/textBlockPersistentLayoutLineTreeV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- Modify: `tests/textBlockPersistentLayoutLineTreeV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`

- [ ] **Step 1: Add RED Source transition previsit tests.** Check path-copy
  nodes and changed-leaf item slots before each operation. Normal image paint
  stays inside the accepted Root envelope; forced contradiction blocks with
  no fallback authority and does not read/copy the rejected entry.
- [ ] **Step 2: Add RED line-cover tests.** For selected exact subtrees and
  line-tree lookup nodes, cover limit - 1, limit, limit + 1, exact completed
  work, rejected attempted work, and no next-sibling observation.
- [ ] **Step 3: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts
```

- [ ] **Step 4: Thread evaluator inputs into the owners.** Source State and
  line-tree functions receive the exact validated change plus accumulated
  operation-owned work, call the evaluator before the operation, and return
  either prepared facts, invariant block, or exact evaluator authority.
- [ ] **Step 5: Preserve aggregation-only orchestration.** Transition V1 may
  combine exact results but may not recompute counts from result shapes or
  manufacture a limit reason.
- [ ] **Step 6: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 7: Commit.**

```text
git add src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockPersistentLayoutLineContractV1.ts src/layout/textBlockPersistentLayoutLineTreeV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "fix(layout): bound source and line transition visits"
```

### Task 9C: Bound Scene And Delivery Operations At Their Owners

**Files:**

- Modify: `src/layout/textBlockPersistentSceneContractV2.ts`
- Modify: `src/layout/textBlockPersistentSceneV2.ts`
- Modify: `src/layout/textBlockSceneDeliveryContractV2.ts`
- Modify: `src/layout/textBlockSceneDeliveryV2.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockPersistentSceneV2.test.ts`
- Modify: `tests/textBlockSceneDeliveryV2.test.ts`
- Modify: `tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`

- [ ] **Step 1: Add RED Scene tests.** Independently cover line lookup, Scene
  lookup, copied nodes, and replacement chunks at threshold - 1, threshold,
  and threshold + 1. Rejected siblings/chunks are not observed and partial
  candidates are discarded.
- [ ] **Step 2: Add RED Delivery tests.** Independently cover Scene lookup,
  delivery operations, and canonical retain-cover nodes in construction and
  the one internal verification. No retry occurs after exhaustion.
- [ ] **Step 3: Add RED propagation tests.** Scene transition returns the exact
  evaluator authority unchanged. Transition V1 neither translates it into a
  generic issue nor recomputes work from `operations.length` or summaries.
- [ ] **Step 4: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
```

- [ ] **Step 5: Implement previsit checks in Scene owners.** Return exact
  completed detailed work and the untouched evaluator authority at the first
  rejected visit.
- [ ] **Step 6: Implement previsit checks in Delivery owners.** Bound both
  construction and verification under the same operation attempt; do not
  restart counts or verify twice.
- [ ] **Step 7: Run combined GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 8: Commit and report checkpoint 5B-1C-2B.**

```text
git add src/layout/textBlockPersistentSceneContractV2.ts src/layout/textBlockPersistentSceneV2.ts src/layout/textBlockSceneDeliveryContractV2.ts src/layout/textBlockSceneDeliveryV2.ts src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "fix(layout): bound scene and delivery transition visits"
```

Report each stage/unit threshold, observer proof that rejected work did not
occur, exact authority propagation, and absence of partial candidate reuse.

---

## Checkpoint 5B-1C-2C: Limit Fallback And Atomic V3 Activation

### Task 10A: Derive Limit Fallback Only From Exact Evaluator Authority

**Files:**

- Modify: `src/layout/textBlockUnifiedLayoutFallbackV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionV1.ts`
- Modify: `tests/textBlockUnifiedLayoutFallbackV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutAdversarialV2.test.ts`

- [ ] **Step 1: Add RED derivation tests.** The fallback boundary accepts only
  one exact unconsumed `VNextTextBlockLimitExceededAuthorityInternalV1` and
  derives mode, reason, stage/unit, effective limit, attempted work, completed
  detail, canonical ledger, exact target binding, and policy from registries.
- [ ] **Step 2: Add RED rejection tests.** Raw, cloned, replayed, foreign,
  modified, wrong-Root, wrong-change, wrong-policy, pre-binding, source-row,
  proof-failure-as-limit, and non-evaluator objects fail closed.
- [ ] **Step 3: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
```

- [ ] **Step 4: Replace the temporary bridge.** Delete
  `mintVNextTextBlockUnifiedLayoutLimitFallbackAttemptInternalV1`,
  `limitReasonMatchesAttempt`, transition-created limit tuples, and the final
  work scan as a decision path. Transfer/consume the evaluator registry record
  directly into the existing fallback-attempt registry.
- [ ] **Step 5: Preserve proof fallback separation.** Retain-proof failure
  authority continues to produce only `incremental-proof-failed`; it cannot be
  converted to deterministic limit fallback or mixed with a partial candidate.
- [ ] **Step 6: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
npm run type-check
```

- [ ] **Step 7: Commit.**

```text
git add src/layout/textBlockUnifiedLayoutFallbackV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts
git commit -m "fix(layout): derive limit fallback from evaluator authority"
```

### Task 10B: Atomically Activate V3 And Enforce Complete-Root Envelope

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
  Object.freeze({
    ...policy5b1V3Facts,
    fingerprint: fingerprint(policy5b1V3Facts),
  })
```

- [ ] **Step 1: Add RED activation tests.** Public wrappers and helpers use
  exact V3; Root validation requires exactly 21 ordered rows; old V2 Roots
  fail with `invalid-work-policy`; no public V2 constant remains.
- [ ] **Step 2: Add RED complete-kernel tests.** Bootstrap and fallback use the
  same kernel and exact envelope verifier, differ only by construction envelope
  and provenance, and produce equivalent renderer material for identical
  independent complete input.
- [ ] **Step 3: Add RED atomicity and request-lifecycle tests.** Envelope
  rejection exposes no candidate authority and does not consume fallback
  request; corrected input succeeds; successful replay fails; registration
  failure exposes no partial Root.
- [ ] **Step 4: Add RED identity and policy-axis tests.** Activating V3 changes
  the work-policy dependency identity as intended but does not add source
  height to renderer semantic facts, Scene identity, or delivery payload.
- [ ] **Step 5: Add RED policy-input independence tests.** Vary payload-byte
  observations and run the same authority-backed transition under fake elapsed
  time/clock values; envelope acceptance, visit results, fallback selection,
  and active renderer material remain identical.
- [ ] **Step 6: Run RED.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
```

- [ ] **Step 7: Promote candidate without changing rows.** Rename the reviewed
  private candidate to active V3, preserve its exact fingerprint, make Root
  policy validation exhaustive over 21 rows, and switch evidence, transition,
  fallback, public constructors, helpers, and manifest in one patch.
- [ ] **Step 8: Activate envelope registration on every accepted Root.** Both
  complete construction kinds verify before downstream construction and
  register only after graph commit. Incremental image-paint Roots inherit only
  after exact prepared-fact parity; no V3 Root exists without the authority.
- [ ] **Step 9: Search for accidental active V2 references.** Historical plan
  and frozen regression evidence may remain; runtime/public/helper references
  may not.

```text
rg -n "5b-1-v2|WORK_POLICY_5B1_V2|V3_CANDIDATE" src tests fixtures --glob "!fixtures/**/historical*"
```

- [ ] **Step 10: Run GREEN and type-check.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
```

- [ ] **Step 11: Commit.**

```text
git add src/layout/textBlockUnifiedLayoutWorkPolicyV1.ts src/layout/textBlockUnifiedLayoutRootV2.ts src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts src/layout/textBlockUnifiedLayoutTransitionV1.ts src/layout/textBlockUnifiedLayoutFallbackV1.ts src/index.ts tests/helpers/textBlockUnifiedLayoutRootV2.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json
git commit -m "feat(layout): activate source-bounded phase 5b-1 v3"
```

### Task 10C: Run The Fresh 5B-1C-2 Gate And Stop

**Files:**

- Create: `.superpowers/sdd/2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective/source-envelope-verification.md`
- Modify only if evidence requires correction:
  `fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json`

- [ ] **Step 1: Run the complete focused gate fresh after the last code
  change.**

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
npm run type-check
git diff --check
git status --short
```

- [ ] **Step 2: Run targeted authority searches.** Confirm no public candidate,
  no temporary limit bridge, no caller-shaped limit tuple, no second complete
  builder, and no canonical source-height field.

```text
rg -n "V3_CANDIDATE|mintVNextTextBlockUnifiedLayoutLimitFallbackAttemptInternalV1|limitReasonMatchesAttempt|treeHeight|source-work-envelope-exceeded" src tests fixtures
rg -n "prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2" src/layout
```

- [ ] **Step 3: Record evidence.** Include exact commands, test-file/test
  counts, type-check result, active policy id/fingerprint, four source-envelope
  threshold results, bootstrap/fallback shared-kernel observations, request
  retry/replay results, previsit rejected-read observations, source-row no-
  fallback proof, and non-source one-shot fallback proof.
- [ ] **Step 4: Commit evidence if the gate is green.**

```text
git add .superpowers/sdd/2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective/source-envelope-verification.md fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json
git commit -m "test(layout): verify v3 source envelope activation"
```

- [ ] **Step 5: Stop for user review.** Report facts, inferences, residual
  risks, and recommendations separately. Do not begin Task 11.

## Self-Review Checklist For This Amendment

- [x] Every requirement in design-amendment Sections 2–9 maps to at least one
  task and one verification assertion.
- [x] No task adds Source height or payload estimates to canonical identity.
- [x] No pre-binding or source-envelope contradiction can mint fallback.
- [x] Only exact non-source evaluator authority can create deterministic limit
  fallback, and it is one-shot.
- [x] Bootstrap/fallback share the one complete Root kernel and verifier.
- [x] V2 remains public until Task 10B and V3 changes all active boundaries
  atomically.
- [x] Commands name real files and no placeholder, `TBD`, ellipsis, or generic
  framework task remains.
- [x] Tasks 11–13 of the parent plan remain unmodified and unstarted.
