import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

interface RootFileFact {
  path: string
  byteLength: number
  sha256: string
}

interface SourceBaseline {
  schema: string
  baselineId: string
  phaseId: string
  status: string
  pdf: {
    fileName: string
    byteLength: number
    sha256: string
    pageCount: number
  }
  semanticSource: {
    schema: string
    pageFieldsRemoved: boolean
    rootFiles: RootFileFact[]
    images: {
      fileCount: number
      totalByteLength: number
      totalPixelCount: number
      canonicalDigest: string
    }
    totalByteLength: number
  }
  contentFacts: Record<string, unknown>
  firstSlice: Record<string, unknown>
  knownLimitations: Record<string, unknown>
  retention: Record<string, unknown>
  contracts: Record<string, unknown>
  sourceBundleFingerprint: string
  nextPhase: string
}

function baseline(): SourceBaseline {
  return JSON.parse(readFileSync(resolve(
    process.cwd(),
    "fixtures/pdf-export-realdoc-69c-source-baseline.v1.json",
  ), "utf8")) as SourceBaseline
}

describe("PDF-EXPORT-REALDOC-A 69C source baseline", () => {
  it("pins the exact external PDF, semantic roots, and aggregate image set without retaining source bytes", () => {
    const evidence = baseline()

    expect(evidence).toMatchObject({
      schema: "flowdoc-pdf-export-real-document-source-baseline-v1",
      baselineId: "pdf-export-realdoc-69c-source-baseline-v1",
      phaseId: "PDF-EXPORT-REALDOC-A",
      status: "accepted-local-external-source-baseline",
      pdf: {
        fileName: "69C_UAT_RC_26-07-17.pdf",
        byteLength: 73921912,
        sha256: "8dd3bbf0d562907be9874fd9c54be6ed5209501fed6940f30e6a67f514ab003a",
        pageCount: 200,
      },
      semanticSource: {
        schema: "uat_semantic_no_pages_v1",
        pageFieldsRemoved: true,
        images: {
          fileCount: 149,
          totalByteLength: 21033151,
          totalPixelCount: 65129970,
          canonicalDigest: "66037877234f2e89b59839c82b656a04a6c69fb52afd6d943d5beed2b6b904a5",
        },
        totalByteLength: 24345303,
      },
      retention: {
        pdfBytesRetainedInRepository: false,
        semanticBytesRetainedInRepository: false,
        imageBytesRetainedInRepository: false,
        sourcePathsRetainedInRepository: false,
        externalSourceVerificationRequiredBeforeImport: true,
      },
    })
    expect(evidence.semanticSource.rootFiles).toHaveLength(3)
    expect(evidence.semanticSource.rootFiles.every((file) => /^[a-f0-9]{64}$/u.test(file.sha256))).toBe(true)
  })

  it("rebuilds the retained bundle fingerprint from exact byte and digest facts", () => {
    const evidence = baseline()
    const canonicalLines = [
      `pdf/${evidence.pdf.fileName}\t${evidence.pdf.byteLength}\t${evidence.pdf.sha256}\n`,
      ...evidence.semanticSource.rootFiles.map((file) => (
        `semantic/${file.path}\t${file.byteLength}\t${file.sha256}\n`
      )),
      `semantic/images\t${evidence.semanticSource.images.fileCount}\t${evidence.semanticSource.images.totalByteLength}\t${evidence.semanticSource.images.totalPixelCount}\t${evidence.semanticSource.images.canonicalDigest}\n`,
    ].join("")

    expect(`sha256:${createHash("sha256").update(canonicalLines, "utf8").digest("hex")}`).toBe(
      "sha256:46fac437de79e9b5b044345ca97433535245bf53b1764d5df4b01e25279096eb",
    )
    expect(evidence.sourceBundleFingerprint).toBe(
      "sha256:46fac437de79e9b5b044345ca97433535245bf53b1764d5df4b01e25279096eb",
    )
  })

  it("retains the complete semantic facts and the bounded section 2.1 first slice", () => {
    const evidence = baseline()

    expect(evidence.contentFacts).toMatchObject({
      moduleCount: 3,
      sectionCount: 29,
      requirementCount: 240,
      screenshotCount: 149,
      streamRecordCount: 421,
      requirementIdFirst: "REQ0001",
      requirementIdLast: "REQ0240",
      requirementIdsContinuous: true,
      requirementIdsUnique: true,
      screenshotIdsUnique: true,
      streamOrderContinuous: true,
      imageReferencesComplete: true,
      orphanImageCount: 0,
    })
    expect(evidence.firstSlice).toMatchObject({
      sectionNumber: "2.1",
      requirementIdFirst: "REQ0137",
      requirementIdLast: "REQ0146",
      requirementCount: 10,
      featureTextCharacterCount: 4833,
      screenshotCount: 7,
      screenshotByteLength: 1117389,
      screenshotPixelCount: 3494022,
      screenshotCanonicalDigest: "dd7f125503a7002c184ae74c9fe517ac5d563e294eb0f99e1df7676d328db443",
      sourcePdfPageStart: 121,
      sourcePdfPageEndInclusive: 129,
      allRequirementsLinkEverySectionScreenshot: true,
    })
  })

  it("keeps missing layout evidence and production activation explicit", () => {
    const evidence = baseline()

    expect(evidence.knownLimitations).toMatchObject({
      pageGeometryAvailable: false,
      authoredPaginationAvailable: false,
      tableCellGeometryAvailable: false,
      screenshotPlacementAvailable: false,
      screenshotRequirementBindingGranularity: "section-all-to-all",
      pdfRole: "read-only-content-and-visual-oracle",
      semanticSourceRole: "ordered-semantic-input-not-layout-source",
    })
    expect(evidence.contracts).toMatchObject({
      packageSchemaChanged: false,
      documentSchemaChanged: false,
      importAdapterImplemented: false,
      structureDefinitionImplemented: false,
      rendererExecuted: false,
      artifactProduced: false,
      backendRouteMounted: false,
      productionBinding: false,
    })
    expect(evidence.nextPhase).toBe(
      "PDF-EXPORT-REALDOC-B UAT Structure Definition and section 2.1 source adapter",
    )
  })
})
