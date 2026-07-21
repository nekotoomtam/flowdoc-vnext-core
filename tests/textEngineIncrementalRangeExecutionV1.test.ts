import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { beforeAll, describe, expect, it } from "vitest"
import type { VNextTextBlockV4MeasurementRequest } from "../src/index.js"
import {
  planFlowDocTextEngineIncrementalEditRangeV1,
} from "../packages/text-engine-rust-wasm/src/incrementalEditRangePlanner.js"
import { analyzeFlowDocTextEngineIncrementalReflowV1 } from
  "../packages/text-engine-rust-wasm/src/incrementalReflowAnalysis.js"
import {
  executeFlowDocTextEngineIncrementalRangePlanV1,
  FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_POLICY_V1,
} from "../packages/text-engine-rust-wasm/src/incrementalRangeExecution.js"
import {
  createFlowDocTextEngineIncrementalRangeRuntimeIdentityV1,
  createFlowDocTextEngineIncrementalRetainedSnapshotV1,
} from "../packages/text-engine-rust-wasm/src/incrementalRetainedSnapshot.js"
import { createFlowDocTextEngineMultiRunLayoutV1 } from
  "../packages/text-engine-rust-wasm/src/multiRunLayout.js"
import type {
  FlowDocTextEngineMultiRunLayoutInputV1,
  FlowDocTextEngineMultiRunRuntimeV1,
} from "../packages/text-engine-rust-wasm/src/multiRunLayoutContract.js"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from
  "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"
import { FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256 } from
  "../packages/text-engine-rust-wasm/src/runtimeMr1Range.js"
import {
  createFlowDocTextEngineMr1RangeWorkerRuntimeV1,
  type FlowDocTextEngineMr1RangeWorkerRuntimeV1,
} from "../packages/text-engine-rust-wasm/src/workerMr1Range.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function arrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer
}

function splitAfter(text: string, target: number): number {
  const offset = text.indexOf(" ", target)
  if (offset < 0) throw new Error("fixture split is unavailable")
  return offset + 1
}

function inputFixture(): FlowDocTextEngineMultiRunLayoutInputV1 {
  const unit = "สวัสดีครับตูม Prepared summary"
  const text = Array.from({ length: 160 }, () => unit).join(" ")
  const splitA = splitAfter(text, 1_450)
  const splitB = splitAfter(text, 1_650)
  const splitC = splitAfter(text, 2_350)
  const splitD = splitAfter(text, 2_430)
  return {
    layoutId: "incremental-range-execution-layout",
    measurement: {
      documentId: "incremental-range-execution-document",
      instanceRevision: 70,
      sectionId: "section-main",
      textBlockId: "incremental-range-execution-block",
      availableWidthPt: 240,
      measurementProfileId: "measurement-profile-incremental-range-execution",
      styleKey: "paragraph-body",
      renderedText: text,
      runs: [
        {
          inlineId: "regular-prefix",
          kind: "text",
          renderStartOffset: 0,
          renderEndOffset: splitA,
          renderedText: text.slice(0, splitA),
          styleKey: "paragraph-body",
        },
        {
          inlineId: "bold-span",
          kind: "text",
          renderStartOffset: splitA,
          renderEndOffset: splitB,
          renderedText: text.slice(splitA, splitB),
          styleKey: "paragraph-body",
          localStyle: { fontSize: { value: 18, unit: "pt" }, fontWeight: "bold" },
        },
        {
          inlineId: "regular-middle",
          kind: "text",
          renderStartOffset: splitB,
          renderEndOffset: splitC,
          renderedText: text.slice(splitB, splitC),
          styleKey: "paragraph-body",
        },
        {
          inlineId: "resolved-field",
          kind: "resolved-field",
          fieldKey: "report.sample",
          renderStartOffset: splitC,
          renderEndOffset: splitD,
          renderedText: text.slice(splitC, splitD),
          styleKey: "paragraph-body",
        },
        {
          inlineId: "regular-suffix",
          kind: "text",
          renderStartOffset: splitD,
          renderEndOffset: text.length,
          renderedText: text.slice(splitD),
          styleKey: "paragraph-body",
        },
      ],
    },
    declaredLineHeightLayoutUnit: 18_000_000,
    paragraphStyle: {
      styleKey: "paragraph-body",
      runStyle: {
        fontFamilyKey: "sarabun",
        fontSize: { value: 12, unit: "pt" },
        textColor: "202020",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        strikethrough: false,
      },
    },
    fontFaces: FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.map(clone),
  }
}

