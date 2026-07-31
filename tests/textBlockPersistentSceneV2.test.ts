import { describe, expect, it } from "vitest"
import * as publicCore from "../src/index.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  createVNextTextBlockIncrementalFlowTreeCompleteInternalV1,
} from "../src/layout/textBlockIncrementalFlowTreeV1.js"
import {
  createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1,
} from "../src/layout/textBlockPersistentLayoutLineTreeV1.js"
import {
  createVNextTextBlockPersistentSceneCompleteInternalV2,
  createVNextTextBlockPersistentSceneWithForcedCollisionForTestInternalV2,
  inspectVNextTextBlockPersistentSceneIncrementalFragmentInternalV2,
  inspectVNextTextBlockPersistentSceneV2,
  lookupVNextTextBlockPersistentSceneChunkInternalV2,
  verifyVNextTextBlockPersistentSceneCandidateInternalV2,
  VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_EMPTY_ROOT_V2,
  VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_PAYLOAD_POLICY_V2,
} from "../src/layout/textBlockPersistentSceneV2.js"
import {
  createVNextTextBlockUnifiedSpatialStateCompleteInternalV1,
} from "../src/layout/textBlockUnifiedSpatialStateV1.js"
import {
  createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  createVNextTextBlockUnifiedLayoutRootV1,
} from "../src/layout/textBlockUnifiedLayoutRootV1.js"
import {
  acceptedUnifiedLayoutRootFixtureV1,
  repeatedUnifiedLayoutRootSourceFixtureV1,
} from "./helpers/textBlockUnifiedLayoutRootV1.js"
import type {
  InlineImageFlowFixtureOptions,
} from "./helpers/textBlockInlineImageFlowV2.js"

function completeInputs(
  options: InlineImageFlowFixtureOptions = {},
) {
  const accepted = acceptedUnifiedLayoutRootFixtureV1(options)
  const source = createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1({
    initialFlow: accepted.root.initialFlow,
    evidence: accepted.root.evidence,
  })
  if (source.status !== "prepared") throw new Error("source blocked")
  const flow = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
    sourceState: source.sourceState,
    evidence: accepted.root.evidence,
  })
  if (flow.status !== "prepared") throw new Error("flow blocked")
  const spatial = createVNextTextBlockUnifiedSpatialStateCompleteInternalV1({
    sourceState: source.sourceState,
    entries: options.entries ?? [],
  })
  if (spatial.status !== "prepared") throw new Error("spatial blocked")
  const lines = createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1({
    sourceState: source.sourceState,
    flowTree: flow.flowTree,
    spatialState: spatial.spatialState,
    spatialLayout: accepted.root.spatialLayout,
    authoredBoxGeometry: accepted.root.authoredBoxGeometry,
  })
  if (lines.status !== "prepared") throw new Error("line tree blocked")
  return {
    accepted,
    sourceState: source.sourceState,
    lineTree: lines.lineTree,
  }
}

function completeScene(
  options: InlineImageFlowFixtureOptions = {},
) {
  const input = completeInputs(options)
  const result = createVNextTextBlockPersistentSceneCompleteInternalV2({
    lineTree: input.lineTree,
    sourceState: input.sourceState,
  })
  if (result.status !== "prepared") {
    throw new Error(`scene blocked: ${JSON.stringify(result.issues)}`)
  }
  return { ...input, scene: result.scene, work: result.work }
}

function utf8ByteCount(value: unknown): number {
  return new TextEncoder().encode(
    stringifyVNextCanonicalJson(value),
  ).byteLength
}

