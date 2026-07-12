import { z } from "zod"
import {
  VNEXT_DOCUMENT_V4_AUTHORED_NODE_TYPES,
  type AuthoredNodeV4TargetType,
} from "../schema/documentV4Target.js"
import {
  VNextPublishedStructureVersionRefV1Schema,
  VNextStructureDefinitionDraftRefV1Schema,
} from "./structureIdentity.js"

export const VNEXT_STRUCTURE_POLICY_CONTRACT_VERSION = 1 as const

export const VNEXT_STRUCTURE_POLICY_NODE_ACTIONS = [
  "node.delete",
  "node.duplicate",
  "node.reorder",
  "content.edit",
  "style.apply",
  "style.override",
  "field.place",
  "media.place",
  "table.row.insert",
  "table.row.delete",
  "table.row.reorder",
  "table.column.insert",
  "table.column.delete",
  "table.column.resize",
  "table.cell.vertical-align.patch",
] as const

export const VNEXT_STRUCTURE_POLICY_CHILD_ACTIONS = [
  "child.insert",
  "child.delete",
  "child.duplicate",
  "child.reorder",
] as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "value must not be whitespace",
})

const NodeActionSchema = z.enum(VNEXT_STRUCTURE_POLICY_NODE_ACTIONS)
const ChildActionSchema = z.enum(VNEXT_STRUCTURE_POLICY_CHILD_ACTIONS)
const AuthoredNodeTypeSchema = z.enum(VNEXT_DOCUMENT_V4_AUTHORED_NODE_TYPES)

function duplicateIndexes(values: readonly string[]): number[] {
  const seen = new Set<string>()
  const duplicates: number[] = []
  values.forEach((value, index) => {
    if (seen.has(value)) duplicates.push(index)
    seen.add(value)
  })
  return duplicates
}

export const VNextStructurePolicyChildrenV1Schema = z.object({
  actions: z.array(ChildActionSchema),
  allowedChildTypes: z.array(AuthoredNodeTypeSchema),
  minChildren: z.number().int().nonnegative().default(0),
  maxChildren: z.number().int().nonnegative().nullable().default(null),
  childPolicyKey: NonBlankIdSchema.optional(),
}).strict().superRefine((children, ctx) => {
  duplicateIndexes(children.actions).forEach((index) => ctx.addIssue({
    code: "custom",
    path: ["actions", index],
    message: "child actions must be unique",
  }))
  duplicateIndexes(children.allowedChildTypes).forEach((index) => ctx.addIssue({
    code: "custom",
    path: ["allowedChildTypes", index],
    message: "allowed child types must be unique",
  }))
  if (children.maxChildren != null && children.maxChildren < children.minChildren) {
    ctx.addIssue({
      code: "custom",
      path: ["maxChildren"],
      message: "maxChildren must be null or greater than or equal to minChildren",
    })
  }
})

export const VNextStructurePolicyV1Schema = z.object({
  key: NonBlankIdSchema,
  nodeActions: z.array(NodeActionSchema),
  allowedStyleKeys: z.array(NonBlankIdSchema).optional(),
  children: VNextStructurePolicyChildrenV1Schema.optional(),
}).strict().superRefine((policy, ctx) => {
  duplicateIndexes(policy.nodeActions).forEach((index) => ctx.addIssue({
    code: "custom",
    path: ["nodeActions", index],
    message: "node actions must be unique",
  }))
  duplicateIndexes(policy.allowedStyleKeys ?? []).forEach((index) => ctx.addIssue({
    code: "custom",
    path: ["allowedStyleKeys", index],
    message: "allowed style keys must be unique",
  }))
})

export const VNextStructurePolicyOwnerV1Schema = z.union([
  z.object({
    kind: z.literal("structure-definition-draft"),
    ref: VNextStructureDefinitionDraftRefV1Schema,
  }).strict(),
  z.object({
    kind: z.literal("published-structure-version"),
    ref: VNextPublishedStructureVersionRefV1Schema,
  }).strict(),
])