function replaceInsideRun(input: {
  previous: VNextTextBlockV4MeasurementRequest
  sourceRunIndex: number
  localStartOffset: number
  localEndOffset?: number
  insertedText: string
}): {
  measurement: VNextTextBlockV4MeasurementRequest
  edit: { previousStartOffset: number; previousEndOffset: number; nextEndOffset: number }
} {
  const measurement = clone(input.previous)
  const previousRun = input.previous.runs[input.sourceRunIndex]!
  const nextRun = measurement.runs[input.sourceRunIndex]!
  const localEndOffset = input.localEndOffset ?? input.localStartOffset
  const previousStartOffset = previousRun.renderStartOffset + input.localStartOffset
  const previousEndOffset = previousRun.renderStartOffset + localEndOffset
  const nextEndOffset = previousStartOffset + input.insertedText.length
  const delta = input.insertedText.length - (localEndOffset - input.localStartOffset)
  measurement.instanceRevision += 1
  measurement.renderedText = input.previous.renderedText.slice(0, previousStartOffset)
    + input.insertedText
    + input.previous.renderedText.slice(previousEndOffset)
  nextRun.renderedText = previousRun.renderedText.slice(0, input.localStartOffset)
    + input.insertedText
    + previousRun.renderedText.slice(localEndOffset)
  nextRun.renderEndOffset += delta
  for (let index = input.sourceRunIndex + 1; index < measurement.runs.length; index += 1) {
    measurement.runs[index]!.renderStartOffset += delta
    measurement.runs[index]!.renderEndOffset += delta
  }
  return {
    measurement,
    edit: { previousStartOffset, previousEndOffset, nextEndOffset },
  }
}

let wasm: FlowDocTextEngineMr1RangeWorkerRuntimeV1

function fullRuntime(): FlowDocTextEngineMultiRunRuntimeV1 {
  return {
    runtimeKind: "browser-worker-wasm-mr1",
    shape({ text, fontFace }) {
      return wasm.shapeFull({ text, fontFaceId: fontFace.fontFaceId })
    },
    segment(text) {
      return wasm.segmentFull(text)
    },
  }
}

function prepareEdit(input: {
  startOffset: number
  endOffset?: number
  insertedText: string
}) {
  const previousInput = inputFixture()
  const previous = createFlowDocTextEngineMultiRunLayoutV1(previousInput, fullRuntime())
  if (previous.status !== "accepted") throw new Error(previous.issues.map((issue) => issue.message).join("\n"))
  const identity = createFlowDocTextEngineIncrementalRangeRuntimeIdentityV1({
    runtime: "browser-worker-wasm-mr1-range",
    measurementProfileId: previous.measurementProfileId,
    fontSha256ById: wasm.identity.fontSha256ById,
  })
  const snapshot = createFlowDocTextEngineIncrementalRetainedSnapshotV1({
    accepted: previous,
    rangeRuntimeIdentity: identity,
  })
  const endOffset = input.endOffset ?? input.startOffset
  const sourceRunIndex = snapshot.measurement.runs.findIndex((run) => (
    run.kind === "text"
    && input.startOffset >= run.renderStartOffset
    && endOffset <= run.renderEndOffset
  ))
  if (sourceRunIndex < 0) throw new Error("test edit must stay inside one text source run")
  const sourceRun = snapshot.measurement.runs[sourceRunIndex]!
  const changed = replaceInsideRun({
    previous: snapshot.measurement,
    sourceRunIndex,
    localStartOffset: input.startOffset - sourceRun.renderStartOffset,
    localEndOffset: endOffset - sourceRun.renderStartOffset,
    insertedText: input.insertedText,
  })
  const nextInput = clone(previousInput)
  nextInput.measurement = changed.measurement
  const nextOracle = createFlowDocTextEngineMultiRunLayoutV1(nextInput, fullRuntime())
  if (nextOracle.status !== "accepted") throw new Error(nextOracle.issues.map((issue) => issue.message).join("\n"))
  const plan = planFlowDocTextEngineIncrementalEditRangeV1({
    snapshot,
    rangeRuntimeIdentity: identity,
    nextMeasurement: changed.measurement,
    edit: changed.edit,
  })
  if (plan.status !== "range-planned") throw new Error(plan.fallback.message)
  return { previousInput, previous, identity, snapshot, changed, nextInput, nextOracle, plan }
}

