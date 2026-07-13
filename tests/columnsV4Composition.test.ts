import { describe, expect, it } from "vitest"
import {
  createVNextColumnsCompositionWindowV1,
  hasValidVNextColumnsFlowV4WindowPaginationFingerprint,
  paginateVNextColumnsFlowV4,
  paginateVNextNestedColumnsV4,
  parseVNextCompositionFragmentWindowV1,
  type VNextColumnsCompositionWindowContextV1,
  type VNextColumnsFlowV4PaginationCursor,
  type VNextColumnsV4ChildFragmentSource,
  type VNextColumnsV4Geometry,
  type VNextColumnsV4NestedInput,
  type VNextColumnsV4NestedPageFragment,
} from "../src/index.js"

const pin = (value: string) => `sha256:${value.repeat(64).slice(0, 64)}`

function source(
  nodeId: string,
  heights: number[],
  keepPolicy: VNextColumnsV4ChildFragmentSource["keepPolicy"] = "allow-split",
): VNextColumnsV4ChildFragmentSource {
  let total = 0
  const prefixHeightsPt = [0]
  const point = (offset: number) => ({
    textBlockId: nodeId,
    inlineId: `${nodeId}-run`,
    authoredOffset: offset,
    resolvedOffset: offset,
    affinity: "forward" as const,
  })
  const candidates = heights.map((heightPt, fragmentIndex) => {
    total += heightPt
    prefixHeightsPt.push(total)
    return {
      fragmentId: `${nodeId}:line-${fragmentIndex}`,
      nodeId,
      fragmentIndex,
      sourceKind: "text-line" as const,
      heightPt,
      breakAfter: true as const,
      sourceStart: point(fragmentIndex),
      sourceEnd: point(fragmentIndex + 1),
    }
  })
  return {
    source: "vnext-columns-v4-fragments",
    version: 1,
    kind: "text-block-lines",
    nodeId,
    keepPolicy,
    candidates,
    prefixHeightsPt,
    totalHeightPt: total,
    fingerprint: `${nodeId}:${keepPolicy}:${heights.join(",")}`,
  }
}

function geometry(columnsId: string, columnId: string, widthPt = 240): VNextColumnsV4Geometry {
  return {
    columnsId,
    sectionId: "section-main",
    availableWidthPt: widthPt,
    gapPt: 0,
    contentWidthPt: widthPt,
    tracks: [{ columnId, columnIndex: 0, widthShare: 100, xOffsetPt: 0, widthPt }],
    fingerprint: `${columnsId}:${widthPt}:${columnId}`,
  }
}

function depthThree(lineCount = 60, lineHeightPt = 10): VNextColumnsV4NestedInput {
  const inner: VNextColumnsV4NestedInput = {
    geometry: geometry("columns-depth-3", "column-depth-3"),
    lanes: [{
      columnId: "column-depth-3",
      items: [{
        kind: "fragments",
        nodeId: "columns-text",
        source: source("columns-text", Array.from({ length: lineCount }, () => lineHeightPt)),
      }],
    }],
  }
  const middle: VNextColumnsV4NestedInput = {
    geometry: geometry("columns-depth-2", "column-depth-2"),
    lanes: [{
      columnId: "column-depth-2",
      items: [{ kind: "columns", nodeId: "columns-depth-3", columns: inner }],
    }],
  }
  return {
    geometry: geometry("columns-depth-1", "column-depth-1"),
    lanes: [{
      columnId: "column-depth-1",
      items: [{ kind: "columns", nodeId: "columns-depth-2", columns: middle }],
    }],
  }
}

function context(): VNextColumnsCompositionWindowContextV1 {
  return {
    documentId: "document-1",
    sectionId: "section-main",
    zoneId: "body-1",
    sourceOrder: 2,
    documentStructureFingerprint: pin("a"),
    resolvedProjectionFingerprint: pin("b"),
    familySourceFingerprint: pin("c"),
  }
}

