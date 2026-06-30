import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type AcceptedVersionMetadataFixture = {
  metadataStatus: "accepted"
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
    validationEvidenceStatus: "accepted"
    exportReadinessStatus: "ready-with-warnings"
    exportReadinessWarningCount: number
    measurementStatus: "mini-checkpoint-only"
    sourceSnapshotRetentionPointer: string
    validationEvidencePointer: string
  }
  identityBoundary: {
    draftTemplate: { identityKind: "draft-template"; mutable: true; draftTemplateId: string }
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
  immutabilityRules: Record<string, boolean>
  retentionPointers: {
    sourcePackageTemplateSnapshotPointer: string
    validationEvidencePointer: string
    acceptedVersionMetadataPointer: string
    rawSnapshotIncludedInRootFixture: boolean
    rawRendererArtifactIncluded: boolean
    storageDurabilityClaimed: boolean
  }
  metadataRepresentation: {
    representedWithoutSchemaChanges: boolean
    blockers: string[]
    schemaDecisionFallback: "Template Version Schema Decision Gate"
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

const acceptedMetadata = readJson<AcceptedVersionMetadataFixture>(
  "../fixtures/template-publish-accepted-version-metadata.v1.json",
)

describe("variable schema data contract planning gate", () => {
  it("confirms the accepted published template version attachment target", () => {
    expect(acceptedMetadata.metadataStatus).toBe("accepted")
    expect(acceptedMetadata.schemaDecisionRequired).toBe(false)
    expect(acceptedMetadata.candidate).toMatchObject({
      sourcePointer: "fixtures/product-report-vnext.flowdoc.json",
      packageId: "product-report-vnext",
      documentId: "product-report-vnext",
      packageKind: "document",
      packageVersion: 2,
      documentVersion: 3,
    })
    expect(acceptedMetadata.acceptedVersionMetadata).toMatchObject({
      templateId: "template-product-report-vnext",
      templateVersionId: "template-product-report-vnext@v1",
      versionOrdinal: 1,
      sourcePackageId: "product-report-vnext",
      packageVersion: 2,
      documentVersion: 3,
      validationEvidenceStatus: "accepted",
      exportReadinessStatus: "ready-with-warnings",
      exportReadinessWarningCount: 1,
      measurementStatus: "mini-checkpoint-only",
    })
  })

  it("keeps draft identity separate and accepted pointers immutable", () => {
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
    expect(acceptedMetadata.retentionPointers).toMatchObject({
      sourcePackageTemplateSnapshotPointer: "repo://fixtures/product-report-vnext.flowdoc.json",
      validationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json",
      rawSnapshotIncludedInRootFixture: false,
      rawRendererArtifactIncluded: false,
      storageDurabilityClaimed: false,
    })
  })

  it("documents ranked sub-lanes and selects reference discovery first", () => {
    const planningDoc = readText("../docs/VARIABLE_SCHEMA_DATA_CONTRACT_PLANNING_GATE.md")

    expect(planningDoc).toContain("Status: Variable Schema / Data Contract Planning Gate complete.")
    expect(planningDoc).toContain("1. Variable reference discovery / candidate variable list.")
    expect(planningDoc).toContain("2. Variable schema metadata shape.")
    expect(planningDoc).toContain("3. Data contract validation policy.")
    expect(planningDoc).toContain("4. Missing-value/default/required policy.")
    expect(planningDoc).toContain("5. Compatibility policy with published template versions.")
    expect(planningDoc).toContain(
      "Decision: select variable reference discovery / candidate variable list as the first Variable Schema / Data Contract sub-lane.",
    )
    expect(planningDoc).toContain("Variable Reference Discovery Gate must provide JSON-safe planning evidence")
  })

  it("keeps render API deferred and schema decision as fallback only", () => {
    const planningDoc = readText("../docs/VARIABLE_SCHEMA_DATA_CONTRACT_PLANNING_GATE.md")

    expect(acceptedMetadata.metadataRepresentation).toEqual({
      representedWithoutSchemaChanges: true,
      blockers: [],
      schemaDecisionFallback: "Template Version Schema Decision Gate",
    })
    expect(planningDoc).toContain("Render API Contract remains deferred until variable/data contract evidence is clear.")
    expect(planningDoc).toContain("Template Version Schema Decision Gate is not selected")
  })

  it("keeps implementation and production behavior out of scope", () => {
    expect(Object.values(acceptedMetadata.nonWork)).toEqual(Object.values(acceptedMetadata.nonWork).map(() => false))

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("variable-schema")
    expect(rootScripts).not.toContain("render-api")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("updates status, pointer, and ledger to variable reference discovery", () => {
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(currentStatus).toContain("Status: updated after Render-Readiness Validation Policy Gate.")
    expect(currentStatus).toContain("Variable Schema / Data Contract Planning Gate.")
    expect(currentStatus).toContain("Variable Reference Discovery Gate.")
    expect(nextPointer).toContain("Status: current after Render-Readiness Validation Policy Gate.")
    expect(nextPointer).toContain("Variable Reference Discovery Gate.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(nextPointer).toContain("No Variable Schema / Data Contract implementation.")
    expect(ledger).toContain("| 209 | Variable schema data contract planning gate | done |")
    expect(ledger).toContain("## Phase 209 Variable Schema Data Contract Planning Gate")
    expect(roadmap).toContain("## Phase 209: Variable Schema / Data Contract Planning Gate")
    expect(roadmap).toContain("Current next step after Phase 209:")
    expect(roadmap).toContain("Variable Reference Discovery Gate")
    expect(roadmap).toContain("Historical Phase 208 Handoff")
    expect(readme).toContain("Variable Schema / Data Contract Planning Gate")
    expect(readme).toContain("docs/VARIABLE_SCHEMA_DATA_CONTRACT_PLANNING_GATE.md")
  })
})
