import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  VNextPublishedStructureVersionRefV1Schema,
  sameVNextPublishedStructureVersionRefV1,
  type VNextPublishedStructureVersionRefV1,
} from "../lifecycle/structureIdentity.js"
import {
  VNextPublishedStructureGenerationDataContractV1Schema,
  type VNextPublishedStructureGenerationDataContractV1,
} from "./publishedStructureGenerationInputV1.js"
import {
  DocumentNodeV4TargetSchema,
  type AuthoredNodeV4Target,
  type DocumentNodeV4Target,
  type DocumentSectionV4Target,
} from "../schema/documentV4Target.js"
import { validateVNextDocumentV4Structure } from "../schema/documentV4Structure.js"
import type { ZoneRoleV4Target } from "../schema/documentV4Foundation.js"
import type { FieldDefinitionV1V3 } from "../persistence/packageV3.js"
import {
  VNextTableDefinitionV1Schema,
  type VNextTableDefinitionV1,
} from "../table/tableDefinitionV1.js"
import {
  VNextPublishedTableContentBindingContractV1Schema,
  validateVNextTableContentContractsV1,
  type VNextPublishedTableContentBindingContractV1,
  type VNextTableContentPlacementBindingV1,
} from "../table/tableContentBindingV1.js"
import {
  createVNextTableContentSourcePlanV1,
} from "../table/tableContentSourcePlanV1.js"
import type {
  VNextCollectionItemFallbackV1,
  VNextCollectionItemFieldDefinitionV1,
} from "../table/collectionItemContractV1.js"

export const VNEXT_PUBLISHED_STRUCTURE_TEST_INPUT_PROJECTION_SOURCE = (
  "vnext-published-structure-test-input-projection"
) as const
export const VNEXT_PUBLISHED_STRUCTURE_TEST_INPUT_PROJECTION_CONTRACT_VERSION = 1 as const

const FingerprintSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u)

export const VNextPublishedStructureTestInputProjectionRequestV1Schema = z.object({
  contractVersion: z.literal(VNEXT_PUBLISHED_STRUCTURE_TEST_INPUT_PROJECTION_CONTRACT_VERSION),
  kind: z.literal("published-structure-test-input-projection-request"),
  structure: z.object({
    owner: VNextPublishedStructureVersionRefV1Schema,
    structureFingerprint: FingerprintSchema,
    document: DocumentNodeV4TargetSchema,
  }).strict(),
  dataContract: VNextPublishedStructureGenerationDataContractV1Schema,
  tables: z.array(z.object({
    definition: VNextTableDefinitionV1Schema,
    bindingContract: VNextPublishedTableContentBindingContractV1Schema,
  }).strict()),
}).strict()

export type VNextPublishedStructureTestInputProjectionRequestV1 = z.infer<
  typeof VNextPublishedStructureTestInputProjectionRequestV1Schema
>

export type VNextTestInputValueTypeV1 = FieldDefinitionV1V3["type"]

export interface VNextTestInputMetadataUnavailableV1 {
  status: "metadata-unavailable"
  reason: "not-represented-by-generation-data-contract"
}

export interface VNextTestInputConstraintNotApplicableV1 {
  status: "not-applicable"
}

export type VNextTestInputRequiredFactV1 =
  | {
      status: "available"
      source: "collection-item-contract"
      value: boolean
    }
  | VNextTestInputMetadataUnavailableV1

export type VNextTestInputDefaultFactV1 =
  | {
      status: "available"
      source: "collection-item-contract"
      value: VNextCollectionItemFallbackV1
    }
  | {
      status: "absent"
      source: "collection-item-contract"
    }
  | {
      status: "unsupported"
      source: "collection-item-contract"
      reason: "published-static-media-owner-not-bound"
    }
  | VNextTestInputMetadataUnavailableV1
  | VNextTestInputConstraintNotApplicableV1

export type VNextTestInputAllowedValuesFactV1 =
  | {
      status: "available"
      source: "generation-data-contract"
      values: string[]
    }
  | VNextTestInputMetadataUnavailableV1
  | VNextTestInputConstraintNotApplicableV1

export type VNextTestInputValueFormatFactV1 =
  | {
      status: "available"
      source: "generation-data-contract"
      format: string
    }
  | VNextTestInputMetadataUnavailableV1
  | VNextTestInputConstraintNotApplicableV1

export interface VNextTestInputValueConstraintsV1 {
  required: VNextTestInputRequiredFactV1
  defaultValue: VNextTestInputDefaultFactV1
  allowedValues: VNextTestInputAllowedValuesFactV1
  valueFormat: VNextTestInputValueFormatFactV1
}

