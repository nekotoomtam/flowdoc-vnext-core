import {
  createFlowDocFileJsonArtifactByteStore,
  createFlowDocFileJsonStorageAdapter,
  type FlowDocFileJsonStorageAdapter,
  type FlowDocFileJsonStorageReadResult,
  type FlowDocFileJsonStorageWriteResult,
} from "@flowdoc/storage-file-json"
import {
  assessVNextKeyDataDiagnostics,
  buildVNextMeasuredRendererConsumption,
  createVNextDurableHistorySnapshot,
  createVNextEditableSession,
  createVNextPdfRendererAdapterPlan,
  createVNextRichInlineCommitHistoryRecord,
  createVNextRichInlineSessionPersistenceRecord,
  createVNextSessionStorageRecord,
  createVNextVerticalSliceRcReport,
  createVNextVerticalSliceScenarioPlan,
  evaluateVNextVerticalSliceMeasurementGate,
  paginateVNextDocument,
  parseFlowDocPackageV2DocumentVNext,
  resolveVNextLiveLayoutBoundary,
  runVNextRichInlineCommit,
  type FlowDocPackageV2DocumentVNext,
  type InlineNode,
  type TextBlockNode,
  type VNextDurableHistorySnapshot,
  type VNextRichInlineSessionPersistenceRecord,
  type VNextSessionStorageRecord,
  type VNextStorageRecordKind,
  type VNextVerticalSliceMeasurementDriftTolerance,
  type VNextVerticalSliceMeasurementRuntimeSummary,
  type VNextVerticalSliceRcEvidenceSummary,
  type VNextVerticalSliceRcReport,
  type VNextVerticalSliceRcStorageCollectionSummary,
  type VNextVerticalSliceRcStorageSummary,
} from "@flowdoc/vnext-core"
import {
  runFlowDocArtifactJobExecutionSlice,
  type FlowDocArtifactJobExecutionResult,
} from "./artifactJobExecution.js"

export const FLOWDOC_INTERNAL_ALPHA_VERTICAL_SLICE_SOURCE = "flowdoc-internal-alpha-vertical-slice"
export const FLOWDOC_INTERNAL_ALPHA_VERTICAL_SLICE_MODE = "internal-alpha-open-edit-save-reload-pdf-artifact-report"

export type FlowDocInternalAlphaVerticalSliceStatus = "ready" | "ready-with-risks" | "blocked"
export type FlowDocInternalAlphaVerticalSliceStepName =
  | "open-document"
  | "edit-active-text-block"
  | "save-records"
  | "reload-session"
  | "generate-pdf"
  | "store-artifact"
  | "retrieve-artifact"
  | "status-report"

export interface FlowDocInternalAlphaVerticalSliceInput {
  rootDirectory: string
  packageInput: unknown
  scenarioInput: unknown
  now: string
  measurementRuntime?: VNextVerticalSliceMeasurementRuntimeSummary
  measurementTolerance?: VNextVerticalSliceMeasurementDriftTolerance
}

export interface FlowDocInternalAlphaVerticalSliceIssue {
  severity: "blocking" | "warning"
  code: string
  path: string
  message: string
}

export interface FlowDocInternalAlphaVerticalSliceStep {
  name: FlowDocInternalAlphaVerticalSliceStepName
  status: VNextVerticalSliceRcEvidenceSummary["status"]
  summary: string
  facts: Record<string, string | number | boolean | null>
}

export interface FlowDocInternalAlphaVerticalSliceRecordFact {
  kind: VNextStorageRecordKind
  key: string
  writeStatus: string
  readStatus: string
  revision: number | null
}

export interface FlowDocInternalAlphaVerticalSliceArtifactFact {
  artifactId: string
  byteLength: number | null
  sha256: string | null
  storageKey: string | null
  writeStatus: string
  readStatus: string
  consistencyStatus: string
}

