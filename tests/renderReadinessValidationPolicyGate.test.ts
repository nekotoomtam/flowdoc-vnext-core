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
    malformedEnvelopeBlockerVocabulary: string[]
  }
  variablePayloadContainer: {
    containerField: "variables"
    containerShape: "json-object-keyed-by-variable-id"
  }
  variablePayloadPolicyReference: {
    requiredMissingDefaultValuePolicyPointer: "repo://fixtures/required-missing-default-value-policy.v1.json"
  }
  compatibilityPolicyReference: {
    variableCompatibilityPolicyPointer: "repo://fixtures/variable-compatibility-policy.v1.json"
  }
  nonWork: Record<string, boolean>
}

type RenderApiResponseStatusContractFixture = {
  responseContractId: "render-api-response-status-contract-v1"
  sourceRenderApiResponseStatusContractGate?: never
  responseContractStatus: "accepted-contract-metadata-only"
  nextRecommendedWork: "Render-Readiness Validation Policy Gate"
  requestEnvelopeReference: {
    requestEnvelopeId: "render-api-request-envelope-contract-v1"
    requestEnvelopeVersion: 1
    requestEnvelopeStatus: "accepted-contract-metadata-only"
    templateVersionId: "template-product-report-vnext@v1"
  }
  templateVersionIdentity: TemplateVersionIdentity
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  variableDataContractEvidencePointers: Record<string, string>
  responseStatusVocabulary: Array<
    "accepted" | "accepted-with-warnings" | "blocked" | "deferred-job-placeholder" | "unknown"
  >
  requestStatusMapping: {
    "envelope-valid": "accepted"
    "envelope-valid-with-warnings": "accepted-with-warnings"
    "envelope-blocked": "blocked"
    unknown: "unknown"
  }
  renderJobPlaceholder: {
    placeholderMode: "metadata-only"
    jobStatusPlaceholder: "deferred-job-placeholder"
    jobIdPlaceholder: null
    jobStatusLifecycleImplemented: false
  }
  artifactPointerPlaceholder: {
    placeholderMode: "metadata-only"
    artifactPointer: null
    artifactBytesProduced: false
  }
  nonWork: Record<string, boolean>
}

