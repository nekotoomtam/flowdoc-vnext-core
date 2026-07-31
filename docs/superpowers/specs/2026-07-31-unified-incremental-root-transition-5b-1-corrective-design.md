# Unified Incremental Root Transition 5B-1 Corrective Design

Status: approved normative amendment for implementation planning.

The detailed
[`2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective.md`](../plans/2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective.md)
implementation plan is prepared for explicit user review. Its presence does not
authorize implementation before that review is accepted.

This amendment is Core-only and process-local. It corrects the implemented
5B-1 foundation without activating 5B-2, 5B-3, Editor, Backend, publication,
production, Worker sessions, or Root V1/Scene V1 retirement.

## 1. Normative Effect

This document supersedes the 2026-07-30 Phase 5B design only for:

- the active 5B-1 work-policy identity and public export;
- factual source, line-tree, and Scene path/leaf accounting;
- operation-owned work evidence and deterministic limit exhaustion;
- proof- and limit-derived fallback authority;
- complete-delivery nested canonical recomposition; and
- the corrective delivery, verification, and closure gates.

The original design remains normative for every other Phase 5B requirement,
including the three checkpoint boundaries, complete-hot-path prohibitions,
exact versus strict translated reuse, E/T/R/N dispositions, canonical
retain/splice delivery, complete-oracle isolation, and explicit non-goals.

This amendment does not retroactively describe `5b-1-v2` as correct. V2 remains
frozen historical evidence for the implementation and review state that
produced the corrective findings.

## 2. Evidence And Root Cause

The final 5B-1 review confirmed that retained-graph traversal and semantic
identity had been separated correctly, but found three remaining Important
defects:

1. proof and planned-complete fallback facts could still be supplied to a
   generic private mint rather than derived from an exact failed operation;
2. bounded source lookup, changed-leaf reconstruction, line lookup, and Scene
   lookup work varied with path height or leaf width but did not enter the
   active work policy; and
3. complete-delivery parsing was descriptor-safe but did not recompose every
   nested identity whose canonical facts were present in the delivery.

The second audit found two related omissions. Canonical line-disposition cover
selection walks previous and next line-tree paths, while delivery-plan cover
selection and verification walk previous and next Scene-tree paths. Existing
selected-subtree and retain-cover counters describe result size, not all lookup
nodes entered to produce and verify those results. Delivery-plan verification
was also repeated by the transition wrapper after the builder had already
verified the exact candidate.

The systemic cause was treating three different properties as if one fact
could represent all of them:

- exact process-local object authority;
- factual work performed or attempted; and
- canonical integrity of detached renderer data.

The correction keeps those properties separate.

## 3. Version And Compatibility Decision

Runtime and semantic contract versions remain:

| Contract | Version |
|---|---:|
| Root | V2 / `2` |
| Persistent Scene | V2 / `2` |
| Transition | V1 / `1` |
| Scene Delivery | V2 / `2` |

The active work-unit schema becomes `5b-1-v3`.

The version layers are independent:

- runtime contract versions identify serialized/runtime shapes;
- the work-policy id identifies the stage/unit schema;
- the policy fingerprint identifies the exact rows and numeric limits; and
- the fixture calibration revision identifies the checked-in evidence used to
  select those numeric limits.

A fixture-only revision that leaves the exact policy unchanged does not alter
Root or Scene identity. A numeric policy change alters the policy fingerprint
and therefore Root composite authority, even if the policy remains within the
V3 work-unit schema. Semantic Root and Scene fingerprints remain work-free.

At final V3 activation:

- `src/index.ts` exposes the generic active 5B-1 id with value `5b-1-v3` and
  the exact V3 policy;
- it no longer exposes the V2 policy;
- V1 and V2 policy values may remain only as private frozen test/reference
  evidence;
- public Root bootstrap, transition, evidence-request, and complete-fallback
  wrappers use V3 only; and
- a process-local Root registered under V2 fails active transition or fallback
  validation with `invalid-work-policy`; the caller must complete-bootstrap a
  new V3 Root.

