# Source Commit Transaction Glossary

**Status:** Normative terminology for the Phase 5B-2A Source commit
transaction seam.

**Applies to:** Core-only, process-local Plan A Source transition work.

**Companion:**
[Thai reader glossary](./2026-08-10-source-commit-transaction-glossary-th.md).

**Behavioral design:**
[Source Commit Transaction Seam Design](./2026-08-10-source-commit-transaction-seam-design.md).

## 1. Normative Role

This file is the normative source for terms used by the Source commit
transaction design, implementation plan, task briefs, tests, reviews, and
handoff reports. The Thai companion explains the same terms for readers but
does not define a separate contract.

Every active Source commit transaction document must link this glossary.
Documents written for Thai review must link both glossaries. Exact contract
identifiers remain in English in all documents and code.

When a term could be ambiguous, use its stable `SCT-Txx` identifier. Do not
introduce a synonym for a term in this glossary without adding or revising a
glossary entry in the same change set.

## 2. Identity, Authority, And Visibility

### SCT-T01 — Source Commit Transaction

The fixed, task-specific Core transaction that makes one exact CandidateWork
authority, one next Source state, one exact Source sidecar set, and one
Source-stage authority permanent through one synchronous commit tail.

- **Owner:** `textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.ts`.
- **Lifetime:** detached preparation through a consumed tombstone.
- **Not the same as:** a generic transaction framework, Root publication,
  Editor atomic apply, or complete fallback.

### SCT-T02 — Detached Ticket Identity

An opaque object identity created so owner-issued detached commit plans can be
bound to the same prospective transaction before authority exists.

- It is not registered as live.
- It cannot protect, publish, apply, commit, or authorize CandidateWork.
- It never leaves the SourceAuthority preparation call on failure.
- **Not the same as:** SCT-T03 Live Transaction Ticket.

### SCT-T03 — Live Transaction Ticket

The exact SCT-T02 identity after every required detached plan is attached,
every fallible precondition is satisfied, every active index is installed, and
the transaction record phase is set to `live`.

- It is exact-identity-bound and one-shot.
- It authorizes only the fixed Source commit tail.
- A clone, structurally equal object, or fingerprint-equal object has no
  authority.

### SCT-T04 — Transaction Record

The transaction-owner WeakMap value associated with one ticket identity. A
live record contains fixed named plan authorities, exact tuple identities,
active-index keys, and phase. A consumed record is replaced by SCT-T08.

### SCT-T05 — Active Transaction Index

A process-local WeakMap or WeakSet entry that prevents concurrent or repeated
use of an exact meter, precondition, Source candidate, sidecar candidate, or
access reservation while a ticket is live or committing.

- Active indexes are transaction control state.
- They are not permanent Source or sidecar registrations.
- Active meter/candidate/reservation indexes are removed at terminal commit.
- Precondition ownership indexes become weak one-shot history after commit and
  are not classified as active indexes after consumption.

### SCT-T06 — Resolvable

An exact authority or output is resolvable when its owning module's exact
registry can return the corresponding permanent record for the exact lookup
tuple. Object existence, allocation, freezing, or fingerprint equality alone
does not make an object resolvable.

### SCT-T07 — Visible Output

A permanent owner-local record that can be reached through its supported exact
resolver after the Source commit call returns. Detached plans, detached ticket
identities, and candidate records are not visible outputs.

### SCT-T08 — Consumed Tombstone

The minimal terminal transaction record `{ phase: "consumed" }` retained
weakly behind an exact ticket identity to reject replay without retaining the
Root, Source tree, sidecars, access functions, plan authorities, or complete
transaction tuple.

## 3. Plans, Owners, And State

### SCT-T09 — Detached Commit Plan

An owner-issued, opaque, exact-identity plan that contains all prevalidated and
preallocated facts needed for one participant's post-live registry mutations.

- Preparation may return `null` before live.
- Preparation must not publish, reserve, protect, or consume owner state.
- Application is void or returns an exact preallocated authority and cannot
  return `null` or `false`.
- A plan is fixed to one SCT-T02 identity and cannot cross tickets.

### SCT-T10 — CandidateWork Publication Plan

The SCT-T09 owned by CandidateWork. It contains the closed-meter proof,
compatibility projection, cloned frozen receipts, permanent authority identity,
and permanent record prepared before live.

