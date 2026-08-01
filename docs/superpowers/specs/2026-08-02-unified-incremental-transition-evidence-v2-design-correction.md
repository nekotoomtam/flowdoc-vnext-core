# Unified Incremental Transition Evidence V2 Design Correction

Status: accepted written correction as of 2026-08-02. The Phase 5B-2
implementation plan has been rewritten against it and remains non-executable
until that plan receives explicit user review and approval.

This document corrects the evidence ordering, source-material authority,
resolved-style, range, runtime, and work-accounting gaps found before Phase
5B-2 Task 2 implementation. It is normative wherever it conflicts with:

- `2026-07-30-unified-incremental-root-transition-5b-design.md`;
- `2026-08-01-unified-incremental-root-transition-5b-2-v3-amendment-design.md`;
  or
- `2026-08-01-unified-incremental-root-transition-5b-2-v3.md`.

It does not authorize implementation, Phase 5B-3, Editor or Backend work,
production activation, V1 retirement, or a new arbitrary-style change
contract.

## 1. Decision

Phase 5B-2 adopts a new task-specific Transition Evidence V2 protocol instead
of mutating the existing V1 request/response semantics in place.

The execution order becomes:

1. validate the exact Root/change/policy tuple;
2. perform Core-owned bounded change preflight;
3. resolve exact previous and permitted next style authority;
4. derive effect classification and whether producer evidence is required;
5. derive Core-owned changed, evidence-target, verification, and coverage
   ranges;
6. materialize and register exact bounded Producer Source Material V2;
7. execute the Node-native or Worker-WASM producer only when evidence is
   required;
8. accept the response or producer failure against the exact
   Root/change/request/material/runtime tuple; and
9. let later Source and Flow stages consume the same exact bounded preflight
   authority.

This removes the existing dependency cycle in which producer evidence was
requested before Core had enough bounded next-source facts to classify the
change or construct the producer input.

## 2. Capability statement

Phase 5B-2 supports:

- text insertion and replacement using an exact style binding already
  registered by the previous Root;
- text deletion;
- resolved-field rendered-value changes that retain the exact previous style;
- supported local style changes resolved by Core from the exact previous
  style, paragraph requirements, pinned font faces, and the closed authored
  style payload;
- true no-op, semantic-only, paint-only, and metric/layout-affecting
  classification after bounded source analysis; and
- retained generated-page-number material as passive producer context only.

Phase 5B-2 does not claim:

- arbitrary or novel style insertion/replacement when the previous Root has no
  exact registered binding for the supplied style keys;
- generated-page-number mutation or Data Definition/Binding execution;
- empty-block incremental layout;
- inline-image mutation through the text evidence protocol;
- complete-text, complete-suffix, complete-tree, or complete-next-input
  producer access; or
- proof of correctness from a canonical fingerprint alone.

An insertion or replacement whose supplied style keys do not resolve to one
unambiguous exact registered style is a structured unsupported change. It is
not guessed, silently normalized, sent to planned-complete, or described as a
supported arbitrary-style insertion.

## 3. Why V2 is required

The V1 request currently uses the raw changed source range as the response
coverage, gives left/right context only as lengths, and does not bind response
facts to an exact Core-owned source-material object. The source atom also lacks
the resolved style facts required to create a resolved shaping run.

Correcting those semantics requires distinct changed, evidence-target,
verification, and material-coverage ranges; exact resolved style material;
Core-owned work ceilings; passive generated-page-number context; and exact
material identity in acceptance. Those are data-shape and meaning changes, not
implementation convenience. A V2 protocol therefore preserves capability and
version honesty.

The V1 evidence contracts remain frozen 5B-1 compatibility and QA evidence.
They are not the active 5B-2 producer lane. Existing `5b-1-v3` Root identity,
work-policy identity, fixtures, and fingerprints remain unchanged.

## 4. Core-owned bounded change preflight

Preflight is a new private, task-specific stage. It consumes only:

- the exact previous Root V2;
- the exact change object;
- the exact Root-bound work-policy object;
- registered Root/source/flow authority; and
- operation-owned work evaluators.

