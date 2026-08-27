import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  VNEXT_CORE_CONSUMER_SURFACE_FREEZE,
  VNEXT_CORE_CONSUMER_SURFACE_FREEZE_VERSION,
} from "../src/index.js"
import type { VNextCoreConsumerSurfaceFreeze } from "../src/index.js"

describe("Core consumer surface freeze", () => {
  it("publishes a JSON-safe package consumer contract without changing the root export shape", () => {
    const freeze: VNextCoreConsumerSurfaceFreeze = VNEXT_CORE_CONSUMER_SURFACE_FREEZE
    const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
      exports: Record<string, string>
      private: boolean
    }

    expect(VNEXT_CORE_CONSUMER_SURFACE_FREEZE_VERSION).toBe(1)
    expect(packageJson.private).toBe(true)
    expect(packageJson.exports).toEqual({
      ".": "./src/index.ts",
      "./fixtures/*": "./fixtures/*",
    })
    expect(JSON.parse(JSON.stringify(freeze))).toEqual(freeze)
    expect(freeze).toEqual({
      contractVersion: 1,
      status: "frozen-for-planning",
      packageName: "@flowdoc/vnext-core",
      packagePrivate: true,
      activeEntrypoints: [
        {
          id: "root-entrypoint",
          importPath: "@flowdoc/vnext-core",
          disposition: "supported-current-private-root",
          consumerIds: ["backend-service-boundary", "editor-core-adapter"],
          removalStatus: "blocked",
          reason: "Backend still has broad direct root imports and Editor tests still import selected root symbols, so destructive narrowing remains a separate adoption lane.",
        },
        {
          id: "fixture-subpath",
          importPath: "@flowdoc/vnext-core/fixtures/*",
          disposition: "supported-fixture",
          consumerIds: ["backend-service-boundary", "editor-core-adapter"],
          removalStatus: "blocked",
          reason: "Backend and Editor fixtures use the exported fixture subpath for bounded local evidence and must move only with owner-repository tests.",
        },
      ],
      plannedSubpathGroups: [
        { id: "schema", importPath: "@flowdoc/vnext-core/schema", status: "planned-not-exported" },
        { id: "operations", importPath: "@flowdoc/vnext-core/operations", status: "planned-not-exported" },
        { id: "runtime", importPath: "@flowdoc/vnext-core/runtime", status: "planned-not-exported" },
        { id: "generation", importPath: "@flowdoc/vnext-core/generation", status: "planned-not-exported" },
        { id: "composition", importPath: "@flowdoc/vnext-core/composition", status: "planned-not-exported" },
        { id: "pagination", importPath: "@flowdoc/vnext-core/pagination", status: "planned-not-exported" },
        { id: "renderer", importPath: "@flowdoc/vnext-core/renderer", status: "planned-not-exported" },
        { id: "table", importPath: "@flowdoc/vnext-core/table", status: "planned-not-exported" },
        { id: "toc", importPath: "@flowdoc/vnext-core/toc", status: "planned-not-exported" },
        { id: "authoring", importPath: "@flowdoc/vnext-core/authoring", status: "planned-not-exported" },
      ],
      consumerGroups: [
        {
          id: "backend-service-boundary",
          owner: "backend",
          status: "supported-through-root-during-transition",
          allowedImportPaths: ["@flowdoc/vnext-core", "@flowdoc/vnext-core/fixtures/*"],
          requiredBoundary: "Backend must wrap Core document package, version capability, mutation, migration, composition, generation, artifact, and export facts behind Backend transport, revision, persistence, and service-readiness contracts.",
        },
        {
          id: "editor-core-adapter",
          owner: "editor",
          status: "facade-required",
          allowedImportPaths: ["@flowdoc/vnext-core", "@flowdoc/vnext-core/fixtures/*"],
          requiredBoundary: "Editor production code must import Core only through src/core/coreAdapter.ts; UI components, app state, Preview state, and Editor draft state must not import Core directly.",
        },
        {
          id: "future-frontend-redesign",
          owner: "editor",
          status: "blocked-direct-core-import",
          allowedImportPaths: [],
          requiredBoundary: "Future frontend redesign work must consume Backend document records or an Editor-owned adapter boundary until a separate public package boundary and adoption evidence approve direct Core imports.",
        },
      ],
      surfaceRecords: [
        {
          id: "document-package-v2-v3",
          owner: "core",
          disposition: "supported-consumer",
          terms: ["Document package"],
          paths: ["src/persistence/package.ts", "src/schema/documentVersionPolicy.ts"],
          consumerIds: ["backend-service-boundary", "editor-core-adapter"],
          reason: "Package v2/document v3 remains the canonical persisted Core document package input.",
        },
        {
          id: "version-capability-contract",
          owner: "core",
          disposition: "supported-consumer",
          terms: ["Package Version", "Capability Response"],
          paths: ["src/schema/versionCapability.ts#VNEXT_CORE_VERSION_CAPABILITY_CONTRACT"],
          consumerIds: ["backend-service-boundary", "editor-core-adapter"],
          reason: "Consumers can inspect package/document version facts without probing parsers.",
        },
        {
          id: "explicit-v2-to-v3-migration-plan",
          owner: "core",
          disposition: "retained-for-migration",
          terms: ["Migration Package"],
          paths: ["src/migration/packageV2ToV3.ts", "src/migration/packageV2ToV3Types.ts"],
          consumerIds: ["backend-service-boundary", "editor-core-adapter"],
          reason: "Core owns the source-immutable semantic migration plan; Backend owns revisioned persistence and Editor owns migration intent presentation.",
        },
        {
          id: "broad-root-entrypoint",
          owner: "core",
          disposition: "retained-for-transition",
          terms: ["Runtime"],
          paths: ["src/index.ts", "docs/CORE_PUBLIC_EXPORT_BOUNDARY_REVIEW.md"],
          consumerIds: ["backend-service-boundary", "editor-core-adapter"],
          reason: "The root entrypoint remains broad for private transition evidence and cannot be treated as a release API.",
        },
        {
          id: "direct-src-imports",
          owner: "core",
          disposition: "blocked",
          terms: ["Source and Target"],
          paths: ["docs/WORKSPACE_BOUNDARY.md", "docs/PACKAGE_CONSUMPTION_STRATEGY.md"],
          consumerIds: ["backend-service-boundary", "editor-core-adapter", "future-frontend-redesign"],
          reason: "Consumers must depend on exported package paths, not repository-internal src paths.",
        },
        {
          id: "backend-transport-storage-and-readiness",
          owner: "backend",
          disposition: "blocked",
          terms: ["Backend document record", "Backend Revision", "Storage Record"],
          paths: [],
          consumerIds: ["backend-service-boundary", "future-frontend-redesign"],
          reason: "Backend transport, revision gates, persistence, auth, tenancy, deployment, and service readiness are not Core-owned surfaces.",
        },
        {
          id: "editor-draft-preview-and-ui-state",
          owner: "editor",
          disposition: "blocked",
          terms: ["Editor draft", "Preview", "Outline Item"],
          paths: [],
          consumerIds: ["editor-core-adapter", "future-frontend-redesign"],
          reason: "Editor browser state, Preview behavior, UI state, and adapter presentation are not Core-owned surfaces.",
        },
        {
          id: "silent-compatibility-adapters",
          owner: "core",
          disposition: "blocked",
          terms: ["Runtime", "Migration Package"],
          paths: ["docs/WORKSPACE_BOUNDARY.md", "docs/LEGACY_MIGRATION_GATE.md"],
          consumerIds: ["backend-service-boundary", "editor-core-adapter", "future-frontend-redesign"],
          reason: "Silent read normalization and exported compatibility adapters remain prohibited; migration must stay explicit.",
        },
      ],
    })
  })

  it("keeps future frontend planning behind Backend records or Editor adapters", () => {
    const futureFrontend = VNEXT_CORE_CONSUMER_SURFACE_FREEZE.consumerGroups
      .find((consumer) => consumer.id === "future-frontend-redesign")
    const blockedSurfaces = VNEXT_CORE_CONSUMER_SURFACE_FREEZE.surfaceRecords
      .filter((surface) => surface.disposition === "blocked")
      .map((surface) => surface.id)

    expect(futureFrontend).toMatchObject({
      status: "blocked-direct-core-import",
      allowedImportPaths: [],
    })
    expect(futureFrontend?.requiredBoundary).toContain("Backend document records")
    expect(futureFrontend?.requiredBoundary).toContain("Editor-owned adapter")
    expect(blockedSurfaces).toEqual([
      "direct-src-imports",
      "backend-transport-storage-and-readiness",
      "editor-draft-preview-and-ui-state",
      "silent-compatibility-adapters",
    ])
  })

  it("documents the freeze as planning evidence rather than release readiness", () => {
    const doc = readFileSync(new URL("../docs/CORE_CONSUMER_SURFACE_FREEZE.md", import.meta.url), "utf8")

    expect(doc).toContain("Status: consumer-surface planning freeze")
    expect(doc).toContain("Future frontend redesign work must not import Core directly")
    expect(doc).toContain("This document does not publish Core")
    expect(doc).toContain("Backend document record")
    expect(doc).toContain("Editor draft")
    expect(doc).toContain("Preview")
    expect(doc).toContain("Document package")
    expect(doc).toContain("UNKNOWN")
  })
})
