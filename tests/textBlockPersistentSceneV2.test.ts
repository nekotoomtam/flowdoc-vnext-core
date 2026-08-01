import { describe, expect, it } from "vitest"
import * as publicCore from "../src/index.js"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  bindVNextTextBlockIncrementalFlowTreeToImagePaintSourceInternalV1,
  createVNextTextBlockIncrementalFlowTreeCompleteInternalV1,
} from "../src/layout/textBlockIncrementalFlowTreeV1.js"
import * as sceneInternals from "../src/layout/textBlockPersistentSceneV2.js"
import * as transitionEvidenceInternals from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  bindVNextTextBlockPersistentLayoutLineTreeToImagePaintSourceInternalV1,
  createVNextTextBlockPersistentLayoutLineTreeCompleteInternalV1,
} from "../src/layout/textBlockPersistentLayoutLineTreeV1.js"
import {
  createVNextTextBlockPersistentSceneImagePaintTransitionCandidateInternalV2,
  createVNextTextBlockPersistentSceneCompleteInternalV2,
  createVNextTextBlockPersistentSceneWithForcedCollisionForTestInternalV2,
  inspectVNextTextBlockPersistentSceneIncrementalFragmentInternalV2,
  inspectVNextTextBlockPersistentSceneV2,
  lookupVNextTextBlockPersistentSceneChunkInternalV2,
  verifyVNextTextBlockPersistentSceneCandidateInternalV2,
  VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_EMPTY_ROOT_V2,
  VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_PAYLOAD_POLICY_V2,
  VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_POLICY_V2,
} from "../src/layout/textBlockPersistentSceneV2.js"
import {
  bindVNextTextBlockUnifiedSpatialStateToImagePaintSourceInternalV1,
  createVNextTextBlockUnifiedSpatialStateCompleteInternalV1,
} from "../src/layout/textBlockUnifiedSpatialStateV1.js"
import {
  createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1,
  createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1,
  deriveVNextTextBlockUnifiedLayoutImagePaintSummaryInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  bindVNextTextBlockUnifiedLayoutChangeInternalV1,
  getVNextTextBlockValidatedImagePaintSourceItemAuthorityInternalV1,
  getVNextTextBlockValidatedSourceTransitionVisitGuardInternalV1,
  getVNextTextBlockLimitExceededAuthorityRecordInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.js"
import {
  prepareVNextTextBlockUnifiedLayoutImagePaintSceneTransitionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionSceneInternalsV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  createVNextTextBlockUnifiedLayoutRootV1,
} from "../src/layout/textBlockUnifiedLayoutRootV1.js"
import {
  acceptedUnifiedLayoutRootFixtureV1,
  repeatedUnifiedLayoutRootSourceFixtureV1,
} from "./helpers/textBlockUnifiedLayoutRootV1.js"
import {
  acceptedUnifiedLayoutRootFixtureV2,
} from "./helpers/textBlockUnifiedLayoutRootV2.js"
import {
  imagePaintUnifiedLayoutChange5b,
} from "./helpers/textBlockUnifiedIncremental5b.js"
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

function v3ScenePaintFixture() {
  const source = repeatedUnifiedLayoutRootSourceFixtureV1({
    lineCount: 9,
    includeImages: true,
  })
  const previous = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: source.spatialEntries,
  }, VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3)
  if (previous.status !== "accepted") throw new Error("V3 scene Root blocked")
  const change = imagePaintUnifiedLayoutChange5b(previous.root, {
    inlineId: "repeat-image-4",
    fit: "cover",
    crop: { x: 0, y: 0, width: 0.5, height: 1 },
  })
  if (change.kind !== "image-paint-fact-change") {
    throw new Error("V3 scene fixture did not create image paint")
  }
  const bound = bindVNextTextBlockUnifiedLayoutChangeInternalV1({
    previousRoot: previous.root,
    change,
    workPolicy:
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
  })
  if (bound.status !== "accepted") throw new Error("V3 scene change blocked")
  const sourceItemAuthority =
    getVNextTextBlockValidatedImagePaintSourceItemAuthorityInternalV1(
      bound.validatedChange,
    )
  const sourceGuard =
    getVNextTextBlockValidatedSourceTransitionVisitGuardInternalV1(
      bound.validatedChange,
    )
  if (sourceItemAuthority == null || sourceGuard == null) {
    throw new Error("V3 scene source authority missing")
  }
  const nextSource =
    createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1({
      previousSourceState: previous.root.sourceState,
      sourceItemAuthority,
      inlineId: change.inlineId,
      expectedImageSourceFingerprint: change.expectedImageSourceFingerprint,
      expectedImageDependencyFingerprint:
        change.expectedImageDependencyFingerprint,
      nextFit: change.nextFit,
      nextCrop: change.nextCrop,
      validatedChange: bound.validatedChange,
      completedCandidateWork: bound.incrementalCandidateWork,
      stageVisitGuard: sourceGuard,
    })
  if (
    nextSource.status !== "prepared"
    || nextSource.completedCandidateWork == null
  ) throw new Error("V3 scene source transition blocked")
  const aliasesAccepted =
    bindVNextTextBlockIncrementalFlowTreeToImagePaintSourceInternalV1({
      previousSourceState: previous.root.sourceState,
      nextSourceState: nextSource.sourceState,
      flowTree: previous.root.flowTree,
    })
    && bindVNextTextBlockUnifiedSpatialStateToImagePaintSourceInternalV1({
      previousSourceState: previous.root.sourceState,
      nextSourceState: nextSource.sourceState,
      spatialState: previous.root.spatialState,
    })
    && bindVNextTextBlockPersistentLayoutLineTreeToImagePaintSourceInternalV1({
      previousSourceState: previous.root.sourceState,
      nextSourceState: nextSource.sourceState,
      flowTree: previous.root.flowTree,
      spatialState: previous.root.spatialState,
      lineTree: previous.root.lineTree,
    })
  if (!aliasesAccepted) throw new Error("V3 scene aliases blocked")
  return {
    previousRoot: previous.root,
    nextSourceState: nextSource.sourceState,
    sourceItemAuthority: nextSource.sourceItemAuthority,
    inlineId: change.inlineId,
    input: {
      previousScene: previous.root.persistentScene,
      nextSourceState: nextSource.sourceState,
      lineTree: previous.root.lineTree,
      sourceItemAuthority: nextSource.sourceItemAuthority,
      inlineId: change.inlineId,
    },
    context: {
      validatedChange: bound.validatedChange,
      completedCandidateWork: nextSource.completedCandidateWork,
    },
  }
}

