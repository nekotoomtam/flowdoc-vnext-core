import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  DocumentNodeV4TargetSchema,
  resolveVNextDocumentV1,
  resolveVNextScopedDocumentV1,
  type VNextResolvedProjectionInputV1,
} from "../src/index.js"
import {
  validateFlowDocCanonicalReportTemplateResolutionBundleV1,
  type FlowDocCanonicalReportTemplateResolutionBundleV1,
} from "../packages/pdf-renderer-pilot/src/index.js"
import type { FlowDocCanonicalReportDataBundleV1 } from "../packages/pdf-renderer-pilot/src/canonicalReportDataAdapter.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

const DATA_BUNDLE = readJson<FlowDocCanonicalReportDataBundleV1>(
  "fixtures/pdf-pilot-canonical-report-data-bundle.v1.json",
)
const TEMPLATE_BUNDLE = readJson<FlowDocCanonicalReportTemplateResolutionBundleV1>(
  "fixtures/pdf-pilot-canonical-report-template-resolution.v1.json",
)

function clone<T>(value: T): T {
  return structuredClone(value)
}

function projection(): VNextResolvedProjectionInputV1 {
  return {
    contractVersion: 1,
    kind: "resolved-projection-input",
    instance: clone(DATA_BUNDLE.instance),
    document: clone(TEMPLATE_BUNDLE.instanceDocument),
    published: {
      contractVersion: 1,
      kind: "published-resolution-bundle",
      publishedStructure: clone(TEMPLATE_BUNDLE.publishedStructure),
      fieldContract: clone(DATA_BUNDLE.fieldContract),
      styleCatalog: clone(TEMPLATE_BUNDLE.styleCatalog),
      staticMedia: clone(TEMPLATE_BUNDLE.staticMedia),
    },
    dataSnapshot: clone(DATA_BUNDLE.dataSnapshot),
    instanceMedia: clone(DATA_BUNDLE.mediaSnapshot),
  }
}

function scopedInput() {
  return {
    contractVersion: 1 as const,
    kind: "scoped-resolved-projection-input" as const,
    projection: projection(),
    tables: TEMPLATE_BUNDLE.collectionTables.map((table) => ({
      definition: clone(table.definition),
      itemContract: clone(DATA_BUNDLE.collectionItemContract),
      bindingContract: clone(table.bindingContract),
    })),
  }
}

function expectBundleBlocked(
  mutate: (candidate: any) => void,
  code: string,
): void {
  const candidate = clone(TEMPLATE_BUNDLE) as any
  mutate(candidate)
  const result = validateFlowDocCanonicalReportTemplateResolutionBundleV1(candidate)
  expect(result.status).toBe("blocked")
  if (result.status !== "blocked") throw new Error("mutated R2B bundle must be blocked")
  expect(result.issues.map((item) => item.code)).toContain(code)
}

