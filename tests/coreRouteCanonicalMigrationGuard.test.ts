import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

function namedCoreImports(source: string): string[] {
  const importBlocks = source.matchAll(
    /import\s*\{(?<symbols>[^}]*)\}\s*from\s*["']\.\.\/src\/index\.js["']/g,
  )

  return Array.from(importBlocks)
    .flatMap((importBlock) => importBlock.groups?.symbols?.split(",") ?? [])
    .map((symbol) => symbol.replace(/^\s*type\s+/, "").trim())
    .map((symbol) => symbol.split(/\s+as\s+/, 1)[0] ?? "")
    .filter((symbol) => symbol.length > 0)
}

function deprecatedRouteExports(source: string): Array<{ kind: string; name: string }> {
  return Array.from(source.matchAll(
    /\/\*\*(?:(?!\*\/)[\s\S])*@deprecated(?:(?!\*\/)[\s\S])*\*\/\s*export\s+(?<kind>const|function|type|interface)\s+(?<name>[A-Za-z0-9_]+)/g,
  )).map((match) => ({
    kind: match.groups?.kind ?? "",
    name: match.groups?.name ?? "",
  }))
}

const FORBIDDEN_ROUTE_RESPONSE_HELPERS = [
  "createVNextGenerationApiRouteResponse",
  "createVNextArtifactGenerationApiRouteResponse",
  "createVNextArtifactStatusApiRouteResponse",
  "createVNextSessionArtifactListApiRouteResponse",
  "createVNextArtifactDownloadMetadataApiRouteResponse",
] as const

const RETAINED_IMPORT_BLOCKS = {
  "tests/generationRuntimeRetainedContract.test.ts": `import {
  assessVNextGenerationReadiness,
  safeParseVNextGenerationRequest,
} from "../src/index.js"`,
  "tests/artifactRetainedContract.test.ts": `import {
  advanceVNextArtifactJob,
  createVNextArtifactJobPlan,
  createVNextArtifactManifestPlan,
  type VNextArtifactJobRecord,
  type VNextArtifactManifestRecord,
} from "../src/index.js"`,
} as const

const EXPECTED_RETAINED_IMPORTS = {
  "tests/generationRuntimeRetainedContract.test.ts": [
    "assessVNextGenerationReadiness",
    "safeParseVNextGenerationRequest",
  ],
  "tests/artifactRetainedContract.test.ts": [
    "advanceVNextArtifactJob",
    "createVNextArtifactJobPlan",
    "createVNextArtifactManifestPlan",
    "VNextArtifactJobRecord",
    "VNextArtifactManifestRecord",
  ],
} as const

const MULTI_BLOCK_SENTINEL = "VNextGenerationReadinessResult"

const projectControlClosedTruthCommit = "c9aa003237a5fff8f274b5e7b279ab3125f6bc8c"
const immutableOverviewUrl =
  `https://github.com/nekotoomtam/flowdoc-project-control/blob/${projectControlClosedTruthCommit}/docs/versions/V0_1_0a_1/core/core-route/OVERVIEW.md`
const coreRouteSources = [
  ["docs/", "CORE_ROUTE_DEEXPORT_PLAN.md"].join(""),
  ["docs/", "CORE_ROUTE_DEPRECATION_WINDOW.md"].join(""),
  ["docs/", "CORE_ROUTE_RETAINED_CONTRACT_TEST_REWRITE.md"].join(""),
  ["docs/", "CORE_ROUTE_WINDOW_C_PUBLIC_EXPORT_REMOVAL.md"].join(""),
] as const

function canonicalOverviewLinks(source: string): RegExpMatchArray[] {
  return Array.from(source.matchAll(
    /https:\/\/github\.com\/nekotoomtam\/flowdoc-project-control\/blob\/(?<commit>[^/\s)]+)\/docs\/versions\/V0_1_0a_1\/core\/core-route\/OVERVIEW\.md[^\s)]*/g,
  ))
}

function expectCanonicalOverviewNavigation(source: string): void {
  const links = canonicalOverviewLinks(source)

  expect(links).toHaveLength(2)
  expect(links.map((match) => match[0])).toEqual([
    immutableOverviewUrl,
    immutableOverviewUrl,
  ])
  expect(links.map((match) => match.groups?.commit)).toEqual([
    projectControlClosedTruthCommit,
    projectControlClosedTruthCommit,
  ])
  expect(source).not.toContain("flowdoc-project-control/blob/main/")
  for (const commit of links.map((match) => match.groups?.commit)) {
    expect(commit).toMatch(/^[0-9a-f]{40}$/)
  }
  for (const oldPath of coreRouteSources) {
    expect(source).not.toContain(oldPath)
  }
}

