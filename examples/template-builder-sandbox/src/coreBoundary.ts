import {
  assessVNextGenerationReadiness,
  createVNextEditableSession,
  getTables,
  getTextBlocks,
  getZones,
  type AuthoredNode,
  type DocumentSection,
  type FlowDocPackageV2DocumentVNext,
  type InlineNode,
  type ParentRef,
  type RelationshipGraph,
} from "@flowdoc/vnext-core"

export interface TemplateBuilderSnapshotOptions {
  fixturePath: string
}

export interface TemplateBuilderSnapshotNode {
  id: string
  type: AuthoredNode["type"]
  role: string | null
  sectionId: string
  zoneId: string
  parentId: string | null
  parentKind: string | null
  depth: number
  path: string[]
  surface: string
  canContainText: boolean
  canSplitAcrossPages: boolean
  canBeDeleted: boolean
  canBeDuplicated: boolean
  canBeReordered: boolean
  childCount: number
  textPreview: string | null
  fieldRefs: string[]
  children: TemplateBuilderSnapshotNode[]
}

export interface TemplateBuilderSnapshot {
  source: "flowdoc-template-builder-sandbox"
  generatedAt: string
  boundary: {
    corePackage: "@flowdoc/vnext-core"
    coreImport: "public-entrypoint"
    fixturePath: string
    browserRuntime: "static-snapshot"
  }
  template: {
    id: string
    title: string
    packageVersion: 2
    documentVersion: 3
  }
  counts: {
    sections: number
    zones: number
    textBlocks: number
    tables: number
    nodes: number
    fields: number
    dataValues: number
  }
  diagnostics: {
    graphIssueCount: number
    keyDataStatus: string
    keyDataErrors: number
    keyDataWarnings: number
    generationStatus: string
    exactLayoutStatus: string
    artifactStatus: string
  }
  session: {
    selectionKind: string
    documentRevision: number
    dirtyScopeCount: number
  }
  fields: Array<{
    key: string
    label: string
    type: string
    hasData: boolean
    usageCount: number
  }>
  sections: Array<{
    id: string
    page: string
    zones: TemplateBuilderSnapshotNode[]
  }>
  actionLanes: Array<{
    action: string
    label: string
    lane: string
    status: "wired" | "planned" | "blocked"
    reason: string
  }>
}

function inlineText(inline: InlineNode): string {
  if (inline.type === "text") return inline.text
  if (inline.type === "field-ref") return `{${inline.key}}`
  if (inline.type === "page-number") return "{page}"
  return "{line-break}"
}

function nodeRole(node: AuthoredNode): string | null {
  if (node.type === "zone") return node.role
  if (node.type !== "text-block") return null

  if (node.role.role === "heading") return `heading-${node.role.level}`
  if (node.role.role === "list-item") return `list-item-${node.role.list.level}`
  return node.role.role
}

function fieldRefs(node: AuthoredNode): string[] {
  if (node.type !== "text-block") return []
  return node.children.flatMap((inline) => inline.type === "field-ref" ? [inline.key] : [])
}

function textPreview(node: AuthoredNode): string | null {
  if (node.type !== "text-block") return null
  const preview = node.children.map(inlineText).join("")
  return preview.length > 120 ? `${preview.slice(0, 117)}...` : preview
}

function parentTarget(parentRef: ParentRef | undefined): { parentId: string | null; parentKind: string | null } {
  if (parentRef == null) return { parentId: null, parentKind: null }

  if (parentRef.kind === "section") return { parentId: parentRef.sectionId, parentKind: "section" }
  if (parentRef.kind === "zone") return { parentId: parentRef.zoneId, parentKind: "zone" }
  if (parentRef.kind === "columns") return { parentId: parentRef.columnsId, parentKind: "columns" }
  if (parentRef.kind === "column") return { parentId: parentRef.columnId, parentKind: "column" }
  if (parentRef.kind === "table") return { parentId: parentRef.tableId, parentKind: "table" }
  if (parentRef.kind === "table-row") return { parentId: parentRef.rowId, parentKind: "table-row" }

  return { parentId: parentRef.cellId, parentKind: "table-cell" }
}

