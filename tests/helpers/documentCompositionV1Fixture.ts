import { createVNextCompactFingerprint } from "../../src/fingerprint/compactFingerprint.js"
import {
  advanceVNextDocumentCompositionV1,
  finalizeVNextCompositionFragmentWindowV1,
  finalizeVNextDocumentCompositionManifestV1,
  initializeVNextDocumentCompositionV1,
  type VNextCompositionNodeFamilyV1,
  type VNextCompositionRootNodeTypeV1,
  type VNextDocumentCompositionClosedPageV1,
  type VNextDocumentCompositionCursorV1,
  type VNextDocumentCompositionDemandV1,
  type VNextDocumentCompositionManifestV1,
  type VNextDocumentCompositionTransitionLimitsV1,
  type VNextDocumentCompositionTransitionResultV1,
} from "../../src/index.js"

const fp = (value: string) => createVNextCompactFingerprint(value)

const profiles: Array<{
  family: VNextCompositionNodeFamilyV1
  rootNodeType: VNextCompositionRootNodeTypeV1
}> = [
  { family: "text-flow", rootNodeType: "text-block" },
  { family: "columns-flow", rootNodeType: "columns" },
  { family: "table-flow", rootNodeType: "table" },
  { family: "generated-flow", rootNodeType: "toc" },
  { family: "utility-flow", rootNodeType: "divider" },
  { family: "media-flow", rootNodeType: "image" },
]

const limits: VNextDocumentCompositionTransitionLimitsV1 = {
  maximumClosedPageCount: 4,
  maximumPlacementCount: 20,
  maximumFamilyPageCount: 4,
  maximumFamilyFragmentCount: 20,
}

function demandOf(result: VNextDocumentCompositionTransitionResultV1): VNextDocumentCompositionDemandV1 {
  if (result.status !== "partial" || result.reason !== "needs-family-window" || result.demand == null) {
    throw new Error(`synthetic composition expected demand, received ${result.status}/${result.reason}`)
  }
  return result.demand
}

function contentWindow(demand: VNextDocumentCompositionDemandV1, headingLevel: number | null) {
  const cursorAfter = {
    ...demand.cursorBefore,
    stateFingerprint: fp(`complete:${demand.rootNodeId}`),
    complete: true,
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
    ownerPins: { ...demand.ownerPins, pagination: fp(`pagination:${demand.rootNodeId}`) },
    capacity: demand.capacity,
    cursorBefore: demand.cursorBefore,
    status: "complete",
    cursorAfter,
    pages: [{
      windowPageIndex: 0,
      flowEffect: "place-content",
      availableHeightPt: demand.capacity.firstPageAvailableHeightPt,
      usedHeightPt: 100,
      remainingHeightPt: demand.capacity.firstPageAvailableHeightPt - 100,
      cursorBefore: demand.cursorBefore,
      cursorAfter,
      fragments: [{
        fragmentId: `${demand.rootNodeId}:f0`,
        fragmentIndex: 0,
        sourceNodeId: demand.rootNodeId,
        blockOffsetPt: 0,
        blockExtentPt: 100,
        continuation: { fromPrevious: false, toNext: false },
        familyEvidenceFingerprint: fp(`evidence:${demand.rootNodeId}`),
        heading: headingLevel == null ? null : {
          headingNodeId: demand.rootNodeId,
          level: headingLevel as 1 | 2 | 3 | 4 | 5 | 6,
        },
      }],
    }],
    work: { pageCount: 1, fragmentCount: 1, cursorCommitCount: 1 },
    issues: [],
  })
  if (result.status !== "ready") throw new Error(`synthetic content window blocked: ${result.issues[0]?.code}`)
  return result.window
}

function freshWindow(demand: VNextDocumentCompositionDemandV1) {
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
    ownerPins: { ...demand.ownerPins, pagination: fp(`fresh:${demand.rootNodeId}`) },
    capacity: demand.capacity,
    cursorBefore: demand.cursorBefore,
    status: "fresh-page-required",
    cursorAfter: demand.cursorBefore,
    pages: [],
    work: { pageCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
    issues: [],
  })
  if (result.status !== "ready") throw new Error(`synthetic fresh window blocked: ${result.issues[0]?.code}`)
  return result.window
}