type RenderReadinessValidationPolicyFixture = {
  readinessPolicyId: "render-readiness-validation-policy-v1"
  sourceRenderApiResponseStatusContractGate: "Render API Response / Status Contract Gate"
  sourceRenderApiResponseStatusContractGateStatus: "complete"
  sourceResponseStatusContractPointer: "repo://fixtures/render-api-response-status-contract.v1.json"
  sourceRequestEnvelopePointer: "repo://fixtures/render-api-request-envelope-contract.v1.json"
  readinessPolicyStatus: "accepted-policy-metadata-only"
  nextRecommendedWork: "Artifact Pointer / Job Status Placeholder Policy Gate"
  readinessPolicyVersion: 1
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
  responseStatusVocabulary: Array<
    "accepted" | "accepted-with-warnings" | "blocked" | "deferred-job-placeholder" | "unknown"
  >
  envelopeToResponseMapping: {
    "envelope-valid": "accepted"
    "envelope-valid-with-warnings": "accepted-with-warnings"
    "envelope-blocked": "blocked"
    unknown: "unknown"
  }
  placeholderConfirmation: {
    jobStatusPlaceholder: "deferred-job-placeholder"
    jobIdPlaceholder: null
    artifactPointer: null
    artifactBytesProduced: false
    placeholderMode: "metadata-only"
  }
  readinessStatusVocabulary: Array<"render-ready" | "render-ready-with-warnings" | "render-blocked" | "readiness-deferred" | "unknown">
  responseReadinessMapping: {
    accepted: "render-ready"
    "accepted-with-warnings": "render-ready-with-warnings"
    blocked: "render-blocked"
    "deferred-job-placeholder": "readiness-deferred"
    unknown: "unknown"
  }
  requiredEvidenceCheckStatus: "defined-metadata-only"
  requiredEvidenceChecks: Array<{
    checkId: string
    source: string
    readyWhen: string
    failureBlocker: string
  }>
  deferredRuntimeCheckStatus: "deferred-beyond-readiness-policy"
  deferredRuntimeChecks: Array<{
    checkId: string
    status: "deferred"
    blocksProductionReadiness: true
  }>
  blockerVocabulary: string[]
  warningVocabulary: string[]
  artifactPointerJobStatusLifecycle: {
    status: "deferred-beyond-metadata-placeholders"
    jobStatusLifecycleImplemented: false
    artifactPointerLifecycleImplemented: false
    nextGate: "Artifact Pointer / Job Status Placeholder Policy Gate"
  }
  deferredContractLanes: Record<string, string>
  routeDecisions: {
    ifReadinessPolicyAccepted: "Artifact Pointer / Job Status Placeholder Policy Gate"
    ifBackendRoutesStorageAuthOrRenderExecutionNeeded: "Dedicated Production Gate"
    ifSchemaMutationNeeded: "Template Version Schema Decision Gate"
  }
  blockersBeforeArtifactPointerJobStatusPlaceholderPolicy: unknown[]
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

describe("render-readiness validation policy gate", () => {
  it("confirms the response/status source gate and accepted identities", () => {
    const responseDoc = readText("../docs/RENDER_API_RESPONSE_STATUS_CONTRACT_GATE.md")

    expect(responseDoc).toContain("Status: Render API Response / Status Contract Gate complete.")
    expect(responseContract.nextRecommendedWork).toBe("Render-Readiness Validation Policy Gate")
    expect(readinessPolicy).toMatchObject({
      readinessPolicyId: "render-readiness-validation-policy-v1",
      sourceRenderApiResponseStatusContractGate: "Render API Response / Status Contract Gate",
      sourceRenderApiResponseStatusContractGateStatus: "complete",
      sourceResponseStatusContractPointer: "repo://fixtures/render-api-response-status-contract.v1.json",
      sourceRequestEnvelopePointer: "repo://fixtures/render-api-request-envelope-contract.v1.json",
      readinessPolicyStatus: "accepted-policy-metadata-only",
      nextRecommendedWork: "Artifact Pointer / Job Status Placeholder Policy Gate",
      readinessPolicyVersion: 1,
    })
    expect(readinessPolicy.requestEnvelopeReference).toEqual({
      requestEnvelopeId: requestEnvelope.requestEnvelopeId,
      requestEnvelopeVersion: requestEnvelope.requestEnvelopeContract.requestEnvelopeVersion,
      requestEnvelopeStatus: requestEnvelope.requestEnvelopeStatus,
      templateVersionId: requestEnvelope.templateVersionIdentity.templateVersionId,
    })
    expect(readinessPolicy.responseContractReference).toEqual({
      responseContractId: responseContract.responseContractId,
      responseContractStatus: responseContract.responseContractStatus,
      responseContractPointer: "repo://fixtures/render-api-response-status-contract.v1.json",
    })
  })

  it("carries template, evidence, response status, and placeholder metadata", () => {
    expect(readinessPolicy.templateVersionIdentity).toEqual(responseContract.templateVersionIdentity)
    expect(readinessPolicy.sourceSnapshotRetentionPointer).toBe(responseContract.sourceSnapshotRetentionPointer)
    expect(readinessPolicy.validationEvidencePointer).toBe(responseContract.validationEvidencePointer)
    expect(readinessPolicy.variableDataContractEvidencePointers).toEqual(
      responseContract.variableDataContractEvidencePointers,
    )
    expect(readinessPolicy.responseStatusVocabulary).toEqual(responseContract.responseStatusVocabulary)
    expect(readinessPolicy.envelopeToResponseMapping).toEqual(responseContract.requestStatusMapping)
    expect(readinessPolicy.placeholderConfirmation).toEqual({
      jobStatusPlaceholder: responseContract.renderJobPlaceholder.jobStatusPlaceholder,
      jobIdPlaceholder: responseContract.renderJobPlaceholder.jobIdPlaceholder,
      artifactPointer: responseContract.artifactPointerPlaceholder.artifactPointer,
      artifactBytesProduced: responseContract.artifactPointerPlaceholder.artifactBytesProduced,
      placeholderMode: "metadata-only",
    })
  })

  it("defines readiness status vocabulary and response readiness mapping", () => {
    expect(readinessPolicy.readinessStatusVocabulary).toEqual([
      "render-ready",
      "render-ready-with-warnings",
      "render-blocked",
      "readiness-deferred",
      "unknown",
    ])
    expect(readinessPolicy.responseReadinessMapping).toEqual({
      accepted: "render-ready",
      "accepted-with-warnings": "render-ready-with-warnings",
      blocked: "render-blocked",
      "deferred-job-placeholder": "readiness-deferred",
      unknown: "unknown",
    })
  })

  it("defines all required evidence checks and readiness blockers", () => {
    const requiredCheckIds = readinessPolicy.requiredEvidenceChecks.map((check) => check.checkId)

    expect(readinessPolicy.requiredEvidenceCheckStatus).toBe("defined-metadata-only")
    expect(requiredCheckIds).toEqual([
      "published-template-version-identity-present",
      "source-snapshot-retention-pointer-present",
      "validation-evidence-pointer-accepted",
      "variable-data-contract-evidence-pointers-present",
      "request-envelope-contract-accepted",
      "response-status-contract-accepted",
      "variable-payload-container-present",
      "required-variable-policy-reference-present",
      "compatibility-policy-reference-present",
      "malformed-envelope-blockers-absent-for-readiness",
    ])
    expect(readinessPolicy.blockerVocabulary).toEqual([
      "missing-published-template-version-identity",
      "missing-source-snapshot-retention-pointer",
      "validation-evidence-not-accepted",
      "missing-variable-data-contract-evidence",
      "request-envelope-contract-not-accepted",
      "response-status-contract-not-accepted",
      "missing-variable-payload-container",
      "missing-required-variable-policy-reference",
      "missing-compatibility-policy-reference",
      "malformed-envelope-blocker-present",
      "schema-mutation-required",
    ])
    expect(readinessPolicy.requiredEvidenceChecks.map((check) => check.failureBlocker)).toEqual(
      readinessPolicy.blockerVocabulary.filter((blocker) => blocker !== "schema-mutation-required"),
    )
  })

  it("keeps runtime checks deferred while naming readiness warnings", () => {
    expect(readinessPolicy.deferredRuntimeCheckStatus).toBe("deferred-beyond-readiness-policy")
    expect(readinessPolicy.deferredRuntimeChecks).toEqual([
      { checkId: "runtime-data-validation", status: "deferred", blocksProductionReadiness: true },
      { checkId: "runtime-default-application", status: "deferred", blocksProductionReadiness: true },
      { checkId: "runtime-compatibility-enforcement", status: "deferred", blocksProductionReadiness: true },
      { checkId: "backend-route-availability", status: "deferred", blocksProductionReadiness: true },
      { checkId: "storage-durability", status: "deferred", blocksProductionReadiness: true },
      { checkId: "auth-authz", status: "deferred", blocksProductionReadiness: true },
      { checkId: "renderer-execution", status: "deferred", blocksProductionReadiness: true },
      { checkId: "artifact-byte-production", status: "deferred", blocksProductionReadiness: true },
    ])
    expect(readinessPolicy.warningVocabulary).toEqual([
      "accepted-with-warnings-response",
      "metadata-only-readiness",
      "placeholder-job-status",
      "placeholder-artifact-pointer",
      "deferred-runtime-data-validation",
      "deferred-runtime-default-application",
      "deferred-runtime-compatibility-enforcement",
      "deferred-backend-route",
      "deferred-storage-durability",
      "deferred-auth-authz",
      "deferred-renderer-execution",
      "deferred-artifact-byte-production",
      "measurement-mini-checkpoint-only",
    ])
  })

  it("routes next to artifact pointer/job status placeholders and preserves hard limits", () => {
    expect(readinessPolicy.artifactPointerJobStatusLifecycle).toEqual({
      status: "deferred-beyond-metadata-placeholders",
      jobStatusLifecycleImplemented: false,
      artifactPointerLifecycleImplemented: false,
      nextGate: "Artifact Pointer / Job Status Placeholder Policy Gate",
    })
    expect(readinessPolicy.deferredContractLanes).toEqual({
      artifactPointerJobStatusPlaceholderPolicy: "deferred-to-artifact-pointer-job-status-placeholder-policy-gate",
      backendProductionRoutes: "deferred",
      productionStorageDurability: "deferred",
      authAuthz: "deferred",
      rendererArtifactBytes: "deferred",
      actualRenderExecution: "deferred",
      broaderErrorBlockerVocabulary: "deferred-if-outside-readiness-policy",
    })
    expect(readinessPolicy.routeDecisions).toEqual({
      ifReadinessPolicyAccepted: "Artifact Pointer / Job Status Placeholder Policy Gate",
      ifBackendRoutesStorageAuthOrRenderExecutionNeeded: "Dedicated Production Gate",
      ifSchemaMutationNeeded: "Template Version Schema Decision Gate",
    })
    expect(readinessPolicy.blockersBeforeArtifactPointerJobStatusPlaceholderPolicy).toEqual([])
    expect(Object.values(readinessPolicy.nonWork)).toEqual(
      Object.values(readinessPolicy.nonWork).map(() => false),
    )
    expect(Object.values(responseContract.nonWork)).toEqual(
      Object.values(responseContract.nonWork).map(() => false),
    )
    expect(Object.values(requestEnvelope.nonWork)).toEqual(
      Object.values(requestEnvelope.nonWork).map(() => false),
    )
  })

  it("does not add root runtime dependencies or mutate measurement behavior", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("render-api")
    expect(rootScripts).not.toContain("artifact-job")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to artifact pointer/job status placeholder policy", () => {
    const readinessDoc = readText("../docs/RENDER_READINESS_VALIDATION_POLICY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(readinessDoc).toContain("Status: Render-Readiness Validation Policy Gate complete.")
    expect(readinessDoc).toContain("fixtures/render-readiness-validation-policy.v1.json")
    expect(readinessDoc).toContain("Artifact Pointer / Job Status Placeholder Policy Gate.")
    expect(readinessDoc).toContain("No backend production routes are implemented.")
    expect(readinessDoc).toContain("No Render API runtime is implemented.")
    expect(readinessDoc).toContain("No actual render execution is implemented.")
    expect(readinessDoc).toContain("## PASS")
    expect(readinessDoc).toContain("## FAIL-BLOCKER")
    expect(readinessDoc).toContain("## RISK")
    expect(readinessDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Render-Readiness Validation Policy Gate.")
    expect(currentStatus).toContain("Render-Readiness Validation Policy Gate.")
    expect(currentStatus).toContain("Artifact Pointer / Job Status Placeholder Policy Gate.")
    expect(nextPointer).toContain("Status: current after Render-Readiness Validation Policy Gate.")
    expect(nextPointer).toContain("Artifact Pointer / Job Status Placeholder Policy Gate.")
    expect(nextPointer).toContain("No backend production routes.")
    expect(nextPointer).toContain("No Render API runtime implementation.")
    expect(nextPointer).toContain("No actual render execution.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(ledger).toContain("| 219 | Render-readiness validation policy gate | done |")
    expect(ledger).toContain("## Phase 219 Render Readiness Validation Policy Gate")
    expect(roadmap).toContain("## Phase 219: Render-Readiness Validation Policy Gate")
    expect(roadmap).toContain("Current next step after Phase 219:")
    expect(roadmap).toContain("Artifact Pointer / Job Status Placeholder Policy Gate")
    expect(roadmap).toContain("Historical Phase 218 Handoff")
    expect(readme).toContain("Render-Readiness Validation Policy Gate")
    expect(readme).toContain("docs/RENDER_READINESS_VALIDATION_POLICY_GATE.md")
  })
})
