import { describe, expect, it } from "vitest"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import {
  advanceVNextDocumentCompositionV1,
  finalizeVNextCompositionFragmentWindowV1,
  finalizeVNextDocumentCompositionManifestV1,
  initializeVNextDocumentCompositionV1,
  parseVNextDocumentCompositionStateV1,
  type VNextCompositionFamilyCursorRefV1,
  type VNextCompositionNodeFamilyV1,
  type VNextCompositionRootNodeTypeV1,
  type VNextDocumentCompositionDemandV1,
  type VNextDocumentCompositionManifestV1,
  type VNextDocumentCompositionTransitionLimitsV1,
} from "../src/index.js"

const fp = (value: string) => createVNextCompactFingerprint(value)
const limits: VNextDocumentCompositionTransitionLimitsV1 = {
  maximumClosedPageCount: 10,
  maximumPlacementCount: 100,
  maximumFamilyPageCount: 10,
  maximumFamilyFragmentCount: 100,
}

interface ItemSpec {
  sectionIndex: number
  rootNodeId: string
  rootNodeType: VNextCompositionRootNodeTypeV1
  family: VNextCompositionNodeFamilyV1
}

function manifest(specs: ItemSpec[], sectionCount = 1): VNextDocumentCompositionManifestV1 {
  const documentStructure = fp(`structure:${JSON.stringify(specs)}`)
  const resolvedProjection = fp("projection")
  const result = finalizeVNextDocumentCompositionManifestV1({
    source: "vnext-document-composition-manifest",
    contractVersion: 1,
    kind: "document-composition-manifest",
    documentId: "document-1",
    documentStructureFingerprint: documentStructure,
    resolvedProjectionFingerprint: resolvedProjection,
    sections: Array.from({ length: sectionCount }, (_, sectionIndex) => ({
      sectionIndex,
      sectionId: `section-${sectionIndex}`,
      pageGeometry: {
        pageWidthPt: 120, pageHeightPt: 140,
        bodyOriginXPt: 10, bodyOriginYPt: 10, bodyWidthPt: 100, bodyHeightPt: 100,
      },
      staticZones: [{
        role: "header" as const,
        zoneId: `header-${sectionIndex}`,
        evidenceFingerprint: fp(`header:${sectionIndex}`),
      }],
    })),
    bodyItems: specs.map((spec, itemIndex) => {
      const measurement = fp(`measurement:${spec.rootNodeId}`)
      return {
        itemIndex,
        sectionIndex: spec.sectionIndex,
        sectionId: `section-${spec.sectionIndex}`,
        zoneOrder: 0,
        zoneId: `body-${spec.sectionIndex}`,
        sourceOrder: specs.slice(0, itemIndex).filter((item) => item.sectionIndex === spec.sectionIndex).length,
        rootNodeId: spec.rootNodeId,
        rootNodeType: spec.rootNodeType,
        family: spec.family,
        ownerPins: {
          documentStructure,
          resolvedProjection,
          familySource: fp(`source:${spec.rootNodeId}`),
          measurement,
        },
        initialCursor: {
          contractVersion: 1 as const,
          kind: "composition-family-cursor-ref" as const,
          family: spec.family,
          rootNodeId: spec.rootNodeId,
          ownerFingerprint: measurement,
          stateFingerprint: fp(`cursor:${spec.rootNodeId}:initial`),
          complete: false,
        },
      }
    }),
    limits: {
      maximumDocumentPageCount: 100,
      maximumDocumentPlacementCount: 1_000,
      maximumOpenPagePlacementCount: 100,
    },
  })
  if (result.status !== "ready") throw new Error(`manifest blocked: ${result.issues[0]?.code}`)
  return result.manifest
}

function cursorAfter(demand: VNextDocumentCompositionDemandV1, pageIndex: number, complete: boolean): VNextCompositionFamilyCursorRefV1 {
  return {
    ...demand.cursorBefore,
    stateFingerprint: fp(`cursor:${demand.rootNodeId}:${pageIndex}:${complete}`),
    complete,
  }
}

