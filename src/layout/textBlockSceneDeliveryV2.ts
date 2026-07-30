import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  hasVNextTextBlockPersistentScenePreparedCandidateInternalV2,
  inspectVNextTextBlockPersistentSceneV2,
} from "./textBlockPersistentSceneV2.js"
import type {
  VNextTextBlockPersistentSceneChunkV2,
  VNextTextBlockPersistentSceneNodeV2,
  VNextTextBlockPersistentSceneRootV2,
  VNextTextBlockPersistentSceneV2,
} from "./textBlockPersistentSceneContractV2.js"
import {
  VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_SOURCE,
  VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_VERSION,
  type VNextTextBlockCompleteSceneDeliveryResultV2,
  type VNextTextBlockSceneDeliveryOperationDraftV2,
  type VNextTextBlockSceneDeliveryOperationV2,
  type VNextTextBlockSceneDeliveryPlanBuildResultV2,
  type VNextTextBlockSceneDeliveryPlanCandidateInputV2,
  type VNextTextBlockSceneDeliveryPlanInspectionV2,
  type VNextTextBlockSceneDeliveryPlanIssueCodeV2,
  type VNextTextBlockSceneDeliveryPlanIssueV2,
  type VNextTextBlockSceneDeliveryPlanV2,
  type VNextTextBlockSceneDeliveryRangeV2,
} from "./textBlockSceneDeliveryContractV2.js"
import type {
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) {
      deepFreeze(descriptor.value)
    }
  }
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

function safeAdd(left: number, right: number): number {
  const result = left + right
  if (!Number.isSafeInteger(result)) throw new Error("unsafe integer")
  return result
}

function utf8ByteCount(value: unknown): number {
  return new TextEncoder().encode(
    stringifyVNextCanonicalJson(value),
  ).byteLength
}

function exactRecord(
  value: unknown,
  keys: readonly string[],
): Record<string, unknown> | null {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return null
    }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(value).length !== 0) return null
    const actual = Reflect.ownKeys(value)
    if (
      actual.length !== keys.length
      || actual.some((key) => typeof key !== "string" || !keys.includes(key))
    ) return null
    const output = Object.create(null) as Record<string, unknown>
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      output[key] = descriptor.value
    }
    return output
  } catch {
    return null
  }
}

function exactArray(value: unknown): readonly unknown[] | null {
  try {
    if (
      !Array.isArray(value)
      || Object.getPrototypeOf(value) !== Array.prototype
    ) return null
    const length = Object.getOwnPropertyDescriptor(value, "length")
    if (
      length == null
      || !Object.hasOwn(length, "value")
      || !Number.isSafeInteger(length.value)
      || length.value < 0
      || Reflect.ownKeys(value).length !== length.value + 1
    ) return null
    const output: unknown[] = []
    for (let index = 0; index < length.value; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      output.push(descriptor.value)
    }
    return output
  } catch {
    return null
  }
}

function deliveryIssue(
  code: VNextTextBlockSceneDeliveryPlanIssueCodeV2,
  message: string,
): VNextTextBlockSceneDeliveryPlanIssueV2 {
  return { code, message }
}

function blockedPlan(
  code: VNextTextBlockSceneDeliveryPlanIssueCodeV2,
  message: string,
): VNextTextBlockSceneDeliveryPlanBuildResultV2 {
  return Object.freeze({
    status: "blocked",
    plan: null,
    issues: Object.freeze([deliveryIssue(code, message)]),
  })
}

function invalidInspection(
  code: VNextTextBlockSceneDeliveryPlanIssueCodeV2,
  message: string,
): VNextTextBlockSceneDeliveryPlanInspectionV2 {
  return { status: "invalid", code, message }
}

function planCanonicalFacts(plan: VNextTextBlockSceneDeliveryPlanV2): unknown {
  return {
    source: plan.source,
    contractVersion: plan.contractVersion,
    status: plan.status,
    previousSceneFingerprint: plan.previousSceneFingerprint,
    nextSceneFingerprint: plan.nextSceneFingerprint,
    previousChunkCount: plan.previousChunkCount,
    nextChunkCount: plan.nextChunkCount,
    operations: plan.operations,
    summary: plan.summary,
    work: plan.work,
  }
}

function validRange(
  range: VNextTextBlockSceneDeliveryRangeV2,
  limit: number,
): boolean {
  return Number.isSafeInteger(range.start)
    && Number.isSafeInteger(range.end)
    && range.start >= 0
    && range.end >= range.start
    && range.end <= limit
}

