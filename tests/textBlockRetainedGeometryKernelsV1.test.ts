import { describe, expect, it } from "vitest"
import { runVNextTextBlockSpatialWrappingKernelV1 } from "../src/layout/textBlockSpatialWrappingKernelV1.js"
import { convertVNextTextBlockAuthoredBoxKernelV1, projectVNextTextBlockAuthoredBoxGeometryKernelV1, deriveVNextTextBlockAuthoredBoxAutoHeightKernelV1 } from "../src/layout/textBlockAuthoredBoxGeometryKernelV1.js"
import { acceptedAuthoredBoxGeometryFixture } from "./helpers/textBlockAuthoredBoxGeometryV2.js"

describe("retained shared geometry kernels", () => {
 it("places whole break-safe groups across both sides of a middle exclusion", () => {
  // Former WrappingV1 regression at e3b9888, with unchanged independent geometry.
  const groups = [0, 1, 2].map(index => ({
    renderStartOffset: index,
    renderEndOffset: index + 1,
    advanceLayoutUnit: 30_000_000,
    mandatoryBreak: false,
    atoms: [{ kind: "text-cluster" as const, renderStartOffset: index,
      renderEndOffset: index + 1, advanceLayoutUnit: 30_000_000, payloadIndex: index }],
  }))
  const result = runVNextTextBlockSpatialWrappingKernelV1({
    groups, startYLayoutUnit: 0, baseBandHeightLayoutUnit: 14_000_000,
    maximumBandRequeryCount: 8,
    provideRegion: () => ({
      status: "accepted",
      intervals: [
        { startLayoutUnit: 0, endLayoutUnit: 40_000_000 },
        { startLayoutUnit: 60_000_000, endLayoutUnit: 100_000_000 },
      ],
      nextYLayoutUnit: 100_000_000, regionFingerprint: "middle-exclusion",
      issues: [], work: { fastPath: "none", spatialIndexQueryCount: 1,
        visitedSpatialNodeCount: 1, matchedSpatialEntryCount: 1, rectangularSubtractionCount: 1 },
    }),
    measureCandidate: () => ({ status: "accepted", heightLayoutUnit: 14_000_000,
      baselineOffsetLayoutUnit: 10_600_000, payload: null, issues: [] }),
  })
  expect(result.status).toBe("accepted")
  if (result.status !== "accepted") throw new Error("middle exclusion blocked")
  expect(result.lines[0]?.placedAtoms.map(({ atom, ...placement }) => ({
    ...placement, renderStartOffset: atom.renderStartOffset, renderEndOffset: atom.renderEndOffset,
  }))).toEqual([
    { intervalIndex: 0, renderStartOffset: 0, renderEndOffset: 1,
      xStartLayoutUnit: 0, xEndLayoutUnit: 30_000_000 },
    { intervalIndex: 1, renderStartOffset: 1, renderEndOffset: 2,
      xStartLayoutUnit: 60_000_000, xEndLayoutUnit: 90_000_000 },
  ])
  expect(result.lines.flatMap(line => line.placedAtoms.map(({ atom }) => [
    atom.renderStartOffset, atom.renderEndOffset,
  ]))).toEqual([[0, 1], [1, 2], [2, 3]])
  expect(result.work.spatialIndexQueryCount).toBe(result.lines.length)
 })
 it("keeps candidate height monotonic when re-query moves a tall group", () => {
  const groups = [10,70].map((advanceLayoutUnit,i)=>({renderStartOffset:i,renderEndOffset:i+1,advanceLayoutUnit,mandatoryBreak:false,atoms:[{kind:"text-cluster" as const,renderStartOffset:i,renderEndOffset:i+1,advanceLayoutUnit,payloadIndex:i}]}))
  const result = runVNextTextBlockSpatialWrappingKernelV1({groups,startYLayoutUnit:0,baseBandHeightLayoutUnit:14,maximumBandRequeryCount:8,
   provideRegion: band => ({status:"accepted",intervals:band.topLayoutUnit < 40 && band.bottomLayoutUnit > 20 ? [{startLayoutUnit:0,endLayoutUnit:40},{startLayoutUnit:60,endLayoutUnit:100}] : [{startLayoutUnit:0,endLayoutUnit:100}],nextYLayoutUnit:40,regionFingerprint:"baseline-region",issues:[],work:{fastPath:"none",spatialIndexQueryCount:1,visitedSpatialNodeCount:1,matchedSpatialEntryCount:1,rectangularSubtractionCount:1}}),
   measureCandidate: candidate => ({status:"accepted",heightLayoutUnit:Math.max(candidate.candidateBandHeightLayoutUnit,candidate.placedAtoms.some(item=>item.atom.payloadIndex===1)?40:14),baselineOffsetLayoutUnit:10,payload:null,issues:[]})})
  expect(result.status).toBe("accepted")
  if(result.status !== "accepted") throw new Error("kernel blocked")
  expect(result.lines.map(line=>({range:line.placedAtoms.map(item=>item.atom.payloadIndex),y:line.lineYLayoutUnit,height:line.heightLayoutUnit}))).toEqual([{range:[0],y:0,height:40},{range:[1],y:40,height:40}])
  expect(result.work.lineBandRequeryCount).toBeGreaterThan(0)
 })
 it("blocks authored conversion drift, translated y overflow, and auto-height overflow", () => {
  const fixture=acceptedAuthoredBoxGeometryFixture()
  expect(convertVNextTextBlockAuthoredBoxKernelV1({authoredBoxPlan:fixture.authoredBoxPlan,contentWidthLayoutUnit:1})).toMatchObject({status:"blocked",issues:[{code:"authored-box-width-mismatch"}]})
  expect(convertVNextTextBlockAuthoredBoxKernelV1({authoredBoxPlan:{...fixture.authoredBoxPlan,contentInsetPt:{...fixture.authoredBoxPlan.contentInsetPt,top:-1}},contentWidthLayoutUnit:90000000})).toMatchObject({status:"blocked",issues:[{code:"invalid-authored-box-geometry"}]})
  expect(projectVNextTextBlockAuthoredBoxGeometryKernelV1({contentOriginXLayoutUnit:0,contentOriginYLayoutUnit:1,lines:[{index:0,renderStartOffset:0,renderEndOffset:1,contentYOffsetLayoutUnit:Number.MAX_SAFE_INTEGER,heightLayoutUnit:1,baselineOffsetLayoutUnit:1,availableIntervals:[],intervalPlacements:[],fragments:[],sourceSegments:[],contentRegionFingerprint:"region",contentLineFingerprint:"line"}]})).toMatchObject({status:"blocked",lines:null,issues:[{code:"unsafe-layout-arithmetic"}]})
  expect(deriveVNextTextBlockAuthoredBoxAutoHeightKernelV1({topInsetLayoutUnit:1,bottomInsetLayoutUnit:1,contentFlowHeightLayoutUnit:1,spatialMaximumBottomLayoutUnit:Number.MAX_SAFE_INTEGER})).toMatchObject({status:"blocked",outerHeightLayoutUnit:null,issues:[{code:"unsafe-layout-arithmetic"}]})
 })
 it("keeps auto-height on the second-deepest retained extent after shrink", () => {
  expect(deriveVNextTextBlockAuthoredBoxAutoHeightKernelV1({topInsetLayoutUnit:2,bottomInsetLayoutUnit:2,contentFlowHeightLayoutUnit:14,spatialMaximumBottomLayoutUnit:50})).toEqual({status:"accepted",contentExtentBottomLayoutUnit:50,outerHeightLayoutUnit:54,issues:[]})
 })
})
