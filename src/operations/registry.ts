import type { VNextOperationKind } from "./commands.js"
import { VNEXT_OPERATION_KINDS } from "./commands.js"
import type { VNextOperationHistoryPolicy, VNextOperationRenderInvalidation } from "./results.js"

export interface VNextOperationRegistryEntry {
  kind: VNextOperationKind
  group: "node" | "columns" | "text-block" | "table"
  defaultHistoryIntent: VNextOperationHistoryPolicy["durableIntent"]
  defaultInvalidationLane: VNextOperationRenderInvalidation["lane"]
}

export const VNEXT_OPERATION_REGISTRY: readonly VNextOperationRegistryEntry[] = [
  { kind: "node.delete", group: "node", defaultHistoryIntent: "structure", defaultInvalidationLane: "node-structure" },
  { kind: "node.duplicate", group: "node", defaultHistoryIntent: "structure", defaultInvalidationLane: "node-structure" },
  { kind: "node.reorder", group: "node", defaultHistoryIntent: "structure", defaultInvalidationLane: "node-structure" },
  { kind: "columns.insert", group: "columns", defaultHistoryIntent: "structure", defaultInvalidationLane: "node-structure" },
  { kind: "columns.layout.patch", group: "columns", defaultHistoryIntent: "layout", defaultInvalidationLane: "node-layout" },
  { kind: "text-block.insert", group: "text-block", defaultHistoryIntent: "structure", defaultInvalidationLane: "node-structure" },
  { kind: "text-block.text.replace", group: "text-block", defaultHistoryIntent: "content", defaultInvalidationLane: "text-content" },
  { kind: "table.row.insert", group: "table", defaultHistoryIntent: "structure", defaultInvalidationLane: "node-structure" },
  { kind: "table.row.delete", group: "table", defaultHistoryIntent: "structure", defaultInvalidationLane: "node-structure" },
  { kind: "table.column.insert", group: "table", defaultHistoryIntent: "structure", defaultInvalidationLane: "node-structure" },
  { kind: "table.column.delete", group: "table", defaultHistoryIntent: "structure", defaultInvalidationLane: "node-structure" },
]

export function getSupportedVNextOperationKinds(): readonly VNextOperationKind[] {
  return VNEXT_OPERATION_KINDS
}

