# Source Commit Transaction Seam Design

**Status:** Superseded in part by the approved review amendment below.

**Active review amendment:**
[Source Commit Transaction Seam Review Amendment](./2026-08-11-source-commit-transaction-seam-review-amendment-design.md)

The amendment is normative where it changes lifecycle, owner-plan sealing,
Source-access ownership, the bounded post-live publication rule, or Stage
result identity. Unchanged sections of this document remain normative.

**Scope:** Phase 5B-2A Plan A, Task 7 closure only.

**Normative terminology:**
[Source Commit Transaction Glossary](./2026-08-10-source-commit-transaction-glossary.md)

**Thai terminology companion:**
[อภิธานศัพท์ Source Commit Transaction](./2026-08-10-source-commit-transaction-glossary-th.md)

**Parent design:**
[Unified Incremental Root Transition 5B](./2026-07-30-unified-incremental-root-transition-5b-design.md)

**Parent Plan A plan:**
[Phase 5B-2 Plan A Source Authority](../plans/2026-08-09-unified-incremental-root-transition-5b2-plan-a-source-authority.md)

## 1. Decision Summary

Replace the current caller-composed Source commit callback handshake with one
task-specific SCT-T01 whose control state is owned by a new private leaf
module. SourceAuthority remains the fixed SCT-T15. CandidateWork,
SourceSidecars, SourceState, and SourceAuthority remain SCT-T16 owners of their
own SCT-T09 and SCT-T17.

The design creates all exact records, authorities, access records, copies,
freezes, and fallible decisions before SCT-T25. Successful mint installs a
fixed set of transaction indexes without executing external code. After live,
SourceAuthority invokes four exact plans through one synchronous SCT-T35 and
returns the exact precreated Plan A accepted Source-stage result. TransitionSource
returns that same identity without allocating, freezing, or publishing another
Plan A result record after commit.

The design does not add a generic transaction framework, a post-live undo
framework, public API, canonical facts, fingerprints, serialization, Root
publication, or Editor lifecycle.

## 2. Context And Evidence

Tasks 1-6 established the exact CandidateWork meter, persistent Source tree,
physical index, style refcounts, bounded exact item-entry authority, Source
sidecar candidate, and full Source-stage tuple. Task 7 review confirmed those
areas after focused and Plan A gates but found one load-bearing transaction
gap.

The current implementation divides the commit handshake among:

- `textBlockUnifiedLayoutSourceAuthorityInternalsV1.ts`, function
  `prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1`, which
  installs a ticket record and invokes caller-supplied `protectSourceCommit`;
- `textBlockUnifiedLayoutSourceStateV1.ts`, function
  `protectVNextTextBlockUnifiedLayoutSourcePlanACommitInternalV1`, which mutates
  protection registries and returns a closure;
- `textBlockUnifiedLayoutTransitionSourceInternalsV1.ts`, which supplies the
  callback and separately calls CandidateWork publication, sidecar
  registration, stage commit, and candidate retirement; and
- participant modules whose current post-ticket operations still perform
  fallible checks and allocations.

Concrete post-ticket evidence in the blocked tree:

1. `publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1` can return
   `null`, projects compatibility work, clones receipts, freezes a record, and
   allocates the CandidateWork authority.
2. `registerVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1` can
   return `false`, checks duplicate/registration/reservation state, constructs
   the registration, creates the Source access function bundle, and publishes
   exact pairs.
3. `commitVNextTextBlockUnifiedLayoutSourceStageInternalV1` constructs and
   freezes stage/structural/delta records and has a `null` authority branch.
4. `consumeVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1`
   returns `false` on candidate-lifecycle mismatch after stage publication.

The latest round-5 reviewers independently confirmed that a callback can
mutate SourceState protection and then throw or return an unrelated function.
SourceAuthority deletes only its ticket record, leaving SourceState protection
stranded or accepting a continuation that did not commit the exact candidate.
The green happy-path gates therefore do not prove SCT-T35.

## 3. Goals

1. Establish one exact, one-shot SCT-T01 for the Plan A Source stage.
2. Put all SCT-T18 in one task-specific leaf module.
3. Make SCT-T25 mean that no `null`, `false`, conflict, work limit,
   input-dependent allocation, or external execution remains.
