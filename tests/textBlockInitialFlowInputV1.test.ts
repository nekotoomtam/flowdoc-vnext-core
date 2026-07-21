import { describe, expect, it } from "vitest"
import { createVNextTextBlockInitialFlowV1 } from "../src/index.js"
import {
  completeTextGeometryBuildInputFixture,
  emptyGeometryBuildInputFixture,
  listImageGeometryBuildInputFixture,
} from "./helpers/textBlockInitialFlowV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("TextBlock Initial Flow input v1", () => {
  it("classifies the complete current text subset with all geometry owners pinned", () => {
    const input = completeTextGeometryBuildInputFixture()
    const before = JSON.stringify(input)
    const first = createVNextTextBlockInitialFlowV1(input)
    const second = createVNextTextBlockInitialFlowV1(input)

    expect(first).toEqual(second)
    expect(first).toMatchObject({
      status: "classified",
      flow: {
        source: "vnext-text-block-initial-flow-v1",
        contractVersion: 1,
        layoutDisposition: "text-subset-ready",
        role: { role: "paragraph" },
        capabilities: {
          styledText: "ready",
          resolvedField: "ready",
          generatedPageNumber: "ready",
          hardBreak: "ready",
          inlineImage: "not-present",
          listDecoration: "not-present",
          emptyBlock: "not-present",
          authoredBox: "ready",
          positionedObjects: "not-present",
        },
        contracts: {
          canonicalDocumentMutation: false,
          geometryDependenciesPinned: true,
          textOnlyAdapterEligible: true,
          mayPublishLayout: false,
          productionBinding: false,
        },
      },
      issues: [],
    })
    if (first.status !== "classified") throw new Error("flow blocked")
    expect(first.flow.atoms.map((atom) => atom.kind)).toEqual([
      "text", "resolved-field", "generated-page-number", "hard-break",
    ])
    expect(first.flow.authoredBoxPlan.contentWidthPt).toBe(90)
    expect(Object.isFrozen(first.flow)).toBe(true)
    expect(JSON.stringify(input)).toBe(before)
  })

  it("retains list and complete inline-image facts while blocking unsupported geometry", () => {
    const result = createVNextTextBlockInitialFlowV1(listImageGeometryBuildInputFixture())
    expect(result).toMatchObject({
      status: "classified",
      flow: {
        layoutDisposition: "geometry-contract-required",
        role: {
          role: "list-item",
          list: { instanceId: "list-1", level: 1, itemId: "item-1", startAt: 2 },
        },
        capabilities: {
          inlineImage: "blocked-line-box-contract",
          listDecoration: "blocked-decoration-contract",
          positionedObjects: "not-present",
        },
        contracts: { textOnlyAdapterEligible: false },
      },
    })
    if (result.status !== "classified") throw new Error("flow blocked")
    expect(result.flow.atoms[1]).toMatchObject({
      kind: "inline-image",
      inlineId: "image-1",
      assetId: "asset-1",
      frame: { width: { value: 10, unit: "pt" }, height: { value: 12, unit: "pt" } },
      verticalAlign: "middle",
    })
  })

  it("retains a canonical empty block but reports the missing empty-layout contract", () => {
    expect(createVNextTextBlockInitialFlowV1(emptyGeometryBuildInputFixture())).toMatchObject({
      status: "classified",
      flow: {
        layoutDisposition: "geometry-contract-required",
        atoms: [],
        capabilities: { emptyBlock: "blocked-empty-layout-contract" },
        contracts: { textOnlyAdapterEligible: false },
      },
    })
  })

  it("blocks stale parent, box-width, image-frame, and typography facts", () => {
    const parent = completeTextGeometryBuildInputFixture()
    parent.parentRegion = clone(parent.parentRegion)
    parent.parentRegion.widthLayoutUnit += 1

    const width = completeTextGeometryBuildInputFixture()
    width.measurement = clone(width.measurement)
    width.measurement.availableWidthPt = 91

    const image = listImageGeometryBuildInputFixture()
    image.measurement = clone(image.measurement)
    const imageRun = image.measurement.runs[1]
    if (imageRun?.kind !== "inline-image" || imageRun.frame == null) throw new Error("image fixture missing")
    imageRun.frame.width.value = 11

    const style = completeTextGeometryBuildInputFixture()
    style.paragraphStyle = { ...style.paragraphStyle, styleKey: "other-style" }

    expect(createVNextTextBlockInitialFlowV1(parent)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "invalid-parent-region" })]),
    })
    expect(createVNextTextBlockInitialFlowV1(width)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "authored-box-width-mismatch" })]),
    })
    expect(createVNextTextBlockInitialFlowV1(image)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "inline-projection-mismatch" })]),
    })
    expect(createVNextTextBlockInitialFlowV1(style)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "style-context-mismatch" })]),
    })
  })
})
