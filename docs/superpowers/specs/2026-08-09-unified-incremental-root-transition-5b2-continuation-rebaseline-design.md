# Unified Incremental Root Transition 5B-2 Continuation Rebaseline Design

**Date:** 2026-08-09

**Status:** Umbrella design approved; Source-position amendment awaiting
written review

**Scope:** Remaining Core-only Phase 5B-2 work after the accepted Producer
Invocation Authority Boundary 5B-2A checkpoint

## 1. Decision

The remaining Phase 5B-2 continuation is replanned from the verified current
implementation state. The repository does not resume Task 4 from
`2026-08-03-unified-incremental-root-transition-5b-2-rebaseline.md` and does
not keep patching that plan.

The continuation uses:

1. this umbrella design as the cross-plan authority;
2. one roadmap covering the complete remaining capability;
3. five independent implementation plans written and reviewed one at a time;
4. a user gate between plans; and
5. a mandatory owner/policy prerequisite audit before every algorithm.

The old rebaseline plan remains historical evidence. Its completed Task 2
implementation, stopped Task 3 investigation, and architecture findings are
not erased, but its Tasks 4-11 are not executable instructions.

## 2. Normative precedence

This design governs sequencing, work-owner topology, policy composition, and
the remaining plan family. It does not reopen already accepted semantics unless
this document explicitly says so.

Precedence is:

1. the accepted Producer Invocation Authority Boundary design and final
   5B-2A implementation/review evidence;
2. this continuation rebaseline design;
3. nonconflicting requirements in the 2026-08-03 plan-lock correction;
4. nonconflicting Source-topology/fallback-target, Evidence V2, V3 amendment,
   5B-1, and original 5B designs; and
5. historical implementation plans as evidence only.

If a later implementation plan conflicts with this design, implementation
stops and the design is corrected before code changes.

## 3. Verified starting state

The continuation baseline is exact commit:

```text
e2c979271cff9968765ad73c31c6877ca8a81478
fix(layout): preserve exact post-begin work limits
```

At this baseline:

- the linked worktree is clean;
- no push or merge has occurred;
- the rejected diagnostic stash
  `c711c1135a3e3808d6b0da042c6d2eadec484431` is untouched;
- the final focused gate passes 14 files / 312 tests;
- `npm run check` passes type-check and 461 files / 2,759 tests;
- the fresh independent 5B-2A review passes all 12 acceptance criteria with
  no open Critical, Important, or Minor finding; and
- the user explicitly approved continuing beyond the 5B-2A review stop.

These are starting facts, not target numbers for later handoffs. Every plan
records its own fresh results.

## 4. Frozen foundation

The following foundation is accepted and is not reimplemented by the new plan
family:

- Root V2 and Persistent Scene V2 remain the active structural lane;
- the frozen 5B-1 V3 bootstrap, Attempt V1, policy object, runtime facts, and
  fingerprints remain exact;
- retained V1 evidence calibration/accounting remains separate and exact;
- Core-owned one-shot Producer Invocation Authority remains process-local;
- the exact Evidence slice has fifteen reviewed owner rows;
- `not-invoked` remains pre-dispatch/control-invalid only;
- exact post-begin work ceilings use the no-payload `work-limit` outcome;
- Core consumes exact terminal authority before detached payload access;
- invalid/failure paths retain factual attempted/completed work;
- public Core exports expose the authority type but no runtime mint, inspector,
  consumer, owner registry, or calibration factory; and
- no complete next-input/tree/suffix/Scene/oracle traversal enters the
  accepted Evidence hot path.

Any change to these facts requires an explicit design correction and a fresh
5B-2A regression review. A later plan may integrate this foundation but may
not silently reshape it.

## 5. Why the remaining work is replanned

The historical continuation assigns the final work-owner registry to Task 10,
while Tasks 4-9 require exact granular units and exact policies before their
first observable operation. The current code and historical roster demonstrate
three kinds of drift:

- Task 2 admission/source-coverage units appear in the future roster but not
  in the current stage-unit/policy composition;
- Task 4 Source-sidecar operations require index/style/tree units that do not
  exist in the current exact internal policy; and
- the future roster still names the pre-correction Evidence model and omits
  explicit Spatial-alias and atomic-Root operations.

Implementing an algorithm before its owner slice exists recreates the same
backward dependency that caused the Producer Invocation Authority correction.
Broad legacy counters, self-validating `stageWork`, or late Task 10 invention
are not accepted remedies.

