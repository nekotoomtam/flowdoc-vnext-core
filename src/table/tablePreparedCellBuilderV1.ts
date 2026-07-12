import type { AuthoredNodeV4Target } from "../schema/documentV4Target.js"
import type { UnitValueV4Target } from "../schema/documentV4Foundation.js"
import type { VNextTableCellGeometryV1 } from "./tableCellGeometryV1.js"
import type { VNextTablePreparedTextFragmentSourceV1 } from "./tableTextFragmentEvidenceV1.js"
import type {
  VNextTablePreparedCellCandidateV1,
  VNextTablePreparedCellChildRangeV1,
  VNextTablePreparedCellIssueV1,
  VNextTablePreparedCellV1,
} from "./tablePreparedCellContractV1.js"

export type VNextTablePreparedRowIdentityV1 =
  | { kind: "resolved-row"; rowInstanceId: string }
  | { kind: "authored-row"; sourceRowId: string }

export type VNextTablePreparedCellIdentityV1 =
  | { kind: "resolved-cell"; cellInstanceId: string }
  | { kind: "authored-cell"; sourceCellId: string }

export interface VNextTablePreparedImageBindingFactV1 {
  assetId: string | null
  assetOwner: "published-static-media" | "instance-media" | "none"
}

export interface VNextTablePreparedCellBuilderWorkV1 {
  visitedNodeCount: number
  textLineCandidateCount: number
  atomicCandidateCount: number
}

export type VNextTablePreparedCellBuilderResultV1 =
  | { status: "ready"; cell: VNextTablePreparedCellV1; work: VNextTablePreparedCellBuilderWorkV1; issues: [] }
  | { status: "blocked"; cell: null; work: VNextTablePreparedCellBuilderWorkV1; issues: VNextTablePreparedCellIssueV1[] }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function unitToPt(value: UnitValueV4Target): number {
  return roundPt(value.unit === "pt" ? value.value : (value.value * 72) / 25.4)
}

function issue(code: string, path: string, message: string, nodeId?: string): VNextTablePreparedCellIssueV1 {
  return { code, path, message, severity: "error", ...(nodeId == null ? {} : { nodeId }) }
}

function sameRowIdentity(left: VNextTablePreparedRowIdentityV1, right: VNextTablePreparedRowIdentityV1): boolean {
  return left.kind === right.kind && (left.kind === "resolved-row"
    ? left.rowInstanceId === (right as Extract<VNextTablePreparedRowIdentityV1, { kind: "resolved-row" }>).rowInstanceId
    : left.sourceRowId === (right as Extract<VNextTablePreparedRowIdentityV1, { kind: "authored-row" }>).sourceRowId)
}

function sameCellIdentity(left: VNextTablePreparedCellIdentityV1, right: VNextTablePreparedCellIdentityV1): boolean {
  return left.kind === right.kind && (left.kind === "resolved-cell"
    ? left.cellInstanceId === (right as Extract<VNextTablePreparedCellIdentityV1, { kind: "resolved-cell" }>).cellInstanceId
    : left.sourceCellId === (right as Extract<VNextTablePreparedCellIdentityV1, { kind: "authored-cell" }>).sourceCellId)
}

function identityKey(identity: VNextTablePreparedRowIdentityV1 | VNextTablePreparedCellIdentityV1): string {
  if (identity.kind === "resolved-row") return identity.rowInstanceId
  if (identity.kind === "authored-row") return identity.sourceRowId
  if (identity.kind === "resolved-cell") return identity.cellInstanceId
  return identity.sourceCellId
}

