import type {
  VNextTextEngineAdapterEngineRef,
  VNextTextEngineAdapterEvidence,
  VNextTextEngineAdapterGlyphFact,
  VNextTextEngineAdapterLineBoxFact,
  VNextTextEngineAdapterOutputShapeVersion,
  VNextTextEngineAdapterRequest,
} from "@flowdoc/vnext-core"

export const FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_SOURCE = "flowdoc-rustybuzz-raw-evidence-mapping"
export const FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_MODE = "rustybuzz-raw-cluster-mapping-boundary"

export type FlowDocRustybuzzRawMappingStatus = "ready" | "blocked"
export type FlowDocRustybuzzRawMappingIssueSeverity = "blocking" | "warning"

export type FlowDocRustybuzzRawMappingIssueCode =
  | "production-binding"
  | "request-text-mismatch"
  | "request-font-mismatch"
  | "unsupported-output-shape"
  | "engine-shaper-mismatch"
  | "shaper-revision-mismatch"
  | "nondeterministic-engine"
  | "invalid-font-size"
  | "invalid-line-height"
  | "invalid-units-per-em"
  | "invalid-text-byte-length"
  | "invalid-text-scalar-count"
  | "glyph-count-mismatch"
  | "glyph-index-mismatch"
  | "glyph-id-invalid"
  | "glyph-advance-invalid"
  | "glyph-offset-invalid"
  | "cluster-out-of-bounds"
  | "cluster-not-utf8-boundary"
  | "missing-wasm-digest"

export interface FlowDocRustybuzzRawGlyphOutput {
  index: number
  glyphId: number
  cluster: number
  xAdvance: number
  yAdvance: number
  xOffset: number
  yOffset: number
}

export interface FlowDocRustybuzzRawSmokeOutput {
  source: string
  shaperRevision: string
  fontId: string
  fontPath: string
  text: string
  textByteLength: number
  textScalarCount: number
  unitsPerEm: number
  glyphCount: number
  glyphs: readonly FlowDocRustybuzzRawGlyphOutput[]
}

export interface FlowDocRustybuzzRawEvidenceMappingInput {
  request: VNextTextEngineAdapterRequest
  rawOutput: FlowDocRustybuzzRawSmokeOutput
  engine: VNextTextEngineAdapterEngineRef
  fontSizePt?: number
  lineHeightPt?: number
  bindProductionMeasurement?: boolean
}

export interface FlowDocRustybuzzRawMappingIssue {
  severity: FlowDocRustybuzzRawMappingIssueSeverity
  code: FlowDocRustybuzzRawMappingIssueCode
  message: string
  targetId?: string
}

export interface FlowDocRustybuzzRawEvidenceMappingPlan {
  source: typeof FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_SOURCE
  mode: typeof FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_MODE
  status: FlowDocRustybuzzRawMappingStatus
  requestId: string
  rawSource: string
  evidence: VNextTextEngineAdapterEvidence | null
  mappingContract: {
    consumes: "rustybuzz-native-smoke-json"
    produces: "vnext-text-engine-adapter-evidence"
    clusterInputUnit: "utf8-byte-offset"
    clusterOutputUnit: "utf16-code-unit-offset"
    advanceInputUnit: "font-unit"
    advanceOutputUnit: "pt"
    lineBreaking: "single-line-smoke-only"
    productionMeasurementReady: false
  }
  scale: {
    fontSizePt: number
    lineHeightPt: number
    unitsPerEm: number
    fontUnitToPt: number
  }
  summary: {
    glyphCount: number
    zeroAdvanceGlyphCount: number
    repeatedClusterGlyphCount: number
    totalAdvancePt: number
    textLengthUtf16: number
    textLengthUtf8Bytes: number
  }
  blockingIssues: FlowDocRustybuzzRawMappingIssue[]
  warningIssues: FlowDocRustybuzzRawMappingIssue[]
  nextSteps: string[]
}

const DEFAULT_FONT_SIZE_PT = 12
const DEFAULT_LINE_HEIGHT_RATIO = 1.2
const SUPPORTED_OUTPUT_SHAPE: VNextTextEngineAdapterOutputShapeVersion = "glyph-line-box-v1"

