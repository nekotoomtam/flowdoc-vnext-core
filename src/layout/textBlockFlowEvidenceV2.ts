import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  sameVNextCanonicalJson,
  stringifyVNextCanonicalJson,
} from "../fingerprint/canonicalJson.js"
import { isVNextSafeUtf16TextOffset } from "../authoring/utf16Offsets.js"
import { convertVNextPointToLayoutUnitV1 } from "./layoutUnitPolicyV1.js"
import {
  inspectVNextTextBlockInitialFlowV1,
  type VNextTextBlockInitialFlowV1,
} from "./textBlockInitialFlowInputV1.js"
import type {
  VNextTextBlockFlowEvidenceAcceptanceResultV2,
  VNextTextBlockFlowEvidenceInputV2,
  VNextTextBlockFlowEvidenceInspectionV2,
  VNextTextBlockFlowEvidenceIssueV2,
  VNextTextBlockFlowEvidenceV2,
} from "./textBlockFlowEvidenceContractV2.js"
import type {
  VNextTextBlockMultiRunFontFaceV1,
  VNextTextBlockResolvedShapingRunV1,
} from "./textBlockMultiRunLayoutContractV1.js"

const EVIDENCE_SOURCE = "vnext-text-block-flow-evidence-v2" as const
const EVIDENCE_VERSION = 2 as const
const INVALID_DATA = Symbol("invalid-flow-evidence-data")
const HEX_COLOR = /^[0-9A-Fa-f]{6}$/u

type DataRecord = Record<string, unknown>
type StrictData = null | boolean | number | string | StrictData[] | {
  [key: string]: StrictData
}

const processLocalEvidenceBindings = new WeakMap<VNextTextBlockFlowEvidenceV2, {
  initialFlow: VNextTextBlockInitialFlowV1
  fingerprint: string
  canonicalFacts: string
}>()

function issue(
  code: VNextTextBlockFlowEvidenceIssueV2["code"],
  path: string,
  message: string,
  facts: Pick<VNextTextBlockFlowEvidenceIssueV2, "inlineId" | "shapingRunId"> = {},
): VNextTextBlockFlowEvidenceIssueV2 {
  return {
    code,
    severity: "error",
    path,
    message,
    ...(facts.inlineId == null ? {} : { inlineId: facts.inlineId }),
    ...(facts.shapingRunId == null ? {} : { shapingRunId: facts.shapingRunId }),
  }
}

function blocked(
  issues: readonly VNextTextBlockFlowEvidenceIssueV2[],
): VNextTextBlockFlowEvidenceAcceptanceResultV2 {
  return { status: "blocked", evidence: null, issues }
}

function snapshotRecord(value: unknown): DataRecord | null {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) return null
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    const output = Object.create(null) as DataRecord
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
  const record = snapshotRecord(value)
  if (record == null) return null
  const keys = Object.keys(record)
  if (
    requiredKeys.some((key) => !Object.hasOwn(record, key))
    || keys.some((key) => !requiredKeys.includes(key) && !optionalKeys.includes(key))
  ) return null
  return record
}

function strictCloneData(
  value: unknown,
  ancestors = new Set<object>(),
): StrictData | typeof INVALID_DATA {
  if (
    value === null
    || typeof value === "string"
    || typeof value === "boolean"
  ) return value
  if (typeof value === "number") return Number.isFinite(value) ? value : INVALID_DATA
  if (typeof value !== "object") return INVALID_DATA
  if (ancestors.has(value)) return INVALID_DATA
  ancestors.add(value)
  try {
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype) return INVALID_DATA
      const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length")
      if (
        lengthDescriptor == null
        || !Object.hasOwn(lengthDescriptor, "value")
        || !Number.isSafeInteger(lengthDescriptor.value)
        || lengthDescriptor.value < 0
      ) return INVALID_DATA
      const keys = Reflect.ownKeys(value)
      if (
        keys.length !== lengthDescriptor.value + 1
        || keys.some((key, index) => (
          index < lengthDescriptor.value
            ? key !== String(index)
            : key !== "length"
        ))
      ) return INVALID_DATA
      const output: StrictData[] = []
      for (let index = 0; index < lengthDescriptor.value; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
        if (
          descriptor == null
          || !Object.hasOwn(descriptor, "value")
          || descriptor.enumerable !== true
        ) return INVALID_DATA
        const cloned = strictCloneData(descriptor.value, ancestors)
        if (cloned === INVALID_DATA) return INVALID_DATA
        output.push(cloned)
      }
      return output
    }
    const record = snapshotRecord(value)
    if (record == null) return INVALID_DATA
    const output = Object.create(null) as { [key: string]: StrictData }
    for (const [key, item] of Object.entries(record)) {
      const cloned = strictCloneData(item, ancestors)
      if (cloned === INVALID_DATA) return INVALID_DATA
      output[key] = cloned
    }
    return output
  } catch {
    return INVALID_DATA
  } finally {
    ancestors.delete(value)
  }
}

