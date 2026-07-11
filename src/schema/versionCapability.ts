import {
  VNEXT_ACTIVE_DOCUMENT_VERSION,
  VNEXT_ACTIVE_PACKAGE_VERSION,
  VNEXT_TEXT_BLOCK_V1_TARGET_DOCUMENT_VERSION,
  VNEXT_TEXT_BLOCK_V1_VERSION_POLICY,
} from "./documentVersionPolicy.js"
import type { VNextOperationKind } from "../operations/commands.js"

export const VNEXT_VERSION_CAPABILITY_CONTRACT_VERSION = 3 as const
export const VNEXT_TARGET_PACKAGE_VERSION = 3 as const

export interface VNextPackageDocumentVersionPair {
  packageVersion: number
  documentVersion: number
}

export type VNextCoreVersionDisposition = "active" | "migration-target" | "unsupported"

export interface VNextCoreVersionSupport {
  canCreateRuntimeSession: boolean
  canCreateReadOnlySession: boolean
  canMutate: boolean
  canParse: boolean
  canPlanMigrationFrom: boolean
  canValidateMigrationTarget: boolean
  disposition: VNextCoreVersionDisposition
  pair: VNextPackageDocumentVersionPair
  supportedOperationKinds: readonly VNextOperationKind[]
}

export type VNextPackageVersionInspection =
  | {
      capability: VNextCoreVersionSupport
      documentVersion: number
      packageVersion: number
      status: "recognized" | "unsupported"
    }
  | {
      capability: null
      documentVersion: number | null
      packageVersion: number | null
      status: "invalid-version-markers"
    }

const ACTIVE_PAIR = {
  packageVersion: VNEXT_ACTIVE_PACKAGE_VERSION,
  documentVersion: VNEXT_ACTIVE_DOCUMENT_VERSION,
} as const

const MIGRATION_TARGET_PAIR = {
  packageVersion: VNEXT_TARGET_PACKAGE_VERSION,
  documentVersion: VNEXT_TEXT_BLOCK_V1_TARGET_DOCUMENT_VERSION,
} as const

export const VNEXT_CORE_VERSION_CAPABILITY_CONTRACT = {
  contractVersion: VNEXT_VERSION_CAPABILITY_CONTRACT_VERSION,
  status: "v4-partial-mutation-ready",
  active: ACTIVE_PAIR,
  migrationTarget: MIGRATION_TARGET_PAIR,
  activation: {
    status: "blocked",
    blockers: VNEXT_TEXT_BLOCK_V1_VERSION_POLICY.activationBlockers,
  },
  support: {
    active: {
      canCreateRuntimeSession: true,
      canCreateReadOnlySession: true,
      canMutate: true,
      canParse: true,
      canPlanMigrationFrom: true,
      canValidateMigrationTarget: false,
      disposition: "active",
      pair: ACTIVE_PAIR,
      supportedOperationKinds: ["node.delete", "node.duplicate", "node.reorder", "columns.insert", "columns.layout.patch", "text-block.insert", "text-block.text.replace", "table.row.insert", "table.row.delete", "table.column.insert", "table.column.delete"],
    },
    migrationTarget: {
      canCreateRuntimeSession: false,
      canCreateReadOnlySession: true,
      canMutate: true,
      canParse: true,
      canPlanMigrationFrom: false,
      canValidateMigrationTarget: true,
      disposition: "migration-target",
      pair: MIGRATION_TARGET_PAIR,
      supportedOperationKinds: ["node.delete", "node.reorder"],
    },
  },
} as const

export type VNextCoreVersionCapabilityContract = typeof VNEXT_CORE_VERSION_CAPABILITY_CONTRACT

function clonePair(pair: VNextPackageDocumentVersionPair): VNextPackageDocumentVersionPair {
  return { packageVersion: pair.packageVersion, documentVersion: pair.documentVersion }
}

export function getVNextCoreVersionSupport(
  packageVersion: number,
  documentVersion: number,
): VNextCoreVersionSupport {
  if (packageVersion === ACTIVE_PAIR.packageVersion && documentVersion === ACTIVE_PAIR.documentVersion) {
    return {
      ...VNEXT_CORE_VERSION_CAPABILITY_CONTRACT.support.active,
      pair: clonePair(ACTIVE_PAIR),
    }
  }
  if (
    packageVersion === MIGRATION_TARGET_PAIR.packageVersion
    && documentVersion === MIGRATION_TARGET_PAIR.documentVersion
  ) {
    return {
      ...VNEXT_CORE_VERSION_CAPABILITY_CONTRACT.support.migrationTarget,
      pair: clonePair(MIGRATION_TARGET_PAIR),
    }
  }
  return {
    canCreateRuntimeSession: false,
    canCreateReadOnlySession: false,
    canMutate: false,
    canParse: false,
    canPlanMigrationFrom: false,
    canValidateMigrationTarget: false,
    disposition: "unsupported",
    pair: { packageVersion, documentVersion },
    supportedOperationKinds: [],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function versionMarker(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null
}

export function inspectVNextPackageVersionCapability(value: unknown): VNextPackageVersionInspection {
  const record = isRecord(value) ? value : null
  const document = record != null && isRecord(record.document) ? record.document : null
  const packageVersion = versionMarker(record?.packageVersion)
  const documentVersion = versionMarker(document?.version)
  if (packageVersion == null || documentVersion == null) {
    return {
      capability: null,
      documentVersion,
      packageVersion,
      status: "invalid-version-markers",
    }
  }

  const capability = getVNextCoreVersionSupport(packageVersion, documentVersion)
  return {
    capability,
    documentVersion,
    packageVersion,
    status: capability.disposition === "unsupported" ? "unsupported" : "recognized",
  }
}
