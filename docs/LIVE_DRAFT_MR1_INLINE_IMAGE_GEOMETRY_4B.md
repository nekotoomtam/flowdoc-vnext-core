# Live Draft MR1 Inline Image Geometry (Phase 4B)

## Status

Status: implemented and accepted as the bounded Core-only Phase 4B checkpoint.
The implementation evidence ends at accepted Task 11 implementation head
`f8eb3ba`; Task 12 records this handoff without changing the implementation.

All accepted values remain synthetic-QA-only and retain
`mayPublishLayout: false`, `productionBinding: false`, and
`stagedEditorApply: false`.

## Outcome

Phase 4B adds a closed V2 inline-flow path for text clusters, hard breaks, and
inline images. An image is unbreakable, uses its resolved authored frame as its
advance, participates in line-box metrics and spatial wrapping, and projects
into the authored box beside text.

Accepted task evidence is recorded by ranges rather than an invented task
commit count: `93a34be..576f660` (plan and line metrics),
`3e9c3d9..3a42cde` (producer evidence), `226c6d1..fd62f7d` (shared rope and
V2 tree), `94385e5..7963169` (shared spatial authority/index), and
`5b2f876..f8eb3ba` (shared placement, authored box, and hardening).

## Architecture Evidence

V2 adapters are thin ownership boundaries over the existing shared kernels:
`textBlockPersistentFlowTreeInternalsV1.ts`,
`textBlockFlowRegionKernelV1.ts`, `textBlockSpatialWrappingKernelV1.ts`, and
`textBlockAuthoredBoxGeometryKernelV1.ts`. The public V2 modules bind exact
Initial Flow, evidence, tree, index, and layout objects before delegating;
they do not expose privileged construction or authority helpers.

`tests/textBlockV1LayoutCompatibility.test.ts` characterizes frozen V1 public
geometry, fingerprints, and rejection order while also guarding that shared
authored-box kernels stay off the public surface. The successor V2 text-only
path is normalized against that boundary in
`tests/textBlockSpatialWrappingLayoutV2.test.ts`.

The policy in `src/layout/textBlockInlineImageLineBoxV1.ts` fingerprints
paragraph-metric alignment. `baseline`, `text-bottom`, and `middle` calculate
image extents deterministically; `middle` uses floor toward negative infinity.
The line reducer combines paragraph strut, text, and image extents, then
retains the resulting baseline and line geometry in V2 output.

## Producer And Runtime Evidence

`tests/textEngineFlowEvidenceNodeWasmV2.test.ts` exercises real
`node-native-mr1` and `browser-worker-wasm-mr1` producer identities. The
Worker-WASM row verifies the pinned MR1 WASM digest, Rustybuzz and ICU4X
execution flags, and non-production binding; the Node-native row verifies its
native execution identity.

Node-native and Worker-WASM U+FFFC/hard-break rows accept matching Core
evidence: equal evidence inputs and break offsets, with shaping runs containing
neither U+FFFC nor hard breaks. `tests/textBlockFlowEvidenceV2.test.ts` separately
accepts producer-shaped image-only, text-only, and mixed evidence while
rejecting producer-selected lines, unresolved images, invalid break topology,
and shaping coverage through image or hard-break source slots.

## Persistent Flow Evidence

`src/layout/textBlockPersistentFlowTreeV2.ts` creates the immutable V2 tree
after exact V2 evidence acceptance. Its atoms retain source order, text
clusters, hard breaks, inline-image frame/alignment, asset identity, fit, and
crop dependencies. `tests/textBlockPersistentFlowTreeV2.test.ts` covers
image-only, mixed, adjacent-text splitting, fit/crop fingerprint changes,
unsafe dimensions, foreign authority, and mutation resistance.

The V2 evidence/tree/index/provider/layout chain is physical-identity-bound:
clones, structurally equal replacements, altered dependencies, accessors,
proxies, mutable values, and production-bound envelopes block without partial
results. This is an authority check, not a serialization or persisted identity
contract.

The exact upstream Initial Flow/evidence provenance is required and no MR1-Q,
reuse, or reconvergence claim is made. Stale, cloned, structurally equal
replacement, accessor-shaped, proxy-shaped, mutable, re-fingerprinted, altered
dependency, and production-bound inputs fail closed with no partial tree.

## Spatial Wrapping Evidence

`src/layout/textBlockSpatialIndexV2.ts`,
`textBlockSpatialIndexUpdateV2.ts`, and
`textBlockFlowRegionProviderV2.ts` use the shared spatial kernels. The V2
layout calls `runVNextTextBlockSpatialWrappingKernelV1(...)`, preserving
multi-interval placement, barriers, finite zero-space/event advancement, and
overlay-neutral full-width fast paths.

