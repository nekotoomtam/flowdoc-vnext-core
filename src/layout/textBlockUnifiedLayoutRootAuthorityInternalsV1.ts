import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type { VNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceContractV2.js"
import type { VNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import type { VNextTextBlockPersistentFlowTreeV2 } from "./textBlockPersistentFlowContractV2.js"
import type { VNextTextBlockSpatialIndexV2 } from "./textBlockSpatialIndexContractV2.js"
import type { VNextTextBlockSpatialWrappingLayoutResultV2 } from "./textBlockSpatialWrappingLayoutContractV2.js"
import type { VNextTextBlockAuthoredBoxGeometryResultV2 } from "./textBlockAuthoredBoxGeometryContractV2.js"
import type { VNextTextBlockUnifiedLayoutSceneV1 } from "./textBlockUnifiedLayoutSceneContractV1.js"
import type {
  VNextTextBlockUnifiedLayoutRootInspectionV1,
  VNextTextBlockUnifiedLayoutRootV1,
} from "./textBlockUnifiedLayoutRootContractV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_SOURCE,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_VERSION,
} from "./textBlockUnifiedLayoutRootContractV1.js"

interface RootBindingV1 {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  spatialIndex: VNextTextBlockSpatialIndexV2
  flowRegionProviderAuthority: VNextTextBlockUnifiedLayoutRootV1["flowRegionProviderAuthority"]
  spatialLayout: Extract<VNextTextBlockSpatialWrappingLayoutResultV2, { status: "accepted" }>
  authoredBoxGeometry: Extract<VNextTextBlockAuthoredBoxGeometryResultV2, { status: "accepted" }>
  scene: VNextTextBlockUnifiedLayoutSceneV1
  dependencyFingerprints: VNextTextBlockUnifiedLayoutRootV1["dependencyFingerprints"]
  rootFingerprint: string
  canonicalRootFacts: string
}

const roots = new WeakMap<object, RootBindingV1>()

const ROOT_KEYS = [
  "source",
  "contractVersion",
  "inputAuthority",
  "documentId",
  "sectionId",
  "textBlockId",
  "instanceRevision",
  "layoutId",
  "initialFlow",
  "evidence",
  "persistentFlowTree",
  "spatialIndex",
  "flowRegionProviderAuthority",
  "spatialLayout",
  "authoredBoxGeometry",
  "scene",
  "dependencyFingerprints",
  "work",
  "contracts",
  "mayPublishLayout",
  "productionBinding",
  "fingerprint",
] as const

const FLOW_REGION_PROVIDER_AUTHORITY_KEYS = [
  "source",
  "contractVersion",
  "spatialIndexFingerprint",
  "fingerprint",
] as const

const DEPENDENCY_FINGERPRINT_KEYS = [
  "initialFlow",
  "evidence",
  "persistentFlowTree",
  "spatialIndex",
  "flowRegionProviderAuthority",
  "spatialLayout",
  "authoredBoxGeometry",
  "scene",
] as const

const WORK_KEYS = [
  "topLevelDependencyCount",
  "completeChildGraphTraversalCount",
  "completeChildRehashCount",
  "rootWrapperAllocationCount",
] as const

const CONTRACT_KEYS = [
  "unifiedTextBlockAuthority",
  "textAndInlineImageV2",
  "processLocalImmutableRoot",
  "compositionalRootFingerprint",
  "incrementalTransitionClaim",
  "stagedEditorApply",
  "mayPublishLayout",
  "productionBinding",
] as const

function hasExactDataProperties(value: object, keys: readonly string[]): boolean {
  try {
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
      return false
    }
    if (Object.getOwnPropertySymbols(value).length !== 0) return false
    const ownKeys = Reflect.ownKeys(value)
    if (ownKeys.length !== keys.length || ownKeys.some((key) => typeof key !== "string" || !keys.includes(key))) {
      return false
    }
    return keys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      return descriptor != null && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true
    })
  } catch {
    return false
  }
}

function rootOwnedWrappersAreExactAndFrozen(root: VNextTextBlockUnifiedLayoutRootV1): boolean {
  return Object.isFrozen(root)
    && Object.isFrozen(root.flowRegionProviderAuthority)
    && Object.isFrozen(root.dependencyFingerprints)
    && Object.isFrozen(root.work)
    && Object.isFrozen(root.contracts)
    && hasExactDataProperties(
      root.flowRegionProviderAuthority,
      FLOW_REGION_PROVIDER_AUTHORITY_KEYS,
    )
    && hasExactDataProperties(root.dependencyFingerprints, DEPENDENCY_FINGERPRINT_KEYS)
    && hasExactDataProperties(root.work, WORK_KEYS)
    && hasExactDataProperties(root.contracts, CONTRACT_KEYS)
}

function rootClaimsAreFixed(root: VNextTextBlockUnifiedLayoutRootV1): boolean {
  return root.source === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_SOURCE
    && root.contractVersion === VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_VERSION
    && root.inputAuthority === "core-synthetic-qa-only"
    && root.flowRegionProviderAuthority.source === "vnext-text-block-flow-region-v2"
    && root.flowRegionProviderAuthority.contractVersion === 2
    && root.work.topLevelDependencyCount === 8
    && root.work.completeChildGraphTraversalCount === 0
    && root.work.completeChildRehashCount === 0
    && root.work.rootWrapperAllocationCount === 1
    && root.contracts.unifiedTextBlockAuthority === true
    && root.contracts.textAndInlineImageV2 === true
    && root.contracts.processLocalImmutableRoot === true
    && root.contracts.compositionalRootFingerprint === true
    && root.contracts.incrementalTransitionClaim === false
    && root.contracts.stagedEditorApply === false
    && root.contracts.mayPublishLayout === false
    && root.contracts.productionBinding === false
    && root.mayPublishLayout === false
    && root.productionBinding === false
}

