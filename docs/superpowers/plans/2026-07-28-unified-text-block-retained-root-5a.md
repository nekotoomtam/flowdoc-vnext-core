# Unified TextBlock Retained Root 5A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Core-only Phase 5A unified TextBlock retained root that owns
one exact Phase 4B V2 dependency chain and one structured-clone-safe,
chunk-fingerprinted renderer scene without enabling incremental transitions,
Editor staged apply, publication, or production.

**Architecture:** Keep the accepted Phase 4B objects as immutable exact
process-local children. Refactor authored-box projection so the unified builder
computes spatial layout once, project one data-only scene from the accepted
authored geometry, and bind all child identities plus compositional
fingerprints into a shallow-frozen root wrapper registered in a private
`WeakMap`. Root inspection uses the private registration and fixed top-level
facts; it never recursively traverses, re-hashes, or deep-freezes the child
graphs.

**Tech Stack:** TypeScript 6 ESM, Vitest 4, Zod-independent strict data-envelope
validation, existing fixed-point layout units, existing canonical JSON and
compact SHA-256 fingerprint helpers.

## Global Constraints

- Work only in `flowdoc-vnext-core`.
- Preserve every accepted and blocked Phase 4B V1/V2 public result exactly.
- Keep `inputAuthority: "core-synthetic-qa-only"`.
- Keep `stagedEditorApply: false`, `mayPublishLayout: false`, and
  `productionBinding: false` on every accepted Phase 5A result.
- Text-only and image-aware inputs use one unified V2 root path.
- Support only the existing `inline-flow` image mode.
- Do not add incremental edits, root transitions, Worker sessions, Editor or
  Backend binding, fixed-height behavior, publication, or production.
- Root construction is all-or-blocked and returns no partial child, root, or
  scene.
- Root fingerprinting is compositional over child fingerprints and fixed
  capability facts; it must not canonicalize the complete root object.
- A structured clone of the scene is renderer data only and cannot become Core
  authority.
- Follow `AGENTS.md`, `docs/CROSS_REPO_OPERATING_MAP.md`, and
  `docs/superpowers/specs/2026-07-28-unified-incremental-live-draft-product-readiness-design.md`.
- Human-facing Markdown is verified by spec/self-review, not by automated
  tests that grep exact headings or prose. Automated scope guards exercise
  public exports, runtime results, capability flags, and blocked behavior.

---

## Target File Structure

### New production files

- `src/layout/textBlockUnifiedLayoutSceneContractV1.ts` — public data-only
  scene, chunk, work, issue, result, and inspection contracts.
- `src/layout/textBlockUnifiedLayoutSceneV1.ts` — strict scene projection,
  chunk/compositional fingerprints, payload byte facts, and process-local
  inspection.
- `src/layout/textBlockUnifiedLayoutRootContractV1.ts` — public unified-root,
  provider descriptor, dependency, work, issue, result, and inspection
  contracts.
- `src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV1.ts` — private
  exact-child/root binding registry.
- `src/layout/textBlockUnifiedLayoutRootV1.ts` — strict complete-root builder
  and bounded root inspector.

### New tests and helpers

- `tests/helpers/textBlockUnifiedLayoutRootV1.ts` — accepted complete-root
  fixtures built from the existing Phase 4B inline-image helpers.
- `tests/textBlockUnifiedLayoutSceneV1.test.ts` — scene projection,
  structured-clone, fingerprint, and blocked-boundary tests.
- `tests/textBlockUnifiedLayoutRootV1.test.ts` — unified dependency graph,
  complete construction, parity, and capability tests.
- `tests/textBlockUnifiedLayoutRootAdversarialV1.test.ts` — exact authority,
  clone/mutation/proxy/accessor, mixed-root, and no-partial-output tests.
- `tests/textBlockUnifiedLayoutRootScaleV1.test.ts` — root wrapper, scene work,
  payload bytes, and deterministic scale evidence.
- `tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts` — public-export and runtime
  scope/capability guard test.

### Modified production and documentation files

- `src/layout/textBlockAuthoredBoxGeometryV2.ts` — extract one internal
  projection seam from an exact precomputed spatial layout.
- `src/index.ts` — export only reviewed Phase 5A public contracts/functions.
- `docs/LIVE_DRAFT_MR1_UNIFIED_TEXT_BLOCK_ROOT_5A.md` — Phase 5A handoff.
- `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md` — append the accepted 5A
  checkpoint.
- `docs/PHASE_LEDGER.md` — record Phase 5A status/evidence and next gate.

---

### Task 1: Precomputed Spatial-Layout Authored-Box Seam

**Files:**

- Modify: `src/layout/textBlockAuthoredBoxGeometryV2.ts`
- Modify: `tests/textBlockAuthoredBoxGeometryV2.test.ts`

**Interfaces:**

- Consumes: exact `VNextTextBlockInitialFlowV1`,
  `VNextTextBlockFlowEvidenceV2`, `VNextTextBlockPersistentFlowTreeV2`,
  `VNextTextBlockSpatialIndexV2`, and accepted
  `VNextTextBlockSpatialWrappingLayoutResultV2`.
