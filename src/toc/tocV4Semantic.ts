import { DocumentNodeV4TargetSchema, type AuthoredNodeV4Target, type DocumentNodeV4Target } from "../schema/documentV4Target.js"
import { validateVNextDocumentV4Structure } from "../schema/documentV4Structure.js"
import type { InlineNodeV4Target, TextBlockNodeV4Target } from "../schema/documentV4ImageTarget.js"

export const VNEXT_TOC_V4_SEMANTIC_SOURCE = "vnext-toc-v4-semantic"
export const VNEXT_TOC_V4_SEMANTIC_VERSION = 1 as const

export type VNextTocV4SemanticIssueCode =
  | "invalid-document-v4"
  | "document-structure-invalid"
  | "toc-outside-body-zone"
  | "heading-label-empty"

export interface VNextTocV4SemanticIssue {
  code: VNextTocV4SemanticIssueCode
  severity: "error" | "warning"
  path: string
  message: string
  sectionId?: string
  zoneId?: string
  nodeId?: string
  tocNodeId?: string
  headingNodeId?: string
}

export interface VNextTocV4GeneratedEntry {
  identity: { tocNodeId: string; headingNodeId: string }
  tocNodeId: string
  headingNodeId: string
  sectionId: string
  zoneId: string
  level: 1 | 2 | 3 | 4 | 5 | 6
  sourceOrdinal: number
  tocOrdinal: number
  label: {
    kind: "authored-preview"
    text: string
    fieldKeys: string[]
    materialization: "pending" | "not-required"
  }
  pageReference: { status: "pending"; pageIndex: null; pageNumber: null }
}

export interface VNextTocV4SemanticToc {
  tocNodeId: string
  sectionId: string
  zoneId: string
  title: string | null
  maxLevel: 1 | 2 | 3 | 4 | 5 | 6
  entries: VNextTocV4GeneratedEntry[]
  fieldKeys: string[]
  fingerprint: string
}

export type VNextTocV4SemanticResult =
  | {
      source: typeof VNEXT_TOC_V4_SEMANTIC_SOURCE
      contractVersion: typeof VNEXT_TOC_V4_SEMANTIC_VERSION
      status: "ready" | "partial"
      documentId: string
      tocs: VNextTocV4SemanticToc[]
      summary: {
        tocCount: number
        headingSourceCount: number
        entryCount: number
        fieldDependencyCount: number
        warningCount: number
      }
      invalidation: {
        semanticInputs: [
          "heading-identity-order-role-level-authored-inline",
          "toc-title-max-level",
        ]
        fieldValueChange: "materialized-label-refresh"
        paginationOnlyChange: "page-reference-refresh"
        presentationOnlyChange: "measurement-render-only"
      }
      work: { sectionVisitCount: number; nodeVisitCount: number; entryBuildCount: number }
      contracts: {
        documentMutation: false
        fieldValueResolution: "not-run"
        measurement: "not-run"
        pagination: "not-run"
        rendering: "not-run"
        persistence: "not-run"
        editorStateMutation: false
      }
      fingerprint: string
      issues: VNextTocV4SemanticIssue[]
    }
  | {
      source: typeof VNEXT_TOC_V4_SEMANTIC_SOURCE
      contractVersion: typeof VNEXT_TOC_V4_SEMANTIC_VERSION
      status: "blocked"
      documentId: string | null
      tocs: []
      issues: VNextTocV4SemanticIssue[]
    }

type HeadingSource = {
  node: TextBlockNodeV4Target & { role: { role: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6 } }
  sectionId: string
  zoneId: string
  sourceOrdinal: number
}

type TocSource = {
  node: Extract<AuthoredNodeV4Target, { type: "toc" }>
  sectionId: string
  zoneId: string
}

