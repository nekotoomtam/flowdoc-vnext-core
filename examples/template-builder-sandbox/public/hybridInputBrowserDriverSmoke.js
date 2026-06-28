import {
  HYBRID_INPUT_BROWSER_QA_CASES,
  createHybridInputBrowserQaReport,
} from "./hybridInputBrowserQa.js"

export const HYBRID_INPUT_BROWSER_DRIVER_SMOKE_SOURCE = "flowdoc-hybrid-input-browser-driver-smoke"
export const HYBRID_INPUT_BROWSER_DRIVER_SMOKE_MODE = "sandbox-local-optional-browser-driver-smoke-boundary"

export const HYBRID_INPUT_BROWSER_DRIVER_SMOKE_CASES = Object.freeze([
  "focus-active-text-block-island",
  "selection-caret-movement",
  "plain-typing",
  "ime-composition-evidence",
  "plain-paste",
  "blocked-unsafe-paste",
  "delete-backspace-near-field-chip",
  "active-island-commit",
])

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function integerOrNull(value) {
  return Number.isInteger(value) ? value : null
}

function safeClone(value) {
  return JSON.parse(JSON.stringify(value))
}

function driverName(input) {
  return stringOrNull(input.driverName)
    || stringOrNull(input.driver?.name)
    || stringOrNull(input.environment?.browserDriver)
    || "not-bound"
}

function factsOf(input) {
  return input.observations || input.driverFacts || input.facts || null
}

function factFor(facts, caseId) {
  if (!facts) return null
  if (Array.isArray(facts)) return facts.find((entry) => entry?.caseId === caseId) || null
  return facts[caseId] || null
}

function caseResult(caseId, status, reason, evidence = {}, assertions = []) {
  return safeClone({
    assertions,
    caseId,
    evidence,
    packageMutation: {
      reason: "optional browser driver smoke does not mutate package data",
      status: "not-mutated",
    },
    reason,
    status,
  })
}

function blockedCase(caseId, reason) {
  return caseResult(caseId, "blocked", reason, {}, [
    "optional driver evidence is allowed to be absent from core check",
  ])
}

function selectionValid(selection) {
  return Number.isInteger(selection?.start)
    && Number.isInteger(selection?.end)
    && selection.start >= 0
    && selection.end >= selection.start
}

function focusCase(facts) {
  const fact = factFor(facts, "focus-active-text-block-island")
  if (!fact) return blockedCase("focus-active-text-block-island", "driver-focus-evidence-missing")
  const focused = fact.focused === true
  const textBlockId = stringOrNull(fact.textBlockId)
  const activeElementKind = stringOrNull(fact.activeElementKind) || stringOrNull(fact.role)
  if (!focused || !textBlockId) return blockedCase("focus-active-text-block-island", "active-island-focus-not-proved")
  return caseResult("focus-active-text-block-island", "evidence", "active-island-focused", {
    activeElementKind,
    focused,
    textBlockId,
  }, [
    "driver focus stayed inside one active text-block island",
  ])
}

function selectionCaretCase(facts) {
  const fact = factFor(facts, "selection-caret-movement")
  if (!fact) return blockedCase("selection-caret-movement", "driver-selection-evidence-missing")
  const selection = fact.selection || {}
  const caret = fact.caret || {}
  if (!selectionValid(selection) || !selectionValid(caret) || caret.start !== caret.end) {
    return blockedCase("selection-caret-movement", "selection-caret-offsets-not-proved")
  }
  return caseResult("selection-caret-movement", "evidence", "selection-caret-movement-captured", {
    caret: {
      collapsed: true,
      end: caret.end,
      start: caret.start,
      unit: "utf16-code-unit-offset",
    },
    selection: {
      end: selection.end,
      start: selection.start,
      unit: "utf16-code-unit-offset",
    },
    textBlockId: stringOrNull(fact.textBlockId) || null,
  }, [
    "driver selection and caret facts are reduced to UTF-16 offsets",
  ])
}

