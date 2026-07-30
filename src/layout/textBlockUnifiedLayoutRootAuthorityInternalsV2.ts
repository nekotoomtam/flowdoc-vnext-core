import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  hasVNextTextBlockIncrementalFlowTreePreparedBindingInternalV1,
  hasVNextTextBlockIncrementalFlowTreeRegisteredRootGraphBindingInternalV2,
  registerPreparedVNextTextBlockIncrementalFlowTreeRootGraphChildInternalV2,
} from "./textBlockIncrementalFlowTreeV1.js"
import {
  hasVNextTextBlockPersistentLayoutLineTreePreparedRootDependenciesInternalV2,
  hasVNextTextBlockPersistentLayoutLineTreeRegisteredRootGraphBindingInternalV2,
  registerPreparedVNextTextBlockPersistentLayoutLineTreeRootGraphChildInternalV2,
} from "./textBlockPersistentLayoutLineTreeV1.js"
import {
  hasVNextTextBlockPersistentScenePreparedDependenciesInternalV2,
  hasVNextTextBlockPersistentSceneRegisteredRootGraphBindingInternalV2,
  registerPreparedVNextTextBlockPersistentSceneRootGraphChildInternalV2,
} from "./textBlockPersistentSceneV2.js"
import {
  hasVNextTextBlockUnifiedSpatialStatePreparedBindingInternalV1,
  hasVNextTextBlockUnifiedSpatialStateRegisteredRootGraphBindingInternalV2,
  registerPreparedVNextTextBlockUnifiedSpatialStateRootGraphChildInternalV2,
} from "./textBlockUnifiedSpatialStateV1.js"
import {
  hasVNextTextBlockUnifiedLayoutSourceStateRegisteredRootGraphBindingInternalV2,
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
  registerPreparedVNextTextBlockUnifiedLayoutSourceStateRootGraphChildInternalV2,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_SOURCE,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_VERSION,
  type VNextTextBlockUnifiedLayoutRootInspectionV2,
  type VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"

type ChildKind =
  | "source-state"
  | "flow-tree"
  | "spatial-state"
  | "line-tree"
  | "persistent-scene"

interface PreparedRootBindingV2 {
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly canonicalRootFacts: string
  readonly sourceState: VNextTextBlockUnifiedLayoutRootV2["sourceState"]
  readonly flowTree: VNextTextBlockUnifiedLayoutRootV2["flowTree"]
  readonly spatialState: VNextTextBlockUnifiedLayoutRootV2["spatialState"]
  readonly lineTree: VNextTextBlockUnifiedLayoutRootV2["lineTree"]
  readonly persistentScene:
    VNextTextBlockUnifiedLayoutRootV2["persistentScene"]
  readonly rootFingerprint: string
  readonly dependencyFingerprints:
    VNextTextBlockUnifiedLayoutRootV2["dependencyFingerprints"]
}

interface CommitTokenRecordV2 {
  readonly expected: readonly {
    readonly childKind: ChildKind
    readonly child: object
  }[]
  phase: "preflight" | "commit"
  preflightIndex: number
  commitIndex: number
}

const preparedRoots = new WeakMap<
  VNextTextBlockUnifiedLayoutRootV2,
  PreparedRootBindingV2
>()
const roots = new WeakMap<
  VNextTextBlockUnifiedLayoutRootV2,
  PreparedRootBindingV2
>()
const commitTokens = new WeakMap<object, CommitTokenRecordV2>()

const ROOT_KEYS = [
  "source",
  "contractVersion",
  "inputAuthority",
  "documentId",
  "instanceRevision",
  "sectionId",
  "textBlockId",
  "layoutId",
  "sourceState",
  "flowTree",
  "spatialState",
  "flowRegionProviderAuthority",
  "lineTree",
  "authoredBoxSummary",
  "persistentScene",
  "workPolicy",
  "dependencyFingerprints",
  "constructionKind",
  "constructionFingerprint",
  "contracts",
  "stagedEditorApply",
  "mayPublishLayout",
  "productionBinding",
  "fingerprint",
] as const

function exactDataProperties(
  value: unknown,
  keys: readonly string[],
): boolean {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return false
    }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return false
    if (Object.getOwnPropertySymbols(value).length !== 0) return false
    const actual = Reflect.ownKeys(value)
    return actual.length === keys.length
      && actual.every(
        (key) => typeof key === "string" && keys.includes(key),
      )
      && keys.every((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, key)
        return descriptor != null
          && Object.hasOwn(descriptor, "value")
          && descriptor.enumerable === true
      })
  } catch {
    return false
  }
}

