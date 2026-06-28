import {
  createFlowDocFileJsonArtifactByteStore,
  createFlowDocFileJsonStorageAdapter,
  type FlowDocFileJsonArtifactByteConsistencyResult,
  type FlowDocFileJsonArtifactByteReadResult,
  type FlowDocFileJsonArtifactByteWriteResult,
  type FlowDocFileJsonStorageAdapter,
} from "@flowdoc/storage-file-json"
import {
  renderFlowDocMinimalPdfArtifact,
  type FlowDocPdfRendererSpikeResult,
} from "@flowdoc/pdf-renderer-spike"
import {
  advanceVNextArtifactJob,
  createVNextArtifactJobPlan,
  createVNextArtifactManifestPlan,
  type VNextArtifactJobCreateInput,
  type VNextArtifactJobRecord,
  type VNextArtifactManifestRecord,
  type VNextPdfRendererAdapterPlan,
  type VNextStorageOperationIssue,
  type VNextStorageRecordKind,
} from "@flowdoc/vnext-core"

export const FLOWDOC_ARTIFACT_JOB_EXECUTION_SOURCE = "flowdoc-artifact-job-execution-slice"
export const FLOWDOC_ARTIFACT_JOB_EXECUTION_MODE = "internal-alpha-artifact-job-to-pdf-byte-store"

export type FlowDocArtifactJobExecutionStatus = "rendered" | "failed" | "blocked"

export interface FlowDocArtifactJobExecutionInput {
  rootDirectory: string
  jobInput: VNextArtifactJobCreateInput
  pdfPlan: VNextPdfRendererAdapterPlan
  spikeId: string
  now: string
  bindProductionRenderer?: boolean
  layoutCompletedSourceItemIds?: readonly string[]
}

export interface FlowDocArtifactJobExecutionIssue {
  severity: "blocking" | "warning"
  code: string
  path: string
  message: string
}

export interface FlowDocArtifactJobExecutionRecordFact {
  kind: VNextStorageRecordKind
  key: string
  writeStatus: string
  readStatus: string
  revision: number | null
  artifactStatus: VNextArtifactManifestRecord["status"] | null
  jobStatus: VNextArtifactJobRecord["status"] | null
}

export interface FlowDocArtifactJobExecutionByteFact {
  artifactId: string
  byteLength: number | null
  sha256: string | null
  storageKey: string | null
  writeStatus: string
  readStatus: string
  consistencyStatus: string
}

export interface FlowDocArtifactJobExecutionResult {
  source: typeof FLOWDOC_ARTIFACT_JOB_EXECUTION_SOURCE
  mode: typeof FLOWDOC_ARTIFACT_JOB_EXECUTION_MODE
  status: FlowDocArtifactJobExecutionStatus
  job: {
    jobId: string
    status: VNextArtifactJobRecord["status"]
    revision: number | null
  } | null
  artifact: {
    artifactId: string
    status: VNextArtifactManifestRecord["status"]
    byteLength: number | null
    sha256: string | null
    storageKey: string | null
    revision: number | null
  } | null
  pdfSpike: {
    spikeId: string
    status: FlowDocPdfRendererSpikeResult["status"]
    artifactId: string | null
    byteLength: number
    sha256: string | null
    productionFidelity: false
    storageWrites: false
  } | null
  bytes: FlowDocArtifactJobExecutionByteFact | null
  records: readonly FlowDocArtifactJobExecutionRecordFact[]
  pass: readonly string[]
  failBlocker: readonly string[]
  risk: readonly string[]
  unknown: readonly string[]
  issues: readonly FlowDocArtifactJobExecutionIssue[]
  contracts: {
    externalPackage: true
    jsonSafe: true
    usesConcreteFileJsonStorage: true
    recordStorageWrites: true
    artifactByteWrites: true
    pdfSpikeExecution: true
    workerOrQueue: false
    backendRoute: false
    authzExecution: false
    productionRendererReady: false
    productionStorageReady: false
    packageSchemaChange: false
    documentSchemaChange: false
    docxRenderer: false
    browserInputReady: false
    multiRecordTransactions: false
  }
}

interface RecordWriteRoundtrip<TRecord> {
  fact: FlowDocArtifactJobExecutionRecordFact
  value: TRecord | null
  revision: number | null
  ok: boolean
  issues: FlowDocArtifactJobExecutionIssue[]
}

