import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2,
} from "./textBlockAuthoredBoxGeometryV2.js"
import {
  hasVNextTextBlockFlowEvidenceBindingInternalV2,
  inspectVNextTextBlockFlowEvidenceV2,
} from "./textBlockFlowEvidenceV2.js"
import type {
  VNextTextBlockFlowEvidenceV2,
} from "./textBlockFlowEvidenceContractV2.js"
import {
  createVNextTextBlockIncrementalFlowTreeCompleteInternalV1,
} from "./textBlockIncrementalFlowTreeV1.js"
import {
  inspectVNextTextBlockInitialFlowV1,
  type VNextTextBlockInitialFlowV1,
} from "./textBlockInitialFlowInputV1.js"
import {
  createVNextTextBlockPersistentFlowTreeV2,
} from "./textBlockPersistentFlowTreeV2.js"
import {
  createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1,
} from "./textBlockPersistentLayoutLineTreeV1.js"
import {
  createVNextTextBlockPersistentSceneCompleteInternalV2,
} from "./textBlockPersistentSceneV2.js"
import {
  createVNextTextBlockSpatialIndexV2,
} from "./textBlockSpatialIndexV2.js"
import type {
  VNextTextBlockSyntheticPositionedObjectInputV1,
} from "./textBlockSpatialIndexContractV1.js"
import {
  layoutVNextTextBlockSpatialWrappingV2,
} from "./textBlockSpatialWrappingLayoutV2.js"
import {
  canonicalVNextTextBlockUnifiedLayoutRootFactsInternalV2,
  canonicalVNextTextBlockUnifiedLayoutRootSemanticFactsInternalV2,
  deriveVNextTextBlockUnifiedLayoutRootSemanticDependencyFingerprintsInternalV2,
  getVNextTextBlockRootSourceEnvelopeRecordInternalV1,
  inspectVNextTextBlockUnifiedLayoutRootBindingInternalV2,
  prepareVNextTextBlockRootSourceEnvelopeBindingInternalV1,
  prepareVNextTextBlockUnifiedLayoutRootGraphCandidateBindingInternalV2,
  registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2,
  type VNextTextBlockRootSourceEnvelopeAuthorityInternalV1,
} from "./textBlockUnifiedLayoutRootAuthorityInternalsV2.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_SOURCE,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_VERSION,
  type VNextTextBlockAuthoredBoxSummaryV2,
  type VNextTextBlockUnifiedFlowRegionProviderAuthorityV2,
  type VNextTextBlockUnifiedLayoutCompleteBuildWorkV2,
  type VNextTextBlockUnifiedLayoutRootBuildInputV2,
  type VNextTextBlockUnifiedLayoutRootCompleteCandidateResultV2,
  type VNextTextBlockUnifiedLayoutRootConstructionKindV2,
  type VNextTextBlockUnifiedLayoutRootInspectionV2,
  type VNextTextBlockUnifiedLayoutRootResultV2,
  type VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  createVNextTextBlockUnifiedSpatialStateCompleteInternalV1,
} from "./textBlockUnifiedSpatialStateV1.js"
import {
  createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1,
  inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutIssueV1,
  VNextTextBlockUnifiedLayoutStageV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
  evaluateVNextTextBlockSourceWorkEnvelopeInternalV1,
  isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1,
  type VNextTextBlockSourceWorkEnvelopeEvaluationInternalV1,
  type VNextTextBlockUnifiedLayoutWorkPolicyV1,
} from "./textBlockUnifiedLayoutWorkPolicyV1.js"

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function exactRecord(
  value: unknown,
  required: readonly string[],
  optional: readonly string[] = [],
): Record<string, unknown> | null {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return null
    }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(value).length !== 0) return null
    const allowed = [...required, ...optional]
    const keys = Reflect.ownKeys(value)
    if (
      keys.length < required.length
      || keys.length > allowed.length
      || required.some((key) => !keys.includes(key))
      || keys.some(
        (key) => typeof key !== "string" || !allowed.includes(key),
      )
    ) return null
    const output = Object.create(null) as Record<string, unknown>
    for (const key of keys) {
      if (typeof key !== "string") return null
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

function exactArray(value: unknown): readonly unknown[] | null {
  try {
    if (
      !Array.isArray(value)
      || Object.getPrototypeOf(value) !== Array.prototype
    ) return null
    const length = Object.getOwnPropertyDescriptor(value, "length")
    if (
      length == null
      || !Object.hasOwn(length, "value")
      || !Number.isSafeInteger(length.value)
      || length.value < 0
      || Reflect.ownKeys(value).length !== length.value + 1
    ) return null
    const output: unknown[] = []
    for (let index = 0; index < length.value; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      output.push(descriptor.value)
    }
    return output
  } catch {
    return null
  }
}

function strictInput(value: unknown): {
  readonly inputAuthority: unknown
  readonly initialFlow: unknown
  readonly evidence: unknown
  readonly spatialEntries: readonly unknown[]
  readonly bindProductionLayout?: unknown
} | null {
  const record = exactRecord(
    value,
    ["inputAuthority", "initialFlow", "evidence", "spatialEntries"],
    ["bindProductionLayout"],
  )
  if (record == null) return null
  const spatialEntries = exactArray(record.spatialEntries)
  if (
    spatialEntries == null
    || (
      Object.hasOwn(record, "bindProductionLayout")
      && typeof record.bindProductionLayout !== "boolean"
    )
  ) return null
  return {
    inputAuthority: record.inputAuthority,
    initialFlow: record.initialFlow,
    evidence: record.evidence,
    spatialEntries,
    ...(Object.hasOwn(record, "bindProductionLayout")
      ? { bindProductionLayout: record.bindProductionLayout }
      : {}),
  }
}

function validWorkPolicy(
  value: unknown,
): value is VNextTextBlockUnifiedLayoutWorkPolicyV1 {
  return isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(value)
}

function issue(
  code: VNextTextBlockUnifiedLayoutIssueV1["code"],
  stage: VNextTextBlockUnifiedLayoutStageV1,
  path: string,
  message: string,
): VNextTextBlockUnifiedLayoutIssueV1 {
  return { code, severity: "error", stage, path, message }
}

const zeroWork = (): VNextTextBlockUnifiedLayoutCompleteBuildWorkV2 => ({
  completeRootV2BuildCount: 0,
  completeSourceItemVisitCount: 0,
  completeFlowAtomVisitCount: 0,
  completeSpatialEntryVisitCount: 0,
  completeLineVisitCount: 0,
  completeFragmentVisitCount: 0,
  completeSceneNodeVisitCount: 0,
  completeSceneProjectionCount: 0,
  completeChildGraphTraversalCount: 0,
  completeChildRehashCount: 0,
})

function blocked(
  work: VNextTextBlockUnifiedLayoutCompleteBuildWorkV2,
  item: VNextTextBlockUnifiedLayoutIssueV1,
): Extract<VNextTextBlockUnifiedLayoutRootResultV2, { status: "blocked" }> {
  return Object.freeze({
    status: "blocked",
    root: null,
    persistentScene: null,
    deliveryPlan: null,
    completeBuildWork: Object.freeze({ ...work }),
    issues: Object.freeze([item]),
  })
}

function flowRegionProviderAuthority(
  spatialStateFingerprint: string,
  layoutContextFingerprint: string,
): VNextTextBlockUnifiedFlowRegionProviderAuthorityV2 {
  const facts = {
    source: "vnext-text-block-flow-region-provider-authority-v2" as const,
    contractVersion: 2 as const,
    spatialStateFingerprint,
    layoutContextFingerprint,
  }
  return Object.freeze({
    ...facts,
    fingerprint: fingerprint(facts),
  })
}

function authoredBoxSummary(input: {
  readonly authoredBoxPlanFingerprint: string
  readonly contentLeftLayoutUnit: number
  readonly contentWidthLayoutUnit: number
  readonly outerWidthLayoutUnit: number
  readonly outerHeightLayoutUnit: number
  readonly lineCount: number
  readonly authoredGeometryFingerprint: string
}): VNextTextBlockAuthoredBoxSummaryV2 {
  const facts = {
    source: "vnext-text-block-authored-box-summary-v2" as const,
    contractVersion: 2 as const,
    ...input,
  }
  return Object.freeze({
    ...facts,
    fingerprint: fingerprint(facts),
  })
}

let completeKernelObserver:
  | ((
      constructionKind: "complete-bootstrap" | "complete-fallback",
    ) => void)
  | null = null

export interface VNextTextBlockSourceEnvelopeObservationForTestInternalV1 {
  readonly constructionKind: "complete-bootstrap" | "complete-fallback"
  readonly status: "accepted" | "rejected" | "invalid-policy"
  readonly sourceItemCount: number | null
  readonly treeHeight: number | null
}

let sourceEnvelopeObserver:
  | ((observation:
      VNextTextBlockSourceEnvelopeObservationForTestInternalV1) => void)
  | null = null

export function setVNextTextBlockUnifiedLayoutCompleteKernelObserverForTestInternalV2(
  observer:
    | ((
        constructionKind: "complete-bootstrap" | "complete-fallback",
      ) => void)
    | null,
): void {
  completeKernelObserver = observer
}

export function setVNextTextBlockUnifiedLayoutSourceEnvelopeObserverForTestInternalV1(
  observer:
    | ((observation:
        VNextTextBlockSourceEnvelopeObservationForTestInternalV1) => void)
    | null,
): void {
  sourceEnvelopeObserver = observer
}

export function prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
  input: VNextTextBlockUnifiedLayoutRootBuildInputV2,
  workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1,
  constructionKind: "complete-bootstrap" | "complete-fallback",
): VNextTextBlockUnifiedLayoutRootCompleteCandidateResultV2
export function prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
  input: unknown,
  workPolicy: unknown,
  constructionKind: unknown,
): VNextTextBlockUnifiedLayoutRootCompleteCandidateResultV2
export function prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
  input: unknown,
  workPolicy: unknown,
  constructionKind: unknown,
): VNextTextBlockUnifiedLayoutRootCompleteCandidateResultV2 {
  completeKernelObserver?.(
    constructionKind as "complete-bootstrap" | "complete-fallback",
  )
  let work = zeroWork()
  const envelope = strictInput(input)
  if (envelope == null) {
    return blocked(work, issue(
      "invalid-change-data",
      "change-gate",
      "input",
      "Root V2 complete build requires an exact accessor-free input",
    ))
  }
  if (
    envelope.inputAuthority !== "core-synthetic-qa-only"
    || (
      constructionKind !== "complete-bootstrap"
      && constructionKind !== "complete-fallback"
    )
  ) {
    return blocked(work, issue(
      "caller-authority-forbidden",
      "change-gate",
      "inputAuthority",
      "Root V2 complete build accepts only Core synthetic QA authority",
    ))
  }
  if (envelope.bindProductionLayout === true) {
    return blocked(work, issue(
      "caller-authority-forbidden",
      "atomic-acceptance",
      "bindProductionLayout",
      "Root V2 complete build cannot bind production layout",
    ))
  }
  if (!validWorkPolicy(workPolicy)) {
    return blocked(work, issue(
      "invalid-work-policy",
      "change-gate",
      "workPolicy",
      "Root V2 requires the exact frozen 5B-1 work policy",
    ))
  }
  const initialInspection =
    inspectVNextTextBlockInitialFlowV1(envelope.initialFlow)
  if (initialInspection.status !== "valid") {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "source-flow",
      "initialFlow",
      initialInspection.message,
    ))
  }
  const evidenceInspection =
    inspectVNextTextBlockFlowEvidenceV2(envelope.evidence)
  if (
    evidenceInspection.status !== "valid"
    || !hasVNextTextBlockFlowEvidenceBindingInternalV2(
      envelope.evidence as VNextTextBlockFlowEvidenceV2,
      envelope.initialFlow as VNextTextBlockInitialFlowV1,
    )
  ) {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "evidence",
      "evidence",
      evidenceInspection.status === "valid"
        ? "evidence is not bound to the exact Initial Flow"
        : evidenceInspection.message,
    ))
  }
  const initialFlow = envelope.initialFlow as VNextTextBlockInitialFlowV1
  const evidence = envelope.evidence as VNextTextBlockFlowEvidenceV2
  const entries = envelope.spatialEntries as
    readonly VNextTextBlockSyntheticPositionedObjectInputV1[]

  const source = createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1({
    initialFlow,
    evidence,
  })
  if (source.status !== "prepared") {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "source-flow",
      "sourceState",
      source.issues[0]?.message ?? "source state complete build blocked",
    ))
  }
  work = {
    ...work,
    completeSourceItemVisitCount: source.sourceState.summary.itemCount,
  }
  let sourceEnvelope:
    | Extract<
        VNextTextBlockSourceWorkEnvelopeEvaluationInternalV1,
        { readonly status: "accepted" }
      >
    | null = null
  const sourceEnvelopeFacts =
    inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1(
      source.sourceState,
    )
  if (isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(workPolicy)) {
    const evaluation = sourceEnvelopeFacts == null
      ? null
      : evaluateVNextTextBlockSourceWorkEnvelopeInternalV1({
          policy: workPolicy,
          ...sourceEnvelopeFacts,
        })
    sourceEnvelopeObserver?.(Object.freeze({
      constructionKind,
      status: evaluation?.status ?? "invalid-policy",
      sourceItemCount: sourceEnvelopeFacts?.sourceItemCount ?? null,
      treeHeight: sourceEnvelopeFacts?.treeHeight ?? null,
    }))
    if (evaluation?.status !== "accepted") {
      return blocked(work, issue(
        "source-work-envelope-exceeded",
        "source-flow",
        "sourceState.sourceEnvelope",
        "complete Root V2 source state exceeds the exact V3 source work envelope",
      ))
    }
    sourceEnvelope = evaluation
  }
  const flow = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
    sourceState: source.sourceState,
    evidence,
  })
  if (flow.status !== "prepared") {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "source-flow",
      "flowTree",
      flow.issues[0]?.message ?? "flow tree complete build blocked",
    ))
  }
  work = {
    ...work,
    completeFlowAtomVisitCount: flow.flowTree.summary.atomCount,
  }
  const spatial =
    createVNextTextBlockUnifiedSpatialStateCompleteInternalV1({
      sourceState: source.sourceState,
      entries,
    })
  if (spatial.status !== "prepared") {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "spatial-index",
      "spatialState",
      spatial.issues[0]?.message ?? "spatial state complete build blocked",
    ))
  }
  work = {
    ...work,
    completeSpatialEntryVisitCount: entries.length,
  }

  const legacyFlow = createVNextTextBlockPersistentFlowTreeV2({
    initialFlow,
    evidence,
  })
  if (legacyFlow.status !== "accepted") {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "source-flow",
      "ephemeralPersistentFlowTree",
      `ephemeral complete flow blocked: ${legacyFlow.issues[0]?.code ?? "unknown"}`,
    ))
  }
  const legacySpatial = createVNextTextBlockSpatialIndexV2({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow,
    evidence,
    persistentFlowTree: legacyFlow.tree,
    entries,
  })
  if (legacySpatial.status !== "accepted") {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "spatial-index",
      "ephemeralSpatialIndex",
      `ephemeral spatial index blocked: ${legacySpatial.issues[0]?.code ?? "unknown"}`,
    ))
  }
  const spatialLayout = layoutVNextTextBlockSpatialWrappingV2({
    initialFlow,
    evidence,
    persistentFlowTree: legacyFlow.tree,
    spatialIndex: legacySpatial.index,
    startYLayoutUnit: 0,
  })
  if (spatialLayout.status !== "accepted") {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "layout-reconvergence",
      "ephemeralSpatialLayout",
      `ephemeral spatial layout blocked: ${spatialLayout.issues[0]?.code ?? "unknown"}`,
    ))
  }
  const geometry =
    projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2({
      initialFlow,
      evidence,
      persistentFlowTree: legacyFlow.tree,
      spatialIndex: legacySpatial.index,
      spatialLayout,
    })
  if (geometry.status !== "accepted") {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "geometry",
      "ephemeralAuthoredBoxGeometry",
      `ephemeral authored geometry blocked: ${geometry.issues[0]?.code ?? "unknown"}`,
    ))
  }
  const lines =
    createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1({
      sourceState: source.sourceState,
      flowTree: flow.flowTree,
      spatialState: spatial.spatialState,
      spatialLayout,
      authoredBoxGeometry: geometry,
    })
  if (lines.status !== "prepared") {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "layout-reconvergence",
      "lineTree",
      lines.issues[0]?.message ?? "persistent line tree blocked",
    ))
  }
  work = {
    ...work,
    completeLineVisitCount: lines.lineTree.summary.lineCount,
    completeFragmentVisitCount: lines.lineTree.summary.fragmentCount,
  }
  const scene = createVNextTextBlockPersistentSceneCompleteInternalV2({
    lineTree: lines.lineTree,
    sourceState: source.sourceState,
  })
  if (scene.status !== "prepared") {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "scene",
      "persistentScene",
      scene.issues[0]?.message ?? "Persistent Scene V2 blocked",
    ))
  }
  work = Object.freeze({
    ...work,
    completeRootV2BuildCount: 1,
    completeSceneNodeVisitCount: scene.scene.root.summary.nodeCount,
    completeSceneProjectionCount: 1,
    completeChildGraphTraversalCount: 7,
    completeChildRehashCount: 0,
  })

  const provider = flowRegionProviderAuthority(
    spatial.spatialState.fingerprint,
    flow.flowTree.layoutContextFingerprint,
  )
  const boxSummary = authoredBoxSummary({
    authoredBoxPlanFingerprint:
      source.sourceState.authoredBoxPlan.fingerprint,
    contentLeftLayoutUnit: geometry.geometry.contentOriginXLayoutUnit,
    contentWidthLayoutUnit: geometry.geometry.contentWidthLayoutUnit,
    outerWidthLayoutUnit: geometry.geometry.outerWidthLayoutUnit,
    outerHeightLayoutUnit: geometry.geometry.outerHeightLayoutUnit,
    lineCount: lines.lineTree.summary.lineCount,
    authoredGeometryFingerprint:
      lines.lineTree.summary.authoredBoxGeometryFingerprint,
  })
  const semanticDependencyFingerprints =
    deriveVNextTextBlockUnifiedLayoutRootSemanticDependencyFingerprintsInternalV2({
      sourceState: source.sourceState,
      flowTree: flow.flowTree,
      spatialState: spatial.spatialState,
      flowRegionProviderAuthority: provider,
      lineTree: lines.lineTree,
      authoredBoxSummary: boxSummary,
      persistentScene: scene.scene,
  })
  const dependencyFingerprints = Object.freeze({
    sourceState: source.sourceState.fingerprint,
    flowTree: flow.flowTree.fingerprint,
    spatialState: spatial.spatialState.fingerprint,
    flowRegionProviderAuthority: provider.fingerprint,
    lineTree: lines.lineTree.fingerprint,
    authoredBoxSummary: boxSummary.fingerprint,
    persistentScene: scene.scene.fingerprint,
    workPolicy: workPolicy.fingerprint,
  })
  const constructionFingerprint = fingerprint({
    constructionKind,
    initialFlowFingerprint: initialFlow.fingerprint,
    evidenceFingerprint: evidence.fingerprint,
    spatialEntrySetFingerprint:
      spatial.spatialState.entrySetFingerprint,
    dependencyFingerprints,
  })
  const facts = {
    source: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_VERSION,
    inputAuthority: "core-synthetic-qa-only" as const,
    documentId: source.sourceState.documentId,
    instanceRevision: source.sourceState.instanceRevision,
    sectionId: source.sourceState.sectionId,
    textBlockId: source.sourceState.textBlockId,
    layoutId: flow.flowTree.layoutId,
    sourceState: source.sourceState,
    flowTree: flow.flowTree,
    spatialState: spatial.spatialState,
    flowRegionProviderAuthority: provider,
    lineTree: lines.lineTree,
    authoredBoxSummary: boxSummary,
    persistentScene: scene.scene,
    workPolicy,
    semanticDependencyFingerprints,
    dependencyFingerprints,
    constructionKind: constructionKind as
      VNextTextBlockUnifiedLayoutRootConstructionKindV2,
    constructionFingerprint,
    contracts: Object.freeze({
      unifiedTextBlockAuthority: true as const,
      processLocalImmutableRoot: true as const,
      persistentIncrementalTransition: true as const,
      completeNextInputOnHotPath: false as const,
      stagedEditorApply: false as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    }),
    stagedEditorApply: false as const,
    mayPublishLayout: false as const,
    productionBinding: false as const,
  }
  const pending = {
    ...facts,
    semanticFingerprint: "",
    fingerprint: "",
  } satisfies VNextTextBlockUnifiedLayoutRootV2
  const semanticFingerprint = createVNextCompactFingerprint(
    canonicalVNextTextBlockUnifiedLayoutRootSemanticFactsInternalV2(
      pending,
    ),
  )
  const root = Object.freeze({
    ...facts,
    semanticFingerprint,
    fingerprint: createVNextCompactFingerprint(
      canonicalVNextTextBlockUnifiedLayoutRootFactsInternalV2({
        ...pending,
        semanticFingerprint,
      }),
    ),
  })
  if (
    sourceEnvelope != null
    && sourceEnvelopeFacts != null
    && !prepareVNextTextBlockRootSourceEnvelopeBindingInternalV1({
      root,
      facts: sourceEnvelopeFacts,
      effectiveLimits: sourceEnvelope.effectiveLimits,
    })
  ) {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "atomic-acceptance",
      "root.sourceEnvelope",
      "Root V2 candidate failed exact source-envelope preparation",
    ))
  }
  if (
    !prepareVNextTextBlockUnifiedLayoutRootGraphCandidateBindingInternalV2(
      root,
    )
  ) {
    return blocked(work, issue(
      "atomic-acceptance-failed",
      "atomic-acceptance",
      "root",
      "Root V2 candidate failed exact cross-dependency preparation",
    ))
  }
  return Object.freeze({
    status: "prepared",
    root,
    persistentScene: root.persistentScene,
    deliveryPlan: null,
    completeBuildWork: work,
    issues: Object.freeze([]) as readonly [],
  })
}

