import type {
  DocumentNodeV4Target,
  DocumentSectionV4Target,
} from "../schema/documentV4Target.js"
import { VNEXT_DOCUMENT_V4_MAX_COLUMNS_NESTING_DEPTH } from "../schema/documentV4Structure.js"

export const VNEXT_COLUMNS_V4_CONTRACT_SOURCE = "vnext-columns-v4-contract"
export const VNEXT_COLUMNS_V4_CONTRACT_VERSION = 1 as const

type ColumnsNode = Extract<DocumentSectionV4Target["nodes"][string], { type: "columns" }>
type ColumnNode = Extract<DocumentSectionV4Target["nodes"][string], { type: "column" }>

export interface VNextColumnsV4PlannerCapabilities {
  maxNestingDepth: typeof VNEXT_DOCUMENT_V4_MAX_COLUMNS_NESTING_DEPTH
  minimumTrackWidthPt: number
}

export interface VNextColumnsV4TrackGeometry {
  columnId: string
  columnIndex: number
  widthShare: number
  xOffsetPt: number
  widthPt: number
}

export interface VNextColumnsV4Geometry {
  columnsId: string
  sectionId: string
  availableWidthPt: number
  gapPt: number
  contentWidthPt: number
  tracks: VNextColumnsV4TrackGeometry[]
  fingerprint: string
}

export interface VNextColumnsV4Issue {
  code: string
  message: string
  path: string
  severity: "error"
  columnsId?: string
  columnId?: string
}

export type VNextColumnsV4GeometryResult =
  | {
      source: typeof VNEXT_COLUMNS_V4_CONTRACT_SOURCE
      version: typeof VNEXT_COLUMNS_V4_CONTRACT_VERSION
      status: "ready"
      geometry: VNextColumnsV4Geometry
      issues: []
    }
  | {
      source: typeof VNEXT_COLUMNS_V4_CONTRACT_SOURCE
      version: typeof VNEXT_COLUMNS_V4_CONTRACT_VERSION
      status: "blocked"
      geometry: null
      issues: VNextColumnsV4Issue[]
    }

export interface VNextColumnsV4ChildCursor {
  childIndex: number
  childNodeId: string | null
  fragmentIndex: number
  nestedColumnsCursor?: VNextColumnsV4Cursor
}

export interface VNextColumnsV4ColumnCursor {
  columnId: string
  complete: boolean
  child: VNextColumnsV4ChildCursor
}

export interface VNextColumnsV4Cursor {
  columnsId: string
  columnsDepth: number
  columns: VNextColumnsV4ColumnCursor[]
}

export interface VNextColumnsV4LegalCheckpoint {
  checkpointIndex: number
  usedHeightPt: number
  cursor: VNextColumnsV4ChildCursor
}

export type VNextColumnsV4ImpactChangeKind =
  | "gap"
  | "minimum-height"
  | "structure"
  | "track-width"

export interface VNextColumnsV4ImpactFacts {
  source: typeof VNEXT_COLUMNS_V4_CONTRACT_SOURCE
  version: typeof VNEXT_COLUMNS_V4_CONTRACT_VERSION
  columnsId: string
  changeKind: VNextColumnsV4ImpactChangeKind
  affectedNodeIds: string[]
  invalidationLanes: Array<"measurement" | "pagination" | "render">
  earliestLayoutAnchor: { kind: "node"; nodeId: string }
}

function issue(
  code: string,
  path: string,
  message: string,
  facts: Pick<VNextColumnsV4Issue, "columnsId" | "columnId"> = {},
): VNextColumnsV4Issue {
  return { code, path, message, severity: "error", ...facts }
}

