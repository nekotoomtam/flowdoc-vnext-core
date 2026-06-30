import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type TemplateVersionIdentity = {
  templateId: "template-product-report-vnext"
  templateVersionId: "template-product-report-vnext@v1"
  versionOrdinal: 1
}

type RenderApiRequestEnvelopeContractFixture = {
  requestEnvelopeId: "render-api-request-envelope-contract-v1"
  requestEnvelopeStatus: "accepted-contract-metadata-only"
  templateVersionIdentity: TemplateVersionIdentity
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  variableDataContractEvidencePointers: Record<string, string>
  requestEnvelopeContract: {
    requestEnvelopeVersion: 1
  }
  nonWork: Record<string, boolean>
}

type RenderApiResponseStatusContractFixture = {
  responseContractId: "render-api-response-status-contract-v1"
  responseContractStatus: "accepted-contract-metadata-only"
  responseStatusVocabulary: Array<"accepted" | "accepted-with-warnings" | "blocked" | "deferred-job-placeholder" | "unknown">
  renderJobPlaceholder: {
    jobStatusPlaceholder: "deferred-job-placeholder"
    jobIdPlaceholder: null
    jobStatusLifecycleImplemented: false
    storageDurabilityClaimed: false
    backendRouteImplemented: false
  }
  artifactPointerPlaceholder: {
    artifactPointer: null
    artifactBytesProduced: false
    artifactLifecycleImplemented: false
    rendererExecutionImplemented: false
  }
  nonWork: Record<string, boolean>
}

type RenderReadinessValidationPolicyFixture = {
  readinessPolicyId: "render-readiness-validation-policy-v1"
  readinessPolicyVersion: 1
  readinessPolicyStatus: "accepted-policy-metadata-only"
  nextRecommendedWork: "Artifact Pointer / Job Status Placeholder Policy Gate"
  requestEnvelopeReference: {
    requestEnvelopeId: "render-api-request-envelope-contract-v1"
    requestEnvelopeVersion: 1
    requestEnvelopeStatus: "accepted-contract-metadata-only"
    templateVersionId: "template-product-report-vnext@v1"
  }
  responseContractReference: {
    responseContractId: "render-api-response-status-contract-v1"
    responseContractStatus: "accepted-contract-metadata-only"
    responseContractPointer: "repo://fixtures/render-api-response-status-contract.v1.json"
  }
  templateVersionIdentity: TemplateVersionIdentity
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  variableDataContractEvidencePointers: Record<string, string>
  responseStatusVocabulary: Array<"accepted" | "accepted-with-warnings" | "blocked" | "deferred-job-placeholder" | "unknown">
  placeholderConfirmation: {
    jobStatusPlaceholder: "deferred-job-placeholder"
    jobIdPlaceholder: null
    artifactPointer: null
    artifactBytesProduced: false
    placeholderMode: "metadata-only"
  }
  readinessStatusVocabulary: Array<"render-ready" | "render-ready-with-warnings" | "render-blocked" | "readiness-deferred" | "unknown">
  nonWork: Record<string, boolean>
}

