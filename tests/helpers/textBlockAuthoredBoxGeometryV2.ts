import {
  acceptVNextTextBlockFlowEvidenceV2,
  convertVNextPointToLayoutUnitV1,
  createVNextAuthoredBoxPlanV1,
  createVNextTextBlockPersistentFlowTreeV2,
  type VNextTextBlockSyntheticPositionedObjectInputV1,
} from "../../src/index.js"
import {
  createVNextTextBlockInitialFlowV1,
} from "../../src/layout/textBlockInitialFlowInputV1.js"
import {
  createVNextTextBlockSpatialIndexV2,
} from "../../src/layout/textBlockSpatialIndexV2.js"
import {
  legacyTextOnlyBuildInputFixture,
  legacyTextOnlyLayoutRequestFixture,
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

  const { lines: _lines, bindProductionLayout: _binding, ...facts } = request
  const acceptedEvidence = acceptVNextTextBlockFlowEvidenceV2({
    initialFlow: initial.flow,
    evidenceInput: { ...facts, initialFlowFingerprint: initial.flow.fingerprint },
  })
  if (acceptedEvidence.status !== "accepted") throw new Error(`evidence fixture blocked: ${JSON.stringify(acceptedEvidence.issues)}`)
  const evidence = acceptedEvidence.evidence
  const persistent = createVNextTextBlockPersistentFlowTreeV2({ initialFlow: initial.flow, evidence })
  if (persistent.status !== "accepted") throw new Error("tree fixture blocked")
  const spatial = createVNextTextBlockSpatialIndexV2({
    inputAuthority: "core-synthetic-qa-only",
    persistentFlowTree: persistent.tree,
    initialFlow: initial.flow,
    evidence,
    entries: options.entries ?? [],
  })
  if (spatial.status !== "accepted") throw new Error("index fixture blocked")

  return {
    initialFlow: initial.flow,
    evidence,
    request,
    tree: persistent.tree,
    spatialIndex: spatial.index,
    authoredBoxPlan: box.plan,
  }
}
