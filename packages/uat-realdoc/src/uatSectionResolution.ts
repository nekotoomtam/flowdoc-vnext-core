import { createHash } from "node:crypto"
import { z } from "zod"
import {
  VNEXT_IDENTITY_PROFILES_V1,
  VNextDocumentInstanceIdentityV1Schema,
  VNextInstanceDataSnapshotV1Schema,
  VNextInstanceMediaSnapshotV1Schema,
  VNextPublishedStructureCanonicalSnapshotInputV1Schema,
  VNextTableCollectionSnapshotV1Schema,
  createVNextDerivedIdentityProvenanceV1,
  createVNextTableContentSourcePlanV1,
  materializeVNextTableContentV1,
  planVNextDocumentInstanceMaterializationV1,
  resolveVNextScopedDocumentV1,
  resolveVNextTableRowsV1,
  type VNextAllocatedIdentityKindV1,
  type VNextAllocatedIdentityV1,
  type VNextDerivedIdentityOriginV1,
  type VNextDocumentInstanceIdentityV1,
  type VNextDocumentInstanceMaterializationPlanV1,
  type VNextPublishedTableContentBindingContractV1,
  type VNextPublishedStructureCanonicalSnapshotInputV1,
  type VNextResolvedTableRowsReadyV1,
  type VNextScopedResolvedDocumentResultV1,
  type VNextTableCollectionIdentityAssignmentV1,
  type VNextTableContentIdentityAssignmentsV1,
  type VNextTableContentMaterializationResultV1,
  type VNextTableDefinitionV1,
} from "@flowdoc/vnext-core"
import {
  FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID,
  type FlowDocUatSectionDataBundleV1,
  type FlowDocUatSourcePointerV1,
} from "./uatSemanticNoPagesAdapter.js"
import { FLOWDOC_IMPORTED_TEXT_NORMALIZATION_PROFILE_ID } from "./importedTextNormalization.js"
import { createFlowDocUatStructureDefinitionV1 } from "./uatStructureDefinition.js"

export const FLOWDOC_UAT_SECTION_RESOLUTION_VERSION = 1 as const
export const FLOWDOC_UAT_SECTION_RESOLUTION_ID = "flowdoc-uat-section-resolution-v1" as const
export const FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY = (
  "section-after-requirements-source-order"
) as const

const InputSchema = z.object({
  contractVersion: z.literal(FLOWDOC_UAT_SECTION_RESOLUTION_VERSION),
  kind: z.literal("uat-section-resolution-request"),
  adapterBundle: z.unknown(),
  screenshotPlacementPolicy: z.literal(FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY),
}).strict()

const CanonicalGenerationInputSchema = z.object({
  contractVersion: z.literal(FLOWDOC_UAT_SECTION_RESOLUTION_VERSION),
  kind: z.literal("uat-canonical-generation-resolution-request"),
  canonicalInput: VNextPublishedStructureCanonicalSnapshotInputV1Schema,
  canonicalInputFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
  publishedStructureFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
  screenshotPlacementPolicy: z.literal(FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY),
}).strict()

const FingerprintSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u)
const SourcePointerSchema = z.object({
  sourcePointer: z.string().nullable(),
  derivation: z.enum([
    "copy", "normalized-list", "normalized-imported-text", "media-identity", "default-empty",
  ]),
}).passthrough()
const AdapterBundlePinsSchema = z.object({
  adapterId: z.literal(FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID),
  bundleFingerprint: FingerprintSchema,
  structureFingerprint: FingerprintSchema,
  instance: VNextDocumentInstanceIdentityV1Schema,
  dataSnapshot: VNextInstanceDataSnapshotV1Schema,
  collectionSnapshot: VNextTableCollectionSnapshotV1Schema,
  mediaSnapshot: VNextInstanceMediaSnapshotV1Schema,
  sourceSet: z.object({
    sourceSetId: z.string().min(1),
    selectedSectionNumber: z.string().min(1),
  }).passthrough(),
  semantic: z.object({
    relations: z.object({ screenshotOrder: z.array(z.string().min(1)) }).passthrough(),
  }).passthrough(),
  provenance: z.object({
    collections: z.record(z.string().min(1), z.object({
      items: z.record(z.string().min(1), SourcePointerSchema),
    }).passthrough()),
  }).passthrough(),
  textNormalization: z.object({
    profileId: z.literal(FLOWDOC_IMPORTED_TEXT_NORMALIZATION_PROFILE_ID),
    normalizationFingerprint: FingerprintSchema,
  }).passthrough(),
  summary: z.object({
    requirementCount: z.number().int().nonnegative(),
    screenshotCount: z.number().int().nonnegative(),
  }).passthrough(),
}).passthrough()

export interface FlowDocUatSectionResolutionRequestV1 {
  contractVersion: typeof FLOWDOC_UAT_SECTION_RESOLUTION_VERSION
  kind: "uat-section-resolution-request"
  adapterBundle: FlowDocUatSectionDataBundleV1
  screenshotPlacementPolicy: typeof FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY
}

export interface FlowDocUatCanonicalGenerationResolutionRequestV1 {
  contractVersion: typeof FLOWDOC_UAT_SECTION_RESOLUTION_VERSION
  kind: "uat-canonical-generation-resolution-request"
  canonicalInput: VNextPublishedStructureCanonicalSnapshotInputV1
  canonicalInputFingerprint: string
  publishedStructureFingerprint: string
  screenshotPlacementPolicy: typeof FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY
}

type ScopedResolutionReadyV1 = Extract<VNextScopedResolvedDocumentResultV1, { status: "resolved" }>
type TableMaterializationReadyV1 = Extract<VNextTableContentMaterializationResultV1, { status: "materialized" }>

