import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("sequential whole-document v4 contracts", () => {
  const doc = read("../docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_CONTRACTS.md")

  it("records each retained contract and validation boundary", () => {
    for (const section of [
      "## Public Modules", "## Canonical Manifest", "## Exact Demand", "## Open Page",
      "## Closed Page Prefix", "## Compact Cursor", "## State Acceptance",
      "## Fingerprints And Immutability", "## Boundedness", "## PASS",
      "## FAIL / BLOCKER", "## RISK", "## UNKNOWN", "## Files Changed",
      "## Behavior Changed", "## Tests Run", "## Risks Left",
      "## Intentionally Not Changed", "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("Pagination fingerprint is deliberately not a\nmanifest field")
    expect(doc).toContain("Re-fingerprinting one stale component does not bypass state acceptance")
    expect(doc).toContain("The closed-page prefix is append-only")
  })

  it("keeps Phase 380 and its next lane discoverable", () => {
    expect(read("../README.md")).toContain("Phase 380 implements strict sequential composer state contracts")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 380 adds strict sequential composer state contracts")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 380 Sequential Whole-Document V4 Contracts")
    expect(doc).toContain("Implement Phase 381 ordered bounded scheduling")
  })
})
