import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockFlowEvidenceV2,
  createVNextTextBlockInitialFlowV1,
  inspectVNextTextBlockFlowEvidenceV2,
  type VNextTextBlockFlowEvidenceInputV2,
  type VNextTextBlockInitialFlowV1,
} from "../src/index.js"
import { acceptedInlineImageEvidenceFixture } from
  "./helpers/textBlockInlineImageFlowV2.js"
import {
  emptyGeometryBuildInputFixture,
  hardBreakOnlyGeometryBuildInputFixture,
  imageOnlyGeometryBuildInputFixture,
  listImageGeometryBuildInputFixture,
  renderedEmptyFieldGeometryBuildInputFixture,
} from "./helpers/textBlockInitialFlowV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function freezeRecursively<T>(value: T): T {
  if (value == null || typeof value !== "object") return value
  Object.values(value).forEach(freezeRecursively)
  return Object.freeze(value)
}

function classifyMixedParagraph() {
  const buildInput = listImageGeometryBuildInputFixture()
  buildInput.textBlock = {
    ...buildInput.textBlock,
    role: { role: "paragraph" },
  }
  const result = createVNextTextBlockInitialFlowV1(buildInput)
  if (result.status !== "classified") throw new Error("mixed paragraph fixture blocked")
  return result.flow
}

function evidenceInputFor(initialFlow: VNextTextBlockInitialFlowV1): VNextTextBlockFlowEvidenceInputV2 {
  const textAtom = initialFlow.atoms.find((atom) => atom.kind === "text")
  if (textAtom?.kind !== "text") throw new Error("text atom fixture missing")
  return {
    initialFlowFingerprint: initialFlow.fingerprint,
    layoutId: "flow-evidence-v2",
    measurement: clone(initialFlow.measurement),
    layoutUnitPolicyFingerprint: initialFlow.layoutUnitPolicyFingerprint,
    availableWidthLayoutUnit: 90_000_000,
    declaredLineHeightLayoutUnit: initialFlow.declaredLineHeightLayoutUnit,
    paragraphStyle: clone(initialFlow.paragraphStyle),
    fontFaces: initialFlow.fontFaces.map(({ fontFamilyKey: _key, ...face }) => clone(face)),
    shapingRuns: [{
      shapingRunId: "shape-a",
      renderStartOffset: 0,
      renderEndOffset: 1,
      text: "A",
      styleKey: textAtom.resolvedGeometryStyle.effectiveShapingStyleKey,
      fontFaceId: textAtom.resolvedGeometryStyle.fontFaceId,
      fontSizeLayoutUnit: textAtom.resolvedGeometryStyle.fontSizeLayoutUnit,
      textColor: textAtom.resolvedGeometryStyle.textColor,
      direction: "ltr",
      baselineShiftLayoutUnit: 0,
      features: [],
      clusters: [{
        index: 0,
        renderStartOffset: 0,
        renderEndOffset: 1,
        advanceLayoutUnit: 6_000_000,
      }],
    }],
    breakOffsets: [0, 1, 2],
  }
}

function classify(buildInput: ReturnType<typeof emptyGeometryBuildInputFixture>) {
  const result = createVNextTextBlockInitialFlowV1(buildInput)
  if (result.status !== "classified") throw new Error("Initial Flow fixture blocked")
  return result.flow
}

function callUnknown(input: unknown) {
  return (
    acceptVNextTextBlockFlowEvidenceV2 as (
      input: unknown,
    ) => ReturnType<typeof acceptVNextTextBlockFlowEvidenceV2>
  )(input)
}

