import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type {
  VNextTextBlockMultiRunIncrementalEditV1,
  VNextTextBlockMultiRunIncrementalSnapshotV1,
  VNextTextBlockMultiRunIncrementalWindowProofV1,
} from "./textBlockMultiRunIncrementalContractV1.js"
import { inspectVNextTextBlockMultiRunIncrementalSnapshotV1 } from
  "./textBlockMultiRunIncrementalSnapshotV1.js"
import type { VNextTextBlockMultiRunLayoutRequestV1 } from
  "./textBlockMultiRunLayoutContractV1.js"
import {
  createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1,
  VNEXT_TEXT_BLOCK_MULTI_RUN_SEMANTIC_RANGE_PREFIX_START_V1,
} from "./textBlockMultiRunSemanticV1.js"
import type { VNextTextBlockPersistentFlowUpdateV1 } from "./textBlockPersistentFlowContractV1.js"
import { inspectVNextTextBlockPersistentFlowUpdateV1 } from "./textBlockPersistentFlowUpdateV1.js"

export const VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SEMANTIC_CHECKPOINT_SOURCE =
  "vnext-text-block-multi-run-incremental-semantic-checkpoint-v1" as const
export const VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SEMANTIC_CHECKPOINT_VERSION = 1 as const

export type VNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1 =
  | {
      source: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SEMANTIC_CHECKPOINT_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SEMANTIC_CHECKPOINT_VERSION
      status: "checkpoint-accepted"
      snapshotFingerprint: string
      layoutId: string
      textBlockId: string
      nextInstanceRevision: number
      edit: VNextTextBlockMultiRunIncrementalEditV1
      window: VNextTextBlockMultiRunIncrementalWindowProofV1
      checkpoints: {
        previousPrefixFingerprint: string
        nextPrefixFingerprint: string
        previousSuffixFingerprint: string
        nextSuffixFingerprint: string
        compositionalFingerprint: string
      }
      work: {
        retainedCheckpointLookupCount: 2
        nextSemanticLineFingerprintCount: number
        completePreviousSemanticPassCount: 0
        completeNextSemanticPassCount: 0
        boundedNextSemanticPassCount: 1
        completeSemanticRangeHashCount: 0
        persistentFlowUpdateAccepted: true
        reusedPersistentNodeCount: number
        createdPersistentNodeCount: number
      }
      contracts: {
        coreOwnedCompositionalCheckpoints: true
        processLocalRequestBinding: true
        persistentFlowStructuralSharing: true
        boundedNextSemanticCheckpoints: true
        retainedPreviousRangesAreNotRehashed: true
        adapterSemanticRangeHashing: false
        acceptanceSemanticRangeHashing: false
        mayPublishLayout: false
      }
      fingerprint: string
    }
  | {
      source: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SEMANTIC_CHECKPOINT_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SEMANTIC_CHECKPOINT_VERSION
      status: "fallback-required"
      code:
        | "snapshot-provenance-mismatch"
        | "persistent-flow-update-mismatch"
        | "invalid-window-proof"
        | "semantic-checkpoint-derivation-failed"
        | "prefix-semantic-mismatch"
        | "suffix-semantic-mismatch"
      message: string
      fingerprint: string
    }

type AcceptedProof = Extract<
  VNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1,
  { status: "checkpoint-accepted" }
>

const processLocalProofBindings = new WeakMap<object, {
  snapshot: VNextTextBlockMultiRunIncrementalSnapshotV1
  nextRequest: VNextTextBlockMultiRunLayoutRequestV1
  persistentFlowUpdate: VNextTextBlockPersistentFlowUpdateV1
}>()

