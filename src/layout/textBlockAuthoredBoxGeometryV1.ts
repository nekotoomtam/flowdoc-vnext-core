import type {
  VNextTextBlockInitialFlowV1,
} from "./textBlockInitialFlowInputV1.js"
import {
  inspectVNextTextBlockInitialFlowRequestBindingV1,
} from "./textBlockInitialFlowRequestBindingV1.js"
import type {
  VNextTextBlockMultiRunLayoutRequestV1,
  VNextTextBlockPositionedFragmentV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import type {
  VNextTextBlockPersistentFlowTreeV1,
} from "./textBlockPersistentFlowContractV1.js"
import {
  inspectVNextTextBlockPersistentFlowTreeV1,
} from "./textBlockPersistentFlowTreeV1.js"
import {
  hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1,
} from "./textBlockPersistentFlowTreeInternalsV1.js"
import type {
  VNextTextBlockSpatialIndexV1,
} from "./textBlockSpatialIndexContractV1.js"
import {
  deeplyFrozenSpatialV1,
  deepFreezeSpatialV1,
  hasSpatialIndexBindingV1,
  spatialFingerprintV1,
} from "./textBlockSpatialIndexInternalsV1.js"
import {
  inspectVNextTextBlockSpatialIndexV1,
} from "./textBlockSpatialIndexV1.js"
import {
  convertVNextTextBlockAuthoredBoxKernelV1,
  deriveVNextTextBlockAuthoredBoxAutoHeightKernelV1,
  projectVNextTextBlockAuthoredBoxGeometryKernelV1,
  projectVNextTextBlockAuthoredBoxLinesKernelV1,
  type VNextTextBlockAuthoredBoxKernelConversionResultV1,
} from "./textBlockAuthoredBoxGeometryKernelV1.js"
import {
  inspectVNextTextBlockSpatialWrappingLayoutV1,
  layoutVNextTextBlockSpatialWrappingV1,
} from "./textBlockSpatialWrappingLayoutV1.js"
import {
  VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_SOURCE,
  VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_VERSION,
  type VNextTextBlockAuthoredBoxGeometryInspectionV1,
  type VNextTextBlockAuthoredBoxGeometryIssueCodeV1,
  type VNextTextBlockAuthoredBoxGeometryIssueV1,
  type VNextTextBlockAuthoredBoxGeometryResultV1,
  type VNextTextBlockAuthoredBoxLineV1,
} from "./textBlockAuthoredBoxGeometryContractV1.js"

interface AuthoredBoxGeometryEnvelopeV1 {
  initialFlow: unknown
  persistentFlowTree: unknown
  request: unknown
  spatialIndex: unknown
  bindProductionLayout?: unknown
}

const processLocalAuthoredBoxLayoutsV1 = new WeakSet<object>()

type ConvertedBoxGeometry = Extract<
  VNextTextBlockAuthoredBoxKernelConversionResultV1,
  { status: "accepted" }
>

type V1TextRetainedFragment = Omit<
  VNextTextBlockPositionedFragmentV1,
  "xLayoutUnit" | "fingerprint"
>

type V1BoxLineProjectionResult =
  | { status: "accepted"; lines: readonly VNextTextBlockAuthoredBoxLineV1[] }
  | { status: "blocked"; issue: VNextTextBlockAuthoredBoxGeometryIssueV1 }

function issue(
  code: VNextTextBlockAuthoredBoxGeometryIssueCodeV1,
  path: string,
  message: string,
): VNextTextBlockAuthoredBoxGeometryIssueV1 {
  return { code, severity: "error", path, message }
}

function blocked(
  item: VNextTextBlockAuthoredBoxGeometryIssueV1,
): VNextTextBlockAuthoredBoxGeometryResultV1 {
  return deepFreezeSpatialV1({
    status: "blocked" as const,
    geometry: null,
    lines: null,
    summary: null,
    work: null,
    mayPublishLayout: false as const,
    productionBinding: false as const,
    fingerprint: null,
    issues: [item],
  })
}

function strictEnvelope(input: unknown): AuthoredBoxGeometryEnvelopeV1 | null {
  try {
    if (input == null || typeof input !== "object") return null
    const prototype = Object.getPrototypeOf(input)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(input).length !== 0) return null
    const keys = Reflect.ownKeys(input)
    const requiredKeys = [
      "initialFlow",
      "persistentFlowTree",
      "request",
      "spatialIndex",
    ] as const
    const hasProductionBinding = keys.includes("bindProductionLayout")
    if (
      keys.length !== requiredKeys.length + (hasProductionBinding ? 1 : 0)
      || requiredKeys.some((key) => !keys.includes(key))
      || keys.some((key) => (
        typeof key !== "string"
        || (
          !requiredKeys.includes(key as typeof requiredKeys[number])
          && key !== "bindProductionLayout"
        )
      ))
    ) return null
    const values: Record<string, unknown> = {}
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(input, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      values[key as string] = descriptor.value
    }
    if (
      hasProductionBinding
      && typeof values.bindProductionLayout !== "boolean"
    ) return null
    return values as unknown as AuthoredBoxGeometryEnvelopeV1
  } catch {
    return null
  }
}

