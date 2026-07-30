import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  buildVNextTextBlockSpatialIndexRootKernelV1,
  queryVNextTextBlockSpatialIndexKernelV1,
} from "./textBlockSpatialIndexKernelV1.js"
import {
  materializeVNextTextBlockSpatialIndexNodeV1,
  parseSpatialEntriesV1,
} from "./textBlockSpatialIndexInternalsV1.js"
import type {
  VNextTextBlockSpatialIndexSummaryV1,
  VNextTextBlockSyntheticPositionedObjectInputV1,
} from "./textBlockSpatialIndexContractV1.js"
import {
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_SPATIAL_STATE_V1_SOURCE,
  VNEXT_TEXT_BLOCK_UNIFIED_SPATIAL_STATE_V1_VERSION,
  type VNextTextBlockUnifiedSpatialStateBuildResultV1,
  type VNextTextBlockUnifiedSpatialStateInspectionV1,
  type VNextTextBlockUnifiedSpatialStateIssueCodeV1,
  type VNextTextBlockUnifiedSpatialStateIssueV1,
  type VNextTextBlockUnifiedSpatialStateQueryResultV1,
  type VNextTextBlockUnifiedSpatialStateV1,
} from "./textBlockUnifiedSpatialStateContractV1.js"
import {
  authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2,
} from "./textBlockUnifiedLayoutRootAuthorityInternalsV2.js"

const EMPTY_SUMMARY: VNextTextBlockSpatialIndexSummaryV1 = Object.freeze({
  entryCount: 0,
  nodeCount: 0,
  maximumBottomLayoutUnit: 0,
  flowAffectingEntryCount: 0,
  barrierEntryCount: 0,
  overlayEntryCount: 0,
})

const preparedStates = new WeakMap<
VNextTextBlockUnifiedSpatialStateV1,
{
  readonly fingerprint: string
  readonly canonicalFacts: string
}
>()
const spatialStatesBySourceState = new WeakMap<
VNextTextBlockUnifiedLayoutSourceStateV1,
WeakSet<VNextTextBlockUnifiedSpatialStateV1>
>()
const registeredRootGraphStates = new WeakSet<
VNextTextBlockUnifiedSpatialStateV1
>()

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) {
      deepFreeze(descriptor.value)
    }
  }
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

function deeplyFrozen(value: unknown): boolean {
  if (value == null || typeof value !== "object") return true
  if (!Object.isFrozen(value)) return false
  try {
    return Reflect.ownKeys(value).every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      return descriptor != null
        && Object.hasOwn(descriptor, "value")
        && deeplyFrozen(descriptor.value)
    })
  } catch {
    return false
  }
}

function exactRecord(
  value: unknown,
  keys: readonly string[],
): Record<string, unknown> | null {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return null
    }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(value).length !== 0) return null
    const actual = Reflect.ownKeys(value)
    if (
      actual.length !== keys.length
      || actual.some((key) => typeof key !== "string" || !keys.includes(key))
    ) return null
    const output = Object.create(null) as Record<string, unknown>
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      output[key] = descriptor.value
    }
    return output
  } catch {
    return null
  }
}

function snapshotEntries(
  value: unknown,
): readonly VNextTextBlockSyntheticPositionedObjectInputV1[] | null {
  try {
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
      return null
    }
    const length = Object.getOwnPropertyDescriptor(value, "length")
    if (
      length == null
      || !Object.hasOwn(length, "value")
      || !Number.isSafeInteger(length.value)
      || length.value < 0
      || Reflect.ownKeys(value).length !== length.value + 1
    ) return null
    const entries: VNextTextBlockSyntheticPositionedObjectInputV1[] = []
    for (let index = 0; index < length.value; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      const entry = exactRecord(descriptor.value, [
        "objectId",
        "geometryOwnerFingerprint",
        "xLayoutUnit",
        "yLayoutUnit",
        "widthLayoutUnit",
        "heightLayoutUnit",
        "clearance",
        "wrapPolicy",
      ])
      const clearance = entry == null
        ? null
        : exactRecord(entry.clearance, [
            "topLayoutUnit",
            "rightLayoutUnit",
            "bottomLayoutUnit",
            "leftLayoutUnit",
          ])
      if (entry == null || clearance == null) return null
      entries.push({
        ...entry,
        clearance,
      } as unknown as VNextTextBlockSyntheticPositionedObjectInputV1)
    }
    return entries
  } catch {
    return null
  }
}

