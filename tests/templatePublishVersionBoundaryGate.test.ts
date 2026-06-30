import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { safeParseFlowDocPackageV2DocumentVNext } from "../src/index.js"

type BoundaryFixture = {
  boundaryId: "template-publish-version-boundary-v1"
  sourcePlanningGate: "Template Publish / Variable Schema / Render API Planning Gate"
  selectedLane: "Template Publish / Version Boundary"
  deferredLanes: ["Variable Schema / Data Contract", "Render API Contract"]
  boundaryStatus: "accepted"
  nextRecommendedWork: "Template Publish Validation Evidence Gate"
  schemaDecisionRequiredBeforeValidationEvidence: boolean
  candidateSource: {
    kind: "canonical-flowdoc-package"
    packageVersion: 2
    documentVersion: 3
    acceptedPackageKind: "document"
    rawPackageIncludedInThisFixture: boolean
    exampleSourcePointer: string
  }
  draftTemplateIdentity: {
    identityKind: "draft-template"
    mutable: true
    identifierFields: string[]
    mustNotBeReferencedBy: string[]
  }
  publishedTemplateVersionIdentity: {
    identityKind: "published-template-version"
    mutable: false
    identifierFields: string[]
    stableReferenceTargetFor: string[]
    acceptedVersionIdRule: "immutable-after-accepted"
  }
  publishedVersionMetadataShape: Record<string, unknown>
  immutabilityRules: Record<string, boolean>
  publishValidationEvidenceShape: {
    packageParseStatus: string
    graphDiagnostics: Record<string, string>
    keyDataDiagnostics: Record<string, string>
    exportReadinessStatus: string
    measurementStatus: string
    rejectedPublishBlockers: string[]
  }
  retentionPointerEvidence: {
    sourcePackageSnapshot: {
      required: boolean
      rawSnapshotIncludedInRootFixture: boolean
    }
    validationEvidence: {
      required: boolean
      rawRendererArtifactIncluded: boolean
    }
    storageDurabilityClaimed: boolean
  }
  lifecyclePolicyNames: Record<"rollback" | "deprecation" | "superseding", string>
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

describe("template publish version boundary gate", () => {
  it("confirms the selected lane and keeps dependent lanes deferred", () => {
    const planningGate = readText("../docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md")
    const boundaryDoc = readText("../docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md")

    expect(planningGate).toContain(
      "Selected first implementation lane: Template Publish / Version Boundary.",
    )
    expect(boundaryFixture.sourcePlanningGate).toBe(
      "Template Publish / Variable Schema / Render API Planning Gate",
    )
    expect(boundaryFixture.selectedLane).toBe("Template Publish / Version Boundary")
    expect(boundaryFixture.deferredLanes).toEqual([
      "Variable Schema / Data Contract",
      "Render API Contract",
    ])
    expect(boundaryFixture.boundaryStatus).toBe("accepted")
    expect(boundaryDoc).toContain("Variable Schema / Data Contract;")
    expect(boundaryDoc).toContain("Render API Contract.")
  })

  it("separates draft template identity from immutable published version identity", () => {
    expect(boundaryFixture.draftTemplateIdentity).toMatchObject({
      identityKind: "draft-template",
      mutable: true,
    })
    expect(boundaryFixture.draftTemplateIdentity.identifierFields).toEqual([
      "draftTemplateId",
      "workingRevisionId",
    ])
    expect(boundaryFixture.draftTemplateIdentity.mustNotBeReferencedBy).toEqual([
      "Variable Schema / Data Contract",
      "Render API Contract",
    ])
    expect(boundaryFixture.publishedTemplateVersionIdentity).toMatchObject({
      identityKind: "published-template-version",
      mutable: false,
      acceptedVersionIdRule: "immutable-after-accepted",
    })
    expect(boundaryFixture.publishedTemplateVersionIdentity.identifierFields).toEqual([
      "templateId",
      "templateVersionId",
      "versionOrdinal",
    ])
    expect(boundaryFixture.publishedTemplateVersionIdentity.stableReferenceTargetFor).toEqual([
      "Variable Schema / Data Contract",
      "Render API Contract",
    ])
  })

  it("defines JSON-safe metadata, immutability, retention, and lifecycle policy", () => {
    expect(boundaryFixture.publishedVersionMetadataShape).toMatchObject({
      templateId: "string",
      templateVersionId: "string",
      versionOrdinal: "number",
      packageVersion: 2,
      documentVersion: 3,
      status: "accepted|deprecated|superseded",
    })
    expect(boundaryFixture.immutabilityRules).toMatchObject({
      acceptedTemplateVersionIdImmutable: true,
      acceptedSourceSnapshotPointerImmutable: true,
      acceptedSourcePackageContentImmutable: true,
      metadataCorrectionsRequireNewLifecycleRecord: true,
      schemaChangesAllowedInThisGate: false,
    })
    expect(boundaryFixture.retentionPointerEvidence.sourcePackageSnapshot).toMatchObject({
      required: true,
      rawSnapshotIncludedInRootFixture: false,
    })
    expect(boundaryFixture.retentionPointerEvidence.validationEvidence).toMatchObject({
      required: true,
      rawRendererArtifactIncluded: false,
    })
    expect(boundaryFixture.retentionPointerEvidence.storageDurabilityClaimed).toBe(false)
    expect(boundaryFixture.lifecyclePolicyNames).toEqual({
      rollback: "supersede-with-new-template-version",
      deprecation: "mark-version-deprecated-without-mutating-source-package",
      superseding: "new-version-references-prior-version",
    })
  })

  it("restricts publishable candidates to canonical package v2 and document v3", () => {
    const candidate = readJson<unknown>("../fixtures/product-report-vnext.flowdoc.json")
    const parsed = safeParseFlowDocPackageV2DocumentVNext(candidate)

    expect(boundaryFixture.candidateSource).toEqual({
      kind: "canonical-flowdoc-package",
      packageVersion: 2,
      documentVersion: 3,
      acceptedPackageKind: "document",
      rawPackageIncludedInThisFixture: false,
      exampleSourcePointer: "fixtures/product-report-vnext.flowdoc.json",
    })
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) throw new Error(parsed.issues.map((issue) => issue.message).join("\n"))
    expect(parsed.package.packageVersion).toBe(2)
    expect(parsed.package.kind).toBe("document")
    expect(parsed.package.document.version).toBe(3)
  })

  it("defines publish validation evidence and blockers for rejected attempts", () => {
    expect(boundaryFixture.publishValidationEvidenceShape).toMatchObject({
      packageParseStatus: "ready|blocked",
      exportReadinessStatus: "ready|ready-with-warnings|blocked|not-run",
      measurementStatus: "mini-checkpoint-only|ready|ready-with-warnings|blocked|not-run",
    })
    expect(boundaryFixture.publishValidationEvidenceShape.graphDiagnostics).toEqual({
      status: "ready|ready-with-warnings|blocked",
      issueCount: "number",
    })
    expect(boundaryFixture.publishValidationEvidenceShape.keyDataDiagnostics).toEqual({
      status: "ready|ready-with-warnings|blocked|not-run",
      errorCount: "number",
      warningCount: "number",
    })
    expect(boundaryFixture.publishValidationEvidenceShape.rejectedPublishBlockers).toEqual([
      "invalid-package",
      "unsupported-package-version",
      "unsupported-document-version",
      "graph-diagnostics-blocked",
      "key-data-diagnostics-blocked",
      "export-readiness-blocked",
      "measurement-status-blocked",
      "missing-source-snapshot-retention-pointer",
    ])
  })

  it("keeps the gate evidence-focused and blocks production behavior", () => {
    expect(boundaryFixture.nextRecommendedWork).toBe("Template Publish Validation Evidence Gate")
    expect(boundaryFixture.schemaDecisionRequiredBeforeValidationEvidence).toBe(false)
    expect(boundaryFixture.blockedUntilLater).toMatchObject({
      variableSchemaDataContract: true,
      renderApiContract: true,
      backendProductionRoutes: true,
      productionStorageDurability: true,
      authAuthz: true,
      rendererArtifactBytes: true,
      packageDocumentSchemaChange: true,
      fullMeasurementProductionReadiness: true,
      defaultMeasurerReplacement: true,
    })
    expect(Object.values(boundaryFixture.nonWork)).toEqual(Object.values(boundaryFixture.nonWork).map(() => false))

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreIndex = readText("../src/index.ts")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("template-publish")
    expect(rootScripts).not.toContain("render-api")
    expect(coreIndex).not.toContain("template-publish-version-boundary")
    expect(coreMeasurement).not.toContain("template-publish-version-boundary")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the boundary and advances pointers to validation evidence", () => {
    const boundaryDoc = readText("../docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(boundaryDoc).toContain("Status: Template Publish / Version Boundary Gate complete.")
    expect(boundaryDoc).toContain("fixtures/template-publish-version-boundary.v1.json")
    expect(boundaryDoc).toContain("Template Publish Validation Evidence Gate.")
    expect(boundaryDoc).toContain("## PASS")
    expect(boundaryDoc).toContain("## FAIL-BLOCKER")
    expect(boundaryDoc).toContain("## RISK")
    expect(boundaryDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Variable Reference Discovery Gate.")
    expect(currentStatus).toContain("Template Publish Validation Evidence Gate.")
    expect(nextPointer).toContain("Status: current after Variable Reference Discovery Gate.")
    expect(nextPointer).toContain("Template Publish Validation Evidence Gate.")
    expect(nextPointer).toContain("No backend production routes.")
    expect(nextPointer).toContain("No package/document schema change.")
    expect(ledger).toContain("| 205 | Template publish version boundary gate | done |")
    expect(ledger).toContain("## Phase 205 Template Publish Version Boundary Gate")
    expect(roadmap).toContain("## Phase 205: Template Publish / Version Boundary Gate")
    expect(roadmap).toContain("Current next step after Phase 205:")
    expect(roadmap).toContain("Template Publish Validation Evidence Gate")
    expect(roadmap).toContain("Historical Phase 204 Handoff")
    expect(readme).toContain("Template Publish / Version Boundary Gate")
    expect(readme).toContain("docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md")
  })
})
