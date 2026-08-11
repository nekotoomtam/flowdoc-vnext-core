import { describe, expect, it } from "vitest"
import type {
  VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.js"
import {
  abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1 as attachCandidateWorkPlanLeafInternalV1,
  attachVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1 as attachSourceCandidatePlanLeafInternalV1,
  attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1 as attachSidecarPlanLeafInternalV1,
  attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1 as attachStagePlanLeafInternalV1,
  beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  consumeVNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1,
  consumeVNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1,
  consumeVNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1,
  consumeVNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1,
  finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceCommitForTestInternalV1,
  isVNextTextBlockUnifiedLayoutSourceCommitPlanActivelyBoundForTestInternalV1,
  isVNextTextBlockUnifiedLayoutSourceCommitAccessReservationProtectedInternalV1,
  isVNextTextBlockUnifiedLayoutSourceCommitCandidateWorkMeterProtectedInternalV1,
  isVNextTextBlockUnifiedLayoutSourceCommitSidecarCandidateProtectedInternalV1,
  isVNextTextBlockUnifiedLayoutSourceCommitSourceCandidateProtectedInternalV1,
  mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1,
  type VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1,
  type VNextTextBlockUnifiedLayoutCandidateWorkStepConsumerAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCommitMintFaultPointForTestInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCandidateApplyRecordInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCandidateStepConsumerAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarStepConsumerAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStageStepConsumerAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.js"
import type {
  VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"

function opaque<T>(): T {
  return Object.freeze({}) as T
}

const candidateWorkStepConsumerAuthority =
  opaque<VNextTextBlockUnifiedLayoutCandidateWorkStepConsumerAuthorityInternalV1>()
const sidecarStepConsumerAuthority =
  opaque<VNextTextBlockUnifiedLayoutSourceSidecarStepConsumerAuthorityInternalV1>()
const sourceStepConsumerAuthority =
  opaque<VNextTextBlockUnifiedLayoutSourceCandidateStepConsumerAuthorityInternalV1>()
const stageStepConsumerAuthority =
  opaque<VNextTextBlockUnifiedLayoutSourceStageStepConsumerAuthorityInternalV1>()

function attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  input: Omit<Parameters<typeof attachCandidateWorkPlanLeafInternalV1>[0], "consumerAuthority">,
): boolean {
  return attachCandidateWorkPlanLeafInternalV1({
    ...input,
    consumerAuthority: candidateWorkStepConsumerAuthority,
  })
}

function attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
  input: Omit<Parameters<typeof attachSidecarPlanLeafInternalV1>[0], "consumerAuthority">,
): boolean {
  return attachSidecarPlanLeafInternalV1({
    ...input,
    consumerAuthority: sidecarStepConsumerAuthority,
  })
}

function attachVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1(
  input: Omit<Parameters<typeof attachSourceCandidatePlanLeafInternalV1>[0], "consumerAuthority">,
): boolean {
  return attachSourceCandidatePlanLeafInternalV1({
    ...input,
    consumerAuthority: sourceStepConsumerAuthority,
  })
}

function attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  input: Omit<Parameters<typeof attachStagePlanLeafInternalV1>[0], "consumerAuthority">,
): boolean {
  return attachStagePlanLeafInternalV1({
    ...input,
    consumerAuthority: stageStepConsumerAuthority,
  })
}

function participantTuple() {
  return {
    candidateWorkPublicationPreconditionAuthority:
      opaque<VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1>(),
    sidecarRegistrationPreconditionAuthority:
      opaque<VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1>(),
    candidateWorkMeter:
      opaque<VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1>(),
    nextSidecarCandidateAuthority:
      opaque<VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1>(),
    sourcePathCopyCandidateAuthority:
      opaque<VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1>(),
  }
}

