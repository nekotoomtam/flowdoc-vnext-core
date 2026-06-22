import {
  assessVNextGenerationReadiness,
  createVNextEditableSession,
  getTables,
  getTextBlocks,
  getZones,
  projectVNextTextBlockInlines,
  type AuthoredNode,
  type DocumentSection,
  type FlowDocPackageV2DocumentVNext,
  type InlineNode,
  type ParentRef,
  type RelationshipGraph,
  type VNextAuthoringIntentHistoryGroup,
  type VNextLiveLayoutAffectedScope,
  type VNextLiveLayoutBoundaryResult,
} from "@flowdoc/vnext-core"

export interface TemplateBuilderAuthoringHistorySnapshot {
  mode: "static-snapshot" | "in-memory"
  recordCount: number
  undoableRecordCount: number
  rejectedRecordCount: number
  groupCount: number
  canUndo: boolean
  canRedo: boolean
  undoDepth: number
  redoDepth: number
  nextUndoGroupId: string | null
  nextRedoGroupId: string | null
  latestGroup: VNextAuthoringIntentHistoryGroup | null
}

export interface TemplateBuilderLiveLayoutSnapshotAffected {
  sectionIds: string[]
  zoneIds: string[]
  nodeIds: string[]
  parentNodeIds: string[]
  textBlockIds: string[]
  tableIds: string[]
}

export interface TemplateBuilderLiveLayoutSnapshotResult {
  kind: VNextLiveLayoutBoundaryResult["kind"]
  reason: string
  requestId: string | null
  visibleRangeKind: string
  dirtyScopeCount: number
  affected: TemplateBuilderLiveLayoutSnapshotAffected
  freshness: {
    liveLayout: string
    exactGeneration: {
      status: string
      finalTruth: string
    }
  }
}

export interface TemplateBuilderLiveLayoutSnapshot {
  mode: "static-snapshot" | "in-memory-bridge"
  requestCount: number
  exactGenerationStale: boolean
  lastResult: TemplateBuilderLiveLayoutSnapshotResult | null
}

export interface TemplateBuilderSnapshotOptions {
  fixturePath: string
  runtime?: {
    mode?: "static-snapshot" | "in-memory-bridge"
    documentRevision?: number
    dirtyScopeCount?: number
    authoringHistory?: TemplateBuilderAuthoringHistorySnapshot
    liveLayout?: TemplateBuilderLiveLayoutSnapshot
    mutationCount?: number
    lastMutation?: TemplateBuilderSnapshotLastMutation | null
  }
}