### SCT-T11 — Source Sidecar Commit Plan

The SCT-T09 owned by SourceSidecars. It contains the exact next sidecars,
physical item-entry pair publication, sidecar-candidate consumption, permanent
registration record, and prevalidated Source access record.

### SCT-T12 — Source Candidate Commit Plan

The SCT-T09 owned by SourceState. It contains the canonical Source candidate
authority, exact alias set, exact access reservation, next Source state, and
candidate retirement mutations.

### SCT-T13 — Stage Publication Plan

The SCT-T09 owned by SourceAuthority. It contains preallocated Source-stage,
structural-target, and optional layout-delta authority identities, their
permanent records, the exact Plan A accepted Source-stage object, its private
Source-stage result record, and the exact precreated commit result. The Plan A
accepted object is returned directly after commit; TransitionSource does not
rebuild or freeze it after live.

### SCT-T14 — Transaction Owner

The Source-specific leaf module that owns ticket records, fixed plan slots,
active transaction indexes, mint rollback, phases, one-shot consumption, and
the consumed tombstone.

- It imports participant modules only as types.
- It does not own Source, sidecar, CandidateWork, or stage payloads.
- It is not configurable for other stages.

### SCT-T15 — Coordinator

SourceAuthority's fixed code path that calls participant plan preparation and
application in the specified order. It owns ordering, not participant data or
transaction indexes. It accepts no caller-supplied callback or participant
list. For Plan A only, its own SCT-T13 owns the accepted Source-stage object and
private result record needed to keep result publication inside SCT-T35.

### SCT-T16 — Participant Owner

CandidateWork, SourceSidecars, SourceState, or SourceAuthority acting as the
sole owner of one detached plan type and the corresponding permanent records.

### SCT-T17 — Owner-Local Permanent State

Permanent data maintained by a participant after commit, such as a published
CandidateWork authority, registered Source access, registered sidecars, or a
Source-stage authority. This state is not a second transaction phase.

### SCT-T18 — Transaction Control State

Ticket phase, active protection/reservation indexes, exact attached-plan
identities, and one-shot/replay state owned only by the transaction module.
Participant modules must not maintain a shadow copy of this state.

### SCT-T19 — Reservation

A pre-live owner-local claim that holds a prepared resource or registration
slot for an exact candidate, such as Source sidecar access or physical entry
pairs. Before a ticket is live it remains releasable.

### SCT-T20 — Transaction Protection

The live transaction owner's active-index fact that prevents release or
discard of an exact reservation or candidate during commit. Protection starts
only at successful mint and ends at terminal cleanup.

- **Not the same as:** SCT-T19 Reservation.
- Participant modules query protection; they do not own protection maps.

### SCT-T21 — Permanent Registration

The owner-local mapping installed by an applied commit plan and retained after
the transaction is consumed. It must not retain the full live transaction
record.

## 4. Operations And Boundaries

### SCT-T22 — Prepare

Perform fallible read-only validation, exact lookup, bounded evidence
inspection, record construction, freezing, copying, and authority allocation
before live. Prepare may return `null` without publishing partial output.

### SCT-T23 — Attach

Bind one exact owner-issued SCT-T09 to the matching fixed slot of an SCT-T02
record. Attach is the final action of successful plan preparation and does not
make the ticket live.

### SCT-T24 — Mint

Perform the fixed conflict scan and install every active transaction index for
a fully attached detached ticket. Mint sets `phase = "live"` only after the
entire installation succeeds. A failed mint rolls back to absent.

### SCT-T25 — Live Boundary

The single point after which no normal rejection, work limit, conflict check,
duplicate check, allocation, freezing, caller-input read, external code
execution, or fallback decision remains.

### SCT-T26 — Apply

Execute one participant's exact prevalidated SCT-T09 using only plain internal
registry mutations on exact keys and records. Apply begins with all invariant
checks complete, performs no external call, and cannot return `null` or
`false`.

### SCT-T27 — Publish

Install a permanent owner-local record so its exact authority becomes
resolvable. Allocation or preparation of a detached authority is not publish.

### SCT-T28 — Commit

The coordinator's single synchronous operation that moves an exact ticket from
`live` to `committing`, applies the four fixed plans, performs terminal cleanup,
replaces the full transaction record with SCT-T08, and returns the exact
precreated result.

### SCT-T29 — Consume