export interface FlowDocUatResolvedTableV1 {
  definitionId: string
  tableId: string
  collectionFieldKey: "uat.requirements" | "uat.screenshots"
  resolvedRows: VNextResolvedTableRowsReadyV1
  materializedContent: TableMaterializationReadyV1
}

export interface FlowDocUatSourceToInstanceRowV1 {
  collectionFieldKey: "uat.requirements" | "uat.screenshots"
  itemKey: string
  source: FlowDocUatSourcePointerV1
  tableId: string
  rowInstanceId: string
}

export interface FlowDocUatResolvedSectionContentV1 {
  structureFingerprint: string
  resolutionInputFingerprint: string
  instance: VNextDocumentInstanceIdentityV1
  instanceMaterialization: VNextDocumentInstanceMaterializationPlanV1
  scopedResolution: ScopedResolutionReadyV1
  tables: {
    requirements: FlowDocUatResolvedTableV1
    screenshots: FlowDocUatResolvedTableV1
  }
  screenshotPlacement: {
    status: "resolved"
    policy: typeof FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY
    bodyOrder: ["uat-requirements-table", "uat-screenshots-heading", "uat-screenshots-table"]
    screenshotOrder: string[]
    requirementLevelPlacement: false
    basis: "page-geometry-and-granular-links-unavailable"
  }
  provenance: {
    starterGraph: VNextDocumentInstanceMaterializationPlanV1["provenance"]
    sourceToInstanceRows: FlowDocUatSourceToInstanceRowV1[]
    generated: TableMaterializationReadyV1["provenance"]
  }
  execution: {
    persistence: "not-run"
    revisionAdvance: false
    documentMaterialization: "planned"
    documentResolution: "resolved"
    collectionRowResolution: "resolved"
    collectionContentMaterialization: "materialized"
    measurement: "not-run"
    pagination: "not-run"
    rendering: "not-run"
  }
  summary: {
    documentFieldBindingCount: number
    styleBindingCount: number
    tableCount: 2
    resolvedRowCount: number
    materializedRowCount: number
    authoredReferenceRowCount: number
    clonedNodeCount: number
    clonedInlineCount: number
    textBindingCount: number
    imageBindingCount: number
    sourceToInstanceRowCount: number
  }
}

export interface FlowDocUatSectionResolutionBundleV1 extends FlowDocUatResolvedSectionContentV1 {
  contractVersion: typeof FLOWDOC_UAT_SECTION_RESOLUTION_VERSION
  kind: "uat-section-resolution-bundle"
  resolutionId: typeof FLOWDOC_UAT_SECTION_RESOLUTION_ID
  adapter: {
    adapterId: typeof FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID
    bundleFingerprint: string
    sourceSetId: string
    selectedSectionNumber: string
    textNormalizationProfileId: typeof FLOWDOC_IMPORTED_TEXT_NORMALIZATION_PROFILE_ID
    textNormalizationFingerprint: string
  }
  bundleFingerprint: string
}

export interface FlowDocUatCanonicalGenerationResolutionBundleV1 extends FlowDocUatResolvedSectionContentV1 {
  contractVersion: typeof FLOWDOC_UAT_SECTION_RESOLUTION_VERSION
  kind: "uat-canonical-generation-resolution-bundle"
  resolutionId: "flowdoc-uat-canonical-generation-resolution-v1"
  generation: {
    canonicalInputFingerprint: string
    publishedStructureFingerprint: string
    source: "backend-protected-canonical-record"
  }
  bundleFingerprint: string
}

export type FlowDocUatMeasuredResolutionBundleV1 =
  | FlowDocUatSectionResolutionBundleV1
  | FlowDocUatCanonicalGenerationResolutionBundleV1

export interface FlowDocUatSectionResolutionIssueV1 {
  source: "schema" | "adapter-bundle" | "canonical-generation" | "placement" | "instance" | "resolution" | "table"
  code: string
  path: string
  message: string
  severity: "error"
}

export type FlowDocUatSectionResolutionResultV1 =
  | {
      status: "resolved"
      bundle: FlowDocUatSectionResolutionBundleV1
      issues: []
    }
  | {
      status: "blocked"
      bundle: null
      issues: FlowDocUatSectionResolutionIssueV1[]
    }

export type FlowDocUatCanonicalGenerationResolutionResultV1 =
  | {
      status: "resolved"
      bundle: FlowDocUatCanonicalGenerationResolutionBundleV1
      issues: []
    }
  | {
      status: "blocked"
      bundle: null
      issues: FlowDocUatSectionResolutionIssueV1[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function formatPath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => (
    typeof segment === "number"
      ? `${current}[${segment}]`
      : current === "" ? String(segment) : `${current}.${String(segment)}`
  ), "")
}

function issue(
  source: FlowDocUatSectionResolutionIssueV1["source"],
  code: string,
  path: string,
  message: string,
): FlowDocUatSectionResolutionIssueV1 {
  return { source, code, path, message, severity: "error" }
}

function blocked(issues: FlowDocUatSectionResolutionIssueV1[]): FlowDocUatSectionResolutionResultV1 {
  return { status: "blocked", bundle: null, issues }
}

function fingerprint(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex")}`
}

function adapterBundleFingerprint(bundle: FlowDocUatSectionDataBundleV1): string {
  const { bundleFingerprint: _bundleFingerprint, ...unsigned } = bundle
  return fingerprint(unsigned)
}