function rangeLength(range: VNextTextBlockSceneDeliveryRangeV2): number {
  return range.end - range.start
}

interface SelectedSceneNode {
  readonly node: VNextTextBlockPersistentSceneNodeV2
  readonly path: readonly number[]
  readonly start: number
  readonly end: number
}

function selectMaximalNodes(
  root: VNextTextBlockPersistentSceneRootV2,
  range: VNextTextBlockSceneDeliveryRangeV2,
): readonly SelectedSceneNode[] {
  if (range.start === range.end || root.nodeKind === "empty") return []
  const selected: SelectedSceneNode[] = []
  const visit = (
    node: VNextTextBlockPersistentSceneNodeV2,
    start: number,
    path: readonly number[],
  ): void => {
    const end = start + node.summary.chunkCount
    if (end <= range.start || start >= range.end) return
    if (range.start <= start && end <= range.end) {
      selected.push({ node, path, start, end })
      return
    }
    if (node.nodeKind === "leaf") {
      throw new Error("partial scene leaf")
    }
    let childStart = start
    for (
      let childIndex = 0;
      childIndex < node.children.length;
      childIndex += 1
    ) {
      const child = node.children[childIndex]!
      visit(child, childStart, [...path, childIndex])
      childStart += child.summary.chunkCount
    }
  }
  visit(root, 0, [])
  return selected
}

function chunksFromSelected(
  selected: readonly SelectedSceneNode[],
): {
  readonly chunks: readonly VNextTextBlockPersistentSceneChunkV2[]
  readonly visitedNodeCount: number
} {
  const chunks: VNextTextBlockPersistentSceneChunkV2[] = []
  let visitedNodeCount = 0
  const visit = (node: VNextTextBlockPersistentSceneNodeV2): void => {
    visitedNodeCount += 1
    if (node.nodeKind === "leaf") {
      chunks.push(node.chunk)
      return
    }
    for (const child of node.children) visit(child)
  }
  for (const item of selected) visit(item.node)
  return { chunks, visitedNodeCount }
}

function sameSelectedNodeIdentity(
  previous: readonly SelectedSceneNode[],
  next: readonly SelectedSceneNode[],
): boolean {
  return previous.length === next.length
    && previous.every((item, index) => item.node === next[index]?.node)
}

function exactRange(value: unknown): VNextTextBlockSceneDeliveryRangeV2 | null {
  const record = exactRecord(value, ["start", "end"])
  return record == null
    || typeof record.start !== "number"
    || typeof record.end !== "number"
    ? null
    : { start: record.start, end: record.end }
}

function exactDraftOperations(
  value: unknown,
): readonly VNextTextBlockSceneDeliveryOperationDraftV2[] | null {
  const values = exactArray(value)
  if (values == null) return null
  const output: VNextTextBlockSceneDeliveryOperationDraftV2[] = []
  for (const item of values) {
    const record = exactRecord(item, [
      "kind",
      "previousRange",
      "nextRange",
    ])
    const previousRange = record == null
      ? null
      : exactRange(record.previousRange)
    const nextRange = record == null ? null : exactRange(record.nextRange)
    if (
      record == null
      || (
        record.kind !== "retain-range"
        && record.kind !== "splice-range"
      )
      || previousRange == null
      || nextRange == null
    ) return null
    output.push({
      kind: record.kind,
      previousRange,
      nextRange,
    })
  }
  return output
}

function exactBuilderInput(value: unknown): {
  readonly previousScene: unknown
  readonly nextScene: unknown
  readonly operations: readonly VNextTextBlockSceneDeliveryOperationDraftV2[]
} | null {
  const record = exactRecord(value, [
    "previousScene",
    "nextScene",
    "operations",
  ])
  if (record == null) return null
  const operations = exactDraftOperations(record.operations)
  return operations == null
    ? null
    : {
        previousScene: record.previousScene,
        nextScene: record.nextScene,
        operations,
      }
}

