import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode } from "../src/schema/document.js"
import {
  createVNextDeepTableSplitPlan,
  VNEXT_DEEP_TABLE_SPLIT_MODE,
  VNEXT_DEEP_TABLE_SPLIT_SOURCE,
} from "../src/index.js"

function pt(value: number) {
  return { value, unit: "pt" as const }
}

function textBlock(id: string, text: string): AuthoredNode {
  return {
    id,
    type: "text-block",
    role: { role: "paragraph" },
    props: {},
    children: [{ id: `${id}-text`, type: "text", text }],
  }
}

function tableDoc(nodes: Record<string, AuthoredNode>, rowIds: string[]): DocumentNode {
  return {
    version: 3,
    document: {
      id: "deep-table-split-doc",
      meta: { title: "Deep Table Split" },
      sections: [{
        id: "section-main",
        type: "section",
        page: {
          size: "A4",
          orientation: "portrait",
          margin: {
            top: pt(72),
            right: pt(72),
            bottom: pt(72),
            left: pt(72),
          },
        },
        zoneIds: ["body-zone"],
        nodes: {
          "body-zone": { id: "body-zone", type: "zone", role: "body", childIds: ["table"] },
          table: {
            id: "table",
            type: "table",
            props: {},
            columns: [{ width: pt(120) }, { width: pt(120) }],
            rowIds,
          },
          ...nodes,
        },
      }],
    },
  }
}

describe("vNext deep table split boundary", () => {
  it("classifies text-only breakable rows as line-range split candidates", () => {
    const doc = tableDoc({
      row: { id: "row", type: "table-row", props: {}, cellIds: ["cell-a", "cell-b"] },
      "cell-a": { id: "cell-a", type: "table-cell", props: {}, childIds: ["text-a"] },
      "cell-b": { id: "cell-b", type: "table-cell", props: {}, childIds: ["text-b"] },
      "text-a": textBlock("text-a", "Alpha"),
      "text-b": textBlock("text-b", "Beta"),
    }, ["row"])

    const plan = createVNextDeepTableSplitPlan(doc)

    expect(plan).toMatchObject({
      source: VNEXT_DEEP_TABLE_SPLIT_SOURCE,
      mode: VNEXT_DEEP_TABLE_SPLIT_MODE,
      status: "ready",
      documentId: "deep-table-split-doc",
      engineContract: {
        consumes: "document-v3-table-structure",
        produces: "deep-table-split-readiness",
        executesPagination: false,
        executesConcreteLayout: false,
        mayRelayoutDocument: false,
        mutatesDocument: false,
        supportsTextLineSplit: true,
        supportsNonTextChildSplit: false,
      },
      tableCount: 1,
      rowCount: 1,
      splitCandidateCount: 1,
      blockedRowCount: 0,
      blockingIssues: [],
    })
    expect(plan.rowPlans[0]).toMatchObject({
      tableId: "table",
      rowId: "row",
      allowBreak: true,
      splitStrategy: "text-line-range",
    })
    expect(plan.rowPlans[0]?.cellPlans.map((cell) => cell.splitSupport)).toEqual(["line-range", "line-range"])
    expect(plan.rowPlans[0]?.cellPlans.flatMap((cell) => cell.childPlans.map((child) => child.policy))).toEqual([
      "splittable-text",
      "splittable-text",
    ])
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks breakable rows with deferred non-text cell children while preserving explicit atomic rows", () => {
    const doc = tableDoc({
      "breakable-row": { id: "breakable-row", type: "table-row", props: {}, cellIds: ["mixed-cell"] },
      "mixed-cell": { id: "mixed-cell", type: "table-cell", props: {}, childIds: ["mixed-text", "mixed-spacer"] },
      "mixed-text": textBlock("mixed-text", "Text"),
      "mixed-spacer": { id: "mixed-spacer", type: "spacer", props: { height: 24 } },
      "atomic-row": { id: "atomic-row", type: "table-row", props: { allowBreak: false }, cellIds: ["atomic-cell"] },
      "atomic-cell": { id: "atomic-cell", type: "table-cell", props: {}, childIds: ["atomic-spacer"] },
      "atomic-spacer": { id: "atomic-spacer", type: "spacer", props: { height: 24 } },
    }, ["breakable-row", "atomic-row"])

    const plan = createVNextDeepTableSplitPlan(doc)

    expect(plan).toMatchObject({
      status: "blocked",
      splitCandidateCount: 0,
      blockedRowCount: 1,
    })
    expect(plan.rowPlans.map((row) => [row.rowId, row.splitStrategy])).toEqual([
      ["breakable-row", "blocked-deep-content"],
      ["atomic-row", "atomic-row"],
    ])
    expect(plan.blockingIssues).toEqual([expect.objectContaining({
      code: "non-text-cell-child-split-deferred",
      rowId: "breakable-row",
      cellId: "mixed-cell",
      nodeId: "mixed-spacer",
    })])
  })

  it("keeps the deep table split boundary independent from concrete pagination, renderers, DOM, and storage", () => {
    const sourceUrl = new URL("../src/pagination/deepTableSplit.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("DocumentNode")
    expect(source).toContain("supportsNonTextChildSplit: false")
    expect(source).toContain("executesPagination: false")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/pdfkit|jspdf|pdf-lib|officegen|pizzip|mammoth|canvas|puppeteer|playwright/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toMatch(/\bdocument\.(querySelector|createElement|body|addEventListener)/)
    expect(source).not.toContain("HTMLElement")
    expect(source).not.toContain("window.")
    expect(source).not.toContain("/api/")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("buildVNextMeasuredRendererConsumption")
  })

  it("documents the deep table split boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/DEEP_TABLE_SPLIT_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 97 implementation boundary.")
    expect(boundaryDoc).toContain("src/pagination/deepTableSplit.ts")
    expect(boundaryDoc).toContain("This is a deep table split boundary.")
    expect(boundaryDoc).toContain("It is not a concrete deep table split engine.")
    expect(boundaryDoc).toContain("supportsNonTextChildSplit = `false`")
    expect(readme).toContain("Deep table split boundary")
    expect(readme).toContain("docs/DEEP_TABLE_SPLIT_BOUNDARY.md")
    expect(ledger).toContain("| 97 | Deep table split boundary | done |")
    expect(roadmap).toContain("## Phase 97: Deep Table Split Boundary")
  })
})
