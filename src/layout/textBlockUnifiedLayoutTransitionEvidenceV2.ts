import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type { VNextTextBlockUnifiedLayoutChangeV1 } from "./textBlockUnifiedLayoutChangeContractV1.js"
import type { VNextTextBlockResolvedShapingRunV1 } from "./textBlockMultiRunLayoutContractV1.js"
import type {
  VNextTextBlockTransitionEvidenceAcceptanceResultV2,
  VNextTextBlockTransitionEvidenceRequestResultV2,
  VNextTextBlockTransitionEvidenceV2,
  VNextTextBlockTransitionProducerFailureAcceptanceResultV2,
  VNextTextBlockTransitionProducerFailureV2,
  VNextTextBlockTransitionProducerResponseV2,
  VNextTextBlockTransitionProducerRuntimeIdentityV2,
  VNextTextBlockTransitionProducerSourceMaterialV2,
  VNextTextBlockTransitionEvidenceRequestV2,
  VNextTextBlockTransitionProducerWorkV2,
} from "./textBlockUnifiedLayoutEvidenceContractV2.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import type { VNextTextBlockUnifiedLayoutRootV2 } from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2,
} from "./textBlockUnifiedLayoutTransitionPreflightV2.js"
import { composeVNextTextBlockStageWorkLedgerInternalV1 } from "./textBlockUnifiedLayoutWorkPolicyV1.js"
import { createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1 } from "./textBlockUnifiedLayoutTransitionChangeInternalsV1.js"

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function freeze<T>(value: T): T {
  if (value != null && typeof value === "object") {
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor != null && Object.hasOwn(descriptor, "value")) freeze(descriptor.value)
    }
    if (!Object.isFrozen(value)) Object.freeze(value)
  }
  return value
}

function exactKeys(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) return false
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return false
    if (Object.getOwnPropertySymbols(value).length !== 0) return false
    const actual = Reflect.ownKeys(value)
    if (actual.length !== keys.length || actual.some((key) => typeof key !== "string" || !keys.includes(key))) return false
    return keys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      return descriptor != null && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true
    })
  } catch {
    return false
  }
}

function safeDataTree(value: unknown, seen = new Set<object>()): boolean {
  if (value == null || typeof value === "string" || typeof value === "boolean") return true
  if (typeof value === "number") return Number.isSafeInteger(value)
  if (typeof value !== "object" || seen.has(value)) return false
  seen.add(value)
  try {
    try {
      const prototype = Object.getPrototypeOf(value)
      if (Array.isArray(value)) {
        if (prototype !== Array.prototype || Object.getOwnPropertySymbols(value).length !== 0) return false
        const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length")
        if (lengthDescriptor == null || !Object.hasOwn(lengthDescriptor, "value") || !Number.isSafeInteger(lengthDescriptor.value)) return false
        if (Reflect.ownKeys(value).length !== lengthDescriptor.value + 1) return false
        for (let index = 0; index < lengthDescriptor.value; index += 1) {
          const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
          if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true || !safeDataTree(descriptor.value, seen)) return false
        }
        return true
      }
      if (prototype !== Object.prototype && prototype !== null) return false
      if (Object.getOwnPropertySymbols(value).length !== 0) return false
      for (const key of Reflect.ownKeys(value)) {
        if (typeof key !== "string") return false
        const descriptor = Object.getOwnPropertyDescriptor(value, key)
        if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true || !safeDataTree(descriptor.value, seen)) return false
      }
      return true
    } finally {
      seen.delete(value)
    }
  } catch {
    return false
  }
}

function issue(message: string): VNextTextBlockUnifiedLayoutIssueV1 {
  return {
    code: "evidence-authority-mismatch",
    severity: "error",
    stage: "evidence",
    path: "evidence",
    message,
  }
}

interface RequestTupleV2 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}

const requests = new WeakMap<object, RequestTupleV2>()
/*
 * A registered runtime identity is the private process-local bearer
 * capability for factual engine output. Core independently recomputes every
 * Source/range/style/topology/work fact available in the V2 payload; numeric
 * glyph advances remain producer facts because this contract intentionally
 * carries no complete glyph oracle.
 */
