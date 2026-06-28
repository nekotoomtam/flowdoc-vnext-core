import {
  createFlowDocFileJsonArtifactByteStore,
  createFlowDocFileJsonStorageAdapter,
  type FlowDocFileJsonArtifactByteConsistencyResult,
  type FlowDocFileJsonArtifactByteReadResult,
  type FlowDocFileJsonArtifactByteWriteResult,
  type FlowDocFileJsonStorageReadResult,
  type FlowDocFileJsonStorageWriteResult,
} from "@flowdoc/storage-file-json"
import {
  advanceVNextArtifactJob,
  assessVNextKeyDataDiagnostics,
  createVNextArtifactJobPlan,
  createVNextArtifactManifestPlan,
  createVNextDurableHistorySnapshot,
  createVNextEditableSession,
  createVNextRichInlineCommitHistoryRecord,
  createVNextRichInlineSessionPersistenceRecord,
  createVNextSessionStorageRecord,
  createVNextVerticalSliceRcReport,
  createVNextVerticalSliceScenarioPlan,
  evaluateVNextVerticalSliceMeasurementGate,
  parseFlowDocPackageV2DocumentVNext,
  resolveVNextLiveLayoutBoundary,
  runVNextRichInlineCommit,
} from "@flowdoc/vnext-core"
import type {
  FlowDocPackageV2DocumentVNext,
  InlineNode,
  TextBlockNode,
  VNextArtifactJobRecord,
  VNextArtifactManifestRecord,
  VNextStorageRecordKind,
  VNextVerticalSliceRcEvidenceSummary,
  VNextVerticalSliceRcReport,
  VNextVerticalSliceRcStorageCollectionSummary,
  VNextVerticalSliceRcStorageSummary,
  VNextVerticalSliceScenarioSeed,
} from "@flowdoc/vnext-core"

export const FLOWDOC_STORAGE_BACKED_RC_ROUNDTRIP_SOURCE = "flowdoc-storage-backed-rc-roundtrip-smoke"
export const FLOWDOC_STORAGE_BACKED_RC_ROUNDTRIP_MODE = "internal-alpha-storage-backed-rc-roundtrip"

export type FlowDocStorageBackedRcRoundtripStatus = "passed" | "blocked"

export interface FlowDocStorageBackedRcRoundtripInput {
  rootDirectory: string
  packageInput: unknown
  scenarioInput: unknown
  artifactBytes: Uint8Array
  now: string
}

export interface FlowDocStorageBackedRcRoundtripIssue {
  severity: "blocking" | "warning"
  code: string
  path: string
  message: string
}

export interface FlowDocStorageBackedRcRoundtripRecordFact {
  kind: VNextStorageRecordKind
  key: string
  writeStatus: string
  readStatus: string
  revision: number | null
}

export interface FlowDocStorageBackedRcRoundtripArtifactFact {
  artifactId: string
  byteLength: number | null
  sha256: string | null
  storageKey: string | null
  writeStatus: string
  readStatus: string
  consistencyStatus: string
}

export interface FlowDocStorageBackedRcRoundtripResult {
  source: typeof FLOWDOC_STORAGE_BACKED_RC_ROUNDTRIP_SOURCE
  mode: typeof FLOWDOC_STORAGE_BACKED_RC_ROUNDTRIP_MODE
  status: FlowDocStorageBackedRcRoundtripStatus
  report: VNextVerticalSliceRcReport | null
  records: readonly FlowDocStorageBackedRcRoundtripRecordFact[]
  artifact: FlowDocStorageBackedRcRoundtripArtifactFact | null
  issues: readonly FlowDocStorageBackedRcRoundtripIssue[]
  contracts: {
    externalPackage: true
    jsonSafe: true
    usesConcreteFileJsonStorage: true
    recordStorageWrites: true
    artifactByteWrites: true
    reloadsRecords: true
    reloadsArtifactBytes: true
    serverRoute: false
    authzExecution: false
    workerOrQueue: false
    pdfRendererExecution: false
    productionStorageReady: false
    packageSchemaChange: false
    multiRecordTransactions: false
  }
}

