import { createHash } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"
import { materializeCanonicalReportContentParity } from "./canonical-report-content-parity.mjs"
import { materializeCanonicalReportSourceData } from "./canonical-report-source-data.mjs"
import { materializeCanonicalReportTypographyCalibration } from "./canonical-report-typography-calibration.mjs"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(scriptDir, "..")
const repoRoot = resolve(packageRoot, "../..")
const compositionPath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-composition.v1.json")
const corpusPath = resolve(repoRoot, "fixtures/pdf-report-font-bakeoff-corpus.v1.json")
const fontManifestPath = resolve(repoRoot, "assets/fonts/font-assets.v1.json")
const fallbackReportRoot = resolve(
  repoRoot,
  "../ocr-benchmark-skeleton/reports/INV_9437125258",
)
const shaperPath = resolve(
  repoRoot,
  "packages/text-engine-rust-wasm/rust-shaper/target/debug",
  process.platform === "win32" ? "flowdoc-rustybuzz-smoke.exe" : "flowdoc-rustybuzz-smoke",
)

const IMAGE_DEFINITIONS = [
  ["source-evidence-image", "source_evidence.png", 1548, 1376, "ภาพหลักฐานจากเอกสารต้นฉบับที่ใช้ในการทดสอบ OCR"],
  ["ocr-accuracy-image", "ocr_accuracy.png", 1950, 900, "เปรียบเทียบความถูกต้องของ OCR ระหว่าง Google และ Azure"],
  ["native-extraction-image", "native_extraction.png", 1950, 900, "เปรียบเทียบผลการสกัดข้อมูลแบบมีโครงสร้าง"],
  ["mapping-gap-image", "mapping_gap.png", 1950, 900, "เปรียบเทียบช่องว่างของการจับคู่ข้อมูลเข้า GDIM"],
  ["latency-rounds-image", "latency_rounds.png", 1950, 900, "เปรียบเทียบเวลาในการประมวลผลแต่ละรอบ"],
]

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex")
}

function round(value) {
  return Number(value.toFixed(6))
}

function requireFile(path, label) {
  if (!existsSync(path)) throw new Error(`${label} does not exist: ${path}`)
  return path
}

function readOption(name) {
  const index = process.argv.indexOf(name)
  if (index === -1) return null
  const value = process.argv[index + 1]
  if (value == null || value.startsWith("--")) throw new Error(`${name} requires a path.`)
  return value
}

const contentParityManifestOption = readOption("--content-parity-manifest")
const outputPath = resolve(
  repoRoot,
  readOption("--output") ?? "fixtures/pdf-pilot-canonical-report-twelve-page-request.v1.json",
)
const sourceDataManifestOption = readOption("--source-data-manifest")
const typographyManifestOption = readOption("--typography-manifest")