export const VNextStructurePolicySetV1Schema = z.object({
  contractVersion: z.literal(VNEXT_STRUCTURE_POLICY_CONTRACT_VERSION),
  kind: z.literal("structure-policy-set"),
  policySetId: NonBlankIdSchema,
  owner: VNextStructurePolicyOwnerV1Schema,
  defaultPolicyKey: NonBlankIdSchema,
  policies: z.record(NonBlankIdSchema, VNextStructurePolicyV1Schema),
  nodeBindings: z.record(NonBlankIdSchema, NonBlankIdSchema).default({}),
}).strict().superRefine((set, ctx) => {
  if (Object.keys(set.policies).length === 0) {
    ctx.addIssue({ code: "custom", path: ["policies"], message: "policy set requires at least one policy" })
  }
  if (set.policies[set.defaultPolicyKey] == null) {
    ctx.addIssue({ code: "custom", path: ["defaultPolicyKey"], message: "default policy key must exist" })
  }
  Object.entries(set.policies).forEach(([key, policy]) => {
    if (key !== policy.key) {
      ctx.addIssue({ code: "custom", path: ["policies", key, "key"], message: "policy record key must equal policy.key" })
    }
    const childPolicyKey = policy.children?.childPolicyKey
    if (childPolicyKey != null && set.policies[childPolicyKey] == null) {
      ctx.addIssue({ code: "custom", path: ["policies", key, "children", "childPolicyKey"], message: "child policy key must exist" })
    }
  })
  Object.entries(set.nodeBindings).forEach(([nodeId, policyKey]) => {
    if (set.policies[policyKey] == null) {
      ctx.addIssue({ code: "custom", path: ["nodeBindings", nodeId], message: "node binding policy key must exist" })
    }
  })
})

export type VNextStructurePolicyNodeAction = typeof VNEXT_STRUCTURE_POLICY_NODE_ACTIONS[number]
export type VNextStructurePolicyChildAction = typeof VNEXT_STRUCTURE_POLICY_CHILD_ACTIONS[number]
export type VNextStructurePolicyChildrenV1 = z.infer<typeof VNextStructurePolicyChildrenV1Schema>
export type VNextStructurePolicyV1 = z.infer<typeof VNextStructurePolicyV1Schema>
export type VNextStructurePolicyOwnerV1 = z.infer<typeof VNextStructurePolicyOwnerV1Schema>
export type VNextStructurePolicySetV1 = z.infer<typeof VNextStructurePolicySetV1Schema>

export interface VNextResolvedStructurePolicyV1 {
  policy: VNextStructurePolicyV1
  policyKey: string
  source: "explicit-node" | "parent-child" | "set-default"
}

export function resolveVNextStructurePolicyV1(
  set: VNextStructurePolicySetV1,
  nodeId: string,
  parentPolicyKey?: string,
): VNextResolvedStructurePolicyV1 {
  const explicit = set.nodeBindings[nodeId]
  if (explicit != null) return { policy: set.policies[explicit], policyKey: explicit, source: "explicit-node" }
  const inherited = parentPolicyKey == null ? undefined : set.policies[parentPolicyKey]?.children?.childPolicyKey
  if (inherited != null) return { policy: set.policies[inherited], policyKey: inherited, source: "parent-child" }
  return {
    policy: set.policies[set.defaultPolicyKey],
    policyKey: set.defaultPolicyKey,
    source: "set-default",
  }
}

export type VNextEffectiveCapabilityLayer = "core" | "structure" | "session"

export interface VNextEffectiveCapabilityDenial {
  code: "core-capability-denied" | "structure-policy-denied" | "session-permission-denied"
  layer: VNextEffectiveCapabilityLayer
  message: string
  path: string
}

export interface VNextEffectiveNodeCapabilityV1 {
  action: VNextStructurePolicyNodeAction
  allowed: boolean
  denials: VNextEffectiveCapabilityDenial[]
  policyKey: string
}

