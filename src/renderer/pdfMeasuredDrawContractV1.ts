import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type {
  VNextPdfDrawCommand,
  VNextPdfRendererAdapterPlan,
} from "./pdfAdapter.js"

export const VNEXT_PDF_MEASURED_DRAW_CONTRACT_VERSION = 1 as const
export const VNEXT_PDF_MEASURED_DRAW_CONTRACT_SOURCE = "vnext-pdf-measured-draw-contract" as const

const NonBlankIdSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})
const FiniteNumberSchema = z.number().finite()
const NonNegativeFiniteNumberSchema = FiniteNumberSchema.nonnegative()
const PositiveFiniteNumberSchema = FiniteNumberSchema.positive()
const ColorSchema = z.string().regex(/^[0-9A-Fa-f]{6}$/)
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/)
const OpacitySchema = z.number().finite().gt(0).lte(1)

export const VNextPdfPaintBoundsV1Schema = z.object({
  xPt: NonNegativeFiniteNumberSchema,
  yPt: NonNegativeFiniteNumberSchema,
  widthPt: PositiveFiniteNumberSchema,
  heightPt: PositiveFiniteNumberSchema,
}).strict()

export const VNextPdfPageBoxV1Schema = z.object({
  pageIndex: z.number().int().nonnegative(),
  pageNumber: z.number().int().positive(),
  widthPt: PositiveFiniteNumberSchema,
  heightPt: PositiveFiniteNumberSchema,
  backgroundColor: ColorSchema,
}).strict()

export const VNextPdfFontAssetV1Schema = z.object({
  fontId: NonBlankIdSchema,
  family: NonBlankIdSchema,
  style: z.enum(["normal", "italic"]),
  weight: z.number().int().min(100).max(900),
  format: z.literal("ttf"),
  sha256: Sha256Schema,
  sourceKind: z.literal("package-font-asset"),
  licenseId: z.literal("OFL-1.1"),
  embedding: z.literal("subset"),
  toUnicodeMap: z.literal(true),
}).strict()

const ImageAccessibilitySchema = z.object({
  decorative: z.boolean(),
  altText: z.string().nullable(),
}).strict().superRefine((value, ctx) => {
  if (!value.decorative && (value.altText == null || value.altText.trim().length === 0)) {
    ctx.addIssue({
      code: "custom",
      path: ["altText"],
      message: "non-decorative images require alt text",
    })
  }
})

export const VNextPdfImageAssetV1Schema = z.object({
  assetId: NonBlankIdSchema,
  mediaType: z.enum(["image/png", "image/jpeg"]),
  sha256: Sha256Schema,
  pixelWidth: z.number().int().positive(),
  pixelHeight: z.number().int().positive(),
  bytesOwner: z.literal("backend"),
  accessibility: ImageAccessibilitySchema,
}).strict()

export const VNextPdfGlyphFactV1Schema = z.object({
  glyphIndex: z.number().int().nonnegative(),
  glyphId: z.number().int().positive(),
  advancePt: NonNegativeFiniteNumberSchema,
  offsetXPt: FiniteNumberSchema,
  offsetYPt: FiniteNumberSchema,
  clusterStartOffset: z.number().int().nonnegative(),
  clusterEndOffset: z.number().int().positive(),
}).strict().superRefine((value, ctx) => {
  if (value.clusterEndOffset <= value.clusterStartOffset) {
    ctx.addIssue({
      code: "custom",
      path: ["clusterEndOffset"],
      message: "glyph cluster end must be greater than start",
    })
  }
})

const PaintCommandBaseShape = {
  id: NonBlankIdSchema,
  sourceCommandId: NonBlankIdSchema,
  pageIndex: z.number().int().nonnegative(),
  paintOrder: z.number().int().nonnegative(),
  bounds: VNextPdfPaintBoundsV1Schema,
}