export interface FlowDocInternalAlphaVerticalSliceResult {
  source: typeof FLOWDOC_INTERNAL_ALPHA_VERTICAL_SLICE_SOURCE
  mode: typeof FLOWDOC_INTERNAL_ALPHA_VERTICAL_SLICE_MODE
  status: FlowDocInternalAlphaVerticalSliceStatus
  report: VNextVerticalSliceRcReport | null
  steps: readonly FlowDocInternalAlphaVerticalSliceStep[]
  records: readonly FlowDocInternalAlphaVerticalSliceRecordFact[]
  artifact: FlowDocInternalAlphaVerticalSliceArtifactFact | null
  issues: readonly FlowDocInternalAlphaVerticalSliceIssue[]
  contracts: {
    externalPackage: true
    jsonSafe: true
    fixtureFed: true
    activeTextBlockOnly: true
    usesConcreteFileJsonStorage: true
    recordStorageWrites: true
    reloadsSessionRecord: true
    regeneratesPdfFromReloadedPackage: true
    artifactByteWrites: true
    retrievesArtifactBytes: true
    uiImplementation: false
    serverRoute: false
    authzExecution: false
    workerOrQueue: false
    productionStorageReady: false
    productionRendererReady: false
    productionMeasurementReady: false
    productionInputReady: false
    packageSchemaChange: false
    documentSchemaChange: false
    collaborationOffline: false
    legacyEditorRuntimeCopy: false
  }
}

interface RecordWriteInput<TRecord> {
  kind: VNextStorageRecordKind
  key: string
  write(): Promise<FlowDocFileJsonStorageWriteResult<TRecord>>
  read(): Promise<FlowDocFileJsonStorageReadResult<TRecord>>
}

interface RecordRoundtrip<TRecord> {
  fact: FlowDocInternalAlphaVerticalSliceRecordFact
  record: TRecord | null
  revision: number | null
  ok: boolean
  issues: FlowDocInternalAlphaVerticalSliceIssue[]
}

function contracts(): FlowDocInternalAlphaVerticalSliceResult["contracts"] {
  return {
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
  }
}

function issue(
  severity: FlowDocInternalAlphaVerticalSliceIssue["severity"],
  code: string,
  path: string,
  message: string,
): FlowDocInternalAlphaVerticalSliceIssue {
  return { severity, code, path, message }
}

function step(
  name: FlowDocInternalAlphaVerticalSliceStepName,
  status: FlowDocInternalAlphaVerticalSliceStep["status"],
  summary: string,
  facts: FlowDocInternalAlphaVerticalSliceStep["facts"] = {},
): FlowDocInternalAlphaVerticalSliceStep {
  return { name, status, summary, facts }
}

