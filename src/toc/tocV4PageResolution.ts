import type { VNextTocV4MeasurementResult } from "./tocV4Measurement.js"
import type { VNextTocV4SemanticResult } from "./tocV4Semantic.js"
import {
  VNEXT_DOCUMENT_V4_HEADING_PAGE_MAP_SOURCE,
  VNEXT_TOC_V4_PAGINATION_MANIFEST_SOURCE,
  type VNextDocumentV4HeadingPageMap,
  type VNextTocV4PaginationManifest,
} from "./tocV4ResolutionInputs.js"

export const VNEXT_TOC_V4_PAGE_RESOLUTION_SOURCE = "vnext-toc-v4-page-resolution"
export const VNEXT_TOC_V4_PAGE_RESOLUTION_VERSION = 1 as const

type AcceptedSemantic = Extract<VNextTocV4SemanticResult, { status: "ready" | "partial" }>
type MeasuredToc = Extract<VNextTocV4MeasurementResult, { status: "measured" }>

export interface VNextTocV4ResolvedEntryV1 {
  identity: { tocNodeId: string; headingNodeId: string }
  semantic: {
    label: string
    labelMode: "authored-preview"
    level: 1 | 2 | 3 | 4 | 5 | 6
    sourceOrdinal: number
    tocOrdinal: number
    fieldKeys: string[]
  }
  measurementRef: { measurementFingerprint: string; rowIndex: number }
  tocPlacement: {
    paginationManifestFingerprint: string
    pageIndex: number
    pageFragmentId: string
    rowYPoint: number
  }
  pageNumberCapacity:
    | { status: "within-capacity" | "overflow"; capacityDigits: number; requiredDigits: number }
    | { status: "pending"; capacityDigits: number; requiredDigits: null }
  destination:
    | {
        status: "resolved"
        headingPageMapFingerprint: string
        headingPageIndex: number
        pageNumber: number
        pageNumberText: string
        sourceFragmentId: string
      }
    | {
        status: "unresolved"
        headingPageMapFingerprint: string
        headingPageIndex: null
        pageNumber: null
        pageNumberText: null
        sourceFragmentId: null
      }
}

export type VNextTocV4PageResolutionResultV1 =
  | {
      source: typeof VNEXT_TOC_V4_PAGE_RESOLUTION_SOURCE
      contractVersion: typeof VNEXT_TOC_V4_PAGE_RESOLUTION_VERSION
      status: "resolved" | "partial"
      documentId: string
      tocNodeId: string
      pins: {
        semanticFingerprint: string
        tocSemanticFingerprint: string
        measurementFingerprint: string
        paginationManifestFingerprint: string
        headingPageMapFingerprint: string
        documentPaginationFingerprint: string
      }
      entries: VNextTocV4ResolvedEntryV1[]
      summary: {
        entryCount: number
        resolvedEntryCount: number
        unresolvedEntryCount: number
        extraMapHeadingCount: number
        semanticWarningCount: number
        paginationWarningCount: number
      }
      capacity: {
        status: "within-capacity" | "overflow" | "pending"
        capacityDigits: number
        maximumRequiredDigits: number | null
        overflowEntryCount: number
        overflowHeadingNodeIds: string[]
      }
      readiness: {
        preview: {
          status: "ready" | "blocked"
          labelMode: "authored-preview"
          blockers: Array<"page-references-incomplete" | "page-number-capacity-overflow">
        }
        artifact: {
          status: "ready" | "blocked"
          labelMode: "materialized-required"
          documentCompositionFingerprint: string
          blockers: Array<
            | "page-references-incomplete"
            | "page-number-capacity-overflow"
            | "heading-label-materialization-pending"
          >
        }
      }
      contracts: {
        measurement: "not-run"
        pagination: "not-run"
        relayout: false
        rendering: "not-run"
        persistence: "not-run"
        authoredMutation: false
      }
      fingerprint: string
      issues: Array<{
        code: "heading-destination-missing" | "page-number-capacity-overflow"
        severity: "warning"
        path: string
        message: string
        headingNodeId: string
      }>
    }
  | {
      source: typeof VNEXT_TOC_V4_PAGE_RESOLUTION_SOURCE
      contractVersion: typeof VNEXT_TOC_V4_PAGE_RESOLUTION_VERSION
      status: "blocked"
      tocNodeId: string
      entries: null
      issues: Array<{ code: string; severity: "error"; path: string; message: string; headingNodeId?: string }>
    }

