import type {
  VNextTocV4GeneratedEntry,
  VNextTocV4SemanticResult,
  VNextTocV4SemanticToc,
} from "./tocV4Semantic.js"

export const VNEXT_TOC_V4_SEMANTIC_IMPACT_SOURCE = "vnext-toc-v4-semantic-impact"
export const VNEXT_TOC_V4_SEMANTIC_IMPACT_VERSION = 1 as const

type AcceptedPlan = Extract<VNextTocV4SemanticResult, { status: "ready" | "partial" }>

export interface VNextTocV4SemanticTocChange {
  tocNodeId: string
  kind: "added" | "removed" | "changed"
  configurationChanged: boolean
  addedHeadingNodeIds: string[]
  removedHeadingNodeIds: string[]
  movedHeadingNodeIds: string[]
  levelChangedHeadingNodeIds: string[]
  labelChangedHeadingNodeIds: string[]
  fieldDependencyChangedHeadingNodeIds: string[]
}

export type VNextTocV4SemanticImpactResult =
  | {
      source: typeof VNEXT_TOC_V4_SEMANTIC_IMPACT_SOURCE
      contractVersion: typeof VNEXT_TOC_V4_SEMANTIC_IMPACT_VERSION
      status: "changed" | "unchanged"
      documentId: string
      tocChanges: VNextTocV4SemanticTocChange[]
      affectedTocNodeIds: string[]
      affectedHeadingNodeIds: string[]
      summary: {
        addedEntryCount: number
        removedEntryCount: number
        movedEntryCount: number
        levelChangedEntryCount: number
        labelChangedEntryCount: number
        fieldDependencyChangedEntryCount: number
      }
      invalidation: {
        semanticEntries: boolean
        tocMeasurementNodeIds: string[]
        pagination: boolean
        renderer: boolean
        pageReferenceRefresh: "all-entries-in-affected-tocs" | "not-required"
      }
      contracts: { measurement: "not-run"; pagination: "not-run"; rendering: "not-run" }
      fingerprint: string
      issues: []
    }
  | {
      source: typeof VNEXT_TOC_V4_SEMANTIC_IMPACT_SOURCE
      contractVersion: typeof VNEXT_TOC_V4_SEMANTIC_IMPACT_VERSION
      status: "blocked"
      reason: "semantic-plan-blocked" | "document-id-mismatch"
      issues: Array<{ code: string; severity: "error"; path: string; message: string }>
    }

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function entryByHeading(toc: VNextTocV4SemanticToc | undefined): Map<string, VNextTocV4GeneratedEntry> {
  return new Map((toc?.entries ?? []).map((entry) => [entry.headingNodeId, entry]))
}

function blocked(
  reason: Extract<VNextTocV4SemanticImpactResult, { status: "blocked" }>["reason"],
  code: string,
  path: string,
  message: string,
): VNextTocV4SemanticImpactResult {
  return {
    source: VNEXT_TOC_V4_SEMANTIC_IMPACT_SOURCE,
    contractVersion: VNEXT_TOC_V4_SEMANTIC_IMPACT_VERSION,
    status: "blocked", reason,
    issues: [{ code, severity: "error", path, message }],
  }
}

