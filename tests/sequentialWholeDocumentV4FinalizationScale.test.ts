import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("sequential whole-document v4 finalization and scale", () => {
  const doc = read("../docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_FINALIZATION_SCALE.md")

  it("records authoritative finalization, heading, failure, and scale evidence", () => {
    for (const section of [
      "## Manifest Heading Declaration", "## Public Finalizer", "## Closed Prefix Validation",
      "## Authoritative Page Plan", "## Authoritative Heading Map", "## Mixed-Family Scale",
      "## Failure Evidence", "## PASS", "## FAIL / BLOCKER", "## RISK", "## UNKNOWN",
      "## Files Changed", "## Behavior Changed", "## Tests Run", "## Risks Left",
      "## Intentionally Not Changed", "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("500 pure calls including initialization")
    expect(doc).toContain("250 ordered closed pages")
    expect(doc).toContain("42 declared heading destinations")
    expect(doc).toContain("Heading-map fingerprints are now compact SHA-256")
    expect(doc).toContain("does not insert\na synthetic page count after composition")
  })

  it("keeps Phase 383 and readiness close discoverable", () => {
    expect(read("../README.md")).toContain("Phase 383 finalizes terminal sequential composition")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 383 adds authoritative terminal finalization")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 383 Sequential Whole-Document V4 Finalization And Scale")
    expect(doc).toContain("Run Phase 384 sequential composer readiness close")
  })
})
