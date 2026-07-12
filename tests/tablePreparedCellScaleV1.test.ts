import { describe, expect, it } from "vitest"
import {
  createVNextTableCellGeometryV1,
  createVNextTablePreparedMaterializedCellsV1,
  createVNextTablePreparedRowsV1,
  type VNextTableContentMaterializationResultV1,
  type VNextTableDefinitionV1,
  type VNextTablePreparedAuthoredCellsResultV1,
  type VNextTableTextFragmentEvidenceResultV1,
} from "../src/index.js"

const ROW_COUNT = 1_000

function definition(): VNextTableDefinitionV1 {
  return {
    contractVersion: 1,
    kind: "table-definition",
    tableDefinitionId: "scale-definition",
    owner: {
      kind: "published-structure-version",
      ref: { structureId: "scale", structureVersionId: "scale-v1", versionOrdinal: 1 },
    },
    tableId: "scale-table",
    headerPolicy: "no-repeat",
    columns: [{ columnId: "content", widthShare: 100 }],
    rowSources: [{
      kind: "collection-rows", rowSourceId: "items-source", collectionFieldKey: "items",
      rowTemplateId: "item-template", role: "body", emptyPolicy: { kind: "header-only" },
    }],
    rowTemplates: {
      "item-template": {
        rowTemplateId: "item-template", sourceRowId: "item-row", breakPolicy: "allow",
        cells: [{ cellId: "item-cell", columnStart: 0, colSpan: 1, rowSpan: 1 }],
      },
    },
  }
}

function geometry() {
  return createVNextTableCellGeometryV1({
    contractVersion: 1,
    kind: "table-cell-geometry-request",
    definition: definition(),
    tableContentWidthPt: 400,
    layoutProfile: {
      contractVersion: 1,
      kind: "table-cell-layout-profile",
      layoutProfileId: "scale-layout-v1",
      defaultInsetsPt: { top: 2, right: 4, bottom: 2, left: 4 },
      insetsByRowTemplate: {},
    },
  })
}

function materialization(): Extract<VNextTableContentMaterializationResultV1, { status: "materialized" }> {
  const rows = Array.from({ length: ROW_COUNT }, (_, index) => {
    const suffix = String(index + 1).padStart(12, "0")
    const rowInstanceId = `rowi_${suffix}`
    const cellInstanceId = `celli_${suffix}`
    const nodeId = `nodei_${suffix}`
    const inlineId = `inli_${suffix}`
    return {
      kind: "materialized-content" as const,
      rowInstanceId,
      rowSourceId: "items-source",
      rowTemplateId: "item-template",
      itemKey: `item-${index + 1}`,
      cells: [{
        sourceCellId: "item-cell",
        cellInstanceId,
        verticalAlign: "top" as const,
        childIds: [nodeId],
        nodes: {
          [nodeId]: {
            id: nodeId,
            type: "text-block" as const,
            role: { role: "paragraph" as const },
            props: {},
            children: [{ id: inlineId, type: "text" as const, text: `Item ${index + 1}` }],
          },
        },
      }],
    }
  })
  return {
    source: "vnext-table-content-materialization",
    contractVersion: 1,
    status: "materialized",
    documentId: "scale-instance",
    tableId: "scale-table",
    tableDefinitionId: "scale-definition",
    instanceRevision: 1,
    resolutionInputFingerprint: "scale-resolution-1",
    rows,
    bindings: { text: [], images: [] },
    provenance: [],
    work: {
      rowCount: ROW_COUNT, materializedRowCount: ROW_COUNT, authoredReferenceRowCount: 0,
      cellCount: ROW_COUNT, clonedNodeCount: ROW_COUNT, clonedInlineCount: ROW_COUNT,
      textBindingCount: 0, imageBindingCount: 0,
      sourcePlanDocumentRootScans: 1, materializationDocumentRootScans: 1,
    },
    execution: {
      identityAllocation: "not-run", authoredGraphMutation: false, mediaFetch: "not-run",
      measurement: "not-run", pagination: "not-run", rendering: "not-run",
    },
    issues: [],
  }
}

