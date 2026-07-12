import fixture from "../../fixtures/product-report-v4-migrated-minimal.flowdoc.json"
import { createVNextCompactFingerprint } from "../../src/fingerprint/compactFingerprint.js"
import {
  DocumentNodeV4TargetSchema,
  collectVNextTocV4Semantics,
  createApproximateVNextTextMeasurer,
  createVNextColumnsV4NestedInput,
  finalizeVNextTocV4PaginationWindows,
  measureVNextTocV4,
  paginateVNextNestedColumnsV4,
  paginateVNextTableRowsV1,
  paginateVNextTextBlockV4Lines,
  paginateVNextTocV4,
  parseVNextDocumentV4HeadingPageMap,
  projectVNextTableRendererCommandsV1,
  resolveVNextTocV4PageReferences,
  validateVNextDocumentV4Structure,
  type DocumentNodeV4Target,
  type VNextTablePreparedCellCandidateV1,
  type VNextTablePreparedCellV1,
  type VNextTablePreparedRowsResultV1,
  type VNextTableRendererStyleProfileV1,
  type VNextTextBlockV4MeasuredLinesResult,
  type VNextTocV4MeasurementSpec,
} from "../../src/index.js"

export const VNEXT_INTEGRATED_STRESS_SMOKE_PROFILE = "integrated-v4-stress-v1"
export const VNEXT_INTEGRATED_STRESS_EXPECTED_BLOCKERS = [
  "mixed-body-composition",
  "whole-document-heading-page-map-production",
  "field-backed-toc-label-materialization",
  "integrated-renderer-artifact",
  "backend-stress-orchestration-persistence",
  "editor-integrated-stress-ui",
] as const

type AcceptedLines = Extract<VNextTextBlockV4MeasuredLinesResult, { status: "accepted" }>
type ReadyTable = Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>

export interface V4IntegratedStressSmokeBundle {
  profileId: typeof VNEXT_INTEGRATED_STRESS_SMOKE_PROFILE
  document: DocumentNodeV4Target
  measuredTextByNodeId: Record<string, AcceptedLines>
  preparedTable: ReadyTable
  syntheticEvidence: {
    headingPageMap: true
    tableMaterializedRow: true
  }
}

function acceptedLines(nodeId: string, heights: number[]): AcceptedLines {
  let offset = 0
  const lines = heights.map((heightPt, index) => {
    const startOffset = offset
    offset += 1
    const point = (value: number, affinity: "forward" | "backward") => ({
      textBlockId: nodeId, inlineId: `${nodeId}-run`, authoredOffset: value,
      resolvedOffset: value, affinity,
    })
    return {
      index, startOffset, endOffset: offset, text: `${nodeId}-${index}`,
      widthPt: 80, heightPt,
      sourceStart: point(startOffset, "forward"), sourceEnd: point(offset, "backward"),
    }
  })
  return {
    source: "vnext-text-block-v4-measurement", version: 1, status: "accepted",
    textBlockId: nodeId, lines, issues: [],
    summary: {
      lineCount: lines.length, renderedLength: offset,
      totalHeightPt: heights.reduce((total, height) => total + height, 0),
    },
  }
}

function tableCandidate(nodeId: string, index: number, heightPt: number): VNextTablePreparedCellCandidateV1 {
  return {
    candidateId: `${nodeId}:line-${index}`, nodeId, candidateIndex: index,
    kind: "text-line", atomic: false, text: `${nodeId}-${index}`, widthPt: 80,
    heightPt, breakAfter: true,
    sourceStart: {
      textBlockId: nodeId, inlineId: `${nodeId}-run`, authoredOffset: index,
      resolvedOffset: index, affinity: "forward",
    },
    sourceEnd: {
      textBlockId: nodeId, inlineId: `${nodeId}-run`, authoredOffset: index + 1,
      resolvedOffset: index + 1, affinity: "backward",
    },
  }
}

