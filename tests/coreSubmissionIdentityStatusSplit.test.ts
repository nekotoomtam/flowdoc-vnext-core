import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("core submission identity/status split", () => {
  it("documents the retained identity/status helper and historical compatibility record", () => {
    const doc = readText("docs/CORE_SUBMISSION_IDENTITY_STATUS_SPLIT.md")
    const requiredSections = [
      "## Purpose",
      "## Retained Core Contract",
      "## Compatibility Record",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
    ]

    for (const section of requiredSections) {
      expect(doc).toContain(section)
    }

    expect(doc).toContain("createVNextSubmissionIdentityStatus")
    expect(doc).toContain("createVNextSubmissionStateRecord")
    expect(doc).toContain('routeDispatch: "not-run"')
    expect(doc).toContain("removed from source in Phase 246")
  })

  it("keeps the retained helper public through the existing workflow module export", () => {
    const index = readText("src/index.ts")
    const source = readText("src/workflow/submissionState.ts")

    expect(index).toContain("./workflow/submissionState.js")
    expect(source).toContain("VNEXT_SUBMISSION_IDENTITY_STATUS_SOURCE")
    expect(source).toContain("VNEXT_SUBMISSION_IDENTITY_STATUS_MODE")
    expect(source).toContain("createVNextSubmissionIdentityStatus")
    expect(source).not.toContain("createVNextSubmissionStateRecord")
  })

  it("aligns split-map and navigation docs with the submission split", () => {
    const splitMap = readText("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")
    const boundary = readText("docs/SUBMISSION_STATE_BOUNDARY.md")
    const retention = readText("docs/CORE_RETENTION_MAP.md")
    const consumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(splitMap).toContain("identity/status split is complete")
    expect(boundary).toContain("createVNextSubmissionIdentityStatus")
    expect(retention).toContain("createVNextSubmissionIdentityStatus")
    expect(consumerMap).toContain("createVNextSubmissionIdentityStatus")
    expect(readme).toContain("Core Submission Identity Status Split")
    expect(readme).toContain("docs/CORE_SUBMISSION_IDENTITY_STATUS_SPLIT.md")
    expect(ledger).toContain("| 235 | Core submission identity/status split | done |")
    expect(ledger).toContain("## Phase 235 Core Submission Identity Status Split")
  })
})
