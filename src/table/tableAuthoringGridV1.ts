import type { AuthoredNodeV4Target, DocumentNodeV4Target } from "../schema/documentV4Target.js"
import type { UnitValueV4Target } from "../schema/documentV4Foundation.js"
import type { VNextTableDefinitionV1 } from "./tableDefinitionV1.js"
import { assessVNextTableAuthoringBundleV1 } from "./tableAuthoringBundleV1.js"
import {
  VNEXT_TABLE_AUTHORING_SOURCE,
  VNEXT_TABLE_AUTHORING_VERSION,
  type VNextTableAuthoringAcceptedBundleV1,
  type VNextTableAuthoringCommandV1,
  type VNextTableAuthoringCommitV1,
  type VNextTableAuthoringIssueV1,
  type VNextTableAuthoringRequestV1,
  type VNextTableAuthoringResultV1,
} from "./tableAuthoringContractV1.js"

type GridCommand = Extract<VNextTableAuthoringCommandV1, {
  kind: "table.column.insert" | "table.column.delete" | "table.column.resize" | "table.cell.vertical-align.patch"
}>

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function round(value: number): number {
  return Number(value.toFixed(9))
}

function issue(code: string, path: string, message: string, facts: Partial<VNextTableAuthoringIssueV1> = {}): VNextTableAuthoringIssueV1 {
  return { code, path, message, severity: "error", ...facts }
}

function blocked(
  reason: Extract<VNextTableAuthoringResultV1, { status: "blocked" }>["reason"],
  issues: VNextTableAuthoringIssueV1[],
  request: VNextTableAuthoringRequestV1,
): VNextTableAuthoringResultV1 {
  return {
    source: VNEXT_TABLE_AUTHORING_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_VERSION,
    status: "blocked", reason,
    document: clone(request.document), definition: clone(request.definition),
    operation: null, issues,
  }
}

function actionFor(command: GridCommand) {
  if (command.kind === "table.column.insert") return "table.column.insert" as const
  if (command.kind === "table.column.delete") return "table.column.delete" as const
  if (command.kind === "table.column.resize") return "table.column.resize" as const
  return "table.cell.vertical-align.patch" as const
}

function nodeChildIds(node: AuthoredNodeV4Target): readonly string[] {
  if (node.type === "zone" || node.type === "column" || node.type === "table-cell") return node.childIds
  if (node.type === "columns") return node.columnIds
  if (node.type === "table") return node.rowIds
  if (node.type === "table-row") return node.cellIds
  return []
}

function collectSubtree(
  nodes: Readonly<Record<string, AuthoredNodeV4Target>>,
  rootId: string,
  result: string[] = [],
): string[] {
  const node = nodes[rootId]
  if (node == null) return result
  result.push(rootId)
  nodeChildIds(node).forEach((childId) => collectSubtree(nodes, childId, result))
  return result
}

function usedIds(document: DocumentNodeV4Target): Set<string> {
  const result = new Set<string>()
  document.document.sections.forEach((section) => Object.values(section.nodes).forEach((node) => {
    result.add(node.id)
    if (node.type === "text-block") node.children.forEach((inline) => result.add(inline.id))
  }))
  return result
}

function unitToPt(value: UnitValueV4Target): number {
  return value.unit === "pt" ? value.value : (value.value * 72) / 25.4
}

function physicalTotalPt(document: DocumentNodeV4Target, sectionId: string, tableId: string): number {
  const table = document.document.sections.find((section) => section.id === sectionId)?.nodes[tableId]
  if (table?.type !== "table") throw new Error("accepted Table missing")
  return table.columns.reduce((total, column) => total + unitToPt(column.width), 0)
}

