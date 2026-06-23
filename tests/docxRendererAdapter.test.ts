import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode } from "../src/schema/document.js"
import type { VNextMeasuredRendererConsumption } from "../src/index.js"
import {
  buildVNextMeasuredRendererConsumption,
  createVNextDocxRendererAdapterPlan,
  paginateVNextDocument,
  VNEXT_DOCX_RENDERER_ADAPTER_MODE,
  VNEXT_DOCX_RENDERER_ADAPTER_SOURCE,
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
      id: "docx-adapter-doc",
      meta: { title: "DOCX Adapter" },
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
          body: textBlock("body", "DOCX adapter text"),
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

describe("vNext DOCX renderer adapter boundary", () => {
  it("adapts measured render commands into a DOCX assembly plan without rendering bytes", () => {
    const pagination = paginateVNextDocument(simpleDoc())
    const consumption = buildVNextMeasuredRendererConsumption(pagination)
    const plan = createVNextDocxRendererAdapterPlan(consumption)

    expect(plan).toMatchObject({
      source: VNEXT_DOCX_RENDERER_ADAPTER_SOURCE,
      mode: VNEXT_DOCX_RENDERER_ADAPTER_MODE,
      status: "ready",
      rendererContract: {
        consumes: "measured-render-commands",
        mayRelayout: false,
        requiresAuthoredDocumentForLayout: false,
        mayUseSourceDocumentForStructure: false,
        output: "docx",
      },
      artifact: {
        kind: "docx",
        status: "not-rendered",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        bytes: null,
        storageId: null,
      },
      pageCount: consumption.pageCount,
      blockingIssues: [],
      warningIssues: [],
    })
    expect(plan.assemblyCommands).toHaveLength(consumption.commandCount)
    expect(plan.assemblyCommands.some((command) => command.operation === "paragraph")).toBe(true)
    expect(plan.summary).toMatchObject({
      inputCommandCount: consumption.commandCount,
      assemblyCommandCount: consumption.commandCount,
      blockingIssueCount: 0,
      warningIssueCount: 0,
    })
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks DOCX assembly commands when renderer consumption is blocked", () => {
    const plan = createVNextDocxRendererAdapterPlan(blockedConsumption())

    expect(plan).toMatchObject({
      status: "blocked",
      assemblyCommands: [],
      artifact: {
        kind: "docx",
        status: "not-rendered",
        bytes: null,
        storageId: null,
      },
      summary: {
        inputCommandCount: 1,
        assemblyCommandCount: 0,
        blockingIssueCount: 1,
      },
    })
    expect(plan.blockingIssues).toEqual([expect.objectContaining({
      code: "table-fragment-missing-metadata",
      nodeId: "broken-table-cell",
    })])
  })

  it("keeps the DOCX adapter independent from concrete renderers, authored documents, DOM, and layout", () => {
    const sourceUrl = new URL("../src/renderer/docxAdapter.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("VNextMeasuredRendererConsumption")
    expect(source).toContain('status: "not-rendered"')
    expect(source).toContain("mayRelayout: false")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/officegen|pizzip|mammoth|canvas|puppeteer|playwright/)
    expect(source).not.toContain('from "docx"')
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

  it("documents the DOCX renderer adapter boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/DOCX_RENDERER_ADAPTER_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 94 implementation boundary.")
    expect(boundaryDoc).toContain("src/renderer/docxAdapter.ts")
    expect(boundaryDoc).toContain("This is a DOCX renderer adapter boundary.")
    expect(boundaryDoc).toContain("It is not a concrete DOCX renderer.")
    expect(boundaryDoc).toContain("artifact.status = `not-rendered`")
    expect(readme).toContain("DOCX renderer adapter boundary")
    expect(readme).toContain("docs/DOCX_RENDERER_ADAPTER_BOUNDARY.md")
    expect(ledger).toContain("| 94 | DOCX renderer adapter boundary | done |")
    expect(roadmap).toContain("## Phase 94: DOCX Renderer Adapter Boundary")
  })
})
