import { z } from "zod"
import { DocumentNodeV4TargetSchema, type AuthoredNodeV4Target } from "../schema/documentV4Target.js"
import { VNextDerivedIdentityProvenanceV1Schema, type VNextDerivedIdentityProvenanceV1 } from "../identity/identityStandardV1.js"
import { VNextTableDefinitionV1Schema } from "./tableDefinitionV1.js"
import { VNextPublishedFieldContractV1Schema } from "../resolution/resolutionInputPins.js"
import { VNextPublishedCollectionItemContractV1Schema } from "./collectionItemContractV1.js"
import { VNextPublishedTableContentBindingContractV1Schema } from "./tableContentBindingV1.js"
import { VNextResolvedTableRowsReadyV1Schema } from "./resolvedTableRowsV1.js"
import { VNextTableContentIdentityAssignmentsV1Schema } from "./tableContentIdentityAssignmentsV1.js"

export const VNEXT_TABLE_CONTENT_MATERIALIZATION_VERSION = 1 as const
export const VNEXT_TABLE_CONTENT_MATERIALIZATION_SOURCE = "vnext-table-content-materialization"

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})

export const VNextTableGlobalTextBindingV1Schema = z.object({
  sourcePlacementId: NonBlankIdSchema,
  fieldKey: NonBlankIdSchema,
  value: z.string(),
  valueSource: z.enum(["data-snapshot", "authored-fallback", "empty"]),
}).strict()

export const VNextTableGlobalImageBindingV1Schema = z.object({
  sourcePlacementId: NonBlankIdSchema,
  fieldKey: NonBlankIdSchema,
  assetId: NonBlankIdSchema.nullable(),
  assetOwner: z.enum(["published-static-media", "instance-media", "none"]),
  valueSource: z.enum(["data-snapshot", "authored-fallback", "empty"]),
}).strict()

export const VNextTableGlobalResolvedBindingsV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_CONTENT_MATERIALIZATION_VERSION),
  kind: z.literal("table-global-resolved-bindings"),
  instanceId: NonBlankIdSchema,
  instanceRevision: z.number().int().nonnegative(),
  resolutionInputFingerprint: NonBlankIdSchema,
  text: z.record(NonBlankIdSchema, VNextTableGlobalTextBindingV1Schema),
  images: z.record(NonBlankIdSchema, VNextTableGlobalImageBindingV1Schema),
}).strict().superRefine((bindings, ctx) => {
  Object.entries(bindings.text).forEach(([key, binding]) => {
    if (key !== binding.sourcePlacementId) ctx.addIssue({
      code: "custom", path: ["text", key, "sourcePlacementId"],
      message: "global text binding record key must equal sourcePlacementId",
    })
  })
  Object.entries(bindings.images).forEach(([key, binding]) => {
    if (key !== binding.sourcePlacementId) ctx.addIssue({
      code: "custom", path: ["images", key, "sourcePlacementId"],
      message: "global image binding record key must equal sourcePlacementId",
    })
  })
})

export const VNextTableContentMaterializationRequestV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TABLE_CONTENT_MATERIALIZATION_VERSION),
  kind: z.literal("table-content-materialization-request"),
  document: DocumentNodeV4TargetSchema,
  definition: VNextTableDefinitionV1Schema,
  fieldContract: VNextPublishedFieldContractV1Schema,
  itemContract: VNextPublishedCollectionItemContractV1Schema,
  bindingContract: VNextPublishedTableContentBindingContractV1Schema,
  resolvedRows: VNextResolvedTableRowsReadyV1Schema,
  identityAssignments: VNextTableContentIdentityAssignmentsV1Schema,
  globalBindings: VNextTableGlobalResolvedBindingsV1Schema,
}).strict()

export type VNextTableContentMaterializationRequestV1 = z.infer<
  typeof VNextTableContentMaterializationRequestV1Schema
>

export interface VNextMaterializedTableTextBindingV1 {
  kind: "text"
  resolvedPlacementId: string
  sourcePlacementId: string
  scope: "document-field" | "collection-item-field"
  fieldKey: string
  collectionFieldKey?: string
  itemKey?: string
  value: string
  valueSource:
    | "resolved-document"
    | "item-snapshot"
    | "explicit-null"
    | "item-contract-fallback"
    | "authored-placement-fallback"
    | "missing-optional"
}

export interface VNextMaterializedTableImageBindingV1 {
  kind: "image"
  resolvedPlacementId: string
  sourcePlacementId: string
  scope: "document-field" | "collection-item-field"
  fieldKey: string
  collectionFieldKey?: string
  itemKey?: string
  assetId: string | null
  assetOwner: "published-static-media" | "instance-media" | "none"
  valueSource:
    | "resolved-document"
    | "item-snapshot"
    | "explicit-null"
    | "item-contract-fallback"
    | "authored-placement-fallback"
    | "missing-optional"
}

export interface VNextMaterializedTableCellContentV1 {
  sourceCellId: string
  cellInstanceId: string
  verticalAlign: "top" | "middle" | "bottom"
  childIds: string[]
  nodes: Record<string, AuthoredNodeV4Target>
}

export type VNextMaterializedTableRowContentV1 =
  | {
      kind: "authored-content-reference"
      sourceRowId: string
      cells: Array<{
        sourceCellId: string
        verticalAlign: "top" | "middle" | "bottom"
        childIds: string[]
      }>
    }
  | {
      kind: "materialized-content"
      rowInstanceId: string
      rowSourceId: string
      rowTemplateId: string
      itemKey: string
      cells: VNextMaterializedTableCellContentV1[]
    }

export interface VNextTableContentMaterializationIssue {
  source: "schema" | "source-plan" | "row-stream" | "identity" | "data" | "binding"
  code: string
  path: string
  message: string
  severity: "error"
}

export type VNextTableContentMaterializationResultV1 =
  | {
      source: typeof VNEXT_TABLE_CONTENT_MATERIALIZATION_SOURCE
      contractVersion: typeof VNEXT_TABLE_CONTENT_MATERIALIZATION_VERSION
      status: "materialized"
      documentId: string
      tableId: string
      tableDefinitionId: string
      instanceRevision: number
      resolutionInputFingerprint: string
      rows: VNextMaterializedTableRowContentV1[]
      bindings: {
        text: VNextMaterializedTableTextBindingV1[]
        images: VNextMaterializedTableImageBindingV1[]
      }
      provenance: VNextDerivedIdentityProvenanceV1[]
      work: {
        rowCount: number
        materializedRowCount: number
        authoredReferenceRowCount: number
        cellCount: number
        clonedNodeCount: number
        clonedInlineCount: number
        textBindingCount: number
        imageBindingCount: number
        sourcePlanDocumentRootScans: 1
        materializationDocumentRootScans: 1
      }
      execution: {
        identityAllocation: "not-run"
        authoredGraphMutation: false
        mediaFetch: "not-run"
        measurement: "not-run"
        pagination: "not-run"
        rendering: "not-run"
      }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_CONTENT_MATERIALIZATION_SOURCE
      contractVersion: typeof VNEXT_TABLE_CONTENT_MATERIALIZATION_VERSION
      status: "blocked"
      rows: null
      bindings: null
      provenance: null
      issues: VNextTableContentMaterializationIssue[]
    }
