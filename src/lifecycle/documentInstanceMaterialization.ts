import { z } from "zod"
import {
  DocumentNodeV4TargetSchema,
  type DocumentNodeV4Target,
} from "../schema/documentV4Target.js"
import { validateVNextDocumentV4Structure } from "../schema/documentV4Structure.js"
import {
  VNextDocumentInstanceIdentityV1Schema,
  VNextPublishedStructureVersionIdentityV1Schema,
  VNextPublishedStructureVersionRefV1Schema,
  sameVNextPublishedStructureVersionRefV1,
  type VNextDocumentInstanceIdentityV1,
  type VNextPublishedStructureVersionIdentityV1,
  type VNextPublishedStructureVersionRefV1,
} from "./structureIdentity.js"
import {
  VNextStructurePolicySetV1Schema,
  type VNextStructurePolicySetV1,
} from "./structurePolicy.js"

export const VNEXT_DOCUMENT_INSTANCE_MATERIALIZATION_SOURCE = "vnext-document-instance-materialization"
export const VNEXT_DOCUMENT_INSTANCE_MATERIALIZATION_CONTRACT_VERSION = 1 as const

const NonBlankTitleSchema = z.string().refine((value) => value.trim().length > 0, {
  message: "instance title must not be whitespace",
})

export const VNextDocumentInstanceMaterializationRequestV1Schema = z.object({
  contractVersion: z.literal(VNEXT_DOCUMENT_INSTANCE_MATERIALIZATION_CONTRACT_VERSION),
  kind: z.literal("document-instance-materialization-request"),
  publishedStructure: VNextPublishedStructureVersionIdentityV1Schema,
  instance: VNextDocumentInstanceIdentityV1Schema,
  starterDocument: DocumentNodeV4TargetSchema,
  policySet: VNextStructurePolicySetV1Schema,
  instanceMeta: z.object({ title: NonBlankTitleSchema }).strict(),
}).strict()

export type VNextDocumentInstanceMaterializationRequestV1 = z.infer<
  typeof VNextDocumentInstanceMaterializationRequestV1Schema
>

export type VNextDocumentInstanceMaterializationIssueCode =
  | "invalid-request"
  | "instance-revision-not-zero"
  | "instance-structure-version-mismatch"
  | "policy-owner-not-published"
  | "policy-owner-version-mismatch"
  | "invalid-starter-structure"
  | "policy-binding-node-missing"

export interface VNextDocumentInstanceMaterializationIssue {
  source: "schema" | "identity" | "policy" | "structure"
  severity: "error"
  code: VNextDocumentInstanceMaterializationIssueCode
  path: string
  message: string
}

export interface VNextDocumentInstanceMaterializationProvenanceV1 {
  sourceStructureVersion: VNextPublishedStructureVersionRefV1
  document: {
    sourceDocumentId: string
    instanceDocumentId: string
  }
  sections: Array<{
    sourceSectionId: string
    instanceSectionId: string
  }>
  nodes: Array<{
    sectionId: string
    sourceNodeId: string
    instanceNodeId: string
  }>
  inlines: Array<{
    sectionId: string
    textBlockId: string
    sourceInlineId: string
    instanceInlineId: string
  }>
}

export interface VNextDocumentInstanceRegistryOwnershipV1 {
  fieldContract: "published-structure-version"
  styleCatalog: "published-structure-version"
  staticAssets: "published-structure-version"
  instanceAssets: "document-instance"
  dataSnapshot: "instance-generation-context"
}

export interface VNextDocumentInstanceMaterializationPlanV1 {
  source: typeof VNEXT_DOCUMENT_INSTANCE_MATERIALIZATION_SOURCE
  contractVersion: typeof VNEXT_DOCUMENT_INSTANCE_MATERIALIZATION_CONTRACT_VERSION
  status: "planned"
  publishedStructure: VNextPublishedStructureVersionIdentityV1
  instance: VNextDocumentInstanceIdentityV1
  document: DocumentNodeV4Target
  policy: {
    policySetId: string
    owner: VNextPublishedStructureVersionRefV1
    bindingMode: "published-structure-reference"
  }
  provenance: VNextDocumentInstanceMaterializationProvenanceV1
  registryOwnership: VNextDocumentInstanceRegistryOwnershipV1
  execution: {
    persistence: "not-run"
    revisionAdvance: false
    generatedExpansion: "not-run"
    dataResolution: "not-run"
  }
  issues: []
}

export interface VNextDocumentInstanceMaterializationBlockedV1 {
  source: typeof VNEXT_DOCUMENT_INSTANCE_MATERIALIZATION_SOURCE
  contractVersion: typeof VNEXT_DOCUMENT_INSTANCE_MATERIALIZATION_CONTRACT_VERSION
  status: "blocked"
  document: null
  provenance: null
  issues: VNextDocumentInstanceMaterializationIssue[]
}

export type VNextDocumentInstanceMaterializationResultV1 =
  | VNextDocumentInstanceMaterializationPlanV1
  | VNextDocumentInstanceMaterializationBlockedV1

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function blocked(issues: VNextDocumentInstanceMaterializationIssue[]): VNextDocumentInstanceMaterializationBlockedV1 {
  return {
    source: VNEXT_DOCUMENT_INSTANCE_MATERIALIZATION_SOURCE,
    contractVersion: VNEXT_DOCUMENT_INSTANCE_MATERIALIZATION_CONTRACT_VERSION,
    status: "blocked",
    document: null,
    provenance: null,
    issues,
  }
}

