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
    createVNextSessionStorageRecord: [],
    VNextSessionStorageRecord: [],
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
      "## Deleted Compatibility Helpers",
      "## Current Allowlist",
      "## Recommended Removal Order",
      "## Exit Criteria",
      "## PASS",
      "## RISK",
      "## Intentionally Not Changed",
    ]
    const requiredPhrases = [
      "short-lived cleanup debt",
      "removal candidates",
      "not retained",
      "Do not add new public exports",
      "Do not add new owner-module imports",
      "The allowlist above is empty",
      "Complete. Do not reintroduce compatibility helper source",
      "Compatibility helper source implementations, types, and constants are",
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

  it("removes compatibility helper source while keeping retained facts", () => {
    const sessionStorage = readText("src/authoring/sessionStorage.ts")
    const richInline = readText("src/authoring/richInlineSessionPersistence.ts")
    const submission = readText("src/workflow/submissionState.ts")

    expect(sessionStorage).toContain("createVNextSessionPackageSnapshot")
    expect(richInline).toContain("createVNextRichInlineReplayValidation")
    expect(submission).toContain("createVNextSubmissionIdentityStatus")

    for (const [source, removedNames] of [
      [sessionStorage, ["createVNextSessionStorageRecord", "VNextSessionStorageRecord", "VNEXT_SESSION_STORAGE_SOURCE", "VNEXT_SESSION_STORAGE_MODE"]],
      [richInline, ["createVNextRichInlineSessionPersistenceRecord", "VNextRichInlineSessionPersistenceRecord", "VNEXT_RICH_INLINE_SESSION_PERSISTENCE_SOURCE", "VNEXT_RICH_INLINE_SESSION_PERSISTENCE_MODE"]],
      [submission, ["createVNextSubmissionStateRecord", "VNextSubmissionStateRecord", "VNEXT_SUBMISSION_STATE_SOURCE", "VNEXT_SUBMISSION_STATE_MODE"]],
    ] as const) {
      for (const removedName of removedNames) {
        expect(source).not.toContain(removedName)
      }
    }
  })

  it("prevents the owner-module compatibility import allowlist from growing silently", () => {
    const sourceFiles = [
      ...collectFiles(join(repoRoot, "src"), (path) => path.endsWith(".ts")),
      ...collectFiles(join(repoRoot, "tests"), (path) => path.endsWith(".ts")),
      ...collectFiles(join(repoRoot, "packages"), (path) => path.endsWith(".ts")),
    ].map((path) => ({ path, source: readFileSync(path, "utf8") }))

    for (const [importName, expectedPaths] of Object.entries(compatibilityImportAllowlist)) {
      const actualPaths = sourceFiles
        .filter(({ source }) => hasNamedImport(source, importName))
        .map(({ path }) => repoPath(path))
        .sort()

      expect(actualPaths).toEqual([...expectedPaths].sort())
    }
  }, 15_000)

  it("keeps NR-C public narrowing intact after source cleanup", () => {
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
    expect(ledger).toContain("| 246 | Core compatibility source deletion | done |")
    expect(ledger).toContain("## Phase 242 Core Compatibility Source Cleanup Audit")
    expect(ledger).toContain("## Phase 243 Core Vertical-Slice Retained Storage Payload Rewrite")
    expect(ledger).toContain("## Phase 244 Core Storage Adapter Generic Payload Rewrite")
    expect(ledger).toContain("## Phase 245 Core Compatibility Composition Test Rewrite")
    expect(ledger).toContain("## Phase 246 Core Compatibility Source Deletion")
    expect(nonRoute).toContain("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")
    expect(retention).toContain("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")
    expect(consumer).toContain("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")
    expect(splitMap).toContain("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")
  })
})
