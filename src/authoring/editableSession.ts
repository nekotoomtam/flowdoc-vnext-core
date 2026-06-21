import type { NodeId, OperationSurface, RelationshipGraph, SectionId } from "../graph/relationshipGraph.js"
import { buildRelationshipGraph } from "../graph/relationshipGraph.js"
import type {
  FlowDocPackageParseIssue,
  FlowDocPackageParseReason,
  FlowDocPackageV2DocumentVNext,
} from "../persistence/package.js"
import {
  safeParseFlowDocPackageV2DocumentVNext,
  serializeFlowDocPackageV2DocumentVNext,
} from "../persistence/package.js"
import type { DocumentNode } from "../schema/document.js"
import type { VNextKeyDataDiagnostics } from "../binding/keyDataDiagnostics.js"
import { assessVNextKeyDataDiagnostics } from "../binding/keyDataDiagnostics.js"

export type VNextEditableSessionSource =
  | "canonical-vnext-package"
  | "fixture"

export type VNextEditableSessionFailureReason =
  | FlowDocPackageParseReason
  | "invalid-document"

export type VNextEditableSelection =
  | { kind: "none" }
  | { kind: "node"; nodeId: NodeId; surface: OperationSurface }
  | { kind: "text"; textBlockId: NodeId; anchorOffset: number; focusOffset: number }
  | { kind: "table-cell"; tableId: NodeId; rowId: NodeId; cellId: NodeId }
  | { kind: "column"; columnsId: NodeId; columnId: NodeId }
  | { kind: "zone"; sectionId: SectionId; zoneId: NodeId }

export type VNextEditableDirtyScopeId = string

export interface VNextEditableSessionRevisions {
  document: number
  selection: number
  dirtyScopes: number
}

export interface VNextEditableSessionDiagnostics {
  graphIssueCount: number
  keyData: VNextKeyDataDiagnostics
}

export interface VNextEditableSessionOptions {
  source?: VNextEditableSessionSource
}

export interface VNextEditableSession {
  source: "vnext-editable-session"
  sourceKind: VNextEditableSessionSource
  packageVersion: 2
  documentVersion: 3
  package: FlowDocPackageV2DocumentVNext
  document: DocumentNode
  graph: RelationshipGraph
  selection: VNextEditableSelection
  revisions: VNextEditableSessionRevisions
  dirtyScopes: ReadonlySet<VNextEditableDirtyScopeId>
  diagnostics: VNextEditableSessionDiagnostics
}

export type VNextEditableSessionResult =
  | { ok: true; session: VNextEditableSession }
  | {
      ok: false
      reason: VNextEditableSessionFailureReason
      issues: FlowDocPackageParseIssue[]
    }

function graphErrorIssue(error: unknown): FlowDocPackageParseIssue {
  return {
    severity: "error",
    code: "invalid-document",
    path: "document",
    message: error instanceof Error ? error.message : "document graph validation failed",
  }
}

export function safeCreateVNextEditableSession(
  value: unknown,
  options: VNextEditableSessionOptions = {},
): VNextEditableSessionResult {
  const parsed = safeParseFlowDocPackageV2DocumentVNext(value)

  if (!parsed.ok) {
    return {
      ok: false,
      reason: parsed.reason,
      issues: parsed.issues,
    }
  }

  const pack = serializeFlowDocPackageV2DocumentVNext(parsed.package)

  try {
    const graph = buildRelationshipGraph(pack.document)
    const keyData = assessVNextKeyDataDiagnostics(pack.document, pack.fields, pack.data)

    return {
      ok: true,
      session: {
        source: "vnext-editable-session",
        sourceKind: options.source ?? "canonical-vnext-package",
        packageVersion: pack.packageVersion,
        documentVersion: pack.document.version,
        package: pack,
        document: pack.document,
        graph,
        selection: { kind: "none" },
        revisions: {
          document: 0,
          selection: 0,
          dirtyScopes: 0,
        },
        dirtyScopes: new Set(),
        diagnostics: {
          graphIssueCount: graph.diagnostics.issues.length,
          keyData,
        },
      },
    }
  } catch (error) {
    return {
      ok: false,
      reason: "invalid-document",
      issues: [graphErrorIssue(error)],
    }
  }
}

export function createVNextEditableSession(
  value: unknown,
  options: VNextEditableSessionOptions = {},
): VNextEditableSession {
  const result = safeCreateVNextEditableSession(value, options)

  if (!result.ok) {
    throw new Error(result.issues.map((issue) => `[${issue.path}] ${issue.message}`).join("\n"))
  }

  return result.session
}