interface RecordWriteInput {
  kind: VNextStorageRecordKind
  key: string
  write(): Promise<FlowDocFileJsonStorageWriteResult<unknown>>
  read(): Promise<FlowDocFileJsonStorageReadResult<unknown>>
}

interface RecordRoundtripResult {
  facts: FlowDocStorageBackedRcRoundtripRecordFact[]
  storageSummary: VNextVerticalSliceRcStorageSummary
  issues: FlowDocStorageBackedRcRoundtripIssue[]
}

function contracts(): FlowDocStorageBackedRcRoundtripResult["contracts"] {
  return {
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
  }
}

function blocked(
  issues: readonly FlowDocStorageBackedRcRoundtripIssue[],
  records: readonly FlowDocStorageBackedRcRoundtripRecordFact[] = [],
  artifact: FlowDocStorageBackedRcRoundtripArtifactFact | null = null,
): FlowDocStorageBackedRcRoundtripResult {
  return {
    source: FLOWDOC_STORAGE_BACKED_RC_ROUNDTRIP_SOURCE,
    mode: FLOWDOC_STORAGE_BACKED_RC_ROUNDTRIP_MODE,
    status: "blocked",
    report: null,
    records,
    artifact,
    issues,
    contracts: contracts(),
  }
}

function passed(
  report: VNextVerticalSliceRcReport,
  records: readonly FlowDocStorageBackedRcRoundtripRecordFact[],
  artifact: FlowDocStorageBackedRcRoundtripArtifactFact,
  issues: readonly FlowDocStorageBackedRcRoundtripIssue[],
): FlowDocStorageBackedRcRoundtripResult {
  return {
    source: FLOWDOC_STORAGE_BACKED_RC_ROUNDTRIP_SOURCE,
    mode: FLOWDOC_STORAGE_BACKED_RC_ROUNDTRIP_MODE,
    status: report.failBlocker.length === 0 && issues.every((item) => item.severity !== "blocking") ? "passed" : "blocked",
    report,
    records,
    artifact,
    issues,
    contracts: contracts(),
  }
}

function issue(
  severity: FlowDocStorageBackedRcRoundtripIssue["severity"],
  code: string,
  path: string,
  message: string,
): FlowDocStorageBackedRcRoundtripIssue {
  return { severity, code, path, message }
}

function textBlockChildren(pack: FlowDocPackageV2DocumentVNext, textBlockId: string): readonly InlineNode[] | null {
  for (const section of pack.document.document.sections) {
    const node = section.nodes[textBlockId]
    if (node?.type === "text-block") return (node as TextBlockNode).children
  }

  return null
}

function packageWithDocument(
  pack: FlowDocPackageV2DocumentVNext,
  document: FlowDocPackageV2DocumentVNext["document"],
): FlowDocPackageV2DocumentVNext {
  return {
    ...pack,
    document,
  }
}

