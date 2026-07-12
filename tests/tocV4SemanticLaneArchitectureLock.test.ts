import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("TOC v4 semantic lane architecture lock", () => {
  it("locks source, identity, label, invalidation, and pagination boundaries", () => {
    const doc = read("../docs/TOC_V4_SEMANTIC_LANE_ARCHITECTURE_LOCK.md")
    expect(doc).toContain("derived semantic node")
    expect(doc).toContain("validateVNextDocumentV4Structure")
    expect(doc).toContain("restricted to body zones")
    expect(doc).toContain("{ tocNodeId, headingNodeId }")
    expect(doc).toContain("authored-preview label")
    expect(doc).toContain("page-reference status `pending`")
    expect(doc).toContain("fixed-width page-number column")
    expect(doc).toContain("## PASS Criteria")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Intentionally Not Changed")
  })

  it("keeps the phase discoverable from the repository trail", () => {
    expect(read("../README.md")).toContain("Phase 338 locks the TOC v4 semantic lane")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 338 locks the TOC v4 semantic lane",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 338 TOC V4 Semantic Lane Architecture Lock",
    )
  })
})
