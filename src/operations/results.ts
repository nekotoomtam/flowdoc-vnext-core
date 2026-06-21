import type { DocumentNode } from "../schema/document.js"
import type { NodeId, SectionId } from "../graph/relationshipGraph.js"
import type { VNextOperationCommand, VNextOperationKind, VNextOperationSource } from "./commands.js"

export type VNextOperationFailureReason =
  | "invalid-command"
  | "invalid-document"
  | "target-not-found"
  | "unsupported-target"
  | "validation-failed"

export interface VNextOperationIssue {
  severity: "error" | "warning" | "info"
  code: string
  path: string
  nodeId?: NodeId
  message: string
}

export interface VNextOperationScope {
  sectionIds: SectionId[]
  zoneIds: NodeId[]
  nodeIds: NodeId[]
  parentNodeIds: NodeId[]
  tableIds: NodeId[]
  textBlockIds: NodeId[]
}

export interface VNextOperationRenderInvalidation {
  lane: "node-structure" | "node-layout" | "text-content"
  affectedNodeIds: NodeId[]
  affectedSectionIds: SectionId[]
  pageScope: { kind: "unknown"; reason: "pagination-not-integrated" }
}

export interface VNextOperationHistoryPolicy {
  kind: "single-entry"
  durableIntent: "structure" | "layout" | "content"
  summary: string
}

export interface VNextOperationCommitMetadata {
  kind: VNextOperationKind
  source: VNextOperationSource
  targetNodeIds: NodeId[]
  validationPolicy: "full"
  historyPolicy: VNextOperationHistoryPolicy
  renderInvalidation: VNextOperationRenderInvalidation
  scope: VNextOperationScope
}

export type VNextOperationResult =
  | {
      ok: true
      command: VNextOperationCommand
      document: DocumentNode
      operation: VNextOperationCommitMetadata
      issues: VNextOperationIssue[]
    }
  | {
      ok: false
      command: VNextOperationCommand
      document: DocumentNode
      reason: VNextOperationFailureReason
      issues: VNextOperationIssue[]
    }

