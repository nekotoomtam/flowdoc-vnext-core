import type { VNextTextBlockFlowEvidenceInputV2 } from "@flowdoc/vnext-core"
import type {
  FlowDocTextEngineMultiRunLayoutInputV1,
  FlowDocTextEngineMultiRunLayoutIssueV1,
  FlowDocTextEngineMultiRunRuntimeKindV1,
} from "./multiRunLayoutContract.js"

export const FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_SOURCE_V2 =
  "flowdoc-text-engine-flow-evidence-v2" as const
export const FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_VERSION_V2 = 2 as const

export interface FlowDocTextEngineFlowEvidenceInputV2
  extends Omit<FlowDocTextEngineMultiRunLayoutInputV1, "bindProductionLayout"> {
  initialFlowFingerprint: string
  bindProductionLayout?: boolean
}

export type FlowDocTextEngineFlowEvidenceResultV2 =
  | {
      source: typeof FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_SOURCE_V2
      contractVersion: typeof FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_VERSION_V2
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
      source: typeof FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_SOURCE_V2
      contractVersion: typeof FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_VERSION_V2
      status: "blocked"
      runtimeKind: FlowDocTextEngineMultiRunRuntimeKindV1
      productionBinding: false
      evidenceInput: null
      summary: null
      fingerprint: null
      issues: FlowDocTextEngineMultiRunLayoutIssueV1[]
    }
