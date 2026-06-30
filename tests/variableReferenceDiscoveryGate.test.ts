import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  assessVNextKeyDataDiagnostics,
  collectVNextDocumentFieldRefUsages,
  parseFlowDocPackageV2DocumentVNext,
} from "../src/index.js"

type DiscoveryFixture = {
  discoveryId: "variable-reference-discovery-v1"
  sourcePlanningGateStatus: "complete"
  selectedSubLane: "Variable Reference Discovery / candidate variable list"
  discoveryStatus: "accepted"
  nextRecommendedWork: "Variable Schema Metadata Shape Gate"
  attachmentTarget: {
    publishedTemplateVersionIdentity: {
      templateId: string
      templateVersionId: "template-product-report-vnext@v1"
      versionOrdinal: number
    }
    acceptedValidationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
    sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  }
  sourceSnapshot: {
    pointer: "fixtures/product-report-vnext.flowdoc.json"
    packageParseStatus: "ready"
    packageId: "product-report-vnext"
    documentId: "product-report-vnext"
    packageVersion: 2
    documentVersion: 3
  }
  discoverySourceScope: {
    scopeId: "authored-inline-field-ref-v1"
    included: string[]
    excluded: string[]
  }
  summary: {
    fieldRefOccurrenceCount: number
    candidateVariableCount: number
    registryFieldCount: number
    unresolvedReferenceCount: number
    unsupportedReferenceCount: number
    duplicateCandidateIdCount: number
    packageDocumentSchemaMutated: boolean
    renderApiContractDeferred: boolean
  }
  occurrenceInventory: Array<{
    fieldRefId: string
    key: string
    textBlockId: string
    sectionId: string
    zoneId: string
    tableId?: string
    tableRowId?: string
    tableCellId?: string
    inlineIndex: number
    path: string
    fallback?: string
    registryStatus: "resolved"
    locationSummary: string
  }>
  candidateVariableIds: string[]
  candidateVariables: Array<{
    key: string
    label: string
    fieldType: string
    registryFallback: string | null
    dataValuePresent: boolean
    registryStatus: "resolved"
    occurrenceCount: number
    occurrenceIds: string[]
    duplicateOccurrenceStatus: "single-occurrence" | "multiple-authored-occurrences-accepted"
  }>
  crossReference: {
    fieldRegistryStatus: "all-discovered-refs-resolved"
    unresolvedReferences: unknown[]
    unsupportedReferences: unknown[]
    duplicateCandidateStatus: "no-duplicate-candidate-ids"
    duplicateCandidateIds: unknown[]
  }
  blockersBeforeVariableSchemaMetadataShape: unknown[]
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

const discovery = readJson<DiscoveryFixture>("../fixtures/variable-reference-discovery.v1.json")
const sourcePackage = parseFlowDocPackageV2DocumentVNext(
  readJson<unknown>("../fixtures/product-report-vnext.flowdoc.json"),
)

describe("variable reference discovery gate", () => {
  it("confirms planning source and accepted template attachment target", () => {
    expect(discovery).toMatchObject({
      discoveryId: "variable-reference-discovery-v1",
      sourcePlanningGateStatus: "complete",
      selectedSubLane: "Variable Reference Discovery / candidate variable list",
      discoveryStatus: "accepted",
      nextRecommendedWork: "Variable Schema Metadata Shape Gate",
    })
    expect(discovery.attachmentTarget).toEqual({
      publishedTemplateVersionIdentity: {
        templateId: "template-product-report-vnext",
        templateVersionId: "template-product-report-vnext@v1",
        versionOrdinal: 1,
      },
      acceptedValidationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json",
      sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json",
    })
    expect(discovery.sourceSnapshot).toEqual({
      pointer: "fixtures/product-report-vnext.flowdoc.json",
      packageParseStatus: "ready",
      packageId: sourcePackage.id,
      documentId: sourcePackage.document.document.id,
      packageVersion: sourcePackage.packageVersion,
      documentVersion: sourcePackage.document.version,
    })
  })

  it("matches the core authored field-ref usage collector", () => {
    const usages = collectVNextDocumentFieldRefUsages(sourcePackage.document)

    expect(discovery.summary.fieldRefOccurrenceCount).toBe(usages.length)
    expect(discovery.occurrenceInventory).toEqual(
      usages.map((usage) => ({
        fieldRefId: usage.fieldRefId,
        key: usage.key,
        textBlockId: usage.textBlockId,
        sectionId: usage.sectionId,
        zoneId: usage.zoneId,
        ...(usage.tableId == null ? {} : { tableId: usage.tableId }),
        ...(usage.tableRowId == null ? {} : { tableRowId: usage.tableRowId }),
        ...(usage.tableCellId == null ? {} : { tableCellId: usage.tableCellId }),
        inlineIndex: usage.inlineIndex,
        path: usage.path,
        ...(usage.fallback == null ? {} : { fallback: usage.fallback }),
        registryStatus: "resolved",
        locationSummary: [
          usage.sectionId,
          usage.zoneId,
          usage.tableId,
          usage.tableRowId,
          usage.tableCellId,
          usage.textBlockId,
        ].filter(Boolean).join("/"),
      })),
    )
  })

  it("produces candidate variable ids and registry-backed candidate summaries", () => {
    const usages = collectVNextDocumentFieldRefUsages(sourcePackage.document)
    const expectedCandidateIds = [...new Set(usages.map((usage) => usage.key))].sort()

    expect(discovery.candidateVariableIds).toEqual(expectedCandidateIds)
    expect(discovery.summary.candidateVariableCount).toBe(expectedCandidateIds.length)
    expect(discovery.summary.registryFieldCount).toBe(Object.keys(sourcePackage.fields.fields).length)

    discovery.candidateVariables.forEach((candidate) => {
      const definition = sourcePackage.fields.fields[candidate.key]
      const usageIds = usages.filter((usage) => usage.key === candidate.key).map((usage) => usage.fieldRefId)

      expect(definition).toBeDefined()
      expect(candidate).toMatchObject({
        label: definition.label,
        fieldType: definition.type,
        registryFallback: definition.fallback ?? null,
        dataValuePresent: Object.hasOwn(sourcePackage.data?.values ?? {}, candidate.key),
        registryStatus: "resolved",
        occurrenceCount: usageIds.length,
        occurrenceIds: usageIds,
      })
    })
  })

  it("records no unresolved, unsupported, duplicate, or metadata-shape blockers", () => {
    const diagnostics = assessVNextKeyDataDiagnostics(
      sourcePackage.document,
      sourcePackage.fields,
      sourcePackage.data,
    )

    expect(diagnostics.status).toBe("ready")
    expect(diagnostics.summary).toMatchObject({
      errorCount: 0,
      warningCount: 0,
      usageCount: discovery.summary.fieldRefOccurrenceCount,
    })
    expect(discovery.crossReference).toEqual({
      fieldRegistryStatus: "all-discovered-refs-resolved",
      unresolvedReferences: [],
      unsupportedReferences: [],
      duplicateCandidateStatus: "no-duplicate-candidate-ids",
      duplicateCandidateIds: [],
    })
    expect(discovery.summary).toMatchObject({
      unresolvedReferenceCount: 0,
      unsupportedReferenceCount: 0,
      duplicateCandidateIdCount: 0,
      packageDocumentSchemaMutated: false,
      renderApiContractDeferred: true,
    })
    expect(discovery.blockersBeforeVariableSchemaMetadataShape).toEqual([])
  })

  it("keeps implementation and production behavior out of scope", () => {
    expect(Object.values(discovery.nonWork)).toEqual(Object.values(discovery.nonWork).map(() => false))

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("variable-reference")
    expect(rootScripts).not.toContain("render-api")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to variable schema metadata shape", () => {
    const discoveryDoc = readText("../docs/VARIABLE_REFERENCE_DISCOVERY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(discoveryDoc).toContain("Status: Variable Reference Discovery Gate complete.")
    expect(discoveryDoc).toContain("fixtures/variable-reference-discovery.v1.json")
    expect(discoveryDoc).toContain("field-ref occurrence count: `11`")
    expect(discoveryDoc).toContain("candidate variable count: `6`")
    expect(discoveryDoc).toContain("Variable Schema Metadata Shape Gate.")
    expect(discoveryDoc).toContain("## PASS")
    expect(discoveryDoc).toContain("## FAIL-BLOCKER")
    expect(discoveryDoc).toContain("## RISK")
    expect(discoveryDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Render API Request Envelope Contract Gate.")
    expect(currentStatus).toContain("Variable Reference Discovery Gate.")
    expect(currentStatus).toContain("Variable Schema Metadata Shape Gate.")
    expect(nextPointer).toContain("Status: current after Render API Request Envelope Contract Gate.")
    expect(nextPointer).toContain("Variable Schema Metadata Shape Gate.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(nextPointer).toContain("No full Variable Schema / Data Contract implementation.")
    expect(ledger).toContain("| 210 | Variable reference discovery gate | done |")
    expect(ledger).toContain("## Phase 210 Variable Reference Discovery Gate")
    expect(roadmap).toContain("## Phase 210: Variable Reference Discovery Gate")
    expect(roadmap).toContain("Current next step after Phase 210:")
    expect(roadmap).toContain("Variable Schema Metadata Shape Gate")
    expect(roadmap).toContain("Historical Phase 209 Handoff")
    expect(readme).toContain("Variable Reference Discovery Gate")
    expect(readme).toContain("docs/VARIABLE_REFERENCE_DISCOVERY_GATE.md")
  })
})
