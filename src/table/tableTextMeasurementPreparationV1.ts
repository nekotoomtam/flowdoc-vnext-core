import {
  VNextPublishedStyleCatalogV1Schema,
  type VNextPublishedStyleCatalogV1,
} from "../resolution/resolutionInputPins.js"
import { sameVNextPublishedStructureVersionRefV1 } from "../lifecycle/structureIdentity.js"
import {
  createVNextTextBlockV4MeasurementRequestFromResolvedNode,
  type VNextTextBlockV4MeasurementRequest,
} from "../pagination/textBlockV4Measurement.js"
import { VNextTableDefinitionV1Schema, type VNextTableDefinitionV1 } from "./tableDefinitionV1.js"
import type { VNextTableContentMaterializationResultV1 } from "./tableContentMaterializationContractV1.js"
import type { VNextTableCellGeometryResultV1 } from "./tableCellGeometryV1.js"

export const VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_VERSION = 1 as const
export const VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_SOURCE = "vnext-table-text-measurement-preparation"

export interface VNextTableTextMeasurementPreparationInputV1 {
  definition: VNextTableDefinitionV1
  materialization: VNextTableContentMaterializationResultV1
  geometry: VNextTableCellGeometryResultV1
  styleCatalog: VNextPublishedStyleCatalogV1
  sectionId: string
  measurementProfileId: string
}

export interface VNextTableTextMeasurementRequestContextV1 {
  rowIndex: number
  rowIdentity:
    | { kind: "resolved-row"; rowInstanceId: string }
    | { kind: "authored-row"; sourceRowId: string }
  rowTemplateId: string
  sourceCellId: string
  cellIdentity:
    | { kind: "resolved-cell"; cellInstanceId: string }
    | { kind: "authored-cell"; sourceCellId: string }
  textBlockId: string
  request: VNextTextBlockV4MeasurementRequest
}

export interface VNextTableTextMeasurementPreparationIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
  textBlockId?: string
}

export type VNextTableTextMeasurementPreparationResultV1 =
  | {
      source: typeof VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_SOURCE
      contractVersion: typeof VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_VERSION
      status: "ready"
      documentId: string
      instanceRevision: number
      tableId: string
      tableDefinitionId: string
      geometryFingerprint: string
      measurementProfileId: string
      requestsByTextBlockId: Record<string, VNextTableTextMeasurementRequestContextV1>
      work: {
        rowCount: number
        materializedRowCount: number
        authoredReferenceRowCount: number
        cellCount: number
        visitedNodeCount: number
        textMeasurementRequestCount: number
      }
      execution: { measurement: "not-run"; pagination: "not-run"; rendering: "not-run" }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_SOURCE
      contractVersion: typeof VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_VERSION
      status: "blocked"
      requestsByTextBlockId: null
      issues: VNextTableTextMeasurementPreparationIssueV1[]
    }

function issue(
  code: string,
  path: string,
  message: string,
  textBlockId?: string,
): VNextTableTextMeasurementPreparationIssueV1 {
  return { code, path, message, severity: "error", ...(textBlockId == null ? {} : { textBlockId }) }
}

function blocked(
  issues: VNextTableTextMeasurementPreparationIssueV1[],
): VNextTableTextMeasurementPreparationResultV1 {
  return {
    source: VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_SOURCE,
    contractVersion: VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_VERSION,
    status: "blocked",
    requestsByTextBlockId: null,
    issues,
  }
}

