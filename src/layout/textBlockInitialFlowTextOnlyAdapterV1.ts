import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  compareVNextOrdinalStrings,
  sameVNextCanonicalJson,
  stringifyVNextCanonicalJson,
} from "../fingerprint/canonicalJson.js"
import { convertVNextPointToLayoutUnitV1 } from "./layoutUnitPolicyV1.js"
import type { VNextTextBlockAcceptedMultiRunLayoutV1 } from "./textBlockMultiRunIncrementalContractV1.js"
import {
  inspectVNextTextBlockInitialFlowV1,
  type VNextTextBlockInitialFlowAtomV1,
  type VNextTextBlockInitialFlowV1,
} from "./textBlockInitialFlowInputV1.js"
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
  return JSON.parse(stringifyVNextCanonicalJson(value)) as T
}

function compact(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function canonicalFontFaces(
  fontFaces: readonly VNextTextBlockMultiRunFontFaceV1[],
): VNextTextBlockMultiRunFontFaceV1[] {
  return [...clone(fontFaces)]
    .sort((left, right) => compareVNextOrdinalStrings(left.fontFaceId, right.fontFaceId))
}

function textBearingAtom(
  atom: VNextTextBlockInitialFlowAtomV1,
): atom is Extract<
  VNextTextBlockInitialFlowAtomV1,
  { kind: "text" | "resolved-field" | "generated-page-number" }
> {
  return atom.kind === "text" || atom.kind === "resolved-field" || atom.kind === "generated-page-number"
}

function shapingTypographyMatchesFlow(
  flow: VNextTextBlockInitialFlowV1,
  request: VNextTextBlockMultiRunLayoutRequestV1,
): boolean {
  return request.shapingRuns.every((run) => {
    const coveredAtoms = flow.atoms.filter(textBearingAtom).filter((atom) => (
      atom.renderStartOffset < run.renderEndOffset
      && atom.renderEndOffset > run.renderStartOffset
    ))
    return coveredAtoms.length > 0 && coveredAtoms.every((atom) => {
      const style = atom.resolvedGeometryStyle
      return run.styleKey === style.styleKey
        && run.fontFaceId === style.fontFaceId
        && run.fontSizeLayoutUnit === style.fontSizeLayoutUnit
        && run.textColor === style.textColor
    })
  })
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
  const inspection = inspectVNextTextBlockInitialFlowV1(flow)
  if (inspection.status !== "valid") return blocked(
    flow, request.layoutId, "invalid-initial-flow", "initialFlow",
    `Initial Flow must be the exact immutable process-local Core capability object: ${inspection.message}`,
  )
  if (flow.layoutDisposition !== "text-subset-ready" || !flow.contracts.textOnlyAdapterEligible) {
    return blocked(
      flow, request.layoutId, "initial-flow-capability-required", "initialFlow.layoutDisposition",
      "legacy MR1 layout accepts only the explicitly classified text subset",
    )
  }

  const contentWidth = convertVNextPointToLayoutUnitV1(flow.authoredBoxPlan.contentWidthPt)
  if (
    !sameVNextCanonicalJson(flow.measurement, request.measurement)
    || flow.layoutUnitPolicyFingerprint !== request.layoutUnitPolicyFingerprint
    || flow.declaredLineHeightLayoutUnit !== request.declaredLineHeightLayoutUnit
    || !sameVNextCanonicalJson(flow.paragraphStyle, request.paragraphStyle)
    || !sameVNextCanonicalJson(flow.fontFaces, canonicalFontFaces(request.fontFaces))
    || !shapingTypographyMatchesFlow(flow, request)
    || contentWidth.status !== "accepted"
    || contentWidth.layoutUnit !== request.availableWidthLayoutUnit
  ) return blocked(
    flow, request.layoutId, "legacy-context-mismatch", "legacyRequest",
    "legacy request measurement, width, line height, resolved run typography, and layout policy must equal Initial Flow",
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
