# Unified Incremental Root Transition 5B Design

Status: approved design baseline for the separately authorized Core-only Phase
5B checkpoint; the consolidated document remains pending final user review.
This document does not authorize implementation, Phase 5C, Editor or Backend
binding, publication, or production activation.

## 1. Decision Summary

Phase 5B adds one exact Root V2-to-Root V2 incremental transition lane over the
accepted Phase 5A dependency graph. It accepts one exact previous Root V2 plus
one strict tagged change, obtains any required producer facts through a
Core-owned bounded evidence request, and produces one of:

- an exact no-op reuse;
- an accepted incremental next Root V2 plus factual transition evidence and a
  canonical persistent-scene delivery plan;
- an exact process-local fallback request that may later be completed with
  independently supplied complete material; or
- a structured blocked result with no partial next root, scene, or plan.

The selected architecture is a bounded private stage pipeline:

```text
exact previous Root V2
  + strict tagged change
  + exact accepted bounded producer evidence, when required
  -> strict change gate
  -> persistent flow/tree transition
  -> spatial-index transition
  -> bounded layout and reconvergence
  -> authored-geometry projection
  -> persistent-scene transition
  -> atomic next Root V2 acceptance
```

Phase 5B also defines a V2-native complete bootstrap, deferred complete
fallback, persistent scene, canonical retain/splice delivery plan, complete V2
recovery delivery, deterministic work policies, and independent QA oracle
comparison.

Phase 5B remains Core-only and process-local. Core does not acquire browser
scheduling, revision queues, cancellation policy, Worker-session lifetime,
Editor visible state, Backend persistence, data-binding resolution, or
structural-operation authorization.

## 2. Goals

Phase 5B must:

1. create a complete immutable Root V2 bootstrap over the unified TextBlock
   dependency graph;
2. transition one exact Root V2 to another without recursively traversing or
   re-hashing complete retained child graphs;
3. support text, resolved-field, supported style, inline-image, exclusion, and
   authored-box changes through one versioned tagged-change model;
4. distinguish exact reuse, strict translated reprojection, recomputation, and
   newly inserted lines;
5. stop incremental work under deterministic stage-specific policies;
6. make planned-complete, proof-failed, and work-limit fallback factually
   distinct;
7. prevent partial incremental candidates from contaminating complete
   fallback;
8. compare accepted next roots with an independently built complete QA oracle;
9. retain source and provenance facts required by future data binding without
   implementing that product lane; and
10. expose a narrow reviewed package surface while keeping stage helpers and
    authority registries private.

## 3. Explicit Non-Goals

Phase 5B does not add:

- a retained browser Worker session or root-handle protocol;
- local layout revisions, request scheduling, debounce, priority, coalescing,
  advisory cancellation, stale-completion handling, or last-valid state;
- Editor pending, applied, or visible runtime state;
- atomic Editor apply or Canvas lifecycle;
- Backend revision, transport, persistence, reconciliation, or publication;
- fixed-height, overflow, clipping, or asset lifecycle policy;
- image loading, decode, unavailable, placeholder, fit/crop paint execution, or
  byte ownership;
- list decoration or empty-block geometry;
- Columns, Table, or Table auto-fit integration;
- Data Definition, Binding Node, collection/variant expansion, manual override,
  or constrained-operation execution;
- a generic persistent collection, graph patch engine, CRDT, document-level
  scene graph, or revision history store;
- V1 retirement; or
- publication or production activation.

Every applicable Phase 5B result retains:

```text
stagedEditorApply: false
mayPublishLayout: false
productionBinding: false
```

## 4. Ownership

### 4.1 Core Owns

Core owns:

- exact immutable complete and incremental Root V2 objects;
- strict change validation and change application;
- Core-owned producer evidence requests and accepted evidence;
- persistent flow/tree and spatial-index transitions;
- dirty source/atom derivation;
- mandatory spatial seed-region derivation;
- exact and strict translated reconvergence proof;
- authored geometry and persistent renderer-scene projection;
- deterministic stage work policies and factual work ledgers;
- planned-complete and incremental fallback classification;
- canonical fingerprints;
- process-local exact authority;
- complete V2 bootstrap and deferred complete fallback; and
- structured blocked behavior with no partial accepted output.