4. Replace caller-supplied callbacks and captured commit closures with four
   exact SCT-T09 types.
5. Make mint failure perform complete SCT-T34 and preserve SCT-T47.
6. Make post-live code one fixed synchronous sequence of SCT-T36 operations.
7. Preserve exact participant ownership of SCT-T17 without creating shadow
   transaction truth.
8. Preserve the already-verified physical, style, work-owner, collision,
   boundedness, and public-boundary behavior.
9. Bound ticket lifetime by replacing the full record with SCT-T08.
10. Provide complete terminology and verification evidence for future readers.

## 4. Non-Goals

This design does not implement or design:

- generic transaction participants, hooks, middleware, or an undo framework;
- Flow, Break, Spatial, Line, Scene, Delivery, or Root commit transactions;
- Plan B-D behavior or public Plan A activation;
- complete fallback, complete oracle, or complete input traversal;
- async execution, scheduling, queueing, cancellation, or Worker protocol;
- Editor staged/atomic apply or visible-state lifecycle;
- Backend persistence, publication, or binding;
- a new canonical, fingerprint, policy, or serialization surface;
- physical-index or style-refcount algorithm changes beyond preserving the
  current verified Task 7 tree; or
- broad lifetime or product-scale memory claims.

## 5. Governing Invariants

### 5.1 Exact Authority

SCT-T37 is the only authority basis. SCT-T38 and SCT-T39 are integrity or QA
facts only. Clones, structured clones, equal canonical facts, and forced
fingerprint collisions cannot authorize prepare, mint, apply, resolve,
retirement, or replay.

### 5.2 One Transaction Control Truth

The transaction module is the only owner of ticket phase, active indexes,
attached-plan identities, protection, and replay state. Participant modules
must not retain transaction protection maps, transaction commit booleans, or a
second ticket phase.

Participant SCT-T17 remains authoritative for the data it owns. The
transaction record stores exact planned output identities, not shadow copies
of participant published/consumed state.

### 5.3 Honest Live Boundary

An SCT-T02 may exist and be passed to plan preparation without authority. It
becomes SCT-T03 only after every required plan is attached, every fallible
precondition is satisfied, every active index is installed, and the record's
phase is set to `live` as the final mint write.

Every operation that can return `null` or `false`, inspect caller payload,
allocate an authority, copy or freeze a record, detect a duplicate, or decide
policy executes before this boundary.

### 5.4 No External Execution After Live

After live, code must not execute:

- caller-supplied functions;
- getters or Proxy traps;
- observers, logging hooks, or test callbacks;
- `toString` or other conversion on external values;
- promise/microtask/scheduled work; or
- traversal of Source trees, sidecar trees, candidate arrays, style buckets,
  complete suffixes, scenes, or next input.

Storing an exact prevalidated function reference as permanent Source access is
allowed. Invoking that function during commit is not.

### 5.5 One-Way Commit

The only externally observable transaction phases are `live`, `committing`,
and `consumed`. SourceAuthority changes phase through the transaction owner.
Participants cannot advance phase.

There is no production `live -> aborted` path. Normal rejection and fallback
end before live. A post-live invariant violation throws and is not converted
to fallback, blocked, or a partial accepted result.

### 5.6 Fixed Scope

The new module uses fixed named Source plan slots and fixed Source index keys.
It cannot accept a participant array, dynamic hook, callback, stage kind, or
configuration that would let it serve another stage.

## 6. Architecture And Dependency Direction

```text
TransitionSource
        |
        v
SourceAuthority coordinator
        |
        +----> CandidateWork ---------+
        +----> SourceSidecars --------+--> SourceCommitTransaction
        +----> SourceState -----------+       (runtime leaf)
        +-----------------------------+
```

Runtime rules:

1. `textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.ts` imports all
   participant modules as types only.
2. CandidateWork, SourceSidecars, and SourceState may runtime-import the
   transaction module for exact plan attachment, protection queries, and plan
   application authority.
3. Those participant modules must not runtime-import SourceAuthority for
   transaction operations.
4. SourceAuthority may runtime-import participant plan prepare/apply
   operations and the transaction module.
