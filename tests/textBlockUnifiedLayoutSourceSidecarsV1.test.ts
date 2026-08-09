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
  createVNextTextBlockTransitionReplacementSourceItemInternalV1,
  createVNextTextBlockUnifiedLayoutSourceStateCompleteInternalV1,
  getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1,
  registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1,
  setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateContractV1.js"
import {
  beginVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  completeVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1,
  openVNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1,
  publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1,
  resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
  type VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
  type VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
} from "../src/layout/textBlockUnifiedLayoutCandidateWorkAuthorityInternalsV1.js"
import type {
  VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
} from "../src/layout/textBlockUnifiedLayoutWorkOwnerRegistryV1.js"
import {
  insertVNextTextBlockUnifiedLayoutSourcePhysicalEntryCompleteInternalV1,
  allocateVNextTextBlockSourcePositionKeysInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceIdentityTreeInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1,
  lookupVNextTextBlockUnifiedLayoutSourcePhysicalEntriesInternalV1,
  lookupVNextTextBlockUnifiedLayoutSourcePhysicalRangeInternalV1,
  pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1,
  pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexWithForcedFingerprintCollisionForTestInternalV1,
  type VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  type VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.js"
import {
  prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionPreflightV2.js"
import {
  inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1,
  insertVNextTextBlockUnifiedLayoutSourceStyleCompleteInternalV1,
  pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsInternalV1,
  pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsWithForcedFingerprintCollisionForTestInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.js"
import {
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyWithForcedPositionIntervalForTestInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsWithForcedStyleCollisionForTestInternalV1,
  registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1,
  matchesVNextTextBlockUnifiedLayoutSourcePositionKeyExhaustionProofInternalV1,
  resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.js"
import {
  prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2,
} from "../src/layout/textBlockUnifiedLayoutRootAuthorityInternalsV2.js"
import {
  createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1,
  registerVNextTextBlockUnifiedLayout5B2RootPolicyCompositionInternalV1,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyCompositionInternalsV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V3,
} from "../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  FIVE_B2_TEST_POLICY,
  admit5B2RootFixture,
  admitted5B2PlanARootFixture,
  registered5B2RootFixture,
} from "./helpers/textBlockUnifiedIncremental5b2.js"
import {
  completeTextGeometryBuildInputFixture,
} from "./helpers/textBlockInitialFlowV1.js"
import {
  repeatedUnifiedLayoutRootSourceFixtureV1,
} from "./helpers/textBlockUnifiedLayoutRootV1.js"

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

function sameInlineTextFragmentSource(
  fragmentCount: number,
): VNextTextBlockUnifiedLayoutSourceStateV1 {
  const previousSourceState = textSource(1)
  if (previousSourceState.root.nodeKind !== "leaf") {
    throw new Error("same-inline fixture requires one Source leaf")
  }
  const previous = previousSourceState.root.items[0]
  if (previous?.kind !== "text") throw new Error("same-inline text fixture missing")
  const nextItems = Object.freeze(Array.from(
    { length: fragmentCount },
    (_, index) => {
      const item = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
        sourceState: previousSourceState,
        kind: "text",
        renderedText: "x",
        lineageId: `same-inline-fragment-${index}`,
        inlineId: previous.inlineId,
        sourceFingerprint: `same-inline-source-${index}`,
        provenanceFingerprint: `same-inline-provenance-${index}`,
        style: previous.style,
      })
      if (item == null) throw new Error("same-inline replacement item blocked")
      return item
    },
  ))
  const previousRange = Object.freeze({
    startRenderedUtf16: 0,
    endRenderedUtf16: previous.renderedUtf16Length,
  })
  const compactFingerprint = (value: unknown) => createVNextCompactFingerprint(
    stringifyVNextCanonicalJson(value),
  )
  const replacement = Object.freeze({
    previousRange,
    nextItems,
    expectedPreviousContentFingerprint: compactFingerprint([previous.renderedText]),
    expectedPreviousSourceFingerprint: compactFingerprint([previous.sourceFingerprint]),
    expectedPreviousProvenanceFingerprint: compactFingerprint([
      previous.provenanceFingerprint,
    ]),
    fingerprint: compactFingerprint({
      previousRange,
      nextItems: nextItems.map((item) => item.fingerprint),
    }),
  })
  if (!registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
    previousSourceState,
    replacement,
  })) throw new Error("same-inline replacement registration blocked")
  const prepared = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
    previousSourceState,
    replacement,
    beforeVisit: () => true,
  })
  if (prepared.status !== "prepared") {
    throw new Error(`same-inline Source preparation was ${prepared.status}`)
  }
  return prepared.sourceState
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

function openPlanAMeter(input: {
  readonly sourceLimits?: NonNullable<
    Parameters<typeof admitted5B2PlanARootFixture>[0]
  >["sourceLimits"]
  readonly label?: string
} = {}) {
  const fixture = admitted5B2PlanARootFixture({
    sourceLimits: input.sourceLimits,
    text: "ABCD",
  })
  return openMeterForPlanAFixture(fixture, input.label)
}

function hasOpenTask5Permit(
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  prefix: "source-index-" | "source-style-",
): boolean {
  return inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
    meter,
  )?.some((receipt) => receipt.ownerRow.unit.startsWith(prefix)
    && receipt.attemptedWork === receipt.completedWork + 1) === true
}

function guardTask5TreeReads<T extends
  | VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1
  | VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1
  | VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1
>(input: {
  readonly root: T
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly prefix: "source-index-" | "source-style-"
  readonly unownedReads: string[]
  readonly cache?: {
    readonly nodes: WeakMap<object, object>
    readonly entries: WeakMap<object, object>
    readonly bucketItems?: WeakMap<object, object>
  }
}): T {
  const nodeCache = input.cache?.nodes ?? new WeakMap<object, object>()
  const entryCache = input.cache?.entries ?? new WeakMap<object, object>()
  const bucketItemCache = input.cache?.bucketItems ?? new WeakMap<object, object>()
  const note = (property: PropertyKey): void => {
    if (!hasOpenTask5Permit(input.meter, input.prefix)) {
      input.unownedReads.push(String(property))
    }
  }
  const wrapBucketItem = (item: object): object => {
    const cached = bucketItemCache.get(item)
    if (cached != null) return cached
    const proxy = new Proxy({ ...item }, {
      get(target, property, receiver) {
        if (
          property === "style"
          || property === "canonicalFacts"
          || property === "refcount"
        ) note(property)
        return Reflect.get(target, property, receiver)
      },
    })
    bucketItemCache.set(item, proxy)
    return proxy
  }
  const wrapEntry = (entry: object): object => {
    const cached = entryCache.get(entry)
    if (cached != null) return cached
    const proxy = new Proxy({ ...entry }, {
      get(target, property, receiver) {
        if (
          property === "item"
          || property === "positionKey"
          || property === "renderedUtf16Length"
          || property === "measurementStyleKey"
          || property === "effectiveShapingStyleKey"
          || property === "styleFingerprint"
          || property === "bucket"
          || property === "totalRefcount"
        ) note(property)
        const value = Reflect.get(target, property, receiver)
        if (property === "bucket" && Array.isArray(value)) {
          return Object.freeze(value.map((item) => wrapBucketItem(item)))
        }
        return value
      },
    })
    entryCache.set(entry, proxy)
    return proxy
  }
  const wrapNode = (node: object): object => {
    const cached = nodeCache.get(node)
    if (cached != null) return cached
    const proxy = new Proxy({ ...node }, {
      get(target, property, receiver) {
        if (
          property === "nodeKind"
          || property === "entries"
          || property === "children"
          || property === "firstKey"
          || property === "lastKey"
          || property === "firstPositionKey"
          || property === "lastPositionKey"
        ) note(property)
        const value = Reflect.get(target, property, receiver)
        if (property === "entries" && Array.isArray(value)) {
          return Object.freeze(value.map((entry) => wrapEntry(entry)))
        }
        if (property === "children" && Array.isArray(value)) {
          return Object.freeze(value.map((child) => wrapNode(child)))
        }
        return value
      },
    })
    nodeCache.set(node, proxy)
    return proxy
  }
  return wrapNode(input.root) as T
}