function normalizedShares(values: number[], fixedIndex: number, fixedValue: number): number[] {
  const result = new Array<number>(values.length)
  result[fixedIndex] = fixedValue
  const remainingIndexes = values.map((_, index) => index).filter((index) => index !== fixedIndex)
  const sourceTotal = remainingIndexes.reduce((sum, index) => sum + values[index], 0)
  const targetTotal = 100 - fixedValue
  let assigned = 0
  remainingIndexes.forEach((index, position) => {
    const value = position === remainingIndexes.length - 1
      ? round(targetTotal - assigned)
      : round((values[index] / sourceTotal) * targetTotal)
    result[index] = value
    assigned = round(assigned + value)
  })
  return result
}

function sharesAfterDelete(values: number[], deleteIndex: number): number[] {
  const remaining = values.filter((_, index) => index !== deleteIndex)
  const total = remaining.reduce((sum, value) => sum + value, 0)
  let assigned = 0
  return remaining.map((value, index) => {
    const normalized = index === remaining.length - 1 ? round(100 - assigned) : round((value / total) * 100)
    assigned = round(assigned + normalized)
    return normalized
  })
}

function syncPhysicalWidths(
  document: DocumentNodeV4Target,
  definition: VNextTableDefinitionV1,
  sectionId: string,
  totalPt: number,
): void {
  const table = document.document.sections.find((section) => section.id === sectionId)?.nodes[definition.tableId]
  if (table?.type !== "table") throw new Error("accepted Table missing")
  let assigned = 0
  table.columns = definition.columns.map((column, index) => {
    const width = index === definition.columns.length - 1
      ? round(totalPt - assigned)
      : round((totalPt * column.widthShare) / 100)
    assigned = round(assigned + width)
    return { width: { value: width, unit: "pt" } }
  })
}

function bundleInput(
  request: VNextTableAuthoringRequestV1,
  document: DocumentNodeV4Target,
  definition: VNextTableDefinitionV1,
) {
  return {
    contractVersion: VNEXT_TABLE_AUTHORING_VERSION,
    kind: "table-authoring-bundle" as const,
    artifact: request.artifact, document, definition,
    policySet: request.policySet, sessionAllowedActions: request.sessionAllowedActions,
  }
}

function finalize(input: {
  request: VNextTableAuthoringRequestV1
  before: VNextTableAuthoringAcceptedBundleV1
  command: GridCommand
  document: DocumentNodeV4Target
  definition: VNextTableDefinitionV1
  operation: Omit<VNextTableAuthoringCommitV1, "action" | "source" | "policyKey" | "fingerprints" | "contracts">
}): VNextTableAuthoringResultV1 {
  const after = assessVNextTableAuthoringBundleV1(bundleInput(input.request, input.document, input.definition))
  if (after.status !== "ready") return blocked("validation-failed", after.issues, input.request)
  return {
    source: VNEXT_TABLE_AUTHORING_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_VERSION,
    status: "committed",
    document: clone(input.document), definition: clone(input.definition),
    operation: {
      ...input.operation,
      action: actionFor(input.command), source: input.command.source ?? "user",
      policyKey: input.before.tablePolicyKey,
      fingerprints: {
        documentBefore: JSON.stringify(input.request.document), documentAfter: JSON.stringify(input.document),
        definitionBefore: JSON.stringify(input.request.definition), definitionAfter: JSON.stringify(input.definition),
        bundleBefore: input.before.fingerprint, bundleAfter: after.bundle.fingerprint,
      },
      contracts: {
        persistence: "not-run", editorSelectionMutation: false,
        measurement: "not-run", pagination: "not-run", rendering: "not-run",
      },
    },
    issues: [],
  }
}