const runtimeIdentities = new WeakSet<object>()
const evidenceRecords = new WeakMap<object, RequestTupleV2>()
const failureAuthorities = new WeakMap<object, RequestTupleV2>()

export function createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2(
  input: Omit<VNextTextBlockTransitionProducerRuntimeIdentityV2, "source" | "contractVersion" | "fingerprint">,
): VNextTextBlockTransitionProducerRuntimeIdentityV2 {
  if (
    !["node-native-mr1-range", "browser-worker-wasm-mr1-range"].includes(input.runtime)
    || [input.engineBuildFingerprint, input.fontBackendFingerprint, input.unitPolicyFingerprint, input.fontStyleUnitDependencyFingerprint, input.producerRuntimeRequirementFingerprint].some((value) => typeof value !== "string" || value.length === 0)
  ) throw new TypeError("producer runtime identity facts are invalid")
  const facts = {
    source: "vnext-text-block-transition-producer-runtime-v2" as const,
    contractVersion: 2 as const,
    ...input,
  }
  const identity = freeze({ ...facts, fingerprint: fingerprint(facts) })
  runtimeIdentities.add(identity)
  return identity
}

export function createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
}): VNextTextBlockTransitionEvidenceRequestResultV2 {
  const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
    previousRoot: input.previousRoot,
    change: input.change,
    workPolicy: input.previousRoot.workPolicy,
  })
  if (result.status === "required") {
    requests.set(result.request, freeze({
      previousRoot: input.previousRoot,
      change: input.change,
      request: result.request,
      sourceMaterial: result.sourceMaterial,
      completedCandidateWork: result.completedCandidateWork,
    }))
    return freeze({ status: "required" as const, request: result.request, sourceMaterial: result.sourceMaterial, evaluatorOrProofAuthority: null, completedCandidateWork: result.completedCandidateWork, issues: freeze([]) })
  }
  if (result.status === "not-required") return freeze({ status: "not-required" as const, request: null, sourceMaterial: null, evaluatorOrProofAuthority: null, completedCandidateWork: result.completedCandidateWork, issues: freeze([]) })
  if (result.status === "fallback-required") return freeze({ status: "fallback-required" as const, request: null, sourceMaterial: null, evaluatorOrProofAuthority: result.evaluatorOrProofAuthority, completedCandidateWork: result.completedCandidateWork, issues: freeze([]) })
  return freeze({ status: "blocked" as const, request: null, sourceMaterial: null, evaluatorOrProofAuthority: null, completedCandidateWork: result.completedCandidateWork, issues: result.issues })
}

function tupleFor(input: {
  previousRoot: VNextTextBlockUnifiedLayoutRootV2
  change: VNextTextBlockUnifiedLayoutChangeV1
  request: VNextTextBlockTransitionEvidenceRequestV2
  sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  producerRuntimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2
}): RequestTupleV2 | null {
  const tuple = requests.get(input.request)
  return tuple != null
      && tuple.previousRoot === input.previousRoot
      && tuple.change === input.change
      && tuple.sourceMaterial === input.sourceMaterial
      && runtimeIdentities.has(input.producerRuntimeIdentity)
      && input.producerRuntimeIdentity.fontStyleUnitDependencyFingerprint === input.request.fontStyleUnitDependencyFingerprint
      && input.producerRuntimeIdentity.producerRuntimeRequirementFingerprint === input.request.producerRuntimeRequirementFingerprint
      && input.producerRuntimeIdentity.unitPolicyFingerprint === input.request.layoutUnitPolicyFingerprint
    ? tuple
    : null
}

const CONTRACTS = freeze({
  producerSelectsDirtyRange: false as const,
  producerSelectsLinesOrBands: false as const,
  producerSelectsReconvergenceOrReuse: false as const,
  producerSelectsFallback: false as const,
  stagedEditorApply: false as const,
  mayPublishLayout: false as const,
  productionBinding: false as const,
})

