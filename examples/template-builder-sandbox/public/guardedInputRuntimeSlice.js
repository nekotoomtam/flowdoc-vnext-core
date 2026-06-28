import {
  createHybridInputRuntimeOwnership,
} from "./inputRuntimeOwnership.js"
import {
  activateActiveTextBlockIsland,
  beginActiveTextBlockIslandComposition,
  createInactiveActiveTextBlockIslandState,
  openActiveTextBlockIsland,
  requestActiveTextBlockIslandCommit,
  updateActiveTextBlockIslandDraft,
  updateActiveTextBlockIslandSelection,
} from "./activeTextBlockIsland.js"
import {
  createHybridInputCommandPolicy,
} from "./hybridInputCommandPolicy.js"
import {
  createActiveTextBlockDomBindingSmoke,
} from "./activeTextBlockDomBinding.js"
import {
  createActiveIslandCommitBridgeSmoke,
} from "./activeIslandCommitBridge.js"

export const GUARDED_INPUT_RUNTIME_SLICE_SOURCE = "flowdoc-guarded-input-runtime-slice-1"
export const GUARDED_INPUT_RUNTIME_SLICE_MODE = "sandbox-local-guarded-input-runtime-slice-1"

export const GUARDED_INPUT_RUNTIME_STATUSES = Object.freeze([
  "accepted",
  "fallback",
  "blocked",
])

const HARD_LIMITS = Object.freeze([
  "no-production-contenteditable-readiness",
  "no-full-document-contenteditable",
  "no-legacy-editor-runtime-copy",
  "no-package-schema-change",
  "no-storage-backend-route",
  "no-pdf-docx-renderer-work",
  "no-collaboration-offline-claim",
])

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function textFromInput(input, node) {
  if (typeof input.text === "string") return input.text
  if (typeof input.baseText === "string") return input.baseText
  if (typeof node?.plainText === "string") return node.plainText
  if (typeof node?.textPreview === "string") return node.textPreview
  return ""
}

function draftTextFromInput(input, baseText) {
  if (typeof input.draftText === "string") return input.draftText
  if (typeof input.nextText === "string") return input.nextText
  if (typeof input.typedText === "string") return `${baseText}${input.typedText}`
  return baseText
}

function textBlockIdFrom(input, node, ownership) {
  return stringOrNull(input.textBlockId)
    || stringOrNull(ownership?.activeTextBlockId)
    || stringOrNull(node?.id)
}

function selectionFor(input, text) {
  const selection = input.selection || {}
  const end = Number.isInteger(selection.end) ? selection.end : text.length
  const start = Number.isInteger(selection.start) ? selection.start : end
  return {
    direction: stringOrNull(selection.direction) || "none",
    end,
    source: stringOrNull(selection.source) || "runtime-slice",
    start,
  }
}

function surfaceFor(input, textBlockId, draftText, selection) {
  if (input.surface) return input.surface
  return {
    contentEditable: "true",
    dataset: {
      activeNodeId: textBlockId,
      textBlockId,
    },
    selection,
    textContent: draftText,
  }
}

function baseReport(input, ownership) {
  return {
    hardLimits: HARD_LIMITS,
    mode: GUARDED_INPUT_RUNTIME_SLICE_MODE,
    productionReadiness: {
      reason: "Phase 169 is sandbox-local and does not claim production readiness",
      status: "not-claimed",
    },
    source: GUARDED_INPUT_RUNTIME_SLICE_SOURCE,
    version: 1,
    ...input,
    ownership,
  }
}

function summarizePolicy(policy) {
  return {
    blocked: policy.blockedCommands.length,
    fallback: policy.fallbackCommands.length,
    ready: policy.readyCommands.length,
    requested: policy.requested,
  }
}

function blockedReport(reason, input) {
  return {
    ...baseReport(input, input.ownership),
    activeIsland: input.activeIsland || null,
    commandPolicy: input.commandPolicy || null,
    commitBridge: null,
    domBinding: null,
    packageMutation: {
      reason,
      status: "not-mutated",
    },
    packetRefresh: {
      reason,
      status: "not-requested",
    },
    reason,
    status: "blocked",
    summary: {
      canBridgeCommit: false,
      targetType: input.ownership?.targetType || "none",
    },
  }
}

