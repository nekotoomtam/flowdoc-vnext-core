import { describe, expect, it } from "vitest"
import {
  prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionPreflightV2.js"
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

  it("mints admission for an image-free trivial-Spatial auto-height Root", () => {
    const root = admitted5B2RootFixture({ content: "text-only", text: "AB" })
    const result = attemptPreflight({ root, change: replaceText(root, "C") })
    expect(result.status).toBe("required")
  })

  it("rejects an inline-image Root before evidence work", () => {
    const root = admitted5B2RootFixture({ content: "text-image-text" })
    const result = attemptPreflight({ root, change: replaceText(root, "C") })
    expect(result.status).toBe("fallback-required")
    expect(evidenceRequestCount(result)).toBe(0)
  })
})
