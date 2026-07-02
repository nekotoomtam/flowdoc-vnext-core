import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextGenerationApiRouteResponse,
  VNEXT_GENERATION_API_ROUTE_ACTION,
  VNEXT_GENERATION_API_ROUTE_MODE,
  VNEXT_GENERATION_API_ROUTE_SOURCE,
} from "../src/index.js"

const ROUTE_HELPER_COMPATIBILITY_WINDOW = "Window B route-helper compatibility test"

function fixtureValue(name: string): unknown {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown
}

describe("vNext generation API route boundary", () => {
  it("marks this route-helper suite as compatibility-window coverage", () => {
    expect(ROUTE_HELPER_COMPATIBILITY_WINDOW).toContain("Window B")
  })

  it("wraps generation readiness as a route-safe POST response", () => {
    const pack = fixtureValue("product-report-vnext-minimal.flowdoc.json")
    const response = createVNextGenerationApiRouteResponse({
      method: "POST",
      body: {
        requestId: "route-request-1",
        idempotencyKey: "route-idem-1",
        template: { package: pack },
        output: { kind: "diagnostics", measurementProfileId: "server-default" },
      },
    })

    expect(response).toMatchObject({
      ok: true,
      source: VNEXT_GENERATION_API_ROUTE_SOURCE,
      mode: VNEXT_GENERATION_API_ROUTE_MODE,
      action: VNEXT_GENERATION_API_ROUTE_ACTION,
      method: "POST",
      allowedMethods: ["POST"],
      httpStatus: 200,
      headers: {
        allow: "POST",
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      },
      body: {
        source: VNEXT_GENERATION_API_ROUTE_SOURCE,
        mode: VNEXT_GENERATION_API_ROUTE_MODE,
        action: VNEXT_GENERATION_API_ROUTE_ACTION,
        artifact: null,
        generatedDocument: null,
        issues: [],
        result: {
          ok: true,
          source: "vnext-generation-runtime",
          mode: "readiness-only",
          status: "ready",
          request: {
            requestId: "route-request-1",
            idempotencyKey: "route-idem-1",
            outputKind: "diagnostics",
            measurementProfileId: "server-default",
          },
          artifact: null,
          generatedDocument: null,
        },
      },
    })
  })

  it("maps invalid generation requests to a bounded 400 response", () => {
    const response = createVNextGenerationApiRouteResponse({
      method: "post",
      body: {
        template: {},
        output: { kind: "diagnostics" },
      },
    })

    expect(response).toMatchObject({
      ok: false,
      method: "POST",
      httpStatus: 400,
      body: {
        result: {
          ok: false,
          status: "blocked",
          reason: "invalid-request",
          artifact: null,
          generatedDocument: null,
        },
        artifact: null,
        generatedDocument: null,
      },
    })
    expect(response.body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "request",
          path: "template.package",
        }),
      ]),
    )
  })

  it("keeps readiness blockers in a successful route envelope when the request is valid", () => {
    const pack = fixtureValue("product-report-vnext-minimal.flowdoc.json")
    const response = createVNextGenerationApiRouteResponse({
      body: {
        requestId: "route-bad-data",
        template: { package: pack },
        data: {
          version: 1,
          values: {
            "report.total": "not a number",
          },
        },
        output: { kind: "pdf", measurementProfileId: "server-pdf" },
      },
    })

    expect(response).toMatchObject({
      ok: true,
      method: "POST",
      httpStatus: 200,
      body: {
        result: {
          ok: true,
          status: "blocked",
          request: {
            requestId: "route-bad-data",
            outputKind: "pdf",
            measurementProfileId: "server-pdf",
            dataSource: "request",
          },
          diagnostics: {
            artifact: {
              status: "not-rendered",
              requestedKind: "pdf",
            },
            exactLayout: {
              status: "not-run",
            },
          },
          artifact: null,
          generatedDocument: null,
        },
      },
    })
    expect(response.body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "key-data",
          code: "invalid-data-value-type",
        }),
      ]),
    )
  })

  it("rejects non-POST methods without invoking artifact work", () => {
    const response = createVNextGenerationApiRouteResponse({
      method: "GET",
      body: {
        template: { package: fixtureValue("product-report-vnext-minimal.flowdoc.json") },
        output: { kind: "diagnostics" },
      },
    })

    expect(response).toEqual({
      ok: false,
      source: "vnext-generation-api-route",
      mode: "readiness-route",
      action: "generation.assess",
      method: "GET",
      allowedMethods: ["POST"],
      httpStatus: 405,
      headers: {
        allow: "POST",
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      },
      body: {
        source: "vnext-generation-api-route",
        mode: "readiness-route",
        action: "generation.assess",
        result: null,
        artifact: null,
        generatedDocument: null,
        issues: [{
          severity: "error",
          category: "request",
          code: "method-not-allowed",
          path: "method",
          message: "generation readiness route accepts POST, received GET",
        }],
      },
    })
  })

  it("keeps the route boundary independent from servers, storage, parent routes, and render execution", () => {
    const sourceUrl = new URL("../src/generation/apiRoute.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("assessVNextGenerationReadiness")
    expect(source).not.toMatch(/node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toContain("/api/paginate")
    expect(source).not.toContain("/api/export")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("buildVNextMeasuredRendererConsumption")
    expect(source).not.toContain("assessVNextMeasuredPaginationExportReadiness")
  })

  it("documents the generation API route boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/GENERATION_API_ROUTE_BOUNDARY.md")
    const runtimePlan = readText("../docs/BACKEND_GENERATION_RUNTIME_PLAN.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 86 implementation boundary.")
    expect(boundaryDoc).toContain("src/generation/apiRoute.ts")
    expect(boundaryDoc).toContain("This is a generation API route boundary.")
    expect(boundaryDoc).toContain("It is not a concrete server route.")
    expect(boundaryDoc).toContain("artifacts remain `not-rendered`")
    expect(runtimePlan).toContain("## Phase 86 Route Boundary")
    expect(readme).toContain("Generation API route boundary")
    expect(readme).toContain("docs/GENERATION_API_ROUTE_BOUNDARY.md")
    expect(ledger).toContain("| 86 | Generation API route boundary | done |")
    expect(roadmap).toContain("## Phase 86: Generation API Route Boundary")
  })
})
