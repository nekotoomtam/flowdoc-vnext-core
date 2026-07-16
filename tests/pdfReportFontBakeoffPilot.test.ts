import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

interface FontAsset {
  fontId: string
  sha256: string
}

interface FontManifest {
  fontAssets: FontAsset[]
  candidateFontAssets: FontAsset[]
  styleMappings: Array<{
    primaryFontId: string
    fallbackFontIds: string[]
  }>
}

describe("PDF report font bake-off pilot", () => {
  const corpus = readJson<any>("fixtures/pdf-report-font-bakeoff-corpus.v1.json")
  const summary = readJson<any>("packages/text-engine-rust-wasm/fixtures/pdf-report-font-bakeoff-summary.v1.json")
  const decision = readJson<any>("fixtures/pdf-report-font-bakeoff-decision.v1.json")
  const manifest = readJson<FontManifest>("assets/fonts/font-assets.v1.json")

  it("pins a PDF-only reference corpus without retaining Tahoma bytes", () => {
    expect(corpus).toMatchObject({
      corpusId: "pdf-report-font-bakeoff-corpus-v1",
      pilotId: "PDF-PILOT-INV-9437125258",
      referenceFont: {
        family: "Tahoma",
        sourceKind: "external-system-font",
        fontBytesRetained: false,
        repositoryPath: null,
      },
    })
    expect(corpus.samples).toHaveLength(6)
    expect(corpus.referenceArtifacts[0]).toMatchObject({
      artifactId: "reference-final-pdf",
      mediaType: "application/pdf",
      bytes: 714952,
      sha256: "56f17f2cc97bfe545d6f8dba9c4e2f45928c9398d0b8cad129c19b51ca3695a8",
      pageCount: 12,
    })
    expect(corpus.referenceArtifacts.every((artifact: any) => (
      artifact.mediaType === "application/pdf" || artifact.mediaType === "image/png"
    ))).toBe(true)
    expect(JSON.stringify(corpus)).not.toContain("C:\\Windows\\Fonts")
    expect(JSON.stringify(corpus)).not.toContain("wordprocessingml")
  })

  it("retains deterministic Rustybuzz summary facts without raw glyph evidence", () => {
    expect(summary).toMatchObject({
      summaryId: "pdf-report-font-bakeoff-summary-v1",
      status: "metric-comparison-complete",
      engine: {
        source: "flowdoc-rustybuzz-native-smoke",
        shaperRevision: "rustybuzz-0.20.1",
        execution: "package-local-native",
        rawGlyphEvidenceRetained: false,
      },
      coverage: {
        sampleCount: 6,
        familyCount: 3,
      },
      recommendation: {
        dropInMetricLeaderFamilyId: "sarabun",
        regularMetricLeaderFamilyId: "ibm-plex-sans-thai",
        promotionStatus: "not-promoted",
        activeStyleMappingsChanged: false,
      },
    })
    expect(summary.referenceFont.fontBytesRetained).toBe(false)
    expect(summary.referenceFont.repositoryPath).toBeNull()
    expect(summary.families.every((family: any) => family.summary.missingGlyphCount === 0)).toBe(true)
    expect(JSON.stringify(summary)).not.toContain("fontPath")
    expect(JSON.stringify(summary)).not.toContain("C:\\Windows\\Fonts")
    expect(JSON.stringify(summary)).not.toContain('"glyphs"')
  })

  it("binds comparison hashes to registered active or candidate font assets", () => {
    const assets = [...manifest.fontAssets, ...manifest.candidateFontAssets]
    const hashesById = new Map(assets.map((asset) => [asset.fontId, asset.sha256]))

    summary.families.forEach((family: any) => {
      expect(hashesById.get(family.regularFont.fontId)).toBe(family.regularFont.sha256)
      expect(hashesById.get(family.boldFont.fontId)).toBe(family.boldFont.sha256)
    })
  })

  it("selects IBM Plex for pilot calibration without promoting active mappings", () => {
    const ibm = summary.families.find((family: any) => family.familyId === "ibm-plex-sans-thai")
    expect(ibm.summary).toMatchObject({
      missingGlyphCount: 0,
      byStyle: {
        regular: {
          meanAbsoluteAdvanceDeltaPercent: 1.0237,
          maxAbsoluteAdvanceDeltaPercent: 2.0742,
          meanScaleToReference: 0.989911,
        },
        bold: {
          meanAbsoluteAdvanceDeltaPercent: 8.3387,
          maxAbsoluteAdvanceDeltaPercent: 11.3957,
          meanScaleToReference: 1.092188,
        },
      },
      qualification: "not-advance-compatible",
    })
    expect(decision).toMatchObject({
      phaseId: "PDF-PILOT-01",
      status: "accepted-for-pilot-calibration",
      scope: "pdf-pilot-only",
      selectedFamily: {
        familyId: "ibm-plex-sans-thai",
        regularFontId: "ibm-plex-sans-thai-regular",
        boldFontId: "ibm-plex-sans-thai-bold",
      },
      promotionGate: {
        promotionStatus: "not-promoted",
        activeStyleMappingsChanged: false,
      },
    })
    expect(decision.measuredFacts.regular).toEqual({
      meanAbsoluteAdvanceDeltaPercent: ibm.summary.byStyle.regular.meanAbsoluteAdvanceDeltaPercent,
      maxAbsoluteAdvanceDeltaPercent: ibm.summary.byStyle.regular.maxAbsoluteAdvanceDeltaPercent,
      initialScaleToReference: ibm.summary.byStyle.regular.meanScaleToReference,
    })
    expect(decision.measuredFacts.bold).toEqual({
      meanAbsoluteAdvanceDeltaPercent: ibm.summary.byStyle.bold.meanAbsoluteAdvanceDeltaPercent,
      maxAbsoluteAdvanceDeltaPercent: ibm.summary.byStyle.bold.maxAbsoluteAdvanceDeltaPercent,
      initialScaleToReference: ibm.summary.byStyle.bold.meanScaleToReference,
    })

    const activeMappedFontIds = manifest.styleMappings.flatMap((mapping) => [
      mapping.primaryFontId,
      ...mapping.fallbackFontIds,
    ])
    expect(activeMappedFontIds).not.toContain("ibm-plex-sans-thai-regular")
    expect(activeMappedFontIds).not.toContain("ibm-plex-sans-thai-bold")
  })

  it("keeps the builder package-local and the work item visible in the phase trail", () => {
    const packageJson = readJson<{ scripts: Record<string, string> }>("packages/text-engine-rust-wasm/package.json")
    const script = readFileSync(resolve(process.cwd(), "packages/text-engine-rust-wasm/scripts/build-pdf-font-bakeoff.mjs"), "utf8")
    const doc = readFileSync(resolve(process.cwd(), "docs/PDF_REPORT_FIDELITY_PILOT.md"), "utf8")
    const readme = readFileSync(resolve(process.cwd(), "README.md"), "utf8")
    const ledger = readFileSync(resolve(process.cwd(), "docs/PHASE_LEDGER.md"), "utf8")

    expect(packageJson.scripts["pdf-font-bakeoff"]).toBe("node scripts/build-pdf-font-bakeoff.mjs")
    expect(script).toContain("rust-shaper/Cargo.toml")
    expect(script).toContain("rawGlyphEvidenceRetained: false")
    expect(script).not.toContain("writeFileSync(referencePaths")
    expect(doc).toContain("Status: PDF-PILOT-01 font bake-off evidence accepted.")
    expect(doc).toContain("Next phase: `PDF-PILOT-02` measured PDF draw contract extension.")
    expect(readme).toContain("PDF report fidelity pilot")
    expect(ledger).toContain("## PDF-PILOT-01 Font Bake-Off Evidence")
  })
})
