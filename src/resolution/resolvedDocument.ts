import { z } from "zod"
import type { TextRunStyleV4Target } from "../schema/documentV4Foundation.js"
import type {
  ImageAssetDataValue,
  DataSnapshotV2Value,
} from "../persistence/packageV3ImageTarget.js"
import type { FieldDefinitionV1V3 } from "../persistence/packageV3.js"
import type { DocumentNodeV4Target } from "../schema/documentV4Target.js"
import { validateVNextDocumentV4Structure } from "../schema/documentV4Structure.js"
import {
  VNextResolvedProjectionInputV1Schema,
  safeParseVNextResolvedProjectionInputV1,
  type VNextResolvedProjectionInputV1,
} from "./resolutionInputPins.js"
import { VNextTableDefinitionV1Schema } from "../table/tableDefinitionV1.js"
import { VNextPublishedCollectionItemContractV1Schema } from "../table/collectionItemContractV1.js"
import { VNextPublishedTableContentBindingContractV1Schema } from "../table/tableContentBindingV1.js"
import { createVNextTableContentSourcePlanV1 } from "../table/tableContentSourcePlanV1.js"

export const VNEXT_RESOLVED_DOCUMENT_SOURCE = "vnext-resolved-document"
export const VNEXT_RESOLVED_DOCUMENT_CONTRACT_VERSION = 1 as const
export const VNEXT_SCOPED_RESOLVED_DOCUMENT_SOURCE = "vnext-scoped-resolved-document"
export const VNEXT_SCOPED_RESOLVED_DOCUMENT_CONTRACT_VERSION = 1 as const

export type VNextResolvedDocumentIssueCode =
  | "invalid-resolution-input"
  | "invalid-instance-document"
  | "missing-field-definition"
  | "non-inline-field-ref"
  | "unknown-data-key"
  | "invalid-data-value-type"
  | "unsupported-collection-data"
  | "missing-text-style"
  | "missing-static-media"
  | "missing-instance-media"
  | "image-field-type-mismatch"

export interface VNextResolvedDocumentIssue {
  source: "schema" | "structure" | "field" | "data" | "style" | "media"
  severity: "error"
  code: VNextResolvedDocumentIssueCode
  path: string
  message: string
  targetId?: string
  fieldKey?: string
  assetId?: string
}

export interface VNextResolvedFieldBindingV1 {
  inlineId: string
  textBlockId: string
  fieldKey: string
  value: string
  valueSource: "data-snapshot" | "authored-fallback" | "empty"
}

export interface VNextResolvedImageBindingV1 {
  placementId: string
  fieldKey?: string
  assetId: string | null
  assetOwner: "published-static-media" | "instance-media" | "none"
  valueSource: "authored-static" | "data-snapshot" | "authored-fallback" | "empty"
}

export interface VNextResolvedStyleBindingV1 {
  textBlockId: string
  styleKey: string
  runStyle: TextRunStyleV4Target
  localInlineStyleRemainsOverride: true
}

export interface VNextResolvedDocumentV1 {
  source: typeof VNEXT_RESOLVED_DOCUMENT_SOURCE
  contractVersion: typeof VNEXT_RESOLVED_DOCUMENT_CONTRACT_VERSION
  status: "resolved"
  instanceId: string
  instanceRevision: number
  structureVersionId: string
  document: DocumentNodeV4Target
  pins: {
    fieldContractId: string
    styleCatalogId: string
    staticMediaRegistryId: string
    dataSnapshotId: string
    instanceMediaSnapshotId: string
  }
  bindings: {
    fields: VNextResolvedFieldBindingV1[]
    images: VNextResolvedImageBindingV1[]
    styles: VNextResolvedStyleBindingV1[]
  }
  resources: {
    staticMedia: VNextResolvedProjectionInputV1["published"]["staticMedia"]["registry"]
    instanceMedia: VNextResolvedProjectionInputV1["instanceMedia"]["registry"]
  }
  execution: {
    inputFetch: "not-run"
    authoredGraphMutation: false
    generatedExpansion: "not-run"
    pagination: "not-run"
    rendering: "not-run"
  }
  issues: []
}

