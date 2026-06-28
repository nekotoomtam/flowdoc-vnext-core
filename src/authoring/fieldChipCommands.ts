export const FIELD_CHIP_COMMAND_SOURCE = "flowdoc-field-chip-command-boundary" as const
export const FIELD_CHIP_COMMAND_MODE = "authoring-field-chip-command-boundary" as const
export const FIELD_CHIP_RICH_INLINE_OPERATION_KIND = "text-block.rich-inline.replace" as const

export type FieldChipCommandKind =
  | "field-chip.delete"
  | "field-chip.copy"
  | "field-chip.paste"
  | "field-chip.replace-with-text"
  | "block-edit-inside-chip"

export type FieldChipCommandStatus = "ready" | "blocked"

export type FieldChipCommandReason =
  | "field-chip-command-ready"
  | "field-chip-copy-ready"
  | "field-chip-paste-ready"
  | "field-chip-replace-with-text-ready"
  | "field-chip-internal-edit"
  | "missing-target-text-block-id"
  | "missing-field-chip"
  | "missing-field-key"
  | "missing-clipboard-field-chip"
  | "missing-replacement-text"
  | "cross-block-selection"
  | "unsupported-field-chip-command"

export interface FieldChipFact {
  chipId: string
  fieldKey: string
  label?: string
  range?: {
    start: number
    end: number
    unit?: "utf16-code-unit-offset"
  }
}

export interface FieldChipClipboardFact {
  kind: "field-chip"
  chipId?: string
  fieldKey: string
  label?: string
}

export interface FieldChipSelectionFact {
  chipId?: string
  insideChip?: boolean
  textBlockId?: string
}

export interface FieldChipCommandInput {
  clipboard?: FieldChipClipboardFact | null
  command: FieldChipCommandKind
  fieldChips?: FieldChipFact[]
  replacementText?: string
  selectedChipId?: string
  selection?: FieldChipSelectionFact | null
  targetTextBlockId?: string
}

export interface FieldChipRichInlineIntent {
  atomic: true
  fieldKey: string
  operationKind: typeof FIELD_CHIP_RICH_INLINE_OPERATION_KIND
  status: "planned-intent"
  targetTextBlockId: string
  type: "delete-field-chip" | "paste-field-chip" | "replace-field-chip-with-text"
}

export interface FieldChipCommandResult {
  clipboard?: FieldChipClipboardFact
  command: FieldChipCommandKind
  fieldKey: string | null
  mode: typeof FIELD_CHIP_COMMAND_MODE
  reason: FieldChipCommandReason
  richInlineIntent: FieldChipRichInlineIntent | null
  source: typeof FIELD_CHIP_COMMAND_SOURCE
  status: FieldChipCommandStatus
  targetTextBlockId: string | null
  version: 1
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function chipById(chips: FieldChipFact[] | undefined, chipId: string | null): FieldChipFact | null {
  if (!chipId) return null
  return chips?.find((chip) => chip.chipId === chipId) ?? null
}

function selectedChip(input: FieldChipCommandInput): FieldChipFact | null {
  return chipById(input.fieldChips, stringOrNull(input.selectedChipId) ?? stringOrNull(input.selection?.chipId))
}

function blocked(input: FieldChipCommandInput, reason: FieldChipCommandReason, fieldKey: string | null = null): FieldChipCommandResult {
  return {
    command: input.command,
    fieldKey,
    mode: FIELD_CHIP_COMMAND_MODE,
    reason,
    richInlineIntent: null,
    source: FIELD_CHIP_COMMAND_SOURCE,
    status: "blocked",
    targetTextBlockId: stringOrNull(input.targetTextBlockId),
    version: 1,
  }
}

function intent(type: FieldChipRichInlineIntent["type"], targetTextBlockId: string, fieldKey: string): FieldChipRichInlineIntent {
  return {
    atomic: true,
    fieldKey,
    operationKind: FIELD_CHIP_RICH_INLINE_OPERATION_KIND,
    status: "planned-intent",
    targetTextBlockId,
    type,
  }
}

function ready(
  input: FieldChipCommandInput,
  reason: FieldChipCommandReason,
  fieldKey: string,
  richInlineIntent: FieldChipRichInlineIntent | null,
  clipboard?: FieldChipClipboardFact,
): FieldChipCommandResult {
  return {
    ...(clipboard ? { clipboard } : {}),
    command: input.command,
    fieldKey,
    mode: FIELD_CHIP_COMMAND_MODE,
    reason,
    richInlineIntent,
    source: FIELD_CHIP_COMMAND_SOURCE,
    status: "ready",
    targetTextBlockId: stringOrNull(input.targetTextBlockId),
    version: 1,
  }
}

function targetIssue(input: FieldChipCommandInput): FieldChipCommandReason | null {
  const targetTextBlockId = stringOrNull(input.targetTextBlockId)
  if (!targetTextBlockId) return "missing-target-text-block-id"
  const selectionTextBlockId = stringOrNull(input.selection?.textBlockId)
  if (selectionTextBlockId && selectionTextBlockId !== targetTextBlockId) return "cross-block-selection"
  return null
}

export function createFieldChipCommand(input: FieldChipCommandInput): FieldChipCommandResult {
  if (input.command === "block-edit-inside-chip" || input.selection?.insideChip) {
    return blocked(input, "field-chip-internal-edit")
  }

  const issue = targetIssue(input)
  if (issue) return blocked(input, issue)

  if (input.command === "field-chip.paste") {
    const clipboard = input.clipboard
    if (clipboard?.kind !== "field-chip" || !stringOrNull(clipboard.fieldKey)) {
      return blocked(input, "missing-clipboard-field-chip")
    }
    return ready(
      input,
      "field-chip-paste-ready",
      clipboard.fieldKey,
      intent("paste-field-chip", input.targetTextBlockId as string, clipboard.fieldKey),
    )
  }

  const chip = selectedChip(input)
  if (!chip) return blocked(input, "missing-field-chip")
  if (!stringOrNull(chip.fieldKey)) return blocked(input, "missing-field-key")

  if (input.command === "field-chip.copy") {
    return ready(input, "field-chip-copy-ready", chip.fieldKey, null, {
      chipId: chip.chipId,
      fieldKey: chip.fieldKey,
      kind: "field-chip",
      ...(chip.label ? { label: chip.label } : {}),
    })
  }

  if (input.command === "field-chip.delete") {
    return ready(
      input,
      "field-chip-command-ready",
      chip.fieldKey,
      intent("delete-field-chip", input.targetTextBlockId as string, chip.fieldKey),
    )
  }

  if (input.command === "field-chip.replace-with-text") {
    if (!stringOrNull(input.replacementText)) return blocked(input, "missing-replacement-text", chip.fieldKey)
    return ready(
      input,
      "field-chip-replace-with-text-ready",
      chip.fieldKey,
      intent("replace-field-chip-with-text", input.targetTextBlockId as string, chip.fieldKey),
    )
  }

  return blocked(input, "unsupported-field-chip-command", chip.fieldKey)
}
