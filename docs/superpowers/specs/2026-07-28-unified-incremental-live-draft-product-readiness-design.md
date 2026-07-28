# Unified Incremental Live Draft Product-Readiness Design

**Date:** 2026-07-28

**Status:** Approved architecture direction; implementation remains separately
authorized

**Scope:** FlowDoc vNext Core, Editor, and the browser Worker boundary; Phase 5

**Depends on:**

- Phase 4B Inline Image Line-Box Geometry;
- the accepted MR1 rapid-edit lifecycle;
- the accepted MR1 multi-block scheduler; and
- the existing cross-repository ownership map.

## 1. Decision Summary

Phase 5 will evolve the accepted Phase 4B V2 geometry path into one retained,
incrementally replaceable TextBlock layout root and connect it to the existing
Editor-owned Live Draft scheduler. It will not move browser scheduling, pending
UI state, cancellation policy, or visible-scene ownership into Core.

The selected architecture has four owners:

- Core owns deterministic layout semantics, the immutable unified root,
  transition validation, reuse/reconvergence evidence, and renderer-consumption
  scene projection.
- The browser Worker runtime owns the process-local lifetime of exact Core
  objects and invokes producer plus Core transitions.
- Editor owns local layout revisions, scheduling, priority, coalescing,
  advisory cancellation, stale-result rejection, last-valid retention, and
  atomic visible-scene apply.
- Backend continues to own persisted document revisions, base-revision gates,
  transport, and persistence. It does not enter the per-frame layout queue.

This design extends existing boundaries rather than creating a second
scheduler, a second layout authority, or a Core-owned browser session.

Phase 5 is split into five independently reviewable stop-gates:

1. 5A Unified TextBlock Retained Root;
2. 5B Unified Incremental Transition;
3. 5C Retained Worker Session and Revision Protocol;
4. 5D Atomic Editor Staged Apply and realistic performance; and
5. 5E Product capability and activation decision.

Passing an earlier gate does not authorize a later gate. Passing 5D does not
implicitly activate publication or production.

## 2. Why This Shape

Several architectures can produce correct output in isolation. The relevant
question is which architecture preserves the capability of the systems already
built without transferring unrelated responsibilities into them.

Phase 4B already provides:

- strict V2 producer evidence for text, hard breaks, and inline images;
- a V2 persistent flow tree;
- V2 spatial index, update, and Flow Region Provider contracts;
- V2 spatial line placement;
- V2 authored-box geometry;
- exact process-local identity and provenance gates; and
- text-only and image-aware execution over shared internal kernels.

Editor already provides bounded QA evidence for:

- debounce and queued-work coalescing;
- document-revision and content-fingerprint stale gates;
- advisory cancellation;
- last-valid retention;
- active/visible/near-viewport/offscreen priority;
- per-TextBlock queued replacement;
- all-required-block composition; and
- scratch-surface Canvas paint followed by one visible swap.

Rebuilding scheduling inside Core would duplicate proven Editor behavior and
would make Core depend on timing, viewport, and UI lifecycle policy. Building
the V2 chain directly in Editor would expose Core internals and create multiple
independently replaceable layout authorities. Serializing and reconstructing
the Phase 4B objects across the Worker boundary would break their exact
process-local identity model.

The selected architecture joins the existing seams:

```text
Editor intent and scheduling
  -> versioned Worker request
  -> Worker-retained exact Core root
  -> producer evidence
  -> Core root build or transition
  -> Core renderer-consumption scene
  -> versioned Worker response
  -> Editor stale gate
  -> atomic last-valid replacement
```

## 3. Global Invariants

Every Phase 5 subphase must preserve these invariants:

1. Core does not own debounce, job priority, pending Editor state, Canvas
   lifecycle, or product cancellation policy.
2. Editor does not inspect or assemble the persistent tree, spatial index,
   Flow Region Provider, line layout, or authored-box geometry.
3. Worker process-local storage is a lifetime mechanism, not publication or
   product authority.
4. Backend persisted document revision and Editor local layout revision are
   distinct identities.
