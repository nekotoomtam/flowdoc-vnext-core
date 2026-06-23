import type {
  VNextTextMeasurementDraft,
  VNextTextMeasurementInput,
  VNextTextMeasurer,
} from "../pagination/textMeasurement.js"

export const VNEXT_RENDERER_TEXT_MEASUREMENT_SOURCE = "vnext-renderer-text-measurement"
export const VNEXT_RENDERER_TEXT_MEASUREMENT_MODE = "renderer-backed-text-measurement-boundary"

export type VNextRendererTextMeasurementEngine = "browser" | "pdf" | "docx" | "custom"
export type VNextRendererTextMeasurementAvailability = "ready" | "unavailable"
export type VNextRendererTextMeasurementProfilePlanStatus = "ready" | "blocked"
export type VNextRendererTextMeasurementIssueSeverity = "blocking" | "warning"

export type VNextRendererTextMeasurementIssueCode =
  | "missing-profile-id"
  | "profile-unavailable"
  | "non-point-units"
  | "line-boxes-not-supported"
  | "style-key-not-supported"
  | "available-width-not-supported"
  | "nondeterministic-profile"

export interface VNextRendererTextMeasurementCapabilities {
  lineBoxes: boolean
  styleKey: boolean
  availableWidth: boolean
}

export interface VNextRendererTextMeasurementProfile {
  profileId: string
  availability: VNextRendererTextMeasurementAvailability
  engine: VNextRendererTextMeasurementEngine
  revision?: string
  units: string
  deterministic: boolean
  capabilities: VNextRendererTextMeasurementCapabilities
}

export interface VNextRendererTextMeasurementIssue {
  severity: VNextRendererTextMeasurementIssueSeverity
  code: VNextRendererTextMeasurementIssueCode
  message: string
}

export interface VNextRendererTextMeasurementRequest
  extends Omit<VNextTextMeasurementInput, "measurementProfileId" | "styleKey"> {
  measurementProfileId: string
  styleKey: string
  cacheKey: string
  textHash: string
  rendererEngine: VNextRendererTextMeasurementEngine
  profileRevision: string | null
}

export interface VNextRendererTextMeasurementProvider {
  measure(input: VNextRendererTextMeasurementRequest): VNextTextMeasurementDraft
}

export interface VNextRendererTextMeasurementProfilePlan {
  source: typeof VNEXT_RENDERER_TEXT_MEASUREMENT_SOURCE
  mode: typeof VNEXT_RENDERER_TEXT_MEASUREMENT_MODE
  status: VNextRendererTextMeasurementProfilePlanStatus
  profile: {
    profileId: string
    availability: VNextRendererTextMeasurementAvailability
    engine: VNextRendererTextMeasurementEngine
    revision: string | null
    units: string
    deterministic: boolean
    capabilities: VNextRendererTextMeasurementCapabilities
  }
  rendererContract: {
    consumes: "vnext-text-measurement-input"
    produces: "vnext-text-measurement-draft"
    units: "pt"
    mayRelayoutDocument: false
    requiresAuthoredDocumentForLayout: false
    adapterMayAccessDom: false
    adapterOwnsRendererExecution: false
  }
  blockingIssues: VNextRendererTextMeasurementIssue[]
  warningIssues: VNextRendererTextMeasurementIssue[]
}

function issue(
  severity: VNextRendererTextMeasurementIssueSeverity,
  code: VNextRendererTextMeasurementIssueCode,
  message: string,
): VNextRendererTextMeasurementIssue {
  return { severity, code, message }
}

function cloneCapabilities(
  capabilities: VNextRendererTextMeasurementCapabilities,
): VNextRendererTextMeasurementCapabilities {
  return {
    lineBoxes: capabilities.lineBoxes,
    styleKey: capabilities.styleKey,
    availableWidth: capabilities.availableWidth,
  }
}

function copyDraft(draft: VNextTextMeasurementDraft): VNextTextMeasurementDraft {
  return {
    ...draft,
    lines: [...draft.lines],
    lineBoxes: draft.lineBoxes?.map((line) => ({ ...line })),
  }
}