export const VNextPdfGlyphRunPaintCommandV1Schema = z.object({
  ...PaintCommandBaseShape,
  kind: z.literal("glyph-run"),
  measurementRequestId: NonBlankIdSchema,
  measurementProfileId: NonBlankIdSchema,
  text: z.string().min(1),
  fontId: NonBlankIdSchema,
  fontSizePt: PositiveFiniteNumberSchema,
  lineHeightPt: PositiveFiniteNumberSchema,
  baselineOffsetPt: PositiveFiniteNumberSchema,
  color: ColorSchema,
  opacity: OpacitySchema,
  glyphs: z.array(VNextPdfGlyphFactV1Schema).min(1),
}).strict().superRefine((value, ctx) => {
  if (value.baselineOffsetPt > value.bounds.heightPt) {
    ctx.addIssue({
      code: "custom",
      path: ["baselineOffsetPt"],
      message: "baseline offset must stay inside measured bounds",
    })
  }
})

export const VNextPdfFillRectPaintCommandV1Schema = z.object({
  ...PaintCommandBaseShape,
  kind: z.literal("fill-rect"),
  color: ColorSchema,
  opacity: OpacitySchema,
}).strict()

export const VNextPdfStrokeRectPaintCommandV1Schema = z.object({
  ...PaintCommandBaseShape,
  kind: z.literal("stroke-rect"),
  color: ColorSchema,
  opacity: OpacitySchema,
  widthPt: PositiveFiniteNumberSchema,
  style: z.enum(["solid", "dashed", "dotted"]),
}).strict()

const NormalizedCropSchema = z.object({
  top: z.number().finite().min(0).max(1),
  right: z.number().finite().min(0).max(1),
  bottom: z.number().finite().min(0).max(1),
  left: z.number().finite().min(0).max(1),
}).strict().superRefine((value, ctx) => {
  if (value.left + value.right >= 1) {
    ctx.addIssue({ code: "custom", path: ["right"], message: "horizontal crop must retain source area" })
  }
  if (value.top + value.bottom >= 1) {
    ctx.addIssue({ code: "custom", path: ["bottom"], message: "vertical crop must retain source area" })
  }
})

export const VNextPdfImagePaintCommandV1Schema = z.object({
  ...PaintCommandBaseShape,
  kind: z.literal("image"),
  assetId: NonBlankIdSchema,
  fit: z.enum(["contain", "cover"]),
  crop: NormalizedCropSchema.nullable(),
  opacity: OpacitySchema,
}).strict()

export const VNextPdfPaintCommandV1Schema = z.discriminatedUnion("kind", [
  VNextPdfGlyphRunPaintCommandV1Schema,
  VNextPdfFillRectPaintCommandV1Schema,
  VNextPdfStrokeRectPaintCommandV1Schema,
  VNextPdfImagePaintCommandV1Schema,
])

const DrawFactsSchema = z.object({
  pageBoxes: z.array(VNextPdfPageBoxV1Schema).min(1),
  fontAssets: z.array(VNextPdfFontAssetV1Schema).min(1),
  imageAssets: z.array(VNextPdfImageAssetV1Schema),
  paintCommands: z.array(VNextPdfPaintCommandV1Schema).min(1),
}).strict()

export type VNextPdfPaintBoundsV1 = z.infer<typeof VNextPdfPaintBoundsV1Schema>
export type VNextPdfPageBoxV1 = z.infer<typeof VNextPdfPageBoxV1Schema>
export type VNextPdfFontAssetV1 = z.infer<typeof VNextPdfFontAssetV1Schema>
export type VNextPdfImageAssetV1 = z.infer<typeof VNextPdfImageAssetV1Schema>
export type VNextPdfGlyphFactV1 = z.infer<typeof VNextPdfGlyphFactV1Schema>
export type VNextPdfGlyphRunPaintCommandV1 = z.infer<typeof VNextPdfGlyphRunPaintCommandV1Schema>
export type VNextPdfFillRectPaintCommandV1 = z.infer<typeof VNextPdfFillRectPaintCommandV1Schema>
export type VNextPdfStrokeRectPaintCommandV1 = z.infer<typeof VNextPdfStrokeRectPaintCommandV1Schema>
export type VNextPdfImagePaintCommandV1 = z.infer<typeof VNextPdfImagePaintCommandV1Schema>
export type VNextPdfPaintCommandV1 = z.infer<typeof VNextPdfPaintCommandV1Schema>

