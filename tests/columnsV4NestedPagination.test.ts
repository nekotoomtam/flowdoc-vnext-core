import { describe, expect, it } from "vitest"
import {
  paginateVNextNestedColumnsV4,
  type VNextColumnsV4ChildFragmentSource,
  type VNextColumnsV4Geometry,
  type VNextColumnsV4NestedInput,
} from "../src/index.js"

function source(nodeId: string, heights: number[]): VNextColumnsV4ChildFragmentSource {
  let total = 0
  const prefixHeightsPt = [0]
  const point = (offset: number) => ({
    textBlockId: nodeId,
    inlineId: `${nodeId}-run`,
    authoredOffset: offset,
    resolvedOffset: offset,
    affinity: "forward" as const,
  })
  const candidates = heights.map((heightPt, fragmentIndex) => {
    total += heightPt
    prefixHeightsPt.push(total)
    return {
      fragmentId: `${nodeId}:line-${fragmentIndex}`,
      nodeId,
      fragmentIndex,
      sourceKind: "text-line" as const,
      heightPt,
      breakAfter: true as const,
      sourceStart: point(fragmentIndex),
      sourceEnd: point(fragmentIndex + 1),
    }
  })
  return {
    source: "vnext-columns-v4-fragments",
    version: 1,
    kind: "text-block-lines",
    nodeId,
    keepPolicy: "allow-split",
    candidates,
    prefixHeightsPt,
    totalHeightPt: total,
    fingerprint: `${nodeId}:${heights.join(",")}`,
  }
}

function oneTrackGeometry(columnsId: string, columnId: string, widthPt: number): VNextColumnsV4Geometry {
  return {
    columnsId,
    sectionId: "section-main",
    availableWidthPt: widthPt,
    gapPt: 0,
    contentWidthPt: widthPt,
    tracks: [{ columnId, columnIndex: 0, widthShare: 100, xOffsetPt: 0, widthPt }],
    fingerprint: `${columnsId}:${widthPt}:${columnId}`,
  }
}

function nestedChain(depth: number, widthPt = 240, level = 2): VNextColumnsV4NestedInput {
  const columnsId = `columns-depth-${level}`
  const columnId = `column-depth-${level}`
  const items = level === depth
    ? [{ kind: "fragments" as const, nodeId: `text-depth-${level}`, source: source(`text-depth-${level}`, [40, 40, 40]) }]
    : [{ kind: "columns" as const, nodeId: `columns-depth-${level + 1}`, columns: nestedChain(depth, widthPt, level + 1) }]
  return {
    geometry: oneTrackGeometry(columnsId, columnId, widthPt),
    lanes: [{ columnId, items }],
  }
}

function outer(innerDepth = 2): VNextColumnsV4NestedInput {
  const geometry: VNextColumnsV4Geometry = {
    columnsId: "outer-columns",
    sectionId: "section-main",
    availableWidthPt: 500,
    gapPt: 20,
    contentWidthPt: 480,
    tracks: [
      { columnId: "outer-left", columnIndex: 0, widthShare: 50, xOffsetPt: 0, widthPt: 240 },
      { columnId: "outer-right", columnIndex: 1, widthShare: 50, xOffsetPt: 260, widthPt: 240 },
    ],
    fingerprint: "outer-columns:500:20",
  }
  return {
    geometry,
    lanes: [
      {
        columnId: "outer-left",
        items: [
          { kind: "fragments", nodeId: "outer-intro", source: source("outer-intro", [20]) },
          { kind: "columns", nodeId: "columns-depth-2", columns: nestedChain(innerDepth) },
        ],
      },
      {
        columnId: "outer-right",
        items: [{ kind: "fragments", nodeId: "outer-right-text", source: source("outer-right-text", [50]) }],
      },
    ],
  }
}

describe("columns v4 nested pagination", () => {
  it("passes parent remainder and width into a nested Columns continuation", () => {
    const input = outer(2)
    const before = JSON.stringify(input)
    const result = paginateVNextNestedColumnsV4({
      columns: input,
      pageBodyHeightPt: 100,
      maximumPageCount: 10,
    })

    expect(result).toMatchObject({
      status: "paginated",
      pages: [
        {
          pageIndex: 0,
          usedHeightPt: 100,
          complete: false,
          columns: [
            {
              columnId: "outer-left",
              usedHeightPt: 100,
              placements: [
                { kind: "fragment", yOffsetPt: 0 },
                {
                  kind: "columns-fragment",
                  yOffsetPt: 20,
                  columnsId: "columns-depth-2",
                  fragment: { availableHeightPt: 80, usedHeightPt: 80, complete: false, columnsDepth: 2 },
                },
              ],
            },
            { columnId: "outer-right", usedHeightPt: 50, complete: true },
          ],
        },
        {
          pageIndex: 1,
          usedHeightPt: 40,
          complete: true,
          columns: [
            {
              columnId: "outer-left",
              placements: [
                {
                  kind: "columns-fragment",
                  yOffsetPt: 0,
                  fragment: { availableHeightPt: 100, usedHeightPt: 40, complete: true },
                },
              ],
            },
            { columnId: "outer-right", usedHeightPt: 0, placements: [] },
          ],
        },
      ],
      workFacts: { maximumObservedDepth: 2, nestedPlanCount: 2 },
      contracts: { maximumNestingDepth: 3, measurementExecution: false },
    })
    expect(JSON.stringify(input)).toBe(before)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("accepts depth three and retains a recursive cursor tree", () => {
    const result = paginateVNextNestedColumnsV4({
      columns: outer(3),
      pageBodyHeightPt: 100,
      maximumPageCount: 10,
    })

    expect(result).toMatchObject({
      status: "paginated",
      workFacts: { maximumObservedDepth: 3 },
      cursorAfter: {
        columnsDepth: 1,
        columns: [{ complete: true }, { complete: true }],
      },
    })
    if (result.status !== "paginated") throw new Error("depth-three pagination blocked")
    const firstNested = result.pages[0].columns[0].placements.find((item) => item.kind === "columns-fragment")
    expect(firstNested?.kind === "columns-fragment" && firstNested.fragment.columnsDepth).toBe(2)
  })

  it("blocks depth four and a nested geometry that ignores parent track width", () => {
    const depthFour = paginateVNextNestedColumnsV4({
      columns: outer(4),
      pageBodyHeightPt: 100,
      maximumPageCount: 10,
    })
    const wrongWidthInput = outer(2)
    const nested = wrongWidthInput.lanes[0].items[1]
    if (nested.kind !== "columns") throw new Error("nested fixture missing")
    nested.columns.geometry.availableWidthPt = 500
    const wrongWidth = paginateVNextNestedColumnsV4({
      columns: wrongWidthInput,
      pageBodyHeightPt: 100,
      maximumPageCount: 10,
    })

    expect(depthFour).toMatchObject({
      status: "blocked",
      cursorAfter: null,
      issues: [expect.objectContaining({ code: "columns-nesting-depth-exceeded", columnsId: "columns-depth-4" })],
    })
    expect(wrongWidth).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "nested-columns-width-mismatch", columnsId: "columns-depth-2" })],
    })
  })
})