function contentWindow(
  demand: VNextDocumentCompositionDemandV1,
  extents: number[],
  status: "complete" | "partial" = "complete",
) {
  const pages = []
  let before = demand.cursorBefore
  for (let index = 0; index < extents.length; index += 1) {
    const availableHeightPt = index === 0
      ? demand.capacity.firstPageAvailableHeightPt
      : demand.capacity.pageBodyHeightPt
    const after = cursorAfter(demand, index, status === "complete" && index === extents.length - 1)
    pages.push({
      windowPageIndex: index,
      flowEffect: "place-content" as const,
      availableHeightPt,
      usedHeightPt: extents[index],
      remainingHeightPt: availableHeightPt - extents[index],
      cursorBefore: before,
      cursorAfter: after,
      fragments: [{
        fragmentId: `${demand.rootNodeId}:f${index}`,
        fragmentIndex: index,
        sourceNodeId: demand.rootNodeId,
        blockOffsetPt: 0,
        blockExtentPt: extents[index],
        continuation: { fromPrevious: index > 0, toNext: !after.complete },
        familyEvidenceFingerprint: fp(`evidence:${demand.rootNodeId}:${index}`),
        heading: demand.rootNodeType === "text-block" && index === 0
          ? { headingNodeId: demand.rootNodeId, level: 1 as const }
          : null,
      }],
    })
    before = after
  }
  const result = finalizeVNextCompositionFragmentWindowV1({
    source: "vnext-composition-fragment-window",
    contractVersion: 1,
    kind: "composition-fragment-window",
    family: demand.family,
    documentId: demand.documentId,
    sectionId: demand.sectionId,
    zoneId: demand.zoneId,
    rootNodeId: demand.rootNodeId,
    rootNodeType: demand.rootNodeType,
    sourceOrder: demand.sourceOrder,
    ownerPins: { ...demand.ownerPins, pagination: fp(`pagination:${demand.fingerprint}`) },
    capacity: demand.capacity,
    cursorBefore: demand.cursorBefore,
    status,
    cursorAfter: pages.at(-1)!.cursorAfter,
    pages,
    work: { pageCount: pages.length, fragmentCount: pages.length, cursorCommitCount: pages.length },
    issues: [],
  })
  if (result.status !== "ready") throw new Error(`window blocked: ${result.issues[0]?.code}`)
  return result.window
}

function pageBreakWindow(demand: VNextDocumentCompositionDemandV1) {
  const result = finalizeVNextCompositionFragmentWindowV1({
    source: "vnext-composition-fragment-window",
    contractVersion: 1,
    kind: "composition-fragment-window",
    family: "utility-flow",
    documentId: demand.documentId,
    sectionId: demand.sectionId,
    zoneId: demand.zoneId,
    rootNodeId: demand.rootNodeId,
    rootNodeType: "page-break",
    sourceOrder: demand.sourceOrder,
    ownerPins: { ...demand.ownerPins, pagination: fp(`pagination:${demand.fingerprint}`) },
    capacity: demand.capacity,
    cursorBefore: demand.cursorBefore,
    status: "complete",
    cursorAfter: cursorAfter(demand, 0, true),
    pages: [{
      windowPageIndex: 0,
      flowEffect: "force-page-advance",
      availableHeightPt: demand.capacity.firstPageAvailableHeightPt,
      usedHeightPt: 0,
      remainingHeightPt: demand.capacity.firstPageAvailableHeightPt,
      cursorBefore: demand.cursorBefore,
      cursorAfter: cursorAfter(demand, 0, true),
      fragments: [],
    }],
    work: { pageCount: 1, fragmentCount: 0, cursorCommitCount: 1 },
    issues: [],
  })
  if (result.status !== "ready") throw new Error(`page break blocked: ${result.issues[0]?.code}`)
  return result.window
}

function demandOf(result: ReturnType<typeof initializeVNextDocumentCompositionV1> | ReturnType<typeof advanceVNextDocumentCompositionV1>) {
  if (result.status !== "partial" || result.reason !== "needs-family-window" || result.demand == null) {
    throw new Error(`expected demand, received ${result.status}/${result.reason}`)
  }
  return result.demand
}

