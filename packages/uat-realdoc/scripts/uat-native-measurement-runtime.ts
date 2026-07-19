import { createHash } from "node:crypto"
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import type {
  VNextTextEngineAdapterEngineRef,
  VNextTextEngineAdapterEvidence,
  VNextTextEngineAdapterRequest,
  VNextThaiLineBreakKind,
  VNextThaiLineBreakOpportunity,
} from "@flowdoc/vnext-core"
import {
  createFlowDocRustybuzzRawEvidenceMappingPlan,
  createFlowDocTextEngineLineWrapEvidencePlan,
  type FlowDocRustybuzzRawSmokeOutput,
} from "../../text-engine-rust-wasm/src/index.js"
import type {
  FlowDocUatMeasuredExportPlanV1,
  FlowDocUatMeasuredTextEvidenceV1,
  FlowDocUatMeasurementConsumerV1,
} from "../src/index.js"

const REGULAR_FONT_PATH = "assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Regular.ttf"
const BOLD_FONT_PATH = "assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Bold.ttf"
const FONT_SHA256 = {
  "ibm-plex-sans-thai-regular": "bdf527758ba47d68d42c104b9167cb15660e88a16b40136504a7ea8c56792b57",
  "ibm-plex-sans-thai-bold": "ba5e62ecf0d5f19338b6d34360bce097d29fe56142eec5f612f2d7dd91c6bf21",
} as const
const SHAPER_REVISION = "rustybuzz-0.20.1"
const SEGMENTER_REVISION = "icu_segmenter-2.2.0"
const SEGMENTER_DATA_REVISION = "icu_segmenter_data-2.2.0"
const LINE_BREAK_POLICY = "icu4x-auto-default-uax14-cluster-safe-overflow-v1"

interface NativeLineSegmentOutput {
  source: string
  segmenterRevision: string
  dataRevision: string
  text: string
  textByteLength: number
  textScalarCount: number
  breakByteOffsets: number[]
}

export interface FlowDocUatNativeMeasurementResultV1 {
  textEvidence: FlowDocUatMeasuredTextEvidenceV1[]
  summary: {
    consumerCount: number
    uniqueShapeExecutionCount: number
    uniqueSegmentExecutionCount: number
    glyphCount: number
    lineCount: number
    missingGlyphCount: number
    emergencyBreakOpportunityCount: number
    shaperRevision: typeof SHAPER_REVISION
    segmenterRevision: typeof SEGMENTER_REVISION
    segmenterDataRevision: typeof SEGMENTER_DATA_REVISION
    lineBreakPolicy: typeof LINE_BREAK_POLICY
  }
}

function requireFact(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex")
}

function requireFile(path: string, label: string): string {
  if (!existsSync(path)) throw new Error(`${label} does not exist: ${path}`)
  return path
}

function executable(path: string, name: string): string {
  return resolve(path, process.platform === "win32" ? `${name}.exe` : name)
}

function buildNativeTools(repoRoot: string): { shaper: string; segmenter: string } {
  const packageRoot = resolve(repoRoot, "packages/text-engine-rust-wasm")
  const build = spawnSync("cargo", [
    "build",
    "--quiet",
    "--manifest-path",
    resolve(packageRoot, "rust-shaper/Cargo.toml"),
    "--bins",
  ], { cwd: packageRoot, encoding: "utf8" })
  if (build.status !== 0) throw new Error(`UAT native text tools build failed:\n${build.stderr || build.stdout}`)
  const target = resolve(packageRoot, "rust-shaper/target/debug")
  return {
    shaper: requireFile(executable(target, "flowdoc-rustybuzz-smoke"), "rustybuzz native shaper"),
    segmenter: requireFile(executable(target, "flowdoc-icu4x-line-segmenter"), "ICU4X native line segmenter"),
  }
}

function executeJson<T>(input: {
  executablePath: string
  args: string[]
  cwd: string
  label: string
}): T {
  const result = spawnSync(input.executablePath, input.args, {
    cwd: input.cwd,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  })
  if (result.status !== 0) throw new Error(`${input.label} failed:\n${result.stderr || result.stdout}`)
  return JSON.parse(result.stdout) as T
}

