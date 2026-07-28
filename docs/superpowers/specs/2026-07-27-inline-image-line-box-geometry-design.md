# Inline Image Line-Box Geometry Design

**Date:** 2026-07-27

**Status:** Implemented and accepted as the bounded Core-only Phase 4B checkpoint

**Scope:** FlowDoc vNext Core, Phase 4B

**Depends on:** Phase 3A spatial wrapping and Phase 4A authored box geometry

## 1. Decision Summary

Phase 4B adds one image placement mode to Core: an inline image is an
unbreakable inline-flow atom whose authored frame participates in line breaking,
line-box height, baseline placement, spatial wrapping, and authored-box
auto-height.

The implementation will use one shared internal layout kernel with two public
compatibility boundaries:

- V1 remains frozen. Its accepted results, blocked outcomes, fingerprints,
  identity checks, and provenance checks must remain exact.
- V2 is a successor boundary that accepts both text-only and image-aware flows.
  Its text-only geometry must match V1 after excluding the intentionally
  different version and fingerprint wrappers.

This is not a permanent dual-engine design. V1 protects the already-reviewed
MR1 contract while V2 becomes the eventual single TextBlock path. Shared
internals prevent tree, spatial-index, flow-region, and line-placement logic
from diverging.

Phase 4B remains Core-only and strict synthetic QA. It does not bind the Editor
or Backend and does not activate publication.

## 2. Why This Shape

Inline images are expected to be a heavily used authoring feature. Treating
them as a narrow exception in the V1 text-only path would create several forms
of long-term debt:

- image-specific line breaking beside the established spatial wrapping engine;
- a second persistent-tree or interval-index implementation;
- a capability router that keeps text-only blocks on V1 indefinitely;
- synthetic evidence that a real shaping producer cannot emit later;
- weakened identity gates to make otherwise incompatible objects fit together.

The selected design instead pays for an explicit V2 boundary once, keeps the
V1 boundary intact, and factors the existing algorithms beneath both versions.
The same V2 path handles text-only and image-aware blocks, so Phase 5 can move a
whole TextBlock scene atomically rather than composing results from two layout
authorities.

## 3. Goals

Phase 4B must:

1. Retain inline-image atoms from strict Initial Flow input through accepted
   authored-box geometry.
2. Use the authored image frame as the inline advance and line-box contribution.
3. Support `baseline`, `middle`, and `text-bottom` vertical alignment.
4. Support image-only, text-plus-image, adjacent-image, and multi-image content.
5. Preserve hard breaks and existing text-bearing field/page-number behavior.
6. Work with no exclusions, left/right/central exclusions, barriers, overlays,
   zero-space advancement, moved/resized exclusions, and boundary rejection.
7. Re-query the Flow Region Provider when image height expands a candidate
   vertical band.
8. Preserve the no-exclusion single-interval fast path.
9. Preserve strict physical identity, provenance, layout identity, unit policy,
   and fingerprint gates.
10. Produce a V2 evidence boundary that a future Rust/WASM producer can emit
    without redesigning Core.
11. Keep the persistent rope, y-interval treap, Flow Region Provider, and line
    placement algorithms shared internally.
12. Leave an explicit, reviewable path into Phase 5 edits and incremental reuse
    without claiming those capabilities in Phase 4B.

## 4. Non-Goals

Phase 4B does not add:

- floating, positioned, overlay, behind-text, or in-front-of-text images;
- block-image layout or conversion between block and inline images;
- image bytes, intrinsic-size loading, decoding, or paint rasterization;
- Editor or Backend binding;
- Editor staged apply/state;
- Columns or Table integration;
- Table auto-fit;
- publication or production activation;
- list decoration geometry;
- empty-block geometry;
- automatic image scaling to fit an interval;
- image margin, padding, border, rotation, or effects;
- fixed-height TextBlock overflow or clipping policy;
- incremental edits, suffix reuse, reconvergence, or performance claims.

`fit` and `crop` remain paint-inside-frame facts. They are retained and
fingerprinted but do not change the outer line-layout rectangle.

