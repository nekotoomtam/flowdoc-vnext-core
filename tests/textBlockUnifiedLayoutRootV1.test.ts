import { describe, expect, it } from "vitest"
import {
  inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1,
  registerVNextTextBlockUnifiedLayoutRootInternalV1,
} from "../src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV1.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import type { VNextTextBlockUnifiedLayoutRootV1 } from "../src/layout/textBlockUnifiedLayoutRootContractV1.js"
import { projectVNextTextBlockUnifiedLayoutSceneV1 } from "../src/layout/textBlockUnifiedLayoutSceneV1.js"
import { spatialFingerprintV1 } from "../src/layout/textBlockSpatialIndexInternalsV1.js"
import {
  layoutVNextTextBlockAuthoredBoxGeometryV2,
} from "../src/layout/textBlockAuthoredBoxGeometryV2.js"
import {
  layoutVNextTextBlockSpatialWrappingV2,
} from "../src/layout/textBlockSpatialWrappingLayoutV2.js"
import { acceptedInlineImageSpatialFixture } from "./helpers/textBlockInlineImageFlowV2.js"

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

function frozenCandidateRoot(): VNextTextBlockUnifiedLayoutRootV1 {
  const fixture = acceptedInlineImageSpatialFixture({ content: "text-image-text" })
  const spatialLayout = layoutVNextTextBlockSpatialWrappingV2({
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
    persistentFlowTree: fixture.tree,
    spatialIndex: fixture.spatialIndex,
    startYLayoutUnit: 0,
  })
  const authoredBoxGeometry = layoutVNextTextBlockAuthoredBoxGeometryV2({
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
    persistentFlowTree: fixture.tree,
    spatialIndex: fixture.spatialIndex,
  })
  if (spatialLayout.status !== "accepted" || authoredBoxGeometry.status !== "accepted") {
    throw new Error("accepted Phase 4B fixture required")
  }
  const sceneResult = projectVNextTextBlockUnifiedLayoutSceneV1({ authoredBoxGeometry })
  if (sceneResult.status !== "accepted") throw new Error("accepted scene required")

  const flowRegionProviderAuthority = Object.freeze({
    source: "vnext-text-block-flow-region-v2" as const,
    contractVersion: 2 as const,
    spatialIndexFingerprint: fixture.spatialIndex.fingerprint,
    fingerprint: spatialFingerprintV1({
      source: "vnext-text-block-flow-region-v2",
      contractVersion: 2,
      spatialIndexFingerprint: fixture.spatialIndex.fingerprint,
    }),
  })
  const dependencyFingerprints = Object.freeze({
    initialFlow: fixture.initialFlow.fingerprint,
    evidence: fixture.evidence.fingerprint,
    persistentFlowTree: fixture.tree.fingerprint,
    spatialIndex: fixture.spatialIndex.fingerprint,
    flowRegionProviderAuthority: flowRegionProviderAuthority.fingerprint,
    spatialLayout: spatialLayout.fingerprint,
    authoredBoxGeometry: authoredBoxGeometry.fingerprint,
    scene: sceneResult.scene.fingerprint,
  })
  const rootFacts = {
    source: "vnext-text-block-unified-layout-root-v1" as const,
    contractVersion: 1 as const,
    inputAuthority: "core-synthetic-qa-only" as const,
    documentId: fixture.initialFlow.documentId,
    sectionId: fixture.initialFlow.sectionId,
    textBlockId: fixture.initialFlow.textBlockId,
    instanceRevision: fixture.initialFlow.instanceRevision,
    layoutId: fixture.evidence.layoutId,
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
    persistentFlowTree: fixture.tree,
    spatialIndex: fixture.spatialIndex,
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
  const fingerprint = spatialFingerprintV1(canonicalRootFacts({ ...rootFacts, fingerprint: "pending" }))
  return Object.freeze({ ...rootFacts, fingerprint })
}

describe("unified TextBlock layout root authority v1", () => {
  it("rejects unregistered candidates, clones, and a frozen object with one foreign child", () => {
    const root = frozenCandidateRoot()
    const clone = structuredClone(root)
    const foreign = Object.freeze({ ...root, scene: structuredClone(root.scene) })

    for (const value of [root, clone, foreign]) {
      expect(inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1(value)).toMatchObject({
        status: "invalid",
        code: "invalid-input",
      })
    }
  })

  it("registers one exact frozen root without recursively inspecting its children", () => {
    const root = frozenCandidateRoot()
    registerVNextTextBlockUnifiedLayoutRootInternalV1({
      root,
      initialFlow: root.initialFlow,
      evidence: root.evidence,
      persistentFlowTree: root.persistentFlowTree,
      spatialIndex: root.spatialIndex,
      spatialLayout: root.spatialLayout,
      authoredBoxGeometry: root.authoredBoxGeometry,
      scene: root.scene,
      canonicalRootFacts: canonicalRootFacts(root),
    })

    expect(inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1(root)).toEqual({
      status: "valid",
      fingerprint: root.fingerprint,
      work: {
        topLevelDependencyCount: 8,
        completeChildGraphTraversalCount: 0,
        completeChildRehashCount: 0,
        rootWrapperAllocationCount: 1,
      },
    })
    expect(root.contracts).toMatchObject({
      incrementalTransitionClaim: false,
      stagedEditorApply: false,
      mayPublishLayout: false,
      productionBinding: false,
    })
  })

  it("rejects an unregistered accessor-shaped proxy before reading it", () => {
    let accessorReadCount = 0
    const value = Object.create(null)
    Object.defineProperty(value, "root", {
      enumerable: true,
      get: () => {
        accessorReadCount += 1
        return null
      },
    })
    expect(inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1(value)).toMatchObject({
      status: "invalid",
      code: "invalid-input",
    })
    expect(accessorReadCount).toBe(0)
  })
})
