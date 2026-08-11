import { describe, expect, it } from "vitest"
import * as sourceAuthorityInternals from
  "../src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.js"
import * as sourceStateInternals from
  "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
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
  discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1,
  getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1,
  inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1,
  registerVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1,
  resolveVNextTextBlockRegisteredSourceStyleInternalV1,
  reserveVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1,
  releaseVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessReservationInternalV1,
  registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1 as registerVNextTextBlockUnifiedLayoutSourceRangeReplacementRawInternalV1,
  registerVNextTextBlockSourceRangePathCopyReadViewForTestInternalV1,
  removeVNextTextBlockSourceRangePathCopyReadViewForTestInternalV1,
  setVNextTextBlockSourceRangePathCopyPayloadObserverForTestInternalV1,
  setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1,
  setVNextTextBlockUnifiedLayoutSourcePathCopyCandidateObserverForTestInternalV1,
  type VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import type {
  VNextTextBlockUnifiedLayoutSourceItemV1,
  VNextTextBlockUnifiedLayoutSourceStateV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateContractV1.js"
import {
  abandonVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1,
  applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1,
  beginVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  completeVNextTextBlockUnifiedLayout5B2OperationInternalV1,
  inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1,
  openVNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  prepareVNextTextBlockUnifiedLayout5B2SourceCandidateWorkPublicationInternalV1,
  prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1,
  matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1,
  projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1,
  publishVNextTextBlockUnifiedLayout5B2CandidateWorkInternalV1,
  resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
  setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1,
  type VNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1,
  type VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  type VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1,
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
  registerVNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewForTestInternalV1,
  registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1,
  removeVNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewForTestInternalV1,
  removeVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1,
  setVNextTextBlockUnifiedLayoutSourcePhysicalPayloadObserverForTestInternalV1,
  type VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1,
  type VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourcePhysicalIndexInternalsV1.js"
import {
  getVNextTextBlockUnifiedLayoutSourceStagePreflightRecordInternalV2,
  prepareVNextTextBlockUnifiedLayoutTransitionPreflightInternalV2,
} from "../src/layout/textBlockUnifiedLayoutTransitionPreflightV2.js"
import {
  inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1,
  insertVNextTextBlockUnifiedLayoutSourceStyleCompleteInternalV1,
  pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsInternalV1,
  pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsWithForcedFingerprintCollisionForTestInternalV1,
  registerVNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewForTestInternalV1,
  removeVNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewForTestInternalV1,
  setVNextTextBlockUnifiedLayoutSourceStylePayloadObserverForTestInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceStyleRefcountsInternalsV1.js"
import {
  commitVNextTextBlockUnifiedLayoutSourceStageInternalV1,
  inspectVNextTextBlockUnifiedLayoutPreparedSourceStageCommitForTestInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1,
  resolveVNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1,
  setVNextTextBlockUnifiedLayoutSourceCommitPrepareFaultForTestInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCommitPrepareFaultPointForTestInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceAuthorityInternalsV1.js"
import {
  activateVNextTextBlockUnifiedLayoutSourceSidecarsCompletePhysicalPairsForTestInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyRegistrationInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyWithForcedPositionIntervalForTestInternalV1,
  prepareVNextTextBlockUnifiedLayoutSourceSidecarsWithForcedStyleCollisionForTestInternalV1,
  canRegisterVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1,
  discardVNextTextBlockUnifiedLayoutSourceSidecarCandidateInternalV1,
  applyVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1,
  abandonVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1,
  matchesVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealInternalV1,
  registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1,
  matchesVNextTextBlockUnifiedLayoutSourcePositionKeyExhaustionProofInternalV1,
  resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1,
  setVNextTextBlockUnifiedLayoutSourceSidecarPathCopyCandidateObserverForTestInternalV1,
  type VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceSidecarsInternalsV1.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
} from "../src/layout/textBlockUnifiedLayoutTransitionContractV1.js"
import {
  abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1 as attachCandidateWorkPlanLeafInternalV1,
  attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1 as attachSidecarPlanLeafInternalV1,
  attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1 as attachStagePlanLeafInternalV1,
  beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  consumeVNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1,
  consumeVNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1,
  createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1,
  setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1,
  type VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1,
  type VNextTextBlockUnifiedLayoutSourceCommitMintFaultPointForTestInternalV1,
  type VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1,
} from "../src/layout/textBlockUnifiedLayoutSourceCommitTransactionInternalsV1.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1,
} from "../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
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

const dummyCandidateWorkStepConsumerAuthority = Object.freeze({})
const dummySidecarStepConsumerAuthority = Object.freeze({})
const dummyStageStepConsumerAuthority = Object.freeze({})

function attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
  input: Omit<Parameters<typeof attachCandidateWorkPlanLeafInternalV1>[0], "consumerAuthority">,
): boolean {
  return attachCandidateWorkPlanLeafInternalV1({
    ...input,
    consumerAuthority: dummyCandidateWorkStepConsumerAuthority as never,
  })
}

function attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
  input: Omit<Parameters<typeof attachSidecarPlanLeafInternalV1>[0], "consumerAuthority">,
): boolean {
  return attachSidecarPlanLeafInternalV1({
    ...input,
    consumerAuthority: dummySidecarStepConsumerAuthority as never,
  })
}

function attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
  input: Omit<Parameters<typeof attachStagePlanLeafInternalV1>[0], "consumerAuthority">,
): boolean {
  return attachStagePlanLeafInternalV1({
    ...input,
    consumerAuthority: dummyStageStepConsumerAuthority as never,
  })
}
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

function registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1(
  input: Omit<
    Parameters<
      typeof registerVNextTextBlockUnifiedLayoutSourceRangeReplacementRawInternalV1
    >[0],
    "previousRange" | "nextItems" | "nextItemCount"
  >,
): boolean {
  const previousRange = input.replacement.previousRange
  const nextItems = input.replacement.nextItems
  return registerVNextTextBlockUnifiedLayoutSourceRangeReplacementRawInternalV1({
    ...input,
    previousRange,
    nextItems,
    nextItemCount: nextItems.length,
  })
}

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

function planAFor(
  root: ReturnType<typeof registered5B2RootFixture>,
  limits: typeof sourceLimits = sourceLimits,
) {
  const composition = createVNextTextBlockUnifiedLayout5B2PlanAPolicyForTestInternalV1({
    publicWorkPolicy: FIVE_B2_TEST_POLICY,
    sourceLimits: limits,
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

function hasOpenExactSourcePermit(
  meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1,
  unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1,
): boolean {
  return inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
    meter,
  )?.some((receipt) => receipt.ownerRow.unit === unit
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
    readonly physicalReadViews?: Array<
      Parameters<
        typeof registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1
      >[0]
    >
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
    if (input.prefix === "source-index-") {
      const registration = {
        entry: entry as Parameters<
          typeof registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1
        >[0]["entry"],
        readView: proxy as Parameters<
          typeof registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1
        >[0]["readView"],
      }
      if (!registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1(
        registration,
      )) throw new Error("physical entry hostile read-view registration blocked")
      input.cache?.physicalReadViews?.push(registration)
      entryCache.set(entry, entry)
      return entry
    }
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

function guardPhysicalEntryPayloadReads<T extends
  | VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1
  | VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1
>(input: {
  readonly root: T
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly unownedReads: string[]
  readonly cache?: {
    readonly nodes: WeakMap<object, object>
    readonly entries: WeakMap<object, object>
    readonly physicalReadViews: Array<
      Parameters<
        typeof registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1
      >[0]
    >
  }
}): T {
  const nodeCache = input.cache?.nodes ?? new WeakMap<object, object>()
  const entryCache = input.cache?.entries ?? new WeakMap<object, object>()
  const hasEntryPermit = () =>
    inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
      input.meter,
    )?.some((receipt) => receipt.ownerRow.unit === "source-index-entries"
      && receipt.attemptedWork === receipt.completedWork + 1) === true
  const note = (property: PropertyKey): void => {
    if (!hasEntryPermit()) input.unownedReads.push(String(property))
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
        ) note(property)
        return Reflect.get(target, property, receiver)
      },
    })
    const registration = {
      entry: entry as Parameters<
        typeof registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1
      >[0]["entry"],
      readView: proxy as Parameters<
        typeof registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1
      >[0]["readView"],
    }
    if (!registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1(
      registration,
    )) throw new Error("physical entry payload read-view registration blocked")
    input.cache?.physicalReadViews.push(registration)
    entryCache.set(entry, entry)
    return entry
  }
  const wrapEntries = (entries: readonly object[]): readonly object[] => {
    const wrapped = Object.freeze(entries.map((entry) => wrapEntry(entry)))
    return new Proxy(wrapped, {
      get(target, property, receiver) {
        if (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property)) {
          note(`slot:${property}`)
        }
        return Reflect.get(target, property, receiver)
      },
    })
  }
  const wrapNode = (node: object): object => {
    const cached = nodeCache.get(node)
    if (cached != null) return cached
    const raw = { ...node } as Record<PropertyKey, unknown>
    if (Array.isArray(raw.entries)) raw.entries = wrapEntries(raw.entries)
    if (Array.isArray(raw.children)) {
      raw.children = Object.freeze(raw.children.map((child) => wrapNode(child)))
    }
    const proxy = new Proxy(raw, {})
    nodeCache.set(node, proxy)
    return proxy
  }
  return wrapNode(input.root) as T
}

function guardPhysicalEntryArrayReads<T extends
  | VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1
  | VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1
>(input: {
  readonly root: T
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly unownedReads: string[]
  readonly observedReads?: string[]
}): T {
  const nodeCache = new WeakMap<object, object>()
  const note = (label: string): void => {
    input.observedReads?.push(label)
    if (!hasOpenExactSourcePermit(input.meter, "source-index-entries")) {
      input.unownedReads.push(label)
    }
  }
  const wrapEntries = (entries: readonly object[]): readonly object[] =>
    new Proxy(Object.freeze([...entries]), {
      get(target, property, receiver) {
        if (
          property === "length"
          || property === Symbol.iterator
          || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
        ) note(`entries.${String(property)}`)
        return Reflect.get(target, property, receiver)
      },
    })
  const wrapNode = (node: object): object => {
    const cached = nodeCache.get(node)
    if (cached != null) return cached
    const raw = { ...node } as Record<PropertyKey, unknown>
    if (Array.isArray(raw.entries)) raw.entries = wrapEntries(raw.entries)
    if (Array.isArray(raw.children)) {
      raw.children = Object.freeze(raw.children.map((child) => wrapNode(child)))
    }
    const proxy = new Proxy(raw, {
      get(target, property, receiver) {
        if (property === "entries") note("node.entries")
        return Reflect.get(target, property, receiver)
      },
    })
    nodeCache.set(node, proxy)
    return proxy
  }
  return wrapNode(input.root) as T
}

function guardStyleBucketPayloadReads(input: {
  readonly root: VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly unownedReads: string[]
  readonly observedReads?: string[]
}): VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1 {
  const hasPermit = (
    unit: "source-style-nodes" | "source-style-buckets" | "source-style-entries",
  ) =>
    inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
      input.meter,
    )?.some((receipt) => receipt.ownerRow.unit === unit
      && receipt.attemptedWork === receipt.completedWork + 1) === true
  const note = (
    unit: "source-style-nodes" | "source-style-buckets" | "source-style-entries",
    property: PropertyKey,
  ): void => {
    input.observedReads?.push(`${unit}:${String(property)}`)
    if (!hasPermit(unit)) input.unownedReads.push(`${unit}:${String(property)}`)
  }
  const bucketItemCache = new WeakMap<object, object>()
  const entryCache = new WeakMap<object, object>()
  const nodeCache = new WeakMap<object, object>()
  const wrapBucketItem = (item: object): object => {
    const cached = bucketItemCache.get(item)
    if (cached != null) return cached
    const proxy = new Proxy({ ...item }, {
      get(target, property, receiver) {
        if (
          property === "style"
          || property === "canonicalFacts"
          || property === "refcount"
        ) note("source-style-entries", property)
        return Reflect.get(target, property, receiver)
      },
    })
    bucketItemCache.set(item, proxy)
    return proxy
  }
  const wrapBucket = (bucket: readonly object[]): readonly object[] => {
    const wrapped = Object.freeze(bucket.map((item) => wrapBucketItem(item)))
    return new Proxy(wrapped, {
      get(target, property, receiver) {
        if (property === "length" || property === Symbol.iterator) {
          note("source-style-buckets", `bucket:${String(property)}`)
        } else if (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property)) {
          note("source-style-entries", `bucket-slot:${property}`)
        }
        return Reflect.get(target, property, receiver)
      },
    })
  }
  const wrapEntry = (entry: object): object => {
    const cached = entryCache.get(entry)
    if (cached != null) return cached
    const raw = { ...entry } as Record<PropertyKey, unknown>
    if (Array.isArray(raw.bucket)) raw.bucket = wrapBucket(raw.bucket)
    const proxy = new Proxy(raw, {
      get(target, property, receiver) {
        if (property === "bucket") note("source-style-buckets", property)
        else if (
          property === "measurementStyleKey"
          || property === "effectiveShapingStyleKey"
          || property === "styleFingerprint"
          || property === "totalRefcount"
        ) note("source-style-entries", property)
        return Reflect.get(target, property, receiver)
      },
    })
    entryCache.set(entry, proxy)
    return proxy
  }
  const wrapEntries = (entries: readonly object[]): readonly object[] => {
    const wrapped = Object.freeze(entries.map((entry) => wrapEntry(entry)))
    return new Proxy(wrapped, {
      get(target, property, receiver) {
        if (
          property === "length"
          || property === Symbol.iterator
          || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
        ) {
          note("source-style-entries", `entry-slot:${String(property)}`)
        }
        return Reflect.get(target, property, receiver)
      },
    })
  }
  const wrapNode = (node: object): object => {
    const cached = nodeCache.get(node)
    if (cached != null) return cached
    const raw = { ...node } as Record<PropertyKey, unknown>
    if (Array.isArray(raw.entries)) raw.entries = wrapEntries(raw.entries)
    if (Array.isArray(raw.children)) {
      const children = Object.freeze(raw.children.map((child) => wrapNode(child)))
      raw.children = new Proxy(children, {
        get(target, property, receiver) {
          if (
            property === "length"
            || property === Symbol.iterator
            || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
          ) note("source-style-nodes", `children:${String(property)}`)
          return Reflect.get(target, property, receiver)
        },
      })
    }
    const proxy = new Proxy(raw, {
      get(target, property, receiver) {
        if (property === "nodeKind" || property === "children") {
          note("source-style-nodes", String(property))
        } else if (
          property === "entries"
          || property === "lastKey"
          || property === "totalRefcount"
        ) note("source-style-entries", property)
        return Reflect.get(target, property, receiver)
      },
    })
    nodeCache.set(node, proxy)
    return proxy
  }
  return wrapNode(input.root) as VNextTextBlockUnifiedLayoutSourceStyleRefcountNodeInternalV1
}

function guardStyleInputItemReads(input: {
  readonly items: readonly VNextTextBlockUnifiedLayoutSourceItemV1[]
  readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
  readonly unownedReads: string[]
}): readonly VNextTextBlockUnifiedLayoutSourceItemV1[] {
  const note = (label: string): void => {
    const hasPermit = inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
      input.meter,
    )?.some((receipt) => receipt.ownerRow.unit === "source-style-entries"
      && receipt.attemptedWork === receipt.completedWork + 1) === true
    if (!hasPermit) input.unownedReads.push(label)
  }
  const items = Object.freeze(input.items.map((item, index) => new Proxy(item, {
    get(target, property, receiver) {
      if (property === "kind" || property === "style") {
        note(`source-style-entries:item-${index}:${String(property)}`)
      }
      return Reflect.get(target, property, receiver)
    },
  })))
  return new Proxy(items, {
    get(target, property, receiver) {
      if (
        property === "length"
        || property === Symbol.iterator
        || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
      ) note(`source-style-entries:input:${String(property)}`)
      return Reflect.get(target, property, receiver)
    },
  })
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

function mixedPlanAFoundation(
  lineCount = 8,
  limits: typeof sourceLimits = sourceLimits,
) {
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
  const composition = planAFor(root, limits)
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

function prepareMixedPrefixCandidate(
  lineCount = 8,
  limits: typeof sourceLimits = sourceLimits,
) {
  const foundation = mixedPlanAFoundation(lineCount, limits)
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

function prepareMixedBoundaryInsertionCandidate(
  lineCount: number,
  boundaryOrdinal: number,
) {
  const foundation = mixedPlanAFoundation(lineCount)
  const previousEntries = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
    foundation.sidecars.orderRoot,
  ).entries
  const styleOwner = previousEntries[Math.min(
    boundaryOrdinal,
    previousEntries.length - 1,
  )]?.item
  if (styleOwner?.kind !== "text") {
    throw new Error("boundary insertion style owner missing")
  }
  const inserted = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
    sourceState: foundation.root.sourceState,
    kind: "text",
    renderedText: "I",
    lineageId: `boundary-lineage-${lineCount}-${boundaryOrdinal}`,
    inlineId: `boundary-inline-${lineCount}-${boundaryOrdinal}`,
    sourceFingerprint: `boundary-source-${lineCount}-${boundaryOrdinal}`,
    provenanceFingerprint: `boundary-provenance-${lineCount}-${boundaryOrdinal}`,
    style: styleOwner.style,
  })
  if (inserted == null) throw new Error("boundary insertion item blocked")
  const boundary = previousEntries.slice(0, boundaryOrdinal).reduce(
    (sum, entry) => sum + entry.renderedUtf16Length,
    0,
  )
  const previousRange = Object.freeze({
    startRenderedUtf16: boundary,
    endRenderedUtf16: boundary,
  })
  const emptyFingerprint = createVNextCompactFingerprint(
    stringifyVNextCanonicalJson([]),
  )
  const replacement = Object.freeze({
    previousRange,
    nextItems: Object.freeze([inserted]),
    expectedPreviousContentFingerprint: emptyFingerprint,
    expectedPreviousSourceFingerprint: emptyFingerprint,
    expectedPreviousProvenanceFingerprint: emptyFingerprint,
    fingerprint: `boundary-replacement-${lineCount}-${boundaryOrdinal}`,
  })
  if (!registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
    previousSourceState: foundation.root.sourceState,
    replacement,
    change: foundation.change,
  })) throw new Error("boundary insertion replacement registration blocked")
  const prepared = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
    previousSourceState: foundation.root.sourceState,
    replacement,
    beforeVisit: () => true,
  })
  if (prepared.status !== "prepared") {
    throw new Error(`boundary Source candidate was ${prepared.status}`)
  }
  const record = getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
    prepared.pathCopyCandidateAuthority,
  )
  if (record == null) throw new Error("boundary Source candidate record missing")
  return {
    ...foundation,
    previousEntries,
    inserted,
    boundary,
    replacement,
    prepared,
    record,
  }
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

