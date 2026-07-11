import { z } from "zod"
import {
  VNEXT_STRUCTURE_POLICY_NODE_ACTIONS,
  VNextStructurePolicySetV1Schema,
  evaluateVNextEffectiveNodeCapabilityV1,
  resolveVNextStructurePolicyV1,
  type VNextStructurePolicyNodeAction,
} from "../lifecycle/structurePolicy.js"
import {
  VNextDocumentInstanceIdentityV1Schema,
  VNextStructureDefinitionDraftIdentityV1Schema,
  sameVNextPublishedStructureVersionRefV1,
} from "../lifecycle/structureIdentity.js"
import {
  VNextDraftFieldContractV1Schema,
  VNextPublishedFieldContractV1Schema,
} from "../resolution/resolutionInputPins.js"
import { InlineNodeV4TargetSchema } from "../schema/documentV4ImageTarget.js"
import { DocumentNodeV4TargetSchema, type DocumentNodeV4Target } from "../schema/documentV4Target.js"
import { validateVNextDocumentV4Structure } from "../schema/documentV4Structure.js"
import {
  buildVNextReadOnlyGraphV4,
  type VNextReadOnlyParentRefV4,
} from "../runtime/readOnlySessionV4.js"
import { validateVNextTextBlockV4Grammar } from "./textBlockV4Contract.js"

export const VNEXT_TEXT_BLOCK_V4_RICH_INLINE_REPLACE_SOURCE = "vnext-text-block-v4-rich-inline-replace"
export const VNEXT_TEXT_BLOCK_V4_RICH_INLINE_REPLACE_CONTRACT_VERSION = 1 as const

const NodeActionSchema = z.enum(VNEXT_STRUCTURE_POLICY_NODE_ACTIONS)

export const VNextTextBlockV4RichInlineReplaceRequestV1Schema = z.object({
  contractVersion: z.literal(VNEXT_TEXT_BLOCK_V4_RICH_INLINE_REPLACE_CONTRACT_VERSION),
  kind: z.literal("text-block-v4-rich-inline-replace-request"),
  artifact: z.union([
    VNextStructureDefinitionDraftIdentityV1Schema,
    VNextDocumentInstanceIdentityV1Schema,
  ]),
  document: DocumentNodeV4TargetSchema,
  fieldContract: z.union([
    VNextDraftFieldContractV1Schema,
    VNextPublishedFieldContractV1Schema,
  ]),
  policySet: VNextStructurePolicySetV1Schema,
  sessionAllowedActions: z.array(NodeActionSchema),
  command: z.object({
    kind: z.literal("text-block.rich-inline.replace"),
    textBlockId: z.string().min(1),
    children: z.array(InlineNodeV4TargetSchema),
    source: z.enum(["user", "automation", "system"]).optional(),
  }).strict(),
}).strict()

export type VNextTextBlockV4RichInlineReplaceRequestV1 = z.infer<
  typeof VNextTextBlockV4RichInlineReplaceRequestV1Schema
>

export interface VNextTextBlockV4RichInlineReplaceIssue {
  code: string
  severity: "error"
  path: string
  message: string
  nodeId?: string
  inlineId?: string
  action?: VNextStructurePolicyNodeAction
}

export interface VNextTextBlockV4RichInlineIdentityDiff {
  addedInlineIds: string[]
  removedInlineIds: string[]
  retainedInlineIds: string[]
}

export interface VNextTextBlockV4RichInlineReplaceCommit {
  kind: "text-block.rich-inline.replace"
  source: "user" | "automation" | "system"
  targetTextBlockId: string
  requiredActions: VNextStructurePolicyNodeAction[]
  policyKey: string
  identity: VNextTextBlockV4RichInlineIdentityDiff
  fieldKeys: string[]
  scope: {
    sectionIds: string[]
    zoneIds: string[]
    nodeIds: string[]
    parentNodeIds: string[]
    tableIds: string[]
    textBlockIds: string[]
  }
  historyPolicy: {
    durableIntent: "content"
    kind: "single-entry"
    mergeKey: string
    summary: string
    collaborationSafe: false
  }
  renderInvalidation: {
    lane: "text-content"
    affectedNodeIds: string[]
    affectedSectionIds: string[]
    pageScope: { kind: "unknown"; reason: "pagination-not-integrated" }
  }
}

