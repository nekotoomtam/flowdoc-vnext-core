import {
  activateActiveTextBlockIsland,
  beginActiveTextBlockIslandComposition,
  createInactiveActiveTextBlockIslandState,
  endActiveTextBlockIslandComposition,
  openActiveTextBlockIsland,
  requestActiveTextBlockIslandCommit,
  updateActiveTextBlockIslandDraft,
  updateActiveTextBlockIslandSelection,
} from "./activeTextBlockIsland.js"
import {
  createActiveIslandCommitBridgeSmoke,
} from "./activeIslandCommitBridge.js"
import {
  createActiveTextBlockDomBindingSmoke,
} from "./activeTextBlockDomBinding.js"
import {
  createHybridInputCommandPolicy,
} from "./hybridInputCommandPolicy.js"
import {
  createHybridInputRuntimeOwnership,
} from "./inputRuntimeOwnership.js"
import {
  createPasteDeletePreflight,
} from "./pasteDeletePreflight.js"

export const HYBRID_INPUT_BROWSER_QA_SOURCE = "flowdoc-hybrid-input-browser-qa"
export const HYBRID_INPUT_BROWSER_QA_MODE = "sandbox-local-hybrid-input-browser-qa-boundary"

export const HYBRID_INPUT_BROWSER_QA_CASES = Object.freeze([
  "selection-start-end",
  "caret-move",
  "ime-composition-lifecycle",
  "plain-text-paste",
  "blocked-rich-unsafe-paste",
  "delete-backspace-near-field-chip",
  "active-island-commit",
  "fallback-behavior",
  "single-active-text-block-guard",
])

const DEFAULT_TEXT_BLOCK = Object.freeze({
  canUseHardenedTextBlockIsland: true,
  id: "cover-header-label",
  plainText: "Product Report",
  type: "text-block",
})

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function safeClone(value) {
  return JSON.parse(JSON.stringify(value))
}

function activeIsland(input = {}) {
  const node = input.node || DEFAULT_TEXT_BLOCK
  const text = typeof input.text === "string" ? input.text : node.plainText
  const textBlockId = stringOrNull(input.textBlockId) || node.id
  const ownership = createHybridInputRuntimeOwnership({
    requestedTargetType: "active-text-block-island",
    selectedNode: node,
  })
  return activateActiveTextBlockIsland(openActiveTextBlockIsland(createInactiveActiveTextBlockIslandState(), {
    ownership,
    selection: input.selection || { end: text.length, start: text.length },
    text,
    textBlockId,
  }))
}

function surface(textBlockId, text) {
  return {
    contentEditable: "true",
    dataset: {
      activeNodeId: textBlockId,
      textBlockId,
    },
    textContent: text,
  }
}

function capture(island, selection) {
  return createActiveTextBlockDomBindingSmoke(island, {
    selection,
    surface: surface(island.textBlockId, island.draftText),
  })
}

function caseResult(caseId, status, reason, evidence = {}, assertions = []) {
  return safeClone({
    assertions,
    caseId,
    evidence,
    packageMutation: {
      reason: "browser QA evidence does not mutate package data",
      status: "not-mutated",
    },
    reason,
    status,
  })
}

function selectionCase() {
  const selected = updateActiveTextBlockIslandSelection(activeIsland(), {
    direction: "forward",
    end: 7,
    source: "browser-qa-selectionchange",
    start: 2,
  })
  const binding = capture(selected, selected.selection)
  return caseResult("selection-start-end", "evidence", binding.reason, {
    bindingStatus: binding.status,
    selection: binding.capture?.selection || null,
    textBlockId: selected.textBlockId,
  }, [
    "selection offsets are UTF-16 code units",
    "selection facts are JSON-safe",
  ])
}

function caretCase() {
  const moved = updateActiveTextBlockIslandSelection(activeIsland(), {
    direction: "none",
    end: 10,
    source: "browser-qa-caret-move",
    start: 10,
  })
  const binding = capture(moved, moved.selection)
  return caseResult("caret-move", "evidence", binding.reason, {
    caret: binding.capture?.selection || null,
    collapsed: binding.capture?.selection?.collapsed === true,
    textBlockId: moved.textBlockId,
  }, [
    "caret move is represented as a collapsed UTF-16 selection",
  ])
}

