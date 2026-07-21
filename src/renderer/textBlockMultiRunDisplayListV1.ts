import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  createVNextLayoutUnitPolicyV1,
  VNextLayoutUnitV1Schema,
  VNextNonNegativeLayoutUnitV1Schema,
  VNextPositiveLayoutUnitV1Schema,
} from "../layout/layoutUnitPolicyV1.js"
import type {
  VNextTextBlockMultiRunLayoutResultV1,
  VNextTextBlockMultiRunSourceSegmentV1,
  VNextTextBlockPositionedFragmentV1,
  VNextTextBlockPositionedLineV1,
} from "../layout/textBlockMultiRunLayoutContractV1.js"

export const VNEXT_TEXT_BLOCK_MULTI_RUN_DISPLAY_LIST_V1_SOURCE = "vnext-text-block-multi-run-display-list-v1" as const
export const VNEXT_TEXT_BLOCK_MULTI_RUN_DISPLAY_LIST_V1_VERSION = 1 as const

export type VNextTextBlockMultiRunDisplayListIssueCodeV1 =
  | "production-binding-forbidden"
  | "layout-not-accepted"
  | "layout-unit-policy-mismatch"
  | "invalid-projection-id"
  | "invalid-origin"
  | "invalid-line-geometry"
  | "invalid-fragment-geometry"
  | "fingerprint-mismatch"
  | "unsafe-layout-arithmetic"

export interface VNextTextBlockMultiRunDisplayListIssueV1 {
  code: VNextTextBlockMultiRunDisplayListIssueCodeV1
  severity: "error"
  path: string
  message: string
  lineIndex?: number
  fragmentId?: string
}

export interface VNextTextBlockMultiRunDisplayListOriginV1 {
  xLayoutUnit: number
  yLayoutUnit: number
}

export interface VNextTextBlockMultiRunFragmentPaintStyleV1 {
  styleKey: string
  fontFaceId: string
  fontFamily: string
  fontSha256: string
  fontWeight: number
  fontStyle: "normal" | "italic"
  fontSizeLayoutUnit: number
  textColor: string
}

export interface VNextTextBlockMultiRunFragmentPaintCommandV1 {
  id: string
  kind: "text-fragment"
  paintOrder: number
  textBlockId: string
  layoutId: string
  layoutFingerprint: string
  lineIndex: number
  lineFingerprint: string
  fragmentId: string
  fragmentFingerprint: string
  shapingRunId: string
  renderStartOffset: number
  renderEndOffset: number
  text: string
  lineBounds: {
    xLayoutUnit: number
    yLayoutUnit: number
    widthLayoutUnit: number
    heightLayoutUnit: number
  }
  metricBounds: {
    xLayoutUnit: number
    yLayoutUnit: number
    widthLayoutUnit: number
    heightLayoutUnit: number
  }
  baselineXLayoutUnit: number
  baselineYLayoutUnit: number
  advanceLayoutUnit: number
  ascentLayoutUnit: number
  descentLayoutUnit: number
  lineGapLayoutUnit: number
  baselineShiftLayoutUnit: 0
  style: VNextTextBlockMultiRunFragmentPaintStyleV1
  sourceSegments: VNextTextBlockMultiRunSourceSegmentV1[]
}

export interface VNextTextBlockMultiRunDisplayLineV1 {
  lineIndex: number
  lineFingerprint: string
  renderStartOffset: number
  renderEndOffset: number
  text: string
  bounds: {
    xLayoutUnit: number
    yLayoutUnit: number
    widthLayoutUnit: number
    heightLayoutUnit: number
  }
  baselineYLayoutUnit: number
  commandIds: string[]
  sourceSegments: VNextTextBlockMultiRunSourceSegmentV1[]
}

