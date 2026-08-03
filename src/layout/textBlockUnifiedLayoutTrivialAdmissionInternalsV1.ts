import type { VNextTextBlockAuthoredBoxSummaryV2, VNextTextBlockUnifiedLayoutRootV2 } from "./textBlockUnifiedLayoutRootContractV2.js"
import type { VNextTextBlockUnifiedLayoutSourceStateV1 } from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type { VNextTextBlockUnifiedSpatialStateV1 } from "./textBlockUnifiedSpatialStateContractV1.js"
import type { VNextTextBlockUnifiedLayoutWorkPolicyV1 } from "./textBlockUnifiedLayoutWorkPolicyV1.js"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"

export interface VNextTextBlockUnifiedLayoutTrivialAdmissionAuthorityInternalV1 {
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly source: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  readonly authoredBox: VNextTextBlockAuthoredBoxSummaryV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}

const admissions = new WeakMap<
  VNextTextBlockUnifiedLayoutRootV2,
  VNextTextBlockUnifiedLayoutTrivialAdmissionAuthorityInternalV1
>()

function acceptedSourceItems(source: VNextTextBlockUnifiedLayoutSourceStateV1): boolean {
  const visit = (node: typeof source.root): boolean => node.nodeKind === "leaf"
    ? node.items.every((item) => (
        item.kind === "text"
        || item.kind === "resolved-field"
        || item.kind === "generated-page-number"
        || item.kind === "hard-break"
      ))
    : node.children.every(visit)
  return visit(source.root)
}

function hasTrivialSpatialState(spatialState: VNextTextBlockUnifiedSpatialStateV1): boolean {
  const emptyEntrySetFingerprint = createVNextCompactFingerprint(
    stringifyVNextCanonicalJson({ entries: [] }),
  )
  const emptyRootFingerprint = createVNextCompactFingerprint(
    stringifyVNextCanonicalJson({ kind: "empty-unified-spatial-root-v1" }),
  )
  return spatialState.root === null
    && spatialState.summary.entryCount === 0
    && spatialState.summary.flowAffectingEntryCount === 0
    && spatialState.summary.barrierEntryCount === 0
    && spatialState.summary.overlayEntryCount === 0
    && spatialState.contentLeftLayoutUnit === 0
    && spatialState.contentRightLayoutUnit > 0
    && spatialState.entrySetFingerprint === emptyEntrySetFingerprint
    && spatialState.entryRootFingerprint === emptyRootFingerprint
}

function hasSupportedAutoHeightBox(input: {
  readonly source: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly authoredBox: VNextTextBlockAuthoredBoxSummaryV2
}): boolean {
  return input.source.authoredBoxPlan.fingerprint
      === input.authoredBox.authoredBoxPlanFingerprint
    && input.authoredBox.contentWidthLayoutUnit > 0
    && input.authoredBox.outerWidthLayoutUnit >= input.authoredBox.contentWidthLayoutUnit
    && input.authoredBox.outerHeightLayoutUnit > 0
    && input.authoredBox.contentLeftLayoutUnit
      === input.source.authoredBoxPlan.contentInsetPt.left * 1_000_000
    && input.authoredBox.contentWidthLayoutUnit
      === input.source.producerRequirements.availableWidthLayoutUnit
}

export function registerVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly source: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  readonly authoredBox: VNextTextBlockAuthoredBoxSummaryV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutTrivialAdmissionAuthorityInternalV1 | null {
  if (
    input.root.sourceState !== input.source
    || input.root.spatialState !== input.spatialState
    || input.root.authoredBoxSummary !== input.authoredBox
    || input.root.workPolicy !== input.workPolicy
    || !acceptedSourceItems(input.source)
    || !hasTrivialSpatialState(input.spatialState)
    || !hasSupportedAutoHeightBox(input)
  ) return null
  const authority = Object.freeze({ ...input })
  admissions.set(input.root, authority)
  return authority
}

export function resolveVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutTrivialAdmissionAuthorityInternalV1 | null {
  const authority = admissions.get(input.root)
  return authority != null && authority.workPolicy === input.workPolicy
    ? authority
    : null
}
