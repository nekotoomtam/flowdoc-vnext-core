import type { AuthoredNode, DocumentNode } from "../schema/document.js"
import type { NodeId, SectionId } from "../graph/relationshipGraph.js"
import {
  buildVNextPaginationPlan,
  type VNextPaginationPlan,
  type VNextPaginationSourceItem,
  type VNextPaginationSplitPolicy,
} from "./paginationPlan.js"
import {
  paginateVNextDocument,
  type VNextMeasuredPage,
  type VNextMeasuredPagination,
  type VNextMeasuredPaginationOptions,
  type VNextMeasuredPaginationWarning,
} from "./measuredPagination.js"
import {
  buildVNextMeasuredRendererConsumption,
  type VNextMeasuredRenderCommand,
  type VNextMeasuredRendererConsumption,
} from "./rendererConsumption.js"
import {
  assessVNextMeasuredPaginationExportReadiness,
  type VNextExportReadinessIssue,
  type VNextExportReadinessStatus,
  type VNextMeasuredPaginationExportReadiness,
} from "./exportReadiness.js"

export const VNEXT_LAYOUT_PIPELINE_VERSION = 1 as const

export type VNextLayoutPipelineStage =
  | "plan"
  | "measure"
  | "paginate"
  | "fragment-artifact"
  | "renderer-artifact"
  | "export-readiness"

export type VNextLayoutPipelineJobKind =
  | "container-layout"
  | "text-measurement"
  | "generated-measurement"
  | "table-layout"
  | "table-row-layout"
  | "table-cell-layout"
  | "forced-break"
  | "atomic-layout"

export type VNextLayoutPipelineStatus = "partial" | "complete"

export interface VNextLayoutPipelineJob {
  id: string
  stage: "measure" | "paginate"
  kind: VNextLayoutPipelineJobKind
  sourceItemId: string
  sectionId: SectionId
  zoneId: NodeId
  nodeId: NodeId
  nodeType: AuthoredNode["type"]
  parentNodeId: NodeId | null
  splitPolicy: VNextPaginationSplitPolicy
  order: number
  depth: number
  dependsOnSourceItemIds: string[]
  reason: string
}

export interface VNextLayoutMeasurementJob extends VNextLayoutPipelineJob {
  stage: "measure"
  kind: "text-measurement" | "generated-measurement"
}

export interface VNextLayoutPipelinePlan {
  documentId: string
  source: "vnext-pagination-plan"
  status: "planned"
  pipelineVersion: typeof VNEXT_LAYOUT_PIPELINE_VERSION
  stages: VNextLayoutPipelineStage[]
  paginationPlan: VNextPaginationPlan
  jobs: VNextLayoutPipelineJob[]
  measurementJobs: VNextLayoutMeasurementJob[]
  totalJobCount: number
  totalMeasurementJobCount: number
}

export interface VNextLayoutPipelineCursor {
  measurementJobOffset: number
  artifactPageOffset: number
}

export interface VNextLayoutPipelineChunkOptions extends VNextMeasuredPaginationOptions {
  cursor?: Partial<VNextLayoutPipelineCursor>
  maxMeasurementJobs?: number
  maxArtifactPages?: number
}

export interface VNextLayoutMeasurementJobResult {
  jobId: string
  sourceItemId: string
  sectionId: SectionId
  nodeId: NodeId
  status: "scheduled"
  reason: string
}

export interface VNextLayoutMeasurementChunk {
  source: "vnext-layout-pipeline"
  stage: "measure"
  status: VNextLayoutPipelineStatus
  offset: number
  jobCount: number
  totalJobCount: number
  jobs: VNextLayoutMeasurementJob[]
  results: VNextLayoutMeasurementJobResult[]
}

