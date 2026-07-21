import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  composeVNextTextBlockMultiRunDocumentV1,
  createVNextLayoutUnitPolicyV1,
  projectVNextTextBlockMultiRunDocumentDisplayListV1,
  type VNextTextBlockMultiRunDocumentCompositionRequestV1,
  type VNextTextBlockMultiRunLayoutRequestV1,
  type VNextTextBlockMultiRunLayoutResultV1,
} from "../src/index.js"

const UNIT = 1_000_000

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function layout(textBlockId: string, texts: string[], revision: number): VNextTextBlockMultiRunLayoutResultV1 {
  const renderedText = texts.join("")
  let offset = 0
  const lineRanges = texts.map((text, index) => {
    const start = offset
    offset += text.length
    return { index, renderStartOffset: start, renderEndOffset: offset }
  })
  const request: VNextTextBlockMultiRunLayoutRequestV1 = {
    layoutId: `layout:${textBlockId}:r${revision}`,
    measurement: {
      documentId: "document-multi-block",
      instanceRevision: revision,
      sectionId: "section-main",
      textBlockId,
      availableWidthPt: 100,
      measurementProfileId: "profile-multi-block",
      styleKey: "body",
      renderedText,
      runs: [{
        inlineId: `inline:${textBlockId}`,
        kind: "text",
        renderStartOffset: 0,
        renderEndOffset: renderedText.length,
        renderedText,
        styleKey: "body",
      }],
    },
    layoutUnitPolicyFingerprint: createVNextLayoutUnitPolicyV1().fingerprint,
    availableWidthLayoutUnit: 100 * UNIT,
    declaredLineHeightLayoutUnit: 10 * UNIT,
    paragraphStyle: {
      styleKey: "body",
      fontFaceId: "fixture-regular",
      fontSizeLayoutUnit: 10 * UNIT,
      textColor: "202020",
    },
    fontFaces: [{
      fontFaceId: "fixture-regular",
      fontFamily: "Fixture",
      fontSha256: "a".repeat(64),
      weight: 400,
      style: "normal",
      unitsPerEm: 1_000,
      ascentFontUnit: 800,
      descentFontUnit: -200,
      lineGapFontUnit: 0,
    }],
    shapingRuns: [{
      shapingRunId: `run:${textBlockId}:r${revision}`,
      renderStartOffset: 0,
      renderEndOffset: renderedText.length,
      text: renderedText,
      styleKey: "body",
      fontFaceId: "fixture-regular",
      fontSizeLayoutUnit: 10 * UNIT,
      textColor: "202020",
      direction: "ltr",
      baselineShiftLayoutUnit: 0,
      features: [],
      clusters: Array.from(renderedText, (_, index) => ({
        index,
        renderStartOffset: index,
        renderEndOffset: index + 1,
        advanceLayoutUnit: 5 * UNIT,
      })),
    }],
    breakOffsets: [0, ...lineRanges.map((line) => line.renderEndOffset)],
    lines: lineRanges,
  }
  return acceptVNextTextBlockMultiRunLayoutV1(request)
}

function request(
  layouts: VNextTextBlockMultiRunLayoutResultV1[],
  overrides: Partial<VNextTextBlockMultiRunDocumentCompositionRequestV1> = {},
): VNextTextBlockMultiRunDocumentCompositionRequestV1 {
  return {
    compositionId: "composition-multi-block",
    documentId: "document-multi-block",
    documentRevision: 1,
    layoutUnitPolicyFingerprint: createVNextLayoutUnitPolicyV1().fingerprint,
    pageGeometry: {
      widthLayoutUnit: 120 * UNIT,
      heightLayoutUnit: 50 * UNIT,
      bodyXLayoutUnit: 10 * UNIT,
      bodyYLayoutUnit: 10 * UNIT,
      bodyWidthLayoutUnit: 100 * UNIT,
      bodyHeightLayoutUnit: 30 * UNIT,
    },
    blockGapLayoutUnit: 0,
    blocks: layouts.map((candidate) => ({ textBlockId: candidate.textBlockId, layout: candidate })),
    dirtyTextBlockIds: layouts.map((candidate) => candidate.textBlockId),
    ...overrides,
  }
}

