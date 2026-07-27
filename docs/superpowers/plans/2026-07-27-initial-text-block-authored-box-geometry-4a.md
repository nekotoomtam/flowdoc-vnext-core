# Initial TextBlock Authored Box Geometry 4A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bind the accepted Initial TextBlock Flow authored-box plan to the
accepted Phase 3 content-local spatial layout and emit exact immutable
box-local geometry with authored width, vertical insets, auto-height, and
capability-honest failure gates.

**Architecture:** Extract Initial Flow/request equality from the legacy
text-only adapter into one non-layout binding inspector. Keep Phase 3 wrapping
unchanged in content-local coordinates, then compose a separate Phase 4A
wrapper that converts the authored-box plan to layout units, projects accepted
line geometry into box-local coordinates, derives auto-height from flow and
the retained spatial maximum bottom, and registers a new process-local result.

**Tech Stack:** TypeScript 6, ESM, Zod 4 strict runtime schemas, Vitest 4,
Core compact canonical fingerprints, immutable WeakSet provenance,
million-layout-units-per-point integer geometry.

## Global Constraints

- Work only in
  `C:\Users\nekot\Documents\GitHub\flowdoc-vnext-core\.worktrees\initial-text-block-geometry-4a`
  on branch `feat/initial-text-block-geometry-4a`.
- Start from committed design `f5190d4` and baseline `2847e94`.
- Do not modify `flowdoc-vnext-editor` or `flowdoc-vnext-backend`.
- Preserve canonical Document v4 without adding a positioned-object schema.
- Preserve the exact `core-synthetic-qa-only` Phase 3 spatial input authority.
- Keep Phase 3 content-local spatial wrapping and its accepted fingerprints
  unchanged.
- Keep list decoration, inline-image geometry, and empty-block geometry
  blocked.
- Keep Columns/Table integration, Table auto-fit, Editor/Backend binding,
  publication, production activation, and Editor staged apply blocked.
- Every accepted Phase 4A result reports `mayPublishLayout: false`,
  `productionBinding: false`, and `stagedEditorApply: false`.
- Renderer code may consume accepted geometry but may not measure or relayout.
- Unsupported, stale, cloned, tampered, accessor-shaped, or unsafe geometry
  fails closed without partial layout.
- Use `convertVNextPointToLayoutUnitV1(...)` for every point-to-layout-unit
  conversion.
- Preserve the no-flow-affecting zero-query fast path.
- Do not claim spatial line reuse, reconvergence, publication, or production
  readiness.
- Use TDD: observe each new test fail before adding the implementation.
- Commit only coherent green tasks with no unrelated files staged.

## File Map

### Create

- `src/layout/textBlockInitialFlowRequestBindingV1.ts`
  - owns strict request reconstruction and exact Initial Flow/request equality;
  - performs no layout;
  - returns one sanitized request for the existing adapter.
- `src/layout/textBlockAuthoredBoxGeometryContractV1.ts`
  - owns Phase 4A public constants, projected geometry types, issue codes,
    result unions, work facts, and inspection types.
- `src/layout/textBlockAuthoredBoxGeometryV1.ts`
  - validates the strict Phase 4A envelope;
  - executes unchanged Phase 3 content-local layout;
  - projects box-local geometry;
  - derives outer auto-height;
  - fingerprints, freezes, registers, and inspects Phase 4A results.
- `tests/helpers/textBlockAuthoredBoxGeometryV1.ts`
  - builds one exact Initial Flow/request/tree/index fixture chain from a
    single authored-box plan.
- `tests/textBlockInitialFlowRequestBindingV1.test.ts`
  - locks extraction parity, request equality, capability rejection, and
    no-layout ownership.
- `tests/textBlockAuthoredBoxGeometryV1.test.ts`
  - proves accepted box-local geometry, insets, spatial composition, height,
    fast path, and failure rows.
- `tests/liveDraftMr1AuthoredBoxGeometry4a.test.ts`
  - guards documentation, exports, active pointers, counts, and NO-GO rows.
- `docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md`
  - records the accepted Phase 4A evidence and next explicit review gate.

### Modify

- `src/layout/textBlockInitialFlowTextOnlyAdapterV1.ts`
  - replaces private request-equality ownership with the shared binding
    inspector while preserving exact observable behavior.
- `src/index.ts`
  - exports the shared binding, Phase 4A contract, and Phase 4A implementation.
- `tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts`
  - adds byte-level before/after adapter parity evidence around the extracted
    binding owner.
- `docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md`
  - marks its Phase 4 pointer fulfilled by the Phase 4A evidence document.
- `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`
  - records Phase 4A as the active accepted boundary and stops at an explicit
    Phase 4B design authorization gate.
- `docs/PHASE_LEDGER.md`
  - appends the Phase 4A evidence row.
- `docs/superpowers/specs/2026-07-27-initial-text-block-authored-box-geometry-design.md`
  - changes status from written-review to implemented/accepted only after all
    gates pass.

---

### Task 1: Shared Initial Flow/Request Binding Inspector

**Files:**

- Create: `src/layout/textBlockInitialFlowRequestBindingV1.ts`
- Create: `tests/textBlockInitialFlowRequestBindingV1.test.ts`
- Modify: `src/layout/textBlockInitialFlowTextOnlyAdapterV1.ts`
- Modify: `tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts`
- Modify: `src/index.ts`

**Interfaces:**

- Consumes:
  - `inspectVNextTextBlockInitialFlowV1(initialFlow)`
  - `VNextTextBlockInitialFlowV1`
  - `VNextTextBlockMultiRunLayoutRequestV1`
  - `convertVNextPointToLayoutUnitV1(point)`
- Produces:
  - `VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_SOURCE`
  - `VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_VERSION`
  - `VNextTextBlockInitialFlowRequestBindingIssueCodeV1`
  - `VNextTextBlockInitialFlowRequestBindingResultV1`
  - `inspectVNextTextBlockInitialFlowRequestBindingV1(input)`
- Adapter dependency:
  - accepted binding returns the exact classified Initial Flow reference and
    the same strictly reconstructed request shape that the adapter currently
    sends to `acceptVNextTextBlockMultiRunLayoutV1(...)`.

- [ ] **Step 1: Write the direct binding-inspector tests**

Create `tests/textBlockInitialFlowRequestBindingV1.test.ts` with these imports
and helper:

```ts
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockInitialFlowV1,
  inspectVNextTextBlockInitialFlowRequestBindingV1,
} from "../src/index.js"
import {
  imageOnlyGeometryBuildInputFixture,
  legacyTextOnlyBuildInputFixture,
  legacyTextOnlyLayoutRequestFixture,
  listOnlyGeometryBuildInputFixture,
  renderedEmptyFieldGeometryBuildInputFixture,
} from "./helpers/textBlockInitialFlowV1.js"

function acceptedFlow() {
  const built = createVNextTextBlockInitialFlowV1(
    legacyTextOnlyBuildInputFixture(),
  )
  if (built.status !== "accepted") throw new Error("Initial Flow fixture blocked")
  return built.initialFlow
}
```

Add one accepted test:

```ts
it("binds exact Initial Flow and request facts without executing layout", () => {
  const flow = acceptedFlow()
  const request = legacyTextOnlyLayoutRequestFixture()
  const result = inspectVNextTextBlockInitialFlowRequestBindingV1({
    initialFlow: flow,
    request,
  })

  expect(result).toMatchObject({
    status: "accepted",
    initialFlow: flow,
    initialFlowFingerprint: flow.fingerprint,
    layoutId: request.layoutId,
    contentWidthLayoutUnit: request.availableWidthLayoutUnit,
    issues: [],
  })
  if (result.status !== "accepted") throw new Error("binding blocked")
  expect(result.request).toEqual(request)
  expect(result.request).not.toBe(request)
  expect(Object.isFrozen(result)).toBe(true)
  expect(Object.isFrozen(result.request)).toBe(true)

  const source = readFileSync(
    resolve("src/layout/textBlockInitialFlowRequestBindingV1.ts"),
    "utf8",
  )
  expect(source).not.toContain("acceptVNextTextBlockMultiRunLayoutV1")
  expect(source).not.toContain("layoutVNextTextBlockSpatialWrappingV1")
})
```

