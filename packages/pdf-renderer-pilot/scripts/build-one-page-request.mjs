import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(scriptDir, "..")
const repoRoot = resolve(packageRoot, "../..")
const outputPath = join(repoRoot, "fixtures/pdf-pilot-thai-one-page-request.v1.json")
const manifestPath = join(repoRoot, "assets/fonts/font-assets.v1.json")
const fontPath = join(repoRoot, "assets/fonts/IBM_Plex_Sans_Thai/IBMPlexSansThai-Regular.ttf")
const shaperPath = join(
  repoRoot,
  "packages/text-engine-rust-wasm/rust-shaper/target/debug",
  process.platform === "win32" ? "flowdoc-rustybuzz-smoke.exe" : "flowdoc-rustybuzz-smoke",
)

const pilotId = "PDF-PILOT-INV-9437125258"
const measurementProfileId = "pdf-pilot-rustybuzz-0.20.1-ibm-plex-regular-v1"
const rendererProfileId = "pdf-pilot-thai-type0-one-page-v1"

function requireFile(path, label) {
  if (!existsSync(path)) throw new Error(`${label} does not exist: ${path}`)
  return path
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex")
}

function round(value) {
  return Number(value.toFixed(6))
}

function byteOffsetMap(text) {
  const offsets = new Map()
  let utf8Offset = 0
  let utf16Offset = 0

  while (utf16Offset < text.length) {
    offsets.set(utf8Offset, utf16Offset)
    const codePoint = text.codePointAt(utf16Offset)
    const scalar = String.fromCodePoint(codePoint)
    utf8Offset += Buffer.byteLength(scalar, "utf8")
    utf16Offset += scalar.length
  }
  offsets.set(utf8Offset, text.length)
  return offsets
}

function shape(text, fontSizePt, measurementRequestId) {
  const result = spawnSync(requireFile(shaperPath, "Rustybuzz shaper"), [
    requireFile(fontPath, "IBM Plex Sans Thai Regular"),
    text,
    "ibm-plex-sans-thai-regular",
  ], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  })
  if (result.status !== 0) {
    throw new Error(`Rustybuzz shaping failed:\n${result.stderr || result.stdout}`)
  }

  const raw = JSON.parse(result.stdout)
  if (raw.shaperRevision !== "rustybuzz-0.20.1" || raw.unitsPerEm !== 1000) {
    throw new Error(`unexpected shaping identity: ${raw.shaperRevision}/${raw.unitsPerEm}`)
  }
  const offsets = byteOffsetMap(text)
  const clusterStarts = [...new Set(raw.glyphs.map((glyph) => glyph.cluster))].sort((a, b) => a - b)
  const textByteLength = Buffer.byteLength(text, "utf8")

  return {
    measurementRequestId,
    glyphs: raw.glyphs.map((glyph) => {
      const clusterIndex = clusterStarts.indexOf(glyph.cluster)
      const endByteOffset = clusterStarts[clusterIndex + 1] ?? textByteLength
      const clusterStartOffset = offsets.get(glyph.cluster)
      const clusterEndOffset = offsets.get(endByteOffset)
      if (clusterStartOffset == null || clusterEndOffset == null) {
        throw new Error(`Rustybuzz cluster does not align to a Unicode scalar: ${glyph.cluster}`)
      }
      return {
        glyphIndex: glyph.index,
        glyphId: glyph.glyphId,
        advancePt: round(glyph.xAdvance / raw.unitsPerEm * fontSizePt),
        offsetXPt: round(glyph.xOffset / raw.unitsPerEm * fontSizePt),
        offsetYPt: round(glyph.yOffset / raw.unitsPerEm * fontSizePt),
        clusterStartOffset,
        clusterEndOffset,
      }
    }),
  }
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
const font = [...manifest.fontAssets, ...(manifest.candidateFontAssets ?? [])]
  .find((asset) => asset.fontId === "ibm-plex-sans-thai-regular")
if (font == null) throw new Error("IBM Plex Sans Thai Regular is not registered")
if (sha256(fontPath) !== font.sha256) throw new Error("IBM Plex Sans Thai Regular hash mismatch")

const headingText = "สรุปผล OCR ภาษาไทย 100%"
const bodyText = "ค้นหา เลือก และคัดลอกข้อความได้"
const heading = shape(headingText, 20, "pdf-pilot:heading:ibm-plex-regular")
const body = shape(bodyText, 12, "pdf-pilot:body:ibm-plex-regular")