5. Cancellation is an optimization. Current revision, request identity,
   content fingerprint, and root identity form the correctness gate.
6. Text-only and image-aware TextBlocks use the same V2 root path.
7. Phase 5 supports one image placement mode: `inline-flow`.
8. An authored inline-image frame owns outer layout width and height. `fit` and
   `crop` remain paint-inside-frame facts.
9. Incremental output is accepted only when it is exactly equivalent to the
   separately produced complete V2 QA oracle.
10. A blocked or stale transition cannot expose a partial root, partial scene,
    or mixed-revision result.
11. The no-exclusion text-only fast path remains available and is measured
    separately from the spatial/image path.
12. Renderer consumers do not measure, reflow, or reconstruct missing Core
    geometry.
13. `mayPublishLayout: false` and `productionBinding: false` remain mandatory
    until Gate 5E explicitly changes them for a named capability slice.
14. Gates 5A through 5C retain `stagedEditorApply: false`. Gate 5D may grant
    `stagedEditorApply: true` only on its new unified response boundary, behind
    the reviewed Editor capability gate, without changing publication or
    production flags.
15. Root assembly, inspection, and transition fingerprinting are compositional.
    They may inspect the fixed root dependency set and child fingerprints but
    may not recursively traverse, hash, or deep-freeze every accepted child
    graph on each transition.

## 4. Repository Ownership

### 4.1 Core

Core owns:

- the unified root contract and its exact dependency graph;
- complete-root construction;
- immutable root-to-root transitions;
- identity, provenance, capability, unit-policy, and fingerprint validation;
- affected-range and affected-band facts;
- persistent-node, spatial-node, line, and suffix reuse evidence;
- reconvergence acceptance;
- complete-oracle equivalence;
- deterministic renderer-consumption scene projection; and
- fail-closed diagnostics.

Core does not own:

- Worker creation or termination;
- timers, debounce, microtask, animation-frame, or viewport priority policy;
- Editor pending/applied/visible state;
- Canvas scratch-buffer or swap lifecycle;
- transport or persistence revision gates; or
- asset loading, decoding, and concrete rasterization.

### 4.2 Browser Worker Runtime

The Worker runtime owns:

- one bounded session registry for process-local Core roots;
- producer invocation;
- root lookup by session-scoped reference;
- complete build and transition invocation;
- cooperative cancellation checks where supported;
- release of superseded or disposed roots;
- conversion of accepted Core responses into strict structured-clone-safe
  response envelopes; and
- timing observations that do not enter deterministic fingerprints.

The Worker runtime does not decide which revision is visible and does not grant
publication authority.

### 4.3 Editor

Editor owns:

- input transactions and local layout-revision allocation;
- scheduling and priority;
- queued replacement and coalescing;
- advisory cancellation requests;
- pending, applied, blocked, and last-valid runtime state;
- response freshness validation;
- atomic state and scene replacement;
- viewport, selection, caret, and IME/composition lifecycle;
- feature capability presentation; and
- concrete Canvas consumption without relayout.

Editor imports Core only through `src/core/coreAdapter.ts`. It never imports
Core internal source files or reconstructs a Core root from scene data.

### 4.4 Backend

Backend continues to own:

- persisted document revision;
- base-revision and idempotency gates;
- transport request/response envelopes;
- canonical package persistence; and
- publish or durable mutation orchestration when separately activated.

Phase 5 does not send a Backend request for every layout revision. The 5E
activation decision must define how accepted local edits reconcile with the
persisted document revision before durable mutation or publication.

## 5. Revision And Identity Vocabulary

Phase 5 uses separate identities for separate responsibilities.

### 5.1 Persisted Document Revision

The Backend-owned monotonic revision of the persisted document. It protects
durable mutation from stale base state.

### 5.2 Local Layout Revision

The Editor-owned monotonic revision of the current local layout intent. A new
Editor transaction that can affect layout creates a newer local layout
revision. Undo or Redo creates a new local layout revision even when its
content equals an earlier state.

The local layout revision is not a retained history. Only current identity is
required for freshness comparison.

### 5.3 Request Identity

Every dispatched Worker operation has a unique request identity bound to:

- the Editor session;
- TextBlock identity;
- local layout revision;
- source/content fingerprint;
- expected previous root generation, when present; and
- the requested operation kind.

Cancellation and Worker delivery refer to request identity. Matching a local
layout revision without matching the request and content identities is
insufficient.

### 5.4 Root Identity

Every accepted unified root has:

- a session-scoped opaque reference used only for Worker correlation;
- a monotonic root generation within that session/TextBlock lane;
- a deterministic semantic/root fingerprint; and
- exact process-local Core authority unavailable to Editor.

The opaque reference and generation do not replace Core authority. A Worker
lookup must recover the exact registered object and Core must validate its
dependency graph before transition.

### 5.5 Scene Identity

Every structured-clone-safe scene is bound to the accepted root fingerprint,
request identity, local layout revision, TextBlock identity, and source/content
fingerprint. Scene data is renderer consumption only and cannot re-enter Core
as root authority.

### 5.6 Fresh Apply Rule

Editor may replace last-valid only when all applicable identities match the
current intent:

```text
response session
  == current session
and response request
  == expected request
and response local layout revision
  == desired local layout revision
and response TextBlock/content identities
  == current TextBlock/content identities
and response scene/root binding
  passes adapter validation
and response capability facts
  permit staged Editor apply
```

A stale response is counted and released. It is not an error that erases
last-valid.

## 6. Unified TextBlock Root

The target contract name is `VNextTextBlockUnifiedLayoutRootV1`. Exact exported
names and field schemas will be locked by the Phase 5A implementation plan, but
the dependency graph is fixed by this design:

```text
VNextTextBlockUnifiedLayoutRootV1
  |- source/context identity and unit policy
  |- accepted Initial Flow
  |- accepted V2 producer evidence
  |- V2 persistent flow tree
  |- V2 spatial index
  |- accepted spatial update facts, when applicable
  |- V2 Flow Region Provider authority
  |- V2 spatial wrapping layout
  |- V2 authored-box geometry
  |- renderer-consumption scene fingerprint
  |- dependency and root fingerprints
  `- capability and non-publication facts
