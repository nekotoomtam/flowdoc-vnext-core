import type {
  VNextTextBlockV4MeasuredLine,
  VNextTextBlockV4MeasuredLinesResult,
  VNextTextBlockV4MeasurementIssue,
  VNextTextBlockV4MeasurementSourcePoint,
} from "./textBlockV4Measurement.js"

export const VNEXT_TEXT_BLOCK_V4_PAGINATION_SOURCE = "vnext-text-block-v4-pagination"
export const VNEXT_TEXT_BLOCK_V4_PAGINATION_VERSION = 1 as const

type AcceptedLines = Extract<VNextTextBlockV4MeasuredLinesResult, { status: "accepted" }>

export interface VNextTextBlockV4PageLine extends VNextTextBlockV4MeasuredLine {
  pageLineIndex: number
  yOffsetPt: number
}

export interface VNextTextBlockV4PageFragment {
  fragmentId: string
  nodeId: string
  pageIndex: number
  lineStartIndex: number
  lineEndIndexExclusive: number
  sourceStart: VNextTextBlockV4MeasurementSourcePoint
  sourceEnd: VNextTextBlockV4MeasurementSourcePoint
  heightPt: number
  lines: VNextTextBlockV4PageLine[]
}

export interface VNextTextBlockV4Page {
  pageIndex: number
  bodyHeightPt: number
  usedHeightPt: number
  remainingHeightPt: number
  fragments: [VNextTextBlockV4PageFragment]
}

export interface VNextTextBlockV4PaginationIssue extends VNextTextBlockV4MeasurementIssue {
  lineIndex?: number
}

export type VNextTextBlockV4PaginationResult =
  | {
      source: typeof VNEXT_TEXT_BLOCK_V4_PAGINATION_SOURCE
      version: typeof VNEXT_TEXT_BLOCK_V4_PAGINATION_VERSION
      status: "paginated"
      textBlockId: string
      pages: VNextTextBlockV4Page[]
      fragments: VNextTextBlockV4PageFragment[]
      issues: []
      summary: {
        pageCount: number
        fragmentCount: number
        lineCount: number
        splitAcrossPages: boolean
        totalMeasuredHeightPt: number
      }
      contracts: {
        authoredNodeMutation: false
        authoredIdentityAllocation: false
        lineRelayout: false
        rendererRelayout: false
      }
    }
  | {
      source: typeof VNEXT_TEXT_BLOCK_V4_PAGINATION_SOURCE
      version: typeof VNEXT_TEXT_BLOCK_V4_PAGINATION_VERSION
      status: "blocked"
      textBlockId: string
      pages: null
      fragments: null
      issues: VNextTextBlockV4PaginationIssue[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function blocked(textBlockId: string, issues: VNextTextBlockV4PaginationIssue[]): VNextTextBlockV4PaginationResult {
  return {
    source: VNEXT_TEXT_BLOCK_V4_PAGINATION_SOURCE,
    version: VNEXT_TEXT_BLOCK_V4_PAGINATION_VERSION,
    status: "blocked",
    textBlockId,
    pages: null,
    fragments: null,
    issues,
  }
}

function issue(code: string, path: string, message: string, lineIndex?: number): VNextTextBlockV4PaginationIssue {
  return {
    code,
    severity: "error",
    path,
    message,
    ...(lineIndex == null ? {} : { lineIndex }),
  }
}

export function paginateVNextTextBlockV4Lines(
  accepted: AcceptedLines,
  options: { pageBodyHeightPt: number; startPageIndex?: number },
): VNextTextBlockV4PaginationResult {
  const startPageIndex = options.startPageIndex ?? 0
  const issues: VNextTextBlockV4PaginationIssue[] = []
  const validPageBodyHeight = Number.isFinite(options.pageBodyHeightPt) && options.pageBodyHeightPt > 0
  if (!validPageBodyHeight) issues.push(issue(
    "invalid-page-body-height", "pageBodyHeightPt", "page body height must be a positive finite point value",
  ))
  if (!Number.isInteger(startPageIndex) || startPageIndex < 0) issues.push(issue(
    "invalid-start-page-index", "startPageIndex", "start page index must be a non-negative integer",
  ))
  if (validPageBodyHeight) accepted.lines.forEach((line, index) => {
    if (line.heightPt > options.pageBodyHeightPt) issues.push(issue(
      "line-exceeds-page-body", `lines[${index}].heightPt`,
      `measured line ${line.index} height ${line.heightPt} exceeds page body height ${options.pageBodyHeightPt}`,
      line.index,
    ))
  })
  if (issues.length > 0) return blocked(accepted.textBlockId, issues)

  const groups: VNextTextBlockV4MeasuredLine[][] = []
  let current: VNextTextBlockV4MeasuredLine[] = []
  let currentHeight = 0
  accepted.lines.forEach((line) => {
    if (current.length > 0 && currentHeight + line.heightPt > options.pageBodyHeightPt) {
      groups.push(current)
      current = []
      currentHeight = 0
    }
    current.push(line)
    currentHeight += line.heightPt
  })
  if (current.length > 0) groups.push(current)

  const fragments: VNextTextBlockV4PageFragment[] = groups.map((lines, groupIndex) => {
    let yOffsetPt = 0
    const pageLines = lines.map((line, pageLineIndex): VNextTextBlockV4PageLine => {
      const result = { ...clone(line), pageLineIndex, yOffsetPt }
      yOffsetPt += line.heightPt
      return result
    })
    const pageIndex = startPageIndex + groupIndex
    return {
      fragmentId: `${accepted.textBlockId}:page-${pageIndex}:lines-${lines[0].index}-${lines[lines.length - 1].index}`,
      nodeId: accepted.textBlockId,
      pageIndex,
      lineStartIndex: lines[0].index,
      lineEndIndexExclusive: lines[lines.length - 1].index + 1,
      sourceStart: clone(lines[0].sourceStart),
      sourceEnd: clone(lines[lines.length - 1].sourceEnd),
      heightPt: yOffsetPt,
      lines: pageLines,
    }
  })
  const pages: VNextTextBlockV4Page[] = fragments.map((fragment) => ({
    pageIndex: fragment.pageIndex,
    bodyHeightPt: options.pageBodyHeightPt,
    usedHeightPt: fragment.heightPt,
    remainingHeightPt: options.pageBodyHeightPt - fragment.heightPt,
    fragments: [fragment],
  }))

  return {
    source: VNEXT_TEXT_BLOCK_V4_PAGINATION_SOURCE,
    version: VNEXT_TEXT_BLOCK_V4_PAGINATION_VERSION,
    status: "paginated",
    textBlockId: accepted.textBlockId,
    pages,
    fragments,
    issues: [],
    summary: {
      pageCount: pages.length,
      fragmentCount: fragments.length,
      lineCount: accepted.lines.length,
      splitAcrossPages: pages.length > 1,
      totalMeasuredHeightPt: accepted.lines.reduce((sum, line) => sum + line.heightPt, 0),
    },
    contracts: {
      authoredNodeMutation: false,
      authoredIdentityAllocation: false,
      lineRelayout: false,
      rendererRelayout: false,
    },
  }
}
