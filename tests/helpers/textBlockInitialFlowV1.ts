import {
  createVNextAuthoredBoxPlanV1,
  createVNextLayoutUnitPolicyV1,
  createVNextTextBlockInitialFlowParentRegionV1,
  type TextBlockNodeV4Target,
  type VNextTextBlockInitialFlowBuildInputV1,
  type VNextTextBlockMultiRunLayoutRequestV1,
  type VNextTextBlockV4MeasurementRequest,
} from "../../src/index.js"

const fontFaces = [{
  fontFaceId: "sarabun-regular",
  fontFamily: "Sarabun",
  fontSha256: "a".repeat(64),
  weight: 400,
  style: "normal" as const,
  unitsPerEm: 1_000,
  ascentFontUnit: 800,
  descentFontUnit: -200,
  lineGapFontUnit: 100,
}]

const paragraphStyle = {
  styleKey: "paragraph-body",
  fontFaceId: "sarabun-regular",
  fontSizeLayoutUnit: 12_000_000,
  textColor: "202020",
}

function boxAndParent(textBlock: TextBlockNodeV4Target) {
  const box = createVNextAuthoredBoxPlanV1({ ownerNode: textBlock, availableWidthPt: 100 })
  if (box.status !== "ready") throw new Error("box fixture blocked")
  const parent = createVNextTextBlockInitialFlowParentRegionV1({
    ownerKind: "body",
    ownerId: "body-zone",
    xLayoutUnit: 0,
    yLayoutUnit: 0,
    widthLayoutUnit: 100_000_000,
    availableHeightLayoutUnit: null,
  })
  if (parent.status !== "accepted") throw new Error("parent fixture blocked")
  return { authoredBoxPlan: box.plan, parentRegion: parent.region }
}

function buildInput(
  textBlock: TextBlockNodeV4Target,
  measurement: VNextTextBlockV4MeasurementRequest,
): VNextTextBlockInitialFlowBuildInputV1 {
  return {
    textBlock,
    measurement,
    ...boxAndParent(textBlock),
    layoutUnitPolicyFingerprint: createVNextLayoutUnitPolicyV1().fingerprint,
    paragraphStyle,
    fontFaces,
  }
}

export function completeTextGeometryBuildInputFixture(): VNextTextBlockInitialFlowBuildInputV1 {
  const textBlock: TextBlockNodeV4Target = {
    id: "text-block-complete-text",
    type: "text-block",
    role: { role: "paragraph" },
    props: {
      textStyleId: "body",
      box: {
        padding: {
          top: { value: 2, unit: "pt" },
          right: { value: 5, unit: "pt" },
          bottom: { value: 2, unit: "pt" },
          left: { value: 5, unit: "pt" },
        },
      },
    },
    children: [
      { id: "text-a", type: "text", text: "A" },
      { id: "field-b", type: "field-ref", key: "customer.initial" },
      { id: "page-c", type: "page-number" },
      { id: "break", type: "line-break" },
    ],
  }
  return buildInput(textBlock, {
    documentId: "document-1",
    instanceRevision: 7,
    sectionId: "section-1",
    textBlockId: textBlock.id,
    availableWidthPt: 90,
    measurementProfileId: "profile-1",
    styleKey: "paragraph-body",
    renderedText: "AB3\n",
    runs: [
      {
        inlineId: "text-a", kind: "text", renderStartOffset: 0, renderEndOffset: 1,
        renderedText: "A", styleKey: "paragraph-body",
      },
      {
        inlineId: "field-b", kind: "resolved-field", renderStartOffset: 1, renderEndOffset: 2,
        renderedText: "B", fieldKey: "customer.initial", styleKey: "paragraph-body",
      },
      {
        inlineId: "page-c", kind: "generated-page-number", renderStartOffset: 2, renderEndOffset: 3,
        renderedText: "3", generatedOwnerFingerprint: `sha256:${"b".repeat(64)}`,
        styleKey: "paragraph-body",
      },
      {
        inlineId: "break", kind: "hard-break", renderStartOffset: 3, renderEndOffset: 4,
        renderedText: "\n",
      },
    ],
  })
}