## 5. Existing Boundaries

### 5.1 Initial Flow

Initial Flow already retains inline images as one U+FFFC source slot with:

- nullable `assetId`;
- an authored positive width and height;
- `fit`;
- optional `crop`;
- `verticalAlign`.

The current capability boundary blocks the item because Core does not yet own
the required line-box contract. Phase 4B replaces only that capability gap.

### 5.2 V1 Persistent Flow

The V1 persistent tree explicitly excludes inline-image items and is created
from an already accepted MR1 layout. That construction order cannot support
image-aware Core line placement: V2 must build its flow tree before accepted
line geometry exists.

V1 construction and its MR1-Q suffix proof therefore remain unchanged at the
public boundary. Phase 4B does not retrofit images into that constructor.

### 5.3 Spatial Binding

The current spatial index binds exact V1 tree and request objects in a
process-local identity registry. The treap and region math are otherwise
independent of the text item type.

Phase 4B will factor the identity-independent algorithms beneath a small
internal authority abstraction. It will not loosen the public V1 checks.

### 5.4 External Producer

The Rust/WASM multi-run producer currently rejects inline images before
itemization. It already separates shaping by text run, segments the complete
rendered string, derives break opportunities, and passes evidence into Core.

V2 evidence must preserve that producer/Core separation:

- the producer shapes text;
- Core owns flow atoms, line placement, image advance, line metrics, spatial
  band stabilization, and final geometry.

## 6. User-Visible Model

Phase 4B exposes one placement mode:

`inline-flow`

An inline image behaves like an unbreakable character with an authored
rectangular frame:

- its width consumes horizontal line space;
- its height can grow the line box;
- it moves with surrounding inline content;
- a break may occur before or after it when the evidence allows;
- a break never divides the image;
- it participates in exclusion wrapping using the same candidate intervals as
  text;
- overlay-only spatial entries remain flow-neutral for the image exactly as for
  text.

`baseline`, `middle`, and `text-bottom` are alignment variants inside this one
placement mode, not separate placement modes.

## 7. Architecture

### 7.1 Frozen V1 Boundary

All existing V1 public entrypoints remain semantically frozen:

- same input types;
- same exact-object requirements;
- same accepted and blocked ordering;
- same output geometry;
- same public fingerprints;
- same MR1-Q proof behavior.

Refactoring shared internals is allowed only when characterization tests prove
that the public V1 boundary is unchanged.

### 7.2 V2 Successor Boundary

V2 accepts a strict, closed set of flow atoms:

1. text cluster;
2. hard break;
3. inline image.

Fields and page numbers remain text-bearing source-identity cases; they do not
become new geometry plugins.

The union is deliberately closed. Phase 4B does not introduce a generic atom
callback, renderer plugin, arbitrary measurement hook, or producer-supplied
line-placement function.

### 7.3 Shared Internal Kernel

V1 and V2 use shared internal mechanisms for:

- immutable rope/node construction and traversal;
- persistent source-range accounting;
- y-interval indexing;
- exclusion event lookup;
- flow-region interval subtraction;
- candidate group placement;
- vertical advancement;
- expanded-band stabilization;
- authored-box-local projection.

Version-specific adapters validate their own contracts and translate into the
closed internal kernel. The kernel never accepts a partially validated public
request.

### 7.4 Process-Local Layout Authority

The shared kernel receives an internal, opaque layout-authority token. The
token:

- is minted only after the version-specific boundary validates exact objects;
- binds one validated flow tree, evidence set, spatial index, and layout
  request;
- is checked by physical identity, not by matching user-provided strings;
- never appears in public output;
- is never persisted or serialized;
- cannot be supplied by Editor, Backend, or a shaping producer.

For V1, the adapter continues to require the exact existing tree/request
objects and maps that binding to the token.

For V2, the adapter requires the exact Initial Flow, evidence, and V2 tree
objects and maps their binding to the token.

This token is an internal refactoring seam, not the unified cross-runtime root
planned for Phase 5.