type ArtifactPointerJobStatusPlaceholderPolicyFixture = {
  artifactJobPlaceholderPolicyId: "artifact-pointer-job-status-placeholder-policy-v1"
  sourceRenderReadinessValidationPolicyGate: "Render-Readiness Validation Policy Gate"
  sourceRenderReadinessValidationPolicyGateStatus: "complete"
  sourceReadinessPolicyPointer: "repo://fixtures/render-readiness-validation-policy.v1.json"
  sourceResponseStatusContractPointer: "repo://fixtures/render-api-response-status-contract.v1.json"
  sourceRequestEnvelopePointer: "repo://fixtures/render-api-request-envelope-contract.v1.json"
  artifactJobPlaceholderPolicyStatus: "accepted-policy-metadata-only"
  nextRecommendedWork: "Render API Error / Blocker Vocabulary Gate"
  artifactJobPlaceholderPolicyVersion: 1
  requestEnvelopeReference: RenderReadinessValidationPolicyFixture["requestEnvelopeReference"]
  responseContractReference: RenderReadinessValidationPolicyFixture["responseContractReference"]
  readinessPolicyReference: {
    readinessPolicyId: "render-readiness-validation-policy-v1"
    readinessPolicyVersion: 1
    readinessPolicyStatus: "accepted-policy-metadata-only"
    readinessPolicyPointer: "repo://fixtures/render-readiness-validation-policy.v1.json"
  }
  templateVersionIdentity: TemplateVersionIdentity
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  variableDataContractEvidencePointers: Record<string, string>
  responseStatusVocabulary: RenderReadinessValidationPolicyFixture["responseStatusVocabulary"]
  readinessStatusVocabulary: RenderReadinessValidationPolicyFixture["readinessStatusVocabulary"]
  jobStatusPlaceholderVocabulary: Array<
    "job-placeholder-deferred" | "job-not-created" | "job-blocked-before-creation" | "job-unknown"
  >
  artifactPointerPlaceholderVocabulary: Array<
    "artifact-pointer-null" | "artifact-not-produced" | "artifact-blocked-before-production" | "artifact-unknown"
  >
  placeholderFields: string[]
  jobPlaceholderPolicy: {
    placeholderMode: "metadata-only"
    jobStatusPlaceholder: "job-placeholder-deferred"
    sourceResponseJobStatusPlaceholder: "deferred-job-placeholder"
    jobIdPlaceholder: null
    jobCreated: false
    durableJobLifecycleImplemented: false
    durableJobIdCreated: false
    backendRouteImplemented: false
    storageDurabilityClaimed: false
    allowedTransitionsMetadataOnly: Array<{ from: string; to: string; meaning: string }>
  }
  artifactPointerPolicy: {
    placeholderMode: "metadata-only"
    artifactPointerPlaceholder: "artifact-pointer-null"
    artifactPointer: null
    artifactRetentionPointer: null
    artifactBytesProduced: false
    artifactProduced: false
    artifactLifecycleStatus: "artifact-not-produced"
    storageDurabilityStatus: "not-claimed"
    rendererExecutionStatus: "not-implemented"
    rendererExecutionImplemented: false
    artifactLifecycleImplemented: false
  }
  placeholderConfirmation: {
    jobStatusPlaceholder: "job-placeholder-deferred"
    jobIdPlaceholder: null
    artifactPointerPlaceholder: "artifact-pointer-null"
    artifactPointer: null
    artifactBytesProduced: false
    metadataOnly: true
  }
  lifecycleDeferralPolicy: Record<string, "deferred">
  blockerVocabulary: string[]
  warningVocabulary: string[]
  deferredContractLanes: Record<string, string>
  routeDecisions: {
    ifArtifactJobPlaceholderPolicyAccepted: "Render API Error / Blocker Vocabulary Gate"
    ifRealStorageJobLifecycleRendererExecutionOrArtifactBytesNeeded: "Dedicated Production Gate"
    ifRuntimeErrorHandlingNeeded: string
    ifSchemaMutationNeeded: "Template Version Schema Decision Gate"
  }
  blockersBeforeRenderApiErrorBlockerVocabularyGate: unknown[]
  nonWork: Record<string, boolean>
}

type PackageJson = {
  scripts: Record<string, string>
}

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function readJson<T>(path: string): T {
  return JSON.parse(readText(path)) as T
}

const requestEnvelope = readJson<RenderApiRequestEnvelopeContractFixture>(
  "../fixtures/render-api-request-envelope-contract.v1.json",
)
const responseContract = readJson<RenderApiResponseStatusContractFixture>(
  "../fixtures/render-api-response-status-contract.v1.json",
)
const readinessPolicy = readJson<RenderReadinessValidationPolicyFixture>(
  "../fixtures/render-readiness-validation-policy.v1.json",
)
const placeholderPolicy = readJson<ArtifactPointerJobStatusPlaceholderPolicyFixture>(
  "../fixtures/artifact-pointer-job-status-placeholder-policy.v1.json",
)

