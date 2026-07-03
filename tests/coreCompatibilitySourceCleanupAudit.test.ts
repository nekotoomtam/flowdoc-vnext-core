import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

function collectFiles(dir: string, predicate: (path: string) => boolean): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    const stat = statSync(path)

    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "dist" || entry === "coverage") return []
      return collectFiles(path, predicate)
    }

    return predicate(path) ? [path] : []
  })
}

function repoPath(path: string): string {
  return relative(repoRoot, path).replace(/\\/g, "/")
}

function hasNamedImport(source: string, importName: string): boolean {
  const imports = source.matchAll(/import\s*\{([\s\S]*?)\}\s*from\s+["'][^"']+["']/g)

  for (const match of imports) {
    if (new RegExp(`\\b${importName}\\b`).test(match[1])) return true
  }

  return false
}

describe("core compatibility source cleanup audit", () => {
  const compatibilityImportAllowlist: Record<string, string[]> = {
    createVNextSessionStorageRecord: [
      "src/authoring/richInlineSessionPersistence.ts",
    ],
    VNextSessionStorageRecord: [
      "src/authoring/richInlineSessionPersistence.ts",
    ],
    VNEXT_SESSION_STORAGE_SOURCE: [],
    VNEXT_SESSION_STORAGE_MODE: [],
    createVNextRichInlineSessionPersistenceRecord: [],
    VNextRichInlineSessionPersistenceRecord: [],
    VNEXT_RICH_INLINE_SESSION_PERSISTENCE_SOURCE: [],
    VNEXT_RICH_INLINE_SESSION_PERSISTENCE_MODE: [],
    createVNextSubmissionStateRecord: [],
    VNextSubmissionStateRecord: [],
    VNEXT_SUBMISSION_STATE_SOURCE: [],
    VNEXT_SUBMISSION_STATE_MODE: [],
  }

  it("documents short-lived compatibility source cleanup debt", () => {
    const doc = readText("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")
    const requiredSections = [
      "## Purpose",
      "## Cleanup Rule",
      "## Remaining Compatibility Helpers",
      "## Current Allowlist",
      "## Recommended Removal Order",
      "## Exit Criteria",
      "## PASS",
      "## RISK",
      "## Intentionally Not Changed",
    ]
    const requiredPhrases = [
      "short-lived cleanup debt",
      "removal candidates, not retained core API",
      "Do not add new public exports",
      "Do not add new owner-module imports",
      "The allowlist above is empty",
      "Remove the owner-module compatibility helpers",
    ]

    for (const section of requiredSections) {
      expect(doc).toContain(section)
    }
    for (const phrase of requiredPhrases) {
      expect(doc).toContain(phrase)
    }
    for (const helperName of Object.keys(compatibilityImportAllowlist)) {
      expect(doc).toContain(helperName)
    }
    for (const allowlistedPaths of Object.values(compatibilityImportAllowlist)) {
      for (const path of allowlistedPaths) {
        expect(doc).toContain(path)
      }
    }
  })

  it("keeps compatibility helper source comments pointed at the cleanup audit", () => {
    const sourcePaths = [
      "src/authoring/sessionStorage.ts",
      "src/authoring/richInlineSessionPersistence.ts",
      "src/workflow/submissionState.ts",
    ]

    for (const sourcePath of sourcePaths) {
      const source = readText(sourcePath)

      expect(source).toContain("@deprecated Window NR-A compatibility export")
      expect(source).toContain("Window NR-C removed this helper from the public package entrypoint")
      expect(source).toContain("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")
    }
  })

  it("prevents the owner-module compatibility import allowlist from growing silently", () => {
    const sourceFiles = [
      ...collectFiles(join(repoRoot, "src"), (path) => path.endsWith(".ts")),
      ...collectFiles(join(repoRoot, "tests"), (path) => path.endsWith(".ts")),
      ...collectFiles(join(repoRoot, "packages"), (path) => path.endsWith(".ts")),
    ]

    for (const [importName, expectedPaths] of Object.entries(compatibilityImportAllowlist)) {
      const actualPaths = sourceFiles
        .filter((path) => hasNamedImport(readFileSync(path, "utf8"), importName))
        .map(repoPath)
        .sort()

      expect(actualPaths).toEqual([...expectedPaths].sort())
    }
  })

  it("keeps NR-C public narrowing intact while source cleanup is pending", () => {
    const index = readText("src/index.ts")
    const storageAdapter = readText("src/persistence/storageAdapter.ts")

    for (const importName of Object.keys(compatibilityImportAllowlist)) {
      expect(index).not.toMatch(new RegExp(`\\b${importName}\\b`))
    }
    expect(index).toContain("createVNextSessionPackageSnapshot")
    expect(index).toContain("createVNextRichInlineReplayValidation")
    expect(index).toContain("createVNextSubmissionIdentityStatus")
    expect(storageAdapter).toContain("packageSessions: VNextStorageCollection<unknown>")
    expect(storageAdapter).toContain("richInlineSessions: VNextStorageCollection<unknown>")
  })

  it("publishes the cleanup audit in repo navigation", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const nonRoute = readText("docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")
    const retention = readText("docs/CORE_RETENTION_MAP.md")
    const consumer = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const splitMap = readText("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")

    expect(readme).toContain("Core Compatibility Source Cleanup Audit")
    expect(readme).toContain("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")
    expect(ledger).toContain("| 242 | Core compatibility source cleanup audit | done |")
    expect(ledger).toContain("| 243 | Core vertical-slice retained storage payload rewrite | done |")
    expect(ledger).toContain("| 244 | Core storage adapter generic payload rewrite | done |")
    expect(ledger).toContain("| 245 | Core compatibility composition test rewrite | done |")
    expect(ledger).toContain("## Phase 242 Core Compatibility Source Cleanup Audit")
    expect(ledger).toContain("## Phase 243 Core Vertical-Slice Retained Storage Payload Rewrite")
    expect(ledger).toContain("## Phase 244 Core Storage Adapter Generic Payload Rewrite")
    expect(ledger).toContain("## Phase 245 Core Compatibility Composition Test Rewrite")
    expect(nonRoute).toContain("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")
    expect(retention).toContain("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")
    expect(consumer).toContain("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")
    expect(splitMap).toContain("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")
  })
})
