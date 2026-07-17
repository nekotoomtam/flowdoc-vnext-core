import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createInitialVNextAtomicBlockV4PaginationCursor,
  createInitialVNextTableFlowV4PaginationCursor,
  createInitialVNextTextFlowV4PaginationCursor,
  createVNextTableFlowV4SourceFingerprint,
  createVNextTextFlowV4MeasurementFingerprint,
  hasValidVNextAtomicBlockV4EvidenceFingerprint,
  hasValidVNextTableFlowV4CursorFingerprint,
  parseVNextDocumentCompositionManifestV1,
} from "../src/index.js"
import type { FlowDocCanonicalReportLineBreakingBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportLineBreaking.js"
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportMeasuredComposition.js"
import type {
  FlowDocCanonicalReportNativeShapingBundleV1,
  FlowDocCanonicalReportNativeShapingFontManifestV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportNativeShaping.js"
import {
  createFlowDocCanonicalReportPaginationInputsBundleV1,
  createFlowDocCanonicalReportPaginationInputsPlanV1,
  validateFlowDocCanonicalReportPaginationInputsBundleV1,
  type FlowDocCanonicalReportPaginationInputsBundleV1,
  type FlowDocCanonicalReportPaginationInputsRawEvidenceV1,
  type FlowDocCanonicalReportPaginationInputsSourceV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportPaginationInputs.js"
import type { FlowDocCanonicalReportSectionReconciliationBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportSectionReconciliation.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportTableProjection.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

const INPUT: FlowDocCanonicalReportPaginationInputsSourceV1 = {
  projection: readJson<FlowDocCanonicalReportTableProjectionBundleV1>(
    "fixtures/pdf-pilot-canonical-report-table-projection.v1.json",
  ),
  nativeShaping: readJson<FlowDocCanonicalReportNativeShapingBundleV1>(
    "fixtures/pdf-pilot-canonical-report-native-shaping.v1.json",
  ),
  lineBreaking: readJson<FlowDocCanonicalReportLineBreakingBundleV1>(
    "fixtures/pdf-pilot-canonical-report-line-breaking.v1.json",
  ),
  measuredComposition: readJson<FlowDocCanonicalReportMeasuredCompositionBundleV1>(
    "fixtures/pdf-pilot-canonical-report-measured-composition.v1.json",
  ),
  sectionReconciliation: readJson<FlowDocCanonicalReportSectionReconciliationBundleV1>(
    "fixtures/pdf-pilot-canonical-report-section-reconciliation.v1.json",
  ),
  fontManifest: readJson<FlowDocCanonicalReportNativeShapingFontManifestV1>(
    "assets/fonts/font-assets.v1.json",
  ),
}
const RAW = readJson<FlowDocCanonicalReportPaginationInputsRawEvidenceV1>(
  "packages/pdf-renderer-pilot/fixtures/canonical-report-pagination-inputs-raw.v1.json",
)
const BUNDLE = readJson<FlowDocCanonicalReportPaginationInputsBundleV1>(
  "fixtures/pdf-pilot-canonical-report-pagination-inputs.v1.json",
)

function validate(
  value: unknown,
  input: FlowDocCanonicalReportPaginationInputsSourceV1 = INPUT,
  raw: FlowDocCanonicalReportPaginationInputsRawEvidenceV1 = RAW,
) {
  return validateFlowDocCanonicalReportPaginationInputsBundleV1(value, input, raw)
}

describe("PDF-PILOT-08B-R2C-I canonical report pagination inputs", () => {
  it("pins all family inputs, generated footer evidence, and the pagination-ready manifest", () => {
    expect(validate(BUNDLE)).toEqual({ status: "valid", issues: [], summary: BUNDLE.summary })
    expect(BUNDLE).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-I",
      sourceProjectionFingerprint: "c44832960277c9e7cdfed60f4a3ec9638b0ca78b4860e77455f16d0633ad7850",
      sourceNativeShapingFingerprint: "d86f7f0eb9954cedcb8dd9bfc4b850feaf88ac61a406a1e11a8f5c9d186c093a",
      sourceLineBreakingFingerprint: "2f4dee43082a5305d222d1e5a0eb5c7aec4a33fc1f98a9756ecbb2104282b13d",
      sourceMeasuredCompositionFingerprint: "1c988eca85984869c8be8b1f5af9a763cc72fa01b66f1da7cb1c046cfb7ad854",
      sourceSectionReconciliationFingerprint: "06159f79a648efce2c78aa4fcde6f17032a31b383c3e4e8a28a741f968789553",
      sourceFontManifestFingerprint: "ba811589b50375b3f70b66689c14645d7d0328f95802b9cfac7f31d096d79077",
      sourceRawEvidenceFingerprint: "cb429884f76ba6e4f796bdf1814b0538c0e5ea9e0f992f59c75c4cb4137a6535",
      planFingerprint: "1663641bb6b25be5cad9ea158f1d8efbfb80e5f9c69505c94dd29549570eda1d",
      bundleFingerprint: "6395b57d085965e37022a9ae5a68eca0b57c12717b475089a5f148d60b9235b6",
      coreCompositionManifest: {
        fingerprint: "sha256:50bf4ea84e4d9676af098be3681c99d43614c4e1deac1b087335c32b49d0ff4d",
      },
      summary: {
        bodyItemCount: 185,
        familyInputCount: 185,
        textFlowInputCount: 165,
        tableFlowInputCount: 15,
        mediaFlowInputCount: 5,
        measurementOwnerReplacementCount: 185,
        sourceLocatorCount: 185,
        initialCursorCount: 185,
        generatedFooterCapacityDigits: 4,
        generatedFooterMaximumPageNumber: 1000,
        generatedFooterLineCount: 1,
        generatedFooterHeightPt: 12,
        generatedFooterReservedHeightPt: 24,
        generatedFooterReservedSlackPt: 12,
        paginationExecuted: false,
        pageAssignmentExecuted: false,
      },
    })
  }, 90_000)

  it("binds every manifest root to its exact source owner, bounded config, and initial cursor", () => {
    expect(BUNDLE.familyPaginationInputs).toHaveLength(185)
    expect(BUNDLE.coreCompositionManifest.bodyItems).toHaveLength(185)
    BUNDLE.familyPaginationInputs.forEach((family, index) => {
      const item = BUNDLE.coreCompositionManifest.bodyItems[index]
      const previous = INPUT.sectionReconciliation.coreCompositionManifest.bodyItems[index]
      expect(family.itemIndex).toBe(index)
      expect(family.rootNodeId).toBe(item.rootNodeId)
      expect(family.initialCursorRef).toEqual(item.initialCursor)
      expect(family.measurementOwnerFingerprint).toBe(item.ownerPins.measurement)
      expect(family.initialCursorRef.ownerFingerprint).toBe(family.measurementOwnerFingerprint)
      expect(family.initialCursorRef.complete).toBe(false)
      expect(family.measurementOwnerFingerprint).not.toBe(previous.ownerPins.measurement)
      expect(family.inputFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)

      if (family.family === "text-flow") {
        const block = INPUT.measuredComposition.documentBlocks[family.source.documentBlockIndex]
        expect(block.consumerId).toBe(family.source.consumerId)
        expect(block.textBlockId).toBe(family.rootNodeId)
        expect(createVNextTextFlowV4MeasurementFingerprint(block.measured)).toBe(
          family.measurementOwnerFingerprint,
        )
        expect(createInitialVNextTextFlowV4PaginationCursor(block.measured)).toEqual(family.initialCursor)
      } else if (family.family === "table-flow") {
        const table = INPUT.measuredComposition.preparedTables[family.source.preparedTableIndex]
        expect(table.projectionId).toBe(family.source.projectionId)
        expect(table.tableId).toBe(family.rootNodeId)
        expect(createVNextTableFlowV4SourceFingerprint(table.preparedRows)).toBe(
          family.measurementOwnerFingerprint,
        )
        expect(createInitialVNextTableFlowV4PaginationCursor({
          prepared: table.preparedRows,
          pageBodyHeightPt: family.pagination.pageBodyHeightPt,
          headerPolicy: family.pagination.headerPolicy,
          maximumRowPlanCount: family.pagination.maximumRowPlanCount,
        })).toEqual(family.initialCursor)
        expect(hasValidVNextTableFlowV4CursorFingerprint(family.initialCursor)).toBe(true)
      } else {
        const image = INPUT.measuredComposition.fixedImageBlocks[family.source.fixedImageBlockIndex]
        expect(image.imageId).toBe(family.rootNodeId)
        expect(image.assetId).toBe(family.source.assetId)
        expect(hasValidVNextAtomicBlockV4EvidenceFingerprint(family.evidence)).toBe(true)
        expect(createInitialVNextAtomicBlockV4PaginationCursor(family.evidence)).toEqual(
          family.initialCursor,
        )
      }
    })
    expect(BUNDLE.familyPaginationInputs.filter((item) => item.family === "table-flow").every((item) => (
      item.pagination.headerPolicy === "repeat-leading-headers"
    ))).toBe(true)
  })

  it("measures a first-class generated page-number capacity sample through native and Core evidence", () => {
    const footer = BUNDLE.generatedFooterMeasurement
    expect(footer).toMatchObject({
      sourceSectionId: "section-cover",
      zoneId: "cover-footer-zone",
      textBlockId: "cover-footer-text",
      pageNumberInlineId: "cover-footer-text-page",
      pageNumberPolicy: {
        start: 1,
        continuation: "continuous-generated-page-number",
        maximumPageNumber: 1000,
        capacityDigits: 4,
        capacitySample: "8888",
      },
      measurementRequest: {
        styleKey: "report-caption",
        renderedText: "รายงานผลการทดสอบ | หน้า 8888",
      },
      accepted: {
        status: "accepted",
        summary: { lineCount: 1, totalHeightPt: 12 },
      },
      lineBoxes: [{ widthPt: 128.52, heightPt: 12 }],
      nativeEvidence: {
        glyphCount: 28,
        missingGlyphCount: 0,
        coveredGlyphCount: 28,
      },
      reservedHeightPt: 24,
      reservedSlackPt: 12,
      status: "capacity-sample-measured-fits-reservation",
    })
    const generatedRun = footer.measurementRequest.runs.find((run) => run.inlineId === footer.pageNumberInlineId)
    expect(generatedRun).toEqual(expect.objectContaining({
      kind: "generated-page-number",
      renderedText: "8888",
      generatedOwnerFingerprint: footer.pageNumberPolicy.generationOwnerFingerprint,
    }))
    const footerZone = BUNDLE.coreCompositionManifest.sections[0].staticZones.find((zone) => zone.role === "footer")
    expect(footerZone?.evidenceFingerprint).toBe(footer.evidenceFingerprint)
    expect(footerZone?.evidenceFingerprint).not.toBe(
      INPUT.sectionReconciliation.coreCompositionManifest.sections[0].staticZones.find((zone) => zone.role === "footer")?.evidenceFingerprint,
    )
  })

  it("keeps pagination, actual page-number glyphs, page assignment, and PDF rendering blocked", () => {
    expect(BUNDLE.downstreamBlockers.map((item) => item.code)).toEqual([
      "document-pagination-not-executed",
      "actual-page-number-expansion-pending",
      "twelve-page-pagination-sensitive",
      "page-assignment-not-executed",
    ])
    expect(BUNDLE.execution).toMatchObject({
      familyPaginationInputs: "bound",
      familyInitialCursors: "created",
      generatedFooterCapacityMeasurement: "executed",
      coreCompositionManifest: "refinalized",
      familyPagination: "not-run",
      documentCompositionTransition: "not-run",
      actualPageNumberExpansion: "not-run",
      pageAssignment: "not-run",
      pdfRendering: "not-run",
    })
    expect("pages" in BUNDLE).toBe(false)
    expect("pageAssignments" in BUNDLE).toBe(false)
    expect("pagination" in BUNDLE).toBe(false)
    expect(parseVNextDocumentCompositionManifestV1(BUNDLE.coreCompositionManifest)).toEqual({
      status: "ready",
      manifest: BUNDLE.coreCompositionManifest,
      issues: [],
    })
  })

  it("rebuilds deterministically without mutating accepted source or raw evidence", () => {
    const input = clone(INPUT)
    const raw = clone(RAW)
    const beforeInput = JSON.stringify(input)
    const beforeRaw = JSON.stringify(raw)
    expect(createFlowDocCanonicalReportPaginationInputsPlanV1(input).planFingerprint).toBe(
      BUNDLE.planFingerprint,
    )
    expect(createFlowDocCanonicalReportPaginationInputsBundleV1(input, raw)).toEqual(BUNDLE)
    expect(JSON.stringify(input)).toBe(beforeInput)
    expect(JSON.stringify(raw)).toBe(beforeRaw)
  }, 120_000)

  it("fails closed on source, raw, execution, and downstream drift", () => {
    const sourceDrift = clone(INPUT)
    sourceDrift.measuredComposition.bundleFingerprint = "0".repeat(64)
    const sourceResult = validate(BUNDLE, sourceDrift)
    expect(sourceResult.status).toBe("blocked")
    if (sourceResult.status !== "blocked") throw new Error("source drift must block")
    expect(sourceResult.issues.map((item) => item.code)).toContain("invalid-source")

    const rawDrift = clone(RAW)
    rawDrift.segmentExecution.rawOutput.text = "drift"
    const rawResult = validate(BUNDLE, INPUT, rawDrift)
    expect(rawResult.status).toBe("blocked")
    if (rawResult.status !== "blocked") throw new Error("raw drift must block")
    expect(rawResult.issues.map((item) => item.code)).toContain("invalid-raw")

    const executionDrift = clone(BUNDLE)
    ;(executionDrift.execution as any).familyPagination = "executed"
    expect(validate(executionDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "execution-boundary" })],
    })
    expect(validate({ ...clone(BUNDLE), pages: [] })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "downstream-fact" })],
    })
    expect(validate(null)).toMatchObject({
      status: "blocked",
      issues: [{ code: "invalid-bundle-shape" }],
    })
  }, 120_000)

  it("retains QA, package, and phase evidence without claiming page assignment", () => {
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-pagination-inputs-qa.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_PAGINATION_INPUTS_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageReadme = readFileSync(resolve(process.cwd(), "packages/pdf-renderer-pilot/README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")
    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-I",
      status: "accepted-family-inputs-and-footer-capacity-proof-pagination-not-run",
      bundleFingerprint: BUNDLE.bundleFingerprint,
      coreCompositionManifestFingerprint: BUNDLE.coreCompositionManifest.fingerprint,
      summary: BUNDLE.summary,
      generatedFooter: {
        renderedCapacitySample: "รายงานผลการทดสอบ | หน้า 8888",
        capacityDigits: 4,
        maximumPageNumber: 1000,
        lineCount: 1,
        widthPt: 128.52,
        heightPt: 12,
        reservedHeightPt: 24,
        missingGlyphCount: 0,
      },
      executionGate: {
        status: "pagination-inputs-ready-document-transition-blocked",
        everyBodyRootBound: true,
        everyPlaceholderMeasurementOwnerReplaced: true,
        exactInitialCursorsCreated: true,
        generatedFooterCapacityMeasured: true,
        actualPageNumbersExpanded: false,
        familyPaginationExecuted: false,
        pageAssignmentExecuted: false,
        pdfRendered: false,
      },
      nextPhase: "PDF-PILOT-08B-R2C-J bounded document composition transition and pagination execution",
    })
    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-I pagination inputs and footer capacity proof accepted; pagination remains blocked.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-I Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-I Pagination Inputs")
    expect(readme).toContain("PDF canonical report pagination inputs")
    expect(packageReadme).toContain("Pagination Input Evidence")
    expect(packageJson.scripts["build:report-pagination-inputs"]).toBe(
      "node scripts/build-canonical-report-pagination-inputs.mjs",
    )
  })
})
