import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 Table Composition hardening publication", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_TABLE_COMPOSITION_HARDENING.md")

  it("publishes semantic re-fingerprint hardening and honest open policy", () => {
    for (const section of [
      "## Prepared-State Validation", "## Row And Header Validation", "## Work Validation",
      "## Adversarial Evidence", "## Empty Policy", "## Responsibility Boundary", "## PASS",
      "## FAIL / BLOCKER", "## RISK", "## UNKNOWN", "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)
    expect(doc).toContain("valid replacement fingerprints")
    expect(doc).toContain("active cell candidate index outside prepared bounds")
    expect(doc).toContain("1,000 body rows")
  })

  it("keeps the hardening phase discoverable", () => {
    expect(read("../README.md")).toContain("Phase 376 hardens Table cursors")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 376 hardens Table cursor/checkpoint semantics")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 376 Table V4 Composition Hardening")
  })
})
