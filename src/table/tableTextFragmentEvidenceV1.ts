import {
  acceptVNextTextBlockV4MeasuredLines,
  type VNextTextBlockV4MeasuredLine,
  type VNextTextBlockV4MeasuredLinesResult,
  type VNextTextBlockV4MeasurementRequest,
  type VNextTextBlockV4MeasurementSourcePoint,
} from "../pagination/textBlockV4Measurement.js"
import type { VNextTableTextMeasurementPreparationResultV1 } from "./tableTextMeasurementPreparationV1.js"

export const VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_VERSION = 1 as const
export const VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_SOURCE = "vnext-table-text-fragment-evidence"

type AcceptedMeasuredLines = Extract<VNextTextBlockV4MeasuredLinesResult, { status: "accepted" }>

export interface VNextTableTextMeasurementEvidenceV1 {
  request: VNextTextBlockV4MeasurementRequest
  measured: AcceptedMeasuredLines
}

export interface VNextTableTextFragmentLineCandidateV1 {
  candidateId: string
  nodeId: string
  candidateIndex: number
  kind: "text-line"
  text: string
  widthPt: number
  heightPt: number
  breakAfter: true
  sourceStart: VNextTextBlockV4MeasurementSourcePoint
  sourceEnd: VNextTextBlockV4MeasurementSourcePoint
}

export interface VNextTablePreparedTextFragmentSourceV1 {
  source: typeof VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_SOURCE
  contractVersion: typeof VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_VERSION
  kind: "text-block-lines"
  nodeId: string
  rowIdentity:
    | { kind: "resolved-row"; rowInstanceId: string }
    | { kind: "authored-row"; sourceRowId: string }
  cellIdentity:
    | { kind: "resolved-cell"; cellInstanceId: string }
    | { kind: "authored-cell"; sourceCellId: string }
  sourceCellId: string
  availableWidthPt: number
  measurementProfileId: string
  candidates: VNextTableTextFragmentLineCandidateV1[]
  prefixHeightsPt: number[]
  totalHeightPt: number
  fingerprint: string
}

export interface VNextTableTextFragmentEvidenceIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
  textBlockId?: string
}

