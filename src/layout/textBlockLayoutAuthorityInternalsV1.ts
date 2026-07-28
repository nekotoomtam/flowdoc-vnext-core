import type { VNextTextBlockFlowEvidenceV2 } from "./textBlockFlowEvidenceContractV2.js"
import type { VNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import type { VNextTextBlockMultiRunLayoutRequestV1 } from "./textBlockMultiRunLayoutContractV1.js"
import type { VNextTextBlockPersistentFlowTreeV1 } from "./textBlockPersistentFlowContractV1.js"
import { hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1 } from "./textBlockPersistentFlowTreeInternalsV1.js"

const layoutAuthorityBrand = Symbol("vnext-text-block-layout-authority")
type LayoutAuthorityToken = Readonly<{
  [layoutAuthorityBrand]: true
}>

type V1LayoutAuthorityBinding = Readonly<{
  request: VNextTextBlockMultiRunLayoutRequestV1
  authority: LayoutAuthorityToken
}>

type V2LayoutAuthorityBinding = Readonly<{
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  authority: LayoutAuthorityToken
}>

const v1LayoutAuthorities = new WeakMap<
  VNextTextBlockPersistentFlowTreeV1,
  V1LayoutAuthorityBinding
>()
const v2LayoutAuthorities = new WeakMap<object, V2LayoutAuthorityBinding>()
const spatialIndexAuthorities = new WeakMap<object, LayoutAuthorityToken>()

function createLayoutAuthorityToken(): LayoutAuthorityToken {
  return Object.freeze({ [layoutAuthorityBrand]: true })
}

export function getOrCreateVNextTextBlockV1LayoutAuthorityInternalV1(input: {
  persistentFlowTree: VNextTextBlockPersistentFlowTreeV1
  request: VNextTextBlockMultiRunLayoutRequestV1
}): LayoutAuthorityToken | null {
  if (!hasVNextTextBlockPersistentFlowTreeRequestBindingInternalV1(
    input.persistentFlowTree,
    input.request,
  )) return null
  const existing = v1LayoutAuthorities.get(input.persistentFlowTree)
  if (existing?.request === input.request) return existing.authority
  const authority = createLayoutAuthorityToken()
  v1LayoutAuthorities.set(input.persistentFlowTree, {
    request: input.request,
    authority,
  })
  return authority
}

export function registerVNextTextBlockV2LayoutAuthorityInternalV1(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: object
}): LayoutAuthorityToken {
  const authority = createLayoutAuthorityToken()
  v2LayoutAuthorities.set(input.persistentFlowTree, {
    initialFlow: input.initialFlow,
    evidence: input.evidence,
    authority,
  })
  return authority
}

export function getVNextTextBlockV2LayoutAuthorityInternalV1(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidence: VNextTextBlockFlowEvidenceV2
  persistentFlowTree: object
}): LayoutAuthorityToken | null {
  const binding = v2LayoutAuthorities.get(input.persistentFlowTree)
  return binding?.initialFlow === input.initialFlow
    && binding.evidence === input.evidence
    ? binding.authority
    : null
}

export function bindVNextTextBlockSpatialIndexAuthorityInternalV1(
  index: object,
  authority: LayoutAuthorityToken,
): void {
  spatialIndexAuthorities.set(index, authority)
}

export function hasVNextTextBlockSpatialIndexAuthorityInternalV1(
  index: object,
  authority: LayoutAuthorityToken,
): boolean {
  return spatialIndexAuthorities.get(index) === authority
}
