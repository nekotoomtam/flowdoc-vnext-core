import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("core backend consumer rewire closeout", () => {
  it("records backend main evidence for the non-route consumer rewire", () => {
    const doc = readText("docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md")
    const requiredSections = [
      "## Purpose",
      "## Backend Evidence",
      "## Core Retained Truth",
      "## De-export Readiness",
      "## Next Window",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
    ]
    const requiredEvidence = [
      "flowdoc-vnext-backend",
      "9d0a850",
      "flowdoc-vnext-backend/src/storage/sessionRecord.ts",
      "flowdoc-vnext-backend/src/storage/richInlineSessionRecord.ts",
      "flowdoc-vnext-backend/src/routes/submissionRoute.ts",
      "flowdoc-vnext-backend/src/storage/storageRouteBinding.ts",
      "createVNextSessionPackageSnapshot",
      "createVNextRichInlineReplayValidation",
      "createVNextSubmissionIdentityStatus",
    ]

    for (const section of requiredSections) {
      expect(doc).toContain(section)
    }
    for (const evidence of requiredEvidence) {
      expect(doc).toContain(evidence)
    }

    expect(doc).toContain("do not import `createVNextSessionStorageRecord")
    expect(doc).toContain("createVNextRichInlineSessionPersistenceRecord")
    expect(doc).toContain("createVNextSubmissionStateRecord")
    expect(doc).toContain("Backend/editor consumer preconditions are now satisfied")
  })

  it("keeps public export removal out of the closeout patch", () => {
    const doc = readText("docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md")
    const index = readText("src/index.ts")

    expect(index).toContain("./authoring/sessionStorage.js")
    expect(index).toContain("./authoring/richInlineSessionPersistence.js")
    expect(index).toContain("./workflow/submissionState.js")
    expect(doc).toContain("Window NR-A")
    expect(doc).toContain("Window NR-B")
    expect(doc).toContain("Window NR-C")
    expect(doc).toContain("No public core export removed.")
  })

  it("publishes the closeout in repo navigation", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const consumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const retention = readText("docs/CORE_RETENTION_MAP.md")
    const splitMap = readText("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")

    expect(readme).toContain("Core Backend Consumer Rewire Closeout")
    expect(readme).toContain("docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md")
    expect(ledger).toContain("| 236 | Core backend consumer rewire closeout | done |")
    expect(ledger).toContain("## Phase 236 Core Backend Consumer Rewire Closeout")
    expect(consumerMap).toContain("docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md")
    expect(retention).toContain("docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md")
    expect(splitMap).toContain("docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md")
  })
})