function insertColumn(
  request: VNextTableAuthoringRequestV1,
  before: VNextTableAuthoringAcceptedBundleV1,
  command: Extract<GridCommand, { kind: "table.column.insert" }>,
): VNextTableAuthoringResultV1 {
  if (command.index > before.definition.columns.length) return blocked(
    "invalid-command", [issue("invalid-index", "command.index", `column index must be at most ${before.definition.columns.length}`, { tableId: before.tableId })], request,
  )
  if (before.definition.columns.some((column) => column.columnId === command.columnId)) return blocked(
    "invalid-command", [issue("column-id-conflict", "command.columnId", "stable column id already exists", { tableId: before.tableId })], request,
  )
  const templateIds = Object.keys(before.definition.rowTemplates).sort()
  const mappingIds = Object.keys(command.cellIdsByRowTemplateId).sort()
  const newCellIds = Object.values(command.cellIdsByRowTemplateId)
  const used = usedIds(before.document)
  if (JSON.stringify(templateIds) !== JSON.stringify(mappingIds)
    || new Set(newCellIds).size !== newCellIds.length
    || newCellIds.some((id) => used.has(id))) return blocked(
    "invalid-command", [issue(
      "inserted-cell-identity-map-invalid", "command.cellIdsByRowTemplateId",
      "column insert requires exactly one new unique cell id for every row template",
      { tableId: before.tableId },
    )], request,
  )
  const document = clone(before.document)
  const definition = clone(before.definition)
  const section = document.document.sections.find((item) => item.id === before.sectionId)
  const table = section?.nodes[before.tableId]
  if (section == null || table?.type !== "table") throw new Error("accepted Table missing")
  const totalPt = physicalTotalPt(document, before.sectionId, before.tableId)
  const oldShares = definition.columns.map((column) => column.widthShare)
  const scaledExisting = oldShares.map((share) => round((share * (100 - command.widthShare)) / 100))
  const newShares = [...scaledExisting]
  newShares.splice(command.index, 0, command.widthShare)
  const correctionIndex = command.index === newShares.length - 1 ? newShares.length - 2 : newShares.length - 1
  const correction = round(100 - newShares.reduce((sum, value) => sum + value, 0))
  newShares[correctionIndex] = round(newShares[correctionIndex] + correction)
  definition.columns.splice(command.index, 0, { columnId: command.columnId, widthShare: command.widthShare })
  definition.columns.forEach((column, index) => { column.widthShare = newShares[index] })
  const affectedRowIds: string[] = []
  const affectedCellIds: string[] = []
  const addedCellIds: string[] = []
  const affectedTextBlockIds: string[] = []
  let cellVisitCount = 0
  templateIds.forEach((templateId) => {
    const template = definition.rowTemplates[templateId]
    const row = section.nodes[template.sourceRowId]
    if (row?.type !== "table-row") throw new Error("accepted row missing")
    const cellId = command.cellIdsByRowTemplateId[templateId]
    cellVisitCount += template.cells.length + 1
    template.cells.forEach((cell) => { if (cell.columnStart >= command.index) cell.columnStart += 1 })
    template.cells.splice(command.index, 0, { cellId, columnStart: command.index, colSpan: 1, rowSpan: 1 })
    row.cellIds.splice(command.index, 0, cellId)
    section.nodes[cellId] = { id: cellId, type: "table-cell", props: {}, childIds: [] }
    affectedRowIds.push(row.id)
    addedCellIds.push(cellId)
    affectedCellIds.push(...row.cellIds)
    row.cellIds.forEach((affectedCellId) => {
      affectedTextBlockIds.push(...collectSubtree(section.nodes, affectedCellId).filter(
        (id) => section.nodes[id]?.type === "text-block",
      ))
    })
  })
  syncPhysicalWidths(document, definition, before.sectionId, totalPt)
  return finalize({
    request, before, command, document, definition,
    operation: {
      kind: command.kind, tableId: before.tableId, targetIds: [command.columnId, ...addedCellIds],
      identity: {
        addedNodeIds: addedCellIds, removedNodeIds: [], retainedNodeIds: [before.tableId, ...affectedRowIds],
        addedColumnIds: [command.columnId], removedColumnIds: [], reorderedIds: [],
      },
      scope: {
        sectionIds: [before.sectionId], tableIds: [before.tableId], rowSourceIds: [],
        rowTemplateIds: templateIds, rowIds: affectedRowIds,
        columnIds: definition.columns.map((column) => column.columnId),
        cellIds: affectedCellIds, textBlockIds: affectedTextBlockIds,
      },
      historyPolicy: {
        kind: "single-entry", durableIntent: "structure",
        summary: `insert Table column ${command.columnId}`, collaborationSafe: false,
      },
      selectionAfter: { kind: "table-column", tableId: before.tableId, columnId: command.columnId },
      invalidation: {
        lane: "table-grid", definition: true, measurement: true, pagination: true, renderer: true,
        reasons: ["semantic-column-added", "all-cell-widths-changed", "authored-cells-added"],
      },
      work: { rowTemplateVisitCount: templateIds.length, cellVisitCount, subtreeNodeVisitCount: 0 },
    },
  })
}