export interface VNextTestInputImageAssetRequirementV1 {
  valueKind: "image-asset-ref"
  assetRegistry: "instance-media-snapshot-v1"
  referencedAssetMustExist: true
  publishedAssetFallback: "unsupported-without-static-media-owner-binding"
}

export type VNextTestInputPlacementKindV1 =
  | "text-field-ref"
  | "image-field-ref"
  | "collection-repeat"

export interface VNextTestInputFirstPlacementV1 {
  sectionId: string
  sectionIndex: number
  zoneId: string
  zoneRole: ZoneRoleV4Target
  nodeId: string
  placementId: string
  placementKind: VNextTestInputPlacementKindV1
  documentOrder: number
  path: string
  context:
    | { kind: "document-field" }
    | { kind: "collection-repeat"; collectionFieldKey: string }
    | { kind: "collection-item-template"; collectionFieldKey: string }
}

export type VNextTestInputPlacementSummaryV1 =
  | {
      status: "placed"
      placementCount: number
      firstPlacement: VNextTestInputFirstPlacementV1
    }
  | {
      status: "unplaced"
      placementCount: 0
      firstPlacement: null
    }

export interface VNextTestInputCollectionItemFieldProjectionV1 {
  scope: "collection-item-field"
  collectionFieldKey: string
  key: string
  label: string
  valueType: Exclude<VNextTestInputValueTypeV1, "collection">
  canonicalTarget: "table-collection-snapshot-v1"
  placement: VNextTestInputPlacementSummaryV1
  constraints: VNextTestInputValueConstraintsV1
  imageAssetInput: VNextTestInputImageAssetRequirementV1 | null
}

export interface VNextTestInputCollectionProjectionV1 {
  canonicalTarget: "table-collection-snapshot-v1"
  repeat: {
    supported: true
    itemOrder: "snapshot-array-order"
    minimumItems: VNextTestInputMetadataUnavailableV1
    maximumItems: VNextTestInputMetadataUnavailableV1
  }
  itemIdentity: {
    key: "itemKey"
    required: true
    uniqueness: "within-collection"
  }
  itemFields: VNextTestInputCollectionItemFieldProjectionV1[]
}

export interface VNextTestInputDocumentFieldProjectionV1 {
  scope: "document-field"
  key: string
  label: string
  valueType: VNextTestInputValueTypeV1
  canonicalTarget: "instance-data-snapshot-v1" | "table-collection-snapshot-v1"
  placement: VNextTestInputPlacementSummaryV1
  constraints: VNextTestInputValueConstraintsV1
  imageAssetInput: VNextTestInputImageAssetRequirementV1 | null
  collection: VNextTestInputCollectionProjectionV1 | null
}

export type VNextTestInputFieldGroupV1 =
  | {
      kind: "section"
      groupId: string
      sectionId: string
      sectionIndex: number
      fieldKeys: string[]
    }
  | {
      kind: "unplaced"
      groupId: "unplaced"
      fieldKeys: string[]
    }

export interface VNextTestInputTableContractSummaryV1 {
  tableId: string
  tableDefinitionId: string
  tableDefinitionFingerprint: string
  bindingContractId: string
  bindingContractFingerprint: string
  collectionFieldKeys: string[]
}

export type VNextPublishedStructureTestInputProjectionIssueCode =
  | "invalid-request"
  | "structure-owner-mismatch"
  | "structure-fingerprint-mismatch"
  | "invalid-document-structure"
  | "missing-collection-item-contract"
  | "table-owner-mismatch"
  | "duplicate-table-contract"
  | "duplicate-placement-binding"
  | "invalid-table-contract"
  | "unknown-document-field"
  | "unknown-collection-field"
  | "unknown-collection-item-field"
  | "embedded-field-key-mismatch"
  | "placement-kind-mismatch"

export interface VNextPublishedStructureTestInputProjectionIssueV1 {
  source: "schema" | "identity" | "structure" | "contract" | "placement"
  severity: "error"
  code: VNextPublishedStructureTestInputProjectionIssueCode
  path: string
  message: string
}

