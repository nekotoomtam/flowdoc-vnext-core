import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type TemplateVersionIdentity = {
  templateId: "template-product-report-vnext"
  templateVersionId: "template-product-report-vnext@v1"
  versionOrdinal: 1
}

type RequestEnvelopeFixture = {
  requestEnvelopeId: "render-api-request-envelope-contract-v1"
  requestEnvelopeStatus: "accepted-contract-metadata-only"
  templateVersionIdentity: TemplateVersionIdentity
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  requestEnvelopeContract: {
    requestEnvelopeVersion: 1
  }
  nonWork: Record<string, boolean>
}

type ResponseContractFixture = {
  responseContractId: "render-api-response-status-contract-v1"
  responseContractStatus: "accepted-contract-metadata-only"
  requestEnvelopeReference: {
    requestEnvelopeId: "render-api-request-envelope-contract-v1"
    requestEnvelopeVersion: 1
    requestEnvelopeStatus: "accepted-contract-metadata-only"
    templateVersionId: "template-product-report-vnext@v1"
  }
  nonWork: Record<string, boolean>
}

type ReadinessPolicyFixture = {
  readinessPolicyId: "render-readiness-validation-policy-v1"
  readinessPolicyVersion: 1
  readinessPolicyStatus: "accepted-policy-metadata-only"
  requestEnvelopeReference: ResponseContractFixture["requestEnvelopeReference"]
  responseContractReference: {
    responseContractId: "render-api-response-status-contract-v1"
    responseContractStatus: "accepted-contract-metadata-only"
    responseContractPointer: "repo://fixtures/render-api-response-status-contract.v1.json"
  }
  nonWork: Record<string, boolean>
}

type ArtifactJobPlaceholderPolicyFixture = {
  artifactJobPlaceholderPolicyId: "artifact-pointer-job-status-placeholder-policy-v1"
  artifactJobPlaceholderPolicyVersion: 1
  artifactJobPlaceholderPolicyStatus: "accepted-policy-metadata-only"
  requestEnvelopeReference: ResponseContractFixture["requestEnvelopeReference"]
  responseContractReference: ReadinessPolicyFixture["responseContractReference"]
  readinessPolicyReference: {
    readinessPolicyId: "render-readiness-validation-policy-v1"
    readinessPolicyVersion: 1
    readinessPolicyStatus: "accepted-policy-metadata-only"
  }
  nonWork: Record<string, boolean>
}

type ErrorBlockerVocabularyFixture = {
  errorBlockerVocabularyId: "render-api-error-blocker-vocabulary-v1"
  errorBlockerVocabularyStatus: "accepted-vocabulary-metadata-only"
  nextRecommendedWork: "Render API Contract Close Audit"
  errorBlockerVocabularyVersion: 1
  templateVersionIdentity: TemplateVersionIdentity
  requestEnvelopeReference: ResponseContractFixture["requestEnvelopeReference"]
  responseContractReference: ReadinessPolicyFixture["responseContractReference"]
  readinessPolicyReference: ArtifactJobPlaceholderPolicyFixture["readinessPolicyReference"]
  artifactJobPlaceholderPolicyReference: {
    artifactJobPlaceholderPolicyId: "artifact-pointer-job-status-placeholder-policy-v1"
    artifactJobPlaceholderPolicyVersion: 1
    artifactJobPlaceholderPolicyStatus: "accepted-policy-metadata-only"
  }
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  boundaryGroups: Array<{
    boundary: string
    runtimeImplemented: false
    productionReadinessClaimed: false
  }>
  nonWork: Record<string, boolean>
}

type AcceptedTemplateMetadataFixture = {
  metadataStatus: "accepted"
  acceptedVersionMetadata: {
    templateId: "template-product-report-vnext"
    templateVersionId: "template-product-report-vnext@v1"
    versionOrdinal: 1
    measurementStatus: "mini-checkpoint-only"
  }
  metadataRepresentation: {
    representedWithoutSchemaChanges: boolean
  }
  nonWork: Record<string, boolean>
}

type VariableCompatibilityPolicyFixture = {
  compatibilityPolicyStatus: "accepted-policy-metadata-only"
  nextRecommendedWork: "Variable Schema / Data Contract Close Audit"
  attachmentTarget: {
    publishedTemplateVersionIdentity: TemplateVersionIdentity
  }
  compatibilityDefinition: {
    runtimeCompatibilityEnforcementImplemented: false
    runtimeDataValidationImplemented: false
    runtimeDefaultApplicationImplemented: false
    renderApiContractImplemented: false
  }
  nonWork: Record<string, boolean>
}