function openMeterForPlanAFixture(
  fixture: {
    readonly root: ReturnType<typeof registered5B2RootFixture>
    readonly composition: ReturnType<typeof planAFor>
    readonly sidecars: ReturnType<typeof prepare>["sidecars"]
  },
  label?: string,
) {
  const root = fixture.root
  admit5B2RootFixture(root)
  const item = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
    fixture.sidecars.orderRoot,
  ).entries.find((candidate) => candidate.item.kind === "text")?.item
  if (item?.kind !== "text") throw new Error("meter text item missing")
  const nextStyle = Object.freeze({ textColor: "FF0000" })
  const change = Object.freeze({
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    kind: "supported-style-change" as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
    range: Object.freeze({
      startRenderedUtf16: 0,
      endRenderedUtf16: item.renderedUtf16Length,
    }),
    expectedPreviousStyleFingerprint: item.layoutDependencyFingerprint,
    expectedPreviousStyleProvenanceFingerprint: item.provenanceFingerprint,
    nextStyle,
    nextStyleFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(nextStyle),
    ),
    nextStyleProvenanceFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson({ owner: label ?? "sidecar-meter", nextStyle }),
    ),
  })
  const preflight = prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2({
    previousRoot: root,
    change,
    workPolicy: root.workPolicy,
  })
  if (preflight.status !== "not-required") {
    throw new Error(`meter preflight was ${preflight.status}`)
  }
  const authorityRecord =
    resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
      previousRoot: root,
      change,
      composition: fixture.composition,
      candidateWork: preflight.completedCandidateWork,
    })
  if (authorityRecord == null) throw new Error("meter authority missing")
  const meter = openVNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1({
    previousRoot: root,
    change,
    composition: fixture.composition,
    candidateWork: preflight.completedCandidateWork,
    candidateWorkAuthority: authorityRecord as unknown as
      VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
  })
  if (meter == null) throw new Error("meter open blocked")
  return { ...fixture, change, preflight: preflight.preflight, meter }
}

function mixedPlanAFoundation(lineCount = 8) {
  const source = repeatedUnifiedLayoutRootSourceFixtureV1({
    lineCount,
    includeImages: false,
    includeBreaks: false,
  })
  const preparedRoot = prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: source.spatialEntries,
  }, FIVE_B2_TEST_POLICY, "complete-bootstrap")
  if (preparedRoot.status !== "prepared") throw new Error("multi-text Root blocked")
  const committed = registerPreparedVNextTextBlockUnifiedLayoutRootGraphInternalV2(
    preparedRoot.root,
  )
  if (committed.status !== "committed") throw new Error("multi-text Root registration blocked")
  const root = preparedRoot.root
  const composition = planAFor(root)
  const preparedSidecars = prepare(root.sourceState)
  if (!registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
    root,
    composition,
    candidateAuthority: preparedSidecars.candidateAuthority,
  })) throw new Error("mixed sidecar registration blocked")
  return openMeterForPlanAFixture({
    root,
    composition,
    sidecars: preparedSidecars.sidecars,
  }, "mixed-sidecar-meter")
}

function prepareMixedPrefixCandidate(lineCount = 8) {
  const foundation = mixedPlanAFoundation(lineCount)
  const previousEntries = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
    foundation.sidecars.orderRoot,
  ).entries
  const previous = previousEntries[0]!.item
  if (previous.kind !== "text") throw new Error("mixed prefix text missing")
  const next = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
    sourceState: foundation.root.sourceState,
    kind: "text",
    renderedText: "ABCDEFGHIJKLMNOP",
    lineageId: "mixed-prefix-next-lineage",
    inlineId: "mixed-prefix-next-inline",
    sourceFingerprint: "mixed-prefix-next-source",
    provenanceFingerprint: "mixed-prefix-next-provenance",
    style: previous.style,
  })
  if (next == null) throw new Error("mixed prefix replacement blocked")
  const previousRange = Object.freeze({
    startRenderedUtf16: 0,
    endRenderedUtf16: previous.renderedUtf16Length,
  })
  const replacement = Object.freeze({
    previousRange,
    nextItems: Object.freeze([next]),
    expectedPreviousContentFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson([previous.renderedText]),
    ),
    expectedPreviousSourceFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson([previous.sourceFingerprint]),
    ),
    expectedPreviousProvenanceFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson([previous.provenanceFingerprint]),
    ),
    fingerprint: "mixed-prefix-replacement",
  })
  if (!registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
    previousSourceState: foundation.root.sourceState,
    replacement,
    change: foundation.change,
  })) throw new Error("mixed prefix registration blocked")
  const prepared = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
    previousSourceState: foundation.root.sourceState,
    replacement,
    beforeVisit: () => true,
  })
  if (prepared.status !== "prepared") throw new Error(`mixed prefix was ${prepared.status}`)
  const record = getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
    prepared.pathCopyCandidateAuthority,
  )
  if (record == null) throw new Error("mixed prefix record missing")
  return { ...foundation, previousEntries, prepared, record, replacement }
}

function prepareMixedDeletionCandidate(lineCount: number, removedItemCount: number) {
  const foundation = mixedPlanAFoundation(lineCount)
  const previousEntries = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
    foundation.sidecars.orderRoot,
  ).entries
  const removed = previousEntries.slice(0, removedItemCount).map((entry) => entry.item)
  const previousRange = Object.freeze({
    startRenderedUtf16: 0,
    endRenderedUtf16: removed.reduce(
      (sum, item) => sum + item.renderedUtf16Length,
      0,
    ),
  })
  const replacement = Object.freeze({
    previousRange,
    nextItems: Object.freeze([]),
    expectedPreviousContentFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(removed.map((item) => item.renderedText)),
    ),
    expectedPreviousSourceFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(removed.map((item) => item.sourceFingerprint)),
    ),
    expectedPreviousProvenanceFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson(removed.map((item) => item.provenanceFingerprint)),
    ),
    fingerprint: `mixed-prefix-delete-${removedItemCount}`,
  })
  if (!registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
    previousSourceState: foundation.root.sourceState,
    replacement,
    change: foundation.change,
  })) throw new Error("mixed deletion registration blocked")
  const prepared = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
    previousSourceState: foundation.root.sourceState,
    replacement,
    beforeVisit: () => true,
  })
  if (prepared.status !== "prepared") throw new Error(`mixed deletion was ${prepared.status}`)
  const record = getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
    prepared.pathCopyCandidateAuthority,
  )
  if (record == null) throw new Error("mixed deletion record missing")
  return { ...foundation, previousEntries, prepared, record, replacement }
}