function validateDraftCoverage(
  operations: readonly VNextTextBlockSceneDeliveryOperationDraftV2[],
  previousCount: number,
  nextCount: number,
): VNextTextBlockSceneDeliveryPlanIssueV2 | null {
  let previousCursor = 0
  let nextCursor = 0
  for (const operation of operations) {
    if (
      !validRange(operation.previousRange, previousCount)
      || !validRange(operation.nextRange, nextCount)
    ) {
      return deliveryIssue(
        "invalid-input",
        "delivery operation contains an unsafe or out-of-domain range",
      )
    }
    if (
      operation.previousRange.start < previousCursor
      || operation.nextRange.start < nextCursor
    ) {
      return deliveryIssue(
        "delivery-plan-range-overlap",
        "delivery ranges overlap or move backwards",
      )
    }
    if (
      operation.previousRange.start > previousCursor
      || operation.nextRange.start > nextCursor
    ) {
      return deliveryIssue(
        "delivery-plan-range-gap",
        "delivery ranges contain an uncovered gap",
      )
    }
    const previousLength = rangeLength(operation.previousRange)
    const nextLength = rangeLength(operation.nextRange)
    if (previousLength === 0 && nextLength === 0) {
      return deliveryIssue(
        "delivery-plan-empty-operation",
        "delivery operation may not have two empty ranges",
      )
    }
    if (
      operation.kind === "retain-range"
      && (
        previousLength === 0
        || previousLength !== nextLength
      )
    ) {
      return deliveryIssue(
        "delivery-plan-retain-length-mismatch",
        "retain operation requires equal non-empty ranges",
      )
    }
    previousCursor = operation.previousRange.end
    nextCursor = operation.nextRange.end
  }
  return previousCursor === previousCount && nextCursor === nextCount
    ? null
    : deliveryIssue(
        "delivery-plan-range-nonexhaustive",
        "delivery operations do not exhaust both immutable domains",
      )
}

function normalizeDrafts(
  operations: readonly VNextTextBlockSceneDeliveryOperationDraftV2[],
): readonly VNextTextBlockSceneDeliveryOperationDraftV2[] {
  const normalized: VNextTextBlockSceneDeliveryOperationDraftV2[] = []
  for (const operation of operations) {
    const previous = normalized[normalized.length - 1]
    if (
      previous != null
      && previous.kind === operation.kind
      && previous.previousRange.end === operation.previousRange.start
      && previous.nextRange.end === operation.nextRange.start
    ) {
      normalized[normalized.length - 1] = {
        kind: operation.kind,
        previousRange: {
          start: previous.previousRange.start,
          end: operation.previousRange.end,
        },
        nextRange: {
          start: previous.nextRange.start,
          end: operation.nextRange.end,
        },
      }
    } else {
      normalized.push(operation)
    }
  }
  return normalized
}

function replacementPayloadEstimate(
  chunks: readonly VNextTextBlockPersistentSceneChunkV2[],
): number {
  let total = 0
  for (const chunk of chunks) {
    total = safeAdd(total, utf8ByteCount({
      payloadPolicyVersion: 1,
      chunk,
    }))
  }
  return total
}

