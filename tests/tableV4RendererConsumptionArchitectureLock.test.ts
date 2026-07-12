import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("table v4 renderer consumption architecture lock", () => {
  it("locks complete facts, command hierarchy, alignment, borders, and adapter boundaries", () => {
    const doc = read("../docs/TABLE_V4_RENDERER_CONSUMPTION_ARCHITECTURE_LOCK.md")

    expect(doc).toContain("text-line candidates retain measured text and width")
    expect(doc).toContain("prepared cells retain explicit vertical alignment")
    expect(doc).toContain("cell-backgrounds")
    expect(doc).toContain("The `table-segment` owns outer top, right, bottom, and left edges")
    expect(doc).toContain("Every non-first logical cell owns its\n  internal leading vertical edge")
    expect(doc).toContain("No edge may have two owners")
    expect(doc).toContain("Adapters may not reflow text")
    expect(doc).toContain("250-page/1,000-body-row")
    expect(doc).toContain("no authored-document, measurement, pagination, DOM, backend, or editor input")
  })

  it("keeps readme, map, and ledger aligned", () => {
    expect(read("../README.md")).toContain(
      "Phase 323 locks Table v4 renderer consumption",
    )
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 323 locks Table v4 renderer consumption",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 323 Table V4 Renderer Consumption Architecture Lock",
    )
  })
})