function array(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null
}

function validUnitValue(value: unknown): boolean {
  const record = exactRecord(value, ["value", "unit"])
  return record != null
    && typeof record.value === "number"
    && (record.unit === "pt" || record.unit === "mm")
}

function validLocalStyle(value: unknown): boolean {
  const record = exactRecord(value, [], [
    "fontSize",
    "fontFamilyKey",
    "textColor",
    "fontWeight",
    "fontStyle",
    "textDecoration",
    "strikethrough",
  ])
  return record != null
    && (!Object.hasOwn(record, "fontSize") || validUnitValue(record.fontSize))
    && (!Object.hasOwn(record, "fontFamilyKey") || typeof record.fontFamilyKey === "string")
    && (!Object.hasOwn(record, "textColor") || typeof record.textColor === "string")
    && (!Object.hasOwn(record, "fontWeight") || typeof record.fontWeight === "string")
    && (!Object.hasOwn(record, "fontStyle") || typeof record.fontStyle === "string")
    && (!Object.hasOwn(record, "textDecoration") || typeof record.textDecoration === "string")
    && (!Object.hasOwn(record, "strikethrough") || typeof record.strikethrough === "boolean")
}

function validFrame(value: unknown): boolean {
  const record = exactRecord(value, ["width", "height", "fit"], ["crop"])
  if (
    record == null
    || !validUnitValue(record.width)
    || !validUnitValue(record.height)
    || typeof record.fit !== "string"
  ) return false
  if (!Object.hasOwn(record, "crop")) return true
  const crop = exactRecord(record.crop, ["x", "y", "width", "height"])
  return crop != null
    && typeof crop.x === "number"
    && typeof crop.y === "number"
    && typeof crop.width === "number"
    && typeof crop.height === "number"
}

function validMeasurementRun(value: unknown): boolean {
  const base = [
    "inlineId",
    "kind",
    "renderStartOffset",
    "renderEndOffset",
    "renderedText",
  ]
  const record = snapshotRecord(value)
  if (record == null || typeof record.kind !== "string") return false
  let exact: DataRecord | null = null
  if (record.kind === "text") exact = exactRecord(value, base, ["styleKey", "localStyle"])
  else if (record.kind === "resolved-field") {
    exact = exactRecord(value, [...base, "fieldKey"], ["styleKey"])
  } else if (record.kind === "generated-page-number") {
    exact = exactRecord(value, [...base, "generatedOwnerFingerprint"], ["styleKey"])
  } else if (record.kind === "hard-break") exact = exactRecord(value, base)
  else if (record.kind === "inline-image") {
    exact = exactRecord(value, [...base, "assetId", "frame"])
  }
  if (
    exact == null
    || typeof exact.inlineId !== "string"
    || typeof exact.renderStartOffset !== "number"
    || typeof exact.renderEndOffset !== "number"
    || typeof exact.renderedText !== "string"
    || (Object.hasOwn(exact, "styleKey") && typeof exact.styleKey !== "string")
  ) return false
  if (Object.hasOwn(exact, "localStyle") && !validLocalStyle(exact.localStyle)) return false
  if (record.kind === "resolved-field" && typeof exact.fieldKey !== "string") return false
  if (
    record.kind === "generated-page-number"
    && typeof exact.generatedOwnerFingerprint !== "string"
  ) return false
  return record.kind !== "inline-image"
    || (
      (exact.assetId === null || typeof exact.assetId === "string")
      && validFrame(exact.frame)
    )
}