export type VNextTableTextFragmentEvidenceResultV1 =
  | {
      source: typeof VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_SOURCE
      contractVersion: typeof VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_VERSION
      status: "ready"
      documentId: string
      instanceRevision: number
      tableId: string
      tableDefinitionId: string
      geometryFingerprint: string
      measurementProfileId: string
      fragmentSourcesByTextBlockId: Record<string, VNextTablePreparedTextFragmentSourceV1>
      work: { requestCount: number; measuredLineCount: number; candidateCount: number }
      execution: { measurement: "accepted-external"; pagination: "not-run"; rendering: "not-run" }
      issues: []
    }
  | {
      source: typeof VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_SOURCE
      contractVersion: typeof VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_VERSION
      status: "blocked"
      fragmentSourcesByTextBlockId: null
      issues: VNextTableTextFragmentEvidenceIssueV1[]
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function issue(
  code: string,
  path: string,
  message: string,
  textBlockId?: string,
): VNextTableTextFragmentEvidenceIssueV1 {
  return { code, path, message, severity: "error", ...(textBlockId == null ? {} : { textBlockId }) }
}

function blocked(issues: VNextTableTextFragmentEvidenceIssueV1[]): VNextTableTextFragmentEvidenceResultV1 {
  return {
    source: VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_SOURCE,
    contractVersion: VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_VERSION,
    status: "blocked",
    fragmentSourcesByTextBlockId: null,
    issues,
  }
}

function exactJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function measuredInputs(lines: readonly VNextTextBlockV4MeasuredLine[]) {
  return lines.map((line) => ({
    index: line.index,
    startOffset: line.startOffset,
    endOffset: line.endOffset,
    text: line.text,
    widthPt: line.widthPt,
    heightPt: line.heightPt,
  }))
}

export function createVNextTableTextFragmentEvidenceV1(input: {
  preparation: VNextTableTextMeasurementPreparationResultV1
  evidenceByTextBlockId: Readonly<Record<string, VNextTableTextMeasurementEvidenceV1>>
}): VNextTableTextFragmentEvidenceResultV1 {
  if (input.preparation.status !== "ready") return blocked([issue(
    "measurement-preparation-not-ready",
    "preparation.status",
    "Table text measurement preparation must be ready before evidence acceptance",
  )])
  const preparation = input.preparation
  const issues: VNextTableTextFragmentEvidenceIssueV1[] = []
  const expectedIds = new Set(Object.keys(preparation.requestsByTextBlockId))
  Object.keys(input.evidenceByTextBlockId).forEach((textBlockId) => {
    if (!expectedIds.has(textBlockId)) issues.push(issue(
      "unexpected-text-measurement-evidence",
      `evidenceByTextBlockId.${textBlockId}`,
      `measurement evidence does not match a prepared request for "${textBlockId}"`,
      textBlockId,
    ))
  })

  const acceptedByTextBlockId = new Map<string, AcceptedMeasuredLines>()
  Object.entries(preparation.requestsByTextBlockId).forEach(([textBlockId, context]) => {
    const evidence = input.evidenceByTextBlockId[textBlockId]
    if (evidence == null) {
      issues.push(issue(
        "missing-text-measurement-evidence",
        `evidenceByTextBlockId.${textBlockId}`,
        `measurement evidence is missing for "${textBlockId}"`,
        textBlockId,
      ))
      return
    }
    if (!exactJson(evidence.request, context.request)) issues.push(issue(
      "measurement-request-drift",
      `evidenceByTextBlockId.${textBlockId}.request`,
      "measurement evidence request must exactly match the prepared width/profile/revision packet",
      textBlockId,
    ))
    if (evidence.measured.textBlockId !== textBlockId) issues.push(issue(
      "measurement-result-node-mismatch",
      `evidenceByTextBlockId.${textBlockId}.measured.textBlockId`,
      `measured result targets "${evidence.measured.textBlockId}" instead of "${textBlockId}"`,
      textBlockId,
    ))
    const reaccepted = acceptVNextTextBlockV4MeasuredLines(context.request, measuredInputs(evidence.measured.lines))
    if (reaccepted.status === "blocked") {
      issues.push(...reaccepted.issues.map((item) => issue(
        item.code,
        `evidenceByTextBlockId.${textBlockId}.measured.${item.path}`,
        item.message,
        textBlockId,
      )))
    } else if (!exactJson(reaccepted, evidence.measured)) issues.push(issue(
      "measurement-result-drift",
      `evidenceByTextBlockId.${textBlockId}.measured`,
      "measured result must equal core re-acceptance including source ranges and summary",
      textBlockId,
    ))
    else acceptedByTextBlockId.set(textBlockId, reaccepted)
  })
  if (issues.length > 0) return blocked(issues)

  let measuredLineCount = 0
  const fragmentSourcesByTextBlockId: Record<string, VNextTablePreparedTextFragmentSourceV1> = {}
  Object.entries(preparation.requestsByTextBlockId).forEach(([textBlockId, context]) => {
    const measured = acceptedByTextBlockId.get(textBlockId)
    if (measured == null) throw new Error("validated Table text evidence missing")
    let totalHeightPt = 0
    const prefixHeightsPt = [0]
    const candidates = measured.lines.map((line, candidateIndex): VNextTableTextFragmentLineCandidateV1 => {
      totalHeightPt = roundPt(totalHeightPt + line.heightPt)
      prefixHeightsPt.push(totalHeightPt)
      return {
        candidateId: `${textBlockId}:table-line-${line.index}`,
        nodeId: textBlockId,
        candidateIndex,
        kind: "text-line",
        text: line.text,
        widthPt: roundPt(line.widthPt),
        heightPt: roundPt(line.heightPt),
        breakAfter: true,
        sourceStart: clone(line.sourceStart),
        sourceEnd: clone(line.sourceEnd),
      }
    })
    measuredLineCount += measured.lines.length
    fragmentSourcesByTextBlockId[textBlockId] = {
      source: VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_SOURCE,
      contractVersion: VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_VERSION,
      kind: "text-block-lines",
      nodeId: textBlockId,
      rowIdentity: clone(context.rowIdentity),
      cellIdentity: clone(context.cellIdentity),
      sourceCellId: context.sourceCellId,
      availableWidthPt: context.request.availableWidthPt,
      measurementProfileId: context.request.measurementProfileId,
      candidates,
      prefixHeightsPt,
      totalHeightPt,
      fingerprint: JSON.stringify([
        textBlockId,
        context.request.documentId,
        context.request.instanceRevision,
        context.request.availableWidthPt,
        context.request.measurementProfileId,
        context.request.styleKey,
        context.request.renderedText,
        ...candidates.flatMap((candidate) => [
          candidate.candidateId,
          candidate.text,
          candidate.widthPt,
          candidate.heightPt,
          candidate.sourceStart.inlineId ?? "empty",
          candidate.sourceStart.authoredOffset,
          candidate.sourceEnd.inlineId ?? "empty",
          candidate.sourceEnd.authoredOffset,
        ]),
      ]),
    }
  })

  return {
    source: VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_SOURCE,
    contractVersion: VNEXT_TABLE_TEXT_FRAGMENT_EVIDENCE_VERSION,
    status: "ready",
    documentId: preparation.documentId,
    instanceRevision: preparation.instanceRevision,
    tableId: preparation.tableId,
    tableDefinitionId: preparation.tableDefinitionId,
    geometryFingerprint: preparation.geometryFingerprint,
    measurementProfileId: preparation.measurementProfileId,
    fragmentSourcesByTextBlockId,
    work: {
      requestCount: Object.keys(preparation.requestsByTextBlockId).length,
      measuredLineCount,
      candidateCount: measuredLineCount,
    },
    execution: { measurement: "accepted-external", pagination: "not-run", rendering: "not-run" },
    issues: [],
  }
}