### 4.2 Core Does Not Own

Core does not own:

- Editor transactions, revisions, scheduling, pending state, or visible state;
- browser Worker root lifetime or release acknowledgement;
- product cancellation policy;
- Backend revisions or persistence;
- Binding resolution or operation permission;
- consumer-side geometry derivation; or
- product latency, memory, or rollout policy.

### 4.3 Future Owners

Phase 5C may own a Worker-session protocol around exact Core objects without
turning handles into Core authority. Phase 5D may own Editor revisions,
scheduling, stale-result rejection, last-valid retention, and atomic scene
apply. Backend continues to own persisted document revisions and durable
mutation gates.

## 5. Versioning And V1 Retirement Boundary

Phase 5B introduces Root V2 and Persistent Scene V2 because accepted Root V1
contains a complete flat Scene V1 and explicitly denies an incremental
transition claim.

Root V1 and Scene V1 are frozen:

- compatibility and historical Phase 5A evidence;
- an additional independent QA reference;
- not an active incremental root;
- not a complete fallback result;
- not retained layout history; and
- not a dependency of V2 recovery delivery.

Root V2 is the only active 5B root:

- complete bootstrap output;
- previous and next incremental root;
- complete fallback output; and
- owner of the exact Persistent Scene V2 dependency.

V1 retirement requires a later consumer and evidence audit. No Phase 5B
implementation may add new feature behavior to Root V1 or Scene V1.

## 6. Public Boundary

The reviewed public package surface contains only versioned contracts,
inspectors, and orchestration boundaries required by a future Worker adapter:

- complete Root V2 bootstrap;
- create a Core-owned transition evidence request;
- accept producer output against that exact request;
- attempt a Root V2 transition;
- complete an exact fallback request with independent complete material;
- create complete V2 recovery delivery;
- inspect Root V2;
- inspect transition request/evidence/result/fallback request;
- inspect Persistent Scene V2; and
- inspect incremental and complete V2 scene-delivery data.

Private stage helpers include:

- source/change verification internals;
- flow/tree and spatial transition internals;
- reconvergence search and proof builders;
- geometry projection internals;
- persistent scene node constructors and path-copy helpers;
- fallback planning;
- root assembly;
- canonical-fact helpers; and
- WeakMap/registry authority state.

Consumers cannot call a stage helper to assemble a root or bypass the unified
transition gate.

## 7. Root V2 Bootstrap And Transition Pipeline

### 7.1 Complete Bootstrap

The complete Root V2 bootstrap:

1. accepts strict Core synthetic QA input;
2. validates the exact Initial Flow and producer-evidence authority;
3. builds the persistent flow tree and spatial index;
4. computes the Flow Region Provider authority and spatial layout;
5. projects authored-box geometry;
6. projects complete logical renderer chunks;
7. builds the Persistent Scene V2 tree;
8. binds the fixed Root V2 dependency set compositionally; and
9. registers the complete Scene and Root atomically.

Complete bootstrap reports its complete work explicitly. It does not claim
incremental reuse.

### 7.2 Private Stage Pipeline

An incremental attempt executes private stages in order. Each stage returns:

```text
accepted
needs-complete-fallback
blocked
```

Only the unified boundary returns a public result. A stage cannot register or
publish a partial root, scene, geometry, tree, index, or delivery plan.

### 7.3 Atomic Acceptance

Candidate children remain unregistered until every required stage and
cross-dependency check succeeds. Atomic acceptance registers the complete next
Persistent Scene V2 and Root V2 together.

On fallback or block:

- previous Root V2 remains valid and immutable;
- no partial next object appears in the public result;
- candidate wrappers are not registered;
- candidate children, dirty ranges, reconvergence hints, summaries, and
  fingerprints do not enter the complete fallback builder; and
