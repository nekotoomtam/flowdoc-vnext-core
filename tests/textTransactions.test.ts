import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode, InlineNode, TextBlockNode } from "../src/schema/document.js"
import {
  projectVNextTextBlockInlines,
  runVNextOperation,
  runVNextTextTransaction,
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
      id: "text-transaction-doc",
      meta: { title: "Text Transaction Test" },
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

function textTransactionDoc(children: string | InlineNode[]): DocumentNode {
  return docWithNodes({ body: textBlock("body", children) }, ["body"])
}

function textBlockFrom(document: DocumentNode, id = "body"): TextBlockNode {
  const node = document.document.sections[0].nodes[id]
  expect(node.type).toBe("text-block")
  if (node.type !== "text-block") throw new Error("expected text-block")
  return node
}

function projectedText(document: DocumentNode): string {
  return projectVNextTextBlockInlines(textBlockFrom(document)).text
}

describe("vNext text transactions", () => {
  it("projects text-block inline children into stable model offsets", () => {
    const block = textBlock("body", [
      { id: "body-a", type: "text", text: "Hello " },
      { id: "body-field", type: "field-ref", key: "customer.name" },
      { id: "body-break", type: "line-break" },
      { id: "body-b", type: "text", text: "Total" },
    ])

    const projection = projectVNextTextBlockInlines(block)

    expect(projection.text).toBe(`Hello ${VNEXT_ATOMIC_INLINE_TEXT}\nTotal`)
    expect(projection.textLength).toBe(13)
    expect(projection.segments.map((segment) => ({
      id: segment.inlineId,
      type: segment.inlineType,
      start: segment.startOffset,
      end: segment.endOffset,
      editable: segment.editable,
    }))).toEqual([
      { id: "body-a", type: "text", start: 0, end: 6, editable: true },
      { id: "body-field", type: "field-ref", start: 6, end: 7, editable: false },
      { id: "body-break", type: "line-break", start: 7, end: 8, editable: false },
      { id: "body-b", type: "text", start: 8, end: 13, editable: true },
    ])
  })

  it("inserts and deletes text in a plain text block with text-block dirty scope", () => {
    const doc = textTransactionDoc("Hello world")

    const insertResult = runVNextTextTransaction(doc, {
      kind: "text.insert",
      position: { textBlockId: "body", offset: 5 },
      text: ",",
      inlineId: "body-comma",
    })

    expect(insertResult.ok).toBe(true)
    if (!insertResult.ok) throw new Error(insertResult.issues.map((issue) => issue.message).join("\n"))
    expect(projectedText(insertResult.document)).toBe("Hello, world")
    expect(insertResult.transaction).toMatchObject({
      kind: "text.insert",
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
        mergeKey: "text-block:body",
        coalesce: "typing-session",
      },
    })

    const deleteResult = runVNextTextTransaction(insertResult.document, {
      kind: "text.delete",
      range: { textBlockId: "body", anchorOffset: 5, focusOffset: 6 },
    })

    expect(deleteResult.ok).toBe(true)
    if (!deleteResult.ok) throw new Error(deleteResult.issues.map((issue) => issue.message).join("\n"))
    expect(projectedText(deleteResult.document)).toBe("Hello world")
  })

  it("replaces a selected text range without replacing the whole block as a command", () => {
    const doc = textTransactionDoc("Hello world")

    const result = runVNextTextTransaction(doc, {
      kind: "text.range.replace",
      range: { textBlockId: "body", anchorOffset: 6, focusOffset: 11 },
      text: "FlowDoc",
      inlineId: "body-replacement",
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.issues.map((issue) => issue.message).join("\n"))
    expect(projectedText(result.document)).toBe("Hello FlowDoc")
    expect(result.command.kind).toBe("text.range.replace")
    expect(result.transaction.historyIntent).toMatchObject({
      coalesce: "single-entry",
      summary: "replace text range in body",
    })
  })

  it("inserts field references as atomic inline nodes", () => {
    const doc = textTransactionDoc("Hello world")

    const result = runVNextTextTransaction(doc, {
      kind: "inline.field-ref.insert",
      position: { textBlockId: "body", offset: 6 },
      fieldRef: { id: "body-customer", type: "field-ref", key: "customer.name", label: "Customer" },
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.issues.map((issue) => issue.message).join("\n"))

    const body = textBlockFrom(result.document)
    expect(body.children.map((child) => child.type)).toEqual(["text", "field-ref", "text"])
    expect(projectVNextTextBlockInlines(body)).toMatchObject({
      text: `Hello ${VNEXT_ATOMIC_INLINE_TEXT}world`,
      segments: [
        { inlineId: "body-text", startOffset: 0, endOffset: 6, editable: true },
        { inlineId: "body-customer", startOffset: 6, endOffset: 7, editable: false },
        { startOffset: 7, endOffset: 12, editable: true },
      ],
    })
  })

  it("rejects plain text edits that would edit inside a field reference", () => {
    const doc = textTransactionDoc([
      { id: "body-a", type: "text", text: "Hello " },
      { id: "body-customer", type: "field-ref", key: "customer.name" },
      { id: "body-b", type: "text", text: "!" },
    ])

    const result = runVNextTextTransaction(doc, {
      kind: "text.range.replace",
      range: { textBlockId: "body", anchorOffset: 6, focusOffset: 7 },
      text: "Customer",
    })

    expect(result).toMatchObject({
      ok: false,
      reason: "invalid-command",
      issues: [{ code: "atomic-inline-range", textBlockId: "body", inlineId: "body-customer" }],
    })
    expect(result.document).toBe(doc)
  })

  it("keeps the existing coarse text-block replace operation available", () => {
    const doc = textTransactionDoc("Old")

    const result = runVNextOperation(doc, {
      kind: "text-block.text.replace",
      nodeId: "body",
      children: [{ id: "body-new", type: "text", text: "New" }],
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.issues.map((issue) => issue.message).join("\n"))
    expect(projectedText(result.document)).toBe("New")
    expect(result.operation).toMatchObject({
      kind: "text-block.text.replace",
      historyPolicy: { durableIntent: "content" },
      renderInvalidation: { lane: "text-content" },
    })
  })

  it("keeps text transactions independent from DOM, parent runtime, and layout execution", () => {
    const sourceUrl = new URL("../src/authoring/textTransactions.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/\bReact\b/)
    expect(source).not.toMatch(/\bdocument\.querySelector\b/)
    expect(source).not.toMatch(/\bdocument\.createElement\b/)
    expect(source).not.toMatch(/\bHTMLElement\b/)
    expect(source).not.toMatch(/\bwindow\./)
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("runVNextLayoutPipeline")
  })
})
