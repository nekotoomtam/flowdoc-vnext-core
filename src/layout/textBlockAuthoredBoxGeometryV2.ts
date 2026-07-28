import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type { VNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceContractV2.js"
import {
  hasVNextTextBlockFlowEvidenceBindingInternalV2,
  inspectVNextTextBlockFlowEvidenceV2,
} from "./textBlockFlowEvidenceV2.js"
import type { VNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import { inspectVNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import {
  deriveVNextTextBlockAuthoredBoxAutoHeightKernelV1,
  convertVNextTextBlockAuthoredBoxKernelV1,
  projectVNextTextBlockAuthoredBoxGeometryKernelV1,
  projectVNextTextBlockAuthoredBoxLinesKernelV1,
} from "./textBlockAuthoredBoxGeometryKernelV1.js"
import type {
  VNextTextBlockAuthoredBoxGeometryInspectionV2,
  VNextTextBlockAuthoredBoxGeometryResultV2,
  VNextTextBlockAuthoredBoxLineV2,
} from "./textBlockAuthoredBoxGeometryContractV2.js"
import {
  VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_SOURCE,
  VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_VERSION,
} from "./textBlockAuthoredBoxGeometryContractV2.js"
import type { VNextTextBlockPersistentFlowTreeV2 } from "./textBlockPersistentFlowContractV2.js"
import { inspectVNextTextBlockPersistentFlowTreeV2 } from "./textBlockPersistentFlowTreeV2.js"
import type { VNextTextBlockSpatialIndexV2 } from "./textBlockSpatialIndexContractV2.js"
import {
  deeplyFrozenSpatialV1,
  deepFreezeSpatialV1,
  spatialFingerprintV1,
} from "./textBlockSpatialIndexInternalsV1.js"
import {
  hasSpatialIndexBindingV2,
  inspectVNextTextBlockSpatialIndexV2,
} from "./textBlockSpatialIndexV2.js"
import {
  inspectVNextTextBlockSpatialWrappingLayoutV2,
  layoutVNextTextBlockSpatialWrappingV2,
} from "./textBlockSpatialWrappingLayoutV2.js"
import type {
  VNextTextBlockSpatialInlineImageFragmentV2,
  VNextTextBlockSpatialTextFragmentV2,
} from "./textBlockSpatialWrappingLayoutContractV2.js"
import type { VNextTextBlockAuthoredBoxGeometryIssueV1 } from "./textBlockAuthoredBoxGeometryContractV1.js"

interface AuthoredBoxGeometryEnvelopeV2 {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  spatialIndex: VNextTextBlockSpatialIndexV2
  bindProductionLayout?: boolean
}

const layouts = new WeakMap<object, { canonicalFacts: string; fingerprint: string }>()

type V2TextRetainedFragment = Omit<
  VNextTextBlockSpatialTextFragmentV2,
  "xLayoutUnit" | "fingerprint"
>
type V2InlineImageRetainedFragment = Omit<
  VNextTextBlockSpatialInlineImageFragmentV2,
  "xLayoutUnit" | "yLayoutUnit" | "fingerprint"
>

function issue(
  code: VNextTextBlockAuthoredBoxGeometryIssueV1["code"],
  path: string,
  message: string,
): VNextTextBlockAuthoredBoxGeometryIssueV1 {
  return { code, severity: "error", path, message }
}

function blocked(
  item: VNextTextBlockAuthoredBoxGeometryIssueV1,
): VNextTextBlockAuthoredBoxGeometryResultV2 {
  return deepFreezeSpatialV1({
    status: "blocked" as const,
    source: VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_VERSION,
    geometry: null,
    lines: null,
    summary: null,
    mayPublishLayout: false as const,
    productionBinding: false as const,
    fingerprint: null,
    issues: [item],
  })
}

function strictEnvelope(input: unknown): AuthoredBoxGeometryEnvelopeV2 | null {
  try {
    if (input == null || typeof input !== "object" || Array.isArray(input)) return null
    const prototype = Object.getPrototypeOf(input)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(input).length !== 0) return null
    const keys = Reflect.ownKeys(input)
    const required = ["initialFlow", "evidence", "persistentFlowTree", "spatialIndex"] as const
    const allowed = [...required, "bindProductionLayout"]
    if (
      keys.length < required.length
      || keys.length > allowed.length
      || required.some((key) => !keys.includes(key))
      || keys.some((key) => typeof key !== "string" || !allowed.includes(key))
    ) return null
    const values: Record<string, unknown> = Object.create(null)
    for (const key of keys) {
      if (typeof key !== "string") return null
      const descriptor = Object.getOwnPropertyDescriptor(input, key)
      if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) return null
      values[key] = descriptor.value
    }
    if (
      values.bindProductionLayout !== undefined
      && typeof values.bindProductionLayout !== "boolean"
    ) return null
    return values as unknown as AuthoredBoxGeometryEnvelopeV2
  } catch {
    return null
  }
}

export function layoutVNextTextBlockAuthoredBoxGeometryV2(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  spatialIndex: VNextTextBlockSpatialIndexV2
  bindProductionLayout?: boolean
}): VNextTextBlockAuthoredBoxGeometryResultV2
export function layoutVNextTextBlockAuthoredBoxGeometryV2(input: unknown): VNextTextBlockAuthoredBoxGeometryResultV2
export function layoutVNextTextBlockAuthoredBoxGeometryV2(input: unknown): VNextTextBlockAuthoredBoxGeometryResultV2 {
  const envelope = strictEnvelope(input)
  if (envelope == null) return blocked(issue("invalid-input", "input", "V2 authored box geometry requires a strict accessor-free data envelope"))
  if (envelope.bindProductionLayout === true) return blocked(issue("production-binding-forbidden", "bindProductionLayout", "V2 authored box geometry cannot bind production layout"))
  if (
    inspectVNextTextBlockInitialFlowV1(envelope.initialFlow).status !== "valid"
    || inspectVNextTextBlockFlowEvidenceV2(envelope.evidence).status !== "valid"
    || inspectVNextTextBlockPersistentFlowTreeV2(envelope.persistentFlowTree).status !== "valid"
    || !hasVNextTextBlockFlowEvidenceBindingInternalV2(envelope.evidence, envelope.initialFlow)
    || envelope.evidence.initialFlowFingerprint !== envelope.initialFlow.fingerprint
    || envelope.persistentFlowTree.initialFlowFingerprint !== envelope.initialFlow.fingerprint
    || envelope.persistentFlowTree.flowEvidenceFingerprint !== envelope.evidence.fingerprint
  ) return blocked(issue("flow-tree-request-binding-mismatch", "initialFlow", "V2 authored box geometry requires the exact Initial Flow, evidence, and tree authority"))
  if (
    inspectVNextTextBlockSpatialIndexV2(envelope.spatialIndex).status !== "valid"
    || !hasSpatialIndexBindingV2({
      initialFlow: envelope.initialFlow,
      evidence: envelope.evidence,
      persistentFlowTree: envelope.persistentFlowTree,
      index: envelope.spatialIndex,
    })
  ) return blocked(issue("spatial-index-binding-mismatch", "spatialIndex", "V2 authored box geometry requires the exact authority-bound spatial index"))
  const box = convertVNextTextBlockAuthoredBoxKernelV1({
    authoredBoxPlan: envelope.initialFlow.authoredBoxPlan,
    contentWidthLayoutUnit: envelope.evidence.availableWidthLayoutUnit,
  })
  if (box.status !== "accepted") return blocked(box.issues[0]!)
  const spatialLayout = layoutVNextTextBlockSpatialWrappingV2({
    initialFlow: envelope.initialFlow,
    evidence: envelope.evidence,
    persistentFlowTree: envelope.persistentFlowTree,
    spatialIndex: envelope.spatialIndex,
    startYLayoutUnit: 0,
  })
  if (spatialLayout.status !== "accepted") return blocked(issue("spatial-layout-blocked", "spatialLayout", `V2 spatial wrapping blocked with ordered issue codes: ${spatialLayout.issues.map((item) => item.code).join(", ")}`))
  const spatialInspection = inspectVNextTextBlockSpatialWrappingLayoutV2(spatialLayout)
  if (spatialInspection.status !== "valid") return blocked(issue("spatial-layout-provenance-mismatch", "spatialLayout", spatialInspection.message))
  const projection = projectVNextTextBlockAuthoredBoxGeometryKernelV1<
    V2TextRetainedFragment,
    V2InlineImageRetainedFragment
  >({
    lines: projectVNextTextBlockAuthoredBoxLinesKernelV1({
      lines: spatialLayout.lines,
    contentOriginXLayoutUnit: box.contentOriginXLayoutUnit,
    contentOriginYLayoutUnit: box.contentOriginYLayoutUnit,
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
          if (fragment.kind === "text") {
            const { xLayoutUnit, fingerprint: contentFragmentFingerprint, ...retained } = fragment
            return { kind: "text" as const, contentXLayoutUnit: xLayoutUnit, contentFragmentFingerprint, retained }
          }
          const {
            xLayoutUnit: contentXLayoutUnit,
            yLayoutUnit: contentYLayoutUnit,
            fingerprint: contentFragmentFingerprint,
            ...retained
          } = fragment
          return { kind: "inline-image" as const, contentXLayoutUnit, contentYLayoutUnit, contentFragmentFingerprint, retained }
        }),
        sourceSegments: line.sourceSegments,
        contentRegionFingerprint: line.regionFingerprint,
        contentLineFingerprint: line.fingerprint,
      }),
    }),
    contentOriginXLayoutUnit: box.contentOriginXLayoutUnit,
    contentOriginYLayoutUnit: box.contentOriginYLayoutUnit,
  })
  if (projection.status !== "accepted") return blocked(projection.issues[0]!)
  const lines: readonly VNextTextBlockAuthoredBoxLineV2[] = projection.lines
  const autoHeight = deriveVNextTextBlockAuthoredBoxAutoHeightKernelV1({
    topInsetLayoutUnit: box.contentInsetsLayoutUnit.top,
    bottomInsetLayoutUnit: box.contentInsetsLayoutUnit.bottom,
    contentFlowHeightLayoutUnit: spatialLayout.summary.heightLayoutUnit,
    spatialMaximumBottomLayoutUnit: envelope.spatialIndex.summary.maximumBottomLayoutUnit,
  })
  if (autoHeight.status !== "accepted") return blocked(autoHeight.issues[0]!)
  const geometry = {
    outerWidthLayoutUnit: box.outerWidthLayoutUnit,
    contentInsetsLayoutUnit: box.contentInsetsLayoutUnit,
    contentOriginXLayoutUnit: box.contentOriginXLayoutUnit,
    contentOriginYLayoutUnit: box.contentOriginYLayoutUnit,
    contentWidthLayoutUnit: box.contentWidthLayoutUnit,
    contentFlowHeightLayoutUnit: spatialLayout.summary.heightLayoutUnit,
    spatialMaximumBottomLayoutUnit: envelope.spatialIndex.summary.maximumBottomLayoutUnit,
    contentExtentBottomLayoutUnit: autoHeight.contentExtentBottomLayoutUnit,
    outerHeightLayoutUnit: autoHeight.outerHeightLayoutUnit,
  }
  const facts = {
    status: "accepted" as const,
    source: VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_VERSION,
    documentId: spatialLayout.documentId,
    sectionId: spatialLayout.sectionId,
    textBlockId: spatialLayout.textBlockId,
    instanceRevision: spatialLayout.instanceRevision,
    layoutId: spatialLayout.layoutId,
    initialFlowFingerprint: envelope.initialFlow.fingerprint,
    flowEvidenceFingerprint: envelope.evidence.fingerprint,
    persistentFlowTreeFingerprint: spatialLayout.persistentFlowTreeFingerprint,
    spatialIndexFingerprint: spatialLayout.spatialIndexFingerprint,
    contentSpatialLayoutFingerprint: spatialLayout.fingerprint,
    alignmentPolicyFingerprint: spatialLayout.alignmentPolicyFingerprint,
    authoredBoxPlanFingerprint: envelope.initialFlow.authoredBoxPlan.fingerprint,
    parentRegionFingerprint: envelope.initialFlow.parentRegion.fingerprint,
    geometry,
    lines,
    summary: {
      lineCount: spatialLayout.summary.lineCount,
      textFragmentCount: spatialLayout.summary.textFragmentCount,
      inlineImageFragmentCount: spatialLayout.summary.inlineImageFragmentCount,
      outerHeightLayoutUnit: geometry.outerHeightLayoutUnit,
    },
    contracts: {
      sharedAuthoredBoxKernel: true as const,
      autoHeightIncludesSpatialExtent: true as const,
      fixedHeightPolicy: false as const,
      stagedEditorApply: false as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    },
    mayPublishLayout: false as const,
    productionBinding: false as const,
    issues: [] as [],
  }
  const canonicalFacts = stringifyVNextCanonicalJson(facts)
  const result = deepFreezeSpatialV1({ ...facts, fingerprint: spatialFingerprintV1(facts) })
  layouts.set(result, { canonicalFacts, fingerprint: result.fingerprint })
  return result
}

