import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  assessVNextGenerationReadiness,
  safeParseVNextGenerationRequest,
} from "../src/index.js"

function fixtureValue(name: string): unknown {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown
}

describe("vNext generation runtime retained contract", () => {
  it("assesses package/data readiness without a route envelope", () => {
    const pack = fixtureValue("product-report-vnext-minimal.flowdoc.json")
    const result = assessVNextGenerationReadiness({
      requestId: "runtime-request-1",
      idempotencyKey: "runtime-idem-1",
      template: { package: pack },
      output: { kind: "diagnostics", measurementProfileId: "server-default" },
    })

    expect(result).toMatchObject({
      ok: true,
      source: "vnext-generation-runtime",
      mode: "readiness-only",
      status: "ready",
      request: {
        requestId: "runtime-request-1",
        idempotencyKey: "runtime-idem-1",
        outputKind: "diagnostics",
        measurementProfileId: "server-default",
        dataSource: "package",
      },
      template: {
        id: "product-report-vnext-minimal",
        packageVersion: 2,
        documentVersion: 3,
        title: "Product Report vNext Minimal",
        fieldCount: 2,
      },
      diagnostics: {
        exactLayout: {
          status: "not-run",
          reason: "readiness-only",
          finalTruth: "measured-pagination",
        },
        artifact: {
          status: "not-rendered",
          reason: "readiness-only",
          requestedKind: "diagnostics",
        },
      },
      artifact: null,
      generatedDocument: null,
      issues: [],
    })
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("keeps request parsing failures inside the retained runtime issue vocabulary", () => {
    const parsed = safeParseVNextGenerationRequest({
      template: {},
      output: { kind: "diagnostics" },
    })
    const result = assessVNextGenerationReadiness({
      template: {},
      output: { kind: "diagnostics" },
    })

    expect(parsed).toMatchObject({
      ok: false,
      reason: "invalid-request",
      issues: [
        expect.objectContaining({
          severity: "error",
          category: "request",
          path: "template.package",
        }),
      ],
    })
    expect(result).toMatchObject({
      ok: false,
      source: "vnext-generation-runtime",
      mode: "readiness-only",
      status: "blocked",
      reason: "invalid-request",
      template: {
        id: null,
        packageVersion: null,
        documentVersion: null,
      },
      diagnostics: {
        request: {
          status: "blocked",
        },
      },
      artifact: null,
      generatedDocument: null,
    })
  })

  it("reports valid-request data blockers without converting them into HTTP status", () => {
    const pack = fixtureValue("product-report-vnext-minimal.flowdoc.json")
    const result = assessVNextGenerationReadiness({
      requestId: "runtime-bad-data",
      template: { package: pack },
      data: {
        version: 1,
        values: {
          "report.total": "not a number",
        },
      },
      output: { kind: "pdf", measurementProfileId: "server-pdf" },
    })

    expect(result).toMatchObject({
      ok: true,
      source: "vnext-generation-runtime",
      mode: "readiness-only",
      status: "blocked",
      request: {
        requestId: "runtime-bad-data",
        outputKind: "pdf",
        measurementProfileId: "server-pdf",
        dataSource: "request",
      },
      diagnostics: {
        keyData: {
          status: "blocked",
        },
        artifact: {
          status: "not-rendered",
          requestedKind: "pdf",
        },
      },
      artifact: null,
      generatedDocument: null,
    })
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "key-data",
          code: "invalid-data-value-type",
        }),
      ]),
    )
  })

  it("keeps the retained generation runtime independent from route and execution concerns", () => {
    const source = readFileSync(new URL("../src/generation/runtime.ts", import.meta.url), "utf8")

    expect(source).toContain("assessVNextGenerationReadiness")
    expect(source).toContain("safeParseVNextGenerationRequest")
    expect(source).toContain('mode: "readiness-only"')
    expect(source).not.toContain("createVNextGenerationApiRouteResponse")
    expect(source).not.toMatch(/httpStatus|allowedMethods|cache-control|method-not-allowed/)
    expect(source).not.toMatch(/node:http|node:https|express|fastify/)
    expect(source).not.toContain("flowdoc-vnext-backend")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("buildVNextMeasuredRendererConsumption")
    expect(source).not.toContain("assessVNextMeasuredPaginationExportReadiness")
  })
})
