import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  compareVNextOrdinalStrings,
  sameVNextCanonicalJson,
  stringifyVNextCanonicalJson,
} from "../fingerprint/canonicalJson.js"
import {
  createVNextAuthoredBoxPlanV1,
  VNEXT_AUTHORED_BOX_CONTRACT_V1_SOURCE,
  VNEXT_AUTHORED_BOX_CONTRACT_V1_VERSION,
  type VNextAuthoredBoxPlanV1,
} from "../renderer/authoredBoxContractV1.js"
import {
  ImageFrameV4TargetSchema,
  TextBlockNodeV4TargetSchema,
  type InlineImageV4Target,
  type TextBlockNodeV4Target,
} from "../schema/documentV4ImageTarget.js"
import {
  TextBlockRoleV4TargetSchema,
  TextRunStyleV4TargetSchema,
  type TextBlockRoleV4Target,
  type TextRunStyleV4Target,
} from "../schema/documentV4Foundation.js"
import type {
  VNextTextBlockV4MeasurementRequest,
  VNextTextBlockV4MeasurementRun,
} from "../pagination/textBlockV4Measurement.js"
import {
  convertVNextPointToLayoutUnitV1,
  createVNextLayoutUnitPolicyV1,
  scaleVNextFontMetricToLayoutUnitV1,
  VNextLayoutUnitV1Schema,
  VNextNonNegativeLayoutUnitV1Schema,
  VNextPositiveLayoutUnitV1Schema,
} from "./layoutUnitPolicyV1.js"
import type {
  VNextTextBlockMultiRunFontFaceV1,
  VNextTextBlockMultiRunParagraphStyleV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import {
  inspectVNextTextBlockInitialFlowParentRegionV1,
  VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_SOURCE,
  VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_VERSION,
  type VNextTextBlockInitialFlowParentRegionV1,
} from "./textBlockInitialFlowParentRegionV1.js"

export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_SOURCE = "vnext-text-block-initial-flow-v1" as const
export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_VERSION = 1 as const

interface AtomBase {
  inlineId: string
  renderStartOffset: number
  renderEndOffset: number
  renderedText: string
}

export interface VNextTextBlockInitialFlowResolvedGeometryStyleV1 {
  styleKey: string
  fontFaceId: string
  fontSizeLayoutUnit: number
  textColor: string
  fontWeight: number
  fontStyle: VNextTextBlockMultiRunFontFaceV1["style"]
}

export type VNextTextBlockInitialFlowAtomV1 =
  | (AtomBase & {
      kind: "text"
      styleKey: string
      localStyle?: TextRunStyleV4Target
      resolvedGeometryStyle: VNextTextBlockInitialFlowResolvedGeometryStyleV1
    })
  | (AtomBase & {
      kind: "resolved-field"
      fieldKey: string
      styleKey: string
      resolvedGeometryStyle: VNextTextBlockInitialFlowResolvedGeometryStyleV1
    })
  | (AtomBase & {
      kind: "generated-page-number"
      generatedOwnerFingerprint: string
      styleKey: string
      resolvedGeometryStyle: VNextTextBlockInitialFlowResolvedGeometryStyleV1
    })
  | (AtomBase & { kind: "hard-break" })
  | (AtomBase & {
      kind: "inline-image"
      assetId: string | null
      frame: InlineImageV4Target["frame"]
      verticalAlign: InlineImageV4Target["verticalAlign"]
    })

export interface VNextTextBlockInitialFlowCapabilityReportV1 {
  styledText: "ready" | "not-present"
  resolvedField: "ready" | "not-present"
  generatedPageNumber: "ready" | "not-present"
  hardBreak: "ready" | "not-present"
  inlineImage: "not-present" | "blocked-line-box-contract"
  listDecoration: "not-present" | "blocked-decoration-contract"
  emptyBlock: "not-present" | "blocked-empty-layout-contract"
  authoredBox: "ready"
  positionedObjects: "not-present"
}

export interface VNextTextBlockInitialFlowBuildInputV1 {
  textBlock: TextBlockNodeV4Target
  measurement: VNextTextBlockV4MeasurementRequest
  authoredBoxPlan: VNextAuthoredBoxPlanV1
  parentRegion: VNextTextBlockInitialFlowParentRegionV1
  layoutUnitPolicyFingerprint: string
  declaredLineHeightLayoutUnit: number
  paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1
  fontFaces: VNextTextBlockMultiRunFontFaceV1[]
}

export interface VNextTextBlockInitialFlowV1 {
  source: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_VERSION
  kind: "initial-text-block-flow"
  layoutDisposition: "text-subset-ready" | "geometry-contract-required"
  documentId: string
  instanceRevision: number
  sectionId: string
  textBlockId: string
  role: TextBlockRoleV4Target
  authoredBoxPlan: VNextAuthoredBoxPlanV1
  parentRegion: VNextTextBlockInitialFlowParentRegionV1
  measurement: VNextTextBlockV4MeasurementRequest
  layoutUnitPolicyFingerprint: string
  declaredLineHeightLayoutUnit: number
  paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1
  fontFaces: VNextTextBlockMultiRunFontFaceV1[]
  atoms: VNextTextBlockInitialFlowAtomV1[]
  capabilities: VNextTextBlockInitialFlowCapabilityReportV1
  contracts: {
    canonicalDocumentMutation: false
    geometryDependenciesPinned: true
    processLocalClassifierAuthority: true
    textOnlyAdapterEligible: boolean
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export type VNextTextBlockInitialFlowIssueCodeV1 =
  | "invalid-build-input"
  | "invalid-text-block"
  | "invalid-measurement-input"
  | "measurement-identity-mismatch"
  | "invalid-measurement-ranges"
  | "invalid-parent-region"
  | "invalid-authored-box"
  | "invalid-declared-line-height"
  | "layout-unit-policy-mismatch"
  | "authored-box-owner-mismatch"
  | "authored-box-fingerprint-mismatch"
  | "authored-box-width-mismatch"
  | "style-context-mismatch"
  | "invalid-font-context"
  | "resolved-run-typography"
  | "inline-projection-mismatch"

export interface VNextTextBlockInitialFlowIssueV1 {
  code: VNextTextBlockInitialFlowIssueCodeV1
  severity: "error"
  path: string
  message: string
  inlineId?: string
}

export type VNextTextBlockInitialFlowResultV1 =
  | { status: "classified"; flow: VNextTextBlockInitialFlowV1; issues: [] }
  | { status: "blocked"; flow: null; issues: VNextTextBlockInitialFlowIssueV1[] }

export type VNextTextBlockInitialFlowInspectionV1 =
  | {
      status: "valid"
      fingerprint: string
      mayPublishLayout: false
      productionBinding: false
    }
  | {
      status: "invalid"
      code:
        | "unregistered-initial-flow"
        | "initial-flow-not-deeply-frozen"
        | "invalid-initial-flow-shape"
        | "initial-flow-fingerprint-mismatch"
      message: string
      mayPublishLayout: false
      productionBinding: false
    }

const NonBlankStringSchema = z.string().refine((value) => value.trim().length > 0, {
  message: "value must not be blank",
})
const HexColorSchema = z.string().regex(/^[0-9A-Fa-f]{6}$/u)
const CompactFingerprintSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u)
const FiniteNonNegativeNumberSchema = z.number().finite().nonnegative()
const FinitePositiveNumberSchema = z.number().finite().positive()

const MeasurementTextRunSchema = z.object({
  inlineId: z.string(),
  kind: z.literal("text"),
  renderStartOffset: z.number(),
  renderEndOffset: z.number(),
  renderedText: z.string(),
  styleKey: z.string().optional(),
  localStyle: TextRunStyleV4TargetSchema.optional(),
}).strict()

const MeasurementResolvedFieldRunSchema = z.object({
  inlineId: z.string(),
  kind: z.literal("resolved-field"),
  renderStartOffset: z.number(),
  renderEndOffset: z.number(),
  renderedText: z.string(),
  fieldKey: z.string().optional(),
  styleKey: z.string().optional(),
}).strict()

const MeasurementGeneratedPageNumberRunSchema = z.object({
  inlineId: z.string(),
  kind: z.literal("generated-page-number"),
  renderStartOffset: z.number(),
  renderEndOffset: z.number(),
  renderedText: z.string(),
  generatedOwnerFingerprint: z.string().optional(),
  styleKey: z.string().optional(),
}).strict()

const MeasurementHardBreakRunSchema = z.object({
  inlineId: z.string(),
  kind: z.literal("hard-break"),
  renderStartOffset: z.number(),
  renderEndOffset: z.number(),
  renderedText: z.string(),
}).strict()

const MeasurementInlineImageRunSchema = z.object({
  inlineId: z.string(),
  kind: z.literal("inline-image"),
  renderStartOffset: z.number(),
  renderEndOffset: z.number(),
  renderedText: z.string(),
  assetId: z.string().min(1).nullable().optional(),
  frame: ImageFrameV4TargetSchema.optional(),
}).strict()

const MeasurementRunSchema = z.discriminatedUnion("kind", [
  MeasurementTextRunSchema,
  MeasurementResolvedFieldRunSchema,
  MeasurementGeneratedPageNumberRunSchema,
  MeasurementHardBreakRunSchema,
  MeasurementInlineImageRunSchema,
])

const MeasurementSchema = z.object({
  documentId: z.string(),
  instanceRevision: z.number(),
  sectionId: z.string(),
  textBlockId: z.string(),
  availableWidthPt: z.number().finite(),
  measurementProfileId: z.string(),
  styleKey: z.string(),
  renderedText: z.string(),
  runs: z.array(MeasurementRunSchema),
}).strict()

const ParagraphStyleSchema = z.object({
  styleKey: z.string(),
  fontFaceId: z.string(),
  fontSizeLayoutUnit: VNextPositiveLayoutUnitV1Schema,
  textColor: HexColorSchema,
}).strict()

const FontFaceSchema = z.object({
  fontFaceId: z.string(),
  fontFamily: z.string(),
  fontSha256: z.string().regex(/^[a-f0-9]{64}$/u),
  weight: z.number().int().min(100).max(900),
  style: z.enum(["normal", "italic"]),
  unitsPerEm: VNextPositiveLayoutUnitV1Schema,
  ascentFontUnit: VNextPositiveLayoutUnitV1Schema,
  descentFontUnit: VNextLayoutUnitV1Schema.refine((value) => value <= 0, {
    message: "font descent must be non-positive",
  }),
  lineGapFontUnit: VNextNonNegativeLayoutUnitV1Schema,
}).strict()

const AuthoredBoxInsetsSchema = z.object({
  top: FiniteNonNegativeNumberSchema,
  right: FiniteNonNegativeNumberSchema,
  bottom: FiniteNonNegativeNumberSchema,
  left: FiniteNonNegativeNumberSchema,
}).strict()

const AuthoredBoxBorderSideSchema = z.object({
  style: z.enum(["none", "solid", "dashed", "dotted"]),
  widthPt: FiniteNonNegativeNumberSchema,
  color: HexColorSchema,
}).strict()

const AuthoredBoxBorderSchema = z.object({
  top: AuthoredBoxBorderSideSchema,
  right: AuthoredBoxBorderSideSchema,
  bottom: AuthoredBoxBorderSideSchema,
  left: AuthoredBoxBorderSideSchema,
}).strict()

const AuthoredBoxPlanSchema = z.object({
  source: z.literal(VNEXT_AUTHORED_BOX_CONTRACT_V1_SOURCE),
  contractVersion: z.literal(VNEXT_AUTHORED_BOX_CONTRACT_V1_VERSION),
  kind: z.literal("authored-box-plan"),
  ownerNodeId: NonBlankStringSchema,
  ownerNodeType: z.enum(["text-block", "column", "table-cell"]),
  hasAuthoredBox: z.boolean(),
  fillColor: HexColorSchema.nullable(),
  paddingPt: AuthoredBoxInsetsSchema,
  border: AuthoredBoxBorderSchema,
  outerWidthPt: FinitePositiveNumberSchema,
  contentInsetPt: AuthoredBoxInsetsSchema,
  contentWidthPt: FinitePositiveNumberSchema,
  pageSplitPolicy: z.literal("open-continuation-edges"),
  styleFingerprint: CompactFingerprintSchema,
  fingerprint: CompactFingerprintSchema,
}).strict()

const ParentRegionSchema = z.object({
  source: z.literal(VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_SOURCE),
  contractVersion: z.literal(VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_VERSION),
  kind: z.literal("text-block-parent-region"),
  ownerKind: z.enum(["body", "column", "table-cell"]),
  ownerId: NonBlankStringSchema,
  xLayoutUnit: VNextNonNegativeLayoutUnitV1Schema,
  yLayoutUnit: VNextNonNegativeLayoutUnitV1Schema,
  widthLayoutUnit: VNextPositiveLayoutUnitV1Schema,
  availableHeightLayoutUnit: VNextPositiveLayoutUnitV1Schema.nullable(),
  fingerprint: CompactFingerprintSchema,
}).strict()

const BuildInputSchema = z.object({
  textBlock: TextBlockNodeV4TargetSchema,
  measurement: MeasurementSchema,
  authoredBoxPlan: AuthoredBoxPlanSchema,
  parentRegion: ParentRegionSchema,
  layoutUnitPolicyFingerprint: z.string(),
  declaredLineHeightLayoutUnit: VNextPositiveLayoutUnitV1Schema,
  paragraphStyle: ParagraphStyleSchema,
  fontFaces: z.array(FontFaceSchema).min(1),
}).strict()

const ResolvedGeometryStyleSchema = z.object({
  styleKey: NonBlankStringSchema,
  fontFaceId: NonBlankStringSchema,
  fontSizeLayoutUnit: VNextPositiveLayoutUnitV1Schema,
  textColor: HexColorSchema,
  fontWeight: z.number().int().min(100).max(900),
  fontStyle: z.enum(["normal", "italic"]),
}).strict()

const RetainedTextAtomSchema = z.object({
  inlineId: NonBlankStringSchema,
  kind: z.literal("text"),
  renderStartOffset: VNextNonNegativeLayoutUnitV1Schema,
  renderEndOffset: VNextNonNegativeLayoutUnitV1Schema,
  renderedText: z.string(),
  styleKey: NonBlankStringSchema,
  localStyle: TextRunStyleV4TargetSchema.optional(),
  resolvedGeometryStyle: ResolvedGeometryStyleSchema,
}).strict()

const RetainedResolvedFieldAtomSchema = z.object({
  inlineId: NonBlankStringSchema,
  kind: z.literal("resolved-field"),
  renderStartOffset: VNextNonNegativeLayoutUnitV1Schema,
  renderEndOffset: VNextNonNegativeLayoutUnitV1Schema,
  renderedText: z.string(),
  fieldKey: NonBlankStringSchema,
  styleKey: NonBlankStringSchema,
  resolvedGeometryStyle: ResolvedGeometryStyleSchema,
}).strict()

const RetainedGeneratedPageNumberAtomSchema = z.object({
  inlineId: NonBlankStringSchema,
  kind: z.literal("generated-page-number"),
  renderStartOffset: VNextNonNegativeLayoutUnitV1Schema,
  renderEndOffset: VNextNonNegativeLayoutUnitV1Schema,
  renderedText: z.string().min(1),
  generatedOwnerFingerprint: CompactFingerprintSchema,
  styleKey: NonBlankStringSchema,
  resolvedGeometryStyle: ResolvedGeometryStyleSchema,
}).strict()

const RetainedHardBreakAtomSchema = z.object({
  inlineId: NonBlankStringSchema,
  kind: z.literal("hard-break"),
  renderStartOffset: VNextNonNegativeLayoutUnitV1Schema,
  renderEndOffset: VNextNonNegativeLayoutUnitV1Schema,
  renderedText: z.string(),
}).strict()

const RetainedInlineImageAtomSchema = z.object({
  inlineId: NonBlankStringSchema,
  kind: z.literal("inline-image"),
  renderStartOffset: VNextNonNegativeLayoutUnitV1Schema,
  renderEndOffset: VNextNonNegativeLayoutUnitV1Schema,
  renderedText: z.string(),
  assetId: z.string().min(1).nullable(),
  frame: ImageFrameV4TargetSchema,
  verticalAlign: z.enum(["baseline", "middle", "text-bottom"]),
}).strict()

const RetainedAtomSchema = z.discriminatedUnion("kind", [
  RetainedTextAtomSchema,
  RetainedResolvedFieldAtomSchema,
  RetainedGeneratedPageNumberAtomSchema,
  RetainedHardBreakAtomSchema,
  RetainedInlineImageAtomSchema,
])

const CapabilityReportSchema = z.object({
  styledText: z.enum(["ready", "not-present"]),
  resolvedField: z.enum(["ready", "not-present"]),
  generatedPageNumber: z.enum(["ready", "not-present"]),
  hardBreak: z.enum(["ready", "not-present"]),
  inlineImage: z.enum(["not-present", "blocked-line-box-contract"]),
  listDecoration: z.enum(["not-present", "blocked-decoration-contract"]),
  emptyBlock: z.enum(["not-present", "blocked-empty-layout-contract"]),
  authoredBox: z.literal("ready"),
  positionedObjects: z.literal("not-present"),
}).strict()

const RetainedInitialFlowSchema = z.object({
  source: z.literal(VNEXT_TEXT_BLOCK_INITIAL_FLOW_SOURCE),
  contractVersion: z.literal(VNEXT_TEXT_BLOCK_INITIAL_FLOW_VERSION),
  kind: z.literal("initial-text-block-flow"),
  layoutDisposition: z.enum(["text-subset-ready", "geometry-contract-required"]),
  documentId: NonBlankStringSchema,
  instanceRevision: VNextNonNegativeLayoutUnitV1Schema,
  sectionId: NonBlankStringSchema,
  textBlockId: NonBlankStringSchema,
  role: TextBlockRoleV4TargetSchema,
  authoredBoxPlan: AuthoredBoxPlanSchema,
  parentRegion: ParentRegionSchema,
  measurement: MeasurementSchema,
  layoutUnitPolicyFingerprint: CompactFingerprintSchema,
  declaredLineHeightLayoutUnit: VNextPositiveLayoutUnitV1Schema,
  paragraphStyle: ParagraphStyleSchema,
  fontFaces: z.array(FontFaceSchema).min(1),
  atoms: z.array(RetainedAtomSchema),
  capabilities: CapabilityReportSchema,
  contracts: z.object({
    canonicalDocumentMutation: z.literal(false),
    geometryDependenciesPinned: z.literal(true),
    processLocalClassifierAuthority: z.literal(true),
    textOnlyAdapterEligible: z.boolean(),
    mayPublishLayout: z.literal(false),
    productionBinding: z.literal(false),
  }).strict(),
  fingerprint: CompactFingerprintSchema,
}).strict()

const processLocalInitialFlows = new WeakMap<object, {
  fingerprint: string
  canonicalFacts: string
}>()

function clone<T>(value: T): T {
  return JSON.parse(stringifyVNextCanonicalJson(value)) as T
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  Object.values(value).forEach((item) => deepFreeze(item))
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

function deeplyFrozen(value: unknown): boolean {
  if (value == null || typeof value !== "object") return true
  if (!Object.isFrozen(value)) return false
  return Object.values(value).every((item) => deeplyFrozen(item))
}

function nonBlank(value: string | undefined): value is string {
  return value != null && value.trim().length > 0
}

function compactFingerprint(value: string | undefined): value is string {
  return value != null && /^sha256:[0-9a-f]{64}$/u.test(value)
}

function positiveLayoutUnitFromPoint(point: number): number | null {
  const converted = convertVNextPointToLayoutUnitV1(point)
  return converted.status === "accepted"
    && VNextPositiveLayoutUnitV1Schema.safeParse(converted.layoutUnit).success
    ? converted.layoutUnit
    : null
}

function issue(
  code: VNextTextBlockInitialFlowIssueCodeV1,
  path: string,
  message: string,
  inlineId?: string,
): VNextTextBlockInitialFlowIssueV1 {
  return { code, severity: "error", path, message, ...(inlineId == null ? {} : { inlineId }) }
}

function inputIssueCode(path: readonly PropertyKey[]): VNextTextBlockInitialFlowIssueCodeV1 {
  const root = path[0]
  if (root === "textBlock") return "invalid-text-block"
  if (root === "measurement") return "invalid-measurement-input"
  if (root === "authoredBoxPlan") return "invalid-authored-box"
  if (root === "parentRegion") return "invalid-parent-region"
  if (root === "layoutUnitPolicyFingerprint") return "layout-unit-policy-mismatch"
  if (root === "declaredLineHeightLayoutUnit") return "invalid-declared-line-height"
  if (root === "paragraphStyle" || root === "fontFaces") return "invalid-font-context"
  return "invalid-build-input"
}

function expectedKind(type: TextBlockNodeV4Target["children"][number]["type"]): VNextTextBlockV4MeasurementRun["kind"] {
  if (type === "field-ref") return "resolved-field"
  if (type === "page-number") return "generated-page-number"
  if (type === "line-break") return "hard-break"
  return type
}

function validMeasurementRanges(measurement: VNextTextBlockV4MeasurementRequest): boolean {
  let cursor = 0
  for (const run of measurement.runs) {
    if (
      !Number.isSafeInteger(run.renderStartOffset)
      || !Number.isSafeInteger(run.renderEndOffset)
      || run.renderStartOffset !== cursor
      || run.renderEndOffset < run.renderStartOffset
      || run.renderEndOffset > measurement.renderedText.length
      || run.renderedText !== measurement.renderedText.slice(run.renderStartOffset, run.renderEndOffset)
    ) return false
    cursor = run.renderEndOffset
  }
  return cursor === measurement.renderedText.length
}

function validScaledMetrics(
  face: VNextTextBlockMultiRunFontFaceV1,
  fontSizeLayoutUnit: number,
): boolean {
  const ascent = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: face.ascentFontUnit,
    fontSizeLayoutUnit,
    unitsPerEm: face.unitsPerEm,
  })
  const descent = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: face.descentFontUnit,
    fontSizeLayoutUnit,
    unitsPerEm: face.unitsPerEm,
  })
  const lineGap = scaleVNextFontMetricToLayoutUnitV1({
    fontMetric: face.lineGapFontUnit,
    fontSizeLayoutUnit,
    unitsPerEm: face.unitsPerEm,
  })
  return ascent.status === "accepted"
    && descent.status === "accepted"
    && lineGap.status === "accepted"
}