There is no V2/V3 dual active lane, policy adapter, or migration protocol.
Editor and Backend have no current consumer of this policy and remain
unchanged.

Root policy validation compares exact active policy authority and the exact
ordered active rows. It must not infer validity from a hard-coded row count.

## 4. V3 Factual Work Contract

### 4.1 Unit Semantics

The active V3 units distinguish resolution, traversal, construction, and
result-size facts:

| Unit | Exact meaning |
|---|---|
| `source-items` | source-item resolutions attempted for the change |
| `source-lookup-nodes` | node visits attempted on the exact indexed source path |
| `source-path-copy-nodes` | changed source leaf and ancestor constructions attempted |
| `source-leaf-items` | item-slot compositions attempted while rebuilding the changed leaf |
| `selected-exact-subtree-nodes` | canonical subtrees selected by structural proof |
| `line-tree-lookup-nodes` | line-tree node visits attempted by range selection or ordinal lookup |
| `copied-scene-nodes` | Scene ancestor constructions attempted by path copy |
| `replacement-chunks` | replacement renderer-chunk constructions attempted |
| `scene-tree-lookup-nodes` | Scene node visits attempted by range selection or ordinal lookup |
| `delivery-operations` | canonical retain/splice operation constructions attempted |
| `retain-cover-nodes` | maximal retained subtrees in the delivery result |

The existing inactive 5B-2 and 5B-3 units retain their original meanings.
Payload-byte estimates remain observations and are not execution units.

On accepted work, attempted counts equal completed work. On pre-visit limit
failure, the policy row also counts the one rejected next attempt, while the
detailed operation counter records only completed visits or constructions.
Lookup units otherwise count each tree node once per lookup or range-selection
invocation. They do not introduce a separate branch-child-slot unit. Source,
line-tree, and Scene canonical policies bound branch fanout at eight, so child
selection is a fixed structural factor. A change to fanout or balancing policy
requires a new policy fingerprint and recalibration before activation.

### 4.2 Exact Policy Rows

V3 adds seven locked stage/unit rows:

| Stage | Unit |
|---|---|
| `source-flow` | `source-lookup-nodes` |
| `source-flow` | `source-path-copy-nodes` |
| `source-flow` | `source-leaf-items` |
| `structural-reuse-proof` | `line-tree-lookup-nodes` |
| `scene` | `line-tree-lookup-nodes` |
| `scene` | `scene-tree-lookup-nodes` |
| `delivery-plan` | `scene-tree-lookup-nodes` |

Together with the six existing locked V2 rows and eight inactive future rows,
V3 has exactly 21 ordered policy rows: 13 locked and eight inactive.

Every `incrementalCandidateWork.stageWork` value contains exactly one row for
every V3 policy row in policy order, including zero rows. Missing, duplicate,
reordered, or extra rows are invalid. No orchestrator default such as `?? 1`
may manufacture factual work.

Previous-summary bases are owned centrally by the work-policy module:

- source resolution, lookup, path-copy, and leaf-item units use previous
  source item count;
- line-tree lookup and structural/layout units use previous line count;
- Scene lookup, copy, replacement, and delivery units use previous chunk
  count; and
- existing spatial units retain the previous spatial-entry base.

Transition and fallback code use the same exhaustive base selector. They must
not maintain independent switches that can drift.

### 4.3 Operation Ownership

Counts originate where work occurs:

- change binding owns source lookup nodes and deliberate source-item
  resolution;
- source transition owns source path-copy nodes and changed-leaf item slots;
- line-disposition cover owns previous/next structural line-tree visits;
- Scene candidate construction owns line-ordinal and Scene-ordinal lookup
  visits, replacement chunks, and copied Scene nodes;
- delivery-plan construction owns its Scene cover visits and the visits made by
  its one internal verification; and
- the transition orchestrator only merges exact operation results into the
  canonical ledger.

Accepted operation results and fallback-eligible operation failures both carry
their exact completed-work detail. A failure after partial bounded work does
not erase that work.

