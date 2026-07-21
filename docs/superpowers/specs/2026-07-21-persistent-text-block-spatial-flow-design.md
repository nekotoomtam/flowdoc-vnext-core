# Persistent TextBlock Spatial Flow Design

Date: 2026-07-21

Status: design agreed in conversation and recorded for written review. No
runtime implementation, product binding, or production-readiness claim is
authorized by this document.

## Outcome

FlowDoc will treat the current TextBlock vocabulary as an initial supported
subset, not as the final capability of TextBlock. The next Live Draft work will
replace the current complete-next-request semantic pass with a Core-owned
persistent flow representation that is able to grow beyond text-only layout.

The architecture will preserve the current canonical document as authored
truth. It will derive an immutable TextBlock-local WYSIWYG scene containing:

- a persistent ordered flow tree for text and inline content;
- a persistent spatial index for positioned objects;
- explicit block geometry for role, list decoration, authored box, containing
  region, style, font, and measurement-profile facts; and
- deterministic derived line and fragment facts shared by Editor and Backend.

The first spatial milestone will execute rectangular exclusion wrapping in
Core through synthetic/internal inputs. It will not add an authored floating
object schema or expose a Word-like product feature. This proves the difficult
multi-interval layout boundary without prematurely choosing product anchoring,
dragging, layering, or transport behavior.

## Evidence And Correction To The Current Boundary

The existing MR1 layout path is a valid bounded text-run subset, but its names
must not be read as proof of complete TextBlock layout.

- `src/schema/documentV4Foundation.ts` defines TextBlock roles including
  `list-item`, with list instance, level, item identity, and optional start
  facts. It also defines TextBlock padding, borders, and fill.
- `src/schema/documentV4ImageTarget.ts` keeps `inline-image` inside the
  TextBlock child union and gives it a frame plus `verticalAlign`.
- `src/pagination/textBlockV4Measurement.ts` retains an inline image as one
  U+FFFC source slot with asset and frame facts, but the measurement run omits
  `verticalAlign`, TextBlock role/list facts, and authored box provenance.
- `src/layout/textBlockMultiRunLayoutV1.ts` and
  `src/layout/textBlockMultiRunIncrementalAcceptanceV1.ts` explicitly reject
  inline-image runs.
- No current Core layout consumer was found for list marker, numbering, or
  indentation geometry. The current canonical list metadata also does not
  select a marker/numbering style.
- `src/renderer/authoredBoxContractV1.ts` correctly derives content width from
  padding and borders, and the PDF pilot hands that content width to text
  measurement. The current MR1 request nevertheless retains only the derived
  width, not the complete box plan and owner fingerprint.
- `src/pagination/textBlockV4Pagination.ts` stacks already accepted line
  heights. It cannot recover image, list, or box geometry that was absent from
  line measurement.
- `docs/LIVE_DRAFT_MR1_COMPOSITIONAL_SEMANTIC_CHECKPOINTS.md` explicitly keeps
  images, tables, columns, and product binding outside MR1-O.

Therefore MR1-O timing is evidence for the accepted text-run fixture only. It
must not be extrapolated to complete TextBlock behavior.

## Goals

1. Remove complete next-request semantic work through structural sharing and
   compositional Core-owned fingerprints.
2. Make every current geometry-affecting TextBlock fact explicit before it can
   participate in accepted layout.
3. Support the initial flow vocabulary: styled text, resolved fields,
   generated page numbers, hard breaks, inline images, list decoration, and
   authored box geometry.
4. Prove real multi-interval rectangular text wrapping inside a TextBlock-local
   WYSIWYG scene without exposing an unfinished authored floating feature.
5. Keep Editor and Backend on the same deterministic geometry, line breaking,
   pagination, and display-list facts.
6. Preserve ownership boundaries for body flow, columns, and tables.
7. Allow future TextBlock atoms and spatial behaviors through versioned strict
   contracts without silently approximating unknown geometry.

## Non-Goals

