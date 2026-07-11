import {
  safeParseFlowDocPackageV3DocumentV4,
  type FieldRegistryV1V3,
  type FlowDocPackageV3DocumentV4,
  type FlowDocPackageV3ParseIssue,
  type FlowDocPackageV3ParseReason,
} from "../persistence/packageV3.js"
import type { DataSnapshotV2 } from "../persistence/packageV3ImageTarget.js"
import type {
  AuthoredNodeV4Target,
  AuthoredNodeV4TargetType,
  DocumentNodeV4Target,
} from "../schema/documentV4Target.js"
import type { VNextRuntimeSessionSource } from "./session.js"

export type VNextReadOnlyParentRefV4 =
  | { kind: "section"; sectionId: string; childField: "zoneIds"; index: number }
  | { kind: "zone"; zoneId: string; childField: "childIds"; index: number }
  | { kind: "columns"; columnsId: string; childField: "columnIds"; index: number }
  | { kind: "column"; columnId: string; childField: "childIds"; index: number }
  | { kind: "table"; tableId: string; childField: "rowIds"; index: number }
  | { kind: "table-row"; rowId: string; childField: "cellIds"; index: number }
  | { kind: "table-cell"; cellId: string; childField: "childIds"; index: number }

export interface VNextReadOnlyNearestContextV4 {
  blockId: string | null
  columnId: string | null
  columnsId: string | null
  sectionId: string
  tableCellId: string | null
  tableId: string | null
  tableRowId: string | null
  textBlockId: string | null
  zoneId: string
}

export interface VNextReadOnlyNodeCapabilitiesV4 {
  allowedChildTypes: readonly AuthoredNodeV4TargetType[]
  canBeDeleted: false
  canBeDuplicated: false
  canBeReordered: boolean
  canContainText: false
  canSplitAcrossPages: false
  childrenField?: "cellIds" | "childIds" | "columnIds" | "rowIds"
  operationSurface: "columns" | "generated" | "table" | "text-block" | "utility" | "zone"
}

export interface VNextReadOnlyGraphV4 {
  capabilitiesByType: Record<AuthoredNodeV4TargetType, VNextReadOnlyNodeCapabilitiesV4>
  childrenByNodeId: Map<string, readonly string[]>
  nearestByNodeId: Map<string, VNextReadOnlyNearestContextV4>
  nodesById: Map<string, AuthoredNodeV4Target>
  parentByNodeId: Map<string, VNextReadOnlyParentRefV4>
  sectionByNodeId: Map<string, string>
  zoneByNodeId: Map<string, string>
  zonesById: Map<string, Extract<AuthoredNodeV4Target, { type: "zone" }>>
}

export interface VNextReadOnlyRuntimeSessionV4 {
  data?: DataSnapshotV2
  diagnostics: {
    graphIssueCount: 0
    supportedOperationKinds: readonly []
  }
  document: DocumentNodeV4Target
  documentVersion: 4
  fields: FieldRegistryV1V3
  graph: VNextReadOnlyGraphV4
  package: FlowDocPackageV3DocumentV4
  packageVersion: 3
  readOnly: true
  mutationOperationKinds: readonly ["node.reorder"]
  source: "vnext-read-only-runtime-session-v4"
  sourceKind: VNextRuntimeSessionSource
}

export type VNextReadOnlyRuntimeSessionV4Result =
  | { ok: true; session: VNextReadOnlyRuntimeSessionV4 }
  | { ok: false; reason: FlowDocPackageV3ParseReason; issues: FlowDocPackageV3ParseIssue[] }

function children(node: AuthoredNodeV4Target): readonly string[] {
  if (node.type === "zone" || node.type === "column" || node.type === "table-cell") return node.childIds
  if (node.type === "columns") return node.columnIds
  if (node.type === "table") return node.rowIds
  if (node.type === "table-row") return node.cellIds
  return []
}

function childrenField(type: AuthoredNodeV4TargetType): VNextReadOnlyNodeCapabilitiesV4["childrenField"] {
  if (type === "columns") return "columnIds"
  if (type === "table") return "rowIds"
  if (type === "table-row") return "cellIds"
  if (type === "zone" || type === "column" || type === "table-cell") return "childIds"
  return undefined
}

const CHILD_TYPES: Record<AuthoredNodeV4TargetType, readonly AuthoredNodeV4TargetType[]> = {
  zone: ["text-block", "columns", "table", "toc", "page-break", "divider", "spacer", "image"],
  "text-block": [],
  columns: ["column"],
  column: ["text-block", "columns", "table", "toc", "divider", "spacer", "image"],
  table: ["table-row"],
  "table-row": ["table-cell"],
  "table-cell": ["text-block", "toc", "divider", "spacer", "image"],
  toc: [],
  "page-break": [],
  divider: [],
  spacer: [],
  image: [],
}

function operationSurface(type: AuthoredNodeV4TargetType): VNextReadOnlyNodeCapabilitiesV4["operationSurface"] {
  if (type === "zone") return "zone"
  if (type === "text-block") return "text-block"
  if (type === "columns" || type === "column") return "columns"
  if (type === "table" || type === "table-row" || type === "table-cell") return "table"
  if (type === "toc") return "generated"
  return "utility"
}

