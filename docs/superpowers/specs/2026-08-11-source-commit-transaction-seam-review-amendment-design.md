# Source Commit Transaction Seam Review Amendment Design

**Status:** Written from the user-approved review direction; awaiting written
spec review before implementation resumes.

**Amends:**
[Source Commit Transaction Seam Design](./2026-08-10-source-commit-transaction-seam-design.md)

**Normative terminology:**
[Source Commit Transaction Glossary](./2026-08-10-source-commit-transaction-glossary.md)

**Thai terminology companion:**
[อภิธานศัพท์ Source Commit Transaction](./2026-08-10-source-commit-transaction-glossary-th.md)

**Revised implementation plan:**
[Source Commit Transaction Seam Revised Implementation Plan](../plans/2026-08-11-source-commit-transaction-seam-revised.md)

## 1. Decision

The Source Commit Transaction remains a fixed Core-only, process-local,
Source-specific transaction leaf. This amendment replaces the first design's
`mint -> live` transition with an explicit SCT-T48 Sealed Transaction Ticket
and moves SCT-T25 Live Boundary to `sealed -> committing`.

The amendment also makes six load-bearing decisions:

1. the transaction leaf owns detached abort and owner-plan abandonment;
2. every participant contributes an exact owner-issued SCT-T49 Owner Plan
   Seal before a transaction may become sealed;
3. SourceState alone publishes Source access; SourceSidecars publishes only
   sidecars and physical item-entry pairs;
4. the post-live tail permits only fixed registry writes and an explicitly
   bounded SCT-T53 Plain Record Publication Loop;
5. the Stage plan binds the complete four-plan output tuple and returns one
   SCT-T52 Exact Stage Result directly, without a ticket-to-result shadow map;
   and
6. `begin` returns four pre-sealed SCT-T54 records so participant apply performs
   no owner lookup or authority assertion after live.

These decisions supersede conflicting lifecycle, ownership, and Stage-result
clauses in the amended design and its first implementation plan.

## 2. Evidence Requiring The Amendment

Fresh task-contract and architecture reviews found that the first design could
pass all focused and full gates while retaining four structural gaps:

- an attached owner plan could be discarded without invalidating the
  transaction leaf's plan slot;
- mint and begin validated slot identities but not exact owner-issued seals or
  the complete Stage output tuple;
- Source access publication was assigned inconsistently to SourceSidecars and
  SourceState; and
- a ticket-indexed Stage result registry duplicated result ownership and left
  a fallible or traversal-shaped seam after the intended live boundary.

The failure mode is half-publication: CandidateWork or sidecars can become
permanent before a later missing or cross-bound participant record is noticed.
Green happy-path and fault tests cannot overrule that ownership defect.

## 3. Goals

1. Make a participant plan impossible to discard while attached, sealed, or
   committing.
2. Make every pre-live rejection return the transaction leaf and every owner
   plan to one retryable absent state.
3. Prove that all four owner plans and their planned outputs describe one
   exact Root/change/composition/preflight/evidence/Source tuple.
4. Place SCT-T25 after every lookup, duplicate check, allocation, freeze,
   descriptor validation, and owner-plan lifecycle decision.
5. Keep the live tail synchronous, fixed, allocation-free, callback-free, and
   honest about its one bounded pair-publication loop.
6. Remove post-live participant plan resolution by storing apply records before
   sealed.
7. Preserve the existing Plan A work-owner, collision, boundedness, fallback,
   public-boundary, and compatibility behavior.

## 4. Non-Goals

This amendment does not add:

- a generic transaction framework or configurable participant list;
- a post-live undo/rollback protocol;
- participant-specific transaction phases;
- a persistent overlay, arbitrary-depth publication layer, or generic scene
  framework;
- Root/Scene/Delivery publication;
- public API, canonical facts, fingerprints, serialization, Editor, Backend,
  Worker, scheduling, or product activation behavior; or
- broader lifetime claims than process-local object-graph retention.

## 5. Revised Ownership

| Concern | Sole owner |
|---|---|
| Detached, minting, sealed, committing, consumed state | SourceCommitTransaction |
| Fixed plan slots, owner seals, protection indexes, abort journal | SourceCommitTransaction |
| CandidateWork authority and permanent work record | CandidateWork |
| Sidecar registration and physical item-entry pair publication | SourceSidecars |
| Source candidate aliases, Source access, candidate consumption | SourceState |
| Exact Plan A Stage authorities, result record, accepted result | SourceAuthority Stage plan |
| Preparation/apply order and pre-live cleanup orchestration | SourceAuthority coordinator |
| Compatibility result assembly | TransitionSource |

