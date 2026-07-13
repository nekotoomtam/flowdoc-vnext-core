import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("backend durable composition scheduler architecture cross-repo lock", () => {
  it("records Phase 385 without moving backend ownership into core", () => {
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const ledger = read("../docs/PHASE_LEDGER.md")

    expect(map).toContain("Phase 385 locks backend durable composition scheduling")
    expect(map).toContain("one compare-and-swap job head")
    expect(map).toContain("demand-free `output-limit` continuation")
    expect(map).toContain("../flowdoc-vnext-backend/docs/DURABLE_COMPOSITION_SCHEDULER_ARCHITECTURE_LOCK.md")
    expect(ledger).toContain("## Phase 385 Backend Durable Composition Scheduler Architecture Lock")
    expect(ledger).toContain("Runtime contracts and repository implementation remain")
    expect(ledger).toContain("Phase 386+:")
    expect(ledger).toContain("demand-free `output-limit` continuation")
  })
})
