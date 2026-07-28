import {
  acceptVNextTextBlockFlowEvidenceV2,
  createVNextTextBlockSpatialIndexV2,
  createVNextTextBlockPersistentFlowTreeV2,
  createVNextTextBlockInitialFlowV1,
  type UnitValueV4Target,
  type VNextTextBlockFlowEvidenceInputV2,
  type VNextTextBlockFlowEvidenceV2,
  type VNextTextBlockInitialFlowV1,
  type VNextTextBlockResolvedShapingRunV1,
  type VNextTextBlockSyntheticPositionedObjectInputV1,
  type VNextTextBlockV4MeasurementRun,
} from "../../src/index.js"
import {
  completeTextGeometryBuildInputFixture,
  listImageGeometryBuildInputFixture,
} from "./textBlockInitialFlowV1.js"

export interface InlineImageFlowFixtureOptions {
  content?:
    | "image-only"
    | "text-image-text"
    | "text-image-text-break"
    | "adjacent-images"
    | "adjacent-text"
    | "text-only"
    | "thai-image-latin"
    | "field-image-page-break"
  verticalAlign?: "baseline" | "middle" | "text-bottom"
  width?: UnitValueV4Target
  height?: UnitValueV4Target
  fit?: "contain" | "cover"
  crop?: { x: number; y: number; width: number; height: number }
  assetId?: string | null
  mixedTextSizes?: boolean
  breakOffsets?: readonly number[]
  entries?: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
}

function shapingRun(
  atom: Extract<VNextTextBlockInitialFlowV1["atoms"][number], {
    kind: "text" | "resolved-field" | "generated-page-number"
  }>,
  index: number,
): VNextTextBlockResolvedShapingRunV1 {
  return {
    shapingRunId: `shape-${index}-${atom.inlineId}`,
    renderStartOffset: atom.renderStartOffset,
    renderEndOffset: atom.renderEndOffset,
    text: atom.renderedText,
    styleKey: atom.resolvedGeometryStyle.effectiveShapingStyleKey,
    fontFaceId: atom.resolvedGeometryStyle.fontFaceId,
    fontSizeLayoutUnit: atom.resolvedGeometryStyle.fontSizeLayoutUnit,
    textColor: atom.resolvedGeometryStyle.textColor,
    direction: "ltr",
    baselineShiftLayoutUnit: 0,
    features: [],
    clusters: [...atom.renderedText].map((text, clusterIndex) => {
      const precedingText = [...atom.renderedText].slice(0, clusterIndex).join("")
      const renderStartOffset = atom.renderStartOffset + precedingText.length
      return {
        index: clusterIndex,
        renderStartOffset,
        renderEndOffset: renderStartOffset + text.length,
        advanceLayoutUnit: 6_000_000,
      }
    }),
  }
}

