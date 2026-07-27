# Inline Image Line-Box Geometry 4B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add strict Core-owned inline-image flow geometry that uses authored
image frames for advance, alignment, line height, spatial wrapping, and
auto-height while preserving exact V1 behavior and leaving product activation
for later phases.

**Architecture:** Freeze the existing V1 boundary with characterization
evidence, then extract its immutable rope, spatial treap, Flow Region, line
placement, and authored-box algorithms into shared internal kernels. Add a V2
successor boundary that accepts producer-shaped text evidence plus closed
text-cluster, hard-break, and inline-image atoms; all V2 stages are joined by
an opaque process-local authority while V1 keeps its exact public identity and
fingerprint contracts.

**Tech Stack:** TypeScript 6, ESM, Zod 4 strict schemas, Vitest 4, existing
Rustybuzz/ICU4X Node-native and Browser Worker WASM MR1 runtimes, Core compact
canonical fingerprints, immutable WeakMap/WeakSet provenance, and integer
micro-point layout units.

## Global Constraints

- At execution time, create
  `C:\Users\nekot\Documents\GitHub\flowdoc-vnext-core\.worktrees\inline-image-line-box-geometry-4b`
  on branch `feat/inline-image-line-box-geometry-4b` from committed baseline
  `f0dbd8d`.
- Work only in `flowdoc-vnext-core`; do not modify `flowdoc-vnext-editor` or
  `flowdoc-vnext-backend`.
- Use one shared internal kernel. Do not retain separate V1 and V2 rope,
  interval-treap, Flow Region, line-placement, or authored-box algorithms.
- Preserve every V1 accepted result, blocked issue order, public fingerprint,
  exact-object gate, and MR1-Q suffix/reconvergence proof.
- V2 must accept text-only and image-aware flows. Normalized V2 text-only
  geometry must equal V1 geometry.
- The only image placement mode is `inline-flow`.
- `baseline`, `middle`, and `text-bottom` are alignment variants, not placement
  modes.
- Image width is horizontal advance. Never auto-scale an oversized image.
- Image bytes, intrinsic-size loading, decoding, and paint rasterization remain
  outside Core.
- `fit` and `crop` are retained and fingerprinted paint dependencies; they do
  not change the outer frame rectangle.
- The alignment anchor is the paragraph font ascent/descent under a versioned
  policy.
- Keep list decoration, empty-block geometry, fixed-height overflow/clipping,
  Columns/Table, Table auto-fit, Editor/Backend binding, publication,
  production activation, and Editor staged apply blocked.
- Phase 4B makes no incremental edit, spatial-line reuse, suffix reuse,
  reconvergence, or performance-budget claim.
- Preserve the empty/overlay-only single-interval zero-query fast path.
- Every accepted result reports `mayPublishLayout: false` and
  `productionBinding: false`.
- Unsupported, stale, cloned, accessor-shaped, mutable, or re-fingerprinted
  authority fails closed without partial geometry.
- Use TDD for new behavior: observe the focused test fail before adding the
  implementation.
- Run each subphase stop gate before beginning the next subphase.
- Commit only coherent green tasks with explicit file staging and no unrelated
  changes.

## Committed Design

- `docs/superpowers/specs/2026-07-27-inline-image-line-box-geometry-design.md`
- Design baseline: `f0dbd8d`
- Phase 3 handoff: `docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md`
- Phase 4A handoff: `docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md`

## File Map

### Create

- `src/layout/textBlockInlineImageLineBoxV1.ts`
  - owns the versioned alignment policy and image-aware line-metric reduction.
- `src/layout/textBlockFlowEvidenceContractV2.ts`
  - owns the strict data-only V2 producer evidence and accepted evidence types.
- `src/layout/textBlockFlowEvidenceV2.ts`
  - validates producer evidence against the exact Initial Flow, freezes it, and
    registers process-local provenance.
- `src/layout/textBlockLayoutAuthorityInternalsV1.ts`
  - owns opaque process-local V1/V2 authority tokens and downstream bindings;
    it is never exported publicly.
- `src/layout/textBlockPersistentRopeKernelV1.ts`
  - owns generic immutable leaf partitioning, balanced branch construction,
    traversal, and node counting.
- `src/layout/textBlockPersistentFlowContractV2.ts`
  - owns the closed V2 flow-atom and persistent-tree public contract.
- `src/layout/textBlockPersistentFlowTreeV2.ts`
  - projects accepted evidence into V2 atoms and builds/registers the V2 tree.
- `src/layout/textBlockSpatialIndexKernelV1.ts`
  - owns the shared persistent y-interval treap, query, and path-copy update.
- `src/layout/textBlockFlowRegionKernelV1.ts`
  - owns pure interval subtraction, barrier, overlay, fast-path, and next-event
    calculations.
- `src/layout/textBlockSpatialIndexContractV2.ts`
  - owns V2 index and move/resize update result types.
- `src/layout/textBlockSpatialIndexV2.ts`
  - validates V2 authority and assembles a V2 index through the shared treap.
- `src/layout/textBlockSpatialIndexUpdateV2.ts`
  - applies V2 move/resize path copies through the shared treap.
- `src/layout/textBlockFlowRegionProviderV2.ts`
  - validates V2 authority and wraps the shared Flow Region kernel.
- `src/layout/textBlockSpatialWrappingKernelV1.ts`
  - owns closed-atom grouping, interval placement, vertical advancement, and
    finite expanded-band stabilization.
- `src/layout/textBlockSpatialWrappingLayoutContractV2.ts`
  - owns V2 text/image fragment, line, result, issue, and work types.
- `src/layout/textBlockSpatialWrappingLayoutV2.ts`
  - projects V2 atoms into the shared placement kernel and materializes V2
    spatial geometry.
- `src/layout/textBlockAuthoredBoxGeometryKernelV1.ts`
  - owns shared box conversion, safe auto-height, and box-local projection.
- `src/layout/textBlockAuthoredBoxGeometryContractV2.ts`
  - owns V2 box-local text/image geometry and result types.
- `src/layout/textBlockAuthoredBoxGeometryV2.ts`
  - validates V2 authority and materializes authored-box-local geometry.
- `packages/text-engine-rust-wasm/src/multiRunEvidenceInternals.ts`
  - owns shared text-run resolution, shaping, and complete-string segmentation
    for the V1 producer and V2 evidence producer.
- `packages/text-engine-rust-wasm/src/multiRunFlowEvidenceContractV2.ts`
  - owns external producer V2 input/result types.
- `packages/text-engine-rust-wasm/src/multiRunFlowEvidenceV2.ts`
  - emits V2 Core evidence input without producer-selected lines.
- `tests/helpers/textBlockInlineImageFlowV2.ts`
  - builds exact synthetic Initial Flow/evidence/tree/index fixtures.
- `tests/textBlockV1LayoutCompatibility.test.ts`
  - freezes accepted, blocked, fingerprint, and package-producer V1 behavior.
- `tests/fixtures/text-block-v1-layout-compatibility.v1.json`
  - committed exact V1 characterization artifact.
- `tests/fixtures/text-engine-multi-run-layout-v1-compatibility.v1.json`
  - committed exact external V1 producer characterization artifact.
- `tests/layoutUnitPositiveValueV1.test.ts`
  - verifies strict point/millimetre image-dimension conversion.
- `tests/textBlockInlineImageLineBoxV1.test.ts`
  - verifies alignment and combined line metrics.
- `tests/textEngineFlowEvidenceV2.test.ts`
  - verifies text-only and image-aware producer evidence with a deterministic
    runtime.
- `tests/textEngineFlowEvidenceNodeWasmV2.test.ts`
  - proves actual Node-native/Worker-WASM U+FFFC segmentation parity.
- `tests/textBlockFlowEvidenceV2.test.ts`
  - verifies Core evidence acceptance, binding, and rejection.
- `tests/textBlockPersistentFlowTreeV2.test.ts`
  - verifies the closed V2 atoms, rope invariants, and no-MR1-Q claim.
- `tests/textBlockSpatialIndexV2.test.ts`
  - verifies V2 index authority, queries, and path-copy move/resize.
- `tests/textBlockFlowRegionProviderV2.test.ts`
  - verifies V2 intervals, barriers, overlay, and zero-space advancement.
- `tests/textBlockSpatialWrappingLayoutV2.test.ts`
  - verifies image-aware spatial line placement and V1 text-only parity.
- `tests/textBlockAuthoredBoxGeometryV2.test.ts`
  - verifies box-local image geometry and auto-height.
- `tests/textBlockInlineImageGeometry4bHardening.test.ts`
  - owns the composed adversarial, property, and capability matrix.
- `tests/liveDraftMr1InlineImageGeometry4b.test.ts`
  - guards exports, documentation, active pointers, and NO-GO rows.
- `docs/LIVE_DRAFT_MR1_INLINE_IMAGE_GEOMETRY_4B.md`
  - records accepted Phase 4B evidence and the Phase 5 authorization gate.

### Modify

- `src/layout/layoutUnitPolicyV1.ts`
  - adds one strict positive schema-unit conversion without changing the V1
    policy fingerprint.
- `src/layout/textBlockPersistentFlowTreeInternalsV1.ts`
  - delegates balancing/traversal mechanics to the rope kernel.
- `src/layout/textBlockPersistentFlowTreeV1.ts`
  - obtains the internal V1 authority only after its existing exact checks.
- `src/layout/textBlockSpatialIndexInternalsV1.ts`
  - retains V1 fingerprints/bindings while delegating treap mechanics.
- `src/layout/textBlockSpatialIndexV1.ts`
  - uses the shared treap and internal V1 authority.
- `src/layout/textBlockSpatialIndexUpdateV1.ts`
  - uses the shared path-copy update without output changes.
- `src/layout/textBlockFlowRegionProviderV1.ts`
  - keeps V1 validation/fingerprints and delegates interval math.
- `src/layout/textBlockSpatialWrappingLayoutV1.ts`
  - keeps V1 projection/fingerprints and delegates placement mechanics.
- `src/layout/textBlockAuthoredBoxGeometryV1.ts`
  - keeps V1 validation/fingerprints and delegates box math.
- `packages/text-engine-rust-wasm/src/multiRunLayout.ts`
  - consumes shared evidence preparation while retaining V1 line construction
    and Core acceptance.
- `packages/text-engine-rust-wasm/src/multiRunLayoutContract.ts`
  - imports the shared internal preparation result where required without
    changing public V1 result types.
- `packages/text-engine-rust-wasm/src/node.ts`
  - adds the Node-native V2 evidence entrypoint.
- `packages/text-engine-rust-wasm/src/workerMr1.ts`
  - adds the Worker-WASM V2 evidence entrypoint.
- `packages/text-engine-rust-wasm/src/index.ts`
  - exports the external V2 evidence boundary.
- `src/index.ts`
  - exports public V2 contracts and entrypoints, never internal kernels or
    authority tokens.
- Existing V1 source tests
  - rerun unchanged and add exact compatibility assertions around each
    extraction.
- `docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md`
  - points forward to accepted Phase 4B evidence.
- `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`
  - records Phase 4B and stops at Phase 5 authorization.
- `docs/PHASE_LEDGER.md`
  - appends the Phase 4B evidence row.
- `docs/superpowers/specs/2026-07-27-inline-image-line-box-geometry-design.md`
  - changes status only after the full gate passes.

---

## Phase 4B-1 — Evidence And Metric Foundation

### Task 1: Freeze V1 And Add Unit/Alignment Policy

**Files:**

- Create: `tests/textBlockV1LayoutCompatibility.test.ts`
- Create: `tests/fixtures/text-block-v1-layout-compatibility.v1.json`
- Create: `tests/layoutUnitPositiveValueV1.test.ts`
- Create: `src/layout/textBlockInlineImageLineBoxV1.ts`
- Create: `tests/textBlockInlineImageLineBoxV1.test.ts`
- Modify: `src/layout/layoutUnitPolicyV1.ts`
- Modify: `src/index.ts`

**Interfaces:**

- Consumes:
  - `acceptedAuthoredBoxGeometryFixture(...)`;
  - `layoutVNextTextBlockAuthoredBoxGeometryV1(...)`;
  - `convertVNextPointToLayoutUnitV1(...)`;
  - `UnitValueV4Target`.
- Produces:
  - `convertVNextPositiveUnitValueToLayoutUnitV1(value, path?)`;
  - `VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1`;
  - `resolveVNextTextBlockInlineImageLineMetricsV1(input)`;
  - `combineVNextTextBlockFlowLineMetricsV2(input)`;
  - exact V1 file-snapshot characterization.

- [ ] **Step 1: Capture exact V1 accepted and blocked output before refactoring**

Create `tests/textBlockV1LayoutCompatibility.test.ts`. Serialize a
no-exclusion 4A result, a central-exclusion 4A result, and the ordered cloned
tree/index rejection rows:

```ts
import { describe, expect, it } from "vitest"
import {
  layoutVNextTextBlockAuthoredBoxGeometryV1,
} from "../src/index.js"
import {
  acceptedAuthoredBoxGeometryFixture,
} from "./helpers/textBlockAuthoredBoxGeometryV1.js"

function accepted(options: Parameters<typeof acceptedAuthoredBoxGeometryFixture>[0] = {}) {
  const fixture = acceptedAuthoredBoxGeometryFixture(options)
  const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
    initialFlow: fixture.initialFlow,
    persistentFlowTree: fixture.tree,
    request: fixture.request,
    spatialIndex: fixture.spatialIndex,
  })
  if (result.status !== "accepted") throw new Error("V1 characterization fixture blocked")
  return result
}

describe("frozen V1 layout compatibility", () => {
  it("retains exact accepted geometry and fingerprints", async () => {
    const facts = {
      noExclusion: accepted(),
      middleExclusion: accepted({
        entries: [{
          objectId: "middle",
          geometryOwnerFingerprint: `sha256:${"a".repeat(64)}`,
          xLayoutUnit: 35_000_000,
          yLayoutUnit: 0,
          widthLayoutUnit: 20_000_000,
          heightLayoutUnit: 20_000_000,
          clearance: {
            topLayoutUnit: 0,
            rightLayoutUnit: 0,
            bottomLayoutUnit: 0,
            leftLayoutUnit: 0,
          },
          wrapPolicy: "rectangular-exclusion",
        }],
      }),
    }
    await expect(JSON.stringify(facts, null, 2)).toMatchFileSnapshot(
      "./fixtures/text-block-v1-layout-compatibility.v1.json",
    )
  })
})
```

