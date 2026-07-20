import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("PDF-EXPORT-REALDOC-E.5.9 Form/API parity handoff", () => {
  it("locks content parity without weakening instance identity", () => {
    const doc = read("../docs/PDF_EXPORT_REALDOC_FORM_API_PARITY.md")

    for (const section of [
      "## Decision",
      "## Core Identity",
      "## Shared Admission",
      "## Accepted Evidence",
      "## Privacy And Mutation Boundary",
      "## Explicitly Not Changed",
      "## Risks",
      "## Next Phase",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("Status: `PDF-EXPORT-REALDOC-E.5.9` accepted")
    expect(doc).toContain("`canonicalContentFingerprint`")
    expect(doc).toContain("`canonicalInputFingerprint` remains the stronger instance-bound identity")
    expect(doc).toContain("mapping `not-required`")
    expect(doc).toContain("mapping `executed`")
    expect(doc).toContain("1,417,544 bytes")
    expect(doc).toContain("no cross-instance byte-parity claim")
    expect(doc).toContain("`PDF-EXPORT-REALDOC-E.6`")
    expect(doc).toContain("Production remains NO-GO")
  })
})