function deleteColumn(
  request: VNextTableAuthoringRequestV1,
  before: VNextTableAuthoringAcceptedBundleV1,
  command: Extract<GridCommand, { kind: "table.column.delete" }>,
): VNextTableAuthoringResultV1 {
  const columnIndex = before.definition.columns.findIndex((column) => column.columnId === command.columnId)
  if (columnIndex < 0) return blocked(
    "target-not-found", [issue("column-not-found", "command.columnId", "stable column id was not found", { tableId: before.tableId })], request,
  )
  if (before.definition.columns.length <= 1) return blocked(
    "invalid-command", [issue("cannot-delete-last-column", "command.columnId", "Table authoring cannot delete the last column", { tableId: before.tableId })], request,
  )
  const document = clone(before.document)
  const definition = clone(before.definition)
  const section = document.document.sections.find((item) => item.id === before.sectionId)
  if (section == null) throw new Error("accepted section missing")
  const totalPt = physicalTotalPt(document, before.sectionId, before.tableId)
  const templateIds = Object.keys(definition.rowTemplates).sort()
  const removedNodeIds: string[] = []
  const removedCellIds: string[] = []
  const removedTextBlockIds: string[] = []
  const affectedCellIds: string[] = []
  const affectedTextBlockIds: string[] = []
  const affectedRowIds: string[] = []
  let cellVisitCount = 0
  templateIds.forEach((templateId) => {
    const template = definition.rowTemplates[templateId]
    const row = section.nodes[template.sourceRowId]
    if (row?.type !== "table-row") throw new Error("accepted row missing")
    cellVisitCount += template.cells.length
    template.cells.forEach((cell) => {
      affectedCellIds.push(cell.cellId)
      affectedTextBlockIds.push(...collectSubtree(section.nodes, cell.cellId).filter(
        (id) => section.nodes[id]?.type === "text-block",
      ))
    })
    const placement = template.cells[columnIndex]
    const subtree = collectSubtree(section.nodes, placement.cellId)
    removedNodeIds.push(...subtree)
    removedCellIds.push(placement.cellId)
    removedTextBlockIds.push(...subtree.filter((id) => section.nodes[id]?.type === "text-block"))
    subtree.forEach((id) => { delete section.nodes[id] })
    template.cells.splice(columnIndex, 1)
    template.cells.forEach((cell, index) => { cell.columnStart = index })
    row.cellIds.splice(columnIndex, 1)
    affectedRowIds.push(row.id)
  })
  const oldShares = definition.columns.map((column) => column.widthShare)
  definition.columns.splice(columnIndex, 1)
  const shares = sharesAfterDelete(oldShares, columnIndex)
  definition.columns.forEach((column, index) => { column.widthShare = shares[index] })
  syncPhysicalWidths(document, definition, before.sectionId, totalPt)
  const fallbackIndex = columnIndex > 0 ? columnIndex - 1 : 0
  return finalize({
    request, before, command, document, definition,
    operation: {
      kind: command.kind, tableId: before.tableId, targetIds: [command.columnId, ...removedCellIds],
      identity: {
        addedNodeIds: [], removedNodeIds, retainedNodeIds: [before.tableId, ...affectedRowIds],
        addedColumnIds: [], removedColumnIds: [command.columnId], reorderedIds: [],
      },
      scope: {
        sectionIds: [before.sectionId], tableIds: [before.tableId], rowSourceIds: [],
        rowTemplateIds: templateIds, rowIds: affectedRowIds,
        columnIds: before.definition.columns.map((column) => column.columnId),
        cellIds: affectedCellIds, textBlockIds: affectedTextBlockIds,
      },
      historyPolicy: {
        kind: "single-entry", durableIntent: "structure",
        summary: `delete Table column ${command.columnId}`, collaborationSafe: false,
      },
      selectionAfter: {
        kind: "table-column", tableId: before.tableId,
        columnId: definition.columns[fallbackIndex].columnId,
      },
      invalidation: {
        lane: "table-grid", definition: true, measurement: true, pagination: true, renderer: true,
        reasons: ["semantic-column-removed", "all-cell-widths-changed", "authored-cell-subtrees-removed"],
      },
      work: {
        rowTemplateVisitCount: templateIds.length, cellVisitCount,
        subtreeNodeVisitCount: removedNodeIds.length,
      },
    },
  })
}

