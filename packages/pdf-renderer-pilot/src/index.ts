import { createHash } from "node:crypto"
import type {
  VNextPdfFontAssetV1,
  VNextPdfGlyphRunPaintCommandV1,
  VNextPdfImageAssetV1,
  VNextPdfImagePaintCommandV1,
  VNextPdfMeasuredDrawPageV1,
  VNextPdfMeasuredDrawContractResultV1,
  VNextPdfPaintCommandV1,
} from "@flowdoc/vnext-core"

export * from "./canonicalReportDataAdapter.js"
export * from "./canonicalReportTemplateResolution.js"
export * from "./canonicalReportDisplayFormatting.js"
export * from "./canonicalReportMeasurementRequestHandoff.js"
export * from "./canonicalReportTableProjection.js"
export * from "./canonicalReportNativeShaping.js"
export * from "./canonicalReportLineBreaking.js"
export * from "./canonicalReportMeasuredComposition.js"
export * from "./canonicalReportVerticalCapacity.js"
export * from "./canonicalReportSectionReconciliation.js"
export * from "./canonicalReportPaginationInputs.js"

export const FLOWDOC_PDF_RENDERER_PILOT_SOURCE = "flowdoc-pdf-renderer-pilot" as const
export const FLOWDOC_PDF_RENDERER_PILOT_MODE = "thai-type0-one-page-proof" as const
export const FLOWDOC_PDF_IMAGE_RENDERER_PILOT_MODE = "digest-bound-image-one-page-proof" as const
export const FLOWDOC_PDF_SHARED_RESOURCES_PILOT_MODE = "shared-resources-multi-page-proof" as const
export const FLOWDOC_PDF_ALL_IMAGES_PILOT_MODE = "all-five-image-resource-matrix" as const
export const FLOWDOC_PDF_CANONICAL_REPORT_PILOT_MODE = "canonical-twelve-page-report-proof" as const

const CANONICAL_REPORT_PAGE_MARKERS = [
  "รายงานเปรียบเทียบ OCR",
  "สรุปสำหรับผู้ตัดสินใจ",
  "วิธีทดสอบที่ใช้",
  "ช่วงที่ 1 อ่านข้อความได้ถูกต้องแค่ไหน",
  "หลักฐานจากข้อความจริง",
  "ช่วงที่ 2 เข้าใจและจัดข้อมูลได้แค่ไหน",
  "เวลา ราคา และขนาดผลลัพธ์",
  "ช่วงที่ 3 นำข้อมูลมาใส่รูปแบบของเราได้แค่ไหน",
  "มุมมองเพื่อการตัดสินใจ",
  "ข้อจำกัดของรายงาน",
  "ภาคผนวก A Run ID และหลักฐาน",
  "ภาคผนวก B คำศัพท์ที่ใช้ในรายงาน",
] as const

const CANONICAL_REPORT_IMAGE_BINDINGS = [
  { pageNumber: 1, assetId: "source-evidence-image" },
  { pageNumber: 4, assetId: "ocr-accuracy-image" },
  { pageNumber: 5, assetId: "source-evidence-image" },
  { pageNumber: 6, assetId: "native-extraction-image" },
  { pageNumber: 7, assetId: "latency-rounds-image" },
  { pageNumber: 8, assetId: "mapping-gap-image" },
] as const

export type FlowDocPdfRendererPilotIssueCode =
  | "missing-proof-id"
  | "production-binding"
  | "contract-blocked"
  | "page-count"
  | "unsupported-image"
  | "image-matrix-count"
  | "image-matrix-duplicate-digest"
  | "image-matrix-page-coverage"
  | "image-matrix-asset-coverage"
  | "report-composition-profile"
  | "report-composition-page-count"
  | "report-composition-image-count"
  | "report-composition-image-binding"
  | "report-composition-page-marker"
  | "duplicate-image-resource"
  | "missing-image-resource"
  | "image-hash-mismatch"
  | "image-dimension-mismatch"
  | "unsupported-image-media-type"
  | "invalid-png"
  | "unsupported-opacity"
  | "unsupported-vertical-glyph-offset"
  | "duplicate-font-resource"
  | "missing-font-resource"
  | "invalid-font-resource"
  | "source-font-hash-mismatch"
  | "subset-font-hash-mismatch"
  | "subset-not-smaller"
  | "invalid-sfnt"
  | "subset-glyph-missing"
  | "unmappable-text-cluster"
  | "glyph-run-overflow"

export interface FlowDocPdfRendererPilotIssue {
  severity: "blocking"
  code: FlowDocPdfRendererPilotIssueCode
  path: string
  message: string
}

export interface FlowDocPdfRendererPilotFontResource {
  fontId: string
  subsetId: string
  subsetPrefix: string
  postScriptName: string
  subsetSha256: string
  sourceBytes: Uint8Array
  subsetBytes: Uint8Array
}

export interface FlowDocPdfRendererPilotImageResource {
  assetId: string
  bytes: Uint8Array
}

export interface FlowDocPdfRendererPilotInput {
  proofId: string
  contract: VNextPdfMeasuredDrawContractResultV1
  fontResources: FlowDocPdfRendererPilotFontResource[]
  imageResources?: FlowDocPdfRendererPilotImageResource[]
  bindProductionRenderer?: boolean
}

export interface FlowDocPdfRendererPilotArtifactManifest {
  artifactId: string
  format: "pdf"
  mediaType: "application/pdf"
  byteLength: number
  sha256: string
  storageStatus: "not-stored"
  localOnly: true
  sourceContractFingerprint: string
  rendererProfileId: string
  measurementProfileId: string
  embeddedFonts: Array<{
    fontId: string
    subsetId: string
    subsetSha256: string
    subsetByteLength: number
    sourceByteLength: number
    pdfBaseFontName: string
    fontFormat: "Type0/CIDFontType2"
    toUnicode: true
  }>
  embeddedImages: Array<{
    assetId: string
    sha256: string
    byteLength: number
    pixelWidth: number
    pixelHeight: number
    colorSpace: "DeviceGray" | "DeviceRGB"
    bitsPerComponent: 8
    sourceFormat: "png"
    accessibility: {
      decorative: boolean
      altText: string | null
    }
  }>
  resourceReuse?: {
    pageCount: number
    uniqueFontObjectCount: number
    uniqueImageObjectCount: number
    fontResourceReferenceCount: number
    imageResourceReferenceCount: number
  }
  imageMatrix?: {
    requiredAssetCount: number
    uniqueImageDigestCount: number
    assetIds: string[]
    pageBindings: Array<{
      pageNumber: number
      assetId: string
    }>
  }
  reportComposition?: {
    requiredPageCount: number
    requiredImageAssetCount: number
    imagePaintCount: number
    pageMarkers: string[]
    pageBindings: Array<{
      pageNumber: number
      assetId: string
    }>
  }
}

