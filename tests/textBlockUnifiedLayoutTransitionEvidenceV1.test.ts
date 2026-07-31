import { describe, expect, it } from "vitest"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  imagePaintUnifiedLayoutChange5b,
  noOpUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import {
  acceptedUnifiedLayoutRootFixtureV2,
  ROOT_V2_TEST_WORK_POLICY,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"

describe("Phase 5B-1 Core-derived transition evidence", () => {
  it("binds the closed effect classes from exact Root-owned target facts", () => {
    const previous = acceptedUnifiedLayoutRootFixtureV2({ fit: "contain" })
    const rows = [
      {
        label: "bound no-op",
        change: noOpUnifiedLayoutChange5b(previous.root),
        effectClass: "true-no-op",
        semanticIdentityChanged: false,
      },
      {
        label: "unchanged image fit and crop",
        change: imagePaintUnifiedLayoutChange5b(previous.root, {
          fit: "contain",
          crop: null,
        }),
        effectClass: "true-no-op",
        semanticIdentityChanged: false,
      },
      {
        label: "changed image fit and crop",
        change: imagePaintUnifiedLayoutChange5b(previous.root, {
          fit: "cover",
          crop: { x: 0, y: 0, width: 0.5, height: 1 },
        }),
        effectClass: "paint-affecting-change",
        semanticIdentityChanged: false,
      },
      {
        label: "inactive text change",
        change: Object.freeze({
          source: "vnext-text-block-unified-layout-change-v1" as const,
          contractVersion: 1 as const,
          documentId: previous.root.documentId,
          sectionId: previous.root.sectionId,
          textBlockId: previous.root.textBlockId,
          expectedPreviousRootFingerprint: previous.root.fingerprint,
          expectedPreviousSourceFingerprint:
            previous.root.sourceState.fingerprint,
          kind: "text-insertion" as const,
          atRenderedUtf16: 0,
          insertedText: "x",
          insertedSource: Object.freeze({
            lineageId: "lineage-next",
            sourceFingerprint: "source-next",
            provenanceFingerprint: "provenance-next",
          }),
          measurementStyleKey: "measurement-style-next",
          effectiveShapingStyleKey: "shaping-style-next",
        }),
        effectClass: "geometry-affecting-change",
        semanticIdentityChanged: true,
      },
    ] as const

    const bound = rows.map((row) => ({
      row,
      result: bindVNextTextBlockUnifiedLayoutChangeInternalV1({
        previousRoot: previous.root,
        change: row.change,
        workPolicy: ROOT_V2_TEST_WORK_POLICY,
      }),
    }))
    for (const { row, result } of bound) {
      expect(result.status, `${row.label}: ${JSON.stringify(result.issues)}`)
        .toBe("accepted")
      if (result.status !== "accepted") continue
      expect(result.validatedChange.effectClassification).toMatchObject({
        effectClass: row.effectClass,
        semanticIdentityChanged: row.semanticIdentityChanged,
      })
      expect(Object.isFrozen(result.validatedChange.effectClassification))
        .toBe(true)
      expect(result.validatedChange.effectClassification.fingerprint.length)
        .toBeGreaterThan(0)
    }
    expect(new Set(bound.map(({ result }) => (
      result.status === "accepted"
        ? result.validatedChange.effectClassification.fingerprint
        : null
    ))).size).toBe(3)
  })
})
