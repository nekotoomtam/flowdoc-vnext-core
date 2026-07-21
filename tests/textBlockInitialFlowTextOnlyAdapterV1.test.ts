import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  adaptVNextTextBlockInitialFlowToLegacyLayoutV1,
  createVNextCompactFingerprint,
  createVNextTextBlockInitialFlowV1,
} from "../src/index.js"
import {
  createFlowDocTextEngineMultiRunLayoutV1,
} from "../packages/text-engine-rust-wasm/src/multiRunLayout.js"
import type {
  FlowDocTextEngineMultiRunLayoutInputV1,
  FlowDocTextEngineMultiRunRuntimeV1,
} from "../packages/text-engine-rust-wasm/src/multiRunLayoutContract.js"
import {
  emptyGeometryBuildInputFixture,
  imageOnlyGeometryBuildInputFixture,
  legacyTextOnlyBuildInputFixture,
  legacyTextOnlyLayoutRequestFixture,
  listImageGeometryBuildInputFixture,
  listOnlyGeometryBuildInputFixture,
  mixedTypographyBuildInputFixture,
  mixedTypographyLayoutRequestFixture,
} from "./helpers/textBlockInitialFlowV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object" || Object.isFrozen(value)) return value
  Object.values(value).forEach((item) => deepFreeze(item))
  return Object.freeze(value)
}

function reverseObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => reverseObjectKeys(item))
  if (value == null || typeof value !== "object") return value
  return Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [
    key,
    reverseObjectKeys(item),
  ]))
}

function canonicalJson(value: unknown): string {
  if (value == null || typeof value === "string" || typeof value === "boolean" || typeof value === "number") {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`
  const source = value as Record<string, unknown>
  const entries = Object.keys(source).sort((left, right) => left < right ? -1 : left > right ? 1 : 0)
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(source[key])}`)
  return `{${entries.join(",")}}`
}

function classifiedTextFlow() {
  const result = createVNextTextBlockInitialFlowV1(legacyTextOnlyBuildInputFixture())
  if (result.status !== "classified") throw new Error("initial flow blocked")
  return result.flow
}

function producerRuntime(): FlowDocTextEngineMultiRunRuntimeV1 {
  return {
    runtimeKind: "test-mr1",
    shape({ text, fontFace }) {
      let byteOffset = 0
      const glyphs = [...text].map((scalar, index) => {
        const cluster = byteOffset
        byteOffset += new TextEncoder().encode(scalar).length
        return {
          index,
          glyphId: 10 + index,
          cluster,
          xAdvance: fontFace.weight === 700 ? 600 : 500,
          yAdvance: 0,
          xOffset: 0,
          yOffset: 0,
        }
      })
      return {
        contractVersion: 1,
        outputShapeVersion: "flowdoc-text-engine-mr1-shape-facts-v1",
        text,
        fontFaceId: fontFace.fontFaceId,
        textByteLength: new TextEncoder().encode(text).length,
        textScalarCount: [...text].length,
        unitsPerEm: fontFace.unitsPerEm,
        ascentFontUnit: fontFace.ascentFontUnit,
        descentFontUnit: fontFace.descentFontUnit,
        lineGapFontUnit: fontFace.lineGapFontUnit,
        glyphs,
        summary: {
          glyphCount: glyphs.length,
          missingGlyphCount: 0,
          totalAdvanceFontUnits: glyphs.reduce((sum, glyph) => sum + glyph.xAdvance, 0),
        },
      }
    },
    segment(text) {
      const terminal = new TextEncoder().encode(text).length
      return {
        contractVersion: 1,
        outputShapeVersion: "flowdoc-text-engine-mr1-segmentation-facts-v1",
        text,
        textByteLength: terminal,
        textScalarCount: [...text].length,
        breakByteOffsets: [0, terminal],
        breakUtf16Offsets: [0, text.length],
        summary: { breakCount: 2 },
      }
    },
  }
}

