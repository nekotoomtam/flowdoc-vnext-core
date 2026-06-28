import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function runOwnershipScenario(): Record<string, unknown> {
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
    const {
      HYBRID_INPUT_RUNTIME_OWNERSHIP_MODE,
      HYBRID_INPUT_RUNTIME_OWNERSHIP_SOURCE,
      HYBRID_INPUT_TARGET_TYPES,
      createHybridInputRuntimeOwnership,
      hybridInputRuntimeOwnershipLabel,
    } = await import("./public/inputRuntimeOwnership.js");

    const textBlock = {
      canUseHardenedTextBlockIsland: true,
      id: "cover-title",
      plainText: "Quarterly report",
      type: "text-block",
    };
    const styledFallbackBlock = {
      canUseHardenedTextBlockIsland: false,
      hasStyledText: true,
      id: "summary-rich",
      plainText: "Styled summary",
      type: "text-block",
    };
    const table = {
      id: "revenue-table",
      type: "table",
    };
    const unsupported = {
      id: "legacy-embed",
      type: "legacy-editor-widget",
    };

    const idle = createHybridInputRuntimeOwnership();
    const managed = createHybridInputRuntimeOwnership({ selectedNode: table });
    const island = createHybridInputRuntimeOwnership({
      compositionActive: true,
      requestedTargetType: "active-text-block-island",
      selectedNode: textBlock,
    });
    const fallback = createHybridInputRuntimeOwnership({
      fallbackRequested: true,
      requestedTargetType: "active-text-block-island",
      selectedNode: styledFallbackBlock,
    });
    const islandConflict = createHybridInputRuntimeOwnership({
      currentActiveTextBlockId: "other-text-block",
      requestedTargetType: "active-text-block-island",
      selectedNode: textBlock,
    });
    const unsupportedTarget = createHybridInputRuntimeOwnership({ selectedNode: unsupported });
    const fullDocument = createHybridInputRuntimeOwnership({
      fullDocumentContenteditable: true,
      selectedNode: textBlock,
    });
    const domTruth = createHybridInputRuntimeOwnership({
      commitDomHtml: true,
      selectedNode: textBlock,
    });

    function commandStatus(summary, command) {
      return summary.commandReadiness.find((entry) => entry.command === command) || null;
    }

    console.log(JSON.stringify({
      constants: {
        mode: HYBRID_INPUT_RUNTIME_OWNERSHIP_MODE,
        source: HYBRID_INPUT_RUNTIME_OWNERSHIP_SOURCE,
        targetTypes: HYBRID_INPUT_TARGET_TYPES,
      },
      domTruthReason: domTruth.reason,
      fallbackActiveTextBlockId: fallback.activeTextBlockId,
      fallbackCommand: commandStatus(fallback, "textarea-fallback.use"),
      fallbackFallbackReason: fallback.fallbackReason,
      fallbackLabel: hybridInputRuntimeOwnershipLabel(fallback),
      fallbackPackageTruth: fallback.canonicalPackageTruth.status,
      fallbackReason: fallback.reason,
      fallbackTargetType: fallback.targetType,
      fullDocumentReason: fullDocument.reason,
      idleAllowedCount: idle.allowedCommands.length,
      idlePackageTruth: idle.canonicalPackageTruth.status,
      idleReason: idle.reason,
      idleTargetType: idle.targetType,
      islandActiveTextBlockId: island.activeTextBlockId,
      islandCommit: commandStatus(island, "commit-bridge.prepare"),
      islandCoreCommit: island.coreCommit.status,
      islandLabel: hybridInputRuntimeOwnershipLabel(island),
      islandReason: island.reason,
      islandTargetType: island.targetType,
      managedAllowed: managed.allowedCommands,
      managedBlockedRawDom: managed.blockedCommands.find((entry) => entry.command === "raw-dom-html.commit"),
      managedOwnerKeys: Object.keys(managed.owners).sort(),
      managedReason: managed.reason,
      managedTargetType: managed.targetType,
      oneIslandReason: islandConflict.reason,
      oneIslandTargetType: islandConflict.targetType,
      unsupportedReason: unsupportedTarget.reason,
      unsupportedTargetType: unsupportedTarget.targetType,
    }));
  `], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
  })

  return JSON.parse(output) as Record<string, unknown>
}

describe("hybrid input runtime ownership boundary", () => {
  it("classifies active input ownership targets without mutating package truth", () => {
    const result = runOwnershipScenario()

    expect(result.constants).toMatchObject({
      mode: "browser-local-input-runtime-ownership-boundary",
      source: "flowdoc-hybrid-input-runtime-ownership",
      targetTypes: [
        "none",
        "managed-card-selection",
        "active-text-block-island",
        "textarea-fallback",
        "rejected",
      ],
    })
    expect(result.idleTargetType).toBe("none")
    expect(result.idleReason).toBe("no-active-target")
    expect(result.idleAllowedCount).toBe(0)
    expect(result.idlePackageTruth).toBe("not-mutated")
    expect(result.managedTargetType).toBe("managed-card-selection")
    expect(result.managedReason).toBe("managed-card-runtime-ready")
    expect(result.managedAllowed).toEqual([
      "managed-card.select",
      "managed-card.focus",
      "structural-command.evaluate",
    ])
    expect(result.managedBlockedRawDom).toMatchObject({
      command: "raw-dom-html.commit",
      reason: "explicit-non-work",
    })
  })

  it("selects one active text-block island or textarea fallback with explicit readiness facts", () => {
    const result = runOwnershipScenario()

    expect(result.islandTargetType).toBe("active-text-block-island")
    expect(result.islandActiveTextBlockId).toBe("cover-title")
    expect(result.islandReason).toBe("active-text-block-island-ready")
    expect(result.islandCommit).toMatchObject({
      command: "commit-bridge.prepare",
      owner: "commit-bridge",
      reason: "composition-active",
      status: "blocked",
    })
    expect(result.islandCoreCommit).toBe("not-run")
    expect(result.islandLabel).toBe("Input ownership: island cover-title")
    expect(result.fallbackTargetType).toBe("textarea-fallback")
    expect(result.fallbackActiveTextBlockId).toBe("summary-rich")
    expect(result.fallbackReason).toBe("textarea-fallback-selected")
    expect(result.fallbackFallbackReason).toBe("styled-runs-need-managed-fallback")
    expect(result.fallbackCommand).toMatchObject({
      command: "textarea-fallback.use",
      reason: "textarea-fallback-ready",
      status: "ready",
    })
    expect(result.fallbackPackageTruth).toBe("not-mutated")
    expect(result.fallbackLabel).toBe("Input ownership: textarea fallback summary-rich")
  })

  it("rejects unsupported targets, full-document contenteditable, DOM HTML truth, and multi-island ownership", () => {
    const result = runOwnershipScenario()

    expect(result.oneIslandTargetType).toBe("rejected")
    expect(result.oneIslandReason).toBe("active-text-block-island-already-open")
    expect(result.unsupportedTargetType).toBe("rejected")
    expect(result.unsupportedReason).toBe("unsupported-target-type")
    expect(result.fullDocumentReason).toBe("full-document-contenteditable-blocked")
    expect(result.domTruthReason).toBe("dom-html-package-truth-blocked")
  })

  it("keeps the module dependency-clean and ownership-sliced", () => {
    const source = readText("../examples/template-builder-sandbox/public/inputRuntimeOwnership.js")

    expect(source).toContain("HYBRID_INPUT_RUNTIME_OWNERSHIP_SOURCE")
    expect(source).toContain("createHybridInputRuntimeOwnership")
    expect(source).toContain("createHybridInputCommandReadiness")
    expect(source).toContain("managedCardRuntime")
    expect(source).toContain("activeTextBlockIslandRuntime")
    expect(source).toContain("commandPolicy")
    expect(source).toContain("commitBridge")
    expect(source).toContain("fallbackTextareaPath")
    expect(source).toContain("appShellIntegration")
    expect(source).not.toContain("document.")
    expect(source).not.toContain("querySelector")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("FlowDocEditor")
    expect(source).not.toMatch(/from\s+["']\.\.\/\.\.\/src/)
  })

  it("documents Phase 154 in the phase trail and keeps production input unclaimed", () => {
    const doc = readText("../docs/HYBRID_INPUT_RUNTIME_OWNERSHIP_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 154 input runtime ownership boundary.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("No production contenteditable implementation.")
    expect(doc).toContain("No full-document contenteditable.")
    expect(doc).toContain("No package/document schema change.")
    expect(doc).toContain("Phase 155: Active Text-Block Island Boundary")
    expect(readme).toContain("Hybrid input runtime ownership boundary")
    expect(readme).toContain("docs/HYBRID_INPUT_RUNTIME_OWNERSHIP_BOUNDARY.md")
    expect(ledger).toContain("| 154 | Input runtime ownership boundary | done |")
    expect(roadmap).toContain("## Phase 154: Input Runtime Ownership Boundary")
    expect(roadmap).toContain("Phase 155: Active Text-Block Island Boundary")
    expect(roadmap).not.toContain("production input readiness is achieved")
  })
})