function publishedRef(identity: VNextPublishedStructureVersionIdentityV1): VNextPublishedStructureVersionRefV1 {
  return VNextPublishedStructureVersionRefV1Schema.parse({
    structureId: identity.structureId,
    structureVersionId: identity.structureVersionId,
    versionOrdinal: identity.versionOrdinal,
  })
}

function collectProvenance(
  source: DocumentNodeV4Target,
  instanceId: string,
  sourceStructureVersion: VNextPublishedStructureVersionRefV1,
): VNextDocumentInstanceMaterializationProvenanceV1 {
  const sections: VNextDocumentInstanceMaterializationProvenanceV1["sections"] = []
  const nodes: VNextDocumentInstanceMaterializationProvenanceV1["nodes"] = []
  const inlines: VNextDocumentInstanceMaterializationProvenanceV1["inlines"] = []

  source.document.sections.forEach((section) => {
    sections.push({ sourceSectionId: section.id, instanceSectionId: section.id })
    Object.values(section.nodes).forEach((node) => {
      nodes.push({ sectionId: section.id, sourceNodeId: node.id, instanceNodeId: node.id })
      if (node.type === "text-block") {
        node.children.forEach((inline) => inlines.push({
          sectionId: section.id,
          textBlockId: node.id,
          sourceInlineId: inline.id,
          instanceInlineId: inline.id,
        }))
      }
    })
  })

  return {
    sourceStructureVersion: clone(sourceStructureVersion),
    document: {
      sourceDocumentId: source.document.id,
      instanceDocumentId: instanceId,
    },
    sections,
    nodes,
    inlines,
  }
}

function validateSemanticRequest(
  request: VNextDocumentInstanceMaterializationRequestV1,
): VNextDocumentInstanceMaterializationIssue[] {
  const issues: VNextDocumentInstanceMaterializationIssue[] = []
  const ref = publishedRef(request.publishedStructure)

  if (request.instance.revision !== 0) issues.push({
    source: "identity",
    severity: "error",
    code: "instance-revision-not-zero",
    path: "instance.revision",
    message: "materialization requires a backend-allocated document instance at revision 0",
  })
  if (!sameVNextPublishedStructureVersionRefV1(request.instance.structureVersion, ref)) issues.push({
    source: "identity",
    severity: "error",
    code: "instance-structure-version-mismatch",
    path: "instance.structureVersion",
    message: "document instance must pin the exact published structure version being materialized",
  })
  if (request.policySet.owner.kind !== "published-structure-version") issues.push({
    source: "policy",
    severity: "error",
    code: "policy-owner-not-published",
    path: "policySet.owner.kind",
    message: "materialization requires a policy set owned by a published structure version",
  })
  if (
    request.policySet.owner.kind === "published-structure-version"
    && !sameVNextPublishedStructureVersionRefV1(request.policySet.owner.ref, ref)
  ) issues.push({
    source: "policy",
    severity: "error",
    code: "policy-owner-version-mismatch",
    path: "policySet.owner.ref",
    message: "policy set must belong to the exact published structure version being materialized",
  })

  const structure = validateVNextDocumentV4Structure(request.starterDocument)
  structure.issues.forEach((item) => issues.push({
    source: "structure",
    severity: "error",
    code: "invalid-starter-structure",
    path: `starterDocument.${item.path}`,
    message: item.message,
  }))

  const nodeIds = new Set(
    request.starterDocument.document.sections.flatMap((section) => Object.keys(section.nodes)),
  )
  Object.keys(request.policySet.nodeBindings).forEach((nodeId) => {
    if (!nodeIds.has(nodeId)) issues.push({
      source: "policy",
      severity: "error",
      code: "policy-binding-node-missing",
      path: `policySet.nodeBindings.${nodeId}`,
      message: `policy binding references missing starter node "${nodeId}"`,
    })
  })

  return issues
}

export function planVNextDocumentInstanceMaterializationV1(
  value: unknown,
): VNextDocumentInstanceMaterializationResultV1 {
  const parsed = VNextDocumentInstanceMaterializationRequestV1Schema.safeParse(value)
  if (!parsed.success) return blocked(parsed.error.issues.map((item) => ({
    source: "schema",
    severity: "error",
    code: "invalid-request",
    path: formatIssuePath(item.path),
    message: item.message,
  })))

  const request = parsed.data
  const issues = validateSemanticRequest(request)
  if (issues.length > 0) return blocked(issues)

  const ref = publishedRef(request.publishedStructure)
  const document = clone(request.starterDocument)
  document.document.id = request.instance.instanceId
  document.document.meta = { title: request.instanceMeta.title }

  return {
    source: VNEXT_DOCUMENT_INSTANCE_MATERIALIZATION_SOURCE,
    contractVersion: VNEXT_DOCUMENT_INSTANCE_MATERIALIZATION_CONTRACT_VERSION,
    status: "planned",
    publishedStructure: clone(request.publishedStructure),
    instance: clone(request.instance),
    document,
    policy: {
      policySetId: request.policySet.policySetId,
      owner: clone(ref),
      bindingMode: "published-structure-reference",
    },
    provenance: collectProvenance(request.starterDocument, request.instance.instanceId, ref),
    registryOwnership: {
      fieldContract: "published-structure-version",
      styleCatalog: "published-structure-version",
      staticAssets: "published-structure-version",
      instanceAssets: "document-instance",
      dataSnapshot: "instance-generation-context",
    },
    execution: {
      persistence: "not-run",
      revisionAdvance: false,
      generatedExpansion: "not-run",
      dataResolution: "not-run",
    },
    issues: [],
  }
}
