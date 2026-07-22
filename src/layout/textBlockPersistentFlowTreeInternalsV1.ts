import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type { VNextTextBlockV4MeasurementRun } from "../pagination/textBlockV4Measurement.js"
import {
  VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1,
  VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_VERSION,
  type VNextTextBlockPersistentFlowBranchV1,
  type VNextTextBlockPersistentFlowClusterV1,
  type VNextTextBlockPersistentFlowIssueCodeV1,
  type VNextTextBlockPersistentFlowItemKindV1,
  type VNextTextBlockPersistentFlowItemV1,
  type VNextTextBlockPersistentFlowLeafV1,
  type VNextTextBlockPersistentFlowNodeV1,
  type VNextTextBlockPersistentFlowSummaryV1,
  type VNextTextBlockPersistentFlowTreeV1,
} from "./textBlockPersistentFlowContractV1.js"
import type { VNextTextBlockMultiRunLayoutRequestV1 } from "./textBlockMultiRunLayoutContractV1.js"

const processLocalPersistentFlowTreesV1 = new WeakSet<object>()

export function compactPersistentFlowFactsV1(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

export function deepFreezePersistentFlowV1<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  Object.values(value).forEach((child) => deepFreezePersistentFlowV1(child))
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

export function deeplyFrozenPersistentFlowV1(value: unknown): boolean {
  if (value == null || typeof value !== "object" || !Object.isFrozen(value)) return false
  return Object.values(value).every((child) => (
    child == null || typeof child !== "object" || deeplyFrozenPersistentFlowV1(child)
  ))
}

export function partitionPersistentFlowValuesV1<T>(
  values: readonly T[],
  maximum: number,
): T[][] {
  if (values.length === 0 || !Number.isSafeInteger(maximum) || maximum < 2) return []
  const groupCount = Math.ceil(values.length / maximum)
  const base = Math.floor(values.length / groupCount)
  const remainder = values.length % groupCount
  const groups: T[][] = []
  let cursor = 0
  for (let index = 0; index < groupCount; index += 1) {
    const size = base + (index < remainder ? 1 : 0)
    groups.push(values.slice(cursor, cursor + size))
    cursor += size
  }
  return groups
}

export function registerVNextTextBlockPersistentFlowTreeInternalV1(
  tree: VNextTextBlockPersistentFlowTreeV1,
): void {
  processLocalPersistentFlowTreesV1.add(tree)
}

export function hasVNextTextBlockPersistentFlowTreeProvenanceInternalV1(
  tree: object,
): boolean {
  return processLocalPersistentFlowTreesV1.has(tree)
}

function safeSum(values: readonly number[]): number | null {
  let total = 0
  for (const value of values) {
    if (!Number.isSafeInteger(value)) return null
    total += value
    if (!Number.isSafeInteger(total)) return null
  }
  return total
}

function requireSafe(value: number | null): number {
  if (value == null) throw new RangeError("unsafe persistent flow summary")
  return value
}

function summaryFromItems(items: readonly VNextTextBlockPersistentFlowItemV1[]): VNextTextBlockPersistentFlowSummaryV1 {
  const renderedUtf16Length = requireSafe(safeSum(items.map((item) => item.renderedText.length)))
  const authoredUtf16Length = requireSafe(safeSum(items.map((item) => item.authoredUtf16Length)))
  const itemCount = requireSafe(safeSum(items.map(() => 1)))
  const sourceRunCount = requireSafe(safeSum(items.map((item) => item.beginsSourceRun ? 1 : 0)))
  const atomicSourceCount = requireSafe(safeSum(items.map((item) => item.atomicSourceContribution)))
  const mandatoryBreakCount = requireSafe(safeSum(items.map((item) => item.mandatoryBreakContribution)))
  const semanticFingerprint = compactPersistentFlowFactsV1({
    policyVersion: VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_VERSION,
    itemSemanticFingerprints: items.map((item) => item.semanticFingerprint),
  })
  return {
    renderedUtf16Length,
    authoredUtf16Length,
    itemCount,
    leafCount: 1,
    nodeCount: 1,
    sourceRunCount,
    atomicSourceCount,
    mandatoryBreakCount,
    semanticFingerprint,
  }
}

function summaryFromChildren(children: readonly VNextTextBlockPersistentFlowNodeV1[]): VNextTextBlockPersistentFlowSummaryV1 {
  const sum = (key: Exclude<keyof VNextTextBlockPersistentFlowSummaryV1, "semanticFingerprint">) =>
    requireSafe(safeSum(children.map((child) => child.summary[key] as number)))
  const semanticFingerprint = compactPersistentFlowFactsV1({
    policyVersion: VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_VERSION,
    childSemanticFingerprints: children.map((child) => child.summary.semanticFingerprint),
  })
  return {
    renderedUtf16Length: sum("renderedUtf16Length"),
    authoredUtf16Length: sum("authoredUtf16Length"),
    itemCount: sum("itemCount"),
    leafCount: sum("leafCount"),
    nodeCount: requireSafe(safeSum([sum("nodeCount"), 1])),
    sourceRunCount: sum("sourceRunCount"),
    atomicSourceCount: sum("atomicSourceCount"),
    mandatoryBreakCount: sum("mandatoryBreakCount"),
    semanticFingerprint,
  }
}

function itemsByKind(): Record<VNextTextBlockPersistentFlowItemKindV1, number> {
  return { text: 0, "resolved-field": 0, "generated-page-number": 0, "hard-break": 0 }
}

function block(code: VNextTextBlockPersistentFlowIssueCodeV1, message: string) {
  return { status: "blocked" as const, code, message }
}

function cloneLocalStyle(run: VNextTextBlockV4MeasurementRun) {
  return run.localStyle == null ? undefined : JSON.parse(stringifyVNextCanonicalJson(run.localStyle))
}

export function projectVNextTextBlockPersistentFlowItemsForRangeV1(input: {
  request: VNextTextBlockMultiRunLayoutRequestV1
  renderStartOffset: number
  renderEndOffset: number
}):
  | { status: "accepted"; items: VNextTextBlockPersistentFlowItemV1[]; itemsByKind: Record<VNextTextBlockPersistentFlowItemKindV1, number> }
  | { status: "blocked"; code: VNextTextBlockPersistentFlowIssueCodeV1; message: string } {
  const { request, renderStartOffset, renderEndOffset } = input
  const renderedText = request.measurement.renderedText
  if (
    !Number.isSafeInteger(renderStartOffset)
    || !Number.isSafeInteger(renderEndOffset)
    || renderStartOffset < 0
    || renderEndOffset < renderStartOffset
    || renderEndOffset > renderedText.length
  ) return block("invalid-source-ranges", "persistent flow projection requires an ordered in-bounds range")

  const result: VNextTextBlockPersistentFlowItemV1[] = []
  const counts = itemsByKind()
  for (const run of request.measurement.runs) {
    const start = Math.max(renderStartOffset, run.renderStartOffset)
    const end = Math.min(renderEndOffset, run.renderEndOffset)
    if (end <= start) continue
    if (run.kind === "inline-image") return block(
      "unsupported-flow-run",
      "persistent flow foundation does not support inline images",
    )
    if (run.renderedText !== renderedText.slice(run.renderStartOffset, run.renderEndOffset)) return block(
      "invalid-source-ranges",
      "measurement runs must retain exact rendered source ranges",
    )
    if (run.kind === "hard-break") {
      if (start !== run.renderStartOffset || end !== run.renderEndOffset) return block(
        "invalid-source-ranges",
        "hard-break flow items cannot be projected as partial source ranges",
      )
      const dependencyFingerprint = compactPersistentFlowFactsV1({
        kind: run.kind,
        inlineId: run.inlineId,
        renderedText: run.renderedText,
      })
      const semanticFingerprint = compactPersistentFlowFactsV1({
        kind: run.kind,
        renderedText: run.renderedText,
        mandatoryBreakContribution: 1,
      })
      const facts = {
        kind: run.kind,
        inlineId: run.inlineId,
        renderedText: run.renderedText,
        authoredUtf16Length: 1,
        beginsSourceRun: true,
        endsSourceRun: true,
        atomicSourceContribution: 1 as const,
        mandatoryBreakContribution: 1 as const,
        clusters: [],
        dependencyFingerprint,
        semanticFingerprint,
      }
      result.push({ ...facts, fingerprint: compactPersistentFlowFactsV1({ policyVersion: 1, ...facts }) })
      counts[run.kind] += 1
      continue
    }

    const clusters = request.shapingRuns.flatMap((shapingRun) => shapingRun.clusters
      .filter((cluster) => cluster.renderEndOffset > start && cluster.renderStartOffset < end)
      .map((cluster) => ({ shapingRun, cluster })))
    if (clusters.length === 0) return block(
      "invalid-cluster-coverage",
      "text-bearing flow runs require accepted shaping clusters",
    )
    let expected = start
    const selected: Array<{ start: number; end: number; cluster: VNextTextBlockPersistentFlowClusterV1 }> = []
    for (const { shapingRun, cluster } of clusters) {
      if (
        cluster.renderStartOffset !== expected
        || cluster.renderEndOffset > end
        || cluster.renderStartOffset < run.renderStartOffset
        || cluster.renderEndOffset > run.renderEndOffset
      ) return block(
        "invalid-cluster-coverage",
        "accepted clusters must cover each projected source run without gaps, overlap, or boundary crossing",
      )
      expected = cluster.renderEndOffset
      selected.push({
        start: cluster.renderStartOffset,
        end: cluster.renderEndOffset,
        cluster: {
          startUtf16: 0,
          endUtf16: 0,
          advanceLayoutUnit: cluster.advanceLayoutUnit,
          styleKey: shapingRun.styleKey,
          fontFaceId: shapingRun.fontFaceId,
          fontSizeLayoutUnit: shapingRun.fontSizeLayoutUnit,
          textColor: shapingRun.textColor,
          direction: shapingRun.direction,
          baselineShiftLayoutUnit: shapingRun.baselineShiftLayoutUnit,
          features: [...shapingRun.features],
        },
      })
    }
    if (expected !== end) return block(
      "invalid-cluster-coverage",
      "accepted clusters must completely cover each projected source range",
    )

    let chunkStart = 0
    while (chunkStart < selected.length) {
      let chunkEnd = chunkStart
      const itemStart = selected[chunkStart]!.start
      while (chunkEnd < selected.length && selected[chunkEnd]!.end - itemStart <= VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumItemRenderedUtf16Length) chunkEnd += 1
      if (chunkEnd === chunkStart) return block(
        "invalid-cluster-coverage",
        "a shaping cluster exceeds the maximum persistent flow item length",
      )
      const itemEnd = selected[chunkEnd - 1]!.end
      const itemClusters = selected.slice(chunkStart, chunkEnd).map(({ start: clusterStart, end: clusterEnd, cluster }) => ({
        ...cluster,
        startUtf16: clusterStart - itemStart,
        endUtf16: clusterEnd - itemStart,
      }))
      const beginsSourceRun = itemStart === run.renderStartOffset
      const endsSourceRun = itemEnd === run.renderEndOffset
      const atomicSourceContribution = run.kind === "text" ? 0 : (beginsSourceRun ? 1 : 0)
      const authoredUtf16Length = run.kind === "text"
        ? itemEnd - itemStart
        : (beginsSourceRun ? 1 : 0)
      const dependencyFingerprint = compactPersistentFlowFactsV1({
        kind: run.kind,
        inlineId: run.inlineId,
        ...(run.fieldKey == null ? {} : { fieldKey: run.fieldKey }),
        ...(run.generatedOwnerFingerprint == null ? {} : { generatedOwnerFingerprint: run.generatedOwnerFingerprint }),
        ...(run.styleKey == null ? {} : { styleKey: run.styleKey }),
        ...(run.localStyle == null ? {} : { localStyle: run.localStyle }),
        clusters: itemClusters.map((cluster) => ({
          styleKey: cluster.styleKey,
          fontFaceId: cluster.fontFaceId,
          fontSizeLayoutUnit: cluster.fontSizeLayoutUnit,
          textColor: cluster.textColor,
          direction: cluster.direction,
          baselineShiftLayoutUnit: cluster.baselineShiftLayoutUnit,
          features: cluster.features,
        })),
      })
      const semanticFingerprint = compactPersistentFlowFactsV1({
        kind: run.kind,
        renderedText: renderedText.slice(itemStart, itemEnd),
        authoredUtf16Length,
        atomicSourceContribution,
        clusters: itemClusters.map(({ startUtf16, endUtf16, advanceLayoutUnit }) => ({
          startUtf16,
          endUtf16,
          advanceLayoutUnit,
        })),
      })
      const facts = {
        kind: run.kind,
        inlineId: run.inlineId,
        ...(run.fieldKey == null ? {} : { fieldKey: run.fieldKey }),
        ...(run.generatedOwnerFingerprint == null ? {} : { generatedOwnerFingerprint: run.generatedOwnerFingerprint }),
        ...(run.styleKey == null ? {} : { styleKey: run.styleKey }),
        ...(run.localStyle == null ? {} : { localStyle: cloneLocalStyle(run) }),
        renderedText: renderedText.slice(itemStart, itemEnd),
        authoredUtf16Length,
        beginsSourceRun,
        endsSourceRun,
        atomicSourceContribution: atomicSourceContribution as 0 | 1,
        mandatoryBreakContribution: 0 as const,
        clusters: itemClusters,
        dependencyFingerprint,
        semanticFingerprint,
      }
      result.push({ ...facts, fingerprint: compactPersistentFlowFactsV1({ policyVersion: 1, ...facts }) })
      counts[run.kind] += 1
      chunkStart = chunkEnd
    }
  }
  return { status: "accepted", items: result, itemsByKind: counts }
}

export function createVNextTextBlockPersistentFlowLeafInternalV1(
  items: readonly VNextTextBlockPersistentFlowItemV1[],
): VNextTextBlockPersistentFlowLeafV1 {
  const summary = summaryFromItems(items)
  return {
    nodeKind: "leaf",
    height: 0,
    items: [...items],
    summary,
    fingerprint: compactPersistentFlowFactsV1({
      policyVersion: VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_VERSION,
      nodeKind: "leaf",
      itemFingerprints: items.map((item) => item.fingerprint),
      summary,
    }),
  }
}

export function createVNextTextBlockPersistentFlowBranchInternalV1(
  children: readonly VNextTextBlockPersistentFlowNodeV1[],
): VNextTextBlockPersistentFlowBranchV1 {
  if (children.length === 0 || children.some((child) => child.height !== children[0]!.height)) {
    throw new RangeError("persistent flow branches require non-empty equal-height children")
  }
  const summary = summaryFromChildren(children)
  return {
    nodeKind: "branch",
    height: children[0]!.height + 1,
    children: [...children],
    summary,
    fingerprint: compactPersistentFlowFactsV1({
      policyVersion: VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_VERSION,
      nodeKind: "branch",
      childFingerprints: children.map((child) => child.fingerprint),
      summary,
    }),
  }
}

export function buildVNextTextBlockPersistentFlowRootInternalV1(
  leaves: readonly VNextTextBlockPersistentFlowLeafV1[],
): VNextTextBlockPersistentFlowNodeV1 {
  if (leaves.length === 0) throw new RangeError("persistent flow requires at least one leaf")
  let level: VNextTextBlockPersistentFlowNodeV1[] = [...leaves]
  while (level.length > 1) {
    level = partitionPersistentFlowValuesV1(
      level,
      VNEXT_TEXT_BLOCK_PERSISTENT_FLOW_POLICY_V1.maximumBranchChildren,
    ).map(createVNextTextBlockPersistentFlowBranchInternalV1)
  }
  return level[0]!
}

export function countVNextTextBlockPersistentFlowNodesInternalV1(
  root: VNextTextBlockPersistentFlowNodeV1,
): number {
  return root.nodeKind === "leaf"
    ? 1
    : requireSafe(safeSum([1, ...root.children.map(countVNextTextBlockPersistentFlowNodesInternalV1)]))
}
