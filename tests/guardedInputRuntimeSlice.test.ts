import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function runRuntimeSliceScenario(): Record<string, unknown> {
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
    const {
      GUARDED_INPUT_RUNTIME_SLICE_MODE,
      GUARDED_INPUT_RUNTIME_SLICE_SOURCE,
      GUARDED_INPUT_RUNTIME_STATUSES,
      createGuardedInputRuntimeSlice,
      guardedInputRuntimeSliceLabel,
    } = await import("./public/guardedInputRuntimeSlice.js");

    const textBlock = {
      canUseHardenedTextBlockIsland: true,
      id: "cover-title",
      plainText: "Quarterly report",
      type: "text-block",
    };
    const accepted = createGuardedInputRuntimeSlice({
      documentRevision: 4,
      draftText: "Quarterly report 2026",
      selectedNode: textBlock,
      selection: {
        end: 16,
        start: 9,
      },
      text: "Quarterly report",
    });
    const compositionBlocked = createGuardedInputRuntimeSlice({
      compositionActive: true,
      draftText: "Quarterly report ไ",
      selectedNode: textBlock,
      text: "Quarterly report",
    });
    const fallback = createGuardedInputRuntimeSlice({
      draftText: "Plain fallback",
      selectedNode: {
        canUseHardenedTextBlockIsland: false,
        fallbackReason: "styled-runs-need-managed-fallback",
        id: "styled-block",
        plainText: "Styled text",
        type: "text-block",
      },
      text: "Styled text",
    });
    const unsupported = createGuardedInputRuntimeSlice({
      selectedNode: {
        id: "summary-table",
        type: "table",
      },
    });

    console.log(JSON.stringify({
      accepted: {
        bridgeOperation: accepted.commitBridge?.bridgeRequest?.plan?.operationKind,
        bridgeStatus: accepted.commitBridge?.status,
        domBindingStatus: accepted.domBinding?.status,
        hardLimits: accepted.hardLimits,
        label: guardedInputRuntimeSliceLabel(accepted),
        packetRefresh: accepted.packetRefresh,
        packageMutation: accepted.packageMutation,
        productionReadiness: accepted.productionReadiness,
        reason: accepted.reason,
        selection: accepted.activeIsland?.selection,
        status: accepted.status,
        summary: accepted.summary,
      },
      compositionBlocked: {
        label: guardedInputRuntimeSliceLabel(compositionBlocked),
        packetRefresh: compositionBlocked.packetRefresh,
        policyRequested: compositionBlocked.commandPolicy?.requested,
        reason: compositionBlocked.reason,
        status: compositionBlocked.status,
      },
      constants: {
        mode: GUARDED_INPUT_RUNTIME_SLICE_MODE,
        source: GUARDED_INPUT_RUNTIME_SLICE_SOURCE,
        statuses: GUARDED_INPUT_RUNTIME_STATUSES,
      },
      fallback: {
        fallback: fallback.fallback,
        label: guardedInputRuntimeSliceLabel(fallback),
        packageMutation: fallback.packageMutation,
        status: fallback.status,
        summary: fallback.summary,
      },
      unsupported: {
        label: guardedInputRuntimeSliceLabel(unsupported),
        reason: unsupported.reason,
        status: unsupported.status,
        summary: unsupported.summary,
      },
    }));
  `], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
  })

  return JSON.parse(output) as Record<string, unknown>
}

describe("guarded input runtime slice", () => {
  it("composes the accepted active text-block path into a planned bridge request", () => {
    const result = runRuntimeSliceScenario()
    const accepted = result.accepted as Record<string, unknown>

    expect(result.constants).toMatchObject({
      mode: "sandbox-local-guarded-input-runtime-slice-1",
      source: "flowdoc-guarded-input-runtime-slice-1",
      statuses: ["accepted", "fallback", "blocked"],
    })
    expect(accepted).toMatchObject({
      bridgeOperation: "text-block.rich-inline.replace",
      bridgeStatus: "accepted",
      domBindingStatus: "captured",
      label: "Guarded input runtime slice: accepted cover-title",
      reason: "guarded-runtime-slice-accepted",
      status: "accepted",
    })
    expect(accepted.summary).toMatchObject({
      canBridgeCommit: true,
      targetTextBlockId: "cover-title",
      targetType: "active-text-block-island",
    })
    expect(accepted.selection).toMatchObject({
      end: 16,
      start: 9,
      textBlockId: "cover-title",
      unit: "utf16-code-unit-offset",
    })
    expect(accepted.packetRefresh).toMatchObject({
      responseMode: "packet",
      status: "required-after-accepted-commit",
    })
    expect(accepted.packageMutation).toMatchObject({
      status: "planned-through-existing-bridge",
    })
    expect(accepted.productionReadiness).toMatchObject({
      status: "not-claimed",
    })
    expect(accepted.hardLimits).toContain("no-production-contenteditable-readiness")
  })

  it("blocks composition-active commit and keeps fallback/unsupported paths explicit", () => {
    const result = runRuntimeSliceScenario()
    const compositionBlocked = result.compositionBlocked as Record<string, unknown>
    const fallback = result.fallback as Record<string, unknown>

    expect(compositionBlocked).toMatchObject({
      label: "Guarded input runtime slice: blocked composition-active",
      reason: "composition-active",
      status: "blocked",
    })
    expect(compositionBlocked.policyRequested).toMatchObject({
      command: "commit",
      reason: "composition-active",
      status: "blocked",
    })
    expect(compositionBlocked.packetRefresh).toMatchObject({
      status: "not-requested",
    })
    expect(fallback).toMatchObject({
      fallback: {
        reason: "styled-runs-need-managed-fallback",
        status: "ready",
      },
      label: "Guarded input runtime slice: fallback styled-block",
      status: "fallback",
    })
    expect(fallback.packageMutation).toMatchObject({
      status: "not-mutated",
    })
    expect(result.unsupported).toMatchObject({
      label: "Guarded input runtime slice: blocked non-text-target-cannot-open-island",
      reason: "non-text-target-cannot-open-island",
      status: "blocked",
    })
  })

  it("keeps the sandbox module dependency-clean and JSON-safe", () => {
    const source = readText("../examples/template-builder-sandbox/public/guardedInputRuntimeSlice.js")

    expect(source).toContain("createGuardedInputRuntimeSlice")
    expect(source).toContain("createHybridInputRuntimeOwnership")
    expect(source).toContain("createActiveIslandCommitBridgeSmoke")
    expect(source).toContain("text-block-island")
    expect(source).not.toContain("document.")
    expect(source).not.toContain("querySelector")
    expect(source).not.toContain("getSelection")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("FlowDocEditor")
    expect(source).not.toMatch(/from\s+["']\.\.\/\.\.\/src/)
  })

  it("documents Phase 169 and advances the roadmap", () => {
    const doc = readText("../docs/GUARDED_INPUT_RUNTIME_SLICE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 169 guarded input runtime slice 1.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase: Phase 170: Paste/Delete/Field-chip Input Slice.")
    expect(readme).toContain("Guarded input runtime slice")
    expect(readme).toContain("docs/GUARDED_INPUT_RUNTIME_SLICE.md")
    expect(ledger).toContain("| 169 | Guarded input runtime slice 1 | done |")
    expect(roadmap).toContain("## Phase 169: Guarded Input Runtime Slice 1")
    expect(roadmap).toContain("## Phase 170: Paste/Delete/Field-chip Input Slice")
    expect(roadmap).toContain("## Phase 171: Input Integration Close Audit")
    expect(roadmap).toContain("Current next step after Phase 171:")
    expect(roadmap).toContain("Phase 172: Concrete Storage Choice Gate")
    expect(doc).not.toContain("production contenteditable readiness is achieved")
    expect(doc).not.toContain("production browser readiness is achieved")
  })
})