function allocatedIdentity(
  identityKind: Extract<VNextAllocatedIdentityKindV1, "resolved-row" | "resolved-cell" | "resolved-node" | "resolved-inline">,
  origin: VNextDerivedIdentityOriginV1,
  instance: VNextDocumentInstanceIdentityV1,
  resolutionInputFingerprint: string,
): VNextAllocatedIdentityV1 {
  const profile = VNEXT_IDENTITY_PROFILES_V1[identityKind]
  const payload = fingerprint({
    identityKind,
    origin,
    scope: {
      documentInstanceId: instance.instanceId,
      instanceRevision: instance.revision,
      resolutionInputFingerprint,
    },
  }).slice("sha256:".length, "sha256:".length + 24)
  return {
    contractVersion: 1,
    kind: "allocated-identity",
    identityKind,
    identityClass: profile.identityClass,
    id: `${profile.prefix}_${payload}`,
    allocationOwner: profile.allocationOwner,
    allocationStrategy: "deterministic",
    scope: {
      kind: "document-resolution",
      documentInstanceId: instance.instanceId,
      instanceRevision: instance.revision,
      resolutionInputFingerprint,
    },
  }
}

function provenance(
  identityKind: Extract<VNextAllocatedIdentityKindV1, "resolved-row" | "resolved-cell" | "resolved-node" | "resolved-inline">,
  origin: VNextDerivedIdentityOriginV1,
  instance: VNextDocumentInstanceIdentityV1,
  resolutionInputFingerprint: string,
) {
  return createVNextDerivedIdentityProvenanceV1(
    allocatedIdentity(identityKind, origin, instance, resolutionInputFingerprint),
    origin,
  )
}

function rowIdentityAssignments(input: {
  instance: VNextDocumentInstanceIdentityV1
  resolutionInputFingerprint: string
  definition: VNextTableDefinitionV1
  collectionSnapshot: FlowDocUatSectionDataBundleV1["collectionSnapshot"]
}): VNextTableCollectionIdentityAssignmentV1[] {
  const revisionPins = {
    structureVersionOrdinal: input.instance.structureVersion.versionOrdinal,
    instanceRevision: input.instance.revision,
    collectionSnapshotRevision: input.collectionSnapshot.snapshotRevision,
  }
  return input.definition.rowSources.flatMap((source): VNextTableCollectionIdentityAssignmentV1[] => {
    if (source.kind !== "collection-rows") return []
    const template = input.definition.rowTemplates[source.rowTemplateId]
    const collection = input.collectionSnapshot.collections[source.collectionFieldKey]
    if (template == null || collection == null) return []
    return collection.items.map((item) => {
      const rowOrigin: VNextDerivedIdentityOriginV1 = {
        kind: "collection-row",
        refs: {
          tableId: input.definition.tableId,
          rowSourceId: source.rowSourceId,
          rowTemplateId: source.rowTemplateId,
          sourceRowId: template.sourceRowId,
          collectionFieldKey: source.collectionFieldKey,
          itemKey: item.itemKey,
        },
        revisionPins,
      }
      const row = provenance("resolved-row", rowOrigin, input.instance, input.resolutionInputFingerprint)
      const rowInstanceId = row.identity.id
      const cells = Object.fromEntries(template.cells.map((cell) => {
        const cellOrigin: VNextDerivedIdentityOriginV1 = {
          kind: "resolved-cell",
          refs: { ...rowOrigin.refs, sourceCellId: cell.cellId, rowInstanceId },
          revisionPins,
        }
        return [
          cell.cellId,
          provenance("resolved-cell", cellOrigin, input.instance, input.resolutionInputFingerprint),
        ]
      }))
      return { rowSourceId: source.rowSourceId, itemKey: item.itemKey, row, cells }
    })
  })
}

function contentIdentityAssignments(input: {
  instance: VNextDocumentInstanceIdentityV1
  resolutionInputFingerprint: string
  definition: VNextTableDefinitionV1
  rows: VNextResolvedTableRowsReadyV1
  sourcePlan: Extract<ReturnType<typeof createVNextTableContentSourcePlanV1>, { status: "ready" }>
}): VNextTableContentIdentityAssignmentsV1 {
  const templates = new Map(input.sourcePlan.templates.map((template) => [template.rowTemplateId, template]))
  const revisionPins = {
    structureVersionOrdinal: input.instance.structureVersion.versionOrdinal,
    instanceRevision: input.instance.revision,
    collectionSnapshotRevision: input.rows.collectionSnapshotRevision ?? 0,
  }
  return {
    contractVersion: 1,
    kind: "table-content-identity-assignments",
    rows: input.rows.rows.flatMap((row) => {
      if (row.source.kind !== "collection-row" || row.identity.kind !== "allocated-row") return []
      const rowInstanceId = row.identity.provenance.identity.id
      const template = templates.get(row.source.rowTemplateId)
      if (template == null) return []
      const rowRefs = {
        tableId: input.definition.tableId,
        rowSourceId: row.source.rowSourceId,
        rowTemplateId: row.source.rowTemplateId,
        sourceRowId: row.source.sourceRowId,
        collectionFieldKey: row.source.collectionFieldKey,
        itemKey: row.source.itemKey,
        rowInstanceId,
      }
      const cells = Object.fromEntries(template.cells.map((sourceCell) => {
        const resolvedCell = row.cells.find((cell) => cell.sourceCellId === sourceCell.sourceCellId)
        if (resolvedCell?.identity.kind !== "allocated-cell") {
          throw new Error(`resolved cell identity missing for ${sourceCell.sourceCellId}`)
        }
        const cellInstanceId = resolvedCell.identity.provenance.identity.id
        const nodes = Object.fromEntries(sourceCell.sourceNodes.map((sourceNode) => {
          const nodeRefs = {
            ...rowRefs,
            sourceCellId: sourceCell.sourceCellId,
            cellInstanceId,
            sourceNodeId: sourceNode.sourceNodeId,
          }
          const nodeOrigin: VNextDerivedIdentityOriginV1 = {
            kind: "resolved-node",
            refs: nodeRefs,
            revisionPins,
          }
          const node = provenance("resolved-node", nodeOrigin, input.instance, input.resolutionInputFingerprint)
          const inlines = Object.fromEntries(sourceNode.sourceInlineIds.map((sourceInlineId) => {
            const inlineOrigin: VNextDerivedIdentityOriginV1 = {
              kind: "resolved-inline",
              refs: {
                ...nodeRefs,
                sourceTextBlockId: sourceNode.sourceNodeId,
                sourceInlineId,
                resolvedNodeId: node.identity.id,
              },
              revisionPins,
            }
            return [
              sourceInlineId,
              provenance("resolved-inline", inlineOrigin, input.instance, input.resolutionInputFingerprint),
            ]
          }))
          return [sourceNode.sourceNodeId, { sourceNodeId: sourceNode.sourceNodeId, node, inlines }]
        }))
        return [sourceCell.sourceCellId, { sourceCellId: sourceCell.sourceCellId, nodes }]
      }))
      return [{ rowInstanceId, cells }]
    }),
  }
}

