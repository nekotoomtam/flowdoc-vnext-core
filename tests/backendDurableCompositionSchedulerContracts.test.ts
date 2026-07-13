import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("backend durable composition scheduler contracts cross-repo record", () => {
  it("records Phase 386 while preserving core semantic ownership", () => {
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    expect(map).toContain("Phase 386 adds strict backend-owned scheduler records")
    expect(map).toContain("keeps backend chunk identity separate")
    expect(map).toContain("from the core closed-page prefix")
    expect(ledger).toContain("## Phase 386 Backend Durable Composition Scheduler Contracts")
    expect(ledger).toContain("Repository and scheduler execution remain Phase 387+")
  })
})
