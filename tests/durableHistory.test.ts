import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { DocumentNode, TextBlockNode } from "../src/schema/document.js"
import {
  appendVNextAuthoringIntentHistoryResult,
  createVNextDurableHistorySnapshot,
  createVNextEditableSession,
  createVNextSelectionOnlyAuthoringHistoryRecord,
  projectVNextTextBlockInlines,
  runVNextTextTransaction,
  VNEXT_DURABLE_HISTORY_MODE,
  VNEXT_DURABLE_HISTORY_SOURCE,
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

function acceptedTypingRecords() {
  const session = createVNextEditableSession(fixtureValue("product-report-vnext-minimal.flowdoc.json"))
  const projection = projectVNextTextBlockInlines(textBlockFrom(session.document, "summary-left-text"))
  const result = runVNextTextTransaction(session.document, {
    kind: "text.insert",
    source: "user",
    position: { textBlockId: "summary-left-text", offset: projection.textLength },
    text: " updated",
    inlineId: "summary-left-text-updated",
  })

  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error(result.issues.map((issue) => issue.message).join("\n"))

  return appendVNextAuthoringIntentHistoryResult([], result)
}

function rejectedAtomicRangeResult() {
  const session = createVNextEditableSession(fixtureValue("product-report-vnext-minimal.flowdoc.json"))
  const projection = projectVNextTextBlockInlines(textBlockFrom(session.document, "title"))
  const atomic = projection.segments.find((segment) => !segment.editable)

  expect(atomic).toBeDefined()
  if (atomic == null) throw new Error("expected title to include an atomic inline field")

  return runVNextTextTransaction(session.document, {
    kind: "text.range.replace",
    source: "user",
    range: {
      textBlockId: "title",
      anchorOffset: atomic.startOffset,
      focusOffset: atomic.endOffset,
    },
    text: "Customer",
  })
}

describe("vNext durable history boundary", () => {
  it("creates a durable authoring history snapshot with undo metadata but no storage write", () => {
    const records = acceptedTypingRecords()
    const snapshot = createVNextDurableHistorySnapshot(records, {
      historyKey: "history/product-report-vnext-minimal",
      reason: "save-template",
      documentRevision: 7,
    })

    expect(snapshot).toMatchObject({
      source: VNEXT_DURABLE_HISTORY_SOURCE,
      mode: VNEXT_DURABLE_HISTORY_MODE,
      records: [{
        schemaVersion: 1,
        status: "committed",
        historyAction: "undoable",
        groupId: "authoring-group-1",
        sequence: 1,
        commandKind: "text.insert",
        targetTextBlockId: "summary-left-text",
      }],
      groups: [{
        groupId: "authoring-group-1",
        status: "committed",
        historyAction: "undoable",
        recordCount: 1,
      }],
      manifest: {
        schemaVersion: 1,
        historyKey: "history/product-report-vnext-minimal",
        reason: "save-template",
        documentRevision: 7,
        storageStatus: "not-written",
        recordCount: 1,
        redoRecordCount: 0,
        undoableRecordCount: 1,
        diagnosticRecordCount: 0,
        skippedNonDurableCount: 0,
        groupCount: 1,
        persistedState: {
          authoringHistory: true,
          package: false,
          selection: false,
          dirtyScopes: false,
          diagnostics: false,
          graph: false,
          viewport: false,
          liveLayout: false,
          exactLayout: false,
          artifacts: false,
        },
        undoRedo: {
          canUndo: true,
          canRedo: false,
          undoDepth: 1,
          redoDepth: 0,
          executionStatus: "not-run",
          replayMode: "metadata-only",
          inversePatches: "not-stored",
          fullPackageSnapshots: false,
          selectionRestore: "not-persisted",
        },
      },
    })
    expect(snapshot.records[0]).toEqual(records[0])
    expect(snapshot.records[0]).not.toBe(records[0])
    expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot)
  })

  it("skips selection-only records and reports rejected diagnostics plus redo metadata", () => {
    let records = acceptedTypingRecords()
    const rejected = rejectedAtomicRangeResult()
    expect(rejected.ok).toBe(false)
    records = appendVNextAuthoringIntentHistoryResult(records, rejected)

    const selectionOnly = createVNextSelectionOnlyAuthoringHistoryRecord({
      before: { kind: "none" },
      after: { kind: "text", textBlockId: "summary-left-text", anchorOffset: 0, focusOffset: 8 },
    })

    const snapshot = createVNextDurableHistorySnapshot([...records, selectionOnly], {
      redoRecords: [records[0], selectionOnly],
    })
    const recordsJson = JSON.stringify(snapshot.records)
    const redoJson = JSON.stringify(snapshot.redoRecords)

    expect(snapshot.manifest).toMatchObject({
      recordCount: 2,
      redoRecordCount: 1,
      undoableRecordCount: 1,
      diagnosticRecordCount: 1,
      skippedNonDurableCount: 2,
      groupCount: 2,
      storageStatus: "not-written",
      undoRedo: {
        canUndo: true,
        canRedo: true,
        undoDepth: 1,
        redoDepth: 1,
        executionStatus: "not-run",
      },
    })
    expect(snapshot.records.map((record) => record.status)).toEqual(["committed", "rejected"])
    expect(snapshot.records[1]).toMatchObject({
      status: "rejected",
      historyAction: "diagnostic-only",
      failureReason: "invalid-command",
      issues: [{ code: "atomic-inline-range", textBlockId: "title" }],
    })
    expect(snapshot.redoRecords).toHaveLength(1)
    expect(recordsJson).not.toContain('"selection"')
    expect(redoJson).not.toContain('"selection"')
    expect(JSON.stringify(snapshot)).not.toContain('"packageVersion"')
    expect(JSON.stringify(snapshot)).not.toContain('"sections"')
  })

  it("keeps the durable history boundary independent from storage, DOM, routes, and replay execution", () => {
    const sourceUrl = new URL("../src/authoring/durableHistory.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("groupVNextAuthoringIntentHistory")
    expect(source).toContain('storageStatus: "not-written"')
    expect(source).toContain('executionStatus: "not-run"')
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toContain("sessionStorage")
    expect(source).not.toContain("indexedDB")
    expect(source).not.toMatch(/\bdocument\.(querySelector|createElement|body|addEventListener)/)
    expect(source).not.toContain("HTMLElement")
    expect(source).not.toContain("window.")
    expect(source).not.toContain("/api/")
    expect(source).not.toContain("runVNextTextTransaction")
    expect(source).not.toContain("runVNextOperation")
    expect(source).not.toContain("replayVNextOperationHistoryWithRunner")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("paginateVNextDocument")
  })

  it("documents the durable history boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/DURABLE_HISTORY_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 88 implementation boundary.")
    expect(boundaryDoc).toContain("src/authoring/durableHistory.ts")
    expect(boundaryDoc).toContain("This is a durable history boundary.")
    expect(boundaryDoc).toContain("It is not a durable history store.")
    expect(boundaryDoc).toContain("executionStatus = `not-run`")
    expect(readme).toContain("Durable history boundary")
    expect(readme).toContain("docs/DURABLE_HISTORY_BOUNDARY.md")
    expect(ledger).toContain("| 88 | Durable history / undo-redo boundary | done |")
    expect(roadmap).toContain("## Phase 88: Durable History / Undo-redo Boundary")
  })
})
