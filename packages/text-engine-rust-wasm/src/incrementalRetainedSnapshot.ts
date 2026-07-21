import {
  createVNextCompactFingerprint,
  createVNextTextBlockMultiRunIncrementalSnapshotV1,
  type VNextTextBlockAcceptedShapingRunV1,
  type VNextTextBlockMultiRunIncrementalSnapshotV1,
  type VNextTextBlockMultiRunFontFaceV1,
  type VNextTextBlockPositionedLineV1,
  type VNextTextBlockV4MeasurementRequest,
} from "@flowdoc/vnext-core"
import { createFlowDocTextEngineSemanticLineFingerprintV1 } from "./incrementalLineCheckpoint.js"
import type { FlowDocTextEngineMultiRunLayoutResultV1 } from "./multiRunLayoutContract.js"
import {
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION,
} from "./runtimeCommon.js"
import {
  FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION,
  FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256,
} from "./runtimeMr1Range.js"

export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_RETAINED_SNAPSHOT_SOURCE =
  "flowdoc-text-engine-incremental-retained-snapshot-v1" as const
export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_RETAINED_SNAPSHOT_VERSION = 1 as const
export const FLOWDOC_TEXT_ENGINE_INCREMENTAL_UNICODE_POLICY =
  "preserve-code-point-sequence-v1" as const

export type FlowDocTextEngineIncrementalRangeRuntimeKindV1 =
  | "node-native-mr1-range"
  | "browser-worker-wasm-mr1-range"
  | "test-mr1-range"

export interface FlowDocTextEngineIncrementalRangeRuntimeIdentityV1 {
  runtime: FlowDocTextEngineIncrementalRangeRuntimeKindV1
  measurementProfileId: string
  engineArtifactSha256: typeof FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256
  boundaryVersion: typeof FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION
  shaperRevision: typeof FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION
  segmenterRevision: typeof FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION
  segmenterDataRevision: typeof FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION
  unicodePolicy: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_UNICODE_POLICY
  fontSha256ById: Readonly<Record<string, string>>
  fingerprint: string
}

export interface FlowDocTextEngineIncrementalLineCheckpointV1 {
  lineIndex: number
  renderStartOffset: number
  renderEndOffset: number
  yOffsetLayoutUnit: number
  heightLayoutUnit: number
  clusterStartIndex: number
  clusterEndIndex: number
  coreLineFingerprint: string
  semanticLineFingerprint: string
  prefixLayoutFingerprint: string
  prefixSemanticFingerprint: string
  suffixSemanticFingerprint: string
  fingerprint: string
}

export interface FlowDocTextEngineIncrementalRetainedSnapshotV1 {
  source: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_RETAINED_SNAPSHOT_SOURCE
  contractVersion: typeof FLOWDOC_TEXT_ENGINE_INCREMENTAL_RETAINED_SNAPSHOT_VERSION
  layoutId: string
  textBlockId: string
  instanceRevision: number
  measurementProfileId: string
  layoutRuntimeKind: Extract<FlowDocTextEngineMultiRunLayoutResultV1, { status: "accepted" }>["runtimeKind"]
  rangeRuntimeIdentity: FlowDocTextEngineIncrementalRangeRuntimeIdentityV1
  acceptedAdapterFingerprint: string
  acceptedCoreLayoutFingerprint: string
  layoutContextFingerprint: string
  layoutContext: {
    layoutUnitPolicyFingerprint: string
    availableWidthLayoutUnit: number
    declaredLineHeightLayoutUnit: number
    paragraphStyle: AcceptedLayout["request"]["paragraphStyle"]
  }
  measurement: VNextTextBlockV4MeasurementRequest
  fontFaces: VNextTextBlockMultiRunFontFaceV1[]
  breakOffsets: readonly number[]
  shapingRuns: VNextTextBlockAcceptedShapingRunV1[]
  lines: VNextTextBlockPositionedLineV1[]
  lineCheckpoints: FlowDocTextEngineIncrementalLineCheckpointV1[]
  summary: {
    renderedUtf16Length: number
    sourceRunCount: number
    shapingRunCount: number
    clusterCount: number
    breakOpportunityCount: number
    lineCount: number
  }
  contracts: {
    retainedFromAcceptedCompleteLayout: true
    prefixAndSuffixCheckpointChains: true
    processLocalImmutableSnapshot: true
    perPlanFullSnapshotHashing: false
    runtimeReuseRequiresExactIdentity: true
    engineExecution: false
    layoutAssembly: false
    mayPublishLayout: false
    rendererMayMeasureText: false
    productionBinding: false
  }
  fingerprint: string
}