function globalBindings(input: {
  instance: VNextDocumentInstanceIdentityV1
  resolutionInputFingerprint: string
  bindingContract: VNextPublishedTableContentBindingContractV1
  resolvedDocument: ScopedResolutionReadyV1["resolvedDocument"]
}) {
  const text: Record<string, {
    sourcePlacementId: string
    fieldKey: string
    value: string
    valueSource: "data-snapshot" | "authored-fallback" | "empty"
  }> = {}
  const images: Record<string, {
    sourcePlacementId: string
    fieldKey: string
    assetId: string | null
    assetOwner: "published-static-media" | "instance-media" | "none"
    valueSource: "data-snapshot" | "authored-fallback" | "empty"
  }> = {}
  Object.values(input.bindingContract.rowTemplates).forEach((template) => {
    Object.values(template.placements).forEach((placement) => {
      if (placement.binding.scope !== "document-field") return
      if (placement.placementKind === "text-field-ref") {
        const found = input.resolvedDocument.bindings.fields.find(
          (binding) => binding.inlineId === placement.sourcePlacementId,
        )
        if (found != null) text[placement.sourcePlacementId] = {
          sourcePlacementId: placement.sourcePlacementId,
          fieldKey: placement.binding.fieldKey,
          value: found.value,
          valueSource: found.valueSource,
        }
        return
      }
      const found = input.resolvedDocument.bindings.images.find(
        (binding) => binding.placementId === placement.sourcePlacementId,
      )
      if (found != null && found.valueSource !== "authored-static") images[placement.sourcePlacementId] = {
        sourcePlacementId: placement.sourcePlacementId,
        fieldKey: placement.binding.fieldKey,
        assetId: found.assetId,
        assetOwner: found.assetOwner,
        valueSource: found.valueSource,
      }
    })
  })
  return {
    contractVersion: 1 as const,
    kind: "table-global-resolved-bindings" as const,
    instanceId: input.instance.instanceId,
    instanceRevision: input.instance.revision,
    resolutionInputFingerprint: input.resolutionInputFingerprint,
    text,
    images,
  }
}

function resolveTable(input: {
  instance: VNextDocumentInstanceIdentityV1
  resolutionInputFingerprint: string
  document: VNextDocumentInstanceMaterializationPlanV1["document"]
  definition: VNextTableDefinitionV1
  bindingContract: VNextPublishedTableContentBindingContractV1
  fieldContract: ReturnType<typeof createFlowDocUatStructureDefinitionV1>["fieldContract"]
  itemContract: ReturnType<typeof createFlowDocUatStructureDefinitionV1>["collectionItemContract"]
  collectionSnapshot: FlowDocUatSectionDataBundleV1["collectionSnapshot"]
  scopedResolution: ScopedResolutionReadyV1
}): FlowDocUatResolvedTableV1 | FlowDocUatSectionResolutionIssueV1[] {
  const assignments = rowIdentityAssignments(input)
  const rows = resolveVNextTableRowsV1({
    contractVersion: 1,
    kind: "resolved-table-rows-request",
    instance: input.instance,
    resolutionInputFingerprint: input.resolutionInputFingerprint,
    definition: input.definition,
    fieldContract: input.fieldContract,
    collectionSnapshot: input.collectionSnapshot,
    identityAssignments: assignments,
  })
  if (rows.status !== "resolved") return rows.issues.map((item) => issue(
    "table", item.code, `${input.definition.tableId}.${item.path}`, item.message,
  ))

  const sourcePlan = createVNextTableContentSourcePlanV1({
    document: input.document,
    definition: input.definition,
    fieldContract: input.fieldContract,
    itemContract: input.itemContract,
    bindingContract: input.bindingContract,
  })
  if (sourcePlan.status !== "ready") return sourcePlan.issues.map((item) => issue(
    "table", item.code, `${input.definition.tableId}.${item.path}`, item.message,
  ))

  const content = materializeVNextTableContentV1({
    contractVersion: 1,
    kind: "table-content-materialization-request",
    document: input.document,
    definition: input.definition,
    fieldContract: input.fieldContract,
    itemContract: input.itemContract,
    bindingContract: input.bindingContract,
    resolvedRows: rows,
    identityAssignments: contentIdentityAssignments({
      instance: input.instance,
      resolutionInputFingerprint: input.resolutionInputFingerprint,
      definition: input.definition,
      rows,
      sourcePlan,
    }),
    globalBindings: globalBindings({
      instance: input.instance,
      resolutionInputFingerprint: input.resolutionInputFingerprint,
      bindingContract: input.bindingContract,
      resolvedDocument: input.scopedResolution.resolvedDocument,
    }),
  })
  if (content.status !== "materialized") return content.issues.map((item) => issue(
    "table", item.code, `${input.definition.tableId}.${item.path}`, item.message,
  ))

  const collectionSource = input.definition.rowSources.find((source) => source.kind === "collection-rows")
  if (collectionSource?.kind !== "collection-rows") return [issue(
    "table", "missing-collection-source", input.definition.tableId,
    "UAT resolved table requires one collection row source",
  )]
  if (collectionSource.collectionFieldKey !== "uat.requirements"
    && collectionSource.collectionFieldKey !== "uat.screenshots") return [issue(
      "table", "unexpected-collection-source", input.definition.tableId,
      `unexpected UAT collection field "${collectionSource.collectionFieldKey}"`,
    )]
  return {
    definitionId: input.definition.tableDefinitionId,
    tableId: input.definition.tableId,
    collectionFieldKey: collectionSource.collectionFieldKey,
    resolvedRows: rows,
    materializedContent: content,
  }
}