export interface VNextResolvedDocumentBlockedV1 {
  source: typeof VNEXT_RESOLVED_DOCUMENT_SOURCE
  contractVersion: typeof VNEXT_RESOLVED_DOCUMENT_CONTRACT_VERSION
  status: "blocked"
  document: null
  bindings: null
  issues: VNextResolvedDocumentIssue[]
}

export type VNextResolvedDocumentResultV1 = VNextResolvedDocumentV1 | VNextResolvedDocumentBlockedV1

export const VNextScopedTableResolutionContractV1Schema = z.object({
  definition: VNextTableDefinitionV1Schema,
  itemContract: VNextPublishedCollectionItemContractV1Schema,
  bindingContract: VNextPublishedTableContentBindingContractV1Schema,
}).strict()

export const VNextScopedResolvedProjectionInputV1Schema = z.object({
  contractVersion: z.literal(VNEXT_SCOPED_RESOLVED_DOCUMENT_CONTRACT_VERSION),
  kind: z.literal("scoped-resolved-projection-input"),
  projection: VNextResolvedProjectionInputV1Schema,
  tables: z.array(VNextScopedTableResolutionContractV1Schema),
}).strict()

export type VNextScopedTableResolutionContractV1 = z.infer<
  typeof VNextScopedTableResolutionContractV1Schema
>
export type VNextScopedResolvedProjectionInputV1 = z.infer<
  typeof VNextScopedResolvedProjectionInputV1Schema
>

export interface VNextDeferredCollectionItemPlacementV1 {
  tableId: string
  tableDefinitionId: string
  rowTemplateId: string
  sourceNodeId: string
  sourcePlacementId: string
  placementKind: "text-field-ref" | "image-field-ref"
  collectionFieldKey: string
  itemFieldKey: string
}

export interface VNextScopedResolvedTablePlanV1 {
  tableId: string
  tableDefinitionId: string
  templateCount: number
  fieldPlacementCount: number
}

export interface VNextScopedResolvedDocumentIssueV1 {
  source: "schema" | "table-scope" | "document-resolution"
  code: string
  path: string
  message: string
  severity: "error"
}