type AcceptedMeasurementManifest = {
  manifestStatus: "accepted"
  manifestScope: "minimal-accepted-subset-only"
  fullV1MatrixStatus: "partial-not-accepted"
  productionReady: false
  defaultMeasurerReplacement: false
  productionBinding: false
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

const requestEnvelope = readJson<RequestEnvelopeFixture>(
  "../fixtures/render-api-request-envelope-contract.v1.json",
)
const responseContract = readJson<ResponseContractFixture>(
  "../fixtures/render-api-response-status-contract.v1.json",
)
const readinessPolicy = readJson<ReadinessPolicyFixture>(
  "../fixtures/render-readiness-validation-policy.v1.json",
)
const placeholderPolicy = readJson<ArtifactJobPlaceholderPolicyFixture>(
  "../fixtures/artifact-pointer-job-status-placeholder-policy.v1.json",
)
const vocabulary = readJson<ErrorBlockerVocabularyFixture>(
  "../fixtures/render-api-error-blocker-vocabulary.v1.json",
)
const templateMetadata = readJson<AcceptedTemplateMetadataFixture>(
  "../fixtures/template-publish-accepted-version-metadata.v1.json",
)
const variableCompatibility = readJson<VariableCompatibilityPolicyFixture>(
  "../fixtures/variable-compatibility-policy.v1.json",
)
const measurementManifest = readJson<AcceptedMeasurementManifest>(
  "../fixtures/measurement-evidence-summary-manifest.accepted.v1.json",
)

describe("render API contract close audit", () => {
  it("confirms the Render API evidence chain and shared identities", () => {
    expect(vocabulary.nextRecommendedWork).toBe("Render API Contract Close Audit")
    expect(vocabulary.errorBlockerVocabularyStatus).toBe("accepted-vocabulary-metadata-only")

    expect(requestEnvelope.requestEnvelopeStatus).toBe("accepted-contract-metadata-only")
    expect(responseContract.responseContractStatus).toBe("accepted-contract-metadata-only")
    expect(readinessPolicy.readinessPolicyStatus).toBe("accepted-policy-metadata-only")
    expect(placeholderPolicy.artifactJobPlaceholderPolicyStatus).toBe("accepted-policy-metadata-only")

    expect(vocabulary.templateVersionIdentity).toEqual(requestEnvelope.templateVersionIdentity)
    expect(vocabulary.requestEnvelopeReference).toEqual({
      requestEnvelopeId: responseContract.requestEnvelopeReference.requestEnvelopeId,
      requestEnvelopeVersion: responseContract.requestEnvelopeReference.requestEnvelopeVersion,
      requestEnvelopeStatus: responseContract.requestEnvelopeReference.requestEnvelopeStatus,
      templateVersionId: responseContract.requestEnvelopeReference.templateVersionId,
    })
    expect(vocabulary.responseContractReference).toEqual(readinessPolicy.responseContractReference)
    expect(vocabulary.readinessPolicyReference).toEqual({
      readinessPolicyId: readinessPolicy.readinessPolicyId,
      readinessPolicyVersion: readinessPolicy.readinessPolicyVersion,
      readinessPolicyStatus: readinessPolicy.readinessPolicyStatus,
      readinessPolicyPointer: "repo://fixtures/render-readiness-validation-policy.v1.json",
    })
    expect(vocabulary.artifactJobPlaceholderPolicyReference).toEqual({
      artifactJobPlaceholderPolicyId: placeholderPolicy.artifactJobPlaceholderPolicyId,
      artifactJobPlaceholderPolicyVersion: placeholderPolicy.artifactJobPlaceholderPolicyVersion,
      artifactJobPlaceholderPolicyStatus: placeholderPolicy.artifactJobPlaceholderPolicyStatus,
      artifactJobPlaceholderPolicyPointer: "repo://fixtures/artifact-pointer-job-status-placeholder-policy.v1.json",
    })
    expect(vocabulary.sourceSnapshotRetentionPointer).toBe(requestEnvelope.sourceSnapshotRetentionPointer)
    expect(vocabulary.validationEvidencePointer).toBe(requestEnvelope.validationEvidencePointer)
  })

  it("confirms all Render API contract docs and fixtures exist", () => {
    const docs = [
      "../docs/RENDER_API_CONTRACT_PLANNING_GATE.md",
      "../docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md",
      "../docs/RENDER_API_RESPONSE_STATUS_CONTRACT_GATE.md",
      "../docs/RENDER_READINESS_VALIDATION_POLICY_GATE.md",
      "../docs/ARTIFACT_POINTER_JOB_STATUS_PLACEHOLDER_POLICY_GATE.md",
      "../docs/RENDER_API_ERROR_BLOCKER_VOCABULARY_GATE.md",
    ]
    const fixtures = [
      "../fixtures/render-api-request-envelope-contract.v1.json",
      "../fixtures/render-api-response-status-contract.v1.json",
      "../fixtures/render-readiness-validation-policy.v1.json",
      "../fixtures/artifact-pointer-job-status-placeholder-policy.v1.json",
      "../fixtures/render-api-error-blocker-vocabulary.v1.json",
    ]

    for (const doc of docs) {
      expect(readText(doc)).toContain("Gate")
    }
    for (const fixture of fixtures) {
      expect(readJson<Record<string, unknown>>(fixture).manifestVersion).toBe(1)
    }
  })

  it("confirms prior mini lanes and measurement scope", () => {
    const templateCloseAudit = readText("../docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md")
    const variableCloseAudit = readText("../docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md")
    const measurementCloseAudit = readText("../docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md")

    expect(templateMetadata.metadataStatus).toBe("accepted")
    expect(templateMetadata.acceptedVersionMetadata.templateVersionId).toBe("template-product-report-vnext@v1")
    expect(templateMetadata.acceptedVersionMetadata.measurementStatus).toBe("mini-checkpoint-only")
    expect(templateMetadata.metadataRepresentation.representedWithoutSchemaChanges).toBe(true)
    expect(templateCloseAudit).toContain("Decision: close Template Publish mini lane for mini infrastructure checkpoint only.")

    expect(variableCompatibility.compatibilityPolicyStatus).toBe("accepted-policy-metadata-only")
    expect(variableCompatibility.nextRecommendedWork).toBe("Variable Schema / Data Contract Close Audit")
    expect(variableCompatibility.attachmentTarget.publishedTemplateVersionIdentity).toEqual({
      templateId: templateMetadata.acceptedVersionMetadata.templateId,
      templateVersionId: templateMetadata.acceptedVersionMetadata.templateVersionId,
      versionOrdinal: templateMetadata.acceptedVersionMetadata.versionOrdinal,
    })
    expect(variableCloseAudit).toContain(
      "The Variable Schema / Data Contract mini lane can close for a mini",
    )

    expect(measurementManifest.manifestStatus).toBe("accepted")
    expect(measurementManifest.manifestScope).toBe("minimal-accepted-subset-only")
    expect(measurementManifest.fullV1MatrixStatus).toBe("partial-not-accepted")
    expect(measurementManifest.productionReady).toBe(false)
    expect(measurementManifest.defaultMeasurerReplacement).toBe(false)
    expect(measurementManifest.productionBinding).toBe(false)
    expect(measurementCloseAudit).toContain("Decision: sufficient for mini infrastructure checkpoint.")
    expect(measurementCloseAudit).toContain("It is not enough for full v1 measurement production readiness.")
  })

  it("keeps runtime, production readiness, and schema claims blocked", () => {
    expect(vocabulary.boundaryGroups.every((group) => group.runtimeImplemented === false)).toBe(true)
    expect(vocabulary.boundaryGroups.every((group) => group.productionReadinessClaimed === false)).toBe(true)

    for (const nonWork of [
      requestEnvelope.nonWork,
      responseContract.nonWork,
      readinessPolicy.nonWork,
      placeholderPolicy.nonWork,
      vocabulary.nonWork,
      templateMetadata.nonWork,
      variableCompatibility.nonWork,
    ]) {
      expect(Object.values(nonWork)).toEqual(Object.values(nonWork).map(() => false))
    }

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("render-api")
    expect(rootScripts).not.toContain("runtime-error")
    expect(rootScripts).not.toContain("job-status")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the close decision and advances pointers to mini infrastructure close audit", () => {
    const closeAuditDoc = readText("../docs/RENDER_API_CONTRACT_CLOSE_AUDIT.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(closeAuditDoc).toContain("Status: Render API Contract Close Audit complete.")
    expect(closeAuditDoc).toContain("Decision: close Render API Contract mini lane for mini infrastructure")
    expect(closeAuditDoc).toContain("This close does not claim production Render API readiness.")
    expect(closeAuditDoc).toContain("Mini Infrastructure Close Audit.")
    expect(closeAuditDoc).toContain("Runtime Binding / Implementation Planning Gate is not selected yet")
    expect(closeAuditDoc).toContain("## PASS")
    expect(closeAuditDoc).toContain("## FAIL-BLOCKER")
    expect(closeAuditDoc).toContain("## RISK")
    expect(closeAuditDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Render API Contract Close Audit.")
    expect(currentStatus).toContain("Render API Contract Close Audit.")
    expect(currentStatus).toContain("Mini Infrastructure Close Audit.")
    expect(nextPointer).toContain("Status: current after Render API Contract Close Audit.")
    expect(nextPointer).toContain("Mini Infrastructure Close Audit.")
    expect(nextPointer).toContain("No runtime error handling.")
    expect(nextPointer).toContain("No backend production routes.")
    expect(nextPointer).toContain("No Render API runtime implementation.")
    expect(nextPointer).toContain("No durable job ids.")
    expect(nextPointer).toContain("No actual render execution.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(ledger).toContain("| 222 | Render API contract close audit | done |")
    expect(ledger).toContain("## Phase 222 Render API Contract Close Audit")
    expect(roadmap).toContain("## Phase 222: Render API Contract Close Audit")
    expect(roadmap).toContain("Current next step after Phase 222:")
    expect(roadmap).toContain("Mini Infrastructure Close Audit")
    expect(roadmap).toContain("Historical Phase 221 Handoff")
    expect(readme).toContain("Render API Contract Close Audit")
    expect(readme).toContain("docs/RENDER_API_CONTRACT_CLOSE_AUDIT.md")
  })
})
