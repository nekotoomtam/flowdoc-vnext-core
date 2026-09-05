export interface VNextTextBlockFlowIntervalV1 {
  startLayoutUnit: number
  endLayoutUnit: number
}

export type VNextTextBlockFlowRegionIssueCodeV1 =
  | "spatial-index-provenance-mismatch"
  | "spatial-index-binding-mismatch"
  | "invalid-line-band"
  | "invalid-content-insets"
  | "unsafe-region-arithmetic"
  | "invalid-returned-intervals"
  | "no-vertical-progress"

export interface VNextTextBlockFlowRegionWorkV1 {
  fastPath: "no-flow-affecting-entry" | "none"
  spatialIndexQueryCount: 0 | 1
  visitedSpatialNodeCount: number
  matchedSpatialEntryCount: number
  rectangularSubtractionCount: number
}
