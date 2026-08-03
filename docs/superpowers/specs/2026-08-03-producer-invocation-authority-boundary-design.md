# Producer Invocation Authority Boundary Design Correction

**Date:** 2026-08-03

**Status:** approved design; implementation remains blocked pending written-spec
review and a corrected implementation plan

**Scope:** FlowDoc vNext Core only, process-local, Phase 5B-2 Evidence V2 lane

**Repository baseline inspected:** `ac81d46` on
`phase-5b-unified-incremental-root-transition`

## 1. Decision

Phase 5B-2 will use a separate Core-owned producer invocation control plane.
The exact request and source material remain the data plane. A one-shot exact
process-local invocation authority carries execution permission and factual
producer work accounting before the adapter observes request, material, or
runtime payload.

The bounded capability claim applies to a **Core-authorized producer
invocation**. The exported raw adapter remains a low-level/QA surface. A raw
call without authority must stop before payload observation, but an arbitrary
caller that supplies a structurally imitated control object is outside the
Core capability claim and can never create Core-accepted Evidence, Root, or
fallback authority.

This is a correctness and ownership boundary, not a cryptographic or hostile-
process security boundary.

The accepted implementation direction is:

1. Core mints the exact producer invocation authority;
2. request, source material, runtime identity, and detached response remain
   distinct from that process-local authority;
3. Core owns the work evaluators and factual ledger behind the authority;
4. the adapter charges the authority before every owned observation or
   emission;
5. Core acceptance requires the exact authority and validates detached facts
   against the Core-owned ledger;
6. evidence owner-registry rows required by this path move before Task 3;
7. all current producer consumers migrate atomically before the Task 3 review
   stop; and
8. Task 4 remains blocked until the corrected vertical slice passes.

This correction is normative over conflicting Evidence V2 and re-baseline
plan text in:

- `docs/superpowers/specs/2026-08-01-unified-incremental-root-transition-5b-2-v3-amendment-design.md`;
- `docs/superpowers/specs/2026-08-02-unified-incremental-transition-evidence-v2-design-correction.md`; and
- `docs/superpowers/plans/2026-08-03-unified-incremental-root-transition-5b-2-rebaseline.md`.

All nonconflicting requirements remain active.

## 2. Evidence and root cause

### 2.1 Facts

The accepted 5B-1 corrective design separates three properties:

- exact process-local object authority;
- factual work performed or attempted; and
- canonical integrity of detached data.

The current Evidence V2 implementation joins them again at producer startup:

- `textBlockUnifiedLayoutTransitionPreflightV2.ts` stores
  `maximumVisitedEvidenceNodeCount` inside detached `producerWorkCeilings`;
- `unifiedIncrementalEvidenceV2.ts` reads that nested value to create its first
  meter; and
- the same detached material and producer-reported aggregate work later drive
  Core acceptance.

This creates an impossible bootstrap under the existing first-observable
contract: the adapter must know the exact limit before reading source material,
but the limit is stored inside the source material it is forbidden to read
without that limit.

The current adapter has four consumer groups, not only the two files named by
Task 3:

- `tests/textBlockUnifiedLayoutProducerEvidenceV2.test.ts`;
- `tests/textBlockUnifiedLayoutTransitionEvidenceV2.test.ts`;
- `tests/textBlockUnifiedLayoutTextStyleSourceV1.test.ts`; and
- `tests/textBlockUnifiedLayoutTextStyleFlowV1.test.ts`.

The producer-focused tests passed while the Source/Flow consumers failed after
an authority-shaped WIP changed the producer call contract. Therefore a Task 3
focused gate alone does not establish consumer compatibility.

The planned exact owner registry and granular evidence units are deferred to
Task 10, while Task 3 already requires exact producer metering. The dependency
is ordered backwards.

### 2.2 Inference

The recurring fixes are not caused primarily by low numeric limits or by the
producer algorithm. They are caused by a missing invocation boundary and an
implementation sequence that asks Task 3 to consume authority infrastructure
that does not yet exist.

### 2.3 Correction

Execution authority must arrive through a separate control argument whose
identity and evaluator state exist before payload observation. Detached
ceiling fields remain integrity and diagnostic facts only. They cannot grant
permission, select a policy, or replace the Core-owned evaluator.

## 3. Capability-honest threat boundary

The word “forged” is not used as a security claim. Core must reject:

- an unregistered invocation authority;
- a structurally equal clone;
- a stale or already consumed authority;
- a replayed authority;
- an authority bound to another Root, change, request, material, runtime, or
  work policy; and
- an authority whose detached fingerprint happens to collide.

