import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type {
  VNextTextBlockV4MeasurementSourcePoint,
} from "../pagination/textBlockV4Measurement.js"
import type {
  VNextTextFlowV4PaginationResult,
} from "../pagination/textFlowV4WindowPagination.js"

export const VNEXT_TEXT_FLOW_DISPLAY_LIST_V1_SOURCE = "vnext-text-flow-display-list-v1" as const
export const VNEXT_TEXT_FLOW_DISPLAY_LIST_V1_VERSION = 1 as const

export type VNextTextFlowDisplayListIssueCodeV1 =
  | "production-binding-forbidden"
  | "pagination-not-complete"
  | "invalid-projection-id"
  | "invalid-page-box"
  | "invalid-body-box"
  | "invalid-text-style"
  | "page-body-height-mismatch"
  | "line-outside-body"
  | "baseline-outside-line"

export interface VNextTextFlowDisplayListIssueV1 {
  code: VNextTextFlowDisplayListIssueCodeV1
  path: string
  message: string
}

export interface VNextTextFlowDisplayListPageBoxV1 {
  widthPt: number
  heightPt: number
  body: { xPt: number; yPt: number; widthPt: number; heightPt: number }
}

export interface VNextTextFlowDisplayListStyleV1 {
  styleKey: string
  fontId: string
  fontFamily: string
  fontSizePt: number
  baselineOffsetPt: number
  color: string
}

export interface VNextTextFlowLinePaintCommandV1 {
  id: string
  kind: "text-line"
  pageIndex: number
  paintOrder: number
  textBlockId: string
  fragmentId: string
  lineIndex: number
  text: string
  startOffset: number
  endOffset: number
  sourceStart: VNextTextBlockV4MeasurementSourcePoint
  sourceEnd: VNextTextBlockV4MeasurementSourcePoint
  bounds: { xPt: number; yPt: number; widthPt: number; heightPt: number }
  baselineYPt: number
  style: VNextTextFlowDisplayListStyleV1
}

export interface VNextTextFlowDisplayListPageV1 {
  pageIndex: number
  pageNumber: number
  widthPt: number
  heightPt: number
  body: VNextTextFlowDisplayListPageBoxV1["body"]
  fragmentFingerprint: string
  commands: VNextTextFlowLinePaintCommandV1[]
}

interface VNextTextFlowDisplayListFactsV1 {
  source: typeof VNEXT_TEXT_FLOW_DISPLAY_LIST_V1_SOURCE
  contractVersion: typeof VNEXT_TEXT_FLOW_DISPLAY_LIST_V1_VERSION
  projectionId: string
  textBlockId: string
  paginationFingerprint: string
  contracts: {
    consumes: "vnext-text-flow-v4-window-pagination"
    rendererMayMeasureText: false
    rendererMayRelayout: false
    lineBreaksAndBounds: "core-measured"
    glyphRasterization: "renderer-owned"
    artifactBytes: false
    productionBinding: false
  }
}

export type VNextTextFlowDisplayListResultV1 =
  | (VNextTextFlowDisplayListFactsV1 & {
      status: "ready"
      pages: VNextTextFlowDisplayListPageV1[]
      commands: VNextTextFlowLinePaintCommandV1[]
      fingerprint: string
      issues: []
      summary: { pageCount: number; commandCount: number; nonBlankCommandCount: number }
    })
  | (VNextTextFlowDisplayListFactsV1 & {
      status: "blocked"
      pages: null
      commands: null
      fingerprint: null
      issues: VNextTextFlowDisplayListIssueV1[]
      summary: null
    })

