import { describe, expect, it } from "vitest"
import {
  finalizeVNextDocumentCompositionClosedPageV1,
  finalizeVNextDocumentCompositionCursorV1,
  finalizeVNextDocumentCompositionManifestV1,
  finalizeVNextDocumentCompositionOpenPageV1,
  parseVNextDocumentCompositionCursorV1,
  parseVNextDocumentCompositionStateV1,
  parseVNextDocumentCompositionStateWithValidatedManifestV1,
  type VNextDocumentCompositionCursorInputV1,
  type VNextDocumentCompositionOpenPageInputV1,
} from "../src/index.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"

const fp = (value: string) => createVNextCompactFingerprint(value)

function fixtures() {
  const documentStructure = fp("structure")
  const resolvedProjection = fp("projection")
  const measurement = fp("measurement")
  const initialCursor = {
    contractVersion: 1 as const,
    kind: "composition-family-cursor-ref" as const,
    family: "text-flow" as const,
    rootNodeId: "text-1",
    ownerFingerprint: measurement,
    stateFingerprint: fp("initial-text-cursor"),
    complete: false,
  }
  const manifestResult = finalizeVNextDocumentCompositionManifestV1({
    source: "vnext-document-composition-manifest",
    contractVersion: 1,
    kind: "document-composition-manifest",
    documentId: "document-1",
    documentStructureFingerprint: documentStructure,
    resolvedProjectionFingerprint: resolvedProjection,
    sections: [{
      sectionIndex: 0,
      sectionId: "section-1",
      pageGeometry: {
        pageWidthPt: 600, pageHeightPt: 800,
        bodyOriginXPt: 50, bodyOriginYPt: 50, bodyWidthPt: 500, bodyHeightPt: 700,
      },
      staticZones: [{ role: "header", zoneId: "header", evidenceFingerprint: fp("header") }],
    }],
    bodyItems: [{
      itemIndex: 0,
      sectionIndex: 0,
      sectionId: "section-1",
      zoneOrder: 0,
      zoneId: "body",
      sourceOrder: 0,
      rootNodeId: "text-1",
      rootNodeType: "text-block",
      family: "text-flow",
      headingLevel: 1,
      ownerPins: {
        documentStructure,
        resolvedProjection,
        familySource: fp("text-source"),
        measurement,
      },
      initialCursor,
    }],
    limits: {
      maximumDocumentPageCount: 100,
      maximumDocumentPlacementCount: 1_000,
      maximumOpenPagePlacementCount: 100,
    },
  })
  if (manifestResult.status !== "ready") throw new Error("manifest fixture blocked")
  const manifest = manifestResult.manifest
  const openInput: VNextDocumentCompositionOpenPageInputV1 = {
    source: "vnext-document-composition-open-page",
    contractVersion: 1,
    kind: "document-composition-open-page",
    documentId: manifest.documentId,
    manifestFingerprint: manifest.fingerprint,
    pageIndex: 0,
    pageNumber: 1,
    sectionIndex: 0,
    sectionId: "section-1",
    sectionPageIndex: 0,
    pageGeometry: manifest.sections[0].pageGeometry,
    staticZones: manifest.sections[0].staticZones,
    placements: [],
    usedHeightPt: 0,
    remainingHeightPt: 700,
    intentionalBlank: false,
    previousClosedPagePrefixFingerprint: null,
    closedPageCountBefore: 0,
    closedPlacementCountBefore: 0,
    closedHeadingCountBefore: 0,
  }
  const openResult = finalizeVNextDocumentCompositionOpenPageV1(openInput)
  if (openResult.status !== "ready") throw new Error("open-page fixture blocked")
  return { manifest, openInput, openPage: openResult.page, initialCursor }
}

function activeCursorInput(): VNextDocumentCompositionCursorInputV1 {
  const { manifest, openPage, initialCursor } = fixtures()
  return {
    source: "vnext-document-composition-cursor",
    contractVersion: 1,
    kind: "document-composition-cursor",
    documentId: manifest.documentId,
    manifestFingerprint: manifest.fingerprint,
    sectionIndex: 0,
    bodyItemIndex: 0,
    activeRoot: {
      itemIndex: 0,
      rootNodeId: "text-1",
      family: "text-flow",
      familyCursor: initialCursor,
    },
    nextPageIndex: 1,
    currentPage: { pageIndex: 0, sectionPageIndex: 0, usedHeightPt: 0, remainingHeightPt: 700 },
    openPageFingerprint: openPage.fingerprint,
    closedPrefix: { fingerprint: null, pageCount: 0, placementCount: 0, headingCount: 0 },
    cumulativeWork: {
      familyPagesConsumed: 0,
      placementsAccepted: 0,
      bodyItemsCompleted: 0,
      pageAdvances: 0,
      cursorCommits: 0,
    },
    complete: false,
  }
}

