# Source Commit Transaction Seam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the callback-based Phase 5B-2 Plan A Source commit handshake with one exact, process-local, one-way Source Commit Transaction whose live boundary has no remaining fallible or externally executable work.

**Architecture:** A new private leaf module owns only transaction phase, exact ticket/plan bindings, active protection indexes, mint rollback, and consumed tombstones. CandidateWork, SourceSidecars, SourceState, and SourceAuthority retain their permanent state and expose one fixed prepare/apply plan pair each; SourceAuthority coordinates preparation and returns the exact Plan A accepted object precreated before the transaction becomes live.

**Tech Stack:** TypeScript, process-local `WeakMap`/`WeakSet` authority registries, Vitest, pnpm/npm repository scripts, Git worktree isolation.

## Global Constraints

- Governed by `docs/superpowers/specs/2026-08-10-source-commit-transaction-seam-design.md`; interface names or responsibility moves require a spec amendment and user review before implementation.
- Preserve the parent Plan A contract in `docs/superpowers/plans/2026-08-09-unified-incremental-root-transition-5b2-plan-a-source-authority.md`.
- Core-only and process-local; do not modify Editor, Backend, worker protocols, scheduling, cancellation, publication, Root publication, or production activation.
- The new transaction module is Source-specific private infrastructure, not a generic transaction framework.
- The transaction module may runtime-import no participant module. Imports from CandidateWork, SourceSidecars, SourceState, and SourceAuthority must be `import type` only.
- Participant permanent state remains owner-local. The transaction module owns only transaction phase, exact bindings, active protection, rollback, one-shot history, and the consumed tombstone.
- The only state order is `absent → preparing detached → minting → live → committing → consumed`.
- `live` may be written only after every fallible validation, duplicate check, conflict check, allocation, object construction, freeze, plan attachment, and protection-index installation succeeds.
- Before `live`, failure returns `null`/`false`, removes every transaction-owned installation, preserves participant permanent state, leaves preconditions unconsumed, and permits exact retry.
- After `live`, the path is one-way and may use only plain process-local registry operations. It must not call a callback, getter, Proxy-visible payload read, observer, logger, iterator, traversal, allocator, `Object.freeze`, spread construction, duplicate check, or operation returning `false`/`null`.
- Fixed apply order is CandidateWork → SourceSidecars → SourceState → SourceAuthority Stage. No dynamic participant array or caller-selected phase exists.
- The exact `sidecarRegistrationPreconditionAuthority` is also the Source access reservation key. No second caller-chosen access key exists.
- `producingStageAuthority` must be exact identity `evidence ?? preflight`.
- Compatibility Source acceptance remains owned by TransitionSource and does not participate in this transaction.
- The Plan A accepted type and Plan A result record move to SourceAuthority. SourceAuthority must not runtime-import TransitionSource.
- Do not change `src/index.ts`, canonical JSON, fingerprints, public transition contracts, complete fallback, Root V2 publication, Scene, Delivery, or the calibrated ten-row owner topology.
- Preserve the final factual Plan A work calibration from the current Task 7 tree: `1, 2, 1, 1, 7, 49, 38, 2, 6, 33` in canonical owner-row order.
- Preserve the nine existing uncommitted Task 7 files and the exact stash object `c711c1135a3e3808d6b0da042c6d2eadec484431`; do not push, merge, pop/apply/drop/create a stash, or alter unrelated work.
- Use strict TDD for each task: behavior RED, minimum GREEN, focused gate, type-check, diff-check, then review.
- No implementation begins until the user reviews and approves this plan.
- All terminology in implementation reports must link to both glossaries:
  - `docs/superpowers/specs/2026-08-10-source-commit-transaction-glossary.md`
  - `docs/superpowers/specs/2026-08-10-source-commit-transaction-glossary-th.md`

Normative terms in this plan use the glossary identifiers: Source Commit Transaction (`SCT-T01`), Detached Ticket Identity (`SCT-T02`), Live Transaction Ticket (`SCT-T03`), Active Transaction Index (`SCT-T05`), Consumed Tombstone (`SCT-T08`), Detached Commit Plan (`SCT-T09`), Transaction Control State (`SCT-T18`), Reservation (`SCT-T19`), Transaction Protection (`SCT-T20`), Mint (`SCT-T24`), Live Boundary (`SCT-T25`), Apply (`SCT-T26`), Commit (`SCT-T28`), Mint Rollback (`SCT-T34`), No-Fail Tail (`SCT-T35`), Plain Internal Operation (`SCT-T36`), Exact Identity (`SCT-T37`), Alias Normalization (`SCT-T40`), Re-entrancy (`SCT-T41`), Invariant Rejection (`SCT-T44`), Ghost Reservation (`SCT-T45`), Fault Position (`SCT-T46`), and Retryable Exact Tuple (`SCT-T47`).

---

## Baseline And Commit Policy

The approved-plan parent is branch `phase-5b-unified-incremental-root-transition` at specification HEAD `17854b751857508dbb778460e3396e23e4f46cba`, with nine intentional Task 7 modifications already present. After user approval, commit this plan alone as `docs: plan source commit transaction seam`; that docs-only commit becomes the implementation baseline. The nine Task 7 changes remain unstaged. They form one coupled, not-yet-committed checkpoint: SourceSidecars tests depend on the current Physical Index and Style Refcount owner-boundary work.

For reproducibility, Tasks 1–6 end in verification and review checkpoints but do **not** make partial commits from the pre-existing dirty files. After all transaction tasks and fresh reviews pass, Task 6 creates one coherent implementation commit containing the preserved Task 7 work plus this transaction closure. Task 7 then creates a separate documentation-only commit for the Thai review. This is the deliberate exception to the usual per-task commit cadence; partial commits would create intermediate revisions that cannot reproduce their own tests.

Before every task:

```powershell
git status --short
git log -1 --oneline
git stash list --format='%H %gd' | Select-Object -First 1
```

Expected baseline facts:

```text
implementation baseline parent: 17854b7 docs: close source commit result boundary
implementation baseline HEAD: docs: plan source commit transaction seam
tracked dirty files: exactly the known nine Task 7 paths before new work
stash top: c711c1135a3e3808d6b0da042c6d2eadec484431 stash@{0}
```

If branch, HEAD, dirty paths, staged state, or stash identity differs, stop and report the difference before editing.

After each task, append the exact RED/GREEN commands, observed counts, dirty-path set, and open findings to `.superpowers/sdd/2026-08-09-unified-incremental-root-transition-5b2-plan-a-source-authority/task-7-fix1-report.md`. That ignored working report must link the normative glossary, use `SCT-Txx` identifiers, and remain outside implementation commits.

## File Responsibility Map

### New production file

- `src/layout/textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.ts`
  - Owns detached/live ticket records, four fixed plan slots, mint phase, active protection indexes, rollback journal, begin/finish ordering, one-shot precondition history, and consumed tombstones.
  - Contains no permanent participant data and no participant runtime import.

### New test file

- `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`
  - Proves the transaction state machine, exact plan/ticket bindings, all mint rollback positions, retryability, isolation, replay rejection, protection aliases, no-retention tombstone, and module dependency boundary.

### Existing production files modified at owned seams

- `src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts`
  - Converts Source CandidateWork publication from ticket callbacks/resolvers to a detached publication plan and infallible apply.
- `src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts`
  - Converts Source sidecar/access/pair registration to a detached sidecar plan and infallible apply; removes captured access-commit closures.
- `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
  - Converts Source candidate/access reservation publication to a detached Source candidate plan; removes transaction-lifecycle shadow maps and captured commit behavior.
- `src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts`
  - Becomes the Source commit facade and owner of the precreated Plan A accepted object/result record; removes the old callback-ticket coordinator.
- `src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts`
  - Replaces the four-step Plan A tail with prepare + exact one-way commit; keeps compatibility result construction and registry local.
- `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts`
  - Preserve the existing Task 7 exact producer tuple changes without adding Source transaction behavior.
- `src/layout/textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.ts`
  - Preserve the existing Task 7 owner-boundary work without adding Source transaction behavior.
- `src/layout/textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.ts`
  - Preserve the existing Task 7 owner-boundary work without adding Source transaction behavior.

### Existing tests modified

- `tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts`
  - CandidateWork detached-plan exactness and retained foundation lane.
- `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
  - Sidecar/Source plan integration, fault injection, aliases, post-live plain-operation proof, three-checkpoint chain, and preserved owner calibration.
- `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
  - Source reservation/candidate cleanup, aliases, and retained compatibility behavior.
- `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`
  - Exact Plan A result identity, semantic/style/geometry families, zero-emission deletion, and compatibility split.
- `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`
  - Proves the zero-Source CandidateWork foundation lane remains independent of the Source transaction.

### Final documentation

- Create `docs/superpowers/plans/2026-08-09-unified-incremental-root-transition-5b2-plan-a-review-th.md`
  - Thai evidence-backed review with glossary links, exact commands/counts, resolved risks, residual risks, and closure recommendation.

### Explicitly unchanged

- `src/index.ts`
- Root V2, Persistent Scene V2, line, spatial, delivery, fallback, oracle, and public activation modules
- Canonical fingerprints and canonical JSON contracts
- Editor and Backend repositories

---

### Task 1: Build The Fixed Private Source Commit Transaction Leaf

**Files:**
- Create: `src/layout/textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`

**Interfaces:**
- Consumes: only opaque participant authority types through `import type`.
- Produces: all normative ticket/plan interfaces and the exact `createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1`, four named attachment functions, `mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1`, `beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1`, and `finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1` functions from design Section 10.
- The four fixed attachment names and mint name are exact and may not be shortened behind a generic helper:

```ts
export function attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  input: Readonly<{
    detachedTicket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority: VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
  }>,
): boolean

export function attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
  input: Readonly<{
    detachedTicket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
  }>,
): boolean

export function attachVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1(
  input: Readonly<{
    detachedTicket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority: VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
  }>,
): boolean

export function attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  input: Readonly<{
    detachedTicket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority: VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
  }>,
): boolean

export function mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
  input: Readonly<{
    detachedTicket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    candidateWorkPlanAuthority: VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
    sidecarPlanAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
    sourcePlanAuthority: VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
    stagePlanAuthority: VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
    candidateWorkPublicationPreconditionAuthority: VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
    sidecarRegistrationPreconditionAuthority: VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
    candidateWorkMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    nextSidecarCandidateAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    sourcePathCopyCandidateAuthority: VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
  }>,
): VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 | null
```
- Produces task-specific protection queries for the participant owners:

```ts
export function isVNextTextBlockUnifiedLayoutSourceCommitCandidateWorkMeterProtectedInternalV1(
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
): boolean

export function isVNextTextBlockUnifiedLayoutSourceCommitSidecarCandidateProtectedInternalV1(
  authority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
): boolean

export function isVNextTextBlockUnifiedLayoutSourceCommitSourceCandidateProtectedInternalV1(
  authority: VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1,
): boolean

export function isVNextTextBlockUnifiedLayoutSourceCommitAccessReservationProtectedInternalV1(
  authority: VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1,
): boolean
```

- Produces test-only deterministic fault selection, not a callback:

```ts
export type VNextTextBlockUnifiedLayoutSourceCommitMintFaultPointForTestInternalV1 =
  | "after-detached-minting-state"
  | "after-candidate-work-precondition-index"
  | "after-sidecar-precondition-index"
  | "after-candidate-work-meter-index"
  | "after-sidecar-candidate-index"
  | "after-source-candidate-index"
  | "after-access-reservation-index"
  | "before-live-write"

export function setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1(
  point: VNextTextBlockUnifiedLayoutSourceCommitMintFaultPointForTestInternalV1 | null,
): void

