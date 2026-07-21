import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")
const normalize = (value: string): string => value.replace(/\s+/g, " ").trim()
const sectionBetween = (document: string, start: string, end: string): string => {
  const startIndex = document.indexOf(start)
  const endIndex = document.indexOf(end, startIndex + start.length)

  expect(startIndex).toBeGreaterThanOrEqual(0)
  expect(endIndex).toBeGreaterThan(startIndex)
  return document.slice(startIndex, endIndex)
}
const sectionAtPeerHeading = (document: string, start: string): string => {
  const startIndex = document.indexOf(start)

  expect(startIndex).toBeGreaterThanOrEqual(0)
  const nextHeadingIndex = document.indexOf("\n## ", startIndex + start.length)
  return document.slice(startIndex, nextHeadingIndex < 0 ? document.length : nextHeadingIndex)
}

const runtimeBaseline = "b686c99"
const phase2Exclusions =
  "Do not start spatial wrapping, list decoration, inline-image geometry, empty-block geometry, Editor, Backend, table auto-fit, publication, or production activation in this checkpoint."

describe("Live Draft MR1-P complete geometry boundary", () => {
  it("bounds an MR1-P ledger section at the next peer heading", () => {
    const ledger = [
      "## LIVE-DRAFT-MR1-P Complete Geometry Boundary",
      "MR1-P evidence",
      "## LIVE-DRAFT-LATER",
      "later evidence must not leak",
    ].join("\n")

    const mr1p = sectionAtPeerHeading(ledger, "## LIVE-DRAFT-MR1-P Complete Geometry Boundary")
    expect(mr1p).toContain("MR1-P evidence")
    expect(mr1p).not.toContain("later evidence must not leak")
  })

  it("records capability truth, retained dependencies, and the reviewed baseline", () => {
    const boundary = read("../docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md")
    const handoff = read("../docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    const handoffHeader = sectionBetween(handoff, "# ", "## Objective")
    const handoffMr1p = sectionAtPeerHeading(handoff, "## LIVE-DRAFT-MR1-P Complete Geometry Boundary")
    const ledgerMr1p = sectionAtPeerHeading(ledger, "## LIVE-DRAFT-MR1-P Complete Geometry Boundary")

    for (const section of [
      "## Outcome",
      "## Capability Matrix",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Verification",
      "## Next Checkpoint",
    ]) expect(boundary).toContain(section)

    expect(boundary).toContain("Initial TextBlock Flow")
    expect(boundary).toContain("text-subset-ready")
    expect(boundary).toContain("geometry-contract-required")
    expect(boundary).toContain("blocked-line-box-contract")
    expect(boundary).toContain("blocked-decoration-contract")
    expect(boundary).toContain("blocked-empty-layout-contract")
    expect(boundary).toContain("mayPublishLayout: false")
    expect(boundary).toContain("Persistent Flow Tree Foundation")
    expect(handoff.split(/\r?\n/, 1)[0]).toContain("MR1-P")
    expect(handoffHeader).toContain("updated through the bounded MR1-P checkpoint")
    expect(handoffHeader).not.toContain("MR1-O")
    expect(handoff).toContain("LIVE-DRAFT-MR1-P Complete Geometry Boundary")
    expect(handoff).toContain(`| \`flowdoc-vnext-core\` | \`${runtimeBaseline}\` |`)
    expect(ledger).toContain("## LIVE-DRAFT-MR1-P Complete Geometry Boundary")
    for (const document of [boundary, ledgerMr1p]) {
      expect(document).toContain(`Reviewed Core runtime baseline: \`${runtimeBaseline}\``)
      expect(document).not.toContain("109675f")
      expect(document).not.toContain("59e89ad")
    }

    expect(handoff).not.toContain("| `flowdoc-vnext-core` | `109675f` |")
    expect(handoff).not.toContain("| `flowdoc-vnext-core` | `59e89ad` |")

    for (const document of [normalize(boundary), normalize(handoffMr1p), normalize(ledgerMr1p)]) {
      for (const evidence of [
        "shared effective shaping-style identity",
        "actual `createFlowDocTextEngineMultiRunLayoutV1(...)` producer",
        "own enumerable key insertion order",
        "data-only contained request",
        "sparse array shape",
        "without reading accessors",
        "blank and whitespace-only `layoutId` values",
        "`layoutId: \"unavailable\"`",
        "malformed runtime input",
        "effectively rendered-empty field",
        "list-only",
        "inline-image-only",
        "authored local `fontFamilyKey` overrides remain blocked",
      ]) expect(document).toContain(evidence)
    }
  })

  it("limits adapter exclusivity to the new Initial Flow handoff path", () => {
    const boundary = normalize(read("../docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md"))
    const handoff = normalize(read("../docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md"))

    for (const document of [boundary, handoff]) {
      expect(document).toContain(
        "The new Initial Flow handoff path invokes legacy MR1 only through the explicit adapter.",
      )
      expect(document).toContain(
        "For accepted text-subset-ready rows, the adapter reproduces exact legacy MR1 layout parity.",
      )
      expect(document).toContain(
        "Unsupported capability rows fail closed before the adapter invokes legacy layout.",
      )
    }

    expect(handoff).not.toContain("The existing MR1 layout is now reachable only")
    expect(boundary).not.toContain("Only a classified `text-subset-ready` input may enter it")
  })

  it("retains the non-production gate and every Phase 2 exclusion", () => {
    const boundary = normalize(read("../docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md"))
    const rawHandoff = read("../docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const handoff = normalize(rawHandoff)
    const ledger = normalize(
      sectionAtPeerHeading(read("../docs/PHASE_LEDGER.md"), "## LIVE-DRAFT-MR1-P Complete Geometry Boundary"),
    )
    const prompt = normalize(sectionBetween(rawHandoff, "## Handoff Prompt", "## LIVE-DRAFT-XR-0"))

    for (const document of [boundary, handoff, ledger]) {
      expect(document).toContain(
        "The Initial Flow handoff remains non-production and non-publishable",
      )
      expect(document).toContain("publication and production activation remain NO-GO")
      expect(document).toContain("mayPublishLayout: false")
      expect(document).toContain(phase2Exclusions)
    }

    expect(prompt).toContain("Phase 2 Persistent Flow Tree Foundation")
    expect(prompt).toContain("persistent B+ rope")
    expect(prompt).toContain("completeNextSemanticPassCount: 1")
    expect(prompt).toContain(phase2Exclusions)
    for (const stalePromptText of [
      "LIVE-DRAFT-XR-5",
      "nine-row",
      "MR1-O",
      "all three repositories",
      "commit and push each changed repository",
    ]) expect(prompt).not.toContain(stalePromptText)
  })

  it("guards the public Initial Flow exports", () => {
    const index = read("../src/index.ts")
    const boundary = read("../docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md")
    const handoff = read("../docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const ledger = sectionAtPeerHeading(
      read("../docs/PHASE_LEDGER.md"),
      "## LIVE-DRAFT-MR1-P Complete Geometry Boundary",
    )
    const requiredReading = sectionBetween(handoff, "## Required Reading", "## Handoff Prompt")
    const normalizedBoundary = normalize(boundary)
    const normalizedLedger = normalize(ledger)

    expect(index).toContain('export * from "./layout/textBlockInitialFlowParentRegionV1.js"')
    expect(index).toContain('export * from "./layout/textBlockEffectiveShapingStyleIdentityV1.js"')
    expect(index).toContain('export * from "./layout/textBlockInitialFlowInputV1.js"')
    expect(index).toContain('export * from "./layout/textBlockInitialFlowTextOnlyAdapterV1.js"')

    for (const path of [
      "docs/superpowers/specs/2026-07-21-persistent-text-block-spatial-flow-design.md",
      "docs/superpowers/plans/2026-07-21-text-block-complete-geometry-boundary.md",
      "docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md",
      "src/layout/textBlockEffectiveShapingStyleIdentityV1.ts",
      "src/layout/textBlockInitialFlowParentRegionV1.ts",
      "src/layout/textBlockInitialFlowInputV1.ts",
      "src/layout/textBlockInitialFlowTextOnlyAdapterV1.ts",
      "tests/textBlockInitialFlowParentRegionV1.test.ts",
      "tests/textBlockInitialFlowInputV1.test.ts",
      "tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts",
    ]) expect(requiredReading).toContain(`\`${path}\``)

    for (const path of [
      "packages/text-engine-rust-wasm/src/multiRunLayout.ts",
      "src/layout/textBlockEffectiveShapingStyleIdentityV1.ts",
      "tests/liveDraftMr1CompleteGeometryBoundary.test.ts",
      "tests/textBlockInitialFlowParentRegionV1.test.ts",
      "tests/textBlockInitialFlowInputV1.test.ts",
      "tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts",
      "tests/textBlockMultiRunLayoutV1.test.ts",
    ]) expect(boundary).toContain(`\`${path}\``)

    for (const path of [
      "docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md",
      "src/layout/textBlockEffectiveShapingStyleIdentityV1.ts",
      "tests/textBlockInitialFlowParentRegionV1.test.ts",
      "tests/textBlockInitialFlowInputV1.test.ts",
      "tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts",
    ]) expect(ledger).toContain(`\`${path}\``)

    for (const publicFunction of [
      "createVNextTextBlockInitialFlowParentRegionV1(...)\n",
      "inspectVNextTextBlockInitialFlowParentRegionV1(...)\n",
      "createVNextTextBlockEffectiveShapingStyleIdentityV1(...)\n",
      "createVNextTextBlockInitialFlowV1(...)\n",
      "inspectVNextTextBlockInitialFlowV1(...)\n",
      "adaptVNextTextBlockInitialFlowToLegacyLayoutV1(...)\n",
    ]) expect(boundary).toContain(publicFunction.trim())

    for (const evidence of [
      "process-local classifier provenance",
      "`declaredLineHeightLayoutUnit`",
      "`resolvedGeometryStyle`",
      "`measurementStyleKey`",
      "`effectiveShapingStyleKey`",
      "`paragraphFontFamilyKey`",
      "strict canonical validation",
    ]) {
      expect(normalizedBoundary).toContain(evidence)
      expect(normalizedLedger).toContain(evidence)
    }

    expect(normalizedBoundary).toContain("does not create cross-process serialization authority")
    expect(normalizedBoundary).toContain("supported styled text and resolved fields")
    expect(normalizedBoundary).toContain("`fontFamilyKey`")
    expect(normalizedBoundary).toContain("`resolved-run-typography`")
    expect(normalizedLedger).toContain("`fontFamilyKey`")
    expect(normalizedLedger).toContain("`resolved-run-typography`")
    expect(boundary).toContain("5 test files passed; 95 tests passed")
    expect(boundary).toContain("1 test file passed; 5 tests passed")
    expect(boundary).toContain("408 test files passed; 2008 tests passed")
    expect(normalizedLedger).toContain("passed 5 test files / 95 tests")
    expect(normalizedLedger).toContain("documentation guard passed 1 test file / 5 tests")
    expect(normalizedLedger).toContain("full gate passed 408 test files / 2008 tests")
  })
})
