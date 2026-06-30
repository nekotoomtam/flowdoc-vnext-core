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

type DiscoveryFixture = {
  discoveryStatus: "accepted"
  attachmentTarget: AttachmentTarget
  summary: {
    fieldRefOccurrenceCount: number
    candidateVariableCount: number
    registryFieldCount: number
    unresolvedReferenceCount: number
    unsupportedReferenceCount: number
    duplicateCandidateIdCount: number
    packageDocumentSchemaMutated: false
    renderApiContractDeferred: true
  }
  candidateVariableIds: string[]
}

type MetadataShapeFixture = {
  metadataShapeStatus: "accepted"
  attachmentTarget: AttachmentTarget
  discoverySummaryConfirmation: DiscoveryFixture["summary"]
  candidateVariableIds: string[]
}

type DataContractValidationPolicyFixture = {
  policyStatus: "accepted-vocabulary-only"
  attachmentTarget: AttachmentTarget
  candidateVariableIds: string[]
  policyDefinition: {
    acceptedValidationResultStatuses: Array<"valid" | "valid-with-warnings" | "blocked">
  }
}

type RequiredMissingDefaultValuePolicyFixture = {
  requiredMissingDefaultPolicyStatus: "accepted-policy-metadata-only"
  attachmentTarget: AttachmentTarget
  candidateVariableIds: string[]
  policyDefinition: {
    runtimeDataValidationImplemented: false
    runtimeDefaultsApplied: false
  }
}

