# Phase 5B-1 V3 Pre-Binding Source Envelope Amendment

**Status:** Approved design amendment pending written-spec review  
**Scope:** Core-only, process-local, Phase 5B-1 corrective work  
**Amends:**
`2026-07-31-unified-incremental-root-transition-5b-1-corrective-design.md`

## 1. Purpose

The corrective design requires every countable incremental visit to check its
deterministic work limit before the visit. It also requires a limit fallback
authority to bind the exact validated change and expected target binding.

Image-paint change binding cannot satisfy both requirements without an
additional invariant. Its exact expected paint target is known only after the
previous Source Tree lookup reaches the registered inline image and recomposes
the paint-summary path. If that lookup could exhaust first, Core would have
neither an exact validated change nor an exact expected target binding from
which to create the required two-step fallback request.

This amendment removes that cycle by making bounded source binding a Root V2
acceptance invariant. Every accepted V3 Root proves in advance that its exact
image-paint binding lookup and subsequent one-path Source State transition fit
inside the reviewed V3 source limits. Pre-binding guards remain mandatory but
cannot produce fallback authority. Post-binding operations continue to use the
exact evaluator-owned fallback protocol.

This amendment does not weaken the 21-row V3 policy, change the reviewed
numeric values, or add a second fallback protocol.

## 2. Locked V3 Source Envelope

The reviewed V3 source rows remain:

| Stage | Unit | Floor | Absolute | Relative |
| --- | --- | ---: | ---: | ---: |
| `source-flow` | `source-items` | 1 | 4 | 1/1 |
| `source-flow` | `source-lookup-nodes` | 2 | 16 | 1/1 |
| `source-flow` | `source-path-copy-nodes` | 2 | 16 | 1/1 |
| `source-flow` | `source-leaf-items` | 8 | 32 | 1/1 |

The Source State V1 canonical tree policy remains task-specific:

- maximum leaf occupancy is eight source items;
- maximum branch fanout is eight;
- an empty Source Tree has height zero;
- a leaf Source Tree has height one; and
- a branch Source Tree has one plus the maximum child height.

For a V3 complete Root candidate, Core derives the effective limit for all
four source rows with:

- `previousSummaryBase = sourceState.summary.itemCount`; and
- `exactValidatedChangeDelta = 1`.

The candidate is inside the source work envelope only when all of the
following hold:

1. exact Source Tree height is at most 16;
2. exact Source Tree height is at most the candidate's effective
   `source-lookup-nodes` limit;
3. exact Source Tree height is at most the candidate's effective
   `source-path-copy-nodes` limit;
4. canonical maximum leaf occupancy, eight, is at most the effective
   `source-leaf-items` limit; and
5. one deliberate target-item resolution is at most the effective
   `source-items` limit.

The ceiling of 16 is part of work-policy compatibility, not renderer
semantics. Changing it requires a new work-policy identity and fixture
calibration revision. It does not require a Root V3, Scene V3, or Transition
V2 contract.

## 3. Authority And Identity

Complete Source State construction computes tree height while it already owns
the complete construction traversal. It records that height in the existing
process-local prepared Source State authority. Tree height is not added to the
serialized Source State, Root semantic facts, Scene semantic facts, canonical
fingerprints, or delivery payload.

The shared complete Root V2 kernel checks the exact prepared Source State
authority against the exact work policy before Root graph registration. Both
bootstrap and complete fallback therefore use one source-envelope verifier.
There is no separate bootstrap builder or fallback builder.

V2 Roots remain invalid after atomic V3 activation because their work-policy
authority is V2. They recover only through complete V3 bootstrap, which also
establishes the source envelope.

## 4. Pre-Binding Guard

After exact change-shape, Root authority, work-policy authority, target ids,
and previous-fingerprint checks succeed, change binding registers one opaque
process-local `changeBindingAttemptAuthority`. The record binds:

- exact previous Root V2;
- exact original change object;
- exact V3 work policy;
- exact source-envelope facts from Root acceptance; and
- exact completed pre-binding work.

It intentionally contains no expected target binding and cannot create a
fallback request.

Every source lookup-node visit and deliberate source-item resolution checks
its exact pre-binding budget before reading the next node or item. The rejected
visit is not read and is not added to completed detail. Because an accepted V3
Root already proves the complete lookup is within the effective limit,
exhaustion is unreachable for a valid Root/change/policy tuple.

If exhaustion nevertheless occurs, Core blocks immediately with
`previous-root-authority-mismatch` at `source-flow`. It does not translate the
condition into planned complete, proof unavailable, or deterministic fallback.
This classification reports a broken registered invariant rather than a valid
large incremental attempt.