function typingCase(facts) {
  const fact = factFor(facts, "plain-typing")
  if (!fact) return blockedCase("plain-typing", "driver-typing-evidence-missing")
  const typedText = stringOrNull(fact.typedText)
  const draftText = typeof fact.draftText === "string" ? fact.draftText : ""
  if (!typedText || !draftText.includes(typedText)) return blockedCase("plain-typing", "plain-typing-not-proved")
  return caseResult("plain-typing", "evidence", "plain-typing-captured", {
    draftText,
    packageTruth: "not-mutated",
    selection: fact.selection || null,
    typedText,
  }, [
    "plain typing remains draft evidence before package mutation",
  ])
}

function imeCase(facts) {
  const fact = factFor(facts, "ime-composition-evidence")
  if (!fact) return blockedCase("ime-composition-evidence", "ime-driver-evidence-missing")
  if (fact.available === false) {
    return caseResult("ime-composition-evidence", "blocked", "ime-driver-evidence-unavailable", {
      available: false,
      reason: stringOrNull(fact.reason) || "driver-did-not-provide-ime-events",
    }, [
      "IME evidence is optional when the browser driver cannot synthesize it",
    ])
  }
  const startCount = Math.max(0, integerOrNull(fact.compositionStartCount) ?? 0)
  const endCount = Math.max(0, integerOrNull(fact.compositionEndCount) ?? 0)
  if (startCount < 1 || endCount < 1) return blockedCase("ime-composition-evidence", "ime-lifecycle-not-proved")
  return caseResult("ime-composition-evidence", "evidence", "ime-composition-captured", {
    compositionEndCount: endCount,
    compositionStartCount: startCount,
    data: stringOrNull(fact.data) || "",
  }, [
    "driver captured composition lifecycle facts",
  ])
}

function plainPasteCase(facts) {
  const fact = factFor(facts, "plain-paste")
  if (!fact) return blockedCase("plain-paste", "driver-paste-evidence-missing")
  const plainText = stringOrNull(fact.plainText) || stringOrNull(fact.normalizedText)
  if (!plainText) return blockedCase("plain-paste", "plain-paste-not-proved")
  return caseResult("plain-paste", "evidence", "plain-paste-captured", {
    normalizedText: plainText.replaceAll("\r\n", "\n").replaceAll("\r", "\n"),
    pasteSource: stringOrNull(fact.pasteSource) || "driver-clipboard",
  }, [
    "plain paste is represented as normalized text evidence",
  ])
}

function unsafePasteCase(facts) {
  const fact = factFor(facts, "blocked-unsafe-paste")
  if (!fact) return blockedCase("blocked-unsafe-paste", "unsafe-paste-evidence-missing")
  const blocked = fact.blocked === true || fact.unsafeDomPackageTruth === "blocked" || fact.status === "blocked"
  if (!blocked) return blockedCase("blocked-unsafe-paste", "unsafe-paste-not-blocked")
  return caseResult("blocked-unsafe-paste", "blocked", "unsafe-paste-blocked", {
    reason: stringOrNull(fact.reason) || "unsupported-html-paste",
    unsafeDomPackageTruth: "blocked",
  }, [
    "unsafe DOM paste did not become package truth",
  ])
}

function fieldChipDeleteCase(facts) {
  const fact = factFor(facts, "delete-backspace-near-field-chip")
  if (!fact) return blockedCase("delete-backspace-near-field-chip", "field-chip-delete-evidence-missing")
  const command = fact.fieldChipCommand || {}
  const chipId = stringOrNull(command.chipId) || stringOrNull(fact.chipId)
  if (command.command !== "field-chip.delete" || !chipId) {
    return blockedCase("delete-backspace-near-field-chip", "field-chip-delete-guard-not-proved")
  }
  return caseResult("delete-backspace-near-field-chip", "evidence", "field-chip-delete-guard-captured", {
    fieldChipCommand: {
      chipId,
      command: "field-chip.delete",
    },
  }, [
    "field-chip atomics remain guarded near delete/backspace",
  ])
}

