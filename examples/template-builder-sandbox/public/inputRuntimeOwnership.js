export const HYBRID_INPUT_RUNTIME_OWNERSHIP_SOURCE = "flowdoc-hybrid-input-runtime-ownership"
export const HYBRID_INPUT_RUNTIME_OWNERSHIP_MODE = "browser-local-input-runtime-ownership-boundary"

export const HYBRID_INPUT_TARGET_TYPES = Object.freeze([
  "none",
  "managed-card-selection",
  "active-text-block-island",
  "textarea-fallback",
  "rejected",
])

export const HYBRID_INPUT_REJECTION_REASONS = Object.freeze([
  "missing-active-node-id",
  "unsupported-target-type",
  "non-text-target-cannot-open-island",
  "textarea-fallback-requires-text-block",
  "active-text-block-island-already-open",
  "text-block-island-not-eligible",
  "full-document-contenteditable-blocked",
  "dom-html-package-truth-blocked",
])

const KNOWN_MANAGED_CARD_NODE_TYPES = new Set([
  "zone",
  "text-block",
  "columns",
  "column",
  "table",
  "table-row",
  "table-cell",
  "toc",
  "page-break",
  "divider",
  "spacer",
  "generated-content",
  "static-zone",
])

const MANAGED_CARD_COMMANDS = Object.freeze([
  "managed-card.select",
  "managed-card.focus",
  "structural-command.evaluate",
])

const ACTIVE_ISLAND_COMMANDS = Object.freeze([
  "active-text-block-island.open",
  "command-policy.evaluate",
  "commit-bridge.prepare",
  "textarea-fallback.offer",
  "cancel-input",
])

const TEXTAREA_FALLBACK_COMMANDS = Object.freeze([
  "textarea-fallback.use",
  "plain-text-command.evaluate",
  "commit-bridge.prepare",
  "cancel-input",
])

const ALWAYS_BLOCKED_COMMANDS = Object.freeze([
  "full-document-contenteditable",
  "raw-dom-html.commit",
  "storage.write",
  "pdf-docx.render",
  "legacy-editor-runtime.copy",
  "package-schema.change",
])

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function activeNodeFrom(input) {
  return input.activeNode || input.selectedNode || input.node || null
}

function nodeIdFor(node, input) {
  return stringOrNull(input.activeNodeId) || stringOrNull(node?.id)
}

function nodeTypeFor(node) {
  return stringOrNull(node?.type)
}

function requestedTargetFor(input) {
  return stringOrNull(input.requestedTargetType)
    || stringOrNull(input.requestedMode)
    || stringOrNull(input.mode)
    || (input.openTextBlockIsland ? "active-text-block-island" : null)
    || (input.fallbackRequested ? "textarea-fallback" : null)
    || "managed-card-selection"
}

function currentIslandIdFor(input) {
  return stringOrNull(input.currentActiveTextBlockId)
    || stringOrNull(input.activeTextBlockIslandId)
    || stringOrNull(input.openTextBlockIslandId)
}

function isTextBlock(node) {
  return nodeTypeFor(node) === "text-block"
}

function isKnownManagedCardNode(node) {
  return KNOWN_MANAGED_CARD_NODE_TYPES.has(nodeTypeFor(node))
}

function islandEligibilityIssue(node, input) {
  if (input.forceTextareaFallback || node?.forceTextareaFallback) return "text-block-island-not-eligible"
  if (node?.readOnly || node?.generated) return "text-block-island-not-eligible"
  if (node?.canUseHardenedTextBlockIsland === false) return "text-block-island-not-eligible"
  if (node?.canUseContenteditableIsland === false) return "text-block-island-not-eligible"
  return null
}

function fallbackReasonFor(node, input) {
  return stringOrNull(input.fallbackReason)
    || stringOrNull(node?.fallbackReason)
    || stringOrNull(node?.wysiwygDraftGuardReason)
    || (node?.hasAtomicInline ? "atomic-inline-needs-managed-fallback" : null)
    || (node?.hasStyledText ? "styled-runs-need-managed-fallback" : null)
    || (input.fallbackRequested ? "textarea-fallback-requested" : null)
    || "text-block-island-not-eligible"
}

function readiness(command, status, reason, owner) {
  return {
    command,
    owner,
    reason,
    status,
  }
}

