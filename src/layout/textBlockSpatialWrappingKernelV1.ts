import type {
  VNextTextBlockFlowIntervalV1,
  VNextTextBlockFlowRegionWorkV1,
} from "./textBlockFlowRegionProviderV1.js"
import type { VNextTextBlockSpatialBandV1 } from "./textBlockSpatialIndexContractV1.js"
import type { VNextTextBlockSpatialWrappingWorkV1 } from "./textBlockSpatialWrappingLayoutContractV1.js"

export type VNextTextBlockPlacementAtomKernelV1 =
  | {
      kind: "text-cluster"
      renderStartOffset: number
      renderEndOffset: number
      advanceLayoutUnit: number
      payloadIndex: number
    }
  | {
      kind: "inline-image"
      renderStartOffset: number
      renderEndOffset: number
      advanceLayoutUnit: number
      payloadIndex: number
    }
  | {
      kind: "hard-break"
      renderStartOffset: number
      renderEndOffset: number
      advanceLayoutUnit: 0
      payloadIndex: number
    }

export interface VNextTextBlockBreakGroupKernelV1 {
  renderStartOffset: number
  renderEndOffset: number
  atoms: readonly VNextTextBlockPlacementAtomKernelV1[]
  advanceLayoutUnit: number
  mandatoryBreak: boolean
}

interface VNextTextBlockBreakGroupProjectionIssueKernelV1 {
  code:
    | "invalid-flow-atom-coverage"
    | "invalid-break-offsets"
    | "break-boundary-inside-atom"
    | "unsafe-layout-arithmetic"
  message: string
}

export type VNextTextBlockBreakGroupProjectionKernelResultV1 =
  | {
      status: "accepted"
      groups: readonly VNextTextBlockBreakGroupKernelV1[]
      issues: []
    }
  | {
      status: "blocked"
      groups: null
      issues: readonly VNextTextBlockBreakGroupProjectionIssueKernelV1[]
    }

export interface VNextTextBlockPlacedAtomKernelV1 {
  atom: VNextTextBlockPlacementAtomKernelV1
  intervalIndex: number
  xStartLayoutUnit: number
  xEndLayoutUnit: number
}

interface VNextTextBlockPlacementIssueKernelV1 {
  code: "unsafe-layout-arithmetic" | "unbreakable-flow-item-overflow"
  message: string
}

export type VNextTextBlockPlacementKernelResultV1 =
  | {
      status: "accepted"
      placedAtoms: readonly VNextTextBlockPlacedAtomKernelV1[]
      nextGroupIndex: number
      consumedMandatoryBreak: boolean
      issues: []
    }
  | {
      status: "blocked"
      placedAtoms: null
      nextGroupIndex: null
      consumedMandatoryBreak: false
      issues: readonly VNextTextBlockPlacementIssueKernelV1[]
    }

export interface VNextTextBlockCandidatePlacementKernelV1 {
  lineIndex: number
  lineYLayoutUnit: number
  candidateBandHeightLayoutUnit: number
  intervals: readonly VNextTextBlockFlowIntervalV1[]
  placedAtoms: readonly VNextTextBlockPlacedAtomKernelV1[]
  nextGroupIndex: number
}

export type VNextTextBlockCandidateLineMetricsKernelResultV1 =
  | {
      status: "accepted"
      heightLayoutUnit: number
      baselineOffsetLayoutUnit: number
      payload: unknown
      issues: []
    }
  | {
      status: "blocked"
      heightLayoutUnit: null
      baselineOffsetLayoutUnit: null
      payload: null
      issues: readonly { code: string; message: string }[]
    }

export type VNextTextBlockFlowRegionKernelAdapterResultV1 =
  | {
      status: "accepted"
      intervals: readonly VNextTextBlockFlowIntervalV1[]
      nextYLayoutUnit: number | null
      regionFingerprint: string
      work: VNextTextBlockFlowRegionWorkV1
      issues: []
    }
  | {
      status: "blocked"
      intervals: null
      nextYLayoutUnit: null
      regionFingerprint: null
      work: null
      issues: readonly { code: string; message: string }[]
    }

