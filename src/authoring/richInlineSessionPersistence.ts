import type { InlineNode } from "../schema/document.js"
import { InlineNodeSchema } from "../schema/document.js"
import type { VNextAuthoringIntentHistoryRecord } from "./intentHistory.js"

export const VNEXT_RICH_INLINE_REPLAY_VALIDATION_SOURCE = "vnext-rich-inline-replay-validation"
export const VNEXT_RICH_INLINE_REPLAY_VALIDATION_MODE = "rich-inline-replay-validation-facts"

export interface VNextRichInlineReplayPatchIssue {
  code: string
  message: string
  path: string
}

export interface VNextRichInlineReplayPatchInput {
  historyRecord?: VNextAuthoringIntentHistoryRecord | null
  groupId?: string | null
  sourceAction?: string
  targetTextBlockId: string
  beforeChildren: readonly InlineNode[]
  afterChildren: readonly InlineNode[]
}

export interface VNextRichInlineReplayPatchValidationRecord {
  schemaVersion: 1
  commandKind: "text-block.rich-inline.replace"
  groupId: string | null
  sourceAction: string | null
  targetTextBlockId: string
  historySequence: number | null
  historySummary: string | null
  beforeChildren: InlineNode[]
  afterChildren: InlineNode[]
  beforeInlineCount: number
  afterInlineCount: number
  keyHistory: {
    fieldKeys: string[]
    status: "field-ref-usage-recorded" | "not-required"
  }
  validationStatus: "valid" | "invalid"
  issues: VNextRichInlineReplayPatchIssue[]
}

export interface VNextRichInlineReplayPatchRecord extends VNextRichInlineReplayPatchValidationRecord {
  replayStatus: "not-run"
  storageStatus: "not-written"
}

export interface VNextRichInlineReplayValidationOptions {
  historyRecords?: readonly VNextAuthoringIntentHistoryRecord[]
  replayPatches?: readonly VNextRichInlineReplayPatchInput[]
}

export interface VNextRichInlineReplayValidationFacts {
  schemaVersion: 1
  commandKind: "text-block.rich-inline.replace"
  historyReadyRecordCount: number
  richHistoryRecordCount: number
  replayPatchCount: number
  invalidReplayPatchCount: number
  fieldKeys: string[]
  contracts: {
    replayPatchValidation: true
    historyReadyFacts: true
    beforeAfterChildrenSnapshots: true
    storageRecord: false
    storageWrites: false
    routeDispatch: false
    backendApi: false
    replayExecution: false
    conflictResolution: false
    selectionRestore: false
  }
}

