import type { FlowDocPackageV2DocumentVNext } from "../persistence/package.js"
import { serializeFlowDocPackageV2DocumentVNext } from "../persistence/package.js"
import type { VNextEditableSession } from "./editableSession.js"

export const VNEXT_SESSION_STORAGE_SOURCE = "vnext-session-storage"
export const VNEXT_SESSION_STORAGE_MODE = "canonical-package-snapshot"

export interface VNextSessionStorageOptions {
  storageKey?: string
  reason?: string
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
  persistedState: {
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

export function createVNextSessionStorageRecord(
  session: VNextEditableSession,
  options: VNextSessionStorageOptions = {},
): VNextSessionStorageRecord {
  const pack = serializeFlowDocPackageV2DocumentVNext(session.package)

  return {
    source: VNEXT_SESSION_STORAGE_SOURCE,
    mode: VNEXT_SESSION_STORAGE_MODE,
    package: pack,
    manifest: {
      packageId: pack.id,
      packageVersion: pack.packageVersion,
      documentVersion: pack.document.version,
      documentRevision: session.revisions.document,
      dirtyScopeCount: session.dirtyScopes.size,
      storageKey: nonEmptyString(options.storageKey),
      reason: nonEmptyString(options.reason) ?? "session-save-boundary",
      storageStatus: "not-written",
      persistedState: {
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
      },
    },
  }
}
