import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const read = (path: string): string => readFileSync(resolve(path), "utf8")
const normalize = (value: string): string => value.replace(/\s+/g, " ").trim()
const sectionAtPeerHeading = (document: string, heading: string): string => {
  const startIndex = document.indexOf(heading)
  expect(startIndex).toBeGreaterThanOrEqual(0)
  const nextHeadingIndex = document.indexOf("\n## ", startIndex + heading.length)
  return document.slice(startIndex, nextHeadingIndex < 0 ? document.length : nextHeadingIndex)
}

const phase3Pointer = "Proceed only to `Phase 3: Core Spatial Wrapping 3A`."
const phase3NoGo =
  "Do not start list/image geometry, empty-block geometry, Editor binding, Backend binding, Columns/Table integration, table auto-fit, publication, or production activation inside Phase 3."
const phase4bPointer = "Phase 4B is the accepted bounded Core-only inline-image line-box checkpoint"
const phase4bNoGo =
  "List decoration, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO."
const phase5Gate =
  "Phase 5 remains separately authorized; this handoff does not authorize Phase 5 implementation or activation."
const supersededActiveDirectives = ["Stop after Phase 4A.", "Proceed only to `Phase 3: Core Spatial Wrapping 3A`.", "Proceed only to `Phase 4: Initial TextBlock Geometry`."] as const