function compact(value: unknown): string {
  return createVNextCompactFingerprint(JSON.stringify(value))
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  Object.values(value).forEach((item) => deepFreeze(item))
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function createVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1(input: {
  snapshot: VNextTextBlockMultiRunIncrementalSnapshotV1
  nextRequest: VNextTextBlockMultiRunLayoutRequestV1
  edit: VNextTextBlockMultiRunIncrementalEditV1
  window: VNextTextBlockMultiRunIncrementalWindowProofV1
  persistentFlowUpdate: VNextTextBlockPersistentFlowUpdateV1
}): VNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1 {
  const fallback = (
    code: Extract<
      VNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1,
      { status: "fallback-required" }
    >["code"],
    message: string,
  ): VNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1 => {
    const facts = {
      source: VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SEMANTIC_CHECKPOINT_SOURCE,
      contractVersion: VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SEMANTIC_CHECKPOINT_VERSION,
      status: "fallback-required" as const,
      code,
      message,
    }
    return { ...facts, fingerprint: compact(facts) }
  }

  const inspection = inspectVNextTextBlockMultiRunIncrementalSnapshotV1(input.snapshot)
  if (inspection.status !== "valid") return fallback("snapshot-provenance-mismatch", inspection.message)
  const persistentFlowUpdateInspection = inspectVNextTextBlockPersistentFlowUpdateV1({
    update: input.persistentFlowUpdate,
    previousTree: input.snapshot.persistentFlowTree,
    previousRequest: input.snapshot.request,
    nextRequest: input.nextRequest,
    edit: input.edit,
    window: input.window,
  })
  if (persistentFlowUpdateInspection.status !== "valid") return fallback(
    "persistent-flow-update-mismatch",
    persistentFlowUpdateInspection.message,
  )
  const previousLines = input.snapshot.request.lines
  const nextLines = input.nextRequest.lines
  const window = input.window
  if (
    window.previousRestartLineIndex < 0
    || window.nextRestartLineIndex < 0
    || window.previousReconvergenceLineIndex < window.previousRestartLineIndex
    || window.nextReconvergenceLineIndex < window.nextRestartLineIndex
    || window.previousReconvergenceLineIndex >= previousLines.length
    || window.nextReconvergenceLineIndex >= nextLines.length
  ) return fallback("invalid-window-proof", "semantic checkpoint indices are outside the retained or next lines")

  const boundedEnd = Math.min(
    input.nextRequest.lines.length,
    input.window.nextReconvergenceLineIndex + input.window.stableLineCount,
  )
  const bounded = createVNextTextBlockMultiRunSemanticRangeWindowCheckpointsV1({
    measurement: input.nextRequest.measurement,
    shapingRuns: input.nextRequest.shapingRuns,
    lines: input.nextRequest.lines,
    lineStartIndex: input.window.nextRestartLineIndex,
    lineEndIndexExclusive: boundedEnd,
  })
  if (bounded.status !== "accepted") return fallback(
    "semantic-checkpoint-derivation-failed",
    bounded.message,
  )

  const affectedCount = input.window.nextReconvergenceLineIndex - input.window.nextRestartLineIndex
  const stableFingerprints = bounded.lineFingerprints.slice(affectedCount)
  const previousStableFingerprints = input.snapshot.semanticRangeLineFingerprints.slice(
    input.window.previousReconvergenceLineIndex,
    input.window.previousReconvergenceLineIndex + stableFingerprints.length,
  )
  if (!sameJson(stableFingerprints, previousStableFingerprints)) return fallback(
    "suffix-semantic-mismatch",
    "bounded stable lines do not prove retained suffix semantics",
  )

  const previousPrefixFingerprint = window.previousRestartLineIndex === 0
    ? VNEXT_TEXT_BLOCK_MULTI_RUN_SEMANTIC_RANGE_PREFIX_START_V1
    : input.snapshot.prefixSemanticRangeFingerprints[window.previousRestartLineIndex - 1]
  const nextPrefixFingerprint = previousPrefixFingerprint
  if (
    previousPrefixFingerprint == null
  ) return fallback("prefix-semantic-mismatch", "the compositional semantic prefix changed before restart")

  const previousSuffixFingerprint = input.snapshot.suffixSemanticRangeFingerprints[
    window.previousReconvergenceLineIndex
  ]
  const nextSuffixFingerprint = previousSuffixFingerprint
  if (
    previousSuffixFingerprint == null
    || window.previousSuffixSemanticRangeFingerprint !== previousSuffixFingerprint
    || window.nextSuffixSemanticRangeFingerprint !== nextSuffixFingerprint
  ) return fallback("suffix-semantic-mismatch", "the compositional shifted suffix is not semantically reusable")
  const compositionalFingerprint = compact({
    previousPrefixFingerprint,
    boundedAffectedLineFingerprints: bounded.lineFingerprints.slice(0, affectedCount),
    previousSuffixFingerprint,
  })

  const facts = {
    source: VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SEMANTIC_CHECKPOINT_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SEMANTIC_CHECKPOINT_VERSION,
    status: "checkpoint-accepted" as const,
    snapshotFingerprint: input.snapshot.fingerprint,
    layoutId: input.nextRequest.layoutId,
    textBlockId: input.nextRequest.measurement.textBlockId,
    nextInstanceRevision: input.nextRequest.measurement.instanceRevision,
    edit: { ...input.edit },
    window: { ...input.window },
    checkpoints: {
      previousPrefixFingerprint,
      nextPrefixFingerprint,
      previousSuffixFingerprint,
      nextSuffixFingerprint,
      compositionalFingerprint,
    },
    work: {
      retainedCheckpointLookupCount: 2 as const,
      nextSemanticLineFingerprintCount: bounded.lineFingerprints.length,
      completePreviousSemanticPassCount: 0 as const,
      completeNextSemanticPassCount: 0 as const,
      boundedNextSemanticPassCount: 1 as const,
      completeSemanticRangeHashCount: 0 as const,
      persistentFlowUpdateAccepted: true as const,
      reusedPersistentNodeCount: input.persistentFlowUpdate.work.reusedNodeCount,
      createdPersistentNodeCount: input.persistentFlowUpdate.work.createdNodeCount,
    },
    contracts: {
      coreOwnedCompositionalCheckpoints: true as const,
      processLocalRequestBinding: true as const,
      persistentFlowStructuralSharing: true as const,
      boundedNextSemanticCheckpoints: true as const,
      retainedPreviousRangesAreNotRehashed: true as const,
      adapterSemanticRangeHashing: false as const,
      acceptanceSemanticRangeHashing: false as const,
      mayPublishLayout: false as const,
    },
  }
  deepFreeze(input.nextRequest)
  const proof = deepFreeze({ ...facts, fingerprint: compact(facts) })
  processLocalProofBindings.set(proof, {
    snapshot: input.snapshot,
    nextRequest: input.nextRequest,
    persistentFlowUpdate: input.persistentFlowUpdate,
  })
  return proof
}

export function inspectVNextTextBlockMultiRunIncrementalSemanticCheckpointProofV1(input: {
  proof: AcceptedProof
  snapshot: VNextTextBlockMultiRunIncrementalSnapshotV1
  nextRequest: VNextTextBlockMultiRunLayoutRequestV1
  edit: VNextTextBlockMultiRunIncrementalEditV1
  window: VNextTextBlockMultiRunIncrementalWindowProofV1
}): { status: "valid" } | { status: "invalid"; message: string } {
  const binding = processLocalProofBindings.get(input.proof)
  if (
    binding == null
    || binding.snapshot !== input.snapshot
    || binding.nextRequest !== input.nextRequest
  ) return { status: "invalid", message: "semantic checkpoint proof is not bound to this snapshot and request" }
  const persistentFlowUpdateInspection = inspectVNextTextBlockPersistentFlowUpdateV1({
    update: binding.persistentFlowUpdate,
    previousTree: input.snapshot.persistentFlowTree,
    previousRequest: input.snapshot.request,
    nextRequest: input.nextRequest,
    edit: input.edit,
    window: input.window,
  })
  if (persistentFlowUpdateInspection.status !== "valid") return {
    status: "invalid",
    message: "semantic checkpoint proof is not bound to the exact registered persistent flow update",
  }
  if (
    input.proof.snapshotFingerprint !== input.snapshot.fingerprint
    || input.proof.layoutId !== input.nextRequest.layoutId
    || input.proof.textBlockId !== input.nextRequest.measurement.textBlockId
    || input.proof.nextInstanceRevision !== input.nextRequest.measurement.instanceRevision
    || !sameJson(input.proof.edit, input.edit)
    || !sameJson(input.proof.window, input.window)
  ) return { status: "invalid", message: "semantic checkpoint proof facts do not match incremental acceptance" }
  const { fingerprint, ...facts } = input.proof
  return fingerprint === compact(facts)
    ? { status: "valid" }
    : { status: "invalid", message: "semantic checkpoint proof fingerprint is invalid" }
}
