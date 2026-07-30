# Live Draft MR1 Unified TextBlock Retained Root (Phase 5A)

## Status

Status: implemented and accepted as the bounded Core-only Phase 5A checkpoint.
Implementation evidence is complete through accepted Task 6 head `995edd5`;
Task 7 adds the reviewed public boundary, handoff, and final gate.

This is a bounded Core-only, synthetic-QA-only checkpoint. Every accepted
Phase 5A root, scene, and retained child keeps `stagedEditorApply: false` where
that field exists, `mayPublishLayout: false`, and `productionBinding: false`.
Passing Phase 5A does not authorize Phase 5B.

## Outcome

Phase 5A adds one complete immutable
`VNextTextBlockUnifiedLayoutRootV1` that owns the exact accepted V2 dependency
chain for text clusters, hard breaks, and inline-flow images:

```text
Initial Flow
  -> V2 producer evidence
  -> V2 persistent flow tree
  -> V2 spatial index
  -> V2 Flow Region Provider authority descriptor
  -> V2 spatial wrapping layout
  -> V2 authored-box geometry
  -> unified renderer-consumption scene
  -> unified retained root
```

Root construction is all-or-blocked. A blocked stage returns `root: null` and
`scene: null`; no partial child chain becomes public output.

## Architecture Evidence

`src/layout/textBlockUnifiedLayoutRootV1.ts` validates the exact Initial
Flow/evidence authority, builds the persistent tree and spatial index, computes
one spatial wrapping layout, passes that exact precomputed layout into
`projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2(...)`,
projects one scene, and registers the complete root.

The public authored-box function keeps its Phase 4B behavior while
`src/layout/textBlockAuthoredBoxGeometryV2.ts` exposes the precomputed-layout
projection seam only to Core source modules. That seam is intentionally absent
from `src/index.ts`.

`src/layout/textBlockUnifiedLayoutSceneV1.ts` produces one complete,
structured-clone-safe, data-only renderer scene. One stable ordered chunk is
emitted per authored line; chunk fingerprints compose into an ordered chain
and then the scene fingerprint. Scene chunking is a measured complete-
projection seam. It is not incremental delivery.

The root stores eight dependency fingerprints and fingerprints only
root-owned scalar/compositional facts. Root build and inspection do not
canonicalize the complete retained child graph. The wrapper work facts stay
exactly:

```text
topLevelDependencyCount: 8
completeChildGraphTraversalCount: 0
completeChildRehashCount: 0
rootWrapperAllocationCount: 1
```

This `8 / 0 / 0 / 1` evidence is compositional and constant over the fixed
dependency set; it is not a universal end-to-end latency claim.

`src/index.ts` exports only the reviewed scene/root contracts and these four
public functions:

- `projectVNextTextBlockUnifiedLayoutSceneV1`;
- `inspectVNextTextBlockUnifiedLayoutSceneV1`;
- `createVNextTextBlockUnifiedLayoutRootV1`; and
- `inspectVNextTextBlockUnifiedLayoutRootV1`.

The private root authority registry, WeakMaps, authored-box internal
projection seam, root assembly/canonical-fact helpers, and any staged-apply,
publication, or production grant remain outside the package surface.

## Producer And Runtime Evidence

`tests/textEngineFlowEvidenceNodeWasmV2.test.ts` builds complete roots from the
real accepted `node-native-mr1` and `browser-worker-wasm-mr1` producer rows for
the same U+FFFC/hard-break source. The complete roots are equal; the test
normalization is an identity transform because runtime/source labels are not
retained in the Core root. Their exact scene and root fingerprints match. This
is Node/WASM root/scene parity at the Core boundary.

There is no retained browser Worker session in Phase 5A. No root is
structured-cloned across a runtime boundary; only the data-only scene is
structured-clone-safe, and a cloned scene does not acquire Core authority.
No Editor or Backend session or binding was added.

The named external `performance.now()` observation for the 32-hard-break-line,
128-spatial-entry pruning fixture was `3,723.1477 ms` for one root build in the
Task 6 local Node/Vitest runtime context. This is fixture/runtime context only:
it is not a universal product budget and is not a retained root, scene, work,
or fingerprint fact.

## PASS

- One public call builds the exact complete V2 dependency graph and bound
  renderer scene.
- Text-only, image-only, mixed, adjacent-image, hard-break, Thai/Latin,
  field/page-number, mixed-size, and all supported alignment rows pass.