export function createVNextRendererTextMeasurementProfilePlan(
  profile: VNextRendererTextMeasurementProfile,
): VNextRendererTextMeasurementProfilePlan {
  const profileId = profile.profileId.trim()
  const blockingIssues: VNextRendererTextMeasurementIssue[] = []
  const warningIssues: VNextRendererTextMeasurementIssue[] = []

  if (profileId.length === 0) {
    blockingIssues.push(issue(
      "blocking",
      "missing-profile-id",
      "Renderer-backed text measurement profiles must have a stable profile id for cache keys.",
    ))
  }

  if (profile.availability !== "ready") {
    blockingIssues.push(issue(
      "blocking",
      "profile-unavailable",
      "Renderer-backed text measurement profile is not ready to provide measurements.",
    ))
  }

  if (profile.units !== "pt") {
    blockingIssues.push(issue(
      "blocking",
      "non-point-units",
      "vNext text measurement currently accepts renderer-backed profile output only in points.",
    ))
  }

  if (!profile.capabilities.lineBoxes) {
    blockingIssues.push(issue(
      "blocking",
      "line-boxes-not-supported",
      "Renderer-backed text measurement must provide line boxes for pagination and split policies.",
    ))
  }

  if (!profile.capabilities.styleKey) {
    blockingIssues.push(issue(
      "blocking",
      "style-key-not-supported",
      "Renderer-backed text measurement must honor style keys used in cache identity.",
    ))
  }

  if (!profile.capabilities.availableWidth) {
    blockingIssues.push(issue(
      "blocking",
      "available-width-not-supported",
      "Renderer-backed text measurement must honor available width for line wrapping.",
    ))
  }

  if (!profile.deterministic) {
    warningIssues.push(issue(
      "warning",
      "nondeterministic-profile",
      "Renderer-backed text measurement profile is marked nondeterministic and may cause pagination drift.",
    ))
  }

  return {
    source: VNEXT_RENDERER_TEXT_MEASUREMENT_SOURCE,
    mode: VNEXT_RENDERER_TEXT_MEASUREMENT_MODE,
    status: blockingIssues.length === 0 ? "ready" : "blocked",
    profile: {
      profileId,
      availability: profile.availability,
      engine: profile.engine,
      revision: profile.revision ?? null,
      units: profile.units,
      deterministic: profile.deterministic,
      capabilities: cloneCapabilities(profile.capabilities),
    },
    rendererContract: {
      consumes: "vnext-text-measurement-input",
      produces: "vnext-text-measurement-draft",
      units: "pt",
      mayRelayoutDocument: false,
      requiresAuthoredDocumentForLayout: false,
      adapterMayAccessDom: false,
      adapterOwnsRendererExecution: false,
    },
    blockingIssues,
    warningIssues,
  }
}

export function createVNextRendererBackedTextMeasurer(
  profile: VNextRendererTextMeasurementProfile,
  provider: VNextRendererTextMeasurementProvider,
): VNextTextMeasurer {
  const plan = createVNextRendererTextMeasurementProfilePlan(profile)
  if (plan.status === "blocked") {
    const codes = plan.blockingIssues.map((item) => item.code).join(", ")
    throw new Error(`Renderer-backed text measurement profile "${plan.profile.profileId || "(missing)"}" is blocked: ${codes}`)
  }

  return {
    measure(input) {
      if (input.measurementProfileId !== plan.profile.profileId) {
        throw new Error(
          `Renderer-backed text measurement input profile "${input.measurementProfileId ?? "(missing)"}" must match "${plan.profile.profileId}".`,
        )
      }

      return copyDraft(provider.measure({
        documentId: input.documentId,
        sectionId: input.sectionId,
        nodeId: input.nodeId,
        text: input.text,
        availableWidthPt: input.availableWidthPt,
        styleKey: input.styleKey ?? "default",
        measurementProfileId: plan.profile.profileId,
        cacheKey: input.cacheKey,
        textHash: input.textHash,
        rendererEngine: plan.profile.engine,
        profileRevision: plan.profile.revision,
      }))
    },
  }
}
