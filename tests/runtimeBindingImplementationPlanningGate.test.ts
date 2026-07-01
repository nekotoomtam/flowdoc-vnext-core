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
  variableDataContractEvidencePointers: {
    variableReferenceDiscovery: string
    variableSchemaMetadataShape: string
    dataContractValidationPolicy: string
    requiredMissingDefaultValuePolicy: string
    variableCompatibilityPolicy: string
  }
  requestEnvelopeContract: {
    requestEnvelopeVersion: 1
    requestEnvelopeValidationStatusVocabulary: string[]
    malformedEnvelopeBlockerVocabulary: string[]
  }
  variablePayloadContainer: {
    containerField: "variables"
    containerShape: "json-object-keyed-by-variable-id"
    allowedVariableIds: string[]
    requiredVariableIds: string[]
    optionalVariableIds: string[]
    tableCellBoundVariableIds: string[]
    runtimeDefaultApplicationImplemented: false
    runtimeDataValidationImplemented: false
  }
  nonWork: Record<string, boolean>
}

type AcceptedTemplateMetadataFixture = {
  metadataStatus: "accepted"
  acceptedVersionMetadata: TemplateVersionIdentity & {
    sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
    validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
    measurementStatus: "mini-checkpoint-only"
  }
}

type VariableCompatibilityPolicyFixture = {
  compatibilityPolicyStatus: "accepted-policy-metadata-only"
  attachmentTarget: {
    publishedTemplateVersionIdentity: TemplateVersionIdentity
  }
  compatibilityDefinition: {
    runtimeCompatibilityEnforcementImplemented: false
    runtimeDataValidationImplemented: false
    runtimeDefaultApplicationImplemented: false
    renderApiContractImplemented: false
  }
}