- partial candidates are released to ordinary process-local garbage
  collection when the attempt returns.

## 8. Tagged Change Contract

### 8.1 Input

The incremental hot path accepts:

```text
exact previous Root V2
+ exact strict tagged change
+ exact accepted bounded producer evidence, when required
```

It does not require or compare a complete next canonical input.

### 8.2 Change Union Version 1

The closed versioned change union includes:

- text insertion, deletion, and replacement;
- resolved-field rendered-value change;
- supported style change;
- inline-image insertion, deletion, and movement;
- image-frame resize;
- image vertical-alignment change;
- image paint-fact change;
- exclusion insertion, deletion, movement, and resize;
- supported authored-box width or inset change; and
- no-op.

Future binding-value, collection, variant, override, and structural-expansion
changes require later versioned unions. Unknown change versions block.

### 8.3 Change Honesty

Core applies the strict change to the exact previous persistent semantic facts.
The caller does not supply authoritative dirty ranges, invalidated lines,
affected spatial bands, reconvergence hints, reuse claims, or fallback
decisions.

Malformed, extra-field, accessor-shaped, proxy-shaped, identity-mismatched, or
unsupported changes block before producer or layout work.

## 9. Incremental Eligibility

Every supported change has one policy class:

```text
required
permitted
complete-only
```

Required changes must start a real incremental attempt. They cannot become
planned-complete because a block is large or the implementation regards the
case as complex.

Required families include:

- bounded text insertion, deletion, and replacement;
- bounded resolved-field changes;
- bounded local supported style changes;
- bounded inline-image insertion, deletion, movement, and frame resize;
- bounded exclusion insertion, deletion, movement, and resize;
- image vertical alignment and paint-fact changes; and
- no-op.

Permitted families include supported authored-box width/inset changes and
explicit factual whole-block spatial impacts. Planned-complete is allowed only
for allowlisted policy facts and exact reason codes.

Forbidden planned-complete reasons include block size alone, implementation
complexity, preference, or unmeasured timing.

## 10. Result And Fallback Protocol

### 10.1 Attempt Result

The attempt boundary returns:

```text
accepted-no-op
accepted-incremental
fallback-required
blocked
```

### 10.2 Fallback Modes

Fallback requests distinguish:

```text
planned-complete
incremental-proof-failed
deterministic-work-limit-exceeded
```

They also state whether incremental work was attempted.

### 10.3 Deferred Fallback Request

Complete next canonical material is not carried by the incremental hot-path
request. When fallback is required, Core creates an exact process-local
fallback request containing only:

- fallback mode and exact reason;
- skipped or failed stage;
- previous Root fingerprint;
- change fingerprint;
- target TextBlock/source identity;
- expected target semantic/content binding facts;
- work-policy fingerprint;
- factual incremental-attempt work; and
- fallback-request fingerprint.

The request does not retain candidate tree, index, layout, geometry, scene,
producer output, dirty range, or reconvergence state.

### 10.4 Complete Fallback Material

After receiving `fallback-required`, a caller or future Worker supplies:

- strict complete canonical TextBlock input;
- complete producer evidence;
- complete authored and spatial inputs; and
- the exact fallback request.

This material is accepted only by the complete-fallback boundary after the
incremental attempt has ended. It is never attached to, prefetched for, or
compared by the incremental attempt.

The complete fallback builder:

1. validates exact fallback-request authority;
2. starts from complete material independent of the incremental candidate;
3. builds a complete Root V2 and Persistent Scene V2;
4. derives target semantic/content fingerprints from that build;
5. binds them to the fallback request and change target;
6. registers complete outputs atomically; and
7. returns `accepted-complete-fallback` or a structured block.

A target mismatch blocks as a fallback-target binding failure.
No object, range, summary, hint, or decision produced by the failed candidate
is an input to this builder.

### 10.5 Work Lanes

Work facts are never merged:

```text
incrementalCandidateWork
completeFallbackWork
completeOracleWork
```

Oracle work exists only in QA comparison records, never in the production
transition result.