export interface VNextPublishedStructureTestInputProjectionV1 {
  source: typeof VNEXT_PUBLISHED_STRUCTURE_TEST_INPUT_PROJECTION_SOURCE
  contractVersion: typeof VNEXT_PUBLISHED_STRUCTURE_TEST_INPUT_PROJECTION_CONTRACT_VERSION
  kind: "published-structure-test-input-projection"
  status: "ready"
  owner: VNextPublishedStructureVersionRefV1
  structureFingerprint: string
  dataContract: {
    dataContractId: string
    dataContractFingerprint: string
    fieldContractId: string
    collectionItemContractId: string | null
  }
  tableContracts: VNextTestInputTableContractSummaryV1[]
  groups: VNextTestInputFieldGroupV1[]
  fields: VNextTestInputDocumentFieldProjectionV1[]
  summary: {
    documentFieldCount: number
    placedDocumentFieldCount: number
    unplacedDocumentFieldCount: number
    collectionFieldCount: number
    collectionItemFieldCount: number
    placedCollectionItemFieldCount: number
    imageFieldCount: number
    unavailableConstraintFactCount: number
  }
  execution: {
    valueCollection: "not-run"
    snapshotCreation: "not-run"
    validation: "not-run"
    materialization: "not-run"
    resolution: "not-run"
    artifact: "not-run"
  }
  contracts: {
    uiNeutral: true
    oneDocumentValuePerFieldKey: true
    presentationPlacementControlsInputIdentity: false
    authoredFallbackPromotedToGenerationDefault: false
    businessValuesAccepted: false
    productionBinding: false
  }
  projectionFingerprint: string
  issues: []
}

export interface VNextPublishedStructureTestInputProjectionBlockedV1 {
  source: typeof VNEXT_PUBLISHED_STRUCTURE_TEST_INPUT_PROJECTION_SOURCE
  contractVersion: typeof VNEXT_PUBLISHED_STRUCTURE_TEST_INPUT_PROJECTION_CONTRACT_VERSION
  status: "blocked"
  projection: null
  issues: VNextPublishedStructureTestInputProjectionIssueV1[]
}

export type VNextPublishedStructureTestInputProjectionResultV1 =
  | VNextPublishedStructureTestInputProjectionV1
  | VNextPublishedStructureTestInputProjectionBlockedV1

interface PlacementAccumulator {
  placementCount: number
  firstPlacement: VNextTestInputFirstPlacementV1 | null
}

interface BoundPlacement {
  tableId: string
  placement: VNextTableContentPlacementBindingV1
}

interface ProjectionIndexes {
  tablesById: Map<string, VNextTableDefinitionV1>
  bindingsByPlacementId: Map<string, BoundPlacement>
  tableContracts: VNextTestInputTableContractSummaryV1[]
}

const METADATA_UNAVAILABLE: VNextTestInputMetadataUnavailableV1 = {
  status: "metadata-unavailable",
  reason: "not-represented-by-generation-data-contract",
}
const NOT_APPLICABLE: VNextTestInputConstraintNotApplicableV1 = { status: "not-applicable" }
const IMAGE_ASSET_INPUT: VNextTestInputImageAssetRequirementV1 = {
  valueKind: "image-asset-ref",
  assetRegistry: "instance-media-snapshot-v1",
  referencedAssetMustExist: true,
  publishedAssetFallback: "unsupported-without-static-media-owner-binding",
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue)
  if (value == null || typeof value !== "object") return value
  return Object.fromEntries(
    Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => [key, canonicalValue((value as Record<string, unknown>)[key])]),
  )
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(JSON.stringify(canonicalValue(value)))
}

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function publishedRef(
  contract: VNextPublishedStructureGenerationDataContractV1,
): VNextPublishedStructureVersionRefV1 {
  return {
    structureId: contract.publishedStructure.structureId,
    structureVersionId: contract.publishedStructure.structureVersionId,
    versionOrdinal: contract.publishedStructure.versionOrdinal,
  }
}

function blocked(
  issues: VNextPublishedStructureTestInputProjectionIssueV1[],
): VNextPublishedStructureTestInputProjectionBlockedV1 {
  return {
    source: VNEXT_PUBLISHED_STRUCTURE_TEST_INPUT_PROJECTION_SOURCE,
    contractVersion: VNEXT_PUBLISHED_STRUCTURE_TEST_INPUT_PROJECTION_CONTRACT_VERSION,
    status: "blocked",
    projection: null,
    issues,
  }
}

function addIssue(
  issues: VNextPublishedStructureTestInputProjectionIssueV1[],
  source: VNextPublishedStructureTestInputProjectionIssueV1["source"],
  code: VNextPublishedStructureTestInputProjectionIssueCode,
  path: string,
  message: string,
): void {
  issues.push({ source, severity: "error", code, path, message })
}

function childIds(node: AuthoredNodeV4Target): readonly string[] {
  if (node.type === "zone" || node.type === "column" || node.type === "table-cell") return node.childIds
  if (node.type === "columns") return node.columnIds
  if (node.type === "table") return node.rowIds
  if (node.type === "table-row") return node.cellIds
  return []
}