export type VNextTextBlockV4RichInlineReplaceResult =
  | {
      source: typeof VNEXT_TEXT_BLOCK_V4_RICH_INLINE_REPLACE_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_V4_RICH_INLINE_REPLACE_CONTRACT_VERSION
      status: "committed"
      document: DocumentNodeV4Target
      operation: VNextTextBlockV4RichInlineReplaceCommit
      issues: []
    }
  | {
      source: typeof VNEXT_TEXT_BLOCK_V4_RICH_INLINE_REPLACE_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_V4_RICH_INLINE_REPLACE_CONTRACT_VERSION
      status: "blocked"
      reason: "invalid-request" | "artifact-mismatch" | "invalid-document" | "target-not-found" | "unsupported-target" | "capability-denied" | "validation-failed" | "no-op"
      document: DocumentNodeV4Target | null
      operation: null
      issues: VNextTextBlockV4RichInlineReplaceIssue[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function formatPath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    return current === "" ? String(segment) : `${current}.${String(segment)}`
  }, "")
}

function blocked(
  reason: Extract<VNextTextBlockV4RichInlineReplaceResult, { status: "blocked" }>["reason"],
  issues: VNextTextBlockV4RichInlineReplaceIssue[],
  document: DocumentNodeV4Target | null,
): VNextTextBlockV4RichInlineReplaceResult {
  return {
    source: VNEXT_TEXT_BLOCK_V4_RICH_INLINE_REPLACE_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_V4_RICH_INLINE_REPLACE_CONTRACT_VERSION,
    status: "blocked",
    reason,
    document,
    operation: null,
    issues,
  }
}

function parentNodeId(parent: VNextReadOnlyParentRefV4 | undefined): string | null {
  if (parent?.kind === "zone") return parent.zoneId
  if (parent?.kind === "column") return parent.columnId
  if (parent?.kind === "table-cell") return parent.cellId
  return null
}

function identityDiff(
  before: VNextTextBlockV4RichInlineReplaceRequestV1["command"]["children"],
  after: VNextTextBlockV4RichInlineReplaceRequestV1["command"]["children"],
): VNextTextBlockV4RichInlineIdentityDiff {
  const beforeIds = new Set(before.map((inline) => inline.id))
  const afterIds = new Set(after.map((inline) => inline.id))
  return {
    addedInlineIds: after.filter((inline) => !beforeIds.has(inline.id)).map((inline) => inline.id),
    removedInlineIds: before.filter((inline) => !afterIds.has(inline.id)).map((inline) => inline.id),
    retainedInlineIds: after.filter((inline) => beforeIds.has(inline.id)).map((inline) => inline.id),
  }
}

function requiredActions(
  before: VNextTextBlockV4RichInlineReplaceRequestV1["command"]["children"],
  after: VNextTextBlockV4RichInlineReplaceRequestV1["command"]["children"],
): VNextStructurePolicyNodeAction[] {
  const actions = new Set<VNextStructurePolicyNodeAction>(["content.edit"])
  const beforeById = new Map(before.map((inline) => [inline.id, inline]))
  after.forEach((inline) => {
    const prior = beforeById.get(inline.id)
    if (inline.type === "field-ref" && (prior?.type !== "field-ref" || prior.key !== inline.key)) actions.add("field.place")
    if (inline.type === "inline-image" && (prior?.type !== "inline-image" || JSON.stringify(prior.source) !== JSON.stringify(inline.source))) {
      actions.add("media.place")
    }
    if (inline.type === "text") {
      const priorStyle = prior?.type === "text" ? prior.style : undefined
      if (JSON.stringify(priorStyle) !== JSON.stringify(inline.style)) actions.add("style.override")
    }
  })
  return [...actions]
}

