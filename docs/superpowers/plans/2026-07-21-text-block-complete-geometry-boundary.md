# TextBlock Complete Geometry Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 1 of the Persistent TextBlock Spatial Flow design: a strict, immutable Initial TextBlock Flow boundary that retains every currently known geometry dependency, reports unsupported list/image/empty geometry honestly, and bridges only the accepted text subset into the existing MR1 layout.

**Architecture:** Add a Core-owned parent-region contract, then classify one canonical/resolved TextBlock plus its measurement, authored-box, typography, and unit-policy facts into a fingerprinted Initial TextBlock Flow input. Keep the current multi-run layout unchanged behind an explicit text-subset adapter; list decoration, inline-image line boxes, persistent trees, and spatial wrapping remain later phases.

**Tech Stack:** TypeScript 6 ESM, Zod 4, Vitest 4, existing FlowDoc compact SHA-256 fingerprints, existing micro-point integer layout policy.

## Global Constraints

- Keep the canonical Document v4 schema unchanged.
- Keep `VNEXT_LAYOUT_UNITS_PER_POINT` exactly `1_000_000` and compare accepted geometry as safe integers.
- Core owns validation, capability classification, fingerprints, and fail-closed decisions.
- Every accepted or classified result reports `mayPublishLayout: false` and `productionBinding: false`.
- Do not implement persistent B+ rope nodes, positioned objects, Flow Region Provider behavior, list markers, inline-image baseline math, table auto-fit, Editor binding, Backend routes, or publication in this phase.
- Preserve the existing `VNextTextBlockMultiRunLayoutRequestV1` and `acceptVNextTextBlockMultiRunLayoutV1(...)` behavior unchanged.
- Unknown, stale, mismatched, or omitted geometry blocks; no approximation, clipping, fallback bullet, or inferred image metric is permitted.
- Keep files focused: parent-region ownership, Initial Flow classification, and the legacy adapter remain separate modules.
- Use TDD and commit each task only after its focused checks pass.

## File Map

- Create `src/layout/textBlockInitialFlowParentRegionV1.ts`: construct and inspect immutable parent containing-region facts.
- Create `src/layout/textBlockInitialFlowInputV1.ts`: define Initial Flow atoms/capabilities and classify complete known TextBlock geometry.
- Create `src/layout/textBlockInitialFlowTextOnlyAdapterV1.ts`: bridge only `text-subset-ready` inputs into existing MR1 acceptance.
- Create `tests/helpers/textBlockInitialFlowV1.ts`: shared deterministic fixtures for Initial Flow and legacy layout tests.
- Create `tests/textBlockInitialFlowParentRegionV1.test.ts`: parent-region validation and tamper tests.
- Create `tests/textBlockInitialFlowInputV1.test.ts`: atom projection, capability truth, dependency drift, and immutability tests.
- Create `tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts`: legacy parity and fail-closed adapter tests.
- Modify `src/index.ts`: export the three new Core modules.
- Create `docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md`: evidence handoff for MR1-P.
- Modify `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`: record MR1-P and point the next checkpoint at the persistent flow tree.
- Modify `docs/PHASE_LEDGER.md`: append the accepted MR1-P checkpoint.
- Create `tests/liveDraftMr1CompleteGeometryBoundary.test.ts`: guard capability-honest documentation and public exports.

---

### Task 1: Parent Containing-Region Contract

**Files:**
- Create: `src/layout/textBlockInitialFlowParentRegionV1.ts`
- Create: `tests/textBlockInitialFlowParentRegionV1.test.ts`
- Modify: `src/index.ts:149-165`

**Interfaces:**
- Consumes: `VNextNonNegativeLayoutUnitV1Schema`, `VNextPositiveLayoutUnitV1Schema`, and `createVNextCompactFingerprint(...)`.
- Produces: `VNextTextBlockInitialFlowParentRegionInputV1`, `VNextTextBlockInitialFlowParentRegionV1`, `createVNextTextBlockInitialFlowParentRegionV1(...)`, and `inspectVNextTextBlockInitialFlowParentRegionV1(...)`.

- [ ] **Step 1: Write the failing parent-region tests**

Create `tests/textBlockInitialFlowParentRegionV1.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockInitialFlowParentRegionV1,
  inspectVNextTextBlockInitialFlowParentRegionV1,
} from "../src/index.js"

describe("TextBlock Initial Flow parent region v1", () => {
  it("creates deterministic immutable body, column, and table-cell regions", () => {
    for (const ownerKind of ["body", "column", "table-cell"] as const) {
      const input = {
        ownerKind,
        ownerId: `${ownerKind}-owner`,
        xLayoutUnit: 10_000_000,
        yLayoutUnit: 20_000_000,
        widthLayoutUnit: 100_000_000,
        availableHeightLayoutUnit: ownerKind === "body" ? null : 200_000_000,
      }
      const first = createVNextTextBlockInitialFlowParentRegionV1(input)
      const second = createVNextTextBlockInitialFlowParentRegionV1(input)

      expect(first).toEqual(second)
      expect(first).toMatchObject({
        status: "accepted",
        region: {
          source: "vnext-text-block-initial-flow-parent-region-v1",
          contractVersion: 1,
          kind: "text-block-parent-region",
          ownerKind,
          ownerId: `${ownerKind}-owner`,
          widthLayoutUnit: 100_000_000,
        },
        issues: [],
      })
      if (first.status !== "accepted") throw new Error("parent region blocked")
      expect(inspectVNextTextBlockInitialFlowParentRegionV1(first.region)).toEqual({ status: "valid" })
      expect(Object.isFrozen(first.region)).toBe(true)
    }
  })

  it("blocks invalid geometry and detects fingerprint tampering", () => {
    expect(createVNextTextBlockInitialFlowParentRegionV1({
      ownerKind: "body",
      ownerId: " ",
      xLayoutUnit: -1,
      yLayoutUnit: 0,
      widthLayoutUnit: 0,
      availableHeightLayoutUnit: -1,
    })).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "invalid-parent-region" }),
      ]),
    })

    const accepted = createVNextTextBlockInitialFlowParentRegionV1({
      ownerKind: "table-cell",
      ownerId: "cell-1",
      xLayoutUnit: 0,
      yLayoutUnit: 0,
      widthLayoutUnit: 100_000_000,
      availableHeightLayoutUnit: 200_000_000,
    })
    if (accepted.status !== "accepted") throw new Error("parent region blocked")
    const tampered = JSON.parse(JSON.stringify(accepted.region)) as typeof accepted.region
    tampered.widthLayoutUnit += 1
    expect(inspectVNextTextBlockInitialFlowParentRegionV1(tampered)).toMatchObject({
      status: "invalid",
      code: "parent-region-fingerprint-mismatch",
    })
  })
})
```

- [ ] **Step 2: Run the tests to verify the public contract is missing**

Run:

```bash
npx vitest run tests/textBlockInitialFlowParentRegionV1.test.ts
```

Expected: FAIL because `createVNextTextBlockInitialFlowParentRegionV1` and `inspectVNextTextBlockInitialFlowParentRegionV1` are not exported.

- [ ] **Step 3: Implement the parent-region module**

Create `src/layout/textBlockInitialFlowParentRegionV1.ts`:

```ts
import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  VNextNonNegativeLayoutUnitV1Schema,
  VNextPositiveLayoutUnitV1Schema,
} from "./layoutUnitPolicyV1.js"

export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_SOURCE =
  "vnext-text-block-initial-flow-parent-region-v1" as const
export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_VERSION = 1 as const

export type VNextTextBlockInitialFlowParentOwnerKindV1 = "body" | "column" | "table-cell"

export interface VNextTextBlockInitialFlowParentRegionInputV1 {
  ownerKind: VNextTextBlockInitialFlowParentOwnerKindV1
  ownerId: string
  xLayoutUnit: number
  yLayoutUnit: number
  widthLayoutUnit: number
  availableHeightLayoutUnit: number | null
}

export interface VNextTextBlockInitialFlowParentRegionV1
  extends VNextTextBlockInitialFlowParentRegionInputV1 {
  source: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_VERSION
  kind: "text-block-parent-region"
  fingerprint: string
}

export interface VNextTextBlockInitialFlowParentRegionIssueV1 {
  code: "invalid-parent-region"
  severity: "error"
  path: string
  message: string
}

export type VNextTextBlockInitialFlowParentRegionResultV1 =
  | { status: "accepted"; region: VNextTextBlockInitialFlowParentRegionV1; issues: [] }
  | { status: "blocked"; region: null; issues: VNextTextBlockInitialFlowParentRegionIssueV1[] }

export type VNextTextBlockInitialFlowParentRegionInspectionV1 =
  | { status: "valid" }
  | {
      status: "invalid"
      code: "invalid-parent-region" | "parent-region-fingerprint-mismatch"
      message: string
    }

const NonBlankStringSchema = z.string().refine((value) => value.trim().length > 0, {
  message: "owner id must not be blank",
})

const InputSchema = z.object({
  ownerKind: z.enum(["body", "column", "table-cell"]),
  ownerId: NonBlankStringSchema,
  xLayoutUnit: VNextNonNegativeLayoutUnitV1Schema,
  yLayoutUnit: VNextNonNegativeLayoutUnitV1Schema,
  widthLayoutUnit: VNextPositiveLayoutUnitV1Schema,
  availableHeightLayoutUnit: VNextPositiveLayoutUnitV1Schema.nullable(),
}).strict()

function issue(path: string, message: string): VNextTextBlockInitialFlowParentRegionIssueV1 {
  return { code: "invalid-parent-region", severity: "error", path, message }
}

function freeze<T>(value: T): T {
  return Object.freeze(value)
}

export function createVNextTextBlockInitialFlowParentRegionV1(
  input: VNextTextBlockInitialFlowParentRegionInputV1,
): VNextTextBlockInitialFlowParentRegionResultV1 {
  const parsed = InputSchema.safeParse(input)
  if (!parsed.success) return {
    status: "blocked",
    region: null,
    issues: parsed.error.issues.map((item) => issue(
      item.path.map(String).join(".") || "parentRegion",
      item.message,
    )),
  }
  const facts = {
    source: VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_VERSION,
    kind: "text-block-parent-region" as const,
    ...parsed.data,
  }
  return {
    status: "accepted",
    region: freeze({
      ...facts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
    }),
    issues: [],
  }
}

export function inspectVNextTextBlockInitialFlowParentRegionV1(
  region: VNextTextBlockInitialFlowParentRegionV1,
): VNextTextBlockInitialFlowParentRegionInspectionV1 {
  if (
    region.source !== VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_SOURCE
    || region.contractVersion !== VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_VERSION
    || region.kind !== "text-block-parent-region"
  ) return {
    status: "invalid",
    code: "invalid-parent-region",
    message: "parent region source, version, or kind is invalid",
  }
  const recreated = createVNextTextBlockInitialFlowParentRegionV1({
    ownerKind: region.ownerKind,
    ownerId: region.ownerId,
    xLayoutUnit: region.xLayoutUnit,
    yLayoutUnit: region.yLayoutUnit,
    widthLayoutUnit: region.widthLayoutUnit,
    availableHeightLayoutUnit: region.availableHeightLayoutUnit,
  })
  if (recreated.status !== "accepted") return {
    status: "invalid",
    code: "invalid-parent-region",
    message: recreated.issues.map((item) => item.message).join("; "),
  }
  return recreated.region.fingerprint === region.fingerprint
    ? { status: "valid" }
    : {
        status: "invalid",
        code: "parent-region-fingerprint-mismatch",
        message: "parent region facts do not match the retained fingerprint",
      }
}
```

Add this export beside the other layout exports in `src/index.ts`:

```ts
export * from "./layout/textBlockInitialFlowParentRegionV1.js"
```

- [ ] **Step 4: Run focused tests and type-check**

Run:

```bash
npx vitest run tests/textBlockInitialFlowParentRegionV1.test.ts
npm run type-check
```

Expected: 2 tests PASS and TypeScript exits successfully.

- [ ] **Step 5: Commit the parent-region boundary**

```bash
git add src/layout/textBlockInitialFlowParentRegionV1.ts tests/textBlockInitialFlowParentRegionV1.test.ts src/index.ts
git commit -m "feat: add TextBlock parent region boundary"
```

---

### Task 2: Complete Initial TextBlock Flow Classification

**Files:**
- Create: `src/layout/textBlockInitialFlowInputV1.ts`
- Create: `tests/helpers/textBlockInitialFlowV1.ts`
- Create: `tests/textBlockInitialFlowInputV1.test.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `VNextTextBlockInitialFlowParentRegionV1`, `VNextTextBlockV4MeasurementRequest`, `VNextAuthoredBoxPlanV1`, `TextBlockNodeV4Target`, current paragraph/font facts, and the accepted LayoutUnitPolicyV1 fingerprint.
- Produces: `VNextTextBlockInitialFlowAtomV1`, `VNextTextBlockInitialFlowCapabilityReportV1`, `VNextTextBlockInitialFlowV1`, and `createVNextTextBlockInitialFlowV1(...)`.

- [ ] **Step 1: Add deterministic shared fixtures**

Create `tests/helpers/textBlockInitialFlowV1.ts`:

```ts
import {
  createVNextAuthoredBoxPlanV1,
  createVNextLayoutUnitPolicyV1,
  createVNextTextBlockInitialFlowParentRegionV1,
  type TextBlockNodeV4Target,
  type VNextTextBlockInitialFlowBuildInputV1,
  type VNextTextBlockMultiRunLayoutRequestV1,
  type VNextTextBlockV4MeasurementRequest,
} from "../../src/index.js"

const fontFaces = [{
  fontFaceId: "sarabun-regular",
  fontFamily: "Sarabun",
  fontSha256: "a".repeat(64),
  weight: 400,
  style: "normal" as const,
  unitsPerEm: 1_000,
  ascentFontUnit: 800,
  descentFontUnit: -200,
  lineGapFontUnit: 100,
}]

const paragraphStyle = {
  styleKey: "paragraph-body",
  fontFaceId: "sarabun-regular",
  fontSizeLayoutUnit: 12_000_000,
  textColor: "202020",
}

function boxAndParent(textBlock: TextBlockNodeV4Target) {
  const box = createVNextAuthoredBoxPlanV1({ ownerNode: textBlock, availableWidthPt: 100 })
  if (box.status !== "ready") throw new Error("box fixture blocked")
  const parent = createVNextTextBlockInitialFlowParentRegionV1({
    ownerKind: "body",
    ownerId: "body-zone",
    xLayoutUnit: 0,
    yLayoutUnit: 0,
    widthLayoutUnit: 100_000_000,
    availableHeightLayoutUnit: null,
  })
  if (parent.status !== "accepted") throw new Error("parent fixture blocked")
  return { authoredBoxPlan: box.plan, parentRegion: parent.region }
}

function buildInput(
  textBlock: TextBlockNodeV4Target,
  measurement: VNextTextBlockV4MeasurementRequest,
): VNextTextBlockInitialFlowBuildInputV1 {
  return {
    textBlock,
    measurement,
    ...boxAndParent(textBlock),
    layoutUnitPolicyFingerprint: createVNextLayoutUnitPolicyV1().fingerprint,
    paragraphStyle,
    fontFaces,
  }
}