export interface VNextLayoutArtifactChunk {
  artifactVersion: typeof VNEXT_LAYOUT_PIPELINE_VERSION
  source: "vnext-layout-pipeline"
  stage: "fragment-artifact"
  status: VNextLayoutPipelineStatus
  pageOffset: number
  pageCount: number
  totalPageCount: number
  pages: VNextMeasuredPage[]
  warnings: VNextMeasuredPaginationWarning[]
  renderCommands: VNextMeasuredRenderCommand[]
  rendererContract: VNextMeasuredRendererConsumption["rendererContract"]
  exportReadiness: {
    status: VNextExportReadinessStatus
    blockingIssueCount: number
    warningIssueCount: number
  }
  blockingIssues: VNextExportReadinessIssue[]
  warningIssues: VNextExportReadinessIssue[]
}

export interface VNextLayoutPipelineRun {
  documentId: string
  source: "vnext-layout-pipeline"
  status: "complete"
  pipelineVersion: typeof VNEXT_LAYOUT_PIPELINE_VERSION
  plan: VNextLayoutPipelinePlan
  pagination: VNextMeasuredPagination
  rendererConsumption: VNextMeasuredRendererConsumption
  exportReadiness: VNextMeasuredPaginationExportReadiness
}

export interface VNextLayoutPipelineChunk {
  documentId: string
  source: "vnext-layout-pipeline"
  status: VNextLayoutPipelineStatus
  pipelineVersion: typeof VNEXT_LAYOUT_PIPELINE_VERSION
  plan: VNextLayoutPipelinePlan
  measurement: VNextLayoutMeasurementChunk
  artifact?: VNextLayoutArtifactChunk
  nextCursor: VNextLayoutPipelineCursor | null
}

const PIPELINE_STAGES: VNextLayoutPipelineStage[] = [
  "plan",
  "measure",
  "paginate",
  "fragment-artifact",
  "renderer-artifact",
  "export-readiness",
]

const DEFAULT_MAX_MEASUREMENT_JOBS = 50
const DEFAULT_MAX_ARTIFACT_PAGES = 10

function nonNegativeInteger(value: number | undefined, fallback: number): number {
  if (value == null || !Number.isFinite(value)) return fallback
  return Math.max(0, Math.floor(value))
}

function positiveInteger(value: number | undefined, fallback: number): number {
  if (value == null || !Number.isFinite(value)) return fallback
  return Math.max(1, Math.floor(value))
}

function normalizeCursor(cursor: Partial<VNextLayoutPipelineCursor> | undefined): VNextLayoutPipelineCursor {
  return {
    measurementJobOffset: nonNegativeInteger(cursor?.measurementJobOffset, 0),
    artifactPageOffset: nonNegativeInteger(cursor?.artifactPageOffset, 0),
  }
}

function jobKindForSourceItem(sourceItem: VNextPaginationSourceItem): VNextLayoutPipelineJobKind {
  if (sourceItem.splitPolicy === "line") return "text-measurement"
  if (sourceItem.splitPolicy === "generated") return "generated-measurement"
  if (sourceItem.splitPolicy === "table") return "table-layout"
  if (sourceItem.splitPolicy === "table-row") return "table-row-layout"
  if (sourceItem.splitPolicy === "table-cell") return "table-cell-layout"
  if (sourceItem.splitPolicy === "forced-break") return "forced-break"
  if (sourceItem.splitPolicy === "container" || sourceItem.splitPolicy === "columns") return "container-layout"
  return "atomic-layout"
}

function jobStageForKind(kind: VNextLayoutPipelineJobKind): "measure" | "paginate" {
  return kind === "text-measurement" || kind === "generated-measurement" ? "measure" : "paginate"
}

function jobReasonForKind(kind: VNextLayoutPipelineJobKind): string {
  if (kind === "text-measurement") return "text wrap and line-box measurement"
  if (kind === "generated-measurement") return "generated content measurement"
  if (kind === "table-layout") return "table segment layout"
  if (kind === "table-row-layout") return "table row pagination"
  if (kind === "table-cell-layout") return "table cell geometry"
  if (kind === "forced-break") return "explicit page break"
  if (kind === "container-layout") return "container geometry"
  return "atomic block placement"
}

