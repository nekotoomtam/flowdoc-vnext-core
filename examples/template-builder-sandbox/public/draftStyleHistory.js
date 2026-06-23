export const DRAFT_STYLE_HISTORY_SOURCE = "flowdoc-template-builder-draft-style-history"
export const DRAFT_STYLE_HISTORY_MODE = "browser-local-style-history-boundary"

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function readyIntent(summary, kind, label) {
  if (!summary) return null
  const ready = summary.canRequestPatch === true || summary.canRequestInsert === true
  if (!ready) return null
  return {
    historyStatus: "not-recorded",
    kind,
    label,
    status: "planned",
    targetTextBlockId: summary.targetTextBlockId || null,
  }
}

function collectIntents(input) {
  return [
    readyIntent(input.inlineStylePatch, "inline.style.patch", "Style patch"),
    readyIntent(input.fieldChipInline, "inline.fieldRef.insert", "Field chip"),
  ].filter(Boolean)
}

function statusForFacts(facts) {
  if (!facts.active) return "idle"
  if (facts.composing) return "composing"
  if (facts.intentCount > 0) return "planned"
  return "guarded"
}

function reasonForFacts(facts) {
  if (!facts.active) return "no-active-draft"
  if (facts.composing) return "composition-active"
  if (facts.intentCount > 0) return "style-aware-intent-ready"
  return "no-style-aware-intent"
}

export function createDraftStyleHistory(draft, input = {}) {
  const active = activeDraft(draft)
  const intents = collectIntents(input)
  const facts = {
    active,
    composing: active && Boolean(draft.isComposing),
    intentCount: intents.length,
  }
  const status = statusForFacts(facts)
  const reason = reasonForFacts(facts)

  return {
    active,
    coreTransaction: {
      status: "not-run",
    },
    durableHistory: {
      status: "not-written",
    },
    exactGeneration: {
      status: "deferred-until-commit",
    },
    history: {
      status: "not-recorded",
    },
    intentCount: intents.length,
    intents,
    liveLayout: {
      status: "not-requested",
    },
    mode: DRAFT_STYLE_HISTORY_MODE,
    reason,
    source: DRAFT_STYLE_HISTORY_SOURCE,
    status,
    styleAwareGrouping: {
      mergeKey: active ? `draft-rich:${draft.textBlockId}` : null,
      status: "planned",
    },
    targetTextBlockId: active ? draft.textBlockId : null,
    version: 1,
  }
}

export function draftStyleHistoryLabel(summary) {
  if (!summary?.active) return "Style history: idle"
  if (summary.status === "composing") return "Style history: composing"
  if (summary.status === "planned") return `Style history: ${summary.intentCount} intents planned`
  return "Style history: guarded"
}
