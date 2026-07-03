import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { createVNextRichInlineSessionPersistenceRecord } from "../src/authoring/richInlineSessionPersistence.js"
import { createVNextSessionStorageRecord } from "../src/authoring/sessionStorage.js"
import {
  advanceVNextArtifactJob,
  assessVNextKeyDataDiagnostics,
  createVNextArtifactJobPlan,
  createVNextArtifactManifestPlan,
  createVNextDurableHistorySnapshot,
  createVNextEditableSession,
  createVNextRichInlineCommitHistoryRecord,
  createVNextStorageReadResult,
  createVNextVerticalSliceArtifactBridgeSummary,
  createVNextVerticalSliceRcReport,
  createVNextVerticalSliceScenarioPlan,
  evaluateVNextStorageWriteRequest,
  evaluateVNextVerticalSliceMeasurementGate,
  parseFlowDocPackageV2DocumentVNext,
  resolveVNextLiveLayoutBoundary,
  runVNextRichInlineCommit,
  summarizeVNextVerticalSliceStorageSimulation,
  type FlowDocPackageV2DocumentVNext,
  type VNextArtifactJobRecord,
  type VNextArtifactManifestRecord,
  type VNextStorageCollection,
  type VNextStorageReadRequest,
  type VNextStorageReadResult,
  type VNextStorageRecordEnvelope,
  type VNextStorageRecordKind,
  type VNextStorageWriteRequest,
  type VNextStorageWriteResult,
  type VNextVerticalSliceRcEvidenceSummary,
} from "../src/index.js"

const SHA256 = "feedfacefeedfacefeedfacefeedfacefeedfacefeedfacefeedfacefeedface"

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf8")) as unknown
}

class MockCollection<TRecord> implements VNextStorageCollection<TRecord> {
  private records = new Map<string, VNextStorageRecordEnvelope<TRecord>>()

  constructor(private readonly kind: VNextStorageRecordKind) {}

  read(request: VNextStorageReadRequest): VNextStorageReadResult<TRecord> {
    return createVNextStorageReadResult(this.records.get(request.key) ?? null, request)
  }

  write(request: VNextStorageWriteRequest<TRecord>): VNextStorageWriteResult<TRecord> {
    expect(request.kind).toBe(this.kind)
    const result = evaluateVNextStorageWriteRequest(this.records.get(request.key) ?? null, request)
    if (result.ok && result.status === "written") this.records.set(result.record.key, result.record)
    return result
  }
}

function renderedManifest(seed: {
  artifactId: string
  packageId: string
  sessionId: string
  rendererProfileId: string
  measurementProfileId: string
}): VNextArtifactManifestRecord {
  const plan = createVNextArtifactManifestPlan({
    artifactId: seed.artifactId,
    sourcePackageId: seed.packageId,
    sessionId: seed.sessionId,
    jobId: "job:vertical-slice-report-v1",
    rendererProfileId: seed.rendererProfileId,
    measurementProfileId: seed.measurementProfileId,
    format: "pdf",
    mediaType: "application/pdf",
    byteLength: 4096,
    sha256: SHA256,
    storageKey: "artifacts/vertical-slice-report-v1.pdf",
    createdAt: "2026-06-24T03:00:00.000Z",
    status: "rendered",
    error: null,
  })
  if (plan.record == null) throw new Error(`manifest failed: ${JSON.stringify(plan.issues)}`)
  return plan.record
}