function exactInput(value: unknown): {
  readonly sourceState: unknown
  readonly entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
} | null {
  const record = exactRecord(value, ["sourceState", "entries"])
  if (record == null) return null
  const entries = snapshotEntries(record.entries)
  return entries == null
    ? null
    : { sourceState: record.sourceState, entries }
}

function issue(
  code: VNextTextBlockUnifiedSpatialStateIssueCodeV1,
  path: string,
  message: string,
  objectId?: string,
): VNextTextBlockUnifiedSpatialStateIssueV1 {
  return {
    code,
    severity: "error",
    path,
    message,
    ...(objectId == null ? {} : { objectId }),
  }
}

function blocked(
  issues: readonly VNextTextBlockUnifiedSpatialStateIssueV1[],
): VNextTextBlockUnifiedSpatialStateBuildResultV1 {
  return Object.freeze({
    status: "blocked",
    spatialState: null,
    work: null,
    registeredAuthority: false,
    issues: Object.freeze([...issues]),
  })
}

function canonicalFacts(
  state: VNextTextBlockUnifiedSpatialStateV1,
): unknown {
  return {
    source: state.source,
    contractVersion: state.contractVersion,
    documentId: state.documentId,
    sectionId: state.sectionId,
    textBlockId: state.textBlockId,
    instanceRevision: state.instanceRevision,
    contentLeftLayoutUnit: state.contentLeftLayoutUnit,
    contentRightLayoutUnit: state.contentRightLayoutUnit,
    layoutUnitPolicyFingerprint: state.layoutUnitPolicyFingerprint,
    contentContextFingerprint: state.contentContextFingerprint,
    geometryOwnerFactsFingerprint: state.geometryOwnerFactsFingerprint,
    entrySetFingerprint: state.entrySetFingerprint,
    entryRootFingerprint: state.entryRootFingerprint,
    summary: state.summary,
    work: state.work,
    contracts: state.contracts,
    mayPublishLayout: state.mayPublishLayout,
    productionBinding: state.productionBinding,
  }
}

