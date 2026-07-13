import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("sequential whole-document v4 recovery", () => {
  const doc = read("../docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_RECOVERY.md")

  it("records partial, fresh, blocker, retry, and determinism evidence", () => {
    for (const section of [
      "## Determinism Correction", "## Partial Commit", "## Fresh Page Required",
      "## Family Blocked", "## Atomic Limits", "## Retry And Immutability",
      "## One-Shot Resume Equivalence", "## PASS", "## FAIL / BLOCKER",
      "## RISK", "## UNKNOWN", "## Files Changed", "## Behavior Changed",
      "## Tests Run", "## Risks Left", "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("no longer retain `familyWindowFingerprint`")
    expect(doc).toContain("cumulative work no longer retains accepted-window count")
    expect(doc).toContain("byte-identical ordered closed pages")
    expect(doc).toContain("does not rely\nonly on detecting a stale fingerprint")
  })

  it("keeps Phase 382 and finalization next discoverable", () => {
    expect(read("../README.md")).toContain("Phase 382 activates partial, fresh-page-required, and family-blocked")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 382 activates recovery semantics")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 382 Sequential Whole-Document V4 Recovery")
    expect(doc).toContain("Implement Phase 383 authoritative finalization and mixed-family scale")
  })
})