5. TransitionSource calls only the SourceAuthority prepare/commit facade for
   the transaction seam. It does not import participant plan apply operations.

This graph removes the current CandidateWork/Sidecars/State-to-Authority
runtime back-edges before SourceAuthority gains fixed participant imports.

## 7. Ownership Map

| Concern | Sole owner |
|---|---|
| Detached/live ticket record and phase | SourceCommitTransaction |
| Fixed attached plan identities | SourceCommitTransaction |
| Precondition one-shot indexes and active meter/candidate/reservation indexes | SourceCommitTransaction |
| Mint conflict scan and rollback | SourceCommitTransaction |
| Replay tombstone | SourceCommitTransaction |
| CandidateWork meter, receipts, authority, permanent record | CandidateWork |
| Source candidate, aliases, next Source, Source access | SourceState |
| Physical/style pair reservation and permanent sidecars | SourceSidecars |
| Source-stage, structural-target, layout-delta authorities | SourceAuthority |
| Plan A accepted Source-stage object and private result record | SourceAuthority Stage Publication Plan |
| Prepare/apply ordering | SourceAuthority coordinator |
| Compatibility Source result assembly and Plan A orchestration | TransitionSource |

The following current control state moves semantically to the transaction
owner:

- SourceAuthority ticket records, consumed-precondition state, and active
  meter/sidecar/source reservation sets;
- SourceState protected access-reservation tickets and protected Source
  candidate tickets; and
- SourceState transaction-level committed-candidate state.

The following remains with SourceState:

- Source candidate records and canonical aliases;
- prepared and permanently consumed Source candidate state;
- actual reserved and registered Source access;
- prepared next Source state, Plan A storage, and registered style/source data.

## 8. State Machine

```text
absent
  -> preparing-detached-plans
       |-- rejected ----------------------------> absent
       `-- complete -> minting
                         |-- rollback ----------> absent
                         `-- success -> live
                                         -> committing
                                         -> consumed
```

`preparing-detached-plans` and `minting` are not authority phases and are not
visible through live ticket resolvers.

### 8.1 Detached Preparation

The transaction owner creates an SCT-T02 record with four empty fixed slots.
Plan preparation proceeds synchronously with no await or external callback.
The fixed preparation order is CandidateWork, SourceSidecars, SourceState, and
SourceAuthority. This order lets the SourceState plan bind the exact access
record prepared by SourceSidecars and lets the SourceAuthority plan bind the
exact CandidateWork authority preallocated by CandidateWork. Each owner creates
all of its detached records before SCT-T23. The matching fixed-slot attach
operation is the successful preparation function's final mutation before
returning its plan authority.

Detached plan preparation must not:

- mark a meter published;
- consume or protect a candidate;
- publish pairs, sidecars, Source access, or authorities;
- install active transaction indexes; or
- make the detached ticket resolvable as live.

If later preparation rejects, SourceAuthority discards the detached ticket
record. Plan authorities become unreachable weak keys and cannot block retry.

### 8.2 Minting

Mint first performs a complete read-only conflict scan for the exact ticket,
preconditions, meter, canonical candidate authorities, and access reservation.
Before installing an active index, mint also creates and freezes the fixed
four-plan begin bundle that `beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1`
will return. No active index is written before the scan and this preallocation
complete.

The fixed installation positions are:

1. the detached ticket record enters internal `minting` state;
2. CandidateWork precondition ownership index;
3. sidecar precondition ownership index;
4. CandidateWork meter active index;
5. sidecar candidate active index;
6. canonical Source candidate active index;
7. Source access reservation active index; and
8. final `phase = "live"` write.

SCT-T46 can stop after each installation position 1-7 and immediately before
position 8. It never executes after the `phase = "live"` write. The owner tracks
installed positions with a fixed integer/bit mask and deletes them in reverse
order. A failed mint deletes the ticket record and leaves no consumed
precondition or active index.

The same exact tuple is SCT-T47 after rollback.

### 8.3 Live

Live means all four exact plans and every active index are present. Candidate
discard and access release normalize to the canonical authority and query the
transaction owner. They reject while the matching live or committing record is
active.

No output is published merely because the ticket is live.

### 8.4 Committing

`beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1` performs all
ticket/phase, fixed-slot, plan-authority, and precreated-output identity checks
for all four plans before setting `phase = "committing"`. Re-entry and replay
reject before participant mutation. It returns the exact fixed bundle created
by mint; begin does not allocate, copy, spread, or freeze a result.

SourceAuthority then applies the four exact plans in this order:

1. CandidateWork publication plan;
2. Source sidecar/pair plan;
3. Source access/candidate commit/retirement plan; and
4. Source-stage/structural/delta publication plan.

There are no participant transaction phases. Each plan apply accepts only the
authority from the validated begin bundle, executes only SCT-T36 operations,
consumes its private plan authority, and returns the exact preallocated output
identity. It performs no nullable owner lookup or normal rejection.

All checks precede mutation. After the first mutation, an apply operation
contains no branch that can return, reject, allocate, freeze, traverse, or
invoke external code.

### 8.5 Consumed

After all exact preplanned outputs are installed, the transaction owner:

1. deletes active meter, sidecar candidate, Source candidate, and access
   reservation indexes;
2. retains precondition one-shot facts only as weak identity history;
3. replaces the full ticket record with the shared frozen SCT-T08; and
4. returns the exact precreated commit result.

Permanent records may retain ticket identity when required for provenance, but
the ticket resolves only to SCT-T08 and therefore cannot retain the complete
transaction tuple.

## 9. Detached Plan Contracts

### 9.1 CandidateWork Publication Plan

Preparation performs every check currently in
`publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1`:

- exact meter and seed membership;
- meter not failed, published, or holding an open permit;
- exact compatibility projection and Source receipt aggregates;
- exact ticket/precondition/emission binding;
- receipt clone and freeze; and
- permanent authority and record construction.

Apply only installs the precreated authority record and candidate lookup, marks
the exact meter published, consumes the plan, and returns the planned
CandidateWork authority.

### 9.2 Source Sidecar Commit Plan

Preparation performs every check currently in
`registerVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1`:

- exact candidate and construction kind;
- exact previous Root/composition/previous sidecars;
- exact next Source and next sidecars;
- no duplicate permanent registration;
- exact physical pair reservation and item-entry pair identities;
- exact access reservation; and
- complete frozen registration and Source access records.

Apply installs exact sidecars and physical pairs, consumes the sidecar
candidate and plan, and returns the planned permanent registration identity.
The SourceState plan already holds the same exact prevalidated access record;
sidecar apply neither registers nor invokes Source access.

### 9.3 Source Candidate Commit Plan

Preparation:

- normalizes opaque, `removedItems`, and `nextPhysicalItems` handles to one
  canonical Source candidate authority;
- verifies exact candidate record, next Source state, access reservation, and
  prevalidated access record;
- proves that no candidate alias is consumed or permanently retired; and
- snapshots the fixed alias and retirement keys.

Apply registers the exact Source access record, releases the owner-local
reservation by promotion, removes temporary candidate aliases, records
permanent candidate consumption, preserves the prepared next Source state and
Plan A storage, consumes the plan, and returns the exact next Source state.

SourceState does not maintain a transaction protection or transaction
committed map.

### 9.4 Stage Publication Plan

Preparation:

- binds the exact previous Root/Source, preflight/Evidence, composition,
  packing policy, previous/next sidecars, next Source, planned CandidateWork
  authority, and completed CandidateWork facts;
- binds the exact validated change, producer Source material, bounded next
  Source items/start, and lineage arrays already owned by TransitionSource;
- preallocates Source-stage and structural-target authority identities;
- preallocates layout-delta authority only when exact bounded layout facts are
  equal; and
- precreates the exact frozen
  `VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1`, its private
  Source-stage result record, all permanent authority records, and the final
  commit result.

Apply installs those exact records and authorities, consumes the plan, and
returns the exact precreated Plan A accepted Source-stage object. It cannot call
a nullable authority factory after live. TransitionSource returns that same
object and performs no Plan A `freeze`, spread, record construction, or
`sourceStageRecords.set` after commit.

## 10. Required Interfaces

The following names and responsibility boundaries are normative for the
implementation plan. A rename or responsibility move requires a spec amendment
and user review before implementation.