export function createVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: VNextTextBlockSceneDeliveryPlanCandidateInputV2,
): VNextTextBlockSceneDeliveryPlanBuildResultV2
export function createVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: unknown,
): VNextTextBlockSceneDeliveryPlanBuildResultV2
export function createVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: unknown,
): VNextTextBlockSceneDeliveryPlanBuildResultV2 {
  const exact = exactBuilderInput(input)
  if (
    exact == null
    || !hasVNextTextBlockPersistentScenePreparedCandidateInternalV2(
      exact.previousScene,
    )
    || !hasVNextTextBlockPersistentScenePreparedCandidateInternalV2(
      exact.nextScene,
    )
  ) {
    return blockedPlan(
      "invalid-input",
      "plan construction requires exact prepared scenes and operation drafts",
    )
  }
  const previousScene = exact.previousScene
  const nextScene = exact.nextScene
  const coverageIssue = validateDraftCoverage(
    exact.operations,
    previousScene.root.summary.chunkCount,
    nextScene.root.summary.chunkCount,
  )
  if (coverageIssue != null) {
    return blockedPlan(coverageIssue.code, coverageIssue.message)
  }
  try {
    const operations: VNextTextBlockSceneDeliveryOperationV2[] = []
    for (const draft of normalizeDrafts(exact.operations)) {
      if (draft.kind === "retain-range") {
        const previousSelected = selectMaximalNodes(
          previousScene.root,
          draft.previousRange,
        )
        const nextSelected = selectMaximalNodes(
          nextScene.root,
          draft.nextRange,
        )
        if (!sameSelectedNodeIdentity(previousSelected, nextSelected)) {
          return blockedPlan(
            "delivery-plan-retain-payload-mismatch",
            "retain range does not name exact shared scene subtrees",
          )
        }
        operations.push({
          kind: "retain-range",
          previousRange: draft.previousRange,
          nextRange: draft.nextRange,
          retainedSubtrees: previousSelected.map((selected) => ({
            previousPath: selected.path,
            fingerprint: selected.node.fingerprint,
            chunkCount: selected.node.summary.chunkCount,
          })),
        })
      } else {
        const selected = selectMaximalNodes(
          nextScene.root,
          draft.nextRange,
        )
        const replacement = chunksFromSelected(selected)
        operations.push({
          kind: "splice-range",
          previousRange: draft.previousRange,
          nextRange: draft.nextRange,
          replacementChunks: replacement.chunks,
        })
      }
    }
    let retainOperationCount = 0
    let spliceOperationCount = 0
    let retainedSubtreeCount = 0
    let replacementChunkCount = 0
    let estimatedCanonicalPayloadByteCount = 0
    for (const operation of operations) {
      if (operation.kind === "retain-range") {
        retainOperationCount += 1
        retainedSubtreeCount = safeAdd(
          retainedSubtreeCount,
          operation.retainedSubtrees.length,
        )
      } else {
        spliceOperationCount += 1
        replacementChunkCount = safeAdd(
          replacementChunkCount,
          operation.replacementChunks.length,
        )
        estimatedCanonicalPayloadByteCount = safeAdd(
          estimatedCanonicalPayloadByteCount,
          replacementPayloadEstimate(operation.replacementChunks),
        )
      }
    }
    const summary = {
      retainOperationCount,
      spliceOperationCount,
      retainedSubtreeCount,
      replacementChunkCount,
      estimatedCanonicalPayloadByteCount,
    }
    const work = {
      visitedOperationCount: operations.length,
      visitedRetainCoverNodeCount: retainedSubtreeCount,
      visitedReplacementChunkCount: replacementChunkCount,
      completePreviousSceneTraversalCount: 0 as const,
      completeNextSceneTraversalCount: 0 as const,
    }
    const facts = {
      source: VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_SOURCE,
      contractVersion: VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_VERSION,
      status: "accepted" as const,
      previousSceneFingerprint: previousScene.fingerprint,
      nextSceneFingerprint: nextScene.fingerprint,
      previousChunkCount: previousScene.root.summary.chunkCount,
      nextChunkCount: nextScene.root.summary.chunkCount,
      operations,
      summary,
      work,
    }
    const withoutFingerprint = deepFreeze(facts)
    const plan = Object.freeze({
      ...withoutFingerprint,
      fingerprint: fingerprint(planCanonicalFacts({
        ...withoutFingerprint,
        fingerprint: "",
      })),
    })
    const inspection =
      verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2({
        previousScene,
        nextScene,
        plan,
      })
    if (inspection.status !== "valid") {
      return blockedPlan(inspection.code, inspection.message)
    }
    return Object.freeze({
      status: "prepared",
      plan,
      issues: Object.freeze([]) as readonly [],
    })
  } catch {
    return blockedPlan(
      "delivery-plan-unsafe-count",
      "delivery plan exceeded safe range, payload, or work arithmetic",
    )
  }
}

function exactPath(value: unknown): readonly number[] | null {
  const values = exactArray(value)
  if (
    values == null
    || values.some(
      (item) => !Number.isSafeInteger(item) || (item as number) < 0,
    )
  ) return null
  return values as readonly number[]
}

function exactRetainedSubtrees(value: unknown): readonly {
  readonly previousPath: readonly number[]
  readonly fingerprint: string
  readonly chunkCount: number
}[] | null {
  const values = exactArray(value)
  if (values == null) return null
  const output: {
    readonly previousPath: readonly number[]
    readonly fingerprint: string
    readonly chunkCount: number
  }[] = []
  for (const item of values) {
    const record = exactRecord(item, [
      "previousPath",
      "fingerprint",
      "chunkCount",
    ])
    const previousPath = record == null ? null : exactPath(record.previousPath)
    if (
      record == null
      || previousPath == null
      || typeof record.fingerprint !== "string"
      || typeof record.chunkCount !== "number"
    ) return null
    output.push({
      previousPath,
      fingerprint: record.fingerprint,
      chunkCount: record.chunkCount,
    })
  }
  return output
}