export function completeTextGeometryBuildInputFixture(): VNextTextBlockInitialFlowBuildInputV1 {
  const textBlock: TextBlockNodeV4Target = {
    id: "text-block-complete-text",
    type: "text-block",
    role: { role: "paragraph" },
    props: {
      textStyleId: "body",
      box: {
        padding: {
          top: { value: 2, unit: "pt" },
          right: { value: 5, unit: "pt" },
          bottom: { value: 2, unit: "pt" },
          left: { value: 5, unit: "pt" },
        },
      },
    },
    children: [
      { id: "text-a", type: "text", text: "A" },
      { id: "field-b", type: "field-ref", key: "customer.initial" },
      { id: "page-c", type: "page-number" },
      { id: "break", type: "line-break" },
    ],
  }
  return buildInput(textBlock, {
    documentId: "document-1",
    instanceRevision: 7,
    sectionId: "section-1",
    textBlockId: textBlock.id,
    availableWidthPt: 90,
    measurementProfileId: "profile-1",
    styleKey: "paragraph-body",
    renderedText: "AB3\n",
    runs: [
      {
        inlineId: "text-a", kind: "text", renderStartOffset: 0, renderEndOffset: 1,
        renderedText: "A", styleKey: "paragraph-body",
      },
      {
        inlineId: "field-b", kind: "resolved-field", renderStartOffset: 1, renderEndOffset: 2,
        renderedText: "B", fieldKey: "customer.initial", styleKey: "paragraph-body",
      },
      {
        inlineId: "page-c", kind: "generated-page-number", renderStartOffset: 2, renderEndOffset: 3,
        renderedText: "3", generatedOwnerFingerprint: `sha256:${"b".repeat(64)}`,
        styleKey: "paragraph-body",
      },
      {
        inlineId: "break", kind: "hard-break", renderStartOffset: 3, renderEndOffset: 4,
        renderedText: "\n",
      },
    ],
  })
}

export function listImageGeometryBuildInputFixture(): VNextTextBlockInitialFlowBuildInputV1 {
  const frame = {
    width: { value: 10, unit: "pt" as const },
    height: { value: 12, unit: "pt" as const },
    fit: "contain" as const,
  }
  const textBlock: TextBlockNodeV4Target = {
    id: "text-block-list-image",
    type: "text-block",
    role: {
      role: "list-item",
      list: { instanceId: "list-1", level: 1, itemId: "item-1", startAt: 2 },
    },
    props: {
      box: {
        padding: {
          top: { value: 2, unit: "pt" },
          right: { value: 5, unit: "pt" },
          bottom: { value: 2, unit: "pt" },
          left: { value: 5, unit: "pt" },
        },
      },
    },
    children: [
      { id: "text-a", type: "text", text: "A" },
      {
        id: "image-1",
        type: "inline-image",
        source: { kind: "asset-ref", assetId: "asset-1" },
        accessibility: { kind: "decorative" },
        frame,
        verticalAlign: "middle",
      },
    ],
  }
  return buildInput(textBlock, {
    documentId: "document-1",
    instanceRevision: 7,
    sectionId: "section-1",
    textBlockId: textBlock.id,
    availableWidthPt: 90,
    measurementProfileId: "profile-1",
    styleKey: "paragraph-body",
    renderedText: "A\uFFFC",
    runs: [
      {
        inlineId: "text-a", kind: "text", renderStartOffset: 0, renderEndOffset: 1,
        renderedText: "A", styleKey: "paragraph-body",
      },
      {
        inlineId: "image-1", kind: "inline-image", renderStartOffset: 1, renderEndOffset: 2,
        renderedText: "\uFFFC", assetId: "asset-1", frame,
      },
    ],
  })
}

export function legacyTextOnlyBuildInputFixture(): VNextTextBlockInitialFlowBuildInputV1 {
  const textBlock: TextBlockNodeV4Target = {
    id: "text-block-legacy",
    type: "text-block",
    role: { role: "paragraph" },
    props: {
      box: {
        padding: {
          top: { value: 2, unit: "pt" },
          right: { value: 5, unit: "pt" },
          bottom: { value: 2, unit: "pt" },
          left: { value: 5, unit: "pt" },
        },
      },
    },
    children: [{ id: "text-abc", type: "text", text: "ABC" }],
  }
  return buildInput(textBlock, {
    documentId: "document-1",
    instanceRevision: 7,
    sectionId: "section-1",
    textBlockId: textBlock.id,
    availableWidthPt: 90,
    measurementProfileId: "profile-1",
    styleKey: "paragraph-body",
    renderedText: "ABC",
    runs: [{
      inlineId: "text-abc", kind: "text", renderStartOffset: 0, renderEndOffset: 3,
      renderedText: "ABC", styleKey: "paragraph-body",
    }],
  })
}

export function emptyGeometryBuildInputFixture(): VNextTextBlockInitialFlowBuildInputV1 {
  const input = legacyTextOnlyBuildInputFixture()
  input.textBlock = { ...input.textBlock, children: [] }
  input.measurement = { ...input.measurement, renderedText: "", runs: [] }
  return input
}

