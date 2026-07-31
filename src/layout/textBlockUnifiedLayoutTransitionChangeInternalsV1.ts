import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  compareVNextOrdinalStrings,
  stringifyVNextCanonicalJson,
} from "../fingerprint/canonicalJson.js"
import {
  InlineImageV4TargetSchema,
  ImageCropV4TargetSchema,
} from "../schema/documentV4ImageTarget.js"
import {
  TextRunStyleV4TargetSchema,
} from "../schema/documentV4Foundation.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_CHANGE_V1_SOURCE,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_CHANGE_V1_VERSION,
  type VNextTextBlockUnifiedLayoutChangeKindV1,
  type VNextTextBlockUnifiedLayoutChangeV1,
} from "./textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockIncrementalCandidateWorkV1,
  VNextTextBlockUnifiedLayoutBlockedStageV1,
  VNextTextBlockUnifiedLayoutIssueCodeV1,
  VNextTextBlockUnifiedLayoutIssueV1,
  VNextTextBlockValidatedChangeShapeV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"

type StrictData =
  | null
  | boolean
  | number
  | string
  | StrictData[]
  | { [key: string]: StrictData }

type DataRecord = Record<string, StrictData>

interface SnapshotResult {
  readonly data: StrictData
  readonly firstMutablePath: string | null
  readonly visitedFieldCount: number
}

const COMMON_KEYS = [
  "source",
  "contractVersion",
  "kind",
  "documentId",
  "sectionId",
  "textBlockId",
  "expectedPreviousRootFingerprint",
  "expectedPreviousSourceFingerprint",
] as const

const KIND_KEYS: Readonly<Record<
  VNextTextBlockUnifiedLayoutChangeKindV1,
  readonly string[]
>> = {
  "no-op": [],
  "text-insertion": [
    "atRenderedUtf16",
    "insertedText",
    "insertedSource",
    "measurementStyleKey",
    "effectiveShapingStyleKey",
  ],
  "text-deletion": [
    "removedRange",
    "expectedRemovedContentFingerprint",
    "expectedRemovedSourceFingerprint",
    "expectedRemovedProvenanceFingerprint",
  ],
  "text-replacement": [
    "removedRange",
    "expectedRemovedContentFingerprint",
    "expectedRemovedSourceFingerprint",
    "expectedRemovedProvenanceFingerprint",
    "insertedText",
    "insertedSource",
    "measurementStyleKey",
    "effectiveShapingStyleKey",
  ],
  "resolved-field-rendered-value-change": [
    "inlineId",
    "fieldKey",
    "expectedPreviousRenderedValueFingerprint",
    "nextRenderedText",
    "nextSource",
  ],
  "supported-style-change": [
    "range",
    "expectedPreviousStyleFingerprint",
    "expectedPreviousStyleProvenanceFingerprint",
    "nextStyle",
    "nextStyleFingerprint",
    "nextStyleProvenanceFingerprint",
  ],
  "inline-image-insertion": [
    "atRenderedUtf16",
    "inlineImage",
    "resolvedAssetId",
    "insertedSource",
  ],
  "inline-image-deletion": [
    "inlineId",
    "expectedRenderedUtf16",
    "expectedImageSourceFingerprint",
    "expectedImageDependencyFingerprint",
  ],
  "inline-image-movement": [
    "inlineId",
    "fromRenderedUtf16",
    "toRenderedUtf16AfterRemoval",
    "expectedImageSourceFingerprint",
    "expectedImageDependencyFingerprint",
  ],
  "image-frame-resize": [
    "inlineId",
    "expectedImageSourceFingerprint",
    "expectedImageDependencyFingerprint",
    "nextWidth",
    "nextHeight",
  ],
  "image-vertical-alignment-change": [
    "inlineId",
    "expectedImageSourceFingerprint",
    "expectedImageDependencyFingerprint",
    "nextVerticalAlign",
  ],
  "image-paint-fact-change": [
    "inlineId",
    "expectedImageSourceFingerprint",
    "expectedImageDependencyFingerprint",
    "nextFit",
    "nextCrop",
  ],
  "exclusion-insertion": ["entry"],
  "exclusion-deletion": [
    "objectId",
    "expectedGeometryOwnerFingerprint",
    "expectedEntryFingerprint",
  ],
  "exclusion-movement": [
    "objectId",
    "expectedGeometryOwnerFingerprint",
    "expectedEntryFingerprint",
    "nextXLayoutUnit",
    "nextYLayoutUnit",
  ],
  "exclusion-resize": [
    "objectId",
    "expectedGeometryOwnerFingerprint",
    "expectedEntryFingerprint",
    "nextWidthLayoutUnit",
    "nextHeightLayoutUnit",
  ],
  "authored-box-width-inset-change": [
    "expectedAuthoredBoxPlanFingerprint",
    "nextAuthoredBoxPlan",
  ],
}

