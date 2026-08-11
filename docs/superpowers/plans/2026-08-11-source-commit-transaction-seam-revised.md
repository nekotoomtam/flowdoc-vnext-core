# Source Commit Transaction Seam Revised Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the Phase 5B-2A Source commit seam with one exact sealed four-plan transaction whose live tail cannot reject, execute external code, publish Source access from the wrong owner, or return a cross-bound Stage result.

**Architecture:** A Source-specific private leaf owns detached/sealed/committing lifecycle, fixed plan/seal slots, protection, abort, mint rollback, and the consumed tombstone. CandidateWork, SourceSidecars, SourceState, and SourceAuthority own exact prepared plans and permanent records; SourceAuthority coordinates a fixed pre-live preparation and abort sequence, then applies CandidateWork → Sidecars → Source → Stage after the single live boundary.

**Tech Stack:** TypeScript, process-local `WeakMap`/`WeakSet` exact authority registries, frozen Core-created plain records, Vitest, pnpm/npm repository scripts, Git worktree isolation.

## Global Constraints

- Governing amendment:
  [Source Commit Transaction Seam Review Amendment](../specs/2026-08-11-source-commit-transaction-seam-review-amendment-design.md).
- Unchanged clauses remain governed by the
  [Source Commit Transaction Seam Design](../specs/2026-08-10-source-commit-transaction-seam-design.md).
- Normative terms:
  [Source Commit Transaction Glossary](../specs/2026-08-10-source-commit-transaction-glossary.md).
- Thai companion:
  [อภิธานศัพท์ Source Commit Transaction](../specs/2026-08-10-source-commit-transaction-glossary-th.md).
- Preserve the parent contract in the
  [Phase 5B-2 Plan A Source Authority plan](./2026-08-09-unified-incremental-root-transition-5b2-plan-a-source-authority.md).
- Core-only and process-local. Do not modify Editor, Backend, Worker/session, scheduling, cancellation, Root/Scene/Delivery publication, or production activation.
- The transaction leaf is Source-specific. Do not add a participant array, dynamic slot, callback, hook, middleware, generic rollback, or reusable transaction framework.
- The transaction leaf imports participant modules as types only. Participant transaction operations runtime-import the leaf, not SourceAuthority.
- Participant owners retain owner-local plan and permanent records. Only the transaction leaf owns phase, fixed attachments, protection, abort state, replay state, and consumed tombstones.
- State order is exactly `absent → preparing-detached → minting → sealed → committing → consumed`.
- SCT-T25 is exactly `sealed → committing`. Mint success creates SCT-T48, not SCT-T03.
- Before sealed, every failure performs SCT-T50 and owner-specific abandonment. No detached leaf binding or attached owner plan may survive.
- After sealed, plan/candidate/access release or discard rejects. After SCT-T25, no normal rejection, allocation, freeze, descriptor check, duplicate check, external execution, or caller-owned traversal remains.
- Fixed apply order is CandidateWork → SourceSidecars → SourceState → SourceAuthority Stage.
- SourceSidecars never publishes Source access. SourceState is the sole Source access publisher.
- Stage preparation binds SCT-T51 and precreates SCT-T52. Stage apply returns SCT-T52 directly; no ticket-to-result shadow registry exists.
- Every participant apply consumes SCT-T54 returned by `begin`; it performs no
  post-live plan lookup or authority assertion.
- SCT-T53 is the only variable-count post-live operation. It is limited to the prevalidated physical pair publication set.
- Preserve exact authority, forced collision, all-ten work ownership, bounded same-inline lookup, complete-hot-path prohibitions, compatibility behavior, and candidate-free fallback behavior.
- Preserve current factual owner calibration unless the implementation changes a factual owner operation; any changed value needs a behavior RED, exact receipt evidence, and user-visible report.
- Do not change `src/index.ts`, canonical JSON/fingerprints, public transition contracts, complete fallback, or oracle lanes.
- Use strict TDD: behavior RED, verify expected failure, minimum GREEN, focused gate, type-check, diff-check, then scoped review.
- No implementation edit resumes until the user approves this written amendment and revised plan.
- Do not push, merge, or mutate stash state. Commit only the exact reviewed scope after all gates and two fresh reviews pass.

---

## Baseline And Dirty-Tree Policy

At plan-writing time the linked worktree is:

```text
branch: phase-5b-unified-incremental-root-transition
HEAD: a607572dcc1d7ca32123280527f550941fcd745d
tracked implementation/test modifications: 11
untracked transaction source/test files: 2
stash top: c711c1135a3e3808d6b0da042c6d2eadec484431
```

