import type {
  VNextStructurePolicyNodeAction,
  VNextTableAuthoringBundleV1,
  VNextTableAuthoringCommandV1,
  VNextTableAuthoringRequestV1,
} from "../../src/index.js"

export const tableAuthoringActions: VNextStructurePolicyNodeAction[] = [
  "table.row.insert", "table.row.delete", "table.row.reorder",
  "table.column.insert", "table.column.delete", "table.column.resize",
  "table.cell.vertical-align.patch",
]

export function createTableAuthoringBundle(rowCount: number): VNextTableAuthoringBundleV1 {
  const ref = { structureId: "scale-table", draftId: "draft-1", revision: 2 }
  const rowIds = Array.from({ length: rowCount }, (_, index) => `row-${index}`)
  const nodes: Record<string, any> = {
    body: { id: "body", type: "zone", role: "body", childIds: ["table"] },
    table: {
      id: "table", type: "table", props: { headerRowCount: 0, repeatHeaderRows: false },
      columns: [
        { width: { value: 200, unit: "pt" } },
        { width: { value: 200, unit: "pt" } },
      ],
      rowIds,
    },
  }
  const rowSources: any[] = []
  const rowTemplates: Record<string, any> = {}
  rowIds.forEach((rowId, index) => {
    const left = `cell-${index}-left`
    const right = `cell-${index}-right`
    const templateId = `template-${index}`
    nodes[rowId] = { id: rowId, type: "table-row", props: {}, cellIds: [left, right] }
    nodes[left] = { id: left, type: "table-cell", props: {}, childIds: [] }
    nodes[right] = { id: right, type: "table-cell", props: {}, childIds: [] }
    rowSources.push({
      kind: "static-row", rowSourceId: `source-${index}`, rowTemplateId: templateId, role: "body",
    })
    rowTemplates[templateId] = {
      rowTemplateId: templateId, sourceRowId: rowId, breakPolicy: "allow",
      cells: [
        { cellId: left, columnStart: 0, colSpan: 1, rowSpan: 1 },
        { cellId: right, columnStart: 1, colSpan: 1, rowSpan: 1 },
      ],
    }
  })
  return {
    contractVersion: 1, kind: "table-authoring-bundle",
    artifact: { contractVersion: 1, kind: "structure-definition-draft", ...ref },
    document: {
      version: 4,
      document: {
        id: "scale-table", meta: { title: "Scale Table" },
        sections: [{
          id: "main", type: "section",
          page: {
            size: "A4", orientation: "portrait",
            margin: {
              top: { value: 40, unit: "pt" }, right: { value: 40, unit: "pt" },
              bottom: { value: 40, unit: "pt" }, left: { value: 40, unit: "pt" },
            },
          },
          zoneIds: ["body"], nodes,
        }],
      },
    },
    definition: {
      contractVersion: 1, kind: "table-definition", tableDefinitionId: "scale-definition",
      owner: { kind: "structure-draft", ref: { ...ref } },
      tableId: "table", headerPolicy: "no-repeat",
      columns: [{ columnId: "left", widthShare: 50 }, { columnId: "right", widthShare: 50 }],
      rowSources, rowTemplates,
    },
    policySet: {
      contractVersion: 1, kind: "structure-policy-set", policySetId: "scale-policy",
      owner: { kind: "structure-definition-draft", ref: { ...ref } },
      defaultPolicyKey: "default",
      policies: { default: { key: "default", nodeActions: [...tableAuthoringActions] } },
      nodeBindings: {},
    },
    sessionAllowedActions: [...tableAuthoringActions],
  }
}

export function createTableAuthoringRequest(
  bundle: VNextTableAuthoringBundleV1,
  command: VNextTableAuthoringCommandV1,
): VNextTableAuthoringRequestV1 {
  return {
    ...JSON.parse(JSON.stringify(bundle)),
    kind: "table-authoring-request",
    command: JSON.parse(JSON.stringify(command)),
  }
}