function validateFonts(
  input: VNextTextBlockInitialFlowBuildInputV1,
  issues: VNextTextBlockInitialFlowIssueV1[],
): VNextTextBlockMultiRunFontFaceV1 | null {
  if (
    !nonBlank(input.paragraphStyle.styleKey)
    || input.paragraphStyle.styleKey !== input.measurement.styleKey
    || !nonBlank(input.paragraphStyle.fontFaceId)
  ) {
    issues.push(issue(
      "invalid-font-context",
      "paragraphStyle",
      "paragraph style must pin the measurement style and one font face",
    ))
  }
  const ids = new Set<string>()
  input.fontFaces.forEach((face, index) => {
    if (!nonBlank(face.fontFaceId) || !nonBlank(face.fontFamily) || ids.has(face.fontFaceId)) {
      issues.push(issue(
        "invalid-font-context",
        `fontFaces[${index}]`,
        "font faces must have unique nonblank ids and families",
      ))
    }
    ids.add(face.fontFaceId)
  })
  const selectedFace = input.fontFaces.find((face) => face.fontFaceId === input.paragraphStyle.fontFaceId)
  if (
    selectedFace == null
    || !validScaledMetrics(selectedFace, input.paragraphStyle.fontSizeLayoutUnit)
  ) {
    issues.push(issue(
      "invalid-font-context",
      "paragraphStyle.fontFaceId",
      "paragraph style must resolve to one pinned face with safely scalable metrics",
    ))
    return null
  }
  return selectedFace
}