function resizeColumn(
  request: VNextTableAuthoringRequestV1,
  before: VNextTableAuthoringAcceptedBundleV1,
  command: Extract<GridCommand, { kind: "table.column.resize" }>,
): VNextTableAuthoringResultV1 {
  const columnIndex = before.definition.columns.findIndex((column) => column.columnId === command.columnId)
  if (columnIndex < 0) return blocked(
    "target-not-found", [issue("column-not-found", "command.columnId", "stable column id was not found", { tableId: before.tableId })], request,
  )
  if (before.definition.columns.length <= 1) return blocked(
    "invalid-command", [issue("single-column-resize-unsupported", "command.widthShare", "a single Table column always owns 100 percent", { tableId: before.tableId })], request,
  )
  if (Math.abs(before.definition.columns[columnIndex].widthShare - command.widthShare) <= 1e-9) return blocked(
    "no-op", [issue("no-op-width-share", "command.widthShare", "column width share must change", { tableId: before.tableId })], request,
  )
  const document = clone(before.document)
  const definition = clone(before.definition)
  const totalPt = physicalTotalPt(document, before.sectionId, before.tableId)
  const shares = normalizedShares(definition.columns.map((column) => column.widthShare), columnIndex, command.widthShare)
  definition.columns.forEach((column, index) => { column.widthShare = shares[index] })
  syncPhysicalWidths(document, definition, before.sectionId, totalPt)
  const templateIds = Object.keys(definition.rowTemplates).sort()
  const affectedRowIds = templateIds.map((id) => definition.rowTemplates[id].sourceRowId)
  const affectedCellIds = templateIds.flatMap((id) => definition.rowTemplates[id].cells.map((cell) => cell.cellId))
  const section = document.document.sections.find((item) => item.id === before.sectionId)
  if (section == null) throw new Error("accepted section missing")
  const affectedTextBlockIds = affectedCellIds.flatMap((cellId) => collectSubtree(section.nodes, cellId).filter(
    (id) => section.nodes[id]?.type === "text-block",
  ))
  return finalize({
    request, before, command, document, definition,
    operation: {
      kind: command.kind, tableId: before.tableId, targetIds: [command.columnId],
      identity: {
        addedNodeIds: [], removedNodeIds: [], retainedNodeIds: [before.tableId, ...affectedRowIds, ...affectedCellIds],
        addedColumnIds: [], removedColumnIds: [], reorderedIds: [],
      },
      scope: {
        sectionIds: [before.sectionId], tableIds: [before.tableId], rowSourceIds: [],
        rowTemplateIds: templateIds, rowIds: affectedRowIds,
        columnIds: definition.columns.map((column) => column.columnId),
        cellIds: affectedCellIds, textBlockIds: affectedTextBlockIds,
      },
      historyPolicy: {
        kind: "single-entry", durableIntent: "layout",
        summary: `resize Table column ${command.columnId}`, collaborationSafe: false,
      },
      selectionAfter: { kind: "table-column", tableId: before.tableId, columnId: command.columnId },
      invalidation: {
        lane: "table-width", definition: true, measurement: true, pagination: true, renderer: true,
        reasons: ["semantic-column-shares-changed", "all-cell-widths-changed"],
      },
      work: {
        rowTemplateVisitCount: templateIds.length,
        cellVisitCount: affectedCellIds.length,
        subtreeNodeVisitCount: 0,
      },
    },
  })
}

