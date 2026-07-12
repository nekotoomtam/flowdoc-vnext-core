import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("Table v4 authoring risk hardening architecture lock", () => {
  it("locks preview, confirmation, selective reversibility, and budgets", () => {
    const doc = read("../docs/TABLE_V4_AUTHORING_RISK_HARDENING_ARCHITECTURE_LOCK.md")
    expect(doc).toContain("guarded boundary over\nthe existing pure atomic kernel")
    expect(doc).toContain("Preview never persists")
    expect(doc).toContain("strict JSON-safe packet, not a boolean")
    expect(doc).toContain("changed authored nodes as `before`/`after` node snapshots")
    expect(doc).toContain("Undo requires the current bundle fingerprint")
    expect(doc).toContain("maximumRowTemplateVisits")
    expect(doc).toContain("one unit below each relevant threshold")
    expect(doc).toContain("no persistence, network, DOM, editor state, measurement, or pagination")
  })

  it("keeps phase summaries discoverable", () => {
    expect(read("../README.md")).toContain("Phase 334 locks Table v4 authoring risk hardening")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 334 locks Table v4 authoring risk hardening",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 334 Table V4 Authoring Risk Hardening Architecture Lock",
    )
  })
})