const CHANGE_KINDS = new Set<VNextTextBlockUnifiedLayoutChangeKindV1>(
  Object.keys(KIND_KEYS) as VNextTextBlockUnifiedLayoutChangeKindV1[],
)

const CALLER_AUTHORITY_FIELDS = new Set([
  "dirtyRange",
  "affectedLines",
  "affectedBands",
  "reconvergence",
  "reuse",
  "fallbackMode",
  "workPolicy",
  "effectClassification",
  "effectClass",
  "semanticIdentityChanged",
])

function issue(
  code: VNextTextBlockUnifiedLayoutIssueCodeV1,
  path: string,
  message: string,
): VNextTextBlockUnifiedLayoutIssueV1 {
  return {
    code,
    severity: "error",
    stage: "change-gate",
    path,
    message,
  }
}

function compareIssues(
  left: VNextTextBlockUnifiedLayoutIssueV1,
  right: VNextTextBlockUnifiedLayoutIssueV1,
): number {
  return compareVNextOrdinalStrings(left.path, right.path)
    || compareVNextOrdinalStrings(left.code, right.code)
    || compareVNextOrdinalStrings(left.message, right.message)
}

function childPath(parent: string, key: string): string {
  return parent === "change" ? key : `${parent}.${key}`
}

function snapshotStrictData(
  value: unknown,
  path = "change",
  ancestors = new Set<object>(),
): SnapshotResult | null {
  if (
    value === null
    || typeof value === "string"
    || typeof value === "boolean"
  ) {
    return { data: value, firstMutablePath: null, visitedFieldCount: 0 }
  }
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? { data: value, firstMutablePath: null, visitedFieldCount: 0 }
      : null
  }
  if (typeof value !== "object" || ancestors.has(value)) return null

  ancestors.add(value)
  try {
    const firstMutablePath = Object.isFrozen(value) ? null : path
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype) return null
      const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length")
      if (
        lengthDescriptor == null
        || !Object.hasOwn(lengthDescriptor, "value")
        || !Number.isSafeInteger(lengthDescriptor.value)
        || lengthDescriptor.value < 0
      ) return null
      const keys = Reflect.ownKeys(value)
      if (
        keys.length !== lengthDescriptor.value + 1
        || keys.some((key, index) => (
          index < lengthDescriptor.value
            ? key !== String(index)
            : key !== "length"
        ))
      ) return null

      const output: StrictData[] = []
      let mutablePath = firstMutablePath
      let visitedFieldCount = 0
      for (let index = 0; index < lengthDescriptor.value; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
        if (
          descriptor == null
          || !Object.hasOwn(descriptor, "value")
          || descriptor.enumerable !== true
        ) return null
        const child = snapshotStrictData(
          descriptor.value,
          `${path}[${index}]`,
          ancestors,
        )
        if (child == null) return null
        output.push(child.data)
        mutablePath ??= child.firstMutablePath
        visitedFieldCount += 1 + child.visitedFieldCount
      }
      return {
        data: output,
        firstMutablePath: mutablePath,
        visitedFieldCount,
      }
    }

    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) return null
    if (Object.getOwnPropertySymbols(value).length !== 0) return null
    const keys = Reflect.ownKeys(value)
    if (keys.some((key) => typeof key !== "string")) return null
    const output = Object.create(null) as DataRecord
    let mutablePath = firstMutablePath
    let visitedFieldCount = 0
    for (const key of keys as string[]) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (
        descriptor == null
        || !Object.hasOwn(descriptor, "value")
        || descriptor.enumerable !== true
      ) return null
      const child = snapshotStrictData(
        descriptor.value,
        childPath(path, key),
        ancestors,
      )
      if (child == null) return null
      output[key] = child.data
      mutablePath ??= child.firstMutablePath
      visitedFieldCount += 1 + child.visitedFieldCount
    }
    return {
      data: output,
      firstMutablePath: mutablePath,
      visitedFieldCount,
    }
  } catch {
    return null
  } finally {
    ancestors.delete(value)
  }
}

