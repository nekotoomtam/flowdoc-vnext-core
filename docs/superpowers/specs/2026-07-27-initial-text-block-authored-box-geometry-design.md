# Initial TextBlock Authored Box Geometry Design

Status: approved conversational design, recorded for written review before
implementation planning.

Date: 2026-07-27

Baseline: Core `2847e94` (`Phase 3: Core Spatial Wrapping 3A` complete).

## Decision Summary

Phase 4 is split into bounded subphases. This design covers only
`Phase 4A: Authored Box Geometry`.

Phase 4A binds the already accepted Initial TextBlock Flow authored-box plan to
the accepted Phase 3 content-local spatial layout. It applies authored content
width and vertical inset ownership, projects accepted lines and fragments into
box-local coordinates, derives the complete auto-height box extent, and
retains all existing identity, provenance, and non-production gates.

The original broad Phase 4 design also names inline-image, list-decoration, and
empty-block geometry. The later Phase 3 handoff explicitly keeps those
capabilities NO-GO. This narrower design follows the later handoff and does not
silently activate them.

## Goal

Produce one deterministic, immutable, Core-owned layout result in which:

- the exact Initial Flow authored-box owner and fingerprint are authoritative;
- the layout request width equals the Core-derived authored content width;
- Phase 3 wrapping still executes in content-local coordinates;
- accepted line, interval, placement, and fragment x/y facts are projected into
  box-local coordinates using the authored content insets;
- top and bottom content insets contribute exactly once to the derived
  TextBlock height; and
- renderer consumers may consume the result but may not measure or relayout it.

## Non-Goals

Phase 4A does not:

- implement inline-image baseline, ascent, descent, or line-height behavior;
- define or implement list markers, numbering, gaps, or indentation;
- accept empty or effectively empty TextBlock geometry;
- introduce a canonical positioned-object schema or authored spatial binding;
- change the Phase 3 synthetic spatial input authority;
- implement spatial line reuse, reconvergence, or unified incremental reflow;
- bind Editor or Backend runtime state;
- integrate Columns, Table, or Table auto-fit;
- publish layout, activate production behavior, or add Editor staged apply;
- change canonical Document v4; or
- add renderer measurement or renderer-owned layout decisions.

## Governing Evidence

The selected design follows these accepted facts:

- `VNextAuthoredBoxPlanV1` already owns `outerWidthPt`, `contentInsetPt`,
  `contentWidthPt`, owner identity, style fingerprint, and plan fingerprint.
- Initial TextBlock Flow already retains the exact authored-box plan and
  classifies list, inline-image, and empty-block rows as geometry-contract
  blockers.
- The existing text-only adapter already requires the converted authored
  content width to equal `request.availableWidthLayoutUnit`.
- The persistent flow tree is process-local and bound to one exact request.
- The Phase 3 spatial index is process-local, bound to that tree and request,
  restricted to `core-synthetic-qa-only`, and exposes an O(1) retained
  `summary.maximumBottomLayoutUnit`.
- Phase 3 wrapping executes within `[0, request.availableWidthLayoutUnit]`,
  reports content-local lines and fragments, preserves a zero-query
  no-flow-affecting fast path, and remains non-publishable and non-production.

## Approaches Considered

### A. Add a bounded authored-box composition wrapper

Create a new Phase 4A contract that validates Initial Flow/request ownership,
executes the unchanged Phase 3 layout at content-local origin zero, then
projects the accepted result into box-local coordinates.

Advantages:

- preserves the accepted Phase 3 algorithm and synthetic boundary;
- makes content-local and box-local coordinate spaces explicit;
- keeps Phase 5 unified-root work deferred;
- allows Phase 3 parity and fast-path evidence to remain independently
  testable; and
- produces a small reversible boundary with capability-honest blockers.

Cost:

- introduces one additional immutable projection layer and fingerprint chain.

### B. Add authored-box fields directly to Phase 3 spatial layout

Pass authored insets and box ownership into
`layoutVNextTextBlockSpatialWrappingV1(...)`.

Advantages:

- fewer public result layers.

Rejected because:

- it couples an accepted strict synthetic Phase 3 boundary to authored
  geometry;
- it risks changing Phase 3 fingerprints and parity fixtures;
- it makes content-local spatial coordinates ambiguous; and
- it broadens a reviewed module that already owns line placement and
  stabilization.