function validMeasurement(value: unknown): boolean {
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
  const runs = record == null ? null : array(record.runs)
  return record != null
    && runs != null
    && typeof record.documentId === "string"
    && typeof record.instanceRevision === "number"
    && typeof record.sectionId === "string"
    && typeof record.textBlockId === "string"
    && typeof record.availableWidthPt === "number"
    && typeof record.measurementProfileId === "string"
    && typeof record.styleKey === "string"
    && typeof record.renderedText === "string"
    && runs.every(validMeasurementRun)
}

function validParagraphStyle(value: unknown): boolean {
  const record = exactRecord(value, [
    "styleKey",
    "fontFaceId",
    "fontSizeLayoutUnit",
    "textColor",
  ])
  return record != null
    && typeof record.styleKey === "string"
    && typeof record.fontFaceId === "string"
    && typeof record.fontSizeLayoutUnit === "number"
    && typeof record.textColor === "string"
}

function validFontFace(value: unknown): boolean {
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
  ])
  return record != null
    && typeof record.fontFaceId === "string"
    && typeof record.fontFamily === "string"
    && typeof record.fontSha256 === "string"
    && typeof record.weight === "number"
    && typeof record.style === "string"
    && typeof record.unitsPerEm === "number"
    && typeof record.ascentFontUnit === "number"
    && typeof record.descentFontUnit === "number"
    && typeof record.lineGapFontUnit === "number"
}

function validCluster(value: unknown): boolean {
  const record = exactRecord(value, [
    "index",
    "renderStartOffset",
    "renderEndOffset",
    "advanceLayoutUnit",
  ])
  return record != null
    && typeof record.index === "number"
    && typeof record.renderStartOffset === "number"
    && typeof record.renderEndOffset === "number"
    && typeof record.advanceLayoutUnit === "number"
}

function validShapingRun(value: unknown): boolean {
  const record = exactRecord(value, [
    "shapingRunId",
    "renderStartOffset",
    "renderEndOffset",
    "text",
    "styleKey",
    "fontFaceId",
    "fontSizeLayoutUnit",
    "textColor",
    "direction",
    "baselineShiftLayoutUnit",
    "features",
    "clusters",
  ])
  const features = record == null ? null : array(record.features)
  const clusters = record == null ? null : array(record.clusters)
  return record != null
    && features != null
    && clusters != null
    && typeof record.shapingRunId === "string"
    && typeof record.renderStartOffset === "number"
    && typeof record.renderEndOffset === "number"
    && typeof record.text === "string"
    && typeof record.styleKey === "string"
    && typeof record.fontFaceId === "string"
    && typeof record.fontSizeLayoutUnit === "number"
    && typeof record.textColor === "string"
    && typeof record.direction === "string"
    && typeof record.baselineShiftLayoutUnit === "number"
    && features.every((feature) => typeof feature === "string")
    && clusters.every(validCluster)
}

function safeEvidenceInput(value: unknown): VNextTextBlockFlowEvidenceInputV2 | null {
  const cloned = strictCloneData(value)
  if (cloned === INVALID_DATA) return null
  const record = exactRecord(cloned, [
    "initialFlowFingerprint",
    "layoutId",
    "measurement",
    "layoutUnitPolicyFingerprint",
    "availableWidthLayoutUnit",
    "declaredLineHeightLayoutUnit",
    "paragraphStyle",
    "fontFaces",
    "shapingRuns",
    "breakOffsets",
  ])
  const fontFaces = record == null ? null : array(record.fontFaces)
  const shapingRuns = record == null ? null : array(record.shapingRuns)
  const breakOffsets = record == null ? null : array(record.breakOffsets)
  if (
    record == null
    || fontFaces == null
    || shapingRuns == null
    || breakOffsets == null
    || typeof record.initialFlowFingerprint !== "string"
    || typeof record.layoutId !== "string"
    || !validMeasurement(record.measurement)
    || typeof record.layoutUnitPolicyFingerprint !== "string"
    || typeof record.availableWidthLayoutUnit !== "number"
    || typeof record.declaredLineHeightLayoutUnit !== "number"
    || !validParagraphStyle(record.paragraphStyle)
    || !fontFaces.every(validFontFace)
    || !shapingRuns.every(validShapingRun)
    || !breakOffsets.every((offset) => typeof offset === "number")
  ) return null
  return cloned as unknown as VNextTextBlockFlowEvidenceInputV2
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) {
      deepFreeze(descriptor.value)
    }
  }
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