export function listImageGeometryBuildInputFixture(): VNextTextBlockInitialFlowBuildInputV1 {
  const frame = {
    width: { value: 10, unit: "pt" as const },
    height: { value: 12, unit: "pt" as const },
    fit: "contain" as const,
  }
  const textBlock: TextBlockNodeV4Target = {
    id: "text-block-list-image",
    type: "text-block",
    role: {
      role: "list-item",
      list: { instanceId: "list-1", level: 1, itemId: "item-1", startAt: 2 },
    },
    props: {
      box: {
        padding: {
          top: { value: 2, unit: "pt" },
          right: { value: 5, unit: "pt" },
          bottom: { value: 2, unit: "pt" },
          left: { value: 5, unit: "pt" },
        },
      },
    },
    children: [
      { id: "text-a", type: "text", text: "A" },
      {
        id: "image-1",
        type: "inline-image",
        source: { kind: "asset-ref", assetId: "asset-1" },
        accessibility: { kind: "decorative" },
        frame,
        verticalAlign: "middle",
      },
    ],
  }
  return buildInput(textBlock, {
    documentId: "document-1",
    instanceRevision: 7,
    sectionId: "section-1",
    textBlockId: textBlock.id,
    availableWidthPt: 90,
    measurementProfileId: "profile-1",
    styleKey: "paragraph-body",
    renderedText: "A\uFFFC",
    runs: [
      {
        inlineId: "text-a", kind: "text", renderStartOffset: 0, renderEndOffset: 1,
        renderedText: "A", styleKey: "paragraph-body",
      },
      {
        inlineId: "image-1", kind: "inline-image", renderStartOffset: 1, renderEndOffset: 2,
        renderedText: "\uFFFC", assetId: "asset-1", frame,
      },
    ],
  })
}

export function legacyTextOnlyBuildInputFixture(): VNextTextBlockInitialFlowBuildInputV1 {
  const textBlock: TextBlockNodeV4Target = {
    id: "text-block-legacy",
    type: "text-block",
    role: { role: "paragraph" },
    props: {
      box: {
        padding: {
          top: { value: 2, unit: "pt" },
          right: { value: 5, unit: "pt" },
          bottom: { value: 2, unit: "pt" },
          left: { value: 5, unit: "pt" },
        },
      },
    },
    children: [{ id: "text-abc", type: "text", text: "ABC" }],
  }
  return buildInput(textBlock, {
    documentId: "document-1",
    instanceRevision: 7,
    sectionId: "section-1",
    textBlockId: textBlock.id,
    availableWidthPt: 90,
    measurementProfileId: "profile-1",
    styleKey: "paragraph-body",
    renderedText: "ABC",
    runs: [{
      inlineId: "text-abc", kind: "text", renderStartOffset: 0, renderEndOffset: 3,
      renderedText: "ABC", styleKey: "paragraph-body",
    }],
  })
}

export function emptyGeometryBuildInputFixture(): VNextTextBlockInitialFlowBuildInputV1 {
  const input = legacyTextOnlyBuildInputFixture()
  input.textBlock = { ...input.textBlock, children: [] }
  input.measurement = { ...input.measurement, renderedText: "", runs: [] }
  return input
}

export function legacyTextOnlyLayoutRequestFixture(): VNextTextBlockMultiRunLayoutRequestV1 {
  const input = legacyTextOnlyBuildInputFixture()
  return {
    layoutId: "layout-legacy-1",
    measurement: input.measurement,
    layoutUnitPolicyFingerprint: input.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: 90_000_000,
    declaredLineHeightLayoutUnit: 14_000_000,
    paragraphStyle: input.paragraphStyle,
    fontFaces: input.fontFaces,
    shapingRuns: [{
      shapingRunId: "shape-abc",
      renderStartOffset: 0,
      renderEndOffset: 3,
      text: "ABC",
      styleKey: "paragraph-body",
      fontFaceId: "sarabun-regular",
      fontSizeLayoutUnit: 12_000_000,
      textColor: "202020",
      direction: "ltr",
      baselineShiftLayoutUnit: 0,
      features: [],
      clusters: [
        { index: 0, renderStartOffset: 0, renderEndOffset: 1, advanceLayoutUnit: 6_000_000 },
        { index: 1, renderStartOffset: 1, renderEndOffset: 2, advanceLayoutUnit: 6_000_000 },
        { index: 2, renderStartOffset: 2, renderEndOffset: 3, advanceLayoutUnit: 6_000_000 },
      ],
    }],
    breakOffsets: [0, 3],
    lines: [{ index: 0, renderStartOffset: 0, renderEndOffset: 3 }],
  }
}
