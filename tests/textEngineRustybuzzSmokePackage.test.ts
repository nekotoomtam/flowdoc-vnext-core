import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE } from "../packages/text-engine-rust-wasm/src/index.js"

interface RustybuzzSmokeOutput {
  source: string
  shaperRevision: string
  fontId: string
  text: string
  textByteLength: number
  textScalarCount: number
  unitsPerEm: number
  glyphCount: number
  glyphs: Array<{
    index: number
    glyphId: number
    cluster: number
    xAdvance: number
    yAdvance: number
    xOffset: number
    yOffset: number
  }>
}

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

function readJson<T>(path: string): T {
  return JSON.parse(readText(path)) as T
}

describe("vNext text engine rustybuzz smoke package boundary", () => {
  it("keeps the real rustybuzz smoke in the external adapter package", () => {
    const cargoToml = readText("packages/text-engine-rust-wasm/rust-shaper/Cargo.toml")
    const smokeSource = readText("packages/text-engine-rust-wasm/rust-shaper/src/main.rs")
    const adapterSource = readText("packages/text-engine-rust-wasm/src/index.ts")
    const coreIndex = readText("src/index.ts")

    expect(cargoToml).toContain('name = "flowdoc-rustybuzz-smoke"')
    expect(cargoToml).toContain('rustybuzz = "=0.20.1"')
    expect(smokeSource).toContain("rustybuzz::Face::from_slice")
    expect(smokeSource).toContain("rustybuzz::UnicodeBuffer::new")
    expect(smokeSource).toContain("buffer.push_str(text)")
    expect(smokeSource).toContain("rustybuzz::shape(&face, &[], buffer)")
    expect(smokeSource).toContain("glyph_infos()")
    expect(smokeSource).toContain("glyph_positions()")
    expect(smokeSource).toContain("flowdoc-rustybuzz-native-smoke")
    expect(adapterSource).not.toContain("rustybuzz::")
    expect(adapterSource).not.toContain("fs::read")
    expect(coreIndex).not.toContain(FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE)
    expect(coreIndex).not.toContain("flowdoc-rustybuzz-smoke")
    expect(coreIndex).not.toContain("rustybuzz::")
  })

  it("exposes a bounded manual smoke command without adding root runtime dependencies", () => {
    const packageJson = JSON.parse(readText("packages/text-engine-rust-wasm/package.json")) as {
      dependencies: Record<string, string>
      scripts: Record<string, string>
    }
    const gitignore = readText(".gitignore")

    expect(packageJson.dependencies).toEqual({
      "@flowdoc/vnext-core": "file:../..",
    })
    expect(packageJson.scripts["rustybuzz:smoke"]).toContain("cargo run --manifest-path rust-shaper/Cargo.toml")
    expect(packageJson.scripts["rustybuzz:smoke"]).toContain("assets/fonts/Sarabun/Sarabun-Regular.ttf")
    expect(packageJson.scripts["rustybuzz:build"]).toBe("cargo build --manifest-path rust-shaper/Cargo.toml")
    expect(gitignore).toContain("target/")
  })

  it("records raw rustybuzz output as package-local smoke evidence only", () => {
    const output = readJson<RustybuzzSmokeOutput>("packages/text-engine-rust-wasm/fixtures/rustybuzz-native-smoke.sarabun.v1.json")

    expect(output).toMatchObject({
      source: "flowdoc-rustybuzz-native-smoke",
      shaperRevision: "rustybuzz-0.20.1",
      fontId: "sarabun-regular",
      text: "สวัสดีครับตูม",
      textByteLength: 39,
      textScalarCount: 13,
      unitsPerEm: 1000,
      glyphCount: 13,
    })
    expect(output.glyphs).toHaveLength(output.glyphCount)
    expect(output.glyphs.some((glyph) => glyph.xAdvance === 0)).toBe(true)
    expect(output.glyphs.some((glyph, index, glyphs) => index > 0 && glyph.cluster === glyphs[index - 1]?.cluster)).toBe(true)
  })

  it("documents Phase 113 and the remaining WASM gap", () => {
    const boundaryDoc = readText("docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_PACKAGE_BOUNDARY.md")
    const packageReadme = readText("packages/text-engine-rust-wasm/README.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 113 rustybuzz native smoke package.")
    expect(boundaryDoc).toContain('rustybuzz = "=0.20.1"')
    expect(boundaryDoc).toContain("rustybuzz-native-smoke.sarabun.v1.json")
    expect(boundaryDoc).toContain("does not currently expose")
    expect(boundaryDoc).toContain("wasm-pack")
    expect(packageReadme).toContain("Status: WASM bindgen export dependency package.")
    expect(packageReadme).toContain("Phase 113 added a package-local Rust smoke")
    expect(readme).toContain("Text engine rustybuzz smoke package boundary")
    expect(readme).toContain("docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_PACKAGE_BOUNDARY.md")
    expect(ledger).toContain("| 113 | Text engine rustybuzz smoke package boundary | done |")
    expect(roadmap).toContain("## Phase 113: Text Engine Rustybuzz Smoke Package Boundary")
  })
})
