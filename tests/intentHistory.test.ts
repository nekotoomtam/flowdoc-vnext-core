import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { AuthoredNode, DocumentNode, InlineNode, TextBlockNode } from "../src/schema/document.js"
import type { VNextAuthoringIntentHistoryRecord } from "../src/index.js"
import {
  appendVNextAuthoringIntentHistoryRecord,
  appendVNextAuthoringIntentHistoryResult,
  createVNextAuthoringIntentHistoryRecord,
  createVNextSelectionOnlyAuthoringHistoryRecord,
  groupVNextAuthoringIntentHistory,
  projectVNextTextBlockInlines,
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

function docWithNodes(nodes: Record<string, AuthoredNode>, bodyChildIds: string[]): DocumentNode {
  return {
    version: 3,
    document: {
      id: "intent-history-doc",
      meta: { title: "Intent History Test" },
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

function intentHistoryDoc(children: string | InlineNode[]): DocumentNode {
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

describe("vNext authoring intent history", () => {
  it("coalesces repeated text inserts into one typing group", () => {
    let doc = intentHistoryDoc("")
    let records: VNextAuthoringIntentHistoryRecord[] = []

    const first = runVNextTextTransaction(doc, {
      kind: "text.insert",
      position: { textBlockId: "body", offset: 0 },
      text: "A",
      inlineId: "body-a",
    })
    expect(first.ok).toBe(true)
    if (!first.ok) throw new Error(first.issues.map((issue) => issue.message).join("\n"))
    records = appendVNextAuthoringIntentHistoryResult(records, first)
    doc = first.document

    const second = runVNextTextTransaction(doc, {
      kind: "text.insert",
      position: { textBlockId: "body", offset: 1 },
      text: "B",
      inlineId: "body-b",
    })
    expect(second.ok).toBe(true)
    if (!second.ok) throw new Error(second.issues.map((issue) => issue.message).join("\n"))
    records = appendVNextAuthoringIntentHistoryResult(records, second)
    doc = second.document

    const third = runVNextTextTransaction(doc, {
      kind: "text.insert",
      position: { textBlockId: "body", offset: 2 },
      text: "C",
      inlineId: "body-c",
    })
    expect(third.ok).toBe(true)
    if (!third.ok) throw new Error(third.issues.map((issue) => issue.message).join("\n"))
    records = appendVNextAuthoringIntentHistoryResult(records, third)

    expect(projectedText(third.document)).toBe("ABC")
    expect(records).toHaveLength(3)
    expect(records.map((record) => record.groupId)).toEqual([
      "authoring-group-1",
      "authoring-group-1",
      "authoring-group-1",
    ])
    expect(records.map((record) => record.sequence)).toEqual([1, 2, 3])
    expect(records.every((record) => record.coalescing.kind === "typing-session")).toBe(true)
    expect(groupVNextAuthoringIntentHistory(records)).toEqual([{
      groupId: "authoring-group-1",
      status: "committed",
      historyAction: "undoable",
      inputKind: "typing",
      commandKinds: ["text.insert"],
      targetTextBlockIds: ["body"],
      recordCount: 3,
      summary: "insert text into body",
    }])
  })

  it("keeps paste as one non-coalescing group", () => {
    const doc = intentHistoryDoc("Hello ")
    const paste = runVNextTextTransaction(doc, {
      kind: "text.insert",
      position: { textBlockId: "body", offset: 6 },
      text: "FlowDoc",
      inlineId: "body-paste",
    })

    expect(paste.ok).toBe(true)
    if (!paste.ok) throw new Error(paste.issues.map((issue) => issue.message).join("\n"))

    const record = createVNextAuthoringIntentHistoryRecord(paste, { inputKind: "paste" })
    const records = appendVNextAuthoringIntentHistoryRecord([], record)

    expect(projectedText(paste.document)).toBe("Hello FlowDoc")
    expect(records).toMatchObject([{
      status: "committed",
      historyAction: "undoable",
      groupId: "authoring-group-1",
      inputKind: "paste",
      commandKind: "text.insert",
      coalescing: { kind: "single-entry", mergeKey: "text-block:body" },
      summary: "paste text into body",
    }])
    expect(groupVNextAuthoringIntentHistory(records)[0]).toMatchObject({
      groupId: "authoring-group-1",
      recordCount: 1,
      inputKind: "paste",
    })
  })

  it("creates one group for field-reference insert commands", () => {
    const doc = intentHistoryDoc("Hello ")
    const result = runVNextTextTransaction(doc, {
      kind: "inline.field-ref.insert",
      position: { textBlockId: "body", offset: 6 },
      fieldRef: { id: "body-field", type: "field-ref", key: "customer.name", label: "Customer" },
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.issues.map((issue) => issue.message).join("\n"))

    const records = appendVNextAuthoringIntentHistoryResult([], result)

    expect(records).toMatchObject([{
      status: "committed",
      historyAction: "undoable",
      groupId: "authoring-group-1",
      inputKind: "command",
      commandKind: "inline.field-ref.insert",
      coalescing: { kind: "single-entry", mergeKey: "text-block:body" },
      dirtyScopes: [{ kind: "text-block", textBlockId: "body", parentNodeIds: ["body-zone"] }],
    }])
    expect(groupVNextAuthoringIntentHistory(records)).toMatchObject([{
      groupId: "authoring-group-1",
      commandKinds: ["inline.field-ref.insert"],
      recordCount: 1,
    }])
  })

  it("marks selection-only changes as non-durable and excludes them from durable history", () => {
    const record = createVNextSelectionOnlyAuthoringHistoryRecord({
      before: { kind: "none" },
      after: { kind: "text", textBlockId: "body", anchorOffset: 0, focusOffset: 3 },
    })
    const records = appendVNextAuthoringIntentHistoryRecord([], record)

    expect(record).toMatchObject({
      status: "non-durable",
      historyAction: "non-durable",
      groupId: null,
      commandKind: "selection.change",
      dirtyScopes: [],
      selection: {
        before: { kind: "none" },
        after: { kind: "text", textBlockId: "body", anchorOffset: 0, focusOffset: 3 },
      },
    })
    expect(records).toEqual([])
  })

  it("records rejected transaction diagnostics without mutating the document", () => {
    const doc = intentHistoryDoc([
      { id: "body-a", type: "text", text: "Hello " },
      { id: "body-field", type: "field-ref", key: "customer.name" },
      { id: "body-b", type: "text", text: "!" },
    ])
    const before = JSON.stringify(doc)

    const rejected = runVNextTextTransaction(doc, {
      kind: "text.range.replace",
      range: { textBlockId: "body", anchorOffset: 6, focusOffset: 7 },
      text: "Customer",
    })

    expect(rejected.ok).toBe(false)
    if (rejected.ok) throw new Error("expected rejected transaction")

    const records = appendVNextAuthoringIntentHistoryResult([], rejected)

    expect(JSON.stringify(doc)).toBe(before)
    expect(rejected.document).toBe(doc)
    expect(records).toMatchObject([{
      status: "rejected",
      historyAction: "diagnostic-only",
      groupId: "authoring-group-1",
      commandKind: "text.range.replace",
      targetTextBlockId: "body",
      failureReason: "invalid-command",
      issues: [{ code: "atomic-inline-range", textBlockId: "body", inlineId: "body-field" }],
      coalescing: { kind: "none", mergeKey: null },
    }])
  })

  it("keeps intent history independent from DOM, parent runtime, and layout execution", () => {
    const sourceUrl = new URL("../src/authoring/intentHistory.ts", import.meta.url)
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
