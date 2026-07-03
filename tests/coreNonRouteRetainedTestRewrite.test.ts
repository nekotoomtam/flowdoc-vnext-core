import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function expectNoNamedImportFrom(source: string, moduleSpecifier: string, importName: string): void {
  const publicImports = [...source.matchAll(new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s+"${escapeRegExp(moduleSpecifier)}"`, "g"))]
    .map((match) => match[1])
    .join("\n")

  expect(publicImports).not.toMatch(new RegExp(`\\b${importName}\\b`))
}

function expectNoPublicEntrypointImport(source: string, helperName: string): void {
  expectNoNamedImportFrom(source, "../src/index.js", helperName)
}

describe("core non-route retained-test rewrite", () => {
  const compatibilityTests = [
    "tests/sessionPackageSnapshot.test.ts",
    "tests/richInlineReplayValidation.test.ts",
    "tests/submissionIdentityStatus.test.ts",
    "tests/backendRouteStorageBinding.test.ts",
    "tests/richInlineLiveExactParityAudit.test.ts",
    "tests/storageAdapter.test.ts",
    "tests/verticalSliceStorageSimulation.test.ts",
    "tests/verticalSliceRcEndToEnd.test.ts",
  ]

  it("rewrites historical boundary tests to retained helper facts", () => {
    const sessionStorageTest = readText("tests/sessionStorage.test.ts")
    const richInlinePersistenceTest = readText("tests/richInlineSessionPersistence.test.ts")
    const submissionStateTest = readText("tests/submissionState.test.ts")

    expect(sessionStorageTest).toContain("createVNextSessionPackageSnapshot")
    expect(sessionStorageTest).toContain("VNEXT_SESSION_PACKAGE_SNAPSHOT_SOURCE")
    expect(sessionStorageTest).toContain("storageRecord: false")
    expectNoPublicEntrypointImport(sessionStorageTest, "createVNextSessionStorageRecord")

    expect(richInlinePersistenceTest).toContain("createVNextRichInlineReplayValidation")
    expect(richInlinePersistenceTest).toContain("VNEXT_RICH_INLINE_REPLAY_VALIDATION_SOURCE")
    expect(richInlinePersistenceTest).toContain("storageWrites: false")
    expectNoPublicEntrypointImport(richInlinePersistenceTest, "createVNextRichInlineSessionPersistenceRecord")

    expect(submissionStateTest).toContain("createVNextSubmissionIdentityStatus")
    expect(submissionStateTest).toContain("VNEXT_SUBMISSION_IDENTITY_STATUS_SOURCE")
    expect(submissionStateTest).toContain("workflowEngine: false")
    expectNoPublicEntrypointImport(submissionStateTest, "createVNextSubmissionStateRecord")
  })

  it("keeps compatibility tests explicit but off the public deprecated helper imports", () => {
    const doc = readText("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")
    for (const testPath of compatibilityTests) {
      const source = readText(testPath)

      expect(doc).toContain(testPath)
      expectNoPublicEntrypointImport(source, "createVNextSessionStorageRecord")
      expectNoPublicEntrypointImport(source, "createVNextRichInlineSessionPersistenceRecord")
      expectNoPublicEntrypointImport(source, "createVNextSubmissionStateRecord")
    }

    expect(readText("tests/sessionPackageSnapshot.test.ts")).toContain("../src/authoring/sessionStorage.js")
    expect(readText("tests/richInlineReplayValidation.test.ts")).toContain("../src/authoring/richInlineSessionPersistence.js")
    expect(readText("tests/submissionIdentityStatus.test.ts")).toContain("../src/workflow/submissionState.js")
    expect(doc).toContain("Public-Entrypoint Test Cleanup")
    expect(doc).toContain("createVNextSessionStorageRecord(...)")
    expect(doc).toContain("createVNextRichInlineSessionPersistenceRecord(...)")
    expect(doc).toContain("createVNextSubmissionStateRecord(...)")
    expect(doc).toContain("treated as proof that core owns")
  })

  it("keeps public entrypoint compatibility until Window NR-C", () => {
    const index = readText("src/index.ts")
    const doc = readText("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")

    expect(index).toContain("./authoring/sessionStorage.js")
    expect(index).toContain("./authoring/richInlineSessionPersistence.js")
    expect(index).toContain("./workflow/submissionState.js")
    expect(doc).toContain("Window NR-B does not remove public exports.")
    expect(doc).toContain("Window NR-C can now narrow the core test-facing public surface")
  })

  it("rewires old concrete package lanes off public compatibility helpers", () => {
    const packageSources = [
      "packages/internal-alpha-runner/src/internalAlphaRecords.ts",
      "packages/internal-alpha-runner/src/internalAlphaVerticalSlice.ts",
      "packages/internal-alpha-runner/src/storageBackedRcRoundtrip.ts",
      "packages/internal-alpha-runner/src/storageRouteBinding.ts",
      "packages/storage-file-json/src/index.ts",
    ]
    const deprecatedPublicNames = [
      "createVNextSessionStorageRecord",
      "createVNextRichInlineSessionPersistenceRecord",
      "createVNextSubmissionStateRecord",
      "VNextSessionStorageRecord",
      "VNextRichInlineSessionPersistenceRecord",
    ]

    for (const sourcePath of packageSources) {
      const source = readText(sourcePath)

      for (const importName of deprecatedPublicNames) {
        expectNoNamedImportFrom(source, "@flowdoc/vnext-core", importName)
      }
    }

    const packageRecords = readText("packages/internal-alpha-runner/src/internalAlphaRecords.ts")
    const fileJsonAdapter = readText("packages/storage-file-json/src/index.ts")
    const doc = readText("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")

    expect(packageRecords).toContain("createVNextSessionPackageSnapshot")
    expect(packageRecords).toContain("createVNextRichInlineReplayValidation")
    expect(fileJsonAdapter).toContain("packageSessions: FlowDocFileJsonStorageCollection<unknown>")
    expect(fileJsonAdapter).toContain("richInlineSessions: FlowDocFileJsonStorageCollection<unknown>")
    expect(doc).toContain("Package-Lane Cleanup")
  })

  it("publishes Window NR-B in repo navigation", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const deprecation = readText("docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md")
    const closeout = readText("docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md")
    const consumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const retention = readText("docs/CORE_RETENTION_MAP.md")
    const splitMap = readText("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")

    expect(readme).toContain("Core Non-Route Retained-Test Rewrite")
    expect(readme).toContain("Core Non-Route Public-Entrypoint Test Cleanup")
    expect(readme).toContain("Core Non-Route Package-Lane Cleanup")
    expect(readme).toContain("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")
    expect(ledger).toContain("| 238 | Core non-route retained-test rewrite | done |")
    expect(ledger).toContain("| 239 | Core non-route public-entrypoint test cleanup | done |")
    expect(ledger).toContain("| 240 | Core non-route package-lane cleanup | done |")
    expect(ledger).toContain("## Phase 238 Core Non-Route Retained-Test Rewrite")
    expect(ledger).toContain("## Phase 239 Core Non-Route Public-Entrypoint Test Cleanup")
    expect(ledger).toContain("## Phase 240 Core Non-Route Package-Lane Cleanup")
    expect(deprecation).toContain("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")
    expect(closeout).toContain("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")
    expect(consumerMap).toContain("Window NR-B retained-test rewrite/public-entrypoint test")
    expect(retention).toContain("retained-test rewrite and public-entrypoint test cleanup")
    expect(splitMap).toContain("Window NR-B retained-test")
  })
})
