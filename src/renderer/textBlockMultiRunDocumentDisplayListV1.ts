import type {
  VNextTextBlockMultiRunDocumentCompositionResultV1,
  VNextTextBlockMultiRunDocumentLinePlacementV1,
} from "../composition/textBlockMultiRunDocumentCompositionV1.js"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type { VNextTextBlockMultiRunLayoutResultV1 } from "../layout/textBlockMultiRunLayoutContractV1.js"
import type {
  VNextTextBlockMultiRunDisplayLineV1,
  VNextTextBlockMultiRunFragmentPaintCommandV1,
} from "./textBlockMultiRunDisplayListV1.js"
import { projectVNextTextBlockMultiRunDisplayListV1 } from "./textBlockMultiRunDisplayListV1.js"

export const VNEXT_TEXT_BLOCK_MULTI_RUN_DOCUMENT_DISPLAY_LIST_V1_SOURCE =
  "vnext-text-block-multi-run-document-display-list-v1" as const
export const VNEXT_TEXT_BLOCK_MULTI_RUN_DOCUMENT_DISPLAY_LIST_V1_VERSION = 1 as const

const issuedReadyDisplayLists = new WeakSet<object>()

export type VNextTextBlockMultiRunDocumentDisplayListIssueCodeV1 =
  | "production-binding-forbidden"
  | "composition-not-accepted"
  | "invalid-projection-id"
  | "layout-not-accepted"
  | "missing-layout"
  | "layout-fingerprint-mismatch"
  | "line-placement-mismatch"
  | "fingerprint-mismatch"
  | "composition-fingerprint-mismatch"
  | "invalid-previous-display-list"
  | "unsafe-layout-arithmetic"

export interface VNextTextBlockMultiRunDocumentDisplayListIssueV1 {
  code: VNextTextBlockMultiRunDocumentDisplayListIssueCodeV1
  severity: "error"
  path: string
  message: string
  textBlockId?: string
  lineIndex?: number
}

export interface VNextTextBlockMultiRunDocumentPaintCommandV1
  extends VNextTextBlockMultiRunFragmentPaintCommandV1 {
  pageIndex: number
  placementId: string
  placementFingerprint: string
}

export interface VNextTextBlockMultiRunDocumentDisplayLineV1
  extends VNextTextBlockMultiRunDisplayLineV1 {
  id: string
  textBlockId: string
  layoutId: string
  layoutFingerprint: string
  pageIndex: number
  placementId: string
  placementFingerprint: string
}

export interface VNextTextBlockMultiRunDocumentDisplayPageV1 {
  pageIndex: number
  compositionPageFingerprint: string
  lineIds: string[]
  commandIds: string[]
  fingerprint: string
}

interface VNextTextBlockMultiRunDocumentDisplayListFactsV1 {
  source: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_DOCUMENT_DISPLAY_LIST_V1_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_DOCUMENT_DISPLAY_LIST_V1_VERSION
  projectionId: string
  compositionId: string
  compositionFingerprint: string | null
  layoutUnitPolicyFingerprint: string
  contracts: {
    consumes: "vnext-text-block-multi-run-document-composition-v1"
    geometryUnit: "micro-point-integer"
    paginationAuthority: "core-composition"
    positionsAndBaselines: "core-accepted-page-line-placements"
    rendererConversion: "divide-once-at-paint-boundary"
    rendererMayMeasureText: false
    rendererMayRelayout: false
    rendererMayPaginate: false
    glyphRasterization: "renderer-owned"
    artifactBytes: false
    productionBinding: false
  }
}

