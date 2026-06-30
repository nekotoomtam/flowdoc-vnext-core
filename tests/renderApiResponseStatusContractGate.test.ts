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
  nextRecommendedWork: "Render API Response / Status Contract Gate"
  templateVersionIdentity: TemplateVersionIdentity
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  variableDataContractEvidencePointers: Record<string, string>
  requestEnvelopeContract: {
    requestEnvelopeVersion: 1
    requestEnvelopeVersionLabel: "render-api-request-envelope-v1"
    requestEnvelopeValidationStatusVocabulary: Array<
      "envelope-valid" | "envelope-valid-with-warnings" | "envelope-blocked"
    >
    malformedEnvelopeBlockerVocabulary: string[]
  }
  variablePayloadContainer: {
    containerField: "variables"
    containerShape: "json-object-keyed-by-variable-id"
    requiredVariableIds: string[]
    optionalVariableIds: string[]
    tableCellBoundVariableIds: string[]
  }
  nonWork: Record<string, boolean>
}

type ResponseStatus = "accepted" | "accepted-with-warnings" | "blocked" | "deferred-job-placeholder" | "unknown"

type RenderApiResponseStatusContractFixture = {
  responseContractId: "render-api-response-status-contract-v1"
  sourceRenderApiRequestEnvelopeContractGate: "Render API Request Envelope Contract Gate"
  sourceRenderApiRequestEnvelopeContractGateStatus: "complete"
  sourceRequestEnvelopePointer: "repo://fixtures/render-api-request-envelope-contract.v1.json"
  sourceRequestEnvelopeStatus: "accepted-contract-metadata-only"
  responseContractStatus: "accepted-contract-metadata-only"
  nextRecommendedWork: "Render-Readiness Validation Policy Gate"
  requestEnvelopeReference: {
    requestEnvelopeId: "render-api-request-envelope-contract-v1"
    requestEnvelopeVersion: 1
    requestEnvelopeVersionLabel: "render-api-request-envelope-v1"
    requestEnvelopeStatus: "accepted-contract-metadata-only"
    templateVersionId: "template-product-report-vnext@v1"
  }
  templateVersionIdentity: TemplateVersionIdentity
  sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
  variableDataContractEvidencePointers: Record<string, string>
  variablePayloadConfirmation: {
    variablePayloadContainerField: "variables"
    variablePayloadContainerShape: "json-object-keyed-by-variable-id"
    requiredVariableIds: string[]
    optionalVariableIds: string[]
    tableCellBoundVariableIds: string[]
  }
  requestEnvelopeStatusVocabulary: Array<"envelope-valid" | "envelope-valid-with-warnings" | "envelope-blocked">
  responseStatusVocabulary: ResponseStatus[]
  requestStatusMapping: {
    "envelope-valid": "accepted"
    "envelope-valid-with-warnings": "accepted-with-warnings"
    "envelope-blocked": "blocked"
    unknown: "unknown"
  }
  responseShapes: {
    acceptedEnvelope: {
      responseStatus: "accepted"
      shapeMode: "metadata-only"
      warningSummary: { status: "none"; warningCodes: string[] }
      blockerSummary: { status: "none"; blockerCodes: string[] }
      renderReadinessStatus: "deferred"
      rendererArtifactBytesProduced: false
      actualRenderExecutionImplemented: false
    }
    acceptedWithWarningsEnvelope: {
      responseStatus: "accepted-with-warnings"
      shapeMode: "metadata-only"
      warningSummary: { status: "present"; warningCodesShape: "json-string-array"; warningSource: string[] }
      blockerSummary: { status: "none"; blockerCodes: string[] }
      renderReadinessStatus: "deferred"
      rendererArtifactBytesProduced: false
      actualRenderExecutionImplemented: false
    }
    blockedEnvelope: {
      responseStatus: "blocked"
      shapeMode: "metadata-only"
      blockerSummary: {
        status: "present"
        blockerCodesShape: "json-string-array"
        allowedBlockerCodes: string[]
      }
      renderReadinessStatus: "blocked-before-readiness"
      rendererArtifactBytesProduced: false
      actualRenderExecutionImplemented: false
    }
  }
  renderJobPlaceholder: {
    placeholderMode: "metadata-only"
    jobStatusPlaceholder: "deferred-job-placeholder"
    jobIdPlaceholder: null
    jobStatusLifecycleImplemented: false
    storageDurabilityClaimed: false
    backendRouteImplemented: false
  }
  artifactPointerPlaceholder: {
    placeholderMode: "metadata-only"
    artifactPointer: null
    artifactBytesProduced: false
    artifactLifecycleImplemented: false
    rendererExecutionImplemented: false
  }
  responseCorrelationFields: {
    clientRequestId: "echo-from-request-envelope"
    correlationId: "echo-if-present"
    responseId: "metadata-only-placeholder"
    runtimeCorrelationImplemented: false
  }
  responseErrorBlockerSummaryShape: {
    summaryMode: "json-safe-metadata-only"
    warningCodes: "json-string-array"
    blockerCodes: "json-string-array"
    source: string[]
    runtimeErrorHandlingImplemented: false
  }
  deferredContractLanes: Record<string, string>
  routeDecisions: {
    ifResponseStatusContractAccepted: "Render-Readiness Validation Policy Gate"
    ifBackendRoutesStorageAuthOrRenderExecutionNeeded: "Dedicated Production Gate"
    ifSchemaMutationNeeded: "Template Version Schema Decision Gate"
  }
  blockersBeforeRenderReadinessValidationPolicy: unknown[]
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

describe("render API response/status contract gate", () => {
  it("confirms the accepted request envelope source and template target", () => {
    const envelopeDoc = readText("../docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md")

    expect(envelopeDoc).toContain("Status: Render API Request Envelope Contract Gate complete.")
    expect(requestEnvelope.requestEnvelopeStatus).toBe("accepted-contract-metadata-only")
    expect(requestEnvelope.nextRecommendedWork).toBe("Render API Response / Status Contract Gate")
    expect(responseContract).toMatchObject({
      responseContractId: "render-api-response-status-contract-v1",
      sourceRenderApiRequestEnvelopeContractGate: "Render API Request Envelope Contract Gate",
      sourceRenderApiRequestEnvelopeContractGateStatus: "complete",
      sourceRequestEnvelopePointer: "repo://fixtures/render-api-request-envelope-contract.v1.json",
      sourceRequestEnvelopeStatus: "accepted-contract-metadata-only",
      responseContractStatus: "accepted-contract-metadata-only",
      nextRecommendedWork: "Render-Readiness Validation Policy Gate",
      requestEnvelopeReference: {
        requestEnvelopeId: "render-api-request-envelope-contract-v1",
        requestEnvelopeVersion: 1,
        requestEnvelopeVersionLabel: "render-api-request-envelope-v1",
        requestEnvelopeStatus: "accepted-contract-metadata-only",
        templateVersionId: "template-product-report-vnext@v1",
      },
    })
    expect(responseContract.templateVersionIdentity).toEqual(requestEnvelope.templateVersionIdentity)
    expect(responseContract.sourceSnapshotRetentionPointer).toBe(requestEnvelope.sourceSnapshotRetentionPointer)
    expect(responseContract.validationEvidencePointer).toBe(requestEnvelope.validationEvidencePointer)
    expect(responseContract.variableDataContractEvidencePointers).toEqual(
      requestEnvelope.variableDataContractEvidencePointers,
    )
  })

  it("carries the variable payload contract into response/status metadata", () => {
    expect(responseContract.variablePayloadConfirmation).toEqual({
      variablePayloadContainerField: requestEnvelope.variablePayloadContainer.containerField,
      variablePayloadContainerShape: requestEnvelope.variablePayloadContainer.containerShape,
      requiredVariableIds: ["customer.name", "report.period", "report.riskLevel", "report.total"],
      optionalVariableIds: ["customer.segment", "prepared.by"],
      tableCellBoundVariableIds: ["report.riskLevel", "report.total"],
    })
    expect(responseContract.variablePayloadConfirmation.requiredVariableIds).toEqual(
      requestEnvelope.variablePayloadContainer.requiredVariableIds,
    )
    expect(responseContract.variablePayloadConfirmation.optionalVariableIds).toEqual(
      requestEnvelope.variablePayloadContainer.optionalVariableIds,
    )
    expect(responseContract.variablePayloadConfirmation.tableCellBoundVariableIds).toEqual(
      requestEnvelope.variablePayloadContainer.tableCellBoundVariableIds,
    )
  })

  it("defines response statuses and maps envelope statuses without backend behavior", () => {
    expect(responseContract.requestEnvelopeStatusVocabulary).toEqual(
      requestEnvelope.requestEnvelopeContract.requestEnvelopeValidationStatusVocabulary,
    )
    expect(responseContract.responseStatusVocabulary).toEqual([
      "accepted",
      "accepted-with-warnings",
      "blocked",
      "deferred-job-placeholder",
      "unknown",
    ])
    expect(responseContract.requestStatusMapping).toEqual({
      "envelope-valid": "accepted",
      "envelope-valid-with-warnings": "accepted-with-warnings",
      "envelope-blocked": "blocked",
      unknown: "unknown",
    })
  })

  it("defines accepted, warning, and blocked response shapes as metadata only", () => {
    expect(responseContract.responseShapes.acceptedEnvelope).toMatchObject({
      responseStatus: "accepted",
      shapeMode: "metadata-only",
      warningSummary: { status: "none", warningCodes: [] },
      blockerSummary: { status: "none", blockerCodes: [] },
      renderReadinessStatus: "deferred",
      rendererArtifactBytesProduced: false,
      actualRenderExecutionImplemented: false,
    })
    expect(responseContract.responseShapes.acceptedWithWarningsEnvelope).toMatchObject({
      responseStatus: "accepted-with-warnings",
      shapeMode: "metadata-only",
      warningSummary: {
        status: "present",
        warningCodesShape: "json-string-array",
        warningSource: ["request-envelope", "variable-data-contract", "compatibility-policy"],
      },
      blockerSummary: { status: "none", blockerCodes: [] },
      renderReadinessStatus: "deferred",
      rendererArtifactBytesProduced: false,
      actualRenderExecutionImplemented: false,
    })
    expect(responseContract.responseShapes.blockedEnvelope).toMatchObject({
      responseStatus: "blocked",
      shapeMode: "metadata-only",
      blockerSummary: {
        status: "present",
        blockerCodesShape: "json-string-array",
      },
      renderReadinessStatus: "blocked-before-readiness",
      rendererArtifactBytesProduced: false,
      actualRenderExecutionImplemented: false,
    })
    expect(responseContract.responseShapes.blockedEnvelope.blockerSummary.allowedBlockerCodes).toEqual(
      expect.arrayContaining(requestEnvelope.requestEnvelopeContract.malformedEnvelopeBlockerVocabulary),
    )
  })

  it("keeps job status and artifact pointer as placeholders only", () => {
    expect(responseContract.renderJobPlaceholder).toEqual({
      placeholderMode: "metadata-only",
      jobStatusPlaceholder: "deferred-job-placeholder",
      jobIdPlaceholder: null,
      jobStatusLifecycleImplemented: false,
      storageDurabilityClaimed: false,
      backendRouteImplemented: false,
    })
    expect(responseContract.artifactPointerPlaceholder).toEqual({
      placeholderMode: "metadata-only",
      artifactPointer: null,
      artifactBytesProduced: false,
      artifactLifecycleImplemented: false,
      rendererExecutionImplemented: false,
    })
    expect(responseContract.responseCorrelationFields).toEqual({
      clientRequestId: "echo-from-request-envelope",
      correlationId: "echo-if-present",
      responseId: "metadata-only-placeholder",
      runtimeCorrelationImplemented: false,
    })
    expect(responseContract.responseErrorBlockerSummaryShape).toMatchObject({
      summaryMode: "json-safe-metadata-only",
      warningCodes: "json-string-array",
      blockerCodes: "json-string-array",
      runtimeErrorHandlingImplemented: false,
    })
  })

  it("routes next work to render-readiness and preserves all hard limits", () => {
    expect(responseContract.deferredContractLanes).toEqual({
      renderReadinessValidationPolicy: "deferred-to-render-readiness-validation-policy-gate",
      artifactPointerJobStatusLifecycle: "deferred-beyond-metadata-placeholder",
      backendProductionRoutes: "deferred",
      productionStorageDurability: "deferred",
      authAuthz: "deferred",
      rendererArtifactBytes: "deferred",
      actualRenderExecution: "deferred",
    })
    expect(responseContract.routeDecisions).toEqual({
      ifResponseStatusContractAccepted: "Render-Readiness Validation Policy Gate",
      ifBackendRoutesStorageAuthOrRenderExecutionNeeded: "Dedicated Production Gate",
      ifSchemaMutationNeeded: "Template Version Schema Decision Gate",
    })
    expect(responseContract.blockersBeforeRenderReadinessValidationPolicy).toEqual([])
    expect(Object.values(responseContract.nonWork)).toEqual(
      Object.values(responseContract.nonWork).map(() => false),
    )
    expect(Object.values(requestEnvelope.nonWork)).toEqual(Object.values(requestEnvelope.nonWork).map(() => false))

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("render-api")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to render-readiness validation", () => {
    const responseDoc = readText("../docs/RENDER_API_RESPONSE_STATUS_CONTRACT_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(responseDoc).toContain("Status: Render API Response / Status Contract Gate complete.")
    expect(responseDoc).toContain("fixtures/render-api-response-status-contract.v1.json")
    expect(responseDoc).toContain("Render-Readiness Validation Policy Gate.")
    expect(responseDoc).toContain("No backend production routes are implemented.")
    expect(responseDoc).toContain("No Render API runtime is implemented.")
    expect(responseDoc).toContain("No actual render execution is implemented.")
    expect(responseDoc).toContain("## PASS")
    expect(responseDoc).toContain("## FAIL-BLOCKER")
    expect(responseDoc).toContain("## RISK")
    expect(responseDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Render API Response / Status Contract Gate.")
    expect(currentStatus).toContain("Render API Response / Status Contract Gate.")
    expect(currentStatus).toContain("Render-Readiness Validation Policy Gate.")
    expect(nextPointer).toContain("Status: current after Render API Response / Status Contract Gate.")
    expect(nextPointer).toContain("Render-Readiness Validation Policy Gate.")
    expect(nextPointer).toContain("No backend production routes.")
    expect(nextPointer).toContain("No Render API runtime implementation.")
    expect(nextPointer).toContain("No actual render execution.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(ledger).toContain("| 218 | Render API response status contract gate | done |")
    expect(ledger).toContain("## Phase 218 Render API Response Status Contract Gate")
    expect(roadmap).toContain("## Phase 218: Render API Response Status Contract Gate")
    expect(roadmap).toContain("Current next step after Phase 218:")
    expect(roadmap).toContain("Render-Readiness Validation Policy Gate")
    expect(roadmap).toContain("Historical Phase 217 Handoff")
    expect(readme).toContain("Render API Response / Status Contract Gate")
    expect(readme).toContain("docs/RENDER_API_RESPONSE_STATUS_CONTRACT_GATE.md")
  })
})
