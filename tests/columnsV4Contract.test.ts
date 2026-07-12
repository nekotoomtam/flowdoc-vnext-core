import { describe, expect, it } from "vitest"
import fixture from "../fixtures/product-report-v4-migrated-minimal.flowdoc.json"
import {
  DocumentNodeV4TargetSchema,
  createVNextColumnsV4Geometry,
  createVNextColumnsV4ImpactFacts,
  validateVNextDocumentV4Structure,
  type DocumentNodeV4Target,
  type VNextColumnsV4Cursor,
} from "../src/index.js"

function documentFixture(): DocumentNodeV4Target {
  return DocumentNodeV4TargetSchema.parse(structuredClone(fixture.document))
}

function addNestedColumns(document: DocumentNodeV4Target, count: number): void {
  const section = document.document.sections[0]
  let parentColumnId = "summary-left"
  for (let depth = 2; depth <= count; depth += 1) {
    const columnsId = `nested-columns-${depth}`
    const columnId = `nested-column-${depth}`
    const parent = section.nodes[parentColumnId]
    if (parent.type !== "column") throw new Error("nested parent column missing")
    parent.childIds.push(columnsId)
    section.nodes[columnsId] = {
      id: columnsId,
      type: "columns",
      props: { gap: 0 },
      columnIds: [columnId],
    }
    section.nodes[columnId] = {
      id: columnId,
      type: "column",
      props: { widthShare: 100 },
      childIds: [],
    }
    parentColumnId = columnId
  }
}

describe("columns v4 contract", () => {
  it("computes deterministic track geometry from canonical shares and gap", () => {
    const document = documentFixture()
    const before = JSON.stringify(document)
    const result = createVNextColumnsV4Geometry(document, {
      sectionId: "section-cover",
      columnsId: "summary-columns",
      availableWidthPt: 500,
      capabilities: { maxNestingDepth: 3, minimumTrackWidthPt: 120 },
    })

    expect(result).toMatchObject({
      status: "ready",
      geometry: {
        availableWidthPt: 500,
        contentWidthPt: 488,
        gapPt: 12,
        tracks: [
          { columnId: "summary-left", columnIndex: 0, widthShare: 50, xOffsetPt: 0, widthPt: 244 },
          { columnId: "summary-right", columnIndex: 1, widthShare: 50, xOffsetPt: 256, widthPt: 244 },
        ],
      },
    })
    expect(JSON.stringify(document)).toBe(before)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("blocks unusable track widths and invalid planner capability", () => {
    const document = documentFixture()
    const narrow = createVNextColumnsV4Geometry(document, {
      sectionId: "section-cover",
      columnsId: "summary-columns",
      availableWidthPt: 500,
      capabilities: { maxNestingDepth: 3, minimumTrackWidthPt: 245 },
    })
    const wrongDepth = createVNextColumnsV4Geometry(document, {
      sectionId: "section-cover",
      columnsId: "summary-columns",
      availableWidthPt: 500,
      capabilities: { maxNestingDepth: 2 as 3, minimumTrackWidthPt: 100 },
    })

    expect(narrow).toMatchObject({
      status: "blocked",
      issues: [
        expect.objectContaining({ code: "track-width-below-minimum", columnId: "summary-left" }),
        expect.objectContaining({ code: "track-width-below-minimum", columnId: "summary-right" }),
      ],
    })
    expect(wrongDepth).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "unsupported-columns-nesting-capability" })],
    })
  })

  it("accepts depth three and blocks a fourth nested Columns container", () => {
    const depthThree = documentFixture()
    addNestedColumns(depthThree, 3)
    const depthFour = documentFixture()
    addNestedColumns(depthFour, 4)

    expect(validateVNextDocumentV4Structure(depthThree).issues).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "columns-nesting-depth-exceeded" }),
    ]))
    expect(validateVNextDocumentV4Structure(depthFour)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({
        code: "columns-nesting-depth-exceeded",
        nodeId: "nested-columns-4",
      })],
    })
  })

  it("publishes JSON-safe cursor/checkpoint shapes and factual invalidation lanes", () => {
    const cursor: VNextColumnsV4Cursor = {
      columnsId: "summary-columns",
      columnsDepth: 1,
      columns: [{
        columnId: "summary-left",
        complete: false,
        child: { childIndex: 0, childNodeId: "summary-left-text", fragmentIndex: 2 },
      }],
    }
    const widthImpact = createVNextColumnsV4ImpactFacts({
      columnsId: "summary-columns",
      descendantNodeIds: ["summary-left", "summary-left-text", "summary-left"],
      changeKind: "track-width",
    })
    const minHeightImpact = createVNextColumnsV4ImpactFacts({
      columnsId: "summary-columns",
      descendantNodeIds: ["summary-left"],
      changeKind: "minimum-height",
    })

    expect(JSON.parse(JSON.stringify(cursor))).toEqual(cursor)
    expect(widthImpact).toMatchObject({
      affectedNodeIds: ["summary-columns", "summary-left", "summary-left-text"],
      invalidationLanes: ["measurement", "pagination", "render"],
      earliestLayoutAnchor: { kind: "node", nodeId: "summary-columns" },
    })
    expect(minHeightImpact.invalidationLanes).toEqual(["pagination", "render"])
  })
})
