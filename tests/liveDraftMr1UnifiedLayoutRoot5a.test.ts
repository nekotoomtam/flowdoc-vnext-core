import { describe, expect, it } from "vitest"
import * as core from "../src/index.js"
import { acceptedInlineImageEvidenceFixture } from "./helpers/textBlockInlineImageFlowV2.js"

const reviewedUnifiedRuntimeExports = [
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_SOURCE",
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_VERSION",
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_SOURCE",
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_VERSION",
  "createVNextTextBlockUnifiedLayoutRootV1",
  "inspectVNextTextBlockUnifiedLayoutRootV1",
  "inspectVNextTextBlockUnifiedLayoutSceneV1",
  "projectVNextTextBlockUnifiedLayoutSceneV1",
] as const

const privilegedRuntimeNames = [
  "inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1",
  "projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2",
  "registerVNextTextBlockUnifiedLayoutRootInternalV1",
  "canonicalRootFacts",
  "rootFingerprintFacts",
  "roots",
  "scenes",
] as const

function publicRootInput() {
  const source = acceptedInlineImageEvidenceFixture({ content: "text-image-text-break" })
  return {
    inputAuthority: "core-synthetic-qa-only" as const,
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: [],
  }
}

describe("Live Draft MR1 unified TextBlock root Phase 5A public boundary", () => {
  it("exposes exactly the reviewed unified runtime surface and no privileged helper", () => {
    const unifiedRuntimeExports = Object.keys(core)
      .filter((name) => (
        name.includes("UnifiedLayout")
        || name.includes("_UNIFIED_LAYOUT_")
      ))
      .sort()

    expect(unifiedRuntimeExports).toEqual([...reviewedUnifiedRuntimeExports].sort())
    for (const name of reviewedUnifiedRuntimeExports) {
      expect(name in core, name).toBe(true)
    }
    for (const name of privilegedRuntimeNames) {
      expect(name in core, name).toBe(false)
    }
  })

  it("builds and inspects one real closed root through the public entrypoint", () => {
    const result = core.createVNextTextBlockUnifiedLayoutRootV1(publicRootInput())
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("public unified root unexpectedly blocked")
    const { root } = result

    expect(core.inspectVNextTextBlockUnifiedLayoutRootV1(root)).toEqual({
      status: "valid",
      fingerprint: root.fingerprint,
      sceneFingerprint: root.scene.fingerprint,
      work: root.work,
    })
    expect(core.inspectVNextTextBlockUnifiedLayoutSceneV1(root.scene)).toEqual({
      status: "valid",
      fingerprint: root.scene.fingerprint,
    })
    expect(root.scene.authoredBoxGeometryFingerprint).toBe(root.authoredBoxGeometry.fingerprint)
    expect(root.authoredBoxGeometry.contentSpatialLayoutFingerprint).toBe(root.spatialLayout.fingerprint)
    expect(root.spatialLayout.spatialIndexFingerprint).toBe(root.spatialIndex.fingerprint)
    expect(root.spatialIndex.persistentFlowTreeFingerprint).toBe(root.persistentFlowTree.fingerprint)
    expect(root.persistentFlowTree.flowEvidenceFingerprint).toBe(root.evidence.fingerprint)

    expect(root.contracts).toMatchObject({
      incrementalTransitionClaim: false,
      stagedEditorApply: false,
      mayPublishLayout: false,
      productionBinding: false,
    })
    expect(root.scene.contracts).toMatchObject({
      incrementalDeliveryClaim: false,
      stagedEditorApply: false,
      mayPublishLayout: false,
      productionBinding: false,
    })
    expect(root.persistentFlowTree.contracts).toMatchObject({
      suffixReuseClaim: false,
      reconvergenceClaim: false,
      stagedEditorApply: false,
      mayPublishLayout: false,
      productionBinding: false,
    })
    expect(root.spatialLayout.contracts).toMatchObject({
      stagedEditorApply: false,
      mayPublishLayout: false,
      productionBinding: false,
    })
    expect(root.authoredBoxGeometry.contracts).toMatchObject({
      stagedEditorApply: false,
      mayPublishLayout: false,
      productionBinding: false,
    })
    expect(root.initialFlow.contracts).toMatchObject({
      mayPublishLayout: false,
      productionBinding: false,
    })
    expect(root.evidence.contracts).toMatchObject({
      mayPublishLayout: false,
      productionBinding: false,
    })
    expect(root.spatialIndex.contracts).toMatchObject({
      mayPublishLayout: false,
      productionBinding: false,
    })
    expect(root.mayPublishLayout).toBe(false)
    expect(root.productionBinding).toBe(false)
    expect(root.scene.mayPublishLayout).toBe(false)
    expect(root.scene.productionBinding).toBe(false)
  })

  it("blocks production and fixed-height-shaped public requests without partial output", () => {
    expect(core.createVNextTextBlockUnifiedLayoutRootV1({
      ...publicRootInput(),
      bindProductionLayout: true,
    })).toEqual({
      status: "blocked",
      root: null,
      scene: null,
      issues: [{
        code: "production-binding-forbidden",
        severity: "error",
        path: "bindProductionLayout",
        message: "unified layout root cannot bind production layout",
      }],
    })

    expect(core.createVNextTextBlockUnifiedLayoutRootV1({
      ...publicRootInput(),
      fixedHeight: true,
    })).toMatchObject({
      status: "blocked",
      root: null,
      scene: null,
      issues: [{ code: "invalid-input" }],
    })
  })
})
