import { safeParseFlowDocPackageV3DocumentV4, type FlowDocPackageV3DocumentV4 } from "../persistence/packageV3.js"
import { safeCreateVNextReadOnlyRuntimeSessionV4, type VNextReadOnlyParentRefV4 } from "../runtime/readOnlySessionV4.js"
import type { VNextOperationCommitMetadata, VNextOperationFailureReason, VNextOperationIssue } from "./results.js"
import type { VNextOperationSource } from "./commands.js"

export type VNextDocumentV4OperationCommand =
  | { kind: "node.delete"; nodeId: string; source?: VNextOperationSource }
  | { kind: "node.reorder"; nodeId: string; source?: VNextOperationSource; toIndex: number }

export type VNextDocumentV4OperationResult =
  | {
      command: VNextDocumentV4OperationCommand
      issues: VNextOperationIssue[]
      ok: true
      operation: VNextOperationCommitMetadata
      package: FlowDocPackageV3DocumentV4
    }
  | {
      command: VNextDocumentV4OperationCommand
      issues: VNextOperationIssue[]
      ok: false
      package: FlowDocPackageV3DocumentV4 | null
      reason: VNextOperationFailureReason
    }

const REORDERABLE_TYPES = new Set([
  "text-block", "columns", "table", "toc", "page-break", "divider", "spacer", "image",
])

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(code: string, message: string, nodeId?: string): VNextOperationIssue {
  return { code, message, path: "", severity: "error", ...(nodeId ? { nodeId } : {}) }
}

function parentId(parent: VNextReadOnlyParentRefV4): string | null {
  if (parent.kind === "zone") return parent.zoneId
  if (parent.kind === "column") return parent.columnId
  if (parent.kind === "table-cell") return parent.cellId
  return null
}

function childList(
  pack: FlowDocPackageV3DocumentV4,
  sectionId: string,
  parent: VNextReadOnlyParentRefV4,
): string[] | null {
  const section = pack.document.document.sections.find((item) => item.id === sectionId)
  if (!section) return null
  if (parent.kind === "zone") {
    const node = section.nodes[parent.zoneId]
    return node?.type === "zone" ? node.childIds : null
  }
  if (parent.kind === "column") {
    const node = section.nodes[parent.columnId]
    return node?.type === "column" ? node.childIds : null
  }
  if (parent.kind === "table-cell") {
    const node = section.nodes[parent.cellId]
    return node?.type === "table-cell" ? node.childIds : null
  }
  return null
}

