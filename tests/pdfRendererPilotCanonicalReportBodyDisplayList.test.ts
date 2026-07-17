import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createFlowDocCanonicalReportBodyDisplayListBundleV1,
  validateFlowDocCanonicalReportBodyDisplayListBundleV1,
  type FlowDocCanonicalReportBodyDisplayListBundleV1,
  type FlowDocCanonicalReportBodyDisplayListSourceV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportBodyDisplayList.js"
import type { FlowDocCanonicalReportDataBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportDataAdapter.js"
import type { FlowDocCanonicalReportLineBreakingBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportLineBreaking.js"
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportMeasuredComposition.js"
import type {
  FlowDocCanonicalReportNativeShapingBundleV1,
  FlowDocCanonicalReportNativeShapingFontManifestV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportNativeShaping.js"
import type { FlowDocCanonicalReportPaginationExecutionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportPaginationExecution.js"
import type { FlowDocCanonicalReportPaginationInputsBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportPaginationInputs.js"
import type { FlowDocCanonicalReportSectionReconciliationBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportSectionReconciliation.js"
import type { FlowDocCanonicalReportStaticZoneHandoffBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportStaticZoneHandoff.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportTableProjection.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

const SOURCE: FlowDocCanonicalReportBodyDisplayListSourceV1 = {
  data: readJson<FlowDocCanonicalReportDataBundleV1>("fixtures/pdf-pilot-canonical-report-data-bundle.v1.json"),
  projection: readJson<FlowDocCanonicalReportTableProjectionBundleV1>("fixtures/pdf-pilot-canonical-report-table-projection.v1.json"),
  nativeShaping: readJson<FlowDocCanonicalReportNativeShapingBundleV1>("fixtures/pdf-pilot-canonical-report-native-shaping.v1.json"),
  lineBreaking: readJson<FlowDocCanonicalReportLineBreakingBundleV1>("fixtures/pdf-pilot-canonical-report-line-breaking.v1.json"),
  measuredComposition: readJson<FlowDocCanonicalReportMeasuredCompositionBundleV1>("fixtures/pdf-pilot-canonical-report-measured-composition.v1.json"),
  paginationInputs: readJson<FlowDocCanonicalReportPaginationInputsBundleV1>("fixtures/pdf-pilot-canonical-report-pagination-inputs.v1.json"),
  sectionReconciliation: readJson<FlowDocCanonicalReportSectionReconciliationBundleV1>("fixtures/pdf-pilot-canonical-report-section-reconciliation.v1.json"),
  paginationExecution: readJson<FlowDocCanonicalReportPaginationExecutionBundleV1>("fixtures/pdf-pilot-canonical-report-pagination-execution.v1.json"),
  staticZones: readJson<FlowDocCanonicalReportStaticZoneHandoffBundleV1>("fixtures/pdf-pilot-canonical-report-static-zone-handoff.v1.json"),
  fontManifest: readJson<FlowDocCanonicalReportNativeShapingFontManifestV1>("assets/fonts/font-assets.v1.json"),
}
const BUNDLE = readJson<FlowDocCanonicalReportBodyDisplayListBundleV1>(
  "fixtures/pdf-pilot-canonical-report-body-display-list.v1.json",
)

describe("PDF-PILOT-08B-R2C-L canonical report body display list", () => {
  it("accepts complete measured body coverage and the full Core renderer contract", () => {
    expect(validateFlowDocCanonicalReportBodyDisplayListBundleV1(BUNDLE, SOURCE)).toEqual({
      status: "valid",
      issues: [],
      summary: BUNDLE.summary,
    })
    expect(BUNDLE).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-L",
      bundleFingerprint: "32d067a3b17e1c6598711445067877e29f0c609fe0c1d288d2d0e57871f95990",
      bodyDisplayList: { fingerprint: "sha256:74983f6c75fe19ab844fad974587ba90c92edc6a9cdf46676338d435df6cc7d3" },
      rendererHandoff: {
        scope: "full-document-body-plus-static-zones",
        measuredDrawContract: {
          status: "consumable",
          fingerprint: "sha256:cbc4102ce70fe3cceaaad18618211839192177eb787adb75e4bb81224003ae42",
          contracts: { mayRelayout: false },
          issues: [],
        },
      },
      summary: {
        pageCount: 13,
        bodyEntryCount: 173,
        textEntryCount: 153,
        mediaEntryCount: 5,
        tableEntryCount: 15,
        sourceBodyPlacementCount: 178,
        bodyDrawCommandCount: 1745,
        bodyPaintCommandCount: 1745,
        bodyGlyphRunCount: 952,
        bodyImageCount: 5,
        bodyFillRectCount: 92,
        bodyStrokeLineCount: 696,
        structuralReceiptCount: 828,
        emptyTextReceiptCount: 1,
        fullDrawCommandCount: 1771,
        fullPaintCommandCount: 1771,
        fullGlyphRunCount: 978,
        fontAssetCount: 2,
        imageAssetCount: 5,
        missingGlyphCount: 0,
        tableReplayCount: 15,
        tableReplayPageCount: 20,
        fullRendererHandoffConsumable: true,
        pdfRendered: false,
      },
    })
  }, 120_000)

  it("binds every body entry and page command without duplicate paint order", () => {
    expect(BUNDLE.entries).toHaveLength(173)
    expect(new Set(BUNDLE.entries.map((entry) => entry.itemIndex))).toHaveLength(173)
    expect(BUNDLE.entries.reduce((sum, entry) => sum + entry.sourcePlacementCount, 0)).toBe(178)
    expect(BUNDLE.bodyDisplayList.drawCommandIds).toHaveLength(1745)
    expect(BUNDLE.bodyDisplayList.paintCommandIds).toHaveLength(1745)
    expect(new Set(BUNDLE.bodyDisplayList.drawCommandIds)).toHaveLength(1745)
    expect(new Set(BUNDLE.bodyDisplayList.paintCommandIds)).toHaveLength(1745)

    const contract = BUNDLE.rendererHandoff.measuredDrawContract
    expect(contract.pages).toHaveLength(13)
    contract.pages.forEach((page) => {
      expect(page.commands[0]).toMatchObject({ kind: "glyph-run", paintOrder: 0 })
      expect(page.commands[1]).toMatchObject({ kind: "glyph-run", paintOrder: 1 })
      expect(page.commands.map((command) => command.paintOrder)).toEqual(
        Array.from({ length: page.commands.length }, (_, index) => index),
      )
      expect(page.commands.every((command) => (
        command.bounds.xPt + command.bounds.widthPt <= page.widthPt
        && command.bounds.yPt + command.bounds.heightPt <= page.heightPt
      ))).toBe(true)
    })
    expect(contract.summary).toMatchObject({
      sourceCommandCount: 1771,
      paintCommandCount: 1771,
      glyphRunCount: 978,
      fillRectCount: 92,
      strokeRectCount: 0,
      strokeLineCount: 696,
      imageCount: 5,
      fontAssetCount: 2,
      imageAssetCount: 5,
    })
  })

  it("replays all Table windows and records structure and empty text without fake paint", () => {
    expect(BUNDLE.tableReplays).toHaveLength(15)
    expect(BUNDLE.tableReplays.reduce((sum, replay) => sum + replay.pageCount, 0)).toBe(20)
    expect(BUNDLE.tableReplays.every((replay) => (
      replay.v4PaginationFingerprint.startsWith("sha256:")
      && replay.v1PaginationFingerprint.startsWith("sha256:")
      && replay.rendererProjectionFingerprint.startsWith("sha256:")
      && replay.sourceFamilyEvidenceFingerprints.length === replay.pageCount
    ))).toBe(true)
    expect(BUNDLE.tableReplays.filter((replay) => replay.pageCount === 2)).toHaveLength(5)
    expect(BUNDLE.tableReplays.reduce((sum, replay) => sum + replay.borderCommandCount, 0)).toBe(696)

    const empty = BUNDLE.bodyDisplayList.structuralReceipts.filter((receipt) => (
      receipt.reason === "empty-measured-text-no-glyph-paint"
    ))
    expect(empty).toEqual([{
      tableId: "table-mapping-fields-mapping-comparison",
      sourceCommandId: "table-render:row:0:9:cell:2:candidate:0",
      kind: "text-line",
      reason: "empty-measured-text-no-glyph-paint",
    }])
    expect(BUNDLE.rendererHandoff.measuredDrawContract.pages.flatMap((page) => page.commands).every((command) => (
      command.kind !== "glyph-run" || (command.text.length > 0 && command.glyphs.every((glyph) => glyph.glyphId > 0))
    ))).toBe(true)
  })

  it("retains resolved font, image, color, and no-relayout facts", () => {
    const contract = BUNDLE.rendererHandoff.measuredDrawContract
    expect(contract.fontAssets.map((asset) => [asset.fontId, asset.weight])).toEqual([
      ["ibm-plex-sans-thai-bold", 700],
      ["ibm-plex-sans-thai-regular", 400],
    ])
    expect(contract.imageAssets.map((asset) => asset.assetId).sort()).toEqual([
      "latency-rounds-image",
      "mapping-gap-image",
      "native-extraction-image",
      "ocr-accuracy-image",
      "source-evidence-image",
    ])
    expect(contract.imageAssets.every((asset) => (
      asset.bytesOwner === "backend"
      && !asset.accessibility.decorative
      && asset.accessibility.altText?.startsWith("Report media ")
    ))).toBe(true)
    const glyphColors = new Set(contract.pages.flatMap((page) => page.commands)
      .filter((command) => command.kind === "glyph-run")
      .map((command) => command.color))
    expect(glyphColors).toEqual(new Set(["1D4ED8", "2563EB", "111827", "4B5563"]))
    expect(BUNDLE.tableRenderPolicy).toMatchObject({
      geometrySource: "core-table-pagination-and-renderer-projection",
      zebraStriping: "not-authored-not-applied",
      styleProfile: {
        outerBorder: { widthPt: 0.6, color: "D9E1E8" },
        internalRowBorder: { widthPt: 0.5, color: "D9E1E8" },
        rowBackgrounds: { header: "F3F6FA", "repeated-header": "F3F6FA" },
      },
    })
  })

  it("rebuilds deterministically without mutating accepted evidence", () => {
    const source = clone(SOURCE)
    const before = JSON.stringify(source)
    expect(createFlowDocCanonicalReportBodyDisplayListBundleV1(source)).toEqual(BUNDLE)
    expect(JSON.stringify(source)).toBe(before)
  }, 120_000)

  it("fails closed on accepted-source and full-contract drift", () => {
    const sourceDrift = clone(SOURCE)
    sourceDrift.paginationExecution.bundleFingerprint = "0".repeat(64)
    expect(validateFlowDocCanonicalReportBodyDisplayListBundleV1(BUNDLE, sourceDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-source" })],
    })

    const fontDrift = clone(SOURCE)
    fontDrift.fontManifest.fontAssets[0].sha256 = "0".repeat(64)
    expect(validateFlowDocCanonicalReportBodyDisplayListBundleV1(BUNDLE, fontDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-source" })],
    })

    const contractDrift = clone(BUNDLE)
    contractDrift.rendererHandoff.measuredDrawContract.pages[0].commands[0].paintOrder = 99
    expect(validateFlowDocCanonicalReportBodyDisplayListBundleV1(contractDrift, SOURCE)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "bundle-content" })],
    })
  }, 120_000)

  it("publishes QA and phase boundaries without claiming PDF bytes", () => {
    const qa = readJson<any>("packages/pdf-renderer-pilot/fixtures/canonical-report-body-display-list-qa.v1.json")
    const proof = readFileSync(resolve(process.cwd(), "docs/PDF_CANONICAL_REPORT_BODY_DISPLAY_LIST_PROOF.md"), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageReadme = readFileSync(resolve(process.cwd(), "packages/pdf-renderer-pilot/README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")
    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-L",
      bundleFingerprint: BUNDLE.bundleFingerprint,
      measuredDrawContractFingerprint: BUNDLE.rendererHandoff.measuredDrawContract.fingerprint,
      summary: BUNDLE.summary,
      executionGate: {
        sourceBodyPlacementsCovered: true,
        bodyEntriesCovered: true,
        tableReplaysCovered: true,
        emptyTextHandledWithoutFakeGlyphs: true,
        missingGlyphCount: 0,
        fullRendererHandoffConsumable: true,
        pdfRendered: false,
      },
      nextPhase: "PDF-PILOT-08B-R2C-M execute full renderer and verify PDF structure",
    })
    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-L measured body display list and full Core renderer contract accepted; PDF rendering remains pending.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-L Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-L Full Renderer Handoff")
    expect(readme).toContain("PDF canonical report full renderer handoff")
    expect(packageReadme).toContain("Full Renderer Handoff Evidence")
    expect(packageJson.scripts["build:report-body-display-list"]).toBe(
      "node scripts/build-canonical-report-body-display-list.mjs",
    )
  })
})