export function compareVNextTocV4Semantics(input: {
  before: VNextTocV4SemanticResult
  after: VNextTocV4SemanticResult
}): VNextTocV4SemanticImpactResult {
  if (input.before.status === "blocked" || input.after.status === "blocked") return blocked(
    "semantic-plan-blocked", "semantic-plan-blocked", "before|after",
    "TOC semantic impact requires two ready or partial semantic plans",
  )
  const before: AcceptedPlan = input.before
  const after: AcceptedPlan = input.after
  if (before.documentId !== after.documentId) return blocked(
    "document-id-mismatch", "document-id-mismatch", "after.documentId",
    `after document "${after.documentId}" does not match before document "${before.documentId}"`,
  )

  const beforeByToc = new Map(before.tocs.map((toc) => [toc.tocNodeId, toc]))
  const afterByToc = new Map(after.tocs.map((toc) => [toc.tocNodeId, toc]))
  const tocIds = [...new Set([...beforeByToc.keys(), ...afterByToc.keys()])].sort()
  const tocChanges: VNextTocV4SemanticTocChange[] = []

  tocIds.forEach((tocNodeId) => {
    const beforeToc = beforeByToc.get(tocNodeId)
    const afterToc = afterByToc.get(tocNodeId)
    const beforeEntries = entryByHeading(beforeToc)
    const afterEntries = entryByHeading(afterToc)
    const headingIds = [...new Set([...beforeEntries.keys(), ...afterEntries.keys()])]
    const addedHeadingNodeIds = headingIds.filter((headingId) => !beforeEntries.has(headingId))
    const removedHeadingNodeIds = headingIds.filter((headingId) => !afterEntries.has(headingId))
    const retainedHeadingIds = headingIds.filter((headingId) => beforeEntries.has(headingId) && afterEntries.has(headingId))
    const movedHeadingNodeIds = retainedHeadingIds.filter((headingId) => {
      const left = beforeEntries.get(headingId)!
      const right = afterEntries.get(headingId)!
      return left.sourceOrdinal !== right.sourceOrdinal || left.tocOrdinal !== right.tocOrdinal
    })
    const levelChangedHeadingNodeIds = retainedHeadingIds.filter((headingId) => (
      beforeEntries.get(headingId)!.level !== afterEntries.get(headingId)!.level
    ))
    const labelChangedHeadingNodeIds = retainedHeadingIds.filter((headingId) => (
      beforeEntries.get(headingId)!.label.text !== afterEntries.get(headingId)!.label.text
    ))
    const fieldDependencyChangedHeadingNodeIds = retainedHeadingIds.filter((headingId) => (
      !exact(beforeEntries.get(headingId)!.label.fieldKeys, afterEntries.get(headingId)!.label.fieldKeys)
    ))
    const configurationChanged = beforeToc != null && afterToc != null && (
      beforeToc.title !== afterToc.title || beforeToc.maxLevel !== afterToc.maxLevel
    )
    const changed = beforeToc == null || afterToc == null || configurationChanged || [
      addedHeadingNodeIds, removedHeadingNodeIds, movedHeadingNodeIds,
      levelChangedHeadingNodeIds, labelChangedHeadingNodeIds, fieldDependencyChangedHeadingNodeIds,
    ].some((values) => values.length > 0)
    if (!changed) return
    tocChanges.push({
      tocNodeId,
      kind: beforeToc == null ? "added" : afterToc == null ? "removed" : "changed",
      configurationChanged,
      addedHeadingNodeIds,
      removedHeadingNodeIds,
      movedHeadingNodeIds,
      levelChangedHeadingNodeIds,
      labelChangedHeadingNodeIds,
      fieldDependencyChangedHeadingNodeIds,
    })
  })

  const affectedTocNodeIds = tocChanges.map((change) => change.tocNodeId)
  const affectedHeadingNodeIds = [...new Set(tocChanges.flatMap((change) => [
    ...change.addedHeadingNodeIds,
    ...change.removedHeadingNodeIds,
    ...change.movedHeadingNodeIds,
    ...change.levelChangedHeadingNodeIds,
    ...change.labelChangedHeadingNodeIds,
    ...change.fieldDependencyChangedHeadingNodeIds,
  ]))]
  const summary = {
    addedEntryCount: tocChanges.reduce((total, change) => total + change.addedHeadingNodeIds.length, 0),
    removedEntryCount: tocChanges.reduce((total, change) => total + change.removedHeadingNodeIds.length, 0),
    movedEntryCount: tocChanges.reduce((total, change) => total + change.movedHeadingNodeIds.length, 0),
    levelChangedEntryCount: tocChanges.reduce((total, change) => total + change.levelChangedHeadingNodeIds.length, 0),
    labelChangedEntryCount: tocChanges.reduce((total, change) => total + change.labelChangedHeadingNodeIds.length, 0),
    fieldDependencyChangedEntryCount: tocChanges.reduce(
      (total, change) => total + change.fieldDependencyChangedHeadingNodeIds.length, 0,
    ),
  }
  const changed = tocChanges.length > 0
  const facts = {
    documentId: before.documentId,
    tocChanges,
    affectedTocNodeIds,
    affectedHeadingNodeIds,
    summary,
    invalidation: {
      semanticEntries: changed,
      tocMeasurementNodeIds: affectedTocNodeIds,
      pagination: changed,
      renderer: changed,
      pageReferenceRefresh: changed ? "all-entries-in-affected-tocs" as const : "not-required" as const,
    },
    contracts: { measurement: "not-run" as const, pagination: "not-run" as const, rendering: "not-run" as const },
  }
  return {
    source: VNEXT_TOC_V4_SEMANTIC_IMPACT_SOURCE,
    contractVersion: VNEXT_TOC_V4_SEMANTIC_IMPACT_VERSION,
    status: changed ? "changed" : "unchanged",
    ...facts,
    fingerprint: JSON.stringify(facts),
    issues: [],
  }
}
