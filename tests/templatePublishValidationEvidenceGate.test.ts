import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  assessVNextKeyDataDiagnostics,
  assessVNextMeasuredPaginationExportReadiness,
  buildRelationshipGraph,
  paginateVNextDocument,
  safeParseFlowDocPackageV2DocumentVNext,
} from "../src/index.js"

type BoundaryFixture = {
  boundaryId: "template-publish-version-boundary-v1"
  boundaryStatus: "accepted"
  deferredLanes: ["Variable Schema / Data Contract", "Render API Contract"]
  draftTemplateIdentity: {
    identityKind: "draft-template"
    mutable: true
  }
  publishedTemplateVersionIdentity: {
    identityKind: "published-template-version"
    mutable: false
  }
  publishValidationEvidenceShape: {
    rejectedPublishBlockers: string[]
  }
  retentionPointerEvidence: {
    sourcePackageSnapshot: { required: boolean }
    validationEvidence: { required: boolean }
    storageDurabilityClaimed: boolean
  }
}

type ValidationEvidenceFixture = {
  evidenceId: "template-publish-validation-evidence-v1"
  sourceBoundaryId: "template-publish-version-boundary-v1"
  sourceBoundaryStatus: "accepted"
  sourceBoundaryPointer: "fixtures/template-publish-version-boundary.v1.json"
  evidenceStatus: "accepted"
  nextRecommendedWork: "Template Publish Accepted Version Metadata Gate"
  schemaDecisionRequired: boolean
  candidate: {
    sourcePointer: string
    packageId: string
    documentId: string
    packageKind: "document"
    packageVersion: 2
    documentVersion: 3
    rawPackageIncludedInThisFixture: boolean
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
      status: "validation-evidence-ready-not-published"
    }
    draftAndPublishedIdentitiesSeparate: boolean
    variableSchemaDataContractDeferred: boolean
    renderApiContractDeferred: boolean
  }
  validationEvidence: {
    packageParse: { status: "ready" | "blocked"; issueCount: number }
    graphDiagnostics: { status: "ready" | "ready-with-warnings" | "blocked"; issueCount: number }
    keyDataDiagnostics: {
      status: "ready" | "ready-with-warnings" | "blocked" | "not-run"
      errorCount: number
      warningCount: number
    }
    exportReadiness: {
      status: "ready" | "ready-with-warnings" | "blocked" | "not-run"
      blockingIssueCount: number
      warningIssueCount: number
      rendererArtifactBytesProduced: boolean
    }
    measurement: {
      status: "mini-checkpoint-only" | "ready" | "ready-with-warnings" | "blocked" | "not-run"
      fullV1ProductionReadiness: boolean
      defaultMeasurerReplacementBlocked: boolean
      measureVNextTextUnchanged: boolean
    }
    rejectedPublishBlockers: string[]
  }
  rejectedPublishAttemptPolicy: {
    explicitBlockersRequired: boolean
    mutatesCanonicalPackageSchema: boolean
    blockerVocabulary: string[]
    exampleRejectedAttempts: Array<{
      attemptId: string
      status: "rejected"
      blockers: string[]
      packageSchemaMutated: boolean
    }>
  }
  retentionPointers: {
    sourcePackageTemplateSnapshotPointer: string
    validationEvidencePointer: string
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

const boundaryFixture = readJson<BoundaryFixture>("../fixtures/template-publish-version-boundary.v1.json")
const evidenceFixture = readJson<ValidationEvidenceFixture>(
  "../fixtures/template-publish-validation-evidence.v1.json",
)
const candidatePackage = readJson<unknown>("../fixtures/product-report-vnext.flowdoc.json")

describe("template publish validation evidence gate", () => {
  it("confirms the accepted boundary and keeps dependent lanes deferred", () => {
    expect(boundaryFixture).toMatchObject({
      boundaryId: evidenceFixture.sourceBoundaryId,
      boundaryStatus: "accepted",
    })
    expect(evidenceFixture.sourceBoundaryPointer).toBe("fixtures/template-publish-version-boundary.v1.json")
    expect(evidenceFixture.sourceBoundaryStatus).toBe("accepted")
    expect(evidenceFixture.evidenceStatus).toBe("accepted")
    expect(evidenceFixture.nextRecommendedWork).toBe("Template Publish Accepted Version Metadata Gate")
    expect(evidenceFixture.schemaDecisionRequired).toBe(false)
    expect(boundaryFixture.deferredLanes).toEqual([
      "Variable Schema / Data Contract",
      "Render API Contract",
    ])
    expect(evidenceFixture.identityBoundary.variableSchemaDataContractDeferred).toBe(true)
    expect(evidenceFixture.identityBoundary.renderApiContractDeferred).toBe(true)
  })

  it("keeps draft template identity separate from the published version candidate", () => {
    expect(boundaryFixture.draftTemplateIdentity).toMatchObject({
      identityKind: "draft-template",
      mutable: true,
    })
    expect(boundaryFixture.publishedTemplateVersionIdentity).toMatchObject({
      identityKind: "published-template-version",
      mutable: false,
    })
    expect(evidenceFixture.identityBoundary.draftTemplate).toMatchObject({
      identityKind: "draft-template",
      mutable: true,
    })
    expect(evidenceFixture.identityBoundary.publishedTemplateVersionCandidate).toMatchObject({
      identityKind: "published-template-version",
      mutable: false,
      status: "validation-evidence-ready-not-published",
    })
    expect(evidenceFixture.identityBoundary.draftAndPublishedIdentitiesSeparate).toBe(true)
    expect(evidenceFixture.identityBoundary.draftTemplate.draftTemplateId).not.toBe(
      evidenceFixture.identityBoundary.publishedTemplateVersionCandidate.templateId,
    )
  })

  it("uses a canonical package v2/document v3 candidate and mirrors real validation summaries", () => {
    const parsed = safeParseFlowDocPackageV2DocumentVNext(candidatePackage)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) throw new Error(parsed.issues.map((issue) => issue.message).join("\n"))

    const graph = buildRelationshipGraph(parsed.package.document)
    const keyData = assessVNextKeyDataDiagnostics(parsed.package.document, parsed.package.fields, parsed.package.data)
    const pagination = paginateVNextDocument(parsed.package.document, {
      data: parsed.package.data?.values,
      measurementProfileId: "template-publish-validation-evidence-candidate-v1",
    })
    const exportReadiness = assessVNextMeasuredPaginationExportReadiness(pagination)

    expect(evidenceFixture.candidate).toMatchObject({
      sourcePointer: "fixtures/product-report-vnext.flowdoc.json",
      packageId: parsed.package.id,
      documentId: parsed.package.document.document.id,
      packageKind: parsed.package.kind,
      packageVersion: parsed.package.packageVersion,
      documentVersion: parsed.package.document.version,
      rawPackageIncludedInThisFixture: false,
    })
    expect(evidenceFixture.validationEvidence.packageParse).toEqual({
      status: "ready",
      issueCount: 0,
    })
    expect(evidenceFixture.validationEvidence.graphDiagnostics).toEqual({
      status: "ready",
      issueCount: graph.diagnostics.issues.length,
    })
    expect(evidenceFixture.validationEvidence.keyDataDiagnostics).toEqual({
      status: keyData.status,
      errorCount: keyData.summary.errorCount,
      warningCount: keyData.summary.warningCount,
    })
    expect(evidenceFixture.validationEvidence.exportReadiness).toMatchObject({
      status: exportReadiness.status,
      blockingIssueCount: exportReadiness.blockingIssues.length,
      warningIssueCount: exportReadiness.warningIssues.length,
      rendererArtifactBytesProduced: false,
    })
  })

  it("carries rejected publish blockers without mutating canonical schema", () => {
    const expectedBlockers = [
      "invalid-package",
      "unsupported-package-version",
      "unsupported-document-version",
      "graph-diagnostics-blocked",
      "key-data-diagnostics-blocked",
      "export-readiness-blocked",
      "measurement-status-blocked",
      "missing-source-snapshot-retention-pointer",
    ]

    expect(boundaryFixture.publishValidationEvidenceShape.rejectedPublishBlockers).toEqual(expectedBlockers)
    expect(evidenceFixture.rejectedPublishAttemptPolicy.blockerVocabulary).toEqual(expectedBlockers)
    expect(evidenceFixture.rejectedPublishAttemptPolicy).toMatchObject({
      explicitBlockersRequired: true,
      mutatesCanonicalPackageSchema: false,
    })
    expect(evidenceFixture.rejectedPublishAttemptPolicy.exampleRejectedAttempts.length).toBeGreaterThan(0)
    evidenceFixture.rejectedPublishAttemptPolicy.exampleRejectedAttempts.forEach((attempt) => {
      expect(attempt.status).toBe("rejected")
      expect(attempt.blockers.length).toBeGreaterThan(0)
      expect(attempt.blockers.every((blocker) => expectedBlockers.includes(blocker))).toBe(true)
      expect(attempt.packageSchemaMutated).toBe(false)
    })
    expect(evidenceFixture.validationEvidence.rejectedPublishBlockers).toEqual([])
  })

  it("attaches source and validation evidence retention pointers without storage claims", () => {
    expect(boundaryFixture.retentionPointerEvidence.sourcePackageSnapshot.required).toBe(true)
    expect(boundaryFixture.retentionPointerEvidence.validationEvidence.required).toBe(true)
    expect(boundaryFixture.retentionPointerEvidence.storageDurabilityClaimed).toBe(false)
    expect(evidenceFixture.retentionPointers).toEqual({
      sourcePackageTemplateSnapshotPointer: "repo://fixtures/product-report-vnext.flowdoc.json",
      validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json",
      rawSnapshotIncludedInRootFixture: false,
      rawRendererArtifactIncluded: false,
      storageDurabilityClaimed: false,
    })
  })

  it("keeps measurement and production behavior blocked", () => {
    expect(evidenceFixture.validationEvidence.measurement).toMatchObject({
      status: "mini-checkpoint-only",
      fullV1ProductionReadiness: false,
      defaultMeasurerReplacementBlocked: true,
      measureVNextTextUnchanged: true,
    })
    expect(evidenceFixture.blockedUntilLater).toMatchObject({
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
    expect(Object.values(evidenceFixture.nonWork)).toEqual(Object.values(evidenceFixture.nonWork).map(() => false))

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("template-publish")
    expect(rootScripts).not.toContain("render-api")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to accepted version metadata", () => {
    const validationDoc = readText("../docs/TEMPLATE_PUBLISH_VALIDATION_EVIDENCE_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(validationDoc).toContain("Status: Template Publish Validation Evidence Gate complete.")
    expect(validationDoc).toContain("fixtures/template-publish-validation-evidence.v1.json")
    expect(validationDoc).toContain("Template Publish Accepted Version Metadata Gate.")
    expect(validationDoc).toContain("## PASS")
    expect(validationDoc).toContain("## FAIL-BLOCKER")
    expect(validationDoc).toContain("## RISK")
    expect(validationDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Variable Schema / Data Contract Planning Gate.")
    expect(currentStatus).toContain("Template Publish Accepted Version Metadata Gate.")
    expect(nextPointer).toContain("Status: current after Variable Schema / Data Contract Planning Gate.")
    expect(nextPointer).toContain("Template Publish Accepted Version Metadata Gate.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(nextPointer).toContain("No backend production routes.")
    expect(ledger).toContain("| 206 | Template publish validation evidence gate | done |")
    expect(ledger).toContain("## Phase 206 Template Publish Validation Evidence Gate")
    expect(roadmap).toContain("## Phase 206: Template Publish Validation Evidence Gate")
    expect(roadmap).toContain("Current next step after Phase 206:")
    expect(roadmap).toContain("Template Publish Accepted Version Metadata Gate")
    expect(roadmap).toContain("Historical Phase 205 Handoff")
    expect(readme).toContain("Template Publish Validation Evidence Gate")
    expect(readme).toContain("docs/TEMPLATE_PUBLISH_VALIDATION_EVIDENCE_GATE.md")
  })
})
