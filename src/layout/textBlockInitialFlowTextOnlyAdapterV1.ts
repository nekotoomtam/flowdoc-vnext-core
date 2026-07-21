import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  compareVNextOrdinalStrings,
  sameVNextCanonicalJson,
  stringifyVNextCanonicalJson,
} from "../fingerprint/canonicalJson.js"
import { TextRunStyleV4TargetSchema } from "../schema/documentV4Foundation.js"
import { ImageFrameV4TargetSchema } from "../schema/documentV4ImageTarget.js"
import { convertVNextPointToLayoutUnitV1 } from "./layoutUnitPolicyV1.js"
import type { VNextTextBlockAcceptedMultiRunLayoutV1 } from "./textBlockMultiRunIncrementalContractV1.js"
import {
  inspectVNextTextBlockInitialFlowV1,
  type VNextTextBlockInitialFlowAtomV1,
  type VNextTextBlockInitialFlowFontFaceV1,
  type VNextTextBlockInitialFlowInspectionV1,
  type VNextTextBlockInitialFlowV1,
} from "./textBlockInitialFlowInputV1.js"
import type {
  VNextTextBlockMultiRunFontFaceV1,
  VNextTextBlockMultiRunLayoutRequestV1,
} from "./textBlockMultiRunLayoutContractV1.js"
import { acceptVNextTextBlockMultiRunLayoutV1 } from "./textBlockMultiRunLayoutV1.js"

const MeasurementTextRunSchema = z.object({
  inlineId: z.string(),
  kind: z.literal("text"),
  renderStartOffset: z.number().finite(),
  renderEndOffset: z.number().finite(),
  renderedText: z.string(),
  styleKey: z.string().optional(),
  localStyle: TextRunStyleV4TargetSchema.optional(),
}).strict()

const MeasurementResolvedFieldRunSchema = z.object({
  inlineId: z.string(),
  kind: z.literal("resolved-field"),
  renderStartOffset: z.number().finite(),
  renderEndOffset: z.number().finite(),
  renderedText: z.string(),
  fieldKey: z.string().optional(),
  styleKey: z.string().optional(),
}).strict()

const MeasurementGeneratedPageNumberRunSchema = z.object({
  inlineId: z.string(),
  kind: z.literal("generated-page-number"),
  renderStartOffset: z.number().finite(),
  renderEndOffset: z.number().finite(),
  renderedText: z.string(),
  generatedOwnerFingerprint: z.string().optional(),
  styleKey: z.string().optional(),
}).strict()

const MeasurementHardBreakRunSchema = z.object({
  inlineId: z.string(),
  kind: z.literal("hard-break"),
  renderStartOffset: z.number().finite(),
  renderEndOffset: z.number().finite(),
  renderedText: z.string(),
}).strict()

const MeasurementInlineImageRunSchema = z.object({
  inlineId: z.string(),
  kind: z.literal("inline-image"),
  renderStartOffset: z.number().finite(),
  renderEndOffset: z.number().finite(),
  renderedText: z.string(),
  assetId: z.string().min(1).nullable().optional(),
  frame: ImageFrameV4TargetSchema.optional(),
}).strict()

const MeasurementSchema = z.object({
  documentId: z.string(),
  instanceRevision: z.number().finite(),
  sectionId: z.string(),
  textBlockId: z.string(),
  availableWidthPt: z.number().finite(),
  measurementProfileId: z.string(),
  styleKey: z.string(),
  renderedText: z.string(),
  runs: z.array(z.discriminatedUnion("kind", [
    MeasurementTextRunSchema,
    MeasurementResolvedFieldRunSchema,
    MeasurementGeneratedPageNumberRunSchema,
    MeasurementHardBreakRunSchema,
    MeasurementInlineImageRunSchema,
  ])),
}).strict()

const ParagraphStyleSchema = z.object({
  styleKey: z.string(),
  fontFaceId: z.string(),
  fontSizeLayoutUnit: z.number().finite(),
  textColor: z.string(),
}).strict()

