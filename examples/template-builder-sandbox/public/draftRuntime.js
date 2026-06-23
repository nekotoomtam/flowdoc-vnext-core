export const DRAFT_RUNTIME_SOURCE = "flowdoc-template-builder-draft-runtime"
export const DRAFT_RUNTIME_MODE = "browser-local-draft-runtime"
export const DRAFT_CARET_SELECTION_MODE = "browser-local-caret-selection"

const COMMANDS = {
  fieldRef: "inline.fieldRef.insert",
  insert: "text.insert",
  replaceSelection: "text.replaceSelection",
  stylePatch: "inline.style.patch",
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function safeStatus(status, fallback = "idle") {
  return stringOrNull(status) || fallback
}

export function createIdleDraftState(input = {}) {
  return {
    baseRevision: null,
    compositionData: "",
    compositionEventCount: 0,
    compositionSource: "idle",
    message: stringOrNull(input.message) || "",
    originalText: "",
    isComposing: false,
    selectionDirection: "none",
    selectionEnd: null,
    selectionSource: "idle",
    selectionStart: null,
    status: safeStatus(input.status),
    text: "",
    textBlockId: null,
  }
}

export function draftTextForNode(node) {
  return node?.plainText ?? node?.textPreview ?? ""
}

export function draftGuardReason(node) {
  if (!node) return "Select a text block before starting a draft."
  if (node.type === "text-block" && node.canUseWysiwygDraft) return null
  return node.wysiwygDraftGuardReason || "This node cannot be edited as a safe WYSIWYG draft yet."
}

export function createDraftStateForNode(node, input = {}) {
  const text = stringOrNull(input.text) ?? draftTextForNode(node)
  return {
    ...createIdleDraftState(),
    baseRevision: Number.isFinite(input.baseRevision) ? input.baseRevision : null,
    message: stringOrNull(input.message) || "Draft is open on the canvas.",
    originalText: text,
    selectionEnd: text.length,
    selectionSource: stringOrNull(input.selectionSource) || "start",
    selectionStart: text.length,
    status: "editing",
    text,
    textBlockId: stringOrNull(node?.id),
  }
}

export function draftIsActive(draft) {
  return Boolean(draft?.textBlockId)
}

export function draftIsDirty(draft) {
  return draftIsActive(draft) && draft.text !== draft.originalText
}

export function draftCanCommit(draft, input = {}) {
  return draftIsActive(draft)
    && draftIsDirty(draft)
    && !input.bridgeBusy
    && !draft.isComposing
    && draft.status !== "committing"
}

export function draftStatusLabel(draft) {
  if (!draftIsActive(draft)) return draft?.status || "idle"
  if (draft.isComposing) return "composing"
  if (draft.status === "committing") return "committing"
  if (draft.status === "conflicted") return "conflicted"
  if (draft.status === "rejected") return "rejected"
  return draftIsDirty(draft) ? "dirty" : "editing"
}

export function normalizeDraftSelection(draft) {
  if (!draftIsActive(draft)) {
    return {
      collapsed: true,
      direction: "none",
      end: null,
      length: 0,
      mode: DRAFT_CARET_SELECTION_MODE,
      source: draft?.selectionSource || "idle",
      start: null,
    }
  }

  const textLength = draft.text.length
  const start = Number.isInteger(draft.selectionStart)
    ? Math.max(0, Math.min(draft.selectionStart, textLength))
    : textLength
  const end = Number.isInteger(draft.selectionEnd)
    ? Math.max(0, Math.min(draft.selectionEnd, textLength))
    : start
  const rangeStart = Math.min(start, end)
  const rangeEnd = Math.max(start, end)

  return {
    collapsed: rangeStart === rangeEnd,
    direction: draft.selectionDirection || "none",
    end: rangeEnd,
    length: rangeEnd - rangeStart,
    mode: DRAFT_CARET_SELECTION_MODE,
    source: draft.selectionSource || "unknown",
    start: rangeStart,
  }
}

export function draftSelectionLabel(draft) {
  const selection = normalizeDraftSelection(draft)
  if (!draftIsActive(draft) || selection.start == null || selection.end == null) return "none"
  if (selection.collapsed) return `cursor ${selection.start}`
  return `${selection.start}-${selection.end} (${selection.length})`
}

export function previewDraftText(value, emptyLabel = "empty") {
  if (!value) return emptyLabel
  const compact = String(value).replaceAll(/\s+/g, " ")
  return compact.length > 28 ? `${compact.slice(0, 25)}...` : compact
}

export function draftCompositionLabel(draft) {
  if (!draftIsActive(draft)) return "idle"
  if (!draft.isComposing) return draft.compositionSource || "idle"
  const data = previewDraftText(draft.compositionData, "pending")
  return `${draft.compositionSource || "composition"} ${draft.compositionEventCount}: ${data}`
}

export function clampDraftOffset(draft, value) {
  const textLength = draftIsActive(draft) ? draft.text.length : 0
  if (!Number.isFinite(value)) return textLength
  return Math.max(0, Math.min(Math.round(value), textLength))
}

export function updateDraftSelectionRange(draft, start, end, options = {}) {
  if (!draftIsActive(draft)) {
    return { blocked: true, draft, reason: "no-active-draft", selection: normalizeDraftSelection(draft) }
  }

  if (draft.isComposing) {
    return {
      blocked: true,
      draft: {
        ...draft,
        message: stringOrNull(options.blockedMessage) || "Finish IME composition before changing the draft range.",
      },
      reason: "composition-active",
      selection: normalizeDraftSelection(draft),
    }
  }

  const selectionStart = clampDraftOffset(draft, start)
  const selectionEnd = clampDraftOffset(draft, end)
  const direction = stringOrNull(options.direction) || "none"
  const source = stringOrNull(options.source) || "range-control"
  const rangeStart = Math.min(selectionStart, selectionEnd)
  const rangeEnd = Math.max(selectionStart, selectionEnd)
  const nextDraft = {
    ...draft,
    message: options.message ?? draft.message,
    selectionDirection: direction,
    selectionEnd: rangeEnd,
    selectionSource: source,
    selectionStart: rangeStart,
  }

  return {
    blocked: false,
    draft: nextDraft,
    focus: Boolean(options.focus),
    reason: "ready",
    selection: normalizeDraftSelection(nextDraft),
  }
}

export function applyDraftSelectionAction(draft, action) {
  if (!draftIsActive(draft)) {
    return { blocked: true, draft, reason: "no-active-draft", selection: normalizeDraftSelection(draft) }
  }

  if (draft.isComposing) {
    return {
      blocked: true,
      draft: {
        ...draft,
        message: "Finish IME composition before using range controls.",
      },
      reason: "composition-active",
      selection: normalizeDraftSelection(draft),
    }
  }

  const textLength = draft.text.length
  if (action === "cursor-start") {
    return updateDraftSelectionRange(draft, 0, 0, {
      focus: true,
      message: "Draft cursor moved to start.",
      source: "range-action",
    })
  }

  if (action === "cursor-end") {
    return updateDraftSelectionRange(draft, textLength, textLength, {
      focus: true,
      message: "Draft cursor moved to end.",
      source: "range-action",
    })
  }

  if (action === "select-all") {
    return updateDraftSelectionRange(draft, 0, textLength, {
      direction: "forward",
      focus: true,
      message: "Draft range selected.",
      source: "range-action",
    })
  }

  return { blocked: true, draft, reason: "unknown-action", selection: normalizeDraftSelection(draft) }
}

export function updateDraftSelectionControl(draft, part, value) {
  if (!draftIsActive(draft)) {
    return { blocked: true, draft, reason: "no-active-draft", selection: normalizeDraftSelection(draft) }
  }

  if (draft.isComposing) {
    return {
      blocked: true,
      draft: {
        ...draft,
        message: "Finish IME composition before editing range inputs.",
      },
      reason: "composition-active",
      selection: normalizeDraftSelection(draft),
    }
  }

  const selection = normalizeDraftSelection(draft)
  const nextValue = Number.parseInt(value, 10)
  if (!Number.isFinite(nextValue)) {
    return { blocked: true, draft, reason: "invalid-offset", selection }
  }

  const nextStart = part === "start" ? nextValue : selection.start ?? 0
  const nextEnd = part === "end" ? nextValue : selection.end ?? nextStart

  return updateDraftSelectionRange(draft, nextStart, nextEnd, {
    direction: "forward",
    message: "Draft range updated.",
    source: "range-input",
  })
}

export function updateDraftSelectionFromEditor(draft, input = {}) {
  if (!draftIsActive(draft)) return { draft, updated: false }
  if (input.draftNodeId !== draft.textBlockId) return { draft, updated: false }

  const value = typeof input.value === "string" ? input.value : draft.text
  const selectionStart = Number.isInteger(input.selectionStart) ? input.selectionStart : value.length
  const selectionEnd = Number.isInteger(input.selectionEnd) ? input.selectionEnd : selectionStart
  return {
    draft: {
      ...draft,
      selectionDirection: stringOrNull(input.selectionDirection) || "none",
      selectionEnd,
      selectionSource: stringOrNull(input.selectionSource) || "editor",
      selectionStart,
      text: value,
    },
    updated: true,
  }
}

export function updateDraftComposition(draft, input = {}) {
  const selectionResult = updateDraftSelectionFromEditor(draft, input)
  const selectedDraft = selectionResult.draft
  if (!selectionResult.updated) return { draft: selectedDraft, updated: false }

  if (input.phase === "compositionend") {
    return {
      draft: {
        ...selectedDraft,
        compositionData: "",
        compositionEventCount: selectedDraft.compositionEventCount + 1,
        compositionSource: "compositionend",
        isComposing: false,
        message: "IME composition finished. Draft changes are waiting for commit.",
        status: "editing",
      },
      updated: true,
    }
  }

  return {
    draft: {
      ...selectedDraft,
      compositionData: stringOrNull(input.eventData) || "",
      compositionEventCount: selectedDraft.compositionEventCount + 1,
      compositionSource: stringOrNull(input.phase) || "composition",
      isComposing: true,
      message: "IME composition is active. Finish composition before commands or commit.",
      status: "editing",
    },
    updated: true,
  }
}

export function markDraftInput(draft, input = {}) {
  const selectionResult = updateDraftSelectionFromEditor(draft, input)
  if (!selectionResult.updated) return { draft, updated: false }
  const selectedDraft = selectionResult.draft

  if (selectedDraft.isComposing || input.isComposing) {
    return {
      draft: {
        ...selectedDraft,
        compositionSource: selectedDraft.compositionSource === "idle"
          ? "input-composing"
          : selectedDraft.compositionSource,
        isComposing: true,
        message: "IME composition is active. Finish composition before commands or commit.",
        status: "editing",
      },
      updated: true,
    }
  }

  return {
    draft: {
      ...selectedDraft,
      message: "Local draft changes are waiting for commit.",
      status: "editing",
    },
    updated: true,
  }
}

export function draftCommandReadiness(context) {
  if (!context.active) {
    return [
      {
        command: COMMANDS.insert,
        label: "Insert text",
        status: "blocked",
        reason: "no active browser draft",
      },
      {
        command: COMMANDS.replaceSelection,
        label: "Replace selection",
        status: "blocked",
        reason: "no active browser draft",
      },
      {
        command: COMMANDS.fieldRef,
        label: "Insert key",
        status: "planned",
        reason: "requires atomic inline draft command support",
      },
      {
        command: COMMANDS.stylePatch,
        label: "Style range",
        status: "planned",
        reason: "requires rich inline range mapping",
      },
    ]
  }

  if (context.isComposing) {
    return [
      {
        command: COMMANDS.insert,
        label: "Insert text",
        status: "blocked",
        reason: "IME composition is active; finish composition before applying draft commands",
      },
      {
        command: COMMANDS.replaceSelection,
        label: "Replace selection",
        status: "blocked",
        reason: "IME composition is active; finish composition before replacing selection",
      },
      {
        command: COMMANDS.fieldRef,
        label: "Insert key",
        status: "planned",
        reason: "key insertion waits for atomic inline draft support",
      },
      {
        command: COMMANDS.stylePatch,
        label: "Style range",
        status: "planned",
        reason: "rich style commands wait for inline range mapping",
      },
    ]
  }

  return [
    {
      command: COMMANDS.insert,
      label: "Insert text",
      status: "ready",
      reason: context.collapsed
        ? "cursor can accept plain text insertion in the active browser draft"
        : "selected range can be replaced by inserted plain text in the active browser draft",
    },
    {
      command: COMMANDS.replaceSelection,
      label: "Replace selection",
      status: context.collapsed ? "guarded" : "ready",
      reason: context.collapsed
        ? "selection is collapsed; replace needs a non-empty range"
        : "selected range can be replaced in the active browser draft",
    },
    {
      command: COMMANDS.fieldRef,
      label: "Insert key",
      status: "planned",
      reason: "key insertion waits for atomic inline draft support",
    },
    {
      command: COMMANDS.stylePatch,
      label: "Style range",
      status: "planned",
      reason: "rich style commands wait for inline range mapping",
    },
  ]
}

export function deriveDraftCommandContext(draft) {
  const selection = normalizeDraftSelection(draft)
  const active = draftIsActive(draft) && selection.start != null && selection.end != null

  if (!active) {
    const context = {
      active: false,
      afterTextPreview: "none",
      baseRevision: null,
      collapsed: true,
      beforeTextPreview: "none",
      commandSurface: "none",
      isComposing: false,
      mode: DRAFT_RUNTIME_MODE,
      readiness: [],
      selectedTextPreview: "none",
      selectionDirection: "none",
      selectionEnd: null,
      selectionLength: 0,
      selectionMode: selection.mode,
      selectionSource: selection.source,
      selectionStart: null,
      source: DRAFT_RUNTIME_SOURCE,
      targetTextBlockId: null,
      version: 1,
    }
    return {
      ...context,
      readiness: draftCommandReadiness(context),
    }
  }

  const text = draft.text
  const beforeText = text.slice(Math.max(0, selection.start - 28), selection.start)
  const selectedText = text.slice(selection.start, selection.end)
  const afterText = text.slice(selection.end, selection.end + 28)
  const context = {
    active: true,
    afterTextPreview: previewDraftText(afterText, "none"),
    baseRevision: draft.baseRevision,
    beforeTextPreview: previewDraftText(beforeText, "none"),
    collapsed: selection.collapsed,
    commandSurface: "browser-draft",
    isComposing: Boolean(draft.isComposing),
    mode: DRAFT_RUNTIME_MODE,
    readiness: [],
    selectedTextPreview: previewDraftText(selectedText, selection.collapsed ? "cursor" : "empty selection"),
    selectionDirection: selection.direction,
    selectionEnd: selection.end,
    selectionLength: selection.length,
    selectionMode: selection.mode,
    selectionSource: selection.source,
    selectionStart: selection.start,
    source: DRAFT_RUNTIME_SOURCE,
    targetTextBlockId: draft.textBlockId,
    version: 1,
  }

  return {
    ...context,
    readiness: draftCommandReadiness(context),
  }
}

export function draftCommandSummary(draft) {
  const context = deriveDraftCommandContext(draft)
  if (!context.active) return "none"

  const insert = context.readiness.find((item) => item.command === COMMANDS.insert)
  const replace = context.readiness.find((item) => item.command === COMMANDS.replaceSelection)
  return `${insert?.status || "blocked"} insert / ${replace?.status || "blocked"} replace`
}

export function draftCommandActionCanRun(input = {}) {
  const context = input.context || deriveDraftCommandContext(input.draft)
  const commandText = typeof input.commandText === "string" ? input.commandText : ""
  if (!context.active || input.bridgeBusy || context.isComposing || commandText.length === 0) return false
  if (input.action === "insert-text") return true
  if (input.action === "replace-selection") return !context.collapsed
  return false
}

export function setDraftMessage(draft, message, status = draft?.status || "editing") {
  if (!draftIsActive(draft)) return draft
  return {
    ...draft,
    message,
    status,
  }
}

export function setDraftTextFromCommand(draft, nextText, selectionStart, selectionEnd, message) {
  const textLength = nextText.length
  const start = Math.max(0, Math.min(selectionStart, textLength))
  const end = Math.max(0, Math.min(selectionEnd, textLength))

  return {
    ...draft,
    message,
    selectionDirection: "none",
    selectionEnd: end,
    selectionSource: "command",
    selectionStart: start,
    status: "editing",
    text: nextText,
  }
}

export function applyDraftTextCommand(draft, input = {}) {
  const context = input.context || deriveDraftCommandContext(draft)
  const commandText = typeof input.commandText === "string" ? input.commandText : ""
  const action = input.action

  if (!context.active) {
    return { applied: false, draft, reason: "no-active-draft" }
  }

  if (context.isComposing) {
    return {
      applied: false,
      draft: setDraftMessage(draft, "Finish IME composition before applying a browser-local draft command."),
      reason: "composition-active",
    }
  }

  if (commandText.length === 0) {
    return {
      applied: false,
      draft: setDraftMessage(draft, "Type command text before applying a browser-local draft command."),
      reason: "empty-command-text",
    }
  }

  if (action === "replace-selection" && context.collapsed) {
    return {
      applied: false,
      draft: setDraftMessage(draft, "Select a non-empty draft range before replacing selection."),
      reason: "collapsed-selection",
    }
  }

  if (action !== "insert-text" && action !== "replace-selection") {
    return { applied: false, draft, reason: "unknown-action" }
  }

  const rangeStart = context.selectionStart ?? draft.text.length
  const rangeEnd = context.selectionEnd ?? rangeStart
  const nextText = `${draft.text.slice(0, rangeStart)}${commandText}${draft.text.slice(rangeEnd)}`
  const nextCursor = rangeStart + commandText.length
  const actionLabel = action === "replace-selection" ? "replace selection" : "insert text"

  return {
    applied: true,
    draft: setDraftTextFromCommand(
      draft,
      nextText,
      nextCursor,
      nextCursor,
      `Applied browser-local ${actionLabel}; commit the draft to persist it.`,
    ),
    nextSelection: {
      direction: "none",
      end: nextCursor,
      start: nextCursor,
    },
    reason: "ready",
  }
}
