import { z } from "zod"
import {
  DocumentNodeV4TargetSchema,
  type AuthoredNodeV4Target,
  type DocumentNodeV4Target,
  type DocumentSectionV4Target,
} from "../schema/documentV4Target.js"
import { validateVNextDocumentV4Structure } from "../schema/documentV4Structure.js"
import {
  VNextTableDefinitionV1Schema,
  type VNextTableDefinitionV1,
} from "./tableDefinitionV1.js"
import {
  VNextPublishedFieldContractV1Schema,
  type VNextPublishedFieldContractV1,
} from "../resolution/resolutionInputPins.js"
import {
  VNextPublishedCollectionItemContractV1Schema,
  type VNextPublishedCollectionItemContractV1,
} from "./collectionItemContractV1.js"
import {
  VNextPublishedTableContentBindingContractV1Schema,
  validateVNextTableContentContractsV1,
  type VNextPublishedTableContentBindingContractV1,
  type VNextTableContentPlacementBindingV1,
} from "./tableContentBindingV1.js"

export const VNEXT_TABLE_CONTENT_SOURCE_PLAN_VERSION = 1 as const
export const VNEXT_TABLE_CONTENT_SOURCE_PLAN_SOURCE = "vnext-table-content-source-plan"

export interface VNextTableContentSourcePlacementV1 {
  sourcePlacementId: string
  sourceNodeId: string
  placementKind: VNextTableContentPlacementBindingV1["placementKind"]
  embeddedFieldKey: string
}

export interface VNextTableContentSourceNodeV1 {
  sourceNodeId: string
  nodeType: "text-block" | "image" | "divider" | "spacer"
  sourceInlineIds: string[]
  fieldPlacements: VNextTableContentSourcePlacementV1[]
}

export interface VNextTableContentSourceCellV1 {
  sourceCellId: string
  sourceNodes: VNextTableContentSourceNodeV1[]
}

export interface VNextTableContentSourceTemplateV1 {
  rowTemplateId: string
  sourceRowId: string
  collectionFieldKeys: string[]
  cells: VNextTableContentSourceCellV1[]
  fieldPlacements: VNextTableContentSourcePlacementV1[]
}

export interface VNextTableContentSourcePlanIssue {
  source: "schema" | "contract" | "structure" | "source-graph" | "binding"
  code: string
  path: string
  message: string
  severity: "error"
}

export type VNextTableContentSourcePlanResultV1 =
  | {
      source: typeof VNEXT_TABLE_CONTENT_SOURCE_PLAN_SOURCE
      contractVersion: typeof VNEXT_TABLE_CONTENT_SOURCE_PLAN_VERSION
      status: "ready"
      documentId: string
      sectionId: string
      tableId: string
      definition: VNextTableDefinitionV1
      fieldContract: VNextPublishedFieldContractV1
      itemContract: VNextPublishedCollectionItemContractV1
      bindingContract: VNextPublishedTableContentBindingContractV1
      templates: VNextTableContentSourceTemplateV1[]
      work: {
        templateCount: number
        cellCount: number
        nodeCount: number
        inlineCount: number
        fieldPlacementCount: number
        documentRootScans: 1
      }
      execution: {
        identityAllocation: "not-run"
        cloning: "not-run"
        valueBinding: "not-run"
        measurement: "not-run"
        pagination: "not-run"
      }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_CONTENT_SOURCE_PLAN_SOURCE
      contractVersion: typeof VNEXT_TABLE_CONTENT_SOURCE_PLAN_VERSION
      status: "blocked"
      templates: null
      issues: VNextTableContentSourcePlanIssue[]
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
  issues: VNextTableContentSourcePlanIssue[],
  source: VNextTableContentSourcePlanIssue["source"],
  code: string,
  path: string,
  message: string,
): void {
  issues.push({ source, code, path, message, severity: "error" })
}

function blocked(issues: VNextTableContentSourcePlanIssue[]): VNextTableContentSourcePlanResultV1 {
  return {
    source: VNEXT_TABLE_CONTENT_SOURCE_PLAN_SOURCE,
    contractVersion: VNEXT_TABLE_CONTENT_SOURCE_PLAN_VERSION,
    status: "blocked",
    templates: null,
    issues,
  }
}

function nodeFieldPlacements(node: AuthoredNodeV4Target): VNextTableContentSourcePlacementV1[] {
  if (node.type === "image" && node.source.kind === "image-field-ref") return [{
    sourcePlacementId: node.id,
    sourceNodeId: node.id,
    placementKind: "image-field-ref",
    embeddedFieldKey: node.source.fieldKey,
  }]
  if (node.type !== "text-block") return []
  return node.children.flatMap((inline): VNextTableContentSourcePlacementV1[] => {
    if (inline.type === "field-ref") return [{
      sourcePlacementId: inline.id,
      sourceNodeId: node.id,
      placementKind: "text-field-ref",
      embeddedFieldKey: inline.key,
    }]
    if (inline.type === "inline-image" && inline.source.kind === "image-field-ref") return [{
      sourcePlacementId: inline.id,
      sourceNodeId: node.id,
      placementKind: "image-field-ref",
      embeddedFieldKey: inline.source.fieldKey,
    }]
    return []
  })
}

