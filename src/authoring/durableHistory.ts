import type {
  VNextAuthoringIntentHistoryGroup,
  VNextAuthoringIntentHistoryRecord,
} from "./intentHistory.js"
import { groupVNextAuthoringIntentHistory } from "./intentHistory.js"

export const VNEXT_DURABLE_HISTORY_SOURCE = "vnext-durable-history"
export const VNEXT_DURABLE_HISTORY_MODE = "authoring-history-snapshot"

export interface VNextDurableHistoryOptions {
  historyKey?: string
  reason?: string
  documentRevision?: number
  redoRecords?: readonly VNextAuthoringIntentHistoryRecord[]
}

export interface VNextDurableUndoRedoBoundary {
  canUndo: boolean
  canRedo: boolean
  undoDepth: number
  redoDepth: number
  executionStatus: "not-run"
  replayMode: "metadata-only"
  inversePatches: "not-stored"
  fullPackageSnapshots: false
  selectionRestore: "not-persisted"
}

export interface VNextDurableHistoryManifest {
  schemaVersion: 1
  historyKey: string | null
  reason: string
  documentRevision: number | null
  storageStatus: "not-written"
  recordCount: number
  redoRecordCount: number
  undoableRecordCount: number
  diagnosticRecordCount: number
  skippedNonDurableCount: number
  groupCount: number
  persistedState: {
    authoringHistory: true
    package: false
    selection: false
    dirtyScopes: false
    diagnostics: false
    graph: false
    viewport: false
    liveLayout: false
    exactLayout: false
    artifacts: false
  }
  undoRedo: VNextDurableUndoRedoBoundary
}

export interface VNextDurableHistorySnapshot {
  source: typeof VNEXT_DURABLE_HISTORY_SOURCE
  mode: typeof VNEXT_DURABLE_HISTORY_MODE
  records: VNextAuthoringIntentHistoryRecord[]
  redoRecords: VNextAuthoringIntentHistoryRecord[]
  groups: VNextAuthoringIntentHistoryGroup[]
  manifest: VNextDurableHistoryManifest
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function nonEmptyString(value: string | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function documentRevision(value: number | undefined): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null
}

function isDurableRecord(record: VNextAuthoringIntentHistoryRecord): boolean {
  return record.status !== "non-durable"
}

function durableRecords(
  records: readonly VNextAuthoringIntentHistoryRecord[],
): VNextAuthoringIntentHistoryRecord[] {
  return records.filter(isDurableRecord).map((record) => cloneJson(record))
}

function undoableRecordCount(records: readonly VNextAuthoringIntentHistoryRecord[]): number {
  return records.filter((record) => (
    record.status === "committed" && record.historyAction === "undoable"
  )).length
}

function diagnosticRecordCount(records: readonly VNextAuthoringIntentHistoryRecord[]): number {
  return records.filter((record) => record.historyAction === "diagnostic-only").length
}

function nonDurableRecordCount(records: readonly VNextAuthoringIntentHistoryRecord[]): number {
  return records.filter((record) => !isDurableRecord(record)).length
}

export function createVNextDurableHistorySnapshot(
  records: readonly VNextAuthoringIntentHistoryRecord[],
  options: VNextDurableHistoryOptions = {},
): VNextDurableHistorySnapshot {
  const durableUndoRecords = durableRecords(records)
  const durableRedoRecords = durableRecords(options.redoRecords ?? [])
  const groups = cloneJson(groupVNextAuthoringIntentHistory(durableUndoRecords))
  const undoDepth = undoableRecordCount(durableUndoRecords)
  const redoDepth = undoableRecordCount(durableRedoRecords)

  return {
    source: VNEXT_DURABLE_HISTORY_SOURCE,
    mode: VNEXT_DURABLE_HISTORY_MODE,
    records: durableUndoRecords,
    redoRecords: durableRedoRecords,
    groups,
    manifest: {
      schemaVersion: 1,
      historyKey: nonEmptyString(options.historyKey),
      reason: nonEmptyString(options.reason) ?? "durable-history-boundary",
      documentRevision: documentRevision(options.documentRevision),
      storageStatus: "not-written",
      recordCount: durableUndoRecords.length,
      redoRecordCount: durableRedoRecords.length,
      undoableRecordCount: undoDepth,
      diagnosticRecordCount: diagnosticRecordCount(durableUndoRecords),
      skippedNonDurableCount: (
        nonDurableRecordCount(records) + nonDurableRecordCount(options.redoRecords ?? [])
      ),
      groupCount: groups.length,
      persistedState: {
        authoringHistory: true,
        package: false,
        selection: false,
        dirtyScopes: false,
        diagnostics: false,
        graph: false,
        viewport: false,
        liveLayout: false,
        exactLayout: false,
        artifacts: false,
      },
      undoRedo: {
        canUndo: undoDepth > 0,
        canRedo: redoDepth > 0,
        undoDepth,
        redoDepth,
        executionStatus: "not-run",
        replayMode: "metadata-only",
        inversePatches: "not-stored",
        fullPackageSnapshots: false,
        selectionRestore: "not-persisted",
      },
    },
  }
}