export function createVNextTextBlockUnifiedSpatialStateCompleteInternalV1(
  input: {
    readonly sourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly entries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
  },
): VNextTextBlockUnifiedSpatialStateBuildResultV1
export function createVNextTextBlockUnifiedSpatialStateCompleteInternalV1(
  input: unknown,
): VNextTextBlockUnifiedSpatialStateBuildResultV1
export function createVNextTextBlockUnifiedSpatialStateCompleteInternalV1(
  input: unknown,
): VNextTextBlockUnifiedSpatialStateBuildResultV1 {
  const envelope = exactInput(input)
  if (envelope == null) {
    return blocked([
      issue(
        "invalid-input",
        "input",
        "spatial state requires an exact accessor-free sourceState/entries envelope",
      ),
    ])
  }
  const sourceInspection =
    inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      envelope.sourceState,
    )
  if (sourceInspection.status !== "prepared-unregistered") {
    return blocked([
      issue(
        "source-state-authority-mismatch",
        "sourceState",
        sourceInspection.message,
      ),
    ])
  }
  const sourceState =
    envelope.sourceState as VNextTextBlockUnifiedLayoutSourceStateV1
  const parsed = parseSpatialEntriesV1({
    values: envelope.entries,
    contentRightLayoutUnit:
      sourceState.producerRequirements.availableWidthLayoutUnit,
  })
  if (parsed.issues.length > 0) {
    return blocked(parsed.issues.map((item) => issue(
      item.code,
      item.path,
      item.message,
      item.objectId,
    )))
  }

  try {
    const root = buildVNextTextBlockSpatialIndexRootKernelV1(
      parsed.entries,
      materializeVNextTextBlockSpatialIndexNodeV1,
    )
    const summary = root?.summary ?? EMPTY_SUMMARY
    const contentContextFingerprint = fingerprint({
      documentId: sourceState.documentId,
      sectionId: sourceState.sectionId,
      textBlockId: sourceState.textBlockId,
      instanceRevision: sourceState.instanceRevision,
      contentLeftLayoutUnit: 0,
      contentRightLayoutUnit:
        sourceState.producerRequirements.availableWidthLayoutUnit,
      layoutUnitPolicyFingerprint:
        sourceState.producerRequirements.layoutUnitPolicyFingerprint,
    })
    const geometryOwnerFactsFingerprint = fingerprint({
      entries: parsed.entries.map((entry) => ({
        objectId: entry.objectId,
        geometryOwnerFingerprint: entry.geometryOwnerFingerprint,
      })),
    })
    const entrySetFingerprint = fingerprint({
      entries: parsed.entries.map((entry) => entry.fingerprint),
    })
    const entryRootFingerprint = root?.fingerprint ?? fingerprint({
      kind: "empty-unified-spatial-root-v1",
    })
    const work = {
      completeBuildCount: 1 as const,
      visitedInputEntryCount: envelope.entries.length,
      normalizedEntryCount: parsed.entries.length,
      createdTreapNodeCount: summary.nodeCount,
      reusedTreapNodeCount: 0 as const,
      completeIndexRebuildCount: 1 as const,
      completeSourceTraversalCount: 0 as const,
      completeEvidenceTraversalCount: 0 as const,
      completeFlowTreeTraversalCount: 0 as const,
    }
    const facts = {
      source: VNEXT_TEXT_BLOCK_UNIFIED_SPATIAL_STATE_V1_SOURCE,
      contractVersion: VNEXT_TEXT_BLOCK_UNIFIED_SPATIAL_STATE_V1_VERSION,
      documentId: sourceState.documentId,
      sectionId: sourceState.sectionId,
      textBlockId: sourceState.textBlockId,
      instanceRevision: sourceState.instanceRevision,
      contentLeftLayoutUnit: 0 as const,
      contentRightLayoutUnit:
        sourceState.producerRequirements.availableWidthLayoutUnit,
      layoutUnitPolicyFingerprint:
        sourceState.producerRequirements.layoutUnitPolicyFingerprint,
      contentContextFingerprint,
      geometryOwnerFactsFingerprint,
      entrySetFingerprint,
      entryRootFingerprint,
      root,
      summary,
      work,
      contracts: {
        taskSpecificExclusionTreap: true as const,
        canonicalPositionedObjectSchema: false as const,
        authoredPositionedObjectBinding: false as const,
        sourceWrapperIndependent: true as const,
        flowWrapperIndependent: true as const,
        subtreeMaximumBottomQuery: true as const,
        preparedGraphCandidate: true as const,
        registeredAuthority: false as const,
        stagedEditorApply: false as const,
        mayPublishLayout: false as const,
        productionBinding: false as const,
      },
      mayPublishLayout: false as const,
      productionBinding: false as const,
    }
    const withoutFingerprint = deepFreeze(facts)
    const canonical = stringifyVNextCanonicalJson(canonicalFacts({
      ...withoutFingerprint,
      fingerprint: "",
    }))
    const spatialState = Object.freeze({
      ...withoutFingerprint,
      fingerprint: createVNextCompactFingerprint(canonical),
    })
    preparedStates.set(spatialState, {
      fingerprint: spatialState.fingerprint,
      canonicalFacts: canonical,
    })
    const bound = spatialStatesBySourceState.get(sourceState) ?? new WeakSet()
    bound.add(spatialState)
    spatialStatesBySourceState.set(sourceState, bound)
    return Object.freeze({
      status: "prepared",
      spatialState,
      work: spatialState.work,
      registeredAuthority: false,
      issues: Object.freeze([]) as readonly [],
    })
  } catch {
    return blocked([
      issue(
        "unsafe-spatial-arithmetic",
        "entries",
        "spatial state exceeded safe treap or canonical arithmetic",
      ),
    ])
  }
}

export function verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1(
  value: unknown,
): VNextTextBlockUnifiedSpatialStateInspectionV1 {
  if (
    value == null
    || typeof value !== "object"
    || !preparedStates.has(value as VNextTextBlockUnifiedSpatialStateV1)
  ) {
    return {
      status: "invalid",
      code: "spatial-state-authority-mismatch",
      message: "spatial state is not the exact process-local prepared candidate",
    }
  }
  if (!deeplyFrozen(value)) {
    return {
      status: "invalid",
      code: "spatial-state-not-deeply-frozen",
      message: "prepared spatial state must remain recursively frozen",
    }
  }
  try {
    const state = value as VNextTextBlockUnifiedSpatialStateV1
    const stored = preparedStates.get(state)!
    const canonical = stringifyVNextCanonicalJson(canonicalFacts(state))
    if (
      stored.canonicalFacts !== canonical
      || stored.fingerprint !== state.fingerprint
      || state.fingerprint !== createVNextCompactFingerprint(canonical)
    ) {
      return {
        status: "invalid",
        code: "spatial-state-canonical-facts-mismatch",
        message: "prepared spatial state no longer matches canonical facts",
      }
    }
    return {
      status: "valid-candidate",
      fingerprint: state.fingerprint,
      entrySetFingerprint: state.entrySetFingerprint,
      entryRootFingerprint: state.entryRootFingerprint,
      registeredAuthority: false,
    }
  } catch {
    return {
      status: "invalid",
      code: "spatial-state-canonical-facts-mismatch",
      message: "prepared spatial state is not canonically inspectable",
    }
  }
}

