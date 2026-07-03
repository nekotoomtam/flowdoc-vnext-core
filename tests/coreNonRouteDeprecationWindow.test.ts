import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("core non-route deprecation window", () => {
  it("marks non-route service-shaped helper exports as deprecated compatibility helpers", () => {
    const sessionStorage = readText("src/authoring/sessionStorage.ts")
    const richInlinePersistence = readText("src/authoring/richInlineSessionPersistence.ts")
    const submissionState = readText("src/workflow/submissionState.ts")

    expect(sessionStorage).toContain("@deprecated Window NR-A compatibility export")
    expect(sessionStorage).toContain("flowdoc-vnext-backend/src/storage/sessionRecord.ts")
    expect(sessionStorage).toContain("createVNextSessionPackageSnapshot")
    expect(sessionStorage).toContain("createVNextSessionStorageRecord")

    expect(richInlinePersistence).toContain("@deprecated Window NR-A compatibility export")
    expect(richInlinePersistence).toContain("flowdoc-vnext-backend/src/storage/richInlineSessionRecord.ts")
    expect(richInlinePersistence).toContain("createVNextRichInlineReplayValidation")
    expect(richInlinePersistence).toContain("createVNextRichInlineSessionPersistenceRecord")

    expect(submissionState).toContain("@deprecated Window NR-A compatibility export")
    expect(submissionState).toContain("flowdoc-vnext-backend/src/routes/submissionRoute.ts")
    expect(submissionState).toContain("createVNextSubmissionIdentityStatus")
    expect(submissionState).toContain("createVNextSubmissionStateRecord")
  })

  it("keeps public entrypoint compatibility during Window NR-A", () => {
    const index = readText("src/index.ts")
    const doc = readText("docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md")

    expect(index).toContain("./authoring/sessionStorage.js")
    expect(index).toContain("./authoring/richInlineSessionPersistence.js")
    expect(index).toContain("./workflow/submissionState.js")
    expect(doc).toContain("Public entrypoint compatibility remains.")
    expect(doc).toContain("They remain public from `src/index.ts` during Window NR-A.")
    expect(doc).toContain("Window NR-C removal is still blocked")
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
