import { createHash } from "node:crypto"
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import type { FlowDocTextEngineLiveDraftSmokeRowV1 } from "./liveDraftSmokeRows.js"
import {
  normalizeFlowDocTextEngineLiveDraftResultV1,
  type FlowDocTextEngineLiveDraftNormalizedResultV1,
  type FlowDocTextEngineLiveDraftRawSegmentationV1,
  type FlowDocTextEngineLiveDraftRawShapeV1,
} from "./runtimeCommon.js"

export { createFlowDocTextEngineLiveDraftMeasurementV1 } from "./liveDraftLayout.js"

let nativeExecutorsBuilt = false

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function run(executable: string, args: readonly string[], cwd: string): string {
  const result = spawnSync(executable, args, { cwd, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 })
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `execution failed: ${executable}`)
  return result.stdout.trim()
}

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex")
}

function resolveRuntimePaths() {
  const coreRoot = resolve(fileURLToPath(new URL("../../..", import.meta.url)))
  const packageRoot = resolve(coreRoot, "packages/text-engine-rust-wasm")
  const targetRoot = resolve(packageRoot, "rust-live-draft-engine/target/debug")
  return {
    coreRoot,
    packageRoot,
    shaper: resolve(targetRoot, process.platform === "win32" ? "flowdoc-live-draft-rustybuzz.exe" : "flowdoc-live-draft-rustybuzz"),
    segmenter: resolve(targetRoot, process.platform === "win32" ? "flowdoc-live-draft-icu4x.exe" : "flowdoc-live-draft-icu4x"),
  }
}

function buildNativeExecutors(): ReturnType<typeof resolveRuntimePaths> {
  const paths = resolveRuntimePaths()
  if (!nativeExecutorsBuilt || !existsSync(paths.shaper) || !existsSync(paths.segmenter)) {
    run("cargo", [
      "build",
      "--quiet",
      "--manifest-path",
      resolve(paths.packageRoot, "rust-live-draft-engine/Cargo.toml"),
      "--bin",
      "flowdoc-live-draft-rustybuzz",
      "--bin",
      "flowdoc-live-draft-icu4x",
    ], paths.packageRoot)
    nativeExecutorsBuilt = true
  }
  return paths
}

export function runFlowDocTextEngineNodeSmokeRowV1(input: {
  row: FlowDocTextEngineLiveDraftSmokeRowV1
  measurementProfileId: string
  wasmSha256: string
}): {
  identity: {
    runtime: "node-native"
    measurementProfileId: string
    wasmSha256: string
    wasmExecution: false
    executesRustybuzz: true
    executesIcu4x: true
  }
  result: FlowDocTextEngineLiveDraftNormalizedResultV1
} {
  return runFlowDocTextEngineNodeTextV1({
    text: input.row.text,
    fontId: input.row.fontId,
    fontAssetPath: input.row.fontAssetPath,
    fontSha256: input.row.fontSha256,
    measurementProfileId: input.measurementProfileId,
    wasmSha256: input.wasmSha256,
  })
}

export function runFlowDocTextEngineNodeTextV1(input: {
  text: string
  fontId: string
  fontAssetPath: string
  fontSha256: string
  measurementProfileId: string
  wasmSha256: string
}): {
  identity: {
    runtime: "node-native"
    measurementProfileId: string
    wasmSha256: string
    wasmExecution: false
    executesRustybuzz: true
    executesIcu4x: true
  }
  result: FlowDocTextEngineLiveDraftNormalizedResultV1
} {
  const paths = buildNativeExecutors()
  const fontPath = resolve(paths.coreRoot, input.fontAssetPath)
  requireFact(sha256File(fontPath) === input.fontSha256, `font digest mismatch: ${input.fontId}`)
  const shape = JSON.parse(run(
    paths.shaper,
    [fontPath, input.text, input.fontId],
    paths.coreRoot,
  )) as FlowDocTextEngineLiveDraftRawShapeV1
  const segmentation = JSON.parse(run(
    paths.segmenter,
    [input.text],
    paths.coreRoot,
  )) as FlowDocTextEngineLiveDraftRawSegmentationV1
  return {
    identity: {
      runtime: "node-native",
      measurementProfileId: input.measurementProfileId,
      wasmSha256: input.wasmSha256,
      wasmExecution: false,
      executesRustybuzz: true,
      executesIcu4x: true,
    },
    result: normalizeFlowDocTextEngineLiveDraftResultV1({ shape, segmentation }),
  }
}
