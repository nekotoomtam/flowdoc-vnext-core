import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  resolveTypeScriptRootExports,
  type TypeScriptModuleSourceLoader,
} from "./helpers/typescriptExportResolver.js"

const read = (path: string): string => readFileSync(resolve(path), "utf8")
const normalize = (value: string): string => value.replace(/\s+/gu, " ").trim()
const sectionAtPeerHeading = (document: string, heading: string): string => {
  const startIndex = document.indexOf(heading)
  expect(startIndex).toBeGreaterThanOrEqual(0)
  const nextHeadingIndex = document.indexOf("\n## ", startIndex + heading.length)
  return document.slice(startIndex, nextHeadingIndex < 0 ? document.length : nextHeadingIndex)
}
const replaceInSection = (
  document: string,
  heading: string,
  search: string,
  replacement: string,
): string => {
  const section = sectionAtPeerHeading(document, heading)
  expect(section).toContain(search)
  return document.replace(section, section.replace(search, replacement))
}

const handoffPath = "docs/LIVE_DRAFT_MR1_INLINE_IMAGE_GEOMETRY_4B.md"
const implementationHead = "f8eb3ba"
const deferredNoGo =
  "List decoration, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO."
const phase5Gate =
  "Phase 5 remains separately authorized; this handoff does not authorize Phase 5 implementation or activation."
const authorityAttackClasses = [
  "stale",
  "cloned",
  "structurally equal replacement",
  "accessor-shaped",
  "proxy-shaped",
  "mutable",
  "re-fingerprinted",
  "altered dependency",
  "production-bound",
] as const
const falseCapabilityFlags = [
  "`mayPublishLayout: false`",
  "`productionBinding: false`",
  "`stagedEditorApply: false`",
] as const
const supersededActiveDirectives = [
  "Proceed only to `Phase 3: Core Spatial Wrapping 3A`.",
  "Proceed only to `Phase 4: Initial TextBlock Geometry`.",
  "Stop after Phase 4A.",
] as const
const loadPhase4BModuleSource: TypeScriptModuleSourceLoader = (modulePath) => read(
  `src/${modulePath.replace(/^\.\//u, "").replace(/\.js$/u, ".ts")}`,
)
const withModuleSourceOverrides = (
  overrides: Readonly<Record<string, string>>,
): TypeScriptModuleSourceLoader => (modulePath) => overrides[modulePath]
  ?? loadPhase4BModuleSource(modulePath)

