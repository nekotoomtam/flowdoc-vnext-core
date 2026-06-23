import type {
  VNextTextEngineAdapterEngineRef,
  VNextTextEngineAdapterEvidence,
  VNextTextEngineAdapterGlyphFact,
  VNextTextEngineAdapterLineBoxFact,
  VNextTextEngineAdapterRequest,
} from "@flowdoc/vnext-core"

export * from "./rustybuzzRawMapping.js"
export * from "./rustybuzzSmokeCorpus.js"
export * from "./lineWrapEvidence.js"
export * from "./runtimeIdentity.js"
export * from "./rendererBackedProvider.js"

export const FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_SOURCE = "flowdoc-text-engine-rust-wasm-adapter"
export const FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_MODE = "mock-evidence-adapter-scaffold"
export const FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE = "@flowdoc/text-engine-rust-wasm"

export type FlowDocTextEngineRustWasmAdapterStatus = "ready" | "blocked"
export type FlowDocTextEngineRustWasmAdapterIssueSeverity = "blocking" | "warning"

export type FlowDocTextEngineRustWasmAdapterIssueCode =
  | "production-binding"
  | "missing-adapter-package-name"
  | "unexpected-adapter-package-name"
  | "missing-requests"
  | "missing-request-id"
  | "missing-request-text"
  | "missing-measurement-profile-id"
  | "unsupported-output-shape"
  | "missing-shaper-revision"
  | "missing-segmenter-revision"
  | "missing-segmenter-data-revision"
  | "nondeterministic-engine"
  | "missing-wasm-digest"

export interface FlowDocTextEngineRustWasmAdapterInput {
  adapterPackageName: string
  bindProductionMeasurement?: boolean
  engine: VNextTextEngineAdapterEngineRef
  requests: readonly VNextTextEngineAdapterRequest[]
}

export interface FlowDocTextEngineRustWasmAdapterIssue {
  severity: FlowDocTextEngineRustWasmAdapterIssueSeverity
  code: FlowDocTextEngineRustWasmAdapterIssueCode
  message: string
  targetId?: string
}

export interface FlowDocTextEngineRustWasmAdapterPlan {
  source: typeof FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_SOURCE
  mode: typeof FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_MODE
  status: FlowDocTextEngineRustWasmAdapterStatus
  adapterPackageName: string
  corePackageName: "@flowdoc/vnext-core"
  engine: {
    shaper: VNextTextEngineAdapterEngineRef["shaper"]
    shaperRevision: string
    segmenter: VNextTextEngineAdapterEngineRef["segmenter"]
    segmenterRevision: string
    segmenterDataRevision: string
    deterministic: boolean
    wasmDigest: string | null
  }
  evidence: VNextTextEngineAdapterEvidence[]
  adapterContract: {
    consumes: "vnext-text-engine-adapter-request"
    produces: "vnext-text-engine-adapter-evidence"
    implementation: "mock-evidence-only"
    importsCoreAsPublicPackage: true
    coreImportsAdapterBack: false
    productionMeasurementReady: false
  }
  executionContract: {
    importsRustybuzz: false
    importsHarfbuzz: false
    importsIcu4x: false
    importsWasm: false
    readsFontFiles: false
    executesRealShaping: false
    executesRealSegmentation: false
    writesArtifacts: false
  }
  blockingIssues: FlowDocTextEngineRustWasmAdapterIssue[]
  warningIssues: FlowDocTextEngineRustWasmAdapterIssue[]
  nextSteps: string[]
}

const MOCK_ADVANCE_PT = 6
const MOCK_LINE_HEIGHT_PT = 14

function issue(
  severity: FlowDocTextEngineRustWasmAdapterIssueSeverity,
  code: FlowDocTextEngineRustWasmAdapterIssueCode,
  message: string,
  targetId?: string,
): FlowDocTextEngineRustWasmAdapterIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function cloneEngine(engine: VNextTextEngineAdapterEngineRef): VNextTextEngineAdapterEngineRef {
  return { ...engine }
}

function createMockGlyphs(request: VNextTextEngineAdapterRequest): VNextTextEngineAdapterGlyphFact[] {
  return Array.from({ length: request.text.length }, (_, index) => ({
    glyphIndex: index,
    glyphId: 1000 + request.text.charCodeAt(index),
    fontId: request.fontId,
    advancePt: MOCK_ADVANCE_PT,
    offsetXPt: 0,
    offsetYPt: 0,
    clusterStartOffset: index,
    clusterEndOffset: index + 1,
  }))
}

function createMockLineBoxes(
  request: VNextTextEngineAdapterRequest,
  glyphCount: number,
): VNextTextEngineAdapterLineBoxFact[] {
  const glyphsPerLine = Math.max(1, Math.floor(request.availableWidthPt / MOCK_ADVANCE_PT))
  const lines: VNextTextEngineAdapterLineBoxFact[] = []

  for (let glyphStartIndex = 0; glyphStartIndex < glyphCount; glyphStartIndex += glyphsPerLine) {
    const glyphEndIndex = Math.min(glyphCount, glyphStartIndex + glyphsPerLine)
    const lineIndex = lines.length

    lines.push({
      lineIndex,
      startOffset: glyphStartIndex,
      endOffset: glyphEndIndex,
      widthPt: (glyphEndIndex - glyphStartIndex) * MOCK_ADVANCE_PT,
      heightPt: MOCK_LINE_HEIGHT_PT,
      yOffsetPt: lineIndex * MOCK_LINE_HEIGHT_PT,
      glyphStartIndex,
      glyphEndIndex,
    })
  }

  return lines
}

