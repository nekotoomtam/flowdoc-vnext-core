import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import type { FlowDocCanonicalReportLineBreakingBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportLineBreaking.js"
import {
  createFlowDocCanonicalReportMeasuredCompositionBundleV1,
  createFlowDocCanonicalReportMeasuredCompositionPlanV1,
  validateFlowDocCanonicalReportMeasuredCompositionBundleV1,
  type FlowDocCanonicalReportMeasuredCompositionBundleV1,
  type FlowDocCanonicalReportMeasuredCompositionSourceInputV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportMeasuredComposition.js"
import type { FlowDocCanonicalReportNativeShapingBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportNativeShaping.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportTableProjection.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

const INPUT: FlowDocCanonicalReportMeasuredCompositionSourceInputV1 = {
  projection: readJson<FlowDocCanonicalReportTableProjectionBundleV1>(
    "fixtures/pdf-pilot-canonical-report-table-projection.v1.json",
  ),
  nativeShaping: readJson<FlowDocCanonicalReportNativeShapingBundleV1>(
    "fixtures/pdf-pilot-canonical-report-native-shaping.v1.json",
  ),
  lineBreaking: readJson<FlowDocCanonicalReportLineBreakingBundleV1>(
    "fixtures/pdf-pilot-canonical-report-line-breaking.v1.json",
  ),
}
const BUNDLE = readJson<FlowDocCanonicalReportMeasuredCompositionBundleV1>(
  "fixtures/pdf-pilot-canonical-report-measured-composition.v1.json",
)

function validate(
  value: unknown,
  input: FlowDocCanonicalReportMeasuredCompositionSourceInputV1 = INPUT,
) {
  return validateFlowDocCanonicalReportMeasuredCompositionBundleV1(value, input)
}

describe("PDF-PILOT-08B-R2C-F canonical report measured composition", () => {
  it("pins complete Core acceptance and natural composition evidence", () => {
    expect(validate(BUNDLE)).toEqual({ status: "valid", issues: [], summary: BUNDLE.summary })
    expect(BUNDLE).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-F",
      sourceProjectionFingerprint: "c44832960277c9e7cdfed60f4a3ec9638b0ca78b4860e77455f16d0633ad7850",
      sourceNativeShapingFingerprint: "d86f7f0eb9954cedcb8dd9bfc4b850feaf88ac61a406a1e11a8f5c9d186c093a",
      sourceLineBreakingFingerprint: "2f4dee43082a5305d222d1e5a0eb5c7aec4a33fc1f98a9756ecbb2104282b13d",
      planFingerprint: "5e41a708dcc6333a28bd25ed19ab78366508c64c1e4bf3dc991fc11c07df3675",
      bundleFingerprint: "1c988eca85984869c8be8b1f5af9a763cc72fa01b66f1da7cb1c046cfb7ad854",
      summary: {
        sourceConsumerCount: 794,
        coreAcceptedConsumerCount: 794,
        coreAcceptedLineCount: 852,
        documentBlockCount: 177,
        documentBlockLineCount: 183,
        fixedImageBlockCount: 5,
        preparedTableCount: 15,
        preparedRowCount: 146,
        preparedCellCount: 617,
        tableTextLineCandidateCount: 669,
        multiLineTableCellCount: 50,
        emptyLineTableCellCount: 1,
        flowNodeCount: 209,
        readyFlowNodeCount: 197,
        deferredGeneratedFlowNodeCount: 12,
        bodyReadyFlowNodeCount: 185,
        headerReadyFlowNodeCount: 12,
        footerDeferredFlowNodeCount: 12,
        naturalDocumentBlockHeightPt: 2773,
        naturalFixedImageHeightPt: 1182.047243,
        naturalTableHeightPt: 3295,
        naturalReadyFlowHeightWithoutSpacingPt: 7250.047243,
        minimumNaturalRowHeightPt: 19,
        maximumNaturalRowHeightPt: 41,
      },
    })
  }, 60_000)

  it("accepts every concrete consumer through Core and retains safe document source ranges", () => {
    expect(BUNDLE.coreAcceptedConsumers).toHaveLength(794)
    expect(new Set(BUNDLE.coreAcceptedConsumers.map((item) => item.consumerId)).size).toBe(794)
    expect(BUNDLE.coreAcceptedConsumers.every((item) => item.coreStatus === "accepted")).toBe(true)
    expect(BUNDLE.documentBlocks).toHaveLength(177)
    for (const block of BUNDLE.documentBlocks) {
      expect(block.measured.status).toBe("accepted")
      expect(block.naturalHeightPt).toBe(block.measured.summary.totalHeightPt)
      expect(block.measured.lines).toHaveLength(block.measured.summary.lineCount)
      block.measured.lines.forEach((line, index, lines) => {
        const startRun = block.request.runs.find((run) => run.inlineId === line.sourceStart.inlineId)
        const endRun = block.request.runs.find((run) => run.inlineId === line.sourceEnd.inlineId)
        if (startRun == null || endRun == null) throw new Error(`missing accepted source run: ${block.textBlockId}`)
        expect(line.index).toBe(index)
        expect(line.startOffset).toBe(lines[index - 1]?.endOffset ?? 0)
        expect(line.text).toBe(block.request.renderedText.slice(line.startOffset, line.endOffset))
        expect(line.sourceStart.textBlockId).toBe(block.textBlockId)
        expect(line.sourceEnd.textBlockId).toBe(block.textBlockId)
        expect(line.sourceStart.resolvedOffset).toBe(line.startOffset - startRun.renderStartOffset)
        expect(line.sourceEnd.resolvedOffset).toBe(line.endOffset - endRun.renderStartOffset)
        expect(line.sourceStart.affinity).toBe("forward")
        expect(line.sourceEnd.affinity).toBe("backward")
      })
      expect(block.measured.lines.at(-1)?.endOffset).toBe(block.request.renderedText.length)
    }
  })

  it("derives the five fixed instance-media frames without inventing layout coordinates", () => {
    expect(BUNDLE.fixedImageBlocks.map((image) => ({
      sectionId: image.sectionId,
      assetId: image.assetId,
      widthPt: image.widthPt,
      heightPt: image.heightPt,
      fit: image.fit,
      align: image.align,
    }))).toEqual([
      { sectionId: "section-cover", assetId: "source-evidence-image", widthPt: 467.95, heightPt: 297.637795, fit: "contain", align: "center" },
      { sectionId: "section-ocr-accuracy", assetId: "ocr-accuracy-image", widthPt: 467.95, heightPt: 221.102362, fit: "contain", align: "center" },
      { sectionId: "section-native-extraction", assetId: "native-extraction-image", widthPt: 467.95, heightPt: 221.102362, fit: "contain", align: "center" },
      { sectionId: "section-latency-cost-size", assetId: "latency-rounds-image", widthPt: 467.95, heightPt: 221.102362, fit: "contain", align: "center" },
      { sectionId: "section-mapping", assetId: "mapping-gap-image", widthPt: 467.95, heightPt: 221.102362, fit: "contain", align: "center" },
    ])
    expect(BUNDLE.fixedImageBlocks.every((image) => (
      image.assetOwner === "instance-media" && image.naturalHeightPt === image.heightPt
    ))).toBe(true)
  })

  it("prepares all table rows with Core geometry, source ranges, and natural whole-row heights", () => {
    const rows = BUNDLE.preparedTables.flatMap((table) => table.preparedRows.rows)
    const naturalRows = BUNDLE.preparedTables.flatMap((table) => table.naturalRows)
    expect(rows).toHaveLength(146)
    expect(rows.flatMap((row) => row.cells)).toHaveLength(617)
    expect(naturalRows).toHaveLength(146)
    expect(rows.filter((row) => row.role === "header")).toHaveLength(15)
    expect(rows.filter((row) => row.role === "body")).toHaveLength(131)
    for (const table of BUNDLE.preparedTables) {
      expect(table.preparedRows.status).toBe("ready")
      expect(table.naturalRows).toHaveLength(table.preparedRows.rows.length)
      table.preparedRows.rows.forEach((row, rowIndex) => {
        const natural = table.naturalRows[rowIndex]
        expect(natural.naturalWholeRowHeightPt).toBe(Math.max(
          row.minimumFirstFragmentHeightPt,
          row.maximumCellOuterHeightPt,
        ))
        expect(natural.consumerIds).toHaveLength(row.cells.length)
        expect(natural.tallestSourceCellIds).toEqual(row.cells
          .filter((cell) => cell.outerHeightPt === row.maximumCellOuterHeightPt)
          .map((cell) => cell.sourceCellId))
        expect(row.breakPolicy).toBe(row.role === "header" ? "strict-keep" : "prefer-keep")
        for (const cell of row.cells) {
          expect(cell.insetsPt).toEqual({ top: 4, right: 4, bottom: 4, left: 4 })
          expect(cell.verticalAlign).toBe(row.role === "header" ? "middle" : "top")
          expect(cell.outerHeightPt).toBe(cell.contentHeightPt + 8)
          expect(cell.candidates.every((candidate) => (
            candidate.kind !== "text-line"
            || (
              candidate.sourceStart.resolvedOffset <= candidate.sourceEnd.resolvedOffset
              && candidate.sourceStart.textBlockId === candidate.nodeId
              && candidate.sourceEnd.textBlockId === candidate.nodeId
            )
          ))).toBe(true)
        }
      })
    }
  })

  it("inventories authored zone order while explicitly deferring generated page numbers", () => {
    const expectedFlows = INPUT.projection.projectedInstanceDocument.document.sections.flatMap((section) => (
      section.zoneIds.map((zoneId) => {
        const zone = section.nodes[zoneId]
        if (zone?.type !== "zone") throw new Error(`missing test zone: ${section.id}:${zoneId}`)
        return { sectionId: section.id, zoneId, zoneRole: zone.role, childIds: zone.childIds }
      })
    ))
    expect(BUNDLE.zoneFlows).toHaveLength(36)
    expect(BUNDLE.zoneFlows.map((flow) => ({
      sectionId: flow.sectionId,
      zoneId: flow.zoneId,
      zoneRole: flow.zoneRole,
      childIds: flow.entries.map((entry) => entry.nodeId),
    }))).toEqual(expectedFlows)
    expect(BUNDLE.zoneFlows.every((flow) => (
      flow.interBlockSpacing === "not-bound" && flow.coordinates === "not-assigned"
    ))).toBe(true)
    expect(BUNDLE.zoneFlows.filter((flow) => flow.zoneRole === "body").every((flow) => flow.deferredNodeCount === 0)).toBe(true)
    expect(BUNDLE.zoneFlows.filter((flow) => flow.zoneRole === "header").every((flow) => flow.deferredNodeCount === 0)).toBe(true)
    const footerEntries = BUNDLE.zoneFlows
      .filter((flow) => flow.zoneRole === "footer")
      .flatMap((flow) => flow.entries)
    expect(footerEntries).toHaveLength(12)
    expect(footerEntries.every((entry) => (
      entry.kind === "generated-text-deferred"
      && entry.status === "deferred"
      && entry.naturalHeightPt == null
      && entry.evidence.reason === "page-number-requires-generated-expansion"
    ))).toBe(true)
  })

  it("rebuilds deterministically without mutating the accepted source chain", () => {
    const input = clone(INPUT)
    const before = JSON.stringify(input)
    expect(createFlowDocCanonicalReportMeasuredCompositionPlanV1(input).planFingerprint).toBe(
      BUNDLE.planFingerprint,
    )
    expect(createFlowDocCanonicalReportMeasuredCompositionBundleV1(input)).toEqual(BUNDLE)
    expect(JSON.stringify(input)).toBe(before)
  }, 60_000)

  it("fails closed on source, execution, downstream, and composition drift", () => {
    const sourceDrift = clone(INPUT)
    sourceDrift.lineBreaking.bundleFingerprint = "0".repeat(64)
    const sourceResult = validate(BUNDLE, sourceDrift)
    expect(sourceResult.status).toBe("blocked")
    if (sourceResult.status !== "blocked") throw new Error("source drift must block")
    expect(sourceResult.issues.map((item) => item.code)).toContain("invalid-source")

    const executionDrift = clone(BUNDLE)
    ;(executionDrift.execution as any).pagination = "executed"
    const executionResult = validate(executionDrift)
    expect(executionResult.status).toBe("blocked")
    if (executionResult.status !== "blocked") throw new Error("execution drift must block")
    expect(executionResult.issues.map((item) => item.code)).toContain("execution-boundary")

    const downstreamResult = validate({ ...clone(BUNDLE), pages: [] })
    expect(downstreamResult.status).toBe("blocked")
    if (downstreamResult.status !== "blocked") throw new Error("downstream fact must block")
    expect(downstreamResult.issues.map((item) => item.code)).toContain("downstream-fact")

    const rowDrift = clone(BUNDLE)
    rowDrift.preparedTables[0].naturalRows[0].naturalWholeRowHeightPt += 1
    rowDrift.bundleFingerprint = "0".repeat(64)
    const rowResult = validate(rowDrift)
    expect(rowResult.status).toBe("blocked")
    if (rowResult.status !== "blocked") throw new Error("row drift must block")
    expect(rowResult.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "bundle-fingerprint",
      "canonical-bundle-drift",
    ]))
    expect(validate(null)).toMatchObject({ status: "blocked", issues: [{ code: "invalid-bundle-shape" }] })
  }, 60_000)

  it("retains QA, package, and phase evidence while blocking placement claims", () => {
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-measured-composition-qa.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_MEASURED_COMPOSITION_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageReadme = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/README.md",
    ), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")
    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-F",
      status: "accepted-natural-block-and-prepared-table-row-evidence-only",
      bundleFingerprint: BUNDLE.bundleFingerprint,
      summary: BUNDLE.summary,
      executionGate: {
        status: "natural-composition-evidence-accepted-vertical-placement-blocked",
        everyConsumerAcceptedByCore: true,
        documentBlocksMeasured: true,
        fixedImageFramesDerived: true,
        tableTextFragmentsAccepted: true,
        tableCellsPrepared: true,
        tableRowsPrepared: true,
        orderedZoneFlowInventoried: true,
        interBlockSpacingBound: false,
        coordinatesAssigned: false,
        paginationExecuted: false,
        pdfRendered: false,
      },
      boundary: {
        coreMeasuredLineAcceptance: "accepted",
        tableRows: "prepared",
        zoneFlowOrder: "inventoried",
        verticalPlacement: "not-run",
        pagination: "not-run",
      },
      nextPhase: "PDF-PILOT-08B-R2C-G vertical flow spacing and page-capacity composition",
    })
    expect(qa.byZone).toHaveLength(36)
    expect(qa.byTable).toHaveLength(15)
    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-F natural composition evidence accepted.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-F Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-F Measured Composition")
    expect(readme).toContain("PDF canonical report measured composition")
    expect(packageReadme).toContain("Measured Composition Evidence")
    expect(packageJson.scripts["build:report-measured-composition"]).toBe(
      "node scripts/build-canonical-report-measured-composition.mjs",
    )
  })
})