function deepFreezeCreated<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) {
      deepFreezeCreated(descriptor.value)
    }
  }
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

export function createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1(
  changeGateVisitedFieldCount = 0,
): VNextTextBlockIncrementalCandidateWorkV1 {
  return deepFreezeCreated({
    source: "vnext-text-block-incremental-candidate-work-v1",
    contractVersion: 1,
    changeGateVisitedFieldCount,
    evidence: {
      requestCount: 0,
      requestedAtomCount: 0,
      requestedClusterCount: 0,
      consumedAtomCount: 0,
      consumedClusterCount: 0,
      unusedCoverageRenderedUtf16Length: 0,
      visitedEvidenceNodeCount: 0,
    },
    flow: {
      visitedSourceItemCount: 0,
      visitedFlowAtomCount: 0,
      visitedFlowTreeNodeCount: 0,
      reusedFlowTreeNodeCount: 0,
      createdFlowTreeNodeCount: 0,
      createdCanonicalPayloadByteCount: 0,
      completeTreeRebuildCount: 0,
      completeSemanticPassCount: 0,
      completeSuffixTraversalCount: 0,
    },
    spatial: {
      visitedSpatialIndexNodeCount: 0,
      createdSpatialIndexNodeCount: 0,
      spatialQueryBandCount: 0,
      completeIndexRebuildCount: 0,
      completeIndexTraversalCount: 0,
    },
    structuralReuseProof: {
      selectedExactSubtreeNodeCount: 0,
      lineTreeWrapperAllocationCount: 0,
      completeLineTreeTraversalCount: 0,
    },
    layout: {
      recomputedLineCount: 0,
      proofNodeCount: 0,
      completeSuffixTraversalCount: 0,
    },
    geometry: {
      reprojectedLineCount: 0,
      visitedFragmentCount: 0,
    },
    scene: {
      copiedSceneNodeCount: 0,
      replacementChunkCount: 0,
    },
    deliveryPlan: {
      deliveryOperationCount: 0,
      retainCoverNodeCount: 0,
    },
    observations: {
      estimatedCanonicalPayloadByteCount: 0,
      payloadObservationFingerprint: null,
    },
    atomicAcceptance: {
      attemptedRegistrationCount: 0,
      committedRegistrationCount: 0,
    },
    stageWork: [],
    rootWrapperAllocationCount: 0,
    completeNextInputTraversalCount: 0,
    completeNextInputComparisonCount: 0,
    completeSceneTraversalCount: 0,
  })
}

function blocked(
  visitedFieldCount: number,
  issues: readonly VNextTextBlockUnifiedLayoutIssueV1[],
): VNextTextBlockUnifiedLayoutBlockedStageV1 {
  return Object.freeze({
    status: "blocked",
    stage: "change-gate",
    change: null,
    incrementalCandidateWork:
      createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1(
        visitedFieldCount,
      ),
    issues: Object.freeze([...issues].sort(compareIssues)),
  })
}

function isRecord(value: StrictData): value is DataRecord {
  return value != null && typeof value === "object" && !Array.isArray(value)
}