type RenderApiErrorBlockerVocabularyFixture = {
  errorBlockerVocabularyStatus: "accepted-vocabulary-metadata-only"
  templateVersionIdentity: TemplateVersionIdentity
  boundaryGroups: Array<{
    runtimeImplemented: false
    productionReadinessClaimed: false
  }>
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

const requestEnvelope = readJson<RequestEnvelopeFixture>(
  "../fixtures/render-api-request-envelope-contract.v1.json",
)
const templateMetadata = readJson<AcceptedTemplateMetadataFixture>(
  "../fixtures/template-publish-accepted-version-metadata.v1.json",
)
const variableCompatibility = readJson<VariableCompatibilityPolicyFixture>(
  "../fixtures/variable-compatibility-policy.v1.json",
)
const renderVocabulary = readJson<RenderApiErrorBlockerVocabularyFixture>(
  "../fixtures/render-api-error-blocker-vocabulary.v1.json",
)

describe("runtime binding implementation planning gate", () => {
  it("confirms the mini infrastructure source and request envelope inputs", () => {
    const miniCloseAudit = readText("../docs/MINI_INFRASTRUCTURE_CLOSE_AUDIT.md")

    expect(miniCloseAudit).toContain("Status: Mini Infrastructure Close Audit complete.")
    expect(miniCloseAudit).toContain("Decision: close mini infrastructure checkpoint.")
    expect(miniCloseAudit).toContain("Selected next lane: Runtime Binding / Implementation Planning Gate.")

    expect(requestEnvelope.requestEnvelopeId).toBe("render-api-request-envelope-contract-v1")
    expect(requestEnvelope.requestEnvelopeStatus).toBe("accepted-contract-metadata-only")
    expect(requestEnvelope.requestEnvelopeContract.requestEnvelopeVersion).toBe(1)
    expect(requestEnvelope.templateVersionIdentity).toEqual({
      templateId: "template-product-report-vnext",
      templateVersionId: "template-product-report-vnext@v1",
      versionOrdinal: 1,
    })
    expect(requestEnvelope.sourceSnapshotRetentionPointer).toBe(
      templateMetadata.acceptedVersionMetadata.sourceSnapshotRetentionPointer,
    )
    expect(requestEnvelope.validationEvidencePointer).toBe(
      templateMetadata.acceptedVersionMetadata.validationEvidencePointer,
    )
    expect(templateMetadata.metadataStatus).toBe("accepted")
    expect(templateMetadata.acceptedVersionMetadata.measurementStatus).toBe("mini-checkpoint-only")
    expect(variableCompatibility.compatibilityPolicyStatus).toBe("accepted-policy-metadata-only")
    expect(variableCompatibility.attachmentTarget.publishedTemplateVersionIdentity).toEqual(
      requestEnvelope.templateVersionIdentity,
    )
    expect(renderVocabulary.errorBlockerVocabularyStatus).toBe("accepted-vocabulary-metadata-only")
    expect(renderVocabulary.templateVersionIdentity).toEqual(requestEnvelope.templateVersionIdentity)
  })

  it("selects request envelope runtime binding as the first implementation lane", () => {
    const planningDoc = readText("../docs/RUNTIME_BINDING_IMPLEMENTATION_PLANNING_GATE.md")

    expect(planningDoc).toContain("Status: Runtime Binding / Implementation Planning Gate complete.")
    expect(planningDoc).toContain("1. Render API request envelope runtime binding.")
    expect(planningDoc).toContain("2. Variable payload validation runtime.")
    expect(planningDoc).toContain("3. Render-readiness runtime evaluator.")
    expect(planningDoc).toContain("4. Response/error runtime mapper.")
    expect(planningDoc).toContain("Selected first implementation lane: Render API Request Envelope Runtime")
    expect(planningDoc).toContain("Binding Gate.")
    expect(planningDoc).toContain("First implementation phase:")
    expect(planningDoc).toContain("Render API Request Envelope Runtime Binding Gate")
    expect(planningDoc).toContain("package-local/core request envelope metadata validator")
    expect(planningDoc).toContain("Stop and route to a decision gate if:")
    expect(planningDoc).toContain("## PASS")
    expect(planningDoc).toContain("## FAIL-BLOCKER")
    expect(planningDoc).toContain("## RISK")
    expect(planningDoc).toContain("## UNKNOWN")
  })

  it("keeps the selected first lane bounded to envelope shape and metadata", () => {
    expect(requestEnvelope.variablePayloadContainer.containerField).toBe("variables")
    expect(requestEnvelope.variablePayloadContainer.containerShape).toBe(
      "json-object-keyed-by-variable-id",
    )
    expect(requestEnvelope.variablePayloadContainer.allowedVariableIds).toEqual([
      "customer.name",
      "customer.segment",
      "prepared.by",
      "report.period",
      "report.riskLevel",
      "report.total",
    ])
    expect(requestEnvelope.variablePayloadContainer.requiredVariableIds).toEqual([
      "customer.name",
      "report.period",
      "report.riskLevel",
      "report.total",
    ])
    expect(requestEnvelope.variablePayloadContainer.optionalVariableIds).toEqual([
      "customer.segment",
      "prepared.by",
    ])
    expect(requestEnvelope.variablePayloadContainer.tableCellBoundVariableIds).toEqual([
      "report.riskLevel",
      "report.total",
    ])
    expect(requestEnvelope.requestEnvelopeContract.requestEnvelopeValidationStatusVocabulary).toEqual([
      "envelope-valid",
      "envelope-valid-with-warnings",
      "envelope-blocked",
    ])
    expect(requestEnvelope.requestEnvelopeContract.malformedEnvelopeBlockerVocabulary).toContain(
      "missing-template-version-identity",
    )
    expect(requestEnvelope.requestEnvelopeContract.malformedEnvelopeBlockerVocabulary).toContain(
      "invalid-variable-payload-shape",
    )
  })

  it("keeps runtime, backend, renderer, storage, auth, and schema work out of scope", () => {
    expect(requestEnvelope.variablePayloadContainer.runtimeDataValidationImplemented).toBe(false)
    expect(requestEnvelope.variablePayloadContainer.runtimeDefaultApplicationImplemented).toBe(false)
    expect(variableCompatibility.compatibilityDefinition.runtimeCompatibilityEnforcementImplemented).toBe(false)
    expect(variableCompatibility.compatibilityDefinition.runtimeDataValidationImplemented).toBe(false)
    expect(variableCompatibility.compatibilityDefinition.runtimeDefaultApplicationImplemented).toBe(false)
    expect(variableCompatibility.compatibilityDefinition.renderApiContractImplemented).toBe(false)
    expect(renderVocabulary.boundaryGroups.every((group) => group.runtimeImplemented === false)).toBe(true)
    expect(renderVocabulary.boundaryGroups.every((group) => group.productionReadinessClaimed === false)).toBe(true)

    for (const nonWork of [requestEnvelope.nonWork, renderVocabulary.nonWork]) {
      expect(Object.values(nonWork)).toEqual(Object.values(nonWork).map(() => false))
    }

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("render-api-runtime")
    expect(rootScripts).not.toContain("backend-route")
    expect(rootScripts).not.toContain("runtime-binding")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the handoff and advances pointers to request envelope runtime binding", () => {
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(currentStatus).toContain("Status: updated after Runtime Binding / Implementation Planning Gate.")
    expect(currentStatus).toContain("Runtime Binding / Implementation Planning Gate.")
    expect(currentStatus).toContain("Render API Request Envelope Runtime Binding Gate.")
    expect(currentStatus).toContain(
      "Historical current-status marker retained for pointer guards: Status: updated after Mini Infrastructure Close Audit.",
    )

    expect(nextPointer).toContain("Status: current after Runtime Binding / Implementation Planning Gate.")
    expect(nextPointer).toContain("Render API Request Envelope Runtime Binding Gate.")
    expect(nextPointer).toContain("docs/RUNTIME_BINDING_IMPLEMENTATION_PLANNING_GATE.md")
    expect(nextPointer).toContain("No backend production routes.")
    expect(nextPointer).toContain("No renderer artifact bytes.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(nextPointer).toContain(
      "Historical next-pointer marker retained for pointer guards: Status: current after Mini Infrastructure Close Audit.",
    )

    expect(ledger).toContain("| 224 | Runtime binding implementation planning gate | done |")
    expect(ledger).toContain("## Phase 224 Runtime Binding Implementation Planning Gate")
    expect(ledger).toContain("Next recommended work: Render API Request Envelope Runtime Binding Gate.")

    expect(roadmap).toContain("## Phase 224: Runtime Binding / Implementation Planning Gate")
    expect(roadmap).toContain("Current next step after Phase 224:")
    expect(roadmap).toContain("Render API Request Envelope Runtime Binding Gate")
    expect(roadmap).toContain("Historical Phase 223 Handoff")

    expect(readme).toContain("Runtime Binding / Implementation Planning Gate")
    expect(readme).toContain("docs/RUNTIME_BINDING_IMPLEMENTATION_PLANNING_GATE.md")
    expect(readme).toContain("Render API Request Envelope Runtime Binding Gate")
  })
})