function metadataUnavailable(): VNextTestInputMetadataUnavailableV1 {
  return clone(METADATA_UNAVAILABLE)
}

function notApplicable(): VNextTestInputConstraintNotApplicableV1 {
  return clone(NOT_APPLICABLE)
}

function documentConstraints(type: VNextTestInputValueTypeV1): VNextTestInputValueConstraintsV1 {
  return {
    required: metadataUnavailable(),
    defaultValue: type === "collection" ? notApplicable() : metadataUnavailable(),
    allowedValues: type === "enum" ? metadataUnavailable() : notApplicable(),
    valueFormat: type === "date" ? metadataUnavailable() : notApplicable(),
  }
}

function itemDefault(
  field: VNextCollectionItemFieldDefinitionV1,
): VNextTestInputDefaultFactV1 {
  if (field.fallback == null) return { status: "absent", source: "collection-item-contract" }
  if (typeof field.fallback === "object") return {
    status: "unsupported",
    source: "collection-item-contract",
    reason: "published-static-media-owner-not-bound",
  }
  return { status: "available", source: "collection-item-contract", value: clone(field.fallback) }
}

function itemConstraints(
  field: VNextCollectionItemFieldDefinitionV1,
): VNextTestInputValueConstraintsV1 {
  return {
    required: {
      status: "available",
      source: "collection-item-contract",
      value: field.required,
    },
    defaultValue: itemDefault(field),
    allowedValues: field.type === "enum" ? metadataUnavailable() : notApplicable(),
    valueFormat: field.type === "date" ? metadataUnavailable() : notApplicable(),
  }
}

function placementSummary(
  placements: Map<string, PlacementAccumulator>,
  key: string,
): VNextTestInputPlacementSummaryV1 {
  const placement = placements.get(key)
  if (placement?.firstPlacement == null) return {
    status: "unplaced",
    placementCount: 0,
    firstPlacement: null,
  }
  return {
    status: "placed",
    placementCount: placement.placementCount,
    firstPlacement: clone(placement.firstPlacement),
  }
}

function recordPlacement(
  placements: Map<string, PlacementAccumulator>,
  key: string,
  placement: VNextTestInputFirstPlacementV1,
): void {
  const current = placements.get(key) ?? { placementCount: 0, firstPlacement: null }
  current.placementCount += 1
  current.firstPlacement ??= clone(placement)
  placements.set(key, current)
}

function placementAccepts(
  placementKind: Exclude<VNextTestInputPlacementKindV1, "collection-repeat">,
  type: VNextTestInputValueTypeV1,
): boolean {
  return placementKind === "image-field-ref"
    ? type === "image"
    : type !== "image" && type !== "collection"
}