describe("TextBlock multi-run document composition v1", () => {
  it("splits accepted lines across pages and lets expansion/deletion add and remove a page", () => {
    const initialLayouts = [
      layout("block-0", ["A", "B"], 1),
      layout("block-1", ["C", "D"], 1),
      layout("block-2", ["E", "F"], 1),
    ]
    const initial = composeVNextTextBlockMultiRunDocumentV1(request(initialLayouts))
    expect(initial.status).toBe("accepted")
    if (initial.status !== "accepted") throw new Error("initial composition blocked")
    expect(initial.summary).toEqual({ blockCount: 3, lineCount: 6, pageCount: 2, splitBlockCount: 1 })
    expect(initial.linePlacements.map((line) => [line.textBlockId, line.lineIndex, line.pageIndex])).toEqual([
      ["block-0", 0, 0], ["block-0", 1, 0], ["block-1", 0, 0],
      ["block-1", 1, 1], ["block-2", 0, 1], ["block-2", 1, 1],
    ])
    expect(initial.blocks[1]).toMatchObject({ splitAcrossPages: true, pageIndices: [0, 1] })
    expect(initial.linePlacements[2]).toMatchObject({ continuesOnNextPage: true })
    expect(initial.linePlacements[3]).toMatchObject({ continuesFromPreviousPage: true })

    const expandedLayouts = [initialLayouts[0]!, layout("block-1", ["C", "D", "G"], 2), initialLayouts[2]!]
    const expanded = composeVNextTextBlockMultiRunDocumentV1(request(expandedLayouts, {
      documentRevision: 2,
      dirtyTextBlockIds: ["block-1"],
      previousComposition: initial,
    }))
    expect(expanded.status).toBe("accepted")
    if (expanded.status !== "accepted") throw new Error("expanded composition blocked")
    expect(expanded.summary.pageCount).toBe(3)
    expect(expanded.work).toMatchObject({
      firstDirtyBlockIndex: 1,
      reusedPrefixBlockCount: 1,
      recomposedBlockCount: 2,
      recomposedLineCount: 5,
      reusedSuffixBlockCount: 0,
      reconvergedAtBlockIndex: null,
    })

    const contracted = composeVNextTextBlockMultiRunDocumentV1(request(initialLayouts, {
      documentRevision: 3,
      dirtyTextBlockIds: ["block-1"],
      previousComposition: expanded,
    }))
    expect(contracted.status).toBe("accepted")
    if (contracted.status !== "accepted") throw new Error("contracted composition blocked")
    expect(contracted.summary.pageCount).toBe(2)
    expect(contracted.pages[1]!.remainingHeightLayoutUnit).toBe(0)
  })

  it("reuses the prefix then stops at an exact downstream block-boundary cursor", () => {
    const beforeLayouts = Array.from({ length: 10 }, (_, index) => layout(`block-${index}`, ["A"], 1))
    const before = composeVNextTextBlockMultiRunDocumentV1(request(beforeLayouts))
    if (before.status !== "accepted") throw new Error("before composition blocked")
    const changedLayouts = beforeLayouts.map((candidate, index) => (
      index === 5 ? layout("block-5", ["Z"], 2) : candidate
    ))
    const after = composeVNextTextBlockMultiRunDocumentV1(request(changedLayouts, {
      documentRevision: 2,
      dirtyTextBlockIds: ["block-5"],
      previousComposition: before,
    }))
    expect(after.status).toBe("accepted")
    if (after.status !== "accepted") throw new Error("after composition blocked")
    expect(after.work).toEqual({
      firstDirtyBlockIndex: 5,
      reusedPrefixBlockCount: 5,
      recomposedBlockCount: 1,
      recomposedLineCount: 1,
      reusedSuffixBlockCount: 4,
      reconvergedAtBlockIndex: 6,
    })
    expect(after.linePlacements.slice(0, 5)).toEqual(before.linePlacements.slice(0, 5))
    expect(after.linePlacements.slice(6)).toEqual(before.linePlacements.slice(6))

    const noChange = composeVNextTextBlockMultiRunDocumentV1(request(changedLayouts, {
      documentRevision: 3,
      dirtyTextBlockIds: [],
      previousComposition: after,
    }))
    expect(noChange.status).toBe("accepted")
    if (noChange.status !== "accepted") throw new Error("no-change composition blocked")
    expect(noChange.work).toEqual({
      firstDirtyBlockIndex: null,
      reusedPrefixBlockCount: 0,
      recomposedBlockCount: 0,
      recomposedLineCount: 0,
      reusedSuffixBlockCount: 10,
      reconvergedAtBlockIndex: 0,
    })
    expect(noChange.linePlacements).toEqual(after.linePlacements)
  })

  it("projects composed pages without measuring, relayout, or repagination", () => {
    const layouts = [layout("block-0", ["A", "B"], 1), layout("block-1", ["C", "D"], 1)]
    const composition = composeVNextTextBlockMultiRunDocumentV1(request(layouts))
    const before = JSON.stringify(composition)
    const projected = projectVNextTextBlockMultiRunDocumentDisplayListV1({
      projectionId: "projection-multi-block",
      composition,
      layouts,
    })
    expect(projected.status).toBe("ready")
    if (projected.status !== "ready") throw new Error("projection blocked")
    expect(projected.summary).toEqual({ pageCount: 2, lineCount: 4, commandCount: 4, nonBlankCommandCount: 4 })
    expect(projected.pages.map((page) => page.commandIds.length)).toEqual([3, 1])
    expect(projected.commands.map((command) => [command.text, command.pageIndex, command.baselineYLayoutUnit])).toEqual([
      ["A", 0, 18 * UNIT], ["B", 0, 28 * UNIT], ["C", 0, 38 * UNIT], ["D", 1, 18 * UNIT],
    ])
    expect(projected.contracts).toMatchObject({
      paginationAuthority: "core-composition",
      rendererMayMeasureText: false,
      rendererMayRelayout: false,
      rendererMayPaginate: false,
    })
    expect(projected.work).toEqual({ reusedLineCount: 0, projectedLineCount: 4, validatedLayoutCount: 2 })
    expect(JSON.stringify(composition)).toBe(before)

    const reused = projectVNextTextBlockMultiRunDocumentDisplayListV1({
      projectionId: "projection-multi-block-reused",
      composition,
      layouts,
      previousDisplayList: projected,
    })
    expect(reused.status).toBe("ready")
    if (reused.status !== "ready") throw new Error("incremental projection blocked")
    expect(reused.work).toEqual({ reusedLineCount: 4, projectedLineCount: 0, validatedLayoutCount: 0 })
    expect(reused.commands).toEqual(projected.commands)
  })

  it("fails closed on production binding, unknown dirty ids, over-tall lines, and mutated placements", () => {
    const layouts = [layout("block-0", ["A"], 1)]
    expect(composeVNextTextBlockMultiRunDocumentV1(request(layouts, {
      bindProductionComposition: true,
      dirtyTextBlockIds: ["missing"],
    }))).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "production-binding-forbidden" }),
        expect.objectContaining({ code: "invalid-dirty-text-block" }),
      ]),
    })

    const tooTallLayout = layout("block-tall", ["A"], 1)
    expect(composeVNextTextBlockMultiRunDocumentV1(request([tooTallLayout], {
      pageGeometry: { ...request([tooTallLayout]).pageGeometry, bodyHeightLayoutUnit: 5 * UNIT },
    }))).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "line-too-tall" })],
    })

    const composition = composeVNextTextBlockMultiRunDocumentV1(request(layouts))
    if (composition.status !== "accepted") throw new Error("composition blocked")
    const mutated = clone(composition)
    mutated.linePlacements[0]!.xLayoutUnit += 1
    const rejected = projectVNextTextBlockMultiRunDocumentDisplayListV1({
      projectionId: "projection-mutated",
      composition: mutated,
      layouts,
    })
    expect(rejected.status).toBe("blocked")
    expect(rejected.issues.map((candidate) => candidate.code)).toEqual(expect.arrayContaining([
      "fingerprint-mismatch",
      "composition-fingerprint-mismatch",
    ]))

    const rejectedReuse = composeVNextTextBlockMultiRunDocumentV1(request(layouts, {
      documentRevision: 2,
      dirtyTextBlockIds: ["block-0"],
      previousComposition: mutated,
    }))
    expect(rejectedReuse).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-previous-composition" })],
    })

    const mutatedLayout = clone(layouts[0]!)
    if (mutatedLayout.status !== "accepted") throw new Error("layout fixture blocked")
    mutatedLayout.lines[0]!.fragments[0]!.xLayoutUnit += 1
    const rejectedLayout = projectVNextTextBlockMultiRunDocumentDisplayListV1({
      projectionId: "projection-mutated-layout",
      composition,
      layouts: [mutatedLayout],
    })
    expect(rejectedLayout.status).toBe("blocked")
    expect(rejectedLayout.issues.map((candidate) => candidate.code)).toContain("layout-fingerprint-mismatch")

    const readyDisplay = projectVNextTextBlockMultiRunDocumentDisplayListV1({
      projectionId: "projection-ready-for-mutation",
      composition,
      layouts,
    })
    if (readyDisplay.status !== "ready") throw new Error("ready display fixture blocked")
    const mutatedPreviousDisplay = clone(readyDisplay)
    mutatedPreviousDisplay.commands[0]!.text = "mutated"
    expect(projectVNextTextBlockMultiRunDocumentDisplayListV1({
      projectionId: "projection-rejected-previous",
      composition,
      layouts,
      previousDisplayList: mutatedPreviousDisplay,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-previous-display-list" })],
    })
  })
})
