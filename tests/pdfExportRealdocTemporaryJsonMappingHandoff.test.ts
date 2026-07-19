import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("PDF-EXPORT-REALDOC-E.5.5 temporary JSON and mapping handoff", () => {
  it("retains the E.1/E.2 authority boundary without Core runtime activation", () => {
    const doc = read("../docs/PDF_EXPORT_REALDOC_TEMPORARY_JSON_MAPPING_HANDOFF.md")

    for (const section of [
      "## Accepted Consumer Boundary",
      "## Preparation Diagnostics",
      "## Identity And Staleness",
      "## No Core Runtime Change",
      "## Next Phase",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("`VNextPublishedStructureMappingProfileV1`")
    expect(doc).toContain("`ready-for-admission`")
    expect(doc).toMatch(/no mapper implementation or executable mapping definition/)
    expect(doc).toMatch(/do not retain supplied values, parser exception text/)
    expect(doc).toMatch(/authoritative E\.1 descriptor remains\s+Backend-created/)
    expect(doc).toMatch(/authoritative E\.2 mapper remains\s+Backend-selected/)
    expect(doc).toContain("`PDF-EXPORT-REALDOC-E.5.6`")
    expect(doc).toContain("Production remains NO-GO")
  })
})
