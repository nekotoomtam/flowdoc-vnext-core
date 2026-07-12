import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  finalizeVNextTocV4PaginationWindows,
  paginateVNextNestedColumnsV4,
  paginateVNextTableRowsV1,
  paginateVNextTextBlockV4Lines,
  paginateVNextTocV4,
  parseVNextDocumentV4HeadingPageMap,
  projectVNextTableRendererCommandsV1,
  resolveVNextTocV4PageReferences,
} from "../src/index.js"
import {
  createV4IntegratedStressColumnsInput,
  createV4IntegratedStressSmokeBundle,
  createV4IntegratedStressTableStyle,
  createV4IntegratedStressTocInputs,
  runV4IntegratedStressSmoke,
} from "./helpers/v4IntegratedStressSmoke.js"

function tableProjection(prepared = createV4IntegratedStressSmokeBundle().preparedTable) {
  const pagination = paginateVNextTableRowsV1({
    prepared, headerPolicy: "repeat-leading-headers",
    pageBodyHeightPt: 100, maximumPageCount: 10, maximumRowPlanCount: 20,
  })
  if (pagination.status !== "paginated") throw new Error("Table recovery fixture blocked")
  return projectVNextTableRendererCommandsV1({
    contractVersion: 1, kind: "table-renderer-projection-request",
    sectionId: "section-cover", zoneId: "zone-cover-body",
    expectedPaginationFingerprint: pagination.fingerprint, pagination,
    pageOrigins: pagination.pages.map((page) => ({ pageIndex: page.pageIndex, xPt: 20, yPt: 30 })),
    styleProfile: createV4IntegratedStressTableStyle(),
  })
}

function tocResolution(pageNumber: number) {
  const bundle = createV4IntegratedStressSmokeBundle()
  const { semantic, measurement } = createV4IntegratedStressTocInputs(bundle)
  const pagination = paginateVNextTocV4({ measurement, pageBodyHeightPt: 100, maximumPageCount: 10 })
  const manifest = finalizeVNextTocV4PaginationWindows({ measurement, windows: [pagination] })
  const map = parseVNextDocumentV4HeadingPageMap({
    source: "vnext-document-v4-heading-page-map", contractVersion: 1,
    kind: "document-v4-heading-page-map", documentId: bundle.document.document.id,
    documentPaginationFingerprint: `synthetic-recovery-pages-${pageNumber}`,
    status: "complete", pageCount: 2,
    entries: [{
      headingNodeId: "title", sectionId: "section-cover",
      sourceFragmentId: "synthetic:title:first-fragment", pageIndex: 1, pageNumber,
    }],
  })
  if (manifest.status !== "ready" || map.status !== "ready") throw new Error("TOC recovery inputs blocked")
  return {
    semantic, measurement, manifest: manifest.manifest, map: map.map,
    result: resolveVNextTocV4PageReferences({
      semantic, measurement, paginationManifest: manifest.manifest,
      headingPageMap: map.map, tocNodeId: "toc-smoke",
    }),
  }
}

