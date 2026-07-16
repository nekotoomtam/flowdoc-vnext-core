import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, "../../..")
const packageRoot = resolve(scriptDir, "..")
const corpusPath = join(repoRoot, "fixtures/pdf-report-font-bakeoff-corpus.v1.json")
const manifestPath = join(repoRoot, "assets/fonts/font-assets.v1.json")
const cargoManifestPath = join(packageRoot, "rust-shaper/Cargo.toml")
const outputPath = resolveOption("--output") ?? join(packageRoot, "fixtures/pdf-report-font-bakeoff-summary.v1.json")

function resolveOption(name) {
  const index = process.argv.indexOf(name)
  if (index >= 0) return process.argv[index + 1]
  const prefix = `${name}=`
  const inline = process.argv.find((value) => value.startsWith(prefix))
  return inline?.slice(prefix.length)
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex")
}

function round(value, digits = 6) {
  return Number(value.toFixed(digits))
}

function requireFile(path, label) {
  if (!existsSync(path)) throw new Error(`${label} does not exist: ${path}`)
  return path
}

function referenceFontPath(style) {
  const optionName = style === "bold" ? "--reference-bold" : "--reference-regular"
  const environmentName = style === "bold"
    ? "FLOWDOC_PDF_REFERENCE_FONT_BOLD"
    : "FLOWDOC_PDF_REFERENCE_FONT_REGULAR"
  const windowsName = style === "bold" ? "tahomabd.ttf" : "tahoma.ttf"
  const windowsRoot = process.env.WINDIR == null ? null : join(process.env.WINDIR, "Fonts")
  const fallback = windowsRoot == null ? null : join(windowsRoot, windowsName)
  const selected = resolveOption(optionName) ?? process.env[environmentName] ?? fallback

  if (selected == null) {
    throw new Error(`${optionName} or ${environmentName} is required outside Windows`)
  }
  return requireFile(resolve(selected), `${style} reference font`)
}

function buildNativeShaper() {
  const result = spawnSync("cargo", [
    "build",
    "--quiet",
    "--manifest-path",
    cargoManifestPath,
  ], {
    cwd: packageRoot,
    encoding: "utf8",
  })

  if (result.status !== 0) {
    throw new Error(`rustybuzz native shaper build failed:\n${result.stderr || result.stdout}`)
  }

  const executableName = process.platform === "win32"
    ? "flowdoc-rustybuzz-smoke.exe"
    : "flowdoc-rustybuzz-smoke"
  return requireFile(
    join(packageRoot, "rust-shaper/target/debug", executableName),
    "rustybuzz native shaper",
  )
}

function shapeText(executablePath, fontPath, text, fontId) {
  const result = spawnSync(executablePath, [fontPath, text, fontId], {
    cwd: packageRoot,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  })

  if (result.status !== 0) {
    throw new Error(`rustybuzz shaping failed for ${fontId}:\n${result.stderr || result.stdout}`)
  }

  const raw = JSON.parse(result.stdout)
  const totalAdvanceFontUnits = raw.glyphs.reduce((total, glyph) => total + glyph.xAdvance, 0)
  const missingGlyphCount = raw.glyphs.filter((glyph) => glyph.glyphId === 0).length
  const zeroAdvanceGlyphCount = raw.glyphs.filter((glyph) => glyph.xAdvance === 0).length

  return {
    source: raw.source,
    shaperRevision: raw.shaperRevision,
    unitsPerEm: raw.unitsPerEm,
    glyphCount: raw.glyphCount,
    missingGlyphCount,
    zeroAdvanceGlyphCount,
    totalAdvanceFontUnits,
    normalizedAdvanceEm: round(totalAdvanceFontUnits / raw.unitsPerEm),
  }
}

function findAsset(manifest, fontId) {
  const assets = [...manifest.fontAssets, ...(manifest.candidateFontAssets ?? [])]
  const asset = assets.find((candidate) => candidate.fontId === fontId)
  if (asset == null) throw new Error(`font asset is not registered: ${fontId}`)

  const path = join(repoRoot, asset.target.path)
  requireFile(path, fontId)
  const actualHash = sha256File(path)
  if (actualHash !== asset.sha256) {
    throw new Error(`font asset hash mismatch for ${fontId}: expected ${asset.sha256}, received ${actualHash}`)
  }

  return { ...asset, path }
}

function styleSummary(samples, style) {
  const styleSamples = samples.filter((sample) => sample.style === style)
  const absoluteDeltas = styleSamples.map((sample) => Math.abs(sample.advanceDeltaPercent))
  const scaleFactors = styleSamples.map((sample) => sample.referenceAdvanceEm / sample.candidateAdvanceEm)

  return {
    sampleCount: styleSamples.length,
    meanAbsoluteAdvanceDeltaPercent: round(
      absoluteDeltas.reduce((total, value) => total + value, 0) / absoluteDeltas.length,
      4,
    ),
    maxAbsoluteAdvanceDeltaPercent: round(Math.max(...absoluteDeltas), 4),
    meanScaleToReference: round(
      scaleFactors.reduce((total, value) => total + value, 0) / scaleFactors.length,
      6,
    ),
  }
}

const corpus = readJson(corpusPath)
const manifest = readJson(manifestPath)
const executablePath = buildNativeShaper()
const referencePaths = {
  regular: referenceFontPath("regular"),
  bold: referenceFontPath("bold"),
}
const referenceHashes = {
  regular: sha256File(referencePaths.regular),
  bold: sha256File(referencePaths.bold),
}

