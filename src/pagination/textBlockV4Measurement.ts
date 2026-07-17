import type { InlineImageV4Target } from "../schema/documentV4ImageTarget.js"
import type { TextRunStyleV4Target } from "../schema/documentV4Foundation.js"
import type { VNextResolvedDocumentV1 } from "../resolution/resolvedDocument.js"
import { isVNextSafeUtf16TextOffset } from "../authoring/utf16Offsets.js"

export const VNEXT_TEXT_BLOCK_V4_MEASUREMENT_SOURCE = "vnext-text-block-v4-measurement"
export const VNEXT_TEXT_BLOCK_V4_MEASUREMENT_VERSION = 1 as const

export type VNextTextBlockV4MeasurementRunKind =
  | "text"
  | "resolved-field"
  | "generated-page-number"
  | "hard-break"
  | "inline-image"

export interface VNextTextBlockV4MeasurementSourcePoint {
  textBlockId: string
  inlineId: string | null
  authoredOffset: 0 | 1 | number
  resolvedOffset: number
  affinity: "backward" | "forward"
}

export interface VNextTextBlockV4MeasurementRun {
  inlineId: string
  kind: VNextTextBlockV4MeasurementRunKind
  renderStartOffset: number
  renderEndOffset: number
  renderedText: string
  fieldKey?: string
  generatedOwnerFingerprint?: string
  assetId?: string | null
  frame?: InlineImageV4Target["frame"]
  styleKey?: string
  localStyle?: TextRunStyleV4Target
}

export interface VNextTextBlockV4GeneratedInlineMeasurementBinding {
  kind: "page-number"
  value: string
  ownerFingerprint: string
}

export interface VNextTextBlockV4MeasurementRequest {
  documentId: string
  instanceRevision: number
  sectionId: string
  textBlockId: string
  availableWidthPt: number
  measurementProfileId: string
  styleKey: string
  renderedText: string
  runs: VNextTextBlockV4MeasurementRun[]
}

export interface VNextTextBlockV4MeasurementIssue {
  code: string
  severity: "error"
  path: string
  message: string
  inlineId?: string
}

export type VNextTextBlockV4MeasurementRequestResult =
  | {
      source: typeof VNEXT_TEXT_BLOCK_V4_MEASUREMENT_SOURCE
      version: typeof VNEXT_TEXT_BLOCK_V4_MEASUREMENT_VERSION
      status: "ready"
      request: VNextTextBlockV4MeasurementRequest
      issues: []
    }
  | {
      source: typeof VNEXT_TEXT_BLOCK_V4_MEASUREMENT_SOURCE
      version: typeof VNEXT_TEXT_BLOCK_V4_MEASUREMENT_VERSION
      status: "blocked"
      request: null
      issues: VNextTextBlockV4MeasurementIssue[]
    }

export interface VNextTextBlockV4ResolvedMeasurementNodeInput {
  documentId: string
  instanceRevision: number
  sectionId: string
  textBlock: Extract<
    VNextResolvedDocumentV1["document"]["document"]["sections"][number]["nodes"][string],
    { type: "text-block" }
  >
  availableWidthPt: number
  measurementProfileId: string
  styleKey: string
  resolvedTextByInlineId: Readonly<Record<string, { fieldKey: string; value: string }>>
  resolvedImageByPlacementId: Readonly<Record<string, { assetId: string | null }>>
  generatedTextByInlineId?: Readonly<Record<string, VNextTextBlockV4GeneratedInlineMeasurementBinding>>
}

export interface VNextTextBlockV4MeasuredLineInput {
  index: number
  startOffset: number
  endOffset: number
  text: string
  widthPt: number
  heightPt: number
}

export interface VNextTextBlockV4MeasuredLine {
  index: number
  startOffset: number
  endOffset: number
  text: string
  widthPt: number
  heightPt: number
  sourceStart: VNextTextBlockV4MeasurementSourcePoint
  sourceEnd: VNextTextBlockV4MeasurementSourcePoint
}