export function runVNextDocumentV4Operation(
  packageValue: unknown,
  command: VNextDocumentV4OperationCommand,
): VNextDocumentV4OperationResult {
  const sessionResult = safeCreateVNextReadOnlyRuntimeSessionV4(packageValue)
  if (!sessionResult.ok) {
    return {
      command,
      issues: sessionResult.issues.map((item) => issue(item.code, item.message)),
      ok: false,
      package: null,
      reason: "invalid-document",
    }
  }
  const { session } = sessionResult
  const node = session.graph.nodesById.get(command.nodeId)
  if (!node) {
    return { command, issues: [issue("target-not-found", `node "${command.nodeId}" was not found`, command.nodeId)], ok: false, package: session.package, reason: "target-not-found" }
  }
  if (!REORDERABLE_TYPES.has(node.type)) {
    return { command, issues: [issue(`cannot-${command.kind === "node.delete" ? "delete" : "reorder"}`, `${node.type} cannot be mutated`, node.id)], ok: false, package: session.package, reason: "unsupported-target" }
  }
  const parent = session.graph.parentByNodeId.get(node.id)
  const sectionId = session.graph.sectionByNodeId.get(node.id)
  if (!parent || !sectionId || parentId(parent) == null) {
    return { command, issues: [issue("unsupported-parent", "node must be a block child of zone, column, or table-cell", node.id)], ok: false, package: session.package, reason: "unsupported-target" }
  }
  const mutated = cloneJson(session.package)
  const siblings = childList(mutated, sectionId, parent)
  if (!siblings) {
    return { command, issues: [issue("invalid-parent", "parent list could not be resolved", node.id)], ok: false, package: session.package, reason: "invalid-document" }
  }
  const currentIndex = siblings.indexOf(node.id)
  if (currentIndex < 0) {
    return { command, issues: [issue("invalid-parent", "parent does not contain target node", node.id)], ok: false, package: session.package, reason: "invalid-document" }
  }

  if (command.kind === "node.delete") {
    const deleteIds: string[] = []
    const collect = (nodeId: string): void => {
      deleteIds.push(nodeId)
      for (const childId of session.graph.childrenByNodeId.get(nodeId) ?? []) collect(childId)
    }
    collect(node.id)
    siblings.splice(currentIndex, 1)
    const section = mutated.document.document.sections.find((item) => item.id === sectionId)
    if (!section) {
      return { command, issues: [issue("missing-section", "target section could not be resolved", node.id)], ok: false, package: session.package, reason: "invalid-document" }
    }
    deleteIds.forEach((deleteId) => { delete section.nodes[deleteId] })
    const validated = safeParseFlowDocPackageV3DocumentV4(mutated)
    if (!validated.ok) {
      return { command, issues: validated.issues.map((item) => issue(item.code, item.message, node.id)), ok: false, package: session.package, reason: "validation-failed" }
    }
    const context = session.graph.nearestByNodeId.get(node.id)
    const ownerId = parentId(parent) as string
    const scope = {
      sectionIds: [sectionId],
      zoneIds: context ? [context.zoneId] : [],
      nodeIds: deleteIds,
      parentNodeIds: [ownerId],
      tableIds: context?.tableId ? [context.tableId] : [],
      textBlockIds: deleteIds.filter((id) => session.graph.nodesById.get(id)?.type === "text-block"),
    }
    return {
      command,
      issues: [],
      ok: true,
      operation: {
        historyPolicy: { durableIntent: "structure", kind: "single-entry", summary: `delete ${node.type} ${node.id}` },
        kind: "node.delete",
        renderInvalidation: { affectedNodeIds: [...deleteIds, ownerId], affectedSectionIds: [sectionId], lane: "node-structure", pageScope: { kind: "unknown", reason: "pagination-not-integrated" } },
        scope,
        source: command.source ?? "user",
        targetNodeIds: [node.id],
        validationPolicy: "full",
      },
      package: validated.package,
    }
  }

  if (!Number.isInteger(command.toIndex) || command.toIndex < 0 || command.toIndex >= siblings.length) {
    return { command, issues: [issue("invalid-index", `toIndex must be less than sibling count ${siblings?.length ?? 0}`, node.id)], ok: false, package: session.package, reason: "invalid-command" }
  }
  siblings.splice(currentIndex, 1)
  siblings.splice(command.toIndex, 0, node.id)
  const validated = safeParseFlowDocPackageV3DocumentV4(mutated)
  if (!validated.ok) {
    return { command, issues: validated.issues.map((item) => issue(item.code, item.message, node.id)), ok: false, package: session.package, reason: "validation-failed" }
  }
  const context = session.graph.nearestByNodeId.get(node.id)
  const ownerId = parentId(parent) as string
  const scope = {
    sectionIds: [sectionId],
    zoneIds: context ? [context.zoneId] : [],
    nodeIds: [node.id],
    parentNodeIds: [ownerId],
    tableIds: context?.tableId ? [context.tableId] : [],
    textBlockIds: node.type === "text-block" ? [node.id] : [],
  }
  return {
    command,
    issues: [],
    ok: true,
    operation: {
      historyPolicy: { durableIntent: "structure", kind: "single-entry", summary: `reorder ${node.type} ${node.id}` },
      kind: "node.reorder",
      renderInvalidation: {
        affectedNodeIds: [node.id, ownerId],
        affectedSectionIds: [sectionId],
        lane: "node-structure",
        pageScope: { kind: "unknown", reason: "pagination-not-integrated" },
      },
      scope,
      source: command.source ?? "user",
      targetNodeIds: [node.id],
      validationPolicy: "full",
    },
    package: validated.package,
  }
}
