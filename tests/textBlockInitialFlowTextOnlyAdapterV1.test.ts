import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockMultiRunLayoutV1,
  adaptVNextTextBlockInitialFlowToLegacyLayoutV1,
  createVNextTextBlockInitialFlowV1,
} from "../src/index.js"
import {
  emptyGeometryBuildInputFixture,
  legacyTextOnlyBuildInputFixture,
  legacyTextOnlyLayoutRequestFixture,
  listImageGeometryBuildInputFixture,
} from "./helpers/textBlockInitialFlowV1.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function deepFreeze<T>(value: T): T {
  if (value == null || typeof value !== "object" || Object.isFrozen(value)) return value
  Object.values(value).forEach((item) => deepFreeze(item))
  return Object.freeze(value)
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
