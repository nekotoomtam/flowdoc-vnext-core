import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import {
  createFlowDocCanonicalReportDataBundleV1,
  validateFlowDocCanonicalReportDataBundleV1,
  type FlowDocCanonicalReportMediaInput,
  type FlowDocCanonicalReportSourceFileIdentity,
} from "../src/canonicalReportDataAdapter.js"
import {
  deriveCanonicalReportSourceSnapshot,
  validateCanonicalReportSourceFiles,
} from "./canonical-report-source-data.mjs"

const MEDIA_DEFINITIONS = [
  ["report.media.source_evidence", "source-evidence-image", "source_evidence.png", 1548, 1376],
  ["report.media.ocr_accuracy_chart", "ocr-accuracy-image", "ocr_accuracy.png", 1950, 900],
  ["report.media.native_extraction_chart", "native-extraction-image", "native_extraction.png", 1950, 900],
  ["report.media.mapping_gap_chart", "mapping-gap-image", "mapping_gap.png", 1950, 900],
  ["report.media.latency_rounds_chart", "latency-rounds-image", "latency_rounds.png", 1950, 900],
] as const

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex")
}

function pngDimensions(bytes: Buffer): { widthPx: number; heightPx: number } {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (bytes.byteLength < 24 || !bytes.subarray(0, 8).equals(signature)) {
    throw new Error("Expected a PNG signature.")
  }
  return { widthPx: bytes.readUInt32BE(16), heightPx: bytes.readUInt32BE(20) }
}

export function buildCanonicalReportDataBundle(): {
  bundlePath: string
  qaPath: string
} {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const reportRoot = resolve(
    process.env.FLOWDOC_PDF_PILOT_REPORT_ROOT
      ?? resolve(repoRoot, "../ocr-benchmark-skeleton/reports/INV_9437125258"),
  )
  const sourceManifest = JSON.parse(readFileSync(
    resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-source-data.v1.json"),
    "utf8",
  )) as {
    sourceSnapshotSha256: string
    sourceFiles: FlowDocCanonicalReportSourceFileIdentity[]
  }
  const sourceFilesById = Object.fromEntries(sourceManifest.sourceFiles.map((source) => [
    source.sourceId,
    readFileSync(resolve(reportRoot, source.fileName)),
  ]))
  const sourceModel = validateCanonicalReportSourceFiles(sourceManifest, sourceFilesById)
  const reproducedSourceSnapshot = deriveCanonicalReportSourceSnapshot(sourceModel)
  const reproducedSourceSnapshotSha256 = createHash("sha256")
    .update(JSON.stringify(reproducedSourceSnapshot), "utf8")
    .digest("hex")
  if (reproducedSourceSnapshotSha256 !== sourceManifest.sourceSnapshotSha256) {
    throw new Error("External benchmark sources do not reproduce the pinned source snapshot.")
  }

  const corpus = JSON.parse(readFileSync(
    resolve(repoRoot, "fixtures/pdf-report-font-bakeoff-corpus.v1.json"),
    "utf8",
  )) as { referenceArtifacts: Array<{ artifactId: string; fileName?: string; pointer: string; bytes: number; sha256: string }> }
  const artifacts = new Map(corpus.referenceArtifacts.map((artifact) => [artifact.artifactId, artifact]))
  const media: FlowDocCanonicalReportMediaInput[] = MEDIA_DEFINITIONS.map(([
    fieldKey,
    assetId,
    fileName,
    widthPx,
    heightPx,
  ]) => {
    const artifact = artifacts.get(assetId)
    if (artifact == null) throw new Error(`Missing pinned media artifact ${assetId}.`)
    const bytes = readFileSync(resolve(reportRoot, "assets", fileName))
    const dimensions = pngDimensions(bytes)
    if (artifact.bytes !== bytes.byteLength || artifact.sha256 !== sha256(bytes)) {
      throw new Error(`Pinned media identity differs for ${assetId}.`)
    }
    if (dimensions.widthPx !== widthPx || dimensions.heightPx !== heightPx) {
      throw new Error(`Pinned media dimensions differ for ${assetId}.`)
    }
    return {
      fieldKey,
      assetId,
      fileName,
      mediaType: "image/png",
      byteLength: bytes.byteLength,
      sha256: artifact.sha256,
      widthPx,
      heightPx,
    }
  })

  const adapterInput = {
    sourceFiles: sourceManifest.sourceFiles,
    sourceSnapshotSha256: sourceManifest.sourceSnapshotSha256,
    sourceModel,
    media,
  }
  const bundle = createFlowDocCanonicalReportDataBundleV1(adapterInput)
  const rebuilt = createFlowDocCanonicalReportDataBundleV1(adapterInput)
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report data bundle is not deterministic.")
  }
  const validation = validateFlowDocCanonicalReportDataBundleV1(bundle)
  if (validation.status !== "valid") throw new Error("Generated canonical report data bundle is invalid.")

  const bundlePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-data-bundle.v1.json")
  const qaPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-data-bundle-qa.v1.json",
  )
  mkdirSync(dirname(bundlePath), { recursive: true })
  mkdirSync(dirname(qaPath), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify({
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2a-canonical-report-data-binding-lock-qa-v1",
    phaseId: "PDF-PILOT-08B-R2A",
    status: "accepted",
    adapterId: bundle.adapterId,
    benchmarkId: bundle.benchmarkId,
    sourceSetId: bundle.sourceSet.sourceSetId,
    sourceSnapshotSha256: bundle.sourceSet.sourceSnapshotSha256,
    bundleFingerprint: bundle.bundleFingerprint,
    sourceIdentity: {
      dataFileCount: bundle.sourceSet.dataFiles.length,
      mediaFileCount: bundle.sourceSet.mediaFiles.length,
      allHashesAccepted: true,
      sourceSnapshotReproduced: true,
    },
    contracts: {
      fieldContractId: bundle.fieldContract.fieldContractId,
      collectionItemContractId: bundle.collectionItemContract.collectionItemContractId,
      dataSnapshotId: bundle.dataSnapshot.dataSnapshotId,
      collectionSnapshotId: bundle.collectionSnapshot.collectionSnapshotId,
      mediaSnapshotId: bundle.mediaSnapshot.mediaSnapshotId,
      exactInstanceRevisionPins: true,
      schemaValidationAccepted: true,
    },
    summary: bundle.summary,
    boundary: {
      templateResolution: bundle.execution.templateResolution,
      textMeasurement: bundle.execution.textMeasurement,
      lineBreaking: bundle.execution.lineBreaking,
      layout: bundle.execution.layout,
      pagination: bundle.execution.pagination,
      pdfRendering: bundle.execution.pdfRendering,
      layoutFactsPresent: false,
      finalDisplayStringsOwned: false,
      deterministicRebuild: true,
    },
    nextPhase: "PDF-PILOT-08B-R2B canonical report template and resolution",
  }, null, 2)}\n`, "utf8")
  return { bundlePath, qaPath }
}
