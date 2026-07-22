import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string): string => readFileSync(resolve(path), "utf8")

describe("Live Draft MR1 persistent flow foundation handoff", () => {
  it("records bounded structural sharing without overclaiming product readiness", () => {
    const handoff = read("docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md")
    expect(handoff).toContain("completeNextSemanticPassCount: 0")
    expect(handoff).toContain("Persistent B+ flow rope")
    expect(handoff).toContain("stagedCoverageCompatible: true")
    expect(handoff).toContain("Phase 3: Core Spatial Wrapping 3A")
    expect(handoff).toMatch(/Editor product binding.*NO-GO/s)
    expect(handoff).toMatch(/inline image.*NO-GO/is)
    expect(handoff).toMatch(/list decoration.*NO-GO/is)
    expect(handoff).toMatch(/mayPublishLayout: false/)
    expect(handoff).toMatch(/productionBinding: false/)
  })

  it("keeps the public boundary and cross-runtime pointer aligned", () => {
    const publicIndex = read("src/index.ts")
    const crossRuntime = read("docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const ledger = read("docs/PHASE_LEDGER.md")
    expect(publicIndex).toContain("textBlockPersistentFlowContractV1.js")
    expect(publicIndex).toContain("textBlockPersistentFlowTreeV1.js")
    expect(publicIndex).toContain("textBlockPersistentFlowUpdateV1.js")
    expect(crossRuntime).toContain("LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md")
    expect(crossRuntime).toContain("Phase 3: Core Spatial Wrapping 3A")
    expect(ledger).toContain("MR1-Q Persistent Flow Tree Foundation")
  })
})
