import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("backend durable composition scale readiness cross-repo record", () => {
  it("records Phase 391 evidence while keeping production storage closed", () => {
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    expect(map).toContain("Phase 391 proves the in-memory scheduler over 240 mixed-family pages")
    expect(map).toContain("1,202 records/3,224,446")
    expect(ledger).toContain("## Phase 391 Backend Durable Composition Scheduler Scale Readiness")
    expect(ledger).toContain("Production repository conformance remains Phase 392")
  })
})