function supportedNode(
  node: AuthoredNodeV4Target,
  path: string,
  issues: VNextTableContentSourcePlanIssue[],
): VNextTableContentSourceNodeV1 | null {
  if (node.type === "toc") {
    addIssue(
      issues, "source-graph", "unsupported-generated-content", path,
      `TOC node "${node.id}" is generated content and cannot be materialized in collection rows v1`,
    )
    return null
  }
  if (node.type !== "text-block" && node.type !== "image" && node.type !== "divider" && node.type !== "spacer") {
    addIssue(
      issues, "source-graph", "unsupported-source-node", path,
      `node "${node.id}" of type ${node.type} is outside table content materialization v1`,
    )
    return null
  }
  return {
    sourceNodeId: node.id,
    nodeType: node.type,
    sourceInlineIds: node.type === "text-block" ? node.children.map((inline) => inline.id) : [],
    fieldPlacements: nodeFieldPlacements(node),
  }
}

function findTable(
  document: DocumentNodeV4Target,
  tableId: string,
): { section: DocumentSectionV4Target; table: Extract<AuthoredNodeV4Target, { type: "table" }> } | null {
  for (const section of document.document.sections) {
    const node = section.nodes[tableId]
    if (node?.type === "table") return { section, table: node }
  }
  return null
}

