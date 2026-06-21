import type { InlineNode, TextBlockNode, UnitValue } from "../schema/document.js"
import type { NodeId } from "../graph/relationshipGraph.js"

export type VNextOperationSource = "user" | "automation" | "system"

export type VNextOperationCommand =
  | { kind: "node.delete"; source?: VNextOperationSource; nodeId: NodeId }
  | { kind: "node.duplicate"; source?: VNextOperationSource; nodeId: NodeId }
  | { kind: "node.reorder"; source?: VNextOperationSource; nodeId: NodeId; toIndex: number }
  | { kind: "columns.insert"; source?: VNextOperationSource; parentNodeId: NodeId; index: number; columnsId?: NodeId; columnCount: number }
  | { kind: "columns.layout.patch"; source?: VNextOperationSource; columnsId: NodeId; widthShares: number[] }
  | { kind: "text-block.insert"; source?: VNextOperationSource; parentNodeId: NodeId; index: number; node: TextBlockNode }
  | { kind: "text-block.text.replace"; source?: VNextOperationSource; nodeId: NodeId; children: InlineNode[] }
  | { kind: "table.row.insert"; source?: VNextOperationSource; tableId: NodeId; index: number; rowId?: NodeId }
  | { kind: "table.row.delete"; source?: VNextOperationSource; rowId: NodeId }
  | { kind: "table.column.insert"; source?: VNextOperationSource; tableId: NodeId; index: number; width?: UnitValue }
  | { kind: "table.column.delete"; source?: VNextOperationSource; tableId: NodeId; index: number }

export type VNextOperationKind = VNextOperationCommand["kind"]

export const VNEXT_OPERATION_KINDS = [
  "node.delete",
  "node.duplicate",
  "node.reorder",
  "columns.insert",
  "columns.layout.patch",
  "text-block.insert",
  "text-block.text.replace",
  "table.row.insert",
  "table.row.delete",
  "table.column.insert",
  "table.column.delete",
] as const satisfies readonly VNextOperationKind[]

export function vNextOperationCommandTargetNodeIds(command: VNextOperationCommand): NodeId[] {
  if (command.kind === "node.delete" || command.kind === "node.duplicate" || command.kind === "node.reorder") {
    return [command.nodeId]
  }
  if (command.kind === "columns.insert") {
    return command.columnsId == null ? [command.parentNodeId] : [command.parentNodeId, command.columnsId]
  }
  if (command.kind === "columns.layout.patch") {
    return [command.columnsId]
  }
  if (command.kind === "text-block.insert") {
    return [command.parentNodeId, command.node.id]
  }
  if (command.kind === "text-block.text.replace") {
    return [command.nodeId]
  }
  if (command.kind === "table.row.insert") {
    return command.rowId == null ? [command.tableId] : [command.tableId, command.rowId]
  }
  if (command.kind === "table.row.delete") {
    return [command.rowId]
  }
  return [command.tableId]
}