export function createHybridInputCommandReadiness(targetType, input = {}) {
  const compositionActive = Boolean(input.compositionActive || input.isComposing)
  const baseBlockedReason = targetType === "rejected"
    ? "target-rejected"
    : targetType === "none"
      ? "no-active-target"
      : "owned-by-different-runtime"

  const readinessEntries = []

  if (targetType === "managed-card-selection") {
    readinessEntries.push(
      ...MANAGED_CARD_COMMANDS.map((command) => readiness(command, "ready", "managed-card-runtime-ready", "managed-card-runtime")),
      ...ACTIVE_ISLAND_COMMANDS.map((command) => readiness(command, "blocked", "no-active-text-block-island", "active-text-block-island-runtime")),
      ...TEXTAREA_FALLBACK_COMMANDS.map((command) => readiness(command, "blocked", "no-textarea-fallback-target", "fallback-textarea-path")),
    )
  } else if (targetType === "active-text-block-island") {
    readinessEntries.push(
      ...ACTIVE_ISLAND_COMMANDS.map((command) => {
        if (command === "commit-bridge.prepare" && compositionActive) {
          return readiness(command, "blocked", "composition-active", "commit-bridge")
        }
        return readiness(command, "ready", "active-text-block-island-ready", command === "commit-bridge.prepare" ? "commit-bridge" : "active-text-block-island-runtime")
      }),
      ...MANAGED_CARD_COMMANDS.map((command) => readiness(command, "blocked", "active-text-block-island-owns-input", "managed-card-runtime")),
    )
  } else if (targetType === "textarea-fallback") {
    readinessEntries.push(
      ...TEXTAREA_FALLBACK_COMMANDS.map((command) => {
        if (command === "commit-bridge.prepare" && compositionActive) {
          return readiness(command, "blocked", "composition-active", "commit-bridge")
        }
        return readiness(command, "ready", "textarea-fallback-ready", command === "commit-bridge.prepare" ? "commit-bridge" : "fallback-textarea-path")
      }),
      ...ACTIVE_ISLAND_COMMANDS.map((command) => readiness(command, "blocked", "textarea-fallback-active", "active-text-block-island-runtime")),
      ...MANAGED_CARD_COMMANDS.map((command) => readiness(command, "blocked", "textarea-fallback-active", "managed-card-runtime")),
    )
  } else {
    readinessEntries.push(
      ...MANAGED_CARD_COMMANDS.map((command) => readiness(command, "blocked", baseBlockedReason, "managed-card-runtime")),
      ...ACTIVE_ISLAND_COMMANDS.map((command) => readiness(command, "blocked", baseBlockedReason, "active-text-block-island-runtime")),
      ...TEXTAREA_FALLBACK_COMMANDS.map((command) => readiness(command, "blocked", baseBlockedReason, "fallback-textarea-path")),
    )
  }

  readinessEntries.push(
    ...ALWAYS_BLOCKED_COMMANDS.map((command) => readiness(command, "blocked", "explicit-non-work", "phase-boundary")),
  )

  return readinessEntries
}

function ownershipOwners() {
  return {
    activeTextBlockIslandRuntime: [
      "one active text-block island target",
      "browser-local composition readiness",
      "browser-local selection facts placeholder",
    ],
    appShellIntegration: [
      "focus coordination",
      "active target switching",
      "toolbar and inspector readiness display",
    ],
    commandPolicy: [
      "command readiness shape",
      "unsupported target rejection reasons",
      "composition commit guard",
    ],
    commitBridge: [
      "accepted commit facts only",
      "not-run in Phase 154",
      "vNext operation handoff remains future work",
    ],
    fallbackTextareaPath: [
      "plain-text fallback target",
      "fallback reason diagnostics",
      "safe rejection when fallback does not apply",
    ],
    managedCardRuntime: [
      "non-text structure selection",
      "managed card focus",
      "structural command readiness",
    ],
  }
}

