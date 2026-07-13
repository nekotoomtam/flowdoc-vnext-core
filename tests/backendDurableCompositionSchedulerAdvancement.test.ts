import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("backend durable composition advancement cross-repo record", () => {
  it("records Phase 389 while retaining pure core transition authority", () => {
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    expect(map).toContain("Phase 389 adds backend exact-window advancement")
    expect(map).toContain("real null-window structural continuation")
    expect(ledger).toContain("## Phase 389 Backend Durable Composition Scheduler Advancement")
    expect(ledger).toContain("progress remain Phase 390")
  })
})