interface VNextTextBlockMultiRunDisplayListFactsV1 {
  source: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_DISPLAY_LIST_V1_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_MULTI_RUN_DISPLAY_LIST_V1_VERSION
  projectionId: string
  layoutId: string
  textBlockId: string
  layoutFingerprint: string | null
  layoutUnitPolicyFingerprint: string
  contracts: {
    consumes: "vnext-text-block-multi-run-layout-v1"
    geometryUnit: "micro-point-integer"
    positionsAndBaselines: "core-accepted-positioned-fragments"
    rendererConversion: "divide-once-at-paint-boundary"
    rendererMayMeasureText: false
    rendererMayRelayout: false
    glyphRasterization: "renderer-owned"
    artifactBytes: false
    productionBinding: false
  }
}

export type VNextTextBlockMultiRunDisplayListResultV1 =
  | (VNextTextBlockMultiRunDisplayListFactsV1 & {
      status: "ready"
      origin: VNextTextBlockMultiRunDisplayListOriginV1
      lines: VNextTextBlockMultiRunDisplayLineV1[]
      commands: VNextTextBlockMultiRunFragmentPaintCommandV1[]
      fingerprint: string
      issues: []
      summary: {
        lineCount: number
        commandCount: number
        nonBlankCommandCount: number
        widthLayoutUnit: number
        heightLayoutUnit: number
      }
    })
  | (VNextTextBlockMultiRunDisplayListFactsV1 & {
      status: "blocked"
      origin: null
      lines: null
      commands: null
      fingerprint: null
      issues: VNextTextBlockMultiRunDisplayListIssueV1[]
      summary: null
    })