export function createGuardedInputRuntimeSlice(input = {}) {
  const node = input.selectedNode || input.activeNode || input.node || null
  const ownership = createHybridInputRuntimeOwnership({
    ...input,
    requestedTargetType: stringOrNull(input.requestedTargetType) || "active-text-block-island",
    selectedNode: node,
  })

  if (ownership.targetType === "textarea-fallback") {
    const commandPolicy = createHybridInputCommandPolicy({
      commandKind: stringOrNull(input.commandKind) || "commit",
      ownership,
    })
    return {
      ...baseReport(input, ownership),
      activeIsland: null,
      commandPolicy,
      commitBridge: null,
      domBinding: null,
      fallback: {
        reason: ownership.fallbackReason || "textarea-fallback-selected",
        status: "ready",
      },
      packageMutation: {
        reason: "textarea fallback remains browser-local until explicit commit bridge support",
        status: "not-mutated",
      },
      packetRefresh: {
        reason: "fallback did not produce an accepted bridge request",
        status: "not-requested",
      },
      reason: "textarea-fallback-selected",
      status: "fallback",
      summary: {
        policy: summarizePolicy(commandPolicy),
        targetType: ownership.targetType,
      },
    }
  }

  if (ownership.targetType !== "active-text-block-island") {
    return blockedReport(ownership.reason || "active-island-not-available", {
      ...input,
      ownership,
    })
  }

  const baseText = textFromInput(input, node)
  const textBlockId = textBlockIdFrom(input, node, ownership)
  const openingSelection = selectionFor(input, baseText)
  let island = openActiveTextBlockIsland(createInactiveActiveTextBlockIslandState(), {
    ownership,
    richSegmentsSummary: input.richSegmentsSummary,
    selection: openingSelection,
    text: baseText,
    textBlockId,
  })
  island = activateActiveTextBlockIsland(island)

  if (input.selection) {
    island = updateActiveTextBlockIslandSelection(island, {
      ...input.selection,
      textBlockId,
    })
  }

  if (input.compositionActive || input.isComposing) {
    island = beginActiveTextBlockIslandComposition(island, {
      data: stringOrNull(input.compositionData) || "",
      source: "runtime-slice-compositionstart",
    })
  }

  const draftText = draftTextFromInput(input, baseText)
  if (draftText !== baseText || input.compositionActive || input.isComposing) {
    island = updateActiveTextBlockIslandDraft(island, {
      selection: selectionFor(input, draftText),
      text: draftText,
      textBlockId,
    })
  }

  const commitIsland = requestActiveTextBlockIslandCommit(island)
  const commandPolicy = createHybridInputCommandPolicy({
    activeIsland: commitIsland,
    commandKind: "commit",
    ownership,
    selection: commitIsland.selection,
  })

  if (commitIsland.commit?.status !== "requested" || commandPolicy.requested?.status !== "ready") {
    return blockedReport(commitIsland.commit?.reason || commandPolicy.requested?.reason || "commit-not-ready", {
      ...input,
      activeIsland: commitIsland,
      commandPolicy,
      ownership,
    })
  }

  const captureSelection = selectionFor({ selection: commitIsland.selection }, commitIsland.draftText)
  const domBinding = createActiveTextBlockDomBindingSmoke(commitIsland, {
    selection: captureSelection,
    surface: surfaceFor(input, textBlockId, commitIsland.draftText, captureSelection),
  })
  const commitBridge = createActiveIslandCommitBridgeSmoke({
    activeIsland: commitIsland,
    commandPolicy,
    documentRevision: input.documentRevision,
    domBinding,
  })

  if (commitBridge.status !== "accepted") {
    return blockedReport(commitBridge.reason, {
      ...input,
      activeIsland: commitIsland,
      commandPolicy,
      commitBridge,
      domBinding,
      ownership,
    })
  }

  return {
    ...baseReport(input, ownership),
    activeIsland: commitIsland,
    commandPolicy,
    commitBridge,
    domBinding,
    packageMutation: {
      reason: "runtime slice produces a bridge request only",
      status: "planned-through-existing-bridge",
    },
    packetRefresh: {
      responseMode: "packet",
      status: "required-after-accepted-commit",
    },
    reason: "guarded-runtime-slice-accepted",
    status: "accepted",
    summary: {
      canBridgeCommit: commitBridge.canBridgeCommit,
      policy: summarizePolicy(commandPolicy),
      targetTextBlockId: commitBridge.targetTextBlockId,
      targetType: ownership.targetType,
    },
  }
}

export function guardedInputRuntimeSliceLabel(report) {
  if (!report) return "Guarded input runtime slice: missing"
  if (report.status === "accepted") return `Guarded input runtime slice: accepted ${report.summary.targetTextBlockId}`
  if (report.status === "fallback") return `Guarded input runtime slice: fallback ${report.ownership.activeTextBlockId}`
  return `Guarded input runtime slice: blocked ${report.reason}`
}
