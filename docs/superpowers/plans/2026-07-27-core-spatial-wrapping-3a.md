# Core Spatial Wrapping 3A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 3 of the Persistent TextBlock Spatial Flow design: a Core-owned persistent y-interval index, a deterministic Flow Region Provider, and real multi-interval rectangular wrapping over the accepted MR1-Q persistent text subset using strict synthetic Core inputs.

**Architecture:** Bind a process-local immutable interval treap to the exact persistent flow tree and accepted MR1 request that produced it. Query intersecting y bands through subtree maximum-bottom summaries, subtract rectangular exclusion envelopes in a pure region provider, and place break-safe text groups across the resulting ordered x intervals without changing canonical document schema or trusting renderer geometry. Move and resize operations path-copy the interval treap and report the exact union of old/new affected y bands, while line reuse and spatial reconvergence remain Phase 5 work.

**Tech Stack:** TypeScript 6 ESM, Zod 4 strict runtime schemas, Vitest 4, existing fixed-point `LayoutUnitPolicyV1`, existing compact SHA-256/canonical JSON helpers, and the accepted MR1-Q persistent flow contracts.

## Verified Baseline

- Verified after `git fetch --prune origin` on 2026-07-27.
- Core: local `main` at `2f7e1454068e263ed2b0e4858bdb3d03dce20c7f`, ahead of `origin/main` by 43 commits; Phase 2 implementation baseline `991a3bb`.
- Editor: local `main` at `43dcebb22735d7330fda0d57d4e7ce9a726e2454`, equal to `origin/main`.
- Backend: local `main` at `280c4ffbe075cd5391cce5219e8f9c40fed16527`, equal to `origin/main`.
- All three worktrees were clean before this plan file was added.
- Core `npm run check` passed on `2f7e145`: 412 test files / 2,047 tests, including TypeScript type-check.

## Global Constraints

- Keep the canonical Document v4 schema unchanged; Phase 3 adds no authored positioned/floating-object node.
- Accept positioned objects only through a strict `inputAuthority: "core-synthetic-qa-only"` Core contract.
- Keep `VNEXT_LAYOUT_UNITS_PER_POINT` exactly `1_000_000`; all coordinates, sizes, clearances, bands, intervals, advances, and sums are safe integers.
- Bind every accepted spatial index, update, query, region result, and wrapped layout to the exact process-local persistent flow tree and the exact unchanged MR1 request registered by Core.
- Preserve MR1-Q tree/proof identity and provenance behavior: cloned, transferred, mutated, stale-revision, or context-drifted inputs fail closed.
- Support only the MR1-Q flow subset: text, mixed Text Runs, resolved fields, generated page numbers, and hard breaks.
- Keep inline-image geometry, list decoration, empty/effectively-empty block geometry, Columns/Table integration, Table auto-fit, Editor binding, Backend binding, publication, production activation, and Editor staged apply/state out of scope.
- Keep `stagedCoverageCompatible: true` as ordered-identity/resumable-reference evidence only and keep `stagedEditorApply: false`.
- Use half-open geometry throughout: y bands are `[top, bottom)` and x intervals are `[start, end)`.
- Rectangular exclusions subtract their clearance envelopes; top/bottom barriers remove all flow intervals for intersecting bands; overlays remove no flow space.
- Reject a positioned object when its clearance envelope crosses horizontal TextBlock bounds, has a negative local top, has unsafe arithmetic, or has zero/non-positive dimensions.
- Preserve a dedicated no-flow-affecting single-interval fast path with zero spatial-index query calls.
- A cluster and an unbreakable break group never split internally. A hard break terminates the current line.
- Vertical advancement is monotonic and may jump only to a proved intersecting exclusion bottom. Unsafe arithmetic, a missing next event, or no progress blocks instead of clipping or guessing.
- Moving or resizing an object may produce a new full synthetic layout for QA, but Phase 3 does not claim incremental line reuse, spatial reconvergence, or product interaction budgets.
- Every accepted Phase 3 result reports `mayPublishLayout: false` and `productionBinding: false`.
- Core imports no Editor, Backend, browser, DOM, Canvas, PDF, Rust, WASM, transport, or storage runtime.
- Use TDD. End every implementation task with its focused Vitest file, `npm run type-check`, and `git diff --check`; commit only coherent green tasks.

## File Map

- Create `src/layout/textBlockSpatialIndexContractV1.ts`: strict synthetic entry, interval node/index, query, update, work, and issue contracts.
- Create `src/layout/textBlockSpatialIndexInternalsV1.ts`: strict entry validation, clearance-envelope arithmetic, deterministic interval-treap construction, max-bottom summaries, process-local registration, query traversal, and path-copy primitives.
- Create `src/layout/textBlockSpatialIndexV1.ts`: public index creation, inspection, band query, and QA node collection.
- Create `src/layout/textBlockSpatialIndexUpdateV1.ts`: process-local move/resize update, path-copy delete/insert, affected-band union, and update inspection.
- Create `src/layout/textBlockFlowRegionProviderV1.ts`: strict line-band/inset validation, no-exclusion fast path, rectangular subtraction, barrier handling, overlay neutrality, next-y event, and region fingerprint.
- Create `src/layout/textBlockSpatialWrappingLayoutContractV1.ts`: wrapped-line, interval-placement, fragment, result, work, and issue contracts.
- Create `src/layout/textBlockSpatialWrappingLayoutV1.ts`: break-group projection from retained MR1 facts, multi-interval placement, line-band stabilization, zero-space advancement, and immutable non-publishable layout output.
- Create `tests/helpers/textBlockSpatialWrappingV1.ts`: deterministic MR1-Q tree/request and synthetic left/right/middle/barrier/overlay/move/resize fixtures.
- Create `tests/textBlockSpatialIndexV1.test.ts`: strict input, canonical construction, y-band pruning, immutability, provenance, and boundary rejection.
- Create `tests/textBlockSpatialIndexUpdateV1.test.ts`: move/resize path copying, old/new band union, stale/tampered input, and structural-sharing evidence.
- Create `tests/textBlockFlowRegionProviderV1.test.ts`: left/right/middle/multiple interval subtraction, top/bottom barrier, overlay, fast path, zero-space next event, and invalid geometry.
- Create `tests/textBlockSpatialWrappingLayoutV1.test.ts`: no-exclusion MR1 parity, real multi-interval placement, barrier/zero-space advancement, overlay, move/resize layout changes, band expansion, and provenance rejection.
- Create `tests/liveDraftMr1SpatialWrapping3a.test.ts`: public export, documentation, capability, scope, and next-checkpoint guards.
- Create `docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md`: Phase 3 evidence and PASS / FAIL / RISK / UNKNOWN handoff.
- Modify `src/index.ts`: export only the four public Phase 3 modules; keep internals private.
- Modify `docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md`: record Phase 3 completion evidence without rewriting historical MR1-Q results.
- Modify `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`: advance the active Core truth and next pointer while preserving Editor/Backend NO-GO.
- Modify `docs/PHASE_LEDGER.md`: append the accepted Core Spatial Wrapping 3A checkpoint.

