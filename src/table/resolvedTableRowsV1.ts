import { z } from "zod"
import {
  VNextDocumentInstanceIdentityV1Schema,
  sameVNextPublishedStructureVersionRefV1,
  type VNextDocumentInstanceIdentityV1,
} from "../lifecycle/structureIdentity.js"
import { VNextPublishedFieldContractV1Schema } from "../resolution/resolutionInputPins.js"
import {
  VNextDerivedIdentityProvenanceV1Schema,
  type VNextDerivedIdentityProvenanceV1,
} from "../identity/identityStandardV1.js"
import { auditVNextDerivedIdentityBatchV1 } from "../identity/identityBatchAuditV1.js"
import {
  VNextTableDefinitionV1Schema,
  type VNextTableCellPlacementV1,
  type VNextTableColumnDefinitionV1,
  type VNextTableDefinitionV1,
  type VNextTableRowBreakPolicyV1,
  type VNextTableRowRoleV1,
  type VNextTableRowTemplateV1,
} from "./tableDefinitionV1.js"
import {
  VNextTableCollectionSnapshotV1Schema,
  type VNextTableCollectionItemV1,
  type VNextTableCollectionSnapshotV1,
} from "./tableCollectionSnapshotV1.js"

export const VNEXT_RESOLVED_TABLE_ROWS_SOURCE = "vnext-resolved-table-rows"
export const VNEXT_RESOLVED_TABLE_ROWS_CONTRACT_VERSION = 1 as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})

export const VNextTableCollectionIdentityAssignmentV1Schema = z.object({
  rowSourceId: NonBlankIdSchema,
  itemKey: NonBlankIdSchema,
  row: VNextDerivedIdentityProvenanceV1Schema,
  cells: z.record(NonBlankIdSchema, VNextDerivedIdentityProvenanceV1Schema),
}).strict()

export const VNextResolvedTableRowsRequestV1Schema = z.object({
  contractVersion: z.literal(VNEXT_RESOLVED_TABLE_ROWS_CONTRACT_VERSION),
  kind: z.literal("resolved-table-rows-request"),
  instance: VNextDocumentInstanceIdentityV1Schema,
  resolutionInputFingerprint: NonBlankIdSchema,
  definition: VNextTableDefinitionV1Schema,
  fieldContract: VNextPublishedFieldContractV1Schema,
  collectionSnapshot: VNextTableCollectionSnapshotV1Schema.optional(),
  identityAssignments: z.array(VNextTableCollectionIdentityAssignmentV1Schema),
}).strict()

export type VNextTableCollectionIdentityAssignmentV1 = z.infer<
  typeof VNextTableCollectionIdentityAssignmentV1Schema
>
export type VNextResolvedTableRowsRequestV1 = z.infer<typeof VNextResolvedTableRowsRequestV1Schema>

export type VNextResolvedTableRowIdentityV1 =
  | { kind: "authored-row"; rowId: string }
  | { kind: "allocated-row"; provenance: VNextDerivedIdentityProvenanceV1 }

export type VNextResolvedTableCellIdentityV1 =
  | { kind: "authored-cell"; cellId: string }
  | { kind: "allocated-cell"; provenance: VNextDerivedIdentityProvenanceV1 }

export interface VNextResolvedTableCellV1 extends VNextTableCellPlacementV1 {
  identity: VNextResolvedTableCellIdentityV1
  sourceCellId: string
}

export type VNextResolvedTableRowSourceV1 =
  | {
      kind: "static-row"
      rowSourceId: string
      rowTemplateId: string
      sourceRowId: string
    }
  | {
      kind: "collection-row"
      rowSourceId: string
      rowTemplateId: string
      sourceRowId: string
      collectionFieldKey: string
      itemKey: string
    }
  | {
      kind: "empty-state-row"
      rowSourceId: string
      rowTemplateId: string
      sourceRowId: string
      collectionFieldKey: string
    }

export interface VNextResolvedTableRowV1 {
  identity: VNextResolvedTableRowIdentityV1
  source: VNextResolvedTableRowSourceV1
  role: VNextTableRowRoleV1
  breakPolicy: VNextTableRowBreakPolicyV1
  minHeightPt?: number
  itemValues: VNextTableCollectionItemV1["values"] | null
  cells: VNextResolvedTableCellV1[]
}

