import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function runBrowserTimingSmoke() {
  const output = execFileSync(process.execPath, ["scripts/browser-smoke.mjs"], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
  })

  return JSON.parse(output) as {
    environment: {
      browserDriver: string
      dependencyFree: boolean
      productionBenchmark: boolean
      runtime: string
    }
    fixture: {
      nodeCount: number
      path: string
      sectionCount: number
      textBlockCount: number
    }
    measurements: Array<{
      durationMs: number
      name: string
      status: "passed" | "warning"
      thresholdMs: number
    }>
    mode: string
    source: string
    status: "passed" | "warning"
    summary: {
      maxDurationMs: number
      operationCount: number
      totalDurationMs: number
      warningCount: number
    }
    thresholds: {
      maxOperationDurationMs: number
      maxTotalDurationMs: number
    }
    version: number
  }
}

describe("template-builder browser timing smoke boundary", () => {
  it("produces bounded timing JSON for the sandbox browser-runtime path", () => {
    const result = runBrowserTimingSmoke()

    expect(result).toMatchObject({
      source: "flowdoc-browser-timing-smoke",
      mode: "sandbox-runtime-timing-smoke",
      version: 1,
      status: "passed",
      environment: {
        browserDriver: "not-bound",
        dependencyFree: true,
        productionBenchmark: false,
        runtime: "node-sandbox-browser-shell",
      },
      fixture: {
        path: "fixtures/product-report-vnext.flowdoc.json",
        sectionCount: 3,
      },
      thresholds: {
        maxOperationDurationMs: 2500,
        maxTotalDurationMs: 8000,
      },
    })
    expect(result.fixture.nodeCount).toBeGreaterThanOrEqual(52)
    expect(result.fixture.textBlockCount).toBeGreaterThanOrEqual(28)
    expect(result.measurements.map((measurement) => measurement.name)).toEqual([
      "initial-snapshot-boot",
      "node-selection-jump",
      "visible-range-apply",
      "scroll-update",
      "structural-command-apply",
      "rich-inline-draft-open",
      "rich-inline-commit",
    ])
    expect(result.summary).toMatchObject({
      operationCount: 7,
      warningCount: 0,
    })
    expect(result.summary.totalDurationMs).toBeLessThanOrEqual(result.thresholds.maxTotalDurationMs)
    result.measurements.forEach((measurement) => {
      expect(Number.isFinite(measurement.durationMs)).toBe(true)
      expect(measurement.durationMs).toBeGreaterThanOrEqual(0)
      expect(measurement.durationMs).toBeLessThanOrEqual(measurement.thresholdMs)
      expect(measurement.status).toBe("passed")
    })
  }, 20_000)

  it("keeps browser timing smoke tooling outside core dependencies and production thresholds", () => {
    const script = readFileSync(new URL("../examples/template-builder-sandbox/scripts/browser-smoke.mjs", import.meta.url), "utf8")
    const sandboxPackage = readFileSync(new URL("../examples/template-builder-sandbox/package.json", import.meta.url), "utf8")
    const corePackage = readFileSync(new URL("../package.json", import.meta.url), "utf8")

    expect(sandboxPackage).toContain('"browser-smoke": "node ./scripts/browser-smoke.mjs"')
    expect(script).toContain("productionBenchmark: false")
    expect(script).toContain('browserDriver: "not-bound"')
    expect(script).toContain("maxOperationDurationMs")
    expect(script).not.toMatch(/from ["'](?:playwright|puppeteer)["']/)
    expect(script).not.toMatch(/require\(["'](?:playwright|puppeteer)["']\)/)
    expect(sandboxPackage).not.toMatch(/playwright|puppeteer/)
    expect(corePackage).not.toMatch(/playwright|puppeteer/)
  })

  it("documents Phase 142 in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/BROWSER_TIMING_SMOKE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 142 browser timing smoke boundary.")
    expect(boundaryDoc).toContain("examples/template-builder-sandbox/scripts/browser-smoke.mjs")
    expect(boundaryDoc).toContain("browserDriver = `not-bound`")
    expect(readme).toContain("Browser timing smoke boundary")
    expect(readme).toContain("docs/BROWSER_TIMING_SMOKE_BOUNDARY.md")
    expect(ledger).toContain("| 142 | Browser timing smoke boundary | done |")
    expect(roadmap).toContain("## Phase 142: Real Browser Timing Smoke Boundary")
  })
})
