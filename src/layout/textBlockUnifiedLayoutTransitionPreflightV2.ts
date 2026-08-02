import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type { VNextTextBlockUnifiedLayoutChangeV1, VNextTextBlockSourceRangeV1 } from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockTransitionEvidenceRequestV2,
  VNextTextBlockTransitionProducerLaneMaterialV2,
  VNextTextBlockTransitionProducerLaneRangesV2,
  VNextTextBlockTransitionProducerResolvedStyleV2,
  VNextTextBlockTransitionProducerSourceAtomV2,
  VNextTextBlockTransitionProducerSourceMaterialV2,
} from "./textBlockUnifiedLayoutEvidenceContractV2.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
} from "./textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  createVNextTextBlockTransitionReplacementSourceItemInternalV1,
  resolveVNextTextBlockRegisteredSourceStyleInternalV1,
  resolveVNextTextBlockSupportedStyleOverlayInternalV1,
  visitVNextTextBlockTransitionSourceCoverageInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import {
  visitVNextTextBlockTransitionFlowCoverageInternalV1,
} from "./textBlockIncrementalFlowTreeV1.js"
import type { VNextTextBlockUnifiedLayoutSourceItemV1, VNextTextBlockUnifiedLayoutSourceStyleV1 } from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type {
  VNextTextBlockExpectedTargetBindingV1,
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayoutEffectClassificationV1,
  VNextTextBlockUnifiedLayoutEligibilityV1,
  VNextTextBlockUnifiedLayoutIssueV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import type { VNextTextBlockUnifiedLayoutRootV2 } from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  composeVNextTextBlockStageWorkLedgerInternalV1,
  evaluateVNextTextBlockStageWorkLimitInternalV1,
  type VNextTextBlockUnifiedLayoutWorkPolicyV1,
} from "./textBlockUnifiedLayoutWorkPolicyV1.js"

export interface VNextTextBlockUnifiedLayoutChangePreflightV2 {
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly eligibility: VNextTextBlockUnifiedLayoutEligibilityV1
  readonly expectedTargetBinding: VNextTextBlockExpectedTargetBindingV1
  readonly effectClassification: VNextTextBlockUnifiedLayoutEffectClassificationV1
  readonly producerEvidence: "required" | "not-required"
  readonly previousRanges: VNextTextBlockTransitionProducerLaneRangesV2
  readonly nextRanges: VNextTextBlockTransitionProducerLaneRangesV2
  readonly replacementItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly fingerprint: string
}

export type VNextTextBlockUnifiedLayoutOwnedStageFailureV1 =
  | { readonly status: "fallback-required"; readonly evaluatorOrProofAuthority: object; readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1; readonly issues: readonly [] }
  | { readonly status: "blocked"; readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1; readonly issues: readonly VNextTextBlockUnifiedLayoutIssueV1[] }

export type VNextTextBlockTransitionPreflightResultV2 =
  | { readonly status: "required"; readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2; readonly request: VNextTextBlockTransitionEvidenceRequestV2; readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2; readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1; readonly issues: readonly [] }
  | { readonly status: "not-required"; readonly preflight: VNextTextBlockUnifiedLayoutChangePreflightV2; readonly request: null; readonly sourceMaterial: null; readonly completedCandidateWork: VNextTextBlockIncrementalCandidateWorkV1; readonly issues: readonly [] }
  | VNextTextBlockUnifiedLayoutOwnedStageFailureV1

const preflights = new WeakMap<object, { readonly request: VNextTextBlockTransitionEvidenceRequestV2 | null; readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2 | null }>()

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function freeze<T>(value: T): T {
  if (value != null && typeof value === "object") {
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor != null && Object.hasOwn(descriptor, "value")) freeze(descriptor.value)
    }
    if (!Object.isFrozen(value)) Object.freeze(value)
  }
  return value
}

function issue(code: VNextTextBlockUnifiedLayoutIssueV1["code"], path: string, message: string): VNextTextBlockUnifiedLayoutIssueV1 {
  return { code, severity: "error", stage: "evidence", path, message }
}