const phase4BExpectedExports: Readonly<Record<string, readonly string[]>> = {
  "./layout/textBlockInlineImageLineBoxV1.js": [
    "VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1",
    "VNextTextBlockBaselineExtentV1",
    "VNextTextBlockInlineImageLineMetricsResultV1",
    "VNextTextBlockFlowLineMetricsResultV2",
    "resolveVNextTextBlockInlineImageLineMetricsV1",
    "combineVNextTextBlockFlowLineMetricsV2",
  ],
  "./layout/textBlockFlowEvidenceContractV2.js": [
    "VNextTextBlockFlowEvidenceInputV2",
    "VNextTextBlockFlowEvidenceV2",
    "VNextTextBlockFlowEvidenceIssueV2",
    "VNextTextBlockFlowEvidenceAcceptanceResultV2",
    "VNextTextBlockFlowEvidenceInspectionV2",
  ],
  "./layout/textBlockFlowEvidenceV2.js": ["acceptVNextTextBlockFlowEvidenceV2", "inspectVNextTextBlockFlowEvidenceV2"],
  "./layout/textBlockPersistentFlowContractV2.js": [
    "VNextTextBlockPersistentFlowAtomV2",
    "VNextTextBlockPersistentFlowSummaryV2",
    "VNextTextBlockPersistentFlowLeafV2",
    "VNextTextBlockPersistentFlowBranchV2",
    "VNextTextBlockPersistentFlowNodeV2",
    "VNextTextBlockPersistentFlowTreeV2",
    "VNextTextBlockPersistentFlowBuildIssueCodeV2",
    "VNextTextBlockPersistentFlowBuildResultV2",
  ],
  "./layout/textBlockPersistentFlowTreeV2.js": ["createVNextTextBlockPersistentFlowTreeV2", "inspectVNextTextBlockPersistentFlowTreeV2", "collectVNextTextBlockPersistentFlowNodesForQaV2"],
  "./layout/textBlockSpatialIndexContractV2.js": [
    "VNEXT_TEXT_BLOCK_SPATIAL_INDEX_V2_SOURCE",
    "VNEXT_TEXT_BLOCK_SPATIAL_INDEX_V2_VERSION",
    "VNextTextBlockSpatialIndexV2",
    "VNextTextBlockSpatialIssueV2",
    "VNextTextBlockSpatialIndexBuildResultV2",
    "VNextTextBlockSpatialIndexInspectionV2",
    "VNextTextBlockSpatialIndexBuildInputV2",
    "VNextTextBlockSpatialIndexUpdateResultV2",
    "VNextTextBlockSpatialIndexUpdateInspectionV2",
    "VNextTextBlockFlowIntervalV2",
    "VNextTextBlockFlowRegionResultV2",
    "VNextTextBlockSpatialBandV1",
    "VNextTextBlockSpatialIndexEntryV1",
    "VNextTextBlockSyntheticPositionedObjectInputV1",
  ],
  "./layout/textBlockSpatialIndexV2.js": ["createVNextTextBlockSpatialIndexV2", "inspectVNextTextBlockSpatialIndexV2"],
  "./layout/textBlockSpatialIndexUpdateV2.js": ["createVNextTextBlockSpatialIndexUpdateV2", "inspectVNextTextBlockSpatialIndexUpdateV2"],
  "./layout/textBlockFlowRegionProviderV2.js": ["provideVNextTextBlockFlowRegionsV2", "inspectVNextTextBlockFlowRegionResultV2"],
  "./layout/textBlockSpatialWrappingLayoutContractV2.js": [
    "VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_SOURCE",
    "VNEXT_TEXT_BLOCK_SPATIAL_WRAPPING_LAYOUT_V2_VERSION",
    "VNextTextBlockSpatialTextFragmentV2",
    "VNextTextBlockSpatialInlineImageFragmentV2",
    "VNextTextBlockSpatialFragmentV2",
    "VNextTextBlockSpatialWrappedLineV2",
    "VNextTextBlockSpatialWrappingIssueCodeV2",
    "VNextTextBlockSpatialWrappingIssueV2",
    "VNextTextBlockSpatialWrappingLayoutResultV2",
    "VNextTextBlockSpatialWrappingLayoutInspectionV2",
  ],
  "./layout/textBlockSpatialWrappingLayoutV2.js": ["layoutVNextTextBlockSpatialWrappingV2", "inspectVNextTextBlockSpatialWrappingLayoutV2"],
  "./layout/textBlockAuthoredBoxGeometryContractV2.js": [
    "VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_SOURCE",
    "VNEXT_TEXT_BLOCK_AUTHORED_BOX_GEOMETRY_V2_VERSION",
    "VNextTextBlockAuthoredBoxTextFragmentV2",
    "VNextTextBlockAuthoredBoxInlineImageFragmentV2",
    "VNextTextBlockAuthoredBoxFragmentV2",
    "VNextTextBlockAuthoredBoxLineV2",
    "VNextTextBlockAuthoredBoxGeometryResultV2",
    "VNextTextBlockAuthoredBoxGeometryInspectionV2",
  ],
  "./layout/textBlockAuthoredBoxGeometryV2.js": [
    "layoutVNextTextBlockAuthoredBoxGeometryV2",
    "inspectVNextTextBlockAuthoredBoxGeometryV2",
  ],
}
const phase4BV2RootModulePaths = Object.keys(phase4BExpectedExports)
  .filter((modulePath) => /V2\.js$/u.test(modulePath))