export function inspectVNextTextBlockUnifiedLayoutSourceCommitForTestInternalV1(
  identity: unknown,
): Readonly<{
  phase: "absent" | "preparing-detached" | "minting" | "live" | "committing" | "consumed"
  readonly attachedPlanCount: number
  readonly activeProtectionCount: number
}>
```

- The test inspector may return only phase/count/boolean facts. It must not expose ticket tuples, participant payloads, retained roots, meters, authorities, or callbacks.
- The new test file defines local `createExactSourceCommitTransactionFixtureForTest()`, `reprepareExactSourceCommitTransactionFixtureForTest(participantTuple)`, and `mintExactTupleForTest()` helpers. A retry reuses the same exact candidate/precondition/meter/access tuple but creates a fresh detached ticket and fresh owner plans because failed mint deletes the old detached record. Production exports are always called by their normative names.

- [ ] **Step 1: Write the state-machine RED tests**

Add tests that construct exact frozen dummy authorities and assert:

```ts
const exactFixture = createExactSourceCommitTransactionFixtureForTest()
const detached = createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
expect(() => beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
  detached as never,
)).toThrow("source commit ticket invariant")
expect(attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
  detachedTicket: detached,
  planAuthority: candidatePlan,
}))
  .toBe(true)
expect(attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
  detachedTicket: detached,
  planAuthority: candidatePlan,
}))
  .toBe(false)
expect(mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1({
  candidateWorkPlanAuthority: exactFixture.candidateWorkPlanAuthority,
  sidecarPlanAuthority: exactFixture.sidecarPlanAuthority,
  sourcePlanAuthority: exactFixture.sourcePlanAuthority,
} as never)).toBeNull()
expect(mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1({
  ...exactFixture.mintInput,
  candidateWorkPlanAuthority: Object.freeze({}) as never,
})).toBeNull()
```

Cover missing plan, duplicate slot, cross-ticket plan, cloned authority, forced fingerprint collision, replayed detached ticket, duplicate live ticket, and exact precondition mismatch.

- [ ] **Step 2: Run the state-machine RED**

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts -t "binds one exact four-plan Source commit tuple"
```

Expected: FAIL because the transaction module/API does not exist.

- [ ] **Step 3: Implement detached records and fixed plan slots**

Use private `WeakMap` records keyed by exact opaque objects. The internal record shape is fixed:

```ts
type Phase = "preparing-detached" | "minting" | "live" | "committing"

interface DetachedRecord {
  phase: "preparing-detached" | "minting"
  candidateWorkPlanAuthority: CandidatePlanAuthority | null
  sidecarPlanAuthority: SidecarPlanAuthority | null
  sourcePlanAuthority: SourcePlanAuthority | null
  stagePlanAuthority: StagePlanAuthority | null
}

interface LiveRecord {
  phase: "live" | "committing"
  readonly candidateWorkPlanAuthority: CandidatePlanAuthority
  readonly sidecarPlanAuthority: SidecarPlanAuthority
  readonly sourcePlanAuthority: SourcePlanAuthority
  readonly stagePlanAuthority: StagePlanAuthority
}
```

Implement four separate attachment functions. Do not implement a generic slot function, participant array, dynamic name, callback, or hook.

- [ ] **Step 4: Write and run the eight-position rollback RED matrix**

For every fault point, use a fresh exact tuple and assert:

```ts
expect(mintExactTupleForTest(exactFixture)).toBeNull()
expect(inspectVNextTextBlockUnifiedLayoutSourceCommitForTestInternalV1(detached))
  .toEqual({
    phase: "absent",
    attachedPlanCount: 0,
    activeProtectionCount: 0,
  })
expect(isVNextTextBlockUnifiedLayoutSourceCommitCandidateWorkMeterProtectedInternalV1(meter)).toBe(false)
expect(isVNextTextBlockUnifiedLayoutSourceCommitSidecarCandidateProtectedInternalV1(sidecarCandidate)).toBe(false)
expect(isVNextTextBlockUnifiedLayoutSourceCommitSourceCandidateProtectedInternalV1(sourceCandidate)).toBe(false)
expect(isVNextTextBlockUnifiedLayoutSourceCommitAccessReservationProtectedInternalV1(sidecarPrecondition)).toBe(false)
setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1(null)
const retry = reprepareExactSourceCommitTransactionFixtureForTest(
  exactFixture.participantTuple,
)
expect(mintExactTupleForTest(retry)).not.toBeNull()
```

In the same test, keep a second unrelated transaction live and assert each injected rollback leaves it unchanged.

Install each fault enum inside `try/finally`. A second non-null fault installation before reset must throw an invariant error, and `finally` must call `setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1(null)`. No fault selector is read after the final live write.

Run:

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts -t "rolls back every mint installation position"
```

Expected: FAIL until the journal is complete.

- [ ] **Step 5: Implement mint journal, live boundary, begin, finish, and tombstone**

Install the exact fixed indexes in a deterministic sequence. Keep local boolean installation facts and unwind them in exact reverse order on every pre-live failure. Write the live record last.

`beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1` must atomically change `live → committing` and return the exact four-plan bundle. Replay or wrong ticket throws an internal invariant error; it does not return `null`.

`finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1` must remove the live graph and install only a consumed `WeakSet` tombstone. It must retain no plan, participant, Root, Source, meter, sidecar, or result reference.

- [ ] **Step 6: Verify no participant runtime dependency**

Run a verification scan outside Vitest; do not add a source-text unit test. The unit suite proves behavior, while this scan classifies dependency direction directly:

```powershell
Select-String -Path src/layout/textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.ts -Pattern '^import (?!type\b).*textBlockUnifiedLayout(CandidateWorkAuthority|SourceSidecars|SourceState|SourceAuthority)'
```

Expected: no match. Separately scan exported names and classify every match; no exported generic registrar, unprotect operation, callback observer, or tuple-payload inspector may exist.

- [ ] **Step 7: Run the Task 1 gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts
npm run type-check
git diff --check
```

Expected: all pass. Record counts and exact dirty paths; do not commit.

---