describe("artifact pointer / job status placeholder policy gate", () => {
  it("confirms the readiness source gate and accepted identity chain", () => {
    const readinessDoc = readText("../docs/RENDER_READINESS_VALIDATION_POLICY_GATE.md")

    expect(readinessDoc).toContain("Status: Render-Readiness Validation Policy Gate complete.")
    expect(readinessPolicy.nextRecommendedWork).toBe("Artifact Pointer / Job Status Placeholder Policy Gate")
    expect(placeholderPolicy).toMatchObject({
      artifactJobPlaceholderPolicyId: "artifact-pointer-job-status-placeholder-policy-v1",
      sourceRenderReadinessValidationPolicyGate: "Render-Readiness Validation Policy Gate",
      sourceRenderReadinessValidationPolicyGateStatus: "complete",
      sourceReadinessPolicyPointer: "repo://fixtures/render-readiness-validation-policy.v1.json",
      sourceResponseStatusContractPointer: "repo://fixtures/render-api-response-status-contract.v1.json",
      sourceRequestEnvelopePointer: "repo://fixtures/render-api-request-envelope-contract.v1.json",
      artifactJobPlaceholderPolicyStatus: "accepted-policy-metadata-only",
      nextRecommendedWork: "Render API Error / Blocker Vocabulary Gate",
      artifactJobPlaceholderPolicyVersion: 1,
    })
    expect(placeholderPolicy.requestEnvelopeReference).toEqual(readinessPolicy.requestEnvelopeReference)
    expect(placeholderPolicy.responseContractReference).toEqual(readinessPolicy.responseContractReference)
    expect(placeholderPolicy.readinessPolicyReference).toEqual({
      readinessPolicyId: readinessPolicy.readinessPolicyId,
      readinessPolicyVersion: readinessPolicy.readinessPolicyVersion,
      readinessPolicyStatus: readinessPolicy.readinessPolicyStatus,
      readinessPolicyPointer: "repo://fixtures/render-readiness-validation-policy.v1.json",
    })
  })

  it("carries template, evidence, response, and readiness context", () => {
    expect(placeholderPolicy.templateVersionIdentity).toEqual(readinessPolicy.templateVersionIdentity)
    expect(placeholderPolicy.templateVersionIdentity).toEqual(requestEnvelope.templateVersionIdentity)
    expect(placeholderPolicy.sourceSnapshotRetentionPointer).toBe(readinessPolicy.sourceSnapshotRetentionPointer)
    expect(placeholderPolicy.validationEvidencePointer).toBe(readinessPolicy.validationEvidencePointer)
    expect(placeholderPolicy.variableDataContractEvidencePointers).toEqual(
      readinessPolicy.variableDataContractEvidencePointers,
    )
    expect(placeholderPolicy.responseStatusVocabulary).toEqual(responseContract.responseStatusVocabulary)
    expect(placeholderPolicy.responseStatusVocabulary).toEqual(readinessPolicy.responseStatusVocabulary)
    expect(placeholderPolicy.readinessStatusVocabulary).toEqual(readinessPolicy.readinessStatusVocabulary)
  })

  it("defines placeholder vocabularies and fields without real lifecycle behavior", () => {
    expect(placeholderPolicy.jobStatusPlaceholderVocabulary).toEqual([
      "job-placeholder-deferred",
      "job-not-created",
      "job-blocked-before-creation",
      "job-unknown",
    ])
    expect(placeholderPolicy.artifactPointerPlaceholderVocabulary).toEqual([
      "artifact-pointer-null",
      "artifact-not-produced",
      "artifact-blocked-before-production",
      "artifact-unknown",
    ])
    expect(placeholderPolicy.placeholderFields).toEqual([
      "jobStatusPlaceholder",
      "jobIdPlaceholder",
      "artifactPointerPlaceholder",
      "artifactBytesProduced",
      "artifactLifecycleStatus",
      "storageDurabilityStatus",
      "rendererExecutionStatus",
    ])
  })

  it("keeps job and artifact placeholders null, deferred, and metadata-only", () => {
    expect(placeholderPolicy.jobPlaceholderPolicy).toMatchObject({
      placeholderMode: "metadata-only",
      jobStatusPlaceholder: "job-placeholder-deferred",
      sourceResponseJobStatusPlaceholder: responseContract.renderJobPlaceholder.jobStatusPlaceholder,
      jobIdPlaceholder: responseContract.renderJobPlaceholder.jobIdPlaceholder,
      jobCreated: false,
      durableJobLifecycleImplemented: false,
      durableJobIdCreated: false,
      backendRouteImplemented: false,
      storageDurabilityClaimed: false,
    })
    expect(placeholderPolicy.jobPlaceholderPolicy.allowedTransitionsMetadataOnly.map((transition) => transition.to)).toEqual([
      "job-not-created",
      "job-blocked-before-creation",
      "job-unknown",
    ])
    expect(placeholderPolicy.artifactPointerPolicy).toEqual({
      placeholderMode: "metadata-only",
      artifactPointerPlaceholder: "artifact-pointer-null",
      artifactPointer: responseContract.artifactPointerPlaceholder.artifactPointer,
      artifactRetentionPointer: null,
      artifactBytesProduced: responseContract.artifactPointerPlaceholder.artifactBytesProduced,
      artifactProduced: false,
      artifactLifecycleStatus: "artifact-not-produced",
      storageDurabilityStatus: "not-claimed",
      rendererExecutionStatus: "not-implemented",
      rendererExecutionImplemented: false,
      artifactLifecycleImplemented: false,
    })
    expect(placeholderPolicy.placeholderConfirmation).toEqual({
      jobStatusPlaceholder: "job-placeholder-deferred",
      jobIdPlaceholder: null,
      artifactPointerPlaceholder: "artifact-pointer-null",
      artifactPointer: readinessPolicy.placeholderConfirmation.artifactPointer,
      artifactBytesProduced: readinessPolicy.placeholderConfirmation.artifactBytesProduced,
      metadataOnly: true,
    })
  })

  it("keeps lifecycle, production, and runtime boundaries deferred", () => {
    expect(placeholderPolicy.lifecycleDeferralPolicy).toEqual({
      jobStatusLifecycle: "deferred",
      artifactPointerLifecycle: "deferred",
      backendProductionRoutes: "deferred",
      renderApiRuntime: "deferred",
      productionStorageDurability: "deferred",
      authAuthz: "deferred",
      rendererArtifactBytes: "deferred",
      actualRenderExecution: "deferred",
      runtimeDataValidation: "deferred",
      runtimeDefaultApplication: "deferred",
      runtimeCompatibilityEnforcement: "deferred",
    })
    expect(placeholderPolicy.blockerVocabulary).toEqual([
      "real-storage-required",
      "durable-job-lifecycle-required",
      "durable-job-id-required",
      "renderer-execution-required",
      "artifact-bytes-required",
      "backend-route-required",
      "auth-authz-required",
      "runtime-validation-required",
      "schema-mutation-required",
    ])
    expect(placeholderPolicy.warningVocabulary).toEqual([
      "metadata-only-placeholder-policy",
      "job-placeholder-deferred",
      "artifact-pointer-null",
      "storage-durability-deferred",
      "renderer-execution-deferred",
      "artifact-byte-production-deferred",
      "render-api-runtime-deferred",
    ])
  })

  it("routes next work to error/blocker vocabulary and preserves hard limits", () => {
    expect(placeholderPolicy.deferredContractLanes).toEqual({
      renderApiErrorBlockerVocabulary: "deferred-to-render-api-error-blocker-vocabulary-gate",
      renderApiContractCloseAudit: "deferred-until-error-blocker-vocabulary-is-accepted",
      backendProductionRoutes: "deferred",
      productionStorageDurability: "deferred",
      authAuthz: "deferred",
      rendererArtifactBytes: "deferred",
      actualRenderExecution: "deferred",
    })
    expect(placeholderPolicy.routeDecisions).toEqual({
      ifArtifactJobPlaceholderPolicyAccepted: "Render API Error / Blocker Vocabulary Gate",
      ifRealStorageJobLifecycleRendererExecutionOrArtifactBytesNeeded: "Dedicated Production Gate",
      ifRuntimeErrorHandlingNeeded:
        "Render API Error / Blocker Vocabulary Gate remains metadata-only and runtime handling stays deferred",
      ifSchemaMutationNeeded: "Template Version Schema Decision Gate",
    })
    expect(placeholderPolicy.blockersBeforeRenderApiErrorBlockerVocabularyGate).toEqual([])
    expect(Object.values(placeholderPolicy.nonWork)).toEqual(
      Object.values(placeholderPolicy.nonWork).map(() => false),
    )
    expect(Object.values(readinessPolicy.nonWork)).toEqual(Object.values(readinessPolicy.nonWork).map(() => false))
    expect(Object.values(responseContract.nonWork)).toEqual(Object.values(responseContract.nonWork).map(() => false))
    expect(Object.values(requestEnvelope.nonWork)).toEqual(Object.values(requestEnvelope.nonWork).map(() => false))
  })

  it("does not add root runtime dependencies or mutate measurement behavior", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("render-api")
    expect(rootScripts).not.toContain("artifact-job")
    expect(rootScripts).not.toContain("job-status")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to render API error/blocker vocabulary", () => {
    const placeholderDoc = readText("../docs/ARTIFACT_POINTER_JOB_STATUS_PLACEHOLDER_POLICY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(placeholderDoc).toContain("Status: Artifact Pointer / Job Status Placeholder Policy Gate complete.")
    expect(placeholderDoc).toContain("fixtures/artifact-pointer-job-status-placeholder-policy.v1.json")
    expect(placeholderDoc).toContain("Render API Error / Blocker Vocabulary Gate.")
    expect(placeholderDoc).toContain("No backend production routes are implemented.")
    expect(placeholderDoc).toContain("No Render API runtime is implemented.")
    expect(placeholderDoc).toContain("No durable job ids are created.")
    expect(placeholderDoc).toContain("No actual render execution is implemented.")
    expect(placeholderDoc).toContain("## PASS")
    expect(placeholderDoc).toContain("## FAIL-BLOCKER")
    expect(placeholderDoc).toContain("## RISK")
    expect(placeholderDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Artifact Pointer / Job Status Placeholder Policy Gate.")
    expect(currentStatus).toContain("Artifact Pointer / Job Status Placeholder Policy Gate.")
    expect(currentStatus).toContain("Render API Error / Blocker Vocabulary Gate.")
    expect(nextPointer).toContain("Status: current after Artifact Pointer / Job Status Placeholder Policy Gate.")
    expect(nextPointer).toContain("Render API Error / Blocker Vocabulary Gate.")
    expect(nextPointer).toContain("No backend production routes.")
    expect(nextPointer).toContain("No Render API runtime implementation.")
    expect(nextPointer).toContain("No durable job ids.")
    expect(nextPointer).toContain("No actual render execution.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(ledger).toContain("| 220 | Artifact pointer job status placeholder policy gate | done |")
    expect(ledger).toContain("## Phase 220 Artifact Pointer Job Status Placeholder Policy Gate")
    expect(roadmap).toContain("## Phase 220: Artifact Pointer / Job Status Placeholder Policy Gate")
    expect(roadmap).toContain("Current next step after Phase 220:")
    expect(roadmap).toContain("Render API Error / Blocker Vocabulary Gate")
    expect(roadmap).toContain("Historical Phase 219 Handoff")
    expect(readme).toContain("Artifact Pointer / Job Status Placeholder Policy Gate")
    expect(readme).toContain("docs/ARTIFACT_POINTER_JOB_STATUS_PLACEHOLDER_POLICY_GATE.md")
  })
})
