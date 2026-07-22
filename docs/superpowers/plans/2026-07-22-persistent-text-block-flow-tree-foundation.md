# Persistent TextBlock Flow Tree Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 2 of the Persistent TextBlock Spatial Flow design: a Core-owned persistent B+ flow rope for the accepted MR1 text subset, structurally shared range updates, and a bounded semantic checkpoint proof with `completeNextSemanticPassCount: 0`.

**Architecture:** Convert one already accepted MR1 request into immutable offset-independent flow items packed into bounded leaves and balanced composition branches. For an incremental edit, replace only the line-window range, retain untouched prefix/suffix nodes by object identity, compute semantic facts only for the bounded next-line window, and leave the existing complete request/layout path available only as optional QA evidence.

**Tech Stack:** TypeScript 6 ESM, Vitest 4, existing FlowDoc compact SHA-256 and canonical JSON helpers, existing micro-point integer layout contracts, existing Rustybuzz/ICU4X MR1 range adapter.

## Global Constraints

- Keep the canonical Document v4 schema unchanged.
- Keep `VNEXT_LAYOUT_UNITS_PER_POINT` exactly `1_000_000`; this phase introduces no new geometry unit.
- Keep `VNextTextBlockMultiRunLayoutRequestV1` and complete MR1 acceptance behavior available as the independent QA oracle.
- Build the first tree only for the accepted MR1 subset: text, resolved fields, generated page numbers, and hard breaks.
- Inline images, list decoration, empty-block geometry, positioned objects, spatial wrapping, Columns/Table integration, auto-fit, Editor product binding, Backend routes, publication, and production activation remain out of scope.
- Tree items contain local lengths and local cluster/source facts, never absolute document offsets; cumulative offsets come from subtree summaries.
- Policy v1 is fixed at `256` rendered UTF-16 units per flow item, `8` items per leaf, and `8` children per branch. Changing these constants requires a new policy fingerprint/version.
- Every accepted tree, update, checkpoint proof, and incremental acceptance remains deeply immutable, process-local, non-publishable, and non-production.
- Core computes every item, node, range, and proof fingerprint. Adapters may provide shaping facts but may not provide trusted semantic digests.
- `draft-current`/viewport staged apply is not implemented here. Phase 2 only retains stable ordered identities and resumable range references required by the approved B1 feedback contract.
- Preserve fail-closed behavior for stale revisions, context drift, malformed UTF-16 offsets, unsupported runs, cluster gaps, cloned provenance objects, and proof tampering.
- Use TDD. Commit each task only after its focused tests and `npm run type-check` pass.

## File Map

- Create `src/layout/textBlockPersistentFlowContractV1.ts`: policy, item/node/tree/update contracts and issue codes.
- Create `src/layout/textBlockPersistentFlowTreeInternalsV1.ts`: item projection, summaries, node construction, balancing, range lookup, and local node splitting; this file is not exported from `src/index.ts`.
- Create `src/layout/textBlockPersistentFlowTreeV1.ts`: accepted-request projection, balanced tree construction, provenance inspection, and QA traversal.
- Create `src/layout/textBlockPersistentFlowUpdateV1.ts`: cluster-safe rendered-range replacement, path copying, structural sharing, and update proof inspection.
- Modify `src/layout/textBlockMultiRunSemanticV1.ts`: add bounded line-window semantic checkpoint derivation.
- Modify `src/layout/textBlockMultiRunIncrementalContractV1.ts`: retain the persistent tree and zero-full-pass work facts.
- Modify `src/layout/textBlockMultiRunIncrementalSnapshotV1.ts`: build the initial persistent tree once from accepted MR1 facts.
- Modify `src/layout/textBlockMultiRunIncrementalSemanticCheckpointV1.ts`: compose the next proof from persistent reuse plus bounded affected/stable lines.
- Modify `src/layout/textBlockMultiRunIncrementalAcceptanceV1.ts`: retain persistent proof work without changing layout positioning semantics.
- Modify `packages/text-engine-rust-wasm/src/incrementalCoreExecution.ts`: create the tree update before Core checkpoint acceptance and expose a separate diagnostic phase.
- Modify `packages/text-engine-rust-wasm/src/incrementalRetainedSnapshot.ts`: retain the Core tree fingerprint and node/item counts.
- Create `tests/helpers/textBlockPersistentFlowV1.ts`: deterministic accepted MR1 and edit fixtures.
- Create `tests/textBlockPersistentFlowTreeV1.test.ts`: policy, projection, immutability, atom kinds, and invalid-request evidence.
- Create `tests/textBlockPersistentFlowUpdateV1.test.ts`: prefix/suffix sharing, split growth, stale/tamper, and bounded-work evidence.
- Create `tests/textBlockMultiRunSemanticWindowV1.test.ts`: bounded semantic-window equivalence and malformed-window rejection.
- Modify `tests/textEngineIncrementalRangeExecutionV1.test.ts`: actual-WASM incremental proof, optional oracle parity, and complete-pass removal.
- Create `tests/liveDraftMr1PersistentFlowFoundation.test.ts`: documentation/export/scope guard.
- Create `docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md`: Phase 2 evidence handoff.
- Modify `docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md`: mark Phase 2 complete and point to Phase 3.
- Modify `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`: record Phase 2 scope and the B1 compatibility fact.
- Modify `docs/PHASE_LEDGER.md`: append the accepted Phase 2 checkpoint.
- Modify `src/index.ts`: export the persistent flow contracts, tree, and update boundary.

---

### Task 1: Persistent Flow Policy And Accepted-Request Tree

**Files:**
- Create: `src/layout/textBlockPersistentFlowContractV1.ts`
- Create: `src/layout/textBlockPersistentFlowTreeInternalsV1.ts`
- Create: `src/layout/textBlockPersistentFlowTreeV1.ts`
- Create: `tests/helpers/textBlockPersistentFlowV1.ts`
- Create: `tests/textBlockPersistentFlowTreeV1.test.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `VNextTextBlockMultiRunLayoutRequestV1`, `VNextTextBlockAcceptedMultiRunLayoutV1`, `acceptVNextTextBlockMultiRunLayoutV1(...)`, `stringifyVNextCanonicalJson(...)`, and `createVNextCompactFingerprint(...)`.
- Produces: `VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1`, `VNextTextBlockPersistentFlowTreeV1`, `createVNextTextBlockPersistentFlowTreeV1(...)`, `inspectVNextTextBlockPersistentFlowTreeV1(...)`, and `collectVNextTextBlockPersistentFlowNodesForQaV1(...)`.

- [ ] **Step 1: Write the failing tree tests and deterministic helper**

Create `tests/helpers/textBlockPersistentFlowV1.ts` with a helper that accepts the existing mixed-typography request and a second request containing generated-page-number and hard-break runs:

```ts
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  type VNextTextBlockMultiRunLayoutRequestV1,
} from "../../src/index.js"
import {
  legacyTextOnlyLayoutRequestFixture,
  mixedTypographyLayoutRequestFixture,
} from "./textBlockInitialFlowV1.js"

export function acceptedPersistentFlowFixture() {
  const request = mixedTypographyLayoutRequestFixture()
  const acceptedLayout = acceptVNextTextBlockMultiRunLayoutV1(request)
  if (acceptedLayout.status !== "accepted") throw new Error("persistent flow fixture did not layout")
  return { request, acceptedLayout }
}

export function acceptedPersistentAtomicFlowFixture() {
  const base = legacyTextOnlyLayoutRequestFixture()
  const fontFace = base.fontFaces[0]!
  const styleKey = base.shapingRuns[0]!.styleKey
  const request: VNextTextBlockMultiRunLayoutRequestV1 = {
    ...base,
    layoutId: "persistent-flow-atomic-layout",
    measurement: {
      ...base.measurement,
      renderedText: "A1\nB",
      runs: [
        { inlineId: "text-a", kind: "text", renderStartOffset: 0, renderEndOffset: 1, renderedText: "A", styleKey: base.measurement.styleKey },
        { inlineId: "page-1", kind: "generated-page-number", generatedOwnerFingerprint: `sha256:${"d".repeat(64)}`, renderStartOffset: 1, renderEndOffset: 2, renderedText: "1", styleKey: base.measurement.styleKey },
        { inlineId: "break-1", kind: "hard-break", renderStartOffset: 2, renderEndOffset: 3, renderedText: "\n" },
        { inlineId: "field-b", kind: "resolved-field", fieldKey: "sample.b", renderStartOffset: 3, renderEndOffset: 4, renderedText: "B", styleKey: base.measurement.styleKey },
      ],
    },
    paragraphStyle: { ...base.paragraphStyle, fontFaceId: fontFace.fontFaceId },
    shapingRuns: [
      {
        shapingRunId: "shape-a-page",
        renderStartOffset: 0,
        renderEndOffset: 2,
        text: "A1",
        styleKey,
        fontFaceId: fontFace.fontFaceId,
        fontSizeLayoutUnit: base.paragraphStyle.fontSizeLayoutUnit,
        textColor: base.paragraphStyle.textColor,
        direction: "ltr",
        baselineShiftLayoutUnit: 0,
        features: [],
        clusters: [
          { index: 0, renderStartOffset: 0, renderEndOffset: 1, advanceLayoutUnit: 6_000_000 },
          { index: 1, renderStartOffset: 1, renderEndOffset: 2, advanceLayoutUnit: 6_000_000 },
        ],
      },
      {
        shapingRunId: "shape-field-b",
        renderStartOffset: 3,
        renderEndOffset: 4,
        text: "B",
        styleKey,
        fontFaceId: fontFace.fontFaceId,
        fontSizeLayoutUnit: base.paragraphStyle.fontSizeLayoutUnit,
        textColor: base.paragraphStyle.textColor,
        direction: "ltr",
        baselineShiftLayoutUnit: 0,
        features: [],
        clusters: [{ index: 0, renderStartOffset: 3, renderEndOffset: 4, advanceLayoutUnit: 6_000_000 }],
      },
    ],
    breakOffsets: [0, 3, 4],
    lines: [
      { index: 0, renderStartOffset: 0, renderEndOffset: 3 },
      { index: 1, renderStartOffset: 3, renderEndOffset: 4 },
    ],
  }
  const acceptedLayout = acceptVNextTextBlockMultiRunLayoutV1(request)
  if (acceptedLayout.status !== "accepted") throw new Error("persistent atomic fixture did not layout")
  return { request, acceptedLayout }
}

