import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function runDomBindingScenario(): Record<string, unknown> {
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
    const {
      createHybridInputRuntimeOwnership,
    } = await import("./public/inputRuntimeOwnership.js");
    const {
      activateActiveTextBlockIsland,
      beginActiveTextBlockIslandComposition,
      createInactiveActiveTextBlockIslandState,
      openActiveTextBlockIsland,
      updateActiveTextBlockIslandDraft,
    } = await import("./public/activeTextBlockIsland.js");
    const {
      ACTIVE_TEXT_BLOCK_DOM_BINDING_MODE,
      ACTIVE_TEXT_BLOCK_DOM_BINDING_SOURCE,
      activeTextBlockDomBindingSmokeLabel,
      createActiveTextBlockDomBindingSmoke,
    } = await import("./public/activeTextBlockDomBinding.js");

    const node = {
      canUseHardenedTextBlockIsland: true,
      id: "cover-title",
      plainText: "Quarterly report",
      type: "text-block",
    };
    const ownership = createHybridInputRuntimeOwnership({
      requestedTargetType: "active-text-block-island",
      selectedNode: node,
    });
    const active = updateActiveTextBlockIslandDraft(
      activateActiveTextBlockIsland(openActiveTextBlockIsland(createInactiveActiveTextBlockIslandState(), {
        ownership,
        selection: { end: 16, start: 16 },
        text: "Quarterly report",
        textBlockId: "cover-title",
      })),
      {
        selection: { end: 20, start: 17 },
        text: "Quarterly report ไทย",
      },
    );
    const surface = {
      contentEditable: "true",
      dataset: {
        activeNodeId: "cover-title",
        textBlockId: "cover-title",
      },
      textContent: "Quarterly report ไทย",
    };
    const captured = createActiveTextBlockDomBindingSmoke(active, {
      selection: {
        direction: "forward",
        end: 20,
        source: "bounded-test-selection",
        start: 17,
      },
      surface,
    });
    const composing = createActiveTextBlockDomBindingSmoke(beginActiveTextBlockIslandComposition(active, { data: "ไ" }), {
      selection: { end: 20, start: 20 },
      surface,
    });
    const textMismatch = createActiveTextBlockDomBindingSmoke(active, {
      selection: { end: 20, start: 17 },
      surface: {
        ...surface,
        textContent: "Different",
      },
    });
    const targetMismatch = createActiveTextBlockDomBindingSmoke(active, {
      selection: { end: 20, start: 17 },
      surface: {
        ...surface,
        dataset: {
          activeNodeId: "other-block",
          textBlockId: "other-block",
        },
      },
    });
    const nonContenteditable = createActiveTextBlockDomBindingSmoke(active, {
      selection: { end: 20, start: 17 },
      surface: {
        dataset: { textBlockId: "cover-title" },
        textContent: "Quarterly report ไทย",
      },
    });
    const outOfRange = createActiveTextBlockDomBindingSmoke(active, {
      selection: { end: 99, start: 17 },
      surface,
    });
    const domRangeObject = createActiveTextBlockDomBindingSmoke(active, {
      selection: {
        anchorNode: { nodeType: 3 },
        end: 20,
        focusNode: { nodeType: 3 },
        start: 17,
      },
      surface,
    });

    console.log(JSON.stringify({
      capturedActiveNodeId: captured.capture.activeNodeId,
      capturedLabel: activeTextBlockDomBindingSmokeLabel(captured),
      capturedPackageMutation: captured.packageMutation.status,
      capturedReason: captured.reason,
      capturedSelection: captured.capture.selection,
      capturedStatus: captured.status,
      capturedTextLength: captured.capture.textLength,
      capturedTextSnapshot: captured.capture.textSnapshot,
      capturedContenteditable: captured.contenteditable,
      composingFlag: composing.capture.compositionActive,
      constants: {
        mode: ACTIVE_TEXT_BLOCK_DOM_BINDING_MODE,
        source: ACTIVE_TEXT_BLOCK_DOM_BINDING_SOURCE,
      },
      domRangeReason: domRangeObject.reason,
      nonContenteditableReason: nonContenteditable.reason,
      outOfRangeReason: outOfRange.reason,
      targetMismatchReason: targetMismatch.reason,
      textMismatchReason: textMismatch.reason,
    }));
  `], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
  })

  return JSON.parse(output) as Record<string, unknown>
}

describe("active text-block DOM binding smoke boundary", () => {
  it("captures bounded JSON-safe contenteditable island facts", () => {
    const result = runDomBindingScenario()

    expect(result.constants).toMatchObject({
      mode: "browser-local-active-text-block-dom-binding-smoke",
      source: "flowdoc-active-text-block-dom-binding-smoke",
    })
    expect(result.capturedStatus).toBe("captured")
    expect(result.capturedReason).toBe("bounded-contenteditable-smoke-captured")
    expect(result.capturedActiveNodeId).toBe("cover-title")
    expect(result.capturedTextSnapshot).toBe("Quarterly report ไทย")
    expect(result.capturedTextLength).toBe("Quarterly report ไทย".length)
    expect(result.capturedSelection).toMatchObject({
      end: 20,
      source: "bounded-test-selection",
      start: 17,
      unit: "utf16-code-unit-offset",
    })
    expect(result.capturedContenteditable).toMatchObject({
      source: "browser-local-smoke-facts",
      status: "bound",
    })
    expect(result.capturedPackageMutation).toBe("not-mutated")
    expect(result.capturedLabel).toBe("DOM binding smoke: captured cover-title 17-20")
  })

  it("carries composition state and rejects unsafe captures with diagnostics", () => {
    const result = runDomBindingScenario()

    expect(result.composingFlag).toBe(true)
    expect(result.textMismatchReason).toBe("text-snapshot-mismatch")
    expect(result.targetMismatchReason).toBe("target-text-block-mismatch")
    expect(result.nonContenteditableReason).toBe("contenteditable-root-missing")
    expect(result.outOfRangeReason).toBe("selection-offset-out-of-range")
    expect(result.domRangeReason).toBe("dom-range-object-not-supported")
  })

  it("keeps DOM binding smoke dependency-clean and non-production", () => {
    const source = readText("../examples/template-builder-sandbox/public/activeTextBlockDomBinding.js")

    expect(source).toContain("ACTIVE_TEXT_BLOCK_DOM_BINDING_SOURCE")
    expect(source).toContain("createActiveTextBlockDomBindingSmoke")
    expect(source).toContain("browser-local-smoke-facts")
    expect(source).toContain("Phase 157 DOM smoke does not commit")
    expect(source).not.toContain("document.")
    expect(source).not.toContain("querySelector")
    expect(source).not.toContain("getSelection")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("FlowDocEditor")
    expect(source).not.toMatch(/from\s+["']\.\.\/\.\.\/src/)
  })

  it("documents Phase 157 and advances the roadmap to Phase 158", () => {
    const doc = readText("../docs/ACTIVE_TEXT_BLOCK_DOM_BINDING_SMOKE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 157 DOM binding smoke boundary.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("No production DOM range support.")
    expect(doc).toContain("No commit to core.")
    expect(doc).toContain("Phase 158: Active Island Commit Bridge Smoke")
    expect(readme).toContain("Active text-block DOM binding smoke")
    expect(readme).toContain("docs/ACTIVE_TEXT_BLOCK_DOM_BINDING_SMOKE.md")
    expect(ledger).toContain("| 157 | DOM binding smoke boundary | done |")
    expect(roadmap).toContain("## Phase 157: DOM Binding Smoke Boundary")
    expect(roadmap).toContain("Phase 158: Active Island Commit Bridge Smoke")
  })
})
