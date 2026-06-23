import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextRustWasmTextEngineBoundaryPlan,
  VNEXT_RUST_WASM_TEXT_ENGINE_MODE,
  VNEXT_RUST_WASM_TEXT_ENGINE_SOURCE,
  type VNextRustWasmTextEngineInput,
} from "../src/index.js"

function boundaryInput(overrides: Partial<VNextRustWasmTextEngineInput> = {}): VNextRustWasmTextEngineInput {
  return {
    decisionId: "rustybuzz-icu4x-adapter-v1",
    placement: "external-adapter-package",
    adapterPackageName: "@flowdoc/text-engine-rust-wasm",
    runtimeTargets: ["node", "browser", "worker"],
    engine: {
      shaper: "rustybuzz",
      shaperRevision: "rustybuzz-planned",
      segmenter: "icu4x",
      segmenterRevision: "icu4x-planned",
      segmenterDataRevision: "icu4x-data-planned",
      deterministic: true,
    },
    coreDependencyPolicy: {
      coreImportsWasm: false,
      coreOwnsWasmBuild: false,
      adapterProvidesMeasurementFacts: true,
      adapterUsesRendererMeasurementBoundary: true,
    },
    runtimePolicy: {
      requiresNetworkAtRuntime: false,
      mayRunInWorker: true,
      mayRunInBrowser: true,
      mayRunInNode: true,
    },
    ...overrides,
  }
}

describe("vNext Rust/WASM text engine boundary decision", () => {
  it("clears rustybuzz plus ICU4X only as an external adapter spike", () => {
    const plan = createVNextRustWasmTextEngineBoundaryPlan(boundaryInput())

    expect(plan).toMatchObject({
      source: VNEXT_RUST_WASM_TEXT_ENGINE_SOURCE,
      mode: VNEXT_RUST_WASM_TEXT_ENGINE_MODE,
      status: "cleared-for-adapter-spike",
      decisionId: "rustybuzz-icu4x-adapter-v1",
      selectedPlacement: "external-adapter-package",
      adapter: {
        packageName: "@flowdoc/text-engine-rust-wasm",
        provides: "vnext-renderer-text-measurement-facts",
        consumes: "measurement-profile-identity",
        mayReplaceCoreMeasurerDirectly: false,
      },
      coreContract: {
        coreImportsWasm: false,
        coreOwnsWasmBuild: false,
        adapterProvidesMeasurementFacts: true,
        adapterUsesRendererMeasurementBoundary: true,
      },
      executionContract: {
        installsDependencies: false,
        buildsWasm: false,
        importsRustPackages: false,
        importsWasm: false,
        executesShaping: false,
        executesSegmentation: false,
        replacesPaginationMeasurer: false,
        writesArtifacts: false,
      },
      blockingIssues: [],
    })
    expect(plan.warningIssues).toEqual([expect.objectContaining({
      code: "missing-wasm-digest",
      severity: "warning",
    })])
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks direct core dependency and direct WASM imports", () => {
    const plan = createVNextRustWasmTextEngineBoundaryPlan(boundaryInput({
      placement: "core-direct-dependency",
      coreDependencyPolicy: {
        coreImportsWasm: true,
        coreOwnsWasmBuild: true,
        adapterProvidesMeasurementFacts: false,
        adapterUsesRendererMeasurementBoundary: false,
      },
    }))

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues.map((issue) => issue.code)).toEqual([
      "core-direct-dependency",
      "core-imports-wasm",
      "core-owns-wasm-build",
      "adapter-does-not-provide-facts",
      "missing-renderer-adapter-boundary",
    ])
  })

  it("blocks unpinned or nondeterministic runtime decisions", () => {
    const plan = createVNextRustWasmTextEngineBoundaryPlan(boundaryInput({
      bindProductionMeasurement: true,
      runtimeTargets: [],
      engine: {
        shaper: "rustybuzz",
        shaperRevision: "",
        segmenter: "icu4x",
        segmenterRevision: "",
        segmenterDataRevision: "",
        deterministic: false,
      },
      runtimePolicy: {
        requiresNetworkAtRuntime: true,
        mayRunInWorker: false,
        mayRunInBrowser: false,
        mayRunInNode: false,
      },
    }))

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues.map((issue) => issue.code)).toEqual([
      "production-binding",
      "missing-shaper-revision",
      "missing-segmenter-revision",
      "missing-segmenter-data-revision",
      "nondeterministic-engine",
      "missing-runtime-target",
      "network-runtime-required",
    ])
  })

  it("keeps the boundary independent from Rust, WASM, and engine packages", () => {
    const source = readFileSync(resolve(process.cwd(), "src/renderer/rustWasmTextEngineBoundary.ts"), "utf8")

    expect(source).toContain("createVNextRustWasmTextEngineBoundaryPlan")
    expect(source).toContain("rustybuzz")
    expect(source).toContain("icu4x")
    expect(source).not.toMatch(/node:fs|node:path|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:rustybuzz|icu4x|wasm-bindgen|harfbuzzjs|fontkit|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:rustybuzz|icu4x|wasm-bindgen|harfbuzzjs|fontkit|canvas|puppeteer|playwright)["']\)/)
    expect(source).not.toContain("WebAssembly")
    expect(source).not.toContain("readFile")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("measureVNextText")
    expect(source).not.toContain("paginateVNextDocument")
  })

  it("documents the Rust/WASM boundary decision in the phase trail", () => {
    const readText = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8")
    const boundaryDoc = readText("docs/RUST_WASM_TEXT_ENGINE_BOUNDARY.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 105 boundary decision.")
    expect(boundaryDoc).toContain("external adapter")
    expect(boundaryDoc).toContain("rustybuzz")
    expect(boundaryDoc).toContain("ICU4X")
    expect(readme).toContain("Rust/WASM text engine boundary")
    expect(readme).toContain("docs/RUST_WASM_TEXT_ENGINE_BOUNDARY.md")
    expect(ledger).toContain("| 105 | Rust/WASM text engine boundary decision | done |")
    expect(roadmap).toContain("## Phase 105: Rust/WASM Text Engine Boundary Decision")
  })
})
