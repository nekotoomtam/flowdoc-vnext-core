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
  readonly flowRegionProviderAuthority:
    VNextTextBlockUnifiedLayoutRootV2["flowRegionProviderAuthority"]
  readonly authoredBoxSummary:
    VNextTextBlockUnifiedLayoutRootV2["authoredBoxSummary"]
  readonly workPolicy: VNextTextBlockUnifiedLayoutRootV2["workPolicy"]
  readonly rootFingerprint: string
  readonly rootSemanticFingerprint: string
  readonly canonicalRootSemanticFacts: string
  readonly semanticDependencyFingerprints:
    VNextTextBlockUnifiedLayoutRootV2["semanticDependencyFingerprints"]
  readonly dependencyFingerprints:
    VNextTextBlockUnifiedLayoutRootV2["dependencyFingerprints"]
  readonly childrenToRegister: readonly {
    readonly childKind: ChildKind
    readonly child: object
  }[]
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
  "semanticDependencyFingerprints",
  "dependencyFingerprints",
  "constructionKind",
  "constructionFingerprint",
  "semanticFingerprint",
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

function compactFingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

export function deriveVNextTextBlockUnifiedLayoutRootSemanticDependencyFingerprintsInternalV2(
  root: Pick<
    VNextTextBlockUnifiedLayoutRootV2,
    | "sourceState"
    | "flowTree"
    | "spatialState"
    | "flowRegionProviderAuthority"
    | "lineTree"
    | "authoredBoxSummary"
    | "persistentScene"
  >,
): VNextTextBlockUnifiedLayoutRootV2["semanticDependencyFingerprints"] {
  const sourceState = root.sourceState
  const flowTree = root.flowTree
  const spatialState = root.spatialState
  const lineTree = root.lineTree
  return Object.freeze({
    sourceState: compactFingerprint({
      source: sourceState.source,
      contractVersion: sourceState.contractVersion,
      documentId: sourceState.documentId,
      sectionId: sourceState.sectionId,
      textBlockId: sourceState.textBlockId,
      instanceRevision: sourceState.instanceRevision,
      initialFlowFingerprint: sourceState.initialFlowFingerprint,
      flowEvidenceFingerprint: sourceState.flowEvidenceFingerprint,
      authoredBoxPlanFingerprint:
        sourceState.authoredBoxPlan.fingerprint,
      producerRequirements: sourceState.producerRequirements,
      policyFingerprint: sourceState.policy.fingerprint,
      rootFingerprint: sourceState.root.fingerprint,
      summary: sourceState.summary,
      contracts: sourceState.contracts,
      mayPublishLayout: sourceState.mayPublishLayout,
      productionBinding: sourceState.productionBinding,
    }),
    flowTree: compactFingerprint({
      source: flowTree.source,
      contractVersion: flowTree.contractVersion,
      documentId: flowTree.documentId,
      sectionId: flowTree.sectionId,
      textBlockId: flowTree.textBlockId,
      instanceRevision: flowTree.instanceRevision,
      layoutId: flowTree.layoutId,
      layoutContextFingerprint: flowTree.layoutContextFingerprint,
      sourceStateLayoutDependencyFingerprint:
        flowTree.sourceStateLayoutDependencyFingerprint,
      producerRuntimeRequirementFingerprint:
        flowTree.producerRuntimeRequirementFingerprint,
      policyFingerprint: flowTree.policy.fingerprint,
      rootFingerprint: flowTree.root.fingerprint,
      summary: flowTree.summary,
      contracts: flowTree.contracts,
      mayPublishLayout: flowTree.mayPublishLayout,
      productionBinding: flowTree.productionBinding,
    }),
    spatialState: compactFingerprint({
      source: spatialState.source,
      contractVersion: spatialState.contractVersion,
      documentId: spatialState.documentId,
      sectionId: spatialState.sectionId,
      textBlockId: spatialState.textBlockId,
      instanceRevision: spatialState.instanceRevision,
      contentLeftLayoutUnit: spatialState.contentLeftLayoutUnit,
      contentRightLayoutUnit: spatialState.contentRightLayoutUnit,
      layoutUnitPolicyFingerprint:
        spatialState.layoutUnitPolicyFingerprint,
      contentContextFingerprint:
        spatialState.contentContextFingerprint,
      geometryOwnerFactsFingerprint:
        spatialState.geometryOwnerFactsFingerprint,
      entrySetFingerprint: spatialState.entrySetFingerprint,
      entryRootFingerprint: spatialState.entryRootFingerprint,
      summary: spatialState.summary,
      contracts: spatialState.contracts,
      mayPublishLayout: spatialState.mayPublishLayout,
      productionBinding: spatialState.productionBinding,
    }),
    flowRegionProviderAuthority:
      root.flowRegionProviderAuthority.fingerprint,
    lineTree: lineTree.semanticFingerprint,
    authoredBoxSummary: root.authoredBoxSummary.fingerprint,
    persistentScene: root.persistentScene.fingerprint,
  })
}

