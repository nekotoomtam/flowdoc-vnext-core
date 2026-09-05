import { describe, expect, it } from "vitest"
import { existsSync } from "node:fs"
import * as core from "../src/index.js"
import { acceptedInlineImageEvidenceFixture } from "./helpers/textBlockInlineImageFlowV2.js"
import type {
  VNextTextBlockTransitionProducerInvocationAuthorityV2,
} from "../src/index.js"

const retiredUnifiedRuntimeExports = [
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_SOURCE",
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_ROOT_V1_VERSION",
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_SOURCE",
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_VERSION",
  "createVNextTextBlockUnifiedLayoutRootV1",
  "inspectVNextTextBlockUnifiedLayoutRootV1",
  "inspectVNextTextBlockUnifiedLayoutSceneV1",
  "projectVNextTextBlockUnifiedLayoutSceneV1",
] as const

const reviewed5B1UnifiedRuntimeExports = [
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_ID",
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3",
  "acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV1",
  "attemptVNextTextBlockUnifiedLayoutRootTransitionV1",
  "completeVNextTextBlockUnifiedLayoutRootFallbackV1",
  "createVNextTextBlockUnifiedLayoutCompleteSceneDeliveryV2",
  "createVNextTextBlockUnifiedLayoutRootV2",
  "createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV1",
  "inspectVNextTextBlockUnifiedLayoutFallbackRequestV1",
  "inspectVNextTextBlockUnifiedLayoutRootV2",
  "inspectVNextTextBlockUnifiedLayoutTransitionResultV1",
] as const

const reviewed5B2UnifiedRuntimeExports = [
  "acceptVNextTextBlockUnifiedLayoutProducerFailureV2",
  "acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV2",
  "createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2",
] as const

const privilegedRuntimeNames = [
  "inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1",
  "projectVNextTextBlockAuthoredBoxGeometryFromSpatialLayoutInternalV2",
  "registerVNextTextBlockUnifiedLayoutRootInternalV1",
  "registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2",
  "createVNextTextBlockUnifiedLayoutRootCompleteInternalV2",
  "attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1",
  "evaluateVNextTextBlockStageWorkLimitInternalV1",
  "createVNextTextBlockTransitionProducerInvocationAuthorityInternalV2",
  "registerVNextTextBlockTransitionProducerRuntimeIdentityInternalV2",
  "inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2",
  "consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2",
  "createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2",
  "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2",
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

describe("Live Draft MR1 unified TextBlock public boundary after Phase 5A retirement", () => {
  it("keeps the authority value private while exposing its TypeScript contract", () => {
    const acceptsAuthorityType = (
      _authority: VNextTextBlockTransitionProducerInvocationAuthorityV2,
    ): true => true

    expect(acceptsAuthorityType).toEqual(expect.any(Function))
    for (const name of [
      "createVNextTextBlockTransitionProducerInvocationAuthorityInternalV2",
      "registerVNextTextBlockTransitionProducerRuntimeIdentityInternalV2",
      "inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2",
      "consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2",
      "createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2",
      "VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2",
    ]) {
      expect(name in core, name).toBe(false)
    }
  })

  it("exposes exactly the reviewed unified runtime surface and no privileged helper", () => {
    const unifiedRuntimeExports = Object.keys(core)
      .filter((name) => (
        name.includes("UnifiedLayout")
        || name.includes("_UNIFIED_LAYOUT_")
      ))
      .sort()

    expect(unifiedRuntimeExports).toEqual([
      ...reviewed5B1UnifiedRuntimeExports,
      ...reviewed5B2UnifiedRuntimeExports,
    ].sort())
    for (const name of [
      ...reviewed5B1UnifiedRuntimeExports,
      ...reviewed5B2UnifiedRuntimeExports,
    ]) {
      expect(name in core, name).toBe(true)
    }
    for (const name of privilegedRuntimeNames) {
      expect(name in core, name).toBe(false)
    }
  })

  it("retires the old Root and Scene public runtime without exposing private helpers", () => {
    for (const name of retiredUnifiedRuntimeExports) expect(name in core, name).toBe(false)
    for (const name of [
      "textBlockUnifiedLayoutRootV1", "textBlockUnifiedLayoutRootContractV1",
      "textBlockUnifiedLayoutRootAuthorityInternalsV1", "textBlockUnifiedLayoutSceneV1",
      "textBlockUnifiedLayoutSceneContractV1",
    ]) expect(existsSync(new URL(`../src/layout/${name}.ts`, import.meta.url)), name).toBe(false)
  })

  it("builds and inspects a real closed V2 root through the public entrypoint", () => {
    const result = core.createVNextTextBlockUnifiedLayoutRootV2(publicRootInput())
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("public V2 root blocked")
    const { root } = result
    expect(core.inspectVNextTextBlockUnifiedLayoutRootV2(root)).toMatchObject({
      status: "valid", fingerprint: root.fingerprint,
      persistentSceneFingerprint: root.persistentScene.fingerprint,
    })
    expect(root.contracts).toMatchObject({stagedEditorApply:false,mayPublishLayout:false,productionBinding:false})
    expect(root.mayPublishLayout).toBe(false)
    expect(root.productionBinding).toBe(false)
    expect(root.dependencyFingerprints.persistentScene).toBe(root.persistentScene.fingerprint)
  })

  it("blocks production and fixed-height-shaped public V2 requests without partial output", () => {
    for (const extra of [{bindProductionLayout:true}, {fixedHeight:true}]) {
      expect(core.createVNextTextBlockUnifiedLayoutRootV2({...publicRootInput(),...extra})).toMatchObject({
        status:"blocked", root:null, persistentScene:null, deliveryPlan:null,
        issues:[expect.any(Object)],
      })
    }
  })
})
