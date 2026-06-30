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
  requestEnvelopeContract: {
    requestEnvelopeVersion: 1
    malformedEnvelopeBlockerVocabulary: string[]
  }
  nonWork: Record<string, boolean>
}

type RenderApiResponseStatusContractFixture = {
  responseContractId: "render-api-response-status-contract-v1"
  responseContractStatus: "accepted-contract-metadata-only"
  responseShapes: {
    blockedEnvelope: {
      responseStatus: "blocked"
      blockerSummary: {
        allowedBlockerCodes: string[]
      }
    }
  }
  responseErrorBlockerSummaryShape: {
    summaryMode: "json-safe-metadata-only"
    warningCodes: "json-string-array"
    blockerCodes: "json-string-array"
    runtimeErrorHandlingImplemented: false
  }
  nonWork: Record<string, boolean>
}

type RenderReadinessValidationPolicyFixture = {
  readinessPolicyId: "render-readiness-validation-policy-v1"
  readinessPolicyVersion: 1
  readinessPolicyStatus: "accepted-policy-metadata-only"
  templateVersionIdentity: TemplateVersionIdentity
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
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  variableDataContractEvidencePointers: Record<string, string>
  blockerVocabulary: string[]
  warningVocabulary: string[]
  nonWork: Record<string, boolean>
}

type ArtifactPointerJobStatusPlaceholderPolicyFixture = {
  artifactJobPlaceholderPolicyId: "artifact-pointer-job-status-placeholder-policy-v1"
  artifactJobPlaceholderPolicyVersion: 1
  artifactJobPlaceholderPolicyStatus: "accepted-policy-metadata-only"
  nextRecommendedWork: "Render API Error / Blocker Vocabulary Gate"
  templateVersionIdentity: TemplateVersionIdentity
  requestEnvelopeReference: RenderReadinessValidationPolicyFixture["requestEnvelopeReference"]
  responseContractReference: RenderReadinessValidationPolicyFixture["responseContractReference"]
  readinessPolicyReference: {
    readinessPolicyId: "render-readiness-validation-policy-v1"
    readinessPolicyVersion: 1
    readinessPolicyStatus: "accepted-policy-metadata-only"
    readinessPolicyPointer: "repo://fixtures/render-readiness-validation-policy.v1.json"
  }
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  variableDataContractEvidencePointers: Record<string, string>
  blockerVocabulary: string[]
  warningVocabulary: string[]
  nonWork: Record<string, boolean>
}

type BoundaryGroup = {
  boundary:
    | "request-envelope"
    | "response-status"
    | "render-readiness"
    | "artifact-job-placeholder"
    | "deferred-backend-route"
    | "deferred-storage"
    | "deferred-auth-authz"
    | "deferred-renderer-execution"
    | "deferred-runtime-validation"
    | "schema-mutation"
  sourceGate: string
  evidencePointer: string
  severity: "warning" | "blocked" | "deferred" | "unknown"
  blockerCodes: string[]
  warningCodes: string[]
  runtimeImplemented: false
  productionReadinessClaimed: false
}

