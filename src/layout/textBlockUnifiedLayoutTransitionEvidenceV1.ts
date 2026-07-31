import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type {
  VNextTextBlockUnifiedLayoutChangeV1,
} from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockTransitionEvidenceAcceptanceResultV1,
  VNextTextBlockTransitionEvidenceInspectionV1,
  VNextTextBlockTransitionEvidenceRequestInspectionV1,
  VNextTextBlockTransitionEvidenceRequestResultV1,
  VNextTextBlockTransitionEvidenceV1,
  VNextTextBlockTransitionProducerResponseV1,
  VNextTextBlockTransitionProducerRuntimeIdentityV1,
} from "./textBlockUnifiedLayoutEvidenceContractV1.js"
import {
  deriveVNextTextBlockUnifiedLayoutImagePaintSummaryInternalV1,
  lookupVNextTextBlockUnifiedLayoutSourceItemByInlineIdInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"
import {
  createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1,
  validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1,
} from "./textBlockUnifiedLayoutTransitionChangeInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayoutEffectClassificationV1,
  VNextTextBlockExpectedTargetBindingV1,
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayoutIssueV1,
  VNextTextBlockValidatedChangeResultV1,
  VNextTextBlockValidatedChangeV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"
import {
  inspectVNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootV2.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "./textBlockUnifiedLayoutRootContractV2.js"
import {
  composeVNextTextBlockStageWorkLedgerInternalV1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
  type VNextTextBlockUnifiedLayoutWorkPolicyV1,
} from "./textBlockUnifiedLayoutWorkPolicyV1.js"
/*
 * Work policy remains an internal orchestration choice.  The public request
 * wrapper below always selects the locked checkpoint policy.
 */
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

function issue(
  code: VNextTextBlockUnifiedLayoutIssueV1["code"],
  stage: VNextTextBlockUnifiedLayoutIssueV1["stage"],
  path: string,
  message: string,
): VNextTextBlockUnifiedLayoutIssueV1 {
  return { code, severity: "error", stage, path, message }
}

function targetBinding(
  facts: Omit<VNextTextBlockExpectedTargetBindingV1, "fingerprint">,
): VNextTextBlockExpectedTargetBindingV1 {
  return Object.freeze({
    ...facts,
    fingerprint: fingerprint(facts),
  })
}

function targetBindingFacts(
  binding: VNextTextBlockExpectedTargetBindingV1,
): Omit<VNextTextBlockExpectedTargetBindingV1, "fingerprint"> {
  return {
    semanticFingerprint: binding.semanticFingerprint,
    renderedContentFingerprint: binding.renderedContentFingerprint,
    sourceFingerprint: binding.sourceFingerprint,
    provenanceFingerprint: binding.provenanceFingerprint,
    paintFingerprint: binding.paintFingerprint,
    layoutDependencyFingerprint: binding.layoutDependencyFingerprint,
    authoredBoxPlanFingerprint: binding.authoredBoxPlanFingerprint,
    spatialEntrySetFingerprint: binding.spatialEntrySetFingerprint,
  }
}

export function deriveVNextTextBlockUnifiedLayoutEffectClassificationInternalV1(
  input: {
    readonly previousTargetBinding: VNextTextBlockExpectedTargetBindingV1
    readonly expectedTargetBinding: VNextTextBlockExpectedTargetBindingV1
    readonly requiresGeometryRecomputation: boolean
  },
): VNextTextBlockUnifiedLayoutEffectClassificationV1 {
  const previous = input.previousTargetBinding
  const expected = input.expectedTargetBinding
  const semanticIdentityChanged =
    previous.semanticFingerprint !== expected.semanticFingerprint
    || previous.sourceFingerprint !== expected.sourceFingerprint
    || previous.provenanceFingerprint !== expected.provenanceFingerprint
  const geometryChanged = input.requiresGeometryRecomputation
    || previous.renderedContentFingerprint
      !== expected.renderedContentFingerprint
    || previous.layoutDependencyFingerprint
      !== expected.layoutDependencyFingerprint
    || previous.authoredBoxPlanFingerprint
      !== expected.authoredBoxPlanFingerprint
    || previous.spatialEntrySetFingerprint
      !== expected.spatialEntrySetFingerprint
  const effectClass = geometryChanged
    ? "geometry-affecting-change" as const
    : previous.paintFingerprint !== expected.paintFingerprint
      ? "paint-affecting-change" as const
      : semanticIdentityChanged
        ? "semantic-only-change" as const
        : "true-no-op" as const
  return Object.freeze({
    effectClass,
    semanticIdentityChanged,
    fingerprint: fingerprint({
      effectClass,
      semanticIdentityChanged,
      previousTargetBindingFingerprint: previous.fingerprint,
      expectedTargetBindingFingerprint: expected.fingerprint,
    }),
  })
}

export function deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockExpectedTargetBindingV1 {
  return targetBinding({
    semanticFingerprint: root.sourceState.summary.semanticFingerprint,
    renderedContentFingerprint:
      root.sourceState.summary.contentFingerprint,
    sourceFingerprint: root.sourceState.summary.sourceFingerprint,
    provenanceFingerprint:
      root.sourceState.summary.provenanceFingerprint,
    paintFingerprint: root.sourceState.summary.paintFingerprint,
    layoutDependencyFingerprint:
      root.sourceState.summary.layoutDependencyFingerprint,
    authoredBoxPlanFingerprint:
      root.sourceState.authoredBoxPlan.fingerprint,
    spatialEntrySetFingerprint: root.spatialState.entrySetFingerprint,
  })
}

function targetBindingForChange(
  root: VNextTextBlockUnifiedLayoutRootV2,
  change: VNextTextBlockUnifiedLayoutChangeV1,
  previous: VNextTextBlockExpectedTargetBindingV1,
  captureImagePaintSourceWork: (work: {
    readonly authority: object | null
    readonly visitedSourceLookupNodeCount: number
    readonly visitedSourceItemCount: number
  }) => void,
): VNextTextBlockExpectedTargetBindingV1 | null {
  if (change.kind === "no-op") return previous
  if (change.kind === "image-paint-fact-change") {
    const derived =
      deriveVNextTextBlockUnifiedLayoutImagePaintSummaryInternalV1({
        sourceState: root.sourceState,
        inlineId: change.inlineId,
        expectedImageSourceFingerprint:
          change.expectedImageSourceFingerprint,
        expectedImageDependencyFingerprint:
          change.expectedImageDependencyFingerprint,
        nextFit: change.nextFit,
        nextCrop: change.nextCrop,
      })
    captureImagePaintSourceWork({
      authority: derived.sourceItemAuthority,
      visitedSourceLookupNodeCount:
        derived.visitedSourceLookupNodeCount,
      visitedSourceItemCount: derived.visitedSourceItemCount,
    })
    if (derived.status !== "accepted") return null
    return targetBinding({
      ...targetBindingFacts(previous),
      paintFingerprint: derived.paintFingerprint,
    })
  }
  if (change.kind === "authored-box-width-inset-change") {
    if (
      change.expectedAuthoredBoxPlanFingerprint
      !== previous.authoredBoxPlanFingerprint
    ) return null
    return targetBinding({
      ...targetBindingFacts(previous),
      authoredBoxPlanFingerprint: change.nextAuthoredBoxPlan.fingerprint,
    })
  }
  const changeFingerprint = fingerprint(change)
  const changed = (component: string, prior: string): string =>
    fingerprint({ component, prior, changeFingerprint })
  if (
    change.kind === "exclusion-insertion"
    || change.kind === "exclusion-deletion"
    || change.kind === "exclusion-movement"
    || change.kind === "exclusion-resize"
  ) {
    return targetBinding({
      ...targetBindingFacts(previous),
      spatialEntrySetFingerprint: changed(
        "spatial-entry-set",
        previous.spatialEntrySetFingerprint,
      ),
    })
  }
  if (
    change.kind === "image-frame-resize"
    || change.kind === "image-vertical-alignment-change"
  ) {
    return targetBinding({
      ...targetBindingFacts(previous),
      layoutDependencyFingerprint: changed(
        "layout-dependency",
        previous.layoutDependencyFingerprint,
      ),
    })
  }
  if (
    change.kind === "inline-image-insertion"
    || change.kind === "inline-image-deletion"
    || change.kind === "inline-image-movement"
  ) {
    return targetBinding({
      ...targetBindingFacts(previous),
      semanticFingerprint: changed(
        "semantic",
        previous.semanticFingerprint,
      ),
      renderedContentFingerprint: changed(
        "content",
        previous.renderedContentFingerprint,
      ),
      sourceFingerprint: changed("source", previous.sourceFingerprint),
      provenanceFingerprint: changed(
        "provenance",
        previous.provenanceFingerprint,
      ),
      layoutDependencyFingerprint: changed(
        "layout-dependency",
        previous.layoutDependencyFingerprint,
      ),
    })
  }
  return targetBinding({
    ...targetBindingFacts(previous),
    semanticFingerprint: changed(
      "semantic",
      previous.semanticFingerprint,
    ),
    renderedContentFingerprint: changed(
      "content",
      previous.renderedContentFingerprint,
    ),
    sourceFingerprint: changed("source", previous.sourceFingerprint),
    provenanceFingerprint: changed(
      "provenance",
      previous.provenanceFingerprint,
    ),
    paintFingerprint: change.kind === "supported-style-change"
      ? changed("paint", previous.paintFingerprint)
      : previous.paintFingerprint,
    layoutDependencyFingerprint: changed(
      "layout-dependency",
      previous.layoutDependencyFingerprint,
    ),
  })
}

const validatedImagePaintSourceItemAuthorities = new WeakMap<
  VNextTextBlockValidatedChangeV1,
  {
    readonly authority: object
    readonly visitedSourceLookupNodeCount: number
    readonly visitedSourceItemCount: number
  }
>()

export interface VNextTextBlockValidatedChangeAuthorityRecordInternalV1 {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly originalChange: VNextTextBlockUnifiedLayoutChangeV1
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly expectedTargetBinding: VNextTextBlockExpectedTargetBindingV1
  readonly bindingWork: VNextTextBlockIncrementalCandidateWorkV1
}

const validatedChangeAuthorityRecords = new WeakMap<
  VNextTextBlockValidatedChangeV1,
  VNextTextBlockValidatedChangeAuthorityRecordInternalV1
>()

export function getVNextTextBlockValidatedChangeAuthorityRecordInternalV1(
  validatedChange: VNextTextBlockValidatedChangeV1,
): VNextTextBlockValidatedChangeAuthorityRecordInternalV1 | null {
  return validatedChangeAuthorityRecords.get(validatedChange) ?? null
}

export function getVNextTextBlockValidatedImagePaintSourceItemAuthorityInternalV1(
  validatedChange: VNextTextBlockValidatedChangeV1,
): object | null {
  return validatedImagePaintSourceItemAuthorities.get(validatedChange)
    ?.authority ?? null
}

function producerEvidenceRequired(
  change: VNextTextBlockUnifiedLayoutChangeV1,
): boolean {
  return change.kind === "text-insertion"
    || change.kind === "text-deletion"
    || change.kind === "text-replacement"
    || change.kind === "resolved-field-rendered-value-change"
    || change.kind === "supported-style-change"
}

function requiresGeometryRecomputation(
  change: VNextTextBlockUnifiedLayoutChangeV1,
): boolean {
  return change.kind !== "no-op" && change.kind !== "image-paint-fact-change"
}

function blockedBinding(
  work: VNextTextBlockIncrementalCandidateWorkV1,
  item: VNextTextBlockUnifiedLayoutIssueV1,
): VNextTextBlockValidatedChangeResultV1 {
  return Object.freeze({
    status: "blocked",
    stage: item.stage,
    change: null,
    incrementalCandidateWork: work,
    issues: Object.freeze([item]),
  })
}

export function bindVNextTextBlockUnifiedLayoutChangeInternalV1(input: {
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockValidatedChangeResultV1 {
  const shaped =
    validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1(input.change)
  if (shaped.status !== "accepted") return shaped
  if (
    inspectVNextTextBlockUnifiedLayoutRootV2(
      input.previousRoot,
    ).status !== "valid"
  ) {
    return blockedBinding(shaped.incrementalCandidateWork, issue(
      "previous-root-authority-mismatch",
      "change-gate",
      "previousRoot",
      "change binding requires the exact registered Root V2",
    ))
  }
  if (input.workPolicy !== input.previousRoot.workPolicy) {
    return blockedBinding(shaped.incrementalCandidateWork, issue(
      "invalid-work-policy",
      "change-gate",
      "workPolicy",
      "change binding requires the exact Root-owned work policy",
    ))
  }
  const change = shaped.change
  if (
    change.documentId !== input.previousRoot.documentId
    || change.sectionId !== input.previousRoot.sectionId
    || change.textBlockId !== input.previousRoot.textBlockId
  ) {
    return blockedBinding(shaped.incrementalCandidateWork, issue(
      "change-target-mismatch",
      "change-gate",
      "change",
      "change identity does not target the exact previous Root",
    ))
  }
  if (
    change.expectedPreviousRootFingerprint
      !== input.previousRoot.fingerprint
    || change.expectedPreviousSourceFingerprint
      !== input.previousRoot.sourceState.fingerprint
  ) {
    return blockedBinding(shaped.incrementalCandidateWork, issue(
      "stale-previous-root",
      "change-gate",
      "expectedPreviousRootFingerprint",
      "change previous-root/source expectations are stale",
    ))
  }
  const previousTargetBinding =
    deriveVNextTextBlockExpectedTargetBindingFromRootInternalV1(
      input.previousRoot,
    )
  const imagePaintSourceCapture: {
    current: {
      readonly authority: object | null
      readonly visitedSourceLookupNodeCount: number
      readonly visitedSourceItemCount: number
    } | null
  } = { current: null }
  const expectedTargetBinding = targetBindingForChange(
    input.previousRoot,
    change,
    previousTargetBinding,
    (work) => {
      imagePaintSourceCapture.current = work
    },
  )
  const imagePaintSourceWork = imagePaintSourceCapture.current
  const incrementalCandidateWork = imagePaintSourceWork == null
    ? shaped.incrementalCandidateWork
    : deepFreeze({
        ...shaped.incrementalCandidateWork,
        flow: {
          ...shaped.incrementalCandidateWork.flow,
          visitedSourceItemCount:
            imagePaintSourceWork.visitedSourceItemCount,
          visitedSourceLookupNodeCount:
            imagePaintSourceWork.visitedSourceLookupNodeCount,
        },
        stageWork: composeVNextTextBlockStageWorkLedgerInternalV1({
          policy: input.workPolicy,
          factualCounts: imagePaintSourceWork.visitedSourceItemCount === 0
            ? []
            : [{
                stage: "source-flow" as const,
                unit: "source-items" as const,
                count: imagePaintSourceWork.visitedSourceItemCount,
              }],
        }),
      })
  if (expectedTargetBinding == null) {
    return blockedBinding(incrementalCandidateWork, issue(
      "change-target-mismatch",
      "change-gate",
      "change",
      "change preconditions do not match exact previous source facts",
    ))
  }
  const producerEvidence = producerEvidenceRequired(change)
    ? "required" as const
    : "not-required" as const
  const eligibility = shaped.eligibility
  const effectClassification =
    deriveVNextTextBlockUnifiedLayoutEffectClassificationInternalV1({
      previousTargetBinding,
      expectedTargetBinding,
      requiresGeometryRecomputation: requiresGeometryRecomputation(change),
    })
  const facts = {
    change,
    eligibility,
    producerEvidence,
    expectedTargetBinding,
    effectClassification,
  }
  const validatedChange: VNextTextBlockValidatedChangeV1 = Object.freeze({
    ...facts,
    fingerprint: fingerprint({
      changeFingerprint: shaped.fingerprint,
      eligibility,
      producerEvidence,
      expectedTargetBinding,
      effectClassification,
    }),
  })
  if (imagePaintSourceWork?.authority != null) {
    validatedImagePaintSourceItemAuthorities.set(
      validatedChange,
      {
        authority: imagePaintSourceWork.authority,
        visitedSourceLookupNodeCount:
          imagePaintSourceWork.visitedSourceLookupNodeCount,
        visitedSourceItemCount:
          imagePaintSourceWork.visitedSourceItemCount,
      },
    )
  }
  validatedChangeAuthorityRecords.set(validatedChange, Object.freeze({
    previousRoot: input.previousRoot,
    workPolicy: input.workPolicy,
    originalChange: input.change,
    validatedChange,
    expectedTargetBinding,
    bindingWork: incrementalCandidateWork,
  }))
  return Object.freeze({
    status: "accepted",
    validatedChange,
    incrementalCandidateWork,
    issues: Object.freeze([]) as readonly [],
  })
}

interface RequestRecord {
  readonly fingerprint: string
  readonly validatedChange: VNextTextBlockValidatedChangeV1
  readonly incrementalCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
}

const requestTuples = new WeakMap<
  object,
  WeakMap<
    VNextTextBlockUnifiedLayoutRootV2,
    WeakMap<VNextTextBlockUnifiedLayoutChangeV1, RequestRecord>
  >
>()
const evidenceRecords = new WeakMap<
  object,
  {
    readonly fingerprint: string
    readonly requestFingerprint: string
    readonly previousRootFingerprint: string
    readonly changeFingerprint: string
  }
>()
const runtimeIdentities = new WeakSet<
VNextTextBlockTransitionProducerRuntimeIdentityV1
>()

function changedRanges(
  root: VNextTextBlockUnifiedLayoutRootV2,
  change: VNextTextBlockUnifiedLayoutChangeV1,
): {
  readonly previousSourceRange: {
    readonly startRenderedUtf16: number
    readonly endRenderedUtf16: number
  }
  readonly nextSourceRange: {
    readonly startRenderedUtf16: number
    readonly endRenderedUtf16: number
  }
} | null {
  switch (change.kind) {
    case "text-insertion":
      return {
        previousSourceRange: {
          startRenderedUtf16: change.atRenderedUtf16,
          endRenderedUtf16: change.atRenderedUtf16,
        },
        nextSourceRange: {
          startRenderedUtf16: change.atRenderedUtf16,
          endRenderedUtf16:
            change.atRenderedUtf16 + change.insertedText.length,
        },
      }
    case "text-deletion":
      return {
        previousSourceRange: change.removedRange,
        nextSourceRange: {
          startRenderedUtf16:
            change.removedRange.startRenderedUtf16,
          endRenderedUtf16:
            change.removedRange.startRenderedUtf16,
        },
      }
    case "text-replacement":
      return {
        previousSourceRange: change.removedRange,
        nextSourceRange: {
          startRenderedUtf16:
            change.removedRange.startRenderedUtf16,
          endRenderedUtf16:
            change.removedRange.startRenderedUtf16
            + change.insertedText.length,
        },
      }
    case "supported-style-change":
      return {
        previousSourceRange: change.range,
        nextSourceRange: change.range,
      }
    case "resolved-field-rendered-value-change": {
      const lookup =
        lookupVNextTextBlockUnifiedLayoutSourceItemByInlineIdInternalV1({
          sourceState: root.sourceState,
          inlineId: change.inlineId,
        })
      if (
        lookup.status !== "found"
        || lookup.item.kind !== "resolved-field"
        || lookup.item.fieldKey !== change.fieldKey
      ) return null
      return {
        previousSourceRange: {
          startRenderedUtf16: lookup.absoluteStartRenderedUtf16,
          endRenderedUtf16: lookup.absoluteEndRenderedUtf16,
        },
        nextSourceRange: {
          startRenderedUtf16: lookup.absoluteStartRenderedUtf16,
          endRenderedUtf16:
            lookup.absoluteStartRenderedUtf16
            + change.nextRenderedText.length,
        },
      }
    }
    default:
      return null
  }
}

function withEvidenceRequestWork(
  work: VNextTextBlockIncrementalCandidateWorkV1,
  requestedCoverage: number,
): VNextTextBlockIncrementalCandidateWorkV1 {
  return deepFreeze({
    ...work,
    evidence: {
      ...work.evidence,
      requestCount: 1,
      requestedAtomCount: 1,
      requestedClusterCount: requestedCoverage,
    },
  })
}

export function createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
    readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  },
): VNextTextBlockTransitionEvidenceRequestResultV1 {
  const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1(input)
  if (bound.status !== "accepted") {
    return {
      status: "blocked",
      request: null,
      incrementalCandidateWork: bound.incrementalCandidateWork,
      issues: bound.issues,
    }
  }
  if (bound.validatedChange.producerEvidence === "not-required") {
    return Object.freeze({
      status: "not-required",
      request: null,
      incrementalCandidateWork: bound.incrementalCandidateWork,
      issues: Object.freeze([]) as readonly [],
    })
  }
  const ranges = changedRanges(input.previousRoot, input.change)
  if (ranges == null) {
    return {
      status: "blocked",
      request: null,
      incrementalCandidateWork: bound.incrementalCandidateWork,
      issues: [issue(
        "incremental-proof-unavailable",
        "evidence",
        "change",
        "bounded evidence range is unavailable for this change family",
      )],
    }
  }
  const sourceLength =
    input.previousRoot.sourceState.summary.renderedUtf16Length
  const previousStart = ranges.previousSourceRange.startRenderedUtf16
  const previousEnd = ranges.previousSourceRange.endRenderedUtf16
  if (
    !Number.isSafeInteger(previousStart)
    || !Number.isSafeInteger(previousEnd)
    || previousStart < 0
    || previousEnd < previousStart
    || previousEnd > sourceLength
  ) {
    return {
      status: "blocked",
      request: null,
      incrementalCandidateWork: bound.incrementalCandidateWork,
      issues: [issue(
        "evidence-coverage-mismatch",
        "evidence",
        "change",
        "change evidence range is outside the previous source",
      )],
    }
  }
  const leftContextRenderedUtf16Length = Math.min(16, previousStart)
  const rightContextRenderedUtf16Length = Math.min(
    16,
    sourceLength - previousEnd,
  )
  const maximumEvidenceCoverageRenderedUtf16Length =
    leftContextRenderedUtf16Length
    + (previousEnd - previousStart)
    + (
      ranges.nextSourceRange.endRenderedUtf16
      - ranges.nextSourceRange.startRenderedUtf16
    )
    + rightContextRenderedUtf16Length
  const facts = {
    source: "vnext-text-block-transition-evidence-request-v1" as const,
    contractVersion: 1 as const,
    previousRootFingerprint: input.previousRoot.fingerprint,
    changeFingerprint: fingerprint(input.change),
    documentId: input.previousRoot.documentId,
    sectionId: input.previousRoot.sectionId,
    textBlockId: input.previousRoot.textBlockId,
    previousSourceRange: ranges.previousSourceRange,
    nextSourceRange: ranges.nextSourceRange,
    leftContextRenderedUtf16Length,
    rightContextRenderedUtf16Length,
    fontStyleUnitDependencyFingerprint:
      input.previousRoot.sourceState.producerRequirements
        .fontStyleUnitDependencyFingerprint,
    producerRuntimeRequirementFingerprint:
      input.previousRoot.sourceState.producerRequirements
        .producerRuntimeRequirementFingerprint,
    layoutUnitPolicyFingerprint:
      input.previousRoot.sourceState.producerRequirements
        .layoutUnitPolicyFingerprint,
    maximumEvidenceCoverageRenderedUtf16Length,
    workPolicyFingerprint: input.workPolicy.fingerprint,
  }
  const request = deepFreeze({
    ...facts,
    fingerprint: fingerprint(facts),
  })
  const incrementalCandidateWork = withEvidenceRequestWork(
    bound.incrementalCandidateWork,
    maximumEvidenceCoverageRenderedUtf16Length,
  )
  const byRoot = new WeakMap<
    VNextTextBlockUnifiedLayoutRootV2,
    WeakMap<VNextTextBlockUnifiedLayoutChangeV1, RequestRecord>
  >()
  const byChange = new WeakMap<
    VNextTextBlockUnifiedLayoutChangeV1,
    RequestRecord
  >()
  byChange.set(input.change, {
    fingerprint: request.fingerprint,
    validatedChange: bound.validatedChange,
    incrementalCandidateWork,
  })
  byRoot.set(input.previousRoot, byChange)
  requestTuples.set(request, byRoot)
  return Object.freeze({
    status: "required",
    request,
    incrementalCandidateWork,
    issues: Object.freeze([]) as readonly [],
  })
}

export function inspectVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1(
  input: {
    readonly request: unknown
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
  },
): VNextTextBlockTransitionEvidenceRequestInspectionV1 {
  if (
    input.request == null
    || typeof input.request !== "object"
    || requestTuples.get(input.request)?.get(
      input.previousRoot,
    )?.has(input.change) !== true
  ) {
    return {
      status: "invalid",
      code: "evidence-authority-mismatch",
      message: "request is not bound to the exact Root/change tuple",
    }
  }
  const request = input.request as Extract<
    VNextTextBlockTransitionEvidenceRequestResultV1,
    { status: "required" }
  >["request"]
  return {
    status: "valid",
    previousRootFingerprint: request.previousRootFingerprint,
    changeFingerprint: request.changeFingerprint,
    previousSourceRange: request.previousSourceRange,
    nextSourceRange: request.nextSourceRange,
    fingerprint: request.fingerprint,
  }
}

export function createVNextTextBlockTransitionProducerRuntimeIdentityInternalV1(
  input: Omit<
    VNextTextBlockTransitionProducerRuntimeIdentityV1,
    "source" | "contractVersion" | "fingerprint"
  >,
): VNextTextBlockTransitionProducerRuntimeIdentityV1 {
  const record = exactRecord(input, [
    "runtime",
    "engineBuildFingerprint",
    "fontBackendFingerprint",
    "unitPolicyFingerprint",
    "fontStyleUnitDependencyFingerprint",
    "producerRuntimeRequirementFingerprint",
  ])
  if (
    record == null
    || (
      record.runtime !== "node-native-mr1-range"
      && record.runtime !== "browser-worker-wasm-mr1-range"
    )
    || [
      record.engineBuildFingerprint,
      record.fontBackendFingerprint,
      record.unitPolicyFingerprint,
      record.fontStyleUnitDependencyFingerprint,
      record.producerRuntimeRequirementFingerprint,
    ].some((value) => typeof value !== "string" || value.length === 0)
  ) {
    throw new TypeError(
      "producer runtime identity requires exact nonblank dependency facts",
    )
  }
  const facts: Omit<
    VNextTextBlockTransitionProducerRuntimeIdentityV1,
    "fingerprint"
  > = {
    source: "vnext-text-block-transition-producer-runtime-v1" as const,
    contractVersion: 1 as const,
    runtime: record.runtime as
      VNextTextBlockTransitionProducerRuntimeIdentityV1["runtime"],
    engineBuildFingerprint: record.engineBuildFingerprint as string,
    fontBackendFingerprint: record.fontBackendFingerprint as string,
    unitPolicyFingerprint: record.unitPolicyFingerprint as string,
    fontStyleUnitDependencyFingerprint:
      record.fontStyleUnitDependencyFingerprint as string,
    producerRuntimeRequirementFingerprint:
      record.producerRuntimeRequirementFingerprint as string,
  }
  const identity = deepFreeze({
    ...facts,
    fingerprint: fingerprint(facts),
  })
  runtimeIdentities.add(identity)
  return identity
}

function nonNegativeSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0
}

function exactShapingRun(value: unknown): {
  readonly renderStartOffset: number
  readonly renderEndOffset: number
} | null {
  const run = exactRecord(value, [
    "shapingRunId",
    "renderStartOffset",
    "renderEndOffset",
    "text",
    "styleKey",
    "fontFaceId",
    "fontSizeLayoutUnit",
    "textColor",
    "direction",
    "baselineShiftLayoutUnit",
    "features",
    "clusters",
  ])
  const features = exactArray(run?.features)
  const clusters = exactArray(run?.clusters)
  if (
    run == null
    || features == null
    || clusters == null
    || typeof run.shapingRunId !== "string"
    || run.shapingRunId.length === 0
    || !nonNegativeSafeInteger(run.renderStartOffset)
    || !nonNegativeSafeInteger(run.renderEndOffset)
    || run.renderEndOffset <= run.renderStartOffset
    || typeof run.text !== "string"
    || run.text.length
      !== run.renderEndOffset - run.renderStartOffset
    || typeof run.styleKey !== "string"
    || run.styleKey.length === 0
    || typeof run.fontFaceId !== "string"
    || run.fontFaceId.length === 0
    || !nonNegativeSafeInteger(run.fontSizeLayoutUnit)
    || run.fontSizeLayoutUnit === 0
    || typeof run.textColor !== "string"
    || run.direction !== "ltr"
    || run.baselineShiftLayoutUnit !== 0
    || features.some((feature) => typeof feature !== "string")
    || clusters.length === 0
  ) return null
  let expectedClusterStart = run.renderStartOffset
  for (let index = 0; index < clusters.length; index += 1) {
    const cluster = exactRecord(clusters[index], [
      "index",
      "renderStartOffset",
      "renderEndOffset",
      "advanceLayoutUnit",
    ])
    if (
      cluster == null
      || cluster.index !== index
      || cluster.renderStartOffset !== expectedClusterStart
      || !nonNegativeSafeInteger(cluster.renderEndOffset)
      || cluster.renderEndOffset <= cluster.renderStartOffset
      || cluster.renderEndOffset > run.renderEndOffset
      || !nonNegativeSafeInteger(cluster.advanceLayoutUnit)
    ) return null
    expectedClusterStart = cluster.renderEndOffset
  }
  return expectedClusterStart === run.renderEndOffset
    ? {
        renderStartOffset: run.renderStartOffset,
        renderEndOffset: run.renderEndOffset,
      }
    : null
}

function responseCoversRequestExactly(
  response: VNextTextBlockTransitionProducerResponseV1,
  request: Extract<
    VNextTextBlockTransitionEvidenceRequestResultV1,
    { status: "required" }
  >["request"],
): boolean {
  const runs = response.shapingRuns.map(exactShapingRun)
  if (runs.some((run) => run == null)) return false
  let expectedStart = request.nextSourceRange.startRenderedUtf16
  for (const run of runs) {
    if (run!.renderStartOffset !== expectedStart) return false
    expectedStart = run!.renderEndOffset
  }
  if (expectedStart !== request.nextSourceRange.endRenderedUtf16) {
    return false
  }
  if (
    response.breakOffsets.length === 0
    || response.breakOffsets[0]
      !== request.nextSourceRange.startRenderedUtf16
    || response.breakOffsets[response.breakOffsets.length - 1]
      !== request.nextSourceRange.endRenderedUtf16
  ) return false
  for (let index = 1; index < response.breakOffsets.length; index += 1) {
    if (response.breakOffsets[index]! <= response.breakOffsets[index - 1]!) {
      return false
    }
  }
  return response.work.requestedClusterCount
      <= request.maximumEvidenceCoverageRenderedUtf16Length
    && response.work.consumedAtomCount
      <= response.work.requestedAtomCount
    && response.work.consumedClusterCount
      <= response.work.requestedClusterCount
    && response.work.unusedCoverageRenderedUtf16Length
      <= request.maximumEvidenceCoverageRenderedUtf16Length
}

function sameRange(
  left: unknown,
  right: {
    readonly startRenderedUtf16: number
    readonly endRenderedUtf16: number
  },
): boolean {
  const record = exactRecord(left, [
    "startRenderedUtf16",
    "endRenderedUtf16",
  ])
  return record?.startRenderedUtf16 === right.startRenderedUtf16
    && record.endRenderedUtf16 === right.endRenderedUtf16
}

function responseFacts(
  response: VNextTextBlockTransitionProducerResponseV1,
): unknown {
  return {
    source: response.source,
    contractVersion: response.contractVersion,
    requestFingerprint: response.requestFingerprint,
    runtimeIdentity: response.runtimeIdentity,
    previousCoverage: response.previousCoverage,
    nextCoverage: response.nextCoverage,
    shapingRuns: response.shapingRuns,
    breakOffsets: response.breakOffsets,
    sourceTopologyFingerprint: response.sourceTopologyFingerprint,
    work: response.work,
    contracts: response.contracts,
  }
}

function exactResponse(
  value: unknown,
): VNextTextBlockTransitionProducerResponseV1 | null {
  const record = exactRecord(value, [
    "source",
    "contractVersion",
    "requestFingerprint",
    "runtimeIdentity",
    "previousCoverage",
    "nextCoverage",
    "shapingRuns",
    "breakOffsets",
    "sourceTopologyFingerprint",
    "work",
    "contracts",
    "fingerprint",
  ])
  const shapingRuns = exactArray(record?.shapingRuns)
  const breakOffsets = exactArray(record?.breakOffsets)
  const work = exactRecord(record?.work, [
    "requestedAtomCount",
    "requestedClusterCount",
    "consumedAtomCount",
    "consumedClusterCount",
    "unusedCoverageRenderedUtf16Length",
    "visitedEvidenceNodeCount",
    "completeNextInputTraversalCount",
    "completeNextInputComparisonCount",
  ])
  const contracts = exactRecord(record?.contracts, [
    "producerSelectsDirtyRange",
    "producerSelectsLinesOrBands",
    "producerSelectsReconvergenceOrReuse",
    "producerSelectsFallback",
    "stagedEditorApply",
    "mayPublishLayout",
    "productionBinding",
  ])
  if (
    record == null
    || shapingRuns == null
    || breakOffsets == null
    || work == null
    || contracts == null
    || typeof record.requestFingerprint !== "string"
    || typeof record.sourceTopologyFingerprint !== "string"
    || typeof record.fingerprint !== "string"
    || breakOffsets.some((offset) => !nonNegativeSafeInteger(offset))
    || !Object.values(work).every(nonNegativeSafeInteger)
    || work.completeNextInputTraversalCount !== 0
    || work.completeNextInputComparisonCount !== 0
    || Object.values(contracts).some((claim) => claim !== false)
  ) return null
  return record as unknown as VNextTextBlockTransitionProducerResponseV1
}

function acceptedEvidenceWork(
  base: VNextTextBlockIncrementalCandidateWorkV1,
  response: VNextTextBlockTransitionProducerResponseV1,
): VNextTextBlockIncrementalCandidateWorkV1 {
  return deepFreeze({
    ...base,
    evidence: {
      requestCount: 1,
      requestedAtomCount: response.work.requestedAtomCount,
      requestedClusterCount: response.work.requestedClusterCount,
      consumedAtomCount: response.work.consumedAtomCount,
      consumedClusterCount: response.work.consumedClusterCount,
      unusedCoverageRenderedUtf16Length:
        response.work.unusedCoverageRenderedUtf16Length,
      visitedEvidenceNodeCount: response.work.visitedEvidenceNodeCount,
    },
  })
}

export function acceptVNextTextBlockUnifiedLayoutTransitionEvidenceV1(input: {
  readonly request: Extract<
    VNextTextBlockTransitionEvidenceRequestResultV1,
    { status: "required" }
  >["request"]
  readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
  readonly change: VNextTextBlockUnifiedLayoutChangeV1
  readonly producerRuntimeIdentity:
    VNextTextBlockTransitionProducerRuntimeIdentityV1
  readonly response: unknown
}): VNextTextBlockTransitionEvidenceAcceptanceResultV1 {
  const requestInspection =
    inspectVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
      request: input.request,
      previousRoot: input.previousRoot,
      change: input.change,
    })
  const requestRecord = requestTuples.get(input.request)?.get(
    input.previousRoot,
  )?.get(input.change)
  const baseWork = requestRecord?.incrementalCandidateWork
    ?? createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1()
  const response = exactResponse(input.response)
  if (
    requestInspection.status !== "valid"
    || response == null
    || !runtimeIdentities.has(input.producerRuntimeIdentity)
    || response.runtimeIdentity !== input.producerRuntimeIdentity
    || input.producerRuntimeIdentity.fontStyleUnitDependencyFingerprint
      !== input.request.fontStyleUnitDependencyFingerprint
    || input.producerRuntimeIdentity.producerRuntimeRequirementFingerprint
      !== input.request.producerRuntimeRequirementFingerprint
    || input.producerRuntimeIdentity.unitPolicyFingerprint
      !== input.request.layoutUnitPolicyFingerprint
    || response.source
      !== "vnext-text-block-transition-producer-response-v1"
    || response.contractVersion !== 1
    || response.requestFingerprint !== input.request.fingerprint
    || !sameRange(
      response.previousCoverage,
      input.request.previousSourceRange,
    )
    || !sameRange(response.nextCoverage, input.request.nextSourceRange)
    || !responseCoversRequestExactly(response, input.request)
    || response.work.completeNextInputTraversalCount !== 0
    || response.work.completeNextInputComparisonCount !== 0
    || response.contracts.producerSelectsDirtyRange !== false
    || response.contracts.producerSelectsLinesOrBands !== false
    || response.contracts.producerSelectsReconvergenceOrReuse !== false
    || response.contracts.producerSelectsFallback !== false
    || response.contracts.stagedEditorApply !== false
    || response.contracts.mayPublishLayout !== false
    || response.contracts.productionBinding !== false
    || response.fingerprint !== fingerprint(responseFacts(response))
  ) {
    return Object.freeze({
      status: "blocked",
      evidence: null,
      incrementalCandidateWork: baseWork,
      issues: Object.freeze([issue(
        "evidence-coverage-mismatch",
        "evidence",
        "response",
        "producer response does not exactly satisfy the Root-owned request",
      )]),
    })
  }
  const facts = {
    source: "vnext-text-block-transition-evidence-v1" as const,
    contractVersion: 1 as const,
    requestFingerprint: input.request.fingerprint,
    previousRootFingerprint: input.previousRoot.fingerprint,
    changeFingerprint: fingerprint(input.change),
    runtimeIdentityFingerprint: input.producerRuntimeIdentity.fingerprint,
    previousCoverage: input.request.previousSourceRange,
    nextCoverage: input.request.nextSourceRange,
    shapingRuns: response.shapingRuns,
    breakOffsets: response.breakOffsets,
    sourceTopologyFingerprint: response.sourceTopologyFingerprint,
    work: response.work,
  }
  const evidence: VNextTextBlockTransitionEvidenceV1 = deepFreeze({
    ...facts,
    fingerprint: fingerprint(facts),
  })
  evidenceRecords.set(evidence, {
    fingerprint: evidence.fingerprint,
    requestFingerprint: evidence.requestFingerprint,
    previousRootFingerprint: evidence.previousRootFingerprint,
    changeFingerprint: evidence.changeFingerprint,
  })
  return Object.freeze({
    status: "accepted",
    evidence,
    incrementalCandidateWork: acceptedEvidenceWork(baseWork, response),
    issues: Object.freeze([]) as readonly [],
  })
}