function workIsValid(work: unknown, material: VNextTextBlockTransitionProducerSourceMaterialV2): work is VNextTextBlockTransitionProducerWorkV2 {
  if (!exactKeys(work, ["requestedAtomCount", "requestedClusterCount", "consumedAtomCount", "consumedClusterCount", "unusedCoverageRenderedUtf16Length", "visitedEvidenceNodeCount", "completeNextInputTraversalCount", "completeNextInputComparisonCount"])) return false
  return work.requestedAtomCount === material.producerWorkCeilings.maximumRequestedAtomCount
    && work.requestedClusterCount === material.producerWorkCeilings.maximumRequestedClusterCount
    && Number.isSafeInteger(work.consumedAtomCount) && (work.consumedAtomCount as number) >= 0 && (work.consumedAtomCount as number) <= work.requestedAtomCount
    && Number.isSafeInteger(work.consumedClusterCount) && (work.consumedClusterCount as number) >= 0 && (work.consumedClusterCount as number) <= work.requestedClusterCount
    && Number.isSafeInteger(work.unusedCoverageRenderedUtf16Length) && (work.unusedCoverageRenderedUtf16Length as number) >= 0
    && Number.isSafeInteger(work.visitedEvidenceNodeCount) && (work.visitedEvidenceNodeCount as number) >= 0 && (work.visitedEvidenceNodeCount as number) <= material.producerWorkCeilings.maximumVisitedEvidenceNodeCount
    && work.completeNextInputTraversalCount === 0
    && work.completeNextInputComparisonCount === 0
}

function coveredUtf16Length(ranges: readonly { startRenderedUtf16: number; endRenderedUtf16: number }[]): number {
  const ordered = ranges.filter((range) => range.endRenderedUtf16 > range.startRenderedUtf16).map((range) => ({ ...range })).sort((left, right) => left.startRenderedUtf16 - right.startRenderedUtf16 || left.endRenderedUtf16 - right.endRenderedUtf16)
  let total = 0
  let start = -1
  let end = -1
  for (const range of ordered) {
    if (start < 0) { start = range.startRenderedUtf16; end = range.endRenderedUtf16; continue }
    if (range.startRenderedUtf16 > end) { total += end - start; start = range.startRenderedUtf16; end = range.endRenderedUtf16 }
    else end = Math.max(end, range.endRenderedUtf16)
  }
  return start < 0 ? 0 : total + end - start
}

function completedWork(tuple: RequestTupleV2, work: VNextTextBlockTransitionProducerWorkV2): VNextTextBlockIncrementalCandidateWorkV1 {
  const base = tuple.completedCandidateWork
  return freeze({
    ...base,
    evidence: {
      ...base.evidence,
      consumedAtomCount: work.consumedAtomCount,
      consumedClusterCount: work.consumedClusterCount,
      unusedCoverageRenderedUtf16Length: work.unusedCoverageRenderedUtf16Length,
      visitedEvidenceNodeCount: work.visitedEvidenceNodeCount,
    },
    stageWork: composeVNextTextBlockStageWorkLedgerInternalV1({
      policy: tuple.previousRoot.workPolicy,
      factualCounts: [
        { stage: "evidence", unit: "evidence-request-lookup-nodes", count: base.evidence.visitedRequestLookupNodeCount },
        { stage: "evidence", unit: "evidence-context-atoms", count: base.evidence.materializedContextAtomCount },
        { stage: "evidence", unit: "evidence-response-nodes", count: work.visitedEvidenceNodeCount },
      ],
    }),
  })
}

function blocked(tuple: RequestTupleV2 | null, message: string): VNextTextBlockTransitionEvidenceAcceptanceResultV2 {
  return freeze({
    status: "blocked" as const,
    evidence: null,
    completedCandidateWork: tuple?.completedCandidateWork ?? createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1(),
    issues: freeze([issue(message)]),
  })
}

