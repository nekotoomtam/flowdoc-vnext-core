import {
  VNextAllocatedIdentityV1Schema,
  VNextDerivedIdentityOriginV1Schema,
  VNextDerivedIdentityProvenanceV1Schema,
  type VNextAllocatedIdentityV1,
  type VNextDerivedIdentityOriginV1,
  type VNextDerivedIdentityProvenanceV1,
} from "./identityStandardV1.js"

export const VNEXT_IDENTITY_ALLOCATION_INPUT_KEY_PREFIX = "vnext-identity-input-v1:" as const

function sortRecord<T>(record: Readonly<Record<string, T>>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(record).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0),
  )
}

export function createVNextIdentityAllocationInputKeyV1(
  value: VNextDerivedIdentityOriginV1,
): string {
  const origin = VNextDerivedIdentityOriginV1Schema.parse(value)
  return `${VNEXT_IDENTITY_ALLOCATION_INPUT_KEY_PREFIX}${JSON.stringify({
    kind: origin.kind,
    refs: sortRecord(origin.refs),
    revisionPins: sortRecord(origin.revisionPins),
  })}`
}

export function createVNextDerivedIdentityProvenanceV1(
  identityValue: VNextAllocatedIdentityV1,
  originValue: VNextDerivedIdentityOriginV1,
): VNextDerivedIdentityProvenanceV1 {
  const identity = VNextAllocatedIdentityV1Schema.parse(identityValue)
  const origin = VNextDerivedIdentityOriginV1Schema.parse(originValue)
  return VNextDerivedIdentityProvenanceV1Schema.parse({
    contractVersion: 1,
    kind: "derived-identity-provenance",
    identity,
    origin,
    allocationInputKey: createVNextIdentityAllocationInputKeyV1(origin),
  })
}