const isPhase4BRootModule = (modulePath: string): boolean =>
  modulePath === "./layout/textBlockInlineImageLineBoxV1.js"
  || /^\.\/layout\/.*V2\.js$/iu.test(modulePath)

const assertPhase4BExports = (
  index: string,
  loadModuleSource: TypeScriptModuleSourceLoader,
): void => {
  const exports = resolveTypeScriptRootExports(
    index,
    loadModuleSource,
    isPhase4BRootModule,
  )
  const actualV2RootModulePaths = [...exports.rootModulePaths]
    .filter((modulePath) => /^\.\/layout\/.*V2\.js$/iu.test(modulePath))
  expect(actualV2RootModulePaths.sort()).toEqual([...phase4BV2RootModulePaths].sort())
  expect([...exports.rootLocalSymbols]).toEqual([])
  for (const [module, expectedSymbols] of Object.entries(phase4BExpectedExports)) {
    const actual = [...exports.resolvedSymbolsByRootModule.get(module) ?? []]
    expect(actual.sort()).toEqual([...expectedSymbols].sort())
  }
  const privileged = /(?:kernel|internals|authority|token|registry|private)/iu
  for (const modulePath of exports.rootModulePaths) {
    if (modulePath.startsWith("./layout/")) expect(modulePath).not.toMatch(privileged)
  }
  for (const modulePath of exports.traversedModulePaths) {
    expect(modulePath).not.toMatch(privileged)
  }
  for (const symbol of exports.rootLocalSymbols) expect(symbol).not.toMatch(privileged)
  for (const symbols of exports.resolvedSymbolsByRootModule.values()) {
    for (const symbol of symbols) expect(symbol).not.toMatch(privileged)
  }
}

const assertFalseCapabilityFlags = (section: string): void => {
  for (const flag of falseCapabilityFlags) expect(section).toContain(flag)
}

const assertBoundaryEvidence = (
  section: string,
  noPartialClaim: string,
): void => {
  const lowerCaseSection = section.toLocaleLowerCase("en-US")
  for (const attack of authorityAttackClasses) {
    expect(lowerCaseSection).toContain(attack)
  }
  assertFalseCapabilityFlags(section)
  expect(lowerCaseSection).toContain(noPartialClaim)
}

const assertHandoffEvidence = (handoff: string): void => {
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
  const outcome = normalize(sectionAtPeerHeading(handoff, "## Outcome"))
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
  assertFalseCapabilityFlags(status)
  assertFalseCapabilityFlags(outcome)
  expect(status).toContain(`accepted Task 11 implementation head \`${implementationHead}\``)
  for (const evidence of [
    "`textBlockPersistentFlowTreeInternalsV1.ts`", "`textBlockFlowRegionKernelV1.ts`", "`textBlockSpatialWrappingKernelV1.ts`", "`textBlockAuthoredBoxGeometryKernelV1.ts`",
    "`tests/textBlockV1LayoutCompatibility.test.ts`", "V2 text-only path is normalized",
  ]) expect(architecture).toContain(evidence)
  for (const evidence of ["`node-native-mr1`", "`browser-worker-wasm-mr1`", "Node-native and Worker-WASM U+FFFC", "neither U+FFFC nor hard breaks"]) expect(runtime).toContain(evidence)
  for (const evidence of ["`src/layout/textBlockPersistentFlowTreeV2.ts`", "exact upstream Initial Flow/evidence provenance", "no MR1-Q, reuse, or reconvergence claim"]) expect(persistent).toContain(evidence)
  for (const evidence of ["multi-interval", "barriers", "overlay-neutral", "zero-space", "expanded-band", "Move and horizontal-resize", "exact tree/index/update/provider/layout authorities"]) expect(spatial).toContain(evidence)
  for (const evidence of ["`src/layout/textBlockAuthoredBoxGeometryV2.ts`", "auto-height", "fixed-height", "exact spatial result, plan, and parent dependencies"]) expect(authoredBox).toContain(evidence)
  assertBoundaryEvidence(
    persistent,
    "no partial persistent tree, root, summary, or fingerprint",
  )
  assertBoundaryEvidence(
    spatial,
    "no partial spatial intervals, lines, work, or fingerprint",
  )
  assertBoundaryEvidence(
    authoredBox,
    "no partial authored geometry, lines, summary, or fingerprint",
  )
  expect(pass).toContain("V1 compatibility remains characterized")
  expect(blocker).toContain("fixed-height, overflow, or clipping")
  expect(blocker).toContain(deferredNoGo)
  expect(verification).toContain("npx vitest run")
  expect(verification).toContain("npm run check")
  expect(unchanged).toContain("incremental edits")
  expect(unchanged).toContain("reuse")
  expect(next).toContain(phase5Gate)
}