export function legacyTextOnlyLayoutRequestFixture(): VNextTextBlockMultiRunLayoutRequestV1 {
  const input = legacyTextOnlyBuildInputFixture()
  return {
    layoutId: "layout-legacy-1",
    measurement: input.measurement,
    layoutUnitPolicyFingerprint: input.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: 90_000_000,
    declaredLineHeightLayoutUnit: 14_000_000,
    paragraphStyle: input.paragraphStyle,
    fontFaces: input.fontFaces,
    shapingRuns: [{
      shapingRunId: "shape-abc",
      renderStartOffset: 0,
      renderEndOffset: 3,
      text: "ABC",
      styleKey: "paragraph-body",
      fontFaceId: "sarabun-regular",
      fontSizeLayoutUnit: 12_000_000,
      textColor: "202020",
      direction: "ltr",
      baselineShiftLayoutUnit: 0,
      features: [],
      clusters: [
        { index: 0, renderStartOffset: 0, renderEndOffset: 1, advanceLayoutUnit: 6_000_000 },
        { index: 1, renderStartOffset: 1, renderEndOffset: 2, advanceLayoutUnit: 6_000_000 },
        { index: 2, renderStartOffset: 2, renderEndOffset: 3, advanceLayoutUnit: 6_000_000 },
      ],
    }],
    breakOffsets: [0, 3],
    lines: [{ index: 0, renderStartOffset: 0, renderEndOffset: 3 }],
  }
}
```

- [ ] **Step 2: Write the failing Initial Flow classification tests**

Create `tests/textBlockInitialFlowInputV1.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { createVNextTextBlockInitialFlowV1 } from "../src/index.js"
import {
  completeTextGeometryBuildInputFixture,
  emptyGeometryBuildInputFixture,
  listImageGeometryBuildInputFixture,
} from "./helpers/textBlockInitialFlowV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("TextBlock Initial Flow input v1", () => {
  it("classifies the complete current text subset with all geometry owners pinned", () => {
    const input = completeTextGeometryBuildInputFixture()
    const before = JSON.stringify(input)
    const first = createVNextTextBlockInitialFlowV1(input)
    const second = createVNextTextBlockInitialFlowV1(input)

    expect(first).toEqual(second)
    expect(first).toMatchObject({
      status: "classified",
      flow: {
        source: "vnext-text-block-initial-flow-v1",
        contractVersion: 1,
        layoutDisposition: "text-subset-ready",
        role: { role: "paragraph" },
        capabilities: {
          styledText: "ready",
          resolvedField: "ready",
          generatedPageNumber: "ready",
          hardBreak: "ready",
          inlineImage: "not-present",
          listDecoration: "not-present",
          emptyBlock: "not-present",
          authoredBox: "ready",
          positionedObjects: "not-present",
        },
        contracts: {
          canonicalDocumentMutation: false,
          geometryDependenciesPinned: true,
          textOnlyAdapterEligible: true,
          mayPublishLayout: false,
          productionBinding: false,
        },
      },
      issues: [],
    })
    if (first.status !== "classified") throw new Error("flow blocked")
    expect(first.flow.atoms.map((atom) => atom.kind)).toEqual([
      "text", "resolved-field", "generated-page-number", "hard-break",
    ])
    expect(first.flow.authoredBoxPlan.contentWidthPt).toBe(90)
    expect(Object.isFrozen(first.flow)).toBe(true)
    expect(JSON.stringify(input)).toBe(before)
  })

  it("retains list and complete inline-image facts while blocking unsupported geometry", () => {
    const result = createVNextTextBlockInitialFlowV1(listImageGeometryBuildInputFixture())
    expect(result).toMatchObject({
      status: "classified",
      flow: {
        layoutDisposition: "geometry-contract-required",
        role: {
          role: "list-item",
          list: { instanceId: "list-1", level: 1, itemId: "item-1", startAt: 2 },
        },
        capabilities: {
          inlineImage: "blocked-line-box-contract",
          listDecoration: "blocked-decoration-contract",
          positionedObjects: "not-present",
        },
        contracts: { textOnlyAdapterEligible: false },
      },
    })
    if (result.status !== "classified") throw new Error("flow blocked")
    expect(result.flow.atoms[1]).toMatchObject({
      kind: "inline-image",
      inlineId: "image-1",
      assetId: "asset-1",
      frame: { width: { value: 10, unit: "pt" }, height: { value: 12, unit: "pt" } },
      verticalAlign: "middle",
    })
  })

  it("retains a canonical empty block but reports the missing empty-layout contract", () => {
    expect(createVNextTextBlockInitialFlowV1(emptyGeometryBuildInputFixture())).toMatchObject({
      status: "classified",
      flow: {
        layoutDisposition: "geometry-contract-required",
        atoms: [],
        capabilities: { emptyBlock: "blocked-empty-layout-contract" },
        contracts: { textOnlyAdapterEligible: false },
      },
    })
  })

  it("blocks stale parent, box-width, image-frame, and typography facts", () => {
    const parent = completeTextGeometryBuildInputFixture()
    parent.parentRegion = clone(parent.parentRegion)
    parent.parentRegion.widthLayoutUnit += 1

    const width = completeTextGeometryBuildInputFixture()
    width.measurement = clone(width.measurement)
    width.measurement.availableWidthPt = 91

    const image = listImageGeometryBuildInputFixture()
    image.measurement = clone(image.measurement)
    const imageRun = image.measurement.runs[1]
    if (imageRun?.kind !== "inline-image" || imageRun.frame == null) throw new Error("image fixture missing")
    imageRun.frame.width.value = 11

    const style = completeTextGeometryBuildInputFixture()
    style.paragraphStyle = { ...style.paragraphStyle, styleKey: "other-style" }

    expect(createVNextTextBlockInitialFlowV1(parent)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "invalid-parent-region" })]),
    })
    expect(createVNextTextBlockInitialFlowV1(width)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "authored-box-width-mismatch" })]),
    })
    expect(createVNextTextBlockInitialFlowV1(image)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "inline-projection-mismatch" })]),
    })
    expect(createVNextTextBlockInitialFlowV1(style)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "style-context-mismatch" })]),
    })
  })
})
```

- [ ] **Step 3: Run the classification test to verify it fails**

Run:

```bash
npx vitest run tests/textBlockInitialFlowInputV1.test.ts
```

Expected: FAIL because `VNextTextBlockInitialFlowBuildInputV1` and `createVNextTextBlockInitialFlowV1(...)` do not exist.

- [ ] **Step 4: Implement Initial Flow classification**

Create `src/layout/textBlockInitialFlowInputV1.ts`:

```ts
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  createVNextAuthoredBoxPlanV1,
  type VNextAuthoredBoxPlanV1,
} from "../renderer/authoredBoxContractV1.js"
import {
  TextBlockNodeV4TargetSchema,
  type InlineImageV4Target,
  type TextBlockNodeV4Target,
} from "../schema/documentV4ImageTarget.js"
import type { TextBlockRoleV4Target, TextRunStyleV4Target } from "../schema/documentV4Foundation.js"
import type {
  VNextTextBlockV4MeasurementRequest,
  VNextTextBlockV4MeasurementRun,
} from "../pagination/textBlockV4Measurement.js"
import {
  convertVNextPointToLayoutUnitV1,
  createVNextLayoutUnitPolicyV1,
  VNextLayoutUnitV1Schema,
  VNextPositiveLayoutUnitV1Schema,
} from "./layoutUnitPolicyV1.js"
import type {
  VNextTextBlockMultiRunFontFaceV1,
  VNextTextBlockMultiRunParagraphStyleV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import {
  inspectVNextTextBlockInitialFlowParentRegionV1,
  type VNextTextBlockInitialFlowParentRegionV1,
} from "./textBlockInitialFlowParentRegionV1.js"

export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_SOURCE = "vnext-text-block-initial-flow-v1" as const
export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_VERSION = 1 as const

interface AtomBase {
  inlineId: string
  renderStartOffset: number
  renderEndOffset: number
  renderedText: string
}

export type VNextTextBlockInitialFlowAtomV1 =
  | (AtomBase & { kind: "text"; styleKey?: string; localStyle?: TextRunStyleV4Target })
  | (AtomBase & { kind: "resolved-field"; fieldKey: string; styleKey?: string })
  | (AtomBase & { kind: "generated-page-number"; generatedOwnerFingerprint: string; styleKey?: string })
  | (AtomBase & { kind: "hard-break" })
  | (AtomBase & {
      kind: "inline-image"
      assetId: string | null
      frame: InlineImageV4Target["frame"]
      verticalAlign: InlineImageV4Target["verticalAlign"]
    })

export interface VNextTextBlockInitialFlowCapabilityReportV1 {
  styledText: "ready" | "not-present"
  resolvedField: "ready" | "not-present"
  generatedPageNumber: "ready" | "not-present"
  hardBreak: "ready" | "not-present"
  inlineImage: "not-present" | "blocked-line-box-contract"
  listDecoration: "not-present" | "blocked-decoration-contract"
  emptyBlock: "not-present" | "blocked-empty-layout-contract"
  authoredBox: "ready"
  positionedObjects: "not-present"
}

export interface VNextTextBlockInitialFlowBuildInputV1 {
  textBlock: TextBlockNodeV4Target
  measurement: VNextTextBlockV4MeasurementRequest
  authoredBoxPlan: VNextAuthoredBoxPlanV1
  parentRegion: VNextTextBlockInitialFlowParentRegionV1
  layoutUnitPolicyFingerprint: string
  paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1
  fontFaces: VNextTextBlockMultiRunFontFaceV1[]
}

export interface VNextTextBlockInitialFlowV1 {
  source: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_VERSION
  kind: "initial-text-block-flow"
  layoutDisposition: "text-subset-ready" | "geometry-contract-required"
  documentId: string
  instanceRevision: number
  sectionId: string
  textBlockId: string
  role: TextBlockRoleV4Target
  authoredBoxPlan: VNextAuthoredBoxPlanV1
  parentRegion: VNextTextBlockInitialFlowParentRegionV1
  measurement: VNextTextBlockV4MeasurementRequest
  layoutUnitPolicyFingerprint: string
  paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1
  fontFaces: VNextTextBlockMultiRunFontFaceV1[]
  atoms: VNextTextBlockInitialFlowAtomV1[]
  capabilities: VNextTextBlockInitialFlowCapabilityReportV1
  contracts: {
    canonicalDocumentMutation: false
    geometryDependenciesPinned: true
    textOnlyAdapterEligible: boolean
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export type VNextTextBlockInitialFlowIssueCodeV1 =
  | "invalid-text-block"
  | "measurement-identity-mismatch"
  | "invalid-measurement-ranges"
  | "invalid-parent-region"
  | "layout-unit-policy-mismatch"
  | "authored-box-owner-mismatch"
  | "authored-box-fingerprint-mismatch"
  | "authored-box-width-mismatch"
  | "style-context-mismatch"
  | "invalid-font-context"
  | "inline-projection-mismatch"

export interface VNextTextBlockInitialFlowIssueV1 {
  code: VNextTextBlockInitialFlowIssueCodeV1
  severity: "error"
  path: string
  message: string
  inlineId?: string
}

export type VNextTextBlockInitialFlowResultV1 =
  | { status: "classified"; flow: VNextTextBlockInitialFlowV1; issues: [] }
  | { status: "blocked"; flow: null; issues: VNextTextBlockInitialFlowIssueV1[] }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object" || Object.isFrozen(value)) return value
  Object.values(value).forEach((item) => deepFreeze(item))
  return Object.freeze(value)
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function nonBlank(value: string | undefined): value is string {
  return value != null && value.trim().length > 0
}

function issue(
  code: VNextTextBlockInitialFlowIssueCodeV1,
  path: string,
  message: string,
  inlineId?: string,
): VNextTextBlockInitialFlowIssueV1 {
  return { code, severity: "error", path, message, ...(inlineId == null ? {} : { inlineId }) }
}

function expectedKind(type: TextBlockNodeV4Target["children"][number]["type"]): VNextTextBlockV4MeasurementRun["kind"] {
  if (type === "field-ref") return "resolved-field"
  if (type === "page-number") return "generated-page-number"
  if (type === "line-break") return "hard-break"
  return type
}

function validMeasurementRanges(measurement: VNextTextBlockV4MeasurementRequest): boolean {
  let cursor = 0
  for (const run of measurement.runs) {
    if (
      !Number.isSafeInteger(run.renderStartOffset)
      || !Number.isSafeInteger(run.renderEndOffset)
      || run.renderStartOffset !== cursor
      || run.renderEndOffset < run.renderStartOffset
      || run.renderEndOffset > measurement.renderedText.length
      || run.renderedText !== measurement.renderedText.slice(run.renderStartOffset, run.renderEndOffset)
    ) return false
    cursor = run.renderEndOffset
  }
  return cursor === measurement.renderedText.length
}

function validateFonts(input: VNextTextBlockInitialFlowBuildInputV1): boolean {
  if (
    !nonBlank(input.paragraphStyle.styleKey)
    || input.paragraphStyle.styleKey !== input.measurement.styleKey
    || !nonBlank(input.paragraphStyle.fontFaceId)
    || !VNextPositiveLayoutUnitV1Schema.safeParse(input.paragraphStyle.fontSizeLayoutUnit).success
    || !/^[0-9A-Fa-f]{6}$/u.test(input.paragraphStyle.textColor)
  ) return false
  const ids = new Set<string>()
  for (const face of input.fontFaces) {
    if (
      !nonBlank(face.fontFaceId)
      || ids.has(face.fontFaceId)
      || !nonBlank(face.fontFamily)
      || !/^[0-9A-Fa-f]{64}$/u.test(face.fontSha256)
      || !Number.isSafeInteger(face.weight)
      || face.weight <= 0
      || !Number.isSafeInteger(face.unitsPerEm)
      || face.unitsPerEm <= 0
      || !VNextLayoutUnitV1Schema.safeParse(face.ascentFontUnit).success
      || !VNextLayoutUnitV1Schema.safeParse(face.descentFontUnit).success
      || !VNextLayoutUnitV1Schema.safeParse(face.lineGapFontUnit).success
    ) return false
    ids.add(face.fontFaceId)
  }
  return ids.has(input.paragraphStyle.fontFaceId)
}

function projectAtoms(
  textBlock: TextBlockNodeV4Target,
  measurement: VNextTextBlockV4MeasurementRequest,
  issues: VNextTextBlockInitialFlowIssueV1[],
): VNextTextBlockInitialFlowAtomV1[] {
  if (textBlock.children.length !== measurement.runs.length) {
    issues.push(issue(
      "inline-projection-mismatch",
      "measurement.runs",
      "measurement must contain exactly one ordered run for every authored inline",
    ))
    return []
  }
  const atoms: VNextTextBlockInitialFlowAtomV1[] = []
  textBlock.children.forEach((inline, index) => {
    const run = measurement.runs[index]
    const path = `textBlock.children[${index}]`
    if (run == null || run.inlineId !== inline.id || run.kind !== expectedKind(inline.type)) {
      issues.push(issue(
        "inline-projection-mismatch", path,
        "authored inline identity/type must match the measurement run", inline.id,
      ))
      return
    }
    const base = {
      inlineId: inline.id,
      renderStartOffset: run.renderStartOffset,
      renderEndOffset: run.renderEndOffset,
      renderedText: run.renderedText,
    }
    if (inline.type === "text") {
      if (run.renderedText !== inline.text || !sameJson(run.localStyle, inline.style)) {
        issues.push(issue("inline-projection-mismatch", path, "text and local style must match measurement", inline.id))
        return
      }
      atoms.push({ ...base, kind: "text", ...(run.styleKey == null ? {} : { styleKey: run.styleKey }),
        ...(inline.style == null ? {} : { localStyle: clone(inline.style) }) })
      return
    }
    if (inline.type === "field-ref") {
      if (run.fieldKey !== inline.key) {
        issues.push(issue("inline-projection-mismatch", path, "field key must match measurement", inline.id))
        return
      }
      atoms.push({ ...base, kind: "resolved-field", fieldKey: inline.key,
        ...(run.styleKey == null ? {} : { styleKey: run.styleKey }) })
      return
    }
    if (inline.type === "page-number") {
      if (!nonBlank(run.generatedOwnerFingerprint)) {
        issues.push(issue("inline-projection-mismatch", path, "page number owner fingerprint is required", inline.id))
        return
      }
      atoms.push({ ...base, kind: "generated-page-number",
        generatedOwnerFingerprint: run.generatedOwnerFingerprint,
        ...(run.styleKey == null ? {} : { styleKey: run.styleKey }) })
      return
    }
    if (inline.type === "line-break") {
      if (!/^(?:\r\n|\r|\n)$/u.test(run.renderedText)) {
        issues.push(issue("inline-projection-mismatch", path, "hard break must contain one newline sequence", inline.id))
        return
      }
      atoms.push({ ...base, kind: "hard-break" })
      return
    }
    if (
      run.renderedText !== "\uFFFC"
      || !Object.hasOwn(run, "assetId")
      || run.frame == null
      || !sameJson(run.frame, inline.frame)
    ) {
      issues.push(issue("inline-projection-mismatch", path, "inline image asset/frame must match measurement", inline.id))
      return
    }
    atoms.push({
      ...base,
      kind: "inline-image",
      assetId: run.assetId ?? null,
      frame: clone(inline.frame),
      verticalAlign: inline.verticalAlign,
    })
  })
  return atoms
}

export function createVNextTextBlockInitialFlowV1(
  input: VNextTextBlockInitialFlowBuildInputV1,
): VNextTextBlockInitialFlowResultV1 {
  const issues: VNextTextBlockInitialFlowIssueV1[] = []
  const parsed = TextBlockNodeV4TargetSchema.safeParse(input.textBlock)
  if (!parsed.success) parsed.error.issues.forEach((item) => issues.push(issue(
    "invalid-text-block", item.path.map(String).join(".") || "textBlock", item.message,
  )))
  const textBlock = parsed.success ? parsed.data : null
  if (textBlock == null) return { status: "blocked", flow: null, issues }

  if (
    !nonBlank(input.measurement.documentId)
    || !Number.isSafeInteger(input.measurement.instanceRevision)
    || input.measurement.instanceRevision < 0
    || !nonBlank(input.measurement.sectionId)
    || input.measurement.textBlockId !== textBlock.id
  ) issues.push(issue(
    "measurement-identity-mismatch", "measurement",
    "measurement identity and revision must match the authored TextBlock",
  ))
  if (!validMeasurementRanges(input.measurement)) issues.push(issue(
    "invalid-measurement-ranges", "measurement.runs",
    "measurement runs must cover rendered text with ordered gap-free ranges",
  ))

  const parentInspection = inspectVNextTextBlockInitialFlowParentRegionV1(input.parentRegion)
  if (parentInspection.status !== "valid") issues.push(issue(
    "invalid-parent-region", "parentRegion", parentInspection.message,
  ))
  if (input.layoutUnitPolicyFingerprint !== createVNextLayoutUnitPolicyV1().fingerprint) issues.push(issue(
    "layout-unit-policy-mismatch", "layoutUnitPolicyFingerprint",
    "Initial Flow must pin the accepted LayoutUnitPolicyV1 fingerprint",
  ))

  if (input.authoredBoxPlan.ownerNodeId !== textBlock.id || input.authoredBoxPlan.ownerNodeType !== "text-block") {
    issues.push(issue(
      "authored-box-owner-mismatch", "authoredBoxPlan",
      "authored box plan must belong to the same TextBlock",
    ))
  }
  const rebuiltBox = createVNextAuthoredBoxPlanV1({
    ownerNode: textBlock,
    availableWidthPt: input.authoredBoxPlan.outerWidthPt,
  })
  if (rebuiltBox.status !== "ready" || !sameJson(rebuiltBox.plan, input.authoredBoxPlan)) issues.push(issue(
    "authored-box-fingerprint-mismatch", "authoredBoxPlan",
    "authored box plan must equal the Core-derived plan for this TextBlock",
  ))
  const outerWidth = convertVNextPointToLayoutUnitV1(input.authoredBoxPlan.outerWidthPt)
  if (
    input.measurement.availableWidthPt !== input.authoredBoxPlan.contentWidthPt
    || outerWidth.status !== "accepted"
    || outerWidth.layoutUnit !== input.parentRegion.widthLayoutUnit
  ) issues.push(issue(
    "authored-box-width-mismatch", "measurement.availableWidthPt",
    "parent width, authored box outer width, and measurement content width must agree exactly",
  ))

  if (input.paragraphStyle.styleKey !== input.measurement.styleKey) issues.push(issue(
    "style-context-mismatch", "paragraphStyle.styleKey",
    "paragraph style key must match the measurement style key",
  ))
  if (!validateFonts(input)) issues.push(issue(
    "invalid-font-context", "fontFaces",
    "paragraph style and font faces must be complete, unique, and valid",
  ))

  const atoms = projectAtoms(textBlock, input.measurement, issues)
  if (issues.length > 0) return { status: "blocked", flow: null, issues }

  const has = (kind: VNextTextBlockInitialFlowAtomV1["kind"]): boolean =>
    atoms.some((atom) => atom.kind === kind)
  const capabilities: VNextTextBlockInitialFlowCapabilityReportV1 = {
    styledText: has("text") ? "ready" : "not-present",
    resolvedField: has("resolved-field") ? "ready" : "not-present",
    generatedPageNumber: has("generated-page-number") ? "ready" : "not-present",
    hardBreak: has("hard-break") ? "ready" : "not-present",
    inlineImage: has("inline-image") ? "blocked-line-box-contract" : "not-present",
    listDecoration: textBlock.role.role === "list-item" ? "blocked-decoration-contract" : "not-present",
    emptyBlock: textBlock.children.length === 0 ? "blocked-empty-layout-contract" : "not-present",
    authoredBox: "ready",
    positionedObjects: "not-present",
  }
  const geometryRequired = capabilities.inlineImage !== "not-present"
    || capabilities.listDecoration !== "not-present"
    || capabilities.emptyBlock !== "not-present"
  const facts = {
    source: VNEXT_TEXT_BLOCK_INITIAL_FLOW_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_INITIAL_FLOW_VERSION,
    kind: "initial-text-block-flow" as const,
    layoutDisposition: geometryRequired ? "geometry-contract-required" as const : "text-subset-ready" as const,
    documentId: input.measurement.documentId,
    instanceRevision: input.measurement.instanceRevision,
    sectionId: input.measurement.sectionId,
    textBlockId: textBlock.id,
    role: clone(textBlock.role),
    authoredBoxPlan: clone(input.authoredBoxPlan),
    parentRegion: clone(input.parentRegion),
    measurement: clone(input.measurement),
    layoutUnitPolicyFingerprint: input.layoutUnitPolicyFingerprint,
    paragraphStyle: clone(input.paragraphStyle),
    fontFaces: clone(input.fontFaces),
    atoms,
    capabilities,
    contracts: {
      canonicalDocumentMutation: false as const,
      geometryDependenciesPinned: true as const,
      textOnlyAdapterEligible: !geometryRequired,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    },
  }
  return {
    status: "classified",
    flow: deepFreeze({
      ...facts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
    }),
    issues: [],
  }
}
```

Add this export to `src/index.ts`:

```ts
export * from "./layout/textBlockInitialFlowInputV1.js"
```

- [ ] **Step 5: Run focused tests and type-check**

Run:

```bash
npx vitest run tests/textBlockInitialFlowParentRegionV1.test.ts tests/textBlockInitialFlowInputV1.test.ts
npm run type-check
```

Expected: 6 focused tests PASS and TypeScript exits successfully.

- [ ] **Step 6: Commit the complete geometry classifier**

```bash
git add src/layout/textBlockInitialFlowInputV1.ts tests/helpers/textBlockInitialFlowV1.ts tests/textBlockInitialFlowInputV1.test.ts src/index.ts
git commit -m "feat: classify complete TextBlock geometry"
```

---

### Task 3: Explicit Text-Subset Adapter Into Existing MR1 Layout

**Files:**
- Create: `src/layout/textBlockInitialFlowTextOnlyAdapterV1.ts`
- Create: `tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: a classified `VNextTextBlockInitialFlowV1` and an unchanged `VNextTextBlockMultiRunLayoutRequestV1`.
- Produces: `adaptVNextTextBlockInitialFlowToLegacyLayoutV1(...)` and `VNextTextBlockInitialFlowTextOnlyAdapterResultV1`.
- Guarantees: the adapter accepts only `text-subset-ready`, exact-context inputs and delegates layout validation to `acceptVNextTextBlockMultiRunLayoutV1(...)`; it never grants publication authority.

- [ ] **Step 1: Write the failing adapter tests**

Create `tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  adaptVNextTextBlockInitialFlowToLegacyLayoutV1,
  createVNextTextBlockInitialFlowV1,
} from "../src/index.js"
import {
  emptyGeometryBuildInputFixture,
  legacyTextOnlyBuildInputFixture,
  legacyTextOnlyLayoutRequestFixture,
  listImageGeometryBuildInputFixture,
} from "./helpers/textBlockInitialFlowV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function classifiedTextFlow() {
  const result = createVNextTextBlockInitialFlowV1(legacyTextOnlyBuildInputFixture())
  if (result.status !== "classified") throw new Error("initial flow blocked")
  return result.flow
}

describe("TextBlock Initial Flow text-only adapter v1", () => {
  it("preserves the exact accepted MR1 text layout behind an explicit boundary", () => {
    const flow = classifiedTextFlow()
    const request = legacyTextOnlyLayoutRequestFixture()
    const before = JSON.stringify({ flow, request })
    const direct = acceptVNextTextBlockMultiRunLayoutV1(request)
    const adapted = adaptVNextTextBlockInitialFlowToLegacyLayoutV1({ initialFlow: flow, legacyRequest: request })

    expect(direct.status).toBe("accepted")
    expect(adapted).toMatchObject({
      status: "accepted-text-subset",
      initialFlowFingerprint: flow.fingerprint,
      layoutId: request.layoutId,
      contracts: {
        legacyTextSubsetOnly: true,
        completeGeometryClassified: true,
        rendererMayMeasureText: false,
        rendererMayRelayout: false,
        mayPublishLayout: false,
        productionBinding: false,
      },
      issues: [],
    })
    if (adapted.status !== "accepted-text-subset" || direct.status !== "accepted") {
      throw new Error("legacy adapter blocked")
    }
    expect(adapted.layout).toEqual(direct)
    expect(JSON.stringify({ flow, request })).toBe(before)
  })

  it("refuses list/image/empty capability rows before legacy layout", () => {
    const imageResult = createVNextTextBlockInitialFlowV1(listImageGeometryBuildInputFixture())
    if (imageResult.status !== "classified") throw new Error("image flow blocked")
    const emptyResult = createVNextTextBlockInitialFlowV1(emptyGeometryBuildInputFixture())
    if (emptyResult.status !== "classified") throw new Error("empty flow blocked")
    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: imageResult.flow,
      legacyRequest: legacyTextOnlyLayoutRequestFixture(),
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "initial-flow-capability-required" })],
    })
    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: emptyResult.flow,
      legacyRequest: legacyTextOnlyLayoutRequestFixture(),
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "initial-flow-capability-required" })],
    })
  })

  it("blocks cloned flow, request-context drift, and production binding", () => {
    const flow = classifiedTextFlow()
    const clonedFlow = clone(flow)

    const measurementDrift = legacyTextOnlyLayoutRequestFixture()
    measurementDrift.measurement = clone(measurementDrift.measurement)
    measurementDrift.measurement.instanceRevision += 1

    const fontDrift = legacyTextOnlyLayoutRequestFixture()
    fontDrift.fontFaces = clone(fontDrift.fontFaces)
    fontDrift.fontFaces[0]!.fontSha256 = "c".repeat(64)

    const production = legacyTextOnlyLayoutRequestFixture()
    production.bindProductionLayout = true

    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: clonedFlow,
      legacyRequest: legacyTextOnlyLayoutRequestFixture(),
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-initial-flow" })],
    })
    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: flow,
      legacyRequest: measurementDrift,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "legacy-context-mismatch" })],
    })
    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: flow,
      legacyRequest: fontDrift,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "legacy-context-mismatch" })],
    })
    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: flow,
      legacyRequest: production,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "legacy-layout-rejected" })],
    })
  })
})
```

- [ ] **Step 2: Run the adapter test to verify it fails**

Run:

```bash
npx vitest run tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts
```

Expected: FAIL because `adaptVNextTextBlockInitialFlowToLegacyLayoutV1(...)` is not exported.

- [ ] **Step 3: Implement the exact text-subset adapter**

Create `src/layout/textBlockInitialFlowTextOnlyAdapterV1.ts`:

```ts
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { convertVNextPointToLayoutUnitV1 } from "./layoutUnitPolicyV1.js"
import type { VNextTextBlockAcceptedMultiRunLayoutV1 } from "./textBlockMultiRunIncrementalContractV1.js"
import type { VNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import type { VNextTextBlockMultiRunLayoutRequestV1 } from "./textBlockMultiRunLayoutContractV1.js"
import { acceptVNextTextBlockMultiRunLayoutV1 } from "./textBlockMultiRunLayoutV1.js"

export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_SOURCE =
  "vnext-text-block-initial-flow-text-only-adapter-v1" as const
export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_VERSION = 1 as const

export type VNextTextBlockInitialFlowTextOnlyAdapterIssueCodeV1 =
  | "invalid-initial-flow"
  | "initial-flow-capability-required"
  | "legacy-context-mismatch"
  | "legacy-layout-rejected"

export interface VNextTextBlockInitialFlowTextOnlyAdapterIssueV1 {
  code: VNextTextBlockInitialFlowTextOnlyAdapterIssueCodeV1
  severity: "error"
  path: string
  message: string
}

interface AdapterBase {
  source: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_VERSION
  initialFlowFingerprint: string
  layoutId: string
  contracts: {
    legacyTextSubsetOnly: true
    completeGeometryClassified: true
    rendererMayMeasureText: false
    rendererMayRelayout: false
    mayPublishLayout: false
    productionBinding: false
  }
}

export type VNextTextBlockInitialFlowTextOnlyAdapterResultV1 =
  | (AdapterBase & {
      status: "accepted-text-subset"
      layout: VNextTextBlockAcceptedMultiRunLayoutV1
      fingerprint: string
      issues: []
    })
  | (AdapterBase & {
      status: "blocked"
      layout: null
      fingerprint: null
      issues: VNextTextBlockInitialFlowTextOnlyAdapterIssueV1[]
    })

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function compact(value: unknown): string {
  return createVNextCompactFingerprint(JSON.stringify(value))
}

function base(initialFlow: VNextTextBlockInitialFlowV1, layoutId: string): AdapterBase {
  return {
    source: VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_VERSION,
    initialFlowFingerprint: initialFlow.fingerprint,
    layoutId,
    contracts: {
      legacyTextSubsetOnly: true,
      completeGeometryClassified: true,
      rendererMayMeasureText: false,
      rendererMayRelayout: false,
      mayPublishLayout: false,
      productionBinding: false,
    },
  }
}

function blocked(
  initialFlow: VNextTextBlockInitialFlowV1,
  layoutId: string,
  code: VNextTextBlockInitialFlowTextOnlyAdapterIssueCodeV1,
  path: string,
  message: string,
): VNextTextBlockInitialFlowTextOnlyAdapterResultV1 {
  return {
    ...base(initialFlow, layoutId),
    status: "blocked",
    layout: null,
    fingerprint: null,
    issues: [{ code, severity: "error", path, message }],
  }
}

export function adaptVNextTextBlockInitialFlowToLegacyLayoutV1(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  legacyRequest: VNextTextBlockMultiRunLayoutRequestV1
}): VNextTextBlockInitialFlowTextOnlyAdapterResultV1 {
  const flow = input.initialFlow
  const request = input.legacyRequest
  const { fingerprint, ...flowFacts } = flow
  if (!Object.isFrozen(flow) || fingerprint !== compact(flowFacts)) return blocked(
    flow, request.layoutId, "invalid-initial-flow", "initialFlow",
    "Initial Flow must be the immutable object with a valid Core fingerprint",
  )
  if (flow.layoutDisposition !== "text-subset-ready" || !flow.contracts.textOnlyAdapterEligible) {
    return blocked(
      flow, request.layoutId, "initial-flow-capability-required", "initialFlow.layoutDisposition",
      "legacy MR1 layout accepts only the explicitly classified text subset",
    )
  }

  const contentWidth = convertVNextPointToLayoutUnitV1(flow.authoredBoxPlan.contentWidthPt)
  if (
    !sameJson(flow.measurement, request.measurement)
    || flow.layoutUnitPolicyFingerprint !== request.layoutUnitPolicyFingerprint
    || !sameJson(flow.paragraphStyle, request.paragraphStyle)
    || !sameJson(flow.fontFaces, request.fontFaces)
    || contentWidth.status !== "accepted"
    || contentWidth.layoutUnit !== request.availableWidthLayoutUnit
  ) return blocked(
    flow, request.layoutId, "legacy-context-mismatch", "legacyRequest",
    "legacy request measurement, width, typography, and layout policy must equal Initial Flow",
  )

  const layout = acceptVNextTextBlockMultiRunLayoutV1(request)
  if (layout.status !== "accepted") return blocked(
    flow, request.layoutId, "legacy-layout-rejected", "legacyRequest",
    `legacy MR1 layout rejected the request: ${layout.issues.map((item) => item.code).join(", ")}`,
  )
  const facts = {
    ...base(flow, request.layoutId),
    status: "accepted-text-subset" as const,
    layout: clone(layout),
  }
  return {
    ...facts,
    fingerprint: compact(facts),
    issues: [],
  }
}
```

Add this export to `src/index.ts`:

```ts
export * from "./layout/textBlockInitialFlowTextOnlyAdapterV1.js"
```

- [ ] **Step 4: Run all Phase 1 focused tests and type-check**

Run:

```bash
npx vitest run tests/textBlockInitialFlowParentRegionV1.test.ts tests/textBlockInitialFlowInputV1.test.ts tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts tests/textBlockMultiRunLayoutV1.test.ts
npm run type-check
```

Expected: all focused tests PASS, the retained legacy layout suite remains green, and TypeScript exits successfully.

- [ ] **Step 5: Commit the explicit adapter**

```bash
git add src/layout/textBlockInitialFlowTextOnlyAdapterV1.ts tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts src/index.ts
git commit -m "feat: bridge Initial TextBlock Flow to MR1 layout"
```

---

### Task 4: MR1-P Evidence, Handoff, And Full Gate

**Files:**
- Create: `docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md`
- Modify: `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`
- Modify: `docs/PHASE_LEDGER.md`
- Create: `tests/liveDraftMr1CompleteGeometryBoundary.test.ts`

**Interfaces:**
- Consumes: the public Initial Flow parent region, classifier, capability report, and text-subset adapter from Tasks 1-3.
- Produces: an evidence-backed MR1-P handoff and the next pointer to Phase 2 Persistent Flow Tree Foundation.

- [ ] **Step 1: Write the failing documentation guard**

Create `tests/liveDraftMr1CompleteGeometryBoundary.test.ts`:

```ts
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("Live Draft MR1-P complete geometry boundary", () => {
  it("records capability truth, retained dependencies, and the bounded next checkpoint", () => {
    const boundary = read("../docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md")
    const handoff = read("../docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    const index = read("../src/index.ts")

    for (const section of [
      "## Outcome",
      "## Capability Matrix",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Verification",
      "## Next Checkpoint",
    ]) expect(boundary).toContain(section)

    expect(boundary).toContain("Initial TextBlock Flow")
    expect(boundary).toContain("text-subset-ready")
    expect(boundary).toContain("geometry-contract-required")
    expect(boundary).toContain("blocked-line-box-contract")
    expect(boundary).toContain("blocked-decoration-contract")
    expect(boundary).toContain("mayPublishLayout: false")
    expect(boundary).toContain("Persistent Flow Tree Foundation")
    expect(handoff).toContain("LIVE-DRAFT-MR1-P Complete Geometry Boundary")
    expect(ledger).toContain("## LIVE-DRAFT-MR1-P Complete Geometry Boundary")
    expect(index).toContain('export * from "./layout/textBlockInitialFlowParentRegionV1.js"')
    expect(index).toContain('export * from "./layout/textBlockInitialFlowInputV1.js"')
    expect(index).toContain('export * from "./layout/textBlockInitialFlowTextOnlyAdapterV1.js"')
  })
})
```

- [ ] **Step 2: Run the guard to verify the evidence docs are missing**

Run:

```bash
npx vitest run tests/liveDraftMr1CompleteGeometryBoundary.test.ts
```

Expected: FAIL because `docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md` does not exist.

- [ ] **Step 3: Write the MR1-P boundary document**

Create `docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md` with this exact structure and capability language:

```markdown
# Live Draft MR1-P Complete Geometry Boundary

Status: accepted as a bounded Core contract checkpoint. Persistent flow-tree
execution, spatial wrapping, product binding, publication, and production
remain NO-GO.

## Outcome

MR1-P introduces Initial TextBlock Flow as the capability-honest boundary in
front of the existing MR1 layout. It pins parent containing-region, authored
box, role/list identity, measurement, paragraph style, fonts, layout-unit
policy, and complete known inline facts without changing canonical Document v4.

The existing MR1 layout remains a text-run subset. Only a classified
`text-subset-ready` input may enter it through the explicit adapter. List,
inline-image, and empty-block geometry report
`geometry-contract-required` and fail closed before legacy layout.

## Capability Matrix

| Capability | MR1-P status | Reason |
| --- | --- | --- |
| styled text and resolved fields | ready | complete measurement and typography facts retained |
| generated page number and hard break | ready | owner and mandatory-break facts retained |
| inline image | blocked-line-box-contract | frame, asset, and vertical alignment retained; baseline math not yet accepted |
| list item | blocked-decoration-contract | authored list identity retained; marker/indent owner not yet accepted |
| empty block | blocked-empty-layout-contract | canonical state retained; MR1 empty-line layout remains unsupported |
| authored box | ready | complete Core-derived box plan and owner fingerprint pinned |
| positioned objects | not-present | no canonical positioned-object contract is introduced |

## PASS

- Body, column, and table-cell parent regions use exact micro-point integers
  and deterministic Core fingerprints.
- Initial TextBlock Flow retains role, box, measurement, typography, policy,
  and full inline-image vertical alignment.
- The text-only adapter reproduces the exact existing accepted MR1 layout.
- Cloned flow objects, stale parent facts, width drift, style/font drift,
  frame drift, unsupported capabilities, and production binding fail closed.
- Every accepted result reports `mayPublishLayout: false`.

## FAIL / BLOCKER

- Inline-image baseline/ascent/descent integration is not implemented.
- List marker, numbering, gap, and continuation-indent ownership is not defined.
- Empty TextBlock line geometry is not accepted by MR1.
- Persistent structural sharing and spatial wrapping are not implemented.

## RISK

- Initial Flow currently duplicates retained measurement and typography facts;
  Phase 2 must replace complete rescans without multiplying active memory.
- Width or global typography changes still require complete TextBlock reflow.
- Names containing TextBlock can still be over-read unless consumers honor the
  capability report and adapter gate.

## UNKNOWN

- Exact list-decoration owner and marker-format contract.
- Exact inline-image baseline rules for baseline, middle, and text-bottom.
- Product-scale retained-memory and interaction budgets.

## Verification

- Focused Initial Flow, adapter, and retained MR1 layout tests pass.
- TypeScript type-check passes.
- Full `npm run check` passes.
- Diff whitespace validation passes.

## Next Checkpoint

Proceed to Phase 2 Persistent Flow Tree Foundation. Implement the versioned
persistent B+ rope policy and remove `completeNextSemanticPassCount: 1` for the
accepted text subset. Do not start spatial wrapping, list/image geometry,
Editor binding, Backend activation, or publication in that checkpoint.
```

- [ ] **Step 4: Update the cross-runtime handoff and phase ledger**

Append this section immediately after the existing MR1-O checkpoint in `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`:

```markdown
## LIVE-DRAFT-MR1-P Complete Geometry Boundary

Status: accepted as a bounded Core contract checkpoint. Persistent flow-tree
execution, spatial wrapping, product binding, publication, and production
remain NO-GO.

MR1-P adds a versioned Initial TextBlock Flow boundary that pins parent region,
authored box, role/list identity, measurement, paragraph style, fonts,
layout-unit policy, and complete current inline facts. The existing MR1 layout
is now reachable only through an explicit `text-subset-ready` adapter.

Inline images retain frame, asset, and `verticalAlign` but report
`blocked-line-box-contract`; list items retain authored identity but report
`blocked-decoration-contract`; empty blocks report
`blocked-empty-layout-contract`. These rows cannot enter legacy MR1 layout.
All results retain `mayPublishLayout: false`.

Evidence lives at `docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md`. The next
bounded checkpoint is Phase 2 Persistent Flow Tree Foundation.
```

Replace the **First Task For The Next Thread** text so it names Phase 2 Persistent Flow Tree Foundation, removal of `completeNextSemanticPassCount: 1`, and the explicit prohibition on spatial/list/image/product work in that checkpoint.

Append this entry to `docs/PHASE_LEDGER.md`:

```markdown
## LIVE-DRAFT-MR1-P Complete Geometry Boundary

Status: done.

- Added exact body/column/table-cell parent-region ownership.
- Added Initial TextBlock Flow classification with complete current geometry
  dependencies and capability-honest list/image/empty rows.
- Added an explicit text-subset adapter that preserves existing MR1 layout and
  rejects unsupported, stale, cloned, or production-bound inputs.
- Retained `mayPublishLayout: false`; canonical schema and product bindings are
  unchanged.
- Next: Phase 2 Persistent Flow Tree Foundation.
```

Run `git rev-parse --short HEAD` after Task 3 and replace the Core commit in the cross-runtime handoff baseline row with that literal emitted hash. Do not predict or fabricate the hash.

- [ ] **Step 5: Run focused documentation and Phase 1 tests**

Run:

```bash
npx vitest run tests/liveDraftMr1CompleteGeometryBoundary.test.ts tests/textBlockInitialFlowParentRegionV1.test.ts tests/textBlockInitialFlowInputV1.test.ts tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts tests/textBlockMultiRunLayoutV1.test.ts
```

Expected: all focused tests PASS.

- [ ] **Step 6: Run repository verification**

Run:

```bash
npm run type-check
npm run check
git diff --check
git status --short
```

Expected: type-check and the complete Vitest suite PASS; `git diff --check` emits no output; `git status --short` lists only the four intended documentation/test changes for this task.

- [ ] **Step 7: Commit the MR1-P handoff**

```bash
git add docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md docs/PHASE_LEDGER.md tests/liveDraftMr1CompleteGeometryBoundary.test.ts
git commit -m "docs: hand off TextBlock geometry boundary"
```

- [ ] **Step 8: Verify the final branch state**

Run:

```bash
git status --short
git log -4 --oneline
```

Expected: working tree is clean and the latest four commits are the parent-region boundary, complete geometry classifier, Initial Flow adapter, and MR1-P handoff in that order.

## Completion Handoff

Report:

- PASS: focused tests, type-check, full Core gate, exact legacy-layout parity, capability rejection rows, and clean worktree.
- FAIL / BLOCKER: any failed check or unsupported geometry accidentally reaching legacy layout.
- RISK: retained-fact memory and complete text-request work remain until Phase 2.
- UNKNOWN: list-decoration owner, inline-image line-box math, and product-scale budgets remain unresolved by design.
- Files changed: list the exact files from the File Map that changed.
- Behavior changed: Initial Flow classification and explicit text-subset adapter only.
- Intentionally not changed: canonical schema, MR1 layout algorithm, persistent tree, spatial wrapping, Editor, Backend, table auto-fit, and publication.