function commitCase(facts) {
  const fact = factFor(facts, "active-island-commit")
  if (!fact) return blockedCase("active-island-commit", "active-island-commit-evidence-missing")
  const operationKind = stringOrNull(fact.operationKind)
  const bridgeStatus = stringOrNull(fact.bridgeStatus) || stringOrNull(fact.status)
  if (operationKind !== "text-block.rich-inline.replace" || bridgeStatus !== "accepted") {
    return blockedCase("active-island-commit", "active-island-commit-not-proved")
  }
  return caseResult("active-island-commit", "evidence", "active-island-commit-captured", {
    bridgeStatus,
    operationKind,
    targetTextBlockId: stringOrNull(fact.targetTextBlockId) || null,
  }, [
    "driver commit evidence still routes through the accepted bridge shape",
  ])
}

function buildCases(input) {
  if (!input.driverAvailable && !factsOf(input)) {
    return HYBRID_INPUT_BROWSER_DRIVER_SMOKE_CASES.map((caseId) => (
      blockedCase(caseId, "optional-browser-driver-not-provided")
    ))
  }
  const facts = factsOf(input)
  return [
    focusCase(facts),
    selectionCaretCase(facts),
    typingCase(facts),
    imeCase(facts),
    plainPasteCase(facts),
    unsafePasteCase(facts),
    fieldChipDeleteCase(facts),
    commitCase(facts),
  ]
}

function statusFor(cases, input) {
  if (!input.driverAvailable && !factsOf(input)) return "blocked"
  return cases.every((entry) => ["blocked", "evidence"].includes(entry.status)) ? "passed" : "warning"
}

export function createHybridInputBrowserDriverSmokeReport(input = {}) {
  const baseline = input.phase163Report || createHybridInputBrowserQaReport({
    browserDriver: "phase-163-baseline",
  })
  const cases = buildCases(input)
  const counts = cases.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] || 0) + 1
    return acc
  }, {})

  return safeClone({
    baseline: {
      phase163CaseCount: baseline.summary.caseCount,
      phase163Mode: baseline.mode,
      phase163Source: baseline.source,
    },
    cases,
    driverPlan: {
      optional: true,
      sandboxOnly: true,
      steps: HYBRID_INPUT_BROWSER_DRIVER_SMOKE_CASES,
    },
    environment: {
      browserDriver: driverName(input),
      browserDriverRequiredInCoreCheck: false,
      driverAvailable: Boolean(input.driverAvailable || factsOf(input)),
      runner: stringOrNull(input.runner) || "optional-sandbox-browser-driver-smoke",
    },
    hardLimits: {
      collaborationOffline: "not-implemented",
      fullDocumentContenteditable: "blocked",
      legacyEditorRuntimeCopy: "blocked",
      packageDocumentSchemaChange: "blocked",
      pdfDocxRendererWork: "blocked",
      productionBrowserReadiness: "not-claimed",
      productionContenteditableReadiness: "not-claimed",
      storageBackendRoute: "blocked",
    },
    mode: HYBRID_INPUT_BROWSER_DRIVER_SMOKE_MODE,
    packageTruth: {
      reason: "optional browser driver smoke is evidence only",
      status: "not-mutated",
    },
    reportShape: {
      caseFields: ["caseId", "status", "reason", "evidence", "assertions", "packageMutation"],
      jsonSafe: true,
    },
    source: HYBRID_INPUT_BROWSER_DRIVER_SMOKE_SOURCE,
    status: statusFor(cases, input),
    summary: {
      blockedCount: counts.blocked || 0,
      caseCount: cases.length,
      evidenceCount: counts.evidence || 0,
      requiredCaseCount: HYBRID_INPUT_BROWSER_DRIVER_SMOKE_CASES.length,
    },
    version: 1,
  })
}

export function hybridInputBrowserDriverSmokeLabel(report) {
  if (!report) return "Hybrid input browser driver smoke: idle"
  return `Hybrid input browser driver smoke: ${report.status} ${report.summary?.caseCount || 0} cases`
}
