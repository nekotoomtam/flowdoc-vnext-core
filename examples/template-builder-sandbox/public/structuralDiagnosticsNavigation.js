import {
  createStructuralOutlineJumpRequest,
} from "./structuralOutlineNavigation.js"

export const STRUCTURAL_DIAGNOSTICS_NAVIGATION_SOURCE = "flowdoc-structural-diagnostics-navigation"
export const STRUCTURAL_DIAGNOSTICS_NAVIGATION_MODE = "structural-diagnostics-navigation"

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function knownNodeSet(nodeIds = []) {
  return new Set((Array.isArray(nodeIds) ? nodeIds : []).filter((nodeId) => typeof nodeId === "string"))
}

function statusSeverity(status) {
  if (status === "blocked" || status === "error") return "error"
  if (status === "ready-with-warnings" || status === "warning" || status === "warn") return "warning"
  return "info"
}

function countSeverity(count) {
  return Number(count) > 0 ? "warning" : "info"
}

function diagnosticSummaryItems(diagnostics = {}) {
  return [
    {
      code: "graph-issues",
      label: "Graph",
      message: `${Number(diagnostics.graphIssueCount || 0)} graph issues`,
      severity: countSeverity(diagnostics.graphIssueCount),
    },
    {
      code: "key-data-status",
      label: "Key data",
      message: `Key data ${diagnostics.keyDataStatus || "unknown"}`,
      severity: statusSeverity(diagnostics.keyDataStatus),
    },
    {
      code: "generation-status",
      label: "Generation",
      message: `Generation ${diagnostics.generationStatus || "unknown"}`,
      severity: statusSeverity(diagnostics.generationStatus),
    },
    {
      code: "exact-layout-status",
      label: "Exact layout",
      message: `Exact layout ${diagnostics.exactLayoutStatus || "unknown"}`,
      severity: statusSeverity(diagnostics.exactLayoutStatus),
    },
    {
      code: "artifact-status",
      label: "Artifact",
      message: `Artifact ${diagnostics.artifactStatus || "unknown"}`,
      severity: statusSeverity(diagnostics.artifactStatus),
    },
  ].map((item) => ({
    ...item,
    canJump: false,
    id: `summary:${item.code}`,
    nodeId: null,
    reason: "document-level",
    targetKind: "document",
    targetLabel: "Document",
  }))
}

function issueItem(issue, index, knownNodeIds) {
  const nodeId = stringOrNull(issue?.nodeId)
  const canJump = Boolean(nodeId && knownNodeIds.has(nodeId))
  const code = stringOrNull(issue?.code) || `issue-${index + 1}`
  const message = stringOrNull(issue?.message) || code

  return {
    canJump,
    code,
    id: `issue:${index}:${code}`,
    label: stringOrNull(issue?.label) || code,
    message,
    nodeId,
    reason: nodeId ? (canJump ? "node-linked" : "missing-node") : "document-level",
    severity: stringOrNull(issue?.severity) || "warning",
    targetKind: nodeId ? "node" : "document",
    targetLabel: nodeId || "Document",
  }
}

export function createStructuralDiagnosticItems(input = {}) {
  const knownNodeIds = knownNodeSet(input.knownNodeIds)
  const issues = Array.isArray(input.issues) ? input.issues : []
  const items = [
    ...diagnosticSummaryItems(input.diagnostics),
    ...issues.map((issue, index) => issueItem(issue, index, knownNodeIds)),
  ]

  return {
    itemCount: items.length,
    items,
    mode: STRUCTURAL_DIAGNOSTICS_NAVIGATION_MODE,
    nodeLinkedCount: items.filter((item) => item.canJump).length,
    source: STRUCTURAL_DIAGNOSTICS_NAVIGATION_SOURCE,
    version: 1,
  }
}

export function createStructuralDiagnosticNavigationRequest(input = {}) {
  const item = input.item && typeof input.item === "object" ? input.item : null
  const nodeId = stringOrNull(input.nodeId ?? item?.nodeId)

  if (!nodeId) {
    return {
      diagnosticId: stringOrNull(item?.id),
      mode: STRUCTURAL_DIAGNOSTICS_NAVIGATION_MODE,
      nodeId: null,
      ok: false,
      reason: "document-level",
      selectionSource: "diagnostics",
      source: STRUCTURAL_DIAGNOSTICS_NAVIGATION_SOURCE,
      version: 1,
      visibleRangeRequest: null,
    }
  }

  const outlineJump = createStructuralOutlineJumpRequest({
    documentRevision: input.documentRevision,
    draftActive: Boolean(input.draftActive),
    node: input.node,
    nodeId,
    previousVisibleRangeRequest: input.previousVisibleRangeRequest,
  })

  return {
    anchorMode: outlineJump.anchorMode,
    diagnosticId: stringOrNull(item?.id),
    mode: STRUCTURAL_DIAGNOSTICS_NAVIGATION_MODE,
    nodeId,
    nodeType: outlineJump.nodeType,
    ok: outlineJump.ok,
    reason: outlineJump.ok ? "diagnostic-node" : outlineJump.reason,
    requestedAtRevision: outlineJump.requestedAtRevision,
    selectionSource: "diagnostics",
    source: STRUCTURAL_DIAGNOSTICS_NAVIGATION_SOURCE,
    version: 1,
    visibleRangeRequest: outlineJump.visibleRangeRequest,
  }
}
