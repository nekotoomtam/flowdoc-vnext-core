import type {
  VNextTableRenderBorderCommandV1,
  VNextTableRenderCommandV1,
  VNextTableRendererProjectionResultV1,
} from "./tableRendererContractV1.js"

export const VNEXT_TABLE_RENDERER_ADAPTER_VERSION = 1 as const
export const VNEXT_TABLE_RENDERER_ADAPTER_SOURCE = "vnext-table-renderer-adapter"

export interface VNextTableSvgPageEvidenceV1 {
  pageIndex: number
  commandCount: number
  widthPt: number
  heightPt: number
  markup: string
  fingerprint: string
}

export type VNextTableSvgEvidenceResultV1 =
  | {
      source: typeof VNEXT_TABLE_RENDERER_ADAPTER_SOURCE
      contractVersion: typeof VNEXT_TABLE_RENDERER_ADAPTER_VERSION
      status: "ready"
      pages: VNextTableSvgPageEvidenceV1[]
      fingerprint: string
      contracts: { relayout: false; mediaFetch: false; artifactBytes: false }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_RENDERER_ADAPTER_SOURCE
      contractVersion: typeof VNEXT_TABLE_RENDERER_ADAPTER_VERSION
      status: "blocked"
      pages: null
      issues: Array<{ code: string; path: string; message: string; severity: "error" }>
    }

export interface VNextTableArtifactAdapterOperationV1 {
  operationIndex: number
  commandId: string
  commandKind: VNextTableRenderCommandV1["kind"]
  pageIndex: number
  mapping: "native" | "no-paint" | "fallback"
  fallbackReason?: "docx-continuation-border" | "missing-media-placeholder"
}

export type VNextTableArtifactAdapterPlanResultV1 =
  | {
      source: typeof VNEXT_TABLE_RENDERER_ADAPTER_SOURCE
      contractVersion: typeof VNEXT_TABLE_RENDERER_ADAPTER_VERSION
      status: "ready"
      target: "pdf" | "docx"
      rendererFingerprint: string
      operations: VNextTableArtifactAdapterOperationV1[]
      warnings: Array<{
        code: "adapter-fallback"
        commandId: string
        message: string
      }>
      summary: { operationCount: number; nativeCount: number; noPaintCount: number; fallbackCount: number }
      fingerprint: string
      contracts: { relayout: false; authoredDocumentInput: false; artifactBytes: false }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_RENDERER_ADAPTER_SOURCE
      contractVersion: typeof VNEXT_TABLE_RENDERER_ADAPTER_VERSION
      status: "blocked"
      target: "pdf" | "docx"
      operations: null
      issues: Array<{ code: string; path: string; message: string; severity: "error" }>
    }

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;")
}

function number(value: number): string {
  return Number(value.toFixed(6)).toString()
}

function data(command: VNextTableRenderCommandV1): string {
  return `data-command-id="${escapeXml(command.id)}" data-kind="${command.kind}"`
}

function borderMarkup(command: VNextTableRenderBorderCommandV1): string {
  if (command.style.style === "none") return `<g ${data(command)} data-no-paint="true"/>`
  const { bounds } = command
  const x2 = bounds.widthPt === 0 ? bounds.xPt : bounds.xPt + bounds.widthPt
  const y2 = bounds.heightPt === 0 ? bounds.yPt : bounds.yPt + bounds.heightPt
  const dash = command.style.style === "dashed"
    ? ` stroke-dasharray="${number(command.style.widthPt * 4)} ${number(command.style.widthPt * 2)}"`
    : command.style.style === "dotted"
      ? ` stroke-dasharray="${number(command.style.widthPt)} ${number(command.style.widthPt * 2)}"`
      : ""
  return `<line ${data(command)} x1="${number(bounds.xPt)}" y1="${number(bounds.yPt)}" x2="${number(x2)}" y2="${number(y2)}" stroke="#${command.style.color}" stroke-width="${number(command.style.widthPt)}"${dash}/>`
}

function paintMarkup(command: VNextTableRenderCommandV1): string {
  const { bounds } = command
  if (command.kind === "cell-background") return `<rect ${data(command)} x="${number(bounds.xPt)}" y="${number(bounds.yPt)}" width="${number(bounds.widthPt)}" height="${number(bounds.heightPt)}" fill="#${command.color}"/>`
  if (command.kind === "text-line") return `<text ${data(command)} x="${number(bounds.xPt)}" y="${number(bounds.yPt + bounds.heightPt * 0.8)}" fill="#${command.color}" font-size="${number(bounds.heightPt * 0.75)}">${escapeXml(command.text)}</text>`
  if (command.kind === "image") return `<rect ${data(command)} data-asset-id="${escapeXml(command.assetId ?? "missing")}" data-placeholder="${command.placeholder}" x="${number(bounds.xPt)}" y="${number(bounds.yPt)}" width="${number(bounds.widthPt)}" height="${number(bounds.heightPt)}" fill="none" stroke="#64748B" stroke-width="0.5"/>`
  if (command.kind === "divider") return `<rect ${data(command)} x="${number(bounds.xPt)}" y="${number(bounds.yPt)}" width="${number(bounds.widthPt)}" height="${number(bounds.heightPt)}" fill="#${command.color}"/>`
  if (command.kind === "spacer") return `<g ${data(command)} data-no-paint="true"/>`
  if (command.kind === "border") return borderMarkup(command)
  return `<g ${data(command)} data-semantic-only="true"/>`
}