export function hasVNextTextBlockUnifiedSpatialStatePreparedBindingInternalV1(
  sourceState: unknown,
  spatialState: unknown,
): spatialState is VNextTextBlockUnifiedSpatialStateV1 {
  return sourceState != null
    && typeof sourceState === "object"
    && spatialState != null
    && typeof spatialState === "object"
    && verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1(
      spatialState,
    ).status === "valid-candidate"
    && spatialStatesBySourceState.get(
      sourceState as VNextTextBlockUnifiedLayoutSourceStateV1,
    )?.has(
      spatialState as VNextTextBlockUnifiedSpatialStateV1,
    ) === true
}

export function registerPreparedVNextTextBlockUnifiedSpatialStateRootGraphChildInternalV2(
  input: {
    readonly token: unknown
    readonly phase: "preflight" | "commit"
    readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  },
): boolean {
  if (input.phase === "preflight") {
    return !registeredRootGraphStates.has(input.spatialState)
      && verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1(
        input.spatialState,
      ).status === "valid-candidate"
      && authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2({
        token: input.token,
        phase: input.phase,
        childKind: "spatial-state",
        child: input.spatialState,
      })
  }
  if (
    !authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2({
      token: input.token,
      phase: input.phase,
      childKind: "spatial-state",
      child: input.spatialState,
    })
  ) return false
  registeredRootGraphStates.add(input.spatialState)
  return true
}

export function hasVNextTextBlockUnifiedSpatialStateRegisteredRootGraphBindingInternalV2(
  value: unknown,
): value is VNextTextBlockUnifiedSpatialStateV1 {
  return value != null
    && typeof value === "object"
    && registeredRootGraphStates.has(
      value as VNextTextBlockUnifiedSpatialStateV1,
    )
}

export function inspectVNextTextBlockUnifiedSpatialStateV1(
  value: unknown,
):
  | { readonly status: "valid"; readonly fingerprint: string }
  | {
      readonly status: "invalid"
      readonly code: "spatial-state-authority-mismatch"
      readonly message: string
    } {
  if (
    !hasVNextTextBlockUnifiedSpatialStateRegisteredRootGraphBindingInternalV2(
      value,
    )
  ) {
    return {
      status: "invalid",
      code: "spatial-state-authority-mismatch",
      message: "spatial state is not an exact committed Root V2 child",
    }
  }
  const candidate =
    verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1(value)
  return candidate.status === "valid-candidate"
    ? { status: "valid", fingerprint: candidate.fingerprint }
    : {
        status: "invalid",
        code: "spatial-state-authority-mismatch",
        message: candidate.message,
      }
}

export function queryVNextTextBlockUnifiedSpatialStateInternalV1(input: {
  readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  readonly band: {
    readonly topLayoutUnit: number
    readonly bottomLayoutUnit: number
  }
}): VNextTextBlockUnifiedSpatialStateQueryResultV1 {
  const inspection =
    verifyVNextTextBlockUnifiedSpatialStateCandidateInternalV1(
      input.spatialState,
    )
  if (inspection.status !== "valid-candidate") {
    return {
      status: "blocked",
      entries: null,
      work: null,
      issues: [{
        code: inspection.code,
        severity: "error",
        path: "spatialState",
        message: inspection.message,
      }],
    }
  }
  if (
    !Number.isSafeInteger(input.band.topLayoutUnit)
    || !Number.isSafeInteger(input.band.bottomLayoutUnit)
    || input.band.topLayoutUnit < 0
    || input.band.bottomLayoutUnit <= input.band.topLayoutUnit
  ) {
    return {
      status: "blocked",
      entries: null,
      work: null,
      issues: [{
        code: "invalid-query-band",
        severity: "error",
        path: "band",
        message: "spatial query band must be a positive half-open safe-integer range",
      }],
    }
  }
  const queried = queryVNextTextBlockSpatialIndexKernelV1({
    root: input.spatialState.root,
    topLayoutUnit: input.band.topLayoutUnit,
    bottomLayoutUnit: input.band.bottomLayoutUnit,
  })
  return {
    status: "accepted",
    entries: queried.entries,
    work: {
      visitedNodeCount: queried.visitedNodeCount,
      matchedEntryCount: queried.entries.length,
      completeIndexScanCount: 0,
    },
    issues: Object.freeze([]) as readonly [],
  }
}
