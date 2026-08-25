import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import * as publicCore from "../src/index.js"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

function normalizeText(value: string): string {
  return value.replace(/\s+/gu, " ").trim()
}

describe("layout public surface cleanup guard", () => {
  const retiredInitialFlowLegacyAdapter = {
    source: "src/layout/textBlockInitialFlowTextOnlyAdapterV1.ts",
    test: "tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts",
    symbol: "adaptVNextTextBlockInitialFlowToLegacyLayoutV1",
  }
  const retiredSpatialIndexUpdateV1 = {
    source: "src/layout/textBlockSpatialIndexUpdateV1.ts",
    test: "tests/textBlockSpatialIndexUpdateV1.test.ts",
    symbol: "createVNextTextBlockSpatialIndexUpdateV1",
    inspectionSymbol: "inspectVNextTextBlockSpatialIndexUpdateV1",
  }

  it("removes the retired initial-flow legacy adapter from current core", () => {
    const publicSurface = publicCore as Record<string, unknown>
    const boundaryDoc = readText("docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md")
    const crossRuntime = readText("docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")

    expect(existsSync(join(repoRoot, retiredInitialFlowLegacyAdapter.source))).toBe(false)
    expect(existsSync(join(repoRoot, retiredInitialFlowLegacyAdapter.test))).toBe(false)
    expect(publicSurface[retiredInitialFlowLegacyAdapter.symbol]).toBeUndefined()
    expect(`${boundaryDoc}\n${crossRuntime}`).toContain(
      "initial-flow text-only legacy adapter is retired from current core",
    )
  })

  it("removes the retired spatial index update V1 wrapper from current core", () => {
    const publicSurface = publicCore as Record<string, unknown>
    const phaseLedger = normalizeText(readText("docs/PHASE_LEDGER.md"))

    expect(existsSync(join(repoRoot, retiredSpatialIndexUpdateV1.source))).toBe(false)
    expect(existsSync(join(repoRoot, retiredSpatialIndexUpdateV1.test))).toBe(false)
    expect(publicSurface[retiredSpatialIndexUpdateV1.symbol]).toBeUndefined()
    expect(publicSurface[retiredSpatialIndexUpdateV1.inspectionSymbol]).toBeUndefined()
    expect(phaseLedger).toContain(
      "spatial index update V1 wrapper is retired from current core",
    )
  })
})
