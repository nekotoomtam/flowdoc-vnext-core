import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode } from "../src/schema/document.js"
import type { VNextMeasuredPagination } from "../src/index.js"
import {
  paginateVNextDocument,
  resolveVNextFinalPageReferences,
  VNEXT_FINAL_PAGE_RESOLUTION_MODE,
  VNEXT_FINAL_PAGE_RESOLUTION_SOURCE,
} from "../src/index.js"

function pt(value: number) {
  return { value, unit: "pt" as const }
}

function heading(id: string, text: string, level: 1 | 2 = 1): AuthoredNode {
  return {
    id,
    type: "text-block",
    role: { role: "heading", level },
    props: {},
    children: [{ id: `${id}-text`, type: "text", text }],
  }
}

function paragraph(id: string, text: string): AuthoredNode {
  return {
    id,
    type: "text-block",
    role: { role: "paragraph" },
    props: {},
    children: [{ id: `${id}-text`, type: "text", text }],
  }
}

function tocDoc(): DocumentNode {
  return {
    version: 3,
    document: {
      id: "page-resolution-doc",
      meta: { title: "Page Resolution" },
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
          pageNumberStart: 3,
        },
        zoneIds: ["body-zone", "footer-zone"],
        nodes: {
          "body-zone": {
            id: "body-zone",
            type: "zone",
            role: "body",
            childIds: ["toc", "intro-heading", "intro-copy", "break", "details-heading", "details-copy"],
          },
          "footer-zone": { id: "footer-zone", type: "zone", role: "footer", childIds: ["footer"] },
          toc: { id: "toc", type: "toc", props: { title: "Contents", maxLevel: 2 } },
          "intro-heading": heading("intro-heading", "Intro", 1),
          "intro-copy": paragraph("intro-copy", "Short copy"),
          break: { id: "break", type: "page-break", props: {} },
          "details-heading": heading("details-heading", "Details", 2),
          "details-copy": paragraph("details-copy", "More copy"),
          footer: {
            id: "footer",
            type: "text-block",
            role: { role: "paragraph" },
            props: {},
            children: [
              { id: "footer-label", type: "text", text: "Page " },
              { id: "footer-page", type: "page-number" },
            ],
          },
        },
      }],
    },
  }
}

describe("vNext final TOC/page resolution boundary", () => {
  it("resolves TOC heading page references from measured pagination without relayout", () => {
    const doc = tocDoc()
    const pagination = paginateVNextDocument(doc)
    const plan = resolveVNextFinalPageReferences(doc, pagination)

    expect(plan).toMatchObject({
      source: VNEXT_FINAL_PAGE_RESOLUTION_SOURCE,
      mode: VNEXT_FINAL_PAGE_RESOLUTION_MODE,
      status: "resolved",
      documentId: "page-resolution-doc",
      paginationDocumentId: "page-resolution-doc",
      resolutionContract: {
        consumes: "document-v3-and-measured-pagination",
        produces: "toc-page-reference-resolution",
        mayRelayoutDocument: false,
        mutatesDocument: false,
        mutatesMeasuredPagination: false,
        writesArtifacts: false,
      },
      pageNumberInlineResolution: {
        status: "already-resolved-in-measured-pagination",
        pageCount: 2,
        firstPageNumber: 3,
        lastPageNumber: 4,
      },
      tocCount: 1,
      headingCount: 2,
      resolvedHeadingCount: 2,
      blockingIssues: [],
      warningIssues: [],
    })
    expect(plan.entries.map((entry) => [entry.headingNodeId, entry.headingText, entry.level, entry.pageNumber])).toEqual([
      ["intro-heading", "Intro", 1, 3],
      ["details-heading", "Details", 2, 4],
    ])
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks final page reference resolution when document and pagination ids differ", () => {
    const doc = tocDoc()
    const pagination: VNextMeasuredPagination = {
      ...paginateVNextDocument(doc),
      documentId: "other-doc",
    }
    const plan = resolveVNextFinalPageReferences(doc, pagination)

    expect(plan).toMatchObject({
      status: "blocked",
      documentId: "page-resolution-doc",
      paginationDocumentId: "other-doc",
      entries: [],
      blockingIssues: [{
        severity: "blocking",
        code: "document-id-mismatch",
      }],
    })
  })

  it("keeps the final page resolution boundary independent from concrete pagination, renderers, DOM, storage, and mutation", () => {
    const sourceUrl = new URL("../src/pagination/pageResolution.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("VNextMeasuredPagination")
    expect(source).toContain("mayRelayoutDocument: false")
    expect(source).toContain("mutatesMeasuredPagination: false")
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

  it("documents the final TOC/page resolution boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/FINAL_TOC_PAGE_RESOLUTION_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 98 implementation boundary.")
    expect(boundaryDoc).toContain("src/pagination/pageResolution.ts")
    expect(boundaryDoc).toContain("This is a final TOC/page resolution boundary.")
    expect(boundaryDoc).toContain("It is not a pagination or renderer execution engine.")
    expect(boundaryDoc).toContain("mutatesMeasuredPagination = `false`")
    expect(readme).toContain("Final TOC/page resolution boundary")
    expect(readme).toContain("docs/FINAL_TOC_PAGE_RESOLUTION_BOUNDARY.md")
    expect(ledger).toContain("| 98 | Final TOC / page resolution boundary | done |")
    expect(roadmap).toContain("## Phase 98: Final TOC / Page Resolution Boundary")
  })
})