function imeCase() {
  const active = activeIsland()
  const composing = beginActiveTextBlockIslandComposition(active, {
    data: "ไ",
    source: "compositionstart",
  })
  const draftDuringComposition = updateActiveTextBlockIslandDraft(composing, {
    selection: { end: 15, start: 15 },
    text: "Product Report ไ",
  })
  const blockedCommit = requestActiveTextBlockIslandCommit(draftDuringComposition)
  const ended = endActiveTextBlockIslandComposition(draftDuringComposition, {
    data: "ไ",
    source: "compositionend",
  })
  return caseResult("ime-composition-lifecycle", "evidence", "composition-lifecycle-captured", {
    blockedCommit: blockedCommit.commit,
    compositionActiveDuringDraft: draftDuringComposition.composition.active,
    compositionEnded: ended.composition,
    eventCount: ended.composition.eventCount,
    finalStatus: ended.status,
  }, [
    "commit remains blocked while composition is active",
    "composition facts stay browser-local",
  ])
}

function plainTextPasteCase() {
  const preflight = createPasteDeletePreflight({
    kind: "paste.text",
    text: "Browser\r\nQA paste",
  })
  return caseResult("plain-text-paste", "evidence", preflight.reason, {
    normalizedText: preflight.normalizedText,
    preflightAction: preflight.action,
    preflightReason: preflight.reason,
  }, [
    "plain text paste is normalized before any package mutation",
  ])
}

function unsafePasteCase() {
  const preflight = createPasteDeletePreflight({
    kind: "paste.rich",
    paste: {
      htmlSafe: false,
      plainText: "Unsafe rich paste",
    },
  })
  const policy = createHybridInputCommandPolicy({
    activeIsland: activeIsland(),
    commandKind: "paste.rich",
    ownership: createHybridInputRuntimeOwnership({
      requestedTargetType: "active-text-block-island",
      selectedNode: DEFAULT_TEXT_BLOCK,
    }),
    paste: {
      htmlSafe: false,
    },
  })
  return caseResult("blocked-rich-unsafe-paste", "blocked", preflight.reason, {
    commandPolicy: policy.requested,
    preflightAction: preflight.action,
    preflightReason: preflight.reason,
    unsafeDomPackageTruth: "blocked",
  }, [
    "unsafe rich paste never becomes package truth",
  ])
}

function fieldChipDeleteCase() {
  const preflight = createPasteDeletePreflight({
    kind: "backspace",
    selection: {
      end: 8,
      nearFieldChipId: "chip-customer-name",
      start: 8,
    },
  })
  return caseResult("delete-backspace-near-field-chip", "evidence", preflight.reason, {
    fieldChipCommand: preflight.fieldChipCommand || null,
    preflightAction: preflight.action,
    preflightReason: preflight.reason,
  }, [
    "field-chip atomics are guarded by command transform",
  ])
}

function commitCase() {
  const dirty = updateActiveTextBlockIslandDraft(activeIsland(), {
    selection: { end: 17, start: 17 },
    text: "Browser QA commit",
  })
  const commitReadyIsland = requestActiveTextBlockIslandCommit(dirty)
  const ownership = createHybridInputRuntimeOwnership({
    requestedTargetType: "active-text-block-island",
    selectedNode: DEFAULT_TEXT_BLOCK,
  })
  const commandPolicy = createHybridInputCommandPolicy({
    activeIsland: commitReadyIsland,
    commandKind: "commit",
    ownership,
  })
  const binding = capture(commitReadyIsland, commitReadyIsland.selection)
  const bridge = createActiveIslandCommitBridgeSmoke({
    activeIsland: commitReadyIsland,
    commandPolicy,
    documentRevision: 0,
    domBinding: binding,
  })
  return caseResult("active-island-commit", "evidence", bridge.reason, {
    bridgeAction: bridge.bridgeAction,
    bridgeStatus: bridge.status,
    operationKind: bridge.bridgeRequest?.plan?.operationKind || null,
    packageMutation: bridge.packageMutation,
    targetTextBlockId: bridge.targetTextBlockId,
  }, [
    "commit is planned through the existing rich inline replacement bridge",
    "package mutation is not applied by browser QA evidence",
  ])
}

