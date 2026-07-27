import type {
  VNextTextBlockInitialFlowV1,
} from "./textBlockInitialFlowInputV1.js"
import {
  inspectVNextTextBlockInitialFlowRequestBindingV1,
} from "./textBlockInitialFlowRequestBindingV1.js"
import type {
  VNextTextBlockMultiRunLayoutRequestV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import type {
  VNextTextBlockPersistentFlowTreeV1,
} from "./textBlockPersistentFlowContractV1.js"
import type {
  VNextTextBlockSpatialIndexV1,
} from "./textBlockSpatialIndexContractV1.js"
import {
  deeplyFrozenSpatialV1,
  deepFreezeSpatialV1,
  spatialFingerprintV1,
} from "./textBlockSpatialIndexInternalsV1.js"
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

function projectZeroTranslationLines(input: {
  lines: Extract<
    ReturnType<typeof layoutVNextTextBlockSpatialWrappingV1>,
    { status: "accepted" }
  >["lines"]
}): VNextTextBlockAuthoredBoxLineV1[] {
  return input.lines.map((line) => {
    const availableIntervals = line.availableIntervals.map((interval) => {
      const facts = {
        contentStartLayoutUnit: interval.startLayoutUnit,
        contentEndLayoutUnit: interval.endLayoutUnit,
        startLayoutUnit: interval.startLayoutUnit,
        endLayoutUnit: interval.endLayoutUnit,
        contentLineFingerprint: line.fingerprint,
      }
      return {
        ...facts,
        fingerprint: spatialFingerprintV1(facts),
      }
    })
    const intervalPlacements = line.intervalPlacements.map((placement) => {
      const facts = {
        intervalIndex: placement.intervalIndex,
        renderStartOffset: placement.renderStartOffset,
        renderEndOffset: placement.renderEndOffset,
        contentXStartLayoutUnit: placement.xStartLayoutUnit,
        contentXEndLayoutUnit: placement.xEndLayoutUnit,
        xStartLayoutUnit: placement.xStartLayoutUnit,
        xEndLayoutUnit: placement.xEndLayoutUnit,
        contentLineFingerprint: line.fingerprint,
      }
      return {
        ...facts,
        fingerprint: spatialFingerprintV1(facts),
      }
    })
    const fragments = line.fragments.map((fragment) => {
      const {
        xLayoutUnit,
        fingerprint: contentFragmentFingerprint,
        ...retained
      } = fragment
      const facts = {
        ...retained,
        contentXLayoutUnit: xLayoutUnit,
        xLayoutUnit,
        contentFragmentFingerprint,
      }
      return {
        ...facts,
        fingerprint: spatialFingerprintV1(facts),
      }
    })
    const facts = {
      index: line.index,
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
      contentYOffsetLayoutUnit: line.yOffsetLayoutUnit,
      yOffsetLayoutUnit: line.yOffsetLayoutUnit,
      heightLayoutUnit: line.heightLayoutUnit,
      baselineOffsetLayoutUnit: line.baselineOffsetLayoutUnit,
      availableIntervals,
      intervalPlacements,
      fragments,
      sourceSegments: line.sourceSegments,
      contentRegionFingerprint: line.regionFingerprint,
      contentLineFingerprint: line.fingerprint,
    }
    return {
      ...facts,
      fingerprint: spatialFingerprintV1(facts),
    }
  })
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
  const binding = inspectVNextTextBlockInitialFlowRequestBindingV1({
    initialFlow: envelope.initialFlow,
    request: envelope.request,
  })
  if (binding.status !== "accepted") {
    const bindingIssue = binding.issues[0]
    return blocked(issue(
      bindingIssue?.code === "initial-flow-capability-required"
        ? "initial-flow-capability-required"
        : "initial-flow-request-binding-mismatch",
      bindingIssue?.path ?? "initialFlow",
      bindingIssue?.message ?? "Initial Flow request binding was unavailable",
    ))
  }
  if (binding.request.bindProductionLayout === true) return blocked(issue(
    "production-binding-forbidden",
    "request.bindProductionLayout",
    "authored box geometry cannot bind production layout",
  ))

  const initialFlow = envelope.initialFlow as VNextTextBlockInitialFlowV1
  const persistentFlowTree =
    envelope.persistentFlowTree as VNextTextBlockPersistentFlowTreeV1
  const request = envelope.request as VNextTextBlockMultiRunLayoutRequestV1
  const spatialIndex = envelope.spatialIndex as VNextTextBlockSpatialIndexV1
  const spatialLayout = layoutVNextTextBlockSpatialWrappingV1({
    persistentFlowTree,
    request,
    spatialIndex,
    startYLayoutUnit: 0,
  })
  if (spatialLayout.status !== "accepted") {
    const spatialIssue = spatialLayout.issues[0]
    const code = spatialIssue?.code === "production-binding-forbidden"
      ? "production-binding-forbidden"
      : spatialIssue?.code === "flow-tree-provenance-mismatch"
          || spatialIssue?.code === "flow-tree-request-binding-mismatch"
        ? "flow-tree-request-binding-mismatch"
        : spatialIssue?.code === "spatial-index-binding-mismatch"
          ? "spatial-index-binding-mismatch"
          : "spatial-layout-blocked"
    return blocked(issue(
      code,
      spatialIssue?.path ?? "spatialLayout",
      spatialIssue?.message ?? "spatial wrapping layout was unavailable",
    ))
  }
  const spatialInspection =
    inspectVNextTextBlockSpatialWrappingLayoutV1(spatialLayout)
  if (spatialInspection.status !== "valid") return blocked(issue(
    "spatial-layout-provenance-mismatch",
    "spatialLayout",
    spatialInspection.message,
  ))

  const lines = projectZeroTranslationLines({ lines: spatialLayout.lines })
  const geometry = {
    outerWidthLayoutUnit: binding.contentWidthLayoutUnit,
    contentInsetsLayoutUnit: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    contentOriginXLayoutUnit: 0,
    contentOriginYLayoutUnit: 0,
    contentWidthLayoutUnit: binding.contentWidthLayoutUnit,
    contentFlowHeightLayoutUnit: spatialLayout.summary.heightLayoutUnit,
    spatialMaximumBottomLayoutUnit:
      spatialIndex.summary.maximumBottomLayoutUnit,
    contentExtentBottomLayoutUnit: spatialLayout.summary.heightLayoutUnit,
    outerHeightLayoutUnit: spatialLayout.summary.heightLayoutUnit,
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