function unitValueToPositiveLayoutUnit(
  value: { value: number; unit: "pt" | "mm" },
): number | null {
  const point = value.unit === "pt" ? value.value : (value.value * 72) / 25.4
  return positiveLayoutUnitFromPoint(point)
}

function resolveGeometryStyle(input: {
  styleKey: string | undefined
  localStyle: TextRunStyleV4Target | undefined
  paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1
  paragraphFace: VNextTextBlockMultiRunFontFaceV1
  fontFaces: readonly VNextTextBlockMultiRunFontFaceV1[]
  path: string
  inlineId: string
  issues: VNextTextBlockInitialFlowIssueV1[]
}): VNextTextBlockInitialFlowResolvedGeometryStyleV1 | null {
  if (!nonBlank(input.styleKey)) return null
  if (input.localStyle?.fontFamilyKey != null) {
    input.issues.push(issue(
      "resolved-run-typography",
      `${input.path}.localStyle.fontFamilyKey`,
      "fontFamilyKey has no authoritative mapping in the Initial Flow font-face contract",
      input.inlineId,
    ))
    return null
  }

  const fontSizeLayoutUnit = input.localStyle?.fontSize == null
    ? input.paragraphStyle.fontSizeLayoutUnit
    : unitValueToPositiveLayoutUnit(input.localStyle.fontSize)
  if (fontSizeLayoutUnit == null) {
    input.issues.push(issue(
      "resolved-run-typography",
      `${input.path}.localStyle.fontSize`,
      "effective Text Run font size must convert to a positive safe LayoutUnit",
      input.inlineId,
    ))
    return null
  }

  let face = input.paragraphFace
  if (input.localStyle?.fontWeight != null || input.localStyle?.fontStyle != null) {
    const weight = input.localStyle.fontWeight == null
      ? input.paragraphFace.weight
      : input.localStyle.fontWeight === "bold" ? 700 : 400
    const style = input.localStyle.fontStyle ?? input.paragraphFace.style
    const candidates = input.fontFaces.filter((candidate) => (
      candidate.fontFamily === input.paragraphFace.fontFamily
      && candidate.weight === weight
      && candidate.style === style
    ))
    if (candidates.length !== 1) {
      input.issues.push(issue(
        "resolved-run-typography",
        input.path,
        "effective Text Run weight/style must resolve to exactly one face in the paragraph font family",
        input.inlineId,
      ))
      return null
    }
    face = candidates[0]!
  }

  if (!validScaledMetrics(face, fontSizeLayoutUnit)) {
    input.issues.push(issue(
      "resolved-run-typography",
      input.path,
      "effective Text Run font metrics cannot be scaled safely",
      input.inlineId,
    ))
    return null
  }
  return {
    styleKey: input.styleKey,
    fontFaceId: face.fontFaceId,
    fontSizeLayoutUnit,
    textColor: input.localStyle?.textColor ?? input.paragraphStyle.textColor,
    fontWeight: face.weight,
    fontStyle: face.style,
  }
}

