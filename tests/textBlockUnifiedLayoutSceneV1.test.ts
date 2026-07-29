import { describe, expect, it } from "vitest"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import {
  layoutVNextTextBlockAuthoredBoxGeometryV2,
} from "../src/index.js"
import {
  inspectVNextTextBlockUnifiedLayoutSceneV1,
  projectVNextTextBlockUnifiedLayoutSceneV1,
} from "../src/layout/textBlockUnifiedLayoutSceneV1.js"
import { acceptedInlineImageSpatialFixture } from "./helpers/textBlockInlineImageFlowV2.js"

function acceptedGeometry(
  content: "text-only" | "image-only" | "text-image-text" | "text-image-text-break" = "text-image-text",
) {
  const fixture = acceptedInlineImageSpatialFixture({ content })
  const result = layoutVNextTextBlockAuthoredBoxGeometryV2({
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
    persistentFlowTree: fixture.tree,
    spatialIndex: fixture.spatialIndex,
  })
  if (result.status !== "accepted") throw new Error("authored-box fixture blocked")
  return result
}

function acceptedTwoLineHardBreakGeometry() {
  const fixture = acceptedInlineImageSpatialFixture({
    content: "text-image-text-break",
    width: { value: 84, unit: "pt" },
  })
  const result = layoutVNextTextBlockAuthoredBoxGeometryV2({
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
    persistentFlowTree: fixture.tree,
    spatialIndex: fixture.spatialIndex,
  })
  if (result.status !== "accepted") throw new Error("two-line authored-box fixture blocked")
  return result
}