- Produces the internal-only function:

```ts
export function projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2(
  input: {
    initialFlow: VNextTextBlockInitialFlowV1
    evidence: VNextTextBlockFlowEvidenceV2
    persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
    spatialIndex: VNextTextBlockSpatialIndexV2
    spatialLayout: Extract<
      VNextTextBlockSpatialWrappingLayoutResultV2,
      { status: "accepted" }
    >
    bindProductionLayout?: boolean
  },
): VNextTextBlockAuthoredBoxGeometryResultV2
```

- The function is exported from its source module for internal Core use but is
  not exported from `src/index.ts`.
- The existing `layoutVNextTextBlockAuthoredBoxGeometryV2(...)` signature and
  all public outcomes remain unchanged.

- [ ] **Step 1: Write a failing exact-precomputed-layout test**

Add a test that creates one accepted inline-image spatial fixture, computes
`spatialLayout` once, calls the new internal seam, and compares its complete
accepted result with the existing public function:

```ts
const spatialLayout = layoutVNextTextBlockSpatialWrappingV2({
  initialFlow: fixture.initialFlow,
  evidence: fixture.evidence,
  persistentFlowTree: fixture.tree,
  spatialIndex: fixture.spatialIndex,
  startYLayoutUnit: 0,
})
if (spatialLayout.status !== "accepted") throw new Error("spatial layout blocked")

const projected =
  projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2({
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
    persistentFlowTree: fixture.tree,
    spatialIndex: fixture.spatialIndex,
    spatialLayout,
  })
const legacyEntry = layoutVNextTextBlockAuthoredBoxGeometryV2({
  initialFlow: fixture.initialFlow,
  evidence: fixture.evidence,
  persistentFlowTree: fixture.tree,
  spatialIndex: fixture.spatialIndex,
})
expect(projected).toEqual(legacyEntry)
```

- Before the equality assertion, add independently stated behavior assertions
  for the accepted source/version, exact child fingerprints, outer-height
  equation, projected image coordinates, and all three false capability flags.
  The equality assertion is a delegation regression; it is not the sole
  correctness oracle.

- [ ] **Step 2: Run the focused test and verify the missing export failure**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/textBlockAuthoredBoxGeometryV2.test.ts
```

Expected: FAIL because
`projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2` does not
exist.

- [ ] **Step 3: Extract the minimal internal projection seam**

Move the work after accepted spatial-layout validation in
`layoutVNextTextBlockAuthoredBoxGeometryV2(...)` into the new function. The
internal function must:

- reject non-exact, blocked, cloned, foreign, or re-fingerprinted spatial
  layouts;
- confirm the exact Initial Flow/evidence/tree/index tuple;
- confirm all retained child fingerprints;
- reuse the existing authored-box conversion, projection, auto-height,
  canonical fingerprint, deep-freeze, and registration behavior; and
- return the existing blocked result shape without partial geometry.

Change the public function to compute spatial layout once and delegate to the
new function. Do not change its input parser or issue ordering.

- [ ] **Step 4: Add mismatch and production rejection tests**

Cover:

```ts
expect(projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2({
  ...exactTuple,
  spatialLayout: foreignSpatialLayout,
})).toMatchObject({
  status: "blocked",
  geometry: null,
  lines: null,
  fingerprint: null,
})

expect(projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2({
  ...exactTuple,
  spatialLayout,
  bindProductionLayout: true,
})).toMatchObject({
  status: "blocked",
  issues: [{ code: "production-binding-forbidden" }],
})
```

- [ ] **Step 5: Run authored-box and spatial-layout regression tests**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/textBlockAuthoredBoxGeometryV2.test.ts tests/textBlockSpatialWrappingLayoutV2.test.ts
```

Expected: PASS with every existing Phase 4B result unchanged.

- [ ] **Step 6: Commit**

```powershell
git add src/layout/textBlockAuthoredBoxGeometryV2.ts tests/textBlockAuthoredBoxGeometryV2.test.ts
git commit -m "refactor(layout): project authored box from exact spatial layout"
```

---

### Task 2: Structured-Clone-Safe Chunked Scene

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutSceneContractV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutSceneV1.ts`
- Create: `tests/textBlockUnifiedLayoutSceneV1.test.ts`

**Interfaces:**

```ts
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_SOURCE =
  "vnext-text-block-unified-layout-scene-v1" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_VERSION = 1 as const

