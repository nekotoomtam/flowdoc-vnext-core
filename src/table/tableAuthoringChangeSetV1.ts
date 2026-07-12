import type { AuthoredNodeV4Target, DocumentNodeV4Target } from "../schema/documentV4Target.js"
import { assessVNextTableAuthoringBundleV1 } from "./tableAuthoringBundleV1.js"
import type {
  VNextTableAuthoringBundleV1,
  VNextTableAuthoringIssueV1,
  VNextTableAuthoringRequestV1,
  VNextTableAuthoringResultV1,
} from "./tableAuthoringContractV1.js"
import type {
  VNextTableColumnDefinitionV1,
  VNextTableDefinitionV1,
  VNextTableRowSourceV1,
  VNextTableRowTemplateV1,
} from "./tableDefinitionV1.js"

export const VNEXT_TABLE_AUTHORING_CHANGE_SET_VERSION = 1 as const
export const VNEXT_TABLE_AUTHORING_CHANGE_SET_SOURCE = "vnext-table-authoring-change-set"

export interface VNextTableAuthoringNodeChangeV1 {
  nodeId: string
  beforeIndex: number | null
  afterIndex: number | null
  before: AuthoredNodeV4Target | null
  after: AuthoredNodeV4Target | null
}

export interface VNextTableAuthoringRowTemplateChangeV1 {
  rowTemplateId: string
  beforeIndex: number | null
  afterIndex: number | null
  before: VNextTableRowTemplateV1 | null
  after: VNextTableRowTemplateV1 | null
}

export interface VNextTableAuthoringReversibleChangeSetV1 {
  source: typeof VNEXT_TABLE_AUTHORING_CHANGE_SET_SOURCE
  contractVersion: typeof VNEXT_TABLE_AUTHORING_CHANGE_SET_VERSION
  kind: "table-authoring-reversible-change-set"
  artifact: VNextTableAuthoringRequestV1["artifact"]
  tableId: string
  sectionId: string
  commandKind: VNextTableAuthoringRequestV1["command"]["kind"]
  nodeChanges: VNextTableAuthoringNodeChangeV1[]
  definitionChanges: {
    columns: { before: VNextTableColumnDefinitionV1[]; after: VNextTableColumnDefinitionV1[] } | null
    rowSources: { before: VNextTableRowSourceV1[]; after: VNextTableRowSourceV1[] } | null
    rowTemplates: VNextTableAuthoringRowTemplateChangeV1[]
    headerPolicy: { before: VNextTableDefinitionV1["headerPolicy"]; after: VNextTableDefinitionV1["headerPolicy"] } | null
  }
  fingerprints: { bundleBefore: string; bundleAfter: string }
  summary: {
    changedNodeCount: number
    changedRowTemplateCount: number
    columnsChanged: boolean
    rowSourcesChanged: boolean
    headerPolicyChanged: boolean
  }
  fingerprint: string
}

