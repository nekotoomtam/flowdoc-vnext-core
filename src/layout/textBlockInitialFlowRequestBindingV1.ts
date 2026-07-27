import { z } from "zod"
import {
  compareVNextOrdinalStrings,
  sameVNextCanonicalJson,
  stringifyVNextCanonicalJson,
} from "../fingerprint/canonicalJson.js"
import { TextRunStyleV4TargetSchema } from "../schema/documentV4Foundation.js"
import { ImageFrameV4TargetSchema } from "../schema/documentV4ImageTarget.js"
import { convertVNextPointToLayoutUnitV1 } from "./layoutUnitPolicyV1.js"
import {
  inspectVNextTextBlockInitialFlowV1,
  type VNextTextBlockInitialFlowAtomV1,
  type VNextTextBlockInitialFlowFontFaceV1,
  type VNextTextBlockInitialFlowV1,
} from "./textBlockInitialFlowInputV1.js"
import type {
  VNextTextBlockMultiRunFontFaceV1,
  VNextTextBlockMultiRunLayoutRequestV1,
} from "./textBlockMultiRunLayoutContractV1.js"

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
  layoutId: z.string().refine((value) => value.trim().length > 0, {
    message: "layout id must not be blank",
  }),
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

export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_SOURCE =
  "vnext-text-block-initial-flow-request-binding-v1" as const
export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_VERSION = 1 as const

const BINDING_METADATA_UNAVAILABLE = "unavailable"

export type VNextTextBlockInitialFlowRequestBindingIssueCodeV1 =
  | "invalid-binding-input"
  | "invalid-initial-flow"
  | "initial-flow-capability-required"
  | "request-context-mismatch"

export interface VNextTextBlockInitialFlowRequestBindingIssueV1 {
  code: VNextTextBlockInitialFlowRequestBindingIssueCodeV1
  severity: "error"
  path: string
  message: string
}

export type VNextTextBlockInitialFlowRequestBindingResultV1 =
  | {
      status: "accepted"
      source: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_VERSION
      initialFlow: VNextTextBlockInitialFlowV1
      request: VNextTextBlockMultiRunLayoutRequestV1
      initialFlowFingerprint: string
      layoutId: string
      contentWidthLayoutUnit: number
      issues: []
    }
  | {
      status: "blocked"
      source: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_SOURCE
      contractVersion: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_VERSION
      initialFlow: null
      request: null
      initialFlowFingerprint: string
      layoutId: string
      contentWidthLayoutUnit: null
      issues: VNextTextBlockInitialFlowRequestBindingIssueV1[]
    }

function clone<T>(value: T): T {
  return JSON.parse(stringifyVNextCanonicalJson(value)) as T
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

interface BindingEnvelope {
  initialFlow: unknown
  request: unknown
}

interface DataProperty {
  found: boolean
  value: unknown
  descriptor: PropertyDescriptor | null
}

function dataProperty(value: object, key: PropertyKey): DataProperty {
  const descriptor = Object.getOwnPropertyDescriptor(value, key)
  return descriptor != null && Object.hasOwn(descriptor, "value")
    ? { found: true, value: descriptor.value, descriptor }
    : { found: false, value: undefined, descriptor: null }
}

function safeEnvelope(input: unknown): BindingEnvelope | null {
  try {
    if (input == null || typeof input !== "object") return null
    const prototype = Object.getPrototypeOf(input)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(input).length !== 0) return null
    const keys = Reflect.ownKeys(input)
    if (
      keys.length !== 2
      || !keys.includes("initialFlow")
      || !keys.includes("request")
    ) return null
    const initialFlow = dataProperty(input, "initialFlow")
    const request = dataProperty(input, "request")
    return initialFlow.found && request.found
      ? { initialFlow: initialFlow.value, request: request.value }
      : null
  } catch {
    return null
  }
}

const INVALID_CONTAINED_DATA = Symbol("invalid-contained-data")

interface ContainedArrayShape {
  length: number
  keys: string[]
}