describe("MR1-L contextual execution, retained splice, and affected-line window", () => {
  beforeAll(async () => {
    const wasmPath = resolve(
      process.cwd(),
      "packages/text-engine-rust-wasm/pkg-live-draft-mr1-range/flowdoc_text_engine_mr1_range_bg.wasm",
    )
    wasm = await createFlowDocTextEngineMr1RangeWorkerRuntimeV1({
      measurementProfileId: "measurement-profile-incremental-range-execution",
      wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256,
      wasmBytes: arrayBuffer(readFileSync(wasmPath)),
      fonts: FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.map((face) => ({
        face: clone(face),
        bytes: arrayBuffer(readFileSync(resolve(process.cwd(), face.fontAssetPath))),
      })),
    })
  }, 30_000)

  it("executes and splices one Thai insertion exactly against the complete WASM/Core oracle", () => {
    const fixture = prepareEdit({
      startOffset: 2_433,
      insertedText: "ก",
    })
    const before = JSON.stringify({ snapshot: fixture.snapshot, plan: fixture.plan })
    expect(fixture.snapshot.summary).toEqual({
      renderedUtf16Length: 4_959,
      sourceRunCount: 5,
      shapingRunCount: 3,
      clusterCount: 4_319,
      breakOpportunityCount: 1_121,
      lineCount: 124,
    })
    const oracleAnalysis = analyzeFlowDocTextEngineIncrementalReflowV1({
      previous: fixture.previous,
      nextOracle: fixture.nextOracle,
      edit: fixture.changed.edit,
    })
    expect(
      oracleAnalysis.status,
      oracleAnalysis.status === "fallback-required"
        ? `${oracleAnalysis.fallback.code}: ${oracleAnalysis.fallback.message}`
        : "",
    ).toBe("window-proved")
    const result = executeFlowDocTextEngineIncrementalRangePlanV1({
      snapshot: fixture.snapshot,
      plan: fixture.plan,
      rangeRuntimeIdentity: fixture.identity,
      runtime: wasm,
      nextOracle: fixture.nextOracle,
    })

    expect(
      result.status,
      result.status === "fallback-required" ? `${result.fallback.code}: ${result.fallback.message}` : "",
    ).toBe("qa-window-proved")
    expect(result).toMatchObject({
      status: "qa-window-proved",
      contracts: {
        execution: "contextual-range-plus-retained-fact-splice-qa",
        fullShapeAndSegmentationOracleRequired: true,
        completeCoreLayoutOracleRequired: true,
        incrementalCoreAcceptance: false,
        positionedFragmentAssembly: false,
        mayPublishLayout: false,
        productionBinding: false,
      },
      oracleParity: {
        shapingRunsExact: true,
        breakOffsetsExact: true,
        lineRangesExact: true,
        suffixSemanticChainExact: true,
      },
    })
    if (result.status !== "qa-window-proved") throw new Error(result.fallback.message)
    expect(result.splice.shapingRuns).toEqual(fixture.nextOracle.request.shapingRuns)
    expect(result.splice.breakOffsets).toEqual(fixture.nextOracle.request.breakOffsets)
    expect(result.affectedWindow.lines).toEqual(fixture.nextOracle.request.lines)
    expect(result.rangeEvidence.segmentationAttemptCount).toBeGreaterThanOrEqual(3)
    expect(result.affectedWindow.work.assembledAffectedLineCount).toBeGreaterThan(0)
    expect(result.affectedWindow.checkpoint.previousSuffixSemanticFingerprint).toBe(
      result.affectedWindow.checkpoint.nextSuffixSemanticFingerprint,
    )
    const nextSnapshot = createFlowDocTextEngineIncrementalRetainedSnapshotV1({
      accepted: fixture.nextOracle,
      rangeRuntimeIdentity: fixture.identity,
    })
    const prefixCheckpointIndex = fixture.plan.restart.previousRestartLineIndex - 1
    expect(prefixCheckpointIndex).toBeGreaterThanOrEqual(0)
    expect(fixture.snapshot.lineCheckpoints[prefixCheckpointIndex]!.prefixLayoutFingerprint).not.toBe(
      nextSnapshot.lineCheckpoints[prefixCheckpointIndex]!.prefixLayoutFingerprint,
    )
    expect(fixture.snapshot.lineCheckpoints[prefixCheckpointIndex]!.prefixSemanticFingerprint).toBe(
      nextSnapshot.lineCheckpoints[prefixCheckpointIndex]!.prefixSemanticFingerprint,
    )
    expect(JSON.stringify({ snapshot: fixture.snapshot, plan: fixture.plan })).toBe(before)
    expect(executeFlowDocTextEngineIncrementalRangePlanV1({
      snapshot: fixture.snapshot,
      plan: clone(fixture.plan),
      rangeRuntimeIdentity: clone(fixture.identity),
      runtime: wasm,
      nextOracle: clone(fixture.nextOracle),
    })).toEqual(result)
  }, 30_000)

  it("retains exact Bold replacement, field-adjacent insertion, and negative-offset deletion", () => {
    const cases = [
      { startOffset: 1_550, endOffset: 1_551, insertedText: "ก" },
      { startOffset: 2_356, insertedText: "ก" },
      { startOffset: 2_433, endOffset: 2_434, insertedText: "" },
    ]
    for (const edit of cases) {
      const fixture = prepareEdit(edit)
      const result = executeFlowDocTextEngineIncrementalRangePlanV1({
        snapshot: fixture.snapshot,
        plan: fixture.plan,
        rangeRuntimeIdentity: fixture.identity,
        runtime: wasm,
        nextOracle: fixture.nextOracle,
      })
      expect(
        result.status,
        result.status === "fallback-required" ? `${result.fallback.code}: ${result.fallback.message}` : "",
      ).toBe("qa-window-proved")
      if (result.status !== "qa-window-proved") throw new Error(result.fallback.message)
      expect(result.splice.shapingRuns).toEqual(fixture.nextOracle.request.shapingRuns)
      expect(result.affectedWindow.lines).toEqual(fixture.nextOracle.request.lines)
    }
  }, 30_000)

  it("fails closed on a tampered plan, divergent range glyphs, and a deliberately tiny line window", () => {
    const fixture = prepareEdit({
      startOffset: 2_433,
      insertedText: "ก",
    })
    const tamperedPlan = clone(fixture.plan)
    tamperedPlan.engineRange.nextShaping.globalEndUtf16 += 1
    expect(executeFlowDocTextEngineIncrementalRangePlanV1({
      snapshot: fixture.snapshot,
      plan: tamperedPlan,
      rangeRuntimeIdentity: fixture.identity,
      runtime: wasm,
      nextOracle: fixture.nextOracle,
    })).toMatchObject({ status: "fallback-required", fallback: { code: "invalid-range-plan" } })

    expect(executeFlowDocTextEngineIncrementalRangePlanV1({
      snapshot: fixture.snapshot,
      plan: fixture.plan,
      rangeRuntimeIdentity: fixture.identity,
      runtime: {
        ...wasm,
        shapeRange(input) {
          const facts = clone(wasm.shapeRange(input))
          facts.glyphs[0]!.xAdvance += 1
          facts.summary.totalAdvanceFontUnits += 1
          return facts
        },
      },
      nextOracle: fixture.nextOracle,
    })).toMatchObject({ status: "fallback-required", fallback: { code: "range-shape-mismatch" } })

    expect(executeFlowDocTextEngineIncrementalRangePlanV1({
      snapshot: fixture.snapshot,
      plan: fixture.plan,
      rangeRuntimeIdentity: fixture.identity,
      runtime: wasm,
      nextOracle: fixture.nextOracle,
      policy: {
        rangeFacts: {
          maximumSegmentationContextUtf16Length: 32,
          requiredStableSegmentationExpansionCount: 2,
        },
        affectedLines: { ...FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_POLICY_V1.affectedLines },
      },
    })).toMatchObject({ status: "fallback-required", fallback: { code: "segmentation-fallback" } })

    expect(executeFlowDocTextEngineIncrementalRangePlanV1({
      snapshot: fixture.snapshot,
      plan: fixture.plan,
      rangeRuntimeIdentity: fixture.identity,
      runtime: wasm,
      nextOracle: fixture.nextOracle,
      policy: {
        ...FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_POLICY_V1,
        rangeFacts: { ...FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_POLICY_V1.rangeFacts },
        affectedLines: {
          ...FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_POLICY_V1.affectedLines,
          maximumReflowUtf16Length: 1,
        },
      },
    })).toMatchObject({ status: "fallback-required", fallback: { code: "line-window-exceeded" } })
  }, 30_000)
})
