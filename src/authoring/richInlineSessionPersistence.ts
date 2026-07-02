import type { InlineNode } from "../schema/document.js"
import { InlineNodeSchema } from "../schema/document.js"
import type { VNextEditableSession } from "./editableSession.js"
import type { VNextAuthoringIntentHistoryRecord } from "./intentHistory.js"
import {
  createVNextSessionStorageRecord,
  type VNextSessionStorageRecord,
} from "./sessionStorage.js"
import {
  createVNextDurableHistorySnapshot,
  type VNextDurableHistorySnapshot,
} from "./durableHistory.js"

export const VNEXT_RICH_INLINE_SESSION_PERSISTENCE_SOURCE = "vnext-rich-inline-session-persistence"
export const VNEXT_RICH_INLINE_SESSION_PERSISTENCE_MODE = "rich-inline-session-record-boundary"
export const VNEXT_RICH_INLINE_REPLAY_VALIDATION_SOURCE = "vnext-rich-inline-replay-validation"
export const VNEXT_RICH_INLINE_REPLAY_VALIDATION_MODE = "rich-inline-replay-validation-facts"

export interface VNextRichInlineReplayPatchIssue {
  code: string
  message: string
  path: string
}

export interface VNextRichInlineReplayPatchInput {
  historyRecord?: VNextAuthoringIntentHistoryRecord | null
  groupId?: string | null
  sourceAction?: string
  targetTextBlockId: string
  beforeChildren: readonly InlineNode[]
  afterChildren: readonly InlineNode[]
}

export interface VNextRichInlineReplayPatchValidationRecord {
  schemaVersion: 1
  commandKind: "text-block.rich-inline.replace"
  groupId: string | null
  sourceAction: string | null
  targetTextBlockId: string
  historySequence: number | null
  historySummary: string | null
  beforeChildren: InlineNode[]
  afterChildren: InlineNode[]
  beforeInlineCount: number
  afterInlineCount: number
  keyHistory: {
    fieldKeys: string[]
    status: "field-ref-usage-recorded" | "not-required"
  }
  validationStatus: "valid" | "invalid"
  issues: VNextRichInlineReplayPatchIssue[]
}

export interface VNextRichInlineReplayPatchRecord extends VNextRichInlineReplayPatchValidationRecord {
  replayStatus: "not-run"
  storageStatus: "not-written"
}

export interface VNextRichInlineReplayValidationOptions {
  historyRecords?: readonly VNextAuthoringIntentHistoryRecord[]
  replayPatches?: readonly VNextRichInlineReplayPatchInput[]
}

export interface VNextRichInlineReplayValidationFacts {
  schemaVersion: 1
  commandKind: "text-block.rich-inline.replace"
  historyReadyRecordCount: number
  richHistoryRecordCount: number
  replayPatchCount: number
  invalidReplayPatchCount: number
  fieldKeys: string[]
  contracts: {
    replayPatchValidation: true
    historyReadyFacts: true
    beforeAfterChildrenSnapshots: true
    storageRecord: false
    storageWrites: false
    routeDispatch: false
    backendApi: false
    replayExecution: false
    conflictResolution: false
    selectionRestore: false
  }
}

export interface VNextRichInlineReplayValidationRecord {
  source: typeof VNEXT_RICH_INLINE_REPLAY_VALIDATION_SOURCE
  mode: typeof VNEXT_RICH_INLINE_REPLAY_VALIDATION_MODE
  replayPatchValidations: VNextRichInlineReplayPatchValidationRecord[]
  facts: VNextRichInlineReplayValidationFacts
}

export interface VNextRichInlineSessionPersistenceOptions {
  historyKey?: string
  historyRecords?: readonly VNextAuthoringIntentHistoryRecord[]
  reason?: string
  redoRecords?: readonly VNextAuthoringIntentHistoryRecord[]
  replayPatches?: readonly VNextRichInlineReplayPatchInput[]
  storageKey?: string
}

