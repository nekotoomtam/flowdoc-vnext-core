import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("identity standard v1 architecture lock", () => {
  it("separates opaque identity, allocation ownership, scope, and provenance", () => {
    const doc = read("../docs/IDENTITY_STANDARD_V1_ARCHITECTURE_LOCK.md")

    expect(doc).toContain("separates identity from provenance")
    expect(doc).toContain("at most 80 characters")
    expect(doc).toContain("A timestamp alone is not a valid uniqueness strategy")
    expect(doc).toContain("Core owns the versioned identity vocabulary")
    expect(doc).toContain("collision as retry-or-block")
    expect(doc).toMatch(/Scope identity is\s+structured metadata/)
    expect(doc).toContain("Equivalent provenance maps produce the same allocation-input key")
    expect(doc).toContain("must not use array index as identity")
  })

  it("keeps adoption incremental and routing aligned", () => {
    const doc = read("../docs/IDENTITY_STANDARD_V1_ARCHITECTURE_LOCK.md")
    const readme = read("../README.md")
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const ledger = read("../docs/PHASE_LEDGER.md")

    expect(doc).toContain("does not narrow those parsers or migrate stored values")
    expect(readme).toContain("Phase 290 locks identity")
    expect(map).toContain("Phase 290 separates bounded opaque allocated identity")
    expect(ledger).toContain("## Phase 290 Identity Standard V1 Architecture Lock")
  })
})
