import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function read(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8")
}

describe("columns v4 architecture lock", () => {
  it("locks independent parallel flow, nesting, page, and performance semantics", () => {
    const doc = read("../docs/COLUMNS_V4_ARCHITECTURE_LOCK.md")

    expect(doc).toMatch(/ordered,\s+independent column flows/)
    expect(doc).toContain("maximum used height")
    expect(doc).toContain("column-major reading order")
    expect(doc).toContain("at most three Columns containers")
    expect(doc).toMatch(/restrict `page-break` to a direct child of a body\s+zone/)
    expect(doc).toContain("Measurement never executes inside the pagination loop")
    expect(doc).toContain("plan each active lane once")
    expect(doc).toContain("Core reports changed scope and invalidation facts")
    expect(doc).toContain("active document v3 measured paginator is evidence only")
  })

  it("keeps readme, map, ledger, and readiness routing aligned", () => {
    const readme = read("../README.md")
    const map = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    const matrix = read("../docs/DOCUMENT_V4_NODE_FAMILY_READINESS_MATRIX.md")

    expect(readme).toContain("Phase 282 locks Columns v4")
    expect(map).toContain("Phase 282 locks Columns v4")
    expect(ledger).toContain("## Phase 282 Columns V4 Architecture Lock")
    expect(matrix).toContain("`docs/COLUMNS_V4_ARCHITECTURE_LOCK.md`")
  })
})
