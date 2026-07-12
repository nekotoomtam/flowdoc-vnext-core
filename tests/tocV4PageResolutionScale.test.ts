import { describe, expect, it } from "vitest"
import {
  resolveVNextTocV4PageReferences,
  type VNextDocumentV4HeadingPageMap,
  type VNextTocV4MeasurementResult,
  type VNextTocV4PaginationManifest,
  type VNextTocV4SemanticResult,
} from "../src/index.js"

const ENTRY_COUNT = 1_000

function scaleFixtures() {
  const semanticEntries = Array.from({ length: ENTRY_COUNT }, (_, index) => {
    const headingNodeId = `heading-${index}`
    return {
      identity: { tocNodeId: "toc", headingNodeId }, tocNodeId: "toc", headingNodeId,
      sectionId: "main", zoneId: "body", level: 1 as const,
      sourceOrdinal: index, tocOrdinal: index,
      label: {
        kind: "authored-preview" as const, text: `Heading ${index}`, fieldKeys: [],
        materialization: "not-required" as const,
      },
      pageReference: { status: "pending" as const, pageIndex: null, pageNumber: null },
    }
  })
  const semantic = {
    status: "ready", documentId: "scale-document", fingerprint: "semantic-scale", issues: [],
    tocs: [{
      tocNodeId: "toc", sectionId: "main", zoneId: "body", title: "Contents", maxLevel: 6,
      entries: semanticEntries, fieldKeys: [], fingerprint: "toc-semantic-scale",
    }],
  } as unknown as VNextTocV4SemanticResult
  const measurement = {
    status: "measured", documentId: "scale-document", tocNodeId: "toc",
    semanticFingerprint: "semantic-scale", tocSemanticFingerprint: "toc-semantic-scale",
    fingerprint: "measurement-scale", pageNumberProof: { capacityDigits: 4 },
    rows: semanticEntries.map((entry) => ({
      identity: entry.identity, headingNodeId: entry.headingNodeId,
      pageNumber: { capacityDigits: 4 },
    })),
  } as unknown as VNextTocV4MeasurementResult
  const manifest = {
    source: "vnext-toc-v4-pagination-manifest", contractVersion: 1, kind: "toc-pagination-manifest",
    tocNodeId: "toc", measurementFingerprint: "measurement-scale", fingerprint: "manifest-scale",
    cursorAfter: { complete: true }, summary: { rowCount: ENTRY_COUNT },
    pages: [{
      fragmentId: "toc:page-0", pageIndex: 0, warnings: [],
      rows: semanticEntries.map((entry, rowIndex) => ({
        rowIndex, identity: entry.identity, headingNodeId: entry.headingNodeId, yPt: rowIndex * 14,
      })),
    }],
  } as unknown as VNextTocV4PaginationManifest
  const headingPageMap = {
    source: "vnext-document-v4-heading-page-map", contractVersion: 1,
    kind: "document-v4-heading-page-map", documentId: "scale-document",
    documentPaginationFingerprint: "document-pages-scale", status: "complete", pageCount: ENTRY_COUNT,
    entries: semanticEntries.map((entry, pageIndex) => ({
      headingNodeId: entry.headingNodeId, sectionId: "main",
      sourceFragmentId: `${entry.headingNodeId}:f0`, pageIndex, pageNumber: pageIndex + 1,
    })),
    fingerprint: "heading-map-scale",
  } as VNextDocumentV4HeadingPageMap
  return { semantic, measurement, manifest, headingPageMap }
}

describe("final TOC v4 page-reference resolution scale", () => {
  it("resolves 1,000 entries deterministically with exact linear work", () => {
    const input = scaleFixtures()
    const before = JSON.stringify(input)
    const first = resolveVNextTocV4PageReferences({
      ...input, paginationManifest: input.manifest, tocNodeId: "toc",
    })
    const second = resolveVNextTocV4PageReferences({
      ...input, paginationManifest: input.manifest, tocNodeId: "toc",
    })
    expect(first).toMatchObject({
      status: "resolved",
      summary: { entryCount: ENTRY_COUNT, resolvedEntryCount: ENTRY_COUNT, unresolvedEntryCount: 0 },
      capacity: { status: "within-capacity", maximumRequiredDigits: 4, overflowEntryCount: 0 },
      readiness: { preview: { status: "ready" }, artifact: { status: "ready" } },
      work: {
        entryResolutionCount: ENTRY_COUNT,
        placementIndexCount: ENTRY_COUNT,
        headingDestinationIndexCount: ENTRY_COUNT,
      },
    })
    if (first.status !== "resolved") throw new Error("scale resolution blocked")
    expect(first.entries[0].identity.headingNodeId).toBe("heading-0")
    expect(first.entries.at(-1)).toMatchObject({
      identity: { headingNodeId: "heading-999" },
      destination: { pageNumber: 1_000, pageNumberText: "1000" },
    })
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
    expect(JSON.stringify(input)).toBe(before)
  })
})
