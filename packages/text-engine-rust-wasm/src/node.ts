import { createHash } from "node:crypto"
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import type { FlowDocTextEngineLiveDraftSmokeRowV1 } from "./liveDraftSmokeRows.js"
import { createFlowDocTextEngineMultiRunLayoutV1 } from "./multiRunLayout.js"
import type {
  FlowDocTextEngineMultiRunLayoutInputV1,
  FlowDocTextEngineMultiRunLayoutResultV1,
} from "./multiRunLayoutContract.js"
import {
  normalizeFlowDocTextEngineLiveDraftResultV1,
  type FlowDocTextEngineLiveDraftNormalizedResultV1,
  type FlowDocTextEngineLiveDraftRawSegmentationV1,
  type FlowDocTextEngineLiveDraftRawShapeV1,
} from "./runtimeCommon.js"
import {
  FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256,
  normalizeFlowDocTextEngineMr1SegmentationV1,
  normalizeFlowDocTextEngineMr1ShapeV1,
  type FlowDocTextEngineMr1SegmentationFactsV1,
  type FlowDocTextEngineMr1ShapeFactsV1,
  type FlowDocTextEngineMr1RawShapeV1,
} from "./runtimeMr1.js"
import {
  flowDocUtf16RangeToUtf8BytesV1,
  normalizeFlowDocTextEngineMr1RangeSegmentationV1,
  normalizeFlowDocTextEngineMr1RangeShapeV1,
  type FlowDocTextEngineMr1RangeSegmentationFactsV1,
  type FlowDocTextEngineMr1RangeShapeFactsV1,
  type FlowDocTextEngineMr1RawRangeSegmentationV1,
  type FlowDocTextEngineMr1RawRangeShapeV1,
} from "./runtimeMr1Range.js"

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
    rangeShaper: resolve(targetRoot, process.platform === "win32" ? "flowdoc-live-draft-rustybuzz-range.exe" : "flowdoc-live-draft-rustybuzz-range"),
    rangeSegmenter: resolve(targetRoot, process.platform === "win32" ? "flowdoc-live-draft-icu4x-range.exe" : "flowdoc-live-draft-icu4x-range"),
  }
}

function buildNativeExecutors(): ReturnType<typeof resolveRuntimePaths> {
  const paths = resolveRuntimePaths()
  if (
    !nativeExecutorsBuilt
      || !existsSync(paths.shaper)
      || !existsSync(paths.segmenter)
      || !existsSync(paths.rangeShaper)
      || !existsSync(paths.rangeSegmenter)
  ) {
    run("cargo", [
      "build",
      "--quiet",
      "--manifest-path",
      resolve(paths.packageRoot, "rust-live-draft-engine/Cargo.toml"),
      "--bin",
      "flowdoc-live-draft-rustybuzz",
      "--bin",
      "flowdoc-live-draft-icu4x",
      "--bin",
      "flowdoc-live-draft-rustybuzz-range",
      "--bin",
      "flowdoc-live-draft-icu4x-range",
    ], paths.packageRoot)
    nativeExecutorsBuilt = true
  }
  return paths
}

