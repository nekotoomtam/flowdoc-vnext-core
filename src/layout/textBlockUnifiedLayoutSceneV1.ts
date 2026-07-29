import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import {
  inspectVNextTextBlockAuthoredBoxGeometryV2,
} from "./textBlockAuthoredBoxGeometryV2.js"
import type {
  VNextTextBlockUnifiedLayoutSceneInputV1,
  VNextTextBlockUnifiedLayoutSceneInspectionV1,
  VNextTextBlockUnifiedLayoutSceneIssueV1,
  VNextTextBlockUnifiedLayoutSceneResultV1,
  VNextTextBlockUnifiedLayoutSceneV1,
} from "./textBlockUnifiedLayoutSceneContractV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_SOURCE,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_VERSION,
} from "./textBlockUnifiedLayoutSceneContractV1.js"
import {
  deepFreezeSpatialV1,
  spatialFingerprintV1,
} from "./textBlockSpatialIndexInternalsV1.js"

type StrictSceneInput = VNextTextBlockUnifiedLayoutSceneInputV1

const scenes = new WeakMap<object, { fingerprint: string }>()

function issue(
  code: VNextTextBlockUnifiedLayoutSceneIssueV1["code"],
  path: string,
  message: string,
): VNextTextBlockUnifiedLayoutSceneIssueV1 {
  return { code, severity: "error", path, message }
}

function blocked(
  item: VNextTextBlockUnifiedLayoutSceneIssueV1,
): VNextTextBlockUnifiedLayoutSceneResultV1 {
  return deepFreezeSpatialV1({ status: "blocked" as const, scene: null, issues: [item] })
}

function strictInput(input: unknown): StrictSceneInput | null {
  try {
    if (input == null || typeof input !== "object" || Array.isArray(input)) return null
    const prototype = Object.getPrototypeOf(input)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(input).length !== 0) return null
    const keys = Reflect.ownKeys(input)
    const required = ["authoredBoxGeometry"] as const
    const allowed = [...required, "bindProductionLayout"]
    if (
      keys.length < required.length
      || keys.length > allowed.length
      || required.some((key) => !keys.includes(key))
      || keys.some((key) => typeof key !== "string" || !allowed.includes(key))
    ) return null
    const values: Record<string, unknown> = Object.create(null)
    for (const key of keys) {
      if (typeof key !== "string") return null
      const descriptor = Object.getOwnPropertyDescriptor(input, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      values[key] = descriptor.value
    }
    if (
      Object.hasOwn(values, "bindProductionLayout")
      && typeof values.bindProductionLayout !== "boolean"
    ) return null
    return values as StrictSceneInput
  } catch {
    return null
  }
}

function utf8ByteCount(value: unknown): number {
  return new TextEncoder().encode(stringifyVNextCanonicalJson(value)).byteLength
}

function sceneShellIsFrozen(value: unknown): boolean {
  if (value == null || typeof value !== "object" || !Object.isFrozen(value)) return false
  const scene = value as VNextTextBlockUnifiedLayoutSceneV1
  return (
    Object.isFrozen(scene.chunks)
    && Object.isFrozen(scene.chunkFingerprintChain)
    && Object.isFrozen(scene.summary)
    && Object.isFrozen(scene.work)
    && Object.isFrozen(scene.contracts)
    && scene.chunks.every((chunk) => Object.isFrozen(chunk))
  )
}

