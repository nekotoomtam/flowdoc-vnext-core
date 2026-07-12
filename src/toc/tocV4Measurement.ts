import type { VNextTextMeasurement, VNextTextMeasurementCache, VNextTextMeasurer } from "../pagination/textMeasurement.js"
import { measureVNextText } from "../pagination/textMeasurement.js"
import type { VNextTocV4GeneratedEntry, VNextTocV4SemanticResult } from "./tocV4Semantic.js"

export const VNEXT_TOC_V4_MEASUREMENT_SOURCE = "vnext-toc-v4-measurement"
export const VNEXT_TOC_V4_MEASUREMENT_VERSION = 1 as const

type LevelKey = "1" | "2" | "3" | "4" | "5" | "6"
type AcceptedSemantic = Extract<VNextTocV4SemanticResult, { status: "ready" | "partial" }>

export interface VNextTocV4MeasurementSpec {
  availableWidthPt: number
  availableHeightPt: number
  measurementProfileId: string
  titleStyleKey: string
  entryStyleKeyByLevel: Record<LevelKey, string>
  indentPtByLevel: Record<LevelKey, number>
  pageNumberStyleKey: string
  pageNumberColumnWidthPt: number
  pageNumberCapacityDigits: number
  labelToLeaderGapPt: number
  minimumLeaderWidthPt: number
  leaderToPageNumberGapPt: number
  titleGapAfterPt: number
  rowGapPt: number
  maximumEntryCount: number
  maximumMeasuredLineCount: number
}

export interface VNextTocV4MeasuredRow {
  identity: VNextTocV4GeneratedEntry["identity"]
  headingNodeId: string
  level: VNextTocV4GeneratedEntry["level"]
  sourceOrdinal: number
  tocOrdinal: number
  breakPolicy: "keep-together"
  xPt: 0
  yPt: number
  widthPt: number
  heightPt: number
  indentPt: number
  label: {
    text: string
    xPt: number
    yPt: number
    widthPt: number
    heightPt: number
    styleKey: string
    lines: VNextTextMeasurement["lineBoxes"]
  }
  leader: { xStartPt: number; xEndPt: number; yPt: number; widthPt: number }
  pageNumber: {
    status: "reserved"
    sample: string
    capacityDigits: number
    xPt: number
    yPt: number
    widthPt: number
    heightPt: number
    styleKey: string
    align: "right"
  }
}

export type VNextTocV4MeasurementResult =
  | {
      source: typeof VNEXT_TOC_V4_MEASUREMENT_SOURCE
      contractVersion: typeof VNEXT_TOC_V4_MEASUREMENT_VERSION
      status: "measured"
      documentId: string
      tocNodeId: string
      semanticFingerprint: string
      tocSemanticFingerprint: string
      spec: VNextTocV4MeasurementSpec
      title: null | {
        text: string
        xPt: 0
        yPt: 0
        widthPt: number
        heightPt: number
        styleKey: string
        lines: VNextTextMeasurement["lineBoxes"]
        breakPolicy: "keep-with-first-entry"
      }
      rows: VNextTocV4MeasuredRow[]
      pageNumberProof: { sample: string; capacityDigits: number; lineCount: 1; widthPt: number; columnWidthPt: number }
      summary: {
        entryCount: number
        measuredLineCount: number
        totalHeightPt: number
        minimumFirstFragmentHeightPt: number
        fit: "fits" | "split-required" | "forced-row-overflow"
        forcedOverflowHeadingNodeIds: string[]
      }
      work: { textMeasurementCount: number; cacheHitCount: number; cacheMissCount: number; uncachedCount: number }
      contracts: { pagination: "not-run"; rendering: "not-run"; persistence: "not-run"; editorStateMutation: false }
      fingerprint: string
      issues: Array<{ code: "title-without-entries"; severity: "warning"; path: string; message: string }>
    }
  | {
      source: typeof VNEXT_TOC_V4_MEASUREMENT_SOURCE
      contractVersion: typeof VNEXT_TOC_V4_MEASUREMENT_VERSION
      status: "blocked"
      tocNodeId: string
      layout: null
      issues: Array<{ code: string; severity: "error"; path: string; message: string }>
    }

