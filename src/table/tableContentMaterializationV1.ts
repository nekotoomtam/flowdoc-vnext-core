import { z } from "zod"
import {
  DocumentNodeV4TargetSchema,
  type AuthoredNodeV4Target,
  type DocumentSectionV4Target,
} from "../schema/documentV4Target.js"
import { DataSnapshotV2ValueSchema, type DataSnapshotV2Value } from "../persistence/packageV3ImageTarget.js"
import {
  VNextDerivedIdentityProvenanceV1Schema,
  type VNextDerivedIdentityProvenanceV1,
} from "../identity/identityStandardV1.js"
import { auditVNextDerivedIdentityBatchV1 } from "../identity/identityBatchAuditV1.js"
import { VNextTableDefinitionV1Schema } from "./tableDefinitionV1.js"
import { VNextPublishedFieldContractV1Schema } from "../resolution/resolutionInputPins.js"
import { VNextPublishedCollectionItemContractV1Schema } from "./collectionItemContractV1.js"
import { VNextPublishedTableContentBindingContractV1Schema } from "./tableContentBindingV1.js"
import {
  createVNextTableContentSourcePlanV1,
  type VNextTableContentSourcePlanIssue,
  type VNextTableContentSourceTemplateV1,
} from "./tableContentSourcePlanV1.js"
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
  childIds: string[]
  nodes: Record<string, AuthoredNodeV4Target>
}

