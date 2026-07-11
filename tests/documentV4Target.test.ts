import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  DocumentNodeSchema,
  DocumentNodeV4TargetSchema,
  VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES,
  VNEXT_DOCUMENT_V4_TARGET_SOURCE,
  validateVNextDocumentV4Structure,
  type DocumentNodeV4Target,
} from "../src/index.js"

function mm(value: number) {
  return { value, unit: "mm" as const }
}

function frame() {
  return { width: mm(40), height: mm(20), fit: "contain" as const }
}

function textBlock(id: string, text: string) {
  return {
    id,
    type: "text-block" as const,
    role: { role: "paragraph" as const },
    props: {},
    children: [{ id: `${id}-text`, type: "text" as const, text }],
  }
}

function image(id: string) {
  return {
    id,
    type: "image" as const,
    source: { kind: "asset-ref" as const, assetId: "asset-logo" },
    accessibility: { kind: "described" as const, altText: "Customer logo" },
    props: { frame: frame(), align: "center" as const },
  }
}

function validDocument(): DocumentNodeV4Target {
  return DocumentNodeV4TargetSchema.parse({
    version: 4,
    document: {
      id: "doc-v4",
      meta: { title: "Document v4" },
      sections: [{
        id: "section-main",
        type: "section",
        page: {
          size: "A4",
          orientation: "portrait",
          margin: { top: mm(20), right: mm(20), bottom: mm(20), left: mm(20) },
        },
        zoneIds: ["body-zone", "header-zone"],
        nodes: {
          "body-zone": {
            id: "body-zone",
            type: "zone",
            role: "body",
            childIds: ["body-text", "body-image", "columns", "table", "body-break"],
          },
          "header-zone": {
            id: "header-zone",
            type: "zone",
            role: "header",
            childIds: ["header-text"],
          },
          "body-text": {
            ...textBlock("body-text", "Customer "),
            children: [
              { id: "body-text-run", type: "text", text: "Customer " },
              {
                id: "body-inline-logo",
                type: "inline-image",
                source: { kind: "asset-ref", assetId: "asset-logo" },
                accessibility: { kind: "described", altText: "Customer logo" },
                frame: { width: mm(12), height: mm(6), fit: "contain" },
                verticalAlign: "baseline",
              },
            ],
          },
          "header-text": {
            ...textBlock("header-text", "Page "),
            children: [
              { id: "header-label", type: "text", text: "Page " },
              { id: "header-page", type: "page-number" },
            ],
          },
          "body-image": image("body-image"),
          columns: { id: "columns", type: "columns", props: {}, columnIds: ["left", "right"] },
          left: { id: "left", type: "column", props: { widthShare: 50 }, childIds: ["left-image"] },
          right: { id: "right", type: "column", props: { widthShare: 50 }, childIds: ["right-text"] },
          "left-image": image("left-image"),
          "right-text": textBlock("right-text", "Right column"),
          table: {
            id: "table",
            type: "table",
            props: {},
            columns: [{ width: mm(80) }],
            rowIds: ["row"],
          },
          row: { id: "row", type: "table-row", props: {}, cellIds: ["cell"] },
          cell: { id: "cell", type: "table-cell", props: {}, childIds: ["cell-image"] },
          "cell-image": image("cell-image"),
          "body-break": { id: "body-break", type: "page-break", props: {} },
        },
      }],
    },
  })
}

function cloneDocument(document: DocumentNodeV4Target): DocumentNodeV4Target {
  return JSON.parse(JSON.stringify(document)) as DocumentNodeV4Target
}