Core does not promise to prevent arbitrary code from constructing a lookalike
object or calling a low-level shaping function with its own CPU budget. Such a
call cannot enter the accepted Core lane.

This boundary is process-local only. It provides no cross-process authenticity,
Worker transfer, session lifetime, cancellation, scheduling, or security
sandbox.

## 4. Components and ownership

### 4.1 Core request and material owner

The existing Core preflight remains responsible for:

- exact Root/change admission;
- four distinct Core-derived ranges;
- request-scoped previous and next material;
- registered style/font/unit/runtime requirements;
- exact request and material identity; and
- pre-dispatch Core work.

It must not read a complete next canonical input or complete suffix. It must
not place process-local authority inside the detached request or source
material.

When producer evidence is required, the request result also carries a separate
exact `producerInvocationAuthority`. This field is an execution envelope fact,
not part of the detached Evidence V2 semantic protocol.

### 4.2 Producer invocation authority

The authority is a frozen, one-shot, process-local object minted only after
the exact request/material tuple is registered. Its private Core record binds:

- previous Root;
- validated change;
- request;
- source material;
- work policy and policy fingerprint;
- expected runtime requirements;
- producer-unit evaluators;
- factual per-unit work ledger; and
- lifecycle state.

The authority exposes only task-specific control operations required by the
adapter:

- begin with the positional request and source-material object references,
  checking exact identity against the private Core tuple without inspecting
  either payload;
- charge one named producer unit before its observation or emission;
- bind one exact registered runtime identity after the charged identity
  descriptor read; and
- close with one terminal outcome.

It exposes no registry iterator, policy selector, Root inspector, material
factory, fallback selector, dirty range, affected line/band, reconvergence, or
reuse decision.

The authority interface may be a public TypeScript type because the adapter
imports contracts through `@flowdoc/vnext-core`. Core exports no public mint
function that accepts arbitrary material. The only authority returned is the
one produced by the exact registered request-preparation path.

### 4.3 Text-engine adapter

The adapter keeps the dependency direction
`@flowdoc/text-engine-rust-wasm -> @flowdoc/vnext-core`. Core does not import
the adapter.

The adapter receives authority as a positional control argument separate from
the descriptor-validated data input. It must:

1. begin the authority with the request/material references before observing
   the data envelope;
2. charge the correct unit before each owned descriptor, glyph, logical
   cluster, break, guard, proof, or response/failure fact;
3. stop before a disallowed observation or emission;
4. report only detached request-scoped response or failure facts;
5. return no partial incremental candidate and no fallback decision; and
6. close the authority exactly once.

The adapter cannot change the policy or effective limit. Numeric ceilings in
source material are checked for integrity against the authority record but do
not construct the meter.

An exact successful begin proves that request and material are the immutable
objects already constructed and registered by Core. The adapter still charges
each field/slot it consumes, but it does not recursively resnapshot the entire
request/material graph merely to rediscover authority. A clone, accessor
replacement, or cross-tuple object fails begin by reference before payload
observation.

Before calling `shapeRange` or `segmentRange`, the adapter must charge one
runtime invocation and the exact Core-derived input-scalar slots for that
bounded request range. A disallowed runtime call stops before invocation. The
registered Node/WASM runtime remains responsible for its internal algorithm.
The Core ledger does not claim instruction-level, allocation-level, or
wall-clock measurement inside Rust/WASM. It claims bounded invocation count,
bounded input slots, and metered observation of returned output only.

The process-local host remains responsible for pairing registered runtime
identity facts with the actual Node/WASM functions. Core can reject a different
or unregistered runtime-identity object and can validate returned facts, but it
does not cryptographically prove that arbitrary caller-supplied executable
functions deserve that identity. A deliberately dishonest same-process host is
outside this correctness boundary.

### 4.4 Core acceptance

Core acceptance receives the exact authority separately from the detached
response or failure. Before accepting it, Core requires:

- the exact registered request/material/Root/change tuple;
- the exact runtime identity bound by the authority;
- the expected one-shot terminal state;
- exact detached semantic and integrity facts;
- exact equality between detached aggregate work facts and Core-derived
  aggregates; and
- exact factual per-unit producer and acceptance ledgers.

Only Core acceptance can register Evidence V2 or mint proof-failed/work-limit
fallback authority.

## 5. Authority lifecycle

The lifecycle is closed and deterministic:

```text
created
  -> started
  -> runtime-bound
  -> producer-response | producer-failure | producer-blocked
  -> acceptance-consumed
```

Rules:

- `created` authority is bound to one exact request/material tuple;
- `begin` succeeds once;
- every charged visit is recorded before the visit;
- reaching a ceiling records the attempted unit and stops before the visit;
- runtime binding accepts one exact registered runtime identity that satisfies
  the request requirements;