## 8. V2 Producer Evidence

V2 evidence is strict data. It contains:

- exact Initial Flow identity and fingerprint;
- layout identity;
- unit policy;
- available width;
- declared line height;
- paragraph font ascent and descent;
- shaped text runs covering text-bearing ranges only;
- break offsets over the complete rendered text, including U+FFFC slots;
- all producer dependencies required to reproduce the evidence fingerprint.

V2 evidence does not contain:

- precomputed lines;
- producer-selected intervals;
- producer-selected image positions;
- image-derived line metrics;
- callbacks;
- image bytes;
- fallback asset resolution;
- incremental reuse claims.

### 8.1 Coverage Rules

Evidence validation must prove:

1. Shaping runs cover every text-bearing source slot exactly once.
2. Shaping runs never cover inline-image or hard-break slots.
3. Break offsets are sorted, unique, in bounds, and tied to the complete
   rendered-text identity.
4. Every inline-image atom maps to exactly one U+FFFC source slot.
5. The evidence and Initial Flow are the exact objects bound into the V2 tree.
6. Unit and layout policies are supported and fingerprinted.

The evidence schema must be producible by the future Rust/WASM adapter without
a synthetic-only Core translation layer.

### 8.2 U+FFFC Stop Gate

Before building the V2 tree or spatial path, Phase 4B-1 must prove the actual
Node-native and Rust/WASM segmentation/break behavior around U+FFFC for the
supported text cases.

If the runtimes cannot produce one exact, reviewable break-offset contract,
implementation stops. The evidence boundary is revised before later 4B work
continues.

## 9. Units and Authored Frame

The outer authored image frame is the only image geometry used by layout.

Core will add one strict, reusable conversion helper from schema `UnitValue`
(`pt` or `mm`) to `LayoutUnit`:

1. validate a finite positive schema value;
2. convert millimetres to points using `(value * 72) / 25.4`;
3. call the existing point-to-LayoutUnit conversion;
4. round only once at the final integer boundary;
5. require a positive safe integer result.

The conversion must be Core-owned and shared. Image layout must not duplicate a
local millimetre formula or rounding policy.

The converted frame width is the horizontal advance. No implicit margin is
added. A frame that is wider than every full content interval is blocked; Core
does not scale it.

## 10. Alignment Policy

Coordinates are relative to the line baseline, with positive y downward.

Let:

- `A` be the non-negative paragraph ascent;
- `D` be the non-negative paragraph descent;
- `H` be the positive image-frame height.

The image extents relative to the baseline are:

| Alignment | Top | Bottom |
| --- | ---: | ---: |
| `baseline` | `-H` | `0` |
| `text-bottom` | `D - H` | `D` |
| `middle` | `floor((D - A - H) / 2)` | `top + H` |

For `middle`, floor means toward negative infinity. When the numerator is odd,
this biases the image upward by at most half a LayoutUnit. A LayoutUnit is
1/1,000,000 point, so the bias is deterministic and visually negligible.

For every image:

- image ascent is `max(0, -top)`;
- image descent is `max(0, bottom)`.

Paragraph metrics are the V2 alignment anchor. The policy is versioned and
fingerprinted because a future product decision may replace the anchor with
run-local metrics. Such a change must create a new policy version rather than
silently changing V2 geometry.

## 11. Line-Box Metrics

### 11.1 Text-Only Lines

A V2 text-only line must use the same metric reduction and final geometry as
V1. Phase 4B must not alter its baseline, height, fragment y positions, or
wrapping decisions.

### 11.2 Image-Bearing Lines

For a line containing text and/or images, paragraph ascent/descent provide a
strut even when the line is image-only.

Let candidate content extents relative to the baseline include:

- `-paragraphAscent` and `paragraphDescent`;
- every text fragment top and bottom;
- every image top and bottom from the alignment policy.

Then:

```text
contentTop       = min(all candidate tops)
contentBottom    = max(all candidate bottoms)
naturalHeight    = contentBottom - contentTop
lineHeight       = max(declaredLineHeight, candidateBandHeight, naturalHeight)
leadingBefore    = floor((lineHeight - naturalHeight) / 2)
baselineOffset   = leadingBefore - contentTop
imageY           = lineY + baselineOffset + imageTopFromBaseline
```

The remaining odd LayoutUnit of leading, if any, is placed after the content.
This matches the deterministic upward bias used by the alignment policy.

The accepted result retains enough exact facts to audit:

- baseline;
- final line top and height;
- image x/y/width/height;
- alignment;
- source range;
- asset and paint dependency identity.

## 12. Line Placement and Spatial Wrapping

### 12.1 Atom Grouping

Core derives unbreakable groups from the validated V2 atoms and producer break
offsets:

- a text group advances by its shaped cluster widths;
- an image group advances by its frame width;
- a hard break terminates the current line;
- an image is never split;
- adjacent images may occupy one line when their combined advance fits.

### 12.2 Candidate Interval Placement

The existing placement behavior remains authoritative:

1. query the Flow Region Provider for the current vertical band;
2. attempt the next unbreakable group in the current interval;
3. continue into later intervals on the same band when allowed;
4. wrap to a new line when the group cannot be placed on the current line;
5. advance to the next finite exclusion event when current space is zero or
   temporarily insufficient;
6. block when the group cannot fit a full content interval and no future event
   can make it fit.

This preserves left, right, middle, and multi-interval rectangular wrapping,
including top/bottom barriers, overlays, move/resize effects, and boundary
rejection.

### 12.3 Expanded-Band Stabilization

An image can make a line taller than the initial paragraph-height band. The
candidate line therefore uses the existing finite stabilization pattern:

1. form a candidate line in the queried band;
2. compute its natural image-aware height;
3. if the height expands the band, re-query the Flow Region Provider over the
   expanded y interval;
4. re-place the candidate against the new intervals;
5. repeat until the band and placement are stable or an existing finite
   rejection condition is reached.

The implementation must reuse the Phase 3A termination proof and event
advancement. It must not add an unbounded image-specific retry loop.

### 12.4 Fast Path

When the index is empty or contains only overlay entries, the provider
continues to return one full-width interval without walking the spatial treap.
Image awareness does not remove or special-case this fast path.

## 13. Persistent Flow V2

V2 builds an immutable flow tree from validated atoms and evidence before line
placement.

The tree:

- uses the shared persistent rope/node algorithms;
- stores text-cluster, hard-break, and inline-image atoms;
- preserves source identity and exact source ranges;
- fingerprints image frame, alignment, asset identity, fit, and crop;
- supports traversal needed by the shared placement kernel;
- does not depend on an already accepted line layout.

Phase 4B makes no MR1-Q suffix, reconvergence, or incremental update claim for
this tree. Those behaviors remain V1-only until Phase 5 defines and proves the
unified edit root.

## 14. Spatial Index and Flow Region Provider

The y-interval treap, exclusion normalization, and interval subtraction
algorithms remain single implementations.

Version adapters may expose distinct public result and binding types, but they
must delegate to the same internal algorithms. The V2 binding fingerprint also
includes the V2 tree/evidence authority facts.

The following remain rejected:

- structurally equal but physically different bound objects;
- a tree built from different Initial Flow or evidence objects;
- an index used with another authority token;
- changed exclusion inputs after index construction;
- unsupported unit policy;
- missing or mismatched layout identity.

## 15. Authored-Box Projection

Phase 4A box conversion, padding, border, and auto-height behavior are reused
internally. Phase 4B does not invent a fixed-height input or overflow policy;
fixed height remains unsupported and deferred.

V2 projection adds image fragments beside text fragments. All fragments are
box-local and share the same line authority. Auto-height includes the final
image-aware line bottom plus the existing authored-box insets.

An image is accepted only when:

- its exact Initial Flow atom carries a non-null `assetId` produced by the
  existing pre-layout resolution and measurement binding;