export function createVNextTableContentSourcePlanV1(value: unknown): VNextTableContentSourcePlanResultV1 {
  const parsed = z.object({
    document: DocumentNodeV4TargetSchema,
    definition: VNextTableDefinitionV1Schema,
    fieldContract: VNextPublishedFieldContractV1Schema,
    itemContract: VNextPublishedCollectionItemContractV1Schema,
    bindingContract: VNextPublishedTableContentBindingContractV1Schema,
  }).strict().safeParse(value)
  if (!parsed.success) return blocked(parsed.error.issues.map((item) => ({
    source: "schema",
    code: item.code,
    path: formatIssuePath(item.path),
    message: item.message,
    severity: "error",
  })))

  const { document, definition, fieldContract, itemContract, bindingContract } = parsed.data
  const issues: VNextTableContentSourcePlanIssue[] = []
  const structure = validateVNextDocumentV4Structure(document)
  structure.issues.forEach((item) => addIssue(
    issues, "structure", item.code, `document.${item.path}`, item.message,
  ))
  const contracts = validateVNextTableContentContractsV1({
    definition, fieldContract, itemContract, bindingContract,
  })
  if (contracts.status === "blocked") contracts.issues.forEach((item) => addIssue(
    issues, "contract", item.code, item.path, item.message,
  ))

  const found = findTable(document, definition.tableId)
  if (found == null) {
    addIssue(
      issues, "source-graph", "missing-source-table", "definition.tableId",
      `document does not contain authored table "${definition.tableId}"`,
    )
    return blocked(issues)
  }
  const { section, table } = found
  const collectionFieldsByTemplate = new Map<string, Set<string>>()
  definition.rowSources.forEach((source) => {
    if (source.kind !== "collection-rows") return
    const fields = collectionFieldsByTemplate.get(source.rowTemplateId) ?? new Set<string>()
    fields.add(source.collectionFieldKey)
    collectionFieldsByTemplate.set(source.rowTemplateId, fields)
  })

  const templates: VNextTableContentSourceTemplateV1[] = []
  collectionFieldsByTemplate.forEach((collectionFields, rowTemplateId) => {
    const template = definition.rowTemplates[rowTemplateId]
    const templatePath = `definition.rowTemplates.${rowTemplateId}`
    if (template == null) return
    const row = section.nodes[template.sourceRowId]
    if (row?.type !== "table-row") {
      addIssue(
        issues, "source-graph", "missing-source-row", `${templatePath}.sourceRowId`,
        `row template references missing authored row "${template.sourceRowId}"`,
      )
      return
    }
    if (!table.rowIds.includes(row.id)) addIssue(
      issues, "source-graph", "source-row-outside-table", `${templatePath}.sourceRowId`,
      `authored row "${row.id}" is not owned by table "${table.id}"`,
    )
    const expectedCellIds = template.cells.map((cell) => cell.cellId)
    if (JSON.stringify(row.cellIds) !== JSON.stringify(expectedCellIds)) addIssue(
      issues, "source-graph", "source-row-cell-map-mismatch", `${templatePath}.cells`,
      "row template cells must exactly match authored row cell order before span-aware parser integration",
    )

    const cells: VNextTableContentSourceCellV1[] = []
    template.cells.forEach((placement, cellIndex) => {
      const cell = section.nodes[placement.cellId]
      const cellPath = `${templatePath}.cells[${cellIndex}].cellId`
      if (cell?.type !== "table-cell") {
        addIssue(
          issues, "source-graph", "missing-source-cell", cellPath,
          `row template references missing authored cell "${placement.cellId}"`,
        )
        return
      }
      const sourceNodes: VNextTableContentSourceNodeV1[] = []
      cell.childIds.forEach((nodeId, nodeIndex) => {
        const node = section.nodes[nodeId]
        const nodePath = `document.document.sections.${section.id}.nodes.${nodeId}`
        if (node == null) {
          addIssue(
            issues, "source-graph", "missing-source-node", `${cellPath}.childIds[${nodeIndex}]`,
            `authored cell references missing node "${nodeId}"`,
          )
          return
        }
        const planned = supportedNode(node, nodePath, issues)
        if (planned != null) sourceNodes.push(planned)
      })
      cells.push({ sourceCellId: cell.id, sourceNodes })
    })

    const fieldPlacements = cells.flatMap((cell) => cell.sourceNodes.flatMap((node) => node.fieldPlacements))
    const bindings = bindingContract.rowTemplates[rowTemplateId]?.placements ?? {}
    const reachableById = new Map(fieldPlacements.map((placement) => [placement.sourcePlacementId, placement]))
    fieldPlacements.forEach((placement) => {
      const binding = bindings[placement.sourcePlacementId]
      const path = `bindingContract.rowTemplates.${rowTemplateId}.placements.${placement.sourcePlacementId}`
      if (binding == null) {
        addIssue(
          issues, "binding", "missing-placement-binding", path,
          `field-bearing source placement "${placement.sourcePlacementId}" requires explicit binding scope`,
        )
        return
      }
      if (binding.placementKind !== placement.placementKind) addIssue(
        issues, "binding", "placement-kind-source-mismatch", `${path}.placementKind`,
        `binding kind ${binding.placementKind} does not match source ${placement.placementKind}`,
      )
      const boundKey = binding.binding.scope === "document-field"
        ? binding.binding.fieldKey
        : binding.binding.itemFieldKey
      if (boundKey !== placement.embeddedFieldKey) addIssue(
        issues, "binding", "embedded-field-key-mismatch", `${path}.binding`,
        `source placement key "${placement.embeddedFieldKey}" does not match bound key "${boundKey}"`,
      )
    })
    Object.keys(bindings).forEach((placementId) => {
      if (!reachableById.has(placementId)) addIssue(
        issues, "binding", "unreachable-placement-binding",
        `bindingContract.rowTemplates.${rowTemplateId}.placements.${placementId}`,
        `binding targets placement "${placementId}" outside the authored row template graph`,
      )
    })

    templates.push({
      rowTemplateId,
      sourceRowId: template.sourceRowId,
      collectionFieldKeys: [...collectionFields].sort(),
      cells,
      fieldPlacements,
    })
  })

  if (issues.length > 0) return blocked(issues)
  const cellCount = templates.reduce((total, template) => total + template.cells.length, 0)
  const nodeCount = templates.reduce(
    (total, template) => total + template.cells.reduce((cellTotal, cell) => cellTotal + cell.sourceNodes.length, 0),
    0,
  )
  const inlineCount = templates.reduce(
    (total, template) => total + template.cells.reduce(
      (cellTotal, cell) => cellTotal + cell.sourceNodes.reduce(
        (nodeTotal, node) => nodeTotal + node.sourceInlineIds.length,
        0,
      ),
      0,
    ),
    0,
  )
  const fieldPlacementCount = templates.reduce(
    (total, template) => total + template.fieldPlacements.length,
    0,
  )
  return {
    source: VNEXT_TABLE_CONTENT_SOURCE_PLAN_SOURCE,
    contractVersion: VNEXT_TABLE_CONTENT_SOURCE_PLAN_VERSION,
    status: "ready",
    documentId: document.document.id,
    sectionId: section.id,
    tableId: table.id,
    definition: clone(definition),
    fieldContract: clone(fieldContract),
    itemContract: clone(itemContract),
    bindingContract: clone(bindingContract),
    templates,
    work: {
      templateCount: templates.length,
      cellCount,
      nodeCount,
      inlineCount,
      fieldPlacementCount,
      documentRootScans: 1,
    },
    execution: {
      identityAllocation: "not-run",
      cloning: "not-run",
      valueBinding: "not-run",
      measurement: "not-run",
      pagination: "not-run",
    },
    issues: [],
  }
}
