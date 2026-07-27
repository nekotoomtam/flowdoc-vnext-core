import {
  convertVNextPointToLayoutUnitV1,
  type TextRunStyleV4Target,
  type UnitValueV4Target,
  type VNextTextBlockV4MeasurementRequest,
  type VNextTextBlockV4MeasurementRun,
} from "@flowdoc/vnext-core"
import { createFlowDocTextEngineMultiRunIssueInternal as issue } from
  "./multiRunEvidenceInternals.js"
import type { FlowDocTextEngineFlowEvidenceInputV2 } from
  "./multiRunFlowEvidenceContractV2.js"
import type {
  FlowDocTextEngineMultiRunFontFaceV1,
  FlowDocTextEngineMultiRunLayoutIssueV1,
  FlowDocTextEngineMultiRunParagraphStyleV1,
} from "./multiRunLayoutContract.js"

const COMPACT_FINGERPRINT = /^sha256:[a-f0-9]{64}$/u
const RAW_SHA256 = /^[a-f0-9]{64}$/u
const HEX_COLOR = /^[0-9A-Fa-f]{6}$/u

type DataRecord = Record<string, unknown>

export type FlowDocTextEngineFlowEvidencePreflightResultV2 =
  | {
      status: "accepted"
      layout: FlowDocTextEngineFlowEvidenceInputV2
      availableWidthLayoutUnit: number
      issues: []
    }
  | {
      status: "blocked"
      layout: null
      availableWidthLayoutUnit: null
      issues: FlowDocTextEngineMultiRunLayoutIssueV1[]
    }

function dataRecord(value: unknown): DataRecord | null {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) return null
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    const output: DataRecord = {}
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== "string") return null
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      output[key] = descriptor.value
    }
    return output
  } catch {
    return null
  }
}

function exactRecord(
  value: unknown,
  requiredKeys: readonly string[],
  optionalKeys: readonly string[] = [],
): DataRecord | null {
  const record = dataRecord(value)
  if (record == null) return null
  const keys = Object.keys(record)
  if (
    keys.length < requiredKeys.length
    || requiredKeys.some((key) => !Object.hasOwn(record, key))
    || keys.some((key) => !requiredKeys.includes(key) && !optionalKeys.includes(key))
  ) return null
  return record
}

function denseDataArray(value: unknown): unknown[] | null {
  try {
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) return null
    const keys = Reflect.ownKeys(value)
    if (keys.length === 0 || keys[keys.length - 1] !== "length") return null
    const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length")
    if (
      lengthDescriptor == null
      || !Object.hasOwn(lengthDescriptor, "value")
      || typeof lengthDescriptor.value !== "number"
      || !Number.isSafeInteger(lengthDescriptor.value)
      || lengthDescriptor.value < 0
      || lengthDescriptor.value > 0xFFFF_FFFF
      || lengthDescriptor.writable !== true
      || lengthDescriptor.enumerable !== false
      || lengthDescriptor.configurable !== false
      || keys.length !== lengthDescriptor.value + 1
    ) return null
    const output: unknown[] = []
    for (let index = 0; index < lengthDescriptor.value; index += 1) {
      if (keys[index] !== String(index)) return null
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.writable !== true
        || descriptor.enumerable !== true
        || descriptor.configurable !== true
      ) return null
      output.push(descriptor.value)
    }
    return output
  } catch {
    return null
  }
}

function nonBlank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function safeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value)
}

function unitValue(value: unknown, positive: boolean): UnitValueV4Target | null {
  const record = exactRecord(value, ["value", "unit"])
  if (
    record == null
    || !finiteNumber(record.value)
    || (positive && record.value <= 0)
    || (record.unit !== "pt" && record.unit !== "mm")
  ) return null
  return { value: record.value, unit: record.unit }
}