function exactPlanOperations(
  value: unknown,
): readonly VNextTextBlockSceneDeliveryOperationV2[] | null {
  const values = exactArray(value)
  if (values == null) return null
  const output: VNextTextBlockSceneDeliveryOperationV2[] = []
  for (const item of values) {
    if (item == null || typeof item !== "object") return null
    const kind = Object.getOwnPropertyDescriptor(item, "kind")
    if (
      kind == null
      || !Object.hasOwn(kind, "value")
      || kind.enumerable !== true
    ) return null
    if (kind.value === "retain-range") {
      const record = exactRecord(item, [
        "kind",
        "previousRange",
        "nextRange",
        "retainedSubtrees",
      ])
      const previousRange = record == null
        ? null
        : exactRange(record.previousRange)
      const nextRange = record == null ? null : exactRange(record.nextRange)
      const retainedSubtrees = record == null
        ? null
        : exactRetainedSubtrees(record.retainedSubtrees)
      if (
        previousRange == null
        || nextRange == null
        || retainedSubtrees == null
      ) return null
      output.push({
        kind: "retain-range",
        previousRange,
        nextRange,
        retainedSubtrees,
      })
    } else if (kind.value === "splice-range") {
      const record = exactRecord(item, [
        "kind",
        "previousRange",
        "nextRange",
        "replacementChunks",
      ])
      const previousRange = record == null
        ? null
        : exactRange(record.previousRange)
      const nextRange = record == null ? null : exactRange(record.nextRange)
      const replacementChunks = record == null
        ? null
        : exactArray(record.replacementChunks)
      if (
        previousRange == null
        || nextRange == null
        || replacementChunks == null
      ) return null
      output.push({
        kind: "splice-range",
        previousRange,
        nextRange,
        replacementChunks:
          replacementChunks as readonly VNextTextBlockPersistentSceneChunkV2[],
      })
    } else {
      return null
    }
  }
  return output
}

function exactPlan(value: unknown): VNextTextBlockSceneDeliveryPlanV2 | null {
  const record = exactRecord(value, [
    "source",
    "contractVersion",
    "status",
    "previousSceneFingerprint",
    "nextSceneFingerprint",
    "previousChunkCount",
    "nextChunkCount",
    "operations",
    "summary",
    "work",
    "fingerprint",
  ])
  if (record == null) return null
  const operations = exactPlanOperations(record.operations)
  const summary = exactRecord(record.summary, [
    "retainOperationCount",
    "spliceOperationCount",
    "retainedSubtreeCount",
    "replacementChunkCount",
    "estimatedCanonicalPayloadByteCount",
  ])
  const work = exactRecord(record.work, [
    "visitedOperationCount",
    "visitedRetainCoverNodeCount",
    "visitedReplacementChunkCount",
    "completePreviousSceneTraversalCount",
    "completeNextSceneTraversalCount",
  ])
  if (
    operations == null
    || summary == null
    || work == null
    || typeof record.previousSceneFingerprint !== "string"
    || typeof record.nextSceneFingerprint !== "string"
    || typeof record.previousChunkCount !== "number"
    || typeof record.nextChunkCount !== "number"
    || typeof record.fingerprint !== "string"
  ) return null
  return {
    source: record.source as VNextTextBlockSceneDeliveryPlanV2["source"],
    contractVersion:
      record.contractVersion as VNextTextBlockSceneDeliveryPlanV2[
        "contractVersion"
      ],
    status: record.status as "accepted",
    previousSceneFingerprint: record.previousSceneFingerprint,
    nextSceneFingerprint: record.nextSceneFingerprint,
    previousChunkCount: record.previousChunkCount,
    nextChunkCount: record.nextChunkCount,
    operations,
    summary: summary as unknown as VNextTextBlockSceneDeliveryPlanV2[
      "summary"
    ],
    work: work as unknown as VNextTextBlockSceneDeliveryPlanV2["work"],
    fingerprint: record.fingerprint,
  }
}

function exactVerifierInput(value: unknown): {
  readonly previousScene: unknown
  readonly nextScene: unknown
  readonly plan: unknown
} | null {
  const record = exactRecord(value, [
    "previousScene",
    "nextScene",
    "plan",
  ])
  return record == null
    ? null
    : {
        previousScene: record.previousScene,
        nextScene: record.nextScene,
        plan: record.plan,
      }
}

