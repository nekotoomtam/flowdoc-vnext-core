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
      sourceProjectionFingerprint: "f9ade0a648bd5f4f5d93fe73f44e5d8c0b3f447d66a9c3b2e5db95e17ea58193",
      sourceNativeShapingFingerprint: "efa4ba9339398d694d9496588fc0410bca6c1c9c9a02cd3b3394559bf7c002f8",
      sourceLineBreakingFingerprint: "e1a9612766a6342ab3c36bbd0475f170bd4ef64d706161513bdf2f4a64b634a4",
      sourceMeasuredCompositionFingerprint: "a80b13c98aee27c949d2a80bc4b73b8c619ef3f9fa1678792fdb64a28b20127a",
      sourceSectionReconciliationFingerprint: "8c805719625c7c071568db8f90f9fad1b67c66f519ba880c16183314447c8364",
      sourceFontManifestFingerprint: "ba811589b50375b3f70b66689c14645d7d0328f95802b9cfac7f31d096d79077",
      sourceRawEvidenceFingerprint: "ad0bd1b3b80eecb4fcfff6477fb27b08c654de59f9b4b65aaa2609f6bb9f2328",
      planFingerprint: "2f011d5164d7c9373d44767bbbefd736a66712671dc11af6326d21aeda72f43f",
      bundleFingerprint: "73e19092ffa8b203e2aa0fb73463bcb882dcc9b83c652969aad7ed0ef39eb724",
      coreCompositionManifest: {
        fingerprint: "sha256:d0192518baa0c017046cf794d43c82869959e3b702b80681c88166e913d1fc1e",
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
