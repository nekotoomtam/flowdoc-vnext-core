import type { DataSnapshot, FieldDefinition, FieldRegistry } from "../persistence/package.js"
import type { DocumentNode } from "../schema/document.js"
import type { VNextFieldRefUsage } from "./keyDataDiagnostics.js"
import { collectVNextDocumentFieldRefUsages } from "./keyDataDiagnostics.js"

export const VNEXT_KEY_HISTORY_SOURCE = "vnext-key-history"
export const VNEXT_KEY_HISTORY_MODE = "migration-plan-boundary"

export type VNextKeyHistoryMigrationIntent =
  | {
      kind: "field-key.rename"
      fromKey: string
      toKey: string
      reason?: string
    }
  | {
      kind: "field-type.change"
      key: string
      toType: FieldDefinition["type"]
      reason?: string
    }

export type VNextKeyHistoryMigrationStatus = "ready" | "blocked"

export type VNextKeyHistoryMigrationIssueCode =
  | "empty-key"
  | "same-key"
  | "missing-source-key"
  | "target-key-exists"
  | "missing-key"
  | "invalid-target-type"
  | "non-inline-type-breaks-field-refs"

export interface VNextKeyHistoryMigrationIssue {
  severity: "error"
  code: VNextKeyHistoryMigrationIssueCode
  path: string
  message: string
  key?: string
  fromKey?: string
  toKey?: string
}

export interface VNextKeyHistoryMigrationEvent {
  kind: VNextKeyHistoryMigrationIntent["kind"]
  status: "planned" | "blocked"
  reason: string | null
  key: string
  fromKey: string | null
  toKey: string | null
  fromType: FieldDefinition["type"] | null
  toType: FieldDefinition["type"] | null
  affectedFieldRefCount: number
  affectedFieldRefIds: string[]
  affectedDataKey: boolean
  registryMutation: "not-applied"
  documentFieldRefMutation: "not-applied"
  dataMigration: "not-applied"
  historyWrite: "not-written"
  externalCompatibility: "not-checked"
}

export interface VNextKeyHistoryMigrationApplication {
  status: "not-applied"
  registryMutation: "not-run"
  documentFieldRefMutation: "not-run"
  dataMigration: "not-run"
  historyWrite: "not-written"
  packageVersionChange: false
}

export interface VNextKeyHistoryMigrationPlan {
  source: typeof VNEXT_KEY_HISTORY_SOURCE
  mode: typeof VNEXT_KEY_HISTORY_MODE
  status: VNextKeyHistoryMigrationStatus
  intents: VNextKeyHistoryMigrationIntent[]
  events: VNextKeyHistoryMigrationEvent[]
  issues: VNextKeyHistoryMigrationIssue[]
  usages: VNextFieldRefUsage[]
  application: VNextKeyHistoryMigrationApplication
  summary: {
    intentCount: number
    plannedEventCount: number
    blockedEventCount: number
    affectedFieldRefCount: number
    affectedDataKeyCount: number
    registryFieldCount: number
    issueCount: number
  }
}

export interface VNextKeyHistoryMigrationPlanInput {
  document: DocumentNode
  registry: FieldRegistry
  data?: DataSnapshot
  intents: readonly VNextKeyHistoryMigrationIntent[]
}

const FIELD_TYPES = new Set<FieldDefinition["type"]>([
  "text",
  "number",
  "date",
  "boolean",
  "enum",
  "image",
  "collection",
])

const NON_INLINE_FIELD_TYPES = new Set<FieldDefinition["type"]>(["image", "collection"])

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function nonEmpty(value: string): boolean {
  return value.length > 0
}

function issue(
  code: VNextKeyHistoryMigrationIssueCode,
  path: string,
  message: string,
  context: Omit<VNextKeyHistoryMigrationIssue, "severity" | "code" | "path" | "message"> = {},
): VNextKeyHistoryMigrationIssue {
  return {
    severity: "error",
    code,
    path,
    message,
    ...context,
  }
}

