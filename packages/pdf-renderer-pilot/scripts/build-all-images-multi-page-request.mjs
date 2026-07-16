import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(scriptDir, "..")
const repoRoot = resolve(packageRoot, "../..")
const sourcePath = join(repoRoot, "fixtures/pdf-pilot-thai-one-page-request.v1.json")
const corpusPath = join(repoRoot, "fixtures/pdf-report-font-bakeoff-corpus.v1.json")
const outputPath = join(repoRoot, "fixtures/pdf-pilot-all-five-images-five-page-request.v1.json")
const fallbackAssetRoot = resolve(
  repoRoot,
  "../ocr-benchmark-skeleton/reports/INV_9437125258/assets",
)

const IMAGE_DEFINITIONS = [
  {
    assetId: "source-evidence-image",
    fileName: "source_evidence.png",
    pixelWidth: 1548,
    pixelHeight: 1376,
    altText: "ภาพหลักฐานจากเอกสารต้นฉบับที่ใช้ในการทดสอบ OCR",
  },
  {
    assetId: "ocr-accuracy-image",
    fileName: "ocr_accuracy.png",
    pixelWidth: 1950,
    pixelHeight: 900,
    altText: "เปรียบเทียบความถูกต้องของ OCR ระหว่าง Google และ Azure",
  },
  {
    assetId: "native-extraction-image",
    fileName: "native_extraction.png",
    pixelWidth: 1950,
    pixelHeight: 900,
    altText: "เปรียบเทียบผลการสกัดข้อความดิจิทัลโดยตรง",
  },
  {
    assetId: "mapping-gap-image",
    fileName: "mapping_gap.png",
    pixelWidth: 1950,
    pixelHeight: 900,
    altText: "เปรียบเทียบช่องว่างของการจับคู่ข้อมูลสำคัญ",
  },
  {
    assetId: "latency-rounds-image",
    fileName: "latency_rounds.png",
    pixelWidth: 1950,
    pixelHeight: 900,
    altText: "เปรียบเทียบเวลาในการประมวลผลแต่ละรอบ",
  },
]

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex")
}

function suffixId(value, pageIndex) {
  return `${value}:p${pageIndex + 1}`
}

function pngDimensions(bytes) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (bytes.byteLength < 24 || !bytes.subarray(0, 8).equals(signature)) {
    throw new Error("Expected a PNG signature.")
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  }
}

function readOption(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? null : process.argv[index + 1] ?? null
}

function sourceCommandsForPage(baseCommands, definition, pageIndex) {
  const pageNumber = pageIndex + 1
  const commands = baseCommands.map((command) => ({
    ...clone(command),
    id: suffixId(command.id, pageIndex),
    sourceCommandId: suffixId(command.sourceCommandId, pageIndex),
    fragmentId: suffixId(command.fragmentId, pageIndex),
    nodeId: suffixId(command.nodeId, pageIndex),
    pageIndex,
    pageNumber,
  }))
  commands.push({
    id: `pdf:pilot:${definition.assetId}:p${pageNumber}`,
    sourceCommandId: `render:pilot:${definition.assetId}:p${pageNumber}`,
    fragmentId: `fragment:pilot:${definition.assetId}:p${pageNumber}`,
    pageIndex,
    pageNumber,
    operation: "draw-fragment-box",
    nodeId: `pilot-${definition.assetId}:p${pageNumber}`,
    nodeType: "zone",
    bounds: { xPt: 60, yPt: 220, widthPt: 492, heightPt: 360 },
    text: null,
    table: null,
  })
  return commands
}

function paintCommandsForPage(baseCommands, definition, pageIndex) {
  const pageNumber = pageIndex + 1
  const commands = baseCommands.map((command) => ({
    ...clone(command),
    id: suffixId(command.id, pageIndex),
    sourceCommandId: suffixId(command.sourceCommandId, pageIndex),
    pageIndex,
  }))
  commands.push({
    id: `paint:pilot:${definition.assetId}:p${pageNumber}`,
    sourceCommandId: `pdf:pilot:${definition.assetId}:p${pageNumber}`,
    pageIndex,
    paintOrder: 4,
    bounds: { xPt: 60, yPt: 220, widthPt: 492, heightPt: 360 },
    kind: "image",
    assetId: definition.assetId,
    fit: "contain",
    crop: null,
    opacity: 1,
  })
  return commands
}

const assetRoot = resolve(
  readOption("--asset-root")
    ?? process.env.FLOWDOC_PDF_PILOT_REPORT_ASSET_ROOT
    ?? fallbackAssetRoot,
)
const request = JSON.parse(readFileSync(sourcePath, "utf8"))
const corpus = JSON.parse(readFileSync(corpusPath, "utf8"))
const artifactsById = new Map(corpus.referenceArtifacts.map((artifact) => [artifact.artifactId, artifact]))

const imageAssets = IMAGE_DEFINITIONS.map((definition) => {
  const artifact = artifactsById.get(definition.assetId)
  if (artifact == null || artifact.mediaType !== "image/png") {
    throw new Error(`Missing pinned PNG artifact ${definition.assetId}.`)
  }
  if (basename(artifact.pointer) !== definition.fileName) {
    throw new Error(`Pinned pointer mismatch for ${definition.assetId}.`)
  }
  const bytes = readFileSync(resolve(assetRoot, definition.fileName))
  const dimensions = pngDimensions(bytes)
  if (bytes.byteLength !== artifact.bytes || sha256(bytes) !== artifact.sha256) {
    throw new Error(`External bytes do not match the pinned identity for ${definition.assetId}.`)
  }
  if (dimensions.width !== definition.pixelWidth || dimensions.height !== definition.pixelHeight) {
    throw new Error(`External dimensions do not match the pinned matrix for ${definition.assetId}.`)
  }
  return {
    assetId: definition.assetId,
    mediaType: "image/png",
    sha256: artifact.sha256,
    pixelWidth: definition.pixelWidth,
    pixelHeight: definition.pixelHeight,
    bytesOwner: "backend",
    accessibility: { decorative: false, altText: definition.altText },
  }
})

const baseSources = clone(request.plan.drawCommands)
const basePaint = clone(request.paintCommands)
const basePageBox = clone(request.pageBoxes[0])
request.rendererProfileId = "pdf-pilot-all-five-images-five-page-v1"
request.plan.pageCount = IMAGE_DEFINITIONS.length
request.plan.drawCommands = IMAGE_DEFINITIONS.flatMap((definition, pageIndex) => (
  sourceCommandsForPage(baseSources, definition, pageIndex)
))
request.plan.summary = {
  inputCommandCount: 20,
  drawCommandCount: 20,
  textCommandCount: 10,
  boxCommandCount: 10,
  blockingIssueCount: 0,
  warningIssueCount: 0,
}
request.pageBoxes = IMAGE_DEFINITIONS.map((_, pageIndex) => ({
  ...clone(basePageBox),
  pageIndex,
  pageNumber: pageIndex + 1,
}))
request.imageAssets = imageAssets
request.paintCommands = IMAGE_DEFINITIONS.flatMap((definition, pageIndex) => (
  paintCommandsForPage(basePaint, definition, pageIndex)
))

writeFileSync(outputPath, `${JSON.stringify(request, null, 2)}\n`, "utf8")
process.stdout.write(`${outputPath}\n`)