function commitSourceCheckpoint(input: {
  readonly fixture: ReturnType<typeof admitted5B2PlanARootFixture>
  readonly previousSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
  readonly previousSidecars: NonNullable<
    ReturnType<typeof resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1>
  >
  readonly checkpointOrdinal: number
  readonly deletePrevious?: boolean
  readonly nextItemCount?: number
  readonly probeTicketAtomicity?: boolean
  readonly probeSourceAbortAlias?: "removedItems" | "nextPhysicalItems"
  readonly inspectDetachedSidecarPlan?: (prepared: Readonly<{
    readonly candidateWorkPublicationPreconditionAuthority: NonNullable<
      ReturnType<
        typeof prepareVNextTextBlockUnifiedLayout5B2SourceCandidateWorkPublicationInternalV1
      >
    >
    readonly registrationPreconditionAuthority: NonNullable<
      ReturnType<
        typeof prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyRegistrationInternalV1
      >
    >
    readonly candidateWorkMeter:
      VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
    readonly nextCandidateWork: VNextTextBlockIncrementalCandidateWorkV1
    readonly nextSidecarCandidateAuthority:
      VNextTextBlockUnifiedLayoutSourceSidecarCandidateAuthorityInternalV1
    readonly sourcePathCopyCandidateAuthority:
      VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1
    readonly nextSourceState: VNextTextBlockUnifiedLayoutSourceStateV1
    readonly nextSidecars: NonNullable<
      ReturnType<typeof resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1>
    >
  }>) => never
  readonly inspectPreparedCommitInput?: (
    prepared: Parameters<
      typeof prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1
    >[0],
  ) => never
  readonly commitPrepared?: (
    ticket: NonNullable<
      ReturnType<typeof prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1>
    >,
  ) => ReturnType<typeof commitVNextTextBlockUnifiedLayoutSourceStageInternalV1>
}) {
  const opened = openMeterForPlanAFixture({
    root: input.fixture.root,
    composition: input.fixture.composition,
    sidecars: input.previousSidecars,
  }, `Source-checkpoint-${input.checkpointOrdinal}`)
  const previous = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
    input.previousSidecars.orderRoot,
  ).entries[0]?.item
  if (previous?.kind !== "text") throw new Error("checkpoint text missing")
  const nextItems: VNextTextBlockUnifiedLayoutSourceItemV1[] = []
  const nextItemCount = input.deletePrevious === true
    ? 0
    : input.nextItemCount ?? 1
  for (let index = 0; index < nextItemCount; index += 1) {
    const next = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
      sourceState: input.previousSourceState,
      kind: "text",
      renderedText: previous.renderedText,
      lineageId: `checkpoint-lineage-${input.checkpointOrdinal}-${index}`,
      inlineId: `checkpoint-inline-${input.checkpointOrdinal}-${index}`,
      sourceFingerprint: `checkpoint-source-${input.checkpointOrdinal}-${index}`,
      provenanceFingerprint:
        `checkpoint-provenance-${input.checkpointOrdinal}-${index}`,
      style: previous.style,
    })
    if (next == null) throw new Error("checkpoint item blocked")
    nextItems.push(next)
  }
  const previousRange = Object.freeze({
    startRenderedUtf16: 0,
    endRenderedUtf16: previous.renderedUtf16Length,
  })
  const replacement = Object.freeze({
    previousRange,
    nextItems: Object.freeze(nextItems),
    expectedPreviousContentFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson([previous.renderedText]),
    ),
    expectedPreviousSourceFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson([previous.sourceFingerprint]),
    ),
    expectedPreviousProvenanceFingerprint: createVNextCompactFingerprint(
      stringifyVNextCanonicalJson([previous.provenanceFingerprint]),
    ),
    fingerprint: `Source-checkpoint-replacement-${input.checkpointOrdinal}`,
  })
  if (!registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
    previousSourceState: input.previousSourceState,
    replacement,
    change: opened.change,
  })) throw new Error("checkpoint replacement registration blocked")

  let pendingPermit: VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1 | null = null
  const sourceCandidate =
    prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
      previousSourceState: input.previousSourceState,
      replacement,
      beforeVisit(unit) {
        if (pendingPermit != null) {
          if (!completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
            pendingPermit,
          )) throw new Error("checkpoint permit completion blocked")
          pendingPermit = null
        }
        const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
          meter: opened.meter,
          unit: unit === "source-items"
            ? "source-items"
            : unit === "source-lookup-nodes"
              ? "source-tree-lookup-nodes"
              : unit === "source-path-copy-nodes"
                ? "source-tree-path-copy-nodes"
                : "source-leaf-slots",
        })
        if (begun.status !== "permitted") {
          throw new Error(`checkpoint Source work was ${begun.status}`)
        }
        pendingPermit = begun.permit
        return true
      },
    })
  if (sourceCandidate.status !== "prepared") {
    throw new Error(`checkpoint Source candidate was ${sourceCandidate.status}`)
  }
  if (
    pendingPermit != null
    && !completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(pendingPermit)
  ) throw new Error("checkpoint final permit completion blocked")
  const sourceRecord =
    getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      sourceCandidate.pathCopyCandidateAuthority,
    )
  if (sourceRecord == null) throw new Error("checkpoint Source record missing")
  const sidecarCandidate =
    prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
      previousSourceState: input.previousSourceState,
      nextSourceState: sourceCandidate.sourceState,
      replacement,
      removedItems: sourceRecord.removedItems,
      nextPhysicalItems: sourceRecord.nextPhysicalItems,
      previousSidecars: input.previousSidecars,
      workMeter: opened.meter,
    })
  if (sidecarCandidate.status !== "prepared") {
    throw new Error(`checkpoint sidecars were ${sidecarCandidate.status}`)
  }
  const nextCandidateWork =
    projectVNextTextBlockUnifiedLayout5B2CompatibilityWorkInternalV1(
      opened.meter,
    )
  if (nextCandidateWork == null) throw new Error("checkpoint work missing")
  const sourceEmissionCount = sourceRecord.nextPhysicalItems.length
  const publicationPrecondition =
    prepareVNextTextBlockUnifiedLayout5B2SourceCandidateWorkPublicationInternalV1({
      meter: opened.meter,
      nextCandidateWork,
      completedSourceEmissionCount: sourceEmissionCount,
      producingStageAuthority: opened.preflight,
    })
  if (
    publicationPrecondition == null
    || !canRegisterVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
      previousRoot: input.fixture.root,
      composition: input.fixture.composition,
      previousSidecars: input.previousSidecars,
      nextSourceState: sourceCandidate.sourceState,
      nextSidecars: sidecarCandidate.sidecars,
      candidateAuthority: sidecarCandidate.candidateAuthority,
      workMeter: opened.meter,
    })
  ) throw new Error("checkpoint commit precondition blocked")
  const sidecarRegistrationPrecondition =
    prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyRegistrationInternalV1({
      previousRoot: input.fixture.root,
      composition: input.fixture.composition,
      previousSidecars: input.previousSidecars,
      nextSourceState: sourceCandidate.sourceState,
      nextSidecars: sidecarCandidate.sidecars,
      candidateAuthority: sidecarCandidate.candidateAuthority,
      sourcePathCopyCandidateAuthority:
        sourceCandidate.pathCopyCandidateAuthority,
      workMeter: opened.meter,
    })
  if (sidecarRegistrationPrecondition == null) {
    throw new Error("checkpoint sidecar precondition blocked")
  }
  input.inspectDetachedSidecarPlan?.(Object.freeze({
    candidateWorkPublicationPreconditionAuthority: publicationPrecondition,
    registrationPreconditionAuthority: sidecarRegistrationPrecondition,
    candidateWorkMeter: opened.meter,
    nextCandidateWork,
    nextSidecarCandidateAuthority: sidecarCandidate.candidateAuthority,
    sourcePathCopyCandidateAuthority:
      sourceCandidate.pathCopyCandidateAuthority,
    nextSourceState: sourceCandidate.sourceState,
    nextSidecars: sidecarCandidate.sidecars,
  }))
  const preflightRecord =
    getVNextTextBlockUnifiedLayoutSourceStagePreflightRecordInternalV2({
      preflight: opened.preflight,
      previousRoot: input.fixture.root,
    })
  if (preflightRecord == null) throw new Error("checkpoint preflight record missing")
  const ticketInput: Parameters<
    typeof prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1
  >[0] = {
    previousRoot: input.fixture.root,
    previousSourceState: input.previousSourceState,
    preflight: opened.preflight,
    evidence: null,
    composition: input.fixture.composition,
    packingPolicy: VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1,
    previousSidecars: input.previousSidecars,
    nextSourceState: sourceCandidate.sourceState,
    nextSidecars: sidecarCandidate.sidecars,
    candidateWorkMeter: opened.meter,
    nextCandidateWork,
    nextSidecarCandidateAuthority: sidecarCandidate.candidateAuthority,
    sourcePathCopyCandidateAuthority:
      sourceCandidate.pathCopyCandidateAuthority,
    producingStageAuthority: opened.preflight,
    completedSourceEmissionCount: sourceEmissionCount,
    candidateWorkPublicationPreconditionAuthority: publicationPrecondition,
    sidecarRegistrationPreconditionAuthority: sidecarRegistrationPrecondition,
    validatedChange: preflightRecord.validatedChange,
    sourceMaterial: preflightRecord.sourceMaterial,
    boundedNextSourceItems: sourceRecord.nextLeafItems,
    boundedNextSourceStartRenderedUtf16:
      sourceRecord.nextLeafStartRenderedUtf16,
    existingLineageIds: sourceCandidate.existingLineageIds,
    insertedLineageIds: sourceCandidate.insertedLineageIds,
  }
  input.inspectPreparedCommitInput?.(ticketInput)
  const clonedTupleTicket = input.probeTicketAtomicity === true
    ? prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1({
        ...ticketInput,
        nextSidecars: Object.freeze({
          ...structuredClone(sidecarCandidate.sidecars),
          sourceState: sourceCandidate.sourceState,
        }),
      })
    : null
  const ticket = prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(
    ticketInput,
  )
  if (ticket == null) throw new Error("checkpoint commit ticket blocked")
  const plannedSourceStage =
    inspectVNextTextBlockUnifiedLayoutPreparedSourceStageCommitForTestInternalV1(
      ticket,
    )
  if (plannedSourceStage == null) throw new Error("checkpoint planned stage missing")
  const duplicateTicket = input.probeTicketAtomicity === true
    ? prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(ticketInput)
    : null
  const postTicketSidecarAbortRejected = input.probeTicketAtomicity === true
    ? !discardVNextTextBlockUnifiedLayoutSourceSidecarCandidateInternalV1(
        sidecarCandidate.candidateAuthority,
      )
    : true
  const postTicketSourceAbortRejected = input.probeTicketAtomicity === true
    ? !discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
        sourceCandidate.pathCopyCandidateAuthority,
      )
    : true
  const postTicketSourceAliasAbortRejected = input.probeSourceAbortAlias == null
    ? true
    : !discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
        sourceRecord[input.probeSourceAbortAlias],
      )
  const postTicketAccessTheftRejected = input.probeTicketAtomicity === true
    ? !registerVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1({
        sourceState: sourceCandidate.sourceState,
        resolveStyle: () => { throw new Error("reserved access invoked") },
        visitItemByInlineId: () => Object.freeze({
          status: "not-found" as const,
          item: null,
          absoluteStartRenderedUtf16: null,
          absoluteEndRenderedUtf16: null,
          visitedNodeCount: 0,
          completeTreeTraversalCount: 0 as const,
        }),
        checkInlineIdConflict: () => Object.freeze({
          status: "checked" as const,
          conflict: false,
        }),
      })
    : true
  const competingComplete = input.probeTicketAtomicity === true
    ? prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
        sourceState: sourceCandidate.sourceState,
      })
    : null
  const postTicketPairOverwriteRejected = competingComplete?.status === "prepared"
    ? !activateVNextTextBlockUnifiedLayoutSourceSidecarsCompletePhysicalPairsForTestInternalV1({
        sourceState: sourceCandidate.sourceState,
        sidecars: competingComplete.sidecars,
        candidateAuthority: competingComplete.candidateAuthority,
      })
    : input.probeTicketAtomicity !== true
  const postTicketAccessReleaseRejected = input.probeTicketAtomicity === true
    ? !releaseVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessReservationInternalV1({
        sourceState: sourceCandidate.sourceState,
        reservationAuthority: sidecarRegistrationPrecondition,
      })
    : true
  const committed = input.commitPrepared == null
    ? commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(ticket)
    : input.commitPrepared(ticket)
  expect(committed).toBe(plannedSourceStage)
  const postCommitSourceAbortRejected =
    !discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
      sourceCandidate.pathCopyCandidateAuthority,
    )
  const postCommitRemovedAliasAbortRejected =
    !discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
      sourceRecord.removedItems,
    )
  const postCommitNextAliasAbortRejected =
    !discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
      sourceRecord.nextPhysicalItems,
    )
  return Object.freeze({
    previousSourceState: input.previousSourceState,
    previousSidecars: input.previousSidecars,
    nextSourceState: sourceCandidate.sourceState,
    nextSidecars: sidecarCandidate.sidecars,
    completedCandidateWork: nextCandidateWork,
    sourceStageAuthority: committed.sourceStageAuthority,
    clonedTupleTicketMinted: clonedTupleTicket != null,
    duplicateTicketMinted: duplicateTicket != null,
    postTicketSidecarAbortRejected,
    postTicketSourceAbortRejected,
    postTicketSourceAliasAbortRejected,
    postTicketAccessTheftRejected,
    postTicketAccessReleaseRejected,
    postTicketPairOverwriteRejected,
    postCommitSourceAbortRejected,
    postCommitRemovedAliasAbortRejected,
    postCommitNextAliasAbortRejected,
    sourceCandidateHandleRetired:
      getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
        sourceCandidate.pathCopyCandidateAuthority,
      ) == null,
  })
}

const REAL_SOURCE_COMMIT_MINT_FAULT_POINTS = Object.freeze([
  "after-detached-minting-state",
  "after-candidate-work-precondition-index",
  "after-sidecar-precondition-index",
  "after-candidate-work-meter-index",
  "after-sidecar-candidate-index",
  "after-source-candidate-index",
  "after-access-reservation-index",
  "before-live-write",
] as const satisfies readonly VNextTextBlockUnifiedLayoutSourceCommitMintFaultPointForTestInternalV1[])

const REAL_SOURCE_COMMIT_PREPARE_FAULT_POINTS = Object.freeze([
  "after-candidate-work-owner-prepare",
  "after-sidecar-owner-prepare",
  "after-source-owner-prepare",
  "after-stage-owner-prepare",
] as const satisfies readonly VNextTextBlockUnifiedLayoutSourceCommitPrepareFaultPointForTestInternalV1[])

