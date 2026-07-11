import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8")
}

describe("structure definition and document instance architecture lock", () => {
  it("locks the product north star and lifecycle vocabulary", () => {
    const doc = readText("../docs/STRUCTURE_INSTANCE_ARCHITECTURE_LOCK.md")

    for (const section of [
      "## Outcome",
      "## Canonical Vocabulary",
      "### Structure Definition",
      "### Published Structure Version",
      "### Document Instance",
      "### Data Snapshot",
      "### Resolved Document",
      "### Artifact",
      "## Materialized Instance Direction",
      "## Structure Policy Direction",
      "## Data And Resolution Boundary",
      "## Product And Repository Ownership",
      "## Acceptance Pressure",
      "## Future Extension Pressure",
      "## Non-Goals",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toMatch(/primary authored product artifact is a Structure Definition/)
    expect(doc).toMatch(/external consumers can\s+create and use documents from an immutable published structure version/)
    expect(doc).toMatch(/Creating a Document Instance materializes[^.]+starter graph once/)
    expect(doc).toMatch(/normal open, edit, resolve, render, and export paths do not\s+rematerialize/i)
  })

  it("separates governance, data, resolution, and artifacts", () => {
    const doc = readText("../docs/STRUCTURE_INSTANCE_ARCHITECTURE_LOCK.md")

    expect(doc).toMatch(/Field definitions, placements, and values are independent\s+truths/i)
    expect(doc).toMatch(/Generated TOC entries, page numbers, repeated collection output, and measured\s+layout fragments are not materialized as authored nodes/i)
    expect(doc).toContain("effective command surface")
    expect(doc).toContain("intersect structure policy")
    expect(doc).toContain("intersect session permission")
    expect(doc).toMatch(/Structure stores how and where data is used/i)
    expect(doc).toMatch(/artifact is downstream\s+evidence and never replaces Structure Definition/i)
  })

  it("keeps legacy and future governance as pressure rather than canonical input", () => {
    const doc = readText("../docs/STRUCTURE_INSTANCE_ARCHITECTURE_LOCK.md")

    for (const classification of ["KEEP_REQUIREMENT", "KEEP_CONTRACT", "AVOID_PATTERN", "DEFER"]) {
      expect(doc).toContain(`\`${classification}\``)
    }
    expect(doc).toMatch(/Legacy SRS and operation-guide generators are requirement evidence only/)
    expect(doc).toMatch(/does not add a\s+compliance engine/)
    expect(doc).toContain("no legacy shape adapter or copied PDF generator")
  })

  it("publishes the phase trail without claiming runtime implementation", () => {
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const map = readText("../docs/CROSS_REPO_OPERATING_MAP.md")

    expect(readme).toContain("Phase 268 locks Structure Definition and Materialized Document Instance")
    expect(readme).toContain("docs/STRUCTURE_INSTANCE_ARCHITECTURE_LOCK.md")
    expect(ledger).toContain("| 268 | Structure Definition and Document Instance architecture lock | done |")
    expect(ledger).toContain("## Phase 268 Structure Definition And Document Instance Architecture Lock")
    expect(map).toContain("Core Phase 268 locks Structure Definition authoring as the product north star")
    expect(map).toMatch(/does not\s+activate publish, materialization, instance APIs, or policy\s+execution/)
  })
})
