import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import {
  createVNextPdfExportRequestV1,
  type VNextPdfExportSourceIdentityV1,
} from "@flowdoc/vnext-core"
import {
  executeFlowDocPdfExportHandoffV1,
  type FlowDocCanonicalReportBodyDisplayListBundleV1,
  type FlowDocPdfRendererPilotFontResource,
  type FlowDocPdfRendererPilotImageResource,
} from "../src/index.js"

const IMAGE_FILES = [
  ["source-evidence-image", "source_evidence.png"],
  ["ocr-accuracy-image", "ocr_accuracy.png"],
  ["native-extraction-image", "native_extraction.png"],
  ["latency-rounds-image", "latency_rounds.png"],
  ["mapping-gap-image", "mapping_gap.png"],
] as const

const SUBSET_MANIFESTS = [
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-regular-font-subset-manifest.v1.json",
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-bold-font-subset-manifest.v1.json",
] as const

interface SubsetManifest {
  subsetId: string
  fontId: string
  postScriptName: string
  subsetPrefix: string
  source: { path: string }
  subset: { path: string; sha256: string }
}

interface TemplateResolutionBundle {
  resolutionInputFingerprint: string
  scopedResolution: {
    resolvedDocument: {
      instanceId: string
      instanceRevision: number
    }
  }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

function fontResource(repoRoot: string, manifest: SubsetManifest): FlowDocPdfRendererPilotFontResource {
  return {
    fontId: manifest.fontId,
    subsetId: manifest.subsetId,
    subsetPrefix: manifest.subsetPrefix,
    postScriptName: manifest.postScriptName,
    subsetSha256: manifest.subset.sha256,
    sourceBytes: readFileSync(resolve(repoRoot, manifest.source.path)),
    subsetBytes: readFileSync(resolve(repoRoot, manifest.subset.path)),
  }
}

function imageResources(reportRoot: string): FlowDocPdfRendererPilotImageResource[] {
  return IMAGE_FILES.map(([assetId, fileName]) => ({
    assetId,
    bytes: readFileSync(resolve(reportRoot, "assets", fileName)),
  }))
}

export function buildCanonicalReportExportHandoff(): { evidencePath: string } {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const fallbackReportRoot = resolve(repoRoot, "../ocr-benchmark-skeleton/reports/INV_9437125258")
  const reportRoot = resolve(process.env.FLOWDOC_PDF_PILOT_REPORT_ROOT ?? fallbackReportRoot)
  const body = readJson<FlowDocCanonicalReportBodyDisplayListBundleV1>(resolve(
    repoRoot,
    "fixtures/pdf-pilot-canonical-report-body-display-list.v1.json",
  ))
  const template = readJson<TemplateResolutionBundle>(resolve(
    repoRoot,
    "fixtures/pdf-pilot-canonical-report-template-resolution.v1.json",
  ))
  const resolved = template.scopedResolution.resolvedDocument
  const sourceIdentity: VNextPdfExportSourceIdentityV1 = {
    documentId: resolved.instanceId,
    documentRevision: resolved.instanceRevision,
    documentFingerprint: `sha256:${body.bundleFingerprint}`,
    sourcePackageId: `body-display-list:${body.displayListId}`,
    sessionId: null,
  }
  const requestResult = createVNextPdfExportRequestV1({
    exportRequestId: "export:ocr-benchmark:inv_9437125258:revision-1",
    artifactId: "pdf:ocr-benchmark:inv_9437125258:revision-1",
    requestedAt: "2026-07-17T12:00:00.000Z",
    source: sourceIdentity,
    measuredDrawContract: body.rendererHandoff.measuredDrawContract,
  })
  if (requestResult.status !== "ready") {
    throw new Error(`PDF export request blocked: ${JSON.stringify(requestResult.issues)}`)
  }
  const manifests = SUBSET_MANIFESTS.map((path) => readJson<SubsetManifest>(resolve(repoRoot, path)))
  const resources = {
    request: requestResult.request,
    currentSource: sourceIdentity,
    measuredDrawContract: body.rendererHandoff.measuredDrawContract,
    fontResources: manifests.map((manifest) => fontResource(repoRoot, manifest)),
    imageResources: imageResources(reportRoot),
    rendererMode: "canonical-full-document" as const,
  }
  const result = executeFlowDocPdfExportHandoffV1(resources)
  const rebuilt = executeFlowDocPdfExportHandoffV1(resources)
  if (result.status !== "rendered") {
    throw new Error(`PDF export execution blocked: ${JSON.stringify(result.issues)}`)
  }
  if (rebuilt.status !== "rendered"
    || !Buffer.from(result.bytes).equals(Buffer.from(rebuilt.bytes))
    || result.receipt.receiptFingerprint !== rebuilt.receipt.receiptFingerprint) {
    throw new Error("PDF export execution is not deterministic.")
  }

  const evidencePath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-real-export-handoff.v1.json",
  )
  mkdirSync(dirname(evidencePath), { recursive: true })
  writeFileSync(evidencePath, `${JSON.stringify({
    evidenceVersion: 1,
    phaseId: "PDF-EXPORT-T",
    status: result.status,
    sourceIdentity,
    resolutionInputFingerprint: template.resolutionInputFingerprint,
    sourceBundleFingerprint: body.bundleFingerprint,
    request: result.handoff.request,
    handoff: {
      status: result.handoff.status,
      handoffFingerprint: result.handoff.status === "ready" ? result.handoff.handoffFingerprint : null,
      measuredDrawContract: result.handoff.request.measuredDrawContract,
      contracts: result.handoff.contracts,
    },
    renderer: result.renderer,
    receipt: result.receipt,
    deterministicRebuild: {
      unchanged: true,
      sha256: result.receipt.artifact.sha256,
      receiptFingerprint: result.receipt.receiptFingerprint,
    },
    executionBoundary: {
      actualPdfBytesReturned: true,
      pdfBytesRetainedInEvidence: false,
      exportExecutionFileWrites: false,
      exportExecutionStorageWrites: false,
      evidenceFixtureWriteOnly: true,
      backendRoute: false,
      workerOrQueue: false,
      artifactManifestProjection: "pending-storage-binding",
      productionBinding: false,
    },
    contracts: result.contracts,
    nextPhase: "PDF-EXPORT-U production-hardening baseline",
  }, null, 2)}\n`, "utf8")
  return { evidencePath }
}