function dependsOnSourceItemIds(sourceItem: VNextPaginationSourceItem): string[] {
  return sourceItem.parentNodeId == null
    ? []
    : [`${sourceItem.sectionId}:${sourceItem.parentNodeId}`]
}

function jobFromSourceItem(sourceItem: VNextPaginationSourceItem): VNextLayoutPipelineJob {
  const kind = jobKindForSourceItem(sourceItem)

  return {
    id: `layout-job:${sourceItem.id}`,
    stage: jobStageForKind(kind),
    kind,
    sourceItemId: sourceItem.id,
    sectionId: sourceItem.sectionId,
    zoneId: sourceItem.zoneId,
    nodeId: sourceItem.nodeId,
    nodeType: sourceItem.nodeType,
    parentNodeId: sourceItem.parentNodeId,
    splitPolicy: sourceItem.splitPolicy,
    order: sourceItem.order,
    depth: sourceItem.depth,
    dependsOnSourceItemIds: dependsOnSourceItemIds(sourceItem),
    reason: jobReasonForKind(kind),
  }
}

function isMeasurementJob(job: VNextLayoutPipelineJob): job is VNextLayoutMeasurementJob {
  return job.stage === "measure"
}

function measurementResultForJob(job: VNextLayoutMeasurementJob): VNextLayoutMeasurementJobResult {
  return {
    jobId: job.id,
    sourceItemId: job.sourceItemId,
    sectionId: job.sectionId,
    nodeId: job.nodeId,
    status: "scheduled",
    reason: job.reason,
  }
}

function issueBelongsToPageRange(
  issue: VNextExportReadinessIssue,
  pageOffset: number,
  pageEnd: number,
): boolean {
  if (issue.pageIndex == null) return pageOffset === 0
  return issue.pageIndex >= pageOffset && issue.pageIndex < pageEnd
}

function warningBelongsToPageRange(
  warning: VNextMeasuredPaginationWarning,
  pageOffset: number,
  pageEnd: number,
): boolean {
  if (warning.pageIndex == null) return pageOffset === 0
  return warning.pageIndex >= pageOffset && warning.pageIndex < pageEnd
}

function buildArtifactChunk(
  pagination: VNextMeasuredPagination,
  rendererConsumption: VNextMeasuredRendererConsumption,
  exportReadiness: VNextMeasuredPaginationExportReadiness,
  pageOffset: number,
  maxArtifactPages: number,
): VNextLayoutArtifactChunk {
  const pageEnd = Math.min(pagination.pageCount, pageOffset + maxArtifactPages)
  const pages = pagination.pages.slice(pageOffset, pageEnd)
  const renderCommands = rendererConsumption.commands.filter((command) => (
    command.pageIndex >= pageOffset && command.pageIndex < pageEnd
  ))

  return {
    artifactVersion: VNEXT_LAYOUT_PIPELINE_VERSION,
    source: "vnext-layout-pipeline",
    stage: "fragment-artifact",
    status: pageEnd >= pagination.pageCount ? "complete" : "partial",
    pageOffset,
    pageCount: pages.length,
    totalPageCount: pagination.pageCount,
    pages,
    warnings: pagination.warnings.filter((warning) => warningBelongsToPageRange(warning, pageOffset, pageEnd)),
    renderCommands,
    rendererContract: rendererConsumption.rendererContract,
    exportReadiness: {
      status: exportReadiness.status,
      blockingIssueCount: exportReadiness.blockingIssues.length,
      warningIssueCount: exportReadiness.warningIssues.length,
    },
    blockingIssues: exportReadiness.blockingIssues.filter((issue) => issueBelongsToPageRange(issue, pageOffset, pageEnd)),
    warningIssues: exportReadiness.warningIssues.filter((issue) => issueBelongsToPageRange(issue, pageOffset, pageEnd)),
  }
}

