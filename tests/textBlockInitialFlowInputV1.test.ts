import { describe, expect, it } from "vitest"
import * as core from "../src/index.js"
import {
  completeTextGeometryBuildInputFixture,
  emptyGeometryBuildInputFixture,
  hardBreakOnlyGeometryBuildInputFixture,
  imageOnlyGeometryBuildInputFixture,
  legacyTextOnlyBuildInputFixture,
  listImageGeometryBuildInputFixture,
  listOnlyGeometryBuildInputFixture,
  mixedTypographyBuildInputFixture,
  mixedTypographyLayoutRequestFixture,
  renderedEmptyFieldGeometryBuildInputFixture,
} from "./helpers/textBlockInitialFlowV1.js"

const { createVNextTextBlockInitialFlowV1 } = core

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function reverseObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => reverseObjectKeys(item))
  if (value == null || typeof value !== "object") return value
  return Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [
    key,
    reverseObjectKeys(item),
  ]))
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
    expect(first.flow.declaredLineHeightLayoutUnit).toBe(14_000_000)
    const inspectInitialFlow = (core as unknown as Record<string, unknown>)[
      "inspectVNextTextBlockInitialFlowV1"
    ]
    expect(inspectInitialFlow).toBeTypeOf("function")
    if (typeof inspectInitialFlow === "function") {
      expect(inspectInitialFlow(first.flow)).toMatchObject({ status: "valid" })
    }
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

  it("blocks a list-only TextBlock on the decoration contract independently", () => {
    expect(createVNextTextBlockInitialFlowV1(listOnlyGeometryBuildInputFixture())).toMatchObject({
      status: "classified",
      flow: {
        layoutDisposition: "geometry-contract-required",
        capabilities: {
          inlineImage: "not-present",
          listDecoration: "blocked-decoration-contract",
          emptyBlock: "not-present",
        },
        contracts: { textOnlyAdapterEligible: false },
      },
    })
  })

  it("blocks an inline-image-only TextBlock on the line-box contract independently", () => {
    expect(createVNextTextBlockInitialFlowV1(imageOnlyGeometryBuildInputFixture())).toMatchObject({
      status: "classified",
      flow: {
        layoutDisposition: "geometry-contract-required",
        capabilities: {
          inlineImage: "blocked-line-box-contract",
          listDecoration: "not-present",
          emptyBlock: "not-present",
        },
        contracts: { textOnlyAdapterEligible: false },
      },
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

  it("classifies an effectively rendered-empty field as requiring the empty-layout contract", () => {
    expect(createVNextTextBlockInitialFlowV1(renderedEmptyFieldGeometryBuildInputFixture())).toMatchObject({
      status: "classified",
      flow: {
        layoutDisposition: "geometry-contract-required",
        capabilities: { emptyBlock: "blocked-empty-layout-contract" },
        contracts: { textOnlyAdapterEligible: false },
      },
    })
  })

  it("keeps a hard-break-only row fail-closed at the empty-layout boundary", () => {
    expect(createVNextTextBlockInitialFlowV1(hardBreakOnlyGeometryBuildInputFixture())).toMatchObject({
      status: "classified",
      flow: {
        layoutDisposition: "geometry-contract-required",
        capabilities: {
          hardBreak: "ready",
          emptyBlock: "blocked-empty-layout-contract",
        },
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

  it("resolves font size, color, weight, and style for every text-bearing atom", () => {
    const result = createVNextTextBlockInitialFlowV1(mixedTypographyBuildInputFixture())
    const [regularKey, boldKey, italicKey, paragraphKey] =
      mixedTypographyLayoutRequestFixture().shapingRuns.map((run) => run.styleKey)

    expect(result).toMatchObject({ status: "classified", issues: [] })
    if (result.status !== "classified") throw new Error("mixed typography fixture blocked")
    expect(result.flow.atoms.map((atom) => (
      atom.kind === "hard-break" || atom.kind === "inline-image"
        ? null
        : atom.resolvedGeometryStyle
    ))).toEqual([
      {
        measurementStyleKey: "paragraph-body",
        effectiveShapingStyleKey: regularKey,
        fontFamilyKey: "sarabun",
        fontFaceId: "sarabun-regular",
        fontSizeLayoutUnit: 10_000_000,
        textColor: "101010",
        fontWeight: 400,
        fontStyle: "normal",
        textDecoration: "underline",
        strikethrough: true,
      },
      {
        measurementStyleKey: "paragraph-body",
        effectiveShapingStyleKey: boldKey,
        fontFamilyKey: "sarabun",
        fontFaceId: "sarabun-bold",
        fontSizeLayoutUnit: 24_000_000,
        textColor: "303030",
        fontWeight: 700,
        fontStyle: "normal",
        textDecoration: "none",
        strikethrough: false,
      },
      {
        measurementStyleKey: "paragraph-body",
        effectiveShapingStyleKey: italicKey,
        fontFamilyKey: "sarabun",
        fontFaceId: "sarabun-italic",
        fontSizeLayoutUnit: 12_000_000,
        textColor: "202020",
        fontWeight: 400,
        fontStyle: "italic",
        textDecoration: "none",
        strikethrough: false,
      },
      {
        measurementStyleKey: "paragraph-body",
        effectiveShapingStyleKey: paragraphKey,
        fontFamilyKey: "sarabun",
        fontFaceId: "sarabun-regular",
        fontSizeLayoutUnit: 12_000_000,
        textColor: "202020",
        fontWeight: 400,
        fontStyle: "normal",
        textDecoration: "none",
        strikethrough: false,
      },
    ])
  })

  it("blocks unmappable font family keys and missing or ambiguous static faces", () => {
    const familyKey = mixedTypographyBuildInputFixture()
    familyKey.textBlock = clone(familyKey.textBlock)
    familyKey.measurement = clone(familyKey.measurement)
    const familyInline = familyKey.textBlock.children[0]
    const familyRun = familyKey.measurement.runs[0]
    if (familyInline?.type !== "text" || familyRun?.kind !== "text") {
      throw new Error("font family fixture missing")
    }
    familyInline.style = { ...familyInline.style, fontFamilyKey: "sarabun" }
    familyRun.localStyle = { ...familyRun.localStyle, fontFamilyKey: "sarabun" }

    const missing = mixedTypographyBuildInputFixture()
    missing.fontFaces = missing.fontFaces.filter((face) => face.fontFaceId !== "sarabun-bold")

    const ambiguous = mixedTypographyBuildInputFixture()
    const bold = ambiguous.fontFaces.find((face) => face.fontFaceId === "sarabun-bold")
    if (bold == null) throw new Error("bold face fixture missing")
    ambiguous.fontFaces = [
      ...ambiguous.fontFaces,
      { ...bold, fontFaceId: "sarabun-bold-alternate", fontSha256: "d".repeat(64) },
    ]

    for (const input of [familyKey, missing, ambiguous]) {
      expect(createVNextTextBlockInitialFlowV1(input)).toMatchObject({
        status: "blocked",
        flow: null,
        issues: expect.arrayContaining([expect.objectContaining({ code: "resolved-run-typography" })]),
      })
    }
  })

  it("requires the authoritative paragraph family key to be nonblank and match its face", () => {
    const blank = legacyTextOnlyBuildInputFixture()
    blank.paragraphFontFamilyKey = " "
    const mismatched = legacyTextOnlyBuildInputFixture()
    mismatched.paragraphFontFamilyKey = "different-family"

    for (const input of [blank, mismatched]) {
      expect(createVNextTextBlockInitialFlowV1(input)).toMatchObject({
        status: "blocked",
        flow: null,
        issues: expect.arrayContaining([expect.objectContaining({ code: "invalid-font-context" })]),
      })
    }
  })

  it("blocks malformed and missing runtime inputs without throwing", () => {
    const omittedMeasurement = completeTextGeometryBuildInputFixture() as unknown as Record<string, unknown>
    delete omittedMeasurement.measurement
    const nullMeasurement = completeTextGeometryBuildInputFixture() as unknown as Record<string, unknown>
    nullMeasurement.measurement = null
    const omittedStyle = completeTextGeometryBuildInputFixture() as unknown as Record<string, unknown>
    delete omittedStyle.paragraphStyle
    const omittedFaces = completeTextGeometryBuildInputFixture() as unknown as Record<string, unknown>
    delete omittedFaces.fontFaces
    const omittedLineHeight = completeTextGeometryBuildInputFixture() as unknown as Record<string, unknown>
    delete omittedLineHeight.declaredLineHeightLayoutUnit
    const omittedTextBlock = completeTextGeometryBuildInputFixture() as unknown as Record<string, unknown>
    delete omittedTextBlock.textBlock
    const nullBox = completeTextGeometryBuildInputFixture() as unknown as Record<string, unknown>
    nullBox.authoredBoxPlan = null
    const omittedParent = completeTextGeometryBuildInputFixture() as unknown as Record<string, unknown>
    delete omittedParent.parentRegion
    const nullPolicy = completeTextGeometryBuildInputFixture() as unknown as Record<string, unknown>
    nullPolicy.layoutUnitPolicyFingerprint = null

    for (const input of [
      null,
      7,
      {},
      omittedMeasurement,
      nullMeasurement,
      omittedStyle,
      omittedFaces,
      omittedLineHeight,
      omittedTextBlock,
      nullBox,
      omittedParent,
      nullPolicy,
    ]) {
      let result: ReturnType<typeof createVNextTextBlockInitialFlowV1> | undefined
      expect(() => {
        result = createVNextTextBlockInitialFlowV1(
          input as Parameters<typeof createVNextTextBlockInitialFlowV1>[0],
        )
      }).not.toThrow()
      expect(result).toMatchObject({ status: "blocked", flow: null })
    }
  })

  it("blocks unknown nested measurement and typography fields", () => {
    const measurement = completeTextGeometryBuildInputFixture() as unknown as {
      measurement: Record<string, unknown>
    }
    measurement.measurement.untrustedGeometry = { width: 90 }

    const run = completeTextGeometryBuildInputFixture()
    run.measurement = clone(run.measurement)
    ;(run.measurement.runs[0] as unknown as Record<string, unknown>).untrustedProvenance = "external"

    const paragraph = completeTextGeometryBuildInputFixture()
    ;(paragraph.paragraphStyle as unknown as Record<string, unknown>).untrustedTypography = true

    const face = completeTextGeometryBuildInputFixture()
    face.fontFaces = clone(face.fontFaces)
    ;(face.fontFaces[0] as unknown as Record<string, unknown>).untrustedDigestOwner = "external"

    for (const input of [measurement, run, paragraph, face]) {
      expect(createVNextTextBlockInitialFlowV1(
        input as Parameters<typeof createVNextTextBlockInitialFlowV1>[0],
      )).toMatchObject({ status: "blocked", flow: null })
    }
  })

  it("uses property-order-independent canonical fingerprints", () => {
    const firstInput = completeTextGeometryBuildInputFixture()
    const secondInput = completeTextGeometryBuildInputFixture()
    secondInput.measurement = reverseObjectKeys(secondInput.measurement) as typeof secondInput.measurement

    const first = createVNextTextBlockInitialFlowV1(firstInput)
    const second = createVNextTextBlockInitialFlowV1(secondInput)
    expect(first).toMatchObject({ status: "classified", issues: [] })
    expect(second).toMatchObject({ status: "classified", issues: [] })
    if (first.status !== "classified" || second.status !== "classified") {
      throw new Error("canonical measurement fixture blocked")
    }
    expect(second.flow.fingerprint).toBe(first.flow.fingerprint)
    expect(second.flow).toEqual(first.flow)
  })

  it("converts millimeter run font sizes through the point LayoutUnit policy", () => {
    const input = mixedTypographyBuildInputFixture()
    input.textBlock = clone(input.textBlock)
    input.measurement = clone(input.measurement)
    const inline = input.textBlock.children[0]
    const run = input.measurement.runs[0]
    if (inline?.type !== "text" || run?.kind !== "text") throw new Error("millimeter run fixture missing")
    inline.style = { ...inline.style, fontSize: { value: 25.4, unit: "mm" } }
    run.localStyle = { ...run.localStyle, fontSize: { value: 25.4, unit: "mm" } }

    const result = createVNextTextBlockInitialFlowV1(input)
    expect(result).toMatchObject({ status: "classified", issues: [] })
    if (result.status !== "classified") throw new Error("millimeter run blocked")
    expect(result.flow.atoms[0]).toMatchObject({
      resolvedGeometryStyle: { fontSizeLayoutUnit: 72_000_000 },
      localStyle: { textDecoration: "underline", strikethrough: true },
    })
  })

  it("requires lowercase font digests and ordinal font ordering", () => {
    const uppercase = completeTextGeometryBuildInputFixture()
    uppercase.fontFaces = clone(uppercase.fontFaces)
    uppercase.fontFaces[0]!.fontSha256 = "A".repeat(64)
    expect(createVNextTextBlockInitialFlowV1(uppercase)).toMatchObject({
      status: "blocked",
      flow: null,
      issues: expect.arrayContaining([expect.objectContaining({ code: "invalid-font-context" })]),
    })

    const first = completeTextGeometryBuildInputFixture()
    const regular = clone(first.fontFaces[0]!)
    regular.fontFaceId = "a-face"
    first.paragraphStyle = { ...first.paragraphStyle, fontFaceId: regular.fontFaceId }
    const upper = {
      ...regular,
      fontFaceId: "Z-face",
      fontSha256: "e".repeat(64),
      weight: 700,
    }
    first.fontFaces = [regular, upper]

    const second = completeTextGeometryBuildInputFixture()
    second.paragraphStyle = { ...second.paragraphStyle, fontFaceId: regular.fontFaceId }
    second.fontFaces = [clone(upper), clone(regular)]

    const firstResult = createVNextTextBlockInitialFlowV1(first)
    const secondResult = createVNextTextBlockInitialFlowV1(second)
    expect(firstResult).toEqual(secondResult)
    expect(firstResult).toMatchObject({
      status: "classified",
      flow: { fontFaces: [{ fontFaceId: "Z-face" }, { fontFaceId: "a-face" }] },
      issues: [],
    })
  })
})
