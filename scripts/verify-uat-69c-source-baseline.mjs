import { createHash } from "node:crypto"
import { createReadStream } from "node:fs"
import { open, readFile, readdir, stat } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const rootDirectory = dirname(dirname(fileURLToPath(import.meta.url)))
const manifestPath = join(rootDirectory, "fixtures", "pdf-export-realdoc-69c-source-baseline.v1.json")

function readOption(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? null : process.argv[index + 1] ?? null
}

function compareOrdinal(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label} mismatch: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)
  }
}

async function sha256File(path) {
  const hash = createHash("sha256")
  for await (const chunk of createReadStream(path)) hash.update(chunk)
  return hash.digest("hex")
}

async function pngDimensions(path) {
  const handle = await open(path, "r")
  try {
    const header = Buffer.alloc(24)
    const { bytesRead } = await handle.read(header, 0, header.length, 0)
    if (
      bytesRead !== header.length
      || !header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      || header.subarray(12, 16).toString("ascii") !== "IHDR"
    ) throw new Error(`${path} is not a supported PNG`)
    return { pixelWidth: header.readUInt32BE(16), pixelHeight: header.readUInt32BE(20) }
  } finally {
    await handle.close()
  }
}

function canonicalImageDigest(images) {
  const lines = images.map((image) => (
    `${image.path}\t${image.byteLength}\t${image.pixelWidth}x${image.pixelHeight}\t${image.sha256}\n`
  )).join("")
  return createHash("sha256").update(lines, "utf8").digest("hex")
}

async function collectImages(semanticDirectory) {
  const imageDirectory = join(semanticDirectory, "images")
  const entries = await readdir(imageDirectory, { withFileTypes: true })
  const unsupported = entries.filter((entry) => !entry.isFile() || !entry.name.toLowerCase().endsWith(".png"))
  if (unsupported.length > 0) {
    throw new Error(`semantic image directory contains unsupported entries: ${unsupported.map((entry) => entry.name).join(", ")}`)
  }

  const images = []
  for (const entry of entries.sort((left, right) => compareOrdinal(left.name, right.name))) {
    const absolutePath = join(imageDirectory, entry.name)
    const facts = await stat(absolutePath)
    const dimensions = await pngDimensions(absolutePath)
    images.push({
      path: `images/${entry.name}`,
      byteLength: facts.size,
      ...dimensions,
      sha256: await sha256File(absolutePath),
    })
  }
  return images
}

async function main() {
  const pdfPath = readOption("--pdf")
  const semanticDirectory = readOption("--semantic-dir")
  if (pdfPath == null || semanticDirectory == null) {
    throw new Error("usage: node scripts/verify-uat-69c-source-baseline.mjs --pdf <pdf-path> --semantic-dir <semantic-directory>")
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"))
  const pdfFacts = await stat(pdfPath)
  const pdfSha256 = await sha256File(pdfPath)
  assertEqual("pdf byte length", pdfFacts.size, manifest.pdf.byteLength)
  assertEqual("pdf sha256", pdfSha256, manifest.pdf.sha256)

  const semanticFiles = []
  for (const expected of manifest.semanticSource.rootFiles) {
    const path = join(semanticDirectory, expected.path)
    const facts = await stat(path)
    const sha256 = await sha256File(path)
    assertEqual(`${expected.path} byte length`, facts.size, expected.byteLength)
    assertEqual(`${expected.path} sha256`, sha256, expected.sha256)
    semanticFiles.push({ path: expected.path, byteLength: facts.size, sha256 })
  }

  const images = await collectImages(semanticDirectory)
  const imageByteLength = images.reduce((sum, image) => sum + image.byteLength, 0)
  const imagePixelCount = images.reduce((sum, image) => sum + image.pixelWidth * image.pixelHeight, 0)
  const imageDigest = canonicalImageDigest(images)
  assertEqual("image file count", images.length, manifest.semanticSource.images.fileCount)
  assertEqual("image byte length", imageByteLength, manifest.semanticSource.images.totalByteLength)
  assertEqual("image pixel count", imagePixelCount, manifest.semanticSource.images.totalPixelCount)
  assertEqual("image canonical digest", imageDigest, manifest.semanticSource.images.canonicalDigest)

  const semanticMap = JSON.parse(await readFile(join(semanticDirectory, "document_semantic_no_pages.json"), "utf8"))
  const section21 = semanticMap.modules
    .flatMap((module) => module.sections)
    .find((section) => section.section_number === manifest.firstSlice.sectionNumber)
  if (section21 == null) throw new Error("section 2.1 is missing from the semantic map")
  const sectionImagePaths = new Set(section21.screenshots.map((screenshot) => screenshot.file))
  const sectionImages = images.filter((image) => sectionImagePaths.has(image.path))
  assertEqual("section 2.1 requirement count", section21.requirements.length, manifest.firstSlice.requirementCount)
  assertEqual("section 2.1 screenshot count", sectionImages.length, manifest.firstSlice.screenshotCount)
  assertEqual(
    "section 2.1 feature text character count",
    section21.requirements.reduce((sum, requirement) => sum + requirement.feature_text.length, 0),
    manifest.firstSlice.featureTextCharacterCount,
  )
  assertEqual(
    "section 2.1 image byte length",
    sectionImages.reduce((sum, image) => sum + image.byteLength, 0),
    manifest.firstSlice.screenshotByteLength,
  )
  assertEqual(
    "section 2.1 image pixel count",
    sectionImages.reduce((sum, image) => sum + image.pixelWidth * image.pixelHeight, 0),
    manifest.firstSlice.screenshotPixelCount,
  )
  assertEqual("section 2.1 image canonical digest", canonicalImageDigest(sectionImages), manifest.firstSlice.screenshotCanonicalDigest)

  const canonicalSourceLines = [
    `pdf/${manifest.pdf.fileName}\t${pdfFacts.size}\t${pdfSha256}\n`,
    ...semanticFiles.map((file) => `semantic/${file.path}\t${file.byteLength}\t${file.sha256}\n`),
    `semantic/images\t${images.length}\t${imageByteLength}\t${imagePixelCount}\t${imageDigest}\n`,
  ].join("")
  const sourceBundleFingerprint = `sha256:${createHash("sha256").update(canonicalSourceLines, "utf8").digest("hex")}`
  assertEqual("source bundle fingerprint", sourceBundleFingerprint, manifest.sourceBundleFingerprint)

  process.stdout.write(`${JSON.stringify({
    status: "verified",
    baselineId: manifest.baselineId,
    sourceBundleFingerprint,
    pdf: { pageCount: manifest.pdf.pageCount, byteLength: pdfFacts.size, sha256: pdfSha256 },
    semantic: {
      moduleCount: manifest.contentFacts.moduleCount,
      sectionCount: manifest.contentFacts.sectionCount,
      requirementCount: manifest.contentFacts.requirementCount,
      screenshotCount: images.length,
      imagePixelCount,
    },
    firstSlice: {
      sectionNumber: manifest.firstSlice.sectionNumber,
      requirementCount: section21.requirements.length,
      screenshotCount: sectionImages.length,
    },
  }, null, 2)}\n`)
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