## 6. Plan family

The remaining work is divided into five plans.

### Plan A — Work-owner topology and Persistent Source authority

Plan A owns:

- the complete reserved 5B-2 owner-unit catalog;
- exact slice ordering and composition authority;
- reconciliation of already-implemented admission/source-coverage and
  Evidence slices;
- exact internal pre-activation policy composition;
- process-local canonical candidate-work authority;
- complete and incremental Source physical-index/style-refcount sidecars; and
- full Source-stage structural authority and multi-transition tests.

Plan A does not implement Flow, Break, Spatial, Line, Scene, Delivery,
fallback, oracle, or public activation algorithms.

### Plan B — Flow metadata, Break topology, and Spatial alias

Plan B owns:

- exact Flow alias eligibility;
- bounded Flow metadata/source-mapping path copy;
- private persistent relative Break Topology;
- exact next-Source trivial-Spatial alias authority; and
- transition-chain renewal of Flow/Break/Spatial authority.

### Plan C — Bounded Line, reconvergence, disposition, and geometry

Plan C owns:

- one-line provisional recomputation;
- persistent boundary-path Line Tree splice without flattening;
- exact reconvergence summary proof;
- canonical highest-node left-to-right E/R/N cover;
- constant-translation suffix detection returning candidate-free fallback;
- mutually exclusive and exhaustive E/R/N dispositions with `T = 0`; and
- final R/N geometry plus refreshed Line sidecars/authority.

### Plan D — Scene, Delivery, Root, fallback, and oracle

Plan D owns:

- E/R/N Scene path copy;
- canonical retain/splice delivery plan;
- atomic incremental Root registration;
- candidate-independent two-step Fallback V2;
- the shared private complete bootstrap/fallback kernel; and
- a tests-only independent complete oracle with a separate ledger.

### Plan E — Calibration, public activation, manifest, and handoff

Plan E owns:

- factual calibration of the already-reviewed final owner catalog;
- the final immutable internal/public 5B-2 policy;
- public 5B-2 bootstrap, Attempt V2, and reviewed fallback boundaries;
- exact public/private export guards;
- qualified capability manifest and frozen ownership map;
- scale, lifetime, multi-transition, fallback-root continuation, and full Core
  gates; and
- final Thai review and user handoff.

Plan E may not invent, rename, collapse, or reorder owner units. A missing
operation at Plan E is a prior-plan defect, not a calibration adjustment.

## 7. Just-in-time plan rule

Only Plan A is written in implementation detail after this design passes.
Plans B-E remain roadmap entries until the preceding plan has:

- a clean committed tree;
- all focused and checkpoint tests passing;
- type-check and diff hygiene passing;
- no open Critical or Important review finding;
- a Thai evidence summary; and
- explicit user approval to continue.

The next plan begins with an interface audit of the committed predecessor. It
must not rely on filenames, types, counters, or authority shapes that do not
exist at that audited HEAD.

## 8. Work-owner slice contract

Every row belongs to one task-owned slice and records at least:

```ts
interface VNextTextBlock5B2WorkOwnerRowInternalV1 {
  readonly unit: string
  readonly owner: string
  readonly stage: string
  readonly ledger:
    | "incrementalCandidateWork"
    | "completeFallbackWork"
    | "completeOracleWork"
  readonly exactBase:
    | "sourceItems"
    | "flowAtoms"
    | "breakBoundaries"
    | "lines"
    | "sceneChunks"
    | "logicalItems"
    | "registrations"
  readonly firstObservableBoundary: string
  readonly activationPlan: "foundation" | "A" | "B" | "C" | "D" | "E"
}
```

The actual contract uses closed string unions, not open caller-supplied
strings. The illustrative interface above describes required facts.

Slice rules:

- slice objects are exact frozen process-local identities;
- clones and structurally equal objects are rejected;
- order is plan order, then normative operation order inside the slice;
- unit IDs are unique across all slices;
- a reviewed slice is append-only and immutable;
- later plans may activate reserved rows but may not rename/reorder them;
- every runtime evaluator/charge maps to exactly one row;
- every active row maps to a real operation and exact ledger;
- no row exists only to preserve a historical count; and
- final row count is always derived from composition length.

This is a task-specific 5B-2 structure, not a generic work-accounting
framework.

## 9. Reserved owner-unit catalog

