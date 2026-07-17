import type {
  VNextMeasuredRenderCommand,
  VNextMeasuredRendererConsumption,
  VNextMeasuredRendererConsumptionIssue,
} from "../pagination/rendererConsumption.js"

export const VNEXT_PDF_RENDERER_ADAPTER_SOURCE = "vnext-pdf-renderer-adapter"
export const VNEXT_PDF_RENDERER_ADAPTER_MODE = "measured-render-command-adapter"

export type VNextPdfRendererAdapterStatus = "ready" | "blocked"

export type VNextPdfDrawOperation =
  | "draw-text"
  | "draw-fragment-box"

export interface VNextPdfDrawCommand {
  id: string
  sourceCommandId: string
  fragmentId: string
  pageIndex: number
  pageNumber: number
  operation: VNextPdfDrawOperation
  nodeId: string
  nodeType: VNextMeasuredRenderCommand["nodeType"] | "image"
  bounds: VNextMeasuredRenderCommand["bounds"]
  text: string | null
  table: VNextMeasuredRenderCommand["table"] | null
}

export interface VNextPdfRendererAdapterArtifact {
  kind: "pdf"
  status: "not-rendered"
  contentType: "application/pdf"
  bytes: null
  storageId: null
}

export interface VNextPdfRendererAdapterPlan {
  source: typeof VNEXT_PDF_RENDERER_ADAPTER_SOURCE
  mode: typeof VNEXT_PDF_RENDERER_ADAPTER_MODE
  status: VNextPdfRendererAdapterStatus
  rendererContract: {
    consumes: "measured-render-commands"
    mayRelayout: false
    requiresAuthoredDocumentForLayout: false
    output: "pdf"
  }
  artifact: VNextPdfRendererAdapterArtifact
  pageCount: number
  drawCommands: VNextPdfDrawCommand[]
  blockingIssues: VNextMeasuredRendererConsumptionIssue[]
  warningIssues: VNextMeasuredRendererConsumptionIssue[]
  summary: {
    inputCommandCount: number
    drawCommandCount: number
    textCommandCount: number
    boxCommandCount: number
    blockingIssueCount: number
    warningIssueCount: number
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function drawOperation(command: VNextMeasuredRenderCommand): VNextPdfDrawOperation {
  return command.kind === "text" ? "draw-text" : "draw-fragment-box"
}

function drawCommand(command: VNextMeasuredRenderCommand): VNextPdfDrawCommand {
  return {
    id: `pdf:${command.id}`,
    sourceCommandId: command.id,
    fragmentId: command.fragmentId,
    pageIndex: command.pageIndex,
    pageNumber: command.pageNumber,
    operation: drawOperation(command),
    nodeId: command.nodeId,
    nodeType: command.nodeType,
    bounds: cloneJson(command.bounds),
    text: command.text ?? null,
    table: command.table == null ? null : cloneJson(command.table),
  }
}

export function createVNextPdfRendererAdapterPlan(
  consumption: VNextMeasuredRendererConsumption,
): VNextPdfRendererAdapterPlan {
  const blocked = consumption.status === "blocked" || consumption.blockingIssues.length > 0
  const drawCommands = blocked ? [] : consumption.commands.map(drawCommand)
  const textCommandCount = drawCommands.filter((command) => command.operation === "draw-text").length

  return {
    source: VNEXT_PDF_RENDERER_ADAPTER_SOURCE,
    mode: VNEXT_PDF_RENDERER_ADAPTER_MODE,
    status: blocked ? "blocked" : "ready",
    rendererContract: {
      consumes: "measured-render-commands",
      mayRelayout: false,
      requiresAuthoredDocumentForLayout: false,
      output: "pdf",
    },
    artifact: {
      kind: "pdf",
      status: "not-rendered",
      contentType: "application/pdf",
      bytes: null,
      storageId: null,
    },
    pageCount: consumption.pageCount,
    drawCommands,
    blockingIssues: cloneJson(consumption.blockingIssues),
    warningIssues: cloneJson(consumption.warningIssues),
    summary: {
      inputCommandCount: consumption.commandCount,
      drawCommandCount: drawCommands.length,
      textCommandCount,
      boxCommandCount: drawCommands.length - textCommandCount,
      blockingIssueCount: consumption.blockingIssues.length,
      warningIssueCount: consumption.warningIssues.length,
    },
  }
}
