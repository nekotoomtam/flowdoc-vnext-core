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
import { convertVNextPointToLayoutUnitV1 } from "./layoutUnitPolicyV1.js"
import { safeVNextTextBlockMultiRunSumV1 } from "./textBlockMultiRunDerivationV1.js"
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
  type VNextTextBlockAuthoredBoxFragmentV1,
  type VNextTextBlockAuthoredBoxIntervalPlacementV1,
  type VNextTextBlockAuthoredBoxIntervalV1,
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

interface ConvertedBoxGeometry {
  outerWidthLayoutUnit: number
  contentInsetsLayoutUnit: {
    top: number
    right: number
    bottom: number
    left: number
  }
  contentOriginXLayoutUnit: number
  contentOriginYLayoutUnit: number
  contentWidthLayoutUnit: number
}

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
  if (
    outer.status !== "accepted"
    || width.status !== "accepted"
    || top.status !== "accepted"
    || right.status !== "accepted"
    || bottom.status !== "accepted"
    || left.status !== "accepted"
    || outer.layoutUnit < 0
    || width.layoutUnit < 0
    || top.layoutUnit < 0
    || right.layoutUnit < 0
    || bottom.layoutUnit < 0
    || left.layoutUnit < 0
  ) return [issue(
    "invalid-authored-box-geometry",
    "initialFlow.authoredBoxPlan",
    "authored box points must convert to non-negative safe layout units",
  )]
  const outerWidthLayoutUnit = outer.layoutUnit
  const contentWidthLayoutUnit = width.layoutUnit
  const contentInsetsLayoutUnit = {
    top: top.layoutUnit,
    right: right.layoutUnit,
    bottom: bottom.layoutUnit,
    left: left.layoutUnit,
  }
  const composedOuterWidth = safeVNextTextBlockMultiRunSumV1([
    contentInsetsLayoutUnit.left,
    contentWidthLayoutUnit,
    contentInsetsLayoutUnit.right,
  ])
  if (composedOuterWidth == null) return [issue(
    "unsafe-layout-arithmetic",
    "initialFlow.authoredBoxPlan.outerWidthPt",
    "authored box width exceeds safe layout arithmetic",
  )]
  if (
    contentWidthLayoutUnit !== request.availableWidthLayoutUnit
    || composedOuterWidth !== outerWidthLayoutUnit
  ) return [issue(
    "authored-box-width-mismatch",
    "initialFlow.authoredBoxPlan",
    "authored content width and horizontal insets must equal the request and outer width",
  )]
  return {
    outerWidthLayoutUnit,
    contentInsetsLayoutUnit,
    contentOriginXLayoutUnit: contentInsetsLayoutUnit.left,
    contentOriginYLayoutUnit: contentInsetsLayoutUnit.top,
    contentWidthLayoutUnit,
  }
}

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