export interface VNextPdfMeasuredDrawContractRequestV1 {
  contractVersion: typeof VNEXT_PDF_MEASURED_DRAW_CONTRACT_VERSION
  kind: "pdf-measured-draw-contract-request"
  pilotId: string
  rendererProfileId: string
  measurementProfileId: string
  plan: VNextPdfRendererAdapterPlan
  pageBoxes: unknown
  fontAssets: unknown
  imageAssets: unknown
  paintCommands: unknown
  bindProductionRenderer?: boolean
}

export type VNextPdfMeasuredDrawIssueCodeV1 =
  | "missing-pilot-id"
  | "missing-renderer-profile-id"
  | "missing-measurement-profile-id"
  | "production-binding"
  | "pdf-plan-blocked"
  | "invalid-draw-input"
  | "page-count-mismatch"
  | "duplicate-page-index"
  | "missing-page-index"
  | "duplicate-font-id"
  | "duplicate-image-asset-id"
  | "duplicate-paint-command-id"
  | "duplicate-paint-order"
  | "unknown-page"
  | "command-out-of-page"
  | "unknown-source-command"
  | "missing-source-command-paint"
  | "source-bounds-mismatch"
  | "glyph-run-source-not-text"
  | "text-source-mismatch"
  | "unknown-font"
  | "measurement-profile-mismatch"
  | "glyph-index-mismatch"
  | "glyph-cluster-out-of-bounds"
  | "missing-text-cluster-coverage"
  | "unknown-image-asset"

export interface VNextPdfMeasuredDrawIssueV1 {
  code: VNextPdfMeasuredDrawIssueCodeV1
  path: string
  message: string
  severity: "error"
}

export interface VNextPdfMeasuredDrawPageV1 extends VNextPdfPageBoxV1 {
  commands: VNextPdfPaintCommandV1[]
}

interface VNextPdfMeasuredDrawContractBaseV1 {
  source: typeof VNEXT_PDF_MEASURED_DRAW_CONTRACT_SOURCE
  contractVersion: typeof VNEXT_PDF_MEASURED_DRAW_CONTRACT_VERSION
  pilotId: string
  rendererProfileId: string
  measurementProfileId: string
  artifact: {
    kind: "pdf"
    status: "not-rendered"
    contentType: "application/pdf"
    bytes: null
    storageId: null
  }
  contracts: {
    consumes: "vnext-pdf-renderer-adapter-plan-plus-explicit-paint-facts"
    geometrySource: "measured-render-command-bounds"
    paintOrderSource: "explicit-per-page-order"
    fontEmbedding: "subset-required"
    textExtraction: "to-unicode-required"
    imageBytesOwner: "backend"
    mayRelayout: false
  }
  execution: {
    coreReadsFontFiles: false
    coreReadsImageBytes: false
    coreExecutesShaping: false
    coreWritesPdfBytes: false
    rendererRequired: true
    productionBinding: false
  }
}

export type VNextPdfMeasuredDrawContractResultV1 =
  | VNextPdfMeasuredDrawContractBaseV1 & {
      status: "consumable"
      pages: VNextPdfMeasuredDrawPageV1[]
      fontAssets: VNextPdfFontAssetV1[]
      imageAssets: VNextPdfImageAssetV1[]
      fingerprint: string
      summary: {
        pageCount: number
        sourceCommandCount: number
        paintCommandCount: number
        glyphRunCount: number
        fillRectCount: number
        strokeRectCount: number
        imageCount: number
        fontAssetCount: number
        imageAssetCount: number
      }
      issues: []
    }
  | VNextPdfMeasuredDrawContractBaseV1 & {
      status: "blocked"
      pages: null
      fontAssets: null
      imageAssets: null
      fingerprint: null
      summary: null
      issues: VNextPdfMeasuredDrawIssueV1[]
    }

