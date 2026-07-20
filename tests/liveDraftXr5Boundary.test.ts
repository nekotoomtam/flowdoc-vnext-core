import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relativePath: string): string => readFileSync(new URL(relativePath, import.meta.url), "utf8")

describe("LIVE-DRAFT-XR-5 bounded Core boundary", () => {
  it("documents retained source segments, mandatory breaks, and partial matrix scope", () => {
    const doc = read("../docs/LIVE_DRAFT_XR5_SOURCE_SEGMENTS_AND_FORCED_BREAKS.md")
    const handoff = read("../docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md")
    const displayList = read("../src/renderer/textFlowDisplayListV1.ts")
    const adapter = read("../packages/text-engine-rust-wasm/src/liveDraftLayout.ts")
    const packageJson = JSON.parse(read("../packages/text-engine-rust-wasm/package.json")) as { exports: Record<string, string> }

    expect(doc).toContain("sourceSegments")
    expect(doc).toContain("measurement matrix remains partial")
    expect(doc).toContain("default/approximate-versus-renderer drift evaluation")
    expect(handoff).toContain("nine bounded Node/real-Browser Worker")
    expect(handoff).toContain("The full release-gating matrix is not accepted")
    expect(displayList).toContain("invalid-source-runs")
    expect(displayList).toContain("rendererMayMeasureText: false")
    expect(adapter).toContain("mandatoryBreaks")
    expect(packageJson.exports["./browser-assets-xr5"]).toBe("./src/browserAssetsXr5.ts")
    expect(displayList).not.toMatch(/document\.|window\.|measureText|fillText|fetch\(/u)
  })
})