describe("Live Draft MR1 inline-image geometry 4B handoff", () => {
  it("records the accepted Core-only evidence, scope limits, and next authorization gate", () => {
    assertHandoffEvidence(read(handoffPath))
  })

  it("rejects handoff mutations that remove an authority attack or false capability flag", () => {
    const handoff = read(handoffPath)
    const mutations = [
      replaceInSection(handoff, "## Authored Box Evidence", "proxy-shaped, ", ""),
      replaceInSection(handoff, "## Spatial Wrapping Evidence", "`mayPublishLayout: false`", ""),
    ]

    for (const mutation of mutations) {
      expect(() => assertHandoffEvidence(mutation)).toThrow()
    }
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
    assertPhase4BExports(read("src/index.ts"), loadPhase4BModuleSource)
  })

  it("resolves declarations, aliases, defaults, repeated exports, and cycles", () => {
    const sources: Readonly<Record<string, string>> = {
      "./a.js": `
export interface Alpha {}
export type Shape = string
export const value = 1
export function repeated(value: string): string
export function repeated(value: number): number
export function repeated(value: string | number): string | number { return value }
export { cycleName } from "./b.js"
export default class DefaultThing {}
`,
      "./b.js": `
export { value as cycleName } from "./a.js"
export * from "./a.js"
`,
    }
    const loadFixture: TypeScriptModuleSourceLoader = (modulePath) => {
      const source = sources[modulePath]
      if (source == null) throw new Error(`Missing export fixture ${modulePath}`)
      return source
    }
    const resolution = resolveTypeScriptRootExports(`
import { value as importedValue } from "./a.js"
export { importedValue as ImportedAgain }
export { Alpha as PublicAlpha, default as PublicDefault } from "./a.js"
export * as PublicNamespace from "./a.js"
export * from "./b.js"
export { cycleName as CycleAgain } from "./b.js"
`, loadFixture)

    expect([...resolution.resolvedSymbolsByRootModule.get("./a.js") ?? []].sort())
      .toEqual(["ImportedAgain", "PublicAlpha", "PublicDefault", "PublicNamespace"])
    expect([...resolution.resolvedSymbolsByRootModule.get("./b.js") ?? []].sort())
      .toEqual(["Alpha", "CycleAgain", "Shape", "cycleName", "repeated", "value"])
    expect([...resolution.rootLocalSymbols]).toEqual([])
    expect([...resolution.traversedModulePaths].sort()).toEqual(["./a.js", "./b.js"])
  })

  it("suppresses ambiguous names from competing wildcard exports", () => {
    const sources: Readonly<Record<string, string>> = {
      "./left.js": `
export const leftOnly = 1
export const sharedName = "left"
`,
      "./right.js": `
export const rightOnly = 1
export const sharedName = "right"
`,
    }
    const loadFixture: TypeScriptModuleSourceLoader = (modulePath) => {
      const source = sources[modulePath]
      if (source == null) throw new Error(`Missing export fixture ${modulePath}`)
      return source
    }
    const resolution = resolveTypeScriptRootExports(`
export * from "./left.js"
export * from "./right.js"
`, loadFixture)

    expect([...resolution.resolvedSymbolsByRootModule.get("./left.js") ?? []])
      .toEqual(["leftOnly"])
    expect([...resolution.resolvedSymbolsByRootModule.get("./right.js") ?? []])
      .toEqual(["rightOnly"])
  })

  it("keeps only type exports from a type-only wildcard declaration", () => {
    const loadFixture: TypeScriptModuleSourceLoader = (modulePath) => {
      if (modulePath !== "./types.js") {
        throw new Error(`Missing export fixture ${modulePath}`)
      }
      return `
export interface PublicShape { readonly value: string }
export const runtimeOnlyValue = 1
`
    }
    const resolution = resolveTypeScriptRootExports(
      'export type * from "./types.js"\n',
      loadFixture,
    )

    expect([...resolution.resolvedSymbolsByRootModule.get("./types.js") ?? []])
      .toEqual(["PublicShape"])
  })

  it("uses TypeScript resolution for extensionless and directory-index re-exports", () => {
    const sources: Readonly<Record<string, string>> = {
      "./barrel.js": `
export * from "./extensionless"
export * from "./directory"
`,
      "./extensionless.ts": "export interface ExtensionlessShape {}\n",
      "./directory/index.ts": "export const directoryValue = 1\n",
    }
    const loadFixture: TypeScriptModuleSourceLoader = (modulePath) => {
      const source = sources[modulePath]
      if (source == null) throw new Error(`Missing export fixture ${modulePath}`)
      return source
    }
    const resolution = resolveTypeScriptRootExports(
      'export * from "./barrel.js"\n',
      loadFixture,
    )

    expect([...resolution.resolvedSymbolsByRootModule.get("./barrel.js") ?? []].sort())
      .toEqual(["ExtensionlessShape", "directoryValue"])
    expect([...resolution.traversedModulePaths].sort())
      .toEqual(["./barrel.js", "./directory/index.ts", "./extensionless.ts"])
  })

  it("rejects an extra symbol hidden behind an allowed wildcard export", () => {
    const modulePath = "./layout/textBlockFlowEvidenceContractV2.js"
    const loader = withModuleSourceOverrides({
      [modulePath]: `${loadPhase4BModuleSource(modulePath)}
export const extraPhase4BWildcardSymbol = true
`,
    })

    expect(() => assertPhase4BExports(read("src/index.ts"), loader)).toThrow()
  })

  it("rejects an extra non-privileged Phase 4B V2 root module", () => {
    const modulePath = "./layout/textBlockHarmlessExtensionV2.js"
    const loader = withModuleSourceOverrides({
      [modulePath]: "export const harmlessExtensionV2 = true\n",
    })
    const index = `${read("src/index.ts")}
export * from "${modulePath}"
`

    expect(() => assertPhase4BExports(index, loader)).toThrow()
  })

  it("rejects a case-variant privileged path behind an allowed wildcard", () => {
    const modulePath = "./layout/textBlockFlowEvidenceContractV2.js"
    const privilegedPath = "./layout/textBlockAuThOrItYBridgeV2.js"
    const loader = withModuleSourceOverrides({
      [modulePath]: `${loadPhase4BModuleSource(modulePath)}
export * from "./textBlockAuThOrItYBridgeV2.js"
`,
      [privilegedPath]: "export const safeLookingBridgeV2 = true\n",
    })

    expect(() => assertPhase4BExports(read("src/index.ts"), loader)).toThrow()
  })

  it("rejects a direct privileged symbol declared at the root", () => {
    const index = `${read("src/index.ts")}
export const AuThOrItYTokenV2 = true
`

    expect(() => assertPhase4BExports(index, loadPhase4BModuleSource)).toThrow()
  })

  it("rejects a direct privileged V1 wildcard path at the root", () => {
    const index = `${read("src/index.ts")}
export * from "./layout/textBlockFlowRegionKernelV1.js"
`

    expect(() => assertPhase4BExports(index, loadPhase4BModuleSource)).toThrow()
  })
})