Participant owners may retain owner-local prepared plan records. They may not
retain a transaction phase, protection map, live/committed flag, or independent
ticket lifecycle. The transaction leaf does not retain participant payload
copies; it retains exact plan/seal/output authority identities only until the
consumed tombstone replaces the record.

## 6. Revised State Machine

```text
absent
  -> preparing-detached
       |-- abort-detached ----------------------> absent
       `-- four plans + four owner seals -> minting
                                             |-- rollback + abandon -> absent
                                             `-- success -> sealed
                                                             |-- abort forbidden
                                                             `-- begin -> committing
                                                                           -> consumed
```

`preparing-detached`, `minting`, and `sealed` publish no permanent output.
`sealed` is authoritative and protected but is not live. SCT-T25 is the exact
write that changes `sealed` to `committing` after one final fixed read-only
completeness assertion. No participant mutation occurs before that write.

There is no production `committing -> aborted` path. A post-live invariant
violation throws and is never converted to blocked, fallback-required, or a
partial accepted result.

## 7. Detached Abort And Plan Lifecycle

### 7.1 Leaf-Owned Abort

SCT-T50 Detached Abort is the only operation that may invalidate an attached
but unsealed transaction. It:

1. verifies exact detached ticket identity and a pre-sealed phase;
2. removes all transaction-owned plan slots and partially installed indexes;
3. marks the four exact owner plans abandoned in fixed owner-specific weak
   indexes; and
4. returns the fixed abort result and owner-specific abandonment authorities
   precreated with the detached ticket.

Detached creation preallocates the ticket's four abandonment authorities, fixed
abort bundle, private `aborted` mint result, and private `sealed` mint result.
SCT-T50 and mint rollback therefore allocate, freeze, copy, and invoke nothing.
They perform only fixed transaction-record writes and reverse-order index
deletes before returning an existing exact result identity.

SourceAuthority then invokes the four owner-specific abandon operations. Each
owner deletes its prepared record only after consuming its exact abandonment
authority through the matching fixed transaction-leaf check.

Mint therefore does not collapse every failure into bare `null`. Its private
result is a fixed discriminated union:

```ts
type SourceCommitMintResult =
  | Readonly<{ status: "sealed"; ticket: SealedSourceCommitTicket }>
  | Readonly<{ status: "aborted"; abort: SourceCommitDetachedAbort }>
```

SourceAuthority consumes the complete abort bundle through all matching owner
abandon operations before its public preparation facade returns `null`. This
prevents an inaccessible abandonment authority from becoming a ghost owner
plan.

### 7.2 Discard Rules

An owner-local discard operation must normalize its input to the canonical
plan authority and follow this table:

| Plan lifecycle | Discard result |
|---|---|
| prepared but not attached | allowed |
| attached or minting | rejected until SCT-T50 |
| abandoned by SCT-T50 | allowed once with exact abandonment authority |
| sealed or committing | rejected |
| applied or consumed | rejected |

There is no raw exported function that deletes a plan record solely from a
caller-supplied plan identity. Early coordinator rejection must run SCT-T50
before owner candidate/reservation cleanup. Mint rollback and preparation
failure must prove that all four owner records, aliases, reservations, and leaf
bindings are absent or ordinarily releasable.

## 8. Exact Owner Plan Sealing

Each participant preparation returns one fixed owner-issued bundle:

```ts
interface PreparedOwnerPlan<PlanAuthority, SealAuthority, PlannedOutput> {
  readonly planAuthority: PlanAuthority
  readonly sealAuthority: SealAuthority
  readonly plannedOutput: PlannedOutput
}
```

The participant owner creates the plan and SCT-T49 seal in its own exact
WeakMap registry. The seal binds:

- the exact detached ticket and matching fixed slot;
- the exact plan authority;
- the exact owner-local prepared record;
- one exact SCT-T54 Sealed Apply Record stored directly in the fixed
  transaction slot;
- the exact planned output identities; and
- the exact input authorities that owner is responsible for validating.

The matching fixed attach operation is called only by the owner preparation
path after that registry entry exists. Before mint, SourceAuthority asks each
owner's read-only seal matcher to attest the exact bundle. Mint receives all
four owner-issued bundles and verifies that their plan and seal identities are
the same identities already attached to the four fixed slots.

Dummy authorities remain valid only in isolated transaction-leaf unit tests.
Production facade tests and every retry/fault matrix must use real owner-issued
plans and seals.

Owner preparation does not expose SCT-T54 to SourceAuthority. The matching
owner function passes it directly to the fixed leaf attachment operation. The
leaf stores it in the detached record, owner sealing proves the same identity,
and `begin` returns it only after SCT-T25. This removes participant plan-record
resolution and apply-authority assertions from the live tail.

## 9. Cross-Plan Exact Tuple

The four prepared outputs form one closed tuple:

```text
CandidateWork plan
  -> exact CandidateWork authority + completed work