export interface TemplateBuilderSnapshotLastMutation {
  action: string
  status: "applied" | "rejected"
  targetTextBlockId: string | null
  summary: string
  issueCount: number
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
  canReplacePlainText: boolean
  canUseWysiwygDraft: boolean
  hasAtomicInline: boolean
  hasStyledText: boolean
  wysiwygDraftGuardReason: string | null
  textLength: number
  childCount: number
  plainText: string | null
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
  mutationBridge: {
    mode: "static-snapshot" | "in-memory-bridge"
    documentRevision: number
    mutationCount: number
    lastMutation: TemplateBuilderSnapshotLastMutation | null
  }
  authoringHistory: TemplateBuilderAuthoringHistorySnapshot
  liveLayout: TemplateBuilderLiveLayoutSnapshot
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

function textProjectionFacts(node: AuthoredNode): {
  canReplacePlainText: boolean
  canUseWysiwygDraft: boolean
  hasAtomicInline: boolean
  hasStyledText: boolean
  plainText: string | null
  textLength: number
  wysiwygDraftGuardReason: string | null
} {
  if (node.type !== "text-block") {
    return {
      canReplacePlainText: false,
      canUseWysiwygDraft: false,
      hasAtomicInline: false,
      hasStyledText: false,
      plainText: null,
      textLength: 0,
      wysiwygDraftGuardReason: "target is not a text-block",
    }
  }

  const projection = projectVNextTextBlockInlines(node)
  const hasAtomicInline = node.children.some((inline) => inline.type !== "text")
  const hasStyledText = node.children.some((inline) => inline.type === "text" && inline.style != null)
  const canReplacePlainText = projection.textLength > 0 && projection.segments.every((segment) => segment.editable)
  const canUseWysiwygDraft = canReplacePlainText && !hasStyledText
  const wysiwygDraftGuardReason = canUseWysiwygDraft
    ? null
    : projection.textLength === 0
      ? "empty text-blocks cannot start a browser draft yet"
      : hasAtomicInline
        ? "text-block contains atomic inline content"
        : hasStyledText
          ? "text-block contains styled text runs"
          : "text-block cannot be represented as a safe plain-text draft"

  return {
    canReplacePlainText,
    canUseWysiwygDraft,
    hasAtomicInline,
    hasStyledText,
    plainText: canReplacePlainText ? projection.text : null,
    textLength: projection.textLength,
    wysiwygDraftGuardReason,
  }
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
  const textFacts = textProjectionFacts(node)
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
    canReplacePlainText: textFacts.canReplacePlainText,
    canUseWysiwygDraft: textFacts.canUseWysiwygDraft,
    hasAtomicInline: textFacts.hasAtomicInline,
    hasStyledText: textFacts.hasStyledText,
    wysiwygDraftGuardReason: textFacts.wysiwygDraftGuardReason,
    textLength: textFacts.textLength,
    childCount: childIds.length,
    plainText: textFacts.plainText,
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

function summarizeLiveLayoutAffected(
  affected: VNextLiveLayoutAffectedScope,
): TemplateBuilderLiveLayoutSnapshotAffected {
  return {
    sectionIds: [...affected.sectionIds],
    zoneIds: [...affected.zoneIds],
    nodeIds: [...affected.nodeIds],
    parentNodeIds: [...affected.parentNodeIds],
    textBlockIds: [...affected.textBlockIds],
    tableIds: [...affected.tableIds],
  }
}

export function createTemplateBuilderLiveLayoutSnapshot(input: {
  mode?: TemplateBuilderLiveLayoutSnapshot["mode"]
  requestCount?: number
  result?: VNextLiveLayoutBoundaryResult | null
} = {}): TemplateBuilderLiveLayoutSnapshot {
  const result = input.result ?? null
  const exactGeneration = result?.freshness.exactGeneration

  return {
    mode: input.mode ?? "static-snapshot",
    requestCount: input.requestCount ?? 0,
    exactGenerationStale: exactGeneration?.status === "stale",
    lastResult: result == null
      ? null
      : {
          kind: result.kind,
          reason: result.reason,
          requestId: result.request?.requestId ?? null,
          visibleRangeKind: result.visibleRange.kind,
          dirtyScopeCount: result.dirtyScopes.length,
          affected: summarizeLiveLayoutAffected(result.affected),
          freshness: {
            liveLayout: result.freshness.liveLayout,
            exactGeneration: {
              status: result.freshness.exactGeneration.status,
              finalTruth: result.freshness.exactGeneration.finalTruth,
            },
          },
        },
  }
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
  const runtime = options.runtime ?? {}
  const documentRevision = runtime.documentRevision ?? session.revisions.document
  const dirtyScopeCount = runtime.dirtyScopeCount ?? session.dirtyScopes.size
  const liveLayout = runtime.liveLayout ?? createTemplateBuilderLiveLayoutSnapshot()

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
    mutationBridge: {
      mode: runtime.mode ?? "static-snapshot",
      documentRevision,
      mutationCount: runtime.mutationCount ?? 0,
      lastMutation: runtime.lastMutation ?? null,
    },
    authoringHistory: runtime.authoringHistory ?? {
      mode: "static-snapshot",
      recordCount: 0,
      undoableRecordCount: 0,
      rejectedRecordCount: 0,
      groupCount: 0,
      canUndo: false,
      canRedo: false,
      undoDepth: 0,
      redoDepth: 0,
      nextUndoGroupId: null,
      nextRedoGroupId: null,
      latestGroup: null,
    },
    liveLayout,
    session: {
      selectionKind: session.selection.kind,
      documentRevision,
      dirtyScopeCount,
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
        action: "sandbox.replacePlainTextBlock",
        label: "Bridge replace",
        lane: "immediate",
        status: "wired",
        reason: "selected plain text blocks can be replaced through the sandbox mutation bridge",
      },
      {
        action: "sandbox.insertPlainTextAtEnd",
        label: "Append text",
        lane: "immediate",
        status: "wired",
        reason: "selected plain text blocks can receive explicit text.insert actions before caret typing is wired",
      },
      {
        action: "browser.applyChangePacket",
        label: "Apply packet",
        lane: "immediate",
        status: "wired",
        reason: "browser runtime cache consumes packet-only mutation responses after boot",
      },
      {
        action: "browser.createNormalizedEditorView",
        label: "View index",
        lane: "immediate",
        status: "wired",
        reason: "browser runtime derives lookup-first editor indexes from boot snapshots and packets",
      },
      {
        action: "browser.createStructuralRuntimeStore",
        label: "Runtime store",
        lane: "immediate",
        status: "wired",
        reason: "browser runtime owns structural lookup indexes before structural packet application",
      },
      {
        action: "browser.applyTextPacketToRuntimeStore",
        label: "Text packet store",
        lane: "immediate",
        status: "wired",
        reason: "browser runtime applies bounded text packets directly to the structural store before full structural packets",
      },
      {
        action: "browser.createStoreBackedRenderModel",
        label: "Render model",
        lane: "immediate",
        status: "wired",
        reason: "browser rendering reads section roots and node content from the runtime store before viewport virtualization",
      },
      {
        action: "browser.resolveRenderWindow",
        label: "Render window",
        lane: "immediate",
        status: "wired",
        reason: "browser rendering derives the active render section/node window from the visible range before DOM viewport controllers",
      },
      {
        action: "browser.createRenderShell",
        label: "Render shell",
        lane: "immediate",
        status: "wired",
        reason: "browser canvas keeps section placeholders for the full document while rendering only the active window in detail",
      },
      {
        action: "browser.measureViewportShell",
        label: "Viewport measure",
        lane: "immediate",
        status: "wired",
        reason: "browser canvas can measure section shell boxes into normalized viewport facts without binding scroll control",
      },
      {
        action: "browser.resolveViewportRangeRequest",
        label: "Viewport request",
        lane: "immediate",
        status: "wired",
        reason: "browser viewport facts can produce visible range requests before DOM scroll measurement is wired",
      },
      {
        action: "browser.resolveVisibleRange",
        label: "Visible range",
        lane: "immediate",
        status: "wired",
        reason: "browser runtime derives bounded visible node ranges before viewport virtualization",
      },
      {
        action: "browser.updateVisibleRangeRequest",
        label: "Range request",
        lane: "immediate",
        status: "wired",
        reason: "browser runtime records why a visible range is requested before scroll or viewport controllers",
      },
      {
        action: "browser.editTextDraft",
        label: "Draft",
        lane: "immediate + commit",
        status: "wired",
        reason: "safe text blocks can hold browser-local WYSIWYG drafts before commit through the sandbox bridge",
      },
      {
        action: "browser.trackDraftSelection",
        label: "Draft range",
        lane: "immediate",
        status: "wired",
        reason: "active browser drafts track local textarea selection ranges without mutating canonical package state",
      },
      {
        action: "browser.deriveDraftCommandContext",
        label: "Command ctx",
        lane: "immediate",
        status: "wired",
        reason: "browser-local draft selection derives command target, range preview, and readiness before command execution",
      },
      {
        action: "browser.applyDraftTextCommand",
        label: "Text command",
        lane: "immediate",
        status: "wired",
        reason: "browser-local insert and replace-selection commands update only the active draft before bridge commit",
      },
      {
        action: "browser.setDraftSelectionRange",
        label: "Set range",
        lane: "immediate",
        status: "wired",
        reason: "browser-local range controls can set draft cursor and selection without mutating canonical package state",
      },
      {
        action: "browser.trackDraftComposition",
        label: "IME",
        lane: "immediate",
        status: "wired",
        reason: "browser-local composition events guard draft commands and commit while IME input is active",
      },
      {
        action: "sandbox.recordAuthoringHistory",
        label: "History",
        lane: "immediate",
        status: "wired",
        reason: "bridge actions append core authoring intent history records for future undo and audit",
      },
      {
        action: "sandbox.requestLiveLayout",
        label: "Live layout",
        lane: "background-live",
        status: "wired",
        reason: "accepted sandbox mutations produce core live-layout request summaries without running exact layout",
      },
      {
        action: "user.undo",
        label: "Undo",
        lane: "immediate",
        status: "wired",
        reason: "sandbox text edits can be undone through bounded in-memory inverse text patches",
      },
      {
        action: "user.redo",
        label: "Redo",
        lane: "immediate",
        status: "wired",
        reason: "sandbox text edits can be redone through bounded in-memory text patches",
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