### Task 2: Convert CandidateWork Publication Into A Detached Plan

**Files:**
- Modify: `src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts`
- Modify: `tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`

**Interfaces:**
- Consumes: detached ticket and CandidateWork plan authority from Task 1.
- Produces:

```ts
export interface VNextTextBlockUnifiedLayoutPreparedCandidateWorkPublicationPlanInternalV1 {
  readonly planAuthority:
    VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
  readonly candidateWorkAuthority:
    VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
}

export function prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  input: Readonly<{
    detachedTicket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    publicationPreconditionAuthority:
      VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
    candidateWorkMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    completedSourceEmissionCount: number
  }>,
): VNextTextBlockUnifiedLayoutPreparedCandidateWorkPublicationPlanInternalV1 | null

export function applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  planAuthority:
    VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1,
): VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
```

- The prepare record owns the exact precreated CandidateWork authority, frozen receipt snapshot, compatibility work, meter publication facts, and exact one-shot precondition binding.
- The prepared bundle projects the exact precreated authority to the SourceAuthority coordinator before live so the Stage plan can embed it in the precreated accepted result. That authority is an allocated identity only: the normal CandidateWork resolver remains `null` until apply publishes the owner-local record.

- [ ] **Step 1: Write the CandidateWork detached-plan RED**

Assert that prepare rejects a cloned precondition, foreign meter, open permit, wrong completed emission count, cross-ticket plan, second plan, and already-published meter. Assert that successful prepare exposes no resolvable CandidateWork authority before `live`.

```ts
const plan = prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(exactInput)
expect(plan).not.toBeNull()
expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1(
  nextCandidateWork,
)).toBeNull()
expect(attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
  detachedTicket: foreignDetachedTicket,
  planAuthority: plan!.planAuthority,
})).toBe(false)
```

- [ ] **Step 2: Run the CandidateWork RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts -t "prepares Source publication without publishing before live"
```

Expected: FAIL because the prepare/apply plan API is absent.

- [ ] **Step 3: Move all CandidateWork fallibility into prepare**

Prepare must perform the current exact meter-seed, projection, permit-state, emission-count, receipt, duplicate, producing-authority, and precondition checks. It must precreate and freeze the CandidateWork authority and its owner-local record, then call only the named CandidateWork attach function.

Remove the CandidateWork runtime import of SourceAuthority and remove SourceAuthority ticket resolver/binder calls from this Source lane.

Keep the existing foundation publication path unchanged for admitted zero-Source work when no Source transaction exists.

- [ ] **Step 4: Implement infallible CandidateWork apply**

Apply accepts only the exact plan authority returned by transaction `begin`. It performs plain owner-local `WeakMap.set`, precreated authority publication, and meter state advancement. It returns the exact precreated CandidateWork authority and has no nullable/boolean branch.

```ts
const prepared = prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  exactInput,
)
const authority = applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  prepared!.planAuthority,
)
expect(authority).toBe(prepared!.candidateWorkAuthority)
```

- [ ] **Step 5: Add one-shot and replay tests**

Prove pre-live rejection leaves the exact publication precondition reusable, successful mint consumes its one-shot transaction binding, apply cannot run twice, and a cloned/cross-transaction plan cannot publish.

- [ ] **Step 6: Run the Task 2 gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts
npx vitest run tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
npm run type-check
git diff --check
```

Expected: all pass; no SourceAuthority runtime import remains in CandidateWork. Do not commit.

---

### Task 3: Convert Sidecar And Access Publication Into A Detached Plan

**Files:**
- Modify: `src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts` only for the owner-local access reservation record consumed by this task.
- Modify: `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`

**Interfaces:**
- Consumes: detached ticket, fixed Sidecar plan slot, exact sidecar registration precondition, existing `planASidecarAccessCallbacks`, exact sidecar candidate, exact physical-pair reservation, and Source access reservation.
- Produces:

```ts
export function prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
  input: Readonly<{
    detachedTicket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    registrationPreconditionAuthority:
      VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
    previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    candidateWorkMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    nextSidecarCandidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    sourcePathCopyCandidateAuthority:
      VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
  }>,
): VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1 | null

export function applyVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
  planAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1,
): void
```

- [ ] **Step 1: Write the no-callback Sidecar RED**

Add a module-boundary assertion that the Source lane exports no capture/commit/unprotect callback and no Sidecar apply callback field. Assert the prepared plan stores exact frozen access facts rather than a function.

```ts
expect(sidecarExports).not.toHaveProperty("captureCommit")
expect(sidecarSource).not.toMatch(/captureCommit|accessCommitClosure|protectSourceCommit/)
```

- [ ] **Step 2: Write the visibility and exact-tuple RED**

Prepare a valid plan and assert before mint:

```ts
expect(resolveNextSidecars(nextSourceState)).toBeNull()
expect(resolvePhysicalPair(newItem)).toBeNull()
expect(resolveSourceAccess(nextSourceState)).toBeNull()
```

Then assert cloned `nextSidecars`, foreign previous sidecars, cloned arrays, foreign Source candidate, and a reused/foreign precondition reject before live without consuming reservations.