describe("document Composition transition v1", () => {
  it("initializes deterministically with the first exact family demand", () => {
    const input = manifest([{ sectionIndex: 0, rootNodeId: "title", rootNodeType: "text-block", family: "text-flow" }])
    const first = initializeVNextDocumentCompositionV1({ manifest: input, limits })
    const second = initializeVNextDocumentCompositionV1({ manifest: input, limits })
    expect(first).toEqual(second)
    expect(first).toMatchObject({
      status: "partial",
      reason: "needs-family-window",
      demand: {
        itemIndex: 0,
        rootNodeId: "title",
        capacity: { firstPageAvailableHeightPt: 100, pageBodyHeightPt: 100 },
      },
      cursorAfter: { bodyItemIndex: 0, activeRoot: { rootNodeId: "title" } },
      openPageAfter: { pageIndex: 0, placements: [] },
      closedPages: [],
    })
  })

  it("places complete roots in canonical order and starts every section fresh", () => {
    const input = manifest([
      { sectionIndex: 0, rootNodeId: "title", rootNodeType: "text-block", family: "text-flow" },
      { sectionIndex: 0, rootNodeId: "rule", rootNodeType: "divider", family: "utility-flow" },
      { sectionIndex: 1, rootNodeId: "photo", rootNodeType: "image", family: "media-flow" },
    ], 2)
    const initial = initializeVNextDocumentCompositionV1({ manifest: input, limits })
    const title = advanceVNextDocumentCompositionV1({
      manifest: input, cursor: initial.cursorAfter, openPage: initial.openPageAfter,
      window: contentWindow(demandOf(initial), [40]), limits,
    })
    expect(demandOf(title)).toMatchObject({ rootNodeId: "rule", capacity: { firstPageAvailableHeightPt: 60 } })
    expect(title.openPageAfter).toMatchObject({ usedHeightPt: 40, placements: [{ blockOffsetPt: 0 }] })

    const rule = advanceVNextDocumentCompositionV1({
      manifest: input, cursor: title.cursorAfter, openPage: title.openPageAfter,
      window: contentWindow(demandOf(title), [20]), limits,
    })
    if (rule.status === "blocked") throw new Error("rule transition blocked")
    expect(demandOf(rule)).toMatchObject({ rootNodeId: "photo", sectionIndex: 1, capacity: { firstPageAvailableHeightPt: 100 } })
    expect(rule.closedPages).toHaveLength(1)
    expect(rule.closedPages[0]).toMatchObject({
      pageIndex: 0,
      sectionId: "section-0",
      closeReason: "section-boundary",
      usedHeightPt: 60,
      placements: [
        { rootNodeId: "title", blockOffsetPt: 0 },
        { rootNodeId: "rule", blockOffsetPt: 40 },
      ],
    })
    expect(rule.openPageAfter).toMatchObject({ pageIndex: 1, sectionId: "section-1", usedHeightPt: 0 })

    const photo = advanceVNextDocumentCompositionV1({
      manifest: input, cursor: rule.cursorAfter, openPage: rule.openPageAfter,
      window: contentWindow(demandOf(rule), [50]), limits,
    })
    if (photo.status === "blocked") throw new Error("photo transition blocked")
    expect(photo).toMatchObject({ status: "complete", reason: "document-complete" })
    expect(photo.closedPages).toHaveLength(1)
    expect(photo.closedPages[0]).toMatchObject({ pageIndex: 1, closeReason: "document-complete", usedHeightPt: 50 })
    expect(photo.cursorAfter).toMatchObject({
      complete: true,
      bodyItemIndex: 3,
      sectionIndex: 2,
      closedPrefix: { pageCount: 2, placementCount: 3, headingCount: 1 },
    })
    expect(parseVNextDocumentCompositionStateV1({ manifest: input, cursor: photo.cursorAfter, openPage: null })).toMatchObject({ status: "ready" })
  })

  it("projects a multi-page family window without flattening family evidence", () => {
    const input = manifest([{ sectionIndex: 0, rootNodeId: "table", rootNodeType: "table", family: "table-flow" }])
    const initial = initializeVNextDocumentCompositionV1({ manifest: input, limits })
    const result = advanceVNextDocumentCompositionV1({
      manifest: input, cursor: initial.cursorAfter, openPage: initial.openPageAfter,
      window: contentWindow(demandOf(initial), [100, 50]), limits,
    })
    if (result.status === "blocked") throw new Error("table transition blocked")
    expect(result).toMatchObject({ status: "complete", work: { familyPageCount: 2, closedPageCount: 2, placementCount: 2 } })
    expect(result.closedPages).toHaveLength(2)
    expect(result.closedPages.map((page) => ({
      pageIndex: page.pageIndex,
      reason: page.closeReason,
      fragment: page.placements[0].fragmentId,
      evidence: page.placements[0].familyEvidenceFingerprint,
    }))).toEqual([
      { pageIndex: 0, reason: "family-page-boundary", fragment: "table:f0", evidence: fp("evidence:table:0") },
      { pageIndex: 1, reason: "document-complete", fragment: "table:f1", evidence: fp("evidence:table:1") },
    ])
  })

  it("preserves consecutive intentional blank pages from consecutive page breaks", () => {
    const input = manifest([
      { sectionIndex: 0, rootNodeId: "break-1", rootNodeType: "page-break", family: "utility-flow" },
      { sectionIndex: 0, rootNodeId: "break-2", rootNodeType: "page-break", family: "utility-flow" },
      { sectionIndex: 0, rootNodeId: "text", rootNodeType: "text-block", family: "text-flow" },
    ])
    const initial = initializeVNextDocumentCompositionV1({ manifest: input, limits })
    const first = advanceVNextDocumentCompositionV1({
      manifest: input, cursor: initial.cursorAfter, openPage: initial.openPageAfter,
      window: pageBreakWindow(demandOf(initial)), limits,
    })
    const second = advanceVNextDocumentCompositionV1({
      manifest: input, cursor: first.cursorAfter, openPage: first.openPageAfter,
      window: pageBreakWindow(demandOf(first)), limits,
    })
    if (first.status === "blocked" || second.status === "blocked") throw new Error("page-break transition blocked")
    expect([...first.closedPages, ...second.closedPages]).toMatchObject([
      { pageIndex: 0, intentionalBlank: true, closeReason: "page-break" },
      { pageIndex: 1, intentionalBlank: true, closeReason: "page-break" },
    ])
    expect(demandOf(second)).toMatchObject({ rootNodeId: "text", capacity: { firstPageAvailableHeightPt: 100 } })
  })

  it("blocks stale/out-of-order and not-yet-active partial windows without committing output", () => {
    const input = manifest([{ sectionIndex: 0, rootNodeId: "title", rootNodeType: "text-block", family: "text-flow" }])
    const initial = initializeVNextDocumentCompositionV1({ manifest: input, limits })
    const valid = contentWindow(demandOf(initial), [20])
    const tampered = structuredClone(valid)
    tampered.zoneId = "other-zone"
    const stale = advanceVNextDocumentCompositionV1({
      manifest: input, cursor: initial.cursorAfter, openPage: initial.openPageAfter,
      window: tampered, limits,
    })
    expect(stale).toMatchObject({
      status: "blocked",
      cursorAfter: null,
      openPageAfter: null,
      closedPages: null,
      work: { windowCount: 0, closedPageCount: 0, placementCount: 0 },
    })

    const partial = advanceVNextDocumentCompositionV1({
      manifest: input, cursor: initial.cursorAfter, openPage: initial.openPageAfter,
      window: contentWindow(demandOf(initial), [20], "partial"), limits,
    })
    expect(partial).toMatchObject({
      status: "blocked",
      reason: "unsupported-window-state",
      issues: [expect.objectContaining({ code: "composition-window-state-not-active" })],
      cursorAfter: null,
    })
  })

  it("commits one bounded page-break transition and resumes structural completion", () => {
    const input = manifest([{ sectionIndex: 0, rootNodeId: "break", rootNodeType: "page-break", family: "utility-flow" }])
    const onePageLimits = { ...limits, maximumClosedPageCount: 1 }
    const initial = initializeVNextDocumentCompositionV1({ manifest: input, limits: onePageLimits })
    const first = advanceVNextDocumentCompositionV1({
      manifest: input, cursor: initial.cursorAfter, openPage: initial.openPageAfter,
      window: pageBreakWindow(demandOf(initial)), limits: onePageLimits,
    })
    expect(first).toMatchObject({
      status: "partial",
      reason: "output-limit",
      closedPages: [{ pageIndex: 0, intentionalBlank: true }],
      cursorAfter: { bodyItemIndex: 1, activeRoot: null, complete: false },
    })
    const resumed = advanceVNextDocumentCompositionV1({
      manifest: input, cursor: first.cursorAfter, openPage: first.openPageAfter,
      window: null, limits: onePageLimits,
    })
    expect(resumed).toMatchObject({
      status: "complete",
      closedPages: [{ pageIndex: 1, closeReason: "document-complete" }],
      cursorAfter: { complete: true, closedPrefix: { pageCount: 2 } },
    })
  })
})