function issue(
  severity: FlowDocRustybuzzRawMappingIssueSeverity,
  code: FlowDocRustybuzzRawMappingIssueCode,
  message: string,
  targetId?: string,
): FlowDocRustybuzzRawMappingIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

function isNonNegativeFinite(value: number): boolean {
  return isFiniteNumber(value) && value >= 0
}

function isPositiveFinite(value: number): boolean {
  return isFiniteNumber(value) && value > 0
}

function cloneEngine(engine: VNextTextEngineAdapterEngineRef): VNextTextEngineAdapterEngineRef {
  return { ...engine }
}

function utf8ByteLengthForCodePoint(codePoint: number): number {
  if (codePoint <= 0x7f) return 1
  if (codePoint <= 0x7ff) return 2
  if (codePoint <= 0xffff) return 3
  return 4
}

function createUtf8ByteToUtf16OffsetMap(text: string): Map<number, number> {
  const map = new Map<number, number>([[0, 0]])
  let byteOffset = 0

  for (let utf16Offset = 0; utf16Offset < text.length;) {
    const codePoint = text.codePointAt(utf16Offset)
    if (codePoint == null) break

    byteOffset += utf8ByteLengthForCodePoint(codePoint)
    utf16Offset += codePoint > 0xffff ? 2 : 1
    map.set(byteOffset, utf16Offset)
  }

  return map
}

function countUnicodeScalars(text: string): number {
  return Array.from(text).length
}

function utf8ByteLength(text: string): number {
  let length = 0

  for (let utf16Offset = 0; utf16Offset < text.length;) {
    const codePoint = text.codePointAt(utf16Offset)
    if (codePoint == null) break

    length += utf8ByteLengthForCodePoint(codePoint)
    utf16Offset += codePoint > 0xffff ? 2 : 1
  }

  return length
}

function roundPt(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}

function createClusterEndMap(rawOutput: FlowDocRustybuzzRawSmokeOutput): Map<number, number> {
  const clusters = [...new Set([
    ...rawOutput.glyphs.map((glyph) => glyph.cluster),
    rawOutput.textByteLength,
  ])].sort((a, b) => a - b)
  const endByStart = new Map<number, number>()

  clusters.forEach((cluster, index) => {
    const nextCluster = clusters[index + 1]
    if (nextCluster != null) {
      endByStart.set(cluster, nextCluster)
    }
  })

  return endByStart
}

