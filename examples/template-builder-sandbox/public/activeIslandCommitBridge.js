export const ACTIVE_ISLAND_COMMIT_BRIDGE_SOURCE = "flowdoc-active-island-commit-bridge-smoke"
export const ACTIVE_ISLAND_COMMIT_BRIDGE_MODE = "browser-local-active-island-commit-bridge-smoke"
export const ACTIVE_ISLAND_COMMIT_OPERATION_KIND = "text-block.rich-inline.replace"

function stringOrNull(value) {
  return typeof value === "string" && value.length > 0 ? value : null
}

function finiteIntegerOrNull(value) {
  return Number.isFinite(value) ? Math.trunc(value) : null
}

function idToken(value) {
  const token = String(value || "inline")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "")
  return token || "inline"
}

function rejected(reason, input = {}) {
  return {
    bridgeAction: "sandbox.commitRichInline",
    bridgeRequest: null,
    canBridgeCommit: false,
    coreTransaction: {
      reason,
      status: "not-run",
    },
    liveExact: {
      exactGenerationStale: false,
      status: "not-requested",
    },
    mode: ACTIVE_ISLAND_COMMIT_BRIDGE_MODE,
    packageMutation: {
      reason,
      status: "not-mutated",
    },
    reason,
    runtimeCache: {
      reason,
      status: "not-refreshed",
    },
    source: ACTIVE_ISLAND_COMMIT_BRIDGE_SOURCE,
    status: "rejected",
    targetTextBlockId: stringOrNull(input.targetTextBlockId) || null,
    version: 1,
  }
}

function commitReady(input) {
  const policy = input.commandPolicy || null
  if (!policy?.requested) return true
  return policy.requested.command === "commit" && policy.requested.status === "ready"
}

function bridgePlanId(textBlockId, revision) {
  return `${textBlockId}:active-island-bridge:${revision ?? "unknown"}`
}

export function createActiveIslandCommitBridgeSmoke(input = {}) {
  const binding = input.domBinding || input.binding || null
  if (!binding?.safe || binding.status !== "captured" || !binding.capture) {
    return rejected("unsafe-island-capture", input)
  }

  const island = input.activeIsland || input.island || null
  if (island?.composition?.active) return rejected("composition-active", input)
  if (island?.commit?.status !== "requested") return rejected("missing-island-commit-request", input)
  if (!commitReady(input)) return rejected("command-policy-not-ready", input)

  const capture = binding.capture
  const targetTextBlockId = stringOrNull(capture.textBlockId) || stringOrNull(island?.textBlockId)
  if (!targetTextBlockId) return rejected("missing-target-text-block-id", input)
  if (island?.textBlockId && island.textBlockId !== targetTextBlockId) return rejected("target-text-block-mismatch", input)
  if (typeof capture.textSnapshot !== "string") return rejected("missing-text-snapshot", input)

  const documentRevision = finiteIntegerOrNull(input.documentRevision)
  const baseRevision = finiteIntegerOrNull(input.baseRevision) ?? documentRevision
  const inlineId = `${targetTextBlockId}-active-island-${idToken(input.planSuffix || "text")}-1`
  const plan = {
    baseRevision,
    documentRevision,
    operationKind: ACTIVE_ISLAND_COMMIT_OPERATION_KIND,
    planId: bridgePlanId(targetTextBlockId, documentRevision),
    plannedInlineChildren: [
      {
        id: inlineId,
        text: capture.textSnapshot,
        type: "text",
      },
    ],
    sourceCapture: {
      activeNodeId: capture.activeNodeId,
      selection: capture.selection,
      textLength: capture.textLength,
    },
    status: "planned",
    targetTextBlockId,
  }

  return {
    bridgeAction: "sandbox.commitRichInline",
    bridgeRequest: {
      plan,
      responseOptions: {
        includeSnapshot: false,
      },
    },
    canBridgeCommit: true,
    coreTransaction: {
      operationKind: ACTIVE_ISLAND_COMMIT_OPERATION_KIND,
      status: "planned-through-existing-bridge",
    },
    liveExact: {
      exactGenerationStale: true,
      status: "stale-after-accepted-commit",
    },
    mode: ACTIVE_ISLAND_COMMIT_BRIDGE_MODE,
    packageMutation: {
      reason: "only the existing mutation bridge may apply the plan",
      status: "planned-through-existing-bridge",
    },
    reason: "active-island-commit-bridge-ready",
    runtimeCache: {
      responseMode: "packet",
      status: "refresh-after-accepted-packet",
    },
    source: ACTIVE_ISLAND_COMMIT_BRIDGE_SOURCE,
    status: "accepted",
    targetTextBlockId,
    version: 1,
  }
}

export function activeIslandCommitBridgeSmokeLabel(summary) {
  if (!summary || summary.status !== "accepted") return `Active island bridge: rejected ${summary?.reason || "missing"}`
  return `Active island bridge: ${summary.bridgeRequest.plan.operationKind} ${summary.targetTextBlockId}`
}