Generate the committed baseline once, then rerun without update mode:

```sh
npx vitest run tests/textBlockV1LayoutCompatibility.test.ts -u
npx vitest run tests/textBlockV1LayoutCompatibility.test.ts
```

Expected: both commands PASS; the second command proves the committed fixture
is stable without rewriting it.

- [ ] **Step 2: Write failing positive UnitValue conversion tests**

Create `tests/layoutUnitPositiveValueV1.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { convertVNextPositiveUnitValueToLayoutUnitV1 } from "../src/index.js"

describe("positive authored UnitValue conversion", () => {
  it("converts pt and mm with one final layout-unit rounding", () => {
    expect(convertVNextPositiveUnitValueToLayoutUnitV1(
      { value: 12.5, unit: "pt" },
      "frame.width",
    )).toMatchObject({ status: "accepted", layoutUnit: 12_500_000, issues: [] })
    expect(convertVNextPositiveUnitValueToLayoutUnitV1(
      { value: 25.4, unit: "mm" },
      "frame.height",
    )).toMatchObject({ status: "accepted", layoutUnit: 72_000_000, issues: [] })
  })

  it.each([
    [{ value: 0, unit: "pt" }, "invalid-positive-unit-value"],
    [{ value: -1, unit: "mm" }, "invalid-positive-unit-value"],
    [{ value: Number.POSITIVE_INFINITY, unit: "pt" }, "invalid-positive-unit-value"],
    [{ value: 1, unit: "px" }, "invalid-positive-unit-value"],
  ])("blocks invalid image dimensions", (value, code) => {
    expect(convertVNextPositiveUnitValueToLayoutUnitV1(value, "frame.width"))
      .toMatchObject({ status: "blocked", issues: [{ code, path: "frame.width" }] })
  })

  it("rejects accessors without invoking them", () => {
    let getterCount = 0
    const value = Object.create(null)
    Object.defineProperty(value, "value", {
      enumerable: true,
      get() {
        getterCount += 1
        return 10
      },
    })
    Object.defineProperty(value, "unit", {
      enumerable: true,
      value: "pt",
    })
    expect(convertVNextPositiveUnitValueToLayoutUnitV1(value, "frame.width"))
      .toMatchObject({ status: "blocked", issues: [{ code: "invalid-positive-unit-value" }] })
    expect(getterCount).toBe(0)
  })
})
```

- [ ] **Step 3: Run the unit test and observe the missing export**

Run:

```sh
npx vitest run tests/layoutUnitPositiveValueV1.test.ts
```

Expected: FAIL because
`convertVNextPositiveUnitValueToLayoutUnitV1` is not exported.

- [ ] **Step 4: Add the single Core-owned conversion**

Extend `VNextLayoutUnitIssueCodeV1` with
`"invalid-positive-unit-value"` and add:

```ts
export function convertVNextPositiveUnitValueToLayoutUnitV1(
  value: unknown,
  path = "unitValue",
): VNextPointToLayoutUnitResultV1 {
  if (value == null || typeof value !== "object") return blockedLayoutUnit([
    issue("invalid-positive-unit-value", path, "unit value must be a strict positive pt/mm object"),
  ])
  const prototype = Object.getPrototypeOf(value)
  const keys = Reflect.ownKeys(value)
  const valueProperty = Object.getOwnPropertyDescriptor(value, "value")
  const unitProperty = Object.getOwnPropertyDescriptor(value, "unit")
  if (
    (prototype !== Object.prototype && prototype !== null)
    || keys.length !== 2
    || !keys.includes("value")
    || !keys.includes("unit")
    || valueProperty == null
    || unitProperty == null
    || !Object.hasOwn(valueProperty, "value")
    || !Object.hasOwn(unitProperty, "value")
  ) return blockedLayoutUnit([
    issue("invalid-positive-unit-value", path, "unit value must contain data-only value and unit fields"),
  ])
  const numeric = valueProperty.value
  const unit = unitProperty.value
  if (
    !Number.isFinite(numeric)
    || (numeric as number) <= 0
    || (unit !== "pt" && unit !== "mm")
  ) return blockedLayoutUnit([
    issue("invalid-positive-unit-value", path, "unit value must be finite, positive, and use pt or mm"),
  ])
  const point = unit === "pt"
    ? numeric as number
    : (numeric as number) * 72 / 25.4
  const converted = convertVNextPointToLayoutUnitV1(point, path)
  if (converted.status !== "accepted" || converted.layoutUnit <= 0) {
    return blockedLayoutUnit([
      issue("unsafe-layout-unit", path, "converted image dimension must be a positive safe layout integer"),
    ])
  }
  return converted
}
```

Do not change `createVNextLayoutUnitPolicyV1()` facts or fingerprint.

- [ ] **Step 5: Write failing alignment and combined line-metric tests**

Create `tests/textBlockInlineImageLineBoxV1.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import {
  combineVNextTextBlockFlowLineMetricsV2,
  resolveVNextTextBlockInlineImageLineMetricsV1,
  VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1,
} from "../src/index.js"

describe("inline-image line-box policy", () => {
  it.each([
    ["baseline", -12_000_000, 0],
    ["text-bottom", -10_000_000, 2_000_000],
    ["middle", -9_000_000, 3_000_000],
  ] as const)("resolves %s against paragraph metrics", (verticalAlign, top, bottom) => {
    expect(resolveVNextTextBlockInlineImageLineMetricsV1({
      verticalAlign,
      frameHeightLayoutUnit: 12_000_000,
      paragraphAscentLayoutUnit: 8_000_000,
      paragraphDescentLayoutUnit: 2_000_000,
    })).toMatchObject({
      status: "accepted",
      topFromBaselineLayoutUnit: top,
      bottomFromBaselineLayoutUnit: bottom,
    })
  })

  it("floors odd middle alignment toward negative infinity", () => {
    expect(resolveVNextTextBlockInlineImageLineMetricsV1({
      verticalAlign: "middle",
      frameHeightLayoutUnit: 11_000_001,
      paragraphAscentLayoutUnit: 8_000_000,
      paragraphDescentLayoutUnit: 2_000_000,
    })).toMatchObject({
      status: "accepted",
      topFromBaselineLayoutUnit: -8_500_001,
      bottomFromBaselineLayoutUnit: 2_500_000,
    })
  })

  it("combines paragraph, text, and image extents deterministically", () => {
    expect(combineVNextTextBlockFlowLineMetricsV2({
      lineYLayoutUnit: 5_000_000,
      declaredLineHeightLayoutUnit: 20_000_000,
      candidateBandHeightLayoutUnit: 14_000_000,
      paragraphAscentLayoutUnit: 8_000_000,
      paragraphDescentLayoutUnit: 2_000_000,
      textExtents: [{ topFromBaselineLayoutUnit: -8_000_000, bottomFromBaselineLayoutUnit: 2_000_000 }],
      imageExtents: [{ topFromBaselineLayoutUnit: -12_000_000, bottomFromBaselineLayoutUnit: 0 }],
    })).toEqual({
      status: "accepted",
      contentTopFromBaselineLayoutUnit: -12_000_000,
      contentBottomFromBaselineLayoutUnit: 2_000_000,
      naturalHeightLayoutUnit: 14_000_000,
      heightLayoutUnit: 20_000_000,
      leadingBeforeLayoutUnit: 3_000_000,
      leadingAfterLayoutUnit: 3_000_000,
      baselineOffsetLayoutUnit: 15_000_000,
      baselineYLayoutUnit: 20_000_000,
      issues: [],
    })
    expect(VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1.fingerprint)
      .toMatch(/^sha256:[a-f0-9]{64}$/u)
  })
})
```

- [ ] **Step 6: Implement the alignment and line-metric policy**

Create `src/layout/textBlockInlineImageLineBoxV1.ts` with:

```ts
export const VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1 = Object.freeze({
  source: "vnext-text-block-inline-image-alignment-policy-v1" as const,
  policyVersion: 1 as const,
  coordinateDirection: "positive-y-down" as const,
  anchor: "paragraph-font-metrics" as const,
  middleRounding: "floor-toward-negative-infinity" as const,
  fingerprint: createVNextCompactFingerprint(JSON.stringify({
    source: "vnext-text-block-inline-image-alignment-policy-v1",
    policyVersion: 1,
    coordinateDirection: "positive-y-down",
    anchor: "paragraph-font-metrics",
    middleRounding: "floor-toward-negative-infinity",
  })),
})

export function resolveVNextTextBlockInlineImageLineMetricsV1(input: {
  verticalAlign: "baseline" | "middle" | "text-bottom"
  frameHeightLayoutUnit: number
  paragraphAscentLayoutUnit: number
  paragraphDescentLayoutUnit: number
}): VNextTextBlockInlineImageLineMetricsResultV1

export function combineVNextTextBlockFlowLineMetricsV2(input: {
  lineYLayoutUnit: number
  declaredLineHeightLayoutUnit: number
  candidateBandHeightLayoutUnit: number
  paragraphAscentLayoutUnit: number
  paragraphDescentLayoutUnit: number
  textExtents: readonly VNextTextBlockBaselineExtentV1[]
  imageExtents: readonly VNextTextBlockBaselineExtentV1[]
}): VNextTextBlockFlowLineMetricsResultV2
```

Define the returned types in the same file:

```ts
export interface VNextTextBlockBaselineExtentV1 {
  topFromBaselineLayoutUnit: number
  bottomFromBaselineLayoutUnit: number
}

export type VNextTextBlockInlineImageLineMetricsResultV1 =
  | {
      status: "accepted"
      topFromBaselineLayoutUnit: number
      bottomFromBaselineLayoutUnit: number
      ascentLayoutUnit: number
      descentLayoutUnit: number
      alignmentPolicyFingerprint: string
      issues: []
    }
  | {
      status: "blocked"
      topFromBaselineLayoutUnit: null
      bottomFromBaselineLayoutUnit: null
      ascentLayoutUnit: null
      descentLayoutUnit: null
      alignmentPolicyFingerprint: string
      issues: readonly VNextLayoutUnitIssueV1[]
    }

export type VNextTextBlockFlowLineMetricsResultV2 =
  | {
      status: "accepted"
      contentTopFromBaselineLayoutUnit: number
      contentBottomFromBaselineLayoutUnit: number
      naturalHeightLayoutUnit: number
      heightLayoutUnit: number
      leadingBeforeLayoutUnit: number
      leadingAfterLayoutUnit: number
      baselineOffsetLayoutUnit: number
      baselineYLayoutUnit: number
      issues: []
    }
  | {
      status: "blocked"
      contentTopFromBaselineLayoutUnit: null
      contentBottomFromBaselineLayoutUnit: null
      naturalHeightLayoutUnit: null
      heightLayoutUnit: null
      leadingBeforeLayoutUnit: null
      leadingAfterLayoutUnit: null
      baselineOffsetLayoutUnit: null
      baselineYLayoutUnit: null
      issues: readonly VNextLayoutUnitIssueV1[]
    }
```

Use the exact formulas:

```ts
const top = input.verticalAlign === "baseline"
  ? -input.frameHeightLayoutUnit
  : input.verticalAlign === "text-bottom"
    ? input.paragraphDescentLayoutUnit - input.frameHeightLayoutUnit
    : Math.floor((
      input.paragraphDescentLayoutUnit
      - input.paragraphAscentLayoutUnit
      - input.frameHeightLayoutUnit
    ) / 2)
const bottom = input.verticalAlign === "text-bottom"
  ? input.paragraphDescentLayoutUnit
  : top + input.frameHeightLayoutUnit
```

Perform safe-integer validation and checked addition/subtraction at every
boundary. Return a structured blocked result instead of clamping.

- [ ] **Step 7: Export and run Task 1 checks**

Add public exports for the new policy and conversion, then run:

```sh
npx vitest run \
  tests/layoutUnitPolicyV1.test.ts \
  tests/layoutUnitPositiveValueV1.test.ts \
  tests/textBlockInlineImageLineBoxV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
npm run type-check
git diff --check
```

Expected: all selected tests and type-check PASS; the V1 file snapshot is
unchanged.

- [ ] **Step 8: Commit the metric foundation**

```sh
git add \
  src/index.ts \
  src/layout/layoutUnitPolicyV1.ts \
  src/layout/textBlockInlineImageLineBoxV1.ts \
  tests/fixtures/text-block-v1-layout-compatibility.v1.json \
  tests/layoutUnitPositiveValueV1.test.ts \
  tests/textBlockInlineImageLineBoxV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
git diff --cached --check
git commit -m "feat(layout): define inline image line metrics"
```

### Task 2: Producer-Shaped V2 Evidence And U+FFFC Runtime Parity

**Files:**

- Create: `packages/text-engine-rust-wasm/src/multiRunEvidenceInternals.ts`
- Create: `packages/text-engine-rust-wasm/src/multiRunFlowEvidenceContractV2.ts`
- Create: `packages/text-engine-rust-wasm/src/multiRunFlowEvidenceV2.ts`
- Create: `src/layout/textBlockFlowEvidenceContractV2.ts`
- Create: `tests/fixtures/text-engine-multi-run-layout-v1-compatibility.v1.json`
- Create: `tests/textEngineFlowEvidenceV2.test.ts`
- Create: `tests/textEngineFlowEvidenceNodeWasmV2.test.ts`
- Modify: `packages/text-engine-rust-wasm/src/multiRunLayout.ts`
- Modify: `packages/text-engine-rust-wasm/src/multiRunLayoutContract.ts`
- Modify: `packages/text-engine-rust-wasm/src/node.ts`
- Modify: `packages/text-engine-rust-wasm/src/workerMr1.ts`
- Modify: `packages/text-engine-rust-wasm/src/index.ts`
- Modify: `src/index.ts`
- Modify: `tests/textEngineMultiRunLayoutV1.test.ts`
- Modify: `tests/textEngineMultiRunNodeWasmV1.test.ts`

**Interfaces:**

- Consumes:
  - `FlowDocTextEngineMultiRunRuntimeV1`;
  - V1 measurement/style/font inputs;
  - complete-string runtime segmentation.