function validateInput(
  input: FlowDocRustybuzzRawEvidenceMappingInput,
  fontSizePt: number,
  lineHeightPt: number,
  byteToUtf16: Map<number, number>,
  blockingIssues: FlowDocRustybuzzRawMappingIssue[],
  warningIssues: FlowDocRustybuzzRawMappingIssue[],
): void {
  const { request, rawOutput, engine } = input

  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue("blocking", "production-binding", "Raw rustybuzz mapping cannot bind production measurement."))
  }

  if (request.text !== rawOutput.text) {
    blockingIssues.push(issue("blocking", "request-text-mismatch", "Raw rustybuzz output text must match the adapter request text.", request.requestId))
  }

  if (request.fontId !== rawOutput.fontId) {
    blockingIssues.push(issue("blocking", "request-font-mismatch", "Raw rustybuzz output font must match the adapter request font.", rawOutput.fontId))
  }

  if (request.outputShapeVersion !== SUPPORTED_OUTPUT_SHAPE) {
    blockingIssues.push(issue("blocking", "unsupported-output-shape", "Raw rustybuzz mapping only supports glyph-line-box-v1.", request.requestId))
  }

  if (engine.shaper !== "rustybuzz") {
    blockingIssues.push(issue("blocking", "engine-shaper-mismatch", "Raw rustybuzz output must map through a rustybuzz engine reference.", engine.shaper))
  }

  if (engine.shaperRevision !== rawOutput.shaperRevision) {
    blockingIssues.push(issue("blocking", "shaper-revision-mismatch", "Engine shaper revision must match raw rustybuzz output.", rawOutput.shaperRevision))
  }

  if (!engine.deterministic) {
    blockingIssues.push(issue("blocking", "nondeterministic-engine", "Mapped rustybuzz evidence must be deterministic."))
  }

  if (engine.wasmDigest == null || engine.wasmDigest.trim().length === 0) {
    warningIssues.push(issue("warning", "missing-wasm-digest", "Mapped native smoke evidence has no WASM digest yet."))
  }

  if (!isPositiveFinite(fontSizePt)) {
    blockingIssues.push(issue("blocking", "invalid-font-size", "Font size must be a positive point value."))
  }

  if (!isPositiveFinite(lineHeightPt)) {
    blockingIssues.push(issue("blocking", "invalid-line-height", "Line height must be a positive point value."))
  }

  if (!Number.isInteger(rawOutput.unitsPerEm) || rawOutput.unitsPerEm <= 0) {
    blockingIssues.push(issue("blocking", "invalid-units-per-em", "Raw rustybuzz output must include a positive units-per-em value."))
  }

  if (rawOutput.textByteLength !== utf8ByteLength(rawOutput.text)) {
    blockingIssues.push(issue("blocking", "invalid-text-byte-length", "Raw rustybuzz text byte length must match UTF-8 byte length."))
  }

  if (rawOutput.textScalarCount !== countUnicodeScalars(rawOutput.text)) {
    blockingIssues.push(issue("blocking", "invalid-text-scalar-count", "Raw rustybuzz scalar count must match the output text."))
  }

  if (rawOutput.glyphCount !== rawOutput.glyphs.length) {
    blockingIssues.push(issue("blocking", "glyph-count-mismatch", "Raw rustybuzz glyph count must match glyph array length."))
  }

  rawOutput.glyphs.forEach((glyph, index) => {
    const targetId = `${request.requestId}:raw-glyph:${index}`

    if (glyph.index !== index) {
      blockingIssues.push(issue("blocking", "glyph-index-mismatch", "Raw rustybuzz glyph indexes must be contiguous.", targetId))
    }

    if (!Number.isInteger(glyph.glyphId) || glyph.glyphId < 0) {
      blockingIssues.push(issue("blocking", "glyph-id-invalid", "Raw rustybuzz glyph ids must be non-negative integers.", targetId))
    }

    if (!isNonNegativeFinite(glyph.xAdvance) || !isFiniteNumber(glyph.yAdvance)) {
      blockingIssues.push(issue("blocking", "glyph-advance-invalid", "Raw rustybuzz advances must be finite font-unit values.", targetId))
    }

    if (!isFiniteNumber(glyph.xOffset) || !isFiniteNumber(glyph.yOffset)) {
      blockingIssues.push(issue("blocking", "glyph-offset-invalid", "Raw rustybuzz offsets must be finite font-unit values.", targetId))
    }

    if (!Number.isInteger(glyph.cluster) || glyph.cluster < 0 || glyph.cluster >= rawOutput.textByteLength) {
      blockingIssues.push(issue("blocking", "cluster-out-of-bounds", "Raw rustybuzz clusters must stay inside UTF-8 text byte bounds.", targetId))
    } else if (!byteToUtf16.has(glyph.cluster)) {
      blockingIssues.push(issue("blocking", "cluster-not-utf8-boundary", "Raw rustybuzz clusters must land on UTF-8 code point boundaries.", targetId))
    }
  })
}

function createMappedGlyphs(
  request: VNextTextEngineAdapterRequest,
  rawOutput: FlowDocRustybuzzRawSmokeOutput,
  fontUnitToPt: number,
  byteToUtf16: Map<number, number>,
): VNextTextEngineAdapterGlyphFact[] {
  const clusterEndByStart = createClusterEndMap(rawOutput)

  return rawOutput.glyphs.map((glyph): VNextTextEngineAdapterGlyphFact => {
    const rawClusterEnd = clusterEndByStart.get(glyph.cluster) ?? rawOutput.textByteLength
    const clusterStartOffset = byteToUtf16.get(glyph.cluster) ?? 0
    const clusterEndOffset = byteToUtf16.get(rawClusterEnd) ?? request.text.length

    return {
      glyphIndex: glyph.index,
      glyphId: glyph.glyphId,
      fontId: request.fontId,
      advancePt: roundPt(glyph.xAdvance * fontUnitToPt),
      offsetXPt: roundPt(glyph.xOffset * fontUnitToPt),
      offsetYPt: roundPt(glyph.yOffset * fontUnitToPt),
      clusterStartOffset,
      clusterEndOffset,
    }
  })
}

