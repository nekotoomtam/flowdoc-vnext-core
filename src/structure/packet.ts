import type { AuthoredNode, DocumentNode } from "../schema/document.js"
import type { NodeId, NodeType, SectionId } from "../graph/relationshipGraph.js"
import type { VNextOperationKind } from "../operations/commands.js"
import type {
  VNextOperationCommitMetadata,
  VNextOperationIssue,
  VNextOperationRenderInvalidation,
  VNextOperationResult,
  VNextOperationScope,
} from "../operations/results.js"

export const STRUCTURAL_PACKET_SOURCE = "flowdoc-structural-packet"
export const STRUCTURAL_PACKET_VERSION = 1
export const STRUCTURAL_PACKET_STAGE = "foundation-bridge"

export type StructuralPacketStatus = "applied" | "rejected"
export type StructuralParentKind = "section" | NodeType
export type StructuralChildField = "zoneIds" | "childIds" | "columnIds" | "rowIds" | "cellIds"
export type StructuralParentListPatchOp = "insert" | "remove" | "move" | "replace"

export interface StructuralParentListPatch {
  readonly op: StructuralParentListPatchOp
  readonly sectionId: SectionId
  readonly parentId: SectionId | NodeId
  readonly parentKind: StructuralParentKind
  readonly childField: StructuralChildField
  readonly nodeId?: NodeId
  readonly fromIndex?: number
  readonly toIndex?: number
  readonly before: readonly NodeId[]
  readonly after: readonly NodeId[]
}

export interface StructuralPacketIssue {
  readonly severity: VNextOperationIssue["severity"]
  readonly code: string
  readonly path: string
  readonly nodeId?: NodeId
  readonly message: string
}

export interface StructuralChangePacket {
  readonly source: typeof STRUCTURAL_PACKET_SOURCE
  readonly packetVersion: typeof STRUCTURAL_PACKET_VERSION
  readonly stage: typeof STRUCTURAL_PACKET_STAGE
  readonly action: VNextOperationKind
  readonly status: StructuralPacketStatus
  readonly baseRevision: number
  readonly nextRevision: number
  readonly operation: VNextOperationCommitMetadata | null
  readonly failureReason: string | null
  readonly nodesAdded: readonly AuthoredNode[]
  readonly nodesUpdated: readonly AuthoredNode[]
  readonly nodeIdsRemoved: readonly NodeId[]
  readonly parentListPatches: readonly StructuralParentListPatch[]
  readonly changedNodeIds: readonly NodeId[]
  readonly affectedParentNodeIds: readonly NodeId[]
  readonly dirtyScopes: readonly VNextOperationScope[]
  readonly renderInvalidation: VNextOperationRenderInvalidation | null
  readonly issues: readonly StructuralPacketIssue[]
}

export interface CreateStructuralChangePacketInput {
  readonly beforeDocument: DocumentNode
  readonly result: VNextOperationResult
  readonly baseRevision: number
  readonly nextRevision?: number
}

export type StructuralPacketValidationResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: StructuralPacketIssue[] }

interface NodeEntry {
  readonly id: NodeId
  readonly node: AuthoredNode
}

