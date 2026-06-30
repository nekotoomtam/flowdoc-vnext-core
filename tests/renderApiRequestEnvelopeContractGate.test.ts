import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type TemplateVersionIdentity = {
  templateId: "template-product-report-vnext"
  templateVersionId: "template-product-report-vnext@v1"
  versionOrdinal: 1
}

type AttachmentTarget = {
  publishedTemplateVersionIdentity: TemplateVersionIdentity
  acceptedValidationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
}

type AcceptedTemplateVersionMetadataFixture = {
  metadataStatus: "accepted"
  acceptedVersionMetadata: TemplateVersionIdentity & {
    sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
    validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
    validationEvidenceStatus: "accepted"
    measurementStatus: "mini-checkpoint-only"
  }
}

type EvidenceFixture = {
  attachmentTarget: AttachmentTarget
  candidateVariableIds: string[]
}

type RequiredMissingDefaultValuePolicyFixture = EvidenceFixture & {
  requiredMissingDefaultPolicyStatus: "accepted-policy-metadata-only"
  variableRequiredMissingDefaultPolicyRows: Array<{
    variableId: string
    valueTypeCandidate: string
    requiredStatus: "required" | "optional"
    defaultValueCandidate: string | null
    tableCellValuePolicyStatus: "table-cell-context-mismatch-blocked" | "not-table-cell-variable"
  }>
}

type CompatibilityPolicyFixture = EvidenceFixture & {
  compatibilityPolicyStatus: "accepted-policy-metadata-only"
  compatibilityDefinition: {
    runtimeCompatibilityEnforcementImplemented: false
    runtimeDataValidationImplemented: false
    runtimeDefaultApplicationImplemented: false
    renderApiContractImplemented: false
  }
}

