import { describe, expect, it } from "vitest"
import {
  paginateVNextNestedColumnsV4,
  type VNextColumnsV4ChildFragmentSource,
  type VNextColumnsV4Geometry,
  type VNextColumnsV4NestedInput,
} from "../src/index.js"

function source(nodeId: string, lineCount: number): VNextColumnsV4ChildFragmentSource {
  const prefixHeightsPt = Array.from({ length: lineCount + 1 }, (_, index) => index * 10)
  const point = (offset: number) => ({
    textBlockId: nodeId,
    inlineId: `${nodeId}-run`,
    authoredOffset: offset,
    resolvedOffset: offset,
    affinity: "forward" as const,
  })
  return {
    source: "vnext-columns-v4-fragments",
    version: 1,
    kind: "text-block-lines",
    nodeId,
    keepPolicy: "allow-split",
    candidates: Array.from({ length: lineCount }, (_, fragmentIndex) => ({
      fragmentId: `${nodeId}:line-${fragmentIndex}`,
      nodeId,
      fragmentIndex,
      sourceKind: "text-line" as const,
      heightPt: 10,
      breakAfter: true as const,
      sourceStart: point(fragmentIndex),
      sourceEnd: point(fragmentIndex + 1),
    })),
    prefixHeightsPt,
    totalHeightPt: lineCount * 10,
    fingerprint: `${nodeId}:${lineCount}:10`,
  }
}

function geometry(columnsId: string, columnId: string): VNextColumnsV4Geometry {
  return {
    columnsId,
    sectionId: "section-scale",
    availableWidthPt: 240,
    gapPt: 0,
    contentWidthPt: 240,
    tracks: [{ columnId, columnIndex: 0, widthShare: 100, xOffsetPt: 0, widthPt: 240 }],
    fingerprint: `${columnsId}:240:${columnId}`,
  }
}

function scaleInput(): VNextColumnsV4NestedInput {
  const depthThree: VNextColumnsV4NestedInput = {
    geometry: geometry("columns-depth-3", "column-depth-3"),
    lanes: [{
      columnId: "column-depth-3",
      items: [{ kind: "fragments", nodeId: "scale-text", source: source("scale-text", 6_000) }],
    }],
  }
  const depthTwo: VNextColumnsV4NestedInput = {
    geometry: geometry("columns-depth-2", "column-depth-2"),
    lanes: [{
      columnId: "column-depth-2",
      items: [{ kind: "columns", nodeId: "columns-depth-3", columns: depthThree }],
    }],
  }
  return {
    geometry: geometry("columns-depth-1", "column-depth-1"),
    lanes: [{
      columnId: "column-depth-1",
      items: [{ kind: "columns", nodeId: "columns-depth-2", columns: depthTwo }],
    }],
  }
}

describe("columns v4 bounded scale", () => {
  it("paginates 6,000 fragments through depth three into 250 deterministic pages", () => {
    const input = scaleInput()
    const before = JSON.stringify(input)
    const startedAt = performance.now()
    const first = paginateVNextNestedColumnsV4({
      columns: input,
      pageBodyHeightPt: 240,
      maximumPageCount: 300,
    })
    const durationMs = performance.now() - startedAt
    const second = paginateVNextNestedColumnsV4({
      columns: input,
      pageBodyHeightPt: 240,
      maximumPageCount: 300,
    })

    expect(first).toMatchObject({
      status: "paginated",
      workFacts: {
        pageAttemptCount: 250,
        lanePlanCount: 750,
        nestedPlanCount: 500,
        checkpointLookupCount: 250,
        consumedFragmentCount: 6_000,
        maximumObservedDepth: 3,
      },
      contracts: { measurementExecution: false, maximumNestingDepth: 3 },
    })
    if (first.status !== "paginated" || second.status !== "paginated") {
      throw new Error("scale pagination blocked")
    }
    expect(first.pages).toHaveLength(250)
    expect(first.pages[0].usedHeightPt).toBe(240)
    expect(first.pages[249].complete).toBe(true)
    expect(first.pages.map((page) => page.signature)).toEqual(second.pages.map((page) => page.signature))
    expect(first.fingerprint).toBe(second.fingerprint)
    expect(new Set(first.pages.map((page) => page.signature)).size).toBe(250)
    expect(JSON.stringify(input)).toBe(before)
    expect(durationMs).toBeLessThan(5_000)
  })
})
