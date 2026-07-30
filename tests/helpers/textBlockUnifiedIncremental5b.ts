import type {
  VNextTextBlockUnifiedLayoutChangeV1,
} from "../../src/layout/textBlockUnifiedLayoutChangeContractV1.js"
import type {
  VNextTextBlockUnifiedLayoutRootV2,
} from "../../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import {
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
} from "../../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1,
} from "../../src/layout/textBlockUnifiedLayoutSourceStateV1.js"
import {
  repeatedUnifiedLayoutRootSourceFixtureV1,
} from "./textBlockUnifiedLayoutRootV1.js"
import {
  ROOT_V2_TEST_WORK_POLICY,
} from "./textBlockUnifiedLayoutRootV2.js"

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor != null && Object.hasOwn(descriptor, "value")) {
      deepFreeze(descriptor.value)
    }
  }
  return Object.isFrozen(value) ? value : Object.freeze(value)
}

function changeBase(root: VNextTextBlockUnifiedLayoutRootV2) {
  return {
    source: "vnext-text-block-unified-layout-change-v1" as const,
    contractVersion: 1 as const,
    documentId: root.documentId,
    sectionId: root.sectionId,
    textBlockId: root.textBlockId,
    expectedPreviousRootFingerprint: root.fingerprint,
    expectedPreviousSourceFingerprint: root.sourceState.fingerprint,
  }
}

export function noOpUnifiedLayoutChange5b(
  root: VNextTextBlockUnifiedLayoutRootV2,
): VNextTextBlockUnifiedLayoutChangeV1 {
  return deepFreeze({
    ...changeBase(root),
    kind: "no-op" as const,
  })
}

function imageItem(
  root: VNextTextBlockUnifiedLayoutRootV2,
  inlineId?: string,
) {
  for (
    let offset = 0;
    offset < root.sourceState.summary.renderedUtf16Length;
    offset += 1
  ) {
    const lookup = lookupVNextTextBlockUnifiedLayoutSourceItemInternalV1({
      sourceState: root.sourceState,
      renderedUtf16Offset: offset,
    })
    if (
      lookup.status === "found"
      && lookup.item.kind === "inline-image"
      && (inlineId == null || lookup.item.inlineId === inlineId)
    ) {
      return lookup.item
    }
  }
  throw new Error("Root V2 fixture has no inline-image source item")
}

export function imagePaintUnifiedLayoutChange5b(
  root: VNextTextBlockUnifiedLayoutRootV2,
  next: {
    readonly fit: "contain" | "cover"
    readonly crop:
      | { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
      | null
    readonly inlineId?: string
  },
): VNextTextBlockUnifiedLayoutChangeV1 {
  const item = imageItem(root, next.inlineId)
  return deepFreeze({
    ...changeBase(root),
    kind: "image-paint-fact-change" as const,
    inlineId: item.inlineId,
    expectedImageSourceFingerprint: item.sourceFingerprint,
    expectedImageDependencyFingerprint:
      item.layoutDependencyFingerprint,
    nextFit: next.fit,
    nextCrop: next.crop,
  })
}

export function acceptedRepeatedUnifiedLayoutRootFixture5b(
  lineCount: number,
) {
  const source = repeatedUnifiedLayoutRootSourceFixtureV1({
    lineCount,
    includeImages: true,
  })
  const result = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: source.spatialEntries,
  }, ROOT_V2_TEST_WORK_POLICY)
  if (result.status !== "accepted") {
    throw new Error(`repeated Root V2 blocked: ${JSON.stringify(result.issues)}`)
  }
  return result
}