export interface VNextResolvedTableRowsReadyV1 {
  source: typeof VNEXT_RESOLVED_TABLE_ROWS_SOURCE
  contractVersion: typeof VNEXT_RESOLVED_TABLE_ROWS_CONTRACT_VERSION
  status: "resolved"
  tableId: string
  tableDefinitionId: string
  instanceId: string
  instanceRevision: number
  resolutionInputFingerprint: string
  collectionSnapshotId: string | null
  collectionSnapshotRevision: number | null
  columns: VNextTableColumnDefinitionV1[]
  headerPolicy: VNextTableDefinitionV1["headerPolicy"]
  leadingHeaderRowCount: number
  rows: VNextResolvedTableRowV1[]
  execution: {
    inputFetch: "not-run"
    authoredGraphMutation: false
    contentMaterialization: "not-run"
    measurement: "not-run"
    pagination: "not-run"
    rendering: "not-run"
  }
  issues: []
}

export interface VNextResolvedTableRowsSuppressedV1 {
  source: typeof VNEXT_RESOLVED_TABLE_ROWS_SOURCE
  contractVersion: typeof VNEXT_RESOLVED_TABLE_ROWS_CONTRACT_VERSION
  status: "suppressed"
  reason: "empty-collection-hide-table"
  tableId: string
  tableDefinitionId: string
  instanceId: string
  instanceRevision: number
  rows: []
  issues: []
}

export interface VNextResolvedTableRowsIssue {
  source: "schema" | "definition" | "field" | "snapshot" | "identity"
  code: string
  path: string
  message: string
  severity: "error"
}

export interface VNextResolvedTableRowsBlockedV1 {
  source: typeof VNEXT_RESOLVED_TABLE_ROWS_SOURCE
  contractVersion: typeof VNEXT_RESOLVED_TABLE_ROWS_CONTRACT_VERSION
  status: "blocked"
  rows: null
  issues: VNextResolvedTableRowsIssue[]
}

export type VNextResolvedTableRowsResultV1 =
  | VNextResolvedTableRowsReadyV1
  | VNextResolvedTableRowsSuppressedV1
  | VNextResolvedTableRowsBlockedV1

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

function blocked(issues: VNextResolvedTableRowsIssue[]): VNextResolvedTableRowsBlockedV1 {
  return {
    source: VNEXT_RESOLVED_TABLE_ROWS_SOURCE,
    contractVersion: VNEXT_RESOLVED_TABLE_ROWS_CONTRACT_VERSION,
    status: "blocked",
    rows: null,
    issues,
  }
}

function addIssue(
  issues: VNextResolvedTableRowsIssue[],
  source: VNextResolvedTableRowsIssue["source"],
  code: string,
  path: string,
  message: string,
): void {
  issues.push({ source, code, path, message, severity: "error" })
}

