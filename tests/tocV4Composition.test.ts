import { describe, expect, it } from "vitest"
import {
  collectVNextTocV4Semantics,
  createApproximateVNextTextMeasurer,
  createVNextTocCompositionWindowV1,
  hasValidVNextTocV4PaginationFingerprint,
  measureVNextTocV4,
  paginateVNextTocV4,
  parseVNextCompositionFragmentWindowV1,
  type DocumentNodeV4Target,
  type VNextTocCompositionWindowContextV1,
  type VNextTocV4MeasurementResult,
  type VNextTocV4MeasurementSpec,
  type VNextTocV4PageFragment,
  type VNextTocV4PaginationCursor,
} from "../src/index.js"

const pin = (value: string) => `sha256:${value.repeat(64).slice(0, 64)}`

function measurement(rowCount = 4): Extract<VNextTocV4MeasurementResult, { status: "measured" }> {
  const nodes: Record<string, any> = {
    body: {
      id: "body",
      type: "zone",
      role: "body",
      childIds: ["toc", ...Array.from({ length: rowCount }, (_, index) => `h-${index}`)],
    },
    toc: { id: "toc", type: "toc", props: { title: "Contents" } },
  }
  for (let index = 0; index < rowCount; index += 1) nodes[`h-${index}`] = {
    id: `h-${index}`,
    type: "text-block",
    role: { role: "heading", level: 1 },
    props: {},
    children: [{ id: `h-${index}-text`, type: "text", text: `Heading ${index}` }],
  }
  const margin = { value: 40, unit: "pt" as const }
  const document: DocumentNodeV4Target = {
    version: 4,
    document: {
      id: "toc-composition",
      sections: [{
        id: "main",
        type: "section",
        page: {
          size: "A4",
          orientation: "portrait",
          margin: { top: margin, right: margin, bottom: margin, left: margin },
        },
        zoneIds: ["body"],
        nodes,
      }],
    },
  }
  const semantic = collectVNextTocV4Semantics(document)
  const spec: VNextTocV4MeasurementSpec = {
    availableWidthPt: 480,
    availableHeightPt: 100,
    measurementProfileId: "toc-composition",
    titleStyleKey: "title",
    pageNumberStyleKey: "page",
    entryStyleKeyByLevel: { "1": "l1", "2": "l2", "3": "l3", "4": "l4", "5": "l5", "6": "l6" },
    indentPtByLevel: { "1": 0, "2": 10, "3": 20, "4": 30, "5": 40, "6": 50 },
    pageNumberColumnWidthPt: 30,
    pageNumberCapacityDigits: 4,
    labelToLeaderGapPt: 4,
    minimumLeaderWidthPt: 12,
    leaderToPageNumberGapPt: 4,
    titleGapAfterPt: 8,
    rowGapPt: 2,
    maximumEntryCount: Math.max(1, rowCount),
    maximumMeasuredLineCount: Math.max(2, rowCount + 2),
  }
  const result = measureVNextTocV4({
    semantic,
    tocNodeId: "toc",
    spec,
    textMeasurer: createApproximateVNextTextMeasurer({ charWidthPt: 6, lineHeightPt: 14 }),
  })
  if (result.status !== "measured") throw new Error(result.issues.map((item) => item.message).join("; "))
  return result
}

function context(firstPageAvailableHeightPt = 100): VNextTocCompositionWindowContextV1 {
  return {
    documentId: "toc-composition",
    sectionId: "main",
    zoneId: "body",
    sourceOrder: 0,
    documentStructureFingerprint: pin("a"),
    resolvedProjectionFingerprint: pin("b"),
    familySourceFingerprint: pin("c"),
    pageBodyHeightPt: 100,
    firstPageAvailableHeightPt,
  }
}

