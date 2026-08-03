import { describe, expect, it } from "vitest"
import {
  prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionPreflightV2.js"
import {
  registerVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTrivialAdmissionInternalsV1.js"
import {
  acceptedUnifiedLayoutRootFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"
import {
  FIVE_B2_TEST_POLICY,
  admitted5B2RootFixture,
  admitted5B2HardBreakRootFixture,
  admitted5B2NondefaultAutoHeightRootFixture,
  authoredBoxMutation5B2Fixture,
  registered5B2RootWithAuthoredBoxProfileFixture,
} from "./helpers/textBlockUnifiedIncremental5b2.js"

function frozen<T>(value: T): T {
  if (value != null && typeof value === "object") {
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor != null && Object.hasOwn(descriptor, "value")) frozen(descriptor.value)
    }
    if (!Object.isFrozen(value)) Object.freeze(value)
  }
  return value
}

function replaceText(root: ReturnType<typeof admitted5B2RootFixture>, insertedText: string) {
  const item = root.sourceState.root.nodeKind === "leaf"
    ? root.sourceState.root.items.find((candidate) => candidate.kind === "text")
    : null
  if (item?.kind !== "text") throw new Error("text fixture missing")
  return frozen({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "text-replacement" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    removedRange: { startRenderedUtf16: 0, endRenderedUtf16: item.renderedUtf16Length },
    expectedRemovedContentFingerprint: item.contentFingerprint,
    expectedRemovedSourceFingerprint: item.sourceFingerprint,
    expectedRemovedProvenanceFingerprint: item.provenanceFingerprint,
    insertedText,
    insertedSource: {
      lineageId: "replacement",
      sourceFingerprint: "replacement-source",
      provenanceFingerprint: "replacement-provenance",
    },
    measurementStyleKey: item.style.measurementStyleKey,
    effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
  })
}

function insertText(root: ReturnType<typeof admitted5B2RootFixture>, insertedText: string) {
  const item = root.sourceState.root.nodeKind === "leaf"
    ? root.sourceState.root.items.find((candidate) => candidate.kind === "text")
    : null
  if (item?.kind !== "text") throw new Error("text fixture missing")
  return frozen({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "text-insertion" as const,
    documentId: root.documentId, sectionId: root.sectionId, textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    atRenderedUtf16: 0,
    insertedText,
    insertedSource: { lineageId: "insert", sourceFingerprint: "insert-source", provenanceFingerprint: "insert-provenance" },
    measurementStyleKey: item.style.measurementStyleKey,
    effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
  })
}

function replaceRenderedRange(
  root: ReturnType<typeof admitted5B2RootFixture>,
  startRenderedUtf16: number,
  endRenderedUtf16: number,
  insertedText: string,
) {
  const item = root.sourceState.root.nodeKind === "leaf"
    ? root.sourceState.root.items.find((candidate) => candidate.kind === "text")
    : null
  if (item?.kind !== "text") throw new Error("text fixture missing")
  return frozen({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "text-replacement" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    removedRange: { startRenderedUtf16, endRenderedUtf16 },
    expectedRemovedContentFingerprint: "hand-derived-cross-break-content",
    expectedRemovedSourceFingerprint: "hand-derived-cross-break-source",
    expectedRemovedProvenanceFingerprint: "hand-derived-cross-break-provenance",
    insertedText,
    insertedSource: {
      lineageId: "cross-break-replacement",
      sourceFingerprint: "cross-break-replacement-source",
      provenanceFingerprint: "cross-break-replacement-provenance",
    },
    measurementStyleKey: item.style.measurementStyleKey,
    effectiveShapingStyleKey: item.style.effectiveShapingStyleKey,
  })
}

function authoredBoxMutation(
  root: ReturnType<typeof admitted5B2RootFixture>,
  nextAuthoredBoxPlan: ReturnType<typeof authoredBoxMutation5B2Fixture>["nextAuthoredBoxPlan"],
) {
  return frozen({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "authored-box-width-inset-change" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    expectedAuthoredBoxPlanFingerprint: root.sourceState.authoredBoxPlan.fingerprint,
    nextAuthoredBoxPlan,
  })
}

function attemptPreflight(input: {
  readonly root: ReturnType<typeof admitted5B2RootFixture>
  readonly change: Parameters<
    typeof prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2
  >[0]["change"]
}) {
  return prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
    previousRoot: input.root,
    change: input.change,
    workPolicy: FIVE_B2_TEST_POLICY,
  })
}

