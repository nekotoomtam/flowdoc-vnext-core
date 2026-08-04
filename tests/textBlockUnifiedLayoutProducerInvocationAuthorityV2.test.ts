import { describe, expect, it } from "vitest"
import {
  consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2,
  inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2,
} from "../src/layout/textBlockUnifiedLayoutProducerInvocationAuthorityV2.js"
import {
  acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2,
  createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2,
  createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV2.js"
import {
  createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  authorizedEvidenceRequestBundle5B2,
  authorizedProducerTerminalFixture5B2,
  admitted5B2AuthorityRootFixture,
} from "./helpers/textBlockUnifiedIncremental5b2.js"
import {
  noOpUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import type {
  VNextTextBlockTransitionProducerInvocationAuthorityV2,
  VNextTextBlockTransitionProducerRuntimeIdentityV2,
} from "../src/layout/textBlockUnifiedLayoutEvidenceContractV2.js"

function matchingRuntimeIdentity(
  bundle: ReturnType<typeof authorizedEvidenceRequestBundle5B2>,
  producerRuntimeRequirementFingerprint =
    bundle.request.producerRuntimeRequirementFingerprint,
) {
  return createVNextTextBlockTransitionProducerRuntimeIdentityInternalV2({
    runtime: "node-native-mr1-range",
    engineBuildFingerprint: "sha256:authority-engine-build",
    fontBackendFingerprint: "sha256:authority-font-backend",
    unitPolicyFingerprint: bundle.request.layoutUnitPolicyFingerprint,
    fontStyleUnitDependencyFingerprint:
      bundle.request.fontStyleUnitDependencyFingerprint,
    producerRuntimeRequirementFingerprint,
  })
}

describe("Phase 5B-2 producer invocation authority", () => {
  it("returns one frozen process-local authority outside detached request material", () => {
    const bundle = authorizedEvidenceRequestBundle5B2({
      policy:
        createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
          "evidence-producer-descriptors": 0,
        }),
    })

    expect(bundle.result.status).toBe("required")
    expect(bundle.producerInvocationAuthority).toEqual(expect.any(Object))
    expect(Object.isFrozen(bundle.producerInvocationAuthority)).toBe(true)
    expect("producerInvocationAuthority" in bundle.sourceMaterial).toBe(false)
    expect(JSON.stringify(bundle.request)).not.toContain("InvocationAuthority")
    expect(JSON.stringify(bundle.sourceMaterial)).not.toContain("InvocationAuthority")
    expect(() => structuredClone(bundle.producerInvocationAuthority)).toThrow()
  })

  it("returns null authority on every branch without a required producer request", () => {
    const root = admitted5B2AuthorityRootFixture()
    const notRequired =
      createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({
        previousRoot: root,
        change: noOpUnifiedLayoutChange5b(root),
      })
    const baseInsertion = authorizedEvidenceRequestBundle5B2().change
    const fallbackRequired =
      createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({
        previousRoot: root,
        change: Object.freeze({
          ...baseInsertion,
          documentId: root.documentId,
          sectionId: root.sectionId,
          textBlockId: root.textBlockId,
          expectedPreviousRootFingerprint: root.fingerprint,
          expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
          insertedText: "\n",
        }),
      })
    const blocked =
      createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV2({
        previousRoot: root,
        change: Object.freeze({
          ...noOpUnifiedLayoutChange5b(root),
          expectedPreviousRootFingerprint: "sha256:stale-root",
        }),
      })

    expect(notRequired).toMatchObject({
      status: "not-required",
      producerInvocationAuthority: null,
    })
    expect(fallbackRequired).toMatchObject({
      status: "fallback-required",
      producerInvocationAuthority: null,
    })
    expect(blocked).toMatchObject({
      status: "blocked",
      producerInvocationAuthority: null,
    })
  })

  it("rejects wrong receivers and cross-tuples before the exact begin succeeds once", () => {
    const first = authorizedEvidenceRequestBundle5B2({ insertedText: "X" })
    const second = authorizedEvidenceRequestBundle5B2({ insertedText: "Y" })
    const authority = first.producerInvocationAuthority
    const copied = { ...authority }
    const { begin } = authority

    expect(Reflect.apply(begin, undefined, [
      first.request,
      first.sourceMaterial,
    ])).toEqual({ status: "rejected" })
    expect(copied.begin(first.request, first.sourceMaterial)).toEqual({ status: "rejected" })
    expect(authority.begin(second.request, second.sourceMaterial)).toEqual({ status: "rejected" })
    expect(authority.begin(first.request, first.sourceMaterial)).toEqual({ status: "started" })
    expect(authority.begin(first.request, first.sourceMaterial)).toEqual({ status: "rejected" })
  })

  it("reports the first exact zero-limit descriptor attempt without completing work", () => {
    const bundle = authorizedEvidenceRequestBundle5B2({
      policy:
        createVNextTextBlockUnifiedLayout5B2EvidenceCalibrationPolicyInternalV2({
          "evidence-producer-descriptors": 0,
        }),
    })
    const authority = bundle.producerInvocationAuthority

    expect(authority.begin(bundle.request, bundle.sourceMaterial)).toEqual({
      status: "started",
    })
    expect(authority.charge("evidence-producer-descriptors")).toEqual({
      status: "limit-exceeded",
      unit: "evidence-producer-descriptors",
      attemptedWork: 1,
      completedWork: 0,
      effectiveLimit: 0,
    })
    expect(inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      authority,
    )).toMatchObject({
      state: "started",
      firstFailedEvaluation: {
        unit: "evidence-producer-descriptors",
        attemptedWork: 1,
        completedWork: 0,
        effectiveLimit: 0,
      },
    })
  })

  it("binds one exact registered matching runtime only after descriptor work", () => {
    const bundle = authorizedEvidenceRequestBundle5B2()
    const authority = bundle.producerInvocationAuthority
    const matching = matchingRuntimeIdentity(bundle)
    const unregistered = Object.freeze({
      ...matching,
    }) as VNextTextBlockTransitionProducerRuntimeIdentityV2
    const crossRequirement = matchingRuntimeIdentity(
      bundle,
      "sha256:cross-runtime-requirement",
    )

    expect(authority.begin(bundle.request, bundle.sourceMaterial)).toEqual({
      status: "started",
    })
    expect(authority.bindRuntimeIdentity(matching)).toEqual({ status: "rejected" })
    expect(authority.charge("evidence-producer-descriptors")).toEqual({
      status: "charged",
      unit: "evidence-producer-descriptors",
      completedWork: 1,
      effectiveLimit: 8_192,
    })
    expect(authority.bindRuntimeIdentity(unregistered)).toEqual({ status: "rejected" })
    expect(authority.bindRuntimeIdentity(crossRequirement)).toEqual({ status: "rejected" })
    expect(authority.bindRuntimeIdentity(matching)).toEqual({ status: "bound" })
    expect(authority.bindRuntimeIdentity(matching)).toEqual({ status: "rejected" })
  })

  it("closes and consumes the exact terminal tuple once with factual ledger state", () => {
    const bundle = authorizedEvidenceRequestBundle5B2()
    const authority = bundle.producerInvocationAuthority
    const runtimeIdentity = matchingRuntimeIdentity(bundle)
    const copied = { ...authority }

    expect(authority.begin(bundle.request, bundle.sourceMaterial)).toEqual({
      status: "started",
    })
    expect(authority.charge("evidence-producer-descriptors").status).toBe("charged")
    expect(authority.bindRuntimeIdentity(runtimeIdentity)).toEqual({ status: "bound" })
    expect(copied.close("producer-response")).toEqual({
      status: "rejected",
      visitedEvidenceNodeCount: 0,
    })
    expect(authority.close("producer-response")).toEqual({
      status: "closed",
      visitedEvidenceNodeCount: 1,
    })
    expect(authority.charge("evidence-glyphs")).toEqual({
      status: "invalid-state",
      unit: "evidence-glyphs",
    })
    expect(authority.close("producer-response")).toEqual({
      status: "rejected",
      visitedEvidenceNodeCount: 1,
    })

    expect(consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2({
      authority,
      request: {},
      sourceMaterial: bundle.sourceMaterial,
      expectedTerminal: "producer-response",
    })).toEqual({ status: "rejected" })
    const consumed =
      consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2({
        authority,
        request: bundle.request,
        sourceMaterial: bundle.sourceMaterial,
        expectedTerminal: "producer-response",
      })
    expect(consumed).toMatchObject({
      status: "consumed",
      snapshot: {
        state: "acceptance-consumed",
        terminalOutcome: "producer-response",
        runtimeIdentity,
        visitedEvidenceNodeCount: 1,
        completedWork: [{
          unit: "evidence-producer-descriptors",
          completedWork: 1,
          effectiveLimit: 8_192,
        }],
      },
    })
    expect(consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2({
      authority,
      request: bundle.request,
      sourceMaterial: bundle.sourceMaterial,
      expectedTerminal: "producer-response",
    })).toEqual({ status: "rejected" })
    expect(inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      authority,
    )).toMatchObject({ state: "acceptance-consumed" })
  })

  it("exposes regular authority methods through the reviewed TypeScript contract", () => {
    const acceptsAuthority = (
      authority: VNextTextBlockTransitionProducerInvocationAuthorityV2,
    ) => authority.source

    expect(acceptsAuthority(
      authorizedEvidenceRequestBundle5B2().producerInvocationAuthority,
    )).toBe("vnext-text-block-transition-producer-invocation-authority-v2")
  })

  it("hands the exact terminal record to Core acceptance once without replay authority", () => {
    const fixture = authorizedProducerTerminalFixture5B2({
      insertedText: "authority-consumer",
    })
    expect(fixture.result.status).toBe("accepted")
    if (fixture.result.status !== "accepted") return

    const accepted =
      acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
        previousRoot: fixture.previousRoot,
        change: fixture.change,
        request: fixture.request,
        sourceMaterial: fixture.sourceMaterial,
        producerInvocationAuthority: fixture.producerInvocationAuthority,
        producerRuntimeIdentity: fixture.producerRuntimeIdentity,
        responseOrFailure: fixture.result.response,
      })

    expect(accepted.status).toBe("accepted")
    expect(inspectVNextTextBlockTransitionProducerInvocationAuthorityInternalV2(
      fixture.producerInvocationAuthority,
    )).toMatchObject({
      state: "acceptance-consumed",
      terminalOutcome: "producer-response",
    })
    expect(consumeVNextTextBlockTransitionProducerInvocationAuthorityInternalV2({
      authority: fixture.producerInvocationAuthority,
      request: fixture.request,
      sourceMaterial: fixture.sourceMaterial,
      expectedTerminal: "producer-response",
    })).toEqual({ status: "rejected" })
    expect(acceptVNextTextBlockUnifiedLayoutAuthorizedTransitionEvidenceInternalV2({
      previousRoot: fixture.previousRoot,
      change: fixture.change,
      request: fixture.request,
      sourceMaterial: fixture.sourceMaterial,
      producerInvocationAuthority: fixture.producerInvocationAuthority,
      producerRuntimeIdentity: fixture.producerRuntimeIdentity,
      responseOrFailure: fixture.result.response,
    })).toMatchObject({ status: "blocked", evidence: null })
  })
})