describe("Phase 5B-2 complete process-local Source sidecars", () => {
  it("publishes Source access only from the Source candidate plan", () => {
    const fixture = admitted5B2PlanARootFixture({ text: "ABCD" })
    commitSourceCheckpoint({
      fixture,
      previousSourceState: fixture.root.sourceState,
      previousSidecars: fixture.sidecars,
      checkpointOrdinal: 95,
      commitPrepared(ticket) {
        const planned =
          inspectVNextTextBlockUnifiedLayoutPreparedSourceStageCommitForTestInternalV1(
            ticket,
          )
        if (planned == null) throw new Error("Source ownership stage missing")
        const candidateWorkStep =
          beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(ticket)
        const sidecarStep =
          applyVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1(
            candidateWorkStep,
          )
        const sourceStep =
          applyVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
            sidecarStep,
          )
        const committedSidecars =
          resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1({
          sourceState: planned.nextSourceState,
          composition: fixture.composition,
        })
        expect(committedSidecars).not.toBeNull()
        if (committedSidecars == null) {
          throw new Error("Source ownership sidecars missing")
        }
        const first = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
          committedSidecars.orderRoot,
        ).entries[0]?.item
        if (first == null) throw new Error("Source ownership item missing")
        if (first.kind !== "text") {
          throw new Error("Source ownership style-bearing item missing")
        }
        expect(resolveVNextTextBlockRegisteredSourceStyleInternalV1({
          sourceState: planned.nextSourceState,
          measurementStyleKey: first.style.measurementStyleKey,
          effectiveShapingStyleKey: first.style.effectiveShapingStyleKey,
        }).status).toBe("unavailable")
        const stageStep = sourceStateInternals
          .applyVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1(
            sourceStep,
          )
        expect(resolveVNextTextBlockRegisteredSourceStyleInternalV1({
          sourceState: planned.nextSourceState,
          measurementStyleKey: first.style.measurementStyleKey,
          effectiveShapingStyleKey: first.style.effectiveShapingStyleKey,
        }).status).toBe("resolved")
        const finishStep = sourceAuthorityInternals
          .applyVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1(
            stageStep,
          )
        finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(finishStep)
        return planned
      },
    })
  })

  it("publishes exact bounded physical pair sets for zero one and maximum fixture count", () => {
    const inspectCount = (input: Readonly<{
      fixture: ReturnType<typeof admitted5B2PlanARootFixture>
      ordinal: number
      expectedCount: number
      deletePrevious?: boolean
      nextItemCount?: number
    }>): void => {
      const completed = new Error(`pair publication ${input.expectedCount} complete`)
      expect(() => commitSourceCheckpoint({
        fixture: input.fixture,
        previousSourceState: input.fixture.root.sourceState,
        previousSidecars: input.fixture.sidecars,
        checkpointOrdinal: input.ordinal,
        deletePrevious: input.deletePrevious,
        nextItemCount: input.nextItemCount,
        inspectDetachedSidecarPlan(prepared): never {
          const detachedTicket =
            createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
          const plan =
            prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
              detachedTicket,
              registrationPreconditionAuthority:
                prepared.registrationPreconditionAuthority,
              previousSidecars: input.fixture.sidecars,
              nextSidecars: prepared.nextSidecars,
              candidateWorkMeter: prepared.candidateWorkMeter,
              nextSidecarCandidateAuthority:
                prepared.nextSidecarCandidateAuthority,
              sourcePathCopyCandidateAuthority:
                prepared.sourcePathCopyCandidateAuthority,
            })
          if (plan == null) throw new Error("pair publication plan missing")
          const publicationSet = plan.plannedOutput.pairPublicationSet
          expect(publicationSet.count).toBe(input.expectedCount)
          expect(Number.isSafeInteger(publicationSet.count)).toBe(true)
          expect(Object.isFrozen(publicationSet)).toBe(true)
          expect(Object.isFrozen(publicationSet.records)).toBe(true)
          expect(Object.getPrototypeOf(publicationSet.records))
            .toBe(Array.prototype)
          expect(Object.getOwnPropertyDescriptor(
            publicationSet.records,
            "length",
          )?.get).toBeUndefined()
          for (let index = 0; index < publicationSet.count; index += 1) {
            const descriptor = Object.getOwnPropertyDescriptor(
              publicationSet.records,
              String(index),
            )
            expect(descriptor?.get).toBeUndefined()
            expect(Object.isFrozen(publicationSet.records[index])).toBe(true)
          }
          const abort =
            abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
              detachedTicket,
            )
          if (abort?.sidecar == null) {
            throw new Error("pair publication abandonment missing")
          }
          abandonVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
            planAuthority: plan.planAuthority,
            abandonmentAuthority: abort.sidecar.abandonmentAuthority,
          })
          throw completed
        },
      })).toThrow(completed)
    }

    inspectCount({
      fixture: mixedPlanAFoundation(8) as unknown as
        ReturnType<typeof admitted5B2PlanARootFixture>,
      ordinal: 92,
      expectedCount: 0,
      deletePrevious: true,
    })
    inspectCount({
      fixture: admitted5B2PlanARootFixture({ text: "ABCD" }),
      ordinal: 93,
      expectedCount: 1,
    })
    inspectCount({
      fixture: admitted5B2PlanARootFixture({ text: "ABCD" }),
      ordinal: 94,
      expectedCount: 8,
      nextItemCount: 8,
    })
  })

  it("binds an owner-issued sidecar plan seal to one detached ticket and planned output", () => {
    const completed = new Error("sidecar owner-seal fixture complete")
    const fixture = admitted5B2PlanARootFixture({ text: "ABCD" })
    expect(() => commitSourceCheckpoint({
      fixture,
      previousSourceState: fixture.root.sourceState,
      previousSidecars: fixture.sidecars,
      checkpointOrdinal: 100,
      inspectDetachedSidecarPlan(prepared): never {
        const detachedTicket =
          createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
        const plan =
          prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
            detachedTicket,
            registrationPreconditionAuthority:
              prepared.registrationPreconditionAuthority,
            previousSidecars: fixture.sidecars,
            nextSidecars: prepared.nextSidecars,
            candidateWorkMeter: prepared.candidateWorkMeter,
            nextSidecarCandidateAuthority:
              prepared.nextSidecarCandidateAuthority,
            sourcePathCopyCandidateAuthority:
              prepared.sourcePathCopyCandidateAuthority,
          })
        expect(plan).not.toBeNull()
        if (plan == null) throw new Error("sidecar owner-seal plan missing")
        const exactMatch = {
          detachedTicket,
          planAuthority: plan.planAuthority,
          sealAuthority: plan.sealAuthority,
          plannedOutput: plan.plannedOutput,
        }
        expect(
          matchesVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealInternalV1(
            exactMatch,
          ),
        ).toBe(true)
        expect(
          matchesVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealInternalV1({
            ...exactMatch,
            sealAuthority: structuredClone(plan.sealAuthority),
          }),
        ).toBe(false)
        expect(
          matchesVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealInternalV1({
            ...exactMatch,
            detachedTicket:
              createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(),
          }),
        ).toBe(false)

        const abort =
          abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
            detachedTicket,
          )
        expect(abort?.sidecar).not.toBeNull()
        if (abort?.sidecar == null) {
          throw new Error("sidecar abandonment slot missing")
        }
        const sidecarAbort = abort.sidecar
        expect(() =>
          abandonVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
            planAuthority: plan.planAuthority,
            abandonmentAuthority: structuredClone(
              sidecarAbort.abandonmentAuthority,
            ),
          }),
        ).toThrow(/abandonment invariant/i)
        abandonVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
          planAuthority: plan.planAuthority,
          abandonmentAuthority: sidecarAbort.abandonmentAuthority,
        })
        expect(
          matchesVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealInternalV1(
            exactMatch,
          ),
        ).toBe(false)
        throw completed
      },
    })).toThrow(completed)
  })

  it("binds an owner-issued Source plan seal to one detached ticket and planned output", () => {
    const completed = new Error("Source owner-seal fixture complete")
    const fixture = admitted5B2PlanARootFixture({ text: "ABCD" })
    expect(() => commitSourceCheckpoint({
      fixture,
      previousSourceState: fixture.root.sourceState,
      previousSidecars: fixture.sidecars,
      checkpointOrdinal: 99,
      inspectDetachedSidecarPlan(prepared): never {
        const detachedTicket =
          createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
        const sidecarPlan =
          prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
            detachedTicket,
            registrationPreconditionAuthority:
              prepared.registrationPreconditionAuthority,
            previousSidecars: fixture.sidecars,
            nextSidecars: prepared.nextSidecars,
            candidateWorkMeter: prepared.candidateWorkMeter,
            nextSidecarCandidateAuthority:
              prepared.nextSidecarCandidateAuthority,
            sourcePathCopyCandidateAuthority:
              prepared.sourcePathCopyCandidateAuthority,
          })
        expect(sidecarPlan).not.toBeNull()
        if (sidecarPlan == null) throw new Error("Source owner sidecar plan missing")
        const sourcePlan = sourceStateInternals
          .prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
            detachedTicket,
            sourcePathCopyCandidateAuthority:
              prepared.sourcePathCopyCandidateAuthority,
            accessReservationAuthority:
              prepared.registrationPreconditionAuthority,
            nextSourceState: prepared.nextSourceState,
          })
        expect(sourcePlan).not.toBeNull()
        if (sourcePlan == null) throw new Error("Source owner-seal plan missing")
        const exactMatch = {
          detachedTicket,
          planAuthority: sourcePlan.planAuthority,
          sealAuthority: sourcePlan.sealAuthority,
          plannedOutput: prepared.nextSourceState,
        }
        expect(sourceStateInternals
          .matchesVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealInternalV1(
            exactMatch,
          )).toBe(true)
        expect(sourceStateInternals
          .matchesVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealInternalV1({
            ...exactMatch,
            sealAuthority: structuredClone(sourcePlan.sealAuthority),
          })).toBe(false)
        expect(sourceStateInternals
          .matchesVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealInternalV1({
            ...exactMatch,
            detachedTicket:
              createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(),
          })).toBe(false)

        const abort =
          abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
            detachedTicket,
          )
        expect(abort?.source).not.toBeNull()
        if (abort?.source == null || abort.sidecar == null) {
          throw new Error("Source owner abandonment slots missing")
        }
        const sourceAbort = abort.source
        const sidecarAbort = abort.sidecar
        expect(() => sourceStateInternals
          .abandonVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
            planAuthority: sourcePlan.planAuthority,
            abandonmentAuthority: structuredClone(
              sourceAbort.abandonmentAuthority,
            ),
          })).toThrow(/abandonment invariant/i)
        sourceStateInternals
          .abandonVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
            planAuthority: sourcePlan.planAuthority,
            abandonmentAuthority: sourceAbort.abandonmentAuthority,
          })
        abandonVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
          planAuthority: sidecarPlan.planAuthority,
          abandonmentAuthority: sidecarAbort.abandonmentAuthority,
        })
        expect(sourceStateInternals
          .matchesVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealInternalV1(
            exactMatch,
          )).toBe(false)
        throw completed
      },
    })).toThrow(completed)
  })

  it("binds an owner-issued Stage plan seal to one detached ticket and planned output", () => {
    const completed = new Error("Stage owner-seal fixture complete")
    const fixture = admitted5B2PlanARootFixture({ text: "ABCD" })
    expect(() => commitSourceCheckpoint({
      fixture,
      previousSourceState: fixture.root.sourceState,
      previousSidecars: fixture.sidecars,
      checkpointOrdinal: 98,
      inspectPreparedCommitInput(input): never {
        const detachedTicket =
          createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
        const candidateWorkPlan =
          prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
            detachedTicket,
            publicationPreconditionAuthority:
              input.candidateWorkPublicationPreconditionAuthority,
            candidateWorkMeter: input.candidateWorkMeter,
            nextCandidateWork: input.nextCandidateWork,
            completedSourceEmissionCount: input.completedSourceEmissionCount,
          })
        expect(candidateWorkPlan).not.toBeNull()
        if (candidateWorkPlan == null) {
          throw new Error("Stage owner CandidateWork plan missing")
        }
        const sidecarPlan =
          prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
            detachedTicket,
            registrationPreconditionAuthority:
              input.sidecarRegistrationPreconditionAuthority,
            previousSidecars: input.previousSidecars,
            nextSidecars: input.nextSidecars,
            candidateWorkMeter: input.candidateWorkMeter,
            nextSidecarCandidateAuthority:
              input.nextSidecarCandidateAuthority,
            sourcePathCopyCandidateAuthority:
              input.sourcePathCopyCandidateAuthority,
          })
        if (sidecarPlan == null) throw new Error("Stage owner Sidecar plan missing")
        const sourcePlan = sourceStateInternals
          .prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
            detachedTicket,
            sourcePathCopyCandidateAuthority:
              input.sourcePathCopyCandidateAuthority,
            accessReservationAuthority:
              input.sidecarRegistrationPreconditionAuthority,
            nextSourceState: input.nextSourceState,
          })
        if (sourcePlan == null) throw new Error("Stage owner Source plan missing")
        const stagePlan = sourceAuthorityInternals
          .prepareVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
            detachedTicket,
            previousRoot: input.previousRoot,
            previousSourceState: input.previousSourceState,
            preflight: input.preflight,
            evidence: input.evidence,
            composition: input.composition,
            packingPolicy: input.packingPolicy,
            previousSidecars: input.previousSidecars,
            candidateWorkPlan,
            sidecarPlan,
            sourcePlan,
            producingStageAuthority: input.producingStageAuthority,
            validatedChange: input.validatedChange,
            sourceMaterial: input.sourceMaterial,
            boundedNextSourceItems: input.boundedNextSourceItems,
            boundedNextSourceStartRenderedUtf16:
              input.boundedNextSourceStartRenderedUtf16,
            previousSourceRange: input.preflight.previousRanges.changedSourceRange,
            nextSourceRange: input.preflight.nextRanges.changedSourceRange,
            existingLineageIds: input.existingLineageIds,
            insertedLineageIds: input.insertedLineageIds,
          })
        expect(stagePlan).not.toBeNull()
        if (stagePlan == null) throw new Error("Stage owner-seal plan missing")
        const exactMatch = {
          detachedTicket,
          planAuthority: stagePlan.planAuthority,
          sealAuthority: stagePlan.sealAuthority,
          plannedOutput: stagePlan.plannedOutput,
          candidateWorkPlan,
          sidecarPlan,
          sourcePlan,
        }
        expect(sourceAuthorityInternals
          .matchesVNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealInternalV1(
            exactMatch,
          )).toBe(true)
        expect(sourceAuthorityInternals
          .matchesVNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealInternalV1({
            ...exactMatch,
            sealAuthority: structuredClone(stagePlan.sealAuthority),
          })).toBe(false)
        expect(sourceAuthorityInternals
          .matchesVNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealInternalV1({
            ...exactMatch,
            plannedOutput: structuredClone(stagePlan.plannedOutput),
          })).toBe(false)

        const abort =
          abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
            detachedTicket,
          )
        expect(abort?.candidateWork).not.toBeNull()
        expect(abort?.stage).not.toBeNull()
        if (
          abort?.candidateWork == null
          || abort.sidecar == null
          || abort.source == null
          || abort.stage == null
        ) {
          throw new Error("Stage owner abandonment slots missing")
        }
        const candidateWorkAbort = abort.candidateWork
        const sidecarAbort = abort.sidecar
        const sourceAbort = abort.source
        const stageAbort = abort.stage
        expect(() => sourceAuthorityInternals
          .abandonVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
            planAuthority: stagePlan.planAuthority,
            abandonmentAuthority: structuredClone(
              stageAbort.abandonmentAuthority,
            ),
          })).toThrow(/abandonment invariant/i)
        sourceAuthorityInternals
          .abandonVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
            planAuthority: stagePlan.planAuthority,
            abandonmentAuthority: stageAbort.abandonmentAuthority,
          })
        abandonVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
          planAuthority: candidateWorkPlan.planAuthority,
          abandonmentAuthority: candidateWorkAbort.abandonmentAuthority,
        })
        abandonVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
          planAuthority: sidecarPlan.planAuthority,
          abandonmentAuthority: sidecarAbort.abandonmentAuthority,
        })
        sourceStateInternals
          .abandonVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
            planAuthority: sourcePlan.planAuthority,
            abandonmentAuthority: sourceAbort.abandonmentAuthority,
          })
        expect(sourceAuthorityInternals
          .matchesVNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealInternalV1(
            exactMatch,
          )).toBe(false)
        throw completed
      },
    })).toThrow(completed)
  })

  it("rejects every cross-plan seal across two real four-owner transactions", () => {
    type Captured = Readonly<{
      detachedTicket: ReturnType<
        typeof createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1
      >
      candidateWork: NonNullable<ReturnType<
        typeof prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1
      >>
      sidecar: NonNullable<ReturnType<
        typeof prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1
      >>
      source: NonNullable<ReturnType<
        typeof sourceStateInternals.prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1
      >>
      stage: NonNullable<ReturnType<
        typeof sourceAuthorityInternals.prepareVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1
      >>
      stageInput: Omit<Parameters<
        typeof sourceAuthorityInternals.prepareVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1
      >[0], "detachedTicket" | "candidateWorkPlan" | "sidecarPlan" | "sourcePlan">
    }>
    const capture = (ordinal: number): Captured => {
      const fixture = admitted5B2PlanARootFixture({ text: "ABCD" })
      const completed = new Error(`cross-plan capture ${ordinal} complete`)
      let captured: Captured | null = null
      expect(() => commitSourceCheckpoint({
        fixture,
        previousSourceState: fixture.root.sourceState,
        previousSidecars: fixture.sidecars,
        checkpointOrdinal: ordinal,
        inspectPreparedCommitInput(input): never {
          const detachedTicket =
            createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
          const candidateWork =
            prepareVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
              detachedTicket,
              publicationPreconditionAuthority:
                input.candidateWorkPublicationPreconditionAuthority,
              candidateWorkMeter: input.candidateWorkMeter,
              nextCandidateWork: input.nextCandidateWork,
              completedSourceEmissionCount: input.completedSourceEmissionCount,
            })
          if (candidateWork == null) throw new Error("cross-plan CandidateWork missing")
          const sidecar =
            prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
              detachedTicket,
              registrationPreconditionAuthority:
                input.sidecarRegistrationPreconditionAuthority,
              previousSidecars: input.previousSidecars,
              nextSidecars: input.nextSidecars,
              candidateWorkMeter: input.candidateWorkMeter,
              nextSidecarCandidateAuthority:
                input.nextSidecarCandidateAuthority,
              sourcePathCopyCandidateAuthority:
                input.sourcePathCopyCandidateAuthority,
            })
          if (sidecar == null) throw new Error("cross-plan Sidecar missing")
          const source = sourceStateInternals
            .prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
              detachedTicket,
              sourcePathCopyCandidateAuthority:
                input.sourcePathCopyCandidateAuthority,
              accessReservationAuthority:
                input.sidecarRegistrationPreconditionAuthority,
              nextSourceState: input.nextSourceState,
            })
          if (source == null) throw new Error("cross-plan Source missing")
          const stageInput: Captured["stageInput"] = {
            previousRoot: input.previousRoot,
            previousSourceState: input.previousSourceState,
            preflight: input.preflight,
            evidence: input.evidence,
            composition: input.composition,
            packingPolicy: input.packingPolicy,
            previousSidecars: input.previousSidecars,
            producingStageAuthority: input.producingStageAuthority,
            validatedChange: input.validatedChange,
            sourceMaterial: input.sourceMaterial,
            boundedNextSourceItems: input.boundedNextSourceItems,
            boundedNextSourceStartRenderedUtf16:
              input.boundedNextSourceStartRenderedUtf16,
            previousSourceRange:
              input.preflight.previousRanges.changedSourceRange,
            nextSourceRange: input.preflight.nextRanges.changedSourceRange,
            existingLineageIds: input.existingLineageIds,
            insertedLineageIds: input.insertedLineageIds,
          }
          const stage = sourceAuthorityInternals
            .prepareVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
              detachedTicket,
              ...stageInput,
              candidateWorkPlan: candidateWork,
              sidecarPlan: sidecar,
              sourcePlan: source,
            })
          if (stage == null) throw new Error("cross-plan Stage missing")
          captured = Object.freeze({
            detachedTicket,
            candidateWork,
            sidecar,
            source,
            stage,
            stageInput,
          })
          throw completed
        },
      })).toThrow(completed)
      if (captured == null) throw new Error("cross-plan capture missing")
      return captured
    }

    const first = capture(96)
    const second = capture(97)
    for (const mixed of [
      {
        candidateWorkPlan: second.candidateWork,
        sidecarPlan: first.sidecar,
        sourcePlan: first.source,
      },
      {
        candidateWorkPlan: first.candidateWork,
        sidecarPlan: second.sidecar,
        sourcePlan: first.source,
      },
      {
        candidateWorkPlan: first.candidateWork,
        sidecarPlan: first.sidecar,
        sourcePlan: second.source,
      },
    ]) {
      expect(sourceAuthorityInternals
        .prepareVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
          detachedTicket: first.detachedTicket,
          ...first.stageInput,
          ...mixed,
        })).toBeNull()
    }
    expect(matchesVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanSealInternalV1({
      detachedTicket: first.detachedTicket,
      planAuthority: first.candidateWork.planAuthority,
      sealAuthority: second.candidateWork.sealAuthority,
      plannedOutput: first.candidateWork.candidateWorkAuthority,
    })).toBe(false)
    expect(matchesVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanSealInternalV1({
      detachedTicket: first.detachedTicket,
      planAuthority: first.sidecar.planAuthority,
      sealAuthority: second.sidecar.sealAuthority,
      plannedOutput: first.sidecar.plannedOutput,
    })).toBe(false)
    expect(sourceStateInternals
      .matchesVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanSealInternalV1({
        detachedTicket: first.detachedTicket,
        planAuthority: first.source.planAuthority,
        sealAuthority: second.source.sealAuthority,
        plannedOutput: first.source.plannedOutput,
      })).toBe(false)
    expect(sourceAuthorityInternals
      .matchesVNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealInternalV1({
        detachedTicket: first.detachedTicket,
        planAuthority: first.stage.planAuthority,
         sealAuthority: second.stage.sealAuthority,
         plannedOutput: first.stage.plannedOutput,
         candidateWorkPlan: first.candidateWork,
         sidecarPlan: first.sidecar,
         sourcePlan: first.source,
       })).toBe(false)
    for (const mismatchedBundle of [
      { candidateWorkPlan: second.candidateWork },
      { sidecarPlan: second.sidecar },
      { sourcePlan: second.source },
    ]) {
      expect(sourceAuthorityInternals
        .matchesVNextTextBlockUnifiedLayoutSourceStagePublicationPlanSealInternalV1({
          detachedTicket: first.detachedTicket,
          planAuthority: first.stage.planAuthority,
          sealAuthority: first.stage.sealAuthority,
          plannedOutput: first.stage.plannedOutput,
          candidateWorkPlan: first.candidateWork,
          sidecarPlan: first.sidecar,
          sourcePlan: first.source,
          ...mismatchedBundle,
        })).toBe(false)
    }

    for (const captured of [first, second]) {
      const abort =
        abortDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1(
          captured.detachedTicket,
        )
      if (
        abort?.candidateWork == null
        || abort.sidecar == null
        || abort.source == null
        || abort.stage == null
      ) throw new Error("cross-plan abort bundle incomplete")
      abandonVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
        planAuthority: captured.candidateWork.planAuthority,
        abandonmentAuthority: abort.candidateWork.abandonmentAuthority,
      })
      abandonVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
        planAuthority: captured.sidecar.planAuthority,
        abandonmentAuthority: abort.sidecar.abandonmentAuthority,
      })
      sourceStateInternals
        .abandonVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
          planAuthority: captured.source.planAuthority,
          abandonmentAuthority: abort.source.abandonmentAuthority,
        })
      sourceAuthorityInternals
        .abandonVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
          planAuthority: captured.stage.planAuthority,
          abandonmentAuthority: abort.stage.abandonmentAuthority,
        })
    }
  })

  it("prepares exact sidecar publication without callback or visibility and uses transaction-owned protection for every Source candidate alias", () => {
    const fixture = admitted5B2PlanARootFixture({ text: "ABCD" })
    const completed = new Error("detached sidecar plan fixture complete")
    expect(() => commitSourceCheckpoint({
      fixture,
      previousSourceState: fixture.root.sourceState,
      previousSidecars: fixture.sidecars,
      checkpointOrdinal: 101,
      inspectDetachedSidecarPlan(prepared): never {
        const detached =
          createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
        expect(resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1({
          sourceState: prepared.nextSourceState,
          composition: fixture.composition,
        })).toBeNull()
        expect(prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
          detachedTicket: detached,
          registrationPreconditionAuthority:
            prepared.registrationPreconditionAuthority,
          previousSidecars: fixture.sidecars,
          nextSidecars: Object.freeze({
            ...structuredClone(prepared.nextSidecars),
            sourceState: prepared.nextSourceState,
          }),
          candidateWorkMeter: prepared.candidateWorkMeter,
          nextSidecarCandidateAuthority:
            prepared.nextSidecarCandidateAuthority,
          sourcePathCopyCandidateAuthority:
            prepared.sourcePathCopyCandidateAuthority,
        })).toBeNull()
        expect(prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
          detachedTicket: detached,
          registrationPreconditionAuthority:
            prepared.registrationPreconditionAuthority,
          previousSidecars: Object.freeze({
            ...structuredClone(fixture.sidecars),
            sourceState: fixture.sidecars.sourceState,
          }),
          nextSidecars: prepared.nextSidecars,
          candidateWorkMeter: prepared.candidateWorkMeter,
          nextSidecarCandidateAuthority:
            prepared.nextSidecarCandidateAuthority,
          sourcePathCopyCandidateAuthority:
            prepared.sourcePathCopyCandidateAuthority,
        })).toBeNull()
        expect(prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
          detachedTicket: detached,
          registrationPreconditionAuthority:
            prepared.registrationPreconditionAuthority,
          previousSidecars: fixture.sidecars,
          nextSidecars: prepared.nextSidecars,
          candidateWorkMeter: prepared.candidateWorkMeter,
          nextSidecarCandidateAuthority:
            prepared.nextSidecarCandidateAuthority,
          sourcePathCopyCandidateAuthority: Object.freeze({}) as
            VNextTextBlockSourcePathCopyCandidateAuthorityInternalV1,
        })).toBeNull()
        const sidecarPlan =
          prepareVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
            detachedTicket: detached,
            registrationPreconditionAuthority:
              prepared.registrationPreconditionAuthority,
            previousSidecars: fixture.sidecars,
            nextSidecars: prepared.nextSidecars,
            candidateWorkMeter: prepared.candidateWorkMeter,
            nextSidecarCandidateAuthority:
              prepared.nextSidecarCandidateAuthority,
            sourcePathCopyCandidateAuthority:
              prepared.sourcePathCopyCandidateAuthority,
          })
        expect(sidecarPlan).not.toBeNull()
        if (sidecarPlan == null) throw new Error("detached sidecar plan missing")
        expect(sourceStateInternals
          .discardVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessPublicationInternalV1(
            sidecarPlan.planAuthority,
          )).toBe(false)
        const foreignDetached =
          createDetachedVNextTextBlockUnifiedLayoutSourceCommitInternalV1()
        expect(attachVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1({
          detachedTicket: foreignDetached,
          planAuthority: sidecarPlan.planAuthority,
          sealAuthority: sidecarPlan.sealAuthority,
          applyRecord: Object.freeze({}) as never,
        })).toBe(false)
        expect(sourceStateInternals
          .prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
            detachedTicket: foreignDetached,
            sourcePathCopyCandidateAuthority:
              prepared.sourcePathCopyCandidateAuthority,
            accessReservationAuthority:
              prepared.registrationPreconditionAuthority,
            nextSourceState: prepared.nextSourceState,
          })).toBeNull()
        expect(sourceStateInternals
          .prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
            detachedTicket: detached,
            sourcePathCopyCandidateAuthority:
              prepared.sourcePathCopyCandidateAuthority,
            accessReservationAuthority: Object.freeze({}),
            nextSourceState: prepared.nextSourceState,
          })).toBeNull()
        expect(sourceStateInternals
          .prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
            detachedTicket: detached,
            sourcePathCopyCandidateAuthority:
              prepared.sourcePathCopyCandidateAuthority,
            accessReservationAuthority:
              prepared.registrationPreconditionAuthority,
            nextSourceState: Object.freeze({
              ...structuredClone(prepared.nextSourceState),
            }),
          })).toBeNull()
        const candidateWorkPlan = Object.freeze({}) as
          VNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanAuthorityInternalV1
        const candidateWorkPlanSealAuthority = Object.freeze({})
        const sourcePlan =
          sourceStateInternals.prepareVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1({
            detachedTicket: detached,
            sourcePathCopyCandidateAuthority:
              prepared.sourcePathCopyCandidateAuthority,
            accessReservationAuthority:
              prepared.registrationPreconditionAuthority,
            nextSourceState: prepared.nextSourceState,
          })
        expect(sourcePlan).not.toBeNull()
        if (sourcePlan == null) throw new Error("detached Source plan missing")
        const stagePlan = Object.freeze({}) as
          VNextTextBlockUnifiedLayoutSourceStagePublicationPlanAuthorityInternalV1
        const stagePlanSealAuthority = Object.freeze({})
        expect(attachVNextTextBlockUnifiedLayoutCandidateWorkPublicationPlanInternalV1({
          detachedTicket: detached,
          planAuthority: candidateWorkPlan,
          sealAuthority: candidateWorkPlanSealAuthority as never,
          applyRecord: candidateWorkPlan as never,
        })).toBe(true)
        expect(attachVNextTextBlockUnifiedLayoutSourceStagePublicationPlanInternalV1({
          detachedTicket: detached,
          planAuthority: stagePlan,
          sealAuthority: stagePlanSealAuthority as never,
          applyRecord: stagePlan as never,
        })).toBe(true)
        const mintResult = mintVNextTextBlockUnifiedLayoutSourceCommitInternalV1({
          detachedTicket: detached,
          candidateWorkPlanAuthority: candidateWorkPlan,
          sidecarPlanAuthority: sidecarPlan.planAuthority,
          sourcePlanAuthority: sourcePlan.planAuthority,
          stagePlanAuthority: stagePlan,
          candidateWorkPlanSealAuthority: candidateWorkPlanSealAuthority as never,
          sidecarPlanSealAuthority: sidecarPlan.sealAuthority,
          sourcePlanSealAuthority: sourcePlan.sealAuthority,
          stagePlanSealAuthority: stagePlanSealAuthority as never,
          candidateWorkPublicationPreconditionAuthority:
            prepared.candidateWorkPublicationPreconditionAuthority,
          sidecarRegistrationPreconditionAuthority:
            prepared.registrationPreconditionAuthority,
          candidateWorkMeter: prepared.candidateWorkMeter,
          nextSidecarCandidateAuthority:
            prepared.nextSidecarCandidateAuthority,
          sourcePathCopyCandidateAuthority:
            prepared.sourcePathCopyCandidateAuthority,
        })
        expect(mintResult?.status).toBe("sealed")
        if (mintResult?.status !== "sealed") {
          throw new Error("detached sidecar ticket missing")
        }
        const ticket = mintResult.ticket
        const sourceCandidateRecord =
          getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
            prepared.sourcePathCopyCandidateAuthority,
          )
        if (sourceCandidateRecord == null) {
          throw new Error("detached Source candidate record missing")
        }
        expect(discardVNextTextBlockUnifiedLayoutSourceSidecarCandidateInternalV1(
          prepared.nextSidecarCandidateAuthority,
        )).toBe(false)
        expect(discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
          prepared.sourcePathCopyCandidateAuthority,
        )).toBe(false)
        expect(discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
          sourceCandidateRecord.removedItems,
        )).toBe(false)
        expect(discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
          sourceCandidateRecord.nextPhysicalItems,
        )).toBe(false)
        expect(releaseVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessReservationInternalV1({
          sourceState: prepared.nextSourceState,
          reservationAuthority: prepared.registrationPreconditionAuthority,
        })).toBe(false)
        const candidateWorkStep =
          beginVNextTextBlockUnifiedLayoutSourceCommitInternalV1(ticket)
        const sidecarStep =
          consumeVNextTextBlockUnifiedLayoutCandidateWorkCommitStepInternalV1({
            step: candidateWorkStep,
            consumerAuthority:
              dummyCandidateWorkStepConsumerAuthority as never,
          }).nextStep
        const sourceStep =
          applyVNextTextBlockUnifiedLayoutSourceSidecarCommitPlanInternalV1(
            sidecarStep,
          )
        const stageStep = sourceStateInternals
          .applyVNextTextBlockUnifiedLayoutSourceCandidateCommitPlanInternalV1(
            sourceStep,
          )
        expect(resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1({
          sourceState: prepared.nextSourceState,
          composition: fixture.composition,
        })).toBe(prepared.nextSidecars)
        expect(discardVNextTextBlockUnifiedLayoutSourceSidecarCandidateInternalV1(
          prepared.nextSidecarCandidateAuthority,
        )).toBe(false)
        expect(getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
          prepared.sourcePathCopyCandidateAuthority,
        )).toBeNull()
        expect(getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
          sourceCandidateRecord.removedItems,
        )).toBeNull()
        expect(getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
          sourceCandidateRecord.nextPhysicalItems,
        )).toBeNull()
        expect(inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
          prepared.nextSourceState,
        ).status).toBe("prepared-unregistered")
        const finishStep =
          consumeVNextTextBlockUnifiedLayoutSourceStageCommitStepInternalV1({
            step: stageStep,
            consumerAuthority: dummyStageStepConsumerAuthority as never,
          }).finishStep
        finishVNextTextBlockUnifiedLayoutSourceCommitInternalV1(finishStep)
        throw completed
      },
    })).toThrow(completed)
  })

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

  it("normalizes a pre-ticket Source array alias to the exact candidate abort", () => {
    const candidate = preparePlanASourceCandidate({ nextItemCount: 1 })
    expect(discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
      candidate.record.removedItems,
    )).toBe(true)
    expect(getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      candidate.prepared.pathCopyCandidateAuthority,
    )).toBeNull()
    expect(getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
      candidate.record.nextPhysicalItems,
    )).toBeNull()
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      candidate.prepared.sourceState,
    ).status).toBe("invalid")
  })

  it("releases an exact Plan A sidecar access reservation before ticket protection", () => {
    const sourceState = textSource(1)
    const firstAuthority = Object.freeze({})
    const nextAuthority = Object.freeze({})
    expect(reserveVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1({
      sourceState,
      reservationAuthority: firstAuthority,
    })).toBe(true)
    expect(releaseVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessReservationInternalV1({
      sourceState,
      reservationAuthority: firstAuthority,
    })).toBe(true)
    expect(reserveVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1({
      sourceState,
      reservationAuthority: nextAuthority,
    })).toBe(true)
    expect(releaseVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessReservationInternalV1({
      sourceState,
      reservationAuthority: nextAuthority,
    })).toBe(true)
  })

  it("exports no local ticket protection or captured Source access commit", () => {
    expect(sourceStateInternals).not.toHaveProperty(
      "protectVNextTextBlockUnifiedLayoutSourcePlanACommitInternalV1",
    )
    expect(sourceStateInternals).not.toHaveProperty(
      "VNextTextBlockUnifiedLayoutSourcePlanASidecarAccessCommitInternalV1",
    )
  })

  it("cleans every Source candidate when Stage preparation rejects before mint", () => {
    // Catches a pre-live Stage-plan rejection returning null while leaving the
    // already-prepared Sidecar and Source candidate registries reachable.
    const fixture = admitted5B2PlanARootFixture({ text: "ABCD" })
    const completed = new Error("pre-mint Stage rejection fixture complete")
    expect(() => commitSourceCheckpoint({
      fixture,
      previousSourceState: fixture.root.sourceState,
      previousSidecars: fixture.sidecars,
      checkpointOrdinal: 1001,
      inspectPreparedCommitInput(prepared): never {
        expect(prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1({
          ...prepared,
          packingPolicy: Object.freeze({
            ...VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_SOURCE_STATE_POLICY_V1,
          }),
        })).toBeNull()
        expect(discardVNextTextBlockUnifiedLayoutSourceSidecarCandidateInternalV1(
          prepared.nextSidecarCandidateAuthority,
        )).toBe(false)
        expect(discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
          prepared.sourcePathCopyCandidateAuthority,
        )).toBe(false)
        expect(inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
          prepared.nextSourceState,
        ).status).toBe("invalid")
        throw completed
      },
    })).toThrow(completed)
  })

  it.each(REAL_SOURCE_COMMIT_MINT_FAULT_POINTS)(
    "keeps the exact real four-plan tuple retryable after mint fault %s",
    (faultPoint) => {
      // Catches transaction rollback that clears its indices but lets the
      // coordinator destroy the exact owner-local tuple needed for retry.
      const fixture = admitted5B2PlanARootFixture({ text: "ABCD" })
      const completed = new Error(`real mint fault ${faultPoint} complete`)
      const checkpointOrdinal = 1100
        + REAL_SOURCE_COMMIT_MINT_FAULT_POINTS.indexOf(faultPoint)
      expect(() => commitSourceCheckpoint({
        fixture,
        previousSourceState: fixture.root.sourceState,
        previousSidecars: fixture.sidecars,
        checkpointOrdinal,
        inspectPreparedCommitInput(prepared): never {
          try {
            setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1(
              faultPoint,
            )
            expect(
              prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(
                prepared,
              ),
            ).toBeNull()
          } finally {
            setVNextTextBlockUnifiedLayoutSourceCommitMintFaultForTestInternalV1(
              null,
            )
          }
          expect(
            getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
              prepared.sourcePathCopyCandidateAuthority,
            ),
          ).not.toBeNull()
          expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
            previousRoot: prepared.previousRoot,
            change: prepared.preflight.change!,
            composition: prepared.composition,
            candidateWork: prepared.nextCandidateWork,
          })).toBeNull()
          expect(resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1({
            sourceState: prepared.nextSourceState,
            composition: fixture.composition,
          })).toBeNull()
          expect(inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
            prepared.nextSourceState,
          ).status).toBe("prepared-unregistered")

          const retry =
            prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(
              prepared,
            )
          expect(retry).not.toBeNull()
          if (retry == null) throw new Error("real mint fault retry blocked")
          const planned =
            inspectVNextTextBlockUnifiedLayoutPreparedSourceStageCommitForTestInternalV1(
              retry,
            )
          expect(planned).not.toBeNull()
          expect(commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(retry))
            .toBe(planned)
          throw completed
        },
      })).toThrow(completed)
    },
  )

  it.each(REAL_SOURCE_COMMIT_PREPARE_FAULT_POINTS)(
    "abandons the exact real owner prefix and retries after prepare fault %s",
    (faultPoint) => {
      const fixture = admitted5B2PlanARootFixture({ text: "ABCD" })
      const completed = new Error(`real owner prepare fault ${faultPoint} complete`)
      const checkpointOrdinal = 1150
        + REAL_SOURCE_COMMIT_PREPARE_FAULT_POINTS.indexOf(faultPoint)
      expect(() => commitSourceCheckpoint({
        fixture,
        previousSourceState: fixture.root.sourceState,
        previousSidecars: fixture.sidecars,
        checkpointOrdinal,
        inspectPreparedCommitInput(prepared): never {
          try {
            setVNextTextBlockUnifiedLayoutSourceCommitPrepareFaultForTestInternalV1(
              faultPoint,
            )
            expect(
              prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(
                prepared,
              ),
            ).toBeNull()
          } finally {
            setVNextTextBlockUnifiedLayoutSourceCommitPrepareFaultForTestInternalV1(
              null,
            )
          }
          expect(
            getVNextTextBlockUnifiedLayoutSourcePathCopyCandidateRecordInternalV1(
              prepared.sourcePathCopyCandidateAuthority,
            ),
          ).not.toBeNull()
          expect(resolveVNextTextBlockUnifiedLayout5B2CandidateWorkAuthorityInternalV1({
            previousRoot: prepared.previousRoot,
            change: prepared.preflight.change!,
            composition: prepared.composition,
            candidateWork: prepared.nextCandidateWork,
          })).toBeNull()
          expect(resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1({
            sourceState: prepared.nextSourceState,
            composition: fixture.composition,
          })).toBeNull()

          const retry =
            prepareVNextTextBlockUnifiedLayoutSourceStageCommitInternalV1(
              prepared,
            )
          expect(retry).not.toBeNull()
          if (retry == null) throw new Error("real owner prepare retry blocked")
          const planned =
            inspectVNextTextBlockUnifiedLayoutPreparedSourceStageCommitForTestInternalV1(
              retry,
            )
          expect(planned).not.toBeNull()
          expect(commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(retry))
            .toBe(planned)
          throw completed
        },
      })).toThrow(completed)
    },
  )

  it("commits through plain internal operations without freeze or iterator execution", () => {
    // Catches post-live construction and iterator protocol execution in any
    // participant apply or transaction finish operation.
    const fixture = admitted5B2PlanARootFixture({ text: "ABCD" })
    const originalFreeze = Object.freeze
    const originalIterator = Array.prototype[Symbol.iterator]
    let freezeCount = 0
    let iteratorCount = 0
    let externalExecutionCount = 0
    commitSourceCheckpoint({
      fixture,
      previousSourceState: fixture.root.sourceState,
      previousSidecars: fixture.sidecars,
      checkpointOrdinal: 1200,
      commitPrepared(ticket) {
        const observeExternalExecution = (): never => {
          externalExecutionCount += 1
          throw new Error("post-live external execution")
        }
        setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1(
          observeExternalExecution,
        )
        setVNextTextBlockUnifiedLayoutSourceSidecarPathCopyCandidateObserverForTestInternalV1(
          observeExternalExecution,
        )
        setVNextTextBlockUnifiedLayoutSourcePathCopyCandidateObserverForTestInternalV1(
          observeExternalExecution,
        )
        setVNextTextBlockUnifiedLayoutSourcePhysicalPayloadObserverForTestInternalV1(
          observeExternalExecution,
        )
        setVNextTextBlockUnifiedLayoutSourceStylePayloadObserverForTestInternalV1(
          observeExternalExecution,
        )
        setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1(
          observeExternalExecution,
        )
        Object.freeze = ((value: object) => {
          freezeCount += 1
          return originalFreeze(value)
        }) as typeof Object.freeze
        Array.prototype[Symbol.iterator] = function () {
          iteratorCount += 1
          return originalIterator.call(this)
        }
        try {
          return commitVNextTextBlockUnifiedLayoutSourceStageInternalV1(ticket)
        } finally {
          Object.freeze = originalFreeze
          Array.prototype[Symbol.iterator] = originalIterator
          setVNextTextBlockUnifiedLayout5B2CandidateRegistrationObserverForTestInternalV1(
            null,
          )
          setVNextTextBlockUnifiedLayoutSourceSidecarPathCopyCandidateObserverForTestInternalV1(
            null,
          )
          setVNextTextBlockUnifiedLayoutSourcePathCopyCandidateObserverForTestInternalV1(
            null,
          )
          setVNextTextBlockUnifiedLayoutSourcePhysicalPayloadObserverForTestInternalV1(
            null,
          )
          setVNextTextBlockUnifiedLayoutSourceStylePayloadObserverForTestInternalV1(
            null,
          )
          setVNextTextBlockUnifiedLayoutSourceIndexLookupObserverForTestInternalV1(
            null,
          )
        }
      },
    })
    expect(freezeCount).toBe(0)
    expect(iteratorCount).toBe(0)
    expect(externalExecutionCount).toBe(0)
  })

  it("exposes no operation that can consume protected sidecar access", () => {
    // Catches a caller bypassing the atomic tail with an exact ticket and
    // reservation instead of letting the SourceState owner commit access.
    expect(Object.keys(sourceAuthorityInternals).filter((name) =>
      name.includes("PlanASidecarAccessReservationProtection")
      && name.startsWith("consume")
    )).toEqual([])
    expect(Object.keys(sourceStateInternals).filter((name) =>
      name.includes("PlanASidecarAccessReservation")
      && name.startsWith("commit")
    )).toEqual([])
  })

  it("keeps a three-state Source checkpoint chain on immediately previous sidecars", () => {
    // This is a process-local Source checkpoint chain, not Root publication.
    const fixture = admitted5B2PlanARootFixture({ text: "ABCD" })
    const checkpoint1 = commitSourceCheckpoint({
      fixture,
      previousSourceState: fixture.root.sourceState,
      previousSidecars: fixture.sidecars,
      checkpointOrdinal: 1,
      probeTicketAtomicity: true,
      probeSourceAbortAlias: "removedItems",
    })
    const checkpoint2 = commitSourceCheckpoint({
      fixture,
      previousSourceState: checkpoint1.nextSourceState,
      previousSidecars: checkpoint1.nextSidecars,
      checkpointOrdinal: 2,
      probeTicketAtomicity: true,
      probeSourceAbortAlias: "nextPhysicalItems",
    })
    const checkpoint3 = commitSourceCheckpoint({
      fixture,
      previousSourceState: checkpoint2.nextSourceState,
      previousSidecars: checkpoint2.nextSidecars,
      checkpointOrdinal: 3,
    })

    const resolve = (checkpoint: typeof checkpoint1) =>
      resolveVNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1({
        authority: checkpoint.sourceStageAuthority,
        previousRoot: fixture.root,
        nextSourceState: checkpoint.nextSourceState,
        completedCandidateWork: checkpoint.completedCandidateWork,
      })
    expect(resolve(checkpoint1)?.previousSidecars).toBe(fixture.sidecars)
    expect(checkpoint1.clonedTupleTicketMinted).toBe(false)
    expect(checkpoint1.duplicateTicketMinted).toBe(false)
    expect(checkpoint1.postTicketSidecarAbortRejected).toBe(true)
    expect(checkpoint1.postTicketSourceAbortRejected).toBe(true)
    expect(checkpoint1.postTicketSourceAliasAbortRejected).toBe(true)
    expect(checkpoint2.postTicketSourceAliasAbortRejected).toBe(true)
    expect(checkpoint1.postTicketAccessTheftRejected).toBe(true)
    expect(checkpoint1.postTicketAccessReleaseRejected).toBe(true)
    expect(checkpoint1.postTicketPairOverwriteRejected).toBe(true)
    expect(checkpoint2.postTicketAccessTheftRejected).toBe(true)
    expect(checkpoint2.postTicketPairOverwriteRejected).toBe(true)
    expect(checkpoint1.postCommitSourceAbortRejected).toBe(true)
    expect(checkpoint1.postCommitRemovedAliasAbortRejected).toBe(true)
    expect(checkpoint1.postCommitNextAliasAbortRejected).toBe(true)
    expect(checkpoint1.sourceCandidateHandleRetired).toBe(true)
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      checkpoint1.nextSourceState,
    ).status).toBe("prepared-unregistered")
    expect(resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1({
      sourceState: checkpoint1.nextSourceState,
      composition: fixture.composition,
    })).toBe(checkpoint1.nextSidecars)
    expect(resolve(checkpoint2)).toMatchObject({
      previousSourceState: checkpoint1.nextSourceState,
      previousSidecars: checkpoint1.nextSidecars,
    })
    expect(resolve(checkpoint3)).toMatchObject({
      previousSourceState: checkpoint2.nextSourceState,
      previousSidecars: checkpoint2.nextSidecars,
    })
    expect(resolve(checkpoint2)?.previousSidecars).not.toBe(fixture.sidecars)
    expect(resolve(checkpoint3)?.previousSidecars).not.toBe(
      checkpoint1.nextSidecars,
    )
    expect(resolveVNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1({
      authority: checkpoint1.sourceStageAuthority,
      previousRoot: fixture.root,
      nextSourceState: checkpoint2.nextSourceState,
      completedCandidateWork: checkpoint1.completedCandidateWork,
    })).toBeNull()
    expect(resolveVNextTextBlockUnifiedLayoutSourceStageAuthorityInternalV1({
      authority: checkpoint2.sourceStageAuthority,
      previousRoot: fixture.root,
      nextSourceState: checkpoint3.nextSourceState,
      completedCandidateWork: checkpoint2.completedCandidateWork,
    })).toBeNull()
    expect(resolveVNextTextBlockUnifiedLayoutSourceSidecarsInternalV1({
      sourceState: structuredClone(checkpoint3.nextSourceState),
      composition: fixture.composition,
    })).toBeNull()
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

  it("opens source-items before observing the exact replacement array", () => {
    // Catches evaluating replacement.nextItems or its length before Source owns
    // the first replacement payload observation.
    const previousSourceState = textSource(1)
    if (previousSourceState.root.nodeKind !== "leaf") throw new Error("leaf missing")
    const previous = previousSourceState.root.items[0]
    if (previous?.kind !== "text") throw new Error("text item missing")
    const created = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
      sourceState: previousSourceState,
      kind: "text",
      renderedText: "hostile replacement",
      lineageId: "hostile-replacement-lineage",
      inlineId: "hostile-replacement-inline",
      sourceFingerprint: "hostile-replacement-source",
      provenanceFingerprint: "hostile-replacement-provenance",
      style: previous.style,
    })
    if (created == null) throw new Error("replacement item blocked")

    let sourceItemsOpened = false
    const unownedObservations: string[] = []
    const observePayload = (label: string): void => {
      if (!sourceItemsOpened) unownedObservations.push(label)
    }
    const hostileItem = new Proxy(created, {
      get(target, property, receiver) {
        observePayload(`item.${String(property)}`)
        return Reflect.get(target, property, receiver)
      },
    })
    const hostileItems = new Proxy(Object.freeze([hostileItem]), {
      get(target, property, receiver) {
        if (property === "length" || property === "0") {
          observePayload(`nextItems.${String(property)}`)
        }
        return Reflect.get(target, property, receiver)
      },
    })
    const previousRange = Object.freeze({
      startRenderedUtf16: 0,
      endRenderedUtf16: previous.renderedUtf16Length,
    })
    const replacement = new Proxy(Object.freeze({
      previousRange,
      nextItems: hostileItems,
      expectedPreviousContentFingerprint: createVNextCompactFingerprint(
        stringifyVNextCanonicalJson([previous.renderedText]),
      ),
      expectedPreviousSourceFingerprint: createVNextCompactFingerprint(
        stringifyVNextCanonicalJson([previous.sourceFingerprint]),
      ),
      expectedPreviousProvenanceFingerprint: createVNextCompactFingerprint(
        stringifyVNextCanonicalJson([previous.provenanceFingerprint]),
      ),
      fingerprint: "hostile-source-replacement",
    }), {
      get(target, property, receiver) {
        if (property === "nextItems") observePayload("replacement.nextItems")
        return Reflect.get(target, property, receiver)
      },
    })
    const registrationInput = {
      previousSourceState,
      replacement,
      previousRange,
      nextItems: hostileItems,
      nextItemCount: 1,
    }
    expect(registerVNextTextBlockUnifiedLayoutSourceRangeReplacementRawInternalV1(
      registrationInput,
    )).toBe(true)

    const result = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
      previousSourceState,
      replacement,
      beforeVisit(unit) {
        if (unit === "source-items") sourceItemsOpened = true
        return true
      },
    })
    expect(result.status).toBe("prepared")
    expect(unownedObservations).toEqual([])
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
      }, { left: 10, right: 11 })
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
    expect(discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
      candidate.prepared.pathCopyCandidateAuthority,
    )).toBe(true)
    expect(inspectVNextTextBlockUnifiedLayoutSourceStateInternalV1(
      candidate.prepared.sourceState,
    ).status).toBe("invalid")
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
      nextPhysicalItems: typeof candidate.record.nextPhysicalItems,
      previousSidecars = candidate.sidecars) =>
      prepareVNextTextBlockUnifiedLayoutSourceSidecarsPathCopyInternalV1({
        previousSourceState: candidate.root.sourceState,
        nextSourceState: candidate.prepared.sourceState,
        replacement: candidate.replacement,
        removedItems,
        nextPhysicalItems,
        previousSidecars,
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
    expect(call(
      candidate.record.removedItems,
      candidate.record.nextPhysicalItems,
      foreign.sidecars,
    )).toMatchObject({ status: "blocked", sidecars: null })

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

  it.each([
    ["first", 0],
    ["middle", 8],
    ["last", 16],
  ] as const)(
    "path-copies a zero-width $0 boundary insertion in a multi-leaf order tree",
    (_label, boundaryOrdinal) => {
      const candidate = prepareMixedBoundaryInsertionCandidate(
        16,
        boundaryOrdinal,
      )
      expect(candidate.record.removedItems).toEqual([])
      expect(candidate.record.nextPhysicalItems).toEqual([candidate.inserted])
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
      const nextEntries = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
        result.sidecars.orderRoot,
      ).entries
      expect(nextEntries).toHaveLength(candidate.previousEntries.length + 1)
      expect(nextEntries[boundaryOrdinal]?.item).toBe(candidate.inserted)
      expect(nextEntries[boundaryOrdinal - 1]?.item ?? null).toBe(
        candidate.previousEntries[boundaryOrdinal - 1]?.item ?? null,
      )
      expect(nextEntries[boundaryOrdinal + 1]?.item ?? null).toBe(
        candidate.previousEntries[boundaryOrdinal]?.item ?? null,
      )
      // The Source owner has already completed emission; sidecars must not
      // duplicate its source-items receipt during a direct coordinator probe.
      expect(
        inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
          candidate.meter,
        )?.find((row) => row.ownerRow.unit === "source-items"),
      ).toMatchObject({ attemptedWork: 0, completedWork: 0 })
    },
    30_000,
  )

  it.each([
    ["negative", -1],
    ["past-end", 10_000],
    ["non-boundary", 1],
  ] as const)(
    "rejects a $0 zero-removal physical boundary without insertion output",
    (_label, previousRenderedBoundary) => {
      const candidate = prepareMixedBoundaryInsertionCandidate(16, 0)
      const result = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
        identityRoot: candidate.sidecars.identityRoot,
        orderRoot: candidate.sidecars.orderRoot,
        removedItems: candidate.record.removedItems,
        nextPhysicalItems: candidate.record.nextPhysicalItems,
        workMeter: candidate.meter,
        previousRenderedBoundary,
      })
      expect(result.status).toBe("blocked")
    },
  )

  it("stops a zero-width boundary lookup at a zero node limit before node payload", () => {
    const foundation = openPlanAMeter({
      sourceLimits: { sourceIndexNodes: 0 },
      label: "boundary-zero-node-limit",
    })
    const previous = foundation.root.sourceState.root.nodeKind === "leaf"
      ? foundation.root.sourceState.root.items[0]
      : null
    if (previous?.kind !== "text") throw new Error("zero-limit text missing")
    const inserted = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
      sourceState: foundation.root.sourceState,
      kind: "text",
      renderedText: "I",
      lineageId: "zero-limit-boundary-lineage",
      inlineId: "zero-limit-boundary-inline",
      sourceFingerprint: "zero-limit-boundary-source",
      provenanceFingerprint: "zero-limit-boundary-provenance",
      style: previous.style,
    })
    if (inserted == null) throw new Error("zero-limit insertion item blocked")
    const result = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
      identityRoot: foundation.sidecars.identityRoot,
      orderRoot: foundation.sidecars.orderRoot,
      removedItems: Object.freeze([]),
      nextPhysicalItems: Object.freeze([inserted]),
      workMeter: foundation.meter,
      previousRenderedBoundary: 0,
    })
    expect(result.status).toBe("work-limit")
    expect(
      inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
        foundation.meter,
      )?.find((row) => row.ownerRow.unit === "source-index-nodes"),
    ).toMatchObject({ attemptedWork: 1, completedWork: 0 })
  })

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

  it("owns physical input arrays, insertion payload, and height-two reconstruction", () => {
    // Catches obtaining an input/root entry-array reference, length, iterator,
    // slot, or item/key payload outside source-index-entries.
    const guardInputArray = <T,>(input: {
      readonly values: readonly T[]
      readonly label: string
      readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
      readonly unownedReads: string[]
      readonly wrapValue?: (value: T) => T
    }): readonly T[] => new Proxy(Object.freeze(input.values.map(
      (value) => input.wrapValue?.(value) ?? value,
    )), {
      get(target, property, receiver) {
        if (
          property === "length"
          || property === Symbol.iterator
          || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
        ) {
          if (!hasOpenExactSourcePermit(input.meter, "source-index-entries")) {
            input.unownedReads.push(`${input.label}.${String(property)}`)
          }
        }
        return Reflect.get(target, property, receiver)
      },
    })
    const guardItem = <T extends VNextTextBlockUnifiedLayoutSourceItemV1>(input: {
      readonly item: T
      readonly meter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1
      readonly unownedReads: string[]
    }): T => new Proxy(input.item, {
      get(target, property, receiver) {
        if (
          property === "inlineId"
          || property === "kind"
          || property === "fingerprint"
          || property === "renderedUtf16Length"
        ) {
          if (!hasOpenExactSourcePermit(input.meter, "source-index-entries")) {
            input.unownedReads.push(`item.${String(property)}`)
          }
        }
        return Reflect.get(target, property, receiver)
      },
    })

    let activeMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1 | null = null
    const localObservedReads: string[] = []
    const localUnownedReads: string[] = []
    const localMutationEvents: string[] = []
    const rawArraysByKind = new Map<string, object[]>()
    const localReadViewRegistration = Object.freeze({
      authority: Object.freeze({}),
      createReadView(input: Readonly<{
        readonly kind: Parameters<Parameters<
          typeof registerVNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewForTestInternalV1
        >[0]["createReadView"]>[0]["kind"]
        readonly raw: readonly object[]
      }>): readonly object[] {
        const rawArrays = rawArraysByKind.get(input.kind) ?? []
        rawArrays.push(input.raw)
        rawArraysByKind.set(input.kind, rawArrays)
        const record = (event: string): void => {
          const label = `${input.kind}:${event}`
          localObservedReads.push(label)
          if (
            activeMeter == null
            || !hasOpenExactSourcePermit(activeMeter, "source-index-entries")
          ) localUnownedReads.push(label)
        }
        return new Proxy(input.raw, {
          get(target, property, receiver) {
            if (
              property === "length"
              || property === Symbol.iterator
              || property === "map"
              || property === "reduce"
              || property === "push"
              || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
            ) {
              record(`get.${String(property)}`)
            }
            return Reflect.get(target, property, receiver)
          },
          set(target, property, value, receiver) {
            if (
              property === "length"
              || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
            ) {
              record(`set.${String(property)}`)
              localMutationEvents.push(`${input.kind}:emit`)
            }
            return Reflect.set(target, property, value, receiver)
          },
          defineProperty(target, property, descriptor) {
            if (
              property === "length"
              || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
            ) {
              record(`define.${String(property)}`)
              localMutationEvents.push(`${input.kind}:emit`)
            }
            return Reflect.defineProperty(target, property, descriptor)
          },
          preventExtensions(target) {
            record("freeze")
            localMutationEvents.push(`${input.kind}:freeze`)
            return Reflect.preventExtensions(target)
          },
        })
      },
    })
    expect(registerVNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewForTestInternalV1(
      localReadViewRegistration,
    )).toBe(true)
    expect(registerVNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewForTestInternalV1(
      localReadViewRegistration,
    )).toBe(false)

    try {
      const insertion = prepareMixedSingleItemEditCandidate(4, "insertion")
    if (insertion.sidecars.identityRoot == null || insertion.sidecars.orderRoot == null) {
      throw new Error("guarded insertion roots missing")
    }
    const insertionUnownedReads: string[] = []
    const removedItems = guardInputArray({
      values: insertion.record.removedItems,
      label: "removedItems",
      meter: insertion.meter,
      unownedReads: insertionUnownedReads,
    })
    const nextPhysicalItems = guardInputArray({
      values: insertion.record.nextPhysicalItems,
      label: "nextPhysicalItems",
      meter: insertion.meter,
      unownedReads: insertionUnownedReads,
      wrapValue: (item) => guardItem({
        item,
        meter: insertion.meter,
        unownedReads: insertionUnownedReads,
      }),
    })
    const insertionInput = new Proxy(Object.freeze({
      identityRoot: guardPhysicalEntryArrayReads({
        root: insertion.sidecars.identityRoot,
        meter: insertion.meter,
        unownedReads: insertionUnownedReads,
      }),
      orderRoot: guardPhysicalEntryArrayReads({
        root: insertion.sidecars.orderRoot,
        meter: insertion.meter,
        unownedReads: insertionUnownedReads,
      }),
      removedItems,
      nextPhysicalItems,
      workMeter: insertion.meter,
    }), {
      get(target, property, receiver) {
        if (
          (property === "removedItems" || property === "nextPhysicalItems")
          && !hasOpenExactSourcePermit(insertion.meter, "source-index-entries")
        ) insertionUnownedReads.push(`input.${String(property)}`)
        return Reflect.get(target, property, receiver)
      },
    })
    activeMeter = insertion.meter
    const insertionResult =
      pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1(
        insertionInput,
      )
    expect(insertionResult.status).toBe("prepared")

    const rebalance = prepareMixedDeletionCandidate(128, 28)
    if (rebalance.sidecars.identityRoot == null || rebalance.sidecars.orderRoot == null) {
      throw new Error("guarded height-two roots missing")
    }
    const rebalanceUnownedReads: string[] = []
    activeMeter = rebalance.meter
    const rebalanceResult = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
      identityRoot: guardPhysicalEntryArrayReads({
        root: rebalance.sidecars.identityRoot,
        meter: rebalance.meter,
        unownedReads: rebalanceUnownedReads,
      }),
      orderRoot: guardPhysicalEntryArrayReads({
        root: rebalance.sidecars.orderRoot,
        meter: rebalance.meter,
        unownedReads: rebalanceUnownedReads,
      }),
      removedItems: guardInputArray({
        values: rebalance.record.removedItems,
        label: "removedItems",
        meter: rebalance.meter,
        unownedReads: rebalanceUnownedReads,
      }),
      nextPhysicalItems: guardInputArray({
        values: rebalance.record.nextPhysicalItems,
        label: "nextPhysicalItems",
        meter: rebalance.meter,
        unownedReads: rebalanceUnownedReads,
      }),
      workMeter: rebalance.meter,
    })
    expect(rebalanceResult.status).toBe("prepared")

    const singleton = preparePlanASourceCandidate({ nextItemCount: 1 })
    if (singleton.sidecars.identityRoot == null || singleton.sidecars.orderRoot == null) {
      throw new Error("guarded singleton roots missing")
    }
    activeMeter = singleton.meter
    const singletonResult = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
      identityRoot: singleton.sidecars.identityRoot,
      orderRoot: singleton.sidecars.orderRoot,
      removedItems: singleton.record.removedItems,
      nextPhysicalItems: singleton.record.nextPhysicalItems,
      workMeter: singleton.meter,
    })
    expect(singletonResult.status).toBe("prepared")
    expect({
      insertion: insertionUnownedReads,
      rebalance: rebalanceUnownedReads,
    }).toEqual({ insertion: [], rebalance: [] })
    expect(localUnownedReads).toEqual([])
    expect(new Set(localObservedReads.map((label) => label.split(":")[0]))).toEqual(
      new Set([
        "combine-groups",
        "combine-group",
        "identity-leaf-entries",
        "identity-leaf-snapshots",
        "order-leaf-entries",
        "order-leaf-snapshots",
         "identity-insertion-entries",
         "order-insertion-entries",
         "identity-deletion-entries",
         "order-deletion-entries",
         "identity-singleton-entries",
         "order-singleton-entries",
         "coordinator-next-items",
         "coordinator-original-removed-entries",
         "coordinator-removed-entries",
         "coordinator-new-entries",
       ]),
     )
    expect(localMutationEvents.length).toBeGreaterThan(0)
    for (const kind of [
      "identity-deletion-entries",
      "order-deletion-entries",
      "identity-singleton-entries",
      "order-singleton-entries",
      "coordinator-next-items",
      "coordinator-original-removed-entries",
      "coordinator-removed-entries",
      "coordinator-new-entries",
    ]) expect(localMutationEvents, kind).toContain(`${kind}:emit`)
    expect(localMutationEvents).toContain("coordinator-new-entries:freeze")
    if (singletonResult.status === "prepared") {
      expect(rawArraysByKind.get("coordinator-new-entries"))
        .toContain(singletonResult.newEntries)
    }
    } finally {
      activeMeter = null
      expect(removeVNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewForTestInternalV1(
        localReadViewRegistration,
      )).toBe(true)
    }
  }, 60_000)

  it("owns physical rebalance payload and key reads before observation", () => {
    const candidate = prepareMixedDeletionCandidate(128, 28)
    const retainedEntry = candidate.previousEntries.at(-1)
    if (retainedEntry == null) throw new Error("retained physical entry missing")
    if (candidate.sidecars.identityRoot == null || candidate.sidecars.orderRoot == null) {
      throw new Error("guarded physical roots missing")
    }
    const unownedReads: string[] = []
    const cache = {
      nodes: new WeakMap<object, object>(),
      entries: new WeakMap<object, object>(),
      physicalReadViews: [] as Array<Parameters<
        typeof registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1
      >[0]>,
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
    for (const registration of cache.physicalReadViews) {
      expect(removeVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1(
        registration,
      )).toBe(true)
    }
    expect(result.status).toBe("prepared")
    expect(unownedReads).toEqual([])
    if (result.status !== "prepared") return
    expect(inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
      result.orderRoot,
    ).entries).toContain(retainedEntry)
  }, 60_000)

  it("begins source-index-entries before physical entry slots and payload", () => {
    // Catches using a comparison permit to obtain an entry reference or payload.
    const candidate = preparePlanASourceCandidate({
      nextItemCount: 1,
      sourceLimits: { sourceIndexEntries: 0 },
    })
    if (candidate.sidecars.identityRoot == null || candidate.sidecars.orderRoot == null) {
      throw new Error("physical entry guard roots missing")
    }
    const unownedReads: string[] = []
    const cache = {
      nodes: new WeakMap<object, object>(),
      entries: new WeakMap<object, object>(),
      physicalReadViews: [] as Array<Parameters<
        typeof registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1
      >[0]>,
    }
    const result = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
      identityRoot: guardPhysicalEntryPayloadReads({
        root: candidate.sidecars.identityRoot,
        meter: candidate.meter,
        unownedReads,
        cache,
      }),
      orderRoot: guardPhysicalEntryPayloadReads({
        root: candidate.sidecars.orderRoot,
        meter: candidate.meter,
        unownedReads,
        cache,
      }),
      removedItems: candidate.record.removedItems,
      nextPhysicalItems: candidate.record.nextPhysicalItems,
      workMeter: candidate.meter,
    })
    for (const registration of cache.physicalReadViews) {
      expect(removeVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1(
        registration,
      )).toBe(true)
    }
    expect(result.status).toBe("work-limit")
    expect(unownedReads).toEqual([])

    const accepted = preparePlanASourceCandidate({ nextItemCount: 1 })
    if (accepted.sidecars.identityRoot == null || accepted.sidecars.orderRoot == null) {
      throw new Error("accepted physical entry guard roots missing")
    }
    const acceptedUnownedReads: string[] = []
    const acceptedCache = {
      nodes: new WeakMap<object, object>(),
      entries: new WeakMap<object, object>(),
      physicalReadViews: [] as Array<Parameters<
        typeof registerVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1
      >[0]>,
    }
    const acceptedResult = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
      identityRoot: guardPhysicalEntryPayloadReads({
        root: accepted.sidecars.identityRoot,
        meter: accepted.meter,
        unownedReads: acceptedUnownedReads,
        cache: acceptedCache,
      }),
      orderRoot: guardPhysicalEntryPayloadReads({
        root: accepted.sidecars.orderRoot,
        meter: accepted.meter,
        unownedReads: acceptedUnownedReads,
        cache: acceptedCache,
      }),
      removedItems: accepted.record.removedItems,
      nextPhysicalItems: accepted.record.nextPhysicalItems,
      workMeter: accepted.meter,
    })
    for (const registration of acceptedCache.physicalReadViews) {
      expect(removeVNextTextBlockUnifiedLayoutSourcePhysicalEntryReadViewForTestInternalV1(
        registration,
      )).toBe(true)
    }
    expect(acceptedResult.status).toBe("prepared")
    expect(acceptedUnownedReads).toEqual([])
  })

  it("retains the exact mapped entry when an insertion reuses its Source item", () => {
    // Catches overwriting an existing item→entry pair by removing and recreating
    // an exact Source item that remains in the replacement output.
    const candidate = prepareMixedSingleItemEditCandidate(4, "insertion")
    const retainedEntry = candidate.previousEntries[4]
    if (retainedEntry == null) throw new Error("retained physical entry missing")
    const result = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
      identityRoot: candidate.sidecars.identityRoot,
      orderRoot: candidate.sidecars.orderRoot,
      removedItems: candidate.record.removedItems,
      nextPhysicalItems: candidate.record.nextPhysicalItems,
      workMeter: candidate.meter,
    })
    expect(result.status).toBe("prepared")
    if (result.status !== "prepared") return
    expect(result.newEntries.some((entry) => entry.item === retainedEntry.item))
      .toBe(false)
    expect(inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
      result.orderRoot,
    ).entries).toContain(retainedEntry)
  })

  it("does not leak complete item→entry pairs when sidecar access precondition fails", () => {
    // Catches publishing exact pairs before the last fallible complete-sidecar
    // access precondition has succeeded.
    const root = registered5B2RootFixture({ content: "text-only", text: "pair leak" })
    const composition = planAFor(root)
    const prepared = prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      sourceState: root.sourceState,
    })
    if (prepared.status !== "prepared") throw new Error("pair leak candidate blocked")
    expect(registerVNextTextBlockUnifiedLayoutSourcePlanASidecarAccessInternalV1({
      sourceState: root.sourceState,
      resolveStyle: () => { throw new Error("occupied sidecar access invoked") },
      visitItemByInlineId: () => Object.freeze({
        status: "not-found" as const,
        item: null,
        absoluteStartRenderedUtf16: null,
        absoluteEndRenderedUtf16: null,
        visitedNodeCount: 0,
        completeTreeTraversalCount: 0 as const,
      }),
      checkInlineIdConflict: () => Object.freeze({
        status: "checked" as const,
        conflict: false,
      }),
    })).toBe(true)
    expect(registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      root,
      composition,
      candidateAuthority: prepared.candidateAuthority,
    })).toBe(false)
    const entry = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
      prepared.sidecars.orderRoot,
    ).entries[0]
    if (entry == null) throw new Error("pair leak entry missing")
    const meter = openPlanAMeter({ label: "failed-complete-pair-leak" }).meter
    expect(pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
      identityRoot: prepared.sidecars.identityRoot,
      orderRoot: prepared.sidecars.orderRoot,
      removedItems: Object.freeze([entry.item]),
      nextPhysicalItems: Object.freeze([]),
      workMeter: meter,
    }).status).toBe("blocked")
  })

  it("requires the located root entry to be the exact mapped entry", () => {
    // Catches accepting a cloned entry with the mapped item's key and payload.
    const root = registered5B2RootFixture({ content: "text-only", text: "exact entry" })
    const composition = planAFor(root)
    const prepared = prepareVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      sourceState: root.sourceState,
    })
    if (prepared.status !== "prepared") throw new Error("exact entry candidate blocked")
    expect(registerVNextTextBlockUnifiedLayoutSourceSidecarsCompleteInternalV1({
      root,
      composition,
      candidateAuthority: prepared.candidateAuthority,
    })).toBe(true)
    const mapped = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
      prepared.sidecars.orderRoot,
    ).entries[0]
    if (
      mapped == null
      || prepared.sidecars.identityRoot?.nodeKind !== "leaf"
      || prepared.sidecars.orderRoot?.nodeKind !== "leaf"
    ) throw new Error("exact entry leaf fixture missing")
    const clone = Object.freeze({ ...mapped })
    const identityRoot = Object.freeze({
      ...prepared.sidecars.identityRoot,
      entries: Object.freeze([clone]),
    })
    const orderRoot = Object.freeze({
      ...prepared.sidecars.orderRoot,
      entries: Object.freeze([clone]),
      firstEntry: clone,
      lastEntry: clone,
    })
    const meter = openPlanAMeter({ label: "cloned-mapped-entry" }).meter
    expect(pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
      identityRoot,
      orderRoot,
      removedItems: Object.freeze([mapped.item]),
      nextPhysicalItems: Object.freeze([]),
      workMeter: meter,
    }).status).toBe("blocked")
  })

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

  it.each(["insertion", "replacement"] as const)(
    "bounds same-inline text conflict lookup during %s",
    (mode) => {
      // Catches enumerating every legal text fragment merely to decide whether
      // one new text item conflicts with an existing atomic identity.
      const fragmentCount = 128
      const sourceState = sameInlineTextFragmentSource(fragmentCount)
      const completeCandidate = prepare(sourceState)
      const complete = completeCandidate.sidecars
      const entries = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
        complete.orderRoot,
      ).entries
      expect(activateVNextTextBlockUnifiedLayoutSourceSidecarsCompletePhysicalPairsForTestInternalV1({
        sourceState,
        sidecars: complete,
        candidateAuthority: completeCandidate.candidateAuthority,
      })).toBe(true)
      const existing = entries[Math.floor(entries.length / 2)]?.item
      if (existing?.kind !== "text") throw new Error("same-inline text missing")

      const run = (inlineId: string) => {
        const created = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
          sourceState,
          kind: "text",
          renderedText: "n",
          lineageId: `bounded-${mode}-${inlineId}-lineage`,
          inlineId,
          sourceFingerprint: `bounded-${mode}-${inlineId}-source`,
          provenanceFingerprint: `bounded-${mode}-${inlineId}-provenance`,
          style: existing.style,
        })
        if (created == null) throw new Error("bounded conflict item blocked")
        const meter = openPlanAMeter({ label: `bounded-${mode}-${inlineId}` }).meter
        const result = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
          identityRoot: complete.identityRoot,
          orderRoot: complete.orderRoot,
          removedItems: Object.freeze(mode === "replacement" ? [existing] : []),
          nextPhysicalItems: Object.freeze([created]),
          workMeter: meter,
          ...(mode === "insertion" ? { previousRenderedBoundary: 0 } : {}),
        })
        expect(result.status).toBe("prepared")
        const entriesReceipt =
          inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
            meter,
          )?.find((receipt) => receipt.ownerRow.unit === "source-index-entries")
        return entriesReceipt?.completedWork ?? Number.MAX_SAFE_INTEGER
      }
      const sameInlineWork = run(existing.inlineId)
      const uniqueInlineWork = run(`unique-${mode}-inline`)
      expect(sameInlineWork).toBeLessThanOrEqual(uniqueInlineWork + 32)
    },
    60_000,
  )

  it("resolves one removed same-inline fragment without enumerating all entries", () => {
    // Catches resolving an exact removed item by scanning its complete inlineId range.
    const fragmentCount = 128
    const sourceState = sameInlineTextFragmentSource(fragmentCount)
    const completeCandidate = prepare(sourceState)
    const complete = completeCandidate.sidecars
    const entries = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
      complete.orderRoot,
    ).entries
    expect(activateVNextTextBlockUnifiedLayoutSourceSidecarsCompletePhysicalPairsForTestInternalV1({
      sourceState,
      sidecars: complete,
      candidateAuthority: completeCandidate.candidateAuthority,
    })).toBe(true)
    const removed = entries[64]?.item
    if (removed == null) throw new Error("same-inline removal item missing")
    const meter = openPlanAMeter({ label: "same-inline-exact-removal" }).meter
    const result = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
      identityRoot: complete.identityRoot,
      orderRoot: complete.orderRoot,
      removedItems: Object.freeze([removed]),
      nextPhysicalItems: Object.freeze([]),
      workMeter: meter,
    })
    expect(result.status).toBe("prepared")
    const clonedItemMeter = openPlanAMeter({ label: "same-inline-cloned-item" }).meter
    const clonedItem = Object.freeze({ ...removed }) as typeof removed
    expect(pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
      identityRoot: complete.identityRoot,
      orderRoot: complete.orderRoot,
      removedItems: Object.freeze([clonedItem]),
      nextPhysicalItems: Object.freeze([]),
      workMeter: clonedItemMeter,
    }).status).toBe("blocked")
    const entryReceipt =
      inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
        meter,
      )?.find((receipt) => receipt.ownerRow.unit === "source-index-entries")

    const controlSourceState = textSource(fragmentCount)
    const controlCandidate = prepare(controlSourceState)
    const control = controlCandidate.sidecars
    expect(activateVNextTextBlockUnifiedLayoutSourceSidecarsCompletePhysicalPairsForTestInternalV1({
      sourceState: controlSourceState,
      sidecars: control,
      candidateAuthority: controlCandidate.candidateAuthority,
    })).toBe(true)
    const controlRemoved = inspectVNextTextBlockUnifiedLayoutSourceOrderTreeInternalV1(
      control.orderRoot,
    ).entries[64]?.item
    if (controlRemoved == null) throw new Error("distinct-inline removal item missing")
    const controlMeter = openPlanAMeter({ label: "distinct-inline-exact-removal" }).meter
    expect(pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
      identityRoot: control.identityRoot,
      orderRoot: control.orderRoot,
      removedItems: Object.freeze([controlRemoved]),
      nextPhysicalItems: Object.freeze([]),
      workMeter: controlMeter,
    }).status).toBe("prepared")
    const controlEntryReceipt =
      inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
        controlMeter,
      )?.find((receipt) => receipt.ownerRow.unit === "source-index-entries")
    expect(entryReceipt?.completedWork).toBeLessThanOrEqual(
      (controlEntryReceipt?.completedWork ?? Number.MAX_SAFE_INTEGER) + 32,
    )
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

  it("begins exact style bucket and entry owners before collision payload", () => {
    // Catches reading an entry slot under node ownership or a bucket item under bucket ownership.
    const sourceState = textSource(2, {
      sameEffectiveStyleWithDistinctAuthoredFacts: true,
    })
    const complete =
      prepareVNextTextBlockUnifiedLayoutSourceSidecarsWithForcedStyleCollisionForTestInternalV1({
        sourceState,
      })
    if (complete.status !== "prepared" || complete.sidecars.styleRoot == null) {
      throw new Error("guarded collision fixture blocked")
    }
    const items = sourceState.root.nodeKind === "leaf"
      ? sourceState.root.items
      : sourceState.root.children.flatMap((child) =>
          child.nodeKind === "leaf" ? child.items : [],
        )
    const removed = items[0]
    if (removed?.kind !== "text") throw new Error("guarded collision text missing")
    const nextStyle = Object.freeze({
      ...removed.style,
      textColor: "ABCDEF",
      authoredLocalStyle: Object.freeze({
        ...(removed.style.authoredLocalStyle ?? {}),
        textColor: "ABCDEF",
      }),
    })
    const nextItem = Object.freeze({ ...removed, style: nextStyle })
    const run = (
      sourceLimits: NonNullable<
        Parameters<typeof admitted5B2PlanARootFixture>[0]
      >["sourceLimits"],
    ) => {
      const meter = openPlanAMeter({ sourceLimits }).meter
      const unownedReads: string[] = []
      const result = pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsWithForcedFingerprintCollisionForTestInternalV1({
        root: guardStyleBucketPayloadReads({
          root: complete.sidecars.styleRoot!,
          meter,
          unownedReads,
        }),
        removedItems: guardStyleInputItemReads({
          items: Object.freeze([removed]),
          meter,
          unownedReads,
        }),
        nextPhysicalItems: guardStyleInputItemReads({
          items: Object.freeze([nextItem]),
          meter,
          unownedReads,
        }),
        workMeter: meter,
      })
      return { result, unownedReads }
    }
    const accepted = run({})
    expect(accepted.result.status).toBe("prepared")
    expect(accepted.unownedReads).toEqual([])
    const entryZero = run({ sourceStyleEntries: 0 })
    expect(entryZero.result.status).toBe("work-limit")
    expect(entryZero.unownedReads).toEqual([])
    const bucketZero = run({ sourceStyleBuckets: 0 })
    expect(bucketZero.result.status).toBe("work-limit")
    expect(bucketZero.unownedReads).toEqual([])
  })

  it("owns style entry arrays through accepted height-two rebalance", () => {
    const sourceState = textSource(1)
    if (sourceState.root.nodeKind !== "leaf") throw new Error("style fixture leaf missing")
    const base = sourceState.root.items[0]
    if (base?.kind !== "text") throw new Error("style fixture text missing")
    const items = Array.from({ length: 129 }, (_, index) => {
      const suffix = index.toString().padStart(3, "0")
      return Object.freeze({
        ...base,
        inlineId: `style-rebalance-inline-${suffix}`,
        lineageId: `style-rebalance-lineage-${suffix}`,
        style: Object.freeze({
          ...base.style,
          measurementStyleKey: `style-rebalance-measurement-${suffix}`,
          effectiveShapingStyleKey: `style-rebalance-shaping-${suffix}`,
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
    if (
      styleRoot?.nodeKind !== "branch"
      || !styleRoot.children.some((child) => child.nodeKind === "branch")
    ) throw new Error("height-two style fixture missing")
    let activeMeter: VNextTextBlockUnifiedLayout5B2CandidateWorkMeterInternalV1 | null = null
    const localObservedReads: string[] = []
    const localUnownedReads: string[] = []
    const localMutationEvents: string[] = []
    const localReadViewRegistration = Object.freeze({
      authority: Object.freeze({}),
      createReadView(input: Readonly<{
        readonly kind: Parameters<Parameters<
          typeof registerVNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewForTestInternalV1
        >[0]["createReadView"]>[0]["kind"]
        readonly raw: readonly object[]
      }>): readonly object[] {
        const record = (
          property: PropertyKey,
          suffix = "",
          forcedUnit?: "source-style-buckets" | "source-style-entries",
        ): void => {
          if (
            property !== "length"
            && property !== Symbol.iterator
            && property !== "slice"
            && property !== "push"
            && property !== "preventExtensions"
            && property !== "set"
            && property !== "defineProperty"
            && !(typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
            && suffix === ""
          ) return
          const label = `${input.kind}:${suffix || String(property)}`
          localObservedReads.push(label)
          const bucketLength = (
            input.kind === "style-singleton-bucket-items"
            || input.kind === "style-entry-bucket-items"
          ) && property === "length"
          const expectedUnit = forcedUnit ?? (bucketLength
            ? "source-style-buckets"
            : "source-style-entries")
          if (
            activeMeter == null
            || !hasOpenExactSourcePermit(activeMeter, expectedUnit)
          ) localUnownedReads.push(label)
        }
        const wrapPart = (part: object): object => new Proxy(part, {
          get(target, property, receiver) {
            if (property === "entries" || property === "start" || property === "end") {
              record(property, `part.${String(property)}`)
            }
            return Reflect.get(target, property, receiver)
          },
        })
        return new Proxy(input.raw, {
          get(target, property, receiver) {
            record(property)
            if (
              input.kind === "style-rebalance-entry-parts"
              && property === Symbol.iterator
            ) {
              return function* readParts(): IterableIterator<object> {
                for (const part of target) yield wrapPart(part)
              }
            }
            const value = Reflect.get(target, property, receiver)
            return input.kind === "style-rebalance-entry-parts"
                && typeof property === "string"
                && /^(0|[1-9]\d*)$/.test(property)
                && value != null
                && typeof value === "object"
              ? wrapPart(value)
              : value
          },
          set(target, property, value, receiver) {
            if (
              property === "length"
              || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
            ) {
              record("set", `set.${String(property)}`, "source-style-entries")
              localMutationEvents.push(`${input.kind}:emit`)
            }
            return Reflect.set(target, property, value, receiver)
          },
          defineProperty(target, property, descriptor) {
            if (
              property === "length"
              || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
            ) {
              record(
                "defineProperty",
                `define.${String(property)}`,
                "source-style-entries",
              )
              localMutationEvents.push(`${input.kind}:emit`)
            }
            return Reflect.defineProperty(target, property, descriptor)
          },
          preventExtensions(target) {
            const expectedUnit = input.kind === "style-singleton-bucket-items"
              ? "source-style-buckets"
              : "source-style-entries"
            record("preventExtensions", "freeze", expectedUnit)
            localMutationEvents.push(`${input.kind}:freeze`)
            return Reflect.preventExtensions(target)
          },
        })
      },
    })
    expect(registerVNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewForTestInternalV1(
      localReadViewRegistration,
    )).toBe(true)
    expect(registerVNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewForTestInternalV1(
      localReadViewRegistration,
    )).toBe(false)
    try {
      const insertionMeter = openPlanAMeter({ label: "style-singleton-local-owner" }).meter
      activeMeter = insertionMeter
      const insertion = pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsInternalV1({
        root: null,
        removedItems: Object.freeze([]),
        nextPhysicalItems: Object.freeze([items[0]!]),
        workMeter: insertionMeter,
      })
      expect(insertion.status).toBe("prepared")
      if (insertion.status !== "prepared") throw new Error("style singleton missing")

      const incrementMeter = openPlanAMeter({ label: "style-local-bucket-owner" }).meter
      activeMeter = incrementMeter
      const increment = pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsInternalV1({
        root: insertion.root,
        removedItems: Object.freeze([]),
        nextPhysicalItems: Object.freeze([items[0]!]),
        workMeter: incrementMeter,
      })
      expect(increment.status).toBe("prepared")

      const meter = openPlanAMeter({ label: "style-height-two-rebalance-owner" }).meter
      const unownedReads: string[] = []
      activeMeter = meter
      const result = pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsInternalV1({
        root: guardStyleBucketPayloadReads({
          root: styleRoot,
          meter,
          unownedReads,
        }),
        removedItems: guardStyleInputItemReads({
          items: Object.freeze([items[0]!]),
          meter,
          unownedReads,
        }),
        nextPhysicalItems: guardStyleInputItemReads({
          items: Object.freeze([]),
          meter,
          unownedReads,
        }),
        workMeter: meter,
      })
      expect({ status: result.status, unownedReads }).toEqual({
        status: "prepared",
        unownedReads: [],
      })
      expect(localUnownedReads).toEqual([])
      expect(new Set(localObservedReads.map((label) => label.split(":")[0]))).toEqual(
        new Set([
          "style-leaf-entries",
          "style-leaf-copied-entries",
          "style-singleton-bucket-items",
          "style-entry-bucket-items",
          "style-created-entry-array",
          "style-adjusted-entries",
          "style-rebalance-entry-parts",
          "style-rebalance-part-entries",
          "style-rebalance-copied-entries",
        ]),
      )
      for (const kind of [
        "style-singleton-bucket-items",
        "style-created-entry-array",
        "style-rebalance-entry-parts",
        "style-rebalance-copied-entries",
      ]) expect(localMutationEvents, kind).toContain(`${kind}:emit`)
      expect(localMutationEvents).toContain("style-singleton-bucket-items:freeze")
      expect(localMutationEvents).toContain("style-leaf-copied-entries:freeze")
      if (result.status !== "prepared") return
      const inspected = inspectVNextTextBlockUnifiedLayoutSourceStyleTreeInternalV1(result.root)
      expect(inspected).toMatchObject({
        styleKeyCount: 128,
        exactStyleCount: 128,
        totalRefcount: 128,
      })
      expect(inspected.leafOccupancies.every((count) => count >= 4 && count <= 8)).toBe(true)
    } finally {
      activeMeter = null
      expect(removeVNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewForTestInternalV1(
        localReadViewRegistration,
      )).toBe(true)
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

  it("routes the real Source leaf slot read through its exact hostile read view", () => {
    const foundation = openPlanAMeter({ label: "source-leaf-read-view-red" })
    const previousSourceState = foundation.root.sourceState
    if (previousSourceState.root.nodeKind !== "leaf") {
      throw new Error("hostile Source leaf missing")
    }
    const previous = previousSourceState.root.items[0]
    if (previous?.kind !== "text") throw new Error("hostile Source text missing")
    const next = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
      sourceState: previousSourceState,
      kind: "text",
      renderedText: "Z",
      lineageId: "hostile-source-leaf-lineage",
      inlineId: "hostile-source-leaf-inline",
      sourceFingerprint: "hostile-source-leaf-source",
      provenanceFingerprint: "hostile-source-leaf-provenance",
      style: previous.style,
    })
    if (next == null) throw new Error("hostile Source replacement blocked")
    const previousRange = Object.freeze({
      startRenderedUtf16: 0,
      endRenderedUtf16: previous.renderedUtf16Length,
    })
    const nextItems = Object.freeze([next])
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
        nextItems: [next.fingerprint],
      })),
    })
    if (!registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
      previousSourceState,
      replacement,
      change: foundation.change,
    })) throw new Error("hostile Source replacement registration blocked")
    let observedLeafSlots = 0
    const rawItems = previousSourceState.root.items
    const readView = new Proxy(rawItems, {
      get(target, property, receiver) {
        if (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property)) {
          if (!hasOpenExactSourcePermit(foundation.meter, "source-leaf-slots")) {
            throw new Error("Source leaf slot was read outside its exact permit")
          }
          observedLeafSlots += 1
        }
        return Reflect.get(target, property, receiver)
      },
    })
    expect(registerVNextTextBlockSourceRangePathCopyReadViewForTestInternalV1({
      payload: rawItems,
      readView,
    })).toBe(true)
    expect(registerVNextTextBlockSourceRangePathCopyReadViewForTestInternalV1({
      payload: rawItems,
      readView: new Proxy(rawItems, {}),
    })).toBe(false)
    expect(removeVNextTextBlockSourceRangePathCopyReadViewForTestInternalV1({
      payload: rawItems,
      readView: new Proxy(rawItems, {}),
    })).toBe(false)
    let pendingPermit: VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1 | null = null
    let result: ReturnType<
      typeof prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1
    >
    try {
      result = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
        previousSourceState,
        replacement,
        beforeVisit(unit) {
          if (pendingPermit != null) {
            if (!completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(pendingPermit)) {
              throw new Error("hostile Source permit completion blocked")
            }
            pendingPermit = null
          }
          const exactUnit = unit === "source-items"
            ? "source-items" as const
            : unit === "source-lookup-nodes"
              ? "source-tree-lookup-nodes" as const
              : unit === "source-path-copy-nodes"
                ? "source-tree-path-copy-nodes" as const
                : "source-leaf-slots" as const
          const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
            meter: foundation.meter,
            unit: exactUnit,
          })
          if (begun.status !== "permitted") return false
          pendingPermit = begun.permit
          return true
        },
      })
      if (result.status === "prepared" && pendingPermit != null) {
        expect(completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(pendingPermit))
          .toBe(true)
        pendingPermit = null
      }
    } finally {
      expect(removeVNextTextBlockSourceRangePathCopyReadViewForTestInternalV1({
        payload: rawItems,
        readView,
      })).toBe(true)
    }
    expect(result.status).toBe("prepared")
    expect(observedLeafSlots).toBe(1)
    if (result.status === "prepared") {
      expect(discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
        result.pathCopyCandidateAuthority,
      )).toBe(true)
    }
  })

  it("enforces real hostile 0/N-1/N/N+1 paths for all ten Source rows", () => {
    type ThresholdRow = Readonly<{
      unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1
      limitKey: keyof typeof sourceLimits
      owner: "source" | "sidecar"
    }>
    const rows = [
      { unit: "source-items", limitKey: "sourceItems", owner: "source" },
      {
        unit: "source-tree-lookup-nodes",
        limitKey: "sourceTreeLookupNodes",
        owner: "source",
      },
      {
        unit: "source-tree-path-copy-nodes",
        limitKey: "sourceTreePathCopyNodes",
        owner: "source",
      },
      { unit: "source-leaf-slots", limitKey: "sourceLeafSlots", owner: "source" },
      { unit: "source-index-nodes", limitKey: "sourceIndexNodes", owner: "sidecar" },
      { unit: "source-index-entries", limitKey: "sourceIndexEntries", owner: "sidecar" },
      {
        unit: "source-index-comparisons",
        limitKey: "sourceIndexComparisons",
        owner: "sidecar",
      },
      { unit: "source-style-nodes", limitKey: "sourceStyleNodes", owner: "sidecar" },
      {
        unit: "source-style-buckets",
        limitKey: "sourceStyleBuckets",
        owner: "sidecar",
      },
      { unit: "source-style-entries", limitKey: "sourceStyleEntries", owner: "sidecar" },
    ] as const satisfies readonly ThresholdRow[]

    const sourceRun = (row: ThresholdRow, limit: number) => {
      const foundation = openPlanAMeter({
        label: `${row.unit}-${limit}`,
        sourceLimits: { [row.limitKey]: limit },
      })
      const previousSourceState = foundation.root.sourceState
      if (previousSourceState.root.nodeKind !== "leaf") {
        throw new Error("threshold Source leaf missing")
      }
      const previous = previousSourceState.root.items[0]
      if (previous?.kind !== "text") throw new Error("threshold text missing")
      const unownedPayloads: string[] = []
      let hostileObservedCount = 0
      const noteHostile = (label: string): void => {
        if (!hasOpenExactSourcePermit(foundation.meter, row.unit)) {
          unownedPayloads.push(label)
        }
        hostileObservedCount += 1
      }
      const rawNext = createVNextTextBlockTransitionReplacementSourceItemInternalV1({
        sourceState: previousSourceState,
        kind: "text",
        renderedText: "X",
        lineageId: `threshold-${row.unit}-lineage`,
        inlineId: previous.inlineId,
        sourceFingerprint: `threshold-${row.unit}-source`,
        provenanceFingerprint: `threshold-${row.unit}-provenance`,
        style: previous.style,
      })
      if (rawNext == null) throw new Error("threshold item blocked")
      const next = row.unit !== "source-tree-path-copy-nodes"
        ? rawNext
        : new Proxy(rawNext, {
            get(target, property, receiver) {
              if (
                property === "renderedUtf16Length"
                || property === "fingerprint"
                || property === "contentFingerprint"
                || property === "sourceFingerprint"
                || property === "provenanceFingerprint"
              ) noteHostile(`next-item:${String(property)}`)
              return Reflect.get(target, property, receiver)
            },
          })
      const rawNextItems = Object.freeze([next])
      const nextItems = row.unit !== "source-items"
        ? rawNextItems
        : new Proxy(rawNextItems, {
            get(target, property, receiver) {
              if (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property)) {
                noteHostile(`next-items:${property}`)
              }
              return Reflect.get(target, property, receiver)
            },
          })
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
          nextItems: [rawNext.fingerprint],
        })),
      })
      if (!registerVNextTextBlockUnifiedLayoutSourceRangeReplacementInternalV1({
        previousSourceState,
        replacement,
        change: foundation.change,
      })) throw new Error("threshold replacement registration blocked")

      const registeredReadViews: { readonly payload: object; readonly readView: object }[] = []
      const registerReadView = (payload: object, readView: object): void => {
        if (!registerVNextTextBlockSourceRangePathCopyReadViewForTestInternalV1({
          payload,
          readView,
        })) throw new Error(`${row.unit} hostile read-view registration blocked`)
        registeredReadViews.push({ payload, readView })
      }
      if (row.unit === "source-tree-lookup-nodes") {
        registerReadView(previousRange, new Proxy(previousRange, {
          get(target, property, receiver) {
            if (property === "startRenderedUtf16" || property === "endRenderedUtf16") {
              noteHostile(`range:${String(property)}`)
            }
            return Reflect.get(target, property, receiver)
          },
        }))
        const rawLeaf = previousSourceState.root
        registerReadView(rawLeaf, new Proxy(rawLeaf, {
          get(target, property, receiver) {
            if (
              property === "nodeKind"
              || property === "summary"
              || property === "items"
            ) {
              noteHostile(`leaf:${String(property)}`)
            }
            return Reflect.get(target, property, receiver)
          },
        }))
      } else if (row.unit === "source-leaf-slots") {
        const rawLeafItems = previousSourceState.root.items
        registerReadView(rawLeafItems, new Proxy(rawLeafItems, {
          get(target, property, receiver) {
            if (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property)) {
              noteHostile(`leaf-slot:${property}`)
            }
            return Reflect.get(target, property, receiver)
          },
        }))
      }

      let pendingPermit: VNextTextBlockUnifiedLayout5B2WorkPermitInternalV1 | null = null
      let factualOperationCount = 0
      setVNextTextBlockSourceRangePathCopyPayloadObserverForTestInternalV1(
        (unit) => {
          if (unit !== row.unit) return
          factualOperationCount += 1
        },
      )
      let result: ReturnType<
        typeof prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1
      >
      try {
        result = prepareVNextTextBlockUnifiedLayoutSourceRangePathCopyInternalV1({
          previousSourceState,
          replacement,
          beforeVisit(unit) {
            if (pendingPermit != null) {
              if (!completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
                pendingPermit,
              )) throw new Error("threshold Source permit completion blocked")
              pendingPermit = null
            }
            const exactUnit = unit === "source-items"
              ? "source-items" as const
              : unit === "source-lookup-nodes"
                ? "source-tree-lookup-nodes" as const
                : unit === "source-path-copy-nodes"
                  ? "source-tree-path-copy-nodes" as const
                  : "source-leaf-slots" as const
            const begun = beginVNextTextBlockUnifiedLayout5B2OperationInternalV1({
              meter: foundation.meter,
              unit: exactUnit,
            })
            if (begun.status !== "permitted") return false
            pendingPermit = begun.permit
            return true
          },
        })
        if (result.status === "prepared" && pendingPermit != null) {
          if (!completeVNextTextBlockUnifiedLayout5B2OperationInternalV1(
            pendingPermit,
          )) throw new Error("threshold final Source permit completion blocked")
          pendingPermit = null
        }
      } finally {
        setVNextTextBlockSourceRangePathCopyPayloadObserverForTestInternalV1(null)
        for (const registered of registeredReadViews) {
          if (!removeVNextTextBlockSourceRangePathCopyReadViewForTestInternalV1(registered)) {
            throw new Error(`${row.unit} hostile read-view removal blocked`)
          }
        }
      }
      const receipt =
        inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
          foundation.meter,
        )?.find((candidate) => candidate.ownerRow.unit === row.unit)
      if (receipt == null) throw new Error(`${row.unit} Source receipt missing`)
      const candidateFreeOnLimit = result.status === "prepared"
        ? true
        : !("pathCopyCandidateAuthority" in result)
      const cleaned = result.status === "prepared"
        ? discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
            result.pathCopyCandidateAuthority,
          )
        : true
      return {
        status: result.status,
        receipt,
        factualOperationCount,
        hostileObservedCount,
        localFactoryInvocationCount: 0,
        localMutationEventCount: 0,
        localRowMutationEventCount: 0,
        unownedPayloads,
        candidateFreeOnLimit,
        cleaned,
      }
    }

    const sidecarRun = (row: ThresholdRow, limit: number) => {
      const limits = { ...sourceLimits, [row.limitKey]: limit }
      const candidate = row.unit === "source-index-comparisons"
        ? prepareMixedPrefixCandidate(9, limits)
        : preparePlanASourceCandidate({
            nextItemCount: 1,
            sourceLimits: limits,
            useDistinctNextStyle: row.unit.startsWith("source-style-"),
          })
      const unownedPayloads: string[] = []
      const hostilePayloads: string[] = []
      const localFactoryInvocations: string[] = []
      const localMutationEvents: string[] = []
      const localObservedUnits: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1[] = []
      const localMutationUnits: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1[] = []
      const note = (label: string): void => {
        hostilePayloads.push(label)
        if (!hasOpenExactSourcePermit(candidate.meter, row.unit)) {
          unownedPayloads.push(label)
        }
      }
      const guardInput = (
        values: readonly VNextTextBlockUnifiedLayoutSourceItemV1[],
        label: string,
      ): readonly VNextTextBlockUnifiedLayoutSourceItemV1[] => new Proxy(values, {
        get(target, property, receiver) {
          if (
            property === "length"
            || property === Symbol.iterator
            || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
          ) note(`${label}:${String(property)}`)
          return Reflect.get(target, property, receiver)
        },
      })
      const guardPhysicalTree = <T extends
        | VNextTextBlockUnifiedLayoutSourceIdentityIndexNodeInternalV1
        | VNextTextBlockUnifiedLayoutSourceOrderIndexNodeInternalV1
      >(root: T): T => {
        const nodeCache = new WeakMap<object, object>()
        const keyCache = new WeakMap<object, object>()
        const wrapKey = (key: object): object => {
          const cached = keyCache.get(key)
          if (cached != null) return cached
          const view = new Proxy(key, {
            get(target, property, receiver) {
              if (
                property === "inlineId"
                || property === "kindOrdinal"
                || property === "positionKey"
              ) note(`comparison-key:${String(property)}`)
              return Reflect.get(target, property, receiver)
            },
          })
          keyCache.set(key, view)
          return view
        }
        const wrapNode = (node: object): object => {
          const cached = nodeCache.get(node)
          if (cached != null) return cached
          const raw = { ...node } as Record<PropertyKey, unknown>
          if (row.unit === "source-index-comparisons") {
            if (raw.firstKey != null && typeof raw.firstKey === "object") {
              raw.firstKey = wrapKey(raw.firstKey)
            }
            if (raw.lastKey != null && typeof raw.lastKey === "object") {
              raw.lastKey = wrapKey(raw.lastKey)
            }
          }
          if (Array.isArray(raw.children)) {
            const children = Object.freeze(raw.children.map((child) => wrapNode(child)))
            raw.children = row.unit !== "source-index-nodes"
              ? children
              : new Proxy(children, {
                  get(target, property, receiver) {
                    if (
                      property === "length"
                      || property === Symbol.iterator
                      || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
                    ) note(`children:${String(property)}`)
                    return Reflect.get(target, property, receiver)
                  },
                })
          }
          const view = new Proxy(raw, {
            get(target, property, receiver) {
              if (
                row.unit === "source-index-nodes"
                && (property === "nodeKind" || property === "children")
              ) note(`node:${String(property)}`)
              return Reflect.get(target, property, receiver)
            },
          })
          nodeCache.set(node, view)
          return view
        }
        return wrapNode(root) as T
      }

      const physicalLocalReadViewRegistration = row.unit.startsWith("source-index-")
        ? Object.freeze({
            authority: Object.freeze({}),
            createReadView(input: Readonly<{
              readonly kind: Parameters<Parameters<
                typeof registerVNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewForTestInternalV1
              >[0]["createReadView"]>[0]["kind"]
              readonly raw: readonly object[]
            }>): readonly object[] {
              localFactoryInvocations.push(input.kind)
              const record = (event: string, mutation = false): void => {
                const label = `local:${input.kind}:${event}`
                hostilePayloads.push(label)
                localObservedUnits.push("source-index-entries")
                if (mutation) {
                  localMutationEvents.push(label)
                  localMutationUnits.push("source-index-entries")
                }
                if (!hasOpenExactSourcePermit(candidate.meter, "source-index-entries")) {
                  unownedPayloads.push(label)
                }
              }
              return new Proxy(input.raw, {
                get(target, property, receiver) {
                  if (
                    property === "length"
                    || property === Symbol.iterator
                    || property === "map"
                    || property === "reduce"
                    || property === "push"
                    || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
                  ) record(`get.${String(property)}`)
                  return Reflect.get(target, property, receiver)
                },
                set(target, property, value, receiver) {
                  if (
                    property === "length"
                    || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
                  ) record(`set.${String(property)}`, true)
                  return Reflect.set(target, property, value, receiver)
                },
                defineProperty(target, property, descriptor) {
                  if (
                    property === "length"
                    || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
                  ) record(`define.${String(property)}`, true)
                  return Reflect.defineProperty(target, property, descriptor)
                },
                preventExtensions(target) {
                  record("freeze", true)
                  return Reflect.preventExtensions(target)
                },
              })
            },
          })
        : null
      const styleLocalReadViewRegistration = row.unit.startsWith("source-style-")
        ? Object.freeze({
            authority: Object.freeze({}),
            createReadView(input: Readonly<{
              readonly kind: Parameters<Parameters<
                typeof registerVNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewForTestInternalV1
              >[0]["createReadView"]>[0]["kind"]
              readonly raw: readonly object[]
            }>): readonly object[] {
              localFactoryInvocations.push(input.kind)
              const record = (
                event: string,
                unit: "source-style-buckets" | "source-style-entries",
                mutation = false,
              ): void => {
                const label = `local:${input.kind}:${event}`
                hostilePayloads.push(label)
                localObservedUnits.push(unit)
                if (mutation) {
                  localMutationEvents.push(label)
                  localMutationUnits.push(unit)
                }
                if (!hasOpenExactSourcePermit(candidate.meter, unit)) {
                  unownedPayloads.push(label)
                }
              }
              const expectedUnitForRead = (property: PropertyKey) => (
                (
                  input.kind === "style-singleton-bucket-items"
                  || input.kind === "style-entry-bucket-items"
                ) && property === "length"
              ) ? "source-style-buckets" as const : "source-style-entries" as const
              const wrapPart = (part: object): object => new Proxy(part, {
                get(target, property, receiver) {
                  if (property === "entries" || property === "start" || property === "end") {
                    record(`part.${String(property)}`, "source-style-entries")
                  }
                  return Reflect.get(target, property, receiver)
                },
              })
              return new Proxy(input.raw, {
                get(target, property, receiver) {
                  if (
                    property === "length"
                    || property === Symbol.iterator
                    || property === "slice"
                    || property === "push"
                    || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
                  ) record(`get.${String(property)}`, expectedUnitForRead(property))
                  if (
                    input.kind === "style-rebalance-entry-parts"
                    && property === Symbol.iterator
                  ) {
                    return function* readParts(): IterableIterator<object> {
                      for (const part of target) yield wrapPart(part)
                    }
                  }
                  const value = Reflect.get(target, property, receiver)
                  return input.kind === "style-rebalance-entry-parts"
                      && typeof property === "string"
                      && /^(0|[1-9]\d*)$/.test(property)
                      && value != null
                      && typeof value === "object"
                    ? wrapPart(value)
                    : value
                },
                set(target, property, value, receiver) {
                  if (
                    property === "length"
                    || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
                  ) record(`set.${String(property)}`, "source-style-entries", true)
                  return Reflect.set(target, property, value, receiver)
                },
                defineProperty(target, property, descriptor) {
                  if (
                    property === "length"
                    || (typeof property === "string" && /^(0|[1-9]\d*)$/.test(property))
                  ) record(`define.${String(property)}`, "source-style-entries", true)
                  return Reflect.defineProperty(target, property, descriptor)
                },
                preventExtensions(target) {
                  const unit = input.kind === "style-singleton-bucket-items"
                    ? "source-style-buckets" as const
                    : "source-style-entries" as const
                  record("freeze", unit, true)
                  return Reflect.preventExtensions(target)
                },
              })
            },
          })
        : null

      let factualOperationCount = 0
      const countOperation = (unit: VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1) => {
        if (unit === row.unit) factualOperationCount += 1
      }
      setVNextTextBlockUnifiedLayoutSourcePhysicalPayloadObserverForTestInternalV1(
        countOperation,
      )
      setVNextTextBlockUnifiedLayoutSourceStylePayloadObserverForTestInternalV1(
        countOperation,
      )
      if (
        physicalLocalReadViewRegistration != null
        && !registerVNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewForTestInternalV1(
          physicalLocalReadViewRegistration,
        )
      ) throw new Error(`${row.unit} physical local read-view registration blocked`)
      if (
        styleLocalReadViewRegistration != null
        && !registerVNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewForTestInternalV1(
          styleLocalReadViewRegistration,
        )
      ) throw new Error(`${row.unit} style local read-view registration blocked`)
      let status: "prepared" | "work-limit" | "blocked" | "key-space-exhausted"
      try {
        if (row.unit.startsWith("source-index-")) {
          if (candidate.sidecars.identityRoot == null || candidate.sidecars.orderRoot == null) {
            throw new Error(`${row.unit} physical roots missing`)
          }
          const identityRoot = row.unit === "source-index-entries"
            ? guardPhysicalEntryArrayReads({
                root: candidate.sidecars.identityRoot,
                meter: candidate.meter,
                unownedReads: unownedPayloads,
                observedReads: hostilePayloads,
              })
            : guardPhysicalTree(candidate.sidecars.identityRoot)
          const orderRoot = row.unit === "source-index-entries"
            ? guardPhysicalEntryArrayReads({
                root: candidate.sidecars.orderRoot,
                meter: candidate.meter,
                unownedReads: unownedPayloads,
                observedReads: hostilePayloads,
              })
            : guardPhysicalTree(candidate.sidecars.orderRoot)
          const result = pathCopyVNextTextBlockUnifiedLayoutSourcePhysicalIndexInternalV1({
            identityRoot,
            orderRoot,
            removedItems: row.unit === "source-index-entries"
              ? guardInput(candidate.record.removedItems, "removed")
              : candidate.record.removedItems,
            nextPhysicalItems: row.unit === "source-index-entries"
              ? guardInput(candidate.record.nextPhysicalItems, "next")
              : candidate.record.nextPhysicalItems,
            workMeter: candidate.meter,
          })
          status = result.status
        } else {
          if (candidate.sidecars.styleRoot == null) {
            throw new Error(`${row.unit} style root missing`)
          }
          const result = pathCopyVNextTextBlockUnifiedLayoutSourceStyleRefcountsInternalV1({
            root: guardStyleBucketPayloadReads({
              root: candidate.sidecars.styleRoot,
              meter: candidate.meter,
              unownedReads: unownedPayloads,
              observedReads: hostilePayloads,
            }),
            removedItems: row.unit === "source-style-entries"
              ? guardInput(candidate.record.removedItems, "removed")
              : candidate.record.removedItems,
            nextPhysicalItems: row.unit === "source-style-entries"
              ? guardInput(candidate.record.nextPhysicalItems, "next")
              : candidate.record.nextPhysicalItems,
            workMeter: candidate.meter,
          })
          status = result.status
        }
      } finally {
        setVNextTextBlockUnifiedLayoutSourcePhysicalPayloadObserverForTestInternalV1(null)
        setVNextTextBlockUnifiedLayoutSourceStylePayloadObserverForTestInternalV1(null)
        if (
          physicalLocalReadViewRegistration != null
          && !removeVNextTextBlockUnifiedLayoutSourcePhysicalLocalArrayReadViewForTestInternalV1(
            physicalLocalReadViewRegistration,
          )
        ) throw new Error(`${row.unit} physical local read-view removal blocked`)
        if (
          styleLocalReadViewRegistration != null
          && !removeVNextTextBlockUnifiedLayoutSourceStyleLocalArrayReadViewForTestInternalV1(
            styleLocalReadViewRegistration,
          )
        ) throw new Error(`${row.unit} style local read-view removal blocked`)
      }
      const receipt =
        inspectVNextTextBlockUnifiedLayout5B2CandidateWorkMeterForTestInternalV1(
          candidate.meter,
        )?.find((candidateReceipt) => candidateReceipt.ownerRow.unit === row.unit)
      if (receipt == null) throw new Error(`${row.unit} sidecar receipt missing`)
      const sourceCleaned = discardVNextTextBlockUnifiedLayoutSourcePathCopyCandidateInternalV1(
        candidate.prepared.pathCopyCandidateAuthority,
      )
      return {
        status,
        receipt,
        factualOperationCount,
        hostileObservedCount: row.unit.startsWith("source-style-")
          ? hostilePayloads.filter((label) => label.startsWith(`${row.unit}:`)).length
            + localObservedUnits.filter((unit) => unit === row.unit).length
          : hostilePayloads.filter((label) => !label.startsWith("local:")).length
            + localObservedUnits.filter((unit) => unit === row.unit).length,
        localFactoryInvocationCount: localFactoryInvocations.length,
        localMutationEventCount: localMutationEvents.length,
        localRowMutationEventCount: localMutationUnits.filter(
          (unit) => unit === row.unit,
        ).length,
        unownedPayloads,
        candidateFreeOnLimit: true,
        cleaned: sourceCleaned,
      }
    }

    const factualNs: Record<string, number> = {}
    for (const row of rows) {
      const run = row.owner === "source" ? sourceRun : sidecarRun
      const baseline = run(row, Number.MAX_SAFE_INTEGER)
      expect(baseline.status, row.unit).toBe("prepared")
      expect(baseline.unownedPayloads, row.unit).toEqual([])
      expect(baseline.cleaned, row.unit).toBe(true)
      const required = baseline.receipt.completedWork
      factualNs[row.unit] = required
      expect(required, row.unit).toBeGreaterThan(0)
      expect(baseline.factualOperationCount, row.unit).toBe(required)
      expect(baseline.hostileObservedCount, row.unit).toBeGreaterThan(0)
      if (row.owner === "sidecar") {
        expect(baseline.localFactoryInvocationCount, row.unit).toBeGreaterThan(0)
        expect(baseline.localMutationEventCount, row.unit).toBeGreaterThan(0)
        if (
          row.unit === "source-index-entries"
          || row.unit === "source-style-buckets"
          || row.unit === "source-style-entries"
        ) expect(baseline.localRowMutationEventCount, row.unit).toBeGreaterThan(0)
      }
      expect(baseline.receipt, row.unit).toMatchObject({
        attemptedWork: required,
        completedWork: required,
      })

      const zero = run(row, 0)
      expect(zero.status, row.unit).toBe(
        row.owner === "source" ? "limit-exceeded" : "work-limit",
      )
      expect(zero.receipt, row.unit).toMatchObject({ attemptedWork: 1, completedWork: 0 })
      expect(zero.factualOperationCount, row.unit).toBe(0)
      expect(zero.hostileObservedCount, row.unit).toBe(0)
      expect(zero.localFactoryInvocationCount, row.unit)
        .toBeLessThanOrEqual(baseline.localFactoryInvocationCount)
      expect(zero.localMutationEventCount, row.unit)
        .toBeLessThanOrEqual(baseline.localMutationEventCount)
      expect(zero.localRowMutationEventCount, row.unit).toBe(0)
      expect(zero.unownedPayloads, row.unit).toEqual([])
      expect(zero.candidateFreeOnLimit, row.unit).toBe(true)
      expect(zero.cleaned, row.unit).toBe(true)

      const minusOne = run(row, required - 1)
      expect(minusOne.status, row.unit).toBe(
        row.owner === "source" ? "limit-exceeded" : "work-limit",
      )
      expect(minusOne.receipt, row.unit).toMatchObject({
        attemptedWork: required,
        completedWork: required - 1,
      })
      expect(minusOne.factualOperationCount, row.unit).toBe(required - 1)
      expect(minusOne.hostileObservedCount, row.unit)
        .toBeLessThanOrEqual(baseline.hostileObservedCount)
      expect(minusOne.localFactoryInvocationCount, row.unit)
        .toBeLessThanOrEqual(baseline.localFactoryInvocationCount)
      expect(minusOne.localMutationEventCount, row.unit)
        .toBeLessThanOrEqual(baseline.localMutationEventCount)
      expect(minusOne.localRowMutationEventCount, row.unit)
        .toBeLessThanOrEqual(baseline.localRowMutationEventCount)
      if (required > 1) {
        expect(minusOne.hostileObservedCount, row.unit).toBeGreaterThan(0)
      }
      expect(minusOne.unownedPayloads, row.unit).toEqual([])
      expect(minusOne.candidateFreeOnLimit, row.unit).toBe(true)
      expect(minusOne.cleaned, row.unit).toBe(true)

      const exact = run(row, required)
      expect(exact.status, row.unit).toBe("prepared")
      expect(exact.receipt, row.unit).toMatchObject({
        attemptedWork: required,
        completedWork: required,
      })
      expect(exact.factualOperationCount, row.unit).toBe(required)
      expect(exact.hostileObservedCount, row.unit).toBe(baseline.hostileObservedCount)
      expect(exact.localFactoryInvocationCount, row.unit)
        .toBe(baseline.localFactoryInvocationCount)
      expect(exact.localMutationEventCount, row.unit)
        .toBe(baseline.localMutationEventCount)
      expect(exact.localRowMutationEventCount, row.unit)
        .toBe(baseline.localRowMutationEventCount)
      expect(exact.unownedPayloads, row.unit).toEqual([])
      expect(exact.cleaned, row.unit).toBe(true)

      const plusOne = run(row, required + 1)
      expect(plusOne.status, row.unit).toBe("prepared")
      expect(plusOne.receipt, row.unit).toMatchObject({
        attemptedWork: required,
        completedWork: required,
      })
      expect(plusOne.factualOperationCount, row.unit).toBe(required)
      expect(plusOne.hostileObservedCount, row.unit).toBe(baseline.hostileObservedCount)
      expect(plusOne.localFactoryInvocationCount, row.unit)
        .toBe(baseline.localFactoryInvocationCount)
      expect(plusOne.localMutationEventCount, row.unit)
        .toBe(baseline.localMutationEventCount)
      expect(plusOne.localRowMutationEventCount, row.unit)
        .toBe(baseline.localRowMutationEventCount)
      expect(plusOne.unownedPayloads, row.unit).toEqual([])
      expect(plusOne.cleaned, row.unit).toBe(true)
    }
    expect(factualNs).toEqual({
      "source-items": 1,
      "source-tree-lookup-nodes": 2,
      "source-tree-path-copy-nodes": 1,
      "source-leaf-slots": 1,
      "source-index-nodes": 7,
      "source-index-entries": 49,
      "source-index-comparisons": 38,
      "source-style-nodes": 2,
      "source-style-buckets": 6,
      "source-style-entries": 33,
    })
  }, 180_000)

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
