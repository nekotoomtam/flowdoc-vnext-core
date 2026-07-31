import { describe, expect, it } from "vitest"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionChangeInternalsV1.js"
import {
  imagePaintUnifiedLayoutChange5b,
  noOpUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
import {
  acceptedUnifiedLayoutRootFixtureV2,
  ROOT_V2_TEST_WORK_POLICY,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"

describe("Phase 5B-1 Core-derived transition evidence", () => {
  it("binds frozen effects and fingerprints them into exact validated changes", () => {
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
      const shaped = validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1(
        row.change,
      )
      expect(shaped.status).toBe("accepted")
      if (shaped.status !== "accepted") continue
      const classification = result.validatedChange.effectClassification
      const fingerprintWithoutClassification = createVNextCompactFingerprint(
        stringifyVNextCanonicalJson({
          changeFingerprint: shaped.fingerprint,
          eligibility: result.validatedChange.eligibility,
          producerEvidence: result.validatedChange.producerEvidence,
          expectedTargetBinding: result.validatedChange.expectedTargetBinding,
        }),
      )
      const fingerprintWithClassification = createVNextCompactFingerprint(
        stringifyVNextCanonicalJson({
          changeFingerprint: shaped.fingerprint,
          eligibility: result.validatedChange.eligibility,
          producerEvidence: result.validatedChange.producerEvidence,
          expectedTargetBinding: result.validatedChange.expectedTargetBinding,
          effectClassification: classification,
        }),
      )
      expect(result.validatedChange.fingerprint).toBe(
        fingerprintWithClassification,
      )
      expect(result.validatedChange.fingerprint).not.toBe(
        fingerprintWithoutClassification,
      )
    }
    expect(new Set(bound.map(({ result }) => (
      result.status === "accepted"
        ? result.validatedChange.effectClassification.fingerprint
        : null
    ))).size).toBe(2)
    const repeatedNoOp = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
      previousRoot: previous.root,
      change: rows[0].change,
      workPolicy: ROOT_V2_TEST_WORK_POLICY,
    })
    expect(repeatedNoOp.status).toBe("accepted")
    if (
      repeatedNoOp.status !== "accepted"
      || bound[0].result.status !== "accepted"
    ) return
    expect(repeatedNoOp.validatedChange.effectClassification)
      .toEqual(bound[0].result.validatedChange.effectClassification)
    expect(repeatedNoOp.validatedChange.fingerprint)
      .toBe(bound[0].result.validatedChange.fingerprint)
  })
})
