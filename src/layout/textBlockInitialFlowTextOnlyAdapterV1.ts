import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { convertVNextPointToLayoutUnitV1 } from "./layoutUnitPolicyV1.js"
import type { VNextTextBlockAcceptedMultiRunLayoutV1 } from "./textBlockMultiRunIncrementalContractV1.js"
import type { VNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import type {
  VNextTextBlockMultiRunFontFaceV1,
  VNextTextBlockMultiRunLayoutRequestV1,
} from "./textBlockMultiRunLayoutContractV1.js"
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

function deeplyFrozen(value: unknown): boolean {
  if (value == null || typeof value !== "object") return true
  if (!Object.isFrozen(value)) return false
  return Object.values(value).every((item) => deeplyFrozen(item))
}

function canonicalFontFaces(
  fontFaces: readonly VNextTextBlockMultiRunFontFaceV1[],
): VNextTextBlockMultiRunFontFaceV1[] {
  return [...clone(fontFaces)].sort((left, right) => left.fontFaceId.localeCompare(right.fontFaceId))
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
  if (!deeplyFrozen(flow) || fingerprint !== compact(flowFacts)) return blocked(
    flow, request.layoutId, "invalid-initial-flow", "initialFlow",
    "Initial Flow must be deeply immutable with an exact Core fingerprint",
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
    || !sameJson(flow.fontFaces, canonicalFontFaces(request.fontFaces))
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