function createMockEvidence(
  request: VNextTextEngineAdapterRequest,
  engine: VNextTextEngineAdapterEngineRef,
): VNextTextEngineAdapterEvidence {
  const glyphs = createMockGlyphs(request)
  const lineBoxes = createMockLineBoxes(request, glyphs.length)

  return {
    requestId: request.requestId,
    measurementProfileId: request.measurementProfileId,
    outputShapeVersion: request.outputShapeVersion,
    engine: cloneEngine(engine),
    glyphs,
    lineBoxes,
    totalAdvancePt: glyphs.reduce((total, glyph) => total + glyph.advancePt, 0),
    lineHeightPt: MOCK_LINE_HEIGHT_PT,
  }
}

function validateEngine(
  engine: VNextTextEngineAdapterEngineRef,
  blockingIssues: FlowDocTextEngineRustWasmAdapterIssue[],
  warningIssues: FlowDocTextEngineRustWasmAdapterIssue[],
): void {
  if (engine.shaperRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-shaper-revision", "Mock adapter plans require a shaper revision.", engine.shaper))
  }

  if (engine.segmenterRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-segmenter-revision", "Mock adapter plans require a segmenter revision.", engine.segmenter))
  }

  if (engine.segmenterDataRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-segmenter-data-revision", "Mock adapter plans require a segmenter data revision.", engine.segmenter))
  }

  if (!engine.deterministic) {
    blockingIssues.push(issue("blocking", "nondeterministic-engine", "Mock adapter evidence must be deterministic."))
  }

  if (engine.wasmDigest == null || engine.wasmDigest.trim().length === 0) {
    warningIssues.push(issue("warning", "missing-wasm-digest", "WASM digest remains pending until the real rustybuzz/WASM spike."))
  }
}

function validateRequest(
  request: VNextTextEngineAdapterRequest,
  blockingIssues: FlowDocTextEngineRustWasmAdapterIssue[],
): void {
  if (request.requestId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-request-id", "Mock adapter requests need stable request ids."))
  }

  if (request.text.length === 0) {
    blockingIssues.push(issue("blocking", "missing-request-text", "Mock adapter requests need text.", request.requestId))
  }

  if (request.measurementProfileId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-measurement-profile-id", "Mock adapter requests need measurement profile ids.", request.requestId))
  }

  if (request.outputShapeVersion !== "glyph-line-box-v1") {
    blockingIssues.push(issue("blocking", "unsupported-output-shape", "Mock adapter scaffold only supports glyph-line-box-v1.", request.requestId))
  }
}

export function createFlowDocTextEngineRustWasmMockAdapterPlan(
  input: FlowDocTextEngineRustWasmAdapterInput,
): FlowDocTextEngineRustWasmAdapterPlan {
  const blockingIssues: FlowDocTextEngineRustWasmAdapterIssue[] = []
  const warningIssues: FlowDocTextEngineRustWasmAdapterIssue[] = []

  if (input.adapterPackageName.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-adapter-package-name", "Mock adapter plans require a package name."))
  }

  if (input.adapterPackageName !== FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_PACKAGE) {
    blockingIssues.push(issue(
      "blocking",
      "unexpected-adapter-package-name",
      "Mock adapter scaffold must use the external text engine adapter package name.",
      input.adapterPackageName,
    ))
  }

  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue("blocking", "production-binding", "Mock adapter scaffold cannot bind production measurement."))
  }

  if (input.requests.length === 0) {
    blockingIssues.push(issue("blocking", "missing-requests", "Mock adapter plans require adapter requests."))
  }

  validateEngine(input.engine, blockingIssues, warningIssues)
  input.requests.forEach((request) => validateRequest(request, blockingIssues))

  return {
    source: FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_SOURCE,
    mode: FLOWDOC_TEXT_ENGINE_RUST_WASM_ADAPTER_MODE,
    status: blockingIssues.length === 0 ? "ready" : "blocked",
    adapterPackageName: input.adapterPackageName,
    corePackageName: "@flowdoc/vnext-core",
    engine: {
      shaper: input.engine.shaper,
      shaperRevision: input.engine.shaperRevision,
      segmenter: input.engine.segmenter,
      segmenterRevision: input.engine.segmenterRevision,
      segmenterDataRevision: input.engine.segmenterDataRevision,
      deterministic: input.engine.deterministic,
      wasmDigest: input.engine.wasmDigest ?? null,
    },
    evidence: blockingIssues.length === 0
      ? input.requests.map((request) => createMockEvidence(request, input.engine))
      : [],
    adapterContract: {
      consumes: "vnext-text-engine-adapter-request",
      produces: "vnext-text-engine-adapter-evidence",
      implementation: "mock-evidence-only",
      importsCoreAsPublicPackage: true,
      coreImportsAdapterBack: false,
      productionMeasurementReady: false,
    },
    executionContract: {
      importsRustybuzz: false,
      importsHarfbuzz: false,
      importsIcu4x: false,
      importsWasm: false,
      readsFontFiles: false,
      executesRealShaping: false,
      executesRealSegmentation: false,
      writesArtifacts: false,
    },
    blockingIssues,
    warningIssues,
    nextSteps: [
      "Replace mock glyph evidence with rustybuzz/WASM shaping output in a later adapter phase.",
      "Pin rustybuzz, ICU4X, ICU4X data, and WASM artifact digests before production measurement.",
      "Keep vNext core consuming only public request/evidence contracts.",
    ],
  }
}