- Produces:
  - Core-owned `VNextTextBlockFlowEvidenceInputV2`;
  - `FlowDocTextEngineFlowEvidenceInputV2`;
  - `FlowDocTextEngineFlowEvidenceResultV2`;
  - `createFlowDocTextEngineFlowEvidenceV2(input, runtime)`;
  - `runFlowDocTextEngineNodeFlowEvidenceV2(input)`;
  - Worker `flowEvidence(input)` method.

- [ ] **Step 1: Write the failing deterministic producer test**

Create `tests/textEngineFlowEvidenceV2.test.ts`. Use
`renderedText: "A\uFFFCB"` with text/image/text measurement runs and a fake
runtime. Require:

```ts
const result = createFlowDocTextEngineFlowEvidenceV2(input, runtime)
expect(result).toMatchObject({
  status: "accepted",
  summary: {
    sourceRunCount: 3,
    textBearingRunCount: 2,
    inlineImageCount: 1,
    shapingRunCount: 2,
    runtimeShapeCallCount: 2,
    runtimeSegmentationCallCount: 1,
  },
})
if (result.status !== "accepted") throw new Error("V2 evidence blocked")
expect(result.evidenceInput.measurement.renderedText).toBe("A\uFFFCB")
expect(result.evidenceInput.shapingRuns.map((run) => run.text)).toEqual(["A", "B"])
expect(result.evidenceInput.shapingRuns.every(
  (run) => run.renderEndOffset <= 1 || run.renderStartOffset >= 2,
)).toBe(true)
expect(result.evidenceInput).not.toHaveProperty("lines")
```

Also require image-only evidence to contain zero shaping runs, one complete
segmentation call, and valid `[0, renderedText.length]` boundary coverage.

Before changing producer internals, add this assertion inside the existing V1
producer test file, where `inputFixture()` and `fakeRuntime()` are already in
scope:

```ts
it("retains the exact external V1 producer boundary", async () => {
  const result = createFlowDocTextEngineMultiRunLayoutV1(
    inputFixture(),
    fakeRuntime(),
  )
  await expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
    "./fixtures/text-engine-multi-run-layout-v1-compatibility.v1.json",
  )
})
```

Capture it before refactoring:

```sh
npx vitest run tests/textEngineMultiRunLayoutV1.test.ts -u
npx vitest run tests/textEngineMultiRunLayoutV1.test.ts
```

Expected: both commands PASS and the second run does not rewrite the snapshot.

- [ ] **Step 2: Run the producer test and observe the missing boundary**

```sh
npx vitest run tests/textEngineFlowEvidenceV2.test.ts
```

Expected: FAIL because `createFlowDocTextEngineFlowEvidenceV2` does not exist.

- [ ] **Step 3: Define the external V2 producer contract**

First create the Core-owned data-only input in
`src/layout/textBlockFlowEvidenceContractV2.ts` and export it from
`src/index.ts`:

```ts
export interface VNextTextBlockFlowEvidenceInputV2 {
  initialFlowFingerprint: string
  layoutId: string
  measurement: VNextTextBlockV4MeasurementRequest
  layoutUnitPolicyFingerprint: string
  availableWidthLayoutUnit: number
  declaredLineHeightLayoutUnit: number
  paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1
  fontFaces: VNextTextBlockMultiRunFontFaceV1[]
  shapingRuns: VNextTextBlockResolvedShapingRunV1[]
  breakOffsets: number[]
}
```

Then create `multiRunFlowEvidenceContractV2.ts`:

```ts
export interface FlowDocTextEngineFlowEvidenceInputV2
  extends Omit<FlowDocTextEngineMultiRunLayoutInputV1, "bindProductionLayout"> {
  initialFlowFingerprint: string
  bindProductionLayout?: boolean
}

export type FlowDocTextEngineFlowEvidenceResultV2 =
  | {
      source: "flowdoc-text-engine-flow-evidence-v2"
      contractVersion: 2
      status: "accepted"
      runtimeKind: FlowDocTextEngineMultiRunRuntimeKindV1
      productionBinding: false
      evidenceInput: VNextTextBlockFlowEvidenceInputV2
      summary: {
        sourceRunCount: number
        textBearingRunCount: number
        hardBreakCount: number
        inlineImageCount: number
        shapingRunCount: number
        clusterCount: number
        breakOpportunityCount: number
        runtimeShapeCallCount: number
        runtimeSegmentationCallCount: 1
      }
      fingerprint: string
      issues: []
    }
  | {
      source: "flowdoc-text-engine-flow-evidence-v2"
      contractVersion: 2
      status: "blocked"
      runtimeKind: FlowDocTextEngineMultiRunRuntimeKindV1
      productionBinding: false
      evidenceInput: null
      summary: null
      fingerprint: null
      issues: FlowDocTextEngineMultiRunLayoutIssueV1[]
    }
```

Add no producer-selected line type to this contract.

- [ ] **Step 4: Extract shared shaping and segmentation preparation**

Move V1 input/style validation, effective-run coalescing, shaping, cluster
normalization, and complete-block segmentation into
`multiRunEvidenceInternals.ts`:

```ts
export function prepareFlowDocTextEngineMultiRunEvidenceInternal(input: {
  layout: FlowDocTextEngineMultiRunLayoutInputV1
  runtime: FlowDocTextEngineMultiRunRuntimeV1
  capability: "text-only-v1" | "inline-image-v2"
}): FlowDocTextEnginePreparedEvidenceInternalResult

export type FlowDocTextEnginePreparedEvidenceInternalResult =
  | {
      status: "accepted"
      paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1
      usedFontFaces: readonly VNextTextBlockMultiRunFontFaceV1[]
      shapingRuns: readonly VNextTextBlockResolvedShapingRunV1[]
      breakOffsets: readonly number[]
      sourceRunCount: number
      textBearingRunCount: number
      hardBreakCount: number
      inlineImageCount: number
      runtimeShapeCallCount: number
      runtimeSegmentationCallCount: 1
      issues: []
    }
  | {
      status: "blocked"
      paragraphStyle: null
      usedFontFaces: null
      shapingRuns: null
      breakOffsets: null
      sourceRunCount: number
      textBearingRunCount: number
      hardBreakCount: number
      inlineImageCount: number
      runtimeShapeCallCount: number
      runtimeSegmentationCallCount: 0 | 1
      issues: FlowDocTextEngineMultiRunLayoutIssueV1[]
    }
```

The closed source-run switch is:

```ts
switch (sourceRun.kind) {
  case "text":
  case "resolved-field":
  case "generated-page-number":
    // resolve effective style and shape
    break
  case "hard-break":
    // retain mandatory boundary; never shape
    break
  case "inline-image":
    if (input.capability === "text-only-v1") {
      issues.push(issue("inline-image-unsupported", path, "V1 producer remains text-only"))
    }
    // V2 retains the source slot; never shape U+FFFC
    break
}
```

Call `runtime.segment(measurement.renderedText)` exactly once. Intersect runtime
break offsets with valid atom/cluster boundaries and include start, end, and
mandatory hard-break offsets. Do not create line ranges in this helper.

- [ ] **Step 5: Keep V1 output exact through the shared preparation**

Refactor `createFlowDocTextEngineMultiRunLayoutInternalV1(...)` to call the
shared helper with `capability: "text-only-v1"`, then run its existing greedy
line construction and `acceptVNextTextBlockMultiRunLayoutV1(...)` unchanged.

Add a V1 assertion:

```ts
const before = createFlowDocTextEngineMultiRunLayoutV1(inputFixture(), fakeRuntime())
const after = createFlowDocTextEngineMultiRunLayoutV1(inputFixture(), fakeRuntime())
expect(after).toEqual(before)
```

The committed Task 1 V1 characterization and all existing V1 producer tests
remain the actual drift gate.

- [ ] **Step 6: Implement the V2 evidence producer**

Create `multiRunFlowEvidenceV2.ts`. Call the shared helper with
`capability: "inline-image-v2"` and emit:

```ts
const evidenceInput: VNextTextBlockFlowEvidenceInputV2 = {
  initialFlowFingerprint: input.initialFlowFingerprint,
  layoutId: input.layoutId,
  measurement: clone(input.measurement),
  layoutUnitPolicyFingerprint: createVNextLayoutUnitPolicyV1().fingerprint,
  availableWidthLayoutUnit: width.layoutUnit,
  declaredLineHeightLayoutUnit: input.declaredLineHeightLayoutUnit,
  paragraphStyle: prepared.paragraphStyle,
  fontFaces: prepared.usedFontFaces.map(clone),
  shapingRuns: prepared.shapingRuns.map(clone),
  breakOffsets: [...prepared.breakOffsets],
}
```

Fingerprint the adapter wrapper with runtime kind, evidence input, summary, and
non-production contracts. Core evidence input equality must remain independent
of runtime kind.

- [ ] **Step 7: Add Node-native and Worker-WASM evidence entrypoints**

In `node.ts` add:

```ts
export function runFlowDocTextEngineNodeFlowEvidenceV2(input: {
  layout: FlowDocTextEngineFlowEvidenceInputV2
  wasmSha256: string
}): {
  identity: {
    runtime: "node-native-mr1"
    measurementProfileId: string
    wasmSha256: typeof FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256
    wasmExecution: false
    executesRustybuzz: true
    executesIcu4x: true
    productionBinding: false
  }
  result: FlowDocTextEngineFlowEvidenceResultV2
}
```

Reuse the same verified Rustybuzz/ICU4X runtime object as the V1 Node layout.

Extend `FlowDocTextEngineMr1WorkerRuntimeV1` with:

```ts
flowEvidence(
  input: Omit<FlowDocTextEngineFlowEvidenceInputV2, "fontFaces">,
): FlowDocTextEngineFlowEvidenceResultV2
```

Reuse the already initialized WASM `shape` and `segment` functions.

- [ ] **Step 8: Write and run actual U+FFFC parity evidence**

In `tests/textEngineFlowEvidenceNodeWasmV2.test.ts`, run both real runtimes for:

```ts
[
  "\uFFFC",
  "A\uFFFCB",
  "ภาษา\uFFFCไทย",
  "A\uFFFC\uFFFCB",
  "\uFFFC\n\uFFFC",
]
```

For each row construct exact measurement runs, compare:

```ts
expect(wasm.evidenceInput).toEqual(node.result.evidenceInput)
expect(wasm.evidenceInput.breakOffsets).toEqual(
  node.result.evidenceInput.breakOffsets,
)
expect(wasm.evidenceInput.shapingRuns.every((run) => (
  !run.text.includes("\uFFFC") && !run.text.includes("\n")
))).toBe(true)
```

Run:

```sh
npx vitest run tests/textEngineFlowEvidenceNodeWasmV2.test.ts
```

Expected: PASS with actual pinned Node-native and Worker-WASM artifacts. If any
row differs, stop Phase 4B before Task 3 and revise the evidence boundary; do
not normalize away the difference in Core.

- [ ] **Step 9: Run producer regression gates and commit**

```sh
npx vitest run \
  tests/textEngineFlowEvidenceV2.test.ts \
  tests/textEngineFlowEvidenceNodeWasmV2.test.ts \
  tests/textEngineMultiRunLayoutV1.test.ts \
  tests/textEngineMultiRunNodeWasmV1.test.ts
npm run type-check
git diff --check
```

Expected: all selected tests and type-check PASS; V1 Node/WASM output remains
exact.

```sh
git add \
  packages/text-engine-rust-wasm/src/index.ts \
  packages/text-engine-rust-wasm/src/multiRunEvidenceInternals.ts \
  packages/text-engine-rust-wasm/src/multiRunFlowEvidenceContractV2.ts \
  packages/text-engine-rust-wasm/src/multiRunFlowEvidenceV2.ts \
  packages/text-engine-rust-wasm/src/multiRunLayout.ts \
  packages/text-engine-rust-wasm/src/multiRunLayoutContract.ts \
  packages/text-engine-rust-wasm/src/node.ts \
  packages/text-engine-rust-wasm/src/workerMr1.ts \
  src/index.ts \
  src/layout/textBlockFlowEvidenceContractV2.ts \
  tests/fixtures/text-engine-multi-run-layout-v1-compatibility.v1.json \
  tests/textEngineFlowEvidenceV2.test.ts \
  tests/textEngineFlowEvidenceNodeWasmV2.test.ts \
  tests/textEngineMultiRunLayoutV1.test.ts \
  tests/textEngineMultiRunNodeWasmV1.test.ts
git diff --cached --check
git commit -m "feat(text-engine): emit image-aware flow evidence"
```

### Task 3: Strict Core V2 Evidence Acceptance

**Files:**

- Modify: `src/layout/textBlockFlowEvidenceContractV2.ts`
- Create: `src/layout/textBlockFlowEvidenceV2.ts`
- Create: `tests/helpers/textBlockInlineImageFlowV2.ts`
- Create: `tests/textBlockFlowEvidenceV2.test.ts`
- Modify: `src/index.ts`

**Interfaces:**

- Consumes:
  - exact registered `VNextTextBlockInitialFlowV1`;
  - producer `VNextTextBlockFlowEvidenceInputV2`;
  - existing V1 shaping/font types.
- Produces:
  - `VNextTextBlockFlowEvidenceInputV2`;
  - `VNextTextBlockFlowEvidenceV2`;
  - `acceptVNextTextBlockFlowEvidenceV2(input)`;
  - `inspectVNextTextBlockFlowEvidenceV2(evidence)`;
  - internal exact Initial Flow/evidence binding lookup.

- [ ] **Step 1: Define failing accepted and rejected evidence tests**

Create a mixed paragraph fixture by changing
`listImageGeometryBuildInputFixture().textBlock.role` to
`{ role: "paragraph" }`. Classify it, build producer-shaped evidence with
text shaping only, then require:

```ts
const accepted = acceptVNextTextBlockFlowEvidenceV2({
  initialFlow,
  evidenceInput,
})
expect(accepted).toMatchObject({
  status: "accepted",
  evidence: {
    source: "vnext-text-block-flow-evidence-v2",
    contractVersion: 2,
    initialFlowFingerprint: initialFlow.fingerprint,
    shapingRuns: [expect.objectContaining({ text: "A" })],
    breakOffsets: [0, 1, 2],
    contracts: {
      producerSelectsLines: false,
      coreOwnsImageAdvance: true,
      coreOwnsLinePlacement: true,
      productionBinding: false,
    },
  },
  issues: [],
})
```