## 11. Core-Owned Producer Evidence

### 11.1 Evidence Request

For a change that requires new shaping or breaking facts, Core derives an exact
bounded evidence request from:

- exact previous Root V2;
- validated tagged change;
- persistent source/tree summaries;
- shaping, style, font, unit, and layout-context dependencies; and
- the checkpoint work policy.

Deriving the request is itself bounded by registered subtree summaries and the
validated change payload. It cannot traverse a complete suffix, inspect a
complete next input, or ask the caller to nominate an affected range.

The request binds:

- previous Root and change fingerprints;
- document, section, TextBlock, and source identity;
- required previous and next source ranges;
- required left/right shaping context;
- font/style/unit-policy fingerprints;
- producer-runtime requirements;
- maximum evidence coverage;
- work-policy fingerprint; and
- request fingerprint.

Caller-supplied start/end ranges are not accepted.

### 11.2 Producer Response

The producer returns only the requested factual material:

- clusters and advances;
- break/context facts;
- exact coverage;
- runtime/font/style dependencies; and
- source topology required by the request.

Producer output cannot declare a dirty range, affected line, spatial band,
reconvergence point, reuse claim, or fallback decision.

### 11.3 Accepted Evidence

Core accepts a producer response only when:

- it answers the exact registered request;
- coverage has no gap, overlap, widening, or narrowing;
- runtime/font/style/unit identities match;
- source and cluster topology is canonical;
- previous Root and change bindings match;
- fingerprints are valid; and
- all capability facts remain false.

Accepted evidence is registered against the exact tuple:

```text
evidence request
+ previous Root
+ change
+ producer runtime identity
```

Fingerprint equality does not substitute for exact tuple authority.

### 11.4 Evidence Work

Incremental evidence reports:

- requested atom/cluster counts;
- consumed counts;
- unused bounded coverage;
- visited evidence nodes; and
- complete-next-input traversal and comparison counts, both required to remain
  zero for accepted incremental common paths.

Image, exclusion, and paint-only changes that need no new shaping facts use no
producer request.

## 12. No-Op And Paint-Only Changes

True no-op:

- returns the exact previous Root V2 and Persistent Scene V2;
- creates no root generation inside Core;
- creates no child or scene node;
- emits no replacement chunk; and
- records accepted no-op work.

An image `fit` or `crop` paint-fact change:

- reuses flow/tree, spatial, layout, and authored geometry;
- creates a new scene/root fingerprint;
- replaces only affected image scene chunks;
- invalidates zero lines; and
- remains mandatory incremental.

Editor local layout revisions remain a later Editor concern and do not force a
new Core root for a true no-op.

## 13. Line Disposition

Every next line belongs to exactly one primary disposition:

```text
E = exact reused
T = translated and reprojected
R = recomputed existing lineage
N = inserted/new lineage
```

The sets are mutually exclusive and exhaustive:

```text
E ∩ T = E ∩ R = E ∩ N = T ∩ R = T ∩ N = R ∩ N = ∅
|E| + |T| + |R| + |N| = nextLineCount
```

Removed previous lines are counted separately.

Line-internals, geometry, and scene-work counters are orthogonal:

- translated lines may reuse line internals;
- translated positioned geometry is reprojected, not exact-reused; and
- translated scene chunks are replacements, not retained chunks.

## 14. Reconvergence

### 14.1 Exact Reconvergence

Exact suffix reuse requires matching:

- source/atom cursor;
- semantic source/provenance summary;
- line internals and layout context;
- spatial continuation;
- authored y position and geometry fingerprint;
- previous Root/TextBlock/content identity;
- Core process-local authority; and
- work-policy identity.

### 14.2 Strict Translation-Only Reconvergence

Translated reprojection requires proof that:

- line internals and source/provenance remain unchanged;
- one constant y delta applies to the retained suffix;
- destination spatial environment is compatible;
- no page, box, flow-region, barrier, or semantic boundary is crossed;
- authored bounds remain valid;
- positioned geometry and scene chunks are rebuilt; and
- exact and translated reuse remain separately counted.

