import type { RelationshipGraph } from "../graph/relationshipGraph.js"
import { buildRelationshipGraph } from "../graph/relationshipGraph.js"
import type { VNextOperationKind } from "../operations/commands.js"
import { getSupportedVNextOperationKinds } from "../operations/registry.js"
import type {
  DataSnapshot,
  FieldRegistry,
  FlowDocPackageParseIssue,
  FlowDocPackageParseReason,
  FlowDocPackageV2DocumentVNext,
} from "../persistence/package.js"
import { safeParseFlowDocPackageV2DocumentVNext } from "../persistence/package.js"
import type { DocumentNode } from "../schema/document.js"

export type VNextRuntimeSessionSource =
  | "canonical-vnext-package"
  | "fixture"

export type VNextRuntimeSessionFailureReason =
  | FlowDocPackageParseReason
  | "invalid-document"

export interface VNextRuntimeSessionOptions {
  source?: VNextRuntimeSessionSource
}

export interface VNextRuntimeSessionDiagnostics {
  graphIssueCount: number
  supportedOperationKinds: readonly VNextOperationKind[]
}

export interface VNextRuntimeSession {
  source: "vnext-runtime-session"
  sourceKind: VNextRuntimeSessionSource
  packageVersion: 2
  documentVersion: 3
  package: FlowDocPackageV2DocumentVNext
  document: DocumentNode
  fields: FieldRegistry
  data?: DataSnapshot
  graph: RelationshipGraph
  diagnostics: VNextRuntimeSessionDiagnostics
}

export type VNextRuntimeSessionResult =
  | { ok: true; session: VNextRuntimeSession }
  | {
      ok: false
      reason: VNextRuntimeSessionFailureReason
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

export function safeCreateVNextRuntimeSession(
  value: unknown,
  options: VNextRuntimeSessionOptions = {},
): VNextRuntimeSessionResult {
  const parsed = safeParseFlowDocPackageV2DocumentVNext(value)

  if (!parsed.ok) {
    return {
      ok: false,
      reason: parsed.reason,
      issues: parsed.issues,
    }
  }

  try {
    const graph = buildRelationshipGraph(parsed.package.document)

    return {
      ok: true,
      session: {
        source: "vnext-runtime-session",
        sourceKind: options.source ?? "canonical-vnext-package",
        packageVersion: parsed.package.packageVersion,
        documentVersion: parsed.package.document.version,
        package: parsed.package,
        document: parsed.package.document,
        fields: parsed.package.fields,
        data: parsed.package.data,
        graph,
        diagnostics: {
          graphIssueCount: graph.diagnostics.issues.length,
          supportedOperationKinds: getSupportedVNextOperationKinds(),
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

export function createVNextRuntimeSession(
  value: unknown,
  options: VNextRuntimeSessionOptions = {},
): VNextRuntimeSession {
  const result = safeCreateVNextRuntimeSession(value, options)

  if (!result.ok) {
    throw new Error(result.issues.map((issue) => `[${issue.path}] ${issue.message}`).join("\n"))
  }

  return result.session
}
