import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockUnifiedLayoutRootV1,
  inspectVNextTextBlockUnifiedLayoutRootV1,
} from "../src/layout/textBlockUnifiedLayoutRootV1.js"
import {
  inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1,
  registerVNextTextBlockUnifiedLayoutRootInternalV1,
} from "../src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV1.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import type { VNextTextBlockUnifiedLayoutRootV1 } from "../src/layout/textBlockUnifiedLayoutRootContractV1.js"
import { projectVNextTextBlockUnifiedLayoutSceneV1 } from "../src/layout/textBlockUnifiedLayoutSceneV1.js"
import { spatialFingerprintV1 } from "../src/layout/textBlockSpatialIndexInternalsV1.js"
import {
  layoutVNextTextBlockAuthoredBoxGeometryV2,
} from "../src/layout/textBlockAuthoredBoxGeometryV2.js"
import {
  layoutVNextTextBlockSpatialWrappingV2,
} from "../src/layout/textBlockSpatialWrappingLayoutV2.js"
import {
  acceptedInlineImageEvidenceFixture,
  acceptedInlineImageSpatialFixture,
  producerInlineImageEvidenceInput,
} from "./helpers/textBlockInlineImageFlowV2.js"
import { acceptedUnifiedLayoutRootFixtureV1 } from "./helpers/textBlockUnifiedLayoutRootV1.js"
import { acceptVNextTextBlockFlowEvidenceV2 } from "../src/layout/textBlockFlowEvidenceV2.js"
import { createVNextTextBlockInitialFlowV1 } from "../src/layout/textBlockInitialFlowInputV1.js"
import { listImageGeometryBuildInputFixture } from "./helpers/textBlockInitialFlowV1.js"

function canonicalRootFacts(root: VNextTextBlockUnifiedLayoutRootV1): string {
  return stringifyVNextCanonicalJson({
    source: root.source,
    contractVersion: root.contractVersion,
    inputAuthority: root.inputAuthority,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    instanceRevision: root.instanceRevision,
    layoutId: root.layoutId,
    flowRegionProviderAuthority: root.flowRegionProviderAuthority,
    dependencyFingerprints: root.dependencyFingerprints,
    work: root.work,
    contracts: root.contracts,
    mayPublishLayout: root.mayPublishLayout,
    productionBinding: root.productionBinding,
  })
}

