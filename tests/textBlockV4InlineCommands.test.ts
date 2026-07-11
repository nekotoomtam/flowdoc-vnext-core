import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  planVNextTextBlockV4InlineCommand,
  type FieldRegistryV1V3,
  type TextBlockNodeV4Target,
} from "../src/index.js"

const fields: FieldRegistryV1V3 = {
  version: 1,
  fields: {
    "customer.name": { key: "customer.name", label: "Customer Name", type: "text" },
    "customer.logo": { key: "customer.logo", label: "Customer Logo", type: "image" },
  },
}

function block(children: TextBlockNodeV4Target["children"]): TextBlockNodeV4Target {
  return { id: "body-text", type: "text-block", role: { role: "paragraph" }, props: {}, children }
}

function anchor(inlineId: string | null, offset: number) {
  return { textBlockId: "body-text", inlineId, offset, affinity: "forward" as const }
}

describe("text-block v4 inline command planning", () => {
  it("inserts a central field placement into a canonical empty block", () => {
    const textBlock = block([])
    const before = JSON.stringify(textBlock)
    const result = planVNextTextBlockV4InlineCommand(textBlock, {
      kind: "field-ref.insert",
      anchor: anchor(null, 0),
      inline: { id: "customer-name", type: "field-ref", key: "customer.name", label: "Customer" },
    }, { fieldContract: fields, zoneRole: "body" })

    expect(result).toMatchObject({
      status: "planned",
      children: [{ id: "customer-name", type: "field-ref", key: "customer.name" }],
      selectionAfter: { inlineId: "customer-name", offset: 1 },
      identity: {
        addedInlineIds: ["customer-name"], removedInlineIds: [], retainedInlineIds: [], split: null,
      },
      commitBoundary: {
        operationKind: "text-block.rich-inline.replace",
        policyPreflightRequired: true,
        historyCreated: false,
        documentMutation: false,
      },
    })
    expect(JSON.stringify(textBlock)).toBe(before)
  })

  it("splits text deterministically while retaining the left identity", () => {
    const textBlock = block([{ id: "sentence", type: "text", text: "Hello world", style: { fontStyle: "italic" } }])
    const result = planVNextTextBlockV4InlineCommand(textBlock, {
      kind: "field-ref.insert",
      anchor: anchor("sentence", 5),
      splitRightInlineId: "sentence-right",
      inline: { id: "customer-name", type: "field-ref", key: "customer.name" },
    }, { fieldContract: fields, zoneRole: "body" })

    expect(result.status).toBe("planned")
    if (result.status !== "planned") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.children).toEqual([
      { id: "sentence", type: "text", text: "Hello", style: { fontStyle: "italic" } },
      { id: "customer-name", type: "field-ref", key: "customer.name" },
      { id: "sentence-right", type: "text", text: " world", style: { fontStyle: "italic" } },
    ])
    expect(result.identity).toEqual({
      addedInlineIds: ["customer-name", "sentence-right"],
      removedInlineIds: [],
      retainedInlineIds: ["sentence"],
      split: { sourceInlineId: "sentence", leftInlineId: "sentence", rightInlineId: "sentence-right" },
    })
  })

  it("inserts at text and atomic boundaries without allocating a split id", () => {
    const textBlock = block([
      { id: "left", type: "text", text: "A" },
      { id: "field", type: "field-ref", key: "customer.name" },
    ])
    const afterText = planVNextTextBlockV4InlineCommand(textBlock, {
      kind: "line-break.insert", anchor: anchor("left", 1), inline: { id: "break", type: "line-break" },
    }, { fieldContract: fields, zoneRole: "body" })
    const afterAtomic = planVNextTextBlockV4InlineCommand(textBlock, {
      kind: "line-break.insert", anchor: anchor("field", 1), inline: { id: "break", type: "line-break" },
    }, { fieldContract: fields, zoneRole: "body" })

    expect(afterText.status === "planned" && afterText.children.map((item) => item.id)).toEqual([
      "left", "break", "field",
    ])
    expect(afterAtomic.status === "planned" && afterAtomic.children.map((item) => item.id)).toEqual([
      "left", "field", "break",
    ])
  })

  it("plans inline image and static-zone page-number insertion", () => {
    const textBlock = block([{ id: "label", type: "text", text: "Page " }])
    const image = planVNextTextBlockV4InlineCommand(textBlock, {
      kind: "inline-image.insert",
      anchor: anchor("label", 5),
      inline: {
        id: "logo",
        type: "inline-image",
        source: { kind: "asset-ref", assetId: "asset-logo" },
        accessibility: { kind: "decorative" },
        frame: { width: { value: 10, unit: "mm" }, height: { value: 5, unit: "mm" }, fit: "contain" },
        verticalAlign: "baseline",
      },
    }, { fieldContract: fields, zoneRole: "body" })
    const page = planVNextTextBlockV4InlineCommand(textBlock, {
      kind: "page-number.insert", anchor: anchor("label", 5), inline: { id: "page", type: "page-number" },
    }, { fieldContract: fields, zoneRole: "footer" })

    expect(image.status === "planned" && image.children[1]).toMatchObject({ id: "logo", type: "inline-image" })
    expect(page.status === "planned" && page.children[1]).toEqual({ id: "page", type: "page-number" })
  })

  it("removes atomics and chooses a deterministic neighboring caret", () => {
    const textBlock = block([
      { id: "left", type: "text", text: "A" },
      { id: "field", type: "field-ref", key: "customer.name" },
      { id: "right", type: "text", text: "B" },
    ])
    const result = planVNextTextBlockV4InlineCommand(textBlock, {
      kind: "atomic.remove", inlineId: "field",
    }, { fieldContract: fields, zoneRole: "body" })
    const onlyAtomic = block([{ id: "field", type: "field-ref", key: "customer.name" }])
    const empty = planVNextTextBlockV4InlineCommand(onlyAtomic, {
      kind: "atomic.remove", inlineId: "field",
    }, { fieldContract: fields, zoneRole: "body" })

    expect(result).toMatchObject({
      status: "planned",
      children: [{ id: "left" }, { id: "right" }],
      selectionAfter: { inlineId: "left", offset: 1, affinity: "backward" },
      identity: { removedInlineIds: ["field"] },
    })
    expect(empty).toMatchObject({
      status: "planned", children: [], selectionAfter: { inlineId: null, offset: 0 },
    })
  })

  it("blocks implicit split ids, duplicate ids, text removal, incompatible fields, and body page numbers", () => {
    const textBlock = block([{ id: "sentence", type: "text", text: "Hello" }])
    const missingSplit = planVNextTextBlockV4InlineCommand(textBlock, {
      kind: "field-ref.insert", anchor: anchor("sentence", 2),
      inline: { id: "field", type: "field-ref", key: "customer.name" },
    }, { fieldContract: fields, zoneRole: "body" })
    const duplicate = planVNextTextBlockV4InlineCommand(textBlock, {
      kind: "line-break.insert", anchor: anchor("sentence", 0), inline: { id: "sentence", type: "line-break" },
    }, { fieldContract: fields, zoneRole: "body" })
    const removeText = planVNextTextBlockV4InlineCommand(textBlock, {
      kind: "atomic.remove", inlineId: "sentence",
    }, { fieldContract: fields, zoneRole: "body" })
    const imageField = planVNextTextBlockV4InlineCommand(block([]), {
      kind: "field-ref.insert", anchor: anchor(null, 0),
      inline: { id: "logo-field", type: "field-ref", key: "customer.logo" },
    }, { fieldContract: fields, zoneRole: "body" })
    const bodyPage = planVNextTextBlockV4InlineCommand(block([]), {
      kind: "page-number.insert", anchor: anchor(null, 0), inline: { id: "page", type: "page-number" },
    }, { fieldContract: fields, zoneRole: "body" })

    expect(missingSplit).toMatchObject({ status: "blocked", issues: [{ code: "split-right-id-required" }] })
    expect(duplicate).toMatchObject({ status: "blocked", issues: [{ code: "duplicate-inline-id" }] })
    expect(removeText).toMatchObject({ status: "blocked", issues: [{ code: "text-inline-not-atomic" }] })
    expect(imageField).toMatchObject({ status: "blocked", issues: [{ code: "field-type-not-inline-compatible" }] })
    expect(bodyPage).toMatchObject({ status: "blocked", issues: [{ code: "page-number-zone-invalid" }] })
  })

  it("keeps planner output behind the Phase 276 commit boundary", () => {
    const source = readFileSync(new URL("../src/authoring/textBlockV4InlineCommands.ts", import.meta.url), "utf8")
    expect(source).not.toContain("runVNextTextBlockV4RichInlineReplace(")
    expect(source).not.toContain("evaluateVNextEffectiveNodeCapabilityV1")
    expect(source).not.toContain("Date.now")
    expect(source).not.toContain("Math.random")
  })

  it("publishes Phase 277 without bypassing policy-aware replacement", () => {
    const doc = readFileSync(new URL("../docs/TEXT_BLOCK_V4_INLINE_COMMANDS.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("explicit field and atomic command planner")
    expect(doc).toContain("retain the original id on the left")
    expect(doc).toContain("does not copy a field definition or value")
    expect(doc).toContain("no policy/session bypass")
    expect(readme).toContain("Phase 277 plans explicit v4 field and atomic inline commands")
    expect(ledger).toContain("## Phase 277 Text-block V4 Inline Commands")
  })
})