function capabilities(): Record<AuthoredNodeV4TargetType, VNextReadOnlyNodeCapabilitiesV4> {
  const reorderable = new Set<AuthoredNodeV4TargetType>([
    "text-block", "columns", "table", "toc", "page-break", "divider", "spacer", "image",
  ])
  return Object.fromEntries(Object.keys(CHILD_TYPES).map((typeValue) => {
    const type = typeValue as AuthoredNodeV4TargetType
    return [type, {
      allowedChildTypes: [...CHILD_TYPES[type]],
      canBeDeleted: false,
      canBeDuplicated: false,
      canBeReordered: reorderable.has(type),
      canContainText: false,
      canSplitAcrossPages: false,
      ...(childrenField(type) == null
        ? {}
        : { childrenField: childrenField(type) }),
      operationSurface: operationSurface(type),
    }]
  })) as unknown as Record<AuthoredNodeV4TargetType, VNextReadOnlyNodeCapabilitiesV4>
}

function parentRef(
  parent: AuthoredNodeV4Target,
  index: number,
): VNextReadOnlyParentRefV4 {
  if (parent.type === "zone") return { kind: "zone", zoneId: parent.id, childField: "childIds", index }
  if (parent.type === "columns") return { kind: "columns", columnsId: parent.id, childField: "columnIds", index }
  if (parent.type === "column") return { kind: "column", columnId: parent.id, childField: "childIds", index }
  if (parent.type === "table") return { kind: "table", tableId: parent.id, childField: "rowIds", index }
  if (parent.type === "table-row") return { kind: "table-row", rowId: parent.id, childField: "cellIds", index }
  if (parent.type === "table-cell") return { kind: "table-cell", cellId: parent.id, childField: "childIds", index }
  throw new Error(`read-only v4 parent "${parent.id}" cannot own authored children`)
}

function nextContext(
  context: VNextReadOnlyNearestContextV4,
  node: AuthoredNodeV4Target,
): VNextReadOnlyNearestContextV4 {
  const isBlock = ["text-block", "columns", "table", "toc", "page-break", "divider", "spacer", "image"].includes(node.type)
  return {
    ...context,
    blockId: isBlock ? node.id : context.blockId,
    columnId: node.type === "column" ? node.id : context.columnId,
    columnsId: node.type === "columns" ? node.id : context.columnsId,
    tableCellId: node.type === "table-cell" ? node.id : context.tableCellId,
    tableId: node.type === "table" ? node.id : context.tableId,
    tableRowId: node.type === "table-row" ? node.id : context.tableRowId,
    textBlockId: node.type === "text-block" ? node.id : context.textBlockId,
  }
}

function buildReadOnlyGraph(document: DocumentNodeV4Target): VNextReadOnlyGraphV4 {
  const graph: VNextReadOnlyGraphV4 = {
    capabilitiesByType: capabilities(),
    childrenByNodeId: new Map(),
    nearestByNodeId: new Map(),
    nodesById: new Map(),
    parentByNodeId: new Map(),
    sectionByNodeId: new Map(),
    zoneByNodeId: new Map(),
    zonesById: new Map(),
  }

  document.document.sections.forEach((section) => {
    Object.values(section.nodes).forEach((node) => {
      graph.nodesById.set(node.id, node)
      graph.sectionByNodeId.set(node.id, section.id)
      if (node.type === "zone") graph.zonesById.set(node.id, node)
    })

    const visit = (nodeId: string, context: VNextReadOnlyNearestContextV4): void => {
      const node = section.nodes[nodeId]
      if (!node) return
      const nodeContext = nextContext(context, node)
      graph.nearestByNodeId.set(node.id, nodeContext)
      graph.zoneByNodeId.set(node.id, context.zoneId)
      const childIds = [...children(node)]
      graph.childrenByNodeId.set(node.id, childIds)
      childIds.forEach((childId, index) => {
        graph.parentByNodeId.set(childId, parentRef(node, index))
        visit(childId, nodeContext)
      })
    }

    section.zoneIds.forEach((zoneId, index) => {
      graph.parentByNodeId.set(zoneId, { kind: "section", sectionId: section.id, childField: "zoneIds", index })
      visit(zoneId, {
        blockId: null,
        columnId: null,
        columnsId: null,
        sectionId: section.id,
        tableCellId: null,
        tableId: null,
        tableRowId: null,
        textBlockId: null,
        zoneId,
      })
    })
  })
  return graph
}

export function safeCreateVNextReadOnlyRuntimeSessionV4(
  value: unknown,
  options: { source?: VNextRuntimeSessionSource } = {},
): VNextReadOnlyRuntimeSessionV4Result {
  const parsed = safeParseFlowDocPackageV3DocumentV4(value)
  if (!parsed.ok) return parsed
  return {
    ok: true,
    session: {
      data: parsed.package.data,
      diagnostics: { graphIssueCount: 0, supportedOperationKinds: [] },
      document: parsed.package.document,
      documentVersion: 4,
      fields: parsed.package.fields,
      graph: buildReadOnlyGraph(parsed.package.document),
      package: parsed.package,
      packageVersion: 3,
      readOnly: true,
      mutationOperationKinds: ["node.reorder"],
      source: "vnext-read-only-runtime-session-v4",
      sourceKind: options.source ?? "canonical-vnext-package",
    },
  }
}
