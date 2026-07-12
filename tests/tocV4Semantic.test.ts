import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  collectVNextTocV4Semantics,
  type DocumentNodeV4Target,
} from "../src/index.js"

function page() {
  return {
    size: "A4" as const,
    orientation: "portrait" as const,
    margin: {
      top: { value: 40, unit: "pt" as const }, right: { value: 40, unit: "pt" as const },
      bottom: { value: 40, unit: "pt" as const }, left: { value: 40, unit: "pt" as const },
    },
  }
}

function heading(id: string, level: 1 | 2 | 3, children: any[]) {
  return { id, type: "text-block" as const, role: { role: "heading" as const, level }, props: {}, children }
}

function fixture(): DocumentNodeV4Target {
  return {
    version: 4,
    document: {
      id: "toc-v4",
      sections: [{
        id: "main", type: "section", page: page(), zoneIds: ["header", "body"],
        nodes: {
          header: { id: "header", type: "zone", role: "header", childIds: ["header-heading"] },
          "header-heading": heading("header-heading", 1, [{ id: "header-text", type: "text", text: "Header" }]),
          body: { id: "body", type: "zone", role: "body", childIds: ["toc-short", "intro", "columns", "deep", "toc-all"] },
          "toc-short": { id: "toc-short", type: "toc", props: { title: "Summary", maxLevel: 2 } },
          intro: heading("intro", 1, [{ id: "intro-text", type: "text", text: "Introduction" }]),
          columns: { id: "columns", type: "columns", props: {}, columnIds: ["left", "right"] },
          left: { id: "left", type: "column", props: { widthShare: 50 }, childIds: ["details"] },
          details: heading("details", 2, [{ id: "details-text", type: "text", text: "Details" }]),
          right: { id: "right", type: "column", props: { widthShare: 50 }, childIds: ["customer"] },
          customer: heading("customer", 1, [
            { id: "customer-label", type: "text", text: "Customer " },
            { id: "customer-field", type: "field-ref", key: "customer.name", label: "name" },
            { id: "customer-break", type: "line-break" },
            { id: "customer-tail", type: "text", text: "overview" },
          ]),
          deep: heading("deep", 3, [{ id: "deep-text", type: "text", text: "Deep" }]),
          "toc-all": { id: "toc-all", type: "toc", props: {} },
        },
      }, {
        id: "appendix", type: "section", page: page(), zoneIds: ["appendix-body"],
        nodes: {
          "appendix-body": { id: "appendix-body", type: "zone", role: "body", childIds: ["appendix-heading"] },
          "appendix-heading": heading("appendix-heading", 2, [{ id: "appendix-text", type: "text", text: "Appendix" }]),
        },
      }],
    },
  }
}

describe("TOC v4 semantic collection", () => {
  it("collects body headings in structural order with per-TOC filters and composite identity", () => {
    const document = fixture()
    const before = JSON.stringify(document)
    const first = collectVNextTocV4Semantics(document)
    const second = collectVNextTocV4Semantics(document)

    expect(first.status).toBe("ready")
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
    if (first.status === "blocked") throw new Error(first.issues.map((item) => item.message).join("\n"))
    expect(first.summary).toEqual({
      tocCount: 2, headingSourceCount: 5, entryCount: 9,
      fieldDependencyCount: 1, warningCount: 0,
    })
    expect(first.tocs[0]).toMatchObject({ tocNodeId: "toc-short", title: "Summary", maxLevel: 2 })
    expect(first.tocs[0].entries.map((entry) => entry.headingNodeId)).toEqual([
      "intro", "details", "customer", "appendix-heading",
    ])
    expect(first.tocs[1].entries.map((entry) => entry.headingNodeId)).toEqual([
      "intro", "details", "customer", "deep", "appendix-heading",
    ])
    expect(first.tocs[0].entries[2]).toMatchObject({
      identity: { tocNodeId: "toc-short", headingNodeId: "customer" },
      sourceOrdinal: 2,
      tocOrdinal: 2,
      label: {
        kind: "authored-preview", text: "Customer name overview",
        fieldKeys: ["customer.name"], materialization: "pending",
      },
      pageReference: { status: "pending", pageIndex: null, pageNumber: null },
    })
    expect(first.tocs[0].entries.some((entry) => entry.headingNodeId === "header-heading")).toBe(false)
    expect(first.contracts).toMatchObject({
      documentMutation: false, fieldValueResolution: "not-run",
      measurement: "not-run", pagination: "not-run", rendering: "not-run",
      persistence: "not-run", editorStateMutation: false,
    })
    expect(JSON.stringify(document)).toBe(before)
  })

  it("retains empty heading identity as a partial warning instead of omitting it", () => {
    const document = fixture()
    const body = document.document.sections[0].nodes.body
    const empty = heading("empty", 1, [{
      id: "empty-image", type: "inline-image",
      source: { kind: "asset-ref", assetId: "image-1" },
      accessibility: { kind: "decorative" },
      frame: { width: { value: 10, unit: "pt" }, height: { value: 10, unit: "pt" }, fit: "contain" },
      verticalAlign: "baseline",
    }])
    if (body.type !== "zone") throw new Error("body fixture missing")
    body.childIds.splice(1, 0, "empty")
    document.document.sections[0].nodes.empty = empty
    const result = collectVNextTocV4Semantics(document)

    expect(result).toMatchObject({
      status: "partial",
      summary: { headingSourceCount: 6, entryCount: 11, warningCount: 2 },
      issues: [
        expect.objectContaining({ code: "heading-label-empty", tocNodeId: "toc-short", headingNodeId: "empty" }),
        expect.objectContaining({ code: "heading-label-empty", tocNodeId: "toc-all", headingNodeId: "empty" }),
      ],
    })
  })

  it("blocks invalid structure and TOC placement outside a body zone", () => {
    const invalid = fixture()
    const body = invalid.document.sections[0].nodes.body
    if (body.type !== "zone") throw new Error("body fixture missing")
    body.childIds.push("missing")
    expect(collectVNextTocV4Semantics(invalid)).toMatchObject({
      status: "blocked", tocs: [],
      issues: [expect.objectContaining({ code: "document-structure-invalid" })],
    })

    const misplaced = fixture()
    const header = misplaced.document.sections[0].nodes.header
    if (header.type !== "zone") throw new Error("header fixture missing")
    header.childIds.push("header-toc")
    misplaced.document.sections[0].nodes["header-toc"] = { id: "header-toc", type: "toc", props: {} }
    expect(collectVNextTocV4Semantics(misplaced)).toMatchObject({
      status: "blocked", documentId: "toc-v4", tocs: [],
      issues: [expect.objectContaining({ code: "toc-outside-body-zone", tocNodeId: "header-toc" })],
    })
  })

  it("keeps semantic collection independent from layout, rendering, transport, and editor state", () => {
    const source = readFileSync(new URL("../src/toc/tocV4Semantic.ts", import.meta.url), "utf8")
    expect(source).toContain("validateVNextDocumentV4Structure")
    expect(source).not.toMatch(/from "\.\.\/pagination\//)
    expect(source).not.toMatch(/from "\.\.\/renderer\//)
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toContain("HTMLElement")
    expect(source).not.toContain("window.")
    expect(source).not.toContain("/api/")
  })
})