export function acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly producerRuntimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly response: unknown
}): VNextTextBlockTransitionEvidenceAcceptanceResultV2 {
  const tuple = tupleFor(input)
  if (tuple == null) return blocked(null, "evidence tuple is not the exact registered request")
  const response = input.response
  const responseKeys = ["source", "contractVersion", "requestFingerprint", "sourceMaterialFingerprint", "runtimeIdentity", "nextEvidenceTargetRange", "shapingRuns", "breakOffsets", "shapingBoundaryProofs", "segmentationBoundaryProofs", "sourceTopologyFingerprint", "work", "contracts", "fingerprint"]
  if (!exactKeys(response, responseKeys) || !safeDataTree(response)) return blocked(tuple, "producer response is not exact descriptor-safe data")
  const typed = response as unknown as VNextTextBlockTransitionProducerResponseV2
  if (
    typed.source !== "vnext-text-block-transition-producer-response-v2"
    || typed.contractVersion !== 2
    || typed.requestFingerprint !== input.request.fingerprint
    || typed.sourceMaterialFingerprint !== input.sourceMaterial.fingerprint
    || typed.runtimeIdentity !== input.producerRuntimeIdentity
    || typed.sourceTopologyFingerprint !== input.sourceMaterial.sourceTopologyFingerprint
    || stringifyVNextCanonicalJson(typed.nextEvidenceTargetRange) !== stringifyVNextCanonicalJson(input.request.next.evidenceTargetRange)
    || stringifyVNextCanonicalJson(typed.contracts) !== stringifyVNextCanonicalJson(CONTRACTS)
    || !workIsValid(typed.work, input.sourceMaterial)
  ) return blocked(tuple, "producer response facts do not match the exact request tuple")
  const responseFacts = { ...typed } as Record<string, unknown>
  delete responseFacts.fingerprint
  if (typed.fingerprint !== fingerprint(responseFacts)) return blocked(tuple, "producer response fingerprint mismatch")
  const targetStart = typed.nextEvidenceTargetRange.startRenderedUtf16
  const targetEnd = typed.nextEvidenceTargetRange.endRenderedUtf16
  if (!Array.isArray(typed.shapingRuns) || !Array.isArray(typed.breakOffsets) || !Array.isArray(typed.shapingBoundaryProofs) || !Array.isArray(typed.segmentationBoundaryProofs)) return blocked(tuple, "producer response arrays are invalid")
  const runs = typed.shapingRuns as readonly VNextTextBlockResolvedShapingRunV1[]
  type StyledAtom = Extract<(typeof input.sourceMaterial.next.atoms)[number], { readonly resolvedStyle: unknown }>
  type ResolvedStyle = StyledAtom["resolvedStyle"]
  const coverageStart = input.request.next.coverageRange.startRenderedUtf16
  const coverageText = input.sourceMaterial.next.atoms.map((atom) => atom.renderedText).join("")
  const partitions: Array<{ start: number; end: number; style: ResolvedStyle; atomFingerprints: string[] }> = []
  for (const atom of input.sourceMaterial.next.atoms) {
    if (atom.kind === "hard-break" || atom.kind === "inline-image-boundary") continue
    const start = coverageStart + atom.relativeStartRenderedUtf16
    const end = coverageStart + atom.relativeEndRenderedUtf16
    const previous = partitions.at(-1)
    if (previous != null && previous.end === start && stringifyVNextCanonicalJson(previous.style) === stringifyVNextCanonicalJson(atom.resolvedStyle)) {
      previous.end = end
      previous.atomFingerprints.push(atom.fingerprint)
    } else {
      partitions.push({ start, end, style: atom.resolvedStyle, atomFingerprints: [atom.fingerprint] })
    }
  }
  const expected = partitions.flatMap((partition) => {
    const start = Math.max(partition.start, targetStart)
    const end = Math.min(partition.end, targetEnd)
    return end <= start ? [] : [{ partition, start, end }]
  })
  if (runs.length !== expected.length || typed.shapingBoundaryProofs.length !== expected.length) return blocked(tuple, "shaping partitions do not match exact bounded Source styles")
  let consumedClusterCount = 0
  for (let runIndex = 0; runIndex < runs.length; runIndex += 1) {
    const run = runs[runIndex]!
    const row = expected[runIndex]!
    if (!exactKeys(run, ["shapingRunId", "renderStartOffset", "renderEndOffset", "text", "styleKey", "fontFaceId", "fontSizeLayoutUnit", "textColor", "direction", "baselineShiftLayoutUnit", "features", "clusters"])) return blocked(tuple, "shaping run contains non-canonical fields")
    if (
      run.shapingRunId !== fingerprint({ request: input.request.fingerprint, atoms: row.partition.atomFingerprints, runStart: row.start, runEnd: row.end })
      || run.renderStartOffset !== row.start
      || run.renderEndOffset !== row.end
      || run.text !== coverageText.slice(row.start - coverageStart, row.end - coverageStart)
      || run.styleKey !== row.partition.style.measurementStyleKey
      || run.fontFaceId !== row.partition.style.fontFaceId
      || run.fontSizeLayoutUnit !== row.partition.style.fontSizeLayoutUnit
      || run.textColor !== row.partition.style.textColor
      || run.direction !== "ltr"
      || run.baselineShiftLayoutUnit !== 0
      || !Array.isArray(run.features)
      || run.features.length !== 0
      || !Array.isArray(run.clusters)
      || run.clusters.length === 0
    ) return blocked(tuple, "shaping run facts differ from exact bounded Source material")
    let clusterEnd = run.renderStartOffset
    for (let clusterIndex = 0; clusterIndex < run.clusters.length; clusterIndex += 1) {
      const cluster = run.clusters[clusterIndex]!
      if (!exactKeys(cluster, ["index", "renderStartOffset", "renderEndOffset", "advanceLayoutUnit"]) || cluster.index !== clusterIndex || cluster.renderStartOffset !== clusterEnd || cluster.renderEndOffset <= cluster.renderStartOffset || cluster.renderEndOffset > run.renderEndOffset || !Number.isSafeInteger(cluster.advanceLayoutUnit) || cluster.advanceLayoutUnit < 0) return blocked(tuple, "shaping cluster facts are invalid")
      clusterEnd = cluster.renderEndOffset
    }
    if (clusterEnd !== run.renderEndOffset) return blocked(tuple, "shaping clusters do not cover the exact run")
    consumedClusterCount += run.clusters.length
    const proof = typed.shapingBoundaryProofs[runIndex]!
    if (!exactKeys(proof, ["targetRange", "verificationRange", "leftBoundary", "rightBoundary", "guardGlyphCount", "inspectedGlyphCount", "fingerprint"]) || !exactKeys(proof.targetRange, ["startRenderedUtf16", "endRenderedUtf16"]) || !exactKeys(proof.verificationRange, ["startRenderedUtf16", "endRenderedUtf16"])) return blocked(tuple, "shaping boundary proof is not canonical")
    const expectedVerification = {
      startRenderedUtf16: Math.max(row.partition.start, input.request.next.shapeVerificationRange.startRenderedUtf16),
      endRenderedUtf16: Math.min(row.partition.end, input.request.next.shapeVerificationRange.endRenderedUtf16),
    }
    const expectedLeft = row.start === row.partition.start || row.start === coverageStart ? "exact-style-or-block-start" : "safe-first-target-glyph"
    const expectedRight = row.end === row.partition.end || row.end === coverageStart + coverageText.length ? "exact-style-or-block-end" : "safe-first-right-guard-glyph"
    const proofFacts = { ...proof } as Record<string, unknown>
    delete proofFacts.fingerprint
    if (stringifyVNextCanonicalJson(proof.targetRange) !== stringifyVNextCanonicalJson({ startRenderedUtf16: row.start, endRenderedUtf16: row.end }) || stringifyVNextCanonicalJson(proof.verificationRange) !== stringifyVNextCanonicalJson(expectedVerification) || proof.leftBoundary !== expectedLeft || proof.rightBoundary !== expectedRight || typeof proof.guardGlyphCount !== "number" || !Number.isSafeInteger(proof.guardGlyphCount) || proof.guardGlyphCount < 0 || typeof proof.inspectedGlyphCount !== "number" || !Number.isSafeInteger(proof.inspectedGlyphCount) || proof.inspectedGlyphCount < run.clusters.length + proof.guardGlyphCount || (expectedRight === "safe-first-right-guard-glyph" && proof.guardGlyphCount < 1) || proof.fingerprint !== fingerprint(proofFacts)) return blocked(tuple, "shaping boundary proof differs from the exact partition")
  }
  if (typed.segmentationBoundaryProofs.length !== input.request.nextSegmentationContextRanges.length) return blocked(tuple, "segmentation proofs do not cover the exact requested contexts")
  let stableTargetBreaks: readonly number[] | null = null
  let inspectedSegmentationOffsetCount = 0
  for (let proofIndex = 0; proofIndex < typed.segmentationBoundaryProofs.length; proofIndex += 1) {
    const proof = typed.segmentationBoundaryProofs[proofIndex]!
    const expectedContext = input.request.nextSegmentationContextRanges[proofIndex]!
    if (!exactKeys(proof, ["contextRange", "contextBreakCount", "targetBreakOffsets", "inspectedOffsetCount", "fingerprint"]) || !exactKeys(proof.contextRange, ["startRenderedUtf16", "endRenderedUtf16"]) || !Array.isArray(proof.targetBreakOffsets)) return blocked(tuple, "segmentation boundary proof is not canonical")
    const contextBreakCount = proof.contextBreakCount
    const targetBreakOffsets = proof.targetBreakOffsets
    const inspectedOffsetCount = proof.inspectedOffsetCount
    const proofFacts = { ...proof } as Record<string, unknown>
    delete proofFacts.fingerprint
    if (
      stringifyVNextCanonicalJson(proof.contextRange) !== stringifyVNextCanonicalJson(expectedContext)
      || typeof contextBreakCount !== "number"
      || !Number.isSafeInteger(contextBreakCount)
      || contextBreakCount < targetBreakOffsets.length
      || targetBreakOffsets.some((offset, index) => !Number.isSafeInteger(offset) || offset < targetStart || offset > targetEnd || (index > 0 && offset <= targetBreakOffsets[index - 1]!))
      || typeof inspectedOffsetCount !== "number"
      || inspectedOffsetCount !== 2 * contextBreakCount + 2 * targetBreakOffsets.length
      || proof.fingerprint !== fingerprint(proofFacts)
    ) return blocked(tuple, "segmentation boundary proof differs from the exact bounded attempt")
    if (stableTargetBreaks != null && stringifyVNextCanonicalJson(proof.targetBreakOffsets) !== stringifyVNextCanonicalJson(stableTargetBreaks)) return blocked(tuple, "segmentation proofs do not establish stable target breaks")
    stableTargetBreaks = targetBreakOffsets
    inspectedSegmentationOffsetCount += inspectedOffsetCount
  }
  if (typed.segmentationBoundaryProofs.length < input.request.requiredStableSegmentationExpansionCount || stableTargetBreaks == null) return blocked(tuple, "segmentation proofs do not reach the required stable expansion count")
  if (typed.breakOffsets.some((offset, index) => !Number.isSafeInteger(offset) || offset < targetStart || offset > targetEnd || (index > 0 && offset <= typed.breakOffsets[index - 1]!))) return blocked(tuple, "break offsets are invalid")
  const hardBreaks = input.sourceMaterial.next.atoms
    .filter((atom) => atom.kind === "hard-break")
    .map((atom) => coverageStart + atom.relativeEndRenderedUtf16)
    .filter((offset) => offset >= targetStart && offset <= targetEnd)
  const expectedBreakOffsets = [...new Set([...stableTargetBreaks, ...hardBreaks])].sort((left, right) => left - right)
  if (stringifyVNextCanonicalJson(typed.breakOffsets) !== stringifyVNextCanonicalJson(expectedBreakOffsets)) return blocked(tuple, "break offsets differ from exact stable segmentation facts")
  const exactUnusedCoverage = input.request.next.coverageRange.endRenderedUtf16 - input.request.next.coverageRange.startRenderedUtf16 - coveredUtf16Length([
    ...typed.shapingBoundaryProofs.map((proof) => proof.verificationRange),
    ...input.request.nextSegmentationContextRanges,
  ])
  const exactVisitedEvidenceNodeCount = input.sourceMaterial.next.atoms.length
    + runs.length
    + input.request.nextSegmentationContextRanges.length
    + typed.shapingBoundaryProofs.reduce((sum, proof) => sum + proof.inspectedGlyphCount, 0)
    + inspectedSegmentationOffsetCount
    + typed.breakOffsets.length
  if (typed.work.consumedAtomCount !== input.sourceMaterial.next.atoms.length || typed.work.consumedClusterCount !== consumedClusterCount || typed.work.unusedCoverageRenderedUtf16Length !== exactUnusedCoverage || typed.work.visitedEvidenceNodeCount !== exactVisitedEvidenceNodeCount) return blocked(tuple, "producer work does not match exact response/material facts")
  const evidenceFacts = {
    source: "vnext-text-block-transition-evidence-v2" as const,
    contractVersion: 2 as const,
    requestFingerprint: input.request.fingerprint,
    sourceMaterialFingerprint: input.sourceMaterial.fingerprint,
    previousRootFingerprint: input.previousRoot.fingerprint,
    changeFingerprint: input.request.changeFingerprint,
    runtimeIdentityFingerprint: input.producerRuntimeIdentity.fingerprint,
    nextEvidenceTargetRange: typed.nextEvidenceTargetRange,
    shapingRuns: typed.shapingRuns,
    breakOffsets: typed.breakOffsets,
    shapingBoundaryProofs: typed.shapingBoundaryProofs,
    segmentationBoundaryProofs: typed.segmentationBoundaryProofs,
    sourceTopologyFingerprint: typed.sourceTopologyFingerprint,
    work: typed.work,
  }
  const evidence: VNextTextBlockTransitionEvidenceV2 = freeze({ ...evidenceFacts, fingerprint: fingerprint(evidenceFacts) })
  evidenceRecords.set(evidence, tuple)
  return freeze({ status: "accepted" as const, evidence, completedCandidateWork: completedWork(tuple, typed.work), issues: freeze([]) })
}