function projectAtoms(
  textBlock: TextBlockNodeV4Target,
  measurement: VNextTextBlockV4MeasurementRequest,
  paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1,
  paragraphFace: VNextTextBlockMultiRunFontFaceV1,
  fontFaces: readonly VNextTextBlockMultiRunFontFaceV1[],
  issues: VNextTextBlockInitialFlowIssueV1[],
): VNextTextBlockInitialFlowAtomV1[] {
  if (textBlock.children.length !== measurement.runs.length) {
    issues.push(issue(
      "inline-projection-mismatch",
      "measurement.runs",
      "measurement must contain exactly one ordered run for every authored inline",
    ))
    return []
  }
  const atoms: VNextTextBlockInitialFlowAtomV1[] = []
  textBlock.children.forEach((inline, index) => {
    const run = measurement.runs[index]
    const path = `textBlock.children[${index}]`
    if (run == null || run.inlineId !== inline.id || run.kind !== expectedKind(inline.type)) {
      issues.push(issue(
        "inline-projection-mismatch", path,
        "authored inline identity/type must match the measurement run", inline.id,
      ))
      return
    }
    const base = {
      inlineId: inline.id,
      renderStartOffset: run.renderStartOffset,
      renderEndOffset: run.renderEndOffset,
      renderedText: run.renderedText,
    }
    if (inline.type === "text") {
      if (run.renderedText !== inline.text || !sameVNextCanonicalJson(run.localStyle, inline.style)) {
        issues.push(issue("inline-projection-mismatch", path, "text and local style must match measurement", inline.id))
        return
      }
      const resolvedGeometryStyle = resolveGeometryStyle({
        styleKey: run.styleKey,
        localStyle: inline.style,
        paragraphStyle,
        paragraphFace,
        fontFaces,
        path,
        inlineId: inline.id,
        issues,
      })
      if (resolvedGeometryStyle == null || !nonBlank(run.styleKey)) return
      atoms.push({
        ...base,
        kind: "text",
        styleKey: run.styleKey,
        ...(inline.style == null ? {} : { localStyle: clone(inline.style) }),
        resolvedGeometryStyle,
      })
      return
    }
    if (inline.type === "field-ref") {
      if (run.fieldKey !== inline.key) {
        issues.push(issue("inline-projection-mismatch", path, "field key must match measurement", inline.id))
        return
      }
      const resolvedGeometryStyle = resolveGeometryStyle({
        styleKey: run.styleKey,
        localStyle: undefined,
        paragraphStyle,
        paragraphFace,
        fontFaces,
        path,
        inlineId: inline.id,
        issues,
      })
      if (resolvedGeometryStyle == null || !nonBlank(run.styleKey)) return
      atoms.push({
        ...base,
        kind: "resolved-field",
        fieldKey: inline.key,
        styleKey: run.styleKey,
        resolvedGeometryStyle,
      })
      return
    }
    if (inline.type === "page-number") {
      if (
        run.renderedText.length === 0
        || run.renderEndOffset <= run.renderStartOffset
        || !compactFingerprint(run.generatedOwnerFingerprint)
      ) {
        issues.push(issue(
          "inline-projection-mismatch", path,
          "page number requires a non-empty generated value and compact owner fingerprint", inline.id,
        ))
        return
      }
      const resolvedGeometryStyle = resolveGeometryStyle({
        styleKey: run.styleKey,
        localStyle: undefined,
        paragraphStyle,
        paragraphFace,
        fontFaces,
        path,
        inlineId: inline.id,
        issues,
      })
      if (resolvedGeometryStyle == null || !nonBlank(run.styleKey)) return
      atoms.push({
        ...base,
        kind: "generated-page-number",
        generatedOwnerFingerprint: run.generatedOwnerFingerprint,
        styleKey: run.styleKey,
        resolvedGeometryStyle,
      })
      return
    }
    if (inline.type === "line-break") {
      if (!/^(?:\r\n|\r|\n)$/u.test(run.renderedText)) {
        issues.push(issue("inline-projection-mismatch", path, "hard break must contain one newline sequence", inline.id))
        return
      }
      atoms.push({ ...base, kind: "hard-break" })
      return
    }
    if (
      run.renderedText !== "\uFFFC"
      || !Object.hasOwn(run, "assetId")
      || run.frame == null
      || !sameVNextCanonicalJson(run.frame, inline.frame)
      || (inline.source.kind === "asset-ref" && run.assetId !== inline.source.assetId)
    ) {
      issues.push(issue("inline-projection-mismatch", path, "inline image asset/frame must match measurement", inline.id))
      return
    }
    atoms.push({
      ...base,
      kind: "inline-image",
      assetId: run.assetId ?? null,
      frame: clone(inline.frame),
      verticalAlign: inline.verticalAlign,
    })
  })
  return atoms
}

