import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("Table v4 authoring risk hardening close audit", () => {
  it("closes guarded core behavior without overstating consumer integration", () => {
    const doc = read("../docs/TABLE_V4_AUTHORING_RISK_HARDENING_CLOSE_AUDIT.md")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("None for core risk hardening")
    expect(doc).toContain("does not return proposed document")
    expect(doc).toContain("Changed object-key positions")
    expect(doc).toContain("4,001 unique affected nodes")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Move to the TOC node semantic lane")
  })

  it("keeps the architecture and phase close discoverable", () => {
    expect(read("../README.md")).toContain("Phase 337 closes Table v4 authoring risk hardening")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 337 closes Table v4 authoring risk hardening",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 337 Table V4 Authoring Risk Hardening Close Audit",
    )
    expect(read("../docs/TABLE_V4_AUTHORING_RISK_HARDENING_ARCHITECTURE_LOCK.md")).toContain(
      "strict JSON-safe packet",
    )
  })
})
