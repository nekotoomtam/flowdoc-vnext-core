import {
  createVNextCompactFingerprint,
  scaleVNextFontMetricToLayoutUnitV1,
  type VNextTextBlockResolvedShapingRunV1,
  type VNextTextBlockTransitionEvidenceRequestV2,
  type VNextTextBlockTransitionProducerContractsV2,
  type VNextTextBlockTransitionProducerFailureCodeV2,
  type VNextTextBlockTransitionProducerFailureV2,
  type VNextTextBlockTransitionProducerInvocationAuthorityV2,
  type VNextTextBlockTransitionProducerOwnedWorkUnitV2,
  type VNextTextBlockTransitionProducerResponseV2,
  type VNextTextBlockTransitionProducerRuntimeIdentityV2,
  type VNextTextBlockTransitionProducerSourceMaterialV2,
  type VNextTextBlockTransitionProducerWorkV2,
  type VNextTextBlockTransitionSegmentationBoundaryProofV2,
  type VNextTextBlockTransitionShapingBoundaryProofV2,
} from "@flowdoc/vnext-core"
import type { FlowDocTextEngineIncrementalRangeExecutionRuntimeV1 } from "./incrementalRangeFactSplice.js"
import {
  FLOWDOC_TEXT_ENGINE_MR1_RANGE_SEGMENTATION_FACTS_VERSION,
  FLOWDOC_TEXT_ENGINE_MR1_RANGE_SHAPE_FACTS_VERSION,
  flowDocUtf8ByteLengthV1,
  type FlowDocTextEngineMr1RangeSegmentationFactsV1,
  type FlowDocTextEngineMr1RangeShapeFactsV1,
} from "./runtimeMr1Range.js"

export interface FlowDocUnifiedIncrementalEvidenceRuntimeV2 {
  readonly identity: VNextTextBlockTransitionProducerRuntimeIdentityV2
  readonly shapeRange: FlowDocTextEngineIncrementalRangeExecutionRuntimeV1["shapeRange"]
  readonly segmentRange: FlowDocTextEngineIncrementalRangeExecutionRuntimeV1["segmentRange"]
}

export type FlowDocUnifiedIncrementalEvidenceResultV2 =
  | { readonly status: "accepted"; readonly response: VNextTextBlockTransitionProducerResponseV2; readonly failure: null; readonly issues: readonly [] }
  | { readonly status: "blocked"; readonly response: null; readonly failure: VNextTextBlockTransitionProducerFailureV2; readonly issues: readonly [] }

export type FlowDocUnifiedIncrementalEvidenceAuthorizedResultV2 =
  | FlowDocUnifiedIncrementalEvidenceResultV2
  | {
      readonly status: "work-limit"
      readonly response: null
      readonly failure: null
      readonly issues: readonly []
    }
  | {
      readonly status: "not-invoked"
      readonly response: null
      readonly failure: null
      readonly issues: readonly ["missing-or-mismatched-invocation-authority"]
    }

const NOT_INVOKED: FlowDocUnifiedIncrementalEvidenceAuthorizedResultV2 =
  Object.freeze({
    status: "not-invoked" as const,
    response: null,
    failure: null,
    issues: Object.freeze([
      "missing-or-mismatched-invocation-authority",
    ] as const),
  })

const WORK_LIMIT: FlowDocUnifiedIncrementalEvidenceAuthorizedResultV2 =
  Object.freeze({
    status: "work-limit" as const,
    response: null,
    failure: null,
    issues: Object.freeze([] as const),
  })

const CONTRACTS: VNextTextBlockTransitionProducerContractsV2 = Object.freeze({
  producerSelectsDirtyRange: false,
  producerSelectsLinesOrBands: false,
  producerSelectsReconvergenceOrReuse: false,
  producerSelectsFallback: false,
  stagedEditorApply: false,
  mayPublishLayout: false,
  productionBinding: false,
})