function blocked(issues: VNextColumnsV4Issue[]): VNextColumnsV4GeometryResult {
  return {
    source: VNEXT_COLUMNS_V4_CONTRACT_SOURCE,
    version: VNEXT_COLUMNS_V4_CONTRACT_VERSION,
    status: "blocked",
    geometry: null,
    issues,
  }
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function findSection(
  document: DocumentNodeV4Target,
  sectionId: string,
): DocumentSectionV4Target | null {
  return document.document.sections.find((section) => section.id === sectionId) ?? null
}

export function createVNextColumnsV4Geometry(
  document: DocumentNodeV4Target,
  input: {
    sectionId: string
    columnsId: string
    availableWidthPt: number
    capabilities: VNextColumnsV4PlannerCapabilities
  },
): VNextColumnsV4GeometryResult {
  const issues: VNextColumnsV4Issue[] = []
  if (!Number.isFinite(input.availableWidthPt) || input.availableWidthPt <= 0) {
    issues.push(issue("invalid-available-width", "availableWidthPt", "available width must be positive and finite"))
  }
  if (!Number.isFinite(input.capabilities.minimumTrackWidthPt)
    || input.capabilities.minimumTrackWidthPt <= 0) {
    issues.push(issue(
      "invalid-minimum-track-width",
      "capabilities.minimumTrackWidthPt",
      "minimum track width must be positive and finite",
    ))
  }
  if (input.capabilities.maxNestingDepth !== VNEXT_DOCUMENT_V4_MAX_COLUMNS_NESTING_DEPTH) {
    issues.push(issue(
      "unsupported-columns-nesting-capability",
      "capabilities.maxNestingDepth",
      `v1 requires max nesting depth ${VNEXT_DOCUMENT_V4_MAX_COLUMNS_NESTING_DEPTH}`,
    ))
  }
  const section = findSection(document, input.sectionId)
  if (!section) issues.push(issue("section-not-found", "sectionId", `section "${input.sectionId}" was not found`))
  const candidate = section?.nodes[input.columnsId]
  const columns: ColumnsNode | null = candidate?.type === "columns" ? candidate : null
  if (!columns) issues.push(issue(
    "columns-not-found", "columnsId", `columns "${input.columnsId}" was not found`, { columnsId: input.columnsId },
  ))
  if (issues.length > 0 || !section || !columns) return blocked(issues)

  const gapPt = columns.props.gap ?? 0
  const totalGapPt = gapPt * Math.max(0, columns.columnIds.length - 1)
  const contentWidthPt = input.availableWidthPt - totalGapPt
  if (contentWidthPt <= 0) issues.push(issue(
    "columns-gap-exceeds-width",
    "columns.props.gap",
    `columns gap ${gapPt} leaves no positive track width`,
    { columnsId: columns.id },
  ))
  const columnNodes: ColumnNode[] = []
  columns.columnIds.forEach((columnId, columnIndex) => {
    const column = section.nodes[columnId]
    if (column?.type !== "column" || column.props.widthShare == null) {
      issues.push(issue(
        "invalid-column-reference",
        `columns.columnIds[${columnIndex}]`,
        `columns "${columns.id}" requires column "${columnId}" with widthShare`,
        { columnsId: columns.id, columnId },
      ))
    } else {
      columnNodes.push(column)
    }
  })
  if (issues.length > 0) return blocked(issues)

  let xOffsetPt = 0
  const tracks = columnNodes.map((column, columnIndex): VNextColumnsV4TrackGeometry => {
    const widthPt = columnIndex === columnNodes.length - 1
      ? roundPt(input.availableWidthPt - xOffsetPt)
      : roundPt(contentWidthPt * ((column.props.widthShare as number) / 100))
    const track = {
      columnId: column.id,
      columnIndex,
      widthShare: column.props.widthShare as number,
      xOffsetPt: roundPt(xOffsetPt),
      widthPt,
    }
    xOffsetPt += widthPt + gapPt
    return track
  })
  tracks.forEach((track, index) => {
    if (track.widthPt < input.capabilities.minimumTrackWidthPt) issues.push(issue(
      "track-width-below-minimum",
      `tracks[${index}].widthPt`,
      `column "${track.columnId}" width ${track.widthPt} is below minimum ${input.capabilities.minimumTrackWidthPt}`,
      { columnsId: columns.id, columnId: track.columnId },
    ))
  })
  if (issues.length > 0) return blocked(issues)

  const fingerprint = [
    columns.id,
    roundPt(input.availableWidthPt),
    roundPt(gapPt),
    ...tracks.flatMap((track) => [track.columnId, track.widthShare, track.widthPt]),
  ].join(":")
  return {
    source: VNEXT_COLUMNS_V4_CONTRACT_SOURCE,
    version: VNEXT_COLUMNS_V4_CONTRACT_VERSION,
    status: "ready",
    geometry: {
      columnsId: columns.id,
      sectionId: section.id,
      availableWidthPt: roundPt(input.availableWidthPt),
      gapPt: roundPt(gapPt),
      contentWidthPt: roundPt(contentWidthPt),
      tracks,
      fingerprint,
    },
    issues: [],
  }
}

export function createVNextColumnsV4ImpactFacts(input: {
  columnsId: string
  descendantNodeIds: readonly string[]
  changeKind: VNextColumnsV4ImpactChangeKind
}): VNextColumnsV4ImpactFacts {
  const affectedNodeIds = [...new Set([input.columnsId, ...input.descendantNodeIds])]
  const invalidationLanes: VNextColumnsV4ImpactFacts["invalidationLanes"] = input.changeKind === "minimum-height"
    ? ["pagination", "render"]
    : ["measurement", "pagination", "render"]
  return {
    source: VNEXT_COLUMNS_V4_CONTRACT_SOURCE,
    version: VNEXT_COLUMNS_V4_CONTRACT_VERSION,
    columnsId: input.columnsId,
    changeKind: input.changeKind,
    affectedNodeIds,
    invalidationLanes,
    earliestLayoutAnchor: { kind: "node", nodeId: input.columnsId },
  }
}
