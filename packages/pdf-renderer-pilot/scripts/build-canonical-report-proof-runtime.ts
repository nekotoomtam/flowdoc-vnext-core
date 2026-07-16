import { readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import {
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../../../src/index.js"
import { renderFlowDocCanonicalTwelvePageReportPdfPilot } from "../src/index.js"

const IMAGE_FILES = [
  ["source-evidence-image", "source_evidence.png"],
  ["ocr-accuracy-image", "ocr_accuracy.png"],
  ["native-extraction-image", "native_extraction.png"],
  ["mapping-gap-image", "mapping_gap.png"],
  ["latency-rounds-image", "latency_rounds.png"],
] as const

interface SubsetManifest {
  subsetId: string
  fontId: string
  postScriptName: string
  subsetPrefix: string
  subset: { path: string; sha256: string }
  source: { path: string }
}

interface CompositionFixture {
  referenceArtifact: {
    artifactId: string
    pointer: string
    mediaType: string
    bytes: number
    sha256: string
    pageCount: number
  }
  pages: Array<{ pageNumber: number; pageId: string; marker: string }>
}

export async function buildCanonicalReportProof(): Promise<{
  pdfPath: string
  summaryPath: string
}> {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const fallbackReportRoot = resolve(
    repoRoot,
    "../ocr-benchmark-skeleton/reports/INV_9437125258",
  )
  const reportRoot = resolve(
    process.env.FLOWDOC_PDF_PILOT_REPORT_ROOT ?? fallbackReportRoot,
  )
  const request = JSON.parse(readFileSync(
    resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-twelve-page-request.v1.json"),
    "utf8",
  )) as VNextPdfMeasuredDrawContractRequestV1
  const composition = JSON.parse(readFileSync(
    resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-composition.v1.json"),
    "utf8",
  )) as CompositionFixture
  const manifest = JSON.parse(readFileSync(
    resolve(repoRoot, "packages/pdf-renderer-pilot/fixtures/canonical-report-font-subset-manifest.v1.json"),
    "utf8",
  )) as SubsetManifest
  const contract = createVNextPdfMeasuredDrawContractV1(request)
  const result = renderFlowDocCanonicalTwelvePageReportPdfPilot({
    proofId: "pdf-pilot-07-canonical-report-twelve-page",
    contract,
    fontResources: [{
      fontId: manifest.fontId,
      subsetId: manifest.subsetId,
      subsetPrefix: manifest.subsetPrefix,
      postScriptName: manifest.postScriptName,
      subsetSha256: manifest.subset.sha256,
      sourceBytes: readFileSync(resolve(repoRoot, manifest.source.path)),
      subsetBytes: readFileSync(resolve(repoRoot, manifest.subset.path)),
    }],
    imageResources: IMAGE_FILES.map(([assetId, fileName]) => ({
      assetId,
      bytes: readFileSync(resolve(reportRoot, "assets", fileName)),
    })),
  })
  if (result.status !== "rendered") {
    throw new Error(`PDF canonical report rendering blocked: ${JSON.stringify(result.issues)}`)
  }

  const pdfPath = resolve(repoRoot, "output/pdf/flowdoc-pdf-pilot-canonical-report-twelve-page.pdf")
  const summaryPath = resolve(repoRoot, "packages/pdf-renderer-pilot/fixtures/canonical-report-twelve-page-summary.v1.json")
  mkdirSync(dirname(pdfPath), { recursive: true })
  mkdirSync(dirname(summaryPath), { recursive: true })
  writeFileSync(pdfPath, result.bytes)
  writeFileSync(summaryPath, `${JSON.stringify({
    summaryVersion: 1,
    proofId: result.proofId,
    status: result.status,
    referenceArtifact: composition.referenceArtifact,
    artifact: result.artifact,
    renderContract: result.renderContract,
    summary: result.summary,
    expectedPageMarkers: composition.pages.map((page) => ({
      pageNumber: page.pageNumber,
      pageId: page.pageId,
      marker: page.marker,
    })),
    externalReferenceBytesRetained: false,
    externalImageBytesRetained: false,
    productionBinding: false,
  }, null, 2)}\n`, "utf8")
  return { pdfPath, summaryPath }
}