function prepareMixedSingleItemEditCandidate(
  itemIndex: number,
  kind: "insertion" | "deletion" | "replacement" | "style-change",
) {
  const foundation = mixedPlanAFoundation(8)
  const previousEntries = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
    foundation.sidecars.orderRoot,
  ).entries
  const previous = previousEntries[itemIndex]?.item
  if (previous?.kind !== "text") throw new Error("single-item edit text missing")
  const nextStyle = kind === "style-change"
    ? Object.freeze({
        ...previous.style,
        measurementStyleKey: `edit-measurement-${itemIndex}`,
        effectiveShapingStyleKey: `edit-shaping-${itemIndex}`,
      })
    : previous.style
  const created = kind === "deletion"
    ? null
    : createVNextTextBlockTransitionReplacementSourceItemInternalV1({
        sourceState: foundation.root.sourceState,
        kind: "text",
        renderedText: kind === "insertion" ? "I" : "R",
        lineageId: `edit-${kind}-lineage-${itemIndex}`,
        inlineId: `edit-${kind}-inline-${itemIndex}`,
        sourceFingerprint: `edit-${kind}-source-${itemIndex}`,
        provenanceFingerprint: `edit-${kind}-provenance-${itemIndex}`,
        style: nextStyle,
      })
  if (kind !== "deletion" && created == null) throw new Error("edit item blocked")
  const nextItems = Object.freeze(kind === "deletion"
    ? []
    : kind === "insertion" ? [created!, previous] : [created!])
  const startRenderedUtf16 = previousEntries.slice(0, itemIndex).reduce(
    (sum, entry) => sum + entry.renderedUtf16Length,
    0,
  )
  const previousRange = Object.freeze({
    startRenderedUtf16,
    endRenderedUtf16: startRenderedUtf16 + previous.renderedUtf16Length,
  })
  const replacement = Object.freeze({
    previousRange,
    nextItems,
    expectedPreviousContentFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson([previous.renderedText]),
    ),
    expectedPreviousSourceFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson([previous.sourceFingerprint]),
    ),
    expectedPreviousProvenanceFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson([previous.provenanceFingerprint]),
    ),
    fingerprint: `mixed-${kind}-${itemIndex}`,
  })
  if (!registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
    previousSourceState: foundation.root.sourceState,
    replacement,
    change: foundation.change,
  })) throw new Error("single-item edit registration blocked")
  const prepared = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
    previousSourceState: foundation.root.sourceState,
    replacement,
    beforeVisit: () => true,
  })
  if (prepared.status !== "prepared") throw new Error(`single-item edit was ${prepared.status}`)
  const record = getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
    prepared.pathCopyCandidateAuthority,
  )
  if (record == null) throw new Error("single-item edit record missing")
  return { ...foundation, previousEntries, prepared, record, replacement, previous }
}

function preparePlanASourceCandidate(input: {
  readonly nextItemCount?: number
  readonly sourceLimits?: NonNullable<
    Parameters<typeof admitted5B2PlanARootFixture>[0]
  >["sourceLimits"]
  readonly useDistinctNextStyle?: boolean
}) {
  const foundation = openPlanAMeter({ sourceLimits: input.sourceLimits })
  const previousSourceState = foundation.root.sourceState
  if (previousSourceState.root.nodeKind !== "leaf") throw new Error("candidate leaf missing")
  const previous = previousSourceState.root.items[0]
  if (previous?.kind !== "text") throw new Error("candidate text missing")
  const nextStyle = input.useDistinctNextStyle
    ? Object.freeze({
        ...previous.style,
        measurementStyleKey: "path-copy-next-measurement",
        effectiveShapingStyleKey: "path-copy-next-shaping",
        textColor: "0088FF",
      })
    : previous.style
  const nextItems = Object.freeze(Array.from(
    { length: input.nextItemCount ?? 2 },
    (_, index) => {
      const item = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
        sourceState: previousSourceState,
        kind: "text",
        renderedText: String.fromCharCode(88 + index),
        lineageId: `path-copy-lineage-${index}`,
        inlineId: `path-copy-inline-${index}`,
        sourceFingerprint: `path-copy-source-${index}`,
        provenanceFingerprint: `path-copy-provenance-${index}`,
        style: nextStyle,
      })
      if (item == null) throw new Error("path-copy item blocked")
      return item
    },
  ))
  const previousRange = Object.freeze({
    startRenderedUtf16: 0,
    endRenderedUtf16: previous.renderedUtf16Length,
  })
  const replacement = Object.freeze({
    previousRange,
    nextItems,
    expectedPreviousContentFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson([previous.renderedText]),
    ),
    expectedPreviousSourceFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson([previous.sourceFingerprint]),
    ),
    expectedPreviousProvenanceFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson([previous.provenanceFingerprint]),
    ),
    fingerprint: createVNextCompactFingerprint(stringifyVNextCanonicalJson({
      previousRange,
      nextItems: nextItems.map((item) => item.fingerprint),
    })),
  })
  if (!registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
    previousSourceState,
    replacement,
    change: foundation.change,
  })) throw new Error("path-copy replacement registration blocked")
  const prepared = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
    previousSourceState,
    replacement,
    beforeVisit: () => true,
  })
  if (prepared.status !== "prepared") {
    throw new Error(`path-copy Source was ${prepared.status}`)
  }
  const record = getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
    prepared.pathCopyCandidateAuthority,
  )
  if (record == null) throw new Error("path-copy record missing")
  return { ...foundation, prepared, record, replacement }
}

