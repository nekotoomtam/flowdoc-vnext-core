import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))
const backendRoot = join(repoRoot, "..", "flowdoc-vnext-backend")

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("core package-lane retirement guard", () => {
  const retiredCorePackageLaneTests = [
    "tests/storageFileJsonAdapter.test.ts",
    "tests/artifactByteStoreSlice.test.ts",
    "tests/storageBackedRcRoundtripSmoke.test.ts",
    "tests/backendRouteStorageBinding.test.ts",
    "tests/artifactJobExecutionSlice.test.ts",
    "tests/internalAlphaVerticalSlice.test.ts",
  ]

  const backendReplacementPaths = [
    "src/storage/fileJsonStorage.ts",
    "src/storage/storageRouteBinding.ts",
    "src/artifacts/artifactJobExecution.ts",
    "src/storage/sessionRecord.ts",
    "src/storage/richInlineSessionRecord.ts",
    "src/routes/submissionRoute.ts",
    "src/tests/fileJsonStorage.test.ts",
    "src/tests/storageRouteBinding.test.ts",
    "src/tests/artifactJobExecution.test.ts",
    "src/tests/richInlineSessionRecord.test.ts",
    "src/tests/submissionRoute.test.ts",
  ]

  const retiredCorePackageLaneDirectories = [
    "packages/storage-file-json",
    "packages/internal-alpha-runner",
  ]

  it("does not keep direct concrete package-lane behavior tests in core", () => {
    for (const testPath of retiredCorePackageLaneTests) {
      expect(existsSync(join(repoRoot, testPath)), `${testPath} should be retired from core tests`).toBe(false)
    }
  })

  it("removes old concrete package-lane source and root aliases from core", () => {
    const tsconfig = readText("tsconfig.json")
    const consumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const retentionMap = readText("docs/CORE_RETENTION_MAP.md")
    const retainedRewrite = readText("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")

    for (const packagePath of retiredCorePackageLaneDirectories) {
      expect(existsSync(join(repoRoot, packagePath)), `${packagePath} should be removed from core`).toBe(false)
    }

    expect(tsconfig).not.toContain("@flowdoc/storage-file-json")
    expect(tsconfig).not.toContain("@flowdoc/internal-alpha-runner")
    expect(`${consumerMap}\n${retentionMap}\n${retainedRewrite}`).toContain("old concrete package lane source/config is removed from core")
    expect(consumerMap).not.toContain("remove old core package source/config in the next cleanup")
    expect(retentionMap).not.toContain("old source/config is pending deletion only")
  })

  it("points current ownership evidence at backend replacement modules and tests", () => {
    const consumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const retentionMap = readText("docs/CORE_RETENTION_MAP.md")
    const retainedRewrite = readText("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")

    for (const backendPath of backendReplacementPaths) {
      expect(existsSync(join(backendRoot, backendPath)), `${backendPath} should exist in backend`).toBe(true)
      expect(`${consumerMap}\n${retentionMap}\n${retainedRewrite}`).toContain(`flowdoc-vnext-backend/${backendPath}`)
    }

    expect(consumerMap).toContain("backend package-lane parity and historical-test retirement are now proven")
    expect(retentionMap).toContain("direct core package-lane behavior tests are retired")
    expect(retainedRewrite).toContain("Package-Lane Test Retirement")
    expect(consumerMap).not.toContain("retire core package lane after historical tests are rewired or replaced")
    expect(retentionMap).not.toContain("old `packages/storage-file-json` lane remains migration evidence until removal")
  })
})
