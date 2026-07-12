import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("v4 integrated document stress gate architecture lock", () => {
  it("locks capability honesty and a phased mixed-lane stress profile", () => {
    const doc = read("../docs/V4_INTEGRATED_DOCUMENT_STRESS_GATE_ARCHITECTURE_LOCK.md")
    expect(doc).toContain("integrated-v4-stress-v1")
    expect(doc).toContain("`executable`")
    expect(doc).toContain("`contract-only`")
    expect(doc).toContain("`expected-blocked`")
    expect(doc).toMatch(/6,000\s+Text-block lines/)
    expect(doc).toMatch(/1,000 Table rows/)
    expect(doc).toMatch(/1,000 TOC headings/)
    expect(doc).toContain("must not be added together")
    expect(doc).toContain("## Required Invariants")
    expect(doc).toContain("## Phase Plan")
    expect(doc).toContain("## PASS Criteria")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Intentionally Not Changed")
  })

  it("keeps the new major topic discoverable", () => {
    expect(read("../README.md")).toContain("Phase 359 locks the v4 integrated document stress gate")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 359 opens the v4 integrated document stress gate")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 359 V4 Integrated Document Stress Gate Architecture Lock")
  })
})
