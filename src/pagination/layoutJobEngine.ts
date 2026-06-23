import type {
  VNextLayoutPipelineJob,
  VNextLayoutPipelinePlan,
  VNextLayoutPipelineStage,
  VNextLayoutPipelineStatus,
} from "./layoutPipeline.js"

export const VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_SOURCE = "vnext-pausable-layout-job-engine"
export const VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_MODE = "metadata-only-layout-job-cursor"

export type VNextPausableLayoutJobOutput =
  | "measurement-job-recorded"
  | "pagination-job-recorded"

export type VNextPausableLayoutJobEngineIssueCode =
  | "unknown-dependency"
  | "unsatisfied-dependency"

export interface VNextPausableLayoutJobEngineCursor {
  jobOffset: number
  completedSourceItemIds: string[]
}

export interface VNextPausableLayoutJobEngineOptions {
  cursor?: Partial<VNextPausableLayoutJobEngineCursor>
  maxJobs?: number
}

export interface VNextPausableLayoutJobEngineIssue {
  severity: "blocking"
  code: VNextPausableLayoutJobEngineIssueCode
  jobId: string
  sourceItemId: string
  missingSourceItemIds: string[]
  message: string
}

export interface VNextPausableLayoutJobEngineResult {
  jobId: string
  sourceItemId: string
  stage: VNextLayoutPipelineJob["stage"]
  kind: VNextLayoutPipelineJob["kind"]
  order: number
  status: "completed"
  output: VNextPausableLayoutJobOutput
  dependsOnSourceItemIds: string[]
}

export interface VNextPausableLayoutJobEngineChunk {
  source: typeof VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_SOURCE
  mode: typeof VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_MODE
  status: VNextLayoutPipelineStatus | "blocked"
  planDocumentId: string
  pipelineVersion: VNextLayoutPipelinePlan["pipelineVersion"]
  engineContract: {
    consumes: "vnext-layout-pipeline-plan"
    produces: "layout-job-results"
    executesConcreteLayout: false
    mayRelayoutDocument: false
    mutatesDocument: false
    storesCursor: false
  }
  stageSummary: Record<VNextLayoutPipelineStage, number>
  jobOffset: number
  jobCount: number
  totalJobCount: number
  results: VNextPausableLayoutJobEngineResult[]
  blockingIssues: VNextPausableLayoutJobEngineIssue[]
  nextCursor: VNextPausableLayoutJobEngineCursor | null
}

const DEFAULT_MAX_JOBS = 50

function nonNegativeInteger(value: number | undefined, fallback: number): number {
  if (value == null || !Number.isFinite(value)) return fallback
  return Math.max(0, Math.floor(value))
}

function positiveInteger(value: number | undefined, fallback: number): number {
  if (value == null || !Number.isFinite(value)) return fallback
  return Math.max(1, Math.floor(value))
}

function knownCompletedSourceItemIds(
  plan: VNextLayoutPipelinePlan,
  completedSourceItemIds: readonly string[] | undefined,
): string[] {
  if (completedSourceItemIds == null || completedSourceItemIds.length === 0) return []

  const completed = new Set(completedSourceItemIds)
  return plan.jobs
    .map((job) => job.sourceItemId)
    .filter((sourceItemId) => completed.has(sourceItemId))
}

function stageSummary(plan: VNextLayoutPipelinePlan): Record<VNextLayoutPipelineStage, number> {
  const summary = Object.fromEntries(plan.stages.map((stage) => [stage, 0])) as Record<VNextLayoutPipelineStage, number>

  plan.jobs.forEach((job) => {
    summary[job.stage] += 1
  })

  return summary
}

function orderedCompletedSourceItemIds(plan: VNextLayoutPipelinePlan, completed: ReadonlySet<string>): string[] {
  return plan.jobs
    .map((job) => job.sourceItemId)
    .filter((sourceItemId) => completed.has(sourceItemId))
}

function resultForJob(job: VNextLayoutPipelineJob): VNextPausableLayoutJobEngineResult {
  return {
    jobId: job.id,
    sourceItemId: job.sourceItemId,
    stage: job.stage,
    kind: job.kind,
    order: job.order,
    status: "completed",
    output: job.stage === "measure" ? "measurement-job-recorded" : "pagination-job-recorded",
    dependsOnSourceItemIds: [...job.dependsOnSourceItemIds],
  }
}

function issueForJob(
  code: VNextPausableLayoutJobEngineIssueCode,
  job: VNextLayoutPipelineJob,
  missingSourceItemIds: string[],
): VNextPausableLayoutJobEngineIssue {
  return {
    severity: "blocking",
    code,
    jobId: job.id,
    sourceItemId: job.sourceItemId,
    missingSourceItemIds,
    message: code === "unknown-dependency"
      ? `Layout job "${job.id}" depends on source items that are not in the plan.`
      : `Layout job "${job.id}" cannot run until dependency source items are completed.`,
  }
}

export function runVNextPausableLayoutJobEngineChunk(
  plan: VNextLayoutPipelinePlan,
  options: VNextPausableLayoutJobEngineOptions = {},
): VNextPausableLayoutJobEngineChunk {
  const maxJobs = positiveInteger(options.maxJobs, DEFAULT_MAX_JOBS)
  const totalJobCount = plan.jobs.length
  const jobOffset = Math.min(nonNegativeInteger(options.cursor?.jobOffset, 0), totalJobCount)
  const completed = new Set(knownCompletedSourceItemIds(plan, options.cursor?.completedSourceItemIds))
  const sourceItemIds = new Set(plan.jobs.map((job) => job.sourceItemId))
  const results: VNextPausableLayoutJobEngineResult[] = []
  const blockingIssues: VNextPausableLayoutJobEngineIssue[] = []
  let currentOffset = jobOffset

  while (currentOffset < totalJobCount && results.length < maxJobs) {
    const job = plan.jobs[currentOffset]
    const unknownDependencies = job.dependsOnSourceItemIds.filter((sourceItemId) => !sourceItemIds.has(sourceItemId))
    if (unknownDependencies.length > 0) {
      blockingIssues.push(issueForJob("unknown-dependency", job, unknownDependencies))
      break
    }

    const unsatisfiedDependencies = job.dependsOnSourceItemIds.filter((sourceItemId) => !completed.has(sourceItemId))
    if (unsatisfiedDependencies.length > 0) {
      blockingIssues.push(issueForJob("unsatisfied-dependency", job, unsatisfiedDependencies))
      break
    }

    results.push(resultForJob(job))
    completed.add(job.sourceItemId)
    currentOffset += 1
  }

  const status: VNextLayoutPipelineStatus | "blocked" = blockingIssues.length > 0
    ? "blocked"
    : currentOffset >= totalJobCount
      ? "complete"
      : "partial"
  const completedSourceItemIds = orderedCompletedSourceItemIds(plan, completed)

  return {
    source: VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_SOURCE,
    mode: VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_MODE,
    status,
    planDocumentId: plan.documentId,
    pipelineVersion: plan.pipelineVersion,
    engineContract: {
      consumes: "vnext-layout-pipeline-plan",
      produces: "layout-job-results",
      executesConcreteLayout: false,
      mayRelayoutDocument: false,
      mutatesDocument: false,
      storesCursor: false,
    },
    stageSummary: stageSummary(plan),
    jobOffset,
    jobCount: results.length,
    totalJobCount,
    results,
    blockingIssues,
    nextCursor: status === "complete"
      ? null
      : {
          jobOffset: currentOffset,
          completedSourceItemIds,
        },
  }
}