describe("immutable canonical Core route navigation mutations", () => {
  const validNavigation = [
    `[first](${immutableOverviewUrl})`,
    `[second](${immutableOverviewUrl})`,
  ].join("\n")
  const differentCommit = "0".repeat(40)
  const expectedCoreRouteSources = [
    ["docs/CORE_ROUTE_", "DEEXPORT_PLAN.md"].join(""),
    ["docs/CORE_ROUTE_", "DEPRECATION_WINDOW.md"].join(""),
    ["docs/CORE_ROUTE_RETAINED_", "CONTRACT_TEST_REWRITE.md"].join(""),
    ["docs/CORE_ROUTE_WINDOW_", "C_PUBLIC_EXPORT_REMOVAL.md"].join(""),
  ]

  it("retains the exact four old source paths as runtime values", () => {
    expect(coreRouteSources).toEqual(expectedCoreRouteSources)
  })

  it("stores no complete old source path contiguously in the tracked guard", () => {
    const guardSource = readText("tests/coreRouteCanonicalMigrationGuard.test.ts")

    for (const oldPath of coreRouteSources) {
      expect(guardSource).not.toContain(oldPath)
    }
  })

  it("accepts exactly two canonical links at the frozen Project Control truth", () => {
    expectCanonicalOverviewNavigation(validNavigation)
  })

  it.each([
    {
      name: "a third canonical URL",
      mutate: (source: string) => `${source}\n[third](${immutableOverviewUrl})`,
    },
    {
      name: "a different immutable commit",
      mutate: (source: string) => source.replace(
        immutableOverviewUrl,
        immutableOverviewUrl.replace(projectControlClosedTruthCommit, differentCommit),
      ),
    },
    {
      name: "blob/main",
      mutate: (source: string) => source.replace(
        immutableOverviewUrl,
        immutableOverviewUrl.replace(projectControlClosedTruthCommit, "main"),
      ),
    },
    {
      name: "a canonical URL suffix or query",
      mutate: (source: string) => source.replace(
        immutableOverviewUrl,
        `${immutableOverviewUrl}?view=1`,
      ),
    },
    {
      name: "an old removed source path",
      mutate: (source: string) => `${source}\n${coreRouteSources[0]}`,
    },
  ])("rejects $name", ({ mutate }) => {
    const mutatedNavigation = mutate(validNavigation)

    expect(mutatedNavigation).not.toBe(validNavigation)
    expect(() => expectCanonicalOverviewNavigation(mutatedNavigation)).toThrow()
  })
})

describe("named Core import collection mutations", () => {
  for (const retainedTest of Object.keys(RETAINED_IMPORT_BLOCKS) as Array<keyof typeof RETAINED_IMPORT_BLOCKS>) {
    for (const forbiddenHelper of FORBIDDEN_ROUTE_RESPONSE_HELPERS) {
      for (const placement of ["first", "middle", "last"] as const) {
        it(`collects the complete ${retainedTest} union with ${forbiddenHelper} ${placement}`, () => {
          const originalBlock = RETAINED_IMPORT_BLOCKS[retainedTest]
          const sentinelBlock = `import { type ${MULTI_BLOCK_SENTINEL} as Sentinel } from "../src/index.js"`
          const helperBlock = `import { ${forbiddenHelper} as InjectedHelper } from "../src/index.js"`
          const blocks = placement === "first"
            ? [helperBlock, originalBlock, sentinelBlock]
            : placement === "middle"
              ? [originalBlock, helperBlock, sentinelBlock]
              : [originalBlock, sentinelBlock, helperBlock]
          const expected = [
            ...EXPECTED_RETAINED_IMPORTS[retainedTest],
            MULTI_BLOCK_SENTINEL,
            forbiddenHelper,
          ].sort()

          expect(namedCoreImports(blocks.join("\n\n")).sort()).toEqual(expected)
        })
      }
    }
  }
})