interface ParentListSnapshot {
  readonly key: string
  readonly sectionId: SectionId
  readonly parentId: SectionId | NodeId
  readonly parentKind: StructuralParentKind
  readonly childField: StructuralChildField
  readonly ids: readonly NodeId[]
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(code: string, message: string, path = "", nodeId?: NodeId): StructuralPacketIssue {
  return {
    severity: "error",
    code,
    message,
    nodeId,
    path,
  }
}

function packetIssues(issues: readonly VNextOperationIssue[]): StructuralPacketIssue[] {
  return issues.map((item) => ({
    severity: item.severity,
    code: item.code,
    message: item.message,
    nodeId: item.nodeId,
    path: item.path,
  }))
}

function finiteRevision(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.trunc(value) : fallback
}

function nodeEntries(document: DocumentNode): NodeEntry[] {
  return document.document.sections.flatMap((section) =>
    Object.values(section.nodes).map((node) => ({ id: node.id, node })),
  )
}

function nodeMap(document: DocumentNode): Map<NodeId, AuthoredNode> {
  return new Map(nodeEntries(document).map((entry) => [entry.id, entry.node]))
}

function nodeIds(document: DocumentNode): NodeId[] {
  return nodeEntries(document).map((entry) => entry.id)
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function childListForNode(node: AuthoredNode): { childField: StructuralChildField; ids: readonly NodeId[] } | null {
  if (node.type === "zone" || node.type === "column" || node.type === "table-cell") {
    return { childField: "childIds", ids: node.childIds }
  }
  if (node.type === "columns") return { childField: "columnIds", ids: node.columnIds }
  if (node.type === "table") return { childField: "rowIds", ids: node.rowIds }
  if (node.type === "table-row") return { childField: "cellIds", ids: node.cellIds }
  return null
}

function parentListSnapshots(document: DocumentNode): Map<string, ParentListSnapshot> {
  const snapshots = new Map<string, ParentListSnapshot>()

  document.document.sections.forEach((section) => {
    const sectionKey = `${section.id}:section:zoneIds`
    snapshots.set(sectionKey, {
      childField: "zoneIds",
      ids: [...section.zoneIds],
      key: sectionKey,
      parentId: section.id,
      parentKind: "section",
      sectionId: section.id,
    })

    Object.values(section.nodes).forEach((node) => {
      const childList = childListForNode(node)
      if (childList == null) return

      const key = `${section.id}:${node.id}:${childList.childField}`
      snapshots.set(key, {
        childField: childList.childField,
        ids: [...childList.ids],
        key,
        parentId: node.id,
        parentKind: node.type,
        sectionId: section.id,
      })
    })
  })

  return snapshots
}

function listEquals(left: readonly NodeId[], right: readonly NodeId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index])
}

function sameIdSet(left: readonly NodeId[], right: readonly NodeId[]): boolean {
  if (left.length !== right.length) return false
  const rightSet = new Set(right)
  return left.every((id) => rightSet.has(id))
}

function firstInsertedId(before: readonly NodeId[], after: readonly NodeId[]): NodeId | undefined {
  const beforeSet = new Set(before)
  return after.find((id) => !beforeSet.has(id))
}

function firstRemovedId(before: readonly NodeId[], after: readonly NodeId[]): NodeId | undefined {
  const afterSet = new Set(after)
  return before.find((id) => !afterSet.has(id))
}

function movedNodeId(result: VNextOperationResult, before: readonly NodeId[], after: readonly NodeId[]): NodeId | undefined {
  if (result.command.kind === "node.reorder" && before.includes(result.command.nodeId) && after.includes(result.command.nodeId)) {
    return result.command.nodeId
  }

  return after.find((id) => before.includes(id) && before.indexOf(id) !== after.indexOf(id))
}

function patchForChangedList(
  result: VNextOperationResult,
  before: ParentListSnapshot,
  after: ParentListSnapshot,
): StructuralParentListPatch {
  const base = {
    after: [...after.ids],
    before: [...before.ids],
    childField: after.childField,
    parentId: after.parentId,
    parentKind: after.parentKind,
    sectionId: after.sectionId,
  }

  if (after.ids.length === before.ids.length + 1) {
    const nodeId = firstInsertedId(before.ids, after.ids)
    return {
      ...base,
      nodeId,
      op: "insert",
      toIndex: nodeId == null ? undefined : after.ids.indexOf(nodeId),
    }
  }

  if (after.ids.length + 1 === before.ids.length) {
    const nodeId = firstRemovedId(before.ids, after.ids)
    return {
      ...base,
      fromIndex: nodeId == null ? undefined : before.ids.indexOf(nodeId),
      nodeId,
      op: "remove",
    }
  }

  if (sameIdSet(before.ids, after.ids)) {
    const nodeId = movedNodeId(result, before.ids, after.ids)
    return {
      ...base,
      fromIndex: nodeId == null ? undefined : before.ids.indexOf(nodeId),
      nodeId,
      op: "move",
      toIndex: nodeId == null ? undefined : after.ids.indexOf(nodeId),
    }
  }

  return {
    ...base,
    op: "replace",
  }
}

