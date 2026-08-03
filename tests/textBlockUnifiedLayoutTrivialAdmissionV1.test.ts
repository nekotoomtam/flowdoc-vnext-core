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

function attemptPreflight(input: {
  readonly root: ReturnType<typeof admitted5B2RootFixture>
  readonly change: ReturnType<typeof replaceText>
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