function issue(
  code: VNextPdfMeasuredDrawIssueCodeV1,
  path: string,
  message: string,
): VNextPdfMeasuredDrawIssueV1 {
  return { code, path, message, severity: "error" }
}

function artifact(): VNextPdfMeasuredDrawContractBaseV1["artifact"] {
  return {
    kind: "pdf",
    status: "not-rendered",
    contentType: "application/pdf",
    bytes: null,
    storageId: null,
  }
}

function contracts(): VNextPdfMeasuredDrawContractBaseV1["contracts"] {
  return {
    consumes: "vnext-pdf-renderer-adapter-plan-plus-explicit-paint-facts",
    geometrySource: "measured-render-command-bounds",
    paintOrderSource: "explicit-per-page-order",
    fontEmbedding: "subset-required",
    textExtraction: "to-unicode-required",
    imageBytesOwner: "backend",
    mayRelayout: false,
  }
}

function execution(): VNextPdfMeasuredDrawContractBaseV1["execution"] {
  return {
    coreReadsFontFiles: false,
    coreReadsImageBytes: false,
    coreExecutesShaping: false,
    coreWritesPdfBytes: false,
    rendererRequired: true,
    productionBinding: false,
  }
}

function duplicateValues<T>(values: readonly T[]): Set<T> {
  const seen = new Set<T>()
  const duplicates = new Set<T>()
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  })
  return duplicates
}

function sameBounds(left: VNextPdfPaintBoundsV1, right: VNextPdfDrawCommand["bounds"]): boolean {
  return (
    left.xPt === right.xPt
    && left.yPt === right.yPt
    && left.widthPt === right.widthPt
    && left.heightPt === right.heightPt
  )
}

function clusterCoverageIsComplete(command: VNextPdfGlyphRunPaintCommandV1): boolean {
  const ranges = command.glyphs
    .map((glyph) => ({ start: glyph.clusterStartOffset, end: glyph.clusterEndOffset }))
    .sort((left, right) => left.start - right.start || left.end - right.end)
  let coveredUntil = 0

  for (const range of ranges) {
    if (range.start > coveredUntil) return false
    coveredUntil = Math.max(coveredUntil, range.end)
  }

  return coveredUntil >= command.text.length
}

function blocked(
  input: VNextPdfMeasuredDrawContractRequestV1,
  issues: VNextPdfMeasuredDrawIssueV1[],
): VNextPdfMeasuredDrawContractResultV1 {
  return {
    source: VNEXT_PDF_MEASURED_DRAW_CONTRACT_SOURCE,
    contractVersion: VNEXT_PDF_MEASURED_DRAW_CONTRACT_VERSION,
    status: "blocked",
    pilotId: input.pilotId,
    rendererProfileId: input.rendererProfileId,
    measurementProfileId: input.measurementProfileId,
    pages: null,
    fontAssets: null,
    imageAssets: null,
    fingerprint: null,
    artifact: artifact(),
    summary: null,
    contracts: contracts(),
    execution: execution(),
    issues,
  }
}