function childIds(node: AuthoredNodeV4Target): readonly string[] {
  if (node.type === "zone" || node.type === "column" || node.type === "table-cell") return node.childIds
  if (node.type === "columns") return node.columnIds
  if (node.type === "table") return node.rowIds
  if (node.type === "table-row") return node.cellIds
  return []
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(
  code: VNextTocV4SemanticIssueCode,
  severity: VNextTocV4SemanticIssue["severity"],
  path: string,
  message: string,
  facts: Pick<VNextTocV4SemanticIssue, "sectionId" | "zoneId" | "nodeId" | "tocNodeId" | "headingNodeId"> = {},
): VNextTocV4SemanticIssue {
  return {
    code, severity, path, message,
    ...(facts.sectionId == null ? {} : { sectionId: facts.sectionId }),
    ...(facts.zoneId == null ? {} : { zoneId: facts.zoneId }),
    ...(facts.nodeId == null ? {} : { nodeId: facts.nodeId }),
    ...(facts.tocNodeId == null ? {} : { tocNodeId: facts.tocNodeId }),
    ...(facts.headingNodeId == null ? {} : { headingNodeId: facts.headingNodeId }),
  }
}

function inlineLabel(inline: InlineNodeV4Target): { text: string; fieldKey: string | null } {
  if (inline.type === "text") return { text: inline.text, fieldKey: null }
  if (inline.type === "line-break") return { text: " ", fieldKey: null }
  if (inline.type === "field-ref") return {
    text: inline.label ?? inline.fallback ?? inline.key,
    fieldKey: inline.key,
  }
  return { text: "", fieldKey: null }
}

function headingLabel(node: TextBlockNodeV4Target): { text: string; fieldKeys: string[] } {
  const parts = node.children.map(inlineLabel)
  return {
    text: parts.map((part) => part.text).join("").replace(/\s+/g, " ").trim(),
    fieldKeys: [...new Set(parts.flatMap((part) => part.fieldKey == null ? [] : [part.fieldKey]))],
  }
}

function blocked(documentId: string | null, issues: VNextTocV4SemanticIssue[]): VNextTocV4SemanticResult {
  return {
    source: VNEXT_TOC_V4_SEMANTIC_SOURCE,
    contractVersion: VNEXT_TOC_V4_SEMANTIC_VERSION,
    status: "blocked", documentId, tocs: [], issues,
  }
}

export function collectVNextTocV4Semantics(value: unknown): VNextTocV4SemanticResult {
  const parsed = DocumentNodeV4TargetSchema.safeParse(value)
  if (!parsed.success) return blocked(null, parsed.error.issues.map((item) => issue(
    "invalid-document-v4", "error", item.path.map(String).join("."), item.message,
  )))
  const document: DocumentNodeV4Target = parsed.data
  const structure = validateVNextDocumentV4Structure(document)
  if (structure.status !== "valid") return blocked(document.document.id, structure.issues.map((item) => issue(
    "document-structure-invalid", "error", item.path, item.message,
    { sectionId: item.sectionId, nodeId: item.nodeId },
  )))

  const semanticIssues: VNextTocV4SemanticIssue[] = []
  const headings: HeadingSource[] = []
  const tocs: TocSource[] = []
  let nodeVisitCount = 0

  document.document.sections.forEach((section, sectionIndex) => {
    section.zoneIds.forEach((zoneId, zoneIndex) => {
      const zone = section.nodes[zoneId]
      if (zone?.type !== "zone") return
      const visit = (nodeId: string, path: string): void => {
        const node = section.nodes[nodeId]
        if (node == null) return
        nodeVisitCount += 1
        if (node.type === "toc") {
          if (zone.role !== "body") semanticIssues.push(issue(
            "toc-outside-body-zone", "error", path,
            `toc "${node.id}" must be authored inside a body zone`,
            { sectionId: section.id, zoneId, tocNodeId: node.id },
          ))
          else tocs.push({ node, sectionId: section.id, zoneId })
        }
        if (zone.role === "body" && node.type === "text-block" && node.role.role === "heading") {
          headings.push({
            node: node as HeadingSource["node"], sectionId: section.id, zoneId,
            sourceOrdinal: headings.length,
          })
        }
        childIds(node).forEach((childId, childIndex) => visit(
          childId, `${path}.${
            node.type === "columns" ? "columnIds" :
            node.type === "table" ? "rowIds" :
            node.type === "table-row" ? "cellIds" : "childIds"
          }[${childIndex}]`,
        ))
      }
      visit(zoneId, `document.sections[${sectionIndex}].zoneIds[${zoneIndex}]`)
    })
  })
  const errors = semanticIssues.filter((item) => item.severity === "error")
  if (errors.length > 0) return blocked(document.document.id, semanticIssues)

  let entryBuildCount = 0
  const semanticTocs = tocs.map((toc): VNextTocV4SemanticToc => {
    const maxLevel = toc.node.props.maxLevel ?? 6
    const entries = headings
      .filter((heading) => heading.node.role.level <= maxLevel)
      .map((heading, tocOrdinal): VNextTocV4GeneratedEntry => {
        entryBuildCount += 1
        const label = headingLabel(heading.node)
        if (label.text.length === 0) semanticIssues.push(issue(
          "heading-label-empty", "warning", `toc.${toc.node.id}.entries[${tocOrdinal}].label`,
          `heading "${heading.node.id}" has an empty authored-preview TOC label`,
          {
            sectionId: heading.sectionId, zoneId: heading.zoneId,
            tocNodeId: toc.node.id, headingNodeId: heading.node.id,
          },
        ))
        return {
          identity: { tocNodeId: toc.node.id, headingNodeId: heading.node.id },
          tocNodeId: toc.node.id,
          headingNodeId: heading.node.id,
          sectionId: heading.sectionId,
          zoneId: heading.zoneId,
          level: heading.node.role.level,
          sourceOrdinal: heading.sourceOrdinal,
          tocOrdinal,
          label: {
            kind: "authored-preview", text: label.text, fieldKeys: label.fieldKeys,
            materialization: label.fieldKeys.length > 0 ? "pending" : "not-required",
          },
          pageReference: { status: "pending", pageIndex: null, pageNumber: null },
        }
      })
    const fieldKeys = [...new Set(entries.flatMap((entry) => entry.label.fieldKeys))]
    const facts = {
      tocNodeId: toc.node.id,
      sectionId: toc.sectionId,
      zoneId: toc.zoneId,
      title: toc.node.props.title ?? null,
      maxLevel,
      entries,
      fieldKeys,
    }
    return { ...facts, fingerprint: JSON.stringify(facts) }
  })
  const fieldDependencyCount = new Set(semanticTocs.flatMap((toc) => toc.fieldKeys)).size
  const warningCount = semanticIssues.filter((item) => item.severity === "warning").length
  const facts = {
    documentId: document.document.id,
    tocs: semanticTocs,
    summary: {
      tocCount: semanticTocs.length,
      headingSourceCount: headings.length,
      entryCount: entryBuildCount,
      fieldDependencyCount,
      warningCount,
    },
    invalidation: {
      semanticInputs: [
        "heading-identity-order-role-level-authored-inline",
        "toc-title-max-level",
      ] as ["heading-identity-order-role-level-authored-inline", "toc-title-max-level"],
      fieldValueChange: "materialized-label-refresh" as const,
      paginationOnlyChange: "page-reference-refresh" as const,
      presentationOnlyChange: "measurement-render-only" as const,
    },
    work: {
      sectionVisitCount: document.document.sections.length,
      nodeVisitCount,
      entryBuildCount,
    },
    contracts: {
      documentMutation: false as const,
      fieldValueResolution: "not-run" as const,
      measurement: "not-run" as const,
      pagination: "not-run" as const,
      rendering: "not-run" as const,
      persistence: "not-run" as const,
      editorStateMutation: false as const,
    },
  }
  return {
    source: VNEXT_TOC_V4_SEMANTIC_SOURCE,
    contractVersion: VNEXT_TOC_V4_SEMANTIC_VERSION,
    status: warningCount > 0 ? "partial" : "ready",
    ...clone(facts),
    fingerprint: JSON.stringify(facts),
    issues: clone(semanticIssues),
  }
}
