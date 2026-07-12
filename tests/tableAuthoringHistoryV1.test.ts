import { describe, expect, it } from "vitest"
import {
  createVNextTableAuthoringHistoryRecordV1,
  createVNextGuardedTableAuthoringHistoryRecordV1,
  commitGuardedVNextTableAuthoringV1,
  previewVNextTableAuthoringV1,
  replayVNextTableAuthoringHistoryV1,
  runVNextTableAuthoringV1,
  type VNextTableAuthoringBundleV1,
} from "../src/index.js"
import {
  createTableAuthoringBundle,
  createTableAuthoringRequest,
} from "./helpers/tableAuthoringV1Fixture.js"

function bundleAfter(bundle: VNextTableAuthoringBundleV1, result: any): VNextTableAuthoringBundleV1 {
  return { ...bundle, document: result.document, definition: result.definition }
}

describe("Table v4 authoring history", () => {
  it("links guarded committed history to its reversible change set fingerprint", () => {
    const initial = createTableAuthoringBundle(2)
    const request = createTableAuthoringRequest(initial, {
      kind: "table.row.delete.static", tableId: "table", rowSourceId: "source-0",
    })
    const budgets = {
      maximumRowTemplateVisits: 10,
      maximumAffectedNodeCount: 100,
      maximumRemovedSubtreeNodeCount: 100,
    }
    const preview = previewVNextTableAuthoringV1({ request, budgets })
    if (preview.status !== "ready" || preview.confirmation == null) throw new Error("preview fixture blocked")
    const committed = commitGuardedVNextTableAuthoringV1({
      request, budgets, confirmation: preview.confirmation,
    })
    if (committed.status !== "committed") throw new Error("guarded fixture blocked")
    expect(createVNextGuardedTableAuthoringHistoryRecordV1(request, committed)).toMatchObject({
      status: "committed",
      operation: committed.operation,
      changeSetFingerprint: committed.changeSet.fingerprint,
    })
  })

  it("records and deterministically replays committed commands with rejected records skipped", () => {
    const initial = createTableAuthoringBundle(2)
    const insertRequest = createTableAuthoringRequest(initial, {
      kind: "table.row.insert.static", tableId: "table", index: 2,
      rowId: "row-new", rowSourceId: "source-new", rowTemplateId: "template-new",
      cellIds: ["cell-new-left", "cell-new-right"], role: "body", breakPolicy: "allow",
    })
    const inserted = runVNextTableAuthoringV1(insertRequest)
    if (inserted.status !== "committed") throw new Error("insert fixture blocked")
    const insertRecord = createVNextTableAuthoringHistoryRecordV1(insertRequest, inserted)

    const afterInsert = bundleAfter(initial, inserted)
    const resizeRequest = createTableAuthoringRequest(afterInsert, {
      kind: "table.column.resize", tableId: "table", columnId: "left", widthShare: 60,
    })
    const resized = runVNextTableAuthoringV1(resizeRequest)
    if (resized.status !== "committed") throw new Error("resize fixture blocked")
    const resizeRecord = createVNextTableAuthoringHistoryRecordV1(resizeRequest, resized)

    const afterResize = bundleAfter(afterInsert, resized)
    const rejectedRequest = createTableAuthoringRequest(afterResize, {
      kind: "table.column.resize", tableId: "table", columnId: "left", widthShare: 60,
    })
    const rejected = runVNextTableAuthoringV1(rejectedRequest)
    if (rejected.status !== "blocked") throw new Error("rejected fixture committed")
    const rejectedRecord = createVNextTableAuthoringHistoryRecordV1(rejectedRequest, rejected)

    expect(insertRecord).toMatchObject({ status: "committed", operation: { kind: "table.row.insert.static" } })
    expect(rejectedRecord).toMatchObject({ status: "rejected", failureReason: "no-op", operation: null })
    const replayed = replayVNextTableAuthoringHistoryV1({
      bundle: initial, records: [insertRecord, resizeRecord, rejectedRecord],
    })
    expect(replayed.status).toBe("replayed")
    if (replayed.status !== "replayed") throw new Error(replayed.issues.map((item) => item.message).join("\n"))
    expect(replayed.replayedCount).toBe(2)
    expect(replayed.skippedRejectedCount).toBe(1)
    expect(replayed.document).toEqual(resized.document)
    expect(replayed.definition).toEqual(resized.definition)
    expect(replayed.contracts).toEqual({ persistence: "not-run", editorStateMutation: false })
    expect(JSON.parse(JSON.stringify(replayed))).toEqual(replayed)
  })

  it("blocks before/after fingerprint drift and exact-draft mismatch", () => {
    const initial = createTableAuthoringBundle(2)
    const request = createTableAuthoringRequest(initial, {
      kind: "table.column.resize", tableId: "table", columnId: "left", widthShare: 60,
    })
    const result = runVNextTableAuthoringV1(request)
    if (result.status !== "committed") throw new Error("fixture blocked")
    const record = createVNextTableAuthoringHistoryRecordV1(request, result)

    const drifted = JSON.parse(JSON.stringify(initial)) as VNextTableAuthoringBundleV1
    const table = drifted.document.document.sections[0].nodes.table
    if (table.type !== "table") throw new Error("fixture table")
    table.props.align = "center"
    expect(replayVNextTableAuthoringHistoryV1({ bundle: drifted, records: [record] })).toMatchObject({
      status: "blocked", failedRecordIndex: 0,
      issues: [expect.objectContaining({ code: "history-before-fingerprint-mismatch" })],
    })

    const tampered = JSON.parse(JSON.stringify(record))
    tampered.operation.fingerprints.bundleAfter = "tampered"
    expect(replayVNextTableAuthoringHistoryV1({ bundle: initial, records: [tampered] })).toMatchObject({
      status: "blocked", issues: [expect.objectContaining({ code: "history-after-fingerprint-mismatch" })],
    })

    const otherDraft = JSON.parse(JSON.stringify(record))
    otherDraft.artifact.revision += 1
    expect(replayVNextTableAuthoringHistoryV1({ bundle: initial, records: [otherDraft] })).toMatchObject({
      status: "blocked", issues: [expect.objectContaining({ code: "history-artifact-mismatch" })],
    })
  })
})
