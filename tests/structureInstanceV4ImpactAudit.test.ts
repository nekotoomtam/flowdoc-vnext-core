import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8")
}

describe("structure definition and document instance v4 impact audit", () => {
  it("classifies retained and conflicting v4 contracts", () => {
    const doc = readText("../docs/STRUCTURE_INSTANCE_V4_IMPACT_AUDIT.md")

    for (const section of [
      "## Outcome",
      "## Classification Vocabulary",
      "## Source Evidence",
      "## Core Impact Matrix",
      "## Backend Impact Matrix",
      "## Editor Impact Matrix",
      "## Acceptance Case Coverage",
      "## Required Contract Order",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    for (const classification of ["REUSE", "CHANGE_REQUIRED", "DEFER", "REJECT"]) {
      expect(doc).toContain(`\`${classification}\``)
    }

    expect(doc).toMatch(/current v4 work is a reusable semantic foundation/i)
    expect(doc).toMatch(/One `kind: "document"`, one id, graph, fields, assets, and optional data cannot identify Structure Definition versus Document Instance/)
    expect(doc).toMatch(/Apply to the correct mutable artifact and require effective Structure Policy before instance mutation/)
  })

  it("keeps repository responsibilities and downstream gates explicit", () => {
    const doc = readText("../docs/STRUCTURE_INSTANCE_V4_IMPACT_AUDIT.md")

    expect(doc).toMatch(/Backend must not copy policy semantics/)
    expect(doc).toMatch(/Add artifact-aware reads through this adapter only/)
    expect(doc).toMatch(/UI policy is not Structure Policy authority/)
    expect(doc).toMatch(/Browser must not invent instance graphs or bypass backend revision\/idempotency persistence/)
    expect(doc).toMatch(/do not add\s+backend persistence or editor workflow until the identity gate passes/)
  })

  it("covers simple, open, and governed document pressure without overfitting", () => {
    const doc = readText("../docs/STRUCTURE_INSTANCE_V4_IMPACT_AUDIT.md")

    expect(doc).toContain("mapped invoice/shipping form")
    expect(doc).toContain("general authored report")
    expect(doc).toContain("governed operation guide")
    expect(doc).toMatch(/No acceptance case requires a second renderer or a legacy report-specific node/)
    expect(doc).toMatch(/All cases must converge on one Resolved Document/)
  })

  it("publishes Phase 269 without changing runtime claims", () => {
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const map = readText("../docs/CROSS_REPO_OPERATING_MAP.md")

    expect(readme).toContain("Phase 269 audits v4 impact across core, backend, and editor")
    expect(readme).toContain("docs/STRUCTURE_INSTANCE_V4_IMPACT_AUDIT.md")
    expect(ledger).toContain("| 269 | Structure Definition and Document Instance v4 impact audit | done |")
    expect(ledger).toContain("## Phase 269 Structure Definition And Document Instance V4 Impact Audit")
    expect(map).toContain("Core Phase 269 classifies current core, backend, and editor contracts")
    expect(map).toMatch(/does not change schema, persistence, API, editor, policy, or runtime behavior/)
  })
})
