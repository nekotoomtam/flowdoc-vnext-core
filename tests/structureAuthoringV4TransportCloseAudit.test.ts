import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("structure authoring v4 transport close audit", () => {
  it("records the completed cross-repo path without opening product gates", () => {
    const doc = read("../docs/STRUCTURE_AUTHORING_V4_TRANSPORT_CLOSE_AUDIT.md")
    for (const section of [
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Cross-repo Evidence",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("editor intent, backend transport and revision")
    expect(doc).toContain("flowdoc-vnext-backend@0f17be1")
    expect(doc).toContain("flowdoc-vnext-editor@24cf0d5")
    expect(doc).toContain("canOpenTextDraft` remains false")
    expect(doc).toContain("does not make document v4")
    expect(doc).toContain("columns parallel child cursors")
  })

  it("keeps the map, readme, and ledger aligned", () => {
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const readme = read("../README.md")
    const ledger = read("../docs/PHASE_LEDGER.md")

    expect(map).toContain("Phase 281 closes the cross-repo v4 rich-inline transport slice")
    expect(readme).toContain("Phase 281 closes the cross-repo Structure Authoring v4 transport slice")
    expect(ledger).toContain("## Phase 281 Structure Authoring V4 Transport Close Audit")
  })
})