function evidenceRequestCount(result: ReturnType<typeof attemptPreflight>): number {
  return result.completedCandidateWork.evidence.requestCount
}

function expectNoEvidence(result: ReturnType<typeof attemptPreflight>) {
  expect(evidenceRequestCount(result)).toBe(0)
  expect(Object.hasOwn(result, "request")).toBe(false)
  expect(Object.hasOwn(result, "sourceMaterial")).toBe(false)
  expect(result.status === "fallback-required" ? result.issues : result.issues).toEqual([])
}

describe("Text-block unified trivial admission V1", () => {
  const rejectedOrdinaryText = ["\r", "\n", "\u2028", "\u2029", "\ufffc"] as const

  it.each(rejectedOrdinaryText)(
    "rejects ordinary replacement sentinel %j before evidence work",
    (text) => {
      const root = admitted5B2RootFixture({ content: "text-only", text: "AB" })
      const result = attemptPreflight({ root, change: replaceText(root, text) })
      expect(result.status).toBe("fallback-required")
      expect(evidenceRequestCount(result)).toBe(0)
    },
  )

  it.each(rejectedOrdinaryText)(
    "rejects ordinary insertion sentinel %j before Evidence request or producer material",
    (text) => {
      const root = admitted5B2RootFixture({ content: "text-only", text: "AB" })
      const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
        previousRoot: root, change: insertText(root, text), workPolicy: FIVE_B2_TEST_POLICY,
      })
      expect(result).toMatchObject({ status: "fallback-required", reason: "unsupported-structural-change" })
      expectNoEvidence(result as ReturnType<typeof attemptPreflight>)
    },
  )

  it("mints admission for an image-free trivial-Spatial auto-height Root", () => {
    const root = admitted5B2RootFixture({ content: "text-only", text: "AB" })
    const result = attemptPreflight({ root, change: replaceText(root, "C") })
    expect(result.status).toBe("required")
  })

  it("rejects an ordinary edit range crossing a retained structural hard break before Evidence request or producer material", () => {
    // Catches removal of the retained hard-break overlap gate in V2 preflight.
    const root = admitted5B2HardBreakRootFixture()
    const result = attemptPreflight({
      root,
      change: replaceRenderedRange(root, 2, 4, "x"),
    })
    expect(result).toMatchObject({
      status: "fallback-required",
      reason: "unsupported-structural-change",
    })
    expectNoEvidence(result)
  })

  it("rejects an authored-box width/inset mutation before Evidence request or producer material", () => {
    // Catches accidental activation of authored-box mutation in the 5B-2 preflight lane.
    const fixture = authoredBoxMutation5B2Fixture()
    const result = attemptPreflight({
      root: fixture.root,
      change: authoredBoxMutation(fixture.root, fixture.nextAuthoredBoxPlan),
    })
    expect(result).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({
        code: "inactive-work-policy-stage",
        path: "change.kind",
      })],
    })
    expect(evidenceRequestCount(result)).toBe(0)
    expect(Object.hasOwn(result, "request")).toBe(false)
    expect(Object.hasOwn(result, "sourceMaterial")).toBe(false)
  })

  it.each([
    {
      label: "fixed-height",
      authoredBoxProfile: {
        heightPolicy: "fixed-height" as const,
        clippingPolicy: "none" as const,
        overflowPolicy: "none" as const,
      },
    },
    {
      label: "clipping",
      authoredBoxProfile: {
        heightPolicy: "auto-height" as const,
        clippingPolicy: "clip" as const,
        overflowPolicy: "none" as const,
      },
    },
    {
      label: "overflow",
      authoredBoxProfile: {
        heightPolicy: "auto-height" as const,
        clippingPolicy: "none" as const,
        overflowPolicy: "allow" as const,
      },
    },
  ])("rejects private complete-kernel $label profile before Evidence request or producer material", ({ authoredBoxProfile }) => {
    // Catches omission of the fail-closed height/clip/overflow owner-profile predicate.
    const root = registered5B2RootWithAuthoredBoxProfileFixture(authoredBoxProfile)
    expect(registerVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1({
      root,
      source: root.sourceState,
      spatialState: root.spatialState,
      authoredBox: root.authoredBoxSummary,
      workPolicy: root.workPolicy,
    })).toBeNull()
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: root,
      change: replaceText(root, "C"),
      workPolicy: root.workPolicy,
    })
    expect(result).toMatchObject({
      status: "fallback-required",
      reason: "unadmitted-root",
    })
    expectNoEvidence(result)
  })

  it("mints admission for a supported nondefault unchanged auto-height Root through the private 5B-2 kernel", () => {
    // Catches an admission predicate that incorrectly hard-codes default width/insets.
    const root = admitted5B2NondefaultAutoHeightRootFixture()
    expect(root.authoredBoxSummary).toMatchObject({
      outerWidthLayoutUnit: 124_000_000,
      contentLeftLayoutUnit: 9_000_000,
      contentWidthLayoutUnit: 108_000_000,
    })
    const result = attemptPreflight({ root, change: replaceText(root, "C") })
    expect(result.status).toBe("required")
  })

  it("keeps an admitted equal-rendered provenance replacement out of true-no-op", () => {
    const root = admitted5B2RootFixture({ content: "text-only", text: "A" })
    const result = attemptPreflight({ root, change: replaceText(root, "A") })
    expect(result.status).toBe("not-required")
    if (result.status !== "not-required") return
    expect(result.preflight.effectClassificationV2.effectClass).toBe("semantic-only")
  })

  it("rejects an inline-image Root before evidence work", () => {
    const root = admitted5B2RootFixture({ content: "text-image-text" })
    const result = attemptPreflight({ root, change: replaceText(root, "C") })
    expect(result.status).toBe("fallback-required")
    expect(evidenceRequestCount(result)).toBe(0)
  })

  it("rejects a nontrivial Spatial Root before evidence work", () => {
    const root = admitted5B2RootFixture({
      content: "text-only",
      text: "AB",
      entries: [{
        objectId: "spatial-1",
        geometryOwnerFingerprint: `sha256:${"a".repeat(64)}`,
        xLayoutUnit: 0,
        yLayoutUnit: 0,
        widthLayoutUnit: 1_000_000,
        heightLayoutUnit: 1_000_000,
        clearance: { topLayoutUnit: 0, rightLayoutUnit: 0, bottomLayoutUnit: 0, leftLayoutUnit: 0 },
        wrapPolicy: "rectangular-exclusion",
      }],
    })
    const result = attemptPreflight({ root, change: replaceText(root, "C") })
    expect(result).toMatchObject({ status: "fallback-required", reason: "unadmitted-root" })
    expect(evidenceRequestCount(result)).toBe(0)
  })

  it("does not mint admission from a matching tuple outside the 5B-2 complete kernel", () => {
    const root = acceptedUnifiedLayoutRootFixtureV2({ content: "text-only" }).root
    expect(registerVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1({
      root,
      source: root.sourceState,
      spatialState: root.spatialState,
      authoredBox: root.authoredBoxSummary,
      workPolicy: root.workPolicy,
    })).toBeNull()
  })

  it("blocks an unknown text style before Evidence request or producer material", () => {
    const root = admitted5B2RootFixture({ content: "text-only", text: "AB" })
    const change = frozen({ ...insertText(root, "X"), measurementStyleKey: "unknown", effectiveShapingStyleKey: "unknown" })
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({ previousRoot: root, change, workPolicy: FIVE_B2_TEST_POLICY })
    expect(result.status).toBe("blocked")
    expect(result.completedCandidateWork.evidence.requestCount).toBe(0)
  })

  it("blocks the inactive generated-page mutation family before Evidence request", () => {
    const root = admitted5B2RootFixture({ content: "text-only", text: "AB" })
    const result = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
      previousRoot: root,
      change: frozen({ ...insertText(root, "X"), kind: "generated-page-number-mutation" }) as never,
      workPolicy: FIVE_B2_TEST_POLICY,
    })
    expect(result.status).toBe("blocked")
    expect(result.completedCandidateWork.evidence.requestCount).toBe(0)
  })
})
