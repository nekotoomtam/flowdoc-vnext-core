import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextVerticalSliceRcReport,
  createVNextVerticalSliceScenarioPlan,
  parseFlowDocPackageV2DocumentVNext,
  VNEXT_VERTICAL_SLICE_SCENARIO_MODE,
  VNEXT_VERTICAL_SLICE_SCENARIO_SOURCE,
  type VNextVerticalSliceRcEvidenceSummary,
} from "../src/index.js"

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8")) as unknown
}

function scenario(): unknown {
  return fixture("vertical-slice-rc-scenario.v1.json")
}

function packageFixture(): unknown {
  return fixture("vertical-slice-rc-report.v1.flowdoc.json")
}

function evidence(lane: VNextVerticalSliceRcEvidenceSummary["lane"], summary: string): VNextVerticalSliceRcEvidenceSummary {
  return { lane, status: "pass", summary }
}

describe("vertical slice RC scenario boundary", () => {
  it("parses the product-shaped RC package fixture as canonical package v2/document v3", () => {
    const pack = parseFlowDocPackageV2DocumentVNext(packageFixture())

    expect(pack.packageVersion).toBe(2)
    expect(pack.document.version).toBe(3)
    expect(pack.id).toBe("vertical-slice-rc-report")
    expect(pack.fields.fields["customer.name"]).toMatchObject({ type: "text" })
    expect(pack.fields.fields["report.period"]).toMatchObject({ type: "text" })
    expect(pack.document.document.sections[0]?.nodes["report-summary"]).toMatchObject({
      type: "text-block",
    })
  })

  it("validates scenario references and returns a seed for the RC report builder", () => {
    const plan = createVNextVerticalSliceScenarioPlan(packageFixture(), scenario())

    expect(plan).toMatchObject({
      source: VNEXT_VERTICAL_SLICE_SCENARIO_SOURCE,
      mode: VNEXT_VERTICAL_SLICE_SCENARIO_MODE,
      status: "ready",
      issues: [],
      packageSummary: {
        packageId: "vertical-slice-rc-report",
        packageVersion: 2,
        documentVersion: 3,
        sectionCount: 1,
        fieldCount: 3,
      },
      rcReportSeed: {
        rcId: "rc:vertical-slice-report-v1",
        scenarioId: "vertical-slice-rc-report-v1",
        packageId: "vertical-slice-rc-report",
        sessionId: "session:vertical-slice-report-v1",
        measurementProfileId: "measurement-profile-v1:thai-rustybuzz-icu4x-v1:rc",
        rendererProfileId: "pdf-spike-profile-v1",
        artifactId: "artifact:vertical-slice-report-v1:pdf",
        operationKind: "text-block.rich-inline.replace",
        targetTextBlockId: "report-summary",
        replacementInlineCount: 5,
        fieldRefKeys: ["customer.name", "report.period"],
        expectedExactGeneration: "stale",
        expectedArtifactFormat: "pdf",
        expectedStorageCollectionsTouched: [
          "package-session",
          "durable-history",
          "rich-inline-session",
          "artifact-manifest",
          "artifact-job",
        ],
      },
      contracts: {
        fixtureFed: true,
        canonicalPackageOnly: true,
        jsonSafe: true,
        fileReads: false,
        storageWrites: false,
        browserApis: false,
        serverRoute: false,
        externalPackageImports: false,
        packageSchemaChange: false,
      },
    })
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("feeds the Phase 146 report builder without the builder loading fixtures", () => {
    const scenarioPlan = createVNextVerticalSliceScenarioPlan(packageFixture(), scenario())
    if (scenarioPlan.rcReportSeed == null) throw new Error("scenario seed did not validate")
    const seed = scenarioPlan.rcReportSeed
    const report = createVNextVerticalSliceRcReport({
      rcId: seed.rcId,
      scenarioId: seed.scenarioId,
      packageId: seed.packageId,
      sessionId: seed.sessionId,
      measurementProfileId: seed.measurementProfileId,
      rendererProfileId: seed.rendererProfileId,
      artifactId: seed.artifactId,
      exactGeneration: {
        status: seed.expectedExactGeneration,
        reason: "scenario intended edit is expected to stale exact generation",
      },
      measurement: {
        status: "accepted",
        measurementProfileId: seed.measurementProfileId,
        rendererProfileId: seed.rendererProfileId,
        lineBoxCount: 2,
        widthDriftPt: 0,
        heightDriftPt: 0,
        lineCountDrift: 0,
        digestStatus: "missing",
        nativeWasmParityStatus: "missing",
      },
      artifact: {
        status: "rendered",
        artifactId: seed.artifactId,
        format: seed.expectedArtifactFormat,
        mediaType: "application/pdf",
        byteLength: 1024,
        sha256: "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        digestStatus: "present",
        storageStatus: "not-stored",
        spikeGrade: true,
      },
      storage: {
        status: "accepted",
        collections: seed.expectedStorageCollectionsTouched.map((kind) => ({
          kind,
          status: "accepted",
          key: `${kind}:vertical-slice-report-v1`,
          revision: 0,
        })),
      },
      evidence: [
        evidence("canonical-package", "scenario fixture parsed as package v2/document v3"),
        evidence("key-data-diagnostics", "field registry/data snapshot present"),
        evidence("authoring-session", "scenario can open a single-user session"),
        evidence("rich-inline-commit", "scenario uses text-block.rich-inline.replace"),
        evidence("exact-generation", "scenario expects stale exact generation"),
        evidence("measurement", "scenario carries measurement profile id"),
        evidence("artifact", "scenario expects PDF artifact"),
        evidence("artifact-job", "scenario expects artifact job record"),
        evidence("storage", "scenario declares expected storage collections"),
      ],
    })

    expect(report.status).toBe("ready-with-risks")
    expect(report.scenarioId).toBe("vertical-slice-rc-report-v1")
    expect(report.packageId).toBe("vertical-slice-rc-report")
    expect(report.failBlocker).toEqual([])
    expect(report.unknown).toEqual(expect.arrayContaining([
      "measurement digest status is missing",
      "native/WASM parity status is missing",
    ]))
  })

  it("blocks invalid target, unknown field keys, duplicate inline ids, and package mismatch", () => {
    const base = scenario() as Record<string, any>
    const invalid = {
      ...base,
      packageId: "other-package",
      intendedEdit: {
        ...base.intendedEdit,
        targetTextBlockId: "missing-text-block",
        replacementChildren: [
          { id: "dup", type: "text", text: "A" },
          { id: "dup", type: "field-ref", key: "missing.field", fallback: "Missing" },
        ],
      },
      fieldChip: {
        inlineId: "missing-inline",
        fieldKey: "missing.field",
      },
    }

    const plan = createVNextVerticalSliceScenarioPlan(packageFixture(), invalid)

    expect(plan.status).toBe("blocked")
    expect(plan.rcReportSeed).toBeNull()
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "package-id-mismatch", path: "packageId" }),
      expect.objectContaining({ code: "target-not-found", path: "intendedEdit.targetTextBlockId" }),
      expect.objectContaining({ code: "duplicate-inline-id", path: "intendedEdit.replacementChildren[1].id" }),
      expect.objectContaining({ code: "unknown-field-key", path: "intendedEdit.replacementChildren[1].key" }),
      expect.objectContaining({ code: "field-chip-inline-missing", path: "fieldChip.inlineId" }),
      expect.objectContaining({ code: "unknown-field-chip-key", path: "fieldChip.fieldKey" }),
    ]))
  })

  it("keeps the scenario boundary independent from storage, browser, server, and external spike packages", () => {
    const source = readFileSync(new URL("../src/generation/verticalSliceScenario.ts", import.meta.url), "utf8")
    const index = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8")

    expect(source).toContain("fixtureFed: true")
    expect(source).toContain("fileReads: false")
    expect(source).toContain("storageWrites: false")
    expect(source).not.toMatch(/node:fs|node:path|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/writeFile|createWriteStream|appendFile|mkdir|rm\(/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toContain("sessionStorage")
    expect(source).not.toContain("indexedDB")
    expect(source).not.toContain("pdf-renderer-spike")
    expect(source).not.toContain("text-engine-rust-wasm")
    expect(index).toContain("./generation/verticalSliceScenario.js")
  })

  it("documents Phase 147 in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/VERTICAL_SLICE_RC_SCENARIO_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 147 RC scenario fixture boundary.")
    expect(boundaryDoc).toContain("fixtures/vertical-slice-rc-report.v1.flowdoc.json")
    expect(readme).toContain("Vertical slice RC scenario boundary")
    expect(readme).toContain("docs/VERTICAL_SLICE_RC_SCENARIO_BOUNDARY.md")
    expect(ledger).toContain("| 147 | RC scenario fixture boundary | done |")
    expect(roadmap).toContain("## Phase 147: RC Scenario Fixture Boundary")
  })
})
