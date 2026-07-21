import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { acceptVNextTextBlockMultiRunLayoutV1 } from "./textBlockMultiRunLayoutV1.js"
import {
  VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SNAPSHOT_SOURCE,
  VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_VERSION,
} from "./textBlockMultiRunIncrementalContractV1.js"
import type {
  VNextTextBlockAcceptedMultiRunLayoutV1,
  VNextTextBlockMultiRunIncrementalSnapshotV1,
} from "./textBlockMultiRunIncrementalContractV1.js"
import type { VNextTextBlockMultiRunLayoutRequestV1 } from "./textBlockMultiRunLayoutContractV1.js"
import { createVNextTextBlockMultiRunSemanticLineFingerprintV1 } from "./textBlockMultiRunSemanticV1.js"

const processLocalSnapshots = new WeakSet<object>()

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object" || Object.isFrozen(value)) return value
  Object.values(value).forEach((item) => deepFreeze(item))
  return Object.freeze(value)
}

function semanticChains(lines: VNextTextBlockAcceptedMultiRunLayoutV1["lines"]): {
  semanticLineFingerprints: string[]
  prefixSemanticFingerprints: string[]
  suffixSemanticFingerprints: string[]
} {
  const semanticLineFingerprints = lines.map(createVNextTextBlockMultiRunSemanticLineFingerprintV1)
  const prefixSemanticFingerprints: string[] = []
  let prefix = createVNextCompactFingerprint("text-block-multi-run-prefix-semantic:start:v1")
  semanticLineFingerprints.forEach((semanticLineFingerprint) => {
    prefix = createVNextCompactFingerprint(JSON.stringify({ prefix, semanticLineFingerprint }))
    prefixSemanticFingerprints.push(prefix)
  })
  const suffixSemanticFingerprints = Array.from<string>({ length: lines.length })
  let suffix = createVNextCompactFingerprint("incremental-line-suffix:end:v1")
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    suffix = createVNextCompactFingerprint(JSON.stringify({
      semanticLineFingerprint: semanticLineFingerprints[index],
      nextSuffixFingerprint: suffix,
    }))
    suffixSemanticFingerprints[index] = suffix
  }
  return { semanticLineFingerprints, prefixSemanticFingerprints, suffixSemanticFingerprints }
}

export function createVNextTextBlockMultiRunIncrementalSnapshotV1(input: {
  request: VNextTextBlockMultiRunLayoutRequestV1
  acceptedLayout: VNextTextBlockAcceptedMultiRunLayoutV1
}): VNextTextBlockMultiRunIncrementalSnapshotV1 {
  const reproduced = acceptVNextTextBlockMultiRunLayoutV1(input.request)
  if (reproduced.status !== "accepted" || !sameJson(reproduced, input.acceptedLayout)) {
    throw new Error("incremental snapshot requires the exact accepted complete Core layout")
  }
  const request = clone(input.request)
  const layout = clone(input.acceptedLayout)
  const chains = semanticChains(layout.lines)
  const facts = {
    source: VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_SNAPSHOT_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_MULTI_RUN_INCREMENTAL_VERSION,
    request,
    layout,
    ...chains,
    contracts: {
      acceptedCompleteLayoutProvenance: true,
      processLocalImmutableSnapshot: true,
      semanticIdentitySeparateFromPhysicalIds: true,
      perEditFullLayoutAcceptance: false,
      mayPublishLayout: false,
    },
  } as const
  const snapshot = deepFreeze({
    ...facts,
    fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
  })
  processLocalSnapshots.add(snapshot)
  return snapshot
}

export function inspectVNextTextBlockMultiRunIncrementalSnapshotV1(
  snapshot: VNextTextBlockMultiRunIncrementalSnapshotV1,
): { status: "valid"; fingerprint: string } | { status: "invalid"; message: string } {
  if (!processLocalSnapshots.has(snapshot)) return {
    status: "invalid",
    message: "snapshot is not the immutable process-local object created by Core",
  }
  return { status: "valid", fingerprint: snapshot.fingerprint }
}
