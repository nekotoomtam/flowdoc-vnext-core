import { createHash } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(scriptDir, "..")
const repoRoot = resolve(packageRoot, "../..")
const sourceRequestPath = join(repoRoot, "fixtures/pdf-pilot-thai-one-page-request.v1.json")
const corpusPath = join(repoRoot, "fixtures/pdf-report-font-bakeoff-corpus.v1.json")
const outputPath = join(repoRoot, "fixtures/pdf-pilot-image-one-page-request.v1.json")

function resolveOption(name) {
  const index = process.argv.indexOf(name)
  if (index >= 0) return process.argv[index + 1]
  const prefix = `${name}=`
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length)
}

const fallbackImagePath = resolve(
  repoRoot,
  "../ocr-benchmark-skeleton/reports/INV_9437125258/assets/ocr_accuracy.png",
)
const imagePath = resolve(
  resolveOption("--image")
    ?? process.env.FLOWDOC_PDF_PILOT_OCR_ACCURACY_IMAGE
    ?? fallbackImagePath,
)
if (!existsSync(imagePath)) {
  throw new Error("--image or FLOWDOC_PDF_PILOT_OCR_ACCURACY_IMAGE must point to ocr_accuracy.png")
}

const imageBytes = readFileSync(imagePath)
const corpus = JSON.parse(readFileSync(corpusPath, "utf8"))
const pinnedImage = corpus.referenceArtifacts.find((artifact) => artifact.artifactId === "ocr-accuracy-image")
if (pinnedImage == null) throw new Error("ocr-accuracy-image is not pinned in the PDF corpus")
const imageHash = createHash("sha256").update(imageBytes).digest("hex")
if (imageHash !== pinnedImage.sha256 || imageBytes.byteLength !== pinnedImage.bytes) {
  throw new Error("external ocr_accuracy.png does not match the pinned corpus identity")
}
if (imageBytes.subarray(1, 4).toString("ascii") !== "PNG") throw new Error("pinned image is not PNG")
const pixelWidth = imageBytes.readUInt32BE(16)
const pixelHeight = imageBytes.readUInt32BE(20)
if (pixelWidth !== 1950 || pixelHeight !== 900) throw new Error("unexpected pinned image dimensions")

const request = JSON.parse(readFileSync(sourceRequestPath, "utf8"))
request.rendererProfileId = "pdf-pilot-thai-image-one-page-v1"
request.plan.drawCommands.push({
  id: "pdf:pilot:ocr-accuracy",
  sourceCommandId: "render:pilot:ocr-accuracy",
  fragmentId: "fragment:pilot:ocr-accuracy",
  pageIndex: 0,
  pageNumber: 1,
  operation: "draw-fragment-box",
  nodeId: "pilot-ocr-accuracy",
  nodeType: "zone",
  bounds: { xPt: 60, yPt: 220, widthPt: 492, heightPt: 228 },
  text: null,
  table: null,
})
request.plan.summary = {
  ...request.plan.summary,
  inputCommandCount: 4,
  drawCommandCount: 4,
  boxCommandCount: 2,
}
request.imageAssets = [{
  assetId: pinnedImage.artifactId,
  mediaType: pinnedImage.mediaType,
  sha256: pinnedImage.sha256,
  pixelWidth,
  pixelHeight,
  bytesOwner: "backend",
  accessibility: {
    decorative: false,
    altText: "เปรียบเทียบความถูกต้องของ OCR ระหว่าง Google และ Azure",
  },
}]
request.paintCommands.push({
  id: "paint:pilot:ocr-accuracy",
  sourceCommandId: "pdf:pilot:ocr-accuracy",
  pageIndex: 0,
  paintOrder: 4,
  bounds: { xPt: 60, yPt: 220, widthPt: 492, heightPt: 228 },
  kind: "image",
  assetId: pinnedImage.artifactId,
  fit: "contain",
  crop: null,
  opacity: 1,
})

writeFileSync(outputPath, `${JSON.stringify(request, null, 2)}\n`, "utf8")
process.stdout.write(`${outputPath}\n`)
