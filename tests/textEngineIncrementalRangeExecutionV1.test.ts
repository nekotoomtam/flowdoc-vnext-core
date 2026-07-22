import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { beforeAll, describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunIncrementalWindowV1,
  createVNextTextBlockPersistentFlowUpdateV1,
  createVNextTextBlockMultiRunIncrementalSnapshotV1,
  createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1,
  materializeVNextTextBlockMultiRunIncrementalLayoutForQaV1,
  type VNextTextBlockV4MeasurementRequest,
} from "../src/index.js"
import {
  planFlowDocTextEngineIncrementalEditRangeV1,
} from "../packages/text-engine-rust-wasm/src/incrementalEditRangePlanner.js"
import {
  executeFlowDocTextEngineIncrementalCorePlanV1,
  FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_EXECUTION_POLICY_V1,
  profileFlowDocTextEngineIncrementalCorePlanV1,
} from "../packages/text-engine-rust-wasm/src/incrementalCoreExecution.js"
import { analyzeFlowDocTextEngineIncrementalReflowV1 } from
  "../packages/text-engine-rust-wasm/src/incrementalReflowAnalysis.js"
import {
  executeFlowDocTextEngineIncrementalRangePlanV1,
  FLOWDOC_TEXT_ENGINE_INCREMENTAL_RANGE_EXECUTION_POLICY_V1,
} from "../packages/text-engine-rust-wasm/src/incrementalRangeExecution.js"
import {
  createFlowDocTextEngineIncrementalRangeRuntimeIdentityV1,
  createFlowDocTextEngineIncrementalRetainedSnapshotV1,
  getFlowDocTextEngineIncrementalCoreSnapshotV1,
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
let retainedCoreSnapshot: ReturnType<typeof createVNextTextBlockMultiRunIncrementalSnapshotV1> | null = null

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

function proveCoreComposition(
  fixture: ReturnType<typeof prepareEdit>,
  result: Extract<ReturnType<typeof executeFlowDocTextEngineIncrementalRangePlanV1>, { status: "qa-window-proved" }>,
) {
  retainedCoreSnapshot ??= createVNextTextBlockMultiRunIncrementalSnapshotV1({
    request: fixture.previous.request,
    acceptedLayout: fixture.previous.layout,
  })
  const coreSnapshot = retainedCoreSnapshot
  const persistentFlowUpdate = createVNextTextBlockPersistentFlowUpdateV1({
    previousTree: coreSnapshot.persistentFlowTree,
    previousRequest: coreSnapshot.request,
    nextRequest: fixture.nextOracle.request,
    edit: fixture.changed.edit,
    window: result.affectedWindow.checkpoint,
  })
  if (persistentFlowUpdate.status !== "accepted") {
    throw new Error(persistentFlowUpdate.issues[0]?.message)
  }
  const semanticCheckpointProof = createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
    snapshot: coreSnapshot,
    nextRequest: fixture.nextOracle.request,
    edit: fixture.changed.edit,
    window: result.affectedWindow.checkpoint,
    persistentFlowUpdate: persistentFlowUpdate.update,
  })
  if (semanticCheckpointProof.status !== "checkpoint-accepted") {
    throw new Error(semanticCheckpointProof.message)
  }
  const coreAcceptance = acceptVNextTextBlockMultiRunIncrementalWindowV1({
    snapshot: coreSnapshot,
    nextRequest: fixture.nextOracle.request,
    edit: fixture.changed.edit,
    window: result.affectedWindow.checkpoint,
    semanticCheckpointProof,
  })
  expect(
    coreAcceptance.status,
    coreAcceptance.status === "fallback-required"
      ? `${coreAcceptance.fallback.code}: ${coreAcceptance.fallback.message}`
      : "",
  ).toBe("window-accepted")
  const materialized = materializeVNextTextBlockMultiRunIncrementalLayoutForQaV1({
    snapshot: coreSnapshot,
    nextRequest: fixture.nextOracle.request,
    acceptance: coreAcceptance,
  })
  expect(
    materialized.status,
    materialized.status === "blocked" ? materialized.message : "",
  ).toBe("materialized-for-qa")
  if (materialized.status !== "materialized-for-qa") throw new Error(materialized.message)
  expect(materialized.layout).toEqual(fixture.nextOracle.layout)
  return {
    coreSnapshot,
    persistentFlowUpdate: persistentFlowUpdate.update,
    semanticCheckpointProof,
    coreAcceptance,
    materialized,
  }
}

