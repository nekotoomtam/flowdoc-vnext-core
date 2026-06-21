import type { VNextOperationKind } from "../operations/documentOperations.js"
import type {
  FlowDocPackageParseIssue,
  FlowDocPackageV2DocumentVNext,
} from "../persistence/package.js"
import type {
  VNextMeasuredPagination,
  VNextMeasuredPaginationOptions,
} from "../pagination/measuredTypes.js"
import { paginateVNextDocument } from "../pagination/measuredPagination.js"
import type { VNextMeasuredPaginationExportReadiness } from "../pagination/exportReadiness.js"
import { assessVNextMeasuredPaginationExportReadiness } from "../pagination/exportReadiness.js"
import type { VNextMeasuredRendererConsumption } from "../pagination/rendererConsumption.js"
import { buildVNextMeasuredRendererConsumption } from "../pagination/rendererConsumption.js"
import type {
  VNextRuntimeSessionFailureReason,
  VNextRuntimeSessionSource,
} from "../runtime/session.js"
import { safeCreateVNextRuntimeSession } from "../runtime/session.js"
import type { RelationshipGraph } from "../graph/relationshipGraph.js"

export type VNextEditorBridgeRuntimeSource = VNextRuntimeSessionSource

export type VNextEditorBridgeRuntimeStatus =
  | "ready"
  | "ready-with-warnings"
  | "blocked"

export type VNextEditorBridgeRuntimeFailureReason = VNextRuntimeSessionFailureReason

export interface VNextEditorBridgeRuntimeOptions extends VNextMeasuredPaginationOptions {
  source?: VNextEditorBridgeRuntimeSource
}

export interface VNextEditorBridgeRuntimeDiagnostics {
  graphIssueCount: number
  paginationWarningCount: number
  rendererBlockingIssueCount: number
  rendererWarningIssueCount: number
  exportBlockingIssueCount: number
  exportWarningIssueCount: number
  supportedOperationKinds: readonly VNextOperationKind[]
}

export interface VNextEditorBridgeRuntime {
  source: "vnext-editor-bridge-runtime"
  sourceKind: VNextEditorBridgeRuntimeSource
  status: VNextEditorBridgeRuntimeStatus
  packageVersion: 2
  documentVersion: 3
  package: FlowDocPackageV2DocumentVNext
  graph: RelationshipGraph
  pagination: VNextMeasuredPagination
  rendererConsumption: VNextMeasuredRendererConsumption
  exportReadiness: VNextMeasuredPaginationExportReadiness
  diagnostics: VNextEditorBridgeRuntimeDiagnostics
}

export type VNextEditorBridgeRuntimeResult =
  | { ok: true; runtime: VNextEditorBridgeRuntime }
  | {
      ok: false
      reason: VNextEditorBridgeRuntimeFailureReason
      issues: FlowDocPackageParseIssue[]
    }

function statusFromReadiness(
  exportReadiness: VNextMeasuredPaginationExportReadiness,
): VNextEditorBridgeRuntimeStatus {
  return exportReadiness.status
}

export function safeCreateVNextEditorBridgeRuntime(
  value: unknown,
  options: VNextEditorBridgeRuntimeOptions = {},
): VNextEditorBridgeRuntimeResult {
  const sessionResult = safeCreateVNextRuntimeSession(value, {
    source: options.source,
  })

  if (!sessionResult.ok) {
    return {
      ok: false,
      reason: sessionResult.reason,
      issues: sessionResult.issues,
    }
  }

  const session = sessionResult.session
  const pagination = paginateVNextDocument(session.document, {
    ...options,
    data: options.data ?? session.data?.values,
  })
  const rendererConsumption = buildVNextMeasuredRendererConsumption(pagination)
  const exportReadiness = assessVNextMeasuredPaginationExportReadiness(pagination)

  return {
    ok: true,
    runtime: {
      source: "vnext-editor-bridge-runtime",
      sourceKind: session.sourceKind,
      status: statusFromReadiness(exportReadiness),
      packageVersion: session.packageVersion,
      documentVersion: session.documentVersion,
      package: session.package,
      graph: session.graph,
      pagination,
      rendererConsumption,
      exportReadiness,
      diagnostics: {
        graphIssueCount: session.diagnostics.graphIssueCount,
        paginationWarningCount: pagination.warnings.length,
        rendererBlockingIssueCount: rendererConsumption.blockingIssues.length,
        rendererWarningIssueCount: rendererConsumption.warningIssues.length,
        exportBlockingIssueCount: exportReadiness.blockingIssues.length,
        exportWarningIssueCount: exportReadiness.warningIssues.length,
        supportedOperationKinds: session.diagnostics.supportedOperationKinds,
      },
    },
  }
}

export function createVNextEditorBridgeRuntime(
  value: unknown,
  options: VNextEditorBridgeRuntimeOptions = {},
): VNextEditorBridgeRuntime {
  const result = safeCreateVNextEditorBridgeRuntime(value, options)

  if (!result.ok) {
    throw new Error(result.issues.map((issue) => `[${issue.path}] ${issue.message}`).join("\n"))
  }

  return result.runtime
}
