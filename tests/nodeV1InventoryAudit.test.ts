import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("Node v1 inventory audit", () => {
  it("records every current authored and inline node type", () => {
    const audit = readText("docs/NODE_V1_INVENTORY_AUDIT.md")

    for (const nodeType of [
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
    ]) {
      expect(audit).toContain(`\`${nodeType}\``)
    }

    for (const inlineType of ["text", "field-ref", "page-number", "line-break"]) {
      expect(audit).toContain(`\`${inlineType}\``)
    }
  })

  it("keeps the audit explicit about cross-repo readiness and blockers", () => {
    const audit = readText("docs/NODE_V1_INVENTORY_AUDIT.md")

    for (const section of [
      "## Truth Layers",
      "## Authored Node Inventory",
      "## Parent Child Matrix",
      "## Inline Node Inventory",
      "## Operation Coverage",
      "## Presentation Coverage",
      "## Pagination Classification",
      "## Dirty Scope Coverage",
      "## Backend Passage",
      "## V1 Decisions",
      "## BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## PASS",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) {
      expect(audit).toContain(section)
    }

    expect(audit).toContain("flowdoc-vnext-editor@e50e28c")
    expect(audit).toContain("flowdoc-vnext-backend@9d4b202")
    expect(audit).toContain("Node v1 must include both an atomic inline image usage and a block image")
    expect(audit).toContain("field-ref` is a serialized usage")
    expect(audit).toContain("This audit does")
    expect(audit).toContain("not change the canonical schema")
  })

  it("matches the current canonical authored node union", () => {
    const schema = readText("src/schema/document.ts")
    const audit = readText("docs/NODE_V1_INVENTORY_AUDIT.md")

    for (const schemaName of [
      "ZoneNodeSchema",
      "TextBlockNodeSchema",
      "ColumnsNodeSchema",
      "ColumnNodeSchema",
      "TableNodeSchema",
      "TableRowNodeSchema",
      "TableCellNodeSchema",
      "TocNodeSchema",
      "PageBreakNodeSchema",
      "DividerNodeSchema",
      "SpacerNodeSchema",
    ]) {
      expect(schema).toContain(schemaName)
    }

    expect(audit).toContain("eleven authored node types")
    expect(audit).toContain("five surface types")
  })

  it("publishes Phase 247 in repository navigation", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(readme).toContain("docs/NODE_V1_INVENTORY_AUDIT.md")
    expect(ledger).toContain("| 247 | Node v1 inventory audit | done |")
    expect(ledger).toContain("## Phase 247 Node v1 Inventory Audit")
  })
})