Plan A audits and locks the following reserved catalog before Source algorithm
work. If code audit proves a missing or invalid row, this design is amended and
reviewed before implementation; Plan A does not improvise a name.

### Foundation admission/source coverage

```text
admission-authority-lookups
source-coverage-nodes
source-coverage-items
```

### Accepted Evidence slice

```text
evidence-request-descriptors
evidence-context-atoms
evidence-material-descriptors
evidence-producer-descriptors
evidence-runtime-invocations
evidence-runtime-input-scalars
evidence-glyphs
evidence-clusters
evidence-breaks
evidence-guards
evidence-proof-facts
evidence-response-facts
evidence-acceptance-descriptors
evidence-acceptance-comparisons
evidence-acceptance-registrations
```

These fifteen IDs are authoritative and replace pre-correction Evidence names
in the historical Task 10 roster.

### Plan A Source

```text
source-items
source-tree-lookup-nodes
source-tree-path-copy-nodes
source-leaf-slots
source-index-nodes
source-index-entries
source-index-comparisons
source-style-nodes
source-style-buckets
source-style-entries
```

Refcount observation/emission belongs to `source-style-entries`; copied Source
paths belong to `source-tree-path-copy-nodes`. No duplicate alias counter is
introduced.

#### Source physical-index position amendment

The Source physical index must not store an absolute rendered UTF-16 offset as
the retained entry's position authority. An insertion before a retained suffix
would otherwise require updating every suffix entry.

Plan A uses two coupled private persistent roots:

- an identity root keyed by exact `inlineId`, item-kind ordinal, and the
  process-local Source position key; and
- a Source-order root keyed by that position key with subtree item-count and
  rendered-UTF-16-length summaries.

An identity lookup returns the exact physical entry and position key. A bounded
Source-order lookup derives the current absolute rendered range by accumulating
prefix summaries. Retained suffix entries and subtrees keep exact identity and
require no offset rewrite.

The position key policy is task-specific and versioned:

```ts
const VNEXT_TEXT_BLOCK_SOURCE_POSITION_KEY_POLICY_INTERNAL_V1 = Object.freeze({
  version: 1 as const,
  initialStride: 4_294_967_296 as const,
  representation: "signed-safe-integer" as const,
  batchAllocation: "canonical-even-interior" as const,
})
```

For zero-based ordinal `index` in `itemCount`, complete construction uses the
exact formula:

```math
key = (2 * index - (itemCount - 1)) * 2_147_483_648
```

Adjacent complete keys therefore differ by the exact initial stride and the
complete key set is centered around zero.

For a local batch of `count` entries, the allocator selects `count` strictly
increasing safe integers inside neighboring keys `left` and `right` with the
mathematical formula
`floor(left + (right - left) * (index + 1) / (count + 1))`. Every result must be
strictly inside the interval and distinct. With no left neighbor, the exact
virtual left boundary is `right - initialStride * (count + 1)`; with no right
neighbor, the exact virtual right boundary is
`left + initialStride * (count + 1)`. Intermediate arithmetic may use private
constant-count `bigint` operations, but every boundary and emitted key must fit
the JavaScript safe-integer range.

The allocator checks `source-index-entries` before emitting each key and
`source-index-comparisons` before reading/comparing a neighboring or candidate
key. The exact position-key entries and sidecar roots participate only in
process-local authority. Sidecar fingerprints are integrity facts and cannot
substitute for exact roots or entries. None of these facts enters Source
canonical facts, Root/Scene semantic identity, delivery, fallback material, or
public JSON.

If the exact interval cannot hold the requested batch, or a boundary extension
would leave the safe-integer range, the Source owner returns candidate-free
`source-position-key-space-exhausted` authority with factual attempted and
completed work. It does not relabel the cause as a work limit and does not
relabel/rewrite retained suffix keys. Plan D later maps that exact authority to
the two-step complete-fallback protocol; the shared complete builder compacts
keys independently.

Rejected alternatives are:

- retained absolute offsets, because they require suffix rewrites;
- a history-depth delta chain, because lookup cost grows with transitions; and
- variable-length fractional keys, because they introduce unbounded key-scalar
  work and framework-like complexity not owned by the reserved catalog.

### Plan B Flow, Break, and Spatial

```text
flow-nodes
flow-atoms
flow-path-copy-nodes
break-lookup-nodes
break-path-copy-nodes
break-boundary-entries
break-groups
break-created-nodes
spatial-alias-authority-lookups
spatial-alias-registrations
```

