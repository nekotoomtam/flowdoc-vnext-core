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

  it("compares content widths as canonical positive layout units", () => {
    const equivalent = completeTextGeometryBuildInputFixture()
    equivalent.measurement = clone(equivalent.measurement)
    equivalent.measurement.availableWidthPt = 90.0000004

    expect(createVNextTextBlockInitialFlowV1(equivalent)).toMatchObject({
      status: "classified",
      issues: [],
    })

    const drift = completeTextGeometryBuildInputFixture()
    drift.measurement = clone(drift.measurement)
    drift.measurement.availableWidthPt = 90.000001
    expect(createVNextTextBlockInitialFlowV1(drift)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "authored-box-width-mismatch" })]),
    })
  })

  it("requires nonblank measurement provenance", () => {
    const input = completeTextGeometryBuildInputFixture()
    input.measurement = clone(input.measurement)
    input.measurement.measurementProfileId = " "

    expect(createVNextTextBlockInitialFlowV1(input)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "measurement-identity-mismatch" })]),
    })
  })

  it("requires every producer-styled run to pin the measurement style", () => {
    const cases: Array<{ index: number; styleKey: string | undefined }> = [
      { index: 0, styleKey: undefined },
      { index: 1, styleKey: "other-style" },
      { index: 2, styleKey: " " },
    ]
    cases.forEach(({ index, styleKey }) => {
      const input = completeTextGeometryBuildInputFixture()
      input.measurement = clone(input.measurement)
      const run = input.measurement.runs[index]
      if (run == null) throw new Error("styled run fixture missing")
      run.styleKey = styleKey

      expect(createVNextTextBlockInitialFlowV1(input)).toMatchObject({
        status: "blocked",
        issues: expect.arrayContaining([expect.objectContaining({ code: "style-context-mismatch" })]),
      })
    })
  })

  it("requires compact lowercase generated owner fingerprints", () => {
    const input = completeTextGeometryBuildInputFixture()
    input.measurement = clone(input.measurement)
    const run = input.measurement.runs[2]
    if (run?.kind !== "generated-page-number") throw new Error("page-number run fixture missing")
    run.generatedOwnerFingerprint = `sha256:${"B".repeat(64)}`

    expect(createVNextTextBlockInitialFlowV1(input)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "inline-projection-mismatch" })]),
    })
  })

  it("requires generated page-number runs to retain a non-empty positive range", () => {
    const input = completeTextGeometryBuildInputFixture()
    input.measurement = clone(input.measurement)
    input.measurement.renderedText = "AB\n"
    const generated = input.measurement.runs[2]
    const hardBreak = input.measurement.runs[3]
    if (generated?.kind !== "generated-page-number" || hardBreak?.kind !== "hard-break") {
      throw new Error("generated value fixture missing")
    }
    generated.renderedText = ""
    generated.renderEndOffset = generated.renderStartOffset
    hardBreak.renderStartOffset = generated.renderEndOffset
    hardBreak.renderEndOffset = hardBreak.renderStartOffset + 1

    expect(createVNextTextBlockInitialFlowV1(input)).toMatchObject({
      status: "blocked",
      flow: null,
      issues: expect.arrayContaining([expect.objectContaining({ code: "inline-projection-mismatch" })]),
    })
  })

  it("enforces the accepted font style, weight, and metric invariants", () => {
    const mutations: Array<(face: ReturnType<typeof completeTextGeometryBuildInputFixture>["fontFaces"][number]) => void> = [
      (face) => { (face as unknown as { style: string }).style = "oblique" },
      (face) => { face.weight = 99 },
      (face) => { face.weight = 901 },
      (face) => { face.ascentFontUnit = 0 },
      (face) => { face.descentFontUnit = 1 },
      (face) => { face.lineGapFontUnit = -1 },
    ]
    mutations.forEach((mutate) => {
      const input = completeTextGeometryBuildInputFixture()
      input.fontFaces = clone(input.fontFaces)
      const face = input.fontFaces[0]
      if (face == null) throw new Error("font fixture missing")
      mutate(face)

      expect(createVNextTextBlockInitialFlowV1(input)).toMatchObject({
        status: "blocked",
        issues: expect.arrayContaining([expect.objectContaining({ code: "invalid-font-context" })]),
      })
    })
  })

  it("blocks selected paragraph font metrics whose scaling multiplication is unsafe", () => {
    const input = completeTextGeometryBuildInputFixture()
    input.paragraphStyle = {
      ...input.paragraphStyle,
      fontSizeLayoutUnit: Number.MAX_SAFE_INTEGER,
    }

    expect(createVNextTextBlockInitialFlowV1(input)).toMatchObject({
      status: "blocked",
      flow: null,
      issues: expect.arrayContaining([expect.objectContaining({ code: "invalid-font-context" })]),
    })
  })

  it("pins direct image assets while accepting resolved field-backed assets", () => {
    const direct = listImageGeometryBuildInputFixture()
    direct.measurement = clone(direct.measurement)
    const directRun = direct.measurement.runs[1]
    if (directRun?.kind !== "inline-image") throw new Error("direct image run fixture missing")
    directRun.assetId = "asset-other"
    expect(createVNextTextBlockInitialFlowV1(direct)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "inline-projection-mismatch" })]),
    })

    const field = listImageGeometryBuildInputFixture()
    field.textBlock = clone(field.textBlock)
    const fieldInline = field.textBlock.children[1]
    if (fieldInline?.type !== "inline-image") throw new Error("field image inline fixture missing")
    fieldInline.source = { kind: "image-field-ref", fieldKey: "customer.logo" }
    field.measurement = clone(field.measurement)
    const fieldRun = field.measurement.runs[1]
    if (fieldRun?.kind !== "inline-image") throw new Error("field image run fixture missing")
    fieldRun.assetId = "asset-resolved"
    expect(createVNextTextBlockInitialFlowV1(field)).toMatchObject({
      status: "classified",
      flow: {
        atoms: expect.arrayContaining([
          expect.objectContaining({ kind: "inline-image", assetId: "asset-resolved" }),
        ]),
      },
      issues: [],
    })
  })

  it("canonicalizes retained font faces by fontFaceId before fingerprinting", () => {
    const first = completeTextGeometryBuildInputFixture()
    const regular = clone(first.fontFaces[0])
    if (regular == null) throw new Error("font fixture missing")
    const bold = {
      ...regular,
      fontFaceId: "sarabun-bold",
      fontSha256: "c".repeat(64),
      weight: 700,
    }
    first.fontFaces = [bold, regular]

    const second = completeTextGeometryBuildInputFixture()
    second.fontFaces = [clone(regular), clone(bold)]

    const firstResult = createVNextTextBlockInitialFlowV1(first)
    const secondResult = createVNextTextBlockInitialFlowV1(second)
    expect(firstResult).toEqual(secondResult)
    expect(firstResult).toMatchObject({
      status: "classified",
      flow: {
        fontFaces: [
          { fontFaceId: "sarabun-bold" },
          { fontFaceId: "sarabun-regular" },
        ],
      },
      issues: [],
    })
  })
})