function patchVerticalAlign(
  request: VNextTableAuthoringRequestV1,
  before: VNextTableAuthoringAcceptedBundleV1,
  command: Extract<GridCommand, { kind: "table.cell.vertical-align.patch" }>,
): VNextTableAuthoringResultV1 {
  const document = clone(before.document)
  const definition = clone(before.definition)
  const section = document.document.sections.find((item) => item.id === before.sectionId)
  const cell = section?.nodes[command.cellId]
  let rowId: string | null = null
  let rowTemplateId: string | null = null
  Object.values(definition.rowTemplates).forEach((template) => {
    if (template.cells.some((placement) => placement.cellId === command.cellId)) {
      rowId = template.sourceRowId
      rowTemplateId = template.rowTemplateId
    }
  })
  if (cell?.type !== "table-cell" || rowId == null || rowTemplateId == null) return blocked(
    "target-not-found", [issue("table-cell-not-found", "command.cellId", "cell is not owned by the accepted Table", { tableId: before.tableId, cellId: command.cellId })], request,
  )
  if ((cell.props.verticalAlign ?? "top") === command.verticalAlign) return blocked(
    "no-op", [issue("no-op-vertical-align", "command.verticalAlign", "cell vertical alignment must change", { tableId: before.tableId, cellId: command.cellId })], request,
  )
  cell.props.verticalAlign = command.verticalAlign
  return finalize({
    request, before, command, document, definition,
    operation: {
      kind: command.kind, tableId: before.tableId, targetIds: [command.cellId],
      identity: {
        addedNodeIds: [], removedNodeIds: [], retainedNodeIds: [before.tableId, rowId, command.cellId],
        addedColumnIds: [], removedColumnIds: [], reorderedIds: [],
      },
      scope: {
        sectionIds: [before.sectionId], tableIds: [before.tableId], rowSourceIds: [],
        rowTemplateIds: [rowTemplateId], rowIds: [rowId], columnIds: [],
        cellIds: [command.cellId], textBlockIds: [],
      },
      historyPolicy: {
        kind: "single-entry", durableIntent: "layout",
        summary: `set Table cell ${command.cellId} vertical alignment`, collaborationSafe: false,
      },
      selectionAfter: { kind: "table-cell", tableId: before.tableId, rowId, cellId: command.cellId },
      invalidation: {
        lane: "table-cell-layout", definition: false, measurement: false, pagination: false, renderer: true,
        reasons: ["cell-fragment-content-offset-changed"],
      },
      work: { rowTemplateVisitCount: 1, cellVisitCount: 1, subtreeNodeVisitCount: 0 },
    },
  })
}

export function runAcceptedVNextTableGridAuthoringV1(
  request: VNextTableAuthoringRequestV1,
  before: VNextTableAuthoringAcceptedBundleV1,
  command: GridCommand,
): VNextTableAuthoringResultV1 {
  if (command.kind === "table.column.insert") return insertColumn(request, before, command)
  if (command.kind === "table.column.delete") return deleteColumn(request, before, command)
  if (command.kind === "table.column.resize") return resizeColumn(request, before, command)
  return patchVerticalAlign(request, before, command)
}
