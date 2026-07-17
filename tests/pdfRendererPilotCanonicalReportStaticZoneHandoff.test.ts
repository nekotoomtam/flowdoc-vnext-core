import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import type { FlowDocCanonicalReportLineBreakingBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportLineBreaking.js"
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportMeasuredComposition.js"
import type {
  FlowDocCanonicalReportNativeShapingBundleV1,
  FlowDocCanonicalReportNativeShapingFontManifestV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportNativeShaping.js"
import type { FlowDocCanonicalReportPaginationExecutionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportPaginationExecution.js"
import type { FlowDocCanonicalReportPaginationInputsBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportPaginationInputs.js"
import {
  createFlowDocCanonicalReportStaticZoneHandoffBundleV1,
  validateFlowDocCanonicalReportStaticZoneHandoffBundleV1,
  type FlowDocCanonicalReportStaticZoneHandoffBundleV1,
  type FlowDocCanonicalReportStaticZoneHandoffSourceV1,
  type FlowDocCanonicalReportStaticZoneRawEvidenceV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportStaticZoneHandoff.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportTableProjection.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

const SOURCE: FlowDocCanonicalReportStaticZoneHandoffSourceV1 = {
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
  paginationInputs: readJson<FlowDocCanonicalReportPaginationInputsBundleV1>(
    "fixtures/pdf-pilot-canonical-report-pagination-inputs.v1.json",
  ),
  paginationExecution: readJson<FlowDocCanonicalReportPaginationExecutionBundleV1>(
    "fixtures/pdf-pilot-canonical-report-pagination-execution.v1.json",
  ),
  fontManifest: readJson<FlowDocCanonicalReportNativeShapingFontManifestV1>(
    "assets/fonts/font-assets.v1.json",
  ),
}
const RAW = readJson<FlowDocCanonicalReportStaticZoneRawEvidenceV1>(
  "packages/pdf-renderer-pilot/fixtures/canonical-report-static-zone-raw.v1.json",
)
const BUNDLE = readJson<FlowDocCanonicalReportStaticZoneHandoffBundleV1>(
  "fixtures/pdf-pilot-canonical-report-static-zone-handoff.v1.json",
)

function validate(
  value: unknown,
  source: FlowDocCanonicalReportStaticZoneHandoffSourceV1 = SOURCE,
  raw: FlowDocCanonicalReportStaticZoneRawEvidenceV1 = RAW,
) {
  return validateFlowDocCanonicalReportStaticZoneHandoffBundleV1(value, source, raw)
}

describe("PDF-PILOT-08B-R2C-K canonical report static-zone handoff", () => {
  it("accepts all actual page numbers and the static-zone renderer handoff", () => {
    expect(validate(BUNDLE)).toEqual({ status: "valid", issues: [], summary: BUNDLE.summary })
    expect(BUNDLE).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-K",
      bundleFingerprint: "c14598e9f6d4b42b932d25b6fded3e360b69105bac0e0dc113a2b8083ef199fe",
      planFingerprint: "sha256:7f104d2ffe88763f9cfac597c5409b09daac6b076e9cf66d813665a9d7e6b4ef",
      sourceRawEvidenceFingerprint: "d101d82f01f3f8d6614c34d30c024d9e8af257694f7c9e77f7dd23a3a2d88109",
      rendererHandoff: {
        scope: "page-specific-static-zones-only",
        bodyDisplayList: "pending-r2c-l",
        measuredDrawContract: {
          status: "consumable",
          fingerprint: "sha256:43aab80634a6e921cf6e8fbd0be3caf254f334260ea5ca8a57a39985a32e4526",
          issues: [],
        },
      },
      summary: {
        pageCount: 13,
        actualFooterCount: 13,
        staticZoneInstanceCount: 26,
        drawCommandCount: 26,
        paintCommandCount: 26,
        glyphCount: 719,
        missingGlyphCount: 0,
        maximumFooterWidthPt: 117.72,
        footerCapacityWidthPt: 128.52,
        footerCapacityHeld: true,
        rendererHandoffConsumable: true,
        actualPageNumbersExpanded: true,
        bodyDisplayListBuilt: false,
        pdfRendered: false,
      },
    })
  })

  it("expands one owner-bound footer measurement for every authoritative page", () => {
    expect(BUNDLE.pages.map((page) => page.pageIndex)).toEqual(Array.from({ length: 13 }, (_, index) => index))
    expect(BUNDLE.pages.map((page) => page.pageNumber)).toEqual(Array.from({ length: 13 }, (_, index) => index + 1))
    expect(BUNDLE.pages.map((page) => page.footer.renderedText)).toEqual(
      Array.from({ length: 13 }, (_, index) => `รายงานผลการทดสอบ | หน้า ${index + 1}`),
    )
    const ownerFingerprints = BUNDLE.pages.map((page) => (
      page.footer.measurementRequest.runs.find((run) => run.kind === "generated-page-number")?.generatedOwnerFingerprint
    ))
    expect(ownerFingerprints.every((fingerprint) => fingerprint?.startsWith("sha256:"))).toBe(true)
    expect(new Set(ownerFingerprints)).toHaveLength(13)
    expect(BUNDLE.pages.every((page) => (
      page.footer.accepted.status === "accepted"
      && page.footer.accepted.summary.lineCount === 1
      && page.footer.accepted.summary.totalHeightPt === 12
      && page.footer.nativeEvidence.source === "actual-r2c-k-native-execution"
      && page.footer.nativeEvidence.missingGlyphCount === 0
    ))).toBe(true)
  })

  it("places start-aligned headers and end-aligned footers inside the authored reservations", () => {
    BUNDLE.pages.forEach((page) => {
      expect(page.header.reservationBounds).toEqual({
        xPt: 56.692913,
        yPt: 51.023622,
        widthPt: 498.614173,
        heightPt: 24,
      })
      expect(page.footer.reservationBounds).toEqual({
        xPt: 56.692913,
        yPt: 716.976378,
        widthPt: 498.614173,
        heightPt: 24,
      })
      expect(page.header.paintBounds).toEqual({
        xPt: 56.692913,
        yPt: 51.023622,
        widthPt: 154.8,
        heightPt: 12,
      })
      expect(page.header.alignment).toBe("start")
      expect(page.footer.alignment).toBe("end")
      expect(page.footer.paintBounds.xPt + page.footer.paintBounds.widthPt).toBeCloseTo(555.307086, 6)
      expect(page.footer.paintBounds.yPt).toBe(716.976378)
      expect(page.header.baselineOffsetPt).toBe(10.5)
      expect(page.footer.baselineOffsetPt).toBe(10.5)
    })
    expect(BUNDLE.pages[0].footer.paintBounds.widthPt).toBe(112.32)
    expect(BUNDLE.pages.at(-1)?.footer.paintBounds.widthPt).toBe(117.72)
  })

  it("hands Core exact glyph commands without allowing renderer relayout", () => {
    const handoff = BUNDLE.rendererHandoff
    expect(handoff.adapterPlan.status).toBe("ready")
    expect(handoff.adapterPlan.pageCount).toBe(13)
    expect(handoff.adapterPlan.drawCommands).toHaveLength(26)
    expect(handoff.adapterPlan.rendererContract.mayRelayout).toBe(false)
    expect(handoff.measuredDrawContract.status).toBe("consumable")
    expect(handoff.measuredDrawContract.contracts.mayRelayout).toBe(false)
    expect(handoff.measuredDrawContract.summary).toMatchObject({
      pageCount: 13,
      sourceCommandCount: 26,
      paintCommandCount: 26,
      glyphRunCount: 26,
      fontAssetCount: 1,
      imageAssetCount: 0,
    })
    expect(handoff.measuredDrawContract.pages.every((page) => page.commands.length === 2)).toBe(true)
    expect(handoff.measuredDrawContract.pages.flatMap((page) => page.commands).every((command) => (
      command.kind === "glyph-run"
      && command.measurementProfileId === SOURCE.nativeShaping.measurementProfileId
      && command.glyphs.every((glyph, index) => glyph.glyphIndex === index && glyph.glyphId > 0)
    ))).toBe(true)
  })

  it("rebuilds deterministically without mutating accepted source or raw evidence", () => {
    const source = clone(SOURCE)
    const raw = clone(RAW)
    const sourceBefore = JSON.stringify(source)
    const rawBefore = JSON.stringify(raw)
    expect(createFlowDocCanonicalReportStaticZoneHandoffBundleV1(source, raw)).toEqual(BUNDLE)
    expect(JSON.stringify(source)).toBe(sourceBefore)
    expect(JSON.stringify(raw)).toBe(rawBefore)
  })

  it("fails closed on source, raw, page-number, geometry, handoff, and boundary drift", () => {
    const sourceDrift = clone(SOURCE)
    sourceDrift.paginationExecution.bundleFingerprint = "0".repeat(64)
    expect(validate(BUNDLE, sourceDrift)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "invalid-source" })]),
    })

    const nestedSourceDrift = clone(SOURCE)
    nestedSourceDrift.paginationExecution.corePagePlan.pages[0].pageGeometry.bodyOriginXPt = 0
    expect(validate(BUNDLE, nestedSourceDrift)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({
        code: "invalid-source",
        message: "R2C-J pagination execution content fingerprint is invalid",
      })]),
    })

    const rawDrift = clone(RAW)
    rawDrift.executions[0].shapeOutput.text = "wrong"
    expect(validate(BUNDLE, SOURCE, rawDrift)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "rebuild-failed" })]),
    })

    const rawRevisionDrift = clone(RAW)
    rawRevisionDrift.executions[0].segmentOutput.segmenterRevision = "wrong"
    expect(validate(BUNDLE, SOURCE, rawRevisionDrift)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "rebuild-failed" })]),
    })

    const pageNumberDrift = clone(BUNDLE)
    pageNumberDrift.pages[12].footer.renderedText = "รายงานผลการทดสอบ | หน้า 12"
    expect(validate(pageNumberDrift)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "bundle-content" })]),
    })

    const geometryDrift = clone(BUNDLE)
    geometryDrift.pages[0].footer.paintBounds.xPt = 0
    expect(validate(geometryDrift)).toMatchObject({ status: "blocked" })

    const handoffDrift = clone(BUNDLE)
    ;(handoffDrift.rendererHandoff.measuredDrawContract.contracts as any).mayRelayout = true
    expect(validate(handoffDrift)).toMatchObject({ status: "blocked" })

    const boundaryDrift = clone(BUNDLE)
    ;(boundaryDrift.execution as any).pdfRendering = "executed"
    expect(validate(boundaryDrift)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "execution-boundary" })]),
    })
  }, 30_000)
})