- [ ] **Step 3: Run the Sidecar RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts -t "prepares exact sidecar publication without callback or visibility"
```

Expected: FAIL on the current captured-closure registration path.

- [ ] **Step 4: Precreate the complete Sidecar plan**

Before attachment, perform all current `canRegister`, candidate membership, previous/next sidecar tuple, pair collision, access reservation, duplicate, meter, and precondition checks. Build/freeze the exact registration and exact access record before live. Pair reservations store the exact access record identity, never a function.

The precondition remains owner-local and read-only before mint. Remove the current SourceAuthority precondition registrar from Sidecars.

- [ ] **Step 5: Implement infallible Sidecar apply**

Apply executes only:

```ts
sidecarRegistrations.set(nextSourceState, precreatedRegistration)
publishPrevalidatedPhysicalPairs(precreatedPairReservation)
sourceAccessRegistrations.set(nextSourceState, precreatedAccessRecord)
deleteOwnerLocalReservations()
consumeExactSidecarCandidateHandles()
```

Every helper in this tail returns `void`. A missing reservation or duplicate at this point is an internal invariant throw, not `false`/`null`.

- [ ] **Step 6: Prove active protection and pre-live cleanup**

Before live, exact release/discard succeeds. While live, Sidecar candidate discard, Source candidate alias discard, and access release all return `false`. After apply, the committed registration remains resolvable and all temporary candidate handles are gone.

Test primary authority plus exact removed-items and next-physical-items aliases.

- [ ] **Step 7: Prove no external execution in Sidecar apply**

Wrap original arrays/items/access facts in hostile getters and Proxies before prepare. Reset counters immediately before commit. Assert apply leaves every counter at zero while exact registration/pair/access identities publish.

- [ ] **Step 8: Run the Task 3 gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts --maxWorkers=1
npm run type-check
git diff --check
```

Expected: all pass; no captured commit closure remains. Do not commit.

---

### Task 4: Move Source Candidate Transaction Control Out Of SourceState

**Files:**
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`

**Interfaces:**
- Consumes: detached ticket, Source candidate authority, exact sidecar precondition/access reservation authority, and Task 1 protection queries.
- Produces:

```ts
export function prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1(
  input: Readonly<{
    detachedTicket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    sourcePathCopyCandidateAuthority:
      VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
    accessReservationAuthority:
      VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
    nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  }>,
): VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1 | null

export function applyVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1(
  planAuthority:
    VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1,
): void
```

- Owner-local reservation record becomes data-only:

```ts
interface PlanASourceAccessReservationRecordInternalV1 {
  readonly reservationAuthority:
    VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
  readonly accessRecord: VNextTextBlockUnifiedLayoutSourceAccessRecordInternalV1
}
```

- [ ] **Step 1: Write the shadow-ownership RED**

Assert SourceState no longer owns independent protected-ticket maps, committed-transaction maps, captured commit closures, or runtime SourceAuthority validation. Static test the source and runtime import direction.

```ts
expect(sourceStateSource).not.toMatch(
  /protected.*Ticket|captureCommit|commitClosure|authorize.*CommitProtection/,
)
```

- [ ] **Step 2: Write canonical alias protection REDs**

For the same candidate record, call discard through primary authority, `removedItems`, and `nextPhysicalItems`. Before live each exact alias may clean up. While live every alias resolves to the canonical authority and is rejected by the transaction protection query. A cloned array always rejects without touching the record.

- [ ] **Step 3: Run the SourceState RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts -t "uses transaction-owned protection for every Source candidate alias" --maxWorkers=1
```

Expected: FAIL while SourceState shadow protection maps remain.

- [ ] **Step 4: Implement owner-local data and detached Source plan**

Prepare resolves the canonical candidate once, validates exact next Source, exact reservation/access record, and exact aliases, precomputes the primary/alias delete keys, stores a complete owner-local plan record, and calls only the named Source plan attach operation.

Remove the SourceState runtime import of SourceAuthority. `discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1` and `releaseVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessReservationInternalV1` query only the transaction leaf for active protection after canonicalizing the record.

- [ ] **Step 5: Implement infallible Source apply**

Apply publishes the exact precreated access record, removes access reservation and all three candidate handles, records the candidate as consumed owner-locally, and preserves the prepared next Source/Plan A storage required by later checkpoints.

Do not call the old post-stage `consumeVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1` from the Plan A path. Retain compatibility behavior only where an audited non-Plan-A caller still requires it.

- [ ] **Step 6: Prove checkpoint and lifetime behavior**

Run a three-state rootless Source checkpoint chain. Assert each stage binds only the immediately previous Source/sidecars, stale authorities fail, cloned Source/sidecar roots fail, committed next Source remains resolvable, temporary aliases are unresolvable, and consumed transaction inspection retains only a tombstone.

- [ ] **Step 7: Run the Task 4 gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts --maxWorkers=1
npm run type-check
git diff --check
```

Expected: all pass; SourceState owns permanent state only. Do not commit.

---

### Task 5: Precreate Stage Publication And Cut TransitionSource To One Commit

**Files:**
- Modify: `src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts`
- Preserve: `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts` existing Task 7 producer-tuple changes without adding a transaction responsibility.
- Modify: `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`

**Interfaces:**
- Consumes: all four participant prepare/apply APIs and transaction create/mint/begin/finish.
- Produces exactly the normative SourceAuthority facade signatures in design Section 10, including:

```ts
export function prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(
  input: Readonly<{
    previousRoot: VNextTextBlockUnifiedLayoutRootV2
    previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
    evidence: VNextTextBlockTransitionEvidenceV2 | null
    composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    packingPolicy: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1
    previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    candidateWorkMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    nextSidecarCandidateAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    sourcePathCopyCandidateAuthority: VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
    producingStageAuthority: VNextTextBlockUnifiedLayoutChangePreflightV2 | VNextTextBlockTransitionEvidenceV2
    completedSourceEmissionCount: number
    candidateWorkPublicationPreconditionAuthority: VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
    sidecarRegistrationPreconditionAuthority: VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
    validatedChange: VNextTextBlockValidatedChangeV1
    sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2 | null
    boundedNextSourceItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
    boundedNextSourceStartRenderedUtf16: number
    existingLineageIds: readonly string[]
    insertedLineageIds: readonly string[]
  }>,
): VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 | null

export function commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(
  ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
): VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1

export function resolveVNextTextBlockUnifiedLayoutSourceStagePlanAResultInternalV1(
  input: Readonly<{
    previousRoot: VNextTextBlockUnifiedLayoutRootV2
    sourceStage: unknown
    evidence: VNextTextBlockTransitionEvidenceV2 | null
  }>,
): VNextTextBlockUnifiedLayoutSourceStagePlanAResultRecordInternalV1 | null