export function acceptVNextTextBlockUnifiedLayoutProducerFailureV2(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly producerRuntimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly failure: unknown
}): VNextTextBlockTransitionProducerFailureAcceptanceResultV2 {
  const tuple = tupleFor(input)
  const failure = input.failure
  const blockedFailure = (message: string): VNextTextBlockTransitionProducerFailureAcceptanceResultV2 => freeze({ status: "blocked" as const, evaluatorOrProofAuthority: null, completedCandidateWork: tuple?.completedCandidateWork ?? createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1(), issues: freeze([issue(message)]) })
  if (tuple == null) return blockedFailure("producer failure tuple is not registered")
  if (!exactKeys(failure, ["source", "contractVersion", "requestFingerprint", "sourceMaterialFingerprint", "runtimeIdentity", "code", "completedWork", "contracts", "fingerprint"]) || !safeDataTree(failure)) return blockedFailure("producer failure is not exact descriptor-safe data")
  const typed = failure as unknown as VNextTextBlockTransitionProducerFailureV2
  const codes = ["invalid-request-scoped-material", "pinned-font-unavailable", "pinned-font-mismatch", "unsafe-shaping-boundary", "segmentation-not-stable", "missing-glyph", "unsafe-runtime-arithmetic", "work-ceiling-before-visit"]
  const facts = { ...typed } as Record<string, unknown>
  delete facts.fingerprint
  if (typed.source !== "vnext-text-block-transition-producer-failure-v2" || typed.contractVersion !== 2 || typed.requestFingerprint !== input.request.fingerprint || typed.sourceMaterialFingerprint !== input.sourceMaterial.fingerprint || typed.runtimeIdentity !== input.producerRuntimeIdentity || !codes.includes(typed.code) || !workIsValid(typed.completedWork, input.sourceMaterial) || stringifyVNextCanonicalJson(typed.contracts) !== stringifyVNextCanonicalJson(CONTRACTS) || typed.fingerprint !== fingerprint(facts)) return blockedFailure("producer failure facts do not match the exact request tuple")
  if (typed.code === "invalid-request-scoped-material") return blockedFailure("exact registered material cannot factually produce invalid-material fallback authority")
  if (typed.code === "work-ceiling-before-visit") {
    const exhausted = typed.completedWork.visitedEvidenceNodeCount === input.sourceMaterial.producerWorkCeilings.maximumVisitedEvidenceNodeCount
      || typed.completedWork.consumedClusterCount === input.sourceMaterial.producerWorkCeilings.maximumRequestedClusterCount
    if (!exhausted) return blockedFailure("work-ceiling failure did not exhaust an exact declared producer ceiling")
  } else if (typed.completedWork.consumedAtomCount !== input.sourceMaterial.next.atoms.length || typed.completedWork.visitedEvidenceNodeCount < input.sourceMaterial.next.atoms.length) {
    return blockedFailure("factual producer failure work does not reach the failure stage")
  }
  const authority = freeze({})
  failureAuthorities.set(authority, tuple)
  return freeze({ status: "fallback-required" as const, evaluatorOrProofAuthority: authority, completedCandidateWork: completedWork(tuple, typed.completedWork), issues: freeze([]) })
}