function expectDefaultNodeFingerprintParity(
  node: ReturnType<typeof completeScene>["scene"]["root"],
): void {
  if (node.nodeKind === "empty") return
  if (node.nodeKind === "leaf") {
    const { fingerprint: chunkFingerprint, ...chunkFacts } = node.chunk
    expect(chunkFingerprint).toBe(createVNextCompactFingerprint(
      stringifyVNextCanonicalJson({
        contractVersion: 2,
        ...chunkFacts,
      }),
    ))
    expect(node.fingerprint).toBe(createVNextCompactFingerprint(
      stringifyVNextCanonicalJson({
        contractVersion: 2,
        nodeKind: "leaf",
        chunkFingerprint,
        summary: node.summary,
      }),
    ))
    expect(node.payloadObservation.payloadObservationFingerprint)
      .toMatch(/^sha256:/)
    return
  }
  for (const child of node.children) {
    expectDefaultNodeFingerprintParity(child)
  }
  expect(node.fingerprint).toBe(createVNextCompactFingerprint(
    stringifyVNextCanonicalJson({
      contractVersion: 2,
      nodeKind: "branch",
      height: node.height,
      childFingerprints: node.children.map((child) => child.fingerprint),
      summary: node.summary,
    }),
  ))
  expect(node.payloadObservation.payloadObservationFingerprint)
    .toMatch(/^sha256:/)
}