```ts
// New Source-specific leaf module.
export interface VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1 {
  readonly __detachedSourceCommitTicketOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 {
  readonly __sourceStageCommitTicketOpaque: never
}

export interface VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1 {
  readonly __candidateWorkPublicationPlanAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1 {
  readonly __sourceSidecarCommitPlanAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1 {
  readonly __sourceCandidateCommitPlanAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1 {
  readonly __sourceStagePublicationPlanAuthorityOpaque: never
}

export interface VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1 {
  readonly status: "accepted"
  readonly authorityMode: "plan-a"
  readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
  readonly previousSourceRange: VNextTextBlockSourceRangeV1
  readonly nextSourceRange: VNextTextBlockSourceRangeV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly existingLineageIds: readonly string[]
  readonly insertedLineageIds: readonly string[]
  readonly structuralTargetAuthority:
    VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
  readonly sourceLayoutDeltaAuthority:
    VNextTextBlockSourceLayoutDeltaAuthorityInternalV1 | null
  readonly sourceStageAuthority:
    VNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1
  readonly candidateWorkAuthority:
    VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
  readonly issues: readonly []
}

export interface VNextTextBlockUnifiedLayoutSourceStagePlanAResultRecordInternalV1 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly sourceStage: VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1
  readonly evidence: VNextTextBlockTransitionEvidenceV2 | null
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly sourceMaterial:
    VNextTextBlockTransitionProducerSourceMaterialV2 | null
  readonly boundedNextSourceItems:
    readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly boundedNextSourceStartRenderedUtf16: number
}

export function createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
): VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1

export function attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
  }>,
): boolean

export function attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
  }>,
): boolean

export function attachVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
  }>,
): boolean

export function attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    planAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
  }>,
): boolean

export function mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
  input: Readonly<{
    detachedTicket:
      VNextTextBlockUnifiedLayoutDetachedSourceCommitTicketInternalV1
    candidateWorkPlanAuthority:
      VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
    sidecarPlanAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
    sourcePlanAuthority:
      VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
    stagePlanAuthority:
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
    candidateWorkPublicationPreconditionAuthority:
      VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
    sidecarRegistrationPreconditionAuthority:
      VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
    candidateWorkMeter:
      VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    nextSidecarCandidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    sourcePathCopyCandidateAuthority:
      VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
  }>,
): VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1 | null

export function beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
  ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
): Readonly<{
  candidateWorkPlanAuthority:
    VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
  sidecarPlanAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
  sourcePlanAuthority:
    VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
  stagePlanAuthority:
    VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
}>

export function assertVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanApplyInternalV1(
  planAuthority:
    VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1,
): void

export function assertVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanApplyInternalV1(
  planAuthority:
    VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1,
): void

export function assertVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanApplyInternalV1(
  planAuthority:
    VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1,
): void

export function assertVNextTextBlockUnifiedLayoutSourceStagePublicationPlanApplyInternalV1(
  planAuthority:
    VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1,
): void

export function finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
  ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
): void
```

```ts
// SourceAuthority facade. It retains the current Task 6 exact authority tuple,
// removes the callback field, and adds the exact TransitionSource-owned facts
// required to precreate the final Plan A accepted object and result record.
export function prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(
  input: Readonly<{
    previousRoot: VNextTextBlockUnifiedLayoutRootV2
    previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    preflight: VNextTextBlockUnifiedLayoutChangePreflightV2
    evidence: VNextTextBlockTransitionEvidenceV2 | null
    composition: VNextTextBlockUnifiedLayout5B2PolicyCompositionInternalV1
    packingPolicy:
      typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1
    previousSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    nextSidecars: VNextTextBlockUnifiedLayoutSourceSidecarsInternalV1
    candidateWorkMeter:
      VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    nextSidecarCandidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    sourcePathCopyCandidateAuthority:
      VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
    producingStageAuthority:
      | VNextTextBlockUnifiedLayoutChangePreflightV2
      | VNextTextBlockTransitionEvidenceV2
    completedSourceEmissionCount: number
    candidateWorkPublicationPreconditionAuthority:
      VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1
    sidecarRegistrationPreconditionAuthority:
      VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
    validatedChange: VNextTextBlockValidatedChangeV1
    sourceMaterial:
      VNextTextBlockTransitionProducerSourceMaterialV2 | null
    boundedNextSourceItems:
      readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
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
```

