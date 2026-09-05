import { createVNextTextBlockPersistentFlowTreeV2 } from "../../src/layout/textBlockPersistentFlowTreeV2.js"
import { createVNextTextBlockSpatialIndexV2 } from "../../src/layout/textBlockSpatialIndexV2.js"
import { layoutVNextTextBlockSpatialWrappingV2 } from "../../src/layout/textBlockSpatialWrappingLayoutV2.js"
import { projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2 } from "../../src/layout/textBlockAuthoredBoxGeometryV2.js"
import type { VNextTextBlockUnifiedLayoutRootBuildInputV2 } from "../../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import { unifiedLayoutRootBuildInputFixtureV2 } from "./textBlockUnifiedLayoutRootV2.js"
import type { InlineImageFlowFixtureOptions } from "./textBlockInlineImageFlowV2.js"

/** Direct V2 geometry inputs for line-tree/Scene tests; grants no Root authority. */
export function createUnifiedLayoutGeometryFixtureV2(input: VNextTextBlockUnifiedLayoutRootBuildInputV2) {
  const { initialFlow, evidence } = input
  const flow = createVNextTextBlockPersistentFlowTreeV2({ initialFlow, evidence })
  if (flow.status !== "accepted") throw new Error("V2 fixture flow blocked")
  const index = createVNextTextBlockSpatialIndexV2({
    inputAuthority: "core-synthetic-qa-only", initialFlow, evidence,
    persistentFlowTree: flow.tree, entries: input.spatialEntries,
  })
  if (index.status !== "accepted") throw new Error("V2 fixture spatial index blocked")
  const geometryInput = { initialFlow, evidence, persistentFlowTree: flow.tree, spatialIndex: index.index }
  const spatialLayout = layoutVNextTextBlockSpatialWrappingV2({ ...geometryInput, startYLayoutUnit: 0 })
  if (spatialLayout.status !== "accepted") throw new Error("V2 fixture spatial layout blocked")
  const authoredBoxGeometry = projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2({ ...geometryInput, spatialLayout })
  if (authoredBoxGeometry.status !== "accepted") throw new Error("V2 fixture authored geometry blocked")
  return { status: "accepted" as const, geometryInput: { ...geometryInput, spatialLayout, authoredBoxGeometry } }
}

export function acceptedUnifiedLayoutGeometryFixtureV2(options: InlineImageFlowFixtureOptions = {}) {
  return createUnifiedLayoutGeometryFixtureV2(unifiedLayoutRootBuildInputFixtureV2(options))
}
