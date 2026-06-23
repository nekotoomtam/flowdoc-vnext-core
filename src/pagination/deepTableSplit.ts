import type {
  AuthoredNode,
  DocumentNode,
  DocumentSection,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "../schema/document.js"

export const VNEXT_DEEP_TABLE_SPLIT_SOURCE = "vnext-deep-table-split"
export const VNEXT_DEEP_TABLE_SPLIT_MODE = "table-split-readiness-boundary"

export type VNextDeepTableSplitPlanStatus = "ready" | "blocked"
export type VNextDeepTableSplitRowStrategy =
  | "text-line-range"
  | "atomic-row"
  | "empty-row"
  | "blocked-deep-content"

export type VNextDeepTableCellSplitSupport =
  | "line-range"
  | "atomic"
  | "empty"
  | "blocked"

export type VNextDeepTableCellChildPolicy =
  | "splittable-text"
  | "atomic-block"
  | "generated-atomic"
  | "ignored-page-break"
  | "unsupported"

export type VNextDeepTableSplitIssueCode =
  | "missing-row"
  | "missing-cell"
  | "non-text-cell-child-split-deferred"
  | "unsupported-cell-child"

export interface VNextDeepTableCellChildPlan {
  nodeId: string
  nodeType: AuthoredNode["type"]
  policy: VNextDeepTableCellChildPolicy
}

export interface VNextDeepTableCellSplitPlan {
  cellId: string
  cellIndex: number
  splitSupport: VNextDeepTableCellSplitSupport
  childPlans: VNextDeepTableCellChildPlan[]
}

export interface VNextDeepTableRowSplitPlan {
  tableId: string
  rowId: string
  rowIndex: number
  allowBreak: boolean
  splitStrategy: VNextDeepTableSplitRowStrategy
  cellPlans: VNextDeepTableCellSplitPlan[]
}

export interface VNextDeepTableSplitIssue {
  severity: "blocking"
  code: VNextDeepTableSplitIssueCode
  sectionId: string
  tableId: string
  rowId?: string
  cellId?: string
  nodeId?: string
  message: string
}

export interface VNextDeepTableSplitPlan {
  source: typeof VNEXT_DEEP_TABLE_SPLIT_SOURCE
  mode: typeof VNEXT_DEEP_TABLE_SPLIT_MODE
  status: VNextDeepTableSplitPlanStatus
  documentId: string
  engineContract: {
    consumes: "document-v3-table-structure"
    produces: "deep-table-split-readiness"
    executesPagination: false
    executesConcreteLayout: false
    mayRelayoutDocument: false
    mutatesDocument: false
    supportsTextLineSplit: true
    supportsNonTextChildSplit: false
  }
  tableCount: number
  rowCount: number
  splitCandidateCount: number
  blockedRowCount: number
  rowPlans: VNextDeepTableRowSplitPlan[]
  blockingIssues: VNextDeepTableSplitIssue[]
}

function issue(
  code: VNextDeepTableSplitIssueCode,
  sectionId: string,
  tableId: string,
  message: string,
  extra: Partial<Pick<VNextDeepTableSplitIssue, "rowId" | "cellId" | "nodeId">> = {},
): VNextDeepTableSplitIssue {
  return {
    severity: "blocking",
    code,
    sectionId,
    tableId,
    ...extra,
    message,
  }
}

function childPolicy(child: AuthoredNode | undefined): VNextDeepTableCellChildPolicy {
  if (child == null) return "unsupported"
  if (child.type === "text-block") return "splittable-text"
  if (child.type === "toc") return "generated-atomic"
  if (child.type === "page-break") return "ignored-page-break"
  if (child.type === "divider" || child.type === "spacer") return "atomic-block"
  return "unsupported"
}

function cellSplitSupport(childPlans: VNextDeepTableCellChildPlan[]): VNextDeepTableCellSplitSupport {
  if (childPlans.length === 0) return "empty"
  if (childPlans.every((child) => child.policy === "splittable-text")) return "line-range"
  if (childPlans.every((child) => (
    child.policy === "atomic-block" ||
    child.policy === "generated-atomic" ||
    child.policy === "ignored-page-break"
  ))) return "atomic"
  return "blocked"
}

function tableCellPlan(section: DocumentSection, cell: TableCellNode, cellIndex: number): VNextDeepTableCellSplitPlan {
  const childPlans = cell.childIds.map((childId) => {
    const child = section.nodes[childId]

    return {
      nodeId: childId,
      nodeType: child?.type ?? "text",
      policy: childPolicy(child),
    }
  })

  return {
    cellId: cell.id,
    cellIndex,
    splitSupport: cellSplitSupport(childPlans),
    childPlans,
  }
}

function rowStrategy(
  row: TableRowNode,
  cellPlans: VNextDeepTableCellSplitPlan[],
): VNextDeepTableSplitRowStrategy {
  if (row.props.allowBreak === false) return "atomic-row"
  if (cellPlans.every((cell) => cell.splitSupport === "empty")) return "empty-row"
  if (cellPlans.length > 0 && cellPlans.every((cell) => cell.splitSupport === "line-range" || cell.splitSupport === "empty")) {
    return "text-line-range"
  }
  return "blocked-deep-content"
}

function collectTablePlan(
  section: DocumentSection,
  table: TableNode,
  blockingIssues: VNextDeepTableSplitIssue[],
): VNextDeepTableRowSplitPlan[] {
  return table.rowIds.flatMap((rowId, rowIndex) => {
    const row = section.nodes[rowId]
    if (row?.type !== "table-row") {
      blockingIssues.push(issue(
        "missing-row",
        section.id,
        table.id,
        `Table "${table.id}" references missing row "${rowId}".`,
        { rowId },
      ))
      return []
    }

    const cellPlans = row.cellIds.flatMap((cellId, cellIndex): VNextDeepTableCellSplitPlan[] => {
      const cell = section.nodes[cellId]
      if (cell?.type !== "table-cell") {
        blockingIssues.push(issue(
          "missing-cell",
          section.id,
          table.id,
          `Table row "${row.id}" references missing cell "${cellId}".`,
          { rowId: row.id, cellId },
        ))
        return []
      }

      return [tableCellPlan(section, cell, cellIndex)]
    })
    const splitStrategy = rowStrategy(row, cellPlans)

    if (splitStrategy === "blocked-deep-content") {
      cellPlans.forEach((cellPlan) => {
        cellPlan.childPlans
          .filter((childPlan) => childPlan.policy !== "splittable-text")
          .forEach((childPlan) => {
            blockingIssues.push(issue(
              childPlan.policy === "unsupported" ? "unsupported-cell-child" : "non-text-cell-child-split-deferred",
              section.id,
              table.id,
              `Table row "${row.id}" requires deferred deep splitting for cell child "${childPlan.nodeId}".`,
              { rowId: row.id, cellId: cellPlan.cellId, nodeId: childPlan.nodeId },
            ))
          })
      })
    }

    return [{
      tableId: table.id,
      rowId: row.id,
      rowIndex,
      allowBreak: row.props.allowBreak !== false,
      splitStrategy,
      cellPlans,
    }]
  })
}

export function createVNextDeepTableSplitPlan(document: DocumentNode): VNextDeepTableSplitPlan {
  const blockingIssues: VNextDeepTableSplitIssue[] = []
  const tables: TableNode[] = []
  const rowPlans = document.document.sections.flatMap((section) => (
    Object.values(section.nodes).flatMap((node): VNextDeepTableRowSplitPlan[] => {
      if (node.type !== "table") return []
      tables.push(node)
      return collectTablePlan(section, node, blockingIssues)
    })
  ))
  const splitCandidateCount = rowPlans.filter((row) => row.splitStrategy === "text-line-range").length
  const blockedRowCount = rowPlans.filter((row) => row.splitStrategy === "blocked-deep-content").length

  return {
    source: VNEXT_DEEP_TABLE_SPLIT_SOURCE,
    mode: VNEXT_DEEP_TABLE_SPLIT_MODE,
    status: blockingIssues.length === 0 ? "ready" : "blocked",
    documentId: document.document.id,
    engineContract: {
      consumes: "document-v3-table-structure",
      produces: "deep-table-split-readiness",
      executesPagination: false,
      executesConcreteLayout: false,
      mayRelayoutDocument: false,
      mutatesDocument: false,
      supportsTextLineSplit: true,
      supportsNonTextChildSplit: false,
    },
    tableCount: tables.length,
    rowCount: rowPlans.length,
    splitCandidateCount,
    blockedRowCount,
    rowPlans,
    blockingIssues,
  }
}
