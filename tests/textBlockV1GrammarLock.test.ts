import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("Text-block v1 grammar lock", () => {
  it("locks the target inline vocabulary and model offset rules", () => {
    const lock = readText("docs/TEXT_BLOCK_V1_GRAMMAR_LOCK.md")

    for (const inlineType of ["text", "line-break", "field-ref", "page-number", "inline-image"]) {
      expect(lock).toContain(`\`${inlineType}\``)
    }

    expect(lock).toContain("Offsets count UTF-16 code units")
    expect(lock).toContain("reject offsets that split a UTF-16 surrogate pair")
    expect(lock).toContain("each contribute one U+FFFC atomic")
    expect(lock).toContain("input adapter must submit grapheme-safe")
    expect(lock).toContain("Canonical empty block is `children: []`")
  })

  it("locks atomic, style, field, image, selection, and IME ownership", () => {
    const lock = readText("docs/TEXT_BLOCK_V1_GRAMMAR_LOCK.md")

    for (const phrase of [
      "plain text delete/replace cannot partially intersect an atomic",
      "Field definition and type live in the central registry",
      "Inline-image is required before Node v1 closes",
      "Sparse inline style belongs to text leaves",
      "One active text-block island may coexist with a group structural selection",
      "IME updates remain local and commit as one model transaction",
      "full rich replacement is bounded",
    ]) {
      expect(lock).toContain(phrase)
    }
  })

  it("records implementation blockers without claiming runtime changes", () => {
    const lock = readText("docs/TEXT_BLOCK_V1_GRAMMAR_LOCK.md")

    for (const section of [
      "## Current Contract Mismatch",
      "## Text-block Shape",
      "## Role Grammar",
      "## Target Inline Vocabulary",
      "## Model Offset Contract",
      "## Atomic Inline Rules",
      "## Field Usage Policy",
      "## Inline Image Insertion Point",
      "## Style Grammar",
      "## Selection And Editing Targets",
      "## IME Policy",
      "## V1 Decisions",
      "## BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## PASS",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) {
      expect(lock).toContain(section)
    }

    expect(lock).toContain("This document locks the target Text-block")
    expect(lock).toContain("It does not change package")
    expect(lock).toContain("flowdoc-vnext-editor@e50e28c")
    expect(lock).toContain("flowdoc-vnext-backend@9d4b202")
  })

  it("stays anchored to current schema and text transaction evidence", () => {
    const schema = readText("src/schema/document.ts")
    const transactions = readText("src/authoring/textTransactions.ts")
    const richInline = readText("src/authoring/richInlineCommit.ts")

    for (const currentType of [
      'z.literal("text")',
      'z.literal("field-ref")',
      'z.literal("page-number")',
      'z.literal("line-break")',
    ]) {
      expect(schema).toContain(currentType)
    }

    expect(schema).not.toContain('z.literal("inline-image")')
    expect(transactions).toContain('export const VNEXT_ATOMIC_INLINE_TEXT = "\\uFFFC"')
    expect(transactions).toContain('if (inline.type === "line-break") return "\\n"')
    expect(richInline).toContain("rich inline commit currently accepts text and field-ref children only")
  })

  it("publishes Phase 248 in repository navigation", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(readme).toContain("docs/TEXT_BLOCK_V1_GRAMMAR_LOCK.md")
    expect(ledger).toContain("| 248 | Text-block v1 grammar lock | done |")
    expect(ledger).toContain("## Phase 248 Text-block v1 Grammar Lock")
  })
})
