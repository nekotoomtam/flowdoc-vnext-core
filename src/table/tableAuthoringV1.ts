import type { AuthoredNodeV4Target, DocumentNodeV4Target } from "../schema/documentV4Target.js"
import type { VNextTableDefinitionV1 } from "./tableDefinitionV1.js"
import { assessVNextTableAuthoringBundleV1 } from "./tableAuthoringBundleV1.js"
import {
  VNEXT_TABLE_AUTHORING_SOURCE,
  VNEXT_TABLE_AUTHORING_VERSION,
  VNextTableAuthoringRequestV1Schema,
  type VNextTableAuthoringAcceptedBundleV1,
  type VNextTableAuthoringCommandV1,
  type VNextTableAuthoringCommitV1,
  type VNextTableAuthoringIssueV1,
  type VNextTableAuthoringRequestV1,
  type VNextTableAuthoringResultV1,
} from "./tableAuthoringContractV1.js"
import { runAcceptedVNextTableGridAuthoringV1 } from "./tableAuthoringGridV1.js"

type RowCommand = Extract<VNextTableAuthoringCommandV1,
  { kind: "table.row.insert.static" | "table.row.delete.static" | "table.row.reorder" }>

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function formatPath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, part) => typeof part === "number"
    ? `${current}[${part}]`
    : current === "" ? String(part) : `${current}.${String(part)}`, "")
}

function issue(code: string, path: string, message: string, facts: Partial<VNextTableAuthoringIssueV1> = {}): VNextTableAuthoringIssueV1 {
  return { code, path, message, severity: "error", ...facts }
}

function blocked(
  reason: Extract<VNextTableAuthoringResultV1, { status: "blocked" }>["reason"],
  issues: VNextTableAuthoringIssueV1[],
  document: DocumentNodeV4Target | null,
  definition: VNextTableDefinitionV1 | null,
): VNextTableAuthoringResultV1 {
  return {
    source: VNEXT_TABLE_AUTHORING_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_VERSION,
    status: "blocked",
    reason,
    document: document == null ? null : clone(document),
    definition: definition == null ? null : clone(definition),
    operation: null,
    issues,
  }
}

function bundleInput(input: VNextTableAuthoringRequestV1, document = input.document, definition = input.definition) {
  return {
    contractVersion: VNEXT_TABLE_AUTHORING_VERSION,
    kind: "table-authoring-bundle" as const,
    artifact: input.artifact,
    document,
    definition,
    policySet: input.policySet,
    sessionAllowedActions: input.sessionAllowedActions,
  }
}

function actionFor(command: VNextTableAuthoringCommandV1) {
  if (command.kind === "table.row.insert.static") return "table.row.insert" as const
  if (command.kind === "table.row.delete.static") return "table.row.delete" as const
  if (command.kind === "table.row.reorder") return "table.row.reorder" as const
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
  collected: string[] = [],
): string[] {
  const node = nodes[rootId]
  if (node == null) return collected
  collected.push(rootId)
  nodeChildIds(node).forEach((childId) => collectSubtree(nodes, childId, collected))
  return collected
}

function usedAuthoredIds(document: DocumentNodeV4Target): Set<string> {
  const used = new Set<string>()
  document.document.sections.forEach((section) => Object.values(section.nodes).forEach((node) => {
    used.add(node.id)
    if (node.type === "text-block") node.children.forEach((inline) => used.add(inline.id))
  }))
  return used
}

function rowProps(command: Extract<RowCommand, { kind: "table.row.insert.static" }>) {
  return {
    ...(command.minHeightPt == null ? {} : { minHeight: { value: command.minHeightPt, unit: "pt" as const } }),
    ...(command.breakPolicy === "prefer-keep" ? {} : { allowBreak: command.breakPolicy === "allow" }),
  }
}

function syncHeaderProps(
  document: DocumentNodeV4Target,
  definition: VNextTableDefinitionV1,
  sectionId: string,
): void {
  const table = document.document.sections.find((section) => section.id === sectionId)?.nodes[definition.tableId]
  if (table?.type !== "table") throw new Error("accepted Table missing during header synchronization")
  let headerRowCount = 0
  for (const source of definition.rowSources) {
    if (source.kind !== "static-row" || source.role !== "header") break
    headerRowCount += 1
  }
  table.props.headerRowCount = headerRowCount
  table.props.repeatHeaderRows = definition.headerPolicy === "repeat-leading-headers"
}

function capabilityDenial(
  bundle: VNextTableAuthoringAcceptedBundleV1,
  command: VNextTableAuthoringCommandV1,
): VNextTableAuthoringIssueV1[] {
  const action = actionFor(command)
  const capability = bundle.capabilities.find((item) => item.action === action)
  if (capability?.allowed) return []
  return (capability?.denials ?? []).map((denial) => issue(
    denial.code, denial.path, denial.message, { tableId: bundle.tableId, action },
  ))
}

