import { readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import {
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../../../src/index.js"
import { renderFlowDocDigestBoundImageOnePagePdfPilot } from "../src/full.js"

interface SubsetManifest {
  subsetId: string
  fontId: string
  postScriptName: string
  subsetPrefix: string
  subset: { path: string; sha256: string }
  source: { path: string }
}

export async function buildImageOnePageProof(): Promise<{ pdfPath: string; summaryPath: string }> {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const fallbackImagePath = resolve(
    repoRoot,
    "../ocr-benchmark-skeleton/reports/INV_9437125258/assets/ocr_accuracy.png",
  )
  const imagePath = resolve(
    process.env.FLOWDOC_PDF_PILOT_OCR_ACCURACY_IMAGE ?? fallbackImagePath,
  )
  const request = JSON.parse(readFileSync(
    resolve(repoRoot, "fixtures/pdf-pilot-image-one-page-request.v1.json"),
    "utf8",
  )) as VNextPdfMeasuredDrawContractRequestV1
  const manifest = JSON.parse(readFileSync(
    resolve(repoRoot, "packages/pdf-renderer-pilot/fixtures/font-subset-manifest.v1.json"),
    "utf8",
  )) as SubsetManifest
  const contract = createVNextPdfMeasuredDrawContractV1(request)
  const result = renderFlowDocDigestBoundImageOnePagePdfPilot({
    proofId: "pdf-pilot-04-image-one-page",
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
    imageResources: [{
      assetId: "ocr-accuracy-image",
      bytes: readFileSync(imagePath),
    }],
  })
  if (result.status !== "rendered") {
    throw new Error(`PDF image pilot rendering blocked: ${JSON.stringify(result.issues)}`)
  }

  const pdfPath = resolve(repoRoot, "output/pdf/flowdoc-pdf-pilot-image-one-page.pdf")
  const summaryPath = resolve(repoRoot, "packages/pdf-renderer-pilot/fixtures/image-one-page-proof-summary.v1.json")
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
    expectedExtractedLines: [
      "สรุปผล OCR ภาษาไทย 100%",
      "ค้นหา เลือก และคัดลอกข้อความได้",
    ],
    externalImageBytesRetained: false,
    productionBinding: false,
  }, null, 2)}\n`, "utf8")
  return { pdfPath, summaryPath }
}