function addNonBlankIssue(
  record: DataRecord,
  key: string,
  issues: VNextTextBlockUnifiedLayoutIssueV1[],
): void {
  const value = record[key]
  if (typeof value !== "string") {
    issues.push(issue(
      "invalid-change-value",
      key,
      `${key} must be a string`,
    ))
  } else if (value.trim().length === 0) {
    issues.push(issue(
      "blank-change-identity",
      key,
      `${key} must be nonblank`,
    ))
  }
}

function addStringIssue(
  record: DataRecord,
  key: string,
  issues: VNextTextBlockUnifiedLayoutIssueV1[],
  options: { readonly nonempty?: boolean } = {},
): void {
  const value = record[key]
  if (
    typeof value !== "string"
    || (options.nonempty === true && value.length === 0)
  ) {
    issues.push(issue(
      "invalid-change-value",
      key,
      `${key} must be ${options.nonempty === true ? "a nonempty" : "a"} string`,
    ))
  }
}

function validOrdinal(value: StrictData): boolean {
  return typeof value === "number"
    && Number.isSafeInteger(value)
    && value >= 0
}

function addOrdinalIssue(
  record: DataRecord,
  key: string,
  issues: VNextTextBlockUnifiedLayoutIssueV1[],
): void {
  if (!validOrdinal(record[key])) {
    issues.push(issue(
      "invalid-change-range",
      key,
      `${key} must be a nonnegative safe integer in its declared source domain`,
    ))
  }
}

function validateRange(
  value: StrictData,
  path: string,
  issues: VNextTextBlockUnifiedLayoutIssueV1[],
): void {
  if (
    !isRecord(value)
    || Object.keys(value).length !== 2
    || !Object.hasOwn(value, "startRenderedUtf16")
    || !Object.hasOwn(value, "endRenderedUtf16")
    || !validOrdinal(value.startRenderedUtf16)
    || !validOrdinal(value.endRenderedUtf16)
    || (value.startRenderedUtf16 as number) >= (value.endRenderedUtf16 as number)
  ) {
    issues.push(issue(
      "invalid-change-range",
      path,
      `${path} must be a nonempty half-open range of safe previous-source ordinals`,
    ))
  }
}

function validateSourceIdentity(
  value: StrictData,
  path: string,
  issues: VNextTextBlockUnifiedLayoutIssueV1[],
): void {
  const keys = ["lineageId", "sourceFingerprint", "provenanceFingerprint"]
  if (
    !isRecord(value)
    || Object.keys(value).length !== keys.length
    || keys.some((key) => (
      !Object.hasOwn(value, key)
      || typeof value[key] !== "string"
      || (value[key] as string).trim().length === 0
    ))
  ) {
    issues.push(issue(
      "invalid-change-value",
      path,
      `${path} must be one exact nonblank source identity`,
    ))
  }
}

function validUnitValue(value: StrictData): boolean {
  return isRecord(value)
    && Object.keys(value).length === 2
    && typeof value.value === "number"
    && Number.isFinite(value.value)
    && value.value > 0
    && (value.unit === "pt" || value.unit === "mm")
}

