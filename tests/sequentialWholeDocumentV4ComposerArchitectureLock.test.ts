import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("sequential whole-document v4 composer architecture lock", () => {
  const doc = read("../docs/SEQUENTIAL_WHOLE_DOCUMENT_V4_COMPOSER_ARCHITECTURE_LOCK.md")

  it("locks one-window scheduling and exact family demand", () => {
    for (const section of [
      "## Canonical Manifest", "## Transition Boundary", "## Demand Contract",
      "## Compact Composer Cursor", "## Open-Page Checkpoint", "## Content Placement",
      "## Page Break And Section Rules", "## Closed Page Chunks", "## Authoritative Finalization",
      "## Result States", "## Atomicity And Recovery", "## Bounded Work",
      "## Responsibility Boundary", "## Implementation Phases", "## PASS",
      "## FAIL / BLOCKER", "## RISK", "## UNKNOWN", "## Files Changed",
      "## Behavior Changed", "## Tests Run", "## Risks Left",
      "## Intentionally Not Changed", "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("one caller-supplied family window at a time")
    expect(doc).toContain("Zero supplied windows produces `needs-family-window`")
    expect(doc).toMatch(/does not call a\s+family paginator through callbacks/)
    expect(doc).toMatch(/The per-call pagination fingerprint is intentionally not a stable manifest\s+pin/)
  })

  it("keeps open-page resume bounded and closed pages append-only", () => {
    expect(doc).toContain("one separate, strict,\nfingerprinted `open-page checkpoint`")
    expect(doc).toContain("Closed pages leave the checkpoint as\nappend-only page chunks")
    expect(doc).toMatch(/`partial`: the active family cursor advances, the last page closes/)
    expect(doc).toContain("Consecutive page\nbreaks therefore preserve consecutive intentional blank pages")
    expect(doc).toContain("Every section begins on a\nfresh document page")
  })

  it("locks atomic recovery and one authoritative finalization", () => {
    expect(doc).toContain("Each primitive transition is all-or-nothing")
    expect(doc).toContain("page plan and authoritative\nheading-page map in the same result")
    expect(doc).toContain("no partial heading map is authoritative")
    expect(doc).toMatch(/One-shot execution and every valid partial\/resume schedule must produce byte-/)
  })

  it("keeps the phase and cross-repo boundary discoverable", () => {
    expect(read("../README.md")).toContain("Phase 379 locks the sequential whole-document v4 composer")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 379 locks the sequential whole-document composer")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 379 Sequential Whole-Document V4 Composer Architecture Lock")
  })
})
