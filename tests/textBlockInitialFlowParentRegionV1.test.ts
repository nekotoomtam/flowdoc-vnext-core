import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockInitialFlowParentRegionV1,
  inspectVNextTextBlockInitialFlowParentRegionV1,
} from "../src/index.js"

describe("TextBlock Initial Flow parent region v1", () => {
  it("creates deterministic immutable body, column, and table-cell regions", () => {
    for (const ownerKind of ["body", "column", "table-cell"] as const) {
      const input = {
        ownerKind,
        ownerId: `${ownerKind}-owner`,
        xLayoutUnit: 10_000_000,
        yLayoutUnit: 20_000_000,
        widthLayoutUnit: 100_000_000,
        availableHeightLayoutUnit: ownerKind === "body" ? null : 200_000_000,
      }
      const first = createVNextTextBlockInitialFlowParentRegionV1(input)
      const second = createVNextTextBlockInitialFlowParentRegionV1(input)

      expect(first).toEqual(second)
      expect(first).toMatchObject({
        status: "accepted",
        region: {
          source: "vnext-text-block-initial-flow-parent-region-v1",
          contractVersion: 1,
          kind: "text-block-parent-region",
          ownerKind,
          ownerId: `${ownerKind}-owner`,
          widthLayoutUnit: 100_000_000,
        },
        issues: [],
      })
      if (first.status !== "accepted") throw new Error("parent region blocked")
      expect(inspectVNextTextBlockInitialFlowParentRegionV1(first.region)).toEqual({ status: "valid" })
      expect(Object.isFrozen(first.region)).toBe(true)
    }
  })

  it("blocks invalid geometry and detects fingerprint tampering", () => {
    expect(createVNextTextBlockInitialFlowParentRegionV1({
      ownerKind: "body",
      ownerId: " ",
      xLayoutUnit: -1,
      yLayoutUnit: 0,
      widthLayoutUnit: 0,
      availableHeightLayoutUnit: -1,
    })).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "invalid-parent-region" }),
      ]),
    })

    const accepted = createVNextTextBlockInitialFlowParentRegionV1({
      ownerKind: "table-cell",
      ownerId: "cell-1",
      xLayoutUnit: 0,
      yLayoutUnit: 0,
      widthLayoutUnit: 100_000_000,
      availableHeightLayoutUnit: 200_000_000,
    })
    if (accepted.status !== "accepted") throw new Error("parent region blocked")
    const tampered = JSON.parse(JSON.stringify(accepted.region)) as typeof accepted.region
    tampered.widthLayoutUnit += 1
    expect(inspectVNextTextBlockInitialFlowParentRegionV1(tampered)).toMatchObject({
      status: "invalid",
      code: "parent-region-fingerprint-mismatch",
    })
  })
})