export function inspectVNextTextBlockInitialFlowV1(
  flow: unknown,
): VNextTextBlockInitialFlowInspectionV1 {
  const invalid = (
    code: Extract<VNextTextBlockInitialFlowInspectionV1, { status: "invalid" }>["code"],
    message: string,
  ): VNextTextBlockInitialFlowInspectionV1 => ({
    status: "invalid",
    code,
    message,
    mayPublishLayout: false,
    productionBinding: false,
  })
  if (flow == null || typeof flow !== "object") return invalid(
    "unregistered-initial-flow",
    "Initial Flow is not an object registered by the process-local Core classifier",
  )
  const registration = processLocalInitialFlows.get(flow)
  if (registration == null) return invalid(
    "unregistered-initial-flow",
    "Initial Flow is not the exact process-local object registered by the Core classifier",
  )
  if (!deeplyFrozen(flow)) return invalid(
    "initial-flow-not-deeply-frozen",
    "registered Initial Flow must remain recursively frozen",
  )
  const parsed = RetainedInitialFlowSchema.safeParse(flow)
  if (!parsed.success) return invalid(
    "invalid-initial-flow-shape",
    parsed.error.issues.map((item) => `${item.path.map(String).join(".")}: ${item.message}`).join("; "),
  )
  const { fingerprint, ...facts } = parsed.data
  const canonicalFacts = stringifyVNextCanonicalJson(facts)
  if (
    fingerprint !== createVNextCompactFingerprint(canonicalFacts)
    || registration.fingerprint !== fingerprint
    || registration.canonicalFacts !== canonicalFacts
  ) return invalid(
    "initial-flow-fingerprint-mismatch",
    "registered Initial Flow facts do not match the canonical Core fingerprint",
  )
  return {
    status: "valid",
    fingerprint,
    mayPublishLayout: false,
    productionBinding: false,
  }
}

