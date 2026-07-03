import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { DocumentNode, TextBlockNode } from "../src/schema/document.js"
import {
  appendVNextAuthoringIntentHistoryRecord,
  createVNextEditableSession,
  createVNextRichInlineCommitHistoryRecord,
  createVNextRichInlineReplayValidation,
  runVNextRichInlineCommit,
  VNEXT_RICH_INLINE_REPLAY_VALIDATION_MODE,
  VNEXT_RICH_INLINE_REPLAY_VALIDATION_SOURCE,
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
  const replayPatch = {
    afterChildren: result.command.children,
    beforeChildren: beforeTextBlock.children,
    historyRecord: historyRecords[0],
    sourceAction: "sandbox.commitRichInline",
    targetTextBlockId: "summary-left-text",
  }

  return {
    beforeTextBlock,
    historyRecords,
    replayPatch,
    result,
  }
}

describe("vNext rich inline session persistence historical boundary", () => {
  it("now proves retained replay validation facts without persistence ownership", () => {
    const { beforeTextBlock, historyRecords, replayPatch, result } = committedRichInlineFixture()
    const validation = createVNextRichInlineReplayValidation({
      historyRecords,
      replayPatches: [replayPatch],
    })

    expect(validation).toMatchObject({
      source: VNEXT_RICH_INLINE_REPLAY_VALIDATION_SOURCE,
      mode: VNEXT_RICH_INLINE_REPLAY_VALIDATION_MODE,
      facts: {
        schemaVersion: 1,
        commandKind: "text-block.rich-inline.replace",
        historyReadyRecordCount: 1,
        richHistoryRecordCount: 1,
        replayPatchCount: 1,
        invalidReplayPatchCount: 0,
        fieldKeys: ["customer.name"],
        contracts: {
          replayPatchValidation: true,
          historyReadyFacts: true,
          beforeAfterChildrenSnapshots: true,
          storageRecord: false,
          storageWrites: false,
          routeDispatch: false,
          backendApi: false,
          replayExecution: false,
          conflictResolution: false,
          selectionRestore: false,
        },
      },
      replayPatchValidations: [{
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
        validationStatus: "valid",
        issues: [],
      }],
    })
    expect(validation.replayPatchValidations[0].beforeChildren).toEqual(beforeTextBlock.children)
    expect(validation.replayPatchValidations[0].beforeChildren).not.toBe(beforeTextBlock.children)
    expect(validation.replayPatchValidations[0].afterChildren).toEqual(result.command.children)
    expect(Object.prototype.hasOwnProperty.call(validation.replayPatchValidations[0], "storageStatus")).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(validation.replayPatchValidations[0], "replayStatus")).toBe(false)
    expect(JSON.stringify(validation)).not.toContain("storageStatus")
    expect(JSON.stringify(validation)).not.toContain("storageKey")
    expect(JSON.parse(JSON.stringify(validation))).toEqual(validation)
  })

  it("reports invalid retained replay validation without running replay or storage", () => {
    const { beforeTextBlock, historyRecords } = committedRichInlineFixture()
    const validation = createVNextRichInlineReplayValidation({
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

    expect(validation.facts).toMatchObject({
      replayPatchCount: 1,
      invalidReplayPatchCount: 1,
      fieldKeys: ["customer.name"],
      contracts: {
        replayExecution: false,
        storageWrites: false,
        routeDispatch: false,
        backendApi: false,
      },
    })
    expect(validation.replayPatchValidations[0]).toMatchObject({
      validationStatus: "invalid",
      issues: [
        {
          code: "duplicate-inline-id",
          path: "afterChildren[1].id",
        },
      ],
    })
    expect(Object.prototype.hasOwnProperty.call(validation.replayPatchValidations[0], "storageStatus")).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(validation.replayPatchValidations[0], "replayStatus")).toBe(false)
  })

  it("keeps the retained replay validation helper independent from adapters, DOM, routes, and replay execution", () => {
    const sourceUrl = new URL("../src/authoring/richInlineSessionPersistence.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")
    const validationStart = source.indexOf("export function createVNextRichInlineReplayValidation")
    const persistenceStart = source.indexOf("export function createVNextRichInlineSessionPersistenceRecord")
    const validationSource = source.slice(validationStart, persistenceStart)

    expect(validationSource).toContain("replayPatchValidation: true")
    expect(validationSource).toContain("historyReadyFacts: true")
    expect(validationSource).toContain("storageRecord: false")
    expect(validationSource).toContain("storageWrites: false")
    expect(validationSource).not.toContain("createVNextSessionStorageRecord")
    expect(validationSource).not.toContain("createVNextDurableHistorySnapshot")
    expect(validationSource).not.toContain("storageStatus")
    expect(validationSource).not.toContain("storageKey")
    expect(validationSource).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(validationSource).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(validationSource).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(validationSource).not.toContain("fetch(")
    expect(validationSource).not.toContain("localStorage")
    expect(validationSource).not.toMatch(/\bwindow\.sessionStorage\b|\bsessionStorage\.(getItem|setItem|removeItem|clear)\b/)
    expect(validationSource).not.toContain("indexedDB")
    expect(validationSource).not.toMatch(/\bdocument\.(querySelector|createElement|body|addEventListener)/)
    expect(validationSource).not.toContain("HTMLElement")
    expect(validationSource).not.toContain("window.")
    expect(validationSource).not.toContain("/api/")
    expect(validationSource).not.toContain("runVNextRichInlineCommit")
    expect(validationSource).not.toContain("runVNextTextTransaction")
    expect(validationSource).not.toContain("runVNextOperation")
    expect(validationSource).not.toContain("runVNextLayoutPipeline")
    expect(validationSource).not.toContain("paginateVNextDocument")
  })

  it("documents the retained test rewrite beside the historical rich inline persistence boundary", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md")
    const retainedRewrite = readText("../docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 129 rich inline persistence/session boundary.")
    expect(boundaryDoc).toContain("src/authoring/richInlineSessionPersistence.ts")
    expect(boundaryDoc).toContain("This is a rich inline session persistence boundary.")
    expect(boundaryDoc).toContain("It is not a storage adapter.")
    expect(retainedRewrite).toContain("tests/richInlineSessionPersistence.test.ts")
    expect(retainedRewrite).toContain("createVNextRichInlineReplayValidation(...)")
    expect(readme).toContain("TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md")
    expect(readme).toContain("Core Non-Route Retained-Test Rewrite")
    expect(ledger).toContain("| 129 | Rich inline persistence/session boundary | done |")
    expect(ledger).toContain("| 238 | Core non-route retained-test rewrite | done |")
    expect(roadmap).toContain("## Phase 129: Rich Inline Persistence / Session Boundary")
  })
})
