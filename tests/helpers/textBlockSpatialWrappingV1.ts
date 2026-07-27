import {
  createVNextTextBlockPersistentFlowTreeV1,
  type VNextTextBlockSyntheticPositionedObjectInputV1,
} from "../../src/index.js"
import { acceptedPersistentFlowFixture } from "./textBlockPersistentFlowV1.js"

export const SPATIAL_GEOMETRY_OWNER_FINGERPRINT = `sha256:${"a".repeat(64)}`

export function acceptedSpatialWrappingFixture() {
  const flow = acceptedPersistentFlowFixture()
  const persistent = createVNextTextBlockPersistentFlowTreeV1(flow)
  if (persistent.status !== "accepted") throw new Error("spatial fixture persistent flow blocked")

  const entries: VNextTextBlockSyntheticPositionedObjectInputV1[] = [
    {
      objectId: "left-exclusion",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      xLayoutUnit: 0,
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
    },
    {
      objectId: "middle-exclusion",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      xLayoutUnit: 35_000_000,
      yLayoutUnit: 30_000_000,
      widthLayoutUnit: 20_000_000,
      heightLayoutUnit: 20_000_000,
      clearance: {
        topLayoutUnit: 0,
        rightLayoutUnit: 0,
        bottomLayoutUnit: 0,
        leftLayoutUnit: 0,
      },
      wrapPolicy: "rectangular-exclusion",
    },
    {
      objectId: "barrier",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      xLayoutUnit: 10_000_000,
      yLayoutUnit: 60_000_000,
      widthLayoutUnit: 70_000_000,
      heightLayoutUnit: 20_000_000,
      clearance: {
        topLayoutUnit: 0,
        rightLayoutUnit: 0,
        bottomLayoutUnit: 0,
        leftLayoutUnit: 0,
      },
      wrapPolicy: "top-bottom-barrier",
    },
    {
      objectId: "overlay",
      geometryOwnerFingerprint: SPATIAL_GEOMETRY_OWNER_FINGERPRINT,
      xLayoutUnit: 70_000_000,
      yLayoutUnit: 90_000_000,
      widthLayoutUnit: 10_000_000,
      heightLayoutUnit: 20_000_000,
      clearance: {
        topLayoutUnit: 0,
        rightLayoutUnit: 0,
        bottomLayoutUnit: 0,
        leftLayoutUnit: 0,
      },
      wrapPolicy: "overlay",
    },
  ]

  return {
    request: flow.request,
    acceptedLayout: flow.acceptedLayout,
    tree: persistent.tree,
    entries,
  }
}