function frozenCandidateRoot(): VNextTextBlockUnifiedLayoutRootV1 {
  const fixture = acceptedInlineImageSpatialFixture({ content: "text-image-text" })
  const spatialLayout = layoutVNextTextBlockSpatialWrappingV2({
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
    persistentFlowTree: fixture.tree,
    spatialIndex: fixture.spatialIndex,
    startYLayoutUnit: 0,
  })
  const authoredBoxGeometry = layoutVNextTextBlockAuthoredBoxGeometryV2({
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
    persistentFlowTree: fixture.tree,
    spatialIndex: fixture.spatialIndex,
  })
  if (spatialLayout.status !== "accepted" || authoredBoxGeometry.status !== "accepted") {
    throw new Error("accepted Phase 4B fixture required")
  }
  const sceneResult = projectVNextTextBlockUnifiedLayoutSceneV1({ authoredBoxGeometry })
  if (sceneResult.status !== "accepted") throw new Error("accepted scene required")

  const flowRegionProviderAuthority = Object.freeze({
    source: "vnext-text-block-flow-region-v2" as const,
    contractVersion: 2 as const,
    spatialIndexFingerprint: fixture.spatialIndex.fingerprint,
    fingerprint: spatialFingerprintV1({
      source: "vnext-text-block-flow-region-v2",
      contractVersion: 2,
      spatialIndexFingerprint: fixture.spatialIndex.fingerprint,
    }),
  })
  const dependencyFingerprints = Object.freeze({
    initialFlow: fixture.initialFlow.fingerprint,
    evidence: fixture.evidence.fingerprint,
    persistentFlowTree: fixture.tree.fingerprint,
    spatialIndex: fixture.spatialIndex.fingerprint,
    flowRegionProviderAuthority: flowRegionProviderAuthority.fingerprint,
    spatialLayout: spatialLayout.fingerprint,
    authoredBoxGeometry: authoredBoxGeometry.fingerprint,
    scene: sceneResult.scene.fingerprint,
  })
  const rootFacts = {
    source: "vnext-text-block-unified-layout-root-v1" as const,
    contractVersion: 1 as const,
    inputAuthority: "core-synthetic-qa-only" as const,
    documentId: fixture.initialFlow.documentId,
    sectionId: fixture.initialFlow.sectionId,
    textBlockId: fixture.initialFlow.textBlockId,
    instanceRevision: fixture.initialFlow.instanceRevision,
    layoutId: fixture.evidence.layoutId,
    initialFlow: fixture.initialFlow,
    evidence: fixture.evidence,
    persistentFlowTree: fixture.tree,
    spatialIndex: fixture.spatialIndex,
    flowRegionProviderAuthority,
    spatialLayout,
    authoredBoxGeometry,
    scene: sceneResult.scene,
    dependencyFingerprints,
    work: Object.freeze({
      topLevelDependencyCount: 8 as const,
      completeChildGraphTraversalCount: 0 as const,
      completeChildRehashCount: 0 as const,
      rootWrapperAllocationCount: 1 as const,
    }),
    contracts: Object.freeze({
      unifiedTextBlockAuthority: true as const,
      textAndInlineImageV2: true as const,
      processLocalImmutableRoot: true as const,
      compositionalRootFingerprint: true as const,
      incrementalTransitionClaim: false as const,
      stagedEditorApply: false as const,
      mayPublishLayout: false as const,
      productionBinding: false as const,
    }),
    mayPublishLayout: false as const,
    productionBinding: false as const,
  } satisfies Omit<VNextTextBlockUnifiedLayoutRootV1, "fingerprint">
  const fingerprint = spatialFingerprintV1(canonicalRootFacts({ ...rootFacts, fingerprint: "pending" }))
  return Object.freeze({ ...rootFacts, fingerprint })
}

