import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string): string => readFileSync(resolve(path), "utf8")
const normalize = (value: string): string => value.replace(/\s+/gu, " ").trim()
const sectionAtPeerHeading = (document: string, heading: string): string => {
  const startIndex = document.indexOf(heading)
  expect(startIndex).toBeGreaterThanOrEqual(0)
  const nextHeadingIndex = document.indexOf("\n## ", startIndex + heading.length)
  return document.slice(startIndex, nextHeadingIndex < 0 ? document.length : nextHeadingIndex)
}

const handoffPath = "docs/LIVE_DRAFT_MR1_INLINE_IMAGE_GEOMETRY_4B.md"
const implementationHead = "f8eb3ba"
const deferredNoGo =
  "List decoration, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO."
const phase5Gate =
  "Phase 5 remains separately authorized; this handoff does not authorize Phase 5 implementation or activation."

describe("Live Draft MR1 inline-image geometry 4B handoff", () => {
  it("records the accepted Core-only evidence, scope limits, and next authorization gate", () => {
    const handoff = read(handoffPath)
    const headings = handoff.split(/\r?\n/gu).filter((line) => line.startsWith("## "))

    expect(headings).toEqual([
      "## Status",
      "## Outcome",
      "## Architecture Evidence",
      "## Producer And Runtime Evidence",
      "## Persistent Flow Evidence",
      "## Spatial Wrapping Evidence",
      "## Authored Box Evidence",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Verification",
      "## Intentionally Not Changed",
      "## Next Checkpoint",
    ])

    const status = normalize(sectionAtPeerHeading(handoff, "## Status"))
    const runtime = normalize(sectionAtPeerHeading(handoff, "## Producer And Runtime Evidence"))
    const spatial = normalize(sectionAtPeerHeading(handoff, "## Spatial Wrapping Evidence"))
    const authoredBox = normalize(sectionAtPeerHeading(handoff, "## Authored Box Evidence"))
    const blocker = normalize(sectionAtPeerHeading(handoff, "## FAIL / BLOCKER"))
    const verification = normalize(sectionAtPeerHeading(handoff, "## Verification"))
    const unchanged = normalize(sectionAtPeerHeading(handoff, "## Intentionally Not Changed"))
    const next = normalize(sectionAtPeerHeading(handoff, "## Next Checkpoint"))

    expect(status).toContain("Status: implemented and accepted as the bounded Core-only Phase 4B checkpoint.")
    expect(status).toContain(`accepted Task 11 implementation head \`${implementationHead}\``)
    expect(runtime).toContain("Node-native and Worker-WASM U+FFFC")
    expect(spatial).toContain("multi-interval")
    expect(spatial).toContain("expanded-band")
    expect(authoredBox).toContain("auto-height")
    expect(blocker).toContain("fixed-height")
    expect(blocker).toContain(deferredNoGo)
    expect(verification).toContain("npx vitest run")
    expect(verification).toContain("npm run check")
    expect(unchanged).toContain("incremental edits")
    expect(unchanged).toContain("reuse")
    expect(next).toContain(phase5Gate)
  })

  it("advances active documentation pointers to Phase 4B while retaining deferred rows", () => {
    const phase4a = normalize(read("docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md"))
    const crossRuntime = read("docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const ledger = read("docs/PHASE_LEDGER.md")
    const design = read("docs/superpowers/specs/2026-07-27-inline-image-line-box-geometry-design.md")
    const crossHeader = crossRuntime.split(/\r?\n/gu, 1)[0]
    const currentTask = normalize(sectionAtPeerHeading(crossRuntime, "## First Task For The Next Thread"))
    const prompt = normalize(sectionAtPeerHeading(crossRuntime, "## Handoff Prompt"))
    const ledgerPhase4b = normalize(
      sectionAtPeerHeading(ledger, "## Phase 4B Inline Image Line-Box Geometry"),
    )

    expect(phase4a).toContain(
      "Historical pointer status on 2026-07-28: fulfilled by `docs/LIVE_DRAFT_MR1_INLINE_IMAGE_GEOMETRY_4B.md`.",
    )
    expect(crossHeader).toContain("Phase 4B")
    for (const record of [currentTask, prompt, ledgerPhase4b]) {
      expect(record).toContain("Phase 4B")
      expect(record).toContain(phase5Gate)
      expect(record).toContain(deferredNoGo)
    }
    expect(design).toContain("**Status:** Implemented and accepted as the bounded Core-only Phase 4B checkpoint")
  })

  it("guards the exact Phase 4B public export lines", () => {
    const publicIndexLines = read("src/index.ts").split(/\r?\n/gu)

    for (const statement of [
      'export * from "./layout/textBlockFlowEvidenceContractV2.js"',
      '  acceptVNextTextBlockFlowEvidenceV2,',
      'export * from "./layout/textBlockPersistentFlowContractV2.js"',
      '  createVNextTextBlockPersistentFlowTreeV2,',
      'export * from "./layout/textBlockSpatialIndexContractV2.js"',
      '  createVNextTextBlockSpatialIndexV2,',
      '  createVNextTextBlockSpatialIndexUpdateV2,',
      '  provideVNextTextBlockFlowRegionsV2,',
      'export * from "./layout/textBlockSpatialWrappingLayoutContractV2.js"',
      '  layoutVNextTextBlockSpatialWrappingV2,',
      'export * from "./layout/textBlockAuthoredBoxGeometryContractV2.js"',
      'export * from "./layout/textBlockAuthoredBoxGeometryV2.js"',
    ]) expect(publicIndexLines).toContain(statement)
  })
})