### C. Build the Phase 5 unified TextBlock root now

Compose Initial Flow, flow tree, spatial index, box geometry, and line layout
under one new persistent root.

Advantages:

- reaches the eventual architecture earlier.

Rejected because:

- it combines Phase 4 geometry with Phase 5 invalidation and reconvergence;
- it would require a much larger identity migration and review surface; and
- it violates the bounded Phase 4A risk decision.

### Selected approach

Approach A is selected.

## Coordinate Spaces

Phase 4A uses two named coordinate spaces.

### Content-local input space

- `x = 0` is the left edge of the authored content region.
- `y = 0` is the top edge of the authored content region.
- the request width is exactly the authored content width;
- Phase 3 spatial entries, exclusion envelopes, intervals, placements, lines,
  and fragments remain content-local; and
- Phase 3 executes with `startYLayoutUnit: 0`.

### Box-local output space

- `x = 0` is the authored outer-box left edge;
- `y = 0` is the authored outer-box top edge;
- `contentOriginXLayoutUnit` equals the converted left content inset;
- `contentOriginYLayoutUnit` equals the converted top content inset;
- line y offsets add `contentOriginYLayoutUnit`;
- available intervals, interval placements, and fragment x offsets add
  `contentOriginXLayoutUnit`; and
- source offsets and source segments do not change.

The Phase 3 result is never mutated. Phase 4A emits separately fingerprinted
box-local line and fragment facts that retain the corresponding content-local
fingerprints as provenance.

## Layout-Unit Arithmetic

Every `outerWidthPt`, `contentWidthPt`, and `contentInsetPt` edge is converted
through `convertVNextPointToLayoutUnitV1(...)`.

The request is blocked unless:

```text
contentWidthLayoutUnit == request.availableWidthLayoutUnit
outerWidthLayoutUnit
  == leftInsetLayoutUnit
   + contentWidthLayoutUnit
   + rightInsetLayoutUnit
```

All additions use safe-integer checks. Negative insets, conversion failure,
overflow, or inconsistent width arithmetic block instead of clamping,
rounding again, or approximating.

The content extent is:

```text
contentExtentBottomLayoutUnit =
  max(
    spatialLayout.summary.heightLayoutUnit,
    spatialIndex.summary.maximumBottomLayoutUnit
  )
```

The derived auto-height outer box is:

```text
outerHeightLayoutUnit =
  topInsetLayoutUnit
  + contentExtentBottomLayoutUnit
  + bottomInsetLayoutUnit
```

The retained spatial maximum uses each entry's clearance envelope. Overlay
objects do not remove flow space, but their retained envelope still contributes
to the minimum auto-height TextBlock extent. This matches the design rule that
positioned content and its clearance envelope remain inside an auto-height
TextBlock.

Fixed height, overflow, clipping, and object escape policies remain deferred.

## Components

### Shared Initial Flow/request binding inspector

Add a focused internal/publicly exported-by-Core module:

`src/layout/textBlockInitialFlowRequestBindingV1.ts`

It owns the context equality currently embedded in the text-only adapter:

- exact process-local Initial Flow inspection;
- `text-subset-ready` and `textOnlyAdapterEligible`;
- strict request shape;
- measurement equality;
- layout-unit policy fingerprint;
- declared line height;
- paragraph style;
- canonical used font faces;
- shaping typography coverage; and
- authored content-width equality.

The existing text-only adapter will consume this inspector without changing its
accepted or blocked behavior. Phase 4A will consume the same inspector so
there is one owner for Initial Flow/request equality.

The inspector does not execute layout.

### Phase 4A result contract

Add:

`src/layout/textBlockAuthoredBoxGeometryContractV1.ts`

The contract defines:

- strict source and version constants;
- box-local interval, placement, fragment, and line facts;
- retained content-local fingerprints on every projected unit;
- geometry summary and bounded work facts;
- structured issue codes;
- accepted/blocked result unions; and
- a process-local immutable result inspection type.

The accepted result pins:

- document, section, TextBlock, and instance revision;
- Initial Flow fingerprint;
- authored-box owner id, style fingerprint, and plan fingerprint;
- parent-region fingerprint;
- request layout id and layout-context fingerprint;
- persistent flow-tree fingerprint;
- spatial-index fingerprint;
- Phase 3 spatial-layout fingerprint;
- converted outer width and all four content insets;
- content origin, content width, content extent bottom, and outer height;
- box-local lines and fragments;
- Phase 3 work facts unchanged; and
- non-publishable/non-production contracts.

