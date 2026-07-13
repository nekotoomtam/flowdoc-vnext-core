import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("sequential whole-document v4 readiness close audit", () => {
  const doc = read("../docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_READINESS_CLOSE_AUDIT.md")

  it("closes core evidence while retaining exact consumer blockers", () => {
    for (const section of [
      "## Evidence Chain", "## Contract Readiness", "## Semantic Readiness",
      "## Failure Readiness", "## Scale Readiness", "## Cross-Repo Gate",
      "## Consumer Boundary", "## Next Lane", "## PASS", "## FAIL / BLOCKER",
      "## RISK", "## UNKNOWN", "## Files Changed", "## Behavior Changed",
      "## Tests Run", "## Risks Left", "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("core: 327 test files / 1,583 tests")
    expect(doc).toContain("editor: 27 test files / 157 tests")
    expect(doc).toContain("backend: 13 test files / 45 tests")
    expect(doc).toContain("Editor and backend source worktrees required no sequential-composer changes")
    expect(doc).toContain("250 real ordered pages through 500 pure calls")
  })

  it("supersedes historical blockers and selects backend architecture without activating consumers", () => {
    expect(doc).toContain("supersedes earlier historical readiness statements")
    expect(doc).toContain("does not activate a backend job")
    expect(read("../README.md")).toContain("Phase 384 closes core sequential-composer readiness")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 384 closes core sequential-composer readiness")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 384 Sequential Whole-Document V4 Readiness Close Audit")
    expect(doc).toContain("Open the backend durable composition scheduler architecture lock")
  })
})
