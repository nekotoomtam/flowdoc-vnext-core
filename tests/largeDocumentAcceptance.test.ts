import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type {
  AuthoredNode,
  DocumentNode,
  FlowDocPackageV2DocumentVNext,
  InlineNode,
  TextBlockNode,
} from "../src/index.js"
import {
  appendVNextAuthoringIntentHistoryResult,
  assessVNextGenerationReadiness,
  buildRelationshipGraph,
  projectVNextTextBlockInlines,
  resolveVNextLiveLayoutBoundary,
  runVNextTextTransaction,
} from "../src/index.js"

function pt(value: number) {
  return { value, unit: "pt" as const }
}

function textBlock(id: string, children: string | InlineNode[]): TextBlockNode {
  return {
    id,
    type: "text-block",
    role: { role: "paragraph" },
    props: {},
    children: typeof children === "string" ? [{ id: `${id}-text`, type: "text", text: children }] : children,
  }
}

interface LargeDocumentOptions {
  blockCount?: number
  tableRowCount?: number
}

interface LargeDocumentFixture {
  package: FlowDocPackageV2DocumentVNext
  bodyBlockIds: string[]
  tableId: string
  tableRowIds: string[]
}

function largeDocumentFixture(options: LargeDocumentOptions = {}): LargeDocumentFixture {
  const blockCount = options.blockCount ?? 520
  const tableRowCount = options.tableRowCount ?? 140
  const bodyBlockIds = Array.from({ length: blockCount }, (_, index) => `body-block-${index}`)
  const tableId = "line-items-table"
  const tableRowIds = Array.from({ length: tableRowCount }, (_, index) => `line-item-row-${index}`)
  const nodes: Record<string, AuthoredNode> = {
    "body-zone": {
      id: "body-zone",
      type: "zone",
      role: "body",
      childIds: [...bodyBlockIds, tableId],
    },
  }

  bodyBlockIds.forEach((id, index) => {
    nodes[id] = textBlock(id, index === 0
      ? [
          { id: `${id}-text-a`, type: "text", text: "Large report for " },
          { id: `${id}-customer`, type: "field-ref", key: "customer.name", fallback: "Customer" },
          { id: `${id}-text-b`, type: "text", text: ` with section ${index}.` },
        ]
      : `Section ${index}: ${"This paragraph is intentionally long enough to behave like production body text. ".repeat(3)}`)
  })

  nodes[tableId] = {
    id: tableId,
    type: "table",
    props: { headerRowCount: 1, repeatHeaderRows: true },
    columns: [{ width: pt(160) }, { width: pt(220) }],
    rowIds: tableRowIds,
  }

  tableRowIds.forEach((rowId, index) => {
    const labelCellId = `${rowId}-label-cell`
    const valueCellId = `${rowId}-value-cell`
    const labelTextId = `${labelCellId}-text`
    const valueTextId = `${valueCellId}-text`

    nodes[rowId] = {
      id: rowId,
      type: "table-row",
      props: { allowBreak: true },
      cellIds: [labelCellId, valueCellId],
    }
    nodes[labelCellId] = {
      id: labelCellId,
      type: "table-cell",
      props: {},
      childIds: [labelTextId],
    }
    nodes[valueCellId] = {
      id: valueCellId,
      type: "table-cell",
      props: {},
      childIds: [valueTextId],
    }
    nodes[labelTextId] = textBlock(labelTextId, index === 0
      ? "Metric"
      : `Line item ${index}`)
    nodes[valueTextId] = textBlock(valueTextId, index === 0
      ? [
          { id: `${valueTextId}-text`, type: "text", text: "Total " },
          { id: `${valueTextId}-total`, type: "field-ref", key: "report.total", fallback: "0" },
        ]
      : `Value row ${index}`)
  })

  const document: DocumentNode = {
    version: 3,
    document: {
      id: "large-acceptance-doc",
      meta: { title: "Large Acceptance Document" },
      sections: [{
        id: "section-main",
        type: "section",
        page: {
          size: "A4",
          orientation: "portrait",
          margin: { top: pt(72), right: pt(72), bottom: pt(72), left: pt(72) },
        },
        zoneIds: ["body-zone"],
        nodes,
      }],
    },
  }

  return {
    package: {
      packageVersion: 2,
      kind: "document",
      id: document.document.id,
      meta: { title: "Large Acceptance Document" },
      fields: {
        version: 1,
        fields: {
          "customer.name": {
            key: "customer.name",
            label: "Customer Name",
            type: "text",
            fallback: "Customer",
          },
          "report.total": {
            key: "report.total",
            label: "Report Total",
            type: "number",
          },
        },
      },
      data: {
        version: 1,
        values: {
          "customer.name": "Example Customer",
          "report.total": 42,
        },
      },
      document,
    },
    bodyBlockIds,
    tableId,
    tableRowIds,
  }
}

function textBlockFrom(document: DocumentNode, id: string): TextBlockNode {
  const node = document.document.sections[0].nodes[id]
  expect(node.type).toBe("text-block")
  if (node.type !== "text-block") throw new Error(`expected text-block ${id}`)
  return node
}

function textEndOffset(document: DocumentNode, textBlockId: string): number {
  return projectVNextTextBlockInlines(textBlockFrom(document, textBlockId)).textLength
}