function finalizeRowCommit(input: {
  request: VNextTableAuthoringRequestV1
  before: VNextTableAuthoringAcceptedBundleV1
  document: DocumentNodeV4Target
  definition: VNextTableDefinitionV1
  command: RowCommand
  operation: Omit<VNextTableAuthoringCommitV1, "action" | "source" | "policyKey" | "fingerprints" | "contracts">
}): VNextTableAuthoringResultV1 {
  const after = assessVNextTableAuthoringBundleV1(bundleInput(input.request, input.document, input.definition))
  if (after.status !== "ready") return blocked(
    "validation-failed", after.issues, input.request.document, input.request.definition,
  )
  const operation: VNextTableAuthoringCommitV1 = {
    ...input.operation,
    action: actionFor(input.command),
    source: input.command.source ?? "user",
    policyKey: input.before.tablePolicyKey,
    fingerprints: {
      documentBefore: JSON.stringify(input.request.document),
      documentAfter: JSON.stringify(input.document),
      definitionBefore: JSON.stringify(input.request.definition),
      definitionAfter: JSON.stringify(input.definition),
      bundleBefore: input.before.fingerprint,
      bundleAfter: after.bundle.fingerprint,
    },
    contracts: {
      persistence: "not-run", editorSelectionMutation: false,
      measurement: "not-run", pagination: "not-run", rendering: "not-run",
    },
  }
  return {
    source: VNEXT_TABLE_AUTHORING_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_VERSION,
    status: "committed",
    document: clone(input.document),
    definition: clone(input.definition),
    operation,
    issues: [],
  }
}

function insertStaticRow(
  request: VNextTableAuthoringRequestV1,
  before: VNextTableAuthoringAcceptedBundleV1,
  command: Extract<RowCommand, { kind: "table.row.insert.static" }>,
): VNextTableAuthoringResultV1 {
  if (command.index > before.definition.rowSources.length) return blocked(
    "invalid-command",
    [issue("invalid-index", "command.index", `row index must be at most ${before.definition.rowSources.length}`, { tableId: command.tableId })],
    request.document, request.definition,
  )
  if (command.cellIds.length !== before.definition.columns.length) return blocked(
    "invalid-command",
    [issue("cell-count-mismatch", "command.cellIds", "inserted row requires one cell id per span-one column", { tableId: command.tableId, rowId: command.rowId })],
    request.document, request.definition,
  )
  const used = usedAuthoredIds(before.document)
  const newNodeIds = [command.rowId, ...command.cellIds]
  const duplicateNodeIds = newNodeIds.filter((id, index) => used.has(id) || newNodeIds.indexOf(id) !== index)
  const semanticConflict = before.definition.rowSources.some((source) => source.rowSourceId === command.rowSourceId)
    || before.definition.rowTemplates[command.rowTemplateId] != null
  if (duplicateNodeIds.length > 0 || semanticConflict) return blocked(
    "invalid-command",
    [issue(
      "identity-conflict", "command",
      "row, cell, row-source, and row-template identities must be new and unique",
      { tableId: command.tableId, rowId: command.rowId },
    )],
    request.document, request.definition,
  )

  const document = clone(before.document)
  const definition = clone(before.definition)
  const section = document.document.sections.find((item) => item.id === before.sectionId)
  const table = section?.nodes[before.tableId]
  if (section == null || table?.type !== "table") throw new Error("accepted Table missing")
  section.nodes[command.rowId] = {
    id: command.rowId, type: "table-row", props: rowProps(command), cellIds: [...command.cellIds],
  }
  command.cellIds.forEach((cellId) => {
    section.nodes[cellId] = { id: cellId, type: "table-cell", props: {}, childIds: [] }
  })
  table.rowIds.splice(command.index, 0, command.rowId)
  definition.rowTemplates[command.rowTemplateId] = {
    rowTemplateId: command.rowTemplateId,
    sourceRowId: command.rowId,
    breakPolicy: command.breakPolicy,
    ...(command.minHeightPt == null ? {} : { minHeightPt: command.minHeightPt }),
    cells: command.cellIds.map((cellId, columnStart) => ({
      cellId, columnStart, colSpan: 1, rowSpan: 1,
    })),
  }
  definition.rowSources.splice(command.index, 0, {
    kind: "static-row", rowSourceId: command.rowSourceId,
    rowTemplateId: command.rowTemplateId, role: command.role,
  })
  syncHeaderProps(document, definition, before.sectionId)
  return finalizeRowCommit({
    request, before, document, definition, command,
    operation: {
      kind: command.kind, tableId: before.tableId,
      targetIds: [command.rowSourceId, command.rowTemplateId, command.rowId, ...command.cellIds],
      identity: {
        addedNodeIds: [command.rowId, ...command.cellIds], removedNodeIds: [], retainedNodeIds: [before.tableId],
        addedColumnIds: [], removedColumnIds: [], reorderedIds: [],
      },
      scope: {
        sectionIds: [before.sectionId], tableIds: [before.tableId], rowSourceIds: [command.rowSourceId],
        rowTemplateIds: [command.rowTemplateId], rowIds: [command.rowId], columnIds: [],
        cellIds: [...command.cellIds], textBlockIds: [],
      },
      historyPolicy: {
        kind: "single-entry", durableIntent: "structure",
        summary: `insert static Table row ${command.rowSourceId}`, collaborationSafe: false,
      },
      selectionAfter: { kind: "table-row", tableId: before.tableId, rowSourceId: command.rowSourceId, rowId: command.rowId },
      invalidation: {
        lane: "table-row-order", definition: true, measurement: false, pagination: true, renderer: true,
        reasons: ["row-source-order-changed", "authored-row-added"],
      },
      work: { rowTemplateVisitCount: 1, cellVisitCount: command.cellIds.length, subtreeNodeVisitCount: 0 },
    },
  })
}