function deeplyFrozen(value: unknown): boolean {
  if (value == null || typeof value !== "object" || !Object.isFrozen(value)) {
    return value == null || typeof value !== "object"
  }
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (
      descriptor == null
      || !Object.hasOwn(descriptor, "value")
      || !deeplyFrozen(descriptor.value)
    ) return false
  }
  return true
}

function nonBlank(value: string): boolean {
  return value.trim().length > 0
}

function validFace(face: VNextTextBlockMultiRunFontFaceV1): boolean {
  return nonBlank(face.fontFaceId)
    && nonBlank(face.fontFamily)
    && /^[a-f0-9]{64}$/u.test(face.fontSha256)
    && Number.isSafeInteger(face.weight)
    && face.weight >= 100
    && face.weight <= 900
    && (face.style === "normal" || face.style === "italic")
    && Number.isSafeInteger(face.unitsPerEm)
    && face.unitsPerEm > 0
    && Number.isSafeInteger(face.ascentFontUnit)
    && face.ascentFontUnit > 0
    && Number.isSafeInteger(face.descentFontUnit)
    && face.descentFontUnit <= 0
    && Number.isSafeInteger(face.lineGapFontUnit)
    && face.lineGapFontUnit >= 0
}

function paintableIntervals(initialFlow: VNextTextBlockInitialFlowV1) {
  const intervals: Array<{ start: number; end: number }> = []
  initialFlow.atoms.forEach((atom) => {
    if (
      (atom.kind !== "text"
        && atom.kind !== "resolved-field"
        && atom.kind !== "generated-page-number")
      || atom.renderStartOffset === atom.renderEndOffset
    ) return
    const previous = intervals.at(-1)
    if (previous != null && previous.end === atom.renderStartOffset) {
      previous.end = atom.renderEndOffset
    } else {
      intervals.push({ start: atom.renderStartOffset, end: atom.renderEndOffset })
    }
  })
  return intervals
}