It produces one deeply frozen process-local analysis authority containing:

- exact validated change shape and eligibility;
- exact changed previous and next source ranges;
- exact bounded previous source facts;
- exact proposed next source items for the changed slice;
- exact retained prefix/suffix summary authorities needed to compose the
  expected target binding without walking a complete suffix;
- exact registered style resolution results;
- exact effect classification;
- `producerEvidence: "required" | "not-required"`;
- Core-owned evidence target, verification, and coverage ranges;
- exact source topology facts;
- source-material work already completed; and
- zero complete-next-input traversal/comparison.

Preflight is not a generic mutation or range framework. It exists only for the
five active 5B-2 text/field/style change families.

### 4.1 Ordering and classification

`producerEvidence` and effect classification must not be derived from change
kind alone.

Core first resolves the bounded previous/next source and style facts. It then
classifies:

- `true-no-op`: source, provenance, rendered content, paint, and layout
  dependencies are unchanged;
- `semantic-only-change`: source/provenance identity changes while rendered
  content, paint, and layout dependencies remain equal;
- `paint-affecting-change`: paint changes while geometry/layout dependencies
  remain equal; or
- `geometry-affecting-change`: rendered content or any shaping/metric/layout
  dependency changes.

True no-op, semantic-only, and paint-only equal-layout changes return
`producerEvidence: "not-required"`, create no producer request, invoke no text
runtime, and report zero producer-response work. Geometry-affecting rows enter
the V2 producer lane.

The expected target binding is composed from exact retained summary authority
and the bounded replacement summary. It is not synthesized by hashing the
change payload against the previous complete summary.

### 4.2 Unicode and source-boundary validation

Every changed and materialized range must use ordered safe UTF-16 scalar
boundaries. Preflight rejects or blocks, as appropriate:

- a split surrogate pair;
- unsafe integer arithmetic;
- text insertion/replacement carrying a hard-break or inline-image sentinel as
  ordinary text;
- a changed range that cuts an atomic field, hard break, generated page number,
  or inline-image boundary contrary to the change family;
- an empty next TextBlock that would claim the still-inactive empty-block
  layout capability; and
- source/provenance/style expectations that do not match exact bounded source
  facts.

## 5. Exact registered style authority

The Source State owner maintains a non-iterable process-local sidecar:

```ts
WeakMap<
  VNextTextBlockUnifiedLayoutSourceStateV1,
  VNextTextBlockUnifiedLayoutRegisteredStyleSetInternalV1
>
```

The sidecar is populated while complete Source State construction is already
visiting accepted source items. It contains exact deeply frozen resolved style
objects and the paragraph default. It is not serialized, fingerprinted,
exported, iterable as Root history, or accepted as canonical authority by
value.

Insertion and replacement resolve the supplied `measurementStyleKey` and
`effectiveShapingStyleKey` only inside the exact previous Source State's
registered set:

- zero matching exact bindings: structured unsupported change;
- one matching exact binding: accepted exact style authority; or
- multiple non-identical bindings under colliding keys: structured ambiguous
  authority block.

Canonical fingerprints and caller-supplied keys locate candidates but never
authorize one. Forced-collision fixtures must prove ambiguity blocks.

Resolved-field value changes retain the exact field style. Supported style
changes resolve their authored `nextStyle` against each exact affected base
style, the paragraph style key, paragraph font family, pinned font faces, and
LayoutUnit policy. A style range spanning multiple exact base styles may
produce multiple next resolved styles; it must not collapse them by key or
appearance.

The producer receives full resolved style facts on each text-bearing material
atom. At minimum they include:

- measurement and effective shaping style keys;
- paragraph style key and font-family key needed to verify the effective
  identity;
- font face id and font size in LayoutUnit;
- text color;
- font weight and font style;
- text decoration and strikethrough; and
- the exact resolved-style fingerprint as an integrity fact, not process-local
  authority.

This material shape is intentionally sufficient for a later novel-style
change contract. Adding that future contract should extend only the Core
preflight resolver and change admission; it should not require redesigning the
V2 producer or acceptance protocol.