function semanticDependenciesMatch(
  root: VNextTextBlockUnifiedLayoutRootV2,
): boolean {
  const expected =
    deriveVNextTextBlockUnifiedLayoutRootSemanticDependencyFingerprintsInternalV2(
      root,
    )
  const actual = root.semanticDependencyFingerprints
  return actual.sourceState === expected.sourceState
    && actual.flowTree === expected.flowTree
    && actual.spatialState === expected.spatialState
    && actual.flowRegionProviderAuthority
      === expected.flowRegionProviderAuthority
    && actual.lineTree === expected.lineTree
    && actual.authoredBoxSummary === expected.authoredBoxSummary
    && actual.persistentScene === expected.persistentScene
}

function fingerprintRecordsMatch(
  left: Readonly<Record<string, string>>,
  right: Readonly<Record<string, string>>,
): boolean {
  const keys = Object.keys(left)
  return keys.length === Object.keys(right).length
    && keys.every((key) => left[key] === right[key])
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
    && Object.isFrozen(root.semanticDependencyFingerprints)
    && Object.isFrozen(root.dependencyFingerprints)
    && Object.isFrozen(root.contracts)
    && exactDataProperties(root, ROOT_KEYS)
    && exactDataProperties(root.semanticDependencyFingerprints, [
      "sourceState",
      "flowTree",
      "spatialState",
      "flowRegionProviderAuthority",
      "lineTree",
      "authoredBoxSummary",
      "persistentScene",
    ])
    && exactDataProperties(root.dependencyFingerprints, [
      "sourceState",
      "flowTree",
      "spatialState",
      "flowRegionProviderAuthority",
      "lineTree",
      "authoredBoxSummary",
      "persistentScene",
      "workPolicy",
    ])
}

export function canonicalVNextTextBlockUnifiedLayoutRootSemanticFactsInternalV2(
  root: VNextTextBlockUnifiedLayoutRootV2,
): string {
  return stringifyVNextCanonicalJson({
    source: root.source,
    contractVersion: root.contractVersion,
    documentId: root.documentId,
    instanceRevision: root.instanceRevision,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    layoutId: root.layoutId,
    semanticDependencyFingerprints: root.semanticDependencyFingerprints,
    contracts: root.contracts,
    stagedEditorApply: root.stagedEditorApply,
    mayPublishLayout: root.mayPublishLayout,
    productionBinding: root.productionBinding,
  })
}

export function canonicalVNextTextBlockUnifiedLayoutRootFactsInternalV2(
  root: VNextTextBlockUnifiedLayoutRootV2,
): string {
  return stringifyVNextCanonicalJson({
    semanticFingerprint: root.semanticFingerprint,
    inputAuthority: root.inputAuthority,
    dependencyFingerprints: root.dependencyFingerprints,
    constructionKind: root.constructionKind,
    constructionFingerprint: root.constructionFingerprint,
    workPolicy: root.workPolicy,
    contracts: root.contracts,
    stagedEditorApply: root.stagedEditorApply,
    mayPublishLayout: root.mayPublishLayout,
    productionBinding: root.productionBinding,
  })
}

