import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import * as publicCore from "../src/index.js"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("layout public surface cleanup guard", () => {
  const retiredInitialFlowLegacyAdapter = {
    source: "src/layout/textBlockInitialFlowTextOnlyAdapterV1.ts",
    test: "tests/textBlockInitialFlowTextOnlyAdapterV1.test.ts",
    symbol: "adaptVNextTextBlockInitialFlowToLegacyLayoutV1",
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
})