function sameInstance(
  left: VNextDocumentInstanceIdentityV1,
  right: VNextDocumentInstanceIdentityV1,
): boolean {
  return left.instanceId === right.instanceId
    && left.revision === right.revision
    && sameVNextPublishedStructureVersionRefV1(left.structureVersion, right.structureVersion)
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

function validateAllocatedProvenance(
  provenance: VNextDerivedIdentityProvenanceV1,
  expectedKind: "resolved-row" | "resolved-cell",
  expectedOriginKind: "collection-row" | "resolved-cell",
  expectedRefs: Record<string, string>,
  expectedRevisionPins: Record<string, number>,
  instance: VNextDocumentInstanceIdentityV1,
  resolutionInputFingerprint: string,
  path: string,
  issues: VNextResolvedTableRowsIssue[],
): void {
  if (provenance.identity.identityKind !== expectedKind) addIssue(
    issues, "identity", "identity-kind-mismatch", `${path}.identity.identityKind`,
    `expected ${expectedKind} identity`,
  )
  const scope = provenance.identity.scope
  if (
    scope.kind !== "document-resolution"
    || scope.documentInstanceId !== instance.instanceId
    || scope.instanceRevision !== instance.revision
    || scope.resolutionInputFingerprint !== resolutionInputFingerprint
  ) addIssue(
    issues, "identity", "identity-scope-mismatch", `${path}.identity.scope`,
    "allocated identity must use the exact document-resolution scope",
  )
  if (provenance.origin.kind !== expectedOriginKind) addIssue(
    issues, "identity", "identity-origin-kind-mismatch", `${path}.origin.kind`,
    `expected ${expectedOriginKind} origin`,
  )
  if (!exactRecord(provenance.origin.refs, expectedRefs)) addIssue(
    issues, "identity", "identity-origin-refs-mismatch", `${path}.origin.refs`,
    "identity origin references do not match the resolved table row source",
  )
  if (!exactRecord(provenance.origin.revisionPins, expectedRevisionPins)) addIssue(
    issues, "identity", "identity-origin-revisions-mismatch", `${path}.origin.revisionPins`,
    "identity origin revision pins do not match the resolved table input",
  )
}

function authoredCells(template: VNextTableRowTemplateV1): VNextResolvedTableCellV1[] {
  return template.cells.map((cell) => ({
    ...clone(cell),
    identity: { kind: "authored-cell", cellId: cell.cellId },
    sourceCellId: cell.cellId,
  }))
}

function authoredRow(
  source: VNextResolvedTableRowSourceV1,
  role: VNextTableRowRoleV1,
  template: VNextTableRowTemplateV1,
): VNextResolvedTableRowV1 {
  return {
    identity: { kind: "authored-row", rowId: template.sourceRowId },
    source,
    role,
    breakPolicy: template.breakPolicy,
    ...(template.minHeightPt == null ? {} : { minHeightPt: template.minHeightPt }),
    itemValues: null,
    cells: authoredCells(template),
  }
}

function assignmentMap(
  assignments: readonly VNextTableCollectionIdentityAssignmentV1[],
  issues: VNextResolvedTableRowsIssue[],
): Map<string, Map<string, { assignment: VNextTableCollectionIdentityAssignmentV1; index: number }>> {
  const bySource = new Map<string, Map<string, { assignment: VNextTableCollectionIdentityAssignmentV1; index: number }>>()
  assignments.forEach((assignment, index) => {
    let byItem = bySource.get(assignment.rowSourceId)
    if (byItem == null) {
      byItem = new Map()
      bySource.set(assignment.rowSourceId, byItem)
    }
    if (byItem.has(assignment.itemKey)) addIssue(
      issues, "identity", "duplicate-identity-assignment", `identityAssignments[${index}]`,
      `duplicate identity assignment for row source "${assignment.rowSourceId}" item "${assignment.itemKey}"`,
    )
    else byItem.set(assignment.itemKey, { assignment, index })
  })
  return bySource
}

export function resolveVNextTableRowsV1(value: unknown): VNextResolvedTableRowsResultV1 {
  const parsed = VNextResolvedTableRowsRequestV1Schema.safeParse(value)
  if (!parsed.success) return blocked(parsed.error.issues.map((item) => ({
    source: "schema",
    code: item.code,
    path: formatIssuePath(item.path),
    message: item.message,
    severity: "error",
  })))

  const request = parsed.data
  const { definition, instance, fieldContract, collectionSnapshot } = request
  const issues: VNextResolvedTableRowsIssue[] = []
  const publishedOwner = definition.owner.kind === "published-structure-version"
    ? definition.owner.ref
    : null
  if (publishedOwner == null) addIssue(
    issues, "definition", "table-definition-owner-not-published", "definition.owner.kind",
    "Document Instance table resolution requires a Published Structure Version-owned definition",
  )
  if (publishedOwner != null && !sameVNextPublishedStructureVersionRefV1(publishedOwner, instance.structureVersion)) addIssue(
    issues, "definition", "table-definition-version-mismatch", "definition.owner.ref",
    "table definition must belong to the instance's exact Published Structure Version",
  )
  if (!sameVNextPublishedStructureVersionRefV1(fieldContract.owner, instance.structureVersion)) addIssue(
    issues, "field", "field-contract-version-mismatch", "fieldContract.owner",
    "field contract must belong to the instance's exact Published Structure Version",
  )
  if (collectionSnapshot != null && !sameInstance(collectionSnapshot.instance, instance)) addIssue(
    issues, "snapshot", "collection-snapshot-instance-mismatch", "collectionSnapshot.instance",
    "collection snapshot must pin the exact Document Instance revision",
  )

  const collectionSources = definition.rowSources.filter((source) => source.kind === "collection-rows")
  if (collectionSources.length > 0 && collectionSnapshot == null) addIssue(
    issues, "snapshot", "missing-collection-snapshot", "collectionSnapshot",
    "collection row sources require one exact instance-pinned collection snapshot",
  )

  collectionSources.forEach((source) => {
    const definitionField = fieldContract.registry.fields[source.collectionFieldKey]
    if (definitionField == null) addIssue(
      issues, "field", "missing-collection-field", `definition.rowSources[${definition.rowSources.indexOf(source)}].collectionFieldKey`,
      `missing field definition "${source.collectionFieldKey}"`,
    )
    else if (definitionField.type !== "collection") addIssue(
      issues, "field", "collection-field-type-mismatch", `definition.rowSources[${definition.rowSources.indexOf(source)}].collectionFieldKey`,
      `table collection source requires collection field; got ${definitionField.type}`,
    )
    if (collectionSnapshot != null && collectionSnapshot.collections[source.collectionFieldKey] == null) addIssue(
      issues, "snapshot", "missing-collection-value", `collectionSnapshot.collections.${source.collectionFieldKey}`,
      `collection snapshot is missing "${source.collectionFieldKey}"`,
    )
  })

  const suppressesTable = collectionSnapshot != null && collectionSources.some((source) => (
    source.emptyPolicy.kind === "hide-table"
    && collectionSnapshot.collections[source.collectionFieldKey]?.items.length === 0
  ))

  if (suppressesTable && request.identityAssignments.length > 0) addIssue(
    issues, "identity", "suppressed-table-has-identity-assignments", "identityAssignments",
    "a suppressed table must not allocate collection row or cell identities",
  )

  const bySource = assignmentMap(request.identityAssignments, issues)
  const expectedAssignments = new Map<string, Set<string>>()
  if (!suppressesTable && collectionSnapshot != null) {
    collectionSources.forEach((source) => {
      const collection = collectionSnapshot.collections[source.collectionFieldKey]
      if (collection != null) expectedAssignments.set(
        source.rowSourceId,
        new Set(collection.items.map((item) => item.itemKey)),
      )
    })
  }

  request.identityAssignments.forEach((assignment, index) => {
    const expectedItems = expectedAssignments.get(assignment.rowSourceId)
    if (expectedItems == null || !expectedItems.has(assignment.itemKey)) addIssue(
      issues, "identity", "unexpected-identity-assignment", `identityAssignments[${index}]`,
      "identity assignment does not match a resolved collection row occurrence",
    )
  })

  const allProvenance: VNextDerivedIdentityProvenanceV1[] = []
  if (!suppressesTable && collectionSnapshot != null) collectionSources.forEach((source) => {
    const collection = collectionSnapshot.collections[source.collectionFieldKey]
    const template = definition.rowTemplates[source.rowTemplateId]
    if (collection == null || template == null) return
    collection.items.forEach((item) => {
      const found = bySource.get(source.rowSourceId)?.get(item.itemKey)
      if (found == null) {
        addIssue(
          issues, "identity", "missing-identity-assignment", "identityAssignments",
          `missing identity assignment for row source "${source.rowSourceId}" item "${item.itemKey}"`,
        )
        return
      }

      const revisionPins = {
        structureVersionOrdinal: instance.structureVersion.versionOrdinal,
        instanceRevision: instance.revision,
        collectionSnapshotRevision: collectionSnapshot.snapshotRevision,
      }
      const rowRefs = {
        tableId: definition.tableId,
        rowSourceId: source.rowSourceId,
        rowTemplateId: source.rowTemplateId,
        sourceRowId: template.sourceRowId,
        collectionFieldKey: source.collectionFieldKey,
        itemKey: item.itemKey,
      }
      validateAllocatedProvenance(
        found.assignment.row,
        "resolved-row",
        "collection-row",
        rowRefs,
        revisionPins,
        instance,
        request.resolutionInputFingerprint,
        `identityAssignments[${found.index}].row`,
        issues,
      )
      allProvenance.push(found.assignment.row)

      const expectedCellIds = new Set(template.cells.map((cell) => cell.cellId))
      Object.keys(found.assignment.cells).forEach((cellId) => {
        if (!expectedCellIds.has(cellId)) addIssue(
          issues, "identity", "unexpected-cell-identity-assignment",
          `identityAssignments[${found.index}].cells.${cellId}`,
          `identity assignment references cell "${cellId}" outside row template`,
        )
      })
      template.cells.forEach((cell) => {
        const cellProvenance = found.assignment.cells[cell.cellId]
        if (cellProvenance == null) {
          addIssue(
            issues, "identity", "missing-cell-identity-assignment",
            `identityAssignments[${found.index}].cells.${cell.cellId}`,
            `missing allocated identity for resolved cell "${cell.cellId}"`,
          )
          return
        }
        validateAllocatedProvenance(
          cellProvenance,
          "resolved-cell",
          "resolved-cell",
          { ...rowRefs, sourceCellId: cell.cellId, rowInstanceId: found.assignment.row.identity.id },
          revisionPins,
          instance,
          request.resolutionInputFingerprint,
          `identityAssignments[${found.index}].cells.${cell.cellId}`,
          issues,
        )
        allProvenance.push(cellProvenance)
      })
    })
  })

  const identityAudit = auditVNextDerivedIdentityBatchV1(allProvenance)
  if (identityAudit.status === "blocked") identityAudit.issues.forEach((item, index) => addIssue(
    issues, "identity", item.code, `identityAudit.issues[${index}]`, item.message,
  ))

  if (issues.length > 0) return blocked(issues)
  if (suppressesTable) return {
    source: VNEXT_RESOLVED_TABLE_ROWS_SOURCE,
    contractVersion: VNEXT_RESOLVED_TABLE_ROWS_CONTRACT_VERSION,
    status: "suppressed",
    reason: "empty-collection-hide-table",
    tableId: definition.tableId,
    tableDefinitionId: definition.tableDefinitionId,
    instanceId: instance.instanceId,
    instanceRevision: instance.revision,
    rows: [],
    issues: [],
  }

  const rows: VNextResolvedTableRowV1[] = []
  definition.rowSources.forEach((source) => {
    const template = definition.rowTemplates[source.rowTemplateId]
    if (source.kind === "static-row") {
      rows.push(authoredRow({
        kind: "static-row",
        rowSourceId: source.rowSourceId,
        rowTemplateId: source.rowTemplateId,
        sourceRowId: template.sourceRowId,
      }, source.role, template))
      return
    }

    const collection = collectionSnapshot?.collections[source.collectionFieldKey]
    if (collection == null) return
    if (collection.items.length === 0) {
      if (source.emptyPolicy.kind === "empty-row") {
        const emptyTemplate = definition.rowTemplates[source.emptyPolicy.rowTemplateId]
        rows.push(authoredRow({
          kind: "empty-state-row",
          rowSourceId: source.rowSourceId,
          rowTemplateId: emptyTemplate.rowTemplateId,
          sourceRowId: emptyTemplate.sourceRowId,
          collectionFieldKey: source.collectionFieldKey,
        }, "empty-state", emptyTemplate))
      }
      return
    }

    collection.items.forEach((item) => {
      const assignment = bySource.get(source.rowSourceId)?.get(item.itemKey)?.assignment
      if (assignment == null) throw new Error("validated table identity assignment missing")
      rows.push({
        identity: { kind: "allocated-row", provenance: clone(assignment.row) },
        source: {
          kind: "collection-row",
          rowSourceId: source.rowSourceId,
          rowTemplateId: source.rowTemplateId,
          sourceRowId: template.sourceRowId,
          collectionFieldKey: source.collectionFieldKey,
          itemKey: item.itemKey,
        },
        role: "body",
        breakPolicy: template.breakPolicy,
        ...(template.minHeightPt == null ? {} : { minHeightPt: template.minHeightPt }),
        itemValues: clone(item.values),
        cells: template.cells.map((cell) => ({
          ...clone(cell),
          identity: { kind: "allocated-cell", provenance: clone(assignment.cells[cell.cellId]) },
          sourceCellId: cell.cellId,
        })),
      })
    })
  })

  const leadingHeaderRowCount = rows.findIndex((row) => row.role !== "header")
  return {
    source: VNEXT_RESOLVED_TABLE_ROWS_SOURCE,
    contractVersion: VNEXT_RESOLVED_TABLE_ROWS_CONTRACT_VERSION,
    status: "resolved",
    tableId: definition.tableId,
    tableDefinitionId: definition.tableDefinitionId,
    instanceId: instance.instanceId,
    instanceRevision: instance.revision,
    resolutionInputFingerprint: request.resolutionInputFingerprint,
    collectionSnapshotId: collectionSnapshot?.collectionSnapshotId ?? null,
    collectionSnapshotRevision: collectionSnapshot?.snapshotRevision ?? null,
    columns: clone(definition.columns),
    headerPolicy: definition.headerPolicy,
    leadingHeaderRowCount: leadingHeaderRowCount === -1 ? rows.length : leadingHeaderRowCount,
    rows,
    execution: {
      inputFetch: "not-run",
      authoredGraphMutation: false,
      contentMaterialization: "not-run",
      measurement: "not-run",
      pagination: "not-run",
      rendering: "not-run",
    },
    issues: [],
  }
}
