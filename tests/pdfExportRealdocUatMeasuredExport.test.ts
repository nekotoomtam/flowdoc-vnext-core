import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  FLOWDOC_UAT_LOCAL_RENDERER_PROFILE_ID,
  FLOWDOC_UAT_MEASUREMENT_PROFILE_ID,
  FLOWDOC_UAT_MEASURED_EXPORT_MAX_PAGE_COUNT,
} from "../packages/uat-realdoc/src/index.js"

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

describe("PDF-EXPORT-REALDOC-D measured UAT export", () => {
  it("retains content-free exact 69C acceptance evidence for native measurement, pagination, rendering, cancellation, and restart", () => {
    const evidence = JSON.parse(readText(
      "packages/uat-realdoc/fixtures/69c-section-2-1-measured-export-evidence.v1.json",
    ))

    expect(evidence).toMatchObject({
      evidenceVersion: 1,
      phaseId: "PDF-EXPORT-REALDOC-D",
      status: "accepted",
      nativeMeasurement: {
        consumerCount: 97,
        missingGlyphCount: 0,
        emergencyBreakOpportunityCount: 0,
        shaperRevision: "rustybuzz-0.20.1",
        segmenterRevision: "icu_segmenter-2.2.0",
      },
      composition: {
        pageCount: 11,
        imagePaintCount: 7,
        repeatedRequirementHeaderCount: 3,
        splitRequirementRowCount: 3,
        screenshotRowCount: 7,
        resourceEnvelope: {
          pageCount: 11,
          fontAssetCount: 2,
          imageAssetCount: 7,
          accepted: true,
        },
        requirementsTable: {
          pageCount: 4,
          splitRowCount: 3,
          repeatedHeaderFragmentCount: 3,
        },
        screenshotsTable: {
          pageCount: 7,
          splitRowCount: 0,
          imagePaintCount: 7,
        },
      },
      renderer: {
        mode: "local-measured-document",
        artifact: {
          rendererProfileId: FLOWDOC_UAT_LOCAL_RENDERER_PROFILE_ID,
          measurementProfileId: FLOWDOC_UAT_MEASUREMENT_PROFILE_ID,
          storageStatus: "not-stored",
          localOnly: true,
        },
      },
      determinism: { sameProcessByteEqual: true, sameProcessReceiptEqual: true },
      cancellation: { status: "cancelled", bytesReturned: false, artifactReturned: false },
      restart: { freshProcessRenderEqual: true, pageCount: 11 },
      executionBoundary: {
        sourceContentRetainedInEvidence: false,
        coreTablePaginationExecuted: true,
        coreRendererProjectionExecuted: true,
        localRendererExecuted: true,
        backendStorageWrites: false,
        productionBinding: false,
      },
    })
    expect(evidence.composition.pageCount).toBeLessThanOrEqual(FLOWDOC_UAT_MEASURED_EXPORT_MAX_PAGE_COUNT)
    expect(evidence).not.toHaveProperty("pdfBytes")
    expect(JSON.stringify(evidence)).not.toContain("semantic_no_pages")
    expect(JSON.stringify(evidence)).not.toContain("หน้าจอแสดงส่วนของ Path Navigate")
  })

  it("keeps the reusable measured composition source-neutral and delegates tables to Core", () => {
    const source = readText("packages/uat-realdoc/src/uatMeasuredExport.ts")

    expect(source).not.toContain("69C")
    expect(source).not.toContain("section_2_1_img")
    expect(source).not.toContain("document_semantic_no_pages")
    expect(source).toContain("createVNextTablePreparedRowsV1")
    expect(source).toContain("paginateVNextTableRowsV1")
    expect(source).toContain("projectVNextTableRendererCommandsV1")
    expect(source).toContain("createVNextPdfMeasuredDrawContractV1")
  })
})