Require image-only with zero shaping runs to be accepted. Require null
`assetId`, list decoration, empty/effectively-empty, hard-break-only, shaping
coverage across U+FFFC, another Initial Flow fingerprint, cloned Initial Flow,
accessor-shaped roots, unsafe break offsets, and a `lines` extra key to block
in deterministic issue order.

- [ ] **Step 2: Run and observe the missing Core contract**

```sh
npx vitest run tests/textBlockFlowEvidenceV2.test.ts
```

Expected: FAIL because `acceptVNextTextBlockFlowEvidenceV2` is not exported.

- [ ] **Step 3: Define the Core V2 evidence types**

Extend `textBlockFlowEvidenceContractV2.ts` with the accepted evidence and
result types:

```ts
export interface VNextTextBlockFlowEvidenceV2
  extends VNextTextBlockFlowEvidenceInputV2 {
  source: "vnext-text-block-flow-evidence-v2"
  contractVersion: 2
  contracts: {
    producerSelectsLines: false
    shapingCoversTextBearingSlotsOnly: true
    breakOffsetsCoverCompleteRenderedText: true
    coreOwnsImageAdvance: true
    coreOwnsLinePlacement: true
    processLocalImmutableEvidence: true
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export interface VNextTextBlockFlowEvidenceIssueV2 {
  code:
    | "invalid-input"
    | "production-binding-forbidden"
    | "initial-flow-provenance-mismatch"
    | "initial-flow-binding-mismatch"
    | "unsupported-flow-capability"
    | "unresolved-inline-image"
    | "measurement-context-mismatch"
    | "invalid-shaping-coverage"
    | "invalid-break-offsets"
    | "unsafe-layout-arithmetic"
  severity: "error"
  path: string
  message: string
  inlineId?: string
  shapingRunId?: string
}

export type VNextTextBlockFlowEvidenceAcceptanceResultV2 =
  | {
      status: "accepted"
      evidence: VNextTextBlockFlowEvidenceV2
      issues: []
    }
  | {
      status: "blocked"
      evidence: null
      issues: readonly VNextTextBlockFlowEvidenceIssueV2[]
    }
```

The public acceptance signature is:

```ts
export function acceptVNextTextBlockFlowEvidenceV2(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidenceInput: VNextTextBlockFlowEvidenceInputV2
  bindProductionLayout?: boolean
}): VNextTextBlockFlowEvidenceAcceptanceResultV2
```

- [ ] **Step 4: Implement strict acceptance and registration**

In `textBlockFlowEvidenceV2.ts`:

1. inspect the exact Initial Flow object;
2. allow inline-image capability but reject list and empty capabilities;
3. require at least one text-bearing or non-null image atom;
4. compare measurement, width, unit policy, line height, paragraph style, and
   font faces to Initial Flow;
5. validate shaping coverage as the exact union of text/resolved-field/page
   ranges;
6. require no shaping range to intersect image or hard-break slots;
7. validate breaks against complete rendered text and cluster/atom boundaries;
8. clone, fingerprint, recursively freeze, and register the accepted evidence
   in a `WeakMap<VNextTextBlockFlowEvidenceV2, VNextTextBlockInitialFlowV1>`.

Expose only the public accept/inspect functions from `src/index.ts`. Keep:

```ts
export function hasVNextTextBlockFlowEvidenceBindingInternalV2(
  evidence: VNextTextBlockFlowEvidenceV2,
  initialFlow: VNextTextBlockInitialFlowV1,
): boolean
```

available to Core modules by direct internal import, not the package index.

- [ ] **Step 5: Build the reusable exact fixture helper**

Create `tests/helpers/textBlockInlineImageFlowV2.ts` with:

```ts
export interface InlineImageFlowFixtureOptions {
  content?: "image-only" | "text-image-text" | "adjacent-images" | "text-only"
  verticalAlign?: "baseline" | "middle" | "text-bottom"
  width?: UnitValueV4Target
  height?: UnitValueV4Target
  assetId?: string | null
  breakOffsets?: readonly number[]
  entries?: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
}

export function acceptedInlineImageEvidenceFixture(
  options: InlineImageFlowFixtureOptions = {},
): {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
}
```

Build all later objects from these exact returned references. Never
`structuredClone` an accepted authority object inside the happy-path helper.

- [ ] **Step 6: Run the 4B-1 Core gate and commit**

```sh
npx vitest run \
  tests/layoutUnitPositiveValueV1.test.ts \
  tests/textBlockInlineImageLineBoxV1.test.ts \
  tests/textBlockFlowEvidenceV2.test.ts \
  tests/textEngineFlowEvidenceV2.test.ts \
  tests/textEngineFlowEvidenceNodeWasmV2.test.ts \
  tests/textBlockInitialFlowInputV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts \
  tests/textEngineMultiRunLayoutV1.test.ts \
  tests/textEngineMultiRunNodeWasmV1.test.ts
npm run type-check
git diff --check
```

Expected: all selected tests and type-check PASS. This is the 4B-1 stop gate.
If runtime evidence parity or V1 output differs, do not begin Phase 4B-2.

```sh
git add \
  src/index.ts \
  src/layout/textBlockFlowEvidenceContractV2.ts \
  src/layout/textBlockFlowEvidenceV2.ts \
  tests/helpers/textBlockInlineImageFlowV2.ts \
  tests/textBlockFlowEvidenceV2.test.ts
git diff --cached --check
git commit -m "feat(layout): accept v2 flow evidence"
```

---

## Phase 4B-2 — Flow Atom And Persistent Tree Foundation

### Task 4: Internal Authority And Shared Persistent Rope

**Files:**

- Create: `src/layout/textBlockLayoutAuthorityInternalsV1.ts`
- Create: `src/layout/textBlockPersistentRopeKernelV1.ts`
- Modify: `src/layout/textBlockPersistentFlowTreeInternalsV1.ts`
- Modify: `src/layout/textBlockPersistentFlowTreeV1.ts`
- Modify: `tests/textBlockPersistentFlowTreeV1.test.ts`
- Modify: `tests/textBlockV1LayoutCompatibility.test.ts`

**Interfaces:**

- Consumes:
  - existing V1 exact tree/request binding;
  - existing V1 leaf/branch factories and fingerprints.
- Produces:
  - internal opaque V1/V2 authority registry;
  - generic immutable rope mechanics;
  - unchanged V1 public tree.

- [ ] **Step 1: Add failing source-structure and V1 parity guards**

Require:

```ts
const kernel = readFileSync(
  resolve("src/layout/textBlockPersistentRopeKernelV1.ts"),
  "utf8",
)
const v1 = readFileSync(
  resolve("src/layout/textBlockPersistentFlowTreeInternalsV1.ts"),
  "utf8",
)
expect(kernel).toContain("buildVNextTextBlockPersistentRopeRootKernelV1")
expect(v1).toContain("buildVNextTextBlockPersistentRopeRootKernelV1")
expect(v1).not.toContain("while (current.length > 1)")
```

Run the existing V1 tree tests and Task 1 file snapshot before extraction.

- [ ] **Step 2: Run and observe the missing kernel**

```sh
npx vitest run \
  tests/textBlockPersistentFlowTreeV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
```

Expected: FAIL only on the new source-structure assertion.

- [ ] **Step 3: Extract generic rope mechanics**

Create `textBlockPersistentRopeKernelV1.ts`:

```ts
export function partitionVNextTextBlockPersistentValuesKernelV1<T>(
  values: readonly T[],
  maximumValues: number,
): readonly (readonly T[])[]

export function buildVNextTextBlockPersistentRopeRootKernelV1<TNode>(input: {
  leaves: readonly TNode[]
  maximumBranchChildren: number
  createBranch(children: readonly TNode[]): TNode
}): TNode

export function countVNextTextBlockPersistentRopeNodesKernelV1<TNode>(input: {
  root: TNode
  children(node: TNode): readonly TNode[]
}): number

export function collectVNextTextBlockPersistentRopeNodesKernelV1<TNode>(input: {
  root: TNode
  children(node: TNode): readonly TNode[]
}): readonly TNode[]
```

Validate positive safe limits, preserve source order, and keep all generated
levels balanced. These are internal algorithm callbacks, not public atom
plugins.

Refactor V1 to call the kernel while retaining its existing item projection,
summary, node factory, fingerprint, suffix proof, and public object shape.

- [ ] **Step 4: Add the opaque authority registry**

Create `textBlockLayoutAuthorityInternalsV1.ts` with a private empty frozen
token type and WeakMaps:

```ts
const layoutAuthorityBrand = Symbol("vnext-text-block-layout-authority")
type LayoutAuthorityToken = Readonly<{
  [layoutAuthorityBrand]: true
}>

function createLayoutAuthorityToken(): LayoutAuthorityToken {
  return Object.freeze({ [layoutAuthorityBrand]: true })
}

export function getOrCreateVNextTextBlockV1LayoutAuthorityInternalV1(input: {
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
}): LayoutAuthorityToken | null

export function registerVNextTextBlockV2LayoutAuthorityInternalV1(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: object
}): LayoutAuthorityToken

export function getVNextTextBlockV2LayoutAuthorityInternalV1(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: object
}): LayoutAuthorityToken | null

export function bindVNextTextBlockSpatialIndexAuthorityInternalV1(
  index: object,
  authority: LayoutAuthorityToken,
): void

export function hasVNextTextBlockSpatialIndexAuthorityInternalV1(
  index: object,
  authority: LayoutAuthorityToken,
): boolean
```

V1 authority creation must first call the existing exact
tree/request-binding check. The token has no public fields, serialization,
fingerprint, export, or persistence path.

- [ ] **Step 5: Run V1 compatibility after extraction**

```sh
npx vitest run \
  tests/textBlockPersistentFlowTreeV1.test.ts \
  tests/textBlockPersistentFlowUpdateV1.test.ts \
  tests/liveDraftMr1PersistentFlowFoundation.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
npm run type-check
git diff --check
```

Expected: all tests and type-check PASS with the characterization file
unchanged.

- [ ] **Step 6: Commit the shared rope and authority**

```sh
git add \
  src/layout/textBlockLayoutAuthorityInternalsV1.ts \
  src/layout/textBlockPersistentRopeKernelV1.ts \
  src/layout/textBlockPersistentFlowTreeInternalsV1.ts \
  src/layout/textBlockPersistentFlowTreeV1.ts \
  tests/textBlockPersistentFlowTreeV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
git diff --cached --check
git commit -m "refactor(layout): share persistent rope mechanics"
```

### Task 5: Closed V2 Flow Atoms And Persistent Tree

**Files:**

- Create: `src/layout/textBlockPersistentFlowContractV2.ts`
- Create: `src/layout/textBlockPersistentFlowTreeV2.ts`
- Create: `tests/textBlockPersistentFlowTreeV2.test.ts`
- Modify: `tests/helpers/textBlockInlineImageFlowV2.ts`
- Modify: `src/index.ts`

**Interfaces:**

- Consumes:
  - exact Initial Flow/evidence binding;
  - Task 1 frame conversion/alignment policy;
  - Task 4 rope and authority internals.
- Produces:
  - closed `VNextTextBlockPersistentFlowAtomV2`;
  - `VNextTextBlockPersistentFlowTreeV2`;
  - `createVNextTextBlockPersistentFlowTreeV2(input)`;
  - `inspectVNextTextBlockPersistentFlowTreeV2(tree)`;
  - `collectVNextTextBlockPersistentFlowNodesForQaV2(tree)`.

- [ ] **Step 1: Write failing image-only and mixed-tree tests**

Require an image-only tree to contain:

```ts
expect(tree.itemsByKind).toEqual({
  "text-cluster": 0,
  "hard-break": 0,
  "inline-image": 1,
})
expect(image).toMatchObject({
  kind: "inline-image",
  inlineId: "image-1",
  assetId: "asset-1",
  renderStartOffset: 0,
  renderEndOffset: 1,
  renderedText: "\uFFFC",
  widthLayoutUnit: 10_000_000,
  heightLayoutUnit: 12_000_000,
  verticalAlign: "middle",
  alignmentPolicyFingerprint:
    VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1.fingerprint,
})
```

For mixed content, require text clusters, image, text clusters, and hard break
to preserve exact monotonic source order. Require `fit`/`crop` changes to
change the tree fingerprint. Require no `suffixProof`, accepted layout, line,
reuse, or reconvergence fields.

- [ ] **Step 2: Run and observe the missing V2 tree export**

```sh
npx vitest run tests/textBlockPersistentFlowTreeV2.test.ts
```

Expected: FAIL because `createVNextTextBlockPersistentFlowTreeV2` does not
exist.

- [ ] **Step 3: Define the closed atom union and tree**

In `textBlockPersistentFlowContractV2.ts`:

```ts
export type VNextTextBlockPersistentFlowAtomV2 =
  | {
      kind: "text-cluster"
      inlineId: string
      sourceKind: "text" | "resolved-field" | "generated-page-number"
      fieldKey?: string
      generatedOwnerFingerprint?: string
      renderStartOffset: number
      renderEndOffset: number
      renderedText: string
      shapingRunId: string
      styleKey: string
      fontFaceId: string
      fontSizeLayoutUnit: number
      textColor: string
      advanceLayoutUnit: number
      ascentLayoutUnit: number
      descentLayoutUnit: number
      lineGapLayoutUnit: number
      dependencyFingerprint: string
      fingerprint: string
    }
  | {
      kind: "hard-break"
      inlineId: string
      renderStartOffset: number
      renderEndOffset: number
      renderedText: "\n" | "\r" | "\r\n"
      fingerprint: string
    }
  | {
      kind: "inline-image"
      inlineId: string
      assetId: string
      renderStartOffset: number
      renderEndOffset: number
      renderedText: "\uFFFC"
      widthLayoutUnit: number
      heightLayoutUnit: number
      authoredFrame: ImageFrameV4Target
      verticalAlign: "baseline" | "middle" | "text-bottom"
      alignmentPolicyFingerprint: string
      dependencyFingerprint: string
      fingerprint: string
    }
```

Define V2 leaf/branch/tree types:

```ts
export interface VNextTextBlockPersistentFlowSummaryV2 {
  renderedUtf16Length: number
  atomCount: number
  leafCount: number
  nodeCount: number
  textClusterCount: number
  hardBreakCount: number
  inlineImageCount: number
  semanticFingerprint: string
}

export interface VNextTextBlockPersistentFlowLeafV2 {
  nodeKind: "leaf"
  height: 0
  atoms: readonly VNextTextBlockPersistentFlowAtomV2[]
  summary: VNextTextBlockPersistentFlowSummaryV2
  fingerprint: string
}

export interface VNextTextBlockPersistentFlowBranchV2 {
  nodeKind: "branch"
  height: number
  children: readonly VNextTextBlockPersistentFlowNodeV2[]
  summary: VNextTextBlockPersistentFlowSummaryV2
  fingerprint: string
}

export type VNextTextBlockPersistentFlowNodeV2 =
  | VNextTextBlockPersistentFlowLeafV2
  | VNextTextBlockPersistentFlowBranchV2

export interface VNextTextBlockPersistentFlowTreeV2 {
  source: "vnext-text-block-persistent-flow-tree-v2"
  contractVersion: 2
  documentId: string
  sectionId: string
  textBlockId: string
  instanceRevision: number
  layoutId: string
  layoutContextFingerprint: string
  initialFlowFingerprint: string
  flowEvidenceFingerprint: string
  policy: VNextTextBlockPersistentFlowPolicyV1
  root: VNextTextBlockPersistentFlowNodeV2
  summary: VNextTextBlockPersistentFlowSummaryV2
  itemsByKind: Readonly<{
    "text-cluster": number
    "hard-break": number
    "inline-image": number
  }>
  contracts: {
    closedFlowAtomUnion: true
    balancedLeafDepth: true
    sharedPersistentRopeKernel: true
    processLocalImmutableTree: true
    suffixReuseClaim: false
    reconvergenceClaim: false
    stagedEditorApply: false
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}
```

The tree has no accepted-layout, line, suffix-proof, reuse, or reconvergence
field.

- [ ] **Step 4: Project evidence into atoms**

Implement `createVNextTextBlockPersistentFlowTreeV2(...)` with strict envelope:

```ts
{
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  bindProductionLayout?: boolean
}
```

For text-bearing slots, derive accepted shaping-run metrics using the existing
font metric scaling rules and create one atom per shaping cluster. For images,
convert frame width/height through
`convertVNextPositiveUnitValueToLayoutUnitV1(...)` and retain the complete
authored frame. For hard breaks, create one mandatory atom.

Use Task 4 rope mechanics to partition and balance nodes. Register the exact
Initial Flow/evidence/tree tuple with the V2 authority registry only after the
tree is deeply frozen and fingerprinted.

- [ ] **Step 5: Add identity and topology rejection tests**

Reject cloned evidence, another Initial Flow, changed evidence input,
non-contiguous clusters, text shaping across an image, null media, unsafe
dimension conversion, unknown atom kinds, production binding, and mutated
registered output. Every blocked result returns `tree: null`.

- [ ] **Step 6: Run the 4B-2 stop gate and commit**

```sh
npx vitest run \
  tests/textBlockPersistentFlowTreeV2.test.ts \
  tests/textBlockFlowEvidenceV2.test.ts \
  tests/textBlockPersistentFlowTreeV1.test.ts \
  tests/textBlockPersistentFlowUpdateV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
npm run type-check
git diff --check
```

Expected: all selected tests and type-check PASS; V1 snapshot/fingerprints are
unchanged and no identity gate was weakened. This is the 4B-2 stop gate.

```sh
git add \
  src/index.ts \
  src/layout/textBlockPersistentFlowContractV2.ts \
  src/layout/textBlockPersistentFlowTreeV2.ts \
  tests/helpers/textBlockInlineImageFlowV2.ts \
  tests/textBlockPersistentFlowTreeV2.test.ts
git diff --cached --check
git commit -m "feat(layout): build persistent image flow tree v2"
```

---

## Phase 4B-3 — Shared Spatial Placement

### Task 6: Extract Shared Spatial Index And Flow Region Kernels

**Files:**

- Create: `src/layout/textBlockSpatialIndexKernelV1.ts`
- Create: `src/layout/textBlockFlowRegionKernelV1.ts`
- Modify: `src/layout/textBlockSpatialIndexInternalsV1.ts`
- Modify: `src/layout/textBlockSpatialIndexV1.ts`
- Modify: `src/layout/textBlockSpatialIndexUpdateV1.ts`
- Modify: `src/layout/textBlockFlowRegionProviderV1.ts`
- Modify: `tests/textBlockSpatialIndexV1.test.ts`
- Modify: `tests/textBlockSpatialIndexUpdateV1.test.ts`
- Modify: `tests/textBlockFlowRegionProviderV1.test.ts`
- Modify: `tests/textBlockV1LayoutCompatibility.test.ts`

**Interfaces:**

- Consumes:
  - V1 spatial entry/node shapes and exact V1 bindings;
  - Task 4 internal authority.
- Produces:
  - one treap/query/path-copy kernel;
  - one interval/barrier/overlay/event kernel;
  - unchanged V1 public spatial results.

- [ ] **Step 1: Add failing single-owner source guards**

Require V1 modules to import:

```ts
buildVNextTextBlockSpatialIndexRootKernelV1
queryVNextTextBlockSpatialIndexKernelV1
updateVNextTextBlockSpatialIndexRootKernelV1
computeVNextTextBlockFlowRegionKernelV1
```

Require treap rotations and interval subtraction to occur only in their
respective kernel files.

- [ ] **Step 2: Run V1 spatial tests before extraction**

```sh
npx vitest run \
  tests/textBlockSpatialIndexV1.test.ts \
  tests/textBlockSpatialIndexUpdateV1.test.ts \
  tests/textBlockFlowRegionProviderV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
```

Expected: FAIL only on the new source-owner assertions.

- [ ] **Step 3: Extract the persistent treap kernel**

Create `textBlockSpatialIndexKernelV1.ts`:

```ts
export function buildVNextTextBlockSpatialIndexRootKernelV1(
  entries: readonly VNextTextBlockSpatialIndexEntryV1[],
): VNextTextBlockSpatialIndexNodeV1 | null

export function queryVNextTextBlockSpatialIndexKernelV1(input: {
  root: VNextTextBlockSpatialIndexNodeV1 | null
  topLayoutUnit: number
  bottomLayoutUnit: number
}): {
  entries: readonly VNextTextBlockSpatialIndexEntryV1[]
  visitedNodeCount: number
}

export function updateVNextTextBlockSpatialIndexRootKernelV1(input: {
  root: VNextTextBlockSpatialIndexNodeV1 | null
  previousEntry: VNextTextBlockSpatialIndexEntryV1 | null
  nextEntry: VNextTextBlockSpatialIndexEntryV1 | null
}): {
  root: VNextTextBlockSpatialIndexNodeV1 | null
  visitedNodeCount: number
  createdNodeCount: number
}
```

Move compare, priority, rotation, insertion, deletion, merge, maximum-bottom
summary, and query pruning into this file. Keep V1 parsing, public assembly,
binding, source/version, and fingerprints outside it.

When V1 assembles an index, obtain the Task 4 token only after the existing
tree/request exact-object check succeeds and bind the index to both:

```ts
processLocalSpatialIndexBindingsV1.set(index, {
  persistentFlowTree: input.persistentFlowTree,
  request: input.request,
  requestFingerprint: spatialFingerprintV1(input.request),
  authority,
  entriesByObjectId,
})
```

`hasSpatialIndexBindingV1(...)` must continue checking the exact tree, exact
request, unchanged request fingerprint, existing tree/request binding, and the
same token. The token supplements these gates; it never replaces them.

- [ ] **Step 4: Extract pure Flow Region calculation**

Create `textBlockFlowRegionKernelV1.ts`:

```ts
export function computeVNextTextBlockFlowRegionKernelV1(input: {
  contentStartLayoutUnit: number
  contentEndLayoutUnit: number
  bandTopLayoutUnit: number
  bandBottomLayoutUnit: number
  flowAffectingEntryCount: number
  query(): {
    entries: readonly VNextTextBlockSpatialIndexEntryV1[]
    visitedNodeCount: number
  }
}): VNextTextBlockFlowRegionKernelResultV1

export type VNextTextBlockFlowRegionKernelResultV1 =
  | {
      status: "accepted"
      intervals: readonly VNextTextBlockFlowIntervalV1[]
      intersectingEntryFingerprints: readonly string[]
      nextYLayoutUnit: number | null
      work: VNextTextBlockFlowRegionWorkV1
      issues: []
    }
  | {
      status: "blocked"
      intervals: null
      intersectingEntryFingerprints: null
      nextYLayoutUnit: null
      work: null
      issues: VNextTextBlockFlowRegionIssueV1[]
    }
```

If `flowAffectingEntryCount === 0`, return one full interval without calling
`query`. Otherwise filter overlays, make barriers return no interval, subtract
rectangular envelopes, sort/coalesce intervals, and choose the minimum proved
future bottom as `nextYLayoutUnit`.

V1 provider retains its exact binding checks, public result shape,
fingerprinting, freezing, and registration around this kernel.

- [ ] **Step 5: Prove exact V1 compatibility**

Run:

```sh
npx vitest run \
  tests/textBlockSpatialIndexV1.test.ts \
  tests/textBlockSpatialIndexUpdateV1.test.ts \
  tests/textBlockFlowRegionProviderV1.test.ts \
  tests/textBlockSpatialWrappingLayoutV1.test.ts \
  tests/textBlockAuthoredBoxGeometryV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
npm run type-check
git diff --check
```

Expected: all selected tests and type-check PASS, including exact V1 file
snapshot and existing structural-sharing counts.

- [ ] **Step 6: Commit the spatial kernel extraction**

```sh
git add \
  src/layout/textBlockSpatialIndexKernelV1.ts \
  src/layout/textBlockFlowRegionKernelV1.ts \
  src/layout/textBlockSpatialIndexInternalsV1.ts \
  src/layout/textBlockSpatialIndexV1.ts \
  src/layout/textBlockSpatialIndexUpdateV1.ts \
  src/layout/textBlockFlowRegionProviderV1.ts \
  tests/textBlockSpatialIndexV1.test.ts \
  tests/textBlockSpatialIndexUpdateV1.test.ts \
  tests/textBlockFlowRegionProviderV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
git diff --cached --check
git commit -m "refactor(layout): share spatial region kernels"
```

### Task 7: V2 Spatial Index, Move/Resize, And Flow Regions

**Files:**

- Create: `src/layout/textBlockSpatialIndexContractV2.ts`
- Create: `src/layout/textBlockSpatialIndexV2.ts`
- Create: `src/layout/textBlockSpatialIndexUpdateV2.ts`
- Create: `src/layout/textBlockFlowRegionProviderV2.ts`
- Create: `tests/textBlockSpatialIndexV2.test.ts`
- Create: `tests/textBlockFlowRegionProviderV2.test.ts`
- Modify: `tests/helpers/textBlockInlineImageFlowV2.ts`
- Modify: `src/index.ts`

**Interfaces:**

- Consumes:
  - exact V2 Initial Flow/evidence/tree authority;
  - existing strict synthetic entry contract;
  - Task 6 kernels.
- Produces:
  - `VNextTextBlockSpatialIndexV2`;
  - `createVNextTextBlockSpatialIndexV2(input)`;
  - `createVNextTextBlockSpatialIndexUpdateV2(input)`;
  - `provideVNextTextBlockFlowRegionsV2(input)`;
  - V2 result inspectors.

- [ ] **Step 1: Write failing V2 index and provider tests**

Build an exact V2 tree and require:

```ts
const built = createVNextTextBlockSpatialIndexV2({
  inputAuthority: "core-synthetic-qa-only",
  initialFlow,
  evidence,
  persistentFlowTree: tree,
  entries,
})
expect(built).toMatchObject({
  status: "accepted",
  index: {
    source: "vnext-text-block-spatial-index-v2",
    contractVersion: 2,
    persistentFlowTreeFingerprint: tree.fingerprint,
    flowEvidenceFingerprint: evidence.fingerprint,
    contracts: {
      sharedPersistentTreap: true,
      productionBinding: false,
    },
  },
})
```

Require left/right/middle subtraction, top-bottom barriers, overlay neutrality,
and zero-space event advancement through the V2 provider.

- [ ] **Step 2: Run and observe missing V2 spatial exports**

```sh
npx vitest run \
  tests/textBlockSpatialIndexV2.test.ts \
  tests/textBlockFlowRegionProviderV2.test.ts
```

Expected: FAIL because the V2 index/provider entrypoints do not exist.

- [ ] **Step 3: Define and assemble the V2 spatial index**

Define V2 index/source/version types around the existing entry/node/summary
shapes. Add exact fingerprints for Initial Flow, evidence, tree, layout
context, and content width. Implement:

```ts
export function createVNextTextBlockSpatialIndexV2(input: {
  inputAuthority: "core-synthetic-qa-only"
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
}): VNextTextBlockSpatialIndexBuildResultV2
```

Define:

```ts
export interface VNextTextBlockSpatialIndexV2 {
  source: "vnext-text-block-spatial-index-v2"
  contractVersion: 2
  inputAuthority: "core-synthetic-qa-only"
  documentId: string
  sectionId: string
  textBlockId: string
  instanceRevision: number
  layoutId: string
  layoutContextFingerprint: string
  initialFlowFingerprint: string
  flowEvidenceFingerprint: string
  persistentFlowTreeFingerprint: string
  contentLeftLayoutUnit: 0
  contentRightLayoutUnit: number
  root: VNextTextBlockSpatialIndexNodeV1 | null
  summary: VNextTextBlockSpatialIndexSummaryV1
  contracts: {
    canonicalPositionedObjectSchema: false
    authoredPositionedObjectBinding: false
    sharedPersistentTreap: true
    processLocalImmutableIndex: true
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export interface VNextTextBlockSpatialIssueV2 {
  code:
    | "invalid-input"
    | "input-authority-mismatch"
    | "layout-authority-mismatch"
    | "spatial-index-provenance-mismatch"
    | "spatial-index-binding-mismatch"
    | VNextTextBlockSpatialIndexIssueCodeV1
  severity: "error"
  path: string
  message: string
  objectId?: string
}

export type VNextTextBlockSpatialIndexBuildResultV2 =
  | {
      status: "accepted"
      index: VNextTextBlockSpatialIndexV2
      issues: []
    }
  | {
      status: "blocked"
      index: null
      issues: readonly VNextTextBlockSpatialIssueV2[]
    }
```