Before execution, re-run:

```powershell
git status --short --branch
git rev-parse HEAD
git stash list --format='%H %gd %s' | Select-Object -First 1
```

If branch, HEAD, dirty path set, staged state, or stash hash differs from the
reviewed handoff, stop and report the difference. Existing dirty production
and test edits are user-authorized evidence from the failed first design; do
not discard, reset, stash, or commit them piecemeal.

Tasks 1-5 end at reviewer checkpoints without partial implementation commits.
Task 6 may create one coherent implementation commit only after the complete
tree passes and both fresh reviews report no Critical/Important finding.

## File Responsibility Map

### Transaction leaf

- `src/layout/textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.ts`
  - Owns fixed detached/sealed/committing records, four plan+seal slots,
    protection indexes, SCT-T50 abandonment authorities, mint rollback,
    SCT-T25, replay rejection, and SCT-T08.
  - Contains no participant runtime import and no permanent participant data.

### Participant owners

- `src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts`
  - Owns CandidateWork plan/seal, prepared authority/receipt record, apply, and
    exact abandonment.
- `src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts`
  - Owns Sidecar plan/seal, permanent sidecars, physical pair reservation and
    SCT-T53 publication set; does not publish Source access.
- `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
  - Owns Source plan/seal, exact Source access promotion, canonical candidate
    retirement/aliases, and plan abandonment.
- `src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts`
  - Owns Stage plan/seal/SCT-T52 and fixed coordinator facade.
- `src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts`
  - Calls only the SourceAuthority Plan A prepare/commit facade and returns
    SCT-T52 unchanged; keeps compatibility result ownership.

### Preserved current Task 7 paths

- `src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts`
- `src/layout/textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.ts`
- `src/layout/textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.ts`

These remain in the coherent diff only because the transaction tests depend on
their already-reviewed producer/local-owner work. This plan does not broaden
their responsibility.

### Tests

- `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`
- `tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts`
- `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
- `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`
- `tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`

---

### Task 1: Make Detached Abort And Sealing Leaf-Owned

**Files:**
- Modify: `src/layout/textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`

**Interfaces:**
- Consumes: participant authority types through `import type` only.
- Produces the fixed lifecycle and owner-specific abandon operations:

```ts
export interface VNextTextBlockUnifiedLayoutSealedSourceCommitTicketInternalV1 {
  readonly __sealedSourceCommitTicketOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceCommitDetachedAbortInternalV1 {
  readonly candidateWork:
    | Readonly<{
        planAuthority: VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
        abandonmentAuthority: VNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentAuthorityInternalV1
      }>
    | null
  readonly sidecar:
    | Readonly<{
        planAuthority: VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
        abandonmentAuthority: VNextTextBlockUnifiedLayoutSourceSidecarPlanAbandonmentAuthorityInternalV1
      }>
    | null
  readonly source:
    | Readonly<{
        planAuthority: VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
        abandonmentAuthority: VNextTextBlockUnifiedLayoutSourceCandidatePlanAbandonmentAuthorityInternalV1
      }>
    | null
  readonly stage:
    | Readonly<{
        planAuthority: VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
        abandonmentAuthority: VNextTextBlockUnifiedLayoutSourceStagePlanAbandonmentAuthorityInternalV1
      }>
    | null
}

export function abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
  detachedTicket: VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1,
): VNextTextBlockUnifiedLayoutSourceCommitDetachedAbortInternalV1 | null

export function mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
  input: VNextTextBlockUnifiedLayoutClosedFourPlanTupleInternalV1,
):
  | Readonly<{
      status: "sealed"
      ticket: VNextTextBlockUnifiedLayoutSealedSourceCommitTicketInternalV1
    }>
  | Readonly<{
      status: "aborted"
      abort: VNextTextBlockUnifiedLayoutSourceCommitDetachedAbortInternalV1
    }>

export function beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
  ticket: VNextTextBlockUnifiedLayoutSealedSourceCommitTicketInternalV1,
): VNextTextBlockUnifiedLayoutSourceCommitApplyBundleInternalV1
```

The four named `attach...PlanInternalV1` operations take the exact plan,
SCT-T49 seal authority, and owner-created SCT-T54. SCT-T54 is stored in the
leaf record and is not returned by owner preparation. Four matching
`consume...PlanAbandonmentInternalV1`
operations accept only the exact plan/abandonment pair from SCT-T50 and return
`void` or throw before participant deletion.