function sourceToInstanceRows(
  adapterBundle: FlowDocUatSectionDataBundleV1,
  tables: readonly FlowDocUatResolvedTableV1[],
): FlowDocUatSourceToInstanceRowV1[] {
  return tables.flatMap((table) => table.materializedContent.rows.flatMap((row) => {
    if (row.kind !== "materialized-content") return []
    const source = adapterBundle.provenance.collections[table.collectionFieldKey]?.items[row.itemKey]
    if (source == null) return []
    return [{
      collectionFieldKey: table.collectionFieldKey,
      itemKey: row.itemKey,
      source: clone(source),
      tableId: table.tableId,
      rowInstanceId: row.rowInstanceId,
    }]
  }))
}

function validateAdapterBundle(
  bundle: FlowDocUatSectionDataBundleV1,
): FlowDocUatSectionResolutionIssueV1[] {
  const parsed = AdapterBundlePinsSchema.safeParse(bundle)
  if (!parsed.success) return parsed.error.issues.map((item) => issue(
    "adapter-bundle", item.code, `adapterBundle.${formatPath(item.path)}`, item.message,
  ))
  const issues: FlowDocUatSectionResolutionIssueV1[] = []
  if (adapterBundleFingerprint(bundle) !== bundle.bundleFingerprint) issues.push(issue(
    "adapter-bundle", "adapter-bundle-fingerprint-mismatch", "adapterBundle.bundleFingerprint",
    "adapter bundle content does not match its pinned fingerprint",
  ))
  const { normalizationFingerprint: _normalizationFingerprint, ...normalizationUnsigned } = bundle.textNormalization
  if (fingerprint(normalizationUnsigned) !== bundle.textNormalization.normalizationFingerprint) issues.push(issue(
    "adapter-bundle", "text-normalization-fingerprint-mismatch",
    "adapterBundle.textNormalization.normalizationFingerprint",
    "imported text normalization evidence does not match its pinned fingerprint",
  ))
  return issues
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue)
  if (value == null || typeof value !== "object") return value
  return Object.fromEntries(Object.keys(value as Record<string, unknown>).sort().map((key) => [
    key,
    canonicalValue((value as Record<string, unknown>)[key]),
  ]))
}

function canonicalFingerprint(value: unknown): string {
  return fingerprint(canonicalValue(value))
}

type CanonicalContentResolutionV1 =
  | { status: "resolved"; content: FlowDocUatResolvedSectionContentV1; issues: [] }
  | { status: "blocked"; content: null; issues: FlowDocUatSectionResolutionIssueV1[] }

