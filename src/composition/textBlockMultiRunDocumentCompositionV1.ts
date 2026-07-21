import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  createVNextLayoutUnitPolicyV1,
  VNextNonNegativeLayoutUnitV1Schema,
  VNextPositiveLayoutUnitV1Schema,
} from "../layout/layoutUnitPolicyV1.js"
import type {
  VNextTextBlockMultiRunLayoutResultV1,
  VNextTextBlockPositionedLineV1,
} from "../layout/textBlockMultiRunLayoutContractV1.js"

export const VNEXT_TEXT_BLOCK_MULTI_RUN_DOCUMENT_COMPOSITION_V1_SOURCE =
  "vnext-text-block-multi-run-document-composition-v1" as const
export const VNEXT_TEXT_BLOCK_MULTI_RUN_DOCUMENT_COMPOSITION_V1_VERSION = 1 as const

export type VNextTextBlockMultiRunDocumentCompositionIssueCodeV1 =
  | "production-binding-forbidden"
  | "invalid-composition-identity"
  | "invalid-page-geometry"
  | "invalid-block-gap"
  | "duplicate-text-block"
  | "layout-not-accepted"
  | "layout-unit-policy-mismatch"
  | "layout-width-mismatch"
  | "text-block-identity-mismatch"
  | "invalid-dirty-text-block"
  | "invalid-previous-composition"
  | "line-too-tall"
  | "unsafe-layout-arithmetic"

export interface VNextTextBlockMultiRunDocumentCompositionIssueV1 {
  code: VNextTextBlockMultiRunDocumentCompositionIssueCodeV1
  severity: "error"
  path: string
  message: string
  textBlockId?: string
  lineIndex?: number
}

export interface VNextTextBlockMultiRunDocumentPageGeometryV1 {
  widthLayoutUnit: number
  heightLayoutUnit: number
  bodyXLayoutUnit: number
  bodyYLayoutUnit: number
  bodyWidthLayoutUnit: number
  bodyHeightLayoutUnit: number
}

export interface VNextTextBlockMultiRunDocumentBlockInputV1 {
  textBlockId: string
  layout: VNextTextBlockMultiRunLayoutResultV1
}

export interface VNextTextBlockMultiRunDocumentCursorV1 {
  pageIndex: number
  yOffsetLayoutUnit: number
}

export interface VNextTextBlockMultiRunDocumentLinePlacementV1 {
  placementId: string
  blockIndex: number
  textBlockId: string
  layoutId: string
  layoutFingerprint: string
  lineIndex: number
  lineFingerprint: string
  pageIndex: number
  xLayoutUnit: number
  yLayoutUnit: number
  widthLayoutUnit: number
  heightLayoutUnit: number
  baselineYLayoutUnit: number
  continuesFromPreviousPage: boolean
  continuesOnNextPage: boolean
  fingerprint: string
}

export interface VNextTextBlockMultiRunDocumentBlockPlacementV1 {
  blockIndex: number
  textBlockId: string
  layoutId: string
  layoutFingerprint: string
  startCursor: VNextTextBlockMultiRunDocumentCursorV1
  endCursor: VNextTextBlockMultiRunDocumentCursorV1
  placementStartIndex: number
  placementEndIndex: number
  pageIndices: number[]
  splitAcrossPages: boolean
  fingerprint: string
}

export interface VNextTextBlockMultiRunDocumentPageV1 {
  pageIndex: number
  placementIds: string[]
  usedHeightLayoutUnit: number
  remainingHeightLayoutUnit: number
  fingerprint: string
}

interface VNextTextBlockMultiRunDocumentCompositionFactsV1 {
  source: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_DOCUMENT_COMPOSITION_V1_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_DOCUMENT_COMPOSITION_V1_VERSION
  compositionId: string
  documentId: string
  documentRevision: number
  layoutUnitPolicyFingerprint: string
  contracts: {
    consumes: "vnext-text-block-multi-run-layout-v1"
    scope: "ordered-text-blocks-only"
    geometryUnit: "micro-point-integer"
    paginationAuthority: "core"
    lineBreakAuthority: "accepted-layout"
    rendererMayPaginate: false
    incrementalReuse: "exact-block-boundary-cursor"
    artifactBytes: false
    productionBinding: false
  }
}