function summarizeNode(
  graph: RelationshipGraph,
  section: DocumentSection,
  nodeId: string,
  depth = 0,
  path: string[] = [],
): TemplateBuilderSnapshotNode {
  const node = section.nodes[nodeId]
  const childIds = graph.childrenByNodeId.get(nodeId) ?? []
  const capabilities = graph.capabilitiesByType[node.type]
  const nearest = graph.nearestByNodeId.get(nodeId)
  const parent = parentTarget(graph.parentByNodeId.get(nodeId))
  const nodePath = [...path, node.id]
  const visibleChildIds = depth >= 6 ? [] : childIds

  return {
    id: node.id,
    type: node.type,
    role: nodeRole(node),
    sectionId: nearest?.sectionId ?? section.id,
    zoneId: nearest?.zoneId ?? node.id,
    parentId: parent.parentId,
    parentKind: parent.parentKind,
    depth,
    path: nodePath,
    surface: capabilities.operationSurface,
    canContainText: capabilities.canContainText,
    canSplitAcrossPages: capabilities.canSplitAcrossPages,
    canBeDeleted: capabilities.canBeDeleted,
    canBeDuplicated: capabilities.canBeDuplicated,
    canBeReordered: capabilities.canBeReordered,
    childCount: childIds.length,
    textPreview: textPreview(node),
    fieldRefs: fieldRefs(node),
    children: visibleChildIds.map((childId) => summarizeNode(graph, section, childId, depth + 1, nodePath)),
  }
}

function fieldUsageCounts(pack: FlowDocPackageV2DocumentVNext) {
  const usageCounts = new Map<string, number>()
  const session = createVNextEditableSession(pack, { source: "fixture" })

  for (const usage of session.diagnostics.keyData.usages) {
    usageCounts.set(usage.key, (usageCounts.get(usage.key) ?? 0) + 1)
  }

  return usageCounts
}

export function createTemplateBuilderSnapshot(
  value: unknown,
  options: TemplateBuilderSnapshotOptions,
): TemplateBuilderSnapshot {
  const session = createVNextEditableSession(value, { source: "fixture" })
  const pack = session.package
  const graph = session.graph
  const readiness = assessVNextGenerationReadiness({
    template: { package: pack },
    output: { kind: "diagnostics", measurementProfileId: "sandbox-readiness" },
  })
  const usageCounts = fieldUsageCounts(pack)
  const fieldValues = pack.data?.values ?? {}

  return {
    source: "flowdoc-template-builder-sandbox",
    generatedAt: "fixture-snapshot",
    boundary: {
      corePackage: "@flowdoc/vnext-core",
      coreImport: "public-entrypoint",
      fixturePath: options.fixturePath,
      browserRuntime: "static-snapshot",
    },
    template: {
      id: pack.id,
      title: pack.meta.title,
      packageVersion: pack.packageVersion,
      documentVersion: pack.document.version,
    },
    counts: {
      sections: pack.document.document.sections.length,
      zones: getZones(graph).length,
      textBlocks: getTextBlocks(graph).length,
      tables: getTables(graph).length,
      nodes: graph.nodesById.size,
      fields: Object.keys(pack.fields.fields).length,
      dataValues: Object.keys(fieldValues).length,
    },
    diagnostics: {
      graphIssueCount: session.diagnostics.graphIssueCount,
      keyDataStatus: session.diagnostics.keyData.status,
      keyDataErrors: session.diagnostics.keyData.summary.errorCount,
      keyDataWarnings: session.diagnostics.keyData.summary.warningCount,
      generationStatus: readiness.status,
      exactLayoutStatus: readiness.diagnostics.exactLayout.status,
      artifactStatus: readiness.diagnostics.artifact.status,
    },
    session: {
      selectionKind: session.selection.kind,
      documentRevision: session.revisions.document,
      dirtyScopeCount: session.dirtyScopes.size,
    },
    fields: Object.values(pack.fields.fields).map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      hasData: Object.prototype.hasOwnProperty.call(fieldValues, field.key),
      usageCount: usageCounts.get(field.key) ?? 0,
    })),
    sections: pack.document.document.sections.map((section) => ({
      id: section.id,
      page: `${section.page.size} ${section.page.orientation}`,
      zones: section.zoneIds.map((zoneId) => summarizeNode(graph, section, zoneId)),
    })),
    actionLanes: [
      {
        action: "user.openTemplate",
        label: "Open",
        lane: "immediate",
        status: "wired",
        reason: "snapshot bridge creates an editable session from canonical package input",
      },
      {
        action: "user.selectNode",
        label: "Select",
        lane: "immediate",
        status: "wired",
        reason: "browser-only selection synchronizes tree, canvas, inspector, and status",
      },
      {
        action: "user.typeText",
        label: "Type",
        lane: "immediate + background-live",
        status: "planned",
        reason: "text transaction UI waits for a stable selection/context boundary",
      },
      {
        action: "user.insertFieldRef",
        label: "Insert key",
        lane: "immediate + background-live",
        status: "planned",
        reason: "field insertion will use inline.field-ref.insert after typing selection is wired",
      },
      {
        action: "generation.assess",
        label: "Diagnostics",
        lane: "immediate",
        status: "wired",
        reason: "snapshot bridge calls generation readiness without rendering artifacts",
      },
      {
        action: "generation.renderArtifact",
        label: "Render",
        lane: "deferred-exact + external-artifact",
        status: "blocked",
        reason: "exact layout, renderer, storage, and API route are intentionally absent",
      },
    ],
  }
}
