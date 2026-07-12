import { describe, expect, it } from "vitest"
import {
  resolveVNextTocV4PageReferences,
  type VNextDocumentV4HeadingPageMap,
  type VNextTocV4MeasurementResult,
  type VNextTocV4PaginationManifest,
  type VNextTocV4SemanticResult,
} from "../src/index.js"

function fixtures() {
  const semanticToc = {
    tocNodeId: "toc", sectionId: "main", zoneId: "body", title: "Contents", maxLevel: 6,
    entries: ["intro", "details"].map((headingNodeId, index) => ({
      identity: { tocNodeId: "toc", headingNodeId }, tocNodeId: "toc", headingNodeId,
      sectionId: "main", zoneId: "body", level: (index + 1) as 1 | 2,
      sourceOrdinal: index, tocOrdinal: index,
      label: { kind: "authored-preview" as const, text: headingNodeId, fieldKeys: [], materialization: "not-required" as const },
      pageReference: { status: "pending" as const, pageIndex: null, pageNumber: null },
    })),
    fieldKeys: [], fingerprint: "toc-semantic-1",
  }
  const semantic = {
    status: "ready", documentId: "doc", fingerprint: "semantic-1", tocs: [semanticToc], issues: [],
  } as unknown as VNextTocV4SemanticResult
  const measurement = {
    status: "measured", documentId: "doc", tocNodeId: "toc",
    semanticFingerprint: "semantic-1", tocSemanticFingerprint: "toc-semantic-1", fingerprint: "measurement-1",
    pageNumberProof: { capacityDigits: 3 },
    rows: semanticToc.entries.map((entry) => ({
      identity: entry.identity, headingNodeId: entry.headingNodeId,
      pageNumber: { capacityDigits: 3 },
    })),
  } as unknown as VNextTocV4MeasurementResult
  const manifest = {
    source: "vnext-toc-v4-pagination-manifest", contractVersion: 1, kind: "toc-pagination-manifest",
    tocNodeId: "toc", measurementFingerprint: "measurement-1", fingerprint: "manifest-1",
    cursorAfter: { complete: true }, summary: { rowCount: 2 },
    pages: [{
      fragmentId: "toc:page-2", pageIndex: 2, warnings: [],
      rows: semanticToc.entries.map((entry, rowIndex) => ({
        rowIndex, identity: entry.identity, headingNodeId: entry.headingNodeId, yPt: 20 + rowIndex * 16,
      })),
    }],
  } as unknown as VNextTocV4PaginationManifest
  const headingPageMap = {
    source: "vnext-document-v4-heading-page-map", contractVersion: 1,
    kind: "document-v4-heading-page-map", documentId: "doc",
    documentPaginationFingerprint: "document-pages-1", status: "complete", pageCount: 20,
    entries: [
      { headingNodeId: "intro", sectionId: "main", sourceFragmentId: "intro:f0", pageIndex: 4, pageNumber: 5 },
      { headingNodeId: "details", sectionId: "main", sourceFragmentId: "details:f0", pageIndex: 11, pageNumber: 12 },
    ],
    fingerprint: "heading-map-1",
  } as VNextDocumentV4HeadingPageMap
  return { semantic, measurement, manifest, headingPageMap }
}

