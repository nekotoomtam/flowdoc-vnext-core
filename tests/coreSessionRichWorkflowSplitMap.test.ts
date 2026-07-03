import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("core session rich workflow split map", () => {
  it("documents the split-before-move areas with source evidence", () => {
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
      "createVNextSessionPackageSnapshot",
      "createVNextSessionStorageRecord",
      "tests/sessionPackageSnapshot.test.ts",
      "src/authoring/richInlineSessionPersistence.ts",
      "tests/richInlineReplayValidation.test.ts",
      "tests/richInlineSessionPersistence.test.ts",
      "docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md",
      "createVNextRichInlineReplayPatchValidation",
      "createVNextRichInlineReplayValidation",
      "createVNextRichInlineSessionPersistenceRecord",
      "createVNextRichInlineReplayPatchRecord",
      "src/workflow/submissionState.ts",
      "tests/submissionIdentityStatus.test.ts",
      "tests/submissionState.test.ts",
      "docs/SUBMISSION_STATE_BOUNDARY.md",
      "createVNextSubmissionIdentityStatus",
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
    expect(doc).toContain("session package snapshot split is")
    expect(doc).toContain("rich-inline replay validation split is")
    expect(doc).toContain("identity/status split is complete")
    expect(doc).toContain("backend consumer rewiring is recorded")
    expect(doc).toContain("split complete")
  })

  it("keeps public exports narrowed to retained facts while source evidence stays owner-local", () => {
    const doc = readText("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")
    const index = readText("src/index.ts")
    const removedExports = [
      'export * from "./authoring/sessionStorage.js"',
      'export * from "./authoring/richInlineSessionPersistence.js"',
      'export * from "./workflow/submissionState.js"',
      "createVNextSessionStorageRecord",
      "createVNextRichInlineSessionPersistenceRecord",
      "createVNextSubmissionStateRecord",
    ]
    const retainedExports = [
      "createVNextSessionPackageSnapshot",
      "createVNextRichInlineReplayValidation",
      "createVNextSubmissionIdentityStatus",
    ]

    for (const removed of removedExports) {
      expect(index).not.toContain(removed)
    }
    for (const retained of retainedExports) {
      expect(index).toContain(retained)
      expect(doc).toContain(retained)
    }

    expect(doc).toContain("Window NR-C public export narrowing is complete")
    expect(doc).toContain("source deletion is complete")
    expect(doc).toContain("Window NR-A")
    expect(doc).toContain("Window NR-B")
    expect(doc).toContain("Window NR-C")
    expect(doc).toContain("Public non-route service-shaped exports are removed from `src/index.ts`.")
  })

  it("guards retained facts and backend-owned execution boundaries in source", () => {
    const sessionStorage = readText("src/authoring/sessionStorage.ts")
    const richInline = readText("src/authoring/richInlineSessionPersistence.ts")
    const submissionState = readText("src/workflow/submissionState.ts")

    expect(sessionStorage).toContain("serializeFlowDocPackageV2DocumentVNext")
    expect(sessionStorage).toContain("storageRecord: false")
    expect(sessionStorage).toContain("storageKey: false")
    expect(sessionStorage).toContain("selection: false")
    expect(sessionStorage).toContain("dirtyScopes: false")
    expect(richInline).toContain("createVNextRichInlineReplayPatchValidation")
    expect(richInline).toContain("createVNextRichInlineReplayValidation")
    expect(richInline).toContain("createVNextRichInlineReplayPatchRecord")
    expect(richInline).toContain("storageRecord: false")
    expect(richInline).toContain("storageWrites: false")
    expect(richInline).not.toContain("createVNextSessionStorageRecord")
    expect(richInline).not.toContain("createVNextDurableHistorySnapshot")
    expect(submissionState).toContain("createVNextSubmissionIdentityStatus")
    expect(submissionState).toContain("submissionIdentityFacts: true")
    expect(submissionState).toContain("externalWorkflowStatusFacts: true")
    expect(submissionState).toContain("externalSubmissionState: true")
    expect(submissionState).toContain("packageMutation: false")
    expect(submissionState).toContain("storageWrite: false")
    expect(submissionState).toContain("routeDispatch: false")
    expect(submissionState).not.toContain("createVNextSubmissionStateRecord")

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

    expect(retention).toContain("docs/CORE_SUBMISSION_IDENTITY_STATUS_SPLIT.md")
    expect(retention).toContain("createVNextSessionPackageSnapshot")
    expect(retention).toContain("rich-inline replay-patch validation")
    expect(retention).toContain("createVNextSubmissionIdentityStatus")
    expect(consumerMap).toContain("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")
    expect(consumerMap).toContain("createVNextRichInlineReplayValidation")
    expect(consumerMap).toContain("createVNextSubmissionIdentityStatus")
    expect(consumerMap).toContain("9d0a850")
    expect(splitMap).toContain("packageSnapshot")
    expect(splitMap).toContain("richInlineReplayPatchValidation")
    expect(splitMap).toContain("submissionIdentityFacts")
  })

  it("publishes the split map in repo navigation", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(readme).toContain("Core Session Rich Workflow Split Map")
    expect(readme).toContain("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")
    expect(readme).toContain("Core Backend Consumer Rewire Closeout")
    expect(ledger).toContain("| 232 | Core session rich workflow split map | done |")
    expect(ledger).toContain("| 236 | Core backend consumer rewire closeout | done |")
    expect(ledger).toContain("## Phase 232 Core Session Rich Workflow Split Map")
    expect(ledger).toContain("## Phase 236 Core Backend Consumer Rewire Closeout")
  })
})
