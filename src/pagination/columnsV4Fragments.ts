import type {
  VNextTextBlockV4MeasuredLinesResult,
  VNextTextBlockV4MeasurementSourcePoint,
} from "./textBlockV4Measurement.js"
import type { VNextColumnsV4Issue } from "./columnsV4Contract.js"

export const VNEXT_COLUMNS_V4_FRAGMENT_SOURCE = "vnext-columns-v4-fragments"
export const VNEXT_COLUMNS_V4_FRAGMENT_VERSION = 1 as const

export type VNextColumnsV4KeepPolicy = "allow-split" | "prefer-together"

export interface VNextColumnsV4FragmentCandidate {
  fragmentId: string
  nodeId: string
  fragmentIndex: number
  sourceKind: "text-line"
  heightPt: number
  breakAfter: true
  sourceStart: VNextTextBlockV4MeasurementSourcePoint
  sourceEnd: VNextTextBlockV4MeasurementSourcePoint
}

export interface VNextColumnsV4ChildFragmentSource {
  source: typeof VNEXT_COLUMNS_V4_FRAGMENT_SOURCE
  version: typeof VNEXT_COLUMNS_V4_FRAGMENT_VERSION
  kind: "text-block-lines"
  nodeId: string
  keepPolicy: VNextColumnsV4KeepPolicy
  candidates: VNextColumnsV4FragmentCandidate[]
  prefixHeightsPt: number[]
  totalHeightPt: number
  fingerprint: string
}

export type VNextColumnsV4ChildFragmentSourceResult =
  | { status: "ready"; fragmentSource: VNextColumnsV4ChildFragmentSource; issues: [] }
  | { status: "blocked"; fragmentSource: null; issues: VNextColumnsV4Issue[] }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(code: string, path: string, message: string): VNextColumnsV4Issue {
  return { code, path, message, severity: "error" }
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

export function createVNextColumnsV4TextFragmentSource(
  measured: VNextTextBlockV4MeasuredLinesResult,
  options: { keepPolicy?: VNextColumnsV4KeepPolicy } = {},
): VNextColumnsV4ChildFragmentSourceResult {
  if (measured.status !== "accepted") {
    return {
      status: "blocked",
      fragmentSource: null,
      issues: [issue(
        "text-lines-not-accepted",
        "measured.status",
        `text-block "${measured.textBlockId}" requires accepted measured lines`,
      )],
    }
  }
  const issues: VNextColumnsV4Issue[] = []
  measured.lines.forEach((line, index) => {
    if (!Number.isFinite(line.heightPt) || line.heightPt < 0) issues.push(issue(
      "invalid-fragment-height",
      `measured.lines[${index}].heightPt`,
      `measured line ${line.index} height must be finite and non-negative`,
    ))
  })
  if (issues.length > 0) return { status: "blocked", fragmentSource: null, issues }

  let totalHeightPt = 0
  const prefixHeightsPt = [0]
  const candidates = measured.lines.map((line, fragmentIndex): VNextColumnsV4FragmentCandidate => {
    totalHeightPt = roundPt(totalHeightPt + line.heightPt)
    prefixHeightsPt.push(totalHeightPt)
    return {
      fragmentId: `${measured.textBlockId}:line-${line.index}`,
      nodeId: measured.textBlockId,
      fragmentIndex,
      sourceKind: "text-line",
      heightPt: roundPt(line.heightPt),
      breakAfter: true,
      sourceStart: clone(line.sourceStart),
      sourceEnd: clone(line.sourceEnd),
    }
  })
  const fingerprint = [
    measured.textBlockId,
    options.keepPolicy ?? "allow-split",
    ...candidates.flatMap((candidate) => [
      candidate.fragmentId,
      candidate.heightPt,
      candidate.sourceStart.inlineId ?? "empty",
      candidate.sourceStart.authoredOffset,
      candidate.sourceEnd.inlineId ?? "empty",
      candidate.sourceEnd.authoredOffset,
    ]),
  ].join(":")

  return {
    status: "ready",
    fragmentSource: {
      source: VNEXT_COLUMNS_V4_FRAGMENT_SOURCE,
      version: VNEXT_COLUMNS_V4_FRAGMENT_VERSION,
      kind: "text-block-lines",
      nodeId: measured.textBlockId,
      keepPolicy: options.keepPolicy ?? "allow-split",
      candidates,
      prefixHeightsPt,
      totalHeightPt,
      fingerprint,
    },
    issues: [],
  }
}