### 4.4 Deterministic Limit Exhaustion

Once V3 is active, an operation checks the exact stage/unit budget before each
countable next visit. If `current + 1` exceeds the effective limit:

- the next visit is not performed;
- the operation stops without continuing the suffix or tree walk;
- detailed visited counters retain the number of completed visits;
- the policy row records the factual attempted unit that detected exhaustion;
- the limit reason records the same attempted count and exact effective limit;
  and
- any partial candidate is discarded.

This distinction preserves both actual traversal detail and deterministic
policy-attempt evidence. Wall-clock time and estimated payload bytes cannot
participate.

### 4.5 Calibration Before Activation

V3 activation is a three-stage change:

1. add operation-owned observation and regression counters while V2 remains
   the active public policy in the working branch; then
2. derive and freeze the complete V3 candidate policy without exposing it as
   the active public lane; then
3. atomically activate V3 only after branch-owned proof and limit fallback
   authority is complete.

Calibration uses fixtures of size 1, 8, 9, 64, 65, and 128, with affected
items at the beginning, middle, and end where applicable. It covers minimum
and maximum leaf widths and multiple tree heights.

For every locked row, checked-in evidence records:

- the exact previous-summary base;
- observed factual work;
- small-block floor, absolute limit, and relative ratio;
- threshold-minus-one, threshold, and threshold-plus-one outcomes; and
- the exact policy and fixture-calibration identities.

This amendment intentionally does not prescribe numeric V3 limits. V3 cannot
be activated or described as delivered until fixture evidence selects and
freezes every numeric value. No placeholder, infinity, wall-clock calibration,
or implementation-chosen emergency limit is permitted.

Empty input remains structural calibration only. The 128-line exclusion
fixture remains an inactive reference and does not activate exclusion
incremental behavior.

## 5. Derived Fallback Authority

### 5.1 Exact Bound-Change Record

Successful change binding registers one exact process-local validated-change
record containing:

- exact previous Root authority;
- exact active V3 policy authority;
- exact original change;
- expected target binding; and
- factual change-binding work.

Fallback construction reuses this record. It never rebinds the change and
therefore cannot add an unreported second source lookup.

### 5.2 No Generic Caller-Shaped Mint

The generic fallback-attempt mint that accepts caller-selected `mode`,
`reason`, `stage`, or `work` is removed. Two task-specific process-local
authorities replace it:

```text
actual bounded proof operation -> proofFailureAuthority
actual work-limit evaluation   -> limitExceededAuthority
```

The fallback-request boundary consumes exactly one authority and derives mode,
reason, skipped/failed stage, target binding, policy fingerprint, and work from
its registered record. Cloned, replayed, foreign, raw, or cross-bound
authorities fail closed.

### 5.3 Proof Failure Eligibility

A proof operation may issue `proofFailureAuthority` only when:

- Root, change, policy, and dependency authority are valid;
- the operation performed only bounded incremental work;
- canonical input and arithmetic remain valid; and
- the active 5B-1 operation cannot establish the required exact
  retain/replacement cover.

The 5B-1 public result is derived as:

```text
mode: incremental-proof-failed
reason.code: bounded-reuse-proof-unavailable
reason.stage: scene | delivery-plan
reason.proof: retain-cover
```

The authority carries all partial factual work completed before proof failure.
The operation that detects failure owns the classification; the transition
orchestrator cannot translate an arbitrary blocked issue into proof failure.

### 5.4 Limit Failure Eligibility

Only the exact policy evaluator can issue `limitExceededAuthority`. Its record
binds:

- exact validated-change authority;
- exact stage and unit;
- effective limit;
- factual attempted work;
- completed-work detail; and
- the canonical incremental work ledger at the stop point.

Fallback request creation recomputes and reconciles these facts against the
exact registered previous Root and V3 policy.

### 5.5 Immediate Blocks

The following conditions remain blocked and cannot mint fallback authority:

