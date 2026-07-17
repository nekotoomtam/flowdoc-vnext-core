import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

const EVIDENCE = readJson<any>(
  "packages/pdf-renderer-pilot/fixtures/generic-box-cross-reader-compatibility.v1.json",
)
const GENERIC_REQUEST = readJson<any>("fixtures/pdf-pilot-thai-one-page-request.v1.json")
const GENERIC_SUMMARY = readJson<any>(
  "packages/pdf-renderer-pilot/fixtures/one-page-proof-summary.v1.json",
)
const CANONICAL_BUNDLE = readJson<any>(
  "fixtures/pdf-pilot-canonical-report-body-display-list.v1.json",
)
const CANONICAL_SUMMARY = readJson<any>(
  "packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json",
)

describe("PDF-PILOT-08B-R2C-R generic box and cross-reader audit", () => {
  it("pins two independent artifacts and two independent reader families", () => {
    expect(EVIDENCE).toMatchObject({
      evidenceVersion: 1,
      evidenceId: "pdf-pilot-08b-r2c-r-generic-box-cross-reader-compatibility-v1",
      phaseId: "PDF-PILOT-08B-R2C-R",
      status: "accepted-generic-paint-boundary-cross-reader-baseline",
      scope: {
        dpi: 96,
        independentEngineFamilyRequirement: 2,
        contractEdgeTolerancePx: 2,
        readerEdgeTolerancePx: 1,
        pixelParityApplicable: false,
      },
    })
    expect(EVIDENCE.readerCoverage.exercised.map((reader: any) => reader.engineFamily)).toEqual([
      "Poppler",
      "PDFium",
    ])
    expect(new Set(EVIDENCE.readerCoverage.exercised.map((reader: any) => reader.engineFamily)).size).toBe(2)
    expect(EVIDENCE.artifacts.map((artifact: any) => artifact.artifactId)).toEqual([
      "generic-thai-panel",
      "canonical-report-callouts",
    ])
    expect(JSON.stringify(EVIDENCE)).not.toMatch(/[A-Z]:\\Users\\/u)
  })

  it("proves generic fill and stroke primitives outside the canonical report", () => {
    const panelPaints = GENERIC_REQUEST.paintCommands.filter(
      (command: any) => command.sourceCommandId === "pdf:pilot:panel",
    )
    expect(panelPaints.map((command: any) => command.kind)).toEqual(["fill-rect", "stroke-rect"])
    expect(panelPaints[0].bounds).toEqual(panelPaints[1].bounds)

    const artifact = EVIDENCE.artifacts[0]
    expect(artifact).toMatchObject({
      sha256: GENERIC_SUMMARY.artifact.sha256,
      bytes: GENERIC_SUMMARY.artifact.byteLength,
      expectedPageCount: 1,
      selectedPageNumbers: [1],
      allSelectedPagesNonblank: true,
      allTextSentinelsAccepted: true,
      allBoxRegionsAccepted: true,
    })
    expect(artifact.regions).toEqual([
      expect.objectContaining({
        regionId: "generic-panel-fill-and-stroke",
        semanticOwner: "independent-one-page-panel",
        pageNumber: 1,
        boundsPt: panelPaints[0].bounds,
        paintKinds: ["fill-rect", "stroke-rect"],
        accepted: true,
      }),
    ])
  })

  it("keeps all measured canonical callout fragments inside the reader tolerance", () => {
    const expectedFragments = CANONICAL_BUNDLE.calloutGroups.flatMap((group: any) => (
      group.fragments.map((fragment: any) => ({
        regionId: fragment.fragmentId,
        pageNumber: fragment.pageNumber,
        boundsPt: fragment.bounds,
      }))
    ))
    const artifact = EVIDENCE.artifacts[1]
    expect(artifact).toMatchObject({
      sha256: CANONICAL_SUMMARY.artifact.sha256,
      bytes: CANONICAL_SUMMARY.artifact.byteLength,
      expectedPageCount: 13,
      selectedPageNumbers: [1, 2, 10],
      allSelectedPagesNonblank: true,
      allTextSentinelsAccepted: true,
      allBoxRegionsAccepted: true,
    })
    expect(artifact.regions.map((region: any) => ({
      regionId: region.regionId,
      pageNumber: region.pageNumber,
      boundsPt: region.boundsPt,
    }))).toEqual(expectedFragments)
    artifact.regions.forEach((region: any) => {
      expect(region.maxContractEdgeDeltaPx).toBeLessThanOrEqual(2)
      expect(region.maxReaderEdgeDeltaPx).toBeLessThanOrEqual(1)
      expect(region.accepted).toBe(true)
    })
  })

  it("accepts reader compatibility without claiming pixel or production parity", () => {
    EVIDENCE.artifacts.forEach((artifact: any) => {
      expect(artifact.readerResults).toHaveLength(2)
      artifact.readerResults.forEach((reader: any) => {
        expect(reader.pageCount).toBe(artifact.expectedPageCount)
        reader.selectedPages.forEach((page: any) => {
          expect(page).toMatchObject({
            pixelWidth: 816,
            pixelHeight: 1056,
            mode: "RGB",
            nonBlank: true,
            allSentinelsAccepted: true,
          })
        })
      })
    })
    expect(EVIDENCE.acceptance).toEqual({
      observedIndependentEngineFamilyCount: 2,
      genericPanelBoundaryAccepted: true,
      canonicalCalloutFragmentsAccepted: true,
      allSelectedPagesNonblank: true,
      allTextSentinelsAccepted: true,
      crossReaderCompatibilityAccepted: true,
    })
    expect(EVIDENCE.decision).toEqual({
      genericRendererPrimitivesAccepted: true,
      canonicalCalloutProjectionGeneric: false,
      reusableAuthoredBoxContractAccepted: false,
      visualFidelityAccepted: false,
      productionBinding: false,
      nextTopic: "PDF-PILOT-08B-R2C-S reusable authored box contract",
    })
  })

  it("publishes the exact generic boundary and leaves authored reuse downstream", () => {
    const schema = readFileSync(resolve(process.cwd(), "src/schema/documentV4Foundation.ts"), "utf8")
    const target = readFileSync(resolve(process.cwd(), "src/schema/documentV4Target.ts"), "utf8")
    const measured = readFileSync(resolve(process.cwd(), "src/renderer/pdfMeasuredDrawContractV1.ts"), "utf8")
    const renderer = readFileSync(resolve(process.cwd(), "packages/pdf-renderer-pilot/src/index.ts"), "utf8")
    const calloutAdapter = readFileSync(resolve(
      process.cwd(),
      "packages/pdf-renderer-pilot/src/canonicalReportBodyDisplayList.ts",
    ), "utf8")
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_GENERIC_BOX_CROSS_READER_AUDIT.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageReadme = readFileSync(
      resolve(process.cwd(), "packages/pdf-renderer-pilot/README.md"),
      "utf8",
    )

    expect(schema).toContain("BoxStyleV4TargetSchema")
    expect(target).toContain("box: BoxStyleV4TargetSchema.optional()")
    expect(measured).toContain("VNextPdfFillRectPaintCommandV1Schema")
    expect(measured).toContain("VNextPdfStrokeRectPaintCommandV1Schema")
    expect(renderer).toContain('command.kind === "fill-rect"')
    expect(renderer).toContain('command.kind === "stroke-rect"')
    expect(calloutAdapter).toContain("function calloutProjection")
    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-R cross-reader baseline accepted")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-R Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-R Generic Box and Cross-Reader Audit")
    expect(readme).toContain("PDF generic box and cross-reader audit")
    expect(packageReadme).toContain("Generic Box and Cross-Reader Audit")
  })
})