Make a one-shot authority, ticket, precondition, meter, or candidate unavailable
for a second successful use. Consumption is an authority-lifecycle fact, not
ordinary object deletion.

### SCT-T30 — Retire

Remove temporary candidate handles and their exact aliases after their
permanent successor state has been installed. Retirement preserves the next
Source state and permanent registrations.

### SCT-T31 — Release

Remove a pre-live reservation without publishing it. Release is allowed only
when the exact reservation is not protected by a live transaction.

### SCT-T32 — Discard

Remove an uncommitted candidate and its temporary owner-local records. Every
accepted alias is normalized to the canonical candidate authority before the
protection decision.

### SCT-T33 — Cleanup

The general removal of temporary candidate or preparation state on a normal
pre-live rejection. Cleanup does not imply that transaction indexes were ever
installed.

### SCT-T34 — Mint Rollback

Reverse every transaction index installed by a failed SCT-T24 attempt, in
reverse fixed order, leaving the exact tuple retryable and all candidates and
reservations releasable. It is not a generic post-live undo mechanism.

### SCT-T35 — No-Fail Tail

The fixed synchronous code between successful mint and consumed tombstone.
Every fallible decision and all input-dependent allocation happen before this
tail. A violated internal invariant throws; it is never converted to fallback
or a partial accepted result.

### SCT-T36 — Plain Internal Operation

A fixed operation over Core-created plain records and exact registry keys that
does not execute caller code. It excludes getters, Proxy traps, callbacks,
observers, logging hooks, string conversion of external objects, promises,
microtasks, scheduling, and traversal of caller-owned payloads.

## 5. Equality, Failure, And Diagnostics

### SCT-T37 — Exact Identity

JavaScript reference identity (`===`) backed by the owning process-local
registry. Exact identity is the authority basis for tickets, plans, candidates,
reservations, and outputs.

### SCT-T38 — Canonical Equality

Equality of canonical semantic facts. It may support deterministic integrity
checks but cannot substitute for SCT-T37 authority.

### SCT-T39 — Fingerprint Equality

Equality of fingerprints derived from facts. It is neither exact identity nor
authority and must remain safe under forced fingerprint collisions.

### SCT-T40 — Alias Normalization

Resolve every supported candidate handle, including exact candidate-array
aliases, to one canonical candidate authority before checking protection,
discard, retirement, or transaction membership.

### SCT-T41 — Re-entrancy

Execution entering transaction-sensitive code while preparation, mint, apply,
or commit has not returned. The design forbids re-entrancy after live by
executing no caller-controlled code or test callback.

### SCT-T42 — Blocked

A pre-live result for malformed input or failed exact authority/precondition
validation that is not a work-limit fallback. Blocked returns no live ticket or
published candidate.

### SCT-T43 — Fallback-Required

The established two-step protocol result caused by an exact incremental work
or supported structural limit. It is decided before this transaction is live
and carries no partial Source commit candidate.

### SCT-T44 — Invariant Rejection

A synchronous internal error for an impossible state after all fallible checks
are complete, including replay, re-entry, wrong phase, or wrong exact plan.
It is not blocked, fallback-required, or a normal execution path.

### SCT-T45 — Ghost Reservation

A stale transaction or participant index left after rejected preparation or
failed mint that blocks a later valid transaction or binds a new transaction
to old state. Every mint fault position must prove that no ghost reservation
remains.

### SCT-T46 — Fault Position

A deterministic test-only integer or enum identifying one fixed local mint
installation boundary. A fault may run after a partial pre-live installation
or immediately before the final live write, never after the ticket is live. It
throws internally without invoking a callback and is reset in `finally`.

### SCT-T47 — Retryable Exact Tuple

The same exact candidate/precondition/reservation tuple after rejected plan
preparation or mint rollback. A retryable tuple must be able to mint
successfully once the injected fault is removed.

## 6. Documentation Parity Rules

1. The technical and Thai glossaries use the same `SCT-Txx` identifiers.
2. The Thai glossary preserves every exact English term and contract name.
3. Adding, removing, or changing an identifier requires both files in the same
   documentation change set.
4. The design spec, implementation plan, active task briefs, and final reports
   link the normative glossary.
5. Thai review documents also link the Thai companion.
6. Historical documents need not be rewritten unless reused as an active
   contract or their terminology would contradict this glossary.