---

### Task 1: Strict Synthetic Persistent Y-Interval Index

**Files:**
- Create: `src/layout/textBlockSpatialIndexContractV1.ts`
- Create: `src/layout/textBlockSpatialIndexInternalsV1.ts`
- Create: `src/layout/textBlockSpatialIndexV1.ts`
- Create: `tests/helpers/textBlockSpatialWrappingV1.ts`
- Create: `tests/textBlockSpatialIndexV1.test.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `VNextTextBlockPersistentFlowTreeV1`, `VNextTextBlockMultiRunLayoutRequestV1`, `inspectVNextTextBlockPersistentFlowTreeV1(...)`, `hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1(...)`, `createVNextCompactFingerprint(...)`, `stringifyVNextCanonicalJson(...)`, and the existing layout-unit Zod schemas.
- Produces:

```ts
export type VNextTextBlockSpatialWrapPolicyV1 =
  | "rectangular-exclusion"
  | "top-bottom-barrier"
  | "overlay"

export interface VNextTextBlockSyntheticPositionedObjectInputV1 {
  objectId: string
  geometryOwnerFingerprint: string
  xLayoutUnit: number
  yLayoutUnit: number
  widthLayoutUnit: number
  heightLayoutUnit: number
  clearance: {
    topLayoutUnit: number
    rightLayoutUnit: number
    bottomLayoutUnit: number
    leftLayoutUnit: number
  }
  wrapPolicy: VNextTextBlockSpatialWrapPolicyV1
}

export interface VNextTextBlockSpatialEnvelopeV1 {
  leftLayoutUnit: number
  topLayoutUnit: number
  rightLayoutUnit: number
  bottomLayoutUnit: number
}

export interface VNextTextBlockSpatialIndexEntryV1
  extends VNextTextBlockSyntheticPositionedObjectInputV1 {
  envelope: VNextTextBlockSpatialEnvelopeV1
  fingerprint: string
}

export interface VNextTextBlockSpatialIndexNodeV1 {
  entry: VNextTextBlockSpatialIndexEntryV1
  priorityFingerprint: string
  left: VNextTextBlockSpatialIndexNodeV1 | null
  right: VNextTextBlockSpatialIndexNodeV1 | null
  summary: {
    entryCount: number
    nodeCount: number
    maximumBottomLayoutUnit: number
    flowAffectingEntryCount: number
    barrierEntryCount: number
    overlayEntryCount: number
  }
  fingerprint: string
}

