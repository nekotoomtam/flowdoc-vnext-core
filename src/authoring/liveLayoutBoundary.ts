import type { NodeId, SectionId } from "../graph/relationshipGraph.js"
import type { VNextEditableSelection } from "./editableSession.js"
import type { VNextAuthoringIntentHistoryRecord } from "./intentHistory.js"
import type { VNextTextTransactionDirtyScope } from "./textTransactions.js"

export type VNextLiveLayoutScopeKind =
  | "text-block"
  | "table"
  | "node"
  | "section"
  | "document"

export type VNextLiveLayoutReason =
  | "selection-only"
  | "no-dirty-scope"
  | "text-content"
  | "table-region"
  | "node-structure"
  | "section-layout"
  | "document-layout"

export type VNextLiveLayoutFreshnessStatus = "fresh" | "stale"
export type VNextExactGenerationFreshnessStatus = "unchanged" | "stale"

export type VNextLiveLayoutVisibleRange =
  | { kind: "unbounded" }
  | {
      kind: "section-window"
      sectionId: SectionId
      zoneId?: NodeId
      startNodeId?: NodeId
      endNodeId?: NodeId
      overscanBefore?: number
      overscanAfter?: number
    }

export type VNextLiveLayoutDirtyScope =
  | VNextTextTransactionDirtyScope
  | {
      kind: "table"
      sectionId: SectionId
      zoneId: NodeId
      tableId: NodeId
      parentNodeIds: readonly NodeId[]
    }
  | {
      kind: "node"
      sectionId: SectionId
      zoneId: NodeId
      nodeId: NodeId
      parentNodeIds: readonly NodeId[]
    }
  | {
      kind: "section"
      sectionId: SectionId
      zoneIds: readonly NodeId[]
    }
  | {
      kind: "document"
      sectionIds: readonly SectionId[]
    }

export interface VNextLiveLayoutAffectedScope {
  sectionIds: SectionId[]
  zoneIds: NodeId[]
  nodeIds: NodeId[]
  parentNodeIds: NodeId[]
  textBlockIds: NodeId[]
  tableIds: NodeId[]
}

export interface VNextExactGenerationStaleMarker {
  status: VNextExactGenerationFreshnessStatus
  reason: VNextLiveLayoutReason
  finalTruth: "measured-pagination"
}

export interface VNextLiveLayoutFreshness {
  liveLayout: VNextLiveLayoutFreshnessStatus
  exactGeneration: VNextExactGenerationStaleMarker
}

export interface VNextLiveLayoutRequest {
  kind: "live-layout-request"
  requestId: string
  reason: Exclude<VNextLiveLayoutReason, "selection-only" | "no-dirty-scope">
  visibleRange: VNextLiveLayoutVisibleRange
  dirtyScopes: VNextLiveLayoutDirtyScope[]
  affected: VNextLiveLayoutAffectedScope
  freshness: VNextLiveLayoutFreshness
}

export type VNextLiveLayoutBoundaryResult =
  | {
      kind: "no-layout-request"
      reason: "selection-only" | "no-dirty-scope"
      visibleRange: VNextLiveLayoutVisibleRange
      dirtyScopes: []
      affected: VNextLiveLayoutAffectedScope
      freshness: VNextLiveLayoutFreshness
      request: null
    }
  | {
      kind: "layout-request"
      reason: Exclude<VNextLiveLayoutReason, "selection-only" | "no-dirty-scope">
      visibleRange: VNextLiveLayoutVisibleRange
      dirtyScopes: VNextLiveLayoutDirtyScope[]
      affected: VNextLiveLayoutAffectedScope
      freshness: VNextLiveLayoutFreshness
      request: VNextLiveLayoutRequest
    }

export type VNextLiveLayoutBoundaryInput =
  | {
      kind: "selection"
      selection: VNextEditableSelection
      visibleRange?: VNextLiveLayoutVisibleRange
    }
  | {
      kind: "dirty-scopes"
      dirtyScopes: readonly VNextLiveLayoutDirtyScope[]
      visibleRange?: VNextLiveLayoutVisibleRange
    }
  | {
      kind: "authoring-history"
      records: readonly VNextAuthoringIntentHistoryRecord[]
      visibleRange?: VNextLiveLayoutVisibleRange
    }

const DEFAULT_VISIBLE_RANGE: VNextLiveLayoutVisibleRange = { kind: "unbounded" }

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function emptyAffectedScope(): VNextLiveLayoutAffectedScope {
  return {
    sectionIds: [],
    zoneIds: [],
    nodeIds: [],
    parentNodeIds: [],
    textBlockIds: [],
    tableIds: [],
  }
}

function pushUnique<T>(items: T[], item: T): void {
  if (!items.includes(item)) items.push(item)
}

