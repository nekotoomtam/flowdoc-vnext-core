import { describe, expect, it } from "vitest"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  beginVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  completeVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1,
  hasVNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionRecordForTestInternalV1,
  matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterSeedInternalV1,
  openVNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1,
  abandonVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1,
  matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1,
  prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1,
  prepareVNextTextBlockUnifiedLayout5B2SourceCandidateWorkPublicationInternalV1,
  projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1,
  publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1,
  registerVNextTextBlockUnifiedLayout5B2FoundationCandidateWorkInternalV1,
  resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
  setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1,
  type VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import {
  abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  attachVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1 as attachSourceCandidatePlanLeafInternalV1,
  attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1 as attachSidecarPlanLeafInternalV1,
  attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1 as attachStagePlanLeafInternalV1,
  beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  consumeVNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1,
  consumeVNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1,
  consumeVNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1,
  createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.js"

const dummySidecarStepConsumerAuthority = Object.freeze({})
const dummySourceStepConsumerAuthority = Object.freeze({})
const dummyStageStepConsumerAuthority = Object.freeze({})

function attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
  input: Omit<Parameters<typeof attachSidecarPlanLeafInternalV1>[0], "consumerAuthority">,
): boolean {
  return attachSidecarPlanLeafInternalV1({
    ...input,
    consumerAuthority: dummySidecarStepConsumerAuthority as never,
  })
}

function attachVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1(
  input: Omit<Parameters<typeof attachSourceCandidatePlanLeafInternalV1>[0], "consumerAuthority">,
): boolean {
  return attachSourceCandidatePlanLeafInternalV1({
    ...input,
    consumerAuthority: dummySourceStepConsumerAuthority as never,
  })
}

function attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  input: Omit<Parameters<typeof attachStagePlanLeafInternalV1>[0], "consumerAuthority">,
): boolean {
  return attachStagePlanLeafInternalV1({
    ...input,
    consumerAuthority: dummyStageStepConsumerAuthority as never,
  })
}
import type {
  VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.js"
import type {
  VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  getVNextTextBlockUnifiedLayoutSourceStagePreflightRecordInternalV2,
  prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionPreflightV2.js"
import {
  resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_UNIT_IDS_INTERNAL_V1,
  type VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
} from "../src/layout/textBlockUnifiedLayoutWorkOwnerRegistryV1.js"
import type {
  VNextTextBlockUnifiedLayoutChangeV1,
} from "../src/layout/textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import {
  admit5B2RootFixture,
  admitted5B2PlanARootFixture,
  authorizedEvidenceRequestBundle5B2,
} from "./helpers/textBlockUnifiedIncremental5b2.js"

function freeze<T>(value: T): T {
  if (value != null && typeof value === "object") {
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor != null && "value" in descriptor) freeze(descriptor.value)
    }
    if (!Object.isFrozen(value)) Object.freeze(value)
  }
  return value
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function finishStepFromSidecarStepForTest(
  sidecarStep: unknown,
): VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1 {
  const sidecar =
    consumeVNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1({
      step: sidecarStep as VNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1,
      consumerAuthority: dummySidecarStepConsumerAuthority as never,
    })
  const source =
    consumeVNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1({
      step: sidecar.nextStep as VNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1,
      consumerAuthority: dummySourceStepConsumerAuthority as never,
    })
  const stage = consumeVNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1({
    step: source.nextStep as VNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1,
    consumerAuthority: dummyStageStepConsumerAuthority as never,
  })
  return stage.finishStep
}

function paintChange(
  root: VNextTextBlockUnifiedLayoutRootV2,
  label = "candidate-authority",
): VNextTextBlockUnifiedLayoutChangeV1 {
  if (root.sourceState.root.nodeKind !== "leaf") throw new Error("leaf missing")
  const item = root.sourceState.root.items.find((entry) => entry.kind === "text")
  if (item?.kind !== "text") throw new Error("text item missing")
  const nextStyle = { textColor: "FF0000" }
  return freeze({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "supported-style-change" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    range: {
      startRenderedUtf16: 0,
      endRenderedUtf16: item.renderedUtf16Length,
    },
    expectedPreviousStyleFingerprint: item.layoutDependencyFingerprint,
    expectedPreviousStyleProvenanceFingerprint: item.provenanceFingerprint,
    nextStyle,
    nextStyleFingerprint: fingerprint(nextStyle),
    nextStyleProvenanceFingerprint: fingerprint({ owner: label, nextStyle }),
  })
}

