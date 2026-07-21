import { describe, expect, it } from "vitest"
import type { VNextTextBlockV4MeasurementRequest } from "../src/index.js"
import {
  FLOWDOC_TEXT_ENGINE_INCREMENTAL_EDIT_RANGE_POLICY_V1,
  planFlowDocTextEngineIncrementalEditRangeV1,
} from "../packages/text-engine-rust-wasm/src/incrementalEditRangePlanner.js"
import {
  createFlowDocTextEngineIncrementalRangeRuntimeIdentityV1,
  createFlowDocTextEngineIncrementalRetainedSnapshotV1,
  inspectFlowDocTextEngineIncrementalRetainedSnapshotV1,
} from "../packages/text-engine-rust-wasm/src/incrementalRetainedSnapshot.js"
import { createFlowDocTextEngineMultiRunLayoutV1 } from "../packages/text-engine-rust-wasm/src/multiRunLayout.js"
import type {
  FlowDocTextEngineMultiRunLayoutInputV1,
  FlowDocTextEngineMultiRunRuntimeV1,
} from "../packages/text-engine-rust-wasm/src/multiRunLayoutContract.js"
import { FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 } from "../packages/text-engine-rust-wasm/src/mr1FontFaces.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function scalarUtf8Length(scalar: string): number {
  return new TextEncoder().encode(scalar).length
}

function fakeRuntime(): FlowDocTextEngineMultiRunRuntimeV1 {
  return {
    runtimeKind: "test-mr1",
    shape({ text, fontFace }) {
      let byteOffset = 0
      const glyphs = [...text].map((scalar, index) => {
        const cluster = byteOffset
        byteOffset += scalarUtf8Length(scalar)
        return {
          index,
          glyphId: index + 10,
          cluster,
          xAdvance: fontFace.weight === 700 ? 600 : 500,
          yAdvance: 0,
          xOffset: 0,
          yOffset: 0,
        }
      })
      return {
        contractVersion: 1,
        outputShapeVersion: "flowdoc-text-engine-mr1-shape-facts-v1",
        text,
        fontFaceId: fontFace.fontFaceId,
        textByteLength: byteOffset,
        textScalarCount: [...text].length,
        unitsPerEm: fontFace.unitsPerEm,
        ascentFontUnit: fontFace.ascentFontUnit,
        descentFontUnit: fontFace.descentFontUnit,
        lineGapFontUnit: fontFace.lineGapFontUnit,
        glyphs,
        summary: {
          glyphCount: glyphs.length,
          missingGlyphCount: 0,
          totalAdvanceFontUnits: glyphs.reduce((sum, glyph) => sum + glyph.xAdvance, 0),
        },
      }
    },
    segment(text) {
      const breakUtf16Offsets = [
        0,
        ...[...text.matchAll(/\s+/gu)].map((match) => match.index + match[0].length),
        text.length,
      ].filter((offset, index, all) => index === 0 || offset !== all[index - 1])
      return {
        contractVersion: 1,
        outputShapeVersion: "flowdoc-text-engine-mr1-segmentation-facts-v1",
        text,
        textByteLength: new TextEncoder().encode(text).length,
        textScalarCount: [...text].length,
        breakByteOffsets: [...breakUtf16Offsets],
        breakUtf16Offsets,
        summary: { breakCount: breakUtf16Offsets.length },
      }
    },
  }
}

function splitAfter(text: string, target: number): number {
  const offset = text.indexOf(" ", target)
  if (offset < 0) throw new Error("fixture split is unavailable")
  return offset + 1
}

