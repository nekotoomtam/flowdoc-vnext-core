import type { FlowDocPackageV2DocumentVNext } from "../persistence/package.js"
import { serializeFlowDocPackageV2DocumentVNext } from "../persistence/package.js"
import type { VNextEditableSession } from "./editableSession.js"

export const VNEXT_SESSION_PACKAGE_SNAPSHOT_SOURCE = "vnext-session-package-snapshot"
export const VNEXT_SESSION_PACKAGE_SNAPSHOT_MODE = "canonical-package-snapshot-facts"

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
