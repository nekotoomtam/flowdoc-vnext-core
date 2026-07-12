import { z } from "zod"
import { VNextStructureDefinitionDraftIdentityV1Schema } from "../lifecycle/structureIdentity.js"
import {
  VNEXT_STRUCTURE_POLICY_NODE_ACTIONS,
  VNextStructurePolicySetV1Schema,
  type VNextStructurePolicyNodeAction,
} from "../lifecycle/structurePolicy.js"
import { DocumentNodeV4TargetSchema, type DocumentNodeV4Target } from "../schema/documentV4Target.js"
import { VNextTableDefinitionV1Schema, type VNextTableDefinitionV1 } from "./tableDefinitionV1.js"

export const VNEXT_TABLE_AUTHORING_VERSION = 1 as const
export const VNEXT_TABLE_AUTHORING_SOURCE = "vnext-table-authoring"

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})
const ActionSchema = z.enum(VNEXT_STRUCTURE_POLICY_NODE_ACTIONS)

export const VNextTableAuthoringCommandV1Schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("table.row.insert.static"),
    tableId: NonBlankIdSchema,
    index: z.number().int().nonnegative(),
    rowId: NonBlankIdSchema,
    rowSourceId: NonBlankIdSchema,
    rowTemplateId: NonBlankIdSchema,
    cellIds: z.array(NonBlankIdSchema).min(1),
    role: z.enum(["header", "body", "footer", "empty-state"]),
    breakPolicy: z.enum(["allow", "prefer-keep", "strict-keep"]),
    minHeightPt: z.number().finite().nonnegative().optional(),
    source: z.enum(["user", "automation", "system"]).optional(),
  }).strict(),
  z.object({
    kind: z.literal("table.row.delete.static"),
    tableId: NonBlankIdSchema,
    rowSourceId: NonBlankIdSchema,
    source: z.enum(["user", "automation", "system"]).optional(),
  }).strict(),
  z.object({
    kind: z.literal("table.row.reorder"),
    tableId: NonBlankIdSchema,
    rowSourceId: NonBlankIdSchema,
    toIndex: z.number().int().nonnegative(),
    source: z.enum(["user", "automation", "system"]).optional(),
  }).strict(),
  z.object({
    kind: z.literal("table.column.insert"),
    tableId: NonBlankIdSchema,
    index: z.number().int().nonnegative(),
    columnId: NonBlankIdSchema,
    widthShare: z.number().finite().positive().lt(100),
    cellIdsByRowTemplateId: z.record(NonBlankIdSchema, NonBlankIdSchema),
    source: z.enum(["user", "automation", "system"]).optional(),
  }).strict(),
  z.object({
    kind: z.literal("table.column.delete"),
    tableId: NonBlankIdSchema,
    columnId: NonBlankIdSchema,
    source: z.enum(["user", "automation", "system"]).optional(),
  }).strict(),
  z.object({
    kind: z.literal("table.column.resize"),
    tableId: NonBlankIdSchema,
    columnId: NonBlankIdSchema,
    widthShare: z.number().finite().positive().lt(100),
    source: z.enum(["user", "automation", "system"]).optional(),
  }).strict(),
  z.object({
    kind: z.literal("table.cell.vertical-align.patch"),
    tableId: NonBlankIdSchema,
    cellId: NonBlankIdSchema,
    verticalAlign: z.enum(["top", "middle", "bottom"]),
    source: z.enum(["user", "automation", "system"]).optional(),
  }).strict(),
])

export const VNextTableAuthoringBundleV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_AUTHORING_VERSION),
  kind: z.literal("table-authoring-bundle"),
  artifact: VNextStructureDefinitionDraftIdentityV1Schema,
  document: DocumentNodeV4TargetSchema,
  definition: VNextTableDefinitionV1Schema,
  policySet: VNextStructurePolicySetV1Schema,
  sessionAllowedActions: z.array(ActionSchema),
}).strict()

export const VNextTableAuthoringRequestV1Schema = VNextTableAuthoringBundleV1Schema.extend({
  kind: z.literal("table-authoring-request"),
  command: VNextTableAuthoringCommandV1Schema,
}).strict()

export type VNextTableAuthoringCommandV1 = z.infer<typeof VNextTableAuthoringCommandV1Schema>
export type VNextTableAuthoringBundleV1 = z.infer<typeof VNextTableAuthoringBundleV1Schema>
export type VNextTableAuthoringRequestV1 = z.infer<typeof VNextTableAuthoringRequestV1Schema>

export interface VNextTableAuthoringIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
  tableId?: string
  rowId?: string
  cellId?: string
  action?: VNextStructurePolicyNodeAction
}

export interface VNextTableAuthoringCapabilityV1 {
  action: VNextStructurePolicyNodeAction
  allowed: boolean
  policyKey: string
  denials: Array<{
    code: "core-capability-denied" | "structure-policy-denied" | "session-permission-denied"
    layer: "core" | "structure" | "session"
    message: string
    path: string
  }>
}