function buildProjectionIndexes(
  request: VNextPublishedStructureTestInputProjectionRequestV1,
  owner: VNextPublishedStructureVersionRefV1,
  issues: VNextPublishedStructureTestInputProjectionIssueV1[],
): ProjectionIndexes {
  const tablesById = new Map<string, VNextTableDefinitionV1>()
  const bindingsByPlacementId = new Map<string, BoundPlacement>()
  const tableContracts: VNextTestInputTableContractSummaryV1[] = []
  const itemContract = request.dataContract.collectionItemContract
  const sortedTables = [...request.tables].sort((left, right) => (
    left.definition.tableId.localeCompare(right.definition.tableId)
    || left.definition.tableDefinitionId.localeCompare(right.definition.tableDefinitionId)
  ))

  sortedTables.forEach(({ definition, bindingContract }, tableIndex) => {
    const path = `tables[${tableIndex}]`
    if (tablesById.has(definition.tableId)) addIssue(
      issues,
      "contract",
      "duplicate-table-contract",
      `${path}.definition.tableId`,
      `table "${definition.tableId}" has more than one projection contract`,
    )
    else tablesById.set(definition.tableId, definition)

    if (
      definition.owner.kind !== "published-structure-version"
      || !sameVNextPublishedStructureVersionRefV1(definition.owner.ref, owner)
      || !sameVNextPublishedStructureVersionRefV1(bindingContract.owner, owner)
    ) addIssue(
      issues,
      "identity",
      "table-owner-mismatch",
      `${path}.definition.owner`,
      `table "${definition.tableId}" must belong to the exact Published Structure Version`,
    )

    if (itemContract == null) {
      addIssue(
        issues,
        "contract",
        "missing-collection-item-contract",
        "dataContract.collectionItemContract",
        `table "${definition.tableId}" cannot project collection input without an item contract`,
      )
      return
    }

    const validation = validateVNextTableContentContractsV1({
      definition,
      fieldContract: request.dataContract.fieldContract,
      itemContract,
      bindingContract,
    })
    if (validation.status === "blocked") validation.issues.forEach((issue) => addIssue(
      issues,
      "contract",
      "invalid-table-contract",
      `${path}.${issue.path}`,
      issue.message,
    ))

    const sourcePlan = createVNextTableContentSourcePlanV1({
      document: request.structure.document,
      definition,
      fieldContract: request.dataContract.fieldContract,
      itemContract,
      bindingContract,
    })
    if (sourcePlan.status === "blocked") sourcePlan.issues.forEach((issue) => addIssue(
      issues,
      "contract",
      "invalid-table-contract",
      `${path}.${issue.path}`,
      issue.message,
    ))

    const reachablePlacementIds = new Set(
      sourcePlan.status === "ready"
        ? sourcePlan.templates.flatMap((template) => (
            template.fieldPlacements.map((placement) => placement.sourcePlacementId)
          ))
        : [],
    )
    Object.values(bindingContract.rowTemplates).forEach((template) => {
      Object.values(template.placements).forEach((placement) => {
        if (!reachablePlacementIds.has(placement.sourcePlacementId)) return
        if (bindingsByPlacementId.has(placement.sourcePlacementId)) addIssue(
          issues,
          "contract",
          "duplicate-placement-binding",
          `${path}.bindingContract.rowTemplates.${template.rowTemplateId}.placements.${placement.sourcePlacementId}`,
          `placement "${placement.sourcePlacementId}" is bound by more than one table contract`,
        )
        else bindingsByPlacementId.set(placement.sourcePlacementId, {
          tableId: definition.tableId,
          placement,
        })
      })
    })

    tableContracts.push({
      tableId: definition.tableId,
      tableDefinitionId: definition.tableDefinitionId,
      tableDefinitionFingerprint: fingerprint(definition),
      bindingContractId: bindingContract.tableContentBindingContractId,
      bindingContractFingerprint: fingerprint(bindingContract),
      collectionFieldKeys: [...new Set(definition.rowSources.flatMap((source) => (
        source.kind === "collection-rows" ? [source.collectionFieldKey] : []
      )))].sort(),
    })
  })

  return { tablesById, bindingsByPlacementId, tableContracts }
}

interface TraversalContext {
  section: DocumentSectionV4Target
  sectionIndex: number
  zoneId: string
  zoneRole: ZoneRoleV4Target
}

