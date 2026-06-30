import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type DataContractValidationPolicyFixture = {
  policyStatus: "accepted-vocabulary-only"
  nextRecommendedWork: "Required / Missing / Default Value Policy Gate"
  attachmentTarget: RequiredMissingDefaultValuePolicyFixture["attachmentTarget"]
  candidateVariableIds: string[]
  policyDefinition: {
    acceptedValidationResultStatuses: Array<"valid" | "valid-with-warnings" | "blocked">
    blockerVocabulary: string[]
    warningVocabulary: string[]
  }
  variableValidationPolicyRows: Array<{
    variableId: string
    sourceFieldKey: string
    valueTypeCandidate: string
    displayLabelCandidate: string
    occurrenceCount: number
    tableCellValuePolicyStatus: "table-cell-context-preserved-validation-deferred" | "not-table-cell-variable"
  }>
  tableCellOccurrencePreservation: Array<{
    fieldRefId: string
    variableId: string
    tableId: string
    tableRowId: string
    tableCellId: string
    locationSummary: string
  }>
}

type RequiredMissingDefaultValuePolicyFixture = {
  policyId: "required-missing-default-value-policy-v1"
  sourceDataContractValidationPolicyGate: "Data Contract Validation Policy Gate"
  sourceDataContractValidationPolicyGateStatus: "complete"
  sourceDataContractValidationPolicyPointer: "repo://fixtures/data-contract-validation-policy.v1.json"
  sourcePolicyStatus: "accepted-vocabulary-only"
  requiredMissingDefaultPolicyStatus: "accepted-policy-metadata-only"
  nextRecommendedWork: "Compatibility Policy With Published Template Versions Gate"
  attachmentTarget: {
    publishedTemplateVersionIdentity: {
      templateId: "template-product-report-vnext"
      templateVersionId: "template-product-report-vnext@v1"
      versionOrdinal: 1
    }
    acceptedValidationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
    sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  }
  sourcePolicyConfirmation: {
    acceptedValidationResultStatuses: Array<"valid" | "valid-with-warnings" | "blocked">
    blockerVocabulary: string[]
    warningVocabulary: string[]
  }
  candidateVariableIds: string[]
  policyDefinition: {
    policyMode: "json-safe-policy-metadata-only"
    runtimeDataValidationImplemented: false
    runtimeDefaultsApplied: false
    requiredWithNoDefaultMissingResult: "blocked"
    requiredWithDefaultMetadataMissingResult: "valid-with-warnings"
    optionalMissingResult: "valid-with-warnings"
    extraVariablePolicy: {
      unknownExtraVariableResultStatus: "valid-with-warnings"
      unknownExtraVariableWarning: "extra-variable-present"
      conflictingKnownVariableResultStatus: "blocked"
      conflictingKnownVariableBlockers: ["invalid-variable-id", "type-mismatch"]
    }
    tableCellContextMismatchPolicy: {
      resultStatus: "blocked"
      blocker: "table-cell-context-mismatch"
    }
    compatibilityPolicyStatus: "deferred-to-compatibility-policy-with-published-template-versions-gate"
    renderApiContractStatus: "deferred"
  }
  variableRequiredMissingDefaultPolicyRows: Array<{
    variableId: string
    sourceFieldKey: string
    valueTypeCandidate: string
    displayLabelCandidate: string
    requiredStatus: "required" | "optional"
    missingValueBehavior:
      | "warn-default-available-not-applied"
      | "warn-optional-default-available-not-applied"
      | "block-missing-required-no-default"
    defaultValueBehavior: "metadata-default-available-not-applied" | "no-default-metadata"
    defaultValueCandidate: string | null
    blockingVsWarningBehavior: "warning" | "blocking"
    allowedValidationResultStatus: "valid-with-warnings" | "blocked"
    blockerMapping: string[]
    warningMapping: string[]
    occurrenceCount: number
    tableCellValuePolicyStatus: "table-cell-context-mismatch-blocked" | "not-table-cell-variable"
  }>
  tableCellOccurrencePreservation: Array<{
    fieldRefId: string
    variableId: string
    tableId: string
    tableRowId: string
    tableCellId: string
    tableCellValuePolicyStatus: "table-cell-context-mismatch-blocked"
    locationSummary: string
  }>
  deferredPolicyDecisions: {
    compatibilityPolicyWithPublishedTemplateVersions: "status-only-deferred-to-compatibility-policy-gate"
    renderApiContract: "deferred"
    runtimeDataValidation: "not-implemented"
    runtimeDefaultApplication: "not-implemented"
  }
  blockersBeforeCompatibilityPolicyWithPublishedTemplateVersions: unknown[]
  routeDecisions: {
    ifRequiredMissingDefaultPolicyAccepted: "Compatibility Policy With Published Template Versions Gate"
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

const dataContractPolicy = readJson<DataContractValidationPolicyFixture>(
  "../fixtures/data-contract-validation-policy.v1.json",
)
const requiredPolicy = readJson<RequiredMissingDefaultValuePolicyFixture>(
  "../fixtures/required-missing-default-value-policy.v1.json",
)

describe("required missing default value policy gate", () => {
  it("confirms the data contract validation source and candidate variables", () => {
    expect(dataContractPolicy).toMatchObject({
      policyStatus: "accepted-vocabulary-only",
      nextRecommendedWork: "Required / Missing / Default Value Policy Gate",
    })
    expect(requiredPolicy).toMatchObject({
      policyId: "required-missing-default-value-policy-v1",
      sourceDataContractValidationPolicyGate: "Data Contract Validation Policy Gate",
      sourceDataContractValidationPolicyGateStatus: "complete",
      sourceDataContractValidationPolicyPointer: "repo://fixtures/data-contract-validation-policy.v1.json",
      sourcePolicyStatus: "accepted-vocabulary-only",
      requiredMissingDefaultPolicyStatus: "accepted-policy-metadata-only",
      nextRecommendedWork: "Compatibility Policy With Published Template Versions Gate",
    })
    expect(requiredPolicy.attachmentTarget).toEqual(dataContractPolicy.attachmentTarget)
    expect(requiredPolicy.candidateVariableIds).toEqual([
      "customer.name",
      "customer.segment",
      "prepared.by",
      "report.period",
      "report.riskLevel",
      "report.total",
    ])
    expect(requiredPolicy.candidateVariableIds).toEqual(dataContractPolicy.candidateVariableIds)
  })

  it("confirms source validation statuses and blocker vocabulary", () => {
    expect(requiredPolicy.sourcePolicyConfirmation).toEqual({
      acceptedValidationResultStatuses: ["valid", "valid-with-warnings", "blocked"],
      blockerVocabulary: [
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
      ],
      warningVocabulary: [
        "extra-variable-present",
        "default-value-available-but-not-applied",
        "missing-value-policy-deferred",
      ],
    })
    expect(requiredPolicy.sourcePolicyConfirmation.acceptedValidationResultStatuses).toEqual(
      dataContractPolicy.policyDefinition.acceptedValidationResultStatuses,
    )
    expect(requiredPolicy.sourcePolicyConfirmation.blockerVocabulary).toEqual(
      dataContractPolicy.policyDefinition.blockerVocabulary,
    )
  })

  it("defines concrete required, missing, default, extra-variable, and table-cell policy metadata", () => {
    expect(requiredPolicy.policyDefinition).toEqual({
      policyVersion: 1,
      policyMode: "json-safe-policy-metadata-only",
      runtimeDataValidationImplemented: false,
      runtimeDefaultsApplied: false,
      requiredWithNoDefaultMissingResult: "blocked",
      requiredWithDefaultMetadataMissingResult: "valid-with-warnings",
      optionalMissingResult: "valid-with-warnings",
      extraVariablePolicy: {
        unknownExtraVariableResultStatus: "valid-with-warnings",
        unknownExtraVariableWarning: "extra-variable-present",
        conflictingKnownVariableResultStatus: "blocked",
        conflictingKnownVariableBlockers: ["invalid-variable-id", "type-mismatch"],
      },
      tableCellContextMismatchPolicy: {
        resultStatus: "blocked",
        blocker: "table-cell-context-mismatch",
      },
      compatibilityPolicyStatus: "deferred-to-compatibility-policy-with-published-template-versions-gate",
      renderApiContractStatus: "deferred",
    })
  })

  it("maps every validation policy row to required/missing/default behavior", () => {
    const expectedDefaultValues = new Map<string, string | null>([
      ["customer.name", "Customer"],
      ["customer.segment", "Segment"],
      ["prepared.by", "Team"],
      ["report.period", "Current Period"],
      ["report.riskLevel", "Normal"],
      ["report.total", null],
    ])
    const requiredVariables = new Set(["customer.name", "report.period", "report.riskLevel", "report.total"])

    expect(requiredPolicy.variableRequiredMissingDefaultPolicyRows).toHaveLength(
      dataContractPolicy.variableValidationPolicyRows.length,
    )

    requiredPolicy.variableRequiredMissingDefaultPolicyRows.forEach((row) => {
      const sourceRow = dataContractPolicy.variableValidationPolicyRows.find(
        (entry) => entry.variableId === row.variableId,
      )

      if (sourceRow == null) {
        throw new Error(`Missing data contract policy row for ${row.variableId}`)
      }

      expect(row).toMatchObject({
        variableId: sourceRow.variableId,
        sourceFieldKey: sourceRow.sourceFieldKey,
        valueTypeCandidate: sourceRow.valueTypeCandidate,
        displayLabelCandidate: sourceRow.displayLabelCandidate,
        occurrenceCount: sourceRow.occurrenceCount,
        defaultValueCandidate: expectedDefaultValues.get(row.variableId),
        requiredStatus: requiredVariables.has(row.variableId) ? "required" : "optional",
      })

      if (row.variableId === "report.total") {
        expect(row).toMatchObject({
          missingValueBehavior: "block-missing-required-no-default",
          defaultValueBehavior: "no-default-metadata",
          blockingVsWarningBehavior: "blocking",
          allowedValidationResultStatus: "blocked",
          blockerMapping: ["missing-required-value", "table-cell-context-mismatch"],
          warningMapping: [],
        })
      } else {
        expect(row.defaultValueBehavior).toBe("metadata-default-available-not-applied")
        expect(row.blockingVsWarningBehavior).toBe("warning")
        expect(row.allowedValidationResultStatus).toBe("valid-with-warnings")
        expect(row.blockerMapping).not.toContain("missing-required-value")
        expect(row.warningMapping).toEqual(["default-value-available-but-not-applied"])
      }
    })
  })

  it("preserves table-cell context and deferred next-lane routing", () => {
    expect(requiredPolicy.tableCellOccurrencePreservation).toEqual(
      dataContractPolicy.tableCellOccurrencePreservation.map((entry) => ({
        ...entry,
        tableCellValuePolicyStatus: "table-cell-context-mismatch-blocked",
      })),
    )
    expect(requiredPolicy.variableRequiredMissingDefaultPolicyRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          variableId: "report.total",
          tableCellValuePolicyStatus: "table-cell-context-mismatch-blocked",
        }),
        expect.objectContaining({
          variableId: "report.riskLevel",
          tableCellValuePolicyStatus: "table-cell-context-mismatch-blocked",
        }),
      ]),
    )
    expect(requiredPolicy.deferredPolicyDecisions).toEqual({
      compatibilityPolicyWithPublishedTemplateVersions: "status-only-deferred-to-compatibility-policy-gate",
      renderApiContract: "deferred",
      runtimeDataValidation: "not-implemented",
      runtimeDefaultApplication: "not-implemented",
    })
    expect(requiredPolicy.blockersBeforeCompatibilityPolicyWithPublishedTemplateVersions).toEqual([])
    expect(requiredPolicy.routeDecisions).toEqual({
      ifRequiredMissingDefaultPolicyAccepted: "Compatibility Policy With Published Template Versions Gate",
      ifSchemaMutationNeeded: "Template Version Schema Decision Gate",
      ifVariableMetadataInsufficient: "Variable Metadata Resolution Decision Gate",
    })
  })

  it("keeps runtime implementation and production behavior out of scope", () => {
    expect(Object.values(requiredPolicy.nonWork)).toEqual(Object.values(requiredPolicy.nonWork).map(() => false))

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("required-missing-default")
    expect(rootScripts).not.toContain("compatibility-policy")
    expect(rootScripts).not.toContain("render-api")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to compatibility policy", () => {
    const policyDoc = readText("../docs/REQUIRED_MISSING_DEFAULT_VALUE_POLICY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(policyDoc).toContain("Status: Required / Missing / Default Value Policy Gate complete.")
    expect(policyDoc).toContain("fixtures/required-missing-default-value-policy.v1.json")
    expect(policyDoc).toContain("accepted-policy-metadata-only")
    expect(policyDoc).toContain("Compatibility Policy With Published Template Versions Gate.")
    expect(policyDoc).toContain("## PASS")
    expect(policyDoc).toContain("## FAIL-BLOCKER")
    expect(policyDoc).toContain("## RISK")
    expect(policyDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Compatibility Policy With Published Template Versions Gate.")
    expect(currentStatus).toContain("Required / Missing / Default Value Policy Gate.")
    expect(currentStatus).toContain("Compatibility Policy With Published Template Versions Gate.")
    expect(nextPointer).toContain("Status: current after Compatibility Policy With Published Template Versions Gate.")
    expect(nextPointer).toContain("Compatibility Policy With Published Template Versions Gate.")
    expect(nextPointer).toContain("No runtime data validation implementation.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(ledger).toContain("| 213 | Required missing default value policy gate | done |")
    expect(ledger).toContain("## Phase 213 Required Missing Default Value Policy Gate")
    expect(roadmap).toContain("## Phase 213: Required Missing Default Value Policy Gate")
    expect(roadmap).toContain("Current next step after Phase 213:")
    expect(roadmap).toContain("Compatibility Policy With Published Template Versions Gate")
    expect(roadmap).toContain("Historical Phase 212 Handoff")
    expect(readme).toContain("Required / Missing / Default Value Policy Gate")
    expect(readme).toContain("docs/REQUIRED_MISSING_DEFAULT_VALUE_POLICY_GATE.md")
  })
})