describe("Phase 5B Persistent Scene V2", () => {
  it("projects exact clone-safe renderer chunks without absolute positions", () => {
    const built = completeScene({
      content: "text-image-text-break",
      width: { value: 84, unit: "pt" },
    })

    expect(built.scene.summary.chunkCount)
      .toBe(built.lineTree.summary.lineCount)
    expect(built.scene.summary.lineCount)
      .toBe(built.lineTree.summary.lineCount)
    expect(built.scene.work).toMatchObject({
      completeSceneProjectionCount: 1,
      visitedLineCount: built.lineTree.summary.lineCount,
      emittedChunkCount: built.lineTree.summary.lineCount,
      incrementalCopiedNodeCount: 0,
      reusedChunkCount: 0,
      reusedSceneNodeCount: 0,
    })
    expect(structuredClone(built.scene)).toEqual(built.scene)
    expect(verifyVNextTextBlockPersistentSceneCandidateInternalV2(
      built.scene,
    )).toMatchObject({
      status: "valid-candidate",
      payloadObservationFingerprint: expect.stringMatching(/^sha256:/),
      registeredAuthority: false,
    })
    expect(inspectVNextTextBlockPersistentSceneV2(built.scene)).toMatchObject({
      status: "invalid",
      code: "scene-authority-mismatch",
    })
    expect(inspectVNextTextBlockPersistentSceneV2(
      structuredClone(built.scene),
    )).toMatchObject({
      status: "invalid",
      code: "scene-authority-mismatch",
    })

    const first = lookupVNextTextBlockPersistentSceneChunkInternalV2({
      scene: built.scene,
      chunkOrdinal: 0,
    })
    expect(first).toMatchObject({
      status: "found",
      chunkOrdinal: 0,
      leaf: {
        nodeKind: "leaf",
        chunk: {
          lineLineageId: expect.any(String),
          sourceMapping: expect.any(Array),
          lineInternals: expect.any(Object),
          contentLocalGeometry: expect.any(Object),
          authoredBoxGeometry: expect.any(Object),
          fragments: expect.any(Array),
        },
      },
      work: { completeSceneTraversalCount: 0 },
    })
    if (first.status !== "found") throw new Error("scene chunk missing")
    const serialized = JSON.stringify(first.leaf.chunk)
    expect(serialized).not.toContain("\"chunkIndex\"")
    expect(serialized).not.toContain("\"lineIndex\"")
    expect(serialized).not.toContain("\"renderStartOffset\"")
    expect(serialized).not.toContain("\"renderEndOffset\"")
    expect(first.leaf.chunk.fragments.some(
      (fragment) =>
        fragment.kind === "text"
        && fragment.paintRuns.some((paint) => paint.textColor.length > 0),
    )).toBe(true)
    expect(first.leaf.chunk.fragments.some(
      (fragment) =>
        fragment.kind === "inline-image"
        && fragment.authoredFrame.fit === "contain",
    )).toBe(true)
  })

  it("changes only Scene V2 payload authority for image paint-only drift", () => {
    const contain = completeScene({
      content: "image-only",
      fit: "contain",
    })
    const cover = completeScene({
      content: "image-only",
      fit: "cover",
      crop: { x: 0, y: 0, width: 0.5, height: 1 },
    })

    expect(contain.lineTree.fingerprint).toBe(cover.lineTree.fingerprint)
    expect(contain.scene.fingerprint).not.toBe(cover.scene.fingerprint)
    expect(contain.scene.summary.lineInternalsFingerprint)
      .toBe(cover.scene.summary.lineInternalsFingerprint)
    expect(contain.scene.summary.paintFingerprint)
      .not.toBe(cover.scene.summary.paintFingerprint)
    const containChunk = lookupVNextTextBlockPersistentSceneChunkInternalV2({
      scene: contain.scene,
      chunkOrdinal: 0,
    })
    const coverChunk = lookupVNextTextBlockPersistentSceneChunkInternalV2({
      scene: cover.scene,
      chunkOrdinal: 0,
    })
    if (
      containChunk.status !== "found"
      || coverChunk.status !== "found"
    ) throw new Error("paint-only scene chunks missing")
    expect(containChunk.leaf.chunk.fragments).not.toEqual(
      coverChunk.leaf.chunk.fragments,
    )
  })

  it("computes the exact canonical payload estimate compositionally", () => {
    const built = completeScene({
      content: "text-image-text-break",
      width: { value: 84, unit: "pt" },
    })
    let chunkBytes = 0
    for (
      let chunkOrdinal = 0;
      chunkOrdinal < built.scene.summary.chunkCount;
      chunkOrdinal += 1
    ) {
      const found = lookupVNextTextBlockPersistentSceneChunkInternalV2({
        scene: built.scene,
        chunkOrdinal,
      })
      if (found.status !== "found") throw new Error("chunk missing")
      const expected = utf8ByteCount({
        payloadPolicyVersion: 1,
        chunk: found.leaf.chunk,
      })
      expect(found.leaf.summary).not.toHaveProperty(
        "estimatedCanonicalPayloadByteCount",
      )
      expect(found.leaf.payloadObservation.estimatedCanonicalPayloadByteCount)
        .toBe(expected)
      chunkBytes += expected
    }
    const headerBytes = utf8ByteCount({
      payloadPolicyVersion: 1,
      source: "vnext-text-block-persistent-scene-v2",
      contractVersion: 2,
    })
    expect(built.scene.root.payloadObservation.estimatedCanonicalPayloadByteCount)
      .toBe(chunkBytes)
    expect(built.scene.summary).not.toHaveProperty(
      "estimatedCanonicalPayloadByteCount",
    )
    expect(built.scene.payloadObservation.estimatedCanonicalPayloadByteCount)
      .toBe(headerBytes + chunkBytes)
    expect(built.scene.payloadObservation.payloadObservationFingerprint)
      .toMatch(/^sha256:/)
    expect(built.scene.root).toHaveProperty("payloadObservation")
    expect(built.scene).not.toHaveProperty("estimatedPayloadByteCount")
    expect(built.scene.work).not.toHaveProperty("payloadByteCount")
    expectDefaultNodeFingerprintParity(built.scene.root)
  })

  it("keeps semantic Scene identity stable when only the payload policy changes", () => {
    const input = completeInputs({ content: "text-image-text" })
    const alternatePayloadPolicy = Object.freeze({
      ...VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_PAYLOAD_POLICY_V2,
      fieldAllowlistFingerprint: `sha256:${"1".repeat(64)}`,
      fingerprint: createVNextCompactFingerprint(stringifyVNextCanonicalJson({
        payloadPolicyVersion: 1,
        canonicalEncoding: "utf8-canonical-json",
        fieldAllowlistFingerprint: `sha256:${"1".repeat(64)}`,
      })),
    })
    const left = createVNextTextBlockPersistentSceneCompleteInternalV2({
      lineTree: input.lineTree,
      sourceState: input.sourceState,
    })
    const rightInput = {
      lineTree: input.lineTree,
      sourceState: input.sourceState,
      payloadPolicy: alternatePayloadPolicy,
    }
    const right = createVNextTextBlockPersistentSceneCompleteInternalV2(
      rightInput,
    )
    expect(left.status).toBe("prepared")
    expect(right.status).toBe("prepared")
    if (left.status !== "prepared" || right.status !== "prepared") return
    expect(left.scene.fingerprint).toBe(right.scene.fingerprint)
    expect(left.scene.root.fingerprint).toBe(right.scene.root.fingerprint)
    expect(left.scene.payloadObservation.payloadObservationFingerprint)
      .not.toBe(right.scene.payloadObservation.payloadObservationFingerprint)
  })

  it("uses a dedicated empty sentinel and the canonical trailing 4/5 split", () => {
    expect(VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_EMPTY_ROOT_V2).toMatchObject({
      nodeKind: "empty",
      height: 0,
      summary: {
        chunkCount: 0,
        lineCount: 0,
        textFragmentCount: 0,
        inlineImageFragmentCount: 0,
        nodeCount: 1,
      },
      payloadObservation: { estimatedCanonicalPayloadByteCount: 0 },
    })
    expect(Object.isFrozen(
      VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_EMPTY_ROOT_V2,
    )).toBe(true)

    const repeated = repeatedUnifiedLayoutRootSourceFixtureV1({
      lineCount: 9,
      includeImages: true,
    })
    const accepted = createVNextTextBlockUnifiedLayoutRootV1({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: repeated.initialFlow,
      evidence: repeated.evidence,
      spatialEntries: [],
    })
    if (accepted.status !== "accepted") throw new Error("root blocked")
    const source = createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1({
      initialFlow: accepted.root.initialFlow,
      evidence: accepted.root.evidence,
    })
    if (source.status !== "prepared") throw new Error("source blocked")
    const flow = createVNextTextBlockIncrementalFlowTreeCompleteInternalV1({
      sourceState: source.sourceState,
      evidence: accepted.root.evidence,
    })
    const spatial = createVNextTextBlockUnifiedSpatialStateCompleteInternalV1({
      sourceState: source.sourceState,
      entries: [],
    })
    if (flow.status !== "prepared" || spatial.status !== "prepared") {
      throw new Error("dependencies blocked")
    }
    const lines = createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1({
      sourceState: source.sourceState,
      flowTree: flow.flowTree,
      spatialState: spatial.spatialState,
      spatialLayout: accepted.root.spatialLayout,
      authoredBoxGeometry: accepted.root.authoredBoxGeometry,
    })
    if (lines.status !== "prepared") throw new Error("lines blocked")
    const scene = createVNextTextBlockPersistentSceneCompleteInternalV2({
      lineTree: lines.lineTree,
      sourceState: source.sourceState,
    })
    if (scene.status !== "prepared") throw new Error("scene blocked")
    expect(scene.scene.root.nodeKind).toBe("branch")
    if (scene.scene.root.nodeKind !== "branch") {
      throw new Error("scene root not branch")
    }
    expect(scene.scene.root.children.map(
      (child) => child.summary.chunkCount,
    )).toEqual([4, 5])
    expect(scene.work).toMatchObject({
      visitedLineCount: 9,
      emittedChunkCount: 9,
      createdLeafCount: 9,
      createdNodeCount: 12,
      completeSceneTraversalCount: 0,
    })
  })

  it("rejects unequal dependency records despite forced digest equality", () => {
    const contain = completeInputs({
      content: "image-only",
      fit: "contain",
    })
    const cover = completeInputs({
      content: "image-only",
      fit: "cover",
      crop: { x: 0, y: 0, width: 0.5, height: 1 },
    })
    const containScene =
      createVNextTextBlockPersistentSceneWithForcedCollisionForTestInternalV2({
        lineTree: contain.lineTree,
        sourceState: contain.sourceState,
      })
    const coverScene =
      createVNextTextBlockPersistentSceneWithForcedCollisionForTestInternalV2({
        lineTree: cover.lineTree,
        sourceState: cover.sourceState,
      })
    if (
      containScene.status !== "prepared"
      || coverScene.status !== "prepared"
    ) throw new Error("collision scenes blocked")
    expect(containScene.scene.fingerprint).toBe(coverScene.scene.fingerprint)
    expect(containScene.scene).not.toEqual(coverScene.scene)
    expect(verifyVNextTextBlockPersistentSceneCandidateInternalV2(
      containScene.scene,
    )).toMatchObject({ status: "valid-candidate" })
    expect(verifyVNextTextBlockPersistentSceneCandidateInternalV2(
      coverScene.scene,
    )).toMatchObject({ status: "valid-candidate" })

    expect(
      createVNextTextBlockPersistentSceneWithForcedCollisionForTestInternalV2({
        lineTree: contain.lineTree,
        sourceState: cover.sourceState,
      }),
    ).toMatchObject({
      status: "blocked",
      scene: null,
      issues: [{ code: "scene-dependency-binding-mismatch" }],
    })
    for (const capability of [
      "scheduler",
      "history",
      "assetStore",
      "randomAccessMutation",
      "genericSequence",
      "documentGraph",
    ]) {
      expect(containScene.scene).not.toHaveProperty(capability)
    }
    expect(Object.keys(publicCore).filter(
      (name) => name.includes("PersistentScene"),
    )).toEqual(["inspectVNextTextBlockPersistentSceneV2"])
  })

  it("provides bounded incremental-fragment inspection without scene traversal", () => {
    const built = completeScene({ content: "text-image-text" })
    const accepted =
      inspectVNextTextBlockPersistentSceneIncrementalFragmentInternalV2({
        scene: built.scene,
        copiedPathNodes: [built.scene.root],
        replacementNodes: [],
        siblingReferences: [{
          node: built.scene.root,
          fingerprint: built.scene.root.fingerprint,
          payloadObservationFingerprint:
            built.scene.root.payloadObservation.payloadObservationFingerprint,
          summary: built.scene.root.summary,
        }],
        completePreviousSceneTraversal: false,
        completeNextSceneTraversal: false,
      })
    expect(accepted).toEqual({
      status: "valid-fragment",
      work: {
        inspectedCopiedPathNodeCount: 1,
        inspectedReplacementNodeCount: 0,
        inspectedSiblingReferenceCount: 1,
        completePreviousSceneTraversalCount: 0,
        completeNextSceneTraversalCount: 0,
      },
    })
    expect(
      inspectVNextTextBlockPersistentSceneIncrementalFragmentInternalV2({
        scene: built.scene,
        copiedPathNodes: [],
        replacementNodes: [],
        siblingReferences: [],
        completePreviousSceneTraversal: true,
        completeNextSceneTraversal: false,
      }),
    ).toMatchObject({
      status: "invalid",
      code: "scene-complete-traversal-forbidden",
    })
  })

  it("blocks clones, foreign dependency pairing, and accessor envelopes", () => {
    const built = completeInputs()
    let reads = 0
    const accessor = Object.create(null)
    Object.defineProperty(accessor, "lineTree", {
      enumerable: true,
      get: () => {
        reads += 1
        return built.lineTree
      },
    })
    Object.defineProperty(accessor, "sourceState", {
      enumerable: true,
      value: built.sourceState,
    })
    const rejected = [
      createVNextTextBlockPersistentSceneCompleteInternalV2(accessor),
      createVNextTextBlockPersistentSceneCompleteInternalV2({
        lineTree: structuredClone(built.lineTree),
        sourceState: built.sourceState,
      }),
      createVNextTextBlockPersistentSceneCompleteInternalV2({
        lineTree: built.lineTree,
        sourceState: structuredClone(built.sourceState),
      }),
    ]
    expect(reads).toBe(0)
    for (const result of rejected) {
      expect(result).toMatchObject({ status: "blocked", scene: null })
    }
  })
})
