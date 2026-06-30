import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type TemplateVersionIdentity = {
  templateId: "template-product-report-vnext"
  templateVersionId: "template-product-report-vnext@v1"
  versionOrdinal: 1
}

type AcceptedMeasurementManifest = {
  manifestStatus: "accepted"
  manifestScope: "minimal-accepted-subset-only"
  fullV1MatrixStatus: "partial-not-accepted"
  productionReady: false
  defaultMeasurerReplacement: false
  productionBinding: false
  digestIdentity: {
    status: "pinned"
  }
  statusSummary: {
    digestIdentity: "pinned"
    nativeEvidence: "summary-metadata-present"
    wasmEvidence: "summary-metadata-present"
    nativeWasmParity: "matching-summary-metadata"
    rendererBackedDrift: "summary-metadata-present"
    numericThresholdPolicy: "accepted-policy"
    retentionPointers: "present"
  }
}

type AcceptedTemplateMetadataFixture = {
  metadataStatus: "accepted"
  acceptedVersionMetadata: TemplateVersionIdentity & {
    measurementStatus: "mini-checkpoint-only"
    validationEvidenceStatus: "accepted"
    exportReadinessStatus: "ready-with-warnings"
    exportReadinessWarningCount: 1
  }
  metadataRepresentation: {
    representedWithoutSchemaChanges: boolean
  }
  nonWork: Record<string, boolean>
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
    compatibilityStatuses: string[]
  }
  candidateVariableIds: string[]
  nonWork: Record<string, boolean>
}