type RenderApiRequestEnvelopeContractFixture = {
  requestEnvelopeId: "render-api-request-envelope-contract-v1"
  sourceRenderApiContractPlanningGate: "Render API Contract Planning Gate"
  sourceRenderApiContractPlanningGateStatus: "complete"
  selectedSubLane: "Render API request envelope contract"
  requestEnvelopeStatus: "accepted-contract-metadata-only"
  nextRecommendedWork: "Render API Response / Status Contract Gate"
  templateVersionIdentity: TemplateVersionIdentity
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  variableDataContractEvidencePointers: Record<string, string>
  candidateVariableIds: string[]
  requestEnvelopeContract: {
    requestEnvelopeVersion: 1
    requestEnvelopeVersionLabel: "render-api-request-envelope-v1"
    requestEnvelopeMode: "json-safe-contract-metadata-only"
    requestEnvelopeFields: string[]
    requestEnvelopeValidationStatusVocabulary: Array<
      "envelope-valid" | "envelope-valid-with-warnings" | "envelope-blocked"
    >
    malformedEnvelopeBlockerVocabulary: string[]
  }
  variablePayloadContainer: {
    containerField: "variables"
    containerShape: "json-object-keyed-by-variable-id"
    allowedVariableIds: string[]
    requiredVariableIds: string[]
    optionalVariableIds: string[]
    requiredWithoutDefaultVariableIds: string[]
    requiredWithDefaultMetadataVariableIds: string[]
    tableCellBoundVariableIds: string[]
    runtimeDefaultApplicationImplemented: false
    runtimeDataValidationImplemented: false
    variableRows: Array<{
      variableId: string
      valueTypeCandidate: string
      requiredStatus: "required" | "optional"
      defaultValueCandidate: string | null
      payloadPresencePolicy: string
      tableCellBound: boolean
      tableCellContextMismatchPolicy?: "envelope-blocked"
    }>
  }
  variablePayloadPolicyReference: {
    dataContractValidationPolicyPointer: "repo://fixtures/data-contract-validation-policy.v1.json"
    requiredMissingDefaultValuePolicyPointer: "repo://fixtures/required-missing-default-value-policy.v1.json"
    acceptedEnvelopeStatusMapping: {
      valid: "envelope-valid"
      "valid-with-warnings": "envelope-valid-with-warnings"
      blocked: "envelope-blocked"
    }
    runtimeValidationImplemented: false
    runtimeDefaultsApplied: false
  }
  compatibilityPolicyReference: {
    variableCompatibilityPolicyPointer: "repo://fixtures/variable-compatibility-policy.v1.json"
    requiredTemplateVersionId: "template-product-report-vnext@v1"
    publishedTemplateVersionMismatchStatus: "envelope-blocked"
    compatibilityPolicyContextMismatchBlocker: "compatibility-policy-context-mismatch"
    runtimeCompatibilityEnforcementImplemented: false
  }
  renderIntent: {
    intentField: "renderIntent"
    allowedIntentIds: Array<"preview" | "final">
    defaultIntentId: "preview"
    intentMode: "metadata-only"
    renderExecutionImplemented: false
  }
  correlationPolicy: {
    clientRequestIdRequired: true
    correlationIdRequired: false
    clientRequestIdFormatPolicy: "non-empty-json-string"
    invalidClientRequestIdBlocker: "invalid-client-request-id"
    runtimeCorrelationImplemented: false
  }
  idempotencyPolicy: {
    idempotencyPolicyName: "render-api-request-envelope-idempotency-v1"
    policyMode: "metadata-only"
    runtimeIdempotencyEnforcementImplemented: false
  }
  duplicateRequestPolicy: {
    duplicateRequestPolicyName: "render-api-duplicate-request-policy-v1"
    policyMode: "metadata-only"
    duplicateRequestPolicyMissingBlocker: "duplicate-request-policy-missing"
    runtimeDuplicateRequestHandlingImplemented: false
  }
  deferredContractLanes: Record<string, string>
  routeDecisions: {
    ifRequestEnvelopeContractAccepted: "Render API Response / Status Contract Gate"
    ifBackendRoutesStorageAuthOrRenderExecutionNeeded: "Dedicated Production Gate"
    ifSchemaMutationNeeded: "Template Version Schema Decision Gate"
  }
  blockersBeforeRenderApiResponseStatusContract: unknown[]
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
const discovery = readJson<EvidenceFixture>("../fixtures/variable-reference-discovery.v1.json")
const metadataShape = readJson<EvidenceFixture>("../fixtures/variable-schema-metadata-shape.v1.json")
const dataPolicy = readJson<EvidenceFixture>("../fixtures/data-contract-validation-policy.v1.json")
const requiredPolicy = readJson<RequiredMissingDefaultValuePolicyFixture>(
  "../fixtures/required-missing-default-value-policy.v1.json",
)
const compatibilityPolicy = readJson<CompatibilityPolicyFixture>(
  "../fixtures/variable-compatibility-policy.v1.json",
)
const requestEnvelope = readJson<RenderApiRequestEnvelopeContractFixture>(
  "../fixtures/render-api-request-envelope-contract.v1.json",
)

describe("render API request envelope contract gate", () => {
  it("confirms the planning gate, selected sub-lane, and accepted template target", () => {
    const planningDoc = readText("../docs/RENDER_API_CONTRACT_PLANNING_GATE.md")

    expect(planningDoc).toContain("Status: Render API Contract Planning Gate complete.")
    expect(planningDoc).toContain("Render API request envelope contract.")
    expect(requestEnvelope).toMatchObject({
      requestEnvelopeId: "render-api-request-envelope-contract-v1",
      sourceRenderApiContractPlanningGate: "Render API Contract Planning Gate",
      sourceRenderApiContractPlanningGateStatus: "complete",
      selectedSubLane: "Render API request envelope contract",
      requestEnvelopeStatus: "accepted-contract-metadata-only",
      nextRecommendedWork: "Render API Response / Status Contract Gate",
      templateVersionIdentity: {
        templateId: "template-product-report-vnext",
        templateVersionId: "template-product-report-vnext@v1",
        versionOrdinal: 1,
      },
      sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json",
      validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json",
    })
    expect(acceptedTemplateVersion.acceptedVersionMetadata.templateVersionId).toBe(
      requestEnvelope.templateVersionIdentity.templateVersionId,
    )
    expect(acceptedTemplateVersion.acceptedVersionMetadata.measurementStatus).toBe("mini-checkpoint-only")
  })

  it("confirms variable/data evidence pointers and candidate variables", () => {
    expect(requestEnvelope.variableDataContractEvidencePointers).toEqual({
      variableReferenceDiscovery: "repo://fixtures/variable-reference-discovery.v1.json",
      variableSchemaMetadataShape: "repo://fixtures/variable-schema-metadata-shape.v1.json",
      dataContractValidationPolicy: "repo://fixtures/data-contract-validation-policy.v1.json",
      requiredMissingDefaultValuePolicy: "repo://fixtures/required-missing-default-value-policy.v1.json",
      variableCompatibilityPolicy: "repo://fixtures/variable-compatibility-policy.v1.json",
    })
    expect(requestEnvelope.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(discovery.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(metadataShape.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(dataPolicy.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(requiredPolicy.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(compatibilityPolicy.candidateVariableIds).toEqual(expectedCandidateVariableIds)
    expect(discovery.attachmentTarget).toEqual(compatibilityPolicy.attachmentTarget)
    expect(requestEnvelope.templateVersionIdentity).toEqual(
      compatibilityPolicy.attachmentTarget.publishedTemplateVersionIdentity,
    )
  })

  it("defines the request envelope metadata and malformed blocker vocabulary", () => {
    expect(requestEnvelope.requestEnvelopeContract).toMatchObject({
      requestEnvelopeVersion: 1,
      requestEnvelopeVersionLabel: "render-api-request-envelope-v1",
      requestEnvelopeMode: "json-safe-contract-metadata-only",
      requestEnvelopeValidationStatusVocabulary: [
        "envelope-valid",
        "envelope-valid-with-warnings",
        "envelope-blocked",
      ],
      malformedEnvelopeBlockerVocabulary: [
        "missing-template-version-identity",
        "unknown-template-version-identity",
        "missing-variable-payload",
        "invalid-variable-payload-shape",
        "missing-variable-data-contract-evidence",
        "variable-data-contract-context-mismatch",
        "compatibility-policy-context-mismatch",
        "invalid-client-request-id",
        "duplicate-request-policy-missing",
        "schema-mutation-required",
      ],
    })
    expect(requestEnvelope.requestEnvelopeContract.requestEnvelopeFields).toEqual([
      "requestEnvelopeId",
      "requestEnvelopeVersion",
      "templateVersionIdentity",
      "sourceSnapshotRetentionPointer",
      "validationEvidencePointer",
      "variableDataContractEvidencePointers",
      "variablePayloadContainer",
      "variablePayloadPolicyReference",
      "compatibilityPolicyReference",
      "renderIntent",
      "clientRequestId",
      "correlationId",
      "idempotencyPolicyName",
      "duplicateRequestPolicyName",
    ])
  })

  it("defines the variable payload container against candidate variable policy", () => {
    expect(requestEnvelope.variablePayloadContainer).toMatchObject({
      containerField: "variables",
      containerShape: "json-object-keyed-by-variable-id",
      allowedVariableIds: expectedCandidateVariableIds,
      requiredVariableIds: ["customer.name", "report.period", "report.riskLevel", "report.total"],
      optionalVariableIds: ["customer.segment", "prepared.by"],
      requiredWithoutDefaultVariableIds: ["report.total"],
      requiredWithDefaultMetadataVariableIds: ["customer.name", "report.period", "report.riskLevel"],
      tableCellBoundVariableIds: ["report.riskLevel", "report.total"],
      runtimeDefaultApplicationImplemented: false,
      runtimeDataValidationImplemented: false,
    })
    expect(requestEnvelope.variablePayloadContainer.variableRows).toHaveLength(
      requiredPolicy.variableRequiredMissingDefaultPolicyRows.length,
    )

    requestEnvelope.variablePayloadContainer.variableRows.forEach((row) => {
      const sourceRow = requiredPolicy.variableRequiredMissingDefaultPolicyRows.find(
        (entry) => entry.variableId === row.variableId,
      )

      if (sourceRow == null) {
        throw new Error(`Missing required/missing/default source row for ${row.variableId}`)
      }

      expect(row).toMatchObject({
        variableId: sourceRow.variableId,
        valueTypeCandidate: sourceRow.valueTypeCandidate,
        requiredStatus: sourceRow.requiredStatus,
        defaultValueCandidate: sourceRow.defaultValueCandidate,
      })
    })
    expect(requestEnvelope.variablePayloadContainer.variableRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          variableId: "report.total",
          payloadPresencePolicy: "missing-required-without-default-blocked",
          tableCellBound: true,
          tableCellContextMismatchPolicy: "envelope-blocked",
        }),
        expect.objectContaining({
          variableId: "report.riskLevel",
          payloadPresencePolicy: "present-or-warning-default-metadata",
          tableCellBound: true,
          tableCellContextMismatchPolicy: "envelope-blocked",
        }),
      ]),
    )
  })

  it("defines policy references, correlation, idempotency, and deferred lanes without runtime behavior", () => {
    expect(requestEnvelope.variablePayloadPolicyReference).toEqual({
      dataContractValidationPolicyPointer: "repo://fixtures/data-contract-validation-policy.v1.json",
      requiredMissingDefaultValuePolicyPointer: "repo://fixtures/required-missing-default-value-policy.v1.json",
      acceptedEnvelopeStatusMapping: {
        valid: "envelope-valid",
        "valid-with-warnings": "envelope-valid-with-warnings",
        blocked: "envelope-blocked",
      },
      runtimeValidationImplemented: false,
      runtimeDefaultsApplied: false,
    })
    expect(requestEnvelope.compatibilityPolicyReference).toEqual({
      variableCompatibilityPolicyPointer: "repo://fixtures/variable-compatibility-policy.v1.json",
      requiredTemplateVersionId: "template-product-report-vnext@v1",
      publishedTemplateVersionMismatchStatus: "envelope-blocked",
      compatibilityPolicyContextMismatchBlocker: "compatibility-policy-context-mismatch",
      runtimeCompatibilityEnforcementImplemented: false,
    })
    expect(requestEnvelope.renderIntent).toEqual({
      intentField: "renderIntent",
      allowedIntentIds: ["preview", "final"],
      defaultIntentId: "preview",
      intentMode: "metadata-only",
      renderExecutionImplemented: false,
    })
    expect(requestEnvelope.correlationPolicy).toMatchObject({
      clientRequestIdRequired: true,
      correlationIdRequired: false,
      clientRequestIdFormatPolicy: "non-empty-json-string",
      invalidClientRequestIdBlocker: "invalid-client-request-id",
      runtimeCorrelationImplemented: false,
    })
    expect(requestEnvelope.idempotencyPolicy).toMatchObject({
      idempotencyPolicyName: "render-api-request-envelope-idempotency-v1",
      policyMode: "metadata-only",
      runtimeIdempotencyEnforcementImplemented: false,
    })
    expect(requestEnvelope.duplicateRequestPolicy).toMatchObject({
      duplicateRequestPolicyName: "render-api-duplicate-request-policy-v1",
      policyMode: "metadata-only",
      duplicateRequestPolicyMissingBlocker: "duplicate-request-policy-missing",
      runtimeDuplicateRequestHandlingImplemented: false,
    })
    expect(requestEnvelope.deferredContractLanes).toEqual({
      renderApiResponseStatusContract: "deferred-to-render-api-response-status-contract-gate",
      renderReadinessValidationPolicy: "deferred",
      artifactPointerJobStatusPlaceholderPolicy: "deferred",
      errorBlockerVocabulary: "covered-for-malformed-envelope-only",
    })
    expect(requestEnvelope.routeDecisions).toEqual({
      ifRequestEnvelopeContractAccepted: "Render API Response / Status Contract Gate",
      ifBackendRoutesStorageAuthOrRenderExecutionNeeded: "Dedicated Production Gate",
      ifSchemaMutationNeeded: "Template Version Schema Decision Gate",
    })
    expect(requestEnvelope.blockersBeforeRenderApiResponseStatusContract).toEqual([])
  })

  it("keeps runtime implementation and production behavior out of scope", () => {
    expect(Object.values(requestEnvelope.nonWork)).toEqual(
      Object.values(requestEnvelope.nonWork).map(() => false),
    )
    expect(compatibilityPolicy.compatibilityDefinition).toMatchObject({
      runtimeCompatibilityEnforcementImplemented: false,
      runtimeDataValidationImplemented: false,
      runtimeDefaultApplicationImplemented: false,
      renderApiContractImplemented: false,
    })

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

  it("documents the gate and advances pointers to response/status contract", () => {
    const envelopeDoc = readText("../docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(envelopeDoc).toContain("Status: Render API Request Envelope Contract Gate complete.")
    expect(envelopeDoc).toContain("fixtures/render-api-request-envelope-contract.v1.json")
    expect(envelopeDoc).toContain("Render API Response / Status Contract Gate.")
    expect(envelopeDoc).toContain("missing-template-version-identity")
    expect(envelopeDoc).toContain("schema-mutation-required")
    expect(envelopeDoc).toContain("No backend production routes are implemented.")
    expect(envelopeDoc).toContain("No Render API runtime is implemented.")
    expect(envelopeDoc).toContain("No runtime data validation is implemented.")
    expect(envelopeDoc).toContain("## PASS")
    expect(envelopeDoc).toContain("## FAIL-BLOCKER")
    expect(envelopeDoc).toContain("## RISK")
    expect(envelopeDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Render API Response / Status Contract Gate.")
    expect(currentStatus).toContain("Render API Request Envelope Contract Gate.")
    expect(currentStatus).toContain("Render API Response / Status Contract Gate.")
    expect(nextPointer).toContain("Status: current after Render API Response / Status Contract Gate.")
    expect(nextPointer).toContain("Render API Response / Status Contract Gate.")
    expect(nextPointer).toContain("No backend production routes.")
    expect(nextPointer).toContain("No Render API runtime implementation.")
    expect(nextPointer).toContain("No runtime data validation implementation.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(ledger).toContain("| 217 | Render API request envelope contract gate | done |")
    expect(ledger).toContain("## Phase 217 Render API Request Envelope Contract Gate")
    expect(roadmap).toContain("## Phase 217: Render API Request Envelope Contract Gate")
    expect(roadmap).toContain("Current next step after Phase 217:")
    expect(roadmap).toContain("Render API Response / Status Contract Gate")
    expect(roadmap).toContain("Historical Phase 216 Handoff")
    expect(readme).toContain("Render API Request Envelope Contract Gate")
    expect(readme).toContain("docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md")
  })
})