function localStyle(value: unknown): TextRunStyleV4Target | null {
  const record = exactRecord(value, [], [
    "fontSize",
    "fontFamilyKey",
    "textColor",
    "fontWeight",
    "fontStyle",
    "textDecoration",
    "strikethrough",
  ])
  if (record == null) return null
  const output: TextRunStyleV4Target = {}
  if (Object.hasOwn(record, "fontSize")) {
    const fontSize = unitValue(record.fontSize, true)
    if (fontSize == null) return null
    output.fontSize = fontSize
  }
  if (Object.hasOwn(record, "fontFamilyKey")) {
    if (!nonBlank(record.fontFamilyKey)) return null
    output.fontFamilyKey = record.fontFamilyKey
  }
  if (Object.hasOwn(record, "textColor")) {
    if (typeof record.textColor !== "string" || !HEX_COLOR.test(record.textColor)) return null
    output.textColor = record.textColor
  }
  if (Object.hasOwn(record, "fontWeight")) {
    if (record.fontWeight !== "normal" && record.fontWeight !== "bold") return null
    output.fontWeight = record.fontWeight
  }
  if (Object.hasOwn(record, "fontStyle")) {
    if (record.fontStyle !== "normal" && record.fontStyle !== "italic") return null
    output.fontStyle = record.fontStyle
  }
  if (Object.hasOwn(record, "textDecoration")) {
    if (record.textDecoration !== "none" && record.textDecoration !== "underline") return null
    output.textDecoration = record.textDecoration
  }
  if (Object.hasOwn(record, "strikethrough")) {
    if (typeof record.strikethrough !== "boolean") return null
    output.strikethrough = record.strikethrough
  }
  return output
}

function imageCrop(value: unknown) {
  const record = exactRecord(value, ["x", "y", "width", "height"])
  if (
    record == null
    || !finiteNumber(record.x)
    || !finiteNumber(record.y)
    || !finiteNumber(record.width)
    || !finiteNumber(record.height)
    || record.x < 0
    || record.x > 1
    || record.y < 0
    || record.y > 1
    || record.width <= 0
    || record.width > 1
    || record.height <= 0
    || record.height > 1
    || record.x + record.width > 1
    || record.y + record.height > 1
  ) return null
  return {
    x: record.x,
    y: record.y,
    width: record.width,
    height: record.height,
  }
}

function imageFrame(value: unknown): NonNullable<VNextTextBlockV4MeasurementRun["frame"]> | null {
  const record = exactRecord(value, ["width", "height", "fit"], ["crop"])
  if (record == null || (record.fit !== "contain" && record.fit !== "cover")) return null
  const width = unitValue(record.width, true)
  const height = unitValue(record.height, true)
  if (width == null || height == null) return null
  if (Object.hasOwn(record, "crop")) {
    const crop = imageCrop(record.crop)
    if (crop == null) return null
    return { width, height, fit: record.fit, crop }
  }
  return { width, height, fit: record.fit }
}

function sourceRun(value: unknown): VNextTextBlockV4MeasurementRun | null {
  const record = dataRecord(value)
  if (record == null || typeof record.kind !== "string") return null
  const common = [
    "inlineId",
    "kind",
    "renderStartOffset",
    "renderEndOffset",
    "renderedText",
  ] as const
  let exact: DataRecord | null
  switch (record.kind) {
    case "text":
      exact = exactRecord(value, common, ["styleKey", "localStyle"])
      break
    case "resolved-field":
      exact = exactRecord(value, [...common, "fieldKey"], ["styleKey"])
      break
    case "generated-page-number":
      exact = exactRecord(value, [...common, "generatedOwnerFingerprint"], ["styleKey"])
      break
    case "hard-break":
      exact = exactRecord(value, common)
      break
    case "inline-image":
      exact = exactRecord(value, [...common, "assetId", "frame"])
      break
    default:
      return null
  }
  if (
    exact == null
    || !nonBlank(exact.inlineId)
    || !safeInteger(exact.renderStartOffset)
    || !safeInteger(exact.renderEndOffset)
    || typeof exact.renderedText !== "string"
  ) return null
  const output: VNextTextBlockV4MeasurementRun = {
    inlineId: exact.inlineId,
    kind: exact.kind as VNextTextBlockV4MeasurementRun["kind"],
    renderStartOffset: exact.renderStartOffset,
    renderEndOffset: exact.renderEndOffset,
    renderedText: exact.renderedText,
  }
  if (Object.hasOwn(exact, "styleKey")) {
    if (!nonBlank(exact.styleKey)) return null
    output.styleKey = exact.styleKey
  }
  if (exact.kind === "text" && Object.hasOwn(exact, "localStyle")) {
    const style = localStyle(exact.localStyle)
    if (style == null) return null
    output.localStyle = style
  }
  if (exact.kind === "resolved-field") {
    if (!nonBlank(exact.fieldKey)) return null
    output.fieldKey = exact.fieldKey
  }
  if (exact.kind === "generated-page-number") {
    if (
      typeof exact.generatedOwnerFingerprint !== "string"
      || !COMPACT_FINGERPRINT.test(exact.generatedOwnerFingerprint)
    ) return null
    output.generatedOwnerFingerprint = exact.generatedOwnerFingerprint
  }
  if (exact.kind === "hard-break" && exact.renderedText !== "\n") return null
  if (exact.kind === "inline-image") {
    if (
      exact.renderedText !== "\uFFFC"
      || (exact.assetId !== null && !nonBlank(exact.assetId))
    ) return null
    const frame = imageFrame(exact.frame)
    if (frame == null) return null
    output.assetId = exact.assetId as string | null
    output.frame = frame
  }
  return output
}

