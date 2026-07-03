import { readFileSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import type { DocumentNode, TextBlockNode } from "../src/schema/document.js"
import {
  appendVNextAuthoringIntentHistoryRecord,
  createVNextDurableHistorySnapshot,
  createVNextEditableSession,
  createVNextRichInlineCommitHistoryRecord,
  createVNextRichInlineReplayValidation,
  resolveVNextLiveLayoutBoundary,
  runVNextRichInlineCommit,
} from "../src/index.js"

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

function fixtureValue(name: string): unknown {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown
}

function textBlockFrom(document: DocumentNode, id: string): TextBlockNode {
  const node = document.document.sections[0].nodes[id]
  expect(node.type).toBe("text-block")
  if (node.type !== "text-block") throw new Error(`expected ${id} to be a text-block`)
  return node
}

function commitRichInlineFixture() {
  const session = createVNextEditableSession(fixtureValue("product-report-vnext-minimal.flowdoc.json"))
  const beforeTextBlock = textBlockFrom(session.document, "summary-left-text")
  const result = runVNextRichInlineCommit(session.document, {
    kind: "text-block.rich-inline.replace",
    source: "user",
    textBlockId: "summary-left-text",
    children: [
      { id: "summary-left-text-rich-1", type: "text", text: "Hello ", style: { fontWeight: "bold" } },
      { id: "summary-left-text-rich-2", type: "field-ref", key: "customer.name", label: "Customer", fallback: "{{customer.name}}" },
      { id: "summary-left-text-rich-3", type: "text", text: " world" },
    ],
  })

  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error(result.issues.map((issue) => issue.message).join("\n"))

  return { beforeTextBlock, result, session }
}

describe("vNext rich inline live/exact parity audit", () => {
  it("keeps rich inline core commits aligned with live-layout exact stale markers", () => {
    const { result } = commitRichInlineFixture()
    const liveLayout = resolveVNextLiveLayoutBoundary({
      kind: "dirty-scopes",
      dirtyScopes: [result.transaction.dirtyScope],
    })

    expect(result.transaction).toMatchObject({
      kind: "text-block.rich-inline.replace",
      targetTextBlockId: "summary-left-text",
      dirtyScope: {
        kind: "text-block",
        textBlockId: "summary-left-text",
      },
      renderInvalidation: {
        exactGenerationStale: true,
        lane: "text-content",
      },
    })
    expect(liveLayout).toMatchObject({
      kind: "layout-request",
      reason: "text-content",
      affected: {
        textBlockIds: ["summary-left-text"],
      },
      freshness: {
        liveLayout: "stale",
        exactGeneration: {
          status: "stale",
          reason: "text-content",
          finalTruth: "measured-pagination",
        },
      },
      request: {
        kind: "live-layout-request",
        reason: "text-content",
        dirtyScopes: [result.transaction.dirtyScope],
      },
    })
  })

  it("keeps sandbox rich inline commit, undo, and redo packets live/exact-stale", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      import { register } from "node:module";
      import { pathToFileURL } from "node:url";

      register("./ts-loader.mjs", pathToFileURL(process.cwd() + "/scripts/"));
      const { createTemplateBuilderMutationBridge } = await import("./src/mutationBridge.ts");
      const fixture = JSON.parse(readFileSync("../../fixtures/product-report-vnext.flowdoc.json", "utf8"));
      const bridge = createTemplateBuilderMutationBridge(fixture, {
        fixturePath: "fixtures/product-report-vnext.flowdoc.json",
      });
      const plan = {
        status: "planned",
        operationKind: "text-block.rich-inline.replace",
        targetTextBlockId: "cover-header-label",
        baseRevision: 0,
        documentRevision: 0,
        plannedInlineChildren: [
          { id: "cover-header-label-rich-1", type: "text", text: "Hello ", style: { fontWeight: "bold" } },
          { id: "cover-header-label-rich-2", type: "field-ref", key: "customer.name", label: "Customer", fallback: "{{customer.name}}" },
          { id: "cover-header-label-rich-3", type: "text", text: " world" },
        ],
      };
      const committed = bridge.commitRichInline({ plan }, { includeSnapshot: false });
      const undone = bridge.undo({ includeSnapshot: false });
      const redone = bridge.redo({ includeSnapshot: false });
      const summarize = (response) => ({
        ok: response.ok,
        action: response.packet.action,
        changedNodeIds: response.packet.changedNodeIds,
        liveLayout: response.packet.liveLayout,
      });

      console.log(JSON.stringify({
        committed: summarize(committed),
        undone: summarize(undone),
        redone: summarize(redone),
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      committed: SandboxBridgeSummary
      undone: SandboxBridgeSummary
      redone: SandboxBridgeSummary
    }

    expect(result.committed).toMatchObject({
      ok: true,
      action: "sandbox.commitRichInline",
      changedNodeIds: ["cover-header-label"],
      liveLayout: liveExactSummary(1),
    })
    expect(result.undone).toMatchObject({
      ok: true,
      action: "sandbox.undo",
      changedNodeIds: ["cover-header-label"],
      liveLayout: liveExactSummary(2),
    })
    expect(result.redone).toMatchObject({
      ok: true,
      action: "sandbox.redo",
      changedNodeIds: ["cover-header-label"],
      liveLayout: liveExactSummary(3),
    })
  }, 30_000)

  it("keeps retained rich inline history/replay facts from storing live/exact renderer artifacts", () => {
    const { beforeTextBlock, result, session } = commitRichInlineFixture()
    const historyRecord = createVNextRichInlineCommitHistoryRecord(result)
    const historyRecords = appendVNextAuthoringIntentHistoryRecord([], historyRecord)
    const durableHistory = createVNextDurableHistorySnapshot(historyRecords, {
      documentRevision: session.revisions.document + 1,
      historyKey: "history:rich-inline-live-exact",
      reason: "rich-inline-live-exact-parity-audit",
    })
    const replayValidation = createVNextRichInlineReplayValidation({
      historyRecords,
      replayPatches: [{
        afterChildren: result.command.children,
        beforeChildren: beforeTextBlock.children,
        historyRecord,
        sourceAction: "sandbox.commitRichInline",
        targetTextBlockId: "summary-left-text",
      }],
    })

    expect(durableHistory.manifest.persistedState).toMatchObject({
      authoringHistory: true,
      package: false,
      liveLayout: false,
      exactLayout: false,
      artifacts: false,
    })
    expect(replayValidation.facts.contracts).toMatchObject({
      replayPatchValidation: true,
      historyReadyFacts: true,
      storageRecord: false,
      storageWrites: false,
      backendApi: false,
      replayExecution: false,
    })
    expect(replayValidation.replayPatchValidations[0]).not.toHaveProperty("storageStatus")
    expect(replayValidation.replayPatchValidations[0]).not.toHaveProperty("replayStatus")
  })

  it("records the Phase 130 audit trail without overstating runtime scope", () => {
    const audit = readText("docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const richCommitSource = readText("src/authoring/richInlineCommit.ts")
    const durableHistorySource = readText("src/authoring/durableHistory.ts")
    const mutationBridgeSource = readText("examples/template-builder-sandbox/src/mutationBridge.ts")
    const coreBoundarySource = readText("examples/template-builder-sandbox/src/coreBoundary.ts")
    const persistenceSource = readText("src/authoring/richInlineSessionPersistence.ts")

    expect(audit).toContain("Status: Phase 130 rich inline live/exact parity audit.")
    expect(audit).toContain("## PASS")
    expect(audit).toContain("## FAIL / BLOCKER")
    expect(audit).toContain("## RISK")
    expect(audit).toContain("## UNKNOWN")
    expect(audit).toContain("No runtime behavior changed")
    expect(audit).toContain("It is not a renderer implementation.")
    expect(richCommitSource).toContain("renderInvalidation")
    expect(richCommitSource).toContain("exactGenerationStale: true")
    expect(mutationBridgeSource).toContain("rememberLiveLayoutBoundary")
    expect(mutationBridgeSource).toContain("resolveVNextLiveLayoutBoundary")
    expect(coreBoundarySource).toContain("exactGenerationStale")
    expect(durableHistorySource).toContain("liveLayout: false")
    expect(durableHistorySource).toContain("exactLayout: false")
    expect(durableHistorySource).toContain("artifacts: false")
    expect(persistenceSource).toContain("storageRecord: false")
    expect(persistenceSource).toContain("replayExecution: false")
    expect(persistenceSource).toContain("selectionRestore: false")
    expect(readme).toContain("docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md")
    expect(readme).toContain("rich inline live/exact parity audit")
    expect(ledger).toContain("| 130 | Rich inline live/exact parity audit | done |")
    expect(roadmap).toContain("## Phase 130: Rich Inline Live/Exact Parity Audit")
  })
})

interface SandboxBridgeSummary {
  ok: boolean
  action: string
  changedNodeIds: string[]
  liveLayout: {
    requestCount: number
    exactGenerationStale: boolean
    lastResult: {
      kind: string
      reason: string
      dirtyScopeCount: number
      affected: {
        textBlockIds: string[]
      }
      freshness: {
        liveLayout: string
        exactGeneration: {
          status: string
          finalTruth: string
        }
      }
    }
  }
}

function liveExactSummary(requestCount: number) {
  return {
    requestCount,
    exactGenerationStale: true,
    lastResult: {
      kind: "layout-request",
      reason: "text-content",
      dirtyScopeCount: 1,
      affected: {
        textBlockIds: ["cover-header-label"],
      },
      freshness: {
        liveLayout: "stale",
        exactGeneration: {
          status: "stale",
          finalTruth: "measured-pagination",
        },
      },
    },
  }
}