## 6. Range model

Every V2 request distinguishes four concepts for each previous/next lane:

1. `changedSourceRange`: the semantic source change;
2. `evidenceTargetRange`: the range whose replacement shaping and break facts
   may enter the next Flow candidate;
3. `shapeVerificationRange`: the target plus Core-selected guard clusters used
   only to prove safe outer shaping boundaries; and
4. `coverageRange`: the maximum material envelope supplied to the producer.

All four are absolute half-open rendered UTF-16 ranges. Every atom offset in a
lane is relative only to that lane's `coverageRange.startRenderedUtf16`. No
offset is relative to the changed range, request object, other lane, or
complete TextBlock.

The normative request shape is:

```ts
export interface VNextTextBlockTransitionProducerLaneRangesV2 {
  readonly changedSourceRange: VNextTextBlockSourceRangeV1
  readonly evidenceTargetRange: VNextTextBlockSourceRangeV1
  readonly shapeVerificationRange: VNextTextBlockSourceRangeV1
  readonly coverageRange: VNextTextBlockSourceRangeV1
}

export interface VNextTextBlockTransitionEvidenceRequestV2 {
  readonly source: "vnext-text-block-transition-evidence-request-v2"
  readonly contractVersion: 2
  readonly previousRootFingerprint: string
  readonly changeFingerprint: string
  readonly documentId: string
  readonly sectionId: string
  readonly textBlockId: string
  readonly previous: VNextTextBlockTransitionProducerLaneRangesV2
  readonly next: VNextTextBlockTransitionProducerLaneRangesV2
  readonly nextSegmentationContextRanges:
    readonly VNextTextBlockSourceRangeV1[]
  readonly requiredStableSegmentationExpansionCount: number
  readonly fontStyleUnitDependencyFingerprint: string
  readonly producerRuntimeRequirementFingerprint: string
  readonly layoutUnitPolicyFingerprint: string
  readonly workPolicyFingerprint: string
  readonly fingerprint: string
}
```

The ordered segmentation contexts are Core-owned facts, are nested inside the
next coverage range, contain the complete next evidence target, use safe scalar
boundaries, and contain no duplicate range. The final context is the maximum
permitted envelope; the adapter cannot synthesize another attempt.

The required nesting is:

```text
changedSourceRange
  inside evidenceTargetRange
  inside shapeVerificationRange
  inside coverageRange
```

Deletion may have a zero-length next `changedSourceRange`, but every
evidence-required request must have a non-empty next `evidenceTargetRange` and
`shapeVerificationRange`. Core obtains that target from bounded retained
neighbors. If no non-empty target exists without opening empty-block
capability, preflight blocks rather than calling a runtime that forbids empty
ranges.

### 6.1 Core ownership

Core derives the ranges through summary-guided Source and Flow lookups, exact
previous cluster boundaries, exact style/hard-break/image boundaries, safe
UTF-16 boundaries, and the active work policy. The caller and producer cannot
supply, widen, narrow, or choose these ranges.

The producer may return only facts for the exact Core-owned target. A runtime
boundary or segmentation proof failure does not authorize the producer to
expand the range. It returns a factual blocked result for Core validation and
proof-authority minting.

### 6.2 Passive boundaries

- Text and resolved-field atoms may be shaped.
- Generated-page-number atoms may appear as retained passive text context and
  carry their generation-owner fingerprint, but cannot be changed in 5B-2.
- Hard breaks remain explicit segmentation boundaries and are never shaped.
- Inline images appear only as U+FFFC boundary facts. No asset, frame, crop,
  paint, decode, or renderer state enters source material.
- Shaping is partitioned by exact effective style and never crosses a hard
  break, inline-image boundary, or effective-style boundary.

## 7. Producer Source Material V2

Core alone creates and registers one exact material object for one exact
preflight/request tuple. Conceptually:

```ts
export interface VNextTextBlockTransitionProducerLaneMaterialV2 {
  readonly ranges: VNextTextBlockTransitionProducerLaneRangesV2
  readonly atoms: readonly VNextTextBlockTransitionProducerSourceAtomV2[]
  readonly fingerprint: string
}

export interface VNextTextBlockTransitionProducerSourceMaterialV2 {
  readonly source:
    "vnext-text-block-transition-producer-source-material-v2"
  readonly contractVersion: 2
  readonly requestFingerprint: string
  readonly previous: VNextTextBlockTransitionProducerLaneMaterialV2
  readonly next: VNextTextBlockTransitionProducerLaneMaterialV2
  readonly paragraphStyleKey: string
  readonly fontFaces: readonly VNextTextBlockInitialFlowFontFaceV1[]
  readonly layoutUnitPolicyFingerprint: string
  readonly sourceTopologyFingerprint: string
  readonly producerWorkCeilings: {
    readonly maximumVisitedEvidenceNodeCount: number
    readonly maximumRequestedAtomCount: number
    readonly maximumRequestedClusterCount: number
  }
  readonly fingerprint: string
}
```

Each `VNextTextBlockTransitionProducerSourceAtomV2` has exact kind-specific
fields. Text, resolved-field, and generated-page-number atoms contain full
resolved style facts. Resolved-field atoms contain `fieldKey`;
generated-page-number atoms contain `generatedOwnerFingerprint`; hard-break
and inline-image-boundary atoms contain only their exact boundary facts. Every
atom contains lane-coverage-relative offsets, rendered text, inline id,
source/provenance fingerprints, and an integrity fingerprint. Unknown or
cross-kind fields are rejected.

The rewritten implementation plan may refine TypeScript factoring, but it may
not rename away or merge the normative range, style, authority, or work
distinctions in this design.

Material contains no Root, complete source state, complete next input, dirty
line/band decision, reconvergence/reuse claim, fallback decision, image bytes,
decoded state, geometry, Scene, renderer data, or Editor state.

The Core request result returns the exact V2 request and its exact registered
material together only for an evidence-required row. `not-required` returns
neither object.

## 8. Runtime execution and bounded proof

The adapter receives only:

- the exact request-shaped material;
- the exact Core-minted runtime identity; and
- injected `shapeRange` and `segmentRange` functions.

It imports V2 contracts only through `@flowdoc/vnext-core`. It does not import
Core internal layout files, accept a Root or change, call Core acceptance,
inspect an authority registry, select a policy, or mint fallback authority.

### 8.1 Shaping

For every exact effective-style partition intersecting the evidence target,
the adapter executes the Core-declared shape verification range using the
matching pinned font face. It verifies:

- exact returned text, face, range, and context;
- pinned units-per-em and font metrics;
- safe scalar and cluster boundaries;
- zero missing glyphs;
- target-start safety from the target's first glyph boundary;
- target-end safety from the first Core-declared right guard glyph or exact
  end-of-style/end-of-block boundary; and
- safe deterministic conversion from font units to LayoutUnit.

Guard glyphs and their visits count as work but do not enter published
replacement shaping runs. An unsafe outer boundary returns factual proof
failure. It never triggers a complete shape call or producer-selected range
expansion.

The complete shaping oracle remains QA-only. Node/WASM fixtures compare the
bounded result with the complete oracle, but production acceptance does not
call `shapeFull` or inspect complete next text.

### 8.2 Segmentation

Core supplies an ordered deterministic sequence of bounded segmentation
context attempts inside the exact coverage envelope plus the required stable
expansion count. The adapter executes that sequence and accepts target break
facts only after the required consecutive equal results.

If stability is not reached before the declared envelope or work ceiling, the
adapter returns factual proof failure or limit-before-visit. It never calls
`segmentFull`, uses wall-clock time, widens beyond Core material, or chooses a
different target.

Hard-break endpoints are composed as explicit Core-owned mandatory boundaries.
Artificial context-envelope endpoints must not be published as real target
break opportunities.

### 8.3 Multi-style and zero-length changes

The adapter may call `shapeRange` multiple times, once per exact affected
effective-style partition. Adjacent equal exact styles may be coalesced;
fingerprint equality alone cannot coalesce them under forced collision.

