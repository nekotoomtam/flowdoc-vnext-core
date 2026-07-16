import { createHash } from "node:crypto"
import type {
  VNextPdfFontAssetV1,
  VNextPdfGlyphRunPaintCommandV1,
  VNextPdfMeasuredDrawContractResultV1,
  VNextPdfPaintCommandV1,
} from "@flowdoc/vnext-core"

export const FLOWDOC_PDF_RENDERER_PILOT_SOURCE = "flowdoc-pdf-renderer-pilot" as const
export const FLOWDOC_PDF_RENDERER_PILOT_MODE = "thai-type0-one-page-proof" as const

export type FlowDocPdfRendererPilotIssueCode =
  | "missing-proof-id"
  | "production-binding"
  | "contract-blocked"
  | "page-count"
  | "unsupported-image"
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

export interface FlowDocPdfRendererPilotInput {
  proofId: string
  contract: VNextPdfMeasuredDrawContractResultV1
  fontResources: FlowDocPdfRendererPilotFontResource[]
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
}

export type FlowDocPdfRendererPilotResult = {
  source: typeof FLOWDOC_PDF_RENDERER_PILOT_SOURCE
  mode: typeof FLOWDOC_PDF_RENDERER_PILOT_MODE
  proofId: string
  renderContract: {
    consumes: "vnext-pdf-measured-draw-contract-v1"
    output: "one-page-pdf-bytes"
    usesProvidedGlyphFacts: true
    embeddedFontSubset: true
    toUnicode: true
    imagesSupported: false
    productionFidelity: false
    storageWrites: false
  }
  summary: {
    pageCount: number
    paintCommandCount: number
    glyphRunCount: number
    glyphCount: number
    embeddedFontCount: number
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

function unicodeAssignments(command: VNextPdfGlyphRunPaintCommandV1): string[] | null {
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
    if (scalars.length < indexes.length) return null
    indexes.forEach((glyphIndex, index) => {
      assignments[glyphIndex] = index === indexes.length - 1
        ? scalars.slice(index).join("")
        : scalars[index]
    })
  }

  return assignments.every((value) => value != null && value.length > 0) ? assignments : null
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

function buildPdf(
  contract: Extract<VNextPdfMeasuredDrawContractResultV1, { status: "consumable" }>,
  usages: FontUsage[],
  resolvedRuns: Map<string, ResolvedGlyph[]>,
): Uint8Array {
  const page = contract.pages[0]
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
  })
  const contentBytes = Buffer.from(`${content.join("\n")}\n`, "ascii")

  const objects = new Map<number, Buffer>()
  const catalogId = 1
  const pagesId = 2
  const pageId = 3
  const contentId = 4
  let nextId = 5
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
  const infoId = nextId

  objects.set(catalogId, plainObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`))
  objects.set(pagesId, plainObject(`<< /Type /Pages /Kids [${pageId} 0 R] /Count 1 >>`))
  const fontResources = usages.map((usage, index) => (
    `/${usage.pdfResourceName} ${fontObjectIds[index].type0} 0 R`
  )).join(" ")
  objects.set(pageId, plainObject([
    "<< /Type /Page",
    `/Parent ${pagesId} 0 R`,
    `/MediaBox [0 0 ${formatNumber(page.widthPt)} ${formatNumber(page.heightPt)}]`,
    `/Resources << /Font << ${fontResources} >> >>`,
    `/Contents ${contentId} 0 R >>`,
  ].join(" ")))
  objects.set(contentId, streamObject("", contentBytes))

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
): FlowDocPdfRendererPilotResult {
  return {
    source: FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
    mode: FLOWDOC_PDF_RENDERER_PILOT_MODE,
    status: "blocked",
    proofId: input.proofId,
    artifact: null,
    bytes: null,
    renderContract: {
      consumes: "vnext-pdf-measured-draw-contract-v1",
      output: "one-page-pdf-bytes",
      usesProvidedGlyphFacts: true,
      embeddedFontSubset: true,
      toUnicode: true,
      imagesSupported: false,
      productionFidelity: false,
      storageWrites: false,
    },
    summary: {
      pageCount: input.contract.status === "consumable" ? input.contract.pages.length : 0,
      paintCommandCount: 0,
      glyphRunCount: 0,
      glyphCount: 0,
      embeddedFontCount: 0,
      byteLength: 0,
    },
    issues,
  }
}

export function renderFlowDocThaiOnePagePdfPilot(
  input: FlowDocPdfRendererPilotInput,
): FlowDocPdfRendererPilotResult {
  const issues: FlowDocPdfRendererPilotIssue[] = []
  if (input.proofId.trim().length === 0) {
    issues.push(issue("missing-proof-id", "proofId", "PDF-PILOT-03 requires a non-blank proof id."))
  }
  if (input.bindProductionRenderer === true) {
    issues.push(issue("production-binding", "bindProductionRenderer", "PDF-PILOT-03 cannot bind production renderer behavior."))
  }
  if (input.contract.status !== "consumable") {
    issues.push(issue("contract-blocked", "contract", "The PDF pilot requires a consumable measured draw contract."))
    return blockedResult(input, issues)
  }
  const contract = input.contract
  if (contract.pages.length !== 1) {
    issues.push(issue("page-count", "contract.pages", "PDF-PILOT-03 accepts exactly one measured page."))
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

  const resolvedRuns = new Map<string, ResolvedGlyph[]>()
  if (contract.pages.length === 1) {
    contract.pages[0].commands.forEach((command, commandIndex) => {
      const path = `contract.pages.0.commands.${commandIndex}`
      if (command.kind === "image") {
        issues.push(issue("unsupported-image", path, "PDF-PILOT-03 intentionally excludes image execution."))
      }
      if (command.opacity !== 1) {
        issues.push(issue("unsupported-opacity", `${path}.opacity`, "PDF-PILOT-03 accepts opaque paint only."))
      }
      if (command.kind !== "glyph-run") return
      if (command.glyphs.some((glyph) => glyph.offsetYPt !== 0)) {
        issues.push(issue("unsupported-vertical-glyph-offset", `${path}.glyphs`, "The one-page pilot has not qualified vertical glyph offsets."))
      }
      const usage = usages.find((candidate) => candidate.asset.fontId === command.fontId)
      if (usage == null) return
      const assignments = unicodeAssignments(command)
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
  }

  if (issues.length > 0) return blockedResult(input, issues)

  const bytes = buildPdf(contract, usages, resolvedRuns)
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
  }

  return {
    source: FLOWDOC_PDF_RENDERER_PILOT_SOURCE,
    mode: FLOWDOC_PDF_RENDERER_PILOT_MODE,
    status: "rendered",
    proofId: input.proofId,
    artifact,
    bytes,
    renderContract: {
      consumes: "vnext-pdf-measured-draw-contract-v1",
      output: "one-page-pdf-bytes",
      usesProvidedGlyphFacts: true,
      embeddedFontSubset: true,
      toUnicode: true,
      imagesSupported: false,
      productionFidelity: false,
      storageWrites: false,
    },
    summary: {
      pageCount: contract.pages.length,
      paintCommandCount: contract.pages[0].commands.length,
      glyphRunCount: contract.pages[0].commands.filter((command) => command.kind === "glyph-run").length,
      glyphCount: usages.reduce((total, usage) => total + usage.glyphs.length, 0),
      embeddedFontCount: usages.length,
      byteLength: bytes.byteLength,
    },
    issues: [],
  }
}
