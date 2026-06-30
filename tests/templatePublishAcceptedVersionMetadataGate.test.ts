import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { safeParseFlowDocPackageV2DocumentVNext } from "../src/index.js"

type ValidationEvidenceFixture = {
  evidenceId: "template-publish-validation-evidence-v1"
  evidenceStatus: "accepted"
  candidate: {
    sourcePointer: string
    packageId: string
    documentId: string
    packageKind: "document"
    packageVersion: 2
    documentVersion: 3
  }
  identityBoundary: {
    draftTemplate: {
      identityKind: "draft-template"
      draftTemplateId: string
      workingRevisionId: string
      mutable: true
    }
    publishedTemplateVersionCandidate: {
      identityKind: "published-template-version"
      templateId: string
      templateVersionId: string
      versionOrdinal: number
      mutable: false
    }
    draftAndPublishedIdentitiesSeparate: boolean
  }
  validationEvidence: {
    packageParse: { status: "ready"; issueCount: number }
    graphDiagnostics: { status: "ready"; issueCount: number }
    keyDataDiagnostics: { status: "ready"; errorCount: number; warningCount: number }
    exportReadiness: {
      status: "ready-with-warnings"
      blockingIssueCount: number
      warningIssueCount: number
      rendererArtifactBytesProduced: boolean
    }
    measurement: {
      status: "mini-checkpoint-only"
      fullV1ProductionReadiness: boolean
      defaultMeasurerReplacementBlocked: boolean
      measureVNextTextUnchanged: boolean
    }
    rejectedPublishBlockers: string[]
  }
  retentionPointers: {
    sourcePackageTemplateSnapshotPointer: string
    validationEvidencePointer: string
    storageDurabilityClaimed: boolean
  }
}

