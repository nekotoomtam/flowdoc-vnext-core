import { describe, expect, it } from "vitest"
import {
  collectVNextTocV4Semantics,
  createApproximateVNextTextMeasurer,
  measureVNextTocV4,
  refitVNextTocV4Measurement,
  type DocumentNodeV4Target,
  type VNextTocV4MeasurementSpec,
} from "../src/index.js"

const ENTRY_COUNT = 1_000

function semantic() {
  const nodes: Record<string, any> = {
    body: { id: "body", type: "zone", role: "body", childIds: ["toc", ...Array.from({ length: ENTRY_COUNT }, (_, index) => `h-${index}`)] },
    toc: { id: "toc", type: "toc", props: { title: "Contents" } },
  }
  for (let index = 0; index < ENTRY_COUNT; index += 1) nodes[`h-${index}`] = {
    id: `h-${index}`, type: "text-block", role: { role: "heading", level: (index % 6) + 1 }, props: {},
    children: [{ id: `h-${index}-text`, type: "text", text: `Heading ${index}` }],
  }
  const margin = { value: 40, unit: "pt" as const }
  const document: DocumentNodeV4Target = {
    version: 4, document: { id: "toc-measure-scale", sections: [{
      id: "main", type: "section",
      page: { size: "A4", orientation: "portrait", margin: { top: margin, right: margin, bottom: margin, left: margin } },
      zoneIds: ["body"], nodes,
    }] },
  }
  return collectVNextTocV4Semantics(document)
}

function spec(): VNextTocV4MeasurementSpec {
  return {
    availableWidthPt: 480, availableHeightPt: 700, measurementProfileId: "toc-scale",
    titleStyleKey: "title", pageNumberStyleKey: "page",
    entryStyleKeyByLevel: { "1": "l1", "2": "l2", "3": "l3", "4": "l4", "5": "l5", "6": "l6" },
    indentPtByLevel: { "1": 0, "2": 12, "3": 24, "4": 36, "5": 48, "6": 60 },
    pageNumberColumnWidthPt: 30, pageNumberCapacityDigits: 4,
    labelToLeaderGapPt: 4, minimumLeaderWidthPt: 12, leaderToPageNumberGapPt: 4,
    titleGapAfterPt: 8, rowGapPt: 2,
    maximumEntryCount: ENTRY_COUNT, maximumMeasuredLineCount: ENTRY_COUNT + 2,
  }
}

describe("TOC v4 measurement scale", () => {
  it("measures 1,000 entries deterministically with exact work and geometry", () => {
    const source = semantic()
    const measurer = createApproximateVNextTextMeasurer({ charWidthPt: 6, lineHeightPt: 14 })
    const first = measureVNextTocV4({ semantic: source, tocNodeId: "toc", spec: spec(), textMeasurer: measurer })
    const second = measureVNextTocV4({ semantic: source, tocNodeId: "toc", spec: spec(), textMeasurer: measurer })
    expect(first.status).toBe("measured")
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
    if (first.status !== "measured") throw new Error("scale measurement blocked")
    expect(first.summary).toEqual({
      entryCount: ENTRY_COUNT, measuredLineCount: ENTRY_COUNT + 2,
      totalHeightPt: 16_020, minimumFirstFragmentHeightPt: 36,
      fit: "split-required", forcedOverflowHeadingNodeIds: [],
    })
    expect(first.work).toEqual({
      textMeasurementCount: ENTRY_COUNT + 2,
      cacheHitCount: 0, cacheMissCount: 0, uncachedCount: ENTRY_COUNT + 2,
    })
    expect(first.rows[999]).toMatchObject({ headingNodeId: "h-999", tocOrdinal: 999, pageNumber: { xPt: 450 } })
    const forced = refitVNextTocV4Measurement({ measurement: first, availableHeightPt: 10 })
    expect(forced).toMatchObject({
      status: "measured",
      summary: { fit: "forced-row-overflow" },
      work: { textMeasurementCount: 0 },
    })
    if (forced.status === "measured") expect(forced.summary.forcedOverflowHeadingNodeIds).toHaveLength(ENTRY_COUNT)
  }, 15_000)

  it("blocks one unit below exact entry and line budgets", () => {
    const source = semantic()
    const measurer = createApproximateVNextTextMeasurer({ charWidthPt: 6, lineHeightPt: 14 })
    expect(measureVNextTocV4({
      semantic: source, tocNodeId: "toc",
      spec: { ...spec(), maximumEntryCount: ENTRY_COUNT - 1 }, textMeasurer: measurer,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "entry-budget-exceeded" })] })
    expect(measureVNextTocV4({
      semantic: source, tocNodeId: "toc",
      spec: { ...spec(), maximumMeasuredLineCount: ENTRY_COUNT + 1 }, textMeasurer: measurer,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "line-budget-exceeded" })] })
  }, 15_000)
})