function dependenciesMatch(
  root: VNextTextBlockUnifiedLayoutRootV2,
): boolean {
  const fingerprints = root.dependencyFingerprints
  return fingerprints.sourceState === root.sourceState.fingerprint
    && fingerprints.flowTree === root.flowTree.fingerprint
    && fingerprints.spatialState === root.spatialState.fingerprint
    && fingerprints.flowRegionProviderAuthority
      === root.flowRegionProviderAuthority.fingerprint
    && fingerprints.lineTree === root.lineTree.fingerprint
    && fingerprints.authoredBoxSummary
      === root.authoredBoxSummary.fingerprint
    && fingerprints.persistentScene === root.persistentScene.fingerprint
    && fingerprints.workPolicy === root.workPolicy.fingerprint
}

function rootClaimsMatch(root: VNextTextBlockUnifiedLayoutRootV2): boolean {
  return root.source === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_SOURCE
    && root.contractVersion
      === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_VERSION
    && root.inputAuthority === "core-synthetic-qa-only"
    && root.flowRegionProviderAuthority.source
      === "vnext-text-block-flow-region-provider-authority-v2"
    && root.flowRegionProviderAuthority.contractVersion === 2
    && root.authoredBoxSummary.source
      === "vnext-text-block-authored-box-summary-v2"
    && root.authoredBoxSummary.contractVersion === 2
    && root.contracts.unifiedTextBlockAuthority === true
    && root.contracts.processLocalImmutableRoot === true
    && root.contracts.persistentIncrementalTransition === true
    && root.contracts.completeNextInputOnHotPath === false
    && root.contracts.stagedEditorApply === false
    && root.contracts.mayPublishLayout === false
    && root.contracts.productionBinding === false
    && root.stagedEditorApply === false
    && root.mayPublishLayout === false
    && root.productionBinding === false
}

function exactRootShell(root: VNextTextBlockUnifiedLayoutRootV2): boolean {
  return Object.isFrozen(root)
    && Object.isFrozen(root.flowRegionProviderAuthority)
    && Object.isFrozen(root.authoredBoxSummary)
    && Object.isFrozen(root.dependencyFingerprints)
    && Object.isFrozen(root.contracts)
    && exactDataProperties(root, ROOT_KEYS)
}

export function canonicalVNextTextBlockUnifiedLayoutRootFactsInternalV2(
  root: VNextTextBlockUnifiedLayoutRootV2,
): string {
  return stringifyVNextCanonicalJson({
    source: root.source,
    contractVersion: root.contractVersion,
    inputAuthority: root.inputAuthority,
    documentId: root.documentId,
    instanceRevision: root.instanceRevision,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    layoutId: root.layoutId,
    flowRegionProviderAuthority: root.flowRegionProviderAuthority,
    authoredBoxSummary: root.authoredBoxSummary,
    dependencyFingerprints: root.dependencyFingerprints,
    constructionKind: root.constructionKind,
    constructionFingerprint: root.constructionFingerprint,
    contracts: root.contracts,
    stagedEditorApply: root.stagedEditorApply,
    mayPublishLayout: root.mayPublishLayout,
    productionBinding: root.productionBinding,
  })
}

export function authorizeVNextTextBlockUnifiedLayoutRootGraphChildRegistrationInternalV2(
  input: {
    readonly token: unknown
    readonly phase: "preflight" | "commit"
    readonly childKind: ChildKind
    readonly child: unknown
  },
): boolean {
  if (
    input.token == null
    || typeof input.token !== "object"
    || input.child == null
    || typeof input.child !== "object"
  ) return false
  const record = commitTokens.get(input.token)
  if (record == null || record.phase !== input.phase) return false
  const index = input.phase === "preflight"
    ? record.preflightIndex
    : record.commitIndex
  const expected = record.expected[index]
  if (
    expected?.childKind !== input.childKind
    || expected.child !== input.child
  ) return false
  if (input.phase === "preflight") record.preflightIndex += 1
  else record.commitIndex += 1
  return true
}

