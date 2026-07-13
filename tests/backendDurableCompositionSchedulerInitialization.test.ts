import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("backend durable composition initialization cross-repo record", () => {
  it("records Phase 388 while retaining core initialization authority", () => {
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    expect(map).toContain("Phase 388 adds backend source-pinned initialization")
    expect(map).toContain("transition-zero")
    expect(map).toContain("initial page chunks")
    expect(ledger).toContain("## Phase 388 Backend Durable Composition Scheduler Initialization")
    expect(ledger).toContain("Exact-window advancement remains Phase 389")
  })
})