Resolve the exact V2 authority, reuse V1 strict entry parsing and Task 6 treap
build, assemble/fingerprint/freeze a V2 wrapper, then bind the index object to
that authority token.

- [ ] **Step 4: Implement V2 path-copy move/resize**

Mirror the strict V1 update envelope using V2 index/tree/evidence identities
and Task 6 path-copy kernel:

```ts
export function createVNextTextBlockSpatialIndexUpdateV2(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  previousIndex: VNextTextBlockSpatialIndexV2
  expectedPreviousIndexFingerprint: string
  objectId: string
  nextGeometry: {
    xLayoutUnit: number
    yLayoutUnit: number
    widthLayoutUnit: number
    heightLayoutUnit: number
  }
}): VNextTextBlockSpatialIndexUpdateResultV2

export type VNextTextBlockSpatialIndexUpdateResultV2 =
  | {
      status: "accepted"
      update: {
        source: "vnext-text-block-spatial-index-update-v2"
        contractVersion: 2
        previousIndexFingerprint: string
        nextIndexFingerprint: string
        affectedBands: readonly VNextTextBlockSpatialBandV1[]
        work: VNextTextBlockSpatialIndexUpdateWorkV1
        fingerprint: string
      }
      nextIndex: VNextTextBlockSpatialIndexV2
      issues: []
    }
  | {
      status: "blocked"
      update: null
      nextIndex: null
      issues: readonly VNextTextBlockSpatialIssueV2[]
    }
```

Return exact old/new affected-band union and structural-sharing work facts.
Register the next index with the same authority. Do not report reused lines or
reconvergence.

- [ ] **Step 5: Implement the V2 provider wrapper**

Implement:

```ts
export function provideVNextTextBlockFlowRegionsV2(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  spatialIndex: VNextTextBlockSpatialIndexV2
  band: VNextTextBlockSpatialBandV1
  contentInsets: {
    leftLayoutUnit: number
    rightLayoutUnit: number
  }
}): VNextTextBlockFlowRegionResultV2

export type VNextTextBlockFlowRegionResultV2 =
  | {
      status: "accepted"
      source: "vnext-text-block-flow-region-v2"
      contractVersion: 2
      intervals: readonly VNextTextBlockFlowIntervalV1[]
      intersectingEntryFingerprints: readonly string[]
      nextYLayoutUnit: number | null
      work: VNextTextBlockFlowRegionWorkV1
      mayPublishLayout: false
      productionBinding: false
      fingerprint: string
      issues: []
    }
  | {
      status: "blocked"
      source: "vnext-text-block-flow-region-v2"
      contractVersion: 2
      intervals: null
      intersectingEntryFingerprints: null
      nextYLayoutUnit: null
      work: null
      mayPublishLayout: false
      productionBinding: false
      fingerprint: null
      issues: readonly VNextTextBlockSpatialIssueV2[]
    }
```

Validate exact authority/index binding, call Task 6 Flow Region kernel, and
assemble V2 fingerprints. The empty and overlay-only paths must report
`spatialIndexQueryCount: 0`.

- [ ] **Step 6: Add authority, move, and resize rejection rows**

Reject cloned/equal Initial Flow, evidence, tree, and index; stale expected
fingerprint; changed exclusion geometry; duplicate ids; invalid wrap policy;
boundary overflow; unsafe arithmetic; and a provider band that cannot advance.
Require moved/resized V2 indexes to change provider intervals while preserving
the same exact flow authority.

- [ ] **Step 7: Run V2/V1 spatial gates and commit**

```sh
npx vitest run \
  tests/textBlockSpatialIndexV2.test.ts \
  tests/textBlockFlowRegionProviderV2.test.ts \
  tests/textBlockSpatialIndexV1.test.ts \
  tests/textBlockSpatialIndexUpdateV1.test.ts \
  tests/textBlockFlowRegionProviderV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
npm run type-check
git diff --check
```

Expected: all selected tests and type-check PASS.

```sh
git add \
  src/index.ts \
  src/layout/textBlockSpatialIndexContractV2.ts \
  src/layout/textBlockSpatialIndexV2.ts \
  src/layout/textBlockSpatialIndexUpdateV2.ts \
  src/layout/textBlockFlowRegionProviderV2.ts \
  tests/helpers/textBlockInlineImageFlowV2.ts \
  tests/textBlockSpatialIndexV2.test.ts \
  tests/textBlockFlowRegionProviderV2.test.ts
git diff --cached --check
git commit -m "feat(layout): index v2 flow regions"
```

### Task 8: Extract The Shared Spatial Line-Placement Kernel

**Files:**

- Create: `src/layout/textBlockSpatialWrappingKernelV1.ts`
- Modify: `src/layout/textBlockSpatialWrappingLayoutV1.ts`
- Modify: `tests/textBlockSpatialWrappingLayoutV1.test.ts`
- Modify: `tests/textBlockV1LayoutCompatibility.test.ts`

**Interfaces:**

- Consumes:
  - closed internal placement atoms;
  - a version adapter for validated region queries and line metrics.
- Produces:
  - shared break grouping, interval placement, vertical advancement, and
    expanded-band stabilization;
  - unchanged V1 public geometry.

- [ ] **Step 1: Add a failing shared-kernel owner guard**

Require:

```ts
expect(v1Source).toContain("runVNextTextBlockSpatialWrappingKernelV1")
expect(v1Source).toContain("createVNextTextBlockBreakGroupsKernelV1")
expect(kernelSource).toContain("placeVNextTextBlockBreakGroupsKernelV1")
expect(kernelSource).toContain("lineBandRequeryCount")
expect(v1Source).not.toContain("while (groupIndex < projection.groups.length)")
```

- [ ] **Step 2: Run V1 layout tests before extraction**

```sh
npx vitest run \
  tests/textBlockSpatialWrappingLayoutV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
```

Expected: FAIL only on the new owner guard.

- [ ] **Step 3: Define the closed internal placement union**

In `textBlockSpatialWrappingKernelV1.ts`:

```ts
export type VNextTextBlockPlacementAtomKernelV1 =
  | {
      kind: "text-cluster"
      renderStartOffset: number
      renderEndOffset: number
      advanceLayoutUnit: number
      payloadIndex: number
    }
  | {
      kind: "inline-image"
      renderStartOffset: number
      renderEndOffset: number
      advanceLayoutUnit: number
      payloadIndex: number
    }
  | {
      kind: "hard-break"
      renderStartOffset: number
      renderEndOffset: number
      advanceLayoutUnit: 0
      payloadIndex: number
    }

export interface VNextTextBlockBreakGroupKernelV1 {
  renderStartOffset: number
  renderEndOffset: number
  atoms: readonly VNextTextBlockPlacementAtomKernelV1[]
  advanceLayoutUnit: number
  mandatoryBreak: boolean
}

export type VNextTextBlockBreakGroupProjectionKernelResultV1 =
  | {
      status: "accepted"
      groups: readonly VNextTextBlockBreakGroupKernelV1[]
      issues: []
    }
  | {
      status: "blocked"
      groups: null
      issues: readonly {
        code:
          | "invalid-flow-atom-coverage"
          | "invalid-break-offsets"
          | "break-boundary-inside-atom"
          | "unsafe-layout-arithmetic"
        message: string
      }[]
    }

export function createVNextTextBlockBreakGroupsKernelV1(input: {
  atoms: readonly VNextTextBlockPlacementAtomKernelV1[]
  breakOffsets: readonly number[]
  renderedUtf16Length: number
}): VNextTextBlockBreakGroupProjectionKernelResultV1
```

No unknown atom callback or public plugin entrypoint is permitted.

- [ ] **Step 4: Extract placement and stabilization**

Implement:

```ts
export function placeVNextTextBlockBreakGroupsKernelV1(input: {
  groups: readonly VNextTextBlockBreakGroupKernelV1[]
  startGroupIndex: number
  intervals: readonly VNextTextBlockFlowIntervalV1[]
}): VNextTextBlockPlacementKernelResultV1

export function runVNextTextBlockSpatialWrappingKernelV1(input: {
  groups: readonly VNextTextBlockBreakGroupKernelV1[]
  startYLayoutUnit: number
  baseBandHeightLayoutUnit: number
  maximumBandRequeryCount: number
  provideRegion(band: VNextTextBlockSpatialBandV1): VNextTextBlockFlowRegionKernelAdapterResultV1
  measureCandidate(candidate: VNextTextBlockCandidatePlacementKernelV1):
    VNextTextBlockCandidateLineMetricsKernelResultV1
}): VNextTextBlockSpatialWrappingKernelResultV1

export interface VNextTextBlockPlacedAtomKernelV1 {
  atom: VNextTextBlockPlacementAtomKernelV1
  intervalIndex: number
  xStartLayoutUnit: number
  xEndLayoutUnit: number
}

export type VNextTextBlockPlacementKernelResultV1 =
  | {
      status: "accepted"
      placedAtoms: readonly VNextTextBlockPlacedAtomKernelV1[]
      nextGroupIndex: number
      consumedMandatoryBreak: boolean
      issues: []
    }
  | {
      status: "blocked"
      placedAtoms: null
      nextGroupIndex: null
      consumedMandatoryBreak: false
      issues: readonly {
        code: "unsafe-layout-arithmetic" | "unbreakable-flow-item-overflow"
        message: string
      }[]
    }

export interface VNextTextBlockCandidatePlacementKernelV1 {
  lineIndex: number
  lineYLayoutUnit: number
  candidateBandHeightLayoutUnit: number
  intervals: readonly VNextTextBlockFlowIntervalV1[]
  placedAtoms: readonly VNextTextBlockPlacedAtomKernelV1[]
  nextGroupIndex: number
}

export type VNextTextBlockCandidateLineMetricsKernelResultV1 =
  | {
      status: "accepted"
      heightLayoutUnit: number
      baselineOffsetLayoutUnit: number
      payload: unknown
      issues: []
    }
  | {
      status: "blocked"
      heightLayoutUnit: null
      baselineOffsetLayoutUnit: null
      payload: null
      issues: readonly { code: string; message: string }[]
    }

export type VNextTextBlockFlowRegionKernelAdapterResultV1 =
  | {
      status: "accepted"
      intervals: readonly VNextTextBlockFlowIntervalV1[]
      nextYLayoutUnit: number | null
      regionFingerprint: string
      work: VNextTextBlockFlowRegionWorkV1
      issues: []
    }
  | {
      status: "blocked"
      intervals: null
      nextYLayoutUnit: null
      regionFingerprint: null
      work: null
      issues: readonly { code: string; message: string }[]
    }

export type VNextTextBlockSpatialWrappingKernelResultV1 =
  | {
      status: "accepted"
      lines: readonly {
        lineIndex: number
        lineYLayoutUnit: number
        heightLayoutUnit: number
        baselineOffsetLayoutUnit: number
        intervals: readonly VNextTextBlockFlowIntervalV1[]
        placedAtoms: readonly VNextTextBlockPlacedAtomKernelV1[]
        regionFingerprint: string
        metricPayload: unknown
      }[]
      work: VNextTextBlockSpatialWrappingWorkV1
      issues: []
    }
  | {
      status: "blocked"
      lines: null
      work: null
      issues: readonly { code: string; message: string }[]
    }
```

The kernel must:

- validate contiguous atom coverage and partition atoms by exact break offsets;
- reject any break that divides a cluster, image, or hard-break atom;
- place a complete group only when its full advance fits an interval;
- try later same-band intervals without splitting the group;
- close a non-empty line before an unplaced group;
- advance an empty line only to a strictly greater proved spatial event;
- re-query when measured height grows;
- require monotonic source/y/height progress;
- bound re-query by the supplied finite spatial proof.

Callbacks are private version adapters over validated objects; they are not
exposed from `src/index.ts`.

- [ ] **Step 5: Refactor V1 around the kernel without output changes**

Keep V1 text-cluster/hard-break projection, text fragment materialization,
source segments, metric reduction, result assembly, fingerprints, and
registration as V1 adapters. Replace V1 break partitioning and the
placement/event/stabilization loop with the shared kernel.

Run:

```sh
npx vitest run \
  tests/textBlockSpatialWrappingLayoutV1.test.ts \
  tests/textBlockFlowRegionProviderV1.test.ts \
  tests/textBlockAuthoredBoxGeometryV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
npm run type-check
git diff --check
```

Expected: all selected tests and type-check PASS; exact V1 snapshot unchanged.

- [ ] **Step 6: Commit the placement extraction**

```sh
git add \
  src/layout/textBlockSpatialWrappingKernelV1.ts \
  src/layout/textBlockSpatialWrappingLayoutV1.ts \
  tests/textBlockSpatialWrappingLayoutV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
git diff --cached --check
git commit -m "refactor(layout): share spatial line placement"
```

### Task 9: V2 Image-Aware Spatial Layout

**Files:**

- Create: `src/layout/textBlockSpatialWrappingLayoutContractV2.ts`
- Create: `src/layout/textBlockSpatialWrappingLayoutV2.ts`
- Create: `tests/textBlockSpatialWrappingLayoutV2.test.ts`
- Modify: `tests/helpers/textBlockInlineImageFlowV2.ts`
- Modify: `src/index.ts`

**Interfaces:**

- Consumes:
  - exact V2 Initial Flow/evidence/tree/index authority;
  - Task 1 image metrics;
  - Task 7 provider;
  - Task 8 placement kernel.
- Produces:
  - text and inline-image V2 fragment union;
  - `layoutVNextTextBlockSpatialWrappingV2(input)`;
  - `inspectVNextTextBlockSpatialWrappingLayoutV2(result)`.

- [ ] **Step 1: Define failing image-only and text-parity tests**

Require image-only `baseline`, `middle`, and `text-bottom` results to have
exact x/y/width/height and baseline facts. Require text-only V2 geometry to
normalize to V1:

```ts
expect(normalizeV2TextOnlyGeometry(v2)).toEqual(
  normalizeV1Geometry(v1),
)
```

Normalization may remove only source/version/fingerprint/authority wrappers
and the V2 fragment discriminator. It may not round or alter any range,
interval, x, y, width, height, baseline, or source fact.

- [ ] **Step 2: Run and observe the missing V2 layout**

```sh
npx vitest run tests/textBlockSpatialWrappingLayoutV2.test.ts
```