describe("TOC v4 Composition one-page adapter", () => {
  it("projects one content page into a strict generated-flow window", () => {
    const measured = measurement(20)
    const before = JSON.stringify(measured)
    const pagination = paginateVNextTocV4({
      measurement: measured,
      pageBodyHeightPt: 100,
      maximumPageCount: 1,
    })
    expect(pagination.status).toBe("partial")
    expect(hasValidVNextTocV4PaginationFingerprint(pagination)).toBe(true)
    const result = createVNextTocCompositionWindowV1({ pagination, context: context() })
    expect(result).toMatchObject({
      status: "ready",
      window: {
        status: "partial",
        family: "generated-flow",
        rootNodeType: "toc",
        ownerPins: {
          measurement: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
          pagination: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
        },
        pages: [{
          flowEffect: "place-content",
          availableHeightPt: 100,
          fragments: [{
            sourceNodeId: "toc",
            blockExtentPt: pagination.status === "blocked" ? -1 : pagination.pages[0].usedHeightPt,
            continuation: { fromPrevious: false, toNext: true },
          }],
        }],
        work: { pageCount: 1, fragmentCount: 1, cursorCommitCount: 1 },
      },
    })
    if (result.status === "blocked") throw new Error("TOC common adaptation blocked")
    expect(parseVNextCompositionFragmentWindowV1(result.window)).toEqual(result)
    expect(JSON.stringify(measured)).toBe(before)
  })

  it("resumes exact one-page content windows to the one-shot family result", () => {
    const measured = measurement(40)
    const oneShot = paginateVNextTocV4({ measurement: measured, pageBodyHeightPt: 100, maximumPageCount: 100 })
    if (oneShot.status === "blocked") throw new Error("one-shot TOC blocked")
    const pages: VNextTocV4PageFragment[] = []
    let cursor: VNextTocV4PaginationCursor | undefined
    do {
      const pagination = paginateVNextTocV4({
        measurement: measured,
        pageBodyHeightPt: 100,
        maximumPageCount: 1,
        ...(cursor == null ? {} : { cursor }),
      })
      if (pagination.status === "blocked") throw new Error("TOC page window blocked")
      const adapted = createVNextTocCompositionWindowV1({ pagination, context: context() })
      expect(adapted.status).toBe("ready")
      pages.push(...pagination.pages)
      cursor = pagination.cursorAfter
    } while (!cursor.complete)
    expect(pages).toEqual(oneShot.pages)
    expect(cursor).toEqual(oneShot.cursorAfter)
  })

  it("normalizes a short-remainder advance into fresh-page demand without cursor progress", () => {
    const measured = measurement(4)
    const freshPagination = paginateVNextTocV4({
      measurement: measured,
      pageBodyHeightPt: 100,
      firstPageAvailableHeightPt: 20,
      maximumPageCount: 1,
    })
    if (freshPagination.status === "blocked") throw new Error("fresh TOC fixture blocked")
    expect(freshPagination.pages[0]).toMatchObject({ freshPageAdvance: true, usedHeightPt: 0 })
    const adapted = createVNextTocCompositionWindowV1({
      pagination: freshPagination,
      context: context(20),
    })
    expect(adapted).toMatchObject({
      status: "ready",
      window: {
        status: "fresh-page-required",
        pages: [],
        work: { pageCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
      },
    })
    if (adapted.status === "blocked") throw new Error("fresh adaptation blocked")
    expect(adapted.window.cursorAfter).toEqual(adapted.window.cursorBefore)

    const retry = paginateVNextTocV4({
      measurement: measured,
      pageBodyHeightPt: 100,
      maximumPageCount: 1,
      cursor: freshPagination.cursorBefore,
    })
    if (retry.status === "blocked") throw new Error("fresh retry blocked")
    expect(createVNextTocCompositionWindowV1({ pagination: retry, context: context() })).toMatchObject({
      status: "ready",
      window: {
        status: retry.status,
        pages: [{ fragments: [{ blockExtentPt: retry.pages[0].usedHeightPt }] }],
      },
    })
  })

  it("blocks forced overflow and empty untitled TOC output", () => {
    const oversized = measurement(1)
    oversized.rows[0].heightPt = 120
    oversized.rows[0].label.heightPt = 120
    oversized.fingerprint = "oversized-composition-measurement"
    const overflow = paginateVNextTocV4({ measurement: oversized, pageBodyHeightPt: 100, maximumPageCount: 1 })
    if (overflow.status === "blocked") throw new Error("overflow family pagination blocked")
    const titlePage = createVNextTocCompositionWindowV1({ pagination: overflow, context: context() })
    expect(titlePage.status).toBe("ready")
    const overflowPage = paginateVNextTocV4({
      measurement: oversized,
      pageBodyHeightPt: 100,
      maximumPageCount: 1,
      cursor: overflow.cursorAfter,
    })
    expect(createVNextTocCompositionWindowV1({ pagination: overflowPage, context: context() })).toMatchObject({
      status: "blocked",
      window: null,
      issues: [expect.objectContaining({ code: "toc-composition-forced-overflow-unsupported" })],
    })

    const empty = measurement(0)
    empty.title = null
    empty.rows = []
    empty.fingerprint = "empty-composition-measurement"
    const emptyPagination = paginateVNextTocV4({ measurement: empty, pageBodyHeightPt: 100, maximumPageCount: 1 })
    expect(emptyPagination).toMatchObject({ status: "complete", pages: [] })
    expect(createVNextTocCompositionWindowV1({ pagination: emptyPagination, context: context() })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "toc-composition-empty-window-unsupported" })],
    })
  })

  it("rejects tampered, stale, and multi-page evidence before common finalization", () => {
    const measured = measurement(20)
    const pagination = paginateVNextTocV4({ measurement: measured, pageBodyHeightPt: 100, maximumPageCount: 1 })
    if (pagination.status === "blocked") throw new Error("tamper fixture blocked")
    const tampered = structuredClone(pagination)
    tampered.pages[0].usedHeightPt += 1
    expect(hasValidVNextTocV4PaginationFingerprint(tampered)).toBe(false)
    expect(createVNextTocCompositionWindowV1({ pagination: tampered, context: context() })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "toc-composition-pagination-fingerprint-mismatch" })],
    })

    const stale = structuredClone(pagination)
    stale.cursorAfter.measurementFingerprint = "stale"
    expect(createVNextTocCompositionWindowV1({ pagination: stale, context: context() })).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "toc-composition-pagination-fingerprint-mismatch" }),
        expect.objectContaining({ code: "toc-composition-measurement-owner-mismatch" }),
      ]),
    })

    const multiple = paginateVNextTocV4({ measurement: measured, pageBodyHeightPt: 40, maximumPageCount: 2 })
    expect(createVNextTocCompositionWindowV1({ pagination: multiple, context: context(40) })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "toc-composition-multiple-pages-unsupported" })],
    })
  })

  it("adapts 1,000 generated entries through bounded deterministic one-page windows", () => {
    const measured = measurement(1_000)
    const oneShot = paginateVNextTocV4({ measurement: measured, pageBodyHeightPt: 100, maximumPageCount: 1_000 })
    if (oneShot.status === "blocked") throw new Error("scale one-shot blocked")
    const pages: VNextTocV4PageFragment[] = []
    const windowFingerprints: string[] = []
    let cursor: VNextTocV4PaginationCursor | undefined
    let callCount = 0
    do {
      const pagination = paginateVNextTocV4({
        measurement: measured,
        pageBodyHeightPt: 100,
        maximumPageCount: 1,
        ...(cursor == null ? {} : { cursor }),
      })
      if (pagination.status === "blocked") throw new Error("scale page blocked")
      const adapted = createVNextTocCompositionWindowV1({ pagination, context: context() })
      if (adapted.status === "blocked") throw new Error(adapted.issues.map((item) => item.message).join("; "))
      expect(adapted.window.work).toEqual({ pageCount: 1, fragmentCount: 1, cursorCommitCount: 1 })
      pages.push(...pagination.pages)
      windowFingerprints.push(adapted.window.fingerprint)
      cursor = pagination.cursorAfter
      callCount += 1
    } while (!cursor.complete)

    expect(callCount).toBe(oneShot.pages.length)
    expect(pages).toEqual(oneShot.pages)
    expect(cursor).toEqual(oneShot.cursorAfter)
    expect(new Set(windowFingerprints).size).toBe(callCount)
    expect(pages.flatMap((page) => page.rows)).toHaveLength(1_000)
  }, 30_000)
})