function executeOracleIndependentCore(
  fixture: ReturnType<typeof prepareEdit>,
  optionalFullLayoutOracle = false,
) {
  const result = executeFlowDocTextEngineIncrementalCorePlanV1({
    snapshot: fixture.snapshot,
    plan: fixture.plan,
    rangeRuntimeIdentity: fixture.identity,
    runtime: wasm,
    nextMeasurement: fixture.changed.measurement,
    ...(optionalFullLayoutOracle ? { optionalFullLayoutOracle: fixture.nextOracle } : {}),
  })
  expect(
    result.status,
    result.status === "fallback-required" ? `${result.fallback.code}: ${result.fallback.message}` : "",
  ).toBe("incremental-core-accepted")
  if (result.status !== "incremental-core-accepted") throw new Error(result.fallback.message)
  expect(result.request).toEqual(fixture.nextOracle.request)
  expect(result.coreAcceptance.status).toBe("window-accepted")
  return result
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
    const { coreAcceptance } = proveCoreComposition(fixture, result)
    expect(coreAcceptance).toMatchObject({
      status: "window-accepted",
      contracts: {
        coreAcceptsAffectedLineWindow: true,
        semanticIdentitySeparateFromPhysicalIds: true,
        physicalIdsAreRevisionSpecific: true,
        mayPublishLayout: false,
        productionBinding: false,
      },
    })
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

  it("assembles and accepts the next Core request without a complete layout oracle input", () => {
    const fixture = prepareEdit({
      startOffset: 2_433,
      insertedText: "ก",
    })
    const result = executeOracleIndependentCore(fixture)
    const incrementalCoreSnapshot = getFlowDocTextEngineIncrementalCoreSnapshotV1(fixture.snapshot)
    if (incrementalCoreSnapshot == null) throw new Error("expected one process-local incremental Core snapshot")
    expect(fixture.snapshot).toMatchObject({
      persistentFlow: {
        treeFingerprint: incrementalCoreSnapshot.persistentFlowTree.fingerprint,
        policyFingerprint: incrementalCoreSnapshot.persistentFlowTree.policy.fingerprint,
        itemCount: 21,
        leafCount: 3,
        nodeCount: 4,
      },
      contracts: { persistentFlowTreeRetained: true },
    })
    expect(result.affectedWindow.work.semanticRangeComparisonCount).toBe(0)
    expect(result).toMatchObject({
      status: "incremental-core-accepted",
      fullLayoutOracleFingerprint: null,
      contracts: {
        completeCoreLayoutOracleRequired: false,
        completeCoreLayoutOracleOptionalForQa: true,
        incrementalCoreAcceptance: true,
        coreOwnedCompositionalSemanticCheckpoints: true,
        completeSemanticRangeHashing: false,
        affectedPositionedFragmentAssembly: true,
        completeLayoutMaterialization: "optional-qa-only",
        mayPublishLayout: false,
        productionBinding: false,
      },
      optionalQaOracle: null,
      persistentFlowUpdate: {
        status: "accepted",
        work: {
          completeTreeRebuildCount: 0,
          completeSemanticPassCount: 0,
          replacedPreviousRenderedUtf16Length: 81,
          projectedNextRenderedUtf16Length: 82,
          reusedNodeCount: 2,
          createdNodeCount: 3,
          createdNodeCanonicalByteCount: 1_663_499,
        },
      },
      affectedWindow: {
        work: {
          assembledAffectedLineCount: 2,
          reconvergenceCandidateCount: 1,
        },
        checkpoint: {
          previousReconvergenceLineIndex: 63,
          nextReconvergenceLineIndex: 63,
          previousReconvergenceOffset: 2_472,
          nextReconvergenceOffset: 2_473,
          offsetDelta: 1,
          stableLineCount: 2,
        },
      },
      semanticCheckpointProof: {
        status: "checkpoint-accepted",
        work: {
          completePreviousSemanticPassCount: 0,
          completeNextSemanticPassCount: 0,
          boundedNextSemanticPassCount: 1,
          completeSemanticRangeHashCount: 0,
          persistentFlowUpdateAccepted: true,
        },
      },
      coreAcceptance: {
        work: {
          semanticCheckpointProofAccepted: true,
          completeNextSemanticPassCount: 0,
          completeSemanticRangeHashCount: 0,
          positionedAffectedLineCount: 2,
          reusedPersistentNodeCount: 2,
          createdPersistentNodeCount: 3,
        },
      },
      work: { completeCoreLayoutOracleUsed: false },
    })
    expect(result.persistentFlowUpdate.work.reusedNodeCount).toBeGreaterThan(0)
    const profile = profileFlowDocTextEngineIncrementalCorePlanV1({
      snapshot: fixture.snapshot,
      plan: fixture.plan,
      rangeRuntimeIdentity: fixture.identity,
      runtime: wasm,
      nextMeasurement: fixture.changed.measurement,
      optionalFullLayoutOracle: fixture.nextOracle,
    }, { now: () => performance.now() })
    const qaResult = profile.result
    if (qaResult.status !== "incremental-core-accepted") throw new Error(qaResult.fallback.message)
    expect(qaResult.optionalQaOracle).toMatchObject({
      requestExact: true,
      layoutExact: true,
      oracleCoreLayoutFingerprint: fixture.nextOracle.layout.fingerprint,
      materializedCoreLayoutFingerprint: fixture.nextOracle.layout.fingerprint,
    })
    expect(qaResult.work.completeCoreLayoutOracleUsed).toBe(true)
    expect(profile.completedPhases).toEqual([
      "plan-and-snapshot-validation",
      "range-engine-facts",
      "cluster-and-break-splice",
      "affected-line-assembly",
      "persistent-flow-update",
      "core-incremental-acceptance",
      "optional-full-oracle-qa",
      "result-and-fingerprint",
    ])
    expect(Object.values(profile.phaseDurationMs).every((value) => value != null && value >= 0)).toBe(true)
    expect(profile.totalDurationMs).toBeGreaterThanOrEqual(0)
    expect(profile).toMatchObject({
      contracts: {
        timingIsDiagnosticOnly: true,
        timingAffectsDeterministicFingerprint: false,
        numericBudgetAccepted: false,
      },
    })
  }, 30_000)

  it("retains exact Bold replacement, field-adjacent insertion, and negative-offset deletion", () => {
    const cases = [
      {
        edit: { startOffset: 1_550, endOffset: 1_551, insertedText: "ก" },
        evidence: {
          replacedPreviousRenderedUtf16Length: 54,
          projectedNextRenderedUtf16Length: 54,
          reusedNodeCount: 2,
          createdNodeCount: 3,
          createdNodeCanonicalByteCount: 1_690_457,
          assembledAffectedLineCount: 2,
          previousReconvergenceLineIndex: 39,
          nextReconvergenceLineIndex: 39,
          previousReconvergenceOffset: 1_556,
          nextReconvergenceOffset: 1_556,
          offsetDelta: 0,
        },
      },
      {
        edit: { startOffset: 2_356, insertedText: "ก" },
        evidence: {
          replacedPreviousRenderedUtf16Length: 124,
          projectedNextRenderedUtf16Length: 125,
          reusedNodeCount: 2,
          createdNodeCount: 2,
          createdNodeCanonicalByteCount: 1_661_601,
          assembledAffectedLineCount: 3,
          previousReconvergenceLineIndex: 62,
          nextReconvergenceLineIndex: 62,
          previousReconvergenceOffset: 2_432,
          nextReconvergenceOffset: 2_433,
          offsetDelta: 1,
        },
      },
      {
        edit: { startOffset: 2_433, endOffset: 2_434, insertedText: "" },
        evidence: {
          replacedPreviousRenderedUtf16Length: 81,
          projectedNextRenderedUtf16Length: 80,
          reusedNodeCount: 2,
          createdNodeCount: 3,
          createdNodeCanonicalByteCount: 1_662_343,
          assembledAffectedLineCount: 2,
          previousReconvergenceLineIndex: 63,
          nextReconvergenceLineIndex: 63,
          previousReconvergenceOffset: 2_472,
          nextReconvergenceOffset: 2_471,
          offsetDelta: -1,
        },
      },
    ]
    for (const { edit, evidence } of cases) {
      const fixture = prepareEdit(edit)
      const coreResult = executeOracleIndependentCore(fixture, true)
      expect(fixture.snapshot.persistentFlow).toMatchObject({
        itemCount: 21,
        leafCount: 3,
        nodeCount: 4,
      })
      expect(coreResult).toMatchObject({
        persistentFlowUpdate: {
          work: {
            replacedPreviousRenderedUtf16Length: evidence.replacedPreviousRenderedUtf16Length,
            projectedNextRenderedUtf16Length: evidence.projectedNextRenderedUtf16Length,
            reusedNodeCount: evidence.reusedNodeCount,
            createdNodeCount: evidence.createdNodeCount,
            createdNodeCanonicalByteCount: evidence.createdNodeCanonicalByteCount,
          },
        },
        affectedWindow: {
          work: {
            assembledAffectedLineCount: evidence.assembledAffectedLineCount,
            reconvergenceCandidateCount: 1,
          },
          checkpoint: {
            previousReconvergenceLineIndex: evidence.previousReconvergenceLineIndex,
            nextReconvergenceLineIndex: evidence.nextReconvergenceLineIndex,
            previousReconvergenceOffset: evidence.previousReconvergenceOffset,
            nextReconvergenceOffset: evidence.nextReconvergenceOffset,
            offsetDelta: evidence.offsetDelta,
            stableLineCount: 2,
          },
        },
        coreAcceptance: {
          work: {
            positionedAffectedLineCount: evidence.assembledAffectedLineCount,
            reusedPersistentNodeCount: evidence.reusedNodeCount,
            createdPersistentNodeCount: evidence.createdNodeCount,
          },
        },
      })
      expect(coreResult.affectedWindow.checkpoint.previousSuffixSemanticFingerprint).toBe(
        coreResult.affectedWindow.checkpoint.nextSuffixSemanticFingerprint,
      )
      expect(coreResult.request.shapingRuns).toEqual(fixture.nextOracle.request.shapingRuns)
      expect(coreResult.affectedWindow.lines).toEqual(fixture.nextOracle.request.lines)
      expect(coreResult.optionalQaOracle?.layoutExact).toBe(true)
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

    const result = executeFlowDocTextEngineIncrementalRangePlanV1({
      snapshot: fixture.snapshot,
      plan: fixture.plan,
      rangeRuntimeIdentity: fixture.identity,
      runtime: wasm,
      nextOracle: fixture.nextOracle,
    })
    if (result.status !== "qa-window-proved") throw new Error(result.fallback.message)
    retainedCoreSnapshot ??= createVNextTextBlockMultiRunIncrementalSnapshotV1({
      request: fixture.previous.request,
      acceptedLayout: fixture.previous.layout,
    })
    const coreSnapshot = retainedCoreSnapshot
    const persistentFlowUpdate = createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: coreSnapshot.persistentFlowTree,
      previousRequest: coreSnapshot.request,
      nextRequest: fixture.nextOracle.request,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
    })
    if (persistentFlowUpdate.status !== "accepted") {
      throw new Error(persistentFlowUpdate.issues[0]?.message)
    }
    const semanticCheckpointProof = createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
      snapshot: coreSnapshot,
      nextRequest: fixture.nextOracle.request,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      persistentFlowUpdate: persistentFlowUpdate.update,
    })
    if (semanticCheckpointProof.status !== "checkpoint-accepted") {
      throw new Error(semanticCheckpointProof.message)
    }
    const shallowFrozenRequest = Object.freeze(clone(fixture.nextOracle.request))
    const shallowFrozenProof = createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
      snapshot: coreSnapshot,
      nextRequest: shallowFrozenRequest,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      persistentFlowUpdate: persistentFlowUpdate.update,
    })
    expect(shallowFrozenProof).toMatchObject({
      status: "fallback-required",
      code: "persistent-flow-update-mismatch",
    })
    expect(acceptVNextTextBlockMultiRunIncrementalWindowV1({
      snapshot: coreSnapshot,
      nextRequest: fixture.nextOracle.request,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      semanticCheckpointProof: clone(semanticCheckpointProof),
    })).toMatchObject({
      status: "fallback-required",
      fallback: { code: "invalid-window-proof" },
    })
    expect(acceptVNextTextBlockMultiRunIncrementalWindowV1({
      snapshot: clone(coreSnapshot),
      nextRequest: fixture.nextOracle.request,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      semanticCheckpointProof,
    })).toMatchObject({
      status: "fallback-required",
      fallback: { code: "snapshot-provenance-mismatch" },
    })
    expect(acceptVNextTextBlockMultiRunIncrementalWindowV1({
      snapshot: coreSnapshot,
      nextRequest: { ...fixture.nextOracle.request, bindProductionLayout: true },
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      semanticCheckpointProof,
    })).toMatchObject({
      status: "fallback-required",
      fallback: { code: "production-binding-forbidden" },
    })
    const changedMeasurementStyleKey = clone(fixture.nextOracle.request)
    changedMeasurementStyleKey.measurement.styleKey = `${changedMeasurementStyleKey.measurement.styleKey}-drift`
    expect(acceptVNextTextBlockMultiRunIncrementalWindowV1({
      snapshot: coreSnapshot,
      nextRequest: changedMeasurementStyleKey,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      semanticCheckpointProof,
    })).toMatchObject({
      status: "fallback-required",
      fallback: { code: "layout-context-mismatch" },
    })
    const changedSuffix = clone(fixture.nextOracle.request)
    const suffixOffset = result.affectedWindow.checkpoint.nextReconvergenceOffset
    const suffixRun = changedSuffix.shapingRuns.find((run) => run.renderEndOffset > suffixOffset)!
    const suffixCluster = suffixRun.clusters.find((cluster) => cluster.renderStartOffset >= suffixOffset)!
    suffixCluster.advanceLayoutUnit += 1
    expect(createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
      snapshot: coreSnapshot,
      nextRequest: changedSuffix,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      persistentFlowUpdate: persistentFlowUpdate.update,
    })).toMatchObject({
      status: "fallback-required",
      code: "persistent-flow-update-mismatch",
    })
    const changedSource = clone(fixture.nextOracle.request)
    const suffixSourceRun = changedSource.measurement.runs.find((run) => run.renderEndOffset > suffixOffset)!
    suffixSourceRun.inlineId = `${suffixSourceRun.inlineId}-drift`
    expect(createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
      snapshot: coreSnapshot,
      nextRequest: changedSource,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      persistentFlowUpdate: persistentFlowUpdate.update,
    })).toMatchObject({
      status: "fallback-required",
      code: "persistent-flow-update-mismatch",
    })
    const changedGeneratedOwner = clone(fixture.nextOracle.request)
    const generatedOwnerRun = changedGeneratedOwner.measurement.runs.find((run) => (
      run.renderEndOffset > suffixOffset
    ))!
    generatedOwnerRun.generatedOwnerFingerprint = `sha256:${"a".repeat(64)}`
    expect(createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
      snapshot: coreSnapshot,
      nextRequest: changedGeneratedOwner,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      persistentFlowUpdate: persistentFlowUpdate.update,
    })).toMatchObject({
      status: "fallback-required",
      code: "persistent-flow-update-mismatch",
    })
    const changedStyle = clone(fixture.nextOracle.request)
    const suffixStyleRun = changedStyle.shapingRuns.find((run) => run.renderEndOffset > suffixOffset)!
    suffixStyleRun.styleKey = `${suffixStyleRun.styleKey}-drift`
    expect(createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
      snapshot: coreSnapshot,
      nextRequest: changedStyle,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      persistentFlowUpdate: persistentFlowUpdate.update,
    })).toMatchObject({
      status: "fallback-required",
      code: "persistent-flow-update-mismatch",
    })
    expect(createVNextTextBlockPersistentFlowUpdateV1({
      previousTree: structuredClone(coreSnapshot.persistentFlowTree),
      previousRequest: coreSnapshot.request,
      nextRequest: fixture.nextOracle.request,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "tree-provenance-mismatch" }],
    })
    expect(createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
      snapshot: coreSnapshot,
      nextRequest: fixture.nextOracle.request,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      persistentFlowUpdate: structuredClone(persistentFlowUpdate.update),
    })).toMatchObject({
      status: "fallback-required",
      code: "persistent-flow-update-mismatch",
    })
    const changedUnaffectedSourceStyle = clone(fixture.nextOracle.request)
    const nextRestartOffset = changedUnaffectedSourceStyle.lines[
      result.affectedWindow.checkpoint.nextRestartLineIndex
    ]!.renderStartOffset
    const unaffectedSourceRun = changedUnaffectedSourceStyle.measurement.runs.find((run) => (
      run.renderEndOffset <= nextRestartOffset
    ))!
    expect(unaffectedSourceRun).toBeDefined()
    expect(unaffectedSourceRun.renderEndOffset).toBeLessThanOrEqual(nextRestartOffset)
    unaffectedSourceRun.styleKey = `${unaffectedSourceRun.styleKey}-drift`
    expect(createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1({
      snapshot: coreSnapshot,
      nextRequest: changedUnaffectedSourceStyle,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      persistentFlowUpdate: persistentFlowUpdate.update,
    })).toMatchObject({
      status: "fallback-required",
      code: "persistent-flow-update-mismatch",
    })
    expect(acceptVNextTextBlockMultiRunIncrementalWindowV1({
      snapshot: coreSnapshot,
      nextRequest: changedSuffix,
      edit: fixture.changed.edit,
      window: result.affectedWindow.checkpoint,
      semanticCheckpointProof,
    })).toMatchObject({
      status: "fallback-required",
      fallback: { code: "invalid-window-proof" },
    })

    const invalidOracle = clone(fixture.nextOracle)
    invalidOracle.request.lines[0]!.renderEndOffset += 1
    expect(executeFlowDocTextEngineIncrementalCorePlanV1({
      snapshot: fixture.snapshot,
      plan: fixture.plan,
      rangeRuntimeIdentity: fixture.identity,
      runtime: wasm,
      nextMeasurement: fixture.changed.measurement,
      optionalFullLayoutOracle: invalidOracle,
    })).toMatchObject({
      status: "fallback-required",
      fallback: { code: "invalid-optional-full-layout-oracle" },
    })
    expect(executeFlowDocTextEngineIncrementalCorePlanV1({
      snapshot: fixture.snapshot,
      plan: fixture.plan,
      rangeRuntimeIdentity: fixture.identity,
      runtime: wasm,
      nextMeasurement: fixture.changed.measurement,
      policy: {
        rangeFacts: { ...FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_EXECUTION_POLICY_V1.rangeFacts },
        affectedLines: {
          ...FLOWDOC_TEXT_ENGINE_INCREMENTAL_CORE_EXECUTION_POLICY_V1.affectedLines,
          maximumReflowUtf16Length: 1,
        },
      },
    })).toMatchObject({
      status: "fallback-required",
      fallback: { code: "line-window-exceeded" },
      persistentFlowUpdate: null,
    })
  }, 30_000)
})