Sidecar plan
  -> exact next sidecars + frozen plain pair publication set

Source plan
  -> exact next Source + exact Source access record + canonical candidate

Stage plan
  -> exact accepted result binding all three outputs above
```

The Stage plan must bind, by SCT-T37 Exact Identity:

- previous Root and previous Source;
- exact change, preflight, `evidence ?? preflight`, composition, and packing
  policy;
- previous sidecars, planned next sidecars, and planned next Source;
- CandidateWork plan authority, seal, planned CandidateWork authority, and
  completed work record;
- Sidecar plan authority, seal, registration record, and publication set;
- Source plan authority, seal, canonical candidate, Source access record, and
  next Source;
- validated producer material, bounded next Source facts, ranges, and lineage;
  and
- its own exact Stage authorities, result record, and accepted result.

Cross-plan, cloned-output, cross-Root, cross-change, cross-composition,
cross-preflight/evidence, and fingerprint-equal substitutions reject before
sealed. Mint does not accept caller-selected output identities independently
of these owner bundles.

## 10. Source Access Ownership

SourceSidecars prepares the exact access record only when the physical/style
facts needed to construct it are sidecar-owned. Preparation hands that exact
record identity to the Source plan before sealing. SourceSidecars never makes
Source access resolvable.

Apply ownership is fixed:

1. CandidateWork publishes CandidateWork.
2. SourceSidecars publishes next sidecars and exact physical pairs only.
3. SourceState promotes the exact access reservation into permanent Source
   access, consumes/retires the canonical Source candidate and aliases, and
   preserves the next Source/Plan A storage.
4. SourceAuthority Stage publishes Stage/structural/delta records and returns
   the exact accepted result.

This order is normative. Any document assigning Source access publication to
the Sidecar apply operation is superseded by this section.

## 11. Honest Live Boundary And Plain Tail

Immediately before SCT-T25, `begin` performs one fixed read-only completeness
check over transaction-owned plain records:

- phase is `sealed`;
- all four exact plan, seal, and SCT-T54 identities are present in the leaf;
- every fixed protection index points to this ticket;
- the Stage cross-plan tuple is the exact sealed tuple; and
- no transaction-owned slot is abandoned, applied, consumed, or missing.

Owner records are not looked up here. Their exact seals were matched before
sealed, attached/sealed plan discard is forbidden, and SCT-T54 is already in
the leaf record.

Only then does `begin` write `phase = "committing"`. After that write:

- `begin` returns the four exact SCT-T54 records stored before sealed;
- participant apply functions consume SCT-T54 directly and perform no
  nullable/boolean owner lookup or apply-authority assertion;
- no duplicate/conflict/policy/work-limit decision remains;
- no object/array authority is allocated, copied, spread, sorted, or frozen;
- no external getter, Proxy, callback, observer, logger, iterator, promise,
  conversion, or scheduler executes; and
- no caller-owned tree, array, style bucket, suffix, scene, or next input is
  traversed.

### 11.1 Bounded Pair Publication

SCT-T53 is the only variable-count post-live operation. Sidecar prepare creates
one exact frozen plain array of exact frozen plain pair records and proves:

- `Object.getPrototypeOf(array) === Array.prototype`;
- every own index and `length` is a data property, not an accessor;
- every element is an exact Core-created frozen plain record;
- count is an exact non-negative safe integer within the existing deterministic
  Source work limit; and
- every destination key is conflict-free and reserved by this ticket.

Sidecar apply uses a numeric `while (index < prevalidatedCount)` loop with
direct numeric access and fixed `WeakMap.set` writes. It does not use an
iterator, callback, array method, descriptor lookup, branch that can reject,
or owner/payload traversal. The loop may not be generalized beyond the one
physical pair publication set.

This explicit allowance is preferred to a persistent overlay or generic
publication framework because it preserves bounded work, exact permanent
registrations, and the established Source sidecar shape.

## 12. Exact Stage Result

Stage preparation creates and freezes SCT-T52, its private result record, and
all Stage/structural/optional-delta authority records before sealed. The Stage
plan record and Stage SCT-T54 own that exact identity.

Stage apply installs the exact precreated permanent records and returns SCT-T52
directly. Returning the existing object is a plain operation; it performs no
lookup after publication and cannot return `null` or `false`.

There is no ticket-to-result, transaction-to-result, or duplicate Stage result
registry. TransitionSource returns the exact object returned by the Stage
apply operation without allocation, freeze, spread, clone, or additional
publication.

## 13. Required Failure Semantics

| Boundary | Result | Required state |
|---|---|---|
| owner preparation rejects before attach | `null` | owner record absent; leaf unchanged |
| later owner preparation rejects | `null` | SCT-T50 then all owner plans abandoned/removed |
| seal or cross-plan check rejects | `null` | SCT-T50; tuple retryable |
| mint conflict/fault | precreated private `aborted` result, then facade `null` | allocation-free reverse leaf rollback, SCT-T50 bundle consumed, owner plans removed |
| sealed ticket commit misuse | invariant rejection before live | no permanent output |
| correct commit | exact SCT-T52 | consumed tombstone and permanent owner records |
| post-live implementation defect | throw | never fallback or partial accepted result |

No early coordinator exit may leave a detached ticket, attached plan slot,
owner plan record, plan seal, reservation protection, or candidate binding.

## 14. Verification Matrix

### 14.1 Every Installation And Abort Position

Fault-inject every owner plan-record installation, seal installation, fixed
slot attachment, active-index installation, immediately-before-sealed write,
and immediately-before-live write. Every pre-sealed fault proves:

- transaction inspection is absent;
- all owner plan and seal resolvers reject;
- no CandidateWork, sidecars, pairs, Source access, or Stage output resolves;
- both Source array aliases and canonical authority are ordinarily discardable;
- access and pair reservations are releasable;
- preconditions remain reusable;
- exact candidate/resource tuple succeeds with fresh plans after fault removal;
  and
- an unrelated real sealed transaction remains unchanged.

### 14.2 Lifecycle And Cross-Binding

Tests must cover prepared, attached, abandoned, sealed, committing, applied,
and consumed plan lifecycle. Direct owner discard through every plan/candidate
alias must reject while attached or later. Every four-plan cross-product must
reject when exactly one plan, seal, or planned output comes from another real
transaction.

### 14.3 Live Tail

A real Plan A commit must install throwing probes before `begin` for original
tuple getters, Proxies, array iterator, observers, loggers, access functions,
and participant lookup seams. Counts remain zero after live.

The physical pair test separately proves SCT-T53 with counts `0`, `1`, and the
largest fixture-backed permitted count. A static scan rejects iterator syntax,
array methods, `Object.freeze`, spread, allocation, nullable/boolean apply
results, and duplicate/conflict checks in code reachable after live.

### 14.4 Result And Ownership

Tests prove:

- Sidecar apply never resolves Source access;
- Source apply makes the exact precreated access record resolvable;
- Stage apply returns the exact precreated accepted result;
- no ticket-to-result registry exists;
- TransitionSource returns the same exact result identity;
- consumed inspection exposes only tombstone facts; and
- no transaction symbol reaches `src/index.ts`, canonical facts, fingerprints,
  serialization, fallback, or public contracts.

## 15. Risk Decisions

| Risk | Decision |
|---|---|
| live declared too early | live moves to `sealed -> committing` after fixed completeness proof |
| incomplete rollback | leaf-owned SCT-T50 plus every-position real fault matrix |
| hidden re-entrancy | no callback and hostile post-live execution probes |
| protocol drift from many phases | one added `sealed` state; no participant phases |
| hidden multiple sources of truth | leaf owns lifecycle/protection; participants own only plans/permanent records |
| variable pair count after live | one named SCT-T53 bounded plain-record loop, no framework |
| Stage/output cross-binding | Stage closes over all four real owner bundles before sealed |
| result shadow registry | Stage apply returns exact precreated SCT-T52 directly |
| owner plan lookup after live | `begin` returns pre-sealed SCT-T54 records directly |

## 16. Acceptance Criteria

This amendment is ready for implementation only when:

1. both glossaries contain the amendment term set with exact parity;
2. the prior design and plan clearly link their active replacements;
3. no active document assigns Source access publication to SourceSidecars;
4. detached abort, owner abandonment, sealed state, and SCT-T25 ordering are
   unambiguous;
5. Stage binds the full exact four-plan output tuple;
6. SCT-T53 is the only variable-count post-live operation and is numerically
   bounded by fixture-derived policy;
7. every participant apply receives SCT-T54 from `begin` and performs no
   post-live owner lookup;
8. every early rejection and fault position has exact cleanup/retry evidence;
9. no placeholder, generic participant/framework hook, or public surface is
   introduced; and
10. the user reviews the written amendment and revised implementation plan
   before production editing resumes.
