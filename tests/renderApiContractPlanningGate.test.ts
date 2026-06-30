import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type AttachmentTarget = {
  publishedTemplateVersionIdentity: {
    templateId: "template-product-report-vnext"
    templateVersionId: "template-product-report-vnext@v1"
    versionOrdinal: 1
  }
  acceptedValidationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
}

type AcceptedTemplateVersionMetadataFixture = {
  metadataStatus: "accepted"
  acceptedVersionMetadata: {
    templateId: "template-product-report-vnext"
    templateVersionId: "template-product-report-vnext@v1"
    versionOrdinal: 1
    sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
    validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
    validationEvidenceStatus: "accepted"
    measurementStatus: "mini-checkpoint-only"
  }
  immutabilityRules: {
    acceptedTemplateVersionIdImmutable: true
    acceptedSourceSnapshotRetentionPointerImmutable: true
    acceptedValidationEvidencePointerImmutable: true
    packageDocumentSchemaMutated: false
  }
}

type DiscoveryFixture = {
  discoveryStatus: "accepted"
  attachmentTarget: AttachmentTarget
  candidateVariableIds: string[]
}

type MetadataShapeFixture = {
  metadataShapeStatus: "accepted"
  attachmentTarget: AttachmentTarget
  candidateVariableIds: string[]
}

type DataContractValidationPolicyFixture = {
  policyStatus: "accepted-vocabulary-only"
  attachmentTarget: AttachmentTarget
  candidateVariableIds: string[]
}

type RequiredMissingDefaultValuePolicyFixture = {
  requiredMissingDefaultPolicyStatus: "accepted-policy-metadata-only"
  attachmentTarget: AttachmentTarget
  candidateVariableIds: string[]
}

