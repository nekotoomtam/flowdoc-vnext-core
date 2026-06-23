import type {
  VNextRendererTextMeasurementProfilePlan,
  VNextRendererTextMeasurementProfile,
  VNextRendererTextMeasurementProvider,
  VNextRendererTextMeasurementRequest,
  VNextTextEngineEvidenceAcceptanceInput,
  VNextTextEngineEvidenceAcceptancePlan,
  VNextTextEngineAdapterEvidence,
  VNextTextEngineAdapterRequest,
  VNextTextEngineMeasurementDraftHandoffInput,
  VNextTextEngineMeasurementDraftHandoffPlan,
  VNextThaiLineBreakEvidenceEntry,
} from "@flowdoc/vnext-core"
import { createFlowDocTextEngineLineWrapEvidencePlan } from "./lineWrapEvidence.js"

export const FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_SOURCE = "flowdoc-text-engine-renderer-backed-provider"
export const FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_MODE = "accepted-evidence-renderer-backed-provider-boundary"

export type FlowDocTextEngineRendererBackedProviderStatus = "ready" | "blocked"
export type FlowDocTextEngineRendererBackedProviderIssueSeverity = "blocking" | "warning"
export type FlowDocTextEngineRendererBackedDriftStatus = "accepted" | "rejected"

export type FlowDocTextEngineRendererBackedProviderIssueCode =
  | "production-binding"
  | "missing-provider-id"
  | "missing-policy-revision"
  | "renderer-profile-blocked"
  | "missing-evidence-source"
  | "duplicate-evidence-source"
  | "request-profile-mismatch"
  | "request-output-shape-unsupported"
  | "glyph-evidence-profile-mismatch"
  | "break-sample-mismatch"

export type FlowDocTextEngineRendererBackedDraft = ReturnType<VNextRendererTextMeasurementProvider["measure"]>

export interface FlowDocTextEngineRendererBackedEvidenceSource {
  request: VNextTextEngineAdapterRequest
  glyphEvidence: VNextTextEngineAdapterEvidence
  breakEvidence: VNextThaiLineBreakEvidenceEntry
}

export interface FlowDocTextEngineRendererBackedCoreBoundary {
  createRendererTextMeasurementProfilePlan(profile: VNextRendererTextMeasurementProfile): VNextRendererTextMeasurementProfilePlan
  createTextEngineEvidenceAcceptancePlan(input: VNextTextEngineEvidenceAcceptanceInput): VNextTextEngineEvidenceAcceptancePlan
  createTextEngineMeasurementDraftHandoffPlan(input: VNextTextEngineMeasurementDraftHandoffInput): VNextTextEngineMeasurementDraftHandoffPlan
}

export interface FlowDocTextEngineRendererBackedProviderInput {
  providerId: string
  policyRevision: string
  rendererProfile: VNextRendererTextMeasurementProfile
  evidenceSources: readonly FlowDocTextEngineRendererBackedEvidenceSource[]
  core: FlowDocTextEngineRendererBackedCoreBoundary
  bindProductionMeasurement?: boolean
}

export interface FlowDocTextEngineRendererBackedProviderIssue {
  severity: FlowDocTextEngineRendererBackedProviderIssueSeverity
  code: FlowDocTextEngineRendererBackedProviderIssueCode
  message: string
  targetId?: string
}

export interface FlowDocTextEngineRendererBackedProviderPlan {
  source: typeof FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_SOURCE
  mode: typeof FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_MODE
  status: FlowDocTextEngineRendererBackedProviderStatus
  providerId: string
  policyRevision: string
  measurementProfileId: string
  evidenceSourceCount: number
  providerContract: {
    consumes: "vnext-renderer-text-measurement-request"
    evidenceFlow: "wrap-accept-handoff"
    wrapsWithCoreRendererBackedMeasurer: true
    defaultPaginationMeasurementUnchanged: true
    productionMeasurementReady: false
  }
  executionContract: {
    usesInjectedCorePublicBoundary: true
    importsRendererLibraries: false
    importsWasm: false
    executesRenderer: false
    executesIcu4x: false
    mutatesPaginationCache: false
    writesArtifacts: false
  }
  blockingIssues: FlowDocTextEngineRendererBackedProviderIssue[]
  warningIssues: FlowDocTextEngineRendererBackedProviderIssue[]
  nextSteps: string[]
}