export function getVNextTextBlockRootSourceEnvelopeAuthorityInternalV1(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockRootSourceEnvelopeAuthorityInternalV1 | null {
  return getVNextTextBlockRootSourceEnvelopeRecordInternalV1(root)
    ?.authority ?? null
}

export function createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
  input: VNextTextBlockUnifiedLayoutRootBuildInputV2,
  workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1,
): VNextTextBlockUnifiedLayoutRootResultV2
export function createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
  input: unknown,
  workPolicy: unknown,
): VNextTextBlockUnifiedLayoutRootResultV2
export function createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
  input: unknown,
  workPolicy: unknown,
): VNextTextBlockUnifiedLayoutRootResultV2 {
  const prepared =
    prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(
      input,
      workPolicy,
      "complete-bootstrap",
    )
  if (prepared.status !== "prepared") return prepared
  const registration =
    registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(
      prepared.root,
    )
  if (registration.status !== "committed") {
    return blocked(prepared.completeBuildWork, issue(
      "atomic-acceptance-failed",
      "atomic-acceptance",
      "root",
      registration.message,
    ))
  }
  return Object.freeze({
    status: "accepted",
    root: prepared.root,
    persistentScene: prepared.persistentScene,
    deliveryPlan: null,
    completeBuildWork: prepared.completeBuildWork,
    issues: Object.freeze([]) as readonly [],
  })
}

