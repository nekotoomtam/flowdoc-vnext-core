import { describe, expect, it } from "vitest"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2,
} from "../src/layout/textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import type {
  VNextTextBlockUnifiedLayoutStageUnitV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionContractV1.js"

describe("Phase 5B-2A evidence work owner registry", () => {
  it("assigns every reviewed evidence unit to its exact owner in ledger order", () => {
    const rows =
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2
    const expected = [
      ["evidence-request-descriptors", "core-preflight"],
      ["evidence-context-atoms", "core-materialization"],
      ["evidence-material-descriptors", "core-materialization"],
      ["evidence-producer-descriptors", "producer"],
      ["evidence-runtime-invocations", "producer"],
      ["evidence-runtime-input-scalars", "producer"],
      ["evidence-glyphs", "producer"],
      ["evidence-clusters", "producer"],
      ["evidence-breaks", "producer"],
      ["evidence-guards", "producer"],
      ["evidence-proof-facts", "producer"],
      ["evidence-response-facts", "producer"],
      ["evidence-acceptance-descriptors", "core-acceptance"],
      ["evidence-acceptance-comparisons", "core-acceptance"],
      ["evidence-acceptance-registrations", "core-acceptance"],
    ] as const
    const acceptsStageUnit = (
      _unit: VNextTextBlockUnifiedLayoutStageUnitV1,
    ): void => undefined

    expect(rows.map(({ unit, owner }) => [unit, owner])).toEqual(expected)
    expect(new Set(rows.map((row) => row.unit)).size).toBe(rows.length)
    expect(rows.every((row) => row.stage === "evidence"
      && row.ledger === "incrementalCandidateWork")).toBe(true)
    rows.forEach((row) => acceptsStageUnit(row.unit))
  })

  it("retains the frozen 5B-1 V3 policy roster and fingerprint", () => {
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.stages)
      .toHaveLength(21)
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.fingerprint).toBe(
      "sha256:896f2163367070bd1f1e6fa0d9b34c0f47e371e6256cc9c15bd27e898c185982",
    )
  })
})
