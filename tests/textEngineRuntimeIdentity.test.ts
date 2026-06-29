import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextMeasurementProfileIdentityPlan,
  type VNextMeasurementProfileIdentityInput,
} from "../src/index.js"
import {
  createFlowDocTextEngineRuntimeIdentityPlan,
  FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_MODE,
  FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_SOURCE,
  FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE,
  FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE_NAME,
  type FlowDocTextEngineRuntimeIdentityManifest,
} from "../packages/text-engine-rust-wasm/src/index.js"

interface FontAssetManifest {
  fontAssets: Array<{
    fontId: string
    family: string
    style: "normal" | "italic"
    weight: number
    sha256: string
  }>
  styleMappings: Array<{
    styleKey: string
    primaryFontId: string
    fallbackFontIds: string[]
  }>
}

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

function readJson<T>(path: string): T {
  return JSON.parse(readText(path)) as T
}

function readManifest(): FlowDocTextEngineRuntimeIdentityManifest {
  return readJson<FlowDocTextEngineRuntimeIdentityManifest>("packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json")
}

function readFontManifest(): FontAssetManifest {
  return readJson<FontAssetManifest>("assets/fonts/font-assets.v1.json")
}

function profileInput(): VNextMeasurementProfileIdentityInput {
  const manifest = readFontManifest()

  return {
    profileKey: "thai-rustybuzz-icu4x-v1",
    policyRevision: "measurement-policy-v1",
    fontAssets: manifest.fontAssets.map((asset) => ({
      fontId: asset.fontId,
      family: asset.family,
      style: asset.style,
      weight: asset.weight,
      sha256: asset.sha256,
    })),
    styleMappings: manifest.styleMappings,
    shaper: {
      shaperId: "rustybuzz-wasm",
      engine: "rustybuzz",
      revision: "rustybuzz-planned",
      deterministic: true,
      packageBoundary: "external-adapter",
      features: {
        kerning: true,
        ligatures: true,
        complexText: true,
        clusterMapping: true,
      },
    },
    segmenter: {
      segmenterId: "icu4x-segmenter",
      engine: "icu4x",
      revision: "icu4x-planned",
      dataRevision: "icu4x-data-planned",
      deterministic: true,
      runtimeDependent: false,
      packageBoundary: "external-adapter",
      lineBreakPolicy: "icu4x-uax14-thai-v1",
    },
    fallbackPolicy: "explicit-font-list-v1",
    outputShapeVersion: "glyph-line-box-v1",
  }
}

