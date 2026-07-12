import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("table v4 content materialization architecture lock", () => {
  it("locks public/internal identity, scoped binding, cloning, and output boundaries", () => {
    const doc = read("../docs/TABLE_V4_CONTENT_MATERIALIZATION_ARCHITECTURE_LOCK.md")

    expect(doc).toContain("do not need to see or type\n`itemKey`")
    expect(doc).toContain("`itemKey` remains an internal normalized snapshot fact")
    expect(doc).toContain("Position does not imply data scope")
    expect(doc).toContain("document-field")
    expect(doc).toContain("collection-item-field")
    expect(doc).toContain("`resolved-node` with `nodei_` prefix")
    expect(doc).toContain("`resolved-inline` with `inli_` prefix")
    expect(doc).toContain("TOC is generated content and blocks")
    expect(doc).toContain("Media assets and registries are referenced, not cloned")
    expect(doc).toContain("commits the complete row content or nothing")
    expect(doc).toMatch(/values\s+live in binding tables/)
    expect(doc).toContain("not a new Published Structure\nVersion")
  })

  it("keeps readme, map, and ledger aligned", () => {
    expect(read("../README.md")).toContain("Phase 299 locks resolved Table content materialization")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain(
      "Phase 299 locks resolved Table content materialization",
    )
    expect(read("../docs/PHASE_LEDGER.md")).toContain(
      "## Phase 299 Table V4 Content Materialization Architecture Lock",
    )
  })
})
