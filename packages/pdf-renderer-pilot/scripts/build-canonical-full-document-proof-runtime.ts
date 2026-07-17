import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import {
  renderFlowDocCanonicalFullDocumentPdfPilot,
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
  source: { path: string; sha256: string; bytes: number }
  subset: { path: string; sha256: string; bytes: number; retainedGlyphIds: number[] }
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

export function buildCanonicalFullDocumentProof(): { pdfPath: string; summaryPath: string } {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const fallbackReportRoot = resolve(repoRoot, "../ocr-benchmark-skeleton/reports/INV_9437125258")
  const reportRoot = resolve(process.env.FLOWDOC_PDF_PILOT_REPORT_ROOT ?? fallbackReportRoot)
  const bundle = readJson<FlowDocCanonicalReportBodyDisplayListBundleV1>(resolve(
    repoRoot,
    "fixtures/pdf-pilot-canonical-report-body-display-list.v1.json",
  ))
  const manifests = SUBSET_MANIFESTS.map((path) => readJson<SubsetManifest>(resolve(repoRoot, path)))
  const resources = {
    proofId: "pdf-pilot-08b-r2c-m-canonical-full-document",
    contract: bundle.rendererHandoff.measuredDrawContract,
    fontResources: manifests.map((manifest) => fontResource(repoRoot, manifest)),
    imageResources: imageResources(reportRoot),
  }
  const result = renderFlowDocCanonicalFullDocumentPdfPilot(resources)
  const rebuilt = renderFlowDocCanonicalFullDocumentPdfPilot(resources)
  if (result.status !== "rendered") {
    throw new Error(`PDF full-document rendering blocked: ${JSON.stringify(result.issues)}`)
  }
  if (rebuilt.status !== "rendered" || !Buffer.from(result.bytes).equals(Buffer.from(rebuilt.bytes))) {
    throw new Error("PDF full-document rendering is not deterministic.")
  }

  const contract = bundle.rendererHandoff.measuredDrawContract
  const pdfPath = resolve(repoRoot, "output/pdf/flowdoc-pdf-pilot-canonical-full-document-13-page.pdf")
  const summaryPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json",
  )
  mkdirSync(dirname(pdfPath), { recursive: true })
  mkdirSync(dirname(summaryPath), { recursive: true })
  writeFileSync(pdfPath, result.bytes)
  writeFileSync(summaryPath, `${JSON.stringify({
    summaryVersion: 1,
    phaseId: "PDF-PILOT-08B-R2C-M",
    proofId: result.proofId,
    status: result.status,
    sourceBundleFingerprint: bundle.bundleFingerprint,
    artifact: result.artifact,
    renderContract: result.renderContract,
    summary: result.summary,
    commandInventory: {
      sourceCommandCount: contract.summary.sourceCommandCount,
      paintCommandCount: contract.summary.paintCommandCount,
      glyphRunCount: contract.summary.glyphRunCount,
      fillRectCount: contract.summary.fillRectCount,
      strokeRectCount: contract.summary.strokeRectCount,
      strokeLineCount: contract.summary.strokeLineCount ?? 0,
      imageCount: contract.summary.imageCount,
    },
    pageImageBindings: contract.pages.flatMap((page) => page.commands
      .filter((command) => command.kind === "image")
      .map((command) => ({ pageNumber: page.pageNumber, assetId: command.assetId }))),
    subsets: manifests.map((manifest) => ({
      subsetId: manifest.subsetId,
      fontId: manifest.fontId,
      sourceSha256: manifest.source.sha256,
      sourceBytes: manifest.source.bytes,
      subsetSha256: manifest.subset.sha256,
      subsetBytes: manifest.subset.bytes,
      retainedGlyphCount: manifest.subset.retainedGlyphIds.length,
    })),
    deterministicRebuild: { unchanged: true, sha256: result.artifact.sha256 },
    externalImageBytesRetained: false,
    productionBinding: false,
    visualFidelityAccepted: false,
  }, null, 2)}\n`, "utf8")
  return { pdfPath, summaryPath }
}