export function runVNextTextBlockV4RichInlineReplace(
  value: unknown,
): VNextTextBlockV4RichInlineReplaceResult {
  const parsed = VNextTextBlockV4RichInlineReplaceRequestV1Schema.safeParse(value)
  if (!parsed.success) return blocked("invalid-request", parsed.error.issues.map((item) => ({
    code: item.code,
    severity: "error",
    path: formatPath(item.path),
    message: item.message,
  })), null)

  const input = parsed.data
  const sourceDocument = input.document
  const artifactIssues: VNextTextBlockV4RichInlineReplaceIssue[] = []
  if (input.artifact.kind === "document-instance") {
    if (sourceDocument.document.id !== input.artifact.instanceId) artifactIssues.push({
      code: "instance-document-id-mismatch", severity: "error", path: "document.document.id",
      message: "document root id must equal the document instance id",
    })
    if (
      input.policySet.owner.kind !== "published-structure-version"
      || !sameVNextPublishedStructureVersionRefV1(input.policySet.owner.ref, input.artifact.structureVersion)
    ) artifactIssues.push({
      code: "instance-policy-owner-mismatch", severity: "error", path: "policySet.owner",
      message: "document instance edits require policy owned by the pinned published structure version",
    })
    if (
      input.fieldContract.kind !== "published-field-contract"
      || !sameVNextPublishedStructureVersionRefV1(input.fieldContract.owner, input.artifact.structureVersion)
    ) artifactIssues.push({
      code: "instance-field-contract-owner-mismatch", severity: "error", path: "fieldContract.owner",
      message: "document instance edits require a field contract owned by the pinned published structure version",
    })
  } else {
    const owner = input.policySet.owner
    if (
      owner.kind !== "structure-definition-draft"
      || owner.ref.structureId !== input.artifact.structureId
      || owner.ref.draftId !== input.artifact.draftId
      || owner.ref.revision !== input.artifact.revision
    ) artifactIssues.push({
      code: "draft-policy-owner-mismatch", severity: "error", path: "policySet.owner",
      message: "structure draft edits require policy owned by the exact draft revision",
    })
    const fieldOwner = input.fieldContract.owner
    if (
      input.fieldContract.kind !== "draft-field-contract"
      || fieldOwner.structureId !== input.artifact.structureId
      || !("draftId" in fieldOwner)
      || fieldOwner.draftId !== input.artifact.draftId
      || fieldOwner.revision !== input.artifact.revision
    ) artifactIssues.push({
      code: "draft-field-contract-owner-mismatch", severity: "error", path: "fieldContract.owner",
      message: "structure draft edits require a field contract owned by the exact draft revision",
    })
  }
  if (artifactIssues.length > 0) return blocked("artifact-mismatch", artifactIssues, sourceDocument)

  const structure = validateVNextDocumentV4Structure(sourceDocument)
  if (structure.status !== "valid") return blocked("invalid-document", structure.issues.map((item) => ({
    code: item.code,
    severity: "error",
    path: `document.${item.path}`,
    message: item.message,
    ...(item.nodeId == null ? {} : { nodeId: item.nodeId }),
  })), sourceDocument)

  const graph = buildVNextReadOnlyGraphV4(sourceDocument)
  const node = graph.nodesById.get(input.command.textBlockId)
  if (node == null) return blocked("target-not-found", [{
    code: "target-not-found", severity: "error", path: "command.textBlockId",
    nodeId: input.command.textBlockId,
    message: `text-block "${input.command.textBlockId}" was not found`,
  }], sourceDocument)
  if (node.type !== "text-block") return blocked("unsupported-target", [{
    code: "not-text-block", severity: "error", path: "command.textBlockId", nodeId: node.id,
    message: `rich inline replacement requires a text-block target; got ${node.type}`,
  }], sourceDocument)

  const context = graph.nearestByNodeId.get(node.id)
  const zone = context == null ? undefined : graph.zonesById.get(context.zoneId)
  if (context == null || zone == null) return blocked("invalid-document", [{
    code: "missing-node-context", severity: "error", path: "command.textBlockId", nodeId: node.id,
    message: "text-block context could not be resolved",
  }], sourceDocument)

  const parentId = parentNodeId(graph.parentByNodeId.get(node.id))
  const parentPolicy = parentId == null ? undefined : resolveVNextStructurePolicyV1(input.policySet, parentId)
  const resolvedPolicy = resolveVNextStructurePolicyV1(input.policySet, node.id, parentPolicy?.policyKey)
  const actions = requiredActions(node.children, input.command.children)
  const capabilityIssues: VNextTextBlockV4RichInlineReplaceIssue[] = []
  actions.forEach((action) => {
    const result = evaluateVNextEffectiveNodeCapabilityV1({
      action,
      coreAllowed: true,
      policy: resolvedPolicy.policy,
      sessionAllowed: input.sessionAllowedActions.includes(action),
    })
    result.denials.forEach((denial) => capabilityIssues.push({
      code: denial.code,
      severity: "error",
      path: denial.path,
      message: denial.message,
      nodeId: node.id,
      action,
    }))
  })
  if (capabilityIssues.length > 0) return blocked("capability-denied", capabilityIssues, sourceDocument)

  if (JSON.stringify(node.children) === JSON.stringify(input.command.children)) return blocked("no-op", [{
    code: "no-op-rich-inline-replace", severity: "error", path: "command.children", nodeId: node.id,
    message: "rich inline replacement must change the target children",
  }], sourceDocument)

  const grammar = validateVNextTextBlockV4Grammar({ ...node, children: input.command.children }, {
    fieldContract: input.fieldContract.registry,
    zoneRole: zone.role,
  })
  if (grammar.status !== "valid") return blocked("validation-failed", grammar.issues.map((item) => ({
    ...item,
    path: `command.children.${item.path}`,
    nodeId: node.id,
  })), sourceDocument)

  const document = clone(sourceDocument)
  const section = document.document.sections.find((candidate) => candidate.id === context.sectionId)
  const target = section?.nodes[node.id]
  if (target?.type !== "text-block") return blocked("invalid-document", [{
    code: "target-copy-missing", severity: "error", path: "document", nodeId: node.id,
    message: "text-block target could not be resolved in the cloned document",
  }], sourceDocument)
  target.children = clone(input.command.children)

  const validated = validateVNextDocumentV4Structure(document)
  if (validated.status !== "valid") return blocked("validation-failed", validated.issues.map((item) => ({
    code: item.code,
    severity: "error",
    path: `document.${item.path}`,
    message: item.message,
    ...(item.nodeId == null ? {} : { nodeId: item.nodeId }),
  })), sourceDocument)

  const parentNodeIds = parentId == null ? [] : [parentId]
  const affectedNodeIds = [...new Set([node.id, ...parentNodeIds])]
  return {
    source: VNEXT_TEXT_BLOCK_V4_RICH_INLINE_REPLACE_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_V4_RICH_INLINE_REPLACE_CONTRACT_VERSION,
    status: "committed",
    document,
    operation: {
      kind: "text-block.rich-inline.replace",
      source: input.command.source ?? "user",
      targetTextBlockId: node.id,
      requiredActions: actions,
      policyKey: resolvedPolicy.policyKey,
      identity: identityDiff(node.children, input.command.children),
      fieldKeys: [...new Set(input.command.children.flatMap((inline) => inline.type === "field-ref" ? [inline.key] : []))],
      scope: {
        sectionIds: [context.sectionId],
        zoneIds: [context.zoneId],
        nodeIds: [node.id],
        parentNodeIds,
        tableIds: context.tableId == null ? [] : [context.tableId],
        textBlockIds: [node.id],
      },
      historyPolicy: {
        durableIntent: "content",
        kind: "single-entry",
        mergeKey: `rich-inline:${node.id}`,
        summary: `replace rich inline content in ${node.id}`,
        collaborationSafe: false,
      },
      renderInvalidation: {
        lane: "text-content",
        affectedNodeIds,
        affectedSectionIds: [context.sectionId],
        pageScope: { kind: "unknown", reason: "pagination-not-integrated" },
      },
    },
    issues: [],
  }
}