export type FlowDocPdfRendererPilotResult = {
  source: typeof FLOWDOC_PDF_RENDERER_PILOT_SOURCE
  mode:
    | typeof FLOWDOC_PDF_RENDERER_PILOT_MODE
    | typeof FLOWDOC_PDF_IMAGE_RENDERER_PILOT_MODE
    | typeof FLOWDOC_PDF_SHARED_RESOURCES_PILOT_MODE
    | typeof FLOWDOC_PDF_ALL_IMAGES_PILOT_MODE
    | typeof FLOWDOC_PDF_CANONICAL_REPORT_PILOT_MODE
  proofId: string
  renderContract: {
    consumes: "vnext-pdf-measured-draw-contract-v1"
    output: "one-page-pdf-bytes" | "multi-page-pdf-bytes"
    usesProvidedGlyphFacts: true
    embeddedFontSubset: true
    toUnicode: true
    imagesSupported: boolean
    sharedResourceObjects?: true
    requiredImageAssetCount?: number
    canonicalPageComposition?: true
    requiredPageCount?: number
    measuredVerticalGlyphOffsets?: true
    clusterActualTextFallback?: true
    productionFidelity: false
    storageWrites: false
  }
  summary: {
    pageCount: number
    paintCommandCount: number
    glyphRunCount: number
    glyphCount: number
    embeddedFontCount: number
    imageCount: number
    fontResourceReferenceCount?: number
    imageResourceReferenceCount?: number
    byteLength: number
  }
  issues: FlowDocPdfRendererPilotIssue[]
} & (
  | {
      status: "rendered"
      artifact: FlowDocPdfRendererPilotArtifactManifest
      bytes: Uint8Array
    }
  | {
      status: "blocked"
      artifact: null
      bytes: null
    }
)

interface SfntMetrics {
  unitsPerEm: number
  numGlyphs: number
  fontBBox: [number, number, number, number]
  ascent: number
  descent: number
  capHeight: number
  italicAngle: number
}

interface ResolvedGlyph {
  cid: number
  glyphId: number
  width: number
  unicode: string
  offsetX: number
}

interface FontUsage {
  asset: VNextPdfFontAssetV1
  resource: FlowDocPdfRendererPilotFontResource
  metrics: SfntMetrics
  pdfResourceName: string
  pdfBaseFontName: string
  glyphs: ResolvedGlyph[]
}

interface ParsedPng {
  width: number
  height: number
  colorSpace: "DeviceGray" | "DeviceRGB"
  colors: 1 | 3
  bitsPerComponent: 8
  idat: Uint8Array
}

interface ImageUsage {
  asset: VNextPdfImageAssetV1
  resource: FlowDocPdfRendererPilotImageResource
  image: ParsedPng
  pdfResourceName: string
}

function issue(
  code: FlowDocPdfRendererPilotIssueCode,
  path: string,
  message: string,
): FlowDocPdfRendererPilotIssue {
  return { severity: "blocking", code, path, message }
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex")
}

function formatNumber(value: number): string {
  return Number(value.toFixed(6)).toString()
}

function scaleMetric(value: number, unitsPerEm: number): number {
  return Math.round(value / unitsPerEm * 1000)
}

function parseSfnt(bytes: Uint8Array): SfntMetrics {
  const buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (buffer.length < 12 || buffer.readUInt32BE(0) !== 0x00010000) {
    throw new Error("font must be a TrueType sfnt")
  }
  const numTables = buffer.readUInt16BE(4)
  if (12 + numTables * 16 > buffer.length) throw new Error("sfnt table directory is truncated")

  const tables = new Map<string, { offset: number; length: number }>()
  for (let index = 0; index < numTables; index += 1) {
    const recordOffset = 12 + index * 16
    const tag = buffer.toString("ascii", recordOffset, recordOffset + 4)
    const offset = buffer.readUInt32BE(recordOffset + 8)
    const length = buffer.readUInt32BE(recordOffset + 12)
    if (offset + length > buffer.length) throw new Error(`sfnt table is truncated: ${tag}`)
    tables.set(tag, { offset, length })
  }

  const requireTable = (tag: string, minimumLength: number) => {
    const table = tables.get(tag)
    if (table == null || table.length < minimumLength) throw new Error(`sfnt table is missing: ${tag}`)
    return table.offset
  }
  const head = requireTable("head", 54)
  const hhea = requireTable("hhea", 36)
  const maxp = requireTable("maxp", 6)
  const post = requireTable("post", 8)
  const os2Table = tables.get("OS/2")
  const unitsPerEm = buffer.readUInt16BE(head + 18)
  if (unitsPerEm <= 0) throw new Error("sfnt unitsPerEm must be positive")
  const ascent = buffer.readInt16BE(hhea + 4)
  const descent = buffer.readInt16BE(hhea + 6)
  const os2Version = os2Table == null ? 0 : buffer.readUInt16BE(os2Table.offset)
  const capHeight = os2Table != null && os2Version >= 2 && os2Table.length >= 90
    ? buffer.readInt16BE(os2Table.offset + 88)
    : ascent

  return {
    unitsPerEm,
    numGlyphs: buffer.readUInt16BE(maxp + 4),
    fontBBox: [
      scaleMetric(buffer.readInt16BE(head + 36), unitsPerEm),
      scaleMetric(buffer.readInt16BE(head + 38), unitsPerEm),
      scaleMetric(buffer.readInt16BE(head + 40), unitsPerEm),
      scaleMetric(buffer.readInt16BE(head + 42), unitsPerEm),
    ],
    ascent: scaleMetric(ascent, unitsPerEm),
    descent: scaleMetric(descent, unitsPerEm),
    capHeight: scaleMetric(capHeight, unitsPerEm),
    italicAngle: buffer.readInt32BE(post + 4) / 65536,
  }
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function parsePng(bytes: Uint8Array): ParsedPng {
  const buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (buffer.length < 33 || !buffer.subarray(0, 8).equals(signature)) {
    throw new Error("image bytes must start with the PNG signature")
  }

  let offset = 8
  let header: {
    width: number
    height: number
    bitDepth: number
    colorType: number
    compression: number
    filter: number
    interlace: number
  } | null = null
  const idat: Buffer[] = []
  let ended = false

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString("ascii", offset + 4, offset + 8)
    const dataStart = offset + 8
    const dataEnd = dataStart + length
    const chunkEnd = dataEnd + 4
    if (chunkEnd > buffer.length) throw new Error(`PNG chunk is truncated: ${type}`)
    const expectedCrc = buffer.readUInt32BE(dataEnd)
    const actualCrc = crc32(buffer.subarray(offset + 4, dataEnd))
    if (actualCrc !== expectedCrc) throw new Error(`PNG chunk CRC mismatch: ${type}`)

    if (type === "IHDR") {
      if (header != null || length !== 13 || offset !== 8) throw new Error("PNG must contain one leading IHDR chunk")
      header = {
        width: buffer.readUInt32BE(dataStart),
        height: buffer.readUInt32BE(dataStart + 4),
        bitDepth: buffer[dataStart + 8],
        colorType: buffer[dataStart + 9],
        compression: buffer[dataStart + 10],
        filter: buffer[dataStart + 11],
        interlace: buffer[dataStart + 12],
      }
    } else if (type === "IDAT") {
      idat.push(buffer.subarray(dataStart, dataEnd))
    } else if (type === "IEND") {
      if (length !== 0) throw new Error("PNG IEND chunk must be empty")
      ended = true
      offset = chunkEnd
      break
    } else if (/^[A-Z]/.test(type) && type !== "PLTE") {
      throw new Error(`unsupported critical PNG chunk: ${type}`)
    }
    offset = chunkEnd
  }

  if (header == null || idat.length === 0 || !ended || offset !== buffer.length) {
    throw new Error("PNG requires IHDR, IDAT, and terminal IEND chunks")
  }
  if (header.width <= 0 || header.height <= 0) throw new Error("PNG dimensions must be positive")
  if (header.bitDepth !== 8 || ![0, 2].includes(header.colorType)) {
    throw new Error("pilot PNG support is limited to 8-bit grayscale or RGB without alpha or palette")
  }
  if (header.compression !== 0 || header.filter !== 0 || header.interlace !== 0) {
    throw new Error("pilot PNG support requires standard compression/filter and no interlace")
  }

  return {
    width: header.width,
    height: header.height,
    colorSpace: header.colorType === 0 ? "DeviceGray" : "DeviceRGB",
    colors: header.colorType === 0 ? 1 : 3,
    bitsPerComponent: 8,
    idat: Buffer.concat(idat),
  }
}