function shapingIssues(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidenceInput: VNextTextBlockFlowEvidenceInputV2
}): VNextTextBlockFlowEvidenceIssueV2[] {
  const { initialFlow, evidenceInput } = input
  const issues: VNextTextBlockFlowEvidenceIssueV2[] = []
  const renderedText = initialFlow.measurement.renderedText
  const faces = new Map(evidenceInput.fontFaces.map((face) => [face.fontFaceId, face]))
  const ids = new Set<string>()
  let rangesStructurallyValid = true

  evidenceInput.shapingRuns.forEach((run, runIndex) => {
    const path = `evidenceInput.shapingRuns[${runIndex}]`
    const rangeValid = Number.isSafeInteger(run.renderStartOffset)
      && Number.isSafeInteger(run.renderEndOffset)
      && run.renderStartOffset >= 0
      && run.renderEndOffset > run.renderStartOffset
      && run.renderEndOffset <= renderedText.length
      && isVNextSafeUtf16TextOffset(renderedText, run.renderStartOffset)
      && isVNextSafeUtf16TextOffset(renderedText, run.renderEndOffset)
    rangesStructurallyValid &&= rangeValid
    const face = faces.get(run.fontFaceId)
    let invalid = !nonBlank(run.shapingRunId)
      || ids.has(run.shapingRunId)
      || !rangeValid
      || (
        rangeValid
        && run.text !== renderedText.slice(run.renderStartOffset, run.renderEndOffset)
      )
      || /[\r\n]/u.test(run.text)
      || !nonBlank(run.styleKey)
      || face == null
      || !Number.isSafeInteger(run.fontSizeLayoutUnit)
      || run.fontSizeLayoutUnit <= 0
      || !HEX_COLOR.test(run.textColor)
      || run.direction !== "ltr"
      || run.baselineShiftLayoutUnit !== 0
      || run.features.some((feature) => !nonBlank(feature))
      || run.features.some((feature, index) => index > 0 && feature <= run.features[index - 1]!)
    ids.add(run.shapingRunId)

    const coveredAtoms = initialFlow.atoms.filter((atom) => (
      atom.renderStartOffset < run.renderEndOffset
      && atom.renderEndOffset > run.renderStartOffset
    ))
    const forbiddenAtom = coveredAtoms.find((atom) => (
      atom.kind === "inline-image" || atom.kind === "hard-break"
    ))
    if (forbiddenAtom != null) issues.push(issue(
      "invalid-shaping-coverage",
      path,
      "shaping ranges must not intersect inline-image or hard-break source slots",
      { shapingRunId: run.shapingRunId, inlineId: forbiddenAtom.inlineId },
    ))
    for (const atom of coveredAtoms) {
      if (
        atom.kind !== "text"
        && atom.kind !== "resolved-field"
        && atom.kind !== "generated-page-number"
      ) continue
      invalid ||= run.styleKey !== atom.resolvedGeometryStyle.effectiveShapingStyleKey
        || run.fontFaceId !== atom.resolvedGeometryStyle.fontFaceId
        || run.fontSizeLayoutUnit !== atom.resolvedGeometryStyle.fontSizeLayoutUnit
        || run.textColor !== atom.resolvedGeometryStyle.textColor
    }

    if (run.clusters.length === 0) invalid = true
    let expectedStart = run.renderStartOffset
    let advance = 0
    run.clusters.forEach((cluster, clusterIndex) => {
      const valid = cluster.index === clusterIndex
        && Number.isSafeInteger(cluster.renderStartOffset)
        && Number.isSafeInteger(cluster.renderEndOffset)
        && cluster.renderStartOffset === expectedStart
        && cluster.renderEndOffset > cluster.renderStartOffset
        && cluster.renderEndOffset <= run.renderEndOffset
        && isVNextSafeUtf16TextOffset(renderedText, cluster.renderStartOffset)
        && isVNextSafeUtf16TextOffset(renderedText, cluster.renderEndOffset)
        && Number.isSafeInteger(cluster.advanceLayoutUnit)
        && cluster.advanceLayoutUnit >= 0
      invalid ||= !valid
      expectedStart = cluster.renderEndOffset
      advance += cluster.advanceLayoutUnit
      if (!Number.isSafeInteger(advance)) issues.push(issue(
        "unsafe-layout-arithmetic",
        `${path}.clusters`,
        "shaping cluster advances must remain safe layout-unit arithmetic",
        { shapingRunId: run.shapingRunId },
      ))
    })
    invalid ||= expectedStart !== run.renderEndOffset
    if (invalid) issues.push(issue(
      "invalid-shaping-coverage",
      path,
      "shaping runs require exact style-bound ranges and gap-free safe clusters",
      { shapingRunId: run.shapingRunId },
    ))
  })

  if (rangesStructurallyValid) {
    const intervals = paintableIntervals(initialFlow)
    let shapingIndex = 0
    intervals.forEach((interval) => {
      let cursor = interval.start
      while (
        shapingIndex < evidenceInput.shapingRuns.length
        && evidenceInput.shapingRuns[shapingIndex]!.renderStartOffset < interval.end
      ) {
        const run = evidenceInput.shapingRuns[shapingIndex]!
        if (
          run.renderStartOffset !== cursor
          || run.renderEndOffset > interval.end
          || run.renderEndOffset <= run.renderStartOffset
        ) break
        cursor = run.renderEndOffset
        shapingIndex += 1
      }
      if (cursor !== interval.end) issues.push(issue(
        "invalid-shaping-coverage",
        "evidenceInput.shapingRuns",
        `shaping runs do not exactly cover text-bearing range ${interval.start}-${interval.end}`,
      ))
    })
    if (shapingIndex !== evidenceInput.shapingRuns.length) issues.push(issue(
      "invalid-shaping-coverage",
      "evidenceInput.shapingRuns",
      "shaping runs contain ranges outside text-bearing source slots",
    ))
  }
  return issues
}

