import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { parseFlowDocPackageV2DocumentVNext } from "../src/index.js"

type DiscoveryFixture = {
  discoveryStatus: "accepted"
  nextRecommendedWork: "Variable Schema Metadata Shape Gate"
  attachmentTarget: MetadataShapeFixture["attachmentTarget"]
  summary: {
    fieldRefOccurrenceCount: number
    candidateVariableCount: number
    registryFieldCount: number
    unresolvedReferenceCount: number
    unsupportedReferenceCount: number
    duplicateCandidateIdCount: number
  }
  occurrenceInventory: Array<{
    fieldRefId: string
    key: string
    tableId?: string
    tableRowId?: string
    tableCellId?: string
    locationSummary: string
  }>
  candidateVariableIds: string[]
  candidateVariables: Array<{
    key: string
    label: string
    fieldType: string
    occurrenceCount: number
    occurrenceIds: string[]
    registryStatus: "resolved"
  }>
}

type MetadataShapeFixture = {
  metadataShapeId: "variable-schema-metadata-shape-v1"
  sourceDiscoveryGate: "Variable Reference Discovery Gate"
  sourceDiscoveryGateStatus: "complete"
  sourceDiscoveryEvidencePointer: "repo://fixtures/variable-reference-discovery.v1.json"
  metadataShapeStatus: "accepted"
  nextRecommendedWork: "Data Contract Validation Policy Gate"
  attachmentTarget: {
    publishedTemplateVersionIdentity: {
      templateId: "template-product-report-vnext"
      templateVersionId: "template-product-report-vnext@v1"
      versionOrdinal: 1
    }
    acceptedValidationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
    sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  }
  discoverySummaryConfirmation: DiscoveryFixture["summary"]
  candidateVariableIds: string[]
  metadataShapeDefinition: {
    rowShapeFields: string[]
    variableIdPolicy: "use-source-field-key-until-alias-policy-exists"
    valueTypeCandidateSource: "package-field-registry-type"
    displayLabelCandidateSource: "package-field-registry-label"
    occurrenceContextSource: "variable-reference-discovery-occurrence-inventory"
    policyStatusVocabulary: {
      requiredPolicyStatus: ["deferred-policy"]
      defaultPolicyStatus: ["deferred-policy"]
      validationPolicyStatus: ["deferred-until-data-contract-validation-policy-gate"]
      compatibilityStatus: ["pending-published-template-version-policy"]
    }
  }
  variableMetadata: Array<{
    variableId: string
    sourceFieldKey: string
    valueTypeCandidate: string
    displayLabelCandidate: string
    occurrenceCount: number
    occurrenceContextSummary: {
      occurrenceIds: string[]
      locationSummaries: string[]
      hasTableCellOccurrence: boolean
      tableCellOccurrenceIds: string[]
    }
    registryStatus: "resolved"
    requiredPolicyStatus: "deferred-policy"
    defaultPolicyStatus: "deferred-policy"
    validationPolicyStatus: "deferred-until-data-contract-validation-policy-gate"
    compatibilityStatus: "pending-published-template-version-policy"
  }>
  tableCellOccurrencePreservation: Array<{
    fieldRefId: string
    variableId: string
    tableId: string
    tableRowId: string
    tableCellId: string
    locationSummary: string
  }>
  blockersBeforeDataContractValidationPolicy: unknown[]
  routeDecisions: {
    ifMetadataShapeAccepted: "Data Contract Validation Policy Gate"
    ifSchemaMutationNeeded: "Template Version Schema Decision Gate"
    ifAliasOrDisplayMetadataUnresolved: "Variable Metadata Resolution Decision Gate"
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

const discovery = readJson<DiscoveryFixture>("../fixtures/variable-reference-discovery.v1.json")
const metadataShape = readJson<MetadataShapeFixture>("../fixtures/variable-schema-metadata-shape.v1.json")
const sourcePackage = parseFlowDocPackageV2DocumentVNext(
  readJson<unknown>("../fixtures/product-report-vnext.flowdoc.json"),
)

describe("variable schema metadata shape gate", () => {
  it("confirms the discovery source, attachment target, and summary counts", () => {
    expect(discovery).toMatchObject({
      discoveryStatus: "accepted",
      nextRecommendedWork: "Variable Schema Metadata Shape Gate",
    })
    expect(metadataShape).toMatchObject({
      metadataShapeId: "variable-schema-metadata-shape-v1",
      sourceDiscoveryGate: "Variable Reference Discovery Gate",
      sourceDiscoveryGateStatus: "complete",
      sourceDiscoveryEvidencePointer: "repo://fixtures/variable-reference-discovery.v1.json",
      metadataShapeStatus: "accepted",
      nextRecommendedWork: "Data Contract Validation Policy Gate",
    })
    expect(metadataShape.attachmentTarget).toEqual(discovery.attachmentTarget)
    expect(metadataShape.discoverySummaryConfirmation).toEqual(discovery.summary)
    expect(metadataShape.discoverySummaryConfirmation).toMatchObject({
      fieldRefOccurrenceCount: 11,
      candidateVariableCount: 6,
      registryFieldCount: 6,
      unresolvedReferenceCount: 0,
      unsupportedReferenceCount: 0,
      duplicateCandidateIdCount: 0,
    })
  })

  it("defines the required JSON-safe row shape and deferred policy statuses", () => {
    expect(metadataShape.candidateVariableIds).toEqual([
      "customer.name",
      "customer.segment",
      "prepared.by",
      "report.period",
      "report.riskLevel",
      "report.total",
    ])
    expect(metadataShape.candidateVariableIds).toEqual(discovery.candidateVariableIds)
    expect(metadataShape.metadataShapeDefinition.rowShapeFields).toEqual([
      "variableId",
      "sourceFieldKey",
      "valueTypeCandidate",
      "displayLabelCandidate",
      "occurrenceCount",
      "occurrenceContextSummary",
      "registryStatus",
      "requiredPolicyStatus",
      "defaultPolicyStatus",
      "validationPolicyStatus",
      "compatibilityStatus",
    ])
    expect(metadataShape.metadataShapeDefinition).toMatchObject({
      variableIdPolicy: "use-source-field-key-until-alias-policy-exists",
      valueTypeCandidateSource: "package-field-registry-type",
      displayLabelCandidateSource: "package-field-registry-label",
      occurrenceContextSource: "variable-reference-discovery-occurrence-inventory",
      policyStatusVocabulary: {
        requiredPolicyStatus: ["deferred-policy"],
        defaultPolicyStatus: ["deferred-policy"],
        validationPolicyStatus: ["deferred-until-data-contract-validation-policy-gate"],
        compatibilityStatus: ["pending-published-template-version-policy"],
      },
    })
  })

  it("maps every discovered candidate variable to registry-backed metadata", () => {
    expect(metadataShape.variableMetadata).toHaveLength(discovery.candidateVariables.length)

    metadataShape.variableMetadata.forEach((row) => {
      const candidate = discovery.candidateVariables.find((entry) => entry.key === row.sourceFieldKey)
      const definition = sourcePackage.fields.fields[row.sourceFieldKey]
      const occurrences = discovery.occurrenceInventory.filter((entry) => entry.key === row.sourceFieldKey)
      const tableOccurrences = occurrences.filter((entry) => entry.tableCellId != null)

      if (candidate == null) {
        throw new Error(`Missing discovery candidate for ${row.sourceFieldKey}`)
      }
      if (definition == null) {
        throw new Error(`Missing field registry definition for ${row.sourceFieldKey}`)
      }

      expect(row).toMatchObject({
        variableId: candidate.key,
        sourceFieldKey: candidate.key,
        valueTypeCandidate: definition.type,
        displayLabelCandidate: definition.label,
        occurrenceCount: candidate.occurrenceCount,
        registryStatus: candidate.registryStatus,
        requiredPolicyStatus: "deferred-policy",
        defaultPolicyStatus: "deferred-policy",
        validationPolicyStatus: "deferred-until-data-contract-validation-policy-gate",
        compatibilityStatus: "pending-published-template-version-policy",
      })
      expect(row.occurrenceContextSummary).toEqual({
        occurrenceIds: candidate.occurrenceIds,
        locationSummaries: occurrences.map((entry) => entry.locationSummary),
        hasTableCellOccurrence: tableOccurrences.length > 0,
        tableCellOccurrenceIds: tableOccurrences.map((entry) => entry.fieldRefId),
      })
    })
  })

  it("preserves table-cell occurrence context without mutating schema", () => {
    expect(metadataShape.tableCellOccurrencePreservation).toEqual([
      {
        fieldRefId: "metric-value-total-field",
        variableId: "report.total",
        tableId: "body-metrics-table",
        tableRowId: "metrics-data-row",
        tableCellId: "metric-value-total",
        locationSummary:
          "section-body/body-main/body-metrics-table/metrics-data-row/metric-value-total/metric-value-total-text",
      },
      {
        fieldRefId: "metric-value-risk-field",
        variableId: "report.riskLevel",
        tableId: "body-metrics-table",
        tableRowId: "metrics-data-row",
        tableCellId: "metric-value-risk",
        locationSummary:
          "section-body/body-main/body-metrics-table/metrics-data-row/metric-value-risk/metric-value-risk-text",
      },
    ])

    metadataShape.tableCellOccurrencePreservation.forEach((entry) => {
      const sourceOccurrence = discovery.occurrenceInventory.find(
        (occurrence) => occurrence.fieldRefId === entry.fieldRefId,
      )

      expect(sourceOccurrence).toMatchObject({
        key: entry.variableId,
        tableId: entry.tableId,
        tableRowId: entry.tableRowId,
        tableCellId: entry.tableCellId,
        locationSummary: entry.locationSummary,
      })
    })
    expect(metadataShape.blockersBeforeDataContractValidationPolicy).toEqual([])
    expect(metadataShape.routeDecisions).toEqual({
      ifMetadataShapeAccepted: "Data Contract Validation Policy Gate",
      ifSchemaMutationNeeded: "Template Version Schema Decision Gate",
      ifAliasOrDisplayMetadataUnresolved: "Variable Metadata Resolution Decision Gate",
    })
  })

  it("keeps implementation and production behavior out of scope", () => {
    expect(Object.values(metadataShape.nonWork)).toEqual(Object.values(metadataShape.nonWork).map(() => false))

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("variable-schema-metadata")
    expect(rootScripts).not.toContain("data-contract-validation")
    expect(rootScripts).not.toContain("render-api")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to data contract validation policy", () => {
    const metadataDoc = readText("../docs/VARIABLE_SCHEMA_METADATA_SHAPE_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(metadataDoc).toContain("Status: Variable Schema Metadata Shape Gate complete.")
    expect(metadataDoc).toContain("fixtures/variable-schema-metadata-shape.v1.json")
    expect(metadataDoc).toContain("requiredPolicyStatus = deferred-policy")
    expect(metadataDoc).toContain("Data Contract Validation Policy Gate.")
    expect(metadataDoc).toContain("## PASS")
    expect(metadataDoc).toContain("## FAIL-BLOCKER")
    expect(metadataDoc).toContain("## RISK")
    expect(metadataDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Render API Response / Status Contract Gate.")
    expect(currentStatus).toContain("Variable Schema Metadata Shape Gate.")
    expect(currentStatus).toContain("Data Contract Validation Policy Gate.")
    expect(nextPointer).toContain("Status: current after Render API Response / Status Contract Gate.")
    expect(nextPointer).toContain("Data Contract Validation Policy Gate.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(nextPointer).toContain("No runtime data validation implementation.")
    expect(ledger).toContain("| 211 | Variable schema metadata shape gate | done |")
    expect(ledger).toContain("## Phase 211 Variable Schema Metadata Shape Gate")
    expect(roadmap).toContain("## Phase 211: Variable Schema Metadata Shape Gate")
    expect(roadmap).toContain("Current next step after Phase 211:")
    expect(roadmap).toContain("Data Contract Validation Policy Gate")
    expect(roadmap).toContain("Historical Phase 210 Handoff")
    expect(readme).toContain("Variable Schema Metadata Shape Gate")
    expect(readme).toContain("docs/VARIABLE_SCHEMA_METADATA_SHAPE_GATE.md")
  })
})