export type VNextMaterializedTableRowContentV1 =
  | {
      kind: "authored-content-reference"
      sourceRowId: string
      cells: Array<{ sourceCellId: string; childIds: string[] }>
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

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function addIssue(
  issues: VNextTableContentMaterializationIssue[],
  source: VNextTableContentMaterializationIssue["source"],
  code: string,
  path: string,
  message: string,
): void {
  issues.push({ source, code, path, message, severity: "error" })
}

function blocked(issues: VNextTableContentMaterializationIssue[]): VNextTableContentMaterializationResultV1 {
  return {
    source: VNEXT_TABLE_CONTENT_MATERIALIZATION_SOURCE,
    contractVersion: VNEXT_TABLE_CONTENT_MATERIALIZATION_VERSION,
    status: "blocked",
    rows: null,
    bindings: null,
    provenance: null,
    issues,
  }
}

function exactRecord(
  actual: Readonly<Record<string, string | number>>,
  expected: Readonly<Record<string, string | number>>,
): boolean {
  const actualKeys = Object.keys(actual).sort()
  const expectedKeys = Object.keys(expected).sort()
  return actualKeys.length === expectedKeys.length
    && actualKeys.every((key, index) => key === expectedKeys[index] && actual[key] === expected[key])
}

function validateProvenance(
  provenance: VNextDerivedIdentityProvenanceV1,
  expectedIdentityKind: "resolved-row" | "resolved-cell" | "resolved-node" | "resolved-inline",
  expectedOriginKind: "collection-row" | "resolved-cell" | "resolved-node" | "resolved-inline",
  refs: Record<string, string>,
  revisionPins: Record<string, number>,
  request: VNextTableContentMaterializationRequestV1,
  path: string,
  issues: VNextTableContentMaterializationIssue[],
): void {
  if (provenance.identity.identityKind !== expectedIdentityKind) addIssue(
    issues, "identity", "content-identity-kind-mismatch", `${path}.identity.identityKind`,
    `expected ${expectedIdentityKind} identity`,
  )
  const scope = provenance.identity.scope
  if (
    scope.kind !== "document-resolution"
    || scope.documentInstanceId !== request.resolvedRows.instanceId
    || scope.instanceRevision !== request.resolvedRows.instanceRevision
    || scope.resolutionInputFingerprint !== request.resolvedRows.resolutionInputFingerprint
  ) addIssue(
    issues, "identity", "content-identity-scope-mismatch", `${path}.identity.scope`,
    "content identity must use the exact resolved row document-resolution scope",
  )
  if (provenance.origin.kind !== expectedOriginKind) addIssue(
    issues, "identity", "content-origin-kind-mismatch", `${path}.origin.kind`,
    `expected ${expectedOriginKind} origin`,
  )
  if (!exactRecord(provenance.origin.refs, refs)) addIssue(
    issues, "identity", "content-origin-refs-mismatch", `${path}.origin.refs`,
    "content identity origin references do not match the source graph occurrence",
  )
  if (!exactRecord(provenance.origin.revisionPins, revisionPins)) addIssue(
    issues, "identity", "content-origin-revisions-mismatch", `${path}.origin.revisionPins`,
    "content identity revision pins do not match the resolved row input",
  )
}

function findTableSection(
  request: VNextTableContentMaterializationRequestV1,
): DocumentSectionV4Target | null {
  return request.document.document.sections.find(
    (section) => section.nodes[request.definition.tableId]?.type === "table",
  ) ?? null
}

function isImageValue(value: DataSnapshotV2Value | undefined): value is { kind: "image-asset-ref"; assetId: string } {
  return typeof value === "object" && value != null && value.kind === "image-asset-ref"
}

function scalarCompatible(type: string, value: DataSnapshotV2Value): boolean {
  if (value === null) return true
  if (type === "number") return typeof value === "number" && Number.isFinite(value)
  if (type === "boolean") return typeof value === "boolean"
  if (type === "image") return isImageValue(value)
  return typeof value === "string"
}

function authoredPlacementFallback(node: AuthoredNodeV4Target, sourcePlacementId: string): string | undefined {
  if (node.type === "image") return node.source.kind === "image-field-ref" ? node.source.fallbackAssetId : undefined
  if (node.type !== "text-block") return undefined
  const inline = node.children.find((candidate) => candidate.id === sourcePlacementId)
  if (inline?.type === "field-ref") return inline.fallback
  if (inline?.type === "inline-image" && inline.source.kind === "image-field-ref") return inline.source.fallbackAssetId
  return undefined
}

function scalarText(value: string | number | boolean): string {
  return typeof value === "string" ? value : String(value)
}

export function materializeVNextTableContentV1(value: unknown): VNextTableContentMaterializationResultV1 {
  const parsed = VNextTableContentMaterializationRequestV1Schema.safeParse(value)
  if (!parsed.success) return blocked(parsed.error.issues.map((item) => ({
    source: "schema",
    code: item.code,
    path: formatIssuePath(item.path),
    message: item.message,
    severity: "error",
  })))
  const request = parsed.data
  const issues: VNextTableContentMaterializationIssue[] = []
  const sourcePlan = createVNextTableContentSourcePlanV1({
    document: request.document,
    definition: request.definition,
    fieldContract: request.fieldContract,
    itemContract: request.itemContract,
    bindingContract: request.bindingContract,
  })
  if (sourcePlan.status === "blocked") {
    sourcePlan.issues.forEach((item: VNextTableContentSourcePlanIssue) => addIssue(
      issues, "source-plan", item.code, item.path, item.message,
    ))
    return blocked(issues)
  }

  if (request.document.document.id !== request.resolvedRows.instanceId) addIssue(
    issues, "row-stream", "document-instance-id-mismatch", "document.document.id",
    "materialized document id must equal the resolved row stream instance id",
  )
  if (
    request.resolvedRows.tableId !== request.definition.tableId
    || request.resolvedRows.tableDefinitionId !== request.definition.tableDefinitionId
  ) addIssue(
    issues, "row-stream", "resolved-row-table-mismatch", "resolvedRows",
    "resolved row stream must target the supplied table definition",
  )
  if (
    request.globalBindings.instanceId !== request.resolvedRows.instanceId
    || request.globalBindings.instanceRevision !== request.resolvedRows.instanceRevision
    || request.globalBindings.resolutionInputFingerprint !== request.resolvedRows.resolutionInputFingerprint
  ) addIssue(
    issues, "binding", "global-binding-scope-mismatch", "globalBindings",
    "global bindings must pin the exact resolved row instance and resolution fingerprint",
  )

  const section = findTableSection(request)
  if (section == null) return blocked([{
    source: "source-plan", code: "missing-source-table", path: "definition.tableId",
    message: "accepted source table could not be located", severity: "error",
  }])
  const sourceTemplates = new Map(sourcePlan.templates.map((template) => [template.rowTemplateId, template]))
  const assignmentsByRow = new Map(request.identityAssignments.rows.map((row, index) => [row.rowInstanceId, { row, index }]))
  const expectedRowIds = new Set<string>()
  const provenance: VNextDerivedIdentityProvenanceV1[] = []
  const identityAuditProvenance: VNextDerivedIdentityProvenanceV1[] = []

  sourcePlan.templates.forEach((template) => {
    const bindings = request.bindingContract.rowTemplates[template.rowTemplateId]?.placements ?? {}
    template.fieldPlacements.forEach((placement) => {
      const binding = bindings[placement.sourcePlacementId]
      if (binding?.binding.scope !== "document-field") return
      if (binding.placementKind === "text-field-ref") {
        const global = request.globalBindings.text[placement.sourcePlacementId]
        if (global == null) addIssue(
          issues, "binding", "missing-global-text-binding",
          `globalBindings.text.${placement.sourcePlacementId}`,
          `missing resolved document text binding for "${placement.sourcePlacementId}"`,
        )
        else if (global.fieldKey !== binding.binding.fieldKey) addIssue(
          issues, "binding", "global-binding-field-mismatch",
          `globalBindings.text.${placement.sourcePlacementId}.fieldKey`,
          "resolved document text binding field does not match content binding contract",
        )
      } else {
        const global = request.globalBindings.images[placement.sourcePlacementId]
        if (global == null) addIssue(
          issues, "binding", "missing-global-image-binding",
          `globalBindings.images.${placement.sourcePlacementId}`,
          `missing resolved document image binding for "${placement.sourcePlacementId}"`,
        )
        else if (global.fieldKey !== binding.binding.fieldKey) addIssue(
          issues, "binding", "global-binding-field-mismatch",
          `globalBindings.images.${placement.sourcePlacementId}.fieldKey`,
          "resolved document image binding field does not match content binding contract",
        )
      }
    })
  })

  request.resolvedRows.rows.forEach((row) => {
    if (row.source.kind === "collection-row") {
      if (row.identity.kind === "allocated-row") expectedRowIds.add(row.identity.provenance.identity.id)
      else addIssue(
        issues, "row-stream", "collection-row-identity-missing", "resolvedRows.rows",
        "collection rows require allocated resolved-row identity",
      )
      return
    }
    if (row.identity.kind !== "authored-row") addIssue(
      issues, "row-stream", "authored-row-identity-mismatch", "resolvedRows.rows",
      "static and empty-state rows must retain authored row identity",
    )
    if (row.itemValues != null) addIssue(
      issues, "row-stream", "authored-row-has-item-values", "resolvedRows.rows",
      "static and empty-state rows cannot carry collection item values",
    )
    row.cells.forEach((cell) => {
      if (cell.identity.kind !== "authored-cell") addIssue(
        issues, "row-stream", "authored-cell-identity-mismatch", "resolvedRows.rows",
        "static and empty-state row cells must retain authored cell identity",
      )
    })
  })
  request.identityAssignments.rows.forEach((assignment, index) => {
    if (!expectedRowIds.has(assignment.rowInstanceId)) addIssue(
      issues, "identity", "unexpected-row-content-assignment", `identityAssignments.rows[${index}]`,
      `content assignment does not match collection row "${assignment.rowInstanceId}"`,
    )
  })

  request.resolvedRows.rows.forEach((row, rowIndex) => {
    if (row.source.kind !== "collection-row" || row.identity.kind !== "allocated-row") {
      const sourceRow = section.nodes[row.source.sourceRowId]
      if (sourceRow?.type !== "table-row") addIssue(
        issues, "row-stream", "missing-authored-row-content",
        `resolvedRows.rows[${rowIndex}].source.sourceRowId`,
        `authored row content "${row.source.sourceRowId}" is missing`,
      )
      else row.cells.forEach((cell, cellIndex) => {
        if (!sourceRow.cellIds.includes(cell.sourceCellId) || section.nodes[cell.sourceCellId]?.type !== "table-cell") addIssue(
          issues, "row-stream", "authored-cell-content-mismatch",
          `resolvedRows.rows[${rowIndex}].cells[${cellIndex}].sourceCellId`,
          `authored row does not own source cell "${cell.sourceCellId}"`,
        )
      })
      return
    }
    const rowInstanceId = row.identity.provenance.identity.id
    const found = assignmentsByRow.get(rowInstanceId)
    if (found == null) {
      addIssue(
        issues, "identity", "missing-row-content-assignment", "identityAssignments.rows",
        `missing content identity assignment for row "${rowInstanceId}"`,
      )
      return
    }
    const template = sourceTemplates.get(row.source.rowTemplateId)
    if (template == null) {
      addIssue(
        issues, "source-plan", "missing-source-template", `resolvedRows.rows[${rowIndex}].source.rowTemplateId`,
        `source plan does not contain row template "${row.source.rowTemplateId}"`,
      )
      return
    }
    const revisionPins = {
      structureVersionOrdinal: request.definition.owner.kind === "published-structure-version"
        ? request.definition.owner.ref.versionOrdinal
        : 0,
      instanceRevision: request.resolvedRows.instanceRevision,
      collectionSnapshotRevision: request.resolvedRows.collectionSnapshotRevision ?? 0,
    }
    const rowRefs = {
      tableId: request.definition.tableId,
      rowSourceId: row.source.rowSourceId,
      rowTemplateId: row.source.rowTemplateId,
      sourceRowId: row.source.sourceRowId,
      collectionFieldKey: row.source.collectionFieldKey,
      itemKey: row.source.itemKey,
      rowInstanceId,
    }
    const resolvedRowRefs = {
      tableId: request.definition.tableId,
      rowSourceId: row.source.rowSourceId,
      rowTemplateId: row.source.rowTemplateId,
      sourceRowId: row.source.sourceRowId,
      collectionFieldKey: row.source.collectionFieldKey,
      itemKey: row.source.itemKey,
    }
    validateProvenance(
      row.identity.provenance,
      "resolved-row",
      "collection-row",
      resolvedRowRefs,
      revisionPins,
      request,
      `resolvedRows.rows[${rowIndex}].identity.provenance`,
      issues,
    )
    identityAuditProvenance.push(row.identity.provenance)
    const expectedCells = new Set(template.cells.map((cell) => cell.sourceCellId))
    row.cells.forEach((cell, cellIndex) => {
      if (!expectedCells.has(cell.sourceCellId)) addIssue(
        issues, "row-stream", "unexpected-resolved-cell",
        `resolvedRows.rows[${rowIndex}].cells[${cellIndex}].sourceCellId`,
        `resolved row contains source cell "${cell.sourceCellId}" outside the row template`,
      )
    })
    Object.keys(found.row.cells).forEach((sourceCellId) => {
      if (!expectedCells.has(sourceCellId)) addIssue(
        issues, "identity", "unexpected-cell-content-assignment",
        `identityAssignments.rows[${found.index}].cells.${sourceCellId}`,
        `cell assignment references source cell "${sourceCellId}" outside the row template`,
      )
    })

    template.cells.forEach((sourceCell) => {
      const resolvedCell = row.cells.find((cell) => cell.sourceCellId === sourceCell.sourceCellId)
      const cellInstanceId = resolvedCell?.identity.kind === "allocated-cell"
        ? resolvedCell.identity.provenance.identity.id
        : null
      if (cellInstanceId == null) {
        addIssue(
          issues, "row-stream", "collection-cell-identity-missing",
          `resolvedRows.rows[${rowIndex}].cells`,
          `collection row cell "${sourceCell.sourceCellId}" requires allocated cell identity`,
        )
        return
      }
      if (resolvedCell?.identity.kind === "allocated-cell") {
        validateProvenance(
          resolvedCell.identity.provenance,
          "resolved-cell",
          "resolved-cell",
          { ...resolvedRowRefs, sourceCellId: sourceCell.sourceCellId, rowInstanceId },
          revisionPins,
          request,
          `resolvedRows.rows[${rowIndex}].cells.${sourceCell.sourceCellId}.identity.provenance`,
          issues,
        )
        identityAuditProvenance.push(resolvedCell.identity.provenance)
      }
      const assignedCell = found.row.cells[sourceCell.sourceCellId]
      if (assignedCell == null) {
        addIssue(
          issues, "identity", "missing-cell-content-assignment",
          `identityAssignments.rows[${found.index}].cells.${sourceCell.sourceCellId}`,
          `missing content assignment for source cell "${sourceCell.sourceCellId}"`,
        )
        return
      }
      const expectedNodes = new Set(sourceCell.sourceNodes.map((node) => node.sourceNodeId))
      Object.keys(assignedCell.nodes).forEach((sourceNodeId) => {
        if (!expectedNodes.has(sourceNodeId)) addIssue(
          issues, "identity", "unexpected-node-content-assignment",
          `identityAssignments.rows[${found.index}].cells.${sourceCell.sourceCellId}.nodes.${sourceNodeId}`,
          `node assignment references source node "${sourceNodeId}" outside the source cell`,
        )
      })
      sourceCell.sourceNodes.forEach((sourceNode) => {
        const nodeAssignment = assignedCell.nodes[sourceNode.sourceNodeId]
        const nodePath = `identityAssignments.rows[${found.index}].cells.${sourceCell.sourceCellId}.nodes.${sourceNode.sourceNodeId}`
        if (nodeAssignment == null) {
          addIssue(
            issues, "identity", "missing-node-content-assignment", nodePath,
            `missing content identity for source node "${sourceNode.sourceNodeId}"`,
          )
          return
        }
        const nodeRefs = {
          ...rowRefs,
          sourceCellId: sourceCell.sourceCellId,
          cellInstanceId,
          sourceNodeId: sourceNode.sourceNodeId,
        }
        validateProvenance(
          nodeAssignment.node, "resolved-node", "resolved-node", nodeRefs, revisionPins, request,
          `${nodePath}.node`, issues,
        )
        provenance.push(nodeAssignment.node)
        identityAuditProvenance.push(nodeAssignment.node)

        const expectedInlines = new Set(sourceNode.sourceInlineIds)
        Object.keys(nodeAssignment.inlines).forEach((sourceInlineId) => {
          if (!expectedInlines.has(sourceInlineId)) addIssue(
            issues, "identity", "unexpected-inline-content-assignment",
            `${nodePath}.inlines.${sourceInlineId}`,
            `inline assignment references source inline "${sourceInlineId}" outside the source text block`,
          )
        })
        sourceNode.sourceInlineIds.forEach((sourceInlineId) => {
          const inline = nodeAssignment.inlines[sourceInlineId]
          if (inline == null) {
            addIssue(
              issues, "identity", "missing-inline-content-assignment",
              `${nodePath}.inlines.${sourceInlineId}`,
              `missing content identity for source inline "${sourceInlineId}"`,
            )
            return
          }
          validateProvenance(
            inline,
            "resolved-inline",
            "resolved-inline",
            { ...nodeRefs, sourceTextBlockId: sourceNode.sourceNodeId, sourceInlineId, resolvedNodeId: nodeAssignment.node.identity.id },
            revisionPins,
            request,
            `${nodePath}.inlines.${sourceInlineId}`,
            issues,
          )
          provenance.push(inline)
          identityAuditProvenance.push(inline)
        })
      })
    })

    const itemShape = request.itemContract.collections[row.source.collectionFieldKey]
    if (row.itemValues == null) addIssue(
      issues, "data", "collection-row-item-values-missing",
      `resolvedRows.rows[${rowIndex}].itemValues`,
      "collection row materialization requires item values",
    )
    if (request.resolvedRows.collectionSnapshotRevision == null) addIssue(
      issues, "row-stream", "collection-snapshot-revision-missing",
      "resolvedRows.collectionSnapshotRevision",
      "collection row materialization requires an exact collection snapshot revision",
    )
    if (itemShape == null || row.itemValues == null) return
    Object.keys(row.itemValues).forEach((key) => {
      if (itemShape.fields[key] == null) addIssue(
        issues, "data", "unknown-item-field", `resolvedRows.rows[${rowIndex}].itemValues.${key}`,
        `item values contain unknown field "${key}"`,
      )
    })
    Object.values(itemShape.fields).forEach((field) => {
      const present = Object.prototype.hasOwnProperty.call(row.itemValues, field.key)
      const itemValue = row.itemValues?.[field.key]
      if (!present && field.required) addIssue(
        issues, "data", "missing-required-item-field", `resolvedRows.rows[${rowIndex}].itemValues.${field.key}`,
        `required item field "${field.key}" is missing`,
      )
      else if (present && itemValue !== undefined && !scalarCompatible(field.type, itemValue)) addIssue(
        issues, "data", "item-field-type-mismatch", `resolvedRows.rows[${rowIndex}].itemValues.${field.key}`,
        `item field "${field.key}" is incompatible with ${field.type}`,
      )
    })
  })

  const identityAudit = auditVNextDerivedIdentityBatchV1(identityAuditProvenance)
  if (identityAudit.status === "blocked") identityAudit.issues.forEach((item, index) => addIssue(
    issues, "identity", item.code, `identityAudit.issues[${index}]`, item.message,
  ))
  if (issues.length > 0) return blocked(issues)

  const rows: VNextMaterializedTableRowContentV1[] = []
  const textBindings: VNextMaterializedTableTextBindingV1[] = []
  const imageBindings: VNextMaterializedTableImageBindingV1[] = []
  let cellCount = 0
  let clonedNodeCount = 0
  let clonedInlineCount = 0
  let materializedRowCount = 0
  let authoredReferenceRowCount = 0

  request.resolvedRows.rows.forEach((row) => {
    if (row.source.kind !== "collection-row" || row.identity.kind !== "allocated-row") {
      const sourceRowId = row.source.sourceRowId
      const sourceRow = section.nodes[sourceRowId]
      const cells = sourceRow?.type === "table-row"
        ? sourceRow.cellIds.flatMap((cellId) => {
            const cell = section.nodes[cellId]
            return cell?.type === "table-cell" ? [{ sourceCellId: cell.id, childIds: clone(cell.childIds) }] : []
          })
        : []
      rows.push({ kind: "authored-content-reference", sourceRowId, cells })
      authoredReferenceRowCount += 1
      cellCount += cells.length
      return
    }

    const rowInstanceId = row.identity.provenance.identity.id
    const assignment = assignmentsByRow.get(rowInstanceId)?.row
    const sourceTemplate = sourceTemplates.get(row.source.rowTemplateId)
    if (assignment == null || sourceTemplate == null || row.itemValues == null) {
      throw new Error("validated table materialization input missing")
    }
    const collectionSource = row.source
    const itemValues = row.itemValues
    const materializedCells: VNextMaterializedTableCellContentV1[] = sourceTemplate.cells.map((sourceCell) => {
      const resolvedCell = row.cells.find((cell) => cell.sourceCellId === sourceCell.sourceCellId)
      if (resolvedCell?.identity.kind !== "allocated-cell") throw new Error("validated cell identity missing")
      const assignedCell = assignment.cells[sourceCell.sourceCellId]
      const nodes: Record<string, AuthoredNodeV4Target> = {}
      const childIds: string[] = []

      sourceCell.sourceNodes.forEach((sourceNodePlan) => {
        const sourceNode = section.nodes[sourceNodePlan.sourceNodeId]
        const nodeAssignment = assignedCell.nodes[sourceNodePlan.sourceNodeId]
        if (sourceNode == null || nodeAssignment == null) throw new Error("validated source node assignment missing")
        const clonedNode = clone(sourceNode)
        clonedNode.id = nodeAssignment.node.identity.id
        if (clonedNode.type === "text-block") {
          clonedNode.children = clonedNode.children.map((inline) => ({
            ...inline,
            id: nodeAssignment.inlines[inline.id].identity.id,
          }))
          clonedInlineCount += clonedNode.children.length
        }
        nodes[clonedNode.id] = clonedNode
        childIds.push(clonedNode.id)
        clonedNodeCount += 1

        sourceNodePlan.fieldPlacements.forEach((placement) => {
          const binding = request.bindingContract.rowTemplates[row.source.rowTemplateId].placements[placement.sourcePlacementId]
          const resolvedPlacementId = sourceNode.type === "text-block"
            ? nodeAssignment.inlines[placement.sourcePlacementId].identity.id
            : nodeAssignment.node.identity.id
          if (binding.binding.scope === "document-field") {
            if (binding.placementKind === "text-field-ref") {
              const global = request.globalBindings.text[placement.sourcePlacementId]
              if (global == null) throw new Error("validated global text binding missing")
              textBindings.push({
                kind: "text", resolvedPlacementId, sourcePlacementId: placement.sourcePlacementId,
                scope: "document-field", fieldKey: binding.binding.fieldKey,
                value: global.value, valueSource: "resolved-document",
              })
            } else {
              const global = request.globalBindings.images[placement.sourcePlacementId]
              if (global == null) throw new Error("validated global image binding missing")
              imageBindings.push({
                kind: "image", resolvedPlacementId, sourcePlacementId: placement.sourcePlacementId,
                scope: "document-field", fieldKey: binding.binding.fieldKey,
                assetId: global.assetId, assetOwner: global.assetOwner, valueSource: "resolved-document",
              })
            }
            return
          }

          const field = request.itemContract.collections[binding.binding.collectionFieldKey].fields[binding.binding.itemFieldKey]
          const present = Object.prototype.hasOwnProperty.call(itemValues, field.key)
          const itemValue = itemValues[field.key]
          const authoredFallback = authoredPlacementFallback(sourceNode, placement.sourcePlacementId)
          if (binding.placementKind === "text-field-ref") {
            let resolvedValue = ""
            let valueSource: VNextMaterializedTableTextBindingV1["valueSource"] = "missing-optional"
            if (present && itemValue === null) valueSource = "explicit-null"
            else if (present && itemValue !== undefined && itemValue !== null && !isImageValue(itemValue)) {
              resolvedValue = scalarText(itemValue)
              valueSource = "item-snapshot"
            } else if (!present && field.fallback != null && typeof field.fallback !== "object") {
              resolvedValue = scalarText(field.fallback)
              valueSource = "item-contract-fallback"
            } else if (!present && authoredFallback != null) {
              resolvedValue = authoredFallback
              valueSource = "authored-placement-fallback"
            }
            textBindings.push({
              kind: "text", resolvedPlacementId, sourcePlacementId: placement.sourcePlacementId,
              scope: "collection-item-field", fieldKey: field.key,
              collectionFieldKey: binding.binding.collectionFieldKey, itemKey: collectionSource.itemKey,
              value: resolvedValue, valueSource,
            })
          } else {
            let assetId: string | null = null
            let assetOwner: VNextMaterializedTableImageBindingV1["assetOwner"] = "none"
            let valueSource: VNextMaterializedTableImageBindingV1["valueSource"] = "missing-optional"
            if (present && itemValue === null) valueSource = "explicit-null"
            else if (present && isImageValue(itemValue)) {
              assetId = itemValue.assetId
              assetOwner = "instance-media"
              valueSource = "item-snapshot"
            } else if (!present && field.fallback != null && typeof field.fallback === "object") {
              assetId = field.fallback.assetId
              assetOwner = "published-static-media"
              valueSource = "item-contract-fallback"
            } else if (!present && authoredFallback != null) {
              assetId = authoredFallback
              assetOwner = "published-static-media"
              valueSource = "authored-placement-fallback"
            }
            imageBindings.push({
              kind: "image", resolvedPlacementId, sourcePlacementId: placement.sourcePlacementId,
              scope: "collection-item-field", fieldKey: field.key,
              collectionFieldKey: binding.binding.collectionFieldKey, itemKey: collectionSource.itemKey,
              assetId, assetOwner, valueSource,
            })
          }
        })
      })
      return {
        sourceCellId: sourceCell.sourceCellId,
        cellInstanceId: resolvedCell.identity.provenance.identity.id,
        childIds,
        nodes,
      }
    })
    rows.push({
      kind: "materialized-content",
      rowInstanceId,
      rowSourceId: collectionSource.rowSourceId,
      rowTemplateId: collectionSource.rowTemplateId,
      itemKey: collectionSource.itemKey,
      cells: materializedCells,
    })
    materializedRowCount += 1
    cellCount += materializedCells.length
  })

  return {
    source: VNEXT_TABLE_CONTENT_MATERIALIZATION_SOURCE,
    contractVersion: VNEXT_TABLE_CONTENT_MATERIALIZATION_VERSION,
    status: "materialized",
    documentId: request.document.document.id,
    tableId: request.definition.tableId,
    tableDefinitionId: request.definition.tableDefinitionId,
    instanceRevision: request.resolvedRows.instanceRevision,
    resolutionInputFingerprint: request.resolvedRows.resolutionInputFingerprint,
    rows,
    bindings: { text: textBindings, images: imageBindings },
    provenance: clone(provenance),
    work: {
      rowCount: rows.length,
      materializedRowCount,
      authoredReferenceRowCount,
      cellCount,
      clonedNodeCount,
      clonedInlineCount,
      textBindingCount: textBindings.length,
      imageBindingCount: imageBindings.length,
      sourcePlanDocumentRootScans: 1,
      materializationDocumentRootScans: 1,
    },
    execution: {
      identityAllocation: "not-run",
      authoredGraphMutation: false,
      mediaFetch: "not-run",
      measurement: "not-run",
      pagination: "not-run",
      rendering: "not-run",
    },
    issues: [],
  }
}