export function createVNextPdfMeasuredDrawContractV1(
  input: VNextPdfMeasuredDrawContractRequestV1,
): VNextPdfMeasuredDrawContractResultV1 {
  const issues: VNextPdfMeasuredDrawIssueV1[] = []

  if (input.pilotId.trim().length === 0) {
    issues.push(issue("missing-pilot-id", "pilotId", "PDF measured draw contracts require a pilot id."))
  }
  if (input.rendererProfileId.trim().length === 0) {
    issues.push(issue("missing-renderer-profile-id", "rendererProfileId", "PDF measured draw contracts require a renderer profile id."))
  }
  if (input.measurementProfileId.trim().length === 0) {
    issues.push(issue("missing-measurement-profile-id", "measurementProfileId", "PDF measured draw contracts require a measurement profile id."))
  }
  if (input.bindProductionRenderer === true) {
    issues.push(issue("production-binding", "bindProductionRenderer", "PDF-PILOT-02 cannot bind production renderer behavior."))
  }
  if (input.plan.status === "blocked" || input.plan.blockingIssues.length > 0) {
    issues.push(issue("pdf-plan-blocked", "plan", "PDF measured draw contracts require a ready PDF adapter plan."))
  }

  const parsed = DrawFactsSchema.safeParse({
    pageBoxes: input.pageBoxes,
    fontAssets: input.fontAssets,
    imageAssets: input.imageAssets,
    paintCommands: input.paintCommands,
  })
  if (!parsed.success) {
    parsed.error.issues.forEach((validationIssue) => {
      issues.push(issue(
        "invalid-draw-input",
        validationIssue.path.join("."),
        validationIssue.message,
      ))
    })
    return blocked(input, issues)
  }

  const { pageBoxes, fontAssets, imageAssets, paintCommands } = parsed.data
  if (pageBoxes.length !== input.plan.pageCount) {
    issues.push(issue("page-count-mismatch", "pageBoxes", "Page box count must equal the measured PDF adapter page count."))
  }

  duplicateValues(pageBoxes.map((page) => page.pageIndex)).forEach((pageIndex) => {
    issues.push(issue("duplicate-page-index", `pageBoxes.${pageIndex}`, "Page indexes must be unique."))
  })
  for (let pageIndex = 0; pageIndex < input.plan.pageCount; pageIndex += 1) {
    if (!pageBoxes.some((page) => page.pageIndex === pageIndex)) {
      issues.push(issue("missing-page-index", `pageBoxes.${pageIndex}`, "Every measured page requires one page box."))
    }
  }
  duplicateValues(fontAssets.map((font) => font.fontId)).forEach((fontId) => {
    issues.push(issue("duplicate-font-id", `fontAssets.${fontId}`, "Font ids must be unique."))
  })
  duplicateValues(imageAssets.map((image) => image.assetId)).forEach((assetId) => {
    issues.push(issue("duplicate-image-asset-id", `imageAssets.${assetId}`, "Image asset ids must be unique."))
  })
  duplicateValues(paintCommands.map((command) => command.id)).forEach((commandId) => {
    issues.push(issue("duplicate-paint-command-id", `paintCommands.${commandId}`, "Paint command ids must be unique."))
  })
  duplicateValues(paintCommands.map((command) => `${command.pageIndex}:${command.paintOrder}`)).forEach((key) => {
    issues.push(issue("duplicate-paint-order", `paintCommands.${key}`, "Paint order must be unique within each page."))
  })

  const pageByIndex = new Map(pageBoxes.map((page) => [page.pageIndex, page]))
  const fontIds = new Set(fontAssets.map((font) => font.fontId))
  const imageAssetIds = new Set(imageAssets.map((image) => image.assetId))
  const sourceById = new Map(input.plan.drawCommands.map((command) => [command.id, command]))
  const paintedSourceIds = new Set<string>()

  paintCommands.forEach((command, commandIndex) => {
    const commandPath = `paintCommands.${commandIndex}`
    const page = pageByIndex.get(command.pageIndex)
    const source = sourceById.get(command.sourceCommandId)

    if (page == null) {
      issues.push(issue("unknown-page", `${commandPath}.pageIndex`, "Paint commands must reference a declared page box."))
    } else if (
      command.bounds.xPt + command.bounds.widthPt > page.widthPt
      || command.bounds.yPt + command.bounds.heightPt > page.heightPt
    ) {
      issues.push(issue("command-out-of-page", `${commandPath}.bounds`, "Paint command bounds must stay inside the measured page box."))
    }

    if (source == null) {
      issues.push(issue("unknown-source-command", `${commandPath}.sourceCommandId`, "Paint commands must reference a PDF adapter draw command."))
    } else {
      paintedSourceIds.add(source.id)
      if (!sameBounds(command.bounds, source.bounds)) {
        issues.push(issue("source-bounds-mismatch", `${commandPath}.bounds`, "Paint commands must preserve measured source-command bounds exactly."))
      }
    }

    if (command.kind === "glyph-run") {
      if (source != null && source.operation !== "draw-text") {
        issues.push(issue("glyph-run-source-not-text", `${commandPath}.sourceCommandId`, "Glyph runs must reference draw-text source commands."))
      }
      if (source != null && source.text !== command.text) {
        issues.push(issue("text-source-mismatch", `${commandPath}.text`, "Glyph-run text must equal measured source-command text."))
      }
      if (!fontIds.has(command.fontId)) {
        issues.push(issue("unknown-font", `${commandPath}.fontId`, "Glyph runs must reference declared font assets."))
      }
      if (command.measurementProfileId !== input.measurementProfileId) {
        issues.push(issue("measurement-profile-mismatch", `${commandPath}.measurementProfileId`, "Glyph runs must use the request measurement profile."))
      }
      command.glyphs.forEach((glyph, glyphIndex) => {
        if (glyph.glyphIndex !== glyphIndex) {
          issues.push(issue("glyph-index-mismatch", `${commandPath}.glyphs.${glyphIndex}.glyphIndex`, "Glyph indexes must be contiguous."))
        }
        if (glyph.clusterEndOffset > command.text.length) {
          issues.push(issue("glyph-cluster-out-of-bounds", `${commandPath}.glyphs.${glyphIndex}`, "Glyph clusters must stay inside UTF-16 text bounds."))
        }
      })
      if (!clusterCoverageIsComplete(command)) {
        issues.push(issue("missing-text-cluster-coverage", `${commandPath}.glyphs`, "Glyph clusters must cover the complete source text without gaps."))
      }
    }

    if (command.kind === "image" && !imageAssetIds.has(command.assetId)) {
      issues.push(issue("unknown-image-asset", `${commandPath}.assetId`, "Image paint commands must reference declared image assets."))
    }
  })

  input.plan.drawCommands.forEach((sourceCommand, sourceIndex) => {
    if (!paintedSourceIds.has(sourceCommand.id)) {
      issues.push(issue("missing-source-command-paint", `plan.drawCommands.${sourceIndex}`, "Every PDF adapter draw command requires at least one explicit paint command."))
    }
  })

  if (issues.length > 0) return blocked(input, issues)

  const sortedPageBoxes = [...pageBoxes].sort((left, right) => left.pageIndex - right.pageIndex)
  const pages = sortedPageBoxes.map((page): VNextPdfMeasuredDrawPageV1 => ({
    ...page,
    commands: paintCommands
      .filter((command) => command.pageIndex === page.pageIndex)
      .sort((left, right) => left.paintOrder - right.paintOrder || left.id.localeCompare(right.id)),
  }))
  const fingerprint = createVNextCompactFingerprint(JSON.stringify({
    pilotId: input.pilotId,
    rendererProfileId: input.rendererProfileId,
    measurementProfileId: input.measurementProfileId,
    sourceCommands: input.plan.drawCommands,
    pages,
    fontAssets,
    imageAssets,
  }))

  return {
    source: VNEXT_PDF_MEASURED_DRAW_CONTRACT_SOURCE,
    contractVersion: VNEXT_PDF_MEASURED_DRAW_CONTRACT_VERSION,
    status: "consumable",
    pilotId: input.pilotId,
    rendererProfileId: input.rendererProfileId,
    measurementProfileId: input.measurementProfileId,
    pages,
    fontAssets,
    imageAssets,
    fingerprint,
    artifact: artifact(),
    summary: {
      pageCount: pages.length,
      sourceCommandCount: input.plan.drawCommands.length,
      paintCommandCount: paintCommands.length,
      glyphRunCount: paintCommands.filter((command) => command.kind === "glyph-run").length,
      fillRectCount: paintCommands.filter((command) => command.kind === "fill-rect").length,
      strokeRectCount: paintCommands.filter((command) => command.kind === "stroke-rect").length,
      imageCount: paintCommands.filter((command) => command.kind === "image").length,
      fontAssetCount: fontAssets.length,
      imageAssetCount: imageAssets.length,
    },
    contracts: contracts(),
    execution: execution(),
    issues: [],
  }
}