function projectionBlocked() {
  return [{
    code: "renderer-projection-not-consumable",
    path: "projection.status",
    message: "renderer projection must be consumable before adapter planning",
    severity: "error" as const,
  }]
}

export function createVNextTableSvgEvidenceV1(
  projection: VNextTableRendererProjectionResultV1,
): VNextTableSvgEvidenceResultV1 {
  if (projection.status !== "consumable") return {
    source: VNEXT_TABLE_RENDERER_ADAPTER_SOURCE,
    contractVersion: VNEXT_TABLE_RENDERER_ADAPTER_VERSION,
    status: "blocked", pages: null, issues: projectionBlocked(),
  }
  const pages = projection.commands.filter((command) => command.kind === "page").map((page) => {
    const commands = projection.commands.filter((command) => command.pageIndex === page.pageIndex)
    const widthPt = Math.max(1, page.bounds.widthPt)
    const heightPt = Math.max(1, page.bounds.heightPt)
    const content = commands.map(paintMarkup).join("")
    const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${number(page.bounds.xPt)} ${number(page.bounds.yPt)} ${number(widthPt)} ${number(heightPt)}" width="${number(widthPt)}pt" height="${number(heightPt)}pt">${content}</svg>`
    return {
      pageIndex: page.pageIndex,
      commandCount: commands.length,
      widthPt,
      heightPt,
      markup,
      fingerprint: JSON.stringify([page.pageIndex, commands, markup]),
    }
  })
  return {
    source: VNEXT_TABLE_RENDERER_ADAPTER_SOURCE,
    contractVersion: VNEXT_TABLE_RENDERER_ADAPTER_VERSION,
    status: "ready",
    pages,
    fingerprint: JSON.stringify([projection.fingerprint, ...pages.map((page) => page.fingerprint)]),
    contracts: { relayout: false, mediaFetch: false, artifactBytes: false },
    issues: [],
  }
}

export function createVNextTableArtifactAdapterPlanV1(input: {
  projection: VNextTableRendererProjectionResultV1
  target: "pdf" | "docx"
}): VNextTableArtifactAdapterPlanResultV1 {
  if (input.projection.status !== "consumable") return {
    source: VNEXT_TABLE_RENDERER_ADAPTER_SOURCE,
    contractVersion: VNEXT_TABLE_RENDERER_ADAPTER_VERSION,
    status: "blocked", target: input.target, operations: null, issues: projectionBlocked(),
  }
  const warnings: Extract<VNextTableArtifactAdapterPlanResultV1, { status: "ready" }>["warnings"] = []
  const operations = input.projection.commands.map((command, operationIndex): VNextTableArtifactAdapterOperationV1 => {
    let mapping: VNextTableArtifactAdapterOperationV1["mapping"] = command.kind === "spacer" ? "no-paint" : "native"
    let fallbackReason: VNextTableArtifactAdapterOperationV1["fallbackReason"]
    if (command.kind === "image" && command.placeholder) {
      mapping = "fallback"
      fallbackReason = "missing-media-placeholder"
    } else if (input.target === "docx" && command.kind === "border" && command.semanticRole === "continuation") {
      mapping = "fallback"
      fallbackReason = "docx-continuation-border"
    }
    if (fallbackReason != null) warnings.push({
      code: "adapter-fallback",
      commandId: command.id,
      message: fallbackReason === "docx-continuation-border"
        ? "DOCX maps the physical continuation edge to a segment bottom-border fallback"
        : "adapter draws the explicit missing-media placeholder",
    })
    return {
      operationIndex, commandId: command.id, commandKind: command.kind,
      pageIndex: command.pageIndex, mapping, ...(fallbackReason == null ? {} : { fallbackReason }),
    }
  })
  const summary = {
    operationCount: operations.length,
    nativeCount: operations.filter((operation) => operation.mapping === "native").length,
    noPaintCount: operations.filter((operation) => operation.mapping === "no-paint").length,
    fallbackCount: operations.filter((operation) => operation.mapping === "fallback").length,
  }
  return {
    source: VNEXT_TABLE_RENDERER_ADAPTER_SOURCE,
    contractVersion: VNEXT_TABLE_RENDERER_ADAPTER_VERSION,
    status: "ready", target: input.target,
    rendererFingerprint: input.projection.fingerprint,
    operations, warnings, summary,
    fingerprint: JSON.stringify([input.target, input.projection.fingerprint, operations]),
    contracts: { relayout: false, authoredDocumentInput: false, artifactBytes: false },
    issues: [],
  }
}