function containedArrayShape(value: object): ContainedArrayShape | null {
  if (Object.getPrototypeOf(value) !== Array.prototype) return null
  const ownKeys = Reflect.ownKeys(value)
  if (ownKeys.length === 0 || ownKeys[ownKeys.length - 1] !== "length") return null
  const lengthDescriptor = dataProperty(value, "length")
  if (
    !lengthDescriptor.found
    || typeof lengthDescriptor.value !== "number"
    || !Number.isSafeInteger(lengthDescriptor.value)
    || lengthDescriptor.value < 0
    || lengthDescriptor.value > 0xFFFF_FFFF
    || lengthDescriptor.descriptor?.writable !== true
    || lengthDescriptor.descriptor?.enumerable !== false
    || lengthDescriptor.descriptor?.configurable !== false
    || ownKeys.length !== lengthDescriptor.value + 1
  ) return null
  for (let index = 0; index < ownKeys.length - 1; index += 1) {
    const key = ownKeys[index]
    if (typeof key !== "string" || key !== String(index)) return null
    const descriptor = dataProperty(value, key)
    if (
      !descriptor.found
      || descriptor.descriptor?.writable !== true
      || descriptor.descriptor?.enumerable !== true
      || descriptor.descriptor?.configurable !== true
    ) return null
  }
  return { length: lengthDescriptor.value, keys: ownKeys.slice(0, -1) as string[] }
}

function cloneContainedData(
  value: unknown,
  ancestors: Set<object> = new Set<object>(),
): unknown | typeof INVALID_CONTAINED_DATA {
  if (
    value == null
    || typeof value === "string"
    || typeof value === "boolean"
    || typeof value === "undefined"
  ) return value
  if (typeof value === "number") return Number.isFinite(value) ? value : INVALID_CONTAINED_DATA
  if (typeof value !== "object" || ancestors.has(value)) return INVALID_CONTAINED_DATA

  const isArray = Array.isArray(value)
  const prototype = Object.getPrototypeOf(value)
  if (!isArray && prototype !== Object.prototype && prototype !== null) return INVALID_CONTAINED_DATA
  const arrayShape = isArray ? containedArrayShape(value) : null
  if (isArray && arrayShape == null) return INVALID_CONTAINED_DATA

  ancestors.add(value)
  const output: unknown[] | Record<string, unknown> = isArray
    ? new Array<unknown>((arrayShape as ContainedArrayShape).length)
    : {}
  const keys = isArray ? (arrayShape as ContainedArrayShape).keys : Reflect.ownKeys(value)
  for (const key of keys) {
    const descriptor = dataProperty(value, key)
    if (!descriptor.found || typeof key === "symbol") {
      ancestors.delete(value)
      return INVALID_CONTAINED_DATA
    }
    if (descriptor.descriptor?.enumerable !== true) continue
    const cloned = cloneContainedData(descriptor.value, ancestors)
    if (cloned === INVALID_CONTAINED_DATA) {
      ancestors.delete(value)
      return INVALID_CONTAINED_DATA
    }
    Object.defineProperty(output, key, {
      value: cloned,
      enumerable: true,
      configurable: true,
      writable: true,
    })
  }
  ancestors.delete(value)
  return output
}

function safeLegacyRequest(request: unknown): VNextTextBlockMultiRunLayoutRequestV1 | null {
  try {
    const contained = cloneContainedData(request)
    if (contained === INVALID_CONTAINED_DATA) return null
    const parsed = LegacyRequestSchema.safeParse(contained)
    if (!parsed.success || !sameVNextCanonicalJson(contained, parsed.data)) return null
    return contained as VNextTextBlockMultiRunLayoutRequestV1
  } catch {
    return null
  }
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object" || Object.isFrozen(value)) return value
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) deepFreeze(descriptor.value)
  }
  return Object.freeze(value)
}

