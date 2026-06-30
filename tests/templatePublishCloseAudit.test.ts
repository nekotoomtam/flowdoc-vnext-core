import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type AcceptedVersionMetadataFixture = {
  metadataId: "template-publish-accepted-version-metadata-v1"
  sourceValidationEvidenceId: "template-publish-validation-evidence-v1"
  sourceValidationEvidenceStatus: "accepted"
  sourceValidationEvidencePointer: "fixtures/template-publish-validation-evidence.v1.json"
  metadataStatus: "accepted"
  nextRecommendedWork: "Template Publish Close Audit"
  schemaDecisionRequired: boolean
  candidate: {
    sourcePointer: "fixtures/product-report-vnext.flowdoc.json"
    packageId: "product-report-vnext"
    documentId: "product-report-vnext"
    packageKind: "document"
    packageVersion: 2
    documentVersion: 3
  }
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
    draftTemplate: {
      identityKind: "draft-template"
      draftTemplateId: string
      workingRevisionId: string
      mutable: true
    }
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

const acceptedMetadata = readJson<AcceptedVersionMetadataFixture>(
  "../fixtures/template-publish-accepted-version-metadata.v1.json",
)

describe("template publish close audit", () => {
  it("confirms accepted version metadata exists and carries required fields", () => {
    expect(acceptedMetadata).toMatchObject({
      metadataId: "template-publish-accepted-version-metadata-v1",
      sourceValidationEvidenceId: "template-publish-validation-evidence-v1",
      sourceValidationEvidenceStatus: "accepted",
      sourceValidationEvidencePointer: "fixtures/template-publish-validation-evidence.v1.json",
      metadataStatus: "accepted",
      nextRecommendedWork: "Template Publish Close Audit",
      schemaDecisionRequired: false,
    })
    expect(acceptedMetadata.candidate).toMatchObject({
      sourcePointer: "fixtures/product-report-vnext.flowdoc.json",
      packageId: "product-report-vnext",
      documentId: "product-report-vnext",
      packageKind: "document",
      packageVersion: 2,
      documentVersion: 3,
    })

    const requiredFields = [
      "templateId",
      "templateVersionId",
      "versionOrdinal",
      "sourcePackageId",
      "packageVersion",
      "documentVersion",
      "title",
      "status",
      "lifecyclePolicyName",
      "sourceSnapshotRetentionPointer",
      "validationEvidencePointer",
      "validationEvidenceStatus",
      "exportReadinessStatus",
      "exportReadinessWarningCount",
      "measurementStatus",
    ]

    requiredFields.forEach((field) => {
      expect(acceptedMetadata.acceptedVersionMetadata).toHaveProperty(field)
    })
  })

  it("keeps draft identity separate and accepted version pointer facts immutable", () => {
    expect(acceptedMetadata.identityBoundary.draftAndPublishedIdentitiesSeparate).toBe(true)
    expect(acceptedMetadata.identityBoundary.draftTemplate).toMatchObject({
      identityKind: "draft-template",
      mutable: true,
    })
    expect(acceptedMetadata.identityBoundary.publishedTemplateVersion).toMatchObject({
      identityKind: "published-template-version",
      templateId: acceptedMetadata.acceptedVersionMetadata.templateId,
      templateVersionId: acceptedMetadata.acceptedVersionMetadata.templateVersionId,
      versionOrdinal: acceptedMetadata.acceptedVersionMetadata.versionOrdinal,
      mutable: false,
      status: "accepted",
    })
    expect(acceptedMetadata.identityBoundary.draftTemplate.draftTemplateId).not.toBe(
      acceptedMetadata.identityBoundary.publishedTemplateVersion.templateId,
    )
    expect(acceptedMetadata.immutabilityRules).toMatchObject({
      acceptedTemplateVersionIdImmutable: true,
      acceptedSourceSnapshotRetentionPointerImmutable: true,
      acceptedValidationEvidencePointerImmutable: true,
      packageDocumentSchemaMutated: false,
    })
  })

  it("preserves ready-with-warnings visibility and mini-checkpoint measurement scope", () => {
    expect(acceptedMetadata.acceptedVersionMetadata.exportReadinessStatus).toBe("ready-with-warnings")
    expect(acceptedMetadata.acceptedVersionMetadata.exportReadinessWarningCount).toBe(1)
    expect(acceptedMetadata.validationEvidenceCarryForward).toMatchObject({
      exportReadinessStatus: "ready-with-warnings",
      exportReadinessBlockingIssueCount: 0,
      exportReadinessWarningIssueCount: 1,
      measurementStatus: "mini-checkpoint-only",
      rejectedPublishBlockers: [],
    })
    expect(acceptedMetadata.acceptedVersionMetadata.measurementStatus).toBe("mini-checkpoint-only")
  })

  it("routes away from schema and warning fallback gates for this mini lane close", () => {
    expect(acceptedMetadata.metadataRepresentation).toEqual({
      representedWithoutSchemaChanges: true,
      blockers: [],
      schemaDecisionFallback: "Template Version Schema Decision Gate",
    })
    expect(acceptedMetadata.retentionPointers).toMatchObject({
      sourcePackageTemplateSnapshotPointer: "repo://fixtures/product-report-vnext.flowdoc.json",
      validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json",
      acceptedVersionMetadataPointer: "repo://fixtures/template-publish-accepted-version-metadata.v1.json",
      rawSnapshotIncludedInRootFixture: false,
      rawRendererArtifactIncluded: false,
      storageDurabilityClaimed: false,
    })
  })

  it("keeps implementation lanes and production behavior blocked", () => {
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

  it("documents the close audit and advances pointers to variable schema planning", () => {
    const closeAuditDoc = readText("../docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(closeAuditDoc).toContain("Status: Template Publish Close Audit complete.")
    expect(closeAuditDoc).toContain("Decision: close Template Publish mini lane for mini infrastructure checkpoint only.")
    expect(closeAuditDoc).toContain(
      "Ready-with-warnings is acceptable for this mini lane close because warning visibility is preserved",
    )
    expect(closeAuditDoc).toContain("Selected next lane: Variable Schema / Data Contract Planning Gate.")
    expect(closeAuditDoc).toContain("Template Version Schema Decision Gate is not selected")
    expect(closeAuditDoc).toContain("Template Publish Export Readiness Warning Decision Gate is not selected")
    expect(closeAuditDoc).toContain("## PASS")
    expect(closeAuditDoc).toContain("## FAIL-BLOCKER")
    expect(closeAuditDoc).toContain("## RISK")
    expect(closeAuditDoc).toContain("## UNKNOWN")

    expect(currentStatus).toContain("Status: updated after Variable Schema / Data Contract Close Audit.")
    expect(currentStatus).toContain("Template Publish Close Audit.")
    expect(currentStatus).toContain("Variable Schema / Data Contract Planning Gate.")
    expect(nextPointer).toContain("Status: current after Variable Schema / Data Contract Close Audit.")
    expect(nextPointer).toContain("Variable Schema / Data Contract Planning Gate.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(nextPointer).toContain("No Render API Contract implementation.")
    expect(ledger).toContain("| 208 | Template publish close audit | done |")
    expect(ledger).toContain("## Phase 208 Template Publish Close Audit")
    expect(roadmap).toContain("## Phase 208: Template Publish Close Audit")
    expect(roadmap).toContain("Current next step after Phase 208:")
    expect(roadmap).toContain("Variable Schema / Data Contract Planning Gate")
    expect(roadmap).toContain("Historical Phase 207 Handoff")
    expect(readme).toContain("Template Publish Close Audit")
    expect(readme).toContain("docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md")
  })
})
