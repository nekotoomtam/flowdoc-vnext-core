import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

type RequiredMissingDefaultValuePolicyFixture = {
  requiredMissingDefaultPolicyStatus: "accepted-policy-metadata-only"
  nextRecommendedWork: "Compatibility Policy With Published Template Versions Gate"
  attachmentTarget: VariableCompatibilityPolicyFixture["attachmentTarget"]
  candidateVariableIds: string[]
  policyDefinition: {
    runtimeDataValidationImplemented: false
    runtimeDefaultsApplied: false
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
  }
  variableRequiredMissingDefaultPolicyRows: Array<{
    variableId: string
    valueTypeCandidate: string
    displayLabelCandidate: string
    requiredStatus: "required" | "optional"
    defaultValueCandidate: string | null
    allowedValidationResultStatus: "valid-with-warnings" | "blocked"
    tableCellValuePolicyStatus: "table-cell-context-mismatch-blocked" | "not-table-cell-variable"
  }>
  tableCellOccurrencePreservation: Array<{
    fieldRefId: string
    variableId: string
    tableId: string
    tableRowId: string
    tableCellId: string
  }>
}

type VariableCompatibilityPolicyFixture = {
  policyId: "variable-compatibility-policy-v1"
  sourceRequiredMissingDefaultValuePolicyGate: "Required / Missing / Default Value Policy Gate"
  sourceRequiredMissingDefaultValuePolicyGateStatus: "complete"
  sourceRequiredMissingDefaultValuePolicyPointer: "repo://fixtures/required-missing-default-value-policy.v1.json"
  sourcePolicyStatus: "accepted-policy-metadata-only"
  compatibilityPolicyStatus: "accepted-policy-metadata-only"
  nextRecommendedWork: "Variable Schema / Data Contract Close Audit"
  attachmentTarget: {
    publishedTemplateVersionIdentity: {
      templateId: "template-product-report-vnext"
      templateVersionId: "template-product-report-vnext@v1"
      versionOrdinal: 1
    }
    acceptedValidationEvidencePointer: "repo://fixtures/template-publish-validation-evidence.v1.json"
    sourceSnapshotRetentionPointer: "repo://fixtures/product-report-vnext.flowdoc.json"
  }
  candidateVariableIds: string[]
  sourcePolicyConfirmation: {
    requiredMissingDefaultPolicyStatus: "accepted-policy-metadata-only"
    runtimeDataValidationImplemented: false
    runtimeDefaultApplicationImplemented: false
    extraVariablePolicy: RequiredMissingDefaultValuePolicyFixture["policyDefinition"]["extraVariablePolicy"]
    tableCellContextMismatchPolicy: RequiredMissingDefaultValuePolicyFixture["policyDefinition"]["tableCellContextMismatchPolicy"]
  }
  compatibilityDefinition: {
    policyMode: "json-safe-policy-metadata-only"
    runtimeCompatibilityEnforcementImplemented: false
    runtimeDataValidationImplemented: false
    runtimeDefaultApplicationImplemented: false
    renderApiContractImplemented: false
    compatibilityStatuses: Array<"compatible" | "compatible-with-warnings" | "incompatible-blocked" | "unknown">
    blockerVocabulary: string[]
    warningVocabulary: string[]
  }
  compatibilityDimensions: Array<{
    dimensionId: string
    [key: string]: unknown
  }>
  variableCompatibilityBaselineRows: Array<{
    variableId: string
    valueTypeCandidate: string
    displayLabelCandidate: string
    requiredStatus: "required" | "optional"
    defaultValueCandidate: string | null
    missingValueCompatibilityStatus: "compatible-with-warnings" | "incompatible-blocked"
    tableCellContextCompatibilityStatus: "compatible" | "incompatible-blocked"
    removedVariableCompatibilityStatus: "compatible-with-warnings" | "incompatible-blocked"
  }>
  tableCellContextCompatibilityRows: Array<{
    fieldRefId: string
    variableId: string
    tableId: string
    tableRowId: string
    tableCellId: string
    unchangedContextStatus: "compatible"
    changedContextStatus: "incompatible-blocked"
    changedContextBlocker: "table-cell-context-changed"
  }>
  compatibilityScenarioPolicies: Record<
    string,
    { status: "compatible-with-warnings"; warning: string } | { status: "incompatible-blocked"; blocker: string }
  >
  blockersBeforeVariableSchemaDataContractCloseAudit: unknown[]
  routeDecisions: {
    ifCompatibilityPolicyAccepted: "Variable Schema / Data Contract Close Audit"
    ifSchemaMutationNeeded: "Template Version Schema Decision Gate"
    ifAliasesOrCompatibilityLabelsRequired: "Variable Metadata Resolution Decision Gate"
  }
  deferredPolicyDecisions: {
    renderApiContract: "deferred"
    runtimeDataValidation: "not-implemented"
    runtimeDefaultApplication: "not-implemented"
    runtimeCompatibilityEnforcement: "not-implemented"
    fullVariableSchemaDataContract: "deferred-until-close-audit"
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

const requiredPolicy = readJson<RequiredMissingDefaultValuePolicyFixture>(
  "../fixtures/required-missing-default-value-policy.v1.json",
)
const compatibilityPolicy = readJson<VariableCompatibilityPolicyFixture>(
  "../fixtures/variable-compatibility-policy.v1.json",
)

describe("variable compatibility policy gate", () => {
  it("confirms the required/missing/default source and attachment target", () => {
    expect(requiredPolicy).toMatchObject({
      requiredMissingDefaultPolicyStatus: "accepted-policy-metadata-only",
      nextRecommendedWork: "Compatibility Policy With Published Template Versions Gate",
    })
    expect(compatibilityPolicy).toMatchObject({
      policyId: "variable-compatibility-policy-v1",
      sourceRequiredMissingDefaultValuePolicyGate: "Required / Missing / Default Value Policy Gate",
      sourceRequiredMissingDefaultValuePolicyGateStatus: "complete",
      sourceRequiredMissingDefaultValuePolicyPointer:
        "repo://fixtures/required-missing-default-value-policy.v1.json",
      sourcePolicyStatus: "accepted-policy-metadata-only",
      compatibilityPolicyStatus: "accepted-policy-metadata-only",
      nextRecommendedWork: "Variable Schema / Data Contract Close Audit",
    })
    expect(compatibilityPolicy.attachmentTarget).toEqual(requiredPolicy.attachmentTarget)
    expect(compatibilityPolicy.candidateVariableIds).toEqual([
      "customer.name",
      "customer.segment",
      "prepared.by",
      "report.period",
      "report.riskLevel",
      "report.total",
    ])
    expect(compatibilityPolicy.candidateVariableIds).toEqual(requiredPolicy.candidateVariableIds)
  })

  it("carries forward source policy facts without implementing runtime behavior", () => {
    expect(compatibilityPolicy.sourcePolicyConfirmation).toEqual({
      requiredMissingDefaultPolicyStatus: "accepted-policy-metadata-only",
      runtimeDataValidationImplemented: false,
      runtimeDefaultApplicationImplemented: false,
      extraVariablePolicy: requiredPolicy.policyDefinition.extraVariablePolicy,
      tableCellContextMismatchPolicy: requiredPolicy.policyDefinition.tableCellContextMismatchPolicy,
    })
    expect(compatibilityPolicy.compatibilityDefinition).toMatchObject({
      policyVersion: 1,
      policyMode: "json-safe-policy-metadata-only",
      runtimeCompatibilityEnforcementImplemented: false,
      runtimeDataValidationImplemented: false,
      runtimeDefaultApplicationImplemented: false,
      renderApiContractImplemented: false,
      compatibilityStatuses: ["compatible", "compatible-with-warnings", "incompatible-blocked", "unknown"],
    })
  })

  it("defines compatibility dimensions and blocker/warning vocabulary", () => {
    expect(compatibilityPolicy.compatibilityDimensions.map((dimension) => dimension.dimensionId)).toEqual([
      "published-template-version-identity-match",
      "variable-id-stability",
      "value-type-candidate-stability",
      "required-optional-policy-changes",
      "default-metadata-changes",
      "table-cell-context-changes",
      "removed-variable-behavior",
      "added-variable-behavior",
      "renamed-aliased-variable-behavior",
    ])
    expect(compatibilityPolicy.compatibilityDefinition.blockerVocabulary).toEqual([
      "missing-published-template-version-identity",
      "published-template-version-mismatch",
      "missing-superseding-version-record",
      "known-variable-id-changed",
      "removed-required-variable",
      "required-variable-added-without-default-metadata",
      "required-policy-tightened-without-compatibility-record",
      "value-type-candidate-changed",
      "table-cell-context-changed",
      "renamed-variable-without-alias-record",
      "invalid-alias-target",
      "metadata-shape-context-mismatch",
      "schema-mutation-required",
      "unknown-compatibility-dimension",
    ])
    expect(compatibilityPolicy.compatibilityDefinition.warningVocabulary).toEqual([
      "display-label-changed",
      "optional-variable-added",
      "optional-variable-removed",
      "default-metadata-changed",
      "default-metadata-added",
      "default-metadata-removed-for-optional-variable",
      "required-variable-added-with-default-metadata",
      "required-policy-loosened",
      "alias-compatibility-record-present",
      "superseding-version-record-present",
      "extra-variable-present",
    ])
  })

  it("maps every source variable row to compatibility baseline policy", () => {
    expect(compatibilityPolicy.variableCompatibilityBaselineRows).toHaveLength(
      requiredPolicy.variableRequiredMissingDefaultPolicyRows.length,
    )

    compatibilityPolicy.variableCompatibilityBaselineRows.forEach((row) => {
      const sourceRow = requiredPolicy.variableRequiredMissingDefaultPolicyRows.find(
        (entry) => entry.variableId === row.variableId,
      )

      if (sourceRow == null) {
        throw new Error(`Missing required/missing/default source row for ${row.variableId}`)
      }

      expect(row).toMatchObject({
        variableId: sourceRow.variableId,
        valueTypeCandidate: sourceRow.valueTypeCandidate,
        displayLabelCandidate: sourceRow.displayLabelCandidate,
        requiredStatus: sourceRow.requiredStatus,
        defaultValueCandidate: sourceRow.defaultValueCandidate,
      })

      if (row.variableId === "report.total") {
        expect(row).toMatchObject({
          missingValueCompatibilityStatus: "incompatible-blocked",
          tableCellContextCompatibilityStatus: "incompatible-blocked",
          removedVariableCompatibilityStatus: "incompatible-blocked",
        })
      } else if (row.requiredStatus === "required") {
        expect(row.removedVariableCompatibilityStatus).toBe("incompatible-blocked")
        expect(row.missingValueCompatibilityStatus).toBe("compatible-with-warnings")
      } else {
        expect(row.removedVariableCompatibilityStatus).toBe("compatible-with-warnings")
        expect(row.missingValueCompatibilityStatus).toBe("compatible-with-warnings")
      }
    })
  })

  it("blocks table-cell context changes for table-bound variables", () => {
    expect(compatibilityPolicy.tableCellContextCompatibilityRows).toEqual(
      requiredPolicy.tableCellOccurrencePreservation.map((entry) => ({
        fieldRefId: entry.fieldRefId,
        variableId: entry.variableId,
        tableId: entry.tableId,
        tableRowId: entry.tableRowId,
        tableCellId: entry.tableCellId,
        unchangedContextStatus: "compatible",
        changedContextStatus: "incompatible-blocked",
        changedContextBlocker: "table-cell-context-changed",
      })),
    )
    expect(compatibilityPolicy.variableCompatibilityBaselineRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          variableId: "report.total",
          tableCellContextCompatibilityStatus: "incompatible-blocked",
        }),
        expect.objectContaining({
          variableId: "report.riskLevel",
          tableCellContextCompatibilityStatus: "incompatible-blocked",
        }),
      ]),
    )
  })

  it("defines scenario policies and deferred routing", () => {
    expect(compatibilityPolicy.compatibilityScenarioPolicies).toEqual({
      displayLabelOnlyChange: {
        status: "compatible-with-warnings",
        warning: "display-label-changed",
      },
      addedOptionalVariable: {
        status: "compatible-with-warnings",
        warning: "optional-variable-added",
      },
      addedRequiredVariableWithoutDefaultMetadata: {
        status: "incompatible-blocked",
        blocker: "required-variable-added-without-default-metadata",
      },
      changedValueTypeCandidate: {
        status: "incompatible-blocked",
        blocker: "value-type-candidate-changed",
      },
      renamedVariableWithoutAliasRecord: {
        status: "incompatible-blocked",
        blocker: "renamed-variable-without-alias-record",
      },
      renamedVariableWithAliasRecord: {
        status: "compatible-with-warnings",
        warning: "alias-compatibility-record-present",
      },
      publishedTemplateVersionMismatch: {
        status: "incompatible-blocked",
        blocker: "published-template-version-mismatch",
      },
      publishedTemplateVersionSuperseded: {
        status: "compatible-with-warnings",
        warning: "superseding-version-record-present",
      },
    })
    expect(compatibilityPolicy.blockersBeforeVariableSchemaDataContractCloseAudit).toEqual([])
    expect(compatibilityPolicy.routeDecisions).toEqual({
      ifCompatibilityPolicyAccepted: "Variable Schema / Data Contract Close Audit",
      ifSchemaMutationNeeded: "Template Version Schema Decision Gate",
      ifAliasesOrCompatibilityLabelsRequired: "Variable Metadata Resolution Decision Gate",
    })
    expect(compatibilityPolicy.deferredPolicyDecisions).toEqual({
      renderApiContract: "deferred",
      runtimeDataValidation: "not-implemented",
      runtimeDefaultApplication: "not-implemented",
      runtimeCompatibilityEnforcement: "not-implemented",
      fullVariableSchemaDataContract: "deferred-until-close-audit",
    })
  })

  it("keeps runtime implementation and production behavior out of scope", () => {
    expect(Object.values(compatibilityPolicy.nonWork)).toEqual(
      Object.values(compatibilityPolicy.nonWork).map(() => false),
    )

    const rootPackage = readJson<PackageJson>("../package.json")
    const rootScripts = Object.values(rootPackage.scripts).join(" ")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")

    expect(rootPackage.scripts.check).toBe("npm run type-check && npm run test")
    expect(rootScripts).not.toContain("compatibility-policy")
    expect(rootScripts).not.toContain("render-api")
    expect(rootScripts).not.toContain("runtime-validation")
    expect(coreMeasurement).toContain("measureVNextText")
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
  })

  it("documents the gate and advances pointers to close audit", () => {
    const policyDoc = readText("../docs/VARIABLE_COMPATIBILITY_POLICY_GATE.md")
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const readme = readText("../README.md")

    expect(policyDoc).toContain("Status: Compatibility Policy With Published Template Versions Gate complete.")
    expect(policyDoc).toContain("fixtures/variable-compatibility-policy.v1.json")
    expect(policyDoc).toContain("accepted-policy-metadata-only")
    expect(policyDoc).toContain("Variable Schema / Data Contract Close Audit.")
    expect(policyDoc).toContain("## PASS")
    expect(policyDoc).toContain("## FAIL-BLOCKER")
    expect(policyDoc).toContain("## RISK")
    expect(policyDoc).toContain("## UNKNOWN")
    expect(currentStatus).toContain("Status: updated after Compatibility Policy With Published Template Versions Gate.")
    expect(currentStatus).toContain("Compatibility Policy With Published Template Versions Gate.")
    expect(currentStatus).toContain("Variable Schema / Data Contract Close Audit.")
    expect(nextPointer).toContain("Status: current after Compatibility Policy With Published Template Versions Gate.")
    expect(nextPointer).toContain("Variable Schema / Data Contract Close Audit.")
    expect(nextPointer).toContain("No runtime data validation implementation.")
    expect(nextPointer).toContain("No runtime compatibility enforcement.")
    expect(nextPointer).toContain("No package/document schema mutation.")
    expect(ledger).toContain("| 214 | Variable compatibility policy gate | done |")
    expect(ledger).toContain("## Phase 214 Variable Compatibility Policy Gate")
    expect(roadmap).toContain("## Phase 214: Variable Compatibility Policy Gate")
    expect(roadmap).toContain("Current next step after Phase 214:")
    expect(roadmap).toContain("Variable Schema / Data Contract Close Audit")
    expect(roadmap).toContain("Historical Phase 213 Handoff")
    expect(readme).toContain("Compatibility Policy With Published Template Versions Gate")
    expect(readme).toContain("docs/VARIABLE_COMPATIBILITY_POLICY_GATE.md")
  })
})
