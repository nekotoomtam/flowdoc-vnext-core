import { describe, expect, it } from "vitest"
import {
  layoutVNextTextBlockAuthoredBoxGeometryV1,
} from "../src/index.js"
import {
  acceptedAuthoredBoxGeometryFixture,
} from "./helpers/textBlockAuthoredBoxGeometryV1.js"

function accepted(options: Parameters<typeof acceptedAuthoredBoxGeometryFixture>[0] = {}) {
  const fixture = acceptedAuthoredBoxGeometryFixture(options)
  const result = layoutVNextTextBlockAuthoredBoxGeometryV1({
    initialFlow: fixture.initialFlow,
    persistentFlowTree: fixture.tree,
    request: fixture.request,
    spatialIndex: fixture.spatialIndex,
  })
  if (result.status !== "accepted") throw new Error("V1 characterization fixture blocked")
  return result
}

describe("frozen V1 layout compatibility", () => {
  it("retains exact accepted geometry, fingerprints, and rejection order", async () => {
    const fixture = acceptedAuthoredBoxGeometryFixture()
    const facts = {
      noExclusion: accepted(),
      middleExclusion: accepted({
        entries: [{
          objectId: "middle",
          geometryOwnerFingerprint: `sha256:${"a".repeat(64)}`,
          xLayoutUnit: 35_000_000,
          yLayoutUnit: 0,
          widthLayoutUnit: 20_000_000,
          heightLayoutUnit: 20_000_000,
          clearance: {
            topLayoutUnit: 0,
            rightLayoutUnit: 0,
            bottomLayoutUnit: 0,
            leftLayoutUnit: 0,
          },
          wrapPolicy: "rectangular-exclusion",
        }],
      }),
      rejectionRows: [
        layoutVNextTextBlockAuthoredBoxGeometryV1({
          initialFlow: fixture.initialFlow,
          persistentFlowTree: structuredClone(fixture.tree),
          request: fixture.request,
          spatialIndex: fixture.spatialIndex,
        }),
        layoutVNextTextBlockAuthoredBoxGeometryV1({
          initialFlow: fixture.initialFlow,
          persistentFlowTree: fixture.tree,
          request: fixture.request,
          spatialIndex: structuredClone(fixture.spatialIndex),
        }),
      ].map((result) => ({
        code: result.issues[0]?.code,
        geometry: result.geometry,
        lines: result.lines,
        summary: result.summary,
        work: result.work,
        fingerprint: result.fingerprint,
      })),
    }
    await expect(JSON.stringify(facts, null, 2)).toMatchFileSnapshot(
      "./fixtures/text-block-v1-layout-compatibility.v1.json",
    )
  })
})