function createOwnershipResult(targetType, input) {
  const commandReadiness = createHybridInputCommandReadiness(targetType, input)
  const allowedCommands = commandReadiness
    .filter((entry) => entry.status === "ready")
    .map((entry) => entry.command)
  const blockedCommands = commandReadiness
    .filter((entry) => entry.status === "blocked")
    .map((entry) => ({
      command: entry.command,
      reason: entry.reason,
    }))

  return {
    activeNodeId: input.activeNodeId,
    activeTextBlockId: input.activeTextBlockId,
    allowedCommands,
    blockedCommands,
    browserLocal: {
      owns: [
        "active input target",
        "selection and composition readiness facts",
        "fallback decision diagnostics",
      ],
      status: "owns-runtime-facts-only",
    },
    canonicalPackageTruth: {
      reason: "browser-local-ownership-does-not-mutate-package",
      status: "not-mutated",
    },
    commandReadiness,
    coreCommit: {
      reason: "Phase 154 classifies ownership only",
      status: "not-run",
    },
    fallbackReason: input.fallbackReason,
    mode: HYBRID_INPUT_RUNTIME_OWNERSHIP_MODE,
    owners: ownershipOwners(),
    productionReadiness: {
      reason: "no production input readiness claim",
      status: "not-claimed",
    },
    reason: input.reason,
    source: HYBRID_INPUT_RUNTIME_OWNERSHIP_SOURCE,
    targetType,
    version: 1,
  }
}

function rejectedResult(reason, node, input) {
  return createOwnershipResult("rejected", {
    ...input,
    activeNodeId: nodeIdFor(node, input),
    activeTextBlockId: null,
    fallbackReason: null,
    reason,
  })
}

export function createHybridInputRuntimeOwnership(input = {}) {
  const requestedTarget = requestedTargetFor(input)
  const node = activeNodeFrom(input)

  if (requestedTarget === "full-document-contenteditable" || input.fullDocumentContenteditable) {
    return rejectedResult("full-document-contenteditable-blocked", node, input)
  }

  if (input.domHtmlAsPackageTruth || input.commitDomHtml) {
    return rejectedResult("dom-html-package-truth-blocked", node, input)
  }

  if (!node) {
    return createOwnershipResult("none", {
      ...input,
      activeNodeId: null,
      activeTextBlockId: null,
      fallbackReason: null,
      reason: "no-active-target",
    })
  }

  const activeNodeId = nodeIdFor(node, input)
  if (!activeNodeId) return rejectedResult("missing-active-node-id", node, input)

  if (requestedTarget === "active-text-block-island") {
    if (!isTextBlock(node)) return rejectedResult("non-text-target-cannot-open-island", node, input)

    const currentIslandId = currentIslandIdFor(input)
    if (currentIslandId && currentIslandId !== activeNodeId) {
      return rejectedResult("active-text-block-island-already-open", node, input)
    }

    const issue = islandEligibilityIssue(node, input)
    if (issue) {
      if (input.allowTextareaFallback !== false) {
        return createOwnershipResult("textarea-fallback", {
          ...input,
          activeNodeId,
          activeTextBlockId: activeNodeId,
          fallbackReason: fallbackReasonFor(node, input),
          reason: "textarea-fallback-selected",
        })
      }
      return rejectedResult(issue, node, input)
    }

    return createOwnershipResult("active-text-block-island", {
      ...input,
      activeNodeId,
      activeTextBlockId: activeNodeId,
      fallbackReason: null,
      reason: "active-text-block-island-ready",
    })
  }

  if (requestedTarget === "textarea-fallback") {
    if (!isTextBlock(node)) return rejectedResult("textarea-fallback-requires-text-block", node, input)
    return createOwnershipResult("textarea-fallback", {
      ...input,
      activeNodeId,
      activeTextBlockId: activeNodeId,
      fallbackReason: fallbackReasonFor(node, input),
      reason: "textarea-fallback-selected",
    })
  }

  if (!isKnownManagedCardNode(node)) return rejectedResult("unsupported-target-type", node, input)

  return createOwnershipResult("managed-card-selection", {
    ...input,
    activeNodeId,
    activeTextBlockId: null,
    fallbackReason: null,
    reason: "managed-card-runtime-ready",
  })
}

export function hybridInputRuntimeOwnershipLabel(summary) {
  if (!summary || summary.targetType === "none") return "Input ownership: idle"
  if (summary.targetType === "rejected") return `Input ownership: rejected ${summary.reason}`
  if (summary.targetType === "active-text-block-island") return `Input ownership: island ${summary.activeTextBlockId}`
  if (summary.targetType === "textarea-fallback") return `Input ownership: textarea fallback ${summary.activeTextBlockId}`
  return `Input ownership: managed card ${summary.activeNodeId}`
}