function emptyRanges(): VNextTextBlockTransitionProducerLaneRangesV2 {
  const zero = freeze({ startRenderedUtf16: 0, endRenderedUtf16: 0 })
  return freeze({ changedSourceRange: zero, evidenceTargetRange: zero, shapeVerificationRange: zero, coverageRange: zero })
}

function clamp(value: number, length: number): number { return Math.max(0, Math.min(value, length)) }
function range(startRenderedUtf16: number, endRenderedUtf16: number): VNextTextBlockSourceRangeV1 { return freeze({ startRenderedUtf16, endRenderedUtf16 }) }

function laneRanges(changed: VNextTextBlockSourceRangeV1, length: number): VNextTextBlockTransitionProducerLaneRangesV2 {
  const start = clamp(changed.startRenderedUtf16, length)
  const end = clamp(changed.endRenderedUtf16, length)
  // A zero-width deletion still receives one adjacent context code unit when available.
  const evidenceStart = start === end ? Math.max(0, start - 1) : start
  const evidenceEnd = start === end ? Math.min(length, end + 1) : end
  const evidence = range(evidenceStart, evidenceEnd)
  const shape = range(Math.max(0, evidenceStart - 1), Math.min(length, evidenceEnd + 1))
  const coverage = range(Math.max(0, shape.startRenderedUtf16 - 1), Math.min(length, shape.endRenderedUtf16 + 1))
  return freeze({ changedSourceRange: range(start, end), evidenceTargetRange: evidence, shapeVerificationRange: shape, coverageRange: coverage })
}

function sourceRangeForChange(root: VNextTextBlockUnifiedLayoutRootV2, change: VNextTextBlockUnifiedLayoutChangeV1): VNextTextBlockSourceRangeV1 | null {
  if (change.kind === "text-insertion") return range(change.atRenderedUtf16, change.atRenderedUtf16)
  if (change.kind === "text-deletion" || change.kind === "text-replacement") return change.removedRange
  if (change.kind === "supported-style-change") return change.range
  if (change.kind === "resolved-field-rendered-value-change") {
    const coverage = visitVNextTextBlockTransitionSourceCoverageInternalV1({
      sourceState: root.sourceState,
      range: range(0, root.sourceState.summary.renderedUtf16Length),
      beforeVisitNode: () => true,
      beforeEmitItem: () => true,
    })
    const field = coverage.status === "accepted" ? coverage.fragments.find((fragment) => fragment.item.kind === "resolved-field" && fragment.item.inlineId === change.inlineId && fragment.item.fieldKey === change.fieldKey) : null
    return field == null ? null : range(field.itemAbsoluteStartRenderedUtf16, field.itemAbsoluteEndRenderedUtf16)
  }
  return null
}

function styleV2(style: VNextTextBlockUnifiedLayoutSourceStyleV1, paragraphStyleKey: string): VNextTextBlockTransitionProducerResolvedStyleV2 {
  const facts = {
    measurementStyleKey: style.measurementStyleKey,
    effectiveShapingStyleKey: style.effectiveShapingStyleKey,
    paragraphStyleKey,
    fontFamilyKey: style.fontFamilyKey,
    fontFaceId: style.fontFaceId,
    fontSizeLayoutUnit: style.fontSizeLayoutUnit,
    textColor: style.textColor,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    strikethrough: style.strikethrough,
  }
  return freeze({ ...facts, fingerprint: fingerprint(facts) })
}