function validateExclusionEntry(
  value: StrictData,
  issues: VNextTextBlockUnifiedLayoutIssueV1[],
): void {
  const keys = [
    "objectId",
    "geometryOwnerFingerprint",
    "xLayoutUnit",
    "yLayoutUnit",
    "widthLayoutUnit",
    "heightLayoutUnit",
    "clearance",
    "wrapPolicy",
  ]
  if (
    !isRecord(value)
    || Object.keys(value).length !== keys.length
    || keys.some((key) => !Object.hasOwn(value, key))
  ) {
    issues.push(issue(
      "invalid-change-value",
      "entry",
      "entry must use the exact synthetic positioned-object shape",
    ))
    return
  }
  if (
    typeof value.objectId !== "string"
    || value.objectId.trim().length === 0
    || typeof value.geometryOwnerFingerprint !== "string"
    || value.geometryOwnerFingerprint.trim().length === 0
    || !validOrdinal(value.xLayoutUnit)
    || !validOrdinal(value.yLayoutUnit)
    || !validOrdinal(value.widthLayoutUnit)
    || !validOrdinal(value.heightLayoutUnit)
    || value.widthLayoutUnit === 0
    || value.heightLayoutUnit === 0
    || ![
      "rectangular-exclusion",
      "top-bottom-barrier",
      "overlay",
    ].includes(String(value.wrapPolicy))
  ) {
    issues.push(issue(
      "invalid-change-value",
      "entry",
      "entry identity, geometry, and wrap policy must be valid",
    ))
  }
  const clearance = value.clearance
  const clearanceKeys = [
    "topLayoutUnit",
    "rightLayoutUnit",
    "bottomLayoutUnit",
    "leftLayoutUnit",
  ]
  if (
    !isRecord(clearance)
    || Object.keys(clearance).length !== clearanceKeys.length
    || clearanceKeys.some((key) => (
      !Object.hasOwn(clearance, key) || !validOrdinal(clearance[key])
    ))
  ) {
    issues.push(issue(
      "invalid-change-value",
      "entry.clearance",
      "entry clearance must contain four nonnegative safe integers",
    ))
  }
}

function validateAuthoredBoxPlan(
  value: StrictData,
  issues: VNextTextBlockUnifiedLayoutIssueV1[],
): void {
  const keys = [
    "source",
    "contractVersion",
    "kind",
    "ownerNodeId",
    "ownerNodeType",
    "hasAuthoredBox",
    "fillColor",
    "paddingPt",
    "border",
    "outerWidthPt",
    "contentInsetPt",
    "contentWidthPt",
    "pageSplitPolicy",
    "styleFingerprint",
    "fingerprint",
  ]
  if (
    !isRecord(value)
    || Object.keys(value).length !== keys.length
    || keys.some((key) => !Object.hasOwn(value, key))
  ) {
    issues.push(issue(
      "invalid-change-value",
      "nextAuthoredBoxPlan",
      "nextAuthoredBoxPlan must be one complete authored-box plan",
    ))
    return
  }
  const scalarValid =
    value.source === "vnext-authored-box-contract"
    && value.contractVersion === 1
    && value.kind === "authored-box-plan"
    && typeof value.ownerNodeId === "string"
    && value.ownerNodeId.trim().length > 0
    && ["text-block", "column", "table-cell"].includes(String(value.ownerNodeType))
    && typeof value.hasAuthoredBox === "boolean"
    && (value.fillColor === null
      || (typeof value.fillColor === "string"
        && /^[0-9A-Fa-f]{6}$/u.test(value.fillColor)))
    && typeof value.outerWidthPt === "number"
    && Number.isFinite(value.outerWidthPt)
    && value.outerWidthPt > 0
    && typeof value.contentWidthPt === "number"
    && Number.isFinite(value.contentWidthPt)
    && value.contentWidthPt > 0
    && value.pageSplitPolicy === "open-continuation-edges"
    && typeof value.styleFingerprint === "string"
    && value.styleFingerprint.trim().length > 0
    && typeof value.fingerprint === "string"
    && value.fingerprint.trim().length > 0
  if (!scalarValid) {
    issues.push(issue(
      "invalid-change-value",
      "nextAuthoredBoxPlan",
      "nextAuthoredBoxPlan scalar facts are invalid",
    ))
  }

  const insetKeys = ["top", "right", "bottom", "left"]
  for (const insetKey of ["paddingPt", "contentInsetPt"] as const) {
    const inset = value[insetKey]
    if (
      !isRecord(inset)
      || Object.keys(inset).length !== insetKeys.length
      || insetKeys.some((key) => (
        !Object.hasOwn(inset, key)
        || typeof inset[key] !== "number"
        || !Number.isFinite(inset[key])
        || (inset[key] as number) < 0
      ))
    ) {
      issues.push(issue(
        "invalid-change-value",
        `nextAuthoredBoxPlan.${insetKey}`,
        `${insetKey} must contain four finite nonnegative point values`,
      ))
    }
  }

  const border = value.border
  if (
    !isRecord(border)
    || Object.keys(border).length !== insetKeys.length
    || insetKeys.some((edge) => {
      const side = border[edge]
      return !isRecord(side)
        || Object.keys(side).length !== 3
        || !["none", "solid", "dashed", "dotted"].includes(String(side.style))
        || typeof side.widthPt !== "number"
        || !Number.isFinite(side.widthPt)
        || side.widthPt < 0
        || typeof side.color !== "string"
        || !/^[0-9A-Fa-f]{6}$/u.test(side.color)
    })
  ) {
    issues.push(issue(
      "invalid-change-value",
      "nextAuthoredBoxPlan.border",
      "border must contain four exact authored border sides",
    ))
  }
}

