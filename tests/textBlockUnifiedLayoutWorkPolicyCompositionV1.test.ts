import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1,
  registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1,
  resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1,
  type VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1,
} from "../src/layout/textBlockUnifiedLayoutWorkOwnerRegistryV1.js"
import {
  admitted5B2PlanARootFixture,
  FIVE_B2_TEST_POLICY,
  registered5B2RootFixture,
} from "./helpers/textBlockUnifiedIncremental5b2.js"

const PRE_TASK_FINGERPRINT =
  "sha256:116104c60a13a8021ff3210f718e1f9bebdde1cdd95df34f4689c847572a8924"

const allSourceLimits = (
  overrides: Partial<VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1> = {},
): VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1 => ({
  sourceItems: 11,
  sourceTreeLookupNodes: 12,
  sourceTreePathCopyNodes: 13,
  sourceLeafSlots: 14,
  sourceIndexNodes: 15,
  sourceIndexEntries: 16,
  sourceIndexComparisons: 17,
  sourceStyleNodes: 18,
  sourceStyleBuckets: 19,
  sourceStyleEntries: 20,
  ...overrides,
})

function planAPolicy(
  sourceLimits: Partial<VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1> = {},
) {
  return createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1({
    publicWorkPolicy: FIVE_B2_TEST_POLICY,
    sourceLimits: allSourceLimits(sourceLimits),
  })
}

describe("Phase 5B-2 private Plan A work-policy composition", () => {
  it("composes exact slices without changing frozen public policy identity", () => {
    const composition = planAPolicy({ sourceIndexComparisons: 3 })

    expect(composition.publicWorkPolicy).toBe(FIVE_B2_TEST_POLICY)
    expect(composition.rows.map((row) => row.ownerRow))
      .toEqual(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1)
    expect(composition.rows).toHaveLength(80)
    expect(composition.rows.filter((row) => row.execution.kind === "accepted-foundation"))
      .toHaveLength(18)
    expect(composition.rows.filter((row) => row.execution.kind === "test-active"))
      .toHaveLength(10)
    expect(composition.rows.filter((row) => row.execution.kind === "inactive"))
      .toHaveLength(52)
    expect(composition.rows.find((row) => row.ownerRow.unit === "source-index-comparisons"))
      .toMatchObject({ execution: { kind: "test-active", limit: 3 } })
    expect(FIVE_B2_TEST_POLICY.fingerprint).toBe(PRE_TASK_FINGERPRINT)
  })

  it("keeps exact activation states and fingerprints deterministic", () => {
    const first = planAPolicy()
    const second = planAPolicy()

    expect(first).not.toBe(second)
    expect(first.fingerprint).toBe(second.fingerprint)
    expect(planAPolicy({ sourceItems: 0 }).fingerprint).not.toBe(first.fingerprint)
    expect(first.rows.filter((row) => row.ownerRow.activationPlan === "B"))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({
          execution: { kind: "inactive", reason: "reserved-until-plan-B-v1" },
        }),
      ]))
    expect(first.rows.filter((row) => row.ownerRow.activationPlan === "C"))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({
          execution: { kind: "inactive", reason: "reserved-until-plan-C-v1" },
        }),
      ]))
    expect(first.rows.filter((row) => row.ownerRow.activationPlan === "D"))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({
          execution: { kind: "inactive", reason: "reserved-until-plan-D-v1" },
        }),
      ]))
  })

  it("rejects cloned policy, malformed limits, inherited fields, and accessors", () => {
    const malformed = [
      allSourceLimits({ sourceItems: -1 }),
      allSourceLimits({ sourceItems: Number.MAX_SAFE_INTEGER + 1 }),
      allSourceLimits({ sourceItems: 1.5 }),
      Object.assign(allSourceLimits(), { unknown: 1 }),
      (() => {
        const { sourceItems: _sourceItems, ...missing } = allSourceLimits()
        return missing
      })(),
      Object.assign(Object.create({ sourceItems: 1 }), (() => {
        const { sourceItems: _sourceItems, ...rest } = allSourceLimits()
        return rest
      })()),
      (() => {
        const limits = allSourceLimits()
        Object.defineProperty(limits, "sourceItems", {
          enumerable: true,
          get() {
            throw new Error("must not read accessor")
          },
        })
        return limits
      })(),
    ]

    for (const sourceLimits of malformed) {
      expect(() => createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1({
        publicWorkPolicy: FIVE_B2_TEST_POLICY,
        sourceLimits: sourceLimits as VNextTextBlockUnifiedLayout5B2PlanATestLimitsInternalV1,
      })).toThrow()
    }
    expect(() => createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1({
      publicWorkPolicy: structuredClone(FIVE_B2_TEST_POLICY),
      sourceLimits: allSourceLimits(),
    })).toThrow()
    const accessorInput = { publicWorkPolicy: FIVE_B2_TEST_POLICY }
    Object.defineProperty(accessorInput, "sourceLimits", {
      enumerable: true,
      get() {
        throw new Error("must not read accessor")
      },
    })
    expect(() => createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1(
      accessorInput as never,
    )).toThrow()
  })

  it("binds one exact composition to one exact registered Root", () => {
    const composition = planAPolicy()
    const root = registered5B2RootFixture({ content: "text-only", text: "Plan A" })
    const otherRoot = registered5B2RootFixture({ content: "text-only", text: "Plan B" })

    expect(resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(
      structuredClone(root),
    )).toBeNull()
    expect(registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1({
      root,
      composition: structuredClone(composition),
    })).toBe(false)
    expect(registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1({
      root,
      composition: Object.freeze({
        ...composition,
        rows: Object.freeze([...composition.rows].reverse()),
      }),
    })).toBe(false)
    expect(registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1({
      root,
      composition,
    })).toBe(true)
    expect(registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1({
      root,
      composition,
    })).toBe(false)
    expect(registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1({
      root: otherRoot,
      composition,
    })).toBe(false)
    expect(resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(root))
      .toBe(composition)
  })

  it("provides a test-only Plan A Root fixture with finite default limits", () => {
    const fixture = admitted5B2PlanARootFixture({
      sourceLimits: { sourceStyleEntries: 7 },
      text: "Plan A helper",
    })

    expect(fixture.composition.publicWorkPolicy).toBe(FIVE_B2_TEST_POLICY)
    expect(fixture.composition.rows.find((row) => row.ownerRow.unit === "source-style-entries"))
      .toMatchObject({ execution: { kind: "test-active", limit: 7 } })
    expect(fixture.composition.rows.find((row) => row.ownerRow.unit === "source-items"))
      .toMatchObject({ execution: { kind: "test-active", limit: Number.MAX_SAFE_INTEGER } })
    expect(resolveVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1(fixture.root))
      .toBe(fixture.composition)
  })
})