function resolveCanonicalSectionContent(input: {
  instance: VNextDocumentInstanceIdentityV1
  dataSnapshot: FlowDocUatSectionDataBundleV1["dataSnapshot"]
  collectionSnapshot: FlowDocUatSectionDataBundleV1["collectionSnapshot"]
  mediaSnapshot: FlowDocUatSectionDataBundleV1["mediaSnapshot"]
  resolutionInputFingerprint: string
  screenshotOrder: string[]
}): CanonicalContentResolutionV1 {
  const structure = createFlowDocUatStructureDefinitionV1()
  if (input.instance.revision !== 0) return {
    status: "blocked",
    content: null,
    issues: [issue(
      "instance", "instance-revision-not-zero", "canonicalInput.dataSnapshot.instance.revision",
      "UAT canonical generation materializes only an initial revision-zero instance",
    )],
  }

  const title = input.dataSnapshot.data.values["uat.document.title"]
  if (typeof title !== "string" || title.trim().length === 0) return {
    status: "blocked",
    content: null,
    issues: [issue(
      "instance", "instance-title-missing", "canonicalInput.dataSnapshot.data.values.uat.document.title",
      "revision-zero materialization requires a non-blank UAT document title",
    )],
  }
  const bodyZone = structure.starterDocument.document.sections[0].nodes["uat-body-zone"]
  const expectedBodyOrder = [
    "uat-requirements-table", "uat-screenshots-heading", "uat-screenshots-table",
  ] as const
  if (bodyZone.type !== "zone" || expectedBodyOrder.some((nodeId, index) => (
    bodyZone.childIds.indexOf(nodeId) !== bodyZone.childIds.indexOf(expectedBodyOrder[0]) + index
  ))) return {
    status: "blocked",
    content: null,
    issues: [issue(
      "placement", "screenshot-body-order-mismatch", "structure.starterDocument.uat-body-zone",
      "screenshot placement policy requires the screenshot heading and table immediately after requirements",
    )],
  }

  const instanceMaterialization = planVNextDocumentInstanceMaterializationV1({
    contractVersion: 1,
    kind: "document-instance-materialization-request",
    publishedStructure: structure.structure,
    instance: input.instance,
    starterDocument: structure.starterDocument,
    policySet: structure.policySet,
    instanceMeta: { title },
  })
  if (instanceMaterialization.status !== "planned") return {
    status: "blocked",
    content: null,
    issues: instanceMaterialization.issues.map((item) => issue(
      "instance", item.code, item.path, item.message,
    )),
  }

  const scopedResolution = resolveVNextScopedDocumentV1({
    contractVersion: 1,
    kind: "scoped-resolved-projection-input",
    projection: {
      contractVersion: 1,
      kind: "resolved-projection-input",
      instance: input.instance,
      document: instanceMaterialization.document,
      published: {
        contractVersion: 1,
        kind: "published-resolution-bundle",
        publishedStructure: structure.structure,
        fieldContract: structure.fieldContract,
        styleCatalog: structure.styleCatalog,
        staticMedia: structure.staticMedia,
      },
      dataSnapshot: input.dataSnapshot,
      instanceMedia: input.mediaSnapshot,
    },
    tables: [
      {
        definition: structure.tables.requirements.definition,
        itemContract: structure.collectionItemContract,
        bindingContract: structure.tables.requirements.bindingContract,
      },
      {
        definition: structure.tables.screenshots.definition,
        itemContract: structure.collectionItemContract,
        bindingContract: structure.tables.screenshots.bindingContract,
      },
    ],
  })
  if (scopedResolution.status !== "resolved") return {
    status: "blocked",
    content: null,
    issues: scopedResolution.issues.map((item) => issue(
      "resolution", item.code, item.path, item.message,
    )),
  }

  const sharedTableInput = {
    instance: input.instance,
    resolutionInputFingerprint: input.resolutionInputFingerprint,
    document: instanceMaterialization.document,
    fieldContract: structure.fieldContract,
    itemContract: structure.collectionItemContract,
    collectionSnapshot: input.collectionSnapshot,
    scopedResolution,
  }
  const requirements = resolveTable({
    ...sharedTableInput,
    definition: structure.tables.requirements.definition,
    bindingContract: structure.tables.requirements.bindingContract,
  })
  const screenshots = resolveTable({
    ...sharedTableInput,
    definition: structure.tables.screenshots.definition,
    bindingContract: structure.tables.screenshots.bindingContract,
  })
  const tableIssues = [requirements, screenshots].flatMap((table) => Array.isArray(table) ? table : [])
  if (tableIssues.length > 0 || Array.isArray(requirements) || Array.isArray(screenshots)) {
    return { status: "blocked", content: null, issues: tableIssues }
  }

  const materializations = [requirements, screenshots].map((table) => table.materializedContent)
  return {
    status: "resolved",
    content: {
      structureFingerprint: structure.structureFingerprint,
      resolutionInputFingerprint: input.resolutionInputFingerprint,
      instance: clone(input.instance),
      instanceMaterialization,
      scopedResolution,
      tables: { requirements, screenshots },
      screenshotPlacement: {
        status: "resolved",
        policy: FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
        bodyOrder: [...expectedBodyOrder],
        screenshotOrder: clone(input.screenshotOrder),
        requirementLevelPlacement: false,
        basis: "page-geometry-and-granular-links-unavailable",
      },
      provenance: {
        starterGraph: clone(instanceMaterialization.provenance),
        sourceToInstanceRows: [],
        generated: materializations.flatMap((materialization) => clone(materialization.provenance)),
      },
      execution: {
        persistence: "not-run",
        revisionAdvance: false,
        documentMaterialization: "planned",
        documentResolution: "resolved",
        collectionRowResolution: "resolved",
        collectionContentMaterialization: "materialized",
        measurement: "not-run",
        pagination: "not-run",
        rendering: "not-run",
      },
      summary: {
        documentFieldBindingCount: scopedResolution.resolvedDocument.bindings.fields.length,
        styleBindingCount: scopedResolution.resolvedDocument.bindings.styles.length,
        tableCount: 2,
        resolvedRowCount: materializations.reduce((sum, table) => sum + table.work.rowCount, 0),
        materializedRowCount: materializations.reduce((sum, table) => sum + table.work.materializedRowCount, 0),
        authoredReferenceRowCount: materializations.reduce((sum, table) => sum + table.work.authoredReferenceRowCount, 0),
        clonedNodeCount: materializations.reduce((sum, table) => sum + table.work.clonedNodeCount, 0),
        clonedInlineCount: materializations.reduce((sum, table) => sum + table.work.clonedInlineCount, 0),
        textBindingCount: materializations.reduce((sum, table) => sum + table.work.textBindingCount, 0),
        imageBindingCount: materializations.reduce((sum, table) => sum + table.work.imageBindingCount, 0),
        sourceToInstanceRowCount: 0,
      },
    },
    issues: [],
  }
}