If a required boundary-compatibility fact is absent, Core disables translation
reuse rather than inferring it from visual similarity.

### 14.3 Bounded Summary Proof

Reconvergence cannot silently walk a complete suffix. Persistent line and scene
subtrees expose compositional summaries for:

- source/atom ranges;
- line and fragment counts;
- line-internals fingerprints;
- source/provenance fingerprints;
- boundary and spatial-context fingerprints; and
- authored y bounds.

Transition evidence reports visited proof nodes, accepted and rejected summary
proofs, and a complete suffix traversal count that must remain zero on accepted
incremental paths.

## 15. Spatial Seed Region

For spatial changes:

```text
old affected band ∪ new affected band
= mandatory recomputation seed region
```

The union is not a maximum invalidation boundary. Layout may ripple beyond the
seed. Core recomputes the seed, proceeds under the layout-stage work policy,
and stops only at exact/translated reconvergence or a deterministic limit.

Image-expanded line bands must re-query the spatial provider when image height
changes the band that can intersect exclusions.

## 16. Persistent Scene V2

### 16.1 Non-Capabilities

Persistent Scene V2 is not:

- a generic persistent sequence;
- an arbitrary graph editor;
- a document tree;
- a cross-TextBlock scene;
- a scheduler, history, persistence, CRDT, asset store, or selection model;
- a public random-access mutation API; or
- Core authority after structured clone.

### 16.2 Structure

The dedicated balanced tree contains ordered renderer chunks in leaves and
equal-height children in branches. Subtree summaries contain:

- chunk and line counts;
- text/image fragment counts;
- deterministic estimated canonical payload bytes;
- source-range and authored-y bounds;
- line-internals fingerprint;
- source/provenance fingerprint;
- boundary/spatial-context fingerprint; and
- subtree fingerprint.

Leaf fingerprints compose ordered chunk fingerprints, summary facts, and
policy fingerprints. Branch fingerprints compose ordered child fingerprints,
summary facts, and policy fingerprints.

There is no linear suffix-rehash chunk chain.

### 16.3 Path Copy

Incremental scene updates retain unchanged subtrees and copy only touched
paths. Hot-path validation inspects:

- exact previous registered scene;
- validated changed ranges;
- copied paths;
- replacement leaves/nodes;
- sibling summary/fingerprint references on copied paths; and
- the new scene root summary/fingerprint.

Accepted incremental paths require zero complete scene-tree traversals and zero
complete scene re-hashes.

## 17. Canonical Retain/Splice Delivery Plan

### 17.1 Indexing

All chunk indexes are zero-based half-open ordinals. Operations are:

```text
retain-range
splice-range
```

`splice-range` covers insert, delete, and replace by allowing either previous
or next range to be empty, but never both.

Operations use immutable previous and next domains. They are not interpreted
against an array mutated by preceding operations.

### 17.2 Canonical Maximal-Subtree Retain Cover

A retained range uses one unique maximal-subtree cover:

1. start at the left edge;
2. select the largest policy-aligned retained subtree wholly inside the range;
3. advance to its end; and
4. repeat until coverage is complete.

Non-maximal decomposition, invalid alignment, reordered nodes, duplicates,
gaps, and alternate equivalent covers block.

### 17.3 Inspector Proof

The plan inspector proves:

- complete previous and next domain coverage;
- no overlap, gap, or out-of-range index;
- canonical operation ordering;
- canonical maximal-subtree retain covers;
- retained subtree fingerprints against the previous scene;
- replacement chunk fingerprints and counts;
- final line/chunk/fragment/payload summaries; and
- the composed next scene fingerprint.

Inspector work is bounded by plan and replacement-payload size. It cannot walk
the complete previous or next scene.

### 17.4 Authority

Canonical fingerprints prove deterministic integrity and equality. Exact
process-local Core authority requires registered object and dependency
references. A clone with the same fingerprint is renderer data only.

## 18. Deterministic Payload Estimation