Expected: FAIL because `layoutVNextTextBlockSpatialWrappingV2` is not exported.

- [ ] **Step 3: Define V2 fragment and result types**

Define:

```ts
export interface VNextTextBlockSpatialTextFragmentV2
  extends VNextTextBlockPositionedFragmentV1 {
  kind: "text"
}

export interface VNextTextBlockSpatialInlineImageFragmentV2 {
  kind: "inline-image"
  fragmentId: string
  inlineId: string
  assetId: string
  renderStartOffset: number
  renderEndOffset: number
  xLayoutUnit: number
  yLayoutUnit: number
  widthLayoutUnit: number
  heightLayoutUnit: number
  verticalAlign: "baseline" | "middle" | "text-bottom"
  authoredFrame: ImageFrameV4Target
  alignmentPolicyFingerprint: string
  sourceSegments: readonly VNextTextBlockMultiRunSourceSegmentV1[]
  fingerprint: string
}

export type VNextTextBlockSpatialFragmentV2 =
  | VNextTextBlockSpatialTextFragmentV2
  | VNextTextBlockSpatialInlineImageFragmentV2

export interface VNextTextBlockSpatialWrappedLineV2 {
  index: number
  renderStartOffset: number
  renderEndOffset: number
  yOffsetLayoutUnit: number
  heightLayoutUnit: number
  baselineOffsetLayoutUnit: number
  availableIntervals: readonly VNextTextBlockFlowIntervalV1[]
  intervalPlacements: readonly VNextTextBlockSpatialIntervalPlacementV1[]
  fragments: readonly VNextTextBlockSpatialFragmentV2[]
  sourceSegments: readonly VNextTextBlockMultiRunSourceSegmentV1[]
  regionFingerprint: string
  fingerprint: string
}

export type VNextTextBlockSpatialWrappingLayoutResultV2 =
  | {
      status: "accepted"
      source: "vnext-text-block-spatial-wrapping-layout-v2"
      contractVersion: 2
      documentId: string
      sectionId: string
      textBlockId: string
      instanceRevision: number
      layoutId: string
      initialFlowFingerprint: string
      flowEvidenceFingerprint: string
      persistentFlowTreeFingerprint: string
      spatialIndexFingerprint: string
      alignmentPolicyFingerprint: string
      lines: readonly VNextTextBlockSpatialWrappedLineV2[]
      summary: {
        lineCount: number
        textFragmentCount: number
        inlineImageFragmentCount: number
        intervalPlacementCount: number
        heightLayoutUnit: number
      }
      work: VNextTextBlockSpatialWrappingWorkV1
      contracts: {
        sharedSpatialPlacementKernel: true
        multiIntervalRectangularWrapping: true
        topBottomBarrierAdvancement: true
        overlayRemovesFlowSpace: false
        coreOwnsInlineImageGeometry: true
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
      source: "vnext-text-block-spatial-wrapping-layout-v2"
      contractVersion: 2
      lines: null
      summary: null
      work: null
      mayPublishLayout: false
      productionBinding: false
      fingerprint: null
      issues: readonly {
        code:
          | "invalid-input"
          | "production-binding-forbidden"
          | "layout-authority-mismatch"
          | "spatial-index-binding-mismatch"
          | "invalid-flow-tree-projection"
          | "unsafe-layout-arithmetic"
          | "unbreakable-flow-item-overflow"
          | "no-vertical-progress"
          | "line-band-did-not-stabilize"
        severity: "error"
        path: string
        message: string
        lineIndex?: number
      }[]
    }
```

V2 lines retain available intervals, interval placements, baseline, height,
region fingerprint, and exact source coverage. Accepted result contracts state
shared kernel, multi-interval wrapping, overlay neutrality, Core-owned image
geometry, and all product gates false.

- [ ] **Step 4: Project V2 atoms into break groups**

Traverse V2 atoms in source order and map them to the closed Task 8 placement
union:

- each text cluster uses its shaped advance and text metrics;
- each image uses frame width and Task 1 baseline-relative extents;
- each hard break is mandatory with zero advance;
- no break may split a cluster, image, CRLF hard break, or source atom.

Call `createVNextTextBlockBreakGroupsKernelV1(...)` with evidence break offsets
and tree rendered length. Reject its gaps, overlaps, unused breaks, unsafe
sums, and evidence/tree length drift without a V2-specific grouping loop.

- [ ] **Step 5: Materialize image-aware lines**

Call Task 8 kernel with Task 7 provider and
`combineVNextTextBlockFlowLineMetricsV2(...)`. For each accepted line:

```ts
const imageYLayoutUnit =
  lineYLayoutUnit
  + metrics.baselineOffsetLayoutUnit
  + image.topFromBaselineLayoutUnit
```

Use checked sums. Re-query the expanded band whenever image-aware line height
exceeds the candidate band. Coalesce adjacent text clusters exactly as V1 does;
never coalesce images into text fragments or split an image.

- [ ] **Step 6: Add the content and spatial matrix**

Cover:

- image-only;
- text before/after image;
- adjacent images and multiple images;
- Thai/Latin around images;
- fields/page numbers/hard breaks;
- mixed text sizes;
- all three alignments;
- left/right/middle/multiple exclusions;
- barrier, overlay, and zero-space advancement;
- image-expanded band discovering a new exclusion;
- exact-fit and oversized image;
- no-exclusion/overlay-only zero-query fast path.

Require oversized image with no future full interval to block with
`unbreakable-flow-item-overflow`; Core must not resize it.

- [ ] **Step 7: Add identity/provenance failures**

Reject cloned/equal Initial Flow, evidence, tree, and index; another evidence
object; stale layout identity; changed frame/alignment/asset/fit/crop;
production binding; unsafe start y; no vertical progress; and mutated retained
results. Return no partial lines.

- [ ] **Step 8: Run the 4B-3 stop gate and commit**

```sh
npx vitest run \
  tests/textBlockSpatialWrappingLayoutV2.test.ts \
  tests/textBlockSpatialIndexV2.test.ts \
  tests/textBlockFlowRegionProviderV2.test.ts \
  tests/textBlockSpatialWrappingLayoutV1.test.ts \
  tests/textBlockFlowRegionProviderV1.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
npm run type-check
git diff --check
```

Expected: all selected tests and type-check PASS; text-only geometry parity and
V1 snapshot are exact. This is the 4B-3 stop gate.

```sh
git add \
  src/index.ts \
  src/layout/textBlockSpatialWrappingLayoutContractV2.ts \
  src/layout/textBlockSpatialWrappingLayoutV2.ts \
  tests/helpers/textBlockInlineImageFlowV2.ts \
  tests/textBlockSpatialWrappingLayoutV2.test.ts
git diff --cached --check
git commit -m "feat(layout): place inline images in spatial flow"
```

---

## Phase 4B-4 — Authored Box And Hardening

### Task 10: Shared Authored-Box Kernel And V2 Projection

**Files:**

- Create: `src/layout/textBlockAuthoredBoxGeometryKernelV1.ts`
- Create: `src/layout/textBlockAuthoredBoxGeometryContractV2.ts`
- Create: `src/layout/textBlockAuthoredBoxGeometryV2.ts`
- Create: `tests/textBlockAuthoredBoxGeometryV2.test.ts`
- Modify: `src/layout/textBlockAuthoredBoxGeometryV1.ts`
- Modify: `tests/textBlockAuthoredBoxGeometryV1.test.ts`
- Modify: `tests/textBlockV1LayoutCompatibility.test.ts`
- Modify: `tests/helpers/textBlockInlineImageFlowV2.ts`
- Modify: `src/index.ts`

**Interfaces:**

- Consumes:
  - Phase 4A authored-box plan;
  - exact V2 spatial layout;
  - shared safe layout arithmetic.
- Produces:
  - one shared box conversion/projection/auto-height kernel;
  - `layoutVNextTextBlockAuthoredBoxGeometryV2(input)`;
  - `inspectVNextTextBlockAuthoredBoxGeometryV2(result)`;
  - unchanged V1 box geometry.

- [ ] **Step 1: Write failing V2 box-local projection tests**

Require a mixed text/image line to shift by exact content insets:

```ts
expect(image).toMatchObject({
  kind: "inline-image",
  contentXLayoutUnit: contentImage.xLayoutUnit,
  contentYLayoutUnit: contentImage.yLayoutUnit,
  xLayoutUnit: contentImage.xLayoutUnit + contentOriginXLayoutUnit,
  yLayoutUnit: contentImage.yLayoutUnit + contentOriginYLayoutUnit,
  widthLayoutUnit: contentImage.widthLayoutUnit,
  heightLayoutUnit: contentImage.heightLayoutUnit,
})
```

Require:

```ts
outerHeightLayoutUnit =
  topInsetLayoutUnit
  + max(contentFlowHeightLayoutUnit, spatialMaximumBottomLayoutUnit)
  + bottomInsetLayoutUnit
```

Require fixed-height/overflow/clipping keys to fail strict input validation;
Phase 4B does not create such a policy.

- [ ] **Step 2: Run and observe the missing V2 box boundary**

```sh
npx vitest run tests/textBlockAuthoredBoxGeometryV2.test.ts
```

Expected: FAIL because `layoutVNextTextBlockAuthoredBoxGeometryV2` is not
exported.

- [ ] **Step 3: Extract shared box math**

Create `textBlockAuthoredBoxGeometryKernelV1.ts`:

```ts
export function convertVNextTextBlockAuthoredBoxKernelV1(input: {
  authoredBoxPlan: VNextAuthoredBoxPlanV1
  contentWidthLayoutUnit: number
}): VNextTextBlockAuthoredBoxKernelConversionResultV1

export function projectVNextTextBlockAuthoredBoxLinesKernelV1<TLine, TOutput>(input: {
  lines: readonly TLine[]
  contentOriginXLayoutUnit: number
  contentOriginYLayoutUnit: number
  projectLine(line: TLine, origin: {
    xLayoutUnit: number
    yLayoutUnit: number
  }): TOutput
}): readonly TOutput[]

export function deriveVNextTextBlockAuthoredBoxAutoHeightKernelV1(input: {
  topInsetLayoutUnit: number
  bottomInsetLayoutUnit: number
  contentFlowHeightLayoutUnit: number
  spatialMaximumBottomLayoutUnit: number
}): VNextTextBlockAuthoredBoxAutoHeightKernelResultV1

export type VNextTextBlockAuthoredBoxKernelConversionResultV1 =
  | {
      status: "accepted"
      outerWidthLayoutUnit: number
      contentInsetsLayoutUnit: VNextTextBlockAuthoredBoxInsetsLayoutUnitV1
      contentOriginXLayoutUnit: number
      contentOriginYLayoutUnit: number
      contentWidthLayoutUnit: number
      issues: []
    }
  | {
      status: "blocked"
      outerWidthLayoutUnit: null
      contentInsetsLayoutUnit: null
      contentOriginXLayoutUnit: null
      contentOriginYLayoutUnit: null
      contentWidthLayoutUnit: null
      issues: readonly VNextTextBlockAuthoredBoxGeometryIssueV1[]
    }

export type VNextTextBlockAuthoredBoxAutoHeightKernelResultV1 =
  | {
      status: "accepted"
      contentExtentBottomLayoutUnit: number
      outerHeightLayoutUnit: number
      issues: []
    }
  | {
      status: "blocked"
      contentExtentBottomLayoutUnit: null
      outerHeightLayoutUnit: null
      issues: readonly VNextTextBlockAuthoredBoxGeometryIssueV1[]
    }
```

Refactor V1 to delegate these calculations while retaining its exact public
projection types, fingerprints, validation order, and registration.

- [ ] **Step 4: Define V2 authored-box text/image geometry**

V2 text fragments retain V1 projected text facts plus `kind: "text"`. V2 image
fragments add content-local and box-local x/y, authored frame, asset,
alignment, fit/crop dependency, source range, and fingerprint. V2 accepted
result pins:

- Initial Flow;
- evidence;
- V2 tree;
- V2 spatial index;
- V2 spatial layout;
- parent region;
- authored-box owner/style/plan;
- alignment policy;
- final geometry.

Define the accepted/blocked result boundary:

```ts
export interface VNextTextBlockAuthoredBoxTextFragmentV2
  extends Omit<VNextTextBlockSpatialTextFragmentV2, "xLayoutUnit" | "fingerprint"> {
  contentXLayoutUnit: number
  xLayoutUnit: number
  contentFragmentFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockAuthoredBoxInlineImageFragmentV2
  extends Omit<
    VNextTextBlockSpatialInlineImageFragmentV2,
    "xLayoutUnit" | "yLayoutUnit" | "fingerprint"
  > {
  contentXLayoutUnit: number
  contentYLayoutUnit: number
  xLayoutUnit: number
  yLayoutUnit: number
  contentFragmentFingerprint: string
  fingerprint: string
}

export type VNextTextBlockAuthoredBoxFragmentV2 =
  | VNextTextBlockAuthoredBoxTextFragmentV2
  | VNextTextBlockAuthoredBoxInlineImageFragmentV2

export interface VNextTextBlockAuthoredBoxLineV2 {
  index: number
  renderStartOffset: number
  renderEndOffset: number
  contentYOffsetLayoutUnit: number
  yOffsetLayoutUnit: number
  heightLayoutUnit: number
  baselineOffsetLayoutUnit: number
  availableIntervals: readonly VNextTextBlockAuthoredBoxIntervalV1[]
  intervalPlacements: readonly VNextTextBlockAuthoredBoxIntervalPlacementV1[]
  fragments: readonly VNextTextBlockAuthoredBoxFragmentV2[]
  sourceSegments: readonly VNextTextBlockMultiRunSourceSegmentV1[]
  contentRegionFingerprint: string
  contentLineFingerprint: string
  fingerprint: string
}

export type VNextTextBlockAuthoredBoxGeometryResultV2 =
  | {
      status: "accepted"
      source: "vnext-text-block-authored-box-geometry-v2"
      contractVersion: 2
      documentId: string
      sectionId: string
      textBlockId: string
      instanceRevision: number
      layoutId: string
      initialFlowFingerprint: string
      flowEvidenceFingerprint: string
      persistentFlowTreeFingerprint: string
      spatialIndexFingerprint: string
      contentSpatialLayoutFingerprint: string
      alignmentPolicyFingerprint: string
      authoredBoxPlanFingerprint: string
      parentRegionFingerprint: string
      geometry: {
        outerWidthLayoutUnit: number
        contentInsetsLayoutUnit: VNextTextBlockAuthoredBoxInsetsLayoutUnitV1
        contentOriginXLayoutUnit: number
        contentOriginYLayoutUnit: number
        contentWidthLayoutUnit: number
        contentFlowHeightLayoutUnit: number
        spatialMaximumBottomLayoutUnit: number
        contentExtentBottomLayoutUnit: number
        outerHeightLayoutUnit: number
      }
      lines: readonly VNextTextBlockAuthoredBoxLineV2[]
      summary: {
        lineCount: number
        textFragmentCount: number
        inlineImageFragmentCount: number
        outerHeightLayoutUnit: number
      }
      contracts: {
        sharedAuthoredBoxKernel: true
        autoHeightIncludesSpatialExtent: true
        fixedHeightPolicy: false
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
      source: "vnext-text-block-authored-box-geometry-v2"
      contractVersion: 2
      geometry: null
      lines: null
      summary: null
      mayPublishLayout: false
      productionBinding: false
      fingerprint: null
      issues: readonly VNextTextBlockAuthoredBoxGeometryIssueV1[]
    }
```