export type VNextTextBlockSpatialWrappingKernelResultV1 =
  | {
      status: "accepted"
      lines: readonly {
        lineIndex: number
        lineYLayoutUnit: number
        heightLayoutUnit: number
        baselineOffsetLayoutUnit: number
        intervals: readonly VNextTextBlockFlowIntervalV1[]
        placedAtoms: readonly VNextTextBlockPlacedAtomKernelV1[]
        regionFingerprint: string
        metricPayload: unknown
      }[]
      work: VNextTextBlockSpatialWrappingWorkV1
      issues: []
    }
  | {
      status: "blocked"
      lines: null
      work: null
      issues: readonly { code: string; message: string; lineIndex?: number }[]
    }

function blockedProjection(
  code: VNextTextBlockBreakGroupProjectionIssueKernelV1["code"],
  message: string,
): VNextTextBlockBreakGroupProjectionKernelResultV1 {
  return { status: "blocked", groups: null, issues: [{ code, message }] }
}

function safeSum(values: readonly number[]): number | null {
  let result = 0
  for (const value of values) {
    if (!Number.isSafeInteger(value)) return null
    result += value
    if (!Number.isSafeInteger(result)) return null
  }
  return result
}

export function createVNextTextBlockBreakGroupsKernelV1(input: {
  atoms: readonly VNextTextBlockPlacementAtomKernelV1[]
  breakOffsets: readonly number[]
  renderedUtf16Length: number
}): VNextTextBlockBreakGroupProjectionKernelResultV1 {
  if (
    !Number.isSafeInteger(input.renderedUtf16Length)
    || input.renderedUtf16Length < 0
    || input.breakOffsets.length === 0
    || input.breakOffsets[0] !== 0
    || input.breakOffsets.at(-1) !== input.renderedUtf16Length
  ) return blockedProjection(
    "invalid-break-offsets",
    "break offsets must exactly cover rendered text",
  )
  for (let index = 0; index < input.breakOffsets.length; index += 1) {
    const offset = input.breakOffsets[index]!
    if (
      !Number.isSafeInteger(offset)
      || offset < 0
      || (index > 0 && offset <= input.breakOffsets[index - 1]!)
    ) return blockedProjection(
      "invalid-break-offsets",
      "break offsets must be strictly increasing safe integers",
    )
  }
  let expectedOffset = 0
  for (const atom of input.atoms) {
    if (
      !Number.isSafeInteger(atom.renderStartOffset)
      || !Number.isSafeInteger(atom.renderEndOffset)
      || atom.renderStartOffset !== expectedOffset
      || atom.renderEndOffset <= atom.renderStartOffset
      || !Number.isSafeInteger(atom.advanceLayoutUnit)
      || atom.advanceLayoutUnit < 0
      || !Number.isSafeInteger(atom.payloadIndex)
      || atom.payloadIndex < 0
      || (atom.kind === "hard-break" && atom.advanceLayoutUnit !== 0)
    ) return blockedProjection(
      "invalid-flow-atom-coverage",
      "placement atoms must be valid and cover rendered text contiguously",
    )
    expectedOffset = atom.renderEndOffset
  }
  if (expectedOffset !== input.renderedUtf16Length) return blockedProjection(
    "invalid-flow-atom-coverage",
    "placement atoms must cover rendered text completely",
  )
  const groups: VNextTextBlockBreakGroupKernelV1[] = []
  let atomIndex = 0
  for (let index = 0; index + 1 < input.breakOffsets.length; index += 1) {
    const renderStartOffset = input.breakOffsets[index]!
    const renderEndOffset = input.breakOffsets[index + 1]!
    const atoms: VNextTextBlockPlacementAtomKernelV1[] = []
    while (
      atomIndex < input.atoms.length
      && input.atoms[atomIndex]!.renderStartOffset < renderEndOffset
    ) {
      const atom = input.atoms[atomIndex]!
      if (
        atom.renderStartOffset < renderStartOffset
        || atom.renderEndOffset > renderEndOffset
      ) return blockedProjection(
        "break-boundary-inside-atom",
        "break offsets must not divide a placement atom",
      )
      atoms.push(atom)
      atomIndex += 1
    }
    const advanceLayoutUnit = safeSum(
      atoms.map((atom) => atom.advanceLayoutUnit),
    )
    if (advanceLayoutUnit == null) return blockedProjection(
      "unsafe-layout-arithmetic",
      "break-group advance exceeds safe layout arithmetic",
    )
    groups.push({
      renderStartOffset,
      renderEndOffset,
      atoms,
      advanceLayoutUnit,
      mandatoryBreak: atoms.some((atom) => atom.kind === "hard-break"),
    })
  }
  if (atomIndex !== input.atoms.length) return blockedProjection(
    "break-boundary-inside-atom",
    "placement atoms must belong to an exact break group",
  )
  return { status: "accepted", groups, issues: [] }
}

