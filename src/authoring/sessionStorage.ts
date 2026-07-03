import type { FlowDocPackageV2DocumentVNext } from "../persistence/package.js"
import { serializeFlowDocPackageV2DocumentVNext } from "../persistence/package.js"
import type { VNextEditableSession } from "./editableSession.js"

export const VNEXT_SESSION_STORAGE_SOURCE = "vnext-session-storage"
export const VNEXT_SESSION_STORAGE_MODE = "canonical-package-snapshot"
export const VNEXT_SESSION_PACKAGE_SNAPSHOT_SOURCE = "vnext-session-package-snapshot"
export const VNEXT_SESSION_PACKAGE_SNAPSHOT_MODE = "canonical-package-snapshot-facts"

export interface VNextSessionStorageOptions {
  storageKey?: string
  reason?: string
}

export interface VNextSessionPackageSnapshotPersistedState {
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

export interface VNextSessionPackageSnapshotFacts {
  packageId: string
  packageVersion: 2
  documentVersion: 3
  documentRevision: number
  dirtyScopeCount: number
  persistedState: VNextSessionPackageSnapshotPersistedState
  contracts: {
    canonicalPackage: true
    storageRecord: false
    storageWrites: false
    storageKey: false
    routeDispatch: false
    backendApi: false
  }
}

export interface VNextSessionPackageSnapshotRecord {
  source: typeof VNEXT_SESSION_PACKAGE_SNAPSHOT_SOURCE
  mode: typeof VNEXT_SESSION_PACKAGE_SNAPSHOT_MODE
  package: FlowDocPackageV2DocumentVNext
  facts: VNextSessionPackageSnapshotFacts
}

export interface VNextSessionStorageManifest {
  packageId: string
  packageVersion: 2
  documentVersion: 3
  documentRevision: number
  dirtyScopeCount: number
  storageKey: string | null
  reason: string
  storageStatus: "not-written"
  persistedState: VNextSessionPackageSnapshotPersistedState
}

export interface VNextSessionStorageRecord {
  source: typeof VNEXT_SESSION_STORAGE_SOURCE
  mode: typeof VNEXT_SESSION_STORAGE_MODE
  package: FlowDocPackageV2DocumentVNext
  manifest: VNextSessionStorageManifest
}

function nonEmptyString(value: string | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function persistedStateExclusions(): VNextSessionPackageSnapshotPersistedState {
  return {
    package: true,
    selection: false,
    dirtyScopes: false,
    revisions: false,
    diagnostics: false,
    graph: false,
    viewport: false,
    liveLayout: false,
    exactLayout: false,
    authoringHistory: false,
  }
}

export function createVNextSessionPackageSnapshot(
  session: VNextEditableSession,
): VNextSessionPackageSnapshotRecord {
  const pack = serializeFlowDocPackageV2DocumentVNext(session.package)

  return {
    source: VNEXT_SESSION_PACKAGE_SNAPSHOT_SOURCE,
    mode: VNEXT_SESSION_PACKAGE_SNAPSHOT_MODE,
    package: pack,
    facts: {
      packageId: pack.id,
      packageVersion: pack.packageVersion,
      documentVersion: pack.document.version,
      documentRevision: session.revisions.document,
      dirtyScopeCount: session.dirtyScopes.size,
      persistedState: persistedStateExclusions(),
      contracts: {
        canonicalPackage: true,
        storageRecord: false,
        storageWrites: false,
        storageKey: false,
        routeDispatch: false,
        backendApi: false,
      },
    },
  }
}

/**
 * @deprecated Window NR-A compatibility export.
 * Backend-owned session storage records now live in
 * `flowdoc-vnext-backend/src/storage/sessionRecord.ts`. Use
 * `createVNextSessionPackageSnapshot(...)` for retained core package snapshot
 * facts.
 */
export function createVNextSessionStorageRecord(
  session: VNextEditableSession,
  options: VNextSessionStorageOptions = {},
): VNextSessionStorageRecord {
  const snapshot = createVNextSessionPackageSnapshot(session)

  return {
    source: VNEXT_SESSION_STORAGE_SOURCE,
    mode: VNEXT_SESSION_STORAGE_MODE,
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
