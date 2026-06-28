import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextVerticalSliceRcReport,
  VNEXT_VERTICAL_SLICE_RC_MODE,
  VNEXT_VERTICAL_SLICE_RC_SOURCE,
  type VNextVerticalSliceRcEvidenceSummary,
  type VNextVerticalSliceRcReportInput,
} from "../src/index.js"

const SHA256 = "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd"

function evidence(overrides: Partial<VNextVerticalSliceRcEvidenceSummary> = {}): VNextVerticalSliceRcEvidenceSummary {
  return {
    lane: "canonical-package",
    status: "pass",
    summary: "canonical package v2/document v3 accepted",
    ...overrides,
  }
}

function allEvidence(): VNextVerticalSliceRcEvidenceSummary[] {
  return [
    evidence({ lane: "canonical-package", summary: "canonical package v2/document v3 accepted" }),
    evidence({ lane: "key-data-diagnostics", summary: "field registry and data snapshot are ready" }),
    evidence({ lane: "authoring-session", summary: "browser-local authoring session opened" }),
    evidence({ lane: "rich-inline-commit", summary: "text-block.rich-inline.replace accepted" }),
    evidence({ lane: "exact-generation", summary: "exact generation marked stale" }),
    evidence({ lane: "measurement", summary: "renderer-backed measurement summary accepted" }),
    evidence({ lane: "artifact", status: "risk", summary: "minimal PDF spike bytes are text-only" }),
    evidence({ lane: "artifact-job", summary: "artifact job record reached rendered status" }),
    evidence({ lane: "storage", summary: "storage adapter envelopes accepted by simulation" }),
  ]
}

function reportInput(overrides: Partial<VNextVerticalSliceRcReportInput> = {}): VNextVerticalSliceRcReportInput {
  return {
    rcId: "rc:first-vertical-slice",
    scenarioId: "scenario:first-report",
    packageId: "package:vertical-slice-report",
    sessionId: "session:vertical-slice-report",
    measurementProfileId: "measurement-profile-v1:rc",
    rendererProfileId: "renderer-profile:pdf-spike",
    artifactId: "artifact:vertical-slice-report-pdf",
    exactGeneration: {
      status: "stale",
      reason: "rich inline commit changed text content",
    },
    measurement: {
      status: "accepted",
      measurementProfileId: "measurement-profile-v1:rc",
      rendererProfileId: "renderer-profile:pdf-spike",
      lineBoxCount: 2,
      widthDriftPt: 0.25,
      heightDriftPt: 0.5,
      lineCountDrift: 0,
      digestStatus: "missing",
      nativeWasmParityStatus: "missing",
    },
    artifact: {
      status: "rendered",
      artifactId: "artifact:vertical-slice-report-pdf",
      format: "pdf",
      mediaType: "application/pdf",
      byteLength: 2048,
      sha256: SHA256,
      digestStatus: "present",
      storageStatus: "not-stored",
      spikeGrade: true,
    },
    storage: {
      status: "accepted",
      collections: [
        { kind: "package-session", status: "accepted", key: "session:vertical-slice-report", revision: 0 },
        { kind: "artifact-manifest", status: "accepted", key: "artifact:vertical-slice-report-pdf", revision: 0 },
      ],
    },
    evidence: allEvidence(),
    pass: ["single-user RC report assembled"],
    risk: ["PDF evidence is spike-grade only"],
    unknown: [],
    intentionallyNotProductionReady: ["no production launch readiness claim"],
    ...overrides,
  }
}