export function createVNextTablePreparedCellFromContentV1(input: {
  sourceCellId: string
  rowIdentity: VNextTablePreparedRowIdentityV1
  cellIdentity: VNextTablePreparedCellIdentityV1
  verticalAlign: "top" | "middle" | "bottom"
  childIds: readonly string[]
  nodes: Readonly<Record<string, AuthoredNodeV4Target>>
  geometry: VNextTableCellGeometryV1
  textSourcesByNodeId: Readonly<Record<string, VNextTablePreparedTextFragmentSourceV1>>
  imageBindingsByPlacementId: Readonly<Record<string, VNextTablePreparedImageBindingFactV1>>
  path: string
}): VNextTablePreparedCellBuilderResultV1 {
  const issues: VNextTablePreparedCellIssueV1[] = []
  const candidates: VNextTablePreparedCellCandidateV1[] = []
  const children: VNextTablePreparedCellChildRangeV1[] = []
  let visitedNodeCount = 0
  let textLineCandidateCount = 0
  let atomicCandidateCount = 0

  input.childIds.forEach((nodeId, nodeIndex) => {
    visitedNodeCount += 1
    const node = input.nodes[nodeId]
    const childPath = `${input.path}.childIds[${nodeIndex}]`
    if (node == null) {
      issues.push(issue("cell-node-missing", childPath, `cell node "${nodeId}" is missing`, nodeId))
      return
    }
    const candidateStartIndex = candidates.length
    let childHeightPt = 0
    let kind: VNextTablePreparedCellChildRangeV1["kind"]
    let fingerprint: string
    if (node.type === "text-block") {
      const source = input.textSourcesByNodeId[node.id]
      if (source == null) {
        issues.push(issue(
          "missing-text-fragment-source", childPath,
          `text-block "${node.id}" requires accepted Table text fragment evidence`, node.id,
        ))
        return
      }
      if (
        !sameRowIdentity(source.rowIdentity, input.rowIdentity)
        || !sameCellIdentity(source.cellIdentity, input.cellIdentity)
        || source.sourceCellId !== input.sourceCellId
        || source.availableWidthPt !== input.geometry.contentWidthPt
      ) {
        issues.push(issue(
          "text-fragment-context-mismatch", childPath,
          `text fragment source for "${node.id}" does not match row, cell, or content width`, node.id,
        ))
        return
      }
      source.candidates.forEach((candidate) => candidates.push({
        ...clone(candidate),
        candidateIndex: candidates.length,
        atomic: false,
      }))
      textLineCandidateCount += source.candidates.length
      childHeightPt = source.totalHeightPt
      kind = "text-block-lines"
      fingerprint = source.fingerprint
    } else if (node.type === "image") {
      const widthPt = unitToPt(node.props.frame.width)
      const heightPt = unitToPt(node.props.frame.height)
      if (widthPt > input.geometry.contentWidthPt) issues.push(issue(
        "image-frame-exceeds-cell-width", childPath,
        `image "${node.id}" width ${widthPt} exceeds cell content width ${input.geometry.contentWidthPt}`, node.id,
      ))
      const binding = node.source.kind === "image-field-ref" ? input.imageBindingsByPlacementId[node.id] : undefined
      if (node.source.kind === "image-field-ref" && binding == null) issues.push(issue(
        "missing-block-image-binding", childPath,
        `image field placement "${node.id}" requires a resolved binding`, node.id,
      ))
      const assetId = node.source.kind === "asset-ref" ? node.source.assetId : binding?.assetId ?? null
      const assetOwner = node.source.kind === "asset-ref" ? "published-static-media" as const : binding?.assetOwner ?? "none"
      candidates.push({
        candidateId: `${node.id}:table-atomic`, nodeId: node.id, candidateIndex: candidates.length,
        kind: "image", atomic: true, widthPt, heightPt, align: node.props.align ?? "left",
        assetId, assetOwner, breakAfter: true,
      })
      atomicCandidateCount += 1
      childHeightPt = heightPt
      kind = "image"
      fingerprint = JSON.stringify([
        node.id, "image", widthPt, heightPt, node.props.align ?? "left", assetId, assetOwner,
      ])
    } else if (node.type === "divider") {
      const marginBeforePt = unitToPt(node.props.marginBefore)
      const thicknessPt = unitToPt(node.props.thickness)
      const marginAfterPt = unitToPt(node.props.marginAfter)
      const heightPt = roundPt(marginBeforePt + thicknessPt + marginAfterPt)
      candidates.push({
        candidateId: `${node.id}:table-atomic`, nodeId: node.id, candidateIndex: candidates.length,
        kind: "divider", atomic: true, heightPt, marginBeforePt, thicknessPt, marginAfterPt, breakAfter: true,
      })
      atomicCandidateCount += 1
      childHeightPt = heightPt
      kind = "divider"
      fingerprint = JSON.stringify([node.id, "divider", marginBeforePt, thicknessPt, marginAfterPt])
    } else if (node.type === "spacer") {
      const heightPt = roundPt(node.props.height)
      candidates.push({
        candidateId: `${node.id}:table-atomic`, nodeId: node.id, candidateIndex: candidates.length,
        kind: "spacer", atomic: true, heightPt, breakAfter: true,
      })
      atomicCandidateCount += 1
      childHeightPt = heightPt
      kind = "spacer"
      fingerprint = JSON.stringify([node.id, "spacer", heightPt])
    } else {
      issues.push(issue(
        "unsupported-table-cell-child", childPath,
        `${node.type} "${node.id}" has no prepared Table fragment contract`, node.id,
      ))
      return
    }
    children.push({
      nodeId: node.id,
      kind,
      candidateStartIndex,
      candidateEndIndexExclusive: candidates.length,
      heightPt: childHeightPt,
      fingerprint,
    })
  })

  const work = { visitedNodeCount, textLineCandidateCount, atomicCandidateCount }
  if (issues.length > 0) return { status: "blocked", cell: null, work, issues }
  let contentHeightPt = 0
  const prefixHeightsPt = [0]
  candidates.forEach((candidate, candidateIndex) => {
    candidate.candidateIndex = candidateIndex
    contentHeightPt = roundPt(contentHeightPt + candidate.heightPt)
    prefixHeightsPt.push(contentHeightPt)
  })
  const outerHeightPt = roundPt(input.geometry.insetsPt.top + contentHeightPt + input.geometry.insetsPt.bottom)
  const cell: VNextTablePreparedCellV1 = {
    sourceCellId: input.sourceCellId,
    cellIdentity: clone(input.cellIdentity),
    columnStart: input.geometry.columnStart,
    colSpan: input.geometry.colSpan,
    xOffsetPt: input.geometry.xOffsetPt,
    outerWidthPt: input.geometry.outerWidthPt,
    contentWidthPt: input.geometry.contentWidthPt,
    insetsPt: clone(input.geometry.insetsPt),
    verticalAlign: input.verticalAlign,
    children,
    candidates,
    prefixHeightsPt,
    contentHeightPt,
    outerHeightPt,
    completeWhenEmpty: candidates.length === 0,
    fingerprint: JSON.stringify([
      identityKey(input.rowIdentity),
      identityKey(input.cellIdentity),
      input.verticalAlign,
      input.geometry.fingerprint,
      ...children.map((child) => child.fingerprint),
      ...prefixHeightsPt,
    ]),
  }
  return { status: "ready", cell, work, issues: [] }
}