describe("PDF-PILOT-08B-R2B canonical report template and resolution", () => {
  it("adds Letter pages and resolves only after validated table item scopes are applied", () => {
    expect(DocumentNodeV4TargetSchema.safeParse(TEMPLATE_BUNDLE.starterTemplate).success).toBe(true)
    expect(TEMPLATE_BUNDLE.instanceDocument.document.sections).toHaveLength(12)
    expect(TEMPLATE_BUNDLE.instanceDocument.document.sections.every(
      (section) => section.page.size === "Letter",
    )).toBe(true)
    const unsupported = clone(TEMPLATE_BUNDLE.starterTemplate) as any
    unsupported.document.sections[0].page.size = "Legal"
    expect(DocumentNodeV4TargetSchema.safeParse(unsupported).success).toBe(false)

    const globalOnly = resolveVNextDocumentV1(projection())
    expect(globalOnly.status).toBe("blocked")
    expect(globalOnly.issues.map((item) => item.code)).toContain("missing-field-definition")

    const scoped = resolveVNextScopedDocumentV1(scopedInput())
    expect(scoped.status).toBe("resolved")
    if (scoped.status !== "resolved") throw new Error(scoped.issues.map((item) => item.message).join("\n"))
    expect(scoped.tablePlans).toHaveLength(6)
    expect(scoped.deferredCollectionItemPlacements).toHaveLength(63)
    expect(scoped.resolvedDocument.document).toEqual(TEMPLATE_BUNDLE.instanceDocument)
    expect(scoped.resolvedDocument.execution).toMatchObject({
      generatedExpansion: "not-run",
      pagination: "not-run",
      rendering: "not-run",
    })

    const missingScope = scopedInput()
    const firstPlacements = Object.values(missingScope.tables[0].bindingContract.rowTemplates)[0].placements
    delete firstPlacements[Object.keys(firstPlacements)[0]]
    const missingResult = resolveVNextScopedDocumentV1(missingScope)
    expect(missingResult.status).toBe("blocked")
    expect(missingResult.issues.map((item) => item.code)).toContain("missing-placement-binding")

    const duplicateScope = scopedInput()
    duplicateScope.tables.push(clone(duplicateScope.tables[0]))
    const duplicateResult = resolveVNextScopedDocumentV1(duplicateScope)
    expect(duplicateResult.status).toBe("blocked")
    expect(duplicateResult.issues.map((item) => item.code)).toContain("duplicate-table-scope")
  })

  it("retains exact R2A scalar, image, collection, and identity lineage", () => {
    const validation = validateFlowDocCanonicalReportTemplateResolutionBundleV1(TEMPLATE_BUNDLE)
    expect(validation).toEqual({ status: "valid", issues: [], summary: TEMPLATE_BUNDLE.summary })
    expect(TEMPLATE_BUNDLE).toMatchObject({
      sourceDataBundleFingerprint: DATA_BUNDLE.bundleFingerprint,
      resolutionInputFingerprint: "report-resolution-73c8712e05099a9c658e07af",
      bundleFingerprint: "80e8468f1cd29cee60cb7acace276c89501ce923a4cf423fa298986f808601a4",
      summary: {
        semanticSectionCount: 12,
        templateNodeCount: 485,
        scalarBindingCount: 136,
        imageBindingCount: 5,
        styleBindingCount: 300,
        collectionTableCount: 6,
        collectionRowCount: 73,
        collectionCellCount: 476,
        collectionItemBindingCount: 476,
        evidenceOnlyFieldCount: 29,
      },
    })
    const scalarByKey = Object.fromEntries(
      TEMPLATE_BUNDLE.scopedResolution.resolvedDocument.bindings.fields.map((binding) => [
        binding.fieldKey,
        binding.value,
      ]),
    )
    expect(scalarByKey["report.engine.azure_document_intelligence.latency_ms.max"])
      .toBe("6495.463799998164")
    expect(scalarByKey["report.engine.google_document_ai_native.latency_ms.max"])
      .toBe("9747.661099996418")
    expect(TEMPLATE_BUNDLE.scopedResolution.resolvedDocument.bindings.images.map(
      (binding) => [binding.fieldKey, binding.assetId, binding.assetOwner],
    )).toEqual([
      ["report.media.source_evidence", "source-evidence-image", "instance-media"],
      ["report.media.ocr_accuracy_chart", "ocr-accuracy-image", "instance-media"],
      ["report.media.native_extraction_chart", "native-extraction-image", "instance-media"],
      ["report.media.latency_rounds_chart", "latency-rounds-image", "instance-media"],
      ["report.media.mapping_gap_chart", "mapping-gap-image", "instance-media"],
    ])

    const tableCounts = Object.fromEntries(TEMPLATE_BUNDLE.collectionTables.map((table) => [
      table.collectionFieldKey,
      {
        rows: table.resolvedRows.rows.filter((row) => row.source.kind === "collection-row").length,
        bindings: table.materializedContent.bindings.text.length
          + table.materializedContent.bindings.images.length,
      },
    ]))
    expect(tableCounts).toEqual({
      "report.ocr_runs": { rows: 6, bindings: 114 },
      "report.native_runs": { rows: 6, bindings: 126 },
      "report.mapping_fields": { rows: 10, bindings: 80 },
      "report.native_missing_concepts": { rows: 13, bindings: 26 },
      "report.runs": { rows: 6, bindings: 66 },
      "report.gdim_expected_fields": { rows: 32, bindings: 64 },
    })
    const runs = TEMPLATE_BUNDLE.collectionTables.find(
      (table) => table.collectionFieldKey === "report.runs",
    )
    if (runs == null) throw new Error("runs table missing")
    expect(runs.resolvedRows.rows.filter(
      (row) => row.source.kind === "collection-row",
    ).every((row) => row.identity.kind === "allocated-row"
      && row.identity.provenance.identity.id.startsWith("rowi_"))).toBe(true)
    expect(runs.materializedContent.bindings.text.filter(
      (binding) => binding.fieldKey === "run_id",
    ).map((binding) => binding.value)).toEqual([
      "2026-07-16T11-52-22-028Z",
      "2026-07-16T11-52-39-170Z",
      "2026-07-16T11-52-57-651Z",
      "2026-07-16T11-53-50-392Z",
      "2026-07-16T11-54-06-893Z",
      "2026-07-16T11-54-21-384Z",
    ])
    expect(TEMPLATE_BUNDLE.coverage.presentationFieldKeys).toHaveLength(125)
    expect(TEMPLATE_BUNDLE.coverage.evidenceOnlyFieldKeys).toHaveLength(29)
    expect(TEMPLATE_BUNDLE.coverage.evidenceOnlyFieldKeys.every(
      (key) => key.startsWith("report.truth.critical."),
    )).toBe(true)
  })

  it("fails closed on graph, ownership, coverage, downstream, and fingerprint drift", () => {
    expectBundleBlocked((bundle) => {
      bundle.instanceDocument.document.sections[0].page.size = "A4"
    }, "instance-document-template-drift")
    expectBundleBlocked((bundle) => {
      bundle.collectionTables[0].definition.owner.ref.structureVersionId = "other-version"
    }, "table-definition-owner")
    expectBundleBlocked((bundle) => {
      bundle.coverage.evidenceOnlyFieldKeys.pop()
    }, "evidence-only-field-set")
    expectBundleBlocked((bundle) => {
      bundle.execution.localeDisplayFormatting = "resolved"
    }, "execution-boundary")
    expectBundleBlocked((bundle) => {
      bundle.xPt = 12
    }, "downstream-fact")
    expectBundleBlocked((bundle) => {
      bundle.bundleFingerprint = "0".repeat(64)
    }, "bundle-fingerprint")
    expectBundleBlocked((bundle) => {
      bundle.sourceDataBundleFingerprint = "0".repeat(64)
    }, "source-data-fingerprint")
    expectBundleBlocked((bundle) => {
      bundle.resolutionInputFingerprint = `report-resolution-${"0".repeat(24)}`
    }, "resolution-input-fingerprint")

    const malformed = clone(TEMPLATE_BUNDLE) as any
    malformed.collectionTables = [null]
    expect(validateFlowDocCanonicalReportTemplateResolutionBundleV1(malformed)).toMatchObject({
      status: "blocked",
      issues: [{ code: "invalid-bundle-shape" }],
      summary: null,
    })
  })

  it("retains QA and phase documentation without claiming formatted text or PDF", () => {
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-template-resolution-qa.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_TEMPLATE_RESOLUTION_PROOF.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")

    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2B",
      status: "accepted",
      sourceDataBundleFingerprint: DATA_BUNDLE.bundleFingerprint,
      bundleFingerprint: TEMPLATE_BUNDLE.bundleFingerprint,
      pageContract: { size: "Letter", semanticSectionCount: 12, fixedPageCountClaimed: false },
      coverage: {
        presentationFieldCount: 125,
        evidenceOnlyFieldCount: 29,
        collectionItemBindingCount: 476,
        allFieldsClassified: true,
      },
      boundary: {
        localeDisplayFormatting: "not-run",
        textMeasurement: "not-run",
        lineBreaking: "not-run",
        layout: "not-run",
        pagination: "not-run",
        pdfRendering: "not-run",
        fixedPageCountClaimed: false,
        productionPdfClaimed: false,
      },
    })
    expect(proof).toContain("Status: PDF-PILOT-08B-R2B canonical report template and resolution accepted.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2B Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2B Canonical Report Template And Resolution")
    expect(readme).toContain("PDF canonical report template and resolution")
    expect(packageJson.scripts["build:report-template-resolution"]).toBe(
      "node scripts/build-canonical-report-template-resolution.mjs",
    )
  })
})
