import type { VNextTextBlockFlowIntervalV1 } from "./textBlockFlowRegionProviderV1.js"

// Closed internal vocabulary only; no callback/plugin surface is exported by Core.
export type VNextTextBlockPlacementAtomKernelV1 = {
  kind: "text-cluster" | "inline-image" | "hard-break"
  renderStartOffset: number
  renderEndOffset: number
  advanceLayoutUnit: number
  payloadIndex: number
}
export interface VNextTextBlockBreakGroupKernelV1 {
  renderStartOffset: number
  renderEndOffset: number
  atoms: readonly VNextTextBlockPlacementAtomKernelV1[]
  advanceLayoutUnit: number
  mandatoryBreak: boolean
}
export function createVNextTextBlockBreakGroupsKernelV1(input: { atoms: readonly VNextTextBlockPlacementAtomKernelV1[]; breakOffsets: readonly number[]; renderedUtf16Length: number }) {
  if (input.breakOffsets[0] !== 0 || input.breakOffsets.at(-1) !== input.renderedUtf16Length) return { status: "blocked" as const, groups: null, issues: [{ code: "invalid-break-offsets", message: "break offsets must cover rendered text" }] }
  let expected = 0
  for (const atom of input.atoms) {
    if (atom.renderStartOffset !== expected || atom.renderEndOffset <= atom.renderStartOffset) return { status: "blocked" as const, groups: null, issues: [{ code: "invalid-flow-atom-coverage", message: "atoms must cover text contiguously" }] }
    expected = atom.renderEndOffset
  }
  if (expected !== input.renderedUtf16Length) return { status: "blocked" as const, groups: null, issues: [{ code: "invalid-flow-atom-coverage", message: "atoms must cover text completely" }] }
  const groups: VNextTextBlockBreakGroupKernelV1[] = []
  for (let index = 0; index + 1 < input.breakOffsets.length; index += 1) {
    const start = input.breakOffsets[index]!
    const end = input.breakOffsets[index + 1]!
    const atoms = input.atoms.filter((atom) => atom.renderStartOffset >= start && atom.renderEndOffset <= end)
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || end <= start || input.atoms.some((atom) => atom.renderStartOffset < end && atom.renderEndOffset > start && (atom.renderStartOffset < start || atom.renderEndOffset > end))) return { status: "blocked" as const, groups: null, issues: [{ code: "break-boundary-inside-atom", message: "break offsets must not split atoms" }] }
    const advanceLayoutUnit = atoms.reduce((sum, atom) => sum + atom.advanceLayoutUnit, 0)
    if (!Number.isSafeInteger(advanceLayoutUnit)) return { status: "blocked" as const, groups: null, issues: [{ code: "unsafe-layout-arithmetic", message: "group advance is unsafe" }] }
    groups.push({ renderStartOffset: start, renderEndOffset: end, atoms, advanceLayoutUnit, mandatoryBreak: atoms.some((atom) => atom.kind === "hard-break") })
  }
  return { status: "accepted" as const, groups, issues: [] as [] }
}
export function placeVNextTextBlockBreakGroupsKernelV1(input: { groups: readonly VNextTextBlockBreakGroupKernelV1[]; startGroupIndex: number; intervals: readonly VNextTextBlockFlowIntervalV1[] }) {
  const placements: Array<{ groupIndex: number; intervalIndex: number; xLayoutUnit: number }> = []
  let groupIndex = input.startGroupIndex
  let intervalIndex = 0
  let cursor = input.intervals[0]?.startLayoutUnit ?? 0
  while (groupIndex < input.groups.length) {
    const group = input.groups[groupIndex]!
    let selected = -1
    let x = 0
    for (let candidate = intervalIndex; candidate < input.intervals.length; candidate += 1) {
      const interval = input.intervals[candidate]!
      const candidateX = candidate === intervalIndex ? Math.max(cursor, interval.startLayoutUnit) : interval.startLayoutUnit
      const end = candidateX + group.advanceLayoutUnit
      if (Number.isSafeInteger(end) && end <= interval.endLayoutUnit) { selected = candidate; x = candidateX; break }
    }
    if (selected < 0) break
    placements.push({ groupIndex, intervalIndex: selected, xLayoutUnit: x })
    cursor = x + group.advanceLayoutUnit
    intervalIndex = selected
    groupIndex += 1
    if (group.mandatoryBreak) break
  }
  return { nextGroupIndex: groupIndex, placements }
}
export function runVNextTextBlockSpatialWrappingKernelV1(input: { lineBandRequeryCount: number }): { lineBandRequeryCount: number } {
  return { lineBandRequeryCount: input.lineBandRequeryCount }
}
