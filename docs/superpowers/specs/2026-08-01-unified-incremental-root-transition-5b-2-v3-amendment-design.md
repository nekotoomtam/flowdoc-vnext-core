# Unified Incremental Root Transition 5B-2 V3 Amendment Design

Status: written V3-aware amendment awaiting user review. This document defines
the planning baseline for Core-only Phase 5B-2. It does not authorize
implementation, Phase 5B-3, Phase 5C, Editor or Backend integration,
publication, production activation, or Root V1/Scene V1 retirement.

## 1. Decision

Phase 5B-2 will extend the accepted Phase 5B-1 V3 foundation through five
reviewable slices:

1. Contract and Evidence Activation;
2. Source and Flow Transition;
3. Bounded Layout and E/T/R/N;
4. Geometry, Scene, Fallback, and Oracle Closure; and
5. Work-Policy Calibration and Review Gate.

The implementation plan must be rewritten against the V3 execution base. The
5B-2 Tasks 11-15 in the 2026-07-30 plan are historical design evidence, not an
executable plan, wherever they assume `5b-1-v2`, repeat foundation already
implemented in 5B-1, permit executable geometry `prelock`, or omit
operation-owned visit accounting.

## 2. Accepted execution base

The accepted base is commit `f6dbb80` on
`phase-5b-unified-incremental-root-transition`.

Phase 5B-1 is accepted with:

- active policy `5b-1-v3` and fingerprint
  `sha256:896f2163367070bd1f1e6fa0d9b34c0f47e371e6256cc9c15bd27e898c185982`;
- fixture calibration revision `3`;
- 21 ordered policy rows, 13 locked and eight inactive;
- operation-owned source, line, Scene, and delivery visits;
- exact evaluator/proof authority for fallback;
- one shared complete Root V2 kernel for bootstrap and fallback;
- descriptor-safe inside-out complete-delivery verification;
- normalized renderer parity across incremental, complete-fallback, and
  QA-only complete-oracle lanes;
- separate `incrementalCandidateWork`, `completeFallbackWork`, and
  `completeOracleWork` ledgers; and
- object-graph retention/reachability evidence only.

The final focused gate passed 12 files / 142 tests. The full Core gate passed
453 files / 2,512 tests plus type-check. No Critical or Important finding
remained at the 5B-1 review stop.

## 3. Foundation inventory

5B-2 reuses these existing facts instead of rebuilding them:

- the closed V1 change union for text insertion/deletion/replacement,
  resolved-field rendered-value change, supported style change, no-op, image,
  exclusion, and authored-box families;
- Core-derived `true-no-op`, `semantic-only-change`,
  `paint-affecting-change`, and `geometry-affecting-change` classification;
- exact expected-target binding and validated-change authority;
- bounded evidence request/response contracts, request derivation,
  descriptor-safe acceptance, and exact request/root/change/runtime tuple
  registration;
- persistent Source State V1, Incremental Flow Tree V1, Persistent Layout Line
  Tree V1, Persistent Scene V2, Scene Delivery V2, Root V2, and deferred
  complete fallback;
- operation-owned work evaluation and exact limit-exceeded authority; and
- private owner helpers for recomposing locally owned delivery facts.

These capabilities remain absent and are the actual 5B-2 work:

- a producer adapter that answers an exact transition evidence request with
  Node-native and Worker-WASM facts;
- text/resolved-field/style source and flow path-copy execution;
- bounded line recomputation and real reconvergence search;
- exact and strict translated suffix proof;
- accepted E/T/R/N disposition covers for changed layout;
- disposition-driven text/style geometry and Scene transition;
- an active 5B-2 policy and calibration manifest; and
- end-to-end accepted text/style Root V2 transitions.

## 4. Capability boundary

5B-2 activates only:

- bounded text insertion, deletion, and replacement;
- bounded resolved-field rendered-value changes;
- bounded supported text-style changes;
- visually identical semantic-only source/provenance changes;
- exact and strict translated reconvergence caused by those families; and
- the existing 5B-1 true-no-op and image-paint behavior under the new active
  policy.

5B-2 does not activate:

- inline-image insertion, deletion, movement, frame resize, or vertical
  alignment;
