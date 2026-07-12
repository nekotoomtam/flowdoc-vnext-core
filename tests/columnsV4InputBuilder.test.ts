import { describe, expect, it } from "vitest"
import fixture from "../fixtures/product-report-v4-migrated-minimal.flowdoc.json"
import {
  DocumentNodeV4TargetSchema,
  createVNextColumnsV4NestedInput,
  paginateVNextNestedColumnsV4,
  type DocumentNodeV4Target,
  type VNextTextBlockV4MeasuredLinesResult,
} from "../src/index.js"

function documentFixture(): DocumentNodeV4Target {
  return DocumentNodeV4TargetSchema.parse(structuredClone(fixture.document))
}

function measured(nodeId: string, heights: number[]): VNextTextBlockV4MeasuredLinesResult {
  let offset = 0
  const lines = heights.map((heightPt, index) => {
    const startOffset = offset
    offset += 1
    const point = (value: number) => ({
      textBlockId: nodeId,
      inlineId: `${nodeId}-run`,
      authoredOffset: value,
      resolvedOffset: value,
      affinity: "forward" as const,
    })
    return {
      index,
      startOffset,
      endOffset: offset,
      text: "x",
      widthPt: 10,
      heightPt,
      sourceStart: point(startOffset),
      sourceEnd: point(offset),
    }
  })
  return {
    source: "vnext-text-block-v4-measurement",
    version: 1,
    status: "accepted",
    textBlockId: nodeId,
    lines,
    issues: [],
    summary: {
      lineCount: lines.length,
      renderedLength: offset,
      totalHeightPt: heights.reduce((sum, value) => sum + value, 0),
    },
  }
}

const capabilities = { maxNestingDepth: 3 as const, minimumTrackWidthPt: 80 }

describe("columns v4 canonical input builder", () => {
  it("assembles canonical column order, geometry, and accepted text sources", () => {
    const document = documentFixture()
    const before = JSON.stringify(document)
    const built = createVNextColumnsV4NestedInput({
      document,
      sectionId: "section-cover",
      columnsId: "summary-columns",
      availableWidthPt: 500,
      capabilities,
      measuredTextByNodeId: {
        "summary-left-text": measured("summary-left-text", [20, 20]),
        "summary-right-text": measured("summary-right-text", [30]),
      },
    })

    expect(built).toMatchObject({
      status: "ready",
      columns: {
        geometry: {
          columnsId: "summary-columns",
          tracks: [
            { columnId: "summary-left", widthPt: 244 },
            { columnId: "summary-right", widthPt: 244 },
          ],
        },
        lanes: [
          { columnId: "summary-left", items: [{ kind: "fragments", nodeId: "summary-left-text" }] },
          { columnId: "summary-right", items: [{ kind: "fragments", nodeId: "summary-right-text" }] },
        ],
      },
    })
    expect(JSON.stringify(document)).toBe(before)
    if (built.status !== "ready") throw new Error("canonical Columns input blocked")
    expect(paginateVNextNestedColumnsV4({
      columns: built.columns,
      pageBodyHeightPt: 100,
      maximumPageCount: 5,
    })).toMatchObject({
      status: "paginated",
      pages: [{ usedHeightPt: 40, complete: true }],
    })
  })

  it("recursively derives nested width from the parent track", () => {
    const document = documentFixture()
    const section = document.document.sections[0]
    const left = section.nodes["summary-left"]
    if (left.type !== "column") throw new Error("left column missing")
    left.childIds.push("nested-columns")
    section.nodes["nested-columns"] = {
      id: "nested-columns", type: "columns", props: { gap: 4 }, columnIds: ["nested-column"],
    }
    section.nodes["nested-column"] = {
      id: "nested-column", type: "column", props: { widthShare: 100 }, childIds: ["nested-text"],
    }
    section.nodes["nested-text"] = {
      id: "nested-text", type: "text-block", role: { role: "paragraph" }, props: {},
      children: [{ id: "nested-run", type: "text", text: "Nested" }],
    }

    const built = createVNextColumnsV4NestedInput({
      document,
      sectionId: "section-cover",
      columnsId: "summary-columns",
      availableWidthPt: 500,
      capabilities,
      measuredTextByNodeId: {
        "summary-left-text": measured("summary-left-text", [20]),
        "summary-right-text": measured("summary-right-text", [20]),
        "nested-text": measured("nested-text", [30]),
      },
    })

    expect(built.status).toBe("ready")
    if (built.status !== "ready") throw new Error("nested Columns input blocked")
    const leftLane = built.columns.lanes.find((lane) => lane.columnId === "summary-left")
    const nestedItem = leftLane?.items.find((item) => item.kind === "columns")
    expect(leftLane?.items.map((item) => [item.kind, item.nodeId])).toEqual([
      ["fragments", "summary-left-text"],
      ["columns", "nested-columns"],
    ])
    expect(nestedItem?.kind === "columns" && nestedItem.columns.geometry).toMatchObject({
      availableWidthPt: 244,
      tracks: [{ widthPt: 244 }],
    })
  })

  it("blocks missing text evidence and child families without split contracts", () => {
    const missing = createVNextColumnsV4NestedInput({
      document: documentFixture(),
      sectionId: "section-cover",
      columnsId: "summary-columns",
      availableWidthPt: 500,
      capabilities,
      measuredTextByNodeId: {},
    })
    const withTable = documentFixture()
    const section = withTable.document.sections[0]
    const zone = section.nodes["zone-cover-body"]
    const left = section.nodes["summary-left"]
    if (zone.type !== "zone" || left.type !== "column") throw new Error("fixture parents missing")
    zone.childIds = zone.childIds.filter((id) => id !== "detail-table")
    left.childIds.push("detail-table")
    const unsupported = createVNextColumnsV4NestedInput({
      document: withTable,
      sectionId: "section-cover",
      columnsId: "summary-columns",
      availableWidthPt: 500,
      capabilities,
      measuredTextByNodeId: {
        "summary-left-text": measured("summary-left-text", [20]),
        "summary-right-text": measured("summary-right-text", [20]),
      },
    })

    expect(missing).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "missing-text-fragment-source" }),
      ]),
    })
    expect(unsupported).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "unsupported-columns-child-fragment", columnId: "summary-left" })],
    })
  })
})
