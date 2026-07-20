import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("PDF-EXPORT-REALDOC-E.5.6 Published Preview handoff", () => {
  it("keeps Core source-neutral and mapped values behind Backend admission", () => {
    const doc = read("../docs/PDF_EXPORT_REALDOC_PUBLISHED_PREVIEW.md")

    for (const section of [
      "## Decision",
      "## Core Ownership",
      "## Editor Contract",
      "## Accepted Evidence",
      "## Explicitly Not Changed",
      "## Risks",
      "## Next Phase",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("`draft-not-validated`")
    expect(doc).toMatch(/does not receive mapped canonical\s+business values/)
    expect(doc).toContain("749,929 UTF-8 bytes")
    expect(doc).toContain("10 pages and 1,417,544 bytes")
    expect(doc).toContain("`PDF-EXPORT-REALDOC-G`")
    expect(doc).toContain("`PDF-EXPORT-REALDOC-E.5.7`")
    expect(doc).toContain("Production remains NO-GO")
  })

  it("keeps the source-specific adapter in the bounded local evidence helper", () => {
    const prepare = read("../packages/uat-realdoc/local-runtime/prepare-69c-docgen-local-input.mjs")
    const map = read("../packages/uat-realdoc/local-runtime/map-docgen-local.mjs")

    expect(prepare).toContain("mappingProfile")
    expect(prepare).toContain("projection")
    expect(prepare).toContain("adaptedPayloadText")
    expect(map).toContain("createFlowDocUatGenerationMapperV1")
    expect(map).not.toContain("process.stdout.write(JSON.stringify(input.payload))")
  })
})
