import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  VNEXT_CORE_VERSION_CAPABILITY_CONTRACT,
  VNEXT_VERSION_CAPABILITY_CONTRACT_VERSION,
  getVNextCoreVersionSupport,
  inspectVNextPackageVersionCapability,
} from "../src/index.js"

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

  it("publishes Phase 258 navigation and remaining activation ownership", () => {
    const doc = readFileSync(new URL("../docs/VERSION_CAPABILITY_CONTRACT.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("## Version Matrix")
    expect(doc).toContain("## Cross-Repo Reporting")
    expect(doc).toContain("v4-remaining-operation-layout-render-support")
    expect(doc).toContain("canCreateReadOnlySession")
    expect(readme).toContain("docs/VERSION_CAPABILITY_CONTRACT.md")
    expect(ledger).toContain("| 258 | Cross-repo version capability reporting | done |")
    expect(ledger).toContain("## Phase 258 Cross-Repo Version Capability Reporting")
  })
})