- frame conversion succeeds;
- the line and image rectangles remain inside accepted layout bounds;
- the complete authority and fingerprint chain matches.

Phase 4B does not perform a second asset-registry lookup and Core does not load
asset bytes. The non-null bound id proves dependency identity, not renderability
of pixels. A future runtime adapter must provide that already-resolved binding
through the same Initial Flow boundary.

A null binding represents missing, empty, or unresolved media and blocks
image-aware accepted geometry. The blocked result must identify the failed
boundary without fabricating a placeholder frame.

## 16. Result and Fingerprint Rules

V2 outputs must distinguish:

- version;
- layout identity;
- Initial Flow fingerprint;
- evidence fingerprint;
- flow-tree fingerprint;
- spatial-index/provider fingerprint;
- alignment-policy version;
- authored-box geometry fingerprint;
- image asset/frame/fit/crop dependencies.

Fingerprints are deterministic data proofs, not replacements for process-local
physical identity gates.

V1 public fingerprints must remain byte-for-byte stable. V2 text-only geometry
parity is compared after intentionally removing V2-only version and authority
wrappers; V2 does not pretend to have the same public fingerprint as V1.

## 17. Blocked Outcomes

Phase 4B must reject, at minimum:

- unresolved or missing image asset identity;
- zero, negative, non-finite, unsafe, or unsupported frame values;
- unsupported placement or vertical-alignment values;
- shaping coverage across an image or hard-break source slot;
- missing, duplicate, out-of-order, or out-of-range break evidence;
- evidence from another Initial Flow object;
- tree, index, provider, or request authority mismatch;
- image width too large for a full content interval;
- any unsupported fixed-height authored-box input or overflow/clipping mode;
- exclusion or geometry outside the accepted authored-box boundary;
- unstable or non-terminating placement conditions caught by existing guards.

Image-only content is not empty and can be accepted.

Truly empty, effectively empty, and hard-break-only content retain their
existing blocked behavior unless a separately approved phase changes it.

## 18. Delivery Sequence and Stop Gates

### 18.1 Phase 4B-1 — Evidence and Metric Foundation

Deliver:

- shared strict UnitValue-to-LayoutUnit conversion;
- versioned inline-image alignment and line-metric policy;
- producer-compatible V2 evidence contract;
- actual Node-native/Rust-WASM U+FFFC parity proof;
- comprehensive V1 accepted/blocked/fingerprint characterization.

Stop if:

- U+FFFC break evidence cannot be made exact across runtimes;
- the proposed evidence needs producer-specific callbacks or precomputed lines;
- V1 characterization cannot be frozen.

### 18.2 Phase 4B-2 — Flow Atom and Persistent Tree Foundation

Deliver:

- closed internal flow-atom kernel;
- shared generic rope/node internals;
- Persistent Flow V2;
- internal process-local layout authority;
- exact V1 compatibility verification after refactoring.

Stop if:

- V1 geometry, blocked ordering, or fingerprints drift;
- physical identity gates must be weakened;
- the design would require a second persistent-tree engine.

### 18.3 Phase 4B-3 — Shared Spatial Placement

Deliver:

- shared spatial authority/index/provider kernel;
- image-aware candidate grouping and line metrics;
- multi-interval placement and expanded-band stabilization;
- V2 line and fragment results;
- no-exclusion fast-path preservation.

Stop if:

- a second treap or Flow Region Provider is required;
- image placement cannot use the existing finite advancement proof;
- text-only V2 geometry differs from V1.

### 18.4 Phase 4B-4 — Authored Box and Hardening

Deliver:

- V2 authored-box-local image projection;
- image-aware auto-height while preserving fixed-height as NO-GO;
- full authority/fingerprint hardening;
- regression, adversarial, property, and parity coverage;
- Phase 4B handoff and phase-ledger update.

Stop if:

- any identity or provenance bypass remains;
- the full Core gate fails;
- the result implies Editor, publication, or Phase 5 activation.

Each subphase is independently reviewable. Work proceeds through these stop
gates in order rather than building the complete feature behind one late
integration test.