function inputFixture(): FlowDocTextEngineMultiRunLayoutInputV1 {
  const unit = "สวัสดีครับตูม office affinity prepared summary "
  const text = unit.repeat(48).trimEnd()
  const splitA = splitAfter(text, 360)
  const splitB = splitAfter(text, 540)
  const splitC = splitAfter(text, 900)
  const splitD = splitAfter(text, 960)
  return {
    layoutId: "incremental-retained-plan-layout",
    measurement: {
      documentId: "incremental-retained-plan-document",
      instanceRevision: 40,
      sectionId: "section-main",
      textBlockId: "incremental-retained-plan-block",
      availableWidthPt: 240,
      measurementProfileId: "measurement-profile-mr1-range-plan",
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
    fontFaces: FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1.map((face) => clone(face)),
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

function acceptedFixture() {
  const input = inputFixture()
  const accepted = createFlowDocTextEngineMultiRunLayoutV1(input, fakeRuntime())
  if (accepted.status !== "accepted") throw new Error(accepted.issues.map((issue) => issue.message).join("\n"))
  const identity = createFlowDocTextEngineIncrementalRangeRuntimeIdentityV1({
    runtime: "test-mr1-range",
    measurementProfileId: accepted.measurementProfileId,
    fontSha256ById: Object.fromEntries(accepted.layout.fontFaces.map((face) => [
      face.fontFaceId,
      face.fontSha256,
    ])),
  })
  const snapshot = createFlowDocTextEngineIncrementalRetainedSnapshotV1({
    accepted,
    rangeRuntimeIdentity: identity,
  })
  return { input, accepted, identity, snapshot }
}

describe("MR1-K retained snapshot and edit-range planner", () => {
  it("retains accepted clusters, lines, and deterministic prefix/suffix checkpoint chains", () => {
    const { accepted, identity, snapshot } = acceptedFixture()
    expect(snapshot).toMatchObject({
      source: "flowdoc-text-engine-incremental-retained-snapshot-v1",
      contractVersion: 1,
      acceptedAdapterFingerprint: accepted.fingerprint,
      acceptedCoreLayoutFingerprint: accepted.layout.fingerprint,
      contracts: {
        retainedFromAcceptedCompleteLayout: true,
        prefixAndSuffixCheckpointChains: true,
        processLocalImmutableSnapshot: true,
        perPlanFullSnapshotHashing: false,
        runtimeReuseRequiresExactIdentity: true,
        engineExecution: false,
        layoutAssembly: false,
        mayPublishLayout: false,
        productionBinding: false,
      },
    })
    expect(snapshot.summary).toEqual({
      renderedUtf16Length: accepted.request.measurement.renderedText.length,
      sourceRunCount: 5,
      shapingRunCount: 3,
      clusterCount: accepted.summary.clusterCount,
      breakOpportunityCount: accepted.request.breakOffsets.length,
      lineCount: accepted.layout.lines.length,
    })
    expect(snapshot.lineCheckpoints).toHaveLength(snapshot.lines.length)
    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(Object.isFrozen(snapshot.shapingRuns[0]!.clusters)).toBe(true)
    expect(new Set(snapshot.lineCheckpoints.map((checkpoint) => checkpoint.prefixLayoutFingerprint)).size)
      .toBe(snapshot.lines.length)
    expect(new Set(snapshot.lineCheckpoints.map((checkpoint) => checkpoint.prefixSemanticFingerprint)).size)
      .toBe(snapshot.lines.length)
    expect(snapshot.lineCheckpoints.every((checkpoint) => (
      checkpoint.clusterStartIndex <= checkpoint.clusterEndIndex
        && checkpoint.semanticLineFingerprint.startsWith("sha256:")
        && checkpoint.suffixSemanticFingerprint.startsWith("sha256:")
        && checkpoint.fingerprint.startsWith("sha256:")
    ))).toBe(true)
    expect(inspectFlowDocTextEngineIncrementalRetainedSnapshotV1({
      snapshot,
      rangeRuntimeIdentity: identity,
    })).toEqual({ status: "valid", fingerprint: snapshot.fingerprint })
    expect(createFlowDocTextEngineIncrementalRetainedSnapshotV1({
      accepted: clone(accepted),
      rangeRuntimeIdentity: clone(identity),
    })).toEqual(snapshot)
  })

  it("plans one safe regular-run insertion with retained clusters on both sides", () => {
    const { identity, snapshot } = acceptedFixture()
    const changed = replaceInsideRun({
      previous: snapshot.measurement,
      sourceRunIndex: 2,
      localStartOffset: 120,
      insertedText: "ก",
    })
    const before = JSON.stringify({ snapshot, identity, changed })
    const plan = planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot,
      rangeRuntimeIdentity: identity,
      nextMeasurement: changed.measurement,
      edit: changed.edit,
    })

    expect(plan).toMatchObject({
      status: "range-planned",
      affectedSourceRun: { sourceRunIndex: 2, inlineId: "regular-middle", kind: "text" },
      affectedShapingRun: { fontFaceId: "sarabun-regular", fontSizeLayoutUnit: 12_000_000 },
      contracts: {
        execution: "retained-facts-range-plan-only",
        engineExecution: false,
        lineAssembly: false,
        coreAcceptance: false,
        mayPublishLayout: false,
        fullFallbackRequiredOnAmbiguity: true,
        productionBinding: false,
      },
    })
    if (plan.status !== "range-planned") throw new Error(plan.fallback.message)
    expect(plan.restart.previousRestartLineIndex).toBe(Math.max(0, plan.restart.affectedPreviousLineIndex - 1))
    expect(plan.restart.checkpoint).toEqual(snapshot.lineCheckpoints[plan.restart.previousRestartLineIndex])
    expect(plan.engineRange.previous.globalStartUtf16).toBeLessThanOrEqual(changed.edit.previousStartOffset)
    expect(plan.engineRange.previous.globalEndUtf16).toBeGreaterThanOrEqual(changed.edit.previousEndOffset)
    expect(plan.engineRange.nextShaping.globalEndUtf16).toBe(
      plan.engineRange.previous.globalEndUtf16 + 1,
    )
    expect(plan.engineRange.nextShaping.contextGlobalStartUtf16)
      .toBeLessThanOrEqual(plan.engineRange.nextShaping.globalStartUtf16)
    expect(plan.engineRange.nextShaping.contextGlobalEndUtf16)
      .toBeGreaterThanOrEqual(plan.engineRange.nextShaping.globalEndUtf16)
    expect(plan.work.retainedPrefixClusterCount).toBeGreaterThan(0)
    expect(plan.work.retainedSuffixClusterCount).toBeGreaterThan(0)
    expect(plan.work.nextRangeUtf16Length).toBeLessThanOrEqual(
      FLOWDOC_TEXT_ENGINE_INCREMENTAL_EDIT_RANGE_POLICY_V1.maximumInitialRangeUtf16Length,
    )
    expect(planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot,
      rangeRuntimeIdentity: clone(identity),
      nextMeasurement: clone(changed.measurement),
      edit: clone(changed.edit),
    })).toEqual(plan)
    expect(JSON.stringify({ snapshot, identity, changed })).toBe(before)
  })

  it("plans Bold and field-adjacent text edits without changing retained run topology", () => {
    const { identity, snapshot } = acceptedFixture()
    const bold = replaceInsideRun({
      previous: snapshot.measurement,
      sourceRunIndex: 1,
      localStartOffset: 20,
      localEndOffset: 24,
      insertedText: "office",
    })
    const boldPlan = planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot,
      rangeRuntimeIdentity: identity,
      nextMeasurement: bold.measurement,
      edit: bold.edit,
    })
    expect(boldPlan).toMatchObject({
      status: "range-planned",
      affectedShapingRun: { fontFaceId: "sarabun-bold", fontSizeLayoutUnit: 18_000_000 },
    })

    const middleRun = snapshot.measurement.runs[2]!
    const adjacent = replaceInsideRun({
      previous: snapshot.measurement,
      sourceRunIndex: 2,
      localStartOffset: middleRun.renderedText.length,
      insertedText: "ก",
    })
    const adjacentPlan = planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot,
      rangeRuntimeIdentity: identity,
      nextMeasurement: adjacent.measurement,
      edit: adjacent.edit,
    })
    expect(adjacentPlan).toMatchObject({
      status: "range-planned",
      affectedSourceRun: { inlineId: "regular-middle" },
      affectedShapingRun: { fontFaceId: "sarabun-regular" },
    })
    expect(adjacent.measurement.runs[3]).toMatchObject({
      inlineId: "resolved-field",
      kind: "resolved-field",
      fieldKey: "report.sample",
      renderedText: snapshot.measurement.runs[3]!.renderedText,
    })

    const deletion = replaceInsideRun({
      previous: snapshot.measurement,
      sourceRunIndex: 4,
      localStartOffset: 40,
      localEndOffset: 48,
      insertedText: "",
    })
    const deletionPlan = planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot,
      rangeRuntimeIdentity: identity,
      nextMeasurement: deletion.measurement,
      edit: deletion.edit,
    })
    expect(deletionPlan.status).toBe("range-planned")
    if (deletionPlan.status !== "range-planned") throw new Error(deletionPlan.fallback.message)
    expect(deletionPlan.engineRange.nextShaping.globalEndUtf16).toBe(
      deletionPlan.engineRange.previous.globalEndUtf16 - 8,
    )
  })

  it("fails closed on snapshot mutation, identity drift, topology changes, fields, and oversized ranges", () => {
    const { identity, snapshot } = acceptedFixture()
    const changed = replaceInsideRun({
      previous: snapshot.measurement,
      sourceRunIndex: 2,
      localStartOffset: 100,
      insertedText: "ก",
    })

    const mutated = clone(snapshot)
    mutated.shapingRuns[0]!.clusters[0]!.advanceLayoutUnit += 1
    expect(planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot: mutated,
      rangeRuntimeIdentity: identity,
      nextMeasurement: changed.measurement,
      edit: changed.edit,
    })).toMatchObject({ status: "fallback-required", fallback: { code: "invalid-snapshot" } })

    const otherIdentity = createFlowDocTextEngineIncrementalRangeRuntimeIdentityV1({
      runtime: "node-native-mr1-range",
      measurementProfileId: identity.measurementProfileId,
      fontSha256ById: identity.fontSha256ById,
    })
    expect(planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot,
      rangeRuntimeIdentity: otherIdentity,
      nextMeasurement: changed.measurement,
      edit: changed.edit,
    })).toMatchObject({ status: "fallback-required", fallback: { code: "runtime-identity-mismatch" } })

    const changedStyle = clone(changed.measurement)
    changedStyle.runs[2]!.localStyle = { fontWeight: "bold" }
    expect(planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot,
      rangeRuntimeIdentity: identity,
      nextMeasurement: changedStyle,
      edit: changed.edit,
    })).toMatchObject({ status: "fallback-required", fallback: { code: "source-run-topology-changed" } })

    const field = replaceInsideRun({
      previous: snapshot.measurement,
      sourceRunIndex: 3,
      localStartOffset: 2,
      localEndOffset: 3,
      insertedText: "X",
    })
    expect(planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot,
      rangeRuntimeIdentity: identity,
      nextMeasurement: field.measurement,
      edit: field.edit,
    })).toMatchObject({ status: "fallback-required", fallback: { code: "edited-run-kind-unsupported" } })

    expect(planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot,
      rangeRuntimeIdentity: identity,
      nextMeasurement: changed.measurement,
      edit: changed.edit,
      policy: { ...FLOWDOC_TEXT_ENGINE_INCREMENTAL_EDIT_RANGE_POLICY_V1, maximumInitialRangeUtf16Length: 2 },
    })).toMatchObject({ status: "fallback-required", fallback: { code: "initial-range-exceeded" } })
  })

  it("rejects hard-break insertion and UTF-16 offsets that split a surrogate pair", () => {
    const { identity, snapshot } = acceptedFixture()
    const hardBreak = replaceInsideRun({
      previous: snapshot.measurement,
      sourceRunIndex: 2,
      localStartOffset: 80,
      insertedText: "\n",
    })
    expect(planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot,
      rangeRuntimeIdentity: identity,
      nextMeasurement: hardBreak.measurement,
      edit: hardBreak.edit,
    })).toMatchObject({ status: "fallback-required", fallback: { code: "hard-break-edited" } })

    const emoji = replaceInsideRun({
      previous: snapshot.measurement,
      sourceRunIndex: 2,
      localStartOffset: 40,
      insertedText: "😀",
    })
    expect(planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot,
      rangeRuntimeIdentity: identity,
      nextMeasurement: emoji.measurement,
      edit: emoji.edit,
    }).status).toBe("range-planned")
    expect(planFlowDocTextEngineIncrementalEditRangeV1({
      snapshot,
      rangeRuntimeIdentity: identity,
      nextMeasurement: emoji.measurement,
      edit: { ...emoji.edit, nextEndOffset: emoji.edit.previousStartOffset + 1 },
    })).toMatchObject({ status: "fallback-required", fallback: { code: "invalid-edit" } })
  })
})
