import type { FlowDocPackageV3DocumentV4 } from "../persistence/packageV3.js"

export const VNEXT_PACKAGE_V2_TO_V3_MIGRATION_SOURCE = "vnext-package-v2-to-v3-migration"
export const VNEXT_PACKAGE_V2_TO_V3_MIGRATION_MODE = "explicit-copy-forward"

export type VNextPackageV2ToV3MigrationIssueSource =
  | "source-schema"
  | "source-structure"
  | "text-grammar"
  | "target-validation"

export interface VNextPackageV2ToV3MigrationIssue {
  source: VNextPackageV2ToV3MigrationIssueSource
  severity: "error" | "warning"
  code: string
  path: string
  message: string
  nodeId?: string
  inlineId?: string
}

export type VNextPackageV2ToV3MigrationChangeKind =
  | "package-version"
  | "document-version"
  | "data-version"
  | "add-empty-image-registry"
  | "remove-empty-text"
  | "split-raw-line-break"

export interface VNextPackageV2ToV3MigrationChange {
  kind: VNextPackageV2ToV3MigrationChangeKind
  path: string
  message: string
  nodeId?: string
  sourceInlineId?: string
  producedInlineIds?: string[]
}

export interface VNextPackageV2ToV3MigrationSummary {
  sectionCount: number
  nodeCount: number
  textBlockCount: number
  normalizedTextBlockCount: number
  textNormalizationCount: number
  errorCount: number
  warningCount: number
}

export interface VNextPackageV2ToV3MigrationContracts {
  deterministicIds: true
  explicitCopyForward: true
  packageMutation: false
  sourceMutation: false
  storageWrites: false
  targetParserRequired: true
}

export interface VNextPackageV2ToV3MigrationPlan {
  source: typeof VNEXT_PACKAGE_V2_TO_V3_MIGRATION_SOURCE
  mode: typeof VNEXT_PACKAGE_V2_TO_V3_MIGRATION_MODE
  status: "ready" | "blocked"
  sourcePackageVersion: 2 | null
  sourceDocumentVersion: 3 | null
  targetPackageVersion: 3
  targetDocumentVersion: 4
  issues: VNextPackageV2ToV3MigrationIssue[]
  changes: VNextPackageV2ToV3MigrationChange[]
  summary: VNextPackageV2ToV3MigrationSummary
  contracts: VNextPackageV2ToV3MigrationContracts
  targetCandidate: FlowDocPackageV3DocumentV4 | null
}

export interface VNextPackageV2ToV3MigrationApplyResult {
  source: typeof VNEXT_PACKAGE_V2_TO_V3_MIGRATION_SOURCE
  mode: typeof VNEXT_PACKAGE_V2_TO_V3_MIGRATION_MODE
  status: "applied" | "blocked"
  issues: VNextPackageV2ToV3MigrationIssue[]
  changes: VNextPackageV2ToV3MigrationChange[]
  package: FlowDocPackageV3DocumentV4 | null
  contracts: VNextPackageV2ToV3MigrationContracts
}

export const VNEXT_PACKAGE_V2_TO_V3_MIGRATION_CONTRACTS: VNextPackageV2ToV3MigrationContracts = {
  deterministicIds: true,
  explicitCopyForward: true,
  packageMutation: false,
  sourceMutation: false,
  storageWrites: false,
  targetParserRequired: true,
}
