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
const supersededActiveDirectives = [
  "Proceed only to `Phase 3: Core Spatial Wrapping 3A`.",
  "Proceed only to `Phase 4: Initial TextBlock Geometry`.",
  "Stop after Phase 4A.",
] as const
const exportMap = (index: string): { symbols: Map<string, ReadonlySet<string>>; wildcards: ReadonlySet<string> } => {
  const symbols = new Map<string, Set<string>>()
  const wildcards = new Set<string>()
  for (const match of index.matchAll(/export\s+\*\s+from\s+"([^"]+)"/gu)) {
    wildcards.add(match[1]!)
  }
  for (const match of index.matchAll(/export\s*\{([\s\S]*?)\}\s*from\s*"([^"]+)"/gu)) {
    const module = match[2]!
    const values = symbols.get(module) ?? new Set<string>()
    for (const value of match[1]!.split(",").map((item) => item.trim()).filter(Boolean)) values.add(value)
    symbols.set(module, values)
  }
  return { symbols, wildcards }
}

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
    const architecture = normalize(sectionAtPeerHeading(handoff, "## Architecture Evidence"))
    const runtime = normalize(sectionAtPeerHeading(handoff, "## Producer And Runtime Evidence"))
    const persistent = normalize(sectionAtPeerHeading(handoff, "## Persistent Flow Evidence"))
    const spatial = normalize(sectionAtPeerHeading(handoff, "## Spatial Wrapping Evidence"))
    const authoredBox = normalize(sectionAtPeerHeading(handoff, "## Authored Box Evidence"))
    const pass = normalize(sectionAtPeerHeading(handoff, "## PASS"))
    const blocker = normalize(sectionAtPeerHeading(handoff, "## FAIL / BLOCKER"))
    const verification = normalize(sectionAtPeerHeading(handoff, "## Verification"))
    const unchanged = normalize(sectionAtPeerHeading(handoff, "## Intentionally Not Changed"))
    const next = normalize(sectionAtPeerHeading(handoff, "## Next Checkpoint"))

    expect(status).toContain("Status: implemented and accepted as the bounded Core-only Phase 4B checkpoint.")
    expect(status).toContain("`mayPublishLayout: false`")
    expect(status).toContain("`productionBinding: false`")
    expect(status).toContain(`accepted Task 11 implementation head \`${implementationHead}\``)
    for (const evidence of [
      "`textBlockPersistentFlowTreeInternalsV1.ts`", "`textBlockFlowRegionKernelV1.ts`", "`textBlockSpatialWrappingKernelV1.ts`", "`textBlockAuthoredBoxGeometryKernelV1.ts`",
      "`tests/textBlockV1LayoutCompatibility.test.ts`", "V2 text-only path is normalized",
    ]) expect(architecture).toContain(evidence)
    for (const evidence of ["`node-native-mr1`", "`browser-worker-wasm-mr1`", "Node-native and Worker-WASM U+FFFC", "neither U+FFFC nor hard breaks"]) expect(runtime).toContain(evidence)
    for (const evidence of ["`src/layout/textBlockPersistentFlowTreeV2.ts`", "exact upstream Initial Flow/evidence provenance", "no MR1-Q, reuse, or reconvergence claim", "Stale, cloned, structurally equal replacement, accessor-shaped, proxy-shaped, mutable, re-fingerprinted, altered dependency, and production-bound", "no partial tree"]) expect(persistent).toContain(evidence)
    for (const evidence of ["multi-interval", "barriers", "overlay-neutral", "zero-space", "expanded-band", "Move and horizontal-resize", "exact tree/index/update/provider/layout authorities", "no partial intervals, lines, or work", "`stagedEditorApply: false`"]) expect(spatial).toContain(evidence)
    for (const evidence of ["`src/layout/textBlockAuthoredBoxGeometryV2.ts`", "auto-height", "fixed-height", "exact spatial result, plan, and parent dependencies", "null geometry, lines, summary, and fingerprint", "`stagedEditorApply: false`"]) expect(authoredBox).toContain(evidence)
    expect(pass).toContain("V1 compatibility remains characterized")
    expect(blocker).toContain("fixed-height, overflow, or clipping")
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
      for (const directive of supersededActiveDirectives) expect(record).not.toContain(directive)
    }
    expect(design).toContain("**Status:** Implemented and accepted as the bounded Core-only Phase 4B checkpoint")
  })

  it("maps the complete public Phase 4B exports to their intended modules", () => {
    const exports = exportMap(read("src/index.ts"))
    const expected: Record<string, readonly string[]> = {
      "./layout/textBlockInlineImageLineBoxV1.js": ["*"],
      "./layout/textBlockFlowEvidenceContractV2.js": ["*"],
      "./layout/textBlockFlowEvidenceV2.js": ["acceptVNextTextBlockFlowEvidenceV2", "inspectVNextTextBlockFlowEvidenceV2"],
      "./layout/textBlockPersistentFlowContractV2.js": ["*"],
      "./layout/textBlockPersistentFlowTreeV2.js": ["createVNextTextBlockPersistentFlowTreeV2", "inspectVNextTextBlockPersistentFlowTreeV2", "collectVNextTextBlockPersistentFlowNodesForQaV2"],
      "./layout/textBlockSpatialIndexContractV2.js": ["*"],
      "./layout/textBlockSpatialIndexV2.js": ["createVNextTextBlockSpatialIndexV2", "inspectVNextTextBlockSpatialIndexV2"],
      "./layout/textBlockSpatialIndexUpdateV2.js": ["createVNextTextBlockSpatialIndexUpdateV2", "inspectVNextTextBlockSpatialIndexUpdateV2"],
      "./layout/textBlockFlowRegionProviderV2.js": ["provideVNextTextBlockFlowRegionsV2", "inspectVNextTextBlockFlowRegionResultV2"],
      "./layout/textBlockSpatialWrappingLayoutContractV2.js": ["*"],
      "./layout/textBlockSpatialWrappingLayoutV2.js": ["layoutVNextTextBlockSpatialWrappingV2", "inspectVNextTextBlockSpatialWrappingLayoutV2"],
      "./layout/textBlockAuthoredBoxGeometryContractV2.js": ["*"],
      "./layout/textBlockAuthoredBoxGeometryV2.js": ["*"],
    }
    for (const [module, expectedSymbols] of Object.entries(expected)) {
      const actual = expectedSymbols.includes("*") ? exports.wildcards.has(module) ? ["*"] : [] : [...exports.symbols.get(module) ?? []]
      expect(actual.sort()).toEqual([...expectedSymbols].sort())
    }
    const privileged = /^\.\/layout\/.*(?:kernel|internals|authority|token|registry|private)/iu
    for (const module of [...exports.symbols.keys(), ...exports.wildcards]) expect(module).not.toMatch(privileged)
  })
})