export function projectVNextTextBlockUnifiedLayoutSceneV1(
  input: VNextTextBlockUnifiedLayoutSceneInputV1,
): VNextTextBlockUnifiedLayoutSceneResultV1
export function projectVNextTextBlockUnifiedLayoutSceneV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutSceneResultV1
export function projectVNextTextBlockUnifiedLayoutSceneV1(
  input: unknown,
): VNextTextBlockUnifiedLayoutSceneResultV1 {
  const envelope = strictInput(input)
  if (envelope == null) {
    return blocked(issue("invalid-input", "input", "unified layout scene requires a strict accessor-free data envelope"))
  }
  if (envelope.bindProductionLayout === true) {
    return blocked(issue("production-binding-forbidden", "bindProductionLayout", "unified layout scene cannot bind production layout"))
  }
  if (inspectVNextTextBlockAuthoredBoxGeometryV2(envelope.authoredBoxGeometry).status !== "valid") {
    return blocked(issue("invalid-input", "authoredBoxGeometry", "unified layout scene requires exact registered authored-box geometry"))
  }

  const chunks = envelope.authoredBoxGeometry.lines.map((line, chunkIndex) => deepFreezeSpatialV1({
    chunkIndex,
    lineIndex: line.index,
    line,
    fingerprint: spatialFingerprintV1({
      chunkIndex,
      lineIndex: line.index,
      lineFingerprint: line.fingerprint,
    }),
  }))
  const chunkFingerprintChain: string[] = []
  for (const chunk of chunks) {
    chunkFingerprintChain.push(spatialFingerprintV1({
      previousChunkFingerprintChain: chunkFingerprintChain.at(-1) ?? null,
      chunkFingerprint: chunk.fingerprint,
    }))
  }
  const workWithoutEstimate = {
    visitedLineCount: envelope.authoredBoxGeometry.lines.length,
    visitedFragmentCount: envelope.authoredBoxGeometry.summary.textFragmentCount
      + envelope.authoredBoxGeometry.summary.inlineImageFragmentCount,
    emittedChunkCount: chunks.length,
    completeSceneProjectionCount: 1 as const,
  }
  const summary = { ...envelope.authoredBoxGeometry.summary }
  const contracts = {
    rendererConsumptionOnly: true as const,
    rendererMayMeasureText: false as const,
    rendererMayRelayout: false as const,
    structuredCloneSafe: true as const,
    incrementalDeliveryClaim: false as const,
    stagedEditorApply: false as const,
    mayPublishLayout: false as const,
    productionBinding: false as const,
  }
  const factsWithoutEstimate = {
    source: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SCENE_V1_VERSION,
    documentId: envelope.authoredBoxGeometry.documentId,
    sectionId: envelope.authoredBoxGeometry.sectionId,
    textBlockId: envelope.authoredBoxGeometry.textBlockId,
    instanceRevision: envelope.authoredBoxGeometry.instanceRevision,
    layoutId: envelope.authoredBoxGeometry.layoutId,
    authoredBoxGeometryFingerprint: envelope.authoredBoxGeometry.fingerprint,
    chunks,
    chunkFingerprintChain,
    summary,
    work: workWithoutEstimate,
    contracts,
    mayPublishLayout: false as const,
    productionBinding: false as const,
  }
  const work = {
    ...workWithoutEstimate,
    estimatedPayloadByteCount: utf8ByteCount(factsWithoutEstimate),
  }
  const facts = { ...factsWithoutEstimate, work }
  const fingerprintFacts = {
    source: facts.source,
    contractVersion: facts.contractVersion,
    documentId: facts.documentId,
    sectionId: facts.sectionId,
    textBlockId: facts.textBlockId,
    instanceRevision: facts.instanceRevision,
    layoutId: facts.layoutId,
    authoredBoxGeometryFingerprint: facts.authoredBoxGeometryFingerprint,
    finalChunkFingerprintChain: facts.chunkFingerprintChain.at(-1) ?? null,
    summary: facts.summary,
    work: facts.work,
    contracts: facts.contracts,
    mayPublishLayout: facts.mayPublishLayout,
    productionBinding: facts.productionBinding,
  }
  const scene = deepFreezeSpatialV1({
    ...facts,
    fingerprint: spatialFingerprintV1(fingerprintFacts),
  }) as VNextTextBlockUnifiedLayoutSceneV1
  scenes.set(scene, { fingerprint: scene.fingerprint })
  return deepFreezeSpatialV1({ status: "accepted" as const, scene, issues: [] as [] })
}

export function inspectVNextTextBlockUnifiedLayoutSceneV1(
  value: unknown,
): VNextTextBlockUnifiedLayoutSceneInspectionV1 {
  if (value == null || typeof value !== "object" || !scenes.has(value)) return {
    status: "invalid",
    code: "unregistered-unified-layout-scene",
    message: "unified layout scene is not the exact process-local Core result",
  }
  if (!sceneShellIsFrozen(value)) return {
    status: "invalid",
    code: "unified-layout-scene-not-deeply-frozen",
    message: "registered unified layout scene must remain recursively frozen",
  }
  try {
    const scene = value as VNextTextBlockUnifiedLayoutSceneV1
    const binding = scenes.get(scene)
    if (binding == null || binding.fingerprint !== scene.fingerprint) return {
      status: "invalid",
      code: "unified-layout-scene-fingerprint-mismatch",
      message: "registered unified layout scene no longer matches canonical Core facts",
    }
    return { status: "valid", fingerprint: scene.fingerprint }
  } catch {
    return {
      status: "invalid",
      code: "unified-layout-scene-fingerprint-mismatch",
      message: "registered unified layout scene is not canonically fingerprintable",
    }
  }
}
