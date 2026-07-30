import type { VNextTextBlockUnifiedLayoutRootResultV1 } from "../../src/layout/textBlockUnifiedLayoutRootContractV1.js"
import {
  createVNextTextBlockUnifiedLayoutRootV1,
} from "../../src/layout/textBlockUnifiedLayoutRootV1.js"
import {
  acceptVNextTextBlockFlowEvidenceV2,
  createVNextAuthoredBoxPlanV1,
  createVNextTextBlockInitialFlowV1,
  type TextBlockNodeV4Target,
  type VNextTextBlockFlowEvidenceInputV2,
  type VNextTextBlockInitialFlowV1,
  type VNextTextBlockResolvedShapingRunV1,
  type VNextTextBlockSyntheticPositionedObjectInputV1,
  type VNextTextBlockV4MeasurementRequest,
  type VNextTextBlockV4MeasurementRun,
} from "../../src/index.js"
import {
  acceptedInlineImageEvidenceFixture,
  type InlineImageFlowFixtureOptions,
} from "./textBlockInlineImageFlowV2.js"

export function acceptedUnifiedLayoutRootFixtureV1(
  options: InlineImageFlowFixtureOptions = {},
): Extract<VNextTextBlockUnifiedLayoutRootResultV1, { status: "accepted" }> {
  const source = acceptedInlineImageEvidenceFixture(options)
  const result = createVNextTextBlockUnifiedLayoutRootV1({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: options.entries ?? [],
  })
  if (result.status !== "accepted") throw new Error("unified root fixture blocked")
  return result
}

export interface RepeatedUnifiedLayoutRootSourceFixtureOptionsV1 {
  lineCount: number
  includeImages: boolean
  spatialEntries?: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
}

function shapingRun(
  atom: Extract<VNextTextBlockInitialFlowV1["atoms"][number], { kind: "text" }>,
  index: number,
): VNextTextBlockResolvedShapingRunV1 {
  return {
    shapingRunId: `repeat-shape-${index}-${atom.inlineId}`,
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
    clusters: [...atom.renderedText].map((value, clusterIndex) => {
      const prefix = [...atom.renderedText].slice(0, clusterIndex).join("")
      const renderStartOffset = atom.renderStartOffset + prefix.length
      return {
        index: clusterIndex,
        renderStartOffset,
        renderEndOffset: renderStartOffset + value.length,
        advanceLayoutUnit: 6_000_000,
      }
    }),
  }
}

/** Creates independent accepted sources for deterministic root-scale evidence. */
export function repeatedUnifiedLayoutRootSourceFixtureV1(
  options: RepeatedUnifiedLayoutRootSourceFixtureOptionsV1,
): {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: Extract<ReturnType<typeof acceptVNextTextBlockFlowEvidenceV2>, { status: "accepted" }> ["evidence"]
  spatialEntries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
} {
  if (!Number.isSafeInteger(options.lineCount) || options.lineCount <= 0) {
    throw new Error("repeated root source requires a positive safe line count")
  }
  const base = acceptedInlineImageEvidenceFixture({ content: "text-image-text" })
  const sourceText = base.initialFlow.measurement.runs[0]
  const sourceImage = base.initialFlow.measurement.runs[1]
  if (
    sourceText?.kind !== "text"
    || sourceImage?.kind !== "inline-image"
    || sourceImage.frame == null
  ) {
    throw new Error("repeated root source fixture base runs missing")
  }
  const children: TextBlockNodeV4Target["children"] = []
  const runs: VNextTextBlockV4MeasurementRun[] = []
  const breakOffsets = [0]
  let renderedText = ""
  let offset = 0
  for (let lineIndex = 0; lineIndex < options.lineCount; lineIndex += 1) {
    const text = "ABCDEFGHIJKL"
    const textId = `repeat-text-${lineIndex}`
    children.push({ id: textId, type: "text", text })
    runs.push({
      ...sourceText,
      inlineId: textId,
      renderStartOffset: offset,
      renderEndOffset: offset + text.length,
      renderedText: text,
    })
    renderedText += text
    offset += text.length
    if (options.includeImages) {
      const imageId = `repeat-image-${lineIndex}`
      children.push({
        id: imageId,
        type: "inline-image",
        source: { kind: "asset-ref", assetId: `repeat-asset-${lineIndex}` },
        accessibility: { kind: "decorative" },
        frame: sourceImage.frame,
        verticalAlign: "middle",
      })
      runs.push({
        ...sourceImage,
        inlineId: imageId,
        assetId: `repeat-asset-${lineIndex}`,
        renderStartOffset: offset,
        renderEndOffset: offset + 1,
      })
      renderedText += "\uFFFC"
      offset += 1
    }
    const breakId = `repeat-break-${lineIndex}`
    children.push({ id: breakId, type: "line-break" })
    runs.push({
      inlineId: breakId,
      kind: "hard-break",
      renderStartOffset: offset,
      renderEndOffset: offset + 1,
      renderedText: "\n",
    })
    renderedText += "\n"
    offset += 1
    breakOffsets.push(offset)
  }
  const textBlock: TextBlockNodeV4Target = {
    id: `text-block-repeat-${options.lineCount}-${options.includeImages ? "mixed" : "text"}`,
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
    children,
  }
  const measurement: VNextTextBlockV4MeasurementRequest = {
    ...base.initialFlow.measurement,
    textBlockId: textBlock.id,
    renderedText,
    runs,
  }
  const box = createVNextAuthoredBoxPlanV1({ ownerNode: textBlock, availableWidthPt: 100 })
  if (box.status !== "ready") throw new Error("repeated root source authored box blocked")
  const initial = createVNextTextBlockInitialFlowV1({
    textBlock,
    measurement,
    authoredBoxPlan: box.plan,
    parentRegion: base.initialFlow.parentRegion,
    layoutUnitPolicyFingerprint: base.initialFlow.layoutUnitPolicyFingerprint,
    declaredLineHeightLayoutUnit: base.initialFlow.declaredLineHeightLayoutUnit,
    paragraphFontFamilyKey: base.initialFlow.paragraphFontFamilyKey,
    paragraphStyle: base.initialFlow.paragraphStyle,
    fontFaces: base.initialFlow.fontFaces,
  })
  if (initial.status !== "classified") throw new Error(`repeated root Initial Flow blocked: ${JSON.stringify(initial.issues)}`)
  const evidenceInput: VNextTextBlockFlowEvidenceInputV2 = {
    initialFlowFingerprint: initial.flow.fingerprint,
    layoutId: `unified-repeat-${options.lineCount}-${options.includeImages ? "mixed" : "text"}`,
    measurement: initial.flow.measurement,
    layoutUnitPolicyFingerprint: initial.flow.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: 90_000_000,
    declaredLineHeightLayoutUnit: initial.flow.declaredLineHeightLayoutUnit,
    paragraphStyle: initial.flow.paragraphStyle,
    fontFaces: initial.flow.fontFaces.map(({ fontFamilyKey: _fontFamilyKey, ...face }) => ({ ...face })),
    shapingRuns: initial.flow.atoms.flatMap((atom, index) => atom.kind === "text"
      ? [shapingRun(atom, index)]
      : []),
    breakOffsets,
  }
  const accepted = acceptVNextTextBlockFlowEvidenceV2({
    initialFlow: initial.flow,
    evidenceInput,
  })
  if (accepted.status !== "accepted") throw new Error(`repeated root evidence blocked: ${JSON.stringify(accepted.issues)}`)
  return {
    initialFlow: initial.flow,
    evidence: accepted.evidence,
    spatialEntries: options.spatialEntries ?? [],
  }
}
