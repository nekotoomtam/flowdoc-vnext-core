import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("backend durable composition recovery and finalization cross-repo record", () => {
  it("records Phase 390 while retaining pure core finalization authority", () => {
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    expect(map).toContain("Phase 390 adds backend expired-lease recovery")
    expect(map).toContain("core-owned finalization")
    expect(ledger).toContain("## Phase 390 Backend Durable Composition Scheduler Recovery And Finalization")
    expect(ledger).toContain("Production scale/readiness remains Phase 391")
  })
})