function sceneVisitTestBoundaries() {
  const evidence = transitionEvidenceInternals as unknown as {
    readonly setVNextTextBlockPostBindingLimitOverrideForTestInternalV1?:
      (value: unknown) => void
  }
  const scene = sceneInternals as unknown as {
    readonly setVNextTextBlockPersistentSceneTransitionOperationObserverForTestInternalV2?:
      (observer: ((value: unknown) => void) | null) => void
  }
  return {
    setLimit:
      evidence.setVNextTextBlockPostBindingLimitOverrideForTestInternalV1,
    setObserver:
      scene.setVNextTextBlockPersistentSceneTransitionOperationObserverForTestInternalV2,
  }
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
        scenePolicyFingerprint:
          VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_POLICY_V2.fingerprint,
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
      scenePolicyFingerprint:
        VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_POLICY_V2.fingerprint,
    }),
  ))
  expect(node.payloadObservation.payloadObservationFingerprint)
    .toMatch(/^sha256:/)
}

describe("Phase 5B Persistent Scene V2", () => {
  it("recomposes text/image fragment and chunk identities without merging conflicting paint", () => {
    const factory = createVNextCompactFingerprint
    for (const options of [
      {
        content: "text-image-text-break" as const,
        fit: "contain" as const,
      },
      {
        content: "text-image-text-break" as const,
        fit: "cover" as const,
        crop: { x: 0, y: 0, width: 0.5, height: 1 },
      },
    ]) {
      const built = completeScene(options)
      const sourceItems = new Map<string, string>()
      const visitSource = (
        node: typeof built.sourceState.root,
      ): void => {
        if (node.nodeKind === "leaf") {
          for (const item of node.items) {
            sourceItems.set(item.lineageId, item.paintFingerprint)
          }
          return
        }
        for (const child of node.children) visitSource(child)
      }
      visitSource(built.sourceState.root)

      for (let ordinal = 0; ordinal < built.scene.summary.chunkCount; ordinal += 1) {
        const found = lookupVNextTextBlockPersistentSceneChunkInternalV2({
          scene: built.scene,
          chunkOrdinal: ordinal,
        })
        if (found.status !== "found") throw new Error("parity chunk missing")
        const chunk = found.leaf.chunk
        for (const fragment of chunk.fragments) {
          const { fingerprint: _fingerprint, ...facts } = fragment
          expect(
            sceneInternals
              .recomposeVNextTextBlockSceneFragmentIdentityInternalV2(
                facts,
                factory,
              ),
          ).toEqual({
            paintFingerprint: fragment.paintFingerprint,
            fingerprint: fragment.fingerprint,
          })
        }
        const {
          fingerprint: _chunkFingerprint,
          paintFingerprint: _chunkPaintFingerprint,
          ...chunkFacts
        } = chunk
        expect(
          sceneInternals.recomposeVNextTextBlockSceneChunkIdentityInternalV2(
            chunkFacts,
            chunk.sourceMapping.map((mapping) => {
              const paintFingerprint = sourceItems.get(mapping.lineageId)
              if (paintFingerprint == null) {
                throw new Error("mapped source paint missing")
              }
              return paintFingerprint
            }),
            factory,
          ),
        ).toEqual({
          paintFingerprint: chunk.paintFingerprint,
          fingerprint: chunk.fingerprint,
        })
      }
    }

    const textScene = completeScene({ content: "text-image-text" })
    const found = lookupVNextTextBlockPersistentSceneChunkInternalV2({
      scene: textScene.scene,
      chunkOrdinal: 0,
    })
    if (found.status !== "found") throw new Error("text chunk missing")
    const textFragment = found.leaf.chunk.fragments.find(
      (fragment) => fragment.kind === "text",
    )
    if (textFragment?.kind !== "text" || textFragment.paintRuns.length === 0) {
      throw new Error("text paint fragment missing")
    }
    const firstRun = textFragment.paintRuns[0]!
    const conflictingRun = {
      ...firstRun,
      textColor: `${firstRun.textColor}-conflict`,
      paintFingerprint: createVNextCompactFingerprint(
        stringifyVNextCanonicalJson({
          textColor: `${firstRun.textColor}-conflict`,
          textDecoration: firstRun.textDecoration,
          strikethrough: firstRun.strikethrough,
          authoredTextColor: firstRun.authoredTextColor,
        }),
      ),
    }
    expect(
      sceneInternals.recomposeVNextTextBlockSceneFragmentIdentityInternalV2({
        ...textFragment,
        sourceSpans: [firstRun.sourceSpan, firstRun.sourceSpan],
        paintRuns: [firstRun, conflictingRun],
      }, factory),
    ).toBeNull()
  })

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
    expect(VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_EMPTY_ROOT_V2.fingerprint)
      .toBe(createVNextCompactFingerprint(stringifyVNextCanonicalJson({
        contractVersion: 2,
        nodeKind: "empty",
        summary: VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_EMPTY_ROOT_V2.summary,
        scenePolicyFingerprint:
          VNEXT_TEXT_BLOCK_PERSISTENT_SCENE_POLICY_V2.fingerprint,
      })))

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
    const previous = acceptedUnifiedLayoutRootFixtureV2({
      content: "text-image-text",
      fit: "contain",
    })
    const change = imagePaintUnifiedLayoutChange5b(previous.root, {
      fit: "cover",
      crop: { x: 0, y: 0, width: 0.5, height: 1 },
    })
    if (change.kind !== "image-paint-fact-change") {
      throw new Error("fixture did not create one image-paint change")
    }
    const derived =
      deriveVNextTextBlockUnifiedLayoutImagePaintSummaryInternalV1({
        sourceState: previous.root.sourceState,
        inlineId: change.inlineId,
        expectedImageSourceFingerprint:
          change.expectedImageSourceFingerprint,
        expectedImageDependencyFingerprint:
          change.expectedImageDependencyFingerprint,
        nextFit: change.nextFit,
        nextCrop: change.nextCrop,
      })
    if (derived.status !== "accepted") {
      throw new Error("source paint summary blocked")
    }
    const source =
      createVNextTextBlockUnifiedLayoutSourceStateImagePaintTransitionInternalV1({
        previousSourceState: previous.root.sourceState,
        sourceItemAuthority: derived.sourceItemAuthority,
        inlineId: change.inlineId,
        expectedImageSourceFingerprint:
          change.expectedImageSourceFingerprint,
        expectedImageDependencyFingerprint:
          change.expectedImageDependencyFingerprint,
        nextFit: change.nextFit,
        nextCrop: change.nextCrop,
      })
    if (source.status !== "prepared") throw new Error("source paint blocked")
    expect(
      bindVNextTextBlockPersistentLayoutLineTreeToImagePaintSourceInternalV1({
        previousSourceState: previous.root.sourceState,
        nextSourceState: source.sourceState,
        flowTree: previous.root.flowTree,
        spatialState: previous.root.spatialState,
        lineTree: previous.root.lineTree,
      }),
    ).toBe(true)
    const candidate =
      createVNextTextBlockPersistentSceneImagePaintTransitionCandidateInternalV2({
        previousScene: previous.persistentScene,
        nextSourceState: source.sourceState,
        lineTree: previous.root.lineTree,
        sourceItemAuthority: source.sourceItemAuthority,
        inlineId: change.inlineId,
      })
    if (candidate.status !== "prepared") {
      throw new Error(`scene paint blocked: ${JSON.stringify(candidate.issues)}`)
    }
    expect(candidate.work).toMatchObject({
      visitedLineTreeNodeCount: 1,
      visitedSceneTreeNodeCount: 1,
      incrementalCopiedNodeCount: 0,
      emittedChunkCount: 1,
    })
    const accepted =
      inspectVNextTextBlockPersistentSceneIncrementalFragmentInternalV2({
        scene: candidate.scene,
        fragmentAuthority: candidate.fragmentAuthority,
        completePreviousSceneTraversal: false,
        completeNextSceneTraversal: false,
      })
    expect(accepted).toMatchObject({
      status: "valid-fragment",
      work: {
        inspectedCopiedPathNodeCount: candidate.copiedPathNodes.length,
        inspectedReplacementNodeCount: candidate.replacementNodes.length,
        inspectedSiblingReferenceCount: candidate.siblingReferences.length,
        completePreviousSceneTraversalCount: 0,
        completeNextSceneTraversalCount: 0,
      },
    })
    expect(
      inspectVNextTextBlockPersistentSceneIncrementalFragmentInternalV2({
        scene: candidate.scene,
        fragmentAuthority: candidate.fragmentAuthority,
        completePreviousSceneTraversal: true,
        completeNextSceneTraversal: false,
      }),
    ).toMatchObject({
      status: "invalid",
      code: "scene-complete-traversal-forbidden",
    })
    expect(
      inspectVNextTextBlockPersistentSceneIncrementalFragmentInternalV2({
        scene: candidate.scene,
        fragmentAuthority: structuredClone(candidate.fragmentAuthority),
        completePreviousSceneTraversal: false,
        completeNextSceneTraversal: false,
      }),
    ).toMatchObject({
      status: "invalid",
      code: "scene-incremental-fragment-invalid",
    })
  })

  it("checks every V3 Scene operation before observing or retaining it", () => {
    const boundaries = sceneVisitTestBoundaries()
    expect(boundaries.setLimit).toBeTypeOf("function")
    expect(boundaries.setObserver).toBeTypeOf("function")
    if (boundaries.setLimit == null || boundaries.setObserver == null) return
    const createBounded = (
      createVNextTextBlockPersistentSceneImagePaintTransitionCandidateInternalV2
    ) as unknown as (input: unknown, context: unknown) => any
    const baselineEvents: Array<{ unit: string; completedWork: number }> = []
    boundaries.setObserver((value) => baselineEvents.push(
      value as { unit: string; completedWork: number },
    ))
    try {
      const fixture = v3ScenePaintFixture()
      expect(createBounded(fixture.input, fixture.context)).toMatchObject({
        status: "prepared",
        scene: expect.any(Object),
        completedCandidateWork: expect.any(Object),
      })
    } finally {
      boundaries.setObserver(null)
    }
    const units = [
      "line-tree-lookup-nodes",
      "scene-tree-lookup-nodes",
      "copied-scene-nodes",
      "replacement-chunks",
    ] as const
    for (const unit of units) {
      const actual = Math.max(
        ...baselineEvents
          .filter((event) => event.unit === unit)
          .map((event) => event.completedWork),
      )
      expect(actual).toBeGreaterThan(0)
      for (const effectiveLimit of [actual + 1, actual, actual - 1]) {
        const events: unknown[] = []
        boundaries.setLimit({ stage: "scene", unit, effectiveLimit })
        boundaries.setObserver((value) => events.push(value))
        try {
          const fixture = v3ScenePaintFixture()
          const result = createBounded(fixture.input, fixture.context)
          if (effectiveLimit >= actual) {
            expect(result).toMatchObject({ status: "prepared" })
            expect(events).toEqual(baselineEvents)
          } else {
            const rejectedIndex = baselineEvents.findIndex((event) =>
              event.unit === unit
              && event.completedWork === effectiveLimit + 1
            )
            expect(result).toMatchObject({
              status: "limit-exceeded",
              scene: null,
              copiedPathNodes: null,
              replacementNodes: null,
              attemptedWork: effectiveLimit + 1,
              effectiveLimit,
              evaluatorAuthority: expect.any(Object),
            })
            expect(result.completedCandidateWork.scene[
              unit === "line-tree-lookup-nodes"
                ? "visitedLineTreeNodeCount"
                : unit === "scene-tree-lookup-nodes"
                  ? "visitedSceneTreeNodeCount"
                  : unit === "copied-scene-nodes"
                    ? "copiedSceneNodeCount"
                    : "replacementChunkCount"
            ]).toBe(effectiveLimit)
            expect(events).toEqual(baselineEvents.slice(0, rejectedIndex))
          }
        } finally {
          boundaries.setLimit(null)
          boundaries.setObserver(null)
        }
      }
    }
  }, 30_000)

  it("propagates the exact Scene evaluator authority without a partial candidate", () => {
    const boundaries = sceneVisitTestBoundaries()
    expect(boundaries.setLimit).toBeTypeOf("function")
    if (boundaries.setLimit == null) return
    boundaries.setLimit({
      stage: "scene",
      unit: "replacement-chunks",
      effectiveLimit: 0,
    })
    try {
      const fixture = v3ScenePaintFixture()
      const result =
        prepareVNextTextBlockUnifiedLayoutImagePaintSceneTransitionInternalV1({
          previousRoot: fixture.previousRoot,
          nextSourceState: fixture.nextSourceState,
          sourceItemAuthority: fixture.sourceItemAuthority,
          inlineId: fixture.inlineId,
          ...fixture.context,
        })
      expect(result).toMatchObject({
        status: "limit-exceeded",
        scene: null,
        deliveryPlan: null,
        attemptedWork: 1,
        effectiveLimit: 0,
        evaluatorAuthority: expect.any(Object),
      })
      if (result.status !== "limit-exceeded") return
      const record = getVNextTextBlockLimitExceededAuthorityRecordInternalV1(
        result.evaluatorAuthority,
      )
      expect(record).toMatchObject({
        stage: "scene",
        unit: "replacement-chunks",
        completedWork: 0,
        attemptedWork: 1,
        effectiveLimit: 0,
      })
      expect(record?.completedCandidateWork)
        .toBe(result.completedCandidateWork)
    } finally {
      boundaries.setLimit(null)
    }
  }, 30_000)

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