Add exact drift and capability tests:

```ts
it("blocks request context drift and unsupported geometry capability rows", () => {
  const flow = acceptedFlow()
  const widthDrift = legacyTextOnlyLayoutRequestFixture()
  widthDrift.availableWidthLayoutUnit -= 1

  expect(inspectVNextTextBlockInitialFlowRequestBindingV1({
    initialFlow: flow,
    request: widthDrift,
  })).toMatchObject({
    status: "blocked",
    issues: [{ code: "request-context-mismatch", path: "request" }],
  })

  for (const buildInput of [
    listOnlyGeometryBuildInputFixture(),
    imageOnlyGeometryBuildInputFixture(),
    renderedEmptyFieldGeometryBuildInputFixture(),
  ]) {
    const built = createVNextTextBlockInitialFlowV1(buildInput)
    if (built.status !== "accepted") throw new Error("capability fixture blocked")
    expect(inspectVNextTextBlockInitialFlowRequestBindingV1({
      initialFlow: built.initialFlow,
      request: legacyTextOnlyLayoutRequestFixture(),
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "initial-flow-capability-required" }],
    })
  }
})
```

Add root/accessor and cloned-authority tests:

```ts
it("rejects unknown roots, request accessors, and cloned Initial Flow", () => {
  const flow = acceptedFlow()
  const request = legacyTextOnlyLayoutRequestFixture()
  let getterCount = 0
  const accessorRoot = Object.create(null)
  Object.defineProperty(accessorRoot, "initialFlow", {
    enumerable: true,
    get() {
      getterCount += 1
      return flow
    },
  })
  Object.defineProperty(accessorRoot, "request", {
    enumerable: true,
    value: request,
  })

  expect(inspectVNextTextBlockInitialFlowRequestBindingV1(accessorRoot))
    .toMatchObject({
      status: "blocked",
      issues: [{ code: "invalid-binding-input", path: "input" }],
    })
  expect(getterCount).toBe(0)

  const cloned = JSON.parse(JSON.stringify(flow))
  expect(inspectVNextTextBlockInitialFlowRequestBindingV1({
    initialFlow: cloned,
    request,
  })).toMatchObject({
    status: "blocked",
    issues: [{ code: "invalid-initial-flow", path: "initialFlow" }],
  })
})
```

- [ ] **Step 2: Run the new tests and verify the missing export failure**

Run:

```sh
npx vitest run tests/textBlockInitialFlowRequestBindingV1.test.ts
```

Expected: FAIL because
`inspectVNextTextBlockInitialFlowRequestBindingV1` is not exported.

- [ ] **Step 3: Create the binding contract and move the exact equality owner**

Create `src/layout/textBlockInitialFlowRequestBindingV1.ts` with this public
shape:

```ts
export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_SOURCE =
  "vnext-text-block-initial-flow-request-binding-v1" as const
export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_VERSION = 1 as const

export type VNextTextBlockInitialFlowRequestBindingIssueCodeV1 =
  | "invalid-binding-input"
  | "invalid-initial-flow"
  | "initial-flow-capability-required"
  | "request-context-mismatch"

export interface VNextTextBlockInitialFlowRequestBindingIssueV1 {
  code: VNextTextBlockInitialFlowRequestBindingIssueCodeV1
  severity: "error"
  path: string
  message: string
}

export type VNextTextBlockInitialFlowRequestBindingResultV1 =
  | {
      status: "accepted"
      source: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_SOURCE
      contractVersion:
        typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_VERSION
      initialFlow: VNextTextBlockInitialFlowV1
      request: VNextTextBlockMultiRunLayoutRequestV1
      initialFlowFingerprint: string
      layoutId: string
      contentWidthLayoutUnit: number
      issues: []
    }
  | {
      status: "blocked"
      source: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_SOURCE
      contractVersion:
        typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_VERSION
      initialFlow: null
      request: null
      initialFlowFingerprint: string
      layoutId: string
      contentWidthLayoutUnit: null
      issues: VNextTextBlockInitialFlowRequestBindingIssueV1[]
    }
```

Move the strict request schemas, `clone`, `canonicalFontFaces`,
`legacyFontFace`, `textBearingAtom`, `shapingTypographyMatchesFlow`,
`usedLegacyFontFaces`, contained-array validation, recursive data cloning, and
strict request reconstruction from
`textBlockInitialFlowTextOnlyAdapterV1.ts` into this module.

Use an exact two-field root:

```ts
interface BindingEnvelope {
  initialFlow: unknown
  request: unknown
}

function safeEnvelope(input: unknown): BindingEnvelope | null {
  if (input == null || typeof input !== "object") return null
  const prototype = Object.getPrototypeOf(input)
  if (prototype !== Object.prototype && prototype !== null) return null
  if (Object.getOwnPropertySymbols(input).length !== 0) return null
  const keys = Reflect.ownKeys(input)
  if (
    keys.length !== 2
    || !keys.includes("initialFlow")
    || !keys.includes("request")
  ) return null
  const initialFlow = dataProperty(input, "initialFlow")
  const request = dataProperty(input, "request")
  return initialFlow.found && request.found
    ? { initialFlow: initialFlow.value, request: request.value }
    : null
}
```

Build accepted equality from the existing adapter condition without changing
its comparison order:

```ts
const contentWidth = convertVNextPointToLayoutUnitV1(
  flow.authoredBoxPlan.contentWidthPt,
)
if (
  !sameVNextCanonicalJson(flow.measurement, request.measurement)
  || flow.layoutUnitPolicyFingerprint !== request.layoutUnitPolicyFingerprint
  || flow.declaredLineHeightLayoutUnit !== request.declaredLineHeightLayoutUnit
  || !sameVNextCanonicalJson(flow.paragraphStyle, request.paragraphStyle)
  || !sameVNextCanonicalJson(
    usedLegacyFontFaces(flow),
    canonicalFontFaces(request.fontFaces),
  )
  || !shapingTypographyMatchesFlow(flow, request)
  || contentWidth.status !== "accepted"
  || contentWidth.layoutUnit !== request.availableWidthLayoutUnit
) {
  return blocked(
    flow.fingerprint,
    request.layoutId,
    "request-context-mismatch",
    "request",
    "request measurement, width, line height, resolved run typography, and layout policy must equal Initial Flow",
  )
}
```

Recursively freeze the accepted wrapper and its reconstructed request. Do not
freeze or clone `initialFlow`; retain the exact process-local object.

- [ ] **Step 4: Export the binding module**

Add this line immediately after the existing Initial Flow exports in
`src/index.ts`:

```ts
export * from "./layout/textBlockInitialFlowRequestBindingV1.js"
```

- [ ] **Step 5: Run the direct binding tests**

Run:

```sh
npx vitest run tests/textBlockInitialFlowRequestBindingV1.test.ts
```

Expected: PASS.

- [ ] **Step 6: Refactor the existing adapter to consume the shared binding**

Keep the adapter's exact `initialFlow`/`legacyRequest` root validation and
metadata fallback. Replace its private request reconstruction and equality
condition with:

```ts
const binding = inspectVNextTextBlockInitialFlowRequestBindingV1({
  initialFlow: envelope.initialFlow,
  request: envelope.legacyRequest,
})
if (binding.status !== "accepted") {
  const bindingIssue = binding.issues[0]
  return blocked(
    binding.initialFlowFingerprint,
    binding.layoutId,
    bindingIssue?.code === "request-context-mismatch"
      ? "legacy-context-mismatch"
      : bindingIssue?.code === "initial-flow-capability-required"
        ? "initial-flow-capability-required"
        : "invalid-initial-flow",
    bindingIssue?.path === "request" ? "legacyRequest" : "initialFlow",
    bindingIssue?.message ?? "Initial Flow request binding was unavailable",
  )
}

const flow = binding.initialFlow
const request = binding.request
```

Delete only the schemas and helpers now owned by the binding module. Retain
adapter result fingerprinting, legacy layout invocation, adapter provenance,
and adapter-specific blocked result construction.

