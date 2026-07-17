import { describe, expect, it } from "vitest"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import {
  advanceVNextDocumentCompositionV1,
  bridgeVNextDocumentCompositionSpacingWindowV1,
  createVNextDocumentCompositionSpacingBridgePlanV1,
  finalizeVNextCompositionFragmentWindowV1,
  finalizeVNextDocumentCompositionDemandV1,
  finalizeVNextDocumentCompositionManifestV1,
  initializeVNextDocumentCompositionV1,
  parseVNextDocumentCompositionSpacingBridgePlanV1,
  type VNextDocumentCompositionDemandV1,
  type VNextDocumentCompositionSpacingBridgePlanV1,
} from "../src/index.js"

const fp = (value: string) => createVNextCompactFingerprint(value)

function demand(firstPageAvailableHeightPt: number): VNextDocumentCompositionDemandV1 {
  const measurement = fp("measurement:block-1")
  const result = finalizeVNextDocumentCompositionDemandV1({
    source: "vnext-document-composition-demand",
    contractVersion: 1,
    kind: "document-composition-demand",
    documentId: "document-1",
    manifestFingerprint: fp("manifest"),
    itemIndex: 1,
    sectionIndex: 0,
    sectionId: "section-1",
    zoneId: "body-1",
    sourceOrder: 1,
    rootNodeId: "block-1",
    rootNodeType: "text-block",
    family: "text-flow",
    ownerPins: {
      documentStructure: fp("structure"),
      resolvedProjection: fp("projection"),
      familySource: fp("family-source:block-1"),
      measurement,
    },
    cursorBefore: {
      contractVersion: 1,
      kind: "composition-family-cursor-ref",
      family: "text-flow",
      rootNodeId: "block-1",
      ownerFingerprint: measurement,
      stateFingerprint: fp("cursor:block-1:initial"),
      complete: false,
    },
    capacity: {
      pageBodyHeightPt: 100,
      firstPageAvailableHeightPt,
      maximumPageCount: 10,
      maximumFragmentCount: 100,
    },
  })
  if (result.status === "blocked") throw new Error(result.issues[0]?.message)
  return result.demand
}

function plan(firstPageAvailableHeightPt: number, gapBeforePt: number) {
  const result = createVNextDocumentCompositionSpacingBridgePlanV1({
    demand: demand(firstPageAvailableHeightPt),
    gapBeforePt,
  })
  if (result.status === "blocked") throw new Error(result.issues[0]?.message)
  return result.plan
}