function producerInput(
  buildInput: ReturnType<typeof legacyTextOnlyBuildInputFixture>,
): FlowDocTextEngineMultiRunLayoutInputV1 {
  return {
    layoutId: `producer-${buildInput.textBlock.id}`,
    measurement: clone(buildInput.measurement),
    declaredLineHeightLayoutUnit: buildInput.declaredLineHeightLayoutUnit,
    paragraphStyle: {
      styleKey: buildInput.paragraphStyle.styleKey,
      runStyle: {
        fontFamilyKey: "sarabun",
        fontSize: { value: 12, unit: "pt" },
        textColor: buildInput.paragraphStyle.textColor,
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        strikethrough: false,
      },
    },
    fontFaces: buildInput.fontFaces.map((face) => {
      const authoritativeFace = face as typeof face & { fontFamilyKey?: string }
      return {
        ...clone(face),
        fontFamilyKey: authoritativeFace.fontFamilyKey ?? buildInput.paragraphFontFamilyKey,
        fontAssetPath: `assets/fonts/${face.fontFaceId}.ttf`,
      }
    }),
  }
}

function supportedStyledProducerBuildInput() {
  const input = legacyTextOnlyBuildInputFixture()
  const localStyle = {
    fontSize: { value: 18, unit: "pt" as const },
    textColor: "303030",
    fontWeight: "bold" as const,
    fontStyle: "italic" as const,
  }
  input.textBlock = clone(input.textBlock)
  const inline = input.textBlock.children[0]
  if (inline?.type !== "text") throw new Error("styled producer inline missing")
  inline.style = clone(localStyle)
  input.measurement = clone(input.measurement)
  const run = input.measurement.runs[0]
  if (run?.kind !== "text") throw new Error("styled producer run missing")
  run.localStyle = clone(localStyle)
  const regular = input.fontFaces[0]!
  input.fontFaces = [
    regular,
    {
      ...regular,
      fontFaceId: "sarabun-bold-italic",
      fontSha256: "d".repeat(64),
      weight: 700,
      style: "italic",
    },
  ]
  return input
}

function reorderedLocalStyleProducerBuildInput() {
  const input = supportedStyledProducerBuildInput()
  const localStyle = {
    fontStyle: "italic" as const,
    fontWeight: "bold" as const,
    textColor: "303030",
    fontSize: { value: 18, unit: "pt" as const },
  }
  const inline = input.textBlock.children[0]
  const run = input.measurement.runs[0]
  if (inline?.type !== "text" || run?.kind !== "text") {
    throw new Error("reordered styled producer run missing")
  }
  inline.style = localStyle
  run.localStyle = localStyle
  return input
}

function plainProducerBuildInputWithUnusedFace() {
  const input = legacyTextOnlyBuildInputFixture()
  const regular = input.fontFaces[0]!
  input.fontFaces = [
    regular,
    {
      ...regular,
      fontFaceId: "sarabun-bold-unused",
      fontSha256: "c".repeat(64),
      weight: 700,
    },
  ]
  return input
}

function authoritativeFamilyProducerBuildInput() {
  const input = supportedStyledProducerBuildInput()
  const regular = input.fontFaces[0] as typeof input.fontFaces[number] & { fontFamilyKey: string }
  const desired = input.fontFaces[1] as typeof input.fontFaces[number] & { fontFamilyKey: string }
  regular.fontFamilyKey = "sarabun"
  regular.fontFamily = "Shared display label"
  desired.fontFamilyKey = "sarabun"
  desired.fontFamily = "Different display label"
  const unrelated = {
    ...desired,
    fontFaceId: "other-bold-italic",
    fontFamilyKey: "other-family",
    fontFamily: regular.fontFamily,
    fontSha256: "e".repeat(64),
  }
  input.fontFaces = [regular, desired, unrelated]
  return input
}

function withParagraphFontFamilyKey<T extends ReturnType<typeof legacyTextOnlyBuildInputFixture>>(
  input: T,
): T & { paragraphFontFamilyKey: string } {
  return Object.assign(input, { paragraphFontFamilyKey: "sarabun" })
}

