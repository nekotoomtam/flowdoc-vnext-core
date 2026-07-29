import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2,
} from "./textBlockAuthoredBoxGeometryV2.js"
import type { VNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceContractV2.js"
import {
  hasVNextTextBlockFlowEvidenceBindingInternalV2,
  inspectVNextTextBlockFlowEvidenceV2,
} from "./textBlockFlowEvidenceV2.js"
import {
  inspectVNextTextBlockInitialFlowV1,
  type VNextTextBlockInitialFlowV1,
} from "./textBlockInitialFlowInputV1.js"
import { createVNextTextBlockPersistentFlowTreeV2 } from "./textBlockPersistentFlowTreeV2.js"
import type { VNextTextBlockPersistentFlowTreeV2 } from "./textBlockPersistentFlowContractV2.js"
import {
  createVNextTextBlockSpatialIndexV2,
} from "./textBlockSpatialIndexV2.js"
import type { VNextTextBlockSyntheticPositionedObjectInputV1 } from "./textBlockSpatialIndexContractV1.js"
import {
  spatialFingerprintV1,
} from "./textBlockSpatialIndexInternalsV1.js"
import { layoutVNextTextBlockSpatialWrappingV2 } from "./textBlockSpatialWrappingLayoutV2.js"
import {
  registerVNextTextBlockUnifiedLayoutRootInternalV1,
  inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1,
} from "./textBlockUnifiedLayoutRootAuthorityInternalsV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_SOURCE,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_VERSION,
  type VNextTextBlockUnifiedLayoutRootInspectionV1,
  type VNextTextBlockUnifiedLayoutRootIssueCodeV1,
  type VNextTextBlockUnifiedLayoutRootResultV1,
  type VNextTextBlockUnifiedLayoutRootV1,
} from "./textBlockUnifiedLayoutRootContractV1.js"
import { projectVNextTextBlockUnifiedLayoutSceneV1 } from "./textBlockUnifiedLayoutSceneV1.js"

export interface VNextTextBlockUnifiedLayoutRootBuildInputV1 {
  inputAuthority: "core-synthetic-qa-only"
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  spatialEntries: readonly VNextTextBlockSyntheticPositionedObjectInputV1[]
  bindProductionLayout?: boolean
}

type StrictInput = VNextTextBlockUnifiedLayoutRootBuildInputV1

function issue(
  code: VNextTextBlockUnifiedLayoutRootIssueCodeV1,
  path: string,
  message: string,
) {
  return { code, severity: "error" as const, path, message }
}

function blocked(
  code: VNextTextBlockUnifiedLayoutRootIssueCodeV1,
  path: string,
  message: string,
): VNextTextBlockUnifiedLayoutRootResultV1 {
  return { status: "blocked", root: null, scene: null, issues: [issue(code, path, message)] }
}

function strictInput(value: unknown): StrictInput | null {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) return null
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(value).length !== 0) return null
    const required = ["inputAuthority", "initialFlow", "evidence", "spatialEntries"] as const
    const allowed = [...required, "bindProductionLayout"]
    const keys = Reflect.ownKeys(value)
    if (
      keys.length < required.length
      || keys.length > allowed.length
      || required.some((key) => !keys.includes(key))
      || keys.some((key) => typeof key !== "string" || !allowed.includes(key))
    ) return null
    const values: Record<string, unknown> = Object.create(null)
    for (const key of keys) {
      if (typeof key !== "string") return null
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) return null
      values[key] = descriptor.value
    }
    if (
      typeof values.inputAuthority !== "string"
      || values.initialFlow === undefined
      || values.evidence === undefined
      || !Array.isArray(values.spatialEntries)
    ) return null
    if (Object.hasOwn(values, "bindProductionLayout") && typeof values.bindProductionLayout !== "boolean") {
      return null
    }
    return values as unknown as StrictInput
  } catch {
    return null
  }
}

function canonicalRootFacts(root: VNextTextBlockUnifiedLayoutRootV1): string {
  return stringifyVNextCanonicalJson({
    source: root.source,
    contractVersion: root.contractVersion,
    inputAuthority: root.inputAuthority,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    instanceRevision: root.instanceRevision,
    layoutId: root.layoutId,
    flowRegionProviderAuthority: root.flowRegionProviderAuthority,
    dependencyFingerprints: root.dependencyFingerprints,
    work: root.work,
    contracts: root.contracts,
    mayPublishLayout: root.mayPublishLayout,
    productionBinding: root.productionBinding,
  })
}