export interface VNextTextBlockMultiRunDisplayListRequestV1 {
  projectionId: string
  layout: VNextTextBlockMultiRunLayoutResultV1
  origin: VNextTextBlockMultiRunDisplayListOriginV1
  bindProductionRenderer?: boolean
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(
  code: VNextTextBlockMultiRunDisplayListIssueCodeV1,
  path: string,
  message: string,
  details: Pick<VNextTextBlockMultiRunDisplayListIssueV1, "lineIndex" | "fragmentId"> = {},
): VNextTextBlockMultiRunDisplayListIssueV1 {
  return { code, severity: "error", path, message, ...details }
}

function facts(input: VNextTextBlockMultiRunDisplayListRequestV1): VNextTextBlockMultiRunDisplayListFactsV1 {
  return {
    source: VNEXT_TEXT_BLOCK_MULTI_RUN_DISPLAY_LIST_V1_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_MULTI_RUN_DISPLAY_LIST_V1_VERSION,
    projectionId: input.projectionId,
    layoutId: input.layout.layoutId,
    textBlockId: input.layout.textBlockId,
    layoutFingerprint: input.layout.fingerprint,
    layoutUnitPolicyFingerprint: input.layout.layoutUnitPolicyFingerprint,
    contracts: {
      consumes: "vnext-text-block-multi-run-layout-v1",
      geometryUnit: "micro-point-integer",
      positionsAndBaselines: "core-accepted-positioned-fragments",
      rendererConversion: "divide-once-at-paint-boundary",
      rendererMayMeasureText: false,
      rendererMayRelayout: false,
      glyphRasterization: "renderer-owned",
      artifactBytes: false,
      productionBinding: false,
    },
  }
}

function safeSum(values: readonly number[]): number | null {
  let sum = 0
  for (const value of values) {
    sum += value
    if (!Number.isSafeInteger(sum)) return null
  }
  return sum
}

function fingerprintWithoutFingerprint(value: { fingerprint: string }): string {
  const { fingerprint: _fingerprint, ...payload } = value
  return createVNextCompactFingerprint(JSON.stringify(payload))
}

function validateSourceSegments(
  segments: readonly VNextTextBlockMultiRunSourceSegmentV1[],
  fragment: VNextTextBlockPositionedFragmentV1,
): boolean {
  let expectedOffset = fragment.renderStartOffset
  for (const segment of segments) {
    if (
      segment.inlineId.trim().length === 0
      || segment.renderStartOffset !== expectedOffset
      || segment.renderEndOffset <= segment.renderStartOffset
      || segment.renderEndOffset > fragment.renderEndOffset
      || segment.sourceStartOffset < 0
      || segment.sourceEndOffset <= segment.sourceStartOffset
      || segment.renderedText !== fragment.text.slice(
        segment.renderStartOffset - fragment.renderStartOffset,
        segment.renderEndOffset - fragment.renderStartOffset,
      )
      || (segment.kind === "resolved-field" && (segment.fieldKey == null || segment.fieldKey.trim().length === 0))
    ) return false
    expectedOffset = segment.renderEndOffset
  }
  return segments.length > 0 && expectedOffset === fragment.renderEndOffset
}

function validateFragment(
  fragment: VNextTextBlockPositionedFragmentV1,
  line: VNextTextBlockPositionedLineV1,
  expectedXLayoutUnit: number,
  path: string,
): VNextTextBlockMultiRunDisplayListIssueV1[] {
  const details = { lineIndex: line.index, fragmentId: fragment.fragmentId }
  const issues: VNextTextBlockMultiRunDisplayListIssueV1[] = []
  const metricHeight = safeSum([fragment.ascentLayoutUnit, fragment.descentLayoutUnit])
  if (
    fragment.fragmentId.trim().length === 0
    || fragment.shapingRunId.trim().length === 0
    || fragment.renderStartOffset < line.renderStartOffset
    || fragment.renderEndOffset > line.renderEndOffset
    || fragment.renderEndOffset <= fragment.renderStartOffset
    || fragment.text.length !== fragment.renderEndOffset - fragment.renderStartOffset
    || fragment.xLayoutUnit !== expectedXLayoutUnit
    || !VNextNonNegativeLayoutUnitV1Schema.safeParse(fragment.advanceLayoutUnit).success
    || fragment.baselineShiftLayoutUnit !== 0
    || !VNextPositiveLayoutUnitV1Schema.safeParse(fragment.fontSizeLayoutUnit).success
    || !VNextPositiveLayoutUnitV1Schema.safeParse(fragment.ascentLayoutUnit).success
    || !VNextNonNegativeLayoutUnitV1Schema.safeParse(fragment.descentLayoutUnit).success
    || !VNextNonNegativeLayoutUnitV1Schema.safeParse(fragment.lineGapLayoutUnit).success
    || metricHeight == null
    || metricHeight > line.heightLayoutUnit
    || fragment.styleKey.trim().length === 0
    || fragment.fontFaceId.trim().length === 0
    || fragment.fontFamily.trim().length === 0
    || !/^[a-f0-9]{64}$/u.test(fragment.fontSha256)
    || !Number.isSafeInteger(fragment.fontWeight)
    || fragment.fontWeight < 100
    || fragment.fontWeight > 900
    || !/^[0-9A-Fa-f]{6}$/u.test(fragment.textColor)
    || !validateSourceSegments(fragment.sourceSegments, fragment)
  ) issues.push(issue(
    "invalid-fragment-geometry",
    path,
    "Fragments must retain accepted ordered geometry, source coverage, metrics, and pinned paint style.",
    details,
  ))
  if (fingerprintWithoutFingerprint(fragment) !== fragment.fingerprint) issues.push(issue(
    "fingerprint-mismatch",
    `${path}.fingerprint`,
    "Fragment facts no longer match the Core-accepted fingerprint.",
    details,
  ))
  return issues
}

function validateLine(
  line: VNextTextBlockPositionedLineV1,
  lineIndex: number,
  expectedYLayoutUnit: number,
): VNextTextBlockMultiRunDisplayListIssueV1[] {
  const path = `layout.lines[${lineIndex}]`
  const issues: VNextTextBlockMultiRunDisplayListIssueV1[] = []
  const naturalHeight = safeSum([line.naturalAscentLayoutUnit, line.naturalDescentLayoutUnit])
  const leading = safeSum([line.leadingBeforeLayoutUnit, line.leadingAfterLayoutUnit])
  const baseline = safeSum([line.leadingBeforeLayoutUnit, line.naturalAscentLayoutUnit])
  if (
    line.index !== lineIndex
    || line.renderEndOffset <= line.renderStartOffset
    || line.text.length !== line.renderEndOffset - line.renderStartOffset
    || line.yOffsetLayoutUnit !== expectedYLayoutUnit
    || !VNextNonNegativeLayoutUnitV1Schema.safeParse(line.widthLayoutUnit).success
    || !VNextPositiveLayoutUnitV1Schema.safeParse(line.naturalAscentLayoutUnit).success
    || !VNextNonNegativeLayoutUnitV1Schema.safeParse(line.naturalDescentLayoutUnit).success
    || !VNextPositiveLayoutUnitV1Schema.safeParse(line.naturalHeightLayoutUnit).success
    || !VNextNonNegativeLayoutUnitV1Schema.safeParse(line.leadingBeforeLayoutUnit).success
    || !VNextNonNegativeLayoutUnitV1Schema.safeParse(line.leadingAfterLayoutUnit).success
    || !VNextPositiveLayoutUnitV1Schema.safeParse(line.heightLayoutUnit).success
    || naturalHeight !== line.naturalHeightLayoutUnit
    || leading == null
    || safeSum([line.naturalHeightLayoutUnit, leading]) !== line.heightLayoutUnit
    || baseline !== line.baselineOffsetLayoutUnit
    || line.baselineOffsetLayoutUnit > line.heightLayoutUnit
  ) issues.push(issue(
    "invalid-line-geometry",
    path,
    "Lines must retain accepted stacked geometry and shared-baseline facts.",
    { lineIndex },
  ))

  let expectedXLayoutUnit = 0
  let previousRenderEndOffset = line.renderStartOffset
  line.fragments.forEach((fragment, fragmentIndex) => {
    if (fragment.renderStartOffset < previousRenderEndOffset) issues.push(issue(
      "invalid-fragment-geometry",
      `${path}.fragments[${fragmentIndex}].renderStartOffset`,
      "Paint fragments must retain non-overlapping source order.",
      { lineIndex, fragmentId: fragment.fragmentId },
    ))
    issues.push(...validateFragment(
      fragment,
      line,
      expectedXLayoutUnit,
      `${path}.fragments[${fragmentIndex}]`,
    ))
    const nextX = safeSum([expectedXLayoutUnit, fragment.advanceLayoutUnit])
    if (nextX == null) issues.push(issue(
      "unsafe-layout-arithmetic",
      `${path}.fragments[${fragmentIndex}].advanceLayoutUnit`,
      "Fragment advances exceed the signed safe-integer layout range.",
      { lineIndex, fragmentId: fragment.fragmentId },
    ))
    else expectedXLayoutUnit = nextX
    previousRenderEndOffset = fragment.renderEndOffset
  })
  if (expectedXLayoutUnit !== line.widthLayoutUnit) issues.push(issue(
    "invalid-line-geometry",
    `${path}.widthLayoutUnit`,
    "Line width must equal the sum of its positioned fragment advances.",
    { lineIndex },
  ))
  if (fingerprintWithoutFingerprint(line) !== line.fingerprint) issues.push(issue(
    "fingerprint-mismatch",
    `${path}.fingerprint`,
    "Line facts no longer match the Core-accepted fingerprint.",
    { lineIndex },
  ))
  return issues
}

export function projectVNextTextBlockMultiRunDisplayListV1(
  input: VNextTextBlockMultiRunDisplayListRequestV1,
): VNextTextBlockMultiRunDisplayListResultV1 {
  const base = facts(input)
  const issues: VNextTextBlockMultiRunDisplayListIssueV1[] = []
  if (input.bindProductionRenderer === true) issues.push(issue(
    "production-binding-forbidden",
    "bindProductionRenderer",
    "The bounded MR1 display list cannot bind a production renderer.",
  ))
  if (input.layout.status !== "accepted") issues.push(issue(
    "layout-not-accepted",
    "layout.status",
    "MR1 display-list projection requires a Core-accepted positioned layout.",
  ))
  if (input.projectionId.trim().length === 0) issues.push(issue(
    "invalid-projection-id",
    "projectionId",
    "Display-list projection id must not be blank.",
  ))
  if (
    !VNextLayoutUnitV1Schema.safeParse(input.origin.xLayoutUnit).success
    || !VNextLayoutUnitV1Schema.safeParse(input.origin.yLayoutUnit).success
  ) issues.push(issue(
    "invalid-origin",
    "origin",
    "Display-list origin coordinates must be signed safe-integer layout units.",
  ))
  if (input.layout.layoutUnitPolicyFingerprint !== createVNextLayoutUnitPolicyV1().fingerprint) issues.push(issue(
    "layout-unit-policy-mismatch",
    "layout.layoutUnitPolicyFingerprint",
    "The accepted layout must use the current fixed-point layout-unit policy.",
  ))

  if (input.layout.status === "accepted") {
    if (input.layout.lines.length === 0 || !/^sha256:[a-f0-9]{64}$/u.test(input.layout.fingerprint)) issues.push(issue(
      "invalid-line-geometry",
      "layout.lines",
      "An accepted MR1 display list requires at least one positioned line and a valid layout fingerprint.",
    ))
    let expectedYLayoutUnit = 0
    input.layout.lines.forEach((line, lineIndex) => {
      issues.push(...validateLine(line, lineIndex, expectedYLayoutUnit))
      const absoluteLineY = safeSum([input.origin.yLayoutUnit, line.yOffsetLayoutUnit])
      const absoluteBaselineY = absoluteLineY == null
        ? null
        : safeSum([absoluteLineY, line.baselineOffsetLayoutUnit])
      const absoluteLineBottom = absoluteLineY == null
        ? null
        : safeSum([absoluteLineY, line.heightLayoutUnit])
      const absoluteLineRight = safeSum([input.origin.xLayoutUnit, line.widthLayoutUnit])
      if (
        absoluteLineY == null
        || absoluteBaselineY == null
        || absoluteLineBottom == null
        || absoluteLineRight == null
      ) issues.push(issue(
        "unsafe-layout-arithmetic",
        `layout.lines[${lineIndex}]`,
        "Applying the display-list origin must retain safe line coordinates.",
        { lineIndex },
      ))
      line.fragments.forEach((fragment, fragmentIndex) => {
        const absoluteX = safeSum([input.origin.xLayoutUnit, fragment.xLayoutUnit])
        const absoluteRight = absoluteX == null ? null : safeSum([absoluteX, fragment.advanceLayoutUnit])
        const metricY = absoluteBaselineY == null
          ? null
          : safeSum([absoluteBaselineY, fragment.baselineShiftLayoutUnit, -fragment.ascentLayoutUnit])
        const metricBottom = absoluteBaselineY == null
          ? null
          : safeSum([absoluteBaselineY, fragment.baselineShiftLayoutUnit, fragment.descentLayoutUnit])
        if (absoluteX == null || absoluteRight == null || metricY == null || metricBottom == null) issues.push(issue(
          "unsafe-layout-arithmetic",
          `layout.lines[${lineIndex}].fragments[${fragmentIndex}]`,
          "Applying the display-list origin must retain safe fragment and metric coordinates.",
          { lineIndex, fragmentId: fragment.fragmentId },
        ))
      })
      const nextY = safeSum([expectedYLayoutUnit, line.heightLayoutUnit])
      if (nextY == null) issues.push(issue(
        "unsafe-layout-arithmetic",
        `layout.lines[${lineIndex}].heightLayoutUnit`,
        "Line stacking exceeds the signed safe-integer layout range.",
        { lineIndex },
      ))
      else expectedYLayoutUnit = nextY
    })
  }

  if (issues.length > 0 || input.layout.status !== "accepted") return {
    ...base,
    status: "blocked",
    origin: null,
    lines: null,
    commands: null,
    fingerprint: null,
    issues,
    summary: null,
  }

  const acceptedLayout = input.layout
  let paintOrder = 0
  const commands: VNextTextBlockMultiRunFragmentPaintCommandV1[] = []
  const lines = acceptedLayout.lines.map((line): VNextTextBlockMultiRunDisplayLineV1 => {
    const lineX = input.origin.xLayoutUnit
    const lineY = safeSum([input.origin.yLayoutUnit, line.yOffsetLayoutUnit])!
    const baselineY = safeSum([lineY, line.baselineOffsetLayoutUnit])!
    const commandIds: string[] = []
    line.fragments.forEach((fragment) => {
      const baselineX = safeSum([lineX, fragment.xLayoutUnit])!
      const commandBaselineY = safeSum([baselineY, fragment.baselineShiftLayoutUnit])!
      const metricY = safeSum([commandBaselineY, -fragment.ascentLayoutUnit])!
      const metricHeight = safeSum([fragment.ascentLayoutUnit, fragment.descentLayoutUnit])!
      const command: VNextTextBlockMultiRunFragmentPaintCommandV1 = {
        id: `paint:${fragment.fragmentId}`,
        kind: "text-fragment",
        paintOrder: paintOrder++,
        textBlockId: acceptedLayout.textBlockId,
        layoutId: acceptedLayout.layoutId,
        layoutFingerprint: acceptedLayout.fingerprint,
        lineIndex: line.index,
        lineFingerprint: line.fingerprint,
        fragmentId: fragment.fragmentId,
        fragmentFingerprint: fragment.fingerprint,
        shapingRunId: fragment.shapingRunId,
        renderStartOffset: fragment.renderStartOffset,
        renderEndOffset: fragment.renderEndOffset,
        text: fragment.text,
        lineBounds: {
          xLayoutUnit: baselineX,
          yLayoutUnit: lineY,
          widthLayoutUnit: fragment.advanceLayoutUnit,
          heightLayoutUnit: line.heightLayoutUnit,
        },
        metricBounds: {
          xLayoutUnit: baselineX,
          yLayoutUnit: metricY,
          widthLayoutUnit: fragment.advanceLayoutUnit,
          heightLayoutUnit: metricHeight,
        },
        baselineXLayoutUnit: baselineX,
        baselineYLayoutUnit: commandBaselineY,
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
      lineIndex: line.index,
      lineFingerprint: line.fingerprint,
      renderStartOffset: line.renderStartOffset,
      renderEndOffset: line.renderEndOffset,
      text: line.text,
      bounds: {
        xLayoutUnit: lineX,
        yLayoutUnit: lineY,
        widthLayoutUnit: line.widthLayoutUnit,
        heightLayoutUnit: line.heightLayoutUnit,
      },
      baselineYLayoutUnit: baselineY,
      commandIds,
      sourceSegments: clone(line.sourceSegments),
    }
  })
  const fingerprint = createVNextCompactFingerprint(JSON.stringify({
    ...base,
    origin: input.origin,
    lines,
    commands,
  }))
  return {
    ...base,
    status: "ready",
    origin: clone(input.origin),
    lines,
    commands,
    fingerprint,
    issues: [],
    summary: {
      lineCount: lines.length,
      commandCount: commands.length,
      nonBlankCommandCount: commands.filter((command) => command.text.trim().length > 0).length,
      widthLayoutUnit: lines.reduce((maximum, line) => Math.max(maximum, line.bounds.widthLayoutUnit), 0),
      heightLayoutUnit: lines.reduce((sum, line) => sum + line.bounds.heightLayoutUnit, 0),
    },
  }
}
