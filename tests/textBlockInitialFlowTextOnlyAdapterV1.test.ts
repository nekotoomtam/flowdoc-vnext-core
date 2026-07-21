import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  adaptVNextTextBlockInitialFlowToLegacyLayoutV1,
  createVNextCompactFingerprint,
  createVNextTextBlockInitialFlowV1,
} from "../src/index.js"
import {
  emptyGeometryBuildInputFixture,
  legacyTextOnlyBuildInputFixture,
  legacyTextOnlyLayoutRequestFixture,
  listImageGeometryBuildInputFixture,
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

describe("TextBlock Initial Flow text-only adapter v1", () => {
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

  it("matches equivalent font context after canonicalization", () => {
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
    request.fontFaces = [extraFace, request.fontFaces[0]!]

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