function issue(code: string, path: string, message: string, headingNodeId?: string) {
  return {
    code, severity: "error" as const, path, message,
    ...(headingNodeId == null ? {} : { headingNodeId }),
  }
}

function warning(
  code: "heading-destination-missing" | "page-number-capacity-overflow",
  path: string,
  message: string,
  headingNodeId: string,
) {
  return { code, severity: "warning" as const, path, message, headingNodeId }
}

function blocked(
  tocNodeId: string,
  issues: ReturnType<typeof issue>[],
): VNextTocV4PageResolutionResultV1 {
  return {
    source: VNEXT_TOC_V4_PAGE_RESOLUTION_SOURCE,
    contractVersion: VNEXT_TOC_V4_PAGE_RESOLUTION_VERSION,
    status: "blocked", tocNodeId, entries: null, issues,
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function resolveVNextTocV4PageReferences(input: {
  semantic: VNextTocV4SemanticResult
  measurement: VNextTocV4MeasurementResult
  paginationManifest: VNextTocV4PaginationManifest
  headingPageMap: VNextDocumentV4HeadingPageMap
  tocNodeId: string
}): VNextTocV4PageResolutionResultV1 {
  const issues: ReturnType<typeof issue>[] = []
  if (input.semantic.status === "blocked") issues.push(issue(
    "semantic-plan-blocked", "semantic", "page resolution requires a ready or partial TOC semantic plan",
  ))
  if (input.measurement.status !== "measured") issues.push(issue(
    "measurement-blocked", "measurement", "page resolution requires measured TOC geometry",
  ))
  if (input.paginationManifest.source !== VNEXT_TOC_V4_PAGINATION_MANIFEST_SOURCE
    || input.paginationManifest.kind !== "toc-pagination-manifest"
    || !input.paginationManifest.cursorAfter.complete) issues.push(issue(
    "pagination-manifest-invalid", "paginationManifest", "page resolution requires a complete TOC pagination manifest",
  ))
  if (input.headingPageMap.source !== VNEXT_DOCUMENT_V4_HEADING_PAGE_MAP_SOURCE
    || input.headingPageMap.status !== "complete") issues.push(issue(
    "heading-page-map-invalid", "headingPageMap", "page resolution requires a complete document-v4 heading-page map",
  ))
  if (issues.length > 0 || input.semantic.status === "blocked" || input.measurement.status !== "measured") {
    return blocked(input.tocNodeId, issues)
  }
  const semantic: AcceptedSemantic = input.semantic
  const measurement: MeasuredToc = input.measurement
  const semanticToc = semantic.tocs.find((toc) => toc.tocNodeId === input.tocNodeId)
  if (semanticToc == null) return blocked(input.tocNodeId, [issue(
    "semantic-toc-missing", "tocNodeId", `TOC "${input.tocNodeId}" is missing from semantic plan`,
  )])
  if (measurement.documentId !== semantic.documentId
    || measurement.tocNodeId !== input.tocNodeId
    || measurement.semanticFingerprint !== semantic.fingerprint
    || measurement.tocSemanticFingerprint !== semanticToc.fingerprint) issues.push(issue(
    "measurement-owner-mismatch", "measurement", "measurement must pin the exact semantic document and TOC",
  ))
  if (input.paginationManifest.tocNodeId !== input.tocNodeId
    || input.paginationManifest.measurementFingerprint !== measurement.fingerprint) issues.push(issue(
    "pagination-manifest-owner-mismatch", "paginationManifest", "pagination manifest must pin the exact measured TOC",
  ))
  if (input.headingPageMap.documentId !== semantic.documentId) issues.push(issue(
    "heading-page-map-document-mismatch", "headingPageMap.documentId", "heading-page map must belong to the semantic document",
  ))
  if (measurement.rows.length !== semanticToc.entries.length
    || input.paginationManifest.summary.rowCount !== semanticToc.entries.length) issues.push(issue(
    "entry-row-count-mismatch", "measurement.rows", "semantic entries, measured rows, and manifest placements must have equal counts",
  ))
  if (issues.length > 0) return blocked(input.tocNodeId, issues)

  const placementByRowIndex = new Map(input.paginationManifest.pages.flatMap((page) => (
    page.rows.map((placement) => [placement.rowIndex, { page, placement }] as const)
  )))
  const destinationByHeadingId = new Map(input.headingPageMap.entries.map((entry) => [entry.headingNodeId, entry]))
  const entries: VNextTocV4ResolvedEntryV1[] = []
  const warnings: ReturnType<typeof warning>[] = []
  semanticToc.entries.forEach((semanticEntry, rowIndex) => {
    const measuredRow = measurement.rows[rowIndex]
    const placed = placementByRowIndex.get(rowIndex)
    const destination = destinationByHeadingId.get(semanticEntry.headingNodeId)
    if (measuredRow == null || measuredRow.headingNodeId !== semanticEntry.headingNodeId
      || JSON.stringify(measuredRow.identity) !== JSON.stringify(semanticEntry.identity)) issues.push(issue(
      "measured-entry-identity-mismatch", `measurement.rows[${rowIndex}]`, "measured row identity must match semantic entry",
      semanticEntry.headingNodeId,
    ))
    if (placed == null || placed.placement.headingNodeId !== semanticEntry.headingNodeId
      || JSON.stringify(placed.placement.identity) !== JSON.stringify(semanticEntry.identity)) issues.push(issue(
      "toc-placement-identity-mismatch", `paginationManifest.rows[${rowIndex}]`, "TOC placement must match semantic entry identity",
      semanticEntry.headingNodeId,
    ))
    if (destination == null) warnings.push(warning(
      "heading-destination-missing", `headingPageMap.entries`, `heading "${semanticEntry.headingNodeId}" has no destination`,
      semanticEntry.headingNodeId,
    ))
    else if (destination.sectionId !== semanticEntry.sectionId) issues.push(issue(
      "heading-destination-section-mismatch", `headingPageMap.entries.${semanticEntry.headingNodeId}`,
      "heading destination section must match semantic entry section", semanticEntry.headingNodeId,
    ))
    if (measuredRow == null || placed == null) return
    const capacityDigits = measuredRow.pageNumber.capacityDigits
    const requiredDigits = destination == null ? null : String(destination.pageNumber).length
    if (requiredDigits != null && requiredDigits > capacityDigits) warnings.push(warning(
      "page-number-capacity-overflow", `headingPageMap.entries.${semanticEntry.headingNodeId}.pageNumber`,
      `page number ${destination!.pageNumber} requires ${requiredDigits} digits but measured capacity is ${capacityDigits}`,
      semanticEntry.headingNodeId,
    ))
    entries.push({
      identity: clone(semanticEntry.identity),
      semantic: {
        label: semanticEntry.label.text, labelMode: "authored-preview", level: semanticEntry.level,
        sourceOrdinal: semanticEntry.sourceOrdinal, tocOrdinal: semanticEntry.tocOrdinal,
        fieldKeys: clone(semanticEntry.label.fieldKeys),
      },
      measurementRef: { measurementFingerprint: measurement.fingerprint, rowIndex },
      tocPlacement: {
        paginationManifestFingerprint: input.paginationManifest.fingerprint,
        pageIndex: placed.page.pageIndex, pageFragmentId: placed.page.fragmentId,
        rowYPoint: placed.placement.yPt,
      },
      pageNumberCapacity: requiredDigits == null
        ? { status: "pending", capacityDigits, requiredDigits: null }
        : {
            status: requiredDigits > capacityDigits ? "overflow" : "within-capacity",
            capacityDigits, requiredDigits,
          },
      destination: destination == null
        ? {
            status: "unresolved", headingPageMapFingerprint: input.headingPageMap.fingerprint,
            headingPageIndex: null, pageNumber: null, pageNumberText: null, sourceFragmentId: null,
          }
        : {
            status: "resolved", headingPageMapFingerprint: input.headingPageMap.fingerprint,
            headingPageIndex: destination.pageIndex, pageNumber: destination.pageNumber,
            pageNumberText: String(destination.pageNumber), sourceFragmentId: destination.sourceFragmentId,
          },
    })
  })
  if (issues.length > 0) return blocked(input.tocNodeId, issues)
  const requiredHeadingIds = new Set(semanticToc.entries.map((entry) => entry.headingNodeId))
  const unresolvedEntryCount = entries.filter((entry) => entry.destination.status === "unresolved").length
  const overflowEntries = entries.filter((entry) => entry.pageNumberCapacity.status === "overflow")
  const requiredDigitCounts = entries.flatMap((entry) => (
    entry.pageNumberCapacity.requiredDigits == null ? [] : [entry.pageNumberCapacity.requiredDigits]
  ))
  const capacityStatus = overflowEntries.length > 0
    ? "overflow" as const
    : unresolvedEntryCount > 0 ? "pending" as const : "within-capacity" as const
  const sharedRenderBlockers: Array<"page-references-incomplete" | "page-number-capacity-overflow"> = []
  if (unresolvedEntryCount > 0) sharedRenderBlockers.push("page-references-incomplete")
  if (overflowEntries.length > 0) sharedRenderBlockers.push("page-number-capacity-overflow")
  const materializationPending = semanticToc.entries.some((entry) => entry.label.materialization === "pending")
  const artifactBlockers: Array<
    "page-references-incomplete" | "page-number-capacity-overflow" | "heading-label-materialization-pending"
  > = [...sharedRenderBlockers]
  if (materializationPending) artifactBlockers.push("heading-label-materialization-pending")
  const facts = {
    documentId: semantic.documentId, tocNodeId: input.tocNodeId,
    pins: {
      semanticFingerprint: semantic.fingerprint, tocSemanticFingerprint: semanticToc.fingerprint,
      measurementFingerprint: measurement.fingerprint,
      paginationManifestFingerprint: input.paginationManifest.fingerprint,
      headingPageMapFingerprint: input.headingPageMap.fingerprint,
      documentPaginationFingerprint: input.headingPageMap.documentPaginationFingerprint,
    },
    entries,
    summary: {
      entryCount: entries.length,
      resolvedEntryCount: entries.length - unresolvedEntryCount,
      unresolvedEntryCount,
      extraMapHeadingCount: input.headingPageMap.entries.filter((entry) => !requiredHeadingIds.has(entry.headingNodeId)).length,
      semanticWarningCount: semantic.issues.filter((item) => item.severity === "warning").length,
      paginationWarningCount: input.paginationManifest.pages.reduce((total, page) => total + page.warnings.length, 0),
    },
    capacity: {
      status: capacityStatus,
      capacityDigits: measurement.pageNumberProof.capacityDigits,
      maximumRequiredDigits: requiredDigitCounts.length === 0 ? null : Math.max(...requiredDigitCounts),
      overflowEntryCount: overflowEntries.length,
      overflowHeadingNodeIds: overflowEntries.map((entry) => entry.identity.headingNodeId),
    },
    readiness: {
      preview: {
        status: sharedRenderBlockers.length === 0 ? "ready" as const : "blocked" as const,
        labelMode: "authored-preview" as const,
        blockers: sharedRenderBlockers,
      },
      artifact: {
        status: artifactBlockers.length === 0 ? "ready" as const : "blocked" as const,
        labelMode: "materialized-required" as const,
        documentCompositionFingerprint: input.headingPageMap.documentPaginationFingerprint,
        blockers: artifactBlockers,
      },
    },
    contracts: {
      measurement: "not-run" as const, pagination: "not-run" as const, relayout: false as const,
      rendering: "not-run" as const, persistence: "not-run" as const, authoredMutation: false as const,
    },
  }
  return {
    source: VNEXT_TOC_V4_PAGE_RESOLUTION_SOURCE,
    contractVersion: VNEXT_TOC_V4_PAGE_RESOLUTION_VERSION,
    status: unresolvedEntryCount > 0 ? "partial" : "resolved",
    ...facts, fingerprint: JSON.stringify(facts), issues: warnings,
  }
}