function utf8ByteToUtf16Map(text: string): Map<number, number> {
  const offsets = new Map<number, number>([[0, 0]])
  let byteOffset = 0
  let utf16Offset = 0
  for (const scalar of text) {
    byteOffset += Buffer.byteLength(scalar, "utf8")
    utf16Offset += scalar.length
    offsets.set(byteOffset, utf16Offset)
  }
  return offsets
}

function classifyBreak(text: string, offset: number): VNextThaiLineBreakKind {
  if (offset === text.length) return "mandatory"
  const preceding = Array.from(text.slice(0, offset)).at(-1) ?? ""
  if (/^[\r\n\u0085\u2028\u2029]$/u.test(preceding)) return "mandatory"
  if (/^\s$/u.test(preceding)) return "space"
  if (/^[\p{P}\p{S}]$/u.test(preceding)) return "punctuation"
  return "word"
}

function mapBreaks(text: string, raw: NativeLineSegmentOutput): VNextThaiLineBreakOpportunity[] {
  requireFact(raw.source === "flowdoc-icu4x-native-line-segmenter", "UAT native segmenter source drifted")
  requireFact(raw.segmenterRevision === SEGMENTER_REVISION, "UAT native segmenter revision drifted")
  requireFact(raw.dataRevision === SEGMENTER_DATA_REVISION, "UAT native segmenter data revision drifted")
  requireFact(raw.text === text && raw.textByteLength === Buffer.byteLength(text, "utf8"), "UAT native segment text drifted")
  requireFact(raw.breakByteOffsets[0] === 0 && raw.breakByteOffsets.at(-1) === raw.textByteLength,
    "UAT native segment boundaries are incomplete")
  const byteToUtf16 = utf8ByteToUtf16Map(text)
  return raw.breakByteOffsets.slice(1).map((byteOffset) => {
    const offset = byteToUtf16.get(byteOffset)
    requireFact(offset != null, `UAT ICU4X break is not a UTF-8 scalar boundary: ${byteOffset}`)
    return { offset, kind: classifyBreak(text, offset) }
  })
}

function adapterRequest(consumer: FlowDocUatMeasurementConsumerV1): VNextTextEngineAdapterRequest {
  return {
    requestId: consumer.consumerId,
    smokeCaseId: "uat-local-measured-document-v1",
    sampleId: consumer.consumerId,
    measurementProfileId: consumer.request.measurementProfileId,
    text: consumer.request.renderedText,
    locale: "th",
    fontId: consumer.style.fontId,
    styleKey: consumer.style.styleKey,
    availableWidthPt: consumer.request.availableWidthPt,
    outputShapeVersion: "glyph-line-box-v1",
    requestedFacts: ["glyph-id", "glyph-advance", "glyph-offset", "cluster-map", "text-range", "line-box"],
  }
}

function emptyEvidence(
  consumer: FlowDocUatMeasurementConsumerV1,
  engine: VNextTextEngineAdapterEngineRef,
): FlowDocUatMeasuredTextEvidenceV1 {
  return {
    consumerId: consumer.consumerId,
    requestFingerprint: consumer.requestFingerprint,
    fontId: consumer.style.fontId,
    fontSizePt: consumer.style.fontSizePt,
    lineHeightPt: consumer.style.lineHeightPt,
    color: consumer.style.color,
    glyphs: [],
    lineBoxes: [{
      lineIndex: 0,
      startOffset: 0,
      endOffset: 0,
      widthPt: 0,
      heightPt: consumer.style.lineHeightPt,
      yOffsetPt: 0,
      glyphStartIndex: 0,
      glyphEndIndex: 0,
    }],
    engine: {
      shaper: "rustybuzz",
      shaperRevision: engine.shaperRevision,
      segmenter: "icu4x",
      segmenterRevision: engine.segmenterRevision,
      segmenterDataRevision: engine.segmenterDataRevision,
      deterministic: true,
    },
  }
}