function addDirtyScope(affected: VNextLiveLayoutAffectedScope, scope: VNextLiveLayoutDirtyScope): void {
  if (scope.kind === "document") {
    scope.sectionIds.forEach((sectionId) => pushUnique(affected.sectionIds, sectionId))
    return
  }

  pushUnique(affected.sectionIds, scope.sectionId)

  if (scope.kind === "section") {
    scope.zoneIds.forEach((zoneId) => pushUnique(affected.zoneIds, zoneId))
    return
  }

  pushUnique(affected.zoneIds, scope.zoneId)

  if (scope.kind === "text-block") {
    pushUnique(affected.nodeIds, scope.textBlockId)
    pushUnique(affected.textBlockIds, scope.textBlockId)
    scope.parentNodeIds.forEach((nodeId) => pushUnique(affected.parentNodeIds, nodeId))
    return
  }

  if (scope.kind === "table") {
    pushUnique(affected.nodeIds, scope.tableId)
    pushUnique(affected.tableIds, scope.tableId)
    scope.parentNodeIds.forEach((nodeId) => pushUnique(affected.parentNodeIds, nodeId))
    return
  }

  pushUnique(affected.nodeIds, scope.nodeId)
  scope.parentNodeIds.forEach((nodeId) => pushUnique(affected.parentNodeIds, nodeId))
}

function affectedScopeForDirtyScopes(
  dirtyScopes: readonly VNextLiveLayoutDirtyScope[],
): VNextLiveLayoutAffectedScope {
  const affected = emptyAffectedScope()
  dirtyScopes.forEach((scope) => addDirtyScope(affected, scope))
  return affected
}

function reasonForDirtyScopes(
  dirtyScopes: readonly VNextLiveLayoutDirtyScope[],
): Exclude<VNextLiveLayoutReason, "selection-only" | "no-dirty-scope"> {
  if (dirtyScopes.some((scope) => scope.kind === "document")) return "document-layout"
  if (dirtyScopes.some((scope) => scope.kind === "section")) return "section-layout"
  if (dirtyScopes.some((scope) => scope.kind === "table")) return "table-region"
  if (dirtyScopes.some((scope) => scope.kind === "node")) return "node-structure"
  return "text-content"
}

function requestIdFor(
  reason: VNextLiveLayoutRequest["reason"],
  affected: VNextLiveLayoutAffectedScope,
): string {
  const ids = [
    ...affected.textBlockIds.map((id) => `text:${id}`),
    ...affected.tableIds.map((id) => `table:${id}`),
    ...affected.nodeIds.map((id) => `node:${id}`),
    ...affected.sectionIds.map((id) => `section:${id}`),
  ]

  return ids.length === 0
    ? `live-layout:${reason}`
    : `live-layout:${reason}:${ids.join(",")}`
}

function exactMarker(reason: VNextLiveLayoutReason, stale: boolean): VNextExactGenerationStaleMarker {
  return {
    status: stale ? "stale" : "unchanged",
    reason,
    finalTruth: "measured-pagination",
  }
}

function noLayoutRequest(
  reason: "selection-only" | "no-dirty-scope",
  visibleRange: VNextLiveLayoutVisibleRange,
): VNextLiveLayoutBoundaryResult {
  return {
    kind: "no-layout-request",
    reason,
    visibleRange: cloneJson(visibleRange),
    dirtyScopes: [],
    affected: emptyAffectedScope(),
    freshness: {
      liveLayout: "fresh",
      exactGeneration: exactMarker(reason, false),
    },
    request: null,
  }
}

function layoutRequest(
  dirtyScopes: readonly VNextLiveLayoutDirtyScope[],
  visibleRange: VNextLiveLayoutVisibleRange,
): VNextLiveLayoutBoundaryResult {
  const reason = reasonForDirtyScopes(dirtyScopes)
  const affected = affectedScopeForDirtyScopes(dirtyScopes)
  const freshness: VNextLiveLayoutFreshness = {
    liveLayout: "stale",
    exactGeneration: exactMarker(reason, true),
  }
  const normalizedDirtyScopes = dirtyScopes.map((scope) => cloneJson(scope))
  const normalizedVisibleRange = cloneJson(visibleRange)
  const request: VNextLiveLayoutRequest = {
    kind: "live-layout-request",
    requestId: requestIdFor(reason, affected),
    reason,
    visibleRange: normalizedVisibleRange,
    dirtyScopes: normalizedDirtyScopes,
    affected,
    freshness,
  }

  return {
    kind: "layout-request",
    reason,
    visibleRange: normalizedVisibleRange,
    dirtyScopes: normalizedDirtyScopes,
    affected,
    freshness,
    request,
  }
}

function dirtyScopesFromAuthoringHistory(
  records: readonly VNextAuthoringIntentHistoryRecord[],
): VNextLiveLayoutDirtyScope[] {
  return records.flatMap((record) => {
    if (record.status !== "committed" || record.historyAction !== "undoable") return []
    return record.dirtyScopes.map((scope) => cloneJson(scope))
  })
}

export function resolveVNextLiveLayoutBoundary(
  input: VNextLiveLayoutBoundaryInput,
): VNextLiveLayoutBoundaryResult {
  const visibleRange = input.visibleRange ?? DEFAULT_VISIBLE_RANGE

  if (input.kind === "selection") {
    return noLayoutRequest("selection-only", visibleRange)
  }

  const dirtyScopes = input.kind === "dirty-scopes"
    ? input.dirtyScopes
    : dirtyScopesFromAuthoringHistory(input.records)

  if (dirtyScopes.length === 0) {
    return noLayoutRequest("no-dirty-scope", visibleRange)
  }

  return layoutRequest(dirtyScopes, visibleRange)
}
