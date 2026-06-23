import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode, InlineNode, TextBlockNode } from "../src/schema/document.js"
import {
  createVNextRichInlineCommitHistoryRecord,
  projectVNextTextBlockInlines,
  runVNextRichInlineCommit,
  VNEXT_ATOMIC_INLINE_TEXT,
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

function docWithNodes(nodes: Record<string, AuthoredNode>, bodyChildIds: string[]): DocumentNode {
  return {
    version: 3,
    document: {
      id: "rich-inline-commit-doc",
      meta: { title: "Rich Inline Commit Test" },
      sections: [{
        id: "section-main",
        type: "section",
        page: {
          size: "A4",
          orientation: "portrait",
          margin: { top: pt(72), right: pt(72), bottom: pt(72), left: pt(72) },
        },
        zoneIds: ["body-zone"],
        nodes: {
          "body-zone": { id: "body-zone", type: "zone", role: "body", childIds: bodyChildIds },
          ...nodes,
        },
      }],
    },
  }
}

function richInlineDoc(children: string | InlineNode[]): DocumentNode {
  return docWithNodes({ body: textBlock("body", children) }, ["body"])
}

function textBlockFrom(document: DocumentNode, id = "body"): TextBlockNode {
  const node = document.document.sections[0].nodes[id]
  expect(node.type).toBe("text-block")
  if (node.type !== "text-block") throw new Error("expected text-block")
  return node
}

describe("vNext rich inline commit", () => {
  it("replaces text-block inline children with history-ready rich inline facts", () => {
    const doc = richInlineDoc("Hello world")
    const result = runVNextRichInlineCommit(doc, {
      kind: "text-block.rich-inline.replace",
      source: "user",
      textBlockId: "body",
      children: [
        { id: "body-rich-text-1", type: "text", text: "Hello", style: { fontWeight: "bold" } },
        { id: "body-rich-field-2", type: "field-ref", key: "customer.name", label: "Customer", fallback: "{{customer.name}}" },
        { id: "body-rich-text-3", type: "text", text: " world" },
      ],
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.issues.map((issue) => issue.message).join("\n"))

    const body = textBlockFrom(result.document)
    expect(body.children).toEqual([
      { id: "body-rich-text-1", type: "text", text: "Hello", style: { fontWeight: "bold" } },
      { id: "body-rich-field-2", type: "field-ref", key: "customer.name", label: "Customer", fallback: "{{customer.name}}" },
      { id: "body-rich-text-3", type: "text", text: " world" },
    ])
    expect(projectVNextTextBlockInlines(body).text).toBe(`Hello${VNEXT_ATOMIC_INLINE_TEXT} world`)
    expect(result.transaction).toMatchObject({
      kind: "text-block.rich-inline.replace",
      source: "user",
      targetTextBlockId: "body",
      dirtyScope: {
        kind: "text-block",
        sectionId: "section-main",
        zoneId: "body-zone",
        textBlockId: "body",
        parentNodeIds: ["body-zone"],
      },
      historyIntent: {
        kind: "text-edit",
        durableIntent: "content",
        mergeKey: "rich-inline:body",
        coalesce: "single-entry",
        summary: "commit rich inline replacement in body",
      },
      keyHistory: {
        fieldKeys: ["customer.name"],
        status: "field-ref-usage-recorded",
      },
      renderInvalidation: {
        exactGenerationStale: true,
        lane: "text-content",
      },
    })

    const historyRecord = createVNextRichInlineCommitHistoryRecord(result)
    expect(historyRecord).toMatchObject({
      status: "committed",
      historyAction: "undoable",
      commandKind: "text-block.rich-inline.replace",
      targetTextBlockId: "body",
      dirtyScopes: [{ textBlockId: "body" }],
      mergeKey: "rich-inline:body",
      summary: "commit rich inline replacement in body",
    })
  })

  it("rejects invalid rich inline replacement commands without mutating the document", () => {
    const doc = richInlineDoc("Hello world")
    const duplicate = runVNextRichInlineCommit(doc, {
      kind: "text-block.rich-inline.replace",
      textBlockId: "body",
      children: [
        { id: "dup", type: "text", text: "A" },
        { id: "dup", type: "field-ref", key: "customer.name" },
      ],
    })

    expect(duplicate).toMatchObject({
      ok: false,
      reason: "invalid-command",
      issues: [{ code: "duplicate-inline-id", textBlockId: "body", inlineId: "dup" }],
    })
    expect(duplicate.document).toBe(doc)

    const unsupportedTarget = runVNextRichInlineCommit(docWithNodes({}, []), {
      kind: "text-block.rich-inline.replace",
      textBlockId: "body-zone",
      children: [],
    })

    expect(unsupportedTarget).toMatchObject({
      ok: false,
      reason: "unsupported-target",
      issues: [{ code: "not-text-block", textBlockId: "body-zone" }],
    })
  })

  it("keeps rich inline commit independent from DOM, parent runtime, persistence, and rendering", () => {
    const sourceUrl = new URL("../src/authoring/richInlineCommit.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/\bReact\b/)
    expect(source).not.toMatch(/\bdocument\.querySelector\b/)
    expect(source).not.toMatch(/\bdocument\.createElement\b/)
    expect(source).not.toMatch(/\bHTMLElement\b/)
    expect(source).not.toMatch(/\bwindow\./)
    expect(source).not.toContain("serializeFlowDocPackageV2DocumentVNext")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("runVNextLayoutPipeline")
  })
})