Scene payload estimates use a versioned, fingerprinted policy over an exact
allowlist and canonical UTF-8 data-only representation.

The deterministic fact is named:

```text
estimatedCanonicalPayloadByteCount
```

It is not JavaScript memory size, structured-clone allocation, actual transfer
bytes, or duration. Real transfer observations belong to Phase 5C and product
budgets belong to Phase 5D.

## 19. Complete V2 Recovery Delivery

Persistent Scene V2 has a V2-native complete delivery boundary that emits all
renderer chunks and binds the exact Root V2/Persistent Scene V2 fingerprint.

Complete recovery delivery:

- is versioned and structured-clone-safe;
- reports one explicit complete-delivery count;
- reports complete visited, emitted, and deterministic payload work;
- is requested when a future consumer lacks a retained range required by an
  incremental plan; and
- does not depend on Scene V1.

Actual Worker transport and Editor recovery apply remain Phase 5C/5D.

## 20. Work Policies

### 20.1 Deterministic Stage Units

Wall-clock time never selects an execution path. Policies are stage-specific:

- flow/tree: visited atoms and tree nodes;
- spatial: visited index nodes and queried bands;
- layout/reconvergence: recomputed lines and proof nodes;
- geometry: reprojected lines and visited fragments; and
- scene: copied nodes, replacement chunks, plan size, and deterministic
  estimated payload bytes.

Different units are not added into one aggregate score.

### 20.2 Effective Limits

Each stage uses:

```text
effectiveStageLimit =
  max(smallBlockFloor, min(absoluteStageLimit, relativeStageLimit))
```

Relative bases derive from registered previous-root summaries plus exact
validated change deltas. Computing a limit cannot require a complete next-input
scan or complete next output.

### 20.3 Calibration And Lock

Policies lock separately:

- 5B-1: scene-tree and delivery-plan policy;
- 5B-2: flow/tree, layout, and reconvergence policy; and
- 5B-3: spatial, image, and geometry policy.

Each checkpoint must publish:

- its declared fixture matrix;
- baseline and calibration evidence;
- exact floor, absolute, and relative values;
- limit-minus-one, limit, and limit-plus-one tests; and
- a frozen work-policy fingerprint.

No checkpoint closes with placeholders, infinity, or temporary unversioned
limits. Changing a locked policy requires an explicit version bump and rerun of
the binding fixture matrix.

## 21. Future Data-Binding Compatibility

Phase 5B does not implement data binding, but it preserves these invariants:

- identical rendered text does not imply identical semantic source;
- exact and translated reuse bind source and provenance facts;
- scene chunks retain Core-projected source mapping;
- changes and summaries retain opaque fingerprinted source identities;
- the change union remains versioned and closed;
- unknown future structural changes fallback or block explicitly; and
- layout success does not authorize a Definition/Instance operation.

Definition owns structure, authored constants, projection rules, and operation
policy. Canonical input owns instance values. Document Instance owns resolution,
override provenance, and durable revision. Layout consumes a resolved canonical
projection without learning external API or form-UI semantics.

## 22. Error And Recovery

### 22.1 Immediate Blocks

Immediate blocks include:

- malformed or unsafe envelopes;
- wrong exact Root, request, evidence, or policy authority;
- Root/TextBlock/content/source binding mismatch;
- change/evidence mismatch;
- unknown versions;
- unsafe arithmetic;
- production or staged-apply requests; and
- source/provenance drift.

An invalid previous Root does not trigger implicit complete fallback. The
caller must invoke complete bootstrap explicitly.

### 22.2 Fallback-Eligible Failures

Valid fallback cases include:

- allowlisted planned-complete;
- bounded proof failure;
- deterministic stage-limit exhaustion; and
- a supported valid change whose reuse cannot be proven.

### 22.3 Structured Results

Ordinary invalid input returns structured issues with canonical ordering.
Blocked results expose:

```text
root: null
persistentScene: null
deliveryPlan: null
```

