import type { ZoneRole } from "./document.js"
import {
  VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES,
  VNEXT_DOCUMENT_V4_TARGET_SOURCE,
  VNEXT_DOCUMENT_V4_TARGET_VERSION,
  type AuthoredNodeV4Target,
  type AuthoredNodeV4TargetType,
  type DocumentNodeV4Target,
  type DocumentSectionV4Target,
} from "./documentV4Target.js"

export type VNextDocumentV4StructureIssueCode =
  | "duplicate-section-id"
  | "node-key-id-mismatch"
  | "duplicate-node-id"
  | "invalid-zone-reference"
  | "missing-child"
  | "invalid-child-type"
  | "multiple-parents"
  | "cycle"
  | "orphan-node"
  | "page-break-outside-body-zone"
  | "page-number-in-body-zone"
  | "duplicate-inline-id"
  | "invalid-columns-width"
  | "invalid-table-column-width"
  | "invalid-table-grid"

export interface VNextDocumentV4StructureIssue {
  code: VNextDocumentV4StructureIssueCode
  severity: "error"
  path: string
  message: string
  sectionId?: string
  nodeId?: string
  parentId?: string
  inlineId?: string
}

export interface VNextDocumentV4StructureValidation {
  source: typeof VNEXT_DOCUMENT_V4_TARGET_SOURCE
  version: typeof VNEXT_DOCUMENT_V4_TARGET_VERSION
  status: "valid" | "blocked"
  issues: VNextDocumentV4StructureIssue[]
  summary: {
    sectionCount: number
    nodeCount: number
    reachableNodeCount: number
    imageNodeCount: number
    inlineImageCount: number
    errorCount: number
  }
}

function childIds(node: AuthoredNodeV4Target): readonly string[] {
  if (node.type === "zone" || node.type === "column" || node.type === "table-cell") return node.childIds
  if (node.type === "columns") return node.columnIds
  if (node.type === "table") return node.rowIds
  if (node.type === "table-row") return node.cellIds
  return []
}

function issue(
  code: VNextDocumentV4StructureIssueCode,
  path: string,
  message: string,
  facts: Pick<VNextDocumentV4StructureIssue, "sectionId" | "nodeId" | "parentId" | "inlineId"> = {},
): VNextDocumentV4StructureIssue {
  return {
    code,
    severity: "error",
    path,
    message,
    ...(facts.sectionId == null ? {} : { sectionId: facts.sectionId }),
    ...(facts.nodeId == null ? {} : { nodeId: facts.nodeId }),
    ...(facts.parentId == null ? {} : { parentId: facts.parentId }),
    ...(facts.inlineId == null ? {} : { inlineId: facts.inlineId }),
  }
}

function validateTextBlock(
  node: Extract<AuthoredNodeV4Target, { type: "text-block" }>,
  zoneRole: ZoneRole,
  sectionId: string,
  path: string,
  issues: VNextDocumentV4StructureIssue[],
): void {
  const inlineIds = new Set<string>()
  node.children.forEach((inline, index) => {
    const inlinePath = `${path}.children[${index}]`
    if (inlineIds.has(inline.id)) {
      issues.push(issue(
        "duplicate-inline-id",
        `${inlinePath}.id`,
        `text-block "${node.id}" contains duplicate inline id "${inline.id}"`,
        { sectionId, nodeId: node.id, inlineId: inline.id },
      ))
    }
    inlineIds.add(inline.id)

    if (inline.type === "page-number" && zoneRole === "body") {
      issues.push(issue(
        "page-number-in-body-zone",
        inlinePath,
        `page-number "${inline.id}" is restricted to header/footer zones`,
        { sectionId, nodeId: node.id, inlineId: inline.id },
      ))
    }
  })
}