describe("Columns v4 bounded Composition", () => {
  it("projects retained page checkpoints through the strict common contract", () => {
    const columns = depthThree()
    const before = JSON.stringify(columns)
    const pagination = paginateVNextColumnsFlowV4({
      columns,
      pageBodyHeightPt: 100,
      maximumPageCount: 2,
    })
    expect(pagination).toMatchObject({
      status: "partial",
      pages: [
        { cursorBefore: { nextFragmentIndex: 0 }, cursorAfter: { nextFragmentIndex: 1 }, page: { usedHeightPt: 100 } },
        { cursorBefore: { nextFragmentIndex: 1 }, cursorAfter: { nextFragmentIndex: 2 }, page: { usedHeightPt: 100 } },
      ],
      contracts: { cursorCommit: "atomic-per-page", measurementExecution: false },
    })
    expect(hasValidVNextColumnsFlowV4WindowPaginationFingerprint(pagination)).toBe(true)
    const result = createVNextColumnsCompositionWindowV1({ pagination, context: context() })
    expect(result).toMatchObject({
      status: "ready",
      window: {
        status: "partial",
        family: "columns-flow",
        rootNodeType: "columns",
        pages: [
          { fragments: [{ fragmentIndex: 0, blockExtentPt: 100, continuation: { fromPrevious: false, toNext: true } }] },
          { fragments: [{ fragmentIndex: 1, blockExtentPt: 100, continuation: { fromPrevious: true, toNext: true } }] },
        ],
      },
    })
    if (result.status === "blocked") throw new Error("Columns common window blocked")
    expect(parseVNextCompositionFragmentWindowV1(result.window)).toEqual(result)
    expect(JSON.stringify(columns)).toBe(before)
  })

  it("resumes one-page windows to exact Phase 289 pages and final lane cursor", () => {
    const columns = depthThree()
    const baseline = paginateVNextNestedColumnsV4({ columns, pageBodyHeightPt: 100, maximumPageCount: 20 })
    if (baseline.status !== "paginated") throw new Error("Columns baseline blocked")
    const pages: VNextColumnsV4NestedPageFragment[] = []
    let cursor: VNextColumnsFlowV4PaginationCursor | undefined
    do {
      const window = paginateVNextColumnsFlowV4({
        columns,
        pageBodyHeightPt: 100,
        maximumPageCount: 1,
        ...(cursor == null ? {} : { cursor }),
      })
      if (window.status === "blocked" || window.status === "fresh-page-required") {
        throw new Error("Columns resume window did not commit content")
      }
      pages.push(...window.pages.map((checkpoint) => checkpoint.page))
      cursor = window.cursorAfter
    } while (!cursor.complete)

    expect(pages).toEqual(baseline.pages)
    expect(cursor.state).toEqual(baseline.cursorAfter)
    expect(cursor.nextFragmentIndex).toBe(baseline.pages.length)
  })

  it("returns fresh-page demand without cursor progress for a fitting prefer-together source", () => {
    const columns: VNextColumnsV4NestedInput = {
      geometry: geometry("columns-keep", "column-keep"),
      lanes: [{
        columnId: "column-keep",
        items: [{
          kind: "fragments",
          nodeId: "keep-text",
          source: source("keep-text", [40, 40], "prefer-together"),
        }],
      }],
    }
    const fresh = paginateVNextColumnsFlowV4({
      columns,
      pageBodyHeightPt: 100,
      firstPageAvailableHeightPt: 40,
      maximumPageCount: 1,
    })
    expect(fresh).toMatchObject({
      status: "fresh-page-required",
      pages: [],
      work: { pageAttemptCount: 1, zeroProgressPageAdvanceCount: 1 },
    })
    if (fresh.status !== "fresh-page-required") throw new Error("expected Columns fresh-page demand")
    expect(fresh.cursorAfter).toEqual(fresh.cursorBefore)
    const adaptedFresh = createVNextColumnsCompositionWindowV1({ pagination: fresh, context: context() })
    expect(adaptedFresh).toMatchObject({
      status: "ready",
      window: { status: "fresh-page-required", pages: [] },
    })
    if (adaptedFresh.status === "blocked") throw new Error("Columns fresh adapter blocked")
    expect(adaptedFresh.window.cursorAfter).toEqual(adaptedFresh.window.cursorBefore)

    const retry = paginateVNextColumnsFlowV4({
      columns,
      pageBodyHeightPt: 100,
      maximumPageCount: 1,
      cursor: fresh.cursorBefore,
    })
    expect(retry).toMatchObject({
      status: "complete",
      pages: [{ page: { usedHeightPt: 80 } }],
      cursorAfter: { terminalFragmentCommitted: true, complete: true },
    })
  })

  it("commits positive minimum height once and blocks zero-extent common output", () => {
    const empty = (minimumHeightPt?: number): VNextColumnsV4NestedInput => ({
      geometry: geometry("columns-empty", "column-empty"),
      lanes: [{ columnId: "column-empty", items: [] }],
      ...(minimumHeightPt == null ? {} : { minimumHeightPt }),
    })
    const minimum = paginateVNextColumnsFlowV4({
      columns: empty(24),
      pageBodyHeightPt: 100,
      maximumPageCount: 1,
    })
    expect(minimum).toMatchObject({
      status: "complete",
      pages: [{ page: { usedHeightPt: 24 } }],
      cursorBefore: { state: { columns: [{ complete: true }] }, terminalFragmentCommitted: false, complete: false },
      cursorAfter: { terminalFragmentCommitted: true, complete: true },
    })
    expect(createVNextColumnsCompositionWindowV1({ pagination: minimum, context: context() }).status).toBe("ready")

    const zero = paginateVNextColumnsFlowV4({ columns: empty(), pageBodyHeightPt: 100, maximumPageCount: 1 })
    expect(createVNextColumnsCompositionWindowV1({ pagination: zero, context: context() })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "columns-composition-zero-extent-unsupported" })],
    })
  })

  it("blocks stale cursors and tampered page checkpoints", () => {
    const columns = depthThree()
    const pagination = paginateVNextColumnsFlowV4({ columns, pageBodyHeightPt: 100, maximumPageCount: 1 })
    if (pagination.status === "blocked" || pagination.status === "fresh-page-required") {
      throw new Error("Columns tamper fixture blocked")
    }
    const tampered = structuredClone(pagination)
    tampered.pages[0].page.usedHeightPt += 1
    expect(hasValidVNextColumnsFlowV4WindowPaginationFingerprint(tampered)).toBe(false)
    expect(createVNextColumnsCompositionWindowV1({ pagination: tampered, context: context() })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "columns-composition-pagination-fingerprint-mismatch" })],
    })

    const staleCursor = structuredClone(pagination.cursorAfter)
    staleCursor.sourceFingerprint = pin("9")
    expect(paginateVNextColumnsFlowV4({
      columns,
      pageBodyHeightPt: 100,
      maximumPageCount: 1,
      cursor: staleCursor,
    })).toMatchObject({
      status: "blocked",
      pages: null,
      cursorAfter: null,
      issues: [expect.objectContaining({ code: "columns-flow-cursor-owner-mismatch" })],
    })

    const completed = paginateVNextColumnsFlowV4({
      columns: {
        geometry: geometry("columns-terminal", "column-terminal"),
        lanes: [{
          columnId: "column-terminal",
          items: [{ kind: "fragments", nodeId: "terminal-text", source: source("terminal-text", [20]) }],
        }],
      },
      pageBodyHeightPt: 100,
      maximumPageCount: 1,
    })
    if (completed.status !== "complete") throw new Error("terminal cursor fixture did not complete")
    const replay = {
      ...structuredClone(completed.cursorAfter),
      terminalFragmentCommitted: false,
      complete: false,
    }
    expect(paginateVNextColumnsFlowV4({
      columns: {
        geometry: geometry("columns-terminal", "column-terminal"),
        lanes: [{
          columnId: "column-terminal",
          items: [{ kind: "fragments", nodeId: "terminal-text", source: source("terminal-text", [20]) }],
        }],
      },
      pageBodyHeightPt: 100,
      maximumPageCount: 1,
      cursor: replay,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "columns-flow-cursor-terminal-replay-invalid" })],
    })
  })

  it("retains 6,000 depth-three fragments through 250 bounded common windows", () => {
    const columns = depthThree(6_000)
    const before = JSON.stringify(columns)
    const baseline = paginateVNextNestedColumnsV4({
      columns,
      pageBodyHeightPt: 240,
      maximumPageCount: 300,
    })
    if (baseline.status !== "paginated") throw new Error("Columns scale baseline blocked")
    const pages: VNextColumnsV4NestedPageFragment[] = []
    const fingerprints: string[] = []
    const work = {
      pageAttemptCount: 0,
      lanePlanCount: 0,
      nestedPlanCount: 0,
      checkpointLookupCount: 0,
      consumedFragmentCount: 0,
    }
    let cursor: VNextColumnsFlowV4PaginationCursor | undefined
    do {
      const pagination = paginateVNextColumnsFlowV4({
        columns,
        pageBodyHeightPt: 240,
        maximumPageCount: 1,
        ...(cursor == null ? {} : { cursor }),
      })
      if (pagination.status === "blocked" || pagination.status === "fresh-page-required") {
        throw new Error("Columns scale window blocked")
      }
      const adapted = createVNextColumnsCompositionWindowV1({ pagination, context: context() })
      if (adapted.status === "blocked") throw new Error(adapted.issues.map((item) => item.message).join("; "))
      pages.push(pagination.pages[0].page)
      fingerprints.push(adapted.window.fingerprint)
      work.pageAttemptCount += pagination.work.pageAttemptCount
      work.lanePlanCount += pagination.work.lanePlanCount
      work.nestedPlanCount += pagination.work.nestedPlanCount
      work.checkpointLookupCount += pagination.work.checkpointLookupCount
      work.consumedFragmentCount += pagination.work.consumedFragmentCount
      cursor = pagination.cursorAfter
    } while (!cursor.complete)

    expect(pages).toEqual(baseline.pages)
    expect(pages).toHaveLength(250)
    expect(work).toEqual({
      pageAttemptCount: 250,
      lanePlanCount: 750,
      nestedPlanCount: 500,
      checkpointLookupCount: 250,
      consumedFragmentCount: 6_000,
    })
    expect(new Set(fingerprints).size).toBe(250)
    expect(cursor.state).toEqual(baseline.cursorAfter)
    expect(JSON.stringify(columns)).toBe(before)
  }, 30_000)
})
