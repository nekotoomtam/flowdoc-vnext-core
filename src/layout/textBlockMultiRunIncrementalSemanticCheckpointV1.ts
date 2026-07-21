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
  createVNextTextBlockMultiRunSemanticRangeLineCheckpointsV1,
  VNEXT_TEXT_BLOCK_MULTI_RUN_SEMANTIC_RANGE_PREFIX_START_V1,
} from "./textBlockMultiRunSemanticV1.js"

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
      }
      work: {
        retainedCheckpointLookupCount: 2
        nextSemanticLineFingerprintCount: number
        completePreviousSemanticPassCount: 0
        completeNextSemanticPassCount: 1
        completeSemanticRangeHashCount: 0
      }
      contracts: {
        coreOwnedCompositionalCheckpoints: true
        processLocalRequestBinding: true
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

  const nextChains = createVNextTextBlockMultiRunSemanticRangeLineCheckpointsV1({
    measurement: input.nextRequest.measurement,
    shapingRuns: input.nextRequest.shapingRuns,
    lines: input.nextRequest.lines,
  })
  if (nextChains == null) return fallback(
    "semantic-checkpoint-derivation-failed",
    "the next request cannot produce complete line-aligned semantic checkpoints",
  )

  const previousPrefixFingerprint = window.previousRestartLineIndex === 0
    ? VNEXT_TEXT_BLOCK_MULTI_RUN_SEMANTIC_RANGE_PREFIX_START_V1
    : input.snapshot.prefixSemanticRangeFingerprints[window.previousRestartLineIndex - 1]
  const nextPrefixFingerprint = window.nextRestartLineIndex === 0
    ? VNEXT_TEXT_BLOCK_MULTI_RUN_SEMANTIC_RANGE_PREFIX_START_V1
    : nextChains.prefixFingerprints[window.nextRestartLineIndex - 1]
  if (
    previousPrefixFingerprint == null
    || nextPrefixFingerprint == null
    || previousPrefixFingerprint !== nextPrefixFingerprint
  ) return fallback("prefix-semantic-mismatch", "the compositional semantic prefix changed before restart")

  const previousSuffixFingerprint = input.snapshot.suffixSemanticRangeFingerprints[
    window.previousReconvergenceLineIndex
  ]
  const nextSuffixFingerprint = nextChains.suffixFingerprints[window.nextReconvergenceLineIndex]
  if (
    previousSuffixFingerprint == null
    || nextSuffixFingerprint == null
    || previousSuffixFingerprint !== nextSuffixFingerprint
    || window.previousSuffixSemanticRangeFingerprint !== previousSuffixFingerprint
    || window.nextSuffixSemanticRangeFingerprint !== nextSuffixFingerprint
  ) return fallback("suffix-semantic-mismatch", "the compositional shifted suffix is not semantically reusable")

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
    },
    work: {
      retainedCheckpointLookupCount: 2 as const,
      nextSemanticLineFingerprintCount: nextChains.lineFingerprints.length,
      completePreviousSemanticPassCount: 0 as const,
      completeNextSemanticPassCount: 1 as const,
      completeSemanticRangeHashCount: 0 as const,
    },
    contracts: {
      coreOwnedCompositionalCheckpoints: true as const,
      processLocalRequestBinding: true as const,
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