function collectPlacements(
  document: DocumentNodeV4Target,
  dataContract: VNextPublishedStructureGenerationDataContractV1,
  indexes: ProjectionIndexes,
  issues: VNextPublishedStructureTestInputProjectionIssueV1[],
): {
  documentPlacements: Map<string, PlacementAccumulator>
  itemPlacements: Map<string, Map<string, PlacementAccumulator>>
} {
  const fields = dataContract.fieldContract.registry.fields
  const itemShapes = dataContract.collectionItemContract?.collections ?? {}
  const documentPlacements = new Map<string, PlacementAccumulator>()
  const itemPlacements = new Map<string, Map<string, PlacementAccumulator>>()
  let documentOrder = 0

  const nextPlacement = (
    context: TraversalContext,
    nodeId: string,
    placementId: string,
    placementKind: VNextTestInputPlacementKindV1,
    path: string,
    placementContext: VNextTestInputFirstPlacementV1["context"],
  ): VNextTestInputFirstPlacementV1 => ({
    sectionId: context.section.id,
    sectionIndex: context.sectionIndex,
    zoneId: context.zoneId,
    zoneRole: context.zoneRole,
    nodeId,
    placementId,
    placementKind,
    documentOrder: documentOrder++,
    path,
    context: placementContext,
  })

  const collectFieldPlacement = (
    context: TraversalContext,
    nodeId: string,
    placementId: string,
    placementKind: "text-field-ref" | "image-field-ref",
    embeddedFieldKey: string,
    path: string,
  ): void => {
    const bound = indexes.bindingsByPlacementId.get(placementId)
    if (bound != null && bound.placement.placementKind !== placementKind) {
      addIssue(
        issues,
        "placement",
        "placement-kind-mismatch",
        path,
        `placement "${placementId}" does not match its ${bound.placement.placementKind} binding`,
      )
      return
    }

    if (bound?.placement.binding.scope === "collection-item-field") {
      const binding = bound.placement.binding
      if (binding.itemFieldKey !== embeddedFieldKey) addIssue(
        issues,
        "placement",
        "embedded-field-key-mismatch",
        path,
        `placement "${placementId}" embeds "${embeddedFieldKey}" but binds "${binding.itemFieldKey}"`,
      )
      const itemField = itemShapes[binding.collectionFieldKey]?.fields[binding.itemFieldKey]
      if (itemField == null) {
        addIssue(
          issues,
          "placement",
          "unknown-collection-item-field",
          path,
          `placement "${placementId}" references unknown item field "${binding.itemFieldKey}"`,
        )
        return
      }
      if (!placementAccepts(placementKind, itemField.type)) {
        addIssue(
          issues,
          "placement",
          "placement-kind-mismatch",
          path,
          `${placementKind} cannot place collection item field type ${itemField.type}`,
        )
        return
      }
      const collectionPlacements = itemPlacements.get(binding.collectionFieldKey) ?? new Map()
      recordPlacement(
        collectionPlacements,
        binding.itemFieldKey,
        nextPlacement(context, nodeId, placementId, placementKind, path, {
          kind: "collection-item-template",
          collectionFieldKey: binding.collectionFieldKey,
        }),
      )
      itemPlacements.set(binding.collectionFieldKey, collectionPlacements)
      return
    }

    const fieldKey = bound?.placement.binding.scope === "document-field"
      ? bound.placement.binding.fieldKey
      : embeddedFieldKey
    if (fieldKey !== embeddedFieldKey) addIssue(
      issues,
      "placement",
      "embedded-field-key-mismatch",
      path,
      `placement "${placementId}" embeds "${embeddedFieldKey}" but binds "${fieldKey}"`,
    )
    const field = fields[fieldKey]
    if (field == null) {
      addIssue(
        issues,
        "placement",
        "unknown-document-field",
        path,
        `placement "${placementId}" references unknown document field "${fieldKey}"`,
      )
      return
    }
    if (!placementAccepts(placementKind, field.type)) {
      addIssue(
        issues,
        "placement",
        "placement-kind-mismatch",
        path,
        `${placementKind} cannot place document field type ${field.type}`,
      )
      return
    }
    recordPlacement(
      documentPlacements,
      fieldKey,
      nextPlacement(context, nodeId, placementId, placementKind, path, { kind: "document-field" }),
    )
  }

  const collectCollectionPlacements = (
    context: TraversalContext,
    node: Extract<AuthoredNodeV4Target, { type: "table" }>,
    path: string,
  ): void => {
    const definition = indexes.tablesById.get(node.id)
    if (definition == null) return
    definition.rowSources.forEach((source, sourceIndex) => {
      if (source.kind !== "collection-rows") return
      const field = fields[source.collectionFieldKey]
      const sourcePath = `${path}.collectionRowSources[${sourceIndex}]`
      if (field == null || field.type !== "collection") {
        addIssue(
          issues,
          "placement",
          "unknown-collection-field",
          sourcePath,
          `table "${node.id}" references unknown collection field "${source.collectionFieldKey}"`,
        )
        return
      }
      recordPlacement(
        documentPlacements,
        source.collectionFieldKey,
        nextPlacement(context, node.id, node.id, "collection-repeat", sourcePath, {
          kind: "collection-repeat",
          collectionFieldKey: source.collectionFieldKey,
        }),
      )
    })
  }

  const visit = (nodeId: string, path: string, context: TraversalContext): void => {
    const node = context.section.nodes[nodeId]
    if (node == null) return
    if (node.type === "table") collectCollectionPlacements(context, node, path)
    if (node.type === "image" && node.source.kind === "image-field-ref") collectFieldPlacement(
      context,
      node.id,
      node.id,
      "image-field-ref",
      node.source.fieldKey,
      `${path}.source.fieldKey`,
    )
    if (node.type === "text-block") node.children.forEach((inline, inlineIndex) => {
      const inlinePath = `${path}.children[${inlineIndex}]`
      if (inline.type === "field-ref") collectFieldPlacement(
        context,
        node.id,
        inline.id,
        "text-field-ref",
        inline.key,
        `${inlinePath}.key`,
      )
      if (inline.type === "inline-image" && inline.source.kind === "image-field-ref") collectFieldPlacement(
        context,
        node.id,
        inline.id,
        "image-field-ref",
        inline.source.fieldKey,
        `${inlinePath}.source.fieldKey`,
      )
    })
    childIds(node).forEach((childId) => visit(
      childId,
      `structure.document.document.sections[${context.sectionIndex}].nodes.${childId}`,
      context,
    ))
  }

  document.document.sections.forEach((section, sectionIndex) => {
    section.zoneIds.forEach((zoneId) => {
      const zone = section.nodes[zoneId]
      if (zone?.type !== "zone") return
      const context: TraversalContext = {
        section,
        sectionIndex,
        zoneId,
        zoneRole: zone.role,
      }
      visit(zoneId, `structure.document.document.sections[${sectionIndex}].nodes.${zoneId}`, context)
    })
  })

  return { documentPlacements, itemPlacements }
}