export function clonePersistentFlowRequest(
  request: VNextTextBlockMultiRunLayoutRequestV1,
): VNextTextBlockMultiRunLayoutRequestV1 {
  return structuredClone(request)
}
```

Create `tests/textBlockPersistentFlowTreeV1.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import {
  VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1,
  collectVNextTextBlockPersistentFlowNodesForQaV1,
  createVNextTextBlockPersistentFlowTreeV1,
  inspectVNextTextBlockPersistentFlowTreeV1,
} from "../src/index.js"
import {
  acceptedPersistentAtomicFlowFixture,
  acceptedPersistentFlowFixture,
} from "./helpers/textBlockPersistentFlowV1.js"

describe("TextBlock persistent flow tree v1", () => {
  it("pins policy and projects accepted mixed Text Run and field facts", () => {
    const fixture = acceptedPersistentFlowFixture()
    const first = createVNextTextBlockPersistentFlowTreeV1(fixture)
    const second = createVNextTextBlockPersistentFlowTreeV1(fixture)
    if (first.status !== "accepted" || second.status !== "accepted") {
      throw new Error("persistent flow tree blocked")
    }

    expect(VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1).toMatchObject({
      maximumItemRenderedUtf16Length: 256,
      maximumLeafItems: 8,
      maximumBranchChildren: 8,
      fingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
    })
    expect(first.tree).toEqual(second.tree)
    expect(first.tree.summary).toMatchObject({
      renderedUtf16Length: fixture.request.measurement.renderedText.length,
      itemCount: expect.any(Number),
      leafCount: expect.any(Number),
      sourceRunCount: fixture.request.measurement.runs.length,
    })
    expect(first.tree.summary.itemCount).toBeGreaterThanOrEqual(
      fixture.request.measurement.runs.length,
    )
    expect(first.tree.itemsByKind).toMatchObject({ text: 3, "resolved-field": 1 })
    expect(inspectVNextTextBlockPersistentFlowTreeV1(first.tree)).toEqual({
      status: "valid",
      fingerprint: first.tree.fingerprint,
    })
    expect(Object.isFrozen(first.tree)).toBe(true)
    expect(collectVNextTextBlockPersistentFlowNodesForQaV1(first.tree).every(Object.isFrozen)).toBe(true)
  })

  it("keeps node fingerprints offset-independent and fails closed", () => {
    const fixture = acceptedPersistentFlowFixture()
    const accepted = createVNextTextBlockPersistentFlowTreeV1(fixture)
    if (accepted.status !== "accepted") throw new Error("persistent flow tree blocked")
    const serialized = JSON.stringify(accepted.tree.root)
    expect(serialized).not.toContain("renderStartOffset")
    expect(serialized).not.toContain("renderEndOffset")

    expect(createVNextTextBlockPersistentFlowTreeV1({
      request: { ...fixture.request, bindProductionLayout: true },
      acceptedLayout: fixture.acceptedLayout,
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "production-binding-forbidden" }],
    })
    expect(inspectVNextTextBlockPersistentFlowTreeV1(structuredClone(accepted.tree))).toMatchObject({
      status: "invalid",
      code: "tree-provenance-mismatch",
    })
  })

  it("retains generated page numbers and hard breaks as explicit flow items", () => {
    const fixture = acceptedPersistentAtomicFlowFixture()
    const result = createVNextTextBlockPersistentFlowTreeV1(fixture)
    if (result.status !== "accepted") throw new Error("persistent atomic tree blocked")
    expect(result.tree.itemsByKind).toMatchObject({
      text: 1,
      "resolved-field": 1,
      "generated-page-number": 1,
      "hard-break": 1,
    })
    expect(result.tree.summary).toMatchObject({ atomicSourceCount: 3, mandatoryBreakCount: 1 })
  })
})
```

- [ ] **Step 2: Run the tests to verify the public boundary is missing**

Run:

```bash
npx vitest run tests/textBlockPersistentFlowTreeV1.test.ts
```

Expected: FAIL because the persistent flow exports do not exist.

- [ ] **Step 3: Define the exact policy and immutable contract**

Create `src/layout/textBlockPersistentFlowContractV1.ts`. Define the following public shape; item cluster offsets are local to `renderedText` and node summaries are the only source of cumulative offsets:

```ts
import type { VNextTextBlockV4MeasurementRun } from "../pagination/textBlockV4Measurement.js"
import type { VNextTextBlockMultiRunLayoutRequestV1 } from "./textBlockMultiRunLayoutContractV1.js"

export const VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_SOURCE =
  "vnext-text-block-persistent-flow-tree-v1" as const
export const VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_VERSION = 1 as const

export interface VNextTextBlockPersistentFlowPolicyV1 {
  policyVersion: 1
  maximumItemRenderedUtf16Length: 256
  maximumLeafItems: 8
  maximumBranchChildren: 8
  fingerprint: string
}

export type VNextTextBlockPersistentFlowItemKindV1 = Exclude<
  VNextTextBlockV4MeasurementRun["kind"],
  "inline-image"
>

export interface VNextTextBlockPersistentFlowClusterV1 {
  startUtf16: number
  endUtf16: number
  advanceLayoutUnit: number
  styleKey: string
  fontFaceId: string
  fontSizeLayoutUnit: number
  textColor: string
  direction: "ltr"
  baselineShiftLayoutUnit: 0
  features: readonly string[]
}

