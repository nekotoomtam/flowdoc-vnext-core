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
