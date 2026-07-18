import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  validateFlowDocCanonicalReportDataBundleV1,
  type FlowDocCanonicalReportDataBundleV1,
} from "../packages/pdf-renderer-pilot/src/full.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function bundleFixture(): FlowDocCanonicalReportDataBundleV1 {
  return readJson("fixtures/pdf-pilot-canonical-report-data-bundle.v1.json")
}

function expectBlocked(
  mutate: (candidate: any) => void,
  expectedCode: string,
): void {
  const candidate = structuredClone(bundleFixture())
  mutate(candidate)
  const result = validateFlowDocCanonicalReportDataBundleV1(candidate)
  expect(result.status).toBe("blocked")
  if (result.status !== "blocked") throw new Error("mutated report bundle must be blocked")
  expect(result.issues.map((item) => item.code)).toContain(expectedCode)
}

describe("PDF-PILOT-08B-R2A canonical report data and binding lock", () => {
  it("pins source facts into native FlowDoc snapshot contracts without layout facts", () => {
    const bundle = bundleFixture()
    const sourceManifest = readJson<any>("fixtures/pdf-pilot-canonical-report-source-data.v1.json")
    const result = validateFlowDocCanonicalReportDataBundleV1(bundle)

    expect(result).toEqual({ status: "valid", issues: [], summary: bundle.summary })
    expect(bundle).toMatchObject({
      contractVersion: 1,
      kind: "canonical-report-data-bundle",
      adapterId: "pdf-pilot-ocr-benchmark-report-data-adapter-v1",
      benchmarkId: "INV_9437125258-2026-07-16",
      sourceSet: {
        sourceSetId: "source-set-6018cdb46d47ec3b7fc389bb",
        sourceSnapshotSha256: "cfca20e65bfac2e2b20fe837d54985fada0e256549aefd18c8b935b20471ac26",
      },
      summary: {
        fieldCount: 154,
        scalarValueCount: 148,
        collectionCount: 6,
        collectionItemCount: 73,
        mediaAssetCount: 5,
        dataSourceFileCount: 5,
        mediaSourceFileCount: 5,
        scalarProvenanceCount: 148,
        collectionProvenanceItemCount: 73,
        mediaProvenanceCount: 5,
      },
      execution: {
        templateResolution: "not-run",
        textMeasurement: "not-run",
        lineBreaking: "not-run",
        layout: "not-run",
        pagination: "not-run",
        pdfRendering: "not-run",
      },
      bundleFingerprint: "ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d",
    })
    expect(bundle.sourceSet.dataFiles).toEqual(sourceManifest.sourceFiles)
    expect(bundle.dataSnapshot.instance).toEqual(bundle.instance)
    expect(bundle.collectionSnapshot.instance).toEqual(bundle.instance)
    expect(bundle.mediaSnapshot.instance).toEqual(bundle.instance)
    expect(bundle.fieldContract.owner).toEqual(bundle.structureVersion)
    expect(bundle.collectionItemContract.owner).toEqual(bundle.structureVersion)

    const values = bundle.dataSnapshot.data.values
    expect(values["report.engine.azure_document_intelligence.latency_ms.max"])
      .toBe(6495.463799998164)
    expect(values["report.engine.google_document_ai_native.latency_ms.max"])
      .toBe(9747.661099996418)
    expect(values["report.decision.ocr_faster_engine"]).toBe("google_vision")
    expect(values["report.decision.native_lower_cost_engine"])
      .toBe("azure_document_intelligence_native")
    expect(bundle.provenance.scalars["report.settings.processing_scope"].sourcePointers)
      .toEqual(["benchmark-spec.json#/settings/processingScope"])
    expect(bundle.provenance.scalars["report.validation.all_runs_completed"].sourcePointers)
      .toEqual(["metrics.json#/validation/allRunsCompleted"])

    expect(Object.fromEntries(Object.entries(bundle.collectionSnapshot.collections).map(
      ([key, collection]) => [key, collection.items.length],
    ))).toEqual({
      "report.runs": 6,
      "report.ocr_runs": 6,
      "report.native_runs": 6,
      "report.native_missing_concepts": 13,
      "report.mapping_fields": 10,
      "report.gdim_expected_fields": 32,
    })
    expect(bundle.collectionSnapshot.collections["report.runs"].items.map((item) => item.itemKey))
      .toEqual([
        "2026-07-16T11-52-22-028Z",
        "2026-07-16T11-52-39-170Z",
        "2026-07-16T11-52-57-651Z",
        "2026-07-16T11-53-50-392Z",
        "2026-07-16T11-54-06-893Z",
        "2026-07-16T11-54-21-384Z",
      ])
    expect(Object.keys(bundle.mediaSnapshot.registry.images).sort()).toEqual([
      "latency-rounds-image",
      "mapping-gap-image",
      "native-extraction-image",
      "ocr-accuracy-image",
      "source-evidence-image",
    ])
    expect(JSON.stringify(bundle)).not.toMatch(
      /"(?:lines|xPt|yPt|widthPt|heightPt|glyphs|paintCommands|pageBoxes|fontSizePt|measurementRequestId)"/u,
    )
  })

  it("fails closed on contract, source, collection, media, provenance, and boundary drift", () => {
    expectBlocked((bundle) => {
      bundle.sourceSet.dataFiles[0].sha256 = "0".repeat(64)
    }, "source-set-id")
    expectBlocked((bundle) => {
      bundle.fieldContract.owner.structureVersionId = "other-version"
    }, "field-owner")
    expectBlocked((bundle) => {
      bundle.dataSnapshot.data.values["report.source.page_count"] = "2"
    }, "scalar-value-type")
    expectBlocked((bundle) => {
      delete bundle.collectionSnapshot.collections["report.runs"].items[0].values.order
    }, "collection-item-key-set")
    expectBlocked((bundle) => {
      bundle.mediaSnapshot.registry.images["source-evidence-image"].intrinsic.widthPx += 1
    }, "media-identity-pin")
    expectBlocked((bundle) => {
      bundle.provenance.scalars["report.benchmark_id"].sourcePointers = []
    }, "scalar-provenance-entry")
    expectBlocked((bundle) => {
      bundle.execution.layout = "completed"
    }, "execution-boundary")
    expectBlocked((bundle) => {
      bundle.lines = []
    }, "layout-fact-forbidden")
    expectBlocked((bundle) => {
      bundle.bundleFingerprint = "0".repeat(64)
    }, "bundle-fingerprint")

    const duplicateItem = structuredClone(bundleFixture()) as any
    const runs = duplicateItem.collectionSnapshot.collections["report.runs"].items
    runs[1].itemKey = runs[0].itemKey
    expect(validateFlowDocCanonicalReportDataBundleV1(duplicateItem).status).toBe("blocked")
  })

  it("retains reproducible QA and documents the R2A ownership boundary", () => {
    const qa = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-data-bundle-qa.v1.json",
    )
    const proof = readFileSync(resolve(
      process.cwd(),
      "docs/PDF_CANONICAL_REPORT_DATA_BINDING_LOCK.md",
    ), "utf8")
    const pilot = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const packageJson = readJson<any>("packages/pdf-renderer-pilot/package.json")

    expect(qa).toMatchObject({
      phaseId: "PDF-PILOT-08B-R2A",
      status: "accepted",
      bundleFingerprint: "ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d",
      sourceIdentity: {
        dataFileCount: 5,
        mediaFileCount: 5,
        allHashesAccepted: true,
        sourceSnapshotReproduced: true,
      },
      contracts: {
        exactInstanceRevisionPins: true,
        schemaValidationAccepted: true,
      },
      boundary: {
        templateResolution: "not-run",
        textMeasurement: "not-run",
        lineBreaking: "not-run",
        layout: "not-run",
        pagination: "not-run",
        pdfRendering: "not-run",
        layoutFactsPresent: false,
        finalDisplayStringsOwned: false,
        deterministicRebuild: true,
      },
    })
    expect(proof).toContain("Status: PDF-PILOT-08B-R2A report data and binding lock accepted.")
    expect(pilot).toContain("## PDF-PILOT-08B-R2A Scope")
    expect(ledger).toContain("## PDF-PILOT-08B-R2A Canonical Report Data And Binding Lock")
    expect(readme).toContain("PDF canonical report data and binding lock")
    expect(packageJson.scripts["build:report-data-bundle"]).toBe(
      "node scripts/build-canonical-report-data-bundle.mjs",
    )
  })
})