- [ ] **Step 7: Add an adapter parity assertion**

In `tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts`, add:

```ts
it("uses the shared request binding without changing accepted adapter output", () => {
  const flow = createVNextTextBlockInitialFlowV1(
    legacyTextOnlyBuildInputFixture(),
  )
  if (flow.status !== "accepted") throw new Error("Initial Flow fixture blocked")
  const request = legacyTextOnlyLayoutRequestFixture()
  const binding = inspectVNextTextBlockInitialFlowRequestBindingV1({
    initialFlow: flow.initialFlow,
    request,
  })
  const adapter = adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
    initialFlow: flow.initialFlow,
    legacyRequest: request,
  })
  const direct = binding.status === "accepted"
    ? acceptVNextTextBlockMultiRunLayoutV1(binding.request)
    : null

  expect(binding.status).toBe("accepted")
  expect(adapter.status).toBe("accepted-text-subset")
  expect(direct?.status).toBe("accepted")
  if (
    binding.status !== "accepted"
    || adapter.status !== "accepted-text-subset"
    || direct?.status !== "accepted"
  ) {
    throw new Error("shared binding parity fixture blocked")
  }
  expect(adapter.layout.layoutId).toBe(binding.request.layoutId)
  expect(adapter.layout.layoutContextFingerprint)
    .toBe(direct.layoutContextFingerprint)
})
```

- [ ] **Step 8: Run adapter and binding regression gates**

Run:

```sh
npx vitest run \
  tests/textBlockInitialFlowRequestBindingV1.test.ts \
  tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts \
  tests/textBlockInitialFlowInputV1.test.ts
npm run type-check
```

Expected: all selected tests and type-check PASS with the existing adapter
test count plus the new binding tests.

- [ ] **Step 9: Commit the shared binding owner**

Run:

```sh
git add \
  src/index.ts \
  src/layout/textBlockInitialFlowRequestBindingV1.ts \
  src/layout/textBlockInitialFlowTextOnlyAdapterV1.ts \
  tests/textBlockInitialFlowRequestBindingV1.test.ts \
  tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts
git diff --cached --check
git commit -m "refactor(layout): share initial flow request binding"
```

---

### Task 2: Phase 4A Contract, Strict Fixture, And Provenance Skeleton

**Files:**

- Create: `src/layout/textBlockAuthoredBoxGeometryContractV1.ts`
- Create: `src/layout/textBlockAuthoredBoxGeometryV1.ts`
- Create: `tests/helpers/textBlockAuthoredBoxGeometryV1.ts`
- Create: `tests/textBlockAuthoredBoxGeometryV1.test.ts`
- Modify: `src/index.ts`

**Interfaces:**

- Consumes:
  - Task 1 binding inspector;
  - exact Initial Flow, request, persistent tree, and spatial index objects;
  - `layoutVNextTextBlockSpatialWrappingV1(...)`;
  - `inspectVNextTextBlockSpatialWrappingLayoutV1(...)`;
  - `spatialFingerprintV1(...)`, `deepFreezeSpatialV1(...)`, and
    `deeplyFrozenSpatialV1(...)`.
- Produces:
  - Phase 4A source/version constants;
  - projected interval, placement, fragment, and line types;
  - accepted/blocked Phase 4A result union;
  - `layoutVNextTextBlockAuthoredBoxGeometryV1(input)`;
  - `inspectVNextTextBlockAuthoredBoxGeometryV1(result)`.

- [ ] **Step 1: Build one exact cross-boundary fixture helper**

Create `tests/helpers/textBlockAuthoredBoxGeometryV1.ts`.

Define:

```ts
export interface AuthoredBoxGeometryFixtureOptions {
  outerWidthPt?: number
  paddingPt?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  borderWidthPt?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  breakOffsets?: readonly number[]
  entries?: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
}
```

Create a `boxStyle(...)` helper that converts non-zero border widths into
canonical solid black border sides:

```ts
const side = (width: number) => ({
  style: width === 0 ? "none" as const : "solid" as const,
  width: { value: width, unit: "pt" as const },
  color: "000000",
})
```

Build all retained objects from one exact plan:

```ts
export function acceptedAuthoredBoxGeometryFixture(
  options: AuthoredBoxGeometryFixtureOptions = {},
) {
  const buildInput = legacyTextOnlyBuildInputFixture()
  const outerWidthPt = options.outerWidthPt ?? 100
  const padding = options.paddingPt ?? {
    top: 2,
    right: 5,
    bottom: 2,
    left: 5,
  }
  const border = options.borderWidthPt ?? {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }
  const textBlock = {
    ...buildInput.textBlock,
    props: {
      ...buildInput.textBlock.props,
      box: {
        ...buildInput.textBlock.props.box,
        padding: {
          top: { value: padding.top, unit: "pt" as const },
          right: { value: padding.right, unit: "pt" as const },
          bottom: { value: padding.bottom, unit: "pt" as const },
          left: { value: padding.left, unit: "pt" as const },
        },
        border: {
          top: side(border.top),
          right: side(border.right),
          bottom: side(border.bottom),
          left: side(border.left),
        },
      },
    },
  }
  const box = createVNextAuthoredBoxPlanV1({
    ownerNode: textBlock,
    availableWidthPt: outerWidthPt,
  })
  if (box.status !== "ready") throw new Error("authored box fixture blocked")

  const measurement = {
    ...buildInput.measurement,
    availableWidthPt: box.plan.contentWidthPt,
  }
  const initial = createVNextTextBlockInitialFlowV1({
    ...buildInput,
    textBlock,
    measurement,
    authoredBoxPlan: box.plan,
  })
  if (initial.status !== "accepted") throw new Error("Initial Flow fixture blocked")

  const request = legacyTextOnlyLayoutRequestFixture()
  request.measurement = measurement
  request.breakOffsets = [
    ...(options.breakOffsets ?? request.breakOffsets),
  ]
  const width = convertVNextPointToLayoutUnitV1(box.plan.contentWidthPt)
  if (width.status !== "accepted") throw new Error("content width fixture blocked")
  request.availableWidthLayoutUnit = width.layoutUnit

  const acceptedLayout = acceptVNextTextBlockMultiRunLayoutV1(request)
  if (acceptedLayout.status !== "accepted") throw new Error("layout fixture blocked")
  const persistent = createVNextTextBlockPersistentFlowTreeV1({
    request,
    acceptedLayout,
  })
  if (persistent.status !== "accepted") throw new Error("tree fixture blocked")
  const spatial = createVNextTextBlockSpatialIndexV1({
    inputAuthority: "core-synthetic-qa-only",
    persistentFlowTree: persistent.tree,
    request,
    entries: options.entries ?? [],
  })
  if (spatial.status !== "accepted") throw new Error("index fixture blocked")

  return {
    initialFlow: initial.initialFlow,
    request,
    acceptedLayout,
    tree: persistent.tree,
    spatialIndex: spatial.index,
    authoredBoxPlan: box.plan,
  }
}
```

- [ ] **Step 2: Write the missing-contract acceptance test**

Create `tests/textBlockAuthoredBoxGeometryV1.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import {
  inspectVNextTextBlockAuthoredBoxGeometryV1,
  layoutVNextTextBlockAuthoredBoxGeometryV1,
} from "../src/index.js"
import { acceptedAuthoredBoxGeometryFixture } from
  "./helpers/textBlockAuthoredBoxGeometryV1.js"

describe("TextBlock authored box geometry v1", () => {
  it("accepts one exact Phase 4A identity chain and registers immutable output", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture()
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("Phase 4A fixture blocked")
    expect(result).toMatchObject({
      initialFlowFingerprint: fixture.initialFlow.fingerprint,
      authoredBoxPlanFingerprint: fixture.authoredBoxPlan.fingerprint,
      persistentFlowTreeFingerprint: fixture.tree.fingerprint,
      spatialIndexFingerprint: fixture.spatialIndex.fingerprint,
      mayPublishLayout: false,
      productionBinding: false,
      contracts: {
        authoredBoxWidthApplied: true,
        contentLocalSpatialWrapping: true,
        boxLocalProjection: true,
        rendererMayMeasureText: false,
        rendererMayRelayout: false,
        stagedEditorApply: false,
        mayPublishLayout: false,
        productionBinding: false,
      },
    })
    expect(inspectVNextTextBlockAuthoredBoxGeometryV1(result)).toEqual({
      status: "valid",
      fingerprint: result.fingerprint,
    })
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.lines)).toBe(true)
  })
})
```

