import {
  createPasteDeletePreflight,
} from "./pasteDeletePreflight.js"
import {
  createGuardedInputRuntimeSlice,
} from "./guardedInputRuntimeSlice.js"

export const GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_SOURCE = "flowdoc-guarded-input-paste-delete-field-chip-slice"
export const GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_MODE = "sandbox-local-guarded-input-paste-delete-field-chip-slice"

export const GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_STATUSES = Object.freeze([
  "accepted",
  "transformed",
  "fallback",
  "blocked",
])

const HARD_LIMITS = Object.freeze([
  "no-arbitrary-dom-html-package-truth",
  "no-field-chip-internal-edit",
  "no-structural-boundary-delete",
  "no-commit-during-composition",
  "no-production-contenteditable-readiness",
  "no-package-schema-change",
  "no-storage-backend-route",
  "no-pdf-docx-renderer-work",
  "no-collaboration-offline-claim",
])

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function kindOf(input) {
  return stringOrNull(input.kind)
    || stringOrNull(input.command)
    || stringOrNull(input.action)
    || stringOrNull(input.paste?.kind)
    || "paste.text"
}

function textOf(input) {
  if (typeof input.text === "string") return input.text
  if (typeof input.baseText === "string") return input.baseText
  if (typeof input.selectedNode?.plainText === "string") return input.selectedNode.plainText
  return ""
}

function runtimeDraftText(input, text) {
  if (typeof input.runtimeDraftText === "string") return input.runtimeDraftText
  if (typeof input.draftText === "string") return input.draftText
  return `${text} `
}

function targetTextBlockId(input, runtime) {
  return stringOrNull(input.targetTextBlockId)
    || stringOrNull(input.textBlockId)
    || stringOrNull(runtime?.summary?.targetTextBlockId)
    || stringOrNull(input.selectedNode?.id)
}

function chipById(input, chipId) {
  const chips = Array.isArray(input.fieldChips) ? input.fieldChips : []
  return chips.find((chip) => chip?.chipId === chipId) || null
}

function selectedChip(input, chipId) {
  return chipById(input, chipId || stringOrNull(input.selectedChipId) || stringOrNull(input.selection?.chipId))
}

function fieldChipIntent(type, targetTextBlockIdValue, fieldKey) {
  return {
    atomic: true,
    fieldKey,
    operationKind: "text-block.rich-inline.replace",
    status: "planned-intent",
    targetTextBlockId: targetTextBlockIdValue,
    type,
  }
}

function fieldChipBlocked(command, reason, input, targetTextBlockIdValue) {
  return {
    command,
    fieldKey: null,
    reason,
    richInlineIntent: null,
    status: "blocked",
    targetTextBlockId: targetTextBlockIdValue,
  }
}

function fieldChipReady(command, reason, fieldKey, targetTextBlockIdValue, richInlineIntent, clipboard) {
  return {
    ...(clipboard ? { clipboard } : {}),
    command,
    fieldKey,
    reason,
    richInlineIntent,
    status: "ready",
    targetTextBlockId: targetTextBlockIdValue,
  }
}

function createFieldChipInputCommand(input, command, targetTextBlockIdValue, chipId = null) {
  if (input.selection?.insideChip || input.selection?.insideFieldChip || command === "block-edit-inside-chip") {
    return fieldChipBlocked(command, "field-chip-internal-edit", input, targetTextBlockIdValue)
  }
  if (!targetTextBlockIdValue) {
    return fieldChipBlocked(command, "missing-target-text-block-id", input, null)
  }
  if (input.selection?.textBlockId && input.selection.textBlockId !== targetTextBlockIdValue) {
    return fieldChipBlocked(command, "cross-block-selection", input, targetTextBlockIdValue)
  }
  if (command === "field-chip.paste") {
    const clipboard = input.clipboard || null
    const fieldKey = stringOrNull(clipboard?.fieldKey)
    if (clipboard?.kind !== "field-chip" || !fieldKey) {
      return fieldChipBlocked(command, "missing-clipboard-field-chip", input, targetTextBlockIdValue)
    }
    return fieldChipReady(
      command,
      "field-chip-paste-ready",
      fieldKey,
      targetTextBlockIdValue,
      fieldChipIntent("paste-field-chip", targetTextBlockIdValue, fieldKey),
    )
  }

  const chip = selectedChip(input, chipId)
  if (!chip) return fieldChipBlocked(command, "missing-field-chip", input, targetTextBlockIdValue)
  const fieldKey = stringOrNull(chip.fieldKey)
  if (!fieldKey) return fieldChipBlocked(command, "missing-field-key", input, targetTextBlockIdValue)

  if (command === "field-chip.copy") {
    return fieldChipReady(command, "field-chip-copy-ready", fieldKey, targetTextBlockIdValue, null, {
      chipId: chip.chipId,
      fieldKey,
      kind: "field-chip",
      ...(chip.label ? { label: chip.label } : {}),
    })
  }
  if (command === "field-chip.delete") {
    return fieldChipReady(
      command,
      "field-chip-command-ready",
      fieldKey,
      targetTextBlockIdValue,
      fieldChipIntent("delete-field-chip", targetTextBlockIdValue, fieldKey),
    )
  }
  if (command === "field-chip.replace-with-text") {
    if (!stringOrNull(input.replacementText)) {
      return fieldChipBlocked(command, "missing-replacement-text", input, targetTextBlockIdValue)
    }
    return fieldChipReady(
      command,
      "field-chip-replace-with-text-ready",
      fieldKey,
      targetTextBlockIdValue,
      fieldChipIntent("replace-field-chip-with-text", targetTextBlockIdValue, fieldKey),
    )
  }

  return fieldChipBlocked(command, "unsupported-field-chip-command", input, targetTextBlockIdValue)
}

