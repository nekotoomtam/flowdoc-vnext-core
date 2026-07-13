import { describe, expect, it } from "vitest"
import {
  finalizeVNextCompositionFragmentWindowV1,
  parseVNextCompositionFragmentWindowV1,
  type VNextCompositionFamilyCursorRefV1,
  type VNextCompositionFragmentWindowExpectationV1,
  type VNextCompositionFragmentWindowInputV1,
} from "../src/index.js"

const pin = (value: string) => `sha256:${value.repeat(64).slice(0, 64)}`

function cursor(state: string, complete: boolean): VNextCompositionFamilyCursorRefV1 {
  return {
    contractVersion: 1,
    kind: "composition-family-cursor-ref",
    family: "text-flow",
    rootNodeId: "heading-1",
    ownerFingerprint: pin("d"),
    stateFingerprint: pin(state),
    complete,
  }
}

function fixture(): VNextCompositionFragmentWindowInputV1 {
  const before = cursor("f", false)
  const after = cursor("e", true)
  return {
    source: "vnext-composition-fragment-window",
    contractVersion: 1,
    kind: "composition-fragment-window",
    status: "complete",
    family: "text-flow",
    documentId: "document-1",
    sectionId: "section-1",
    zoneId: "body-1",
    rootNodeId: "heading-1",
    rootNodeType: "text-block",
    sourceOrder: 3,
    ownerPins: {
      documentStructure: pin("a"),
      resolvedProjection: pin("b"),
      familySource: pin("c"),
      measurement: pin("d"),
      pagination: pin("e"),
    },
    capacity: {
      pageBodyHeightPt: 100,
      firstPageAvailableHeightPt: 60,
      maximumPageCount: 4,
      maximumFragmentCount: 10,
    },
    cursorBefore: before,
    cursorAfter: after,
    pages: [{
      windowPageIndex: 0,
      flowEffect: "place-content",
      availableHeightPt: 60,
      usedHeightPt: 50,
      remainingHeightPt: 10,
      cursorBefore: before,
      cursorAfter: after,
      fragments: [{
        fragmentId: "heading-1:line-0",
        fragmentIndex: 0,
        sourceNodeId: "heading-1",
        blockOffsetPt: 0,
        blockExtentPt: 30,
        continuation: { fromPrevious: false, toNext: false },
        familyEvidenceFingerprint: pin("1"),
        heading: { headingNodeId: "heading-1", level: 1 },
      }, {
        fragmentId: "heading-1:line-1",
        fragmentIndex: 1,
        sourceNodeId: "heading-1",
        blockOffsetPt: 30,
        blockExtentPt: 20,
        continuation: { fromPrevious: false, toNext: false },
        familyEvidenceFingerprint: pin("2"),
        heading: null,
      }],
    }],
    work: { pageCount: 1, fragmentCount: 2, cursorCommitCount: 1 },
    issues: [],
  }
}

function expectation(input: VNextCompositionFragmentWindowInputV1): VNextCompositionFragmentWindowExpectationV1 {
  return {
    family: input.family,
    documentId: input.documentId,
    sectionId: input.sectionId,
    zoneId: input.zoneId,
    rootNodeId: input.rootNodeId,
    rootNodeType: input.rootNodeType,
    sourceOrder: input.sourceOrder,
    ownerPins: input.ownerPins,
    capacity: input.capacity,
    cursorBeforeStateFingerprint: input.cursorBefore.stateFingerprint,
  }
}