## 19. Verification Matrix

### 19.1 Content

- image-only;
- text before/after image;
- adjacent images;
- multiple images across lines;
- Thai and Latin around images;
- fields and page numbers around images;
- hard breaks before, between, and after images;
- mixed text sizes with each vertical alignment.

### 19.2 Geometry

- each `pt` and `mm` frame dimension;
- odd/even LayoutUnit middle-alignment cases;
- image shorter than, equal to, and taller than the paragraph strut;
- declared line height below, equal to, and above natural height;
- image exactly fitting and exceeding an interval;
- auto-height authored boxes and rejection of unsupported fixed-height input.

### 19.3 Spatial Flow

- no exclusion;
- left, right, and middle exclusion;
- multiple intervals on one band;
- top and bottom barriers;
- overlay exclusion;
- zero-space advancement;
- exclusion move and resize;
- image-expanded band discovering a new exclusion;
- boundary rejection.

### 19.4 Authority and Parity

- V1 golden accepted outputs;
- V1 golden blocked outcomes and ordering;
- V1 fingerprint stability;
- V2 text-only geometry parity with V1;
- clone/equal-object identity attacks at every binding;
- changed evidence, frame, asset, fit, crop, alignment, or exclusion;
- Node-native/Rust-WASM U+FFFC evidence parity.

### 19.5 Properties

- deterministic results and fingerprints;
- monotonic source traversal;
- no overlapping accepted fragments in one interval;
- every image rectangle lies within its accepted line interval and line box;
- interval results remain sorted and non-overlapping;
- expanded-band placement terminates under the existing finite event bound;
- no-exclusion behavior remains single-interval.

## 20. Acceptance Criteria

Phase 4B is complete only when:

1. all four subphases pass their stop gates;
2. V1 compatibility is exact;
3. V2 accepts the defined image-aware cases and blocks invalid cases
   deterministically;
4. V2 text-only geometry matches V1;
5. the shared-kernel requirement is demonstrated by code structure and tests;
6. Node-native and Rust/WASM evidence parity is proven;
7. all focused and full Core checks pass;
8. the handoff explicitly states that Editor/Backend binding, activation,
   incremental edits, and reuse remain deferred.

## 21. Phase 5 Handoff

Phase 5 is the real product-readiness and incremental-flow gate. It must decide
and prove:

- one unified TextBlock layout root;
- text edits and image insert/delete/move operations;
- frame and alignment changes;
- exclusion move/resize invalidation;
- line reuse, suffix reuse, and reconvergence;
- cross-runtime producer integration;
- performance under realistic heavily used documents;
- fixed-height overflow and clipping policy;
- atomic Editor state and staged apply;
- publication/activation policy.

Phase 4B prepares those seams but does not claim them. In particular, the
internal authority token must not be promoted into a persisted Phase 5 identity
without a separate design review.

## 22. Risk Register

| Risk | Control |
| --- | --- |
| Two engines drift | One shared kernel; frozen V1 and successor V2 adapters |
| Image exception pollutes text layout | Closed flow-atom union used by both text-only and image-aware V2 |
| Cross-runtime break behavior differs | 4B-1 U+FFFC parity stop gate |
| Identity checks are weakened during refactor | Internal opaque authority plus exact public object gates |
| Tall images miss exclusions | Expanded-band re-query using Phase 3A termination proof |
| Alignment becomes accidental ABI | Versioned, fingerprinted paragraph-metric policy |
| Millimetre rounding diverges | One Core-owned conversion with one final rounding step |
| Oversized images hide layout failure | Deterministic block; no implicit scaling |
| Synthetic QA becomes a dead-end API | Producer-shaped data evidence, no callbacks or precomputed lines |
| Phase 4B overclaims incremental readiness | Explicitly no reuse/reconvergence claim; Phase 5 owns it |

This architecture deliberately keeps Phase 4B narrow at the product boundary
while making the Core foundation broad enough to avoid replacing it when the
feature becomes a common authoring path.