### Plan C Line, splice, reconvergence, and geometry

```text
line-seed-lookup-nodes
line-tree-lookup-nodes
line-break-groups
line-flow-atoms
line-placement-atoms
line-source-lookup-nodes
line-source-entries
line-fragments
line-records
recomputed-lines
line-cover-proof-nodes
line-cover-path-nodes
line-splice-copied-nodes
line-splice-created-nodes
reconvergence-summary-nodes
geometry-recomputed-lines
geometry-fragments
```

There is no executable T unit.

For every accepted Line, exactly one of E, R, or N applies. T is an inactive
reserved capability, not a fourth accepted outcome in this continuation.

### Plan D Scene, Delivery, Root, fallback, complete kernel, and oracle

```text
scene-lookup-nodes
scene-path-copy-nodes
scene-replacement-chunks
scene-created-nodes
delivery-retain-cover-nodes
delivery-operations
atomic-root-authority-lookups
atomic-root-registrations
fallback-previous-logical-items
fallback-complete-logical-items
fallback-logical-spans
complete-source-items
complete-flow-atoms
complete-break-boundaries
complete-spatial-entries
complete-lines
complete-scene-chunks
complete-delivery-operations
complete-root-registrations
oracle-logical-items
oracle-break-boundaries
oracle-lines
oracle-scene-chunks
oracle-delivery-operations
oracle-comparisons
```

Plan A reserves all IDs and owners. Rows become executable only in their owning
plan after first-observable tests pass.

## 10. Policy composition

Before public activation, every plan uses an exact registered internal policy
composition:

```text
accepted foundation slices
+ all predecessor slices
+ current plan slice
+ reserved future rows marked inactive with exact reason/version
```

Composition is monotonic:

- existing row IDs, order, owner, ledger, and base do not change;
- current-plan activation changes only reviewed activation/calibration facts;
- semantic contract version, policy composition version, and fixture
  calibration revision remain separate;
- numeric limits change policy/calibration identity, not Root semantic
  identity; and
- frozen V3 and retained V1 policy objects/fingerprints never enter or change
  through this composition.

The composer is private and recognizes only exact reviewed slice objects. It
does not accept caller rows, caller limits, detached ceilings, payload bytes,
or wall clock.

## 11. Canonical candidate-work authority

Granular `stageWork` cannot prove itself. Plan A adds a narrow process-local
5B-2 candidate-work authority that binds:

```text
exact candidate-work object
+ exact policy composition
+ exact ordered row receipts
+ factual attempted/completed counts
+ compatibility aggregate relationships
+ producing stage authority
```

Rules:

- exact registry membership may precede observation;
- detached work clones and fingerprint-equal clones have no authority;
- public compatibility aggregates remain observational/integrity facts;
- rows with an independent aggregate are cross-checked against it;
- rows without a public aggregate are validated from the Core-owned receipt,
  never from `stageWork` compared with itself;
- a stale or cross-policy work object blocks before the next stage;
- no work authority appears in canonical JSON, fingerprints, Root, Scene,
  delivery, fallback request, or Worker-transfer data; and
- the authority is specific to 5B-2 candidate work, not a reusable framework.

The accepted 5B-2A Evidence implementation is integrated by registering its
already-reviewed exact authority ledger into the candidate-work authority. Its
producer/acceptance semantics are not recomputed from detached formulas.

## 12. Complete, incremental, fallback, and oracle work

The lanes remain separate:

- `incrementalCandidateWork` records only accepted incremental operations;
- the complete construction kernel may return a private receipt, but that
  receipt is not a fourth work ledger and is never relabeled incremental work;
- `completeFallbackWork` owns fallback replay plus the kernel operations when
  construction kind is `complete-fallback`; and
- `completeOracleWork` is tests-only and independent of production candidate
  or splice helpers.

Bootstrap may retain a private complete-kernel diagnostic receipt, but it
exposes no new public work ledger. Complete bootstrap and complete fallback
call one private construction kernel and differ only in envelope, provenance,
ledger destination, and the fallback replay boundary.

## 13. Cross-plan authority lifecycle

An accepted stage emits exact objects plus one private authority for the next
stage. Later stages require exact identity, current Root/change/policy binding,
and current work authority.

No transient authority crosses a published Root boundary. Every accepted
incremental Root and complete-fallback Root registers fresh current:

- admission;
- Source sidecars/authority;
- Flow/Break authority;
- Spatial alias authority;
- final Line authority/sidecars;
- Scene/Delivery authority; and
- Root authority.

Transition two and three resolve only from the latest published Root records.
A bootstrap record, previous cursor, consumed request, prior change proof, or
fingerprint-equal clone cannot authorize the next transition.

## 14. Failure and fallback behavior

- A missing slice, unknown/duplicate row, or invalid composition blocks before
  algorithm payload observation.
- A zero or exceeded limit stops before the disallowed operation and retains
  exact attempted/completed work.
- A mandatory incremental change family does not become `planned-complete`
  merely because a block is large or its implementation is difficult.
- A stale/clone/cross-policy candidate-work authority blocks with no partial
  next-stage candidate.
- Partial Source, Flow, Break, Spatial, Line, Scene, Delivery, or Root
  candidates never enter fallback.
- Only exact Core evaluator/proof/cause authority can request fallback.
- Constant-translation suffix detection returns candidate-free fallback before
  suffix/Scene enumeration and never creates T work.
- Complete fallback material arrives later through the complete-fallback
  boundary; it is never taken from the partial candidate.
- Invalid detached data retains factual work already charged and cannot create
  authority from fingerprints or detached ceilings.

## 15. Per-plan prerequisite audit

Before each detailed plan is approved, it must prove:

1. every consumed type/function/object exists at the audited HEAD;
2. every operation has an exact reserved owner row;
3. every active row has an evaluator and ledger destination;
4. every output has a next-stage exact authority tuple;
5. complete and incremental builders share only the approved private kernel or
   task-specific pure logic;
6. no task consumes an authority, row, policy, or sidecar owned by a later
   plan;
7. public/frozen contracts touched by the plan have explicit non-drift guards;
8. first-observable and limit exits can be tested independently; and
9. the task fits its file responsibility boundary without creating a generic
   framework.

Any failure is a plan defect. The implementation does not start until the plan
or design is corrected and reviewed.

## 16. Verification model

Every plan uses TDD and requires:

- RED proof against the committed predecessor;
- owner roster/order/uniqueness/ledger/base tests;
- owner-derived limit-minus-one, limit, and limit-plus-one tests;
- a zero-limit first-observable hostile probe for every activated row;
- clone, stale, replay, cross-policy, cross-Root, and forced-collision rows;
- complete/incremental/fallback/oracle ledger separation;
- old-Root immutability and multi-transition current-authority tests;
- no complete suffix/tree/Scene/next-input access instrumentation;
- focused task and checkpoint gates;
- type-check and diff hygiene;
- a clean focused commit;
- task-scoped and checkpoint-independent review; and
- a separate Thai review with PASS, FAIL/BLOCKER, RISK, UNKNOWN, changed
  files, behavior, tests, remaining risks, and intentionally unchanged scope.

Tests derive expected values independently. They do not mirror implementation
formulas, grep source text as behavioral proof, or assert mock behavior.

## 17. Plan exit gates

A plan passes only when:

- all required algorithms and owner slices in that plan are complete;
- every active row has direct operational evidence;
- no open Critical or Important finding remains;
- Minor findings are fixed or explicitly carried into the next independent
  review with a ruling;
- all focused/checkpoint tests and type-check pass from the final commit;
- the worktree is clean;
- no push or merge occurred; and
- the user reviews the Thai evidence and explicitly authorizes the next plan.

## 18. Capability-honesty constraints

The continuation preserves capability names that match the proof actually
performed.

### Change classification

- `true-no-op` means semantic/source identity, paint, geometry, and provenance
  are unchanged. Only this class may return the exact previous Root and Scene.
- `semantic-only-change` means visible output may be identical while source or
  provenance changes. It is not a true no-op and must publish fresh current
  Root/Source authority. Exact Line/Scene retention requires independent exact
  structural authority.
- `paint-only-change` changes paint without changing layout. Its next Line Tree
  dependency must be the exact previous Line Tree dependency by identity; an
  implementation may not build a replacement wrapper and later prove it
  fingerprint-equal.
- `geometry-affecting-change` enters the bounded Line/geometry path and must
  satisfy the active change-family policy.

Whole-subtree exact structural reuse for true-no-op or paint-only work is not
called reconvergence and does not claim that every Line was walked. Text-layout
reconvergence is a separate Plan C proof over the bounded recomputation and
retained suffix boundary.

