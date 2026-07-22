import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockMultiRunSemanticRangeLineCheckpointsV1,
  createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1,
} from "../src/index.js"
import { persistentFlowEditFixture } from "./helpers/textBlockPersistentFlowV1.js"

describe("TextBlock multi-run bounded semantic window v1", () => {
  it("matches the complete oracle for only the selected lines", () => {
    const fixture = persistentFlowEditFixture()
    const request = fixture.nextRequest
    const start = fixture.window.nextRestartLineIndex
    const end = Math.min(
      request.lines.length,
      fixture.window.nextReconvergenceLineIndex + fixture.window.stableLineCount,
    )
    const complete = createVNextTextBlockMultiRunSemanticRangeLineCheckpointsV1({
      measurement: request.measurement,
      shapingRuns: request.shapingRuns,
      lines: request.lines,
    })
    const bounded = createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1({
      measurement: request.measurement,
      shapingRuns: request.shapingRuns,
      lines: request.lines,
      lineStartIndex: start,
      lineEndIndexExclusive: end,
    })
    if (complete == null || bounded.status !== "accepted") throw new Error("semantic fixture blocked")

    expect(bounded.lineFingerprints).toEqual(complete.lineFingerprints.slice(start, end))
    expect(bounded.work).toMatchObject({
      lineFingerprintCount: end - start,
      completeSemanticPassCount: 0,
      visitedShapingRunCount: 1,
      visitedClusterCount: request.lines[end - 1]!.renderEndOffset
        - request.lines[start]!.renderStartOffset,
      visitedSourceRunCount: 1,
    })
    expect(bounded.work.lineFingerprintCount).toBeLessThan(request.lines.length)
    expect(bounded.work.visitedClusterCount).toBeLessThan(request.shapingRuns[0]!.clusters.length)
  })

  it("rejects invalid, gapped, and cluster-splitting windows", () => {
    const fixture = persistentFlowEditFixture()
    const request = fixture.nextRequest
    expect(createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1({
      measurement: request.measurement,
      shapingRuns: request.shapingRuns,
      lines: request.lines,
      lineStartIndex: -1,
      lineEndIndexExclusive: 1,
    })).toMatchObject({ status: "blocked", code: "invalid-line-window" })
    const lines = structuredClone(request.lines)
    lines[fixture.window.nextRestartLineIndex]!.renderStartOffset += 1
    expect(createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1({
      measurement: request.measurement,
      shapingRuns: request.shapingRuns,
      lines,
      lineStartIndex: fixture.window.nextRestartLineIndex,
      lineEndIndexExclusive: fixture.window.nextReconvergenceLineIndex + 1,
    })).toMatchObject({ status: "blocked", code: "invalid-line-range" })

    const shapingRuns = structuredClone(request.shapingRuns)
    const crossingOffset = request.lines[fixture.window.nextRestartLineIndex]!.renderStartOffset
    const crossingCluster = shapingRuns[0]!.clusters[crossingOffset - 1]!
    crossingCluster.renderEndOffset += 1
    expect(createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1({
      measurement: request.measurement,
      shapingRuns,
      lines: request.lines,
      lineStartIndex: fixture.window.nextRestartLineIndex,
      lineEndIndexExclusive: fixture.window.nextReconvergenceLineIndex + 1,
    })).toMatchObject({ status: "blocked", code: "invalid-cluster-range" })

    const measurement = structuredClone(request.measurement)
    const sourceRun = measurement.runs[0]!
    measurement.runs = [
      {
        ...sourceRun,
        renderEndOffset: crossingOffset + 1,
        renderedText: measurement.renderedText.slice(0, crossingOffset + 1),
      },
      {
        ...sourceRun,
        renderStartOffset: crossingOffset,
        renderedText: measurement.renderedText.slice(crossingOffset),
      },
    ]
    expect(createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1({
      measurement,
      shapingRuns: request.shapingRuns,
      lines: request.lines,
      lineStartIndex: fixture.window.nextRestartLineIndex,
      lineEndIndexExclusive: fixture.window.nextReconvergenceLineIndex + 1,
    })).toMatchObject({ status: "blocked", code: "invalid-source-range" })
  })
})
