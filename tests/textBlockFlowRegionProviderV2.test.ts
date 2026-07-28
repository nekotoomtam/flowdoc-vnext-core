import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockSpatialIndexV2,
  inspectVNextTextBlockFlowRegionResultV2,
  provideVNextTextBlockFlowRegionsV2,
} from "../src/index.js"
import { acceptedInlineImageFlowTreeFixture } from "./helpers/textBlockInlineImageFlowV2.js"

const owner = `sha256:${"b".repeat(64)}`
const entry = (objectId: string, xLayoutUnit: number, wrapPolicy: "rectangular-exclusion" | "top-bottom-barrier" | "overlay" = "rectangular-exclusion") => ({
  objectId, geometryOwnerFingerprint: owner, xLayoutUnit, yLayoutUnit: 0,
  widthLayoutUnit: 20_000_000, heightLayoutUnit: 10_000_000,
  clearance: { topLayoutUnit: 0, rightLayoutUnit: 0, bottomLayoutUnit: 0, leftLayoutUnit: 0 }, wrapPolicy,
})

describe("VNext TextBlock Flow Region Provider V2", () => {
  it.each([
    ["left", [entry("left", 0)], [{ startLayoutUnit: 20_000_000, endLayoutUnit: 90_000_000 }]],
    ["right", [entry("right", 70_000_000)], [{ startLayoutUnit: 0, endLayoutUnit: 70_000_000 }]],
    ["middle", [entry("middle", 40_000_000)], [{ startLayoutUnit: 0, endLayoutUnit: 40_000_000 }, { startLayoutUnit: 60_000_000, endLayoutUnit: 90_000_000 }]],
    ["barrier", [entry("barrier", 0, "top-bottom-barrier")], []],
  ])("subtracts %s exclusions using the V2 authority-bound index", (_name, entries, intervals) => {
    const fixture = acceptedInlineImageFlowTreeFixture()
    const index = createVNextTextBlockSpatialIndexV2({ inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, entries })
    if (index.status !== "accepted") throw new Error("index blocked")
    const result = provideVNextTextBlockFlowRegionsV2({
      initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex: index.index,
      band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 }, contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 },
    })
    expect(result).toMatchObject({ status: "accepted", intervals, mayPublishLayout: false, productionBinding: false })
    if (_name === "barrier") expect(result).toMatchObject({ nextYLayoutUnit: 10_000_000 })
    if (result.status === "accepted") expect(inspectVNextTextBlockFlowRegionResultV2(result)).toEqual({ status: "valid", fingerprint: result.fingerprint })
  })

  it("keeps overlays neutral and performs zero queries when flow-affecting count is zero", () => {
    const fixture = acceptedInlineImageFlowTreeFixture()
    const index = createVNextTextBlockSpatialIndexV2({ inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, entries: [entry("overlay", 20_000_000, "overlay")] })
    if (index.status !== "accepted") throw new Error("index blocked")
    expect(provideVNextTextBlockFlowRegionsV2({
      initialFlow: fixture.initialFlow, evidence: fixture.evidence, persistentFlowTree: fixture.tree, spatialIndex: index.index,
      band: { topLayoutUnit: 0, bottomLayoutUnit: 10_000_000 }, contentInsets: { leftLayoutUnit: 0, rightLayoutUnit: 0 },
    })).toMatchObject({ status: "accepted", intervals: [{ startLayoutUnit: 0, endLayoutUnit: 90_000_000 }], work: { spatialIndexQueryCount: 0 } })
  })
})