export interface VNextTextFlowDisplayListRequestV1 {
  projectionId: string
  pagination: VNextTextFlowV4PaginationResult
  pageBox: VNextTextFlowDisplayListPageBoxV1
  style: VNextTextFlowDisplayListStyleV1
  bindProductionRenderer?: boolean
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function finite(value: number): boolean {
  return Number.isFinite(value)
}

function positive(value: number): boolean {
  return finite(value) && value > 0
}

function issue(
  code: VNextTextFlowDisplayListIssueCodeV1,
  path: string,
  message: string,
): VNextTextFlowDisplayListIssueV1 {
  return { code, path, message }
}

function baseFacts(input: VNextTextFlowDisplayListRequestV1): VNextTextFlowDisplayListFactsV1 {
  return {
    source: VNEXT_TEXT_FLOW_DISPLAY_LIST_V1_SOURCE,
    contractVersion: VNEXT_TEXT_FLOW_DISPLAY_LIST_V1_VERSION,
    projectionId: input.projectionId,
    textBlockId: input.pagination.textBlockId,
    paginationFingerprint: input.pagination.fingerprint,
    contracts: {
      consumes: "vnext-text-flow-v4-window-pagination",
      rendererMayMeasureText: false,
      rendererMayRelayout: false,
      lineBreaksAndBounds: "core-measured",
      glyphRasterization: "renderer-owned",
      artifactBytes: false,
      productionBinding: false,
    },
  }
}

export function projectVNextTextFlowDisplayListV1(
  input: VNextTextFlowDisplayListRequestV1,
): VNextTextFlowDisplayListResultV1 {
  const facts = baseFacts(input)
  const issues: VNextTextFlowDisplayListIssueV1[] = []
  const page = input.pageBox
  const body = page.body
  const style = input.style

  if (input.bindProductionRenderer === true) issues.push(issue(
    "production-binding-forbidden", "bindProductionRenderer", "The bounded text-flow display list cannot bind a production renderer.",
  ))
  if (input.pagination.status !== "complete") issues.push(issue(
    "pagination-not-complete", "pagination.status", "Text-flow display lists require complete accepted pagination.",
  ))
  if (input.projectionId.trim().length === 0) issues.push(issue(
    "invalid-projection-id", "projectionId", "Display-list projection id must not be blank.",
  ))
  if (!positive(page.widthPt) || !positive(page.heightPt)) issues.push(issue(
    "invalid-page-box", "pageBox", "Page width and height must be positive finite point values.",
  ))
  const bodyFinite = [body.xPt, body.yPt, body.widthPt, body.heightPt].every(finite)
  if (
    !bodyFinite || body.xPt < 0 || body.yPt < 0 || body.widthPt <= 0 || body.heightPt <= 0
    || body.xPt + body.widthPt > page.widthPt
    || body.yPt + body.heightPt > page.heightPt
  ) issues.push(issue(
    "invalid-body-box", "pageBox.body", "Body bounds must be positive, finite, and remain inside the page box.",
  ))
  if (
    style.styleKey.trim().length === 0
    || style.fontId.trim().length === 0
    || style.fontFamily.trim().length === 0
    || !positive(style.fontSizePt)
    || !positive(style.baselineOffsetPt)
    || !/^[0-9A-Fa-f]{6}$/u.test(style.color)
  ) issues.push(issue(
    "invalid-text-style", "style", "Text style requires stable identities, positive point sizes, and a six-digit RGB color.",
  ))

  if (input.pagination.status === "complete" && issues.length === 0) {
    input.pagination.pages.forEach((candidate, pageIndex) => {
      if (candidate.availableHeightPt !== body.heightPt) issues.push(issue(
        "page-body-height-mismatch",
        `pagination.pages[${pageIndex}].availableHeightPt`,
        "Paginated page height must exactly match the display-list body height.",
      ))
      candidate.fragment.lines.forEach((line, lineOffset) => {
        if (line.widthPt > body.widthPt || line.yOffsetPt + line.heightPt > body.heightPt) issues.push(issue(
          "line-outside-body",
          `pagination.pages[${pageIndex}].fragment.lines[${lineOffset}]`,
          "Measured line bounds must stay inside the display-list body.",
        ))
        if (style.baselineOffsetPt > line.heightPt) issues.push(issue(
          "baseline-outside-line",
          `pagination.pages[${pageIndex}].fragment.lines[${lineOffset}].heightPt`,
          "Paint baseline offset must stay inside every measured line box.",
        ))
      })
    })
  }

  if (issues.length > 0 || input.pagination.status !== "complete") return {
    ...facts,
    status: "blocked",
    pages: null,
    commands: null,
    fingerprint: null,
    issues,
    summary: null,
  }

  let paintOrder = 0
  const pages = input.pagination.pages.map((candidate): VNextTextFlowDisplayListPageV1 => {
    const commands = candidate.fragment.lines.map((line): VNextTextFlowLinePaintCommandV1 => {
      const yPt = body.yPt + line.yOffsetPt
      const command: VNextTextFlowLinePaintCommandV1 = {
        id: `paint:${candidate.fragment.fragmentId}:line-${line.index}`,
        kind: "text-line",
        pageIndex: candidate.familyPageIndex,
        paintOrder: paintOrder++,
        textBlockId: input.pagination.textBlockId,
        fragmentId: candidate.fragment.fragmentId,
        lineIndex: line.index,
        text: line.text,
        startOffset: line.startOffset,
        endOffset: line.endOffset,
        sourceStart: clone(line.sourceStart),
        sourceEnd: clone(line.sourceEnd),
        bounds: { xPt: body.xPt, yPt, widthPt: line.widthPt, heightPt: line.heightPt },
        baselineYPt: yPt + style.baselineOffsetPt,
        style: clone(style),
      }
      return command
    })
    return {
      pageIndex: candidate.familyPageIndex,
      pageNumber: candidate.familyPageIndex + 1,
      widthPt: page.widthPt,
      heightPt: page.heightPt,
      body: clone(body),
      fragmentFingerprint: candidate.fragment.fingerprint,
      commands,
    }
  })
  const commands = pages.flatMap((candidate) => candidate.commands)
  const fingerprint = createVNextCompactFingerprint(JSON.stringify({
    source: facts.source,
    contractVersion: facts.contractVersion,
    projectionId: facts.projectionId,
    paginationFingerprint: facts.paginationFingerprint,
    pages,
  }))
  return {
    ...facts,
    status: "ready",
    pages,
    commands,
    fingerprint,
    issues: [],
    summary: {
      pageCount: pages.length,
      commandCount: commands.length,
      nonBlankCommandCount: commands.filter((command) => command.text.trim().length > 0).length,
    },
  }
}
