import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import type { FlowDocCanonicalReportDataBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportDataAdapter.js"
import type { FlowDocCanonicalReportDisplayFormattingBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportDisplayFormatting.js"
import {
  createFlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  validateFlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  type FlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  type FlowDocFontAssetManifestV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportMeasurementRequestHandoff.js"
import type { FlowDocCanonicalReportTemplateResolutionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportTemplateResolution.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

const DATA_BUNDLE = readJson<FlowDocCanonicalReportDataBundleV1>(
  "fixtures/pdf-pilot-canonical-report-data-bundle.v1.json",
)
const TEMPLATE_BUNDLE = readJson<FlowDocCanonicalReportTemplateResolutionBundleV1>(
  "fixtures/pdf-pilot-canonical-report-template-resolution.v1.json",
)
const FORMATTING_BUNDLE = readJson<FlowDocCanonicalReportDisplayFormattingBundleV1>(
  "fixtures/pdf-pilot-canonical-report-display-formatting.v1.json",
)
const FONT_MANIFEST = readJson<FlowDocFontAssetManifestV1>("assets/fonts/font-assets.v1.json")
const HANDOFF_BUNDLE = readJson<FlowDocCanonicalReportMeasurementRequestHandoffBundleV1>(
  "fixtures/pdf-pilot-canonical-report-measurement-handoff.v1.json",
)

function validate(value: unknown) {
  return validateFlowDocCanonicalReportMeasurementRequestHandoffBundleV1(
    value,
    DATA_BUNDLE,
    TEMPLATE_BUNDLE,
    FORMATTING_BUNDLE,
    FONT_MANIFEST,
  )
}

describe("PDF-PILOT-08B-R2C-B canonical report measurement-request handoff", () => {
  it("pins the IBM Plex profile, Letter widths, table geometry, and complete request lanes", () => {
    expect(validate(HANDOFF_BUNDLE)).toEqual({
      status: "valid",
      issues: [],
      summary: HANDOFF_BUNDLE.summary,
    })
    expect(HANDOFF_BUNDLE).toMatchObject({
      sourceDataBundleFingerprint: DATA_BUNDLE.bundleFingerprint,
      sourceTemplateBundleFingerprint: TEMPLATE_BUNDLE.bundleFingerprint,
      sourceFormattingBundleFingerprint: FORMATTING_BUNDLE.bundleFingerprint,
      bundleFingerprint: "1a2868d58fb52e62ae6d6a1002460ba81bd019b57b1d328828a89c41ef73a84f",
      pageGeometry: {
        pageSize: "Letter",
        orientation: "portrait",
        widthPt: 612,
        heightPt: 792,
        sections: expect.arrayContaining([expect.objectContaining({ bodyWidthPt: 498.614173 })]),
      },
      tableLayoutProfile: {
        layoutProfileId: "ocr-benchmark-report-table-layout-v1",
        defaultInsetsPt: { top: 4, right: 4, bottom: 4, left: 4 },
      },
      summary: {
        semanticSectionCount: 12,
        tableCount: 6,
        tableCellGeometryCount: 126,
        documentRequestCount: 162,
        authoredTableRequestCount: 63,
        materializedTableRequestCount: 476,
        totalReadyRequestCount: 701,
        generatedInlineDeferredBlockCount: 12,
        formattedDocumentBindingCount: 136,
        formattedCollectionBindingCount: 476,
        measurementProfileFontCount: 2,
        measurementProfileStyleMappingCount: 6,
        minimumCellContentWidthPt: 15.622047,
        maximumCellContentWidthPt: 240.031496,
      },
    })
    expect(HANDOFF_BUNDLE.measurementProfile).toMatchObject({
      status: "stable",
      summary: { fontAssetCount: 2, styleMappingCount: 6 },
      ingredients: {
        fontAssets: [
          { fontId: "ibm-plex-sans-thai-regular", sha256: `sha256-${"bdf527758ba47d68d42c104b9167cb15660e88a16b40136504a7ea8c56792b57"}` },
          { fontId: "ibm-plex-sans-thai-bold", sha256: `sha256-${"ba5e62ecf0d5f19338b6d34360bce097d29fe56142eec5f612f2d7dd91c6bf21"}` },
        ],
        shaper: { engine: "rustybuzz", revision: "0.20.1" },
        segmenter: { engine: "icu4x", revision: "icu4x-planned", dataRevision: "icu4x-data-planned" },
      },
    })
    expect(new Set([
      ...HANDOFF_BUNDLE.documentRequests.map((item) => item.request.measurementProfileId),
      ...HANDOFF_BUNDLE.collectionTables.flatMap((table) => [
        ...Object.values(table.authoredPreparation.requestsByTextBlockId).map((item) => item.request.measurementProfileId),
        ...Object.values(table.materializedPreparation.requestsByTextBlockId).map((item) => item.request.measurementProfileId),
      ]),
    ])).toEqual(new Set([HANDOFF_BUNDLE.measurementProfile.measurementProfileId]))
  })

  it("projects formatted display text without changing request identities or source values", () => {
    const documentRequest = HANDOFF_BUNDLE.documentRequests.find(
      (item) => item.textBlockId === "latency-cost-size-field-engine-azure-document-intelligence-latency-ms-max",
    )
    expect(documentRequest).toMatchObject({
      sectionId: "section-latency-cost-size",
      zoneRole: "body",
      displayBindingInlineIds: ["latency-cost-size-field-engine-azure-document-intelligence-latency-ms-max-value"],
      request: {
        availableWidthPt: 498.614173,
        styleKey: "report-body",
        renderedText: "azure_document_intelligence Maximum latency ms: 6.50 วินาที",
      },
    })
    expect(documentRequest?.request.runs.at(-1)).toMatchObject({
      kind: "resolved-field",
      fieldKey: "report.engine.azure_document_intelligence.latency_ms.max",
      renderedText: "6.50 วินาที",
    })

    const ocrTable = HANDOFF_BUNDLE.collectionTables.find(
      (table) => table.collectionFieldKey === "report.ocr_runs",
    )
    if (ocrTable == null) throw new Error("OCR table handoff missing")
    const formattedLatency = Object.values(ocrTable.materializedPreparation.requestsByTextBlockId).find(
      (item) => item.request.renderedText === "2.09 วินาที",
    )
    expect(formattedLatency).toMatchObject({
      rowIdentity: { kind: "resolved-row" },
      cellIdentity: { kind: "resolved-cell" },
      sourceCellId: "table-ocr-runs-body-cell-latency-ms",
      request: {
        availableWidthPt: 18.108579,
        styleKey: "table-body",
        renderedText: "2.09 วินาที",
      },
    })
    expect(ocrTable.authoredPreparation.requestsByTextBlockId["table-ocr-runs-header-cell-engine-text"])
      .toMatchObject({
        rowIdentity: { kind: "authored-row", sourceRowId: "table-ocr-runs-header-row" },
        request: { availableWidthPt: 18.108579, styleKey: "table-header", renderedText: "Engine" },
      })
    const sourceTable = TEMPLATE_BUNDLE.collectionTables.find(
      (table) => table.collectionFieldKey === "report.ocr_runs",
    )
    expect(sourceTable?.materializedContent.bindings.text.find(
      (binding) => binding.resolvedPlacementId === formattedLatency?.request.runs[0]?.inlineId,
    )?.value).toBe("2086.849199999124")
    expect(ocrTable.rawMaterializationFingerprint).not.toBe(ocrTable.displayMaterializationFingerprint)
  })

  it("defers generated page numbers and makes downstream execution boundaries explicit", () => {
    expect(HANDOFF_BUNDLE.generatedInlineDeferrals).toHaveLength(12)
    expect(HANDOFF_BUNDLE.generatedInlineDeferrals.every((item) => (
      item.zoneRole === "footer"
      && item.reason === "page-number-requires-generated-expansion"
      && item.measurement === "not-run"
    ))).toBe(true)
    expect(HANDOFF_BUNDLE.execution).toEqual({
      localeDisplayFormatting: "consumed",
      measurementProfileIdentity: "stable",
      tableGeometry: "prepared",
      measurementRequests: "prepared",
      textShaping: "not-run",
      lineBreaking: "not-run",
      lineBoxes: "not-run",
      layout: "not-run",
      pagination: "not-run",
      pdfRendering: "not-run",
    })
    expect(HANDOFF_BUNDLE.documentRequests.some(
      (item) => item.request.runs.some((run) => run.inlineId.endsWith("-page")),
    )).toBe(false)
  })

  it("builds deterministically without mutating R2A, R2B, or R2C-A sources", () => {
    const sources = [clone(DATA_BUNDLE), clone(TEMPLATE_BUNDLE), clone(FORMATTING_BUNDLE)] as const
    const before = sources.map((source) => JSON.stringify(source))
    const rebuilt = createFlowDocCanonicalReportMeasurementRequestHandoffBundleV1(
      sources[0],
      sources[1],
      sources[2],
      FONT_MANIFEST,
    )
    expect(rebuilt).toEqual(HANDOFF_BUNDLE)
    expect(sources.map((source) => JSON.stringify(source))).toEqual(before)
  }, 60_000)

  it("fails closed on source, profile, execution, downstream, and fingerprint drift", () => {
    const sourceDrift = clone(HANDOFF_BUNDLE)
    sourceDrift.sourceFormattingBundleFingerprint = "0".repeat(64)
    expect(validate(sourceDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "source-formatting-fingerprint" })],
    })

    const executionDrift = clone(HANDOFF_BUNDLE)
    ;(executionDrift.execution as any).textShaping = "measured"
    expect(validate(executionDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "execution-boundary" })],
    })

    const downstream = { ...clone(HANDOFF_BUNDLE), lines: [] }
    expect(validate(downstream)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "downstream-fact" })],
    })

    const profileDrift = clone(HANDOFF_BUNDLE)
    profileDrift.measurementProfile.ingredients.fontAssets[0].sha256 = `sha256-${"0".repeat(64)}`
    profileDrift.bundleFingerprint = "0".repeat(64)
    const profileResult = validate(profileDrift)
    expect(profileResult.status).toBe("blocked")
    if (profileResult.status !== "blocked") throw new Error("profile drift must block")
    expect(profileResult.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "bundle-fingerprint",
      "canonical-bundle-drift",
    ]))

    expect(validate(null)).toMatchObject({ status: "blocked", issues: [{ code: "invalid-bundle-shape" }] })
  }, 30_000)

  it("retains QA and phase evidence while gating wide-table engine execution", () => {
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-measurement-handoff-qa.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_MEASUREMENT_HANDOFF_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")
    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-B",
      status: "accepted",
      bundleFingerprint: HANDOFF_BUNDLE.bundleFingerprint,
      summary: HANDOFF_BUNDLE.summary,
      executionGate: {
        status: "table-template-revision-required-before-report-wide-measurement",
        handoffAccepted: true,
        textEngineExecuted: false,
      },
      boundary: { textShaping: "not-run", lineBreaking: "not-run", pagination: "not-run" },
      nextPhase: "PDF-PILOT-08B-R2C-C report table projection and geometry correction",
    })
    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-B measurement-request handoff accepted.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-B Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-B Measurement Request And Table Geometry Handoff")
    expect(readme).toContain("PDF canonical report measurement-request handoff")
    expect(packageJson.scripts["build:report-measurement-handoff"]).toBe(
      "node scripts/build-canonical-report-measurement-handoff.mjs",
    )
  })
})