SourceAuthority must consume every non-null entry in an `aborted` result with
the matching owner abandon operation before its public prepare facade returns
`null`. No code may drop an abort bundle unconsumed.

- [ ] **Step 1: Write attached-plan discard and ghost-binding REDs**

Create a detached ticket, attach one exact plan/seal, invoke the current raw
participant-plan discard seam, and assert the leaf still must not mint or
begin with a missing owner record. Add early coordinator-failure fixtures after
owner positions 1, 2, 3, and 4 and assert transaction inspection returns
`absent` rather than an attached ghost.

- [ ] **Step 2: Run the lifecycle REDs**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts -t "rejects attached plan discard and clears every detached owner position"
```

Expected: FAIL because attached owner records can currently disappear while
the leaf retains their plan slots.

- [ ] **Step 3: Implement SCT-T50 and exact abandonment authorities**

Keep one fixed record with four named slots. Abort deletes the record and any
partially installed indexes first, then returns the exact abort bundle and four
owner-specific abandonment authorities precreated by detached creation. The
private `sealed` and `aborted` mint results are also precreated. Abort/mint
rollback performs no allocation, freeze, copy, callback, participant loop, or
generic hook. The inspector exposes only phase and counts.

- [ ] **Step 4: Write and run sealed/live-boundary REDs**

Assert mint success produces `sealed`; participant outputs remain unresolved;
plan/candidate/access discard rejects; SCT-T03 exists only after `begin` changes
the same exact record to `committing`.

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts -t "separates sealed protection from the live committing boundary"
```

- [ ] **Step 5: Implement `sealed -> committing -> consumed`**

`begin` checks only transaction-owned fixed plain identities and phase, then
writes `committing` as its final pre-apply operation. `finish` removes active
indexes and replaces the record with SCT-T08. No `live` phase remains.
The returned apply bundle contains the four exact SCT-T54 records stored before
sealed; participant apply never resolves a plan record after SCT-T25.

- [ ] **Step 6: Run the Task 1 gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts
npm run type-check
git diff --check
```

Expected: all pass; transaction leaf participant imports are type-only.

---

### Task 2: Give Every Participant An Exact Plan Seal And Abandon Path

**Files:**
- Modify: `src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts`
- Modify: `tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`

**Interfaces:**
- Each `prepare...PlanInternalV1` returns an owner bundle with exact
  `planAuthority`, `sealAuthority`, and `plannedOutput`.
- Each owner exposes a read-only exact matcher used by SourceAuthority before
  mint and an owner-specific abandonment operation.

```ts
export function abandonVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  input: Readonly<{
    planAuthority: VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
    abandonmentAuthority: VNextTextBlockUnifiedLayoutCandidateWorkPlanAbandonmentAuthorityInternalV1
  }>,
): void
```

SourceSidecars, SourceState, and SourceAuthority expose equivalent fixed names.
No `discardPlan(planAuthority): boolean` operation remains for an attached
plan.

- [ ] **Step 1: Write real owner-seal REDs**

For each owner, prepare a real plan and assert clone seal, cross-plan seal,
cross-ticket seal, and dummy frozen seal reject. Assert the exact owner bundle
matches once and remains unresolved as permanent output before commit.

- [ ] **Step 2: Run the owner-seal REDs**

```powershell
npx vitest run tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts -t "binds an owner-issued plan seal to one detached ticket and planned output" --maxWorkers=1
```

- [ ] **Step 3: Implement owner plan/seal registries**

Use exact WeakMaps. Seal records store only owner-local plan facts, exact
ticket/slot identity, and planned output identities. Attach is the final write
of successful prepare and passes the exact frozen SCT-T54 directly to the leaf.
The bundle returned to SourceAuthority exposes plan/seal/planned output but not
SCT-T54. A plan reservation blocks owner candidate/resource
discard before sealed without becoming a second transaction phase.

- [ ] **Step 4: Implement exact abandonment**

Owner abandon first consumes the matching fixed leaf abandonment authority,
then deletes only the exact prepared plan/seal/reservation record. It leaves
candidate resources ordinarily releasable for retry. Attached, sealed,
committing, applied, or consumed plan identities reject without mutation.

- [ ] **Step 5: Add the real four-owner lifecycle matrix**

Cover `prepared`, `attached`, `abandoned`, `sealed`, `committing`, `applied`,
and `consumed` for each real owner. Cover every supported Source candidate
alias and an unrelated real sealed transaction.

- [ ] **Step 6: Run the Task 2 gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts --maxWorkers=1
npm run type-check
git diff --check
```

