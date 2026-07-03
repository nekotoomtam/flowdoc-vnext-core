import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("core non-route deprecation window", () => {
  it("keeps NR-A deprecation markers as historical evidence after source deletion", () => {
    const sessionStorage = readText("src/authoring/sessionStorage.ts")
    const richInlinePersistence = readText("src/authoring/richInlineSessionPersistence.ts")
    const submissionState = readText("src/workflow/submissionState.ts")
    const audit = readText("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")

    expect(sessionStorage).toContain("createVNextSessionPackageSnapshot")
    expect(sessionStorage).not.toContain("@deprecated Window NR-A compatibility export")
    expect(sessionStorage).not.toContain("createVNextSessionStorageRecord")

    expect(richInlinePersistence).toContain("createVNextRichInlineReplayValidation")
    expect(richInlinePersistence).not.toContain("@deprecated Window NR-A compatibility export")
    expect(richInlinePersistence).not.toContain("createVNextRichInlineSessionPersistenceRecord")

    expect(submissionState).toContain("createVNextSubmissionIdentityStatus")
    expect(submissionState).not.toContain("@deprecated Window NR-A compatibility export")
    expect(submissionState).not.toContain("createVNextSubmissionStateRecord")
    expect(audit).toContain("Phase 246")
  })

  it("keeps public entrypoint removal after NR-C and source deletion", () => {
    const index = readText("src/index.ts")
    const doc = readText("docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md")

    expect(index).not.toContain('export * from "./authoring/sessionStorage.js"')
    expect(index).not.toContain('export * from "./authoring/richInlineSessionPersistence.js"')
    expect(index).not.toContain('export * from "./workflow/submissionState.js"')
    expect(doc).toContain("Public entrypoint compatibility remains.")
    expect(doc).toContain("They remain public from `src/index.ts` during Window NR-A.")
    expect(readText("docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md")).toContain("Status: Phase 246")
  })

  it("keeps retained core owners and backend replacements explicit", () => {
    const doc = readText("docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md")
    const closeout = readText("docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md")
    const consumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const retention = readText("docs/CORE_RETENTION_MAP.md")
    const splitMap = readText("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")

    expect(doc).toContain("flowdoc-vnext-backend/src/storage/sessionRecord.ts")
    expect(doc).toContain("flowdoc-vnext-backend/src/storage/richInlineSessionRecord.ts")
    expect(doc).toContain("flowdoc-vnext-backend/src/routes/submissionRoute.ts")
    expect(doc).toContain("createVNextSessionPackageSnapshot")
    expect(doc).toContain("createVNextRichInlineReplayPatchValidation")
    expect(doc).toContain("createVNextRichInlineReplayValidation")
    expect(doc).toContain("createVNextSubmissionIdentityStatus")
    expect(closeout).toContain("Complete in")
    expect(closeout).toContain("docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md")
    expect(consumerMap).toContain("Window NR-A deprecation markers are complete")
    expect(retention).toContain("Window NR-A deprecation markers are complete")
    expect(splitMap).toContain("Window NR-A deprecation markers are complete")
  })

  it("publishes the non-route deprecation window in repo navigation", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(readme).toContain("Core Non-Route Deprecation Window")
    expect(readme).toContain("docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md")
    expect(ledger).toContain("| 237 | Core non-route deprecation window | done |")
    expect(ledger).toContain("## Phase 237 Core Non-Route Deprecation Window")
    expect(ledger).toContain("Window NR-A")
    expect(ledger).toContain("Window NR-B")
    expect(ledger).toContain("Window NR-C")
  })
})