- [ ] **Step 3: Run the acceptance test and verify the missing export failure**

Run:

```sh
npx vitest run tests/textBlockAuthoredBoxGeometryV1.test.ts
```

Expected: FAIL because the Phase 4A modules are not exported.

- [ ] **Step 4: Define the complete Phase 4A contract**

Create `src/layout/textBlockAuthoredBoxGeometryContractV1.ts` with:

```ts
export const VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_SOURCE =
  "vnext-text-block-authored-box-geometry-v1" as const
export const VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_VERSION = 1 as const

export interface VNextTextBlockAuthoredBoxInsetsLayoutUnitV1 {
  top: number
  right: number
  bottom: number
  left: number
}

export interface VNextTextBlockAuthoredBoxIntervalV1 {
  contentStartLayoutUnit: number
  contentEndLayoutUnit: number
  startLayoutUnit: number
  endLayoutUnit: number
  contentLineFingerprint: string
  fingerprint: string
}

export interface VNextTextBlockAuthoredBoxIntervalPlacementV1 {
  intervalIndex: number
  renderStartOffset: number
  renderEndOffset: number
  contentXStartLayoutUnit: number
  contentXEndLayoutUnit: number
  xStartLayoutUnit: number
  xEndLayoutUnit: number
  contentLineFingerprint: string
  fingerprint: string
}
```

Define a fragment that retains the original content x and fingerprint:

```ts
export interface VNextTextBlockAuthoredBoxFragmentV1
  extends Omit<VNextTextBlockPositionedFragmentV1, "xLayoutUnit" | "fingerprint"> {
  contentXLayoutUnit: number
  xLayoutUnit: number
  contentFragmentFingerprint: string
  fingerprint: string
}
```

Define a line:

```ts
export interface VNextTextBlockAuthoredBoxLineV1 {
  index: number
  renderStartOffset: number
  renderEndOffset: number
  contentYOffsetLayoutUnit: number
  yOffsetLayoutUnit: number
  heightLayoutUnit: number
  baselineOffsetLayoutUnit: number
  availableIntervals: readonly VNextTextBlockAuthoredBoxIntervalV1[]
  intervalPlacements:
    readonly VNextTextBlockAuthoredBoxIntervalPlacementV1[]
  fragments: readonly VNextTextBlockAuthoredBoxFragmentV1[]
  sourceSegments: readonly VNextTextBlockMultiRunSourceSegmentV1[]
  contentRegionFingerprint: string
  contentLineFingerprint: string
  fingerprint: string
}
```

Use these exact issue codes:

```ts
export type VNextTextBlockAuthoredBoxGeometryIssueCodeV1 =
  | "invalid-input"
  | "production-binding-forbidden"
  | "initial-flow-request-binding-mismatch"
  | "initial-flow-capability-required"
  | "invalid-authored-box-geometry"
  | "authored-box-width-mismatch"
  | "flow-tree-request-binding-mismatch"
  | "spatial-index-binding-mismatch"
  | "spatial-layout-blocked"
  | "spatial-layout-provenance-mismatch"
  | "unsafe-layout-arithmetic"
```

Add the exact issue and inspection types:

```ts
export interface VNextTextBlockAuthoredBoxGeometryIssueV1 {
  code: VNextTextBlockAuthoredBoxGeometryIssueCodeV1
  severity: "error"
  path: string
  message: string
}

export type VNextTextBlockAuthoredBoxGeometryInspectionV1 =
  | { status: "valid"; fingerprint: string }
  | {
      status: "invalid"
      code:
        | "authored-box-geometry-provenance-mismatch"
        | "authored-box-geometry-not-deeply-frozen"
      message: string
    }
```

Define `VNextTextBlockAuthoredBoxGeometryResultV1` as a union. Start with this
accepted variant:

```ts
export type VNextTextBlockAuthoredBoxGeometryResultV1 =
  | {
      status: "accepted"
      source: typeof VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_VERSION
      documentId: string
      sectionId: string
      textBlockId: string
      instanceRevision: number
      layoutId: string
      layoutContextFingerprint: string
      initialFlowFingerprint: string
      parentRegionFingerprint: string
      authoredBoxOwnerNodeId: string
      authoredBoxStyleFingerprint: string
      authoredBoxPlanFingerprint: string
      persistentFlowTreeFingerprint: string
      spatialIndexFingerprint: string
      contentSpatialLayoutFingerprint: string
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
      lines: readonly VNextTextBlockAuthoredBoxLineV1[]
      summary: {
        lineCount: number
        fragmentCount: number
        intervalPlacementCount: number
        outerHeightLayoutUnit: number
      }
      work: VNextTextBlockSpatialWrappingWorkV1
      contracts: {
        authoredBoxWidthApplied: true
        verticalInsetsApplied: true
        autoHeightIncludesSpatialExtent: true
        contentLocalSpatialWrapping: true
        boxLocalProjection: true
        canonicalPositionedObjectSchema: false
        authoredPositionedObjectBinding: false
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
```

Continue the same union with this blocked variant:

```ts
  | {
      status: "blocked"
      geometry: null
      lines: null
      summary: null
      work: null
      mayPublishLayout: false
      productionBinding: false
      fingerprint: null
      issues: VNextTextBlockAuthoredBoxGeometryIssueV1[]
    }
```

- [ ] **Step 5: Add the provenance skeleton implementation**

Create `src/layout/textBlockAuthoredBoxGeometryV1.ts`.

Add:

```ts
const processLocalAuthoredBoxLayoutsV1 = new WeakSet<object>()

export function inspectVNextTextBlockAuthoredBoxGeometryV1(
  result: unknown,
): VNextTextBlockAuthoredBoxGeometryInspectionV1 {
  if (
    result == null
    || typeof result !== "object"
    || !processLocalAuthoredBoxLayoutsV1.has(result)
  ) return {
    status: "invalid",
    code: "authored-box-geometry-provenance-mismatch",
    message: "authored box geometry is not the exact process-local result created by Core",
  }
  if (!deeplyFrozenSpatialV1(result)) return {
    status: "invalid",
    code: "authored-box-geometry-not-deeply-frozen",
    message: "registered authored box geometry must remain recursively frozen",
  }
  return {
    status: "valid",
    fingerprint: (result as Extract<
      VNextTextBlockAuthoredBoxGeometryResultV1,
      { status: "accepted" }
    >).fingerprint,
  }
}
```

Expose the strict overloads:

```ts
export function layoutVNextTextBlockAuthoredBoxGeometryV1(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
  spatialIndex: VNextTextBlockSpatialIndexV1
  bindProductionLayout?: boolean
}): VNextTextBlockAuthoredBoxGeometryResultV1
export function layoutVNextTextBlockAuthoredBoxGeometryV1(
  input: unknown,
): VNextTextBlockAuthoredBoxGeometryResultV1
```

Implement a strict root that accepts exactly:

```ts
[
  "initialFlow",
  "persistentFlowTree",
  "request",
  "spatialIndex",
]
```

or those four plus `bindProductionLayout`. Require plain/null-prototype data
properties and reject symbols, accessors, hidden extras, and unknown keys before
reading a field.

For this task, validate the shared binding and create a minimal accepted result
by calling Phase 3 at `startYLayoutUnit: 0`; initially copy content-local
geometry with zero translation. Task 3 replaces that minimal copy with the full
box projection.

The binding inspector returns a sanitized frozen request clone for the legacy
adapter. Do not pass that clone into Phase 3. After the inspector accepts,
Phase 4A must call Phase 3 with `input.request`, because the persistent tree and
spatial index are process-locally bound to that exact request object.

- [ ] **Step 6: Export the new modules**

Add to `src/index.ts` after the Phase 3 layout exports:

