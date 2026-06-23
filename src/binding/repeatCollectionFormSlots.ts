import type { DataSnapshot, FieldDefinition, FieldRegistry } from "../persistence/package.js"
import type { DocumentNode } from "../schema/document.js"
import type { VNextFieldRefUsage } from "./keyDataDiagnostics.js"
import { collectVNextDocumentFieldRefUsages } from "./keyDataDiagnostics.js"

export const VNEXT_REPEAT_COLLECTION_FORM_SLOT_SOURCE = "vnext-repeat-collection-form-slot"
export const VNEXT_REPEAT_COLLECTION_FORM_SLOT_MODE = "readiness-boundary"

export type VNextRepeatCollectionFormSlotStatus = "ready" | "ready-with-warnings" | "blocked"

export type VNextRepeatCollectionFormSlotIssueCode =
  | "collection-repeat-not-modeled"
  | "collection-field-used-inline"
  | "collection-data-snapshot-not-supported"

export interface VNextRepeatCollectionFormSlotIssue {
  severity: "error" | "warning"
  code: VNextRepeatCollectionFormSlotIssueCode
  key: string
  path: string
  message: string
  fieldRefIds: string[]
}

export interface VNextCollectionFieldBoundary {
  key: string
  label: string
  type: "collection"
  usageCount: number
  fieldRefIds: string[]
  dataKeyPresent: boolean
  repeatRegionStatus: "not-modeled"
  expansionStatus: "not-run"
  formSlotStatus: "not-modeled"
}

export interface VNextRepeatRegionBoundary {
  status: "not-modeled"
  regionCount: 0
  expansionStatus: "not-run"
}

export interface VNextFormSlotBoundary {
  status: "not-modeled"
  slotCount: 0
  submissionState: "not-modeled"
}

export interface VNextRepeatCollectionFormSlotApplication {
  status: "not-applied"
  repeatExpansion: "not-run"
  collectionBinding: "not-run"
  formSlotMaterialization: "not-run"
  submissionState: "not-run"
  documentMutation: "not-run"
  packageVersionChange: false
}

export interface VNextRepeatCollectionFormSlotReadiness {
  source: typeof VNEXT_REPEAT_COLLECTION_FORM_SLOT_SOURCE
  mode: typeof VNEXT_REPEAT_COLLECTION_FORM_SLOT_MODE
  status: VNextRepeatCollectionFormSlotStatus
  collectionFields: VNextCollectionFieldBoundary[]
  repeatRegions: VNextRepeatRegionBoundary
  formSlots: VNextFormSlotBoundary
  issues: VNextRepeatCollectionFormSlotIssue[]
  usages: VNextFieldRefUsage[]
  application: VNextRepeatCollectionFormSlotApplication
  summary: {
    collectionFieldCount: number
    collectionInlineUsageCount: number
    collectionDataKeyCount: number
    repeatRegionCount: 0
    formSlotCount: 0
    errorCount: number
    warningCount: number
  }
}