export type FlowDocTextEngineIncrementalRetainedSnapshotInspectionV1 =
  | { status: "valid"; fingerprint: string }
  | {
      status: "invalid"
      code: "snapshot-provenance-mismatch" | "runtime-identity-mismatch"
      message: string
    }

type AcceptedLayout = Extract<FlowDocTextEngineMultiRunLayoutResultV1, { status: "accepted" }>

const processLocalSnapshots = new WeakSet<object>()
const incrementalCoreSnapshots = new WeakMap<object, VNextTextBlockMultiRunIncrementalSnapshotV1>()

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object" || Object.isFrozen(value)) return value
  Object.values(value).forEach((item) => deepFreeze(item))
  return Object.freeze(value)
}

function nonBlank(value: string): boolean {
  return value.trim().length > 0
}

function sha256(value: string): boolean {
  return /^[a-f0-9]{64}$/u.test(value)
}

function fingerprintFacts<T extends { fingerprint: string }>(value: T): Omit<T, "fingerprint"> {
  const { fingerprint: _fingerprint, ...facts } = value
  return facts
}

function sortedFontDigests(fontSha256ById: Readonly<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(Object.entries(fontSha256ById).sort(([left], [right]) => left.localeCompare(right)))
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function createFlowDocTextEngineIncrementalRangeRuntimeIdentityV1(input: {
  runtime: FlowDocTextEngineIncrementalRangeRuntimeKindV1
  measurementProfileId: string
  fontSha256ById: Readonly<Record<string, string>>
}): FlowDocTextEngineIncrementalRangeRuntimeIdentityV1 {
  const fontSha256ById = sortedFontDigests(input.fontSha256ById)
  if (
    !nonBlank(input.measurementProfileId)
    || Object.keys(fontSha256ById).length === 0
    || Object.entries(fontSha256ById).some(([fontFaceId, digest]) => !nonBlank(fontFaceId) || !sha256(digest))
  ) throw new Error("incremental range runtime identity requires one measurement profile and pinned fonts")
  const facts = {
    runtime: input.runtime,
    measurementProfileId: input.measurementProfileId,
    engineArtifactSha256: FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256,
    boundaryVersion: FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION,
    shaperRevision: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION,
    segmenterRevision: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION,
    segmenterDataRevision: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION,
    unicodePolicy: FLOWDOC_TEXT_ENGINE_INCREMENTAL_UNICODE_POLICY,
    fontSha256ById,
  }
  return { ...facts, fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) }
}

function validateRuntimeIdentity(
  identity: FlowDocTextEngineIncrementalRangeRuntimeIdentityV1,
): boolean {
  return nonBlank(identity.measurementProfileId)
    && identity.engineArtifactSha256 === FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_SHA256
    && identity.boundaryVersion === FLOWDOC_TEXT_ENGINE_MR1_RANGE_WASM_BOUNDARY_VERSION
    && identity.shaperRevision === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION
    && identity.segmenterRevision === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION
    && identity.segmenterDataRevision === FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION
    && identity.unicodePolicy === FLOWDOC_TEXT_ENGINE_INCREMENTAL_UNICODE_POLICY
    && Object.keys(identity.fontSha256ById).length > 0
    && Object.values(identity.fontSha256ById).every(sha256)
    && identity.fingerprint === createVNextCompactFingerprint(JSON.stringify(fingerprintFacts(identity)))
}

function layoutContextFingerprint(accepted: AcceptedLayout): string {
  return createVNextCompactFingerprint(JSON.stringify({
    layoutId: accepted.layoutId,
    textBlockId: accepted.textBlockId,
    measurementProfileId: accepted.measurementProfileId,
    layoutUnitPolicyFingerprint: accepted.request.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: accepted.request.availableWidthLayoutUnit,
    declaredLineHeightLayoutUnit: accepted.request.declaredLineHeightLayoutUnit,
    paragraphStyle: accepted.request.paragraphStyle,
    fontFaces: accepted.request.fontFaces,
  }))
}

