import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 composition architecture lock", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_COMPOSITION_ARCHITECTURE_LOCK.md")

  it("maps every canonical authored node exactly once without confusing font family", () => {
    const inventory = doc.slice(doc.indexOf("## Composition Node Family Inventory"), doc.indexOf("## Family-Owned Fragment Window"))
    const rows = [...inventory.matchAll(/^\| `([^`]+)` \|/gm)].map((match) => match[1])

    expect(rows).toEqual([
      "zone", "text-block", "columns", "column", "table", "table-row",
      "table-cell", "toc", "page-break", "divider", "spacer", "image",
    ])
    expect(new Set(rows).size).toBe(rows.length)
    expect(doc).toContain("It does not mean a CSS or font family")
    for (const family of [
      "text-flow", "columns-flow", "table-flow", "generated-flow", "utility-flow", "media-flow",
    ]) expect(doc).toContain(`\`${family}\``)
  })

  it("locks pure composition, cursor, page-plan, and heading-map boundaries", () => {
    for (const section of [
      "## Canonical Traversal",
      "## Evidence Basis",
      "## Family-Owned Fragment Window",
      "## Adapter Boundary",
      "## Composer Input",
      "## Composer Cursor",
      "## Document Page Plan",
      "## Heading-Page Map",
      "## Utility And Atomic Policy",
      "## Partial Commit And Failure",
      "## Invalidation And Reuse",
      "## Responsibility Boundary",
      "## Implementation Phases",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toMatch(/does not measure text, split Table rows, reconcile Columns lanes/)
    expect(doc).toMatch(/One-shot and any valid partial\/resume sequence must produce byte-identical/)
    expect(doc).toMatch(/page plan and heading-page map are committed by the same composition result/)
    expect(doc).toMatch(/Blocked results retain cursor-before and issues but no cursor-after/)
  })

  it("keeps unsupported prerequisites explicit and the next phase narrow", () => {
    expect(doc).toMatch(/Text-block lacks first-remainder and resumable pagination/)
    expect(doc).toMatch(/Columns\/Table results do not\s+retain per-page resume checkpoints/)
    expect(doc).toMatch(/page-break` always advances exactly one document page/)
    expect(doc).toContain("Implement the Text-flow V4 Remainder And Cursor Contract")
    expect(read("../README.md")).toContain("Phase 366 locks whole-document v4 composition")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 366 locks whole-document v4 composition")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 366 Whole-Document V4 Composition Architecture Lock")
  })
})
