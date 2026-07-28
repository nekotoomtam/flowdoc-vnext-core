import {
  createVNextCompactFingerprint,
  createVNextLayoutUnitPolicyV1,
  type VNextTextBlockFlowEvidenceInputV2,
} from "@flowdoc/vnext-core"
import {
  cloneFlowDocTextEngineEvidenceValueInternal as clone,
  prepareFlowDocTextEngineMultiRunEvidenceInternal,
} from "./multiRunEvidenceInternals.js"
import { preflightFlowDocTextEngineFlowEvidenceV2 } from
  "./multiRunFlowEvidencePreflightV2.js"
import {
  FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_SOURCE_V2,
  FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_VERSION_V2,
  type FlowDocTextEngineFlowEvidenceInputV2,
  type FlowDocTextEngineFlowEvidenceResultV2,
} from "./multiRunFlowEvidenceContractV2.js"
import type {
  FlowDocTextEngineMultiRunLayoutIssueV1,
  FlowDocTextEngineMultiRunRuntimeKindV1,
  FlowDocTextEngineMultiRunRuntimeV1,
} from "./multiRunLayoutContract.js"

export function createFlowDocTextEngineFlowEvidenceV2(
  input: FlowDocTextEngineFlowEvidenceInputV2,
  runtime: FlowDocTextEngineMultiRunRuntimeV1,
): FlowDocTextEngineFlowEvidenceResultV2
export function createFlowDocTextEngineFlowEvidenceV2(
  input: unknown,
  runtime: FlowDocTextEngineMultiRunRuntimeV1,
): FlowDocTextEngineFlowEvidenceResultV2
export function createFlowDocTextEngineFlowEvidenceV2(
  input: unknown,
  runtime: FlowDocTextEngineMultiRunRuntimeV1,
): FlowDocTextEngineFlowEvidenceResultV2 {
  const base = {
    source: FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_SOURCE_V2,
    contractVersion: FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_VERSION_V2,
    runtimeKind: runtime.runtimeKind,
    productionBinding: false as const,
  }
  const preflight = preflightFlowDocTextEngineFlowEvidenceV2(input)
  if (preflight.status !== "accepted") return {
    ...base,
    status: "blocked",
    evidenceInput: null,
    summary: null,
    fingerprint: null,
    issues: preflight.issues,
  }
  const safeInput = preflight.layout
  const prepared = prepareFlowDocTextEngineMultiRunEvidenceInternal({
    layout: safeInput,
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

  const evidenceInput: VNextTextBlockFlowEvidenceInputV2 = {
    initialFlowFingerprint: safeInput.initialFlowFingerprint,
    layoutId: safeInput.layoutId,
    measurement: clone(safeInput.measurement),
    layoutUnitPolicyFingerprint: createVNextLayoutUnitPolicyV1().fingerprint,
    availableWidthLayoutUnit: preflight.availableWidthLayoutUnit,
    declaredLineHeightLayoutUnit: safeInput.declaredLineHeightLayoutUnit,
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

export function createBlockedFlowDocTextEngineFlowEvidenceResultV2(
  runtimeKind: FlowDocTextEngineMultiRunRuntimeKindV1,
  issues: FlowDocTextEngineMultiRunLayoutIssueV1[],
): FlowDocTextEngineFlowEvidenceResultV2 {
  return {
    source: FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_SOURCE_V2,
    contractVersion: FLOWDOC_TEXT_ENGINE_FLOW_EVIDENCE_VERSION_V2,
    status: "blocked",
    runtimeKind,
    productionBinding: false,
    evidenceInput: null,
    summary: null,
    fingerprint: null,
    issues,
  }
}