function rootFingerprintFacts(root: VNextTextBlockUnifiedLayoutRootV1): unknown {
  return {
    source: root.source,
    contractVersion: root.contractVersion,
    inputAuthority: root.inputAuthority,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    instanceRevision: root.instanceRevision,
    layoutId: root.layoutId,
    dependencyFingerprints: {
      initialFlow: root.dependencyFingerprints.initialFlow,
      evidence: root.dependencyFingerprints.evidence,
      persistentFlowTree: root.dependencyFingerprints.persistentFlowTree,
      spatialIndex: root.dependencyFingerprints.spatialIndex,
      flowRegionProviderAuthority: root.dependencyFingerprints.flowRegionProviderAuthority,
      spatialLayout: root.dependencyFingerprints.spatialLayout,
      authoredBoxGeometry: root.dependencyFingerprints.authoredBoxGeometry,
      scene: root.dependencyFingerprints.scene,
    },
    work: {
      topLevelDependencyCount: root.work.topLevelDependencyCount,
      completeChildGraphTraversalCount: root.work.completeChildGraphTraversalCount,
      completeChildRehashCount: root.work.completeChildRehashCount,
      rootWrapperAllocationCount: root.work.rootWrapperAllocationCount,
    },
    contracts: {
      unifiedTextBlockAuthority: root.contracts.unifiedTextBlockAuthority,
      textAndInlineImageV2: root.contracts.textAndInlineImageV2,
      processLocalImmutableRoot: root.contracts.processLocalImmutableRoot,
      compositionalRootFingerprint: root.contracts.compositionalRootFingerprint,
      incrementalTransitionClaim: root.contracts.incrementalTransitionClaim,
      stagedEditorApply: root.contracts.stagedEditorApply,
      mayPublishLayout: root.contracts.mayPublishLayout,
      productionBinding: root.contracts.productionBinding,
    },
    mayPublishLayout: root.mayPublishLayout,
    productionBinding: root.productionBinding,
  }
}