Successful lookup consumes the attempt authority into the exact
`validatedChange` authority record. That record retains the factual binding
work. Fallback preparation and later transition operations never repeat the
lookup.

## 5. Post-Binding Evaluator

The V3 task-specific stage-visit evaluator remains the sole producer of
`limitExceededAuthority` after successful change binding. Its registry binds:

- exact validated-change authority;
- exact V3 policy authority;
- exact stage and unit;
- recomputed effective limit;
- completed detailed work;
- canonical 21-row ledger at the stop point; and
- attempted work equal to completed work plus one.

Source path-copy nodes and changed-leaf item slots use this evaluator before
each operation-owned visit. The Root source envelope proves that the normal
image-paint path fits, but the guards remain active and fail closed if an
operation/result authority becomes inconsistent.

A `limit-exceeded` result for any of the four source-envelope rows cannot mint
fallback authority. Such a result contradicts the accepted Root envelope and
is therefore an authority/invariant block. Evaluator-owned deterministic
fallback remains available for post-binding stages whose valid operation work
is not pre-proved by the Root envelope. Code must not manufacture unreachable
source work merely to obtain a registered fallback authority.

Line, Scene, and Delivery operations use the same post-binding evaluator in
the later corrective tasks. Only an exact unconsumed evaluator authority can
create deterministic limit fallback. The fallback-request boundary derives
mode, reason, stage, unit, effective limit, attempted work, completed work,
target binding, and policy from registered records.

## 6. Complete Construction Failure

A complete V3 Root candidate outside the source envelope is rejected before
any Root graph node is registered. The shared complete kernel reports:

```text
code: source-work-envelope-exceeded
stage: source-flow
```

Complete bootstrap surfaces that issue directly. Complete fallback surfaces
the same issue and does not consume the exact fallback request, so corrected
complete material may be retried. No partial Root, Scene, or candidate
authority becomes observable.

Existing active 5B-1 image-paint changes do not change source item count or
canonical Source Tree shape. Therefore a correct complete fallback target for
an accepted V3 previous Root remains inside the same source envelope.

## 7. Work Accounting

Pre-binding work remains part of `incrementalCandidateWork`, not a fourth work
ledger. The exact validated-change record absorbs:

- `flow.visitedSourceLookupNodeCount`; and
- `flow.visitedSourceItemCount`.

Post-binding Source State transition reports:

- `flow.copiedSourcePathNodeCount`; and
- `flow.visitedChangedSourceLeafItemCount`.

When V3 activates, canonical `stageWork` projects these factual details onto
all 21 policy rows. Before atomic activation, V2 remains the sole public ledger
shape. No caller estimate, orchestration default, payload byte count, or wall
clock value enters either guard.

## 8. Verification

Tests must prove:

1. source-envelope evaluation accepts `limit - 1` and `limit`, and rejects
   `limit + 1` for lookup height, path-copy height, leaf occupancy, and
   deliberate item resolution;
2. empty, leaf, and multi-height Source States record exact process-local tree
   height without changing canonical fingerprints;
3. caller data cannot supply, alter, clone, or reconstruct tree-height or
   source-envelope authority;
4. the pre-binding guard checks before each visit, excludes the rejected visit
   from completed detail, and does not invoke the node/item read observer;
5. an accepted V3 Root cannot naturally exhaust image-paint source binding;
6. valid non-source post-binding evaluator exhaustion preserves completed
   detailed work, records attempted work as the rejected next unit, and
   produces one exact one-shot authority, while source-envelope exhaustion
   blocks without one;
7. cloned, replayed, foreign, modified, wrong-Root, wrong-change, wrong-policy,
   and non-evaluator objects cannot create limit fallback;
8. bootstrap and complete fallback call the same source-envelope verifier and
   shared complete Root kernel;
9. an envelope-rejected complete candidate registers no Root, Source State,
   line-tree, Scene, or delivery authority; and
10. source envelope, work limits, and fallback selection remain independent of
    payload sizing and elapsed time.

Threshold tests may exercise the pure envelope and visit-guard boundaries with
literal authority-backed facts. They must not allocate an impractically large
Source Tree merely to reach height 17.

## 9. Scope And Capability Honesty

This amendment is specific to TextBlock Source State V1 and Unified Root V2.
It does not introduce a generic tree-height, budgeting, or fallback framework.

It does not activate text/style transition, exclusion transition,
authored-box transition, empty-block incremental behavior, Worker lifecycle,
Editor apply, Backend persistence, data binding, Columns/Table, production,
or V1 retirement.

The amendment does not claim product-scale memory behavior. It proves only
that every accepted process-local V3 Root satisfies the exact source work
envelope needed by the active 5B-1 binding and transition operations.