- Declaring TextBlock complete or production-ready.
- Adding a canonical floating/positioned-object node in this implementation
  sequence.
- Building arbitrary document-wide freeform placement.
- Reproducing all Microsoft Word wrap, anchor, contour, or layering behavior.
- Editor drag handles, selection UI, IME, clipboard, or collaboration behavior
  for positioned objects.
- Backend routes, persistence writes, publication, or API activation.
- Tight/contour wrapping around image transparency.
- Cross-TextBlock overflow into a neighboring column or table cell.
- Table auto-fit column width. TextBlock intrinsic measurement may prepare for
  it, but Table remains the owner of column-width selection.

## Ownership Hierarchy

Geometry ownership is hierarchical:

```text
Page / Section composer
  -> body flow, page capacity, and page continuation
Columns
  -> column lanes, widths, gaps, and column continuation
Table
  -> grid, column widths, cell insets, row height, and row fragmentation
TextBlock
  -> local text flow, inline atom geometry, list decoration, authored box,
     and positioned objects inside the supplied content region
```

A TextBlock receives a versioned containing-region snapshot from its parent.
The parent does not inspect TextBlock internals, and TextBlock does not resize
columns or table cells by hidden mutation. TextBlock may later report strict
intrinsic minimum/preferred geometry to the Table auto-fit owner through a
separate contract.

The same TextBlock engine must work when the containing region comes directly
from body flow, a column, or a table cell. Parent geometry and its fingerprint
are layout inputs; a parent-width change invalidates derived TextBlock layout
without changing authored content.

In the initial spatial scope, positioned objects are contained by the
TextBlock content box. For an auto-height TextBlock, the object and its
clearance envelope must remain inside the horizontal content bounds and have a
non-negative local top; its bottom contributes to the derived minimum block
height. A future fixed-height TextBlock must define a separate vertical
overflow policy. Crossing into another column, cell, or sibling block is an
unsupported capability and fails closed.

## TextBlock-Local WYSIWYG Scene

The derived scene has four independent responsibilities.

### Block Geometry Context

The context pins:

- document, revision, section, and TextBlock identity;
- parent containing region and owner fingerprint;
- normalized authored box plan, including content insets and content width;
- TextBlock role and resolved list-decoration geometry;
- paragraph style, font faces, and measurement-profile identity;
- layout-unit policy fingerprint; and
- supported-capability version.

Changing width, box insets, list geometry, paragraph metrics, fonts,
measurement profile, or layout-unit policy invalidates line layout. It does
not mutate the persistent authored flow tree.

### Persistent Flow Tree

The selected sequence structure is a persistent B+ rope: bounded flow chunks
in leaves, cumulative authored/rendered lengths in internal nodes, fixed
deterministic fanout, structural sharing on edited root-to-leaf paths, and a
Merkle-style fingerprint composed from versioned summaries and ordered child
fingerprints. Exact chunk and fanout constants are implementation-policy facts
that must be pinned by contract and benchmark evidence; changing them creates
a new policy fingerprint rather than silently changing retained identity.

Its initial leaf union is:

- `text`: authored identity/range, rendered text slice, resolved style, and
  shaping dependencies;
- `resolved-field`: one authored atomic identity plus rendered value and field
  dependency;
- `generated-page-number`: one authored atomic identity plus page-specific
  value and generated-owner fingerprint;
- `hard-break`: one authored atomic identity and mandatory break behavior; and
- `inline-image`: one authored atomic identity plus resolved asset, frame,
  vertical alignment, and deterministic line-box metrics.

Text content uses bounded deterministic chunks at safe UTF-16 and shaping
boundaries so an edit inside one large authored text leaf does not copy or hash
the complete rendered block. The canonical authored inline identity remains
the source identity; internal chunks are derived and must not leak into
canonical selection or persistence.

Every subtree summary retains enough information to compose and validate:

- authored and rendered lengths;
- first/last safe source boundaries;
- mandatory-break and atomic counts;
- dependency and semantic fingerprints;
- retained shaping/segmentation checkpoint references; and
- bounded-work diagnostics.

Final x/y line positions are not stored in the content tree because they
depend on containing geometry and spatial exclusions. They belong to a
separate immutable layout snapshot.

### Persistent Positioned-Object Index

The positioned layer is represented by an immutable y-interval index. Each
entry used by the Core-only 3A milestone pins:

- object identity and geometry-owner fingerprint;
- TextBlock-local integer x, y, width, and height;
- text clearance insets;
- rectangular wrap policy;
- logical anchor identity, local offset, and movement-policy facts when those
  facts are supplied by a future authored contract; and
- whether the object contributes an exclusion, a top-and-bottom barrier, or
  overlay-only paint.

The interval index retains subtree maximum-bottom facts so a line-band query
touches only spatial entries intersecting that vertical band. Moving or
resizing an object creates a new structurally shared index and invalidates the
union of its old and new affected bands.

The 3A milestone supplies these entries through a strict synthetic/Core test
contract. It does not invent canonical floating fields.

### Flow Region Provider

The region provider accepts the block content rectangle, the current vertical
line band, list/paragraph structural insets, and intersecting spatial entries.
It returns ordered, non-overlapping integer x intervals that remain available
for flow.

The ordinary no-object path returns one interval and has a dedicated fast
path. Rectangular wrap may return one or more intervals. Top-and-bottom wrap
returns no interval while the barrier intersects the band. Overlay objects do
not remove flow space.

The provider output and all geometry dependencies have a deterministic
fingerprint. Renderer code may consume resulting placements but may not
measure or relayout them.

## Line Layout Data Flow

1. Validate canonical and resolved TextBlock identity and dependency pins.
2. Derive the complete block geometry context. Missing list-decoration or
   inline-image line metrics block the affected capability.
3. Project the supported inline union into persistent flow leaves without
   changing canonical authored offsets.
4. Retain or update the persistent positioned-object index.
5. Start the next line at a monotonic y position and derive its initial band
   from paragraph and next-atom metrics.
6. Query available x intervals for that band.
7. Place shaped clusters and atomic leaves in source order across intervals.
   A cluster or atomic leaf never splits internally. A hard break terminates
   the line.
8. Compose actual ascent/descent from all placed text and inline-image atoms.
   If the final band expands, re-query exclusions. The intersecting exclusion
   set can only grow for that candidate band; repeat until its signature is
   stable.
9. If no interval can accept the next unbreakable item, advance y monotonically
   to the next relevant exclusion bottom and retry. No arbitrary geometric
   guessing or clipping is allowed.
10. Emit immutable line facts, source mappings, interval placements, line-box
    metrics, dependency pins, and fingerprints.

The finite exclusion set and monotonic y/event progress provide deterministic
termination. Unsafe arithmetic, no-progress, or unsupported geometry blocks
the request rather than looping or approximating.

For an auto-height TextBlock, derived height is at least the maximum of the
flow bottom and positioned-object bottom plus box insets. A future fixed-height
or overflow policy requires its own explicit capability contract.

## List Geometry

List semantics belong to the TextBlock role, not to an authored inline child.
The marker/decorative lane must therefore not change text offsets.

A resolved list-decoration input will provide at least marker identity or
rendered marker content, marker advance, marker-to-content gap, level indent,
first-line interval, and continuation-line interval. These facts participate
in block-geometry and line fingerprints.

The current canonical schema does not select bullet/numbering style. The
implementation must first establish a versioned list-decoration owner contract
or block list layout. It must not guess a bullet character or numbering rule
from `instanceId`, `level`, `itemId`, or `startAt` alone.

## Inline Image Geometry

An inline image is a first-class non-shaping flow atom, not a text glyph whose
width is inferred from U+FFFC. Its declared frame contributes horizontal
advance. Its `verticalAlign` and frame contribute ascent, descent, baseline,
and final line height through a versioned deterministic algorithm.

