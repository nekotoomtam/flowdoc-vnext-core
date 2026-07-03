import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

function expectNoPublicEntrypointImport(source: string, helperName: string): void {
  const publicImports = [...source.matchAll(/import\s*\{([\s\S]*?)\}\s*from\s+"..\/src\/index\.js"/g)]
    .map((match) => match[1])
    .join("\n")

  expect(publicImports).not.toMatch(new RegExp(`\\b${helperName}\\b`))
}

describe("core non-route retained-test rewrite", () => {
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

  it("keeps remaining compatibility tests explicit before Window NR-C", () => {
    const doc = readText("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")
    const remainingCompatibilityTests = [
      "tests/sessionPackageSnapshot.test.ts",
      "tests/richInlineReplayValidation.test.ts",
      "tests/submissionIdentityStatus.test.ts",
      "tests/backendRouteStorageBinding.test.ts",
      "tests/richInlineLiveExactParityAudit.test.ts",
      "tests/storageAdapter.test.ts",
      "tests/verticalSliceStorageSimulation.test.ts",
      "tests/verticalSliceRcEndToEnd.test.ts",
    ]

    for (const testPath of remainingCompatibilityTests) {
      expect(doc).toContain(testPath)
    }

    expect(doc).toContain("first NR-B slice")
    expect(doc).toContain("createVNextSessionStorageRecord(...)")
    expect(doc).toContain("createVNextRichInlineSessionPersistenceRecord(...)")
    expect(doc).toContain("createVNextSubmissionStateRecord(...)")
    expect(doc).toContain("must not be treated as proof that core owns")
  })

  it("keeps public entrypoint compatibility until Window NR-C", () => {
    const index = readText("src/index.ts")
    const doc = readText("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")

    expect(index).toContain("./authoring/sessionStorage.js")
    expect(index).toContain("./authoring/richInlineSessionPersistence.js")
    expect(index).toContain("./workflow/submissionState.js")
    expect(doc).toContain("Window NR-B does not remove public exports.")
    expect(doc).toContain("Window NR-C should narrow the public surface")
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
    expect(readme).toContain("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")
    expect(ledger).toContain("| 238 | Core non-route retained-test rewrite | done |")
    expect(ledger).toContain("## Phase 238 Core Non-Route Retained-Test Rewrite")
    expect(deprecation).toContain("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")
    expect(closeout).toContain("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")
    expect(consumerMap).toContain("Window NR-B first retained-test rewrite slice")
    expect(retention).toContain("Window NR-B first retained-test rewrite slice")
    expect(splitMap).toContain("Window NR-B first retained-test rewrite slice")
  })
})