export function createVNextTextBlockUnifiedLayoutRootV1(
  input: VNextTextBlockUnifiedLayoutRootBuildInputV1,
): VNextTextBlockUnifiedLayoutRootResultV1
export function createVNextTextBlockUnifiedLayoutRootV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutRootResultV1
export function createVNextTextBlockUnifiedLayoutRootV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutRootResultV1 {
  const envelope = strictInput(input)
  if (envelope == null) return blocked("invalid-input", "input", "unified layout root requires a strict accessor-free data envelope")
  if (envelope.inputAuthority !== "core-synthetic-qa-only") return blocked("input-authority-mismatch", "inputAuthority", "unified layout root accepts strict Core synthetic QA inputs only")
  if (envelope.bindProductionLayout === true) return blocked("production-binding-forbidden", "bindProductionLayout", "unified layout root cannot bind production layout")

  const initialInspection = inspectVNextTextBlockInitialFlowV1(envelope.initialFlow)
  if (initialInspection.status !== "valid") return blocked("initial-flow-provenance-mismatch", "initialFlow", initialInspection.message)
  const evidenceInspection = inspectVNextTextBlockFlowEvidenceV2(envelope.evidence)
  if (
    evidenceInspection.status !== "valid"
    || !hasVNextTextBlockFlowEvidenceBindingInternalV2(envelope.evidence, envelope.initialFlow)
    || envelope.evidence.initialFlowFingerprint !== envelope.initialFlow.fingerprint
  ) return blocked("flow-evidence-provenance-mismatch", "evidence", evidenceInspection.status === "valid"
    ? "unified layout root requires exact evidence bound to the exact Initial Flow"
    : evidenceInspection.message)

  const treeResult = createVNextTextBlockPersistentFlowTreeV2({
    initialFlow: envelope.initialFlow,
    evidence: envelope.evidence,
  })
  if (treeResult.status !== "accepted") return blocked("persistent-flow-tree-blocked", "persistentFlowTree", `persistent V2 flow tree blocked: ${treeResult.issues[0]?.code ?? "unknown"}`)
  const persistentFlowTree: VNextTextBlockPersistentFlowTreeV2 = treeResult.tree

  const indexResult = createVNextTextBlockSpatialIndexV2({
    inputAuthority: envelope.inputAuthority,
    initialFlow: envelope.initialFlow,
    evidence: envelope.evidence,
    persistentFlowTree,
    entries: envelope.spatialEntries,
  })
  if (indexResult.status !== "accepted") return blocked("spatial-index-blocked", "spatialEntries", `spatial V2 index blocked: ${indexResult.issues[0]?.code ?? "unknown"}`)

  const spatialLayout = layoutVNextTextBlockSpatialWrappingV2({
    initialFlow: envelope.initialFlow,
    evidence: envelope.evidence,
    persistentFlowTree,
    spatialIndex: indexResult.index,
    startYLayoutUnit: 0,
  })
  if (spatialLayout.status !== "accepted") return blocked("spatial-layout-blocked", "spatialLayout", `spatial wrapping blocked: ${spatialLayout.issues[0]?.code ?? "unknown"}`)

  const authoredBoxGeometry = projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2({
    initialFlow: envelope.initialFlow,
    evidence: envelope.evidence,
    persistentFlowTree,
    spatialIndex: indexResult.index,
    spatialLayout,
  })
  if (authoredBoxGeometry.status !== "accepted") return blocked("authored-box-geometry-blocked", "authoredBoxGeometry", `authored box geometry blocked: ${authoredBoxGeometry.issues[0]?.code ?? "unknown"}`)

  const sceneResult = projectVNextTextBlockUnifiedLayoutSceneV1({ authoredBoxGeometry })
  if (sceneResult.status !== "accepted") return blocked("unified-layout-scene-blocked", "scene", `unified layout scene blocked: ${sceneResult.issues[0]?.code ?? "unknown"}`)

  const flowRegionProviderAuthority = Object.freeze({
    source: "vnext-text-block-flow-region-v2" as const,
    contractVersion: 2 as const,
    spatialIndexFingerprint: indexResult.index.fingerprint,
    fingerprint: spatialFingerprintV1({
      source: "vnext-text-block-flow-region-v2",
      contractVersion: 2,
      spatialIndexFingerprint: indexResult.index.fingerprint,
    }),
  })
  const dependencyFingerprints = Object.freeze({
    initialFlow: envelope.initialFlow.fingerprint,
    evidence: envelope.evidence.fingerprint,
    persistentFlowTree: persistentFlowTree.fingerprint,
    spatialIndex: indexResult.index.fingerprint,
    flowRegionProviderAuthority: flowRegionProviderAuthority.fingerprint,
    spatialLayout: spatialLayout.fingerprint,
    authoredBoxGeometry: authoredBoxGeometry.fingerprint,
    scene: sceneResult.scene.fingerprint,
  })
  const rootFacts = {
    source: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_VERSION,
    inputAuthority: "core-synthetic-qa-only" as const,
    documentId: envelope.initialFlow.documentId,
    sectionId: envelope.initialFlow.sectionId,
    textBlockId: envelope.initialFlow.textBlockId,
    instanceRevision: envelope.initialFlow.instanceRevision,
    layoutId: envelope.evidence.layoutId,
    initialFlow: envelope.initialFlow,
    evidence: envelope.evidence,
    persistentFlowTree,
    spatialIndex: indexResult.index,
    flowRegionProviderAuthority,
    spatialLayout,
    authoredBoxGeometry,
    scene: sceneResult.scene,
    dependencyFingerprints,
    work: Object.freeze({
      topLevelDependencyCount: 8 as const,
      completeChildGraphTraversalCount: 0 as const,
      completeChildRehashCount: 0 as const,
      rootWrapperAllocationCount: 1 as const,
    }),
    contracts: Object.freeze({
      unifiedTextBlockAuthority: true as const,
      textAndInlineImageV2: true as const,
      processLocalImmutableRoot: true as const,
      compositionalRootFingerprint: true as const,
      incrementalTransitionClaim: false as const,
      stagedEditorApply: false as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    }),
    mayPublishLayout: false as const,
    productionBinding: false as const,
  } satisfies Omit<VNextTextBlockUnifiedLayoutRootV1, "fingerprint">
  const fingerprint = spatialFingerprintV1(rootFingerprintFacts({ ...rootFacts, fingerprint: "pending" }))
  const root = Object.freeze({ ...rootFacts, fingerprint })
  registerVNextTextBlockUnifiedLayoutRootInternalV1({
    root,
    initialFlow: envelope.initialFlow,
    evidence: envelope.evidence,
    persistentFlowTree,
    spatialIndex: indexResult.index,
    spatialLayout,
    authoredBoxGeometry,
    scene: sceneResult.scene,
    canonicalRootFacts: canonicalRootFacts(root),
  })
  return { status: "accepted", root, issues: [] }
}

export function inspectVNextTextBlockUnifiedLayoutRootV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutRootInspectionV1 {
  return inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1(value)
}
