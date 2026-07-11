import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  paginateVNextTextBlockV4Lines,
  type VNextTextBlockV4MeasuredLinesResult,
} from "../src/index.js"

type Accepted = Extract<VNextTextBlockV4MeasuredLinesResult, { status: "accepted" }>

function acceptedLines(count: number, options: { heightPt?: number; fieldEvery?: number } = {}): Accepted {
  const heightPt = options.heightPt ?? 10
  const lines = Array.from({ length: count }, (_, index) => {
    const field = options.fieldEvery != null && index % options.fieldEvery === 0
    return {
      index,
      startOffset: index * 5,
      endOffset: (index + 1) * 5,
      text: `L${index}`,
      widthPt: 100,
      heightPt,
      sourceStart: {
        textBlockId: "body-text",
        inlineId: field ? "customer-field" : "body-run",
        authoredOffset: field ? 0 : index * 5,
        resolvedOffset: index * 5,
        affinity: "forward" as const,
      },
      sourceEnd: {
        textBlockId: "body-text",
        inlineId: field ? "customer-field" : "body-run",
        authoredOffset: field ? 0 : (index + 1) * 5,
        resolvedOffset: (index + 1) * 5,
        affinity: "backward" as const,
      },
    }
  })
  return {
    source: "vnext-text-block-v4-measurement",
    version: 1,
    status: "accepted",
    textBlockId: "body-text",
    lines,
    issues: [],
    summary: { lineCount: count, renderedLength: count * 5, totalHeightPt: count * heightPt },
  }
}

describe("text-block v4 line pagination", () => {
  it("splits one canonical text-block into deterministic page fragments without relayout", () => {
    const accepted = acceptedLines(7, { heightPt: 10 })
    const before = JSON.stringify(accepted)
    const result = paginateVNextTextBlockV4Lines(accepted, { pageBodyHeightPt: 30, startPageIndex: 2 })

    expect(result.status).toBe("paginated")
    if (result.status !== "paginated") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.summary).toEqual({
      pageCount: 3, fragmentCount: 3, lineCount: 7, splitAcrossPages: true, totalMeasuredHeightPt: 70,
    })
    expect(result.pages.map((page) => [page.pageIndex, page.usedHeightPt, page.remainingHeightPt])).toEqual([
      [2, 30, 0], [3, 30, 0], [4, 10, 20],
    ])
    expect(result.fragments.map((fragment) => ({
      id: fragment.fragmentId,
      nodeId: fragment.nodeId,
      range: [fragment.lineStartIndex, fragment.lineEndIndexExclusive],
    }))).toEqual([
      { id: "body-text:page-2:lines-0-2", nodeId: "body-text", range: [0, 3] },
      { id: "body-text:page-3:lines-3-5", nodeId: "body-text", range: [3, 6] },
      { id: "body-text:page-4:lines-6-6", nodeId: "body-text", range: [6, 7] },
    ])
    expect(result.fragments[0].lines.map((line) => [line.pageLineIndex, line.yOffsetPt])).toEqual([
      [0, 0], [1, 10], [2, 20],
    ])
    expect(result.contracts).toEqual({
      authoredNodeMutation: false,
      authoredIdentityAllocation: false,
      lineRelayout: false,
      rendererRelayout: false,
    })
    expect(JSON.stringify(accepted)).toBe(before)
  })

  it("retains resolved field source offsets when one field wraps across pages", () => {
    const accepted = acceptedLines(4, { heightPt: 12, fieldEvery: 1 })
    const result = paginateVNextTextBlockV4Lines(accepted, { pageBodyHeightPt: 24 })

    expect(result.status).toBe("paginated")
    if (result.status !== "paginated") throw new Error("pagination blocked")
    expect(result.pages).toHaveLength(2)
    expect(result.fragments[0].sourceEnd).toMatchObject({
      inlineId: "customer-field", authoredOffset: 0, resolvedOffset: 10,
    })
    expect(result.fragments[1].sourceStart).toMatchObject({
      inlineId: "customer-field", authoredOffset: 0, resolvedOffset: 10,
    })
    expect(result.fragments.every((fragment) => fragment.nodeId === "body-text")).toBe(true)
  })

  it("proves representative 250-page text-block scale with bounded page slices", () => {
    const accepted = acceptedLines(6_000, { heightPt: 10 })
    const startedAt = performance.now()

    const result = paginateVNextTextBlockV4Lines(accepted, { pageBodyHeightPt: 240 })
    const elapsedMs = performance.now() - startedAt

    expect(result.status).toBe("paginated")
    if (result.status !== "paginated") throw new Error("pagination blocked")
    expect(result.summary).toEqual({
      pageCount: 250,
      fragmentCount: 250,
      lineCount: 6_000,
      splitAcrossPages: true,
      totalMeasuredHeightPt: 60_000,
    })
    expect(result.pages[0].fragments[0].lines).toHaveLength(24)
    expect(result.pages[249].fragments[0].lines).toHaveLength(24)
    expect(elapsedMs).toBeLessThan(1_500)
  })

  it("blocks invalid page options and any measured line taller than the page body", () => {
    const accepted = acceptedLines(2, { heightPt: 20 })

    expect(paginateVNextTextBlockV4Lines(accepted, { pageBodyHeightPt: 0 })).toMatchObject({
      status: "blocked", issues: [expect.objectContaining({ code: "invalid-page-body-height" })],
    })
    const tooTall = paginateVNextTextBlockV4Lines(accepted, { pageBodyHeightPt: 10 })
    expect(tooTall.status).toBe("blocked")
    expect(tooTall.issues.some((item) => item.code === "line-exceeds-page-body")).toBe(true)
    expect(paginateVNextTextBlockV4Lines(accepted, { pageBodyHeightPt: 30, startPageIndex: -1 })).toMatchObject({
      status: "blocked", issues: [expect.objectContaining({ code: "invalid-start-page-index" })],
    })
  })

  it("keeps page fragments renderer-ready but does not render or mutate authored identity", () => {
    const source = readFileSync(new URL("../src/pagination/textBlockV4Pagination.ts", import.meta.url), "utf8")
    expect(source).not.toContain("measureVNextText")
    expect(source).not.toContain("renderVNext")
    expect(source).not.toContain("document.document.sections")
    expect(source).not.toContain("fetch(")
  })

  it("publishes Phase 279 without claiming mixed-document readiness", () => {
    const doc = readFileSync(new URL("../docs/TEXT_BLOCK_V4_LINE_PAGINATION.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("measured-line fragments and representative scale acceptance")
    expect(doc).toContain("One canonical text-block may produce many page fragments")
    expect(doc).toContain("6,000 accepted measured lines")
    expect(doc).toContain("not a claim that a complete")
    expect(readme).toContain("Phase 279 paginates accepted v4 text lines")
    expect(ledger).toContain("## Phase 279 Text-block V4 Line Pagination")
  })
})