export function prepareVNextTextBlockUnifiedLayoutRootIncrementalCandidateInternalV2(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly nextSourceState:
      VNextTextBlockUnifiedLayoutRootV2["sourceState"]
    readonly nextPersistentScene:
      VNextTextBlockUnifiedLayoutRootV2["persistentScene"]
    readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
    readonly transitionFingerprint: string
  },
):
  | {
      readonly status: "prepared"
      readonly root: VNextTextBlockUnifiedLayoutRootV2
      readonly issues: readonly []
    }
  | {
      readonly status: "blocked"
      readonly root: null
      readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[]
    } {
  const previousInspection =
    inspectVNextTextBlockUnifiedLayoutRootBindingInternalV2(
      input.previousRoot,
    )
  if (
    previousInspection.status !== "valid"
    || input.workPolicy !== input.previousRoot.workPolicy
    || input.transitionFingerprint.length === 0
  ) {
    return {
      status: "blocked",
      root: null,
      issues: [issue(
        "previous-root-authority-mismatch",
        "atomic-acceptance",
        "previousRoot",
        "incremental Root V2 requires one exact previous Root/policy",
      )],
    }
  }
  let nextSourceEnvelope:
    | {
        readonly facts: NonNullable<
          ReturnType<
            typeof inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1
          >
        >
        readonly evaluation: Extract<
          VNextTextBlockSourceWorkEnvelopeEvaluationInternalV1,
          { readonly status: "accepted" }
        >
      }
    | null = null
  if (isExactVNextTextBlockUnifiedLayoutWorkPolicyInternalV1(input.workPolicy)) {
    const previousEnvelope =
      getVNextTextBlockRootSourceEnvelopeRecordInternalV1(
        input.previousRoot,
      )
    const nextFacts =
      inspectVNextTextBlockPreparedSourceEnvelopeFactsInternalV1(
        input.nextSourceState,
      )
    const evaluation = nextFacts == null
      ? null
      : evaluateVNextTextBlockSourceWorkEnvelopeInternalV1({
          policy: input.workPolicy,
          ...nextFacts,
        })
    if (
      previousEnvelope == null
      || previousEnvelope.root !== input.previousRoot
      || previousEnvelope.sourceState !== input.previousRoot.sourceState
      || previousEnvelope.workPolicy !== input.workPolicy
      || nextFacts == null
      || evaluation?.status !== "accepted"
      || nextFacts.sourceItemCount
        !== previousEnvelope.facts.sourceItemCount
      || nextFacts.treeHeight !== previousEnvelope.facts.treeHeight
      || nextFacts.maximumLeafOccupancy
        !== previousEnvelope.facts.maximumLeafOccupancy
      || nextFacts.deliberateItemResolutionCount
        !== previousEnvelope.facts.deliberateItemResolutionCount
    ) {
      return {
        status: "blocked",
        root: null,
        issues: [issue(
          "previous-root-authority-mismatch",
          "source-flow",
          "previousRoot.sourceEnvelope",
          "incremental Root V2 requires exact source-envelope continuity",
        )],
      }
    }
    nextSourceEnvelope = { facts: nextFacts, evaluation }
  }
  const semanticDependencyFingerprints =
    deriveVNextTextBlockUnifiedLayoutRootSemanticDependencyFingerprintsInternalV2({
      sourceState: input.nextSourceState,
      flowTree: input.previousRoot.flowTree,
      spatialState: input.previousRoot.spatialState,
      flowRegionProviderAuthority:
        input.previousRoot.flowRegionProviderAuthority,
      lineTree: input.previousRoot.lineTree,
      authoredBoxSummary: input.previousRoot.authoredBoxSummary,
      persistentScene: input.nextPersistentScene,
  })
  const dependencyFingerprints = Object.freeze({
    sourceState: input.nextSourceState.fingerprint,
    flowTree: input.previousRoot.flowTree.fingerprint,
    spatialState: input.previousRoot.spatialState.fingerprint,
    flowRegionProviderAuthority:
      input.previousRoot.flowRegionProviderAuthority.fingerprint,
    lineTree: input.previousRoot.lineTree.fingerprint,
    authoredBoxSummary:
      input.previousRoot.authoredBoxSummary.fingerprint,
    persistentScene: input.nextPersistentScene.fingerprint,
    workPolicy: input.workPolicy.fingerprint,
  })
  const constructionFingerprint = fingerprint({
    constructionKind: "incremental",
    previousRootFingerprint: input.previousRoot.fingerprint,
    transitionFingerprint: input.transitionFingerprint,
    dependencyFingerprints,
  })
  const facts = {
    source: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V2_VERSION,
    inputAuthority: "core-synthetic-qa-only" as const,
    documentId: input.previousRoot.documentId,
    instanceRevision: input.nextSourceState.instanceRevision,
    sectionId: input.previousRoot.sectionId,
    textBlockId: input.previousRoot.textBlockId,
    layoutId: input.previousRoot.layoutId,
    sourceState: input.nextSourceState,
    flowTree: input.previousRoot.flowTree,
    spatialState: input.previousRoot.spatialState,
    flowRegionProviderAuthority:
      input.previousRoot.flowRegionProviderAuthority,
    lineTree: input.previousRoot.lineTree,
    authoredBoxSummary: input.previousRoot.authoredBoxSummary,
    persistentScene: input.nextPersistentScene,
    workPolicy: input.workPolicy,
    semanticDependencyFingerprints,
    dependencyFingerprints,
    constructionKind: "incremental" as const,
    constructionFingerprint,
    contracts: input.previousRoot.contracts,
    stagedEditorApply: false as const,
    mayPublishLayout: false as const,
    productionBinding: false as const,
  }
  const pending = {
    ...facts,
    semanticFingerprint: "",
    fingerprint: "",
  } satisfies VNextTextBlockUnifiedLayoutRootV2
  const semanticFingerprint = createVNextCompactFingerprint(
    canonicalVNextTextBlockUnifiedLayoutRootSemanticFactsInternalV2(
      pending,
    ),
  )
  const root = Object.freeze({
    ...facts,
    semanticFingerprint,
    fingerprint: createVNextCompactFingerprint(
      canonicalVNextTextBlockUnifiedLayoutRootFactsInternalV2({
        ...pending,
        semanticFingerprint,
      }),
    ),
  })
  if (
    nextSourceEnvelope != null
    && !prepareVNextTextBlockRootSourceEnvelopeBindingInternalV1({
      root,
      facts: nextSourceEnvelope.facts,
      effectiveLimits: nextSourceEnvelope.evaluation.effectiveLimits,
    })
  ) {
    return {
      status: "blocked",
      root: null,
      issues: [issue(
        "atomic-acceptance-failed",
        "atomic-acceptance",
        "root.sourceEnvelope",
        "incremental Root V2 failed exact source-envelope preparation",
      )],
    }
  }
  if (
    !prepareVNextTextBlockUnifiedLayoutRootGraphCandidateBindingInternalV2(
      root,
    )
  ) {
    return {
      status: "blocked",
      root: null,
      issues: [issue(
        "atomic-acceptance-failed",
        "atomic-acceptance",
        "root",
        "incremental Root V2 dependencies failed exact candidate binding",
      )],
    }
  }
  return Object.freeze({
    status: "prepared",
    root,
    issues: Object.freeze([]) as readonly [],
  })
}

export function inspectVNextTextBlockUnifiedLayoutRootV2(
  value: unknown,
): VNextTextBlockUnifiedLayoutRootInspectionV2 {
  return inspectVNextTextBlockUnifiedLayoutRootBindingInternalV2(value)
}

export function createVNextTextBlockUnifiedLayoutRootV2(
  input: VNextTextBlockUnifiedLayoutRootBuildInputV2,
): VNextTextBlockUnifiedLayoutRootResultV2
export function createVNextTextBlockUnifiedLayoutRootV2(
  input: unknown,
): VNextTextBlockUnifiedLayoutRootResultV2
export function createVNextTextBlockUnifiedLayoutRootV2(
  input: unknown,
): VNextTextBlockUnifiedLayoutRootResultV2 {
  return createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
    input,
    VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
  )
}