describe("v4 integrated document failure and recovery", () => {
  it("blocks an oversized measured Text-block line and preserves accepted rerun evidence", () => {
    const bundle = createV4IntegratedStressSmokeBundle()
    const accepted = paginateVNextTextBlockV4Lines(bundle.measuredTextByNodeId.title, { pageBodyHeightPt: 60 })
    const malformed = structuredClone(bundle.measuredTextByNodeId.title)
    malformed.lines[0].heightPt = 61
    expect(paginateVNextTextBlockV4Lines(malformed, { pageBodyHeightPt: 60 })).toMatchObject({
      status: "blocked", pages: null,
      issues: [expect.objectContaining({ code: "line-exceeds-page-body" })],
    })
    expect(paginateVNextTextBlockV4Lines(bundle.measuredTextByNodeId.title, { pageBodyHeightPt: 60 })).toEqual(accepted)
  })

  it("fails stale Columns and Table cursors atomically then recovers from accepted inputs", () => {
    const bundle = createV4IntegratedStressSmokeBundle()
    const columnsInput = createV4IntegratedStressColumnsInput(bundle)
    if (columnsInput.status !== "ready") throw new Error("Columns recovery fixture blocked")
    const columnsBaseline = paginateVNextNestedColumnsV4({
      columns: columnsInput.columns, pageBodyHeightPt: 60, maximumPageCount: 10,
    })
    if (columnsBaseline.status !== "paginated") throw new Error("Columns baseline blocked")
    expect(paginateVNextNestedColumnsV4({
      columns: columnsInput.columns, pageBodyHeightPt: 60, maximumPageCount: 10,
      cursor: { ...structuredClone(columnsBaseline.cursorBefore), columnsId: "stale-columns" },
    })).toMatchObject({
      status: "blocked", pages: null, cursorAfter: null,
      issues: [expect.objectContaining({ code: "nested-cursor-owner-mismatch" })],
    })
    expect(paginateVNextNestedColumnsV4({
      columns: columnsInput.columns, pageBodyHeightPt: 60, maximumPageCount: 10,
    })).toEqual(columnsBaseline)

    const tableBaseline = paginateVNextTableRowsV1({
      prepared: bundle.preparedTable, headerPolicy: "repeat-leading-headers",
      pageBodyHeightPt: 100, maximumPageCount: 10, maximumRowPlanCount: 20,
    })
    if (tableBaseline.status !== "paginated") throw new Error("Table baseline blocked")
    expect(paginateVNextTableRowsV1({
      prepared: bundle.preparedTable, headerPolicy: "repeat-leading-headers",
      pageBodyHeightPt: 100, maximumPageCount: 10, maximumRowPlanCount: 20,
      cursor: { ...structuredClone(tableBaseline.cursorBefore), tableId: "stale-table" },
    })).toMatchObject({
      status: "blocked", pages: null, cursorAfter: null,
      issues: [expect.objectContaining({ code: "table-pagination-cursor-identity-mismatch" })],
    })
    expect(paginateVNextTableRowsV1({
      prepared: bundle.preparedTable, headerPolicy: "repeat-leading-headers",
      pageBodyHeightPt: 100, maximumPageCount: 10, maximumRowPlanCount: 20,
    })).toEqual(tableBaseline)
  })

  it("resumes TOC pagination from the exact accepted cursor and rejects owner drift", () => {
    const { measurement } = createV4IntegratedStressTocInputs(createV4IntegratedStressSmokeBundle())
    const first = paginateVNextTocV4({
      measurement, pageBodyHeightPt: 14, maximumPageCount: 1,
    })
    expect(first).toMatchObject({ status: "partial", cursorAfter: { complete: false } })
    if (first.status === "blocked") throw new Error("TOC partial fixture blocked")
    expect(paginateVNextTocV4({
      measurement, pageBodyHeightPt: 14, maximumPageCount: 1,
      cursor: { ...first.cursorAfter, measurementFingerprint: "stale" },
    })).toMatchObject({
      status: "blocked", pages: null, cursorAfter: null,
      issues: [expect.objectContaining({ code: "cursor-owner-mismatch" })],
    })
    const resumed = paginateVNextTocV4({
      measurement, pageBodyHeightPt: 14, maximumPageCount: 10, cursor: first.cursorAfter,
    })
    const oneShot = paginateVNextTocV4({ measurement, pageBodyHeightPt: 14, maximumPageCount: 10 })
    if (resumed.status === "blocked" || oneShot.status === "blocked") throw new Error("TOC recovery blocked")
    expect([...first.pages, ...resumed.pages]).toEqual(oneShot.pages)
    expect(resumed.cursorAfter).toEqual(oneShot.cursorAfter)
  })

  it("blocks missing Table media without partial commands and recovers byte-identically", () => {
    const baseline = tableProjection()
    expect(baseline.status).toBe("consumable")
    const missing = createV4IntegratedStressSmokeBundle().preparedTable
    const image = missing.rows[1].cells[1].candidates[0]
    if (image.kind !== "image") throw new Error("Table image fixture missing")
    image.assetId = null
    image.assetOwner = "none"
    expect(tableProjection(missing)).toMatchObject({
      status: "blocked", commands: null,
      issues: [expect.objectContaining({ code: "missing-image-asset", candidateId: "detail-body-image:atomic" })],
    })
    expect(tableProjection()).toEqual(baseline)
  })

  it("retains resolved identity on capacity overflow, blocks readiness, and recovers without retry", () => {
    const overflow = tocResolution(1_000).result
    expect(overflow).toMatchObject({
      status: "resolved", capacity: { status: "overflow", overflowEntryCount: 1 },
      readiness: {
        preview: { status: "blocked", blockers: ["page-number-capacity-overflow"] },
        artifact: {
          status: "blocked",
          blockers: ["page-number-capacity-overflow", "heading-label-materialization-pending"],
        },
      },
      contracts: { measurement: "not-run", pagination: "not-run", relayout: false, rendering: "not-run" },
    })
    const recovered = tocResolution(2).result
    expect(recovered).toMatchObject({
      status: "resolved", capacity: { status: "within-capacity", overflowEntryCount: 0 },
      readiness: {
        preview: { status: "ready", blockers: [] },
        artifact: { status: "blocked", blockers: ["heading-label-materialization-pending"] },
      },
    })
  })

  it("blocks a stale heading-map owner with no entries and preserves the accepted smoke ledger", () => {
    const accepted = tocResolution(2)
    const stale = structuredClone(accepted.map)
    stale.documentId = "other-document"
    expect(resolveVNextTocV4PageReferences({
      semantic: accepted.semantic, measurement: accepted.measurement,
      paginationManifest: accepted.manifest, headingPageMap: stale, tocNodeId: "toc-smoke",
    })).toMatchObject({
      status: "blocked", entries: null,
      issues: [expect.objectContaining({ code: "heading-page-map-document-mismatch" })],
    })
    expect(tocResolution(2).result).toEqual(accepted.result)
    const smoke = runV4IntegratedStressSmoke(createV4IntegratedStressSmokeBundle())
    expect(smoke.blockers).toHaveLength(6)
    expect(smoke.integratedPageCount).toBeNull()
  })

  it("keeps Phase 363 failure and recovery boundaries discoverable", () => {
    const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")
    const doc = read("../docs/V4_INTEGRATED_DOCUMENT_STRESS_FAILURE_RECOVERY_MATRIX.md")
    expect(doc).toContain("## Resume Evidence")
    expect(doc).toContain("commands=null")
    expect(doc).toContain("capacity.status=\"overflow\"")
    expect(doc).toContain("all-or-blocked")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(read("../README.md")).toContain("Phase 363 stresses failure isolation and recovery")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 363 proves core failure isolation")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 363 V4 Integrated Document Stress Failure And Recovery Matrix")
  })
})
