import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  createVNextAuthoredBoxPlanV1,
  type VNextAuthoredBoxPlanV1,
} from "../renderer/authoredBoxContractV1.js"
import {
  TextBlockNodeV4TargetSchema,
  type InlineImageV4Target,
  type TextBlockNodeV4Target,
} from "../schema/documentV4ImageTarget.js"
import type { TextBlockRoleV4Target, TextRunStyleV4Target } from "../schema/documentV4Foundation.js"
import type {
  VNextTextBlockV4MeasurementRequest,
  VNextTextBlockV4MeasurementRun,
} from "../pagination/textBlockV4Measurement.js"
import {
  convertVNextPointToLayoutUnitV1,
  createVNextLayoutUnitPolicyV1,
  scaleVNextFontMetricToLayoutUnitV1,
  VNextPositiveLayoutUnitV1Schema,
} from "./layoutUnitPolicyV1.js"
import type {
  VNextTextBlockMultiRunFontFaceV1,
  VNextTextBlockMultiRunParagraphStyleV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import {
  inspectVNextTextBlockInitialFlowParentRegionV1,
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

export type VNextTextBlockInitialFlowAtomV1 =
  | (AtomBase & { kind: "text"; styleKey?: string; localStyle?: TextRunStyleV4Target })
  | (AtomBase & { kind: "resolved-field"; fieldKey: string; styleKey?: string })
  | (AtomBase & { kind: "generated-page-number"; generatedOwnerFingerprint: string; styleKey?: string })
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
  paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1
  fontFaces: VNextTextBlockMultiRunFontFaceV1[]
  atoms: VNextTextBlockInitialFlowAtomV1[]
  capabilities: VNextTextBlockInitialFlowCapabilityReportV1
  contracts: {
    canonicalDocumentMutation: false
    geometryDependenciesPinned: true
    textOnlyAdapterEligible: boolean
    mayPublishLayout: false
    productionBinding: false
  }
  fingerprint: string
}

export type VNextTextBlockInitialFlowIssueCodeV1 =
  | "invalid-text-block"
  | "measurement-identity-mismatch"
  | "invalid-measurement-ranges"
  | "invalid-parent-region"
  | "layout-unit-policy-mismatch"
  | "authored-box-owner-mismatch"
  | "authored-box-fingerprint-mismatch"
  | "authored-box-width-mismatch"
  | "style-context-mismatch"
  | "invalid-font-context"
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

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object" || Object.isFrozen(value)) return value
  Object.values(value).forEach((item) => deepFreeze(item))
  return Object.freeze(value)
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
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

function validateFonts(input: VNextTextBlockInitialFlowBuildInputV1): boolean {
  if (
    !nonBlank(input.paragraphStyle.styleKey)
    || input.paragraphStyle.styleKey !== input.measurement.styleKey
    || !nonBlank(input.paragraphStyle.fontFaceId)
    || !VNextPositiveLayoutUnitV1Schema.safeParse(input.paragraphStyle.fontSizeLayoutUnit).success
    || !/^[0-9A-Fa-f]{6}$/u.test(input.paragraphStyle.textColor)
  ) return false
  const ids = new Set<string>()
  for (const face of input.fontFaces) {
    if (
      !nonBlank(face.fontFaceId)
      || ids.has(face.fontFaceId)
      || !nonBlank(face.fontFamily)
      || !/^[0-9A-Fa-f]{64}$/u.test(face.fontSha256)
      || !Number.isSafeInteger(face.weight)
      || face.weight < 100
      || face.weight > 900
      || (face.style !== "normal" && face.style !== "italic")
      || !Number.isSafeInteger(face.unitsPerEm)
      || face.unitsPerEm <= 0
      || !Number.isSafeInteger(face.ascentFontUnit)
      || face.ascentFontUnit <= 0
      || !Number.isSafeInteger(face.descentFontUnit)
      || face.descentFontUnit > 0
      || !Number.isSafeInteger(face.lineGapFontUnit)
      || face.lineGapFontUnit < 0
    ) return false
    ids.add(face.fontFaceId)
  }
  const selectedFace = input.fontFaces.find((face) => face.fontFaceId === input.paragraphStyle.fontFaceId)
  return selectedFace != null
    && validScaledMetrics(selectedFace, input.paragraphStyle.fontSizeLayoutUnit)
}

function projectAtoms(
  textBlock: TextBlockNodeV4Target,
  measurement: VNextTextBlockV4MeasurementRequest,
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
      if (run.renderedText !== inline.text || !sameJson(run.localStyle, inline.style)) {
        issues.push(issue("inline-projection-mismatch", path, "text and local style must match measurement", inline.id))
        return
      }
      atoms.push({ ...base, kind: "text", ...(run.styleKey == null ? {} : { styleKey: run.styleKey }),
        ...(inline.style == null ? {} : { localStyle: clone(inline.style) }) })
      return
    }
    if (inline.type === "field-ref") {
      if (run.fieldKey !== inline.key) {
        issues.push(issue("inline-projection-mismatch", path, "field key must match measurement", inline.id))
        return
      }
      atoms.push({ ...base, kind: "resolved-field", fieldKey: inline.key,
        ...(run.styleKey == null ? {} : { styleKey: run.styleKey }) })
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
      atoms.push({ ...base, kind: "generated-page-number",
        generatedOwnerFingerprint: run.generatedOwnerFingerprint,
        ...(run.styleKey == null ? {} : { styleKey: run.styleKey }) })
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
      || !sameJson(run.frame, inline.frame)
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

export function createVNextTextBlockInitialFlowV1(
  input: VNextTextBlockInitialFlowBuildInputV1,
): VNextTextBlockInitialFlowResultV1 {
  const issues: VNextTextBlockInitialFlowIssueV1[] = []
  const parsed = TextBlockNodeV4TargetSchema.safeParse(input.textBlock)
  if (!parsed.success) parsed.error.issues.forEach((item) => issues.push(issue(
    "invalid-text-block", item.path.map(String).join(".") || "textBlock", item.message,
  )))
  const textBlock = parsed.success ? parsed.data : null
  if (textBlock == null) return { status: "blocked", flow: null, issues }

  if (
    !nonBlank(input.measurement.documentId)
    || !Number.isSafeInteger(input.measurement.instanceRevision)
    || input.measurement.instanceRevision < 0
    || !nonBlank(input.measurement.sectionId)
    || !nonBlank(input.measurement.measurementProfileId)
    || input.measurement.textBlockId !== textBlock.id
  ) issues.push(issue(
    "measurement-identity-mismatch", "measurement",
    "measurement identity, revision, and profile must match the authored TextBlock",
  ))
  if (!validMeasurementRanges(input.measurement)) issues.push(issue(
    "invalid-measurement-ranges", "measurement.runs",
    "measurement runs must cover rendered text with ordered gap-free ranges",
  ))

  const parentInspection = inspectVNextTextBlockInitialFlowParentRegionV1(input.parentRegion)
  if (parentInspection.status !== "valid") issues.push(issue(
    "invalid-parent-region", "parentRegion", parentInspection.message,
  ))
  if (input.layoutUnitPolicyFingerprint !== createVNextLayoutUnitPolicyV1().fingerprint) issues.push(issue(
    "layout-unit-policy-mismatch", "layoutUnitPolicyFingerprint",
    "Initial Flow must pin the accepted LayoutUnitPolicyV1 fingerprint",
  ))

  if (input.authoredBoxPlan.ownerNodeId !== textBlock.id || input.authoredBoxPlan.ownerNodeType !== "text-block") {
    issues.push(issue(
      "authored-box-owner-mismatch", "authoredBoxPlan",
      "authored box plan must belong to the same TextBlock",
    ))
  }
  const rebuiltBox = createVNextAuthoredBoxPlanV1({
    ownerNode: textBlock,
    availableWidthPt: input.authoredBoxPlan.outerWidthPt,
  })
  if (rebuiltBox.status !== "ready" || !sameJson(rebuiltBox.plan, input.authoredBoxPlan)) issues.push(issue(
    "authored-box-fingerprint-mismatch", "authoredBoxPlan",
    "authored box plan must equal the Core-derived plan for this TextBlock",
  ))
  const outerWidthLayoutUnit = positiveLayoutUnitFromPoint(input.authoredBoxPlan.outerWidthPt)
  const measuredContentWidthLayoutUnit = positiveLayoutUnitFromPoint(input.measurement.availableWidthPt)
  const rebuiltContentWidthLayoutUnit = rebuiltBox.status === "ready"
    ? positiveLayoutUnitFromPoint(rebuiltBox.plan.contentWidthPt)
    : null
  if (
    measuredContentWidthLayoutUnit == null
    || rebuiltContentWidthLayoutUnit == null
    || measuredContentWidthLayoutUnit !== rebuiltContentWidthLayoutUnit
    || outerWidthLayoutUnit == null
    || outerWidthLayoutUnit !== input.parentRegion.widthLayoutUnit
  ) issues.push(issue(
    "authored-box-width-mismatch", "measurement.availableWidthPt",
    "parent width, authored box outer width, and measurement content width must agree exactly",
  ))

  if (input.paragraphStyle.styleKey !== input.measurement.styleKey) issues.push(issue(
    "style-context-mismatch", "paragraphStyle.styleKey",
    "paragraph style key must match the measurement style key",
  ))
  input.measurement.runs.forEach((run, index) => {
    if (
      (run.kind === "text" || run.kind === "resolved-field" || run.kind === "generated-page-number")
      && (!nonBlank(run.styleKey) || run.styleKey !== input.measurement.styleKey)
    ) issues.push(issue(
      "style-context-mismatch", `measurement.runs[${index}].styleKey`,
      "styled measurement runs must pin the measurement style key", run.inlineId,
    ))
  })
  if (!validateFonts(input)) issues.push(issue(
    "invalid-font-context", "fontFaces",
    "paragraph style and font faces must be complete, unique, and valid",
  ))

  const atoms = projectAtoms(textBlock, input.measurement, issues)
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
  const canonicalFontFaces = clone(input.fontFaces)
    .sort((left, right) => left.fontFaceId.localeCompare(right.fontFaceId))
  const facts = {
    source: VNEXT_TEXT_BLOCK_INITIAL_FLOW_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_INITIAL_FLOW_VERSION,
    kind: "initial-text-block-flow" as const,
    layoutDisposition: geometryRequired ? "geometry-contract-required" as const : "text-subset-ready" as const,
    documentId: input.measurement.documentId,
    instanceRevision: input.measurement.instanceRevision,
    sectionId: input.measurement.sectionId,
    textBlockId: textBlock.id,
    role: clone(textBlock.role),
    authoredBoxPlan: clone(input.authoredBoxPlan),
    parentRegion: clone(input.parentRegion),
    measurement: clone(input.measurement),
    layoutUnitPolicyFingerprint: input.layoutUnitPolicyFingerprint,
    paragraphStyle: clone(input.paragraphStyle),
    fontFaces: canonicalFontFaces,
    atoms,
    capabilities,
    contracts: {
      canonicalDocumentMutation: false as const,
      geometryDependenciesPinned: true as const,
      textOnlyAdapterEligible: !geometryRequired,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    },
  }
  return {
    status: "classified",
    flow: deepFreeze({
      ...facts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
    }),
    issues: [],
  }
}