export type VNextTextBlockMultiRunDocumentCompositionResultV1 =
  | (VNextTextBlockMultiRunDocumentCompositionFactsV1 & {
      status: "accepted"
      pageGeometry: VNextTextBlockMultiRunDocumentPageGeometryV1
      blockGapLayoutUnit: number
      blocks: VNextTextBlockMultiRunDocumentBlockPlacementV1[]
      linePlacements: VNextTextBlockMultiRunDocumentLinePlacementV1[]
      pages: VNextTextBlockMultiRunDocumentPageV1[]
      fingerprint: string
      issues: []
      summary: {
        blockCount: number
        lineCount: number
        pageCount: number
        splitBlockCount: number
      }
      work: {
        firstDirtyBlockIndex: number | null
        reusedPrefixBlockCount: number
        recomposedBlockCount: number
        recomposedLineCount: number
        reusedSuffixBlockCount: number
        reconvergedAtBlockIndex: number | null
      }
    })
  | (VNextTextBlockMultiRunDocumentCompositionFactsV1 & {
      status: "blocked"
      pageGeometry: null
      blockGapLayoutUnit: null
      blocks: null
      linePlacements: null
      pages: null
      fingerprint: null
      issues: VNextTextBlockMultiRunDocumentCompositionIssueV1[]
      summary: null
      work: null
    })

export interface VNextTextBlockMultiRunDocumentCompositionRequestV1 {
  compositionId: string
  documentId: string
  documentRevision: number
  layoutUnitPolicyFingerprint: string
  pageGeometry: VNextTextBlockMultiRunDocumentPageGeometryV1
  blockGapLayoutUnit: number
  blocks: VNextTextBlockMultiRunDocumentBlockInputV1[]
  dirtyTextBlockIds: string[]
  previousComposition?: VNextTextBlockMultiRunDocumentCompositionResultV1
  bindProductionComposition?: boolean
}