describe("whole-document composition common fragment window v1", () => {
  it("finalizes deterministic compact ownership and parses an exact JSON round trip", () => {
    const input = fixture()
    const before = JSON.stringify(input)
    const first = finalizeVNextCompositionFragmentWindowV1(input)
    const second = finalizeVNextCompositionFragmentWindowV1(input)

    expect(first).toMatchObject({
      status: "ready",
      window: {
        status: "complete",
        family: "text-flow",
        fingerprint: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
      },
    })
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
    expect(JSON.stringify(input)).toBe(before)
    if (first.status === "blocked") throw new Error("fixture blocked")
    expect(parseVNextCompositionFragmentWindowV1(
      JSON.parse(JSON.stringify(first.window)),
      expectation(input),
    )).toEqual(first)
  })

  it("rejects family/root drift, stale pins, capacity drift, and stale cursors", () => {
    const wrongFamily = fixture()
    wrongFamily.rootNodeType = "table"
    expect(finalizeVNextCompositionFragmentWindowV1(wrongFamily)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "fragment-window-family-root-mismatch" })],
    })

    const finalized = finalizeVNextCompositionFragmentWindowV1(fixture())
    if (finalized.status === "blocked") throw new Error("fixture blocked")
    const expected = expectation(fixture())
    expected.ownerPins = { ...expected.ownerPins, measurement: pin("9") }
    expected.capacity = { ...expected.capacity, firstPageAvailableHeightPt: 59 }
    expected.cursorBeforeStateFingerprint = pin("8")
    expect(parseVNextCompositionFragmentWindowV1(finalized.window, expected)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "fragment-window-owner-pins-stale" }),
        expect.objectContaining({ code: "fragment-window-capacity-mismatch" }),
        expect.objectContaining({ code: "fragment-window-cursor-stale" }),
      ]),
    })
  })

  it("rejects broken page checkpoints, geometry drift, overlap, and dishonest work", () => {
    const input = fixture()
    if (input.status === "blocked" || input.status === "fresh-page-required") throw new Error("fixture invalid")
    input.pages[0].cursorBefore = cursor("0", false)
    input.pages[0].remainingHeightPt = 9
    input.pages[0].fragments[1].blockOffsetPt = 20
    input.work.fragmentCount = 1

    expect(finalizeVNextCompositionFragmentWindowV1(input)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "fragment-window-page-cursor-chain-broken" }),
        expect.objectContaining({ code: "fragment-window-page-height-drift" }),
        expect.objectContaining({ code: "fragment-window-fragment-overlap" }),
        expect.objectContaining({ code: "fragment-window-work-mismatch" }),
      ]),
    })
  })

  it("requires exact progress and checkpoint continuity across multiple pages", () => {
    const input = fixture()
    if (input.status === "blocked" || input.status === "fresh-page-required") throw new Error("fixture invalid")
    const start = input.cursorBefore
    const middle = cursor("7", false)
    const end = input.cursorAfter
    const firstFragment = input.pages[0].fragments[0]
    const secondFragment = { ...input.pages[0].fragments[1], blockOffsetPt: 0 }
    input.pages = [{
      windowPageIndex: 0,
      flowEffect: "place-content",
      availableHeightPt: 60,
      usedHeightPt: 30,
      remainingHeightPt: 30,
      cursorBefore: start,
      cursorAfter: middle,
      fragments: [firstFragment],
    }, {
      windowPageIndex: 1,
      flowEffect: "place-content",
      availableHeightPt: 100,
      usedHeightPt: 20,
      remainingHeightPt: 80,
      cursorBefore: middle,
      cursorAfter: end,
      fragments: [secondFragment],
    }]
    input.work = { pageCount: 2, fragmentCount: 2, cursorCommitCount: 2 }

    expect(finalizeVNextCompositionFragmentWindowV1(input)).toMatchObject({
      status: "ready",
      window: { pages: [{ windowPageIndex: 0 }, { windowPageIndex: 1 }] },
    })
    input.pages[1].cursorBefore = start
    input.pages[1].cursorAfter = start
    expect(finalizeVNextCompositionFragmentWindowV1(input)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "fragment-window-page-cursor-chain-broken" }),
        expect.objectContaining({ code: "fragment-window-page-no-progress" }),
      ]),
    })
  })

  it("accepts explicit fresh-page and blocked states but rejects no-progress and tampering", () => {
    const base = fixture()
    const fresh: VNextCompositionFragmentWindowInputV1 = {
      ...base,
      status: "fresh-page-required",
      cursorAfter: base.cursorBefore,
      pages: [],
      work: { pageCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
      issues: [],
    }
    expect(finalizeVNextCompositionFragmentWindowV1(fresh)).toMatchObject({
      status: "ready",
      window: { status: "fresh-page-required" },
    })
    expect(finalizeVNextCompositionFragmentWindowV1({
      ...fresh,
      capacity: { ...fresh.capacity, firstPageAvailableHeightPt: fresh.capacity.pageBodyHeightPt },
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "fragment-window-fresh-page-no-progress" })],
    })

    const blocked: VNextCompositionFragmentWindowInputV1 = {
      ...base,
      status: "blocked",
      cursorAfter: null,
      pages: null,
      work: { pageCount: 0, fragmentCount: 0, cursorCommitCount: 0 },
      issues: [{ code: "family-input-stale", severity: "error", path: "ownerPins", message: "stale" }],
    }
    expect(finalizeVNextCompositionFragmentWindowV1(blocked)).toMatchObject({
      status: "ready",
      window: { status: "blocked", issues: [{ code: "family-input-stale" }] },
    })

    const finalized = finalizeVNextCompositionFragmentWindowV1(base)
    if (finalized.status === "blocked") throw new Error("fixture blocked")
    const tampered = { ...finalized.window, sourceOrder: 4 }
    expect(parseVNextCompositionFragmentWindowV1(tampered)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "fragment-window-fingerprint-mismatch" })],
    })
    expect(parseVNextCompositionFragmentWindowV1({ ...finalized.window, runtime: true })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-fragment-window" })],
    })
    expect(() => parseVNextCompositionFragmentWindowV1({ ...finalized.window, runtime: 1n })).not.toThrow()
    expect(parseVNextCompositionFragmentWindowV1({ ...finalized.window, runtime: 1n })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-fragment-window" })],
    })
  })

  it("represents page-break as an explicit zero-height forced page advance", () => {
    const base = fixture()
    if (base.status !== "complete") throw new Error("fixture must be complete")
    const utilityCursor = (state: string, complete: boolean) => ({
      contractVersion: 1 as const,
      kind: "composition-family-cursor-ref" as const,
      family: "utility-flow" as const,
      rootNodeId: "break-1",
      ownerFingerprint: pin("d"),
      stateFingerprint: pin(state),
      complete,
    })
    const before = utilityCursor("3", false)
    const after = utilityCursor("4", true)
    const forced: VNextCompositionFragmentWindowInputV1 = {
      ...base,
      family: "utility-flow",
      rootNodeId: "break-1",
      rootNodeType: "page-break",
      cursorBefore: before,
      cursorAfter: after,
      pages: [{
        windowPageIndex: 0,
        flowEffect: "force-page-advance",
        availableHeightPt: 60,
        usedHeightPt: 0,
        remainingHeightPt: 60,
        cursorBefore: before,
        cursorAfter: after,
        fragments: [],
      }],
      work: { pageCount: 1, fragmentCount: 0, cursorCommitCount: 1 },
    }
    expect(finalizeVNextCompositionFragmentWindowV1(forced)).toMatchObject({
      status: "ready",
      window: { pages: [{ flowEffect: "force-page-advance", fragments: [] }] },
    })

    const dishonest = fixture()
    if (dishonest.status === "blocked" || dishonest.status === "fresh-page-required") throw new Error("fixture invalid")
    dishonest.pages[0].flowEffect = "force-page-advance"
    expect(finalizeVNextCompositionFragmentWindowV1(dishonest)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "fragment-window-force-page-owner-invalid" }),
        expect.objectContaining({ code: "fragment-window-force-page-geometry-invalid" }),
      ]),
    })
  })
})
