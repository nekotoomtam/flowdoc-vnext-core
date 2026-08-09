import { describe, expect, it } from "vitest"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../src/fingerprint/canonicalJson.js"
import {
  acceptVNextTextBlockFlowEvidenceV2,
} from "../src/layout/textBlockFlowEvidenceV2.js"
import type {
  VNextTextBlockFlowEvidenceInputV2,
} from "../src/layout/textBlockFlowEvidenceContractV2.js"
import {
  createVNextTextBlockInitialFlowV1,
} from "../src/layout/textBlockInitialFlowInputV1.js"
import {
  createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateContractV1.js"
import {
  insertVNextTextBlockUnifiedLayoutSourcePhysicalEntryCompleteInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceIdentityTreeInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1,
  lookupVNextTextBlockUnifiedLayoutSourcePhysicalEntriesInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.js"
import {
  inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.js"
import {
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsWithForcedStyleCollisionForTestInternalV1,
  registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1,
  resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.js"
import {
  createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1,
  registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  FIVE_B2_TEST_POLICY,
  registered5B2RootFixture,
} from "./helpers/textBlockUnifiedIncremental5b2.js"
import {
  completeTextGeometryBuildInputFixture,
} from "./helpers/textBlockInitialFlowV1.js"

const sourceLimits = {
  sourceItems: Number.MAX_SAFE_INTEGER,
  sourceTreeLookupNodes: Number.MAX_SAFE_INTEGER,
  sourceTreePathCopyNodes: Number.MAX_SAFE_INTEGER,
  sourceLeafSlots: Number.MAX_SAFE_INTEGER,
  sourceIndexNodes: Number.MAX_SAFE_INTEGER,
  sourceIndexEntries: Number.MAX_SAFE_INTEGER,
  sourceIndexComparisons: Number.MAX_SAFE_INTEGER,
  sourceStyleNodes: Number.MAX_SAFE_INTEGER,
  sourceStyleBuckets: Number.MAX_SAFE_INTEGER,
  sourceStyleEntries: Number.MAX_SAFE_INTEGER,
} as const

function textSource(itemCount: number, options: {
  readonly sameEffectiveStyleWithDistinctAuthoredFacts?: boolean
} = {}): VNextTextBlockUnifiedLayoutSourceStateV1 {
  if (itemCount < 1) throw new RangeError("test Source requires an item")
  const base = completeTextGeometryBuildInputFixture()
  const sourceText = base.textBlock.children[0]
  const sourceRun = base.measurement.runs[0]
  if (sourceText?.type !== "text" || sourceRun?.kind !== "text") {
    throw new Error("text Source fixture missing")
  }
  const children = Array.from({ length: itemCount }, (_, index) => ({
    ...sourceText,
    id: `text-${index.toString().padStart(3, "0")}`,
    text: "x",
    ...(options.sameEffectiveStyleWithDistinctAuthoredFacts && index === 1
      ? { style: { textColor: "202020" } }
      : {}),
  }))
  const runs = children.map((child, index) => ({
    ...sourceRun,
    inlineId: child.id,
    renderStartOffset: index,
    renderEndOffset: index + 1,
    renderedText: "x",
    ...(options.sameEffectiveStyleWithDistinctAuthoredFacts && index === 1
      ? { localStyle: { textColor: "202020" } }
      : {}),
  }))
  const initial = createVNextTextBlockInitialFlowV1({
    ...base,
    textBlock: { ...base.textBlock, children },
    measurement: {
      ...base.measurement,
      renderedText: "x".repeat(itemCount),
      runs,
    },
  })
  if (initial.status !== "classified") {
    throw new Error(`initial Source fixture blocked: ${JSON.stringify(initial.issues)}`)
  }
  const shapingRuns = initial.flow.atoms.map((atom, index) => {
    if (atom.kind !== "text") throw new Error("text atom expected")
    return {
      shapingRunId: `shape-${index}`,
      renderStartOffset: atom.renderStartOffset,
      renderEndOffset: atom.renderEndOffset,
      text: atom.renderedText,
      styleKey: atom.resolvedGeometryStyle.effectiveShapingStyleKey,
      fontFaceId: atom.resolvedGeometryStyle.fontFaceId,
      fontSizeLayoutUnit: atom.resolvedGeometryStyle.fontSizeLayoutUnit,
      textColor: atom.resolvedGeometryStyle.textColor,
      direction: "ltr" as const,
      baselineShiftLayoutUnit: 0 as const,
      features: [],
      clusters: [{
        index: 0,
        renderStartOffset: atom.renderStartOffset,
        renderEndOffset: atom.renderEndOffset,
        advanceLayoutUnit: 6_000_000,
      }],
    }
  })
  const evidenceInput: VNextTextBlockFlowEvidenceInputV2 = {
    initialFlowFingerprint: initial.flow.fingerprint,
    layoutId: `sidecar-${itemCount}`,
    measurement: initial.flow.measurement,
    layoutUnitPolicyFingerprint: initial.flow.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: 90_000_000,
    declaredLineHeightLayoutUnit: initial.flow.declaredLineHeightLayoutUnit,
    paragraphStyle: initial.flow.paragraphStyle,
    fontFaces: initial.flow.fontFaces.map(({ fontFamilyKey: _key, ...face }) => ({ ...face })),
    shapingRuns,
    breakOffsets: Array.from({ length: itemCount + 1 }, (_, index) => index),
  }
  const evidence = acceptVNextTextBlockFlowEvidenceV2({
    initialFlow: initial.flow,
    evidenceInput,
  })
  if (evidence.status !== "accepted") {
    throw new Error(`evidence fixture blocked: ${JSON.stringify(evidence.issues)}`)
  }
  const source = createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1({
    initialFlow: initial.flow,
    evidence: evidence.evidence,
  })
  if (source.status !== "prepared") {
    throw new Error(`Source fixture blocked: ${JSON.stringify(source.issues)}`)
  }
  return source.sourceState
}

function prepare(sourceState: VNextTextBlockUnifiedLayoutSourceStateV1) {
  const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
    sourceState,
  })
  if (result.status !== "prepared") {
    throw new Error(`sidecars blocked: ${JSON.stringify(result.completeReceipt)}`)
  }
  return result
}

function planAFor(root: ReturnType<typeof registered5B2RootFixture>) {
  const composition = createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1({
    publicWorkPolicy: FIVE_B2_TEST_POLICY,
    sourceLimits,
  })
  if (!registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1({
    root,
    composition,
  })) throw new Error("composition fixture blocked")
  return composition
}

describe("Phase 5B-2 complete process-local Source sidecars", () => {
  it.each([
    { itemCount: 1, height: 0, leafOccupancies: [1] },
    { itemCount: 8, height: 0, leafOccupancies: [8] },
    { itemCount: 9, height: 1, leafOccupancies: [4, 5] },
    { itemCount: 32, height: 1, leafOccupancies: [4, 4, 4, 4, 4, 4, 8] },
    { itemCount: 33, height: 1, leafOccupancies: [4, 4, 4, 4, 4, 4, 4, 5] },
    {
      itemCount: 128,
      height: 2,
      leafOccupancies: [
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        8,
      ],
    },
  ])(
    "keeps canonical fixed-eight-way bounds for $itemCount Source entries",
    ({ itemCount, height, leafOccupancies }) => {
      // Catches an overflowing leaf/branch or a noncanonical 9 -> 4/5 split.
      const built = prepare(textSource(itemCount))
      const identity = inspectVNextTextBlockUnifiedLayoutSourceIdentityTreeInternalV1(
        built.sidecars.identityRoot,
      )
      const order = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
        built.sidecars.orderRoot,
      )

      expect(identity.entryCount).toBe(itemCount)
      expect(order.entryCount).toBe(itemCount)
      expect(identity.height).toBe(height)
      expect(order.height).toBe(height)
      expect(identity.leafOccupancies).toEqual(leafOccupancies)
      expect(order.leafOccupancies).toEqual(leafOccupancies)
      const minimumLeafCount = itemCount <= 8 ? 1 : 4
      expect(identity.leafOccupancies.every(
        (count) => count >= minimumLeafCount && count <= 8,
      ))
        .toBe(true)
      expect(order.leafOccupancies).toEqual(identity.leafOccupancies)
      expect(identity.branchOccupancies.every((count) => count >= 2 && count <= 8))
        .toBe(true)
      expect(order.branchOccupancies.every((count) => count >= 2 && count <= 8))
        .toBe(true)
    },
    30_000,
  )

  it("assigns exact centered complete position keys and stable independent roots", () => {
    // Catches off-by-one centering and dependence on object allocation history.
    const sourceState = textSource(4)
    const first = prepare(sourceState).sidecars
    const second = prepare(sourceState).sidecars
    const expected = [-6_442_450_944, -2_147_483_648, 2_147_483_648, 6_442_450_944]

    expect(inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(first.orderRoot)
      .entries.map((entry) => entry.positionKey)).toEqual(expected)
    expect(first).not.toBe(second)
    expect(first.identityRoot).not.toBe(second.identityRoot)
    expect(first.orderRoot).not.toBe(second.orderRoot)
    expect(first.fingerprint).toBe(second.fingerprint)
    expect(first.identityRoot?.fingerprint).toBe(second.identityRoot?.fingerprint)
    expect(first.orderRoot?.fingerprint).toBe(second.orderRoot?.fingerprint)
  })

  it("keeps exact style refcounts and excludes hard breaks and inline images", () => {
    // Catches style registration per distinct object instead of exact facts/refcount.
    const repeated = prepare(textSource(8)).sidecars
    const mixedRoot = registered5B2RootFixture({ content: "field-image-page-break" })
    const mixed = prepare(mixedRoot.sourceState).sidecars
    const repeatedStyles = inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1(
      repeated.styleRoot,
    )
    const mixedStyles = inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1(
      mixed.styleRoot,
    )

    expect(repeatedStyles.totalRefcount).toBe(8)
    expect(repeatedStyles.exactStyleCount).toBe(1)
    expect(repeatedStyles.entries[0]?.bucket[0]?.refcount).toBe(8)
    expect(mixedStyles.totalRefcount).toBe(2)
    expect(mixedStyles.entries.flatMap((entry) => entry.bucket)
      .reduce((sum, bucket) => sum + bucket.refcount, 0)).toBe(2)
  })

  it("uses exact canonical style facts inside a forced digest collision bucket", () => {
    // Catches treating an equal digest as style equality without exact comparison.
    const sourceState = textSource(2, {
      sameEffectiveStyleWithDistinctAuthoredFacts: true,
    })
    const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsWithForcedStyleCollisionForTestInternalV1({
      sourceState,
    })
    expect(result.status).toBe("prepared")
    if (result.status !== "prepared") return
    const style = inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1(
      result.sidecars.styleRoot,
    )
    expect(style.entries).toHaveLength(1)
    expect(style.entries[0]?.bucket).toHaveLength(2)
    expect(style.entries[0]?.bucket.map((item) => item.refcount)).toEqual([1, 1])
    expect(style.entries[0]?.bucket[0]?.canonicalFacts)
      .not.toBe(style.entries[0]?.bucket[1]?.canonicalFacts)
  })

  it("checks unsafe complete endpoints before observing the first Source item", () => {
    // Catches reading Source payload before rejecting unsafe key-space endpoints.
    const sourceState = textSource(1)
    const unsafe = Object.freeze({
      ...sourceState,
      summary: Object.freeze({
        ...sourceState.summary,
        itemCount: Number.MAX_SAFE_INTEGER,
      }),
    }) as VNextTextBlockUnifiedLayoutSourceStateV1
    const observed: string[] = []
    const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      sourceState: unsafe,
      observeBeforeOperation(unit) { observed.push(unit) },
    })
    expect(result.status).toBe("blocked")
    expect(observed).toEqual([])
    expect(result.completeReceipt).toMatchObject({
      issue: "source-position-key-space-exhausted",
      observedSourceItemCount: 0,
    })
  })

  it("leaves structural empty calibration unactivated", () => {
    // Catches minting sidecar/empty-block authority from the 5B-1 zero-item calibration.
    const sourceState = textSource(1)
    const structuralEmpty = Object.freeze({
      ...sourceState,
      summary: Object.freeze({
        ...sourceState.summary,
        itemCount: 0,
        renderedUtf16Length: 0,
      }),
    }) as VNextTextBlockUnifiedLayoutSourceStateV1
    const observed: string[] = []
    const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      sourceState: structuralEmpty,
      observeBeforeOperation(unit) { observed.push(unit) },
    })
    expect(result).toMatchObject({
      status: "blocked",
      sidecars: null,
      completeReceipt: {
        issue: "source-state-authority-mismatch",
        observedSourceItemCount: 0,
      },
    })
    expect(observed).toEqual([])
  })

  it("registers only the exact candidate, committed Root, Source, and composition", () => {
    // Catches clone/fingerprint authorization and cross-Root or cross-policy reuse.
    const root = registered5B2RootFixture({ content: "text-only", text: "authority" })
    const composition = planAFor(root)
    const prepared = prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      sourceState: root.sourceState,
    })
    if (prepared.status !== "prepared") throw new Error("sidecars preparation blocked")
    const foreignRoot = registered5B2RootFixture({ content: "text-only", text: "foreign" })
    const foreignComposition = planAFor(foreignRoot)

    expect(registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      root: foreignRoot,
      composition: foreignComposition,
      candidateAuthority: prepared.candidateAuthority,
    })).toBe(false)
    expect(registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      root,
      composition: structuredClone(composition),
      candidateAuthority: prepared.candidateAuthority,
    })).toBe(false)
    expect(registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      root,
      composition,
      candidateAuthority: structuredClone(prepared.candidateAuthority),
    })).toBe(false)
    expect(registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      root,
      composition,
      candidateAuthority: prepared.candidateAuthority,
    })).toBe(true)
    expect(registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      root,
      composition,
      candidateAuthority: prepared.candidateAuthority,
    })).toBe(false)
    expect(resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1({
      sourceState: root.sourceState,
      composition,
    })).toBe(prepared.sidecars)
    expect(resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1({
      sourceState: structuredClone(root.sourceState),
      composition,
    })).toBeNull()
  })

  it("keeps Source, Root, frozen policy, public JSON, and export keys unchanged", async () => {
    // Catches process-local sidecars leaking into canonical/public identities.
    const sourcePolicyFingerprint = textSource(1).policy.fingerprint
    const publicKeysBefore = Object.keys(await import("../src/index.js")).sort()
    const root = registered5B2RootFixture({ content: "text-only", text: "nondrift" })
    const before = {
      sourceFingerprint: root.sourceState.fingerprint,
      sourceJson: stringifyVNextCanonicalJson(root.sourceState),
      semanticFingerprint: root.semanticFingerprint,
      compositeFingerprint: root.fingerprint,
      rootJson: stringifyVNextCanonicalJson(root),
      publicPolicyFingerprint: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.fingerprint,
    }
    const composition = planAFor(root)
    const prepared = prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      sourceState: root.sourceState,
    })
    if (prepared.status !== "prepared") throw new Error("sidecars preparation blocked")
    expect(registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      root,
      composition,
      candidateAuthority: prepared.candidateAuthority,
    })).toBe(true)

    expect(root.sourceState.policy.fingerprint).toBe(sourcePolicyFingerprint)
    expect({
      sourceFingerprint: root.sourceState.fingerprint,
      sourceJson: stringifyVNextCanonicalJson(root.sourceState),
      semanticFingerprint: root.semanticFingerprint,
      compositeFingerprint: root.fingerprint,
      rootJson: stringifyVNextCanonicalJson(root),
      publicPolicyFingerprint: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3.fingerprint,
    }).toEqual(before)
    expect(Object.keys(await import("../src/index.js")).sort()).toEqual(publicKeysBefore)
    expect(createVNextCompactFingerprint(before.sourceJson)).toBe(
      createVNextCompactFingerprint(stringifyVNextCanonicalJson(root.sourceState)),
    )
  })

  it("keeps duplicate text identities distinct while rejecting duplicate atomic identities", () => {
    // Catches collapsing same-inline text fragments or allowing atomic multiplicity.
    const sourceState = textSource(2)
    const sidecars = prepare(sourceState).sidecars
    const first = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
      sidecars.orderRoot,
    ).entries[0]!
    const duplicateText = Object.freeze({
      item: Object.freeze({
        ...first.item,
        lineageId: `${first.item.lineageId}-fragment`,
        renderedText: "y",
        fingerprint: `${first.item.fingerprint}-fragment`,
      }),
      positionKey: sidecars.orderRoot!.lastPositionKey + 1,
      renderedUtf16Length: first.renderedUtf16Length,
    })
    const textInsert = insertVNextTextBlockUnifiedLayoutSourcePhysicalEntryCompleteInternalV1({
      identityRoot: sidecars.identityRoot,
      orderRoot: sidecars.orderRoot,
      entry: duplicateText,
    })
    expect(textInsert.status).toBe("inserted")
    if (textInsert.status !== "inserted") return
    expect(lookupVNextTextBlockUnifiedLayoutSourcePhysicalEntriesInternalV1({
      root: textInsert.identityRoot,
      inlineId: first.item.inlineId,
    })).toHaveLength(2)

    const atomicRoot = registered5B2RootFixture({ content: "field-image-page-break" })
    const atomicSidecars = prepare(atomicRoot.sourceState).sidecars
    const atomic = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
      atomicSidecars.orderRoot,
    ).entries.find((entry) => entry.item.kind === "resolved-field")
    if (atomic?.item.kind !== "resolved-field") throw new Error("atomic fixture missing")
    expect(insertVNextTextBlockUnifiedLayoutSourcePhysicalEntryCompleteInternalV1({
      identityRoot: atomicSidecars.identityRoot,
      orderRoot: atomicSidecars.orderRoot,
      entry: Object.freeze({
        item: Object.freeze({
          ...atomic.item,
          lineageId: `${atomic.item.lineageId}-duplicate`,
          fingerprint: `${atomic.item.fingerprint}-duplicate`,
        }),
        positionKey: atomicSidecars.orderRoot!.lastPositionKey + 1,
        renderedUtf16Length: atomic.renderedUtf16Length,
      }),
    })).toEqual({ status: "blocked" })
  })
})