---

### Task 3: Separate Sidecar Publication From Source Access Publication

**Files:**
- Modify: `src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutSourceStateV1.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceStateV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`

**Interfaces:**
- Sidecar planned output:

```ts
interface VNextTextBlockUnifiedLayoutPreparedSourceSidecarOutputInternalV1 {
  readonly nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
  readonly registration: VNextTextBlockUnifiedLayoutSourceSidecarRegistrationInternalV1
  readonly pairPublicationSet: VNextTextBlockUnifiedLayoutPhysicalPairPublicationSetInternalV1
  readonly sourceAccessRecord: VNextTextBlockUnifiedLayoutSourceAccessRecordInternalV1
}
```

- Source plan consumes the exact `sourceAccessRecord` identity and is the only
  apply operation that publishes it.
- Sidecar and Source apply consume their exact SCT-T54 records from `begin`.
  Sidecar apply returns `void`; Source apply returns the exact next Source.

- [ ] **Step 1: Write ownership REDs**

Begin a real sealed transaction and apply CandidateWork + Sidecars only.
Assert sidecars and pairs resolve but Source access does not. Apply Source and
assert the exact precreated access record becomes resolvable. Assert deleting
the sidecar plan cannot delete or publish Source access.

- [ ] **Step 2: Run the ownership RED**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts -t "publishes Source access only from the Source candidate plan"
```

Expected: FAIL while Sidecar apply still promotes Source access.

- [ ] **Step 3: Move permanent access promotion to SourceState**

Sidecar prepare may construct the exact access record from sidecar facts, but
Sidecar apply installs only sidecar registration and physical pairs. Source
prepare binds the exact access record/reservation/canonical candidate. Source
apply performs the permanent access `WeakMap.set`, then candidate alias
retirement and permanent consumption using precomputed plain keys.

- [ ] **Step 4: Write SCT-T53 REDs**

Test publication counts `0`, `1`, and the largest fixture-backed allowed pair
count. Before sealing, require a frozen plain array, exact `Array.prototype`,
data descriptors for `length`/indices, frozen plain pair records, exact safe
integer count, and conflict-free reserved destinations. After live, patch the
array iterator and install hostile getters/Proxies around original inputs;
assert no hook executes.

- [ ] **Step 5: Implement the bounded numeric loop**

Use only:

```ts
let index = 0
while (index < publicationSet.count) {
  const pair = publicationSet.records[index]
  physicalEntryByItem.set(pair.item, pair.entry)
  index += 1
}
```

`publicationSet.count` and `records` are plain prevalidated fields read from
the owner plan record. No iterator, array method, accessor, descriptor check,
duplicate branch, freeze, allocation, or callback is allowed in apply.

- [ ] **Step 6: Run the Task 3 gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts --maxWorkers=1
npm run type-check
git diff --check
```

---

### Task 4: Close The Four-Plan Tuple And Return The Exact Stage Result

**Files:**
- Modify: `src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts`
- Modify: `src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`

**Interfaces:**
- Stage prepare consumes the three real prepared owner bundles, not
  caller-selected output identities.
- Stage apply returns SCT-T52:

```ts
export function applyVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  applyRecord: VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1,
): VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1
```

- SourceAuthority commit returns the same identity:

```ts
export function commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(
  ticket: VNextTextBlockUnifiedLayoutSealedSourceCommitTicketInternalV1,
): VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1
```

- [ ] **Step 1: Write cross-plan closure REDs**

Create two real prepared transactions. Replace exactly one of the following in
transaction A with transaction B's identity: each plan, each seal, CandidateWork
authority/completed work, next sidecars/registration/publication set, next
Source/access record/canonical candidate, previous Root/change/composition,
preflight/evidence, or Stage result. Every row must reject before sealed and
leave both resource tuples retryable.