### Phase 4A composition

Add:

`src/layout/textBlockAuthoredBoxGeometryV1.ts`

The exported entrypoint is:

```ts
layoutVNextTextBlockAuthoredBoxGeometryV1(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  spatialIndex: VNextTextBlockSpatialIndexV1
  bindProductionLayout?: boolean
}): VNextTextBlockAuthoredBoxGeometryResultV1
```

The implementation:

1. validates a strict data-only input envelope without reading accessors;
2. rejects explicit production binding;
3. validates exact Initial Flow/request equality through the shared inspector;
4. rejects list, inline-image, or empty/effectively-empty capability rows
   before Phase 3 layout;
5. converts and validates authored-box geometry;
6. calls the unchanged Phase 3 spatial layout with content-local start y zero;
7. validates the exact immutable Phase 3 result;
8. projects accepted intervals, placements, lines, and fragments into box-local
   coordinates;
9. derives the content extent and outer auto-height;
10. computes Core-owned fingerprints from complete accepted facts;
11. deeply freezes and process-locally registers the result; and
12. returns structured blockers without partial layout on any failure.

### Public export

`src/index.ts` exports the new binding, contract, and layout modules.

No Editor or Backend package changes are part of Phase 4A.

## Data Flow

```text
exact Initial Flow
  + exact MR1-Q request
  -> shared Initial Flow/request binding inspection

exact request
  + exact persistent flow tree
  + exact core-synthetic-qa-only spatial index
  -> unchanged Phase 3 content-local spatial wrapping

authored box plan
  + accepted content-local spatial result
  + retained spatial maximum bottom
  -> immutable Phase 4A box-local geometry
```

Renderer code receives only the final immutable geometry. It may not invoke the
binding inspector, measurement, line breaking, Flow Region Provider, or
projection arithmetic to make a different result.

## Failure Policy

Phase 4A fails closed for:

- malformed or accessor-shaped input envelopes;
- cloned, stale, mutable, or foreign Initial Flow;
- non-`text-subset-ready` capability rows;
- list, inline-image, or empty-block geometry requirements;
- malformed or context-mismatched requests;
- authored-box owner, width, style, or fingerprint drift;
- non-finite, negative, unsafe, or inconsistent box geometry;
- flow-tree/request provenance mismatch;
- spatial-index/tree/request provenance mismatch;
- production binding;
- blocked or invalid Phase 3 spatial layout;
- unsafe coordinate translation or height arithmetic; and
- mutated, cloned, or non-deeply-frozen retained Phase 4A output.

Blocked results contain no lines, fragments, summary, work, or fingerprint.
They retain `mayPublishLayout: false` and `productionBinding: false`.

## Identity And Fingerprints

Phase 4A fingerprints are Core-owned and cover:

- all owner and revision identities;
- Initial Flow, parent-region, authored-box, request, tree, index, and Phase 3
  layout fingerprints;
- converted box geometry;
- every box-local line, interval, placement, fragment, and source mapping;
- derived height and counts; and
- contract flags.

Equivalent accepted facts produce the same fingerprint. A change to padding,
border width, content width, parent ownership, request width, tree, spatial
index, or content layout changes the appropriate fingerprint chain.

Physical object identity remains process-local evidence. JSON cloning or
re-freezing an accepted object does not recreate authority.

## Fast Path

For an empty or overlay-only spatial index:

- Phase 3 retains one content-local interval;
- `flowRegionFastPathCount` remains factual;
- `spatialIndexQueryCount` remains zero;
- Phase 4A performs no additional spatial query;
- reading `spatialIndex.summary.maximumBottomLayoutUnit` is O(1) retained
  summary access, not a Flow Region query; and
- zero-inset fixtures retain exact Phase 3 line ranges, y offsets, x offsets,
  intervals, placements, fragments, and source segments after removing only
  the Phase 4A wrapper fields and fingerprints.

Phase 4A does not claim line reuse or spatial reconvergence.

## Test Design

### Shared binding regression

- existing text-only adapter accepted fixtures remain byte-identical;
- existing blocked adapter rows retain their issue codes and layout metadata;
- request measurement, width, line-height, style, font, and shaping drift block
  through the shared inspector; and