describe("Phase 5B-2 complete process-local Source sidecars", () => {
  it("registers exact frozen removed and next-physical candidate arrays", () => {
    // Catches omitting the two physical sequences or substituting nextLeafItems.
    const previousSourceState = textSource(1)
    if (previousSourceState.root.nodeKind !== "leaf") throw new Error("leaf missing")
    const previous = previousSourceState.root.items[0]
    if (previous?.kind !== "text") throw new Error("text item missing")
    const created = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
      sourceState: previousSourceState,
      kind: "text",
      renderedText: "next",
      lineageId: "candidate-next-lineage",
      inlineId: "candidate-next-inline",
      sourceFingerprint: "candidate-next-source",
      provenanceFingerprint: "candidate-next-provenance",
      style: previous.style,
    })
    if (created == null) throw new Error("replacement item blocked")
    const previousRange = Object.freeze({
      startRenderedUtf16: 0,
      endRenderedUtf16: previous.renderedUtf16Length,
    })
    const nextItems = Object.freeze([created])
    const replacement = Object.freeze({
      previousRange,
      nextItems,
      expectedPreviousContentFingerprint: createVNextCompactFingerprint(
        stringifyVNextCanonicalJson([previous.renderedText]),
      ),
      expectedPreviousSourceFingerprint: createVNextCompactFingerprint(
        stringifyVNextCanonicalJson([previous.sourceFingerprint]),
      ),
      expectedPreviousProvenanceFingerprint: createVNextCompactFingerprint(
        stringifyVNextCanonicalJson([previous.provenanceFingerprint]),
      ),
      fingerprint: "candidate-array-replacement",
    })
    expect(registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
      previousSourceState,
      replacement,
    })).toBe(true)
    const prepared = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
      previousSourceState,
      replacement,
      beforeVisit: () => true,
    })
    expect(prepared.status).toBe("prepared")
    if (prepared.status !== "prepared") return
    const record = getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      prepared.pathCopyCandidateAuthority,
    )

    expect(record?.removedItems).toEqual([previous])
    expect(record?.removedItems[0]).toBe(previous)
    expect(record?.nextPhysicalItems).toEqual([created])
    expect(record?.nextPhysicalItems[0]).toBe(created)
    expect(record?.nextPhysicalItems).not.toBe(record?.nextLeafItems)
    expect(Object.isFrozen(record?.removedItems)).toBe(true)
    expect(Object.isFrozen(record?.nextPhysicalItems)).toBe(true)
  })

  it("keeps Source replacement authority on its exact first binding", () => {
    // Catches rebinding one replacement from change A to a cross-candidate change B.
    const candidate = preparePlanASourceCandidate({ nextItemCount: 1 })
    expect(registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
      previousSourceState: candidate.root.sourceState,
      replacement: candidate.replacement,
      change: candidate.change,
    })).toBe(true)
    const otherChange = Object.freeze({
      ...candidate.change,
      nextStyleProvenanceFingerprint: "cross-candidate-change",
    })
    expect(registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
      previousSourceState: candidate.root.sourceState,
      replacement: candidate.replacement,
      change: otherChange,
    })).toBe(false)

    const prepared = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
      previousSourceState: candidate.root.sourceState,
      replacement: candidate.replacement,
      beforeVisit: () => true,
    })
    expect(prepared.status).toBe("prepared")
    if (prepared.status !== "prepared") return
    expect(getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      prepared.pathCopyCandidateAuthority,
    )?.change).toBe(candidate.change)
  })

  it("does not consult the stale legacy item index on registered Plan A Source", () => {
    // Catches reusing prepared.itemIndex after Plan A moved inline authority to sidecars.
    setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1(
      () => { throw new Error("legacy item index observed") },
    )
    try {
      expect(() => preparePlanASourceCandidate({ nextItemCount: 1 })).not.toThrow()
    } finally {
      setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1(null)
    }
  })

  it("registers no physical-array candidate authority on a limited Source path copy", () => {
    const previousSourceState = textSource(1)
    if (previousSourceState.root.nodeKind !== "leaf") throw new Error("leaf missing")
    const previous = previousSourceState.root.items[0]
    if (previous?.kind !== "text") throw new Error("text item missing")
    const created = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
      sourceState: previousSourceState,
      kind: "text",
      renderedText: "limited",
      lineageId: "limited-lineage",
      inlineId: "limited-inline",
      sourceFingerprint: "limited-source",
      provenanceFingerprint: "limited-provenance",
      style: previous.style,
    })
    if (created == null) throw new Error("limited item blocked")
    const previousRange = Object.freeze({
      startRenderedUtf16: 0,
      endRenderedUtf16: previous.renderedUtf16Length,
    })
    const replacement = Object.freeze({
      previousRange,
      nextItems: Object.freeze([created]),
      expectedPreviousContentFingerprint: createVNextCompactFingerprint(
        stringifyVNextCanonicalJson([previous.renderedText]),
      ),
      expectedPreviousSourceFingerprint: createVNextCompactFingerprint(
        stringifyVNextCanonicalJson([previous.sourceFingerprint]),
      ),
      expectedPreviousProvenanceFingerprint: createVNextCompactFingerprint(
        stringifyVNextCanonicalJson([previous.provenanceFingerprint]),
      ),
      fingerprint: "limited-source-replacement",
    })
    expect(registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
      previousSourceState,
      replacement,
    })).toBe(true)
    const result = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
      previousSourceState,
      replacement,
      beforeVisit: () => false,
    })
    expect(result).toMatchObject({ status: "limit-exceeded", sourceState: null })
    expect(result).not.toHaveProperty("pathCopyCandidateAuthority")
    expect(getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      replacement.nextItems,
    )).toBeNull()
    expect(getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      replacement,
    )).toBeNull()
  })

  it("allocates canonical even interior keys with exact open meter authority", () => {
    // Catches rounding drift or emitting non-interior/non-monotonic keys.
    const { meter } = openPlanAMeter()
    expect(allocateVNextTextBlockSourcePositionKeysInternalV1({
      left: 0,
      right: 100,
      count: 3,
      workMeter: meter,
    })).toEqual({ status: "allocated", keys: [25, 50, 75] })
  })

  it("returns candidate-free exact key-space exhaustion", () => {
    // Catches relabeling structural exhaustion as work-limit or emitting a partial key.
    const { meter } = openPlanAMeter()
    expect(allocateVNextTextBlockSourcePositionKeysInternalV1({
      left: 10,
      right: 12,
      count: 2,
      workMeter: meter,
    })).toEqual({ status: "key-space-exhausted", keys: [] })
  })

  it("binds coordinator key-space exhaustion proof to the exact candidate tuple", () => {
    const candidate = prepareMixedSingleItemEditCandidate(3, "insertion")
    const result =
      prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyWithForcedPositionIntervalForTestInternalV1({
        previousSourceState: candidate.root.sourceState,
        nextSourceState: candidate.prepared.sourceState,
        replacement: candidate.replacement,
        removedItems: candidate.record.removedItems,
        nextPhysicalItems: candidate.record.nextPhysicalItems,
        previousSidecars: candidate.sidecars,
        workMeter: candidate.meter,
      }, { left: 10, right: 12 })
    expect(result).toMatchObject({
      status: "fallback-required",
      cause: "source-position-key-space-exhausted",
      sidecars: null,
      evaluatorOrProofAuthority: expect.any(Object),
    })
    if (result.status !== "fallback-required") return
    const matches = (input: Partial<{
      proofAuthority: object
      previousSidecars: typeof candidate.sidecars
      replacement: typeof candidate.replacement
      removedItems: typeof candidate.record.removedItems
      nextPhysicalItems: typeof candidate.record.nextPhysicalItems
      workMeter: typeof candidate.meter
    }> = {}) => matchesVNextTextBlockUnifiedLayoutSourcePositionKeyExhaustionProofInternalV1({
      proofAuthority: input.proofAuthority ?? result.evaluatorOrProofAuthority,
      previousSidecars: input.previousSidecars ?? candidate.sidecars,
      replacement: input.replacement ?? candidate.replacement,
      removedItems: input.removedItems ?? candidate.record.removedItems,
      nextPhysicalItems: input.nextPhysicalItems ?? candidate.record.nextPhysicalItems,
      workMeter: input.workMeter ?? candidate.meter,
    })
    expect(matches()).toBe(true)
    expect(matches({ proofAuthority: structuredClone(result.evaluatorOrProofAuthority) }))
      .toBe(false)
    expect(matches({ removedItems: Object.freeze([...candidate.record.removedItems]) }))
      .toBe(false)
    expect(matches({
      nextPhysicalItems: Object.freeze([...candidate.record.nextPhysicalItems]),
    })).toBe(false)
    const foreign = prepareMixedSingleItemEditCandidate(3, "insertion")
    expect(matches({
      previousSidecars: foreign.sidecars,
      replacement: foreign.replacement,
      removedItems: foreign.record.removedItems,
      nextPhysicalItems: foreign.record.nextPhysicalItems,
      workMeter: foreign.meter,
    })).toBe(false)
    const later = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
      meter: candidate.meter,
      unit: "source-style-nodes",
    })
    expect(later.status).toBe("permitted")
    if (later.status !== "permitted") return
    expect(completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(later.permit))
      .toBe(true)
    expect(matches()).toBe(false)
    expect(result).not.toHaveProperty("candidateAuthority")
  }, 30_000)

  it("validates the meter before observing neighbors and skips neighbors for zero count", () => {
    // Catches accepting a detached/closed meter or reading irrelevant neighbors.
    const exact = openPlanAMeter()
    const hostileInput = (workMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1) =>
      Object.defineProperties({ count: 0, workMeter }, {
        left: { enumerable: true, get() { throw new Error("left observed") } },
        right: { enumerable: true, get() { throw new Error("right observed") } },
      }) as Parameters<typeof allocateVNextTextBlockSourcePositionKeysInternalV1>[0]

    expect(allocateVNextTextBlockSourcePositionKeysInternalV1(hostileInput(exact.meter)))
      .toEqual({ status: "allocated", keys: [] })
    expect(allocateVNextTextBlockSourcePositionKeysInternalV1(hostileInput(
      structuredClone(exact.meter),
    ))).toEqual({ status: "invalid", keys: [] })

    const projected = projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(
      exact.meter,
    )
    if (projected == null) throw new Error("meter projection missing")
    expect(publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1({
      meter: exact.meter,
      nextCandidateWork: projected,
      producingStageAuthority: exact.preflight,
    })).not.toBeNull()
    expect(allocateVNextTextBlockSourcePositionKeysInternalV1(hostileInput(exact.meter)))
      .toEqual({ status: "invalid", keys: [] })
  })

  it("accepts only exact registered removed and next-physical arrays", () => {
    // Catches structural-equality authorization, nextLeafItems substitution, and array slicing.
    const candidate = preparePlanASourceCandidate({ nextItemCount: 2 })
    const call = (removedItems: typeof candidate.record.removedItems,
      nextPhysicalItems: typeof candidate.record.nextPhysicalItems) =>
      prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
        previousSourceState: candidate.root.sourceState,
        nextSourceState: candidate.prepared.sourceState,
        replacement: candidate.replacement,
        removedItems,
        nextPhysicalItems,
        previousSidecars: candidate.sidecars,
        workMeter: candidate.meter,
      })

    expect(call(Object.freeze([...candidate.record.removedItems]),
      candidate.record.nextPhysicalItems)).toMatchObject({ status: "blocked", sidecars: null })
    expect(call(candidate.record.removedItems,
      Object.freeze([...candidate.record.nextPhysicalItems]))).toMatchObject({
      status: "blocked",
      sidecars: null,
    })
    expect(call(candidate.record.removedItems,
      candidate.record.nextLeafItems)).toMatchObject({ status: "blocked", sidecars: null })
    expect(call(candidate.record.removedItems,
      Object.freeze(candidate.record.nextPhysicalItems.slice(0, 1)))).toMatchObject({
      status: "blocked",
      sidecars: null,
    })
    expect(call(candidate.record.removedItems,
      Object.freeze([...candidate.record.nextPhysicalItems].reverse()))).toMatchObject({
      status: "blocked",
      sidecars: null,
    })
    const foreign = preparePlanASourceCandidate({ nextItemCount: 2 })
    expect(call(foreign.record.removedItems,
      foreign.record.nextPhysicalItems)).toMatchObject({
      status: "blocked",
      sidecars: null,
    })

    const exact = call(candidate.record.removedItems, candidate.record.nextPhysicalItems)
    expect(exact.status).toBe("prepared")
    if (exact.status !== "prepared") return
    expect(exact.sidecars.sourceState).toBe(candidate.prepared.sourceState)
    expect(inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
      exact.sidecars.orderRoot,
    ).entries.map((entry) => entry.item)).toEqual(candidate.record.nextLeafItems)
  })

  it("rejects a fresh cross-candidate meter before any Source observation", () => {
    const exact = preparePlanASourceCandidate({ nextItemCount: 2 })
    const foreign = preparePlanASourceCandidate({ nextItemCount: 2 })
    const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
      previousSourceState: exact.root.sourceState,
      nextSourceState: exact.prepared.sourceState,
      replacement: exact.replacement,
      removedItems: exact.record.removedItems,
      nextPhysicalItems: exact.record.nextPhysicalItems,
      previousSidecars: exact.sidecars,
      workMeter: foreign.meter,
    })
    expect(result).toMatchObject({ status: "blocked", sidecars: null })
    const receipts = inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
      foreign.meter,
    )
    expect(receipts?.filter((receipt) => receipt.ownerRow.stage === "source"))
      .toSatisfy((rows: NonNullable<typeof receipts>) =>
        rows.every((receipt) =>
          receipt.attemptedWork === 0 && receipt.completedWork === 0,
        ),
      )
  })

  it("path-copies style refcounts for replacement multiplicity", () => {
    // Catches retaining a stale one-reference style registry after one-to-two replacement.
    const candidate = preparePlanASourceCandidate({ nextItemCount: 2 })
    const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
      previousSourceState: candidate.root.sourceState,
      nextSourceState: candidate.prepared.sourceState,
      replacement: candidate.replacement,
      removedItems: candidate.record.removedItems,
      nextPhysicalItems: candidate.record.nextPhysicalItems,
      previousSidecars: candidate.sidecars,
      workMeter: candidate.meter,
    })
    expect(result.status).toBe("prepared")
    if (result.status !== "prepared") return
    const styles = inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1(
      result.sidecars.styleRoot,
    )
    expect(styles.totalRefcount).toBe(2)
    expect(styles.exactStyleCount).toBe(1)
    expect(styles.entries[0]?.bucket[0]?.refcount).toBe(2)
  })

  it.each([
    ["first", 0, "insertion", 9],
    ["middle", 3, "insertion", 9],
    ["last", 7, "insertion", 9],
    ["first", 0, "deletion", 7],
    ["middle", 3, "deletion", 7],
    ["last", 7, "deletion", 7],
    ["first", 0, "replacement", 8],
    ["middle", 3, "replacement", 8],
    ["last", 7, "replacement", 8],
    ["first", 0, "style-change", 8],
    ["middle", 3, "style-change", 8],
    ["last", 7, "style-change", 8],
  ] as const)(
    "path-copies a $2 at the $0 position of a full eight-item leaf",
    (_position, itemIndex, kind, expectedCount) => {
      const candidate = prepareMixedSingleItemEditCandidate(itemIndex, kind)
      const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
        previousSourceState: candidate.root.sourceState,
        nextSourceState: candidate.prepared.sourceState,
        replacement: candidate.replacement,
        removedItems: candidate.record.removedItems,
        nextPhysicalItems: candidate.record.nextPhysicalItems,
        previousSidecars: candidate.sidecars,
        workMeter: candidate.meter,
      })
      expect(result.status).toBe("prepared")
      if (result.status !== "prepared") return
      expect(inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
        result.sidecars.orderRoot,
      ).entryCount).toBe(expectedCount)
      expect(inspectVNextTextBlockUnifiedLayoutSourceIdentityTreeInternalV1(
        result.sidecars.identityRoot,
      ).entryCount).toBe(expectedCount)
      expect(inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1(
        result.sidecars.styleRoot,
      ).totalRefcount).toBe(expectedCount)
      const retained = candidate.previousEntries.filter(
        (entry) => entry.item !== candidate.previous,
      )
      for (const entry of retained) {
        expect(lookupVNextTextBlockUnifiedLayoutSourcePhysicalEntriesInternalV1({
          root: result.sidecars.identityRoot,
          inlineId: entry.item.inlineId,
        })).toContain(entry)
      }
    },
    30_000,
  )

  it("removes a zero-refcount style and inserts a previously absent exact style", () => {
    // Catches zero-count tombstones and failure to insert the replacement style facts.
    const candidate = preparePlanASourceCandidate({
      nextItemCount: 1,
      useDistinctNextStyle: true,
    })
    const previousStyleRoot = candidate.sidecars.styleRoot
    const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
      previousSourceState: candidate.root.sourceState,
      nextSourceState: candidate.prepared.sourceState,
      replacement: candidate.replacement,
      removedItems: candidate.record.removedItems,
      nextPhysicalItems: candidate.record.nextPhysicalItems,
      previousSidecars: candidate.sidecars,
      workMeter: candidate.meter,
    })
    expect(result.status).toBe("prepared")
    if (result.status !== "prepared") return
    const styles = inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1(
      result.sidecars.styleRoot,
    )
    expect(result.sidecars.styleRoot).not.toBe(previousStyleRoot)
    expect(styles.totalRefcount).toBe(1)
    expect(styles.exactStyleCount).toBe(1)
    expect(styles.entries).toHaveLength(1)
    expect(styles.entries[0]).toMatchObject({
      measurementStyleKey: "path-copy-next-measurement",
      effectiveShapingStyleKey: "path-copy-next-shaping",
    })
  })

  it("retains a suffix entry while deriving its shifted current absolute range", () => {
    // Catches suffix entry rewrites and stale absolute offsets after a longer prefix edit.
    const candidate = prepareMixedPrefixCandidate()
    const suffixEntry = candidate.previousEntries[1]
    if (suffixEntry == null) throw new Error("retained suffix missing")
    const previousStart = candidate.previousEntries
      .slice(0, candidate.previousEntries.indexOf(suffixEntry))
      .reduce((sum, entry) => sum + entry.renderedUtf16Length, 0)
    const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
      previousSourceState: candidate.root.sourceState,
      nextSourceState: candidate.prepared.sourceState,
      replacement: candidate.replacement,
      removedItems: candidate.record.removedItems,
      nextPhysicalItems: candidate.record.nextPhysicalItems,
      previousSidecars: candidate.sidecars,
      workMeter: candidate.meter,
    })
    expect(result.status).toBe("prepared")
    if (result.status !== "prepared") return
    const retained = lookupVNextTextBlockUnifiedLayoutSourcePhysicalEntriesInternalV1({
      root: result.sidecars.identityRoot,
      inlineId: suffixEntry.item.inlineId,
    })
    expect(retained).toEqual([suffixEntry])
    expect(retained[0]).toBe(suffixEntry)
    expect(lookupVNextTextBlockUnifiedLayoutSourcePhysicalRangeInternalV1({
      root: result.sidecars.orderRoot,
      entry: suffixEntry,
    })).toEqual({
      status: "found",
      startRenderedUtf16: previousStart + 4,
      endRenderedUtf16: previousStart + 4 + suffixEntry.renderedUtf16Length,
    })
  })

  it("retains untouched suffix identity and order subtrees", () => {
    // Catches complete index reconstruction or cloning every suffix child.
    const candidate = prepareMixedPrefixCandidate(33)
    const previousIdentity = candidate.sidecars.identityRoot
    const previousOrder = candidate.sidecars.orderRoot
    if (previousIdentity?.nodeKind !== "branch" || previousOrder?.nodeKind !== "branch") {
      throw new Error("multi-level sidecar roots missing")
    }
    const retainedIdentityChild = previousIdentity.children.at(-1)!
    const retainedOrderChild = previousOrder.children.at(-1)!
    const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
      previousSourceState: candidate.root.sourceState,
      nextSourceState: candidate.prepared.sourceState,
      replacement: candidate.replacement,
      removedItems: candidate.record.removedItems,
      nextPhysicalItems: candidate.record.nextPhysicalItems,
      previousSidecars: candidate.sidecars,
      workMeter: candidate.meter,
    })
    expect(result.status).toBe("prepared")
    if (result.status !== "prepared") return
    if (
      result.sidecars.identityRoot?.nodeKind !== "branch"
      || result.sidecars.orderRoot?.nodeKind !== "branch"
    ) throw new Error("next multi-level roots missing")
    expect(result.sidecars.identityRoot.children).toContain(retainedIdentityChild)
    expect(result.sidecars.orderRoot.children).toContain(retainedOrderChild)
  }, 30_000)

  it("keeps exact index authority under forced incremental node-fingerprint collisions", () => {
    const candidate = prepareMixedPrefixCandidate(33)
    const result = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexWithForcedFingerprintCollisionForTestInternalV1({
      identityRoot: candidate.sidecars.identityRoot,
      orderRoot: candidate.sidecars.orderRoot,
      removedItems: candidate.record.removedItems,
      nextPhysicalItems: candidate.record.nextPhysicalItems,
      workMeter: candidate.meter,
    })
    expect(result.status).toBe("prepared")
    if (result.status !== "prepared") return
    const identity = inspectVNextTextBlockUnifiedLayoutSourceIdentityTreeInternalV1(
      result.identityRoot,
    )
    const order = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
      result.orderRoot,
    )
    expect(identity.entryCount).toBe(33)
    expect(order.entryCount).toBe(33)
    expect(identity.entries.map((entry) => entry.item))
      .toEqual(expect.arrayContaining([...candidate.record.nextLeafItems]))
    const forcedFingerprint = `sha256:${"0".repeat(64)}`
    const collectFingerprints = (node: typeof result.identityRoot): readonly string[] =>
      node == null ? [] : node.nodeKind === "leaf"
        ? [node.fingerprint]
        : [node.fingerprint, ...node.children.flatMap(collectFingerprints)]
    expect(collectFingerprints(result.identityRoot).filter(
      (value) => value === forcedFingerprint,
    ).length).toBeGreaterThan(1)
  })

  it("rebalances height-two physical roots after a bounded multi-leaf deletion", () => {
    const candidate = prepareMixedDeletionCandidate(128, 28)
    const previousIdentity = candidate.sidecars.identityRoot
    const previousOrder = candidate.sidecars.orderRoot
    if (previousIdentity?.nodeKind !== "branch" || previousOrder?.nodeKind !== "branch") {
      throw new Error("height-two deletion fixture missing")
    }
    const identityNodes = (
      node: NonNullable<typeof candidate.sidecars.identityRoot>,
    ): readonly NonNullable<typeof candidate.sidecars.identityRoot>[] =>
      node.nodeKind === "leaf"
        ? [node]
        : [node, ...node.children.flatMap(identityNodes)]
    const previousIdentityNodes = identityNodes(previousIdentity)
    const retainedOrderSuffix = previousOrder.children.at(-1)!
    const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
      previousSourceState: candidate.root.sourceState,
      nextSourceState: candidate.prepared.sourceState,
      replacement: candidate.replacement,
      removedItems: candidate.record.removedItems,
      nextPhysicalItems: candidate.record.nextPhysicalItems,
      previousSidecars: candidate.sidecars,
      workMeter: candidate.meter,
    })
    expect(result.status).toBe("prepared")
    if (result.status !== "prepared") return
    const identity = inspectVNextTextBlockUnifiedLayoutSourceIdentityTreeInternalV1(
      result.sidecars.identityRoot,
    )
    const order = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
      result.sidecars.orderRoot,
    )
    expect(identity.entryCount).toBe(100)
    expect(order.entryCount).toBe(100)
    expect(identity.branchOccupancies.every((count) => count >= 2 && count <= 8))
      .toBe(true)
    expect(order.branchOccupancies.every((count) => count >= 2 && count <= 8))
      .toBe(true)
    expect(identity.leafOccupancies.every((count) => count >= 4 && count <= 8))
      .toBe(true)
    expect(order.leafOccupancies.every((count) => count >= 4 && count <= 8))
      .toBe(true)
    if (
      result.sidecars.identityRoot?.nodeKind !== "branch"
      || result.sidecars.orderRoot?.nodeKind !== "branch"
    ) throw new Error("rebalanced physical roots missing")
    const nextIdentityNodes = new Set(identityNodes(result.sidecars.identityRoot))
    expect(previousIdentityNodes.some((node) => nextIdentityNodes.has(node))).toBe(true)
    expect(result.sidecars.orderRoot.children).toContain(retainedOrderSuffix)
  }, 60_000)

  it("owns physical rebalance payload and key reads before observation", () => {
    const candidate = prepareMixedDeletionCandidate(128, 28)
    if (candidate.sidecars.identityRoot == null || candidate.sidecars.orderRoot == null) {
      throw new Error("guarded physical roots missing")
    }
    const unownedReads: string[] = []
    const cache = {
      nodes: new WeakMap<object, object>(),
      entries: new WeakMap<object, object>(),
    }
    const result = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
      identityRoot: guardTask5TreeReads({
        root: candidate.sidecars.identityRoot,
        meter: candidate.meter,
        prefix: "source-index-",
        unownedReads,
        cache,
      }),
      orderRoot: guardTask5TreeReads({
        root: candidate.sidecars.orderRoot,
        meter: candidate.meter,
        prefix: "source-index-",
        unownedReads,
        cache,
      }),
      removedItems: candidate.record.removedItems,
      nextPhysicalItems: candidate.record.nextPhysicalItems,
      workMeter: candidate.meter,
    })
    expect(result.status).toBe("prepared")
    expect(unownedReads).toEqual([])
  }, 60_000)

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

  it("bounds complete identity probes for many same-inline text fragments", () => {
    // Catches enumerating/materializing the growing same-inline range per insertion.
    const fragmentCount = 128
    const maximumIdentityHeight = 2
    const maximumBranchChildren = 8
    const maximumLeafEntries = 8
    const maximumProbeNodesPerFragment = maximumIdentityHeight + 1
    const maximumCreatedOrVisitedPathNodesPerTree =
      3 * (maximumIdentityHeight + 1) + 1
    const maximumIndexNodes = fragmentCount * (
      maximumProbeNodesPerFragment
      + 2 * maximumCreatedOrVisitedPathNodesPerTree
    )
    const maximumIndexComparisons = fragmentCount * (
      maximumBranchChildren * maximumIdentityHeight
      + maximumLeafEntries
      + maximumBranchChildren * (maximumIdentityHeight + 1)
      + maximumIdentityHeight + 1
    )
    const observedCompleteBuild = () => {
      const operations: Record<string, number> = {}
      const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
        sourceState: sameInlineTextFragmentSource(fragmentCount),
        observeBeforeOperation(unit) {
          operations[unit] = (operations[unit] ?? 0) + 1
        },
      })
      if (result.status !== "prepared") throw new Error("same-inline sidecars blocked")
      return { result, operations }
    }
    const first = observedCompleteBuild()
    const second = observedCompleteBuild()

    expect(lookupVNextTextBlockUnifiedLayoutSourcePhysicalEntriesInternalV1({
      root: first.result.sidecars.identityRoot,
      inlineId: "text-000",
    })).toHaveLength(fragmentCount)
    expect(second.operations).toEqual(first.operations)
    expect(first.operations["source-index-entries"]).toBe(fragmentCount * 2)
    expect(first.operations["source-index-nodes"]).toBeLessThanOrEqual(maximumIndexNodes)
    expect(first.operations["source-index-comparisons"])
      .toBeLessThanOrEqual(maximumIndexComparisons)
  }, 30_000)

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

  it("path-copies a forced style collision bucket without sorting it", () => {
    // Catches an unmetered whole-bucket Array.sort during exact-style insertion.
    const sourceState = textSource(2, {
      sameEffectiveStyleWithDistinctAuthoredFacts: true,
    })
    const complete =
      prepareVNextTextBlockUnifiedLayoutSourceSidecarsWithForcedStyleCollisionForTestInternalV1({
        sourceState,
      })
    if (complete.status !== "prepared") throw new Error("collision fixture blocked")
    const items = sourceState.root.nodeKind === "leaf"
      ? sourceState.root.items
      : sourceState.root.children.flatMap((child) =>
          child.nodeKind === "leaf" ? child.items : [],
        )
    const removed = items[0]
    if (removed?.kind !== "text") throw new Error("collision text missing")
    const nextStyle = Object.freeze({
      ...removed.style,
      textColor: "ABCDEF",
      authoredLocalStyle: Object.freeze({
        ...(removed.style.authoredLocalStyle ?? {}),
        textColor: "ABCDEF",
      }),
    })
    const nextItem = Object.freeze({ ...removed, style: nextStyle })
    const meter = openPlanAMeter({ label: "style-collision-path-copy" }).meter
    const originalSort = Array.prototype.sort
    Array.prototype.sort = function prohibitedBucketSort(compareFn) {
      if (this.some((value) =>
        value != null
        && typeof value === "object"
        && Object.hasOwn(value, "canonicalFacts")
        && Object.hasOwn(value, "refcount")
      )) throw new Error("incremental style collision bucket must not sort")
      return originalSort.call(this, compareFn)
    }
    try {
      const result = pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsWithForcedFingerprintCollisionForTestInternalV1({
        root: complete.sidecars.styleRoot,
        removedItems: Object.freeze([removed]),
        nextPhysicalItems: Object.freeze([nextItem]),
        workMeter: meter,
      })
      expect(result.status).toBe("prepared")
      if (result.status !== "prepared") return
      const style = inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1(result.root)
      expect(style.entries).toHaveLength(1)
      expect(style.entries[0]?.bucket).toHaveLength(2)
      const bucket = style.entries[0]!.bucket
      expect(bucket[0]!.canonicalFacts < bucket[1]!.canonicalFacts).toBe(true)
    } finally {
      Array.prototype.sort = originalSort
    }
  })

  it("retains an untouched suffix style subtree by identity", () => {
    const sourceState = textSource(1)
    if (sourceState.root.nodeKind !== "leaf") throw new Error("style fixture leaf missing")
    const base = sourceState.root.items[0]
    if (base?.kind !== "text") throw new Error("style fixture text missing")
    const items = Array.from({ length: 33 }, (_, index) => {
      const suffix = index.toString().padStart(3, "0")
      return Object.freeze({
        ...base,
        inlineId: `style-inline-${suffix}`,
        lineageId: `style-lineage-${suffix}`,
        style: Object.freeze({
          ...base.style,
          measurementStyleKey: `style-measurement-${suffix}`,
          effectiveShapingStyleKey: `style-shaping-${suffix}`,
        }),
      })
    })
    let styleRoot = null as ReturnType<
      typeof insertVNextTextBlockUnifiedLayoutSourceStyleCompleteInternalV1
    > | null
    for (const item of items) {
      styleRoot = insertVNextTextBlockUnifiedLayoutSourceStyleCompleteInternalV1({
        root: styleRoot,
        style: item.style,
      })
    }
    if (styleRoot?.nodeKind !== "branch") throw new Error("style branch fixture missing")
    const meter = openPlanAMeter({ label: "retained-style-suffix" }).meter
    const unownedReads: string[] = []
    const guardedStyleRoot = guardTask5TreeReads({
      root: styleRoot,
      meter,
      prefix: "source-style-",
      unownedReads,
    })
    if (guardedStyleRoot.nodeKind !== "branch") throw new Error("guarded style branch missing")
    const retainedSuffix = guardedStyleRoot.children.at(-1)!
    unownedReads.length = 0
    const result = pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsInternalV1({
      root: guardedStyleRoot,
      removedItems: Object.freeze([items[0]!]),
      nextPhysicalItems: Object.freeze([]),
      workMeter: meter,
    })
    expect(result.status).toBe("prepared")
    expect(unownedReads).toEqual([])
    if (result.status !== "prepared") return
    expect(result.root?.nodeKind).toBe("branch")
    if (result.root?.nodeKind !== "branch") return
    expect(result.root.children).toContain(retainedSuffix)
    const inspected = inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1(
      result.root,
    )
    expect(inspected)
      .toMatchObject({ styleKeyCount: 32, exactStyleCount: 32, totalRefcount: 32 })
    expect(inspected.leafOccupancies.every((count) => count >= 4 && count <= 8))
      .toBe(true)
  })

  it("enforces exact 0/N-1/N/N+1 thresholds for all ten Source rows", () => {
    // The private Plan A factory binds every probe to an exact Root/change/composition.
    const rows = [
      ["source-items", "sourceItems"],
      ["source-tree-lookup-nodes", "sourceTreeLookupNodes"],
      ["source-tree-path-copy-nodes", "sourceTreePathCopyNodes"],
      ["source-leaf-slots", "sourceLeafSlots"],
      ["source-index-nodes", "sourceIndexNodes"],
      ["source-index-entries", "sourceIndexEntries"],
      ["source-index-comparisons", "sourceIndexComparisons"],
      ["source-style-nodes", "sourceStyleNodes"],
      ["source-style-buckets", "sourceStyleBuckets"],
      ["source-style-entries", "sourceStyleEntries"],
    ] as const satisfies readonly (readonly [
      VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
      keyof typeof sourceLimits,
    ])[]
    const run = (
      unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
      limitKey: keyof typeof sourceLimits,
      limit: number,
      label: string,
    ) => {
      const fixture = openPlanAMeter({
        label: `${unit}-${label}`,
        sourceLimits: { [limitKey]: limit },
      })
      let observed = false
      const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
        meter: fixture.meter,
        unit,
      })
      if (begun.status === "permitted") {
        observed = true
        expect(completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
          begun.permit,
        )).toBe(true)
      }
      const receipt = inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
        fixture.meter,
      )?.find((candidate) => candidate.ownerRow.unit === unit)
      return { begun, observed, receipt }
    }
    for (const [unit, limitKey] of rows) {
      const zero = run(unit, limitKey, 0, "zero-hostile")
      expect(zero.begun.status, unit).toBe("limit-exceeded")
      expect(zero.observed, unit).toBe(false)
      expect(zero.receipt, unit).toMatchObject({ attemptedWork: 1, completedWork: 0 })

      const minusOne = run(unit, limitKey, 0, "N-minus-one")
      expect(minusOne.begun.status, unit).toBe("limit-exceeded")
      expect(minusOne.observed, unit).toBe(false)
      expect(minusOne.receipt, unit).toMatchObject({ attemptedWork: 1, completedWork: 0 })

      const exact = run(unit, limitKey, 1, "N")
      expect(exact.begun.status, unit).toBe("permitted")
      expect(exact.observed, unit).toBe(true)
      expect(exact.receipt, unit).toMatchObject({ attemptedWork: 1, completedWork: 1 })

      const plusOne = run(unit, limitKey, 2, "N-plus-one")
      expect(plusOne.begun.status, unit).toBe("permitted")
      expect(plusOne.observed, unit).toBe(true)
      expect(plusOne.receipt, unit).toMatchObject({ attemptedWork: 1, completedWork: 1 })
    }
  }, 120_000)

  it.each([
    ["source-items", "sourceItems"],
    ["source-index-comparisons", "sourceIndexComparisons"],
    ["source-style-entries", "sourceStyleEntries"],
  ] as const)(
    "accumulates actual multi-operation %s work at N-1/N/N+1",
    (unit, limitKey) => {
      const run = (limit: number | null, label: string) => {
        const candidate = preparePlanASourceCandidate({
          nextItemCount: 2,
          sourceLimits: limit == null ? undefined : { [limitKey]: limit },
        })
        const result = prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
          previousSourceState: candidate.root.sourceState,
          nextSourceState: candidate.prepared.sourceState,
          replacement: candidate.replacement,
          removedItems: candidate.record.removedItems,
          nextPhysicalItems: candidate.record.nextPhysicalItems,
          previousSidecars: candidate.sidecars,
          workMeter: candidate.meter,
        })
        const receipt = inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
          candidate.meter,
        )?.find((candidateReceipt) => candidateReceipt.ownerRow.unit === unit)
        if (receipt == null) throw new Error(`${label} receipt missing`)
        return { result, receipt }
      }
      const baseline = run(null, "baseline")
      expect(baseline.result.status).toBe("prepared")
      const required = baseline.receipt.completedWork
      expect(required).toBeGreaterThan(1)

      const minusOne = run(required - 1, "N-minus-one")
      expect(minusOne.result).toMatchObject({
        status: "fallback-required",
        cause: "work-limit",
      })
      expect(minusOne.receipt).toMatchObject({
        attemptedWork: required,
        completedWork: required - 1,
      })

      const exact = run(required, "N")
      expect(exact.result.status).toBe("prepared")
      expect(exact.receipt).toMatchObject({
        attemptedWork: required,
        completedWork: required,
      })

      const plusOne = run(required + 1, "N-plus-one")
      expect(plusOne.result.status).toBe("prepared")
      expect(plusOne.receipt).toMatchObject({
        attemptedWork: required,
        completedWork: required,
      })
    },
    120_000,
  )

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
    expect(insertVNextTextBlockUnifiedLayoutSourcePhysicalEntryCompleteInternalV1({
      identityRoot: atomicSidecars.identityRoot,
      orderRoot: atomicSidecars.orderRoot,
      entry: Object.freeze({
        item: Object.freeze({
          ...first.item,
          inlineId: atomic.item.inlineId,
          lineageId: `${first.item.lineageId}-atomic-conflict`,
          fingerprint: `${first.item.fingerprint}-atomic-conflict`,
        }),
        positionKey: atomicSidecars.orderRoot!.lastPositionKey + 1,
        renderedUtf16Length: first.renderedUtf16Length,
      }),
    })).toEqual({ status: "blocked" })
    expect(insertVNextTextBlockUnifiedLayoutSourcePhysicalEntryCompleteInternalV1({
      identityRoot: textInsert.identityRoot,
      orderRoot: textInsert.orderRoot,
      entry: Object.freeze({
        item: Object.freeze({
          ...atomic.item,
          inlineId: first.item.inlineId,
          lineageId: `${atomic.item.lineageId}-text-conflict`,
          fingerprint: `${atomic.item.fingerprint}-text-conflict`,
        }),
        positionKey: textInsert.orderRoot.lastPositionKey + 1,
        renderedUtf16Length: atomic.renderedUtf16Length,
      }),
    })).toEqual({ status: "blocked" })
  })
})