export type VNextTextBlockMultiRunDocumentDisplayListResultV1 =
  | (VNextTextBlockMultiRunDocumentDisplayListFactsV1 & {
      status: "ready"
      pages: VNextTextBlockMultiRunDocumentDisplayPageV1[]
      lines: VNextTextBlockMultiRunDocumentDisplayLineV1[]
      commands: VNextTextBlockMultiRunDocumentPaintCommandV1[]
      fingerprint: string
      issues: []
      summary: {
        pageCount: number
        lineCount: number
        commandCount: number
        nonBlankCommandCount: number
      }
      work: {
        reusedLineCount: number
        projectedLineCount: number
        validatedLayoutCount: number
      }
    })
  | (VNextTextBlockMultiRunDocumentDisplayListFactsV1 & {
      status: "blocked"
      pages: null
      lines: null
      commands: null
      fingerprint: null
      issues: VNextTextBlockMultiRunDocumentDisplayListIssueV1[]
      summary: null
      work: null
    })

export interface VNextTextBlockMultiRunDocumentDisplayListRequestV1 {
  projectionId: string
  composition: VNextTextBlockMultiRunDocumentCompositionResultV1
  layouts: VNextTextBlockMultiRunLayoutResultV1[]
  previousDisplayList?: VNextTextBlockMultiRunDocumentDisplayListResultV1
  bindProductionRenderer?: boolean
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function deepFreeze<T>(value: T): T {
  if (value != null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value as Record<string, unknown>).forEach((child) => deepFreeze(child))
    Object.freeze(value)
  }
  return value
}

function safeSum(...values: number[]): number | null {
  let total = 0
  for (const value of values) {
    total += value
    if (!Number.isSafeInteger(total)) return null
  }
  return total
}

function fingerprintWithoutFingerprint(value: { fingerprint: string }): string {
  const { fingerprint: _fingerprint, ...facts } = value
  return createVNextCompactFingerprint(JSON.stringify(facts))
}

function issue(
  code: VNextTextBlockMultiRunDocumentDisplayListIssueCodeV1,
  path: string,
  message: string,
  details: Pick<VNextTextBlockMultiRunDocumentDisplayListIssueV1, "textBlockId" | "lineIndex"> = {},
): VNextTextBlockMultiRunDocumentDisplayListIssueV1 {
  return { code, severity: "error", path, message, ...details }
}

function facts(input: VNextTextBlockMultiRunDocumentDisplayListRequestV1): VNextTextBlockMultiRunDocumentDisplayListFactsV1 {
  return {
    source: VNEXT_TEXT_BLOCK_MULTI_RUN_DOCUMENT_DISPLAY_LIST_V1_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_MULTI_RUN_DOCUMENT_DISPLAY_LIST_V1_VERSION,
    projectionId: input.projectionId,
    compositionId: input.composition.compositionId,
    compositionFingerprint: input.composition.fingerprint,
    layoutUnitPolicyFingerprint: input.composition.layoutUnitPolicyFingerprint,
    contracts: {
      consumes: "vnext-text-block-multi-run-document-composition-v1",
      geometryUnit: "micro-point-integer",
      paginationAuthority: "core-composition",
      positionsAndBaselines: "core-accepted-page-line-placements",
      rendererConversion: "divide-once-at-paint-boundary",
      rendererMayMeasureText: false,
      rendererMayRelayout: false,
      rendererMayPaginate: false,
      glyphRasterization: "renderer-owned",
      artifactBytes: false,
      productionBinding: false,
    },
  }
}

function placementMatchesLine(
  placement: VNextTextBlockMultiRunDocumentLinePlacementV1,
  line: Extract<VNextTextBlockMultiRunLayoutResultV1, { status: "accepted" }>["lines"][number],
): boolean {
  return placement.lineFingerprint === line.fingerprint
    && placement.widthLayoutUnit === line.widthLayoutUnit
    && placement.heightLayoutUnit === line.heightLayoutUnit
    && placement.baselineYLayoutUnit === placement.yLayoutUnit + line.baselineOffsetLayoutUnit
}

