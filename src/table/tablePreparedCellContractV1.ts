import type { VNextTextBlockV4MeasurementSourcePoint } from "../pagination/textBlockV4Measurement.js"
import type { VNextTableCellInsetsPtV1 } from "./tableCellGeometryV1.js"

export const VNEXT_TABLE_PREPARED_CELL_VERSION = 1 as const
export const VNEXT_TABLE_PREPARED_CELL_SOURCE = "vnext-table-prepared-cell"

interface VNextTablePreparedCandidateBaseV1 {
  candidateId: string
  nodeId: string
  candidateIndex: number
  heightPt: number
  breakAfter: true
}

export interface VNextTablePreparedTextLineCandidateV1 extends VNextTablePreparedCandidateBaseV1 {
  kind: "text-line"
  atomic: false
  text: string
  widthPt: number
  sourceStart: VNextTextBlockV4MeasurementSourcePoint
  sourceEnd: VNextTextBlockV4MeasurementSourcePoint
}

export interface VNextTablePreparedImageCandidateV1 extends VNextTablePreparedCandidateBaseV1 {
  kind: "image"
  atomic: true
  widthPt: number
  align: "left" | "center" | "right"
  assetId: string | null
  assetOwner: "published-static-media" | "instance-media" | "none"
}

export interface VNextTablePreparedDividerCandidateV1 extends VNextTablePreparedCandidateBaseV1 {
  kind: "divider"
  atomic: true
  marginBeforePt: number
  thicknessPt: number
  marginAfterPt: number
}

export interface VNextTablePreparedSpacerCandidateV1 extends VNextTablePreparedCandidateBaseV1 {
  kind: "spacer"
  atomic: true
}

export type VNextTablePreparedCellCandidateV1 =
  | VNextTablePreparedTextLineCandidateV1
  | VNextTablePreparedImageCandidateV1
  | VNextTablePreparedDividerCandidateV1
  | VNextTablePreparedSpacerCandidateV1

export interface VNextTablePreparedCellChildRangeV1 {
  nodeId: string
  kind: "text-block-lines" | "image" | "divider" | "spacer"
  candidateStartIndex: number
  candidateEndIndexExclusive: number
  heightPt: number
  fingerprint: string
}

export interface VNextTablePreparedCellV1 {
  sourceCellId: string
  cellIdentity:
    | { kind: "resolved-cell"; cellInstanceId: string }
    | { kind: "authored-cell"; sourceCellId: string }
  columnStart: number
  colSpan: number
  xOffsetPt: number
  outerWidthPt: number
  contentWidthPt: number
  insetsPt: VNextTableCellInsetsPtV1
  verticalAlign: "top" | "middle" | "bottom"
  children: VNextTablePreparedCellChildRangeV1[]
  candidates: VNextTablePreparedCellCandidateV1[]
  prefixHeightsPt: number[]
  contentHeightPt: number
  outerHeightPt: number
  completeWhenEmpty: boolean
  fingerprint: string
}

export interface VNextTablePreparedMaterializedRowV1 {
  kind: "prepared-materialized-row"
  rowIndex: number
  rowInstanceId: string
  rowSourceId: string
  rowTemplateId: string
  itemKey: string
  role: "body"
  breakPolicy: "allow" | "prefer-keep" | "strict-keep"
  minimumFirstFragmentHeightPt: number
  cells: VNextTablePreparedCellV1[]
  maximumCellOuterHeightPt: number
  fingerprint: string
}

export interface VNextTablePreparedAuthoredRowV1 {
  kind: "prepared-authored-row"
  rowIndex: number
  sourceRowId: string
  rowSourceId: string
  rowTemplateId: string
  role: "header" | "body" | "footer" | "empty-state"
  breakPolicy: "allow" | "prefer-keep" | "strict-keep"
  minimumFirstFragmentHeightPt: number
  cells: VNextTablePreparedCellV1[]
  maximumCellOuterHeightPt: number
  fingerprint: string
}

export type VNextTablePreparedRowV1 =
  | VNextTablePreparedMaterializedRowV1
  | VNextTablePreparedAuthoredRowV1

export interface VNextTablePreparedCellIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
  nodeId?: string
}

export type VNextTablePreparedMaterializedCellsResultV1 =
  | {
      source: typeof VNEXT_TABLE_PREPARED_CELL_SOURCE
      contractVersion: typeof VNEXT_TABLE_PREPARED_CELL_VERSION
      status: "ready"
      documentId: string
      instanceRevision: number
      tableId: string
      tableDefinitionId: string
      geometryFingerprint: string
      rows: VNextTablePreparedMaterializedRowV1[]
      authoredReferenceRowsPending: number
      work: {
        inputRowCount: number
        preparedRowCount: number
        preparedCellCount: number
        visitedNodeCount: number
        textLineCandidateCount: number
        atomicCandidateCount: number
        candidateCount: number
      }
      execution: { measurement: "accepted-input"; pagination: "not-run"; rendering: "not-run" }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_PREPARED_CELL_SOURCE
      contractVersion: typeof VNEXT_TABLE_PREPARED_CELL_VERSION
      status: "blocked"
      rows: null
      issues: VNextTablePreparedCellIssueV1[]
    }

export type VNextTablePreparedAuthoredCellsResultV1 =
  | {
      source: typeof VNEXT_TABLE_PREPARED_CELL_SOURCE
      contractVersion: typeof VNEXT_TABLE_PREPARED_CELL_VERSION
      status: "ready"
      documentId: string
      instanceRevision: number
      tableId: string
      tableDefinitionId: string
      geometryFingerprint: string
      rows: VNextTablePreparedAuthoredRowV1[]
      work: {
        inputRowCount: number
        preparedRowCount: number
        preparedCellCount: number
        visitedNodeCount: number
        textLineCandidateCount: number
        atomicCandidateCount: number
        candidateCount: number
      }
      execution: { measurement: "accepted-input"; pagination: "not-run"; rendering: "not-run" }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_PREPARED_CELL_SOURCE
      contractVersion: typeof VNEXT_TABLE_PREPARED_CELL_VERSION
      status: "blocked"
      rows: null
      issues: VNextTablePreparedCellIssueV1[]
    }

export type VNextTablePreparedRowsResultV1 =
  | {
      source: typeof VNEXT_TABLE_PREPARED_CELL_SOURCE
      contractVersion: typeof VNEXT_TABLE_PREPARED_CELL_VERSION
      status: "ready"
      documentId: string
      instanceRevision: number
      tableId: string
      tableDefinitionId: string
      geometryFingerprint: string
      rows: VNextTablePreparedRowV1[]
      fingerprint: string
      work: {
        rowCount: number
        authoredRowCount: number
        materializedRowCount: number
        cellCount: number
        candidateCount: number
      }
      execution: { measurement: "accepted-input"; pagination: "not-run"; rendering: "not-run" }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_PREPARED_CELL_SOURCE
      contractVersion: typeof VNEXT_TABLE_PREPARED_CELL_VERSION
      status: "blocked"
      rows: null
      issues: VNextTablePreparedCellIssueV1[]
    }