- terminal close succeeds once and forbids more charges;
- Core acceptance consumes the terminal record once; and
- replay, cross-tuple use, double close, post-close charge, or double acceptance
  blocks without Evidence or fallback authority.

A new retry requires a new Core request-preparation result and authority. This
does not introduce a revision queue or Worker session.

## 6. Data flow

```text
exact previous Root + exact change
  -> Core preflight/admission/materialization
  -> detached request + detached source material
     + separate exact invocation authority
  -> adapter begins authority
  -> adapter charges before bounded range work
  -> detached producer response or factual failure
     + Core-owned terminal ledger
  -> Core acceptance with the same exact authority
  -> accepted Evidence V2
     or exact candidate-free fallback authority
     or blocked result
```

No stage receives or compares a complete next canonical input. No producer or
caller selects dirty ranges, affected lines/bands, reconvergence, reuse, or
fallback.

## 7. Work ownership and policy order

The evidence work-owner slice must exist before the corrected producer is
implemented. It is not deferred to Task 10.

The early slice must distinguish at least:

### Core preflight/materialization

- `evidence-request-descriptors`;
- `evidence-context-atoms`; and
- `evidence-material-descriptors`.

### Producer

- `evidence-producer-descriptors`;
- `evidence-runtime-invocations`;
- `evidence-runtime-input-scalars`;
- `evidence-glyphs`;
- `evidence-clusters`;
- `evidence-breaks`;
- `evidence-guards`;
- `evidence-proof-facts`; and
- `evidence-response-facts`.

### Core acceptance

- `evidence-acceptance-descriptors`;
- `evidence-acceptance-comparisons`; and
- `evidence-acceptance-registrations`.

The final owner registry may add later stage owners, but it must consume these
exact reviewed rows rather than rename or collapse them silently.

Each runtime charge maps to exactly one owner row. A meta-test rejects missing,
extra, duplicate, or unknown mappings. Aggregate V2 work fields remain
detached integrity/observation facts derived from the granular ledger. They do
not replace that ledger and do not select execution.

Changing a numeric limit changes the work-policy fingerprint and calibration
revision as applicable. It does not change Root semantic identity or the
Evidence V2 semantic protocol.

## 8. Failure and fallback behavior

### Missing or unusable authority

- no authority: block before data payload observation;
- non-Core lookalike authority: outside the Core-authorized lane and never
  accepted by Core;
- stale, consumed, or cross-tuple exact authority: block;
- no partial candidate and no fallback authority.

These pre-dispatch exits use an adapter-local constant `not-invoked` result
with no Evidence V2 producer failure, request fingerprint, material
fingerprint, or runtime fact. Constructing an Evidence V2 failure by reading an
unauthorized payload is forbidden. Only an invocation that successfully began
with the exact tuple can produce a detached V2 response or factual V2 failure.

### Work ceiling

The authority records the disallowed attempted unit and the last completed
ledger. The adapter stops before the disallowed visit and returns a factual
`work-ceiling-before-visit` failure. Core may mint work-limit fallback
authority only when the exact authority terminal record proves that ceiling.

### Producer semantic/runtime failure

Missing glyph, unavailable pinned font, unsafe arithmetic, unsafe shaping
boundary, or unstable segmentation retains factual completed work. Core
validates the exact failure tuple and terminal ledger before deciding whether
the existing design permits proof-failed fallback.

### Invalid detached data

Malformed, accessor, prototype, symbol, unknown-field, unsafe-number, runtime,
or fingerprint facts block. Work already charged remains factual. Invalid data
does not fabricate zero work and cannot mint fallback unless an exact allowed
failure terminal was reached.

### Exceptions

An exception after begin closes the exact authority as producer-blocked with
the factual ledger available to diagnostics. It emits no partial response,
Evidence, candidate, or fallback authority.

## 9. Package and public boundary

The correction preserves:

- `importsCoreAsPublicPackage: true`;
- `coreImportsAdapterBack: false`;
- no shared generic authority package;
- no Core import of Rust/WASM execution;
- no exported authority registry or inspector; and
- no arbitrary source-material authority factory.

The process-local invocation authority is not structured-clone-safe and must
not appear in request, material, response, failure, Evidence, Root, Scene,
delivery, canonical JSON, or fingerprints.

The raw adapter export must be documented as low-level/QA. Only invocation
with an exact Core authority is the bounded 5B-2 hot-path capability.

The detached Transition Evidence semantic protocol remains V2. Adding the
process-local authority to the Core request-result execution envelope and the
adapter-local `not-invoked` result corrects pre-activation orchestration shapes;
it does not add authority to detached V2 data. The future 5B-2 work-policy
schema incorporates the corrected owner rows before activation. Frozen
`5b-1-v3`, Root V2, Persistent Scene V2, Attempt V1, and their accepted
fingerprints remain exact.