function atomFromItem(
  item: VNextTextBlockUnifiedLayoutSourceItemV1,
  itemAbsoluteStart: number,
  selectedAbsoluteStart: number,
  selectedAbsoluteEnd: number,
  outputAbsoluteStart: number,
  laneStart: number,
  paragraphStyleKey: string,
): VNextTextBlockTransitionProducerSourceAtomV2 {
  const renderedText = item.renderedText.slice(
    selectedAbsoluteStart - itemAbsoluteStart,
    selectedAbsoluteEnd - itemAbsoluteStart,
  )
  const base = {
    relativeStartRenderedUtf16: outputAbsoluteStart - laneStart,
    relativeEndRenderedUtf16:
      outputAbsoluteStart + renderedText.length - laneStart,
    renderedText,
    inlineId: item.inlineId,
    sourceFingerprint: item.sourceFingerprint,
    provenanceFingerprint: item.provenanceFingerprint,
  }
  const variant = item.kind === "text" ? { kind: "text" as const, resolvedStyle: styleV2(item.style, paragraphStyleKey) }
    : item.kind === "resolved-field" ? { kind: "resolved-field" as const, fieldKey: item.fieldKey, resolvedStyle: styleV2(item.style, paragraphStyleKey) }
      : item.kind === "generated-page-number" ? { kind: "generated-page-number" as const, generatedOwnerFingerprint: item.generatedOwnerFingerprint, resolvedStyle: styleV2(item.style, paragraphStyleKey) }
        : item.kind === "hard-break" ? { kind: "hard-break" as const, boundaryFingerprint: item.boundaryFingerprint }
          : { kind: "inline-image-boundary" as const, boundaryFingerprint: item.boundaryFingerprint }
  return freeze({ ...base, ...variant, fingerprint: fingerprint({ ...base, ...variant }) }) as VNextTextBlockTransitionProducerSourceAtomV2
}

function requestedWork(base: VNextTextBlockIncrementalCandidateWorkV1, policy: VNextTextBlockUnifiedLayoutWorkPolicyV1, lookup: number, atoms: number, requestedAtoms: number, requestedClusters: number): VNextTextBlockIncrementalCandidateWorkV1 {
  return freeze({
    ...base,
    evidence: { ...base.evidence, requestCount: 1, visitedRequestLookupNodeCount: lookup, materializedContextAtomCount: atoms, requestedAtomCount: requestedAtoms, requestedClusterCount: requestedClusters },
    stageWork: composeVNextTextBlockStageWorkLedgerInternalV1({ policy, factualCounts: [
      { stage: "evidence", unit: "evidence-request-lookup-nodes", count: lookup },
      { stage: "evidence", unit: "evidence-context-atoms", count: atoms },
    ] }),
  })
}

function evaluatedLimit(policy: VNextTextBlockUnifiedLayoutWorkPolicyV1, root: VNextTextBlockUnifiedLayoutRootV2, unit: "evidence-request-lookup-nodes" | "evidence-context-atoms" | "evidence-response-nodes", attempted: number) {
  return evaluateVNextTextBlockStageWorkLimitInternalV1({ policy, stage: "evidence", unit, previousSummaryBase: root.sourceState.summary.itemCount, exactValidatedChangeDelta: 1, attemptedWork: attempted })
}