function renderedJob(seed: {
  artifactId: string
  packageId: string
  sessionId: string
  rendererProfileId: string
  measurementProfileId: string
}, manifest: VNextArtifactManifestRecord): VNextArtifactJobRecord {
  const plan = createVNextArtifactJobPlan({
    jobId: "job:vertical-slice-report-v1",
    artifactId: seed.artifactId,
    sourcePackageId: seed.packageId,
    sessionId: seed.sessionId,
    layoutProfileId: "layout-profile-v1",
    measurementProfileId: seed.measurementProfileId,
    rendererProfileId: seed.rendererProfileId,
    format: "pdf",
    mediaType: "application/pdf",
    createdAt: "2026-06-24T03:00:00.000Z",
  })
  if (plan.job == null) throw new Error(`job failed: ${JSON.stringify(plan.issues)}`)
  const layoutRunning = advanceVNextArtifactJob(plan.job, { action: "start-layout", updatedAt: "2026-06-24T03:01:00.000Z" })
  if (layoutRunning.status !== "advanced") throw new Error("layout did not start")
  const layoutComplete = advanceVNextArtifactJob(layoutRunning.job, {
    action: "complete-layout",
    updatedAt: "2026-06-24T03:02:00.000Z",
    cursor: { layoutJobOffset: 1, completedSourceItemIds: ["report-summary"] },
    completedStepCount: 1,
    totalStepCount: 1,
  })
  if (layoutComplete.status !== "advanced") throw new Error("layout did not complete")
  const rendering = advanceVNextArtifactJob(layoutComplete.job, { action: "start-rendering", updatedAt: "2026-06-24T03:03:00.000Z" })
  if (rendering.status !== "advanced") throw new Error("rendering did not start")
  const rendered = advanceVNextArtifactJob(rendering.job, {
    action: "complete-render",
    updatedAt: "2026-06-24T03:04:00.000Z",
    artifactManifest: manifest,
  })
  if (rendered.status !== "advanced") throw new Error(`render did not complete: ${JSON.stringify(rendered.issues)}`)
  return rendered.job
}

function storageWrites(pack: FlowDocPackageV2DocumentVNext, job: VNextArtifactJobRecord, manifest: VNextArtifactManifestRecord): {
  kind: VNextStorageRecordKind
  key: string
  result: VNextStorageWriteResult<unknown>
}[] {
  const session = createVNextEditableSession(pack)
  const sessionRecord = createVNextSessionStorageRecord(session, {
    reason: "vertical-slice-rc-e2e-smoke",
    storageKey: "session:vertical-slice-report-v1",
  })
  const history = createVNextDurableHistorySnapshot([], {
    documentRevision: session.revisions.document,
    historyKey: "history:vertical-slice-report-v1",
    reason: "vertical-slice-rc-e2e-smoke",
  })
  const richInline = createVNextRichInlineSessionPersistenceRecord(session, {
    historyKey: "history:vertical-slice-report-v1",
    reason: "vertical-slice-rc-e2e-smoke",
    storageKey: "rich-inline:vertical-slice-report-v1",
  })
  const packageSessions = new MockCollection<typeof sessionRecord>("package-session")
  const histories = new MockCollection<typeof history>("durable-history")
  const richInlineSessions = new MockCollection<typeof richInline>("rich-inline-session")
  const manifests = new MockCollection<typeof manifest>("artifact-manifest")
  const jobs = new MockCollection<typeof job>("artifact-job")

  return [
    {
      kind: "package-session",
      key: "session:vertical-slice-report-v1",
      result: packageSessions.write({ kind: "package-session", key: "session:vertical-slice-report-v1", value: sessionRecord, expectedRevision: null, idempotencyKey: "idem-session", now: "2026-06-24T03:05:00.000Z" }) as VNextStorageWriteResult<unknown>,
    },
    {
      kind: "durable-history",
      key: "history:vertical-slice-report-v1",
      result: histories.write({ kind: "durable-history", key: "history:vertical-slice-report-v1", value: history, expectedRevision: null, idempotencyKey: "idem-history", now: "2026-06-24T03:05:00.000Z" }) as VNextStorageWriteResult<unknown>,
    },
    {
      kind: "rich-inline-session",
      key: "rich-inline:vertical-slice-report-v1",
      result: richInlineSessions.write({ kind: "rich-inline-session", key: "rich-inline:vertical-slice-report-v1", value: richInline, expectedRevision: null, idempotencyKey: "idem-rich-inline", now: "2026-06-24T03:05:00.000Z" }) as VNextStorageWriteResult<unknown>,
    },
    {
      kind: "artifact-manifest",
      key: seedArtifactKey(manifest),
      result: manifests.write({ kind: "artifact-manifest", key: seedArtifactKey(manifest), value: manifest, expectedRevision: null, idempotencyKey: "idem-manifest", now: "2026-06-24T03:05:00.000Z" }) as VNextStorageWriteResult<unknown>,
    },
    {
      kind: "artifact-job",
      key: job.jobId,
      result: jobs.write({ kind: "artifact-job", key: job.jobId, value: job, expectedRevision: null, idempotencyKey: "idem-job", now: "2026-06-24T03:05:00.000Z" }) as VNextStorageWriteResult<unknown>,
    },
  ]
}