Each participant exposes one task-specific `prepare...PlanInternalV1` and one
`apply...PlanInternalV1`. No participant exposes a captured commit function,
unprotect operation, generic plan registrar, or callback-based observer in the
prepare/mint/commit path.

Every participant apply operation calls its matching fixed `assert...PlanApply`
operation before its first owner-local mutation. The assertion resolves the
exact plan binding to its exact live ticket and fixed owner slot, requires the
transaction phase to be `committing`, and returns `void`. Wrong phase, detached
plan, consumed plan, clone, cross-ticket plan, or cross-owner plan throws an
SCT-T44 invariant rejection before participant mutation. These four fixed
assertions are plain transaction-owner WeakMap lookups; they allocate nothing,
run no callback, expose no generic slot parameter, and introduce no participant
phase or shadow transaction state.

| Owner | Prepare operation | Apply operation |
|---|---|---|
| CandidateWork | `prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1` | `applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1` |
| SourceSidecars | `prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1` | `applyVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1` |
| SourceState | `prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1` | `applyVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1` |
| SourceAuthority | `prepareVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1` | `applyVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1` |

Every participant prepare operation accepts the exact detached ticket, creates
and stores its complete owner-local plan record, calls only its matching named
attach operation, and returns `null` if attach rejects. No generic attach API or
dynamic slot parameter exists. SourceAuthority does not call mint until all four
prepare operations have returned their exact attached authorities.

The exact `sidecarRegistrationPreconditionAuthority` is also the Source access
reservation authority, matching the current Task 6 tuple. Mint derives both
fixed indexes from that one identity; it does not accept a second caller-chosen
access key. `producingStageAuthority` must be exactly `evidence ?? preflight`.

`VNextTextBlockUnifiedLayoutSourceStageAcceptedPlanAV1` and its Plan A private
result-record type move to SourceAuthority. TransitionSource imports those types,
returns the exact committed object, and delegates Plan A result resolution to
SourceAuthority. The compatibility accepted type and compatibility
`sourceStageRecords` registry remain in TransitionSource and do not participate
in SCT-T01. SourceAuthority never runtime-imports TransitionSource.

## 11. Failure Semantics

| Boundary | Allowed result | Required cleanup |
|---|---|---|
| Owner plan preparation | `null` | discard detached ticket; no owner lifecycle mutation |
| Full tuple/precondition rejection | blocked | existing candidate/access cleanup |
| Work or supported structural limit | fallback-required | exact established proof; no live ticket |
| Mint conflict | `null` | no index installed |
| Mint injected fault | `null` | SCT-T34 at every position |
| Wrong detached/live identity | invariant rejection before mutation | none |
| Commit re-entry/replay/wrong ticket | invariant rejection before mutation | none |
| Correct post-live production path | exact accepted result | terminal active-index cleanup |
| Post-live implementation defect | throw | never convert to fallback or partial accepted result |

There is no post-live policy decision and no complete fallback material enters
the transaction.

## 12. Re-Entrancy And Plain-Operation Proof

The commit facade accepts ticket only. Tests prepare a valid ticket using
hostile original inputs, reset observation counters, and call commit. The
following must remain zero after live:

- property getters on original tuple objects;
- numeric/length/iterator traps on arrays;
- Source/sidecar node or payload traps;
- access-function invocations;
- observer or logging calls; and
- test-hook callbacks.

SCT-T46 is a fixed module-local integer/enum checked by mint code. It does not
invoke a test function. Installation rejects duplicate fault configuration and
tests reset it in `finally`.

## 13. Alias And Collision Rules

Source candidate lookup accepts the existing exact opaque authority and exact
registered candidate-array aliases. SourceState performs SCT-T40 before asking
the transaction owner whether discard or release is protected. The transaction
owner indexes only the canonical Source candidate authority.

Cloned arrays, cloned candidates, cross-ticket plans, cross-sidecar tuples, and
cross-Root/change/composition/evidence tuples reject. Fingerprint-equal objects
reject under forced collision fixtures.

