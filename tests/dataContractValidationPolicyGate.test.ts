import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type MetadataShapeFixture = {
  metadataShapeStatus: "accepted"
  nextRecommendedWork: "Data Contract Validation Policy Gate"
  attachmentTarget: DataContractValidationPolicyFixture["attachmentTarget"]
  candidateVariableIds: string[]
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
}

type DataContractValidationPolicyFixture = {
  policyId: "data-contract-validation-policy-v1"
  sourceMetadataShapeGate: "Variable Schema Metadata Shape Gate"
  sourceMetadataShapeGateStatus: "complete"
  sourceMetadataShapePointer: "repo://fixtures/variable-schema-metadata-shape.v1.json"
  policyStatus: "accepted-vocabulary-only"
  nextRecommendedWork: "Required / Missing / Default Value Policy Gate"
  attachmentTarget: {
    publishedTemplateVersionIdentity: {
      templateId: "template-product-report-vnext"
      templateVersionId: "template-product-report-vnext@v1"
      versionOrdinal: 1
    }
    acceptedValidationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
    sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  }
  metadataShapeConfirmation: {
    metadataShapeStatus: "accepted"
    candidateVariableCount: number
    tableCellOccurrenceContextPreserved: boolean
    blockersBeforeDataContractValidationPolicy: unknown[]
  }
  candidateVariableIds: string[]
  policyDefinition: {
    policyMode: "json-safe-vocabulary-only"
    acceptedValidationResultStatuses: Array<"valid" | "valid-with-warnings" | "blocked">
    validationStatusVocabulary: {
      typeValidationStatus: string[]
      requiredFieldValidationStatus: string[]
      missingValueValidationStatus: string[]
      defaultValueHandlingStatus: string[]
      unsupportedValueStatus: string[]
      unknownVariableStatus: string[]
      extraVariablePolicy: string[]
      tableCellValuePolicyStatus: string[]
    }
    blockerVocabulary: string[]
    warningVocabulary: string[]
  }
  variableValidationPolicyRows: Array<{
    variableId: string
    sourceFieldKey: string
    valueTypeCandidate: string
    displayLabelCandidate: string
    occurrenceCount: number
    occurrenceContextSummary: MetadataShapeFixture["variableMetadata"][number]["occurrenceContextSummary"]
    typeValidationStatus: "type-candidate-accepted"
    requiredFieldValidationStatus: "deferred-required-policy"
    missingValueValidationStatus: "deferred-missing-value-policy"
    defaultValueHandlingStatus: "deferred-default-policy"
    unsupportedValueStatus: "unsupported-value-blocked"
    unknownVariableStatus: "unknown-variable-blocked"
    extraVariablePolicy: "extra-variable-warning"
    tableCellValuePolicyStatus: "table-cell-context-preserved-validation-deferred" | "not-table-cell-variable"
  }>
  tableCellOccurrencePreservation: Array<{
    fieldRefId: string
    variableId: string
    tableId: string
    tableRowId: string
    tableCellId: string
    tableCellValuePolicyStatus: "table-cell-context-preserved-validation-deferred"
    locationSummary: string
  }>
  deferredPolicyDecisions: {
    requiredMissingDefaultValueDetailedBehavior: "deferred-to-required-missing-default-value-policy-gate"
    compatibilityPolicyWithPublishedTemplateVersions: "deferred-to-compatibility-policy-gate"
    renderApiContract: "deferred"
    runtimeDataValidation: "not-implemented"
  }
  blockersBeforeRequiredMissingDefaultValuePolicy: unknown[]
  routeDecisions: {
    ifPolicyVocabularyAccepted: "Required / Missing / Default Value Policy Gate"
    ifSchemaMutationNeeded: "Template Version Schema Decision Gate"
    ifVariableMetadataInsufficient: "Variable Metadata Resolution Decision Gate"
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

const metadataShape = readJson<MetadataShapeFixture>("../fixtures/variable-schema-metadata-shape.v1.json")
const validationPolicy = readJson<DataContractValidationPolicyFixture>(
  "../fixtures/data-contract-validation-policy.v1.json",
)

describe("data contract validation policy gate", () => {
  it("confirms metadata shape source and accepted attachment target", () => {
    expect(metadataShape).toMatchObject({
      metadataShapeStatus: "accepted",
      nextRecommendedWork: "Data Contract Validation Policy Gate",
    })
    expect(validationPolicy).toMatchObject({
      policyId: "data-contract-validation-policy-v1",
      sourceMetadataShapeGate: "Variable Schema Metadata Shape Gate",
      sourceMetadataShapeGateStatus: "complete",
      sourceMetadataShapePointer: "repo://fixtures/variable-schema-metadata-shape.v1.json",
      policyStatus: "accepted-vocabulary-only",
      nextRecommendedWork: "Required / Missing / Default Value Policy Gate",
    })
    expect(validationPolicy.attachmentTarget).toEqual(metadataShape.attachmentTarget)
    expect(validationPolicy.metadataShapeConfirmation).toEqual({
      metadataShapeStatus: "accepted",
      candidateVariableCount: metadataShape.candidateVariableIds.length,
      tableCellOccurrenceContextPreserved: true,
      blockersBeforeDataContractValidationPolicy: metadataShape.blockersBeforeDataContractValidationPolicy,
    })
  })

  it("defines candidate variables, result statuses, validation vocabulary, blockers, and warnings", () => {
    expect(validationPolicy.candidateVariableIds).toEqual([
      "customer.name",
      "customer.segment",
      "prepared.by",
      "report.period",
      "report.riskLevel",
      "report.total",
    ])
    expect(validationPolicy.candidateVariableIds).toEqual(metadataShape.candidateVariableIds)
    expect(validationPolicy.policyDefinition).toMatchObject({
      policyMode: "json-safe-vocabulary-only",
      acceptedValidationResultStatuses: ["valid", "valid-with-warnings", "blocked"],
    })
    expect(validationPolicy.policyDefinition.validationStatusVocabulary).toEqual({
      typeValidationStatus: ["type-candidate-accepted", "type-mismatch-blocked", "type-unknown-blocked"],
      requiredFieldValidationStatus: [
        "deferred-required-policy",
        "required-present",
        "required-missing-blocked",
      ],
      missingValueValidationStatus: [
        "deferred-missing-value-policy",
        "missing-value-warning",
        "missing-value-blocked",
      ],
      defaultValueHandlingStatus: [
        "deferred-default-policy",
        "default-available-warning",
        "default-not-applied",
      ],
      unsupportedValueStatus: ["unsupported-value-blocked"],
      unknownVariableStatus: ["unknown-variable-blocked"],
      extraVariablePolicy: ["extra-variable-warning"],
      tableCellValuePolicyStatus: [
        "table-cell-context-preserved-validation-deferred",
        "not-table-cell-variable",
      ],
    })
    expect(validationPolicy.policyDefinition.blockerVocabulary).toEqual([
      "invalid-payload-shape",
      "missing-published-template-version-identity",
      "metadata-shape-context-mismatch",
      "unknown-variable",
      "type-mismatch",
      "unsupported-value",
      "missing-required-value",
      "invalid-variable-id",
      "table-cell-context-mismatch",
      "schema-mutation-required",
    ])
    expect(validationPolicy.policyDefinition.warningVocabulary).toEqual([
      "extra-variable-present",
      "default-value-available-but-not-applied",
      "missing-value-policy-deferred",
    ])
  })

  it("maps every metadata row to a validation policy row without executing validation", () => {
    expect(validationPolicy.variableValidationPolicyRows).toHaveLength(metadataShape.variableMetadata.length)

    validationPolicy.variableValidationPolicyRows.forEach((row) => {
      const metadataRow = metadataShape.variableMetadata.find((entry) => entry.variableId === row.variableId)

      if (metadataRow == null) {
        throw new Error(`Missing metadata row for ${row.variableId}`)
      }

      expect(row).toMatchObject({
        variableId: metadataRow.variableId,
        sourceFieldKey: metadataRow.sourceFieldKey,
        valueTypeCandidate: metadataRow.valueTypeCandidate,
        displayLabelCandidate: metadataRow.displayLabelCandidate,
        occurrenceCount: metadataRow.occurrenceCount,
        occurrenceContextSummary: metadataRow.occurrenceContextSummary,
        typeValidationStatus: "type-candidate-accepted",
        requiredFieldValidationStatus: "deferred-required-policy",
        missingValueValidationStatus: "deferred-missing-value-policy",
        defaultValueHandlingStatus: "deferred-default-policy",
        unsupportedValueStatus: "unsupported-value-blocked",
        unknownVariableStatus: "unknown-variable-blocked",
        extraVariablePolicy: "extra-variable-warning",
      })
      expect(row.tableCellValuePolicyStatus).toBe(
        metadataRow.occurrenceContextSummary.hasTableCellOccurrence
          ? "table-cell-context-preserved-validation-deferred"
          : "not-table-cell-variable",
      )
    })
  })

  it("preserves table-cell occurrence context and routing decisions", () => {
    expect(validationPolicy.tableCellOccurrencePreservation).toEqual(
      metadataShape.tableCellOccurrencePreservation.map((entry) => ({
        ...entry,
        tableCellValuePolicyStatus: "table-cell-context-preserved-validation-deferred",
      })),
    )
    expect(validationPolicy.deferredPolicyDecisions).toEqual({
      requiredMissingDefaultValueDetailedBehavior: "deferred-to-required-missing-default-value-policy-gate",
      compatibilityPolicyWithPublishedTemplateVersions: "deferred-to-compatibility-policy-gate",
      renderApiContract: "deferred",
      runtimeDataValidation: "not-implemented",
    })
    expect(validationPolicy.blockersBeforeRequiredMissingDefaultValuePolicy).toEqual([])
    expect(validationPolicy.routeDecisions).toEqual({
      ifPolicyVocabularyAccepted: "Required / Missing / Default Value Policy Gate",
      ifSchemaMutationNeeded: "Template Version Schema Decision Gate",
      ifVariableMetadataInsufficient: "Variable Metadata Resolution Decision Gate",
    })
  })

  it("keeps runtime implementation and production behavior out of scope", () => {
    expect(Object.values(validationPolicy.nonWork)).toEqual(Object.values(validationPolicy.nonWork).map(() => false))

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("data-contract-validation")
    expect(rootScripts).not.toContain("required-missing-default")
    expect(rootScripts).not.toContain("render-api")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to required missing default value policy", () => {
    const policyDoc = readText("../docs/DATA_CONTRACT_VALIDATION_POLICY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(policyDoc).toContain("Status: Data Contract Validation Policy Gate complete.")
    expect(policyDoc).toContain("fixtures/data-contract-validation-policy.v1.json")
    expect(policyDoc).toContain("accepted-vocabulary-only")
    expect(policyDoc).toContain("Required / Missing / Default Value Policy Gate.")
    expect(policyDoc).toContain("## PASS")
    expect(policyDoc).toContain("## FAIL-BLOCKER")
    expect(policyDoc).toContain("## RISK")
    expect(policyDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Compatibility Policy With Published Template Versions Gate.")
    expect(currentStatus).toContain("Data Contract Validation Policy Gate.")
    expect(currentStatus).toContain("Required / Missing / Default Value Policy Gate.")
    expect(nextPointer).toContain("Status: current after Compatibility Policy With Published Template Versions Gate.")
    expect(nextPointer).toContain("Required / Missing / Default Value Policy Gate.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(nextPointer).toContain("No runtime data validation implementation.")
    expect(ledger).toContain("| 212 | Data contract validation policy gate | done |")
    expect(ledger).toContain("## Phase 212 Data Contract Validation Policy Gate")
    expect(roadmap).toContain("## Phase 212: Data Contract Validation Policy Gate")
    expect(roadmap).toContain("Current next step after Phase 212:")
    expect(roadmap).toContain("Required / Missing / Default Value Policy Gate")
    expect(roadmap).toContain("Historical Phase 211 Handoff")
    expect(readme).toContain("Data Contract Validation Policy Gate")
    expect(readme).toContain("docs/DATA_CONTRACT_VALIDATION_POLICY_GATE.md")
  })
})