export interface VNextTextBlockUnifiedLayoutSceneChunkV1 {
  chunkIndex: number
  lineIndex: number
  line: VNextTextBlockAuthoredBoxLineV2
  fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutSceneWorkV1 {
  visitedLineCount: number
  visitedFragmentCount: number
  emittedChunkCount: number
  estimatedPayloadByteCount: number
  completeSceneProjectionCount: 1
}

export interface VNextTextBlockUnifiedLayoutSceneV1 {
  source: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_VERSION
  documentId: string
  sectionId: string
  textBlockId: string
  instanceRevision: number
  layoutId: string
  authoredBoxGeometryFingerprint: string
  chunks: readonly VNextTextBlockUnifiedLayoutSceneChunkV1[]
  chunkFingerprintChain: readonly string[]
  summary: {
    lineCount: number
    textFragmentCount: number
    inlineImageFragmentCount: number
    outerHeightLayoutUnit: number
  }
  work: VNextTextBlockUnifiedLayoutSceneWorkV1
  contracts: {
    rendererConsumptionOnly: true
    rendererMayMeasureText: false
    rendererMayRelayout: false
    structuredCloneSafe: true
    incrementalDeliveryClaim: false
    stagedEditorApply: false
    mayPublishLayout: false
    productionBinding: false
  }
  mayPublishLayout: false
  productionBinding: false
  fingerprint: string
}

export type VNextTextBlockUnifiedLayoutSceneResultV1 =
  | {
      status: "accepted"
      scene: VNextTextBlockUnifiedLayoutSceneV1
      issues: []
    }
  | {
      status: "blocked"
      scene: null
      issues: readonly VNextTextBlockUnifiedLayoutSceneIssueV1[]
    }

export function projectVNextTextBlockUnifiedLayoutSceneV1(input: {
  authoredBoxGeometry: Extract<
    VNextTextBlockAuthoredBoxGeometryResultV2,
    { status: "accepted" }
  >
  bindProductionLayout?: boolean
}): VNextTextBlockUnifiedLayoutSceneResultV1

export function inspectVNextTextBlockUnifiedLayoutSceneV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutSceneInspectionV1
```

- [ ] **Step 1: Write failing scene contract/projection tests**

Test one mixed text/image authored geometry and assert:

```ts
expect(result.scene).toMatchObject({
  source: "vnext-text-block-unified-layout-scene-v1",
  contractVersion: 1,
  chunks: geometry.lines.map((line, chunkIndex) => ({
    chunkIndex,
    lineIndex: line.index,
    line,
  })),
  summary: geometry.summary,
  contracts: {
    structuredCloneSafe: true,
    incrementalDeliveryClaim: false,
    stagedEditorApply: false,
    mayPublishLayout: false,
    productionBinding: false,
  },
})
expect(structuredClone(result.scene)).toEqual(result.scene)
```

Also assert `visitedLineCount`, `visitedFragmentCount`, `emittedChunkCount`, and
positive `estimatedPayloadByteCount`.

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSceneV1.test.ts
```

Expected: FAIL because the scene modules do not exist.

- [ ] **Step 3: Implement the minimal strict scene projector**

Implementation requirements:

- accept an exact registered authored-box V2 result only;
- block `bindProductionLayout: true`, present `undefined`, extra fields,
  accessors, symbols, class instances, and throwing proxies;
- create one shallow scene chunk per authored-box line;
- compute each chunk fingerprint from `chunkIndex`, `lineIndex`, and the
  existing line fingerprint rather than canonicalizing the entire line;
- compute `chunkFingerprintChain[index]` compositionally from the previous
  chain value and current chunk fingerprint;
- compute the scene fingerprint from identity fields, authored geometry
  fingerprint, final chunk chain, summary, work counts, and contracts;
- calculate `estimatedPayloadByteCount` as UTF-8 bytes of the data-only scene
  facts excluding the final fingerprint and the byte-count field itself, so
  the estimate has no self-referential fixed point;
- deeply freeze newly allocated scene wrappers/arrays while reusing already
  frozen authored line objects;
- register the exact scene in a private `WeakMap`; and
- inspect through the registry without accepting a structured clone as Core
  authority.

- [ ] **Step 4: Add fingerprint and blocked-boundary tests**

Cover text-only, image-only, mixed, two-line hard-break, clone, changed chunk
order, re-fingerprinted clone, production flag, accessor envelope, and
structured-clone data safety:

```ts
const clone = structuredClone(scene)
expect(clone).toEqual(scene)
expect(inspectVNextTextBlockUnifiedLayoutSceneV1(clone)).toMatchObject({
  status: "invalid",
  code: "unregistered-unified-layout-scene",
})
```

- [ ] **Step 5: Run scene and authored-box tests**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutSceneV1.test.ts tests/textBlockAuthoredBoxGeometryV2.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/layout/textBlockUnifiedLayoutSceneContractV1.ts src/layout/textBlockUnifiedLayoutSceneV1.ts tests/textBlockUnifiedLayoutSceneV1.test.ts
git commit -m "feat(layout): add unified renderer scene contract"
```

---

### Task 3: Unified Root Contract And Exact Authority Registry

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutRootContractV1.ts`
- Create: `src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV1.ts`
- Create: `tests/textBlockUnifiedLayoutRootV1.test.ts`

**Interfaces:**

```ts
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_SOURCE =
  "vnext-text-block-unified-layout-root-v1" as const
export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_VERSION = 1 as const

export interface VNextTextBlockUnifiedFlowRegionProviderAuthorityV1 {
  source: "vnext-text-block-flow-region-v2"
  contractVersion: 2
  spatialIndexFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockUnifiedLayoutRootWorkV1 {
  topLevelDependencyCount: 8
  completeChildGraphTraversalCount: 0
  completeChildRehashCount: 0
  rootWrapperAllocationCount: 1
}

export interface VNextTextBlockUnifiedLayoutRootV1 {
  source: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_VERSION
  inputAuthority: "core-synthetic-qa-only"
  documentId: string
  sectionId: string
  textBlockId: string
  instanceRevision: number
  layoutId: string
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  spatialIndex: VNextTextBlockSpatialIndexV2
  flowRegionProviderAuthority:
    VNextTextBlockUnifiedFlowRegionProviderAuthorityV1
  spatialLayout: Extract<
    VNextTextBlockSpatialWrappingLayoutResultV2,
    { status: "accepted" }
  >
  authoredBoxGeometry: Extract<
    VNextTextBlockAuthoredBoxGeometryResultV2,
    { status: "accepted" }
  >
  scene: VNextTextBlockUnifiedLayoutSceneV1
  dependencyFingerprints: {
    initialFlow: string
    evidence: string
    persistentFlowTree: string
    spatialIndex: string
    flowRegionProviderAuthority: string
    spatialLayout: string
    authoredBoxGeometry: string
    scene: string
  }
  work: VNextTextBlockUnifiedLayoutRootWorkV1
  contracts: {
    unifiedTextBlockAuthority: true
    textAndInlineImageV2: true
    processLocalImmutableRoot: true
    compositionalRootFingerprint: true
    incrementalTransitionClaim: false
    stagedEditorApply: false
    mayPublishLayout: false
    productionBinding: false
  }
  mayPublishLayout: false
  productionBinding: false
  fingerprint: string
}
```

The public result and inspection unions must use explicit issue codes:

```ts
export type VNextTextBlockUnifiedLayoutRootIssueCodeV1 =
  | "invalid-input"
  | "input-authority-mismatch"
  | "production-binding-forbidden"
  | "initial-flow-provenance-mismatch"
  | "flow-evidence-provenance-mismatch"
  | "persistent-flow-tree-blocked"
  | "spatial-index-blocked"
  | "spatial-layout-blocked"
  | "authored-box-geometry-blocked"
  | "unified-layout-scene-blocked"
  | "unified-layout-dependency-mismatch"
  | "unsafe-layout-arithmetic"

export type VNextTextBlockUnifiedLayoutRootResultV1 =
  | { status: "accepted"; root: VNextTextBlockUnifiedLayoutRootV1; issues: [] }
  | {
      status: "blocked"
      root: null
      scene: null
      issues: readonly VNextTextBlockUnifiedLayoutRootIssueV1[]
    }
```

Private authority functions:

```ts
export function registerVNextTextBlockUnifiedLayoutRootInternalV1(input: {
  root: VNextTextBlockUnifiedLayoutRootV1
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  spatialIndex: VNextTextBlockSpatialIndexV2
  spatialLayout: Extract<
    VNextTextBlockSpatialWrappingLayoutResultV2,
    { status: "accepted" }
  >
  authoredBoxGeometry: Extract<
    VNextTextBlockAuthoredBoxGeometryResultV2,
    { status: "accepted" }
  >
  scene: VNextTextBlockUnifiedLayoutSceneV1
  canonicalRootFacts: string
}): void

export function inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1(
  root: unknown,
): VNextTextBlockUnifiedLayoutRootInspectionV1
```

- [ ] **Step 1: Write failing contract and exact-binding tests**

Create a test-only frozen candidate root from accepted Phase 4B fixtures and
assert that an unregistered candidate, structured clone, and object with one
foreign child are rejected by the private binding inspector.

- [ ] **Step 2: Run the focused test and verify missing modules**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV1.test.ts
```

Expected: FAIL because the root contract/authority modules do not exist.

- [ ] **Step 3: Implement contract constants/types and private registry**

The private `WeakMap` binding stores exact child references, stored root
fingerprint, and canonical root facts. Inspection must:

- require the exact registered root;
- require `Object.isFrozen` on root-owned wrappers, arrays, work, contracts, and
  dependency fingerprints;
- compare direct child references with the registered binding;
- compare top-level child fingerprint strings with the registered values;
- canonicalize only root-owned scalar/compositional facts;
- never call a recursive child inspector;
- return the fixed work facts unchanged; and
- reject a clone, changed wrapper, or foreign child without reading accessors.

- [ ] **Step 4: Add compile-time contract assertions**

Assert the closed flags and fixed work facts:

```ts
expect(root.work).toEqual({
  topLevelDependencyCount: 8,
  completeChildGraphTraversalCount: 0,
  completeChildRehashCount: 0,
  rootWrapperAllocationCount: 1,
})
expect(root.contracts).toMatchObject({
  incrementalTransitionClaim: false,
  stagedEditorApply: false,
  mayPublishLayout: false,
  productionBinding: false,
})
```

- [ ] **Step 5: Run the focused contract test**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV1.test.ts
```

Expected: PASS for contract/registry tests; complete builder tests remain to be
added in Task 4.

- [ ] **Step 6: Commit**

```powershell
git add src/layout/textBlockUnifiedLayoutRootContractV1.ts src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV1.ts tests/textBlockUnifiedLayoutRootV1.test.ts
git commit -m "feat(layout): define unified TextBlock root authority"
```

---

### Task 4: All-Or-Blocked Complete Unified Root Builder

**Files:**

- Create: `src/layout/textBlockUnifiedLayoutRootV1.ts`
- Create: `tests/helpers/textBlockUnifiedLayoutRootV1.ts`
- Modify: `tests/textBlockUnifiedLayoutRootV1.test.ts`

**Interfaces:**

```ts
export interface VNextTextBlockUnifiedLayoutRootBuildInputV1 {
  inputAuthority: "core-synthetic-qa-only"
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  spatialEntries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
  bindProductionLayout?: boolean
}

export function createVNextTextBlockUnifiedLayoutRootV1(
  input: VNextTextBlockUnifiedLayoutRootBuildInputV1,
): VNextTextBlockUnifiedLayoutRootResultV1
export function createVNextTextBlockUnifiedLayoutRootV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutRootResultV1

export function inspectVNextTextBlockUnifiedLayoutRootV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutRootInspectionV1
```

- [ ] **Step 1: Write a failing complete mixed-root test**

Use `acceptedInlineImageEvidenceFixture(...)` rather than prebuilding the child
chain, then assert one call returns every exact dependency:

```ts
const result = createVNextTextBlockUnifiedLayoutRootV1({
  inputAuthority: "core-synthetic-qa-only",
  initialFlow: fixture.initialFlow,
  evidence: fixture.evidence,
  spatialEntries: [],
})
if (result.status !== "accepted") throw new Error("unified root blocked")

expect(result.root.persistentFlowTree.flowEvidenceFingerprint)
  .toBe(result.root.evidence.fingerprint)
expect(result.root.spatialIndex.persistentFlowTreeFingerprint)
  .toBe(result.root.persistentFlowTree.fingerprint)
expect(result.root.spatialLayout.spatialIndexFingerprint)
  .toBe(result.root.spatialIndex.fingerprint)
expect(result.root.authoredBoxGeometry.contentSpatialLayoutFingerprint)
  .toBe(result.root.spatialLayout.fingerprint)
expect(result.root.scene.authoredBoxGeometryFingerprint)
  .toBe(result.root.authoredBoxGeometry.fingerprint)
expect(inspectVNextTextBlockUnifiedLayoutRootV1(result.root)).toEqual({
  status: "valid",
  fingerprint: result.root.fingerprint,
  sceneFingerprint: result.root.scene.fingerprint,
  work: result.root.work,
})
```

- [ ] **Step 2: Run the test and verify the missing builder failure**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV1.test.ts
```

Expected: FAIL because the builder does not exist.

- [ ] **Step 3: Implement strict input parsing and ordered construction**

The builder executes exactly:

```text
inspect exact Initial Flow/evidence binding
  -> createVNextTextBlockPersistentFlowTreeV2
  -> createVNextTextBlockSpatialIndexV2
  -> layoutVNextTextBlockSpatialWrappingV2 once
  -> projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2
  -> projectVNextTextBlockUnifiedLayoutSceneV1
  -> create flow-region provider authority descriptor
  -> shallow-freeze root-owned wrappers
  -> register exact root
```

The strict envelope permits exactly `inputAuthority`, `initialFlow`, `evidence`,
`spatialEntries`, and optional `bindProductionLayout`. It snapshots
`spatialEntries` with the existing V2 spatial-index builder; it does not read
accessors or accept symbols/custom prototypes.

Fingerprint only:

- root identity fields;
- the eight dependency fingerprints;
- root work facts;
- closed contracts; and
- universal false flags.

Do not canonicalize the direct child objects.

- [ ] **Step 4: Add blocked-stage and no-partial-output tests**

Test wrong authority, production binding, unresolved image evidence, invalid
spatial entry, oversized image, and fixed-height-shaped extra input. Every
blocked result must match:

```ts
{
  status: "blocked",
  root: null,
  scene: null,
  issues: expect.any(Array),
}
```

Assert only the first failing stage's ordered issue is reported.

- [ ] **Step 5: Add reusable accepted fixture helper**

Implement:

```ts
export function acceptedUnifiedLayoutRootFixtureV1(
  options: InlineImageFlowFixtureOptions = {},
): Extract<VNextTextBlockUnifiedLayoutRootResultV1, { status: "accepted" }> {
  const source = acceptedInlineImageEvidenceFixture(options)
  const result = createVNextTextBlockUnifiedLayoutRootV1({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: options.entries ?? [],
  })
  if (result.status !== "accepted") throw new Error("unified root fixture blocked")
  return result
}
```

- [ ] **Step 6: Run builder, scene, and Phase 4B focused tests**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV1.test.ts tests/textBlockUnifiedLayoutSceneV1.test.ts tests/textBlockAuthoredBoxGeometryV2.test.ts tests/textBlockSpatialWrappingLayoutV2.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add src/layout/textBlockUnifiedLayoutRootV1.ts tests/helpers/textBlockUnifiedLayoutRootV1.ts tests/textBlockUnifiedLayoutRootV1.test.ts
git commit -m "feat(layout): build complete unified TextBlock roots"
```

---

### Task 5: Geometry Matrix, Fast Path, And Adversarial Gates

**Files:**

- Create: `tests/textBlockUnifiedLayoutRootAdversarialV1.test.ts`
- Modify: `tests/textBlockUnifiedLayoutRootV1.test.ts`

**Interfaces:**

- Consumes:
  `createVNextTextBlockUnifiedLayoutRootV1(...)`,
  `inspectVNextTextBlockUnifiedLayoutRootV1(...)`, and existing Phase 4B
  fixtures.
- Produces no new public production API.

- [ ] **Step 1: Write the geometry matrix before changing implementation**

Add `it.each(...)` rows for:

- `text-only`;
- `image-only`;
- `text-image-text`;
- `adjacent-images`;
- `text-image-text-break`;
- `thai-image-latin`;
- `field-image-page-break`;
- all three vertical alignments;
- mixed text sizes;
- no exclusions;
- left, right, central, and multiple rectangular exclusions;
- top/bottom barriers;
- overlay-only;
- full-width zero-space advancement; and
- image-expanded-band requery.

For every accepted row assert exact root/scene identity binding and all closed
flags.

- [ ] **Step 2: Add text-only normalized parity and no-exclusion fast-path tests**

Compare the unified root's retained spatial/authored geometry with the direct
Phase 4B V2 calls. For no exclusions assert:

```ts
expect(root.spatialLayout.work.spatialIndexQueryCount).toBe(0)
expect(root.spatialIndex.summary.flowAffectingEntryCount).toBe(0)
expect(root.scene.summary.inlineImageFragmentCount).toBe(0)
```

Also reuse the existing V1/V2 normalized text-only helper or reproduce its
normalization locally and require exact geometry equality.

- [ ] **Step 3: Run the matrix and confirm implementation gaps**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV1.test.ts
```

Expected: either PASS without implementation change or FAIL on a specific
binding/work fact that must be fixed without weakening a Phase 4B child gate.

- [ ] **Step 4: Add adversarial exact-authority tests**

Cover:

- cloned root;
- structurally equal root replacement;
- cloned scene;
- changed scene chunk order;
- mutable wrapper;
- re-fingerprinted clone;
- foreign Initial Flow/evidence pair;
- accessor input;
- class input;
- symbol field;
- throwing proxy;
- present `undefined` production flag;
- unsafe numeric spatial entry;
- root with one foreign tree/index/layout/geometry/scene child; and
- attempted direct mutation after registration.

Use descriptor/proxy counters to prove zero accessor reads where expected.

- [ ] **Step 5: Fix only root-boundary defects and rerun**

Do not modify Phase 4B public child contracts unless a test proves an existing
regression. Root fixes must remain in the new root/scene modules or the
Task 1 internal seam.

Run:

```powershell
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutRootV1.test.ts tests/textBlockUnifiedLayoutRootAdversarialV1.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run the complete Phase 4B focused gate**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/liveDraftMr1InlineImageGeometry4b.test.ts tests/textEngineFlowEvidenceNodeWasmV2.test.ts tests/textBlockFlowEvidenceV2.test.ts tests/textBlockPersistentFlowTreeV2.test.ts tests/textBlockSpatialIndexV2.test.ts tests/textBlockFlowRegionProviderV2.test.ts tests/textBlockSpatialWrappingLayoutV2.test.ts tests/textBlockAuthoredBoxGeometryV2.test.ts tests/textBlockInlineImageGeometry4bHardening.test.ts tests/textBlockV1LayoutCompatibility.test.ts
```

Expected: PASS with the accepted Phase 4B gate count unchanged except for tests
explicitly added to existing files.

- [ ] **Step 7: Commit**

```powershell
git add tests/textBlockUnifiedLayoutRootV1.test.ts tests/textBlockUnifiedLayoutRootAdversarialV1.test.ts src/layout/textBlockUnifiedLayoutRootV1.ts src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV1.ts src/layout/textBlockUnifiedLayoutSceneV1.ts
git commit -m "test(layout): harden unified TextBlock root boundaries"
```

---

### Task 6: Producer Parity, Scale, And Compositional Work Evidence

**Files:**

- Create: `tests/textBlockUnifiedLayoutRootScaleV1.test.ts`
- Modify: `tests/textEngineFlowEvidenceNodeWasmV2.test.ts`
- Modify: `tests/helpers/textBlockUnifiedLayoutRootV1.ts`

**Interfaces:**

- Reuses the existing real Node-native and actual Worker-WASM V2 evidence
  producers.
- Adds test-only fixture helpers for a long repeated text/image flow; no new
  product API.

- [ ] **Step 1: Write a failing Node/WASM root parity row**

Extend the accepted U+FFFC/hard-break parity test so each producer's accepted
evidence enters `createVNextTextBlockUnifiedLayoutRootV1(...)`. Normalize only
runtime/source labels already normalized by the existing test. Require exact:

```ts
expect(normalizeRoot(nodeRoot)).toEqual(normalizeRoot(wasmRoot))
expect(nodeRoot.scene.fingerprint).toBe(wasmRoot.scene.fingerprint)
expect(nodeRoot.fingerprint).toBe(wasmRoot.fingerprint)
```

The test must keep U+FFFC and hard breaks outside shaping.

- [ ] **Step 2: Run the parity test and verify it fails before public export**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/textEngineFlowEvidenceNodeWasmV2.test.ts
```

Expected: FAIL until the test can import the new root builder through the
reviewed module path or `src/index.ts` in Task 7. During Task 6, import directly
from the new source module; public export remains Task 7.

- [ ] **Step 3: Add deterministic small/long scale fixtures**

Build at least:

- one short text-only root;
- one short mixed image root;
- one long multi-line text-only root;
- one long mixed text/image root; and
- one spatial root with enough entries to exercise treap pruning.

Build each root twice from independently accepted source objects and require
equal deterministic semantic/scene/root fingerprints.

- [ ] **Step 4: Assert compositional root work and factual scene work**

For every fixture:

```ts
expect(root.work).toEqual({
  topLevelDependencyCount: 8,
  completeChildGraphTraversalCount: 0,
  completeChildRehashCount: 0,
  rootWrapperAllocationCount: 1,
})
expect(root.scene.work).toEqual({
  visitedLineCount: root.scene.summary.lineCount,
  visitedFragmentCount:
    root.scene.summary.textFragmentCount
    + root.scene.summary.inlineImageFragmentCount,
  emittedChunkCount: root.scene.summary.lineCount,
  estimatedPayloadByteCount: expect.any(Number),
  completeSceneProjectionCount: 1,
})
expect(root.scene.work.estimatedPayloadByteCount).toBeGreaterThan(0)
```

Assert root-wrapper work remains constant while scene projection work grows
factually with the complete scene.

- [ ] **Step 5: Add an external timing observation without fingerprint impact**

Measure root creation with `performance.now()` only in the test. Build the same
root again and assert timing values are absent from root, scene, and
fingerprints:

```ts
expect("durationMs" in root.work).toBe(false)
expect("durationMs" in root.scene.work).toBe(false)
```

Record observations only in the eventual handoff; do not set a universal
budget in 5A.

- [ ] **Step 6: Run parity and scale tests**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/textEngineFlowEvidenceNodeWasmV2.test.ts tests/textBlockUnifiedLayoutRootScaleV1.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add tests/textEngineFlowEvidenceNodeWasmV2.test.ts tests/textBlockUnifiedLayoutRootScaleV1.test.ts tests/helpers/textBlockUnifiedLayoutRootV1.ts
git commit -m "test(layout): prove unified root parity and bounded wrapper work"
```

---

### Task 7: Public Boundary, Handoff, And Full Gate

**Files:**

- Modify: `src/index.ts`
- Create: `docs/LIVE_DRAFT_MR1_UNIFIED_TEXT_BLOCK_ROOT_5A.md`
- Modify: `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`
- Modify: `docs/PHASE_LEDGER.md`
- Create: `tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts`

**Interfaces:**

Export from `src/index.ts`:

```ts
export * from "./layout/textBlockUnifiedLayoutSceneContractV1.js"
export {
  projectVNextTextBlockUnifiedLayoutSceneV1,
  inspectVNextTextBlockUnifiedLayoutSceneV1,
} from "./layout/textBlockUnifiedLayoutSceneV1.js"
export * from "./layout/textBlockUnifiedLayoutRootContractV1.js"
export {
  createVNextTextBlockUnifiedLayoutRootV1,
  inspectVNextTextBlockUnifiedLayoutRootV1,
} from "./layout/textBlockUnifiedLayoutRootV1.js"
```

Do not export:

- `textBlockUnifiedLayoutRootAuthorityInternalsV1.ts`;
- `projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2`;
- private WeakMaps or authority bindings;
- root assembly helpers;
- canonical-root-fact helpers; or
- any function that grants staged apply/publication/production.

- [ ] **Step 1: Write a failing public-boundary and runtime scope guard**

The test must:

- resolve the transitive `src/index.ts` exports;
- require only the reviewed scene/root contracts and four public functions;
- reject internal authority/projection exports;
- build one real accepted root through the public entrypoint and assert
  `stagedEditorApply: false`, `mayPublishLayout: false`, and
  `productionBinding: false` on the root, scene, and retained child contracts;
- submit production-bound and unsupported fixed-height-shaped input through
  the public entrypoint and assert all-or-blocked output with no root/scene;
  and
- verify privileged authority/projection helpers remain unreachable through
  the public module boundary without asserting human-document prose.

- [ ] **Step 2: Run the guard and verify missing exports/docs**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts
```

Expected: FAIL because the reviewed public exports do not exist.

- [ ] **Step 3: Add the reviewed public exports**

Modify `src/index.ts` exactly as listed. Run `npm run type-check` immediately to
catch leaked internal types.

- [ ] **Step 4: Write the Phase 5A handoff and update ledgers**

The handoff must state:

- one complete unified root owns the exact V2 dependency graph;
- authored-box projection consumes one precomputed spatial layout;
- one structured-clone-safe complete scene is chunk-fingerprinted;
- scene chunking is a measured seam, not an incremental delivery claim;
- root wrapper work is compositional and constant over the fixed dependency
  set;
- Node/WASM root/scene parity;
- no Editor/Backend or Worker session;
- no incremental transition/reuse/reconvergence claim;
- no fixed-height or asset-lifecycle policy;
- all publication/production/staged-apply flags remain false;
- focused and full verification counts; and
- Phase 5B is the next separately authorized checkpoint.

Update the cross-runtime handoff and phase ledger with the same scope and
evidence without rewriting historical Phase 4B claims.

- [ ] **Step 5: Self-review human documentation**

Read the complete new handoff plus the changed cross-runtime handoff and phase
ledger. Check manually for:

- required handoff sections: `Status`, `Outcome`, `Architecture Evidence`,
  `Producer And Runtime Evidence`, `PASS`, `FAIL / BLOCKER`, `RISK`, `UNKNOWN`,
  `Verification`, `Intentionally Not Changed`, and `Next Checkpoint`;
- exact false capability facts;
- explicit Phase 5B separate authorization;
- retained NO-GO scope for list, empty-block, Editor/Backend, Columns/Table,
  Table auto-fit, fixed-height, publication, and production;
- no placeholders or contradictory status claims; and
- evidence paths and test counts matching the actual repository.

- [ ] **Step 6: Run public scope guard, type-check, and focused Phase 5A gate**

Run:

```powershell
npx vitest run --config vitest.config.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts tests/textBlockUnifiedLayoutSceneV1.test.ts tests/textBlockUnifiedLayoutRootV1.test.ts tests/textBlockUnifiedLayoutRootAdversarialV1.test.ts tests/textBlockUnifiedLayoutRootScaleV1.test.ts tests/textEngineFlowEvidenceNodeWasmV2.test.ts
npm run type-check
git diff --check
```

Expected: all PASS.

- [ ] **Step 7: Run the full Core gate**

Run:

```powershell
npm run check
```

Expected: type-check and all Vitest files PASS. Record exact file/test counts in
the 5A handoff after the successful run, then repeat the documentation
self-review after the count edit.

- [ ] **Step 8: Inspect staged scope**

Run:

```powershell
git status --short
git diff --stat
git diff --check
```

Expected: only Phase 5A production, tests, and documentation files are changed;
no Editor or Backend files and no unrelated user changes.

- [ ] **Step 9: Commit**

```powershell
git add src/index.ts src/layout/textBlockAuthoredBoxGeometryV2.ts src/layout/textBlockUnifiedLayoutSceneContractV1.ts src/layout/textBlockUnifiedLayoutSceneV1.ts src/layout/textBlockUnifiedLayoutRootContractV1.ts src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV1.ts src/layout/textBlockUnifiedLayoutRootV1.ts tests/helpers/textBlockUnifiedLayoutRootV1.ts tests/textBlockAuthoredBoxGeometryV2.test.ts tests/textBlockUnifiedLayoutSceneV1.test.ts tests/textBlockUnifiedLayoutRootV1.test.ts tests/textBlockUnifiedLayoutRootAdversarialV1.test.ts tests/textBlockUnifiedLayoutRootScaleV1.test.ts tests/textEngineFlowEvidenceNodeWasmV2.test.ts tests/liveDraftMr1UnifiedLayoutRoot5a.test.ts docs/LIVE_DRAFT_MR1_UNIFIED_TEXT_BLOCK_ROOT_5A.md docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md docs/PHASE_LEDGER.md
git commit -m "feat(layout): complete unified TextBlock root phase 5a"
```

If earlier task commits already contain the implementation files, this final
commit includes only the remaining export, guard, and documentation changes.

---

## Plan Self-Review Checklist

- Every Phase 5A architecture requirement maps to one task.
- No task implements Phase 5B transition behavior.
- Public and internal interfaces use consistent names across tasks.
- Spatial layout is computed once per unified complete build.
- Root fingerprinting never canonicalizes child object graphs.
- Scene projection is complete and chunked but claims no incremental delivery.
- Structured clone is data transport, never Core authority.
- Universal publication/production/staged-apply flags remain false.
- Focused and full verification occur before final handoff/commit.
