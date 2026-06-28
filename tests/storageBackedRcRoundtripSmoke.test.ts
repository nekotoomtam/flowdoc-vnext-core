import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import {
  FLOWDOC_STORAGE_BACKED_RC_ROUNDTRIP_MODE,
  FLOWDOC_STORAGE_BACKED_RC_ROUNDTRIP_SOURCE,
  runFlowDocStorageBackedRcRoundtripSmoke,
} from "@flowdoc/internal-alpha-runner"

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8")) as unknown
}

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function pdfBytes(): Uint8Array {
  return Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n", "utf8")
}

describe("storage-backed RC roundtrip smoke", () => {
  const tempRoots: string[] = []

  afterEach(() => {
    tempRoots.splice(0).forEach((root) => {
      rmSync(root, { recursive: true, force: true })
    })
  })

  function tempRoot(): string {
    const root = mkdtempSync(join(tmpdir(), "flowdoc-storage-backed-rc-"))
    tempRoots.push(root)
    return root
  }

  it("runs the RC scenario through concrete record storage and artifact byte storage", async () => {
    const root = tempRoot()
    const result = await runFlowDocStorageBackedRcRoundtripSmoke({
      rootDirectory: root,
      packageInput: fixture("vertical-slice-rc-report.v1.flowdoc.json"),
      scenarioInput: fixture("vertical-slice-rc-scenario.v1.json"),
      artifactBytes: pdfBytes(),
      now: "2026-06-29T03:00:00.000Z",
    })

    expect(result).toMatchObject({
      source: FLOWDOC_STORAGE_BACKED_RC_ROUNDTRIP_SOURCE,
      mode: FLOWDOC_STORAGE_BACKED_RC_ROUNDTRIP_MODE,
      status: "passed",
      issues: [],
      contracts: {
        externalPackage: true,
        jsonSafe: true,
        usesConcreteFileJsonStorage: true,
        recordStorageWrites: true,
        artifactByteWrites: true,
        reloadsRecords: true,
        reloadsArtifactBytes: true,
        serverRoute: false,
        authzExecution: false,
        workerOrQueue: false,
        pdfRendererExecution: false,
        productionStorageReady: false,
        packageSchemaChange: false,
        multiRecordTransactions: false,
      },
    })
    expect(result.records).toHaveLength(5)
    expect(result.records.map((record) => record.kind)).toEqual([
      "package-session",
      "durable-history",
      "rich-inline-session",
      "artifact-manifest",
      "artifact-job",
    ])
    expect(result.records.every((record) => record.writeStatus === "written" && record.readStatus === "found" && record.revision === 0)).toBe(true)
    expect(result.artifact).toMatchObject({
      artifactId: "artifact:vertical-slice-report-v1:pdf",
      byteLength: pdfBytes().byteLength,
      writeStatus: "written",
      readStatus: "found",
      consistencyStatus: "consistent",
    })
    expect(result.artifact?.sha256).toMatch(/^[a-f0-9]{64}$/u)
    expect(result.artifact?.storageKey).toMatch(/^artifact-bytes-v1\.[A-Za-z0-9_-]+\.[a-f0-9]{64}\.bin$/u)
    expect(existsSync(join(root, "artifact-bytes", result.artifact?.storageKey ?? ""))).toBe(true)

    expect(result.report).toMatchObject({
      status: "ready-with-risks",
      productionReady: false,
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
        storageWrites: false,
        rendererExecution: false,
        serverRoute: false,
        productionBinding: false,
      },
    })
    expect(result.report?.failBlocker).toEqual([])
    expect(result.report?.pass).toEqual(expect.arrayContaining([
      "Phase 175 storage-backed RC roundtrip produced",
      "artifact bytes persisted and reloaded",
      "record collections persisted and reloaded",
      "storage: concrete storage roundtrip accepted",
    ]))
    expect(result.report?.risk).toEqual(expect.arrayContaining([
      "record and byte writes are not transactionally linked",
      "PDF evidence remains supplied spike-grade bytes",
      "measurement: measurement gate warning",
    ]))
    expect(result.report?.unknown).toEqual(expect.arrayContaining([
      "measurement digest status is missing",
      "native/WASM parity status is missing",
    ]))
    expect(JSON.parse(JSON.stringify(result))).toEqual(result)
  })

  it("returns a bounded blocker when scenario validation fails before storage writes", async () => {
    const invalidScenario = {
      ...(fixture("vertical-slice-rc-scenario.v1.json") as Record<string, unknown>),
      packageId: "other-package",
    }
    const result = await runFlowDocStorageBackedRcRoundtripSmoke({
      rootDirectory: tempRoot(),
      packageInput: fixture("vertical-slice-rc-report.v1.flowdoc.json"),
      scenarioInput: invalidScenario,
      artifactBytes: pdfBytes(),
      now: "2026-06-29T03:00:00.000Z",
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
      },
    })
  })

  it("documents Phase 175 and advances the current roadmap to Phase 176", () => {
    const runnerSource = readText("../packages/internal-alpha-runner/src/storageBackedRcRoundtrip.ts")
    const doc = readText("../docs/STORAGE_BACKED_RC_ROUNDTRIP_SMOKE.md")
    const phase174Test = readText("./artifactByteStoreSlice.test.ts")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const coreStorageSource = readText("../src/persistence/storageAdapter.ts")

    expect(runnerSource).toContain("@flowdoc/storage-file-json")
    expect(runnerSource).toContain("@flowdoc/vnext-core")
    expect(runnerSource).not.toMatch(/express|fastify|node:http|node:https|playwright|puppeteer|better-sqlite3|sqlite3|postgres|pg/u)
    expect(coreStorageSource).not.toMatch(/node:fs\/promises|writeFile|readFile|createHash|artifactByteWrites: true/u)
    expect(doc).toContain("Status: Phase 175 storage-backed RC roundtrip smoke.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase: Phase 176: Backend Route Contract To Storage Binding.")
    expect(readme).toContain("Storage-backed RC roundtrip smoke")
    expect(readme).toContain("docs/STORAGE_BACKED_RC_ROUNDTRIP_SMOKE.md")
    expect(ledger).toContain("| 175 | Storage-backed RC roundtrip smoke | done |")
    expect(roadmap).toContain("## Phase 175: Storage-Backed RC Roundtrip Smoke")
    expect(roadmap).toContain("Current next step after Phase 175:")
    expect(roadmap).toContain("Phase 176: Backend Route Contract To Storage Binding")
    expect(phase174Test).toContain("historical Phase 175 handoff")
  })
})