function sortByPlacement<T extends { key: string; placement: VNextTestInputPlacementSummaryV1 }>(
  values: T[],
): T[] {
  return [...values].sort((left, right) => {
    const leftOrder = left.placement.firstPlacement?.documentOrder ?? Number.POSITIVE_INFINITY
    const rightOrder = right.placement.firstPlacement?.documentOrder ?? Number.POSITIVE_INFINITY
    return leftOrder - rightOrder || left.key.localeCompare(right.key)
  })
}

function projectFields(
  dataContract: VNextPublishedStructureGenerationDataContractV1,
  documentPlacements: Map<string, PlacementAccumulator>,
  itemPlacements: Map<string, Map<string, PlacementAccumulator>>,
): VNextTestInputDocumentFieldProjectionV1[] {
  const itemShapes = dataContract.collectionItemContract?.collections ?? {}
  const fields = Object.values(dataContract.fieldContract.registry.fields).map((field) => {
    const placement = placementSummary(documentPlacements, field.key)
    const shape = field.type === "collection" ? itemShapes[field.key] : undefined
    const projectedItems = shape == null ? [] : sortByPlacement(Object.values(shape.fields).map((itemField) => ({
      scope: "collection-item-field" as const,
      collectionFieldKey: field.key,
      key: itemField.key,
      label: itemField.label,
      valueType: itemField.type,
      canonicalTarget: "table-collection-snapshot-v1" as const,
      placement: placementSummary(itemPlacements.get(field.key) ?? new Map(), itemField.key),
      constraints: itemConstraints(itemField),
      imageAssetInput: itemField.type === "image" ? clone(IMAGE_ASSET_INPUT) : null,
    })))
    return {
      scope: "document-field" as const,
      key: field.key,
      label: field.label,
      valueType: field.type,
      canonicalTarget: field.type === "collection"
        ? "table-collection-snapshot-v1" as const
        : "instance-data-snapshot-v1" as const,
      placement,
      constraints: documentConstraints(field.type),
      imageAssetInput: field.type === "image" ? clone(IMAGE_ASSET_INPUT) : null,
      collection: field.type === "collection" ? {
        canonicalTarget: "table-collection-snapshot-v1" as const,
        repeat: {
          supported: true as const,
          itemOrder: "snapshot-array-order" as const,
          minimumItems: metadataUnavailable(),
          maximumItems: metadataUnavailable(),
        },
        itemIdentity: {
          key: "itemKey" as const,
          required: true as const,
          uniqueness: "within-collection" as const,
        },
        itemFields: projectedItems,
      } : null,
    }
  })
  return sortByPlacement(fields)
}

function projectGroups(
  fields: readonly VNextTestInputDocumentFieldProjectionV1[],
): VNextTestInputFieldGroupV1[] {
  const sectionGroups = new Map<string, Extract<VNextTestInputFieldGroupV1, { kind: "section" }>>()
  const unplaced: string[] = []
  fields.forEach((field) => {
    const first = field.placement.firstPlacement
    if (first == null) {
      unplaced.push(field.key)
      return
    }
    const current = sectionGroups.get(first.sectionId) ?? {
      kind: "section" as const,
      groupId: `section:${first.sectionId}`,
      sectionId: first.sectionId,
      sectionIndex: first.sectionIndex,
      fieldKeys: [],
    }
    current.fieldKeys.push(field.key)
    sectionGroups.set(first.sectionId, current)
  })
  const groups: VNextTestInputFieldGroupV1[] = [...sectionGroups.values()]
    .sort((left, right) => left.sectionIndex - right.sectionIndex)
  if (unplaced.length > 0) groups.push({ kind: "unplaced", groupId: "unplaced", fieldKeys: unplaced.sort() })
  return groups
}

function unavailableFactCount(fields: readonly VNextTestInputDocumentFieldProjectionV1[]): number {
  const constraints = fields.flatMap((field) => [
    field.constraints,
    ...(field.collection?.itemFields.map((item) => item.constraints) ?? []),
  ])
  return constraints.reduce((count, constraint) => count + [
    constraint.required,
    constraint.defaultValue,
    constraint.allowedValues,
    constraint.valueFormat,
  ].filter((fact) => fact.status === "metadata-unavailable").length, 0)
}