export function createVNextTableTextMeasurementPreparationV1(
  input: VNextTableTextMeasurementPreparationInputV1,
): VNextTableTextMeasurementPreparationResultV1 {
  const issues: VNextTableTextMeasurementPreparationIssueV1[] = []
  const definition = VNextTableDefinitionV1Schema.safeParse(input.definition)
  if (!definition.success) issues.push(issue(
    "invalid-table-definition",
    "definition",
    "text measurement preparation requires an accepted Table Definition v1",
  ))
  const styleCatalog = VNextPublishedStyleCatalogV1Schema.safeParse(input.styleCatalog)
  if (!styleCatalog.success) issues.push(issue(
    "invalid-style-catalog",
    "styleCatalog",
    "text measurement preparation requires an accepted Published Style Catalog v1",
  ))
  if (input.materialization.status !== "materialized") issues.push(issue(
    "content-not-materialized", "materialization.status", "Table content must be materialized before measurement preparation",
  ))
  if (input.geometry.status !== "ready") issues.push(issue(
    "cell-geometry-not-ready", "geometry.status", "Table cell geometry must be ready before measurement preparation",
  ))
  if (input.sectionId.trim().length === 0) issues.push(issue(
    "missing-section-id", "sectionId", "section id must not be blank",
  ))
  if (input.measurementProfileId.trim().length === 0) issues.push(issue(
    "missing-measurement-profile", "measurementProfileId", "measurement profile id must not be blank",
  ))
  if (issues.length > 0 || !definition.success || !styleCatalog.success
    || input.materialization.status !== "materialized" || input.geometry.status !== "ready") {
    return blocked(issues)
  }

  const acceptedDefinition = definition.data
  const acceptedCatalog = styleCatalog.data
  const materialization = input.materialization
  const geometry = input.geometry
  if (acceptedDefinition.owner.kind !== "published-structure-version") issues.push(issue(
    "draft-definition-style-owner-unsupported",
    "definition.owner",
    "materialized Table measurement requires an exact Published Structure Version owner",
  ))
  else if (!sameVNextPublishedStructureVersionRefV1(acceptedDefinition.owner.ref, acceptedCatalog.owner)) issues.push(issue(
    "style-owner-mismatch",
    "styleCatalog.owner",
    "style catalog must belong to the exact Table Definition Published Structure Version",
  ))
  if (
    materialization.tableId !== acceptedDefinition.tableId
    || materialization.tableDefinitionId !== acceptedDefinition.tableDefinitionId
  ) issues.push(issue(
    "materialization-definition-mismatch",
    "materialization",
    "materialized content must target the exact supplied Table Definition",
  ))
  if (
    geometry.geometry.tableId !== acceptedDefinition.tableId
    || geometry.geometry.tableDefinitionId !== acceptedDefinition.tableDefinitionId
  ) issues.push(issue(
    "geometry-definition-mismatch",
    "geometry.geometry",
    "cell geometry must target the exact supplied Table Definition",
  ))

  const textBindings = new Map<string, { fieldKey: string; value: string }>()
  materialization.bindings.text.forEach((binding, index) => {
    if (textBindings.has(binding.resolvedPlacementId)) issues.push(issue(
      "duplicate-resolved-text-binding",
      `materialization.bindings.text[${index}].resolvedPlacementId`,
      `duplicate resolved text binding "${binding.resolvedPlacementId}"`,
    ))
    textBindings.set(binding.resolvedPlacementId, { fieldKey: binding.fieldKey, value: binding.value })
  })
  const imageBindings = new Map<string, { assetId: string | null }>()
  materialization.bindings.images.forEach((binding, index) => {
    if (imageBindings.has(binding.resolvedPlacementId)) issues.push(issue(
      "duplicate-resolved-image-binding",
      `materialization.bindings.images[${index}].resolvedPlacementId`,
      `duplicate resolved image binding "${binding.resolvedPlacementId}"`,
    ))
    imageBindings.set(binding.resolvedPlacementId, { assetId: binding.assetId })
  })
  if (issues.length > 0) return blocked(issues)

  const requestsByTextBlockId: Record<string, VNextTableTextMeasurementRequestContextV1> = {}
  let materializedRowCount = 0
  let authoredReferenceRowCount = 0
  let cellCount = 0
  let visitedNodeCount = 0
  materialization.rows.forEach((row, rowIndex) => {
    if (row.kind === "authored-content-reference") {
      authoredReferenceRowCount += 1
      return
    }
    materializedRowCount += 1
    const templateGeometry = geometry.geometry.rowTemplates[row.rowTemplateId]
    if (templateGeometry == null) {
      issues.push(issue(
        "missing-row-template-geometry",
        `materialization.rows[${rowIndex}].rowTemplateId`,
        `geometry is missing row template "${row.rowTemplateId}"`,
      ))
      return
    }
    row.cells.forEach((cell, cellIndex) => {
      cellCount += 1
      const cellGeometry = templateGeometry.cells.find((candidate) => candidate.sourceCellId === cell.sourceCellId)
      if (cellGeometry == null) {
        issues.push(issue(
          "missing-cell-geometry",
          `materialization.rows[${rowIndex}].cells[${cellIndex}].sourceCellId`,
          `geometry is missing source cell "${cell.sourceCellId}"`,
        ))
        return
      }
      cell.childIds.forEach((nodeId, nodeIndex) => {
        visitedNodeCount += 1
        const node = cell.nodes[nodeId]
        if (node == null) {
          issues.push(issue(
            "materialized-cell-node-missing",
            `materialization.rows[${rowIndex}].cells[${cellIndex}].childIds[${nodeIndex}]`,
            `materialized cell node "${nodeId}" is missing`,
          ))
          return
        }
        if (node.type !== "text-block") return
        if (requestsByTextBlockId[node.id] != null) {
          issues.push(issue(
            "duplicate-materialized-text-block",
            `materialization.rows[${rowIndex}].cells[${cellIndex}].nodes.${node.id}`,
            `resolved text-block "${node.id}" occurs more than once`,
            node.id,
          ))
          return
        }
        const styleKey = node.props.textStyleId ?? "default"
        if (node.props.textStyleId != null && acceptedCatalog.styles[node.props.textStyleId] == null) {
          issues.push(issue(
            "missing-text-style",
            `materialization.rows[${rowIndex}].cells[${cellIndex}].nodes.${node.id}.props.textStyleId`,
            `text-block references missing style "${node.props.textStyleId}"`,
            node.id,
          ))
          return
        }
        const request = createVNextTextBlockV4MeasurementRequestFromResolvedNode({
          documentId: materialization.documentId,
          instanceRevision: materialization.instanceRevision,
          sectionId: input.sectionId,
          textBlock: node,
          availableWidthPt: cellGeometry.contentWidthPt,
          measurementProfileId: input.measurementProfileId,
          styleKey,
          resolvedTextByInlineId: Object.fromEntries(textBindings),
          resolvedImageByPlacementId: Object.fromEntries(imageBindings),
        })
        if (request.status === "blocked") {
          issues.push(...request.issues.map((item) => issue(
            item.code,
            `materialization.rows[${rowIndex}].cells[${cellIndex}].nodes.${node.id}.${item.path}`,
            item.message,
            node.id,
          )))
          return
        }
        requestsByTextBlockId[node.id] = {
          rowIndex,
          rowIdentity: { kind: "resolved-row", rowInstanceId: row.rowInstanceId },
          rowTemplateId: row.rowTemplateId,
          sourceCellId: cell.sourceCellId,
          cellIdentity: { kind: "resolved-cell", cellInstanceId: cell.cellInstanceId },
          textBlockId: node.id,
          request: request.request,
        }
      })
    })
  })
  if (issues.length > 0) return blocked(issues)

  return {
    source: VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_SOURCE,
    contractVersion: VNEXT_TABLE_TEXT_MEASUREMENT_PREPARATION_VERSION,
    status: "ready",
    documentId: materialization.documentId,
    instanceRevision: materialization.instanceRevision,
    tableId: materialization.tableId,
    tableDefinitionId: materialization.tableDefinitionId,
    geometryFingerprint: geometry.geometry.fingerprint,
    measurementProfileId: input.measurementProfileId,
    requestsByTextBlockId,
    work: {
      rowCount: materialization.rows.length,
      materializedRowCount,
      authoredReferenceRowCount,
      cellCount,
      visitedNodeCount,
      textMeasurementRequestCount: Object.keys(requestsByTextBlockId).length,
    },
    execution: { measurement: "not-run", pagination: "not-run", rendering: "not-run" },
    issues: [],
  }
}
