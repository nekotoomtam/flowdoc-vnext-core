import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  FIELD_CHIP_COMMAND_MODE,
  FIELD_CHIP_COMMAND_SOURCE,
  FIELD_CHIP_RICH_INLINE_OPERATION_KIND,
  createFieldChipCommand,
} from "../src/index.js"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

const fieldChips = [
  {
    chipId: "chip-customer-name",
    fieldKey: "customer.name",
    label: "Customer",
    range: {
      end: 8,
      start: 0,
      unit: "utf16-code-unit-offset" as const,
    },
  },
]

describe("field chip command boundary", () => {
  it("creates safe rich inline intents for delete, paste, and replace-with-text", () => {
    const deletion = createFieldChipCommand({
      command: "field-chip.delete",
      fieldChips,
      selectedChipId: "chip-customer-name",
      targetTextBlockId: "cover-header-label",
    })
    const paste = createFieldChipCommand({
      clipboard: {
        fieldKey: "customer.name",
        kind: "field-chip",
        label: "Customer",
      },
      command: "field-chip.paste",
      targetTextBlockId: "cover-header-label",
    })
    const replace = createFieldChipCommand({
      command: "field-chip.replace-with-text",
      fieldChips,
      replacementText: "Acme",
      selectedChipId: "chip-customer-name",
      targetTextBlockId: "cover-header-label",
    })

    expect(deletion).toMatchObject({
      command: "field-chip.delete",
      fieldKey: "customer.name",
      mode: FIELD_CHIP_COMMAND_MODE,
      reason: "field-chip-command-ready",
      source: FIELD_CHIP_COMMAND_SOURCE,
      status: "ready",
      targetTextBlockId: "cover-header-label",
    })
    expect(deletion.richInlineIntent).toMatchObject({
      atomic: true,
      fieldKey: "customer.name",
      operationKind: FIELD_CHIP_RICH_INLINE_OPERATION_KIND,
      status: "planned-intent",
      targetTextBlockId: "cover-header-label",
      type: "delete-field-chip",
    })
    expect(paste.richInlineIntent).toMatchObject({
      atomic: true,
      fieldKey: "customer.name",
      type: "paste-field-chip",
    })
    expect(paste.reason).toBe("field-chip-paste-ready")
    expect(replace.richInlineIntent).toMatchObject({
      fieldKey: "customer.name",
      type: "replace-field-chip-with-text",
    })
    expect(replace.reason).toBe("field-chip-replace-with-text-ready")
  })

  it("copies field chips without producing mutation intent", () => {
    const copy = createFieldChipCommand({
      command: "field-chip.copy",
      fieldChips,
      selectedChipId: "chip-customer-name",
      targetTextBlockId: "cover-header-label",
    })

    expect(copy).toMatchObject({
      clipboard: {
        chipId: "chip-customer-name",
        fieldKey: "customer.name",
        kind: "field-chip",
        label: "Customer",
      },
      fieldKey: "customer.name",
      reason: "field-chip-copy-ready",
      richInlineIntent: null,
      status: "ready",
    })
  })

  it("blocks internal chip editing and unsafe command facts", () => {
    const internalEdit = createFieldChipCommand({
      command: "block-edit-inside-chip",
      fieldChips,
      selectedChipId: "chip-customer-name",
      targetTextBlockId: "cover-header-label",
    })
    const insideSelection = createFieldChipCommand({
      command: "field-chip.delete",
      fieldChips,
      selectedChipId: "chip-customer-name",
      selection: { insideChip: true },
      targetTextBlockId: "cover-header-label",
    })
    const crossBlock = createFieldChipCommand({
      command: "field-chip.delete",
      fieldChips,
      selectedChipId: "chip-customer-name",
      selection: { textBlockId: "other-block" },
      targetTextBlockId: "cover-header-label",
    })
    const missingField = createFieldChipCommand({
      command: "field-chip.delete",
      fieldChips: [{ chipId: "chip-missing", fieldKey: "" }],
      selectedChipId: "chip-missing",
      targetTextBlockId: "cover-header-label",
    })
    const missingClipboard = createFieldChipCommand({
      command: "field-chip.paste",
      targetTextBlockId: "cover-header-label",
    })

    expect(internalEdit).toMatchObject({
      reason: "field-chip-internal-edit",
      richInlineIntent: null,
      status: "blocked",
    })
    expect(insideSelection.reason).toBe("field-chip-internal-edit")
    expect(crossBlock.reason).toBe("cross-block-selection")
    expect(missingField.reason).toBe("missing-field-key")
    expect(missingClipboard.reason).toBe("missing-clipboard-field-chip")
  })

  it("keeps field chip commands dependency-clean and exported from the package boundary", () => {
    const source = readText("../src/authoring/fieldChipCommands.ts")
    const index = readText("../src/index.ts")

    expect(source).toContain("FIELD_CHIP_COMMAND_SOURCE")
    expect(source).toContain("field-chip.replace-with-text")
    expect(source).toContain("block-edit-inside-chip")
    expect(source).toContain("text-block.rich-inline.replace")
    expect(source).not.toContain("document.")
    expect(source).not.toContain("querySelector")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("FlowDocEditor")
    expect(index).toContain('./authoring/fieldChipCommands.js')
  })

  it("documents Phase 159 and advances the roadmap to Phase 160", () => {
    const doc = readText("../docs/FIELD_CHIP_COMMAND_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 159 field chip command boundary.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("No DOM event binding.")
    expect(doc).toContain("No collaboration semantics.")
    expect(doc).toContain("Phase 160: Paste / Delete Preflight Boundary")
    expect(readme).toContain("Field chip command boundary")
    expect(readme).toContain("docs/FIELD_CHIP_COMMAND_BOUNDARY.md")
    expect(ledger).toContain("| 159 | Field chip command boundary | done |")
    expect(roadmap).toContain("## Phase 159: Field Chip Delete / Copy / Paste Command Boundary")
    expect(roadmap).toContain("Phase 160: Paste / Delete Preflight Boundary")
  })
})