export function placeVNextTextBlockBreakGroupsKernelV1(input: {
  groups: readonly VNextTextBlockBreakGroupKernelV1[]
  startGroupIndex: number
  intervals: readonly VNextTextBlockFlowIntervalV1[]
}): VNextTextBlockPlacementKernelResultV1 {
  if (
    !Number.isSafeInteger(input.startGroupIndex)
    || input.startGroupIndex < 0
    || input.startGroupIndex >= input.groups.length
  ) return {
    status: "blocked",
    placedAtoms: null,
    nextGroupIndex: null,
    consumedMandatoryBreak: false,
    issues: [{
      code: "unbreakable-flow-item-overflow",
      message: "placement requires a remaining break group",
    }],
  }
  const placedAtoms: VNextTextBlockPlacedAtomKernelV1[] = []
  let groupIndex = input.startGroupIndex
  let intervalIndex = 0
  let cursor = input.intervals[0]?.startLayoutUnit ?? 0
  let consumedMandatoryBreak = false
  while (groupIndex < input.groups.length) {
    const group = input.groups[groupIndex]!
    let selectedIntervalIndex: number | null = null
    let selectedX = 0
    for (
      let candidateIndex = intervalIndex;
      candidateIndex < input.intervals.length;
      candidateIndex += 1
    ) {
      const interval = input.intervals[candidateIndex]!
      const candidateX = candidateIndex === intervalIndex
        ? Math.max(cursor, interval.startLayoutUnit)
        : interval.startLayoutUnit
      const groupEnd = safeSum([candidateX, group.advanceLayoutUnit])
      if (groupEnd != null && groupEnd <= interval.endLayoutUnit) {
        selectedIntervalIndex = candidateIndex
        selectedX = candidateX
        break
      }
    }
    if (selectedIntervalIndex == null) {
      if (groupIndex === input.startGroupIndex) return {
        status: "blocked",
        placedAtoms: null,
        nextGroupIndex: null,
        consumedMandatoryBreak: false,
        issues: [{
          code: "unbreakable-flow-item-overflow",
          message: "unbreakable flow item cannot fit an available interval",
        }],
      }
      break
    }
    intervalIndex = selectedIntervalIndex
    let atomX = selectedX
    for (const atom of group.atoms) {
      const atomEnd = safeSum([atomX, atom.advanceLayoutUnit])
      if (atomEnd == null) return {
        status: "blocked",
        placedAtoms: null,
        nextGroupIndex: null,
        consumedMandatoryBreak: false,
        issues: [{
          code: "unsafe-layout-arithmetic",
          message: "placed atom exceeds safe layout arithmetic",
        }],
      }
      placedAtoms.push({
        atom,
        intervalIndex,
        xStartLayoutUnit: atomX,
        xEndLayoutUnit: atomEnd,
      })
      atomX = atomEnd
    }
    cursor = atomX
    groupIndex += 1
    if (group.mandatoryBreak) {
      consumedMandatoryBreak = true
      break
    }
  }
  return {
    status: "accepted",
    placedAtoms,
    nextGroupIndex: groupIndex,
    consumedMandatoryBreak,
    issues: [],
  }
}