function contracts(): FlowDocArtifactJobExecutionResult["contracts"] {
  return {
    externalPackage: true,
    jsonSafe: true,
    usesConcreteFileJsonStorage: true,
    recordStorageWrites: true,
    artifactByteWrites: true,
    pdfSpikeExecution: true,
    workerOrQueue: false,
    backendRoute: false,
    authzExecution: false,
    productionRendererReady: false,
    productionStorageReady: false,
    packageSchemaChange: false,
    documentSchemaChange: false,
    docxRenderer: false,
    browserInputReady: false,
    multiRecordTransactions: false,
  }
}

function issue(
  severity: FlowDocArtifactJobExecutionIssue["severity"],
  code: string,
  path: string,
  message: string,
): FlowDocArtifactJobExecutionIssue {
  return { severity, code, path, message }
}

function bounded(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, Math.max(0, maxLength - 3))}...`
}

function storageIssues(
  prefix: string,
  entries: readonly VNextStorageOperationIssue[],
): FlowDocArtifactJobExecutionIssue[] {
  return entries.map((entry) => issue("blocking", entry.code, `${prefix}.${entry.path}`, entry.message))
}

function artifactIssues(
  prefix: string,
  entries: readonly { code: string; path: string; message: string }[],
): FlowDocArtifactJobExecutionIssue[] {
  return entries.map((entry) => issue("blocking", entry.code, `${prefix}.${entry.path}`, entry.message))
}

function blocked(
  issues: readonly FlowDocArtifactJobExecutionIssue[],
  records: readonly FlowDocArtifactJobExecutionRecordFact[] = [],
  bytes: FlowDocArtifactJobExecutionByteFact | null = null,
  pdfSpike: FlowDocArtifactJobExecutionResult["pdfSpike"] = null,
): FlowDocArtifactJobExecutionResult {
  return {
    source: FLOWDOC_ARTIFACT_JOB_EXECUTION_SOURCE,
    mode: FLOWDOC_ARTIFACT_JOB_EXECUTION_MODE,
    status: "blocked",
    job: null,
    artifact: null,
    pdfSpike,
    bytes,
    records,
    pass: [],
    failBlocker: issues.map((entry) => `${entry.code}: ${entry.message}`),
    risk: [
      "record writes and artifact byte writes are not transactionally linked",
      "the executor is an internal-alpha slice, not a production worker",
    ],
    unknown: [
      "production PDF renderer selection remains open",
      "retry scheduling and queue ownership remain unimplemented",
    ],
    issues,
    contracts: contracts(),
  }
}

function resultForTerminalJob(input: {
  status: "rendered" | "failed"
  job: VNextArtifactJobRecord
  artifactManifest: VNextArtifactManifestRecord
  jobRevision: number | null
  artifactRevision: number | null
  records: readonly FlowDocArtifactJobExecutionRecordFact[]
  bytes: FlowDocArtifactJobExecutionByteFact | null
  pdfSpike: FlowDocArtifactJobExecutionResult["pdfSpike"]
  issues: readonly FlowDocArtifactJobExecutionIssue[]
}): FlowDocArtifactJobExecutionResult {
  return {
    source: FLOWDOC_ARTIFACT_JOB_EXECUTION_SOURCE,
    mode: FLOWDOC_ARTIFACT_JOB_EXECUTION_MODE,
    status: input.status,
    job: {
      jobId: input.job.jobId,
      status: input.job.status,
      revision: input.jobRevision,
    },
    artifact: {
      artifactId: input.artifactManifest.artifactId,
      status: input.artifactManifest.status,
      byteLength: input.artifactManifest.byteLength,
      sha256: input.artifactManifest.sha256,
      storageKey: input.artifactManifest.storageKey,
      revision: input.artifactRevision,
    },
    pdfSpike: input.pdfSpike,
    bytes: input.bytes,
    records: input.records,
    pass: input.status === "rendered"
      ? [
        "queued artifact job and planned manifest persisted",
        "minimal PDF spike produced bytes",
        "artifact bytes wrote and read back from filesystem store",
        "rendered manifest matched stored bytes",
        "final artifact job status persisted as rendered",
      ]
      : [
        "queued artifact job and planned manifest persisted",
        "PDF spike failure was captured as a bounded failed job",
        "failed manifest and failed job records were persisted",
      ],
    failBlocker: input.status === "failed"
      ? input.issues.map((entry) => `${entry.code}: ${entry.message}`)
      : [],
    risk: [
      "record writes and artifact byte writes are not transactionally linked",
      "PDF output is minimal text-only spike evidence, not production fidelity",
    ],
    unknown: [
      "production PDF renderer package choice remains open",
      "queue worker, retry scheduling, and backend route execution remain open",
    ],
    issues: input.issues,
    contracts: contracts(),
  }
}

function recordFact<TRecord>(
  kind: "artifact-manifest" | "artifact-job",
  key: string,
  writeStatus: string,
  readStatus: string,
  revision: number | null,
  value: TRecord | null,
): FlowDocArtifactJobExecutionRecordFact {
  const artifact = kind === "artifact-manifest" ? value as VNextArtifactManifestRecord | null : null
  const job = kind === "artifact-job" ? value as VNextArtifactJobRecord | null : null

  return {
    kind,
    key,
    writeStatus,
    readStatus,
    revision,
    artifactStatus: artifact?.status ?? null,
    jobStatus: job?.status ?? null,
  }
}

async function writeManifestRecord(input: {
  adapter: FlowDocFileJsonStorageAdapter
  key: string
  value: VNextArtifactManifestRecord
  expectedRevision: number | null
  idempotencyKey: string
  now: string
}): Promise<RecordWriteRoundtrip<VNextArtifactManifestRecord>> {
  const writeResult = await input.adapter.artifactManifests.write({
    kind: "artifact-manifest",
    key: input.key,
    value: input.value,
    expectedRevision: input.expectedRevision,
    idempotencyKey: input.idempotencyKey,
    now: input.now,
  })
  const readResult = await input.adapter.artifactManifests.read({
    kind: "artifact-manifest",
    key: input.key,
  })
  const value = readResult.ok ? readResult.record.value : writeResult.ok ? writeResult.record.value : null
  const revision = readResult.ok ? readResult.record.revision : writeResult.ok ? writeResult.record.revision : null
  const issues = [
    ...(!writeResult.ok ? storageIssues("artifactManifest.write", writeResult.issues) : []),
    ...(!readResult.ok ? storageIssues("artifactManifest.read", readResult.issues) : []),
  ]

  return {
    fact: recordFact("artifact-manifest", input.key, writeResult.status, readResult.status, revision, value),
    value,
    revision,
    ok: writeResult.ok && readResult.ok,
    issues,
  }
}

async function writeJobRecord(input: {
  adapter: FlowDocFileJsonStorageAdapter
  key: string
  value: VNextArtifactJobRecord
  expectedRevision: number | null
  idempotencyKey: string
  now: string
}): Promise<RecordWriteRoundtrip<VNextArtifactJobRecord>> {
  const writeResult = await input.adapter.artifactJobs.write({
    kind: "artifact-job",
    key: input.key,
    value: input.value,
    expectedRevision: input.expectedRevision,
    idempotencyKey: input.idempotencyKey,
    now: input.now,
  })
  const readResult = await input.adapter.artifactJobs.read({
    kind: "artifact-job",
    key: input.key,
  })
  const value = readResult.ok ? readResult.record.value : writeResult.ok ? writeResult.record.value : null
  const revision = readResult.ok ? readResult.record.revision : writeResult.ok ? writeResult.record.revision : null
  const issues = [
    ...(!writeResult.ok ? storageIssues("artifactJob.write", writeResult.issues) : []),
    ...(!readResult.ok ? storageIssues("artifactJob.read", readResult.issues) : []),
  ]

  return {
    fact: recordFact("artifact-job", input.key, writeResult.status, readResult.status, revision, value),
    value,
    revision,
    ok: writeResult.ok && readResult.ok,
    issues,
  }
}

function byteFact(
  writeResult: FlowDocFileJsonArtifactByteWriteResult | null,
  readResult: FlowDocFileJsonArtifactByteReadResult | null,
  consistencyResult: FlowDocFileJsonArtifactByteConsistencyResult | null,
): FlowDocArtifactJobExecutionByteFact | null {
  const artifact = writeResult?.artifact ?? readResult?.artifact ?? consistencyResult?.artifact ?? null
  if (artifact == null && writeResult == null && readResult == null && consistencyResult == null) return null

  return {
    artifactId: artifact?.artifactId ?? "",
    byteLength: artifact?.byteLength ?? null,
    sha256: artifact?.sha256 ?? null,
    storageKey: artifact?.storageKey ?? null,
    writeStatus: writeResult?.status ?? "not-run",
    readStatus: readResult?.status ?? "not-run",
    consistencyStatus: consistencyResult?.status ?? "not-run",
  }
}

function pdfSpikeFact(result: FlowDocPdfRendererSpikeResult): FlowDocArtifactJobExecutionResult["pdfSpike"] {
  return {
    spikeId: result.spikeId,
    status: result.status,
    artifactId: result.artifact?.artifactId ?? null,
    byteLength: result.summary.byteLength,
    sha256: result.artifact?.sha256 ?? null,
    productionFidelity: false,
    storageWrites: false,
  }
}

function renderedManifestForJob(input: {
  job: VNextArtifactJobRecord
  byteWrite: Extract<FlowDocFileJsonArtifactByteWriteResult, { ok: true }>
  createdAt: string
}): VNextArtifactManifestRecord | FlowDocArtifactJobExecutionIssue[] {
  const plan = createVNextArtifactManifestPlan({
    artifactId: input.job.artifact.artifactId,
    sourcePackageId: input.job.input.sourcePackageId,
    sessionId: input.job.input.sessionId,
    jobId: input.job.jobId,
    rendererProfileId: input.job.profiles.rendererProfileId,
    measurementProfileId: input.job.profiles.measurementProfileId,
    format: input.job.artifact.format,
    mediaType: input.job.artifact.mediaType,
    byteLength: input.byteWrite.artifact.byteLength,
    sha256: input.byteWrite.artifact.sha256,
    storageKey: input.byteWrite.artifact.storageKey,
    createdAt: input.createdAt,
    status: "rendered",
    error: null,
  })

  if (plan.record != null) return plan.record
  return artifactIssues("artifactManifest.rendered", plan.issues)
}

function advanceJob(
  job: VNextArtifactJobRecord,
  command: Parameters<typeof advanceVNextArtifactJob>[1],
): VNextArtifactJobRecord | FlowDocArtifactJobExecutionIssue[] {
  const plan = advanceVNextArtifactJob(job, command)
  if (plan.status === "advanced") return plan.job
  return artifactIssues(`artifactJob.${command.action}`, plan.issues)
}

async function persistFailedJob(input: {
  adapter: FlowDocFileJsonStorageAdapter
  records: FlowDocArtifactJobExecutionRecordFact[]
  job: VNextArtifactJobRecord
  artifactKey: string
  jobKey: string
  manifestRevision: number | null
  jobRevision: number | null
  now: string
  error: {
    code: string
    message: string
    retryable: boolean
  }
  bytes: FlowDocArtifactJobExecutionByteFact | null
  pdfSpike: FlowDocArtifactJobExecutionResult["pdfSpike"]
}): Promise<FlowDocArtifactJobExecutionResult> {
  const failedJob = advanceJob(input.job, {
    action: "fail",
    updatedAt: input.now,
    error: {
      code: bounded(input.error.code, 80),
      message: bounded(input.error.message, 240),
      retryable: input.error.retryable,
    },
  })

  if (Array.isArray(failedJob) || failedJob.artifactManifest == null) {
    return blocked(Array.isArray(failedJob) ? failedJob : [
      issue("blocking", "missing-failed-manifest", "artifactJob.artifactManifest", "failed job did not produce a failed manifest"),
    ], input.records, input.bytes, input.pdfSpike)
  }

  const failedManifestWrite = await writeManifestRecord({
    adapter: input.adapter,
    key: input.artifactKey,
    value: failedJob.artifactManifest,
    expectedRevision: input.manifestRevision,
    idempotencyKey: "artifact-job-execution:manifest:failed",
    now: input.now,
  })
  input.records.push(failedManifestWrite.fact)
  if (!failedManifestWrite.ok) return blocked(failedManifestWrite.issues, input.records, input.bytes, input.pdfSpike)

  const failedJobWrite = await writeJobRecord({
    adapter: input.adapter,
    key: input.jobKey,
    value: failedJob,
    expectedRevision: input.jobRevision,
    idempotencyKey: "artifact-job-execution:job:failed",
    now: input.now,
  })
  input.records.push(failedJobWrite.fact)
  if (!failedJobWrite.ok) return blocked(failedJobWrite.issues, input.records, input.bytes, input.pdfSpike)

  return resultForTerminalJob({
    status: "failed",
    job: failedJob,
    artifactManifest: failedJob.artifactManifest,
    jobRevision: failedJobWrite.revision,
    artifactRevision: failedManifestWrite.revision,
    records: input.records,
    bytes: input.bytes,
    pdfSpike: input.pdfSpike,
    issues: [
      issue("blocking", input.error.code, "artifactJob.execution", input.error.message),
    ],
  })
}

export async function runFlowDocArtifactJobExecutionSlice(
  input: FlowDocArtifactJobExecutionInput,
): Promise<FlowDocArtifactJobExecutionResult> {
  const adapter = createFlowDocFileJsonStorageAdapter({ rootDirectory: input.rootDirectory })
  const byteStore = createFlowDocFileJsonArtifactByteStore({ rootDirectory: input.rootDirectory })
  const records: FlowDocArtifactJobExecutionRecordFact[] = []
  const jobPlan = createVNextArtifactJobPlan(input.jobInput)

  if (jobPlan.job == null || jobPlan.status !== "ready") {
    return blocked(artifactIssues("artifactJob.create", jobPlan.issues), records)
  }

  const jobKey = jobPlan.job.jobId
  const artifactKey = jobPlan.job.artifact.artifactId
  if (jobPlan.job.artifactManifest == null) {
    return blocked([
      issue("blocking", "missing-planned-manifest", "artifactJob.artifactManifest", "artifact job plan did not create a planned manifest"),
    ], records)
  }

  const plannedManifestWrite = await writeManifestRecord({
    adapter,
    key: artifactKey,
    value: jobPlan.job.artifactManifest,
    expectedRevision: null,
    idempotencyKey: "artifact-job-execution:manifest:planned",
    now: input.now,
  })
  records.push(plannedManifestWrite.fact)
  if (!plannedManifestWrite.ok) return blocked(plannedManifestWrite.issues, records)

  const queuedJobWrite = await writeJobRecord({
    adapter,
    key: jobKey,
    value: jobPlan.job,
    expectedRevision: null,
    idempotencyKey: "artifact-job-execution:job:queued",
    now: input.now,
  })
  records.push(queuedJobWrite.fact)
  if (!queuedJobWrite.ok) return blocked(queuedJobWrite.issues, records)

  const layoutRunning = advanceJob(jobPlan.job, { action: "start-layout", updatedAt: input.now })
  if (Array.isArray(layoutRunning)) return blocked(layoutRunning, records)

  const layoutComplete = advanceJob(layoutRunning, {
    action: "complete-layout",
    updatedAt: input.now,
    cursor: {
      layoutJobOffset: 1,
      completedSourceItemIds: input.layoutCompletedSourceItemIds == null
        ? ["artifact-job-execution-slice"]
        : [...input.layoutCompletedSourceItemIds],
    },
    completedStepCount: 1,
    totalStepCount: 1,
  })
  if (Array.isArray(layoutComplete)) return blocked(layoutComplete, records)

  const renderingJob = advanceJob(layoutComplete, { action: "start-rendering", updatedAt: input.now })
  if (Array.isArray(renderingJob) || renderingJob.artifactManifest == null) {
    return blocked(Array.isArray(renderingJob) ? renderingJob : [
      issue("blocking", "missing-rendering-manifest", "artifactJob.artifactManifest", "rendering job did not produce a rendering manifest"),
    ], records)
  }

  const renderingManifestWrite = await writeManifestRecord({
    adapter,
    key: artifactKey,
    value: renderingJob.artifactManifest,
    expectedRevision: plannedManifestWrite.revision,
    idempotencyKey: "artifact-job-execution:manifest:rendering",
    now: input.now,
  })
  records.push(renderingManifestWrite.fact)
  if (!renderingManifestWrite.ok) return blocked(renderingManifestWrite.issues, records)

  const pdfSpike = renderFlowDocMinimalPdfArtifact({
    spikeId: input.spikeId,
    rendererProfileId: renderingJob.profiles.rendererProfileId,
    measurementProfileId: renderingJob.profiles.measurementProfileId,
    plan: input.pdfPlan,
    bindProductionRenderer: input.bindProductionRenderer,
  })
  const pdfFact = pdfSpikeFact(pdfSpike)

  if (pdfSpike.status !== "rendered" || pdfSpike.bytes == null || pdfSpike.artifact == null) {
    const firstIssue = pdfSpike.blockingIssues[0]
    return persistFailedJob({
      adapter,
      records,
      job: renderingJob,
      artifactKey,
      jobKey,
      manifestRevision: renderingManifestWrite.revision,
      jobRevision: queuedJobWrite.revision,
      now: input.now,
      error: {
        code: firstIssue?.code ?? "pdf-spike-blocked",
        message: firstIssue?.message ?? "PDF spike did not render bytes.",
        retryable: false,
      },
      bytes: null,
      pdfSpike: pdfFact,
    })
  }

  const byteWrite = await byteStore.write({
    artifactId: renderingJob.artifact.artifactId,
    mediaType: renderingJob.artifact.mediaType,
    bytes: pdfSpike.bytes,
    expectedSha256: pdfSpike.artifact.sha256,
  })

  if (!byteWrite.ok) {
    return persistFailedJob({
      adapter,
      records,
      job: renderingJob,
      artifactKey,
      jobKey,
      manifestRevision: renderingManifestWrite.revision,
      jobRevision: queuedJobWrite.revision,
      now: input.now,
      error: {
        code: byteWrite.issues[0]?.code ?? "artifact-byte-write-blocked",
        message: byteWrite.issues[0]?.message ?? "artifact byte write did not complete",
        retryable: true,
      },
      bytes: byteFact(byteWrite, null, null),
      pdfSpike: pdfFact,
    })
  }

  const byteRead = await byteStore.read({ storageKey: byteWrite.artifact.storageKey })

  if (!byteRead.ok) {
    return persistFailedJob({
      adapter,
      records,
      job: renderingJob,
      artifactKey,
      jobKey,
      manifestRevision: renderingManifestWrite.revision,
      jobRevision: queuedJobWrite.revision,
      now: input.now,
      error: {
        code: byteRead.issues[0]?.code ?? "artifact-byte-read-blocked",
        message: byteRead.issues[0]?.message ?? "artifact byte readback did not complete",
        retryable: true,
      },
      bytes: byteFact(byteWrite, byteRead, null),
      pdfSpike: pdfFact,
    })
  }

  const renderedManifest = renderedManifestForJob({
    job: renderingJob,
    byteWrite,
    createdAt: input.now,
  })

  if (Array.isArray(renderedManifest)) {
    return persistFailedJob({
      adapter,
      records,
      job: renderingJob,
      artifactKey,
      jobKey,
      manifestRevision: renderingManifestWrite.revision,
      jobRevision: queuedJobWrite.revision,
      now: input.now,
      error: {
        code: renderedManifest[0]?.code ?? "rendered-manifest-blocked",
        message: renderedManifest[0]?.message ?? "rendered artifact manifest did not validate",
        retryable: false,
      },
      bytes: byteFact(byteWrite, byteRead, null),
      pdfSpike: pdfFact,
    })
  }

  const consistency = await byteStore.verifyManifestConsistency(renderedManifest)

  if (!consistency.ok) {
    return persistFailedJob({
      adapter,
      records,
      job: renderingJob,
      artifactKey,
      jobKey,
      manifestRevision: renderingManifestWrite.revision,
      jobRevision: queuedJobWrite.revision,
      now: input.now,
      error: {
        code: consistency.issues[0]?.code ?? "artifact-byte-consistency-blocked",
        message: consistency.issues[0]?.message ?? "rendered artifact manifest did not match stored bytes",
        retryable: true,
      },
      bytes: byteFact(byteWrite, byteRead, consistency),
      pdfSpike: pdfFact,
    })
  }

  const renderedJob = advanceJob(renderingJob, {
    action: "complete-render",
    updatedAt: input.now,
    artifactManifest: renderedManifest,
  })
  if (Array.isArray(renderedJob)) return blocked(renderedJob, records, byteFact(byteWrite, byteRead, consistency), pdfFact)

  const renderedManifestWrite = await writeManifestRecord({
    adapter,
    key: artifactKey,
    value: renderedManifest,
    expectedRevision: renderingManifestWrite.revision,
    idempotencyKey: "artifact-job-execution:manifest:rendered",
    now: input.now,
  })
  records.push(renderedManifestWrite.fact)
  if (!renderedManifestWrite.ok) return blocked(renderedManifestWrite.issues, records, byteFact(byteWrite, byteRead, consistency), pdfFact)

  const renderedJobWrite = await writeJobRecord({
    adapter,
    key: jobKey,
    value: renderedJob,
    expectedRevision: queuedJobWrite.revision,
    idempotencyKey: "artifact-job-execution:job:rendered",
    now: input.now,
  })
  records.push(renderedJobWrite.fact)
  if (!renderedJobWrite.ok) return blocked(renderedJobWrite.issues, records, byteFact(byteWrite, byteRead, consistency), pdfFact)

  return resultForTerminalJob({
    status: "rendered",
    job: renderedJob,
    artifactManifest: renderedManifest,
    jobRevision: renderedJobWrite.revision,
    artifactRevision: renderedManifestWrite.revision,
    records,
    bytes: byteFact(byteWrite, byteRead, consistency),
    pdfSpike: pdfFact,
    issues: [],
  })
}