function breakIssues(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidenceInput: VNextTextBlockFlowEvidenceInputV2
}): VNextTextBlockFlowEvidenceIssueV2[] {
  const { initialFlow, evidenceInput } = input
  const issues: VNextTextBlockFlowEvidenceIssueV2[] = []
  const renderedText = initialFlow.measurement.renderedText
  const boundarySet = new Set<number>([0, renderedText.length])
  initialFlow.atoms.forEach((atom) => {
    if (atom.kind !== "inline-image" && atom.kind !== "hard-break") return
    boundarySet.add(atom.renderStartOffset)
    boundarySet.add(atom.renderEndOffset)
  })
  evidenceInput.shapingRuns.forEach((run) => run.clusters.forEach((cluster) => {
    boundarySet.add(cluster.renderStartOffset)
    boundarySet.add(cluster.renderEndOffset)
  }))
  const breakSet = new Set<number>()
  let previous = -1
  evidenceInput.breakOffsets.forEach((offset, index) => {
    const valid = Number.isSafeInteger(offset)
      && offset >= 0
      && offset <= renderedText.length
      && offset > previous
      && isVNextSafeUtf16TextOffset(renderedText, offset)
    if (!valid) issues.push(issue(
      "invalid-break-offsets",
      `evidenceInput.breakOffsets[${index}]`,
      "break offsets must be strictly increasing safe UTF-16 offsets",
    ))
    if (valid && !boundarySet.has(offset)) issues.push(issue(
      "invalid-break-offsets",
      `evidenceInput.breakOffsets[${index}]`,
      "break offsets must occur at a shaping-cluster or source-atom boundary",
    ))
    breakSet.add(offset)
    previous = offset
  })
  const mandatory = initialFlow.atoms
    .filter((atom) => atom.kind === "hard-break")
    .map((atom) => atom.renderEndOffset)
  if (
    evidenceInput.breakOffsets[0] !== 0
    || evidenceInput.breakOffsets.at(-1) !== renderedText.length
    || mandatory.some((offset) => !breakSet.has(offset))
  ) issues.push(issue(
    "invalid-break-offsets",
    "evidenceInput.breakOffsets",
    "break offsets must cover start, end, and every hard-break boundary",
  ))
  return issues
}