function createLineCheckpoints(
  lines: readonly VNextTextBlockPositionedLineV1[],
  shapingRuns: readonly VNextTextBlockAcceptedShapingRunV1[],
): FlowDocTextEngineIncrementalLineCheckpointV1[] {
  const clusters = shapingRuns.flatMap((run) => run.clusters).sort((left, right) => (
    left.renderStartOffset - right.renderStartOffset
  ))
  const semanticLineFingerprints = lines.map(createFlowDocTextEngineSemanticLineFingerprintV1)
  const suffixSemanticFingerprints = Array.from<string>({ length: lines.length })
  let nextSuffixFingerprint = createVNextCompactFingerprint("incremental-line-suffix:end:v1")
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    nextSuffixFingerprint = createVNextCompactFingerprint(JSON.stringify({
      semanticLineFingerprint: semanticLineFingerprints[index],
      nextSuffixFingerprint,
    }))
    suffixSemanticFingerprints[index] = nextSuffixFingerprint
  }

  let previousPrefixFingerprint = createVNextCompactFingerprint("incremental-line-prefix:start:v1")
  let previousPrefixSemanticFingerprint = createVNextCompactFingerprint(
    "incremental-line-prefix-semantic:start:v1",
  )
  return lines.map((line, lineIndex) => {
    let clusterStartIndex = clusters.findIndex((cluster) => cluster.renderEndOffset > line.renderStartOffset)
    if (clusterStartIndex < 0) clusterStartIndex = clusters.length
    let clusterEndIndex = clusters.findIndex((cluster) => cluster.renderStartOffset >= line.renderEndOffset)
    if (clusterEndIndex < 0) clusterEndIndex = clusters.length
    previousPrefixFingerprint = createVNextCompactFingerprint(JSON.stringify({
      previousPrefixFingerprint,
      lineIndex,
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
      yOffsetLayoutUnit: line.yOffsetLayoutUnit,
      coreLineFingerprint: line.fingerprint,
    }))
    previousPrefixSemanticFingerprint = createVNextCompactFingerprint(JSON.stringify({
      previousPrefixSemanticFingerprint,
      lineIndex,
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
      yOffsetLayoutUnit: line.yOffsetLayoutUnit,
      semanticLineFingerprint: semanticLineFingerprints[lineIndex],
    }))
    const facts = {
      lineIndex,
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
      yOffsetLayoutUnit: line.yOffsetLayoutUnit,
      heightLayoutUnit: line.heightLayoutUnit,
      clusterStartIndex,
      clusterEndIndex,
      coreLineFingerprint: line.fingerprint,
      semanticLineFingerprint: semanticLineFingerprints[lineIndex]!,
      prefixLayoutFingerprint: previousPrefixFingerprint,
      prefixSemanticFingerprint: previousPrefixSemanticFingerprint,
      suffixSemanticFingerprint: suffixSemanticFingerprints[lineIndex]!,
    }
    return { ...facts, fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) }
  })
}

