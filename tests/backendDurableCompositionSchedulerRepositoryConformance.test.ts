import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("backend durable composition repository conformance cross-repo record", () => {
  it("records Phase 392 as a backend gate without activating concrete storage", () => {
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    expect(map).toContain("Phase 392 defines a backend-only production repository extension")
    expect(map).toContain("independent-process CAS, crash/restart recovery")
    expect(ledger).toContain("## Phase 392 Backend Durable Composition Repository Conformance")
    expect(ledger).toContain("A trusted runner and concrete transactional candidate remain Phase")
  })
})
