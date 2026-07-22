import { describe, expect, it } from "vitest"
import {
  VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1,
  collectVNextTextBlockPersistentFlowNodesForQaV1,
  createVNextTextBlockPersistentFlowTreeV1,
  inspectVNextTextBlockPersistentFlowTreeV1,
} from "../src/index.js"
import {
  acceptedPersistentAtomicFlowFixture,
  acceptedPersistentFlowFixture,
} from "./helpers/textBlockPersistentFlowV1.js"

describe("TextBlock persistent flow tree v1", () => {
  it("pins policy and projects accepted mixed Text Run and field facts", () => {
    const fixture = acceptedPersistentFlowFixture()
    const first = createVNextTextBlockPersistentFlowTreeV1(fixture)
    const second = createVNextTextBlockPersistentFlowTreeV1(fixture)
    if (first.status !== "accepted" || second.status !== "accepted") {
      throw new Error("persistent flow tree blocked")
    }

    expect(VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1).toMatchObject({
      maximumItemRenderedUtf16Length: 256,
      maximumLeafItems: 8,
      maximumBranchChildren: 8,
      fingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
    })
    expect(first.tree).toEqual(second.tree)
    expect(first.tree.summary).toMatchObject({
      renderedUtf16Length: fixture.request.measurement.renderedText.length,
      itemCount: expect.any(Number),
      leafCount: expect.any(Number),
      sourceRunCount: fixture.request.measurement.runs.length,
    })
    expect(first.tree.summary.itemCount).toBeGreaterThanOrEqual(
      fixture.request.measurement.runs.length,
    )
    expect(first.tree.itemsByKind).toMatchObject({ text: 3, "resolved-field": 1 })
    expect(inspectVNextTextBlockPersistentFlowTreeV1(first.tree)).toEqual({
      status: "valid",
      fingerprint: first.tree.fingerprint,
    })
    expect(Object.isFrozen(first.tree)).toBe(true)
    expect(collectVNextTextBlockPersistentFlowNodesForQaV1(first.tree).every(Object.isFrozen)).toBe(true)
  })

  it("keeps node fingerprints offset-independent and fails closed", () => {
    const fixture = acceptedPersistentFlowFixture()
    const accepted = createVNextTextBlockPersistentFlowTreeV1(fixture)
    if (accepted.status !== "accepted") throw new Error("persistent flow tree blocked")
    const serialized = JSON.stringify(accepted.tree.root)
    expect(serialized).not.toContain("renderStartOffset")
    expect(serialized).not.toContain("renderEndOffset")

    expect(createVNextTextBlockPersistentFlowTreeV1({
      request: { ...fixture.request, bindProductionLayout: true },
      acceptedLayout: fixture.acceptedLayout,
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "production-binding-forbidden" }],
    })
    expect(inspectVNextTextBlockPersistentFlowTreeV1(structuredClone(accepted.tree))).toMatchObject({
      status: "invalid",
      code: "tree-provenance-mismatch",
    })
  })

  it("retains generated page numbers and hard breaks as explicit flow items", () => {
    const fixture = acceptedPersistentAtomicFlowFixture()
    const result = createVNextTextBlockPersistentFlowTreeV1(fixture)
    if (result.status !== "accepted") throw new Error("persistent atomic tree blocked")
    expect(result.tree.itemsByKind).toMatchObject({
      text: 1,
      "resolved-field": 1,
      "generated-page-number": 1,
      "hard-break": 1,
    })
    expect(result.tree.summary).toMatchObject({ atomicSourceCount: 3, mandatoryBreakCount: 1 })
  })
})
