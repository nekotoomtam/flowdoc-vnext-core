import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("Live Draft cross-runtime parity handoff", () => {
  it("keeps the implementation handoff honest and bounded", () => {
    const doc = read("../docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")

    for (const section of [
      "## Objective",
      "## Locked Product Decision",
      "## Current Baseline",
      "## Runtime Ownership",
      "## Browser Worker Boundary",
      "## Implementation Roadmap",
      "## Acceptance Gates",
      "## First Task For The Next Thread",
      "## Required Reading",
      "## Handoff Prompt",
      "## PASS / FAIL-BLOCKER / RISK / UNKNOWN",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("Form typing must not create a Backend request for every keystroke")
    expect(doc).toContain("Browser DOM, CSS, and native Canvas text measurement are not pagination")
    expect(doc).toContain("Default `measureVNextText(...)` replacement")
    expect(doc).toContain("LIVE-DRAFT-XR-0")
    expect(doc).toContain("LIVE-DRAFT-XR-1")
    expect(doc).toContain("LIVE-DRAFT-XR-5 Partial Checkpoint Execution Result")
    expect(doc).toContain("LIVE-DRAFT-MR1 Multi-Line Multi-Glyph Canvas")
    expect(doc).toContain("LIVE-DRAFT-MR1 Rapid-Edit Lifecycle")
    expect(doc).toContain("LIVE-DRAFT-MR1 Multi-Block Scheduling And Frame Gate")
    expect(doc).toContain("LIVE-DRAFT-MR1 Intra-TextBlock Incremental Reflow Analysis")
    expect(doc).toContain("`78810c5`")
    expect(doc).toContain("`0a5c816`")
    expect(doc).toContain("one rejected stale result")
    expect(doc).toContain("partial-not-accepted")
    expect(doc).toContain("default/approximate-versus-renderer drift")
    expect(doc).toContain("parallel product handoff")
    expect(doc).toContain("docs/NEXT_PHASE_POINTER.md")
    expect(doc).toContain("activation remains NO-GO")
    expect(doc).toMatch(/Product-bound multi-block scheduling[\s\S]{0,180}not\s+implemented/u)

    const ledger = read("../docs/PHASE_LEDGER.md")
    expect(ledger).toContain("## LIVE-DRAFT-MR1-F Multi-Line Multi-Glyph Canvas")
    expect(ledger).toContain("## LIVE-DRAFT-MR1-G Rapid-Edit Lifecycle")
    expect(ledger).toContain("## LIVE-DRAFT-MR1-H Multi-Block Scheduling And Frame Gate")
    expect(ledger).toContain("## LIVE-DRAFT-MR1-I Intra-TextBlock Incremental Reflow Analysis")

    const analysis = read("../docs/LIVE_DRAFT_MR1_INCREMENTAL_REFLOW_ANALYSIS.md")
    expect(analysis).toContain("full-layout-oracle-analysis-only")
    expect(analysis).toContain("mayPublishLayout: false")
    expect(analysis).toContain("4,959 UTF-16 units")
    expect(analysis).toContain("incremental Core acceptance")
  })
})