export function createVNextLayoutPipelinePlan(document: DocumentNode): VNextLayoutPipelinePlan {
  const paginationPlan = buildVNextPaginationPlan(document)
  const jobs = paginationPlan.sourceItems.map(jobFromSourceItem)
  const measurementJobs = jobs.filter(isMeasurementJob)

  return {
    documentId: document.document.id,
    source: "vnext-pagination-plan",
    status: "planned",
    pipelineVersion: VNEXT_LAYOUT_PIPELINE_VERSION,
    stages: [...PIPELINE_STAGES],
    paginationPlan,
    jobs,
    measurementJobs,
    totalJobCount: jobs.length,
    totalMeasurementJobCount: measurementJobs.length,
  }
}

export function runVNextLayoutPipeline(
  document: DocumentNode,
  options: VNextMeasuredPaginationOptions = {},
): VNextLayoutPipelineRun {
  const plan = createVNextLayoutPipelinePlan(document)
  const pagination = paginateVNextDocument(document, options)
  const rendererConsumption = buildVNextMeasuredRendererConsumption(pagination)
  const exportReadiness = assessVNextMeasuredPaginationExportReadiness(pagination)

  return {
    documentId: document.document.id,
    source: "vnext-layout-pipeline",
    status: "complete",
    pipelineVersion: VNEXT_LAYOUT_PIPELINE_VERSION,
    plan,
    pagination,
    rendererConsumption,
    exportReadiness,
  }
}

export function runVNextLayoutPipelineChunk(
  document: DocumentNode,
  options: VNextLayoutPipelineChunkOptions = {},
): VNextLayoutPipelineChunk {
  const plan = createVNextLayoutPipelinePlan(document)
  const cursor = normalizeCursor(options.cursor)
  const maxMeasurementJobs = positiveInteger(options.maxMeasurementJobs, DEFAULT_MAX_MEASUREMENT_JOBS)
  const maxArtifactPages = positiveInteger(options.maxArtifactPages, DEFAULT_MAX_ARTIFACT_PAGES)
  const measurementOffset = Math.min(cursor.measurementJobOffset, plan.totalMeasurementJobCount)
  const measurementEnd = Math.min(plan.totalMeasurementJobCount, measurementOffset + maxMeasurementJobs)
  const measurementJobs = plan.measurementJobs.slice(measurementOffset, measurementEnd)
  const measurementStatus: VNextLayoutPipelineStatus = measurementEnd >= plan.totalMeasurementJobCount
    ? "complete"
    : "partial"
  const measurement: VNextLayoutMeasurementChunk = {
    source: "vnext-layout-pipeline",
    stage: "measure",
    status: measurementStatus,
    offset: measurementOffset,
    jobCount: measurementJobs.length,
    totalJobCount: plan.totalMeasurementJobCount,
    jobs: measurementJobs,
    results: measurementJobs.map(measurementResultForJob),
  }

  if (measurement.status === "partial") {
    return {
      documentId: document.document.id,
      source: "vnext-layout-pipeline",
      status: "partial",
      pipelineVersion: VNEXT_LAYOUT_PIPELINE_VERSION,
      plan,
      measurement,
      nextCursor: {
        measurementJobOffset: measurementEnd,
        artifactPageOffset: cursor.artifactPageOffset,
      },
    }
  }

  const pagination = paginateVNextDocument(document, options)
  const rendererConsumption = buildVNextMeasuredRendererConsumption(pagination)
  const exportReadiness = assessVNextMeasuredPaginationExportReadiness(pagination)
  const pageOffset = Math.min(cursor.artifactPageOffset, pagination.pageCount)
  const artifact = buildArtifactChunk(
    pagination,
    rendererConsumption,
    exportReadiness,
    pageOffset,
    maxArtifactPages,
  )

  return {
    documentId: document.document.id,
    source: "vnext-layout-pipeline",
    status: artifact.status,
    pipelineVersion: VNEXT_LAYOUT_PIPELINE_VERSION,
    plan,
    measurement,
    artifact,
    nextCursor: artifact.status === "complete"
      ? null
      : {
          measurementJobOffset: plan.totalMeasurementJobCount,
          artifactPageOffset: pageOffset + artifact.pageCount,
        },
  }
}