export function resolveFlowDocUatCanonicalGenerationV1(
  value: unknown,
): FlowDocUatCanonicalGenerationResolutionResultV1 {
  const parsed = CanonicalGenerationInputSchema.safeParse(value)
  if (!parsed.success) return {
    status: "blocked",
    bundle: null,
    issues: parsed.error.issues.map((item) => issue(
      "schema", item.code, formatPath(item.path), item.message,
    )),
  }
  const request = parsed.data
  if (canonicalFingerprint(request.canonicalInput) !== request.canonicalInputFingerprint) return {
    status: "blocked",
    bundle: null,
    issues: [issue(
      "canonical-generation", "canonical-input-fingerprint-mismatch", "canonicalInputFingerprint",
      "canonical generation input does not match its accepted runtime fingerprint",
    )],
  }
  const structure = createFlowDocUatStructureDefinitionV1()
  if (request.publishedStructureFingerprint !== structure.structureFingerprint) return {
    status: "blocked",
    bundle: null,
    issues: [issue(
      "canonical-generation", "structure-fingerprint-mismatch", "publishedStructureFingerprint",
      "canonical generation must pin the exact accepted UAT Published Structure",
    )],
  }
  if (request.canonicalInput.collectionSnapshots.length !== 1) return {
    status: "blocked",
    bundle: null,
    issues: [issue(
      "canonical-generation", "collection-snapshot-count-invalid", "canonicalInput.collectionSnapshots",
      "UAT canonical generation requires exactly one collection snapshot",
    )],
  }
  const collectionSnapshot = request.canonicalInput.collectionSnapshots[0]!
  if (
    collectionSnapshot.collections["uat.requirements"] == null
    || collectionSnapshot.collections["uat.screenshots"] == null
  ) return {
    status: "blocked",
    bundle: null,
    issues: [issue(
      "canonical-generation", "uat-collections-missing", "canonicalInput.collectionSnapshots[0].collections",
      "UAT canonical generation requires requirements and screenshots collections",
    )],
  }
  const resolutionInputFingerprint = canonicalFingerprint({
    contractVersion: FLOWDOC_UAT_SECTION_RESOLUTION_VERSION,
    kind: "uat-canonical-generation-resolution-input",
    canonicalInputFingerprint: request.canonicalInputFingerprint,
    publishedStructureFingerprint: request.publishedStructureFingerprint,
    screenshotPlacementPolicy: request.screenshotPlacementPolicy,
  })
  const content = resolveCanonicalSectionContent({
    instance: request.canonicalInput.dataSnapshot.instance,
    dataSnapshot: request.canonicalInput.dataSnapshot,
    collectionSnapshot,
    mediaSnapshot: request.canonicalInput.mediaSnapshot,
    resolutionInputFingerprint,
    screenshotOrder: collectionSnapshot.collections["uat.screenshots"]!.items.map((item) => item.itemKey),
  })
  if (content.status === "blocked") return { status: "blocked", bundle: null, issues: content.issues }
  const unsigned: Omit<FlowDocUatCanonicalGenerationResolutionBundleV1, "bundleFingerprint"> = {
    contractVersion: FLOWDOC_UAT_SECTION_RESOLUTION_VERSION,
    kind: "uat-canonical-generation-resolution-bundle",
    resolutionId: "flowdoc-uat-canonical-generation-resolution-v1",
    generation: {
      canonicalInputFingerprint: request.canonicalInputFingerprint,
      publishedStructureFingerprint: request.publishedStructureFingerprint,
      source: "backend-protected-canonical-record",
    },
    ...content.content,
  }
  return {
    status: "resolved",
    bundle: { ...unsigned, bundleFingerprint: fingerprint(unsigned) },
    issues: [],
  }
}