- exclusion insertion, deletion, movement, or resize;
- authored-box width/inset transition;
- fixed-height or overflow behavior;
- empty-block incremental transition;
- alternate registered tree-history normalization;
- image asset loading or decode lifecycle;
- Worker session/handle/release, scheduling, cancellation, or coalescing;
- Editor apply, Backend persistence/publication, or production activation; or
- Root V1/Scene V1 retirement.

Every mandatory 5B-2 common fixture starts a real incremental attempt. Block
size, implementation complexity, payload estimate, or elapsed time cannot
select `planned-complete`.

## 5. Classification and disposition honesty

Classification and line disposition remain separate facts.

- True no-op returns the exact previous Root and Scene wrappers.
- A visually identical semantic-only change is not no-op. It creates new
  source/provenance and source-mapped Scene facts while retaining unchanged
  paint and layout facts.
- Paint-only text color changes retain exact layout lines and replace only
  affected paint/source-mapped Scene chunks.
- Metric-affecting text/style changes recompute bounded layout until exact or
  strict translated reconvergence, or until a factual proof/limit fallback.

Every accepted next line has exactly one primary disposition:

```text
E = exact retained line authority
T = retained line internals with strictly translated reprojection
R = recomputed or source-remapped existing lineage
N = inserted/new lineage
```

The cover is canonical, mutually exclusive, and exhaustive. Removed previous
lines are counted separately.

For 5B-2:

- text paint-only rows use `E` lines plus replacement Scene chunks;
- semantic-only source/provenance rows use `R` existing lineage with zero
  line-internals and zero positioned-geometry recomputation, because the
  source mapping itself changed;
- metric/layout changes use `R` and `N` before reconvergence;
- exact reconverged suffixes use `E`; and
- strict translated suffixes use `T` and must rebuild positioned geometry and
  Scene chunks.

No line may be called `E` solely because its digest or rendered appearance is
equal.

## 6. Slice A: Contract and Evidence Activation

Core derives an evidence request only after exact change validation. Request
creation may inspect the change payload, registered summaries, and bounded
left/right context paths. It cannot inspect complete next canonical material
or walk a complete suffix.

The producer receives only request-scoped source material. It returns factual
clusters, advances, break offsets, source topology, coverage, runtime/font/
style/unit dependencies, and work counters. It cannot return a dirty range,
affected line/band, reconvergence/reuse claim, fallback decision, complete
next input, image bytes, decoded assets, or renderer decisions.

Node-native and Worker-WASM answers must normalize to equal Core evidence and
equal deterministic counters. Paint-only and semantic-only equal-rendering
rows that require no new shaping return `not-required` and materialize no
producer request.

Evidence-request and evidence-response visits become explicit operation-owned
work facts before their policy rows can be activated. Existing request and
acceptance contracts remain version 1 unless a real data-shape incompatibility
is discovered; implementation convenience is not a version-bump reason.

### 6.1 Producer package and authority seam

The text-engine adapter imports Core contracts only from the public
`@flowdoc/vnext-core` package boundary. Core therefore exposes the transition
evidence request, producer source-material, producer response, and producer
runtime-identity shapes as TypeScript type-only exports. Type visibility does
not mint process-local authority and does not expose an authority factory,
registry, inspector, policy selector, Root, or change input to the adapter.

Core mints and retains the exact producer runtime identity. The caller injects
that identity beside the bounded Node-native or Worker-WASM range functions.
The adapter descriptor-validates only the injected request-scoped material and
runtime facts, executes the bounded range work, and returns one factual
response. It does not import or invoke the Core acceptance boundary.

After the adapter returns, the Core caller that already owns the exact request,
previous Root, validated change, and runtime identity passes the response to
`acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV1(...)`. That boundary
alone registers accepted evidence authority. A structurally equal type-shaped
clone cannot substitute for the Core-minted runtime identity or any other
member of the exact authority tuple.

## 7. Slice B: Source and Flow Transition

Source transition uses summary-guided half-open range lookup and local path
copy. It splits only boundary leaves, preserves canonical eight-item/eight-
child balancing, and composes summaries only along copied paths.

Flow transition projects exact accepted evidence into replacement layout
atoms. Offset-independent suffix atoms/subtrees remain exact references;
absolute rendered offsets are traversal results and are not rewritten through
the suffix.