const FontFaceSchema = z.object({
  fontFaceId: z.string(),
  fontFamily: z.string(),
  fontSha256: z.string(),
  weight: z.number().finite(),
  style: z.enum(["normal", "italic"]),
  unitsPerEm: z.number().finite(),
  ascentFontUnit: z.number().finite(),
  descentFontUnit: z.number().finite(),
  lineGapFontUnit: z.number().finite(),
}).strict()

const ShapingClusterSchema = z.object({
  index: z.number().finite(),
  renderStartOffset: z.number().finite(),
  renderEndOffset: z.number().finite(),
  advanceLayoutUnit: z.number().finite(),
}).strict()

const ShapingRunSchema = z.object({
  shapingRunId: z.string(),
  renderStartOffset: z.number().finite(),
  renderEndOffset: z.number().finite(),
  text: z.string(),
  styleKey: z.string(),
  fontFaceId: z.string(),
  fontSizeLayoutUnit: z.number().finite(),
  textColor: z.string(),
  direction: z.literal("ltr"),
  baselineShiftLayoutUnit: z.literal(0),
  features: z.array(z.string()),
  clusters: z.array(ShapingClusterSchema),
}).strict()

const LineSchema = z.object({
  index: z.number().finite(),
  renderStartOffset: z.number().finite(),
  renderEndOffset: z.number().finite(),
}).strict()

const LegacyRequestSchema = z.object({
  layoutId: z.string(),
  measurement: MeasurementSchema,
  layoutUnitPolicyFingerprint: z.string(),
  availableWidthLayoutUnit: z.number().finite(),
  declaredLineHeightLayoutUnit: z.number().finite(),
  paragraphStyle: ParagraphStyleSchema,
  fontFaces: z.array(FontFaceSchema),
  shapingRuns: z.array(ShapingRunSchema),
  breakOffsets: z.array(z.number().finite()),
  lines: z.array(LineSchema),
  bindProductionLayout: z.boolean().optional(),
}).strict()

const AdapterEnvelopeSchema = z.object({
  initialFlow: z.unknown(),
  legacyRequest: z.unknown(),
}).strict()

export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_SOURCE =
  "vnext-text-block-initial-flow-text-only-adapter-v1" as const
export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_VERSION = 1 as const

const ADAPTER_METADATA_UNAVAILABLE = "unavailable"

export type VNextTextBlockInitialFlowTextOnlyAdapterIssueCodeV1 =
  | "invalid-initial-flow"
  | "initial-flow-capability-required"
  | "legacy-context-mismatch"
  | "legacy-layout-rejected"

export interface VNextTextBlockInitialFlowTextOnlyAdapterIssueV1 {
  code: VNextTextBlockInitialFlowTextOnlyAdapterIssueCodeV1
  severity: "error"
  path: string
  message: string
}

interface AdapterBase {
  source: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_VERSION
  initialFlowFingerprint: string
  layoutId: string
  contracts: {
    legacyTextSubsetOnly: true
    completeGeometryClassified: true
    rendererMayMeasureText: false
    rendererMayRelayout: false
    mayPublishLayout: false
    productionBinding: false
  }
}

export type VNextTextBlockInitialFlowTextOnlyAdapterResultV1 =
  | (AdapterBase & {
      status: "accepted-text-subset"
      layout: VNextTextBlockAcceptedMultiRunLayoutV1
      fingerprint: string
      issues: []
    })
  | (AdapterBase & {
      status: "blocked"
      layout: null
      fingerprint: null
      issues: VNextTextBlockInitialFlowTextOnlyAdapterIssueV1[]
    })

function clone<T>(value: T): T {
  return JSON.parse(stringifyVNextCanonicalJson(value)) as T
}

