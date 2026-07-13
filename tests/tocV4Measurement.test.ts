import { describe, expect, it } from "vitest"
import {
  collectVNextTocV4Semantics,
  compareVNextTocV4Measurements,
  createApproximateVNextTextMeasurer,
  createVNextTextMeasurementCache,
  measureVNextTocV4,
  refitVNextTocV4Measurement,
  type DocumentNodeV4Target,
  type VNextTocV4MeasurementSpec,
} from "../src/index.js"

function semantic() {
  const margin = { value: 40, unit: "pt" as const }
  const document: DocumentNodeV4Target = {
    version: 4,
    document: { id: "toc-measure", sections: [{
      id: "main", type: "section",
      page: { size: "A4", orientation: "portrait", margin: { top: margin, right: margin, bottom: margin, left: margin } },
      zoneIds: ["body"], nodes: {
        body: { id: "body", type: "zone", role: "body", childIds: ["toc", "one", "two"] },
        toc: { id: "toc", type: "toc", props: { title: "Contents" } },
        one: { id: "one", type: "text-block", role: { role: "heading", level: 1 }, props: {}, children: [{ id: "one-text", type: "text", text: "Short" }] },
        two: { id: "two", type: "text-block", role: { role: "heading", level: 2 }, props: {}, children: [{ id: "two-text", type: "text", text: "A very long heading that wraps" }] },
      },
    }] },
  }
  return collectVNextTocV4Semantics(document)
}

function spec(): VNextTocV4MeasurementSpec {
  return {
    availableWidthPt: 180, availableHeightPt: 200, measurementProfileId: "toc-test",
    titleStyleKey: "toc-title", pageNumberStyleKey: "toc-page",
    entryStyleKeyByLevel: { "1": "toc-1", "2": "toc-2", "3": "toc-3", "4": "toc-4", "5": "toc-5", "6": "toc-6" },
    indentPtByLevel: { "1": 0, "2": 18, "3": 36, "4": 54, "5": 72, "6": 90 },
    pageNumberColumnWidthPt: 24, pageNumberCapacityDigits: 3,
    labelToLeaderGapPt: 4, minimumLeaderWidthPt: 12, leaderToPageNumberGapPt: 4,
    titleGapAfterPt: 8, rowGapPt: 3, maximumEntryCount: 10, maximumMeasuredLineCount: 20,
  }
}

describe("TOC v4 measurement", () => {
  it("measures title and keep-together rows with fixed number and non-overlapping leader geometry", () => {
    const source = semantic()
    const before = JSON.stringify(source)
    const cache = createVNextTextMeasurementCache()
    const measurer = createApproximateVNextTextMeasurer({ charWidthPt: 6, lineHeightPt: 14 })
    const first = measureVNextTocV4({ semantic: source, tocNodeId: "toc", spec: spec(), textMeasurer: measurer, measurementCache: cache })
    const second = measureVNextTocV4({ semantic: source, tocNodeId: "toc", spec: spec(), textMeasurer: measurer, measurementCache: cache })

    expect(first.status).toBe("measured")
    if (first.status !== "measured" || second.status !== "measured") throw new Error("measurement blocked")
    expect(first).toMatchObject({
      title: { text: "Contents", breakPolicy: "keep-with-first-entry" },
      pageNumberProof: { sample: "888", capacityDigits: 3, lineCount: 1, columnWidthPt: 24 },
      summary: { entryCount: 2, fit: "fits", forcedOverflowHeadingNodeIds: [] },
      contracts: { pagination: "not-run", rendering: "not-run", persistence: "not-run", editorStateMutation: false },
    })
    expect(first.rows.map((row) => row.pageNumber.xPt)).toEqual([156, 156])
    expect(first.rows[1].indentPt).toBe(18)
    expect(first.rows[1].label.lines.length).toBeGreaterThan(1)
    first.rows.forEach((row) => {
      expect(row.breakPolicy).toBe("keep-together")
      expect(row.leader.xEndPt).toBeLessThan(row.pageNumber.xPt)
      expect(row.leader.widthPt).toBeGreaterThanOrEqual(12)
    })
    expect(first.work.cacheMissCount).toBe(4)
    expect(second.work.cacheHitCount).toBe(4)
    expect(second.fingerprint).toBe(first.fingerprint)
    expect(first.geometryFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(first.fitFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(first.fingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(JSON.stringify(source)).toBe(before)
  })

  it("reports split/forced overflow and blocks impossible geometry or budgets", () => {
    const source = semantic()
    const measurer = createApproximateVNextTextMeasurer({ charWidthPt: 6, lineHeightPt: 14 })
    expect(measureVNextTocV4({
      semantic: source, tocNodeId: "toc", spec: { ...spec(), availableHeightPt: 20 }, textMeasurer: measurer,
    })).toMatchObject({ status: "measured", summary: { fit: "forced-row-overflow", forcedOverflowHeadingNodeIds: ["two"] } })
    expect(measureVNextTocV4({
      semantic: source, tocNodeId: "toc", spec: { ...spec(), maximumEntryCount: 1 }, textMeasurer: measurer,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "entry-budget-exceeded" })] })
    expect(measureVNextTocV4({
      semantic: source, tocNodeId: "toc", spec: { ...spec(), pageNumberColumnWidthPt: 6 }, textMeasurer: measurer,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "page-number-capacity-overflow" })] })
  })

  it("refits height without text measurement or geometry drift and classifies impact", () => {
    const source = semantic()
    const measured = measureVNextTocV4({
      semantic: source, tocNodeId: "toc", spec: spec(),
      textMeasurer: createApproximateVNextTextMeasurer({ charWidthPt: 6, lineHeightPt: 14 }),
    })
    const refit = refitVNextTocV4Measurement({ measurement: measured, availableHeightPt: 30 })
    expect(refit).toMatchObject({
      status: "measured", summary: { fit: "split-required" },
      work: { textMeasurementCount: 0, cacheHitCount: 0, cacheMissCount: 0, uncachedCount: 0 },
    })
    if (measured.status !== "measured" || refit.status !== "measured") throw new Error("refit fixture blocked")
    expect(refit.geometryFingerprint).toBe(measured.geometryFingerprint)
    expect(refit.fitFingerprint).not.toBe(measured.fitFingerprint)
    expect(refit.rows).toEqual(measured.rows)
    expect(compareVNextTocV4Measurements({ before: measured, after: refit })).toEqual({
      status: "fit-only", textRemeasurementRequired: false,
      fitRecalculationRequired: true, paginationInvalidated: true,
    })
    expect(compareVNextTocV4Measurements({ before: measured, after: measured })).toEqual({
      status: "unchanged", textRemeasurementRequired: false,
      fitRecalculationRequired: false, paginationInvalidated: false,
    })
  })

  it("blocks malformed measurer geometry", () => {
    const result = measureVNextTocV4({
      semantic: semantic(), tocNodeId: "toc", spec: spec(),
      textMeasurer: {
        measure(input) {
          return {
            lines: [input.text], lineHeightPt: 14, widthPt: input.availableWidthPt + 1, heightPt: 14,
            lineBoxes: [{
              index: 0, text: input.text, startOffset: 0, endOffset: input.text.length,
              widthPt: input.availableWidthPt + 1, heightPt: 14, yOffsetPt: 0,
            }],
          }
        },
      },
    })
    expect(result).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "page-number-capacity-overflow" })],
    })
  })
})