function createRenderedJob(
  seed: VNextVerticalSliceScenarioSeed,
  manifest: VNextArtifactManifestRecord,
  now: string,
): VNextArtifactJobRecord | FlowDocStorageBackedRcRoundtripIssue[] {
  const plan = createVNextArtifactJobPlan({
    jobId: `job:${seed.scenarioId}:storage-backed-roundtrip`,
    artifactId: seed.artifactId,
    sourcePackageId: seed.packageId,
    sessionId: seed.sessionId,
    layoutProfileId: "layout-profile-v1",
    measurementProfileId: seed.measurementProfileId,
    rendererProfileId: seed.rendererProfileId,
    format: "pdf",
    mediaType: "application/pdf",
    createdAt: now,
  })

  if (plan.job == null) {
    return plan.issues.map((entry) => issue("blocking", entry.code, `artifactJob.${entry.path}`, entry.message))
  }

  const layoutRunning = advanceVNextArtifactJob(plan.job, { action: "start-layout", updatedAt: now })
  if (layoutRunning.status !== "advanced") return transitionIssues("start-layout", layoutRunning.issues)

  const layoutComplete = advanceVNextArtifactJob(layoutRunning.job, {
    action: "complete-layout",
    updatedAt: now,
    cursor: {
      layoutJobOffset: 1,
      completedSourceItemIds: ["storage-backed-rc-roundtrip"],
    },
    completedStepCount: 1,
    totalStepCount: 1,
  })
  if (layoutComplete.status !== "advanced") return transitionIssues("complete-layout", layoutComplete.issues)

  const rendering = advanceVNextArtifactJob(layoutComplete.job, { action: "start-rendering", updatedAt: now })
  if (rendering.status !== "advanced") return transitionIssues("start-rendering", rendering.issues)

  const rendered = advanceVNextArtifactJob(rendering.job, {
    action: "complete-render",
    updatedAt: now,
    artifactManifest: manifest,
  })
  if (rendered.status !== "advanced") return transitionIssues("complete-render", rendered.issues)

  return rendered.job
}

function transitionIssues(
  action: string,
  issues: readonly { code: string; path: string; message: string }[],
): FlowDocStorageBackedRcRoundtripIssue[] {
  return issues.map((entry) => issue("blocking", entry.code, `artifactJob.${action}.${entry.path}`, entry.message))
}

async function writeAndReadRecords(
  records: readonly RecordWriteInput[],
): Promise<RecordRoundtripResult> {
  const facts: FlowDocStorageBackedRcRoundtripRecordFact[] = []
  const summaries: VNextVerticalSliceRcStorageCollectionSummary[] = []
  const issues: FlowDocStorageBackedRcRoundtripIssue[] = []

  for (const record of records) {
    const writeResult = await record.write()
    const readResult = await record.read()
    const accepted = writeResult.ok && readResult.ok
    const status = accepted ? "accepted" : writeResult.status === "conflict" ? "conflict" : "blocked"
    const revision = readResult.ok ? readResult.record.revision : writeResult.ok ? writeResult.record.revision : null

    if (!writeResult.ok) {
      issues.push(...writeResult.issues.map((entry) => issue("blocking", entry.code, `${record.kind}.write.${entry.path}`, entry.message)))
    }
    if (!readResult.ok) {
      issues.push(...readResult.issues.map((entry) => issue("blocking", entry.code, `${record.kind}.read.${entry.path}`, entry.message)))
    }

    facts.push({
      kind: record.kind,
      key: record.key,
      writeStatus: writeResult.status,
      readStatus: readResult.status,
      revision,
    })
    summaries.push({
      kind: record.kind,
      status,
      key: record.key,
      revision,
      writeStatus: writeResult.status,
    })
  }

  const storageStatus = summaries.every((entry) => entry.status === "accepted")
    ? "accepted"
    : summaries.some((entry) => entry.status === "conflict")
      ? "conflict"
      : "blocked"

  return {
    facts,
    storageSummary: {
      status: storageStatus,
      collections: summaries,
    },
    issues,
  }
}

function artifactFact(
  writeResult: FlowDocFileJsonArtifactByteWriteResult,
  readResult: FlowDocFileJsonArtifactByteReadResult | null,
  consistencyResult: FlowDocFileJsonArtifactByteConsistencyResult | null,
): FlowDocStorageBackedRcRoundtripArtifactFact {
  const artifact = writeResult.artifact ?? readResult?.artifact ?? consistencyResult?.artifact ?? null

  return {
    artifactId: artifact?.artifactId ?? "",
    byteLength: artifact?.byteLength ?? null,
    sha256: artifact?.sha256 ?? null,
    storageKey: artifact?.storageKey ?? null,
    writeStatus: writeResult.status,
    readStatus: readResult?.status ?? "not-run",
    consistencyStatus: consistencyResult?.status ?? "not-run",
  }
}