```

The root is:

- immutable and deeply frozen;
- process-local;
- versioned;
- exact-object bound;
- all-or-blocked;
- inspected through one root-level boundary; and
- never structured-cloned or persisted.

The root-level constructor may reuse existing Phase 4B functions internally.
It must not weaken their individual validation in order to make assembly
convenient. Already accepted child objects remain exact, frozen dependencies;
the root wrapper binds their identities and fingerprints without recursing
through their complete trees, indexes, lines, fragments, or scene chunks.

Root build, inspection, and transition diagnostics report:

- top-level dependency count inspected;
- complete child-graph traversal count;
- complete child re-hash count;
- root-wrapper allocation count; and
- root assembly and inspection duration outside deterministic output.

Accepted incremental transitions require complete child-graph traversal and
complete child re-hash counts of zero. A separately named complete-build path
may perform the work required to create new children but must not attribute
that work to root-wrapper assembly.

### 6.1 Renderer-Consumption Scene

Core will define a separate versioned, data-only scene projection suitable for
structured clone. The logical scene is complete but is divided into stable
ordered chunks at a reviewed renderer-consumption boundary, initially by
TextBlock line/fragment ownership. Each chunk has a deterministic fingerprint,
and an ordered compositional chain produces the complete scene fingerprint.

The chunks contain authored-box-local line, text fragment, inline-image
fragment, interval, and source-mapping facts required by Editor painting. They
contain no callbacks, maps, accessors, Core object references, asset bytes, or
authority tokens.

A complete build produces the complete chunk sequence. An incremental
transition may produce an exact scene-delivery plan containing retained chunk
references plus replacement chunks. The plan is bound to the exact previous
scene fingerprint and proves the ordered next complete scene fingerprint.

The scene and its delivery plan are not a second layout authority. Editor may
retain or replace Core-authored renderer chunks but may not derive geometry or
invent chunk order. A missing previous chunk or fingerprint mismatch requires
an explicit complete-scene fallback.

Scene projection diagnostics report:

- visited line and fragment counts;
- retained and replacement chunk counts;
- complete scene-projection count;
- estimated data-only payload bytes; and
- projection duration outside deterministic output.

## 7. Root Lifetime And Memory

Revision count must not determine retained layout memory.

For one actively changing TextBlock lane, the target lifetime model is:

```text
accepted root
active transition
latest queued input
```

Queued inputs are replace-latest per TextBlock. A superseded queued input is
released before dispatch. A stale completion is released immediately after
freshness classification. A superseded root remains alive only while an
already active transition still references it.

Editor Undo/Redo retains authored edit/history data, not every Core layout
root. Undo/Redo requests a new local layout revision and transitions from the
current accepted root where valid, otherwise it takes an explicit complete
rebuild fallback.

The implementation must expose factual counters for:

- registered roots;
- roots referenced by active transitions;
- roots released after acceptance;
- roots released after stale completion;
- complete builds;
- incremental transitions; and
- complete-rebuild fallbacks.

Phase 5D will set byte and latency budgets from measured realistic workloads.
This design does not invent unmeasured universal limits.

## 8. Phase 5A: Unified TextBlock Retained Root

### 8.1 Goal

Create one Core-owned root that assembles and validates the complete Phase 4B
V2 dependency chain and emits a bound renderer-consumption scene.

### 8.2 Required Evidence

- text-only, image-only, and mixed text/image roots;
- adjacent and multiple inline images;
- hard breaks, fields, and generated page numbers;
- no exclusion, left/right/middle/multiple exclusions, barriers, overlays, and
  zero-space advancement;
- image-height expanded-band requery;
- auto-height authored boxes;
- exact V1 versus V2 normalized text-only parity;
- Node-native versus Worker-WASM producer parity;
- cloned, stale, mutated, accessor-shaped, authority-mismatched, unsafe, and
  production-bound rejection;
- all-or-blocked construction with no partial root or scene; and
- root/scene deterministic fingerprint parity;
- bounded root-wrapper build and inspection independent of line, fragment,
  tree-node, and spatial-entry counts; and
- factual root and retained-child byte estimates for small, long, text-only,
  and image/spatial fixtures;
- complete scene chunk/fingerprint parity; and
- factual scene-projection work and payload-byte counts.

### 8.3 Stop-Gate

5A remains Core-only and strict QA. It does not add incremental edits, Worker
root sessions, Editor staged apply, Backend binding, publication, or
production activation.

## 9. Phase 5B: Unified Incremental Transition

### 9.1 Goal

Accept one exact previous unified root plus one exact next-state change and
produce a new unified root with factual reuse and reconvergence evidence.

### 9.2 In-Scope Changes

- Text Run insertion, deletion, and replacement;
- geometry-affecting supported style change;
- inline-image insertion and deletion;
- inline-image move within one TextBlock flow;
- authored image frame resize;
- image vertical-alignment change;
- retained `fit` or `crop` paint-fact change;
- exclusion insertion, deletion, move, and resize;
- supported authored-box width and inset change; and
- no-op or paint-only changes with explicit classification.

Changing `fit` or `crop` does not alter outer line geometry. It must still
produce a new bound scene/fingerprint without inventing line invalidation.

### 9.3 Transition Evidence

An accepted transition reports:

- previous and next root identity;
- accepted edit/change fingerprint;
- dirty source and atom ranges;
- old/new affected spatial-band union;
- reused and created persistent-tree nodes;
- reused and created spatial-index nodes;
- reused, repositioned, and newly placed lines;
- retained and replacement scene chunks;
- visited scene line/fragment counts and emitted payload bytes;
- complete scene-projection count;
- reconvergence position and proof;
- complete tree/index rebuild counts;
- complete semantic/layout pass counts; and
- explicit complete-build fallback, if taken.

### 9.4 Oracle Rule

Every accepted incremental next root must match an independently built complete
next V2 root in deterministic semantic facts, geometry, scene, and normalized
fingerprints. Optional complete QA materialization cannot be an execution input
to the incremental transition.

When bounded proof is unavailable, the result must take an explicit complete
build fallback or block. It must not silently expand a claimed incremental
window to the entire document while retaining an incremental label.

### 9.5 Stop-Gate

5B remains Core-only/process-local QA. It does not add product Editor input,
Worker sessions, publication, or performance claims.

## 10. Phase 5C: Retained Worker Session And Revision Protocol

### 10.1 Goal

Host exact unified roots inside a real browser Worker and connect them to a
strict Editor-owned revision protocol without transferring root authority.

### 10.2 Request Envelope

A ready request contains strict data-only forms of:

- protocol version;
- Editor session identity;
- request identity;
- TextBlock identity;
- base persisted document revision, if available;
- local layout revision;
- source/content fingerprint;
- expected previous root reference and generation, if incremental;
- complete or transition operation kind;
- interaction phase when the change is a high-frequency preview or final
  committed interaction;
- strict Initial Flow/change inputs;
- producer inputs and pinned runtime identity; and
- non-production capability request.

Unknown fields, unsupported versions, malformed arrays, accessors, symbols,
unsafe numbers, stale previous-root generations, and production requests block
before producer or Core execution.

### 10.3 Response Envelope

An accepted response contains:

- the identities echoed and validated from the request;
- accepted next root reference, generation, and fingerprint;
- one structured-clone-safe `sceneDelivery` union:
  - a complete ordered scene for initial build or explicit fallback; or
  - an incremental delivery bound to the exact previous scene fingerprint,
    containing retained chunk fingerprints, replacement chunks, next order,
    next summary, and next complete scene fingerprint;
- transition/reuse diagnostics;
- capability and non-publication facts; and
- non-deterministic timing observations kept outside fingerprints.

A blocked response contains no partial root reference, partial scene, or
partially applicable scene delivery.

### 10.4 Session Rules

- A session/TextBlock lane has at most one accepted current root.
- A request names the root generation it expects to replace.
- A late request cannot replace a newer accepted root.
- A stale completion may be reported to Editor but cannot become session
  current.
- Advisory cancellation cannot release a root still used by active work.
- Document switch, TextBlock deletion, Worker termination, and controller
  disposal release their session lanes.
- Restarting a Worker loses process-local roots and takes an explicit complete
  rebuild path.

### 10.5 Stop-Gate

5C proves a real Worker lifecycle, stale ordering, disposal, and bounded root
retention. It measures full and incremental scene projection, structured-clone
payload bytes, clone/transfer duration, and main-thread receipt duration. A
full-scene protocol that erases the measured incremental gain blocks entry to
5D until a bounded incremental delivery passes exact next-scene parity.

5C does not activate product Canvas, Backend persistence, or publication.

## 11. Phase 5D: Atomic Editor Staged Apply And Performance

### 11.1 Goal

Extend the accepted Editor Live Draft scheduling pattern to unified V2
text/image/spatial scenes and prove a product-shaped but feature-gated runtime.

### 11.2 Editor State

The runtime state retains explicit:

- desired local layout revision;
- pending local layout revision;
- applied local layout revision;
- latest expected request identity;
- last-valid scene;
- current Worker/session identity;
- blocked/stale/current phase;
- factual scheduler and memory metrics; and
- base persisted document revision separately from all layout identities.

### 11.3 Scheduling

The design reuses:

- per-TextBlock queued replacement;
- active/visible/near-viewport/offscreen priority;
- near-line and near-page edge promotion;
- immediate structural dispatch;
- advisory cancellation;
- all-required-block composition; and
- last-valid retention.

It adds impact classification for inline images, authored frames, alignment,
spatial exclusions, and unified-root dependencies. Scheduling hints never own
line breaking, spatial geometry, or reconvergence acceptance.

### 11.3.1 High-Frequency Resize And Move Policy

Pointer-move frequency does not define Worker dispatch frequency. Image resize,
image move, and exclusion move/resize use latest-wins frame coalescing:

- Editor may record every accepted authored interaction transaction as a newer
  local layout revision;
- preview intents received before the next scheduling frame replace the earlier
  preview for the same TextBlock;
- the scheduler retains at most the bounded active work plus one latest queued
  preview per TextBlock;
- no more than one preview candidate per TextBlock is dispatched from one
  animation-frame scheduling opportunity;
- a final pointer-up/keyboard commit receives a distinct revision, supersedes
  any queued preview, and receives commit priority;
- advisory cancellation may request that active preview work stop, but stale
  gates remain authoritative; and
- the final committed intent must be laid out even when its geometry equals the
  last preview, so that Editor state, root identity, and authored transaction
  identity converge.

This policy bounds work without granting Editor permission to approximate
spatial wrapping or image line geometry during drag.

High-frequency metrics include:

- authored interaction intent count;
- preview and final-commit intent counts;
- frame-coalesced intent count;
- Worker dispatch count;
- advisory cancellation count;
- stale completion count;
- maximum queued previews per TextBlock; and
- final-commit-to-visible latency.

### 11.4 Atomic Apply

Editor applies a response only after the complete fresh-apply rule passes. For
incremental delivery, the adapter also requires the exact currently applied
scene fingerprint, every retained chunk fingerprint, the Core-authored next
order, and the proved next complete scene fingerprint. It builds no geometry;
it only retains or replaces renderer-consumption chunks as directed by Core.

All next scene facts enter runtime state in one state transition. Canvas paints
the complete candidate scene to a scratch surface and swaps it once.

Pending, stale, cancelled, and blocked responses preserve last-valid. A blocked
latest intent changes status and diagnostics without making an older scene
appear current.

Selection, caret, and IME/composition facts must either:

- be explicitly rebound to the accepted scene revision; or
- remain in authored Editor state with a declared temporary projection policy.

They may not be silently derived from a stale scene.

### 11.5 Realistic Evidence Matrix

The gate includes:

- rapid Thai and Latin typing;
- mixed-size and mixed-weight runs;
- field- and hard-break-adjacent edits;
- image insert/delete/move;
- continuous image resize with 100- and 1,000-pointer-move bursts;
- vertical-alignment and paint-fact changes;
- exclusion insert/delete/move/resize, including continuous drag;
- long active TextBlocks;
- multiple dirty TextBlocks across visibility priorities;
- delayed, reordered, blocked, cancelled, and stale responses;
- Worker restart and document switch;
- thousands of local layout revisions with bounded retained roots; and
- no-exclusion text-only fast-path regression.

Timing is separated into:

- Editor scheduling;
- structured-clone/Worker transit;
- producer;
- Core complete or incremental transition;
- scene projection;
- main-thread composition;
- Canvas scratch paint and swap; and
- end-to-end visible latency.

Accepted budgets are recorded from measured evidence and scoped to named
fixtures and hardware/runtime conditions. Phase 4B and earlier QA timings are
not universal product budgets.

### 11.6 Stop-Gate

5D remains behind an explicit capability/feature gate. It does not implicitly
authorize publication, production binding, fixed-height behavior, or Backend
per-keystroke execution. An accepted 5D unified response may report
`stagedEditorApply: true`; the Phase 4B component contracts remain unchanged
and non-stageable on their own.

## 12. Phase 5E: Product Capability And Activation Decision

### 12.1 Goal

Make an explicit evidence-backed GO or NO-GO decision for a named product
capability slice.

### 12.2 Required Decisions

5E must decide and document:

- whether the first product slice supports auto-height only;
- whether fixed-height overflow/clipping is implemented or explicitly blocked;
- which overflow facts belong to Core versus renderer consumption;
- image asset loading, unavailable, decode-error, and placeholder paint policy;
- how authored image frame geometry remains stable while asset readiness
  changes;
- how local accepted edits reconcile with Backend persisted revision;
- which root/scene evidence publication revalidates;
- rollout capability reporting and feature flags;
- fallback and rollback behavior;
- accepted latency and memory budgets; and
- production diagnostics that do not expose document content.

### 12.3 Capability Honesty

5E may authorize a bounded capability such as:

```text
text + inline-flow image + auto-height + supported spatial exclusions
```

It does not need to wait for unrelated list, empty-block, Columns, Table, or
multiple-image-mode work when unsupported inputs are rejected before partial
layout and the product communicates the capability accurately.

### 12.4 Gate Result

The gate produces exactly one of:

- `GO` for a named capability slice with rollout, fallback, rollback, and
  evidence; or
- `NO-GO` with measurable blockers and the next bounded checkpoint.

No earlier Phase 5 result changes publication or production flags.

## 13. Error And Recovery Policy

Failures are classified without destroying last-valid:

- malformed request: block before Worker execution;
- stale previous root: block or request complete rebuild;
- unsupported change: explicit complete rebuild or capability block;
- producer failure: blocked response with no partial Core output;
- Core transition failure: blocked response with no partial next root;
- stale completion: release and count, do not surface as fatal;
- Worker termination: invalidate session handles and rebuild completely;
- paint failure: retain the previous visible scene;
- missing asset bytes: apply the 5E asset policy without changing authored
  outer geometry; and
- unsupported fixed height: fail at capability preflight until 5E authorizes a
  concrete policy.

No recovery path may reconstruct a Core root from Editor scene data.

## 14. Verification Strategy

Each gate requires:

1. focused contract tests;
2. adversarial identity/provenance tests;
3. property or deterministic matrix tests appropriate to geometry;
4. complete-oracle parity for incremental behavior;
5. actual Node-native and Worker-WASM producer evidence where applicable;
6. real-browser Worker lifecycle evidence for 5C and later;
7. real Canvas atomic-paint evidence for 5D and later;
8. stale, delayed, reordered, blocked, and disposal cases;
9. memory/root-lifetime counters under long revision sequences;
10. `npm run type-check` in every touched repository;
11. focused repository tests; and
12. complete repository gates before each subphase handoff.

Cross-repository implementation cannot claim completion from Core tests alone.

## 15. Non-Goals

Phase 5 does not add:

- floating, positioned, overlay, behind-text, or in-front-of-text image modes;
- block-image conversion;
- image margin, padding, border, rotation, or effects;
- automatic image scaling to a flow interval;
- list decoration geometry;
- empty-block geometry;
- Columns or Table integration;
- Table auto-fit;
- renderer measurement or relayout;
- layout snapshot retention for every revision;
- Backend execution for every keystroke;
- Core-owned viewport or scheduling policy;
- Editor reconstruction of Core internal objects; or
- implicit production activation.

Fixed-height TextBlock overflow/clipping and concrete image asset lifecycle are
5E decisions, not assumed implementations in 5A through 5D.

## 16. Risks

The three highest controls entering implementation are:

| Priority | Risk | First control gate | Blocking evidence |
| --- | --- | --- | --- |
| P0 | Complete scene projection or structured clone erases incremental Core gain | 5A projection counters and 5C real Worker transfer | Full delivery dominates the measured path or removes the incremental advantage; 5D cannot start until exact incremental scene delivery is bounded |
| P1 | Unified-root assembly recursively traverses or re-hashes its large child graph | 5A root construction and 5B transition | Any accepted incremental transition reports a nonzero complete child-graph traversal or complete child re-hash |
| P1 | Resize/move pointer events create work proportional to raw event count or delay the final commit | 5C protocol and 5D scheduler/browser evidence | More than one queued preview per TextBlock, dispatch count grows linearly with a same-frame event burst, or the final committed revision is lost, stale-applied, or starved |

These priorities concern end-to-end product risk. They do not replace the
identity, provenance, correctness, and publication blockers required by every
gate.

- The Phase 4B process-local registry is not a persisted or cross-process
  identity design. Worker session references must not be mistaken for Core
  authority.
- A root contract that merely bundles existing results without validating the
  dependency graph would preserve mixed-authority risk.
- Structured-clone scene cost may dominate otherwise successful incremental
  Core work on large TextBlocks.
- Retaining old roots for convenience can turn revision count into memory
  growth despite persistent structural sharing.
- Existing Editor QA uses `documentRevision` for local scheduling. Phase 5 must
  separate persisted and local revision vocabulary without weakening current
  stale gates.
- Image resize can create more layout intents than text typing and may require
  frame-aware coalescing without treating debounce as correctness.
- Asset readiness can change paint output without changing outer layout
  geometry; combining those identities would cause unnecessary reflow.
- Complete-oracle QA is required for correctness but cannot be confused with a
  per-keystroke production execution path.

## 17. Explicit Unknowns Reserved For Later Gates

The following decisions are intentionally assigned rather than left
unbounded:

- exact unified-root field and exported function names: Phase 5A plan;
- exact incremental edit/change union: Phase 5B plan;
- Worker protocol schema and root-release acknowledgement: Phase 5C plan;
- measured queue, byte, and latency budgets: Phase 5D evidence;
- caret/selection/IME temporary projection policy: Phase 5D design review;
- fixed-height and asset lifecycle policy: Phase 5E;
- durable edit reconciliation and publication revalidation: Phase 5E; and
- production rollout decision: Phase 5E only.

## 18. Phase Sequence And Authorization

```text
5A Unified Root
  -> Core review and root/scene gate