function rootOwnedCanonicalFacts(root: VNextTextBlockUnifiedLayoutRootV1): string {
  return stringifyVNextCanonicalJson({
    source: root.source,
    contractVersion: root.contractVersion,
    inputAuthority: root.inputAuthority,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    instanceRevision: root.instanceRevision,
    layoutId: root.layoutId,
    flowRegionProviderAuthority: {
      source: root.flowRegionProviderAuthority.source,
      contractVersion: root.flowRegionProviderAuthority.contractVersion,
      spatialIndexFingerprint: root.flowRegionProviderAuthority.spatialIndexFingerprint,
      fingerprint: root.flowRegionProviderAuthority.fingerprint,
    },
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
  })
}

function dependencyFingerprintsMatch(
  root: VNextTextBlockUnifiedLayoutRootV1,
  binding: RootBindingV1,
): boolean {
  const fingerprints = root.dependencyFingerprints
  const expected = binding.dependencyFingerprints
  return fingerprints.initialFlow === expected.initialFlow
    && fingerprints.evidence === expected.evidence
    && fingerprints.persistentFlowTree === expected.persistentFlowTree
    && fingerprints.spatialIndex === expected.spatialIndex
    && fingerprints.flowRegionProviderAuthority === expected.flowRegionProviderAuthority
    && fingerprints.spatialLayout === expected.spatialLayout
    && fingerprints.authoredBoxGeometry === expected.authoredBoxGeometry
    && fingerprints.scene === expected.scene
    && root.flowRegionProviderAuthority.fingerprint === expected.flowRegionProviderAuthority
}

export function registerVNextTextBlockUnifiedLayoutRootInternalV1(input: {
  root: VNextTextBlockUnifiedLayoutRootV1
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV2
  spatialIndex: VNextTextBlockSpatialIndexV2
  spatialLayout: Extract<VNextTextBlockSpatialWrappingLayoutResultV2, { status: "accepted" }>
  authoredBoxGeometry: Extract<VNextTextBlockAuthoredBoxGeometryResultV2, { status: "accepted" }>
  scene: VNextTextBlockUnifiedLayoutSceneV1
  canonicalRootFacts: string
}): void {
  const root = input.root
  if (
    !hasExactDataProperties(root, ROOT_KEYS)
    || !rootOwnedWrappersAreExactAndFrozen(root)
    || !rootClaimsAreFixed(root)
  ) {
    throw new TypeError("unified layout root registration requires an exact frozen root shell")
  }
  roots.set(root, {
    initialFlow: input.initialFlow,
    evidence: input.evidence,
    persistentFlowTree: input.persistentFlowTree,
    spatialIndex: input.spatialIndex,
    flowRegionProviderAuthority: root.flowRegionProviderAuthority,
    spatialLayout: input.spatialLayout,
    authoredBoxGeometry: input.authoredBoxGeometry,
    scene: input.scene,
    dependencyFingerprints: { ...root.dependencyFingerprints },
    rootFingerprint: root.fingerprint,
    canonicalRootFacts: input.canonicalRootFacts,
  })
}

export function inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutRootInspectionV1 {
  if (value == null || typeof value !== "object" || !roots.has(value)) {
    return {
      status: "invalid",
      code: "invalid-input",
      message: "unified layout root is not the exact process-local Core root",
    }
  }

  const root = value as VNextTextBlockUnifiedLayoutRootV1
  const binding = roots.get(root)
  if (
    binding == null
    || !hasExactDataProperties(root, ROOT_KEYS)
    || !rootOwnedWrappersAreExactAndFrozen(root)
    || !rootClaimsAreFixed(root)
  ) {
    return {
      status: "invalid",
      code: "invalid-input",
      message: "registered unified layout root no longer has an exact frozen root shell",
    }
  }
  if (
    root.initialFlow !== binding.initialFlow
    || root.evidence !== binding.evidence
    || root.persistentFlowTree !== binding.persistentFlowTree
    || root.spatialIndex !== binding.spatialIndex
    || root.flowRegionProviderAuthority !== binding.flowRegionProviderAuthority
    || root.spatialLayout !== binding.spatialLayout
    || root.authoredBoxGeometry !== binding.authoredBoxGeometry
    || root.scene !== binding.scene
    || !dependencyFingerprintsMatch(root, binding)
  ) return {
    status: "invalid",
    code: "unified-layout-dependency-mismatch",
    message: "registered unified layout root no longer retains its exact dependency bindings",
  }
  if (root.fingerprint !== binding.rootFingerprint || rootOwnedCanonicalFacts(root) !== binding.canonicalRootFacts) {
    return {
      status: "invalid",
      code: "unsafe-layout-arithmetic",
      message: "registered unified layout root no longer matches its canonical root facts",
    }
  }
  return {
    status: "valid",
    fingerprint: root.fingerprint,
    sceneFingerprint: root.scene.fingerprint,
    work: root.work,
  }
}