export interface VNextRichInlineSessionPersistenceManifest {
  schemaVersion: 1
  packageId: string
  documentRevision: number
  storageKey: string | null
  historyKey: string | null
  reason: string
  storageStatus: "not-written"
  packageStorageStatus: "not-written"
  historyStorageStatus: "not-written"
  richHistoryRecordCount: number
  replayPatchCount: number
  invalidReplayPatchCount: number
  persistedState: {
    package: true
    authoringHistory: true
    richReplayPatches: true
    selection: false
    dirtyScopes: false
    diagnostics: false
    graph: false
    viewport: false
    liveLayout: false
    exactLayout: false
    artifacts: false
  }
  replay: {
    executionStatus: "not-run"
    replayMode: "rich-inline-before-after-children"
    conflictResolution: "not-run"
    selectionRestore: "not-persisted"
    storageAdapter: "not-bound"
    backendApi: "not-called"
  }
}

export interface VNextRichInlineSessionPersistenceRecord {
  source: typeof VNEXT_RICH_INLINE_SESSION_PERSISTENCE_SOURCE
  mode: typeof VNEXT_RICH_INLINE_SESSION_PERSISTENCE_MODE
  sessionStorage: VNextSessionStorageRecord
  durableHistory: VNextDurableHistorySnapshot
  replayPatches: VNextRichInlineReplayPatchRecord[]
  manifest: VNextRichInlineSessionPersistenceManifest
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function nonEmptyString(value: string | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function stringOrNull(value: string | null | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function issue(code: string, message: string, path: string): VNextRichInlineReplayPatchIssue {
  return { code, message, path }
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort()
}

function fieldKeysFor(children: readonly InlineNode[]): string[] {
  return uniqueSorted(children.flatMap((child) => child.type === "field-ref" ? [child.key] : []))
}

function validateChildren(side: "beforeChildren" | "afterChildren", children: readonly InlineNode[]): VNextRichInlineReplayPatchIssue[] {
  const ids = new Set<string>()
  const issues: VNextRichInlineReplayPatchIssue[] = []

  children.forEach((child, index) => {
    const parsed = InlineNodeSchema.safeParse(child)
    const path = `${side}[${index}]`
    if (!parsed.success) {
      issues.push(issue("invalid-inline-child", "rich inline replay child must match the vNext inline schema", path))
      return
    }

    if (child.type !== "text" && child.type !== "field-ref") {
      issues.push(issue("unsupported-inline-child", "rich inline replay currently accepts text and field-ref children only", path))
    }

    if (ids.has(child.id)) {
      issues.push(issue("duplicate-inline-id", `inline id "${child.id}" is duplicated`, `${path}.id`))
    }
    ids.add(child.id)
  })

  return issues
}

function richHistoryRecordCount(records: readonly VNextAuthoringIntentHistoryRecord[]): number {
  return records.filter((record) => record.commandKind === "text-block.rich-inline.replace").length
}

export function createVNextRichInlineReplayPatchValidation(
  input: VNextRichInlineReplayPatchInput,
): VNextRichInlineReplayPatchValidationRecord {
  const beforeChildren = input.beforeChildren.map((child) => cloneJson(child))
  const afterChildren = input.afterChildren.map((child) => cloneJson(child))
  const issues = [
    ...validateChildren("beforeChildren", beforeChildren),
    ...validateChildren("afterChildren", afterChildren),
  ]
  const fieldKeys = fieldKeysFor([...beforeChildren, ...afterChildren])

  return {
    schemaVersion: 1,
    commandKind: "text-block.rich-inline.replace",
    groupId: stringOrNull(input.historyRecord?.groupId) ?? stringOrNull(input.groupId),
    sourceAction: nonEmptyString(input.sourceAction),
    targetTextBlockId: input.targetTextBlockId,
    historySequence: input.historyRecord?.sequence ?? null,
    historySummary: input.historyRecord?.summary ?? null,
    beforeChildren,
    afterChildren,
    beforeInlineCount: beforeChildren.length,
    afterInlineCount: afterChildren.length,
    keyHistory: {
      fieldKeys,
      status: fieldKeys.length > 0 ? "field-ref-usage-recorded" : "not-required",
    },
    validationStatus: issues.length > 0 ? "invalid" : "valid",
    issues,
  }
}

function replayPatchRecordFromValidation(
  validation: VNextRichInlineReplayPatchValidationRecord,
): VNextRichInlineReplayPatchRecord {
  return {
    ...cloneJson(validation),
    replayStatus: "not-run",
    storageStatus: "not-written",
  }
}

export function createVNextRichInlineReplayPatchRecord(
  input: VNextRichInlineReplayPatchInput,
): VNextRichInlineReplayPatchRecord {
  return replayPatchRecordFromValidation(createVNextRichInlineReplayPatchValidation(input))
}

export function createVNextRichInlineReplayValidation(
  options: VNextRichInlineReplayValidationOptions = {},
): VNextRichInlineReplayValidationRecord {
  const replayPatchValidations = (options.replayPatches ?? []).map((patch) => createVNextRichInlineReplayPatchValidation(patch))
  const invalidReplayPatchCount = replayPatchValidations.filter((patch) => patch.validationStatus === "invalid").length
  const fieldKeys = uniqueSorted(replayPatchValidations.flatMap((patch) => patch.keyHistory.fieldKeys))
  const historyRecords = options.historyRecords ?? []

  return {
    source: VNEXT_RICH_INLINE_REPLAY_VALIDATION_SOURCE,
    mode: VNEXT_RICH_INLINE_REPLAY_VALIDATION_MODE,
    replayPatchValidations,
    facts: {
      schemaVersion: 1,
      commandKind: "text-block.rich-inline.replace",
      historyReadyRecordCount: historyRecords.length,
      richHistoryRecordCount: richHistoryRecordCount(historyRecords),
      replayPatchCount: replayPatchValidations.length,
      invalidReplayPatchCount,
      fieldKeys,
      contracts: {
        replayPatchValidation: true,
        historyReadyFacts: true,
        beforeAfterChildrenSnapshots: true,
        storageRecord: false,
        storageWrites: false,
        routeDispatch: false,
        backendApi: false,
        replayExecution: false,
        conflictResolution: false,
        selectionRestore: false,
      },
    },
  }
}

export function createVNextRichInlineSessionPersistenceRecord(
  session: VNextEditableSession,
  options: VNextRichInlineSessionPersistenceOptions = {},
): VNextRichInlineSessionPersistenceRecord {
  const reason = nonEmptyString(options.reason) ?? "rich-inline-session-persistence-boundary"
  const sessionStorage = createVNextSessionStorageRecord(session, {
    reason,
    storageKey: options.storageKey,
  })
  const durableHistory = createVNextDurableHistorySnapshot(options.historyRecords ?? [], {
    documentRevision: session.revisions.document,
    historyKey: options.historyKey,
    reason,
    redoRecords: options.redoRecords,
  })
  const replayValidation = createVNextRichInlineReplayValidation({
    historyRecords: durableHistory.records,
    replayPatches: options.replayPatches,
  })
  const replayPatches = replayValidation.replayPatchValidations.map((patch) => replayPatchRecordFromValidation(patch))

  return {
    source: VNEXT_RICH_INLINE_SESSION_PERSISTENCE_SOURCE,
    mode: VNEXT_RICH_INLINE_SESSION_PERSISTENCE_MODE,
    sessionStorage,
    durableHistory,
    replayPatches,
    manifest: {
      schemaVersion: 1,
      packageId: sessionStorage.manifest.packageId,
      documentRevision: session.revisions.document,
      storageKey: sessionStorage.manifest.storageKey,
      historyKey: durableHistory.manifest.historyKey,
      reason,
      storageStatus: "not-written",
      packageStorageStatus: sessionStorage.manifest.storageStatus,
      historyStorageStatus: durableHistory.manifest.storageStatus,
      richHistoryRecordCount: replayValidation.facts.richHistoryRecordCount,
      replayPatchCount: replayValidation.facts.replayPatchCount,
      invalidReplayPatchCount: replayValidation.facts.invalidReplayPatchCount,
      persistedState: {
        package: true,
        authoringHistory: true,
        richReplayPatches: true,
        selection: false,
        dirtyScopes: false,
        diagnostics: false,
        graph: false,
        viewport: false,
        liveLayout: false,
        exactLayout: false,
        artifacts: false,
      },
      replay: {
        executionStatus: "not-run",
        replayMode: "rich-inline-before-after-children",
        conflictResolution: "not-run",
        selectionRestore: "not-persisted",
        storageAdapter: "not-bound",
        backendApi: "not-called",
      },
    },
  }
}