function tableCell(input: {
  sourceCellId: string
  columnStart: number
  identity: VNextTablePreparedCellV1["cellIdentity"]
  candidates: VNextTablePreparedCellCandidateV1[]
}): VNextTablePreparedCellV1 {
  let contentHeightPt = 0
  const prefixHeightsPt = [0]
  input.candidates.forEach((candidate) => {
    contentHeightPt += candidate.heightPt
    prefixHeightsPt.push(contentHeightPt)
  })
  return {
    sourceCellId: input.sourceCellId, cellIdentity: input.identity,
    columnStart: input.columnStart, colSpan: 1, xOffsetPt: input.columnStart * 120,
    outerWidthPt: 120, contentWidthPt: 110,
    insetsPt: { top: 5, right: 5, bottom: 5, left: 5 }, verticalAlign: "top",
    children: [], candidates: input.candidates, prefixHeightsPt,
    contentHeightPt, outerHeightPt: contentHeightPt + 10,
    completeWhenEmpty: input.candidates.length === 0,
    fingerprint: JSON.stringify([input.sourceCellId, input.identity, input.candidates]),
  }
}

function preparedTable(): ReadyTable {
  const headerCells = [
    tableCell({
      sourceCellId: "detail-cell-a", columnStart: 0,
      identity: { kind: "authored-cell", sourceCellId: "detail-cell-a" },
      candidates: [tableCandidate("detail-cell-a-text", 0, 15)],
    }),
    tableCell({
      sourceCellId: "detail-cell-b", columnStart: 1,
      identity: { kind: "authored-cell", sourceCellId: "detail-cell-b" },
      candidates: [tableCandidate("detail-cell-b-text", 0, 15)],
    }),
  ]
  const imageCandidate: VNextTablePreparedCellCandidateV1 = {
    candidateId: "detail-body-image:atomic", nodeId: "detail-body-image", candidateIndex: 0,
    kind: "image", atomic: true, widthPt: 30, heightPt: 30, align: "center",
    assetId: "smoke-image", assetOwner: "instance-media", breakAfter: true,
  }
  const bodyCells = [
    tableCell({
      sourceCellId: "detail-body-cell-a", columnStart: 0,
      identity: { kind: "resolved-cell", cellInstanceId: "celli_smoke_a" },
      candidates: [tableCandidate("detail-body-text", 0, 60), tableCandidate("detail-body-text", 1, 60)],
    }),
    tableCell({
      sourceCellId: "detail-body-cell-b", columnStart: 1,
      identity: { kind: "resolved-cell", cellInstanceId: "celli_smoke_b" },
      candidates: [imageCandidate],
    }),
  ]
  const rows: ReadyTable["rows"] = [{
    kind: "prepared-authored-row", rowIndex: 0, sourceRowId: "detail-header-row",
    rowSourceId: "detail-header-source", rowTemplateId: "detail-header-template",
    role: "header", breakPolicy: "strict-keep", minimumFirstFragmentHeightPt: 0,
    cells: headerCells, maximumCellOuterHeightPt: 25, fingerprint: "detail-header-prepared",
  }, {
    kind: "prepared-materialized-row", rowIndex: 1, rowInstanceId: "rowi_smoke_body",
    rowSourceId: "detail-items-source", rowTemplateId: "detail-item-template",
    itemKey: "smoke-item", role: "body", breakPolicy: "allow", minimumFirstFragmentHeightPt: 0,
    cells: bodyCells, maximumCellOuterHeightPt: 130, fingerprint: "detail-body-prepared",
  }]
  return {
    source: "vnext-table-prepared-cell", contractVersion: 1, status: "ready",
    documentId: "product-report-vnext-minimal", instanceRevision: 1,
    tableId: "detail-table", tableDefinitionId: "detail-table-definition",
    geometryFingerprint: "detail-table-geometry-smoke", rows,
    fingerprint: JSON.stringify(rows.map((row) => row.fingerprint)),
    work: { rowCount: 2, authoredRowCount: 1, materializedRowCount: 1, cellCount: 4, candidateCount: 5 },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" }, issues: [],
  }
}

