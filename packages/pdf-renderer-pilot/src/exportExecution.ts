import { createHash } from "node:crypto"
import {
  createVNextPdfExportHandoffV1,
  createVNextPdfExportReceiptV1,
} from "@flowdoc/vnext-core"
import type {
  VNextPdfExportHandoffResultV1,
  VNextPdfExportReceiptV1,
  VNextPdfExportRequestV1,
  VNextPdfExportSourceIdentityV1,
  VNextPdfMeasuredDrawContractResultV1,
} from "@flowdoc/vnext-core"
import {
  renderFlowDocCanonicalFullDocumentPdfPilot,
  renderFlowDocThaiOnePagePdfPilot,
  type FlowDocPdfRendererPilotArtifactManifest,
  type FlowDocPdfRendererPilotFontResource,
  type FlowDocPdfRendererPilotImageResource,
  type FlowDocPdfRendererPilotInput,
  type FlowDocPdfRendererPilotIssue,
  type FlowDocPdfRendererPilotMode,
  type FlowDocPdfRendererPilotResult,
} from "./index.js"

export type FlowDocPdfExportRendererModeV1 = "thai-one-page" | "canonical-full-document"

export interface FlowDocPdfExportExecutionInputV1 {
  request: VNextPdfExportRequestV1
  currentSource: VNextPdfExportSourceIdentityV1
  measuredDrawContract: VNextPdfMeasuredDrawContractResultV1
  fontResources: FlowDocPdfRendererPilotFontResource[]
  imageResources?: FlowDocPdfRendererPilotImageResource[]
  rendererMode: FlowDocPdfExportRendererModeV1
}

interface FlowDocPdfExportExecutionContractsV1 {
  consumesCoreHandoff: true
  returnsCoreReceipt: true
  mayRemeasure: false
  mayRepaginate: false
  mayRelayout: false
  mayRegroupSemantics: false
  fileWrites: false
  storageWrites: false
  backendRoute: false
  workerOrQueue: false
  productionBinding: false
}

interface FlowDocPdfExportRendererEvidenceV1 {
  mode: FlowDocPdfRendererPilotMode | null
  status: "not-run" | "rendered" | "blocked"
  artifact: FlowDocPdfRendererPilotArtifactManifest | null
  summary: FlowDocPdfRendererPilotResult["summary"] | null
  issues: FlowDocPdfRendererPilotIssue[]
}

export type FlowDocPdfExportExecutionResultV1 = {
  source: "flowdoc-pdf-export-execution"
  contractVersion: 1
  rendererMode: FlowDocPdfExportRendererModeV1
  handoff: VNextPdfExportHandoffResultV1
  renderer: FlowDocPdfExportRendererEvidenceV1
  contracts: FlowDocPdfExportExecutionContractsV1
  rendererExecuted: boolean
} & (
  | {
      status: "rendered"
      receipt: VNextPdfExportReceiptV1
      bytes: Uint8Array
      issues: []
    }
  | {
      status: "blocked"
      receipt: null
      bytes: null
      issues: Array<{ code: string; path: string; message: string }>
    }
)

function exportExecutionContracts(): FlowDocPdfExportExecutionContractsV1 {
  return {
    consumesCoreHandoff: true,
    returnsCoreReceipt: true,
    mayRemeasure: false,
    mayRepaginate: false,
    mayRelayout: false,
    mayRegroupSemantics: false,
    fileWrites: false,
    storageWrites: false,
    backendRoute: false,
    workerOrQueue: false,
    productionBinding: false,
  }
}

export function executeFlowDocPdfExportHandoffV1(
  input: FlowDocPdfExportExecutionInputV1,
): FlowDocPdfExportExecutionResultV1 {
  const handoff = createVNextPdfExportHandoffV1({
    request: input.request,
    currentSource: input.currentSource,
    measuredDrawContract: input.measuredDrawContract,
  })
  const contracts = exportExecutionContracts()
  if (handoff.status !== "ready") {
    return {
      source: "flowdoc-pdf-export-execution",
      contractVersion: 1,
      rendererMode: input.rendererMode,
      status: "blocked",
      handoff,
      renderer: { mode: null, status: "not-run", artifact: null, summary: null, issues: [] },
      receipt: null,
      bytes: null,
      contracts,
      rendererExecuted: false,
      issues: handoff.issues,
    }
  }

  const rendererInput: FlowDocPdfRendererPilotInput = {
    proofId: handoff.rendererInput.exportRequestId,
    artifactId: handoff.rendererInput.artifactId,
    contract: handoff.rendererInput.measuredDrawContract,
    fontResources: input.fontResources,
    imageResources: input.imageResources,
  }
  const rendered = input.rendererMode === "canonical-full-document"
    ? renderFlowDocCanonicalFullDocumentPdfPilot(rendererInput)
    : renderFlowDocThaiOnePagePdfPilot(rendererInput)
  const byteEvidenceIssues = rendered.status === "rendered"
    && (rendered.bytes.byteLength !== rendered.artifact.byteLength
      || createHash("sha256").update(rendered.bytes).digest("hex") !== rendered.artifact.sha256)
    ? [{
        code: "renderer-byte-evidence-mismatch",
        path: "renderer.bytes",
        message: "renderer bytes must match the artifact byte length and SHA-256 evidence",
      }]
    : []
  const receiptResult = createVNextPdfExportReceiptV1({
    handoff,
    renderEvidence: rendered.status === "rendered" && byteEvidenceIssues.length === 0
      ? {
          status: "rendered",
          artifactId: rendered.artifact.artifactId,
          format: rendered.artifact.format,
          mediaType: rendered.artifact.mediaType,
          byteLength: rendered.artifact.byteLength,
          sha256: rendered.artifact.sha256,
          pageCount: rendered.summary.pageCount,
          rendererProfileId: rendered.artifact.rendererProfileId,
          measurementProfileId: rendered.artifact.measurementProfileId,
          sourceContractFingerprint: handoff.rendererInput.sourceContractFingerprint,
          sourceContractContentFingerprint: handoff.rendererInput.sourceContractContentFingerprint,
        }
      : {
          status: "blocked",
          issues: [
            ...rendered.issues.map(({ code, path, message }) => ({ code, path, message })),
            ...byteEvidenceIssues,
          ],
        },
  })
  const rendererEvidence: FlowDocPdfExportRendererEvidenceV1 = {
    mode: rendered.mode,
    status: rendered.status,
    artifact: rendered.artifact,
    summary: rendered.summary,
    issues: rendered.issues,
  }
  if (rendered.status !== "rendered" || receiptResult.status !== "accepted") {
    return {
      source: "flowdoc-pdf-export-execution",
      contractVersion: 1,
      rendererMode: input.rendererMode,
      status: "blocked",
      handoff,
      renderer: rendererEvidence,
      receipt: null,
      bytes: null,
      contracts,
      rendererExecuted: true,
      issues: receiptResult.issues,
    }
  }
  return {
    source: "flowdoc-pdf-export-execution",
    contractVersion: 1,
    rendererMode: input.rendererMode,
    status: "rendered",
    handoff,
    renderer: rendererEvidence,
    receipt: receiptResult.receipt,
    bytes: rendered.bytes,
    contracts,
    rendererExecuted: true,
    issues: [],
  }
}