describe("final TOC v4 page-reference base projection", () => {
  it("joins complete semantic, measured, placement, and destination facts without mutation", () => {
    const input = fixtures()
    const before = JSON.stringify(input)
    const first = resolveVNextTocV4PageReferences({ ...input, paginationManifest: input.manifest, tocNodeId: "toc" })
    const second = resolveVNextTocV4PageReferences({ ...input, paginationManifest: input.manifest, tocNodeId: "toc" })
    expect(first).toMatchObject({
      status: "resolved", documentId: "doc", tocNodeId: "toc",
      pins: {
        semanticFingerprint: "semantic-1", measurementFingerprint: "measurement-1",
        paginationManifestFingerprint: "manifest-1", headingPageMapFingerprint: "heading-map-1",
        documentPaginationFingerprint: "document-pages-1",
      },
      summary: { entryCount: 2, resolvedEntryCount: 2 },
      capacity: {
        status: "within-capacity", capacityDigits: 3, maximumRequiredDigits: 2,
        overflowEntryCount: 0, overflowHeadingNodeIds: [],
      },
      readiness: {
        preview: { status: "ready", labelMode: "authored-preview", blockers: [] },
        artifact: {
          status: "ready", labelMode: "materialized-required",
          documentCompositionFingerprint: "document-pages-1", blockers: [],
        },
      },
      contracts: { measurement: "not-run", pagination: "not-run", relayout: false, rendering: "not-run", authoredMutation: false },
    })
    if (first.status !== "resolved") throw new Error("resolution fixture blocked")
    expect(first.entries[1]).toMatchObject({
      identity: { tocNodeId: "toc", headingNodeId: "details" },
      semantic: { label: "details", labelMode: "authored-preview", level: 2, tocOrdinal: 1 },
      measurementRef: { measurementFingerprint: "measurement-1", rowIndex: 1 },
      tocPlacement: { paginationManifestFingerprint: "manifest-1", pageIndex: 2, pageFragmentId: "toc:page-2", rowYPoint: 36 },
      destination: { status: "resolved", headingPageIndex: 11, pageNumber: 12, pageNumberText: "12", sourceFragmentId: "details:f0" },
      pageNumberCapacity: { status: "within-capacity", capacityDigits: 3, requiredDigits: 2 },
    })
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
    expect(JSON.stringify(input)).toBe(before)
  })

  it("blocks ownership drift and section conflict", () => {
    const drift = fixtures()
    ;(drift.measurement as any).semanticFingerprint = "stale"
    expect(resolveVNextTocV4PageReferences({ ...drift, paginationManifest: drift.manifest, tocNodeId: "toc" })).toMatchObject({
      status: "blocked", entries: null, issues: [expect.objectContaining({ code: "measurement-owner-mismatch" })],
    })

    const invalid = fixtures()
    invalid.headingPageMap.entries[0].sectionId = "other"
    expect(resolveVNextTocV4PageReferences({ ...invalid, paginationManifest: invalid.manifest, tocNodeId: "toc" })).toMatchObject({
      status: "blocked", entries: null,
      issues: [expect.objectContaining({ code: "heading-destination-section-mismatch", headingNodeId: "intro" })],
    })
  })

  it("keeps missing destinations as ordered partial entries and ignores extra document headings", () => {
    const input = fixtures()
    input.headingPageMap.entries.pop()
    input.headingPageMap.entries.push({
      headingNodeId: "outside-toc", sectionId: "main", sourceFragmentId: "outside:f0",
      pageIndex: 15, pageNumber: 16,
    })
    const result = resolveVNextTocV4PageReferences({ ...input, paginationManifest: input.manifest, tocNodeId: "toc" })
    expect(result).toMatchObject({
      status: "partial",
      summary: {
        entryCount: 2, resolvedEntryCount: 1, unresolvedEntryCount: 1,
        extraMapHeadingCount: 1, semanticWarningCount: 0, paginationWarningCount: 0,
      },
      entries: [
        { identity: { headingNodeId: "intro" }, destination: { status: "resolved", pageNumber: 5 } },
        {
          identity: { headingNodeId: "details" },
          destination: {
            status: "unresolved", headingPageIndex: null, pageNumber: null,
            pageNumberText: null, sourceFragmentId: null,
          },
        },
      ],
      issues: [expect.objectContaining({
        code: "heading-destination-missing", severity: "warning", headingNodeId: "details",
      })],
      capacity: { status: "pending", overflowEntryCount: 0 },
      readiness: {
        preview: { status: "blocked", blockers: ["page-references-incomplete"] },
        artifact: { status: "blocked", blockers: ["page-references-incomplete"] },
      },
    })
  })

  it("keeps resolution complete while capacity overflow blocks renderer readiness without relayout", () => {
    const input = fixtures()
    input.headingPageMap.entries[1].pageNumber = 1234
    const result = resolveVNextTocV4PageReferences({ ...input, paginationManifest: input.manifest, tocNodeId: "toc" })
    expect(result).toMatchObject({
      status: "resolved",
      entries: [{ pageNumberCapacity: { status: "within-capacity" } }, {
        destination: { status: "resolved", pageNumberText: "1234" },
        pageNumberCapacity: { status: "overflow", capacityDigits: 3, requiredDigits: 4 },
      }],
      capacity: {
        status: "overflow", capacityDigits: 3, maximumRequiredDigits: 4,
        overflowEntryCount: 1, overflowHeadingNodeIds: ["details"],
      },
      readiness: {
        preview: { status: "blocked", blockers: ["page-number-capacity-overflow"] },
        artifact: { status: "blocked", blockers: ["page-number-capacity-overflow"] },
      },
      contracts: { measurement: "not-run", pagination: "not-run", relayout: false, rendering: "not-run" },
      issues: [expect.objectContaining({
        code: "page-number-capacity-overflow", severity: "warning", headingNodeId: "details",
      })],
    })
  })

  it("allows authored preview but blocks artifact readiness while field-backed labels await materialization", () => {
    const input = fixtures()
    const semantic = input.semantic as Extract<VNextTocV4SemanticResult, { status: "ready" | "partial" }>
    semantic.tocs[0].entries[0].label.fieldKeys = ["customer.name"]
    semantic.tocs[0].entries[0].label.materialization = "pending"
    const result = resolveVNextTocV4PageReferences({
      ...input, semantic, paginationManifest: input.manifest, tocNodeId: "toc",
    })
    expect(result).toMatchObject({
      status: "resolved",
      readiness: {
        preview: { status: "ready", labelMode: "authored-preview", blockers: [] },
        artifact: {
          status: "blocked", labelMode: "materialized-required",
          blockers: ["heading-label-materialization-pending"],
        },
      },
    })
  })
})