export function createV4IntegratedStressTableStyle(): VNextTableRendererStyleProfileV1 {
  return {
    contractVersion: 1, kind: "table-render-style-profile", profileId: "integrated-smoke-table",
    outerBorder: { style: "solid", widthPt: 1, color: "111827" },
    internalRowBorder: { style: "solid", widthPt: 0.5, color: "64748B" },
    internalColumnBorder: { style: "solid", widthPt: 0.5, color: "CBD5E1" },
    defaultCellBackground: null,
    rowBackgrounds: { header: "E2E8F0", body: null, footer: null, "empty-state": null, "repeated-header": "F1F5F9" },
    textColorFallback: "0F172A", missingMediaPolicy: "block",
  }
}

function tocSpec(): VNextTocV4MeasurementSpec {
  return {
    availableWidthPt: 300, availableHeightPt: 100, measurementProfileId: "integrated-smoke-toc",
    titleStyleKey: "toc-title", pageNumberStyleKey: "toc-page",
    entryStyleKeyByLevel: { "1": "toc-1", "2": "toc-2", "3": "toc-3", "4": "toc-4", "5": "toc-5", "6": "toc-6" },
    indentPtByLevel: { "1": 0, "2": 12, "3": 24, "4": 36, "5": 48, "6": 60 },
    pageNumberColumnWidthPt: 30, pageNumberCapacityDigits: 3,
    labelToLeaderGapPt: 4, minimumLeaderWidthPt: 12, leaderToPageNumberGapPt: 4,
    titleGapAfterPt: 4, rowGapPt: 2, maximumEntryCount: 20, maximumMeasuredLineCount: 50,
  }
}

export function createV4IntegratedStressSmokeBundle(): V4IntegratedStressSmokeBundle {
  const document = DocumentNodeV4TargetSchema.parse(structuredClone(fixture.document))
  const section = document.document.sections[0]
  const body = section.nodes["zone-cover-body"]
  if (body.type !== "zone") throw new Error("integrated smoke body zone missing")
  body.childIds.unshift("toc-smoke")
  section.nodes["toc-smoke"] = { id: "toc-smoke", type: "toc", props: { title: "Contents", maxLevel: 3 } }
  return {
    profileId: VNEXT_INTEGRATED_STRESS_SMOKE_PROFILE,
    document,
    measuredTextByNodeId: {
      title: acceptedLines("title", [20, 20, 20, 20]),
      "summary-left-text": acceptedLines("summary-left-text", [20, 20, 20]),
      "summary-right-text": acceptedLines("summary-right-text", [30]),
    },
    preparedTable: preparedTable(),
    syntheticEvidence: { headingPageMap: true, tableMaterializedRow: true },
  }
}

export function createV4IntegratedStressColumnsInput(bundle: V4IntegratedStressSmokeBundle) {
  return createVNextColumnsV4NestedInput({
    document: bundle.document, sectionId: "section-cover", columnsId: "summary-columns",
    availableWidthPt: 500, capabilities: { maxNestingDepth: 3, minimumTrackWidthPt: 80 },
    measuredTextByNodeId: bundle.measuredTextByNodeId,
  })
}

export function createV4IntegratedStressTocInputs(bundle: V4IntegratedStressSmokeBundle) {
  const semantic = collectVNextTocV4Semantics(bundle.document)
  const measurement = measureVNextTocV4({
    semantic, tocNodeId: "toc-smoke", spec: tocSpec(),
    textMeasurer: createApproximateVNextTextMeasurer({ charWidthPt: 6, lineHeightPt: 14 }),
  })
  return { semantic, measurement }
}