export function inspectVNextTextBlockUnifiedLayoutTransitionEvidenceInternalV1(
  value: unknown,
): VNextTextBlockTransitionEvidenceInspectionV1 {
  if (
    value == null
    || typeof value !== "object"
    || !evidenceRecords.has(value)
  ) {
    return {
      status: "invalid",
      code: "evidence-authority-mismatch",
      message: "evidence is not the exact process-local accepted object",
    }
  }
  const evidence = value as VNextTextBlockTransitionEvidenceV1
  const record = evidenceRecords.get(evidence)!
  if (
    evidence.fingerprint !== record.fingerprint
    || evidence.requestFingerprint !== record.requestFingerprint
    || evidence.previousRootFingerprint !== record.previousRootFingerprint
    || evidence.changeFingerprint !== record.changeFingerprint
  ) {
    return {
      status: "invalid",
      code: "evidence-authority-mismatch",
      message: "accepted evidence no longer matches its authority record",
    }
  }
  return {
    status: "valid",
    requestFingerprint: record.requestFingerprint,
    previousRootFingerprint: record.previousRootFingerprint,
    changeFingerprint: record.changeFingerprint,
    fingerprint: record.fingerprint,
  }
}

export function createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV1(
  input: {
    readonly previousRoot: VNextTextBlockUnifiedLayoutRootV2
    readonly change: VNextTextBlockUnifiedLayoutChangeV1
  },
): VNextTextBlockTransitionEvidenceRequestResultV1
export function createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV1(
  input: unknown,
): VNextTextBlockTransitionEvidenceRequestResultV1
export function createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestV1(
  input: unknown,
): VNextTextBlockTransitionEvidenceRequestResultV1 {
  const exact = exactRecord(input, ["previousRoot", "change"])
  return createVNextTextBlockUnifiedLayoutTransitionEvidenceRequestInternalV1({
    previousRoot: exact?.previousRoot as VNextTextBlockUnifiedLayoutRootV2,
    change: exact?.change as VNextTextBlockUnifiedLayoutChangeV1,
    workPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V2,
  })
}

export function inspectVNextTextBlockTransitionEvidenceRequestV1(
  value: unknown,
): VNextTextBlockTransitionEvidenceRequestInspectionV1 {
  if (
    value == null
    || typeof value !== "object"
    || !requestTuples.has(value as object)
  ) {
    return {
      status: "invalid",
      code: "evidence-authority-mismatch",
      message: "request is not the exact process-local Root-owned request",
    }
  }
  const request = value as Extract<
    VNextTextBlockTransitionEvidenceRequestResultV1,
    { status: "required" }
  >["request"]
  return {
    status: "valid",
    previousRootFingerprint: request.previousRootFingerprint,
    changeFingerprint: request.changeFingerprint,
    previousSourceRange: request.previousSourceRange,
    nextSourceRange: request.nextSourceRange,
    fingerprint: request.fingerprint,
  }
}

export function inspectVNextTextBlockTransitionEvidenceV1(
  value: unknown,
): VNextTextBlockTransitionEvidenceInspectionV1 {
  return inspectVNextTextBlockUnifiedLayoutTransitionEvidenceInternalV1(value)
}