function validateKindPayload(
  kind: VNextTextBlockUnifiedLayoutChangeKindV1,
  record: DataRecord,
  issues: VNextTextBlockUnifiedLayoutIssueV1[],
): void {
  switch (kind) {
    case "no-op":
      return
    case "text-insertion":
      addOrdinalIssue(record, "atRenderedUtf16", issues)
      addStringIssue(record, "insertedText", issues, { nonempty: true })
      validateSourceIdentity(record.insertedSource, "insertedSource", issues)
      addNonBlankIssue(record, "measurementStyleKey", issues)
      addNonBlankIssue(record, "effectiveShapingStyleKey", issues)
      return
    case "text-deletion":
      validateRange(record.removedRange, "removedRange", issues)
      addNonBlankIssue(record, "expectedRemovedContentFingerprint", issues)
      addNonBlankIssue(record, "expectedRemovedSourceFingerprint", issues)
      addNonBlankIssue(record, "expectedRemovedProvenanceFingerprint", issues)
      return
    case "text-replacement":
      validateRange(record.removedRange, "removedRange", issues)
      addNonBlankIssue(record, "expectedRemovedContentFingerprint", issues)
      addNonBlankIssue(record, "expectedRemovedSourceFingerprint", issues)
      addNonBlankIssue(record, "expectedRemovedProvenanceFingerprint", issues)
      addStringIssue(record, "insertedText", issues, { nonempty: true })
      validateSourceIdentity(record.insertedSource, "insertedSource", issues)
      addNonBlankIssue(record, "measurementStyleKey", issues)
      addNonBlankIssue(record, "effectiveShapingStyleKey", issues)
      return
    case "resolved-field-rendered-value-change":
      addNonBlankIssue(record, "inlineId", issues)
      addNonBlankIssue(record, "fieldKey", issues)
      addNonBlankIssue(
        record,
        "expectedPreviousRenderedValueFingerprint",
        issues,
      )
      addStringIssue(record, "nextRenderedText", issues)
      validateSourceIdentity(record.nextSource, "nextSource", issues)
      return
    case "supported-style-change":
      validateRange(record.range, "range", issues)
      addNonBlankIssue(record, "expectedPreviousStyleFingerprint", issues)
      addNonBlankIssue(
        record,
        "expectedPreviousStyleProvenanceFingerprint",
        issues,
      )
      if (!TextRunStyleV4TargetSchema.safeParse(record.nextStyle).success) {
        issues.push(issue(
          "unsupported-change-value",
          "nextStyle",
          "nextStyle must use the closed supported Text Run style subset",
        ))
      }
      addNonBlankIssue(record, "nextStyleFingerprint", issues)
      addNonBlankIssue(record, "nextStyleProvenanceFingerprint", issues)
      return
    case "inline-image-insertion":
      addOrdinalIssue(record, "atRenderedUtf16", issues)
      if (!InlineImageV4TargetSchema.safeParse(record.inlineImage).success) {
        issues.push(issue(
          "unsupported-change-value",
          "inlineImage",
          "inlineImage must use the complete V4 inline-image target",
        ))
      }
      addNonBlankIssue(record, "resolvedAssetId", issues)
      validateSourceIdentity(record.insertedSource, "insertedSource", issues)
      return
    case "inline-image-deletion":
      addNonBlankIssue(record, "inlineId", issues)
      addOrdinalIssue(record, "expectedRenderedUtf16", issues)
      addNonBlankIssue(record, "expectedImageSourceFingerprint", issues)
      addNonBlankIssue(record, "expectedImageDependencyFingerprint", issues)
      return
    case "inline-image-movement":
      addNonBlankIssue(record, "inlineId", issues)
      addOrdinalIssue(record, "fromRenderedUtf16", issues)
      addOrdinalIssue(record, "toRenderedUtf16AfterRemoval", issues)
      addNonBlankIssue(record, "expectedImageSourceFingerprint", issues)
      addNonBlankIssue(record, "expectedImageDependencyFingerprint", issues)
      return
    case "image-frame-resize":
      addNonBlankIssue(record, "inlineId", issues)
      addNonBlankIssue(record, "expectedImageSourceFingerprint", issues)
      addNonBlankIssue(record, "expectedImageDependencyFingerprint", issues)
      if (!validUnitValue(record.nextWidth)) {
        issues.push(issue(
          "invalid-change-value",
          "nextWidth",
          "nextWidth must be one positive pt/mm value",
        ))
      }
      if (!validUnitValue(record.nextHeight)) {
        issues.push(issue(
          "invalid-change-value",
          "nextHeight",
          "nextHeight must be one positive pt/mm value",
        ))
      }
      return
    case "image-vertical-alignment-change":
      addNonBlankIssue(record, "inlineId", issues)
      addNonBlankIssue(record, "expectedImageSourceFingerprint", issues)
      addNonBlankIssue(record, "expectedImageDependencyFingerprint", issues)
      if (!["baseline", "middle", "text-bottom"].includes(
        String(record.nextVerticalAlign),
      )) {
        issues.push(issue(
          "unsupported-change-value",
          "nextVerticalAlign",
          "nextVerticalAlign must use the V4 inline-image alignment vocabulary",
        ))
      }
      return
    case "image-paint-fact-change":
      addNonBlankIssue(record, "inlineId", issues)
      addNonBlankIssue(record, "expectedImageSourceFingerprint", issues)
      addNonBlankIssue(record, "expectedImageDependencyFingerprint", issues)
      if (record.nextFit !== "contain" && record.nextFit !== "cover") {
        issues.push(issue(
          "unsupported-change-value",
          "nextFit",
          "nextFit must be contain or cover",
        ))
      }
      if (
        record.nextCrop !== null
        && !ImageCropV4TargetSchema.safeParse(record.nextCrop).success
      ) {
        issues.push(issue(
          "invalid-change-value",
          "nextCrop",
          "nextCrop must be null or one complete valid crop",
        ))
      }
      return
    case "exclusion-insertion":
      validateExclusionEntry(record.entry, issues)
      return
    case "exclusion-deletion":
      addNonBlankIssue(record, "objectId", issues)
      addNonBlankIssue(record, "expectedGeometryOwnerFingerprint", issues)
      addNonBlankIssue(record, "expectedEntryFingerprint", issues)
      return
    case "exclusion-movement":
      addNonBlankIssue(record, "objectId", issues)
      addNonBlankIssue(record, "expectedGeometryOwnerFingerprint", issues)
      addNonBlankIssue(record, "expectedEntryFingerprint", issues)
      addOrdinalIssue(record, "nextXLayoutUnit", issues)
      addOrdinalIssue(record, "nextYLayoutUnit", issues)
      return
    case "exclusion-resize":
      addNonBlankIssue(record, "objectId", issues)
      addNonBlankIssue(record, "expectedGeometryOwnerFingerprint", issues)
      addNonBlankIssue(record, "expectedEntryFingerprint", issues)
      addOrdinalIssue(record, "nextWidthLayoutUnit", issues)
      addOrdinalIssue(record, "nextHeightLayoutUnit", issues)
      if (record.nextWidthLayoutUnit === 0 || record.nextHeightLayoutUnit === 0) {
        issues.push(issue(
          "invalid-change-value",
          "nextWidthLayoutUnit",
          "exclusion resize dimensions must be positive",
        ))
      }
      return
    case "authored-box-width-inset-change":
      addNonBlankIssue(record, "expectedAuthoredBoxPlanFingerprint", issues)
      validateAuthoredBoxPlan(record.nextAuthoredBoxPlan, issues)
  }
}

