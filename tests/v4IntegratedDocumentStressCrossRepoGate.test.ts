import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("v4 integrated document stress cross-repo gate", () => {
  it("records all repository gates without overstating product integration", () => {
    const doc = read("../docs/V4_INTEGRATED_DOCUMENT_STRESS_CROSS_REPO_GATE.md")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("290 test files / 1,460 tests")
    expect(doc).toContain("27 test files / 157 tests")
    expect(doc).toContain("13 test files / 45 tests")
    expect(doc).toContain("No editor or backend files changed")
    expect(doc).toContain("six expected integration blockers remain unchanged")
    expect(doc).toContain("## Intentionally Not Changed")
  })

  it("keeps Phase 364 discoverable", () => {
    expect(read("../README.md")).toContain("Phase 364 passes the integrated stress cross-repo gate")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 364 passes all three repository gates")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 364 V4 Integrated Document Stress Cross-Repo Gate")
  })
})