### Canonical retained cover

The delivery retain cover is a canonical maximal-subtree cover. Plan D must
lock:

- one canonical tree-shape policy;
- one versioned balancing policy;
- highest eligible maximal nodes before descendants;
- deterministic left-to-right tie-breaking; and
- fixtures in which an equivalent range arrives through different tree shapes
  and is either normalized or blocked by the same explicit rule.

Fingerprints are integrity facts, never process-local structural authority.

### Authored-box changes

Supported authored-box width/inset changes remain permitted rather than
universally required, but `planned-complete` is not a blanket escape hatch.
The owning plan must assign an explicit expected path to fixtures for:

- inset-only translation with unchanged content width;
- a width change with a small wrap change;
- a width change affecting the whole block;
- top/bottom inset changes;
- left inset with unchanged content width; and
- inconsistent outer width.

Any required family must attempt its bounded incremental policy before a
factual work limit or exact unsupported condition may request fallback.

### Scene identity, payload sizing, and fixture labels

Estimated delivery payload bytes are observational evidence only. They never
select a Core execution path. Scene semantic identity is kept separate from
delivery/estimation-policy identity so that changing the estimator does not
silently change renderer semantics.

An empty fixture is labelled structural calibration and does not advertise an
empty-block capability. A 128-exclusion fixture remains an inactive reference
fixture until exclusion incremental transition is explicitly implemented and
qualified.

Lifetime evidence is described only as object-graph retention. It does not
claim GC timing, Worker lifetime, or product-scale memory correctness.

## 19. Scope boundary

The complete plan family remains:

- Core-only;
- process-local;
- Root V2/Persistent Scene V2 active;
- image-free for active text/style transition;
- canonical trivial Spatial only;
- unchanged supported auto-height authored box only;
- `E/R/N` active with `T = 0`;
- no complete next input/suffix/Scene/oracle production traversal;
- no caller-selected dirty range/reconvergence/reuse/fallback;
- no wall-clock or payload-estimate execution choice; and
- no generic tree, registry, authority, work-meter, renderer, or transport
  framework.

The following remain out of scope:

- 5B-3 geometry/exclusion/image work;
- inline-image transition and asset loading/decode lifecycle;
- fixed-height/clipping/overflow execution;
- Columns/Table integration;
- Worker session/handle/release and cross-process transfer;
- scheduling, cancellation, coalescing, and revision queues;
- Editor staged/atomic apply and visible-state orchestration;
- Backend binding, persistence, publication, and production transport;
- Data Definition/Binding runtime or structural expansion;
- production activation outside the qualified Core manifest;
- V1 retirement; and
- security-sandbox or product-scale memory claims.

Future data binding remains an architectural north star only; it creates no
runtime, owner row, public contract, or structural expansion in this plan
family.

Lifetime correctness remains limited to object-graph retention.

## 20. Risks and management decisions

### Blocking risks

- an algorithm starts before its owner slice/policy/authority exists;
- a row is added or renamed during Plan E calibration;
- canonical work validates granular rows from its own detached `stageWork`;
- a broad legacy counter hides multiple first-observable operations;
- a complete builder reports work as incremental;
- an exact identity requirement is replaced by a fingerprint comparison;
- any accepted path enumerates a complete suffix/tree/Scene/next input;
- a later plan owns a prerequisite needed by the current plan; or
- frozen V3/retained V1 behavior or identity drifts.

These stop work and require correction before implementation continues.

### Managed risks

- internal policy-composition version churn before public activation;
- additional private owner rows discovered by the Plan A audit;
- focused file growth in existing transition/work-policy modules; and
- calibration-value churn from factual fixtures.

Plan A must resolve owner-row discovery before Source algorithm work. File
growth that crosses responsibility boundaries requires a focused split, not a
generic framework.

### Deferred unknowns

- product-scale runtime and memory budgets;
- GC timing;
- dishonest same-process host behavior outside the accepted capability;
- Worker/process lifetime;
- Editor/Backend/product orchestration; and
- production rollout.

## 21. Handoff rule

After this design is approved, only Plan A is written. The old rebaseline plan
is retained with a superseded banner, and the completed Producer Invocation
Authority plan is retained as the frozen 5B-2A implementation record.

No remaining implementation begins until Plan A is written, critically
reviewed against this design, committed, and approved by the user.