A deletion's zero-length changed next range is never passed to `shapeRange` or
`segmentRange`. Runtime calls use the non-empty Core-owned evidence target and
verification ranges.

## 9. Exact acceptance and producer failures

V2 acceptance binds this exact process-local tuple:

```text
previous Root object
+ exact change object
+ exact V2 request object
+ exact registered V2 source-material object
+ exact Core-minted runtime-identity object
+ response or factual producer-failure object
```

Acceptance checks object identity through private WeakMap/WeakSet records and
then validates all descriptor-safe facts. A clone, structurally equal object,
cross-Root material, cross-change material, cross-request response,
cross-runtime response, mutated accessor/prototype, unknown field, symbol, or
forced fingerprint collision cannot gain authority.

For an accepted response, Core validates at least:

- exact material and runtime tuple binding;
- exact target and verification coverage;
- shaping text and styles against exact next material;
- cluster continuity, safe target boundaries, and LayoutUnit arithmetic;
- break ordering and target containment;
- source topology, font, unit, and dependency identities;
- work counters recomputed from material and returned facts; and
- every false capability contract.

Canonical fingerprints remain compositional integrity facts only.

An accepted V2 response contains the exact request and source-material
fingerprints, the exact runtime-identity reference, the exact next evidence
target, replacement shaping runs, target break offsets, shaping-boundary proof
facts, source-topology fingerprint, producer work, closed false capability
contracts, and its integrity fingerprint. It does not repeat complete material
or carry a Root/change/fallback object. Acceptance receives the exact material
separately and compares every response fact with it.

The adapter may return only closed factual failure codes such as:

- invalid request-scoped material;
- unavailable or mismatched pinned font;
- unsafe shaping boundary;
- segmentation not stable inside the Core envelope;
- missing glyph or unsafe runtime arithmetic; or
- deterministic work ceiling reached before the next visit.

Core validates the exact failure tuple before minting a proof-failed or
work-limit fallback authority. The adapter never returns a fallback request or
fallback decision itself.

## 10. Work ownership

Work remains split between operation owners:

- Core preflight owns `evidence-request-lookup-nodes` and counts every Source
  or Flow summary/path node before inspection;
- Core materialization owns `evidence-context-atoms` and counts every emitted
  previous or next material atom before materialization;
- the producer owns `evidence-response-nodes` and counts every descriptor,
  runtime glyph/cluster/break, verification guard, and response fact before
  inspection or emission; and
- later Source/Flow stages keep their existing separate units and must not
  recount preflight materialization as source path-copy work.

`requestedAtomCount` is the exact number of previous plus next material atoms.
`requestedClusterCount` is the exact Core-declared upper bound on requested
target, guard, and verification cluster slots; it is not presented as an
observed output-cluster count. `consumedClusterCount` is the exact emitted
target-cluster count, while guard glyph/cluster visits remain represented in
`visitedEvidenceNodeCount`. Other `consumed*` facts describe material actually
used by the accepted response. `unusedCoverageRenderedUtf16Length` is derived
from exact coverage minus consumed verification/context spans; it is
observational and cannot select the execution path.

Before producer dispatch, Core puts exact policy-derived ceilings into the
registered request/material. The adapter checks the matching ceiling before
every visit. It stops before the disallowed visit and returns the factual
attempt count. Core recomputes and validates that count before minting limit
authority.

No work limit is enforced only after the work has happened. No wall-clock or
estimated payload byte count selects an execution path.

## 11. Public and package boundaries

Core may export only the V2 request, source-material, response/failure, and
runtime-identity TypeScript types required by the adapter. Type visibility
does not mint process-local authority.

Core must not export:

- a style registry or registration function;
- a source-material authority factory;
- a runtime-identity factory;
- an authority inspector or iterable registry;
- a work-policy selector;
- an adapter-facing Root/change input; or
- a producer shortcut that registers evidence without the exact Core
  acceptance tuple.