/** Private Core transition owner seam. It never accepts producer output or builds a next tree. */
export function prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockTransitionPreflightResultV2 {
  const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1(input)
  if (bound.status !== "accepted") return freeze({ status: "blocked" as const, completedCandidateWork: bound.incrementalCandidateWork, issues: bound.issues })
  const { validatedChange } = bound
  const equalRenderedField = validatedChange.change.kind === "resolved-field-rendered-value-change"
    && (() => {
      const changedRange = sourceRangeForChange(input.previousRoot, validatedChange.change)
      if (changedRange == null) return false
      const covered = visitVNextTextBlockTransitionSourceCoverageInternalV1({
        sourceState: input.previousRoot.sourceState,
        range: changedRange,
        beforeVisitNode: () => true,
        beforeEmitItem: () => true,
      })
      const item = covered.status === "accepted" ? covered.fragments[0]?.item : null
      return item?.kind === "resolved-field"
        && item.renderedText === validatedChange.change.nextRenderedText
    })()
  const producerEvidence = equalRenderedField ? "not-required" as const : validatedChange.producerEvidence
  const effectClassification = equalRenderedField
    ? freeze({
        effectClass: "semantic-only-change" as const,
        semanticIdentityChanged: true,
        fingerprint: fingerprint({
          effectClass: "semantic-only-change",
          semanticIdentityChanged: true,
          validatedChangeFingerprint: validatedChange.fingerprint,
        }),
      })
    : validatedChange.effectClassification
  if (producerEvidence === "not-required") {
    const ranges = emptyRanges()
    const preflight = freeze({ change: validatedChange.change, eligibility: validatedChange.eligibility, expectedTargetBinding: validatedChange.expectedTargetBinding, effectClassification, producerEvidence, previousRanges: ranges, nextRanges: ranges, replacementItems: freeze([]), fingerprint: fingerprint({ changeFingerprint: validatedChange.fingerprint, ranges, effectClassification }) })
    preflights.set(preflight, { request: null, sourceMaterial: null })
    return freeze({ status: "not-required" as const, preflight, request: null, sourceMaterial: null, completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([]) })
  }
  const sourceRange = sourceRangeForChange(input.previousRoot, validatedChange.change)
  const previousLength = input.previousRoot.sourceState.summary.renderedUtf16Length
  if (sourceRange == null || sourceRange.startRenderedUtf16 < 0 || sourceRange.endRenderedUtf16 < sourceRange.startRenderedUtf16 || sourceRange.endRenderedUtf16 > previousLength) {
    return freeze({ status: "blocked" as const, completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([issue("invalid-change-range", "change", "preflight requires one safe bounded source range")]) })
  }
  let replacementItems: readonly VNextTextBlockUnifiedLayoutSourceItemV1[] = freeze([])
  if (validatedChange.change.kind === "text-insertion" || validatedChange.change.kind === "text-replacement") {
    const resolved = resolveVNextTextBlockRegisteredSourceStyleInternalV1({ sourceState: input.previousRoot.sourceState, measurementStyleKey: validatedChange.change.measurementStyleKey, effectiveShapingStyleKey: validatedChange.change.effectiveShapingStyleKey })
    if (resolved.status !== "resolved") return freeze({ status: "blocked" as const, completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([issue(resolved.status === "ambiguous" ? "style-authority-ambiguous" : "unsupported-change-value", "change", "inserted text must use one exact registered Source State style")]) })
    const item = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
      sourceState: input.previousRoot.sourceState,
      kind: "text",
      renderedText: validatedChange.change.insertedText,
      lineageId: validatedChange.change.insertedSource.lineageId,
      inlineId: validatedChange.change.insertedSource.lineageId,
      sourceFingerprint: validatedChange.change.insertedSource.sourceFingerprint,
      provenanceFingerprint:
        validatedChange.change.insertedSource.provenanceFingerprint,
      style: resolved.style,
    })
    if (item == null) return freeze({ status: "blocked" as const, completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([issue("unsupported-change-value", "change", "inserted text could not produce canonical Source facts")]) })
    replacementItems = freeze([item])
  } else if (validatedChange.change.kind === "resolved-field-rendered-value-change") {
    const fieldChange = validatedChange.change
    const fieldCoverage = visitVNextTextBlockTransitionSourceCoverageInternalV1({
      sourceState: input.previousRoot.sourceState,
      range: sourceRange,
      beforeVisitNode: () => true,
      beforeEmitItem: () => true,
    })
    const previousField = fieldCoverage.status === "accepted"
      ? fieldCoverage.fragments.find((fragment) =>
          fragment.item.kind === "resolved-field"
          && fragment.item.inlineId === fieldChange.inlineId
          && fragment.item.fieldKey === fieldChange.fieldKey
        )?.item
      : null
    if (previousField?.kind !== "resolved-field") return freeze({ status: "blocked" as const, completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([issue("change-target-mismatch", "change", "resolved field change requires the exact previous field item")]) })
    const item = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
      sourceState: input.previousRoot.sourceState,
      kind: "resolved-field",
      fieldKey: previousField.fieldKey,
      renderedText: fieldChange.nextRenderedText,
      lineageId: fieldChange.nextSource.lineageId,
      inlineId: previousField.inlineId,
      sourceFingerprint: fieldChange.nextSource.sourceFingerprint,
      provenanceFingerprint:
        fieldChange.nextSource.provenanceFingerprint,
      style: previousField.style,
    })
    if (item == null) return freeze({ status: "blocked" as const, completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([issue("unsupported-change-value", "change", "resolved field change could not produce canonical Source facts")]) })
    replacementItems = freeze([item])
  } else if (validatedChange.change.kind === "supported-style-change") {
    const styleCoverage = visitVNextTextBlockTransitionSourceCoverageInternalV1({
      sourceState: input.previousRoot.sourceState,
      range: sourceRange,
      beforeVisitNode: () => true,
      beforeEmitItem: () => true,
    })
    if (styleCoverage.status !== "accepted" || styleCoverage.fragments.length === 0) {
      return freeze({ status: "blocked" as const, completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([issue("change-target-mismatch", "change", "style change requires bounded text Source facts")]) })
    }
    const items: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
    for (const fragment of styleCoverage.fragments) {
      if (fragment.item.kind !== "text") {
        return freeze({ status: "blocked" as const, completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([issue("unsupported-change-value", "change", "supported style changes may cover only text Source items")]) })
      }
      const resolved = resolveVNextTextBlockSupportedStyleOverlayInternalV1({
        sourceState: input.previousRoot.sourceState,
        baseStyle: fragment.item.style,
        nextStyle: validatedChange.change.nextStyle,
      })
      if (resolved.status !== "resolved") {
        return freeze({ status: "blocked" as const, completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([issue(resolved.status === "ambiguous" ? "style-authority-ambiguous" : "unsupported-change-value", "change", "style overlay must resolve against exact Source style and font authority")]) })
      }
      const renderedText = fragment.item.renderedText.slice(
        fragment.selectedAbsoluteStartRenderedUtf16
          - fragment.itemAbsoluteStartRenderedUtf16,
        fragment.selectedAbsoluteEndRenderedUtf16
          - fragment.itemAbsoluteStartRenderedUtf16,
      )
      const item = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
        sourceState: input.previousRoot.sourceState,
        kind: "text",
        renderedText,
        lineageId: fragment.item.lineageId,
        inlineId: fragment.item.inlineId,
        sourceFingerprint: null,
        provenanceFingerprint:
          validatedChange.change.nextStyleProvenanceFingerprint,
        style: resolved.style,
      })
      if (item == null) return freeze({ status: "blocked" as const, completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([issue("unsupported-change-value", "change", "style overlay could not produce canonical Source facts")]) })
      items.push(item)
    }
    replacementItems = freeze(items)
  }
  const replacementLength = replacementItems.reduce(
    (sum, item) => sum + item.renderedUtf16Length,
    0,
  )
  const nextLength = previousLength
    - (sourceRange.endRenderedUtf16 - sourceRange.startRenderedUtf16)
    + replacementLength
  if (!Number.isSafeInteger(nextLength) || nextLength < 1) return freeze({ status: "blocked" as const, completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([issue("unsupported-change-value", "change", "preflight cannot produce an empty source topology")]) })
  const nextChanged = range(sourceRange.startRenderedUtf16, sourceRange.startRenderedUtf16 + replacementLength)
  const previousRanges = laneRanges(sourceRange, previousLength)
  const nextRanges = laneRanges(nextChanged, nextLength)
  const lookupLimit = evaluatedLimit(input.workPolicy, input.previousRoot, "evidence-request-lookup-nodes", 1)
  if (lookupLimit.status !== "within-limit") return freeze({ status: "fallback-required" as const, evaluatorOrProofAuthority: freeze({}), completedCandidateWork: bound.incrementalCandidateWork, issues: freeze([]) })
  let visitedNodes = 0
  let emittedAtoms = 0
  const sourceCoverage = visitVNextTextBlockTransitionSourceCoverageInternalV1({
    sourceState: input.previousRoot.sourceState,
    range: previousRanges.coverageRange,
    beforeVisitNode: () => { visitedNodes += 1; return evaluatedLimit(input.workPolicy, input.previousRoot, "evidence-request-lookup-nodes", visitedNodes).status === "within-limit" },
    beforeEmitItem: () => { emittedAtoms += 1; return evaluatedLimit(input.workPolicy, input.previousRoot, "evidence-context-atoms", emittedAtoms).status === "within-limit" },
  })
  const flowCoverage = visitVNextTextBlockTransitionFlowCoverageInternalV1({
    flowTree: input.previousRoot.flowTree,
    range: previousRanges.shapeVerificationRange,
    beforeVisitNode: () => true,
    beforeEmitAtom: () => true,
  })
  const work = requestedWork(bound.incrementalCandidateWork, input.workPolicy, visitedNodes, emittedAtoms, 0, flowCoverage.status === "accepted" ? flowCoverage.fragments.length : 0)
  if (sourceCoverage.status !== "accepted" || flowCoverage.status !== "accepted") return freeze({ status: "fallback-required" as const, evaluatorOrProofAuthority: freeze({}), completedCandidateWork: work, issues: freeze([]) })
  const paragraphStyleKey = input.previousRoot.sourceState.producerRequirements.paragraphStyle.styleKey
  const previousAtoms = sourceCoverage.fragments.map((fragment) => atomFromItem(fragment.item, fragment.itemAbsoluteStartRenderedUtf16, fragment.selectedAbsoluteStartRenderedUtf16, fragment.selectedAbsoluteEndRenderedUtf16, fragment.selectedAbsoluteStartRenderedUtf16, previousRanges.coverageRange.startRenderedUtf16, paragraphStyleKey))
  const lane = (ranges: VNextTextBlockTransitionProducerLaneRangesV2, atoms: readonly VNextTextBlockTransitionProducerSourceAtomV2[]): VNextTextBlockTransitionProducerLaneMaterialV2 => freeze({ ranges, atoms: freeze([...atoms]), fingerprint: fingerprint({ ranges, atoms }) })
  const previous = lane(previousRanges, previousAtoms)
  const nextAtoms: VNextTextBlockTransitionProducerSourceAtomV2[] = []
  const append = (inputAtom: {
    readonly item: VNextTextBlockUnifiedLayoutSourceItemV1
    readonly itemAbsoluteStart: number
    readonly selectedAbsoluteStart: number
    readonly selectedAbsoluteEnd: number
    readonly outputAbsoluteStart: number
  }): void => {
    const outputAbsoluteEnd = inputAtom.outputAbsoluteStart
      + inputAtom.selectedAbsoluteEnd - inputAtom.selectedAbsoluteStart
    const clippedOutputStart = Math.max(
      inputAtom.outputAbsoluteStart,
      nextRanges.coverageRange.startRenderedUtf16,
    )
    const clippedOutputEnd = Math.min(
      outputAbsoluteEnd,
      nextRanges.coverageRange.endRenderedUtf16,
    )
    if (clippedOutputEnd <= clippedOutputStart) return
    const sourceClip = clippedOutputStart - inputAtom.outputAbsoluteStart
    nextAtoms.push(atomFromItem(
      inputAtom.item,
      inputAtom.itemAbsoluteStart,
      inputAtom.selectedAbsoluteStart + sourceClip,
      inputAtom.selectedAbsoluteStart + sourceClip
        + clippedOutputEnd - clippedOutputStart,
      clippedOutputStart,
      nextRanges.coverageRange.startRenderedUtf16,
      paragraphStyleKey,
    ))
  }
  let emittedReplacement = false
  const emitReplacement = (): void => {
    if (emittedReplacement) return
    emittedReplacement = true
    let outputStart = sourceRange.startRenderedUtf16
    for (const item of replacementItems) {
      append({
        item,
        itemAbsoluteStart: 0,
        selectedAbsoluteStart: 0,
        selectedAbsoluteEnd: item.renderedUtf16Length,
        outputAbsoluteStart: outputStart,
      })
      outputStart += item.renderedUtf16Length
    }
  }
  const delta = replacementLength
    - (sourceRange.endRenderedUtf16 - sourceRange.startRenderedUtf16)
  for (const fragment of sourceCoverage.fragments) {
    const start = fragment.selectedAbsoluteStartRenderedUtf16
    const end = fragment.selectedAbsoluteEndRenderedUtf16
    if (end <= sourceRange.startRenderedUtf16) {
      append({ item: fragment.item, itemAbsoluteStart: fragment.itemAbsoluteStartRenderedUtf16, selectedAbsoluteStart: start, selectedAbsoluteEnd: end, outputAbsoluteStart: start })
      continue
    }
    if (start >= sourceRange.endRenderedUtf16) {
      emitReplacement()
      append({ item: fragment.item, itemAbsoluteStart: fragment.itemAbsoluteStartRenderedUtf16, selectedAbsoluteStart: start, selectedAbsoluteEnd: end, outputAbsoluteStart: start + delta })
      continue
    }
    if (start < sourceRange.startRenderedUtf16) {
      append({ item: fragment.item, itemAbsoluteStart: fragment.itemAbsoluteStartRenderedUtf16, selectedAbsoluteStart: start, selectedAbsoluteEnd: sourceRange.startRenderedUtf16, outputAbsoluteStart: start })
    }
    emitReplacement()
    if (end > sourceRange.endRenderedUtf16) {
      append({ item: fragment.item, itemAbsoluteStart: fragment.itemAbsoluteStartRenderedUtf16, selectedAbsoluteStart: sourceRange.endRenderedUtf16, selectedAbsoluteEnd: end, outputAbsoluteStart: sourceRange.endRenderedUtf16 + delta })
    }
  }
  emitReplacement()
  nextAtoms.sort((left, right) =>
    left.relativeStartRenderedUtf16 - right.relativeStartRenderedUtf16
  )
  const next = lane(nextRanges, nextAtoms)
  const preflight = freeze({ change: validatedChange.change, eligibility: validatedChange.eligibility, expectedTargetBinding: validatedChange.expectedTargetBinding, effectClassification, producerEvidence, previousRanges, nextRanges, replacementItems, fingerprint: fingerprint({ changeFingerprint: validatedChange.fingerprint, previousRanges, nextRanges, effectClassification }) })
  const responseLimit = evaluatedLimit(input.workPolicy, input.previousRoot, "evidence-response-nodes", 0)
  if (responseLimit.status !== "within-limit") return freeze({ status: "fallback-required" as const, evaluatorOrProofAuthority: freeze({}), completedCandidateWork: work, issues: freeze([]) })
  const requestFacts = { source: "vnext-text-block-transition-evidence-request-v2" as const, contractVersion: 2 as const, previousRootFingerprint: input.previousRoot.fingerprint, changeFingerprint: validatedChange.fingerprint, documentId: input.previousRoot.documentId, sectionId: input.previousRoot.sectionId, textBlockId: input.previousRoot.textBlockId, previous: previousRanges, next: nextRanges, nextSegmentationContextRanges: freeze([nextRanges.shapeVerificationRange]), requiredStableSegmentationExpansionCount: 1, fontStyleUnitDependencyFingerprint: input.previousRoot.sourceState.producerRequirements.fontStyleUnitDependencyFingerprint, producerRuntimeRequirementFingerprint: input.previousRoot.sourceState.producerRequirements.producerRuntimeRequirementFingerprint, layoutUnitPolicyFingerprint: input.previousRoot.sourceState.producerRequirements.layoutUnitPolicyFingerprint, workPolicyFingerprint: input.workPolicy.fingerprint }
  const request = freeze({ ...requestFacts, fingerprint: fingerprint(requestFacts) })
  const materialFacts = { source: "vnext-text-block-transition-producer-source-material-v2" as const, contractVersion: 2 as const, requestFingerprint: request.fingerprint, previous, next, paragraphStyleKey, fontFaces: input.previousRoot.sourceState.producerRequirements.fontFaces, layoutUnitPolicyFingerprint: input.previousRoot.sourceState.producerRequirements.layoutUnitPolicyFingerprint, sourceTopologyFingerprint: input.previousRoot.sourceState.summary.sourceFingerprint, producerWorkCeilings: { maximumVisitedEvidenceNodeCount: responseLimit.effectiveLimit, maximumRequestedAtomCount: previous.atoms.length + next.atoms.length, maximumRequestedClusterCount: flowCoverage.status === "accepted" ? flowCoverage.fragments.reduce((sum, fragment) => sum + [...fragment.atom.renderedText].length, 0) : 0 } }
  const sourceMaterial = freeze({ ...materialFacts, fingerprint: fingerprint(materialFacts) })
  preflights.set(preflight, { request, sourceMaterial })
  return freeze({ status: "required" as const, preflight, request, sourceMaterial, completedCandidateWork: work, issues: freeze([]) })
}
