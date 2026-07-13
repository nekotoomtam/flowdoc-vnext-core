import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("backend durable composition repository cross-repo record", () => {
  it("records Phase 387 without moving concrete retention into core", () => {
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    expect(map).toContain("Phase 387 adds a backend repository boundary")
    expect(map).toContain("one CAS winner")
    expect(ledger).toContain("## Phase 387 Backend Durable Composition Scheduler Repository")
    expect(ledger).toContain("Source-pinned initialization remains Phase 388")
  })
})
