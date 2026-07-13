import { describe, expect, it } from "vitest"
import {
  finalizeVNextDocumentCompositionClosedPageV1,
  finalizeVNextDocumentCompositionOpenPageV1,
  parseVNextDocumentCompositionClosedPageV1,
  parseVNextDocumentCompositionOpenPageV1,
  type VNextDocumentCompositionOpenPageInputV1,
} from "../src/index.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"

const fp = (value: string) => createVNextCompactFingerprint(value)

function openPageInput(): VNextDocumentCompositionOpenPageInputV1 {
  return {
    source: "vnext-document-composition-open-page",
    contractVersion: 1,
    kind: "document-composition-open-page",
    documentId: "document-1",
    manifestFingerprint: fp("manifest"),
    pageIndex: 0,
    pageNumber: 1,
    sectionIndex: 0,
    sectionId: "section-1",
    sectionPageIndex: 0,
    pageGeometry: {
      pageWidthPt: 600, pageHeightPt: 800,
      bodyOriginXPt: 50, bodyOriginYPt: 50, bodyWidthPt: 500, bodyHeightPt: 100,
    },
    staticZones: [{ role: "header", zoneId: "header", evidenceFingerprint: fp("header") }],
    placements: [{
      placementIndex: 0,
      itemIndex: 0,
      sectionId: "section-1",
      zoneId: "body",
      sourceOrder: 0,
      rootNodeId: "heading",
      rootNodeType: "text-block",
      family: "text-flow",
      fragmentId: "heading:f0",
      fragmentIndex: 0,
      sourceNodeId: "heading",
      blockOffsetPt: 0,
      blockExtentPt: 20,
      continuation: { fromPrevious: false, toNext: false },
      familyEvidenceFingerprint: fp("heading-evidence"),
      familyWindowFingerprint: fp("heading-window"),
      heading: { headingNodeId: "heading", level: 1 },
    }, {
      placementIndex: 1,
      itemIndex: 1,
      sectionId: "section-1",
      zoneId: "body",
      sourceOrder: 1,
      rootNodeId: "divider",
      rootNodeType: "divider",
      family: "utility-flow",
      fragmentId: "divider:f0",
      fragmentIndex: 0,
      sourceNodeId: "divider",
      blockOffsetPt: 20,
      blockExtentPt: 20,
      continuation: { fromPrevious: false, toNext: false },
      familyEvidenceFingerprint: fp("divider-evidence"),
      familyWindowFingerprint: fp("divider-window"),
      heading: null,
    }],
    usedHeightPt: 40,
    remainingHeightPt: 60,
    intentionalBlank: false,
    previousClosedPagePrefixFingerprint: null,
    closedPageCountBefore: 0,
    closedPlacementCountBefore: 0,
    closedHeadingCountBefore: 0,
  }
}

describe("document Composition page contracts v1", () => {
  it("finalizes and parses one bounded open page deterministically", () => {
    const input = openPageInput()
    const before = structuredClone(input)
    const first = finalizeVNextDocumentCompositionOpenPageV1(input)
    expect(first).toMatchObject({ status: "ready", page: { usedHeightPt: 40, remainingHeightPt: 60 } })
    expect(input).toEqual(before)
    if (first.status !== "ready") throw new Error("open page fixture blocked")
    expect(parseVNextDocumentCompositionOpenPageV1(first.page)).toEqual(first)
  })

  it("blocks overlap, extent, heading, prefix, and intentional-blank drift", () => {
    const cases: Array<[string, (input: VNextDocumentCompositionOpenPageInputV1) => void, string]> = [
      ["overlap", (input) => { input.placements[1].blockOffsetPt = 10 }, "composition-placement-overlap"],
      ["extent", (input) => { input.placements[1].blockExtentPt = 30 }, "composition-placement-out-of-page"],
      ["heading", (input) => { input.placements[0].continuation.fromPrevious = true }, "composition-page-heading-first-fragment-invalid"],
      ["prefix", (input) => { input.closedPageCountBefore = 1 }, "composition-page-prefix-count-mismatch"],
      ["blank", (input) => { input.intentionalBlank = true }, "composition-intentional-blank-geometry-invalid"],
      ["family", (input) => { input.placements[1].rootNodeType = "image" }, "composition-placement-family-root-mismatch"],
    ]
    for (const [, mutate, code] of cases) {
      const input = openPageInput()
      mutate(input)
      expect(finalizeVNextDocumentCompositionOpenPageV1(input)).toMatchObject({
        status: "blocked", issues: expect.arrayContaining([expect.objectContaining({ code })]),
      })
    }
  })

  it("chains a closed page prefix and rejects retained tampering", () => {
    const open = openPageInput()
    const closed = finalizeVNextDocumentCompositionClosedPageV1({
      ...open,
      source: "vnext-document-composition-closed-page",
      kind: "document-composition-closed-page",
      closeReason: "document-complete",
    })
    expect(closed).toMatchObject({
      status: "ready",
      page: {
        fingerprint: expect.stringMatching(/^sha256:/),
        closedPagePrefixFingerprint: expect.stringMatching(/^sha256:/),
      },
    })
    if (closed.status !== "ready") throw new Error("closed page fixture blocked")
    expect(closed.page.closedPagePrefixFingerprint).not.toBe(closed.page.fingerprint)
    expect(parseVNextDocumentCompositionClosedPageV1(closed.page)).toEqual(closed)
    const tampered = structuredClone(closed.page)
    tampered.remainingHeightPt = 50
    expect(parseVNextDocumentCompositionClosedPageV1(tampered)).toMatchObject({ status: "blocked" })
  })

  it("allows intentional blank only as an empty page-break close", () => {
    const input = openPageInput()
    input.placements = []
    input.usedHeightPt = 0
    input.remainingHeightPt = 100
    input.intentionalBlank = true
    expect(finalizeVNextDocumentCompositionClosedPageV1({
      ...input,
      source: "vnext-document-composition-closed-page",
      kind: "document-composition-closed-page",
      closeReason: "page-break",
    })).toMatchObject({ status: "ready", page: { intentionalBlank: true } })
    expect(finalizeVNextDocumentCompositionClosedPageV1({
      ...input,
      source: "vnext-document-composition-closed-page",
      kind: "document-composition-closed-page",
      closeReason: "section-boundary",
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "composition-intentional-blank-reason-invalid" })],
    })
  })
})