type CompatibilityPolicyFixture = {
  compatibilityPolicyStatus: "accepted-policy-metadata-only"
  attachmentTarget: AttachmentTarget
  candidateVariableIds: string[]
  compatibilityDefinition: {
    runtimeCompatibilityEnforcementImplemented: false
    runtimeDataValidationImplemented: false
    runtimeDefaultApplicationImplemented: false
    renderApiContractImplemented: false
  }
  deferredPolicyDecisions: {
    renderApiContract: "deferred"
    runtimeDataValidation: "not-implemented"
    runtimeDefaultApplication: "not-implemented"
    runtimeCompatibilityEnforcement: "not-implemented"
    fullVariableSchemaDataContract: "deferred-until-close-audit"
  }
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

const expectedCandidateVariableIds = [
  "customer.name",
  "customer.segment",
  "prepared.by",
  "report.period",
  "report.riskLevel",
  "report.total",
]

const acceptedTemplateVersion = readJson<AcceptedTemplateVersionMetadataFixture>(
  "../fixtures/template-publish-accepted-version-metadata.v1.json",
)
const discovery = readJson<DiscoveryFixture>("../fixtures/variable-reference-discovery.v1.json")
const metadataShape = readJson<MetadataShapeFixture>("../fixtures/variable-schema-metadata-shape.v1.json")
const dataPolicy = readJson<DataContractValidationPolicyFixture>(
  "../fixtures/data-contract-validation-policy.v1.json",
)
const requiredPolicy = readJson<RequiredMissingDefaultValuePolicyFixture>(
  "../fixtures/required-missing-default-value-policy.v1.json",
)
const compatibilityPolicy = readJson<CompatibilityPolicyFixture>(
  "../fixtures/variable-compatibility-policy.v1.json",
)

describe("render API contract planning gate", () => {
  it("confirms the closed variable/data lane and accepted template version target", () => {
    expect(acceptedTemplateVersion.metadataStatus).toBe("accepted")
    expect(acceptedTemplateVersion.acceptedVersionMetadata).toMatchObject({
      templateId: "template-product-report-vnext",
      templateVersionId: "template-product-report-vnext@v1",
      versionOrdinal: 1,
      sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json",
      validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json",
      validationEvidenceStatus: "accepted",
      measurementStatus: "mini-checkpoint-only",
    })
    expect(acceptedTemplateVersion.immutabilityRules).toMatchObject({
      acceptedTemplateVersionIdImmutable: true,
      acceptedSourceSnapshotRetentionPointerImmutable: true,
      acceptedValidationEvidencePointerImmutable: true,
      packageDocumentSchemaMutated: false,
    })

    const closeAuditDoc = readText("../docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md")
    expect(closeAuditDoc).toContain("Status: Variable Schema / Data Contract Close Audit complete.")
    expect(closeAuditDoc).toContain("Close scope: mini infrastructure checkpoint only.")
    expect(closeAuditDoc).toContain("Render API Contract Planning Gate.")
  })

  it("confirms the accepted variable/data evidence chain and candidate variables", () => {
    expect(discovery.discoveryStatus).toBe("accepted")
    expect(metadataShape.metadataShapeStatus).toBe("accepted")
    expect(dataPolicy.policyStatus).toBe("accepted-vocabulary-only")
    expect(requiredPolicy.requiredMissingDefaultPolicyStatus).toBe("accepted-policy-metadata-only")
    expect(compatibilityPolicy.compatibilityPolicyStatus).toBe("accepted-policy-metadata-only")

    expect(discovery.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(metadataShape.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(dataPolicy.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(requiredPolicy.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(compatibilityPolicy.candidateVariableIds).toEqual(expectedCandidateVariableIds)

    expect(discovery.attachmentTarget).toEqual(compatibilityPolicy.attachmentTarget)
    expect(metadataShape.attachmentTarget).toEqual(compatibilityPolicy.attachmentTarget)
    expect(dataPolicy.attachmentTarget).toEqual(compatibilityPolicy.attachmentTarget)
    expect(requiredPolicy.attachmentTarget).toEqual(compatibilityPolicy.attachmentTarget)
    expect(compatibilityPolicy.attachmentTarget.publishedTemplateVersionIdentity.templateVersionId).toBe(
      "template-product-report-vnext@v1",
    )
  })

  it("confirms runtime validation, defaults, compatibility enforcement, and render API stay deferred", () => {
    expect(compatibilityPolicy.compatibilityDefinition).toMatchObject({
      runtimeCompatibilityEnforcementImplemented: false,
      runtimeDataValidationImplemented: false,
      runtimeDefaultApplicationImplemented: false,
      renderApiContractImplemented: false,
    })
    expect(compatibilityPolicy.deferredPolicyDecisions).toEqual({
      renderApiContract: "deferred",
      runtimeDataValidation: "not-implemented",
      runtimeDefaultApplication: "not-implemented",
      runtimeCompatibilityEnforcement: "not-implemented",
      fullVariableSchemaDataContract: "deferred-until-close-audit",
    })
    expect(Object.values(compatibilityPolicy.nonWork)).toEqual(
      Object.values(compatibilityPolicy.nonWork).map(() => false),
    )
  })

  it("documents ranked sub-lanes and selects request envelope first", () => {
    const planningDoc = readText("../docs/RENDER_API_CONTRACT_PLANNING_GATE.md")

    expect(planningDoc).toContain("Status: Render API Contract Planning Gate complete.")
    expect(planningDoc).toContain("Variable Schema / Data Contract Close Audit is complete.")
    expect(planningDoc).toContain("template-product-report-vnext@v1")
    expect(planningDoc).toContain("1. Render API request envelope contract.")
    expect(planningDoc).toContain("2. Render API response/status contract.")
    expect(planningDoc).toContain("3. Render-readiness validation policy.")
    expect(planningDoc).toContain("4. Artifact pointer / job status placeholder policy.")
    expect(planningDoc).toContain("5. Error/blocker vocabulary.")
    expect(planningDoc).toContain("Render API request envelope contract.")
    expect(planningDoc).toContain("Render API Request Envelope Contract Gate.")
    expect(planningDoc).toContain("request envelope id and version")
    expect(planningDoc).toContain("variable payload container shape")
    expect(planningDoc).toContain("explicit deferral of runtime validation")
    expect(planningDoc).toContain("## PASS")
    expect(planningDoc).toContain("## FAIL-BLOCKER")
    expect(planningDoc).toContain("## RISK")
    expect(planningDoc).toContain("## UNKNOWN")
  })

  it("keeps runtime implementation, routes, artifact bytes, and production behavior out of scope", () => {
    const planningDoc = readText("../docs/RENDER_API_CONTRACT_PLANNING_GATE.md")
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(planningDoc).toContain("No backend production routes are implemented.")
    expect(planningDoc).toContain("No Render API runtime is implemented.")
    expect(planningDoc).toContain("No renderer artifact bytes are produced.")
    expect(planningDoc).toContain("No runtime data validation is implemented.")
    expect(planningDoc).toContain("No defaults are applied at runtime.")
    expect(planningDoc).toContain("No runtime compatibility enforcement is implemented.")
    expect(planningDoc).toContain("No package/document schema mutation is made.")
    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("render-api")
    expect(rootScripts).not.toContain("runtime-validation")
    expect(rootScripts).not.toContain("compatibility-enforcement")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("updates status, next pointer, ledger, roadmap, and README", () => {
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(currentStatus).toContain("Status: updated after Render-Readiness Validation Policy Gate.")
    expect(currentStatus).toContain("Render API Contract Planning Gate.")
    expect(currentStatus).toContain("Render API Request Envelope Contract Gate.")
    expect(nextPointer).toContain("Status: current after Render-Readiness Validation Policy Gate.")
    expect(nextPointer).toContain("Render API Request Envelope Contract Gate.")
    expect(nextPointer).toContain("No backend production routes.")
    expect(nextPointer).toContain("No Render API runtime implementation.")
    expect(nextPointer).toContain("No renderer artifact bytes.")
    expect(nextPointer).toContain("No runtime data validation implementation.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(ledger).toContain("| 216 | Render API contract planning gate | done |")
    expect(ledger).toContain("## Phase 216 Render API Contract Planning Gate")
    expect(roadmap).toContain("## Phase 216: Render API Contract Planning Gate")
    expect(roadmap).toContain("Current next step after Phase 216:")
    expect(roadmap).toContain("Render API Request Envelope Contract Gate")
    expect(roadmap).toContain("Historical Phase 215 Handoff")
    expect(readme).toContain("Render API Contract Planning Gate")
    expect(readme).toContain("docs/RENDER_API_CONTRACT_PLANNING_GATE.md")
  })
})
