import { describe, expect, it } from "vitest"
import {
  planVNextColumnsV4Lane,
  type VNextColumnsV4ChildFragmentSource,
} from "../src/index.js"

function source(
  nodeId: string,
  heights: number[],
  keepPolicy: "allow-split" | "prefer-together" = "allow-split",
): VNextColumnsV4ChildFragmentSource {
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
    keepPolicy,
    candidates,
    prefixHeightsPt,
    totalHeightPt: total,
    fingerprint: `${nodeId}:${keepPolicy}:${heights.join(",")}`,
  }
}

describe("columns v4 single-lane planner", () => {
  it("advances monotonically across child sources and resumes from its cursor", () => {
    const sources = [source("first", [20, 20]), source("second", [30])]
    const first = planVNextColumnsV4Lane({
      columnId: "left",
      sources,
      availableHeightPt: 50,
      pageBodyHeightPt: 100,
    })
    expect(first).toMatchObject({
      status: "planned",
      usedHeightPt: 40,
      complete: false,
      needsFreshPage: true,
      continuationReason: "page-full",
      cursorAfter: {
        columnId: "left",
        complete: false,
        child: { childIndex: 1, childNodeId: "second", fragmentIndex: 0 },
      },
      placements: [
        { fragmentId: "first:line-0", childIndex: 0, yOffsetPt: 0 },
        { fragmentId: "first:line-1", childIndex: 0, yOffsetPt: 20 },
      ],
    })
    if (first.status !== "planned") throw new Error("first lane plan blocked")

    const second = planVNextColumnsV4Lane({
      columnId: "left",
      sources,
      availableHeightPt: 100,
      pageBodyHeightPt: 100,
      cursor: first.cursorAfter,
    })
    expect(second).toMatchObject({
      status: "planned",
      usedHeightPt: 30,
      complete: true,
      continuationReason: "complete",
      cursorAfter: { complete: true, child: { childIndex: 2, childNodeId: null, fragmentIndex: 0 } },
    })
  })

  it("moves a fitting prefer-together child to a fresh page without cursor mutation", () => {
    const sources = [source("card", [30, 30], "prefer-together")]
    const plan = planVNextColumnsV4Lane({
      columnId: "left",
      sources,
      availableHeightPt: 50,
      pageBodyHeightPt: 100,
    })

    expect(plan).toMatchObject({
      status: "planned",
      usedHeightPt: 0,
      needsFreshPage: true,
      continuationReason: "keep-move-whole",
      cursorBefore: { child: { childIndex: 0, fragmentIndex: 0 } },
      cursorAfter: { child: { childIndex: 0, fragmentIndex: 0 } },
      placements: [],
    })
  })

  it("falls back to legal splitting when prefer-together content exceeds a full page", () => {
    const plan = planVNextColumnsV4Lane({
      columnId: "left",
      sources: [source("long-card", [60, 60], "prefer-together")],
      availableHeightPt: 100,
      pageBodyHeightPt: 100,
    })

    expect(plan).toMatchObject({
      status: "planned",
      usedHeightPt: 60,
      complete: false,
      continuationReason: "page-full",
      placements: [{ fragmentId: "long-card:line-0" }],
    })
  })

  it("completes empty sources and blocks oversized fragments or invalid cursors", () => {
    const empty = planVNextColumnsV4Lane({
      columnId: "empty",
      sources: [source("empty-text", [])],
      availableHeightPt: 100,
      pageBodyHeightPt: 100,
    })
    const oversized = planVNextColumnsV4Lane({
      columnId: "left",
      sources: [source("oversized", [120])],
      availableHeightPt: 100,
      pageBodyHeightPt: 100,
    })
    const invalid = planVNextColumnsV4Lane({
      columnId: "left",
      sources: [source("first", [20])],
      availableHeightPt: 100,
      pageBodyHeightPt: 100,
      cursor: {
        columnId: "other",
        complete: false,
        child: { childIndex: 0, childNodeId: "first", fragmentIndex: 0 },
      },
    })

    expect(empty).toMatchObject({ status: "planned", complete: true, usedHeightPt: 0 })
    expect(oversized).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "fragment-exceeds-page-body" })],
    })
    expect(invalid).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "cursor-column-mismatch" })],
    })
  })

  it("retains legal checkpoints and bounded lookup work facts", () => {
    const plan = planVNextColumnsV4Lane({
      columnId: "left",
      sources: [source("body", [10, 10, 10, 10, 10])],
      availableHeightPt: 35,
      pageBodyHeightPt: 100,
    })

    expect(plan).toMatchObject({
      status: "planned",
      checkpoints: [
        { checkpointIndex: 0, usedHeightPt: 0 },
        { checkpointIndex: 1, usedHeightPt: 10 },
        { checkpointIndex: 2, usedHeightPt: 20 },
        { checkpointIndex: 3, usedHeightPt: 30 },
      ],
      workFacts: { checkpointLookupCount: 1, consumedFragmentCount: 3 },
    })
  })
})