function resolveVerifiedFontPath(input: {
  coreRoot: string
  fontAssetPath: string
  fontSha256: string
  fontId: string
}): string {
  const fontPath = resolve(input.coreRoot, input.fontAssetPath)
  requireFact(sha256File(fontPath) === input.fontSha256, `font digest mismatch: ${input.fontId}`)
  return fontPath
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

export function runFlowDocTextEngineNodeMultiRunLayoutV1(input: {
  layout: FlowDocTextEngineMultiRunLayoutInputV1
  wasmSha256: string
}): {
  identity: {
    runtime: "node-native-mr1"
    measurementProfileId: string
    wasmSha256: typeof FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256
    wasmExecution: false
    executesRustybuzz: true
    executesIcu4x: true
    productionBinding: false
  }
  result: FlowDocTextEngineMultiRunLayoutResultV1
} {
  requireFact(input.wasmSha256 === FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256, "MR1 WASM digest pin mismatch")
  const paths = buildNativeExecutors()
  const verifiedFontPaths = new Map<string, string>()
  const result = createFlowDocTextEngineMultiRunLayoutV1(input.layout, {
    runtimeKind: "node-native-mr1",
    shape({ text, fontFace }) {
      let fontPath = verifiedFontPaths.get(fontFace.fontFaceId)
      if (fontPath == null) {
        fontPath = resolve(paths.coreRoot, fontFace.fontAssetPath)
        requireFact(sha256File(fontPath) === fontFace.fontSha256, `font digest mismatch: ${fontFace.fontFaceId}`)
        verifiedFontPaths.set(fontFace.fontFaceId, fontPath)
      }
      const raw = JSON.parse(run(
        paths.shaper,
        [fontPath, text, fontFace.fontFaceId],
        paths.coreRoot,
      )) as FlowDocTextEngineMr1RawShapeV1
      return normalizeFlowDocTextEngineMr1ShapeV1(raw)
    },
    segment(text) {
      const raw = JSON.parse(run(
        paths.segmenter,
        [text],
        paths.coreRoot,
      )) as FlowDocTextEngineLiveDraftRawSegmentationV1
      return normalizeFlowDocTextEngineMr1SegmentationV1(raw)
    },
  })
  return {
    identity: {
      runtime: "node-native-mr1",
      measurementProfileId: input.layout.measurement.measurementProfileId,
      wasmSha256: FLOWDOC_TEXT_ENGINE_MR1_WASM_SHA256,
      wasmExecution: false,
      executesRustybuzz: true,
      executesIcu4x: true,
      productionBinding: false,
    },
    result,
  }
}

export function runFlowDocTextEngineNodeMr1FullFactsV1(input: {
  text: string
  fontId: string
  fontAssetPath: string
  fontSha256: string
}): {
  shape: FlowDocTextEngineMr1ShapeFactsV1
  segmentation: FlowDocTextEngineMr1SegmentationFactsV1
} {
  const paths = buildNativeExecutors()
  const fontPath = resolveVerifiedFontPath({ coreRoot: paths.coreRoot, ...input })
  const shape = JSON.parse(run(
    paths.shaper,
    [fontPath, input.text, input.fontId],
    paths.coreRoot,
  )) as FlowDocTextEngineMr1RawShapeV1
  const segmentation = JSON.parse(run(
    paths.segmenter,
    [input.text],
    paths.coreRoot,
  )) as FlowDocTextEngineLiveDraftRawSegmentationV1
  return {
    shape: normalizeFlowDocTextEngineMr1ShapeV1(shape),
    segmentation: normalizeFlowDocTextEngineMr1SegmentationV1(segmentation),
  }
}

export function runFlowDocTextEngineNodeMr1RangeShapeV1(input: {
  text: string
  fontId: string
  fontAssetPath: string
  fontSha256: string
  rangeStartUtf16: number
  rangeEndUtf16: number
  contextStartUtf16: number
  contextEndUtf16: number
}): FlowDocTextEngineMr1RangeShapeFactsV1 {
  const paths = buildNativeExecutors()
  const fontPath = resolveVerifiedFontPath({ coreRoot: paths.coreRoot, ...input })
  const range = flowDocUtf16RangeToUtf8BytesV1({
    text: input.text,
    startUtf16: input.rangeStartUtf16,
    endUtf16: input.rangeEndUtf16,
  })
  const context = flowDocUtf16RangeToUtf8BytesV1({
    text: input.text,
    startUtf16: input.contextStartUtf16,
    endUtf16: input.contextEndUtf16,
  })
  const raw = JSON.parse(run(
    paths.rangeShaper,
    [
      fontPath,
      input.text,
      input.fontId,
      String(range.startByte),
      String(range.endByte),
      String(context.startByte),
      String(context.endByte),
    ],
    paths.coreRoot,
  )) as FlowDocTextEngineMr1RawRangeShapeV1
  return normalizeFlowDocTextEngineMr1RangeShapeV1({ raw, fullText: input.text })
}

export function runFlowDocTextEngineNodeMr1RangeSegmentationV1(input: {
  text: string
  targetStartUtf16: number
  targetEndUtf16: number
  contextStartUtf16: number
  contextEndUtf16: number
}): FlowDocTextEngineMr1RangeSegmentationFactsV1 {
  const paths = buildNativeExecutors()
  const target = flowDocUtf16RangeToUtf8BytesV1({
    text: input.text,
    startUtf16: input.targetStartUtf16,
    endUtf16: input.targetEndUtf16,
  })
  const context = flowDocUtf16RangeToUtf8BytesV1({
    text: input.text,
    startUtf16: input.contextStartUtf16,
    endUtf16: input.contextEndUtf16,
  })
  const raw = JSON.parse(run(
    paths.rangeSegmenter,
    [
      input.text,
      String(target.startByte),
      String(target.endByte),
      String(context.startByte),
      String(context.endByte),
    ],
    paths.coreRoot,
  )) as FlowDocTextEngineMr1RawRangeSegmentationV1
  return normalizeFlowDocTextEngineMr1RangeSegmentationV1({ raw, fullText: input.text })
}
