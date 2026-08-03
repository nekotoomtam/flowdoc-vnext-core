import type { VNextTextBlockAuthoredBoxSummaryV2, VNextTextBlockUnifiedLayoutRootV2 } from "./textBlockUnifiedLayoutRootContractV2.js"
import type { VNextTextBlockUnifiedLayoutSourceStateV1 } from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type { VNextTextBlockUnifiedSpatialStateV1 } from "./textBlockUnifiedSpatialStateContractV1.js"
import type { VNextTextBlockUnifiedLayoutWorkPolicyV1 } from "./textBlockUnifiedLayoutWorkPolicyV1.js"

export interface VNextTextBlockUnifiedLayoutTrivialAdmissionAuthorityInternalV1 {
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly source: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  readonly authoredBox: VNextTextBlockAuthoredBoxSummaryV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}

export interface VNextTextBlockUnifiedLayout5B2AuthoredBoxProfileInternalV1 {
  readonly heightPolicy: "auto-height" | "fixed-height"
  readonly clippingPolicy: "none" | "clip"
  readonly overflowPolicy: "none" | "allow"
}

const admissions = new WeakMap<
  VNextTextBlockUnifiedLayoutRootV2,
  VNextTextBlockUnifiedLayoutTrivialAdmissionAuthorityInternalV1
>()
const completeKernelProfiles = new WeakMap<
  VNextTextBlockUnifiedLayoutRootV2,
  {
    readonly source: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
    readonly authoredBox: VNextTextBlockAuthoredBoxSummaryV2
    readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
    readonly authoredBoxProfile:
      VNextTextBlockUnifiedLayout5B2AuthoredBoxProfileInternalV1
  }
>()

/** Called only by the private 5B-2 complete-kernel owner after Root registration. */
export function markVNextTextBlockUnifiedLayout5B2CompleteKernelProfileInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly source: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  readonly authoredBox: VNextTextBlockAuthoredBoxSummaryV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
  readonly authoredBoxProfile:
    VNextTextBlockUnifiedLayout5B2AuthoredBoxProfileInternalV1
}): void {
  completeKernelProfiles.set(input.root, Object.freeze({ ...input }))
}

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

export function registerVNextTextBlockUnifiedLayoutTrivialAdmissionInternalV1(input: {
  readonly root: VNextTextBlockUnifiedLayoutRootV2
  readonly source: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly spatialState: VNextTextBlockUnifiedSpatialStateV1
  readonly authoredBox: VNextTextBlockAuthoredBoxSummaryV2
  readonly workPolicy: VNextTextBlockUnifiedLayoutWorkPolicyV1
}): VNextTextBlockUnifiedLayoutTrivialAdmissionAuthorityInternalV1 | null {
  const kernelProfile = completeKernelProfiles.get(input.root)
  if (
    kernelProfile == null
    || kernelProfile.source !== input.source
    || kernelProfile.spatialState !== input.spatialState
    || kernelProfile.authoredBox !== input.authoredBox
    || kernelProfile.workPolicy !== input.workPolicy
    || kernelProfile.authoredBoxProfile.heightPolicy !== "auto-height"
    || kernelProfile.authoredBoxProfile.clippingPolicy !== "none"
    || kernelProfile.authoredBoxProfile.overflowPolicy !== "none"
    || input.root.sourceState !== input.source
    || input.root.spatialState !== input.spatialState
    || input.root.authoredBoxSummary !== input.authoredBox
    || input.root.workPolicy !== input.workPolicy
    || !acceptedSourceItems(input.source)
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
