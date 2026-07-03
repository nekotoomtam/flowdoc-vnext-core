import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { createVNextRichInlineSessionPersistenceRecord } from "../src/authoring/richInlineSessionPersistence.js"
import type { DocumentNode, TextBlockNode } from "../src/schema/document.js"
import {
  appendVNextAuthoringIntentHistoryRecord,
  createVNextEditableSession,
  createVNextRichInlineCommitHistoryRecord,
  createVNextRichInlineReplayPatchRecord,
  createVNextRichInlineReplayPatchValidation,
  createVNextRichInlineReplayValidation,
  runVNextRichInlineCommit,
  serializeFlowDocPackageV2DocumentVNext,
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
    mutatedSession,
    replayPatch,
    result,
  }
}

describe("vNext rich inline replay validation retained contract", () => {
  it("creates retained replay validation facts without storage-shaped patch fields", () => {
    const { historyRecords, replayPatch, result } = committedRichInlineFixture()
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
        afterInlineCount: result.command.children.length,
        keyHistory: {
          fieldKeys: ["customer.name"],
          status: "field-ref-usage-recorded",
        },
        validationStatus: "valid",
        issues: [],
      }],
    })
    expect(validation.replayPatchValidations[0].afterChildren).toEqual(result.command.children)
    expect(Object.prototype.hasOwnProperty.call(validation.replayPatchValidations[0], "storageStatus")).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(validation.replayPatchValidations[0], "replayStatus")).toBe(false)
    expect(JSON.stringify(validation)).not.toContain("storageStatus")
    expect(JSON.stringify(validation)).not.toContain("storageKey")
  })

  it("reports invalid replay patch validation without running replay or storage", () => {
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

  it("keeps compatibility replay records and persistence records composed from retained validation", () => {
    const { historyRecords, mutatedSession, replayPatch } = committedRichInlineFixture()
    const retainedPatch = createVNextRichInlineReplayPatchValidation(replayPatch)
    const compatibilityPatch = createVNextRichInlineReplayPatchRecord(replayPatch)
    const validation = createVNextRichInlineReplayValidation({
      historyRecords,
      replayPatches: [replayPatch],
    })
    const persistence = createVNextRichInlineSessionPersistenceRecord(mutatedSession, {
      historyRecords,
      replayPatches: [replayPatch],
    })

    expect(compatibilityPatch).toMatchObject({
      ...retainedPatch,
      replayStatus: "not-run",
      storageStatus: "not-written",
    })
    expect(persistence.replayPatches[0]).toMatchObject({
      ...validation.replayPatchValidations[0],
      replayStatus: "not-run",
      storageStatus: "not-written",
    })
    expect(persistence.manifest).toMatchObject({
      richHistoryRecordCount: validation.facts.richHistoryRecordCount,
      replayPatchCount: validation.facts.replayPatchCount,
      invalidReplayPatchCount: validation.facts.invalidReplayPatchCount,
    })
  })

  it("keeps retained replay validation independent from storage, routes, DOM, and replay execution", () => {
    const source = readFileSync(new URL("../src/authoring/richInlineSessionPersistence.ts", import.meta.url), "utf8")
    const patchStart = source.indexOf("export function createVNextRichInlineReplayPatchValidation")
    const patchEnd = source.indexOf("function replayPatchRecordFromValidation")
    const validationStart = source.indexOf("export function createVNextRichInlineReplayValidation")
    const persistenceStart = source.indexOf("export function createVNextRichInlineSessionPersistenceRecord")
    const patchSource = source.slice(patchStart, patchEnd)
    const validationSource = source.slice(validationStart, persistenceStart)

    expect(patchSource).toContain('validateChildren("beforeChildren"')
    expect(patchSource).not.toContain("storageStatus")
    expect(patchSource).not.toContain("replayStatus")
    expect(validationSource).toContain("replayPatchValidation: true")
    expect(validationSource).toContain("historyReadyFacts: true")
    expect(validationSource).toContain("storageWrites: false")
    expect(validationSource).not.toContain("createVNextSessionStorageRecord")
    expect(validationSource).not.toContain("createVNextDurableHistorySnapshot")
    expect(validationSource).not.toContain("storageStatus")
    expect(validationSource).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(validationSource).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(validationSource).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(validationSource).not.toContain("fetch(")
    expect(validationSource).not.toContain("/api/")
    expect(validationSource).not.toContain("localStorage")
    expect(validationSource).not.toMatch(/\bwindow\.sessionStorage\b|\bsessionStorage\.(getItem|setItem|removeItem|clear)\b/)
    expect(validationSource).not.toContain("indexedDB")
    expect(validationSource).not.toMatch(/\bdocument\.(querySelector|createElement|body|addEventListener)/)
    expect(validationSource).not.toContain("HTMLElement")
    expect(validationSource).not.toContain("window.")
    expect(validationSource).not.toContain("runVNextRichInlineCommit")
    expect(validationSource).not.toContain("runVNextTextTransaction")
    expect(validationSource).not.toContain("runVNextOperation")
    expect(validationSource).not.toContain("runVNextLayoutPipeline")
    expect(validationSource).not.toContain("paginateVNextDocument")
  })
})