- No-exclusion, left/right/central/multiple exclusions, barriers, overlays,
  full-width zero-space advancement, and image-expanded-band requery pass.
- The no-exclusion text-only path performs zero spatial-index queries and
  preserves direct Phase 4B plus normalized V1 geometry.
- Cloned, foreign, mutable, accessor-shaped, class-shaped, symbol-bearing,
  proxy-shaped, re-fingerprinted, unsafe, and production-bound authority fails
  closed.
- Node-native and Worker-WASM complete roots and scenes have exact parity.
- The public runtime guard builds and inspects a real accepted root through
  `src/index.ts` and proves privileged helpers remain unreachable.
- Root, scene, Initial Flow, evidence, tree, index, spatial layout, and
  authored geometry retain all applicable false capability facts.

## FAIL / BLOCKER

Malformed or unsupported root requests, wrong synthetic authority, production
binding, unresolved image evidence, invalid spatial input, oversized
unbreakable images, fixed-height-shaped input, and any invalid dependency stage
block all-or-nothing with no root or scene.

List decoration, empty-block geometry, Editor/Backend binding, Columns/Table
integration, Table auto-fit, fixed-height behavior, publication, production
activation, and Editor staged apply remain NO-GO.

## RISK

- Complete scene projection and later structured-clone transport may dominate
  incremental work for large TextBlocks. Phase 5A measures complete scene work
  and payload estimates but does not solve incremental delivery.
- Process-local WeakMap authority is valid only inside the Core process. It is
  neither persisted identity nor a cross-runtime root protocol.
- The Task 6 timing observation is local fixture evidence only; realistic
  product latency and memory budgets remain unproven.

## UNKNOWN

- No incremental transition, retained-child reuse, line/scene-chunk reuse, or
  reconvergence policy exists yet.
- No retained Worker session, revision protocol, cancellation, stale-result
  handling, or bounded root-lifetime proof exists yet.
- Fixed-height overflow/clipping and concrete image asset loading, unavailable,
  decode-error, placeholder, fit/crop paint, and lifecycle policy remain
  unspecified.
- No Editor atomic apply, Backend durable reconciliation, publication
  revalidation, production rollout, or product capability decision exists.

## Verification

Strict public-boundary RED before editing `src/index.ts`:

```text
npx vitest run --config vitest.config.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts
```

Result: expected FAIL, 1 file / 3 tests failed. The unified public runtime
surface was empty and
`createVNextTextBlockUnifiedLayoutRootV1` was not a public function.

Public-boundary GREEN after adding only the reviewed exports:

```text
npx vitest run --config vitest.config.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts
```

Result: PASS, 1 file / 3 tests. Immediate `npm run type-check` also passed.

Complete focused Phase 5A gate:

```text
npx vitest run --config vitest.config.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts tests/textBlockUnifiedLayoutSceneV1.test.ts tests/textBlockUnifiedLayoutRootV1.test.ts tests/textBlockUnifiedLayoutRootAdversarialV1.test.ts tests/textBlockUnifiedLayoutRootScaleV1.test.ts tests/textEngineFlowEvidenceNodeWasmV2.test.ts
```

Result: PASS, 6 test files / 50 tests.

The five historical Phase 3/4A/4B/MR1-Q guards were decoupled only from the
moving cross-runtime active pointer while retaining their phase evidence and
runtime/public-export assertions. Their focused regression plus the new
public guard passed 6 test files / 31 tests.

Final verification:

```text
npm run type-check
git diff --check
npm run check
```

Result: type-check and diff hygiene passed. The final unchanged
`npm run check` passed 439 test files / 2,359 tests including type-check.

## Intentionally Not Changed

No canonical schema, Editor, Backend, browser Worker session/protocol,
DOM/React/runtime state, persistence, asset-byte lifecycle, renderer
measurement/relayout, incremental transition, retained reuse, reconvergence,
fixed-height policy, list decoration, empty-block geometry, Columns/Table
integration, Table auto-fit, publication, production activation, or staged
Editor apply is changed.

Scene chunking remains complete projection only. It does not implement
incremental scene delivery or transfer a layout authority to a renderer.

## Next Checkpoint

Phase 5B: Unified Incremental Transition is the next possible checkpoint. It
must be separately designed, reviewed, and explicitly authorized. Phase 5A
does not authorize Phase 5B, a Worker session, Editor/Backend work,
fixed-height behavior, asset lifecycle policy, publication, or production.
