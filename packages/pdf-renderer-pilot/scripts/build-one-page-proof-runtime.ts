import { readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import {
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../../../src/index.js"
import { renderFlowDocThaiOnePagePdfPilot } from "../src/index.js"

interface SubsetManifest {
  subsetId: string
  fontId: string
  postScriptName: string
  subsetPrefix: string
  subset: {
    path: string
    sha256: string
  }
  source: {
    path: string
  }
}

export async function buildOnePageProof(): Promise<{ pdfPath: string; summaryPath: string }> {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const requestPath = resolve(repoRoot, "fixtures/pdf-pilot-thai-one-page-request.v1.json")
  const manifestPath = resolve(repoRoot, "packages/pdf-renderer-pilot/fixtures/font-subset-manifest.v1.json")
  const request = JSON.parse(readFileSync(requestPath, "utf8")) as VNextPdfMeasuredDrawContractRequestV1
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as SubsetManifest
  const contract = createVNextPdfMeasuredDrawContractV1(request)
  const result = renderFlowDocThaiOnePagePdfPilot({
    proofId: "pdf-pilot-03-thai-one-page",
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
  })
  if (result.status !== "rendered") {
    throw new Error(`PDF pilot rendering blocked: ${JSON.stringify(result.issues)}`)
  }

  const pdfPath = resolve(repoRoot, "output/pdf/flowdoc-pdf-pilot-thai-one-page.pdf")
  const summaryPath = resolve(repoRoot, "packages/pdf-renderer-pilot/fixtures/one-page-proof-summary.v1.json")
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
    productionBinding: false,
  }, null, 2)}\n`, "utf8")
  return { pdfPath, summaryPath }
}