function validateColumns(
  node: Extract<AuthoredNodeV4Target, { type: "columns" }>,
  section: DocumentSectionV4Target,
  path: string,
  issues: VNextDocumentV4StructureIssue[],
): void {
  let total = 0
  node.columnIds.forEach((columnId, index) => {
    const column = section.nodes[columnId]
    if (column?.type !== "column") return
    if (column.props.widthShare == null) {
      issues.push(issue(
        "invalid-columns-width",
        `${path}.columnIds[${index}]`,
        `column "${columnId}" inside columns "${node.id}" requires widthShare`,
        { sectionId: section.id, nodeId: columnId, parentId: node.id },
      ))
      return
    }
    total += column.props.widthShare
  })
  if (Number(total.toFixed(2)) !== 100) {
    issues.push(issue(
      "invalid-columns-width",
      `${path}.columnIds`,
      `columns "${node.id}" widthShare total must be 100.00; got ${total.toFixed(2)}`,
      { sectionId: section.id, nodeId: node.id },
    ))
  }
}

function validateTable(
  node: Extract<AuthoredNodeV4Target, { type: "table" }>,
  section: DocumentSectionV4Target,
  path: string,
  issues: VNextDocumentV4StructureIssue[],
): void {
  node.columns.forEach((column, index) => {
    if (column.width.value <= 0) {
      issues.push(issue(
        "invalid-table-column-width",
        `${path}.columns[${index}].width`,
        `table "${node.id}" column width must be positive`,
        { sectionId: section.id, nodeId: node.id },
      ))
    }
  })

  if ((node.props.headerRowCount ?? 0) > node.rowIds.length) {
    issues.push(issue(
      "invalid-table-grid",
      `${path}.props.headerRowCount`,
      `table "${node.id}" headerRowCount cannot exceed row count`,
      { sectionId: section.id, nodeId: node.id },
    ))
  }

  node.rowIds.forEach((rowId, index) => {
    const row = section.nodes[rowId]
    if (row?.type !== "table-row") return
    if (row.cellIds.length !== node.columns.length) {
      issues.push(issue(
        "invalid-table-grid",
        `${path}.rowIds[${index}]`,
        `table row "${row.id}" has ${row.cellIds.length} cells for ${node.columns.length} columns`,
        { sectionId: section.id, nodeId: row.id, parentId: node.id },
      ))
    }
  })
}