function evidence(
  lane: VNextVerticalSliceRcEvidenceSummary["lane"],
  status: VNextVerticalSliceRcEvidenceSummary["status"],
  summary: string,
  facts: VNextVerticalSliceRcEvidenceSummary["facts"] = {},
): VNextVerticalSliceRcEvidenceSummary {
  return { lane, status, summary, facts }
}

export async function runFlowDocStorageBackedRcRoundtripSmoke(
  input: FlowDocStorageBackedRcRoundtripInput,
): Promise<FlowDocStorageBackedRcRoundtripResult> {
  const scenarioPlan = createVNextVerticalSliceScenarioPlan(input.packageInput, input.scenarioInput)

  if (scenarioPlan.scenario == null || scenarioPlan.rcReportSeed == null) {
    return blocked(scenarioPlan.issues.map((entry) => issue("blocking", entry.code, `scenario.${entry.path}`, entry.message)))
  }

  const seed = scenarioPlan.rcReportSeed
  const pack = parseFlowDocPackageV2DocumentVNext(input.packageInput)
  const beforeChildren = textBlockChildren(pack, scenarioPlan.scenario.intendedEdit.targetTextBlockId)

  if (beforeChildren == null) {
    return blocked([issue("blocking", "target-not-found", "scenario.intendedEdit.targetTextBlockId", "target text block was not found")])
  }

  const rich = runVNextRichInlineCommit(pack.document, {
    kind: scenarioPlan.scenario.intendedEdit.operationKind,
    source: "user",
    textBlockId: scenarioPlan.scenario.intendedEdit.targetTextBlockId,
    children: scenarioPlan.scenario.intendedEdit.replacementChildren,
  })

  if (!rich.ok) {
    return blocked(rich.issues.map((entry) => issue("blocking", entry.code, `richInline.${entry.path}`, entry.message)))
  }

  const mutatedPack = packageWithDocument(pack, rich.document)
  const session = createVNextEditableSession(mutatedPack)
  const historyRecord = createVNextRichInlineCommitHistoryRecord(rich)
  const live = resolveVNextLiveLayoutBoundary({
    kind: "authoring-history",
    records: [historyRecord],
    visibleRange: {
      kind: "section-window",
      sectionId: rich.transaction.dirtyScope.sectionId,
      zoneId: rich.transaction.dirtyScope.zoneId,
      startNodeId: rich.transaction.targetTextBlockId,
      endNodeId: rich.transaction.targetTextBlockId,
    },
  })
  const diagnostics = assessVNextKeyDataDiagnostics(mutatedPack.document, mutatedPack.fields, mutatedPack.data)
  const byteStore = createFlowDocFileJsonArtifactByteStore({ rootDirectory: input.rootDirectory })
  const byteWrite = await byteStore.write({
    artifactId: seed.artifactId,
    mediaType: "application/pdf",
    bytes: input.artifactBytes,
  })
  let byteRead: FlowDocFileJsonArtifactByteReadResult | null = null
  let byteConsistency: FlowDocFileJsonArtifactByteConsistencyResult | null = null

  if (!byteWrite.ok) {
    return blocked(byteWrite.issues.map((entry) => issue("blocking", entry.code, `artifactBytes.${entry.path}`, entry.message)), [], artifactFact(byteWrite, null, null))
  }

  byteRead = await byteStore.read({ storageKey: byteWrite.artifact.storageKey })

  if (!byteRead.ok) {
    return blocked(byteRead.issues.map((entry) => issue("blocking", entry.code, `artifactBytes.read.${entry.path}`, entry.message)), [], artifactFact(byteWrite, byteRead, null))
  }

  const manifestPlan = createVNextArtifactManifestPlan({
    artifactId: seed.artifactId,
    sourcePackageId: seed.packageId,
    sessionId: seed.sessionId,
    jobId: `job:${seed.scenarioId}:storage-backed-roundtrip`,
    rendererProfileId: seed.rendererProfileId,
    measurementProfileId: seed.measurementProfileId,
    format: "pdf",
    mediaType: "application/pdf",
    byteLength: byteWrite.artifact.byteLength,
    sha256: byteWrite.artifact.sha256,
    storageKey: byteWrite.artifact.storageKey,
    createdAt: input.now,
    status: "rendered",
    error: null,
  })

  if (manifestPlan.record == null) {
    return blocked(manifestPlan.issues.map((entry) => issue("blocking", entry.code, `artifactManifest.${entry.path}`, entry.message)), [], artifactFact(byteWrite, byteRead, null))
  }

  const manifest = manifestPlan.record
  byteConsistency = await byteStore.verifyManifestConsistency(manifest)

  if (!byteConsistency.ok) {
    return blocked(byteConsistency.issues.map((entry) => issue("blocking", entry.code, `artifactConsistency.${entry.path}`, entry.message)), [], artifactFact(byteWrite, byteRead, byteConsistency))
  }

  const job = createRenderedJob(seed, manifest, input.now)

  if (Array.isArray(job)) {
    return blocked(job, [], artifactFact(byteWrite, byteRead, byteConsistency))
  }

  const adapter = createFlowDocFileJsonStorageAdapter({ rootDirectory: input.rootDirectory })
  const keys = {
    session: seed.sessionId,
    history: `history:${seed.scenarioId}`,
    richInline: `rich-inline:${seed.scenarioId}`,
    manifest: seed.artifactId,
    job: job.jobId,
  }
  const sessionRecord = createVNextSessionStorageRecord(session, {
    reason: "storage-backed-rc-roundtrip-smoke",
    storageKey: keys.session,
  })
  const history = createVNextDurableHistorySnapshot([historyRecord], {
    documentRevision: session.revisions.document,
    historyKey: keys.history,
    reason: "storage-backed-rc-roundtrip-smoke",
  })
  const richInline = createVNextRichInlineSessionPersistenceRecord(session, {
    historyKey: keys.history,
    historyRecords: [historyRecord],
    reason: "storage-backed-rc-roundtrip-smoke",
    replayPatches: [{
      historyRecord,
      sourceAction: "storage-backed-rc-roundtrip-smoke",
      targetTextBlockId: scenarioPlan.scenario.intendedEdit.targetTextBlockId,
      beforeChildren,
      afterChildren: scenarioPlan.scenario.intendedEdit.replacementChildren,
    }],
    storageKey: keys.richInline,
  })

  const recordRoundtrip = await writeAndReadRecords([
    {
      kind: "package-session",
      key: keys.session,
      write: () => adapter.packageSessions.write({ kind: "package-session", key: keys.session, value: sessionRecord, expectedRevision: null, idempotencyKey: "storage-backed-session", now: input.now }) as Promise<FlowDocFileJsonStorageWriteResult<unknown>>,
      read: () => adapter.packageSessions.read({ kind: "package-session", key: keys.session }) as Promise<FlowDocFileJsonStorageReadResult<unknown>>,
    },
    {
      kind: "durable-history",
      key: keys.history,
      write: () => adapter.durableHistories.write({ kind: "durable-history", key: keys.history, value: history, expectedRevision: null, idempotencyKey: "storage-backed-history", now: input.now }) as Promise<FlowDocFileJsonStorageWriteResult<unknown>>,
      read: () => adapter.durableHistories.read({ kind: "durable-history", key: keys.history }) as Promise<FlowDocFileJsonStorageReadResult<unknown>>,
    },
    {
      kind: "rich-inline-session",
      key: keys.richInline,
      write: () => adapter.richInlineSessions.write({ kind: "rich-inline-session", key: keys.richInline, value: richInline, expectedRevision: null, idempotencyKey: "storage-backed-rich-inline", now: input.now }) as Promise<FlowDocFileJsonStorageWriteResult<unknown>>,
      read: () => adapter.richInlineSessions.read({ kind: "rich-inline-session", key: keys.richInline }) as Promise<FlowDocFileJsonStorageReadResult<unknown>>,
    },
    {
      kind: "artifact-manifest",
      key: keys.manifest,
      write: () => adapter.artifactManifests.write({ kind: "artifact-manifest", key: keys.manifest, value: manifest, expectedRevision: null, idempotencyKey: "storage-backed-manifest", now: input.now }) as Promise<FlowDocFileJsonStorageWriteResult<unknown>>,
      read: () => adapter.artifactManifests.read({ kind: "artifact-manifest", key: keys.manifest }) as Promise<FlowDocFileJsonStorageReadResult<unknown>>,
    },
    {
      kind: "artifact-job",
      key: keys.job,
      write: () => adapter.artifactJobs.write({ kind: "artifact-job", key: keys.job, value: job, expectedRevision: null, idempotencyKey: "storage-backed-job", now: input.now }) as Promise<FlowDocFileJsonStorageWriteResult<unknown>>,
      read: () => adapter.artifactJobs.read({ kind: "artifact-job", key: keys.job }) as Promise<FlowDocFileJsonStorageReadResult<unknown>>,
    },
  ])

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
    artifact: {
      status: "rendered",
      artifactId: seed.artifactId,
      format: "pdf",
      mediaType: "application/pdf",
      byteLength: byteWrite.artifact.byteLength,
      sha256: byteWrite.artifact.sha256,
      digestStatus: "present",
      storageStatus: byteConsistency.status,
      spikeGrade: true,
    },
    storage: recordRoundtrip.storageSummary,
    evidence: [
      evidence("canonical-package", "pass", "scenario package parsed as canonical package v2/document v3"),
      evidence("key-data-diagnostics", diagnostics.status === "ready" ? "pass" : "risk", `key diagnostics status ${diagnostics.status}`),
      evidence("authoring-session", "pass", "mutated single-user editable session produced a package storage record"),
      evidence("rich-inline-commit", "pass", `rich inline commit ${rich.transaction.kind} accepted`),
      evidence("exact-generation", "pass", `exact generation ${live.freshness.exactGeneration.status}`),
      evidence("measurement", measurementGate.status === "accepted" ? "pass" : "risk", `measurement gate ${measurementGate.status}`),
      evidence("artifact", "pass", "artifact bytes wrote, read back, and matched rendered manifest", {
        byteLength: byteWrite.artifact.byteLength,
        sha256: byteWrite.artifact.sha256,
      }),
      evidence("artifact-job", job.status === "rendered" ? "pass" : "risk", `artifact job ${job.status}`),
      evidence("storage", recordRoundtrip.storageSummary.status === "accepted" ? "pass" : "risk", `concrete storage roundtrip ${recordRoundtrip.storageSummary.status}`, {
        recordCount: recordRoundtrip.facts.length,
        artifactByteStatus: byteConsistency.status,
      }),
    ],
    pass: [
      "Phase 175 storage-backed RC roundtrip produced",
      "artifact bytes persisted and reloaded",
      "record collections persisted and reloaded",
    ],
    risk: [
      "record and byte writes are not transactionally linked",
      "PDF evidence remains supplied spike-grade bytes",
    ],
    intentionallyNotProductionReady: [
      "Phase 175 smoke is not launch readiness",
      "no backend route binding",
      "no production storage durability claim",
    ],
  })

  return passed(
    report,
    recordRoundtrip.facts,
    artifactFact(byteWrite, byteRead, byteConsistency),
    recordRoundtrip.issues,
  )
}
