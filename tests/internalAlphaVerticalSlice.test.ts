import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { createFlowDocFileJsonArtifactByteStore, createFlowDocFileJsonStorageAdapter } from "@flowdoc/storage-file-json"
import {
  FLOWDOC_INTERNAL_ALPHA_VERTICAL_SLICE_MODE,
  FLOWDOC_INTERNAL_ALPHA_VERTICAL_SLICE_SOURCE,
  runFlowDocInternalAlphaVerticalSlice,
  type FlowDocInternalAlphaSessionStorageRecord,
} from "@flowdoc/internal-alpha-runner"

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8")) as unknown
}

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("internal alpha vertical slice", () => {
  const tempRoots: string[] = []

  afterEach(() => {
    tempRoots.splice(0).forEach((root) => {
      rmSync(root, { recursive: true, force: true })
    })
  })

  function tempRoot(): string {
    const root = mkdtempSync(join(tmpdir(), "flowdoc-internal-alpha-"))
    tempRoots.push(root)
    return root
  }

  it("runs open, edit, save, reload, PDF generation, artifact storage, retrieval, and report", async () => {
    const rootDirectory = tempRoot()
    const result = await runFlowDocInternalAlphaVerticalSlice({
      rootDirectory,
      packageInput: fixture("vertical-slice-rc-report.v1.flowdoc.json"),
      scenarioInput: fixture("vertical-slice-rc-scenario.v1.json"),
      now: "2026-06-29T06:00:00.000Z",
    })

    expect(result).toMatchObject({
      source: FLOWDOC_INTERNAL_ALPHA_VERTICAL_SLICE_SOURCE,
      mode: FLOWDOC_INTERNAL_ALPHA_VERTICAL_SLICE_MODE,
      status: "ready-with-risks",
      issues: [],
      contracts: {
        externalPackage: true,
        jsonSafe: true,
        fixtureFed: true,
        activeTextBlockOnly: true,
        usesConcreteFileJsonStorage: true,
        recordStorageWrites: true,
        reloadsSessionRecord: true,
        regeneratesPdfFromReloadedPackage: true,
        artifactByteWrites: true,
        retrievesArtifactBytes: true,
        uiImplementation: false,
        serverRoute: false,
        authzExecution: false,
        workerOrQueue: false,
        productionStorageReady: false,
        productionRendererReady: false,
        productionMeasurementReady: false,
        productionInputReady: false,
        packageSchemaChange: false,
        documentSchemaChange: false,
        collaborationOffline: false,
        legacyEditorRuntimeCopy: false,
      },
    })
    expect(result.steps.map((entry) => [entry.name, entry.status])).toEqual([
      ["open-document", "pass"],
      ["edit-active-text-block", "pass"],
      ["save-records", "pass"],
      ["reload-session", "pass"],
      ["generate-pdf", "pass"],
      ["store-artifact", "pass"],
      ["retrieve-artifact", "pass"],
      ["status-report", "pass"],
    ])
    expect(result.records.map((record) => [record.kind, record.revision, record.writeStatus, record.readStatus])).toEqual([
      ["package-session", 0, "written", "found"],
      ["durable-history", 0, "written", "found"],
      ["rich-inline-session", 0, "written", "found"],
      ["artifact-manifest", 2, "written", "found"],
      ["artifact-job", 1, "written", "found"],
    ])
    expect(result.artifact).toMatchObject({
      artifactId: "artifact:vertical-slice-report-v1:pdf",
      writeStatus: "written",
      readStatus: "found",
      consistencyStatus: "consistent",
    })
    expect(result.artifact?.byteLength).toBeGreaterThan(0)
    expect(result.artifact?.sha256).toMatch(/^[a-f0-9]{64}$/u)
    expect(result.artifact?.storageKey).toMatch(/^artifact-bytes-v1\.[A-Za-z0-9_-]+\.[a-f0-9]{64}\.bin$/u)
    expect(existsSync(join(rootDirectory, "artifact-bytes", result.artifact?.storageKey ?? ""))).toBe(true)

    expect(result.report).toMatchObject({
      status: "ready-with-risks",
      productionReady: false,
      measurement: {
        status: "warning",
        digestStatus: "missing",
        nativeWasmParityStatus: "missing",
      },
      artifact: {
        status: "rendered",
        storageStatus: "consistent",
        digestStatus: "present",
        spikeGrade: true,
      },
      storage: {
        status: "accepted",
      },
      contracts: {
        serverRoute: false,
        workerOrQueue: false,
        rendererExecution: false,
        productionBinding: false,
        packageSchemaChange: false,
      },
    })
    expect(result.report?.failBlocker).toEqual([])
    expect(result.report?.pass).toEqual(expect.arrayContaining([
      "Phase 180 internal alpha vertical slice produced",
      "open document -> edit -> save -> reload -> PDF -> artifact store/retrieve -> report completed",
      "rich-inline-commit: rich inline commit text-block.rich-inline.replace accepted",
      "artifact-job: artifact job rendered",
      "storage: file-backed storage accepted",
    ]))
    expect(result.report?.risk).toEqual(expect.arrayContaining([
      "measurement evidence is guarded internal-alpha only",
      "PDF output remains minimal spike-grade evidence",
      "measurement: measurement gate warning",
    ]))
    expect(result.report?.unknown).toEqual(expect.arrayContaining([
      "measurement digest status is missing",
      "native/WASM parity status is missing",
    ]))

    const adapter = createFlowDocFileJsonStorageAdapter({ rootDirectory })
    const sessionRead = await adapter.packageSessions.read({
      kind: "package-session",
      key: "session:vertical-slice-report-v1",
    })
    expect(sessionRead.ok).toBe(true)
    if (!sessionRead.ok || result.artifact?.storageKey == null) throw new Error("internal alpha session/artifact evidence missing")
    const sessionRecord = sessionRead.record.value as FlowDocInternalAlphaSessionStorageRecord
    const summary = sessionRecord.package.document.document.sections[0].nodes["report-summary"]
    expect(summary?.type).toBe("text-block")
    if (summary?.type !== "text-block") throw new Error("edited summary was not reloaded as a text block")
    expect(summary.children.map((child) => child.id)).toEqual([
      "report-summary-edit-prefix",
      "report-summary-edit-customer",
      "report-summary-edit-suffix",
      "report-summary-edit-period",
      "report-summary-edit-end",
    ])

    const byteStore = createFlowDocFileJsonArtifactByteStore({ rootDirectory })
    const bytes = await byteStore.read({ storageKey: result.artifact.storageKey })
    expect(bytes.ok).toBe(true)
    if (!bytes.ok) throw new Error("internal alpha PDF bytes were not retrieved")
    const pdf = Buffer.from(bytes.bytes).toString("utf8")
    expect(pdf.startsWith("%PDF-1.4")).toBe(true)
    expect(pdf).toContain("Updated RC summary for")
    expect(pdf).toContain("Example Customer")
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("returns a bounded blocker before storage writes when scenario validation fails", async () => {
    const invalidScenario = {
      ...(fixture("vertical-slice-rc-scenario.v1.json") as Record<string, unknown>),
      packageId: "wrong-package",
    }
    const result = await runFlowDocInternalAlphaVerticalSlice({
      rootDirectory: tempRoot(),
      packageInput: fixture("vertical-slice-rc-report.v1.flowdoc.json"),
      scenarioInput: invalidScenario,
      now: "2026-06-29T06:00:00.000Z",
    })

    expect(result).toMatchObject({
      status: "blocked",
      report: null,
      records: [],
      artifact: null,
      issues: [expect.objectContaining({ code: "package-id-mismatch" })],
      contracts: {
        serverRoute: false,
        productionStorageReady: false,
        productionRendererReady: false,
        productionInputReady: false,
      },
    })
    expect(result.steps).toEqual([
      expect.objectContaining({
        name: "open-document",
        status: "blocked",
      }),
    ])
  })

  it("documents Phase 180 and preserves the historical Phase 181 handoff", () => {
    const source = readText("../packages/internal-alpha-runner/src/internalAlphaVerticalSlice.ts")
    const doc = readText("../docs/INTERNAL_ALPHA_VERTICAL_SLICE.md")
    const phase179Test = readText("./measurementRolloutGate.test.ts")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const coreIndex = readText("../src/index.ts")

    expect(source).toContain("runFlowDocArtifactJobExecutionSlice")
    expect(source).toContain("regeneratesPdfFromReloadedPackage: true")
    expect(source).toContain("productionInputReady: false")
    expect(source).not.toMatch(/node:http|node:https|express|fastify|createServer|listen\(|playwright|puppeteer|better-sqlite3|sqlite3|postgres|pg/u)
    expect(coreIndex).not.toContain("internalAlphaVerticalSlice")
    expect(doc).toContain("Status: Phase 180 internal alpha vertical slice.")
    expect(doc).toContain("open document")
    expect(doc).toContain("-> retrieve artifact")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase: Phase 181: Internal Alpha Close Audit And Documentation Consolidation Gate.")
    expect(readme).toContain("Internal alpha vertical slice")
    expect(readme).toContain("docs/INTERNAL_ALPHA_VERTICAL_SLICE.md")
    expect(ledger).toContain("| 180 | Internal alpha vertical slice | done |")
    expect(roadmap).toContain("## Phase 180: Internal Alpha Vertical Slice")
    expect(roadmap).toContain("## Historical Phase 180 Handoff")
    expect(roadmap).toContain("Current next step after Phase 180:")
    expect(roadmap).toContain("Phase 181: Internal Alpha Close Audit And Documentation Consolidation Gate")
    expect(roadmap).toContain("Phase 181 is now complete")
    expect(phase179Test).toContain("historical Phase 179 handoff")
  })
})