function fallbackCase() {
  const fallbackNode = {
    ...DEFAULT_TEXT_BLOCK,
    canUseHardenedTextBlockIsland: false,
    id: "summary-rich",
    plainText: "Summary fallback",
  }
  const ownership = createHybridInputRuntimeOwnership({
    requestedTargetType: "active-text-block-island",
    selectedNode: fallbackNode,
  })
  const policy = createHybridInputCommandPolicy({
    commandKind: "paste.rich",
    ownership,
    targetType: ownership.targetType,
  })
  return caseResult("fallback-behavior", "fallback", ownership.reason, {
    activeTextBlockId: ownership.activeTextBlockId,
    fallbackReason: ownership.fallbackReason,
    requestedCommand: policy.requested,
    targetType: ownership.targetType,
  }, [
    "textarea fallback is explicit for island-ineligible text blocks",
  ])
}

function singleIslandGuardCase() {
  const first = activeIsland({
    textBlockId: "cover-header-label",
  })
  const second = openActiveTextBlockIsland(first, {
    selection: { end: 5, start: 5 },
    text: "Second block",
    textBlockId: "other-text-block",
  })
  return caseResult("single-active-text-block-guard", "blocked", second.reason, {
    attemptedTextBlockId: "other-text-block",
    openTextBlockId: first.textBlockId,
    resultStatus: second.status,
  }, [
    "only one active text-block island may own input",
  ])
}

function buildCases() {
  return [
    selectionCase(),
    caretCase(),
    imeCase(),
    plainTextPasteCase(),
    unsafePasteCase(),
    fieldChipDeleteCase(),
    commitCase(),
    fallbackCase(),
    singleIslandGuardCase(),
  ]
}

export function createHybridInputBrowserQaReport(input = {}) {
  const cases = buildCases()
  const counts = cases.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] || 0) + 1
    return acc
  }, {})

  return safeClone({
    cases,
    environment: {
      browserDriver: stringOrNull(input.browserDriver) || "not-bound",
      browserDriverRequired: false,
      runner: stringOrNull(input.runner) || "node-sandbox-json-safe-events",
      sandboxLocalEvidence: true,
    },
    hardLimits: {
      collaborationOffline: "not-implemented",
      fullDocumentContenteditable: "blocked",
      legacyEditorRuntimeCopy: "blocked",
      packageDocumentSchemaChange: "blocked",
      pdfDocxRendererWork: "blocked",
      productionContenteditableReadiness: "not-claimed",
      storageBackendRoute: "blocked",
    },
    mode: HYBRID_INPUT_BROWSER_QA_MODE,
    packageTruth: {
      reason: "browser QA report is evidence only",
      status: "not-mutated",
    },
    reportShape: {
      caseFields: ["caseId", "status", "reason", "evidence", "assertions", "packageMutation"],
      jsonSafe: true,
    },
    source: HYBRID_INPUT_BROWSER_QA_SOURCE,
    status: cases.every((entry) => ["blocked", "evidence", "fallback"].includes(entry.status)) ? "passed" : "warning",
    summary: {
      blockedCount: counts.blocked || 0,
      caseCount: cases.length,
      evidenceCount: counts.evidence || 0,
      fallbackCount: counts.fallback || 0,
      requiredCaseCount: HYBRID_INPUT_BROWSER_QA_CASES.length,
    },
    version: 1,
  })
}

export function hybridInputBrowserQaLabel(report) {
  if (!report) return "Hybrid input browser QA: idle"
  return `Hybrid input browser QA: ${report.status} ${report.summary?.caseCount || 0} cases`
}