describe("Live Draft MR1 persistent flow foundation handoff", () => {
  it("pins every MR1-Q section, capability row, counter row, gate total, and next boundary", () => {
    const handoff = read("docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md")
    const headings = handoff.split(/\r?\n/u).filter((line) => line.startsWith("## "))
    expect(headings).toEqual([
      "## Status",
      "## Outcome",
      "## Capability Matrix",
      "## Structural Work Evidence",
      "## Feedback Lane Compatibility",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Verification",
      "## Next Checkpoint",
    ])

    const status = normalize(sectionAtPeerHeading(handoff, "## Status"))
    const outcome = normalize(sectionAtPeerHeading(handoff, "## Outcome"))
    const capabilities = normalize(sectionAtPeerHeading(handoff, "## Capability Matrix"))
    const structural = normalize(sectionAtPeerHeading(handoff, "## Structural Work Evidence"))
    const feedback = normalize(sectionAtPeerHeading(handoff, "## Feedback Lane Compatibility"))
    const blockers = normalize(sectionAtPeerHeading(handoff, "## FAIL / BLOCKER"))
    const verification = normalize(sectionAtPeerHeading(handoff, "## Verification"))
    const next = normalize(sectionAtPeerHeading(handoff, "## Next Checkpoint"))

    expect(status).toContain("Editor product binding, Backend binding, publication, and production remain NO-GO.")
    expect(status).toContain("`mayPublishLayout: false`")
    expect(status).toContain("`productionBinding: false`")
    expect(outcome).toContain("Persistent B+ flow rope")
    expect(outcome).toContain("`completeNextSemanticPassCount: 0`")
    expect(outcome).toContain("complete next semantic checkpoint pass")
    expect(outcome).toContain("complete next Core request")
    expect(outcome).toContain("complete shaping-run, cluster, break-offset, and line arrays")
    expect(outcome).toContain("complete QA materialization")
    expect(outcome).toContain("cumulative subtree summaries")
    expect(outcome).toContain("shallow local facts")
    expect(outcome).toContain("nearest known Core anchor")
    expect(outcome).toContain("exact accepted update and resulting tree fingerprints")

    for (const row of [
      "| text | tree-ready | bounded offset-independent text items reproduce accepted facts |",
      "| mixed Text Runs | tree-ready | source/style identity and shaping advances remain exact across style boundaries |",
      "| resolved fields | tree-ready | resolved value and generated-owner/source identity remain retained |",
      "| generated page numbers | tree-ready | retained as an explicit atomic flow item |",
      "| hard breaks | tree-ready | retained as explicit mandatory-break items; hard-break-only empty layout is still blocked |",
      "| inline image | NO-GO | no accepted line-box/baseline geometry in this tree foundation |",
      "| list and list decoration | NO-GO | list marker, numbering, gap, and indent ownership are not implemented |",
      "| empty block | NO-GO | empty/effectively empty line geometry remains unaccepted |",
      "| positioned objects | not present / NO-GO | no canonical positioned-object contract or spatial index is introduced |",
      "| spatial wrapping | NO-GO | no exclusion geometry or Flow Region Provider is implemented |",
      "| Columns/Table | NO-GO | no container integration is claimed; Table retains grid/width ownership |",
      "| Table auto-fit | NO-GO | intrinsic measurement and auto-fit ownership remain separate later work |",
      "| Editor/Backend/publication/production | NO-GO | no runtime binding, public product activation, publication, or production behavior changes |",
    ]) expect(capabilities).toContain(row)

    for (const row of [
      "| Thai insertion at 2,433 | 21 / 3 / 4 | 81 / 82 | 2 / 3 | 396,752 | 4 / 4 / 0 | 2 / 2 | line 63 -> 63; offset 2,472 -> 2,473; delta +1 |",
      "| 18 pt Bold replacement at 1,550 | 21 / 3 / 4 | 54 / 54 | 2 / 3 | 424,002 | 4 / 4 / 0 | 2 / 2 | line 39 -> 39; offset 1,556 -> 1,556; delta 0 |",
      "| field-adjacent insertion at 2,356 | 21 / 3 / 4 | 124 / 125 | 2 / 2 | 395,730 | 4 / 4 / 0 | 3 / 2 | line 62 -> 62; offset 2,432 -> 2,433; delta +1 |",
      "| deletion at 2,433 | 21 / 3 / 4 | 81 / 80 | 2 / 3 | 396,174 | 4 / 4 / 0 | 2 / 2 | line 63 -> 63; offset 2,472 -> 2,471; delta -1 |",
    ]) expect(structural).toContain(row)

    const stagedDefinition = feedback.match(/`stagedCoverageCompatible: true`[^.]+\./u)?.[0]
    expect(stagedDefinition).toBe(
      "`stagedCoverageCompatible: true` means only stable ordered identity and resumable range references.",
    )
    expect(stagedDefinition).not.toContain("structural sharing")
    expect(feedback).toContain("Structural sharing is a separate implementation fact of the persistent tree.")
    expect(feedback).toContain("`stagedEditorApply: false` remains authoritative.")
    expect(feedback).toContain("Design B1 is compatibility evidence only, not Editor implementation.")

    expect(blockers).toContain("Editor product binding is NO-GO.")
    expect(blockers).toContain("Complete next-request validation")
    expect(blockers).toContain("complete shaping-run, cluster, break-offset, and line arrays")
    expect(verification).toContain("Combined focused result: 7 test files passed / 33 tests passed.")
    expect(verification).toContain("Reverted-timeout focused result: 3 test files passed / 22 tests passed")
    expect(verification).toContain("Final full `npm run check`: 412 test files passed / 2,047 tests passed")
    expect(next).toContain(phase3Pointer)
    expect(next).toContain(phase3NoGo)
    expect(next).not.toContain("Phase 2 Persistent Flow Tree Foundation")
  })

  it("pins exact public exports and section-bounded cross-runtime and ledger pointers", () => {
    const publicIndexLines = read("src/index.ts").split(/\r?\n/u)
    const crossRuntime = read("docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const ledger = read("docs/PHASE_LEDGER.md")
    const currentTask = normalize(sectionAtPeerHeading(crossRuntime, "## First Task For The Next Thread"))
    const requiredReading = normalize(sectionAtPeerHeading(crossRuntime, "## Required Reading"))
    const activePrompt = normalize(sectionAtPeerHeading(crossRuntime, "## Handoff Prompt"))
    const currentTruth = normalize(sectionAtPeerHeading(crossRuntime, "## MR1-Q Persistent Flow Tree Foundation"))
    const ledgerMr1q = normalize(sectionAtPeerHeading(ledger, "## MR1-Q Persistent Flow Tree Foundation"))

    for (const statement of [
      'export * from "./layout/textBlockPersistentFlowContractV1.js"',
      'export * from "./layout/textBlockPersistentFlowTreeV1.js"',
      'export * from "./layout/textBlockPersistentFlowUpdateV1.js"',
    ]) expect(publicIndexLines).toContain(statement)

    expect(requiredReading).toContain("`docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md`")
    expect(requiredReading).toContain("`docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md`")
    for (const active of [currentTruth, ledgerMr1q]) {
      expect(active).toContain("MR1-Q Persistent Flow Tree Foundation")
      expect(active).toContain("Phase 3: Core Spatial Wrapping 3A")
    }
    expect(currentTask).toContain(phase4bPointer)
    expect(activePrompt).toContain("accepted Phase 4B Core implementation head f8eb3ba")
    for (const active of [currentTask, activePrompt]) {
      expect(active).toContain(phase4bNoGo)
      expect(active).toContain(phase5Gate)
      expect(active).not.toContain("completeNextSemanticPassCount: 1")
      expect(active).not.toContain("Proceed to Phase 2")
      for (const directive of supersededActiveDirectives) expect(active).not.toContain(directive)
    }
    expect(currentTruth).toContain("passed 7 files / 33 tests")
    expect(currentTruth).toContain("passed 412 files / 2,047 tests")
    expect(ledgerMr1q).toContain("combined focused gate passed 7 files / 33 tests")
    expect(ledgerMr1q).toContain("full `npm run check` passed 412 files / 2,047 tests")
  })

  it("keeps timeout changes scoped to the Phase 2 persistent-flow stress tests", () => {
    const handoff = read("docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md")
    const phase2UpdateTests = read("tests/textBlockPersistentFlowUpdateV1.test.ts")
    const unrelatedTests = [
      "tests/activeTextBlockIsland.test.ts",
      "tests/textEngineWasmToolchainProvisioningExecutionGate.test.ts",
      "tests/textEngineWasmToolchainRustUpgradeExecutionGate.test.ts",
    ]
    for (const path of unrelatedTests) {
      expect(read(path)).not.toMatch(/\},\s*15_000\)/u)
    }
    expect(phase2UpdateTests.match(/\},\s*30_000\)/gu)).toHaveLength(3)
    expect(read("vitest.config.ts")).not.toContain("testTimeout")
    expect(handoff).toContain(
      "Task-local explicit timeout budgets remain only on the Phase 2 5,000-cluster persistent-flow update tests.",
    )
    expect(handoff).toContain(
      "No global Vitest timeout configuration or unrelated test timeout remains changed.",
    )
  })
})