function textEvidence(): Extract<VNextTableTextFragmentEvidenceResultV1, { status: "ready" }> {
  const readyGeometry = geometry()
  if (readyGeometry.status !== "ready") throw new Error("fixture geometry blocked")
  const fragmentSourcesByTextBlockId = Object.fromEntries(Array.from({ length: ROW_COUNT }, (_, index) => {
    const suffix = String(index + 1).padStart(12, "0")
    const rowInstanceId = `rowi_${suffix}`
    const cellInstanceId = `celli_${suffix}`
    const nodeId = `nodei_${suffix}`
    const inlineId = `inli_${suffix}`
    const text = `Item ${index + 1}`
    return [nodeId, {
      source: "vnext-table-text-fragment-evidence" as const,
      contractVersion: 1 as const,
      kind: "text-block-lines" as const,
      nodeId,
      rowIdentity: { kind: "resolved-row" as const, rowInstanceId },
      cellIdentity: { kind: "resolved-cell" as const, cellInstanceId },
      sourceCellId: "item-cell",
      availableWidthPt: 392,
      measurementProfileId: "scale-profile-v1",
      candidates: [{
        candidateId: `${nodeId}:table-line-0`,
        nodeId,
        candidateIndex: 0,
        kind: "text-line" as const,
        text,
        widthPt: 40,
        heightPt: 12,
        breakAfter: true as const,
        sourceStart: {
          textBlockId: nodeId, inlineId, authoredOffset: 0,
          resolvedOffset: 0, affinity: "forward" as const,
        },
        sourceEnd: {
          textBlockId: nodeId, inlineId, authoredOffset: text.length,
          resolvedOffset: text.length, affinity: "backward" as const,
        },
      }],
      prefixHeightsPt: [0, 12],
      totalHeightPt: 12,
      fingerprint: `${nodeId}:scale-line:12`,
    }]
  }))
  return {
    source: "vnext-table-text-fragment-evidence",
    contractVersion: 1,
    status: "ready",
    documentId: "scale-instance",
    instanceRevision: 1,
    tableId: "scale-table",
    tableDefinitionId: "scale-definition",
    geometryFingerprint: readyGeometry.geometry.fingerprint,
    measurementProfileId: "scale-profile-v1",
    fragmentSourcesByTextBlockId,
    work: { requestCount: ROW_COUNT, measuredLineCount: ROW_COUNT, candidateCount: ROW_COUNT },
    execution: { measurement: "accepted-external", pagination: "not-run", rendering: "not-run" },
    issues: [],
  }
}

function authoredEmpty(geometryFingerprint: string): Extract<VNextTablePreparedAuthoredCellsResultV1, { status: "ready" }> {
  return {
    source: "vnext-table-prepared-cell",
    contractVersion: 1,
    status: "ready",
    documentId: "scale-instance",
    instanceRevision: 1,
    tableId: "scale-table",
    tableDefinitionId: "scale-definition",
    geometryFingerprint,
    rows: [],
    work: {
      inputRowCount: ROW_COUNT, preparedRowCount: 0, preparedCellCount: 0, visitedNodeCount: 0,
      textLineCandidateCount: 0, atomicCandidateCount: 0, candidateCount: 0,
    },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" },
    issues: [],
  }
}

describe("prepared Table cell scale v1", () => {
  it("prepares 1,000 rows deterministically with exact linear work facts", () => {
    const content = materialization()
    const cells = geometry()
    const text = textEvidence()
    const before = JSON.stringify({ content, cells, text })
    const first = createVNextTablePreparedMaterializedCellsV1({
      definition: definition(), materialization: content, geometry: cells, textEvidence: text,
    })
    const second = createVNextTablePreparedMaterializedCellsV1({
      definition: definition(), materialization: content, geometry: cells, textEvidence: text,
    })

    expect(first.status).toBe("ready")
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    if (first.status !== "ready") throw new Error(first.issues.map((item) => item.message).join("\n"))
    expect(first.rows).toHaveLength(ROW_COUNT)
    expect(first.work).toEqual({
      inputRowCount: ROW_COUNT,
      preparedRowCount: ROW_COUNT,
      preparedCellCount: ROW_COUNT,
      visitedNodeCount: ROW_COUNT,
      textLineCandidateCount: ROW_COUNT,
      atomicCandidateCount: 0,
      candidateCount: ROW_COUNT,
    })
    expect(first.rows[0].cells[0]).toMatchObject({
      contentWidthPt: 392, prefixHeightsPt: [0, 12], contentHeightPt: 12, outerHeightPt: 16,
    })
    expect(first.execution).toEqual({ measurement: "accepted-input", pagination: "not-run", rendering: "not-run" })
    const combined = createVNextTablePreparedRowsV1({
      materialization: content,
      materializedCells: first,
      authoredCells: authoredEmpty(first.geometryFingerprint),
    })
    expect(combined).toMatchObject({
      status: "ready",
      work: {
        rowCount: ROW_COUNT, authoredRowCount: 0, materializedRowCount: ROW_COUNT,
        cellCount: ROW_COUNT, candidateCount: ROW_COUNT,
      },
      execution: { pagination: "not-run", rendering: "not-run" },
    })
    expect(JSON.stringify({ content, cells, text })).toBe(before)
  })
})