function seedArtifactKey(manifest: VNextArtifactManifestRecord): string {
  return manifest.artifactId
}

function evidence(lane: VNextVerticalSliceRcEvidenceSummary["lane"], status: VNextVerticalSliceRcEvidenceSummary["status"], summary: string): VNextVerticalSliceRcEvidenceSummary {
  return { lane, status, summary }
}

describe("vertical slice RC end-to-end smoke", () => {
  it("composes the scenario, authoring, measurement, artifact, storage, and RC report boundaries", () => {
    const packageValue = fixture("vertical-slice-rc-report.v1.flowdoc.json")
    const scenarioValue = fixture("vertical-slice-rc-scenario.v1.json")
    const pack = parseFlowDocPackageV2DocumentVNext(packageValue)
    const scenarioPlan = createVNextVerticalSliceScenarioPlan(packageValue, scenarioValue)
    if (scenarioPlan.rcReportSeed == null || scenarioPlan.scenario == null) throw new Error("scenario did not validate")
    const seed = scenarioPlan.rcReportSeed
    const diagnostics = assessVNextKeyDataDiagnostics(pack.document, pack.fields, pack.data)
    const rich = runVNextRichInlineCommit(pack.document, {
      kind: scenarioPlan.scenario.intendedEdit.operationKind,
      source: "user",
      textBlockId: scenarioPlan.scenario.intendedEdit.targetTextBlockId,
      children: scenarioPlan.scenario.intendedEdit.replacementChildren,
    })
    if (!rich.ok) throw new Error(`rich commit failed: ${JSON.stringify(rich.issues)}`)
    const richHistory = createVNextRichInlineCommitHistoryRecord(rich)
    const live = resolveVNextLiveLayoutBoundary({
      kind: "authoring-history",
      records: [richHistory],
      visibleRange: {
        kind: "section-window",
        sectionId: "section-main",
        zoneId: "zone-main-body",
        startNodeId: "report-title",
        endNodeId: "report-total-line",
      },
    })
    const measurementGate = evaluateVNextVerticalSliceMeasurementGate({
      measurementProfileId: seed.measurementProfileId,
      rendererProfileId: seed.rendererProfileId,
      rendererBacked: {
        measurementProfileId: seed.measurementProfileId,
        lineBoxCount: 2,
        widthPt: 240,
        heightPt: 28,
      },
      approximate: {
        measurementProfileId: seed.measurementProfileId,
        lineBoxCount: 2,
        widthPt: 239.5,
        heightPt: 28,
      },
      runtime: {
        digestStatus: "missing",
        nativeWasmParityStatus: "missing",
      },
      tolerance: {
        maxWidthDriftPt: 1,
        maxHeightDriftPt: 1,
        maxLineCountDrift: 0,
        overTolerance: "warning",
      },
    })
    const manifest = renderedManifest(seed)
    const job = renderedJob(seed, manifest)
    const artifactBridge = createVNextVerticalSliceArtifactBridgeSummary({
      artifactId: seed.artifactId,
      rendererProfileId: seed.rendererProfileId,
      measurementProfileId: seed.measurementProfileId,
      pdfSpikeManifest: {
        status: "rendered",
        artifactId: seed.artifactId,
        format: "pdf",
        mediaType: "application/pdf",
        byteLength: 4096,
        sha256: SHA256,
        rendererProfileId: seed.rendererProfileId,
        measurementProfileId: seed.measurementProfileId,
        storageStatus: "not-stored",
        localOnly: true,
      },
      artifactManifest: manifest,
      artifactJob: job,
    })
    const storage = summarizeVNextVerticalSliceStorageSimulation({
      expectedCollections: seed.expectedStorageCollectionsTouched,
      writes: storageWrites(pack, job, manifest),
    })
    const report = createVNextVerticalSliceRcReport({
      rcId: seed.rcId,
      scenarioId: seed.scenarioId,
      packageId: seed.packageId,
      sessionId: seed.sessionId,
      measurementProfileId: seed.measurementProfileId,
      rendererProfileId: seed.rendererProfileId,
      artifactId: seed.artifactId,
      exactGeneration: {
        status: live.freshness.exactGeneration.status === "stale" ? "stale" : "unknown",
        reason: live.freshness.exactGeneration.reason,
      },
      measurement: measurementGate.summary,
      artifact: artifactBridge.summary,
      storage: storage.summary,
      evidence: [
        evidence("canonical-package", "pass", "scenario package parsed as canonical package v2/document v3"),
        evidence("key-data-diagnostics", diagnostics.status === "ready" ? "pass" : "risk", `key diagnostics status ${diagnostics.status}`),
        evidence("authoring-session", "pass", "single-user editable session records can be created"),
        evidence("rich-inline-commit", "pass", `rich inline commit ${rich.transaction.kind} accepted`),
        evidence("exact-generation", "pass", `exact generation ${live.freshness.exactGeneration.status}`),
        evidence("measurement", measurementGate.status === "accepted" ? "pass" : "risk", `measurement gate ${measurementGate.status}`),
        evidence("artifact", artifactBridge.status === "ready" ? "pass" : "risk", `artifact bridge ${artifactBridge.status}`),
        evidence("artifact-job", job.status === "rendered" ? "pass" : "risk", `artifact job ${job.status}`),
        evidence("storage", storage.status === "accepted" ? "pass" : "risk", `storage simulation ${storage.status}`),
      ],
      pass: ["Phase 151 bounded RC report produced"],
      risk: ["PDF evidence remains spike-grade"],
      intentionallyNotProductionReady: ["Phase 151 smoke is not launch readiness"],
    })

    expect(scenarioPlan.status).toBe("ready")
    expect(diagnostics.status).toBe("ready")
    expect(rich.transaction.renderInvalidation.exactGenerationStale).toBe(true)
    expect(live.freshness.exactGeneration.status).toBe("stale")
    expect(measurementGate.status).toBe("warning")
    expect(artifactBridge.status).toBe("ready")
    expect(storage.status).toBe("accepted")
    expect(report.status).toBe("ready-with-risks")
    expect(report.failBlocker).toEqual([])
    expect(report.pass).toEqual(expect.arrayContaining([
      "Phase 151 bounded RC report produced",
      "canonical-package: scenario package parsed as canonical package v2/document v3",
      "rich-inline-commit: rich inline commit text-block.rich-inline.replace accepted",
      "artifact-job: artifact job rendered",
      "storage: storage simulation accepted",
    ]))
    expect(report.risk).toEqual(expect.arrayContaining([
      "PDF evidence remains spike-grade",
      "measurement: measurement gate warning",
    ]))
    expect(report.unknown).toEqual(expect.arrayContaining([
      "measurement digest status is missing",
      "native/WASM parity status is missing",
    ]))
    expect(report.intentionallyNotProductionReady).toEqual(expect.arrayContaining([
      "not production launch ready",
      "no collaboration/offline semantics",
      "Phase 151 smoke is not launch readiness",
    ]))
    expect(report.artifact).toMatchObject({
      status: "rendered",
      byteLength: 4096,
      digestStatus: "present",
      storageStatus: "not-stored",
      spikeGrade: true,
    })
    expect(report.storage.collections.map((item) => item.kind)).toEqual(seed.expectedStorageCollectionsTouched)
    expect(JSON.parse(JSON.stringify(report))).toEqual(report)
  })

  it("keeps Phase 151 documented as an RC smoke, not launch readiness", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/VERTICAL_SLICE_RC_END_TO_END_SMOKE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 151 end-to-end RC report smoke.")
    expect(boundaryDoc).toContain("bounded RC report")
    expect(boundaryDoc).toContain("not production launch readiness")
    expect(readme).toContain("Vertical slice RC end-to-end smoke")
    expect(readme).toContain("docs/VERTICAL_SLICE_RC_END_TO_END_SMOKE.md")
    expect(ledger).toContain("| 151 | End-to-end RC report smoke | done |")
    expect(roadmap).toContain("## Phase 151: End-To-End RC Report Smoke")
  })
})
