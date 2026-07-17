import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import type { FlowDocCanonicalReportDataBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportDataAdapter.js"
import type { FlowDocCanonicalReportDisplayFormattingBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportDisplayFormatting.js"
import type {
  FlowDocCanonicalReportMeasurementRequestHandoffBundleV1,
  FlowDocFontAssetManifestV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportMeasurementRequestHandoff.js"
import {
  createFlowDocCanonicalReportTableProjectionBundleV1,
  validateFlowDocCanonicalReportTableProjectionBundleV1,
  type FlowDocCanonicalReportTableProjectionBundleV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportTableProjection.js"
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
const MEASUREMENT_HANDOFF = readJson<FlowDocCanonicalReportMeasurementRequestHandoffBundleV1>(
  "fixtures/pdf-pilot-canonical-report-measurement-handoff.v1.json",
)
const FONT_MANIFEST = readJson<FlowDocFontAssetManifestV1>("assets/fonts/font-assets.v1.json")
const PROJECTION_BUNDLE = readJson<FlowDocCanonicalReportTableProjectionBundleV1>(
  "fixtures/pdf-pilot-canonical-report-table-projection.v1.json",
)

function validate(value: unknown) {
  return validateFlowDocCanonicalReportTableProjectionBundleV1(
    value,
    DATA_BUNDLE,
    TEMPLATE_BUNDLE,
    FORMATTING_BUNDLE,
    MEASUREMENT_HANDOFF,
    FONT_MANIFEST,
  )
}

describe("PDF-PILOT-08B-R2C-C canonical report table projection", () => {
  it("pins the accepted source chain and complete projected request handoff", () => {
    expect(validate(PROJECTION_BUNDLE)).toEqual({
      status: "valid",
      issues: [],
      summary: PROJECTION_BUNDLE.summary,
    })
    expect(PROJECTION_BUNDLE).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-C",
      sourceDataBundleFingerprint: "ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d",
      sourceTemplateBundleFingerprint: "0898dea47c83f70eb93682ece5628b42f96af669ee302a8ca74f2f02001e9623",
      sourceFormattingBundleFingerprint: "0e03c8a280714fd291ae73c9775125f06f91c9e3f1eca72739d9e923346fe809",
      sourceMeasurementHandoffFingerprint: "9ace7bf4ad5d0e3866d5d12b826c30c776e0313c8afffa08d95f3c916f4bcb74",
      projectionContractFingerprint: "8038892b0919734eccff3ec46feade4cde03e9e5cddd2134197aef4b93bdeeb4",
      bundleFingerprint: "c44832960277c9e7cdfed60f4a3ec9638b0ca78b4860e77455f16d0633ad7850",
      summary: {
        sourceCollectionCount: 6,
        sourceItemFieldCount: 63,
        sourceCollectionRowCount: 73,
        projectionTableCount: 15,
        projectionPrimaryColumnCount: 63,
        projectionContextColumnCount: 10,
        projectionColumnCount: 73,
        maximumProjectedColumnCount: 6,
        projectedCollectionRowCount: 131,
        projectedItemBindingCount: 544,
        tableCellGeometryCount: 146,
        documentRequestCount: 177,
        projectionTitleRequestCount: 15,
        authoredTableRequestCount: 73,
        materializedTableRequestCount: 544,
        totalReadyRequestCount: 794,
        generatedInlineDeferredBlockCount: 12,
        minimumCellContentWidthPt: 38.795,
        maximumCellContentWidthPt: 319.565,
        sourceMinimumCellContentWidthPt: 14.283333,
      },
    })
  }, 60_000)

  it("gives every source field one primary placement and constrains every view geometry", () => {
    const projectedCollections = new Map(PROJECTION_BUNDLE.projectionContract.collections.map((item) => (
      [item.collectionFieldKey, item]
    )))
    for (const [collectionFieldKey, sourceShape] of Object.entries(
      DATA_BUNDLE.collectionItemContract.collections,
    )) {
      const projection = projectedCollections.get(collectionFieldKey)
      expect(projection, collectionFieldKey).toBeDefined()
      const columns = projection!.views.flatMap((view) => view.columns)
      expect(columns.filter((column) => column.coverageRole === "primary").map((column) => column.fieldKey).sort())
        .toEqual(Object.keys(sourceShape.fields).sort())
      expect(columns.filter((column) => column.coverageRole === "context").every((context) => (
        columns.some((primary) => primary.fieldKey === context.fieldKey && primary.coverageRole === "primary")
      ))).toBe(true)
      for (const view of projection!.views) {
        expect(view.columns.length, view.projectionId).toBeLessThanOrEqual(6)
        expect(view.columns.reduce((total, column) => total + column.widthShare, 0), view.projectionId).toBe(100)
        expect(Math.min(...view.columns.map((column) => column.widthShare)), view.projectionId)
          .toBeGreaterThanOrEqual(10)
      }
    }
    expect(projectedCollections.size).toBe(6)
    expect(PROJECTION_BUNDLE.projectionContract.requirements.sourceCollectionContractMutation).toBe(false)
  })

  it("replaces six exhaustive tables with fifteen labelled views and preserves all resolved rows", () => {
    const projectedTableIds = PROJECTION_BUNDLE.projectedTables.map((table) => table.resolution.definition.tableId)
    expect(new Set(projectedTableIds).size).toBe(15)
    expect(PROJECTION_BUNDLE.documentRequests.filter((item) => item.projectionTitle).map((item) => item.textBlockId))
      .toHaveLength(15)
    expect(PROJECTION_BUNDLE.projectedTables.flatMap((table) => table.resolution.resolvedRows.rows)
      .filter((row) => row.source.kind === "collection-row")).toHaveLength(131)

    const nodes = PROJECTION_BUNDLE.projectedInstanceDocument.document.sections.flatMap((section) => (
      Object.values(section.nodes)
    ))
    expect(nodes.filter((node) => node.type === "table").map((node) => node.id).sort())
      .toEqual([...projectedTableIds].sort())
    const sourceTableIds = TEMPLATE_BUNDLE.collectionTables.map((table) => table.definition.tableId)
    expect(nodes.some((node) => sourceTableIds.includes(node.id))).toBe(false)
  })

  it("uses explicit widths and the R2C-A display overlay without changing raw source values", () => {
    const mapping = PROJECTION_BUNDLE.projectedTables.find((table) => table.projectionId === "mapping-comparison")
    expect(mapping?.columns).toEqual([
      { fieldKey: "engine", headerLabel: "Engine", widthShare: 14, coverageRole: "primary" },
      { fieldKey: "schema_path", headerLabel: "Schema path", widthShare: 28, coverageRole: "primary" },
      { fieldKey: "expected_value_text", headerLabel: "ค่าที่คาดหวัง", widthShare: 22, coverageRole: "primary" },
      { fieldKey: "value_text", headerLabel: "ค่าที่ Mapping", widthShare: 22, coverageRole: "primary" },
      { fieldKey: "correct", headerLabel: "ถูกต้อง", widthShare: 14, coverageRole: "primary" },
    ])
    const mappingMeasurement = PROJECTION_BUNDLE.tableMeasurements.find(
      (table) => table.projectionId === "mapping-comparison",
    )
    expect(mappingMeasurement).toMatchObject({
      tableContentWidthPt: 467.95,
      formattedBindingCount: 50,
      authoredPreparation: { work: { textMeasurementRequestCount: 5 } },
      materializedPreparation: { work: { textMeasurementRequestCount: 50 } },
    })
    const correct = Object.values(mappingMeasurement!.materializedPreparation.requestsByTextBlockId).find(
      (item) => item.request.runs[0]?.fieldKey === "correct",
    )
    expect(correct?.request.renderedText).toBe("ใช่")

    const runtime = PROJECTION_BUNDLE.tableMeasurements.find((table) => table.projectionId === "ocr-runtime-cost")
    const latency = Object.values(runtime!.materializedPreparation.requestsByTextBlockId).find(
      (item) => item.request.renderedText === "2.09 วินาที",
    )
    expect(latency).toMatchObject({
      sourceCellId: "table-ocr-runs-ocr-runtime-cost-body-cell-latency-ms",
      request: { availableWidthPt: 85.59, styleKey: "table-body" },
    })
    expect(DATA_BUNDLE.collectionSnapshot.collections["report.ocr_runs"].items.some((item) => (
      item.values.latency_ms === 2086.849199999124
    ))).toBe(true)
  })

  it("builds deterministically without mutating R2A through R2C-B sources", () => {
    const sources = [
      clone(DATA_BUNDLE),
      clone(TEMPLATE_BUNDLE),
      clone(FORMATTING_BUNDLE),
      clone(MEASUREMENT_HANDOFF),
      clone(FONT_MANIFEST),
    ] as const
    const before = sources.map((source) => JSON.stringify(source))
    const rebuilt = createFlowDocCanonicalReportTableProjectionBundleV1(
      sources[0],
      sources[1],
      sources[2],
      sources[3],
      sources[4],
    )
    expect(rebuilt).toEqual(PROJECTION_BUNDLE)
    expect(sources.map((source) => JSON.stringify(source))).toEqual(before)
  }, 60_000)

  it("fails closed on source, execution, downstream, contract, and fingerprint drift", () => {
    const sourceDrift = clone(PROJECTION_BUNDLE)
    sourceDrift.sourceMeasurementHandoffFingerprint = "0".repeat(64)
    expect(validate(sourceDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "source-measurement-fingerprint" })],
    })

    const executionDrift = clone(PROJECTION_BUNDLE)
    ;(executionDrift.execution as any).textShaping = "measured"
    expect(validate(executionDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "execution-boundary" })],
    })

    const downstream = { ...clone(PROJECTION_BUNDLE), pages: [] }
    expect(validate(downstream)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "downstream-fact" })],
    })

    const contractDrift = clone(PROJECTION_BUNDLE)
    contractDrift.projectionContract.collections[0].views[0].columns[0].widthShare = 15
    contractDrift.bundleFingerprint = "0".repeat(64)
    const contractResult = validate(contractDrift)
    expect(contractResult.status).toBe("blocked")
    if (contractResult.status !== "blocked") throw new Error("projection contract drift must block")
    expect(contractResult.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "bundle-fingerprint",
      "canonical-bundle-drift",
    ]))

    expect(validate(null)).toMatchObject({ status: "blocked", issues: [{ code: "invalid-bundle-shape" }] })
  }, 60_000)

  it("retains QA, package, and phase evidence for the text-engine handoff", () => {
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-table-projection-qa.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_TABLE_PROJECTION_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")
    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-C",
      status: "accepted",
      bundleFingerprint: PROJECTION_BUNDLE.bundleFingerprint,
      summary: PROJECTION_BUNDLE.summary,
      geometryGate: {
        status: "accepted-ready-for-text-engine-binding",
        sourceTableCount: 6,
        projectedTableCount: 15,
        sourceMaximumColumnCount: 21,
        projectedMaximumColumnCount: 6,
        tableWidthPt: 467.95,
        sourceMinimumCellContentWidthPt: 14.283333,
        projectedMinimumCellContentWidthPt: 38.795,
        sourceCollectionContractMutation: false,
      },
      boundary: { textShaping: "not-run", lineBreaking: "not-run", pagination: "not-run" },
      nextPhase: "PDF-PILOT-08B-R2C-D text-engine profile binding and execution boundary",
    })
    expect(qa.projections.map((projection: { tableId: string }) => projection.tableId))
      .toEqual(PROJECTION_BUNDLE.projectedTables.map((table) => table.resolution.definition.tableId))
    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-C table projection accepted.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-C Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-C Report Table Projection And Geometry Correction")
    expect(readme).toContain("PDF canonical report table projection")
    expect(packageJson.scripts["build:report-table-projection"]).toBe(
      "node scripts/build-canonical-report-table-projection.mjs",
    )
  })
})