function preparedPlans() {
  const detachedTicket =
    createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
  const candidateWorkPlanAuthority =
    opaque<VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1>()
  const sidecarPlanAuthority =
    opaque<VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1>()
  const sourcePlanAuthority =
    opaque<VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1>()
  const stagePlanAuthority =
    opaque<VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1>()
  const candidateWorkPlanSealAuthority =
    opaque<VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1>()
  const sidecarPlanSealAuthority =
    opaque<VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1>()
  const sourcePlanSealAuthority =
    opaque<VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealAuthorityInternalV1>()
  const stagePlanSealAuthority =
    opaque<VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1>()
  const candidateWorkApplyRecord =
    opaque<VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1>()
  const sidecarApplyRecord =
    opaque<VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1>()
  const sourceApplyRecord =
    opaque<VNextTextBlockUnifiedLayoutSourceCandidateApplyRecordInternalV1>()
  const stageApplyRecord =
    opaque<VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1>()
  expect(
    attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
      detachedTicket,
      planAuthority: candidateWorkPlanAuthority,
      sealAuthority: candidateWorkPlanSealAuthority,
      applyRecord: candidateWorkApplyRecord,
    }),
  ).toBe(true)
  expect(
    attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
      detachedTicket,
      planAuthority: sidecarPlanAuthority,
      sealAuthority: sidecarPlanSealAuthority,
      applyRecord: sidecarApplyRecord,
    }),
  ).toBe(true)
  expect(
    attachVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
      detachedTicket,
      planAuthority: sourcePlanAuthority,
      sealAuthority: sourcePlanSealAuthority,
      applyRecord: sourceApplyRecord,
    }),
  ).toBe(true)
  expect(
    attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
      detachedTicket,
      planAuthority: stagePlanAuthority,
      sealAuthority: stagePlanSealAuthority,
      applyRecord: stageApplyRecord,
    }),
  ).toBe(true)
  return {
    detachedTicket,
    candidateWorkPlanAuthority,
    sidecarPlanAuthority,
    sourcePlanAuthority,
    stagePlanAuthority,
    candidateWorkPlanSealAuthority,
    sidecarPlanSealAuthority,
    sourcePlanSealAuthority,
    stagePlanSealAuthority,
    candidateWorkApplyRecord,
    sidecarApplyRecord,
    sourceApplyRecord,
    stageApplyRecord,
  }
}

function mintPrepared(
  plans: ReturnType<typeof preparedPlans>,
  tuple: ReturnType<typeof participantTuple>,
) {
  const result = mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1({
    ...plans,
    ...tuple,
  })
  return result?.status === "sealed" ? result.ticket : null
}

function inspectSequentialCommitChainForTest(
  ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
  firstStep = beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(ticket),
) {
  const candidate =
    consumeVNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1({
      step: firstStep,
      consumerAuthority: candidateWorkStepConsumerAuthority,
    })
  expect(Reflect.ownKeys(candidate.nextStep)).toEqual([])
  const sidecar =
    consumeVNextTextBlockUnifiedLayoutSourceSidecarCommitStepInternalV1({
      step: candidate.nextStep,
      consumerAuthority: sidecarStepConsumerAuthority,
    })
  expect(Reflect.ownKeys(sidecar.nextStep)).toEqual([])
  const source =
    consumeVNextTextBlockUnifiedLayoutSourceCandidateCommitStepInternalV1({
      step: sidecar.nextStep,
      consumerAuthority: sourceStepConsumerAuthority,
    })
  expect(Reflect.ownKeys(source.nextStep)).toEqual([])
  const stage =
    consumeVNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1({
      step: source.nextStep,
      consumerAuthority: stageStepConsumerAuthority,
    })
  expect(Reflect.ownKeys(stage.finishStep)).toEqual([])
  return {
    candidateWork: candidate.applyRecord,
    sidecar: sidecar.applyRecord,
    source: source.applyRecord,
    stage: stage.applyRecord,
    finishStep: stage.finishStep,
  }
}

function finishSequentialCommitForTest(
  ticket: VNextTextBlockUnifiedLayoutSourceStageCommitTicketInternalV1,
): void {
  finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
    inspectSequentialCommitChainForTest(ticket).finishStep,
  )
}

const MINT_FAULT_POINTS = [
  "after-detached-minting-state",
  "after-candidate-work-precondition-index",
  "after-sidecar-precondition-index",
  "after-candidate-work-meter-index",
  "after-sidecar-candidate-index",
  "after-source-candidate-index",
  "after-access-reservation-index",
  "before-live-write",
] as const satisfies readonly VNextTextBlockUnifiedLayoutSourceCommitMintFaultPointForTestInternalV1[]