export function prepareVNextTextBlockUnifiedLayoutRootGraphCandidateBindingInternalV2(
  root: VNextTextBlockUnifiedLayoutRootV2,
): boolean {
  if (
    preparedRoots.has(root)
    || roots.has(root)
    || !exactRootShell(root)
    || !rootClaimsMatch(root)
    || !dependenciesMatch(root)
    || inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      root.sourceState,
    ).status !== "prepared-unregistered"
    || !hasVNextTextBlockIncrementalFlowTreePreparedBindingInternalV1(
      root.sourceState,
      root.flowTree,
    )
    || !hasVNextTextBlockUnifiedSpatialStatePreparedBindingInternalV1(
      root.sourceState,
      root.spatialState,
    )
    || !hasVNextTextBlockPersistentLayoutLineTreePreparedRootDependenciesInternalV2({
      sourceState: root.sourceState,
      flowTree: root.flowTree,
      spatialState: root.spatialState,
      lineTree: root.lineTree,
    })
    || !hasVNextTextBlockPersistentScenePreparedDependenciesInternalV2({
      sourceState: root.sourceState,
      lineTree: root.lineTree,
      scene: root.persistentScene,
    })
    || root.flowRegionProviderAuthority.spatialStateFingerprint
      !== root.spatialState.fingerprint
    || root.flowRegionProviderAuthority.layoutContextFingerprint
      !== root.flowTree.layoutContextFingerprint
    || root.authoredBoxSummary.authoredBoxPlanFingerprint
      !== root.sourceState.authoredBoxPlan.fingerprint
    || root.authoredBoxSummary.lineCount !== root.lineTree.summary.lineCount
    || root.persistentScene.lineTreeFingerprint !== root.lineTree.fingerprint
  ) return false
  const canonicalRootFacts =
    canonicalVNextTextBlockUnifiedLayoutRootFactsInternalV2(root)
  if (
    root.fingerprint
    !== createVNextCompactFingerprint(canonicalRootFacts)
  ) return false
  preparedRoots.set(root, {
    root,
    canonicalRootFacts,
    sourceState: root.sourceState,
    flowTree: root.flowTree,
    spatialState: root.spatialState,
    lineTree: root.lineTree,
    persistentScene: root.persistentScene,
    rootFingerprint: root.fingerprint,
    dependencyFingerprints: { ...root.dependencyFingerprints },
  })
  return true
}

export type VNextTextBlockUnifiedLayoutRootGraphRegistrationResultV2 =
  | {
      readonly status: "committed"
      readonly attemptedRegistrationCount: 6
      readonly committedRegistrationCount: 6
    }
  | {
      readonly status: "blocked"
      readonly attemptedRegistrationCount: 0
      readonly committedRegistrationCount: 0
      readonly message: string
    }

export function registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockUnifiedLayoutRootGraphRegistrationResultV2 {
  const binding = preparedRoots.get(root)
  if (
    binding == null
    || roots.has(root)
    || hasVNextTextBlockUnifiedLayoutSourceStateRegisteredRootGraphBindingInternalV2(
      binding.sourceState,
    )
    || hasVNextTextBlockIncrementalFlowTreeRegisteredRootGraphBindingInternalV2(
      binding.flowTree,
    )
    || hasVNextTextBlockUnifiedSpatialStateRegisteredRootGraphBindingInternalV2(
      binding.spatialState,
    )
    || hasVNextTextBlockPersistentLayoutLineTreeRegisteredRootGraphBindingInternalV2(
      binding.lineTree,
    )
    || hasVNextTextBlockPersistentSceneRegisteredRootGraphBindingInternalV2(
      binding.persistentScene,
    )
  ) {
    return {
      status: "blocked",
      attemptedRegistrationCount: 0,
      committedRegistrationCount: 0,
      message: "Root V2 graph is not one fresh exact prepared candidate",
    }
  }
  const expected = [
    { childKind: "source-state" as const, child: binding.sourceState },
    { childKind: "flow-tree" as const, child: binding.flowTree },
    { childKind: "spatial-state" as const, child: binding.spatialState },
    { childKind: "line-tree" as const, child: binding.lineTree },
    {
      childKind: "persistent-scene" as const,
      child: binding.persistentScene,
    },
  ]
  const token = Object.freeze({})
  const tokenRecord: CommitTokenRecordV2 = {
    expected,
    phase: "preflight",
    preflightIndex: 0,
    commitIndex: 0,
  }
  commitTokens.set(token, tokenRecord)
  const preflight = [
    registerPreparedVNextTextBlockUnifiedLayoutSourceStateRootGraphChildInternalV2({
      token,
      phase: "preflight",
      sourceState: binding.sourceState,
    }),
    registerPreparedVNextTextBlockIncrementalFlowTreeRootGraphChildInternalV2({
      token,
      phase: "preflight",
      flowTree: binding.flowTree,
    }),
    registerPreparedVNextTextBlockUnifiedSpatialStateRootGraphChildInternalV2({
      token,
      phase: "preflight",
      spatialState: binding.spatialState,
    }),
    registerPreparedVNextTextBlockPersistentLayoutLineTreeRootGraphChildInternalV2({
      token,
      phase: "preflight",
      lineTree: binding.lineTree,
    }),
    registerPreparedVNextTextBlockPersistentSceneRootGraphChildInternalV2({
      token,
      phase: "preflight",
      scene: binding.persistentScene,
    }),
  ]
  if (
    preflight.some((accepted) => !accepted)
    || tokenRecord.preflightIndex !== expected.length
  ) {
    commitTokens.delete(token)
    return {
      status: "blocked",
      attemptedRegistrationCount: 0,
      committedRegistrationCount: 0,
      message: "Root V2 child registration preflight failed before writes",
    }
  }
  tokenRecord.phase = "commit"
  const committed = [
    registerPreparedVNextTextBlockUnifiedLayoutSourceStateRootGraphChildInternalV2({
      token,
      phase: "commit",
      sourceState: binding.sourceState,
    }),
    registerPreparedVNextTextBlockIncrementalFlowTreeRootGraphChildInternalV2({
      token,
      phase: "commit",
      flowTree: binding.flowTree,
    }),
    registerPreparedVNextTextBlockUnifiedSpatialStateRootGraphChildInternalV2({
      token,
      phase: "commit",
      spatialState: binding.spatialState,
    }),
    registerPreparedVNextTextBlockPersistentLayoutLineTreeRootGraphChildInternalV2({
      token,
      phase: "commit",
      lineTree: binding.lineTree,
    }),
    registerPreparedVNextTextBlockPersistentSceneRootGraphChildInternalV2({
      token,
      phase: "commit",
      scene: binding.persistentScene,
    }),
  ]
  commitTokens.delete(token)
  if (
    committed.some((accepted) => !accepted)
    || tokenRecord.commitIndex !== expected.length
  ) {
    throw new Error(
      "Root V2 registration invariant failed after successful preflight",
    )
  }
  roots.set(root, binding)
  preparedRoots.delete(root)
  return {
    status: "committed",
    attemptedRegistrationCount: 6,
    committedRegistrationCount: 6,
  }
}