The text-engine package may export its V2 producer function and result types.
It must retain `importsCoreAsPublicPackage: true` and
`coreImportsAdapterBack: false`.

The existing public V1 evidence API remains frozen for the 5B-1 QA lane. The
5B-2 public transition attempt uses only the V2 internal orchestration after
`5b-2-v1` activation.

## 12. Version separation

Three identities remain independent:

- semantic producer protocol: Transition Evidence V2;
- execution work policy: future immutable `5b-2-v1`; and
- fixture calibration revision: future revision `4`.

Changing a work ceiling does not change the V2 semantic contract. Changing a
fixture corpus does not change Root semantic identity. Changing V2 material or
response semantics requires an explicit protocol-version decision.

No correction in this document mutates `5b-1-v3`, its 21 ordered rows, its
fingerprint, fixture calibration revision `3`, or an accepted V3 Root.

## 13. Implementation-plan resequencing

After this written design is accepted, the current implementation plan must be
rewritten as follows:

- Task 1 remains complete and unchanged.
- New Task 2 owns bounded change preflight, exact style registration/resolution,
  range derivation, material construction, and pre-dispatch work authority.
- New Task 3 owns the Node/WASM V2 producer, factual producer failures, exact
  material-bound acceptance, and package/public type guards.
- The 5B-2A review stop moves after new Task 3.
- Existing Source, Flow, line, reconvergence, geometry, Root/Scene, policy,
  adversarial, and handoff tasks shift by one and consume the exact preflight
  authority instead of re-deriving source facts.

No implementation task may combine preflight, adapter execution, source path
copy, and evidence acceptance into one monolithic owner.

## 14. Required fixtures before implementation can pass

The rewritten plan must include RED tests for:

- Thai and Latin insert/delete/replace at start, middle, and end;
- ligature-boundary edits such as `fi`, `ffi`, and adjacent style partitions;
- Thai combining/cluster boundaries and split-surrogate rejection;
- deletion with zero-length changed next range but non-empty evidence target;
- deletion of all rendered text while empty-block capability remains inactive;
- hard-break, inline-image, resolved-field, and generated-page-number
  adjacency;
- exact registered paragraph/local style insertion;
- unknown registered style, ambiguous forced style-key collision, and novel
  style structured block;
- paint-only color, equal-layout semantic/provenance change, and metric style;
- multi-style range transition without cross-style shaping;
- safe/unsafe shaping guard boundaries;
- stable/unstable bounded segmentation attempts;
- Node-native/Worker-WASM normalized equality;
- complete-oracle parity only in QA;
- clone, cross-tuple, accessor, prototype, symbol, unknown-field, unsafe
  integer, topology, font, unit, runtime, and forced fingerprint-collision
  adversaries;
- threshold-minus-one, threshold, and threshold-plus-one for each activated
  evidence unit; and
- throwing sentinels beyond every Core-declared coverage path.

## 15. Impact and intentionally deferred work

Expected implementation impact is limited to Core and
`packages/text-engine-rust-wasm`. Root V2 shape, Persistent Scene V2 shape,
Editor, Backend, complete fallback construction, complete oracle ownership,
and V1 QA behavior remain unchanged.

Intentionally deferred:

- a Change V2 carrying a novel resolved/raw style descriptor;
- document-wide style catalogs or public style handles;
- Data Definition/Binding runtime;
- generated-page-number mutation;
- empty-block incremental layout;
- worker session/handle/release protocol;
- scheduling, cancellation, queueing, or coalescing; and
- production activation.

When novel-style insertion is later approved, it must enter through a new
change-contract decision. It may reuse the V2 resolved-style material and
producer protocol but must not retroactively broaden the meaning of the 5B-2
registered-style capability.

## 16. Gate

The rewritten Phase 5B-2 implementation plan remains non-executable. Gate
state:

1. satisfied — this written correction is reviewed and accepted;
2. satisfied — the implementation plan is rewritten against this correction;
3. pending — the rewritten plan receives explicit user review and approval;
   and
4. first-execution requirement — Task 2 begins with RED tests for Core-owned
   bounded preflight, not producer adapter code.
