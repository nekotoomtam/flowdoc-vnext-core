import type {
  VNextMeasuredRenderCommand,
  VNextMeasuredRendererConsumption,
  VNextMeasuredRendererConsumptionIssue,
} from "../pagination/rendererConsumption.js"

export const VNEXT_DOCX_RENDERER_ADAPTER_SOURCE = "vnext-docx-renderer-adapter"
export const VNEXT_DOCX_RENDERER_ADAPTER_MODE = "measured-render-command-adapter"

export type VNextDocxRendererAdapterStatus = "ready" | "blocked"

export type VNextDocxAssemblyOperation =
  | "paragraph"
  | "structure-box"

export interface VNextDocxAssemblyCommand {
  id: string
  sourceCommandId: string
  fragmentId: string
  pageIndex: number
  pageNumber: number
  operation: VNextDocxAssemblyOperation
  nodeId: string
  nodeType: VNextMeasuredRenderCommand["nodeType"]
  bounds: VNextMeasuredRenderCommand["bounds"]
  text: string | null
  table: VNextMeasuredRenderCommand["table"] | null
}

export interface VNextDocxRendererAdapterArtifact {
  kind: "docx"
  status: "not-rendered"
  contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  bytes: null
  storageId: null
}

export interface VNextDocxRendererAdapterPlan {
  source: typeof VNEXT_DOCX_RENDERER_ADAPTER_SOURCE
  mode: typeof VNEXT_DOCX_RENDERER_ADAPTER_MODE
  status: VNextDocxRendererAdapterStatus
  rendererContract: {
    consumes: "measured-render-commands"
    mayRelayout: false
    requiresAuthoredDocumentForLayout: false
    mayUseSourceDocumentForStructure: false
    output: "docx"
  }
  artifact: VNextDocxRendererAdapterArtifact
  pageCount: number
  assemblyCommands: VNextDocxAssemblyCommand[]
  blockingIssues: VNextMeasuredRendererConsumptionIssue[]
  warningIssues: VNextMeasuredRendererConsumptionIssue[]
  summary: {
    inputCommandCount: number
    assemblyCommandCount: number
    paragraphCommandCount: number
    structureCommandCount: number
    blockingIssueCount: number
    warningIssueCount: number
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function assemblyOperation(command: VNextMeasuredRenderCommand): VNextDocxAssemblyOperation {
  return command.kind === "text" ? "paragraph" : "structure-box"
}

function assemblyCommand(command: VNextMeasuredRenderCommand): VNextDocxAssemblyCommand {
  return {
    id: `docx:${command.id}`,
    sourceCommandId: command.id,
    fragmentId: command.fragmentId,
    pageIndex: command.pageIndex,
    pageNumber: command.pageNumber,
    operation: assemblyOperation(command),
    nodeId: command.nodeId,
    nodeType: command.nodeType,
    bounds: cloneJson(command.bounds),
    text: command.text ?? null,
    table: command.table == null ? null : cloneJson(command.table),
  }
}

export function createVNextDocxRendererAdapterPlan(
  consumption: VNextMeasuredRendererConsumption,
): VNextDocxRendererAdapterPlan {
  const blocked = consumption.status === "blocked" || consumption.blockingIssues.length > 0
  const assemblyCommands = blocked ? [] : consumption.commands.map(assemblyCommand)
  const paragraphCommandCount = assemblyCommands.filter((command) => command.operation === "paragraph").length

  return {
    source: VNEXT_DOCX_RENDERER_ADAPTER_SOURCE,
    mode: VNEXT_DOCX_RENDERER_ADAPTER_MODE,
    status: blocked ? "blocked" : "ready",
    rendererContract: {
      consumes: "measured-render-commands",
      mayRelayout: false,
      requiresAuthoredDocumentForLayout: false,
      mayUseSourceDocumentForStructure: false,
      output: "docx",
    },
    artifact: {
      kind: "docx",
      status: "not-rendered",
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      bytes: null,
      storageId: null,
    },
    pageCount: consumption.pageCount,
    assemblyCommands,
    blockingIssues: cloneJson(consumption.blockingIssues),
    warningIssues: cloneJson(consumption.warningIssues),
    summary: {
      inputCommandCount: consumption.commandCount,
      assemblyCommandCount: assemblyCommands.length,
      paragraphCommandCount,
      structureCommandCount: assemblyCommands.length - paragraphCommandCount,
      blockingIssueCount: consumption.blockingIssues.length,
      warningIssueCount: consumption.warningIssues.length,
    },
  }
}