- malformed, stale, or unsupported change data;
- Root, policy, target, evidence, dependency, or candidate authority mismatch;
- unknown or inactive policy behavior;
- unsafe arithmetic or malformed canonical data;
- impossible internal topology under exact registered dependencies;
- collision or cross-object identity mismatch;
- atomic candidate registration failure; and
- authored-box change while the 5B-3 geometry stage is inactive.

Fallback means valid bounded incremental work could not complete its proof or
budget. It is not recovery for contract corruption.

### 5.6 Planned Complete Remains Inactive

Transition V1 retains `planned-complete` and
`allowlisted-whole-block-spatial-impact` vocabulary for the future 5B-3
contract. V3 has no producer for either fact. Fabricated planned-complete
authority is rejected, and 5B-1 authored-box input remains blocked.

5B-3 must add its own policy-owned producer before it may activate this mode.

### 5.7 Two-Step Complete Fallback

The external protocol remains:

```text
failure authority
  -> exact process-local fallback request
  -> independently supplied complete material
  -> shared complete Root V2 construction kernel
  -> exact target-binding verification
  -> atomic registration
```

The fallback request contains no partial candidate. Complete fallback does not
read or reuse a partial incremental candidate. Bootstrap and fallback call the
same complete Root construction kernel and differ only in their envelope and
construction provenance.

`incrementalCandidateWork`, `completeFallbackWork`, and `completeOracleWork`
remain separate. Invalid complete material may be corrected and retried with
the same exact request. The request is marked completed only after successful
atomic registration; successful replay is rejected.

## 6. Complete-Delivery Canonical Integrity

### 6.1 Authority Claim

`createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2(...)` requires one
exact registered Root and therefore has process-local authority.

`inspectVNextTextBlockCompleteSceneDeliveryV2(...)` accepts detached data. It
can prove descriptor safety and canonical self-consistency, but it cannot prove
that detached data came from a registered Root. Canonical fingerprints are not
promoted to process-local authority.

### 6.2 Validation Order

The inspector validates in this order:

1. descriptor-safe shape, prototype, accessor, symbol, cycle, and safe-integer
   checks;
2. nested canonical identity recomposition;
3. cross-record semantic consistency;
4. chunk and Scene-summary recomposition; and
5. payload-observation and complete-delivery recomposition.

No ordinary property read, canonical serialization, or payload estimation may
occur before the corresponding detached record passes descriptor-safe parsing.

### 6.3 Recomputable Identity Allowlist

The inspector recomputes every identity whose canonical facts are present:

- source-mapping fingerprint;
- line-fragment lineage from kind and source spans;
- line-internals lineage and fingerprint;
- content-local and authored-box geometry fingerprints;
- text paint-run fingerprints;
- inline-image paint fingerprint from asset id, fit, and crop;
- hard-break paint fingerprint from canonical `{ paint: "none" }`;
- Scene-fragment paint and fragment fingerprints;
- ordered chunk source and provenance aggregate fingerprints;
- ordered chunk paint aggregate fingerprint;
- chunk fingerprint;
- Scene semantic summary;
- payload observation; and
- complete-delivery fingerprint.

Valid existing complete delivery must retain every existing fingerprint. This
is a stricter inspector bug fix, not a serialized Scene Delivery V3 contract.

### 6.4 Cross-Record Consistency

The inspector additionally proves:

- mapping ranges and source spans are safe and ordered;
- line-internal fragment lineage matches its kind and source spans;
- content and authored geometry fragments match line-internal kind, lineage,
  order, and cardinality;
- chunk line lineage and line-internals fingerprint match recomposed
  line-internals facts;
- text paint runs cover fragment source spans in canonical order;
- one source lineage cannot claim conflicting paint facts;
- inline-image mapping has the exact corresponding image fragment;
- a mapping without fragment paint is permitted only for a hard break;
- ordered source paint plus fragment paint recomposes chunk paint; and
- ordered mapping source/provenance claims recompose the chunk aggregates.

Missing or ambiguous paint evidence fails closed. The inspector does not guess
an omitted relationship.

### 6.5 Opaque Dependency Allowlist

The delivery does not contain enough upstream facts to authenticate:

- mapping source, provenance, or boundary fingerprints;
- font SHA-256 claims;
- alignment-policy fingerprints; or
- the boundary-spatial-context fingerprint.

In particular, boundary spatial context includes a content-context fingerprint
that is not part of complete delivery. These values remain opaque dependency
claims. The inspector validates their shape, uses them in the correct parent
composition, and checks locally provable aggregates, but does not claim to
rederive their upstream truth.

No new witness field or delivery-version bump is added for these opaque facts
in this corrective scope.

### 6.6 Canonical Ownership

Canonical fact helpers remain task-specific and private:

- Source State owns text, image, and hard-break paint facts;
- Persistent Layout Line Tree owns mapping, fragment lineage, line internals,
  and geometry facts;
- Persistent Scene owns fragment and chunk paint composition; and
- Complete Delivery coordinates safe parsing and recomposition.

The helpers are typed, pure, and unavailable from `src/index.ts`. This work
must not introduce a generic fingerprint-validation or persistent-tree
framework.

### 6.7 Payload Observation

Estimated canonical payload bytes remain observational only. They do not enter
execution policy, choose incremental/fallback behavior, or enter Root/Scene
semantic fingerprints. Estimation identity may change when its estimation
contract changes without implying renderer-semantic change.

## 7. Delivery-Plan Verification Ownership

The delivery-plan builder has one complete responsibility boundary:

```text
construct exact candidate
  -> internally verify exact candidate
  -> return prepared authority and factual construction/verification work
```

The transition wrapper consumes exact prepared authority and does not perform
a second full plan verification. Removing that duplicate does not remove the
verification gate. Construction cover visits and the single internal verifier
cover visits both enter `delivery-plan/scene-tree-lookup-nodes`.

Existing delivery-plan result-size counters retain their reviewed meanings:
operations count operations, retain-cover nodes count selected maximal
subtrees, and replacement chunks count emitted replacements. Tree lookup work
is reported separately rather than folded into those units.

## 8. Corrective Delivery Sequence

The implementation plan must preserve these ordered sub-checkpoints.

### 8.1 5B-1C-1 Factual Work Foundation

- add operation-owned counters and multi-height/leaf-width regression evidence;
- remove duplicate transition-wrapper delivery-plan verification before final
  delivery lookup calibration;
- calibrate all new rows and freeze the V3 candidate policy;
- freeze the 21-row policy and fixture manifest;
- keep V2 as the sole active public policy until 5B-1C-2; and
- prove the frozen V3 candidate independently before activation.

### 8.2 5B-1C-2 Branch-Owned Fallback

- retain exact validated-change authority;
- remove the generic caller-shaped mint;
- issue proof and limit authorities only from their actual operations;
- preserve partial factual work;
- distinguish proof unavailability from corruption; and
- prove shared-kernel complete fallback without candidate contamination;
- switch Root validation and all public wrappers atomically to V3;
- remove V2 from public exports; and
- prove V2 Root rejection and V3 complete bootstrap/fallback.

### 8.3 5B-1C-3 Complete-Delivery Integrity And Closure

- add owner-specific canonical fact helpers;
- recompose nested identities and cross-record relations;
- add adversarial nested-mutation tests;
- prove incremental, fallback, and oracle renderer parity; and
- complete documentation and final scoped review.

Each sub-checkpoint passes its focused gate before the next starts. None is a
separate public capability or authorization for 5B-2.

## 9. Verification Matrix

### 9.1 Work And Scale Fixtures

Fixtures cover:

- 1, 8, 9, 64, 65, and 128 source/line/chunk scales;
- beginning, middle, and end targets;
- minimum and maximum source-leaf widths;
- multiple source, line-tree, and Scene-tree heights;
- true no-op;
- image-paint semantic no-op;
- image-paint fact change;
- proof failure; and
- limit-minus-one, limit, and limit-plus-one for every locked V3 row.

### 9.2 Exact Accepted Behavior