export function resolveFlowDocUatSectionV1(value: unknown): FlowDocUatSectionResolutionResultV1 {
  const parsed = InputSchema.safeParse(value)
  if (!parsed.success) return blocked(parsed.error.issues.map((item) => issue(
    "schema", item.code, formatPath(item.path), item.message,
  )))
  const adapterBundle = parsed.data.adapterBundle as FlowDocUatSectionDataBundleV1
  if (adapterBundle == null || typeof adapterBundle !== "object") return blocked([issue(
    "adapter-bundle", "invalid-adapter-bundle", "adapterBundle", "adapter bundle must be an object",
  )])

  const adapterIssues = validateAdapterBundle(adapterBundle)
  if (adapterIssues.length > 0) return blocked(adapterIssues)
  const structure = createFlowDocUatStructureDefinitionV1()
  if (adapterBundle.structureFingerprint !== structure.structureFingerprint) return blocked([issue(
    "adapter-bundle", "structure-fingerprint-mismatch", "adapterBundle.structureFingerprint",
    "adapter bundle must pin the accepted UAT Structure Definition",
  )])
  if (adapterBundle.instance.revision !== 0) return blocked([issue(
    "instance", "instance-revision-not-zero", "adapterBundle.instance.revision",
    "REALDOC-C creates the initial UAT instance only at revision zero",
  )])

  const title = adapterBundle.dataSnapshot.data.values["uat.document.title"]
  if (typeof title !== "string" || title.trim().length === 0) return blocked([issue(
    "instance", "instance-title-missing", "adapterBundle.dataSnapshot.data.values.uat.document.title",
    "revision-zero materialization requires a non-blank UAT document title",
  )])
  const bodyZone = structure.starterDocument.document.sections[0].nodes["uat-body-zone"]
  const expectedBodyOrder = [
    "uat-requirements-table", "uat-screenshots-heading", "uat-screenshots-table",
  ] as const
  if (bodyZone.type !== "zone" || expectedBodyOrder.some((nodeId, index) => (
    bodyZone.childIds.indexOf(nodeId) !== bodyZone.childIds.indexOf(expectedBodyOrder[0]) + index
  ))) return blocked([issue(
    "placement", "screenshot-body-order-mismatch", "structure.starterDocument.uat-body-zone",
    "screenshot placement policy requires the screenshot heading and table immediately after requirements",
  )])

  const instanceMaterialization = planVNextDocumentInstanceMaterializationV1({
    contractVersion: 1,
    kind: "document-instance-materialization-request",
    publishedStructure: structure.structure,
    instance: adapterBundle.instance,
    starterDocument: structure.starterDocument,
    policySet: structure.policySet,
    instanceMeta: { title },
  })
  if (instanceMaterialization.status !== "planned") return blocked(instanceMaterialization.issues.map((item) => issue(
    "instance", item.code, item.path, item.message,
  )))

  const resolutionInputFingerprint = fingerprint({
    contractVersion: FLOWDOC_UAT_SECTION_RESOLUTION_VERSION,
    kind: "uat-section-resolution-input",
    adapterBundleFingerprint: adapterBundle.bundleFingerprint,
    structureFingerprint: structure.structureFingerprint,
    instance: adapterBundle.instance,
    dataSnapshotId: adapterBundle.dataSnapshot.dataSnapshotId,
    collectionSnapshotId: adapterBundle.collectionSnapshot.collectionSnapshotId,
    collectionSnapshotRevision: adapterBundle.collectionSnapshot.snapshotRevision,
    mediaSnapshotId: adapterBundle.mediaSnapshot.mediaSnapshotId,
    screenshotPlacementPolicy: parsed.data.screenshotPlacementPolicy,
  })
  const scopedResolution = resolveVNextScopedDocumentV1({
    contractVersion: 1,
    kind: "scoped-resolved-projection-input",
    projection: {
      contractVersion: 1,
      kind: "resolved-projection-input",
      instance: adapterBundle.instance,
      document: instanceMaterialization.document,
      published: {
        contractVersion: 1,
        kind: "published-resolution-bundle",
        publishedStructure: structure.structure,
        fieldContract: structure.fieldContract,
        styleCatalog: structure.styleCatalog,
        staticMedia: structure.staticMedia,
      },
      dataSnapshot: adapterBundle.dataSnapshot,
      instanceMedia: adapterBundle.mediaSnapshot,
    },
    tables: [
      {
        definition: structure.tables.requirements.definition,
        itemContract: structure.collectionItemContract,
        bindingContract: structure.tables.requirements.bindingContract,
      },
      {
        definition: structure.tables.screenshots.definition,
        itemContract: structure.collectionItemContract,
        bindingContract: structure.tables.screenshots.bindingContract,
      },
    ],
  })
  if (scopedResolution.status !== "resolved") return blocked(scopedResolution.issues.map((item) => issue(
    "resolution", item.code, item.path, item.message,
  )))

  const sharedTableInput = {
    instance: adapterBundle.instance,
    resolutionInputFingerprint,
    document: instanceMaterialization.document,
    fieldContract: structure.fieldContract,
    itemContract: structure.collectionItemContract,
    collectionSnapshot: adapterBundle.collectionSnapshot,
    scopedResolution,
  }
  const requirements = resolveTable({
    ...sharedTableInput,
    definition: structure.tables.requirements.definition,
    bindingContract: structure.tables.requirements.bindingContract,
  })
  const screenshots = resolveTable({
    ...sharedTableInput,
    definition: structure.tables.screenshots.definition,
    bindingContract: structure.tables.screenshots.bindingContract,
  })
  const tableIssues = [requirements, screenshots].flatMap((table) => Array.isArray(table) ? table : [])
  if (tableIssues.length > 0 || Array.isArray(requirements) || Array.isArray(screenshots)) {
    return blocked(tableIssues)
  }

  const tables = [requirements, screenshots]
  const rowProvenance = sourceToInstanceRows(adapterBundle, tables)
  const expectedSourceRows = adapterBundle.summary.requirementCount + adapterBundle.summary.screenshotCount
  if (rowProvenance.length !== expectedSourceRows) return blocked([issue(
    "adapter-bundle", "source-to-instance-provenance-incomplete", "adapterBundle.provenance.collections",
    `expected ${expectedSourceRows} source-to-instance row links; received ${rowProvenance.length}`,
  )])
  const materializations = tables.map((table) => table.materializedContent)
  const unsigned: Omit<FlowDocUatSectionResolutionBundleV1, "bundleFingerprint"> = {
    contractVersion: FLOWDOC_UAT_SECTION_RESOLUTION_VERSION,
    kind: "uat-section-resolution-bundle",
    resolutionId: FLOWDOC_UAT_SECTION_RESOLUTION_ID,
    adapter: {
      adapterId: FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID,
      bundleFingerprint: adapterBundle.bundleFingerprint,
      sourceSetId: adapterBundle.sourceSet.sourceSetId,
      selectedSectionNumber: adapterBundle.sourceSet.selectedSectionNumber,
      textNormalizationProfileId: adapterBundle.textNormalization.profileId,
      textNormalizationFingerprint: adapterBundle.textNormalization.normalizationFingerprint,
    },
    structureFingerprint: structure.structureFingerprint,
    resolutionInputFingerprint,
    instance: clone(adapterBundle.instance),
    instanceMaterialization,
    scopedResolution,
    tables: { requirements, screenshots },
    screenshotPlacement: {
      status: "resolved",
      policy: FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
      bodyOrder: [...expectedBodyOrder],
      screenshotOrder: clone(adapterBundle.semantic.relations.screenshotOrder),
      requirementLevelPlacement: false,
      basis: "page-geometry-and-granular-links-unavailable",
    },
    provenance: {
      starterGraph: clone(instanceMaterialization.provenance),
      sourceToInstanceRows: rowProvenance,
      generated: materializations.flatMap((materialization) => clone(materialization.provenance)),
    },
    execution: {
      persistence: "not-run",
      revisionAdvance: false,
      documentMaterialization: "planned",
      documentResolution: "resolved",
      collectionRowResolution: "resolved",
      collectionContentMaterialization: "materialized",
      measurement: "not-run",
      pagination: "not-run",
      rendering: "not-run",
    },
    summary: {
      documentFieldBindingCount: scopedResolution.resolvedDocument.bindings.fields.length,
      styleBindingCount: scopedResolution.resolvedDocument.bindings.styles.length,
      tableCount: 2,
      resolvedRowCount: materializations.reduce((sum, table) => sum + table.work.rowCount, 0),
      materializedRowCount: materializations.reduce((sum, table) => sum + table.work.materializedRowCount, 0),
      authoredReferenceRowCount: materializations.reduce((sum, table) => sum + table.work.authoredReferenceRowCount, 0),
      clonedNodeCount: materializations.reduce((sum, table) => sum + table.work.clonedNodeCount, 0),
      clonedInlineCount: materializations.reduce((sum, table) => sum + table.work.clonedInlineCount, 0),
      textBindingCount: materializations.reduce((sum, table) => sum + table.work.textBindingCount, 0),
      imageBindingCount: materializations.reduce((sum, table) => sum + table.work.imageBindingCount, 0),
      sourceToInstanceRowCount: rowProvenance.length,
    },
  }
  return {
    status: "resolved",
    bundle: { ...unsigned, bundleFingerprint: fingerprint(unsigned) },
    issues: [],
  }
}
