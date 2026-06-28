import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

const driverFacts = {
  "active-island-commit": {
    bridgeStatus: "accepted",
    operationKind: "text-block.rich-inline.replace",
    targetTextBlockId: "cover-header-label",
  },
  "blocked-unsafe-paste": {
    blocked: true,
    reason: "unsupported-html-paste",
    unsafeDomPackageTruth: "blocked",
  },
  "delete-backspace-near-field-chip": {
    fieldChipCommand: {
      chipId: "chip-customer-name",
      command: "field-chip.delete",
    },
  },
  "focus-active-text-block-island": {
    activeElementKind: "contenteditable-island",
    focused: true,
    textBlockId: "cover-header-label",
  },
  "ime-composition-evidence": {
    compositionEndCount: 1,
    compositionStartCount: 1,
    data: "ไ",
  },
  "plain-paste": {
    pasteSource: "driver-clipboard",
    plainText: "Driver\r\npaste",
  },
  "plain-typing": {
    draftText: "Product Report typed",
    selection: { end: 20, start: 20 },
    typedText: "typed",
  },
  "selection-caret-movement": {
    caret: { end: 10, start: 10 },
    selection: { end: 7, start: 2 },
    textBlockId: "cover-header-label",
  },
}

function runDriverSmokeScenario(input: Record<string, unknown> = {}): Record<string, any> {
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
    const {
      HYBRID_INPUT_BROWSER_DRIVER_SMOKE_CASES,
      HYBRID_INPUT_BROWSER_DRIVER_SMOKE_MODE,
      HYBRID_INPUT_BROWSER_DRIVER_SMOKE_SOURCE,
      createHybridInputBrowserDriverSmokeReport,
      hybridInputBrowserDriverSmokeLabel,
    } = await import("./public/hybridInputBrowserDriverSmoke.js");

    const input = JSON.parse(process.env.FLOWDOC_TEST_DRIVER_SMOKE_INPUT || "{}");
    const report = createHybridInputBrowserDriverSmokeReport(input);
    console.log(JSON.stringify({
      cases: HYBRID_INPUT_BROWSER_DRIVER_SMOKE_CASES,
      constants: {
        mode: HYBRID_INPUT_BROWSER_DRIVER_SMOKE_MODE,
        source: HYBRID_INPUT_BROWSER_DRIVER_SMOKE_SOURCE,
      },
      label: hybridInputBrowserDriverSmokeLabel(report),
      report,
    }));
  `], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      FLOWDOC_TEST_DRIVER_SMOKE_INPUT: JSON.stringify(input),
    },
  })

  return JSON.parse(output) as Record<string, any>
}

function runDriverSmokeScript(input?: Record<string, unknown>): Record<string, any> {
  const output = execFileSync(process.execPath, ["scripts/hybrid-input-browser-driver-smoke.mjs"], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      ...(input
        ? {
          FLOWDOC_BROWSER_DRIVER: "external-driver",
          FLOWDOC_BROWSER_DRIVER_FACTS_JSON: JSON.stringify(input),
        }
        : {}),
    },
  })

  return JSON.parse(output) as Record<string, any>
}

function caseById(report: Record<string, any>, caseId: string): Record<string, any> {
  const match = report.cases.find((entry: Record<string, any>) => entry.caseId === caseId)
  if (!match) throw new Error(`Missing browser driver smoke case: ${caseId}`)
  return match
}

describe("hybrid input optional browser driver smoke boundary", () => {
  it("returns a JSON-safe blocked report when no optional browser driver facts are provided", () => {
    const result = runDriverSmokeScenario()
    const report = result.report

    expect(result.constants).toMatchObject({
      mode: "sandbox-local-optional-browser-driver-smoke-boundary",
      source: "flowdoc-hybrid-input-browser-driver-smoke",
    })
    expect(result.cases).toEqual([
      "focus-active-text-block-island",
      "selection-caret-movement",
      "plain-typing",
      "ime-composition-evidence",
      "plain-paste",
      "blocked-unsafe-paste",
      "delete-backspace-near-field-chip",
      "active-island-commit",
    ])
    expect(report.status).toBe("blocked")
    expect(report.environment).toMatchObject({
      browserDriver: "not-bound",
      browserDriverRequiredInCoreCheck: false,
      driverAvailable: false,
    })
    expect(report.summary).toMatchObject({
      blockedCount: 8,
      caseCount: 8,
      evidenceCount: 0,
      requiredCaseCount: 8,
    })
    expect(caseById(report, "focus-active-text-block-island").reason).toBe("optional-browser-driver-not-provided")
    expect(result.label).toBe("Hybrid input browser driver smoke: blocked 8 cases")
    expect(JSON.parse(JSON.stringify(report))).toEqual(report)
  })

  it("summarizes optional real-driver facts for the active island path", () => {
    const report = runDriverSmokeScenario({
      driverAvailable: true,
      driverFacts,
      driverName: "external-driver",
    }).report

    expect(report.status).toBe("passed")
    expect(report.baseline).toMatchObject({
      phase163CaseCount: 9,
      phase163Mode: "sandbox-local-hybrid-input-browser-qa-boundary",
      phase163Source: "flowdoc-hybrid-input-browser-qa",
    })
    expect(caseById(report, "focus-active-text-block-island")).toMatchObject({
      evidence: {
        focused: true,
        textBlockId: "cover-header-label",
      },
      status: "evidence",
    })
    expect(caseById(report, "selection-caret-movement")).toMatchObject({
      evidence: {
        caret: {
          collapsed: true,
          end: 10,
          start: 10,
          unit: "utf16-code-unit-offset",
        },
        selection: {
          end: 7,
          start: 2,
        },
      },
    })
    expect(caseById(report, "plain-typing")).toMatchObject({
      evidence: {
        draftText: "Product Report typed",
        packageTruth: "not-mutated",
        typedText: "typed",
      },
    })
    expect(caseById(report, "ime-composition-evidence")).toMatchObject({
      evidence: {
        compositionEndCount: 1,
        compositionStartCount: 1,
        data: "ไ",
      },
      status: "evidence",
    })
    expect(caseById(report, "plain-paste")).toMatchObject({
      evidence: {
        normalizedText: "Driver\npaste",
        pasteSource: "driver-clipboard",
      },
    })
    expect(caseById(report, "blocked-unsafe-paste")).toMatchObject({
      evidence: {
        reason: "unsupported-html-paste",
        unsafeDomPackageTruth: "blocked",
      },
      status: "blocked",
    })
    expect(caseById(report, "delete-backspace-near-field-chip")).toMatchObject({
      evidence: {
        fieldChipCommand: {
          chipId: "chip-customer-name",
          command: "field-chip.delete",
        },
      },
    })
    expect(caseById(report, "active-island-commit")).toMatchObject({
      evidence: {
        bridgeStatus: "accepted",
        operationKind: "text-block.rich-inline.replace",
        targetTextBlockId: "cover-header-label",
      },
    })
    expect(report.summary).toMatchObject({
      blockedCount: 1,
      caseCount: 8,
      evidenceCount: 7,
      requiredCaseCount: 8,
    })
  })

  it("runs the sandbox-local script with or without externally supplied driver facts", () => {
    const withoutDriver = runDriverSmokeScript()
    const withDriver = runDriverSmokeScript(driverFacts)

    expect(withoutDriver).toMatchObject({
      environment: {
        browserDriver: "not-bound",
        browserDriverRequiredInCoreCheck: false,
        driverAvailable: false,
      },
      status: "blocked",
    })
    expect(withDriver).toMatchObject({
      environment: {
        browserDriver: "external-driver",
        browserDriverRequiredInCoreCheck: false,
        driverAvailable: true,
        runner: "optional-sandbox-browser-driver-smoke-script",
      },
      status: "passed",
    })
  })

  it("keeps browser driver smoke dependency-clean and sandbox-only", () => {
    const source = readText("../examples/template-builder-sandbox/public/hybridInputBrowserDriverSmoke.js")
    const script = readText("../examples/template-builder-sandbox/scripts/hybrid-input-browser-driver-smoke.mjs")
    const packageJson = readText("../package.json")

    expect(source).toContain("HYBRID_INPUT_BROWSER_DRIVER_SMOKE_SOURCE")
    expect(source).toContain("createHybridInputBrowserDriverSmokeReport")
    expect(source).toContain("optional browser driver smoke does not mutate package data")
    expect(source).not.toContain("document.")
    expect(source).not.toContain("querySelector")
    expect(source).not.toContain("getSelection")
    expect(source).not.toContain("clipboardData")
    expect(source).not.toContain("FlowDocEditor")
    expect(source).not.toMatch(/from\s+["']\.\.\/\.\.\/src/)
    expect(script).not.toContain("playwright")
    expect(script).not.toContain("puppeteer")
    expect(packageJson).not.toContain("playwright")
    expect(packageJson).not.toContain("puppeteer")
  })

  it("documents Phase 164 and advances the roadmap without production readiness claims", () => {
    const doc = readText("../docs/HYBRID_INPUT_OPTIONAL_BROWSER_DRIVER_SMOKE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const phase163Test = readText("./hybridInputBrowserQa.test.ts")

    expect(doc).toContain("Status: Phase 164 optional browser driver smoke boundary.")
    expect(doc).toContain("This boundary does not claim production browser or contenteditable readiness.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("No browser automation dependency was added to `@flowdoc/vnext-core`.")
    expect(doc).toContain("Next recommended phase: Phase 165: Hybrid Input Browser Evidence Close Audit.")
    expect(readme).toContain("Optional browser driver smoke boundary")
    expect(readme).toContain("docs/HYBRID_INPUT_OPTIONAL_BROWSER_DRIVER_SMOKE_BOUNDARY.md")
    expect(ledger).toContain("| 164 | Optional browser driver smoke boundary | done |")
    expect(roadmap).toContain("## Phase 164: Optional Browser Driver Smoke Boundary")
    expect(roadmap).toContain("## Phase 165: Hybrid Input Browser Evidence Close Audit")
    expect(roadmap).toContain("## Phase 166: Hybrid Input Hardening Threshold Plan")
    expect(roadmap).toContain("## Phase 167: Browser Matrix Decision")
    expect(roadmap).toContain("## Phase 168: Guarded Input Integration Plan")
    expect(roadmap).toContain("## Phase 169: Guarded Input Runtime Slice 1")
    expect(roadmap).toContain("## Phase 170: Paste/Delete/Field-chip Input Slice")
    expect(roadmap).toContain("Current next step after Phase 170:")
    expect(roadmap).toContain("Phase 171: Input Integration Close Audit")
    expect(phase163Test).toContain("Phase 171: Input Integration Close Audit")
    expect(doc).not.toContain("production browser readiness is achieved")
    expect(doc).not.toContain("production contenteditable readiness is achieved")
  })
})
