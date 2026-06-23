import type { AuthoredNode, DocumentNode, InlineNode, TextBlockNode } from "../schema/document.js"
import type { NodeId } from "../graph/relationshipGraph.js"
import type { VNextMeasuredFragment, VNextMeasuredPagination } from "./measuredTypes.js"

export const VNEXT_FINAL_PAGE_RESOLUTION_SOURCE = "vnext-final-page-resolution"
export const VNEXT_FINAL_PAGE_RESOLUTION_MODE = "toc-page-resolution-boundary"

export type VNextFinalPageResolutionStatus = "resolved" | "partial" | "blocked"
type VNextHeadingTextBlockNode = TextBlockNode & { role: Extract<TextBlockNode["role"], { role: "heading" }> }

export type VNextFinalPageResolutionIssueCode =
  | "document-id-mismatch"
  | "heading-page-unresolved"

export interface VNextFinalPageResolutionIssue {
  severity: "blocking" | "warning"
  code: VNextFinalPageResolutionIssueCode
  nodeId?: NodeId
  message: string
}

export interface VNextResolvedTocEntry {
  tocNodeId: NodeId
  headingNodeId: NodeId
  headingText: string
  level: number
  status: "resolved" | "unresolved"
  pageIndex: number | null
  pageNumber: number | null
}

export interface VNextFinalPageResolutionPlan {
  source: typeof VNEXT_FINAL_PAGE_RESOLUTION_SOURCE
  mode: typeof VNEXT_FINAL_PAGE_RESOLUTION_MODE
  status: VNextFinalPageResolutionStatus
  documentId: string
  paginationDocumentId: string
  resolutionContract: {
    consumes: "document-v3-and-measured-pagination"
    produces: "toc-page-reference-resolution"
    mayRelayoutDocument: false
    mutatesDocument: false
    mutatesMeasuredPagination: false
    writesArtifacts: false
  }
  pageNumberInlineResolution: {
    status: "already-resolved-in-measured-pagination"
    pageCount: number
    firstPageNumber: number | null
    lastPageNumber: number | null
  }
  tocCount: number
  headingCount: number
  resolvedHeadingCount: number
  entries: VNextResolvedTocEntry[]
  blockingIssues: VNextFinalPageResolutionIssue[]
  warningIssues: VNextFinalPageResolutionIssue[]
}

function inlineText(inlines: readonly InlineNode[]): string {
  return inlines.map((inline) => {
    if (inline.type === "text") return inline.text
    if (inline.type === "field-ref") return inline.label ?? inline.fallback ?? inline.key
    if (inline.type === "page-number") return "?"
    return "\n"
  }).join("")
}

function headingText(node: VNextHeadingTextBlockNode): string {
  return inlineText(node.children).replace(/\s+/g, " ").trim()
}

function documentNodes(document: DocumentNode): AuthoredNode[] {
  return document.document.sections.flatMap((section) => Object.values(section.nodes))
}

function tocNodes(document: DocumentNode): Extract<AuthoredNode, { type: "toc" }>[] {
  return documentNodes(document).filter((node): node is Extract<AuthoredNode, { type: "toc" }> => node.type === "toc")
}

function headingNodes(document: DocumentNode): VNextHeadingTextBlockNode[] {
  return documentNodes(document).filter((node): node is VNextHeadingTextBlockNode => (
    node.type === "text-block" && node.role.role === "heading"
  ))
}

function firstFragmentByNodeId(pagination: VNextMeasuredPagination): Map<NodeId, VNextMeasuredFragment> {
  const byNodeId = new Map<NodeId, VNextMeasuredFragment>()

  pagination.pages.forEach((page) => {
    page.fragments.forEach((fragment) => {
      if (!byNodeId.has(fragment.nodeId)) byNodeId.set(fragment.nodeId, fragment)
    })
  })

  return byNodeId
}

function issue(
  severity: VNextFinalPageResolutionIssue["severity"],
  code: VNextFinalPageResolutionIssueCode,
  message: string,
  nodeId?: NodeId,
): VNextFinalPageResolutionIssue {
  return nodeId == null
    ? { severity, code, message }
    : { severity, code, message, nodeId }
}

export function resolveVNextFinalPageReferences(
  document: DocumentNode,
  pagination: VNextMeasuredPagination,
): VNextFinalPageResolutionPlan {
  const blockingIssues: VNextFinalPageResolutionIssue[] = []
  const warningIssues: VNextFinalPageResolutionIssue[] = []
  const pageNumbers = pagination.pages.map((page) => page.pageNumber)
  const tcs = tocNodes(document)
  const headings = headingNodes(document)
  const fragmentByNodeId = firstFragmentByNodeId(pagination)

  if (document.document.id !== pagination.documentId) {
    blockingIssues.push(issue(
      "blocking",
      "document-id-mismatch",
      `Measured pagination document "${pagination.documentId}" does not match document "${document.document.id}".`,
    ))
  }

  const entries = blockingIssues.length > 0
    ? []
    : tcs.flatMap((toc) => {
        const maxLevel = toc.props.maxLevel ?? 6
        return headings
          .filter((heading) => heading.role.role === "heading" && heading.role.level <= maxLevel)
          .map((heading): VNextResolvedTocEntry => {
            const fragment = fragmentByNodeId.get(heading.id)
            if (fragment == null) {
              warningIssues.push(issue(
                "warning",
                "heading-page-unresolved",
                `Heading "${heading.id}" does not have a measured fragment for final TOC page resolution.`,
                heading.id,
              ))
            }

            return {
              tocNodeId: toc.id,
              headingNodeId: heading.id,
              headingText: headingText(heading),
              level: heading.role.level,
              status: fragment == null ? "unresolved" : "resolved",
              pageIndex: fragment?.pageIndex ?? null,
              pageNumber: fragment?.pageNumber ?? null,
            }
          })
      })
  const resolvedHeadingIds = new Set(entries.filter((entry) => entry.status === "resolved").map((entry) => entry.headingNodeId))

  return {
    source: VNEXT_FINAL_PAGE_RESOLUTION_SOURCE,
    mode: VNEXT_FINAL_PAGE_RESOLUTION_MODE,
    status: blockingIssues.length > 0
      ? "blocked"
      : warningIssues.length > 0
        ? "partial"
        : "resolved",
    documentId: document.document.id,
    paginationDocumentId: pagination.documentId,
    resolutionContract: {
      consumes: "document-v3-and-measured-pagination",
      produces: "toc-page-reference-resolution",
      mayRelayoutDocument: false,
      mutatesDocument: false,
      mutatesMeasuredPagination: false,
      writesArtifacts: false,
    },
    pageNumberInlineResolution: {
      status: "already-resolved-in-measured-pagination",
      pageCount: pagination.pageCount,
      firstPageNumber: pageNumbers[0] ?? null,
      lastPageNumber: pageNumbers.at(-1) ?? null,
    },
    tocCount: tcs.length,
    headingCount: headings.length,
    resolvedHeadingCount: resolvedHeadingIds.size,
    entries,
    blockingIssues,
    warningIssues,
  }
}