- [ ] **Step 2: Run the closure REDs**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts -t "seals one closed real four-plan output tuple"
```

- [ ] **Step 3: Implement SCT-T51**

Stage prepare receives exact prepared bundles and validates the complete tuple
described by amendment Section 9. Its own seal binds those exact identities.
SourceAuthority passes the same bundles to mint; mint accepts no independent
caller-chosen planned output.

- [ ] **Step 4: Write Stage result identity RED**

Capture the exact precreated Stage accepted object before sealing. Commit the
transaction and assert Stage apply, SourceAuthority commit, TransitionSource,
and the Plan A result resolver all refer to that exact identity/record. Scan
for any ticket-to-result or transaction-to-result registry.

- [ ] **Step 5: Remove the shadow result registry**

Stage plan record and Stage SCT-T54 own SCT-T52. Stage apply installs
precreated authority/result records and returns `applyRecord.sourceStage`
directly. SourceAuthority stores
that local return value, calls transaction finish, and returns the same object.
No post-live resolver or nullable lookup is allowed.

- [ ] **Step 6: Cut TransitionSource to prepare + commit**

Plan A executes:

```ts
const sealedTicket = prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(input)
if (sealedTicket === null) {
  return cleanupPreLiveSourceTransitionInternalV1(input)
}
return commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(sealedTicket)
```

Compatibility remains local and unchanged. TransitionSource does not import
participant apply functions or construct/freeze a Plan A accepted result.

- [ ] **Step 7: Run the Task 4 gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts --maxWorkers=1
npm run type-check
git diff --check
```

---

### Task 5: Prove Every Failure Boundary And The Plain Live Tail

**Files:**
- Modify: `tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`
- Modify production files from Tasks 1-4 only for a reproduced finding.

**Interfaces:**
- Consumes: complete real owner plans/seals and SourceAuthority facade.
- Produces: reviewer-ready evidence for SCT-T25, SCT-T34, SCT-T50, SCT-T51,
  SCT-T52, and SCT-T53.

- [ ] **Step 1: Build the complete real fault matrix**

Inject deterministic local faults after every plan-record install, seal
install, slot attach, active-index install, before sealed, and before SCT-T25.
Use real owner plans. Each row asserts absent leaf state, absent owner plan/seal
records, no permanent output, ordinary candidate/access release, reusable
preconditions, fresh-plan exact resource retry, and unchanged unrelated real
sealed transaction.

Patch the usual allocation/freeze/iterator probes during rollback and assert
they remain unused, proving the returned abort and mint result identities were
precreated with the detached ticket.

- [ ] **Step 2: Run the real fault matrix RED/GREEN cycle**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts -t "aborts every real pre-live installation position without a ghost binding"
```

- [ ] **Step 3: Add post-live hostile execution proof**

After sealed and immediately before commit, install throwing original-input
getters, Proxies, array iterator, observers, loggers, access functions, owner
lookup hooks, and conversion probes. Commit must produce SCT-T52 while every
counter remains zero. The SCT-T53 test separately counts only direct plain
record writes and proves exact publication identities.

Make every participant plan-record resolver throw after `begin`. Commit must
still succeed through the four SCT-T54 records, proving that no post-live owner
lookup is reachable.

- [ ] **Step 4: Add lifecycle, replay, collision, and retention proof**

Cover direct discard through primary plan/candidate and both Source array
aliases at prepared/attached/abandoned/sealed/committing/consumed; duplicate
mint/begin/finish; cross-ticket/owner plan; forced canonical/fingerprint
collision; three rootless checkpoints; and tombstone inspection with no Root,
Source, sidecar, meter, plan, seal, result, or access reference.

- [ ] **Step 5: Preserve behavior families**

Run accepted semantic-only, paint-only/equal metric, insertion first/middle/last,
replacement, partial deletion, zero-emission whole-item deletion, multi-leaf,
forced Source/index/style collision, bounded same-inline, work-limit,
key-exhaustion, and no-downstream-candidate cases.

- [ ] **Step 6: Run the Task 5 gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts --maxWorkers=1
npm run type-check
git diff --check
```

---

### Task 6: Full Verification, Independent Review, And Coherent Handoff

**Files:**
- Modify only a Task 1-5 source/test file for a reproduced review finding.
- Update ignored evidence report:
  `.superpowers/sdd/2026-08-09-unified-incremental-root-transition-5b2-plan-a-source-authority/task-7-fix1-report.md`
- Create after implementation approval and closure:
  `docs/superpowers/plans/2026-08-09-unified-incremental-root-transition-5b2-plan-a-review-th.md`

**Interfaces:**
- Consumes: complete reviewed transaction tree.
- Produces: one coherent implementation revision and Thai closure evidence only
  when all required gates and reviews pass.

- [ ] **Step 1: Run the stable affected gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts --maxWorkers=1
```

- [ ] **Step 2: Run the accepted 5B-2A gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutTrivialAdmissionV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts tests/textBlockFlowEvidenceV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts --maxWorkers=1
```

- [ ] **Step 3: Run the Plan A + transaction gate**

