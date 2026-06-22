import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { FlowDocPackageV2DocumentVNext } from "../src/persistence/package.js"
import {
  buildRelationshipGraph,
  createStructuralProjection,
  parseFlowDocPackageV2DocumentVNext,
  STRUCTURAL_PROJECTION_MODE,
  STRUCTURAL_PROJECTION_SOURCE,
} from "../src/index.js"

function parseFixture(name: string): FlowDocPackageV2DocumentVNext {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  const raw = readFileSync(fixtureUrl, "utf8")
  return parseFlowDocPackageV2DocumentVNext(JSON.parse(raw))
}

describe("structural projection", () => {
  it("projects canonical document graph facts into a read-only tree view", () => {
    const pack = parseFixture("product-report-vnext-minimal.flowdoc.json")
    const projection = createStructuralProjection(pack.document)
    const section = projection.sections[0]
    const root = section.roots[0]
    const title = projection.nodeById.get("title")
    const columns = projection.nodeById.get("summary-columns")
    const leftColumn = projection.nodeById.get("summary-left")
    const tableCellText = projection.nodeById.get("detail-cell-a-text")

    expect(projection).toMatchObject({
      documentId: "product-report-vnext-minimal",
      documentVersion: 3,
      graphIssueCount: 0,
      mode: STRUCTURAL_PROJECTION_MODE,
      nodeCount: 13,
      sectionCount: 1,
      source: STRUCTURAL_PROJECTION_SOURCE,
      version: 1,
    })
    expect(section).toMatchObject({
      nodeCount: 13,
      rootNodeCount: 1,
      rootNodeIds: ["zone-cover-body"],
      sectionId: "section-cover",
    })
    expect(root).toMatchObject({
      childNodeIds: ["title", "summary-columns", "detail-table"],
      depth: 0,
      nodeId: "zone-cover-body",
      nodeType: "zone",
      parent: {
        childField: "zoneIds",
        id: "section-cover",
        index: 0,
        kind: "section",
      },
      path: ["zone-cover-body"],
      sectionId: "section-cover",
      zoneId: "zone-cover-body",
    })
    expect(title).toMatchObject({
      capabilities: {
        canBeDeleted: true,
        canContainText: true,
        operationSurface: "text-block",
      },
      childNodeIds: [],
      depth: 1,
      nodeId: "title",
      nodeType: "text-block",
      parent: {
        childField: "childIds",
        id: "zone-cover-body",
        index: 0,
        kind: "zone",
      },
      path: ["zone-cover-body", "title"],
      sectionId: "section-cover",
      zoneId: "zone-cover-body",
    })
    expect(columns).toMatchObject({
      capabilities: {
        childrenField: "columnIds",
        operationSurface: "columns",
      },
      childNodeIds: ["summary-left", "summary-right"],
      depth: 1,
      nodeId: "summary-columns",
      nodeType: "columns",
      path: ["zone-cover-body", "summary-columns"],
    })
    expect(leftColumn).toMatchObject({
      childNodeIds: ["summary-left-text"],
      depth: 2,
      nodeType: "column",
      parent: {
        childField: "columnIds",
        id: "summary-columns",
        index: 0,
        kind: "columns",
      },
      path: ["zone-cover-body", "summary-columns", "summary-left"],
    })
    expect(tableCellText).toMatchObject({
      depth: 4,
      nearest: {
        sectionId: "section-cover",
        tableCellId: "detail-cell-a",
        tableId: "detail-table",
        tableRowId: "detail-header-row",
        textBlockId: "detail-cell-a-text",
        zoneId: "zone-cover-body",
      },
      nodeType: "text-block",
      parent: {
        childField: "childIds",
        id: "detail-cell-a",
        index: 0,
        kind: "table-cell",
      },
      path: [
        "zone-cover-body",
        "detail-table",
        "detail-header-row",
        "detail-cell-a",
        "detail-cell-a-text",
      ],
    })
  })

  it("keeps projection order aligned with an injected relationship graph", () => {
    const pack = parseFixture("product-report-vnext.flowdoc.json")
    const graph = buildRelationshipGraph(pack.document)
    const projection = createStructuralProjection(pack.document, { graph })
    const coverSection = projection.sectionById.get("section-cover")
    const bodyMetricsTable = projection.nodeById.get("body-metrics-table")
    const metricValueText = projection.nodeById.get("metric-value-total-text")

    expect(coverSection?.rootNodeIds).toEqual([
      "cover-first-header",
      "cover-body",
      "cover-first-footer",
    ])
    expect(bodyMetricsTable?.childNodeIds).toEqual(graph.childrenByNodeId.get("body-metrics-table"))
    expect(metricValueText?.path).toEqual([
      "body-main",
      "body-metrics-table",
      "metrics-data-row",
      "metric-value-total",
      "metric-value-total-text",
    ])
    expect(metricValueText?.nearest).toEqual(graph.nearestByNodeId.get("metric-value-total-text"))
    expect(projection.nodeCount).toBe(graph.nodesById.size)
  })

  it("does not mutate canonical documents while materializing the projection", () => {
    const pack = parseFixture("product-report-vnext-minimal.flowdoc.json")
    const before = JSON.stringify(pack.document)
    const projection = createStructuralProjection(pack.document)

    projection.sections[0].roots[0].children.slice().reverse()

    expect(JSON.stringify(pack.document)).toBe(before)
    expect(pack.document.document.sections[0].nodes["zone-cover-body"]).toMatchObject({
      childIds: ["title", "summary-columns", "detail-table"],
    })
  })

  it("documents the projection as a derived working view, not persisted schema", () => {
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const doc = readFileSync(new URL("../docs/TEMPLATE_BUILDER_STRUCTURAL_PROJECTION_BOUNDARY.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(readme).toContain("Structural projection boundary derives read-only tree-shaped working views")
    expect(doc).toContain("Status: Phase 69 implementation boundary.")
    expect(doc).toContain("new persisted")
    expect(doc).toContain("createStructuralProjection")
    expect(doc).toContain("StructuralProjectionNode")
    expect(doc).toContain("does not mutate the canonical document")
    expect(ledger).toContain("| 69 | Structural projection boundary | done |")
  })
})
