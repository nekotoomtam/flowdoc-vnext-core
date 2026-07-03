import {
  createVNextDurableHistorySnapshot,
  createVNextRichInlineReplayValidation,
  createVNextSessionPackageSnapshot,
} from "@flowdoc/vnext-core"
import type {
  FlowDocPackageV2DocumentVNext,
  VNextAuthoringIntentHistoryRecord,
  VNextDurableHistorySnapshot,
  VNextEditableSession,
  VNextRichInlineReplayPatchInput,
  VNextRichInlineReplayPatchValidationRecord,
} from "@flowdoc/vnext-core"

export const FLOWDOC_INTERNAL_ALPHA_SESSION_STORAGE_SOURCE = "vnext-session-storage"
export const FLOWDOC_INTERNAL_ALPHA_SESSION_STORAGE_MODE = "canonical-package-snapshot"
export const FLOWDOC_INTERNAL_ALPHA_RICH_INLINE_SESSION_SOURCE = "vnext-rich-inline-session-persistence"
export const FLOWDOC_INTERNAL_ALPHA_RICH_INLINE_SESSION_MODE = "rich-inline-session-record-boundary"

export interface FlowDocInternalAlphaSessionStorageOptions {
  storageKey?: string
  reason?: string
}

export interface FlowDocInternalAlphaSessionPersistedState {
  package: true
  selection: false
  dirtyScopes: false
  revisions: false
  diagnostics: false
  graph: false
  viewport: false
  liveLayout: false
  exactLayout: false
  authoringHistory: false
}

export interface FlowDocInternalAlphaSessionStorageManifest {
  packageId: string
  packageVersion: 2
  documentVersion: 3
  documentRevision: number
  dirtyScopeCount: number
  storageKey: string | null
  reason: string
  storageStatus: "not-written"
  persistedState: FlowDocInternalAlphaSessionPersistedState
}

export interface FlowDocInternalAlphaSessionStorageRecord {
  source: typeof FLOWDOC_INTERNAL_ALPHA_SESSION_STORAGE_SOURCE
  mode: typeof FLOWDOC_INTERNAL_ALPHA_SESSION_STORAGE_MODE
  package: FlowDocPackageV2DocumentVNext
  manifest: FlowDocInternalAlphaSessionStorageManifest
}

export interface FlowDocInternalAlphaRichInlineReplayPatchRecord extends VNextRichInlineReplayPatchValidationRecord {
  replayStatus: "not-run"
  storageStatus: "not-written"
}

export interface FlowDocInternalAlphaRichInlineSessionOptions {
  historyKey?: string
  historyRecords?: readonly VNextAuthoringIntentHistoryRecord[]
  reason?: string
  redoRecords?: readonly VNextAuthoringIntentHistoryRecord[]
  replayPatches?: readonly VNextRichInlineReplayPatchInput[]
  storageKey?: string
}

export interface FlowDocInternalAlphaRichInlineSessionManifest {
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

export interface FlowDocInternalAlphaRichInlineSessionRecord {
  source: typeof FLOWDOC_INTERNAL_ALPHA_RICH_INLINE_SESSION_SOURCE
  mode: typeof FLOWDOC_INTERNAL_ALPHA_RICH_INLINE_SESSION_MODE
  sessionStorage: FlowDocInternalAlphaSessionStorageRecord
  durableHistory: VNextDurableHistorySnapshot
  replayPatches: FlowDocInternalAlphaRichInlineReplayPatchRecord[]
  manifest: FlowDocInternalAlphaRichInlineSessionManifest
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function nonEmptyString(value: string | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function replayPatchRecordFromValidation(
  validation: VNextRichInlineReplayPatchValidationRecord,
): FlowDocInternalAlphaRichInlineReplayPatchRecord {
  return {
    ...cloneJson(validation),
    replayStatus: "not-run",
    storageStatus: "not-written",
  }
}

export function createFlowDocInternalAlphaSessionStorageRecord(
  session: VNextEditableSession,
  options: FlowDocInternalAlphaSessionStorageOptions = {},
): FlowDocInternalAlphaSessionStorageRecord {
  const snapshot = createVNextSessionPackageSnapshot(session)

  return {
    source: FLOWDOC_INTERNAL_ALPHA_SESSION_STORAGE_SOURCE,
    mode: FLOWDOC_INTERNAL_ALPHA_SESSION_STORAGE_MODE,
    package: snapshot.package,
    manifest: {
      packageId: snapshot.facts.packageId,
      packageVersion: snapshot.facts.packageVersion,
      documentVersion: snapshot.facts.documentVersion,
      documentRevision: snapshot.facts.documentRevision,
      dirtyScopeCount: snapshot.facts.dirtyScopeCount,
      storageKey: nonEmptyString(options.storageKey),
      reason: nonEmptyString(options.reason) ?? "session-save-boundary",
      storageStatus: "not-written",
      persistedState: snapshot.facts.persistedState,
    },
  }
}

export function createFlowDocInternalAlphaRichInlineSessionRecord(
  session: VNextEditableSession,
  options: FlowDocInternalAlphaRichInlineSessionOptions = {},
): FlowDocInternalAlphaRichInlineSessionRecord {
  const reason = nonEmptyString(options.reason) ?? "rich-inline-session-persistence-boundary"
  const sessionStorage = createFlowDocInternalAlphaSessionStorageRecord(session, {
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
    source: FLOWDOC_INTERNAL_ALPHA_RICH_INLINE_SESSION_SOURCE,
    mode: FLOWDOC_INTERNAL_ALPHA_RICH_INLINE_SESSION_MODE,
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
