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

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

describe("vNext generation runtime", () => {
  it("accepts canonical package generation requests", () => {
    const pack = fixtureValue("product-report-vnext-minimal.flowdoc.json")
    const parsed = safeParseVNextGenerationRequest({
      requestId: "request-1",
      idempotencyKey: "idem-1",
      template: { package: pack },
      output: { kind: "diagnostics", measurementProfileId: "server-default" },
    })

    expect(parsed.ok).toBe(true)
    if (!parsed.ok) throw new Error(parsed.issues.map((issue) => issue.message).join("\n"))
    expect(parsed.request).toMatchObject({
      requestId: "request-1",
      idempotencyKey: "idem-1",
      template: {
        kind: "inline-package",
        package: {
          packageVersion: 2,
          document: { version: 3 },
        },
      },
      output: { kind: "diagnostics", measurementProfileId: "server-default" },
    })

    const readiness = assessVNextGenerationReadiness({
      requestId: "request-1",
      idempotencyKey: "idem-1",
      template: { package: pack },
      output: { kind: "diagnostics", measurementProfileId: "server-default" },
    })

    expect(readiness).toMatchObject({
      ok: true,
      source: "vnext-generation-runtime",
      mode: "readiness-only",
      status: "ready",
      request: {
        requestId: "request-1",
        idempotencyKey: "idem-1",
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
        package: { status: "ready", issues: [] },
        document: { status: "ready", graphIssueCount: 0, issues: [] },
        keyData: {
          status: "ready",
          summary: {
            errorCount: 0,
            warningCount: 0,
            dataProvided: true,
          },
        },
      },
      artifact: null,
      generatedDocument: null,
      issues: [],
    })
  })

  it("rejects raw current-runtime-shaped document input as a template package", () => {
    const result = assessVNextGenerationReadiness({
      template: {
        package: {
          version: 3,
          document: {
            id: "raw-doc",
            meta: { title: "Raw Doc" },
            sections: [],
          },
        },
      },
      output: { kind: "diagnostics" },
    })

    expect(result).toMatchObject({
      ok: false,
      status: "blocked",
      reason: "unsupported-version",
      template: {
        id: null,
        packageVersion: null,
        documentVersion: null,
      },
      diagnostics: {
        package: {
          status: "blocked",
        },
        keyData: null,
      },
      artifact: null,
      generatedDocument: null,
    })
    expect(result.diagnostics.package.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "package",
          path: "template.package.packageVersion",
        }),
      ]),
    )
  })

  it("reports request data validation separately from package errors", () => {
    const pack = cloneJson(fixtureValue("product-report-vnext-minimal.flowdoc.json"))
    const result = assessVNextGenerationReadiness({
      requestId: "bad-data",
      template: { package: pack },
      data: {
        version: 1,
        values: {
          "report.total": "not a number",
        },
      },
      output: { kind: "diagnostics" },
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error(result.issues.map((issue) => issue.message).join("\n"))
    expect(result).toMatchObject({
      status: "blocked",
      request: {
        requestId: "bad-data",
        outputKind: "diagnostics",
        dataSource: "request",
      },
      diagnostics: {
        package: { status: "ready", issues: [] },
        document: { status: "ready", issues: [] },
        keyData: {
          status: "blocked",
          issues: [{
            severity: "error",
            code: "invalid-data-value-type",
            key: "report.total",
            path: "data.values.report.total",
          }],
        },
      },
      issues: [{
        severity: "error",
        category: "key-data",
        code: "invalid-data-value-type",
        path: "data.values.report.total",
      }],
    })
  })

  it("does not render artifacts during readiness-only assessment", () => {
    const pack = fixtureValue("product-report-vnext-minimal.flowdoc.json")
    const result = assessVNextGenerationReadiness({
      template: { package: pack },
      output: { kind: "pdf", measurementProfileId: "server-pdf" },
    })

    expect(result).toMatchObject({
      ok: true,
      mode: "readiness-only",
      request: {
        outputKind: "pdf",
        measurementProfileId: "server-pdf",
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
          requestedKind: "pdf",
        },
      },
      artifact: null,
    })
  })

  it("does not return generated output as authored document state", () => {
    const pack = fixtureValue("product-report-vnext-minimal.flowdoc.json")
    const result = assessVNextGenerationReadiness({
      template: { package: pack },
      output: { kind: "preview" },
    })

    expect(result.ok).toBe(true)
    expect(result.artifact).toBeNull()
    expect(result.generatedDocument).toBeNull()
    expect("document" in result).toBe(false)
    expect("package" in result).toBe(false)
  })

  it("keeps the generation runtime independent from routes, parent runtime, and render execution", () => {
    const sourceUrl = new URL("../src/generation/runtime.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toContain("/api/paginate")
    expect(source).not.toContain("/api/export")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("buildVNextMeasuredRendererConsumption")
    expect(source).not.toContain("assessVNextMeasuredPaginationExportReadiness")
  })
})