type AcceptedVersionMetadataFixture = {
  metadataId: "template-publish-accepted-version-metadata-v1"
  sourceValidationEvidenceId: "template-publish-validation-evidence-v1"
  sourceValidationEvidenceStatus: "accepted"
  sourceValidationEvidencePointer: "fixtures/template-publish-validation-evidence.v1.json"
  metadataStatus: "accepted"
  nextRecommendedWork: "Template Publish Close Audit"
  schemaDecisionRequired: boolean
  candidate: ValidationEvidenceFixture["candidate"]
  acceptedVersionMetadata: {
    templateId: string
    templateVersionId: string
    versionOrdinal: number
    sourcePackageId: string
    packageVersion: 2
    documentVersion: 3
    title: string
    status: "accepted"
    lifecyclePolicyName: string
    sourceSnapshotRetentionPointer: string
    validationEvidencePointer: string
    validationEvidenceStatus: "accepted"
    exportReadinessStatus: "ready-with-warnings"
    exportReadinessWarningCount: number
    measurementStatus: "mini-checkpoint-only"
  }
  identityBoundary: {
    draftTemplate: ValidationEvidenceFixture["identityBoundary"]["draftTemplate"]
    publishedTemplateVersion: {
      identityKind: "published-template-version"
      templateId: string
      templateVersionId: string
      versionOrdinal: number
      mutable: false
      status: "accepted"
    }
    draftAndPublishedIdentitiesSeparate: boolean
  }
  validationEvidenceCarryForward: {
    packageParseStatus: "ready"
    graphDiagnosticsStatus: "ready"
    keyDataDiagnosticsStatus: "ready"
    exportReadinessStatus: "ready-with-warnings"
    exportReadinessBlockingIssueCount: number
    exportReadinessWarningIssueCount: number
    measurementStatus: "mini-checkpoint-only"
    rejectedPublishBlockers: string[]
  }
  immutabilityRules: Record<string, boolean>
  metadataRepresentation: {
    representedWithoutSchemaChanges: boolean
    blockers: string[]
    schemaDecisionFallback: "Template Version Schema Decision Gate"
  }
  retentionPointers: {
    sourcePackageTemplateSnapshotPointer: string
    validationEvidencePointer: string
    acceptedVersionMetadataPointer: string
    rawSnapshotIncludedInRootFixture: boolean
    rawRendererArtifactIncluded: boolean
    storageDurabilityClaimed: boolean
  }
  blockedUntilLater: Record<string, boolean>
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

const validationEvidence = readJson<ValidationEvidenceFixture>(
  "../fixtures/template-publish-validation-evidence.v1.json",
)
const acceptedMetadata = readJson<AcceptedVersionMetadataFixture>(
  "../fixtures/template-publish-accepted-version-metadata.v1.json",
)

describe("template publish accepted version metadata gate", () => {
  it("confirms accepted validation evidence and canonical candidate facts", () => {
    const candidate = readJson<unknown>("../fixtures/product-report-vnext.flowdoc.json")
    const parsed = safeParseFlowDocPackageV2DocumentVNext(candidate)

    expect(validationEvidence.evidenceStatus).toBe("accepted")
    expect(acceptedMetadata).toMatchObject({
      sourceValidationEvidenceId: validationEvidence.evidenceId,
      sourceValidationEvidenceStatus: "accepted",
      sourceValidationEvidencePointer: "fixtures/template-publish-validation-evidence.v1.json",
      metadataStatus: "accepted",
      nextRecommendedWork: "Template Publish Close Audit",
      schemaDecisionRequired: false,
    })
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) throw new Error(parsed.issues.map((issue) => issue.message).join("\n"))
    expect(acceptedMetadata.candidate).toEqual(validationEvidence.candidate)
    expect(acceptedMetadata.candidate).toMatchObject({
      sourcePointer: "fixtures/product-report-vnext.flowdoc.json",
      packageId: "product-report-vnext",
      documentId: "product-report-vnext",
      packageKind: "document",
      packageVersion: 2,
      documentVersion: 3,
    })
    expect(parsed.package.id).toBe(acceptedMetadata.candidate.packageId)
    expect(parsed.package.document.document.id).toBe(acceptedMetadata.candidate.documentId)
  })

  it("populates all required JSON-safe accepted version metadata fields", () => {
    expect(acceptedMetadata.acceptedVersionMetadata).toEqual({
      templateId: validationEvidence.identityBoundary.publishedTemplateVersionCandidate.templateId,
      templateVersionId: validationEvidence.identityBoundary.publishedTemplateVersionCandidate.templateVersionId,
      versionOrdinal: validationEvidence.identityBoundary.publishedTemplateVersionCandidate.versionOrdinal,
      sourcePackageId: validationEvidence.candidate.packageId,
      packageVersion: validationEvidence.candidate.packageVersion,
      documentVersion: validationEvidence.candidate.documentVersion,
      title: "Product Report vNext",
      status: "accepted",
      lifecyclePolicyName: "template-version-lifecycle-v1",
      sourceSnapshotRetentionPointer: validationEvidence.retentionPointers.sourcePackageTemplateSnapshotPointer,
      validationEvidencePointer: validationEvidence.retentionPointers.validationEvidencePointer,
      validationEvidenceStatus: validationEvidence.evidenceStatus,
      exportReadinessStatus: validationEvidence.validationEvidence.exportReadiness.status,
      exportReadinessWarningCount: validationEvidence.validationEvidence.exportReadiness.warningIssueCount,
      measurementStatus: validationEvidence.validationEvidence.measurement.status,
    })
  })

  it("keeps draft identity separate and accepted version identity immutable", () => {
    expect(acceptedMetadata.identityBoundary.draftTemplate).toEqual(validationEvidence.identityBoundary.draftTemplate)
    expect(acceptedMetadata.identityBoundary.publishedTemplateVersion).toMatchObject({
      identityKind: "published-template-version",
      templateId: acceptedMetadata.acceptedVersionMetadata.templateId,
      templateVersionId: acceptedMetadata.acceptedVersionMetadata.templateVersionId,
      versionOrdinal: acceptedMetadata.acceptedVersionMetadata.versionOrdinal,
      mutable: false,
      status: "accepted",
    })
    expect(acceptedMetadata.identityBoundary.draftAndPublishedIdentitiesSeparate).toBe(true)
    expect(acceptedMetadata.identityBoundary.draftTemplate.draftTemplateId).not.toBe(
      acceptedMetadata.identityBoundary.publishedTemplateVersion.templateId,
    )
    expect(acceptedMetadata.immutabilityRules).toMatchObject({
      acceptedTemplateVersionIdImmutable: true,
      acceptedSourceSnapshotRetentionPointerImmutable: true,
      acceptedValidationEvidencePointerImmutable: true,
      acceptedMetadataCorrectionsRequireLifecycleRecord: true,
      packageDocumentSchemaMutated: false,
    })
  })

  it("preserves validation status, warning visibility, and explicit blocker state", () => {
    expect(acceptedMetadata.validationEvidenceCarryForward).toEqual({
      packageParseStatus: validationEvidence.validationEvidence.packageParse.status,
      graphDiagnosticsStatus: validationEvidence.validationEvidence.graphDiagnostics.status,
      keyDataDiagnosticsStatus: validationEvidence.validationEvidence.keyDataDiagnostics.status,
      exportReadinessStatus: validationEvidence.validationEvidence.exportReadiness.status,
      exportReadinessBlockingIssueCount: validationEvidence.validationEvidence.exportReadiness.blockingIssueCount,
      exportReadinessWarningIssueCount: validationEvidence.validationEvidence.exportReadiness.warningIssueCount,
      measurementStatus: validationEvidence.validationEvidence.measurement.status,
      rejectedPublishBlockers: validationEvidence.validationEvidence.rejectedPublishBlockers,
    })
    expect(acceptedMetadata.acceptedVersionMetadata.exportReadinessStatus).toBe("ready-with-warnings")
    expect(acceptedMetadata.acceptedVersionMetadata.exportReadinessWarningCount).toBe(1)
    expect(acceptedMetadata.acceptedVersionMetadata.measurementStatus).toBe("mini-checkpoint-only")
    expect(acceptedMetadata.metadataRepresentation).toEqual({
      representedWithoutSchemaChanges: true,
      blockers: [],
      schemaDecisionFallback: "Template Version Schema Decision Gate",
    })
  })

  it("attaches retention pointers without claiming production storage durability", () => {
    expect(acceptedMetadata.retentionPointers).toEqual({
      sourcePackageTemplateSnapshotPointer: validationEvidence.retentionPointers.sourcePackageTemplateSnapshotPointer,
      validationEvidencePointer: validationEvidence.retentionPointers.validationEvidencePointer,
      acceptedVersionMetadataPointer: "repo://fixtures/template-publish-accepted-version-metadata.v1.json",
      rawSnapshotIncludedInRootFixture: false,
      rawRendererArtifactIncluded: false,
      storageDurabilityClaimed: false,
    })
  })

  it("keeps production behavior and measurement replacement blocked", () => {
    expect(acceptedMetadata.blockedUntilLater).toMatchObject({
      backendProductionRoutes: true,
      productionStorageDurability: true,
      authAuthz: true,
      rendererArtifactBytes: true,
      variableSchemaDataContract: true,
      renderApiContract: true,
      packageDocumentSchemaChange: true,
      fullMeasurementProductionReadiness: true,
      defaultMeasurerReplacement: true,
    })
    expect(Object.values(acceptedMetadata.nonWork)).toEqual(Object.values(acceptedMetadata.nonWork).map(() => false))

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("template-publish")
    expect(rootScripts).not.toContain("render-api")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the metadata gate and advances pointers to close audit", () => {
    const metadataDoc = readText("../docs/TEMPLATE_PUBLISH_ACCEPTED_VERSION_METADATA_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(metadataDoc).toContain("Status: Template Publish Accepted Version Metadata Gate complete.")
    expect(metadataDoc).toContain("fixtures/template-publish-accepted-version-metadata.v1.json")
    expect(metadataDoc).toContain("Template Publish Close Audit.")
    expect(metadataDoc).toContain("## PASS")
    expect(metadataDoc).toContain("## FAIL-BLOCKER")
    expect(metadataDoc).toContain("## RISK")
    expect(metadataDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Variable Reference Discovery Gate.")
    expect(currentStatus).toContain("Template Publish Close Audit.")
    expect(nextPointer).toContain("Status: current after Variable Reference Discovery Gate.")
    expect(nextPointer).toContain("Template Publish Close Audit.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(nextPointer).toContain("No backend production routes.")
    expect(ledger).toContain("| 207 | Template publish accepted version metadata gate | done |")
    expect(ledger).toContain("## Phase 207 Template Publish Accepted Version Metadata Gate")
    expect(roadmap).toContain("## Phase 207: Template Publish Accepted Version Metadata Gate")
    expect(roadmap).toContain("Current next step after Phase 207:")
    expect(roadmap).toContain("Template Publish Close Audit")
    expect(roadmap).toContain("Historical Phase 206 Handoff")
    expect(readme).toContain("Template Publish Accepted Version Metadata Gate")
    expect(readme).toContain("docs/TEMPLATE_PUBLISH_ACCEPTED_VERSION_METADATA_GATE.md")
  })
})