function foundation(input: {
  readonly sourceLimits?: NonNullable<
    Parameters<typeof admitted5B2PlanARootFixture>[0]
  >["sourceLimits"]
  readonly label?: string
} = {}) {
  const { root, composition } = admitted5B2PlanARootFixture({
    sourceLimits: input.sourceLimits,
  })
  admit5B2RootFixture(root)
  const change = paintChange(root, input.label)
  const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
    previousRoot: root,
    change,
    workPolicy: root.workPolicy,
  })
  expect(result.status).toBe("not-required")
  if (result.status !== "not-required") throw new Error("foundation preflight missing")
  const authorityRecord = resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
    previousRoot: root,
    change,
    composition,
    candidateWork: result.completedCandidateWork,
  })
  expect(authorityRecord).not.toBeNull()
  if (authorityRecord == null) throw new Error("foundation candidate authority missing")
  const authority = authorityRecord as unknown as
    VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1
  return {
    root,
    composition,
    change,
    preflight: result.preflight,
    candidateWork: result.completedCandidateWork,
    authority,
    authorityRecord,
  }
}

function meterFor(value: ReturnType<typeof foundation>) {
  const meter = openVNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1({
    previousRoot: value.root,
    change: value.change,
    composition: value.composition,
    candidateWork: value.candidateWork,
    candidateWorkAuthority: value.authority,
  })
  expect(meter).not.toBeNull()
  if (meter == null) throw new Error("candidate meter missing")
  return meter
}

function receipt(
  meter: NonNullable<ReturnType<typeof openVNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1>>,
  unit: string,
) {
  return inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(meter)
    ?.find((row) => row.ownerRow.unit === unit)
}

