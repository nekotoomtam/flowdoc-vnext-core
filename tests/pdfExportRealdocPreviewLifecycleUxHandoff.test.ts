import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("PDF-EXPORT-REALDOC-E.5.8 Preview lifecycle UX handoff", () => {
  it("accepts local lifecycle UX without claiming new Core runtime behavior", () => {
    const doc = read("../docs/PDF_EXPORT_REALDOC_PREVIEW_LIFECYCLE_UX.md")

    for (const section of [
      "## Decision",
      "## Retry Identity",
      "## Large Input Boundary",
      "## Accepted Evidence",
      "## Local Harness Boundary",
      "## Explicitly Not Changed",
      "## Risks",
      "## Next Phase",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("Status: `PDF-EXPORT-REALDOC-E.5.8` accepted")
    expect(doc).toContain("256 KiB")
    expect(doc).toContain("pending operation cancellation to `cancelled`")
    expect(doc).toContain("1,417,544 bytes")
    expect(doc).toContain("no Core runtime schema")
    expect(doc).toContain("`PDF-EXPORT-REALDOC-E.5.9`")
    expect(doc).toContain("Production remains NO-GO")
  })
})