export function inspectVNextTextBlockUnifiedLayoutRootBindingInternalV2(
  value: unknown,
): VNextTextBlockUnifiedLayoutRootInspectionV2 {
  if (
    value == null
    || typeof value !== "object"
    || !roots.has(value as VNextTextBlockUnifiedLayoutRootV2)
  ) {
    return {
      status: "invalid",
      code: "root-authority-mismatch",
      message: "Root V2 is not the exact process-local committed root",
    }
  }
  const root = value as VNextTextBlockUnifiedLayoutRootV2
  const binding = roots.get(root)!
  if (!exactRootShell(root) || !rootClaimsMatch(root)) {
    return {
      status: "invalid",
      code: "root-shell-mismatch",
      message: "committed Root V2 no longer has its exact frozen shell",
    }
  }
  if (
    root.sourceState !== binding.sourceState
    || root.flowTree !== binding.flowTree
    || root.spatialState !== binding.spatialState
    || root.lineTree !== binding.lineTree
    || root.persistentScene !== binding.persistentScene
    || !dependenciesMatch(root)
    || !hasVNextTextBlockUnifiedLayoutSourceStateRegisteredRootGraphBindingInternalV2(
      root.sourceState,
    )
    || !hasVNextTextBlockIncrementalFlowTreeRegisteredRootGraphBindingInternalV2(
      root.flowTree,
    )
    || !hasVNextTextBlockUnifiedSpatialStateRegisteredRootGraphBindingInternalV2(
      root.spatialState,
    )
    || !hasVNextTextBlockPersistentLayoutLineTreeRegisteredRootGraphBindingInternalV2(
      root.lineTree,
    )
    || !hasVNextTextBlockPersistentSceneRegisteredRootGraphBindingInternalV2(
      root.persistentScene,
    )
  ) {
    return {
      status: "invalid",
      code: "root-dependency-mismatch",
      message: "committed Root V2 no longer retains exact registered children",
    }
  }
  if (
    root.fingerprint !== binding.rootFingerprint
    || canonicalVNextTextBlockUnifiedLayoutRootFactsInternalV2(root)
      !== binding.canonicalRootFacts
  ) {
    return {
      status: "invalid",
      code: "root-fingerprint-mismatch",
      message: "committed Root V2 no longer matches canonical scalar facts",
    }
  }
  return {
    status: "valid",
    fingerprint: root.fingerprint,
    persistentSceneFingerprint: root.persistentScene.fingerprint,
    constructionKind: root.constructionKind,
    work: {
      topLevelDependencyCount: 8,
      completeChildGraphTraversalCount: 0,
      completeChildRehashCount: 0,
      rootWrapperInspectionCount: 1,
    },
  }
}