function createSingleLineBox(
  request: VNextTextEngineAdapterRequest,
  glyphs: readonly VNextTextEngineAdapterGlyphFact[],
  lineHeightPt: number,
): VNextTextEngineAdapterLineBoxFact[] {
  return [{
    lineIndex: 0,
    startOffset: 0,
    endOffset: request.text.length,
    widthPt: roundPt(glyphs.reduce((total, glyph) => total + glyph.advancePt, 0)),
    heightPt: lineHeightPt,
    yOffsetPt: 0,
    glyphStartIndex: 0,
    glyphEndIndex: glyphs.length,
  }]
}

export function createFlowDocRustybuzzRawEvidenceMappingPlan(
  input: FlowDocRustybuzzRawEvidenceMappingInput,
): FlowDocRustybuzzRawEvidenceMappingPlan {
  const fontSizePt = input.fontSizePt ?? DEFAULT_FONT_SIZE_PT
  const lineHeightPt = input.lineHeightPt ?? roundPt(fontSizePt * DEFAULT_LINE_HEIGHT_RATIO)
  const unitsPerEm = input.rawOutput.unitsPerEm
  const fontUnitToPt = isPositiveFinite(unitsPerEm) ? fontSizePt / unitsPerEm : 0
  const byteToUtf16 = createUtf8ByteToUtf16OffsetMap(input.rawOutput.text)
  const blockingIssues: FlowDocRustybuzzRawMappingIssue[] = []
  const warningIssues: FlowDocRustybuzzRawMappingIssue[] = []

  validateInput(input, fontSizePt, lineHeightPt, byteToUtf16, blockingIssues, warningIssues)

  const evidence = blockingIssues.length === 0
    ? (() => {
      const glyphs = createMappedGlyphs(input.request, input.rawOutput, fontUnitToPt, byteToUtf16)
      const lineBoxes = createSingleLineBox(input.request, glyphs, lineHeightPt)
      const totalAdvancePt = roundPt(glyphs.reduce((total, glyph) => total + glyph.advancePt, 0))

      return {
        requestId: input.request.requestId,
        measurementProfileId: input.request.measurementProfileId,
        outputShapeVersion: input.request.outputShapeVersion,
        engine: cloneEngine(input.engine),
        glyphs,
        lineBoxes,
        totalAdvancePt,
        lineHeightPt,
      }
    })()
    : null
  const mappedGlyphs = evidence?.glyphs ?? []
  const repeatedClusterGlyphCount = mappedGlyphs.filter((glyph, index, glyphs) => (
    index > 0
    && glyph.clusterStartOffset === glyphs[index - 1]?.clusterStartOffset
    && glyph.clusterEndOffset === glyphs[index - 1]?.clusterEndOffset
  )).length

  return {
    source: FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_SOURCE,
    mode: FLOWDOC_TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_MODE,
    status: blockingIssues.length === 0 ? "ready" : "blocked",
    requestId: input.request.requestId,
    rawSource: input.rawOutput.source,
    evidence,
    mappingContract: {
      consumes: "rustybuzz-native-smoke-json",
      produces: "vnext-text-engine-adapter-evidence",
      clusterInputUnit: "utf8-byte-offset",
      clusterOutputUnit: "utf16-code-unit-offset",
      advanceInputUnit: "font-unit",
      advanceOutputUnit: "pt",
      lineBreaking: "single-line-smoke-only",
      productionMeasurementReady: false,
    },
    scale: {
      fontSizePt,
      lineHeightPt,
      unitsPerEm,
      fontUnitToPt: roundPt(fontUnitToPt),
    },
    summary: {
      glyphCount: input.rawOutput.glyphs.length,
      zeroAdvanceGlyphCount: input.rawOutput.glyphs.filter((glyph) => glyph.xAdvance === 0).length,
      repeatedClusterGlyphCount,
      totalAdvancePt: evidence?.totalAdvancePt ?? 0,
      textLengthUtf16: input.rawOutput.text.length,
      textLengthUtf8Bytes: input.rawOutput.textByteLength,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Run this mapper against every Phase 107 smoke case after each raw rustybuzz fixture exists.",
      "Replace the single-line smoke line box with ICU4X line break opportunities before wrapping evidence is accepted.",
      "Pin WASM artifact digests before browser or worker evidence can satisfy production measurement.",
    ],
  }
}
