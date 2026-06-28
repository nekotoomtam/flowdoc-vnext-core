export const PASTE_DELETE_PREFLIGHT_SOURCE = "flowdoc-paste-delete-preflight"
export const PASTE_DELETE_PREFLIGHT_MODE = "browser-local-paste-delete-preflight-boundary"

export const PASTE_DELETE_PREFLIGHT_ACTIONS = Object.freeze([
  "allow",
  "transform",
  "fallback",
  "reject",
])

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function normalizedText(value) {
  return String(value ?? "").replaceAll("\r\n", "\n").replaceAll("\r", "\n")
}

function result(action, reason, input = {}, extra = {}) {
  return {
    action,
    diagnostics: action === "reject" ? [reason] : [],
    mode: PASTE_DELETE_PREFLIGHT_MODE,
    packageMutation: {
      reason: "preflight does not mutate package data",
      status: "not-mutated",
    },
    reason,
    source: PASTE_DELETE_PREFLIGHT_SOURCE,
    version: 1,
    ...extra,
  }
}

function compositionActive(input) {
  return Boolean(input.compositionActive || input.isComposing || input.activeIsland?.composition?.active)
}

function selectionFacts(input) {
  return input.selection || input.activeIsland?.selection || {}
}

function structuralBoundary(input) {
  return Boolean(input.structuralBoundary || input.deleteAcrossStructuralBoundary || selectionFacts(input).crossesStructuralBoundary)
}

function chipInternal(input) {
  const selection = selectionFacts(input)
  return Boolean(input.fieldChipInternalEdit || selection.insideFieldChip || selection.affinity === "field-chip-internal")
}

function crossesChip(input) {
  const selection = selectionFacts(input)
  return Boolean(input.crossesFieldChipBoundary || selection.crossesFieldChipBoundary)
}

function nearChip(input) {
  const selection = selectionFacts(input)
  return stringOrNull(input.nearFieldChipId) || stringOrNull(selection.nearFieldChipId)
}

function pasteKind(input) {
  return stringOrNull(input.kind) || stringOrNull(input.paste?.kind) || stringOrNull(input.action)
}

export function createPasteDeletePreflight(input = {}) {
  if (compositionActive(input)) return result("reject", "composition-active", input)

  const kind = pasteKind(input)
  if (kind === "paste.text" || kind === "plain-text-paste") {
    const text = normalizedText(input.text ?? input.paste?.text ?? input.paste?.plainText)
    if (text.length === 0) return result("reject", "empty-text-paste", input)
    const changed = text !== String(input.text ?? input.paste?.text ?? input.paste?.plainText ?? "")
    return result(changed ? "transform" : "allow", changed ? "plain-text-normalized" : "plain-text-paste-ready", input, {
      normalizedText: text,
    })
  }

  if (kind === "paste.rich" || kind === "rich-paste") {
    const paste = input.paste || {}
    if (paste.htmlSafe === false || paste.unsupportedHtml) return result("reject", "unsupported-html-paste", input)
    if (typeof paste.plainText === "string" && !Array.isArray(paste.supportedFragments)) {
      return result("fallback", "rich-paste-fallback-to-plain-text", input, {
        normalizedText: normalizedText(paste.plainText),
      })
    }
    if (Array.isArray(paste.supportedFragments)) {
      return result("transform", "rich-paste-normalized", input, {
        fragmentCount: paste.supportedFragments.length,
      })
    }
    return result("reject", "unsupported-html-paste", input)
  }

  if (kind === "delete.selection" || kind === "delete" || kind === "backspace" || kind === "delete.forward") {
    if (structuralBoundary(input)) return result("reject", "structural-boundary-delete", input)
    if (chipInternal(input)) return result("reject", "field-chip-internal-edit", input)
    if (crossesChip(input)) return result("reject", "delete-across-chip-boundary", input)
    const chipId = nearChip(input)
    if (chipId) {
      return result("transform", "field-chip-boundary-delete-command", input, {
        fieldChipCommand: {
          chipId,
          command: "field-chip.delete",
        },
      })
    }
    return result("allow", "delete-selection-ready", input)
  }

  return result("reject", "unsupported-preflight-kind", input)
}

export function pasteDeletePreflightLabel(summary) {
  if (!summary) return "Paste/delete preflight: idle"
  return `Paste/delete preflight: ${summary.action} ${summary.reason}`
}