```ts
export * from "./layout/textBlockAuthoredBoxGeometryContractV1.js"
export * from "./layout/textBlockAuthoredBoxGeometryV1.js"
```

- [ ] **Step 7: Run the initial Phase 4A contract gate**

Run:

```sh
npx vitest run \
  tests/textBlockAuthoredBoxGeometryV1.test.ts \
  tests/textBlockInitialFlowRequestBindingV1.test.ts \
  tests/textBlockSpatialWrappingLayoutV1.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 8: Commit the Phase 4A contract skeleton**

Run:

```sh
git add \
  src/index.ts \
  src/layout/textBlockAuthoredBoxGeometryContractV1.ts \
  src/layout/textBlockAuthoredBoxGeometryV1.ts \
  tests/helpers/textBlockAuthoredBoxGeometryV1.ts \
  tests/textBlockAuthoredBoxGeometryV1.test.ts
git diff --cached --check
git commit -m "feat(layout): add authored box geometry boundary"
```

---

### Task 3: Exact Box-Local Projection And Auto-Height

**Files:**

- Modify: `src/layout/textBlockAuthoredBoxGeometryV1.ts`
- Modify: `tests/textBlockAuthoredBoxGeometryV1.test.ts`

**Interfaces:**

- Consumes:
  - Task 2 exact accepted identity chain and content-local Phase 3 result;
  - `initialFlow.authoredBoxPlan.contentInsetPt`;
  - `initialFlow.authoredBoxPlan.outerWidthPt`;
  - `initialFlow.authoredBoxPlan.contentWidthPt`;
  - `spatialIndex.summary.maximumBottomLayoutUnit`.
- Produces:
  - exact converted `geometry`;
  - immutable box-local lines, intervals, placements, and fragments;
  - auto-height from flow/spatial extent plus vertical insets.

- [ ] **Step 1: Write exact zero-inset and translated-inset tests**

Add:

```ts
it("preserves content geometry at zero inset and retains the Phase 3 fast path", () => {
  const fixture = acceptedAuthoredBoxGeometryFixture({
    paddingPt: { top: 0, right: 0, bottom: 0, left: 0 },
  })
  const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
    initialFlow: fixture.initialFlow,
    persistentFlowTree: fixture.tree,
    request: fixture.request,
    spatialIndex: fixture.spatialIndex,
  })
  if (result.status !== "accepted") throw new Error("zero inset blocked")

  expect(result.geometry).toMatchObject({
    contentOriginXLayoutUnit: 0,
    contentOriginYLayoutUnit: 0,
    contentWidthLayoutUnit: 100_000_000,
    outerWidthLayoutUnit: 100_000_000,
    contentFlowHeightLayoutUnit: fixture.acceptedLayout.summary.heightLayoutUnit,
    spatialMaximumBottomLayoutUnit: 0,
    contentExtentBottomLayoutUnit: fixture.acceptedLayout.summary.heightLayoutUnit,
    outerHeightLayoutUnit: fixture.acceptedLayout.summary.heightLayoutUnit,
  })
  expect(result.work).toMatchObject({
    spatialIndexQueryCount: 0,
    verticalAdvanceCount: 0,
    lineBandRequeryCount: 0,
  })
  expect(result.lines.map((line) => ({
    renderStartOffset: line.renderStartOffset,
    renderEndOffset: line.renderEndOffset,
    yOffsetLayoutUnit: line.yOffsetLayoutUnit,
    fragments: line.fragments.map((fragment) => ({
      renderStartOffset: fragment.renderStartOffset,
      renderEndOffset: fragment.renderEndOffset,
      xLayoutUnit: fragment.xLayoutUnit,
      advanceLayoutUnit: fragment.advanceLayoutUnit,
    })),
    sourceSegments: line.sourceSegments,
  }))).toEqual(fixture.acceptedLayout.lines.map((line) => ({
    renderStartOffset: line.renderStartOffset,
    renderEndOffset: line.renderEndOffset,
    yOffsetLayoutUnit: line.yOffsetLayoutUnit,
    fragments: line.fragments.map((fragment) => ({
      renderStartOffset: fragment.renderStartOffset,
      renderEndOffset: fragment.renderEndOffset,
      xLayoutUnit: fragment.xLayoutUnit,
      advanceLayoutUnit: fragment.advanceLayoutUnit,
    })),
    sourceSegments: line.sourceSegments,
  })))
})
```

Add authored padding/border translation:

```ts
it("applies authored content origin and vertical insets exactly once", () => {
  const fixture = acceptedAuthoredBoxGeometryFixture({
    paddingPt: { top: 2, right: 5, bottom: 3, left: 7 },
    borderWidthPt: { top: 1, right: 2, bottom: 2, left: 1 },
  })
  const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
    initialFlow: fixture.initialFlow,
    persistentFlowTree: fixture.tree,
    request: fixture.request,
    spatialIndex: fixture.spatialIndex,
  })
  if (result.status !== "accepted") throw new Error("inset fixture blocked")

  expect(result.geometry).toMatchObject({
    outerWidthLayoutUnit: 100_000_000,
    contentInsetsLayoutUnit: {
      top: 3_000_000,
      right: 7_000_000,
      bottom: 5_000_000,
      left: 8_000_000,
    },
    contentOriginXLayoutUnit: 8_000_000,
    contentOriginYLayoutUnit: 3_000_000,
    contentWidthLayoutUnit: 85_000_000,
  })
  expect(result.lines[0]?.yOffsetLayoutUnit)
    .toBe(result.lines[0]!.contentYOffsetLayoutUnit + 3_000_000)
  expect(result.lines[0]?.fragments[0]?.xLayoutUnit)
    .toBe(result.lines[0]!.fragments[0]!.contentXLayoutUnit + 8_000_000)
  expect(result.geometry.outerHeightLayoutUnit).toBe(
    3_000_000
      + result.geometry.contentExtentBottomLayoutUnit
      + 5_000_000,
  )
  expect(result.lines.map((line) => line.sourceSegments))
    .toEqual(fixture.acceptedLayout.lines.map((line) => line.sourceSegments))
})
```

- [ ] **Step 2: Write authored-width wrapping evidence**

Add a fixture whose three 6,000,000-unit clusters have break opportunities and
whose authored content width is 12,000,000:

```ts
it("uses the exact authored content width for line wrapping", () => {
  const fixture = acceptedAuthoredBoxGeometryFixture({
    paddingPt: { top: 0, right: 44, bottom: 0, left: 44 },
    breakOffsets: [0, 1, 2, 3],
  })
  const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
    initialFlow: fixture.initialFlow,
    persistentFlowTree: fixture.tree,
    request: fixture.request,
    spatialIndex: fixture.spatialIndex,
  })
  if (result.status !== "accepted") throw new Error("narrow box blocked")

  expect(result.geometry.contentWidthLayoutUnit).toBe(12_000_000)
  expect(result.lines.map((line) => [
    line.renderStartOffset,
    line.renderEndOffset,
  ])).toEqual([
    [0, 2],
    [2, 3],
  ])
  expect(result.lines.every((line) => (
    line.fragments.every((fragment) => (
      fragment.xLayoutUnit >= result.geometry.contentOriginXLayoutUnit
      && fragment.xLayoutUnit + fragment.advanceLayoutUnit
        <= result.geometry.contentOriginXLayoutUnit
          + result.geometry.contentWidthLayoutUnit
    ))
  ))).toBe(true)
})
```

- [ ] **Step 3: Write spatial maximum-bottom and overlay-height tests**

Use a local entry helper and add:

```ts
it("includes retained spatial extent in auto-height without making overlay consume flow", () => {
  const fixture = acceptedAuthoredBoxGeometryFixture({
    entries: [{
      objectId: "overlay-below-flow",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      xLayoutUnit: 60_000_000,
      yLayoutUnit: 40_000_000,
      widthLayoutUnit: 10_000_000,
      heightLayoutUnit: 20_000_000,
      clearance: {
        topLayoutUnit: 0,
        rightLayoutUnit: 0,
        bottomLayoutUnit: 4_000_000,
        leftLayoutUnit: 0,
      },
      wrapPolicy: "overlay",
    }],
  })
  const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
    initialFlow: fixture.initialFlow,
    persistentFlowTree: fixture.tree,
    request: fixture.request,
    spatialIndex: fixture.spatialIndex,
  })
  if (result.status !== "accepted") throw new Error("overlay fixture blocked")

  expect(result.work.spatialIndexQueryCount).toBe(0)
  expect(result.geometry.spatialMaximumBottomLayoutUnit).toBe(64_000_000)
  expect(result.geometry.contentExtentBottomLayoutUnit).toBe(64_000_000)
  expect(result.geometry.outerHeightLayoutUnit).toBe(68_000_000)
})
```

- [ ] **Step 4: Run the projection tests and observe failures**

Run:

```sh
npx vitest run tests/textBlockAuthoredBoxGeometryV1.test.ts
```

Expected: FAIL because Task 2 does not yet apply exact conversion,
translation, retained content facts, or spatial auto-height.

- [ ] **Step 5: Implement safe box conversion and width equations**

Add:

```ts
function convertBoxGeometry(
  flow: VNextTextBlockInitialFlowV1,
  request: VNextTextBlockMultiRunLayoutRequestV1,
): ConvertedBoxGeometry | VNextTextBlockAuthoredBoxGeometryIssueV1[] {
  const plan = flow.authoredBoxPlan
  const outer = convertVNextPointToLayoutUnitV1(
    plan.outerWidthPt,
    "initialFlow.authoredBoxPlan.outerWidthPt",
  )
  const width = convertVNextPointToLayoutUnitV1(
    plan.contentWidthPt,
    "initialFlow.authoredBoxPlan.contentWidthPt",
  )
  const top = convertVNextPointToLayoutUnitV1(
    plan.contentInsetPt.top,
    "initialFlow.authoredBoxPlan.contentInsetPt.top",
  )
  const right = convertVNextPointToLayoutUnitV1(
    plan.contentInsetPt.right,
    "initialFlow.authoredBoxPlan.contentInsetPt.right",
  )
  const bottom = convertVNextPointToLayoutUnitV1(
    plan.contentInsetPt.bottom,
    "initialFlow.authoredBoxPlan.contentInsetPt.bottom",
  )
  const left = convertVNextPointToLayoutUnitV1(
    plan.contentInsetPt.left,
    "initialFlow.authoredBoxPlan.contentInsetPt.left",
  )
```

Require every conversion accepted and non-negative. Use
`safeVNextTextBlockMultiRunSumV1(...)` for:

```ts
left + contentWidth + right === outerWidth
top + contentExtentBottom + bottom === outerHeight
```

Return `authored-box-width-mismatch` when request width or the outer-width
equation differs. Return `invalid-authored-box-geometry` for conversion or
negative inset failures and `unsafe-layout-arithmetic` for unsafe sums.

- [ ] **Step 6: Project every nested geometry unit**

For each content line, create:

```ts
const intervalFacts = line.availableIntervals.map((interval) => ({
  contentStartLayoutUnit: interval.startLayoutUnit,
  contentEndLayoutUnit: interval.endLayoutUnit,
  startLayoutUnit: safeAddOrBlock(
    interval.startLayoutUnit,
    box.contentOriginXLayoutUnit,
  ),
  endLayoutUnit: safeAddOrBlock(
    interval.endLayoutUnit,
    box.contentOriginXLayoutUnit,
  ),
  contentLineFingerprint: line.fingerprint,
}))
```

Add a Phase 4A fingerprint to each interval. Repeat for placements, retaining
both content-local and box-local x values.

For fragments:

```ts
const {
  xLayoutUnit: contentXLayoutUnit,
  fingerprint: contentFragmentFingerprint,
  ...fragmentRest
} = fragment
const facts = {
  ...fragmentRest,
  contentXLayoutUnit,
  xLayoutUnit: safeAddOrBlock(
    contentXLayoutUnit,
    box.contentOriginXLayoutUnit,
  ),
  contentFragmentFingerprint,
}
```

For lines, retain `contentYOffsetLayoutUnit`, add top inset for
`yOffsetLayoutUnit`, retain `contentRegionFingerprint` and
`contentLineFingerprint`, reuse the source segments without changing source
offsets, then create a new Phase 4A line fingerprint.

Abort the complete request on the first unsafe translated coordinate. Never
emit a partial accepted line list.

Use this helper for every translation:

```ts
function safeAdd(
  left: number,
  right: number,
  path: string,
): number | VNextTextBlockAuthoredBoxGeometryIssueV1 {
  const value = left + right
  return Number.isSafeInteger(value)
    ? value
    : issue(
        "unsafe-layout-arithmetic",
        path,
        "authored box coordinate exceeds safe layout arithmetic",
      )
}
```

- [ ] **Step 7: Derive exact content extent and outer height**

After Phase 3 succeeds:

```ts
const contentExtentBottomLayoutUnit = Math.max(
  spatialLayout.summary.heightLayoutUnit,
  input.spatialIndex.summary.maximumBottomLayoutUnit,
)
```

Use safe integer addition for outer height and include these exact values in
both `geometry` and the final result fingerprint.

- [ ] **Step 8: Run focused projection, Phase 3 parity, and type gates**

Run:

```sh
npx vitest run \
  tests/textBlockAuthoredBoxGeometryV1.test.ts \
  tests/textBlockSpatialWrappingLayoutV1.test.ts \
  tests/textBlockFlowRegionProviderV1.test.ts
npm run type-check
```

Expected: PASS.

- [ ] **Step 9: Commit box-local projection**

Run:

```sh
git add \
  src/layout/textBlockAuthoredBoxGeometryV1.ts \
  tests/textBlockAuthoredBoxGeometryV1.test.ts
git diff --cached --check
git commit -m "feat(layout): project authored box geometry"
```

---

### Task 4: Spatial Composition, Capability Gates, And Adversarial Hardening

**Files:**

- Modify: `src/layout/textBlockAuthoredBoxGeometryV1.ts`
- Modify: `tests/helpers/textBlockAuthoredBoxGeometryV1.ts`
- Modify: `tests/textBlockAuthoredBoxGeometryV1.test.ts`

**Interfaces:**

- Consumes Task 3 accepted projection.
- Produces complete failure ordering and evidence for exclusions,
  move/resize, cloning, tamper, production, accessors, and unsafe arithmetic.

- [ ] **Step 1: Add multi-interval and translated-exclusion tests**

Add one middle exclusion with:

```ts
{
  objectId: "middle",
  geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
  xLayoutUnit: 8_000_000,
  yLayoutUnit: 0,
  widthLayoutUnit: 4_000_000,
  heightLayoutUnit: 20_000_000,
  clearance: {
    topLayoutUnit: 0,
    rightLayoutUnit: 0,
    bottomLayoutUnit: 0,
    leftLayoutUnit: 0,
  },
  wrapPolicy: "rectangular-exclusion",
}
```

Use an authored left inset of 5,000,000 layout units. Assert:

```ts
const contentWidth = fixture.request.availableWidthLayoutUnit
expect(line.availableIntervals.map((interval) => ({
  content: [interval.contentStartLayoutUnit, interval.contentEndLayoutUnit],
  box: [interval.startLayoutUnit, interval.endLayoutUnit],
}))).toEqual([
  { content: [0, 8_000_000], box: [5_000_000, 13_000_000] },
  { content: [12_000_000, contentWidth], box: [17_000_000, 5_000_000 + contentWidth] },
])
```

Assert every placement and fragment x receives the same translation and every
render/source range remains unchanged.

- [ ] **Step 2: Add top/bottom barrier composition evidence**

Add a full-content-width barrier from y 0 through 20,000,000. The default
fixture owns a 2,000,000 top content inset:

```ts
it("retains Phase 3 barrier advancement before applying the box-local y origin", () => {
  const fixture = acceptedAuthoredBoxGeometryFixture({
    entries: [{
      objectId: "top-barrier",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      xLayoutUnit: 0,
      yLayoutUnit: 0,
      widthLayoutUnit: 90_000_000,
      heightLayoutUnit: 20_000_000,
      clearance: {
        topLayoutUnit: 0,
        rightLayoutUnit: 0,
        bottomLayoutUnit: 0,
        leftLayoutUnit: 0,
      },
      wrapPolicy: "top-bottom-barrier",
    }],
  })
  const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
    initialFlow: fixture.initialFlow,
    persistentFlowTree: fixture.tree,
    request: fixture.request,
    spatialIndex: fixture.spatialIndex,
  })
  if (result.status !== "accepted") throw new Error("barrier fixture blocked")

  expect(result.lines[0]?.contentYOffsetLayoutUnit).toBe(20_000_000)
  expect(result.lines[0]?.yOffsetLayoutUnit).toBe(22_000_000)
  expect(result.work.verticalAdvanceCount).toBeGreaterThan(0)
})
```

- [ ] **Step 3: Add exact move/resize composition tests**

Build a fixture with one exclusion, call
`createVNextTextBlockSpatialIndexUpdateV1(...)`, then call Phase 4A once with
the previous index and once with `update.nextIndex`.

Use:

```ts
const update = createVNextTextBlockSpatialIndexUpdateV1({
  previousIndex: fixture.spatialIndex,
  expectedPreviousIndexFingerprint: fixture.spatialIndex.fingerprint,
  persistentFlowTree: fixture.tree,
  request: fixture.request,
  objectId: "movable",
  geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
  nextGeometry: {
    xLayoutUnit: 20_000_000,
    yLayoutUnit: 30_000_000,
    widthLayoutUnit: 15_000_000,
    heightLayoutUnit: 25_000_000,
  },
})
expect(update.status).toBe("accepted")
if (update.status !== "accepted") throw new Error("spatial update blocked")
```

Assert:

```ts
expect(after.persistentFlowTreeFingerprint)
  .toBe(before.persistentFlowTreeFingerprint)
