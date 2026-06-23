import { createHash } from "node:crypto"
import type { VNextPdfDrawCommand, VNextPdfRendererAdapterPlan } from "@flowdoc/vnext-core"

export const FLOWDOC_PDF_RENDERER_SPIKE_SOURCE = "flowdoc-pdf-renderer-spike"
export const FLOWDOC_PDF_RENDERER_SPIKE_MODE = "minimal-text-only-pdf-bytes-spike"

export type FlowDocPdfRendererSpikeStatus = "rendered" | "blocked"
export type FlowDocPdfRendererSpikeIssueSeverity = "blocking" | "warning"

export type FlowDocPdfRendererSpikeIssueCode =
  | "production-binding"
  | "pdf-plan-blocked"
  | "missing-pages"
  | "missing-text-commands"
  | "invalid-page-size"

export interface FlowDocPdfRendererSpikeInput {
  spikeId: string
  rendererProfileId: string
  measurementProfileId: string
  plan: VNextPdfRendererAdapterPlan
  pageSizePt?: {
    widthPt: number
    heightPt: number
  }
  bindProductionRenderer?: boolean
}

export interface FlowDocPdfRendererSpikeIssue {
  severity: FlowDocPdfRendererSpikeIssueSeverity
  code: FlowDocPdfRendererSpikeIssueCode
  message: string
  targetId?: string
}

export interface FlowDocPdfRendererSpikeArtifactManifest {
  artifactId: string
  format: "pdf"
  mediaType: "application/pdf"
  byteLength: number
  sha256: string
  storageStatus: "not-stored"
  localOnly: true
  rendererProfileId: string
  measurementProfileId: string
}

export interface FlowDocPdfRendererSpikeResult {
  source: typeof FLOWDOC_PDF_RENDERER_SPIKE_SOURCE
  mode: typeof FLOWDOC_PDF_RENDERER_SPIKE_MODE
  status: FlowDocPdfRendererSpikeStatus
  spikeId: string
  artifact: FlowDocPdfRendererSpikeArtifactManifest | null
  bytes: Uint8Array | null
  renderContract: {
    consumes: "vnext-pdf-renderer-adapter-plan"
    output: "minimal-pdf-bytes"
    dependencyFree: true
    textOnly: true
    productionFidelity: false
    storageWrites: false
  }
  summary: {
    pageCount: number
    textCommandCount: number
    byteLength: number
  }
  blockingIssues: FlowDocPdfRendererSpikeIssue[]
  warningIssues: FlowDocPdfRendererSpikeIssue[]
}

const DEFAULT_PAGE_SIZE = {
  widthPt: 595.28,
  heightPt: 841.89,
}

function issue(
  severity: FlowDocPdfRendererSpikeIssueSeverity,
  code: FlowDocPdfRendererSpikeIssueCode,
  message: string,
  targetId?: string,
): FlowDocPdfRendererSpikeIssue {
  return targetId == null ? { severity, code, message } : { severity, code, message, targetId }
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/gu, "\\\\")
    .replace(/\(/gu, "\\(")
    .replace(/\)/gu, "\\)")
    .replace(/[\r\n]+/gu, " ")
}

function formatNumber(value: number): string {
  return Number(value.toFixed(3)).toString()
}

function textCommandsForPage(
  commands: readonly VNextPdfDrawCommand[],
  pageIndex: number,
): VNextPdfDrawCommand[] {
  return commands.filter((command) => (
    command.pageIndex === pageIndex &&
    command.operation === "draw-text" &&
    command.text != null &&
    command.text.length > 0
  ))
}

function createPageContent(
  commands: readonly VNextPdfDrawCommand[],
  pageIndex: number,
  pageSize: { widthPt: number; heightPt: number },
): string {
  const content: string[] = [
    "q",
    "0.85 0.85 0.85 RG",
    `0 0 ${formatNumber(pageSize.widthPt)} ${formatNumber(pageSize.heightPt)} re S`,
    "Q",
  ]

  textCommandsForPage(commands, pageIndex).forEach((command) => {
    const x = command.bounds.xPt
    const y = pageSize.heightPt - command.bounds.yPt - Math.max(10, Math.min(command.bounds.heightPt, 14))
    content.push(
      "BT",
      "/F1 10 Tf",
      `${formatNumber(x)} ${formatNumber(y)} Td`,
      `(${escapePdfText(command.text ?? "")}) Tj`,
      "ET",
    )
  })

  return `${content.join("\n")}\n`
}

function createObject(id: number, body: string): string {
  return `${id} 0 obj\n${body}\nendobj\n`
}