describe("unified TextBlock layout root authority v1", () => {
  it("builds one exact mixed root whose retained dependencies form the authored scene chain", () => {
    const fixture = acceptedInlineImageEvidenceFixture({ content: "text-image-text" })

    const result = createVNextTextBlockUnifiedLayoutRootV1({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      spatialEntries: [],
    })
    if (result.status !== "accepted") throw new Error("unified root blocked")

    expect(result.root.persistentFlowTree.flowEvidenceFingerprint)
      .toBe(result.root.evidence.fingerprint)
    expect(result.root.spatialIndex.persistentFlowTreeFingerprint)
      .toBe(result.root.persistentFlowTree.fingerprint)
    expect(result.root.spatialLayout.spatialIndexFingerprint)
      .toBe(result.root.spatialIndex.fingerprint)
    expect(result.root.authoredBoxGeometry.contentSpatialLayoutFingerprint)
      .toBe(result.root.spatialLayout.fingerprint)
    expect(result.root.scene.authoredBoxGeometryFingerprint)
      .toBe(result.root.authoredBoxGeometry.fingerprint)
    expect(inspectVNextTextBlockUnifiedLayoutRootV1(result.root)).toEqual({
      status: "valid",
      fingerprint: result.root.fingerprint,
      sceneFingerprint: result.root.scene.fingerprint,
      work: result.root.work,
    })
    const allowedFingerprintFacts = {
      source: result.root.source,
      contractVersion: result.root.contractVersion,
      inputAuthority: result.root.inputAuthority,
      documentId: result.root.documentId,
      sectionId: result.root.sectionId,
      textBlockId: result.root.textBlockId,
      instanceRevision: result.root.instanceRevision,
      layoutId: result.root.layoutId,
      dependencyFingerprints: {
        initialFlow: result.root.dependencyFingerprints.initialFlow,
        evidence: result.root.dependencyFingerprints.evidence,
        persistentFlowTree: result.root.dependencyFingerprints.persistentFlowTree,
        spatialIndex: result.root.dependencyFingerprints.spatialIndex,
        flowRegionProviderAuthority: result.root.dependencyFingerprints.flowRegionProviderAuthority,
        spatialLayout: result.root.dependencyFingerprints.spatialLayout,
        authoredBoxGeometry: result.root.dependencyFingerprints.authoredBoxGeometry,
        scene: result.root.dependencyFingerprints.scene,
      },
      work: {
        topLevelDependencyCount: result.root.work.topLevelDependencyCount,
        completeChildGraphTraversalCount: result.root.work.completeChildGraphTraversalCount,
        completeChildRehashCount: result.root.work.completeChildRehashCount,
        rootWrapperAllocationCount: result.root.work.rootWrapperAllocationCount,
      },
      contracts: {
        unifiedTextBlockAuthority: result.root.contracts.unifiedTextBlockAuthority,
        textAndInlineImageV2: result.root.contracts.textAndInlineImageV2,
        processLocalImmutableRoot: result.root.contracts.processLocalImmutableRoot,
        compositionalRootFingerprint: result.root.contracts.compositionalRootFingerprint,
        incrementalTransitionClaim: result.root.contracts.incrementalTransitionClaim,
        stagedEditorApply: result.root.contracts.stagedEditorApply,
        mayPublishLayout: result.root.contracts.mayPublishLayout,
        productionBinding: result.root.contracts.productionBinding,
      },
      mayPublishLayout: result.root.mayPublishLayout,
      productionBinding: result.root.productionBinding,
    }
    expect(result.root.fingerprint).toBe(spatialFingerprintV1(allowedFingerprintFacts))
  })

  it("provides a reusable accepted root fixture without prebuilding children", () => {
    const fixture = acceptedUnifiedLayoutRootFixtureV1({ content: "image-only" })
    expect(fixture).toMatchObject({
      status: "accepted",
      root: {
        inputAuthority: "core-synthetic-qa-only",
        persistentFlowTree: { itemsByKind: { "inline-image": 1 } },
        spatialIndex: { summary: { entryCount: 0 } },
      },
      issues: [],
    })
  })

  it("blocks at the first ordered root stage without returning a partial root or scene", () => {
    const fixture = acceptedInlineImageEvidenceFixture({ content: "text-image-text" })
    const blockedCases: readonly [string, unknown, string][] = [
      [
        "wrong authority before a production request",
        {
          inputAuthority: "foreign-authority",
          initialFlow: fixture.initialFlow,
          evidence: fixture.evidence,
          spatialEntries: [],
          bindProductionLayout: true,
        },
        "input-authority-mismatch",
      ],
      [
        "production binding after a valid authority",
        {
          inputAuthority: "core-synthetic-qa-only",
          initialFlow: fixture.initialFlow,
          evidence: fixture.evidence,
          spatialEntries: [],
          bindProductionLayout: true,
        },
        "production-binding-forbidden",
      ],
      [
        "cloned Initial Flow before an invalid spatial entry",
        {
          inputAuthority: "core-synthetic-qa-only",
          initialFlow: structuredClone(fixture.initialFlow),
          evidence: fixture.evidence,
          spatialEntries: [{}],
        },
        "initial-flow-provenance-mismatch",
      ],
      [
        "invalid spatial entry after an accepted tree",
        {
          inputAuthority: "core-synthetic-qa-only",
          initialFlow: fixture.initialFlow,
          evidence: fixture.evidence,
          spatialEntries: [{}],
        },
        "spatial-index-blocked",
      ],
      [
        "oversized image before spatial construction",
        (() => {
          const oversized = acceptedInlineImageEvidenceFixture({
            content: "image-only",
            width: { value: 9_007_199_254, unit: "pt" },
          })
          return {
            inputAuthority: "core-synthetic-qa-only",
            initialFlow: oversized.initialFlow,
            evidence: oversized.evidence,
            spatialEntries: [],
          }
        })(),
        "spatial-layout-blocked",
      ],
    ]

    for (const [_name, input, code] of blockedCases) {
      expect(createVNextTextBlockUnifiedLayoutRootV1(input)).toMatchObject({
        status: "blocked",
        root: null,
        scene: null,
        issues: [{ code }],
      })
    }
  })

  it("rejects undefined optionals, fixed-height-shaped extras, accessors, symbols, classes, and throwing proxies", () => {
    const fixture = acceptedInlineImageEvidenceFixture()
    let accessorReads = 0
    const accessorInput = Object.create(null)
    Object.defineProperties(accessorInput, {
      inputAuthority: { enumerable: true, value: "core-synthetic-qa-only" },
      initialFlow: { enumerable: true, get: () => { accessorReads += 1; return fixture.initialFlow } },
      evidence: { enumerable: true, value: fixture.evidence },
      spatialEntries: { enumerable: true, value: [] },
    })
    const symbolInput = {
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: fixture.initialFlow,
      evidence: fixture.evidence,
      spatialEntries: [],
      [Symbol("extra")]: true,
    }
    const classInput = new (class RootInput {
      inputAuthority = "core-synthetic-qa-only" as const
      initialFlow = fixture.initialFlow
      evidence = fixture.evidence
      spatialEntries: readonly unknown[] = []
    })()
    const throwingProxy = new Proxy({}, { ownKeys: () => { throw new Error("must not enumerate proxy") } })
    const rejected = [
      { inputAuthority: "core-synthetic-qa-only", initialFlow: undefined, evidence: fixture.evidence, spatialEntries: [] },
      { inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence: undefined, spatialEntries: [] },
      { inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence: fixture.evidence, spatialEntries: [], bindProductionLayout: undefined },
      { inputAuthority: "core-synthetic-qa-only", initialFlow: fixture.initialFlow, evidence: fixture.evidence, spatialEntries: [], fixedHeight: true },
      accessorInput,
      symbolInput,
      classInput,
      throwingProxy,
    ]
    for (const input of rejected) {
      expect(createVNextTextBlockUnifiedLayoutRootV1(input)).toMatchObject({
        status: "blocked",
        root: null,
        scene: null,
        issues: [{ code: "invalid-input" }],
      })
    }
    expect(accessorReads).toBe(0)
  })

  it("keeps unresolved inline-image evidence outside root authority without partial output", () => {
    const unresolvedInput = listImageGeometryBuildInputFixture()
    const image = unresolvedInput.textBlock.children[1]
    const imageRun = unresolvedInput.measurement.runs[1]
    if (image?.type !== "inline-image" || imageRun?.kind !== "inline-image") {
      throw new Error("unresolved inline-image source missing")
    }
    unresolvedInput.textBlock = {
      ...unresolvedInput.textBlock,
      children: [
        unresolvedInput.textBlock.children[0]!,
        { ...image, source: { kind: "image-field-ref", fieldKey: "customer.logo" } },
      ],
    }
    unresolvedInput.measurement = {
      ...unresolvedInput.measurement,
      runs: [
        unresolvedInput.measurement.runs[0]!,
        { ...imageRun, assetId: null },
      ],
    }
    const initial = createVNextTextBlockInitialFlowV1(unresolvedInput)
    if (initial.status !== "classified") throw new Error("unresolved Initial Flow should remain inspectable")
    const acceptedEvidence = acceptedInlineImageEvidenceFixture({ content: "text-image-text" })
    const evidenceAttempt = acceptVNextTextBlockFlowEvidenceV2({
      initialFlow: initial.flow,
      evidenceInput: {
        ...producerInlineImageEvidenceInput(acceptedEvidence.evidence),
        initialFlowFingerprint: initial.flow.fingerprint,
      },
    })
    expect(evidenceAttempt.status).toBe("blocked")

    expect(createVNextTextBlockUnifiedLayoutRootV1({
      inputAuthority: "core-synthetic-qa-only",
      initialFlow: initial.flow,
      evidence: evidenceAttempt as unknown,
      spatialEntries: [],
    })).toMatchObject({
      status: "blocked",
      root: null,
      scene: null,
      issues: [{ code: "flow-evidence-provenance-mismatch" }],
    })
  })

  it("rejects unregistered candidates, clones, and a frozen object with one foreign child", () => {
    const root = frozenCandidateRoot()
    const clone = structuredClone(root)
    const foreign = Object.freeze({ ...root, scene: structuredClone(root.scene) })

    for (const value of [root, clone, foreign]) {
      expect(inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1(value)).toMatchObject({
        status: "invalid",
        code: "invalid-input",
      })
    }
  })

  it("registers one exact frozen root without recursively inspecting its children", () => {
    const root = frozenCandidateRoot()
    registerVNextTextBlockUnifiedLayoutRootInternalV1({
      root,
      initialFlow: root.initialFlow,
      evidence: root.evidence,
      persistentFlowTree: root.persistentFlowTree,
      spatialIndex: root.spatialIndex,
      spatialLayout: root.spatialLayout,
      authoredBoxGeometry: root.authoredBoxGeometry,
      scene: root.scene,
      canonicalRootFacts: canonicalRootFacts(root),
    })

    expect(inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1(root)).toEqual({
      status: "valid",
      fingerprint: root.fingerprint,
      sceneFingerprint: root.scene.fingerprint,
      work: {
        topLevelDependencyCount: 8,
        completeChildGraphTraversalCount: 0,
        completeChildRehashCount: 0,
        rootWrapperAllocationCount: 1,
      },
    })
    expect(root.contracts).toMatchObject({
      incrementalTransitionClaim: false,
      stagedEditorApply: false,
      mayPublishLayout: false,
      productionBinding: false,
    })
  })

  it("rejects a frozen nested wrapper accessor without reading it during registration", () => {
    const root = frozenCandidateRoot()
    let accessorReadCount = 0
    const contracts = Object.create(null) as Record<string, unknown>
    for (const [key, value] of Object.entries(root.contracts)) {
      Object.defineProperty(contracts, key, {
        enumerable: true,
        ...(key === "unifiedTextBlockAuthority"
          ? {
              get: () => {
                accessorReadCount += 1
                return value
              },
            }
          : { value }),
      })
    }
    const malformedRoot = Object.freeze({
      ...root,
      contracts: Object.freeze(contracts),
    }) as unknown as VNextTextBlockUnifiedLayoutRootV1

    expect(() => registerVNextTextBlockUnifiedLayoutRootInternalV1({
      root: malformedRoot,
      initialFlow: root.initialFlow,
      evidence: root.evidence,
      persistentFlowTree: root.persistentFlowTree,
      spatialIndex: root.spatialIndex,
      spatialLayout: root.spatialLayout,
      authoredBoxGeometry: root.authoredBoxGeometry,
      scene: root.scene,
      canonicalRootFacts: "must-not-be-read",
    })).toThrow("exact frozen root shell")
    expect(accessorReadCount).toBe(0)
  })

  it("rejects an unregistered accessor-shaped proxy before reading it", () => {
    let accessorReadCount = 0
    const value = Object.create(null)
    Object.defineProperty(value, "root", {
      enumerable: true,
      get: () => {
        accessorReadCount += 1
        return null
      },
    })
    expect(inspectVNextTextBlockUnifiedLayoutRootBindingInternalV1(value)).toMatchObject({
      status: "invalid",
      code: "invalid-input",
    })
    expect(accessorReadCount).toBe(0)
  })
})