function deleteStaticRow(
  request: VNextTableAuthoringRequestV1,
  before: VNextTableAuthoringAcceptedBundleV1,
  command: Extract<RowCommand, { kind: "table.row.delete.static" }>,
): VNextTableAuthoringResultV1 {
  const sourceIndex = before.definition.rowSources.findIndex((source) => source.rowSourceId === command.rowSourceId)
  const source = before.definition.rowSources[sourceIndex]
  if (source == null) return blocked(
    "target-not-found", [issue("row-source-not-found", "command.rowSourceId", "row source was not found", { tableId: command.tableId })],
    request.document, request.definition,
  )
  if (source.kind !== "static-row") return blocked(
    "unsupported-capability",
    [issue("collection-source-delete-unsupported", "command.rowSourceId", "collection row source deletion requires field/binding contract edits", { tableId: command.tableId })],
    request.document, request.definition,
  )
  if (before.definition.rowSources.length <= 1) return blocked(
    "invalid-command", [issue("cannot-delete-last-row", "command.rowSourceId", "Table authoring cannot delete the last row source", { tableId: command.tableId })],
    request.document, request.definition,
  )
  const template = before.definition.rowTemplates[source.rowTemplateId]
  const document = clone(before.document)
  const definition = clone(before.definition)
  const section = document.document.sections.find((item) => item.id === before.sectionId)
  const table = section?.nodes[before.tableId]
  if (section == null || table?.type !== "table" || template == null) throw new Error("accepted row source missing")
  const removedIds = collectSubtree(section.nodes, template.sourceRowId)
  const removedTextBlockIds = removedIds.filter((id) => section.nodes[id]?.type === "text-block")
  removedIds.forEach((id) => { delete section.nodes[id] })
  table.rowIds.splice(sourceIndex, 1)
  definition.rowSources.splice(sourceIndex, 1)
  delete definition.rowTemplates[source.rowTemplateId]
  syncHeaderProps(document, definition, before.sectionId)
  const fallbackIndex = sourceIndex > 0 ? sourceIndex - 1 : 0
  const fallbackSource = definition.rowSources[fallbackIndex]
  const fallbackTemplate = definition.rowTemplates[fallbackSource.rowTemplateId]
  return finalizeRowCommit({
    request, before, document, definition, command,
    operation: {
      kind: command.kind, tableId: before.tableId,
      targetIds: [command.rowSourceId, source.rowTemplateId, template.sourceRowId, ...removedIds],
      identity: {
        addedNodeIds: [], removedNodeIds: removedIds, retainedNodeIds: [before.tableId],
        addedColumnIds: [], removedColumnIds: [], reorderedIds: [],
      },
      scope: {
        sectionIds: [before.sectionId], tableIds: [before.tableId], rowSourceIds: [command.rowSourceId],
        rowTemplateIds: [source.rowTemplateId], rowIds: [template.sourceRowId], columnIds: [],
        cellIds: template.cells.map((cell) => cell.cellId), textBlockIds: removedTextBlockIds,
      },
      historyPolicy: {
        kind: "single-entry", durableIntent: "structure",
        summary: `delete static Table row ${command.rowSourceId}`, collaborationSafe: false,
      },
      selectionAfter: {
        kind: "table-row", tableId: before.tableId,
        rowSourceId: fallbackSource.rowSourceId, rowId: fallbackTemplate.sourceRowId,
      },
      invalidation: {
        lane: "table-row-order", definition: true,
        measurement: removedTextBlockIds.length > 0, pagination: true, renderer: true,
        reasons: ["row-source-order-changed", "authored-row-subtree-removed"],
      },
      work: {
        rowTemplateVisitCount: 1, cellVisitCount: template.cells.length,
        subtreeNodeVisitCount: removedIds.length,
      },
    },
  })
}