export function prepareVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  input: Readonly<{
    detachedTicket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    previousRoot: VNextTextBlockUnifiedLayoutRootV2
    previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
    evidence: VNextTextBlockTransitionEvidenceV2 | null
    composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    packingPolicy: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1
    nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    candidateWorkAuthority: VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
    completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    producingStageAuthority: VNextTextBlockUnifiedLayoutChangePreflightV2 | VNextTextBlockTransitionEvidenceV2
    validatedChange: VNextTextBlockValidatedChangeV1
    sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2 | null
    boundedNextSourceItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
    boundedNextSourceStartRenderedUtf16: number
    previousSourceRange: VNextTextBlockSourceRangeV1
    nextSourceRange: VNextTextBlockSourceRangeV1
    existingLineageIds: readonly string[]
    insertedLineageIds: readonly string[]
  }>,
): VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1 | null

export function applyVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  planAuthority: VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1,
): void

export function inspectVNextTextBlockUnifiedLayoutSourceStagePublicationPlanForTestInternalV1(
  planAuthority: VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1,
): VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1 | null
```

- Produces the exact Plan A accepted interface and result record from design Section 10 in SourceAuthority.
- Produces owner-local Stage plan prepare/apply and Plan A result resolver.

- [ ] **Step 1: Write the result-identity and boundary RED**

Add a test-only read-only inspector for a prepared Stage plan that returns only its exact precreated Plan A accepted object identity. It may not register a callback or expose the transaction tuple.

```ts
const planned = inspectVNextTextBlockUnifiedLayoutSourceStagePublicationPlanForTestInternalV1(
  stagePlanAuthority,
)
const committed = commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(ticket)
expect(committed).toBe(planned)
expect(transitionResult).toBe(committed)
```

Assert no Plan A `Object.freeze`, spread object, authority allocation, result-record construction, or `sourceStageRecords.set` occurs after `begin`.

- [ ] **Step 2: Write the hostile post-live RED**

Install hostile getters/Proxies on all original input objects before prepare and count access. Reset counts immediately before commit. Assert all counters remain zero while commit publishes CandidateWork, sidecars, Source access/candidate state, Stage authority, and result record.

Also monkey-patch test-visible callback/logger/observer seams to throw; commit must not invoke any of them.

- [ ] **Step 3: Run the Stage RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts -t "returns the exact precreated Plan A result through a plain one-way commit" --maxWorkers=1
```

Expected: FAIL because TransitionSource currently executes publish/register/commit/consume and constructs the result after ticket creation.

- [ ] **Step 4: Move Plan A result ownership into SourceAuthority**

Move `VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1` and `VNextTextBlockUnifiedLayoutSourceStagePlanAResultRecordInternalV1` to SourceAuthority. Stage prepare performs all exact tuple checks and precreates/freeze:

```ts
structuralTargetAuthority
sourceLayoutDeltaAuthority
sourceStageAuthority
VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1
VNextTextBlockUnifiedLayoutSourceStagePlanAResultRecordInternalV1
```

The Stage apply performs only owner-local map publication of these exact objects and returns `void`.

- [ ] **Step 5: Implement the SourceAuthority coordinator**

`prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1` executes this fixed pre-live order:

```ts
const detachedTicket = createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
const candidateWorkPrepared = prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
  detachedTicket,
  publicationPreconditionAuthority:
    input.candidateWorkPublicationPreconditionAuthority,
  candidateWorkMeter: input.candidateWorkMeter,
  nextCandidateWork: input.nextCandidateWork,
  completedSourceEmissionCount: input.completedSourceEmissionCount,
})
if (candidateWorkPrepared === null) return null
const sidecarPlan = prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
  detachedTicket,
  registrationPreconditionAuthority:
    input.sidecarRegistrationPreconditionAuthority,
  previousSidecars: input.previousSidecars,
  nextSidecars: input.nextSidecars,
  candidateWorkMeter: input.candidateWorkMeter,
  nextSidecarCandidateAuthority: input.nextSidecarCandidateAuthority,
  sourcePathCopyCandidateAuthority: input.sourcePathCopyCandidateAuthority,
})
if (sidecarPlan === null) return null
const sourcePlan = prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
  detachedTicket,
  sourcePathCopyCandidateAuthority: input.sourcePathCopyCandidateAuthority,
  accessReservationAuthority: input.sidecarRegistrationPreconditionAuthority,
  nextSourceState: input.nextSourceState,
})
if (sourcePlan === null) return null
const stagePlan = prepareVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
  detachedTicket,
  previousRoot: input.previousRoot,
  previousSourceState: input.previousSourceState,
  preflight: input.preflight,
  evidence: input.evidence,
  composition: input.composition,
  packingPolicy: input.packingPolicy,
  nextSourceState: input.nextSourceState,
  candidateWorkAuthority: candidateWorkPrepared.candidateWorkAuthority,
  completedCandidateWork: input.nextCandidateWork,
  producingStageAuthority: input.producingStageAuthority,
  validatedChange: input.validatedChange,
  sourceMaterial: input.sourceMaterial,
  boundedNextSourceItems: input.boundedNextSourceItems,
  boundedNextSourceStartRenderedUtf16:
    input.boundedNextSourceStartRenderedUtf16,
  previousSourceRange: input.preflight.previousRanges.changedSourceRange,
  nextSourceRange: input.preflight.nextRanges.changedSourceRange,
  existingLineageIds: input.existingLineageIds,
  insertedLineageIds: input.insertedLineageIds,
})
if (stagePlan === null) return null
return mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1({
  detachedTicket,
  candidateWorkPlanAuthority: candidateWorkPrepared.planAuthority,
  sidecarPlanAuthority: sidecarPlan,
  sourcePlanAuthority: sourcePlan,
  stagePlanAuthority: stagePlan,
  candidateWorkPublicationPreconditionAuthority:
    input.candidateWorkPublicationPreconditionAuthority,
  sidecarRegistrationPreconditionAuthority:
    input.sidecarRegistrationPreconditionAuthority,
  candidateWorkMeter: input.candidateWorkMeter,
  nextSidecarCandidateAuthority: input.nextSidecarCandidateAuthority,
  sourcePathCopyCandidateAuthority: input.sourcePathCopyCandidateAuthority,
})
```

