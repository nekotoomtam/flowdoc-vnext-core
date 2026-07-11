import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  projectVNextTextBlockV4Inlines,
  validateVNextTextBlockV4Grammar,
  validateVNextTextBlockV4Selection,
  vNextTextBlockV4AnchorFromBlockOffset,
  type FieldRegistryV1V3,
  type TextBlockNodeV4Target,
} from "../src/index.js"

const fields: FieldRegistryV1V3 = {
  version: 1,
  fields: {
    "customer.name": { key: "customer.name", label: "Customer Name", type: "text" },
    "customer.logo": { key: "customer.logo", label: "Customer Logo", type: "image" },
    "report.items": { key: "report.items", label: "Report Items", type: "collection" },
  },
}

function block(children: TextBlockNodeV4Target["children"]): TextBlockNodeV4Target {
  return {
    id: "body-text",
    type: "text-block",
    role: { role: "paragraph" },
    props: {},
    children,
  }
}

describe("text-block v4 authoring contract", () => {
  it("accepts children empty as canonical authored emptiness and uses a null-inline caret", () => {
    const textBlock = block([])
    const grammar = validateVNextTextBlockV4Grammar(textBlock, { fieldContract: fields, zoneRole: "body" })
    const anchor = { textBlockId: textBlock.id, inlineId: null, offset: 0, affinity: "forward" as const }
    const selection = validateVNextTextBlockV4Selection(textBlock, anchor)

    expect(grammar).toMatchObject({
      status: "valid",
      summary: { inlineCount: 0, emptyBlock: true, errorCount: 0 },
    })
    expect(projectVNextTextBlockV4Inlines(textBlock)).toEqual({
      textBlockId: "body-text", text: "", textLength: 0, segments: [],
    })
    expect(selection).toMatchObject({
      status: "valid",
      selection: { collapsed: true, anchor: { inlineId: null, offset: 0 } },
    })
    expect(vNextTextBlockV4AnchorFromBlockOffset(textBlock, 0, "forward")).toEqual(anchor)
    expect(validateVNextTextBlockV4Selection(textBlock, { ...anchor, inlineId: "runtime-sentinel" })).toMatchObject({
      status: "blocked", issues: [{ code: "empty-block-anchor-invalid" }],
    })
  })

  it("projects five inline forms with text-local and atomic offsets", () => {
    const textBlock = block([
      { id: "text-a", type: "text", text: "A" },
      { id: "field", type: "field-ref", key: "customer.name" },
      { id: "break", type: "line-break" },
      { id: "page", type: "page-number" },
      {
        id: "image",
        type: "inline-image",
        source: { kind: "asset-ref", assetId: "asset-logo" },
        accessibility: { kind: "decorative" },
        frame: {
          width: { value: 10, unit: "mm" },
          height: { value: 5, unit: "mm" },
          fit: "contain",
        },
        verticalAlign: "baseline",
      },
    ])

    const grammar = validateVNextTextBlockV4Grammar(textBlock, { fieldContract: fields, zoneRole: "footer" })
    const projection = projectVNextTextBlockV4Inlines(textBlock)

    expect(grammar).toMatchObject({
      status: "valid",
      summary: { inlineCount: 5, textCount: 1, atomicCount: 4, fieldRefCount: 1, inlineImageCount: 1 },
    })
    expect(projection.text).toBe(`A\uFFFC\n\uFFFC\uFFFC`)
    expect(projection.segments.map((segment) => [segment.inlineId, segment.startOffset, segment.endOffset])).toEqual([
      ["text-a", 0, 1], ["field", 1, 2], ["break", 2, 3], ["page", 3, 4], ["image", 4, 5],
    ])
    expect(validateVNextTextBlockV4Selection(textBlock, {
      textBlockId: textBlock.id, inlineId: "field", offset: 1, affinity: "forward",
    }).status).toBe("valid")
    expect(validateVNextTextBlockV4Selection(textBlock, {
      textBlockId: textBlock.id, inlineId: "field", offset: 2, affinity: "forward",
    })).toMatchObject({ status: "blocked", issues: [{ code: "atomic-offset-invalid" }] })
  })

  it("maps block offsets to stable inline-local anchors using affinity at boundaries", () => {
    const textBlock = block([
      { id: "left", type: "text", text: "Hi" },
      { id: "field", type: "field-ref", key: "customer.name" },
      { id: "right", type: "text", text: "โลก" },
    ])

    expect(vNextTextBlockV4AnchorFromBlockOffset(textBlock, 2, "backward")).toEqual({
      textBlockId: "body-text", inlineId: "left", offset: 2, affinity: "backward",
    })
    expect(vNextTextBlockV4AnchorFromBlockOffset(textBlock, 2, "forward")).toEqual({
      textBlockId: "body-text", inlineId: "field", offset: 0, affinity: "forward",
    })
    expect(vNextTextBlockV4AnchorFromBlockOffset(textBlock, 3, "forward")).toEqual({
      textBlockId: "body-text", inlineId: "right", offset: 0, affinity: "forward",
    })
    expect(vNextTextBlockV4AnchorFromBlockOffset(textBlock, 99, "forward")).toBeNull()
  })

  it("rejects offsets inside surrogate pairs while preserving Thai and emoji text", () => {
    const text = "สวัสดี 👩‍💻"
    const textBlock = block([{ id: "thai", type: "text", text }])
    const emoji = text.indexOf("👩")

    expect(vNextTextBlockV4AnchorFromBlockOffset(textBlock, emoji, "forward")).toMatchObject({
      inlineId: "thai", offset: emoji,
    })
    expect(vNextTextBlockV4AnchorFromBlockOffset(textBlock, emoji + 1, "forward")).toBeNull()
    expect(validateVNextTextBlockV4Selection(textBlock, {
      textBlockId: "body-text", inlineId: "thai", offset: emoji + 1, affinity: "forward",
    })).toMatchObject({ status: "blocked", issues: [{ code: "text-offset-invalid" }] })
  })

  it("blocks duplicate inline ids, incompatible fields, body page numbers, and non-v4 text leaves", () => {
    const duplicate = block([
      { id: "same", type: "field-ref", key: "customer.logo" },
      { id: "same", type: "field-ref", key: "report.items" },
      { id: "page", type: "page-number" },
    ])
    const invalidEmptyText = {
      ...block([]),
      children: [{ id: "empty", type: "text", text: "" }],
    }
    const invalidRawBreak = {
      ...block([]),
      children: [{ id: "raw", type: "text", text: "A\nB" }],
    }

    const result = validateVNextTextBlockV4Grammar(duplicate, { fieldContract: fields, zoneRole: "body" })
    expect(result.status).toBe("blocked")
    expect(result.issues.map((item) => item.code)).toEqual([
      "field-type-not-inline-compatible",
      "duplicate-inline-id",
      "field-type-not-inline-compatible",
      "page-number-zone-invalid",
    ])
    expect(validateVNextTextBlockV4Grammar(invalidEmptyText, { fieldContract: fields, zoneRole: "body" })).toMatchObject({
      status: "blocked", issues: [{ code: "invalid-text-block" }],
    })
    expect(validateVNextTextBlockV4Grammar(invalidRawBreak, { fieldContract: fields, zoneRole: "body" })).toMatchObject({
      status: "blocked", issues: [{ code: "invalid-text-block" }],
    })
  })

  it("publishes Phase 275 without activating v4 text mutation or editor DOM state", () => {
    const doc = readFileSync(new URL("../docs/TEXT_BLOCK_V4_AUTHORING_CONTRACT.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("The only canonical empty representation is `children: []`")
    expect(doc).toContain("`inlineId: null` is valid only")
    expect(doc).toContain("local UTF-16 offset, affinity")
    expect(doc).toContain("no v4 text mutation")
    expect(readme).toContain("Phase 275 adds the v4-native text-block grammar")
    expect(ledger).toContain("## Phase 275 Text-block V4 Authoring Contract")
  })
})