function buildPdfBytes(
  plan: VNextPdfRendererAdapterPlan,
  pageSize: { widthPt: number; heightPt: number },
): Uint8Array {
  const objects: string[] = []
  const pageObjectIds: number[] = []
  const contentObjectIds: number[] = []
  const fontObjectId = 3
  let nextObjectId = 4

  for (let pageIndex = 0; pageIndex < plan.pageCount; pageIndex += 1) {
    pageObjectIds.push(nextObjectId)
    contentObjectIds.push(nextObjectId + 1)
    nextObjectId += 2
  }

  objects.push(createObject(1, "<< /Type /Catalog /Pages 2 0 R >>"))
  objects.push(createObject(2, `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${plan.pageCount} >>`))
  objects.push(createObject(fontObjectId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"))

  pageObjectIds.forEach((pageObjectId, index) => {
    const contentObjectId = contentObjectIds[index]
    const content = createPageContent(plan.drawCommands, index, pageSize)

    objects.push(createObject(
      pageObjectId,
      [
        "<< /Type /Page",
        "/Parent 2 0 R",
        `/MediaBox [0 0 ${formatNumber(pageSize.widthPt)} ${formatNumber(pageSize.heightPt)}]`,
        ` /Resources << /Font << /F1 ${fontObjectId} 0 R >> >>`,
        `/Contents ${contentObjectId} 0 R >>`,
      ].join(" "),
    ))
    objects.push(createObject(contentObjectId, `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}endstream`))
  })

  let pdf = "%PDF-1.4\n"
  const offsets = [0]
  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"))
    pdf += object
  })
  const xrefOffset = Buffer.byteLength(pdf, "utf8")
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`

  return Buffer.from(pdf, "utf8")
}

function validateInput(
  input: FlowDocPdfRendererSpikeInput,
  pageSize: { widthPt: number; heightPt: number },
  blockingIssues: FlowDocPdfRendererSpikeIssue[],
): void {
  if (input.bindProductionRenderer === true) {
    blockingIssues.push(issue("blocking", "production-binding", "PDF renderer spike cannot bind production renderer behavior."))
  }

  if (input.plan.status === "blocked" || input.plan.blockingIssues.length > 0) {
    blockingIssues.push(issue("blocking", "pdf-plan-blocked", "PDF renderer spike requires a ready vNext PDF adapter plan.", input.spikeId))
  }

  if (input.plan.pageCount <= 0) {
    blockingIssues.push(issue("blocking", "missing-pages", "PDF renderer spike requires at least one page.", input.spikeId))
  }

  if (input.plan.drawCommands.filter((command) => command.operation === "draw-text").length === 0) {
    blockingIssues.push(issue("blocking", "missing-text-commands", "PDF renderer spike is text-only and requires text draw commands.", input.spikeId))
  }

  if (![pageSize.widthPt, pageSize.heightPt].every((value) => Number.isFinite(value) && value > 0)) {
    blockingIssues.push(issue("blocking", "invalid-page-size", "PDF renderer spike requires a positive page size.", input.spikeId))
  }
}

export function renderFlowDocMinimalPdfArtifact(
  input: FlowDocPdfRendererSpikeInput,
): FlowDocPdfRendererSpikeResult {
  const pageSize = input.pageSizePt ?? DEFAULT_PAGE_SIZE
  const blockingIssues: FlowDocPdfRendererSpikeIssue[] = []
  const warningIssues: FlowDocPdfRendererSpikeIssue[] = []

  validateInput(input, pageSize, blockingIssues)

  const bytes = blockingIssues.length === 0 ? buildPdfBytes(input.plan, pageSize) : null
  const sha256 = bytes == null ? null : createHash("sha256").update(bytes).digest("hex")
  const artifact = bytes == null || sha256 == null
    ? null
    : {
      artifactId: `pdf-spike:${input.spikeId}`,
      format: "pdf" as const,
      mediaType: "application/pdf" as const,
      byteLength: bytes.byteLength,
      sha256,
      storageStatus: "not-stored" as const,
      localOnly: true as const,
      rendererProfileId: input.rendererProfileId,
      measurementProfileId: input.measurementProfileId,
    }

  return {
    source: FLOWDOC_PDF_RENDERER_SPIKE_SOURCE,
    mode: FLOWDOC_PDF_RENDERER_SPIKE_MODE,
    status: blockingIssues.length === 0 ? "rendered" : "blocked",
    spikeId: input.spikeId,
    artifact,
    bytes,
    renderContract: {
      consumes: "vnext-pdf-renderer-adapter-plan",
      output: "minimal-pdf-bytes",
      dependencyFree: true,
      textOnly: true,
      productionFidelity: false,
      storageWrites: false,
    },
    summary: {
      pageCount: input.plan.pageCount,
      textCommandCount: input.plan.drawCommands.filter((command) => command.operation === "draw-text").length,
      byteLength: bytes?.byteLength ?? 0,
    },
    blockingIssues,
    warningIssues,
  }
}
