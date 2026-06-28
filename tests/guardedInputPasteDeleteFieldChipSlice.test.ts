import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function runPasteDeleteFieldChipScenario(): Record<string, unknown> {
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
    const {
      GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_MODE,
      GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_SOURCE,
      GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_STATUSES,
      createGuardedInputPasteDeleteFieldChipSlice,
      guardedInputPasteDeleteFieldChipSliceLabel,
    } = await import("./public/guardedInputPasteDeleteFieldChipSlice.js");

    const textBlock = {
      canUseHardenedTextBlockIsland: true,
      id: "cover-title",
      plainText: "Hello",
      type: "text-block",
    };
    const fieldChips = [{
      chipId: "chip-customer-name",
      fieldKey: "customer.name",
      label: "Customer",
    }];
    const base = {
      fieldChips,
      selectedNode: textBlock,
      targetTextBlockId: "cover-title",
      text: "Hello",
    };

    const plainPaste = createGuardedInputPasteDeleteFieldChipSlice({
      ...base,
      kind: "paste.text",
      text: "Hello\\r\\nWorld",
    });
    const unsafePaste = createGuardedInputPasteDeleteFieldChipSlice({
      ...base,
      kind: "paste.rich",
      paste: {
        htmlSafe: false,
      },
    });
    const deleteNearChip = createGuardedInputPasteDeleteFieldChipSlice({
      ...base,
      kind: "backspace",
      selection: {
        nearFieldChipId: "chip-customer-name",
      },
    });
    const insideChip = createGuardedInputPasteDeleteFieldChipSlice({
      ...base,
      kind: "delete.selection",
      selection: {
        insideFieldChip: true,
      },
    });
    const structural = createGuardedInputPasteDeleteFieldChipSlice({
      ...base,
      kind: "delete.selection",
      selection: {
        crossesStructuralBoundary: true,
      },
    });
    const composing = createGuardedInputPasteDeleteFieldChipSlice({
      ...base,
      compositionActive: true,
      kind: "paste.text",
      text: "IME",
    });
    const chipCopy = createGuardedInputPasteDeleteFieldChipSlice({
      ...base,
      kind: "field-chip.copy",
      selectedChipId: "chip-customer-name",
    });
    const chipReplace = createGuardedInputPasteDeleteFieldChipSlice({
      ...base,
      kind: "field-chip.replace-with-text",
      replacementText: "Acme",
      selectedChipId: "chip-customer-name",
    });

    console.log(JSON.stringify({
      chipCopy,
      chipReplace,
      composing,
      constants: {
        mode: GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_MODE,
        source: GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_SOURCE,
        statuses: GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_STATUSES,
      },
      deleteNearChip,
      insideChip,
      label: guardedInputPasteDeleteFieldChipSliceLabel(deleteNearChip),
      plainPaste,
      structural,
      unsafePaste,
    }));
  `], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
  })

  return JSON.parse(output) as Record<string, unknown>
}

describe("guarded input paste/delete/field-chip slice", () => {
  it("handles plain paste and blocks unsafe rich paste without package mutation", () => {
    const result = runPasteDeleteFieldChipScenario()
    const plainPaste = result.plainPaste as Record<string, unknown>
    const unsafePaste = result.unsafePaste as Record<string, unknown>

    expect(result.constants).toMatchObject({
      mode: "sandbox-local-guarded-input-paste-delete-field-chip-slice",
      source: "flowdoc-guarded-input-paste-delete-field-chip-slice",
      statuses: ["accepted", "transformed", "fallback", "blocked"],
    })
    expect(plainPaste).toMatchObject({
      reason: "plain-text-normalized",
      status: "transformed",
    })
    expect(plainPaste.preflight).toMatchObject({
      action: "transform",
      normalizedText: "Hello\nWorld",
    })
    expect(plainPaste.packageMutation).toMatchObject({
      status: "not-mutated",
    })
    expect(unsafePaste).toMatchObject({
      reason: "unsupported-html-paste",
      status: "blocked",
    })
    expect(unsafePaste.preflight).toMatchObject({
      action: "reject",
      reason: "unsupported-html-paste",
    })
  })

  it("transforms delete near a field chip and blocks unsafe delete paths", () => {
    const result = runPasteDeleteFieldChipScenario()
    const deleteNearChip = result.deleteNearChip as Record<string, unknown>
    const insideChip = result.insideChip as Record<string, unknown>
    const structural = result.structural as Record<string, unknown>
    const composing = result.composing as Record<string, unknown>

    expect(deleteNearChip).toMatchObject({
      reason: "field-chip-command-ready",
      status: "transformed",
    })
    expect(deleteNearChip.fieldChipCommand).toMatchObject({
      command: "field-chip.delete",
      fieldKey: "customer.name",
      richInlineIntent: {
        atomic: true,
        operationKind: "text-block.rich-inline.replace",
        type: "delete-field-chip",
      },
      status: "ready",
    })
    expect(deleteNearChip.packageMutation).toMatchObject({
      status: "planned-intent-only",
    })
    expect(result.label).toBe("Guarded paste/delete/field-chip slice: transformed field-chip-command-ready")
    expect(insideChip).toMatchObject({
      reason: "field-chip-internal-edit",
      status: "blocked",
    })
    expect(structural).toMatchObject({
      reason: "structural-boundary-delete",
      status: "blocked",
    })
    expect(composing).toMatchObject({
      reason: "composition-active",
      status: "blocked",
    })
  })

  it("keeps direct field-chip copy and replace atomic", () => {
    const result = runPasteDeleteFieldChipScenario()
    const chipCopy = result.chipCopy as Record<string, unknown>
    const chipReplace = result.chipReplace as Record<string, unknown>

    expect(chipCopy).toMatchObject({
      reason: "field-chip-copy-ready",
      status: "accepted",
    })
    expect(chipCopy.fieldChipCommand).toMatchObject({
      clipboard: {
        chipId: "chip-customer-name",
        fieldKey: "customer.name",
        kind: "field-chip",
      },
      richInlineIntent: null,
      status: "ready",
    })
    expect(chipReplace).toMatchObject({
      reason: "field-chip-replace-with-text-ready",
      status: "transformed",
    })
    expect(chipReplace.fieldChipCommand).toMatchObject({
      richInlineIntent: {
        atomic: true,
        type: "replace-field-chip-with-text",
      },
    })
  })

  it("keeps the sandbox module dependency-clean and browser-local", () => {
    const source = readText("../examples/template-builder-sandbox/public/guardedInputPasteDeleteFieldChipSlice.js")

    expect(source).toContain("createGuardedInputPasteDeleteFieldChipSlice")
    expect(source).toContain("createPasteDeletePreflight")
    expect(source).toContain("createGuardedInputRuntimeSlice")
    expect(source).toContain("text-block.rich-inline.replace")
    expect(source).not.toContain("document.")
    expect(source).not.toContain("querySelector")
    expect(source).not.toContain("clipboardData")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("FlowDocEditor")
    expect(source).not.toMatch(/from\s+["']\.\.\/\.\.\/src/)
  })

  it("documents Phase 170 and advances the roadmap", () => {
    const doc = readText("../docs/GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_SLICE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 170 guarded input paste/delete/field-chip slice.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase: Phase 171: Input Integration Close Audit.")
    expect(readme).toContain("Guarded input paste/delete/field-chip slice")
    expect(readme).toContain("docs/GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_SLICE.md")
    expect(ledger).toContain("| 170 | Guarded input paste/delete/field-chip slice | done |")
    expect(roadmap).toContain("## Phase 170: Paste/Delete/Field-chip Input Slice")
    expect(roadmap).toContain("Current next step after Phase 170:")
    expect(roadmap).toContain("Phase 171: Input Integration Close Audit")
    expect(doc).not.toContain("production contenteditable readiness is achieved")
    expect(doc).not.toContain("production browser readiness is achieved")
  })
})