function blockedWrapping(
  code: string,
  message: string,
  lineIndex?: number,
): VNextTextBlockSpatialWrappingKernelResultV1 {
  return {
    status: "blocked",
    lines: null,
    work: null,
    issues: [{ code, message, ...(lineIndex == null ? {} : { lineIndex }) }],
  }
}

export function runVNextTextBlockSpatialWrappingKernelV1(input: {
  groups: readonly VNextTextBlockBreakGroupKernelV1[]
  startYLayoutUnit: number
  baseBandHeightLayoutUnit: number
  maximumBandRequeryCount: number
  provideRegion(
    band: VNextTextBlockSpatialBandV1,
  ): VNextTextBlockFlowRegionKernelAdapterResultV1
  measureCandidate(
    candidate: VNextTextBlockCandidatePlacementKernelV1,
  ): VNextTextBlockCandidateLineMetricsKernelResultV1
}): VNextTextBlockSpatialWrappingKernelResultV1 {
  if (
    !Number.isSafeInteger(input.startYLayoutUnit)
    || input.startYLayoutUnit < 0
    || !Number.isSafeInteger(input.baseBandHeightLayoutUnit)
    || input.baseBandHeightLayoutUnit <= 0
    || !Number.isSafeInteger(input.maximumBandRequeryCount)
    || input.maximumBandRequeryCount < 0
  ) return blockedWrapping(
    "unsafe-layout-arithmetic",
    "spatial wrapping kernel requires safe finite bounds",
  )
  const lines: Extract<
    VNextTextBlockSpatialWrappingKernelResultV1,
    { status: "accepted" }
  >["lines"][number][] = []
  const work: VNextTextBlockSpatialWrappingWorkV1 = {
    flowRegionFastPathCount: 0,
    spatialIndexQueryCount: 0,
    verticalAdvanceCount: 0,
    lineBandRequeryCount: 0,
  }
  let nextGroupIndex = 0
  let yLayoutUnit = input.startYLayoutUnit
  while (nextGroupIndex < input.groups.length) {
    const lineIndex = lines.length
    const lineStartGroupIndex = nextGroupIndex
    let candidateHeightLayoutUnit = input.baseBandHeightLayoutUnit
    let lineBandRequeryCount = 0
    while (true) {
      const bandBottomLayoutUnit = safeSum([
        yLayoutUnit,
        candidateHeightLayoutUnit,
      ])
      if (bandBottomLayoutUnit == null) return blockedWrapping(
        "unsafe-layout-arithmetic",
        "line band exceeds safe layout arithmetic",
        lineIndex,
      )
      const region = input.provideRegion({
        topLayoutUnit: yLayoutUnit,
        bottomLayoutUnit: bandBottomLayoutUnit,
      })
      if (region.status !== "accepted") return blockedWrapping(
        region.issues[0]?.code ?? "flow-region-blocked",
        region.issues[0]?.message ?? "flow region adapter blocked",
        lineIndex,
      )
      if (region.work.fastPath === "no-flow-affecting-entry") {
        work.flowRegionFastPathCount += 1
      }
      work.spatialIndexQueryCount += region.work.spatialIndexQueryCount
      if (region.intervals.length === 0) {
        if (
          region.nextYLayoutUnit == null
          || region.nextYLayoutUnit <= yLayoutUnit
        ) return blockedWrapping(
          "no-vertical-progress",
          "zero-space flow region must prove a strictly advancing y event",
          lineIndex,
        )
        yLayoutUnit = region.nextYLayoutUnit
        work.verticalAdvanceCount += 1
        candidateHeightLayoutUnit = input.baseBandHeightLayoutUnit
        lineBandRequeryCount = 0
        continue
      }
      const placement = placeVNextTextBlockBreakGroupsKernelV1({
        groups: input.groups,
        startGroupIndex: lineStartGroupIndex,
        intervals: region.intervals,
      })
      if (placement.status !== "accepted") {
        if (
          placement.issues[0]?.code === "unbreakable-flow-item-overflow"
          && region.nextYLayoutUnit != null
          && region.nextYLayoutUnit > yLayoutUnit
        ) {
          yLayoutUnit = region.nextYLayoutUnit
          work.verticalAdvanceCount += 1
          candidateHeightLayoutUnit = input.baseBandHeightLayoutUnit
          lineBandRequeryCount = 0
          continue
        }
        return blockedWrapping(
          placement.issues[0]?.code ?? "unbreakable-flow-item-overflow",
          placement.issues[0]?.message ?? "placement blocked",
          lineIndex,
        )
      }
      if (placement.nextGroupIndex <= lineStartGroupIndex) return blockedWrapping(
        "no-source-progress",
        "accepted line placement must advance source groups",
        lineIndex,
      )
      const metrics = input.measureCandidate({
        lineIndex,
        lineYLayoutUnit: yLayoutUnit,
        candidateBandHeightLayoutUnit: candidateHeightLayoutUnit,
        intervals: region.intervals,
        placedAtoms: placement.placedAtoms,
        nextGroupIndex: placement.nextGroupIndex,
      })
      if (metrics.status !== "accepted") return blockedWrapping(
        metrics.issues[0]?.code ?? "line-metrics-blocked",
        metrics.issues[0]?.message ?? "line metric adapter blocked",
        lineIndex,
      )
      if (
        !Number.isSafeInteger(metrics.heightLayoutUnit)
        || metrics.heightLayoutUnit < candidateHeightLayoutUnit
        || !Number.isSafeInteger(metrics.baselineOffsetLayoutUnit)
        || metrics.baselineOffsetLayoutUnit < 0
        || metrics.baselineOffsetLayoutUnit > metrics.heightLayoutUnit
      ) return blockedWrapping(
        "unsafe-layout-arithmetic",
        "line metrics must preserve safe monotonic height",
        lineIndex,
      )
      if (metrics.heightLayoutUnit > candidateHeightLayoutUnit) {
        lineBandRequeryCount += 1
        work.lineBandRequeryCount += 1
        if (lineBandRequeryCount > input.maximumBandRequeryCount) {
          return blockedWrapping(
            "line-band-did-not-stabilize",
            "line band exceeded its finite spatial stabilization proof",
            lineIndex,
          )
        }
        candidateHeightLayoutUnit = metrics.heightLayoutUnit
        continue
      }
      lines.push({
        lineIndex,
        lineYLayoutUnit: yLayoutUnit,
        heightLayoutUnit: metrics.heightLayoutUnit,
        baselineOffsetLayoutUnit: metrics.baselineOffsetLayoutUnit,
        intervals: region.intervals,
        placedAtoms: placement.placedAtoms,
        regionFingerprint: region.regionFingerprint,
        metricPayload: metrics.payload,
      })
      nextGroupIndex = placement.nextGroupIndex
      const nextYLayoutUnit = safeSum([
        yLayoutUnit,
        metrics.heightLayoutUnit,
      ])
      if (
        nextYLayoutUnit == null
        || nextYLayoutUnit <= yLayoutUnit
      ) return blockedWrapping(
        "no-vertical-progress",
        "accepted line must advance y",
        lineIndex,
      )
      yLayoutUnit = nextYLayoutUnit
      break
    }
  }
  return { status: "accepted", lines, work, issues: [] }
}