The two range values above are snapshotted during Stage prepare from the exact preflight authority. Stage apply and commit never reread preflight payload after mint.

Any `null` before mint invokes existing owner-local discard/release cleanup and returns `null`. No cleanup operation may run after a live ticket exists.

- [ ] **Step 6: Implement the one-way commit facade**

```ts
const plans = beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(ticket)
applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  plans.candidateWorkPlanAuthority,
)
applyVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
  plans.sidecarPlanAuthority,
)
applyVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1(
  plans.sourcePlanAuthority,
)
applyVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  plans.stagePlanAuthority,
)
finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(ticket)
const stagePlanRecord = sourceStagePublicationPlanRecords.get(
  plans.stagePlanAuthority,
)
if (stagePlanRecord === undefined) {
  throw new Error("source stage publication plan invariant")
}
return stagePlanRecord.sourceStage
```

The actual implementation must not perform a post-live resolver that can fail. The exact return object must already be stored in the Stage plan record; resolving it is a direct exact-key lookup whose absence throws an internal invariant.

- [ ] **Step 7: Cut over TransitionSource Plan A only**

Replace the current four-step tail:

```ts
publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1(currentPublicationInput)
registerVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1(currentSidecarInput)
commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(currentTicket)
consumeVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(currentSourceCandidate)
```

with:

```ts
const ticket = prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(exactInput)
if (ticket === null) return cleanupAndBlockBeforeLive()
return commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(ticket)
```

Keep the compatibility accepted object and compatibility result registry in TransitionSource. Delegate only Plan A result resolution to `resolveVNextTextBlockUnifiedLayoutSourceStagePlanAResultInternalV1`. SourceAuthority must use no runtime import from TransitionSource.

- [ ] **Step 8: Prove preserved behavior families**

Add/retain real accepted integration tests for:

```text
semantic-only equal rendered provenance
paint-only equal-metric style
insertion: first, middle, last
replacement
partial deletion
whole-item zero-emission deletion
three consecutive rootless Source checkpoints
forced Source/index/style fingerprint collisions
cloned Root/change/composition/Source/sidecars/candidate-work rejection
work-limit and key-exhaustion candidate-free cleanup
```

Each accepted Plan A result must have `authorityMode: "plan-a"` with both authorities required. Compatibility results must have `authorityMode: "compatibility"` and both Plan A authority fields typed `?: never`.

- [ ] **Step 9: Run the Task 5 gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts --maxWorkers=1
npm run type-check
git diff --check
```

Expected: all pass. Do not commit.

---

### Task 6: Close Mint Faults, Re-Entrancy, Reviews, And The Coherent Implementation Commit

**Files:**
- Modify: `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
- Modify: implementation files from Tasks 1–5 only when a verified closure finding requires it.
- Preserve: all nine pre-existing Task 7 dirty files in the final coherent implementation commit.

**Interfaces:**
- Consumes: the complete four-plan transaction and SourceAuthority facade.
- Produces: a reviewer-ready Plan A Source commit implementation with no Critical/Important finding and one reproducible implementation commit.

- [ ] **Step 1: Run the real eight-position mint fault matrix**

Use real CandidateWork, Sidecar, Source, and Stage plans rather than dummy authorities. At each fault point assert:

```ts
prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(exactInput) === null
no live ticket
no CandidateWork authority
no next sidecars/pairs/access
no Source-stage authority/result
all Source candidate aliases discardable
access reservation releasable
both preconditions reusable
exact tuple retry succeeds after fault removal
unrelated live transaction remains unchanged
```

“Exact tuple retry” here means the same exact CandidateWork precondition, sidecar precondition/access authority, meter, sidecar candidate, and canonical Source candidate, re-prepared under a fresh detached ticket and fresh four owner plans. The failed detached ticket and its plans remain absent and cannot be reused.

- [ ] **Step 2: Run replay, collision, and lifetime closure**

Assert duplicate mint, duplicate begin, duplicate finish, cross-ticket plans, cloned authorities, forced canonical/fingerprint collisions, and consumed ticket replay all reject. After finish, inspect only `{ consumed: true }`; release strong test references and prove no transaction inspector resolves participant graphs.

- [ ] **Step 3: Run the plain-operation static and hostile scans**

Inspect the exact code reachable after `beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1` and fail if it contains or calls:

```text
Object.freeze
object/array spread construction
Array.from, map, reduce, sort, iterator loops
callbacks, observers, loggers
duplicate/conflict validation
participant payload getters
return false / return null
```

Combine this with hostile Proxy/getter counters from Task 5. The static scan is a guard; the runtime hostile test remains the authority proof.

- [ ] **Step 4: Run the stable affected gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts --maxWorkers=1
```

Expected: all pass with no timeout.

- [ ] **Step 5: Run the complete accepted 5B-2A regression gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutTrivialAdmissionV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockFlowEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts --maxWorkers=1
```

Expected: 14 files pass; record the fresh test count rather than reusing historical totals.