describe("vNext text engine runtime identity boundary", () => {
  it("validates identity-only runtime ingredients without claiming parity-ready", () => {
    const manifest = readManifest()
    const plan = createFlowDocTextEngineRuntimeIdentityPlan({ manifest })

    expect(plan).toMatchObject({
      source: FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_SOURCE,
      mode: FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY_MODE,
      status: "identity-ready",
      manifestId: "text-engine-runtime-identity-v1",
      adapterPackageName: FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE_NAME,
      outputShapeVersion: "glyph-line-box-v1",
      parityStatus: "identity-only",
      runtimeTargets: ["browser-wasm", "node-native", "worker-wasm"],
      runtime: {
        rustybuzzRevision: "0.20.1",
        icu4xRevision: "icu4x-planned",
        icu4xDataRevision: "icu4x-data-planned",
        wasmArtifact: {
          digestStatus: "pinned",
          sha256: "4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44",
        },
      },
      identityContract: {
        pinsRustybuzzRevision: true,
        pinsIcu4xRevision: true,
        pinsIcu4xDataRevision: true,
        pinsFontHashes: true,
        pinsWasmDigestBeforeParityReady: true,
        measurementProfileCarriesFontShaperSegmenterIdentity: true,
        wasmDigestStaysRuntimeIdentityEvidence: true,
      },
      executionContract: {
        importsWasm: false,
        loadsWasm: false,
        executesNativeShaping: false,
        executesIcu4x: false,
        comparesRuntimeOutput: false,
        bindsProductionMeasurement: false,
        writesArtifacts: false,
      },
      blockingIssues: [],
    })
    expect(plan.warningIssues).toEqual([])
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("aligns the runtime manifest with the measurement profile identity ingredients", () => {
    const manifest = readManifest()
    const profile = createVNextMeasurementProfileIdentityPlan(profileInput())
    const fontHashes = new Set(readFontManifest().fontAssets.map((asset) => `${asset.fontId}:${asset.sha256}`))

    expect(manifest.measurementProfileId).toBe(profile.measurementProfileId)
    expect(manifest.measurementProfileId).toContain("shape-rustybuzz-rustybuzz-wasm-rustybuzz-planned")
    expect(manifest.measurementProfileId).toContain("segment-icu4x-icu4x-segmenter-icu4x-planned-icu4x-data-planned")
    manifest.fontAssets.forEach((asset) => {
      expect(fontHashes.has(`${asset.fontId}:${asset.sha256}`)).toBe(true)
    })
  })

  it("blocks missing digest when parity-ready is claimed", () => {
    const manifest = readManifest()
    const plan = createFlowDocTextEngineRuntimeIdentityPlan({
      manifest: {
        ...manifest,
        parityStatus: "parity-ready",
        runtime: {
          ...manifest.runtime,
          wasmArtifact: {
            digestStatus: "pending",
            sha256: null,
          },
        },
        parityComparison: {
          ...manifest.parityComparison,
          status: "not-run",
        },
      },
    })

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "missing-wasm-digest" }),
      expect.objectContaining({ code: "parity-ready-without-matching-comparison" }),
    ]))
  })

  it("allows parity-ready only with pinned digest and matching comparison shape", () => {
    const manifest = readManifest()
    const plan = createFlowDocTextEngineRuntimeIdentityPlan({
      manifest: {
        ...manifest,
        parityStatus: "parity-ready",
        runtime: {
          ...manifest.runtime,
          wasmArtifact: {
            digestStatus: "pinned",
            sha256: "a".repeat(64),
          },
        },
        parityComparison: {
          ...manifest.parityComparison,
          status: "matching",
        },
      },
    })

    expect(plan.status).toBe("parity-ready")
    expect(plan.blockingIssues).toEqual([])
    expect(plan.warningIssues).toEqual([])
  })

  it("blocks missing runtime revisions, invalid hashes, and unsafe production binding", () => {
    const manifest = readManifest()
    const plan = createFlowDocTextEngineRuntimeIdentityPlan({
      bindProductionMeasurement: true,
      manifest: {
        ...manifest,
        runtimeTargets: ["node-native"],
        runtime: {
          ...manifest.runtime,
          rustybuzzRevision: "",
          icu4xRevision: "",
          icu4xDataRevision: "",
          wasmArtifact: {
            digestStatus: "pinned",
            sha256: "not-a-sha",
          },
        },
        fontAssets: [{
          fontId: "",
          sha256: "bad",
        }],
        parityComparison: {
          ...manifest.parityComparison,
          comparedFacts: ["glyph-id"],
        },
      },
    })

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "production-binding" }),
      expect.objectContaining({ code: "missing-wasm-target" }),
      expect.objectContaining({ code: "missing-rustybuzz-revision" }),
      expect.objectContaining({ code: "missing-icu4x-revision" }),
      expect.objectContaining({ code: "missing-icu4x-data-revision" }),
      expect.objectContaining({ code: "invalid-wasm-digest" }),
      expect.objectContaining({ code: "missing-font-id" }),
      expect.objectContaining({ code: "invalid-font-hash" }),
      expect.objectContaining({ code: "missing-compared-fact", targetId: "glyph-advance" }),
      expect.objectContaining({ code: "missing-compared-fact", targetId: "cluster-map" }),
      expect.objectContaining({ code: "missing-compared-fact", targetId: "line-box" }),
    ]))
  })

  it("keeps runtime identity package-local and dependency-clean", () => {
    const source = readText("packages/text-engine-rust-wasm/src/runtimeIdentity.ts")
    const packageIndex = readText("packages/text-engine-rust-wasm/src/index.ts")
    const coreIndex = readText("src/index.ts")

    expect(packageIndex).toContain('export * from "./runtimeIdentity.js"')
    expect(source).toContain('from "@flowdoc/vnext-core"')
    expect(source).toContain("import type")
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:rustybuzz|harfbuzz|harfbuzzjs|wasm-bindgen|icu4x|fontkit|opentype\.js|canvas|puppeteer|playwright)["']\)/)
    expect(source).not.toContain("WebAssembly")
    expect(source).not.toContain("new Intl.Segmenter")
    expect(source).not.toContain("paginateVNextDocument")
    expect(coreIndex).not.toContain(FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE)
    expect(coreIndex).not.toContain("FLOWDOC_TEXT_ENGINE_RUNTIME_IDENTITY")
  })

  it("documents Phase 134 and the remaining WASM parity gap", () => {
    const boundaryDoc = readText("docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 134 WASM / ICU4X runtime identity and digest boundary.")
    expect(boundaryDoc).toContain("identity-only")
    expect(boundaryDoc).toContain("WASM digest")
    expect(readme).toContain("Text engine runtime identity boundary")
    expect(readme).toContain("docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md")
    expect(ledger).toContain("| 134 | WASM / ICU4X runtime identity and digest boundary | done |")
    expect(roadmap).toContain("## Phase 134: WASM / ICU4X Runtime Identity And Digest Boundary")
  })
})