function adaptUnknown(input: unknown) {
  return adaptVNextTextBlockInitialFlowToLegacyLayoutV1(input)
}

describe("TextBlock Initial Flow text-only adapter v1", () => {
  it.each([
    ["plain text", legacyTextOnlyBuildInputFixture],
    ["a supported local typography override", supportedStyledProducerBuildInput],
    ["plain text with an unused pinned face", plainProducerBuildInputWithUnusedFace],
    ["authoritative family keys despite misleading display labels", authoritativeFamilyProducerBuildInput],
  ] as const)("accepts an actual producer request for %s with exact direct-layout parity", (_name, fixture) => {
    const buildInput = withParagraphFontFamilyKey(fixture())
    const produced = createFlowDocTextEngineMultiRunLayoutV1(producerInput(buildInput), producerRuntime())
    expect(produced).toMatchObject({ status: "accepted", issues: [] })
    if (produced.status !== "accepted") throw new Error("producer fixture blocked")
    const classified = createVNextTextBlockInitialFlowV1(buildInput)
    expect(classified).toMatchObject({ status: "classified", issues: [] })
    if (classified.status !== "classified") throw new Error("initial flow fixture blocked")

    const textAtom = classified.flow.atoms.find((atom) => atom.kind === "text")
    if (textAtom?.kind !== "text") throw new Error("text atom missing")
    expect(textAtom.styleKey).toBe(buildInput.measurement.styleKey)
    expect(textAtom.resolvedGeometryStyle).toMatchObject({
      measurementStyleKey: buildInput.measurement.styleKey,
      effectiveShapingStyleKey: produced.request.shapingRuns[0]!.styleKey,
    })
    expect(produced.request.shapingRuns[0]!.styleKey).not.toBe(buildInput.measurement.styleKey)

    const adapted = adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: classified.flow,
      legacyRequest: produced.request,
    })
    expect(adapted).toMatchObject({ status: "accepted-text-subset", issues: [] })
    if (adapted.status !== "accepted-text-subset") throw new Error("producer adapter blocked")
    expect(adapted.layout).toEqual(produced.layout)
  })

  it("preserves actual producer parity when valid local style properties use non-schema insertion order", () => {
    const buildInput = withParagraphFontFamilyKey(reorderedLocalStyleProducerBuildInput())
    const produced = createFlowDocTextEngineMultiRunLayoutV1(producerInput(buildInput), producerRuntime())
    expect(produced).toMatchObject({ status: "accepted", issues: [] })
    if (produced.status !== "accepted") throw new Error("reordered producer fixture blocked")
    const sourceRun = produced.request.measurement.runs[0]
    if (sourceRun?.kind !== "text" || sourceRun.localStyle == null) {
      throw new Error("reordered producer local style missing")
    }
    expect(Object.keys(sourceRun.localStyle)).toEqual([
      "fontStyle",
      "fontWeight",
      "textColor",
      "fontSize",
    ])

    const classified = createVNextTextBlockInitialFlowV1(buildInput)
    expect(classified).toMatchObject({ status: "classified", issues: [] })
    if (classified.status !== "classified") throw new Error("reordered initial flow fixture blocked")

    const adapted = adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: classified.flow,
      legacyRequest: produced.request,
    })
    expect(adapted).toMatchObject({ status: "accepted-text-subset", issues: [] })
    if (adapted.status !== "accepted-text-subset") throw new Error("reordered producer adapter blocked")
    expect(adapted.layout).toEqual(produced.layout)
  })

  it.each([
    ["empty", ""],
    ["whitespace-only", " \t\r\n"],
  ])("blocks an %s legacy layout id before MR1 with unavailable metadata", (_name, layoutId) => {
    const flow = classifiedTextFlow()
    const request = legacyTextOnlyLayoutRequestFixture()
    request.layoutId = layoutId
    request.bindProductionLayout = true

    expect(acceptVNextTextBlockMultiRunLayoutV1(request)).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({ code: "production-binding-forbidden" }),
        expect.objectContaining({ code: "invalid-layout-id" }),
      ]),
    })
    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: flow,
      legacyRequest: request,
    })).toMatchObject({
      status: "blocked",
      initialFlowFingerprint: flow.fingerprint,
      layoutId: "unavailable",
      layout: null,
      fingerprint: null,
      issues: [expect.objectContaining({
        code: "legacy-context-mismatch",
        path: "legacyRequest",
      })],
    })
  })

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["number", 7],
    ["string", "invalid"],
    ["array", []],
    ["empty object", {}],
  ])("returns deterministic blocked metadata for a %s adapter root", (_name, runtimeInput) => {
    let result: ReturnType<typeof adaptUnknown> | undefined
    expect(() => { result = adaptUnknown(runtimeInput) }).not.toThrow()
    expect(result).toMatchObject({
      status: "blocked",
      initialFlowFingerprint: "unavailable",
      layoutId: "unavailable",
      layout: null,
      fingerprint: null,
      contracts: {
        mayPublishLayout: false,
        productionBinding: false,
      },
    })
  })

  it.each([
    ["root", () => {
      const runtimeInput: Record<string, unknown> = {}
      Object.defineProperties(runtimeInput, {
        initialFlow: { enumerable: true, get: () => { throw new Error("root getter") } },
        legacyRequest: { enumerable: true, get: () => { throw new Error("root getter") } },
      })
      return [runtimeInput, "unavailable"] as const
    }],
    ["legacy layout id", () => {
      const initialFlow = classifiedTextFlow()
      return [{
        initialFlow,
        legacyRequest: Object.defineProperty({}, "layoutId", {
          enumerable: true,
          get: () => { throw new Error("nested getter") },
        }),
      }, initialFlow.fingerprint] as const
    }],
  ] as const)("contains a throwing %s getter at the unknown runtime boundary", (_name, makeCase) => {
    const [runtimeInput, expectedInitialFlowFingerprint] = makeCase()
    let result: ReturnType<typeof adaptUnknown> | undefined
    expect(() => { result = adaptUnknown(runtimeInput) }).not.toThrow()
    expect(result).toMatchObject({
      status: "blocked",
      initialFlowFingerprint: expectedInitialFlowFingerprint,
      layoutId: "unavailable",
      layout: null,
      fingerprint: null,
    })
  })

  it("rejects a readable legacy-request accessor instead of passing reconstructed data to MR1", () => {
    const initialFlow = classifiedTextFlow()
    const legacyRequest = legacyTextOnlyLayoutRequestFixture()
    let accessorReadCount = 0
    Object.defineProperty(legacyRequest, "layoutId", {
      enumerable: true,
      get: () => {
        accessorReadCount += 1
        return "layout-legacy-1"
      },
    })

    expect(adaptUnknown({ initialFlow, legacyRequest })).toMatchObject({
      status: "blocked",
      initialFlowFingerprint: initialFlow.fingerprint,
      layoutId: "unavailable",
      layout: null,
      fingerprint: null,
      issues: [expect.objectContaining({ code: "legacy-context-mismatch" })],
    })
    expect(accessorReadCount).toBe(0)
  })

  it("preserves sparse array shape so strict validation blocks before MR1", () => {
    const initialFlow = classifiedTextFlow()
    const legacyRequest = legacyTextOnlyLayoutRequestFixture()
    legacyRequest.shapingRuns[0]!.features = new Array<string>(1)
    legacyRequest.bindProductionLayout = true

    expect(adaptUnknown({ initialFlow, legacyRequest })).toMatchObject({
      status: "blocked",
      initialFlowFingerprint: initialFlow.fingerprint,
      layoutId: "unavailable",
      layout: null,
      fingerprint: null,
      issues: [expect.objectContaining({
        code: "legacy-context-mismatch",
        path: "legacyRequest",
      })],
    })
  })

  it.each([
    ["missing", { legacyRequest: legacyTextOnlyLayoutRequestFixture() }, "unavailable"],
    ["null", { initialFlow: null, legacyRequest: legacyTextOnlyLayoutRequestFixture() }, "layout-legacy-1"],
  ])("returns blocked metadata for a %s Initial Flow", (_name, runtimeInput, expectedLayoutId) => {
    let result: ReturnType<typeof adaptUnknown> | undefined
    expect(() => { result = adaptUnknown(runtimeInput) }).not.toThrow()
    expect(result).toMatchObject({
      status: "blocked",
      initialFlowFingerprint: "unavailable",
      layoutId: expectedLayoutId,
      layout: null,
      fingerprint: null,
    })
  })

  it.each([
    ["missing request", (flow: ReturnType<typeof classifiedTextFlow>) => ({ initialFlow: flow })],
    ["null request", (flow: ReturnType<typeof classifiedTextFlow>) => ({ initialFlow: flow, legacyRequest: null })],
    ["non-object request", (flow: ReturnType<typeof classifiedTextFlow>) => ({ initialFlow: flow, legacyRequest: 7 })],
    ["missing measurement", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture() as unknown as Record<string, unknown>
      delete request.measurement
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["null measurement", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture() as unknown as Record<string, unknown>
      request.measurement = null
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["null measurement run", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture()
      ;(request.measurement.runs as unknown[])[0] = null
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["null paragraph style", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture() as unknown as Record<string, unknown>
      request.paragraphStyle = null
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["null font faces", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture() as unknown as Record<string, unknown>
      request.fontFaces = null
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["null font face", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture()
      ;(request.fontFaces as unknown[])[0] = null
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["null shaping runs", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture() as unknown as Record<string, unknown>
      request.shapingRuns = null
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["null shaping run", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture()
      ;(request.shapingRuns as unknown[])[0] = null
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["null shaping cluster", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture()
      ;(request.shapingRuns[0]!.clusters as unknown[])[0] = null
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["null line", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture()
      ;(request.lines as unknown[])[0] = null
      return { initialFlow: flow, legacyRequest: request }
    }],
  ])("returns blocked metadata for a malformed legacy %s", (_name, makeInput) => {
    const flow = classifiedTextFlow()
    let result: ReturnType<typeof adaptUnknown> | undefined
    expect(() => { result = adaptUnknown(makeInput(flow)) }).not.toThrow()
    expect(result).toMatchObject({
      status: "blocked",
      initialFlowFingerprint: _name === "missing request" ? "unavailable" : flow.fingerprint,
      layout: null,
      fingerprint: null,
    })
  })

  it.each([
    ["adapter root", (flow: ReturnType<typeof classifiedTextFlow>) => ({
      initialFlow: flow,
      legacyRequest: legacyTextOnlyLayoutRequestFixture(),
      untrustedRoot: true,
    })],
    ["measurement", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture()
      ;(request.measurement as unknown as Record<string, unknown>).untrustedMeasurement = true
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["measurement run", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture()
      ;(request.measurement.runs[0] as unknown as Record<string, unknown>).untrustedRun = true
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["paragraph style", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture()
      ;(request.paragraphStyle as unknown as Record<string, unknown>).untrustedStyle = true
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["font face", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture()
      ;(request.fontFaces[0] as unknown as Record<string, unknown>).untrustedFace = true
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["shaping run", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture()
      ;(request.shapingRuns[0] as unknown as Record<string, unknown>).untrustedShaping = true
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["cluster", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture()
      ;(request.shapingRuns[0]!.clusters[0] as unknown as Record<string, unknown>).untrustedCluster = true
      return { initialFlow: flow, legacyRequest: request }
    }],
    ["line", (flow: ReturnType<typeof classifiedTextFlow>) => {
      const request = legacyTextOnlyLayoutRequestFixture()
      ;(request.lines[0] as unknown as Record<string, unknown>).untrustedLine = true
      return { initialFlow: flow, legacyRequest: request }
    }],
  ])("rejects an unknown nested field at %s", (_name, makeInput) => {
    const flow = classifiedTextFlow()
    expect(adaptUnknown(makeInput(flow))).toMatchObject({
      status: "blocked",
      initialFlowFingerprint: _name === "adapter root" ? "unavailable" : flow.fingerprint,
      layout: null,
      fingerprint: null,
    })
  })

  it("preserves the exact accepted MR1 text layout behind an explicit boundary", () => {
    const flow = classifiedTextFlow()
    const request = legacyTextOnlyLayoutRequestFixture()
    const before = JSON.stringify({ flow, request })
    const direct = acceptVNextTextBlockMultiRunLayoutV1(request)
    const adapted = adaptVNextTextBlockInitialFlowToLegacyLayoutV1({ initialFlow: flow, legacyRequest: request })

    expect(direct.status).toBe("accepted")
    expect(adapted).toMatchObject({
      status: "accepted-text-subset",
      initialFlowFingerprint: flow.fingerprint,
      layoutId: request.layoutId,
      contracts: {
        legacyTextSubsetOnly: true,
        completeGeometryClassified: true,
        rendererMayMeasureText: false,
        rendererMayRelayout: false,
        mayPublishLayout: false,
        productionBinding: false,
      },
      issues: [],
    })
    if (adapted.status !== "accepted-text-subset" || direct.status !== "accepted") {
      throw new Error("legacy adapter blocked")
    }
    expect(adapted.layout).toEqual(direct)
    expect(JSON.stringify({ flow, request })).toBe(before)
  })

  it("refuses list/image/empty capability rows before legacy layout", () => {
    const imageResult = createVNextTextBlockInitialFlowV1(listImageGeometryBuildInputFixture())
    if (imageResult.status !== "classified") throw new Error("image flow blocked")
    const emptyResult = createVNextTextBlockInitialFlowV1(emptyGeometryBuildInputFixture())
    if (emptyResult.status !== "classified") throw new Error("empty flow blocked")
    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: imageResult.flow,
      legacyRequest: legacyTextOnlyLayoutRequestFixture(),
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "initial-flow-capability-required" })],
    })
    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: emptyResult.flow,
      legacyRequest: legacyTextOnlyLayoutRequestFixture(),
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "initial-flow-capability-required" })],
    })
  })

  it.each([
    ["list-only", listOnlyGeometryBuildInputFixture],
    ["inline-image-only", imageOnlyGeometryBuildInputFixture],
  ] as const)("refuses the %s capability row before legacy MR1", (_name, fixture) => {
    const classified = createVNextTextBlockInitialFlowV1(fixture())
    if (classified.status !== "classified") throw new Error("capability flow blocked")

    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: classified.flow,
      legacyRequest: legacyTextOnlyLayoutRequestFixture(),
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "initial-flow-capability-required" })],
    })
  })

  it("ignores unused retained faces while canonicalizing the used font context", () => {
    const input = legacyTextOnlyBuildInputFixture()
    const extraFace = {
      ...input.fontFaces[0]!,
      fontFaceId: "sarabun-bold",
      fontSha256: "b".repeat(64),
      weight: 700,
    }
    input.fontFaces = [input.fontFaces[0]!, extraFace]
    const result = createVNextTextBlockInitialFlowV1(input)
    if (result.status !== "classified") throw new Error("initial flow blocked")

    const request = legacyTextOnlyLayoutRequestFixture()
    request.fontFaces = [request.fontFaces[0]!]

    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: result.flow,
      legacyRequest: request,
    })).toMatchObject({
      status: "accepted-text-subset",
      issues: [],
    })
  })

  it("rejects a frozen flow with only a fingerprint-shaped forgery", () => {
    const forgedFlow = clone(classifiedTextFlow())
    forgedFlow.measurement.instanceRevision += 1
    forgedFlow.fingerprint = `sha256:${"0".repeat(64)}`
    deepFreeze(forgedFlow)

    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: forgedFlow,
      legacyRequest: legacyTextOnlyLayoutRequestFixture(),
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-initial-flow" })],
    })
  })

  it("rejects a deep-frozen clone with a fully recomputed public fingerprint", () => {
    const forgedFlow = clone(classifiedTextFlow())
    const { fingerprint: genuineFingerprint, ...genuineFacts } = forgedFlow
    expect(createVNextCompactFingerprint(canonicalJson(genuineFacts))).toBe(genuineFingerprint)
    forgedFlow.role = { role: "heading", level: 2 }
    const { fingerprint: _fingerprint, ...facts } = forgedFlow
    forgedFlow.fingerprint = createVNextCompactFingerprint(canonicalJson(facts))
    deepFreeze(forgedFlow)

    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: forgedFlow,
      legacyRequest: legacyTextOnlyLayoutRequestFixture(),
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-initial-flow" })],
    })
  })

  it("binds the classified declared line height before legacy invocation", () => {
    const flow = classifiedTextFlow()
    const drift = legacyTextOnlyLayoutRequestFixture()
    drift.declaredLineHeightLayoutUnit = 30_000_000

    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: flow,
      legacyRequest: drift,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "legacy-context-mismatch" })],
    })
  })

  it("accepts mixed size, color, bold, and italic shaping facts that match classified typography", () => {
    const classified = createVNextTextBlockInitialFlowV1(mixedTypographyBuildInputFixture())
    if (classified.status !== "classified") throw new Error("mixed typography flow blocked")

    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: classified.flow,
      legacyRequest: mixedTypographyLayoutRequestFixture(),
    })).toMatchObject({ status: "accepted-text-subset", issues: [] })
  })

  it("blocks stale regular 12pt shaping facts for an authored bold 24pt run", () => {
    const classified = createVNextTextBlockInitialFlowV1(mixedTypographyBuildInputFixture())
    if (classified.status !== "classified") throw new Error("mixed typography flow blocked")
    const stale = mixedTypographyLayoutRequestFixture()
    const staleBold = stale.shapingRuns[1]
    if (staleBold == null) throw new Error("bold shaping fixture missing")
    staleBold.fontFaceId = "sarabun-regular"
    staleBold.fontSizeLayoutUnit = 12_000_000
    staleBold.textColor = "202020"

    expect(acceptVNextTextBlockMultiRunLayoutV1(stale)).toMatchObject({ status: "accepted" })
    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: classified.flow,
      legacyRequest: stale,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "legacy-context-mismatch" })],
    })
  })

  it("accepts equivalent legacy measurement facts with reordered object properties", () => {
    const flow = classifiedTextFlow()
    const request = legacyTextOnlyLayoutRequestFixture()
    request.measurement = reverseObjectKeys(request.measurement) as typeof request.measurement

    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({ initialFlow: flow, legacyRequest: request })).toMatchObject({
      status: "accepted-text-subset",
      issues: [],
    })
  })

  it("blocks cloned flow, request-context drift, and production binding", () => {
    const flow = classifiedTextFlow()
    const clonedFlow = clone(flow)

    const measurementDrift = legacyTextOnlyLayoutRequestFixture()
    measurementDrift.measurement = clone(measurementDrift.measurement)
    measurementDrift.measurement.instanceRevision += 1

    const fontDrift = legacyTextOnlyLayoutRequestFixture()
    fontDrift.fontFaces = clone(fontDrift.fontFaces)
    fontDrift.fontFaces[0]!.fontSha256 = "c".repeat(64)

    const production = legacyTextOnlyLayoutRequestFixture()
    production.bindProductionLayout = true

    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: clonedFlow,
      legacyRequest: legacyTextOnlyLayoutRequestFixture(),
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-initial-flow" })],
    })
    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: flow,
      legacyRequest: measurementDrift,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "legacy-context-mismatch" })],
    })
    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: flow,
      legacyRequest: fontDrift,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "legacy-context-mismatch" })],
    })
    expect(adaptVNextTextBlockInitialFlowToLegacyLayoutV1({
      initialFlow: flow,
      legacyRequest: production,
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "legacy-layout-rejected" })],
    })
  })
})