function unicodeAssignments(
  command: VNextPdfGlyphRunPaintCommandV1,
  allowClusterContinuation: boolean,
): string[] | null {
  const assignments = new Array<string>(command.glyphs.length)
  const groups = new Map<string, number[]>()

  command.glyphs.forEach((glyph, index) => {
    const key = `${glyph.clusterStartOffset}:${glyph.clusterEndOffset}`
    const indexes = groups.get(key) ?? []
    indexes.push(index)
    groups.set(key, indexes)
  })

  for (const indexes of groups.values()) {
    const first = command.glyphs[indexes[0]]
    const scalars = Array.from(command.text.slice(first.clusterStartOffset, first.clusterEndOffset))
    if (allowClusterContinuation) {
      const clusterText = scalars.join("")
      if (clusterText.length === 0) return null
      indexes.forEach((glyphIndex) => {
        assignments[glyphIndex] = ""
      })
      const primaryIndexes = indexes.filter((glyphIndex) => command.glyphs[glyphIndex].offsetYPt === 0)
      if (primaryIndexes.length === 0) return null
      if (scalars.length < primaryIndexes.length) {
        const mappedIndex = primaryIndexes.find((glyphIndex) => command.glyphs[glyphIndex].advancePt > 0)
          ?? primaryIndexes[0]
        assignments[mappedIndex] = clusterText
      } else {
        primaryIndexes.forEach((glyphIndex, index) => {
          assignments[glyphIndex] = index === primaryIndexes.length - 1
            ? scalars.slice(index).join("")
            : scalars[index]
        })
      }
      continue
    }
    if (scalars.length < indexes.length) return null
    indexes.forEach((glyphIndex, index) => {
      assignments[glyphIndex] = index === indexes.length - 1
        ? scalars.slice(index).join("")
        : scalars[index]
    })
  }

  return assignments.every((value) => value != null) ? assignments : null
}

function utf16BeHex(value: string): string {
  let output = ""
  for (let index = 0; index < value.length; index += 1) {
    output += value.charCodeAt(index).toString(16).padStart(4, "0").toUpperCase()
  }
  return output
}

function actualTextHex(value: string): string {
  return `FEFF${utf16BeHex(value)}`
}

function colorOperands(hex: string): string {
  return [0, 2, 4]
    .map((offset) => formatNumber(Number.parseInt(hex.slice(offset, offset + 2), 16) / 255))
    .join(" ")
}

function rectangleOperands(
  command: Extract<VNextPdfPaintCommandV1, { kind: "fill-rect" | "stroke-rect" }>,
  pageHeight: number,
): string {
  return [
    formatNumber(command.bounds.xPt),
    formatNumber(pageHeight - command.bounds.yPt - command.bounds.heightPt),
    formatNumber(command.bounds.widthPt),
    formatNumber(command.bounds.heightPt),
  ].join(" ")
}

function toUnicodeCMap(usage: FontUsage): Buffer {
  const mappings = usage.glyphs.map((glyph) => (
    `<${glyph.cid.toString(16).padStart(4, "0").toUpperCase()}> <${utf16BeHex(glyph.unicode)}>`
  ))
  const sections: string[] = []
  for (let offset = 0; offset < mappings.length; offset += 100) {
    const chunk = mappings.slice(offset, offset + 100)
    sections.push(`${chunk.length} beginbfchar\n${chunk.join("\n")}\nendbfchar`)
  }
  return Buffer.from([
    "/CIDInit /ProcSet findresource begin",
    "12 dict begin",
    "begincmap",
    "/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def",
    `/CMapName /${usage.pdfBaseFontName}-UCS def`,
    "/CMapType 2 def",
    "1 begincodespacerange",
    "<0000> <FFFF>",
    "endcodespacerange",
    ...sections,
    "endcmap",
    "CMapName currentdict /CMap defineresource pop",
    "end",
    "end",
    "",
  ].join("\n"), "ascii")
}

function cidToGidMap(usage: FontUsage): Buffer {
  const maxCid = usage.glyphs.at(-1)?.cid ?? 0
  const bytes = Buffer.alloc((maxCid + 1) * 2)
  usage.glyphs.forEach((glyph) => bytes.writeUInt16BE(glyph.glyphId, glyph.cid * 2))
  return bytes
}

function widths(usage: FontUsage): string {
  return usage.glyphs.map((glyph) => formatNumber(glyph.width)).join(" ")
}

function streamObject(dictionary: string, bytes: Uint8Array): Buffer {
  return Buffer.concat([
    Buffer.from(`<< ${dictionary} /Length ${bytes.byteLength} >>\nstream\n`, "ascii"),
    Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    Buffer.from("\nendstream", "ascii"),
  ])
}

function plainObject(value: string): Buffer {
  return Buffer.from(value, "ascii")
}