export interface VNextTextBlockSpatialIndexV1 {
  source: "vnext-text-block-spatial-index-v1"
  contractVersion: 1
  inputAuthority: "core-synthetic-qa-only"
  documentId: string
  sectionId: string
  textBlockId: string
  instanceRevision: number
  layoutContextFingerprint: string
  persistentFlowTreeFingerprint: string
  contentLeftLayoutUnit: 0
  contentRightLayoutUnit: number
  root: VNextTextBlockSpatialIndexNodeV1 | null
  summary: VNextTextBlockSpatialIndexNodeV1["summary"]
  contracts: {
    canonicalPositionedObjectSchema: false
    authoredPositionedObjectBinding: false
    processLocalImmutableIndex: true
    subtreeMaximumBottomQuery: true
    coreOwnedFingerprints: true
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export interface VNextTextBlockSpatialIndexIssueV1 {
  code: VNextTextBlockSpatialIndexIssueCodeV1
  severity: "error"
  path: string
  message: string
  objectId?: string
}

export type VNextTextBlockSpatialIndexBuildResultV1 =
  | {
      status: "accepted"
      index: VNextTextBlockSpatialIndexV1
      mayPublishLayout: false
      productionBinding: false
      issues: []
    }
  | {
      status: "blocked"
      index: null
      mayPublishLayout: false
      productionBinding: false
      issues: VNextTextBlockSpatialIndexIssueV1[]
    }

export type VNextTextBlockSpatialIndexInspectionV1 =
  | { status: "valid"; fingerprint: string }
  | {
      status: "invalid"
      code: "spatial-index-provenance-mismatch" | "spatial-index-not-deeply-frozen"
      message: string
    }

export type VNextTextBlockSpatialIndexQueryResultV1 =
  | {
      status: "accepted"
      entries: readonly VNextTextBlockSpatialIndexEntryV1[]
      work: {
        visitedNodeCount: number
        matchedEntryCount: number
        completeIndexScanCount: 0
      }
      issues: []
    }
  | {
      status: "blocked"
      entries: null
      work: null
      issues: VNextTextBlockSpatialIndexIssueV1[]
    }

export function createVNextTextBlockSpatialIndexV1(input: {
  inputAuthority: "core-synthetic-qa-only"
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
}): VNextTextBlockSpatialIndexBuildResultV1

export function inspectVNextTextBlockSpatialIndexV1(
  index: unknown,
): VNextTextBlockSpatialIndexInspectionV1

export function queryVNextTextBlockSpatialIndexV1(input: {
  index: VNextTextBlockSpatialIndexV1
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  band: { topLayoutUnit: number; bottomLayoutUnit: number }
}): VNextTextBlockSpatialIndexQueryResultV1

export function collectVNextTextBlockSpatialIndexNodesForQaV1(
  index: VNextTextBlockSpatialIndexV1,
): VNextTextBlockSpatialIndexNodeV1[]
```

- [ ] **Step 1: Write the failing strict-index tests and deterministic fixture**

Create a fixture with an accepted MR1 request/tree and four entries whose clearance envelopes occupy disjoint y bands. Assert:

```ts
const fixture = acceptedSpatialWrappingFixture()
const result = createVNextTextBlockSpatialIndexV1({
  inputAuthority: "core-synthetic-qa-only",
  persistentFlowTree: fixture.tree,
  request: fixture.request,
  entries: fixture.entries,
})
expect(result).toMatchObject({
  status: "accepted",
  index: {
    inputAuthority: "core-synthetic-qa-only",
    contentLeftLayoutUnit: 0,
    contentRightLayoutUnit: fixture.request.availableWidthLayoutUnit,
    contracts: {
      canonicalPositionedObjectSchema: false,
      processLocalImmutableIndex: true,
      mayPublishLayout: false,
      productionBinding: false,
    },
  },
})
```

Also assert duplicate ids, blank ids, malformed compact owner fingerprints, unknown wrap policies, non-safe integers, zero sizes, negative clearance-envelope tops, horizontal overflow, extra object fields, cloned tree objects, and cloned request objects return structured blocked results.

- [ ] **Step 2: Run the index test to verify the public contract is missing**

Run:

```text
npx vitest run tests/textBlockSpatialIndexV1.test.ts
```

Expected: FAIL because the spatial-index exports do not exist.

- [ ] **Step 3: Define the strict contract and issue vocabulary**

Use explicit issue codes:

```ts
export type VNextTextBlockSpatialIndexIssueCodeV1 =
  | "production-binding-forbidden"
  | "input-authority-mismatch"
  | "flow-tree-provenance-mismatch"
  | "flow-tree-request-binding-mismatch"
  | "invalid-spatial-entry"
  | "duplicate-object-id"
  | "unsupported-wrap-policy"
  | "spatial-boundary-violation"
  | "unsafe-spatial-arithmetic"
  | "spatial-index-provenance-mismatch"
  | "spatial-index-stale"
  | "spatial-object-not-found"
  | "spatial-owner-mismatch"
  | "no-spatial-change"
  | "invalid-query-band"
```

Every blocked build returns `index: null`; every blocked query returns `entries: null`, `work: null`, and no partial geometry.

- [ ] **Step 4: Implement safe clearance envelopes and canonical spatial keys**

Validate each entry with a strict Zod object. Compute:

```ts
const envelope = {
  leftLayoutUnit: xLayoutUnit - clearance.leftLayoutUnit,
  topLayoutUnit: yLayoutUnit - clearance.topLayoutUnit,
  rightLayoutUnit: xLayoutUnit + widthLayoutUnit + clearance.rightLayoutUnit,
  bottomLayoutUnit: yLayoutUnit + heightLayoutUnit + clearance.bottomLayoutUnit,
}
```

Reject the entry unless every intermediate is a safe integer, `envelope.leftLayoutUnit >= 0`, `envelope.topLayoutUnit >= 0`, and `envelope.rightLayoutUnit <= request.availableWidthLayoutUnit`. Order entries by the numeric tuple:

```ts
[envelope.topLayoutUnit, envelope.bottomLayoutUnit, objectId]
```

Derive `entry.fingerprint` from canonical entry facts and use that compact fingerprint as the deterministic treap priority; compare equal priorities by the same spatial key.

- [ ] **Step 5: Implement immutable interval-treap construction and process-local binding**

Implement rotations and node creation as pure functions. Each node summary uses:

```ts
maximumBottomLayoutUnit = Math.max(
  entry.envelope.bottomLayoutUnit,
  left?.summary.maximumBottomLayoutUnit ?? entry.envelope.bottomLayoutUnit,
  right?.summary.maximumBottomLayoutUnit ?? entry.envelope.bottomLayoutUnit,
)
```

Register the recursively frozen index in a `WeakSet`, and bind it through `WeakMap`s to the exact persistent tree, exact request, request fingerprint, and object-id map. Never export these registries.

- [ ] **Step 6: Implement max-bottom y-band query pruning**

For a half-open band `[top, bottom)`, visit the left subtree only when its `maximumBottomLayoutUnit > top`, match the current entry only when `entry.top < bottom && entry.bottom > top`, and visit the right subtree only when the current entry top is below `bottom`. Return entries in spatial-key order with:

```ts
work: {
  visitedNodeCount: number
  matchedEntryCount: number
  completeIndexScanCount: 0
}
```

- [ ] **Step 7: Prove determinism, pruning, immutability, and provenance**

Build the same logical entry set in forward and reverse order and require exact index equality/fingerprint equality. Query a narrow band in a deterministic 1,024-entry vertical fixture and require exact matches, `completeIndexScanCount: 0`, and `visitedNodeCount < index.summary.nodeCount`. Require every collected node and the index to be frozen. Require `structuredClone(index)` to fail inspection with `spatial-index-provenance-mismatch`.

- [ ] **Step 8: Run Task 1 checks and commit**

Run:

```text
npx vitest run tests/textBlockSpatialIndexV1.test.ts tests/textBlockPersistentFlowTreeV1.test.ts
npm run type-check
git diff --check
```

Expected: all checks PASS.

Commit:

```text
git add src/layout/textBlockSpatialIndexContractV1.ts src/layout/textBlockSpatialIndexInternalsV1.ts src/layout/textBlockSpatialIndexV1.ts src/index.ts tests/helpers/textBlockSpatialWrappingV1.ts tests/textBlockSpatialIndexV1.test.ts
git commit -m "feat(layout): add persistent text block spatial index"
```

---

### Task 2: Structurally Shared Move And Resize Updates

**Files:**
- Create: `src/layout/textBlockSpatialIndexUpdateV1.ts`
- Modify: `src/layout/textBlockSpatialIndexContractV1.ts`
- Modify: `src/layout/textBlockSpatialIndexInternalsV1.ts`
- Create: `tests/textBlockSpatialIndexUpdateV1.test.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: the exact registered `VNextTextBlockSpatialIndexV1`, persistent tree, and request from Task 1.
- Produces:

```ts
export interface VNextTextBlockSpatialIndexUpdateV1 {
  source: "vnext-text-block-spatial-index-update-v1"
  contractVersion: 1
  previousIndexFingerprint: string
  nextIndex: VNextTextBlockSpatialIndexV1
  objectId: string
  previousEntryFingerprint: string
  nextEntryFingerprint: string
  affectedBands: readonly {
    topLayoutUnit: number
    bottomLayoutUnit: number
  }[]
  work: {
    deleteVisitedNodeCount: number
    insertVisitedNodeCount: number
    createdNodeCount: number
    completeIndexRebuildCount: 0
  }
  contracts: {
    pathCopyUpdate: true
    oldNewBandUnion: true
    processLocalProofBinding: true
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export type VNextTextBlockSpatialIndexUpdateResultV1 =
  | {
      status: "accepted"
      update: VNextTextBlockSpatialIndexUpdateV1
      nextIndex: VNextTextBlockSpatialIndexV1
      work: VNextTextBlockSpatialIndexUpdateV1["work"]
      issues: []
    }
  | {
      status: "blocked"
      update: null
      nextIndex: null
      work: null
      issues: VNextTextBlockSpatialIndexIssueV1[]
    }

export type VNextTextBlockSpatialIndexUpdateInspectionV1 =
  | { status: "valid"; fingerprint: string }
  | {
      status: "invalid"
      code: "spatial-update-provenance-mismatch" | "spatial-update-binding-mismatch"
      message: string
    }

export function createVNextTextBlockSpatialIndexUpdateV1(input: {
  previousIndex: VNextTextBlockSpatialIndexV1
  expectedPreviousIndexFingerprint: string
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  objectId: string
  geometryOwnerFingerprint: string
  nextGeometry: {
    xLayoutUnit: number
    yLayoutUnit: number
    widthLayoutUnit: number
    heightLayoutUnit: number
  }
}): VNextTextBlockSpatialIndexUpdateResultV1

export function inspectVNextTextBlockSpatialIndexUpdateV1(input: {
  update: VNextTextBlockSpatialIndexUpdateV1
  previousIndex: VNextTextBlockSpatialIndexV1
  nextIndex: VNextTextBlockSpatialIndexV1
}): VNextTextBlockSpatialIndexUpdateInspectionV1
```

- [ ] **Step 1: Write failing move/resize and affected-band tests**

Move one middle exclusion from `[10, 30)` to `[50, 70)` and require:

```ts
expect(update.update.affectedBands).toEqual([
  { topLayoutUnit: 10_000_000, bottomLayoutUnit: 30_000_000 },
  { topLayoutUnit: 50_000_000, bottomLayoutUnit: 70_000_000 },
])
expect(update.work.completeIndexRebuildCount).toBe(0)
```

Resize an object so old/new bands overlap and require one merged union band. Compare QA node sets and require at least one untouched subtree node to be reused by object identity.

- [ ] **Step 2: Run the update test to verify the update boundary is missing**

Run:

```text
npx vitest run tests/textBlockSpatialIndexUpdateV1.test.ts
```

Expected: FAIL because the update exports do not exist.

- [ ] **Step 3: Implement path-copy treap delete/insert**

Resolve the previous entry only from the registered object-id map. Require exact `expectedPreviousIndexFingerprint` and `geometryOwnerFingerprint`. Delete the old spatial key and insert a newly validated entry with the same object id, owner fingerprint, clearance, and wrap policy. Track visited and newly allocated nodes inside the path-copy functions; never traverse the complete index to calculate production work.

- [ ] **Step 4: Implement exact old/new affected-band union**

Create two half-open bands from the previous and next clearance envelopes. Sort by top/bottom and merge only when the next top is less than or equal to the current bottom. Reject a no-op geometry update with `no-spatial-change`, and reject any move/resize that violates the same safe/boundary checks as initial construction.

- [ ] **Step 5: Bind update provenance and reject stale/tampered inputs**

Register each accepted update in a `WeakMap` containing exact previous/next index objects and their fingerprints. Inspection must reject cloned update/index objects, a stale expected fingerprint, a different request/tree, a different owner fingerprint, an unknown object id, and a re-fingerprinted altered `affectedBands` array.

- [ ] **Step 6: Prove move/resize structural sharing and query changes**

Require old-band queries to stop returning the moved entry, new-band queries to return it, resize queries to reflect the new bottom, unchanged entry objects to retain identity, and all next-index nodes/results to remain recursively frozen.

- [ ] **Step 7: Run Task 2 checks and commit**

Run:

```text
npx vitest run tests/textBlockSpatialIndexUpdateV1.test.ts tests/textBlockSpatialIndexV1.test.ts
npm run type-check
git diff --check
```

Expected: all checks PASS.

Commit:

```text
git add src/layout/textBlockSpatialIndexContractV1.ts src/layout/textBlockSpatialIndexInternalsV1.ts src/layout/textBlockSpatialIndexUpdateV1.ts src/index.ts tests/textBlockSpatialIndexUpdateV1.test.ts
git commit -m "feat(layout): path-copy spatial object updates"
```

---

### Task 3: Deterministic Flow Region Provider

**Files:**
- Create: `src/layout/textBlockFlowRegionProviderV1.ts`
- Create: `tests/textBlockFlowRegionProviderV1.test.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: the exact registered index/tree/request and `queryVNextTextBlockSpatialIndexV1(...)`.
- Produces:

```ts
export interface VNextTextBlockFlowIntervalV1 {
  startLayoutUnit: number
  endLayoutUnit: number
}

export type VNextTextBlockFlowRegionIssueCodeV1 =
  | "spatial-index-provenance-mismatch"
  | "spatial-index-binding-mismatch"
  | "invalid-line-band"
  | "invalid-content-insets"
  | "unsafe-region-arithmetic"
  | "invalid-returned-intervals"
  | "no-vertical-progress"

export interface VNextTextBlockFlowRegionIssueV1 {
  code: VNextTextBlockFlowRegionIssueCodeV1
  severity: "error"
  path: string
  message: string
}

export type VNextTextBlockFlowRegionResultV1 =
  | {
      status: "accepted"
      intervals: readonly VNextTextBlockFlowIntervalV1[]
      intersectingEntryFingerprints: readonly string[]
      nextYLayoutUnit: number | null
      work: {
        fastPath: "no-flow-affecting-entry" | "none"
        spatialIndexQueryCount: 0 | 1
        visitedSpatialNodeCount: number
        matchedSpatialEntryCount: number
        rectangularSubtractionCount: number
      }
      mayPublishLayout: false
      productionBinding: false
      fingerprint: string
      issues: []
    }
  | {
      status: "blocked"
      intervals: null
      intersectingEntryFingerprints: null
      nextYLayoutUnit: null
      work: null
      mayPublishLayout: false
      productionBinding: false
      fingerprint: null
      issues: VNextTextBlockFlowRegionIssueV1[]
    }

export function provideVNextTextBlockFlowRegionsV1(input: {
  spatialIndex: VNextTextBlockSpatialIndexV1
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  band: { topLayoutUnit: number; bottomLayoutUnit: number }
  contentInsets: {
    leftLayoutUnit: number
    rightLayoutUnit: number
  }
}): VNextTextBlockFlowRegionResultV1

export function inspectVNextTextBlockFlowRegionResultV1(
  result: unknown,
): { status: "valid"; fingerprint: string } | {
  status: "invalid"
  code: "flow-region-provenance-mismatch" | "flow-region-not-deeply-frozen"
  message: string
}
```

Accepted results contain ordered non-overlapping positive-width intervals, intersecting entry fingerprints, `nextYLayoutUnit: number | null`, a deterministic fingerprint, and:

```ts
work: {
  fastPath: "no-flow-affecting-entry" | "none"
  spatialIndexQueryCount: 0 | 1
  visitedSpatialNodeCount: number
  matchedSpatialEntryCount: number
  rectangularSubtractionCount: number
}
```

- [ ] **Step 1: Write failing provider matrix tests**

For a content interval `[0, 100_000_000)`, require:

```ts
left exclusion [0, 20)    -> [[20, 100]]
right exclusion [80, 100) -> [[0, 80]]
middle exclusion [40, 60) -> [[0, 40], [60, 100]]
two exclusions [20, 30), [60, 70) -> [[0, 20], [30, 60], [70, 100]]
top-bottom barrier -> []
overlay -> [[0, 100]]
```

Use exact layout-unit integers in the test. Require a full-width rectangular exclusion to return `intervals: []` and `nextYLayoutUnit` equal to its envelope bottom.

- [ ] **Step 2: Run the provider test to verify the provider is missing**

Run:

```text
npx vitest run tests/textBlockFlowRegionProviderV1.test.ts
```

Expected: FAIL because `provideVNextTextBlockFlowRegionsV1(...)` is not exported.

- [ ] **Step 3: Implement strict band/inset and provenance validation**

Require `top >= 0`, `bottom > top`, safe integers, nonnegative insets, and:

```ts
contentLeft + leftInset < contentRight - rightInset
```

Require the exact registered index/tree/request binding. Return structured issues for invalid bands, unsafe inset arithmetic, stale index identity, or context mismatch.

- [ ] **Step 4: Implement the no-flow-affecting fast path**

When `spatialIndex.summary.flowAffectingEntryCount === 0`, return the one inset-adjusted interval without calling the public query:

```ts
work: {
  fastPath: "no-flow-affecting-entry",
  spatialIndexQueryCount: 0,
  visitedSpatialNodeCount: 0,
  matchedSpatialEntryCount: 0,
  rectangularSubtractionCount: 0,
}
```

This applies to empty and overlay-only indexes. The result fingerprint still pins the spatial-index fingerprint and band/inset facts.

- [ ] **Step 5: Implement barrier handling and rectangular subtraction**

Query one band. If any intersecting flow-affecting entry is `top-bottom-barrier`, return no intervals. Otherwise sort rectangular envelopes by left/right, merge overlapping x exclusions, and subtract them from the inset-adjusted content interval. Do not clip a boundary-invalid entry; it must already have been rejected by index creation/update.

- [ ] **Step 6: Implement proved next-y events and interval invariants**

When no interval remains, set `nextYLayoutUnit` to the minimum intersecting flow-affecting envelope bottom strictly greater than `band.topLayoutUnit`. Block with `no-vertical-progress` if no such event exists. Validate before return that intervals are positive-width, ordered, inside content bounds, and non-overlapping.

- [ ] **Step 7: Prove overlay neutrality, fast path, determinism, and tamper rejection**

Require overlay-only provider output to use the zero-query fast path. Require repeated calls to produce exact equality. Require a cloned index, unsafe band, impossible insets, and re-fingerprinted mutated provider output inspection to fail closed.

- [ ] **Step 8: Run Task 3 checks and commit**

Run:

```text
npx vitest run tests/textBlockFlowRegionProviderV1.test.ts tests/textBlockSpatialIndexV1.test.ts tests/textBlockSpatialIndexUpdateV1.test.ts
npm run type-check
git diff --check
```

Expected: all checks PASS.

Commit:

```text
git add src/layout/textBlockFlowRegionProviderV1.ts src/index.ts tests/textBlockFlowRegionProviderV1.test.ts
git commit -m "feat(layout): provide spatial text flow regions"
```

---

### Task 4: Real Multi-Interval Spatial Line Placement

**Files:**
- Create: `src/layout/textBlockSpatialWrappingLayoutContractV1.ts`
- Create: `src/layout/textBlockSpatialWrappingLayoutV1.ts`
- Create: `tests/textBlockSpatialWrappingLayoutV1.test.ts`
- Modify: `tests/helpers/textBlockSpatialWrappingV1.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: the exact registered persistent tree/request/index, retained shaping clusters and break offsets from the accepted MR1 request, and `provideVNextTextBlockFlowRegionsV1(...)`.
- Produces:

```ts
export interface VNextTextBlockSpatialIntervalPlacementV1 {
  intervalIndex: number
  renderStartOffset: number
  renderEndOffset: number
  xStartLayoutUnit: number
  xEndLayoutUnit: number
}

export interface VNextTextBlockSpatialWrappedLineV1 {
  index: number
  renderStartOffset: number
  renderEndOffset: number
  yOffsetLayoutUnit: number
  heightLayoutUnit: number
  baselineOffsetLayoutUnit: number
  availableIntervals: readonly VNextTextBlockFlowIntervalV1[]
  intervalPlacements: readonly VNextTextBlockSpatialIntervalPlacementV1[]
  fragments: readonly VNextTextBlockPositionedFragmentV1[]
  sourceSegments: readonly VNextTextBlockMultiRunSourceSegmentV1[]
  regionFingerprint: string
  fingerprint: string
}

export type VNextTextBlockSpatialWrappingIssueCodeV1 =
  | "production-binding-forbidden"
  | "flow-tree-provenance-mismatch"
  | "flow-tree-request-binding-mismatch"
  | "spatial-index-binding-mismatch"
  | "invalid-start-y"
  | "invalid-flow-tree-projection"
  | "unsafe-layout-arithmetic"
  | "unbreakable-flow-item-overflow"
  | "no-vertical-progress"
  | "line-band-did-not-stabilize"

export interface VNextTextBlockSpatialWrappingIssueV1 {
  code: VNextTextBlockSpatialWrappingIssueCodeV1
  severity: "error"
  path: string
  message: string
  lineIndex?: number
}

export type VNextTextBlockSpatialWrappingLayoutResultV1 =
  | {
      status: "accepted"
      source: "vnext-text-block-spatial-wrapping-layout-v1"
      contractVersion: 1
      documentId: string
      sectionId: string
      textBlockId: string
      instanceRevision: number
      layoutContextFingerprint: string
      persistentFlowTreeFingerprint: string
      spatialIndexFingerprint: string
      lines: readonly VNextTextBlockSpatialWrappedLineV1[]
      summary: {
        lineCount: number
        fragmentCount: number
        intervalPlacementCount: number
        heightLayoutUnit: number
      }
      work: {
        flowRegionFastPathCount: number
        spatialIndexQueryCount: number
        verticalAdvanceCount: number
        lineBandRequeryCount: number
      }
      contracts: {
        multiIntervalRectangularWrapping: true
        topBottomBarrierAdvancement: true
        overlayRemovesFlowSpace: false
        rendererMayMeasureText: false
        rendererMayRelayout: false
        stagedEditorApply: false
        mayPublishLayout: false
        productionBinding: false
      }
      mayPublishLayout: false
      productionBinding: false
      fingerprint: string
      issues: []
    }
  | {
      status: "blocked"
      lines: null
      summary: null
      work: null
      mayPublishLayout: false
      productionBinding: false
      fingerprint: null
      issues: VNextTextBlockSpatialWrappingIssueV1[]
    }

export function layoutVNextTextBlockSpatialWrappingV1(input: {
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  spatialIndex: VNextTextBlockSpatialIndexV1
  startYLayoutUnit: number
  bindProductionLayout?: boolean
}): VNextTextBlockSpatialWrappingLayoutResultV1

export function inspectVNextTextBlockSpatialWrappingLayoutV1(
  result: unknown,
): { status: "valid"; fingerprint: string } | {
  status: "invalid"
  code: "spatial-layout-provenance-mismatch" | "spatial-layout-not-deeply-frozen"
  message: string
}
```

Accepted layout facts include exact document/TextBlock/revision/context/tree/index pins, recursively frozen lines, summary/work facts, `mayPublishLayout: false`, and `productionBinding: false`.

- [ ] **Step 1: Write failing no-exclusion and middle-exclusion layout tests**

Use a one-line accepted MR1-Q fixture to require no-exclusion range/y/fragment parity with `acceptVNextTextBlockMultiRunLayoutV1(...)` and:

```ts
expect(spatial.work).toMatchObject({
  flowRegionFastPathCount: spatial.lines.length,
  spatialIndexQueryCount: 0,
})
```

Use a separate 100-unit synthetic request with a break after every unbreakable group and a middle exclusion `[40, 60)`. Require one logical line to retain two available intervals and placements on both sides:

```ts
expect(line.availableIntervals).toEqual([
  { startLayoutUnit: 0, endLayoutUnit: 40_000_000 },
  { startLayoutUnit: 60_000_000, endLayoutUnit: 100_000_000 },
])
expect(new Set(line.intervalPlacements.map((item) => item.intervalIndex))).toEqual(new Set([0, 1]))
```

- [ ] **Step 2: Run the layout test to verify the spatial layout boundary is missing**

Run:

```text
npx vitest run tests/textBlockSpatialWrappingLayoutV1.test.ts
```

Expected: FAIL because the spatial wrapping layout exports do not exist.

- [ ] **Step 3: Project exact break-safe groups from retained MR1 facts**

Flatten shaping clusters in source order and treat hard-break measurement runs as zero-paint mandatory terminators. Partition the source by consecutive accepted `request.breakOffsets`. For each group retain:

```ts
{
  renderStartOffset: number
  renderEndOffset: number
  clusters: readonly {
    shapingRunId: string
    renderStartOffset: number
    renderEndOffset: number
    advanceLayoutUnit: number
  }[]
  advanceLayoutUnit: number
  mandatoryBreak: boolean
}
```

Reject cluster gaps, non-cluster break boundaries, unsafe sums, or any mismatch between tree summary length and request rendered length. Do not trust `request.lines` as the new spatial line decision.

- [ ] **Step 4: Implement interval-by-interval unbreakable-group placement**

For each candidate line, visit available x intervals from left to right. Place a whole break group only when its full advance fits the current remaining interval. If it does not fit, try the next interval without splitting the group. When no later interval fits:

- finish the line before the group if the line already placed content;
- advance to a proved exclusion bottom if the line is empty and the provider supplies `nextYLayoutUnit`; or
- block with `unbreakable-flow-item-overflow` when no exclusion event can make progress.

Coalesce adjacent clusters from the same shaping run and interval into one fragment. Start each fragment at the actual interval cursor, so a central exclusion creates a visible x jump without creating a source gap.

- [ ] **Step 5: Implement fixed-point line metrics and band stabilization**

Derive paragraph metrics and per-run ascent/descent using the same signed font-metric scaling rules as existing MR1 acceptance. Start the band at:

```ts
Math.max(request.declaredLineHeightLayoutUnit, paragraphNaturalHeightLayoutUnit)
```

After tentative placement, compute actual ascent/descent/height from placed fragments. If height grows, re-query `[lineTop, lineTop + grownHeight)` and restart placement. Keep candidate height monotonic. Accept only when the intersecting region fingerprint and resulting line height are stable. Bound stabilization to `spatialIndex.summary.flowAffectingEntryCount + 1` region changes and block with `line-band-did-not-stabilize` if that proof is exceeded.

- [ ] **Step 6: Implement hard breaks, zero-space advancement, and termination**

A hard break closes the line at its render end without creating a paint fragment. Every retry must either consume at least one source group or set:

```ts
nextYLayoutUnit > currentYLayoutUnit
```

Reject equal/decreasing events with `no-vertical-progress`. The finite spatial-event set plus monotonic source/y progress is the termination proof; add no arbitrary y increment.

- [ ] **Step 7: Fingerprint and freeze spatial lines without publication authority**

Include tree/index/region fingerprints, available intervals, interval placements, fragments, source segments, metrics, and source ranges in each line fingerprint. Return:

```ts
contracts: {
  multiIntervalRectangularWrapping: true,
  topBottomBarrierAdvancement: true,
  overlayRemovesFlowSpace: false,
  rendererMayMeasureText: false,
  rendererMayRelayout: false,
  stagedEditorApply: false,
  mayPublishLayout: false,
  productionBinding: false,
}
```

- [ ] **Step 8: Prove left/right/middle, barrier, overlay, and zero-space layout behavior**

Require left and right exclusions to shift or shorten the single interval, a middle exclusion to produce two same-line placements, a top/bottom barrier and full-width rectangle to advance exactly to the envelope bottom, and overlay to preserve the no-flow-affecting fast path. Require source coverage to remain contiguous and every cluster/group to remain unsplit.

- [ ] **Step 9: Prove expanded-band re-query and fail-closed behavior**

Use a tall mixed-size run whose initial paragraph band misses an exclusion but whose final line height intersects it. Require at least two region evaluations and final geometry that respects the newly intersecting exclusion. Reject cloned tree/request/index, production binding, stale revision/context, unsafe start y, an oversized unbreakable group with no future exclusion event, and mutated retained output.

- [ ] **Step 10: Run Task 4 checks and commit**

Run:

```text
npx vitest run tests/textBlockSpatialWrappingLayoutV1.test.ts tests/textBlockFlowRegionProviderV1.test.ts tests/textBlockPersistentFlowTreeV1.test.ts
npm run type-check
git diff --check
```

Expected: all checks PASS.

Commit:

```text
git add src/layout/textBlockSpatialWrappingLayoutContractV1.ts src/layout/textBlockSpatialWrappingLayoutV1.ts src/index.ts tests/helpers/textBlockSpatialWrappingV1.ts tests/textBlockSpatialWrappingLayoutV1.test.ts
git commit -m "feat(layout): execute multi-interval spatial wrapping"
```

---

### Task 5: Move/Resize Composition, Provenance Hardening, And Bounded Evidence

**Files:**
- Modify: `tests/textBlockSpatialIndexUpdateV1.test.ts`
- Modify: `tests/textBlockFlowRegionProviderV1.test.ts`
- Modify: `tests/textBlockSpatialWrappingLayoutV1.test.ts`
- Modify: `tests/helpers/textBlockSpatialWrappingV1.ts`

**Interfaces:**
- Consumes: all Task 1-4 public boundaries.
- Produces: exact composed evidence that a path-copied move/resize changes strict synthetic wrapping while preserving MR1-Q identity gates and without claiming Phase 5 incremental reflow.

- [ ] **Step 1: Add the move composition test**

Create an initial middle exclusion intersecting line 0, move it below line 0 through `createVNextTextBlockSpatialIndexUpdateV1(...)`, and run the full synthetic spatial layout against both exact indexes. Require:

- the previous layout to use two line-0 intervals;
- the next layout to use the single full-width line-0 interval;
- update `affectedBands` to equal the exact old/new clearance-band union;
- both results to remain non-publishable and non-production; and
- no claim or counter for reused spatial lines.

- [ ] **Step 2: Add the resize composition test**

Resize a left exclusion wider while keeping its y band. Require the next provider/layout interval start to equal the resized envelope right, the affected-band union to merge into one band, unchanged spatial entries/subtrees to retain object identity, and the persistent flow tree object/fingerprint to remain unchanged.

- [ ] **Step 3: Add identity/provenance rejection matrix**

For build, update, provider, and layout boundaries, cover:

```text
structuredClone(persistentFlowTree)
structuredClone(request)
structuredClone(spatialIndex)
structuredClone(spatialUpdate)
stale expected index fingerprint
changed instanceRevision
changed layoutContextFingerprint
changed geometryOwnerFingerprint
re-fingerprinted altered entry geometry
re-fingerprinted altered affected bands
bindProductionLayout: true
```

Every row must return a structured blocked/invalid result with no partial index, intervals, or lines.

- [ ] **Step 4: Add boundary and arithmetic rejection matrix**

Cover left/right clearance overflow, negative envelope top, zero width/height, `Number.MAX_SAFE_INTEGER` addition overflow, invalid band ordering, impossible content insets, duplicate ids, unsupported wrap policy, full-width unbreakable content without a spatial next event, and a provider/layout retry whose next y cannot exceed current y.

- [ ] **Step 5: Add bounded-work and no-exclusion regression evidence**

Require:

- 1,024-entry narrow-band query visits fewer than all nodes and reports `completeIndexScanCount: 0`;
- one move/resize reports `completeIndexRebuildCount: 0` and reuses at least one untouched subtree by object identity;
- empty and overlay-only indexes report zero query calls;
- a no-exclusion layout reproduces existing accepted MR1 line ranges/y/fragments on the chosen fixture; and
- existing persistent flow tree/update tests remain unchanged and green.

Do not add timing thresholds, heap budgets, or a product frame claim.

- [ ] **Step 6: Run the composed Phase 3 source gate and commit**

Run:

```text
npx vitest run tests/textBlockSpatialIndexV1.test.ts tests/textBlockSpatialIndexUpdateV1.test.ts tests/textBlockFlowRegionProviderV1.test.ts tests/textBlockSpatialWrappingLayoutV1.test.ts tests/textBlockPersistentFlowTreeV1.test.ts tests/textBlockPersistentFlowUpdateV1.test.ts tests/textBlockMultiRunSemanticWindowV1.test.ts
npm run type-check
git diff --check
```

Expected: all checks PASS.

Commit:

```text
git add tests/helpers/textBlockSpatialWrappingV1.ts tests/textBlockSpatialIndexUpdateV1.test.ts tests/textBlockFlowRegionProviderV1.test.ts tests/textBlockSpatialWrappingLayoutV1.test.ts
git commit -m "test(layout): harden spatial wrapping evidence"
```

---

### Task 6: Phase 3 Handoff, Scope Guard, And Full Core Gate

**Files:**
- Create: `docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md`
- Create: `tests/liveDraftMr1SpatialWrapping3a.test.ts`
- Modify: `docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md`
- Modify: `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`
- Modify: `docs/PHASE_LEDGER.md`

**Interfaces:**
- Consumes: final Phase 3 source/test evidence and exact command output.
- Produces: an evidence-backed Core-only Phase 3 handoff with the next pointer set to Phase 4 Initial TextBlock Geometry.

- [ ] **Step 1: Write the failing handoff guard**

Require the new handoff to contain these peer sections in order:

```ts
expect(headings).toEqual([
  "## Status",
  "## Outcome",
  "## Capability Matrix",
  "## Spatial Index Evidence",
  "## Flow Region And Wrapping Evidence",
  "## Move And Resize Evidence",
  "## PASS",
  "## FAIL / BLOCKER",
  "## RISK",
  "## UNKNOWN",
  "## Verification",
  "## Next Checkpoint",
])
```

Require exact public export lines for the spatial index, update, provider, and layout modules. Require the active handoff and ledger sections to name `Phase 3: Core Spatial Wrapping 3A`, preserve `mayPublishLayout: false`, `productionBinding: false`, `stagedEditorApply: false`, and state that all deferred items remain NO-GO.

- [ ] **Step 2: Run the documentation guard to verify the handoff is missing**

Run:

```text
npx vitest run tests/liveDraftMr1SpatialWrapping3a.test.ts
```

Expected: FAIL because the Phase 3 handoff and active pointers do not exist.

- [ ] **Step 3: Write the Phase 3 evidence handoff**

Record:

- persistent interval-treap shape, max-bottom query pruning, strict synthetic authority, and process-local provenance;
- left/right/middle/multiple rectangular interval results;
- top/bottom barrier, overlay, full-width zero-space advancement, and band-expansion stabilization;
- move/resize path copying and exact old/new affected-band union;
- no-flow-affecting fast-path counts;
- MR1-Q no-exclusion parity and clone/stale/tamper rejection;
- exact focused/full test totals copied from the final command output; and
- no product timing or memory budget.

The capability matrix must mark spatial wrapping as `Core synthetic 3A accepted` and continue to mark inline images, list decoration, empty blocks, authored positioned objects, Columns/Table, Table auto-fit, Editor/Backend binding, publication, and production as blocked/NO-GO.

- [ ] **Step 4: Advance active pointers without rewriting historical evidence**

Append a Phase 3 result to `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`, update its current baseline after the coherent Phase 3 commit exists, and change `First Task For The Next Thread` / `Handoff Prompt` to Phase 4 Initial TextBlock Geometry. Preserve MR1-Q historical counts and wording in their own sections. Append one Phase 3 ledger entry rather than editing unrelated historical phases.

- [ ] **Step 5: Run the focused Phase 3 documentation and source gate**

Run:

```text
npx vitest run tests/liveDraftMr1SpatialWrapping3a.test.ts tests/textBlockSpatialIndexV1.test.ts tests/textBlockSpatialIndexUpdateV1.test.ts tests/textBlockFlowRegionProviderV1.test.ts tests/textBlockSpatialWrappingLayoutV1.test.ts tests/liveDraftMr1PersistentFlowFoundation.test.ts tests/textBlockPersistentFlowTreeV1.test.ts tests/textBlockPersistentFlowUpdateV1.test.ts
npm run type-check
git diff --check
```

Expected: all checks PASS. Copy the exact file/test totals into the new handoff.

- [ ] **Step 6: Run the full Core gate**

Run:

```text
npm run check
git diff --check
git status --short
```

Expected: all Core tests and type-check PASS, whitespace check is empty, and status contains only the intended Phase 3 documentation/test changes before the final commit.

- [ ] **Step 7: Commit the coherent Phase 3 handoff**

Commit:

```text
git add docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md docs/PHASE_LEDGER.md tests/liveDraftMr1SpatialWrapping3a.test.ts
git commit -m "docs: hand off core spatial wrapping 3a"
```

- [ ] **Step 8: Verify final repository state**

Run:

```text
git status --short --branch
git log -6 --oneline --decorate
```

Expected: the Core worktree is clean, the Phase 3 commits are visible at HEAD, Editor and Backend remain untouched, and the next authorized checkpoint is Phase 4 Initial TextBlock Geometry.

## Plan Self-Review

- Spec coverage: Tasks 1-5 cover persistent y-interval indexing, strict synthetic inputs, Flow Region Provider, left/right/middle multi-interval wrapping, barriers, overlay, zero-space advancement, move/resize, boundary rejection, no-exclusion fast path, and MR1-Q identity/provenance gates.
- Scope coverage: Global Constraints and Task 6 keep list decoration, inline-image geometry, empty blocks, Editor/Backend, Columns/Table, auto-fit, publication, production, and staged Editor apply outside Phase 3.
- Incremental boundary: Task 2 reports old/new affected bands, but Tasks 4-5 explicitly avoid Phase 5 line reuse/reconvergence claims.
- Type consistency: `VNextTextBlockSpatialIndexV1`, `VNextTextBlockSpatialIndexUpdateV1`, `VNextTextBlockFlowIntervalV1`, and `VNextTextBlockSpatialWrappingLayoutResultV1` names are used consistently by all later tasks.
- Prohibited-placeholder scan: clean; every task names concrete files, interfaces, tests, commands, and failure behavior.