describe("document Composition cursor v1", () => {
  it("finalizes a compact active cursor and validates exact manifest/open-page state", () => {
    const { manifest, openPage } = fixtures()
    const input = activeCursorInput()
    const before = structuredClone(input)
    const cursor = finalizeVNextDocumentCompositionCursorV1(input)
    expect(cursor).toMatchObject({ status: "ready", cursor: { activeRoot: { rootNodeId: "text-1" } } })
    expect(input).toEqual(before)
    if (cursor.status !== "ready") throw new Error("cursor fixture blocked")
    expect(parseVNextDocumentCompositionCursorV1(cursor.cursor)).toEqual(cursor)
    const parsed = parseVNextDocumentCompositionStateV1({ manifest, cursor: cursor.cursor, openPage })
    expect(parsed).toMatchObject({
      status: "ready",
      cursor: { fingerprint: cursor.cursor.fingerprint },
      openPage: { fingerprint: openPage.fingerprint },
    })
    expect(parseVNextDocumentCompositionStateWithValidatedManifestV1({
      manifest,
      cursor: cursor.cursor,
      openPage,
    })).toEqual(parsed)
  })

  it("blocks cursor terminal, page-position, work, and active-root drift", () => {
    const cases: Array<[string, (input: VNextDocumentCompositionCursorInputV1) => void, string]> = [
      ["terminal", (input) => { input.complete = true }, "composition-cursor-terminal-state-invalid"],
      ["page", (input) => { input.nextPageIndex = 2 }, "composition-cursor-page-position-invalid"],
      ["work", (input) => { input.cumulativeWork.bodyItemsCompleted = 1 }, "composition-cursor-body-work-mismatch"],
      ["active", (input) => { if (input.activeRoot != null) input.activeRoot.itemIndex = 1 }, "composition-cursor-active-root-invalid"],
    ]
    for (const [, mutate, code] of cases) {
      const input = activeCursorInput()
      mutate(input)
      expect(finalizeVNextDocumentCompositionCursorV1(input)).toMatchObject({
        status: "blocked", issues: expect.arrayContaining([expect.objectContaining({ code })]),
      })
    }
  })

  it("rejects retained cursor tampering and re-fingerprinted open-page owner drift", () => {
    const { manifest, openInput } = fixtures()
    const cursor = finalizeVNextDocumentCompositionCursorV1(activeCursorInput())
    if (cursor.status !== "ready") throw new Error("cursor fixture blocked")
    const tampered = structuredClone(cursor.cursor)
    tampered.currentPage!.remainingHeightPt = 699
    expect(parseVNextDocumentCompositionCursorV1(tampered)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "document-composition-cursor-fingerprint-mismatch" })],
    })

    const staleOpenResult = finalizeVNextDocumentCompositionOpenPageV1({
      ...openInput,
      manifestFingerprint: fp("other-manifest"),
    })
    if (staleOpenResult.status !== "ready") throw new Error("stale open fixture unexpectedly blocked")
    const staleCursorFacts = activeCursorInput()
    staleCursorFacts.openPageFingerprint = staleOpenResult.page.fingerprint
    const staleCursor = finalizeVNextDocumentCompositionCursorV1(staleCursorFacts)
    if (staleCursor.status !== "ready") throw new Error("stale cursor fixture unexpectedly blocked")
    expect(parseVNextDocumentCompositionStateV1({
      manifest,
      cursor: staleCursor.cursor,
      openPage: staleOpenResult.page,
    })).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([expect.objectContaining({ code: "composition-state-open-page-owner-mismatch" })]),
    })
  })

  it("accepts a terminal cursor only after the final page prefix and all items close", () => {
    const { manifest, openInput } = fixtures()
    const closed = finalizeVNextDocumentCompositionClosedPageV1({
      ...openInput,
      source: "vnext-document-composition-closed-page",
      kind: "document-composition-closed-page",
      closeReason: "document-complete",
    })
    if (closed.status !== "ready") throw new Error("closed page fixture blocked")
    const terminal = finalizeVNextDocumentCompositionCursorV1({
      source: "vnext-document-composition-cursor",
      contractVersion: 1,
      kind: "document-composition-cursor",
      documentId: manifest.documentId,
      manifestFingerprint: manifest.fingerprint,
      sectionIndex: 1,
      bodyItemIndex: 1,
      activeRoot: null,
      nextPageIndex: 1,
      currentPage: null,
      openPageFingerprint: null,
      closedPrefix: {
        fingerprint: closed.page.closedPagePrefixFingerprint,
        pageCount: 1,
        placementCount: 0,
        headingCount: 0,
      },
      cumulativeWork: {
        familyPagesConsumed: 1,
        placementsAccepted: 0,
        bodyItemsCompleted: 1,
        pageAdvances: 0,
        cursorCommits: 1,
      },
      complete: true,
    })
    expect(terminal).toMatchObject({ status: "ready", cursor: { complete: true } })
    if (terminal.status !== "ready") throw new Error("terminal cursor fixture blocked")
    expect(parseVNextDocumentCompositionStateV1({
      manifest,
      cursor: terminal.cursor,
      openPage: null,
    })).toMatchObject({ status: "ready", openPage: null })
  })
})