The stage must:

- preserve source and provenance inequality even when rendered text and
  effective metrics are equal;
- reuse exact layout-only flow for semantic-only and paint-only rows when its
  dependencies are unchanged;
- reject missing, surplus, widened, narrowed, or cross-bound evidence;
- enforce limits before each source/flow node or atom visit;
- report zero complete tree rebuild, semantic pass, and suffix traversal; and
- retain all new children as an unregistered private candidate until atomic
  Root acceptance.

## 8. Slice C: Bounded Layout and reconvergence

Layout begins at the Core-derived source/atom seed. It uses the existing
fixed-point break and placement kernels and advances line by line only until a
proof is accepted or an exact deterministic limit is reached.

Exact reconvergence requires all of:

- equal source/atom cursor;
- equal line internals and layout context;
- equal source/provenance summaries;
- compatible spatial continuation and boundary semantics;
- equal authored position/geometry facts;
- exact registered previous subtree authority; and
- equal active work-policy identity.

Strict translated reconvergence additionally requires one safe constant y
delta, unchanged line internals and source/provenance, compatible destination
spatial environment, valid authored bounds, and no page, box, flow-region,
barrier, or semantic-boundary crossing. Missing compatibility facts disable
translation; visual similarity never enables it.

Reconvergence consumes summary paths and stops at a selected maximal subtree
proof. It cannot enumerate an accepted complete suffix. Exact and translated
proofs, accepted/rejected proof nodes, and recomputed lines remain separately
counted.

## 9. Slice D: Geometry, Scene, fallback, and oracle

Executable geometry `prelock` is removed from the 5B-2 design. A row cannot
both execute and claim that its capability is not locked.

The 5B-2 policy locks `geometry/reprojected-lines` and
`geometry/visited-fragments` only for disposition-driven text/style projection
under checkpoint owner `5B-2`. The manifest must state that this does not open
image, exclusion, authored-box, fixed-height, or general 5B-3 geometry.
5B-3 must publish a later policy version and recalibrate geometry for its own
families.

Projection follows disposition:

- `E` retains exact positioned line authority unless paint or source mapping
  requires replacement Scene chunks;
- `T` retains line internals but rebuilds positioned/authored geometry and
  Scene chunks with the proven delta;
- `R` rebuilds only facts that changed for the existing lineage; and
- `N` creates new line, geometry, and Scene facts.

Scene transition path-copies only affected chunk paths and produces one
canonical retain/splice plan. Root acceptance validates every target binding
and dependency, then registers new child, Scene, delivery, and Root authority
atomically. Failure before that point registers nothing.

Fallback remains two-step. Proof or limit failure returns one exact
Core-minted request. Independently supplied complete material later enters the
shared complete Root V2 kernel. No partial source, flow, line, geometry,
Scene, cover, or delivery candidate can cross that boundary.

The complete oracle remains QA-only. It builds from independent complete
fixture material after the production attempt and compares normalized semantic
source/provenance, flow, line/fragment geometry, ordered renderer chunks/
summary, and delivery facts. Composite Root fingerprint equality is not
required across different construction provenance. Root V1/Scene V1 may be
normalized only in the test comparator as a frozen secondary reference; no V1
constructor or materialization enters the production attempt.

## 10. Slice E: Policy and calibration

The active checkpoint policy is a new `5b-2-v1`; it extends, but does not
mutate, the published `5b-1-v3` object. Root and fallback authority bind the
exact selected policy object and fingerprint.

Policy activation is bootstrap-bound. A 5B-2 attempt accepts only an exact
Root V2 built under `5b-2-v1`. A Root built under `5b-1-v3` remains valid for
the frozen 5B-1 QA lane but is not silently upgraded or transitioned under the
new policy. The caller must use the explicit complete bootstrap boundary to
create a 5B-2-policy Root; the incremental hot path never performs policy
migration or accepts complete material for that purpose.

The 5B-2 policy:

- preserves V3 row ordering and previously locked row meanings;
- activates evidence, flow/tree, layout/reconvergence, and text/style geometry
  rows only from factual fixture evidence;
- keeps spatial rows inactive;
- uses no `prelock` execution;
- keeps payload observations outside execution work;
- applies limits before visits, not after work is already performed; and
- never aggregates unlike units into one score.