export function projectVNextPublishedStructureTestInputV1(
  value: unknown,
): VNextPublishedStructureTestInputProjectionResultV1 {
  const parsed = VNextPublishedStructureTestInputProjectionRequestV1Schema.safeParse(value)
  if (!parsed.success) return blocked(parsed.error.issues.map((issue) => ({
    source: "schema",
    severity: "error",
    code: "invalid-request",
    path: formatIssuePath(issue.path),
    message: issue.message,
  })))

  const request = parsed.data
  const issues: VNextPublishedStructureTestInputProjectionIssueV1[] = []
  const owner = publishedRef(request.dataContract)
  if (!sameVNextPublishedStructureVersionRefV1(request.structure.owner, owner)) addIssue(
    issues,
    "identity",
    "structure-owner-mismatch",
    "structure.owner",
    "projection Structure owner must equal the generation data contract Published Structure Version",
  )
  if (request.structure.structureFingerprint !== request.dataContract.publishedStructureFingerprint) addIssue(
    issues,
    "identity",
    "structure-fingerprint-mismatch",
    "structure.structureFingerprint",
    "projection Structure fingerprint must equal the generation data contract Structure fingerprint",
  )

  const structure = validateVNextDocumentV4Structure(request.structure.document)
  structure.issues.forEach((issue) => addIssue(
    issues,
    "structure",
    "invalid-document-structure",
    `structure.document.${issue.path}`,
    issue.message,
  ))

  Object.values(request.dataContract.fieldContract.registry.fields).forEach((field) => {
    if (field.type === "collection" && request.dataContract.collectionItemContract?.collections[field.key] == null) {
      addIssue(
        issues,
        "contract",
        "missing-collection-item-contract",
        `dataContract.fieldContract.registry.fields.${field.key}`,
        `collection field "${field.key}" requires an item contract before test input can be projected`,
      )
    }
  })

  const indexes = buildProjectionIndexes(request, owner, issues)
  if (issues.length > 0) return blocked(issues)

  const placements = collectPlacements(
    request.structure.document,
    request.dataContract,
    indexes,
    issues,
  )
  if (issues.length > 0) return blocked(issues)

  const fields = projectFields(request.dataContract, placements.documentPlacements, placements.itemPlacements)
  const groups = projectGroups(fields)
  const itemFields = fields.flatMap((field) => field.collection?.itemFields ?? [])
  const facts = {
    source: VNEXT_PUBLISHED_STRUCTURE_TEST_INPUT_PROJECTION_SOURCE,
    contractVersion: VNEXT_PUBLISHED_STRUCTURE_TEST_INPUT_PROJECTION_CONTRACT_VERSION,
    kind: "published-structure-test-input-projection" as const,
    status: "ready" as const,
    owner: clone(owner),
    structureFingerprint: request.structure.structureFingerprint,
    dataContract: {
      dataContractId: request.dataContract.dataContractId,
      dataContractFingerprint: request.dataContract.dataContractFingerprint,
      fieldContractId: request.dataContract.fieldContract.fieldContractId,
      collectionItemContractId: request.dataContract.collectionItemContract?.collectionItemContractId ?? null,
    },
    tableContracts: indexes.tableContracts,
    groups,
    fields,
    summary: {
      documentFieldCount: fields.length,
      placedDocumentFieldCount: fields.filter((field) => field.placement.status === "placed").length,
      unplacedDocumentFieldCount: fields.filter((field) => field.placement.status === "unplaced").length,
      collectionFieldCount: fields.filter((field) => field.valueType === "collection").length,
      collectionItemFieldCount: itemFields.length,
      placedCollectionItemFieldCount: itemFields.filter((field) => field.placement.status === "placed").length,
      imageFieldCount: fields.filter((field) => field.valueType === "image").length
        + itemFields.filter((field) => field.valueType === "image").length,
      unavailableConstraintFactCount: unavailableFactCount(fields),
    },
    execution: {
      valueCollection: "not-run" as const,
      snapshotCreation: "not-run" as const,
      validation: "not-run" as const,
      materialization: "not-run" as const,
      resolution: "not-run" as const,
      artifact: "not-run" as const,
    },
    contracts: {
      uiNeutral: true as const,
      oneDocumentValuePerFieldKey: true as const,
      presentationPlacementControlsInputIdentity: false as const,
      authoredFallbackPromotedToGenerationDefault: false as const,
      businessValuesAccepted: false as const,
      productionBinding: false as const,
    },
  }

  return {
    ...facts,
    projectionFingerprint: fingerprint(facts),
    issues: [],
  }
}