type RenderApiErrorBlockerVocabularyFixture = {
  errorBlockerVocabularyId: "render-api-error-blocker-vocabulary-v1"
  sourceArtifactPointerJobStatusPlaceholderPolicyGate: "Artifact Pointer / Job Status Placeholder Policy Gate"
  sourceArtifactPointerJobStatusPlaceholderPolicyGateStatus: "complete"
  sourceArtifactJobPlaceholderPolicyPointer: "repo://fixtures/artifact-pointer-job-status-placeholder-policy.v1.json"
  sourceReadinessPolicyPointer: "repo://fixtures/render-readiness-validation-policy.v1.json"
  sourceResponseStatusContractPointer: "repo://fixtures/render-api-response-status-contract.v1.json"
  sourceRequestEnvelopePointer: "repo://fixtures/render-api-request-envelope-contract.v1.json"
  errorBlockerVocabularyStatus: "accepted-vocabulary-metadata-only"
  nextRecommendedWork: "Render API Contract Close Audit"
  errorBlockerVocabularyVersion: 1
  templateVersionIdentity: TemplateVersionIdentity
  requestEnvelopeReference: ArtifactPointerJobStatusPlaceholderPolicyFixture["requestEnvelopeReference"]
  responseContractReference: ArtifactPointerJobStatusPlaceholderPolicyFixture["responseContractReference"]
  readinessPolicyReference: ArtifactPointerJobStatusPlaceholderPolicyFixture["readinessPolicyReference"]
  artifactJobPlaceholderPolicyReference: {
    artifactJobPlaceholderPolicyId: "artifact-pointer-job-status-placeholder-policy-v1"
    artifactJobPlaceholderPolicyVersion: 1
    artifactJobPlaceholderPolicyStatus: "accepted-policy-metadata-only"
    artifactJobPlaceholderPolicyPointer: "repo://fixtures/artifact-pointer-job-status-placeholder-policy.v1.json"
  }
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  variableDataContractEvidencePointers: Record<string, string>
  severityVocabulary: Array<"warning" | "blocked" | "deferred" | "unknown">
  preservedRequestEnvelopeBlockers: string[]
  preservedResponseStatusBlockedSummaryShape: {
    summaryMode: "json-safe-metadata-only"
    warningCodes: "json-string-array"
    blockerCodes: "json-string-array"
    blockedEnvelopeStatus: "blocked"
    allowedBlockerCodes: string[]
    runtimeErrorHandlingImplemented: false
  }
  preservedReadinessBlockers: string[]
  preservedReadinessWarnings: string[]
  preservedArtifactJobPlaceholderBlockers: string[]
  preservedArtifactJobPlaceholderWarnings: string[]
  boundaryGroups: BoundaryGroup[]
  errorSummaryShape: {
    summaryMode: "json-safe-metadata-only"
    fields: string[]
    severity: "warning | blocked | deferred | unknown"
    runtimeImplemented: false
    productionReadinessClaimed: false
    runtimeErrorHandlingImplemented: false
  }
  routeDecisions: {
    ifErrorBlockerVocabularyAccepted: "Render API Contract Close Audit"
    ifRuntimeErrorHandlingNeeded: "Dedicated Runtime Error Handling Gate"
    ifBackendRoutesStorageAuthOrRenderExecutionNeeded: "Dedicated Production Gate"
    ifSchemaMutationNeeded: "Template Version Schema Decision Gate"
  }
  blockersBeforeRenderApiContractCloseAudit: unknown[]
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
const vocabulary = readJson<RenderApiErrorBlockerVocabularyFixture>(
  "../fixtures/render-api-error-blocker-vocabulary.v1.json",
)

function boundary(name: BoundaryGroup["boundary"]): BoundaryGroup {
  const found = vocabulary.boundaryGroups.find((group) => group.boundary === name)
  expect(found).toBeDefined()
  return found as BoundaryGroup
}

describe("render API error/blocker vocabulary gate", () => {
  it("confirms artifact/job placeholder source and accepted identity chain", () => {
    const placeholderDoc = readText("../docs/ARTIFACT_POINTER_JOB_STATUS_PLACEHOLDER_POLICY_GATE.md")

    expect(placeholderDoc).toContain("Status: Artifact Pointer / Job Status Placeholder Policy Gate complete.")
    expect(placeholderPolicy.nextRecommendedWork).toBe("Render API Error / Blocker Vocabulary Gate")
    expect(vocabulary).toMatchObject({
      errorBlockerVocabularyId: "render-api-error-blocker-vocabulary-v1",
      sourceArtifactPointerJobStatusPlaceholderPolicyGate: "Artifact Pointer / Job Status Placeholder Policy Gate",
      sourceArtifactPointerJobStatusPlaceholderPolicyGateStatus: "complete",
      sourceArtifactJobPlaceholderPolicyPointer:
        "repo://fixtures/artifact-pointer-job-status-placeholder-policy.v1.json",
      sourceReadinessPolicyPointer: "repo://fixtures/render-readiness-validation-policy.v1.json",
      sourceResponseStatusContractPointer: "repo://fixtures/render-api-response-status-contract.v1.json",
      sourceRequestEnvelopePointer: "repo://fixtures/render-api-request-envelope-contract.v1.json",
      errorBlockerVocabularyStatus: "accepted-vocabulary-metadata-only",
      nextRecommendedWork: "Render API Contract Close Audit",
      errorBlockerVocabularyVersion: 1,
    })
    expect(vocabulary.templateVersionIdentity).toEqual(placeholderPolicy.templateVersionIdentity)
    expect(vocabulary.requestEnvelopeReference).toEqual(placeholderPolicy.requestEnvelopeReference)
    expect(vocabulary.responseContractReference).toEqual(placeholderPolicy.responseContractReference)
    expect(vocabulary.readinessPolicyReference).toEqual(placeholderPolicy.readinessPolicyReference)
    expect(vocabulary.artifactJobPlaceholderPolicyReference).toEqual({
      artifactJobPlaceholderPolicyId: placeholderPolicy.artifactJobPlaceholderPolicyId,
      artifactJobPlaceholderPolicyVersion: placeholderPolicy.artifactJobPlaceholderPolicyVersion,
      artifactJobPlaceholderPolicyStatus: placeholderPolicy.artifactJobPlaceholderPolicyStatus,
      artifactJobPlaceholderPolicyPointer: "repo://fixtures/artifact-pointer-job-status-placeholder-policy.v1.json",
    })
  })

  it("carries evidence pointers and severity vocabulary", () => {
    expect(vocabulary.sourceSnapshotRetentionPointer).toBe(placeholderPolicy.sourceSnapshotRetentionPointer)
    expect(vocabulary.validationEvidencePointer).toBe(placeholderPolicy.validationEvidencePointer)
    expect(vocabulary.variableDataContractEvidencePointers).toEqual(
      placeholderPolicy.variableDataContractEvidencePointers,
    )
    expect(vocabulary.severityVocabulary).toEqual(["warning", "blocked", "deferred", "unknown"])
  })

  it("preserves request, response, readiness, and artifact/job vocabulary", () => {
    expect(vocabulary.preservedRequestEnvelopeBlockers).toEqual(
      requestEnvelope.requestEnvelopeContract.malformedEnvelopeBlockerVocabulary,
    )
    expect(vocabulary.preservedResponseStatusBlockedSummaryShape).toEqual({
      summaryMode: responseContract.responseErrorBlockerSummaryShape.summaryMode,
      warningCodes: responseContract.responseErrorBlockerSummaryShape.warningCodes,
      blockerCodes: responseContract.responseErrorBlockerSummaryShape.blockerCodes,
      blockedEnvelopeStatus: responseContract.responseShapes.blockedEnvelope.responseStatus,
      allowedBlockerCodes: responseContract.responseShapes.blockedEnvelope.blockerSummary.allowedBlockerCodes,
      runtimeErrorHandlingImplemented: false,
    })
    expect(vocabulary.preservedReadinessBlockers).toEqual(readinessPolicy.blockerVocabulary)
    expect(vocabulary.preservedReadinessWarnings).toEqual(readinessPolicy.warningVocabulary)
    expect(vocabulary.preservedArtifactJobPlaceholderBlockers).toEqual(placeholderPolicy.blockerVocabulary)
    expect(vocabulary.preservedArtifactJobPlaceholderWarnings).toEqual(placeholderPolicy.warningVocabulary)
  })

  it("groups blocker vocabulary by boundary with source evidence pointers", () => {
    expect(vocabulary.boundaryGroups.map((group) => group.boundary)).toEqual([
      "request-envelope",
      "response-status",
      "render-readiness",
      "artifact-job-placeholder",
      "deferred-backend-route",
      "deferred-storage",
      "deferred-auth-authz",
      "deferred-renderer-execution",
      "deferred-runtime-validation",
      "schema-mutation",
    ])

    expect(boundary("request-envelope")).toMatchObject({
      sourceGate: "Render API Request Envelope Contract Gate",
      evidencePointer: "repo://fixtures/render-api-request-envelope-contract.v1.json",
      severity: "blocked",
      blockerCodes: requestEnvelope.requestEnvelopeContract.malformedEnvelopeBlockerVocabulary,
      warningCodes: [],
    })
    expect(boundary("response-status")).toMatchObject({
      sourceGate: "Render API Response / Status Contract Gate",
      evidencePointer: "repo://fixtures/render-api-response-status-contract.v1.json",
      severity: "blocked",
      blockerCodes: responseContract.responseShapes.blockedEnvelope.blockerSummary.allowedBlockerCodes,
      warningCodes: ["accepted-with-warnings-response"],
    })
    expect(boundary("render-readiness")).toMatchObject({
      sourceGate: "Render-Readiness Validation Policy Gate",
      evidencePointer: "repo://fixtures/render-readiness-validation-policy.v1.json",
      severity: "blocked",
      blockerCodes: readinessPolicy.blockerVocabulary,
      warningCodes: readinessPolicy.warningVocabulary,
    })
    expect(boundary("artifact-job-placeholder")).toMatchObject({
      sourceGate: "Artifact Pointer / Job Status Placeholder Policy Gate",
      evidencePointer: "repo://fixtures/artifact-pointer-job-status-placeholder-policy.v1.json",
      severity: "deferred",
      blockerCodes: placeholderPolicy.blockerVocabulary,
      warningCodes: placeholderPolicy.warningVocabulary,
    })
  })

  it("keeps deferred production and schema boundaries metadata-only", () => {
    expect(boundary("deferred-backend-route")).toMatchObject({
      blockerCodes: ["backend-route-required"],
      warningCodes: ["deferred-backend-route", "render-api-runtime-deferred"],
      severity: "deferred",
    })
    expect(boundary("deferred-storage")).toMatchObject({
      blockerCodes: ["real-storage-required"],
      warningCodes: ["deferred-storage-durability", "storage-durability-deferred"],
      severity: "deferred",
    })
    expect(boundary("deferred-auth-authz")).toMatchObject({
      blockerCodes: ["auth-authz-required"],
      warningCodes: ["deferred-auth-authz"],
      severity: "deferred",
    })
    expect(boundary("deferred-renderer-execution")).toMatchObject({
      blockerCodes: ["renderer-execution-required", "artifact-bytes-required"],
      warningCodes: [
        "deferred-renderer-execution",
        "renderer-execution-deferred",
        "deferred-artifact-byte-production",
        "artifact-byte-production-deferred",
      ],
      severity: "deferred",
    })
    expect(boundary("deferred-runtime-validation")).toMatchObject({
      blockerCodes: ["runtime-validation-required"],
      warningCodes: [
        "deferred-runtime-data-validation",
        "deferred-runtime-default-application",
        "deferred-runtime-compatibility-enforcement",
      ],
      severity: "deferred",
    })
    expect(boundary("schema-mutation")).toMatchObject({
      blockerCodes: ["schema-mutation-required"],
      warningCodes: [],
      severity: "blocked",
    })
    expect(vocabulary.boundaryGroups.every((group) => group.runtimeImplemented === false)).toBe(true)
    expect(vocabulary.boundaryGroups.every((group) => group.productionReadinessClaimed === false)).toBe(true)
  })

  it("defines JSON-safe error summary shape and routes to close audit", () => {
    expect(vocabulary.errorSummaryShape).toEqual({
      summaryMode: "json-safe-metadata-only",
      fields: [
        "boundary",
        "blockerCode",
        "severity",
        "sourceGate",
        "evidencePointer",
        "runtimeImplemented",
        "productionReadinessClaimed",
      ],
      boundary: "boundary vocabulary id",
      blockerCode: "json-string-code-from-boundary-group",
      severity: "warning | blocked | deferred | unknown",
      sourceGate: "human-readable source gate name",
      evidencePointer: "repo:// pointer to JSON-safe evidence",
      runtimeImplemented: false,
      productionReadinessClaimed: false,
      runtimeErrorHandlingImplemented: false,
    })
    expect(vocabulary.routeDecisions).toEqual({
      ifErrorBlockerVocabularyAccepted: "Render API Contract Close Audit",
      ifRuntimeErrorHandlingNeeded: "Dedicated Runtime Error Handling Gate",
      ifBackendRoutesStorageAuthOrRenderExecutionNeeded: "Dedicated Production Gate",
      ifSchemaMutationNeeded: "Template Version Schema Decision Gate",
    })
    expect(vocabulary.blockersBeforeRenderApiContractCloseAudit).toEqual([])
  })

  it("preserves hard limits and root independence", () => {
    expect(Object.values(vocabulary.nonWork)).toEqual(Object.values(vocabulary.nonWork).map(() => false))
    expect(Object.values(placeholderPolicy.nonWork)).toEqual(Object.values(placeholderPolicy.nonWork).map(() => false))
    expect(Object.values(readinessPolicy.nonWork)).toEqual(Object.values(readinessPolicy.nonWork).map(() => false))
    expect(Object.values(responseContract.nonWork)).toEqual(Object.values(responseContract.nonWork).map(() => false))
    expect(Object.values(requestEnvelope.nonWork)).toEqual(Object.values(requestEnvelope.nonWork).map(() => false))

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("render-api")
    expect(rootScripts).not.toContain("error-blocker")
    expect(rootScripts).not.toContain("job-status")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to Render API Contract Close Audit", () => {
    const vocabularyDoc = readText("../docs/RENDER_API_ERROR_BLOCKER_VOCABULARY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(vocabularyDoc).toContain("Status: Render API Error / Blocker Vocabulary Gate complete.")
    expect(vocabularyDoc).toContain("fixtures/render-api-error-blocker-vocabulary.v1.json")
    expect(vocabularyDoc).toContain("Render API Contract Close Audit.")
    expect(vocabularyDoc).toContain("No runtime error handling is implemented.")
    expect(vocabularyDoc).toContain("No backend production routes are implemented.")
    expect(vocabularyDoc).toContain("No Render API runtime is implemented.")
    expect(vocabularyDoc).toContain("No actual render execution is implemented.")
    expect(vocabularyDoc).toContain("## PASS")
    expect(vocabularyDoc).toContain("## FAIL-BLOCKER")
    expect(vocabularyDoc).toContain("## RISK")
    expect(vocabularyDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Render API Error / Blocker Vocabulary Gate.")
    expect(currentStatus).toContain("Render API Error / Blocker Vocabulary Gate.")
    expect(currentStatus).toContain("Render API Contract Close Audit.")
    expect(nextPointer).toContain("Status: current after Render API Error / Blocker Vocabulary Gate.")
    expect(nextPointer).toContain("Render API Contract Close Audit.")
    expect(nextPointer).toContain("No runtime error handling.")
    expect(nextPointer).toContain("No backend production routes.")
    expect(nextPointer).toContain("No Render API runtime implementation.")
    expect(nextPointer).toContain("No durable job ids.")
    expect(nextPointer).toContain("No actual render execution.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(ledger).toContain("| 221 | Render API error blocker vocabulary gate | done |")
    expect(ledger).toContain("## Phase 221 Render API Error Blocker Vocabulary Gate")
    expect(roadmap).toContain("## Phase 221: Render API Error / Blocker Vocabulary Gate")
    expect(roadmap).toContain("Current next step after Phase 221:")
    expect(roadmap).toContain("Render API Contract Close Audit")
    expect(roadmap).toContain("Historical Phase 220 Handoff")
    expect(readme).toContain("Render API Error / Blocker Vocabulary Gate")
    expect(readme).toContain("docs/RENDER_API_ERROR_BLOCKER_VOCABULARY_GATE.md")
  })
})