expect(after.spatialIndexFingerprint).not.toBe(before.spatialIndexFingerprint)
expect(after.fingerprint).not.toBe(before.fingerprint)
expect(update.work.completeIndexRebuildCount).toBe(0)
```

For resize, make the next spatial maximum bottom larger and assert the next
outer height increases by the exact delta.

- [ ] **Step 4: Add capability and strict-root rejection tests**

Create independent Initial Flow objects from:

- `listOnlyGeometryBuildInputFixture()`;
- `imageOnlyGeometryBuildInputFixture()`;
- `emptyGeometryBuildInputFixture()`;
- `renderedEmptyFieldGeometryBuildInputFixture()`; and
- `hardBreakOnlyGeometryBuildInputFixture()`.

Pass each with otherwise valid tree/request/index inputs and assert:

```ts
{
  status: "blocked",
  geometry: null,
  lines: null,
  summary: null,
  work: null,
  fingerprint: null,
  mayPublishLayout: false,
  productionBinding: false,
  issues: [{ code: "initial-flow-capability-required" }],
}
```

Add root tests for:

- unknown own key;
- symbol key;
- non-enumerable extra;
- custom prototype;
- accessor for each required field;
- `bindProductionLayout: true`.

Verify no accessor executes and production returns
`production-binding-forbidden`.

- [ ] **Step 5: Add provenance, stale, and unsafe arithmetic tests**

Assert blocked results for:

- JSON-cloned/re-frozen Initial Flow;
- cloned persistent tree;
- an index from a different tree;
- a request object equal by value but not the exact tree-bound object;
- cloned Phase 4A output passed to the inspector;
- deep-frozen clone with recomputed public fingerprints;
- an authored box whose request width drifts by one layout unit;
- translated y overflow after a valid near-maximum content-local line; and
- outer-height overflow from a valid near-maximum spatial bottom.

Use existing process-local inspection and binding APIs to build each case;
never edit WeakSet state or import test-only internals.

Build two independent but fact-equivalent accepted fixture chains and assert
their final fingerprints are equal. Then change only the authored top inset and
assert the final fingerprint changes while rendered/source ranges remain
equal.

- [ ] **Step 6: Run the adversarial tests and observe failures**

Run:

```sh
npx vitest run tests/textBlockAuthoredBoxGeometryV1.test.ts
```

Expected: FAIL on missing or incorrectly ordered Phase 4A blockers.

- [ ] **Step 7: Complete the Phase 4A failure pipeline**

Use this order:

1. strict root;
2. production binding;
3. shared Initial Flow/request binding;
4. authored-box conversion and width equations;
5. exact tree/request binding;
6. exact index/tree/request binding;
7. unchanged Phase 3 layout;
8. Phase 3 result inspection;
9. safe box-local projection;
10. safe auto-height;
11. complete fingerprint/freeze/registration.

Map shared binding issues:

```ts
const code = binding.issues[0]?.code === "initial-flow-capability-required"
  ? "initial-flow-capability-required"
  : "initial-flow-request-binding-mismatch"
