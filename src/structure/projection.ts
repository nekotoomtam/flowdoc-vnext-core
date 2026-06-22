import type { AuthoredNode, DocumentNode } from "../schema/document.js"
import type {
  NearestContext,
  NodeCapabilities,
  NodeId,
  NodeType,
  ParentRef,
  RelationshipGraph,
  SectionId,
} from "../graph/relationshipGraph.js"
import { buildRelationshipGraph } from "../graph/relationshipGraph.js"

export const STRUCTURAL_PROJECTION_SOURCE = "flowdoc-structural-projection"
export const STRUCTURAL_PROJECTION_MODE = "read-only-graph-projection"
export const STRUCTURAL_PROJECTION_VERSION = 1

export interface StructuralProjectionNodeCapabilities {
  readonly childrenField?: NodeCapabilities["childrenField"]
  readonly operationSurface: NodeCapabilities["operationSurface"]
  readonly canContainText: boolean
  readonly canSplitAcrossPages: boolean
  readonly canBeDeleted: boolean
  readonly canBeDuplicated: boolean
  readonly canBeReordered: boolean
}

export interface StructuralProjectionParent {
  readonly id: NodeId | SectionId | null
  readonly kind: ParentRef["kind"] | "section" | null
  readonly childField: ParentRef["childField"] | null
  readonly index: number | null
  readonly ref: ParentRef | null
}

export interface StructuralProjectionNode {
  readonly nodeId: NodeId
  readonly nodeType: NodeType
  readonly sectionId: SectionId
  readonly zoneId: NodeId
  readonly parent: StructuralProjectionParent
  readonly depth: number
  readonly path: readonly NodeId[]
  readonly childNodeIds: readonly NodeId[]
  readonly childCount: number
  readonly nearest: NearestContext
  readonly capabilities: StructuralProjectionNodeCapabilities
  readonly children: readonly StructuralProjectionNode[]
}

export interface StructuralProjectionSection {
  readonly sectionId: SectionId
  readonly rootNodeIds: readonly NodeId[]
  readonly rootNodeCount: number
  readonly nodeCount: number
  readonly roots: readonly StructuralProjectionNode[]
}

export interface StructuralProjection {
  readonly source: typeof STRUCTURAL_PROJECTION_SOURCE
  readonly mode: typeof STRUCTURAL_PROJECTION_MODE
  readonly version: typeof STRUCTURAL_PROJECTION_VERSION
  readonly documentId: string
  readonly documentVersion: 3
  readonly sectionCount: number
  readonly nodeCount: number
  readonly sections: readonly StructuralProjectionSection[]
  readonly nodeById: ReadonlyMap<NodeId, StructuralProjectionNode>
  readonly sectionById: ReadonlyMap<SectionId, StructuralProjectionSection>
  readonly graphIssueCount: number
}

export interface StructuralProjectionOptions {
  readonly graph?: RelationshipGraph
}

function cloneParentRef(parentRef: ParentRef | undefined): ParentRef | null {
  return parentRef == null ? null : { ...parentRef }
}

function parentId(parentRef: ParentRef | null): NodeId | SectionId | null {
  if (parentRef == null) return null
  if (parentRef.kind === "section") return parentRef.sectionId
  if (parentRef.kind === "zone") return parentRef.zoneId
  if (parentRef.kind === "columns") return parentRef.columnsId
  if (parentRef.kind === "column") return parentRef.columnId
  if (parentRef.kind === "table") return parentRef.tableId
  if (parentRef.kind === "table-row") return parentRef.rowId
  return parentRef.cellId
}

function projectionParent(parentRef: ParentRef | undefined): StructuralProjectionParent {
  const ref = cloneParentRef(parentRef)

  return {
    childField: ref?.childField ?? null,
    id: parentId(ref),
    index: ref?.index ?? null,
    kind: ref?.kind ?? null,
    ref,
  }
}

function projectionCapabilities(capabilities: NodeCapabilities): StructuralProjectionNodeCapabilities {
  return {
    childrenField: capabilities.childrenField,
    operationSurface: capabilities.operationSurface,
    canContainText: capabilities.canContainText,
    canSplitAcrossPages: capabilities.canSplitAcrossPages,
    canBeDeleted: capabilities.canBeDeleted,
    canBeDuplicated: capabilities.canBeDuplicated,
    canBeReordered: capabilities.canBeReordered,
  }
}

function fallbackNearest(sectionId: SectionId, nodeId: NodeId): NearestContext {
  return {
    blockId: null,
    columnId: null,
    columnsId: null,
    sectionId,
    tableCellId: null,
    tableId: null,
    tableRowId: null,
    textBlockId: null,
    zoneId: nodeId,
  }
}

function projectNode(
  graph: RelationshipGraph,
  sectionId: SectionId,
  node: AuthoredNode,
  depth: number,
  parentPath: readonly NodeId[],
  nodeById: Map<NodeId, StructuralProjectionNode>,
): StructuralProjectionNode {
  const childNodeIds = [...(graph.childrenByNodeId.get(node.id) ?? [])]
  const nearest = graph.nearestByNodeId.get(node.id) ?? fallbackNearest(sectionId, node.id)
  const path = [...parentPath, node.id]
  const children = childNodeIds.map((childId) => {
    const child = graph.nodesById.get(childId)
    if (child == null) {
      throw new Error(`Structural projection child "${childId}" was not found in graph`)
    }

    return projectNode(graph, sectionId, child, depth + 1, path, nodeById)
  })
  const capabilities = graph.capabilitiesByType[node.type]
  const view: StructuralProjectionNode = {
    capabilities: projectionCapabilities(capabilities),
    childCount: childNodeIds.length,
    childNodeIds,
    children,
    depth,
    nearest: { ...nearest },
    nodeId: node.id,
    nodeType: node.type,
    parent: projectionParent(graph.parentByNodeId.get(node.id)),
    path,
    sectionId: nearest.sectionId,
    zoneId: nearest.zoneId,
  }

  nodeById.set(node.id, view)
  return view
}

export function createStructuralProjection(
  document: DocumentNode,
  options: StructuralProjectionOptions = {},
): StructuralProjection {
  const graph = options.graph ?? buildRelationshipGraph(document)
  const nodeById = new Map<NodeId, StructuralProjectionNode>()
  const sectionById = new Map<SectionId, StructuralProjectionSection>()
  const sections = document.document.sections.map((section) => {
    const roots = section.zoneIds.map((zoneId) => {
      const node = graph.nodesById.get(zoneId)
      if (node == null) {
        throw new Error(`Structural projection root "${zoneId}" was not found in graph`)
      }

      return projectNode(graph, section.id, node, 0, [], nodeById)
    })
    const projectedSection: StructuralProjectionSection = {
      nodeCount: Object.keys(section.nodes).length,
      rootNodeCount: section.zoneIds.length,
      rootNodeIds: [...section.zoneIds],
      roots,
      sectionId: section.id,
    }

    sectionById.set(section.id, projectedSection)
    return projectedSection
  })

  return {
    documentId: document.document.id,
    documentVersion: document.version,
    graphIssueCount: graph.diagnostics.issues.length,
    mode: STRUCTURAL_PROJECTION_MODE,
    nodeById,
    nodeCount: nodeById.size,
    sectionById,
    sectionCount: sections.length,
    sections,
    source: STRUCTURAL_PROJECTION_SOURCE,
    version: STRUCTURAL_PROJECTION_VERSION,
  }
}