const referenceMeasurements = new Map()
for (const sample of corpus.samples) {
  const style = sample.style
  referenceMeasurements.set(sample.sampleId, shapeText(
    executablePath,
    referencePaths[style],
    sample.text,
    `tahoma-${style}-local-reference`,
  ))
}

const families = corpus.comparisonFamilies.map((family) => {
  const assets = {
    regular: findAsset(manifest, family.regularFontId),
    bold: findAsset(manifest, family.boldFontId),
  }
  const samples = corpus.samples.map((sample) => {
    const reference = referenceMeasurements.get(sample.sampleId)
    const candidate = shapeText(
      executablePath,
      assets[sample.style].path,
      sample.text,
      assets[sample.style].fontId,
    )
    const advanceRatio = candidate.normalizedAdvanceEm / reference.normalizedAdvanceEm
    const deltaPercent = (advanceRatio - 1) * 100

    return {
      sampleId: sample.sampleId,
      style: sample.style,
      referenceAdvanceEm: reference.normalizedAdvanceEm,
      candidateAdvanceEm: candidate.normalizedAdvanceEm,
      advanceRatio: round(advanceRatio),
      advanceDeltaPercent: round(deltaPercent, 4),
      glyphCount: candidate.glyphCount,
      missingGlyphCount: candidate.missingGlyphCount,
      zeroAdvanceGlyphCount: candidate.zeroAdvanceGlyphCount,
    }
  })
  const absoluteDeltas = samples.map((sample) => Math.abs(sample.advanceDeltaPercent))
  const missingGlyphCount = samples.reduce((total, sample) => total + sample.missingGlyphCount, 0)
  const meanAbsoluteAdvanceDeltaPercent = round(
    absoluteDeltas.reduce((total, value) => total + value, 0) / absoluteDeltas.length,
    4,
  )
  const maxAbsoluteAdvanceDeltaPercent = round(Math.max(...absoluteDeltas), 4)
  const qualified = (
    missingGlyphCount <= corpus.thresholds.missingGlyphCount
    && meanAbsoluteAdvanceDeltaPercent <= corpus.thresholds.meanAbsoluteAdvanceDeltaPercent
    && maxAbsoluteAdvanceDeltaPercent <= corpus.thresholds.maxAbsoluteAdvanceDeltaPercent
  )

  return {
    familyId: family.familyId,
    family: family.family,
    inventoryStatus: family.inventoryStatus,
    regularFont: {
      fontId: assets.regular.fontId,
      sha256: assets.regular.sha256,
    },
    boldFont: {
      fontId: assets.bold.fontId,
      sha256: assets.bold.sha256,
    },
    summary: {
      sampleCount: samples.length,
      missingGlyphCount,
      meanAbsoluteAdvanceDeltaPercent,
      maxAbsoluteAdvanceDeltaPercent,
      byStyle: {
        regular: styleSummary(samples, "regular"),
        bold: styleSummary(samples, "bold"),
      },
      qualification: qualified ? "advance-compatible" : "not-advance-compatible",
    },
    samples,
  }
})

const qualifiedFamilies = families
  .filter((family) => family.summary.qualification === "advance-compatible")
  .sort((left, right) => (
    left.summary.meanAbsoluteAdvanceDeltaPercent - right.summary.meanAbsoluteAdvanceDeltaPercent
    || left.summary.maxAbsoluteAdvanceDeltaPercent - right.summary.maxAbsoluteAdvanceDeltaPercent
    || left.familyId.localeCompare(right.familyId)
  ))
const metricLeader = qualifiedFamilies[0] ?? null
const regularMetricLeader = [...families]
  .filter((family) => family.summary.missingGlyphCount === 0)
  .sort((left, right) => (
    left.summary.byStyle.regular.meanAbsoluteAdvanceDeltaPercent
      - right.summary.byStyle.regular.meanAbsoluteAdvanceDeltaPercent
    || left.summary.byStyle.regular.maxAbsoluteAdvanceDeltaPercent
      - right.summary.byStyle.regular.maxAbsoluteAdvanceDeltaPercent
    || left.familyId.localeCompare(right.familyId)
  ))[0] ?? null
const firstReference = referenceMeasurements.values().next().value

const output = {
  summaryVersion: 1,
  summaryId: "pdf-report-font-bakeoff-summary-v1",
  pilotId: corpus.pilotId,
  corpusId: corpus.corpusId,
  policyRevision: corpus.policyRevision,
  status: metricLeader == null ? "blocked-no-compatible-family" : "metric-comparison-complete",
  engine: {
    source: firstReference.source,
    shaperRevision: firstReference.shaperRevision,
    execution: "package-local-native",
    rawGlyphEvidenceRetained: false,
  },
  referenceFont: {
    ...corpus.referenceFont,
    regularSha256: referenceHashes.regular,
    boldSha256: referenceHashes.bold,
  },
  thresholds: corpus.thresholds,
  referenceArtifacts: corpus.referenceArtifacts,
  coverage: {
    sampleCount: corpus.samples.length,
    familyCount: families.length,
    qualifiedFamilyCount: qualifiedFamilies.length,
    styles: [...new Set(corpus.samples.map((sample) => sample.style))].sort(),
  },
  families,
  recommendation: {
    dropInMetricLeaderFamilyId: metricLeader?.familyId ?? null,
    regularMetricLeaderFamilyId: regularMetricLeader?.familyId ?? null,
    qualifiedFamilyIds: qualifiedFamilies.map((family) => family.familyId),
    promotionStatus: "not-promoted",
    activeStyleMappingsChanged: false,
    requiresVisualReview: true,
    requiresRendererLineBoxReview: true,
  },
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8")
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`)