function reorderRow(
  request: VNextTableAuthoringRequestV1,
  before: VNextTableAuthoringAcceptedBundleV1,
  command: Extract<RowCommand, { kind: "table.row.reorder" }>,
): VNextTableAuthoringResultV1 {
  const currentIndex = before.definition.rowSources.findIndex((source) => source.rowSourceId === command.rowSourceId)
  if (currentIndex < 0) return blocked(
    "target-not-found", [issue("row-source-not-found", "command.rowSourceId", "row source was not found", { tableId: command.tableId })],
    request.document, request.definition,
  )
  if (command.toIndex >= before.definition.rowSources.length) return blocked(
    "invalid-command", [issue("invalid-index", "command.toIndex", `row index must be less than ${before.definition.rowSources.length}`, { tableId: command.tableId })],
    request.document, request.definition,
  )
  if (command.toIndex === currentIndex) return blocked(
    "no-op", [issue("no-op-index", "command.toIndex", "row source must move to a different index", { tableId: command.tableId })],
    request.document, request.definition,
  )
  const document = clone(before.document)
  const definition = clone(before.definition)
  const section = document.document.sections.find((item) => item.id === before.sectionId)
  const table = section?.nodes[before.tableId]
  if (table?.type !== "table") throw new Error("accepted Table missing")
  const [source] = definition.rowSources.splice(currentIndex, 1)
  const [rowId] = table.rowIds.splice(currentIndex, 1)
  definition.rowSources.splice(command.toIndex, 0, source)
  table.rowIds.splice(command.toIndex, 0, rowId)
  syncHeaderProps(document, definition, before.sectionId)
  const template = definition.rowTemplates[source.rowTemplateId]
  return finalizeRowCommit({
    request, before, document, definition, command,
    operation: {
      kind: command.kind, tableId: before.tableId,
      targetIds: [command.rowSourceId, source.rowTemplateId, rowId],
      identity: {
        addedNodeIds: [], removedNodeIds: [], retainedNodeIds: [before.tableId, rowId],
        addedColumnIds: [], removedColumnIds: [], reorderedIds: [command.rowSourceId, rowId],
      },
      scope: {
        sectionIds: [before.sectionId], tableIds: [before.tableId], rowSourceIds: [command.rowSourceId],
        rowTemplateIds: [source.rowTemplateId], rowIds: [rowId], columnIds: [],
        cellIds: template.cells.map((cell) => cell.cellId), textBlockIds: [],
      },
      historyPolicy: {
        kind: "single-entry", durableIntent: "structure",
        summary: `reorder Table row ${command.rowSourceId}`, collaborationSafe: false,
      },
      selectionAfter: { kind: "table-row", tableId: before.tableId, rowSourceId: command.rowSourceId, rowId },
      invalidation: {
        lane: "table-row-order", definition: true, measurement: false, pagination: true, renderer: true,
        reasons: ["row-source-order-changed"],
      },
      work: { rowTemplateVisitCount: 1, cellVisitCount: template.cells.length, subtreeNodeVisitCount: 0 },
    },
  })
}

export function runVNextTableAuthoringV1(value: unknown): VNextTableAuthoringResultV1 {
  const parsed = VNextTableAuthoringRequestV1Schema.safeParse(value)
  if (!parsed.success) return blocked(
    "invalid-request",
    parsed.error.issues.map((item) => issue(item.code, formatPath(item.path), item.message)),
    null,
    null,
  )
  const request = parsed.data
  const assessed = assessVNextTableAuthoringBundleV1(bundleInput(request))
  if (assessed.status !== "ready") return blocked(
    "bundle-not-ready", assessed.issues, request.document, request.definition,
  )
  const before = assessed.bundle
  if (request.command.tableId !== before.tableId) return blocked(
    "target-not-found",
    [issue("table-id-mismatch", "command.tableId", "command Table id does not match the accepted bundle", { tableId: request.command.tableId })],
    request.document, request.definition,
  )
  const denied = capabilityDenial(before, request.command)
  if (denied.length > 0) return blocked(
    "capability-denied", denied, request.document, request.definition,
  )
  if (request.command.kind === "table.row.insert.static") return insertStaticRow(request, before, request.command)
  if (request.command.kind === "table.row.delete.static") return deleteStaticRow(request, before, request.command)
  if (request.command.kind === "table.row.reorder") return reorderRow(request, before, request.command)
  return runAcceptedVNextTableGridAuthoringV1(request, before, request.command)
}