function createManifest(pageCount: number): VNextDocumentCompositionManifestV1 {
  const documentStructure = fp(`mixed-structure:${pageCount}`)
  const resolvedProjection = fp(`mixed-projection:${pageCount}`)
  const result = finalizeVNextDocumentCompositionManifestV1({
    source: "vnext-document-composition-manifest",
    contractVersion: 1,
    kind: "document-composition-manifest",
    documentId: `mixed-document-${pageCount}`,
    documentStructureFingerprint: documentStructure,
    resolvedProjectionFingerprint: resolvedProjection,
    sections: [{
      sectionIndex: 0,
      sectionId: "main",
      pageGeometry: {
        pageWidthPt: 120, pageHeightPt: 140,
        bodyOriginXPt: 10, bodyOriginYPt: 10, bodyWidthPt: 100, bodyHeightPt: 100,
      },
      staticZones: [{ role: "header", zoneId: "header", evidenceFingerprint: fp("mixed-header") }],
    }],
    bodyItems: Array.from({ length: pageCount }, (_, itemIndex) => {
      const profile = profiles[itemIndex % profiles.length]
      const rootNodeId = `root-${itemIndex}`
      const measurement = fp(`measurement:${rootNodeId}`)
      return {
        itemIndex,
        sectionIndex: 0,
        sectionId: "main",
        zoneOrder: 0,
        zoneId: "body",
        sourceOrder: itemIndex,
        rootNodeId,
        rootNodeType: profile.rootNodeType,
        family: profile.family,
        headingLevel: profile.rootNodeType === "text-block" ? (itemIndex % 6) + 1 : null,
        ownerPins: {
          documentStructure,
          resolvedProjection,
          familySource: fp(`source:${rootNodeId}`),
          measurement,
        },
        initialCursor: {
          contractVersion: 1,
          kind: "composition-family-cursor-ref",
          family: profile.family,
          rootNodeId,
          ownerFingerprint: measurement,
          stateFingerprint: fp(`initial:${rootNodeId}`),
          complete: false,
        },
      }
    }),
    limits: {
      maximumDocumentPageCount: pageCount + 10,
      maximumDocumentPlacementCount: pageCount + 10,
      maximumOpenPagePlacementCount: 10,
    },
  })
  if (result.status !== "ready") throw new Error(`synthetic manifest blocked: ${result.issues[0]?.code}`)
  return result.manifest
}

export function composeMixedSyntheticDocument(pageCount: number): {
  manifest: VNextDocumentCompositionManifestV1
  terminalCursor: VNextDocumentCompositionCursorV1
  closedPages: VNextDocumentCompositionClosedPageV1[]
  transitionCount: number
  maximumCursorBytes: number
  maximumOpenPageBytes: number
  maximumWindowBytes: number
  families: VNextCompositionNodeFamilyV1[]
} {
  const manifest = createManifest(pageCount)
  let result = initializeVNextDocumentCompositionV1({ manifest, limits })
  const closedPages: VNextDocumentCompositionClosedPageV1[] = [...(result.closedPages ?? [])]
  let transitionCount = 1
  let maximumCursorBytes = JSON.stringify(result.cursorAfter).length
  let maximumOpenPageBytes = JSON.stringify(result.openPageAfter).length
  let maximumWindowBytes = 0
  while (result.status !== "complete") {
    if (result.status === "blocked") throw new Error(`synthetic transition blocked: ${result.issues[0]?.code}`)
    const demand = demandOf(result)
    const item = manifest.bodyItems[demand.itemIndex]
    const window = demand.capacity.firstPageAvailableHeightPt < demand.capacity.pageBodyHeightPt
      ? freshWindow(demand)
      : contentWindow(demand, item.headingLevel)
    maximumWindowBytes = Math.max(maximumWindowBytes, JSON.stringify(window).length)
    result = advanceVNextDocumentCompositionV1({
      manifest,
      cursor: result.cursorAfter,
      openPage: result.openPageAfter,
      window,
      limits,
    })
    transitionCount += 1
    if (result.closedPages != null) closedPages.push(...result.closedPages)
    maximumCursorBytes = Math.max(maximumCursorBytes, JSON.stringify(result.cursorAfter).length)
    maximumOpenPageBytes = Math.max(maximumOpenPageBytes, JSON.stringify(result.openPageAfter).length)
  }
  return {
    manifest,
    terminalCursor: result.cursorAfter,
    closedPages,
    transitionCount,
    maximumCursorBytes,
    maximumOpenPageBytes,
    maximumWindowBytes,
    families: profiles.map((profile) => profile.family),
  }
}