export function createVNextTextBlockInitialFlowV1(
  input: VNextTextBlockInitialFlowBuildInputV1,
): VNextTextBlockInitialFlowResultV1
export function createVNextTextBlockInitialFlowV1(input: unknown): VNextTextBlockInitialFlowResultV1
export function createVNextTextBlockInitialFlowV1(input: unknown): VNextTextBlockInitialFlowResultV1 {
  const parsed = BuildInputSchema.safeParse(input)
  if (!parsed.success) return {
    status: "blocked",
    flow: null,
    issues: parsed.error.issues.map((item) => issue(
      inputIssueCode(item.path),
      item.path.map(String).join(".") || "input",
      item.message,
    )),
  }
  const normalized = parsed.data as VNextTextBlockInitialFlowBuildInputV1
  const issues: VNextTextBlockInitialFlowIssueV1[] = []
  const textBlock = normalized.textBlock
  const measurement = normalized.measurement

  if (
    !nonBlank(measurement.documentId)
    || !Number.isSafeInteger(measurement.instanceRevision)
    || measurement.instanceRevision < 0
    || !nonBlank(measurement.sectionId)
    || !nonBlank(measurement.measurementProfileId)
    || measurement.textBlockId !== textBlock.id
  ) issues.push(issue(
    "measurement-identity-mismatch", "measurement",
    "measurement identity, revision, and profile must match the authored TextBlock",
  ))
  if (!validMeasurementRanges(measurement)) issues.push(issue(
    "invalid-measurement-ranges", "measurement.runs",
    "measurement runs must cover rendered text with ordered gap-free ranges",
  ))

  const parentInspection = inspectVNextTextBlockInitialFlowParentRegionV1(normalized.parentRegion)
  if (parentInspection.status !== "valid") issues.push(issue(
    "invalid-parent-region", "parentRegion", parentInspection.message,
  ))
  if (normalized.layoutUnitPolicyFingerprint !== createVNextLayoutUnitPolicyV1().fingerprint) issues.push(issue(
    "layout-unit-policy-mismatch", "layoutUnitPolicyFingerprint",
    "Initial Flow must pin the accepted LayoutUnitPolicyV1 fingerprint",
  ))

  if (
    normalized.authoredBoxPlan.ownerNodeId !== textBlock.id
    || normalized.authoredBoxPlan.ownerNodeType !== "text-block"
  ) issues.push(issue(
    "authored-box-owner-mismatch", "authoredBoxPlan",
    "authored box plan must belong to the same TextBlock",
  ))
  const rebuiltBox = createVNextAuthoredBoxPlanV1({
    ownerNode: textBlock,
    availableWidthPt: normalized.authoredBoxPlan.outerWidthPt,
  })
  if (
    rebuiltBox.status !== "ready"
    || !sameVNextCanonicalJson(rebuiltBox.plan, normalized.authoredBoxPlan)
  ) issues.push(issue(
    "authored-box-fingerprint-mismatch", "authoredBoxPlan",
    "authored box plan must equal the Core-derived plan for this TextBlock",
  ))
  const outerWidthLayoutUnit = positiveLayoutUnitFromPoint(normalized.authoredBoxPlan.outerWidthPt)
  const measuredContentWidthLayoutUnit = positiveLayoutUnitFromPoint(measurement.availableWidthPt)
  const rebuiltContentWidthLayoutUnit = rebuiltBox.status === "ready"
    ? positiveLayoutUnitFromPoint(rebuiltBox.plan.contentWidthPt)
    : null
  if (
    measuredContentWidthLayoutUnit == null
    || rebuiltContentWidthLayoutUnit == null
    || measuredContentWidthLayoutUnit !== rebuiltContentWidthLayoutUnit
    || outerWidthLayoutUnit == null
    || outerWidthLayoutUnit !== normalized.parentRegion.widthLayoutUnit
  ) issues.push(issue(
    "authored-box-width-mismatch", "measurement.availableWidthPt",
    "parent width, authored box outer width, and measurement content width must agree exactly",
  ))

  if (normalized.paragraphStyle.styleKey !== measurement.styleKey) issues.push(issue(
    "style-context-mismatch", "paragraphStyle.styleKey",
    "paragraph style key must match the measurement style key",
  ))
  measurement.runs.forEach((run, index) => {
    if (
      (run.kind === "text" || run.kind === "resolved-field" || run.kind === "generated-page-number")
      && (!nonBlank(run.styleKey) || run.styleKey !== measurement.styleKey)
    ) issues.push(issue(
      "style-context-mismatch", `measurement.runs[${index}].styleKey`,
      "styled measurement runs must pin the measurement style key", run.inlineId,
    ))
  })

  const paragraphFace = validateFonts(normalized, issues)
  const atoms = paragraphFace == null
    ? []
    : projectAtoms(
        textBlock,
        measurement,
        normalized.paragraphStyle,
        paragraphFace,
        normalized.fontFaces,
        issues,
      )
  if (issues.length > 0) return { status: "blocked", flow: null, issues }

  const has = (kind: VNextTextBlockInitialFlowAtomV1["kind"]): boolean =>
    atoms.some((atom) => atom.kind === kind)
  const capabilities: VNextTextBlockInitialFlowCapabilityReportV1 = {
    styledText: has("text") ? "ready" : "not-present",
    resolvedField: has("resolved-field") ? "ready" : "not-present",
    generatedPageNumber: has("generated-page-number") ? "ready" : "not-present",
    hardBreak: has("hard-break") ? "ready" : "not-present",
    inlineImage: has("inline-image") ? "blocked-line-box-contract" : "not-present",
    listDecoration: textBlock.role.role === "list-item" ? "blocked-decoration-contract" : "not-present",
    emptyBlock: textBlock.children.length === 0 ? "blocked-empty-layout-contract" : "not-present",
    authoredBox: "ready",
    positionedObjects: "not-present",
  }
  const geometryRequired = capabilities.inlineImage !== "not-present"
    || capabilities.listDecoration !== "not-present"
    || capabilities.emptyBlock !== "not-present"
  const canonicalFontFaces = clone(normalized.fontFaces)
    .sort((left, right) => compareVNextOrdinalStrings(left.fontFaceId, right.fontFaceId))
  const facts = {
    source: VNEXT_TEXT_BLOCK_INITIAL_FLOW_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_INITIAL_FLOW_VERSION,
    kind: "initial-text-block-flow" as const,
    layoutDisposition: geometryRequired ? "geometry-contract-required" as const : "text-subset-ready" as const,
    documentId: measurement.documentId,
    instanceRevision: measurement.instanceRevision,
    sectionId: measurement.sectionId,
    textBlockId: textBlock.id,
    role: clone(textBlock.role),
    authoredBoxPlan: clone(normalized.authoredBoxPlan),
    parentRegion: clone(normalized.parentRegion),
    measurement: clone(measurement),
    layoutUnitPolicyFingerprint: normalized.layoutUnitPolicyFingerprint,
    declaredLineHeightLayoutUnit: normalized.declaredLineHeightLayoutUnit,
    paragraphStyle: clone(normalized.paragraphStyle),
    fontFaces: canonicalFontFaces,
    atoms,
    capabilities,
    contracts: {
      canonicalDocumentMutation: false as const,
      geometryDependenciesPinned: true as const,
      processLocalClassifierAuthority: true as const,
      textOnlyAdapterEligible: !geometryRequired,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    },
  }
  const canonicalFacts = stringifyVNextCanonicalJson(facts)
  const flow = deepFreeze({
    ...facts,
    fingerprint: createVNextCompactFingerprint(canonicalFacts),
  })
  processLocalInitialFlows.set(flow, { fingerprint: flow.fingerprint, canonicalFacts })
  return { status: "classified", flow, issues: [] }
}