describe("5B-2 candidate-work authority", () => {
  it("matches only an eligible meter with the exact Root, change, and composition seed", () => {
    const exact = foundation({ label: "meter-seed-exact" })
    const other = foundation({ label: "meter-seed-other" })
    const meter = meterFor(exact)
    const matches = (input: Partial<{
      previousRoot: typeof exact.root
      change: typeof exact.change
      composition: typeof exact.composition
      meter: typeof meter
    }> = {}) => matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterSeedInternalV1({
      previousRoot: input.previousRoot ?? exact.root,
      change: input.change ?? exact.change,
      composition: input.composition ?? exact.composition,
      meter: input.meter ?? meter,
    })
    expect(matches()).toBe(true)
    expect(matches({ previousRoot: other.root })).toBe(false)
    expect(matches({ change: other.change })).toBe(false)
    expect(matches({ composition: other.composition })).toBe(false)
    expect(matches({ meter: structuredClone(meter) })).toBe(false)
    expect(matches({ meter: {} as typeof meter })).toBe(false)

    const openPermit = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
      meter,
      unit: "source-items",
    })
    expect(openPermit.status).toBe("permitted")
    expect(matches()).toBe(false)
    if (openPermit.status === "permitted") {
      expect(completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
        openPermit.permit,
      )).toBe(true)
    }

    const failed = foundation({
      label: "meter-seed-failed",
      sourceLimits: { sourceItems: 0 },
    })
    const failedMeter = meterFor(failed)
    expect(beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
      meter: failedMeter,
      unit: "source-items",
    }).status).toBe("limit-exceeded")
    expect(matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterSeedInternalV1({
      previousRoot: failed.root,
      change: failed.change,
      composition: failed.composition,
      meter: failedMeter,
    })).toBe(false)

    const published = foundation({ label: "meter-seed-published" })
    const publishedMeter = meterFor(published)
    const projected = projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(
      publishedMeter,
    )
    if (projected == null) throw new Error("published projection missing")
    expect(publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1({
      meter: publishedMeter,
      nextCandidateWork: projected,
      producingStageAuthority: published.preflight,
    })).not.toBeNull()
    expect(matchesVNextTextBlockUnifiedLayout5B2CandidateWorkMeterSeedInternalV1({
      previousRoot: published.root,
      change: published.change,
      composition: published.composition,
      meter: publishedMeter,
    })).toBe(false)
  })

  it("binds exact foundation work to the exact Root, change, composition, and candidate", () => {
    const exact = foundation()
    expect(exact.authorityRecord).toMatchObject({
      previousRoot: exact.root,
      change: exact.change,
      composition: exact.composition,
      candidateWork: exact.candidateWork,
      producingStageAuthority: exact.preflight,
    })
    expect(exact.authorityRecord.receipts).toHaveLength(80)
    expect(exact.authorityRecord.receipts.map((row) => row.ownerRow.unit))
      .toEqual(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_UNIT_IDS_INTERNAL_V1)
    expect(Object.isFrozen(exact.authorityRecord.receipts)).toBe(true)
    expect(exact.authorityRecord.receipts.every(Object.isFrozen)).toBe(true)
  })

  it("rejects clone, stale, replay, cross-Root, cross-change, and cross-composition tuples", () => {
    const exact = foundation({ label: "exact" })
    const other = foundation({ label: "other" })
    const clonedWork = freeze(structuredClone(exact.candidateWork))
    const clonedComposition = freeze(structuredClone(exact.composition))

    expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
      previousRoot: exact.root,
      change: exact.change,
      composition: exact.composition,
      candidateWork: clonedWork,
    })).toBeNull()
    expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
      previousRoot: other.root,
      change: exact.change,
      composition: exact.composition,
      candidateWork: exact.candidateWork,
    })).toBeNull()
    expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
      previousRoot: exact.root,
      change: other.change,
      composition: exact.composition,
      candidateWork: exact.candidateWork,
    })).toBeNull()
    expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
      previousRoot: exact.root,
      change: exact.change,
      composition: other.composition,
      candidateWork: exact.candidateWork,
    })).toBeNull()
    expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
      previousRoot: exact.root,
      change: exact.change,
      composition: clonedComposition,
      candidateWork: exact.candidateWork,
    })).toBeNull()
    expect(registerVNextTextBlockUnifiedLayout5B2FoundationCandidateWorkInternalV1({
      previousRoot: exact.root,
      change: exact.change,
      composition: exact.composition,
      candidateWork: exact.candidateWork,
      receipts: exact.authorityRecord.receipts,
      producingStageAuthority: exact.preflight,
    })).toBeNull()
  })

  it("rejects detached stageWork even when all values match", () => {
    const exact = foundation()
    const clonedWork = freeze(structuredClone(exact.candidateWork))
    expect(registerVNextTextBlockUnifiedLayout5B2FoundationCandidateWorkInternalV1({
      previousRoot: exact.root,
      change: exact.change,
      composition: exact.composition,
      candidateWork: clonedWork,
      receipts: exact.authorityRecord.receipts.map((row) => freeze({ ...row })),
      producingStageAuthority: {},
    })).toBeNull()
  })

  it("rejects a required-Evidence preflight before Evidence acceptance", () => {
    const bundle = authorizedEvidenceRequestBundle5B2({
      insertedText: "required-bypass",
    })
    const preflight = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: bundle.root,
      change: bundle.change,
      workPolicy: bundle.root.workPolicy,
    })
    expect(preflight.status).toBe("required")
    if (preflight.status !== "required") return
    const composition =
      resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
        bundle.root,
      )
    const owner =
      getVNextTextBlockUnifiedLayoutSourceStagePreflightRecordInternalV2({
        preflight: preflight.preflight,
        previousRoot: bundle.root,
      })
    expect(composition).not.toBeNull()
    expect(owner?.foundationReceipts).not.toBeNull()
    if (composition == null || owner?.foundationReceipts == null) return

    expect(registerVNextTextBlockUnifiedLayout5B2FoundationCandidateWorkInternalV1({
      previousRoot: bundle.root,
      change: bundle.change,
      composition,
      candidateWork: preflight.completedCandidateWork,
      receipts: owner.foundationReceipts,
      producingStageAuthority: preflight.preflight,
    })).toBeNull()
    expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
      previousRoot: bundle.root,
      change: bundle.change,
      composition,
      candidateWork: preflight.completedCandidateWork,
    })).toBeNull()
  })

  it("records attempted work before a throwing first observation", () => {
    const exact = foundation()
    const meter = meterFor(exact)
    const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
      meter,
      unit: "source-index-entries",
    })
    expect(begun.status).toBe("permitted")
    const hostileEntry = Object.defineProperty({}, "value", {
      get() { throw new Error("observed") },
    }) as { readonly value: unknown }
    expect(() => hostileEntry.value).toThrow("observed")
    expect(receipt(meter, "source-index-entries"))
      .toMatchObject({ attemptedWork: 1, completedWork: 0 })
    const projected = projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(meter)
    expect(projected).not.toBeNull()
    expect(publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1({
      meter,
      nextCandidateWork: projected!,
      producingStageAuthority: exact.preflight,
    })).toBeNull()
  })

  it("completes a permit once and projects completed Source compatibility work", () => {
    const exact = foundation()
    const meter = meterFor(exact)
    const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
      meter,
      unit: "source-tree-lookup-nodes",
    })
    expect(begun.status).toBe("permitted")
    if (begun.status !== "permitted") return
    expect(completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(begun.permit))
      .toBe(true)
    expect(completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(begun.permit))
      .toBe(false)
    expect(receipt(meter, "source-tree-lookup-nodes"))
      .toMatchObject({ attemptedWork: 1, completedWork: 1 })
    expect(projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(meter))
      .toMatchObject({ flow: { visitedSourceLookupNodeCount: 1 } })
  })

  it("publishes an exact closed foundation meter once", () => {
    const exact = foundation()
    const meter = meterFor(exact)
    const projected =
      projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(meter)
    expect(projected).not.toBeNull()
    if (projected == null) return
    const published = publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1({
      meter,
      nextCandidateWork: projected,
      producingStageAuthority: exact.preflight,
    })
    expect(published).not.toBeNull()
    expect(publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1({
      meter,
      nextCandidateWork: projected,
      producingStageAuthority: exact.preflight,
    })).toBeNull()
  })

  it("invalidates a projection when an open permit later completes", () => {
    const exact = foundation()
    const meter = meterFor(exact)
    const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
      meter,
      unit: "source-tree-lookup-nodes",
    })
    expect(begun.status).toBe("permitted")
    if (begun.status !== "permitted") return
    const beforeCompletion =
      projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(meter)
    expect(beforeCompletion).toMatchObject({
      flow: { visitedSourceLookupNodeCount: 0 },
    })
    expect(Object.isFrozen(beforeCompletion)).toBe(true)

    expect(completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
      begun.permit,
    )).toBe(true)
    const afterCompletion =
      projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(meter)
    expect(afterCompletion).not.toBe(beforeCompletion)
    expect(afterCompletion).toMatchObject({
      flow: { visitedSourceLookupNodeCount: 1 },
    })
    expect(Object.isFrozen(afterCompletion)).toBe(true)
    expect(publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1({
      meter,
      nextCandidateWork: afterCompletion!,
      producingStageAuthority: exact.preflight,
    })).not.toBeNull()
  })

  it("fails closed for nonzero Source items and detached foundation authority", () => {
    const withSourceItems = foundation({ label: "source-items" })
    const sourceMeter = meterFor(withSourceItems)
    const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
      meter: sourceMeter,
      unit: "source-items",
    })
    expect(begun.status).toBe("permitted")
    if (begun.status !== "permitted") return
    expect(completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
      begun.permit,
    )).toBe(true)
    const sourceWork =
      projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(
        sourceMeter,
      )
    expect(sourceWork).toMatchObject({ flow: { visitedSourceItemCount: 1 } })
    expect(prepareVNextTextBlockUnifiedLayout5B2SourceCandidateWorkPublicationInternalV1({
      meter: sourceMeter,
      nextCandidateWork: sourceWork!,
      completedSourceEmissionCount: 1,
      producingStageAuthority: structuredClone(withSourceItems.preflight),
    })).toBeNull()
    expect(prepareVNextTextBlockUnifiedLayout5B2SourceCandidateWorkPublicationInternalV1({
      meter: sourceMeter,
      nextCandidateWork: sourceWork!,
      completedSourceEmissionCount: 1,
      producingStageAuthority: withSourceItems.preflight,
    })).not.toBeNull()
    expect(publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1({
      meter: sourceMeter,
      nextCandidateWork: sourceWork!,
      producingStageAuthority: withSourceItems.preflight,
    })).toBeNull()

    const detached = foundation({ label: "detached-authority" })
    const detachedMeter = meterFor(detached)
    const detachedWork =
      projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(
        detachedMeter,
      )
    expect(publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1({
      meter: detachedMeter,
      nextCandidateWork: detachedWork!,
      producingStageAuthority: {},
    })).toBeNull()
  })

  it("prepares Source publication without publishing before the transaction begins", () => {
    const exact = foundation({ label: "detached-source-publication-plan" })
    const meter = meterFor(exact)
    const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
      meter,
      unit: "source-items",
    })
    expect(begun.status).toBe("permitted")
    if (begun.status !== "permitted") return
    expect(completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
      begun.permit,
    )).toBe(true)
    const nextCandidateWork =
      projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(meter)
    expect(nextCandidateWork).not.toBeNull()
    if (nextCandidateWork == null) return
    const publicationPreconditionAuthority =
      prepareVNextTextBlockUnifiedLayout5B2SourceCandidateWorkPublicationInternalV1({
        meter,
        nextCandidateWork,
        completedSourceEmissionCount: 1,
        producingStageAuthority: exact.preflight,
      })
    expect(publicationPreconditionAuthority).not.toBeNull()
    if (publicationPreconditionAuthority == null) return
    expect(
      hasVNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionRecordForTestInternalV1(
        publicationPreconditionAuthority,
      ),
    ).toBe(true)

    const detachedTicket =
      createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
    expect(
      prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        detachedTicket,
        publicationPreconditionAuthority:
          structuredClone(publicationPreconditionAuthority),
        candidateWorkMeter: meter,
        nextCandidateWork,
        completedSourceEmissionCount: 1,
      }),
    ).toBeNull()
    expect(
      prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        detachedTicket,
        publicationPreconditionAuthority,
        candidateWorkMeter: Object.freeze({}) as typeof meter,
        nextCandidateWork,
        completedSourceEmissionCount: 1,
      }),
    ).toBeNull()
    expect(
      prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        detachedTicket,
        publicationPreconditionAuthority,
        candidateWorkMeter: meter,
        nextCandidateWork,
        completedSourceEmissionCount: 0,
      }),
    ).toBeNull()
    const prepared =
      prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        detachedTicket,
        publicationPreconditionAuthority,
        candidateWorkMeter: meter,
        nextCandidateWork,
        completedSourceEmissionCount: 1,
      })
    expect(prepared).not.toBeNull()
    if (prepared == null) return
    const leakedApplyRecord = (prepared as unknown as {
      readonly applyRecord?: object
    }).applyRecord
    if (leakedApplyRecord !== undefined) {
      applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
        Object.freeze({
          applyRecord: leakedApplyRecord,
          nextStep: Object.freeze({}),
        }) as never,
      )
    }
    expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
      previousRoot: exact.root,
      change: exact.change,
      composition: exact.composition,
      candidateWork: nextCandidateWork,
    })).toBeNull()
    expect(leakedApplyRecord).toBeUndefined()
    expect(Object.isFrozen(prepared.candidateWorkAuthority)).toBe(true)
    expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
      previousRoot: exact.root,
      change: exact.change,
      composition: exact.composition,
      candidateWork: nextCandidateWork,
    })).toBeNull()
    const sidecarPlanAuthority = Object.freeze({}) as
      VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1
    const sourcePlanAuthority = Object.freeze({}) as
      VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1
    const stagePlanAuthority = Object.freeze({}) as
      VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
    const sidecarPlanSealAuthority = Object.freeze({})
    const sourcePlanSealAuthority = Object.freeze({})
    const stagePlanSealAuthority = Object.freeze({})
    expect(attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
      detachedTicket,
      planAuthority: sidecarPlanAuthority,
      sealAuthority: sidecarPlanSealAuthority as never,
      applyRecord: sidecarPlanAuthority as never,
    })).toBe(true)
    expect(attachVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
      detachedTicket,
      planAuthority: sourcePlanAuthority,
      sealAuthority: sourcePlanSealAuthority as never,
      applyRecord: sourcePlanAuthority as never,
    })).toBe(true)
    expect(attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
      detachedTicket,
      planAuthority: stagePlanAuthority,
      sealAuthority: stagePlanSealAuthority as never,
      applyRecord: stagePlanAuthority as never,
    })).toBe(true)
    const sidecarRegistrationPreconditionAuthority = Object.freeze({}) as
      VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1
    const nextSidecarCandidateAuthority = Object.freeze({}) as
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    const sourcePathCopyCandidateAuthority = Object.freeze({}) as
      VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
    const mintResult = mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1({
      detachedTicket,
      candidateWorkPlanAuthority: prepared.planAuthority,
      sidecarPlanAuthority,
      sourcePlanAuthority,
      stagePlanAuthority,
      candidateWorkPlanSealAuthority: prepared.sealAuthority,
      sidecarPlanSealAuthority: sidecarPlanSealAuthority as never,
      sourcePlanSealAuthority: sourcePlanSealAuthority as never,
      stagePlanSealAuthority: stagePlanSealAuthority as never,
      candidateWorkPublicationPreconditionAuthority:
        publicationPreconditionAuthority,
      sidecarRegistrationPreconditionAuthority,
      candidateWorkMeter: meter,
      nextSidecarCandidateAuthority,
      sourcePathCopyCandidateAuthority,
    })
    expect(mintResult?.status).toBe("sealed")
    if (mintResult?.status !== "sealed") {
      throw new Error("candidate publication sealed ticket missing")
    }
    const ticket = mintResult.ticket
    const candidateWorkStep =
      beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(ticket)
    let fabricatedStepGetterCount = 0
    expect(() =>
      applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
        new Proxy(Object.freeze({}), {
          get() {
            fabricatedStepGetterCount += 1
            throw new Error("fabricated step getter observed")
          },
        }) as never,
      ),
    ).toThrow(/commit step invariant/i)
    expect(fabricatedStepGetterCount).toBe(0)
    expect(() =>
      applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
        structuredClone(candidateWorkStep),
      ),
    ).toThrow(/commit step invariant/i)
    setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1(
      () => { throw new Error("post-live candidate observer invoked") },
    )
    try {
      var sidecarStep =
        applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
          candidateWorkStep,
        )
    } finally {
      setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1(
        null,
      )
    }
    expect(() =>
      applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
        candidateWorkStep,
      ),
    ).toThrow(/commit step invariant/i)
    const publishedRecord =
      resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
      previousRoot: exact.root,
      change: exact.change,
      composition: exact.composition,
      candidateWork: nextCandidateWork,
      })
    expect(publishedRecord).toMatchObject({
      candidateWork: nextCandidateWork,
      producingStageAuthority: ticket,
    })
    expect(Object.isFrozen(publishedRecord?.receipts)).toBe(true)
    expect(publishedRecord?.receipts.every(Object.isFrozen)).toBe(true)
    expect(
      hasVNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionRecordForTestInternalV1(
        publicationPreconditionAuthority,
      ),
    ).toBe(false)
    finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
      finishStepFromSidecarStepForTest(sidecarStep!),
    )
  })

  it("binds an owner-issued plan seal to one detached ticket and planned output", () => {
    const prepare = (label: string) => {
      const exact = foundation({ label })
      const meter = meterFor(exact)
      const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
        meter,
        unit: "source-items",
      })
      expect(begun.status).toBe("permitted")
      if (begun.status !== "permitted") {
        throw new Error("candidate-work owner-seal meter was not permitted")
      }
      expect(completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
        begun.permit,
      )).toBe(true)
      const nextCandidateWork =
        projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(meter)
      expect(nextCandidateWork).not.toBeNull()
      if (nextCandidateWork == null) {
        throw new Error("candidate-work owner-seal projection missing")
      }
      const publicationPreconditionAuthority =
        prepareVNextTextBlockUnifiedLayout5B2SourceCandidateWorkPublicationInternalV1({
          meter,
          nextCandidateWork,
          completedSourceEmissionCount: 1,
          producingStageAuthority: exact.preflight,
        })
      expect(publicationPreconditionAuthority).not.toBeNull()
      if (publicationPreconditionAuthority == null) {
        throw new Error("candidate-work owner-seal precondition missing")
      }
      const detachedTicket =
        createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
      const prepared =
        prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
          detachedTicket,
          publicationPreconditionAuthority,
          candidateWorkMeter: meter,
          nextCandidateWork,
          completedSourceEmissionCount: 1,
        })
      expect(prepared).not.toBeNull()
      if (prepared == null) {
        throw new Error("candidate-work owner-seal plan missing")
      }
      return {
        detachedTicket,
        publicationPreconditionAuthority,
        meter,
        nextCandidateWork,
        prepared,
      }
    }

    const first = prepare("candidate-work-owner-seal-first")
    const second = prepare("candidate-work-owner-seal-second")
    const exactMatch = {
      detachedTicket: first.detachedTicket,
      planAuthority: first.prepared.planAuthority,
      sealAuthority: first.prepared.sealAuthority,
      plannedOutput: first.prepared.candidateWorkAuthority,
    }
    expect(
      matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1(
        exactMatch,
      ),
    ).toBe(true)
    expect(
      matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1({
        ...exactMatch,
        sealAuthority: structuredClone(first.prepared.sealAuthority),
      }),
    ).toBe(false)
    expect(
      matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1({
        ...exactMatch,
        planAuthority: second.prepared.planAuthority,
      }),
    ).toBe(false)
    expect(
      matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1({
        ...exactMatch,
        detachedTicket: second.detachedTicket,
      }),
    ).toBe(false)
    expect(
      matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1({
        ...exactMatch,
        sealAuthority: Object.freeze({}) as typeof first.prepared.sealAuthority,
      }),
    ).toBe(false)

    const abort = abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
      first.detachedTicket,
    )
    expect(abort).not.toBeNull()
    if (abort == null) throw new Error("candidate-work detached abort missing")
    expect(abort.candidateWork).not.toBeNull()
    if (abort.candidateWork == null) {
      throw new Error("candidate-work detached abandonment slot missing")
    }
    const candidateWorkAbort = abort.candidateWork
    expect(() =>
      abandonVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        planAuthority: first.prepared.planAuthority,
        abandonmentAuthority: structuredClone(
          candidateWorkAbort.abandonmentAuthority,
        ),
      }),
    ).toThrow(/abandonment invariant/i)
    expect(
      matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1(
        exactMatch,
      ),
    ).toBe(true)
    abandonVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
      planAuthority: first.prepared.planAuthority,
      abandonmentAuthority: candidateWorkAbort.abandonmentAuthority,
    })
    expect(
      matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1(
        exactMatch,
      ),
    ).toBe(false)

    expect(
      prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        detachedTicket:
          createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(),
        publicationPreconditionAuthority:
          first.publicationPreconditionAuthority,
        candidateWorkMeter: first.meter,
        nextCandidateWork: first.nextCandidateWork,
        completedSourceEmissionCount: 1,
      }),
    ).not.toBeNull()
  })

  it("rejects replay of one candidate authority after its meter opens", () => {
    const exact = foundation()
    expect(meterFor(exact)).not.toBeNull()
    expect(openVNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1({
      previousRoot: exact.root,
      change: exact.change,
      composition: exact.composition,
      candidateWork: exact.candidateWork,
      candidateWorkAuthority: exact.authority,
    })).toBeNull()
  })

  it("blocks an inactive unit without charging it", () => {
    const meter = meterFor(foundation())
    const result = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
      meter,
      unit: "flow-atoms" as VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
    })
    expect(result.status).toBe("blocked")
  })

  it("returns a zero-limit evaluator before the caller observes the unit", () => {
    const exact = foundation({ sourceLimits: { sourceIndexEntries: 0 } })
    const meter = meterFor(exact)
    let observed = false
    const result = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
      meter,
      unit: "source-index-entries",
    })
    expect(result.status).toBe("limit-exceeded")
    expect(result).toMatchObject({ evaluatorAuthority: expect.any(Object) })
    expect(observed).toBe(false)
    expect(receipt(meter, "source-index-entries"))
      .toMatchObject({ attemptedWork: 1, completedWork: 0 })
    observed = true
    expect(observed).toBe(true)
  })
})