The authored source slot remains one atomic offset before/after the image.
Source mapping, hit testing, Editor paint, and Backend paint use the same
positioned atom facts. Unknown image metrics or unsupported alignment blocks
layout.

Block images remain separate document nodes and do not become TextBlock flow
leaves. A future positioned-object schema may reference an image, but that is
separate from the current canonical inline-image child.

## Incremental Invalidation And Reuse

- A text edit updates the affected bounded flow leaves and their ancestor
  summaries, then reshapes and reflows from a safe restart point until semantic
  and geometry reconvergence.
- A field or generated value change updates the corresponding atomic leaf and
  dependent region.
- An inline-image frame or alignment change updates that leaf and all lines
  whose band or source flow is affected.
- A positioned-object move or resize invalidates lines intersecting the union
  of the old and new exclusion bands.
- A list-decoration, box, containing-width, style, font, profile, or unit-policy
  change invalidates the geometry scope named by that owner contract. Width or
  global metric changes normally require complete TextBlock reflow, but reuse
  the immutable authored flow tree.

Core owns retained objects, subtree fingerprints, provenance, and acceptance.
Adapters may provide engine facts and spatial inputs through strict contracts;
they may not supply trusted semantic digests or publishable layout decisions.

The existing MR1-O snapshot remains a bounded text-only oracle and migration
bridge. It is not silently reclassified as complete TextBlock support.

## Failure Policy

All unsupported or inconsistent geometry fails closed with structured issues.
Required failure rows include:

- unsupported flow leaf or wrap policy;
- unresolved field, generated inline, image, or list decoration;
- missing inline-image baseline metrics;
- stale parent-region, style, font, profile, spatial, or revision fingerprint;
- positioned object or clearance envelope outside the permitted horizontal
  TextBlock bounds, or with a negative local top;
- invalid/overlapping returned intervals;
- unsafe integer arithmetic;
- no vertical progress around an exclusion;
- source range, cluster, or semantic checkpoint drift; and
- renderer or adapter attempts to measure or relayout accepted facts.

Editor product binding may later retain the last valid preview while reporting
the blocked revision. Published/API generation must never use an approximate
or stale layout.

## Implementation Sequence

This is a program-level architecture split into independently reviewable
subprojects. Each numbered phase receives its own implementation plan,
verification gate, and coherent commit/handoff. No single implementation plan
may span all seven phases. The first implementation plan covers Phase 1 only;
later plans are written from the evidence and unresolved risks left by the
preceding phase.

### Phase 1: Complete Geometry Boundary

- Introduce a versioned Initial TextBlock Flow input and capability report.
- Carry role/list, authored-box plan and owner pin, complete inline-image frame
  and vertical alignment, parent region, style/font/profile, and unit-policy
  facts.
- Preserve current text-only requests through an explicit adapter.
- Rename or document text-only MR1 capabilities so they cannot be mistaken for
  complete TextBlock support.
- Add fail-closed tests for every omitted geometry dependency.

### Phase 2: Persistent Flow Tree Foundation

- Implement immutable bounded flow leaves, balanced composition nodes,
  structural sharing, and Core-owned subtree fingerprints.
- Reproduce existing text, mixed-size Text Run, field, page-number, and hard
  break results exactly.
- Replace `completeNextSemanticPassCount: 1` with a bounded compositional proof.
- Measure update cost, retained memory, and reconvergence without product
  binding.

### Phase 3: Core Spatial Wrapping 3A

- Implement the persistent y-interval spatial index and Flow Region Provider.
- Execute real multi-interval rectangular wrapping from strict synthetic Core
  inputs.
- Cover left/right/middle exclusions, top-and-bottom barriers, overlay objects,
  zero-space advancement, move, resize, and boundary rejection.
- Keep the no-exclusion single-interval fast path.
- Do not change canonical document schema or expose Editor controls.

### Phase 4: Initial TextBlock Geometry