No new fingerprint or canonical fact is added for transaction identity.

## 14. Lifetime And Retention

All transaction and plan registries use WeakMap/WeakSet. The design adds no
strong global collection, timer, queue, or session handle.

At consumed:

- active indexes are removed;
- attached plan references are removed with the full record;
- the ticket points only to SCT-T08;
- permanent registrations retain only their necessary owner records and exact
  provenance identities; and
- no claim broader than object-graph retention is made.

Tests must verify that the consumed transaction inspector exposes no Root,
Source state, sidecars, meter, CandidateWork, plan, access function, or
candidate reference.

## 15. Verification Matrix

### 15.1 Live-Boundary Matrix

Every current post-ticket rejecting condition becomes a pre-live plan or mint
case:

- missing, failed, published, or open-permit meter;
- CandidateWork projection/receipt/emission mismatch;
- duplicate CandidateWork authority;
- missing, cloned, consumed, or cross-ticket sidecar candidate;
- missing/cross physical pair reservation;
- duplicate sidecar or Source access registration;
- Source candidate/alias/access mismatch;
- stage tuple or authority duplication; and
- candidate retirement mismatch.

Each case proves no SCT-T03, no protected candidate, no published output, and
successful ordinary cleanup. Cases that remain structurally eligible also
prove SCT-T47.

### 15.2 Mint Fault Matrix

Fault after each installation position 1-7 and immediately before the final
live write in Section 8.2. No test fault executes after live. Every row proves:

- live ticket resolution fails;
- every active index is absent;
- both Source array aliases and opaque authority remain discardable;
- sidecar candidate remains discardable;
- access reservation remains releasable;
- preconditions remain unconsumed;
- the same tuple succeeds after fault removal; and
- an unrelated transaction is unchanged.

### 15.3 Plan And Commit Matrix

- detached identity cannot authorize CandidateWork, protection, apply, or
  resolve;
- each detached participant plan fails its matching `assert...PlanApply`
  operation before mint and while the ticket is merely `live`;
- each exact participant plan passes only after `begin` changes the exact
  ticket to `committing` and fails again after the consumed tombstone;
- plans attach exactly once to the exact ticket and fixed slot;
- plan clone/cross-ticket/cross-owner application rejects before mutation;
- commit accepts ticket only;
- direct re-entry while committing and consumed replay reject;
- each participant exact output is permanent after consumed;
- the exact Plan A accepted Source-stage object returned by commit was created
  before live and is the same identity returned by TransitionSource;
- no output is registered twice; and
- active indexes are clear while precondition one-shot behavior remains.

### 15.4 Re-Entrancy Matrix

Use throwing getters, Proxies, iterators, access functions, and object
conversion probes on original inputs. Prepare may observe them only under its
approved exact owner rules. Commit observes none.

Static apply-function review rejects:

- `return null` or `return false`;
- `Object.freeze`, spread, clone, sort, or payload iteration;
- policy/duplicate/work-limit checks;
- callback/observer/logging parameters; and
- complete tree, suffix, scene, or next-input traversal.

### 15.5 Ownership And Dependency Matrix

Static and behavioral guards prove:

- no old SourceState transaction protection/committed maps remain;
- no old SourceAuthority active ticket/reservation maps remain outside the new
  owner;
- participant modules do not runtime-import SourceAuthority;
- the transaction module has no participant runtime imports;
- TransitionSource does not import participant plan apply operations;
- the Plan A branch contains no post-commit `freeze`, spread, authority
  allocation, result-record construction, or `sourceStageRecords.set`;
- no transaction symbol enters `src/index.ts`; and
- no transaction value enters canonical JSON, fingerprint facts, public
  Transition V1, fallback, or serialization.

### 15.6 Preserved Behavioral Matrix

- semantic-only resolved-field update;
- equal-metric and paint-only style updates;
- accepted insertion/replacement/deletion Evidence;
- zero-emission whole-item deletion;
- first/middle/last and multi-leaf boundaries;
- three consecutive rootless Source checkpoints;
- exact previous-sidecar freshness;
- forced Source/index/style/fingerprint collisions;
- bounded same-inline lookup;
- all-ten `0/N-1/N/N+1` real work-owner matrix;
- no Flow/Break/Spatial/Line/Scene/Delivery/Root candidate; and
- no complete hot-path traversal.

