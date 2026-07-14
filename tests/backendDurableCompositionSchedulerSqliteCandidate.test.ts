import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("backend durable composition SQLite candidate cross-repo record", () => {
  it("records Phase 393 evidence without moving storage behavior into core", () => {
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    expect(map).toContain("Phase 393 implements a backend-only Node SQLite transactional candidate")
    expect(map).toContain("before/after-commit process death")
    expect(ledger).toContain("## Phase 393 Backend Durable Composition SQLite Candidate")
    expect(ledger).toContain("production admission wiring and performance hardening remain Phase 394")
  })
})
