import {
  convertVNextPointToLayoutUnitV1,
  createVNextCompactFingerprint,
  createVNextLayoutUnitPolicyV1,
  type VNextTextBlockFlowEvidenceInputV2,
} from "@flowdoc/vnext-core"
import {
  cloneFlowDocTextEngineEvidenceValueInternal as clone,
  createFlowDocTextEngineMultiRunIssueInternal as issue,
  prepareFlowDocTextEngineMultiRunEvidenceInternal,
} from "./multiRunEvidenceInternals.js"
import {
  FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_SOURCE_V2,
  FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_VERSION_V2,
  type FlowDocTextEngineFlowEvidenceInputV2,
  type FlowDocTextEngineFlowEvidenceResultV2,
} from "./multiRunFlowEvidenceContractV2.js"
import type { FlowDocTextEngineMultiRunRuntimeV1 } from
  "./multiRunLayoutContract.js"

export function createFlowDocTextEngineFlowEvidenceV2(
  input: FlowDocTextEngineFlowEvidenceInputV2,
  runtime: FlowDocTextEngineMultiRunRuntimeV1,
): FlowDocTextEngineFlowEvidenceResultV2 {
  const base = {
    source: FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_SOURCE_V2,
    contractVersion: FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_VERSION_V2,
    runtimeKind: runtime.runtimeKind,
    productionBinding: false as const,
  }
  const prepared = prepareFlowDocTextEngineMultiRunEvidenceInternal({
    layout: input,
    runtime,
    capability: "inline-image-v2",
  })
  if (prepared.status !== "accepted") return {
    ...base,
    status: "blocked",
    evidenceInput: null,
    summary: null,
    fingerprint: null,
    issues: prepared.issues,
  }

  const width = convertVNextPointToLayoutUnitV1(
    input.measurement.availableWidthPt,
    "measurement.availableWidthPt",
  )
  if (width.status !== "accepted" || width.layoutUnit <= 0) return {
    ...base,
    status: "blocked",
    evidenceInput: null,
    summary: null,
    fingerprint: null,
    issues: [issue(
      "invalid-layout-input",
      "measurement.availableWidthPt",
      "measurement width cannot be represented by LayoutUnitPolicyV1",
    )],
  }

  const evidenceInput: VNextTextBlockFlowEvidenceInputV2 = {
    initialFlowFingerprint: input.initialFlowFingerprint,
    layoutId: input.layoutId,
    measurement: clone(input.measurement),
    layoutUnitPolicyFingerprint: createVNextLayoutUnitPolicyV1().fingerprint,
    availableWidthLayoutUnit: width.layoutUnit,
    declaredLineHeightLayoutUnit: input.declaredLineHeightLayoutUnit,
    paragraphStyle: clone(prepared.paragraphStyle),
    fontFaces: prepared.usedFontFaces.map((face) => clone(face)),
    shapingRuns: prepared.shapingRuns.map((run) => clone(run)),
    breakOffsets: [...prepared.breakOffsets],
  }
  const summary = {
    sourceRunCount: prepared.sourceRunCount,
    textBearingRunCount: prepared.textBearingRunCount,
    hardBreakCount: prepared.hardBreakCount,
    inlineImageCount: prepared.inlineImageCount,
    shapingRunCount: prepared.shapingRuns.length,
    clusterCount: prepared.shapingRuns.reduce(
      (sum, run) => sum + run.clusters.length,
      0,
    ),
    breakOpportunityCount: prepared.breakOffsets.length,
    runtimeShapeCallCount: prepared.runtimeShapeCallCount,
    runtimeSegmentationCallCount: prepared.runtimeSegmentationCallCount,
  }
  const fingerprint = createVNextCompactFingerprint(JSON.stringify({
    ...base,
    evidenceInput,
    summary,
    contracts: {
      producerSelectedLines: false,
      runtimeIndependentCoreEvidenceInput: true,
      coreLoadsImageBytes: false,
      productionBinding: false,
    },
  }))
  return {
    ...base,
    status: "accepted",
    evidenceInput,
    summary,
    fingerprint,
    issues: [],
  }
}