function baseReport(input, runtime, targetTextBlockIdValue) {
  return {
    hardLimits: HARD_LIMITS,
    mode: GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_MODE,
    productionReadiness: {
      reason: "Phase 170 is sandbox-local and does not claim production readiness",
      status: "not-claimed",
    },
    runtime: {
      reason: runtime.reason,
      status: runtime.status,
      targetTextBlockId: targetTextBlockIdValue,
    },
    source: GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_SOURCE,
    version: 1,
  }
}

function reportFromPreflight(input, runtime, preflight, fieldChipCommand, targetTextBlockIdValue) {
  const base = baseReport(input, runtime, targetTextBlockIdValue)
  const blocked = preflight.action === "reject" || fieldChipCommand?.status === "blocked"
  const fallback = preflight.action === "fallback"
  const transformed = preflight.action === "transform" || fieldChipCommand?.richInlineIntent

  return {
    ...base,
    fieldChipCommand,
    packageMutation: {
      reason: fieldChipCommand?.richInlineIntent
        ? "field chip command is planned intent only"
        : "paste/delete slice does not mutate package data",
      status: fieldChipCommand?.richInlineIntent ? "planned-intent-only" : "not-mutated",
    },
    preflight,
    reason: fieldChipCommand?.reason || preflight.reason,
    status: blocked ? "blocked" : fallback ? "fallback" : transformed ? "transformed" : "accepted",
    summary: {
      action: preflight.action,
      fieldChipCommand: fieldChipCommand?.command || null,
      targetTextBlockId: targetTextBlockIdValue,
    },
  }
}

export function createGuardedInputPasteDeleteFieldChipSlice(input = {}) {
  const text = textOf(input)
  const runtime = createGuardedInputRuntimeSlice({
    ...input,
    draftText: runtimeDraftText(input, text),
    text,
  })
  const targetTextBlockIdValue = targetTextBlockId(input, runtime)
  const kind = kindOf(input)
  const directFieldChipCommand = kind.startsWith("field-chip.") || kind === "block-edit-inside-chip"

  if (directFieldChipCommand) {
    const fieldChipCommand = createFieldChipInputCommand(input, kind, targetTextBlockIdValue)
    return {
      ...baseReport(input, runtime, targetTextBlockIdValue),
      fieldChipCommand,
      packageMutation: {
        reason: fieldChipCommand.richInlineIntent
          ? "field chip command is planned intent only"
          : "field chip command does not mutate package data",
        status: fieldChipCommand.richInlineIntent ? "planned-intent-only" : "not-mutated",
      },
      preflight: null,
      reason: fieldChipCommand.reason,
      status: fieldChipCommand.status === "blocked"
        ? "blocked"
        : fieldChipCommand.richInlineIntent
          ? "transformed"
          : "accepted",
      summary: {
        action: "field-chip-command",
        fieldChipCommand: fieldChipCommand.command,
        targetTextBlockId: targetTextBlockIdValue,
      },
    }
  }

  const preflight = createPasteDeletePreflight({
    ...input,
    activeIsland: runtime.activeIsland,
    kind,
    selection: input.selection,
  })
  const fieldChipCommand = preflight.fieldChipCommand
    ? createFieldChipInputCommand(input, preflight.fieldChipCommand.command, targetTextBlockIdValue, preflight.fieldChipCommand.chipId)
    : null

  return reportFromPreflight(input, runtime, preflight, fieldChipCommand, targetTextBlockIdValue)
}

export function guardedInputPasteDeleteFieldChipSliceLabel(report) {
  if (!report) return "Guarded paste/delete/field-chip slice: missing"
  return `Guarded paste/delete/field-chip slice: ${report.status} ${report.reason}`
}
