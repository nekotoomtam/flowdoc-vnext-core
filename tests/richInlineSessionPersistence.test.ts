import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { DocumentNode, TextBlockNode } from "../src/schema/document.js"
import {
  appendVNextAuthoringIntentHistoryRecord,
  createVNextEditableSession,
  createVNextRichInlineCommitHistoryRecord,
  createVNextRichInlineSessionPersistenceRecord,
  runVNextRichInlineCommit,
  serializeFlowDocPackageV2DocumentVNext,
  VNEXT_RICH_INLINE_SESSION_PERSISTENCE_MODE,
  VNEXT_RICH_INLINE_SESSION_PERSISTENCE_SOURCE,
} from "../src/index.js"

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

function committedRichInlineFixture() {
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

  const historyRecord = createVNextRichInlineCommitHistoryRecord(result)
  const historyRecords = appendVNextAuthoringIntentHistoryRecord([], historyRecord)
  const packageSnapshot = serializeFlowDocPackageV2DocumentVNext({
    ...session.package,
    document: result.document,
  })
  const mutatedSession = {
    ...createVNextEditableSession(packageSnapshot),
    revisions: {
      document: 1,
      dirtyScopes: 1,
      selection: 0,
    },
    dirtyScopes: new Set(["text-block:summary-left-text"]),
  }

  return {
    beforeTextBlock,
    historyRecords,
    mutatedSession,
    result,
  }
}

describe("vNext rich inline session persistence boundary", () => {
  it("creates a rich inline session persistence record without writing storage", () => {
    const { beforeTextBlock, historyRecords, mutatedSession, result } = committedRichInlineFixture()
    const record = createVNextRichInlineSessionPersistenceRecord(mutatedSession, {
      historyKey: "history/product-report/rich-inline",
      historyRecords,
      reason: "save-rich-inline-session",
      replayPatches: [{
        afterChildren: result.command.children,
        beforeChildren: beforeTextBlock.children,
        historyRecord: historyRecords[0],
        sourceAction: "sandbox.commitRichInline",
        targetTextBlockId: "summary-left-text",
      }],
      storageKey: "template/product-report/rich-inline",
    })

    expect(record).toMatchObject({
      source: VNEXT_RICH_INLINE_SESSION_PERSISTENCE_SOURCE,
      mode: VNEXT_RICH_INLINE_SESSION_PERSISTENCE_MODE,
      manifest: {
        schemaVersion: 1,
        documentRevision: 1,
        storageKey: "template/product-report/rich-inline",
        historyKey: "history/product-report/rich-inline",
        reason: "save-rich-inline-session",
        storageStatus: "not-written",
        packageStorageStatus: "not-written",
        historyStorageStatus: "not-written",
        richHistoryRecordCount: 1,
        replayPatchCount: 1,
        invalidReplayPatchCount: 0,
        persistedState: {
          package: true,
          authoringHistory: true,
          richReplayPatches: true,
          selection: false,
          dirtyScopes: false,
          diagnostics: false,
          graph: false,
          viewport: false,
          liveLayout: false,
          exactLayout: false,
          artifacts: false,
        },
        replay: {
          executionStatus: "not-run",
          replayMode: "rich-inline-before-after-children",
          conflictResolution: "not-run",
          selectionRestore: "not-persisted",
          storageAdapter: "not-bound",
          backendApi: "not-called",
        },
      },
      sessionStorage: {
        manifest: {
          persistedState: {
            package: true,
            authoringHistory: false,
          },
          storageStatus: "not-written",
        },
      },
      durableHistory: {
        manifest: {
          persistedState: {
            authoringHistory: true,
            package: false,
          },
          storageStatus: "not-written",
          undoRedo: {
            executionStatus: "not-run",
            replayMode: "metadata-only",
          },
        },
      },
      replayPatches: [{
        schemaVersion: 1,
        commandKind: "text-block.rich-inline.replace",
        groupId: "authoring-group-1",
        sourceAction: "sandbox.commitRichInline",
        targetTextBlockId: "summary-left-text",
        historySequence: 1,
        historySummary: "commit rich inline replacement in summary-left-text",
        beforeInlineCount: beforeTextBlock.children.length,
        afterInlineCount: 3,
        keyHistory: {
          fieldKeys: ["customer.name"],
          status: "field-ref-usage-recorded",
        },
        replayStatus: "not-run",
        storageStatus: "not-written",
        validationStatus: "valid",
        issues: [],
      }],
    })
    expect(record.replayPatches[0].beforeChildren).toEqual(beforeTextBlock.children)
    expect(record.replayPatches[0].beforeChildren).not.toBe(beforeTextBlock.children)
    expect(record.replayPatches[0].afterChildren).toEqual(result.command.children)
    expect(JSON.parse(JSON.stringify(record))).toEqual(record)
  })

  it("reports invalid replay patches without running replay", () => {
    const { beforeTextBlock, historyRecords, mutatedSession } = committedRichInlineFixture()
    const record = createVNextRichInlineSessionPersistenceRecord(mutatedSession, {
      historyRecords,
      replayPatches: [{
        afterChildren: [
          { id: "dup", type: "text", text: "A" },
          { id: "dup", type: "field-ref", key: "customer.name" },
        ],
        beforeChildren: beforeTextBlock.children,
        historyRecord: historyRecords[0],
        targetTextBlockId: "summary-left-text",
      }],
    })

    expect(record.manifest).toMatchObject({
      replayPatchCount: 1,
      invalidReplayPatchCount: 1,
      replay: {
        executionStatus: "not-run",
        replayMode: "rich-inline-before-after-children",
      },
    })
    expect(record.replayPatches[0]).toMatchObject({
      validationStatus: "invalid",
      replayStatus: "not-run",
      issues: [
        {
          code: "duplicate-inline-id",
          path: "afterChildren[1].id",
        },
      ],
    })
  })

  it("keeps the rich inline session persistence boundary independent from adapters, DOM, routes, and replay execution", () => {
    const sourceUrl = new URL("../src/authoring/richInlineSessionPersistence.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("createVNextSessionStorageRecord")
    expect(source).toContain("createVNextDurableHistorySnapshot")
    expect(source).toContain("rich-inline-before-after-children")
    expect(source).toContain('storageStatus: "not-written"')
    expect(source).toContain('executionStatus: "not-run"')
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toMatch(/\bwindow\.sessionStorage\b|\bsessionStorage\.(getItem|setItem|removeItem|clear)\b/)
    expect(source).not.toContain("indexedDB")
    expect(source).not.toMatch(/\bdocument\.(querySelector|createElement|body|addEventListener)/)
    expect(source).not.toContain("HTMLElement")
    expect(source).not.toContain("window.")
    expect(source).not.toContain("/api/")
    expect(source).not.toContain("runVNextRichInlineCommit")
    expect(source).not.toContain("runVNextTextTransaction")
    expect(source).not.toContain("runVNextOperation")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("paginateVNextDocument")
  })

  it("documents the rich inline session persistence boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 129 rich inline persistence/session boundary.")
    expect(boundaryDoc).toContain("src/authoring/richInlineSessionPersistence.ts")
    expect(boundaryDoc).toContain("This is a rich inline session persistence boundary.")
    expect(boundaryDoc).toContain("It is not a storage adapter.")
    expect(readme).toContain("TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md")
    expect(ledger).toContain("| 129 | Rich inline persistence/session boundary | done |")
    expect(roadmap).toContain("## Phase 129: Rich Inline Persistence / Session Boundary")
  })
})