function familyWindow(
  bridgePlan: VNextDocumentCompositionSpacingBridgePlanV1,
  input: { status?: "complete" | "fresh-page-required"; usedHeightPt?: number } = {},
) {
  const adjusted = bridgePlan.familyDemand
  const status = input.status ?? "complete"
  const base = {
    source: "vnext-composition-fragment-window" as const,
    contractVersion: 1 as const,
    kind: "composition-fragment-window" as const,
    family: adjusted.family,
    documentId: adjusted.documentId,
    sectionId: adjusted.sectionId,
    zoneId: adjusted.zoneId,
    rootNodeId: adjusted.rootNodeId,
    rootNodeType: adjusted.rootNodeType,
    sourceOrder: adjusted.sourceOrder,
    ownerPins: {
      ...adjusted.ownerPins,
      pagination: fp(`family-pagination:${adjusted.fingerprint}`),
    },
    capacity: adjusted.capacity,
    cursorBefore: adjusted.cursorBefore,
  }
  if (status === "fresh-page-required") {
    const result = finalizeVNextCompositionFragmentWindowV1({
      ...base,
      status,
      cursorAfter: adjusted.cursorBefore,
      pages: [],
      work: { pageCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
      issues: [],
    })
    if (result.status === "blocked") throw new Error(result.issues[0]?.message)
    return result.window
  }
  const usedHeightPt = input.usedHeightPt ?? 25
  const cursorAfter = {
    ...adjusted.cursorBefore,
    stateFingerprint: fp(`cursor:${adjusted.rootNodeId}:complete`),
    complete: true,
  }
  const result = finalizeVNextCompositionFragmentWindowV1({
    ...base,
    status,
    cursorAfter,
    pages: [{
      windowPageIndex: 0,
      flowEffect: "place-content",
      availableHeightPt: adjusted.capacity.firstPageAvailableHeightPt,
      usedHeightPt,
      remainingHeightPt: adjusted.capacity.firstPageAvailableHeightPt - usedHeightPt,
      cursorBefore: adjusted.cursorBefore,
      cursorAfter,
      fragments: [{
        fragmentId: `${adjusted.rootNodeId}:fragment-0`,
        fragmentIndex: 0,
        sourceNodeId: adjusted.rootNodeId,
        blockOffsetPt: 0,
        blockExtentPt: usedHeightPt,
        continuation: { fromPrevious: false, toNext: false },
        familyEvidenceFingerprint: fp(`family-evidence:${adjusted.rootNodeId}:fragment-0`),
        heading: null,
      }],
    }],
    work: { pageCount: 1, fragmentCount: 1, cursorCommitCount: 1 },
    issues: [],
  })
  if (result.status === "blocked") throw new Error(result.issues[0]?.message)
  return result.window
}

describe("document composition spacing bridge v1", () => {
  it("reserves a no-paint gap before a root on a partially used page", () => {
    const bridgePlan = plan(70, 10)
    expect(bridgePlan).toMatchObject({
      disposition: "preserve-before-root",
      appliedGapBeforePt: 10,
      suppressedGapBeforePt: 0,
      familyDemand: { capacity: { firstPageAvailableHeightPt: 60 } },
    })

    const result = bridgeVNextDocumentCompositionSpacingWindowV1({
      plan: bridgePlan,
      familyWindow: familyWindow(bridgePlan),
    })
    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new Error(result.issues[0]?.message)
    expect(result.window).toMatchObject({
      status: "complete",
      capacity: { firstPageAvailableHeightPt: 70 },
      pages: [{
        availableHeightPt: 70,
        usedHeightPt: 35,
        remainingHeightPt: 35,
        fragments: [{ blockOffsetPt: 10, blockExtentPt: 25 }],
      }],
    })
    expect(result.window.ownerPins.pagination).not.toBe(familyWindow(bridgePlan).ownerPins.pagination)
  })

  it("suppresses the gap when the demanded root starts on a fresh page", () => {
    const bridgePlan = plan(100, 10)
    expect(bridgePlan).toMatchObject({
      disposition: "suppress-at-fresh-page",
      appliedGapBeforePt: 0,
      suppressedGapBeforePt: 10,
      familyDemand: { capacity: { firstPageAvailableHeightPt: 100 } },
    })
    const result = bridgeVNextDocumentCompositionSpacingWindowV1({
      plan: bridgePlan,
      familyWindow: familyWindow(bridgePlan),
    })
    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new Error(result.issues[0]?.message)
    expect(result.window.pages).toEqual([expect.objectContaining({
      availableHeightPt: 100,
      usedHeightPt: 25,
      remainingHeightPt: 75,
      fragments: [expect.objectContaining({ blockOffsetPt: 0, blockExtentPt: 25 })],
    })])
  })

  it("preserves a fresh-page-required retry without placing the gap at page top", () => {
    const currentPagePlan = plan(8, 10)
    expect(currentPagePlan).toMatchObject({
      disposition: "preserve-before-root",
      appliedGapBeforePt: 10,
      familyDemand: { capacity: { firstPageAvailableHeightPt: 0 } },
    })
    const retry = bridgeVNextDocumentCompositionSpacingWindowV1({
      plan: currentPagePlan,
      familyWindow: familyWindow(currentPagePlan, { status: "fresh-page-required" }),
    })
    expect(retry.status).toBe("ready")
    if (retry.status !== "ready") throw new Error(retry.issues[0]?.message)
    expect(retry.window).toMatchObject({
      status: "fresh-page-required",
      capacity: { firstPageAvailableHeightPt: 8 },
      pages: [],
    })

    const freshPagePlan = plan(100, 10)
    expect(freshPagePlan.disposition).toBe("suppress-at-fresh-page")
    expect(freshPagePlan.familyDemand.capacity.firstPageAvailableHeightPt).toBe(100)
  })

  it("supports a zero-gap pass-through without changing geometry", () => {
    const bridgePlan = plan(70, 0)
    const sourceWindow = familyWindow(bridgePlan)
    const result = bridgeVNextDocumentCompositionSpacingWindowV1({ plan: bridgePlan, familyWindow: sourceWindow })
    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new Error(result.issues[0]?.message)
    expect(result.window.pages).toEqual(sourceWindow.pages)
    expect(result.window.capacity).toEqual(sourceWindow.capacity)
  })

  it("produces windows accepted by the sequential document transition", () => {
    const documentStructure = fp("integration-structure")
    const resolvedProjection = fp("integration-projection")
    const manifestResult = finalizeVNextDocumentCompositionManifestV1({
      source: "vnext-document-composition-manifest",
      contractVersion: 1,
      kind: "document-composition-manifest",
      documentId: "integration-document",
      documentStructureFingerprint: documentStructure,
      resolvedProjectionFingerprint: resolvedProjection,
      sections: [{
        sectionIndex: 0,
        sectionId: "integration-section",
        pageGeometry: {
          pageWidthPt: 120, pageHeightPt: 140,
          bodyOriginXPt: 10, bodyOriginYPt: 10, bodyWidthPt: 100, bodyHeightPt: 100,
        },
        staticZones: [],
      }],
      bodyItems: ["first-root", "second-root"].map((rootNodeId, itemIndex) => {
        const measurement = fp(`integration-measurement:${rootNodeId}`)
        return {
          itemIndex,
          sectionIndex: 0,
          sectionId: "integration-section",
          zoneOrder: 0,
          zoneId: "integration-body",
          sourceOrder: itemIndex,
          rootNodeId,
          rootNodeType: "text-block" as const,
          family: "text-flow" as const,
          headingLevel: null,
          ownerPins: {
            documentStructure,
            resolvedProjection,
            familySource: fp(`integration-source:${rootNodeId}`),
            measurement,
          },
          initialCursor: {
            contractVersion: 1 as const,
            kind: "composition-family-cursor-ref" as const,
            family: "text-flow" as const,
            rootNodeId,
            ownerFingerprint: measurement,
            stateFingerprint: fp(`integration-cursor:${rootNodeId}:initial`),
            complete: false,
          },
        }
      }),
      limits: {
        maximumDocumentPageCount: 10,
        maximumDocumentPlacementCount: 100,
        maximumOpenPagePlacementCount: 100,
      },
    })
    if (manifestResult.status === "blocked") throw new Error(manifestResult.issues[0]?.message)
    const limits = {
      maximumClosedPageCount: 10,
      maximumPlacementCount: 100,
      maximumFamilyPageCount: 10,
      maximumFamilyFragmentCount: 100,
    }
    const initial = initializeVNextDocumentCompositionV1({ manifest: manifestResult.manifest, limits })
    if (initial.status !== "partial" || initial.demand == null) throw new Error("initial demand missing")
    const firstPlanResult = createVNextDocumentCompositionSpacingBridgePlanV1({
      demand: initial.demand,
      gapBeforePt: 0,
    })
    if (firstPlanResult.status === "blocked") throw new Error(firstPlanResult.issues[0]?.message)
    const firstWindow = bridgeVNextDocumentCompositionSpacingWindowV1({
      plan: firstPlanResult.plan,
      familyWindow: familyWindow(firstPlanResult.plan, { usedHeightPt: 25 }),
    })
    if (firstWindow.status === "blocked") throw new Error(firstWindow.issues[0]?.message)
    const afterFirst = advanceVNextDocumentCompositionV1({
      manifest: manifestResult.manifest,
      cursor: initial.cursorAfter,
      openPage: initial.openPageAfter,
      window: firstWindow.window,
      limits,
    })
    if (afterFirst.status !== "partial" || afterFirst.demand == null) throw new Error("second demand missing")
    expect(afterFirst.demand.capacity.firstPageAvailableHeightPt).toBe(75)

    const secondPlanResult = createVNextDocumentCompositionSpacingBridgePlanV1({
      demand: afterFirst.demand,
      gapBeforePt: 10,
    })
    if (secondPlanResult.status === "blocked") throw new Error(secondPlanResult.issues[0]?.message)
    const secondWindow = bridgeVNextDocumentCompositionSpacingWindowV1({
      plan: secondPlanResult.plan,
      familyWindow: familyWindow(secondPlanResult.plan, { usedHeightPt: 20 }),
    })
    if (secondWindow.status === "blocked") throw new Error(secondWindow.issues[0]?.message)
    const complete = advanceVNextDocumentCompositionV1({
      manifest: manifestResult.manifest,
      cursor: afterFirst.cursorAfter,
      openPage: afterFirst.openPageAfter,
      window: secondWindow.window,
      limits,
    })
    expect(complete.status).toBe("complete")
    if (complete.status !== "complete") throw new Error(complete.issues[0]?.message)
    expect(complete.closedPages).toEqual([expect.objectContaining({
      usedHeightPt: 55,
      placements: [
        expect.objectContaining({ rootNodeId: "first-root", blockOffsetPt: 0, blockExtentPt: 25 }),
        expect.objectContaining({ rootNodeId: "second-root", blockOffsetPt: 35, blockExtentPt: 20 }),
      ],
    })])
  })

  it("fails closed on invalid gaps, plan drift, and stale family capacity", () => {
    expect(createVNextDocumentCompositionSpacingBridgePlanV1({
      demand: demand(70),
      gapBeforePt: -1,
    })).toMatchObject({ status: "blocked", issues: [{ code: "spacing-bridge-gap-invalid" }] })

    const bridgePlan = plan(70, 10)
    const driftedPlan = structuredClone(bridgePlan)
    driftedPlan.appliedGapBeforePt = 9
    expect(parseVNextDocumentCompositionSpacingBridgePlanV1(driftedPlan)).toMatchObject({
      status: "blocked",
      issues: [{ code: "spacing-bridge-plan-drift" }],
    })

    const staleWindow = structuredClone(familyWindow(bridgePlan))
    staleWindow.capacity.firstPageAvailableHeightPt = 59
    expect(bridgeVNextDocumentCompositionSpacingWindowV1({
      plan: bridgePlan,
      familyWindow: staleWindow,
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "spacing-bridge-family-window-invalid" }],
    })
  })
})