describe("vNext large document acceptance harness", () => {
  it("builds a generated canonical fixture with hundreds of blocks and many table rows", () => {
    const fixture = largeDocumentFixture()
    const graph = buildRelationshipGraph(fixture.package.document)

    expect(fixture.bodyBlockIds).toHaveLength(520)
    expect(fixture.tableRowIds).toHaveLength(140)
    expect(graph.nodesById.size).toBe(1222)
    expect(graph.nodesById.get(fixture.tableId)).toMatchObject({
      type: "table",
      rowIds: fixture.tableRowIds,
    })
    expect(graph.diagnostics.issues).toEqual([])
  })

  it("keeps a text transaction near the start scoped to one text block without exact pagination", () => {
    const fixture = largeDocumentFixture()
    const targetId = fixture.bodyBlockIds[1]
    const result = runVNextTextTransaction(fixture.package.document, {
      kind: "text.insert",
      position: { textBlockId: targetId, offset: textEndOffset(fixture.package.document, targetId) },
      text: " Added near the start.",
      inlineId: `${targetId}-inserted`,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.issues.map((issue) => issue.message).join("\n"))
    expect(result.transaction.dirtyScope).toEqual({
      kind: "text-block",
      sectionId: "section-main",
      zoneId: "body-zone",
      textBlockId: targetId,
      parentNodeIds: ["body-zone"],
    })

    const records = appendVNextAuthoringIntentHistoryResult([], result)
    const liveLayout = resolveVNextLiveLayoutBoundary({
      kind: "authoring-history",
      records,
      visibleRange: {
        kind: "section-window",
        sectionId: "section-main",
        zoneId: "body-zone",
        startNodeId: targetId,
        endNodeId: fixture.bodyBlockIds[8],
        overscanBefore: 1,
        overscanAfter: 3,
      },
    })

    expect(liveLayout.kind).toBe("layout-request")
    if (liveLayout.kind !== "layout-request") throw new Error("expected layout request")
    expect(liveLayout.affected).toEqual({
      sectionIds: ["section-main"],
      zoneIds: ["body-zone"],
      nodeIds: [targetId],
      parentNodeIds: ["body-zone"],
      textBlockIds: [targetId],
      tableIds: [],
    })
    expect(liveLayout.freshness.exactGeneration).toEqual({
      status: "stale",
      reason: "text-content",
      finalTruth: "measured-pagination",
    })
    expect(liveLayout.request.dirtyScopes).toHaveLength(1)
  })

  it("keeps typing near the end scoped narrowly in a large document", () => {
    const fixture = largeDocumentFixture()
    const targetId = fixture.bodyBlockIds.at(-1)
    if (targetId == null) throw new Error("missing last text block")

    const result = runVNextTextTransaction(fixture.package.document, {
      kind: "text.insert",
      position: { textBlockId: targetId, offset: textEndOffset(fixture.package.document, targetId) },
      text: " Tail edit.",
      inlineId: `${targetId}-tail-edit`,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.issues.map((issue) => issue.message).join("\n"))
    expect(result.transaction.targetTextBlockId).toBe(targetId)
    expect(result.transaction.dirtyScope.textBlockId).toBe(targetId)

    const liveLayout = resolveVNextLiveLayoutBoundary({
      kind: "dirty-scopes",
      dirtyScopes: [result.transaction.dirtyScope],
    })

    expect(liveLayout.kind).toBe("layout-request")
    if (liveLayout.kind !== "layout-request") throw new Error("expected layout request")
    expect(liveLayout.affected.textBlockIds).toEqual([targetId])
    expect(liveLayout.affected.nodeIds).toEqual([targetId])
    expect(liveLayout.affected.tableIds).toEqual([])
  })

  it("keeps generation readiness explicit for a large canonical package", () => {
    const fixture = largeDocumentFixture()
    const readiness = assessVNextGenerationReadiness({
      requestId: "large-readiness",
      template: { package: fixture.package },
      output: { kind: "pdf", measurementProfileId: "server-large" },
    })

    expect(readiness.ok).toBe(true)
    if (!readiness.ok) throw new Error(readiness.issues.map((issue) => issue.message).join("\n"))
    expect(readiness).toMatchObject({
      status: "ready",
      request: {
        requestId: "large-readiness",
        outputKind: "pdf",
        measurementProfileId: "server-large",
        dataSource: "package",
      },
      template: {
        id: "large-acceptance-doc",
        packageVersion: 2,
        documentVersion: 3,
        fieldCount: 2,
      },
      diagnostics: {
        keyData: {
          status: "ready",
          summary: {
            usageCount: 2,
            dataProvided: true,
            errorCount: 0,
            warningCount: 0,
          },
        },
        exactLayout: {
          status: "not-run",
          reason: "readiness-only",
          finalTruth: "measured-pagination",
        },
        artifact: {
          status: "not-rendered",
          reason: "readiness-only",
          requestedKind: "pdf",
        },
      },
      artifact: null,
      generatedDocument: null,
    })
  })

  it("keeps large-document typing and readiness paths independent from exact layout execution", () => {
    const textTransactionSource = readFileSync(new URL("../src/authoring/textTransactions.ts", import.meta.url), "utf8")
    const liveLayoutSource = readFileSync(new URL("../src/authoring/liveLayoutBoundary.ts", import.meta.url), "utf8")
    const generationSource = readFileSync(new URL("../src/generation/runtime.ts", import.meta.url), "utf8")
    const combinedTypingSource = `${textTransactionSource}\n${liveLayoutSource}`

    expect(combinedTypingSource).not.toContain("paginateVNextDocument")
    expect(combinedTypingSource).not.toContain("runVNextLayoutPipeline")
    expect(combinedTypingSource).not.toContain("buildVNextMeasuredRendererConsumption")
    expect(generationSource).not.toContain("runVNextLayoutPipeline")
    expect(generationSource).not.toContain("paginateVNextDocument")
    expect(generationSource).not.toContain("buildVNextMeasuredRendererConsumption")
  })
})