If 5B-2 calibration requires changing a numeric value inherited from a locked
V3 row, the implementation must stop. A revised 5B-2 policy may carry the new
value only after rerunning the complete 5B-1 binding/threshold matrix and an
explicit review of the changed inherited row. The published `5b-1-v3` object
and fingerprint remain immutable.

The calibration formula remains deterministic:

```text
effectiveStageLimit =
  max(smallBlockFloor, min(absoluteStageLimit, relativeStageLimit))
```

Every activated row requires checked-in ordered fixtures, exact floor/
absolute/relative values, threshold-minus-one/threshold/threshold-plus-one
tests, a work-policy fingerprint, and an independently versioned fixture
calibration revision. No numeric value is selected from wall-clock or payload
size.

## 11. Responsibility boundaries and design debt

The existing evidence, source-state, line-tree, and unified-transition files
are already large. 5B-2 must add focused private modules rather than making
one existing file own request derivation, producer execution, source mutation,
line breaking, reconvergence, projection, Scene construction, and acceptance.

Required responsibility boundaries are:

- producer adapter: request-scoped Node/WASM evidence only;
- source/flow transition: local path copy and flow candidate facts;
- line transition: bounded recomputation only;
- reconvergence proof: summary comparison and exact/translated authority only;
- disposition validation: canonical E/T/R/N cover only;
- text/style geometry projection: disposition-to-geometry facts only;
- Scene/Root orchestration: stage sequencing and atomic acceptance only; and
- QA comparator: independent complete material and normalized comparison only.

These are private TextBlock-specific units. They must not become a generic
persistent sequence, graph editor, transition framework, scheduler, or public
mutation API. Unrelated refactoring is outside scope.

## 12. Required fixture matrix

The 5B-2 gate includes:

- Thai and Latin insertion/deletion/replacement at start, middle, and end;
- hard-break and resolved-field adjacency;
- identical rendered field text with changed source/provenance;
- changed field text with equal metrics;
- changed field text with changed metrics;
- paint-only color;
- equal-metric style identity/provenance change;
- bounded local metric-affecting style;
- unsupported/global style structured block;
- exact reconvergence and strict translated reuse accept/reject matrices;
- proof failure and every active-stage limit failure;
- 1-, 8-, 32-, 33-, 128-, and 2,048-line retained suffix scales;
- Node-native/Worker-WASM evidence parity;
- forced fingerprint collision and cross-authority adversaries;
- throwing sentinels beyond bounded request/proof paths;
- complete-fallback independence; and
- independent complete-oracle normalized parity.

Mandatory common fixtures must finish `accepted-incremental` or exact
`accepted-no-op`. Proof-failure and limit fixtures may return factual
`fallback-required`. None may select planned-complete merely because the block
is large.

## 13. Closure gate

5B-2 closes only when:

- all five slices have independent TDD and review evidence;
- 5B-1 V3 behavior still passes under the selected 5B-2 policy;
- required common fixtures are genuinely incremental;
- evidence request creation and reconvergence remain bounded;
- E/T/R/N is canonical, mutually exclusive, and exhaustive;
- translated reuse proves every required semantic, spatial, delta, authored,
  and boundary fact;
- no executable row remains `prelock`;
- fallback is exact, deferred, and candidate-independent;
- complete oracle remains external to production acceptance;
- policy and fixture manifests contain no placeholder or inactive capability
  overclaim;
- focused tests, type-check, diff hygiene, and the full Core gate pass; and
- an independent scoped review reports no open Critical or Important finding.

The checkpoint then stops for user review. Phase 5B-3 cannot begin without a
separate explicit authorization.

## 14. Explicit unknowns

Exact 5B-2 floor, absolute, relative, and threshold values are unknown until
the real transition fixtures produce factual operation-owned counts. They are
not placeholders and cannot be guessed in the plan. The checkpoint cannot
close until those exact values are checked in and reviewed.

Product-scale memory, garbage-collection timing, Worker transport cost,
revision scheduling, cancellation/coalescing, Editor visible-state behavior,
Backend durability, fixed-height/overflow, asset decode lifecycle, and 5B-3
image/spatial scale remain outside the evidence claim.
