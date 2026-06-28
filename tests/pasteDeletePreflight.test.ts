import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function runPreflightScenario(): Record<string, unknown> {
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
    const {
      PASTE_DELETE_PREFLIGHT_ACTIONS,
      PASTE_DELETE_PREFLIGHT_MODE,
      PASTE_DELETE_PREFLIGHT_SOURCE,
      createPasteDeletePreflight,
      pasteDeletePreflightLabel,
    } = await import("./public/pasteDeletePreflight.js");

    const plain = createPasteDeletePreflight({
      kind: "paste.text",
      text: "Hello world",
    });
    const normalized = createPasteDeletePreflight({
      kind: "paste.text",
      text: "Hello\\r\\nworld",
    });
    const richFallback = createPasteDeletePreflight({
      kind: "paste.rich",
      paste: {
        plainText: "Rich text fallback",
      },
    });
    const richTransform = createPasteDeletePreflight({
      kind: "paste.rich",
      paste: {
        supportedFragments: [{ kind: "text", text: "Rich" }],
      },
    });
    const unsafeHtml = createPasteDeletePreflight({
      kind: "paste.rich",
      paste: {
        htmlSafe: false,
      },
    });
    const deleteReady = createPasteDeletePreflight({
      kind: "delete.selection",
      selection: {
        end: 5,
        start: 0,
      },
    });
    const nearChip = createPasteDeletePreflight({
      kind: "backspace",
      selection: {
        nearFieldChipId: "chip-customer-name",
      },
    });
    const acrossChip = createPasteDeletePreflight({
      kind: "delete.selection",
      selection: {
        crossesFieldChipBoundary: true,
      },
    });
    const insideChip = createPasteDeletePreflight({
      kind: "delete.selection",
      selection: {
        insideFieldChip: true,
      },
    });
    const structural = createPasteDeletePreflight({
      kind: "delete.selection",
      selection: {
        crossesStructuralBoundary: true,
      },
    });
    const composing = createPasteDeletePreflight({
      compositionActive: true,
      kind: "paste.text",
      text: "IME text",
    });

    console.log(JSON.stringify({
      actions: PASTE_DELETE_PREFLIGHT_ACTIONS,
      acrossChip,
      composing,
      constants: {
        mode: PASTE_DELETE_PREFLIGHT_MODE,
        source: PASTE_DELETE_PREFLIGHT_SOURCE,
      },
      deleteReady,
      insideChip,
      label: pasteDeletePreflightLabel(nearChip),
      nearChip,
      normalized,
      plain,
      richFallback,
      richTransform,
      structural,
      unsafeHtml,
    }));
  `], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
  })

  return JSON.parse(output) as Record<string, unknown>
}

describe("paste delete preflight boundary", () => {
  it("normalizes plain text paste and handles rich paste fallback/transform/reject", () => {
    const result = runPreflightScenario()

    expect(result.constants).toMatchObject({
      mode: "browser-local-paste-delete-preflight-boundary",
      source: "flowdoc-paste-delete-preflight",
    })
    expect(result.actions).toEqual(["allow", "transform", "fallback", "reject"])
    expect(result.plain).toMatchObject({
      action: "allow",
      normalizedText: "Hello world",
      reason: "plain-text-paste-ready",
    })
    expect(result.normalized).toMatchObject({
      action: "transform",
      normalizedText: "Hello\nworld",
      reason: "plain-text-normalized",
    })
    expect(result.richFallback).toMatchObject({
      action: "fallback",
      normalizedText: "Rich text fallback",
      reason: "rich-paste-fallback-to-plain-text",
    })
    expect(result.richTransform).toMatchObject({
      action: "transform",
      fragmentCount: 1,
      reason: "rich-paste-normalized",
    })
    expect(result.unsafeHtml).toMatchObject({
      action: "reject",
      reason: "unsupported-html-paste",
    })
  })

  it("protects field chip and structural delete boundaries", () => {
    const result = runPreflightScenario()

    expect(result.deleteReady).toMatchObject({
      action: "allow",
      reason: "delete-selection-ready",
    })
    expect(result.nearChip).toMatchObject({
      action: "transform",
      fieldChipCommand: {
        chipId: "chip-customer-name",
        command: "field-chip.delete",
      },
      reason: "field-chip-boundary-delete-command",
    })
    expect(result.acrossChip).toMatchObject({
      action: "reject",
      reason: "delete-across-chip-boundary",
    })
    expect(result.insideChip).toMatchObject({
      action: "reject",
      reason: "field-chip-internal-edit",
    })
    expect(result.structural).toMatchObject({
      action: "reject",
      reason: "structural-boundary-delete",
    })
    expect(result.composing).toMatchObject({
      action: "reject",
      reason: "composition-active",
    })
    expect(result.label).toBe("Paste/delete preflight: transform field-chip-boundary-delete-command")
  })

  it("keeps preflight dependency-clean and non-mutating", () => {
    const source = readText("../examples/template-builder-sandbox/public/pasteDeletePreflight.js")

    expect(source).toContain("PASTE_DELETE_PREFLIGHT_SOURCE")
    expect(source).toContain("createPasteDeletePreflight")
    expect(source).toContain("preflight does not mutate package data")
    expect(source).not.toContain("document.")
    expect(source).not.toContain("querySelector")
    expect(source).not.toContain("clipboardData")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("FlowDocEditor")
    expect(source).not.toMatch(/from\s+["']\.\.\/\.\.\/src/)
  })

  it("documents Phase 160 and advances the roadmap to Phase 161", () => {
    const doc = readText("../docs/PASTE_DELETE_PREFLIGHT_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 160 paste/delete preflight boundary.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("No arbitrary pasted HTML as package truth.")
    expect(doc).toContain("No browser clipboard integration.")
    expect(doc).toContain("Phase 161: Renderer Segment / Hit-Test Evidence Boundary")
    expect(readme).toContain("Paste/delete preflight boundary")
    expect(readme).toContain("docs/PASTE_DELETE_PREFLIGHT_BOUNDARY.md")
    expect(ledger).toContain("| 160 | Paste/delete preflight boundary | done |")
    expect(roadmap).toContain("## Phase 160: Paste / Delete Preflight Boundary")
    expect(roadmap).toContain("Phase 161: Renderer Segment / Hit-Test Evidence Boundary")
  })
})
