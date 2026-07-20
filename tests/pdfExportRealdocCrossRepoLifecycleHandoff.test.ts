import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("PDF-EXPORT-REALDOC-E.6 cross-repo lifecycle handoff", () => {
  it("accepts durable operation recovery and strict Editor reconnect", () => {
    const doc = read("../docs/PDF_EXPORT_REALDOC_CROSS_REPO_LIFECYCLE.md")

    for (const section of [
      "## Decision",
      "## Identity Chain",
      "## E.6.1 Durable Admission",
      "## E.6.2 Durable Operation And Artifact",
      "## E.6.3 Explicit Runtime And Editor Reconnect",
      "## Accepted Evidence",
      "## Repository Ownership",
      "## Explicitly Not Changed",
      "## Next Decision",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("Status: `PDF-EXPORT-REALDOC-E.6.3` accepted")
    expect(doc).toContain("strict `sessionStorage` record")
    expect(doc).toContain("automatic startup scan")
    expect(doc).toContain("cancel key before sending cancellation")
    expect(doc).toContain("read-only inspection surface")
    expect(doc).toContain("Download remains unavailable")
    expect(doc).toContain("749,929-byte adapted 69C input")
    expect(doc).toContain("1,417,544 bytes")
    expect(doc).toContain("no SQLite scheduler optimization or new 240-page measurement")
    expect(doc).toContain("Production remains NO-GO")
  })
})
