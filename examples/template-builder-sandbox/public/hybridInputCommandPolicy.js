export const HYBRID_INPUT_COMMAND_POLICY_SOURCE = "flowdoc-hybrid-input-command-policy"
export const HYBRID_INPUT_COMMAND_POLICY_MODE = "browser-local-hybrid-input-command-policy-boundary"

export const HYBRID_INPUT_COMMAND_KINDS = Object.freeze([
  "text.insert",
  "text.delete",
  "selection.replace",
  "rich-inline.toggle-style",
  "field-chip.insert",
  "field-chip.delete",
  "paste.text",
  "paste.rich",
  "commit",
  "cancel",
])

export const HYBRID_INPUT_COMMAND_READINESS = Object.freeze([
  "ready",
  "fallback",
  "blocked",
])

export const HYBRID_INPUT_COMMAND_REJECTION_REASONS = Object.freeze([
  "composition-active",
  "unsupported-target",
  "cross-block-selection",
  "ambiguous-style-overlap",
  "field-chip-internal-edit",
  "unsupported-html-paste",
  "structural-boundary-delete",
])

const DESTRUCTIVE_DURING_COMPOSITION = new Set([
  "text.delete",
  "selection.replace",
  "rich-inline.toggle-style",
  "field-chip.insert",
  "field-chip.delete",
  "paste.text",
  "paste.rich",
  "commit",
])

const TEXTAREA_READY_COMMANDS = new Set([
  "text.insert",
  "text.delete",
  "selection.replace",
  "paste.text",
  "commit",
  "cancel",
])

const RICH_COMMANDS = new Set([
  "rich-inline.toggle-style",
  "field-chip.insert",
  "field-chip.delete",
  "paste.rich",
])

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function targetTypeOf(input) {
  return stringOrNull(input.targetType) || stringOrNull(input.ownership?.targetType) || "none"
}

function islandOf(input) {
  return input.activeIsland || input.island || null
}

function compositionActive(input) {
  return Boolean(input.compositionActive || input.isComposing || islandOf(input)?.composition?.active)
}

function crossBlockSelection(input) {
  const island = islandOf(input)
  const selection = input.selection || island?.selection || {}
  const targetTextBlockId = stringOrNull(input.textBlockId)
    || stringOrNull(island?.textBlockId)
    || stringOrNull(input.ownership?.activeTextBlockId)
  const selectionTextBlockId = stringOrNull(selection.textBlockId) || targetTextBlockId
  return Boolean(targetTextBlockId && selectionTextBlockId && targetTextBlockId !== selectionTextBlockId)
}

function fieldChipInternalEdit(input) {
  const selection = input.selection || islandOf(input)?.selection || {}
  return Boolean(
    input.fieldChipInternalEdit
      || selection.insideFieldChip
      || selection.affinity === "field-chip-internal"
      || selection.affinity === "inside-field-chip",
  )
}

function ambiguousStyleOverlap(input) {
  return Boolean(input.ambiguousStyleOverlap || input.styleOverlap === "ambiguous")
}

function unsupportedHtmlPaste(input) {
  return Boolean(input.unsupportedHtmlPaste || input.paste?.htmlSafe === false || input.paste?.kind === "unsupported-html")
}

function structuralBoundaryDelete(input) {
  return Boolean(input.structuralBoundaryDelete || input.deleteAcrossStructuralBoundary || input.delete?.crossesStructuralBoundary)
}

function status(command, readiness, reason, executionMode, targetType) {
  return {
    command,
    executionMode,
    reason,
    status: readiness,
    targetType,
  }
}