export function acceptedInlineImageEvidenceFixture(
  options: InlineImageFlowFixtureOptions = {},
): {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
} {
  const buildInput = listImageGeometryBuildInputFixture()
  const sourceText = buildInput.textBlock.children[0]
  const sourceImage = buildInput.textBlock.children[1]
  const sourceTextRun = buildInput.measurement.runs[0]
  const sourceImageRun = buildInput.measurement.runs[1]
  if (
    sourceText?.type !== "text"
    || sourceImage?.type !== "inline-image"
    || sourceTextRun?.kind !== "text"
    || sourceImageRun?.kind !== "inline-image"
  ) throw new Error("inline-image flow fixture source missing")

  const content = options.content ?? "text-image-text"
  const assetId = options.assetId === undefined ? "asset-1" : options.assetId
  const frame = {
    ...sourceImage.frame,
    width: options.width ?? sourceImage.frame.width,
    height: options.height ?? sourceImage.frame.height,
    fit: options.fit ?? sourceImage.frame.fit,
    ...(options.crop === undefined ? {} : { crop: options.crop }),
  }
  const imageSource = assetId == null
    ? { kind: "image-field-ref" as const, fieldKey: "customer.logo" }
    : { kind: "asset-ref" as const, assetId }
  const image = {
    ...sourceImage,
    id: "image-1",
    source: imageSource,
    frame,
    verticalAlign: options.verticalAlign ?? sourceImage.verticalAlign,
  }
  const imageRun: VNextTextBlockV4MeasurementRun = {
    ...sourceImageRun,
    inlineId: image.id,
    assetId,
    frame,
  }
  const textA = { ...sourceText, id: "text-a", text: "A" }
  const textARun: VNextTextBlockV4MeasurementRun = {
    ...sourceTextRun,
    inlineId: textA.id,
    renderedText: "A",
  }
  const textB = { ...sourceText, id: "text-b", text: "B" }
  const textF = { ...sourceText, id: "text-f", text: "f" }
  const textI = { ...sourceText, id: "text-i", text: "i" }
  const hardBreak = { id: "break-1", type: "line-break" as const }
  const secondImage = {
    ...image,
    id: "image-2",
  }
  const thai = { ...sourceText, id: "text-thai", text: "ก" }
  const latin = {
    ...sourceText,
    id: "text-latin",
    text: "Z",
    ...(options.mixedTextSizes
      ? { style: { fontSize: { value: 24, unit: "pt" as const } } }
      : {}),
  }
  const completeText = completeTextGeometryBuildInputFixture()
  const field = completeText.textBlock.children[1]
  const page = completeText.textBlock.children[2]
  const fieldRun = completeText.measurement.runs[1]
  const pageRun = completeText.measurement.runs[2]

  let children
  let runs: VNextTextBlockV4MeasurementRun[]
  if (content === "image-only") {
    children = [image]
    runs = [{ ...imageRun, renderStartOffset: 0, renderEndOffset: 1 }]
  } else if (content === "adjacent-images") {
    children = [image, secondImage]
    runs = [
      { ...imageRun, renderStartOffset: 0, renderEndOffset: 1 },
      { ...imageRun, inlineId: secondImage.id, renderStartOffset: 1, renderEndOffset: 2 },
    ]
  } else if (content === "text-only") {
    children = [textA]
    runs = [{ ...textARun, renderStartOffset: 0, renderEndOffset: 1 }]
  } else if (content === "adjacent-text") {
    children = [textF, textI]
    runs = [
      { ...textARun, inlineId: textF.id, renderStartOffset: 0, renderEndOffset: 1, renderedText: "f" },
      { ...textARun, inlineId: textI.id, renderStartOffset: 1, renderEndOffset: 2, renderedText: "i" },
    ]
  } else if (content === "thai-image-latin") {
    children = [thai, image, latin]
    runs = [
      { ...textARun, inlineId: thai.id, renderStartOffset: 0, renderEndOffset: 1, renderedText: "ก" },
      { ...imageRun, renderStartOffset: 1, renderEndOffset: 2 },
      {
        ...textARun,
        inlineId: latin.id,
        renderStartOffset: 2,
        renderEndOffset: 3,
        renderedText: "Z",
        ...(options.mixedTextSizes
          ? { localStyle: { fontSize: { value: 24, unit: "pt" as const } } }
          : {}),
      },
    ]
  } else if (
    content === "field-image-page-break"
    && field?.type === "field-ref"
    && page?.type === "page-number"
    && fieldRun?.kind === "resolved-field"
    && pageRun?.kind === "generated-page-number"
  ) {
    children = [field, image, page, hardBreak]
    runs = [
      { ...fieldRun, renderStartOffset: 0, renderEndOffset: 1 },
      { ...imageRun, renderStartOffset: 1, renderEndOffset: 2 },
      { ...pageRun, renderStartOffset: 2, renderEndOffset: 3 },
      {
        inlineId: hardBreak.id,
        kind: "hard-break",
        renderStartOffset: 3,
        renderEndOffset: 4,
        renderedText: "\n",
      },
    ]
  } else if (content === "text-image-text-break") {
    children = [textA, image, textB, hardBreak]
    runs = [
      { ...textARun, renderStartOffset: 0, renderEndOffset: 1 },
      { ...imageRun, renderStartOffset: 1, renderEndOffset: 2 },
      {
        ...textARun,
        inlineId: textB.id,
        renderStartOffset: 2,
        renderEndOffset: 3,
        renderedText: "B",
      },
      {
        inlineId: hardBreak.id,
        kind: "hard-break",
        renderStartOffset: 3,
        renderEndOffset: 4,
        renderedText: "\n",
      },
    ]
  } else {
    children = [textA, image, textB]
    runs = [
      { ...textARun, renderStartOffset: 0, renderEndOffset: 1 },
      { ...imageRun, renderStartOffset: 1, renderEndOffset: 2 },
      {
        ...textARun,
        inlineId: textB.id,
        renderStartOffset: 2,
        renderEndOffset: 3,
        renderedText: "B",
      },
    ]
  }

  const renderedText = runs.map((run) => run.renderedText).join("")
  const initial = createVNextTextBlockInitialFlowV1({
    ...buildInput,
    textBlock: {
      ...buildInput.textBlock,
      role: { role: "paragraph" },
      children,
    },
    measurement: {
      ...buildInput.measurement,
      renderedText,
      runs,
    },
  })
  if (initial.status !== "classified") throw new Error("Initial Flow fixture blocked")

  const fontFaces = initial.flow.fontFaces.map(({ fontFamilyKey: _key, ...face }) => ({ ...face }))
  const shapingRuns = initial.flow.atoms.flatMap((atom, index) => (
    atom.kind === "text"
    || atom.kind === "resolved-field"
    || atom.kind === "generated-page-number"
      ? [shapingRun(atom, index)]
      : []
  ))
  if (content === "adjacent-text") {
    const first = initial.flow.atoms[0]
    if (first?.kind !== "text") throw new Error("adjacent text flow fixture missing")
    shapingRuns.splice(0, shapingRuns.length, {
      ...shapingRun(first, 0),
      renderEndOffset: 2,
      text: "fi",
      clusters: [{ index: 0, renderStartOffset: 0, renderEndOffset: 2, advanceLayoutUnit: 6_000_000 }],
    })
  }
  const evidenceInput: VNextTextBlockFlowEvidenceInputV2 = {
    initialFlowFingerprint: initial.flow.fingerprint,
    layoutId: "inline-image-flow-v2",
    measurement: initial.flow.measurement,
    layoutUnitPolicyFingerprint: initial.flow.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: 90_000_000,
    declaredLineHeightLayoutUnit: initial.flow.declaredLineHeightLayoutUnit,
    paragraphStyle: initial.flow.paragraphStyle,
    fontFaces,
    shapingRuns,
    breakOffsets: [
      ...(options.breakOffsets
        ?? Array.from({ length: renderedText.length + 1 }, (_value, index) => index)),
    ],
  }
  void options.entries
  const accepted = acceptVNextTextBlockFlowEvidenceV2({
    initialFlow: initial.flow,
    evidenceInput,
  })
  if (accepted.status !== "accepted") throw new Error("flow evidence fixture blocked")
  return {
    initialFlow: initial.flow,
    evidence: accepted.evidence,
  }
}

export function acceptedInlineImageFlowTreeFixture(
  options: InlineImageFlowFixtureOptions = {},
) {
  const fixture = acceptedInlineImageEvidenceFixture(options)
  const built = createVNextTextBlockPersistentFlowTreeV2({
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
  })
  if (built.status !== "accepted") throw new Error("persistent V2 flow fixture blocked")
  return { ...fixture, tree: built.tree }
}

export function acceptedInlineImageSpatialFixture(
  options: InlineImageFlowFixtureOptions = {},
) {
  const fixture = acceptedInlineImageFlowTreeFixture(options)
  const built = createVNextTextBlockSpatialIndexV2({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
    persistentFlowTree: fixture.tree,
    entries: options.entries ?? [],
  })
  if (built.status !== "accepted") throw new Error("V2 spatial index fixture blocked")
  return { ...fixture, spatialIndex: built.index }
}