export function createFlowDocTextEngineIncrementalRetainedSnapshotV1(input: {
  accepted: AcceptedLayout
  rangeRuntimeIdentity: FlowDocTextEngineIncrementalRangeRuntimeIdentityV1
}): FlowDocTextEngineIncrementalRetainedSnapshotV1 {
  const { accepted, rangeRuntimeIdentity } = input
  if (!validateRuntimeIdentity(rangeRuntimeIdentity)) {
    throw new Error("incremental retained snapshot range runtime identity is invalid")
  }
  if (accepted.measurementProfileId !== rangeRuntimeIdentity.measurementProfileId) {
    throw new Error("incremental retained snapshot measurement profile does not match the range runtime")
  }
  const expectedFonts = sortedFontDigests(Object.fromEntries(
    accepted.layout.fontFaces.map((face) => [face.fontFaceId, face.fontSha256]),
  ))
  if (Object.entries(expectedFonts).some(([fontFaceId, digest]) => (
    rangeRuntimeIdentity.fontSha256ById[fontFaceId] !== digest
  ))) {
    throw new Error("incremental retained snapshot font digests do not match the range runtime")
  }
  const shapingRuns = clone(accepted.layout.shapingRuns)
  const lines = clone(accepted.layout.lines)
  const lineCheckpoints = createLineCheckpoints(lines, shapingRuns)
  const incrementalCoreSnapshot = createVNextTextBlockMultiRunIncrementalSnapshotV1({
    request: accepted.request,
    acceptedLayout: accepted.layout,
  })
  const facts = {
    source: FLOWDOC_TEXT_ENGINE_INCREMENTAL_RETAINED_SNAPSHOT_SOURCE,
    contractVersion: FLOWDOC_TEXT_ENGINE_INCREMENTAL_RETAINED_SNAPSHOT_VERSION,
    layoutId: accepted.layoutId,
    textBlockId: accepted.textBlockId,
    instanceRevision: accepted.instanceRevision,
    measurementProfileId: accepted.measurementProfileId,
    layoutRuntimeKind: accepted.runtimeKind,
    rangeRuntimeIdentity: clone(rangeRuntimeIdentity),
    acceptedAdapterFingerprint: accepted.fingerprint,
    acceptedCoreLayoutFingerprint: accepted.layout.fingerprint,
    layoutContextFingerprint: layoutContextFingerprint(accepted),
    layoutContext: {
      layoutUnitPolicyFingerprint: accepted.request.layoutUnitPolicyFingerprint,
      availableWidthLayoutUnit: accepted.request.availableWidthLayoutUnit,
      declaredLineHeightLayoutUnit: accepted.request.declaredLineHeightLayoutUnit,
      paragraphStyle: clone(accepted.request.paragraphStyle),
    },
    measurement: clone(accepted.request.measurement),
    fontFaces: clone(accepted.layout.fontFaces),
    breakOffsets: [...accepted.request.breakOffsets],
    shapingRuns,
    lines,
    lineCheckpoints,
    summary: {
      renderedUtf16Length: accepted.request.measurement.renderedText.length,
      sourceRunCount: accepted.request.measurement.runs.length,
      shapingRunCount: shapingRuns.length,
      clusterCount: shapingRuns.reduce((sum, run) => sum + run.clusters.length, 0),
      breakOpportunityCount: accepted.request.breakOffsets.length,
      lineCount: lines.length,
    },
    contracts: {
      retainedFromAcceptedCompleteLayout: true,
      prefixAndSuffixCheckpointChains: true,
      processLocalImmutableSnapshot: true,
      perPlanFullSnapshotHashing: false,
      runtimeReuseRequiresExactIdentity: true,
      engineExecution: false,
      layoutAssembly: false,
      mayPublishLayout: false,
      rendererMayMeasureText: false,
      productionBinding: false,
    },
  } as const
  const snapshot = deepFreeze({
    ...facts,
    fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
  })
  processLocalSnapshots.add(snapshot)
  incrementalCoreSnapshots.set(snapshot, incrementalCoreSnapshot)
  return snapshot
}

export function getFlowDocTextEngineIncrementalCoreSnapshotV1(
  snapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1,
): VNextTextBlockMultiRunIncrementalSnapshotV1 | null {
  if (!processLocalSnapshots.has(snapshot)) return null
  return incrementalCoreSnapshots.get(snapshot) ?? null
}

export function inspectFlowDocTextEngineIncrementalRetainedSnapshotV1(input: {
  snapshot: FlowDocTextEngineIncrementalRetainedSnapshotV1
  rangeRuntimeIdentity: FlowDocTextEngineIncrementalRangeRuntimeIdentityV1
}): FlowDocTextEngineIncrementalRetainedSnapshotInspectionV1 {
  if (
    !validateRuntimeIdentity(input.rangeRuntimeIdentity)
    || !sameJson(input.snapshot.rangeRuntimeIdentity, input.rangeRuntimeIdentity)
  ) return {
    status: "invalid",
    code: "runtime-identity-mismatch",
    message: "retained snapshot and current range runtime identities must match exactly",
  }
  if (!processLocalSnapshots.has(input.snapshot)) return {
    status: "invalid",
    code: "snapshot-provenance-mismatch",
    message: "retained snapshot is not the immutable process-local object created by this runtime",
  }
  return { status: "valid", fingerprint: input.snapshot.fingerprint }
}