export function composeVNextTextBlockUnifiedLayoutRootIdentityForTestInternalV2(
  input: {
    readonly root: VNextTextBlockUnifiedLayoutRootV2
    readonly lineTreeFingerprint: string
    readonly lineTreeSemanticFingerprint: string
    readonly persistentSceneFingerprint: string
  },
): {
  readonly semanticDependencyFingerprints:
    VNextTextBlockUnifiedLayoutRootV2["semanticDependencyFingerprints"]
  readonly dependencyFingerprints:
    VNextTextBlockUnifiedLayoutRootV2["dependencyFingerprints"]
  readonly semanticFingerprint: string
  readonly fingerprint: string
} {
  const semanticDependencyFingerprints = Object.freeze({
    ...input.root.semanticDependencyFingerprints,
    lineTree: input.lineTreeSemanticFingerprint,
    persistentScene: input.persistentSceneFingerprint,
  })
  const dependencyFingerprints = Object.freeze({
    ...input.root.dependencyFingerprints,
    lineTree: input.lineTreeFingerprint,
    persistentScene: input.persistentSceneFingerprint,
  })
  const semanticVariant = {
    ...input.root,
    semanticDependencyFingerprints,
    dependencyFingerprints,
  }
  const semanticFingerprint = createVNextCompactFingerprint(
    canonicalVNextTextBlockUnifiedLayoutRootSemanticFactsInternalV2(
      semanticVariant,
    ),
  )
  return Object.freeze({
    semanticDependencyFingerprints,
    dependencyFingerprints,
    semanticFingerprint,
    fingerprint: createVNextCompactFingerprint(
      canonicalVNextTextBlockUnifiedLayoutRootFactsInternalV2({
        ...semanticVariant,
        semanticFingerprint,
      }),
    ),
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
    || !semanticDependenciesMatch(root)
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
    || root.persistentScene.lineTreeSemanticFingerprint
      !== root.lineTree.semanticFingerprint
  ) return false
  const childEntries = [
    { childKind: "source-state" as const, child: root.sourceState },
    { childKind: "flow-tree" as const, child: root.flowTree },
    { childKind: "spatial-state" as const, child: root.spatialState },
    { childKind: "line-tree" as const, child: root.lineTree },
    {
      childKind: "persistent-scene" as const,
      child: root.persistentScene,
    },
  ]
  const childrenToRegister = childEntries.filter((entry) => {
    switch (entry.childKind) {
      case "source-state":
        return !hasVNextTextBlockUnifiedLayoutSourceStateRegisteredRootGraphBindingInternalV2(
          entry.child,
        )
      case "flow-tree":
        return !hasVNextTextBlockIncrementalFlowTreeRegisteredRootGraphBindingInternalV2(
          entry.child,
        )
      case "spatial-state":
        return !hasVNextTextBlockUnifiedSpatialStateRegisteredRootGraphBindingInternalV2(
          entry.child,
        )
      case "line-tree":
        return !hasVNextTextBlockPersistentLayoutLineTreeRegisteredRootGraphBindingInternalV2(
          entry.child,
        )
      case "persistent-scene":
        return !hasVNextTextBlockPersistentSceneRegisteredRootGraphBindingInternalV2(
          entry.child,
        )
    }
  })
  const canonicalRootFacts =
    canonicalVNextTextBlockUnifiedLayoutRootFactsInternalV2(root)
  const canonicalRootSemanticFacts =
    canonicalVNextTextBlockUnifiedLayoutRootSemanticFactsInternalV2(root)
  if (
    root.semanticFingerprint
      !== createVNextCompactFingerprint(canonicalRootSemanticFacts)
    || root.fingerprint
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
    flowRegionProviderAuthority: root.flowRegionProviderAuthority,
    authoredBoxSummary: root.authoredBoxSummary,
    workPolicy: root.workPolicy,
    rootFingerprint: root.fingerprint,
    rootSemanticFingerprint: root.semanticFingerprint,
    canonicalRootSemanticFacts,
    semanticDependencyFingerprints: {
      ...root.semanticDependencyFingerprints,
    },
    dependencyFingerprints: { ...root.dependencyFingerprints },
    childrenToRegister,
  })
  return true
}