describe("Document v4 target schema and structure", () => {
  it("accepts the full authored union with block images in each block-flow parent", () => {
    const document = validDocument()
    const sourceBefore = JSON.stringify(document)
    const validation = validateVNextDocumentV4Structure(document)

    expect(validation).toMatchObject({
      source: VNEXT_DOCUMENT_V4_TARGET_SOURCE,
      version: 4,
      status: "valid",
      issues: [],
      summary: {
        sectionCount: 1,
        imageNodeCount: 3,
        inlineImageCount: 1,
        errorCount: 0,
      },
    })
    expect(JSON.stringify(document)).toBe(sourceBefore)
    expect(JSON.parse(JSON.stringify(validation))).toEqual(validation)
    expect(DocumentNodeSchema.safeParse(document).success).toBe(false)
  })

  it("locks v4 containment and retains nested columns without page breaks", () => {
    expect(VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES.zone).toContain("image")
    expect(VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES.zone).toContain("page-break")
    expect(VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES.column).toContain("image")
    expect(VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES.column).toContain("columns")
    expect(VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES.column).not.toContain("page-break")
    expect(VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES["table-cell"]).toContain("image")
    expect(VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES["table-cell"]).not.toContain("page-break")
    expect(VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES["table-cell"]).not.toContain("columns")
    expect(VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES.image).toEqual([])
  })

  it("blocks page breaks in columns, table cells, and static zones", () => {
    const document = cloneDocument(validDocument())
    const section = document.document.sections[0]
    section.nodes["column-break"] = { id: "column-break", type: "page-break", props: {} }
    section.nodes["cell-break"] = { id: "cell-break", type: "page-break", props: {} }
    section.nodes["header-break"] = { id: "header-break", type: "page-break", props: {} }
    const left = section.nodes.left
    const cell = section.nodes.cell
    const header = section.nodes["header-zone"]
    if (left.type !== "column" || cell.type !== "table-cell" || header.type !== "zone") throw new Error("fixture shape")
    left.childIds.push("column-break")
    cell.childIds.push("cell-break")
    header.childIds.push("header-break")

    const validation = validateVNextDocumentV4Structure(DocumentNodeV4TargetSchema.parse(document))

    expect(validation.status).toBe("blocked")
    expect(validation.issues.filter((item) => item.code === "page-break-outside-body-zone").map((item) => item.nodeId)).toEqual([
      "column-break",
      "cell-break",
      "header-break",
    ])
    expect(validation.issues.filter((item) => item.code === "invalid-child-type").map((item) => item.nodeId)).toEqual([
      "column-break",
      "cell-break",
    ])
  })

  it("blocks body page numbers and duplicate inline ids", () => {
    const document = cloneDocument(validDocument())
    const bodyText = document.document.sections[0].nodes["body-text"]
    if (bodyText.type !== "text-block") throw new Error("fixture shape")
    bodyText.children.push({ id: "body-text-run", type: "page-number" })

    const validation = validateVNextDocumentV4Structure(document)

    expect(validation.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "duplicate-inline-id", inlineId: "body-text-run" }),
      expect.objectContaining({ code: "page-number-in-body-zone", inlineId: "body-text-run" }),
    ]))
  })

  it("adds table grid and positive column-width invariants missing from the active graph", () => {
    const document = cloneDocument(validDocument())
    const table = document.document.sections[0].nodes.table
    if (table.type !== "table") throw new Error("fixture shape")
    table.columns.push({ width: mm(-10) })

    const validation = validateVNextDocumentV4Structure(DocumentNodeV4TargetSchema.parse(document))

    expect(validation.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "invalid-table-column-width", nodeId: "table" }),
      expect.objectContaining({ code: "invalid-table-grid", nodeId: "row", parentId: "table" }),
    ]))
  })

  it("blocks key/id drift, duplicate ids, cycles, multiple parents, and orphans", () => {
    const document = cloneDocument(validDocument())
    const section = document.document.sections[0]
    section.nodes.orphan = textBlock("different-id", "Orphan")
    const left = section.nodes.left
    if (left.type !== "column") throw new Error("fixture shape")
    left.childIds.push("columns")

    document.document.sections.push({
      ...cloneDocument(document).document.sections[0],
      id: "section-second",
      zoneIds: ["second-zone"],
      nodes: {
        "second-zone": { id: "second-zone", type: "zone", role: "body", childIds: ["image-copy"] },
        "image-copy": { ...image("body-image") },
      },
    })

    const validation = validateVNextDocumentV4Structure(DocumentNodeV4TargetSchema.parse(document))
    const codes = validation.issues.map((item) => item.code)

    expect(codes).toEqual(expect.arrayContaining([
      "node-key-id-mismatch",
      "duplicate-node-id",
      "multiple-parents",
      "cycle",
      "orphan-node",
    ]))
  })

  it("keeps full v4 target isolated and publishes phase navigation", () => {
    const activeDocument = readFileSync(new URL("../src/schema/document.ts", import.meta.url), "utf8")
    const activePackage = readFileSync(new URL("../src/persistence/package.ts", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(activeDocument).not.toContain("documentV4Target")
    expect(activePackage).not.toContain("DocumentNodeV4TargetSchema")
    expect(readme).toContain("docs/DOCUMENT_V4_TARGET_SCHEMA.md")
    expect(ledger).toContain("| 255 | Document v4 target schema and containment | done |")
    expect(ledger).toContain("## Phase 255 Document V4 Target Schema And Containment")
  })
})
