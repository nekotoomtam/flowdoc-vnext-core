import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8")
}

describe("document v4 node-family readiness matrix", () => {
  it("publishes every authored target node exactly once", () => {
    const doc = readText("../docs/DOCUMENT_V4_NODE_FAMILY_READINESS_MATRIX.md")
    const matrix = doc.slice(doc.indexOf("## Matrix"), doc.indexOf("## Evidence Catalog"))
    const rows = [...matrix.matchAll(/^\| `([^`]+)` \|/gm)].map((match) => match[1])

    expect(rows).toEqual([
      "zone",
      "text-block",
      "columns",
      "column",
      "table",
      "table-row",
      "table-cell",
      "toc",
      "page-break",
      "divider",
      "spacer",
      "image",
    ])
    expect(new Set(rows).size).toBe(rows.length)
  })

  it("keeps readiness axes independent and evidence-backed", () => {
    const doc = readText("../docs/DOCUMENT_V4_NODE_FAMILY_READINESS_MATRIX.md")

    for (const section of [
      "## Status Vocabulary",
      "## Matrix",
      "## Evidence Catalog",
      "### E1 Schema And References",
      "### E2 Core Read Projection",
      "### E3 Generic Lifecycle",
      "### E4 Backend Revision Boundary",
      "### E5 Editor Consumer Boundary",
      "### E6 Closed Axes",
      "## Dependency Gates",
      "## Field And Published-Version Constraint",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toMatch(/There is no aggregate `ready` status/)
    expect(doc).toMatch(/For structural\s+internals, PASS can mean intentional protection is proven/)
    for (const status of ["PASS", "PARTIAL", "BLOCKED", "UNKNOWN"]) {
      expect(doc).toContain(`- \`${status}\`:`)
    }
  })

  it("blocks container semantics on retained text-block acceptance", () => {
    const doc = readText("../docs/DOCUMENT_V4_NODE_FAMILY_READINESS_MATRIX.md")

    expect(doc).toMatch(/Text-block is the next critical path because columns and table cells consume it/)
    expect(doc).toContain("### Columns Gate")
    expect(doc).toContain("### Table Gate")
    expect(doc).toMatch(/measured line packets with canonical source ranges/)
    expect(doc).toMatch(/External field changes must\s+produce explicit placement-level drift diagnostics/)
    expect(doc).toMatch(/Scale remains UNKNOWN for all v4 node families/)
  })
})