export type VNextTextBlockUnifiedLayoutRootGraphRegistrationResultV2 =
  | {
      readonly status: "committed"
      readonly attemptedRegistrationCount: number
      readonly committedRegistrationCount: number
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
  ) {
    return {
      status: "blocked",
      attemptedRegistrationCount: 0,
      committedRegistrationCount: 0,
      message: "Root V2 graph is not one fresh exact prepared candidate",
    }
  }
  const expected = binding.childrenToRegister
  const token = Object.freeze({})
  const tokenRecord: CommitTokenRecordV2 = {
    expected,
    phase: "preflight",
    preflightIndex: 0,
    commitIndex: 0,
  }
  commitTokens.set(token, tokenRecord)
  const registerChild = (
    entry: (typeof expected)[number],
    phase: "preflight" | "commit",
  ): boolean => {
    switch (entry.childKind) {
      case "source-state":
        return registerPreparedVNextTextBlockUnifiedLayoutSourceStateRootGraphChildInternalV2({
          token,
          phase,
          sourceState: entry.child as
            VNextTextBlockUnifiedLayoutRootV2["sourceState"],
        })
      case "flow-tree":
        return registerPreparedVNextTextBlockIncrementalFlowTreeRootGraphChildInternalV2({
          token,
          phase,
          flowTree: entry.child as
            VNextTextBlockUnifiedLayoutRootV2["flowTree"],
        })
      case "spatial-state":
        return registerPreparedVNextTextBlockUnifiedSpatialStateRootGraphChildInternalV2({
          token,
          phase,
          spatialState: entry.child as
            VNextTextBlockUnifiedLayoutRootV2["spatialState"],
        })
      case "line-tree":
        return registerPreparedVNextTextBlockPersistentLayoutLineTreeRootGraphChildInternalV2({
          token,
          phase,
          lineTree: entry.child as
            VNextTextBlockUnifiedLayoutRootV2["lineTree"],
        })
      case "persistent-scene":
        return registerPreparedVNextTextBlockPersistentSceneRootGraphChildInternalV2({
          token,
          phase,
          scene: entry.child as
            VNextTextBlockUnifiedLayoutRootV2["persistentScene"],
        })
    }
  }
  const preflight = expected.map((entry) =>
    registerChild(entry, "preflight")
  )
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
  const committed = expected.map((entry) =>
    registerChild(entry, "commit")
  )
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
    attemptedRegistrationCount: expected.length + 1,
    committedRegistrationCount: expected.length + 1,
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
    || root.flowRegionProviderAuthority
      !== binding.flowRegionProviderAuthority
    || root.authoredBoxSummary !== binding.authoredBoxSummary
    || root.workPolicy !== binding.workPolicy
    || !dependenciesMatch(root)
    || !fingerprintRecordsMatch(
      root.semanticDependencyFingerprints,
      binding.semanticDependencyFingerprints,
    )
    || !fingerprintRecordsMatch(
      root.dependencyFingerprints,
      binding.dependencyFingerprints,
    )
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
    || root.semanticFingerprint !== binding.rootSemanticFingerprint
    || canonicalVNextTextBlockUnifiedLayoutRootSemanticFactsInternalV2(root)
      !== binding.canonicalRootSemanticFacts
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
    semanticFingerprint: root.semanticFingerprint,
    persistentSceneFingerprint: root.persistentScene.fingerprint,
    persistentScenePayloadObservationFingerprint:
      root.persistentScene.payloadObservation
        .payloadObservationFingerprint,
    constructionKind: root.constructionKind,
    work: {
      topLevelDependencyCount: 8,
      completeChildGraphTraversalCount: 0,
      completeChildRehashCount: 0,
      rootWrapperInspectionCount: 1,
    },
  }
}
