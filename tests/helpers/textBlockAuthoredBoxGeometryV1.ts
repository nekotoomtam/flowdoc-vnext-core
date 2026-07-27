import {
  acceptVNextTextBlockMultiRunLayoutV1,
  convertVNextPointToLayoutUnitV1,
  createVNextAuthoredBoxPlanV1,
  createVNextTextBlockInitialFlowV1,
  createVNextTextBlockPersistentFlowTreeV1,
  createVNextTextBlockSpatialIndexV1,
  type VNextTextBlockSyntheticPositionedObjectInputV1,
} from "../../src/index.js"
import {
  emptyGeometryBuildInputFixture,
  hardBreakOnlyGeometryBuildInputFixture,
  imageOnlyGeometryBuildInputFixture,
  legacyTextOnlyBuildInputFixture,
  legacyTextOnlyLayoutRequestFixture,
  listOnlyGeometryBuildInputFixture,
  renderedEmptyFieldGeometryBuildInputFixture,
} from "./textBlockInitialFlowV1.js"

export interface AuthoredBoxGeometryFixtureOptions {
  outerWidthPt?: number
  paddingPt?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  borderWidthPt?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  breakOffsets?: readonly number[]
  entries?: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
}

const side = (width: number) => ({
  style: width === 0 ? "none" as const : "solid" as const,
  width: { value: width, unit: "pt" as const },
  color: "000000",
})

export function acceptedAuthoredBoxGeometryFixture(
  options: AuthoredBoxGeometryFixtureOptions = {},
) {
  const buildInput = legacyTextOnlyBuildInputFixture()
  const outerWidthPt = options.outerWidthPt ?? 100
  const padding = options.paddingPt ?? {
    top: 2,
    right: 5,
    bottom: 2,
    left: 5,
  }
  const border = options.borderWidthPt ?? {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }
  const textBlock = {
    ...buildInput.textBlock,
    props: {
      ...buildInput.textBlock.props,
      box: {
        ...buildInput.textBlock.props.box,
        padding: {
          top: { value: padding.top, unit: "pt" as const },
          right: { value: padding.right, unit: "pt" as const },
          bottom: { value: padding.bottom, unit: "pt" as const },
          left: { value: padding.left, unit: "pt" as const },
        },
        border: {
          top: side(border.top),
          right: side(border.right),
          bottom: side(border.bottom),
          left: side(border.left),
        },
      },
    },
  }
  const box = createVNextAuthoredBoxPlanV1({
    ownerNode: textBlock,
    availableWidthPt: outerWidthPt,
  })
  if (box.status !== "ready") throw new Error("authored box fixture blocked")

  const measurement = {
    ...buildInput.measurement,
    availableWidthPt: box.plan.contentWidthPt,
  }
  const initial = createVNextTextBlockInitialFlowV1({
    ...buildInput,
    textBlock,
    measurement,
    authoredBoxPlan: box.plan,
  })
  if (initial.status !== "classified") throw new Error("Initial Flow fixture blocked")

  const request = legacyTextOnlyLayoutRequestFixture()
  request.measurement = measurement
  request.breakOffsets = [
    ...(options.breakOffsets ?? request.breakOffsets),
  ]
  const width = convertVNextPointToLayoutUnitV1(box.plan.contentWidthPt)
  if (width.status !== "accepted") throw new Error("content width fixture blocked")
  request.availableWidthLayoutUnit = width.layoutUnit

  const acceptedLayout = acceptVNextTextBlockMultiRunLayoutV1(request)
  if (acceptedLayout.status !== "accepted") throw new Error("layout fixture blocked")
  const persistent = createVNextTextBlockPersistentFlowTreeV1({
    request,
    acceptedLayout,
  })
  if (persistent.status !== "accepted") throw new Error("tree fixture blocked")
  const spatial = createVNextTextBlockSpatialIndexV1({
    inputAuthority: "core-synthetic-qa-only",
    persistentFlowTree: persistent.tree,
    request,
    entries: options.entries ?? [],
  })
  if (spatial.status !== "accepted") throw new Error("index fixture blocked")

  return {
    initialFlow: initial.flow,
    request,
    acceptedLayout,
    tree: persistent.tree,
    spatialIndex: spatial.index,
    authoredBoxPlan: box.plan,
  }
}

export function unsupportedAuthoredBoxGeometryInitialFlowsFixture() {
  return [
    listOnlyGeometryBuildInputFixture(),
    imageOnlyGeometryBuildInputFixture(),
    emptyGeometryBuildInputFixture(),
    renderedEmptyFieldGeometryBuildInputFixture(),
    hardBreakOnlyGeometryBuildInputFixture(),
  ].map((buildInput) => {
    const classified = createVNextTextBlockInitialFlowV1(buildInput)
    if (classified.status !== "classified") {
      throw new Error("unsupported Initial Flow fixture blocked")
    }
    return classified.flow
  })
}
