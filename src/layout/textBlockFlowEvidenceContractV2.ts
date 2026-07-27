import type { VNextTextBlockV4MeasurementRequest } from
  "../pagination/textBlockV4Measurement.js"
import type {
  VNextTextBlockMultiRunFontFaceV1,
  VNextTextBlockMultiRunParagraphStyleV1,
  VNextTextBlockResolvedShapingRunV1,
} from "./textBlockMultiRunLayoutContractV1.js"

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

export type VNextTextBlockFlowEvidenceInspectionV2 =
  | {
      status: "valid"
      fingerprint: string
      initialFlowFingerprint: string
      mayPublishLayout: false
      productionBinding: false
    }
  | {
      status: "invalid"
      code:
        | "unregistered-flow-evidence"
        | "flow-evidence-not-deeply-frozen"
        | "flow-evidence-fingerprint-mismatch"
      message: string
      mayPublishLayout: false
      productionBinding: false
    }
