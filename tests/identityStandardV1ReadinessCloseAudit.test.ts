import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("identity standard v1 readiness close audit", () => {
  it("ties readiness to contracts, tests, table consequence, and retained risks", () => {
    const doc = read("../docs/IDENTITY_STANDARD_V1_READINESS_CLOSE_AUDIT.md")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("src/identity/identityStandardV1.ts")
    expect(doc).toContain("src/identity/identityAllocationInputV1.ts")
    expect(doc).toContain("src/identity/identityBatchAuditV1.ts")
    expect(doc).toMatch(/do\s+not enlarge or expose the allocated id/)
    expect(doc).toMatch(/without\s+deriving row identity from array index/)
    expect(doc).toContain("## FAIL / BLOCKER\n\nNone")
    expect(doc).toContain("Consumers that skip the batch audit")
    expect(doc).toMatch(/Table Definition and\s+Resolved Row contracts/)
  })

  it("keeps readme, cross-repo map, and ledger aligned", () => {
    expect(read("../README.md")).toContain("Phase 293 closes Identity Standard v1")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 293 closes Identity Standard v1",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 293 Identity Standard V1 Readiness Close Audit",
    )
  })
})
