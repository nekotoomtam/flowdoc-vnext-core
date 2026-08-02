import type {
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "./textBlockUnifiedLayoutSourceStateContractV1.js"
import type {
  VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1,
  VNextTextBlockSourceLayoutDeltaAuthorityInternalV1,
} from "./textBlockUnifiedLayoutSourceStateV1.js"

const structuralTargetAuthorities = new WeakMap<object, {
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
}>()

const sourceLayoutDeltaAuthorities = new WeakMap<object, {
  readonly structuralTargetAuthority:
    VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
}>()

export function createVNextTextBlockStructuralTargetAuthorityInternalV1(input: {
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
}): VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1 {
  const authority = Object.freeze(
    {},
  ) as VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
  structuralTargetAuthorities.set(authority, Object.freeze(input))
  return authority
}

export function createVNextTextBlockSourceLayoutDeltaAuthorityInternalV1(input: {
  readonly structuralTargetAuthority:
    VNextTextBlockIncrementalStructuralTargetAuthorityInternalV1
}): VNextTextBlockSourceLayoutDeltaAuthorityInternalV1 | null {
  if (!structuralTargetAuthorities.has(input.structuralTargetAuthority)) {
    return null
  }
  const authority = Object.freeze(
    {},
  ) as VNextTextBlockSourceLayoutDeltaAuthorityInternalV1
  sourceLayoutDeltaAuthorities.set(authority, Object.freeze(input))
  return authority
}

export function hasVNextTextBlockSourceLayoutDeltaAuthorityBindingInternalV1(
  input: {
    readonly authority: unknown
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  },
): boolean {
  const layout = input.authority != null && typeof input.authority === "object"
    ? sourceLayoutDeltaAuthorities.get(input.authority as object)
    : null
  const structural = layout == null
    ? null
    : structuralTargetAuthorities.get(layout.structuralTargetAuthority)
  return structural != null
    && structural.previousSourceState === input.previousSourceState
    && structural.nextSourceState === input.nextSourceState
}

export function hasVNextTextBlockStructuralTargetAuthorityBindingInternalV1(
  input: {
    readonly authority: unknown
    readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  },
): boolean {
  const structural = input.authority != null && typeof input.authority === "object"
    ? structuralTargetAuthorities.get(input.authority as object)
    : null
  return structural != null
    && structural.previousSourceState === input.previousSourceState
    && structural.nextSourceState === input.nextSourceState
}