export function measureFlowDocUatPlanNativeV1(input: {
  repoRoot: string
  plan: FlowDocUatMeasuredExportPlanV1
}): FlowDocUatNativeMeasurementResultV1 {
  const tools = buildNativeTools(input.repoRoot)
  const fontPaths = {
    "ibm-plex-sans-thai-regular": requireFile(resolve(input.repoRoot, REGULAR_FONT_PATH), "IBM Plex Sans Thai Regular"),
    "ibm-plex-sans-thai-bold": requireFile(resolve(input.repoRoot, BOLD_FONT_PATH), "IBM Plex Sans Thai Bold"),
  } as const
  for (const fontId of Object.keys(fontPaths) as Array<keyof typeof fontPaths>) {
    requireFact(sha256(readFileSync(fontPaths[fontId])) === FONT_SHA256[fontId], `UAT source font hash drifted: ${fontId}`)
  }

  const engine: VNextTextEngineAdapterEngineRef = {
    shaper: "rustybuzz",
    shaperRevision: SHAPER_REVISION,
    segmenter: "icu4x",
    segmenterRevision: SEGMENTER_REVISION,
    segmenterDataRevision: SEGMENTER_DATA_REVISION,
    deterministic: true,
  }
  const shapeCache = new Map<string, FlowDocRustybuzzRawSmokeOutput>()
  const segmentCache = new Map<string, NativeLineSegmentOutput>()
  let emergencyBreakOpportunityCount = 0

  const textEvidence = input.plan.consumers.map((consumer): FlowDocUatMeasuredTextEvidenceV1 => {
    const request = adapterRequest(consumer)
    if (request.text.length === 0) return emptyEvidence(consumer, engine)

    const glyphs = [...request.text.matchAll(/[^\r\n\u0085\u2028\u2029]+/gu)].flatMap((match, runIndex) => {
      const runText = match[0]
      const runStartOffset = match.index
      const runRequest: VNextTextEngineAdapterRequest = {
        ...request,
        requestId: `${request.requestId}:shape:${runIndex}`,
        sampleId: `${request.sampleId}:shape:${runIndex}`,
        text: runText,
      }
      const shapeKey = JSON.stringify([request.fontId, runText])
      let rawShape = shapeCache.get(shapeKey)
      if (rawShape == null) {
        rawShape = executeJson<FlowDocRustybuzzRawSmokeOutput>({
          executablePath: tools.shaper,
          args: [fontPaths[consumer.style.fontId], runText, request.fontId],
          cwd: input.repoRoot,
          label: `UAT rustybuzz shaping ${consumer.consumerId}:${runIndex}`,
        })
        shapeCache.set(shapeKey, rawShape)
      }
      const mapped = createFlowDocRustybuzzRawEvidenceMappingPlan({
        request: runRequest,
        rawOutput: rawShape,
        engine,
        fontSizePt: consumer.style.fontSizePt,
        lineHeightPt: consumer.style.lineHeightPt,
      })
      requireFact(mapped.status === "ready" && mapped.evidence != null,
        `UAT rustybuzz mapping blocked: ${consumer.consumerId}:${mapped.blockingIssues.map((item) => item.code).join(",")}`)
      return mapped.evidence.glyphs.map((glyph) => ({
        ...glyph,
        clusterStartOffset: runStartOffset + glyph.clusterStartOffset,
        clusterEndOffset: runStartOffset + glyph.clusterEndOffset,
      }))
    }).map((glyph, glyphIndex) => ({ ...glyph, glyphIndex }))
    requireFact(glyphs.length > 0 && glyphs.every((glyph) => glyph.glyphId > 0),
      `UAT text contains a missing font glyph or only control characters: ${consumer.consumerId}`)
    const glyphEvidence: VNextTextEngineAdapterEvidence = {
      requestId: request.requestId,
      measurementProfileId: request.measurementProfileId,
      outputShapeVersion: request.outputShapeVersion,
      engine,
      glyphs,
      lineBoxes: [],
      totalAdvancePt: glyphs.reduce((sum, glyph) => sum + glyph.advancePt, 0),
      lineHeightPt: consumer.style.lineHeightPt,
    }

    let rawSegment = segmentCache.get(request.text)
    if (rawSegment == null) {
      rawSegment = executeJson<NativeLineSegmentOutput>({
        executablePath: tools.segmenter,
        args: [request.text],
        cwd: input.repoRoot,
        label: `UAT ICU4X segmentation ${consumer.consumerId}`,
      })
      segmentCache.set(request.text, rawSegment)
    }
    const breaks = mapBreaks(request.text, rawSegment)
    const wrap = (opportunities: VNextThaiLineBreakOpportunity[]) => createFlowDocTextEngineLineWrapEvidencePlan({
      request,
      glyphEvidence,
      breakEvidence: {
        evidenceId: `uat-breaks:${createHash("sha256").update(request.text, "utf8").digest("hex").slice(0, 32)}`,
        sampleId: request.sampleId,
        locale: "th",
        candidate: {
          candidateId: "uat-icu4x-native-2.2.0",
          engine: "icu4x",
          role: "primary-deterministic",
          runtimeDependent: false,
          engineRevision: SEGMENTER_REVISION,
          dataRevision: SEGMENTER_DATA_REVISION,
          lineBreakPolicy: LINE_BREAK_POLICY,
        },
        breaks: opportunities,
      },
    })
    let wrapped = wrap(breaks)
    if (wrapped.status === "ready" && wrapped.coverage.overflowLineCount > 0) {
      const byOffset = new Map(breaks.map((item) => [item.offset, item]))
      glyphEvidence.glyphs.forEach((glyph) => {
        if (!byOffset.has(glyph.clusterEndOffset)) {
          byOffset.set(glyph.clusterEndOffset, {
            offset: glyph.clusterEndOffset,
            kind: glyph.clusterEndOffset === request.text.length ? "mandatory" : "word",
          })
          emergencyBreakOpportunityCount += 1
        }
      })
      wrapped = wrap([...byOffset.values()].sort((left, right) => left.offset - right.offset))
    }
    requireFact(wrapped.status === "ready" && wrapped.evidence != null && wrapped.coverage.overflowLineCount === 0,
      `UAT native line wrapping blocked or overflowed: ${consumer.consumerId}`)
    return {
      consumerId: consumer.consumerId,
      requestFingerprint: consumer.requestFingerprint,
      fontId: consumer.style.fontId,
      fontSizePt: consumer.style.fontSizePt,
      lineHeightPt: consumer.style.lineHeightPt,
      color: consumer.style.color,
      glyphs: wrapped.evidence.glyphs.map((glyph) => ({ ...glyph })),
      lineBoxes: wrapped.evidence.lineBoxes.map((line) => ({ ...line })),
      engine: {
        shaper: "rustybuzz",
        shaperRevision: SHAPER_REVISION,
        segmenter: "icu4x",
        segmenterRevision: SEGMENTER_REVISION,
        segmenterDataRevision: SEGMENTER_DATA_REVISION,
        deterministic: true,
      },
    }
  })

  return {
    textEvidence,
    summary: {
      consumerCount: input.plan.consumers.length,
      uniqueShapeExecutionCount: shapeCache.size,
      uniqueSegmentExecutionCount: segmentCache.size,
      glyphCount: textEvidence.reduce((sum, item) => sum + item.glyphs.length, 0),
      lineCount: textEvidence.reduce((sum, item) => sum + item.lineBoxes.length, 0),
      missingGlyphCount: textEvidence.reduce((sum, item) => sum + item.glyphs.filter((glyph) => glyph.glyphId === 0).length, 0),
      emergencyBreakOpportunityCount,
      shaperRevision: SHAPER_REVISION,
      segmenterRevision: SEGMENTER_REVISION,
      segmenterDataRevision: SEGMENTER_DATA_REVISION,
      lineBreakPolicy: LINE_BREAK_POLICY,
    },
  }
}