type RenderApiErrorBlockerVocabularyFixture = {
  errorBlockerVocabularyStatus: "accepted-vocabulary-metadata-only"
  nextRecommendedWork: "Render API Contract Close Audit"
  templateVersionIdentity: TemplateVersionIdentity
  boundaryGroups: Array<{
    boundary: string
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

const measurementManifest = readJson<AcceptedMeasurementManifest>(
  "../fixtures/measurement-evidence-summary-manifest.accepted.v1.json",
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

describe("mini infrastructure close audit", () => {
  it("confirms all four prerequisite mini-lane close audits", () => {
    const measurementCloseAudit = readText("../docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md")
    const templateCloseAudit = readText("../docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md")
    const variableCloseAudit = readText("../docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md")
    const renderApiCloseAudit = readText("../docs/RENDER_API_CONTRACT_CLOSE_AUDIT.md")

    expect(measurementCloseAudit).toContain("Status: Measurement Hardening Close Audit complete.")
    expect(measurementCloseAudit).toContain("Decision: sufficient for mini infrastructure checkpoint.")
    expect(measurementCloseAudit).toContain("It is not enough for full v1 measurement production readiness.")

    expect(templateCloseAudit).toContain("Status: Template Publish Close Audit complete.")
    expect(templateCloseAudit).toContain("Decision: close Template Publish mini lane for mini infrastructure checkpoint only.")

    expect(variableCloseAudit).toContain("Status: Variable Schema / Data Contract Close Audit complete.")
    expect(variableCloseAudit).toContain(
      "The Variable Schema / Data Contract mini lane can close for a mini",
    )

    expect(renderApiCloseAudit).toContain("Status: Render API Contract Close Audit complete.")
    expect(renderApiCloseAudit).toContain("Decision: close Render API Contract mini lane for mini infrastructure")
    expect(renderApiCloseAudit).toContain("This close does not claim production Render API readiness.")
  })

  it("confirms shared accepted template/version target and checkpoint evidence", () => {
    const expectedTemplateVersion: TemplateVersionIdentity = {
      templateId: "template-product-report-vnext",
      templateVersionId: "template-product-report-vnext@v1",
      versionOrdinal: 1,
    }

    expect(templateMetadata.metadataStatus).toBe("accepted")
    expect(templateMetadata.acceptedVersionMetadata).toMatchObject(expectedTemplateVersion)
    expect(templateMetadata.acceptedVersionMetadata.validationEvidenceStatus).toBe("accepted")
    expect(templateMetadata.acceptedVersionMetadata.exportReadinessStatus).toBe("ready-with-warnings")
    expect(templateMetadata.acceptedVersionMetadata.exportReadinessWarningCount).toBe(1)
    expect(templateMetadata.acceptedVersionMetadata.measurementStatus).toBe("mini-checkpoint-only")
    expect(templateMetadata.metadataRepresentation.representedWithoutSchemaChanges).toBe(true)

    expect(variableCompatibility.compatibilityPolicyStatus).toBe("accepted-policy-metadata-only")
    expect(variableCompatibility.attachmentTarget.publishedTemplateVersionIdentity).toEqual(
      expectedTemplateVersion,
    )
    expect(variableCompatibility.candidateVariableIds).toEqual([
      "customer.name",
      "customer.segment",
      "prepared.by",
      "report.period",
      "report.riskLevel",
      "report.total",
    ])
    expect(variableCompatibility.compatibilityDefinition.compatibilityStatuses).toEqual([
      "compatible",
      "compatible-with-warnings",
      "incompatible-blocked",
      "unknown",
    ])

    expect(renderVocabulary.errorBlockerVocabularyStatus).toBe("accepted-vocabulary-metadata-only")
    expect(renderVocabulary.nextRecommendedWork).toBe("Render API Contract Close Audit")
    expect(renderVocabulary.templateVersionIdentity).toEqual(expectedTemplateVersion)
  })

  it("keeps measurement and runtime production readiness blocked", () => {
    expect(measurementManifest.manifestStatus).toBe("accepted")
    expect(measurementManifest.manifestScope).toBe("minimal-accepted-subset-only")
    expect(measurementManifest.fullV1MatrixStatus).toBe("partial-not-accepted")
    expect(measurementManifest.productionReady).toBe(false)
    expect(measurementManifest.defaultMeasurerReplacement).toBe(false)
    expect(measurementManifest.productionBinding).toBe(false)
    expect(measurementManifest.digestIdentity.status).toBe("pinned")
    expect(measurementManifest.statusSummary).toMatchObject({
      digestIdentity: "pinned",
      nativeEvidence: "summary-metadata-present",
      wasmEvidence: "summary-metadata-present",
      nativeWasmParity: "matching-summary-metadata",
      rendererBackedDrift: "summary-metadata-present",
      numericThresholdPolicy: "accepted-policy",
      retentionPointers: "present",
    })

    expect(renderVocabulary.boundaryGroups.every((group) => group.runtimeImplemented === false)).toBe(true)
    expect(renderVocabulary.boundaryGroups.every((group) => group.productionReadinessClaimed === false)).toBe(true)

    for (const nonWork of [
      templateMetadata.nonWork,
      variableCompatibility.nonWork,
      renderVocabulary.nonWork,
    ]) {
      expect(Object.values(nonWork)).toEqual(Object.values(nonWork).map(() => false))
    }
  })

  it("documents checkpoint closure and advances pointers to runtime binding planning", () => {
    const closeAuditDoc = readText("../docs/MINI_INFRASTRUCTURE_CLOSE_AUDIT.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(closeAuditDoc).toContain("Status: Mini Infrastructure Close Audit complete.")
    expect(closeAuditDoc).toContain("Decision: close mini infrastructure checkpoint.")
    expect(closeAuditDoc).toContain("Selected next lane: Runtime Binding / Implementation Planning Gate.")
    expect(closeAuditDoc).toContain("Runtime Binding / Implementation Planning Gate is planning-only.")
    expect(closeAuditDoc).toContain("No backend production routes.")
    expect(closeAuditDoc).toContain("No Render API runtime implementation.")
    expect(closeAuditDoc).toContain("No package/document schema mutation.")
    expect(closeAuditDoc).toContain("No full measurement production readiness claim.")
    expect(closeAuditDoc).toContain("## PASS")
    expect(closeAuditDoc).toContain("## FAIL-BLOCKER")
    expect(closeAuditDoc).toContain("## RISK")
    expect(closeAuditDoc).toContain("## UNKNOWN")

    expect(currentStatus).toContain("Status: updated after Mini Infrastructure Close Audit.")
    expect(currentStatus).toContain("Mini Infrastructure Close Audit.")
    expect(currentStatus).toContain("Runtime Binding / Implementation Planning Gate.")
    expect(currentStatus).toContain(
      "Historical current-status marker retained for pointer guards: Status: updated after Render API Contract Close Audit.",
    )

    expect(nextPointer).toContain("Status: current after Mini Infrastructure Close Audit.")
    expect(nextPointer).toContain("Runtime Binding / Implementation Planning Gate.")
    expect(nextPointer).toContain("No runtime binding implementation.")
    expect(nextPointer).toContain("No backend production routes.")
    expect(nextPointer).toContain("No Render API runtime implementation.")
    expect(nextPointer).toContain("No durable job ids.")
    expect(nextPointer).toContain("No actual render execution.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(nextPointer).toContain(
      "Historical next-pointer marker retained for pointer guards: Status: current after Render API Contract Close Audit.",
    )

    expect(ledger).toContain("| 223 | Mini infrastructure close audit | done |")
    expect(ledger).toContain("## Phase 223 Mini Infrastructure Close Audit")
    expect(ledger).toContain("Next recommended work: Runtime Binding / Implementation Planning Gate.")

    expect(roadmap).toContain("## Phase 223: Mini Infrastructure Close Audit")
    expect(roadmap).toContain("Current next step after Phase 223:")
    expect(roadmap).toContain("Runtime Binding / Implementation Planning Gate")
    expect(roadmap).toContain("Historical Phase 222 Handoff")

    expect(readme).toContain("Mini Infrastructure Close Audit")
    expect(readme).toContain("docs/MINI_INFRASTRUCTURE_CLOSE_AUDIT.md")
    expect(readme).toContain("Runtime Binding / Implementation Planning Gate")
  })

  it("keeps root checks independent from runtime, renderer, and WASM tooling", () => {
    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("runtime-binding")
    expect(rootScripts).not.toContain("render-api-runtime")
    expect(rootScripts).not.toContain("backend-route")
    expect(rootScripts).not.toContain("wasm-pack")
    expect(rootScripts).not.toContain("wasm32-unknown-unknown")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })
})