function canonical(value: unknown): string {
  if (value == null || typeof value === "string" || typeof value === "boolean") return JSON.stringify(value)
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non-finite evidence fact")
    return JSON.stringify(Object.is(value, -0) ? 0 : value)
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`
  if (typeof value !== "object") throw new TypeError("non-data evidence fact")
  return `{${Object.keys(value as Record<string, unknown>).filter((key) => (value as Record<string, unknown>)[key] !== undefined).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`
}

function fingerprint(value: unknown): string {
  return createVNextCompactFingerprint(canonical(value))
}

function freeze<T>(value: T): T {
  if (value != null && typeof value === "object") {
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor != null && Object.hasOwn(descriptor, "value")) freeze(descriptor.value)
    }
    if (!Object.isFrozen(value)) Object.freeze(value)
  }
  return value
}

function exactKeys(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) return false
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return false
    if (Object.getOwnPropertySymbols(value).length !== 0) return false
    const actual = Reflect.ownKeys(value)
    return actual.length === keys.length && actual.every((key) => {
      if (typeof key !== "string" || !keys.includes(key)) return false
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      return descriptor != null && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true
    })
  } catch {
    return false
  }
}

function safeDataTree(value: unknown, seen = new Set<object>()): boolean {
  if (value == null || typeof value === "string" || typeof value === "boolean") return true
  if (typeof value === "number") return Number.isSafeInteger(value)
  if (typeof value !== "object" || seen.has(value)) return false
  seen.add(value)
  try {
    try {
      if (Array.isArray(value)) {
        if (Object.getPrototypeOf(value) !== Array.prototype || Object.getOwnPropertySymbols(value).length !== 0) return false
        const length = Object.getOwnPropertyDescriptor(value, "length")?.value
        if (!Number.isSafeInteger(length) || Reflect.ownKeys(value).length !== length + 1) return false
        for (let index = 0; index < length; index += 1) {
          const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
          if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true || !safeDataTree(descriptor.value, seen)) return false
        }
        return true
      }
      const prototype = Object.getPrototypeOf(value)
      if ((prototype !== Object.prototype && prototype !== null) || Object.getOwnPropertySymbols(value).length !== 0) return false
      for (const key of Reflect.ownKeys(value)) {
        if (typeof key !== "string") return false
        const descriptor = Object.getOwnPropertyDescriptor(value, key)
        if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true || !safeDataTree(descriptor.value, seen)) return false
      }
      return true
    } finally {
      seen.delete(value)
    }
  } catch {
    return false
  }
}

function byteByUtf16(text: string): Map<number, number> {
  const output = new Map<number, number>([[0, 0]])
  let byte = 0
  let utf16 = 0
  while (utf16 < text.length) {
    const codePoint = text.codePointAt(utf16)
    if (codePoint == null) break
    byte += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4
    utf16 += codePoint > 0xffff ? 2 : 1
    output.set(utf16, byte)
  }
  return output
}

function unicodeScalarCount(text: string): number {
  let count = 0
  for (let offset = 0; offset < text.length;) {
    const codePoint = text.codePointAt(offset)
    if (codePoint == null) return -1
    offset += codePoint > 0xffff ? 2 : 1
    count += 1
  }
  return count
}

function utf16ByByte(text: string): Map<number, number> {
  return new Map([...byteByUtf16(text)].map(([utf16, byte]) => [byte, utf16]))
}

function validSegmentationOffsets(facts: FlowDocTextEngineMr1RangeSegmentationFactsV1): boolean {
  const bytes = byteByUtf16(facts.fullText)
  const paired = (byteOffsets: readonly number[], utf16Offsets: readonly number[]): boolean => byteOffsets.length === utf16Offsets.length && byteOffsets.every((byte, index) => Number.isSafeInteger(byte) && Number.isSafeInteger(utf16Offsets[index]) && bytes.get(utf16Offsets[index]!) === byte && (index === 0 || byte > byteOffsets[index - 1]!))
  if (!paired(facts.contextBreakByteOffsets, facts.contextBreakUtf16Offsets) || !paired(facts.targetBreakByteOffsets, facts.targetBreakUtf16Offsets)) return false
  const context = new Set(facts.contextBreakByteOffsets)
  return facts.targetBreakByteOffsets.every((offset) => context.has(offset))
}

function baseWork(material: VNextTextBlockTransitionProducerSourceMaterialV2): VNextTextBlockTransitionProducerWorkV2 {
  return {
    requestedAtomCount: material.producerWorkCeilings.maximumRequestedAtomCount,
    requestedClusterCount: material.producerWorkCeilings.maximumRequestedClusterCount,
    consumedAtomCount: 0,
    consumedClusterCount: 0,
    unusedCoverageRenderedUtf16Length: 0,
    visitedEvidenceNodeCount: 0,
    completeNextInputTraversalCount: 0,
    completeNextInputComparisonCount: 0,
  }
}

function coveredUtf16Length(ranges: readonly { startRenderedUtf16: number; endRenderedUtf16: number }[]): number {
  const ordered = ranges
    .filter((range) => range.endRenderedUtf16 > range.startRenderedUtf16)
    .map((range) => ({ ...range }))
    .sort((left, right) => left.startRenderedUtf16 - right.startRenderedUtf16 || left.endRenderedUtf16 - right.endRenderedUtf16)
  let total = 0
  let start = -1
  let end = -1
  for (const range of ordered) {
    if (start < 0) { start = range.startRenderedUtf16; end = range.endRenderedUtf16; continue }
    if (range.startRenderedUtf16 > end) { total += end - start; start = range.startRenderedUtf16; end = range.endRenderedUtf16 }
    else end = Math.max(end, range.endRenderedUtf16)
  }
  return start < 0 ? 0 : total + end - start
}

function failure(input: {
  request: VNextTextBlockTransitionEvidenceRequestV2
  sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  runtime: FlowDocUnifiedIncrementalEvidenceRuntimeV2
  code: VNextTextBlockTransitionProducerFailureCodeV2
  work: VNextTextBlockTransitionProducerWorkV2
}): FlowDocUnifiedIncrementalEvidenceResultV2 {
  const facts = {
    source: "vnext-text-block-transition-producer-failure-v2" as const,
    contractVersion: 2 as const,
    requestFingerprint: input.request.fingerprint,
    sourceMaterialFingerprint: input.sourceMaterial.fingerprint,
    runtimeIdentity: input.runtime.identity,
    code: input.code,
    completedWork: input.work,
    contracts: CONTRACTS,
  }
  return freeze({ status: "blocked" as const, response: null, failure: { ...facts, fingerprint: fingerprint(facts) }, issues: freeze([]) })
}

function exactArrayLength(value: unknown): number | null {
  try {
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype || Object.getOwnPropertySymbols(value).length !== 0) return null
    const descriptor = Object.getOwnPropertyDescriptor(value, "length")
    return descriptor != null && Object.hasOwn(descriptor, "value") && Number.isSafeInteger(descriptor.value) && descriptor.value >= 0
      ? descriptor.value
      : null
  } catch {
    return null
  }
}

interface ResponseNodeMeterV2 {
  readonly limit: number
  count: number
  readonly beforeObservation: () => boolean
}

type MeteredSnapshotV2 =
  | { readonly status: "accepted"; readonly value: unknown }
  | { readonly status: "invalid" | "ceiling" }

function snapshotDataBeforeObservation(
  value: unknown,
  meter: ResponseNodeMeterV2,
  seen = new Set<object>(),
): MeteredSnapshotV2 {
  if (
    value == null
    || typeof value === "string"
    || typeof value === "boolean"
    || typeof value === "number"
  ) {
    return typeof value === "number" && !Number.isSafeInteger(value)
      ? { status: "invalid" }
      : { status: "accepted", value }
  }
  if (typeof value !== "object" || seen.has(value)) return { status: "invalid" }
  seen.add(value)
  try {
    if (!meter.beforeObservation()) return { status: "ceiling" }
    const prototype = Object.getPrototypeOf(value)
    if (!meter.beforeObservation()) return { status: "ceiling" }
    if (Object.getOwnPropertySymbols(value).length !== 0) return { status: "invalid" }
    if (!meter.beforeObservation()) return { status: "ceiling" }
    const keys = Reflect.ownKeys(value)
    if (Array.isArray(value)) {
      if (prototype !== Array.prototype) return { status: "invalid" }
      if (!meter.beforeObservation()) return { status: "ceiling" }
      const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length")
      if (
        lengthDescriptor == null
        || !Object.hasOwn(lengthDescriptor, "value")
        || !Number.isSafeInteger(lengthDescriptor.value)
        || lengthDescriptor.value < 0
        || keys.length !== lengthDescriptor.value + 1
      ) return { status: "invalid" }
      const output: unknown[] = []
      for (let index = 0; index < lengthDescriptor.value; index += 1) {
        if (!meter.beforeObservation()) return { status: "ceiling" }
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
        if (
          descriptor == null
          || !Object.hasOwn(descriptor, "value")
          || descriptor.enumerable !== true
        ) return { status: "invalid" }
        const child = snapshotDataBeforeObservation(descriptor.value, meter, seen)
        if (child.status !== "accepted") return child
        output.push(child.value)
      }
      return { status: "accepted", value: output }
    }
    if (prototype !== Object.prototype && prototype !== null) {
      return { status: "invalid" }
    }
    const output: Record<string, unknown> = {}
    for (const key of keys) {
      if (typeof key !== "string") return { status: "invalid" }
      if (!meter.beforeObservation()) return { status: "ceiling" }
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return { status: "invalid" }
      const child = snapshotDataBeforeObservation(descriptor.value, meter, seen)
      if (child.status !== "accepted") return child
      output[key] = child.value
    }
    return { status: "accepted", value: output }
  } catch {
    return { status: "invalid" }
  } finally {
    seen.delete(value)
  }
}

interface UnifiedIncrementalEvidenceInputV2 {
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly runtime: FlowDocUnifiedIncrementalEvidenceRuntimeV2
}

function exactDataFieldsBeforeObservation(
  value: unknown,
  keys: readonly string[],
  meter: ResponseNodeMeterV2,
): { readonly status: "accepted"; readonly fields: Record<string, unknown> }
  | { readonly status: "invalid" | "ceiling" } {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return { status: "invalid" }
    }
    if (!meter.beforeObservation()) return { status: "ceiling" }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return { status: "invalid" }
    if (!meter.beforeObservation()) return { status: "ceiling" }
    if (Object.getOwnPropertySymbols(value).length !== 0) return { status: "invalid" }
    if (!meter.beforeObservation()) return { status: "ceiling" }
    const actual = Reflect.ownKeys(value)
    if (
      actual.length !== keys.length
      || actual.some((key) => typeof key !== "string" || !keys.includes(key))
    ) return { status: "invalid" }
    const fields: Record<string, unknown> = {}
    for (const key of keys) {
      if (!meter.beforeObservation()) return { status: "ceiling" }
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return { status: "invalid" }
      fields[key] = descriptor.value
    }
    return { status: "accepted", fields }
  } catch {
    return { status: "invalid" }
  }
}

function validRange(value: unknown): value is { readonly startRenderedUtf16: number; readonly endRenderedUtf16: number } {
  return exactKeys(value, ["startRenderedUtf16", "endRenderedUtf16"])
    && Number.isSafeInteger(value.startRenderedUtf16)
    && Number.isSafeInteger(value.endRenderedUtf16)
    && (value.startRenderedUtf16 as number) >= 0
    && (value.endRenderedUtf16 as number) >= (value.startRenderedUtf16 as number)
}

function validLaneRanges(value: unknown): boolean {
  if (!exactKeys(value, ["changedSourceRange", "evidenceTargetRange", "shapeVerificationRange", "coverageRange"])) return false
  const changed = value.changedSourceRange
  const target = value.evidenceTargetRange
  const shape = value.shapeVerificationRange
  const coverage = value.coverageRange
  return validRange(changed) && validRange(target) && validRange(shape) && validRange(coverage)
    && coverage.startRenderedUtf16 <= shape.startRenderedUtf16
    && shape.startRenderedUtf16 <= target.startRenderedUtf16
    && target.endRenderedUtf16 <= shape.endRenderedUtf16
    && shape.endRenderedUtf16 <= coverage.endRenderedUtf16
}

function validResolvedStyle(value: unknown): boolean {
  if (!exactKeys(value, ["measurementStyleKey", "effectiveShapingStyleKey", "paragraphStyleKey", "fontFamilyKey", "fontFaceId", "fontSizeLayoutUnit", "textColor", "fontWeight", "fontStyle", "textDecoration", "strikethrough", "fingerprint"])) return false
  return [value.measurementStyleKey, value.effectiveShapingStyleKey, value.paragraphStyleKey, value.fontFamilyKey, value.fontFaceId, value.textColor, value.fingerprint].every((item) => typeof item === "string" && item.length > 0)
    && Number.isSafeInteger(value.fontSizeLayoutUnit) && (value.fontSizeLayoutUnit as number) > 0
    && Number.isSafeInteger(value.fontWeight) && (value.fontWeight as number) > 0
    && (value.fontStyle === "normal" || value.fontStyle === "italic")
    && (value.textDecoration === "none" || value.textDecoration === "underline")
    && typeof value.strikethrough === "boolean"
}

function validAtom(value: unknown): boolean {
  if (value == null || typeof value !== "object") return false
  const kind = Object.getOwnPropertyDescriptor(value, "kind")
  if (kind == null || !Object.hasOwn(kind, "value") || typeof kind.value !== "string") return false
  const base = ["relativeStartRenderedUtf16", "relativeEndRenderedUtf16", "renderedText", "inlineId", "sourceFingerprint", "provenanceFingerprint", "fingerprint", "kind"]
  const variant = kind.value === "text" ? ["resolvedStyle"]
    : kind.value === "resolved-field" ? ["fieldKey", "resolvedStyle"]
      : kind.value === "generated-page-number" ? ["generatedOwnerFingerprint", "resolvedStyle"]
        : kind.value === "hard-break" || kind.value === "inline-image-boundary" ? ["boundaryFingerprint"]
          : null
  if (variant == null || !exactKeys(value, [...base, ...variant])) return false
  if (!Number.isSafeInteger(value.relativeStartRenderedUtf16) || !Number.isSafeInteger(value.relativeEndRenderedUtf16) || (value.relativeStartRenderedUtf16 as number) < 0 || value.relativeEndRenderedUtf16 !== (value.relativeStartRenderedUtf16 as number) + (typeof value.renderedText === "string" ? value.renderedText.length : -1)) return false
  if ([value.inlineId, value.sourceFingerprint, value.provenanceFingerprint, value.fingerprint].some((item) => typeof item !== "string" || item.length === 0)) return false
  if (kind.value === "hard-break") return value.renderedText === "\n" && typeof value.boundaryFingerprint === "string" && value.boundaryFingerprint.length > 0
  if (kind.value === "inline-image-boundary") return typeof value.renderedText === "string" && value.renderedText.length > 0 && typeof value.boundaryFingerprint === "string" && value.boundaryFingerprint.length > 0
  if (!validResolvedStyle(value.resolvedStyle)) return false
  if (kind.value === "resolved-field" && (typeof value.fieldKey !== "string" || value.fieldKey.length === 0)) return false
  if (kind.value === "generated-page-number" && (typeof value.generatedOwnerFingerprint !== "string" || value.generatedOwnerFingerprint.length === 0)) return false
  return true
}

function validLaneMaterial(value: unknown): boolean {
  if (!exactKeys(value, ["ranges", "atoms", "fingerprint"]) || !validLaneRanges(value.ranges) || !Array.isArray(value.atoms) || typeof value.fingerprint !== "string") return false
  let end = 0
  for (const atom of value.atoms) {
    if (!validAtom(atom) || atom.relativeStartRenderedUtf16 !== end) return false
    end = atom.relativeEndRenderedUtf16
  }
  const ranges = value.ranges as VNextTextBlockTransitionEvidenceRequestV2["next"]
  return end === ranges.coverageRange.endRenderedUtf16 - ranges.coverageRange.startRenderedUtf16
}

function validFontFace(value: unknown): boolean {
  if (!exactKeys(value, ["fontFaceId", "fontFamilyKey", "fontFamily", "fontSha256", "weight", "style", "unitsPerEm", "ascentFontUnit", "descentFontUnit", "lineGapFontUnit"])) return false
  return [value.fontFaceId, value.fontFamilyKey, value.fontFamily, value.fontSha256].every((item) => typeof item === "string" && item.length > 0)
    && [value.weight, value.unitsPerEm, value.ascentFontUnit, value.descentFontUnit, value.lineGapFontUnit].every(Number.isSafeInteger)
    && (value.unitsPerEm as number) > 0
    && (value.style === "normal" || value.style === "italic")
}

function validMaterial(input: {
  request: VNextTextBlockTransitionEvidenceRequestV2
  sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  runtime: FlowDocUnifiedIncrementalEvidenceRuntimeV2
}): boolean {
  const { request, sourceMaterial, runtime } = input
  if (!safeDataTree(request) || !safeDataTree(sourceMaterial) || !safeDataTree(runtime.identity)) return false
  const requestKeys = ["source", "contractVersion", "previousRootFingerprint", "changeFingerprint", "documentId", "sectionId", "textBlockId", "previous", "next", "nextSegmentationContextRanges", "requiredStableSegmentationExpansionCount", "fontStyleUnitDependencyFingerprint", "producerRuntimeRequirementFingerprint", "layoutUnitPolicyFingerprint", "workPolicyFingerprint", "fingerprint"]
  if (!exactKeys(request, requestKeys)) return false
  if (!exactKeys(runtime.identity, ["source", "contractVersion", "runtime", "engineBuildFingerprint", "fontBackendFingerprint", "unitPolicyFingerprint", "fontStyleUnitDependencyFingerprint", "producerRuntimeRequirementFingerprint", "fingerprint"])) return false
  if (!exactKeys(sourceMaterial, ["source", "contractVersion", "requestFingerprint", "previous", "next", "paragraphStyleKey", "fontFaces", "layoutUnitPolicyFingerprint", "sourceTopologyFingerprint", "producerWorkCeilings", "fingerprint"])) return false
  if (!validLaneRanges(request.previous) || !validLaneRanges(request.next) || !Array.isArray(request.nextSegmentationContextRanges) || !request.nextSegmentationContextRanges.every(validRange) || !Number.isSafeInteger(request.requiredStableSegmentationExpansionCount) || request.requiredStableSegmentationExpansionCount < 1 || request.requiredStableSegmentationExpansionCount > request.nextSegmentationContextRanges.length) return false
  let previousContext: VNextTextBlockTransitionEvidenceRequestV2["nextSegmentationContextRanges"][number] | null = null
  for (const context of request.nextSegmentationContextRanges) {
    if (context.startRenderedUtf16 < request.next.coverageRange.startRenderedUtf16 || context.endRenderedUtf16 > request.next.coverageRange.endRenderedUtf16 || context.startRenderedUtf16 > request.next.evidenceTargetRange.startRenderedUtf16 || context.endRenderedUtf16 < request.next.evidenceTargetRange.endRenderedUtf16) return false
    if (previousContext != null && (context.startRenderedUtf16 > previousContext.startRenderedUtf16 || context.endRenderedUtf16 < previousContext.endRenderedUtf16 || (context.startRenderedUtf16 === previousContext.startRenderedUtf16 && context.endRenderedUtf16 === previousContext.endRenderedUtf16))) return false
    previousContext = context
  }
  if (!validLaneMaterial(sourceMaterial.previous) || !validLaneMaterial(sourceMaterial.next) || !Array.isArray(sourceMaterial.fontFaces) || !sourceMaterial.fontFaces.every(validFontFace) || !exactKeys(sourceMaterial.producerWorkCeilings, ["maximumVisitedEvidenceNodeCount", "maximumRequestedAtomCount", "maximumRequestedClusterCount"])) return false
  if (sourceMaterial.source !== "vnext-text-block-transition-producer-source-material-v2" || sourceMaterial.contractVersion !== 2 || sourceMaterial.requestFingerprint !== request.fingerprint || sourceMaterial.layoutUnitPolicyFingerprint !== request.layoutUnitPolicyFingerprint) return false
  if (runtime.identity.source !== "vnext-text-block-transition-producer-runtime-v2" || runtime.identity.contractVersion !== 2 || runtime.identity.fontStyleUnitDependencyFingerprint !== request.fontStyleUnitDependencyFingerprint || runtime.identity.producerRuntimeRequirementFingerprint !== request.producerRuntimeRequirementFingerprint || runtime.identity.unitPolicyFingerprint !== request.layoutUnitPolicyFingerprint) return false
  const withoutFingerprint = (value: object): Record<string, unknown> => {
    const facts = { ...value } as Record<string, unknown>
    delete facts.fingerprint
    return facts
  }
  if (request.fingerprint !== fingerprint(withoutFingerprint(request))) return false
  if (sourceMaterial.fingerprint !== fingerprint(withoutFingerprint(sourceMaterial))) return false
  if (sourceMaterial.previous.fingerprint !== fingerprint(withoutFingerprint(sourceMaterial.previous)) || sourceMaterial.next.fingerprint !== fingerprint(withoutFingerprint(sourceMaterial.next))) return false
  if (runtime.identity.fingerprint !== fingerprint(withoutFingerprint(runtime.identity))) return false
  for (const atom of [...sourceMaterial.previous.atoms, ...sourceMaterial.next.atoms]) {
    if (atom.fingerprint !== fingerprint(withoutFingerprint(atom))) return false
    if (atom.kind !== "hard-break" && atom.kind !== "inline-image-boundary" && atom.resolvedStyle.fingerprint !== fingerprint(withoutFingerprint(atom.resolvedStyle))) return false
  }
  for (const atom of sourceMaterial.next.atoms) {
    if (atom.kind === "hard-break" || atom.kind === "inline-image-boundary") continue
    const face = sourceMaterial.fontFaces.find((candidate) => candidate.fontFaceId === atom.resolvedStyle.fontFaceId)
    if (face == null || face.fontFamilyKey !== atom.resolvedStyle.fontFamilyKey || face.weight !== atom.resolvedStyle.fontWeight || face.style !== atom.resolvedStyle.fontStyle) return false
  }
  const ceilings = sourceMaterial.producerWorkCeilings
  return [ceilings.maximumVisitedEvidenceNodeCount, ceilings.maximumRequestedAtomCount, ceilings.maximumRequestedClusterCount].every((value) => Number.isSafeInteger(value) && value >= 0)
    && ceilings.maximumRequestedAtomCount === sourceMaterial.previous.atoms.length + sourceMaterial.next.atoms.length
}

function composeCoverageText(material: VNextTextBlockTransitionProducerSourceMaterialV2): string | null {
  const atoms = material.next.atoms
  const coverageLength = material.next.ranges.coverageRange.endRenderedUtf16 - material.next.ranges.coverageRange.startRenderedUtf16
  let text = ""
  let position = 0
  for (const atom of atoms) {
    if (atom.relativeStartRenderedUtf16 !== position || atom.relativeEndRenderedUtf16 !== position + atom.renderedText.length) return null
    text += atom.renderedText
    position = atom.relativeEndRenderedUtf16
  }
  return position === coverageLength ? text : null
}

interface ProducerAuthorityControlsV2 {
  readonly receiver: VNextTextBlockTransitionProducerInvocationAuthorityV2
  readonly begin: VNextTextBlockTransitionProducerInvocationAuthorityV2["begin"]
  readonly charge: VNextTextBlockTransitionProducerInvocationAuthorityV2["charge"]
  readonly bindRuntimeIdentity:
    VNextTextBlockTransitionProducerInvocationAuthorityV2["bindRuntimeIdentity"]
  readonly close: VNextTextBlockTransitionProducerInvocationAuthorityV2["close"]
}

function producerAuthorityControls(
  value: unknown,
): ProducerAuthorityControlsV2 | null {
  if (value == null || (typeof value !== "object" && typeof value !== "function")) {
    return null
  }
  try {
    const method = (key: "begin" | "charge" | "bindRuntimeIdentity" | "close") => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      return descriptor != null
        && Object.hasOwn(descriptor, "value")
        && typeof descriptor.value === "function"
        ? descriptor.value
        : null
    }
    const begin = method("begin")
    const charge = method("charge")
    const bindRuntimeIdentity = method("bindRuntimeIdentity")
    const close = method("close")
    return begin == null || charge == null || bindRuntimeIdentity == null || close == null
      ? null
      : {
          receiver: value as VNextTextBlockTransitionProducerInvocationAuthorityV2,
          begin,
          charge,
          bindRuntimeIdentity,
          close,
        }
  } catch {
    return null
  }
}

interface DecodedProducerAuthorityControlV2 {
  readonly keys: readonly string[]
  readonly fields: Readonly<Record<string, unknown>>
}

function decodeProducerAuthorityControl(
  value: unknown,
): DecodedProducerAuthorityControlV2 | null {
  try {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return null
    }
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    const ownKeys = Reflect.ownKeys(value)
    if (ownKeys.some((key) => typeof key !== "string")) return null
    const fields: Record<string, unknown> = Object.create(null)
    for (const key of ownKeys) {
      if (typeof key !== "string") return null
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      fields[key] = descriptor.value
    }
    return { keys: ownKeys as string[], fields }
  } catch {
    return null
  }
}

function exactProducerAuthorityControlKeys(
  decoded: DecodedProducerAuthorityControlV2,
  keys: readonly string[],
): boolean {
  return decoded.keys.length === keys.length
    && decoded.keys.every((key) => keys.includes(key))
}

function decodeProducerAuthorityStatus(
  value: unknown,
  statuses: readonly string[],
): string | null {
  const decoded = decodeProducerAuthorityControl(value)
  return decoded != null
    && exactProducerAuthorityControlKeys(decoded, ["status"])
    && typeof decoded.fields.status === "string"
    && statuses.includes(decoded.fields.status)
      ? decoded.fields.status
      : null
}

type DecodedProducerAuthorityChargeV2 =
  | { readonly status: "charged" }
  | { readonly status: "limit-exceeded" }
  | { readonly status: "invalid-state" }

function isSafeNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0
}

function decodeProducerAuthorityCharge(
  value: unknown,
  requestedUnit: VNextTextBlockTransitionProducerOwnedWorkUnitV2,
): DecodedProducerAuthorityChargeV2 | null {
  const decoded = decodeProducerAuthorityControl(value)
  if (decoded == null || decoded.fields.unit !== requestedUnit) return null
  if (decoded.fields.status === "charged") {
    if (
      !exactProducerAuthorityControlKeys(decoded, [
        "status",
        "unit",
        "completedWork",
        "effectiveLimit",
      ])
      || !isSafeNonNegativeInteger(decoded.fields.completedWork)
      || decoded.fields.completedWork < 1
      || !isSafeNonNegativeInteger(decoded.fields.effectiveLimit)
      || decoded.fields.completedWork > decoded.fields.effectiveLimit
    ) return null
    return { status: "charged" }
  }
  if (decoded.fields.status === "limit-exceeded") {
    if (
      !exactProducerAuthorityControlKeys(decoded, [
        "status",
        "unit",
        "attemptedWork",
        "completedWork",
        "effectiveLimit",
      ])
      || !isSafeNonNegativeInteger(decoded.fields.attemptedWork)
      || !isSafeNonNegativeInteger(decoded.fields.completedWork)
      || decoded.fields.attemptedWork !== decoded.fields.completedWork + 1
      || !isSafeNonNegativeInteger(decoded.fields.effectiveLimit)
      || decoded.fields.attemptedWork <= decoded.fields.effectiveLimit
    ) return null
    return { status: "limit-exceeded" }
  }
  return decoded.fields.status === "invalid-state"
    && exactProducerAuthorityControlKeys(decoded, ["status", "unit"])
      ? { status: "invalid-state" }
      : null
}

interface DecodedProducerAuthorityCloseV2 {
  readonly status: "closed" | "rejected"
  readonly visitedEvidenceNodeCount: number
}

function decodeProducerAuthorityClose(
  value: unknown,
): DecodedProducerAuthorityCloseV2 | null {
  const decoded = decodeProducerAuthorityControl(value)
  if (
    decoded == null
    || !exactProducerAuthorityControlKeys(decoded, [
      "status",
      "visitedEvidenceNodeCount",
    ])
    || (decoded.fields.status !== "closed" && decoded.fields.status !== "rejected")
    || !isSafeNonNegativeInteger(decoded.fields.visitedEvidenceNodeCount)
  ) return null
  return {
    status: decoded.fields.status,
    visitedEvidenceNodeCount: decoded.fields.visitedEvidenceNodeCount,
  }
}

function invokeProducerAuthorityControl(callback: () => unknown): unknown {
  try {
    return callback()
  } catch {
    return null
  }
}

function snapshotAuthorizedAdapterInput(
  request: unknown,
  sourceMaterial: unknown,
  runtime: unknown,
  meter: ResponseNodeMeterV2,
): {
  readonly status: "accepted"
  readonly input: UnifiedIncrementalEvidenceInputV2
  readonly runtimeIdentity: VNextTextBlockTransitionProducerRuntimeIdentityV2
} | { readonly status: "invalid" | "ceiling" } {
  const runtimeEnvelope = exactDataFieldsBeforeObservation(
    runtime,
    ["identity", "shapeRange", "segmentRange"],
    meter,
  )
  if (runtimeEnvelope.status !== "accepted") return runtimeEnvelope
  if (
    typeof runtimeEnvelope.fields.shapeRange !== "function"
    || typeof runtimeEnvelope.fields.segmentRange !== "function"
  ) return { status: "invalid" }
  const requestSnapshot = snapshotDataBeforeObservation(request, meter)
  if (requestSnapshot.status !== "accepted") return requestSnapshot
  const materialSnapshot = snapshotDataBeforeObservation(sourceMaterial, meter)
  if (materialSnapshot.status !== "accepted") return materialSnapshot
  const runtimeIdentity = runtimeEnvelope.fields.identity
  const identitySnapshot = snapshotDataBeforeObservation(runtimeIdentity, meter)
  if (identitySnapshot.status !== "accepted") return identitySnapshot
  return {
    status: "accepted",
    input: {
      request:
        requestSnapshot.value as VNextTextBlockTransitionEvidenceRequestV2,
      sourceMaterial:
        materialSnapshot.value as VNextTextBlockTransitionProducerSourceMaterialV2,
      runtime: {
        identity:
          identitySnapshot.value as VNextTextBlockTransitionProducerRuntimeIdentityV2,
        shapeRange: runtimeEnvelope.fields.shapeRange as UnifiedIncrementalEvidenceInputV2["runtime"]["shapeRange"],
        segmentRange: runtimeEnvelope.fields.segmentRange as UnifiedIncrementalEvidenceInputV2["runtime"]["segmentRange"],
      },
    },
    runtimeIdentity:
      runtimeIdentity as VNextTextBlockTransitionProducerRuntimeIdentityV2,
  }
}

type AuthorizedClusterResultV2 =
  | {
      readonly status: "accepted"
      readonly clusters: VNextTextBlockResolvedShapingRunV1["clusters"]
    }
  | { readonly status: "invalid" | "ceiling" }

function clustersFromShapeAuthorized(input: {
  readonly shape: FlowDocTextEngineMr1RangeShapeFactsV1
  readonly targetStartLocal: number
  readonly targetEndLocal: number
  readonly globalCoverageStart: number
  readonly fontSizeLayoutUnit: number
  readonly beforeCluster: () => boolean
  readonly onClusterCompleted: () => void
}): AuthorizedClusterResultV2 {
  const utf16Offsets = utf16ByByte(input.shape.fullText)
  const targetStartByte = byteByUtf16(input.shape.fullText)
    .get(input.targetStartLocal)
  const targetEndByte = byteByUtf16(input.shape.fullText)
    .get(input.targetEndLocal)
  if (targetStartByte == null || targetEndByte == null) {
    return { status: "invalid" }
  }
  const advanceByCluster = new Map<number, number>()
  for (const glyph of input.shape.glyphs) {
    const next = (advanceByCluster.get(glyph.cluster) ?? 0) + glyph.xAdvance
    if (!Number.isSafeInteger(next) || next < 0) return { status: "invalid" }
    advanceByCluster.set(glyph.cluster, next)
  }
  const starts = [...advanceByCluster.keys()].sort((left, right) => left - right)
  const output: VNextTextBlockResolvedShapingRunV1["clusters"] = []
  for (let index = 0; index < starts.length; index += 1) {
    const startByte = starts[index]!
    const endByte = starts[index + 1] ?? input.shape.rangeEndByte
    if (startByte < targetStartByte || startByte >= targetEndByte) continue
    if (endByte > targetEndByte) return { status: "invalid" }
    const start = utf16Offsets.get(startByte)
    const end = utf16Offsets.get(endByte)
    const advance = advanceByCluster.get(startByte)
    if (start == null || end == null || end <= start || advance == null) {
      return { status: "invalid" }
    }
    const scaled = scaleVNextFontMetricToLayoutUnitV1({
      fontMetric: advance,
      fontSizeLayoutUnit: input.fontSizeLayoutUnit,
      unitsPerEm: input.shape.unitsPerEm,
    })
    if (scaled.status !== "accepted" || scaled.layoutUnit < 0) {
      return { status: "invalid" }
    }
    if (!input.beforeCluster()) return { status: "ceiling" }
    output.push({
      index: output.length,
      renderStartOffset: input.globalCoverageStart + start,
      renderEndOffset: input.globalCoverageStart + end,
      advanceLayoutUnit: scaled.layoutUnit,
    })
    input.onClusterCompleted()
  }
  return output.length > 0
    && output[0]!.renderStartOffset
      === input.globalCoverageStart + input.targetStartLocal
    && output.at(-1)!.renderEndOffset
      === input.globalCoverageStart + input.targetEndLocal
    ? { status: "accepted", clusters: output }
    : { status: "invalid" }
}

export function createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
  authority: VNextTextBlockTransitionProducerInvocationAuthorityV2,
  request: VNextTextBlockTransitionEvidenceRequestV2,
  sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2,
  runtime: FlowDocUnifiedIncrementalEvidenceRuntimeV2,
): FlowDocUnifiedIncrementalEvidenceAuthorizedResultV2
export function createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
  authority: unknown,
  ...argumentsAfterAuthority: readonly unknown[]
): FlowDocUnifiedIncrementalEvidenceAuthorizedResultV2
export function createFlowDocTextEngineUnifiedIncrementalEvidenceV2(
  authority: unknown,
  request?: unknown,
  sourceMaterial?: unknown,
  runtime?: unknown,
): FlowDocUnifiedIncrementalEvidenceAuthorizedResultV2 {
  const controls = producerAuthorityControls(authority)
  if (controls == null) return NOT_INVOKED
  const begun = decodeProducerAuthorityStatus(
    invokeProducerAuthorityControl(() => Reflect.apply(
      controls.begin,
      controls.receiver,
      [request, sourceMaterial],
    )),
    ["started", "rejected"],
  )
  if (begun !== "started") return NOT_INVOKED

  const close = (
    outcome: "producer-response" | "producer-failure" | "producer-blocked",
  ) => decodeProducerAuthorityClose(
    invokeProducerAuthorityControl(() => Reflect.apply(
      controls.close,
      controls.receiver,
      [outcome],
    )),
  )
  const blockedNotInvoked = (): FlowDocUnifiedIncrementalEvidenceAuthorizedResultV2 => {
    close("producer-blocked")
    return NOT_INVOKED
  }
  const blockedWorkLimit = (): FlowDocUnifiedIncrementalEvidenceAuthorizedResultV2 => {
    const receipt = close("producer-blocked")
    return receipt?.status === "closed" ? WORK_LIMIT : NOT_INVOKED
  }
  let invalidAuthorityControl = false
  const charge = (
    unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2,
  ): "charged" | "limit-exceeded" | "invalid" => {
    const decoded = decodeProducerAuthorityCharge(
      invokeProducerAuthorityControl(() => Reflect.apply(
        controls.charge,
        controls.receiver,
        [unit],
      )),
      unit,
    )
    if (decoded?.status === "charged") return "charged"
    if (decoded?.status === "limit-exceeded") return "limit-exceeded"
    invalidAuthorityControl = true
    return "invalid"
  }
  const before = (
    unit: VNextTextBlockTransitionProducerOwnedWorkUnitV2,
  ): boolean => charge(unit) === "charged"

  const initialDescriptorCharge = charge("evidence-producer-descriptors")
  if (initialDescriptorCharge !== "charged") {
    return initialDescriptorCharge === "limit-exceeded"
      ? blockedWorkLimit()
      : blockedNotInvoked()
  }
  let runtimeIdentity: unknown
  try {
    if (runtime == null || typeof runtime !== "object") return blockedNotInvoked()
    const descriptor = Object.getOwnPropertyDescriptor(runtime, "identity")
    if (
      descriptor == null
      || !Object.hasOwn(descriptor, "value")
      || descriptor.enumerable !== true
    ) return blockedNotInvoked()
    runtimeIdentity = descriptor.value
  } catch {
    return blockedNotInvoked()
  }
  const bound = decodeProducerAuthorityStatus(
    invokeProducerAuthorityControl(() => Reflect.apply(
      controls.bindRuntimeIdentity,
      controls.receiver,
      [runtimeIdentity],
    )),
    ["bound", "rejected"],
  )
  if (bound !== "bound") return blockedNotInvoked()

  const descriptorMeter: ResponseNodeMeterV2 = {
    limit: Number.MAX_SAFE_INTEGER,
    count: 0,
    beforeObservation() {
      if (!before("evidence-producer-descriptors")) return false
      descriptorMeter.count += 1
      return true
    },
  }
  const snapshot = snapshotAuthorizedAdapterInput(
    request,
    sourceMaterial,
    runtime,
    descriptorMeter,
  )
  if (snapshot.status === "ceiling") return blockedWorkLimit()
  if (snapshot.status !== "accepted") return blockedNotInvoked()
  if (snapshot.runtimeIdentity !== runtimeIdentity) return blockedNotInvoked()

  const input: UnifiedIncrementalEvidenceInputV2 = {
    ...snapshot.input,
    runtime: {
      ...snapshot.input.runtime,
      identity: snapshot.runtimeIdentity,
    },
  }
  if (!validMaterial(snapshot.input)) return blockedNotInvoked()

  const requestedWork = baseWork(input.sourceMaterial)
  let consumedAtomCount = 0
  let consumedClusterCount = 0
  let unusedCoverageRenderedUtf16Length = 0
  const completedWork = (
    visitedEvidenceNodeCount: number,
  ): VNextTextBlockTransitionProducerWorkV2 => freeze({
    ...requestedWork,
    consumedAtomCount,
    consumedClusterCount,
    unusedCoverageRenderedUtf16Length,
    visitedEvidenceNodeCount,
  })
  const emitTopLevelFacts = (fieldCount: number): boolean => {
    for (let index = 0; index < fieldCount; index += 1) {
      if (!before("evidence-response-facts")) return false
    }
    return true
  }
  const finishFailure = (
    code: VNextTextBlockTransitionProducerFailureCodeV2,
  ): FlowDocUnifiedIncrementalEvidenceAuthorizedResultV2 => {
    if (!emitTopLevelFacts(9)) {
      return invalidAuthorityControl ? blockedNotInvoked() : blockedWorkLimit()
    }
    const receipt = close("producer-failure")
    if (receipt?.status !== "closed") return NOT_INVOKED
    return failure({
      ...input,
      code,
      work: completedWork(receipt.visitedEvidenceNodeCount),
    })
  }
  const ceilingFailure = () => invalidAuthorityControl
    ? blockedNotInvoked()
    : finishFailure("work-ceiling-before-visit")
  const chargeRuntimeInputString = (
    text: string,
  ): "charged" | "ceiling" | "invalid" => {
    for (let offset = 0; offset < text.length;) {
      if (!before("evidence-runtime-input-scalars")) return "ceiling"
      const codePoint = text.codePointAt(offset)
      if (codePoint == null) return "invalid"
      offset += codePoint > 0xffff ? 2 : 1
    }
    return "charged"
  }

  const text = composeCoverageText(input.sourceMaterial)
  if (text == null) return finishFailure("invalid-request-scoped-material")
  const coverageStart = input.request.next.coverageRange.startRenderedUtf16
  const target = input.request.next.evidenceTargetRange
  const targetStartLocal = target.startRenderedUtf16 - coverageStart
  const targetEndLocal = target.endRenderedUtf16 - coverageStart
  const shapeRange = input.request.next.shapeVerificationRange
  const shapeStartLocal = shapeRange.startRenderedUtf16 - coverageStart
  const shapeEndLocal = shapeRange.endRenderedUtf16 - coverageStart
  if (
    targetStartLocal < 0
    || targetEndLocal < targetStartLocal
    || shapeStartLocal < 0
    || shapeStartLocal > targetStartLocal
    || shapeEndLocal < targetEndLocal
    || shapeEndLocal > text.length
  ) return finishFailure("invalid-request-scoped-material")

  const shapingRuns: VNextTextBlockResolvedShapingRunV1[] = []
  const shapingBoundaryProofs: VNextTextBlockTransitionShapingBoundaryProofV2[] = []
  const segmentationBoundaryProofs: VNextTextBlockTransitionSegmentationBoundaryProofV2[] = []
  type StyledAtom = Extract<
    (typeof input.sourceMaterial.next.atoms)[number],
    { readonly resolvedStyle: unknown }
  >
  type ResolvedStyle = StyledAtom["resolvedStyle"]
  const partitions: Array<{
    start: number
    end: number
    style: ResolvedStyle
    atomFingerprints: string[]
  }> = []
  for (const atom of input.sourceMaterial.next.atoms) {
    if (atom.kind === "hard-break" || atom.kind === "inline-image-boundary") {
      consumedAtomCount += 1
      continue
    }
    const atomStart = coverageStart + atom.relativeStartRenderedUtf16
    const atomEnd = coverageStart + atom.relativeEndRenderedUtf16
    const previous = partitions.at(-1)
    if (
      previous != null
      && previous.end === atomStart
      && canonical(previous.style) === canonical(atom.resolvedStyle)
    ) {
      previous.end = atomEnd
      previous.atomFingerprints.push(atom.fingerprint)
    } else {
      partitions.push({
        start: atomStart,
        end: atomEnd,
        style: atom.resolvedStyle,
        atomFingerprints: [atom.fingerprint],
      })
    }
    consumedAtomCount += 1
  }

  for (const partition of partitions) {
    const runStart = Math.max(partition.start, target.startRenderedUtf16)
    const runEnd = Math.min(partition.end, target.endRenderedUtf16)
    if (runEnd <= runStart) continue
    const verificationStart = Math.max(
      partition.start,
      shapeRange.startRenderedUtf16,
    )
    const verificationEnd = Math.min(
      partition.end,
      shapeRange.endRenderedUtf16,
    )
    const face = input.sourceMaterial.fontFaces.find(
      (candidate) => candidate.fontFaceId === partition.style.fontFaceId,
    )
    if (face == null) return finishFailure("pinned-font-unavailable")
    const shapeScalarInputs = [text, face.fontFaceId]
    for (const runtimeInput of shapeScalarInputs) {
      const charge = chargeRuntimeInputString(runtimeInput)
      if (charge === "ceiling") return ceilingFailure()
      if (charge === "invalid") return finishFailure("unsafe-runtime-arithmetic")
    }
    if (!before("evidence-runtime-invocations")) return ceilingFailure()
    let shape: FlowDocTextEngineMr1RangeShapeFactsV1
    try {
      shape = input.runtime.shapeRange({
        text,
        fontFaceId: face.fontFaceId,
        rangeStartUtf16: runStart - coverageStart,
        rangeEndUtf16: verificationEnd - coverageStart,
        contextStartUtf16: verificationStart - coverageStart,
        contextEndUtf16: verificationEnd - coverageStart,
      })
    } catch {
      return finishFailure("pinned-font-unavailable")
    }
    const shapeSnapshot = snapshotDataBeforeObservation(shape, descriptorMeter)
    if (shapeSnapshot.status === "ceiling") return ceilingFailure()
    if (shapeSnapshot.status !== "accepted") {
      return finishFailure("unsafe-runtime-arithmetic")
    }
    shape = shapeSnapshot.value as FlowDocTextEngineMr1RangeShapeFactsV1
    if (!exactKeys(shape, [
      "contractVersion", "outputShapeVersion", "fullText", "fontFaceId",
      "fullTextByteLength", "fullTextScalarCount", "rangeStartByte",
      "rangeEndByte", "rangeStartUtf16", "rangeEndUtf16", "contextStartByte",
      "contextEndByte", "contextStartUtf16", "contextEndUtf16", "rangeText",
      "preContextText", "postContextText", "unitsPerEm", "ascentFontUnit",
      "descentFontUnit", "lineGapFontUnit", "glyphs", "summary",
    ])) return finishFailure("unsafe-runtime-arithmetic")
    const returnedGlyphCount = exactArrayLength(shape.glyphs)
    if (returnedGlyphCount == null) return finishFailure("unsafe-runtime-arithmetic")
    const inspectedGlyphs: FlowDocTextEngineMr1RangeShapeFactsV1["glyphs"][number][] = []
    for (let glyphIndex = 0; glyphIndex < returnedGlyphCount; glyphIndex += 1) {
      if (!before("evidence-glyphs")) return ceilingFailure()
      const glyph = shape.glyphs[glyphIndex]
      if (
        !exactKeys(glyph, [
          "index", "glyphId", "cluster", "xAdvance", "yAdvance", "xOffset",
          "yOffset", "unsafeToBreak",
        ])
        || !safeDataTree(glyph)
      ) return finishFailure("unsafe-runtime-arithmetic")
      inspectedGlyphs.push(glyph as FlowDocTextEngineMr1RangeShapeFactsV1["glyphs"][number])
    }
    const { glyphs: _uninspectedGlyphs, ...shapeHeader } = shape
    if (!safeDataTree(shapeHeader)) return finishFailure("unsafe-runtime-arithmetic")
    shape = { ...shape, glyphs: inspectedGlyphs }
    if (!exactKeys(shape.summary, [
      "glyphCount", "missingGlyphCount", "totalAdvanceFontUnits",
      "unsafeToBreakGlyphCount",
    ])) return finishFailure("unsafe-runtime-arithmetic")
    if (
      shape.contractVersion !== 1
      || shape.outputShapeVersion !== FLOWDOC_TEXT_ENGINE_MR1_RANGE_SHAPE_FACTS_VERSION
      || shape.fullText !== text
      || shape.fullTextByteLength !== flowDocUtf8ByteLengthV1(text)
      || shape.fullTextScalarCount !== unicodeScalarCount(text)
      || shape.fontFaceId !== face.fontFaceId
      || shape.rangeStartUtf16 !== runStart - coverageStart
      || shape.rangeEndUtf16 !== verificationEnd - coverageStart
      || shape.contextStartUtf16 !== verificationStart - coverageStart
      || shape.contextEndUtf16 !== verificationEnd - coverageStart
      || shape.rangeText !== text.slice(
        runStart - coverageStart,
        verificationEnd - coverageStart,
      )
      || shape.preContextText !== text.slice(
        verificationStart - coverageStart,
        runStart - coverageStart,
      )
      || shape.postContextText !== ""
      || shape.unitsPerEm !== face.unitsPerEm
      || shape.ascentFontUnit !== face.ascentFontUnit
      || shape.descentFontUnit !== face.descentFontUnit
      || shape.lineGapFontUnit !== face.lineGapFontUnit
      || shape.summary.glyphCount !== shape.glyphs.length
      || shape.summary.missingGlyphCount
        !== shape.glyphs.filter((glyph) => glyph.glyphId === 0).length
    ) return finishFailure("pinned-font-mismatch")
    if (shape.summary.missingGlyphCount > 0) return finishFailure("missing-glyph")
    const byteOffsets = byteByUtf16(text)
    const runStartByte = byteOffsets.get(runStart - coverageStart)
    const runEndByte = byteOffsets.get(runEnd - coverageStart)
    if (runStartByte == null || runEndByte == null) {
      return finishFailure("unsafe-shaping-boundary")
    }
    const firstTarget = shape.glyphs.find((glyph) => glyph.cluster === runStartByte)
    let rightGuard: FlowDocTextEngineMr1RangeShapeFactsV1["glyphs"][number] | null = null
    let guardGlyphCount = 0
    for (const glyph of shape.glyphs) {
      if (glyph.cluster < runEndByte) continue
      if (!before("evidence-guards")) return ceilingFailure()
      guardGlyphCount += 1
      if (rightGuard == null && glyph.cluster === runEndByte) {
        rightGuard = glyph
      }
    }
    const leftAtExactBoundary = runStart === partition.start
      || runStart === target.startRenderedUtf16 && runStart === coverageStart
    const rightAtExactBoundary = runEnd === partition.end
      || runEnd === target.endRenderedUtf16
        && runEnd === coverageStart + text.length
    if (
      (!leftAtExactBoundary && (firstTarget == null || firstTarget.unsafeToBreak))
      || (!rightAtExactBoundary && (rightGuard == null || rightGuard.unsafeToBreak))
    ) return finishFailure("unsafe-shaping-boundary")
    const clusterResult = clustersFromShapeAuthorized({
      shape,
      targetStartLocal: runStart - coverageStart,
      targetEndLocal: runEnd - coverageStart,
      globalCoverageStart: coverageStart,
      fontSizeLayoutUnit: partition.style.fontSizeLayoutUnit,
      beforeCluster: () => before("evidence-clusters"),
      onClusterCompleted: () => {
        consumedClusterCount += 1
      },
    })
    if (clusterResult.status === "ceiling") return ceilingFailure()
    if (clusterResult.status !== "accepted") {
      return finishFailure("unsafe-runtime-arithmetic")
    }
    const run: VNextTextBlockResolvedShapingRunV1 = {
      shapingRunId: fingerprint({
        request: input.request.fingerprint,
        atoms: partition.atomFingerprints,
        runStart,
        runEnd,
      }),
      renderStartOffset: runStart,
      renderEndOffset: runEnd,
      text: text.slice(runStart - coverageStart, runEnd - coverageStart),
      styleKey: partition.style.measurementStyleKey,
      fontFaceId: face.fontFaceId,
      fontSizeLayoutUnit: partition.style.fontSizeLayoutUnit,
      textColor: partition.style.textColor,
      direction: "ltr",
      baselineShiftLayoutUnit: 0,
      features: [],
      clusters: clusterResult.clusters,
    }
    shapingRuns.push(freeze(run))
    const proofFacts = {
      targetRange: {
        startRenderedUtf16: runStart,
        endRenderedUtf16: runEnd,
      },
      verificationRange: {
        startRenderedUtf16: verificationStart,
        endRenderedUtf16: verificationEnd,
      },
      leftBoundary: leftAtExactBoundary
        ? "exact-style-or-block-start" as const
        : "safe-first-target-glyph" as const,
      rightBoundary: rightAtExactBoundary
        ? "exact-style-or-block-end" as const
        : "safe-first-right-guard-glyph" as const,
      guardGlyphCount,
      inspectedGlyphCount: returnedGlyphCount,
    }
    if (!before("evidence-proof-facts")) return ceilingFailure()
    shapingBoundaryProofs.push(freeze({
      ...proofFacts,
      fingerprint: fingerprint(proofFacts),
    }))
  }

  const inspectRuntimeIntegerArray = (
    value: unknown,
  ):
    | { readonly status: "accepted"; readonly values: number[] }
    | { readonly status: "invalid" | "ceiling" } => {
    const length = exactArrayLength(value)
    if (length == null) return { status: "invalid" }
    const values: number[] = []
    for (let index = 0; index < length; index += 1) {
      if (!before("evidence-breaks")) return { status: "ceiling" }
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
        || !Number.isSafeInteger(descriptor.value)
      ) return { status: "invalid" }
      values.push(descriptor.value as number)
    }
    return { status: "accepted", values }
  }

  let stableBreaks: readonly number[] | null = null
  let stableCount = 0
  const consumedSegmentationContextRanges: Array<{
    startRenderedUtf16: number
    endRenderedUtf16: number
  }> = []
  for (const context of input.request.nextSegmentationContextRanges) {
    const scalarCharge = chargeRuntimeInputString(text)
    if (scalarCharge === "ceiling") return ceilingFailure()
    if (scalarCharge === "invalid") return finishFailure("unsafe-runtime-arithmetic")
    if (!before("evidence-runtime-invocations")) return ceilingFailure()
    let facts: FlowDocTextEngineMr1RangeSegmentationFactsV1
    try {
      facts = input.runtime.segmentRange({
        text,
        targetStartUtf16: targetStartLocal,
        targetEndUtf16: targetEndLocal,
        contextStartUtf16: context.startRenderedUtf16 - coverageStart,
        contextEndUtf16: context.endRenderedUtf16 - coverageStart,
      })
    } catch {
      return finishFailure("segmentation-not-stable")
    }
    const segmentationSnapshot = snapshotDataBeforeObservation(
      facts,
      descriptorMeter,
    )
    if (segmentationSnapshot.status === "ceiling") return ceilingFailure()
    if (segmentationSnapshot.status !== "accepted") {
      return finishFailure("segmentation-not-stable")
    }
    facts = segmentationSnapshot.value as FlowDocTextEngineMr1RangeSegmentationFactsV1
    if (!exactKeys(facts, [
      "contractVersion", "outputShapeVersion", "fullText", "fullTextByteLength",
      "fullTextScalarCount", "targetStartByte", "targetEndByte",
      "targetStartUtf16", "targetEndUtf16", "contextStartByte", "contextEndByte",
      "contextStartUtf16", "contextEndUtf16", "contextText",
      "contextBreakByteOffsets", "contextBreakUtf16Offsets",
      "targetBreakByteOffsets", "targetBreakUtf16Offsets", "summary",
    ])) return finishFailure("segmentation-not-stable")
    const contextBreakByteOffsets = inspectRuntimeIntegerArray(
      facts.contextBreakByteOffsets,
    )
    const contextBreakUtf16Offsets = contextBreakByteOffsets.status === "accepted"
      ? inspectRuntimeIntegerArray(facts.contextBreakUtf16Offsets)
      : contextBreakByteOffsets
    const targetBreakByteOffsets = contextBreakUtf16Offsets.status === "accepted"
      ? inspectRuntimeIntegerArray(facts.targetBreakByteOffsets)
      : contextBreakUtf16Offsets
    const targetBreakUtf16Offsets = targetBreakByteOffsets.status === "accepted"
      ? inspectRuntimeIntegerArray(facts.targetBreakUtf16Offsets)
      : targetBreakByteOffsets
    const inspections = [
      contextBreakByteOffsets,
      contextBreakUtf16Offsets,
      targetBreakByteOffsets,
      targetBreakUtf16Offsets,
    ]
    if (inspections.some((inspection) => inspection.status === "ceiling")) {
      return ceilingFailure()
    }
    if (
      contextBreakByteOffsets.status !== "accepted"
      || contextBreakUtf16Offsets.status !== "accepted"
      || targetBreakByteOffsets.status !== "accepted"
      || targetBreakUtf16Offsets.status !== "accepted"
    ) return finishFailure("segmentation-not-stable")
    const {
      contextBreakByteOffsets: _contextBytes,
      contextBreakUtf16Offsets: _contextUtf16,
      targetBreakByteOffsets: _targetBytes,
      targetBreakUtf16Offsets: _targetUtf16,
      ...segmentationHeader
    } = facts
    if (!safeDataTree(segmentationHeader)) {
      return finishFailure("segmentation-not-stable")
    }
    facts = {
      ...facts,
      contextBreakByteOffsets: contextBreakByteOffsets.values,
      contextBreakUtf16Offsets: contextBreakUtf16Offsets.values,
      targetBreakByteOffsets: targetBreakByteOffsets.values,
      targetBreakUtf16Offsets: targetBreakUtf16Offsets.values,
    }
    if (!exactKeys(facts.summary, [
      "contextBreakCount", "targetBreakCount",
      "artificialContextBoundaryBreakCount",
    ])) return finishFailure("segmentation-not-stable")
    const expectedContextStart = context.startRenderedUtf16 - coverageStart
    const expectedContextEnd = context.endRenderedUtf16 - coverageStart
    const expectedArtificialBoundaryCount = (expectedContextStart > 0 ? 1 : 0)
      + (expectedContextEnd < text.length ? 1 : 0)
    if (
      facts.contractVersion !== 1
      || facts.outputShapeVersion
        !== FLOWDOC_TEXT_ENGINE_MR1_RANGE_SEGMENTATION_FACTS_VERSION
      || facts.fullText !== text
      || facts.fullTextByteLength !== flowDocUtf8ByteLengthV1(text)
      || facts.fullTextScalarCount !== unicodeScalarCount(text)
      || facts.targetStartUtf16 !== targetStartLocal
      || facts.targetEndUtf16 !== targetEndLocal
      || facts.contextStartUtf16 !== expectedContextStart
      || facts.contextEndUtf16 !== expectedContextEnd
      || facts.contextText !== text.slice(expectedContextStart, expectedContextEnd)
      || facts.summary.targetBreakCount !== facts.targetBreakUtf16Offsets.length
      || facts.summary.contextBreakCount !== facts.contextBreakUtf16Offsets.length
      || facts.summary.artificialContextBoundaryBreakCount
        !== expectedArtificialBoundaryCount
      || !validSegmentationOffsets(facts)
      || facts.targetBreakUtf16Offsets.some((offset, index, offsets) =>
        !Number.isSafeInteger(offset)
        || offset < targetStartLocal
        || offset > targetEndLocal
        || index > 0 && offset <= offsets[index - 1]!
      )
    ) return finishFailure("segmentation-not-stable")
    const current = facts.targetBreakUtf16Offsets
      .filter((offset) => offset >= targetStartLocal && offset <= targetEndLocal)
      .map((offset) => coverageStart + offset)
    const segmentationProofFacts = {
      contextRange: context,
      contextBreakCount: facts.contextBreakUtf16Offsets.length,
      targetBreakOffsets: freeze(current),
      inspectedOffsetCount: facts.contextBreakByteOffsets.length
        + facts.contextBreakUtf16Offsets.length
        + facts.targetBreakByteOffsets.length
        + facts.targetBreakUtf16Offsets.length,
    }
    if (!before("evidence-proof-facts")) return ceilingFailure()
    segmentationBoundaryProofs.push(freeze({
      ...segmentationProofFacts,
      fingerprint: fingerprint(segmentationProofFacts),
    }))
    consumedSegmentationContextRanges.push(context)
    if (stableBreaks != null && canonical(stableBreaks) === canonical(current)) {
      stableCount += 1
    } else {
      stableBreaks = current
      stableCount = 1
    }
    if (stableCount >= input.request.requiredStableSegmentationExpansionCount) break
  }
  if (
    stableBreaks == null
    || stableCount < input.request.requiredStableSegmentationExpansionCount
  ) return finishFailure("segmentation-not-stable")

  const hardBreaks: number[] = []
  for (const atom of input.sourceMaterial.next.atoms) {
    if (atom.kind !== "hard-break") continue
    if (!before("evidence-breaks")) return ceilingFailure()
    const offset = coverageStart + atom.relativeEndRenderedUtf16
    if (
      offset >= target.startRenderedUtf16
      && offset <= target.endRenderedUtf16
    ) hardBreaks.push(offset)
  }
  const candidateBreakOffsets = [...new Set([...stableBreaks, ...hardBreaks])]
    .sort((left, right) => left - right)
  const breakOffsets: number[] = []
  for (const offset of candidateBreakOffsets) {
    if (!before("evidence-breaks")) return ceilingFailure()
    breakOffsets.push(offset)
  }
  unusedCoverageRenderedUtf16Length = text.length - coveredUtf16Length([
    ...shapingBoundaryProofs.map((proof) => proof.verificationRange),
    ...consumedSegmentationContextRanges,
  ])
  if (!emitTopLevelFacts(14)) {
    return invalidAuthorityControl ? blockedNotInvoked() : blockedWorkLimit()
  }
  const receipt = close("producer-response")
  if (receipt?.status !== "closed") return NOT_INVOKED
  const work = completedWork(receipt.visitedEvidenceNodeCount)
  const facts = {
    source: "vnext-text-block-transition-producer-response-v2" as const,
    contractVersion: 2 as const,
    requestFingerprint: input.request.fingerprint,
    sourceMaterialFingerprint: input.sourceMaterial.fingerprint,
    runtimeIdentity: input.runtime.identity,
    nextEvidenceTargetRange: input.request.next.evidenceTargetRange,
    shapingRuns: freeze(shapingRuns),
    breakOffsets: freeze(breakOffsets),
    shapingBoundaryProofs: freeze(shapingBoundaryProofs),
    segmentationBoundaryProofs: freeze(segmentationBoundaryProofs),
    sourceTopologyFingerprint: input.sourceMaterial.sourceTopologyFingerprint,
    work,
    contracts: CONTRACTS,
  }
  const response = freeze({ ...facts, fingerprint: fingerprint(facts) })
  return freeze({
    status: "accepted" as const,
    response,
    failure: null,
    issues: freeze([]),
  })
}