function blocked(
  issues: readonly FlowDocInternalAlphaVerticalSliceIssue[],
  steps: readonly FlowDocInternalAlphaVerticalSliceStep[],
  records: readonly FlowDocInternalAlphaVerticalSliceRecordFact[] = [],
  artifact: FlowDocInternalAlphaVerticalSliceArtifactFact | null = null,
): FlowDocInternalAlphaVerticalSliceResult {
  return {
    source: FLOWDOC_INTERNAL_ALPHA_VERTICAL_SLICE_SOURCE,
    mode: FLOWDOC_INTERNAL_ALPHA_VERTICAL_SLICE_MODE,
    status: "blocked",
    report: null,
    steps,
    records,
    artifact,
    issues,
    contracts: contracts(),
  }
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

async function writeAndReadRecord<TRecord>(
  input: RecordWriteInput<TRecord>,
): Promise<RecordRoundtrip<TRecord>> {
  const writeResult = await input.write()
  const readResult = await input.read()
  const record = readResult.ok ? readResult.record.value : writeResult.ok ? writeResult.record.value : null
  const revision = readResult.ok ? readResult.record.revision : writeResult.ok ? writeResult.record.revision : null
  const issues: FlowDocInternalAlphaVerticalSliceIssue[] = []

  if (!writeResult.ok) {
    issues.push(...writeResult.issues.map((entry) => issue("blocking", entry.code, `${input.kind}.write.${entry.path}`, entry.message)))
  }
  if (!readResult.ok) {
    issues.push(...readResult.issues.map((entry) => issue("blocking", entry.code, `${input.kind}.read.${entry.path}`, entry.message)))
  }

  return {
    fact: {
      kind: input.kind,
      key: input.key,
      writeStatus: writeResult.status,
      readStatus: readResult.status,
      revision,
    },
    record,
    revision,
    ok: writeResult.ok && readResult.ok,
    issues,
  }
}

function storageSummary(
  records: readonly FlowDocInternalAlphaVerticalSliceRecordFact[],
): VNextVerticalSliceRcStorageSummary {
  const collections: VNextVerticalSliceRcStorageCollectionSummary[] = records.map((record) => ({
    kind: record.kind,
    key: record.key,
    revision: record.revision,
    writeStatus: record.writeStatus,
    status: record.writeStatus === "conflict"
      ? "conflict"
      : record.readStatus === "found" && (record.writeStatus === "written" || record.writeStatus === "idempotent-replay")
        ? "accepted"
        : "blocked",
  }))
  const status = collections.every((entry) => entry.status === "accepted")
    ? "accepted"
    : collections.some((entry) => entry.status === "conflict")
      ? "conflict"
      : "blocked"

  return { status, collections }
}

function finalArtifactRecord(
  artifactExecution: FlowDocArtifactJobExecutionResult,
  manifestReadStatus: string,
  jobReadStatus: string,
): readonly FlowDocInternalAlphaVerticalSliceRecordFact[] {
  const manifestRecord = [...artifactExecution.records].reverse().find((record) => record.kind === "artifact-manifest")
  const jobRecord = [...artifactExecution.records].reverse().find((record) => record.kind === "artifact-job")
  const records: FlowDocInternalAlphaVerticalSliceRecordFact[] = []

  if (manifestRecord != null) {
    records.push({
      kind: "artifact-manifest",
      key: manifestRecord.key,
      writeStatus: manifestRecord.writeStatus,
      readStatus: manifestReadStatus,
      revision: manifestRecord.revision,
    })
  }
  if (jobRecord != null) {
    records.push({
      kind: "artifact-job",
      key: jobRecord.key,
      writeStatus: jobRecord.writeStatus,
      readStatus: jobReadStatus,
      revision: jobRecord.revision,
    })
  }

  return records
}

function evidence(
  lane: VNextVerticalSliceRcEvidenceSummary["lane"],
  status: VNextVerticalSliceRcEvidenceSummary["status"],
  summary: string,
  facts: VNextVerticalSliceRcEvidenceSummary["facts"] = {},
): VNextVerticalSliceRcEvidenceSummary {
  return { lane, status, summary, facts }
}

function artifactFact(
  artifactExecution: FlowDocArtifactJobExecutionResult,
  readStatus: string,
  consistencyStatus: string,
): FlowDocInternalAlphaVerticalSliceArtifactFact | null {
  if (artifactExecution.artifact == null) return null

  return {
    artifactId: artifactExecution.artifact.artifactId,
    byteLength: artifactExecution.artifact.byteLength,
    sha256: artifactExecution.artifact.sha256,
    storageKey: artifactExecution.artifact.storageKey,
    writeStatus: artifactExecution.bytes?.writeStatus ?? "not-run",
    readStatus,
    consistencyStatus,
  }
}

function dataValues(pack: FlowDocPackageV2DocumentVNext): Record<string, string | number | boolean | null> {
  return pack.data?.values ?? {}
}

export async function runFlowDocInternalAlphaVerticalSlice(
  input: FlowDocInternalAlphaVerticalSliceInput,
): Promise<FlowDocInternalAlphaVerticalSliceResult> {
  const steps: FlowDocInternalAlphaVerticalSliceStep[] = []
  const scenarioPlan = createVNextVerticalSliceScenarioPlan(input.packageInput, input.scenarioInput)

  if (scenarioPlan.scenario == null || scenarioPlan.rcReportSeed == null || scenarioPlan.packageSummary == null) {
    steps.push(step("open-document", "blocked", "scenario/package validation blocked the vertical slice"))
    return blocked(
      scenarioPlan.issues.map((entry) => issue("blocking", entry.code, `scenario.${entry.path}`, entry.message)),
      steps,
    )
  }

  const seed = scenarioPlan.rcReportSeed
  const scenario = scenarioPlan.scenario
  const pack = parseFlowDocPackageV2DocumentVNext(input.packageInput)
  const openSession = createVNextEditableSession(pack)
  const beforeChildren = textBlockChildren(pack, scenario.intendedEdit.targetTextBlockId)
  steps.push(step("open-document", "pass", "canonical fixture opened as editable session", {
    packageId: pack.id,
    documentVersion: pack.document.version,
    targetTextBlockId: scenario.intendedEdit.targetTextBlockId,
  }))

  if (beforeChildren == null) {
    steps.push(step("edit-active-text-block", "blocked", "target active text block was not found"))
    return blocked([issue("blocking", "target-not-found", "scenario.intendedEdit.targetTextBlockId", "target active text block was not found")], steps)
  }

  const rich = runVNextRichInlineCommit(pack.document, {
    kind: scenario.intendedEdit.operationKind,
    source: "user",
    textBlockId: scenario.intendedEdit.targetTextBlockId,
    children: scenario.intendedEdit.replacementChildren,
  })

  if (!rich.ok) {
    steps.push(step("edit-active-text-block", "blocked", "active text-block edit was rejected"))
    return blocked(
      rich.issues.map((entry) => issue("blocking", entry.code, `richInline.${entry.path}`, entry.message)),
      steps,
    )
  }

  steps.push(step("edit-active-text-block", "pass", "active text-block rich inline replace accepted", {
    operationKind: rich.transaction.kind,
    fieldRefCount: rich.transaction.keyHistory.fieldKeys.length,
    exactGenerationStale: rich.transaction.renderInvalidation.exactGenerationStale,
  }))

  const mutatedPack = packageWithDocument(pack, rich.document)
  const mutatedSession = createVNextEditableSession(mutatedPack)
  const historyRecord = createVNextRichInlineCommitHistoryRecord(rich)
  const keys = {
    session: seed.sessionId,
    history: `history:${seed.scenarioId}`,
    richInline: `rich-inline:${seed.scenarioId}`,
    manifest: seed.artifactId,
    job: `job:${seed.scenarioId}:internal-alpha-vertical-slice`,
  }
  const sessionRecord = createVNextSessionStorageRecord(mutatedSession, {
    reason: "internal-alpha-vertical-slice",
    storageKey: keys.session,
  })
  const history = createVNextDurableHistorySnapshot([historyRecord], {
    documentRevision: mutatedSession.revisions.document,
    historyKey: keys.history,
    reason: "internal-alpha-vertical-slice",
  })
  const richInline = createVNextRichInlineSessionPersistenceRecord(mutatedSession, {
    historyKey: keys.history,
    historyRecords: [historyRecord],
    reason: "internal-alpha-vertical-slice",
    replayPatches: [{
      historyRecord,
      sourceAction: "internal-alpha-vertical-slice",
      targetTextBlockId: scenario.intendedEdit.targetTextBlockId,
      beforeChildren,
      afterChildren: scenario.intendedEdit.replacementChildren,
    }],
    storageKey: keys.richInline,
  })
  const adapter = createFlowDocFileJsonStorageAdapter({ rootDirectory: input.rootDirectory })
  const writtenRecords: FlowDocInternalAlphaVerticalSliceRecordFact[] = []

  const sessionRoundtrip = await writeAndReadRecord<VNextSessionStorageRecord>({
    kind: "package-session",
    key: keys.session,
    write: () => adapter.packageSessions.write({ kind: "package-session", key: keys.session, value: sessionRecord, expectedRevision: null, idempotencyKey: "internal-alpha-session", now: input.now }),
    read: () => adapter.packageSessions.read({ kind: "package-session", key: keys.session }),
  })
  writtenRecords.push(sessionRoundtrip.fact)
  const historyRoundtrip = await writeAndReadRecord<VNextDurableHistorySnapshot>({
    kind: "durable-history",
    key: keys.history,
    write: () => adapter.durableHistories.write({ kind: "durable-history", key: keys.history, value: history, expectedRevision: null, idempotencyKey: "internal-alpha-history", now: input.now }),
    read: () => adapter.durableHistories.read({ kind: "durable-history", key: keys.history }),
  })
  writtenRecords.push(historyRoundtrip.fact)
  const richInlineRoundtrip = await writeAndReadRecord<VNextRichInlineSessionPersistenceRecord>({
    kind: "rich-inline-session",
    key: keys.richInline,
    write: () => adapter.richInlineSessions.write({ kind: "rich-inline-session", key: keys.richInline, value: richInline, expectedRevision: null, idempotencyKey: "internal-alpha-rich-inline", now: input.now }),
    read: () => adapter.richInlineSessions.read({ kind: "rich-inline-session", key: keys.richInline }),
  })
  writtenRecords.push(richInlineRoundtrip.fact)

  const saveIssues = [...sessionRoundtrip.issues, ...historyRoundtrip.issues, ...richInlineRoundtrip.issues]
  if (saveIssues.length > 0 || sessionRoundtrip.record == null) {
    steps.push(step("save-records", "blocked", "session/history/rich-inline save did not complete"))
    return blocked(saveIssues, steps, writtenRecords)
  }

  steps.push(step("save-records", "pass", "session, durable history, and rich-inline records saved and read back", {
    recordCount: 3,
  }))

  const reloadedPack = parseFlowDocPackageV2DocumentVNext(sessionRoundtrip.record.package)
  steps.push(step("reload-session", "pass", "package session reloaded from file-backed storage", {
    packageId: reloadedPack.id,
    sessionRevision: sessionRoundtrip.revision,
  }))

  const pagination = paginateVNextDocument(reloadedPack.document, {
    measurementProfileId: seed.measurementProfileId,
    data: dataValues(reloadedPack),
  })
  const consumption = buildVNextMeasuredRendererConsumption(pagination)
  const pdfPlan = createVNextPdfRendererAdapterPlan(consumption)
  const textCommands = pdfPlan.drawCommands.filter((command) => command.operation === "draw-text")
  steps.push(step("generate-pdf", pdfPlan.status === "ready" ? "pass" : "blocked", `PDF adapter plan ${pdfPlan.status}`, {
    pageCount: pdfPlan.pageCount,
    drawCommandCount: pdfPlan.summary.drawCommandCount,
    textCommandCount: pdfPlan.summary.textCommandCount,
  }))

  if (pdfPlan.status !== "ready") {
    return blocked(pdfPlan.blockingIssues.map((entry) => issue("blocking", entry.code, `pdfPlan.${entry.fragmentId}`, entry.message)), steps, writtenRecords)
  }

  const maxTextWidth = textCommands.reduce((max, command) => Math.max(max, command.bounds.widthPt), 0)
  const textHeight = textCommands.reduce((total, command) => total + command.bounds.heightPt, 0)
  const measurementGate = evaluateVNextVerticalSliceMeasurementGate({
    measurementProfileId: seed.measurementProfileId,
    rendererProfileId: seed.rendererProfileId,
    rendererBacked: {
      measurementProfileId: seed.measurementProfileId,
      lineBoxCount: textCommands.length,
      widthPt: maxTextWidth,
      heightPt: textHeight,
    },
    approximate: {
      measurementProfileId: seed.measurementProfileId,
      lineBoxCount: textCommands.length,
      widthPt: maxTextWidth,
      heightPt: textHeight,
    },
    runtime: input.measurementRuntime ?? {
      digestStatus: "missing",
      nativeWasmParityStatus: "missing",
    },
    tolerance: input.measurementTolerance ?? {
      maxWidthDriftPt: 1,
      maxHeightDriftPt: 1,
      maxLineCountDrift: 0,
      overTolerance: "warning",
    },
  })

  const artifactExecution = await runFlowDocArtifactJobExecutionSlice({
    rootDirectory: input.rootDirectory,
    jobInput: {
      jobId: keys.job,
      artifactId: keys.manifest,
      sourcePackageId: seed.packageId,
      sessionId: seed.sessionId,
      layoutProfileId: "layout-profile-v1",
      measurementProfileId: seed.measurementProfileId,
      rendererProfileId: seed.rendererProfileId,
      format: "pdf",
      mediaType: "application/pdf",
      createdAt: input.now,
    },
    pdfPlan,
    spikeId: `${seed.scenarioId}:internal-alpha-vertical-slice`,
    now: input.now,
    layoutCompletedSourceItemIds: [scenario.intendedEdit.targetTextBlockId],
  })

  steps.push(step("store-artifact", artifactExecution.status === "rendered" ? "pass" : "blocked", `artifact job execution ${artifactExecution.status}`, {
    artifactId: artifactExecution.artifact?.artifactId ?? keys.manifest,
    byteLength: artifactExecution.artifact?.byteLength ?? null,
  }))

  const manifestRead = await adapter.artifactManifests.read({ kind: "artifact-manifest", key: keys.manifest })
  const jobRead = await adapter.artifactJobs.read({ kind: "artifact-job", key: keys.job })
  const byteStore = createFlowDocFileJsonArtifactByteStore({ rootDirectory: input.rootDirectory })
  const artifactRead = artifactExecution.artifact?.storageKey == null
    ? null
    : await byteStore.read({ storageKey: artifactExecution.artifact.storageKey })
  const consistency = manifestRead.ok
    ? await byteStore.verifyManifestConsistency(manifestRead.record.value)
    : null
  const artifact = artifactFact(
    artifactExecution,
    artifactRead?.status ?? "not-run",
    consistency?.status ?? "not-run",
  )
  const artifactRecords = finalArtifactRecord(
    artifactExecution,
    manifestRead.status,
    jobRead.status,
  )
  const records = [...writtenRecords, ...artifactRecords]
  const retrieveOk = artifactRead?.ok === true && consistency?.ok === true
  steps.push(step("retrieve-artifact", retrieveOk ? "pass" : "blocked", retrieveOk ? "artifact bytes retrieved and matched rendered manifest" : "artifact retrieval did not complete", {
    readStatus: artifactRead?.status ?? "not-run",
    consistencyStatus: consistency?.status ?? "not-run",
  }))

  if (artifactExecution.status !== "rendered" || !manifestRead.ok || !jobRead.ok || !retrieveOk || artifact == null) {
    return blocked([
      ...artifactExecution.issues.map((entry) => issue(entry.severity, entry.code, `artifactExecution.${entry.path}`, entry.message)),
      ...(!manifestRead.ok ? manifestRead.issues.map((entry) => issue("blocking", entry.code, `artifactManifest.read.${entry.path}`, entry.message)) : []),
      ...(!jobRead.ok ? jobRead.issues.map((entry) => issue("blocking", entry.code, `artifactJob.read.${entry.path}`, entry.message)) : []),
      ...(!(artifactRead?.ok === true) ? (artifactRead?.issues ?? []).map((entry) => issue("blocking", entry.code, `artifactBytes.read.${entry.path}`, entry.message)) : []),
      ...(!(consistency?.ok === true) ? (consistency?.issues ?? []).map((entry) => issue("blocking", entry.code, `artifactConsistency.${entry.path}`, entry.message)) : []),
    ], steps, records, artifact)
  }

  const live = resolveVNextLiveLayoutBoundary({
    kind: "authoring-history",
    records: [historyRecord],
    visibleRange: {
      kind: "section-window",
      sectionId: rich.transaction.dirtyScope.sectionId,
      zoneId: rich.transaction.dirtyScope.zoneId,
      startNodeId: scenario.intendedEdit.targetTextBlockId,
      endNodeId: scenario.intendedEdit.targetTextBlockId,
    },
  })
  const diagnostics = assessVNextKeyDataDiagnostics(reloadedPack.document, reloadedPack.fields, reloadedPack.data)
  const storage = storageSummary(records)
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
      artifactId: artifact.artifactId,
      format: "pdf",
      mediaType: "application/pdf",
      byteLength: artifact.byteLength,
      sha256: artifact.sha256,
      digestStatus: artifact.sha256 == null ? "missing" : "present",
      storageStatus: artifact.consistencyStatus,
      spikeGrade: true,
    },
    storage,
    evidence: [
      evidence("canonical-package", "pass", "fixture opened as canonical package v2/document v3", {
        packageId: openSession.package.id,
      }),
      evidence("key-data-diagnostics", diagnostics.status === "ready" ? "pass" : "risk", `key diagnostics status ${diagnostics.status}`),
      evidence("authoring-session", "pass", "active text-block edit saved and reloaded through package session storage"),
      evidence("rich-inline-commit", "pass", `rich inline commit ${rich.transaction.kind} accepted`),
      evidence("exact-generation", "pass", `exact generation ${live.freshness.exactGeneration.status}`),
      evidence("measurement", measurementGate.status === "accepted" ? "pass" : measurementGate.status === "blocked" ? "blocked" : "risk", `measurement gate ${measurementGate.status}`),
      evidence("artifact", "pass", "PDF spike bytes stored, retrieved, and matched rendered manifest", {
        byteLength: artifact.byteLength ?? 0,
      }),
      evidence("artifact-job", jobRead.record.value.status === "rendered" ? "pass" : "risk", `artifact job ${jobRead.record.value.status}`),
      evidence("storage", storage.status === "accepted" ? "pass" : "blocked", `file-backed storage ${storage.status}`, {
        recordCount: records.length,
      }),
    ],
    pass: [
      "Phase 180 internal alpha vertical slice produced",
      "open document -> edit -> save -> reload -> PDF -> artifact store/retrieve -> report completed",
    ],
    risk: [
      "measurement evidence is guarded internal-alpha only",
      "PDF output remains minimal spike-grade evidence",
      "record writes and artifact byte writes are not transactionally linked",
    ],
    intentionallyNotProductionReady: [
      "Phase 180 is internal alpha evidence only",
      "no production contenteditable binding",
      "no backend route execution",
      "no production PDF renderer",
      "no production storage readiness",
    ],
  })
  steps.push(step("status-report", report.failBlocker.length === 0 ? "pass" : "blocked", `RC report ${report.status}`, {
    failBlockerCount: report.failBlocker.length,
    riskCount: report.risk.length,
    unknownCount: report.unknown.length,
  }))

  return {
    source: FLOWDOC_INTERNAL_ALPHA_VERTICAL_SLICE_SOURCE,
    mode: FLOWDOC_INTERNAL_ALPHA_VERTICAL_SLICE_MODE,
    status: report.status,
    report,
    steps,
    records,
    artifact,
    issues: [],
    contracts: contracts(),
  }
}