describe("VNext TextBlock Flow Evidence V2", () => {
  it("accepts producer-shaped mixed text/image evidence without producer-selected lines", () => {
    const initialFlow = classifyMixedParagraph()
    const accepted = acceptVNextTextBlockFlowEvidenceV2({
      initialFlow,
      evidenceInput: evidenceInputFor(initialFlow),
    })

    expect(accepted).toMatchObject({
      status: "accepted",
      evidence: {
        source: "vnext-text-block-flow-evidence-v2",
        contractVersion: 2,
        initialFlowFingerprint: initialFlow.fingerprint,
        shapingRuns: [expect.objectContaining({ text: "A" })],
        breakOffsets: [0, 1, 2],
        contracts: {
          producerSelectsLines: false,
          shapingCoversTextBearingSlotsOnly: true,
          breakOffsetsCoverCompleteRenderedText: true,
          coreOwnsImageAdvance: true,
          coreOwnsLinePlacement: true,
          processLocalImmutableEvidence: true,
          mayPublishLayout: false,
          productionBinding: false,
        },
      },
      issues: [],
    })
    if (accepted.status !== "accepted") throw new Error("evidence blocked")
    expect(accepted.evidence).not.toHaveProperty("lines")
    expect(Object.isFrozen(accepted.evidence)).toBe(true)
    expect(Object.isFrozen(accepted.evidence.shapingRuns[0]!.clusters)).toBe(true)
  })

  it("accepts image-only evidence with zero shaping runs and accepts text-only evidence", () => {
    const imageOnly = acceptedInlineImageEvidenceFixture({ content: "image-only" })
    const textOnly = acceptedInlineImageEvidenceFixture({ content: "text-only" })

    expect(imageOnly.evidence.shapingRuns).toEqual([])
    expect(imageOnly.evidence.breakOffsets).toEqual([0, 1])
    expect(textOnly.evidence.shapingRuns.map((run) => run.text)).toEqual(["A"])
  })

  it("registers immutable evidence against only the exact Initial Flow object", async () => {
    const { hasVNextTextBlockFlowEvidenceBindingInternalV2 } = await import(
      "../src/layout/textBlockFlowEvidenceV2.js"
    )
    const fixture = acceptedInlineImageEvidenceFixture()
    const equalInitialResult = createVNextTextBlockInitialFlowV1((() => {
      const input = listImageGeometryBuildInputFixture()
      const image = input.textBlock.children[1]
      const imageRun = input.measurement.runs[1]
      if (image?.type !== "inline-image" || imageRun?.kind !== "inline-image") {
        throw new Error("equal authority fixture missing")
      }
      const secondText = { id: "text-b", type: "text" as const, text: "B" }
      input.textBlock = {
        ...input.textBlock,
        role: { role: "paragraph" },
        children: [input.textBlock.children[0]!, image, secondText],
      }
      input.measurement = {
        ...input.measurement,
        renderedText: "A\uFFFCB",
        runs: [
          input.measurement.runs[0]!,
          imageRun,
          {
            ...input.measurement.runs[0]!,
            inlineId: "text-b",
            renderStartOffset: 2,
            renderEndOffset: 3,
            renderedText: "B",
          },
        ],
      }
      return input
    })())
    if (equalInitialResult.status !== "classified") throw new Error("equal Initial Flow blocked")

    expect(inspectVNextTextBlockFlowEvidenceV2(fixture.evidence)).toMatchObject({
      status: "valid",
      fingerprint: fixture.evidence.fingerprint,
      initialFlowFingerprint: fixture.initialFlow.fingerprint,
      mayPublishLayout: false,
      productionBinding: false,
    })
    expect(hasVNextTextBlockFlowEvidenceBindingInternalV2(
      fixture.evidence,
      fixture.initialFlow,
    )).toBe(true)
    expect(equalInitialResult.flow.fingerprint).toBe(fixture.initialFlow.fingerprint)
    expect(hasVNextTextBlockFlowEvidenceBindingInternalV2(
      fixture.evidence,
      equalInitialResult.flow,
    )).toBe(false)
    const core = await import("../src/index.js")
    expect(core).not.toHaveProperty("hasVNextTextBlockFlowEvidenceBindingInternalV2")
  })

  it.each([
    ["cloned", (evidence: object) => structuredClone(evidence)],
    ["equal frozen", (evidence: object) => Object.freeze({ ...evidence })],
    ["re-fingerprinted", (evidence: object) => Object.freeze({
      ...structuredClone(evidence),
      fingerprint: (evidence as { fingerprint: string }).fingerprint,
    })],
    ["mutable", (evidence: object) => ({ ...structuredClone(evidence) })],
  ])("rejects %s evidence as foreign process-local authority", (_name, attack) => {
    const fixture = acceptedInlineImageEvidenceFixture()
    expect(inspectVNextTextBlockFlowEvidenceV2(attack(fixture.evidence))).toMatchObject({
      status: "invalid",
      code: "unregistered-flow-evidence",
      mayPublishLayout: false,
      productionBinding: false,
    })
  })

  it("rejects an accessor-shaped foreign evidence object without reading it", () => {
    let reads = 0
    const accessor = {}
    Object.defineProperty(accessor, "fingerprint", {
      enumerable: true,
      get: () => {
        reads += 1
        return `sha256:${"a".repeat(64)}`
      },
    })
    expect(inspectVNextTextBlockFlowEvidenceV2(accessor)).toMatchObject({
      status: "invalid",
      code: "unregistered-flow-evidence",
    })
    expect(reads).toBe(0)
  })

  it.each([
    ["structured-cloned mutable", (flow: VNextTextBlockInitialFlowV1) => structuredClone(flow)],
    ["equal recursively frozen", (flow: VNextTextBlockInitialFlowV1) => (
      freezeRecursively(structuredClone(flow))
    )],
    ["re-fingerprinted", (flow: VNextTextBlockInitialFlowV1) => freezeRecursively({
      ...structuredClone(flow),
      fingerprint: flow.fingerprint,
    })],
  ])("rejects a %s Initial Flow as foreign classifier authority", (_name, attack) => {
    const initialFlow = classifyMixedParagraph()
    expect(callUnknown({
      initialFlow: attack(initialFlow),
      evidenceInput: evidenceInputFor(initialFlow),
    })).toMatchObject({
      status: "blocked",
      evidence: null,
      issues: [{
        code: "initial-flow-provenance-mismatch",
        path: "initialFlow",
      }],
    })
  })

  it("rejects an accessor-shaped Initial Flow without reading it", () => {
    const initialFlow = classifyMixedParagraph()
    let reads = 0
    const accessor = {}
    Object.defineProperty(accessor, "fingerprint", {
      enumerable: true,
      get: () => {
        reads += 1
        return initialFlow.fingerprint
      },
    })
    expect(callUnknown({
      initialFlow: accessor,
      evidenceInput: evidenceInputFor(initialFlow),
    })).toMatchObject({
      status: "blocked",
      evidence: null,
      issues: [expect.objectContaining({ code: "initial-flow-provenance-mismatch" })],
    })
    expect(reads).toBe(0)
  })

  it("blocks unresolved images, list decoration, and every empty-layout capability", () => {
    const unresolved = acceptedInlineImageEvidenceFixture({ content: "image-only" })
    const unresolvedInput = {
      ...unresolved.evidence,
      shapingRuns: [],
      breakOffsets: [0, 1],
    }
    delete (unresolvedInput as Partial<typeof unresolvedInput>).source
    delete (unresolvedInput as Partial<typeof unresolvedInput>).contractVersion
    delete (unresolvedInput as Partial<typeof unresolvedInput>).contracts
    delete (unresolvedInput as Partial<typeof unresolvedInput>).fingerprint

    const nullImageInput = imageOnlyGeometryBuildInputFixture()
    const imageInline = nullImageInput.textBlock.children[0]
    if (imageInline?.type !== "inline-image") throw new Error("image fixture missing")
    nullImageInput.textBlock = {
      ...nullImageInput.textBlock,
      children: [{
        ...imageInline,
        source: { kind: "image-field-ref", fieldKey: "customer.logo" },
      }],
    }
    nullImageInput.measurement = {
      ...nullImageInput.measurement,
      runs: [{ ...nullImageInput.measurement.runs[0]!, assetId: null }],
    }
    const nullImageFlow = classify(nullImageInput)
    const nullImageEvidence = clone(unresolvedInput) as VNextTextBlockFlowEvidenceInputV2
    nullImageEvidence.initialFlowFingerprint = nullImageFlow.fingerprint
    nullImageEvidence.measurement = clone(nullImageFlow.measurement)

    expect(acceptVNextTextBlockFlowEvidenceV2({
      initialFlow: nullImageFlow,
      evidenceInput: nullImageEvidence,
    })).toMatchObject({
      status: "blocked",
      evidence: null,
      issues: [{
        code: "unresolved-inline-image",
        path: "initialFlow.atoms[0].assetId",
        inlineId: "image-1",
      }],
    })

    const unsupported = [
      classify(listImageGeometryBuildInputFixture()),
      classify(emptyGeometryBuildInputFixture()),
      classify(renderedEmptyFieldGeometryBuildInputFixture()),
      classify(hardBreakOnlyGeometryBuildInputFixture()),
    ]
    for (const initialFlow of unsupported) {
      const template = evidenceInputFor(classifyMixedParagraph())
      template.initialFlowFingerprint = initialFlow.fingerprint
      template.measurement = clone(initialFlow.measurement)
      template.shapingRuns = []
      template.breakOffsets = initialFlow.measurement.renderedText.length === 0
        ? [0]
        : [0, initialFlow.measurement.renderedText.length]
      const result = acceptVNextTextBlockFlowEvidenceV2({
        initialFlow,
        evidenceInput: template,
      })
      expect(result).toMatchObject({
        status: "blocked",
        evidence: null,
        issues: [expect.objectContaining({ code: "unsupported-flow-capability" })],
      })
    }
  })

  it("blocks shaping coverage that crosses the U+FFFC image source slot", () => {
    const initialFlow = classifyMixedParagraph()
    const evidenceInput = evidenceInputFor(initialFlow)
    evidenceInput.shapingRuns[0] = {
      ...evidenceInput.shapingRuns[0]!,
      renderEndOffset: 2,
      text: "A\uFFFC",
      clusters: [
        evidenceInput.shapingRuns[0]!.clusters[0]!,
        {
          index: 1,
          renderStartOffset: 1,
          renderEndOffset: 2,
          advanceLayoutUnit: 6_000_000,
        },
      ],
    }

    expect(acceptVNextTextBlockFlowEvidenceV2({
      initialFlow,
      evidenceInput,
    })).toMatchObject({
      status: "blocked",
      evidence: null,
      issues: expect.arrayContaining([
        expect.objectContaining({
          code: "invalid-shaping-coverage",
          shapingRunId: "shape-a",
        }),
      ]),
    })
  })

  it("blocks another Initial Flow fingerprint and a cloned Initial Flow without partial evidence", () => {
    const initialFlow = classifyMixedParagraph()
    const fingerprintMismatch = evidenceInputFor(initialFlow)
    fingerprintMismatch.initialFlowFingerprint = `sha256:${"f".repeat(64)}`

    expect(acceptVNextTextBlockFlowEvidenceV2({
      initialFlow,
      evidenceInput: fingerprintMismatch,
    })).toMatchObject({
      status: "blocked",
      evidence: null,
      issues: [expect.objectContaining({
        code: "initial-flow-binding-mismatch",
        path: "evidenceInput.initialFlowFingerprint",
      })],
    })

    expect(callUnknown({
      initialFlow: structuredClone(initialFlow),
      evidenceInput: evidenceInputFor(initialFlow),
    })).toMatchObject({
      status: "blocked",
      evidence: null,
      issues: [expect.objectContaining({
        code: "initial-flow-provenance-mismatch",
        path: "initialFlow",
      })],
    })
  })

  it("rejects accessor-shaped roots without reading them", () => {
    const initialFlow = classifyMixedParagraph()
    let envelopeReads = 0
    let evidenceReads = 0
    const envelope = {
      evidenceInput: evidenceInputFor(initialFlow),
    }
    Object.defineProperty(envelope, "initialFlow", {
      enumerable: true,
      get: () => {
        envelopeReads += 1
        return initialFlow
      },
    })
    expect(callUnknown(envelope)).toMatchObject({
      status: "blocked",
      evidence: null,
      issues: [expect.objectContaining({ code: "invalid-input", path: "input" })],
    })

    const evidenceInput = evidenceInputFor(initialFlow)
    Object.defineProperty(evidenceInput, "measurement", {
      enumerable: true,
      get: () => {
        evidenceReads += 1
        return initialFlow.measurement
      },
    })
    expect(callUnknown({ initialFlow, evidenceInput })).toMatchObject({
      status: "blocked",
      evidence: null,
      issues: [expect.objectContaining({ code: "invalid-input", path: "evidenceInput" })],
    })
    expect({ envelopeReads, evidenceReads }).toEqual({ envelopeReads: 0, evidenceReads: 0 })
  })

  it("blocks unsafe breaks, production binding, and producer-selected lines in deterministic order", () => {
    const initialFlow = classifyMixedParagraph()
    const unsafeBreaks = evidenceInputFor(initialFlow)
    unsafeBreaks.breakOffsets = [0, Number.MAX_SAFE_INTEGER]
    const semantic = acceptVNextTextBlockFlowEvidenceV2({
      initialFlow,
      evidenceInput: unsafeBreaks,
      bindProductionLayout: true,
    })
    expect(semantic).toMatchObject({
      status: "blocked",
      evidence: null,
    })
    expect(semantic.issues.map(({ code, path }) => ({ code, path }))).toEqual([
      { code: "production-binding-forbidden", path: "bindProductionLayout" },
      { code: "invalid-break-offsets", path: "evidenceInput.breakOffsets[1]" },
      { code: "invalid-break-offsets", path: "evidenceInput.breakOffsets" },
    ])

    const withLines = Object.assign(evidenceInputFor(initialFlow), {
      lines: [{ index: 0, renderStartOffset: 0, renderEndOffset: 2 }],
    })
    expect(callUnknown({ initialFlow, evidenceInput: withLines })).toMatchObject({
      status: "blocked",
      evidence: null,
      issues: [{
        code: "invalid-input",
        path: "evidenceInput",
      }],
    })
  })
})
