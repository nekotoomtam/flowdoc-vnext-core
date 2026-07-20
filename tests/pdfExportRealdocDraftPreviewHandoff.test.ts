import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("PDF-EXPORT-REALDOC-E.5.7 Draft Preview handoff", () => {
  it("locks a local immutable identity without claiming Published/API parity", () => {
    const doc = read("../docs/PDF_EXPORT_REALDOC_DRAFT_PREVIEW.md")

    for (const section of [
      "## Decision",
      "## Shared Runtime Boundary",
      "## Editor Contract",
      "## Accepted Evidence",
      "## Explicitly Not Changed",
      "## Risks",
      "## Next Phase",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("`VNextDraftStructurePreviewSnapshotV1`")
    expect(doc).toContain("`publishedApiParity: false`")
    expect(doc).toContain("10-page, 1,417,544-byte PDF")
    expect(doc).toContain("arbitrary live Editor draft package")
    expect(doc).toContain("`PDF-EXPORT-REALDOC-E.5.8`")
    expect(doc).toContain("Production remains NO-GO")
  })

  it("retains the Core snapshot contract as content-free and local-only", () => {
    const contract = read("../src/generation/draftStructurePreviewSnapshotV1.ts")

    expect(contract).toContain("immutableSnapshot: true")
    expect(contract).toContain("localPreviewOnly: true")
    expect(contract).toContain("publishedStructureVersion: false")
    expect(contract).toContain("publishedApiParity: false")
    expect(contract).toContain("businessValuesIncluded: false")
    expect(contract).toContain("productionBinding: false")
  })
})