export interface FlowDocTextEngineRendererBackedProviderBridge {
  plan: FlowDocTextEngineRendererBackedProviderPlan
  provider: VNextRendererTextMeasurementProvider
}

export interface FlowDocTextEngineMeasurementDraftSummary {
  lineCount: number
  widthPt: number
  heightPt: number
}

export interface FlowDocTextEngineRendererBackedDriftMeasurementInput {
  text: string
  measurementProfileId?: string
}

export interface FlowDocTextEngineRendererBackedDriftReport {
  source: typeof FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_SOURCE
  mode: "renderer-backed-measurement-drift-report"
  status: FlowDocTextEngineRendererBackedDriftStatus
  measurementProfileId: string
  textHash: string
  approximateDraft: FlowDocTextEngineMeasurementDraftSummary
  rendererBackedDraft: FlowDocTextEngineMeasurementDraftSummary
  drift: {
    widthPt: number
    heightPt: number
    lineCount: number
  }
  tolerance: {
    widthPt: number
    heightPt: number
    lineCount: number
  }
}

function issue(
  severity: FlowDocTextEngineRendererBackedProviderIssueSeverity,
  code: FlowDocTextEngineRendererBackedProviderIssueCode,
  message: string,
  targetId?: string,
): FlowDocTextEngineRendererBackedProviderIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function hashText(text: string): string {
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function evidenceSourceKey(source: FlowDocTextEngineRendererBackedEvidenceSource): string {
  return [
    source.request.measurementProfileId,
    source.request.styleKey,
    source.request.text,
  ].join("\u0000")
}

function requestKey(input: VNextRendererTextMeasurementRequest): string {
  return [
    input.measurementProfileId,
    input.styleKey,
    input.text,
  ].join("\u0000")
}

function summarizeDraft(draft: FlowDocTextEngineRendererBackedDraft): FlowDocTextEngineMeasurementDraftSummary {
  return {
    lineCount: draft.lineBoxes?.length ?? draft.lines.length,
    widthPt: draft.widthPt,
    heightPt: draft.heightPt,
  }
}

function validateEvidenceSources(
  input: FlowDocTextEngineRendererBackedProviderInput,
  blockingIssues: FlowDocTextEngineRendererBackedProviderIssue[],
): Map<string, FlowDocTextEngineRendererBackedEvidenceSource> {
  const byKey = new Map<string, FlowDocTextEngineRendererBackedEvidenceSource>()
  const duplicateKeys = new Set<string>()

  if (input.evidenceSources.length === 0) {
    blockingIssues.push(issue("blocking", "missing-evidence-source", "Renderer-backed provider requires accepted evidence sources."))
  }

  input.evidenceSources.forEach((source) => {
    const key = evidenceSourceKey(source)
    if (byKey.has(key)) duplicateKeys.add(key)
    byKey.set(key, source)

    if (source.request.measurementProfileId !== input.rendererProfile.profileId) {
      blockingIssues.push(issue("blocking", "request-profile-mismatch", "Evidence source request profile must match the renderer-backed profile.", source.request.requestId))
    }

    if (source.request.outputShapeVersion !== "glyph-line-box-v1") {
      blockingIssues.push(issue("blocking", "request-output-shape-unsupported", "Renderer-backed provider accepts glyph-line-box-v1 evidence only.", source.request.requestId))
    }

    if (source.glyphEvidence.measurementProfileId !== source.request.measurementProfileId) {
      blockingIssues.push(issue("blocking", "glyph-evidence-profile-mismatch", "Glyph evidence profile must match its adapter request.", source.glyphEvidence.requestId))
    }

    if (source.breakEvidence.sampleId !== source.request.sampleId) {
      blockingIssues.push(issue("blocking", "break-sample-mismatch", "Break evidence sample must match the adapter request sample.", source.breakEvidence.evidenceId))
    }
  })

  duplicateKeys.forEach((key) => {
    blockingIssues.push(issue("blocking", "duplicate-evidence-source", "Renderer-backed provider evidence sources must be unique by profile/style/text.", key))
  })

  return byKey
}

function createPlan(
  input: FlowDocTextEngineRendererBackedProviderInput,
): {
  plan: FlowDocTextEngineRendererBackedProviderPlan
  sourcesByKey: Map<string, FlowDocTextEngineRendererBackedEvidenceSource>
} {
  const profilePlan = input.core.createRendererTextMeasurementProfilePlan(input.rendererProfile)
  const blockingIssues: FlowDocTextEngineRendererBackedProviderIssue[] = []
  const warningIssues: FlowDocTextEngineRendererBackedProviderIssue[] = []

  if (input.bindProductionMeasurement === true) {
    blockingIssues.push(issue("blocking", "production-binding", "Renderer-backed provider bridge cannot bind production measurement."))
  }

  if (input.providerId.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-provider-id", "Renderer-backed provider bridges require stable provider ids."))
  }

  if (input.policyRevision.trim().length === 0) {
    blockingIssues.push(issue("blocking", "missing-policy-revision", "Renderer-backed provider bridges require policy revisions."))
  }

  if (profilePlan.status === "blocked") {
    profilePlan.blockingIssues.forEach((profileIssue) => {
      blockingIssues.push(issue("blocking", "renderer-profile-blocked", profileIssue.message, profileIssue.code))
    })
  }

  profilePlan.warningIssues.forEach((profileIssue) => {
    warningIssues.push(issue("warning", "renderer-profile-blocked", profileIssue.message, profileIssue.code))
  })

  const sourcesByKey = validateEvidenceSources(input, blockingIssues)

  return {
    sourcesByKey,
    plan: {
      source: FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_SOURCE,
      mode: FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_MODE,
      status: blockingIssues.length === 0 ? "ready" : "blocked",
      providerId: input.providerId,
      policyRevision: input.policyRevision,
      measurementProfileId: profilePlan.profile.profileId,
      evidenceSourceCount: input.evidenceSources.length,
      providerContract: {
        consumes: "vnext-renderer-text-measurement-request",
        evidenceFlow: "wrap-accept-handoff",
        wrapsWithCoreRendererBackedMeasurer: true,
        defaultPaginationMeasurementUnchanged: true,
        productionMeasurementReady: false,
      },
      executionContract: {
        usesInjectedCorePublicBoundary: true,
        importsRendererLibraries: false,
        importsWasm: false,
        executesRenderer: false,
        executesIcu4x: false,
        mutatesPaginationCache: false,
        writesArtifacts: false,
      },
      blockingIssues,
      warningIssues,
      nextSteps: [
        "Wrap this provider with createVNextRendererBackedTextMeasurer(...) at the call site.",
        "Compare renderer-backed drafts against the approximate measurer through drift reports.",
        "Keep default pagination measurement unchanged until profile, parity, and drift gates pass.",
      ],
    },
  }
}

function measureFromSource(
  source: FlowDocTextEngineRendererBackedEvidenceSource,
  input: VNextRendererTextMeasurementRequest,
  core: FlowDocTextEngineRendererBackedCoreBoundary,
): FlowDocTextEngineRendererBackedDraft {
  const request: VNextTextEngineAdapterRequest = {
    ...source.request,
    availableWidthPt: input.availableWidthPt,
    measurementProfileId: input.measurementProfileId,
  }
  const wrap = createFlowDocTextEngineLineWrapEvidencePlan({
    request,
    glyphEvidence: source.glyphEvidence,
    breakEvidence: source.breakEvidence,
    availableWidthPt: input.availableWidthPt,
  })

  if (wrap.status === "blocked" || wrap.evidence == null) {
    const codes = wrap.blockingIssues.map((item) => item.code).join(", ")
    throw new Error(`Renderer-backed text engine wrap evidence is blocked: ${codes}`)
  }

  const acceptance = core.createTextEngineEvidenceAcceptancePlan({
    acceptanceId: `renderer-backed-provider:${input.cacheKey}:acceptance`,
    policyRevision: "renderer-backed-provider-acceptance-v1",
    request,
    evidence: wrap.evidence,
    expectedEngine: wrap.evidence.engine,
    acceptancePolicy: {
      evidenceLane: "glyph-facts-separate-from-pagination-draft",
      coreExecutesEngine: false,
      mutatesPaginationDraft: false,
    },
  })

  if (acceptance.status === "blocked") {
    const codes = acceptance.blockingIssues.map((item) => item.code).join(", ")
    throw new Error(`Renderer-backed text engine evidence acceptance is blocked: ${codes}`)
  }

  const handoff = core.createTextEngineMeasurementDraftHandoffPlan({
    handoffId: `renderer-backed-provider:${input.cacheKey}:handoff`,
    policyRevision: "renderer-backed-provider-handoff-v1",
    request,
    acceptance,
    handoffPolicy: {
      consumesAcceptedEvidenceOnly: true,
      coreExecutesEngine: false,
      mutatesEvidence: false,
      attachesGlyphFactsToDraft: false,
      replacesPaginationMeasurer: false,
    },
  })

  if (handoff.status === "blocked" || handoff.draft == null) {
    const codes = handoff.blockingIssues.map((item) => item.code).join(", ")
    throw new Error(`Renderer-backed text engine measurement handoff is blocked: ${codes}`)
  }

  return handoff.draft
}

export function createFlowDocTextEngineRendererBackedProviderBridge(
  input: FlowDocTextEngineRendererBackedProviderInput,
): FlowDocTextEngineRendererBackedProviderBridge {
  const { plan, sourcesByKey } = createPlan(input)

  return {
    plan,
    provider: {
      measure(measurementInput) {
        if (plan.status === "blocked") {
          const codes = plan.blockingIssues.map((item) => item.code).join(", ")
          throw new Error(`Renderer-backed text engine provider bridge is blocked: ${codes}`)
        }

        const source = sourcesByKey.get(requestKey(measurementInput))
        if (source == null) {
          throw new Error("Renderer-backed text engine provider has no accepted evidence source for this text/style/profile.")
        }

        return measureFromSource(source, measurementInput, input.core)
      },
    },
  }
}

export function createFlowDocTextEngineRendererBackedDriftReport(input: {
  measurementInput: FlowDocTextEngineRendererBackedDriftMeasurementInput
  approximateDraft: FlowDocTextEngineRendererBackedDraft
  rendererBackedDraft: FlowDocTextEngineRendererBackedDraft
  tolerance?: Partial<FlowDocTextEngineRendererBackedDriftReport["tolerance"]>
}): FlowDocTextEngineRendererBackedDriftReport {
  const tolerance = {
    widthPt: input.tolerance?.widthPt ?? 0,
    heightPt: input.tolerance?.heightPt ?? 0,
    lineCount: input.tolerance?.lineCount ?? 0,
  }
  const approximateDraft = summarizeDraft(input.approximateDraft)
  const rendererBackedDraft = summarizeDraft(input.rendererBackedDraft)
  const drift = {
    widthPt: Math.abs(rendererBackedDraft.widthPt - approximateDraft.widthPt),
    heightPt: Math.abs(rendererBackedDraft.heightPt - approximateDraft.heightPt),
    lineCount: Math.abs(rendererBackedDraft.lineCount - approximateDraft.lineCount),
  }

  return {
    source: FLOWDOC_TEXT_ENGINE_RENDERER_BACKED_PROVIDER_SOURCE,
    mode: "renderer-backed-measurement-drift-report",
    status: drift.widthPt <= tolerance.widthPt
      && drift.heightPt <= tolerance.heightPt
      && drift.lineCount <= tolerance.lineCount
      ? "accepted"
      : "rejected",
    measurementProfileId: input.measurementInput.measurementProfileId ?? "default",
    textHash: hashText(input.measurementInput.text),
    approximateDraft,
    rendererBackedDraft,
    drift,
    tolerance,
  }
}