function retainedCoverMatches(
  actual: VNextTextBlockSceneDeliveryOperationV2 & {
    readonly kind: "retain-range"
  },
  expected: readonly SelectedSceneNode[],
): boolean {
  return actual.retainedSubtrees.length === expected.length
    && actual.retainedSubtrees.every((retained, index) => {
      const selected = expected[index]
      return selected != null
        && retained.fingerprint === selected.node.fingerprint
        && retained.chunkCount === selected.node.summary.chunkCount
        && retained.previousPath.length === selected.path.length
        && retained.previousPath.every(
          (part, pathIndex) => part === selected.path[pathIndex],
        )
    })
}

function exactSummaryEquals(
  left: unknown,
  right: unknown,
): boolean {
  return stringifyVNextCanonicalJson(left)
    === stringifyVNextCanonicalJson(right)
}

export function verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: {
    readonly previousScene: VNextTextBlockPersistentSceneV2
    readonly nextScene: VNextTextBlockPersistentSceneV2
    readonly plan: unknown
  },
): VNextTextBlockSceneDeliveryPlanInspectionV2
export function verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: unknown,
): VNextTextBlockSceneDeliveryPlanInspectionV2
export function verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2(
  input: unknown,
): VNextTextBlockSceneDeliveryPlanInspectionV2 {
  const exact = exactVerifierInput(input)
  if (
    exact == null
    || !hasVNextTextBlockPersistentScenePreparedCandidateInternalV2(
      exact.previousScene,
    )
    || !hasVNextTextBlockPersistentScenePreparedCandidateInternalV2(
      exact.nextScene,
    )
  ) {
    return invalidInspection(
      "delivery-scene-authority-mismatch",
      "candidate verification requires exact prepared scenes",
    )
  }
  const plan = exactPlan(exact.plan)
  if (plan == null) {
    return invalidInspection(
      "invalid-input",
      "delivery plan is not an exact accessor-free V2 data shape",
    )
  }
  const previousScene = exact.previousScene
  const nextScene = exact.nextScene
  if (
    plan.source !== VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_SOURCE
    || plan.contractVersion
      !== VNEXT_TEXT_BLOCK_SCENE_DELIVERY_PLAN_V2_VERSION
    || plan.status !== "accepted"
  ) {
    return invalidInspection(
      "delivery-plan-source-mismatch",
      "delivery plan source/version/status is unsupported",
    )
  }
  if (
    plan.previousSceneFingerprint !== previousScene.fingerprint
    || plan.nextSceneFingerprint !== nextScene.fingerprint
    || plan.previousChunkCount !== previousScene.root.summary.chunkCount
    || plan.nextChunkCount !== nextScene.root.summary.chunkCount
  ) {
    return invalidInspection(
      "delivery-plan-scene-binding-mismatch",
      "delivery plan does not bind the exact scene domains",
    )
  }
  let previousCursor = 0
  let nextCursor = 0
  let retainOperationCount = 0
  let spliceOperationCount = 0
  let retainedSubtreeCount = 0
  let replacementChunkCount = 0
  let estimatedCanonicalPayloadByteCount = 0
  try {
    for (let index = 0; index < plan.operations.length; index += 1) {
      const operation = plan.operations[index]!
      if (
        !validRange(operation.previousRange, plan.previousChunkCount)
        || !validRange(operation.nextRange, plan.nextChunkCount)
      ) {
        return invalidInspection(
          "invalid-input",
          "delivery plan contains an unsafe or out-of-domain range",
        )
      }
      if (
        operation.previousRange.start < previousCursor
        || operation.nextRange.start < nextCursor
      ) {
        return invalidInspection(
          "delivery-plan-range-overlap",
          "delivery plan ranges overlap or move backwards",
        )
      }
      if (
        operation.previousRange.start > previousCursor
        || operation.nextRange.start > nextCursor
      ) {
        return invalidInspection(
          "delivery-plan-range-gap",
          "delivery plan ranges contain a gap",
        )
      }
      if (
        index > 0
        && plan.operations[index - 1]!.kind === operation.kind
      ) {
        return invalidInspection(
          "delivery-plan-nonmaximal-operation",
          "adjacent delivery operations of one kind must be merged",
        )
      }
      const previousLength = rangeLength(operation.previousRange)
      const nextLength = rangeLength(operation.nextRange)
      if (previousLength === 0 && nextLength === 0) {
        return invalidInspection(
          "delivery-plan-empty-operation",
          "delivery operation may not have two empty ranges",
        )
      }
      if (operation.kind === "retain-range") {
        retainOperationCount += 1
        if (previousLength === 0 || previousLength !== nextLength) {
          return invalidInspection(
            "delivery-plan-retain-length-mismatch",
            "retain operation requires equal non-empty ranges",
          )
        }
        const previousSelected = selectMaximalNodes(
          previousScene.root,
          operation.previousRange,
        )
        const nextSelected = selectMaximalNodes(
          nextScene.root,
          operation.nextRange,
        )
        if (!sameSelectedNodeIdentity(previousSelected, nextSelected)) {
          return invalidInspection(
            "delivery-plan-retain-payload-mismatch",
            "retain operation does not map exact shared subtrees",
          )
        }
        if (!retainedCoverMatches(operation, previousSelected)) {
          return invalidInspection(
            "delivery-plan-retain-cover-mismatch",
            "retain operation is not the greedy maximal-subtree cover",
          )
        }
        retainedSubtreeCount = safeAdd(
          retainedSubtreeCount,
          operation.retainedSubtrees.length,
        )
      } else {
        spliceOperationCount += 1
        const expected = chunksFromSelected(selectMaximalNodes(
          nextScene.root,
          operation.nextRange,
        )).chunks
        if (
          expected.length !== operation.replacementChunks.length
          || expected.some(
            (chunk, chunkIndex) =>
              chunk !== operation.replacementChunks[chunkIndex],
          )
        ) {
          return invalidInspection(
            "delivery-plan-replacement-mismatch",
            "splice replacement chunks are not the exact next-range payload",
          )
        }
        replacementChunkCount = safeAdd(
          replacementChunkCount,
          operation.replacementChunks.length,
        )
        estimatedCanonicalPayloadByteCount = safeAdd(
          estimatedCanonicalPayloadByteCount,
          replacementPayloadEstimate(operation.replacementChunks),
        )
      }
      previousCursor = operation.previousRange.end
      nextCursor = operation.nextRange.end
    }
    if (
      previousCursor !== plan.previousChunkCount
      || nextCursor !== plan.nextChunkCount
    ) {
      return invalidInspection(
        "delivery-plan-range-nonexhaustive",
        "delivery plan does not exhaust both scene domains",
      )
    }
    const expectedSummary = {
      retainOperationCount,
      spliceOperationCount,
      retainedSubtreeCount,
      replacementChunkCount,
      estimatedCanonicalPayloadByteCount,
    }
    if (!exactSummaryEquals(plan.summary, expectedSummary)) {
      return invalidInspection(
        "delivery-plan-summary-mismatch",
        "delivery summary does not match canonical operations",
      )
    }
    const expectedWork = {
      visitedOperationCount: plan.operations.length,
      visitedRetainCoverNodeCount: retainedSubtreeCount,
      visitedReplacementChunkCount: replacementChunkCount,
      completePreviousSceneTraversalCount: 0,
      completeNextSceneTraversalCount: 0,
    }
    if (!exactSummaryEquals(plan.work, expectedWork)) {
      return invalidInspection(
        "delivery-plan-work-mismatch",
        "delivery inspection work does not match bounded operations",
      )
    }
    const expectedFingerprint = fingerprint(planCanonicalFacts(plan))
    if (plan.fingerprint !== expectedFingerprint) {
      return invalidInspection(
        "delivery-plan-fingerprint-mismatch",
        "delivery plan fingerprint does not match canonical facts",
      )
    }
    return {
      status: "valid",
      fingerprint: plan.fingerprint,
      previousCoverageCount: previousCursor,
      nextCoverageCount: nextCursor,
      visitedOperationCount: plan.operations.length,
      visitedRetainCoverNodeCount: retainedSubtreeCount,
      visitedReplacementChunkCount: replacementChunkCount,
      completePreviousSceneTraversalCount: 0,
      completeNextSceneTraversalCount: 0,
    }
  } catch {
    return invalidInspection(
      "delivery-plan-unsafe-count",
      "delivery verification exceeded safe bounded arithmetic",
    )
  }
}