function projectBoxLocalLines(input: {
  lines: Extract<
    ReturnType<typeof layoutVNextTextBlockSpatialWrappingV1>,
    { status: "accepted" }
  >["lines"]
  box: ConvertedBoxGeometry
}): VNextTextBlockAuthoredBoxLineV1[] | VNextTextBlockAuthoredBoxGeometryIssueV1 {
  const lines: VNextTextBlockAuthoredBoxLineV1[] = []
  for (const line of input.lines) {
    const availableIntervals: VNextTextBlockAuthoredBoxIntervalV1[] = []
    for (const [intervalIndex, interval] of line.availableIntervals.entries()) {
      const startLayoutUnit = safeAdd(
        interval.startLayoutUnit,
        input.box.contentOriginXLayoutUnit,
        `lines[${line.index}].availableIntervals[${intervalIndex}].startLayoutUnit`,
      )
      if (typeof startLayoutUnit !== "number") return startLayoutUnit
      const endLayoutUnit = safeAdd(
        interval.endLayoutUnit,
        input.box.contentOriginXLayoutUnit,
        `lines[${line.index}].availableIntervals[${intervalIndex}].endLayoutUnit`,
      )
      if (typeof endLayoutUnit !== "number") return endLayoutUnit
      const facts = {
        contentStartLayoutUnit: interval.startLayoutUnit,
        contentEndLayoutUnit: interval.endLayoutUnit,
        startLayoutUnit,
        endLayoutUnit,
        contentLineFingerprint: line.fingerprint,
      }
      availableIntervals.push({
        ...facts,
        fingerprint: spatialFingerprintV1(facts),
      })
    }
    const intervalPlacements: VNextTextBlockAuthoredBoxIntervalPlacementV1[] = []
    for (const [placementIndex, placement] of line.intervalPlacements.entries()) {
      const xStartLayoutUnit = safeAdd(
        placement.xStartLayoutUnit,
        input.box.contentOriginXLayoutUnit,
        `lines[${line.index}].intervalPlacements[${placementIndex}].xStartLayoutUnit`,
      )
      if (typeof xStartLayoutUnit !== "number") return xStartLayoutUnit
      const xEndLayoutUnit = safeAdd(
        placement.xEndLayoutUnit,
        input.box.contentOriginXLayoutUnit,
        `lines[${line.index}].intervalPlacements[${placementIndex}].xEndLayoutUnit`,
      )
      if (typeof xEndLayoutUnit !== "number") return xEndLayoutUnit
      const facts = {
        intervalIndex: placement.intervalIndex,
        renderStartOffset: placement.renderStartOffset,
        renderEndOffset: placement.renderEndOffset,
        contentXStartLayoutUnit: placement.xStartLayoutUnit,
        contentXEndLayoutUnit: placement.xEndLayoutUnit,
        xStartLayoutUnit,
        xEndLayoutUnit,
        contentLineFingerprint: line.fingerprint,
      }
      intervalPlacements.push({
        ...facts,
        fingerprint: spatialFingerprintV1(facts),
      })
    }
    const fragments: VNextTextBlockAuthoredBoxFragmentV1[] = []
    for (const [fragmentIndex, fragment] of line.fragments.entries()) {
      const {
        xLayoutUnit,
        fingerprint: contentFragmentFingerprint,
        ...retained
      } = fragment
      const translatedX = safeAdd(
        xLayoutUnit,
        input.box.contentOriginXLayoutUnit,
        `lines[${line.index}].fragments[${fragmentIndex}].xLayoutUnit`,
      )
      if (typeof translatedX !== "number") return translatedX
      const facts = {
        ...retained,
        contentXLayoutUnit: xLayoutUnit,
        xLayoutUnit: translatedX,
        contentFragmentFingerprint,
      }
      fragments.push({
        ...facts,
        fingerprint: spatialFingerprintV1(facts),
      })
    }
    const yOffsetLayoutUnit = safeAdd(
      line.yOffsetLayoutUnit,
      input.box.contentOriginYLayoutUnit,
      `lines[${line.index}].yOffsetLayoutUnit`,
    )
    if (typeof yOffsetLayoutUnit !== "number") return yOffsetLayoutUnit
    const facts = {
      index: line.index,
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
      contentYOffsetLayoutUnit: line.yOffsetLayoutUnit,
      yOffsetLayoutUnit,
      heightLayoutUnit: line.heightLayoutUnit,
      baselineOffsetLayoutUnit: line.baselineOffsetLayoutUnit,
      availableIntervals,
      intervalPlacements,
      fragments,
      sourceSegments: line.sourceSegments,
      contentRegionFingerprint: line.regionFingerprint,
      contentLineFingerprint: line.fingerprint,
    }
    lines.push({
      ...facts,
      fingerprint: spatialFingerprintV1(facts),
    })
  }
  return lines
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
  const box = convertBoxGeometry(initialFlow, request)
  if (Array.isArray(box)) return blocked(box[0]!)
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

  const lines = projectBoxLocalLines({ lines: spatialLayout.lines, box })
  if (!Array.isArray(lines)) return blocked(lines)
  const contentExtentBottomLayoutUnit = Math.max(
    spatialLayout.summary.heightLayoutUnit,
    spatialIndex.summary.maximumBottomLayoutUnit,
  )
  const outerHeightLayoutUnit = safeVNextTextBlockMultiRunSumV1([
    box.contentInsetsLayoutUnit.top,
    contentExtentBottomLayoutUnit,
    box.contentInsetsLayoutUnit.bottom,
  ])
  if (outerHeightLayoutUnit == null) return blocked(issue(
    "unsafe-layout-arithmetic",
    "geometry.outerHeightLayoutUnit",
    "authored box height exceeds safe layout arithmetic",
  ))
  const geometry = {
    outerWidthLayoutUnit: box.outerWidthLayoutUnit,
    contentInsetsLayoutUnit: box.contentInsetsLayoutUnit,
    contentOriginXLayoutUnit: box.contentOriginXLayoutUnit,
    contentOriginYLayoutUnit: box.contentOriginYLayoutUnit,
    contentWidthLayoutUnit: box.contentWidthLayoutUnit,
    contentFlowHeightLayoutUnit: spatialLayout.summary.heightLayoutUnit,
    spatialMaximumBottomLayoutUnit:
      spatialIndex.summary.maximumBottomLayoutUnit,
    contentExtentBottomLayoutUnit,
    outerHeightLayoutUnit,
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