`tests/textBlockSpatialWrappingLayoutV2.test.ts` covers image-only, mixed
Thai/Latin, fields/page numbers/hard breaks, adjacent images, mixed text sizes,
all alignment variants, barriers, overlays, exact fit, overflow, and
image-expanded-band requery. The hardening matrix covers deterministic source
traversal, sorted/non-overlapping intervals, image-in-interval/line-box
properties, zero-space rejection, multi-interval behavior, and bounded work.

Move and horizontal-resize updates report affected spatial bands and change
the relevant intervals. They do not claim line reuse or reconvergence:
`tests/textBlockInlineImageGeometry4bHardening.test.ts` explicitly verifies
that update facts expose neither counter.

The exact tree/index/update/provider/layout authorities are required. The same
named stale, cloned, structurally equal replacement, accessor-shaped,
proxy-shaped, mutable, re-fingerprinted, altered dependency, and
production-bound attacks fail closed with no partial intervals, lines, or work.
Accepted spatial results retain `mayPublishLayout: false`,
`productionBinding: false`, and `stagedEditorApply: false`.

## Authored Box Evidence

`src/layout/textBlockAuthoredBoxGeometryV2.ts` reuses the shared authored-box
conversion/projection kernel and reprojects V2 text and image fragments into
box-local coordinates. `tests/textBlockAuthoredBoxGeometryV2.test.ts` verifies
mixed text/image projection, exact auto-height including overlay extent, and
reprojection after a moved spatial index.

Auto-height is accepted; fixed-height input, overflow, and clipping have no
Phase 4B policy. The V2 boundary rejects stale, cloned, accessor-shaped,
mutable, re-fingerprinted, and production-bound authority rather than
fabricating geometry.

The exact spatial result, plan, and parent dependencies are required. The same
named stale, cloned, structurally equal replacement, accessor-shaped,
proxy-shaped, mutable, re-fingerprinted, altered dependency, and
production-bound attacks fail closed with null geometry, lines, summary, and
fingerprint; accepted box results retain `mayPublishLayout: false`,
`productionBinding: false`, and `stagedEditorApply: false`.

## PASS

- V1 compatibility remains characterized and V2 text-only geometry is checked
  against it.
- Node-native and Worker-WASM U+FFFC evidence agrees at the Core boundary.
- Image-only, mixed, adjacent, multiple, alignment, spatial, move/resize, and
  authored-box auto-height evidence are covered by the focused Phase 4B gate.
- All accepted output remains Core-only and non-production.

## FAIL / BLOCKER

The following deliberately block: unresolved image identity; invalid frame
units/dimensions; unsupported alignment; malformed shaping or break evidence;
foreign Initial Flow/evidence/tree/index/provider/layout authority; unsafe
arithmetic; oversized unbreakable image; and fixed-height, overflow, or
clipping requests.

List decoration, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO.

## RISK

- The process-local authority registry protects only one Core process; it is
  not a future cross-runtime or persisted identity design.
- Producer parity is the bounded U+FFFC evidence contract, not general
  production shaping or renderer parity.
- Spatial update facts prove affected bands and new geometry, not incremental
  line reuse, reconvergence, or performance budgets.

## UNKNOWN

- Product-level image authoring, asset loading/renderability, and image edit
  lifecycle remain unspecified here.
- Fixed-height overflow/clipping and realistic heavily used-document
  performance require a separately reviewed decision.
- Unified TextBlock roots, cross-runtime producer integration, Editor staged
  apply, and publication policy are unresolved Phase 5 work.

## Verification

Focused command:

```text
npx vitest run tests/liveDraftMr1InlineImageGeometry4b.test.ts tests/textEngineFlowEvidenceNodeWasmV2.test.ts tests/textBlockFlowEvidenceV2.test.ts tests/textBlockPersistentFlowTreeV2.test.ts tests/textBlockSpatialIndexV2.test.ts tests/textBlockFlowRegionProviderV2.test.ts tests/textBlockSpatialWrappingLayoutV2.test.ts tests/textBlockAuthoredBoxGeometryV2.test.ts tests/textBlockInlineImageGeometry4bHardening.test.ts tests/textBlockV1LayoutCompatibility.test.ts
```

Final focused output: 10 test files passed and 119 tests passed.

```text
npm run type-check
git diff --check
npm run check
```

Final full `npm run check` output: 434 test files passed and 2,296 tests
passed, including type-check. The final staged diff check and worktree status
are also recorded in the Task 12 report.

## Intentionally Not Changed

No canonical schema, Editor, Backend, DOM/React/runtime state, persistence,
asset-byte loading, renderer binding, publication, production activation,
incremental edits, reuse, reconvergence, fixed-height policy, list decoration,
empty-block geometry, Columns/Table integration, or staged apply is changed.

## Next Checkpoint

Phase 5 remains separately authorized; this handoff does not authorize Phase 5 implementation or activation.
Phase 5 must separately decide and prove unified roots, text/image edits,
move/resize invalidation, reuse/reconvergence, cross-runtime producer
integration, performance, fixed-height policy, atomic Editor state, staged
apply, and publication/activation.
