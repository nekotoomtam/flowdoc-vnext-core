import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockInitialFlowV1,
  inspectVNextTextBlockInitialFlowRequestBindingV1,
} from "../src/index.js"
import {
  imageOnlyGeometryBuildInputFixture,
  legacyTextOnlyBuildInputFixture,
  legacyTextOnlyLayoutRequestFixture,
  listOnlyGeometryBuildInputFixture,
  renderedEmptyFieldGeometryBuildInputFixture,
} from "./helpers/textBlockInitialFlowV1.js"

function acceptedFlow() {
  const built = createVNextTextBlockInitialFlowV1(
    legacyTextOnlyBuildInputFixture(),
  )
  if (built.status !== "classified") throw new Error("Initial Flow fixture blocked")
  return built.flow
}

describe("inspectVNextTextBlockInitialFlowRequestBindingV1", () => {
  it("binds exact Initial Flow and request facts without executing layout", () => {
    const flow = acceptedFlow()
    const request = legacyTextOnlyLayoutRequestFixture()
    const result = inspectVNextTextBlockInitialFlowRequestBindingV1({
      initialFlow: flow,
      request,
    })

    expect(result).toMatchObject({
      status: "accepted",
      initialFlow: flow,
      initialFlowFingerprint: flow.fingerprint,
      layoutId: request.layoutId,
      contentWidthLayoutUnit: request.availableWidthLayoutUnit,
      issues: [],
    })
    if (result.status !== "accepted") throw new Error("binding blocked")
    expect(result.request).toEqual(request)
    expect(result.request).not.toBe(request)
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.request)).toBe(true)

    const source = readFileSync(
      resolve("src/layout/textBlockInitialFlowRequestBindingV1.ts"),
      "utf8",
    )
    expect(source).not.toContain("acceptVNextTextBlockMultiRunLayoutV1")
    expect(source).not.toContain("layoutVNextTextBlockSpatialWrappingV1")
  })

  it("blocks request context drift and unsupported geometry capability rows", () => {
    const flow = acceptedFlow()
    const widthDrift = legacyTextOnlyLayoutRequestFixture()
    widthDrift.availableWidthLayoutUnit -= 1

    expect(inspectVNextTextBlockInitialFlowRequestBindingV1({
      initialFlow: flow,
      request: widthDrift,
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "request-context-mismatch", path: "request" }],
    })

    for (const buildInput of [
      listOnlyGeometryBuildInputFixture(),
      imageOnlyGeometryBuildInputFixture(),
      renderedEmptyFieldGeometryBuildInputFixture(),
    ]) {
      const built = createVNextTextBlockInitialFlowV1(buildInput)
      if (built.status !== "classified") throw new Error("capability fixture blocked")
      expect(inspectVNextTextBlockInitialFlowRequestBindingV1({
        initialFlow: built.flow,
        request: legacyTextOnlyLayoutRequestFixture(),
      })).toMatchObject({
        status: "blocked",
        issues: [{ code: "initial-flow-capability-required" }],
      })
    }
  })

  it("rejects unknown roots, request accessors, and cloned Initial Flow", () => {
    const flow = acceptedFlow()
    const request = legacyTextOnlyLayoutRequestFixture()
    let getterCount = 0
    const accessorRoot = Object.create(null)
    Object.defineProperty(accessorRoot, "initialFlow", {
      enumerable: true,
      get() {
        getterCount += 1
        return flow
      },
    })
    Object.defineProperty(accessorRoot, "request", {
      enumerable: true,
      value: request,
    })

    expect(inspectVNextTextBlockInitialFlowRequestBindingV1(accessorRoot))
      .toMatchObject({
        status: "blocked",
        issues: [{ code: "invalid-binding-input", path: "input" }],
      })
    expect(getterCount).toBe(0)

    const cloned = JSON.parse(JSON.stringify(flow))
    expect(inspectVNextTextBlockInitialFlowRequestBindingV1({
      initialFlow: cloned,
      request,
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "invalid-initial-flow", path: "initialFlow" }],
    })
  })

  it("rejects non-enumerable required root data properties", () => {
    const flow = acceptedFlow()
    const request = legacyTextOnlyLayoutRequestFixture()

    for (const key of ["initialFlow", "request"] as const) {
      const envelope = { initialFlow: flow, request }
      Object.defineProperty(envelope, key, {
        value: envelope[key],
        enumerable: false,
        configurable: true,
        writable: true,
      })

      expect(inspectVNextTextBlockInitialFlowRequestBindingV1(envelope))
        .toMatchObject({
          status: "blocked",
          initialFlow: null,
          request: null,
          initialFlowFingerprint: "unavailable",
          layoutId: "unavailable",
          issues: [{ code: "invalid-binding-input", path: "input" }],
        })
    }
  })
})