export function validateVNextDocumentV4Structure(
  document: DocumentNodeV4Target,
): VNextDocumentV4StructureValidation {
  const issues: VNextDocumentV4StructureIssue[] = []
  const sectionIds = new Set<string>()
  const globalNodeIds = new Set<string>()
  const globalParentByNodeId = new Map<string, string>()
  let nodeCount = 0
  let reachableNodeCount = 0
  let imageNodeCount = 0
  let inlineImageCount = 0

  document.document.sections.forEach((section, sectionIndex) => {
    const sectionPath = `document.sections[${sectionIndex}]`
    if (sectionIds.has(section.id)) {
      issues.push(issue(
        "duplicate-section-id",
        `${sectionPath}.id`,
        `duplicate section id "${section.id}"`,
        { sectionId: section.id },
      ))
    }
    sectionIds.add(section.id)

    Object.entries(section.nodes).forEach(([key, node]) => {
      nodeCount += 1
      if (node.type === "image") imageNodeCount += 1
      if (node.type === "text-block") {
        inlineImageCount += node.children.filter((inline) => inline.type === "inline-image").length
      }
      if (key !== node.id) {
        issues.push(issue(
          "node-key-id-mismatch",
          `${sectionPath}.nodes.${key}.id`,
          `node id "${node.id}" must match map key "${key}"`,
          { sectionId: section.id, nodeId: node.id },
        ))
      }
      if (globalNodeIds.has(node.id)) {
        issues.push(issue(
          "duplicate-node-id",
          `${sectionPath}.nodes.${key}`,
          `duplicate document node id "${node.id}"`,
          { sectionId: section.id, nodeId: node.id },
        ))
      }
      globalNodeIds.add(node.id)
    })

    const reachable = new Set<string>()
    const active = new Set<string>()

    const visit = (nodeId: string, path: string, zoneRole: ZoneRole): void => {
      const node = section.nodes[nodeId]
      if (node == null) {
        issues.push(issue(
          "missing-child",
          path,
          `missing node "${nodeId}"`,
          { sectionId: section.id, nodeId },
        ))
        return
      }
      if (active.has(nodeId)) {
        issues.push(issue(
          "cycle",
          path,
          `cycle detected at node "${nodeId}"`,
          { sectionId: section.id, nodeId },
        ))
        return
      }
      if (reachable.has(nodeId)) return

      reachable.add(nodeId)
      reachableNodeCount += 1
      active.add(nodeId)

      if (node.type === "text-block") validateTextBlock(node, zoneRole, section.id, path, issues)
      if (node.type === "columns") validateColumns(node, section, path, issues)
      if (node.type === "table") validateTable(node, section, path, issues)

      childIds(node).forEach((childId, childIndex) => {
        const child = section.nodes[childId]
        const childPath = `${path}.${
          node.type === "columns" ? "columnIds" :
          node.type === "table" ? "rowIds" :
          node.type === "table-row" ? "cellIds" : "childIds"
        }[${childIndex}]`

        if (child == null) {
          issues.push(issue(
            "missing-child",
            childPath,
            `node "${node.id}" references missing child "${childId}"`,
            { sectionId: section.id, nodeId: childId, parentId: node.id },
          ))
          return
        }

        const allowed = VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES[node.type]
        if (!(allowed as readonly AuthoredNodeV4TargetType[]).includes(child.type)) {
          issues.push(issue(
            "invalid-child-type",
            childPath,
            `${node.type} "${node.id}" cannot contain ${child.type} "${child.id}"`,
            { sectionId: section.id, nodeId: child.id, parentId: node.id },
          ))
        }

        if (child.type === "page-break" && (node.type !== "zone" || zoneRole !== "body")) {
          issues.push(issue(
            "page-break-outside-body-zone",
            childPath,
            `page-break "${child.id}" must be a direct child of a body zone`,
            { sectionId: section.id, nodeId: child.id, parentId: node.id },
          ))
        }

        const previousParent = globalParentByNodeId.get(childId)
        if (previousParent != null) {
          issues.push(issue(
            "multiple-parents",
            childPath,
            `node "${childId}" has multiple parents "${previousParent}" and "${node.id}"`,
            { sectionId: section.id, nodeId: childId, parentId: node.id },
          ))
        } else {
          globalParentByNodeId.set(childId, node.id)
        }

        visit(childId, `${sectionPath}.nodes.${childId}`, zoneRole)
      })

      active.delete(nodeId)
    }

    section.zoneIds.forEach((zoneId, zoneIndex) => {
      const zonePath = `${sectionPath}.zoneIds[${zoneIndex}]`
      const zone = section.nodes[zoneId]
      if (zone?.type !== "zone") {
        issues.push(issue(
          "invalid-zone-reference",
          zonePath,
          `section zone id "${zoneId}" must reference a zone node`,
          { sectionId: section.id, nodeId: zoneId },
        ))
        return
      }

      const previousParent = globalParentByNodeId.get(zoneId)
      if (previousParent != null) {
        issues.push(issue(
          "multiple-parents",
          zonePath,
          `zone "${zoneId}" has multiple section parents`,
          { sectionId: section.id, nodeId: zoneId },
        ))
      } else {
        globalParentByNodeId.set(zoneId, `section:${section.id}`)
      }
      visit(zoneId, `${sectionPath}.nodes.${zoneId}`, zone.role)
    })

    Object.keys(section.nodes).forEach((nodeId) => {
      if (!reachable.has(nodeId)) {
        issues.push(issue(
          "orphan-node",
          `${sectionPath}.nodes.${nodeId}`,
          `orphan node "${nodeId}" is not reachable from any zone`,
          { sectionId: section.id, nodeId },
        ))
      }
    })
  })

  return {
    source: VNEXT_DOCUMENT_V4_TARGET_SOURCE,
    version: VNEXT_DOCUMENT_V4_TARGET_VERSION,
    status: issues.length === 0 ? "valid" : "blocked",
    issues,
    summary: {
      sectionCount: document.document.sections.length,
      nodeCount,
      reachableNodeCount,
      imageNodeCount,
      inlineImageCount,
      errorCount: issues.length,
    },
  }
}