```powershell
npx vitest run tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutWorkOwnerRegistryV1.test.ts tests/textBlockUnifiedLayoutWorkPolicyCompositionV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTransitionPreflightV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts tests/textBlockUnifiedLayoutProducerInvocationAuthorityV2.test.ts tests/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts --maxWorkers=1
```

- [ ] **Step 4: Run repository and scope gates**

```powershell
npm run type-check
npm run check
git diff --check
git diff -- src/index.ts
rg -n "SourceCommitTransaction|DetachedSourceCommit|SealedSourceCommit|SourceStageAcceptedPlanA" src/index.ts
rg -n "ticket.*result|result.*ticket|discard.*Plan|participant.*array|callback|observer|logger" src/layout/textBlockUnifiedLayoutSource*InternalsV1.ts
rg -n '^import (?!type\b).*textBlockUnifiedLayout(CandidateWorkAuthority|SourceSidecars|SourceState|SourceAuthority)' src/layout/textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.ts
```

Use an outer timeout of at least 600 seconds for `npm run check`. Record fresh
counts; do not copy historical totals.

- [ ] **Step 5: Request two fresh independent reviews**

Review A checks every amendment acceptance criterion and task contract. Review
B checks lifecycle ownership, abort/rollback completeness, exact four-plan
sealing, SCT-T25, SCT-T53, dependency direction, collision/lifetime, and new
breakage. Both receive the amendment, both glossaries, this plan, parent Plan A
plan, exact diff, and fresh gate evidence.

For each Critical/Important finding: reproduce with a behavior RED, identify
the authority cause, apply only the minimum in-scope correction, rerun focused
and full gates, and request a scoped re-review. A new participant, public
surface, generic framework, Root/Scene change, or responsibility move stops
execution and returns to the user.

- [ ] **Step 6: Commit one coherent implementation revision**

Only when both reviews are READY with no Critical/Important and all gates pass:

```powershell
git status --short
git diff --check
git add -- src/layout/textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.ts src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts src/layout/textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.ts src/layout/textBlockUnifiedLayoutSourceStateV1.ts src/layout/textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.ts src/layout/textBlockUnifiedLayoutTransitionPreflightV2.ts src/layout/textBlockUnifiedLayoutTransitionSourceInternalsV1.ts tests/textBlockUnifiedLayoutSourceCommitTransactionV1.test.ts tests/textBlockUnifiedLayoutCandidateWorkAuthorityV1.test.ts tests/textBlockUnifiedLayoutSourceSidecarsV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts
git diff --cached --check
git commit -m "feat(layout): seal source commit transaction ownership"
```

Remove unchanged optional paths from staging and reject every unreviewed path.
Do not push.

- [ ] **Step 7: Write the Thai closure review and stop**

The Thai review links both glossaries, amendment, revised plan, exact commit,
source/tests, fresh counts, both reviewer verdicts, residual risks, and a clear
Task 7/5B-2A closure recommendation. Do not call the seam complete if any
Critical/Important finding remains. Commit the Thai review separately only
after user review; do not start Task 8 or 5B-2B/5B-3.

---

## Spec Coverage Index

| Amendment requirement | Implemented by |
|---|---|
| SCT-T50 leaf-owned detached abort | Tasks 1, 2, 5 |
| owner plan lifecycle and discard protection | Tasks 1, 2, 5 |
| four exact SCT-T49 seals | Tasks 1, 2, 4 |
| SCT-T48 sealed state before live | Tasks 1, 5 |
| SCT-T25 at `sealed -> committing` | Tasks 1, 5 |
| SCT-T51 complete cross-plan tuple | Tasks 2, 4, 5 |
| Sidecar/Source access ownership split | Task 3 |
| SCT-T53 bounded pair publication | Tasks 3, 5 |
| SCT-T52 direct Stage result identity | Task 4 |
| SCT-T54 lookup-free participant apply | Tasks 1, 2, 3, 4, 5 |
| no result shadow registry | Tasks 4, 6 |
| real every-position fault/retry proof | Tasks 1, 2, 5 |
| alias/collision/lifetime preservation | Tasks 3, 5, 6 |
| no public/generic framework expansion | Global Constraints, Task 6 |
| fresh task + architecture reviews | Task 6 |

## Plan Review Gate

This revised plan stops before production implementation. The user must review
and explicitly approve the written amendment, both updated glossaries, and this
plan. Any responsibility move, additional participant, public surface, generic
abstraction, or change to the bounded-loop decision returns to design review.