- [ ] **Step 5: Implement the strict V2 wrapper**

Implement:

```ts
export function layoutVNextTextBlockAuthoredBoxGeometryV2(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  spatialIndex: VNextTextBlockSpatialIndexV2
  bindProductionLayout?: boolean
}): VNextTextBlockAuthoredBoxGeometryResultV2
```

Validate strict data-only root, production gate, exact authority chain,
authored width, and box conversion; call V2 spatial layout at content y=0;
inspect that exact process-local result; project through the shared kernel;
derive auto-height; fingerprint/freeze/register the result.

- [ ] **Step 6: Add spatial extent and unsupported fixed-height tests**

Require overlays below text to affect retained auto-height exactly as Phase 4A
currently specifies without removing flow space. Require moved/resized
exclusions to recompute intervals and auto-height from the new exact index.
Require any extra `fixedHeight`, `overflow`, or `clip` key on the strict V2
root to block as invalid input.

- [ ] **Step 7: Run V2 and V1 box gates**

```sh
npx vitest run \
  tests/textBlockAuthoredBoxGeometryV2.test.ts \
  tests/textBlockAuthoredBoxGeometryV1.test.ts \
  tests/textBlockSpatialWrappingLayoutV2.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
npm run type-check
git diff --check
```

Expected: all selected tests and type-check PASS with exact V1 snapshot.

- [ ] **Step 8: Commit authored-box projection**

```sh
git add \
  src/index.ts \
  src/layout/textBlockAuthoredBoxGeometryKernelV1.ts \
  src/layout/textBlockAuthoredBoxGeometryContractV2.ts \
  src/layout/textBlockAuthoredBoxGeometryV1.ts \
  src/layout/textBlockAuthoredBoxGeometryV2.ts \
  tests/helpers/textBlockInlineImageFlowV2.ts \
  tests/textBlockAuthoredBoxGeometryV1.test.ts \
  tests/textBlockAuthoredBoxGeometryV2.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
git diff --cached --check
git commit -m "feat(layout): project inline image box geometry"
```

### Task 11: Composed Hardening And Property Matrix

**Files:**

- Create: `tests/textBlockInlineImageGeometry4bHardening.test.ts`
- Modify: `tests/textBlockFlowEvidenceV2.test.ts`
- Modify: `tests/textBlockPersistentFlowTreeV2.test.ts`
- Modify: `tests/textBlockSpatialIndexV2.test.ts`
- Modify: `tests/textBlockFlowRegionProviderV2.test.ts`
- Modify: `tests/textBlockSpatialWrappingLayoutV2.test.ts`
- Modify: `tests/textBlockAuthoredBoxGeometryV2.test.ts`

**Interfaces:**

- Consumes: every accepted V2 boundary from Tasks 1-10.
- Produces: one composed proof that invalid identity, geometry, and capability
  states cannot cross stages and that valid outputs obey spatial properties.

- [ ] **Step 1: Add the complete identity attack matrix**

For evidence, tree, index, update, provider, spatial layout, and box geometry,
test:

```ts
structuredClone(initialFlow)
structuredClone(evidence)
structuredClone(tree)
structuredClone(index)
structuredClone(update)
Object.freeze({ ...evidence })
changed initialFlow fingerprint
changed layoutId
changed frame width or height
changed verticalAlign
changed assetId
changed fit or crop
changed exclusion geometry
bindProductionLayout: true
```

Each row must return a structured blocked/invalid result with no partial tree,
index, intervals, lines, or box geometry.

- [ ] **Step 2: Add arithmetic and boundary rows**

Cover zero/negative/non-finite/unsafe pt/mm values, mm conversion at the safe
integer edge, odd middle alignment, interval exact fit, image one LayoutUnit
too wide, unsafe baseline/image y addition, exclusion outside content bounds,
invalid band ordering, equal/decreasing next-y event, and expanded-band retry
beyond the finite entry bound.

- [ ] **Step 3: Add deterministic geometry properties**

For a bounded deterministic corpus of text/image/exclusion combinations,
require:

```ts
expect(repeated).toEqual(first)
expect(sourceRangesAreMonotonic(result)).toBe(true)
expect(intervalsAreSortedAndDisjoint(result)).toBe(true)
expect(everyImageFitsItsInterval(result)).toBe(true)
expect(everyImageFitsItsLineBox(result)).toBe(true)
expect(narrowBandRegion.work.visitedSpatialNodeCount)
  .toBeLessThan(populatedIndex.summary.nodeCount)
expect(overlayOnlyRegion.work.spatialIndexQueryCount).toBe(0)
```

Use a fixed data table, not random seeds or timing thresholds.

- [ ] **Step 4: Add move/resize composition**

Build before/after V2 indexes through
`createVNextTextBlockSpatialIndexUpdateV2(...)`. Require:

- moving a middle exclusion below line 0 restores one full-width interval;
- widening a left exclusion shifts the line start;
- tall-image band re-query observes the moved/resized envelope;
- old/new affected bands are exact;
- the flow tree/evidence objects remain identical;
- no line-reuse/reconvergence counter is present.

- [ ] **Step 5: Add capability and product-scope guards**

Assert source and result contracts contain no image bytes, DOM/React/HTTP,
Editor/Backend, publication, fixed-height overflow, Columns/Table, list
decoration, empty-line fabrication, or staged Editor apply. Require all
accepted V2 results to expose:

```ts
mayPublishLayout: false
productionBinding: false
```

- [ ] **Step 6: Run the composed hardening gate and commit**

```sh
npx vitest run \
  tests/textBlockInlineImageGeometry4bHardening.test.ts \
  tests/textBlockFlowEvidenceV2.test.ts \
  tests/textBlockPersistentFlowTreeV2.test.ts \
  tests/textBlockSpatialIndexV2.test.ts \
  tests/textBlockFlowRegionProviderV2.test.ts \
  tests/textBlockSpatialWrappingLayoutV2.test.ts \
  tests/textBlockAuthoredBoxGeometryV2.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
npm run type-check
git diff --check
```

Expected: all selected tests and type-check PASS.

```sh
git add \
  tests/textBlockInlineImageGeometry4bHardening.test.ts \
  tests/textBlockFlowEvidenceV2.test.ts \
  tests/textBlockPersistentFlowTreeV2.test.ts \
  tests/textBlockSpatialIndexV2.test.ts \
  tests/textBlockFlowRegionProviderV2.test.ts \
  tests/textBlockSpatialWrappingLayoutV2.test.ts \
  tests/textBlockAuthoredBoxGeometryV2.test.ts
git diff --cached --check
git commit -m "test(layout): harden inline image geometry"
```

### Task 12: Phase 4B Handoff, Scope Guard, And Full Core Gate

**Files:**

- Create: `docs/LIVE_DRAFT_MR1_INLINE_IMAGE_GEOMETRY_4B.md`
- Create: `tests/liveDraftMr1InlineImageGeometry4b.test.ts`
- Modify: `docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md`
- Modify: `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`
- Modify: `docs/PHASE_LEDGER.md`
- Modify: `docs/superpowers/specs/2026-07-27-inline-image-line-box-geometry-design.md`

**Interfaces:**

- Consumes: final Phase 4B source/test evidence and exact command output.
- Produces: an evidence-backed Core-only Phase 4B handoff with the next pointer
  set to a separately authorized Phase 5.

- [ ] **Step 1: Write the failing handoff guard**

Require the handoff peer headings:

```ts
expect(headings).toEqual([
  "## Status",
  "## Outcome",
  "## Architecture Evidence",
  "## Producer And Runtime Evidence",
  "## Persistent Flow Evidence",
  "## Spatial Wrapping Evidence",
  "## Authored Box Evidence",
  "## PASS",
  "## FAIL / BLOCKER",
  "## RISK",
  "## UNKNOWN",
  "## Verification",
  "## Intentionally Not Changed",
  "## Next Checkpoint",
])
```

Require exact public export lines for V2 evidence, tree, index/update, provider,
spatial layout, and authored-box modules. Require current handoff/ledger
pointers to name Phase 4B and keep all product/deferred rows NO-GO.

- [ ] **Step 2: Run and observe the missing handoff**

```sh
npx vitest run tests/liveDraftMr1InlineImageGeometry4b.test.ts
```

Expected: FAIL because the Phase 4B handoff and active pointers do not exist.

- [ ] **Step 3: Write evidence-backed Phase 4B documentation**

Record:

- shared-kernel file ownership;
- exact V1 characterization and text-only V2 parity;
- actual Node-native/Worker-WASM U+FFFC evidence rows;
- image-only/mixed/adjacent/multiple content;
- alignment formulas and version fingerprint;
- multi-interval/barrier/overlay/zero-space/expanded-band behavior;
- move/resize effects without reuse claims;
- exact authority rejection matrix;
- auto-height and fixed-height NO-GO;
- exact focused/full test totals copied only from final command output.

Set the design status to implemented/accepted only after the full gate passes.

- [ ] **Step 4: Run the focused Phase 4B gate**

```sh
npx vitest run \
  tests/liveDraftMr1InlineImageGeometry4b.test.ts \
  tests/textEngineFlowEvidenceNodeWasmV2.test.ts \
  tests/textBlockFlowEvidenceV2.test.ts \
  tests/textBlockPersistentFlowTreeV2.test.ts \
  tests/textBlockSpatialIndexV2.test.ts \
  tests/textBlockFlowRegionProviderV2.test.ts \
  tests/textBlockSpatialWrappingLayoutV2.test.ts \
  tests/textBlockAuthoredBoxGeometryV2.test.ts \
  tests/textBlockInlineImageGeometry4bHardening.test.ts \
  tests/textBlockV1LayoutCompatibility.test.ts
npm run type-check
git diff --check
```

Expected: all selected tests and type-check PASS. Copy exact totals into the
handoff.

- [ ] **Step 5: Run the full Core verification gate**

```sh
npm run check
git diff --check
git status --short
```

Expected: type-check and every Core test PASS; whitespace check is empty; only
the intended Phase 4B handoff/guard/spec/ledger files remain unstaged.

- [ ] **Step 6: Commit the coherent Phase 4B handoff**

```sh
git add \
  docs/LIVE_DRAFT_MR1_INLINE_IMAGE_GEOMETRY_4B.md \
  docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md \
  docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md \
  docs/PHASE_LEDGER.md \
  docs/superpowers/specs/2026-07-27-inline-image-line-box-geometry-design.md \
  tests/liveDraftMr1InlineImageGeometry4b.test.ts
git diff --cached --check
git commit -m "docs: hand off inline image geometry 4b"
```

- [ ] **Step 7: Verify final branch state**

```sh
git status --short --branch
git log -14 --oneline --decorate
```

Expected: the Phase 4B worktree is clean; all 12 task commits are visible; Core
main remains untouched until explicit review/integration; Editor and Backend
remain untouched; Phase 5 remains authorization-gated.

## Plan Self-Review

- Spec coverage: Tasks 1-3 cover strict unit conversion, alignment policy,
  producer-shaped evidence, U+FFFC cross-runtime parity, and V1
  characterization.
- Shared architecture: Tasks 4, 6, 8, and 10 extract one rope, treap, Flow
  Region, placement, and authored-box kernel before their V2 consumers are
  accepted.
- V2 scope: Tasks 5, 7, 9, and 10 add the successor evidence/tree/index/layout
  chain for both text-only and image-aware flows.
- Geometry coverage: Tasks 9-11 cover image-only, mixed, adjacent, multiple,
  Thai/Latin, fields/page numbers/hard breaks, mixed text size, every
  alignment, multi-interval wrapping, barriers, overlay, zero-space,
  expanded bands, move/resize, exact fit, overflow, and auto-height.
- Identity coverage: Every V2 public stage accepts exact upstream objects and
  Task 11 attacks clones, equal replacements, changed dependencies, accessors,
  mutation, and production binding.
- V1 protection: Characterization runs before and after every shared-kernel
  extraction; V1 public shapes, fingerprints, blocked order, and MR1-Q proofs
  are never migrated to V2.
- Deferred scope: Global Constraints and Tasks 10-12 keep fixed height, lists,
  empty blocks, Columns/Table, Editor/Backend, publication, production,
  staged apply, incremental edits, reuse, reconvergence, and performance
  budgets outside Phase 4B.
- Type consistency: `VNextTextBlockFlowEvidenceV2`,
  `VNextTextBlockPersistentFlowTreeV2`, `VNextTextBlockSpatialIndexV2`,
  `VNextTextBlockFlowRegionResultV2`,
  `VNextTextBlockSpatialWrappingLayoutResultV2`, and
  `VNextTextBlockAuthoredBoxGeometryResultV2` are introduced before every
  downstream use.
- Completeness scan: every task names concrete files, interfaces, test
  assertions, commands, expected failures, acceptance gates, and commit scope.

## Execution Handoff

After this plan is approved, create the isolated worktree with
`superpowers:using-git-worktrees`, then choose one execution mode:

1. `superpowers:subagent-driven-development` — one fresh implementation worker
   per task with specification and quality review between tasks.
2. `superpowers:executing-plans` — execute the tasks inline in ordered batches
   with a review checkpoint at every 4B stop gate.