export function inspectVNextTextBlockAuthoredBoxGeometryV2(
  result: unknown,
): VNextTextBlockAuthoredBoxGeometryInspectionV2 {
  if (result == null || typeof result !== "object" || !layouts.has(result)) return {
    status: "invalid",
    code: "authored-box-geometry-provenance-mismatch",
    message: "V2 authored box geometry is not the exact process-local Core result",
  }
  if (!deeplyFrozenSpatialV1(result)) return {
    status: "invalid",
    code: "authored-box-geometry-not-deeply-frozen",
    message: "registered V2 authored box geometry must remain recursively frozen",
  }
  try {
    const accepted = result as Extract<VNextTextBlockAuthoredBoxGeometryResultV2, { status: "accepted" }>
    const binding = layouts.get(accepted)
    const { fingerprint, ...facts } = accepted
    const canonicalFacts = stringifyVNextCanonicalJson(facts)
    if (
      binding == null
      || binding.canonicalFacts !== canonicalFacts
      || binding.fingerprint !== fingerprint
      || spatialFingerprintV1(facts) !== fingerprint
    ) return {
      status: "invalid",
      code: "authored-box-geometry-fingerprint-mismatch",
      message: "registered V2 authored box geometry no longer matches canonical Core facts",
    }
    return { status: "valid", fingerprint }
  } catch {
    return {
      status: "invalid",
      code: "authored-box-geometry-fingerprint-mismatch",
      message: "registered V2 authored box geometry is not canonically fingerprintable",
    }
  }
}