- [ ] **Step 6: Run the exact Plan A gate plus the new transaction test**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutWorkOwnerRegistryV1.test.ts tests/textBlockUnifiedLayoutWorkPolicyCompositionV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts --maxWorkers=1
```

Expected: 15 files pass; test count is recorded from fresh output rather than copied from this plan.

- [ ] **Step 7: Run repository-wide verification and scope scans**

```powershell
npm run type-check
npm run check
git diff --check
git diff -- src/index.ts
rg -n "SourceCommitTransaction|DetachedSourceCommit|SourceStageAcceptedPlanA" src/index.ts
rg -n "captureCommit|protectSourceCommit|commitClosure|unprotect|set.*Observer" src/layout/textBlockUnifiedLayoutSource*InternalsV1.ts
rg -n "from \"./textBlockUnifiedLayout(?:CandidateWorkAuthority|SourceSidecars|SourceState|SourceAuthority)" src/layout/textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.ts
```

Use an outer command timeout of at least 600 seconds for `npm run check`. Expected: all pass; `src/index.ts` diff/scan empty; no forbidden callback seam; transaction participant imports are type-only.

- [ ] **Step 8: Request two fresh independent reviews**

Review A checks the exact task/spec contracts and every Section 19 acceptance criterion. Review B checks architecture, transaction ownership, mint rollback, live boundary, dependency direction, collision/lifetime, and new breakage. Both reviewers receive the exact spec, both glossaries, this plan, parent Plan A plan, current diff, and fresh gate evidence.

For every Critical/Important finding:

```text
reproduce with a behavior RED
identify the exact authority/ownership cause
apply the minimum in-scope correction
rerun focused + 15-file + type/diff gates
request a scoped re-review
```

If a correction requires a new participant, generic framework, public contract, Root/Scene change, or responsibility move not in the approved spec, stop and request a spec amendment instead of extending scope.

- [ ] **Step 9: Commit one coherent implementation revision**

After both reviews report no Critical/Important and all fresh gates pass:

```powershell
git status --short
git diff --check
git add -- src/layout/textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.ts src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts src/layout/textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
git diff --cached --check
git commit -m "feat(layout): close source commit transaction seam"
```

Before committing, remove any unchanged optional path from the `git add` list and reject any path outside the reviewed scope. Do not push.

---

### Task 7: Produce The Thai Closure Review And Stop At The Phase Gate

**Files:**
- Create: `docs/superpowers/plans/2026-08-09-unified-incremental-root-transition-5b2-plan-a-review-th.md`
- Link: `docs/superpowers/specs/2026-08-10-source-commit-transaction-glossary.md`
- Link: `docs/superpowers/specs/2026-08-10-source-commit-transaction-glossary-th.md`

**Interfaces:**
- Consumes: final committed implementation, fresh verification evidence, and both independent review verdicts.
- Produces: a Thai human-readable closure review; no production behavior.

- [ ] **Step 1: Write the Thai review with exact sections**

Use these headings and evidence categories:

```markdown
# รีวิวการปิด Source Commit Transaction Seam ของ Phase 5B-2 Plan A

## 1. คำตัดสินแบบสั้น
## 2. ขอบเขตที่เปลี่ยนและไม่ได้เปลี่ยน
## 3. แผนภาพสถานะ absent ถึง consumed
## 4. จุด live และเหตุผลที่ไม่มี failure boundary ตามหลัง
## 5. เจ้าของข้อมูลถาวรเทียบกับเจ้าของ transaction control
## 6. ผล fault injection ทุกตำแหน่ง
## 7. ผลป้องกัน re-entrancy และ external execution
## 8. ผล exact authority, alias, collision และ lifetime
## 9. พฤติกรรม Plan A ที่รักษาไว้
## 10. ผลทดสอบและรีวิวอิสระ
## 11. ความเสี่ยงคงเหลือและเจ้าของความเสี่ยง
## 12. ข้อเสนอแนะว่าจะปิด Task 7 / 5B-2A ได้หรือไม่
```

Every technical term first use links to the Thai glossary entry and includes the stable glossary term ID. Include clickable links to the technical glossary, approved spec, this plan, parent Plan A plan, implementation commit, and exact relevant source/test files.

- [ ] **Step 2: Verify report facts against fresh output**

Rerun:

```powershell
npm run type-check
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts --maxWorkers=1
git diff --check
```

Update the report only with exact observed counts/hashes. Do not write “complete”, “ready”, or “closed” if a Critical/Important finding remains.

- [ ] **Step 3: Commit the documentation separately**

```powershell
git add -- docs/superpowers/plans/2026-08-09-unified-incremental-root-transition-5b2-plan-a-review-th.md
git diff --cached --check
git commit -m "docs: review source commit transaction closure"
```

- [ ] **Step 4: Final hygiene and handoff**

```powershell
git status --short
git log -2 --oneline
git stash list --format='%H %gd' | Select-Object -First 1
```

Expected: working tree clean, exactly two new commits after the approved plan commit (implementation and Thai review), stash top unchanged. Report the plan commit, implementation commit, documentation commit, exact tests, review verdicts, residual risks, and whether Task 7 may close. Do not push, merge, start Task 8, or expand into 5B-2B/5B-3 without fresh user approval.

---

## Spec Coverage Index

| Design requirement | Implemented by |
|---|---|
| Exact authority and fixed four-plan tuple | Tasks 1, 2, 3, 4, 5 |
| One transaction control truth | Tasks 1, 4, 5 |
| Honest live boundary | Tasks 1, 5, 6 |
| No external execution after live | Tasks 3, 5, 6 |
| One-way commit | Tasks 1, 5 |
| Fixed Source-only scope | Global Constraints, Tasks 1, 6 |
| Dependency direction / type-only participant imports | Tasks 1, 2, 4, 5, 6 |
| Ownership map | Tasks 2, 3, 4, 5 |
| Detached preparation and plan contracts | Tasks 1–5 |
| Mint rollback at every installation position | Tasks 1, 6 |
| CandidateWork → Sidecars → Source → Stage order | Tasks 1, 5 |
| Consumed tombstone and no graph retention | Tasks 1, 6 |
| Exact sidecar precondition/access key | Tasks 3, 4, 6 |
| Plan A result precreated before live | Task 5 |
| Compatibility result remains TransitionSource-owned | Task 5 |
| Alias/collision rules | Tasks 3, 4, 6 |
| Preserved behavior and calibrated work | Tasks 5, 6 |
| Glossary/documentation contract | Task 7 |
| Fresh task + architecture reviews | Task 6 |

## Plan Review Gate

This plan intentionally stops before implementation. The user must review and explicitly approve this document. Any requested responsibility move, public surface change, additional participant, or new generic abstraction returns to the design spec before execution.