describe("canonical Core route migration guard", () => {
  it("pins every canonical overview link to immutable Project Control truth", () => {
    expectCanonicalOverviewNavigation(readText("README.md"))
  })

  it("keeps route-shaped modules internal while retained contracts stay public", () => {
    const index = readText("src/index.ts")
    const generationRoute = readText("src/generation/apiRoute.ts")
    const artifactRoute = readText("src/generation/artifactApiRoute.ts")
    const generationRuntime = readText("src/generation/runtime.ts")
    const artifactManifest = readText("src/generation/artifactManifest.ts")
    const artifactJob = readText("src/generation/artifactJob.ts")

    expect(index).not.toContain("./generation/apiRoute.js")
    expect(index).not.toContain("./generation/artifactApiRoute.js")
    expect(index).toContain("./generation/runtime.js")
    expect(index).toContain("./generation/artifactManifest.js")
    expect(index).toContain("./generation/artifactJob.js")
    expect(existsSync(join(repoRoot, "tests/generationApiRoute.test.ts"))).toBe(false)
    expect(existsSync(join(repoRoot, "tests/artifactApiRoute.test.ts"))).toBe(false)

    expect(generationRoute).toContain("flowdoc-vnext-backend/src/routes/generationRoute.ts")
    expect(generationRoute).toContain("src/generation/runtime.ts")
    expect(generationRoute).toContain("assessVNextGenerationReadiness")
    expect(generationRoute).not.toMatch(/from\s+["'][^"']*flowdoc-vnext-backend/)
    expect(artifactRoute).toContain("flowdoc-vnext-backend/src/routes/artifactRoute.ts")
    expect(artifactRoute).toContain("src/generation/artifactManifest.ts")
    expect(artifactRoute).toContain("src/generation/artifactJob.ts")
    expect(artifactRoute).toContain("createVNextArtifactManifestPlan")
    expect(artifactRoute).not.toMatch(/from\s+["'][^"']*flowdoc-vnext-backend/)

    expect(generationRuntime).toContain("assessVNextGenerationReadiness")
    expect(generationRuntime).toContain("safeParseVNextGenerationRequest")
    expect(artifactManifest).toContain("createVNextArtifactManifestPlan")
    expect(artifactJob).toContain("createVNextArtifactJobPlan")
    expect(artifactJob).toContain("advanceVNextArtifactJob")

    expect(deprecatedRouteExports(generationRoute)).toEqual([
      { kind: "const", name: "VNEXT_GENERATION_API_ROUTE_SOURCE" },
      { kind: "const", name: "VNEXT_GENERATION_API_ROUTE_MODE" },
      { kind: "const", name: "VNEXT_GENERATION_API_ROUTE_ACTION" },
      { kind: "function", name: "createVNextGenerationApiRouteResponse" },
    ])
    expect(deprecatedRouteExports(artifactRoute)).toEqual([
      { kind: "const", name: "VNEXT_ARTIFACT_API_ROUTE_SOURCE" },
      { kind: "const", name: "VNEXT_ARTIFACT_API_ROUTE_MODE" },
      { kind: "function", name: "createVNextArtifactGenerationApiRouteResponse" },
      { kind: "function", name: "createVNextArtifactStatusApiRouteResponse" },
      { kind: "function", name: "createVNextSessionArtifactListApiRouteResponse" },
      { kind: "function", name: "createVNextArtifactDownloadMetadataApiRouteResponse" },
    ])
  })

  it("keeps retained-contract tests independent from route response helpers", () => {
    const runtimeImports = namedCoreImports(
      readText("tests/generationRuntimeRetainedContract.test.ts"),
    )
    const artifactImports = namedCoreImports(
      readText("tests/artifactRetainedContract.test.ts"),
    )

    expect(runtimeImports).toContain("assessVNextGenerationReadiness")
    expect(runtimeImports).toContain("safeParseVNextGenerationRequest")
    expect(artifactImports).toContain("createVNextArtifactManifestPlan")
    expect(artifactImports).toContain("createVNextArtifactJobPlan")
    expect(artifactImports).toContain("advanceVNextArtifactJob")

    for (const forbiddenHelper of FORBIDDEN_ROUTE_RESPONSE_HELPERS) {
      expect(runtimeImports).not.toContain(forbiddenHelper)
      expect(artifactImports).not.toContain(forbiddenHelper)
    }
  })
})
