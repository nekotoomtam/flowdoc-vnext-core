export const DRAFT_TOOLBAR_COMMAND_DISPATCH_SOURCE = "flowdoc-template-builder-draft-toolbar-command-dispatch"
export const DRAFT_TOOLBAR_COMMAND_DISPATCH_MODE = "browser-local-toolbar-command-dispatch-boundary"

const STYLE_MARKS = new Set(["bold", "italic", "underline", "strikethrough"])

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function safeStyleMark(value) {
  return STYLE_MARKS.has(value) ? value : null
}

function selectedStyleMark(input) {
  return stringOrNull(input.styleMark) || stringOrNull(input.command?.styleMark) || "bold"
}

function styleControl(toolbarState, mark) {
  return toolbarState?.controls?.find((control) => control.mark === mark) || null
}

function richExecutionReady(richInlinePatchExecution, mark) {
  return richInlinePatchExecution?.status === "applied"
    && richInlinePatchExecution?.canApplyPatch === true
    && richInlinePatchExecution?.patch?.mark === mark
}

function statusForFacts(facts) {
  if (!facts.active) return "idle"
  if (facts.composing) return "composing"
  if (facts.blocked) return "blocked"
  if (facts.guarded) return "guarded"
  if (!facts.requested) return "ready"
  return "dispatched"
}

function reasonForFacts(facts) {
  if (!facts.active) return "no-active-draft"
  if (facts.composing) return "composition-active"
  if (facts.blocked) return facts.blocked
  if (facts.guarded) return facts.guarded
  if (!facts.requested) return "toolbar-command-ready"
  return "toolbar-command-dispatched"
}

function dispatchStatus(status, requested) {
  if (status === "dispatched") return "browser-local-dispatched"
  if (status === "ready" && !requested) return "waiting-for-command"
  return "not-dispatched"
}

function patchResult(status, richInlinePatchExecution) {
  if (status !== "dispatched") {
    return {
      status: "not-created",
      styledRuns: [],
    }
  }

  return {
    browserInlineState: richInlinePatchExecution.browserInlineState,
    status: "created",
    styledRuns: richInlinePatchExecution.browserInlineState.styledRuns,
  }
}

export function createDraftToolbarCommandDispatch(draft, input = {}) {
  const active = activeDraft(draft)
  const mark = selectedStyleMark(input)
  const supportedMark = safeStyleMark(mark)
  const control = supportedMark ? styleControl(input.toolbarState, supportedMark) : null
  const requested = Boolean(input.requested || input.command?.requested)
  const unsupported = !supportedMark
  const guarded = !active || unsupported
    ? null
    : !control || control.enabled !== true || input.toolbarState?.status !== "ready"
      ? "toolbar-control-not-ready"
      : !richExecutionReady(input.richInlinePatchExecution, supportedMark)
        ? "rich-inline-execution-not-ready"
        : null
  const blocked = unsupported ? "unsupported-style-command" : null
  const facts = {
    active,
    blocked,
    composing: active && Boolean(draft.isComposing),
    guarded,
    requested,
  }
  const status = statusForFacts(facts)
  const reason = reasonForFacts(facts)

  return {
    active,
    activeMark: {
      guarded: true,
      mark: supportedMark || mark,
      status: control?.activeState || "unknown-until-rich-inline-execution",
    },
    application: {
      status: status === "dispatched" ? "browser-local-patch-result" : "not-applied",
    },
    backendApi: {
      status: "not-called",
    },
    command: {
      kind: "inline.style.patch",
      mark: supportedMark || mark,
      requested,
    },
    commandDispatch: {
      status: dispatchStatus(status, requested),
    },
    coreTransaction: {
      status: "not-run",
    },
    exactGeneration: {
      status: "deferred-until-commit",
    },
    history: {
      status: "not-recorded",
    },
    liveLayout: {
      status: "not-requested",
    },
    mode: DRAFT_TOOLBAR_COMMAND_DISPATCH_MODE,
    packageMutation: {
      status: "deferred-until-commit",
    },
    patchResult: patchResult(status, input.richInlinePatchExecution),
    reason,
    source: DRAFT_TOOLBAR_COMMAND_DISPATCH_SOURCE,
    status,
    targetTextBlockId: active ? draft.textBlockId : null,
    version: 1,
  }
}

export function draftToolbarCommandDispatchLabel(summary) {
  if (!summary?.active) return "Toolbar dispatch: idle"
  if (summary.status === "composing") return "Toolbar dispatch: composing"
  if (summary.status === "dispatched") return `Toolbar dispatch: ${summary.command.mark} local`
  if (summary.status === "ready") return `Toolbar dispatch: ${summary.command.mark} ready`
  if (summary.reason === "rich-inline-execution-not-ready") return "Toolbar dispatch: rich inline blocked"
  if (summary.reason === "toolbar-control-not-ready") return "Toolbar dispatch: control blocked"
  if (summary.reason === "unsupported-style-command") return "Toolbar dispatch: unsupported"
  return "Toolbar dispatch: guarded"
}