function issuePath(index: number, field: string): string {
  return `intents[${index}].${field}`
}

function fieldDefinition(registry: FieldRegistry, key: string): FieldDefinition | undefined {
  return registry.fields[key]
}

function dataHasKey(data: DataSnapshot | undefined, key: string): boolean {
  return data != null && Object.prototype.hasOwnProperty.call(data.values, key)
}

function affectedUsageIds(usages: readonly VNextFieldRefUsage[], key: string): string[] {
  return usages.filter((usage) => usage.key === key).map((usage) => usage.fieldRefId)
}

function reasonValue(reason: string | undefined): string | null {
  return reason == null || reason.length === 0 ? null : reason
}

function eventStatus(issues: readonly VNextKeyHistoryMigrationIssue[]): "planned" | "blocked" {
  return issues.length === 0 ? "planned" : "blocked"
}

function renameIssues(
  intent: Extract<VNextKeyHistoryMigrationIntent, { kind: "field-key.rename" }>,
  index: number,
  registry: FieldRegistry,
): VNextKeyHistoryMigrationIssue[] {
  const issues: VNextKeyHistoryMigrationIssue[] = []

  if (!nonEmpty(intent.fromKey)) {
    issues.push(issue("empty-key", issuePath(index, "fromKey"), "rename source key must be non-empty"))
  }
  if (!nonEmpty(intent.toKey)) {
    issues.push(issue("empty-key", issuePath(index, "toKey"), "rename target key must be non-empty"))
  }
  if (intent.fromKey === intent.toKey && nonEmpty(intent.fromKey)) {
    issues.push(issue("same-key", issuePath(index, "toKey"), "rename target key must differ from source key", {
      fromKey: intent.fromKey,
      toKey: intent.toKey,
    }))
  }
  if (nonEmpty(intent.fromKey) && fieldDefinition(registry, intent.fromKey) == null) {
    issues.push(issue("missing-source-key", issuePath(index, "fromKey"), `field key "${intent.fromKey}" does not exist`, {
      fromKey: intent.fromKey,
    }))
  }
  if (
    nonEmpty(intent.toKey)
    && intent.fromKey !== intent.toKey
    && fieldDefinition(registry, intent.toKey) != null
  ) {
    issues.push(issue("target-key-exists", issuePath(index, "toKey"), `field key "${intent.toKey}" already exists`, {
      fromKey: intent.fromKey,
      toKey: intent.toKey,
    }))
  }

  return issues
}

function typeChangeIssues(
  intent: Extract<VNextKeyHistoryMigrationIntent, { kind: "field-type.change" }>,
  index: number,
  registry: FieldRegistry,
  affectedIds: readonly string[],
): VNextKeyHistoryMigrationIssue[] {
  const issues: VNextKeyHistoryMigrationIssue[] = []
  const definition = fieldDefinition(registry, intent.key)

  if (!nonEmpty(intent.key)) {
    issues.push(issue("empty-key", issuePath(index, "key"), "type-change key must be non-empty"))
  } else if (definition == null) {
    issues.push(issue("missing-key", issuePath(index, "key"), `field key "${intent.key}" does not exist`, {
      key: intent.key,
    }))
  }
  if (!FIELD_TYPES.has(intent.toType)) {
    issues.push(issue("invalid-target-type", issuePath(index, "toType"), `field type "${intent.toType}" is not supported`, {
      key: intent.key,
    }))
  }
  if (NON_INLINE_FIELD_TYPES.has(intent.toType) && affectedIds.length > 0) {
    issues.push(issue(
      "non-inline-type-breaks-field-refs",
      issuePath(index, "toType"),
      `field key "${intent.key}" has inline field-ref usages and cannot become ${intent.toType} in this boundary`,
      { key: intent.key },
    ))
  }

  return issues
}