5B Incremental Transition
  -> Core oracle and reuse gate
5C Retained Worker Session
  -> browser lifecycle and memory gate
5D Atomic Editor Staged Apply
  -> product-shaped correctness and performance gate
5E Capability/Activation Decision
  -> explicit GO or NO-GO
```

Each subphase receives:

- its own implementation plan;
- test-first task boundaries;
- focused review;
- full relevant repository gates;
- a coherent commit; and
- a handoff with PASS, FAIL/BLOCKER, RISK, UNKNOWN, changed files, changed
  behavior, tests, remaining risks, and intentionally unchanged scope.

## 19. Phase 5 Completion Criteria

Phase 5 is complete only when:

1. one unified V2 TextBlock root owns the complete Core dependency chain;
2. text, image, authored-frame, and spatial changes use one transition model;
3. every accepted incremental result matches an independent complete V2 oracle;
4. Worker sessions retain exact roots without transferring authority;
5. local layout and persisted document revisions remain distinct;
6. Editor rejects stale results and applies complete scenes atomically;
7. blocked work preserves last-valid;
8. retained-root memory does not grow with revision count;
9. realistic workloads meet explicitly recorded correctness, latency, and
   memory gates;
10. fixed-height and image asset lifecycle have explicit capability policy;
11. publication/activation receives a separate evidence-backed decision; and
12. all unsupported capabilities continue to fail closed before partial
    product output.

## 20. Evidence Baseline

Primary existing evidence:

- `docs/LIVE_DRAFT_MR1_INLINE_IMAGE_GEOMETRY_4B.md`;
- `docs/superpowers/specs/2026-07-27-inline-image-line-box-geometry-design.md`;
- `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`;
- `docs/CROSS_REPO_OPERATING_MAP.md`;
- `src/layout/textBlockFlowEvidenceV2.ts`;
- `src/layout/textBlockPersistentFlowTreeV2.ts`;
- `src/layout/textBlockSpatialIndexV2.ts`;
- `src/layout/textBlockSpatialIndexUpdateV2.ts`;
- `src/layout/textBlockFlowRegionProviderV2.ts`;
- `src/layout/textBlockSpatialWrappingLayoutV2.ts`;
- `src/layout/textBlockAuthoredBoxGeometryV2.ts`;
- `../flowdoc-vnext-editor/docs/LIVE_DRAFT_MR1_RAPID_EDIT_LIFECYCLE.md`;
- `../flowdoc-vnext-editor/docs/LIVE_DRAFT_MR1_MULTI_BLOCK_SCHEDULING.md`;
- `../flowdoc-vnext-editor/src/editor/liveDraft/liveDraftMultiRunController.ts`;
- `../flowdoc-vnext-editor/src/editor/liveDraft/liveDraftMultiBlockScheduler.ts`;
  and
- `../flowdoc-vnext-editor/src/editor/liveDraft/liveDraftMultiBlockController.ts`.

The accepted Phase 4B full Core baseline is 434 test files / 2,310 tests. The
existing Editor scheduling evidence is QA-only and remains non-production.