interface MutableBlockResult {
  block: VNextTextBlockMultiRunDocumentBlockPlacementV1
  lines: VNextTextBlockMultiRunDocumentLinePlacementV1[]
  cursor: VNextTextBlockMultiRunDocumentCursorV1
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function safeSum(...values: number[]): number | null {
  let total = 0
  for (const value of values) {
    total += value
    if (!Number.isSafeInteger(total)) return null
  }
  return total
}

function sameCursor(
  left: VNextTextBlockMultiRunDocumentCursorV1,
  right: VNextTextBlockMultiRunDocumentCursorV1,
): boolean {
  return left.pageIndex === right.pageIndex && left.yOffsetLayoutUnit === right.yOffsetLayoutUnit
}

function fingerprintRecord<T extends Record<string, unknown>>(facts: T): T & { fingerprint: string } {
  return {
    ...facts,
    fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
  }
}

function issue(
  code: VNextTextBlockMultiRunDocumentCompositionIssueCodeV1,
  path: string,
  message: string,
  details: Pick<VNextTextBlockMultiRunDocumentCompositionIssueV1, "textBlockId" | "lineIndex"> = {},
): VNextTextBlockMultiRunDocumentCompositionIssueV1 {
  return { code, severity: "error", path, message, ...details }
}

function facts(input: VNextTextBlockMultiRunDocumentCompositionRequestV1): VNextTextBlockMultiRunDocumentCompositionFactsV1 {
  return {
    source: VNEXT_TEXT_BLOCK_MULTI_RUN_DOCUMENT_COMPOSITION_V1_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_MULTI_RUN_DOCUMENT_COMPOSITION_V1_VERSION,
    compositionId: input.compositionId,
    documentId: input.documentId,
    documentRevision: input.documentRevision,
    layoutUnitPolicyFingerprint: input.layoutUnitPolicyFingerprint,
    contracts: {
      consumes: "vnext-text-block-multi-run-layout-v1",
      scope: "ordered-text-blocks-only",
      geometryUnit: "micro-point-integer",
      paginationAuthority: "core",
      lineBreakAuthority: "accepted-layout",
      rendererMayPaginate: false,
      incrementalReuse: "exact-block-boundary-cursor",
      artifactBytes: false,
      productionBinding: false,
    },
  }
}

function compatiblePrevious(
  input: VNextTextBlockMultiRunDocumentCompositionRequestV1,
  previous: VNextTextBlockMultiRunDocumentCompositionResultV1 | undefined,
): previous is Extract<VNextTextBlockMultiRunDocumentCompositionResultV1, { status: "accepted" }> {
  return previous?.status === "accepted"
    && previous.documentId === input.documentId
    && previous.layoutUnitPolicyFingerprint === input.layoutUnitPolicyFingerprint
    && previous.blockGapLayoutUnit === input.blockGapLayoutUnit
    && JSON.stringify(previous.pageGeometry) === JSON.stringify(input.pageGeometry)
}

function acceptedCompositionFingerprint(
  value: Extract<VNextTextBlockMultiRunDocumentCompositionResultV1, { status: "accepted" }>,
): string {
  const { status: _status, fingerprint: _fingerprint, issues: _issues, ...resultFacts } = value
  return createVNextCompactFingerprint(JSON.stringify(resultFacts))
}

function firstAffectedBlockIndex(
  input: VNextTextBlockMultiRunDocumentCompositionRequestV1,
  previous: Extract<VNextTextBlockMultiRunDocumentCompositionResultV1, { status: "accepted" }> | null,
): number {
  if (previous == null) return 0
  const dirty = new Set(input.dirtyTextBlockIds)
  for (let index = 0; index < input.blocks.length; index += 1) {
    const current = input.blocks[index]!
    const prior = previous.blocks[index]
    if (
      dirty.has(current.textBlockId)
      || prior == null
      || prior.textBlockId !== current.textBlockId
      || prior.layoutFingerprint !== current.layout.fingerprint
    ) return index
  }
  return previous.blocks.length === input.blocks.length ? input.blocks.length : 0
}

function unchangedSuffix(
  input: VNextTextBlockMultiRunDocumentCompositionRequestV1,
  previous: Extract<VNextTextBlockMultiRunDocumentCompositionResultV1, { status: "accepted" }>,
  startIndex: number,
): boolean {
  if (input.blocks.length !== previous.blocks.length) return false
  for (let index = startIndex; index < input.blocks.length; index += 1) {
    const current = input.blocks[index]!
    const prior = previous.blocks[index]!
    if (current.textBlockId !== prior.textBlockId || current.layout.fingerprint !== prior.layoutFingerprint) return false
  }
  return true
}

function composeBlock(
  input: VNextTextBlockMultiRunDocumentCompositionRequestV1,
  blockInput: VNextTextBlockMultiRunDocumentBlockInputV1,
  blockIndex: number,
  startCursor: VNextTextBlockMultiRunDocumentCursorV1,
  placementStartIndex: number,
): MutableBlockResult | VNextTextBlockMultiRunDocumentCompositionIssueV1 {
  const layout = blockInput.layout
  if (layout.status !== "accepted") return issue(
    "layout-not-accepted",
    `blocks[${blockIndex}].layout.status`,
    "Document composition requires an accepted multi-run TextBlock layout.",
    { textBlockId: blockInput.textBlockId },
  )

  let pageIndex = startCursor.pageIndex
  let yOffsetLayoutUnit = startCursor.yOffsetLayoutUnit
  const placed: VNextTextBlockMultiRunDocumentLinePlacementV1[] = []
  const pageIndices: number[] = []
  const firstLine = layout.lines[0]!
  if (yOffsetLayoutUnit > 0) {
    const withGapAndFirstLine = safeSum(yOffsetLayoutUnit, input.blockGapLayoutUnit, firstLine.heightLayoutUnit)
    if (withGapAndFirstLine == null) return issue(
      "unsafe-layout-arithmetic",
      `blocks[${blockIndex}]`,
      "Block spacing exceeds the signed safe-integer layout range.",
      { textBlockId: blockInput.textBlockId },
    )
    if (withGapAndFirstLine > input.pageGeometry.bodyHeightLayoutUnit) {
      pageIndex += 1
      yOffsetLayoutUnit = 0
    } else {
      yOffsetLayoutUnit += input.blockGapLayoutUnit
    }
  }
  const actualStartCursor = { pageIndex, yOffsetLayoutUnit }

  layout.lines.forEach((line, lineIndex) => {
    if (line.heightLayoutUnit > input.pageGeometry.bodyHeightLayoutUnit) return
    const bottom = safeSum(yOffsetLayoutUnit, line.heightLayoutUnit)
    if (bottom == null) return
    if (bottom > input.pageGeometry.bodyHeightLayoutUnit) {
      pageIndex += 1
      yOffsetLayoutUnit = 0
    }
    const absoluteY = safeSum(input.pageGeometry.bodyYLayoutUnit, yOffsetLayoutUnit)
    const baselineY = absoluteY == null ? null : safeSum(absoluteY, line.baselineOffsetLayoutUnit)
    if (absoluteY == null || baselineY == null) return
    if (pageIndices.at(-1) !== pageIndex) pageIndices.push(pageIndex)
    const placementFacts = {
      placementId: `text-block:${blockInput.textBlockId}:line:${lineIndex}:page:${pageIndex}`,
      blockIndex,
      textBlockId: blockInput.textBlockId,
      layoutId: layout.layoutId,
      layoutFingerprint: layout.fingerprint,
      lineIndex,
      lineFingerprint: line.fingerprint,
      pageIndex,
      xLayoutUnit: input.pageGeometry.bodyXLayoutUnit,
      yLayoutUnit: absoluteY,
      widthLayoutUnit: line.widthLayoutUnit,
      heightLayoutUnit: line.heightLayoutUnit,
      baselineYLayoutUnit: baselineY,
      continuesFromPreviousPage: lineIndex > 0 && placed.at(-1)?.pageIndex !== pageIndex,
      continuesOnNextPage: false,
    }
    const previousPlacement = placed.at(-1)
    if (previousPlacement != null && previousPlacement.pageIndex !== pageIndex) {
      const { fingerprint: _oldFingerprint, ...previousFacts } = previousPlacement
      previousFacts.continuesOnNextPage = true
      placed[placed.length - 1] = fingerprintRecord(previousFacts)
    }
    placed.push(fingerprintRecord(placementFacts))
    yOffsetLayoutUnit += line.heightLayoutUnit
  })

  if (placed.length !== layout.lines.length) return issue(
    layout.lines.some((line) => line.heightLayoutUnit > input.pageGeometry.bodyHeightLayoutUnit)
      ? "line-too-tall"
      : "unsafe-layout-arithmetic",
    `blocks[${blockIndex}].layout.lines`,
    "Every accepted line must fit one page body and retain safe absolute geometry.",
    { textBlockId: blockInput.textBlockId },
  )
  const endCursor = { pageIndex, yOffsetLayoutUnit }
  const blockFacts = {
    blockIndex,
    textBlockId: blockInput.textBlockId,
    layoutId: layout.layoutId,
    layoutFingerprint: layout.fingerprint,
    startCursor: actualStartCursor,
    endCursor,
    placementStartIndex,
    placementEndIndex: placementStartIndex + placed.length,
    pageIndices,
    splitAcrossPages: pageIndices.length > 1,
  }
  return { block: fingerprintRecord(blockFacts), lines: placed, cursor: endCursor }
}

function buildPages(
  placements: readonly VNextTextBlockMultiRunDocumentLinePlacementV1[],
  bodyYLayoutUnit: number,
  bodyHeightLayoutUnit: number,
): VNextTextBlockMultiRunDocumentPageV1[] {
  const maximumPageIndex = placements.reduce((maximum, placement) => Math.max(maximum, placement.pageIndex), 0)
  return Array.from({ length: maximumPageIndex + 1 }, (_, pageIndex) => {
    const pagePlacements = placements.filter((placement) => placement.pageIndex === pageIndex)
    const usedHeightLayoutUnit = pagePlacements.reduce((maximum, placement) => Math.max(
      maximum,
      placement.yLayoutUnit - bodyYLayoutUnit + placement.heightLayoutUnit,
    ), 0)
    return fingerprintRecord({
      pageIndex,
      placementIds: pagePlacements.map((placement) => placement.placementId),
      usedHeightLayoutUnit,
      remainingHeightLayoutUnit: bodyHeightLayoutUnit - usedHeightLayoutUnit,
    })
  })
}

export function composeVNextTextBlockMultiRunDocumentV1(
  input: VNextTextBlockMultiRunDocumentCompositionRequestV1,
): VNextTextBlockMultiRunDocumentCompositionResultV1 {
  const base = facts(input)
  const issues: VNextTextBlockMultiRunDocumentCompositionIssueV1[] = []
  const policy = createVNextLayoutUnitPolicyV1()
  if (input.bindProductionComposition === true) issues.push(issue(
    "production-binding-forbidden",
    "bindProductionComposition",
    "The bounded TextBlock-only document compositor cannot bind production composition.",
  ))
  if (
    input.compositionId.trim().length === 0
    || input.documentId.trim().length === 0
    || !Number.isSafeInteger(input.documentRevision)
    || input.documentRevision < 0
  ) issues.push(issue(
    "invalid-composition-identity",
    "compositionId",
    "Composition and document identity require non-blank ids and a non-negative safe revision.",
  ))
  if (input.layoutUnitPolicyFingerprint !== policy.fingerprint) issues.push(issue(
    "layout-unit-policy-mismatch",
    "layoutUnitPolicyFingerprint",
    "Document composition must pin the current fixed-point layout-unit policy.",
  ))
  const geometry = input.pageGeometry
  if (
    !VNextPositiveLayoutUnitV1Schema.safeParse(geometry.widthLayoutUnit).success
    || !VNextPositiveLayoutUnitV1Schema.safeParse(geometry.heightLayoutUnit).success
    || !VNextNonNegativeLayoutUnitV1Schema.safeParse(geometry.bodyXLayoutUnit).success
    || !VNextNonNegativeLayoutUnitV1Schema.safeParse(geometry.bodyYLayoutUnit).success
    || !VNextPositiveLayoutUnitV1Schema.safeParse(geometry.bodyWidthLayoutUnit).success
    || !VNextPositiveLayoutUnitV1Schema.safeParse(geometry.bodyHeightLayoutUnit).success
    || safeSum(geometry.bodyXLayoutUnit, geometry.bodyWidthLayoutUnit) == null
    || geometry.bodyXLayoutUnit + geometry.bodyWidthLayoutUnit > geometry.widthLayoutUnit
    || safeSum(geometry.bodyYLayoutUnit, geometry.bodyHeightLayoutUnit) == null
    || geometry.bodyYLayoutUnit + geometry.bodyHeightLayoutUnit > geometry.heightLayoutUnit
  ) issues.push(issue(
    "invalid-page-geometry",
    "pageGeometry",
    "Page body geometry must be positive, safe, and contained inside the page.",
  ))
  if (!VNextNonNegativeLayoutUnitV1Schema.safeParse(input.blockGapLayoutUnit).success) issues.push(issue(
    "invalid-block-gap",
    "blockGapLayoutUnit",
    "TextBlock spacing must be a non-negative safe layout integer.",
  ))
  if (input.blocks.length === 0) issues.push(issue(
    "layout-not-accepted",
    "blocks",
    "The bounded compositor requires at least one TextBlock.",
  ))
  const ids = new Set<string>()
  input.blocks.forEach((block, index) => {
    if (ids.has(block.textBlockId)) issues.push(issue(
      "duplicate-text-block",
      `blocks[${index}].textBlockId`,
      "TextBlock ids must be unique within source order.",
      { textBlockId: block.textBlockId },
    ))
    ids.add(block.textBlockId)
    if (block.layout.status !== "accepted") issues.push(issue(
      "layout-not-accepted",
      `blocks[${index}].layout.status`,
      "Every document block requires a Core-accepted layout.",
      { textBlockId: block.textBlockId },
    ))
    if (block.layout.textBlockId !== block.textBlockId) issues.push(issue(
      "text-block-identity-mismatch",
      `blocks[${index}]`,
      "Block input identity must match the accepted layout identity.",
      { textBlockId: block.textBlockId },
    ))
    if (block.layout.layoutUnitPolicyFingerprint !== input.layoutUnitPolicyFingerprint) issues.push(issue(
      "layout-unit-policy-mismatch",
      `blocks[${index}].layout.layoutUnitPolicyFingerprint`,
      "Every block must use the document composition layout-unit policy.",
      { textBlockId: block.textBlockId },
    ))
    if (block.layout.status === "accepted" && block.layout.summary.widthLayoutUnit > geometry.bodyWidthLayoutUnit) {
      issues.push(issue(
        "layout-width-mismatch",
        `blocks[${index}].layout.summary.widthLayoutUnit`,
        "Accepted TextBlock lines cannot exceed the page body width.",
        { textBlockId: block.textBlockId },
      ))
    }
  })
  input.dirtyTextBlockIds.forEach((textBlockId, index) => {
    if (!ids.has(textBlockId)) issues.push(issue(
      "invalid-dirty-text-block",
      `dirtyTextBlockIds[${index}]`,
      "Dirty TextBlock ids must exist in the current ordered input.",
      { textBlockId },
    ))
  })
  if (
    input.previousComposition?.status === "accepted"
    && acceptedCompositionFingerprint(input.previousComposition) !== input.previousComposition.fingerprint
  ) issues.push(issue(
    "invalid-previous-composition",
    "previousComposition.fingerprint",
    "Incremental reuse requires an unchanged previously accepted composition snapshot.",
  ))
  if (issues.length > 0) return {
    ...base,
    status: "blocked",
    pageGeometry: null,
    blockGapLayoutUnit: null,
    blocks: null,
    linePlacements: null,
    pages: null,
    fingerprint: null,
    issues,
    summary: null,
    work: null,
  }

  const previous = compatiblePrevious(input, input.previousComposition) ? input.previousComposition : null
  const firstDirtyBlockIndex = firstAffectedBlockIndex(input, previous)
  const blocks: VNextTextBlockMultiRunDocumentBlockPlacementV1[] = []
  const linePlacements: VNextTextBlockMultiRunDocumentLinePlacementV1[] = []
  let cursor: VNextTextBlockMultiRunDocumentCursorV1 = { pageIndex: 0, yOffsetLayoutUnit: 0 }
  let reusedPrefixBlockCount = 0
  let recomposedBlockCount = 0
  let recomposedLineCount = 0
  let reusedSuffixBlockCount = 0
  let reconvergedAtBlockIndex: number | null = null

  if (previous != null && firstDirtyBlockIndex > 0 && firstDirtyBlockIndex < input.blocks.length) {
    const prefixPlacementEnd = previous.blocks[firstDirtyBlockIndex - 1]!.placementEndIndex
    blocks.push(...clone(previous.blocks.slice(0, firstDirtyBlockIndex)))
    linePlacements.push(...clone(previous.linePlacements.slice(0, prefixPlacementEnd)))
    cursor = clone(previous.blocks[firstDirtyBlockIndex - 1]!.endCursor)
    reusedPrefixBlockCount = firstDirtyBlockIndex
  }

  if (previous != null && firstDirtyBlockIndex === input.blocks.length) {
    blocks.push(...clone(previous.blocks))
    linePlacements.push(...clone(previous.linePlacements))
    reusedSuffixBlockCount = input.blocks.length
    reconvergedAtBlockIndex = 0
  } else {
    for (let blockIndex = firstDirtyBlockIndex; blockIndex < input.blocks.length; blockIndex += 1) {
      if (
        previous != null
        && unchangedSuffix(input, previous, blockIndex)
        && sameCursor(
          cursor,
          blockIndex === 0
            ? { pageIndex: 0, yOffsetLayoutUnit: 0 }
            : previous.blocks[blockIndex - 1]!.endCursor,
        )
      ) {
        const suffixPlacementStart = previous.blocks[blockIndex]!.placementStartIndex
        blocks.push(...clone(previous.blocks.slice(blockIndex)))
        linePlacements.push(...clone(previous.linePlacements.slice(suffixPlacementStart)))
        reusedSuffixBlockCount = input.blocks.length - blockIndex
        reconvergedAtBlockIndex = blockIndex
        break
      }
      const composed = composeBlock(input, input.blocks[blockIndex]!, blockIndex, cursor, linePlacements.length)
      if ("code" in composed) return {
        ...base,
        status: "blocked",
        pageGeometry: null,
        blockGapLayoutUnit: null,
        blocks: null,
        linePlacements: null,
        pages: null,
        fingerprint: null,
        issues: [composed],
        summary: null,
        work: null,
      }
      blocks.push(composed.block)
      linePlacements.push(...composed.lines)
      cursor = composed.cursor
      recomposedBlockCount += 1
      recomposedLineCount += composed.lines.length
    }
  }

  const pages = buildPages(
    linePlacements,
    input.pageGeometry.bodyYLayoutUnit,
    input.pageGeometry.bodyHeightLayoutUnit,
  )
  const work = {
    firstDirtyBlockIndex: firstDirtyBlockIndex === input.blocks.length ? null : firstDirtyBlockIndex,
    reusedPrefixBlockCount,
    recomposedBlockCount,
    recomposedLineCount,
    reusedSuffixBlockCount,
    reconvergedAtBlockIndex,
  }
  const resultFacts = {
    ...base,
    pageGeometry: clone(input.pageGeometry),
    blockGapLayoutUnit: input.blockGapLayoutUnit,
    blocks,
    linePlacements,
    pages,
    summary: {
      blockCount: blocks.length,
      lineCount: linePlacements.length,
      pageCount: pages.length,
      splitBlockCount: blocks.filter((block) => block.splitAcrossPages).length,
    },
    work,
  }
  return {
    ...resultFacts,
    status: "accepted",
    fingerprint: createVNextCompactFingerprint(JSON.stringify(resultFacts)),
    issues: [],
  }
}