```

Map Phase 3 blocked results to one `spatial-layout-blocked` Phase 4A issue
whose message includes the ordered Phase 3 issue codes but does not expose
partial lines.

Before accepting, require:

```ts
inspectVNextTextBlockSpatialWrappingLayoutV1(spatialLayout).status === "valid"
```

Register only the final deeply frozen accepted result.

- [ ] **Step 8: Run the complete focused implementation gate**

Run:

```sh
npx vitest run \
  tests/textBlockInitialFlowRequestBindingV1.test.ts \
  tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts \
  tests/textBlockInitialFlowInputV1.test.ts \
  tests/textBlockPersistentFlowTreeV1.test.ts \
  tests/textBlockSpatialIndexV1.test.ts \
  tests/textBlockSpatialIndexUpdateV1.test.ts \
  tests/textBlockFlowRegionProviderV1.test.ts \
  tests/textBlockSpatialWrappingLayoutV1.test.ts \
  tests/textBlockAuthoredBoxGeometryV1.test.ts
npm run type-check
git diff --check
```

Expected: PASS.

- [ ] **Step 9: Commit hardening and composition evidence**

Run:

```sh
git add \
  src/layout/textBlockAuthoredBoxGeometryV1.ts \
  tests/helpers/textBlockAuthoredBoxGeometryV1.ts \
  tests/textBlockAuthoredBoxGeometryV1.test.ts
git diff --cached --check
git commit -m "test(layout): harden authored box geometry"
```

---

### Task 5: Phase 4A Evidence, Active Pointers, And Final Verification

**Files:**

- Create: `docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md`
- Create: `tests/liveDraftMr1AuthoredBoxGeometry4a.test.ts`
- Modify: `docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md`
- Modify: `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`
- Modify: `docs/PHASE_LEDGER.md`
- Modify:
  `docs/superpowers/specs/2026-07-27-initial-text-block-authored-box-geometry-design.md`

**Interfaces:**

- Consumes all accepted implementation evidence and actual command totals.
- Produces one capability-honest Phase 4A handoff and an explicit stop before
  Phase 4B implementation.

- [ ] **Step 1: Write the documentation guard first**

Create `tests/liveDraftMr1AuthoredBoxGeometry4a.test.ts` using the Phase 3
handoff test helpers:

```ts
const deferredNoGo =
  "List decoration, inline-image geometry, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO."