export function inspectVNextTextBlockSceneDeliveryPlanV2(input: {
  readonly previousScene: VNextTextBlockPersistentSceneV2
  readonly nextScene: VNextTextBlockPersistentSceneV2
  readonly plan: unknown
}): VNextTextBlockSceneDeliveryPlanInspectionV2 {
  const exact = exactVerifierInput(input)
  if (
    exact == null
    || inspectVNextTextBlockPersistentSceneV2(
      exact.previousScene,
    ).status !== "valid"
    || inspectVNextTextBlockPersistentSceneV2(
      exact.nextScene,
    ).status !== "valid"
  ) {
    return invalidInspection(
      "delivery-scene-authority-mismatch",
      "public delivery inspection requires exact registered Scene V2 roots",
    )
  }
  return verifyVNextTextBlockSceneDeliveryPlanCandidateInternalV2(input)
}

function completeDeliveryIssue(
  path: string,
  message: string,
): VNextTextBlockUnifiedLayoutIssueV1 {
  return {
    code: "atomic-acceptance-failed",
    severity: "error",
    stage: "scene",
    path,
    message,
  }
}

function blockedCompleteDelivery(
  item: VNextTextBlockUnifiedLayoutIssueV1,
): VNextTextBlockCompleteSceneDeliveryResultV2 {
  return Object.freeze({
    status: "blocked",
    delivery: null,
    issues: Object.freeze([item]),
  })
}

