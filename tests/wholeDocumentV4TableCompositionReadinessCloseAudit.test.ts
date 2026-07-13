import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 Table Composition readiness close audit", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_TABLE_COMPOSITION_READINESS_CLOSE_AUDIT.md")

  it("closes the evidence chain while retaining production blockers", () => {
    for (const section of [
      "## Evidence Chain", "## Contract Readiness", "## Failure Readiness", "## Scale Readiness",
      "## Cross-Repo Gate", "## Next Lane", "## PASS", "## FAIL / BLOCKER", "## RISK",
      "## UNKNOWN", "## Files Changed", "## Behavior Changed", "## Tests Run", "## Risks Left",
      "## Intentionally Not Changed", "## Next Recommended Direction",
    ]) expect(doc).toContain(section)
    expect(doc).toContain("There is no remaining blocker for a future core sequential composer")
    expect(doc).toContain("All six common Composition families")
    expect(doc).toContain("core: 315 test files / 1,543 tests")
    expect(doc).toContain("Editor and backend worktrees required no Table composition changes")
  })

  it("keeps the close and next composer lane discoverable", () => {
    expect(read("../README.md")).toContain("Phase 378 closes core Table bounded Composition readiness")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 378 closes core Table bounded Composition readiness")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 378 Table V4 Composition Readiness Close Audit")
    expect(doc).toContain("Open the sequential whole-document v4 composer architecture lock")
  })
})