function measurement(value: unknown): VNextTextBlockV4MeasurementRequest | null {
  const record = exactRecord(value, [
    "documentId",
    "instanceRevision",
    "sectionId",
    "textBlockId",
    "availableWidthPt",
    "measurementProfileId",
    "styleKey",
    "renderedText",
    "runs",
  ])
  const runValues = record == null ? null : denseDataArray(record.runs)
  if (
    record == null
    || runValues == null
    || !nonBlank(record.documentId)
    || !safeInteger(record.instanceRevision)
    || record.instanceRevision < 0
    || !nonBlank(record.sectionId)
    || !nonBlank(record.textBlockId)
    || !finiteNumber(record.availableWidthPt)
    || !nonBlank(record.measurementProfileId)
    || !nonBlank(record.styleKey)
    || typeof record.renderedText !== "string"
  ) return null
  const runs: VNextTextBlockV4MeasurementRun[] = []
  for (const valueItem of runValues) {
    const run = sourceRun(valueItem)
    if (run == null) return null
    runs.push(run)
  }
  return {
    documentId: record.documentId,
    instanceRevision: record.instanceRevision,
    sectionId: record.sectionId,
    textBlockId: record.textBlockId,
    availableWidthPt: record.availableWidthPt,
    measurementProfileId: record.measurementProfileId,
    styleKey: record.styleKey,
    renderedText: record.renderedText,
    runs,
  }
}

function paragraphStyle(value: unknown): FlowDocTextEngineMultiRunParagraphStyleV1 | null {
  const record = exactRecord(value, ["styleKey", "runStyle"])
  const run = record == null
    ? null
    : exactRecord(record.runStyle, [
        "fontFamilyKey",
        "fontSize",
        "textColor",
        "fontWeight",
        "fontStyle",
        "textDecoration",
        "strikethrough",
      ])
  const fontSize = run == null ? null : unitValue(run.fontSize, true)
  if (
    record == null
    || run == null
    || fontSize == null
    || !nonBlank(record.styleKey)
    || !nonBlank(run.fontFamilyKey)
    || typeof run.textColor !== "string"
    || !HEX_COLOR.test(run.textColor)
    || (run.fontWeight !== "normal" && run.fontWeight !== "bold")
    || (run.fontStyle !== "normal" && run.fontStyle !== "italic")
    || run.textDecoration !== "none"
    || run.strikethrough !== false
  ) return null
  return {
    styleKey: record.styleKey,
    runStyle: {
      fontFamilyKey: run.fontFamilyKey,
      fontSize,
      textColor: run.textColor,
      fontWeight: run.fontWeight,
      fontStyle: run.fontStyle,
      textDecoration: run.textDecoration,
      strikethrough: run.strikethrough,
    },
  }
}