function imagePaintOperators(
  command: VNextPdfImagePaintCommandV1,
  usage: ImageUsage,
  pageHeight: number,
): string[] {
  const crop = command.crop ?? { top: 0, right: 0, bottom: 0, left: 0 }
  const cropWidth = 1 - crop.left - crop.right
  const cropHeight = 1 - crop.top - crop.bottom
  const visibleAspect = (usage.image.width * cropWidth) / (usage.image.height * cropHeight)
  const boundsAspect = command.bounds.widthPt / command.bounds.heightPt
  let visibleWidth: number
  let visibleHeight: number

  if ((command.fit === "contain" && boundsAspect > visibleAspect)
    || (command.fit === "cover" && boundsAspect < visibleAspect)) {
    visibleHeight = command.bounds.heightPt
    visibleWidth = visibleHeight * visibleAspect
  } else {
    visibleWidth = command.bounds.widthPt
    visibleHeight = visibleWidth / visibleAspect
  }

  const visibleX = command.bounds.xPt + (command.bounds.widthPt - visibleWidth) / 2
  const visibleTop = command.bounds.yPt + (command.bounds.heightPt - visibleHeight) / 2
  const visibleBottom = pageHeight - visibleTop - visibleHeight
  const fullWidth = visibleWidth / cropWidth
  const fullHeight = visibleHeight / cropHeight
  const fullX = visibleX - crop.left * fullWidth
  const fullY = visibleBottom - crop.bottom * fullHeight
  const boundsBottom = pageHeight - command.bounds.yPt - command.bounds.heightPt

  return [
    "q",
    `${formatNumber(command.bounds.xPt)} ${formatNumber(boundsBottom)} ${formatNumber(command.bounds.widthPt)} ${formatNumber(command.bounds.heightPt)} re W n`,
    `${formatNumber(visibleX)} ${formatNumber(visibleBottom)} ${formatNumber(visibleWidth)} ${formatNumber(visibleHeight)} re W n`,
    `${formatNumber(fullWidth)} 0 0 ${formatNumber(fullHeight)} ${formatNumber(fullX)} ${formatNumber(fullY)} cm`,
    `/${usage.pdfResourceName} Do`,
    "Q",
  ]
}

function buildPageContent(
  page: VNextPdfMeasuredDrawPageV1,
  usages: FontUsage[],
  resolvedRuns: Map<string, ResolvedGlyph[]>,
  imageUsages: ImageUsage[],
): Buffer {
  const content: string[] = [
    "q",
    `${colorOperands(page.backgroundColor)} rg`,
    `0 0 ${formatNumber(page.widthPt)} ${formatNumber(page.heightPt)} re f`,
    "Q",
  ]

  page.commands.forEach((command) => {
    if (command.kind === "fill-rect") {
      content.push(
        "q",
        `${colorOperands(command.color)} rg`,
        `${rectangleOperands(command, page.heightPt)} re f`,
        "Q",
      )
    } else if (command.kind === "stroke-rect") {
      const dash = command.style === "solid" ? "[] 0 d" : command.style === "dashed" ? "[4 2] 0 d" : "[1 2] 0 d"
      content.push(
        "q",
        `${colorOperands(command.color)} RG`,
        `${formatNumber(command.widthPt)} w`,
        dash,
        `${rectangleOperands(command, page.heightPt)} re S`,
        "Q",
      )
    } else if (command.kind === "glyph-run") {
      const usage = usages.find((candidate) => candidate.asset.fontId === command.fontId)
      const glyphs = resolvedRuns.get(command.id)
      if (usage == null || glyphs == null) throw new Error(`unresolved glyph run: ${command.id}`)
      if (glyphs.some((glyph) => glyph.unicode.length === 0)) {
        const textArray: string[] = []
        let currentOffset = 0
        glyphs.forEach((glyph, glyphIndex) => {
          const measured = command.glyphs[glyphIndex]
          if (measured.offsetYPt !== 0) return
          const adjustment = -(glyph.offsetX - currentOffset)
          if (adjustment !== 0) textArray.push(formatNumber(adjustment))
          textArray.push(`<${glyph.cid.toString(16).padStart(4, "0").toUpperCase()}>`)
          currentOffset = glyph.offsetX
        })
        content.push(
          `/Span << /ActualText <${actualTextHex(command.text)}> >> BDC`,
          "BT",
          `/${usage.pdfResourceName} ${formatNumber(command.fontSizePt)} Tf`,
          `${colorOperands(command.color)} rg`,
          `1 0 0 1 ${formatNumber(command.bounds.xPt)} ${formatNumber(page.heightPt - command.bounds.yPt - command.baselineOffsetPt)} Tm`,
          `[${textArray.join(" ")}] TJ`,
          "ET",
          "EMC",
        )
        const overlayOperators: string[] = []
        let cursorXPt = 0
        glyphs.forEach((glyph, glyphIndex) => {
          const measured = command.glyphs[glyphIndex]
          if (measured.offsetYPt !== 0) {
            overlayOperators.push(
              `1 0 0 1 ${formatNumber(command.bounds.xPt + cursorXPt + measured.offsetXPt)} ${formatNumber(page.heightPt - command.bounds.yPt - command.baselineOffsetPt + measured.offsetYPt)} Tm`,
              `<${glyph.cid.toString(16).padStart(4, "0").toUpperCase()}> Tj`,
            )
          }
          cursorXPt += measured.advancePt
        })
        if (overlayOperators.length > 0) {
          content.push(
            "/Artifact BMC",
            "BT",
            `/${usage.pdfResourceName} ${formatNumber(command.fontSizePt)} Tf`,
            `${colorOperands(command.color)} rg`,
            ...overlayOperators,
            "ET",
            "EMC",
          )
        }
      } else {
        const textArray: string[] = []
        let currentOffset = 0
        glyphs.forEach((glyph) => {
          const adjustment = -(glyph.offsetX - currentOffset)
          if (adjustment !== 0) textArray.push(formatNumber(adjustment))
          textArray.push(`<${glyph.cid.toString(16).padStart(4, "0").toUpperCase()}>`)
          currentOffset = glyph.offsetX
        })
        content.push(
          `/Span << /ActualText <${actualTextHex(command.text)}> >> BDC`,
          "BT",
          `/${usage.pdfResourceName} ${formatNumber(command.fontSizePt)} Tf`,
          `${colorOperands(command.color)} rg`,
          `1 0 0 1 ${formatNumber(command.bounds.xPt)} ${formatNumber(page.heightPt - command.bounds.yPt - command.baselineOffsetPt)} Tm`,
          `[${textArray.join(" ")}] TJ`,
          "ET",
          "EMC",
        )
      }
    } else if (command.kind === "image") {
      const usage = imageUsages.find((candidate) => candidate.asset.assetId === command.assetId)
      if (usage == null) throw new Error(`unresolved image command: ${command.id}`)
      content.push(...imagePaintOperators(command, usage, page.heightPt))
    }
  })
  return Buffer.from(`${content.join("\n")}\n`, "ascii")
}