export type VNextTextBlockV4MeasuredLinesResult =
  | {
      source: typeof VNEXT_TEXT_BLOCK_V4_MEASUREMENT_SOURCE
      version: typeof VNEXT_TEXT_BLOCK_V4_MEASUREMENT_VERSION
      status: "accepted"
      textBlockId: string
      lines: VNextTextBlockV4MeasuredLine[]
      issues: []
      summary: { lineCount: number; renderedLength: number; totalHeightPt: number }
    }
  | {
      source: typeof VNEXT_TEXT_BLOCK_V4_MEASUREMENT_SOURCE
      version: typeof VNEXT_TEXT_BLOCK_V4_MEASUREMENT_VERSION
      status: "blocked"
      textBlockId: string
      lines: null
      issues: VNextTextBlockV4MeasurementIssue[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(code: string, path: string, message: string, inlineId?: string): VNextTextBlockV4MeasurementIssue {
  return { code, severity: "error", path, message, ...(inlineId == null ? {} : { inlineId }) }
}

function requestBlocked(issues: VNextTextBlockV4MeasurementIssue[]): VNextTextBlockV4MeasurementRequestResult {
  return {
    source: VNEXT_TEXT_BLOCK_V4_MEASUREMENT_SOURCE,
    version: VNEXT_TEXT_BLOCK_V4_MEASUREMENT_VERSION,
    status: "blocked",
    request: null,
    issues,
  }
}

export function createVNextTextBlockV4MeasurementRequestFromResolvedNode(
  input: VNextTextBlockV4ResolvedMeasurementNodeInput,
): VNextTextBlockV4MeasurementRequestResult {
  const issues: VNextTextBlockV4MeasurementIssue[] = []
  if (!Number.isFinite(input.availableWidthPt) || input.availableWidthPt <= 0) issues.push(issue(
    "invalid-available-width", "availableWidthPt", "available width must be a positive finite point value",
  ))
  if (input.measurementProfileId.trim().length === 0) issues.push(issue(
    "missing-measurement-profile", "measurementProfileId", "measurement profile id must not be blank",
  ))
  if (input.styleKey.trim().length === 0) issues.push(issue(
    "missing-style-key", "styleKey", "style key must not be blank",
  ))

  const runs: VNextTextBlockV4MeasurementRun[] = []
  let renderedText = ""
  input.textBlock.children.forEach((inline, index) => {
    const start = renderedText.length
    if (inline.type === "page-number") {
      const binding = input.generatedTextByInlineId?.[inline.id]
      if (binding == null) {
        issues.push(issue(
          "generated-inline-unresolved",
          `document.textBlock.children[${index}]`,
          "page-number must be expanded before exact text measurement",
          inline.id,
        ))
        return
      }
      if (binding.kind !== "page-number" || binding.value.length === 0) {
        issues.push(issue(
          "generated-inline-binding-invalid",
          `generatedTextByInlineId.${inline.id}`,
          "page-number expansion must retain a non-empty generated value",
          inline.id,
        ))
        return
      }
      if (!/^sha256:[a-f0-9]{64}$/u.test(binding.ownerFingerprint)) {
        issues.push(issue(
          "generated-inline-owner-invalid",
          `generatedTextByInlineId.${inline.id}.ownerFingerprint`,
          "page-number expansion must pin its compact generation owner fingerprint",
          inline.id,
        ))
        return
      }
      renderedText += binding.value
      runs.push({
        inlineId: inline.id,
        kind: "generated-page-number",
        renderedText: binding.value,
        renderStartOffset: start,
        renderEndOffset: renderedText.length,
        styleKey: input.styleKey,
        generatedOwnerFingerprint: binding.ownerFingerprint,
      })
      return
    }

    let rendered = ""
    let run: Omit<VNextTextBlockV4MeasurementRun, "renderStartOffset" | "renderEndOffset" | "renderedText">
    if (inline.type === "text") {
      rendered = inline.text
      run = {
        inlineId: inline.id,
        kind: "text",
        styleKey: input.styleKey,
        ...(inline.style == null ? {} : { localStyle: clone(inline.style) }),
      }
    } else if (inline.type === "field-ref") {
      const binding = input.resolvedTextByInlineId[inline.id]
      if (binding == null) {
        issues.push(issue(
          "resolved-field-binding-missing",
          `document.textBlock.children[${index}]`,
          `resolved field binding for inline "${inline.id}" is missing`,
          inline.id,
        ))
        return
      }
      rendered = binding.value
      run = { inlineId: inline.id, kind: "resolved-field", fieldKey: binding.fieldKey, styleKey: input.styleKey }
    } else if (inline.type === "line-break") {
      rendered = "\n"
      run = { inlineId: inline.id, kind: "hard-break" }
    } else {
      const binding = input.resolvedImageByPlacementId[inline.id]
      if (binding == null) {
        issues.push(issue(
          "resolved-image-binding-missing",
          `document.textBlock.children[${index}]`,
          `resolved image binding for inline "${inline.id}" is missing`,
          inline.id,
        ))
        return
      }
      rendered = "\uFFFC"
      run = { inlineId: inline.id, kind: "inline-image", assetId: binding.assetId, frame: clone(inline.frame) }
    }
    renderedText += rendered
    runs.push({
      ...run,
      renderedText: rendered,
      renderStartOffset: start,
      renderEndOffset: renderedText.length,
    })
  })

  if (issues.length > 0) return requestBlocked(issues)
  return {
    source: VNEXT_TEXT_BLOCK_V4_MEASUREMENT_SOURCE,
    version: VNEXT_TEXT_BLOCK_V4_MEASUREMENT_VERSION,
    status: "ready",
    request: {
      documentId: input.documentId,
      instanceRevision: input.instanceRevision,
      sectionId: input.sectionId,
      textBlockId: input.textBlock.id,
      availableWidthPt: input.availableWidthPt,
      measurementProfileId: input.measurementProfileId,
      styleKey: input.styleKey,
      renderedText,
      runs,
    },
    issues: [],
  }
}

export function createVNextTextBlockV4MeasurementRequest(
  resolved: VNextResolvedDocumentV1,
  input: { textBlockId: string; availableWidthPt: number; measurementProfileId: string },
): VNextTextBlockV4MeasurementRequestResult {
  const issues: VNextTextBlockV4MeasurementIssue[] = []
  if (!Number.isFinite(input.availableWidthPt) || input.availableWidthPt <= 0) issues.push(issue(
    "invalid-available-width", "availableWidthPt", "available width must be a positive finite point value",
  ))
  if (input.measurementProfileId.trim().length === 0) issues.push(issue(
    "missing-measurement-profile", "measurementProfileId", "measurement profile id must not be blank",
  ))

  type TextBlock = Extract<
    VNextResolvedDocumentV1["document"]["document"]["sections"][number]["nodes"][string],
    { type: "text-block" }
  >
  let found: { sectionId: string; textBlock: TextBlock } | null = null
  for (const section of resolved.document.document.sections) {
    const node = section.nodes[input.textBlockId]
    if (node?.type === "text-block") {
      found = { sectionId: section.id, textBlock: node }
      break
    }
  }
  if (found == null) issues.push(issue(
    "text-block-not-found", "textBlockId", `text-block "${input.textBlockId}" was not found`,
  ))
  if (issues.length > 0 || found == null) return requestBlocked(issues)
  const { sectionId, textBlock } = found
  const blockStyle = resolved.bindings.styles.find((binding) => binding.textBlockId === textBlock.id)
  return createVNextTextBlockV4MeasurementRequestFromResolvedNode({
    documentId: resolved.instanceId,
    instanceRevision: resolved.instanceRevision,
    sectionId,
    textBlock,
    availableWidthPt: input.availableWidthPt,
    measurementProfileId: input.measurementProfileId,
    styleKey: blockStyle?.styleKey ?? "default",
    resolvedTextByInlineId: Object.fromEntries(resolved.bindings.fields.map((binding) => [
      binding.inlineId,
      { fieldKey: binding.fieldKey, value: binding.value },
    ])),
    resolvedImageByPlacementId: Object.fromEntries(resolved.bindings.images.map((binding) => [
      binding.placementId,
      { assetId: binding.assetId },
    ])),
  })
}

function pointAt(
  request: VNextTextBlockV4MeasurementRequest,
  offset: number,
  affinity: "backward" | "forward",
): VNextTextBlockV4MeasurementSourcePoint | null {
  if (request.runs.length === 0) return offset === 0 ? {
    textBlockId: request.textBlockId,
    inlineId: null,
    authoredOffset: 0,
    resolvedOffset: 0,
    affinity,
  } : null
  let index = request.runs.findIndex((run) => offset < run.renderEndOffset)
  if (offset === request.renderedText.length) index = request.runs.length - 1
  if (index < 0) return null
  if (offset === request.runs[index].renderStartOffset && index > 0 && affinity === "backward") index -= 1
  const run = request.runs[index]
  const local = Math.max(0, Math.min(run.renderedText.length, offset - run.renderStartOffset))
  if (!isVNextSafeUtf16TextOffset(run.renderedText, local)) return null
  const authoredOffset = run.kind === "text"
    ? local
    : local === run.renderedText.length ? 1 : 0
  return {
    textBlockId: request.textBlockId,
    inlineId: run.inlineId,
    authoredOffset,
    resolvedOffset: local,
    affinity,
  }
}

export function acceptVNextTextBlockV4MeasuredLines(
  request: VNextTextBlockV4MeasurementRequest,
  lineInputs: readonly VNextTextBlockV4MeasuredLineInput[],
): VNextTextBlockV4MeasuredLinesResult {
  const issues: VNextTextBlockV4MeasurementIssue[] = []
  if (lineInputs.length === 0) issues.push(issue(
    "missing-lines", "lines", "measurement must return at least one line, including for an empty block",
  ))
  let expectedStart = 0
  lineInputs.forEach((line, index) => {
    const path = `lines[${index}]`
    if (line.index !== index) issues.push(issue("line-index-mismatch", `${path}.index`, "line indexes must be contiguous from zero"))
    if (!Number.isInteger(line.startOffset) || !Number.isInteger(line.endOffset) || line.startOffset < 0 || line.endOffset < line.startOffset) {
      issues.push(issue("invalid-line-range", path, "line range must use ordered non-negative integer offsets"))
    } else if (line.startOffset !== expectedStart) {
      issues.push(issue("line-coverage-gap", `${path}.startOffset`, `line must start at rendered offset ${expectedStart}`))
    }
    if (!Number.isFinite(line.widthPt) || line.widthPt < 0 || !Number.isFinite(line.heightPt) || line.heightPt <= 0) {
      issues.push(issue("invalid-line-geometry", path, "line width must be non-negative and height must be positive finite points"))
    }
    expectedStart = line.endOffset
  })
  if (lineInputs.length > 0 && expectedStart !== request.renderedText.length) issues.push(issue(
    "line-coverage-incomplete", "lines", `measured lines must cover rendered length ${request.renderedText.length}`,
  ))

  const lines: VNextTextBlockV4MeasuredLine[] = []
  if (issues.length === 0) lineInputs.forEach((line, index) => {
    const sourceStart = pointAt(request, line.startOffset, "forward")
    const sourceEnd = pointAt(request, line.endOffset, "backward")
    if (sourceStart == null || sourceEnd == null) {
      issues.push(issue(
        "unsafe-render-offset", `lines[${index}]`,
        "measured line boundary must map to a safe UTF-16 source boundary",
      ))
      return
    }
    lines.push({ ...clone(line), sourceStart, sourceEnd })
  })

  if (issues.length > 0) return {
    source: VNEXT_TEXT_BLOCK_V4_MEASUREMENT_SOURCE,
    version: VNEXT_TEXT_BLOCK_V4_MEASUREMENT_VERSION,
    status: "blocked",
    textBlockId: request.textBlockId,
    lines: null,
    issues,
  }
  return {
    source: VNEXT_TEXT_BLOCK_V4_MEASUREMENT_SOURCE,
    version: VNEXT_TEXT_BLOCK_V4_MEASUREMENT_VERSION,
    status: "accepted",
    textBlockId: request.textBlockId,
    lines,
    issues: [],
    summary: {
      lineCount: lines.length,
      renderedLength: request.renderedText.length,
      totalHeightPt: lines.reduce((sum, line) => sum + line.heightPt, 0),
    },
  }
}
