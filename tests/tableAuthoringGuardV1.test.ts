import { describe, expect, it } from "vitest"
import {
  commitGuardedVNextTableAuthoringV1,
  previewVNextTableAuthoringV1,
  type VNextTableAuthoringExecutionBudgetsV1,
} from "../src/index.js"
import {
  createTableAuthoringBundle,
  createTableAuthoringRequest,
} from "./helpers/tableAuthoringV1Fixture.js"

const budgets: VNextTableAuthoringExecutionBudgetsV1 = {
  maximumRowTemplateVisits: 10,
  maximumAffectedNodeCount: 100,
  maximumRemovedSubtreeNodeCount: 100,
}

describe("Table v4 authoring guard", () => {
  it("previews exact destructive impact without exposing proposed mutable artifacts", () => {
    const bundle = createTableAuthoringBundle(2)
    const request = createTableAuthoringRequest(bundle, {
      kind: "table.row.delete.static", tableId: "table", rowSourceId: "source-0",
    })
    const before = JSON.stringify(request)
    const preview = previewVNextTableAuthoringV1({ request, budgets })

    expect(preview.status).toBe("ready")
    if (preview.status !== "ready") throw new Error(preview.issues.map((item) => item.message).join("\n"))
    expect(preview).toMatchObject({
      confirmationRequired: true,
      impact: {
        destructive: true, removedSubtreeNodeCount: 3,
        work: { rowTemplateVisitCount: 1, cellVisitCount: 2, subtreeNodeVisitCount: 3 },
      },
      changeSetSummary: { changedNodeCount: 4, changedRowTemplateCount: 1 },
      contracts: { kernelExecuted: true, commitApplied: false, persistence: "not-run" },
    })
    expect(preview.confirmation).not.toBeNull()
    expect("document" in preview).toBe(false)
    expect("definition" in preview).toBe(false)
    expect("changeSet" in preview).toBe(false)
    expect(JSON.stringify(request)).toBe(before)
  })

  it("requires the exact current preview confirmation for destructive commits", () => {
    const bundle = createTableAuthoringBundle(2)
    const request = createTableAuthoringRequest(bundle, {
      kind: "table.row.delete.static", tableId: "table", rowSourceId: "source-0",
    })
    const preview = previewVNextTableAuthoringV1({ request, budgets })
    if (preview.status !== "ready" || preview.confirmation == null) throw new Error("preview fixture blocked")

    expect(commitGuardedVNextTableAuthoringV1({ request, budgets })).toMatchObject({
      status: "blocked", reason: "confirmation-required",
      document: bundle.document, definition: bundle.definition,
    })
    const stale = JSON.parse(JSON.stringify(preview.confirmation))
    stale.budgets.maximumAffectedNodeCount -= 1
    expect(commitGuardedVNextTableAuthoringV1({ request, budgets, confirmation: stale })).toMatchObject({
      status: "blocked", reason: "stale-confirmation",
      document: bundle.document, definition: bundle.definition,
    })
    const committed = commitGuardedVNextTableAuthoringV1({
      request, budgets, confirmation: preview.confirmation,
    })
    expect(committed).toMatchObject({
      status: "committed", confirmationConsumed: true,
      changeSet: { fingerprint: preview.changeSetFingerprint },
    })
  })

  it("commits non-destructive commands without confirmation and rejects stray packets", () => {
    const bundle = createTableAuthoringBundle(2)
    const resizeRequest = createTableAuthoringRequest(bundle, {
      kind: "table.column.resize", tableId: "table", columnId: "left", widthShare: 60,
    })
    const preview = previewVNextTableAuthoringV1({ request: resizeRequest, budgets })
    expect(preview).toMatchObject({ status: "ready", confirmationRequired: false, confirmation: null })
    expect(commitGuardedVNextTableAuthoringV1({ request: resizeRequest, budgets })).toMatchObject({
      status: "committed", confirmationConsumed: false,
    })

    const deleteRequest = createTableAuthoringRequest(bundle, {
      kind: "table.row.delete.static", tableId: "table", rowSourceId: "source-0",
    })
    const deletePreview = previewVNextTableAuthoringV1({ request: deleteRequest, budgets })
    if (deletePreview.status !== "ready" || deletePreview.confirmation == null) throw new Error("delete fixture blocked")
    expect(commitGuardedVNextTableAuthoringV1({
      request: resizeRequest, budgets, confirmation: deletePreview.confirmation,
    })).toMatchObject({ status: "blocked", reason: "unexpected-confirmation" })
  })

  it("blocks invalid and exceeded budgets without returning proposed artifacts", () => {
    const bundle = createTableAuthoringBundle(2)
    const request = createTableAuthoringRequest(bundle, {
      kind: "table.row.delete.static", tableId: "table", rowSourceId: "source-0",
    })
    expect(previewVNextTableAuthoringV1({
      request, budgets: { ...budgets, maximumAffectedNodeCount: 0 },
    })).toMatchObject({ status: "blocked", reason: "invalid-budget" })
    expect(previewVNextTableAuthoringV1({
      request, budgets: { ...budgets, maximumRemovedSubtreeNodeCount: 2 },
    })).toMatchObject({
      status: "blocked", reason: "execution-budget-exceeded",
      issues: [expect.objectContaining({ code: "removed-subtree-budget-exceeded" })],
    })
  })
})
