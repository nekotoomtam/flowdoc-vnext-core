import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  formatVNextDisplayValueV1,
  validateVNextPublishedDisplayFormatContractV1,
} from "../src/index.js"
import {
  validateFlowDocCanonicalReportDisplayFormattingBundleV1,
  type FlowDocCanonicalReportDisplayFormattingBundleV1,
} from "../packages/pdf-renderer-pilot/src/canonicalReportDisplayFormatting.js"
import type { FlowDocCanonicalReportDataBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportDataAdapter.js"
import type { FlowDocCanonicalReportTemplateResolutionBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportTemplateResolution.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

const DATA_BUNDLE = readJson<FlowDocCanonicalReportDataBundleV1>(
  "fixtures/pdf-pilot-canonical-report-data-bundle.v1.json",
)
const TEMPLATE_BUNDLE = readJson<FlowDocCanonicalReportTemplateResolutionBundleV1>(
  "fixtures/pdf-pilot-canonical-report-template-resolution.v1.json",
)
const FORMATTING_BUNDLE = readJson<FlowDocCanonicalReportDisplayFormattingBundleV1>(
  "fixtures/pdf-pilot-canonical-report-display-formatting.v1.json",
)

function expectBundleBlocked(mutate: (candidate: any) => void, code: string): void {
  const candidate = clone(FORMATTING_BUNDLE) as any
  mutate(candidate)
  const result = validateFlowDocCanonicalReportDisplayFormattingBundleV1(
    candidate,
    DATA_BUNDLE,
    TEMPLATE_BUNDLE,
  )
  expect(result.status).toBe("blocked")
  if (result.status !== "blocked") throw new Error("mutated R2C-A bundle must be blocked")
  expect(result.issues.map((item) => item.code)).toContain(code)
}

describe("PDF-PILOT-08B-R2C-A canonical report display formatting", () => {
  it("publishes a deterministic typed format contract and blocks incompatible values", () => {
    expect(validateVNextPublishedDisplayFormatContractV1({
      contract: FORMATTING_BUNDLE.formatContract,
      fieldContract: DATA_BUNDLE.fieldContract,
      collectionItemContract: DATA_BUNDLE.collectionItemContract,
    })).toEqual({
      status: "valid",
      issues: [],
      summary: {
        formatCount: 22,
        fieldAssignmentCount: 143,
        collectionCount: 6,
        collectionItemAssignmentCount: 63,
      },
    })

    const percent = formatVNextDisplayValueV1({
      contractVersion: 1,
      kind: "display-value-request",
      valueType: "number",
      value: 0.848809922896413,
      format: FORMATTING_BUNDLE.formatContract.formats["percent-1"],
    })
    expect(percent).toMatchObject({
      status: "formatted",
      rawCanonicalText: "0.848809922896413",
      displayText: "84.9%",
      execution: { runtimeIntl: false, timeZone: "UTC" },
    })
    const negativeZero = formatVNextDisplayValueV1({
      contractVersion: 1,
      kind: "display-value-request",
      valueType: "number",
      value: -0.0001,
      format: FORMATTING_BUNDLE.formatContract.formats["integer"],
    })
    expect(negativeZero).toMatchObject({ status: "formatted", displayText: "0" })

    const unknownEnum = formatVNextDisplayValueV1({
      contractVersion: 1,
      kind: "display-value-request",
      valueType: "enum",
      value: "other",
      format: FORMATTING_BUNDLE.formatContract.formats["enum-provider"],
    })
    expect(unknownEnum.status).toBe("blocked")
    const invalidDate = formatVNextDisplayValueV1({
      contractVersion: 1,
      kind: "display-value-request",
      valueType: "date",
      value: "2026-02-30",
      format: FORMATTING_BUNDLE.formatContract.formats["thai-gregorian-date"],
    })
    expect(invalidDate.status).toBe("blocked")
    const mismatchedNull = formatVNextDisplayValueV1({
      contractVersion: 1,
      kind: "display-value-request",
      valueType: "date",
      value: null,
      format: FORMATTING_BUNDLE.formatContract.formats["percent-1"],
    })
    expect(mismatchedNull.status).toBe("blocked")

    const mismatched = clone(FORMATTING_BUNDLE.formatContract)
    mismatched.fieldFormats["report.test_date"] = "percent-1"
    const mismatch = validateVNextPublishedDisplayFormatContractV1({
      contract: mismatched,
      fieldContract: DATA_BUNDLE.fieldContract,
      collectionItemContract: DATA_BUNDLE.collectionItemContract,
    })
    expect(mismatch.status).toBe("blocked")
    if (mismatch.status !== "blocked") throw new Error("incompatible date format must block")
    expect(mismatch.issues.map((item) => item.code)).toContain("format-type-mismatch")
  })

  it("retains exact R2A/R2B lineage and formats all presentation bindings", () => {
    const validation = validateFlowDocCanonicalReportDisplayFormattingBundleV1(
      FORMATTING_BUNDLE,
      DATA_BUNDLE,
      TEMPLATE_BUNDLE,
    )
    expect(validation).toEqual({ status: "valid", issues: [], summary: FORMATTING_BUNDLE.summary })
    expect(FORMATTING_BUNDLE).toMatchObject({
      sourceDataBundleFingerprint: DATA_BUNDLE.bundleFingerprint,
      sourceTemplateBundleFingerprint: TEMPLATE_BUNDLE.bundleFingerprint,
      resolutionInputFingerprint: TEMPLATE_BUNDLE.resolutionInputFingerprint,
      bundleFingerprint: "41877d47ea365f01790faf3041a610629489931ad1fe1aa6d88e2389ed8a5d0d",
      summary: {
        formatCount: 22,
        fieldFormatAssignmentCount: 143,
        collectionFormatAssignmentCount: 63,
        documentBindingCount: 136,
        collectionBindingCount: 476,
        totalFormattedBindingCount: 612,
        changedDisplayTextCount: 287,
      },
      execution: {
        localeDisplayFormatting: "formatted",
        runtimeIntl: false,
        textMeasurement: "not-run",
        lineBreaking: "not-run",
        tableGeometry: "not-run",
        layout: "not-run",
        pagination: "not-run",
        pdfRendering: "not-run",
      },
    })

    const documentByKey = Object.fromEntries(FORMATTING_BUNDLE.documentBindings.map((binding) => [
      binding.fieldKey,
      { raw: binding.rawValue, display: binding.displayText, format: binding.formatKey },
    ]))
    expect(documentByKey).toMatchObject({
      "report.test_date": { raw: "2026-07-16", display: "16 กรกฎาคม 2026", format: "thai-gregorian-date" },
      "report.metrics_generated_at": { raw: "2026-07-16T12:55:06.182Z", display: "2026-07-16 12:55:06 UTC", format: "utc-instant-seconds" },
      "report.engine.azure_document_intelligence.latency_ms.max": { raw: 6495.463799998164, display: "6.50 วินาที", format: "seconds-2" },
      "report.total_cost.thb": { raw: 8.63784, display: "8.64 บาท", format: "thb-2" },
      "report.source.size_bytes": { raw: 4053388, display: "4,053,388 bytes", format: "bytes-grouped" },
      "report.engine.google_vision.character_accuracy": { raw: 0.848809922896413, display: "84.9%", format: "percent-1" },
    })
    expect(new Set(FORMATTING_BUNDLE.documentBindings.map((binding) => binding.inlineId)).size).toBe(136)
    expect(FORMATTING_BUNDLE.documentBindings.every((binding) => (
      TEMPLATE_BUNDLE.scopedResolution.resolvedDocument.bindings.fields.some((source) => (
        source.inlineId === binding.inlineId
        && source.textBlockId === binding.textBlockId
        && source.fieldKey === binding.fieldKey
        && source.value === binding.rawResolvedValue
      ))
    ))).toBe(true)
  })

  it("formats collection values without changing materialized identities or raw values", () => {
    expect(FORMATTING_BUNDLE.collectionTables.map((table) => [
      table.collectionFieldKey,
      table.bindings.length,
    ])).toEqual([
      ["report.ocr_runs", 114],
      ["report.native_runs", 126],
      ["report.mapping_fields", 80],
      ["report.native_missing_concepts", 26],
      ["report.runs", 66],
      ["report.gdim_expected_fields", 64],
    ])
    const example = (collectionFieldKey: string, fieldKey: string) => {
      const table = FORMATTING_BUNDLE.collectionTables.find(
        (candidate) => candidate.collectionFieldKey === collectionFieldKey,
      )
      if (table == null) throw new Error(`missing formatted table ${collectionFieldKey}`)
      const binding = table.bindings.find((candidate) => candidate.fieldKey === fieldKey)
      if (binding == null) throw new Error(`missing formatted binding ${collectionFieldKey}.${fieldKey}`)
      return binding
    }
    expect(example("report.ocr_runs", "latency_ms")).toMatchObject({
      rawValue: 2086.849199999124,
      displayText: "2.09 วินาที",
      formatKey: "seconds-2",
      resolvedPlacementId: "inli_7ef176dc91f5822f0b7fa37b",
    })
    expect(example("report.native_runs", "structured_concept_coverage")).toMatchObject({
      rawValue: 0.92,
      displayText: "92.0%",
      formatKey: "percent-1",
    })
    expect(example("report.mapping_fields", "correct")).toMatchObject({
      rawValue: true,
      displayText: "ใช่",
      formatKey: "boolean-yes-no",
    })
    expect(example("report.runs", "status")).toMatchObject({
      rawValue: "completed",
      displayText: "เสร็จสมบูรณ์",
      formatKey: "enum-run-status",
    })
    expect(example("report.runs", "source_hash_matches")).toMatchObject({
      rawValue: true,
      displayText: "ตรงกัน",
      formatKey: "boolean-match",
    })

    for (const formattedTable of FORMATTING_BUNDLE.collectionTables) {
      const sourceTable = TEMPLATE_BUNDLE.collectionTables.find(
        (candidate) => candidate.collectionFieldKey === formattedTable.collectionFieldKey,
      )
      if (sourceTable == null) throw new Error(`missing R2B table ${formattedTable.collectionFieldKey}`)
      const sourceById = new Map(sourceTable.materializedContent.bindings.text.map((binding) => [
        binding.resolvedPlacementId,
        binding,
      ]))
      expect(formattedTable.bindings.every((binding) => {
        const source = sourceById.get(binding.resolvedPlacementId)
        return source?.sourcePlacementId === binding.sourcePlacementId
          && source.itemKey === binding.itemKey
          && source.fieldKey === binding.fieldKey
          && source.value === binding.rawResolvedValue
      })).toBe(true)
    }
  })

  it("fails closed on source, format, raw binding, execution, and downstream drift", () => {
    expectBundleBlocked((bundle) => {
      bundle.sourceTemplateBundleFingerprint = "0".repeat(64)
    }, "source-template-fingerprint")
    expectBundleBlocked((bundle) => {
      bundle.formatContract.formats["seconds-2"].spec.suffix = " sec"
    }, "format-contract-drift")
    expectBundleBlocked((bundle) => {
      bundle.documentBindings[0].rawValue = "changed"
    }, "document-binding-drift")
    expectBundleBlocked((bundle) => {
      bundle.execution.textMeasurement = "measured"
    }, "execution-boundary")
    expectBundleBlocked((bundle) => {
      bundle.xPt = 12
    }, "downstream-fact")
    expectBundleBlocked((bundle) => {
      bundle.bundleFingerprint = "0".repeat(64)
    }, "bundle-fingerprint")

    const malformed = clone(FORMATTING_BUNDLE) as any
    malformed.collectionTables = [null]
    expect(validateFlowDocCanonicalReportDisplayFormattingBundleV1(
      malformed,
      DATA_BUNDLE,
      TEMPLATE_BUNDLE,
    )).toMatchObject({ status: "blocked", summary: null })
  })

  it("retains QA and phase evidence without claiming measurement or PDF", () => {
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-display-formatting-qa.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_DISPLAY_FORMATTING_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")
    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2C-A",
      status: "accepted",
      bundleFingerprint: FORMATTING_BUNDLE.bundleFingerprint,
      determinism: { runtimeIntl: false, deterministicRebuild: true },
      summary: FORMATTING_BUNDLE.summary,
      measurementHandoff: {
        status: "ready-for-measurement-request-preparation",
        tableGeometry: "not-run",
        measurementRequests: "not-run",
      },
      boundary: {
        localeDisplayFormatting: "formatted",
        textMeasurement: "not-run",
        layout: "not-run",
        pdfRendering: "not-run",
      },
    })
    expect(proof).toContain("Status: PDF-PILOT-08B-R2C-A typed display formatting accepted.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2C-A Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2C-A Typed Display Formatting")
    expect(readme).toContain("PDF canonical report typed display formatting")
    expect(packageJson.scripts["build:report-display-formatting"]).toBe(
      "node scripts/build-canonical-report-display-formatting.mjs",
    )
  })
})
