import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SMOKE_IDENTITY_V1,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SMOKE_ROWS_V1,
} from "../packages/text-engine-rust-wasm/src/liveDraftSmokeRows.js"
import { runFlowDocTextEngineNodeSmokeRowV1 } from "../packages/text-engine-rust-wasm/src/node.js"
import {
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_BOUNDARY_VERSION,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_WASM_SHA256,
} from "../packages/text-engine-rust-wasm/src/runtimeCommon.js"

describe("LIVE-DRAFT-XR-1 cross-runtime engine", () => {
  it("pins a separate executable engine artifact without rewriting the historical readiness marker", () => {
    const historical = readFileSync(new URL(
      "../packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
      import.meta.url,
    ))
    const liveDraft = readFileSync(new URL(
      "../packages/text-engine-rust-wasm/pkg-live-draft/flowdoc_text_engine_bg.wasm",
      import.meta.url,
    ))
    expect(createHash("sha256").update(historical).digest("hex")).toBe(
      "4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44",
    )
    expect(createHash("sha256").update(liveDraft).digest("hex")).toBe(
      FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_WASM_SHA256,
    )
    expect(liveDraft.byteLength).toBeGreaterThan(historical.byteLength)
    expect(FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_BOUNDARY_VERSION).toBe(
      "flowdoc-text-engine-wasm-live-draft-xr1-v1",
    )
  })

  it("runs the accepted Thai and Latin rows through Node-native Rustybuzz and ICU4X", () => {
    const results = FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SMOKE_ROWS_V1.map((row) => (
      runFlowDocTextEngineNodeSmokeRowV1({
        row,
        measurementProfileId: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SMOKE_IDENTITY_V1.measurementProfileId,
        wasmSha256: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SMOKE_IDENTITY_V1.wasmSha256,
      })
    ))
    expect(results.map(({ result }) => ({
      text: result.text,
      glyphCount: result.summary.glyphCount,
      missingGlyphCount: result.summary.missingGlyphCount,
      breakByteOffsets: result.breakByteOffsets,
      breakUtf16Offsets: result.breakUtf16Offsets,
    }))).toEqual([
      {
        text: "สวัสดีครับตูม",
        glyphCount: 13,
        missingGlyphCount: 0,
        breakByteOffsets: [0, 12, 18, 30, 39],
        breakUtf16Offsets: [0, 4, 6, 10, 13],
      },
      {
        text: "Prepared summary",
        glyphCount: 16,
        missingGlyphCount: 0,
        breakByteOffsets: [0, 9, 16],
        breakUtf16Offsets: [0, 9, 16],
      },
    ])
    expect(results.every(({ identity }) => (
      identity.runtime === "node-native"
      && identity.wasmExecution === false
      && identity.executesRustybuzz
      && identity.executesIcu4x
    ))).toBe(true)
  })

  it("keeps runtime-specific Node imports outside the browser Worker export", () => {
    const workerSource = readFileSync(new URL(
      "../packages/text-engine-rust-wasm/src/worker.ts",
      import.meta.url,
    ), "utf8")
    const nodeSource = readFileSync(new URL(
      "../packages/text-engine-rust-wasm/src/node.ts",
      import.meta.url,
    ), "utf8")
    const corePackage = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
      dependencies?: Record<string, string>
    }
    expect(workerSource).not.toContain('from "node:')
    expect(workerSource).not.toContain("@flowdoc/vnext-core")
    expect(nodeSource).toContain('from "node:child_process"')
    expect(corePackage.dependencies?.["@flowdoc/text-engine-rust-wasm"]).toBeUndefined()
  })
})
