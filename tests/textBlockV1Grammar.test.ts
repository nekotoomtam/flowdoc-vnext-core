import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { FieldRegistry, InlineNode, TextBlockNode } from "../src/index.js"
import {
  applyVNextTextBlockV1Normalization,
  isVNextTextBlockV1SafeTextOffset,
  planVNextTextBlockV1Normalization,
  validateVNextTextBlockV1Grammar,
} from "../src/index.js"

function textBlock(children: InlineNode[]): TextBlockNode {
  return {
    id: "body-text",
    type: "text-block",
    role: { role: "paragraph" },
    props: {},
    children,
  }
}

const fieldRegistry: FieldRegistry = {
  version: 1,
  fields: {
    "customer.name": {
      key: "customer.name",
      label: "Customer Name",
      type: "text",
    },
  },
}

describe("Text-block v1 grammar validation and normalization", () => {
  it("accepts current mixed inline content in a compatible static zone", () => {
    const block = textBlock([
      { id: "title", type: "text", text: "Report for ", style: { fontWeight: "bold" } },
      { id: "customer", type: "field-ref", key: "customer.name" },
      { id: "break", type: "line-break" },
      { id: "page", type: "page-number" },
    ])

    const result = validateVNextTextBlockV1Grammar(block, {
      fieldRegistry,
      zoneRole: "footer",
    })

    expect(result).toMatchObject({
      grammarVersion: 1,
      status: "valid",
      summary: {
        errorCount: 0,
        fieldReferenceCount: 1,
        inlineCount: 4,
        normalizationCount: 0,
        pageNumberCount: 1,
        warningCount: 0,
      },
    })
    expect(result.issues).toEqual([])
  })

  it("normalizes empty text and CR/LF deterministically without mutating source", () => {
    const block = textBlock([
      { id: "empty", type: "text", text: "" },
      {
        id: "mixed",
        type: "text",
        text: "First\r\nSecond\rThird\nFourth",
        style: { fontStyle: "italic" },
      },
      { id: "mixed-break-1", type: "line-break" },
    ])
    const sourceSnapshot = JSON.parse(JSON.stringify(block))
    const context = { zoneRole: "body" as const }

    const plan = planVNextTextBlockV1Normalization(block, context)
    const applied = applyVNextTextBlockV1Normalization(plan)

    expect(block).toEqual(sourceSnapshot)
    expect(plan).toMatchObject({
      status: "ready",
      validation: {
        status: "normalization-required",
        summary: { normalizationCount: 2, warningCount: 2 },
      },
      contracts: {
        deterministicIds: true,
        packageMutation: false,
        sourceMutation: false,
        storageWrites: false,
      },
      changes: [
        { kind: "remove-empty-text", sourceInlineId: "empty", producedInlineIds: [] },
        { kind: "split-raw-line-break", sourceInlineId: "mixed" },
      ],
    })
    expect(applied.status).toBe("applied")
    expect(applied.textBlock?.children).toEqual([
      { id: "mixed", type: "text", text: "First", style: { fontStyle: "italic" } },
      { id: "mixed-break-1-2", type: "line-break" },
      { id: "mixed-after-1", type: "text", text: "Second", style: { fontStyle: "italic" } },
      { id: "mixed-break-2", type: "line-break" },
      { id: "mixed-after-2", type: "text", text: "Third", style: { fontStyle: "italic" } },
      { id: "mixed-break-3", type: "line-break" },
      { id: "mixed-after-3", type: "text", text: "Fourth", style: { fontStyle: "italic" } },
      { id: "mixed-break-1", type: "line-break" },
    ])

    const secondPlan = planVNextTextBlockV1Normalization(applied.textBlock as TextBlockNode, context)
    expect(secondPlan.status).toBe("not-required")
    expect(secondPlan.changes).toEqual([])
    expect(secondPlan.normalizedTextBlock).toEqual(applied.textBlock)
  })

  it("blocks duplicate ids, missing fields, and page numbers in body flow", () => {
    const block = textBlock([
      { id: "duplicate", type: "text", text: "Hello" },
      { id: "duplicate", type: "field-ref", key: "missing.key" },
      { id: "page", type: "page-number" },
    ])

    const validation = validateVNextTextBlockV1Grammar(block, {
      fieldRegistry,
      zoneRole: "body",
    })
    const plan = planVNextTextBlockV1Normalization(block, {
      fieldRegistry,
      zoneRole: "body",
    })
    const applied = applyVNextTextBlockV1Normalization(plan)

    expect(validation.status).toBe("blocked")
    expect(validation.issues.map((candidate) => candidate.code)).toEqual([
      "duplicate-inline-id",
      "missing-field-definition",
      "page-number-zone-invalid",
    ])
    expect(plan).toMatchObject({
      status: "blocked",
      changes: [],
      normalizedTextBlock: null,
    })
    expect(applied).toMatchObject({
      status: "blocked",
      changes: [],
      textBlock: null,
    })
  })

  it("blocks image and collection fields from scalar inline placement", () => {
    const incompatibleRegistry: FieldRegistry = {
      version: 1,
      fields: {
        "customer.logo": {
          key: "customer.logo",
          label: "Customer Logo",
          type: "image",
        },
        "report.items": {
          key: "report.items",
          label: "Report Items",
          type: "collection",
        },
      },
    }
    const block = textBlock([
      { id: "logo", type: "field-ref", key: "customer.logo" },
      { id: "items", type: "field-ref", key: "report.items" },
    ])

    const result = validateVNextTextBlockV1Grammar(block, {
      fieldRegistry: incompatibleRegistry,
      zoneRole: "body",
    })

    expect(result.status).toBe("blocked")
    expect(result.issues).toEqual([
      expect.objectContaining({ code: "field-type-not-inline-compatible", inlineId: "logo" }),
      expect.objectContaining({ code: "field-type-not-inline-compatible", inlineId: "items" }),
    ])
  })

  it("preserves valid Thai and emoji text while exposing safe UTF-16 boundaries", () => {
    const text = "สวัสดี 👩‍💻"
    const block = textBlock([{ id: "thai", type: "text", text }])
    const validation = validateVNextTextBlockV1Grammar(block, { zoneRole: "body" })
    const plan = planVNextTextBlockV1Normalization(block, { zoneRole: "body" })
    const emojiStart = text.indexOf("👩")

    expect(validation.status).toBe("valid")
    expect(plan.status).toBe("not-required")
    expect(plan.normalizedTextBlock).toEqual(block)
    expect(isVNextTextBlockV1SafeTextOffset(text, emojiStart)).toBe(true)
    expect(isVNextTextBlockV1SafeTextOffset(text, emojiStart + 1)).toBe(false)
    expect(isVNextTextBlockV1SafeTextOffset(text, emojiStart + 2)).toBe(true)
    expect(isVNextTextBlockV1SafeTextOffset(text, -1)).toBe(false)
    expect(isVNextTextBlockV1SafeTextOffset(text, text.length + 1)).toBe(false)
  })

  it("blocks unpaired surrogates and invalid inline shapes without guessing repairs", () => {
    const brokenSurrogate = textBlock([{ id: "broken", type: "text", text: "bad\uD83D" }])
    const invalidInline = textBlock([
      { id: "valid", type: "text", text: "A" },
      { id: "future", type: "inline-image", assetId: "asset-1" } as unknown as InlineNode,
    ])

    expect(validateVNextTextBlockV1Grammar(brokenSurrogate, { zoneRole: "body" })).toMatchObject({
      status: "blocked",
      issues: [{ code: "unpaired-surrogate", inlineId: "broken" }],
    })
    expect(validateVNextTextBlockV1Grammar(invalidInline, { zoneRole: "body" })).toMatchObject({
      status: "blocked",
      issues: [{ code: "invalid-inline-child", inlineId: "future" }],
    })
  })

  it("keeps the grammar helper independent from DOM, storage, package mutation, and layout", () => {
    const source = readFileSync(new URL("../src/authoring/textBlockV1Grammar.ts", import.meta.url), "utf8")

    expect(source).not.toMatch(/\bReact\b|\bHTMLElement\b|\bwindow\.|document\.querySelector/)
    expect(source).not.toMatch(/node:fs|writeFile|fetch\(/)
    expect(source).not.toContain("serializeFlowDocPackageV2DocumentVNext")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("runVNextLayoutPipeline")
  })

  it("publishes Phase 249 and records the opt-in no-write boundary", () => {
    const doc = readFileSync(new URL("../docs/TEXT_BLOCK_V1_GRAMMAR_VALIDATOR.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("Status: Phase 249 pure target-grammar implementation.")
    expect(doc).toContain("All 72 current fixture text-blocks pass")
    expect(doc).toContain("Existing package parsing, operations, editor behavior, backend behavior")
    expect(readme).toContain("docs/TEXT_BLOCK_V1_GRAMMAR_VALIDATOR.md")
    expect(ledger).toContain("| 249 | Text-block v1 grammar validator and normalizer | done |")
    expect(ledger).toContain("## Phase 249 Text-block v1 Grammar Validator And Normalizer")
  })
})
