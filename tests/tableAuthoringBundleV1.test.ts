import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  assessVNextTableAuthoringBundleV1,
  type VNextStructurePolicyNodeAction,
  type VNextTableAuthoringBundleV1,
} from "../src/index.js"

const actions: VNextStructurePolicyNodeAction[] = [
  "table.row.insert", "table.row.delete", "table.row.reorder",
  "table.column.insert", "table.column.delete", "table.column.resize",
  "table.cell.vertical-align.patch",
]

function bundle(): VNextTableAuthoringBundleV1 {
  const pack = JSON.parse(readFileSync(
    new URL("../fixtures/product-report-v4-migrated-minimal.flowdoc.json", import.meta.url), "utf8",
  ))
  const artifact = {
    contractVersion: 1 as const, kind: "structure-definition-draft" as const,
    structureId: "product-report", draftId: "draft-1", revision: 4,
  }
  return {
    contractVersion: 1,
    kind: "table-authoring-bundle",
    artifact,
    document: pack.document,
    definition: {
      contractVersion: 1, kind: "table-definition", tableDefinitionId: "detail-definition",
      owner: { kind: "structure-draft", ref: {
        structureId: artifact.structureId, draftId: artifact.draftId, revision: artifact.revision,
      } },
      tableId: "detail-table", headerPolicy: "repeat-leading-headers",
      columns: [
        { columnId: "metric", widthShare: 50 },
        { columnId: "value", widthShare: 50 },
      ],
      rowSources: [{
        kind: "static-row", rowSourceId: "header-source",
        rowTemplateId: "header-template", role: "header",
      }],
      rowTemplates: {
        "header-template": {
          rowTemplateId: "header-template", sourceRowId: "detail-header-row",
          breakPolicy: "strict-keep",
          cells: [
            { cellId: "detail-cell-a", columnStart: 0, colSpan: 1, rowSpan: 1 },
            { cellId: "detail-cell-b", columnStart: 1, colSpan: 1, rowSpan: 1 },
          ],
        },
      },
    },
    policySet: {
      contractVersion: 1, kind: "structure-policy-set", policySetId: "draft-policy",
      owner: { kind: "structure-definition-draft", ref: {
        structureId: artifact.structureId, draftId: artifact.draftId, revision: artifact.revision,
      } },
      defaultPolicyKey: "default",
      policies: { default: { key: "default", nodeActions: [...actions] } },
      nodeBindings: {},
    },
    sessionAllowedActions: [...actions],
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("Table v4 authoring bundle readiness", () => {
  it("accepts one exact draft-owned span-one document/definition bundle", () => {
    const input = bundle()
    const before = JSON.stringify(input)
    const first = assessVNextTableAuthoringBundleV1(input)
    const second = assessVNextTableAuthoringBundleV1(input)

    expect(first.status).toBe("ready")
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    if (first.status !== "ready") throw new Error(first.issues.map((item) => item.message).join("\n"))
    expect(first.bundle).toMatchObject({
      sectionId: "section-cover", tableId: "detail-table", tablePolicyKey: "default",
      capabilities: actions.map((action) => ({ action, allowed: true, policyKey: "default", denials: [] })),
      unsupportedCapabilities: expect.arrayContaining([
        { capability: "table.cells.merge", allowed: false, reason: "canonical-colspan-integration-required" },
        { capability: "collection-source.delete", allowed: false, reason: "field-binding-contract-edit-required" },
        { capability: "table.row-span", allowed: false, reason: "row-group-synchronization-v2-required" },
      ]),
    })
    expect(first.work).toEqual({
      sectionVisitCount: 1, rowTemplateVisitCount: 1, cellVisitCount: 2, capabilityCheckCount: 7,
    })
    expect(JSON.stringify(input)).toBe(before)
  })

  it("reports policy and session denials independently without blocking a valid bundle", () => {
    const input = bundle()
    input.policySet.policies.default.nodeActions = ["table.row.insert"]
    input.sessionAllowedActions = ["table.row.delete"]
    const result = assessVNextTableAuthoringBundleV1(input)

    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new Error("bundle unexpectedly blocked")
    expect(result.bundle.capabilities).toEqual(expect.arrayContaining([
      expect.objectContaining({
        action: "table.row.insert", allowed: false,
        denials: [expect.objectContaining({ code: "session-permission-denied", layer: "session" })],
      }),
      expect.objectContaining({
        action: "table.row.delete", allowed: false,
        denials: [expect.objectContaining({ code: "structure-policy-denied", layer: "structure" })],
      }),
      expect.objectContaining({
        action: "table.column.resize", allowed: false,
        denials: expect.arrayContaining([
          expect.objectContaining({ code: "structure-policy-denied" }),
          expect.objectContaining({ code: "session-permission-denied" }),
        ]),
      }),
    ]))
  })

  it("blocks owner, span, row/cell mapping, and header drift all-or-nothing", () => {
    const owner = bundle()
    if (owner.definition.owner.kind !== "structure-draft") throw new Error("fixture owner")
    owner.definition.owner.ref.revision += 1
    expect(assessVNextTableAuthoringBundleV1(owner)).toMatchObject({
      status: "blocked", bundle: null,
      issues: [expect.objectContaining({ code: "definition-owner-mismatch" })],
    })

    const span = bundle()
    span.definition.rowTemplates["header-template"].cells = [{
      cellId: "detail-cell-a", columnStart: 0, colSpan: 2, rowSpan: 1,
    }]
    expect(assessVNextTableAuthoringBundleV1(span)).toMatchObject({
      status: "blocked", issues: expect.arrayContaining([
        expect.objectContaining({ code: "span-profile-unsupported" }),
        expect.objectContaining({ code: "source-row-cell-map-mismatch" }),
      ]),
    })

    const order = clone(bundle())
    const section = order.document.document.sections[0]
    const row = section.nodes["detail-header-row"]
    const table = section.nodes["detail-table"]
    if (row?.type !== "table-row" || table?.type !== "table") throw new Error("fixture graph")
    row.cellIds.reverse()
    table.props.repeatHeaderRows = false
    expect(assessVNextTableAuthoringBundleV1(order)).toMatchObject({
      status: "blocked", issues: expect.arrayContaining([
        expect.objectContaining({ code: "source-row-cell-map-mismatch" }),
        expect.objectContaining({ code: "header-policy-drift" }),
      ]),
    })
  })

  it("rejects malformed strict bundle input", () => {
    expect(assessVNextTableAuthoringBundleV1({ ...bundle(), extra: true })).toMatchObject({
      status: "blocked", bundle: null,
      issues: [expect.objectContaining({ code: "unrecognized_keys" })],
    })
  })
})
