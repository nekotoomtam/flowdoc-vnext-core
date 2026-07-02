import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("core session rich workflow split map", () => {
  it("documents the three remaining split-before-move areas with source evidence", () => {
    const doc = readText("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")
    const requiredSections = [
      "## Purpose",
      "## Source Evidence",
      "## Split Matrix",
      "## Retained Core Contract Names",
      "## Backend-Owned Concerns",
      "## Current Public Export Decision",
      "## Next Implementation Order",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
    ]
    const requiredEvidence = [
      "src/authoring/sessionStorage.ts",
      "tests/sessionStorage.test.ts",
      "docs/SESSION_STORAGE_BOUNDARY.md",
      "createVNextSessionStorageRecord",
      "src/authoring/richInlineSessionPersistence.ts",
      "tests/richInlineSessionPersistence.test.ts",
      "docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md",
      "createVNextRichInlineSessionPersistenceRecord",
      "createVNextRichInlineReplayPatchRecord",
      "src/workflow/submissionState.ts",
      "tests/submissionState.test.ts",
      "docs/SUBMISSION_STATE_BOUNDARY.md",
      "createVNextSubmissionStateRecord",
    ]

    for (const section of requiredSections) {
      expect(doc).toContain(section)
    }
    for (const evidence of requiredEvidence) {
      expect(doc).toContain(evidence)
    }

    expect(doc).toContain("Session package snapshot")
    expect(doc).toContain("Rich-inline replay validation")
    expect(doc).toContain("Submission workflow identity")
    expect(doc).toContain("split first")
    expect(doc).toContain("split second")
    expect(doc).toContain("split third")
  })

  it("keeps current exports stable while marking them as non-final ownership", () => {
    const doc = readText("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")
    const index = readText("src/index.ts")
    const exportedPaths = [
      "./authoring/sessionStorage.js",
      "./authoring/richInlineSessionPersistence.js",
      "./workflow/submissionState.js",
    ]

    for (const exportedPath of exportedPaths) {
      expect(index).toContain(exportedPath)
      expect(doc).toContain(exportedPath)
    }

    expect(doc).toContain("They should not be treated as final core ownership.")
    expect(doc).toContain("No public export removed.")
  })

  it("guards retained facts and backend-owned execution boundaries in source", () => {
    const sessionStorage = readText("src/authoring/sessionStorage.ts")
    const richInline = readText("src/authoring/richInlineSessionPersistence.ts")
    const submissionState = readText("src/workflow/submissionState.ts")

    expect(sessionStorage).toContain("serializeFlowDocPackageV2DocumentVNext")
    expect(sessionStorage).toContain('storageStatus: "not-written"')
    expect(sessionStorage).toContain("selection: false")
    expect(sessionStorage).toContain("dirtyScopes: false")
    expect(richInline).toContain("createVNextSessionStorageRecord")
    expect(richInline).toContain("createVNextDurableHistorySnapshot")
    expect(richInline).toContain("createVNextRichInlineReplayPatchRecord")
    expect(richInline).toContain('executionStatus: "not-run"')
    expect(richInline).toContain('backendApi: "not-called"')
    expect(submissionState).toContain("externalSubmissionState: true")
    expect(submissionState).toContain('packageMutation: "not-run"')
    expect(submissionState).toContain('storageWrite: "not-written"')
    expect(submissionState).toContain('routeDispatch: "not-run"')

    const combined = `${sessionStorage}\n${richInline}\n${submissionState}`
    expect(combined).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(combined).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(combined).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(combined).not.toContain("fetch(")
    expect(combined).not.toContain("/api/")
    expect(combined).not.toMatch(/\bwriteFile\(|\bcreateWriteStream\(|\bappendFile\(|\bmkdir\(|\brm\(/)
  })

  it("aligns retention and consumer maps with the new split map", () => {
    const splitMap = readText("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")
    const retention = readText("docs/CORE_RETENTION_MAP.md")
    const consumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")

    expect(retention).toContain("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")
    expect(retention).toContain("package snapshot facts")
    expect(retention).toContain("rich-inline replay-patch validation")
    expect(retention).toContain("identity/status facts")
    expect(consumerMap).toContain("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")
    expect(consumerMap).toContain("split map exists")
    expect(splitMap).toContain("packageSnapshot")
    expect(splitMap).toContain("richInlineReplayPatchValidation")
    expect(splitMap).toContain("submissionIdentityFacts")
  })

  it("publishes the split map in repo navigation", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(readme).toContain("Core Session Rich Workflow Split Map")
    expect(readme).toContain("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")
    expect(ledger).toContain("| 232 | Core session rich workflow split map | done |")
    expect(ledger).toContain("## Phase 232 Core Session Rich Workflow Split Map")
  })
})