export interface VNextTextBlockPersistentFlowItemV1 {
  kind: VNextTextBlockPersistentFlowItemKindV1
  inlineId: string
  fieldKey?: string
  generatedOwnerFingerprint?: string
  styleKey?: string
  localStyle?: VNextTextBlockV4MeasurementRun["localStyle"]
  renderedText: string
  authoredUtf16Length: number
  beginsSourceRun: boolean
  endsSourceRun: boolean
  atomicSourceContribution: 0 | 1
  mandatoryBreakContribution: 0 | 1
  clusters: readonly VNextTextBlockPersistentFlowClusterV1[]
  dependencyFingerprint: string
  semanticFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockPersistentFlowSummaryV1 {
  renderedUtf16Length: number
  authoredUtf16Length: number
  itemCount: number
  leafCount: number
  nodeCount: number
  sourceRunCount: number
  atomicSourceCount: number
  mandatoryBreakCount: number
  semanticFingerprint: string
}

export interface VNextTextBlockPersistentFlowLeafV1 {
  nodeKind: "leaf"
  height: 0
  items: readonly VNextTextBlockPersistentFlowItemV1[]
  summary: VNextTextBlockPersistentFlowSummaryV1
  fingerprint: string
}

export interface VNextTextBlockPersistentFlowBranchV1 {
  nodeKind: "branch"
  height: number
  children: readonly VNextTextBlockPersistentFlowNodeV1[]
  summary: VNextTextBlockPersistentFlowSummaryV1
  fingerprint: string
}

export type VNextTextBlockPersistentFlowNodeV1 =
  | VNextTextBlockPersistentFlowLeafV1
  | VNextTextBlockPersistentFlowBranchV1

export interface VNextTextBlockPersistentFlowTreeV1 {
  source: typeof VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_VERSION
  documentId: string
  sectionId: string
  textBlockId: string
  instanceRevision: number
  layoutContextFingerprint: string
  policy: VNextTextBlockPersistentFlowPolicyV1
  root: VNextTextBlockPersistentFlowNodeV1
  summary: VNextTextBlockPersistentFlowSummaryV1
  itemsByKind: Readonly<Record<VNextTextBlockPersistentFlowItemKindV1, number>>
  contracts: {
    offsetIndependentItems: true
    balancedLeafDepth: true
    coreOwnedMerkleFingerprints: true
    processLocalImmutableTree: true
    stagedCoverageCompatible: true
    stagedEditorApply: false
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export type VNextTextBlockPersistentFlowIssueCodeV1 =
  | "production-binding-forbidden"
  | "complete-layout-mismatch"
  | "unsupported-flow-run"
  | "invalid-source-ranges"
  | "invalid-cluster-coverage"
  | "unsafe-tree-summary"

export type VNextTextBlockPersistentFlowBuildResultV1 =
  | { status: "accepted"; tree: VNextTextBlockPersistentFlowTreeV1; issues: [] }
  | {
      status: "blocked"
      tree: null
      issues: Array<{ code: VNextTextBlockPersistentFlowIssueCodeV1; message: string }>
    }

export type VNextTextBlockPersistentFlowBuildInputV1 = {
  request: VNextTextBlockMultiRunLayoutRequestV1
  acceptedLayout: import("./textBlockMultiRunIncrementalContractV1.js")
    .VNextTextBlockAcceptedMultiRunLayoutV1
}
```

Build `VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1` from canonical policy facts and include its fingerprint; do not hard-code the digest string.

- [ ] **Step 4: Implement accepted-request projection and balanced construction**

Create `src/layout/textBlockPersistentFlowTreeInternalsV1.ts` first. It must export these repo-internal helpers with exact signatures for the facade and Task 2 update module; do not re-export this file from `src/index.ts`:

```ts
export function compactPersistentFlowFactsV1(value: unknown): string
export function deepFreezePersistentFlowV1<T>(value: T): T
export function deeplyFrozenPersistentFlowV1(value: unknown): boolean
export function partitionPersistentFlowValuesV1<T>(values: readonly T[], maximum: number): T[][]
export function projectVNextTextBlockPersistentFlowItemsForRangeV1(input: {
  request: VNextTextBlockMultiRunLayoutRequestV1
  renderStartOffset: number
  renderEndOffset: number
}):
  | { status: "accepted"; items: VNextTextBlockPersistentFlowItemV1[]; itemsByKind: Record<VNextTextBlockPersistentFlowItemKindV1, number> }
  | { status: "blocked"; code: VNextTextBlockPersistentFlowIssueCodeV1; message: string }
export function createVNextTextBlockPersistentFlowLeafInternalV1(
  items: readonly VNextTextBlockPersistentFlowItemV1[],
): VNextTextBlockPersistentFlowLeafV1
export function createVNextTextBlockPersistentFlowBranchInternalV1(
  children: readonly VNextTextBlockPersistentFlowNodeV1[],
): VNextTextBlockPersistentFlowBranchV1
export function buildVNextTextBlockPersistentFlowRootInternalV1(
  leaves: readonly VNextTextBlockPersistentFlowLeafV1[],
): VNextTextBlockPersistentFlowNodeV1
export function countVNextTextBlockPersistentFlowNodesInternalV1(
  root: VNextTextBlockPersistentFlowNodeV1,
): number
export function registerVNextTextBlockPersistentFlowTreeInternalV1(
  tree: VNextTextBlockPersistentFlowTreeV1,
): void
export function hasVNextTextBlockPersistentFlowTreeProvenanceInternalV1(
  tree: object,
): boolean
```

Implement the shared deterministic helpers exactly with canonical JSON and balanced partitions:

```ts
const processLocalPersistentFlowTreesV1 = new WeakSet<object>()

export function compactPersistentFlowFactsV1(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

export function deepFreezePersistentFlowV1<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  Object.values(value).forEach((child) => deepFreezePersistentFlowV1(child))
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

export function deeplyFrozenPersistentFlowV1(value: unknown): boolean {
  if (value == null || typeof value !== "object" || !Object.isFrozen(value)) return false
  return Object.values(value).every((child) => (
    child == null || typeof child !== "object" || deeplyFrozenPersistentFlowV1(child)
  ))
}

export function partitionPersistentFlowValuesV1<T>(
  values: readonly T[],
  maximum: number,
): T[][] {
  if (values.length === 0 || !Number.isSafeInteger(maximum) || maximum < 2) return []
  const groupCount = Math.ceil(values.length / maximum)
  const base = Math.floor(values.length / groupCount)
  const remainder = values.length % groupCount
  const groups: T[][] = []
  let cursor = 0
  for (let index = 0; index < groupCount; index += 1) {
    const size = base + (index < remainder ? 1 : 0)
    groups.push(values.slice(cursor, cursor + size))
    cursor += size
  }
  return groups
}

export function registerVNextTextBlockPersistentFlowTreeInternalV1(
  tree: VNextTextBlockPersistentFlowTreeV1,
): void {
  processLocalPersistentFlowTreesV1.add(tree)
}

export function hasVNextTextBlockPersistentFlowTreeProvenanceInternalV1(
  tree: object,
): boolean {
  return processLocalPersistentFlowTreesV1.has(tree)
}
```

All safe-integer summary addition must use one helper that returns `null` on overflow. Leaf summaries are composed from item lengths/contributions. Branch summaries are composed only from ordered child summaries and fingerprints. `projectVNextTextBlockPersistentFlowItemsForRangeV1(...)` is the single projection implementation used by both initial creation and range updates.

Then create `src/layout/textBlockPersistentFlowTreeV1.ts` with these responsibilities:

```ts
function blocked(
  code: VNextTextBlockPersistentFlowIssueCodeV1,
  message: string,
): VNextTextBlockPersistentFlowBuildResultV1 {
  return { status: "blocked", tree: null, issues: [{ code, message }] }
}

export function createVNextTextBlockPersistentFlowTreeV1(
  input: VNextTextBlockPersistentFlowBuildInputV1,
): VNextTextBlockPersistentFlowBuildResultV1 {
  if (input.request.bindProductionLayout === true) return blocked(
    "production-binding-forbidden",
    "persistent flow foundation cannot bind production layout",
  )
  const reproduced = acceptVNextTextBlockMultiRunLayoutV1(input.request)
  if (reproduced.status !== "accepted" || !sameVNextCanonicalJson(reproduced, input.acceptedLayout)) {
    return blocked("complete-layout-mismatch", "tree creation requires the exact accepted MR1 layout")
  }
  const projected = projectVNextTextBlockPersistentFlowItemsForRangeV1({
    request: input.request,
    renderStartOffset: 0,
    renderEndOffset: input.request.measurement.renderedText.length,
  })
  if (projected.status === "blocked") return projected
  const leaves = partitionPersistentFlowValuesV1(
    projected.items,
    VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumLeafItems,
  ).map(createVNextTextBlockPersistentFlowLeafInternalV1)
  const root = buildVNextTextBlockPersistentFlowRootInternalV1(leaves)
  const layoutContextFingerprint = compactPersistentFlowFactsV1({
    layoutId: input.request.layoutId,
    documentId: input.request.measurement.documentId,
    sectionId: input.request.measurement.sectionId,
    textBlockId: input.request.measurement.textBlockId,
    measurementProfileId: input.request.measurement.measurementProfileId,
    layoutUnitPolicyFingerprint: input.request.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: input.request.availableWidthLayoutUnit,
    declaredLineHeightLayoutUnit: input.request.declaredLineHeightLayoutUnit,
    paragraphStyle: input.request.paragraphStyle,
    fontFaces: input.request.fontFaces,
  })
  const facts = {
    source: VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_VERSION,
    documentId: input.request.measurement.documentId,
    sectionId: input.request.measurement.sectionId,
    textBlockId: input.request.measurement.textBlockId,
    instanceRevision: input.request.measurement.instanceRevision,
    layoutContextFingerprint,
    policy: VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1,
    root,
    summary: root.summary,
    itemsByKind: projected.itemsByKind,
    contracts: {
      offsetIndependentItems: true as const,
      balancedLeafDepth: true as const,
      coreOwnedMerkleFingerprints: true as const,
      processLocalImmutableTree: true as const,
      stagedCoverageCompatible: true as const,
      stagedEditorApply: false as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    },
  }
  const tree = deepFreezePersistentFlowV1({
    ...facts,
    fingerprint: compactPersistentFlowFactsV1(facts),
  })
  registerVNextTextBlockPersistentFlowTreeInternalV1(tree)
  return { status: "accepted", tree, issues: [] }
}
```

`projectVNextTextBlockPersistentFlowItemsForRangeV1(...)` performs one initial complete projection when called with the full range. For each measurement run, select the accepted clusters inside that run, reject gaps/overlaps and inline images, split only at safe cluster ends so each item has at most `256` rendered UTF-16 units, normalize cluster offsets to the item start, and include run/style/field/generated facts in `dependencyFingerprint`. A hard break becomes one cluster-free item with `mandatoryBreakContribution: 1`. Text chunks contribute their rendered length to `authoredUtf16Length`; resolved-field and generated-page-number runs contribute one authored unit only on their first chunk.

Node fingerprints must be computed from policy version, ordered child/item fingerprints, and composed summaries using `stringifyVNextCanonicalJson(...)`. Tree identity and `instanceRevision` belong only to the tree envelope so unchanged nodes can be reused across revisions.

Implement inspection and QA traversal exactly as process-local boundaries:

```ts
export function inspectVNextTextBlockPersistentFlowTreeV1(
  tree: unknown,
): { status: "valid"; fingerprint: string } | {
  status: "invalid"
  code: "tree-provenance-mismatch" | "tree-not-deeply-frozen"
  message: string
} {
  if (
    tree == null
    || typeof tree !== "object"
    || !hasVNextTextBlockPersistentFlowTreeProvenanceInternalV1(tree)
  ) return {
    status: "invalid",
    code: "tree-provenance-mismatch",
    message: "tree is not the exact process-local object created by Core",
  }
  if (!deeplyFrozenPersistentFlowV1(tree)) return {
    status: "invalid",
    code: "tree-not-deeply-frozen",
    message: "registered persistent flow tree must remain recursively frozen",
  }
  return { status: "valid", fingerprint: (tree as VNextTextBlockPersistentFlowTreeV1).fingerprint }
}

export function collectVNextTextBlockPersistentFlowNodesForQaV1(
  tree: VNextTextBlockPersistentFlowTreeV1,
): VNextTextBlockPersistentFlowNodeV1[] {
  const nodes: VNextTextBlockPersistentFlowNodeV1[] = []
  const visit = (node: VNextTextBlockPersistentFlowNodeV1): void => {
    nodes.push(node)
    if (node.nodeKind === "branch") node.children.forEach(visit)
  }
  visit(tree.root)
  return nodes
}
```

- [ ] **Step 5: Export the boundary and run focused verification**

Add to `src/index.ts`:

```ts
export * from "./layout/textBlockPersistentFlowContractV1.js"
export * from "./layout/textBlockPersistentFlowTreeV1.js"
```

Run:

```bash
npx vitest run tests/textBlockPersistentFlowTreeV1.test.ts
npm run type-check
```

Expected: the tree test passes and TypeScript reports no errors.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/layout/textBlockPersistentFlowContractV1.ts src/layout/textBlockPersistentFlowTreeInternalsV1.ts src/layout/textBlockPersistentFlowTreeV1.ts tests/helpers/textBlockPersistentFlowV1.ts tests/textBlockPersistentFlowTreeV1.test.ts src/index.ts
git commit -m "feat: add persistent TextBlock flow tree"
```

---

### Task 2: Structurally Shared Rendered-Range Update

**Files:**
- Create: `src/layout/textBlockPersistentFlowUpdateV1.ts`
- Create: `tests/textBlockPersistentFlowUpdateV1.test.ts`
- Modify: `src/layout/textBlockPersistentFlowContractV1.ts`
- Modify: `src/layout/textBlockPersistentFlowTreeInternalsV1.ts`
- Modify: `src/layout/textBlockPersistentFlowTreeV1.ts`
- Modify: `tests/helpers/textBlockPersistentFlowV1.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: a registered previous tree, previous/next MR1 requests, `VNextTextBlockMultiRunIncrementalEditV1`, and `VNextTextBlockMultiRunIncrementalWindowProofV1`.
- Produces: `VNextTextBlockPersistentFlowUpdateV1`, `createVNextTextBlockPersistentFlowUpdateV1(...)`, and `inspectVNextTextBlockPersistentFlowUpdateV1(...)`.

- [ ] **Step 1: Write failing structural-sharing and fail-closed tests**

Create `tests/textBlockPersistentFlowUpdateV1.test.ts` around a long accepted request and one middle insertion. The test must assert object identity, not only equal fingerprints:

```ts
import { describe, expect, it } from "vitest"
import {
  collectVNextTextBlockPersistentFlowNodesForQaV1,
  createVNextTextBlockPersistentFlowTreeV1,
  createVNextTextBlockPersistentFlowUpdateV1,
  inspectVNextTextBlockPersistentFlowUpdateV1,
} from "../src/index.js"
import { persistentFlowEditFixture } from "./helpers/textBlockPersistentFlowV1.js"

describe("TextBlock persistent flow update v1", () => {
  it("path-copies the affected range and reuses untouched nodes", () => {
    const fixture = persistentFlowEditFixture()
    const initial = createVNextTextBlockPersistentFlowTreeV1({
      request: fixture.previousRequest,
      acceptedLayout: fixture.previousLayout,
    })
    if (initial.status !== "accepted") throw new Error("initial tree blocked")
    const update = createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: initial.tree,
      previousRequest: fixture.previousRequest,
      nextRequest: fixture.nextRequest,
      edit: fixture.edit,
      window: fixture.window,
    })
    if (update.status !== "accepted") throw new Error(update.issues[0]?.message)

    const previousNodes = new Set(collectVNextTextBlockPersistentFlowNodesForQaV1(initial.tree))
    const nextNodes = collectVNextTextBlockPersistentFlowNodesForQaV1(update.nextTree)
    expect(nextNodes.filter((node) => previousNodes.has(node)).length).toBe(update.work.reusedNodeCount)
    expect(update.work).toMatchObject({
      completeTreeRebuildCount: 0,
      completeSemanticPassCount: 0,
      replacedPreviousRenderedUtf16Length: expect.any(Number),
      projectedNextRenderedUtf16Length: expect.any(Number),
      reusedNodeCount: expect.any(Number),
      createdNodeCount: expect.any(Number),
      createdNodeCanonicalByteCount: expect.any(Number),
    })
    expect(update.work.reusedNodeCount).toBeGreaterThan(0)
    expect(update.nextTree.summary.renderedUtf16Length).toBe(
      fixture.nextRequest.measurement.renderedText.length,
    )
    expect(inspectVNextTextBlockPersistentFlowUpdateV1({
      update: update.update,
      previousTree: initial.tree,
      previousRequest: fixture.previousRequest,
      nextRequest: fixture.nextRequest,
      edit: fixture.edit,
      window: fixture.window,
    })).toEqual({ status: "valid" })
  })

  it("rejects cloned provenance, stale revisions, context drift, and suffix-style drift", () => {
    const fixture = persistentFlowEditFixture()
    const initial = createVNextTextBlockPersistentFlowTreeV1({
      request: fixture.previousRequest,
      acceptedLayout: fixture.previousLayout,
    })
    if (initial.status !== "accepted") throw new Error("initial tree blocked")
    const invoke = (nextRequest = fixture.nextRequest, previousTree = initial.tree) =>
      createVNextTextBlockPersistentFlowUpdateV1({
        previousTree,
        previousRequest: fixture.previousRequest,
        nextRequest,
        edit: fixture.edit,
        window: fixture.window,
      })
    expect(invoke(fixture.nextRequest, structuredClone(initial.tree))).toMatchObject({
      status: "blocked",
      issues: [{ code: "tree-provenance-mismatch" }],
    })
    expect(invoke({
      ...fixture.nextRequest,
      measurement: { ...fixture.nextRequest.measurement, instanceRevision: 70 },
    })).toMatchObject({ status: "blocked", issues: [{ code: "invalid-revision" }] })
    expect(invoke({
      ...fixture.nextRequest,
      availableWidthLayoutUnit: fixture.nextRequest.availableWidthLayoutUnit + 1,
    })).toMatchObject({ status: "blocked", issues: [{ code: "layout-context-mismatch" }] })
  })
})
```

Extend `tests/helpers/textBlockPersistentFlowV1.ts` with a deterministic 5,000-unit request. It uses accepted one-unit clusters and explicit line ranges so the update test does not depend on WASM setup:

```ts
import { createVNextTextBlockMultiRunIncrementalSnapshotV1 } from "../../src/index.js"

function linearLines(length: number, inserted: boolean) {
  return Array.from({ length: 50 }, (_, index) => {
    if (!inserted || index < 24) return {
      index,
      renderStartOffset: index * 100,
      renderEndOffset: Math.min((index + 1) * 100, length),
    }
    if (index === 24) return { index, renderStartOffset: 2_400, renderEndOffset: 2_501 }
    return {
      index,
      renderStartOffset: index * 100 + 1,
      renderEndOffset: Math.min((index + 1) * 100 + 1, length),
    }
  })
}

function linearRequest(instanceRevision: number, text: string, inserted: boolean) {
  const base = legacyTextOnlyLayoutRequestFixture()
  const fontFace = base.fontFaces[0]!
  const styleKey = base.shapingRuns[0]!.styleKey
  return {
    layoutId: "persistent-flow-linear-layout",
    measurement: {
      documentId: "persistent-flow-document",
      instanceRevision,
      sectionId: "section-main",
      textBlockId: "persistent-flow-block",
      availableWidthPt: 200,
      measurementProfileId: "persistent-flow-profile",
      styleKey: base.measurement.styleKey,
      renderedText: text,
      runs: [{
        inlineId: "long-text",
        kind: "text" as const,
        renderStartOffset: 0,
        renderEndOffset: text.length,
        renderedText: text,
        styleKey: base.measurement.styleKey,
      }],
    },
    layoutUnitPolicyFingerprint: base.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: 200_000_000,
    declaredLineHeightLayoutUnit: 14_000_000,
    paragraphStyle: { ...base.paragraphStyle, fontFaceId: fontFace.fontFaceId },
    fontFaces: [structuredClone(fontFace)],
    shapingRuns: [{
      shapingRunId: `persistent-flow-shape-${instanceRevision}`,
      renderStartOffset: 0,
      renderEndOffset: text.length,
      text,
      styleKey,
      fontFaceId: fontFace.fontFaceId,
      fontSizeLayoutUnit: base.paragraphStyle.fontSizeLayoutUnit,
      textColor: base.paragraphStyle.textColor,
      direction: "ltr" as const,
      baselineShiftLayoutUnit: 0 as const,
      features: [] as string[],
      clusters: Array.from(text, (_, index) => ({
        index,
        renderStartOffset: index,
        renderEndOffset: index + 1,
        advanceLayoutUnit: 1_000_000,
      })),
    }],
    breakOffsets: Array.from({ length: text.length + 1 }, (_, index) => index),
    lines: linearLines(text.length, inserted),
  } satisfies VNextTextBlockMultiRunLayoutRequestV1
}

export function persistentFlowEditFixture() {
  const previousText = "a".repeat(5_000)
  const nextText = `${previousText.slice(0, 2_450)}X${previousText.slice(2_450)}`
  const previousRequest = linearRequest(70, previousText, false)
  const nextRequest = linearRequest(71, nextText, true)
  const previousLayout = acceptVNextTextBlockMultiRunLayoutV1(previousRequest)
  const nextLayout = acceptVNextTextBlockMultiRunLayoutV1(nextRequest)
  if (previousLayout.status !== "accepted" || nextLayout.status !== "accepted") {
    throw new Error("persistent flow linear fixture did not layout")
  }
  const snapshot = createVNextTextBlockMultiRunIncrementalSnapshotV1({
    request: previousRequest,
    acceptedLayout: previousLayout,
  })
  const previousSuffixSemanticFingerprint = snapshot.suffixSemanticFingerprints[26]!
  const previousSuffixSemanticRangeFingerprint = snapshot.suffixSemanticRangeFingerprints[26]!
  return {
    previousRequest,
    previousLayout,
    nextRequest,
    nextLayout,
    edit: {
      previousStartOffset: 2_450,
      previousEndOffset: 2_450,
      nextEndOffset: 2_451,
    },
    window: {
      previousRestartLineIndex: 23,
      nextRestartLineIndex: 23,
      previousReconvergenceLineIndex: 26,
      nextReconvergenceLineIndex: 26,
      previousReconvergenceOffset: 2_600,
      nextReconvergenceOffset: 2_601,
      offsetDelta: 1,
      stableLineCount: 2,
      previousSuffixSemanticFingerprint,
      nextSuffixSemanticFingerprint: previousSuffixSemanticFingerprint,
      previousSuffixSemanticRangeFingerprint,
      nextSuffixSemanticRangeFingerprint: previousSuffixSemanticRangeFingerprint,
    },
  }
}
```

- [ ] **Step 2: Run the update test and confirm the API is missing**

Run:

```bash
npx vitest run tests/textBlockPersistentFlowUpdateV1.test.ts
```

Expected: FAIL because `createVNextTextBlockPersistentFlowUpdateV1` is not exported.

- [ ] **Step 3: Add update contracts and work facts**

Append these contracts to `src/layout/textBlockPersistentFlowContractV1.ts`:

```ts
export type VNextTextBlockPersistentFlowUpdateIssueCodeV1 =
  | "tree-provenance-mismatch"
  | "layout-context-mismatch"
  | "invalid-revision"
  | "invalid-edit"
  | "invalid-window"
  | "source-topology-mismatch"
  | "range-projection-failed"
  | "unsafe-tree-summary"

export interface VNextTextBlockPersistentFlowUpdateV1 {
  source: "vnext-text-block-persistent-flow-update-v1"
  contractVersion: 1
  previousTreeFingerprint: string
  nextTree: VNextTextBlockPersistentFlowTreeV1
  previousRange: { startUtf16: number; endUtf16: number }
  nextRange: { startUtf16: number; endUtf16: number }
  work: {
    previousNodeCount: number
    nextNodeCount: number
    reusedNodeCount: number
    createdNodeCount: number
    createdNodeCanonicalByteCount: number
    replacedLeafCount: number
    replacedPreviousRenderedUtf16Length: number
    projectedNextRenderedUtf16Length: number
    completeTreeRebuildCount: 0
    completeSemanticPassCount: 0
  }
  contracts: {
    pathCopyUpdate: true
    prefixSuffixStructuralSharing: true
    offsetIndependentSuffixReuse: true
    processLocalProofBinding: true
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export type VNextTextBlockPersistentFlowUpdateResultV1 =
  | { status: "accepted"; update: VNextTextBlockPersistentFlowUpdateV1; nextTree: VNextTextBlockPersistentFlowTreeV1; work: VNextTextBlockPersistentFlowUpdateV1["work"]; issues: [] }
  | { status: "blocked"; update: null; nextTree: null; work: null; issues: Array<{ code: VNextTextBlockPersistentFlowUpdateIssueCodeV1; message: string }> }
```

- [ ] **Step 4: Implement rendered-range splitting and path copying**

Create `src/layout/textBlockPersistentFlowUpdateV1.ts`. The core replacement algorithm must retain nodes wholly outside the affected leaf range and rebuild only intersecting ancestors:

```ts
function replaceLeafRange(input: {
  node: VNextTextBlockPersistentFlowNodeV1
  subtreeStartLeaf: number
  replaceStartLeaf: number
  replaceEndLeafExclusive: number
  replacementLeaves: readonly VNextTextBlockPersistentFlowLeafV1[]
  inserted: { value: boolean }
}): VNextTextBlockPersistentFlowNodeV1[] {
  const subtreeEndLeaf = input.subtreeStartLeaf + input.node.summary.leafCount
  if (subtreeEndLeaf <= input.replaceStartLeaf || input.subtreeStartLeaf >= input.replaceEndLeafExclusive) {
    return [input.node]
  }
  if (input.node.nodeKind === "leaf") {
    if (input.inserted.value) return []
    input.inserted.value = true
    return [...input.replacementLeaves]
  }
  const children: VNextTextBlockPersistentFlowNodeV1[] = []
  let childStart = input.subtreeStartLeaf
  for (const child of input.node.children) {
    children.push(...replaceLeafRange({
      ...input,
      node: child,
      subtreeStartLeaf: childStart,
    }))
    childStart += child.summary.leafCount
  }
  return partitionPersistentFlowValuesV1(
    children,
    VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumBranchChildren,
  ).map(createVNextTextBlockPersistentFlowBranchInternalV1)
}
```

Implement tree navigation by cumulative `renderedUtf16Length`. If a replacement boundary falls inside a flow item, split that item only at a safe UTF-16 and cluster boundary, normalize the retained fragment's local cluster offsets, and create a new fingerprint. Project the next range from `nextRequest` between `nextRequest.lines[window.nextRestartLineIndex].renderStartOffset` and `nextRequest.lines[window.nextReconvergenceLineIndex].renderStartOffset`. The previous range uses the corresponding previous line starts.

Before replacement, validate:

1. exact tree provenance;
2. unchanged layout context;
3. strictly increasing `instanceRevision`;
4. exact insert/delete/replace reconstruction;
5. source-run kind, inline id, field key, generated owner, style key, and local style outside the edited source run;
6. exact restart/reconvergence offsets and offset delta; and
7. cluster-safe range projection.

After replacement, collapse a single-child root, build higher roots when replacement splits overflow a branch, verify equal leaf depth, safe summaries, and exact next rendered length. Determine reused/created nodes by object identity; compute `createdNodeCanonicalByteCount` as the UTF-8 byte length of canonical JSON for only the created nodes. This deterministic memory proxy enters work evidence, while host heap usage remains diagnostic and non-gating. Register both the next tree and update result in process-local Weak collections. Bind the update to the exact previous tree, previous request, next request, edit, and window through a `WeakMap`.

Implement inspection by checking that exact binding plus the update fingerprint; cloned updates and any different request object must fail.

- [ ] **Step 5: Export and run update plus tree tests**

Add to `src/index.ts`:

```ts
export * from "./layout/textBlockPersistentFlowUpdateV1.js"
```

Run:

```bash
npx vitest run tests/textBlockPersistentFlowTreeV1.test.ts tests/textBlockPersistentFlowUpdateV1.test.ts
npm run type-check
```

Expected: both files pass and TypeScript reports no errors.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/layout/textBlockPersistentFlowContractV1.ts src/layout/textBlockPersistentFlowTreeInternalsV1.ts src/layout/textBlockPersistentFlowTreeV1.ts src/layout/textBlockPersistentFlowUpdateV1.ts tests/helpers/textBlockPersistentFlowV1.ts tests/textBlockPersistentFlowUpdateV1.test.ts src/index.ts
git commit -m "feat: add structural TextBlock flow updates"
```

---

### Task 3: Bounded Semantic Line-Window Checkpoints

**Files:**
- Create: `tests/textBlockMultiRunSemanticWindowV1.test.ts`
- Modify: `src/layout/textBlockMultiRunSemanticV1.ts`

**Interfaces:**
- Consumes: one valid next measurement, resolved shaping runs, line ranges, and an explicit line window.
- Produces: `VNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1` and `createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1(...)`.

- [ ] **Step 1: Write the failing bounded-window equivalence test**

Create `tests/textBlockMultiRunSemanticWindowV1.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockMultiRunSemanticRangeLineCheckpointsV1,
  createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1,
} from "../src/index.js"
import { persistentFlowEditFixture } from "./helpers/textBlockPersistentFlowV1.js"

describe("TextBlock multi-run bounded semantic window v1", () => {
  it("matches the complete oracle for only the selected lines", () => {
    const fixture = persistentFlowEditFixture()
    const request = fixture.nextRequest
    const start = fixture.window.nextRestartLineIndex
    const end = Math.min(
      request.lines.length,
      fixture.window.nextReconvergenceLineIndex + fixture.window.stableLineCount,
    )
    const complete = createVNextTextBlockMultiRunSemanticRangeLineCheckpointsV1({
      measurement: request.measurement,
      shapingRuns: request.shapingRuns,
      lines: request.lines,
    })
    const bounded = createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1({
      measurement: request.measurement,
      shapingRuns: request.shapingRuns,
      lines: request.lines,
      lineStartIndex: start,
      lineEndIndexExclusive: end,
    })
    if (complete == null || bounded.status !== "accepted") throw new Error("semantic fixture blocked")

    expect(bounded.lineFingerprints).toEqual(complete.lineFingerprints.slice(start, end))
    expect(bounded.work).toMatchObject({
      lineFingerprintCount: end - start,
      completeSemanticPassCount: 0,
      visitedClusterCount: expect.any(Number),
      visitedSourceRunCount: expect.any(Number),
    })
    expect(bounded.work.lineFingerprintCount).toBeLessThan(request.lines.length)
  })

  it("rejects invalid, gapped, and cluster-splitting windows", () => {
    const fixture = persistentFlowEditFixture()
    const request = fixture.nextRequest
    expect(createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1({
      measurement: request.measurement,
      shapingRuns: request.shapingRuns,
      lines: request.lines,
      lineStartIndex: -1,
      lineEndIndexExclusive: 1,
    })).toMatchObject({ status: "blocked", code: "invalid-line-window" })
    const lines = structuredClone(request.lines)
    lines[fixture.window.nextRestartLineIndex]!.renderStartOffset += 1
    expect(createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1({
      measurement: request.measurement,
      shapingRuns: request.shapingRuns,
      lines,
      lineStartIndex: fixture.window.nextRestartLineIndex,
      lineEndIndexExclusive: fixture.window.nextReconvergenceLineIndex + 1,
    })).toMatchObject({ status: "blocked" })
  })
})
```

- [ ] **Step 2: Run the test and verify the bounded API is absent**

Run:

```bash
npx vitest run tests/textBlockMultiRunSemanticWindowV1.test.ts
```

Expected: FAIL because `createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1` is not exported.

- [ ] **Step 3: Implement one-pass bounded semantic derivation**

Add to `src/layout/textBlockMultiRunSemanticV1.ts`:

```ts
export type VNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1 =
  | {
      status: "accepted"
      lineStartIndex: number
      lineEndIndexExclusive: number
      lineFingerprints: string[]
      work: {
        lineFingerprintCount: number
        visitedShapingRunCount: number
        visitedClusterCount: number
        visitedSourceRunCount: number
        completeSemanticPassCount: 0
      }
    }
  | {
      status: "blocked"
      code: "invalid-line-window" | "invalid-line-range" | "invalid-cluster-range" | "invalid-source-range"
      message: string
    }
```

Implement `lowerBound(...)` over sorted `renderEndOffset` values, then derive only selected lines. Initialize shaping/source cursors once at the selected first line and move them monotonically; do not call the complete checkpoint function and do not flatten all clusters:

```ts
function lowerBoundByEnd<T extends { renderEndOffset: number }>(
  values: readonly T[],
  offset: number,
): number {
  let low = 0
  let high = values.length
  while (low < high) {
    const middle = low + Math.floor((high - low) / 2)
    if (values[middle]!.renderEndOffset <= offset) low = middle + 1
    else high = middle
  }
  return low
}

export function createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1(input: {
  measurement: VNextTextBlockV4MeasurementRequest
  shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
  lines: readonly VNextTextBlockMultiRunLineInputV1[]
  lineStartIndex: number
  lineEndIndexExclusive: number
}): VNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1 {
  if (
    !Number.isSafeInteger(input.lineStartIndex)
    || !Number.isSafeInteger(input.lineEndIndexExclusive)
    || input.lineStartIndex < 0
    || input.lineEndIndexExclusive <= input.lineStartIndex
    || input.lineEndIndexExclusive > input.lines.length
  ) return { status: "blocked", code: "invalid-line-window", message: "line window is outside request lines" }

  const selected = input.lines.slice(input.lineStartIndex, input.lineEndIndexExclusive)
  const first = selected[0]!
  const last = selected.at(-1)!
  let expectedStart = first.renderStartOffset
  for (const line of selected) {
    if (
      line.renderStartOffset !== expectedStart
      || line.renderEndOffset <= line.renderStartOffset
      || line.renderEndOffset > input.measurement.renderedText.length
    ) return { status: "blocked", code: "invalid-line-range", message: "selected lines are not contiguous" }
    expectedStart = line.renderEndOffset
  }

  const shapingStart = lowerBoundByEnd(input.shapingRuns, first.renderStartOffset)
  const sourceStart = lowerBoundByEnd(input.measurement.runs, first.renderStartOffset)
  const shaping = input.shapingRuns.slice(shapingStart).filter((run) => run.renderStartOffset < last.renderEndOffset)
  const sourceRuns = input.measurement.runs.slice(sourceStart).filter((run) => run.renderStartOffset < last.renderEndOffset)
  let visitedClusterCount = 0
  const lineFingerprints: string[] = []
  for (const line of selected) {
    const facts = createSemanticRangeFactsFromBoundedInputs({
      measurement: input.measurement,
      shapingRuns: shaping,
      sourceRuns,
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
    })
    if (facts == null) return {
      status: "blocked",
      code: "invalid-cluster-range",
      message: "selected line does not contain complete bounded semantic facts",
    }
    visitedClusterCount += facts.clusters.length
    lineFingerprints.push(createVNextCompactFingerprint(JSON.stringify(facts)))
  }
  return {
    status: "accepted",
    lineStartIndex: input.lineStartIndex,
    lineEndIndexExclusive: input.lineEndIndexExclusive,
    lineFingerprints,
    work: {
      lineFingerprintCount: lineFingerprints.length,
      visitedShapingRunCount: shaping.length,
      visitedClusterCount,
      visitedSourceRunCount: sourceRuns.length,
      completeSemanticPassCount: 0,
    },
  }
}
```

`createSemanticRangeFactsFromBoundedInputs(...)` must contain the same normalized semantic facts as `createVNextTextBlockMultiRunSemanticRangeFactsV1(...)`, but it receives already bounded source/shaping runs and rejects any cluster that crosses the selected line.

- [ ] **Step 4: Run complete-oracle equivalence and regressions**

Run:

```bash
npx vitest run tests/textBlockMultiRunSemanticWindowV1.test.ts tests/textEngineIncrementalRangeExecutionV1.test.ts
npm run type-check
```

Expected: both files pass; existing complete checkpoint behavior is unchanged.

- [ ] **Step 5: Commit Task 3**

```bash
git add src/layout/textBlockMultiRunSemanticV1.ts tests/textBlockMultiRunSemanticWindowV1.test.ts
git commit -m "feat: add bounded semantic window checkpoints"
```

---

### Task 4: Persistent Tree Snapshot And Zero-Full-Pass Core Proof

**Files:**
- Modify: `src/layout/textBlockMultiRunIncrementalContractV1.ts`
- Modify: `src/layout/textBlockMultiRunIncrementalSnapshotV1.ts`
- Modify: `src/layout/textBlockMultiRunIncrementalSemanticCheckpointV1.ts`
- Modify: `src/layout/textBlockMultiRunIncrementalAcceptanceV1.ts`
- Modify: `tests/textEngineIncrementalRangeExecutionV1.test.ts`

**Interfaces:**
- Consumes: the accepted persistent tree, one registered structural update, and bounded semantic line-window facts.
- Produces: snapshots containing `persistentFlowTree`, checkpoint proofs with `completeNextSemanticPassCount: 0`, and acceptance work that reports tree reuse.

- [ ] **Step 1: Change the direct Core proof test to require a persistent update**

Add `createVNextTextBlockPersistentFlowUpdateV1` to the Core imports in `tests/textEngineIncrementalRangeExecutionV1.test.ts`. In `proveCoreComposition(...)`, create the update before the semantic proof:

```ts
const persistentFlowUpdate = createVNextTextBlockPersistentFlowUpdateV1({
  previousTree: coreSnapshot.persistentFlowTree,
  previousRequest: coreSnapshot.request,
  nextRequest: fixture.nextOracle.request,
  edit: fixture.changed.edit,
  window: result.affectedWindow.checkpoint,
})
if (persistentFlowUpdate.status !== "accepted") {
  throw new Error(persistentFlowUpdate.issues[0]?.message)
}
const semanticCheckpointProof = createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
  snapshot: coreSnapshot,
  nextRequest: fixture.nextOracle.request,
  edit: fixture.changed.edit,
  window: result.affectedWindow.checkpoint,
  persistentFlowUpdate: persistentFlowUpdate.update,
})
```

Change the main work expectation to:

```ts
semanticCheckpointProof: {
  status: "checkpoint-accepted",
  work: {
    completePreviousSemanticPassCount: 0,
    completeNextSemanticPassCount: 0,
    boundedNextSemanticPassCount: 1,
    completeSemanticRangeHashCount: 0,
    persistentFlowUpdateAccepted: true,
  },
},
```

Add tamper rows proving that a cloned tree/update, a different exact request object, changed unaffected source-run style, and a suffix cluster advance drift cannot produce an accepted proof. Keep the optional complete-oracle equality checks unchanged.

- [ ] **Step 2: Run the focused test and verify it fails on the old proof contract**

Run:

```bash
npx vitest run tests/textEngineIncrementalRangeExecutionV1.test.ts
```

Expected: FAIL because snapshots lack `persistentFlowTree`, the proof does not accept `persistentFlowUpdate`, and the old counter is `1`.

- [ ] **Step 3: Retain the tree in every Core incremental snapshot**

Modify `VNextTextBlockMultiRunIncrementalSnapshotV1` in `src/layout/textBlockMultiRunIncrementalContractV1.ts`:

```ts
persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
```

Add these snapshot contracts:

```ts
persistentFlowTreeRetained: true
offsetIndependentFlowItems: true
stagedCoverageCompatible: true
```

In `createVNextTextBlockMultiRunIncrementalSnapshotV1(...)`, build the tree immediately after reproducing the accepted complete layout:

```ts
const persistentFlow = createVNextTextBlockPersistentFlowTreeV1({
  request: input.request,
  acceptedLayout: input.acceptedLayout,
})
if (persistentFlow.status !== "accepted") {
  throw new Error(`incremental snapshot persistent flow blocked: ${persistentFlow.issues[0]?.message}`)
}
```

Include `persistentFlowTree: persistentFlow.tree` in the frozen snapshot facts and fingerprint. The tree is constructed once per retained snapshot, never once per plan or proof.

- [ ] **Step 4: Replace complete next chains with bounded composition**

Change `createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1(...)` to require:

```ts
persistentFlowUpdate: VNextTextBlockPersistentFlowUpdateV1
```

Add `persistent-flow-update-mismatch` to the proof fallback-code union. Inspect the exact update binding first and return that fallback when the update is cloned, stale, or bound to another request. Remove the call that builds `nextChains` over every next line. Derive only affected plus stable lines:

```ts
const boundedEnd = Math.min(
  input.nextRequest.lines.length,
  input.window.nextReconvergenceLineIndex + input.window.stableLineCount,
)
const bounded = createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1({
  measurement: input.nextRequest.measurement,
  shapingRuns: input.nextRequest.shapingRuns,
  lines: input.nextRequest.lines,
  lineStartIndex: input.window.nextRestartLineIndex,
  lineEndIndexExclusive: boundedEnd,
})
if (bounded.status !== "accepted") return fallback(
  "semantic-checkpoint-derivation-failed",
  bounded.message,
)

const affectedCount = input.window.nextReconvergenceLineIndex - input.window.nextRestartLineIndex
const stableFingerprints = bounded.lineFingerprints.slice(affectedCount)
const previousStableFingerprints = input.snapshot.semanticRangeLineFingerprints.slice(
  input.window.previousReconvergenceLineIndex,
  input.window.previousReconvergenceLineIndex + stableFingerprints.length,
)
if (!sameJson(stableFingerprints, previousStableFingerprints)) return fallback(
  "suffix-semantic-mismatch",
  "bounded stable lines do not prove retained suffix semantics",
)
```

Use the retained previous prefix checkpoint, the bounded affected line fingerprints, and retained previous suffix checkpoint to build a compositional proof fingerprint. The next prefix/suffix fingerprint values are equal to the corresponding retained values because the registered flow update proves prefix/suffix structural reuse; do not claim they were recomputed.

Change accepted work facts to exactly:

```ts
work: {
  retainedCheckpointLookupCount: 2 as const,
  nextSemanticLineFingerprintCount: bounded.lineFingerprints.length,
  completePreviousSemanticPassCount: 0 as const,
  completeNextSemanticPassCount: 0 as const,
  boundedNextSemanticPassCount: 1 as const,
  completeSemanticRangeHashCount: 0 as const,
  persistentFlowUpdateAccepted: true as const,
  reusedPersistentNodeCount: input.persistentFlowUpdate.work.reusedNodeCount,
  createdPersistentNodeCount: input.persistentFlowUpdate.work.createdNodeCount,
},
```

Bind the proof WeakMap to the exact snapshot, next request, and persistent update. Update proof inspection to reject any different or cloned update. Add `persistentFlowStructuralSharing: true` and `boundedNextSemanticCheckpoints: true` to contracts.

- [ ] **Step 5: Propagate zero-full-pass facts into Core acceptance**

Keep `acceptVNextTextBlockMultiRunIncrementalWindowV1(...)` positioning behavior unchanged. Add these accepted `work` fields from the inspected proof:

```ts
completeNextSemanticPassCount: 0 as const,
reusedPersistentNodeCount: input.semanticCheckpointProof.work.reusedPersistentNodeCount,
createdPersistentNodeCount: input.semanticCheckpointProof.work.createdPersistentNodeCount,
```

Add the contract facts:

```ts
persistentFlowStructuralSharing: true
completeNextSemanticPassCount: 0
```

Do not remove `validMeasurement(...)`, `validShapingFacts(...)`, `validBreaksAndLines(...)`, optional full materialization, or MR1 layout acceptance in this task. The handoff must state that Phase 2 removes the complete semantic checkpoint pass, not every remaining complete validation/materialization path.

- [ ] **Step 6: Run Core proof, tree, and semantic tests**

Run:

```bash
npx vitest run tests/textBlockPersistentFlowTreeV1.test.ts tests/textBlockPersistentFlowUpdateV1.test.ts tests/textBlockMultiRunSemanticWindowV1.test.ts tests/textEngineIncrementalRangeExecutionV1.test.ts
npm run type-check
```

Expected: all four files pass; direct materialized layouts remain equal to the complete MR1 oracle; every accepted proof reports zero complete next semantic passes.

- [ ] **Step 7: Commit Task 4**

```bash
git add src/layout/textBlockMultiRunIncrementalContractV1.ts src/layout/textBlockMultiRunIncrementalSnapshotV1.ts src/layout/textBlockMultiRunIncrementalSemanticCheckpointV1.ts src/layout/textBlockMultiRunIncrementalAcceptanceV1.ts tests/textEngineIncrementalRangeExecutionV1.test.ts
git commit -m "feat: compose incremental proof from persistent flow"
```

---

### Task 5: Actual-WASM Execution And Diagnostic Integration

**Files:**
- Modify: `packages/text-engine-rust-wasm/src/incrementalCoreExecution.ts`
- Modify: `packages/text-engine-rust-wasm/src/incrementalRetainedSnapshot.ts`
- Modify: `tests/textEngineIncrementalRangeExecutionV1.test.ts`

**Interfaces:**
- Consumes: the existing MR1 range plan, range shaping/splice facts, affected-line checkpoint, and retained Core snapshot.
- Produces: an accepted `persistentFlowUpdate`, a new `persistent-flow-update` diagnostic phase, and retained tree summary evidence.

- [ ] **Step 1: Add actual-WASM expectations before changing execution**

Extend the oracle-independent execution assertion in `tests/textEngineIncrementalRangeExecutionV1.test.ts`:

```ts
expect(result).toMatchObject({
  status: "incremental-core-accepted",
  persistentFlowUpdate: {
    status: "accepted",
    work: {
      completeTreeRebuildCount: 0,
      completeSemanticPassCount: 0,
      reusedNodeCount: expect.any(Number),
      createdNodeCount: expect.any(Number),
    },
  },
  semanticCheckpointProof: {
    work: { completeNextSemanticPassCount: 0 },
  },
})
expect(result.persistentFlowUpdate.work.reusedNodeCount).toBeGreaterThan(0)
```

For `profileFlowDocTextEngineIncrementalCorePlanV1(...)`, require the ordered phase list to contain `persistent-flow-update` between `affected-line-assembly` and `core-incremental-acceptance`. Timing stays diagnostic-only and outside deterministic fingerprints.

- [ ] **Step 2: Run the actual-WASM test and verify integration is absent**

Run:

```bash
npx vitest run tests/textEngineIncrementalRangeExecutionV1.test.ts
```

Expected: FAIL because execution does not return a persistent update or profile phase.

- [ ] **Step 3: Create the update in the adapter orchestration without moving authority out of Core**

In `packages/text-engine-rust-wasm/src/incrementalCoreExecution.ts`, import `createVNextTextBlockPersistentFlowUpdateV1` and its accepted result type. Add `"persistent-flow-update"` to `FlowDocTextEngineIncrementalCoreProfilePhaseV1`.

After affected-line assembly and complete `request` construction, but before the checkpoint proof, add:

```ts
const persistentFlowUpdate = createVNextTextBlockPersistentFlowUpdateV1({
  previousTree: incrementalCoreSnapshot.persistentFlowTree,
  previousRequest: incrementalCoreSnapshot.request,
  nextRequest: request,
  edit: input.plan.edit,
  window: affectedWindow.checkpoint,
})
if (persistentFlowUpdate.status !== "accepted") return fallback(
  "persistent-flow-update-failed",
  `${persistentFlowUpdate.issues[0]?.code}: ${persistentFlowUpdate.issues[0]?.message}`,
)
profile?.complete("persistent-flow-update")

const semanticCheckpointProof = createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
  snapshot: incrementalCoreSnapshot,
  nextRequest: request,
  edit: input.plan.edit,
  window: affectedWindow.checkpoint,
  persistentFlowUpdate: persistentFlowUpdate.update,
})
```

Add `persistent-flow-update-failed` to the execution fallback union. Return the accepted update beside `affectedWindow`; return `null` in every fallback shape. Do not serialize it across Worker boundaries or label it publishable.

- [ ] **Step 4: Retain initial tree identity in the external snapshot summary**

In `FlowDocTextEngineIncrementalRetainedSnapshotV1`, add:

```ts
persistentFlow: {
  treeFingerprint: string
  policyFingerprint: string
  itemCount: number
  leafCount: number
  nodeCount: number
}
```

Populate it from the already created Core snapshot:

```ts
const persistentFlow = {
  treeFingerprint: incrementalCoreSnapshot.persistentFlowTree.fingerprint,
  policyFingerprint: incrementalCoreSnapshot.persistentFlowTree.policy.fingerprint,
  itemCount: incrementalCoreSnapshot.persistentFlowTree.summary.itemCount,
  leafCount: incrementalCoreSnapshot.persistentFlowTree.summary.leafCount,
  nodeCount: incrementalCoreSnapshot.persistentFlowTree.summary.nodeCount,
}
```

Add `persistentFlowTreeRetained: true` to external snapshot contracts. Keep process-local Core tree access in the existing WeakMap; the external snapshot summary is evidence, not hydration authority.

- [ ] **Step 5: Run actual-WASM and composed focused verification**

Run:

```bash
npx vitest run tests/textEngineIncrementalRetainedPlanV1.test.ts tests/textEngineIncrementalRangeExecutionV1.test.ts tests/textBlockPersistentFlowTreeV1.test.ts tests/textBlockPersistentFlowUpdateV1.test.ts tests/textBlockMultiRunSemanticWindowV1.test.ts
npm run type-check
```

Expected: all five files pass. The four existing actual-WASM edit families remain exact with and without optional complete-oracle QA, and profiling includes a separate persistent update duration.

- [ ] **Step 6: Commit Task 5**

```bash
git add packages/text-engine-rust-wasm/src/incrementalCoreExecution.ts packages/text-engine-rust-wasm/src/incrementalRetainedSnapshot.ts tests/textEngineIncrementalRangeExecutionV1.test.ts
git commit -m "feat(text-engine): integrate persistent flow execution"
```

---

### Task 6: Scale Evidence, Handoff, And Full Gate

**Files:**
- Create: `tests/liveDraftMr1PersistentFlowFoundation.test.ts`
- Create: `docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md`
- Modify: `docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md`
- Modify: `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`
- Modify: `docs/PHASE_LEDGER.md`

**Interfaces:**
- Consumes: all accepted Phase 2 contracts and actual-WASM work facts.
- Produces: retained Phase 2 evidence, exact scope guards, and the Phase 3 handoff pointer.

- [ ] **Step 1: Write the failing documentation and scope guard**

Create `tests/liveDraftMr1PersistentFlowFoundation.test.ts`:

```ts
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string): string => readFileSync(resolve(path), "utf8")

describe("Live Draft MR1 persistent flow foundation handoff", () => {
  it("records bounded structural sharing without overclaiming product readiness", () => {
    const handoff = read("docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md")
    expect(handoff).toContain("completeNextSemanticPassCount: 0")
    expect(handoff).toContain("Persistent B+ flow rope")
    expect(handoff).toContain("stagedCoverageCompatible: true")
    expect(handoff).toContain("Phase 3: Core Spatial Wrapping 3A")
    expect(handoff).toMatch(/Editor product binding.*NO-GO/s)
    expect(handoff).toMatch(/inline image.*NO-GO/is)
    expect(handoff).toMatch(/list decoration.*NO-GO/is)
    expect(handoff).toMatch(/mayPublishLayout: false/)
    expect(handoff).toMatch(/productionBinding: false/)
  })

  it("keeps the public boundary and cross-runtime pointer aligned", () => {
    const publicIndex = read("src/index.ts")
    const crossRuntime = read("docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const ledger = read("docs/PHASE_LEDGER.md")
    expect(publicIndex).toContain("textBlockPersistentFlowContractV1.js")
    expect(publicIndex).toContain("textBlockPersistentFlowTreeV1.js")
    expect(publicIndex).toContain("textBlockPersistentFlowUpdateV1.js")
    expect(crossRuntime).toContain("LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md")
    expect(crossRuntime).toContain("Phase 3: Core Spatial Wrapping 3A")
    expect(ledger).toContain("MR1-Q Persistent Flow Tree Foundation")
  })
})
```

- [ ] **Step 2: Run the guard and verify the handoff is missing**

Run:

```bash
npx vitest run tests/liveDraftMr1PersistentFlowFoundation.test.ts
```

Expected: FAIL because the Phase 2 handoff does not exist.

- [ ] **Step 3: Write the Phase 2 handoff with factual evidence only**

Create `docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md` with these exact sections:

1. `Status` — accepted bounded Core/MR1 QA checkpoint; all product/publication gates remain closed.
2. `Outcome` — policy constants, offset-independent items, balanced equal leaf depth, path-copy update, Core-owned Merkle fingerprints, bounded semantic window, and zero complete next semantic passes.
3. `Capability Matrix` — text, mixed Text Runs, resolved fields, generated page numbers, and hard breaks ready in the tree; inline images, lists, empty blocks, positioned objects, and spatial wrapping blocked or not present.
4. `Structural Work Evidence` — initial item/leaf/node counts, replaced range length, reused/created node counts, affected/stable line counts, and reconvergence for each accepted actual-WASM edit family. Report deterministic counters from test results; do not turn host timing into a product budget.
5. `Feedback Lane Compatibility` — `stagedCoverageCompatible: true` means stable ordered identity and resumable range references only; no Editor state or staged apply is implemented.
6. `PASS`, `FAIL / BLOCKER`, `RISK`, and `UNKNOWN` — state explicitly that complete request validation, complete shaping/break arrays, optional QA materialization, and product memory/frame budgets remain later work.
7. `Verification` — list every focused command and final full-gate result.
8. `Next Checkpoint` — Phase 3 Core Spatial Wrapping 3A; do not start list/image geometry or Editor binding inside Phase 3.

Use the phase label `MR1-Q Persistent Flow Tree Foundation` consistently.

- [ ] **Step 4: Update authoritative pointers**

In `docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md`, change only the next-checkpoint paragraph to say Phase 2 is accepted and link its handoff.

In `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`:

- add Phase 2 to the current Core truth;
- link the new handoff in required reading;
- change the first-next-task pointer to Phase 3 Core Spatial Wrapping 3A; and
- retain B1 as compatibility evidence, not Editor implementation.

Append a `MR1-Q Persistent Flow Tree Foundation` entry to `docs/PHASE_LEDGER.md` with exact scope, tests, blockers, and next pointer.

- [ ] **Step 5: Run the combined focused gate**

Run:

```bash
npx vitest run tests/liveDraftMr1PersistentFlowFoundation.test.ts tests/liveDraftMr1CompleteGeometryBoundary.test.ts tests/textBlockPersistentFlowTreeV1.test.ts tests/textBlockPersistentFlowUpdateV1.test.ts tests/textBlockMultiRunSemanticWindowV1.test.ts tests/textEngineIncrementalRetainedPlanV1.test.ts tests/textEngineIncrementalRangeExecutionV1.test.ts
npm run type-check
git diff --check
```

Expected: seven test files pass, TypeScript reports no errors, and the diff check is empty.

- [ ] **Step 6: Run the full Core gate**

Run:

```bash
npm run check
```

Expected: type-check and the complete Vitest suite pass. Record the actual file/test totals in `docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md` before committing.

- [ ] **Step 7: Audit the staged scope and commit Phase 2**

Run:

```bash
git status --short
git diff --cached --check
```

Stage only Phase 2 files, then commit:

```bash
git add src/layout/textBlockPersistentFlowContractV1.ts src/layout/textBlockPersistentFlowTreeInternalsV1.ts src/layout/textBlockPersistentFlowTreeV1.ts src/layout/textBlockPersistentFlowUpdateV1.ts src/layout/textBlockMultiRunSemanticV1.ts src/layout/textBlockMultiRunIncrementalContractV1.ts src/layout/textBlockMultiRunIncrementalSnapshotV1.ts src/layout/textBlockMultiRunIncrementalSemanticCheckpointV1.ts src/layout/textBlockMultiRunIncrementalAcceptanceV1.ts src/index.ts packages/text-engine-rust-wasm/src/incrementalCoreExecution.ts packages/text-engine-rust-wasm/src/incrementalRetainedSnapshot.ts tests/helpers/textBlockPersistentFlowV1.ts tests/textBlockPersistentFlowTreeV1.test.ts tests/textBlockPersistentFlowUpdateV1.test.ts tests/textBlockMultiRunSemanticWindowV1.test.ts tests/textEngineIncrementalRangeExecutionV1.test.ts tests/liveDraftMr1PersistentFlowFoundation.test.ts docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md docs/PHASE_LEDGER.md
git commit -m "docs: hand off persistent TextBlock flow foundation"
```

Expected final state: Phase 2 is committed coherently on its implementation branch, the working tree contains no Phase 2 changes, and the next authorized implementation checkpoint is Phase 3 Core Spatial Wrapping 3A.
