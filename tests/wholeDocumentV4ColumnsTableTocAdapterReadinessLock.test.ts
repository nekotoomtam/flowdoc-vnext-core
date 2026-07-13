import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 Columns Table TOC adapter readiness lock", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_COLUMNS_TABLE_TOC_ADAPTER_READINESS_LOCK.md")

  it("locks an evidence-backed capability matrix and family order", () => {
    for (const section of [
      "## Evidence Basis",
      "## Capability Matrix",
      "## TOC Adapter Slice",
      "## Columns Bounded Slice",
      "## Table Bounded Slice",
      "## Common Projection Rules",
      "## Generated Index Extension Mark",
      "## Failure Contract",
      "## Responsibility Boundary",
      "## Implementation Phases",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toMatch(/1\. TOC one-page common adapter;[\s\S]*2\. Columns composition-oriented bounded pagination[\s\S]*3\. Table composition-oriented bounded pagination/)
    expect(doc).toContain("DERIVABLE only from a one-page call")
    expect(doc).toMatch(/Columns and Table cannot:[\s\S]*page limits block atomically and discard all pages/)
  })

  it("does not fake incompatible checkpoints, fresh demand, or overflow geometry", () => {
    expect(doc).toMatch(/must\s+accept exactly one returned page/)
    expect(doc).toMatch(/freshPageAdvance: true` becomes common[\s\S]*`fresh-page-required`/)
    expect(doc).toMatch(/forced title or row overflow blocks common adaptation/)
    expect(doc).toContain("empty, untitled, zero-page completed TOC remains blocked")
    expect(doc).toMatch(/never infer a cursor from page contents/)
    expect(doc).toMatch(/Repeated headers plus body progress commit atomically/)
  })

  it("marks generated indexes without widening Phase 370 runtime scope", () => {
    expect(doc).toContain("List of Figures")
    expect(doc).toContain("List of Tables")
    expect(doc).toContain("marked future requirement, not Phase 370 schema or runtime scope")
    expect(doc).toContain("no generic index")
  })

  it("keeps Phase 370 and the next TOC slice discoverable", () => {
    expect(read("../README.md")).toContain("Phase 370 locks Columns/Table/TOC common-adapter readiness")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 370 locks the Columns/Table/TOC adapter order")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 370 Columns Table And TOC Common Adapter Readiness Lock")
    expect(doc).toContain("Implement the constrained TOC one-page common adapter first")
  })
})
