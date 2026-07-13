import { describe, expect, it } from "vitest"
import { finalizeVNextDocumentCompositionV1 } from "../src/index.js"
import { composeMixedSyntheticDocument } from "./helpers/documentCompositionV1Fixture.js"

describe("document Composition mixed-family scale v1", () => {
  it("composes and finalizes 250 ordered pages across all six families with bounded state", () => {
    const composed = composeMixedSyntheticDocument(250)
    expect(new Set(composed.families)).toEqual(new Set([
      "text-flow", "columns-flow", "table-flow", "generated-flow", "utility-flow", "media-flow",
    ]))
    expect(composed).toMatchObject({
      transitionCount: 500,
      terminalCursor: {
        complete: true,
        bodyItemIndex: 250,
        closedPrefix: { pageCount: 250, placementCount: 250, headingCount: 42 },
        cumulativeWork: {
          familyPagesConsumed: 250,
          placementsAccepted: 250,
          bodyItemsCompleted: 250,
          pageAdvances: 250,
          cursorCommits: 250,
        },
      },
    })
    expect(composed.closedPages).toHaveLength(250)
    expect(composed.closedPages.map((page) => page.pageIndex)).toEqual(Array.from({ length: 250 }, (_, index) => index))
    expect(composed.maximumCursorBytes).toBeLessThan(2_500)
    expect(composed.maximumOpenPageBytes).toBeLessThan(3_500)
    expect(composed.maximumWindowBytes).toBeLessThan(7_000)

    const finalized = finalizeVNextDocumentCompositionV1({
      manifest: composed.manifest,
      terminalCursor: composed.terminalCursor,
      closedPages: composed.closedPages,
    })
    expect(finalized).toMatchObject({
      status: "ready",
      plan: {
        summary: { pageCount: 250, placementCount: 250, headingCount: 42 },
        compositionFingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      },
      headingPageMap: {
        pageCount: 250,
        entries: expect.any(Array),
        fingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
      },
    })
    if (finalized.status !== "ready") throw new Error("scale finalization blocked")
    expect(finalized.headingPageMap.entries).toHaveLength(42)
    expect(finalized.headingPageMap.documentPaginationFingerprint).toBe(finalized.plan.compositionFingerprint)
    expect(JSON.stringify(finalized.plan).length).toBeLessThan(1_500_000)
    expect(JSON.stringify(finalized.headingPageMap).length).toBeLessThan(20_000)
  }, 20_000)
})