function blocked(
  initialFlowFingerprint: string,
  layoutId: string,
  code: VNextTextBlockInitialFlowRequestBindingIssueCodeV1,
  path: string,
  message: string,
): VNextTextBlockInitialFlowRequestBindingResultV1 {
  const issues: VNextTextBlockInitialFlowRequestBindingIssueV1[] = [{
    code,
    severity: "error",
    path,
    message,
  }]
  Object.freeze(issues)
  return Object.freeze({
    status: "blocked" as const,
    source: VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_VERSION,
    initialFlow: null,
    request: null,
    initialFlowFingerprint,
    layoutId,
    contentWidthLayoutUnit: null,
    issues,
  })
}

export function inspectVNextTextBlockInitialFlowRequestBindingV1(
  input: unknown,
): VNextTextBlockInitialFlowRequestBindingResultV1 {
  const envelope = safeEnvelope(input)
  if (envelope == null) return blocked(
    BINDING_METADATA_UNAVAILABLE,
    BINDING_METADATA_UNAVAILABLE,
    "invalid-binding-input",
    "input",
    "binding input must be a strict object containing only initialFlow and request",
  )

  let inspection: ReturnType<typeof inspectVNextTextBlockInitialFlowV1> | null = null
  try {
    inspection = inspectVNextTextBlockInitialFlowV1(envelope.initialFlow)
  } catch {
    inspection = null
  }
  const request = safeLegacyRequest(envelope.request)
  const initialFlowFingerprint = inspection?.status === "valid"
    ? inspection.fingerprint
    : BINDING_METADATA_UNAVAILABLE
  const layoutId = request?.layoutId ?? BINDING_METADATA_UNAVAILABLE

  if (inspection?.status !== "valid") return blocked(
    initialFlowFingerprint,
    layoutId,
    "invalid-initial-flow",
    "initialFlow",
    `Initial Flow must be the exact immutable process-local Core capability object: ${
      inspection?.message ?? "inspection was unavailable"
    }`,
  )
  const flow = envelope.initialFlow as VNextTextBlockInitialFlowV1
  if (flow.layoutDisposition !== "text-subset-ready" || !flow.contracts.textOnlyAdapterEligible) {
    return blocked(
      flow.fingerprint,
      layoutId,
      "initial-flow-capability-required",
      "initialFlow.layoutDisposition",
      "legacy MR1 layout accepts only the explicitly classified text subset",
    )
  }
  if (request == null) return blocked(
    flow.fingerprint,
    layoutId,
    "request-context-mismatch",
    "request",
    "request must satisfy the strict runtime contract",
  )

  const contentWidth = convertVNextPointToLayoutUnitV1(flow.authoredBoxPlan.contentWidthPt)
  if (
    !sameVNextCanonicalJson(flow.measurement, request.measurement)
    || flow.layoutUnitPolicyFingerprint !== request.layoutUnitPolicyFingerprint
    || flow.declaredLineHeightLayoutUnit !== request.declaredLineHeightLayoutUnit
    || !sameVNextCanonicalJson(flow.paragraphStyle, request.paragraphStyle)
    || !sameVNextCanonicalJson(
      usedLegacyFontFaces(flow),
      canonicalFontFaces(request.fontFaces),
    )
    || !shapingTypographyMatchesFlow(flow, request)
    || contentWidth.status !== "accepted"
    || contentWidth.layoutUnit !== request.availableWidthLayoutUnit
  ) return blocked(
    flow.fingerprint,
    request.layoutId,
    "request-context-mismatch",
    "request",
    "request measurement, width, line height, resolved run typography, and layout policy must equal Initial Flow",
  )

  return Object.freeze({
    status: "accepted" as const,
    source: VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_INITIAL_FLOW_REQUEST_BINDING_VERSION,
    initialFlow: flow,
    request: deepFreeze(request),
    initialFlowFingerprint: flow.fingerprint,
    layoutId: request.layoutId,
    contentWidthLayoutUnit: contentWidth.layoutUnit,
    issues: Object.freeze([]) as [],
  })
}