describe("TextBlock unified layout scene v1", () => {
  it("projects a clone-safe mixed renderer scene from exact authored geometry", () => {
    const geometry = acceptedGeometry()
    const result = projectVNextTextBlockUnifiedLayoutSceneV1({ authoredBoxGeometry: geometry })
    if (result.status !== "accepted") throw new Error("scene projection blocked")

    expect(result.scene).toMatchObject({
      source: "vnext-text-block-unified-layout-scene-v1",
      contractVersion: 1,
      chunks: geometry.lines.map((line, chunkIndex) => ({
        chunkIndex,
        lineIndex: line.index,
        line,
      })),
      summary: geometry.summary,
      contracts: {
        rendererConsumptionOnly: true,
        rendererMayMeasureText: false,
        rendererMayRelayout: false,
        structuredCloneSafe: true,
        incrementalDeliveryClaim: false,
        stagedEditorApply: false,
        mayPublishLayout: false,
        productionBinding: false,
      },
    })
    expect(structuredClone(result.scene)).toEqual(result.scene)
    expect(result.scene.work).toMatchObject({
      visitedLineCount: geometry.lines.length,
      visitedFragmentCount: geometry.summary.textFragmentCount + geometry.summary.inlineImageFragmentCount,
      emittedChunkCount: geometry.lines.length,
      completeSceneProjectionCount: 1,
    })
    expect(result.scene.work.estimatedPayloadByteCount).toBeGreaterThan(0)
    expect(inspectVNextTextBlockUnifiedLayoutSceneV1(result.scene)).toEqual({
      status: "valid",
      fingerprint: result.scene.fingerprint,
    })
  })

  it.each(["text-only", "image-only", "text-image-text"] as const)(
    "retains compositional scene facts for %s authored geometry",
    (content) => {
      const geometry = acceptedGeometry(content)
      const result = projectVNextTextBlockUnifiedLayoutSceneV1({ authoredBoxGeometry: geometry })
      if (result.status !== "accepted") throw new Error("scene projection blocked")

      expect(result.scene.chunks.map((chunk) => chunk.fingerprint)).toHaveLength(geometry.lines.length)
      expect(result.scene.chunkFingerprintChain).toHaveLength(geometry.lines.length)
      expect(new Set(result.scene.chunkFingerprintChain)).toHaveLength(geometry.lines.length)
    },
  )

  it("preserves distinct chunks and compositional chain order across a hard-break boundary", () => {
    const geometry = acceptedTwoLineHardBreakGeometry()
    const result = projectVNextTextBlockUnifiedLayoutSceneV1({ authoredBoxGeometry: geometry })
    if (result.status !== "accepted") throw new Error("scene projection blocked")

    expect(result.scene.chunks).toHaveLength(geometry.lines.length)
    expect(result.scene.chunks.length).toBeGreaterThan(1)
    expect(result.scene.chunks[0]?.line).toBe(geometry.lines[0])
    expect(result.scene.chunks[1]?.line).toBe(geometry.lines[1])
    const firstChunk = result.scene.chunks[0]
    const secondChunk = result.scene.chunks[1]
    if (firstChunk == null || secondChunk == null) throw new Error("two chunks expected")
    const firstChain = createVNextCompactFingerprint(stringifyVNextCanonicalJson({
      previousChunkFingerprintChain: null,
      chunkFingerprint: firstChunk.fingerprint,
    }))
    const secondChain = createVNextCompactFingerprint(stringifyVNextCanonicalJson({
      previousChunkFingerprintChain: firstChain,
      chunkFingerprint: secondChunk.fingerprint,
    }))
    expect(result.scene.chunkFingerprintChain).toEqual([firstChain, secondChain])
  })

  it("blocks non-authoritative input envelopes and never reads an accessor", () => {
    const geometry = acceptedGeometry()
    let accessorReadCount = 0
    const accessorEnvelope = Object.create(null)
    Object.defineProperty(accessorEnvelope, "authoredBoxGeometry", {
      enumerable: true,
      get: () => {
        accessorReadCount += 1
        return geometry
      },
    })
    const classEnvelope = new (class SceneEnvelope {
      authoredBoxGeometry = geometry
    })()
    const throwingProxy = new Proxy({ authoredBoxGeometry: geometry }, {
      ownKeys: () => { throw new Error("must not enumerate proxy") },
    })
    expect(projectVNextTextBlockUnifiedLayoutSceneV1({
      authoredBoxGeometry: geometry,
      bindProductionLayout: true,
    })).toMatchObject({
      status: "blocked",
      scene: null,
      issues: [{ code: "production-binding-forbidden" }],
    })
    const rejected = [
      projectVNextTextBlockUnifiedLayoutSceneV1({ authoredBoxGeometry: geometry, bindProductionLayout: undefined }),
      projectVNextTextBlockUnifiedLayoutSceneV1({ authoredBoxGeometry: geometry, extra: true }),
      projectVNextTextBlockUnifiedLayoutSceneV1(accessorEnvelope),
      projectVNextTextBlockUnifiedLayoutSceneV1(classEnvelope),
      projectVNextTextBlockUnifiedLayoutSceneV1(throwingProxy),
      projectVNextTextBlockUnifiedLayoutSceneV1({ authoredBoxGeometry: structuredClone(geometry) }),
    ]

    expect(accessorReadCount).toBe(0)
    for (const result of rejected) {
      expect(result).toMatchObject({ status: "blocked", scene: null, issues: [{ code: "invalid-input" }] })
    }
  })

  it("keeps clone, reordered chunks, and re-fingerprinted copies outside Core authority", () => {
    const geometry = acceptedTwoLineHardBreakGeometry()
    const projected = projectVNextTextBlockUnifiedLayoutSceneV1({ authoredBoxGeometry: geometry })
    if (projected.status !== "accepted") throw new Error("scene projection blocked")
    const clone = structuredClone(projected.scene)
    const reordered = structuredClone(projected.scene)
    ;(reordered.chunks as unknown as unknown[]).reverse()
    expect(reordered.chunks.map((chunk) => chunk.fingerprint)).not.toEqual(
      projected.scene.chunks.map((chunk) => chunk.fingerprint),
    )
    const refingerprinted = structuredClone(projected.scene) as typeof projected.scene & {
      summary: { outerHeightLayoutUnit: number }
      fingerprint: string
    }
    refingerprinted.summary.outerHeightLayoutUnit += 1
    refingerprinted.fingerprint = createVNextCompactFingerprint(stringifyVNextCanonicalJson({
      source: refingerprinted.source,
      contractVersion: refingerprinted.contractVersion,
      documentId: refingerprinted.documentId,
      sectionId: refingerprinted.sectionId,
      textBlockId: refingerprinted.textBlockId,
      instanceRevision: refingerprinted.instanceRevision,
      layoutId: refingerprinted.layoutId,
      authoredBoxGeometryFingerprint: refingerprinted.authoredBoxGeometryFingerprint,
      finalChunkFingerprintChain: refingerprinted.chunkFingerprintChain.at(-1) ?? null,
      summary: refingerprinted.summary,
      work: refingerprinted.work,
      contracts: refingerprinted.contracts,
      mayPublishLayout: refingerprinted.mayPublishLayout,
      productionBinding: refingerprinted.productionBinding,
    }))
    expect(refingerprinted.fingerprint).not.toBe(projected.scene.fingerprint)

    for (const value of [clone, reordered, refingerprinted]) {
      expect(inspectVNextTextBlockUnifiedLayoutSceneV1(value)).toMatchObject({
        status: "invalid",
        code: "unregistered-unified-layout-scene",
      })
    }
  })
})