export interface VNextRepeatCollectionFormSlotReadinessInput {
  document: DocumentNode
  registry: FieldRegistry
  data?: DataSnapshot
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function isCollectionField(definition: FieldDefinition): definition is FieldDefinition & { type: "collection" } {
  return definition.type === "collection"
}

function dataHasKey(data: DataSnapshot | undefined, key: string): boolean {
  return data != null && Object.prototype.hasOwnProperty.call(data.values, key)
}

function usagesForKey(usages: readonly VNextFieldRefUsage[], key: string): VNextFieldRefUsage[] {
  return usages.filter((usage) => usage.key === key)
}

function issue(
  severity: "error" | "warning",
  code: VNextRepeatCollectionFormSlotIssueCode,
  key: string,
  path: string,
  message: string,
  fieldRefIds: string[] = [],
): VNextRepeatCollectionFormSlotIssue {
  return {
    severity,
    code,
    key,
    path,
    message,
    fieldRefIds,
  }
}

function statusFromIssues(
  issues: readonly VNextRepeatCollectionFormSlotIssue[],
): VNextRepeatCollectionFormSlotStatus {
  if (issues.some((item) => item.severity === "error")) return "blocked"
  if (issues.some((item) => item.severity === "warning")) return "ready-with-warnings"
  return "ready"
}

function collectionFields(
  registry: FieldRegistry,
  data: DataSnapshot | undefined,
  usages: readonly VNextFieldRefUsage[],
): VNextCollectionFieldBoundary[] {
  return Object.entries(registry.fields).flatMap(([key, definition]) => {
    if (!isCollectionField(definition)) return []

    const keyUsages = usagesForKey(usages, key)
    return [{
      key,
      label: definition.label,
      type: "collection",
      usageCount: keyUsages.length,
      fieldRefIds: keyUsages.map((usage) => usage.fieldRefId),
      dataKeyPresent: dataHasKey(data, key),
      repeatRegionStatus: "not-modeled",
      expansionStatus: "not-run",
      formSlotStatus: "not-modeled",
    }]
  })
}

function collectionIssues(
  collections: readonly VNextCollectionFieldBoundary[],
): VNextRepeatCollectionFormSlotIssue[] {
  return collections.flatMap((collection) => {
    const path = `fields.fields.${collection.key}`
    const issues: VNextRepeatCollectionFormSlotIssue[] = [
      issue(
        "warning",
        "collection-repeat-not-modeled",
        collection.key,
        path,
        `collection field "${collection.key}" has no repeat/form-slot model in this boundary`,
        collection.fieldRefIds,
      ),
    ]

    if (collection.usageCount > 0) {
      issues.push(issue(
        "error",
        "collection-field-used-inline",
        collection.key,
        path,
        `collection field "${collection.key}" is referenced by inline field-ref nodes before collection binding exists`,
        collection.fieldRefIds,
      ))
    }
    if (collection.dataKeyPresent) {
      issues.push(issue(
        "error",
        "collection-data-snapshot-not-supported",
        collection.key,
        `data.values.${collection.key}`,
        `collection field "${collection.key}" cannot be represented by the current scalar data snapshot`,
        collection.fieldRefIds,
      ))
    }

    return issues
  })
}

export function assessVNextRepeatCollectionFormSlotReadiness(
  input: VNextRepeatCollectionFormSlotReadinessInput,
): VNextRepeatCollectionFormSlotReadiness {
  const usages = collectVNextDocumentFieldRefUsages(input.document)
  const collections = collectionFields(input.registry, input.data, usages)
  const issues = collectionIssues(collections)
  const errorCount = issues.filter((item) => item.severity === "error").length
  const warningCount = issues.filter((item) => item.severity === "warning").length

  return {
    source: VNEXT_REPEAT_COLLECTION_FORM_SLOT_SOURCE,
    mode: VNEXT_REPEAT_COLLECTION_FORM_SLOT_MODE,
    status: statusFromIssues(issues),
    collectionFields: collections,
    repeatRegions: {
      status: "not-modeled",
      regionCount: 0,
      expansionStatus: "not-run",
    },
    formSlots: {
      status: "not-modeled",
      slotCount: 0,
      submissionState: "not-modeled",
    },
    issues,
    usages: cloneJson(usages),
    application: {
      status: "not-applied",
      repeatExpansion: "not-run",
      collectionBinding: "not-run",
      formSlotMaterialization: "not-run",
      submissionState: "not-run",
      documentMutation: "not-run",
      packageVersionChange: false,
    },
    summary: {
      collectionFieldCount: collections.length,
      collectionInlineUsageCount: collections.reduce((count, item) => count + item.usageCount, 0),
      collectionDataKeyCount: collections.filter((item) => item.dataKeyPresent).length,
      repeatRegionCount: 0,
      formSlotCount: 0,
      errorCount,
      warningCount,
    },
  }
}
