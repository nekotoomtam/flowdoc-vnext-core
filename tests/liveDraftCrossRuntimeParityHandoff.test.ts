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
    expect(doc).toContain("parallel product handoff")
    expect(doc).toContain("docs/NEXT_PHASE_POINTER.md")
    expect(doc).toContain("activation remains NO-GO")
  })
})