- the inspector never invokes layout.

### Authored width and horizontal origin

- zero padding/border produces content origin x zero;
- left/right padding and borders reduce the request width through the existing
  authored-box plan and shift box-local intervals, placements, and fragments;
- a narrower authored content width produces the expected additional line
  wrapping when the request/tree/index are built from that exact width;
- outer width arithmetic is exact; and
- one-unit width drift blocks before Phase 3 layout.

### Vertical inset and auto-height

- top padding and border shift every box-local line y by the exact converted
  top inset;
- bottom padding and border add exactly once to outer height;
- top/bottom inset changes do not change source offsets or source segments;
- a spatial envelope below the flow bottom determines the content extent;
- an overlay below the flow bottom contributes height without consuming flow
  space; and
- unsafe translated y or height arithmetic blocks.

### Spatial composition

- left, right, middle, and multiple exclusions retain their content-local
  behavior and receive one box-local x translation;
- top/bottom barriers and zero-space advancement retain monotonic progress;
- move/resize indexes bind the exact next index and affect the final
  fingerprint and height;
- a stale or cloned index blocks; and
- the no-flow-affecting path retains zero index queries.

### Capability and authority gates

- independent inline-image, list-only, empty resolved-field, and
  hard-break-only rows remain blocked;
- cloned/re-frozen Initial Flow, tree, index, or Phase 4A result fails
  process-local inspection;
- parent-region, box-plan, request, and revision drift block;
- unknown fields and accessors block without execution;
- production binding blocks; and
- every accepted result reports `mayPublishLayout: false`,
  `productionBinding: false`, and `stagedEditorApply: false`.

### Documentation guard

A focused Phase 4A handoff test will require:

- the capability matrix;
- exact NO-GO rows;
- focused and full verification counts;
- implementation baseline;
- files and behavior changed; and
- the next explicitly bounded checkpoint.

## Acceptance Conditions

Phase 4A is accepted only when:

1. authored content width is an exact binding input to accepted layout;
2. Phase 3 spatial wrapping remains content-local and unchanged;
3. all accepted line/interval/placement/fragment geometry is available in
   box-local coordinates;
4. top and bottom authored content insets contribute exactly once;
5. the maximum retained spatial envelope contributes to auto-height;
6. source mappings remain unchanged by coordinate projection;
7. zero-inset/no-flow-affecting fixtures retain Phase 3 geometry and fast-path
   work facts;
8. identity, provenance, stale, tamper, and unsafe-arithmetic rows fail closed;
9. list, inline-image, empty-block, product, container, and publication rows
   remain blocked;
10. focused tests, type-check, `git diff --check`, and the full Core gate pass;
    and
11. the finished work is reviewed and committed as one coherent bounded phase.

## Risks

- Extracting request-binding logic from the existing adapter can accidentally
  change old rejection order or metadata. Existing adapter tests must lock
  byte-level behavior before and after extraction.
- Projecting all nested geometry requires complete fingerprint regeneration;
  retaining a Phase 3 fingerprint on translated facts would be dishonest.
- Point-to-layout-unit conversion can expose width-sum differences if each edge
  is converted independently. The exact equality gate intentionally blocks
  inconsistent authored plans instead of compensating.
- A spatial envelope may extend below all text. Reading the retained index
  summary is required so auto-height does not clip positioned content.

## Unknowns Retained

- inline-image baseline rules for all `verticalAlign` values;
- list-decoration owner, marker format, and indentation contract;
- empty/effectively-empty TextBlock line geometry;
- fixed-height TextBlock overflow and clipping policy;
- authored positioned-object identity, anchoring, persistence, and product
  controls;
- spatial reconvergence and line reuse; and
- product-scale memory and interaction budgets for complete geometry.

## Intentionally Deferred Checkpoints

- `Phase 4B`: inline-image line-box geometry, only after explicit authorization;
- `Phase 4C`: resolved list-decoration ownership and geometry, only after
  explicit authorization;
- `Phase 4D`: empty/effectively-empty TextBlock geometry, only after explicit
  authorization;
- `Phase 5`: unified incremental reflow and one TextBlock root fingerprint;
- `Phase 6`: body/Columns/Table parent adapters; and
- `Phase 7`: complete cross-runtime parity and scale qualification.

Phase 4A completion does not automatically authorize any later checkpoint.
