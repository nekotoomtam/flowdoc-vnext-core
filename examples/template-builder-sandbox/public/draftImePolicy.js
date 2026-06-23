export const DRAFT_IME_POLICY_SOURCE = "flowdoc-template-builder-draft-ime-policy"
export const DRAFT_IME_POLICY_MODE = "browser-local-ime-guard"

function activeDraft(draft) {
  return Boolean(draft?.textBlockId)
}

function previewData(value) {
  if (!value) return "none"
  const compact = String(value).replaceAll(/\s+/g, " ")
  return compact.length > 24 ? `${compact.slice(0, 21)}...` : compact
}

function policyStatus(draft) {
  if (!activeDraft(draft)) return "idle"
  if (draft.isComposing) return "composing"
  if (draft.compositionSource === "compositionend") return "settled"
  return "ready"
}

function policyReason(draft) {
  if (!activeDraft(draft)) return "no-active-draft"
  if (draft.isComposing) return "composition-active"
  if (draft.compositionSource === "compositionend") return "composition-settled"
  return "composition-ready"
}

export function createDraftImePolicy(draft, input = {}) {
  const status = policyStatus(draft)
  const reason = policyReason(draft)
  const active = activeDraft(draft)
  const composing = active && Boolean(draft.isComposing)

  return {
    active,
    canChangeRange: active && !composing,
    canCommitDraft: active && !composing,
    canRunDraftCommand: active && !composing,
    commandsBlocked: composing,
    compositionDataPreview: active ? previewData(draft.compositionData) : "none",
    compositionEventCount: active ? draft.compositionEventCount || 0 : 0,
    compositionSource: active ? draft.compositionSource || "idle" : "idle",
    exactGeneration: {
      status: "deferred-until-commit",
    },
    languageProfile: typeof input.languageProfile === "string" && input.languageProfile.length > 0
      ? input.languageProfile
      : "generic-ime",
    mode: DRAFT_IME_POLICY_MODE,
    rangeControlsBlocked: composing,
    reason,
    source: DRAFT_IME_POLICY_SOURCE,
    status,
    targetTextBlockId: active ? draft.textBlockId : null,
    version: 1,
  }
}

export function draftImePolicyLabel(policy) {
  if (!policy?.active) return "IME guard: idle"
  if (policy.status === "composing") return `IME guard: composing ${policy.compositionEventCount} ${policy.compositionDataPreview}`
  if (policy.status === "settled") return "IME guard: settled"
  return "IME guard: ready"
}