function compact(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function canonicalFontFaces(
  fontFaces: readonly VNextTextBlockMultiRunFontFaceV1[],
): VNextTextBlockMultiRunFontFaceV1[] {
  return [...clone(fontFaces)]
    .sort((left, right) => compareVNextOrdinalStrings(left.fontFaceId, right.fontFaceId))
}

function legacyFontFace(
  face: VNextTextBlockInitialFlowFontFaceV1,
): VNextTextBlockMultiRunFontFaceV1 {
  const { fontFamilyKey: _fontFamilyKey, ...legacyFace } = face
  return legacyFace
}

function textBearingAtom(
  atom: VNextTextBlockInitialFlowAtomV1,
): atom is Extract<
  VNextTextBlockInitialFlowAtomV1,
  { kind: "text" | "resolved-field" | "generated-page-number" }
> {
  return atom.kind === "text" || atom.kind === "resolved-field" || atom.kind === "generated-page-number"
}

function shapingTypographyMatchesFlow(
  flow: VNextTextBlockInitialFlowV1,
  request: VNextTextBlockMultiRunLayoutRequestV1,
): boolean {
  const faceById = new Map(request.fontFaces.map((face) => [face.fontFaceId, face]))
  return request.shapingRuns.every((run) => {
    const coveredAtoms = flow.atoms.filter(textBearingAtom).filter((atom) => (
      atom.renderStartOffset < run.renderEndOffset
      && atom.renderEndOffset > run.renderStartOffset
    ))
    return coveredAtoms.length > 0 && coveredAtoms.every((atom) => {
      const style = atom.resolvedGeometryStyle
      const face = faceById.get(run.fontFaceId)
      return run.styleKey === style.effectiveShapingStyleKey
        && run.fontFaceId === style.fontFaceId
        && run.fontSizeLayoutUnit === style.fontSizeLayoutUnit
        && run.textColor === style.textColor
        && face?.weight === style.fontWeight
        && face.style === style.fontStyle
    })
  })
}

function usedLegacyFontFaces(
  flow: VNextTextBlockInitialFlowV1,
): VNextTextBlockMultiRunFontFaceV1[] {
  const usedFaceIds = new Set<string>([
    flow.paragraphStyle.fontFaceId,
    ...flow.atoms.filter(textBearingAtom).map((atom) => atom.resolvedGeometryStyle.fontFaceId),
  ])
  return flow.fontFaces
    .filter((face) => usedFaceIds.has(face.fontFaceId))
    .map(legacyFontFace)
    .sort((left, right) => compareVNextOrdinalStrings(left.fontFaceId, right.fontFaceId))
}

function base(initialFlowFingerprint: string, layoutId: string): AdapterBase {
  return {
    source: VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_VERSION,
    initialFlowFingerprint,
    layoutId,
    contracts: {
      legacyTextSubsetOnly: true,
      completeGeometryClassified: true,
      rendererMayMeasureText: false,
      rendererMayRelayout: false,
      mayPublishLayout: false,
      productionBinding: false,
    },
  }
}

function blocked(
  initialFlowFingerprint: string,
  layoutId: string,
  code: VNextTextBlockInitialFlowTextOnlyAdapterIssueCodeV1,
  path: string,
  message: string,
): VNextTextBlockInitialFlowTextOnlyAdapterResultV1 {
  return {
    ...base(initialFlowFingerprint, layoutId),
    status: "blocked",
    layout: null,
    fingerprint: null,
    issues: [{ code, severity: "error", path, message }],
  }
}

interface AdapterEnvelope {
  initialFlow: unknown
  legacyRequest: unknown
}

function safeEnvelope(input: unknown): AdapterEnvelope | null {
  try {
    if (input == null || typeof input !== "object" || Array.isArray(input)) return null
    const keys = Object.keys(input)
    if (
      keys.length !== 2
      || !Object.hasOwn(input, "initialFlow")
      || !Object.hasOwn(input, "legacyRequest")
    ) return null
    const parsed = AdapterEnvelopeSchema.safeParse(input)
    return parsed.success ? parsed.data as AdapterEnvelope : null
  } catch {
    return null
  }
}

function safeInspection(initialFlow: unknown): VNextTextBlockInitialFlowInspectionV1 | null {
  try {
    return inspectVNextTextBlockInitialFlowV1(initialFlow)
  } catch {
    return null
  }
}

function safeLegacyRequest(request: unknown): VNextTextBlockMultiRunLayoutRequestV1 | null {
  try {
    const parsed = LegacyRequestSchema.safeParse(request)
    return parsed.success ? parsed.data as VNextTextBlockMultiRunLayoutRequestV1 : null
  } catch {
    return null
  }
}

export function adaptVNextTextBlockInitialFlowToLegacyLayoutV1(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  legacyRequest: VNextTextBlockMultiRunLayoutRequestV1
}): VNextTextBlockInitialFlowTextOnlyAdapterResultV1
export function adaptVNextTextBlockInitialFlowToLegacyLayoutV1(
  input: unknown,
): VNextTextBlockInitialFlowTextOnlyAdapterResultV1
export function adaptVNextTextBlockInitialFlowToLegacyLayoutV1(
  input: unknown,
): VNextTextBlockInitialFlowTextOnlyAdapterResultV1 {
  const envelope = safeEnvelope(input)
  if (envelope == null) return blocked(
    ADAPTER_METADATA_UNAVAILABLE,
    ADAPTER_METADATA_UNAVAILABLE,
    "invalid-initial-flow",
    "input",
    "adapter input must be a strict object containing only initialFlow and legacyRequest",
  )

  const inspection = safeInspection(envelope.initialFlow)
  const request = safeLegacyRequest(envelope.legacyRequest)
  const initialFlowFingerprint = inspection?.status === "valid"
    ? inspection.fingerprint
    : ADAPTER_METADATA_UNAVAILABLE
  const layoutId = request?.layoutId ?? ADAPTER_METADATA_UNAVAILABLE

  if (inspection?.status !== "valid") return blocked(
    initialFlowFingerprint, layoutId, "invalid-initial-flow", "initialFlow",
    `Initial Flow must be the exact immutable process-local Core capability object: ${
      inspection?.message ?? "inspection was unavailable"
    }`,
  )
  const flow = envelope.initialFlow as VNextTextBlockInitialFlowV1
  if (flow.layoutDisposition !== "text-subset-ready" || !flow.contracts.textOnlyAdapterEligible) {
    return blocked(
      flow.fingerprint, layoutId, "initial-flow-capability-required", "initialFlow.layoutDisposition",
      "legacy MR1 layout accepts only the explicitly classified text subset",
    )
  }

  if (request == null) return blocked(
    flow.fingerprint,
    layoutId,
    "legacy-context-mismatch",
    "legacyRequest",
    "legacy request must satisfy the strict runtime contract",
  )

  const contentWidth = convertVNextPointToLayoutUnitV1(flow.authoredBoxPlan.contentWidthPt)
  if (
    !sameVNextCanonicalJson(flow.measurement, request.measurement)
    || flow.layoutUnitPolicyFingerprint !== request.layoutUnitPolicyFingerprint
    || flow.declaredLineHeightLayoutUnit !== request.declaredLineHeightLayoutUnit
    || !sameVNextCanonicalJson(flow.paragraphStyle, request.paragraphStyle)
    || !sameVNextCanonicalJson(usedLegacyFontFaces(flow), canonicalFontFaces(request.fontFaces))
    || !shapingTypographyMatchesFlow(flow, request)
    || contentWidth.status !== "accepted"
    || contentWidth.layoutUnit !== request.availableWidthLayoutUnit
  ) return blocked(
    flow.fingerprint, request.layoutId, "legacy-context-mismatch", "legacyRequest",
    "legacy request measurement, width, line height, resolved run typography, and layout policy must equal Initial Flow",
  )

  const layout = acceptVNextTextBlockMultiRunLayoutV1(request)
  if (layout.status !== "accepted") return blocked(
    flow.fingerprint, request.layoutId, "legacy-layout-rejected", "legacyRequest",
    `legacy MR1 layout rejected the request: ${layout.issues.map((item) => item.code).join(", ")}`,
  )
  const facts = {
    ...base(flow.fingerprint, request.layoutId),
    status: "accepted-text-subset" as const,
    layout: clone(layout),
  }
  return {
    ...facts,
    fingerprint: compact(facts),
    issues: [],
  }
}
