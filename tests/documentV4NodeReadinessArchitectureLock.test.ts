import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8")
}

describe("document v4 node-readiness architecture lock", () => {
  it("separates canonical, field, editor, layout, media, and published truths", () => {
    const doc = readText("../docs/DOCUMENT_V4_NODE_READINESS_ARCHITECTURE_LOCK.md")

    for (const section of [
      "## Non-Negotiable Invariants",
      "## Truth Layers",
      "### Canonical Authored Truth",
      "### Field Dependency Truth",
      "### Editor Interaction Truth",
      "### Measured Layout Truth",
      "### Published Template Evidence",
      "## Canonical-To-Fragment Contract",
      "## Inline Identity Direction",
      "## Media Boundary",
      "## Transaction And History Direction",
      "## Readiness Matrix Axes",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toMatch(/Page or line fragmentation never mutates the canonical authored tree/)
    expect(doc).toMatch(/External field changes must not silently mutate authored placements/)
    expect(doc).toMatch(/Image placement identity is separate from shared image asset identity/)
    expect(doc).toMatch(/Node-specific columns\/table implementation remains blocked until text-block/)
    expect(doc).toMatch(/Layout reflow is not an authored history intent/)
  })

  it("aligns the node-family baseline with document v4 containment", () => {
    const model = readText("../docs/NODE_FAMILY_CAPABILITY_MODEL.md")

    expect(model).toContain("### Media")
    expect(model).toContain("- `inline-image`")
    expect(model).toMatch(/\| `zone` \| `childIds` \|[^\n]+`image`/)
    expect(model).toMatch(/\| `column` \| `childIds` \|[^\n]+`columns`[^\n]+`toc`[^\n]+`image`/)
    expect(model).toMatch(/\| `table-cell` \| `childIds` \|[^\n]+`toc`[^\n]+`image`/)
    expect(model).toContain("page breaks are valid only as direct children of body zones")
  })

  it("publishes the phase trail without claiming runtime activation", () => {
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const doc = readText("../docs/DOCUMENT_V4_NODE_READINESS_ARCHITECTURE_LOCK.md")

    expect(readme).toContain("Phase 265 locks v4 authored/layout/field/media/version truth boundaries")
    expect(readme).toContain("docs/DOCUMENT_V4_NODE_READINESS_ARCHITECTURE_LOCK.md")
    expect(ledger).toContain("| 265 | Document v4 node-readiness architecture lock | done |")
    expect(ledger).toContain("## Phase 265 Document V4 Node-Readiness Architecture Lock")
    expect(doc).toMatch(/does not activate text editing, measured v4\s+layout, published-template workflows, or container pagination/)
  })
})