```

Require these evidence headings:

```ts
expect(headings).toEqual([
  "## Status",
  "## Outcome",
  "## Capability Matrix",
  "## Authored Box Width Evidence",
  "## Box-Local Projection Evidence",
  "## Auto-Height And Spatial Evidence",
  "## Identity And Failure Evidence",
  "## PASS",
  "## FAIL / BLOCKER",
  "## RISK",
  "## UNKNOWN",
  "## Verification",
  "## Next Checkpoint",
])
```

Require capability rows:

```ts
[
  "| authored box width | Core Phase 4A accepted |",
  "| vertical content insets | Core Phase 4A accepted |",
  "| box-local line and fragment geometry | Core Phase 4A accepted |",
  "| synthetic spatial wrapping | retained Phase 3A |",
  "| inline images | NO-GO |",
  "| list decoration | NO-GO |",
  "| empty blocks | NO-GO |",
  "| authored positioned objects | NO-GO |",
  "| Columns/Table | NO-GO |",
  "| Editor/Backend binding | NO-GO |",
  "| publication/production | NO-GO |",
]
```

Require:

- `mayPublishLayout: false`;
- `productionBinding: false`;
- `stagedEditorApply: false`;
- `core-synthetic-qa-only`;
- content-local Phase 3 behavior unchanged;
- box-local Phase 4A projection;
- exact top/bottom inset ownership;
- `maximumBottomLayoutUnit`;
- zero-query fast path;
- no spatial-line reuse/reconvergence claim;
- focused and full gate totals as numeric text; and
- an explicit statement that Phase 4B requires a separately approved design.

Require these exports in `src/index.ts`:

```ts
[
  'export * from "./layout/textBlockInitialFlowRequestBindingV1.js"',
  'export * from "./layout/textBlockAuthoredBoxGeometryContractV1.js"',
  'export * from "./layout/textBlockAuthoredBoxGeometryV1.js"',
]
```

- [ ] **Step 2: Run the documentation guard and verify it fails**

Run:

```sh
npx vitest run tests/liveDraftMr1AuthoredBoxGeometry4a.test.ts
```

Expected: FAIL because the Phase 4A evidence document does not exist and active
pointers still stop at broad Phase 4.

- [ ] **Step 3: Run the focused implementation gate and capture exact totals**

Run the nine implementation test files from Task 4 plus the new documentation
guard:

```sh
npx vitest run \
  tests/textBlockInitialFlowRequestBindingV1.test.ts \
  tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts \
  tests/textBlockInitialFlowInputV1.test.ts \
  tests/textBlockPersistentFlowTreeV1.test.ts \
  tests/textBlockSpatialIndexV1.test.ts \
  tests/textBlockSpatialIndexUpdateV1.test.ts \
  tests/textBlockFlowRegionProviderV1.test.ts \
  tests/textBlockSpatialWrappingLayoutV1.test.ts \
  tests/textBlockAuthoredBoxGeometryV1.test.ts \
  tests/liveDraftMr1AuthoredBoxGeometry4a.test.ts
```

Expected before docs: only the documentation guard fails. Record the exact
file/test totals from the next all-green run in the evidence document.

- [ ] **Step 4: Write the Phase 4A evidence document**

Create `docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md` with the exact headings
from Step 1.

The Status section must say:

```markdown
Phase 4A is accepted as a bounded Core-only authored-box geometry checkpoint.
Every accepted result retains `mayPublishLayout: false`,
`productionBinding: false`, and `stagedEditorApply: false`.

The strict positioned-object authority remains `core-synthetic-qa-only`.
List decoration, inline-image geometry, empty-block geometry, Editor/Backend
binding, Columns/Table integration, Table auto-fit, publication, production
activation, and Editor staged apply remain NO-GO.
```

Document:

- the implementation baseline commit after Task 4;
- shared Initial Flow/request binding ownership;
- exact point-to-layout-unit width and inset equations;
- content-local Phase 3 execution at y zero;
- box-local x/y projection and regenerated fingerprints;
- auto-height from max(flow height, spatial maximum bottom);
- overlay height without flow exclusion;
- fast-path work facts;
- structured blocker rows;
- focused numeric totals;
- final full numeric totals after Step 7; and
- the next checkpoint as:

```markdown
Stop after Phase 4A. `Phase 4B: Inline Image Line-Box Geometry` requires a
separately reviewed and explicitly approved design before implementation.
```

- [ ] **Step 5: Advance only active historical pointers**

In `docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md`, append a historical pointer
note under Next Checkpoint:

```markdown
Historical pointer status on 2026-07-27: fulfilled by
`docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md`.
```

In `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`:

- update the title/status date through Phase 4A;
- add the Phase 4A implementation baseline;
- add one current-state Phase 4A summary;
- add `docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md` first in Required
  Reading;
- replace the active “First Task” and active Handoff Prompt with the explicit
  Phase 4B design-review gate;
- append a `## Phase 4A Initial TextBlock Authored Box Geometry` evidence
  section; and
- retain historical Phase 1/2/3 text and counts unchanged.

In `docs/PHASE_LEDGER.md`, append:

```markdown
## Phase 4A Initial TextBlock Authored Box Geometry
```

with status, behavior, evidence files, exact focused/full totals, NO-GO rows,
and the Phase 4B design-review gate.

Change the design spec Status only after all implementation tests pass:

```markdown
Status: implemented and accepted as the bounded Phase 4A Core checkpoint.
```

- [ ] **Step 6: Run the focused gate until all documentation assertions pass**

Run:

```sh
npx vitest run \
  tests/liveDraftMr1CompleteGeometryBoundary.test.ts \
  tests/liveDraftMr1PersistentFlowFoundation.test.ts \
  tests/liveDraftMr1SpatialWrapping3a.test.ts \
  tests/liveDraftMr1AuthoredBoxGeometry4a.test.ts \
  tests/textBlockInitialFlowRequestBindingV1.test.ts \
  tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts \
  tests/textBlockAuthoredBoxGeometryV1.test.ts \
  tests/textBlockSpatialWrappingLayoutV1.test.ts
```

Expected: PASS. Record these exact focused totals in the evidence document and
make the documentation guard require them.

- [ ] **Step 7: Run the complete Core verification gate**

Run:

```sh
npm run check
git diff --check
git status --short --branch
```

Expected:

- type-check PASS;
- every Core test file PASS;
- every Core test PASS;
- no whitespace errors; and
- only intentional Phase 4A files changed.

Write the exact full file/test totals printed by this run into:

- `docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md`;
- the appended Phase 4A cross-runtime handoff section; and
- the appended Phase 4A ledger section.

Run the documentation guard again after recording totals.

- [ ] **Step 8: Review the complete branch diff**

Run:

```sh
git diff --stat 2847e94...HEAD
git diff --check
git status --short
```

Review every uncommitted file for:

- Phase 4A-only scope;
- no dependency or lockfile changes;
- no Editor/Backend files;
- no canonical schema mutation;
- no Phase 3 algorithm/fingerprint change;
- exact false publication/production/staged flags;
- explicit list/image/empty blockers; and
- no timing, heap, frame, reuse, reconvergence, or product-readiness claim.

- [ ] **Step 9: Commit the Phase 4A handoff**

Run:

```sh
git add \
  docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md \
  docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md \
  docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md \
  docs/PHASE_LEDGER.md \
  docs/superpowers/specs/2026-07-27-initial-text-block-authored-box-geometry-design.md \
  tests/liveDraftMr1AuthoredBoxGeometry4a.test.ts
git diff --cached --check
git commit -m "docs: hand off authored box geometry 4a"
```

- [ ] **Step 10: Perform final verification from committed HEAD**

Run:

```sh
npm run check
git diff --check
git status --short --branch
git log --oneline --decorate -8
```

Expected:

- the same full Core totals remain green from committed HEAD;
- the worktree is clean;
- the branch contains only the design and Phase 4A implementation sequence;
- `main` remains untouched at its pre-integration head; and
- no push, publication, production activation, or later-phase work occurred.

## Completion Handoff

Report:

- PASS: accepted authored width, exact box-local projection, vertical inset
  ownership, spatial auto-height, fast path, provenance, focused tests,
  type-check, full Core gate, and clean branch.
- FAIL / BLOCKER: any failed gate, partial geometry, changed Phase 3
  fingerprints, unsupported capability acceptance, or unrelated dirty file.
- RISK: adapter extraction rejection ordering, translated fingerprint coverage,
  independently converted edge arithmetic, and spatial content below text.
- UNKNOWN: inline-image line-box rules, list decoration, empty blocks,
  fixed-height overflow, authored positioned objects, reconvergence, and
  product budgets.
- Files changed: exact final file list.
- Behavior changed: Core-only Phase 4A authored-box composition.
- Tests run: exact commands and numeric totals.
- Intentionally not changed: canonical schema, Phase 3 spatial algorithm,
  Editor, Backend, Columns/Table, auto-fit, publication, production, staged
  apply, and Phase 4B+.

After verification and review, use `superpowers:finishing-a-development-branch`
to offer the user the integration choices. Do not merge or push without the
user selecting an integration option.