export type VNextTableAuthoringChangeSetApplyResultV1 =
  | {
      source: typeof VNEXT_TABLE_AUTHORING_CHANGE_SET_SOURCE
      contractVersion: typeof VNEXT_TABLE_AUTHORING_CHANGE_SET_VERSION
      status: "applied"
      direction: "undo" | "redo"
      document: DocumentNodeV4Target
      definition: VNextTableDefinitionV1
      bundleFingerprint: string
      work: { nodeChangeCount: number; rowTemplateChangeCount: number }
      contracts: { persistence: "not-run"; editorStateMutation: false }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_AUTHORING_CHANGE_SET_SOURCE
      contractVersion: typeof VNEXT_TABLE_AUTHORING_CHANGE_SET_VERSION
      status: "blocked"
      direction: "undo" | "redo"
      document: DocumentNodeV4Target
      definition: VNextTableDefinitionV1
      issues: VNextTableAuthoringIssueV1[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function issue(code: string, path: string, message: string): VNextTableAuthoringIssueV1 {
  return { code, path, message, severity: "error" }
}

function blocked(
  direction: "undo" | "redo",
  bundle: VNextTableAuthoringBundleV1,
  issues: VNextTableAuthoringIssueV1[],
): VNextTableAuthoringChangeSetApplyResultV1 {
  return {
    source: VNEXT_TABLE_AUTHORING_CHANGE_SET_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_CHANGE_SET_VERSION,
    status: "blocked", direction,
    document: clone(bundle.document), definition: clone(bundle.definition), issues,
  }
}

export function createVNextTableAuthoringReversibleChangeSetV1(input: {
  request: VNextTableAuthoringRequestV1
  result: Extract<VNextTableAuthoringResultV1, { status: "committed" }>
}): VNextTableAuthoringReversibleChangeSetV1 {
  const sectionId = input.result.operation.scope.sectionIds[0]
  const beforeSection = input.request.document.document.sections.find((section) => section.id === sectionId)
  const afterSection = input.result.document.document.sections.find((section) => section.id === sectionId)
  if (beforeSection == null || afterSection == null) throw new Error("committed Table authoring section is missing")
  const nodeIds = [...new Set([...Object.keys(beforeSection.nodes), ...Object.keys(afterSection.nodes)])].sort()
  const beforeNodeIds = Object.keys(beforeSection.nodes)
  const afterNodeIds = Object.keys(afterSection.nodes)
  const nodeChanges = nodeIds.flatMap((nodeId): VNextTableAuthoringNodeChangeV1[] => {
    const before = beforeSection.nodes[nodeId] ?? null
    const after = afterSection.nodes[nodeId] ?? null
    return exact(before, after) ? [] : [{
      nodeId,
      beforeIndex: before == null ? null : beforeNodeIds.indexOf(nodeId),
      afterIndex: after == null ? null : afterNodeIds.indexOf(nodeId),
      before: clone(before), after: clone(after),
    }]
  })
  const templateIds = [...new Set([
    ...Object.keys(input.request.definition.rowTemplates),
    ...Object.keys(input.result.definition.rowTemplates),
  ])].sort()
  const beforeTemplateIds = Object.keys(input.request.definition.rowTemplates)
  const afterTemplateIds = Object.keys(input.result.definition.rowTemplates)
  const rowTemplates = templateIds.flatMap((rowTemplateId): VNextTableAuthoringRowTemplateChangeV1[] => {
    const before = input.request.definition.rowTemplates[rowTemplateId] ?? null
    const after = input.result.definition.rowTemplates[rowTemplateId] ?? null
    return exact(before, after) ? [] : [{
      rowTemplateId,
      beforeIndex: before == null ? null : beforeTemplateIds.indexOf(rowTemplateId),
      afterIndex: after == null ? null : afterTemplateIds.indexOf(rowTemplateId),
      before: clone(before), after: clone(after),
    }]
  })
  const definitionChanges = {
    columns: exact(input.request.definition.columns, input.result.definition.columns) ? null : {
      before: clone(input.request.definition.columns), after: clone(input.result.definition.columns),
    },
    rowSources: exact(input.request.definition.rowSources, input.result.definition.rowSources) ? null : {
      before: clone(input.request.definition.rowSources), after: clone(input.result.definition.rowSources),
    },
    rowTemplates,
    headerPolicy: input.request.definition.headerPolicy === input.result.definition.headerPolicy ? null : {
      before: input.request.definition.headerPolicy, after: input.result.definition.headerPolicy,
    },
  }
  const facts: Omit<VNextTableAuthoringReversibleChangeSetV1, "fingerprint"> = {
    source: VNEXT_TABLE_AUTHORING_CHANGE_SET_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_CHANGE_SET_VERSION,
    kind: "table-authoring-reversible-change-set" as const,
    artifact: clone(input.request.artifact),
    tableId: input.result.operation.tableId,
    sectionId,
    commandKind: input.request.command.kind,
    nodeChanges,
    definitionChanges,
    fingerprints: {
      bundleBefore: input.result.operation.fingerprints.bundleBefore,
      bundleAfter: input.result.operation.fingerprints.bundleAfter,
    },
    summary: {
      changedNodeCount: nodeChanges.length,
      changedRowTemplateCount: rowTemplates.length,
      columnsChanged: definitionChanges.columns != null,
      rowSourcesChanged: definitionChanges.rowSources != null,
      headerPolicyChanged: definitionChanges.headerPolicy != null,
    },
  }
  return { ...facts, fingerprint: JSON.stringify(facts) }
}

export function applyVNextTableAuthoringReversibleChangeSetV1(input: {
  bundle: VNextTableAuthoringBundleV1
  changeSet: VNextTableAuthoringReversibleChangeSetV1
  direction: "undo" | "redo"
}): VNextTableAuthoringChangeSetApplyResultV1 {
  const assessed = assessVNextTableAuthoringBundleV1(input.bundle)
  if (assessed.status !== "ready") return blocked(input.direction, input.bundle, assessed.issues)
  const expectedCurrent = input.direction === "undo"
    ? input.changeSet.fingerprints.bundleAfter
    : input.changeSet.fingerprints.bundleBefore
  const expectedResult = input.direction === "undo"
    ? input.changeSet.fingerprints.bundleBefore
    : input.changeSet.fingerprints.bundleAfter
  if (!exact(input.bundle.artifact, input.changeSet.artifact)
    || input.bundle.definition.tableId !== input.changeSet.tableId
    || assessed.bundle.fingerprint !== expectedCurrent) return blocked(input.direction, input.bundle, [issue(
    "change-set-current-fingerprint-mismatch", "changeSet.fingerprints",
    `${input.direction} requires the exact expected current Table authoring bundle`,
  )])
  const document = clone(input.bundle.document)
  const definition = clone(input.bundle.definition)
  const section = document.document.sections.find((item) => item.id === input.changeSet.sectionId)
  if (section == null) return blocked(input.direction, input.bundle, [issue(
    "change-set-section-missing", "changeSet.sectionId", "change-set section is missing from current document",
  )])
  const orderedNodes = Object.entries(section.nodes)
  input.changeSet.nodeChanges.forEach((change) => {
    const currentIndex = orderedNodes.findIndex(([nodeId]) => nodeId === change.nodeId)
    if (currentIndex >= 0) orderedNodes.splice(currentIndex, 1)
  })
  input.changeSet.nodeChanges
    .map((change) => ({
      id: change.nodeId,
      index: input.direction === "undo" ? change.beforeIndex : change.afterIndex,
      value: input.direction === "undo" ? change.before : change.after,
    }))
    .filter((change): change is { id: string; index: number; value: AuthoredNodeV4Target } => (
      change.index != null && change.value != null
    ))
    .sort((left, right) => left.index - right.index)
    .forEach((change) => orderedNodes.splice(change.index, 0, [change.id, clone(change.value)]))
  section.nodes = Object.fromEntries(orderedNodes)
  const definitionChanges = input.changeSet.definitionChanges
  const columns = definitionChanges.columns == null ? null
    : input.direction === "undo" ? definitionChanges.columns.before : definitionChanges.columns.after
  const rowSources = definitionChanges.rowSources == null ? null
    : input.direction === "undo" ? definitionChanges.rowSources.before : definitionChanges.rowSources.after
  const headerPolicy = definitionChanges.headerPolicy == null ? null
    : input.direction === "undo" ? definitionChanges.headerPolicy.before : definitionChanges.headerPolicy.after
  if (columns != null) definition.columns = clone(columns)
  if (rowSources != null) definition.rowSources = clone(rowSources)
  if (headerPolicy != null) definition.headerPolicy = headerPolicy
  const orderedTemplates = Object.entries(definition.rowTemplates)
  definitionChanges.rowTemplates.forEach((change) => {
    const currentIndex = orderedTemplates.findIndex(([templateId]) => templateId === change.rowTemplateId)
    if (currentIndex >= 0) orderedTemplates.splice(currentIndex, 1)
  })
  definitionChanges.rowTemplates
    .map((change) => ({
      id: change.rowTemplateId,
      index: input.direction === "undo" ? change.beforeIndex : change.afterIndex,
      value: input.direction === "undo" ? change.before : change.after,
    }))
    .filter((change): change is { id: string; index: number; value: VNextTableRowTemplateV1 } => (
      change.index != null && change.value != null
    ))
    .sort((left, right) => left.index - right.index)
    .forEach((change) => orderedTemplates.splice(change.index, 0, [change.id, clone(change.value)]))
  definition.rowTemplates = Object.fromEntries(orderedTemplates)
  const resultBundle: VNextTableAuthoringBundleV1 = {
    ...clone(input.bundle), document, definition,
  }
  const resultAssessment = assessVNextTableAuthoringBundleV1(resultBundle)
  if (resultAssessment.status !== "ready") return blocked(input.direction, input.bundle, resultAssessment.issues)
  if (resultAssessment.bundle.fingerprint !== expectedResult) return blocked(input.direction, input.bundle, [issue(
    "change-set-result-fingerprint-mismatch", "changeSet.fingerprints",
    `${input.direction} output does not match the retained opposite bundle fingerprint`,
  )])
  return {
    source: VNEXT_TABLE_AUTHORING_CHANGE_SET_SOURCE,
    contractVersion: VNEXT_TABLE_AUTHORING_CHANGE_SET_VERSION,
    status: "applied", direction: input.direction,
    document, definition, bundleFingerprint: resultAssessment.bundle.fingerprint,
    work: {
      nodeChangeCount: input.changeSet.nodeChanges.length,
      rowTemplateChangeCount: input.changeSet.definitionChanges.rowTemplates.length,
    },
    contracts: { persistence: "not-run", editorStateMutation: false },
    issues: [],
  }
}