export function runV4IntegratedStressSmoke(bundle: V4IntegratedStressSmokeBundle) {
  const structure = validateVNextDocumentV4Structure(bundle.document)
  const text = paginateVNextTextBlockV4Lines(bundle.measuredTextByNodeId.title, {
    pageBodyHeightPt: 60,
  })
  const columnsInput = createV4IntegratedStressColumnsInput(bundle)
  if (columnsInput.status !== "ready") throw new Error("integrated smoke Columns input blocked")
  const columns = paginateVNextNestedColumnsV4({
    columns: columnsInput.columns, pageBodyHeightPt: 60, maximumPageCount: 10,
  })
  const table = paginateVNextTableRowsV1({
    prepared: bundle.preparedTable, headerPolicy: "repeat-leading-headers",
    pageBodyHeightPt: 100, maximumPageCount: 10, maximumRowPlanCount: 20,
  })
  if (table.status !== "paginated") throw new Error("integrated smoke Table pagination blocked")
  const tableRenderer = projectVNextTableRendererCommandsV1({
    contractVersion: 1, kind: "table-renderer-projection-request",
    sectionId: "section-cover", zoneId: "zone-cover-body",
    expectedPaginationFingerprint: table.fingerprint, pagination: table,
    pageOrigins: table.pages.map((page) => ({ pageIndex: page.pageIndex, xPt: 20, yPt: 30 })),
    styleProfile: createV4IntegratedStressTableStyle(),
  })
  const { semantic: tocSemantic, measurement: tocMeasurement } = createV4IntegratedStressTocInputs(bundle)
  const tocPagination = paginateVNextTocV4({
    measurement: tocMeasurement, pageBodyHeightPt: 100, maximumPageCount: 10,
  })
  const tocManifest = finalizeVNextTocV4PaginationWindows({
    measurement: tocMeasurement, windows: [tocPagination],
  })
  const headingPageMap = parseVNextDocumentV4HeadingPageMap({
    source: "vnext-document-v4-heading-page-map", contractVersion: 1,
    kind: "document-v4-heading-page-map", documentId: bundle.document.document.id,
    documentPaginationFingerprint: "synthetic-integrated-smoke-pages",
    status: "complete", pageCount: 2,
    entries: [{
      headingNodeId: "title", sectionId: "section-cover",
      sourceFragmentId: "synthetic:title:first-fragment", pageIndex: 1, pageNumber: 2,
    }],
  })
  if (tocManifest.status !== "ready" || headingPageMap.status !== "ready") {
    throw new Error("integrated smoke TOC retained inputs blocked")
  }
  const tocResolution = resolveVNextTocV4PageReferences({
    semantic: tocSemantic, measurement: tocMeasurement,
    paginationManifest: tocManifest.manifest, headingPageMap: headingPageMap.map,
    tocNodeId: "toc-smoke",
  })
  const facts = {
    profileId: bundle.profileId,
    lanes: {
      structure: {
        capability: "executable" as const, status: structure.status, summary: structure.summary,
        evidenceFingerprint: createVNextCompactFingerprint(JSON.stringify(structure)),
      },
      text: {
        capability: "executable" as const, status: text.status,
        summary: text.status === "paginated" ? text.summary : null,
        evidenceFingerprint: createVNextCompactFingerprint(JSON.stringify(text)),
      },
      columns: {
        capability: "executable" as const, status: columns.status,
        summary: columns.status === "paginated"
          ? { pageCount: columns.pages.length, workFacts: columns.workFacts }
          : null,
        evidenceFingerprint: createVNextCompactFingerprint(JSON.stringify(columns)),
      },
      table: {
        capability: "executable" as const, status: table.status, summary: table.summary,
        evidenceFingerprint: createVNextCompactFingerprint(JSON.stringify(table)),
      },
      tableRendererFacts: {
        capability: "contract-only" as const, status: tableRenderer.status,
        summary: tableRenderer.status === "consumable" ? tableRenderer.summary : null,
        evidenceFingerprint: createVNextCompactFingerprint(JSON.stringify(tableRenderer)),
      },
      toc: {
        capability: "contract-only" as const, status: tocResolution.status,
        previewReadiness: tocResolution.status === "blocked" ? null : tocResolution.readiness.preview.status,
        artifactReadiness: tocResolution.status === "blocked" ? null : tocResolution.readiness.artifact.status,
        syntheticHeadingPageMap: true as const,
        evidenceFingerprint: createVNextCompactFingerprint(JSON.stringify(tocResolution)),
      },
    },
    blockers: VNEXT_INTEGRATED_STRESS_EXPECTED_BLOCKERS,
    integratedPageCount: null,
    contracts: {
      canonicalMutation: false as const, mixedComposition: "not-run" as const,
      integratedRendering: "not-run" as const, persistence: "not-run" as const,
    },
  }
  return { ...facts, fingerprint: JSON.stringify(facts) }
}
