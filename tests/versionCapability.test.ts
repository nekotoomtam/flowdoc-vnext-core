import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  VNEXT_CORE_VERSION_CAPABILITY_CONTRACT,
  VNEXT_CORE_VERSION_SURFACE_RETIREMENT_INVENTORY,
  VNEXT_CORE_VERSION_SURFACE_RETIREMENT_INVENTORY_VERSION,
  VNEXT_VERSION_CAPABILITY_CONTRACT_VERSION,
  getVNextCoreVersionSupport,
  inspectVNextPackageVersionCapability,
} from "../src/index.js"
import type { VNextCoreVersionSurfaceRetirementRecord } from "../src/index.js"

describe("Core package/document version capability", () => {
  it("publishes active and migration-target support without claiming v4 runtime activation", () => {
    expect(VNEXT_VERSION_CAPABILITY_CONTRACT_VERSION).toBe(3)
    expect(VNEXT_CORE_VERSION_CAPABILITY_CONTRACT).toEqual({
      contractVersion: 3,
      status: "v4-partial-mutation-ready",
      active: { packageVersion: 2, documentVersion: 3 },
      migrationTarget: { packageVersion: 3, documentVersion: 4 },
      activation: {
        status: "blocked",
        blockers: ["v4-remaining-operation-layout-render-support"],
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
          pair: { packageVersion: 2, documentVersion: 3 },
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
          pair: { packageVersion: 3, documentVersion: 4 },
          supportedOperationKinds: ["node.delete", "node.duplicate", "node.reorder"],
        },
      },
    })
    expect(JSON.parse(JSON.stringify(VNEXT_CORE_VERSION_CAPABILITY_CONTRACT)))
      .toEqual(VNEXT_CORE_VERSION_CAPABILITY_CONTRACT)
  })

  it("classifies active, migration-target, and unsupported version pairs", () => {
    expect(getVNextCoreVersionSupport(2, 3)).toMatchObject({
      disposition: "active",
      canCreateRuntimeSession: true,
      canMutate: true,
    })
    expect(getVNextCoreVersionSupport(3, 4)).toMatchObject({
      disposition: "migration-target",
      canCreateRuntimeSession: false,
      canCreateReadOnlySession: true,
      canValidateMigrationTarget: true,
      supportedOperationKinds: ["node.delete", "node.duplicate", "node.reorder"],
    })
    expect(getVNextCoreVersionSupport(2, 4)).toMatchObject({
      disposition: "unsupported",
      canParse: false,
    })
  })

  it("inspects package markers without invoking either package parser", () => {
    expect(inspectVNextPackageVersionCapability({
      packageVersion: 2,
      document: { version: 3 },
    })).toMatchObject({
      status: "recognized",
      capability: { disposition: "active" },
    })
    expect(inspectVNextPackageVersionCapability({
      packageVersion: 3,
      document: { version: 4 },
    })).toMatchObject({
      status: "recognized",
      capability: { disposition: "migration-target" },
    })
    expect(inspectVNextPackageVersionCapability({
      packageVersion: 9,
      document: { version: 9 },
    })).toMatchObject({
      status: "unsupported",
      capability: { disposition: "unsupported" },
    })
    expect(inspectVNextPackageVersionCapability({ packageVersion: 2 })).toEqual({
      capability: null,
      documentVersion: null,
      packageVersion: 2,
      status: "invalid-version-markers",
    })
  })

  it("publishes a version-surface retirement inventory before backend adoption", () => {
    const inventory: readonly VNextCoreVersionSurfaceRetirementRecord[] = VNEXT_CORE_VERSION_SURFACE_RETIREMENT_INVENTORY

    expect(VNEXT_CORE_VERSION_SURFACE_RETIREMENT_INVENTORY_VERSION).toBe(1)
    expect(inventory).toEqual([
      {
        id: "active-package-v2-document-v3-runtime",
        owner: "core",
        packageVersion: 2,
        documentVersion: 3,
        disposition: "active-runtime",
        paths: ["src/persistence/package.ts", "src/runtime/session.ts", "src/schema/documentVersionPolicy.ts"],
        reason: "Canonical persisted input remains package v2/document v3 and keeps active parser/runtime authority.",
      },
      {
        id: "package-v3-document-v4-target-parser",
        owner: "core",
        packageVersion: 3,
        documentVersion: 4,
        disposition: "retained-for-migration",
        paths: ["src/persistence/packageV3.ts", "src/runtime/readOnlySessionV4.ts"],
        reason: "Package v3/document v4 is a recognized migration target with read-only validation, not an active runtime pair.",
      },
      {
        id: "package-v2-to-v3-explicit-copy-forward-migration",
        owner: "core",
        packageVersion: 2,
        documentVersion: 3,
        targetPackageVersion: 3,
        targetDocumentVersion: 4,
        disposition: "retained-for-migration",
        paths: ["src/migration/packageV2ToV3.ts", "src/migration/packageV2ToV3Types.ts"],
        reason: "Core owns only the pure source-immutable semantic plan and target validation; Backend owns revisioned persistence.",
      },
      {
        id: "phase-258-consumer-evidence",
        owner: "core",
        packageVersion: 3,
        documentVersion: 4,
        disposition: "retained-for-evidence",
        paths: ["docs/VERSION_CAPABILITY_CONTRACT.md", "docs/PHASE_LEDGER.md"],
        reason: "Historical cross-repo capability evidence remains useful but does not activate the v4 runtime.",
      },
      {
        id: "silent-read-normalization-or-compatibility-adapter",
        owner: "core",
        packageVersion: 2,
        documentVersion: 3,
        targetPackageVersion: 3,
        targetDocumentVersion: 4,
        disposition: "blocked",
        paths: ["docs/WORKSPACE_BOUNDARY.md", "docs/LEGACY_MIGRATION_GATE.md"],
        reason: "Silent read normalization and exported compatibility adapters are explicitly blocked; migration must stay an explicit copy-forward plan.",
      },
    ])
    expect(inventory.filter((item) => item.disposition === "deleted"))
      .toEqual([])
    expect(inventory.every((item) => item.paths.length > 0 && item.reason.length > 0))
      .toBe(true)
  })

  it("publishes Phase 258 navigation and remaining activation ownership", () => {
    const doc = readFileSync(new URL("../docs/VERSION_CAPABILITY_CONTRACT.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("## Version Matrix")
    expect(doc).toContain("## Version Surface Retirement Inventory")
    expect(doc).toContain("## Cross-Repo Reporting")
    expect(doc).toContain("retained-for-migration")
    expect(doc).toContain("retained-for-evidence")
    expect(doc).toContain("blocked")
    expect(doc).toContain("v4-remaining-operation-layout-render-support")
    expect(doc).toContain("canCreateReadOnlySession")
    expect(readme).toContain("docs/VERSION_CAPABILITY_CONTRACT.md")
    expect(ledger).toContain("| 258 | Cross-repo version capability reporting | done |")
    expect(ledger).toContain("## Phase 258 Cross-Repo Version Capability Reporting")
  })
})