export function acceptVNextTextBlockFlowEvidenceV2(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  evidenceInput: VNextTextBlockFlowEvidenceInputV2
  bindProductionLayout?: boolean
}): VNextTextBlockFlowEvidenceAcceptanceResultV2
export function acceptVNextTextBlockFlowEvidenceV2(
  input: unknown,
): VNextTextBlockFlowEvidenceAcceptanceResultV2
export function acceptVNextTextBlockFlowEvidenceV2(
  input: unknown,
): VNextTextBlockFlowEvidenceAcceptanceResultV2 {
  const envelope = exactRecord(
    input,
    ["initialFlow", "evidenceInput"],
    ["bindProductionLayout"],
  )
  if (
    envelope == null
    || (
      Object.hasOwn(envelope, "bindProductionLayout")
      && typeof envelope.bindProductionLayout !== "boolean"
    )
  ) return blocked([issue(
    "invalid-input",
    "input",
    "flow evidence acceptance requires an exact accessor-free data envelope",
  )])
  const evidenceInput = safeEvidenceInput(envelope.evidenceInput)
  if (evidenceInput == null) return blocked([issue(
    "invalid-input",
    "evidenceInput",
    "flow evidence must use the exact accessor-free producer data contract",
  )])

  const issues: VNextTextBlockFlowEvidenceIssueV2[] = []
  if (envelope.bindProductionLayout === true) issues.push(issue(
    "production-binding-forbidden",
    "bindProductionLayout",
    "V2 flow evidence cannot bind production layout",
  ))
  const inspection = inspectVNextTextBlockInitialFlowV1(envelope.initialFlow)
  if (inspection.status !== "valid") {
    issues.push(issue(
      "initial-flow-provenance-mismatch",
      "initialFlow",
      inspection.message,
    ))
    return blocked(issues)
  }
  const initialFlow = envelope.initialFlow as VNextTextBlockInitialFlowV1

  if (evidenceInput.initialFlowFingerprint !== initialFlow.fingerprint) issues.push(issue(
    "initial-flow-binding-mismatch",
    "evidenceInput.initialFlowFingerprint",
    "producer evidence must name the exact accepted Initial Flow fingerprint",
  ))
  if (initialFlow.capabilities.listDecoration !== "not-present") issues.push(issue(
    "unsupported-flow-capability",
    "initialFlow.capabilities.listDecoration",
    "list decoration remains outside the V2 flow evidence boundary",
  ))
  if (initialFlow.capabilities.emptyBlock !== "not-present") issues.push(issue(
    "unsupported-flow-capability",
    "initialFlow.capabilities.emptyBlock",
    "empty, effectively empty, and hard-break-only flow require the empty-layout contract",
  ))
  const hasAcceptedContent = initialFlow.atoms.some((atom) => (
    (
      (atom.kind === "text"
        || atom.kind === "resolved-field"
        || atom.kind === "generated-page-number")
      && atom.renderedText.length > 0
    )
    || (atom.kind === "inline-image" && atom.assetId != null)
  ))
  if (
    initialFlow.capabilities.emptyBlock === "not-present"
    && !hasAcceptedContent
    && !initialFlow.atoms.some((atom) => atom.kind === "inline-image")
  ) issues.push(issue(
    "unsupported-flow-capability",
    "initialFlow.atoms",
    "flow evidence requires text-bearing content or a resolved inline image",
  ))
  initialFlow.atoms.forEach((atom, index) => {
    if (atom.kind === "inline-image" && atom.assetId == null) issues.push(issue(
      "unresolved-inline-image",
      `initialFlow.atoms[${index}].assetId`,
      "inline-image flow requires a resolved non-null asset id",
      { inlineId: atom.inlineId },
    ))
  })
  if (issues.some(({ code }) => code !== "production-binding-forbidden")) {
    return blocked(issues)
  }

  if (!nonBlank(evidenceInput.layoutId)) issues.push(issue(
    "measurement-context-mismatch",
    "evidenceInput.layoutId",
    "flow evidence layout id must not be blank",
  ))
  if (!sameVNextCanonicalJson(evidenceInput.measurement, initialFlow.measurement)) issues.push(issue(
    "measurement-context-mismatch",
    "evidenceInput.measurement",
    "flow evidence measurement must exactly match Initial Flow",
  ))
  const convertedWidth = convertVNextPointToLayoutUnitV1(
    initialFlow.measurement.availableWidthPt,
    "initialFlow.measurement.availableWidthPt",
  )
  if (
    convertedWidth.status !== "accepted"
    || !Number.isSafeInteger(evidenceInput.availableWidthLayoutUnit)
    || evidenceInput.availableWidthLayoutUnit <= 0
    || (
      convertedWidth.status === "accepted"
      && evidenceInput.availableWidthLayoutUnit !== convertedWidth.layoutUnit
    )
  ) issues.push(issue(
    "measurement-context-mismatch",
    "evidenceInput.availableWidthLayoutUnit",
    "flow evidence width must exactly match Initial Flow measurement width",
  ))
  if (evidenceInput.layoutUnitPolicyFingerprint !== initialFlow.layoutUnitPolicyFingerprint) {
    issues.push(issue(
      "measurement-context-mismatch",
      "evidenceInput.layoutUnitPolicyFingerprint",
      "flow evidence must retain Initial Flow layout-unit policy",
    ))
  }
  if (
    !Number.isSafeInteger(evidenceInput.declaredLineHeightLayoutUnit)
    || evidenceInput.declaredLineHeightLayoutUnit <= 0
    || evidenceInput.declaredLineHeightLayoutUnit !== initialFlow.declaredLineHeightLayoutUnit
  ) issues.push(issue(
    "measurement-context-mismatch",
    "evidenceInput.declaredLineHeightLayoutUnit",
    "flow evidence line height must exactly match Initial Flow",
  ))
  if (!sameVNextCanonicalJson(evidenceInput.paragraphStyle, initialFlow.paragraphStyle)) {
    issues.push(issue(
      "measurement-context-mismatch",
      "evidenceInput.paragraphStyle",
      "flow evidence paragraph style must exactly match Initial Flow",
    ))
  }
  const usedFaceIds = new Set([
    evidenceInput.paragraphStyle.fontFaceId,
    ...evidenceInput.shapingRuns.map((run) => run.fontFaceId),
  ])
  const expectedFaces = initialFlow.fontFaces
    .filter((face) => usedFaceIds.has(face.fontFaceId))
    .map(({ fontFamilyKey: _key, ...face }) => face)
  if (
    !sameVNextCanonicalJson(evidenceInput.fontFaces, expectedFaces)
    || !evidenceInput.fontFaces.every(validFace)
  ) issues.push(issue(
    "measurement-context-mismatch",
    "evidenceInput.fontFaces",
    "flow evidence font faces must exactly match Initial Flow shaping faces",
  ))

  issues.push(...shapingIssues({ initialFlow, evidenceInput }))
  issues.push(...breakIssues({ initialFlow, evidenceInput }))
  if (issues.length > 0) return blocked(issues)

  const facts = {
    source: EVIDENCE_SOURCE,
    contractVersion: EVIDENCE_VERSION,
    ...evidenceInput,
    contracts: {
      producerSelectsLines: false as const,
      shapingCoversTextBearingSlotsOnly: true as const,
      breakOffsetsCoverCompleteRenderedText: true as const,
      coreOwnsImageAdvance: true as const,
      coreOwnsLinePlacement: true as const,
      processLocalImmutableEvidence: true as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    },
  }
  const canonicalFacts = stringifyVNextCanonicalJson(facts)
  const evidence = deepFreeze({
    ...facts,
    fingerprint: createVNextCompactFingerprint(canonicalFacts),
  })
  processLocalEvidenceBindings.set(evidence, {
    initialFlow,
    fingerprint: evidence.fingerprint,
    canonicalFacts,
  })
  return { status: "accepted", evidence, issues: [] }
}