export type VNextScopedResolvedDocumentResultV1 =
  | {
      source: typeof VNEXT_SCOPED_RESOLVED_DOCUMENT_SOURCE
      contractVersion: typeof VNEXT_SCOPED_RESOLVED_DOCUMENT_CONTRACT_VERSION
      status: "resolved"
      resolvedDocument: VNextResolvedDocumentV1
      tablePlans: VNextScopedResolvedTablePlanV1[]
      deferredCollectionItemPlacements: VNextDeferredCollectionItemPlacementV1[]
      execution: {
        tableScopeValidation: "validated"
        collectionRowResolution: "not-run"
        collectionContentMaterialization: "not-run"
        measurement: "not-run"
        pagination: "not-run"
        rendering: "not-run"
      }
      issues: []
    }
  | {
      source: typeof VNEXT_SCOPED_RESOLVED_DOCUMENT_SOURCE
      contractVersion: typeof VNEXT_SCOPED_RESOLVED_DOCUMENT_CONTRACT_VERSION
      status: "blocked"
      resolvedDocument: null
      tablePlans: null
      deferredCollectionItemPlacements: null
      issues: VNextScopedResolvedDocumentIssueV1[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function blocked(issues: VNextResolvedDocumentIssue[]): VNextResolvedDocumentBlockedV1 {
  return {
    source: VNEXT_RESOLVED_DOCUMENT_SOURCE,
    contractVersion: VNEXT_RESOLVED_DOCUMENT_CONTRACT_VERSION,
    status: "blocked",
    document: null,
    bindings: null,
    issues,
  }
}

function scopedBlocked(
  issues: VNextScopedResolvedDocumentIssueV1[],
): Extract<VNextScopedResolvedDocumentResultV1, { status: "blocked" }> {
  return {
    source: VNEXT_SCOPED_RESOLVED_DOCUMENT_SOURCE,
    contractVersion: VNEXT_SCOPED_RESOLVED_DOCUMENT_CONTRACT_VERSION,
    status: "blocked",
    resolvedDocument: null,
    tablePlans: null,
    deferredCollectionItemPlacements: null,
    issues,
  }
}

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function placementScopeKey(sourceNodeId: string, sourcePlacementId: string): string {
  return `${sourceNodeId}\u0000${sourcePlacementId}`
}

function isImageValue(value: DataSnapshotV2Value): value is ImageAssetDataValue {
  return typeof value === "object" && value != null && "kind" in value && value.kind === "image-asset-ref"
}

function scalarMatches(definition: FieldDefinitionV1V3, value: DataSnapshotV2Value): boolean {
  if (value === null) return true
  if (definition.type === "text" || definition.type === "date" || definition.type === "enum") {
    return typeof value === "string"
  }
  if (definition.type === "number") return typeof value === "number" && Number.isFinite(value)
  if (definition.type === "boolean") return typeof value === "boolean"
  return false
}

function scalarText(value: Exclude<DataSnapshotV2Value, ImageAssetDataValue | null>): string {
  return typeof value === "string" ? value : String(value)
}

function validateData(input: VNextResolvedProjectionInputV1): VNextResolvedDocumentIssue[] {
  const issues: VNextResolvedDocumentIssue[] = []
  const fields = input.published.fieldContract.registry.fields
  Object.entries(input.dataSnapshot.data.values).forEach(([fieldKey, value]) => {
    const definition = fields[fieldKey]
    const path = `dataSnapshot.data.values.${fieldKey}`
    if (definition == null) {
      issues.push({
        source: "data", severity: "error", code: "unknown-data-key", path, fieldKey,
        message: `data snapshot contains unknown field key "${fieldKey}"`,
      })
      return
    }
    if (definition.type === "collection") {
      if (value !== null) issues.push({
        source: "data", severity: "error", code: "unsupported-collection-data", path, fieldKey,
        message: `collection field "${fieldKey}" is outside resolved document v1`,
      })
      return
    }
    if (definition.type === "image") {
      if (value !== null && !isImageValue(value)) issues.push({
        source: "data", severity: "error", code: "invalid-data-value-type", path, fieldKey,
        message: `image field "${fieldKey}" requires an image-asset-ref value or null`,
      })
      return
    }
    if (isImageValue(value) || !scalarMatches(definition, value)) issues.push({
      source: "data", severity: "error", code: "invalid-data-value-type", path, fieldKey,
      message: `field "${fieldKey}" has an incompatible data value`,
    })
  })
  return issues
}

function resolveBindings(
  input: VNextResolvedProjectionInputV1,
  deferredItemPlacementKeys: ReadonlySet<string> = new Set(),
): {
  fields: VNextResolvedFieldBindingV1[]
  images: VNextResolvedImageBindingV1[]
  styles: VNextResolvedStyleBindingV1[]
  issues: VNextResolvedDocumentIssue[]
} {
  const fields: VNextResolvedFieldBindingV1[] = []
  const images: VNextResolvedImageBindingV1[] = []
  const styles: VNextResolvedStyleBindingV1[] = []
  const issues: VNextResolvedDocumentIssue[] = []
  const definitions = input.published.fieldContract.registry.fields
  const values = input.dataSnapshot.data.values
  const staticAssets = input.published.staticMedia.registry.images
  const instanceAssets = input.instanceMedia.registry.images

  const resolveImage = (
    placementId: string,
    path: string,
    source: { kind: "asset-ref"; assetId: string } | {
      kind: "image-field-ref"; fieldKey: string; fallbackAssetId?: string
    },
  ): void => {
    if (source.kind === "asset-ref") {
      if (staticAssets[source.assetId] == null) issues.push({
        source: "media", severity: "error", code: "missing-static-media", path: `${path}.source.assetId`,
        targetId: placementId, assetId: source.assetId,
        message: `authored image references missing published static asset "${source.assetId}"`,
      })
      else images.push({
        placementId, assetId: source.assetId, assetOwner: "published-static-media", valueSource: "authored-static",
      })
      return
    }

    const definition = definitions[source.fieldKey]
    if (definition == null || definition.type !== "image") {
      issues.push({
        source: "field", severity: "error", code: "image-field-type-mismatch", path: `${path}.source.fieldKey`,
        targetId: placementId, fieldKey: source.fieldKey,
        message: definition == null
          ? `image placement references missing field "${source.fieldKey}"`
          : `image placement requires an image field; "${source.fieldKey}" is ${definition.type}`,
      })
      return
    }
    if (source.fallbackAssetId != null && staticAssets[source.fallbackAssetId] == null) {
      issues.push({
        source: "media", severity: "error", code: "missing-static-media", path: `${path}.source.fallbackAssetId`,
        targetId: placementId, fieldKey: source.fieldKey, assetId: source.fallbackAssetId,
        message: `image fallback references missing published static asset "${source.fallbackAssetId}"`,
      })
      return
    }

    const value = values[source.fieldKey]
    if (value != null && isImageValue(value)) {
      if (instanceAssets[value.assetId] == null) issues.push({
        source: "media", severity: "error", code: "missing-instance-media", path: `dataSnapshot.data.values.${source.fieldKey}`,
        targetId: placementId, fieldKey: source.fieldKey, assetId: value.assetId,
        message: `image value references missing instance media asset "${value.assetId}"`,
      })
      else images.push({
        placementId, fieldKey: source.fieldKey, assetId: value.assetId,
        assetOwner: "instance-media", valueSource: "data-snapshot",
      })
      return
    }
    if (value != null) return
    if (source.fallbackAssetId != null) images.push({
      placementId, fieldKey: source.fieldKey, assetId: source.fallbackAssetId,
      assetOwner: "published-static-media", valueSource: "authored-fallback",
    })
    else images.push({
      placementId, fieldKey: source.fieldKey, assetId: null, assetOwner: "none", valueSource: "empty",
    })
  }

  input.document.document.sections.forEach((section, sectionIndex) => {
    Object.entries(section.nodes).forEach(([nodeKey, node]) => {
      const nodePath = `document.document.sections[${sectionIndex}].nodes.${nodeKey}`
      if (node.type === "image" && !deferredItemPlacementKeys.has(placementScopeKey(node.id, node.id))) {
        resolveImage(node.id, nodePath, node.source)
      }
      if (node.type !== "text-block") return

      if (node.props.textStyleId != null) {
        const style = input.published.styleCatalog.styles[node.props.textStyleId]
        if (style == null) issues.push({
          source: "style", severity: "error", code: "missing-text-style", path: `${nodePath}.props.textStyleId`,
          targetId: node.id,
          message: `text block references missing style "${node.props.textStyleId}"`,
        })
        else styles.push({
          textBlockId: node.id,
          styleKey: style.key,
          runStyle: clone(style.runStyle),
          localInlineStyleRemainsOverride: true,
        })
      }

      node.children.forEach((inline, inlineIndex) => {
        const inlinePath = `${nodePath}.children[${inlineIndex}]`
        if (inline.type === "inline-image") {
          if (!deferredItemPlacementKeys.has(placementScopeKey(node.id, inline.id))) {
            resolveImage(inline.id, inlinePath, inline.source)
          }
          return
        }
        if (inline.type !== "field-ref") return
        if (deferredItemPlacementKeys.has(placementScopeKey(node.id, inline.id))) return
        const definition = definitions[inline.key]
        if (definition == null) {
          issues.push({
            source: "field", severity: "error", code: "missing-field-definition", path: `${inlinePath}.key`,
            targetId: inline.id, fieldKey: inline.key,
            message: `field-ref references missing field "${inline.key}"`,
          })
          return
        }
        if (definition.type === "image" || definition.type === "collection") {
          issues.push({
            source: "field", severity: "error", code: "non-inline-field-ref", path: `${inlinePath}.key`,
            targetId: inline.id, fieldKey: inline.key,
            message: `field-ref cannot resolve ${definition.type} field "${inline.key}" as inline text`,
          })
          return
        }
        const value = values[inline.key]
        if (value != null && !isImageValue(value) && scalarMatches(definition, value)) fields.push({
          inlineId: inline.id,
          textBlockId: node.id,
          fieldKey: inline.key,
          value: scalarText(value),
          valueSource: "data-snapshot",
        })
        else if (value == null && inline.fallback != null) fields.push({
          inlineId: inline.id,
          textBlockId: node.id,
          fieldKey: inline.key,
          value: inline.fallback,
          valueSource: "authored-fallback",
        })
        else if (value == null) fields.push({
          inlineId: inline.id,
          textBlockId: node.id,
          fieldKey: inline.key,
          value: "",
          valueSource: "empty",
        })
      })
    })
  })

  return { fields, images, styles, issues }
}

function resolveParsedVNextDocumentV1(
  input: VNextResolvedProjectionInputV1,
  deferredItemPlacementKeys: ReadonlySet<string> = new Set(),
): VNextResolvedDocumentResultV1 {
  const structure = validateVNextDocumentV4Structure(input.document)
  const issues: VNextResolvedDocumentIssue[] = structure.issues.map((item) => ({
    source: "structure",
    severity: "error",
    code: "invalid-instance-document",
    path: `document.${item.path}`,
    message: item.message,
    ...(item.nodeId == null ? {} : { targetId: item.nodeId }),
  }))
  issues.push(...validateData(input))
  const bindings = resolveBindings(input, deferredItemPlacementKeys)
  issues.push(...bindings.issues)
  if (issues.length > 0) return blocked(issues)

  return {
    source: VNEXT_RESOLVED_DOCUMENT_SOURCE,
    contractVersion: VNEXT_RESOLVED_DOCUMENT_CONTRACT_VERSION,
    status: "resolved",
    instanceId: input.instance.instanceId,
    instanceRevision: input.instance.revision,
    structureVersionId: input.instance.structureVersion.structureVersionId,
    document: clone(input.document),
    pins: {
      fieldContractId: input.published.fieldContract.fieldContractId,
      styleCatalogId: input.published.styleCatalog.catalogId,
      staticMediaRegistryId: input.published.staticMedia.mediaRegistryId,
      dataSnapshotId: input.dataSnapshot.dataSnapshotId,
      instanceMediaSnapshotId: input.instanceMedia.mediaSnapshotId,
    },
    bindings: {
      fields: bindings.fields,
      images: bindings.images,
      styles: bindings.styles,
    },
    resources: {
      staticMedia: clone(input.published.staticMedia.registry),
      instanceMedia: clone(input.instanceMedia.registry),
    },
    execution: {
      inputFetch: "not-run",
      authoredGraphMutation: false,
      generatedExpansion: "not-run",
      pagination: "not-run",
      rendering: "not-run",
    },
    issues: [],
  }
}

export function resolveVNextDocumentV1(value: unknown): VNextResolvedDocumentResultV1 {
  const parsed = safeParseVNextResolvedProjectionInputV1(value)
  if (!parsed.ok) return blocked(parsed.issues.map((item) => ({
    source: "schema",
    severity: "error",
    code: "invalid-resolution-input",
    path: item.path,
    message: item.message,
  })))
  return resolveParsedVNextDocumentV1(parsed.input)
}

export function resolveVNextScopedDocumentV1(
  value: unknown,
): VNextScopedResolvedDocumentResultV1 {
  const parsed = VNextScopedResolvedProjectionInputV1Schema.safeParse(value)
  if (!parsed.success) return scopedBlocked(parsed.error.issues.map((item) => ({
    source: "schema",
    code: item.code,
    path: formatIssuePath(item.path),
    message: item.message,
    severity: "error",
  })))

  const issues: VNextScopedResolvedDocumentIssueV1[] = []
  const tableIds = new Set<string>()
  const deferredKeys = new Set<string>()
  const deferredCollectionItemPlacements: VNextDeferredCollectionItemPlacementV1[] = []
  const tablePlans: VNextScopedResolvedTablePlanV1[] = []

  parsed.data.tables.forEach((table, tableIndex) => {
    if (tableIds.has(table.definition.tableId)) issues.push({
      source: "table-scope",
      code: "duplicate-table-scope",
      path: `tables[${tableIndex}].definition.tableId`,
      message: `table scope for "${table.definition.tableId}" appears more than once`,
      severity: "error",
    })
    tableIds.add(table.definition.tableId)
    const plan = createVNextTableContentSourcePlanV1({
      document: parsed.data.projection.document,
      definition: table.definition,
      fieldContract: parsed.data.projection.published.fieldContract,
      itemContract: table.itemContract,
      bindingContract: table.bindingContract,
    })
    if (plan.status === "blocked") {
      plan.issues.forEach((item) => issues.push({
        source: "table-scope",
        code: item.code,
        path: `tables[${tableIndex}].${item.path}`,
        message: item.message,
        severity: "error",
      }))
      return
    }
    tablePlans.push({
      tableId: plan.tableId,
      tableDefinitionId: plan.definition.tableDefinitionId,
      templateCount: plan.work.templateCount,
      fieldPlacementCount: plan.work.fieldPlacementCount,
    })
    plan.templates.forEach((template) => {
      const bindings = table.bindingContract.rowTemplates[template.rowTemplateId]
      template.fieldPlacements.forEach((placement) => {
        const binding = bindings?.placements[placement.sourcePlacementId]?.binding
        if (binding?.scope !== "collection-item-field") return
        const key = placementScopeKey(placement.sourceNodeId, placement.sourcePlacementId)
        if (deferredKeys.has(key)) issues.push({
          source: "table-scope",
          code: "duplicate-deferred-placement",
          path: `tables[${tableIndex}].bindingContract.rowTemplates.${template.rowTemplateId}`,
          message: `item-scoped placement "${placement.sourcePlacementId}" is claimed more than once`,
          severity: "error",
        })
        deferredKeys.add(key)
        deferredCollectionItemPlacements.push({
          tableId: plan.tableId,
          tableDefinitionId: plan.definition.tableDefinitionId,
          rowTemplateId: template.rowTemplateId,
          sourceNodeId: placement.sourceNodeId,
          sourcePlacementId: placement.sourcePlacementId,
          placementKind: placement.placementKind,
          collectionFieldKey: binding.collectionFieldKey,
          itemFieldKey: binding.itemFieldKey,
        })
      })
    })
  })
  if (issues.length > 0) return scopedBlocked(issues)

  const resolvedDocument = resolveParsedVNextDocumentV1(parsed.data.projection, deferredKeys)
  if (resolvedDocument.status === "blocked") return scopedBlocked(resolvedDocument.issues.map((item) => ({
    source: "document-resolution",
    code: item.code,
    path: item.path,
    message: item.message,
    severity: "error",
  })))
  return {
    source: VNEXT_SCOPED_RESOLVED_DOCUMENT_SOURCE,
    contractVersion: VNEXT_SCOPED_RESOLVED_DOCUMENT_CONTRACT_VERSION,
    status: "resolved",
    resolvedDocument,
    tablePlans,
    deferredCollectionItemPlacements,
    execution: {
      tableScopeValidation: "validated",
      collectionRowResolution: "not-run",
      collectionContentMaterialization: "not-run",
      measurement: "not-run",
      pagination: "not-run",
      rendering: "not-run",
    },
    issues: [],
  }
}