function requestsProductionBinding(request: unknown): boolean {
  try {
    if (request == null || typeof request !== "object") return false
    const descriptor = Object.getOwnPropertyDescriptor(
      request,
      "bindProductionLayout",
    )
    return descriptor != null
      && Object.hasOwn(descriptor, "value")
      && descriptor.value === true
  } catch {
    return false
  }
}

function projectBoxLocalLines(input: {
  lines: Extract<
    ReturnType<typeof layoutVNextTextBlockSpatialWrappingV1>,
    { status: "accepted" }
  >["lines"]
  box: ConvertedBoxGeometry
}): V1BoxLineProjectionResult {
  const projection = projectVNextTextBlockAuthoredBoxGeometryKernelV1<
    V1TextRetainedFragment,
    never
  >({
    lines: projectVNextTextBlockAuthoredBoxLinesKernelV1({
    lines: input.lines,
    contentOriginXLayoutUnit: input.box.contentOriginXLayoutUnit,
    contentOriginYLayoutUnit: input.box.contentOriginYLayoutUnit,
    projectLine: (line) => ({
      index: line.index,
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
      contentYOffsetLayoutUnit: line.yOffsetLayoutUnit,
      heightLayoutUnit: line.heightLayoutUnit,
      baselineOffsetLayoutUnit: line.baselineOffsetLayoutUnit,
      availableIntervals: line.availableIntervals,
      intervalPlacements: line.intervalPlacements,
      fragments: line.fragments.map((fragment) => {
        const { xLayoutUnit, fingerprint: contentFragmentFingerprint, ...retained } = fragment
        return { kind: "text" as const, contentXLayoutUnit: xLayoutUnit, contentFragmentFingerprint, retained }
      }),
      sourceSegments: line.sourceSegments,
      contentRegionFingerprint: line.regionFingerprint,
      contentLineFingerprint: line.fingerprint,
    }),
    }),
    contentOriginXLayoutUnit: input.box.contentOriginXLayoutUnit,
    contentOriginYLayoutUnit: input.box.contentOriginYLayoutUnit,
  })
  return projection.status === "accepted"
    ? { status: "accepted", lines: projection.lines }
    : { status: "blocked", issue: projection.issues[0]! }
}

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
export function layoutVNextTextBlockAuthoredBoxGeometryV1(
  input: unknown,
): VNextTextBlockAuthoredBoxGeometryResultV1 {
  const envelope = strictEnvelope(input)
  if (envelope == null) return blocked(issue(
    "invalid-input",
    "input",
    "authored box geometry input must be a strict data-only object",
  ))
  if (envelope.bindProductionLayout === true) return blocked(issue(
    "production-binding-forbidden",
    "bindProductionLayout",
    "authored box geometry cannot bind production layout",
  ))
  if (requestsProductionBinding(envelope.request)) return blocked(issue(
    "production-binding-forbidden",
    "request.bindProductionLayout",
    "authored box geometry cannot bind production layout",
  ))
  const binding = inspectVNextTextBlockInitialFlowRequestBindingV1({
    initialFlow: envelope.initialFlow,
    request: envelope.request,
  })
  if (binding.status !== "accepted") {
    const bindingIssue = binding.issues[0]
    const code = binding.issues[0]?.code === "initial-flow-capability-required"
      ? "initial-flow-capability-required"
      : "initial-flow-request-binding-mismatch"
    return blocked(issue(
      code,
      bindingIssue?.path ?? "initialFlow",
      bindingIssue?.message ?? "Initial Flow request binding was unavailable",
    ))
  }

  const initialFlow = envelope.initialFlow as VNextTextBlockInitialFlowV1
  const persistentFlowTree =
    envelope.persistentFlowTree as VNextTextBlockPersistentFlowTreeV1
  const request = envelope.request as VNextTextBlockMultiRunLayoutRequestV1
  const spatialIndex = envelope.spatialIndex as VNextTextBlockSpatialIndexV1
  const box = convertVNextTextBlockAuthoredBoxKernelV1({
    authoredBoxPlan: initialFlow.authoredBoxPlan,
    contentWidthLayoutUnit: request.availableWidthLayoutUnit,
  })
  if (box.status !== "accepted") return blocked(box.issues[0]!)
  const treeInspection = inspectVNextTextBlockPersistentFlowTreeV1(
    persistentFlowTree,
  )
  if (
    treeInspection.status !== "valid"
    || !hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1(
      persistentFlowTree,
      request,
    )
  ) return blocked(issue(
    "flow-tree-request-binding-mismatch",
    treeInspection.status === "valid" ? "request" : "persistentFlowTree",
    treeInspection.status === "valid"
      ? "authored box geometry requires the exact unchanged request bound to the persistent flow tree"
      : treeInspection.message,
  ))
  const indexInspection = inspectVNextTextBlockSpatialIndexV1(spatialIndex)
  if (
    indexInspection.status !== "valid"
    || !hasSpatialIndexBindingV1({
      index: spatialIndex,
      persistentFlowTree,
      request,
    })
  ) return blocked(issue(
    "spatial-index-binding-mismatch",
    "spatialIndex",
    indexInspection.status === "valid"
      ? "authored box geometry requires the exact spatial index bound to the persistent flow tree and request"
      : indexInspection.message,
  ))
  const spatialLayout = layoutVNextTextBlockSpatialWrappingV1({
    persistentFlowTree,
    request,
    spatialIndex,
    startYLayoutUnit: 0,
  })
  if (spatialLayout.status !== "accepted") {
    const orderedCodes = spatialLayout.issues.map((item) => item.code)
    return blocked(issue(
      "spatial-layout-blocked",
      "spatialLayout",
      `Phase 3 spatial wrapping blocked with ordered issue codes: ${
        orderedCodes.join(", ")
      }`,
    ))
  }
  const spatialInspection =
    inspectVNextTextBlockSpatialWrappingLayoutV1(spatialLayout)
  if (spatialInspection.status !== "valid") return blocked(issue(
    "spatial-layout-provenance-mismatch",
    "spatialLayout",
    spatialInspection.message,
  ))

  const lineProjection = projectBoxLocalLines({ lines: spatialLayout.lines, box })
  if (lineProjection.status !== "accepted") return blocked(lineProjection.issue)
  const lines = lineProjection.lines
  const autoHeight = deriveVNextTextBlockAuthoredBoxAutoHeightKernelV1({
    topInsetLayoutUnit: box.contentInsetsLayoutUnit.top,
    bottomInsetLayoutUnit: box.contentInsetsLayoutUnit.bottom,
    contentFlowHeightLayoutUnit: spatialLayout.summary.heightLayoutUnit,
    spatialMaximumBottomLayoutUnit: spatialIndex.summary.maximumBottomLayoutUnit,
  })
  if (autoHeight.status !== "accepted") return blocked(autoHeight.issues[0]!)
  const geometry = {
    outerWidthLayoutUnit: box.outerWidthLayoutUnit,
    contentInsetsLayoutUnit: box.contentInsetsLayoutUnit,
    contentOriginXLayoutUnit: box.contentOriginXLayoutUnit,
    contentOriginYLayoutUnit: box.contentOriginYLayoutUnit,
    contentWidthLayoutUnit: box.contentWidthLayoutUnit,
    contentFlowHeightLayoutUnit: spatialLayout.summary.heightLayoutUnit,
    spatialMaximumBottomLayoutUnit:
      spatialIndex.summary.maximumBottomLayoutUnit,
    contentExtentBottomLayoutUnit: autoHeight.contentExtentBottomLayoutUnit,
    outerHeightLayoutUnit: autoHeight.outerHeightLayoutUnit,
  }
  const facts = {
    status: "accepted" as const,
    source: VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_VERSION,
    documentId: spatialLayout.documentId,
    sectionId: spatialLayout.sectionId,
    textBlockId: spatialLayout.textBlockId,
    instanceRevision: spatialLayout.instanceRevision,
    layoutId: binding.layoutId,
    layoutContextFingerprint: spatialLayout.layoutContextFingerprint,
    initialFlowFingerprint: initialFlow.fingerprint,
    parentRegionFingerprint: initialFlow.parentRegion.fingerprint,
    authoredBoxOwnerNodeId: initialFlow.authoredBoxPlan.ownerNodeId,
    authoredBoxStyleFingerprint: initialFlow.authoredBoxPlan.styleFingerprint,
    authoredBoxPlanFingerprint: initialFlow.authoredBoxPlan.fingerprint,
    persistentFlowTreeFingerprint: spatialLayout.persistentFlowTreeFingerprint,
    spatialIndexFingerprint: spatialLayout.spatialIndexFingerprint,
    contentSpatialLayoutFingerprint: spatialLayout.fingerprint,
    geometry,
    lines,
    summary: {
      lineCount: spatialLayout.summary.lineCount,
      fragmentCount: spatialLayout.summary.fragmentCount,
      intervalPlacementCount: spatialLayout.summary.intervalPlacementCount,
      outerHeightLayoutUnit: geometry.outerHeightLayoutUnit,
    },
    work: spatialLayout.work,
    contracts: {
      authoredBoxWidthApplied: true as const,
      verticalInsetsApplied: true as const,
      autoHeightIncludesSpatialExtent: true as const,
      contentLocalSpatialWrapping: true as const,
      boxLocalProjection: true as const,
      canonicalPositionedObjectSchema: false as const,
      authoredPositionedObjectBinding: false as const,
      rendererMayMeasureText: false as const,
      rendererMayRelayout: false as const,
      stagedEditorApply: false as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    },
    mayPublishLayout: false as const,
    productionBinding: false as const,
    issues: [] as [],
  }
  const result = deepFreezeSpatialV1({
    ...facts,
    fingerprint: spatialFingerprintV1(facts),
  })
  processLocalAuthoredBoxLayoutsV1.add(result)
  return result
}

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