export function validateVNextTextBlockUnifiedLayoutChangeShapeInternalV1(
  change: unknown,
): VNextTextBlockValidatedChangeShapeV1
  | VNextTextBlockUnifiedLayoutBlockedStageV1 {
  const snapshot = snapshotStrictData(change)
  if (snapshot == null || !isRecord(snapshot.data)) {
    return blocked(0, [
      issue(
        "invalid-change-data",
        "change",
        "change must be an exact ordinary/null-prototype data record with no symbols, accessors, proxies, cycles, or non-finite values",
      ),
    ])
  }
  if (snapshot.firstMutablePath != null) {
    return blocked(snapshot.visitedFieldCount, [
      issue(
        "change-not-deeply-frozen",
        snapshot.firstMutablePath,
        "change and every nested data record must already be recursively frozen",
      ),
    ])
  }

  const record = snapshot.data
  const issues: VNextTextBlockUnifiedLayoutIssueV1[] = []
  if (record.source !== VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_CHANGE_V1_SOURCE) {
    issues.push(issue(
      "unsupported-change-source",
      "source",
      "change source must identify the V1 unified layout change contract",
    ))
  }
  if (record.contractVersion !== VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_CHANGE_V1_VERSION) {
    issues.push(issue(
      "unsupported-change-version",
      "contractVersion",
      "change contractVersion must be exactly 1",
    ))
  }

  const kind = typeof record.kind === "string"
    && CHANGE_KINDS.has(record.kind as VNextTextBlockUnifiedLayoutChangeKindV1)
    ? record.kind as VNextTextBlockUnifiedLayoutChangeKindV1
    : null
  if (kind == null) {
    issues.push(issue(
      "unsupported-change-kind",
      "kind",
      "change kind is not part of the closed V1 union",
    ))
  }

  const expectedKeys = new Set<string>([
    ...COMMON_KEYS,
    ...(kind == null ? [] : KIND_KEYS[kind]),
  ])
  for (const key of Object.keys(record)) {
    if (expectedKeys.has(key)) continue
    issues.push(issue(
      CALLER_AUTHORITY_FIELDS.has(key)
        ? "caller-authority-forbidden"
        : "unknown-change-field",
      key,
      CALLER_AUTHORITY_FIELDS.has(key)
        ? `${key} is Core-owned and cannot be supplied by a caller`
        : `${key} is not part of this exact change variant`,
    ))
  }
  for (const key of expectedKeys) {
    if (!Object.hasOwn(record, key)) {
      issues.push(issue(
        "missing-change-field",
        key,
        `${key} is required by this exact change variant`,
      ))
    }
  }

  for (const key of [
    "documentId",
    "sectionId",
    "textBlockId",
    "expectedPreviousRootFingerprint",
    "expectedPreviousSourceFingerprint",
  ]) {
    addNonBlankIssue(record, key, issues)
  }
  if (kind != null) validateKindPayload(kind, record, issues)

  if (issues.length > 0) {
    return blocked(snapshot.visitedFieldCount, issues)
  }

  const eligibility = kind === "authored-box-width-inset-change"
    ? "permitted"
    : "required"
  const fingerprint = createVNextCompactFingerprint(
    stringifyVNextCanonicalJson(snapshot.data),
  )
  return Object.freeze({
    status: "accepted",
    stage: "change-gate",
    change: change as VNextTextBlockUnifiedLayoutChangeV1,
    eligibility,
    fingerprint,
    incrementalCandidateWork:
      createEmptyVNextTextBlockIncrementalCandidateWorkInternalV1(
        snapshot.visitedFieldCount,
      ),
    issues: Object.freeze([]) as readonly [],
  })
}