function renameEvent(
  intent: Extract<VNextKeyHistoryMigrationIntent, { kind: "field-key.rename" }>,
  status: "planned" | "blocked",
  registry: FieldRegistry,
  data: DataSnapshot | undefined,
  usages: readonly VNextFieldRefUsage[],
): VNextKeyHistoryMigrationEvent {
  const definition = fieldDefinition(registry, intent.fromKey)
  const affectedIds = affectedUsageIds(usages, intent.fromKey)

  return {
    kind: intent.kind,
    status,
    reason: reasonValue(intent.reason),
    key: intent.fromKey,
    fromKey: intent.fromKey,
    toKey: intent.toKey,
    fromType: definition?.type ?? null,
    toType: definition?.type ?? null,
    affectedFieldRefCount: affectedIds.length,
    affectedFieldRefIds: affectedIds,
    affectedDataKey: dataHasKey(data, intent.fromKey),
    registryMutation: "not-applied",
    documentFieldRefMutation: "not-applied",
    dataMigration: "not-applied",
    historyWrite: "not-written",
    externalCompatibility: "not-checked",
  }
}

function typeChangeEvent(
  intent: Extract<VNextKeyHistoryMigrationIntent, { kind: "field-type.change" }>,
  status: "planned" | "blocked",
  registry: FieldRegistry,
  data: DataSnapshot | undefined,
  usages: readonly VNextFieldRefUsage[],
): VNextKeyHistoryMigrationEvent {
  const definition = fieldDefinition(registry, intent.key)
  const affectedIds = affectedUsageIds(usages, intent.key)

  return {
    kind: intent.kind,
    status,
    reason: reasonValue(intent.reason),
    key: intent.key,
    fromKey: intent.key,
    toKey: intent.key,
    fromType: definition?.type ?? null,
    toType: intent.toType,
    affectedFieldRefCount: affectedIds.length,
    affectedFieldRefIds: affectedIds,
    affectedDataKey: dataHasKey(data, intent.key),
    registryMutation: "not-applied",
    documentFieldRefMutation: "not-applied",
    dataMigration: "not-applied",
    historyWrite: "not-written",
    externalCompatibility: "not-checked",
  }
}

export function createVNextKeyHistoryMigrationPlan(
  input: VNextKeyHistoryMigrationPlanInput,
): VNextKeyHistoryMigrationPlan {
  const usages = collectVNextDocumentFieldRefUsages(input.document)
  const events: VNextKeyHistoryMigrationEvent[] = []
  const issues: VNextKeyHistoryMigrationIssue[] = []

  input.intents.forEach((intent, index) => {
    if (intent.kind === "field-key.rename") {
      const intentIssues = renameIssues(intent, index, input.registry)
      issues.push(...intentIssues)
      events.push(renameEvent(intent, eventStatus(intentIssues), input.registry, input.data, usages))
      return
    }

    const affectedIds = affectedUsageIds(usages, intent.key)
    const intentIssues = typeChangeIssues(intent, index, input.registry, affectedIds)
    issues.push(...intentIssues)
    events.push(typeChangeEvent(intent, eventStatus(intentIssues), input.registry, input.data, usages))
  })

  const plannedEventCount = events.filter((event) => event.status === "planned").length
  const blockedEventCount = events.length - plannedEventCount

  return {
    source: VNEXT_KEY_HISTORY_SOURCE,
    mode: VNEXT_KEY_HISTORY_MODE,
    status: issues.length === 0 ? "ready" : "blocked",
    intents: cloneJson([...input.intents]),
    events,
    issues,
    usages: cloneJson(usages),
    application: {
      status: "not-applied",
      registryMutation: "not-run",
      documentFieldRefMutation: "not-run",
      dataMigration: "not-run",
      historyWrite: "not-written",
      packageVersionChange: false,
    },
    summary: {
      intentCount: input.intents.length,
      plannedEventCount,
      blockedEventCount,
      affectedFieldRefCount: events.reduce((count, event) => count + event.affectedFieldRefCount, 0),
      affectedDataKeyCount: events.filter((event) => event.affectedDataKey).length,
      registryFieldCount: Object.keys(input.registry.fields).length,
      issueCount: issues.length,
    },
  }
}