## 10. Required vertical proof

Before broad producer fixtures, one minimal vertical proof must establish:

```text
Core request preparation
  -> exact invocation authority
  -> zero-limit producer invocation
  -> zero payload observation
  -> factual ceiling terminal
  -> exact Core failure acceptance
  -> candidate-free fallback authority
```

The companion positive row uses the smallest sufficient limits and must reach
accepted Evidence V2. Threshold-minus-one, threshold, and threshold-plus-one
fixtures are derived from factual observations, not mirrored implementation
formulas.

## 11. Consumer and regression gates

The producer call contract changes atomically across all four known consumer
groups. The call-site graph is re-run after implementation and must find no
unclassified producer caller.

The corrected Task 3 gate includes at minimum:

- producer Evidence V2 tests;
- Core Evidence V2 acceptance/failure tests;
- Text/Style Source consumer tests;
- Text/Style Flow consumer tests;
- V2 preflight tests;
- frozen V1/5B-1 transition and work-calibration guards;
- package/public-boundary guards;
- Node-native and Worker-WASM normalized parity through the process-local host
  adapter, with authority retained on the host and never transferred to a
  Worker;
- type-check; and
- diff hygiene.

Required adversarial rows include zero-limit first observation, each granular
producer unit, invalid descriptors and runtime output, clone, stale, replay,
cross-tuple, runtime mismatch, work mismatch, and forced fingerprint collision.

Tests may assert owner-derived ledger facts. They must not reproduce a large
magic arithmetic formula from the implementation as their primary oracle.

## 12. Corrected implementation sequence

The rewritten plan must replace the current Task 3 continuation with these
ordered slices:

1. **Authority and owner foundation:** add the evidence owner rows, Core-owned
   authority lifecycle, and zero-limit vertical RED/GREEN proof.
2. **Producer migration:** change the adapter to consume the separate control
   authority and charge granular producer work.
3. **Acceptance migration:** validate terminal authority/ledger and preserve
   candidate-free failure/fallback behavior.
4. **Consumer closure:** migrate all known producer callers and run the full
   consumer gate.
5. **5B-2A review stop:** fresh Thai spec/quality review with no open Critical
   or Important finding.

Task 4 and all later tasks remain blocked until Slice 5 passes. Task 10 retains
final whole-pipeline calibration and activation, but no longer owns creation
of the evidence rows required by Task 3.

## 13. Risks and management decision

### Blocking risks

- adapter reads any payload before an exact successful charge;
- adapter invokes a runtime before charging its exact bounded call and input
  scalar slots;
- caller or detached material selects limits or work policy;
- producer-reported aggregate work replaces the Core ledger;
- authority can be reused across tuple, runtime, attempt, or acceptance;
- package dependency reverses or a generic shared framework appears;
- invalid/failing work is reset, clamped, or fabricated;
- any known consumer still uses the old call shape; or
- Task 4 begins with a failing consumer or open Important review finding.

These require correction before proceeding.

### Managed nonblocking risks

- internal type/helper placement;
- test organization;
- early calibration churn;
- low-level caller choosing to spend its own work through a lookalike control
  object; and
- diagnostics wording that does not affect capability claims.

These are resolved inside the implementation plan without reopening design.

### Deferred risks

- Worker session/handle/release;
- revision scheduling, cancellation, coalescing, or replay across processes;
- Editor staged/atomic apply;
- Backend persistence/publication;
- production activation;
- security sandboxing; and
- product-scale memory or runtime budgets.

They remain explicitly out of Phase 5B-2.

## 14. Acceptance criteria

This correction is implemented only when all of the following are true:

1. authority exists before producer payload observation;
2. Core alone owns its exact record, evaluator, and factual ledger;
3. source-material ceilings cannot change the execution path;
4. producer and acceptance work map to distinct exact owner rows;
5. zero-limit and every threshold row stop before the disallowed work;
6. invalid/failure paths retain factual, nonclamped work;
7. exact Node/WASM outputs normalize equally under equal authority limits;
8. clone, stale, replay, cross-tuple, runtime mismatch, and collision rows
   cannot create Core authority;
9. all producer consumers use the corrected boundary;
10. frozen 5B-1/V3 contracts and fingerprints remain exact;
11. no complete next-input/tree/suffix/scene/oracle traversal enters the hot
    path; and
12. a fresh review reports no open Critical or Important finding.

Implementation remains unauthorized until a corrected plan reflecting this
design is written and reviewed.