function error(code: string, path: string, message: string) {
  return { code, severity: "error" as const, path, message }
}

function finitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

function finiteNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

function blocked(tocNodeId: string, issues: ReturnType<typeof error>[]): VNextTocV4MeasurementResult {
  return {
    source: VNEXT_TOC_V4_MEASUREMENT_SOURCE,
    contractVersion: VNEXT_TOC_V4_MEASUREMENT_VERSION,
    status: "blocked", tocNodeId, layout: null, issues,
  }
}

function rounded(value: number): number {
  return Number(value.toFixed(2))
}

function validMeasurement(measurement: VNextTextMeasurement): boolean {
  return finiteNonNegative(measurement.widthPt)
    && finitePositive(measurement.heightPt)
    && finitePositive(measurement.lineHeightPt)
    && measurement.lineBoxes.length > 0
    && measurement.lineBoxes.every((line) => (
      finiteNonNegative(line.widthPt) && finitePositive(line.heightPt)
    ))
}

export function measureVNextTocV4(input: {
  semantic: VNextTocV4SemanticResult
  tocNodeId: string
  spec: VNextTocV4MeasurementSpec
  textMeasurer: VNextTextMeasurer
  measurementCache?: VNextTextMeasurementCache
}): VNextTocV4MeasurementResult {
  const issues: ReturnType<typeof error>[] = []
  if (input.semantic.status === "blocked") issues.push(error(
    "semantic-plan-blocked", "semantic", "TOC measurement requires a ready or partial semantic plan",
  ))
  const spec = input.spec
  ;(["availableWidthPt", "availableHeightPt", "pageNumberColumnWidthPt"] as const).forEach((key) => {
    if (!finitePositive(spec[key])) issues.push(error("invalid-positive-geometry", `spec.${key}`, `${key} must be positive finite points`))
  })
  ;(["labelToLeaderGapPt", "minimumLeaderWidthPt", "leaderToPageNumberGapPt", "titleGapAfterPt", "rowGapPt"] as const)
    .forEach((key) => {
      if (!finiteNonNegative(spec[key])) issues.push(error("invalid-nonnegative-geometry", `spec.${key}`, `${key} must be non-negative finite points`))
    })
  if (!Number.isInteger(spec.pageNumberCapacityDigits) || spec.pageNumberCapacityDigits < 1) issues.push(error(
    "invalid-page-number-capacity", "spec.pageNumberCapacityDigits", "page-number digit capacity must be a positive integer",
  ))
  ;(["maximumEntryCount", "maximumMeasuredLineCount"] as const).forEach((key) => {
    if (!Number.isInteger(spec[key]) || spec[key] < 1) issues.push(error("invalid-execution-budget", `spec.${key}`, `${key} must be a positive integer`))
  })
  ;(["measurementProfileId", "titleStyleKey", "pageNumberStyleKey"] as const).forEach((key) => {
    if (spec[key].trim().length === 0) issues.push(error("missing-measurement-key", `spec.${key}`, `${key} must not be blank`))
  })
  const levels: LevelKey[] = ["1", "2", "3", "4", "5", "6"]
  levels.forEach((level) => {
    if (spec.entryStyleKeyByLevel[level]?.trim().length === 0) issues.push(error(
      "missing-entry-style", `spec.entryStyleKeyByLevel.${level}`, `entry style for level ${level} must not be blank`,
    ))
    if (!finiteNonNegative(spec.indentPtByLevel[level])) issues.push(error(
      "invalid-level-indent", `spec.indentPtByLevel.${level}`, `indent for level ${level} must be non-negative finite points`,
    ))
  })
  if (issues.length > 0 || input.semantic.status === "blocked") return blocked(input.tocNodeId, issues)
  const semantic: AcceptedSemantic = input.semantic
  const toc = semantic.tocs.find((item) => item.tocNodeId === input.tocNodeId)
  if (toc == null) return blocked(input.tocNodeId, [error("toc-not-found", "tocNodeId", `TOC "${input.tocNodeId}" is missing from semantic plan`)])
  if (toc.entries.length > spec.maximumEntryCount) return blocked(input.tocNodeId, [error(
    "entry-budget-exceeded", "spec.maximumEntryCount", `TOC has ${toc.entries.length} entries but budget is ${spec.maximumEntryCount}`,
  )])

  let textMeasurementCount = 0
  let cacheHitCount = 0
  let cacheMissCount = 0
  let uncachedCount = 0
  const measure = (nodeId: string, sectionId: string, text: string, widthPt: number, styleKey: string) => {
    const result = measureVNextText({
      documentId: semantic.documentId, sectionId, nodeId, text,
      availableWidthPt: widthPt, styleKey, measurementProfileId: spec.measurementProfileId,
    }, input.textMeasurer, input.measurementCache)
    textMeasurementCount += 1
    if (result.cacheStatus === "hit") cacheHitCount += 1
    else if (result.cacheStatus === "miss") cacheMissCount += 1
    else uncachedCount += 1
    return result
  }
  const sample = "8".repeat(spec.pageNumberCapacityDigits)
  const pageNumberMeasurement = measure(
    JSON.stringify(["toc-page-number", toc.tocNodeId]), toc.sectionId, sample,
    spec.pageNumberColumnWidthPt, spec.pageNumberStyleKey,
  )
  if (!validMeasurement(pageNumberMeasurement) || pageNumberMeasurement.lineBoxes.length !== 1) return blocked(input.tocNodeId, [error(
    "page-number-capacity-overflow", "spec.pageNumberColumnWidthPt",
    `page-number sample "${sample}" must measure as exactly one valid line inside the fixed column`,
  )])

  const titleText = toc.title?.trim() ?? ""
  const titleMeasurement = titleText.length === 0 ? null : measure(
    JSON.stringify(["toc-title", toc.tocNodeId]), toc.sectionId, titleText,
    spec.availableWidthPt, spec.titleStyleKey,
  )
  if (titleMeasurement != null && !validMeasurement(titleMeasurement)) return blocked(input.tocNodeId, [error(
    "invalid-title-measurement", "title", "text measurer returned invalid title geometry",
  )])
  const title = titleMeasurement == null ? null : {
    text: titleText, xPt: 0 as const, yPt: 0 as const, widthPt: spec.availableWidthPt,
    heightPt: rounded(titleMeasurement.heightPt), styleKey: spec.titleStyleKey,
    lines: titleMeasurement.lineBoxes, breakPolicy: "keep-with-first-entry" as const,
  }
  let yPt = title?.heightPt ?? 0
  if (title != null && toc.entries.length > 0) yPt += spec.titleGapAfterPt
  const rows: VNextTocV4MeasuredRow[] = []
  for (const entry of toc.entries) {
    const level = String(entry.level) as LevelKey
    const indentPt = spec.indentPtByLevel[level]
    const labelWidthPt = spec.availableWidthPt - indentPt - spec.pageNumberColumnWidthPt
      - spec.labelToLeaderGapPt - spec.minimumLeaderWidthPt - spec.leaderToPageNumberGapPt
    if (!finitePositive(labelWidthPt)) return blocked(input.tocNodeId, [error(
      "label-width-impossible", `entries[${entry.tocOrdinal}]`, `entry level ${entry.level} leaves no positive label width`,
    )])
    const labelMeasurement = measure(
      JSON.stringify(["toc-entry", toc.tocNodeId, entry.headingNodeId]), entry.sectionId,
      entry.label.text, labelWidthPt, spec.entryStyleKeyByLevel[level],
    )
    if (!validMeasurement(labelMeasurement)) return blocked(input.tocNodeId, [error(
      "invalid-entry-measurement", `entries[${entry.tocOrdinal}]`, "text measurer returned invalid entry geometry",
    )])
    if (rows.length > 0) yPt += spec.rowGapPt
    const rowHeightPt = rounded(Math.max(labelMeasurement.heightPt, pageNumberMeasurement.heightPt))
    const numberX = spec.availableWidthPt - spec.pageNumberColumnWidthPt
    const lastLine = labelMeasurement.lineBoxes.at(-1)!
    const leaderStart = indentPt + Math.min(labelWidthPt, lastLine.widthPt) + spec.labelToLeaderGapPt
    const leaderEnd = numberX - spec.leaderToPageNumberGapPt
    rows.push({
      identity: entry.identity, headingNodeId: entry.headingNodeId, level: entry.level,
      sourceOrdinal: entry.sourceOrdinal, tocOrdinal: entry.tocOrdinal, breakPolicy: "keep-together",
      xPt: 0, yPt: rounded(yPt), widthPt: spec.availableWidthPt, heightPt: rowHeightPt, indentPt,
      label: {
        text: entry.label.text, xPt: indentPt, yPt: rounded(yPt), widthPt: rounded(labelWidthPt),
        heightPt: rounded(labelMeasurement.heightPt), styleKey: spec.entryStyleKeyByLevel[level],
        lines: labelMeasurement.lineBoxes,
      },
      leader: {
        xStartPt: rounded(leaderStart), xEndPt: rounded(leaderEnd),
        yPt: rounded(yPt + lastLine.yOffsetPt + lastLine.heightPt / 2), widthPt: rounded(leaderEnd - leaderStart),
      },
      pageNumber: {
        status: "reserved", sample, capacityDigits: spec.pageNumberCapacityDigits,
        xPt: rounded(numberX), yPt: rounded(yPt), widthPt: spec.pageNumberColumnWidthPt,
        heightPt: rounded(pageNumberMeasurement.heightPt), styleKey: spec.pageNumberStyleKey, align: "right",
      },
    })
    yPt += rowHeightPt
  }
  const measuredLineCount = (titleMeasurement?.lineBoxes.length ?? 0)
    + pageNumberMeasurement.lineBoxes.length
    + rows.reduce((total, row) => total + row.label.lines.length, 0)
  if (measuredLineCount > spec.maximumMeasuredLineCount) return blocked(input.tocNodeId, [error(
    "line-budget-exceeded", "spec.maximumMeasuredLineCount", `measurement produced ${measuredLineCount} lines but budget is ${spec.maximumMeasuredLineCount}`,
  )])
  const totalHeightPt = rounded(yPt)
  const forcedOverflowHeadingNodeIds = rows.filter((row) => row.heightPt > spec.availableHeightPt).map((row) => row.headingNodeId)
  const fit = forcedOverflowHeadingNodeIds.length > 0
    ? "forced-row-overflow" as const
    : totalHeightPt > spec.availableHeightPt ? "split-required" as const : "fits" as const
  const minimumFirstFragmentHeightPt = rounded((title?.heightPt ?? 0)
    + (title != null && rows.length > 0 ? spec.titleGapAfterPt : 0)
    + (rows[0]?.heightPt ?? 0))
  const warnings = title != null && rows.length === 0 ? [{
    code: "title-without-entries" as const, severity: "warning" as const, path: "title",
    message: "TOC title has no first entry to keep with",
  }] : []
  const fingerprintFacts = {
    documentId: semantic.documentId, tocNodeId: toc.tocNodeId,
    semanticFingerprint: semantic.fingerprint, tocSemanticFingerprint: toc.fingerprint,
    spec: JSON.parse(JSON.stringify(spec)) as VNextTocV4MeasurementSpec,
    title, rows,
    pageNumberProof: {
      sample, capacityDigits: spec.pageNumberCapacityDigits, lineCount: 1 as const,
      widthPt: rounded(pageNumberMeasurement.widthPt), columnWidthPt: spec.pageNumberColumnWidthPt,
    },
    summary: {
      entryCount: rows.length, measuredLineCount, totalHeightPt, minimumFirstFragmentHeightPt,
      fit, forcedOverflowHeadingNodeIds,
    },
    contracts: { pagination: "not-run" as const, rendering: "not-run" as const, persistence: "not-run" as const, editorStateMutation: false as const },
  }
  return {
    source: VNEXT_TOC_V4_MEASUREMENT_SOURCE,
    contractVersion: VNEXT_TOC_V4_MEASUREMENT_VERSION,
    status: "measured", ...fingerprintFacts,
    work: { textMeasurementCount, cacheHitCount, cacheMissCount, uncachedCount },
    fingerprint: JSON.stringify(fingerprintFacts), issues: warnings,
  }
}