function acceptedDisplayListFingerprint(
  value: Extract<VNextTextBlockMultiRunDocumentDisplayListResultV1, { status: "ready" }>,
): string {
  const { status: _status, fingerprint: _fingerprint, issues: _issues, ...resultFacts } = value
  return createVNextCompactFingerprint(JSON.stringify(resultFacts))
}

export function projectVNextTextBlockMultiRunDocumentDisplayListV1(
  input: VNextTextBlockMultiRunDocumentDisplayListRequestV1,
): VNextTextBlockMultiRunDocumentDisplayListResultV1 {
  const base = facts(input)
  const issues: VNextTextBlockMultiRunDocumentDisplayListIssueV1[] = []
  if (input.bindProductionRenderer === true) issues.push(issue(
    "production-binding-forbidden",
    "bindProductionRenderer",
    "The bounded TextBlock-only document display list cannot bind a production renderer.",
  ))
  if (input.projectionId.trim().length === 0) issues.push(issue(
    "invalid-projection-id",
    "projectionId",
    "Document projection id must not be blank.",
  ))
  if (input.composition.status !== "accepted") issues.push(issue(
    "composition-not-accepted",
    "composition.status",
    "Document display-list projection requires an accepted Core composition.",
  ))
  const previousDisplayList = input.previousDisplayList?.status === "ready"
    ? input.previousDisplayList
    : null
  if (
    input.previousDisplayList != null
    && (
      previousDisplayList == null
      || (
        !issuedReadyDisplayLists.has(previousDisplayList)
        && acceptedDisplayListFingerprint(previousDisplayList) !== previousDisplayList.fingerprint
      )
    )
  ) issues.push(issue(
    "invalid-previous-display-list",
    "previousDisplayList",
    "Incremental projection requires an unchanged previously ready display list.",
  ))
  const previousLineByPlacementId = new Map(
    previousDisplayList?.lines.map((line) => [line.placementId, line]),
  )
  const layouts = new Map<string, Extract<VNextTextBlockMultiRunLayoutResultV1, { status: "accepted" }>>()
  input.layouts.forEach((layout, index) => {
    if (layout.status !== "accepted") issues.push(issue(
      "layout-not-accepted",
      `layouts[${index}].status`,
      "Document display-list layouts must be Core-accepted.",
      { textBlockId: layout.textBlockId },
    ))
    else layouts.set(layout.textBlockId, layout)
  })

  const layoutsRequiringValidation = new Set<string>()
  if (input.composition.status === "accepted") {
    const { status: _status, fingerprint: _fingerprint, issues: _issues, ...compositionFacts } = input.composition
    if (createVNextCompactFingerprint(JSON.stringify(compositionFacts)) !== input.composition.fingerprint) issues.push(issue(
      "composition-fingerprint-mismatch",
      "composition.fingerprint",
      "Composition facts no longer match the Core-accepted snapshot fingerprint.",
    ))
    input.composition.blocks.forEach((block, blockIndex) => {
      const layout = layouts.get(block.textBlockId)
      if (layout == null) issues.push(issue(
        "missing-layout",
        `composition.blocks[${blockIndex}]`,
        "Every composed TextBlock requires its accepted layout for projection.",
        { textBlockId: block.textBlockId },
      ))
      else if (layout.fingerprint !== block.layoutFingerprint || layout.layoutId !== block.layoutId) issues.push(issue(
        "layout-fingerprint-mismatch",
        `composition.blocks[${blockIndex}].layoutFingerprint`,
        "Projection layout identity must exactly match the composed layout.",
        { textBlockId: block.textBlockId },
      ))
    })
    input.composition.linePlacements.forEach((placement, placementIndex) => {
      const layout = layouts.get(placement.textBlockId)
      const line = layout?.lines[placement.lineIndex]
      const previousLine = previousLineByPlacementId.get(placement.placementId)
      const reusable = previousLine != null
        && previousLine.placementFingerprint === placement.fingerprint
        && previousLine.layoutFingerprint === placement.layoutFingerprint
        && previousLine.lineFingerprint === placement.lineFingerprint
      if (!reusable && (line == null || !placementMatchesLine(placement, line))) issues.push(issue(
        "line-placement-mismatch",
        `composition.linePlacements[${placementIndex}]`,
        "Page line placement must exactly match its accepted TextBlock line.",
        { textBlockId: placement.textBlockId, lineIndex: placement.lineIndex },
      ))
      if (!reusable) layoutsRequiringValidation.add(placement.textBlockId)
      if (fingerprintWithoutFingerprint(placement) !== placement.fingerprint) issues.push(issue(
        "fingerprint-mismatch",
        `composition.linePlacements[${placementIndex}].fingerprint`,
        "Line placement facts no longer match their Core fingerprint.",
        { textBlockId: placement.textBlockId, lineIndex: placement.lineIndex },
      ))
    })
  }

  layoutsRequiringValidation.forEach((textBlockId) => {
    const layout = layouts.get(textBlockId)
    if (layout == null) return
    const validation = projectVNextTextBlockMultiRunDisplayListV1({
      projectionId: `document-layout-validation:${input.projectionId}:${layout.textBlockId}`,
      layout,
      origin: { xLayoutUnit: 0, yLayoutUnit: 0 },
    })
    if (validation.status !== "ready") issues.push(issue(
      "layout-fingerprint-mismatch",
      `layouts.${textBlockId}`,
      "Document projection requires unchanged Core-accepted layout facts for every newly projected placement.",
      { textBlockId: layout.textBlockId },
    ))
  })

  if (issues.length > 0 || input.composition.status !== "accepted") return {
    ...base,
    status: "blocked",
    pages: null,
    lines: null,
    commands: null,
    fingerprint: null,
    issues,
    summary: null,
    work: null,
  }

  let paintOrder = 0
  let reusedLineCount = 0
  const commands: VNextTextBlockMultiRunDocumentPaintCommandV1[] = []
  const previousCommandById = new Map(previousDisplayList?.commands.map((command) => [command.id, command]))
  const lines = input.composition.linePlacements.map((placement) => {
    const previousLine = previousLineByPlacementId.get(placement.placementId)
    if (
      previousLine != null
      && previousLine.placementFingerprint === placement.fingerprint
      && previousLine.layoutFingerprint === placement.layoutFingerprint
      && previousLine.lineFingerprint === placement.lineFingerprint
      && previousDisplayList != null
    ) {
      reusedLineCount += 1
      previousLine.commandIds.forEach((commandId) => {
        const previousCommand = previousCommandById.get(commandId)!
        commands.push({ ...clone(previousCommand), paintOrder: paintOrder++ })
      })
      return clone(previousLine)
    }
    const layout = layouts.get(placement.textBlockId)!
    const line = layout.lines[placement.lineIndex]!
    const commandIds: string[] = []
    line.fragments.forEach((fragment) => {
      const baselineX = safeSum(placement.xLayoutUnit, fragment.xLayoutUnit)!
      const baselineY = safeSum(placement.baselineYLayoutUnit, fragment.baselineShiftLayoutUnit)!
      const metricY = safeSum(baselineY, -fragment.ascentLayoutUnit)!
      const metricHeight = safeSum(fragment.ascentLayoutUnit, fragment.descentLayoutUnit)!
      const command: VNextTextBlockMultiRunDocumentPaintCommandV1 = {
        id: `paint:${placement.placementId}:${fragment.fragmentId}`,
        kind: "text-fragment",
        paintOrder: paintOrder++,
        pageIndex: placement.pageIndex,
        placementId: placement.placementId,
        placementFingerprint: placement.fingerprint,
        textBlockId: placement.textBlockId,
        layoutId: placement.layoutId,
        layoutFingerprint: placement.layoutFingerprint,
        lineIndex: placement.lineIndex,
        lineFingerprint: placement.lineFingerprint,
        fragmentId: fragment.fragmentId,
        fragmentFingerprint: fragment.fingerprint,
        shapingRunId: fragment.shapingRunId,
        renderStartOffset: fragment.renderStartOffset,
        renderEndOffset: fragment.renderEndOffset,
        text: fragment.text,
        lineBounds: {
          xLayoutUnit: baselineX,
          yLayoutUnit: placement.yLayoutUnit,
          widthLayoutUnit: fragment.advanceLayoutUnit,
          heightLayoutUnit: placement.heightLayoutUnit,
        },
        metricBounds: {
          xLayoutUnit: baselineX,
          yLayoutUnit: metricY,
          widthLayoutUnit: fragment.advanceLayoutUnit,
          heightLayoutUnit: metricHeight,
        },
        baselineXLayoutUnit: baselineX,
        baselineYLayoutUnit: baselineY,
        advanceLayoutUnit: fragment.advanceLayoutUnit,
        ascentLayoutUnit: fragment.ascentLayoutUnit,
        descentLayoutUnit: fragment.descentLayoutUnit,
        lineGapLayoutUnit: fragment.lineGapLayoutUnit,
        baselineShiftLayoutUnit: fragment.baselineShiftLayoutUnit,
        style: {
          styleKey: fragment.styleKey,
          fontFaceId: fragment.fontFaceId,
          fontFamily: fragment.fontFamily,
          fontSha256: fragment.fontSha256,
          fontWeight: fragment.fontWeight,
          fontStyle: fragment.fontStyle,
          fontSizeLayoutUnit: fragment.fontSizeLayoutUnit,
          textColor: fragment.textColor,
        },
        sourceSegments: clone(fragment.sourceSegments),
      }
      commandIds.push(command.id)
      commands.push(command)
    })
    return {
      id: `display-line:${placement.placementId}`,
      textBlockId: placement.textBlockId,
      layoutId: placement.layoutId,
      layoutFingerprint: placement.layoutFingerprint,
      pageIndex: placement.pageIndex,
      placementId: placement.placementId,
      placementFingerprint: placement.fingerprint,
      lineIndex: placement.lineIndex,
      lineFingerprint: placement.lineFingerprint,
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
      text: line.text,
      bounds: {
        xLayoutUnit: placement.xLayoutUnit,
        yLayoutUnit: placement.yLayoutUnit,
        widthLayoutUnit: placement.widthLayoutUnit,
        heightLayoutUnit: placement.heightLayoutUnit,
      },
      baselineYLayoutUnit: placement.baselineYLayoutUnit,
      commandIds,
      sourceSegments: clone(line.sourceSegments),
    }
  })
  const pages = input.composition.pages.map((compositionPage) => {
    const pageLines = lines.filter((line) => line.pageIndex === compositionPage.pageIndex)
    const pageFacts = {
      pageIndex: compositionPage.pageIndex,
      compositionPageFingerprint: compositionPage.fingerprint,
      lineIds: pageLines.map((line) => line.id),
      commandIds: pageLines.flatMap((line) => line.commandIds),
    }
    return {
      ...pageFacts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(pageFacts)),
    }
  })
  const resultFacts = {
    ...base,
    pages,
    lines,
    commands,
    summary: {
      pageCount: pages.length,
      lineCount: lines.length,
      commandCount: commands.length,
      nonBlankCommandCount: commands.filter((command) => command.text.trim().length > 0).length,
    },
    work: {
      reusedLineCount,
      projectedLineCount: lines.length - reusedLineCount,
      validatedLayoutCount: layoutsRequiringValidation.size,
    },
  }
  const ready: VNextTextBlockMultiRunDocumentDisplayListResultV1 = {
    ...resultFacts,
    status: "ready",
    fingerprint: createVNextCompactFingerprint(JSON.stringify(resultFacts)),
    issues: [],
  }
  deepFreeze(ready)
  issuedReadyDisplayLists.add(ready)
  return ready
}