function collectCompleteDeliveryChunks(
  root: VNextTextBlockPersistentSceneRootV2,
): {
  readonly chunks: readonly VNextTextBlockPersistentSceneChunkV2[]
  readonly visitedSceneNodeCount: number
} {
  const chunks: VNextTextBlockPersistentSceneChunkV2[] = []
  let visitedSceneNodeCount = 0
  const visit = (node: VNextTextBlockPersistentSceneRootV2): void => {
    visitedSceneNodeCount += 1
    if (node.nodeKind === "empty") return
    if (node.nodeKind === "leaf") {
      chunks.push(node.chunk)
      return
    }
    for (const child of node.children) visit(child)
  }
  visit(root)
  return { chunks, visitedSceneNodeCount }
}

export function prepareVNextTextBlockPersistentSceneCompleteDeliveryInternalV2(
  input: {
    readonly persistentScene: VNextTextBlockPersistentSceneV2
    readonly rootFingerprint: string
  },
): VNextTextBlockCompleteSceneDeliveryResultV2
export function prepareVNextTextBlockPersistentSceneCompleteDeliveryInternalV2(
  input: unknown,
): VNextTextBlockCompleteSceneDeliveryResultV2
export function prepareVNextTextBlockPersistentSceneCompleteDeliveryInternalV2(
  input: unknown,
): VNextTextBlockCompleteSceneDeliveryResultV2 {
  const exact = exactRecord(input, [
    "persistentScene",
    "rootFingerprint",
  ])
  if (
    exact == null
    || typeof exact.rootFingerprint !== "string"
    || !/^sha256:[a-f0-9]{64}$/u.test(exact.rootFingerprint)
    || !hasVNextTextBlockPersistentScenePreparedCandidateInternalV2(
      exact.persistentScene,
    )
  ) {
    return blockedCompleteDelivery(completeDeliveryIssue(
      "input",
      "complete delivery requires an exact prepared scene and Root V2 fingerprint",
    ))
  }
  try {
    const scene = exact.persistentScene
    const emitted = collectCompleteDeliveryChunks(scene.root)
    const work = {
      completeDeliveryCount: 1 as const,
      visitedSceneNodeCount: emitted.visitedSceneNodeCount,
      emittedChunkCount: emitted.chunks.length,
      estimatedCanonicalPayloadByteCount:
        scene.summary.estimatedCanonicalPayloadByteCount,
    }
    const facts = {
      source: "vnext-text-block-complete-scene-delivery-v2" as const,
      contractVersion: 2 as const,
      rootFingerprint: exact.rootFingerprint,
      persistentSceneFingerprint: scene.fingerprint,
      chunks: emitted.chunks,
      summary: scene.summary,
      work,
      stagedEditorApply: false as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    }
    const delivery = deepFreeze({
      ...facts,
      fingerprint: fingerprint(facts),
    })
    return Object.freeze({
      status: "accepted",
      delivery,
      issues: Object.freeze([]) as readonly [],
    })
  } catch {
    return blockedCompleteDelivery(completeDeliveryIssue(
      "persistentScene",
      "complete delivery exceeded safe traversal or canonical arithmetic",
    ))
  }
}