describe("vertical slice RC orchestrator boundary", () => {
  it("builds a bounded JSON-safe single-user RC report from caller-supplied summaries", () => {
    const report = createVNextVerticalSliceRcReport(reportInput())

    expect(report).toMatchObject({
      source: VNEXT_VERTICAL_SLICE_RC_SOURCE,
      mode: VNEXT_VERTICAL_SLICE_RC_MODE,
      status: "ready-with-risks",
      rcId: "rc:first-vertical-slice",
      scenarioId: "scenario:first-report",
      packageId: "package:vertical-slice-report",
      sessionId: "session:vertical-slice-report",
      singleUser: true,
      productionReady: false,
      measurementProfileId: "measurement-profile-v1:rc",
      rendererProfileId: "renderer-profile:pdf-spike",
      artifactId: "artifact:vertical-slice-report-pdf",
      exactGeneration: {
        status: "stale",
      },
      artifact: {
        byteLength: 2048,
        digestStatus: "present",
        storageStatus: "not-stored",
        spikeGrade: true,
      },
      storage: {
        status: "accepted",
      },
      contracts: {
        jsonSafe: true,
        inputDriven: true,
        singleUserOnly: true,
        uiImplementation: false,
        serverRoute: false,
        workerOrQueue: false,
        storageWrites: false,
        browserApis: false,
        rendererExecution: false,
        externalPackageImports: false,
        productionBinding: false,
        packageSchemaChange: false,
      },
    })
    expect(report.pass).toEqual(expect.arrayContaining([
      "single-user RC report assembled",
      "canonical-package: canonical package v2/document v3 accepted",
      "rich-inline-commit: text-block.rich-inline.replace accepted",
    ]))
    expect(report.risk).toEqual(expect.arrayContaining([
      "PDF evidence is spike-grade only",
      "artifact: minimal PDF spike bytes are text-only",
    ]))
    expect(report.unknown).toEqual(expect.arrayContaining([
      "measurement digest status is missing",
      "native/WASM parity status is missing",
    ]))
    expect(report.failBlocker).toEqual([])
    expect(report.intentionallyNotProductionReady).toEqual(expect.arrayContaining([
      "not production launch ready",
      "no collaboration/offline semantics",
      "no default pagination measurement replacement",
      "no concrete storage backend",
      "no production PDF fidelity",
      "no production WYSIWYG input implementation",
      "no package/document schema change",
    ]))
    expect(JSON.parse(JSON.stringify(report))).toEqual(report)
  })

  it("blocks or reports missing required package, session, measurement, artifact, and evidence inputs", () => {
    const report = createVNextVerticalSliceRcReport(reportInput({
      rcId: "",
      packageId: "",
      sessionId: "",
      measurementProfileId: "",
      rendererProfileId: "",
      artifactId: "",
      exactGeneration: {
        status: "unchanged",
        reason: "test missing stale marker",
      },
      measurement: {
        ...reportInput().measurement,
        status: "blocked",
        measurementProfileId: "other-profile",
      },
      artifact: {
        ...reportInput().artifact,
        artifactId: "other-artifact",
        byteLength: 0,
      },
      storage: {
        status: "conflict",
        collections: [],
      },
      evidence: [
        evidence({ lane: "canonical-package", status: "pass", summary: "canonical package accepted" }),
        evidence({ lane: "canonical-package", status: "pass", summary: "duplicate canonical package evidence" }),
      ],
    }))

    expect(report.status).toBe("blocked")
    expect(report.failBlocker).toEqual(expect.arrayContaining([
      "duplicate RC evidence lane: canonical-package",
      "rcId is required",
      "packageId is required",
      "sessionId is required",
      "measurementProfileId is required",
      "rendererProfileId is required",
      "artifactId is required",
      "measurement summary profile must match measurementProfileId",
      "artifact summary id must match artifactId",
      "exact generation status must be stale for the RC edit",
      "measurement summary is blocked",
      "rendered artifact summary requires positive byteLength",
      "storage summary is conflict",
      "missing RC evidence lane: measurement",
      "missing RC evidence lane: artifact",
      "missing RC evidence lane: storage",
    ]))
  })

  it("keeps Phase 146 independent from external packages, servers, browsers, workers, storage, and renderer execution", () => {
    const source = readFileSync(new URL("../src/generation/verticalSliceRc.ts", import.meta.url), "utf8")
    const index = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8")

    expect(source).toContain("inputDriven: true")
    expect(source).toContain("storageWrites: false")
    expect(source).toContain("rendererExecution: false")
    expect(source).not.toMatch(/from\s+["'][^"']*pdf-renderer-spike/)
    expect(source).not.toMatch(/from\s+["'][^"']*text-engine-rust-wasm/)
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/node:fs|node:path|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/writeFile|createWriteStream|appendFile|mkdir|rm\(/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toContain("sessionStorage")
    expect(source).not.toContain("indexedDB")
    expect(source).not.toContain("Worker(")
    expect(source).not.toContain("renderFlowDocMinimalPdfArtifact")
    expect(source).not.toContain("createVNextRendererBackedTextMeasurer")
    expect(index).toContain("./generation/verticalSliceRc.js")
  })

  it("documents Phase 146 in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/VERTICAL_SLICE_RC_ORCHESTRATOR_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 146 first vertical slice RC orchestrator boundary.")
    expect(boundaryDoc).toContain("input-driven report builder")
    expect(boundaryDoc).toContain("No UI, server route, worker, storage write, browser API, external package")
    expect(boundaryDoc).toContain("import, renderer execution, production binding, or package/document schema")
    expect(readme).toContain("Vertical slice RC orchestrator boundary")
    expect(readme).toContain("docs/VERTICAL_SLICE_RC_ORCHESTRATOR_BOUNDARY.md")
    expect(ledger).toContain("| 146 | First vertical slice RC orchestrator boundary | done |")
    expect(roadmap).toContain("## Phase 146: First Vertical Slice RC Orchestrator Boundary")
  })
})
