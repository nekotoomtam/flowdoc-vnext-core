import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("Table v4 renderer consumption readiness close audit", () => {
  it("closes renderer consumption without overstating artifact readiness", () => {
    const doc = read("../docs/TABLE_V4_RENDERER_CONSUMPTION_READINESS_CLOSE_AUDIT.md")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("None for the renderer-consumption scope")
    expect(doc).toContain("250 pages and 6,250 byte-stable commands")
    expect(doc).toContain("one owner")
    expect(doc).toContain("Production artifact readiness remains intentionally blocked")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Enter the Table authoring lane")
  })

  it("keeps the architecture lock and phase summaries discoverable", () => {
    expect(read("../README.md")).toContain("Phase 327 closes Table v4 renderer consumption")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 327 closes Table v4 renderer consumption",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 327 Table V4 Renderer Consumption Readiness Close Audit",
    )
    expect(read("../docs/TABLE_V4_RENDERER_CONSUMPTION_ARCHITECTURE_LOCK.md")).toContain(
      "Table v4 renderer consumption is a pure projection",
    )
  })
})
