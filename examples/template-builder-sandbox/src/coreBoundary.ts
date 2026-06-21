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
  type RelationshipGraph,
} from "@flowdoc/vnext-core"

export interface TemplateBuilderSnapshotOptions {
  fixturePath: string
}

export interface TemplateBuilderSnapshotNode {
  id: string
  type: AuthoredNode["type"]
  role: string | null
  surface: string
  canContainText: boolean
  canSplitAcrossPages: boolean
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
    lane: string
    status: "wired" | "planned"
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

function summarizeNode(
  graph: RelationshipGraph,
  section: DocumentSection,
  nodeId: string,
  depth = 0,
): TemplateBuilderSnapshotNode {
  const node = section.nodes[nodeId]
  const childIds = graph.childrenByNodeId.get(nodeId) ?? []
  const capabilities = graph.capabilitiesByType[node.type]
  const visibleChildIds = depth >= 6 ? [] : childIds

  return {
    id: node.id,
    type: node.type,
    role: nodeRole(node),
    surface: capabilities.operationSurface,
    canContainText: capabilities.canContainText,
    canSplitAcrossPages: capabilities.canSplitAcrossPages,
    childCount: childIds.length,
    textPreview: textPreview(node),
    fieldRefs: fieldRefs(node),
    children: visibleChildIds.map((childId) => summarizeNode(graph, section, childId, depth + 1)),
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
      { action: "user.openTemplate", lane: "immediate", status: "wired" },
      { action: "user.typeText", lane: "immediate + background-live", status: "planned" },
      { action: "user.insertFieldRef", lane: "immediate + background-live", status: "planned" },
      { action: "generation.assess", lane: "immediate", status: "wired" },
      { action: "generation.renderArtifact", lane: "deferred-exact + external-artifact", status: "planned" },
    ],
  }
}