type CompatibilityPolicyFixture = {
  compatibilityPolicyStatus: "accepted-policy-metadata-only"
  nextRecommendedWork: "Variable Schema / Data Contract Close Audit"
  attachmentTarget: AttachmentTarget
  candidateVariableIds: string[]
  compatibilityDefinition: {
    runtimeCompatibilityEnforcementImplemented: false
    runtimeDataValidationImplemented: false
    runtimeDefaultApplicationImplemented: false
    renderApiContractImplemented: false
    compatibilityStatuses: Array<"compatible" | "compatible-with-warnings" | "incompatible-blocked" | "unknown">
  }
  compatibilityDimensions: Array<{
    dimensionId: string
    [key: string]: unknown
  }>
  compatibilityScenarioPolicies: Record<
    string,
    { status: "compatible-with-warnings"; warning: string } | { status: "incompatible-blocked"; blocker: string }
  >
  blockersBeforeVariableSchemaDataContractCloseAudit: unknown[]
  routeDecisions: {
    ifCompatibilityPolicyAccepted: "Variable Schema / Data Contract Close Audit"
    ifSchemaMutationNeeded: "Template Version Schema Decision Gate"
    ifAliasesOrCompatibilityLabelsRequired: "Variable Metadata Resolution Decision Gate"
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

describe("variable schema data contract close audit", () => {
  it("confirms the accepted evidence chain and shared attachment target", () => {
    expect(discovery.discoveryStatus).toBe("accepted")
    expect(metadataShape.metadataShapeStatus).toBe("accepted")
    expect(dataPolicy.policyStatus).toBe("accepted-vocabulary-only")
    expect(requiredPolicy.requiredMissingDefaultPolicyStatus).toBe("accepted-policy-metadata-only")
    expect(compatibilityPolicy.compatibilityPolicyStatus).toBe("accepted-policy-metadata-only")
    expect(compatibilityPolicy.nextRecommendedWork).toBe("Variable Schema / Data Contract Close Audit")

    expect(metadataShape.attachmentTarget).toEqual(discovery.attachmentTarget)
    expect(dataPolicy.attachmentTarget).toEqual(discovery.attachmentTarget)
    expect(requiredPolicy.attachmentTarget).toEqual(discovery.attachmentTarget)
    expect(compatibilityPolicy.attachmentTarget).toEqual(discovery.attachmentTarget)
    expect(compatibilityPolicy.attachmentTarget.publishedTemplateVersionIdentity.templateVersionId).toBe(
      "template-product-report-vnext@v1",
    )
  })

  it("confirms candidate variables and discovery summary facts", () => {
    expect(discovery.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(metadataShape.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(dataPolicy.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(requiredPolicy.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(compatibilityPolicy.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(discovery.summary).toEqual({
      fieldRefOccurrenceCount: 11,
      candidateVariableCount: 6,
      registryFieldCount: 6,
      unresolvedReferenceCount: 0,
      unsupportedReferenceCount: 0,
      duplicateCandidateIdCount: 0,
      packageDocumentSchemaMutated: false,
      renderApiContractDeferred: true,
    })
    expect(metadataShape.discoverySummaryConfirmation).toEqual(discovery.summary)
  })

  it("confirms compatibility statuses and required policy decisions", () => {
    expect(compatibilityPolicy.compatibilityDefinition.compatibilityStatuses).toEqual([
      "compatible",
      "compatible-with-warnings",
      "incompatible-blocked",
      "unknown",
    ])

    const dimensions = new Map(
      compatibilityPolicy.compatibilityDimensions.map((dimension) => [dimension.dimensionId, dimension]),
    )

    expect(dimensions.get("published-template-version-identity-match")).toMatchObject({
      sameVersionStatus: "compatible",
      mismatchStatus: "incompatible-blocked",
      supersededStatus: "compatible-with-warnings",
    })
    expect(dimensions.get("variable-id-stability")).toMatchObject({
      knownIdChangedStatus: "incompatible-blocked",
      aliasRecordStatus: "compatible-with-warnings",
    })
    expect(dimensions.get("value-type-candidate-stability")).toMatchObject({
      changedStatus: "incompatible-blocked",
    })
    expect(dimensions.get("added-variable-behavior")).toMatchObject({
      addedOptionalStatus: "compatible-with-warnings",
      addedRequiredWithDefaultMetadataStatus: "compatible-with-warnings",
      addedRequiredWithoutDefaultMetadataStatus: "incompatible-blocked",
    })
    expect(dimensions.get("removed-variable-behavior")).toMatchObject({
      removedRequiredStatus: "incompatible-blocked",
      removedOptionalStatus: "compatible-with-warnings",
    })
    expect(dimensions.get("table-cell-context-changes")).toMatchObject({
      changedTableBoundVariableStatus: "incompatible-blocked",
    })

    expect(compatibilityPolicy.compatibilityScenarioPolicies.displayLabelOnlyChange).toEqual({
      status: "compatible-with-warnings",
      warning: "display-label-changed",
    })
    expect(compatibilityPolicy.compatibilityScenarioPolicies.addedRequiredVariableWithoutDefaultMetadata).toEqual({
      status: "incompatible-blocked",
      blocker: "required-variable-added-without-default-metadata",
    })
  })

  it("confirms deferred work and close-audit routing", () => {
    expect(compatibilityPolicy.blockersBeforeVariableSchemaDataContractCloseAudit).toEqual([])
    expect(compatibilityPolicy.routeDecisions).toEqual({
      ifCompatibilityPolicyAccepted: "Variable Schema / Data Contract Close Audit",
      ifSchemaMutationNeeded: "Template Version Schema Decision Gate",
      ifAliasesOrCompatibilityLabelsRequired: "Variable Metadata Resolution Decision Gate",
    })
    expect(compatibilityPolicy.deferredPolicyDecisions).toEqual({
      renderApiContract: "deferred",
      runtimeDataValidation: "not-implemented",
      runtimeDefaultApplication: "not-implemented",
      runtimeCompatibilityEnforcement: "not-implemented",
      fullVariableSchemaDataContract: "deferred-until-close-audit",
    })
  })

  it("keeps runtime implementation and production behavior out of scope", () => {
    expect(Object.values(compatibilityPolicy.nonWork)).toEqual(
      Object.values(compatibilityPolicy.nonWork).map(() => false),
    )

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("render-api")
    expect(rootScripts).not.toContain("runtime-validation")
    expect(rootScripts).not.toContain("compatibility-enforcement")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the close audit and advances pointers to render API planning", () => {
    const closeAuditDoc = readText("../docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(closeAuditDoc).toContain("Status: Variable Schema / Data Contract Close Audit complete.")
    expect(closeAuditDoc).toContain("fixtures/variable-compatibility-policy.v1.json")
    expect(closeAuditDoc).toContain("mini infrastructure checkpoint only")
    expect(closeAuditDoc).toContain("Render API Contract Planning Gate.")
    expect(closeAuditDoc).toContain("Variable Metadata Resolution Decision Gate")
    expect(closeAuditDoc).toContain("Template Version Schema Decision Gate")
    expect(closeAuditDoc).toContain("## PASS")
    expect(closeAuditDoc).toContain("## FAIL-BLOCKER")
    expect(closeAuditDoc).toContain("## RISK")
    expect(closeAuditDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Render API Request Envelope Contract Gate.")
    expect(currentStatus).toContain("Variable Schema / Data Contract Close Audit.")
    expect(currentStatus).toContain("Render API Contract Planning Gate.")
    expect(nextPointer).toContain("Status: current after Render API Request Envelope Contract Gate.")
    expect(nextPointer).toContain("Render API Contract Planning Gate.")
    expect(nextPointer).toContain("No runtime data validation implementation.")
    expect(nextPointer).toContain("No runtime compatibility enforcement.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(ledger).toContain("| 215 | Variable schema data contract close audit | done |")
    expect(ledger).toContain("## Phase 215 Variable Schema Data Contract Close Audit")
    expect(roadmap).toContain("## Phase 215: Variable Schema Data Contract Close Audit")
    expect(roadmap).toContain("Current next step after Phase 215:")
    expect(roadmap).toContain("Render API Contract Planning Gate")
    expect(roadmap).toContain("Historical Phase 214 Handoff")
    expect(readme).toContain("Variable Schema / Data Contract Close Audit")
    expect(readme).toContain("docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md")
  })
})