export interface VNextRichInlineReplayValidationRecord {
  source: typeof VNEXT_RICH_INLINE_REPLAY_VALIDATION_SOURCE
  mode: typeof VNEXT_RICH_INLINE_REPLAY_VALIDATION_MODE
  replayPatchValidations: VNextRichInlineReplayPatchValidationRecord[]
  facts: VNextRichInlineReplayValidationFacts
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function nonEmptyString(value: string | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function stringOrNull(value: string | null | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function issue(code: string, message: string, path: string): VNextRichInlineReplayPatchIssue {
  return { code, message, path }
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort()
}

function fieldKeysFor(children: readonly InlineNode[]): string[] {
  return uniqueSorted(children.flatMap((child) => child.type === "field-ref" ? [child.key] : []))
}

function validateChildren(side: "beforeChildren" | "afterChildren", children: readonly InlineNode[]): VNextRichInlineReplayPatchIssue[] {
  const ids = new Set<string>()
  const issues: VNextRichInlineReplayPatchIssue[] = []

  children.forEach((child, index) => {
    const parsed = InlineNodeSchema.safeParse(child)
    const path = `${side}[${index}]`
    if (!parsed.success) {
      issues.push(issue("invalid-inline-child", "rich inline replay child must match the vNext inline schema", path))
      return
    }

    if (child.type !== "text" && child.type !== "field-ref") {
      issues.push(issue("unsupported-inline-child", "rich inline replay currently accepts text and field-ref children only", path))
    }

    if (ids.has(child.id)) {
      issues.push(issue("duplicate-inline-id", `inline id "${child.id}" is duplicated`, `${path}.id`))
    }
    ids.add(child.id)
  })

  return issues
}

function richHistoryRecordCount(records: readonly VNextAuthoringIntentHistoryRecord[]): number {
  return records.filter((record) => record.commandKind === "text-block.rich-inline.replace").length
}

export function createVNextRichInlineReplayPatchValidation(
  input: VNextRichInlineReplayPatchInput,
): VNextRichInlineReplayPatchValidationRecord {
  const beforeChildren = input.beforeChildren.map((child) => cloneJson(child))
  const afterChildren = input.afterChildren.map((child) => cloneJson(child))
  const issues = [
    ...validateChildren("beforeChildren", beforeChildren),
    ...validateChildren("afterChildren", afterChildren),
  ]
  const fieldKeys = fieldKeysFor([...beforeChildren, ...afterChildren])

  return {
    schemaVersion: 1,
    commandKind: "text-block.rich-inline.replace",
    groupId: stringOrNull(input.historyRecord?.groupId) ?? stringOrNull(input.groupId),
    sourceAction: nonEmptyString(input.sourceAction),
    targetTextBlockId: input.targetTextBlockId,
    historySequence: input.historyRecord?.sequence ?? null,
    historySummary: input.historyRecord?.summary ?? null,
    beforeChildren,
    afterChildren,
    beforeInlineCount: beforeChildren.length,
    afterInlineCount: afterChildren.length,
    keyHistory: {
      fieldKeys,
      status: fieldKeys.length > 0 ? "field-ref-usage-recorded" : "not-required",
    },
    validationStatus: issues.length > 0 ? "invalid" : "valid",
    issues,
  }
}

function replayPatchRecordFromValidation(
  validation: VNextRichInlineReplayPatchValidationRecord,
): VNextRichInlineReplayPatchRecord {
  return {
    ...cloneJson(validation),
    replayStatus: "not-run",
    storageStatus: "not-written",
  }
}

export function createVNextRichInlineReplayPatchRecord(
  input: VNextRichInlineReplayPatchInput,
): VNextRichInlineReplayPatchRecord {
  return replayPatchRecordFromValidation(createVNextRichInlineReplayPatchValidation(input))
}

export function createVNextRichInlineReplayValidation(
  options: VNextRichInlineReplayValidationOptions = {},
): VNextRichInlineReplayValidationRecord {
  const replayPatchValidations = (options.replayPatches ?? []).map((patch) => createVNextRichInlineReplayPatchValidation(patch))
  const invalidReplayPatchCount = replayPatchValidations.filter((patch) => patch.validationStatus === "invalid").length
  const fieldKeys = uniqueSorted(replayPatchValidations.flatMap((patch) => patch.keyHistory.fieldKeys))
  const historyRecords = options.historyRecords ?? []

  return {
    source: VNEXT_RICH_INLINE_REPLAY_VALIDATION_SOURCE,
    mode: VNEXT_RICH_INLINE_REPLAY_VALIDATION_MODE,
    replayPatchValidations,
    facts: {
      schemaVersion: 1,
      commandKind: "text-block.rich-inline.replace",
      historyReadyRecordCount: historyRecords.length,
      richHistoryRecordCount: richHistoryRecordCount(historyRecords),
      replayPatchCount: replayPatchValidations.length,
      invalidReplayPatchCount,
      fieldKeys,
      contracts: {
        replayPatchValidation: true,
        historyReadyFacts: true,
        beforeAfterChildrenSnapshots: true,
        storageRecord: false,
        storageWrites: false,
        routeDispatch: false,
        backendApi: false,
        replayExecution: false,
        conflictResolution: false,
        selectionRestore: false,
      },
    },
  }
}