function parentListPatches(
  beforeDocument: DocumentNode,
  afterDocument: DocumentNode,
  result: VNextOperationResult,
): StructuralParentListPatch[] {
  const beforeLists = parentListSnapshots(beforeDocument)
  const afterLists = parentListSnapshots(afterDocument)
  const keys = [...new Set([...beforeLists.keys(), ...afterLists.keys()])].sort()

  return keys.flatMap((key) => {
    const before = beforeLists.get(key)
    const after = afterLists.get(key)

    if (before == null || after == null || listEquals(before.ids, after.ids)) return []
    return [patchForChangedList(result, before, after)]
  })
}

function changedNodes(beforeDocument: DocumentNode, afterDocument: DocumentNode) {
  const beforeNodes = nodeMap(beforeDocument)
  const afterNodes = nodeMap(afterDocument)
  const beforeIds = nodeIds(beforeDocument)
  const afterIds = nodeIds(afterDocument)
  const beforeSet = new Set(beforeIds)
  const afterSet = new Set(afterIds)
  const addedIds = afterIds.filter((id) => !beforeSet.has(id))
  const removedIds = beforeIds.filter((id) => !afterSet.has(id))
  const updatedIds = afterIds.filter((id) => {
    const beforeNode = beforeNodes.get(id)
    const afterNode = afterNodes.get(id)
    return beforeNode != null && afterNode != null && !sameJson(beforeNode, afterNode)
  })

  return {
    nodeIdsRemoved: removedIds,
    nodesAdded: addedIds.map((id) => cloneJson(afterNodes.get(id) as AuthoredNode)),
    nodesUpdated: updatedIds.map((id) => cloneJson(afterNodes.get(id) as AuthoredNode)),
  }
}

function uniqueIds(ids: readonly (NodeId | null | undefined)[]): NodeId[] {
  return [...new Set(ids.filter((id): id is NodeId => typeof id === "string" && id.length > 0))]
}

function changedNodeIds(input: {
  nodeIdsRemoved: readonly NodeId[]
  nodesAdded: readonly AuthoredNode[]
  nodesUpdated: readonly AuthoredNode[]
  operation?: VNextOperationCommitMetadata
}): NodeId[] {
  return uniqueIds([
    ...input.nodesAdded.map((node) => node.id),
    ...input.nodesUpdated.map((node) => node.id),
    ...input.nodeIdsRemoved,
    ...(input.operation?.scope.nodeIds ?? []),
  ])
}

function affectedParentNodeIds(
  operation: VNextOperationCommitMetadata | null,
  parentListPatches: readonly StructuralParentListPatch[],
): NodeId[] {
  return uniqueIds([
    ...(operation?.scope.parentNodeIds ?? []),
    ...parentListPatches
      .filter((patch) => patch.parentKind !== "section")
      .map((patch) => patch.parentId as NodeId),
  ])
}