No timing, stack trace, engine-specific error string, or memory observation
enters deterministic fingerprints.

## 23. Lifetime Correctness

Phase 5B must prove:

- no strong global root history;
- no previous Root wrapper retained by a distinct next Root;
- no previous Scene wrapper retained by a distinct next Scene;
- weak-only process-local authority registration;
- structural sharing retains only child subtrees reachable from next Root;
- candidates are not registered before acceptance;
- blocked and fallback results do not retain candidate graphs; and
- true no-op is the only path returning exact previous wrappers.

Deterministic reachability/ownership tests are gating. Forced-GC,
`WeakRef`, or `FinalizationRegistry` observations may be recorded but cannot be
deterministic PASS gates.

Worker handles, transfer buffers, thousands-of-revisions browser memory, and
release acknowledgements remain later evidence.

## 24. Verification

### 24.1 Oracle Lane

Complete-oracle comparison is QA-only. It is not invoked by the production
transition hot path and cannot influence dirty ranges, reconvergence, fallback,
candidate repair, or acceptance.

An external comparator checks incremental/fallback Root V2 against an
independently built complete Root V2 in:

- semantic/source/provenance facts;
- flow/tree and spatial facts;
- line/fragment geometry;
- Persistent Scene V2;
- complete V2 delivery; and
- normalized deterministic fingerprints.

Root V1/Scene V1 provide an additional frozen reference comparison during the
transition period.

### 24.2 Required Adversarial Evidence

Tests cover:

- cloned, foreign, mutable, proxy, accessor, symbol, and class-shaped inputs;
- forged and cross-bound request/evidence/root tuples;
- forced digest collision through an isolated test-only non-production seam;
- rendered equality with source/provenance inequality;
- translated-looking geometry with incompatible destination spatial context;
- boundary crossing;
- forged subtree summary and retain cover;
- plan gaps, overlaps, reordering, and final-count mismatch;
- change-gate hidden whole-input scans;
- candidate contamination of fallback;
- policy fingerprint drift;
- threshold stability; and
- exact Node-native/Worker-WASM facts and counter parity.

The forced-collision seam is test-only, unexported, and unavailable to the
production fingerprint algorithm.

### 24.3 Resolved-Field Matrix

Resolved-field fixtures distinguish:

- identical text with changed binding/source provenance;
- changed text with identical metrics/geometry;
- changed text with changed metrics;
- value changes crossing line boundaries; and
- identical value, identity, and provenance true no-op.

### 24.4 Style Matrix

Style fixtures distinguish:

- paint-only color changes;
- supported metric-affecting font/style changes;
- changed style identity/provenance with equal effective metrics;
- bounded local style changes;
- unsupported/global dependencies; and
- same effective style and provenance true no-op.

## 25. Checkpoints

### 25.1 5B-1 Transition And Persistent Scene Foundation

5B-1 delivers:

- Root V2 complete bootstrap;
- change, evidence-request/evidence, result, and fallback-request contracts;
- deterministic scene work policy;
- Persistent Scene V2;
- canonical retain/splice delivery plan;
- complete V2 recovery delivery;
- no-op and paint-only paths;
- authority, collision, lifetime, and public-boundary gates; and
- frozen 5B-1 fixture/policy evidence.

5B-2 cannot begin if hot-path scene validation performs complete traversal or
suffix rehash, retain proof is noncanonical, or incremental work materializes
Scene V1.

### 25.2 5B-2 Text And Style Transition

5B-2 delivers:

- text insertion/deletion/replacement;
- resolved-field and supported style changes;
- Core-owned bounded producer evidence;
- exact and strict translated reconvergence;
- text/layout/reconvergence work policy;
- mandatory incremental, no-op, and fallback evidence;
- independent complete V2 oracle and normalized V1 reference comparison; and
- frozen 5B-2 fixture/policy evidence.

Mandatory common fixtures cannot pass through planned-complete or complete
fallback.

### 25.3 5B-3 Image, Spatial, And Scale Closure

5B-3 delivers:

- image insertion/deletion/movement/frame resize/vertical alignment;
- paint-fact changes;
- exclusion insertion/deletion/movement/resize;
- authored-box width/inset permitted behavior;
- spatial seed-region and ripple evidence;
- image-expanded-band re-query;
- spatial/image/geometry work policy;
- planned-complete and fallback honesty;
- scale and Node/WASM parity;
- reviewed public handoff; and
- the full Core gate.

## 26. Risks

The primary risks are:

1. strict change validation becomes a hidden whole-input O(N) scan;
2. persistent scene becomes a generic framework;
3. plan validation walks retained suffix chunks rather than subtree proofs;
4. complete scene delivery or future structured clone erases incremental gain;
5. common changes regress to fallback;
6. stage limits create either frequent fallback or double work;
7. translated reuse accepts visual similarity without semantic proof;
8. fingerprint equality is mistaken for authority;
9. partial candidates contaminate complete fallback;
10. V1 and V2 become permanent active architectures; and
11. future source/binding provenance is erased by rendered equality.

Every risk has a blocking gate in Sections 20, 23, 24, or 25.

## 27. Evidence Unknowns

Phase 5B does not yet know:

- real Worker structured-clone cost;
- actual transfer bytes and buffers;
- browser/Worker memory under long sessions;
- realistic typing and image-resize latency;
- fallback frequency in realistic documents;
- garbage-collection and reclamation timing;
- multi-TextBlock scheduling interaction; or
- product-scale threshold headroom.

These are measurements, not unresolved ownership decisions.

## 28. Deferred Decisions

Later gates decide:

- Worker root handles and release acknowledgement;
- revision, cancellation, and coalescing protocols;
- Editor atomic apply and last-valid state;
- fixed-height and image asset lifecycle;
- Data Definition, Binding runtime, structural expansion, and fan-out
  invalidation;
- V1 retirement timing;
- Backend reconciliation and publication revalidation; and
- production activation.

## 29. Required Handoff Artifacts

### 29.1 Fixture And Policy Manifest

The handoff publishes a stable manifest containing:

- fixture identity;
- change family;
- block/atom/line/spatial/chunk sizes;
- required/permitted policy class;
- expected execution path and reconvergence mode;
- work-policy id and fingerprint;
- exact floor/absolute/relative limits;
- threshold-boundary rows;
- oracle identity; and
- expected counters and invariants.

### 29.2 Frozen Ownership Map

The handoff freezes:

- Core ownership and non-ownership;
- Root/Scene V1 reference roles;
- Root/Persistent Scene V2 active roles;
- future Worker, Editor, and Backend responsibilities;
- public/private boundaries;
- process-local authority versus clone-safe data; and
- all false capability facts.

### 29.3 Review Report

The handoff includes:

- PASS;
- FAIL / BLOCKER;
- RISK;
- UNKNOWN;
- files and behavior changed;
- tests and fixture manifests run;
- work-policy evidence;
- risks left; and
- intentionally unchanged capabilities and repositories.

## 30. Phase 5B Stop-Gate

Phase 5B passes only when:

- all three checkpoints pass independent review;
- mandatory daily changes are genuinely incremental;
- complete fallback is explicit and independently built;
- producer evidence answers exact Core-owned requests;
- complete next material never enters the incremental hot path;
- complete oracle remains QA-only and independent;
- exact/translated/recomputed/new line categories are exhaustive and
  non-overlapping;
- hot paths perform no complete child, suffix, scene, or next-input traversal;
- persistent scene fingerprints and delivery plans are subtree-compositional
  and canonical;
- work policies contain exact calibrated constants and stable fingerprints;
- candidate, fallback, and oracle work ledgers remain separate;
- lifetime and forced-collision gates pass;
- Node/WASM deterministic output and counter parity pass;
- the complete Core suite and type-check pass;
- no Editor, Backend, or Phase 5C implementation appears; and
- every publication, production, and staged-apply capability remains false.

Phase 5C remains a separately designed, reviewed, and explicitly authorized
checkpoint.