export interface VNextTableAuthoringUnsupportedCapabilityV1 {
  capability:
    | "collection-source.insert"
    | "collection-source.delete"
    | "table.cells.merge"
    | "table.cell.split"
    | "table.row-span"
    | "table.cross-owner-move"
  allowed: false
  reason:
    | "field-binding-contract-edit-required"
    | "canonical-colspan-integration-required"
    | "row-group-synchronization-v2-required"
    | "ownership-provenance-contract-required"
}

export interface VNextTableAuthoringAcceptedBundleV1 {
  artifact: VNextTableAuthoringBundleV1["artifact"]
  document: DocumentNodeV4Target
  definition: VNextTableDefinitionV1
  policySet: VNextTableAuthoringBundleV1["policySet"]
  sessionAllowedActions: VNextStructurePolicyNodeAction[]
  sectionId: string
  tableId: string
  tablePolicyKey: string
  capabilities: VNextTableAuthoringCapabilityV1[]
  unsupportedCapabilities: VNextTableAuthoringUnsupportedCapabilityV1[]
  fingerprint: string
}

export type VNextTableAuthoringBundleAssessmentV1 =
  | {
      source: typeof VNEXT_TABLE_AUTHORING_SOURCE
      contractVersion: typeof VNEXT_TABLE_AUTHORING_VERSION
      status: "ready"
      bundle: VNextTableAuthoringAcceptedBundleV1
      work: { sectionVisitCount: number; rowTemplateVisitCount: number; cellVisitCount: number; capabilityCheckCount: number }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_AUTHORING_SOURCE
      contractVersion: typeof VNEXT_TABLE_AUTHORING_VERSION
      status: "blocked"
      bundle: null
      issues: VNextTableAuthoringIssueV1[]
    }

export interface VNextTableAuthoringIdentityDiffV1 {
  addedNodeIds: string[]
  removedNodeIds: string[]
  retainedNodeIds: string[]
  addedColumnIds: string[]
  removedColumnIds: string[]
  reorderedIds: string[]
}

export type VNextTableAuthoringSelectionRecommendationV1 =
  | { kind: "table-row"; tableId: string; rowSourceId: string; rowId: string }
  | { kind: "table-column"; tableId: string; columnId: string }
  | { kind: "table-cell"; tableId: string; rowId: string; cellId: string }
  | { kind: "table"; tableId: string }

export interface VNextTableAuthoringCommitV1 {
  kind: VNextTableAuthoringCommandV1["kind"]
  action: VNextStructurePolicyNodeAction
  source: "user" | "automation" | "system"
  tableId: string
  targetIds: string[]
  policyKey: string
  identity: VNextTableAuthoringIdentityDiffV1
  scope: {
    sectionIds: string[]
    tableIds: string[]
    rowSourceIds: string[]
    rowTemplateIds: string[]
    rowIds: string[]
    columnIds: string[]
    cellIds: string[]
    textBlockIds: string[]
  }
  historyPolicy: {
    kind: "single-entry"
    durableIntent: "structure" | "layout"
    summary: string
    collaborationSafe: false
  }
  selectionAfter: VNextTableAuthoringSelectionRecommendationV1
  invalidation: {
    lane: "table-row-order" | "table-grid" | "table-width" | "table-cell-layout"
    definition: boolean
    measurement: boolean
    pagination: boolean
    renderer: boolean
    reasons: string[]
  }
  fingerprints: {
    documentBefore: string
    documentAfter: string
    definitionBefore: string
    definitionAfter: string
    bundleBefore: string
    bundleAfter: string
  }
  work: {
    rowTemplateVisitCount: number
    cellVisitCount: number
    subtreeNodeVisitCount: number
  }
  contracts: {
    persistence: "not-run"
    editorSelectionMutation: false
    measurement: "not-run"
    pagination: "not-run"
    rendering: "not-run"
  }
}

export type VNextTableAuthoringResultV1 =
  | {
      source: typeof VNEXT_TABLE_AUTHORING_SOURCE
      contractVersion: typeof VNEXT_TABLE_AUTHORING_VERSION
      status: "committed"
      document: DocumentNodeV4Target
      definition: VNextTableDefinitionV1
      operation: VNextTableAuthoringCommitV1
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_AUTHORING_SOURCE
      contractVersion: typeof VNEXT_TABLE_AUTHORING_VERSION
      status: "blocked"
      reason:
        | "invalid-request"
        | "bundle-not-ready"
        | "capability-denied"
        | "target-not-found"
        | "invalid-command"
        | "unsupported-capability"
        | "validation-failed"
        | "no-op"
      document: DocumentNodeV4Target | null
      definition: VNextTableDefinitionV1 | null
      operation: null
      issues: VNextTableAuthoringIssueV1[]
    }
