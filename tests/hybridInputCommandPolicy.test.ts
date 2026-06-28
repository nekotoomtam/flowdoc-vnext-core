import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function runPolicyScenario(): Record<string, unknown> {
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
    const {
      createHybridInputRuntimeOwnership,
    } = await import("./public/inputRuntimeOwnership.js");
    const {
      activateActiveTextBlockIsland,
      beginActiveTextBlockIslandComposition,
      createInactiveActiveTextBlockIslandState,
      openActiveTextBlockIsland,
      updateActiveTextBlockIslandSelection,
    } = await import("./public/activeTextBlockIsland.js");
    const {
      HYBRID_INPUT_COMMAND_KINDS,
      HYBRID_INPUT_COMMAND_POLICY_MODE,
      HYBRID_INPUT_COMMAND_POLICY_SOURCE,
      HYBRID_INPUT_COMMAND_READINESS,
      HYBRID_INPUT_COMMAND_REJECTION_REASONS,
      createHybridInputCommandPolicy,
      hybridInputCommandPolicyLabel,
    } = await import("./public/hybridInputCommandPolicy.js");

    const textBlock = {
      canUseHardenedTextBlockIsland: true,
      id: "cover-title",
      plainText: "Quarterly report",
      type: "text-block",
    };
    const ownership = createHybridInputRuntimeOwnership({
      requestedTargetType: "active-text-block-island",
      selectedNode: textBlock,
    });
    const activeIsland = updateActiveTextBlockIslandSelection(
      activateActiveTextBlockIsland(openActiveTextBlockIsland(createInactiveActiveTextBlockIslandState(), {
        ownership,
        selection: { end: 9, start: 0 },
        text: "Quarterly report",
        textBlockId: "cover-title",
      })),
      { end: 9, start: 0, textBlockId: "cover-title" },
    );
    const composingIsland = beginActiveTextBlockIslandComposition(activeIsland, { data: "ไ" });
    const fallbackOwnership = createHybridInputRuntimeOwnership({
      fallbackRequested: true,
      requestedTargetType: "textarea-fallback",
      selectedNode: textBlock,
    });
    const managedOwnership = createHybridInputRuntimeOwnership({
      selectedNode: { id: "revenue-table", type: "table" },
    });

    function statusFor(policy, command) {
      return policy.commandReadiness.find((entry) => entry.command === command) || null;
    }

    const ready = createHybridInputCommandPolicy({
      activeIsland,
      commandKind: "rich-inline.toggle-style",
      ownership,
    });
    const composing = createHybridInputCommandPolicy({
      activeIsland: composingIsland,
      commandKind: "commit",
      ownership,
    });
    const fieldChipInternal = createHybridInputCommandPolicy({
      activeIsland,
      commandKind: "text.insert",
      ownership,
      selection: {
        affinity: "field-chip-internal",
        textBlockId: "cover-title",
      },
    });
    const richPasteBlocked = createHybridInputCommandPolicy({
      activeIsland,
      commandKind: "paste.rich",
      ownership,
      paste: {
        htmlSafe: false,
      },
    });
    const structuralDelete = createHybridInputCommandPolicy({
      activeIsland,
      commandKind: "text.delete",
      deleteAcrossStructuralBoundary: true,
      ownership,
    });
    const crossBlock = createHybridInputCommandPolicy({
      activeIsland,
      commandKind: "selection.replace",
      ownership,
      selection: {
        end: 3,
        start: 0,
        textBlockId: "other-block",
      },
    });
    const fallback = createHybridInputCommandPolicy({
      commandKind: "rich-inline.toggle-style",
      ownership: fallbackOwnership,
    });
    const managed = createHybridInputCommandPolicy({
      commandKind: "text.insert",
      ownership: managedOwnership,
    });
    const cancelManaged = createHybridInputCommandPolicy({
      commandKind: "cancel",
      ownership: managedOwnership,
    });

    console.log(JSON.stringify({
      cancelManagedRequested: cancelManaged.requested,
      constants: {
        kinds: HYBRID_INPUT_COMMAND_KINDS,
        mode: HYBRID_INPUT_COMMAND_POLICY_MODE,
        readiness: HYBRID_INPUT_COMMAND_READINESS,
        rejectionReasons: HYBRID_INPUT_COMMAND_REJECTION_REASONS,
        source: HYBRID_INPUT_COMMAND_POLICY_SOURCE,
      },
      crossBlockRequested: crossBlock.requested,
      fallbackLabel: hybridInputCommandPolicyLabel(fallback),
      fallbackRequested: fallback.requested,
      fieldChipRequested: fieldChipInternal.requested,
      managedPackageMutation: managed.packageMutation.status,
      managedRequested: managed.requested,
      readyExecution: ready.execution.status,
      readyLabel: hybridInputCommandPolicyLabel(ready),
      readyRequested: ready.requested,
      richPasteRequested: richPasteBlocked.requested,
      statusPasteText: statusFor(ready, "paste.text"),
      statusTextInsert: statusFor(ready, "text.insert"),
      structuralDeleteRequested: structuralDelete.requested,
      composingRequested: composing.requested,
    }));
  `], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
  })

  return JSON.parse(output) as Record<string, unknown>
}

describe("hybrid input command policy boundary", () => {
  it("returns ready, fallback, or blocked command readiness without execution", () => {
    const result = runPolicyScenario()

    expect(result.constants).toMatchObject({
      kinds: [
        "text.insert",
        "text.delete",
        "selection.replace",
        "rich-inline.toggle-style",
        "field-chip.insert",
        "field-chip.delete",
        "paste.text",
        "paste.rich",
        "commit",
        "cancel",
      ],
      mode: "browser-local-hybrid-input-command-policy-boundary",
      readiness: ["ready", "fallback", "blocked"],
      rejectionReasons: [
        "composition-active",
        "unsupported-target",
        "cross-block-selection",
        "ambiguous-style-overlap",
        "field-chip-internal-edit",
        "unsupported-html-paste",
        "structural-boundary-delete",
      ],
      source: "flowdoc-hybrid-input-command-policy",
    })
    expect(result.readyRequested).toMatchObject({
      command: "rich-inline.toggle-style",
      executionMode: "rich-contenteditable",
      reason: "active-island-command-ready",
      status: "ready",
    })
    expect(result.readyExecution).toBe("not-run")
    expect(result.readyLabel).toBe("Hybrid command policy: rich-inline.toggle-style ready")
    expect(result.statusTextInsert).toMatchObject({ status: "ready" })
    expect(result.statusPasteText).toMatchObject({ status: "ready" })
  })

  it("blocks unsafe active-island commands with explicit rejection reasons", () => {
    const result = runPolicyScenario()

    expect(result.composingRequested).toMatchObject({
      command: "commit",
      reason: "composition-active",
      status: "blocked",
    })
    expect(result.fieldChipRequested).toMatchObject({
      command: "text.insert",
      reason: "field-chip-internal-edit",
      status: "blocked",
    })
    expect(result.richPasteRequested).toMatchObject({
      command: "paste.rich",
      reason: "unsupported-html-paste",
      status: "blocked",
    })
    expect(result.structuralDeleteRequested).toMatchObject({
      command: "text.delete",
      reason: "structural-boundary-delete",
      status: "blocked",
    })
    expect(result.crossBlockRequested).toMatchObject({
      command: "selection.replace",
      reason: "cross-block-selection",
      status: "blocked",
    })
  })

  it("routes textarea fallback and managed card modes without mutating package data", () => {
    const result = runPolicyScenario()

    expect(result.fallbackRequested).toMatchObject({
      command: "rich-inline.toggle-style",
      executionMode: "textarea-fallback",
      reason: "rich-command-fallback-to-plain-text",
      status: "fallback",
    })
    expect(result.fallbackLabel).toBe("Hybrid command policy: rich-inline.toggle-style fallback")
    expect(result.managedRequested).toMatchObject({
      command: "text.insert",
      executionMode: "managed-card",
      reason: "unsupported-target",
      status: "blocked",
    })
    expect(result.cancelManagedRequested).toMatchObject({
      command: "cancel",
      executionMode: "managed-card",
      reason: "managed-card-cancel-ready",
      status: "ready",
    })
    expect(result.managedPackageMutation).toBe("not-mutated")
  })

  it("keeps command policy dependency-clean and non-executing", () => {
    const source = readText("../examples/template-builder-sandbox/public/hybridInputCommandPolicy.js")

    expect(source).toContain("HYBRID_INPUT_COMMAND_POLICY_SOURCE")
    expect(source).toContain("createHybridInputCommandPolicy")
    expect(source).toContain("Phase 156 returns policy only")
    expect(source).toContain("command policy does not mutate package data")
    expect(source).not.toContain("document.")
    expect(source).not.toContain("querySelector")
    expect(source).not.toContain("getSelection")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("FlowDocEditor")
    expect(source).not.toMatch(/from\s+["']\.\.\/\.\.\/src/)
  })

  it("documents Phase 156 and advances the roadmap to Phase 157", () => {
    const doc = readText("../docs/HYBRID_INPUT_COMMAND_POLICY_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 156 hybrid command policy boundary.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("No command execution.")
    expect(doc).toContain("No package data mutation.")
    expect(doc).toContain("Phase 157: DOM Binding Smoke Boundary")
    expect(readme).toContain("Hybrid command policy boundary")
    expect(readme).toContain("docs/HYBRID_INPUT_COMMAND_POLICY_BOUNDARY.md")
    expect(ledger).toContain("| 156 | Hybrid command policy boundary | done |")
    expect(roadmap).toContain("## Phase 156: Hybrid Command Policy Boundary")
    expect(roadmap).toContain("Phase 157: DOM Binding Smoke Boundary")
  })
})