export function createStructuralChangePacket(input: CreateStructuralChangePacketInput): StructuralChangePacket {
  const baseRevision = finiteRevision(input.baseRevision, 0)
  const result = input.result
  const action = result.command.kind

  if (!result.ok) {
    return {
      action,
      affectedParentNodeIds: [],
      baseRevision,
      changedNodeIds: [],
      dirtyScopes: [],
      failureReason: result.reason,
      issues: packetIssues(result.issues),
      nextRevision: baseRevision,
      nodeIdsRemoved: [],
      nodesAdded: [],
      nodesUpdated: [],
      operation: null,
      packetVersion: STRUCTURAL_PACKET_VERSION,
      parentListPatches: [],
      renderInvalidation: null,
      source: STRUCTURAL_PACKET_SOURCE,
      stage: STRUCTURAL_PACKET_STAGE,
      status: "rejected",
    }
  }

  const nextRevision = finiteRevision(input.nextRevision ?? baseRevision + 1, baseRevision + 1)
  const changes = changedNodes(input.beforeDocument, result.document)
  const listPatches = parentListPatches(input.beforeDocument, result.document, result)
  const operation = cloneJson(result.operation)

  return {
    action,
    affectedParentNodeIds: affectedParentNodeIds(operation, listPatches),
    baseRevision,
    changedNodeIds: changedNodeIds({ ...changes, operation }),
    dirtyScopes: [cloneJson(operation.scope)],
    failureReason: null,
    issues: [],
    nextRevision,
    nodeIdsRemoved: changes.nodeIdsRemoved,
    nodesAdded: changes.nodesAdded,
    nodesUpdated: changes.nodesUpdated,
    operation,
    packetVersion: STRUCTURAL_PACKET_VERSION,
    parentListPatches: listPatches,
    renderInvalidation: cloneJson(operation.renderInvalidation),
    source: STRUCTURAL_PACKET_SOURCE,
    stage: STRUCTURAL_PACKET_STAGE,
    status: "applied",
  }
}

export function validateStructuralChangePacket(packet: StructuralChangePacket): StructuralPacketValidationResult {
  const issues: StructuralPacketIssue[] = []

  if (packet.source !== STRUCTURAL_PACKET_SOURCE) {
    issues.push(issue("invalid-source", "structural packet source is invalid", "source"))
  }
  if (packet.packetVersion !== STRUCTURAL_PACKET_VERSION) {
    issues.push(issue("invalid-version", "structural packet version is invalid", "packetVersion"))
  }
  if (packet.stage !== STRUCTURAL_PACKET_STAGE) {
    issues.push(issue("invalid-stage", "structural packet stage is invalid", "stage"))
  }
  if (!Number.isInteger(packet.baseRevision) || packet.baseRevision < 0) {
    issues.push(issue("invalid-base-revision", "baseRevision must be a non-negative integer", "baseRevision"))
  }
  if (!Number.isInteger(packet.nextRevision) || packet.nextRevision < 0) {
    issues.push(issue("invalid-next-revision", "nextRevision must be a non-negative integer", "nextRevision"))
  }

  if (packet.status === "applied") {
    if (packet.nextRevision <= packet.baseRevision) {
      issues.push(issue("invalid-applied-revision", "applied structural packets must advance revision", "nextRevision"))
    }
    if (packet.operation == null) {
      issues.push(issue("missing-operation", "applied structural packets must include operation metadata", "operation"))
    }
    if (packet.renderInvalidation == null) {
      issues.push(issue("missing-render-invalidation", "applied structural packets must include render invalidation", "renderInvalidation"))
    }
  } else {
    if (packet.nextRevision !== packet.baseRevision) {
      issues.push(issue("invalid-rejected-revision", "rejected structural packets must not advance revision", "nextRevision"))
    }
    if (
      packet.nodesAdded.length > 0
      || packet.nodesUpdated.length > 0
      || packet.nodeIdsRemoved.length > 0
      || packet.parentListPatches.length > 0
    ) {
      issues.push(issue("rejected-packet-has-changes", "rejected structural packets must not carry structural changes"))
    }
  }

  packet.parentListPatches.forEach((patch, index) => {
    if (patch.before.length === 0 && patch.after.length === 0) {
      issues.push(issue("empty-parent-list-patch", "parent list patches must carry before or after ids", `parentListPatches[${index}]`))
    }
    if ((patch.op === "insert" || patch.op === "remove" || patch.op === "move") && patch.nodeId == null) {
      issues.push(issue("missing-patch-node", `${patch.op} parent list patches must include nodeId`, `parentListPatches[${index}].nodeId`))
    }
  })

  return issues.length === 0 ? { ok: true, issues: [] } : { ok: false, issues }
}