const request = {
  contractVersion: 1,
  kind: "pdf-measured-draw-contract-request",
  pilotId,
  rendererProfileId,
  measurementProfileId,
  bindProductionRenderer: false,
  plan: {
    source: "vnext-pdf-renderer-adapter",
    mode: "measured-render-command-adapter",
    status: "ready",
    rendererContract: {
      consumes: "measured-render-commands",
      mayRelayout: false,
      requiresAuthoredDocumentForLayout: false,
      output: "pdf",
    },
    artifact: {
      kind: "pdf",
      status: "not-rendered",
      contentType: "application/pdf",
      bytes: null,
      storageId: null,
    },
    pageCount: 1,
    drawCommands: [
      {
        id: "pdf:pilot:panel",
        sourceCommandId: "render:pilot:panel",
        fragmentId: "fragment:pilot:panel",
        pageIndex: 0,
        pageNumber: 1,
        operation: "draw-fragment-box",
        nodeId: "pilot-panel",
        nodeType: "zone",
        bounds: { xPt: 60, yPt: 60, widthPt: 492, heightPt: 124 },
        text: null,
        table: null,
      },
      {
        id: "pdf:pilot:heading",
        sourceCommandId: "render:pilot:heading",
        fragmentId: "fragment:pilot:heading",
        pageIndex: 0,
        pageNumber: 1,
        operation: "draw-text",
        nodeId: "pilot-heading",
        nodeType: "text-block",
        bounds: { xPt: 76, yPt: 80, widthPt: 450, heightPt: 32 },
        text: headingText,
        table: null,
      },
      {
        id: "pdf:pilot:body",
        sourceCommandId: "render:pilot:body",
        fragmentId: "fragment:pilot:body",
        pageIndex: 0,
        pageNumber: 1,
        operation: "draw-text",
        nodeId: "pilot-body",
        nodeType: "text-block",
        bounds: { xPt: 76, yPt: 128, widthPt: 450, heightPt: 24 },
        text: bodyText,
        table: null,
      },
    ],
    blockingIssues: [],
    warningIssues: [],
    summary: {
      inputCommandCount: 3,
      drawCommandCount: 3,
      textCommandCount: 2,
      boxCommandCount: 1,
      blockingIssueCount: 0,
      warningIssueCount: 0,
    },
  },
  pageBoxes: [{
    pageIndex: 0,
    pageNumber: 1,
    widthPt: 612,
    heightPt: 792,
    backgroundColor: "FFFFFF",
  }],
  fontAssets: [{
    fontId: font.fontId,
    family: font.family,
    style: font.style,
    weight: font.weight,
    format: font.format,
    sha256: font.sha256,
    sourceKind: "package-font-asset",
    licenseId: "OFL-1.1",
    embedding: "subset",
    toUnicodeMap: true,
  }],
  imageAssets: [],
  paintCommands: [
    {
      id: "paint:pilot:panel-fill",
      sourceCommandId: "pdf:pilot:panel",
      pageIndex: 0,
      paintOrder: 0,
      bounds: { xPt: 60, yPt: 60, widthPt: 492, heightPt: 124 },
      kind: "fill-rect",
      color: "EFF4F8",
      opacity: 1,
    },
    {
      id: "paint:pilot:panel-stroke",
      sourceCommandId: "pdf:pilot:panel",
      pageIndex: 0,
      paintOrder: 1,
      bounds: { xPt: 60, yPt: 60, widthPt: 492, heightPt: 124 },
      kind: "stroke-rect",
      color: "A7BAC8",
      opacity: 1,
      widthPt: 0.75,
      style: "solid",
    },
    {
      id: "paint:pilot:heading",
      sourceCommandId: "pdf:pilot:heading",
      pageIndex: 0,
      paintOrder: 2,
      bounds: { xPt: 76, yPt: 80, widthPt: 450, heightPt: 32 },
      kind: "glyph-run",
      measurementRequestId: heading.measurementRequestId,
      measurementProfileId,
      text: headingText,
      fontId: font.fontId,
      fontSizePt: 20,
      lineHeightPt: 28,
      baselineOffsetPt: 23,
      color: "17324D",
      opacity: 1,
      glyphs: heading.glyphs,
    },
    {
      id: "paint:pilot:body",
      sourceCommandId: "pdf:pilot:body",
      pageIndex: 0,
      paintOrder: 3,
      bounds: { xPt: 76, yPt: 128, widthPt: 450, heightPt: 24 },
      kind: "glyph-run",
      measurementRequestId: body.measurementRequestId,
      measurementProfileId,
      text: bodyText,
      fontId: font.fontId,
      fontSizePt: 12,
      lineHeightPt: 18,
      baselineOffsetPt: 15,
      color: "3E5060",
      opacity: 1,
      glyphs: body.glyphs,
    },
  ],
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(request, null, 2)}\n`, "utf8")
process.stdout.write(`${outputPath}\n`)