export function inspectVNextTextBlockFlowEvidenceV2(
  evidence: unknown,
): VNextTextBlockFlowEvidenceInspectionV2 {
  const invalid = (
    code: Extract<VNextTextBlockFlowEvidenceInspectionV2, { status: "invalid" }>["code"],
    message: string,
  ): VNextTextBlockFlowEvidenceInspectionV2 => ({
    status: "invalid",
    code,
    message,
    mayPublishLayout: false,
    productionBinding: false,
  })
  if (evidence == null || typeof evidence !== "object") return invalid(
    "unregistered-flow-evidence",
    "flow evidence is not an exact process-local Core-registered object",
  )
  const registration = processLocalEvidenceBindings.get(
    evidence as VNextTextBlockFlowEvidenceV2,
  )
  if (registration == null) return invalid(
    "unregistered-flow-evidence",
    "flow evidence is not the exact process-local object registered by Core",
  )
  if (!deeplyFrozen(evidence)) return invalid(
    "flow-evidence-not-deeply-frozen",
    "registered flow evidence must remain recursively frozen",
  )
  try {
    const acceptedEvidence = evidence as VNextTextBlockFlowEvidenceV2
    const { fingerprint, ...facts } = acceptedEvidence
    const canonicalFacts = stringifyVNextCanonicalJson(facts)
    if (
      fingerprint !== createVNextCompactFingerprint(canonicalFacts)
      || registration.fingerprint !== fingerprint
      || registration.canonicalFacts !== canonicalFacts
    ) return invalid(
      "flow-evidence-fingerprint-mismatch",
      "registered flow evidence no longer matches its canonical Core fingerprint",
    )
    return {
      status: "valid",
      fingerprint,
      initialFlowFingerprint: acceptedEvidence.initialFlowFingerprint,
      mayPublishLayout: false,
      productionBinding: false,
    }
  } catch {
    return invalid(
      "flow-evidence-fingerprint-mismatch",
      "registered flow evidence is not canonically fingerprintable",
    )
  }
}

export function hasVNextTextBlockFlowEvidenceBindingInternalV2(
  evidence: VNextTextBlockFlowEvidenceV2,
  initialFlow: VNextTextBlockInitialFlowV1,
): boolean {
  const registration = processLocalEvidenceBindings.get(evidence)
  return registration?.initialFlow === initialFlow
    && inspectVNextTextBlockFlowEvidenceV2(evidence).status === "valid"
    && inspectVNextTextBlockInitialFlowV1(initialFlow).status === "valid"
}
