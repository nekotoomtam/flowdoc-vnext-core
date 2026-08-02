import {
  createVNextCompactFingerprint,
  scaleVNextFontMetricToLayoutUnitV1,
  type VNextTextBlockResolvedShapingRunV1,
  type VNextTextBlockTransitionEvidenceRequestV2,
  type VNextTextBlockTransitionProducerContractsV2,
  type VNextTextBlockTransitionProducerFailureCodeV2,
  type VNextTextBlockTransitionProducerFailureV2,
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
  for (const scalar of text) {
    const codePoint = scalar.codePointAt(0)!
    byte += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4
    utf16 += scalar.length
    output.set(utf16, byte)
  }
  return output
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

function ownData(value: unknown, key: string): unknown {
  try {
    if (value == null || typeof value !== "object") return undefined
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    return descriptor != null && Object.hasOwn(descriptor, "value") ? descriptor.value : undefined
  } catch {
    return undefined
  }
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

function invalidInputFailure(input: {
  readonly request: unknown
  readonly sourceMaterial: unknown
  readonly runtimeIdentity: unknown
}): FlowDocUnifiedIncrementalEvidenceResultV2 {
  const requestFingerprint = ownData(input.request, "fingerprint")
  const sourceMaterialFingerprint = ownData(input.sourceMaterial, "fingerprint")
  const runtimeIdentity = input.runtimeIdentity != null && typeof input.runtimeIdentity === "object" && safeDataTree(input.runtimeIdentity)
    ? input.runtimeIdentity as VNextTextBlockTransitionProducerRuntimeIdentityV2
    : freeze({
        source: "vnext-text-block-transition-producer-runtime-v2" as const,
        contractVersion: 2 as const,
        runtime: "node-native-mr1-range" as const,
        engineBuildFingerprint: "invalid",
        fontBackendFingerprint: "invalid",
        unitPolicyFingerprint: "invalid",
        fontStyleUnitDependencyFingerprint: "invalid",
        producerRuntimeRequirementFingerprint: "invalid",
        fingerprint: "invalid",
      })
  const work = freeze({
    requestedAtomCount: 0,
    requestedClusterCount: 0,
    consumedAtomCount: 0,
    consumedClusterCount: 0,
    unusedCoverageRenderedUtf16Length: 0,
    visitedEvidenceNodeCount: 0,
    completeNextInputTraversalCount: 0 as const,
    completeNextInputComparisonCount: 0 as const,
  })
  const facts = {
    source: "vnext-text-block-transition-producer-failure-v2" as const,
    contractVersion: 2 as const,
    requestFingerprint: typeof requestFingerprint === "string" ? requestFingerprint : "invalid",
    sourceMaterialFingerprint: typeof sourceMaterialFingerprint === "string" ? sourceMaterialFingerprint : "invalid",
    runtimeIdentity,
    code: "invalid-request-scoped-material" as const,
    completedWork: work,
    contracts: CONTRACTS,
  }
  return freeze({ status: "blocked" as const, response: null, failure: { ...facts, fingerprint: fingerprint(facts) }, issues: freeze([]) })
}

interface UnifiedIncrementalEvidenceInputV2 {
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly runtime: FlowDocUnifiedIncrementalEvidenceRuntimeV2
}

function snapshotAdapterInput(value: unknown): UnifiedIncrementalEvidenceInputV2 | null {
  if (!exactKeys(value, ["request", "sourceMaterial", "runtime"])) return null
  const request = ownData(value, "request")
  const sourceMaterial = ownData(value, "sourceMaterial")
  const runtime = ownData(value, "runtime")
  if (!exactKeys(runtime, ["identity", "shapeRange", "segmentRange"])) return null
  const identity = ownData(runtime, "identity")
  const shapeRange = ownData(runtime, "shapeRange")
  const segmentRange = ownData(runtime, "segmentRange")
  if (typeof shapeRange !== "function" || typeof segmentRange !== "function") return null
  return { request, sourceMaterial, runtime: { identity, shapeRange, segmentRange } } as UnifiedIncrementalEvidenceInputV2
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

function clustersFromShape(input: {
  shape: FlowDocTextEngineMr1RangeShapeFactsV1
  targetStartLocal: number
  targetEndLocal: number
  globalCoverageStart: number
  fontSizeLayoutUnit: number
}): VNextTextBlockResolvedShapingRunV1["clusters"] | null {
  const utf16Offsets = utf16ByByte(input.shape.fullText)
  const targetStartByte = byteByUtf16(input.shape.fullText).get(input.targetStartLocal)
  const targetEndByte = byteByUtf16(input.shape.fullText).get(input.targetEndLocal)
  if (targetStartByte == null || targetEndByte == null) return null
  const advanceByCluster = new Map<number, number>()
  for (const glyph of input.shape.glyphs) {
    const next = (advanceByCluster.get(glyph.cluster) ?? 0) + glyph.xAdvance
    if (!Number.isSafeInteger(next) || next < 0) return null
    advanceByCluster.set(glyph.cluster, next)
  }
  const starts = [...advanceByCluster.keys()].sort((a, b) => a - b)
  const output: VNextTextBlockResolvedShapingRunV1["clusters"] = []
  for (let index = 0; index < starts.length; index += 1) {
    const startByte = starts[index]!
    const endByte = starts[index + 1] ?? input.shape.rangeEndByte
    if (startByte < targetStartByte || startByte >= targetEndByte) continue
    if (endByte > targetEndByte) return null
    const start = utf16Offsets.get(startByte)
    const end = utf16Offsets.get(endByte)
    const advance = advanceByCluster.get(startByte)
    if (start == null || end == null || end <= start || advance == null) return null
    const scaled = scaleVNextFontMetricToLayoutUnitV1({ fontMetric: advance, fontSizeLayoutUnit: input.fontSizeLayoutUnit, unitsPerEm: input.shape.unitsPerEm })
    if (scaled.status !== "accepted" || scaled.layoutUnit < 0) return null
    output.push({ index: output.length, renderStartOffset: input.globalCoverageStart + start, renderEndOffset: input.globalCoverageStart + end, advanceLayoutUnit: scaled.layoutUnit })
  }
  return output.length > 0 && output[0]!.renderStartOffset === input.globalCoverageStart + input.targetStartLocal && output.at(-1)!.renderEndOffset === input.globalCoverageStart + input.targetEndLocal ? output : null
}

export function createFlowDocTextEngineUnifiedIncrementalEvidenceV2(input: {
  readonly request: VNextTextBlockTransitionEvidenceRequestV2
  readonly sourceMaterial: VNextTextBlockTransitionProducerSourceMaterialV2
  readonly runtime: FlowDocUnifiedIncrementalEvidenceRuntimeV2
}): FlowDocUnifiedIncrementalEvidenceResultV2
export function createFlowDocTextEngineUnifiedIncrementalEvidenceV2(input: unknown): FlowDocUnifiedIncrementalEvidenceResultV2
export function createFlowDocTextEngineUnifiedIncrementalEvidenceV2(value: unknown): FlowDocUnifiedIncrementalEvidenceResultV2 {
  const input = snapshotAdapterInput(value)
  if (input == null) {
    const runtime = ownData(value, "runtime")
    return invalidInputFailure({ request: ownData(value, "request"), sourceMaterial: ownData(value, "sourceMaterial"), runtimeIdentity: ownData(runtime, "identity") })
  }
  if (!validMaterial(input)) return invalidInputFailure({ request: input.request, sourceMaterial: input.sourceMaterial, runtimeIdentity: input.runtime.identity })
  let work = baseWork(input.sourceMaterial)
  const text = composeCoverageText(input.sourceMaterial)
  if (text == null) return failure({ ...input, code: "invalid-request-scoped-material", work })
  const coverageStart = input.request.next.coverageRange.startRenderedUtf16
  const target = input.request.next.evidenceTargetRange
  const targetStartLocal = target.startRenderedUtf16 - coverageStart
  const targetEndLocal = target.endRenderedUtf16 - coverageStart
  const shapeRange = input.request.next.shapeVerificationRange
  const shapeStartLocal = shapeRange.startRenderedUtf16 - coverageStart
  const shapeEndLocal = shapeRange.endRenderedUtf16 - coverageStart
  if (targetStartLocal < 0 || targetEndLocal < targetStartLocal || shapeStartLocal < 0 || shapeStartLocal > targetStartLocal || shapeEndLocal < targetEndLocal || shapeEndLocal > text.length) return failure({ ...input, code: "invalid-request-scoped-material", work })

  const shapingRuns: VNextTextBlockResolvedShapingRunV1[] = []
  const shapingBoundaryProofs: VNextTextBlockTransitionShapingBoundaryProofV2[] = []
  const segmentationBoundaryProofs: VNextTextBlockTransitionSegmentationBoundaryProofV2[] = []
  let consumedAtoms = 0
  let consumedClusters = 0
  let visited = 0
  const visit = (): boolean => {
    if (visited >= input.sourceMaterial.producerWorkCeilings.maximumVisitedEvidenceNodeCount) return false
    visited += 1
    return true
  }
  const inspectRuntimeIntegerArray = (value: unknown):
    | { readonly status: "accepted"; readonly values: number[] }
    | { readonly status: "invalid" | "ceiling" } => {
    const length = exactArrayLength(value)
    if (length == null) return { status: "invalid" }
    const values: number[] = []
    for (let index = 0; index < length; index += 1) {
      if (!visit()) return { status: "ceiling" }
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
      if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true || !Number.isSafeInteger(descriptor.value)) return { status: "invalid" }
      values.push(descriptor.value as number)
    }
    return { status: "accepted", values }
  }
  type StyledAtom = Extract<(typeof input.sourceMaterial.next.atoms)[number], { readonly resolvedStyle: unknown }>
  type ResolvedStyle = StyledAtom["resolvedStyle"]
  const partitions: Array<{
    start: number
    end: number
    style: ResolvedStyle
    atomFingerprints: string[]
  }> = []
  for (const atom of input.sourceMaterial.next.atoms) {
    if (!visit()) {
      work = { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited }
      return failure({ ...input, code: "work-ceiling-before-visit", work })
    }
    consumedAtoms += 1
    if (atom.kind === "hard-break" || atom.kind === "inline-image-boundary") {
      continue
    }
    const atomStart = coverageStart + atom.relativeStartRenderedUtf16
    const atomEnd = coverageStart + atom.relativeEndRenderedUtf16
    const previous = partitions.at(-1)
    if (previous != null && previous.end === atomStart && canonical(previous.style) === canonical(atom.resolvedStyle)) {
      previous.end = atomEnd
      previous.atomFingerprints.push(atom.fingerprint)
    } else {
      partitions.push({ start: atomStart, end: atomEnd, style: atom.resolvedStyle, atomFingerprints: [atom.fingerprint] })
    }
  }
  for (const partition of partitions) {
    const runStart = Math.max(partition.start, target.startRenderedUtf16)
    const runEnd = Math.min(partition.end, target.endRenderedUtf16)
    if (runEnd <= runStart) continue
    const verificationStart = Math.max(partition.start, shapeRange.startRenderedUtf16)
    const verificationEnd = Math.min(partition.end, shapeRange.endRenderedUtf16)
    const targetScalarUpperBound = [...text.slice(runStart - coverageStart, runEnd - coverageStart)].length
    if (targetScalarUpperBound > input.sourceMaterial.producerWorkCeilings.maximumRequestedClusterCount - consumedClusters) return failure({ ...input, code: "work-ceiling-before-visit", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: input.sourceMaterial.producerWorkCeilings.maximumRequestedClusterCount, visitedEvidenceNodeCount: visited } })
    const face = input.sourceMaterial.fontFaces.find((candidate) => candidate.fontFaceId === partition.style.fontFaceId)
    if (face == null) return failure({ ...input, code: "pinned-font-unavailable", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    if (!visit()) return failure({ ...input, code: "work-ceiling-before-visit", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
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
      return failure({ ...input, code: "pinned-font-unavailable", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    }
    if (!exactKeys(shape, ["contractVersion", "outputShapeVersion", "fullText", "fontFaceId", "fullTextByteLength", "fullTextScalarCount", "rangeStartByte", "rangeEndByte", "rangeStartUtf16", "rangeEndUtf16", "contextStartByte", "contextEndByte", "contextStartUtf16", "contextEndUtf16", "rangeText", "preContextText", "postContextText", "unitsPerEm", "ascentFontUnit", "descentFontUnit", "lineGapFontUnit", "glyphs", "summary"])) return failure({ ...input, code: "unsafe-runtime-arithmetic", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    const returnedGlyphs = ownData(shape, "glyphs")
    const returnedGlyphCount = exactArrayLength(returnedGlyphs)
    if (returnedGlyphCount == null) return failure({ ...input, code: "unsafe-runtime-arithmetic", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    const inspectedGlyphs: FlowDocTextEngineMr1RangeShapeFactsV1["glyphs"][number][] = []
    for (let glyphIndex = 0; glyphIndex < returnedGlyphCount; glyphIndex += 1) {
      if (!visit()) return failure({ ...input, code: "work-ceiling-before-visit", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
      const descriptor = Object.getOwnPropertyDescriptor(returnedGlyphs, String(glyphIndex))
      if (descriptor == null || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true || !safeDataTree(descriptor.value)) return failure({ ...input, code: "unsafe-runtime-arithmetic", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
      inspectedGlyphs.push(descriptor.value as FlowDocTextEngineMr1RangeShapeFactsV1["glyphs"][number])
    }
    const { glyphs: _uninspectedGlyphs, ...shapeHeader } = shape
    if (!safeDataTree(shapeHeader)) return failure({ ...input, code: "unsafe-runtime-arithmetic", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    shape = { ...shape, glyphs: inspectedGlyphs }
    if (!exactKeys(shape.summary, ["glyphCount", "missingGlyphCount", "totalAdvanceFontUnits", "unsafeToBreakGlyphCount"]) || !shape.glyphs.every((glyph) => exactKeys(glyph, ["index", "glyphId", "cluster", "xAdvance", "yAdvance", "xOffset", "yOffset", "unsafeToBreak"]))) return failure({ ...input, code: "unsafe-runtime-arithmetic", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    if (shape.contractVersion !== 1 || shape.outputShapeVersion !== FLOWDOC_TEXT_ENGINE_MR1_RANGE_SHAPE_FACTS_VERSION || shape.fullText !== text || shape.fullTextByteLength !== flowDocUtf8ByteLengthV1(text) || shape.fullTextScalarCount !== [...text].length || shape.fontFaceId !== face.fontFaceId || shape.rangeStartUtf16 !== runStart - coverageStart || shape.rangeEndUtf16 !== verificationEnd - coverageStart || shape.contextStartUtf16 !== verificationStart - coverageStart || shape.contextEndUtf16 !== verificationEnd - coverageStart || shape.rangeText !== text.slice(runStart - coverageStart, verificationEnd - coverageStart) || shape.preContextText !== text.slice(verificationStart - coverageStart, runStart - coverageStart) || shape.postContextText !== "" || shape.unitsPerEm !== face.unitsPerEm || shape.ascentFontUnit !== face.ascentFontUnit || shape.descentFontUnit !== face.descentFontUnit || shape.lineGapFontUnit !== face.lineGapFontUnit || shape.summary.glyphCount !== shape.glyphs.length || shape.summary.missingGlyphCount !== shape.glyphs.filter((glyph) => glyph.glyphId === 0).length) return failure({ ...input, code: "pinned-font-mismatch", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    if (shape.summary.missingGlyphCount > 0) return failure({ ...input, code: "missing-glyph", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    const byteOffsets = byteByUtf16(text)
    const runStartByte = byteOffsets.get(runStart - coverageStart)
    const runEndByte = byteOffsets.get(runEnd - coverageStart)
    if (runStartByte == null || runEndByte == null) return failure({ ...input, code: "unsafe-shaping-boundary", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    const firstTarget = shape.glyphs.find((glyph) => glyph.cluster === runStartByte)
    const rightGuard = shape.glyphs.find((glyph) => glyph.cluster === runEndByte)
    const leftAtExactBoundary = runStart === partition.start || runStart === target.startRenderedUtf16 && runStart === coverageStart
    const rightAtExactBoundary = runEnd === partition.end || runEnd === target.endRenderedUtf16 && runEnd === coverageStart + text.length
    if ((!leftAtExactBoundary && (firstTarget == null || firstTarget.unsafeToBreak)) || (!rightAtExactBoundary && (rightGuard == null || rightGuard.unsafeToBreak))) return failure({ ...input, code: "unsafe-shaping-boundary", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    const clusters = clustersFromShape({ shape, targetStartLocal: runStart - coverageStart, targetEndLocal: runEnd - coverageStart, globalCoverageStart: coverageStart, fontSizeLayoutUnit: partition.style.fontSizeLayoutUnit })
    if (clusters == null) return failure({ ...input, code: "unsafe-runtime-arithmetic", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    if (clusters.length > input.sourceMaterial.producerWorkCeilings.maximumRequestedClusterCount - consumedClusters) return failure({ ...input, code: "work-ceiling-before-visit", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: input.sourceMaterial.producerWorkCeilings.maximumRequestedClusterCount, visitedEvidenceNodeCount: visited } })
    consumedClusters += clusters.length
    const guardGlyphCount = shape.glyphs.filter((glyph) => glyph.cluster >= runEndByte).length
    const run: VNextTextBlockResolvedShapingRunV1 = {
      shapingRunId: fingerprint({ request: input.request.fingerprint, atoms: partition.atomFingerprints, runStart, runEnd }),
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
      clusters,
    }
    shapingRuns.push(freeze(run))
    const proofFacts = {
      targetRange: { startRenderedUtf16: runStart, endRenderedUtf16: runEnd },
      verificationRange: { startRenderedUtf16: verificationStart, endRenderedUtf16: verificationEnd },
      leftBoundary: leftAtExactBoundary ? "exact-style-or-block-start" as const : "safe-first-target-glyph" as const,
      rightBoundary: rightAtExactBoundary ? "exact-style-or-block-end" as const : "safe-first-right-guard-glyph" as const,
      guardGlyphCount,
      inspectedGlyphCount: returnedGlyphCount,
    }
    shapingBoundaryProofs.push(freeze({ ...proofFacts, fingerprint: fingerprint(proofFacts) }))
  }

  let stableBreaks: readonly number[] | null = null
  let stableCount = 0
  const consumedSegmentationContextRanges: Array<{ startRenderedUtf16: number; endRenderedUtf16: number }> = []
  for (const context of input.request.nextSegmentationContextRanges) {
    if (!visit()) return failure({ ...input, code: "work-ceiling-before-visit", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    consumedSegmentationContextRanges.push(context)
    let facts
    try {
      facts = input.runtime.segmentRange({ text, targetStartUtf16: targetStartLocal, targetEndUtf16: targetEndLocal, contextStartUtf16: context.startRenderedUtf16 - coverageStart, contextEndUtf16: context.endRenderedUtf16 - coverageStart })
    } catch {
      return failure({ ...input, code: "segmentation-not-stable", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    }
    if (!exactKeys(facts, ["contractVersion", "outputShapeVersion", "fullText", "fullTextByteLength", "fullTextScalarCount", "targetStartByte", "targetEndByte", "targetStartUtf16", "targetEndUtf16", "contextStartByte", "contextEndByte", "contextStartUtf16", "contextEndUtf16", "contextText", "contextBreakByteOffsets", "contextBreakUtf16Offsets", "targetBreakByteOffsets", "targetBreakUtf16Offsets", "summary"])) return failure({ ...input, code: "segmentation-not-stable", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    const contextBreakByteOffsets = inspectRuntimeIntegerArray(ownData(facts, "contextBreakByteOffsets"))
    const contextBreakUtf16Offsets = contextBreakByteOffsets.status === "accepted" ? inspectRuntimeIntegerArray(ownData(facts, "contextBreakUtf16Offsets")) : contextBreakByteOffsets
    const targetBreakByteOffsets = contextBreakUtf16Offsets.status === "accepted" ? inspectRuntimeIntegerArray(ownData(facts, "targetBreakByteOffsets")) : contextBreakUtf16Offsets
    const targetBreakUtf16Offsets = targetBreakByteOffsets.status === "accepted" ? inspectRuntimeIntegerArray(ownData(facts, "targetBreakUtf16Offsets")) : targetBreakByteOffsets
    const offsetInspections = [contextBreakByteOffsets, contextBreakUtf16Offsets, targetBreakByteOffsets, targetBreakUtf16Offsets]
    if (offsetInspections.some((inspection) => inspection.status === "ceiling")) return failure({ ...input, code: "work-ceiling-before-visit", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    if (offsetInspections.some((inspection) => inspection.status !== "accepted") || contextBreakByteOffsets.status !== "accepted" || contextBreakUtf16Offsets.status !== "accepted" || targetBreakByteOffsets.status !== "accepted" || targetBreakUtf16Offsets.status !== "accepted") return failure({ ...input, code: "segmentation-not-stable", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    const { contextBreakByteOffsets: _contextBytes, contextBreakUtf16Offsets: _contextUtf16, targetBreakByteOffsets: _targetBytes, targetBreakUtf16Offsets: _targetUtf16, ...segmentationHeader } = facts
    if (!safeDataTree(segmentationHeader)) return failure({ ...input, code: "segmentation-not-stable", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    facts = {
      ...facts,
      contextBreakByteOffsets: contextBreakByteOffsets.values,
      contextBreakUtf16Offsets: contextBreakUtf16Offsets.values,
      targetBreakByteOffsets: targetBreakByteOffsets.values,
      targetBreakUtf16Offsets: targetBreakUtf16Offsets.values,
    }
    if (!exactKeys(facts.summary, ["contextBreakCount", "targetBreakCount", "artificialContextBoundaryBreakCount"])) return failure({ ...input, code: "segmentation-not-stable", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    const expectedContextStart = context.startRenderedUtf16 - coverageStart
    const expectedContextEnd = context.endRenderedUtf16 - coverageStart
    const expectedArtificialBoundaryCount = (expectedContextStart > 0 ? 1 : 0) + (expectedContextEnd < text.length ? 1 : 0)
    if (facts.contractVersion !== 1 || facts.outputShapeVersion !== FLOWDOC_TEXT_ENGINE_MR1_RANGE_SEGMENTATION_FACTS_VERSION || facts.fullText !== text || facts.fullTextByteLength !== flowDocUtf8ByteLengthV1(text) || facts.fullTextScalarCount !== [...text].length || facts.targetStartUtf16 !== targetStartLocal || facts.targetEndUtf16 !== targetEndLocal || facts.contextStartUtf16 !== expectedContextStart || facts.contextEndUtf16 !== expectedContextEnd || facts.contextText !== text.slice(expectedContextStart, expectedContextEnd) || facts.summary.targetBreakCount !== facts.targetBreakUtf16Offsets.length || facts.summary.contextBreakCount !== facts.contextBreakUtf16Offsets.length || facts.summary.artificialContextBoundaryBreakCount !== expectedArtificialBoundaryCount || !validSegmentationOffsets(facts) || facts.targetBreakUtf16Offsets.some((offset, index, offsets) => !Number.isSafeInteger(offset) || offset < targetStartLocal || offset > targetEndLocal || (index > 0 && offset <= offsets[index - 1]!))) return failure({ ...input, code: "segmentation-not-stable", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
    const current = facts.targetBreakUtf16Offsets.filter((offset) => offset >= targetStartLocal && offset <= targetEndLocal).map((offset) => coverageStart + offset)
    const segmentationProofFacts = {
      contextRange: context,
      contextBreakCount: facts.contextBreakUtf16Offsets.length,
      targetBreakOffsets: freeze(current),
      inspectedOffsetCount: facts.contextBreakByteOffsets.length + facts.contextBreakUtf16Offsets.length + facts.targetBreakByteOffsets.length + facts.targetBreakUtf16Offsets.length,
    }
    segmentationBoundaryProofs.push(freeze({ ...segmentationProofFacts, fingerprint: fingerprint(segmentationProofFacts) }))
    if (stableBreaks != null && canonical(stableBreaks) === canonical(current)) stableCount += 1
    else { stableBreaks = current; stableCount = 1 }
    if (stableCount >= input.request.requiredStableSegmentationExpansionCount) break
  }
  if (stableBreaks == null || stableCount < input.request.requiredStableSegmentationExpansionCount) return failure({ ...input, code: "segmentation-not-stable", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
  const hardBreaks = input.sourceMaterial.next.atoms.filter((atom) => atom.kind === "hard-break").map((atom) => coverageStart + atom.relativeEndRenderedUtf16).filter((offset) => offset >= target.startRenderedUtf16 && offset <= target.endRenderedUtf16)
  const breakOffsets = [...new Set([...stableBreaks, ...hardBreaks])].sort((a, b) => a - b)
  for (let evidenceNode = 0; evidenceNode < breakOffsets.length; evidenceNode += 1) {
    if (!visit()) return failure({ ...input, code: "work-ceiling-before-visit", work: { ...work, consumedAtomCount: consumedAtoms, consumedClusterCount: consumedClusters, visitedEvidenceNodeCount: visited } })
  }
  work = freeze({
    ...work,
    consumedAtomCount: consumedAtoms,
    consumedClusterCount: consumedClusters,
    unusedCoverageRenderedUtf16Length: text.length - coveredUtf16Length([
      ...shapingBoundaryProofs.map((proof) => proof.verificationRange),
      ...consumedSegmentationContextRanges,
    ]),
    visitedEvidenceNodeCount: visited,
  })
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
  return freeze({ status: "accepted" as const, response, failure: null, issues: freeze([]) })
}