export function evaluateVNextEffectiveNodeCapabilityV1(input: {
  action: VNextStructurePolicyNodeAction
  coreAllowed: boolean
  policy: VNextStructurePolicyV1
  sessionAllowed: boolean
}): VNextEffectiveNodeCapabilityV1 {
  const denials: VNextEffectiveCapabilityDenial[] = []
  if (!input.coreAllowed) denials.push({
    code: "core-capability-denied",
    layer: "core",
    message: `core capability does not support ${input.action}`,
    path: "coreAllowed",
  })
  if (!input.policy.nodeActions.includes(input.action)) denials.push({
    code: "structure-policy-denied",
    layer: "structure",
    message: `structure policy "${input.policy.key}" does not allow ${input.action}`,
    path: `policies.${input.policy.key}.nodeActions`,
  })
  if (!input.sessionAllowed) denials.push({
    code: "session-permission-denied",
    layer: "session",
    message: `session permission does not allow ${input.action}`,
    path: "sessionAllowed",
  })
  return { action: input.action, allowed: denials.length === 0, denials, policyKey: input.policy.key }
}

export type VNextChildCompositionDenialCode =
  | "core-child-type-denied"
  | "structure-child-action-denied"
  | "structure-child-type-denied"
  | "structure-cardinality-min"
  | "structure-cardinality-max"
  | "session-permission-denied"

export interface VNextChildCompositionDenial {
  code: VNextChildCompositionDenialCode
  layer: VNextEffectiveCapabilityLayer
  message: string
  path: string
}

export interface VNextEffectiveChildCompositionV1 {
  action: VNextStructurePolicyChildAction
  allowed: boolean
  denials: VNextChildCompositionDenial[]
  policyKey: string
}

export function evaluateVNextEffectiveChildCompositionV1(input: {
  action: VNextStructurePolicyChildAction
  childType: AuthoredNodeV4TargetType
  coreAllowedChildTypes: readonly AuthoredNodeV4TargetType[]
  currentChildCount: number
  parentPolicy: VNextStructurePolicyV1
  sessionAllowed: boolean
}): VNextEffectiveChildCompositionV1 {
  const denials: VNextChildCompositionDenial[] = []
  const children = input.parentPolicy.children
  const addsChild = input.action === "child.insert" || input.action === "child.duplicate"
  const removesChild = input.action === "child.delete"

  if (addsChild && !input.coreAllowedChildTypes.includes(input.childType)) denials.push({
    code: "core-child-type-denied",
    layer: "core",
    message: `core containment does not allow ${input.childType}`,
    path: "coreAllowedChildTypes",
  })
  if (children == null || !children.actions.includes(input.action)) denials.push({
    code: "structure-child-action-denied",
    layer: "structure",
    message: `structure policy "${input.parentPolicy.key}" does not allow ${input.action}`,
    path: `policies.${input.parentPolicy.key}.children.actions`,
  })
  if (addsChild && children != null && !children.allowedChildTypes.includes(input.childType)) denials.push({
    code: "structure-child-type-denied",
    layer: "structure",
    message: `structure policy "${input.parentPolicy.key}" does not allow ${input.childType} children`,
    path: `policies.${input.parentPolicy.key}.children.allowedChildTypes`,
  })
  if (addsChild && children?.maxChildren != null && input.currentChildCount >= children.maxChildren) denials.push({
    code: "structure-cardinality-max",
    layer: "structure",
    message: `structure policy "${input.parentPolicy.key}" reached maxChildren ${children.maxChildren}`,
    path: `policies.${input.parentPolicy.key}.children.maxChildren`,
  })
  if (removesChild && children != null && input.currentChildCount <= children.minChildren) denials.push({
    code: "structure-cardinality-min",
    layer: "structure",
    message: `structure policy "${input.parentPolicy.key}" requires minChildren ${children.minChildren}`,
    path: `policies.${input.parentPolicy.key}.children.minChildren`,
  })
  if (!input.sessionAllowed) denials.push({
    code: "session-permission-denied",
    layer: "session",
    message: `session permission does not allow ${input.action}`,
    path: "sessionAllowed",
  })
  return { action: input.action, allowed: denials.length === 0, denials, policyKey: input.parentPolicy.key }
}
