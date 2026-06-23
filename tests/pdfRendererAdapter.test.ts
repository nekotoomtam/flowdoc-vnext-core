import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode } from "../src/schema/document.js"
import type { VNextMeasuredRendererConsumption } from "../src/index.js"
import {
  buildVNextMeasuredRendererConsumption,
  createVNextPdfRendererAdapterPlan,
  paginateVNextDocument,
  VNEXT_PDF_RENDERER_ADAPTER_MODE,
  VNEXT_PDF_RENDERER_ADAPTER_SOURCE,
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

function simpleDoc(): DocumentNode {
  return {
    version: 3,
    document: {
      id: "pdf-adapter-doc",
      meta: { title: "PDF Adapter" },
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
          "body-zone": { id: "body-zone", type: "zone", role: "body", childIds: ["body"] },
          body: textBlock("body", "PDF adapter text"),
        },
      }],
    },
  }
}

function blockedConsumption(): VNextMeasuredRendererConsumption {
  return {
    source: "vnext-measured-pagination",
    status: "blocked",
    pageCount: 1,
    commandCount: 1,
    rendererContract: {
      consumes: "measured-pagination-fragments",
      requiresAuthoredDocumentForLayout: false,
      mayRelayout: false,
    },
    commands: [{
      id: "render:broken",
      fragmentId: "broken",
      sourceItemId: "broken-source",
      pageIndex: 0,
      pageNumber: 1,
      sectionId: "section-main",
      zoneId: "body-zone",
      zoneRole: "body",
      nodeId: "broken-table-cell",
      nodeType: "table-cell",
      kind: "container",
      bounds: { xPt: 0, yPt: 0, widthPt: 100, heightPt: 20 },
    }],
    blockingIssues: [{
      severity: "blocking",
      code: "table-fragment-missing-metadata",
      sectionId: "section-main",
      nodeId: "broken-table-cell",
      fragmentId: "broken",
      pageIndex: 0,
      message: "missing table metadata",
    }],
    warningIssues: [],
  }
}

describe("vNext PDF renderer adapter boundary", () => {
  it("adapts measured render commands into a PDF draw plan without rendering bytes", () => {
    const pagination = paginateVNextDocument(simpleDoc())
    const consumption = buildVNextMeasuredRendererConsumption(pagination)
    const plan = createVNextPdfRendererAdapterPlan(consumption)

    expect(plan).toMatchObject({
      source: VNEXT_PDF_RENDERER_ADAPTER_SOURCE,
      mode: VNEXT_PDF_RENDERER_ADAPTER_MODE,
      status: "ready",
      rendererContract: {
        consumes: "measured-render-commands",
        mayRelayout: false,
        requiresAuthoredDocumentForLayout: false,
        output: "pdf",
      },
      artifact: {
        kind: "pdf",
        status: "not-rendered",
        contentType: "application/pdf",
        bytes: null,
        storageId: null,
      },
      pageCount: consumption.pageCount,
      blockingIssues: [],
      warningIssues: [],
    })
    expect(plan.drawCommands).toHaveLength(consumption.commandCount)
    expect(plan.drawCommands.some((command) => command.operation === "draw-text")).toBe(true)
    expect(plan.summary).toMatchObject({
      inputCommandCount: consumption.commandCount,
      drawCommandCount: consumption.commandCount,
      blockingIssueCount: 0,
      warningIssueCount: 0,
    })
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks PDF draw commands when renderer consumption is blocked", () => {
    const plan = createVNextPdfRendererAdapterPlan(blockedConsumption())

    expect(plan).toMatchObject({
      status: "blocked",
      drawCommands: [],
      artifact: {
        kind: "pdf",
        status: "not-rendered",
        bytes: null,
        storageId: null,
      },
      summary: {
        inputCommandCount: 1,
        drawCommandCount: 0,
        blockingIssueCount: 1,
      },
    })
    expect(plan.blockingIssues).toEqual([expect.objectContaining({
      code: "table-fragment-missing-metadata",
      nodeId: "broken-table-cell",
    })])
  })

  it("keeps the PDF adapter independent from concrete renderers, authored documents, DOM, and layout", () => {
    const sourceUrl = new URL("../src/renderer/pdfAdapter.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("VNextMeasuredRendererConsumption")
    expect(source).toContain('status: "not-rendered"')
    expect(source).toContain("mayRelayout: false")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/pdfkit|jspdf|pdf-lib|canvas|puppeteer|playwright/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toMatch(/\bdocument\.(querySelector|createElement|body|addEventListener)/)
    expect(source).not.toContain("HTMLElement")
    expect(source).not.toContain("window.")
    expect(source).not.toContain("/api/")
    expect(source).not.toContain("DocumentNode")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("assessVNextMeasuredPaginationExportReadiness")
  })

  it("documents the PDF renderer adapter boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/PDF_RENDERER_ADAPTER_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 93 implementation boundary.")
    expect(boundaryDoc).toContain("src/renderer/pdfAdapter.ts")
    expect(boundaryDoc).toContain("This is a PDF renderer adapter boundary.")
    expect(boundaryDoc).toContain("It is not a concrete PDF renderer.")
    expect(boundaryDoc).toContain("artifact.status = `not-rendered`")
    expect(readme).toContain("PDF renderer adapter boundary")
    expect(readme).toContain("docs/PDF_RENDERER_ADAPTER_BOUNDARY.md")
    expect(ledger).toContain("| 93 | PDF renderer adapter boundary | done |")
    expect(roadmap).toContain("## Phase 93: PDF Renderer Adapter Boundary")
  })
})
