import { readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import {
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../../../src/index.js"
import { renderFlowDocCanonicalTwelvePageReportPdfPilot } from "../src/full.js"

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

interface ContentParityManifest {
  manifestId: string
  referenceSource: { pointer: string; fileName: string; bytes: number; sha256: string }
  claim: {
    parityLevel: string
    verbatimSentenceParity: boolean
    visualParity: boolean
  }
  coverage: {
    referenceExtractedNonWhitespaceCharacters: number
    minimumReferenceRatio: number
  }
  requiredElements: unknown[]
  requiredTableRows: unknown[]
  requiredExactItems: unknown[]
  requiredPageText: unknown[]
}

interface CanonicalProofConfig {
  proofId: string
  requestFile: string
  subsetManifestFiles: string[]
  pdfFile: string
  summaryFile: string
  contentParityManifestFile?: string
  sourceDataManifestFile?: string
  typographyManifestFile?: string
}

interface SourceDataManifest {
  manifestId: string
  sourceSnapshotSha256: string
  sourceFiles: Array<{
    sourceId: string
    fileName: string
    mediaType: string
    role: string
    bytes: number
    sha256: string
  }>
  sourceSnapshot: {
    bindings: unknown[]
  }
  acceptance: {
    expectedBindingCount: number
    expectedSourceScalarValueCount: number
    expectedFactualCorrectionCount: number
    analyzerReproduction: string
    supersedesFactualClaimsFrom: string[]
  }
}

interface TypographyManifest {
  manifestId: string
  fontIds: string[]
  requiredStyles: Array<{ styleId: string; minimumFontSizePt: number; fontId: string }>
  tableAcceptance: {
    expectedTableCount: number
    minimumBodyFontSizePt: number
    minimumHeaderFontSizePt: number
    bodyFontId: string
    headerFontId: string
  }
}

async function buildCanonicalReportProofWithConfig(config: CanonicalProofConfig): Promise<{
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
    resolve(repoRoot, config.requestFile),
    "utf8",
  )) as VNextPdfMeasuredDrawContractRequestV1
  const composition = JSON.parse(readFileSync(
    resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-composition.v1.json"),
    "utf8",
  )) as CompositionFixture
  const manifests = config.subsetManifestFiles.map((manifestFile) => JSON.parse(readFileSync(
    resolve(repoRoot, manifestFile),
    "utf8",
  )) as SubsetManifest)
  const contentParity = config.contentParityManifestFile == null
    ? null
    : JSON.parse(readFileSync(
      resolve(repoRoot, config.contentParityManifestFile),
      "utf8",
    )) as ContentParityManifest
  const typography = config.typographyManifestFile == null
    ? null
    : JSON.parse(readFileSync(
      resolve(repoRoot, config.typographyManifestFile),
      "utf8",
    )) as TypographyManifest
  const sourceData = config.sourceDataManifestFile == null
    ? null
    : JSON.parse(readFileSync(
      resolve(repoRoot, config.sourceDataManifestFile),
      "utf8",
    )) as SourceDataManifest
  const contract = createVNextPdfMeasuredDrawContractV1(request)
  const result = renderFlowDocCanonicalTwelvePageReportPdfPilot({
    proofId: config.proofId,
    contract,
    fontResources: manifests.map((manifest) => ({
      fontId: manifest.fontId,
      subsetId: manifest.subsetId,
      subsetPrefix: manifest.subsetPrefix,
      postScriptName: manifest.postScriptName,
      subsetSha256: manifest.subset.sha256,
      sourceBytes: readFileSync(resolve(repoRoot, manifest.source.path)),
      subsetBytes: readFileSync(resolve(repoRoot, manifest.subset.path)),
    })),
    imageResources: IMAGE_FILES.map(([assetId, fileName]) => ({
      assetId,
      bytes: readFileSync(resolve(reportRoot, "assets", fileName)),
    })),
  })
  if (result.status !== "rendered") {
    throw new Error(`PDF canonical report rendering blocked: ${JSON.stringify(result.issues)}`)
  }

  const pdfPath = resolve(repoRoot, config.pdfFile)
  const summaryPath = resolve(repoRoot, config.summaryFile)
  mkdirSync(dirname(pdfPath), { recursive: true })
  mkdirSync(dirname(summaryPath), { recursive: true })
  writeFileSync(pdfPath, result.bytes)
  const renderedNonWhitespaceCharacters = request.paintCommands
    .filter((command) => command.kind === "glyph-run")
    .reduce((total, command) => total + command.text.replace(/\s+/gu, "").length, 0)
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
    ...(contentParity == null ? {} : {
      contentParity: {
        manifestId: contentParity.manifestId,
        source: contentParity.referenceSource,
        ...contentParity.claim,
        requiredElementCount: contentParity.requiredElements.length,
        requiredTableCount: contentParity.requiredTableRows.length,
        requiredExactItemCount: contentParity.requiredExactItems.length,
        requiredPageTextCount: contentParity.requiredPageText.length,
        referenceNonWhitespaceCharacters: contentParity.coverage.referenceExtractedNonWhitespaceCharacters,
        renderedNonWhitespaceCharacters,
        referenceCoverageRatio: Number((
          renderedNonWhitespaceCharacters
          / contentParity.coverage.referenceExtractedNonWhitespaceCharacters
        ).toFixed(6)),
        minimumReferenceRatio: contentParity.coverage.minimumReferenceRatio,
      },
    }),
    ...(typography == null ? {} : {
      typographyCalibration: {
        manifestId: typography.manifestId,
        fontIds: typography.fontIds,
        requiredStyleCount: typography.requiredStyles.length,
        bodyStyleMinimumFontSizePt: typography.requiredStyles.find(
          (item) => item.styleId === "body",
        )?.minimumFontSizePt,
        ...typography.tableAcceptance,
      },
    }),
    ...(sourceData == null ? {} : {
      sourceDataBinding: {
        manifestId: sourceData.manifestId,
        sourceSnapshotSha256: sourceData.sourceSnapshotSha256,
        sourceFiles: sourceData.sourceFiles,
        sourceBindingCount: sourceData.sourceSnapshot.bindings.length,
        ...sourceData.acceptance,
      },
    }),
    externalReferenceBytesRetained: false,
    externalImageBytesRetained: false,
    productionBinding: false,
  }, null, 2)}\n`, "utf8")
  return { pdfPath, summaryPath }
}

export async function buildCanonicalReportProof(): Promise<{
  pdfPath: string
  summaryPath: string
}> {
  return buildCanonicalReportProofWithConfig({
    proofId: "pdf-pilot-07-canonical-report-twelve-page",
    requestFile: "fixtures/pdf-pilot-canonical-report-twelve-page-request.v1.json",
    subsetManifestFiles: ["packages/pdf-renderer-pilot/fixtures/canonical-report-font-subset-manifest.v1.json"],
    pdfFile: "output/pdf/flowdoc-pdf-pilot-canonical-report-twelve-page.pdf",
    summaryFile: "packages/pdf-renderer-pilot/fixtures/canonical-report-twelve-page-summary.v1.json",
  })
}

export async function buildCanonicalReportContentParityProof(): Promise<{
  pdfPath: string
  summaryPath: string
}> {
  return buildCanonicalReportProofWithConfig({
    proofId: "pdf-pilot-08a-canonical-report-content-parity",
    requestFile: "fixtures/pdf-pilot-canonical-report-content-parity-twelve-page-request.v1.json",
    subsetManifestFiles: ["packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-font-subset-manifest.v1.json"],
    pdfFile: "output/pdf/flowdoc-pdf-pilot-canonical-report-content-parity-twelve-page.pdf",
    summaryFile: "packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-twelve-page-summary.v1.json",
    contentParityManifestFile: "fixtures/pdf-pilot-canonical-report-content-parity.v1.json",
  })
}

export async function buildCanonicalReportTypographyProof(): Promise<{
  pdfPath: string
  summaryPath: string
}> {
  return buildCanonicalReportProofWithConfig({
    proofId: "pdf-pilot-08b-canonical-report-typography-calibration",
    requestFile: "fixtures/pdf-pilot-canonical-report-typography-calibrated-twelve-page-request.v1.json",
    subsetManifestFiles: [
      "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-regular-font-subset-manifest.v1.json",
      "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-bold-font-subset-manifest.v1.json",
    ],
    pdfFile: "output/pdf/flowdoc-pdf-pilot-canonical-report-typography-calibrated-twelve-page.pdf",
    summaryFile: "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-calibrated-twelve-page-summary.v1.json",
    contentParityManifestFile: "fixtures/pdf-pilot-canonical-report-content-parity.v1.json",
    typographyManifestFile: "fixtures/pdf-pilot-canonical-report-typography-calibration.v1.json",
  })
}

export async function buildCanonicalReportSourceDataProof(): Promise<{
  pdfPath: string
  summaryPath: string
}> {
  return buildCanonicalReportProofWithConfig({
    proofId: "pdf-pilot-08b-r1-canonical-report-source-data",
    requestFile: "fixtures/pdf-pilot-canonical-report-source-backed-typography-twelve-page-request.v1.json",
    subsetManifestFiles: [
      "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-regular-font-subset-manifest.v1.json",
      "packages/pdf-renderer-pilot/fixtures/canonical-report-typography-bold-font-subset-manifest.v1.json",
    ],
    pdfFile: "output/pdf/flowdoc-pdf-pilot-canonical-report-source-backed-twelve-page.pdf",
    summaryFile: "packages/pdf-renderer-pilot/fixtures/canonical-report-source-backed-twelve-page-summary.v1.json",
    contentParityManifestFile: "fixtures/pdf-pilot-canonical-report-content-parity.v1.json",
    typographyManifestFile: "fixtures/pdf-pilot-canonical-report-typography-calibration.v1.json",
    sourceDataManifestFile: "fixtures/pdf-pilot-canonical-report-source-data.v1.json",
  })
}