function activeIslandStatus(command, input, targetType) {
  if (compositionActive(input) && DESTRUCTIVE_DURING_COMPOSITION.has(command)) {
    return status(command, "blocked", "composition-active", "rich-contenteditable", targetType)
  }
  if (crossBlockSelection(input)) {
    return status(command, "blocked", "cross-block-selection", "rich-contenteditable", targetType)
  }
  if (fieldChipInternalEdit(input) && command !== "field-chip.delete" && command !== "cancel") {
    return status(command, "blocked", "field-chip-internal-edit", "rich-contenteditable", targetType)
  }
  if (command === "rich-inline.toggle-style" && ambiguousStyleOverlap(input)) {
    return status(command, "blocked", "ambiguous-style-overlap", "rich-contenteditable", targetType)
  }
  if (command === "paste.rich" && unsupportedHtmlPaste(input)) {
    return status(command, "blocked", "unsupported-html-paste", "rich-contenteditable", targetType)
  }
  if (command === "text.delete" && structuralBoundaryDelete(input)) {
    return status(command, "blocked", "structural-boundary-delete", "rich-contenteditable", targetType)
  }
  return status(command, "ready", "active-island-command-ready", "rich-contenteditable", targetType)
}

function textareaFallbackStatus(command, input, targetType) {
  if (compositionActive(input) && DESTRUCTIVE_DURING_COMPOSITION.has(command)) {
    return status(command, "blocked", "composition-active", "textarea-fallback", targetType)
  }
  if (crossBlockSelection(input)) {
    return status(command, "blocked", "cross-block-selection", "textarea-fallback", targetType)
  }
  if (command === "text.delete" && structuralBoundaryDelete(input)) {
    return status(command, "blocked", "structural-boundary-delete", "textarea-fallback", targetType)
  }
  if (TEXTAREA_READY_COMMANDS.has(command)) {
    return status(command, "ready", "textarea-fallback-command-ready", "textarea-fallback", targetType)
  }
  if (RICH_COMMANDS.has(command)) {
    return status(command, "fallback", "rich-command-fallback-to-plain-text", "textarea-fallback", targetType)
  }
  return status(command, "blocked", "unsupported-target", "textarea-fallback", targetType)
}

function managedCardStatus(command, targetType) {
  if (command === "cancel") return status(command, "ready", "managed-card-cancel-ready", "managed-card", targetType)
  return status(command, "blocked", "unsupported-target", "managed-card", targetType)
}

function rejectedStatus(command, targetType) {
  return status(command, "blocked", "unsupported-target", "rejected", targetType)
}

function policyForCommand(command, input) {
  const targetType = targetTypeOf(input)
  if (!HYBRID_INPUT_COMMAND_KINDS.includes(command)) {
    return status(command, "blocked", "unsupported-command", "rejected", targetType)
  }
  if (targetType === "active-text-block-island") return activeIslandStatus(command, input, targetType)
  if (targetType === "textarea-fallback") return textareaFallbackStatus(command, input, targetType)
  if (targetType === "managed-card-selection") return managedCardStatus(command, targetType)
  return rejectedStatus(command, targetType)
}

export function createHybridInputCommandPolicy(input = {}) {
  const commands = Array.isArray(input.commands) && input.commands.length > 0
    ? input.commands
    : HYBRID_INPUT_COMMAND_KINDS
  const commandReadiness = commands.map((command) => policyForCommand(command, input))
  const requestedCommand = stringOrNull(input.commandKind) || stringOrNull(input.command?.kind) || null
  const requested = requestedCommand ? policyForCommand(requestedCommand, input) : null

  return {
    blockedCommands: commandReadiness.filter((entry) => entry.status === "blocked"),
    commandReadiness,
    execution: {
      reason: "Phase 156 returns policy only",
      status: "not-run",
    },
    fallbackCommands: commandReadiness.filter((entry) => entry.status === "fallback"),
    mode: HYBRID_INPUT_COMMAND_POLICY_MODE,
    packageMutation: {
      reason: "command policy does not mutate package data",
      status: "not-mutated",
    },
    readyCommands: commandReadiness.filter((entry) => entry.status === "ready"),
    requested,
    source: HYBRID_INPUT_COMMAND_POLICY_SOURCE,
    targetType: targetTypeOf(input),
    version: 1,
  }
}

export function hybridInputCommandPolicyLabel(policy) {
  if (!policy) return "Hybrid command policy: idle"
  if (policy.requested) return `Hybrid command policy: ${policy.requested.command} ${policy.requested.status}`
  return `Hybrid command policy: ${policy.readyCommands.length} ready, ${policy.fallbackCommands.length} fallback, ${policy.blockedCommands.length} blocked`
}
