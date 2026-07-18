import { readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import {
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../../../src/index.js"
import { renderFlowDocAllFiveImageMatrixPdfPilot } from "../src/full.js"

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

export async function buildAllImagesMultiPageProof(): Promise<{
  pdfPath: string
  summaryPath: string
}> {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const fallbackAssetRoot = resolve(
    repoRoot,
    "../ocr-benchmark-skeleton/reports/INV_9437125258/assets",
  )
  const assetRoot = resolve(
    process.env.FLOWDOC_PDF_PILOT_REPORT_ASSET_ROOT ?? fallbackAssetRoot,
  )
  const request = JSON.parse(readFileSync(
    resolve(repoRoot, "fixtures/pdf-pilot-all-five-images-five-page-request.v1.json"),
    "utf8",
  )) as VNextPdfMeasuredDrawContractRequestV1
  const manifest = JSON.parse(readFileSync(
    resolve(repoRoot, "packages/pdf-renderer-pilot/fixtures/font-subset-manifest.v1.json"),
    "utf8",
  )) as SubsetManifest
  const contract = createVNextPdfMeasuredDrawContractV1(request)
  const result = renderFlowDocAllFiveImageMatrixPdfPilot({
    proofId: "pdf-pilot-06-all-five-images-five-page",
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
      bytes: readFileSync(resolve(assetRoot, fileName)),
    })),
  })
  if (result.status !== "rendered") {
    throw new Error(`PDF all-images pilot rendering blocked: ${JSON.stringify(result.issues)}`)
  }

  const pdfPath = resolve(repoRoot, "output/pdf/flowdoc-pdf-pilot-all-five-images-five-page.pdf")
  const summaryPath = resolve(repoRoot, "packages/pdf-renderer-pilot/fixtures/all-five-images-five-page-summary.v1.json")
  mkdirSync(dirname(pdfPath), { recursive: true })
  mkdirSync(dirname(summaryPath), { recursive: true })
  writeFileSync(pdfPath, result.bytes)
  writeFileSync(summaryPath, `${JSON.stringify({
    summaryVersion: 1,
    proofId: result.proofId,
    status: result.status,
    artifact: result.artifact,
    renderContract: result.renderContract,
    summary: result.summary,
    expectedExtractedLinesPerPage: [
      "สรุปผล OCR ภาษาไทย 100%",
      "ค้นหา เลือก และคัดลอกข้อความได้",
    ],
    externalImageBytesRetained: false,
    productionBinding: false,
  }, null, 2)}\n`, "utf8")
  return { pdfPath, summaryPath }
}
