import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function runBrowserQaScenario(): Record<string, any> {
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
    const {
      HYBRID_INPUT_BROWSER_QA_CASES,
      HYBRID_INPUT_BROWSER_QA_MODE,
      HYBRID_INPUT_BROWSER_QA_SOURCE,
      createHybridInputBrowserQaReport,
      hybridInputBrowserQaLabel,
    } = await import("./public/hybridInputBrowserQa.js");

    const report = createHybridInputBrowserQaReport();
    console.log(JSON.stringify({
      cases: HYBRID_INPUT_BROWSER_QA_CASES,
      constants: {
        mode: HYBRID_INPUT_BROWSER_QA_MODE,
        source: HYBRID_INPUT_BROWSER_QA_SOURCE,
      },
      label: hybridInputBrowserQaLabel(report),
      report,
    }));
  `], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
  })

  return JSON.parse(output) as Record<string, any>
}

function runBrowserQaScript(): Record<string, any> {
  const output = execFileSync(process.execPath, ["scripts/hybrid-input-browser-qa.mjs"], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
  })

  return JSON.parse(output) as Record<string, any>
}

function caseById(report: Record<string, any>, caseId: string): Record<string, any> {
  const match = report.cases.find((entry: Record<string, any>) => entry.caseId === caseId)
  if (!match) throw new Error(`Missing browser QA case: ${caseId}`)
  return match
}

describe("hybrid input browser QA boundary", () => {
  it("creates a JSON-safe browser QA report shape without a required browser driver", () => {
    const result = runBrowserQaScenario()
    const report = result.report

    expect(result.constants).toMatchObject({
      mode: "sandbox-local-hybrid-input-browser-qa-boundary",
      source: "flowdoc-hybrid-input-browser-qa",
    })
    expect(result.cases).toEqual([
      "selection-start-end",
      "caret-move",
      "ime-composition-lifecycle",
      "plain-text-paste",
      "blocked-rich-unsafe-paste",
      "delete-backspace-near-field-chip",
      "active-island-commit",
      "fallback-behavior",
      "single-active-text-block-guard",
    ])
    expect(report.status).toBe("passed")
    expect(report.reportShape).toMatchObject({
      jsonSafe: true,
    })
    expect(report.environment).toMatchObject({
      browserDriver: "not-bound",
      browserDriverRequired: false,
      sandboxLocalEvidence: true,
    })
    expect(report.packageTruth).toMatchObject({
      reason: "browser QA report is evidence only",
      status: "not-mutated",
    })
    expect(result.label).toBe("Hybrid input browser QA: passed 9 cases")
    expect(JSON.parse(JSON.stringify(report))).toEqual(report)
  })

  it("records selection, caret, IME, paste, delete, commit, fallback, and one-island guard evidence", () => {
    const report = runBrowserQaScenario().report

    expect(caseById(report, "selection-start-end")).toMatchObject({
      evidence: {
        selection: {
          end: 7,
          source: "browser-qa-selectionchange",
          start: 2,
          unit: "utf16-code-unit-offset",
        },
      },
      status: "evidence",
    })
    expect(caseById(report, "caret-move")).toMatchObject({
      evidence: {
        caret: {
          collapsed: true,
          end: 10,
          start: 10,
        },
      },
      status: "evidence",
    })
    expect(caseById(report, "ime-composition-lifecycle")).toMatchObject({
      evidence: {
        blockedCommit: {
          reason: "composition-active",
          status: "blocked",
        },
        compositionActiveDuringDraft: true,
        finalStatus: "dirty",
      },
    })
    expect(caseById(report, "plain-text-paste")).toMatchObject({
      evidence: {
        normalizedText: "Browser\nQA paste",
        preflightAction: "transform",
      },
    })
    expect(caseById(report, "blocked-rich-unsafe-paste")).toMatchObject({
      evidence: {
        preflightAction: "reject",
        preflightReason: "unsupported-html-paste",
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
        preflightAction: "transform",
      },
    })
    expect(caseById(report, "active-island-commit")).toMatchObject({
      evidence: {
        bridgeAction: "sandbox.commitRichInline",
        bridgeStatus: "accepted",
        operationKind: "text-block.rich-inline.replace",
        packageMutation: {
          status: "planned-through-existing-bridge",
        },
        targetTextBlockId: "cover-header-label",
      },
    })
    expect(caseById(report, "fallback-behavior")).toMatchObject({
      evidence: {
        targetType: "textarea-fallback",
      },
      status: "fallback",
    })
    expect(caseById(report, "single-active-text-block-guard")).toMatchObject({
      evidence: {
        openTextBlockId: "cover-header-label",
        resultStatus: "rejected",
      },
      reason: "active-text-block-island-already-open",
      status: "blocked",
    })
  })

  it("runs the optional sandbox-local script without adding browser driver dependency", () => {
    const report = runBrowserQaScript()

    expect(report.source).toBe("flowdoc-hybrid-input-browser-qa")
    expect(report.mode).toBe("sandbox-local-hybrid-input-browser-qa-boundary")
    expect(report.environment).toMatchObject({
      browserDriver: "not-bound",
      browserDriverRequired: false,
      runner: "sandbox-script-json-safe-events",
    })
    expect(report.summary).toMatchObject({
      blockedCount: 2,
      caseCount: 9,
      evidenceCount: 6,
      fallbackCount: 1,
      requiredCaseCount: 9,
    })
  })

  it("keeps the browser QA boundary dependency-clean and non-production", () => {
    const source = readText("../examples/template-builder-sandbox/public/hybridInputBrowserQa.js")
    const script = readText("../examples/template-builder-sandbox/scripts/hybrid-input-browser-qa.mjs")
    const packageJson = readText("../package.json")

    expect(source).toContain("HYBRID_INPUT_BROWSER_QA_SOURCE")
    expect(source).toContain("createHybridInputBrowserQaReport")
    expect(source).toContain("browser QA evidence does not mutate package data")
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

  it("documents Phase 163 and advances the roadmap without production readiness claims", () => {
    const doc = readText("../docs/HYBRID_INPUT_BROWSER_QA_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const planTest = readText("./hybridManagedCardInputPlan.test.ts")

    expect(doc).toContain("Status: Phase 163 hybrid input browser QA boundary.")
    expect(doc).toContain("This boundary does not claim production contenteditable readiness.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("No production contenteditable implementation.")
    expect(doc).toContain("No full-document contenteditable.")
    expect(doc).toContain("No browser driver requirement in core check.")
    expect(readme).toContain("Hybrid input browser QA boundary")
    expect(readme).toContain("docs/HYBRID_INPUT_BROWSER_QA_BOUNDARY.md")
    expect(ledger).toContain("| 163 | Hybrid input browser QA boundary | done |")
    expect(roadmap).toContain("## Phase 163: Hybrid Input Browser QA Boundary")
    expect(roadmap).toContain("## Phase 164: Optional Browser Driver Smoke Boundary")
    expect(roadmap).toContain("## Phase 165: Hybrid Input Browser Evidence Close Audit")
    expect(roadmap).toContain("## Phase 166: Hybrid Input Hardening Threshold Plan")
    expect(roadmap).toContain("## Phase 167: Browser Matrix Decision")
    expect(roadmap).toContain("Current next step after Phase 167:")
    expect(roadmap).toContain("Phase 168: Guarded Input Integration Plan")
    expect(planTest).toContain("Phase 168: Guarded Input Integration Plan")
    expect(doc).not.toContain("production contenteditable readiness is achieved")
    expect(doc).not.toContain("production-ready input")
  })
})