function pngDimensions(bytes) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (bytes.byteLength < 24 || !bytes.subarray(0, 8).equals(signature)) {
    throw new Error("Expected a PNG signature.")
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

function byteOffsetMap(text) {
  const offsets = new Map()
  let utf8Offset = 0
  let utf16Offset = 0
  while (utf16Offset < text.length) {
    offsets.set(utf8Offset, utf16Offset)
    const scalar = String.fromCodePoint(text.codePointAt(utf16Offset))
    utf8Offset += Buffer.byteLength(scalar, "utf8")
    utf16Offset += scalar.length
  }
  offsets.set(utf8Offset, text.length)
  return offsets
}

function shape(text, fontSizePt, measurementRequestId, font) {
  const result = spawnSync(requireFile(shaperPath, "Rustybuzz shaper"), [
    requireFile(font.path, font.fontId),
    text,
    font.fontId,
  ], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  })
  if (result.status !== 0) {
    throw new Error(`Rustybuzz shaping failed for ${JSON.stringify(text)}:\n${result.stderr || result.stdout}`)
  }
  const raw = JSON.parse(result.stdout)
  if (raw.shaperRevision !== "rustybuzz-0.20.1" || raw.unitsPerEm !== 1000) {
    throw new Error(`Unexpected shaping identity: ${raw.shaperRevision}/${raw.unitsPerEm}`)
  }
  const offsets = byteOffsetMap(text)
  const clusterStarts = [...new Set(raw.glyphs.map((glyph) => glyph.cluster))].sort((a, b) => a - b)
  const textByteLength = Buffer.byteLength(text, "utf8")
  const glyphs = raw.glyphs.map((glyph) => {
    const clusterIndex = clusterStarts.indexOf(glyph.cluster)
    const endByteOffset = clusterStarts[clusterIndex + 1] ?? textByteLength
    const clusterStartOffset = offsets.get(glyph.cluster)
    const clusterEndOffset = offsets.get(endByteOffset)
    if (clusterStartOffset == null || clusterEndOffset == null) {
      throw new Error(`Rustybuzz cluster does not align to Unicode for ${JSON.stringify(text)}.`)
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
  })
  return {
    measurementRequestId,
    glyphs,
    advancePt: round(glyphs.reduce((total, glyph) => total + glyph.advancePt, 0)),
  }
}

const reportRoot = resolve(
  readOption("--report-root")
    ?? process.env.FLOWDOC_PDF_PILOT_REPORT_ROOT
    ?? fallbackReportRoot,
)
const baseComposition = JSON.parse(readFileSync(compositionPath, "utf8"))
const contentParityManifest = contentParityManifestOption == null
  ? null
  : JSON.parse(readFileSync(resolve(repoRoot, contentParityManifestOption), "utf8"))
const parityMaterialization = contentParityManifest == null
  ? { composition: baseComposition, evidence: null }
  : materializeCanonicalReportContentParity(baseComposition, contentParityManifest)
const typographyManifest = typographyManifestOption == null
  ? null
  : JSON.parse(readFileSync(resolve(repoRoot, typographyManifestOption), "utf8"))
if (typographyManifest != null && contentParityManifest == null) {
  throw new Error("Typography calibration requires the content parity manifest.")
}
const typographyMaterialization = typographyManifest == null
  ? null
  : materializeCanonicalReportTypographyCalibration(
    parityMaterialization.composition,
    typographyManifest,
    contentParityManifest,
  )
const typographyComposition = typographyMaterialization?.composition ?? parityMaterialization.composition
const sourceDataManifest = sourceDataManifestOption == null
  ? null
  : JSON.parse(readFileSync(resolve(repoRoot, sourceDataManifestOption), "utf8"))
if (sourceDataManifest != null && typographyManifest == null) {
  throw new Error("Source-data binding requires the typography calibration manifest.")
}
const sourceDataMaterialization = sourceDataManifest == null
  ? null
  : materializeCanonicalReportSourceData(
    typographyComposition,
    sourceDataManifest,
    Object.fromEntries(sourceDataManifest.sourceFiles.map((source) => [
      source.sourceId,
      readFileSync(requireFile(resolve(reportRoot, source.fileName), `Source data ${source.sourceId}`)),
    ])),
  )
const composition = sourceDataMaterialization?.composition ?? typographyComposition
const corpus = JSON.parse(readFileSync(corpusPath, "utf8"))
const artifactsById = new Map(corpus.referenceArtifacts.map((artifact) => [artifact.artifactId, artifact]))
const referenceArtifact = artifactsById.get("reference-final-pdf")
if (referenceArtifact == null || JSON.stringify(referenceArtifact) !== JSON.stringify(composition.referenceArtifact)) {
  throw new Error("Canonical reference PDF identity must match the pinned corpus.")
}
if (composition.pages.length !== referenceArtifact.pageCount) {
  throw new Error("Canonical composition page count must match the pinned reference PDF.")
}
const referenceBytes = readFileSync(resolve(reportRoot, basename(referenceArtifact.pointer)))
if (referenceBytes.byteLength !== referenceArtifact.bytes || sha256(referenceBytes) !== referenceArtifact.sha256) {
  throw new Error("External reference PDF does not match the pinned canonical identity.")
}
if (contentParityManifest != null) {
  const source = contentParityManifest.referenceSource
  const sourceBytes = readFileSync(requireFile(resolve(reportRoot, source.fileName), "Content parity source"))
  if (sourceBytes.byteLength !== source.bytes || sha256(sourceBytes) !== source.sha256) {
    throw new Error("External content parity source does not match the pinned identity.")
  }
}

const fontManifest = JSON.parse(readFileSync(fontManifestPath, "utf8"))
const registeredFonts = [...fontManifest.fontAssets, ...(fontManifest.candidateFontAssets ?? [])]
const requiredFontIds = composition.fontIds ?? ["ibm-plex-sans-thai-regular"]
const fonts = requiredFontIds.map((fontId) => {
  const asset = registeredFonts.find((candidate) => candidate.fontId === fontId)
  if (asset == null) throw new Error(`Font ${fontId} is not registered.`)
  const path = resolve(repoRoot, asset.target.path)
  if (sha256(readFileSync(path)) !== asset.sha256) {
    throw new Error(`Registered font hash mismatch for ${fontId}.`)
  }
  return { ...asset, path }
})
const fontById = new Map(fonts.map((font) => [font.fontId, font]))
const defaultFont = fontById.get("ibm-plex-sans-thai-regular")
if (defaultFont == null) throw new Error("IBM Plex Sans Thai Regular is required.")

const imageAssets = IMAGE_DEFINITIONS.map(([assetId, fileName, pixelWidth, pixelHeight, altText]) => {
  const artifact = artifactsById.get(assetId)
  if (artifact == null || artifact.mediaType !== "image/png" || basename(artifact.pointer) !== fileName) {
    throw new Error(`Missing pinned image artifact ${assetId}.`)
  }
  const bytes = readFileSync(resolve(reportRoot, "assets", fileName))
  const dimensions = pngDimensions(bytes)
  if (bytes.byteLength !== artifact.bytes || sha256(bytes) !== artifact.sha256) {
    throw new Error(`External image bytes do not match ${assetId}.`)
  }
  if (dimensions.width !== pixelWidth || dimensions.height !== pixelHeight) {
    throw new Error(`External image dimensions do not match ${assetId}.`)
  }
  return {
    assetId,
    mediaType: "image/png",
    sha256: artifact.sha256,
    pixelWidth,
    pixelHeight,
    bytesOwner: "backend",
    accessibility: { decorative: false, altText },
  }
})

const drawCommands = []
const paintCommands = []
const pageBoxes = []
let textCommandCount = 0
let boxCommandCount = 0

function pageBuilder(page) {
  const pageIndex = page.pageNumber - 1
  let paintOrder = 0

  function addSource(id, operation, bounds, text = null) {
    drawCommands.push({
      id,
      sourceCommandId: id.replace(/^pdf:/u, "render:"),
      fragmentId: id.replace(/^pdf:/u, "fragment:"),
      pageIndex,
      pageNumber: page.pageNumber,
      operation,
      nodeId: id.replace(/^pdf:/u, "node:"),
      nodeType: operation === "draw-text" ? "text-block" : "zone",
      bounds,
      text,
      table: null,
    })
    if (operation === "draw-text") textCommandCount += 1
    else boxCommandCount += 1
  }

  function addTextLine(elementId, text, style, region, align = "left") {
    const measurementRequestId = `pdf-pilot:canonical:p${page.pageNumber}:${elementId}`
    const runFont = fontById.get(style.fontId ?? defaultFont.fontId)
    if (runFont == null) throw new Error(`Unknown composition font ${style.fontId}.`)
    const shaped = shape(text, style.fontSizePt, measurementRequestId, runFont)
    if (shaped.advancePt > region.widthPt + 0.001) {
      throw new Error(
        `Text overflow on page ${page.pageNumber}/${elementId}: ${shaped.advancePt} > ${region.widthPt} for ${JSON.stringify(text)}`,
      )
    }
    const xPt = align === "center"
      ? region.xPt + (region.widthPt - shaped.advancePt) / 2
      : align === "right"
        ? region.xPt + region.widthPt - shaped.advancePt
        : region.xPt
    const bounds = {
      xPt: round(xPt),
      yPt: round(region.yPt),
      widthPt: align === "left" ? region.widthPt : round(Math.max(0.01, shaped.advancePt) + 0.01),
      heightPt: style.lineHeightPt,
    }
    const sourceId = `pdf:canonical:p${page.pageNumber}:${elementId}`
    addSource(sourceId, "draw-text", bounds, text)
    paintCommands.push({
      id: `paint:canonical:p${page.pageNumber}:${elementId}`,
      sourceCommandId: sourceId,
      pageIndex,
      paintOrder: paintOrder++,
      bounds,
      kind: "glyph-run",
      measurementRequestId,
      measurementProfileId: composition.measurementProfileId,
      text,
      fontId: runFont.fontId,
      fontSizePt: style.fontSizePt,
      lineHeightPt: style.lineHeightPt,
      baselineOffsetPt: round(style.lineHeightPt - (style.lineHeightPt - style.fontSizePt) / 2),
      color: style.color,
      opacity: 1,
      glyphs: shaped.glyphs,
    })
  }

  function addText(element) {
    const style = { ...composition.styles[element.style], ...(element.styleOverrides ?? {}) }
    let yPt = element.yPt
    element.lines.forEach((line, lineIndex) => {
      const lineStyle = { ...style, ...(element.lineStyleOverrides?.[lineIndex] ?? {}) }
      addTextLine(
        `${element.id}:line${lineIndex + 1}`,
        line,
        lineStyle,
        { xPt: element.xPt, yPt, widthPt: element.widthPt },
        element.align ?? "left",
      )
      yPt += lineStyle.lineHeightPt
    })
  }

  function addBox(id, bounds, fill, stroke = null, strokeWidthPt = 0.5) {
    const sourceId = `pdf:canonical:p${page.pageNumber}:${id}`
    addSource(sourceId, "draw-fragment-box", bounds)
    if (fill != null) {
      paintCommands.push({
        id: `paint:canonical:p${page.pageNumber}:${id}:fill`,
        sourceCommandId: sourceId,
        pageIndex,
        paintOrder: paintOrder++,
        bounds,
        kind: "fill-rect",
        color: fill,
        opacity: 1,
      })
    }
    if (stroke != null) {
      paintCommands.push({
        id: `paint:canonical:p${page.pageNumber}:${id}:stroke`,
        sourceCommandId: sourceId,
        pageIndex,
        paintOrder: paintOrder++,
        bounds,
        kind: "stroke-rect",
        color: stroke,
        opacity: 1,
        widthPt: strokeWidthPt,
        style: "solid",
      })
    }
  }

  function addImage(element) {
    const bounds = {
      xPt: element.xPt,
      yPt: element.yPt,
      widthPt: element.widthPt,
      heightPt: element.heightPt,
    }
    const sourceId = `pdf:canonical:p${page.pageNumber}:${element.id}`
    addSource(sourceId, "draw-fragment-box", bounds)
    paintCommands.push({
      id: `paint:canonical:p${page.pageNumber}:${element.id}`,
      sourceCommandId: sourceId,
      pageIndex,
      paintOrder: paintOrder++,
      bounds,
      kind: "image",
      assetId: element.assetId,
      fit: element.fit,
      crop: null,
      opacity: 1,
    })
  }

  function addTable(element) {
    const rowHeights = element.rows.map((_, rowIndex) => (
      element.rowHeightsPt?.[rowIndex] ?? element.rowHeightPt
    ))
    const rowTops = []
    let nextRowTop = element.yPt + element.headerHeightPt
    rowHeights.forEach((heightPt) => {
      rowTops.push(nextRowTop)
      nextRowTop += heightPt
    })
    const totalHeight = element.headerHeightPt + rowHeights.reduce((total, heightPt) => total + heightPt, 0)
    const tableBounds = {
      xPt: element.xPt,
      yPt: element.yPt,
      widthPt: element.widthPt,
      heightPt: totalHeight,
    }
    addBox(`${element.id}:table`, tableBounds, "FFFFFF", "D9E1E8", 0.6)
    addBox(`${element.id}:header`, {
      xPt: element.xPt,
      yPt: element.yPt,
      widthPt: element.widthPt,
      heightPt: element.headerHeightPt,
    }, "F3F6FA")
    element.rows.forEach((_, rowIndex) => {
      if (rowIndex % 2 === 1) {
        addBox(`${element.id}:row${rowIndex + 1}:shade`, {
          xPt: element.xPt,
          yPt: rowTops[rowIndex],
          widthPt: element.widthPt,
          heightPt: rowHeights[rowIndex],
        }, "FAFBFC")
      }
    })
    const horizontalYs = [
      element.yPt + element.headerHeightPt,
      ...rowTops.slice(1),
    ]
    horizontalYs.forEach((yPt, lineIndex) => addBox(`${element.id}:hline${lineIndex + 1}`, {
      xPt: element.xPt,
      yPt,
      widthPt: element.widthPt,
      heightPt: 0.5,
    }, "D9E1E8"))
    let columnX = element.xPt
    element.columnsPt.slice(0, -1).forEach((columnWidth, columnIndex) => {
      columnX += columnWidth
      addBox(`${element.id}:vline${columnIndex + 1}`, {
        xPt: round(columnX),
        yPt: element.yPt,
        widthPt: 0.5,
        heightPt: totalHeight,
      }, "D9E1E8")
    })
    const headerStyle = {
      fontId: element.headerFontId ?? element.fontId ?? defaultFont.fontId,
      fontSizePt: element.headerFontSizePt ?? element.fontSizePt,
      lineHeightPt: element.headerLineHeightPt ?? element.lineHeightPt,
      color: "17324D",
    }
    const cellStyle = {
      fontId: element.fontId ?? defaultFont.fontId,
      fontSizePt: element.fontSizePt,
      lineHeightPt: element.lineHeightPt,
      color: "17202A",
    }
    function addCells(cells, rowId, rowTop, rowHeight, style) {
      let xPt = element.xPt
      cells.forEach((cell, columnIndex) => {
        const widthPt = element.columnsPt[columnIndex]
        const lines = Array.isArray(cell) ? cell.map(String) : [String(cell)]
        const textTop = rowTop + (rowHeight - lines.length * style.lineHeightPt) / 2
        lines.forEach((line, lineIndex) => addTextLine(
          lines.length === 1
            ? `${element.id}:${rowId}:cell${columnIndex + 1}`
            : `${element.id}:${rowId}:cell${columnIndex + 1}:line${lineIndex + 1}`,
          line,
          style,
          {
            xPt: xPt + 4,
            yPt: textTop + lineIndex * style.lineHeightPt,
            widthPt: widthPt - 8,
          },
          columnIndex === 0 ? "left" : "center",
        ))
        xPt += widthPt
      })
    }
    addCells(element.headers, "header", element.yPt, element.headerHeightPt, headerStyle)
    element.rows.forEach((row, rowIndex) => addCells(
      row,
      `row${rowIndex + 1}`,
      rowTops[rowIndex],
      rowHeights[rowIndex],
      cellStyle,
    ))
  }

  addTextLine("header", composition.headerText ?? "OCR BENCHMARK | INV_9437125258", composition.styles.header, {
    xPt: 60,
    yPt: 25,
    widthPt: 260,
  })
  addTextLine("footer", `รายงานผลการทดสอบ | หน้า ${page.pageNumber}`, composition.styles.footer, {
    xPt: 300,
    yPt: 757,
    widthPt: 252,
  }, "right")
  page.elements.forEach((element) => {
    if (element.kind === "text") addText(element)
    else if (element.kind === "panel") addBox(element.id, {
      xPt: element.xPt,
      yPt: element.yPt,
      widthPt: element.widthPt,
      heightPt: element.heightPt,
    }, element.fill, element.stroke)
    else if (element.kind === "image") addImage(element)
    else if (element.kind === "table") addTable(element)
    else throw new Error(`Unsupported canonical element kind: ${element.kind}`)
  })
}

composition.pages.forEach((page, pageIndex) => {
  if (page.pageNumber !== pageIndex + 1) throw new Error("Canonical pages must be contiguous and ordered.")
  if (!page.elements.some((element) => element.kind === "text" && element.lines.includes(page.marker))) {
    throw new Error(`Page ${page.pageNumber} does not contain its canonical marker.`)
  }
  pageBoxes.push({
    pageIndex,
    pageNumber: page.pageNumber,
    ...composition.pageBox,
  })
  pageBuilder(page)
})

const request = {
  contractVersion: 1,
  kind: "pdf-measured-draw-contract-request",
  pilotId: composition.pilotId,
  rendererProfileId: composition.rendererProfileId,
  measurementProfileId: composition.measurementProfileId,
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
    pageCount: composition.pages.length,
    drawCommands,
    blockingIssues: [],
    warningIssues: [],
    summary: {
      inputCommandCount: drawCommands.length,
      drawCommandCount: drawCommands.length,
      textCommandCount,
      boxCommandCount,
      blockingIssueCount: 0,
      warningIssueCount: 0,
    },
  },
  pageBoxes,
  fontAssets: fonts.map((font) => ({
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
  })),
  imageAssets,
  paintCommands,
}

writeFileSync(outputPath, `${JSON.stringify(request, null, 2)}\n`, "utf8")
process.stdout.write(`${outputPath}\n`)