function buildPdf(
  contract: Extract<VNextPdfMeasuredDrawContractResultV1, { status: "consumable" }>,
  usages: FontUsage[],
  resolvedRuns: Map<string, ResolvedGlyph[]>,
  imageUsages: ImageUsage[],
): Uint8Array {
  const pageContents = contract.pages.map((page) => buildPageContent(page, usages, resolvedRuns, imageUsages))

  const objects = new Map<number, Buffer>()
  const catalogId = 1
  const pagesId = 2
  const pageObjectIds = contract.pages.map((_, pageIndex) => 3 + pageIndex * 2)
  const contentObjectIds = pageObjectIds.map((pageId) => pageId + 1)
  let nextId = 3 + contract.pages.length * 2
  const fontObjectIds = usages.map(() => {
    const ids = {
      type0: nextId,
      cidFont: nextId + 1,
      descriptor: nextId + 2,
      fontFile: nextId + 3,
      toUnicode: nextId + 4,
      cidToGid: nextId + 5,
    }
    nextId += 6
    return ids
  })
  const imageObjectIds = imageUsages.map(() => {
    const id = nextId
    nextId += 1
    return id
  })
  const infoId = nextId

  objects.set(catalogId, plainObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`))
  objects.set(pagesId, plainObject(
    `<< /Type /Pages /Kids [${pageObjectIds.map((pageId) => `${pageId} 0 R`).join(" ")}] /Count ${contract.pages.length} >>`,
  ))
  contract.pages.forEach((page, pageIndex) => {
    const pageId = pageObjectIds[pageIndex]
    const contentId = contentObjectIds[pageIndex]
    const pageFontIds = new Set(page.commands
      .filter((command) => command.kind === "glyph-run")
      .map((command) => command.fontId))
    const pageImageIds = new Set(page.commands
      .filter((command) => command.kind === "image")
      .map((command) => command.assetId))
    const fontResources = usages.map((usage, index) => (
      pageFontIds.has(usage.asset.fontId)
        ? `/${usage.pdfResourceName} ${fontObjectIds[index].type0} 0 R`
        : null
    )).filter((value) => value != null).join(" ")
    const imageResources = imageUsages.map((usage, index) => (
      pageImageIds.has(usage.asset.assetId)
        ? `/${usage.pdfResourceName} ${imageObjectIds[index]} 0 R`
        : null
    )).filter((value) => value != null).join(" ")
    const resources = imageResources.length === 0
      ? `/Resources << /Font << ${fontResources} >> >>`
      : `/Resources << /Font << ${fontResources} >> /XObject << ${imageResources} >> >>`
    objects.set(pageId, plainObject([
      "<< /Type /Page",
      `/Parent ${pagesId} 0 R`,
      `/MediaBox [0 0 ${formatNumber(page.widthPt)} ${formatNumber(page.heightPt)}]`,
      resources,
      `/Contents ${contentId} 0 R >>`,
    ].join(" ")))
    objects.set(contentId, streamObject("", pageContents[pageIndex]))
  })

  usages.forEach((usage, index) => {
    const ids = fontObjectIds[index]
    const metrics = usage.metrics
    objects.set(ids.type0, plainObject([
      "<< /Type /Font /Subtype /Type0",
      `/BaseFont /${usage.pdfBaseFontName}`,
      "/Encoding /Identity-H",
      `/DescendantFonts [${ids.cidFont} 0 R]`,
      `/ToUnicode ${ids.toUnicode} 0 R >>`,
    ].join(" ")))
    objects.set(ids.cidFont, plainObject([
      "<< /Type /Font /Subtype /CIDFontType2",
      `/BaseFont /${usage.pdfBaseFontName}`,
      "/CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >>",
      `/FontDescriptor ${ids.descriptor} 0 R`,
      "/DW 1000",
      `/W [1 [${widths(usage)}]]`,
      `/CIDToGIDMap ${ids.cidToGid} 0 R >>`,
    ].join(" ")))
    objects.set(ids.descriptor, plainObject([
      "<< /Type /FontDescriptor",
      `/FontName /${usage.pdfBaseFontName}`,
      "/Flags 4",
      `/FontBBox [${metrics.fontBBox.join(" ")}]`,
      `/ItalicAngle ${formatNumber(metrics.italicAngle)}`,
      `/Ascent ${metrics.ascent}`,
      `/Descent ${metrics.descent}`,
      `/CapHeight ${metrics.capHeight}`,
      "/StemV 80",
      `/FontFile2 ${ids.fontFile} 0 R >>`,
    ].join(" ")))
    objects.set(ids.fontFile, streamObject(`/Length1 ${usage.resource.subsetBytes.byteLength}`, usage.resource.subsetBytes))
    objects.set(ids.toUnicode, streamObject("", toUnicodeCMap(usage)))
    objects.set(ids.cidToGid, streamObject("", cidToGidMap(usage)))
  })
  imageUsages.forEach((usage, index) => {
    objects.set(imageObjectIds[index], streamObject([
      "/Type /XObject /Subtype /Image",
      `/Width ${usage.image.width}`,
      `/Height ${usage.image.height}`,
      `/ColorSpace /${usage.image.colorSpace}`,
      `/BitsPerComponent ${usage.image.bitsPerComponent}`,
      "/Interpolate false",
      "/Filter /FlateDecode",
      `/DecodeParms << /Predictor 15 /Colors ${usage.image.colors} /BitsPerComponent 8 /Columns ${usage.image.width} >>`,
    ].join(" "), usage.image.idat))
  })
  objects.set(infoId, plainObject("<< /Title (FlowDoc Thai PDF Pilot) /Producer (FlowDoc PDF Renderer Pilot) >>"))

  const header = Buffer.from("%PDF-1.7\n%\xE2\xE3\xCF\xD3\n", "binary")
  const parts: Buffer[] = [header]
  const offsets = new Array<number>(infoId + 1).fill(0)
  let byteOffset = header.length
  for (let objectId = 1; objectId <= infoId; objectId += 1) {
    const body = objects.get(objectId)
    if (body == null) throw new Error(`missing PDF object ${objectId}`)
    const prefix = Buffer.from(`${objectId} 0 obj\n`, "ascii")
    const suffix = Buffer.from("\nendobj\n", "ascii")
    offsets[objectId] = byteOffset
    parts.push(prefix, body, suffix)
    byteOffset += prefix.length + body.length + suffix.length
  }
  const xrefOffset = byteOffset
  const xref = [
    `xref\n0 ${infoId + 1}`,
    "0000000000 65535 f ",
    ...offsets.slice(1).map((offset) => `${offset.toString().padStart(10, "0")} 00000 n `),
  ].join("\n")
  const documentId = contract.fingerprint.slice("sha256:".length, "sha256:".length + 32).toUpperCase()
  const trailer = [
    xref,
    "trailer",
    `<< /Size ${infoId + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R /ID [<${documentId}> <${documentId}>] >>`,
    "startxref",
    xrefOffset.toString(),
    "%%EOF",
    "",
  ].join("\n")
  parts.push(Buffer.from(trailer, "ascii"))
  return Buffer.concat(parts)
}

function blockedResult(
  input: FlowDocPdfRendererPilotInput,
  issues: FlowDocPdfRendererPilotIssue[],
  mode:
    | typeof FLOWDOC_PDF_RENDERER_PILOT_MODE
    | typeof FLOWDOC_PDF_IMAGE_RENDERER_PILOT_MODE
    | typeof FLOWDOC_PDF_SHARED_RESOURCES_PILOT_MODE
    | typeof FLOWDOC_PDF_ALL_IMAGES_PILOT_MODE
    | typeof FLOWDOC_PDF_CANONICAL_REPORT_PILOT_MODE,
  imagesSupported: boolean,
  sharedResourceObjects: boolean,
  requiredImageAssetCount?: number,
  canonicalPageComposition = false,
): FlowDocPdfRendererPilotResult {
  return {
    source: FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
    mode,
    status: "blocked",
    proofId: input.proofId,
    artifact: null,
    bytes: null,
    renderContract: {
      consumes: "vnext-pdf-measured-draw-contract-v1",
      output: sharedResourceObjects ? "multi-page-pdf-bytes" : "one-page-pdf-bytes",
      usesProvidedGlyphFacts: true,
      embeddedFontSubset: true,
      toUnicode: true,
      imagesSupported,
      ...(sharedResourceObjects ? { sharedResourceObjects: true as const } : {}),
      ...(requiredImageAssetCount == null ? {} : { requiredImageAssetCount }),
      ...(canonicalPageComposition ? {
        canonicalPageComposition: true as const,
        requiredPageCount: CANONICAL_REPORT_PAGE_MARKERS.length,
        measuredVerticalGlyphOffsets: true as const,
        clusterActualTextFallback: true as const,
      } : {}),
      productionFidelity: false,
      storageWrites: false,
    },
    summary: {
      pageCount: input.contract.status === "consumable" ? input.contract.pages.length : 0,
      paintCommandCount: 0,
      glyphRunCount: 0,
      glyphCount: 0,
      embeddedFontCount: 0,
      imageCount: 0,
      ...(sharedResourceObjects
        ? { fontResourceReferenceCount: 0, imageResourceReferenceCount: 0 }
        : {}),
      byteLength: 0,
    },
    issues,
  }
}

function renderFlowDocPdfPilot(
  input: FlowDocPdfRendererPilotInput,
  mode:
    | typeof FLOWDOC_PDF_RENDERER_PILOT_MODE
    | typeof FLOWDOC_PDF_IMAGE_RENDERER_PILOT_MODE
    | typeof FLOWDOC_PDF_SHARED_RESOURCES_PILOT_MODE
    | typeof FLOWDOC_PDF_ALL_IMAGES_PILOT_MODE
    | typeof FLOWDOC_PDF_CANONICAL_REPORT_PILOT_MODE,
  phaseId: "PDF-PILOT-03" | "PDF-PILOT-04" | "PDF-PILOT-05" | "PDF-PILOT-06" | "PDF-PILOT-07",
  imagesSupported: boolean,
  sharedResourceObjects: boolean,
  requiredImageAssetCount?: number,
  canonicalPageComposition = false,
): FlowDocPdfRendererPilotResult {
  const issues: FlowDocPdfRendererPilotIssue[] = []
  if (input.proofId.trim().length === 0) {
    issues.push(issue("missing-proof-id", "proofId", `${phaseId} requires a non-blank proof id.`))
  }
  if (input.bindProductionRenderer === true) {
    issues.push(issue("production-binding", "bindProductionRenderer", `${phaseId} cannot bind production renderer behavior.`))
  }
  if (input.contract.status !== "consumable") {
    issues.push(issue("contract-blocked", "contract", "The PDF pilot requires a consumable measured draw contract."))
    return blockedResult(
      input,
      issues,
      mode,
      imagesSupported,
      sharedResourceObjects,
      requiredImageAssetCount,
      canonicalPageComposition,
    )
  }
  const contract = input.contract
  if (!sharedResourceObjects && contract.pages.length !== 1) {
    issues.push(issue("page-count", "contract.pages", `${phaseId} accepts exactly one measured page.`))
  } else if (sharedResourceObjects && (contract.pages.length < 2 || contract.pages.length > 12)) {
    issues.push(issue("page-count", "contract.pages", `${phaseId} accepts 2 through 12 measured pages.`))
  }
  if (requiredImageAssetCount != null) {
    if (contract.imageAssets.length !== requiredImageAssetCount) {
      issues.push(issue(
        "image-matrix-count",
        "contract.imageAssets",
        `${phaseId} requires exactly ${requiredImageAssetCount} image assets.`,
      ))
    }
    if (contract.pages.length !== requiredImageAssetCount) {
      issues.push(issue(
        "page-count",
        "contract.pages",
        `${phaseId} requires exactly ${requiredImageAssetCount} measured pages.`,
      ))
    }
    if (new Set(contract.imageAssets.map((asset) => asset.sha256)).size !== contract.imageAssets.length) {
      issues.push(issue(
        "image-matrix-duplicate-digest",
        "contract.imageAssets",
        `${phaseId} requires a distinct SHA-256 identity for every image asset.`,
      ))
    }
    const imageAssetIds = new Set(contract.imageAssets.map((asset) => asset.assetId))
    const referenceCounts = new Map<string, number>()
    contract.pages.forEach((page, pageIndex) => {
      const pageImages = page.commands.filter((command) => command.kind === "image")
      if (pageImages.length !== 1) {
        issues.push(issue(
          "image-matrix-page-coverage",
          `contract.pages.${pageIndex}.commands`,
          `${phaseId} requires exactly one image paint command on every page.`,
        ))
      }
      pageImages.forEach((command) => {
        referenceCounts.set(command.assetId, (referenceCounts.get(command.assetId) ?? 0) + 1)
      })
    })
    imageAssetIds.forEach((assetId) => {
      if (referenceCounts.get(assetId) !== 1) {
        issues.push(issue(
          "image-matrix-asset-coverage",
          `contract.imageAssets.${assetId}`,
          `${phaseId} requires every image asset to be painted exactly once.`,
        ))
      }
    })
  }
  if (canonicalPageComposition) {
    if (contract.rendererProfileId !== "pdf-pilot-canonical-report-twelve-page-v1") {
      issues.push(issue(
        "report-composition-profile",
        "contract.rendererProfileId",
        `${phaseId} requires the canonical twelve-page renderer profile.`,
      ))
    }
    if (contract.pages.length !== CANONICAL_REPORT_PAGE_MARKERS.length) {
      issues.push(issue(
        "report-composition-page-count",
        "contract.pages",
        `${phaseId} requires exactly ${CANONICAL_REPORT_PAGE_MARKERS.length} measured pages.`,
      ))
    }
    if (contract.imageAssets.length !== 5) {
      issues.push(issue(
        "report-composition-image-count",
        "contract.imageAssets",
        `${phaseId} requires exactly five pinned report image assets.`,
      ))
    }
    if (new Set(contract.imageAssets.map((asset) => asset.sha256)).size !== contract.imageAssets.length) {
      issues.push(issue(
        "report-composition-image-count",
        "contract.imageAssets",
        `${phaseId} requires five distinct report image digests.`,
      ))
    }
    CANONICAL_REPORT_PAGE_MARKERS.forEach((marker, pageIndex) => {
      const page = contract.pages[pageIndex]
      if (page == null || !page.commands.some((command) => (
        command.kind === "glyph-run" && command.text === marker
      ))) {
        issues.push(issue(
          "report-composition-page-marker",
          `contract.pages.${pageIndex}.commands`,
          `${phaseId} requires canonical marker ${JSON.stringify(marker)} on page ${pageIndex + 1}.`,
        ))
      }
    })
    const actualBindings = contract.pages.flatMap((page) => page.commands
      .filter((command): command is VNextPdfImagePaintCommandV1 => command.kind === "image")
      .map((command) => ({ pageNumber: page.pageNumber, assetId: command.assetId })))
    const expectedBindings = CANONICAL_REPORT_IMAGE_BINDINGS.map((binding) => ({ ...binding }))
    if (JSON.stringify(actualBindings) !== JSON.stringify(expectedBindings)) {
      issues.push(issue(
        "report-composition-image-binding",
        "contract.pages",
        `${phaseId} requires the canonical six page-to-image bindings.`,
      ))
    }
  }
  if (canonicalPageComposition && issues.length > 0) {
    return blockedResult(
      input,
      issues,
      mode,
      imagesSupported,
      sharedResourceObjects,
      requiredImageAssetCount,
      canonicalPageComposition,
    )
  }

  const duplicateResources = new Set<string>()
  const seenResources = new Set<string>()
  input.fontResources.forEach((resource) => {
    if (seenResources.has(resource.fontId)) duplicateResources.add(resource.fontId)
    seenResources.add(resource.fontId)
  })
  duplicateResources.forEach((fontId) => {
    issues.push(issue("duplicate-font-resource", `fontResources.${fontId}`, "Font resource ids must be unique."))
  })

  const resourceByFontId = new Map(input.fontResources.map((resource) => [resource.fontId, resource]))
  const usages: FontUsage[] = []
  contract.fontAssets.forEach((asset, index) => {
    const resource = resourceByFontId.get(asset.fontId)
    if (resource == null) {
      issues.push(issue("missing-font-resource", `fontAssets.${index}`, "Every contract font requires caller-supplied source and subset bytes."))
      return
    }
    if (!/^[A-Z]{6}$/.test(resource.subsetPrefix) || !/^[A-Za-z0-9-]+$/.test(resource.postScriptName)) {
      issues.push(issue("invalid-font-resource", `fontResources.${asset.fontId}`, "Subset prefix and PostScript name are not PDF-safe."))
    }
    if (sha256(resource.sourceBytes) !== asset.sha256) {
      issues.push(issue("source-font-hash-mismatch", `fontResources.${asset.fontId}.sourceBytes`, "Source font bytes must match the contract SHA-256 identity."))
    }
    if (sha256(resource.subsetBytes) !== resource.subsetSha256) {
      issues.push(issue("subset-font-hash-mismatch", `fontResources.${asset.fontId}.subsetBytes`, "Subset font bytes must match their declared SHA-256 identity."))
    }
    if (resource.subsetBytes.byteLength >= resource.sourceBytes.byteLength) {
      issues.push(issue("subset-not-smaller", `fontResources.${asset.fontId}.subsetBytes`, "Pilot subset bytes must be smaller than the registered source font."))
    }
    try {
      const metrics = parseSfnt(resource.subsetBytes)
      usages.push({
        asset,
        resource,
        metrics,
        pdfResourceName: `F${usages.length + 1}`,
        pdfBaseFontName: `${resource.subsetPrefix}+${resource.postScriptName}`,
        glyphs: [],
      })
    } catch (error) {
      issues.push(issue("invalid-sfnt", `fontResources.${asset.fontId}.subsetBytes`, error instanceof Error ? error.message : "Invalid TrueType subset."))
    }
  })

  const imageUsages: ImageUsage[] = []
  if (imagesSupported) {
    const imageResources = input.imageResources ?? []
    const duplicateImageResources = new Set<string>()
    const seenImageResources = new Set<string>()
    imageResources.forEach((resource) => {
      if (seenImageResources.has(resource.assetId)) duplicateImageResources.add(resource.assetId)
      seenImageResources.add(resource.assetId)
    })
    duplicateImageResources.forEach((assetId) => {
      issues.push(issue("duplicate-image-resource", `imageResources.${assetId}`, "Image resource ids must be unique."))
    })
    const imageResourceById = new Map(imageResources.map((resource) => [resource.assetId, resource]))

    contract.imageAssets.forEach((asset, index) => {
      const resource = imageResourceById.get(asset.assetId)
      if (resource == null) {
        issues.push(issue("missing-image-resource", `imageAssets.${index}`, "Every contract image requires caller-supplied bytes."))
        return
      }
      if (asset.mediaType !== "image/png") {
        issues.push(issue("unsupported-image-media-type", `imageAssets.${index}.mediaType`, `${phaseId} accepts PNG image resources only.`))
        return
      }
      if (sha256(resource.bytes) !== asset.sha256) {
        issues.push(issue("image-hash-mismatch", `imageResources.${asset.assetId}.bytes`, "Image bytes must match the contract SHA-256 identity."))
      }
      try {
        const image = parsePng(resource.bytes)
        if (image.width !== asset.pixelWidth || image.height !== asset.pixelHeight) {
          issues.push(issue("image-dimension-mismatch", `imageResources.${asset.assetId}.bytes`, "PNG dimensions must match the contract image asset."))
        }
        imageUsages.push({
          asset,
          resource,
          image,
          pdfResourceName: `Im${imageUsages.length + 1}`,
        })
      } catch (error) {
        issues.push(issue("invalid-png", `imageResources.${asset.assetId}.bytes`, error instanceof Error ? error.message : "Invalid PNG image."))
      }
    })
  }

  const resolvedRuns = new Map<string, ResolvedGlyph[]>()
  contract.pages.forEach((page, pageIndex) => {
    page.commands.forEach((command, commandIndex) => {
      const path = `contract.pages.${pageIndex}.commands.${commandIndex}`
      if (command.kind === "image" && !imagesSupported) {
        issues.push(issue("unsupported-image", path, "PDF-PILOT-03 intentionally excludes image execution."))
      }
      if (command.opacity !== 1) {
        issues.push(issue("unsupported-opacity", `${path}.opacity`, `${phaseId} accepts opaque paint only.`))
      }
      if (command.kind !== "glyph-run") return
      if (!canonicalPageComposition && command.glyphs.some((glyph) => glyph.offsetYPt !== 0)) {
        issues.push(issue("unsupported-vertical-glyph-offset", `${path}.glyphs`, `${phaseId} has not qualified vertical glyph offsets.`))
      }
      const usage = usages.find((candidate) => candidate.asset.fontId === command.fontId)
      if (usage == null) return
      const assignments = unicodeAssignments(command, canonicalPageComposition)
      if (assignments == null) {
        issues.push(issue("unmappable-text-cluster", `${path}.glyphs`, "Glyph clusters cannot be mapped losslessly into ToUnicode entries."))
        return
      }
      const advance = command.glyphs.reduce((total, glyph) => total + glyph.advancePt, 0)
      if (advance > command.bounds.widthPt) {
        issues.push(issue("glyph-run-overflow", `${path}.bounds.widthPt`, "Measured glyph advances exceed the source command bounds."))
      }
      const resolved = command.glyphs.map((glyph, glyphIndex): ResolvedGlyph => {
        if (glyph.glyphId >= usage.metrics.numGlyphs) {
          issues.push(issue("subset-glyph-missing", `${path}.glyphs.${glyphIndex}.glyphId`, "The retained subset does not preserve this measured glyph id."))
        }
        const item = {
          cid: usage.glyphs.length + 1,
          glyphId: glyph.glyphId,
          width: Math.round(glyph.advancePt / command.fontSizePt * 1000),
          unicode: assignments[glyphIndex],
          offsetX: glyph.offsetXPt / command.fontSizePt * 1000,
        }
        usage.glyphs.push(item)
        return item
      })
      resolvedRuns.set(command.id, resolved)
    })
  })

  if (issues.length > 0) {
    return blockedResult(
      input,
      issues,
      mode,
      imagesSupported,
      sharedResourceObjects,
      requiredImageAssetCount,
      canonicalPageComposition,
    )
  }

  const fontResourceReferenceCount = contract.pages.reduce((total, page) => (
    total + new Set(page.commands
      .filter((command) => command.kind === "glyph-run")
      .map((command) => command.fontId)).size
  ), 0)
  const imageResourceReferenceCount = contract.pages.reduce((total, page) => (
    total + new Set(page.commands
      .filter((command) => command.kind === "image")
      .map((command) => command.assetId)).size
  ), 0)

  const bytes = buildPdf(contract, usages, resolvedRuns, imageUsages)
  const artifact: FlowDocPdfRendererPilotArtifactManifest = {
    artifactId: `pdf-pilot:${input.proofId}`,
    format: "pdf",
    mediaType: "application/pdf",
    byteLength: bytes.byteLength,
    sha256: sha256(bytes),
    storageStatus: "not-stored",
    localOnly: true,
    sourceContractFingerprint: contract.fingerprint,
    rendererProfileId: contract.rendererProfileId,
    measurementProfileId: contract.measurementProfileId,
    embeddedFonts: usages.map((usage) => ({
      fontId: usage.asset.fontId,
      subsetId: usage.resource.subsetId,
      subsetSha256: usage.resource.subsetSha256,
      subsetByteLength: usage.resource.subsetBytes.byteLength,
      sourceByteLength: usage.resource.sourceBytes.byteLength,
      pdfBaseFontName: usage.pdfBaseFontName,
      fontFormat: "Type0/CIDFontType2",
      toUnicode: true,
    })),
    embeddedImages: imageUsages.map((usage) => ({
      assetId: usage.asset.assetId,
      sha256: usage.asset.sha256,
      byteLength: usage.resource.bytes.byteLength,
      pixelWidth: usage.image.width,
      pixelHeight: usage.image.height,
      colorSpace: usage.image.colorSpace,
      bitsPerComponent: usage.image.bitsPerComponent,
      sourceFormat: "png",
      accessibility: usage.asset.accessibility,
    })),
    ...(sharedResourceObjects ? {
      resourceReuse: {
        pageCount: contract.pages.length,
        uniqueFontObjectCount: usages.length,
        uniqueImageObjectCount: imageUsages.length,
        fontResourceReferenceCount,
        imageResourceReferenceCount,
      },
    } : {}),
    ...(requiredImageAssetCount == null ? {} : {
      imageMatrix: {
        requiredAssetCount: requiredImageAssetCount,
        uniqueImageDigestCount: new Set(contract.imageAssets.map((asset) => asset.sha256)).size,
        assetIds: contract.imageAssets.map((asset) => asset.assetId),
        pageBindings: contract.pages.map((page) => ({
          pageNumber: page.pageNumber,
          assetId: page.commands.find((command) => command.kind === "image")!.assetId,
        })),
      },
    }),
    ...(canonicalPageComposition ? {
      reportComposition: {
        requiredPageCount: CANONICAL_REPORT_PAGE_MARKERS.length,
        requiredImageAssetCount: 5,
        imagePaintCount: CANONICAL_REPORT_IMAGE_BINDINGS.length,
        pageMarkers: [...CANONICAL_REPORT_PAGE_MARKERS],
        pageBindings: CANONICAL_REPORT_IMAGE_BINDINGS.map((binding) => ({ ...binding })),
      },
    } : {}),
  }

  return {
    source: FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
    mode,
    status: "rendered",
    proofId: input.proofId,
    artifact,
    bytes,
    renderContract: {
      consumes: "vnext-pdf-measured-draw-contract-v1",
      output: sharedResourceObjects ? "multi-page-pdf-bytes" : "one-page-pdf-bytes",
      usesProvidedGlyphFacts: true,
      embeddedFontSubset: true,
      toUnicode: true,
      imagesSupported,
      ...(sharedResourceObjects ? { sharedResourceObjects: true as const } : {}),
      ...(requiredImageAssetCount == null ? {} : { requiredImageAssetCount }),
      ...(canonicalPageComposition ? {
        canonicalPageComposition: true as const,
        requiredPageCount: CANONICAL_REPORT_PAGE_MARKERS.length,
        measuredVerticalGlyphOffsets: true as const,
        clusterActualTextFallback: true as const,
      } : {}),
      productionFidelity: false,
      storageWrites: false,
    },
    summary: {
      pageCount: contract.pages.length,
      paintCommandCount: contract.pages.reduce((total, page) => total + page.commands.length, 0),
      glyphRunCount: contract.pages.reduce(
        (total, page) => total + page.commands.filter((command) => command.kind === "glyph-run").length,
        0,
      ),
      glyphCount: usages.reduce((total, usage) => total + usage.glyphs.length, 0),
      embeddedFontCount: usages.length,
      imageCount: imageUsages.length,
      ...(sharedResourceObjects ? { fontResourceReferenceCount, imageResourceReferenceCount } : {}),
      byteLength: bytes.byteLength,
    },
    issues: [],
  }
}

export function renderFlowDocThaiOnePagePdfPilot(
  input: FlowDocPdfRendererPilotInput,
): FlowDocPdfRendererPilotResult {
  return renderFlowDocPdfPilot(
    input,
    FLOWDOC_PDF_RENDERER_PILOT_MODE,
    "PDF-PILOT-03",
    false,
    false,
  )
}

export function renderFlowDocDigestBoundImageOnePagePdfPilot(
  input: FlowDocPdfRendererPilotInput,
): FlowDocPdfRendererPilotResult {
  return renderFlowDocPdfPilot(
    input,
    FLOWDOC_PDF_IMAGE_RENDERER_PILOT_MODE,
    "PDF-PILOT-04",
    true,
    false,
  )
}

export function renderFlowDocSharedResourcesMultiPagePdfPilot(
  input: FlowDocPdfRendererPilotInput,
): FlowDocPdfRendererPilotResult {
  return renderFlowDocPdfPilot(
    input,
    FLOWDOC_PDF_SHARED_RESOURCES_PILOT_MODE,
    "PDF-PILOT-05",
    true,
    true,
  )
}

export function renderFlowDocAllFiveImageMatrixPdfPilot(
  input: FlowDocPdfRendererPilotInput,
): FlowDocPdfRendererPilotResult {
  return renderFlowDocPdfPilot(
    input,
    FLOWDOC_PDF_ALL_IMAGES_PILOT_MODE,
    "PDF-PILOT-06",
    true,
    true,
    5,
  )
}

export function renderFlowDocCanonicalTwelvePageReportPdfPilot(
  input: FlowDocPdfRendererPilotInput,
): FlowDocPdfRendererPilotResult {
  return renderFlowDocPdfPilot(
    input,
    FLOWDOC_PDF_CANONICAL_REPORT_PILOT_MODE,
    "PDF-PILOT-07",
    true,
    true,
    undefined,
    true,
  )
}
