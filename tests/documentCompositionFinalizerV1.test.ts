import { describe, expect, it } from "vitest"
import {
  finalizeVNextDocumentCompositionClosedPageV1,
  finalizeVNextDocumentCompositionV1,
  parseVNextDocumentCompositionPagePlanV1,
} from "../src/index.js"
import { composeMixedSyntheticDocument } from "./helpers/documentCompositionV1Fixture.js"

describe("document Composition finalizer v1", () => {
  it("finalizes one authoritative page plan and heading map with a shared compact owner", () => {
    const input = composeMixedSyntheticDocument(12)
    const before = structuredClone(input.closedPages)
    const first = finalizeVNextDocumentCompositionV1({
      manifest: input.manifest,
      terminalCursor: input.terminalCursor,
      closedPages: input.closedPages,
    })
    const second = finalizeVNextDocumentCompositionV1({
      manifest: input.manifest,
      terminalCursor: input.terminalCursor,
      closedPages: input.closedPages,
    })
    expect(first).toEqual(second)
    expect(input.closedPages).toEqual(before)
    expect(first).toMatchObject({
      status: "ready",
      plan: {
        summary: { pageCount: 12, placementCount: 12, headingCount: 2, sectionCount: 1 },
        compositionFingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        fingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      },
      headingPageMap: {
        pageCount: 12,
        entries: [
          { headingNodeId: "root-0", pageIndex: 0, pageNumber: 1 },
          { headingNodeId: "root-6", pageIndex: 6, pageNumber: 7 },
        ],
        fingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      },
    })
    if (first.status !== "ready") throw new Error("finalization fixture blocked")
    expect(first.headingPageMap.documentPaginationFingerprint).toBe(first.plan.compositionFingerprint)
    expect(parseVNextDocumentCompositionPagePlanV1(first.plan)).toEqual({
      status: "ready", plan: first.plan, issues: [],
    })
  })

  it("blocks missing, reordered, and re-fingerprinted stale page chunks", () => {
    const input = composeMixedSyntheticDocument(12)
    expect(finalizeVNextDocumentCompositionV1({
      manifest: input.manifest,
      terminalCursor: input.terminalCursor,
      closedPages: input.closedPages.slice(0, -1),
    })).toMatchObject({
      status: "blocked",
      plan: null,
      headingPageMap: null,
      issues: expect.arrayContaining([expect.objectContaining({ code: "composition-plan-terminal-prefix-mismatch" })]),
    })

    const reordered = structuredClone(input.closedPages)
    ;[reordered[0], reordered[1]] = [reordered[1], reordered[0]]
    expect(finalizeVNextDocumentCompositionV1({
      manifest: input.manifest,
      terminalCursor: input.terminalCursor,
      closedPages: reordered,
    })).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "composition-plan-page-order-invalid" })]),
    })

    const page = input.closedPages[0]
    const { fingerprint: _fingerprint, closedPagePrefixFingerprint: _prefix, ...facts } = page
    const stale = finalizeVNextDocumentCompositionClosedPageV1({
      ...facts,
      staticZones: [{ ...facts.staticZones[0], evidenceFingerprint: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }],
    })
    if (stale.status !== "ready") throw new Error("re-fingerprinted stale page unexpectedly invalid")
    expect(finalizeVNextDocumentCompositionV1({
      manifest: input.manifest,
      terminalCursor: input.terminalCursor,
      closedPages: [stale.page, ...input.closedPages.slice(1)],
    })).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "composition-plan-page-owner-mismatch" })]),
    })
  })

  it("blocks missing heading-first-fragment coverage before publishing a partial map", () => {
    const input = composeMixedSyntheticDocument(12)
    const first = input.closedPages[0]
    const { fingerprint: _fingerprint, closedPagePrefixFingerprint: _prefix, ...facts } = first
    const missingHeading = finalizeVNextDocumentCompositionClosedPageV1({
      ...facts,
      placements: facts.placements.map((placement) => ({ ...placement, heading: null })),
    })
    if (missingHeading.status !== "ready") throw new Error("missing-heading page unexpectedly invalid")
    expect(finalizeVNextDocumentCompositionV1({
      manifest: input.manifest,
      terminalCursor: input.terminalCursor,
      closedPages: [missingHeading.page, ...input.closedPages.slice(1)],
    })).toMatchObject({
      status: "blocked",
      plan: null,
      headingPageMap: null,
      issues: expect.arrayContaining([expect.objectContaining({ code: "composition-plan-heading-coverage-invalid" })]),
    })
  })

  it("rejects retained page-plan fact and fingerprint tampering", () => {
    const input = composeMixedSyntheticDocument(12)
    const result = finalizeVNextDocumentCompositionV1({
      manifest: input.manifest,
      terminalCursor: input.terminalCursor,
      closedPages: input.closedPages,
    })
    if (result.status !== "ready") throw new Error("finalization fixture blocked")
    const tampered = structuredClone(result.plan)
    tampered.summary.placementCount += 1
    expect(parseVNextDocumentCompositionPagePlanV1(tampered)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "composition-page-plan-summary-mismatch" })]),
    })
  })
})
