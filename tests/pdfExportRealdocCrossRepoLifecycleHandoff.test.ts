import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("PDF-EXPORT-REALDOC-E.6 cross-repo lifecycle handoff", () => {
  it("accepts durable protected admission without accepting the remaining lifecycle", () => {
    const doc = read("../docs/PDF_EXPORT_REALDOC_CROSS_REPO_LIFECYCLE.md")

    for (const section of [
      "## Decision",
      "## Identity Chain",
      "## Durable Admission",
      "## Accepted Evidence",
      "## Repository Ownership",
      "## Remaining E.6",
      "## Explicitly Not Changed",
      "## Next Phase",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("Status: `PDF-EXPORT-REALDOC-E.6.1` accepted")
    expect(doc).toContain("independent Node process")
    expect(doc).toContain("invokes the mapper zero times")
    expect(doc).toContain("`E.6.2` and `E.6.3` remain pending")
    expect(doc).toContain("no SQLite scheduler optimization or new 240-page measurement")
    expect(doc).toContain("Production remains NO-GO")
  })
})