describe("5B-2 Source commit transaction", () => {
  it("aborts attached plans exactly and crosses live only from sealed", () => {
    const createAttached = () => {
      const detachedTicket =
        createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
      const candidateWorkPlanAuthority =
        opaque<VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1>()
      const candidateWorkPlanSealAuthority =
        opaque<VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1>()
      const candidateWorkApplyRecord =
        opaque<VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1>()
      const sidecarPlanAuthority =
        opaque<VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1>()
      const sidecarPlanSealAuthority =
        opaque<VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1>()
      const sidecarApplyRecord =
        opaque<VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1>()
      const sourcePlanAuthority =
        opaque<VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1>()
      const sourcePlanSealAuthority =
        opaque<VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealAuthorityInternalV1>()
      const sourceApplyRecord =
        opaque<VNextTextBlockUnifiedLayoutSourceCandidateApplyRecordInternalV1>()
      const stagePlanAuthority =
        opaque<VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1>()
      const stagePlanSealAuthority =
        opaque<VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1>()
      const stageApplyRecord =
        opaque<VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1>()

      expect(attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        detachedTicket,
        planAuthority: candidateWorkPlanAuthority,
        sealAuthority: candidateWorkPlanSealAuthority,
        applyRecord: candidateWorkApplyRecord,
      })).toBe(true)
      expect(attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
        detachedTicket,
        planAuthority: sidecarPlanAuthority,
        sealAuthority: sidecarPlanSealAuthority,
        applyRecord: sidecarApplyRecord,
      })).toBe(true)
      expect(attachVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
        detachedTicket,
        planAuthority: sourcePlanAuthority,
        sealAuthority: sourcePlanSealAuthority,
        applyRecord: sourceApplyRecord,
      })).toBe(true)
      expect(attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
        detachedTicket,
        planAuthority: stagePlanAuthority,
        sealAuthority: stagePlanSealAuthority,
        applyRecord: stageApplyRecord,
      })).toBe(true)

      return {
        detachedTicket,
        candidateWorkPlanAuthority,
        candidateWorkPlanSealAuthority,
        candidateWorkApplyRecord,
        sidecarPlanAuthority,
        sidecarPlanSealAuthority,
        sidecarApplyRecord,
        sourcePlanAuthority,
        sourcePlanSealAuthority,
        sourceApplyRecord,
        stagePlanAuthority,
        stagePlanSealAuthority,
        stageApplyRecord,
      }
    }

    const abortedPlans = createAttached()
    const abort =
      abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
        abortedPlans.detachedTicket,
      )
    expect(abort).not.toBeNull()
    expect(abort!.candidateWork?.planAuthority)
      .toBe(abortedPlans.candidateWorkPlanAuthority)
    expect(abort!.sidecar?.planAuthority).toBe(abortedPlans.sidecarPlanAuthority)
    expect(abort!.source?.planAuthority).toBe(abortedPlans.sourcePlanAuthority)
    expect(abort!.stage?.planAuthority).toBe(abortedPlans.stagePlanAuthority)
    expect(inspectVNextTextBlockUnifiedLayoutSourceCommitForTestInternalV1(
      abortedPlans.detachedTicket,
    ).phase).toBe("absent")
    expect(abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
      abortedPlans.detachedTicket,
    )).toBeNull()

    const sealedPlans = createAttached()
    const tuple = participantTuple()
    const mint = mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1({
      ...sealedPlans,
      ...tuple,
    })
    expect(mint).not.toBeNull()
    if (mint === null) throw new Error("expected mint result")
    expect(mint.status).toBe("sealed")
    if (mint.status !== "sealed") throw new Error("expected sealed mint")
    expect(inspectVNextTextBlockUnifiedLayoutSourceCommitForTestInternalV1(
      mint.ticket,
    ).phase).toBe("sealed")
    const apply = inspectSequentialCommitChainForTest(mint.ticket)
    expect(apply).toMatchObject({
      candidateWork: sealedPlans.candidateWorkApplyRecord,
      sidecar: sealedPlans.sidecarApplyRecord,
      source: sealedPlans.sourceApplyRecord,
      stage: sealedPlans.stageApplyRecord,
    })
    expect(inspectVNextTextBlockUnifiedLayoutSourceCommitForTestInternalV1(
      mint.ticket,
    ).phase).toBe("committing")
    finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(apply.finishStep)
  })

  it("exposes the exact fixed-slot plans only through one sequential chain", () => {
    const tuple = participantTuple()
    const plans = preparedPlans()
    const ticket = mintPrepared(plans, tuple)
    expect(ticket).not.toBeNull()
    const firstStep =
      beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(ticket!)
    expect(Reflect.ownKeys(firstStep)).toEqual([])
    const chain = inspectSequentialCommitChainForTest(ticket!, firstStep)
    expect(chain).toMatchObject({
      candidateWork: plans.candidateWorkApplyRecord,
      sidecar: plans.sidecarApplyRecord,
      source: plans.sourceApplyRecord,
      stage: plans.stageApplyRecord,
    })
    expect(chain.candidateWork).not.toHaveProperty("finishStep")
    expect(() =>
      finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
        ticket! as unknown as VNextTextBlockUnifiedLayoutSourceCommitFinishStepInternalV1,
      ),
    ).toThrow(/finish invariant/i)
    expect(inspectVNextTextBlockUnifiedLayoutSourceCommitForTestInternalV1(
      ticket!,
    ).phase).toBe("committing")
    expect(() =>
      finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
        structuredClone(chain.finishStep),
      ),
    ).toThrow(/finish invariant/i)
    finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(chain.finishStep)
  })

  it("rejects overlapping mint fault configuration", () => {
    try {
      setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1(
        "after-detached-minting-state",
      )
      expect(() =>
        setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1(
          "before-live-write",
        ),
      ).toThrow(/fault configuration invariant/i)
    } finally {
      setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1(
        null,
      )
    }
  })

  it("replaces the live graph with a minimal tombstone and rejects replay", () => {
    const tuple = participantTuple()
    const plans = preparedPlans()
    const ticket = mintPrepared(plans, tuple)
    expect(ticket).not.toBeNull()
    const chain = inspectSequentialCommitChainForTest(ticket!)
    expect(() =>
      beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(ticket!),
    ).toThrow(/ticket invariant/i)
    finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(chain.finishStep)

    for (const planAuthority of [
      plans.candidateWorkPlanAuthority,
      plans.sidecarPlanAuthority,
      plans.sourcePlanAuthority,
      plans.stagePlanAuthority,
    ]) {
      expect(
        isVNextTextBlockUnifiedLayoutSourceCommitPlanActivelyBoundForTestInternalV1(
          planAuthority,
        ),
      ).toBe(false)
    }
    expect(() =>
      beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(ticket!),
    ).toThrow(/ticket invariant/i)
    expect(() =>
      finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(chain.finishStep),
    ).toThrow(/finish invariant/i)

    const consumedTupleRetry = preparedPlans()
    expect(mintPrepared(consumedTupleRetry, tuple)).toBeNull()

    const foreignTicket =
      createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
    expect(
      attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        detachedTicket: foreignTicket,
        planAuthority: plans.candidateWorkPlanAuthority,
        sealAuthority: plans.candidateWorkPlanSealAuthority,
        applyRecord: plans.candidateWorkApplyRecord,
      }),
    ).toBe(false)
  })

  it.each(MINT_FAULT_POINTS)(
    "rolls back mint fault %s and keeps the exact participant tuple retryable",
    (faultPoint) => {
      const unrelatedTuple = participantTuple()
      const unrelatedPlans = preparedPlans()
      const unrelatedTicket = mintPrepared(unrelatedPlans, unrelatedTuple)
      expect(unrelatedTicket).not.toBeNull()

      const tuple = participantTuple()
      const rejectedPlans = preparedPlans()
      try {
        setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1(
          faultPoint,
        )
        expect(mintPrepared(rejectedPlans, tuple)).toBeNull()
      } finally {
        setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1(
          null,
        )
      }

      expect(
        inspectVNextTextBlockUnifiedLayoutSourceCommitForTestInternalV1(
          rejectedPlans.detachedTicket,
        ),
      ).toEqual({
        phase: "absent",
        attachedPlanCount: 0,
        activeProtectionCount: 0,
      })
      expect(
        isVNextTextBlockUnifiedLayoutSourceCommitCandidateWorkMeterProtectedInternalV1(
          tuple.candidateWorkMeter,
        ),
      ).toBe(false)
      expect(
        isVNextTextBlockUnifiedLayoutSourceCommitSidecarCandidateProtectedInternalV1(
          tuple.nextSidecarCandidateAuthority,
        ),
      ).toBe(false)
      expect(
        isVNextTextBlockUnifiedLayoutSourceCommitSourceCandidateProtectedInternalV1(
          tuple.sourcePathCopyCandidateAuthority,
        ),
      ).toBe(false)
      expect(
        isVNextTextBlockUnifiedLayoutSourceCommitAccessReservationProtectedInternalV1(
          tuple.sidecarRegistrationPreconditionAuthority,
        ),
      ).toBe(false)
      expect(
        inspectVNextTextBlockUnifiedLayoutSourceCommitForTestInternalV1(
          unrelatedTicket,
        ).phase,
      ).toBe("sealed")

      const retryPlans = preparedPlans()
      const retryTicket = mintPrepared(retryPlans, tuple)
      expect(retryTicket).not.toBeNull()
      finishSequentialCommitForTest(retryTicket!)
      finishSequentialCommitForTest(unrelatedTicket!)
    },
  )

  it("abandons a rejected detached ticket and keeps the exact participant tuple retryable", () => {
    const tuple = participantTuple()
    const rejected = preparedPlans()
    const wrongStagePlanAuthority =
      opaque<VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1>()

    expect(mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1({
      ...rejected,
      ...tuple,
      stagePlanAuthority: wrongStagePlanAuthority,
    })?.status).toBe("aborted")
    expect(
      inspectVNextTextBlockUnifiedLayoutSourceCommitForTestInternalV1(
        rejected.detachedTicket,
      ),
    ).toEqual({
      phase: "absent",
      attachedPlanCount: 0,
      activeProtectionCount: 0,
    })

    const foreignTicket =
      createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
    expect(
      attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        detachedTicket: foreignTicket,
        planAuthority: rejected.candidateWorkPlanAuthority,
        sealAuthority: rejected.candidateWorkPlanSealAuthority,
        applyRecord: rejected.candidateWorkApplyRecord,
      }),
    ).toBe(false)

    const retry = preparedPlans()
    expect(mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1({
      ...retry,
      ...tuple,
    })?.status).toBe("sealed")
  })

  it("rejects a plan authority reused across tickets or owner slots", () => {
    const firstTicket =
      createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
    const secondTicket =
      createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
    const candidateWorkPlanAuthority =
      opaque<VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1>()
    const candidateWorkSealAuthority =
      opaque<VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1>()
    const candidateWorkApplyRecord =
      opaque<VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1>()

    expect(
      attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        detachedTicket: firstTicket,
        planAuthority: candidateWorkPlanAuthority,
        sealAuthority: candidateWorkSealAuthority,
        applyRecord: candidateWorkApplyRecord,
      }),
    ).toBe(true)
    expect(
      attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        detachedTicket: firstTicket,
        planAuthority: candidateWorkPlanAuthority,
        sealAuthority: candidateWorkSealAuthority,
        applyRecord: candidateWorkApplyRecord,
      }),
    ).toBe(false)
    expect(
      attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        detachedTicket: secondTicket,
        planAuthority: candidateWorkPlanAuthority,
        sealAuthority: candidateWorkSealAuthority,
        applyRecord: candidateWorkApplyRecord,
      }),
    ).toBe(false)
    expect(
      attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
        detachedTicket: firstTicket,
        planAuthority: candidateWorkPlanAuthority as never,
        sealAuthority: opaque<VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1>(),
        applyRecord: opaque<VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1>(),
      }),
    ).toBe(false)
  })

  it("binds one exact four-plan Source commit tuple through consumed", () => {
    const detachedTicket =
      createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
    const candidateWorkPlanAuthority =
      opaque<VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1>()
    const sidecarPlanAuthority =
      opaque<VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanAuthorityInternalV1>()
    const sourcePlanAuthority =
      opaque<VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanAuthorityInternalV1>()
    const stagePlanAuthority =
      opaque<VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1>()
    const candidateWorkPublicationPreconditionAuthority =
      opaque<VNextTextBlockUnifiedLayout5B2SourcePublicationPreconditionAuthorityInternalV1>()
    const sidecarRegistrationPreconditionAuthority =
      opaque<VNextTextBlockUnifiedLayoutSourceStageSidecarPreconditionAuthorityInternalV1>()
    const candidateWorkMeter =
      opaque<VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1>()
    const nextSidecarCandidateAuthority =
      opaque<VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1>()
    const sourcePathCopyCandidateAuthority =
      opaque<VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1>()
    const candidateWorkPlanSealAuthority =
      opaque<VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealAuthorityInternalV1>()
    const sidecarPlanSealAuthority =
      opaque<VNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealAuthorityInternalV1>()
    const sourcePlanSealAuthority =
      opaque<VNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealAuthorityInternalV1>()
    const stagePlanSealAuthority =
      opaque<VNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealAuthorityInternalV1>()
    const candidateWorkApplyRecord =
      candidateWorkPlanAuthority as unknown as
        VNextTextBlockUnifiedLayoutCandidateWorkApplyRecordInternalV1
    const sidecarApplyRecord = sidecarPlanAuthority as unknown as
      VNextTextBlockUnifiedLayoutSourceSidecarApplyRecordInternalV1
    const sourceApplyRecord = sourcePlanAuthority as unknown as
      VNextTextBlockUnifiedLayoutSourceCandidateApplyRecordInternalV1
    const stageApplyRecord = stagePlanAuthority as unknown as
      VNextTextBlockUnifiedLayoutSourceStageApplyRecordInternalV1

    expect(
      attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        detachedTicket,
        planAuthority: candidateWorkPlanAuthority,
        sealAuthority: candidateWorkPlanSealAuthority,
        applyRecord: candidateWorkApplyRecord,
      }),
    ).toBe(true)
    expect(
      attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
        detachedTicket,
        planAuthority: sidecarPlanAuthority,
        sealAuthority: sidecarPlanSealAuthority,
        applyRecord: sidecarApplyRecord,
      }),
    ).toBe(true)
    expect(
      attachVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
        detachedTicket,
        planAuthority: sourcePlanAuthority,
        sealAuthority: sourcePlanSealAuthority,
        applyRecord: sourceApplyRecord,
      }),
    ).toBe(true)
    expect(
      attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
        detachedTicket,
        planAuthority: stagePlanAuthority,
        sealAuthority: stagePlanSealAuthority,
        applyRecord: stageApplyRecord,
      }),
    ).toBe(true)

    const mint = mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1({
      detachedTicket,
      candidateWorkPlanAuthority,
      sidecarPlanAuthority,
      sourcePlanAuthority,
      stagePlanAuthority,
      candidateWorkPlanSealAuthority,
      sidecarPlanSealAuthority,
      sourcePlanSealAuthority,
      stagePlanSealAuthority,
      candidateWorkPublicationPreconditionAuthority,
      sidecarRegistrationPreconditionAuthority,
      candidateWorkMeter,
      nextSidecarCandidateAuthority,
      sourcePathCopyCandidateAuthority,
    })
    expect(mint?.status).toBe("sealed")
    if (mint?.status !== "sealed") throw new Error("expected sealed mint")
    const ticket = mint.ticket
    expect(ticket).toBe(detachedTicket)
    expect(
      isVNextTextBlockUnifiedLayoutSourceCommitCandidateWorkMeterProtectedInternalV1(
        candidateWorkMeter,
      ),
    ).toBe(true)
    expect(
      isVNextTextBlockUnifiedLayoutSourceCommitSidecarCandidateProtectedInternalV1(
        nextSidecarCandidateAuthority,
      ),
    ).toBe(true)
    expect(
      isVNextTextBlockUnifiedLayoutSourceCommitSourceCandidateProtectedInternalV1(
        sourcePathCopyCandidateAuthority,
      ),
    ).toBe(true)
    expect(
      isVNextTextBlockUnifiedLayoutSourceCommitAccessReservationProtectedInternalV1(
        sidecarRegistrationPreconditionAuthority,
      ),
    ).toBe(true)
    const chain = inspectSequentialCommitChainForTest(ticket!)
    expect(chain).toMatchObject({
        candidateWork: candidateWorkPlanAuthority,
        sidecar: sidecarPlanAuthority,
        source: sourcePlanAuthority,
        stage: stagePlanAuthority,
      })

    finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(chain.finishStep)
    expect(
      inspectVNextTextBlockUnifiedLayoutSourceCommitForTestInternalV1(ticket),
    ).toEqual({
      phase: "consumed",
      attachedPlanCount: 0,
      activeProtectionCount: 0,
    })
    expect(
      isVNextTextBlockUnifiedLayoutSourceCommitCandidateWorkMeterProtectedInternalV1(
        candidateWorkMeter,
      ),
    ).toBe(false)
    expect(
      isVNextTextBlockUnifiedLayoutSourceCommitSidecarCandidateProtectedInternalV1(
        nextSidecarCandidateAuthority,
      ),
    ).toBe(false)
    expect(
      isVNextTextBlockUnifiedLayoutSourceCommitSourceCandidateProtectedInternalV1(
        sourcePathCopyCandidateAuthority,
      ),
    ).toBe(false)
    expect(
      isVNextTextBlockUnifiedLayoutSourceCommitAccessReservationProtectedInternalV1(
        sidecarRegistrationPreconditionAuthority,
      ),
    ).toBe(false)
  })
})
