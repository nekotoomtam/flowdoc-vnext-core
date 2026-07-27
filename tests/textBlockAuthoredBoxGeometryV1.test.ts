import { describe, expect, it } from "vitest"
import {
  inspectVNextTextBlockAuthoredBoxGeometryV1,
  layoutVNextTextBlockAuthoredBoxGeometryV1,
} from "../src/index.js"
import { acceptedAuthoredBoxGeometryFixture } from
  "./helpers/textBlockAuthoredBoxGeometryV1.js"

describe("TextBlock authored box geometry v1", () => {
  it("accepts one exact Phase 4A identity chain and registers immutable output", () => {
    const fixture = acceptedAuthoredBoxGeometryFixture()
    const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
      initialFlow: fixture.initialFlow,
      persistentFlowTree: fixture.tree,
      request: fixture.request,
      spatialIndex: fixture.spatialIndex,
    })

    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("Phase 4A fixture blocked")
    expect(result).toMatchObject({
      initialFlowFingerprint: fixture.initialFlow.fingerprint,
      authoredBoxPlanFingerprint: fixture.authoredBoxPlan.fingerprint,
      persistentFlowTreeFingerprint: fixture.tree.fingerprint,
      spatialIndexFingerprint: fixture.spatialIndex.fingerprint,
      mayPublishLayout: false,
      productionBinding: false,
      contracts: {
        authoredBoxWidthApplied: true,
        contentLocalSpatialWrapping: true,
        boxLocalProjection: true,
        rendererMayMeasureText: false,
        rendererMayRelayout: false,
        stagedEditorApply: false,
        mayPublishLayout: false,
        productionBinding: false,
      },
    })
    expect(inspectVNextTextBlockAuthoredBoxGeometryV1(result)).toEqual({
      status: "valid",
      fingerprint: result.fingerprint,
    })
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.lines)).toBe(true)
  })
})