### 15.7 Gates

The future implementation plan must name exact test commands and include:

1. new Source commit transaction unit gate;
2. affected CandidateWork/SourceState/SourceSidecars/TransitionSource gate;
3. existing exact 14-file Plan A gate;
4. type-check;
5. full Core check with a sufficient outer timeout;
6. diff-check and public-index scan;
7. runtime dependency scan; and
8. two fresh scoped reviews: task-contract and architecture/transaction.

## 16. Documentation Contract

The normative glossary and Thai companion are part of this design delivery.
The implementation plan, active task briefs, review reports, and Thai handoff
must link the glossaries and use `SCT-Txx` identifiers for ambiguous terms.

The two glossaries must contain the same identifier set. The technical glossary
is normative. The Thai file is explanatory and preserves exact English terms.

Historical documents are not rewritten unless they become active input to the
new implementation plan or contradict an active term. A later separate
AGENTS.md policy change may generalize the documentation/risk-distillation
rules after the dirty Task 7 worktree is closed; it is not part of this spec
change.

## 17. Rejected Alternatives

### 17.1 Full Coordinator Module With Participant Runtime Imports

Rejected because participant discard/release paths must ask the transaction
owner about protection, producing a runtime cycle or callback registration.

### 17.2 Callback Handshake With Rollback Closure

Rejected because caller-supplied execution, closure substitution, re-entrancy,
and split ownership remain. It would be a sixth patch on the failed seam.

### 17.3 Generic Post-Live Undo Framework

Rejected because it requires reversible receipts across CandidateWork,
SourceState, SourceSidecars, and SourceAuthority, expands the hot path, and
creates a generic framework. The approved contract instead completes all
fallible preparation before live.

### 17.4 Per-Participant Transaction Phases

Rejected because `candidate-work-bound`, `sidecars-bound`, and `source-bound`
can drift from owner-local mutations. The transaction has only
`live -> committing -> consumed`; exact participant plans and permanent owner
resolvers prove the results.

### 17.5 Permanent Visibility Gate On Every Source Access

Rejected because it adds a transaction lookup and lifetime coupling to every
persistent Source/style access. Synchronous non-reentrant commit makes the
additional hot-path gate unnecessary.

## 18. Residual Risks And Owners

| Risk | Owner | Required evidence |
|---|---|---|
| A rejecting operation remains after live | implementation task owner | live-boundary RED plus apply-function scan |
| Mint rollback misses an index | transaction module | every SCT-T46 row and retry proof |
| Hidden callback/getter remains | architecture review | hostile re-entrancy matrix |
| Participant and transaction state drift | participant task owner | exact plan/output resolver matrix |
| Plan A result is assembled after consumed | SourceAuthority Stage plan | precreated-result identity and post-commit operation scan |
| Runtime import cycle | architecture review | dependency scan |
| Alias bypass | SourceState | opaque and both array-alias tests |
| Terminal ghost index | transaction module | post-consumed inspector and next-checkpoint chain |
| Ticket retains complete graph | transaction module | minimal tombstone inspection |
| New module grows generic | scope review | fixed fields/no hooks/no public exports |
| Existing physical/style behavior regresses | regression owner | preserved gates and full Core check |

No residual risk may be called zero. Task closure requires that every observed
Critical or Important finding is addressed or explicitly returned to the user
as a new design blocker.

## 19. Acceptance Criteria

This micro-design is ready for implementation planning only when:

1. the user approves this written spec and both glossary files;
2. glossary identifier parity and links pass;
3. the spec contains no unfinished marker, ambiguous owner, or unnamed
   failure boundary;
4. every current post-ticket nullable/boolean operation has an assigned
   pre-live detached plan;
5. mint rollback and post-live plain-operation rules are explicit;
6. ownership and runtime dependency direction are unique;
7. the Plan A accepted Source-stage object and result record are precreated and
   published by the Stage plan before TransitionSource returns them unchanged;
8. public, fallback, Plan B-D, and generic-framework exclusions are explicit;
   and
9. no implementation file is changed by the documentation task.