function fontFace(value: unknown): FlowDocTextEngineMultiRunFontFaceV1 | null {
  const record = exactRecord(value, [
    "fontFaceId",
    "fontFamily",
    "fontSha256",
    "weight",
    "style",
    "unitsPerEm",
    "ascentFontUnit",
    "descentFontUnit",
    "lineGapFontUnit",
    "fontFamilyKey",
    "fontAssetPath",
  ])
  if (
    record == null
    || !nonBlank(record.fontFaceId)
    || !nonBlank(record.fontFamily)
    || typeof record.fontSha256 !== "string"
    || !RAW_SHA256.test(record.fontSha256)
    || !safeInteger(record.weight)
    || (record.style !== "normal" && record.style !== "italic")
    || !safeInteger(record.unitsPerEm)
    || !safeInteger(record.ascentFontUnit)
    || !safeInteger(record.descentFontUnit)
    || !safeInteger(record.lineGapFontUnit)
    || !nonBlank(record.fontFamilyKey)
    || !nonBlank(record.fontAssetPath)
  ) return null
  return {
    fontFaceId: record.fontFaceId,
    fontFamily: record.fontFamily,
    fontSha256: record.fontSha256,
    weight: record.weight,
    style: record.style,
    unitsPerEm: record.unitsPerEm,
    ascentFontUnit: record.ascentFontUnit,
    descentFontUnit: record.descentFontUnit,
    lineGapFontUnit: record.lineGapFontUnit,
    fontFamilyKey: record.fontFamilyKey,
    fontAssetPath: record.fontAssetPath,
  }
}

function safeLayout(value: unknown): FlowDocTextEngineFlowEvidenceInputV2 | null {
  const record = exactRecord(value, [
    "initialFlowFingerprint",
    "layoutId",
    "measurement",
    "declaredLineHeightLayoutUnit",
    "paragraphStyle",
    "fontFaces",
  ], ["bindProductionLayout"])
  if (
    record == null
    || typeof record.initialFlowFingerprint !== "string"
    || !COMPACT_FINGERPRINT.test(record.initialFlowFingerprint)
    || !nonBlank(record.layoutId)
    || !safeInteger(record.declaredLineHeightLayoutUnit)
    || record.declaredLineHeightLayoutUnit <= 0
    || (
      Object.hasOwn(record, "bindProductionLayout")
      && typeof record.bindProductionLayout !== "boolean"
    )
  ) return null
  const measurementValue = measurement(record.measurement)
  const paragraph = paragraphStyle(record.paragraphStyle)
  const fontValues = denseDataArray(record.fontFaces)
  if (measurementValue == null || paragraph == null || fontValues == null) return null
  const fontFaces: FlowDocTextEngineMultiRunFontFaceV1[] = []
  for (const valueItem of fontValues) {
    const face = fontFace(valueItem)
    if (face == null) return null
    fontFaces.push(face)
  }
  return {
    initialFlowFingerprint: record.initialFlowFingerprint,
    layoutId: record.layoutId,
    measurement: measurementValue,
    declaredLineHeightLayoutUnit: record.declaredLineHeightLayoutUnit,
    paragraphStyle: paragraph,
    fontFaces,
    ...(record.bindProductionLayout == null
      ? {}
      : { bindProductionLayout: record.bindProductionLayout as boolean }),
  }
}

export function preflightFlowDocTextEngineFlowEvidenceV2(
  input: unknown,
): FlowDocTextEngineFlowEvidencePreflightResultV2 {
  const layout = safeLayout(input)
  if (layout == null) return {
    status: "blocked",
    layout: null,
    availableWidthLayoutUnit: null,
    issues: [issue(
      "invalid-layout-input",
      "input",
      "V2 flow evidence input must be an exact accessor-free data contract",
    )],
  }
  const width = convertVNextPointToLayoutUnitV1(
    layout.measurement.availableWidthPt,
    "measurement.availableWidthPt",
  )
  if (width.status !== "accepted" || width.layoutUnit <= 0) return {
    status: "blocked",
    layout: null,
    availableWidthLayoutUnit: null,
    issues: [issue(
      "invalid-layout-input",
      "measurement.availableWidthPt",
      "measurement width cannot be represented by LayoutUnitPolicyV1",
    )],
  }
  return {
    status: "accepted",
    layout,
    availableWidthLayoutUnit: width.layoutUnit,
    issues: [],
  }
}