True no-op returns the exact previous Root and Scene, produces no delivery
plan, and reports zero source/path-copy/Scene/delivery work. Its all-E
structural cover reports factual line-tree lookup and selected-subtree work.

Image-paint semantic no-op returns the exact previous Root and Scene. It
reports its deliberate source resolution and source-path lookup but zero source
path-copy, leaf rebuild, Scene construction, and delivery work.

Image-paint change retains the exact previous line-tree dependency, reports
every source/line/Scene/delivery operation, performs no complete next-input,
tree, suffix, or Scene traversal, and matches an independently completed
renderer result.

Every policy-bound transition result has exactly 21 canonical stage-work rows.

### 9.3 Fallback Adversaries

Tests reject:

- raw, cloned, replayed, foreign, and cross-bound failure authorities;
- caller-shaped proof, limit, or planned-complete tuples;
- proof reasons without exact failed proof authority;
- limit reasons without exact evaluator authority and work reconciliation;
- candidate data inside fallback request or complete fallback; and
- replay after successful atomic completion.

Tests also prove that bad complete material does not consume the request and
that incremental, complete-fallback, and complete-oracle ledgers remain
separate.

### 9.4 Delivery Adversaries

Tests mutate nested mapping, line-internals, geometry, paint-run, and fragment
facts, preserve stale inner identities, and recompute every outer
fragment/chunk/summary/payload/delivery hash. Inspection must still reject the
nested inconsistency with no accessor reads.

Hard-break, repeated-lineage, and split-lineage fixtures prove deterministic
paint reconstruction. Prototype, accessor, symbol, cycle, unsafe-number, and
unknown-field inputs remain blocked.

Existing private forced-collision fixtures continue to prove process-local
authority. They are not used to claim authority for detached delivery.

### 9.5 Gates

Corrective completion requires:

- all focused subsystem tests;
- standalone type-check;
- the complete repository check;
- diff hygiene;
- one final scoped review with no Critical or Important finding; and
- checked-in policy/fixture manifest and frozen ownership map.

## 10. Documentation And Historical Evidence

The original design links to this amendment rather than being rewritten as if
it had predicted the corrective decision.

The existing 5B plan, V2 fixture evidence, review verdict, and corrective fix
report remain historical evidence. After the user approves this written
amendment, a new corrective implementation plan must be written. It may cite
the historical plan but must not edit it to conceal the V2 decision sequence.

README, Live Draft, Phase Ledger, and handoff artifacts continue to describe
V2 as the review-stop implementation until V3 implementation and verification
actually pass. They may then record V3 as a new corrective result with exact
test evidence.

## 11. Explicit Non-Goals

This corrective design does not implement or activate:

- text insertion, deletion, replacement, resolved-field transition, or style
  transition from 5B-2;
- image geometry, image insertion/deletion, exclusion, spatial ripple,
  authored-box, or scale closure from 5B-3;
- Worker handles, release, queueing, scheduling, cancellation, or coalescing;
- Editor staged/atomic apply or visible-state policy;
- Backend binding, persistence, or publication;
- data-definition/binding runtime or structural expansion;
- fixed-height/overflow or image asset-loading lifecycle;
- Columns/Table integration;
- production activation; or
- Root V1/Scene V1 retirement.

Lifetime evidence remains limited to deterministic object-graph
reachability/retention. It does not claim garbage-collection timing,
reclamation, transfer cost, or product-scale memory behavior.

## 12. Corrective Stop-Gate

5B-1 corrective work is complete only when:

- the three final-review Important findings are closed by new evidence;
- V3 numeric policy and fixture calibration are frozen;
- public Core exports and active wrappers expose V3 only;
- every accepted/fallback work ledger is factual and canonical;
- proof and limit fallback requests are branch-derived;
- complete delivery rejects nested stale identities;
- focused, type-check, full-repository, and diff-hygiene gates pass;
- final scoped review reports no Critical or Important finding; and
- no 5B-2, 5B-3, cross-repository, publication, or production behavior entered
  the change.

Failure of any gate leaves the checkpoint at review stop and does not authorize
5B-2 planning or implementation.