- Lock and implement inline-image baseline/line-height behavior for all current
  `verticalAlign` values.
- Integrate authored box width and vertical inset ownership into accepted
  layout and fragments.
- Establish the resolved list-decoration owner contract, then implement marker,
  gap, first-line indent, and continuation indent without changing authored
  offsets.
- Prove mixed Text Run sizes, inline images, lists, and boxes together.

### Phase 5: Unified Incremental Reflow

- Compose flow-tree, spatial-index, and line-layout snapshots under one
  TextBlock root fingerprint.
- Implement content-edit and object-move/resize invalidation windows.
- Prove exact reconvergence, physical-id regeneration, stale rejection, and
  optional complete-oracle QA.
- Record stage diagnostics without inventing an interaction budget.

### Phase 6: Container Adapters

- Accept parent regions from body flow, columns, and table cells through the
  same TextBlock input.
- Prove exact geometry and source mapping in all three containers.
- Keep Columns ownership of lanes/continuation and Table ownership of grid,
  row/cell fragmentation, and column widths.
- Exclude table auto-fit until a separate intrinsic-measurement contract and
  decision are approved.

### Phase 7: Cross-Runtime Parity And Scale

- Run the same accepted matrices through Node-native and real Browser Worker
  text-engine paths.
- Compare complete integer geometry, source facts, display-list facts, and
  deterministic fingerprints.
- Benchmark no-exclusion typing, multiple exclusions, mixed images/lists,
  long TextBlocks, retained memory, and container cases.
- Define product budgets only from measured distributions on representative
  workloads.

### Later Product Feature: Authored Positioned Objects

This is intentionally outside the above implementation sequence. It requires a
separate design for canonical positioned-object schema, stable logical anchors,
local offsets, movement policies, z-order/overlay, Editor manipulation,
transport, persistence, and page/column continuation. It should consume the
already proved Core spatial engine rather than alter it.

## Verification Matrix

The implementation plan must include focused and composed tests for:

- Thai/Latin mixed text, surrogate pairs, combining marks, and mandatory
  breaks;
- multiple Text Run sizes, weights, styles, and line metrics;
- resolved fields and generated page numbers adjacent to edit boundaries;
- empty blocks and unbreakable items;
- inline images at baseline, middle, and text-bottom alignment;
- list first/continuation lines and list-decoration dependency drift;
- box padding and borders affecting content width and total height;
- single and multiple rectangular exclusion intervals;
- top-and-bottom and overlay spatial policies;
- positioned-object move/resize and old/new band invalidation;
- body, column, and table-cell containing regions;
- stale/tampered proofs and unsupported capability rejection;
- exact Node/Browser Worker parity; and
- bounded timing and memory diagnostics for ordinary and spatial paths.

Every accepted layout must remain renderer-independent and report no authority
to publish until its phase explicitly earns that gate.

## Acceptance Conditions

The design is successfully implemented only when:

1. text-only edits no longer require a complete next semantic pass;
2. the persistent tree and spatial index demonstrate structural sharing and
   bounded affected work;
3. inline images, lists, and authored boxes contribute complete deterministic
   geometry instead of merely surviving schema validation;
4. synthetic rectangular exclusions produce real multi-interval line layout;
5. body, column, and table-cell adapters consume the same TextBlock engine;
6. unsupported future atoms and spatial modes fail closed;
7. Browser Worker and Backend/Node facts match exactly on the accepted matrix;
   and
8. the full Core gate remains green with no unrelated repository changes.

## Intentionally Deferred

- canonical positioned/floating-object schema;
- freeform Editor manipulation and object selection;
- text-anchor rebasing under collaboration;
- objects crossing TextBlock/container boundaries;
- tight/contour wrapping;
- behind/in-front rendering semantics beyond internal overlay evidence;
- fixed-height TextBlock overflow policy;
- table auto-fit column width;
- production Editor/Backend/API binding; and
- whole-document publication readiness.
