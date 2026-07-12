import {
  collectVNextTocV4Semantics,
  createApproximateVNextTextMeasurer,
  finalizeVNextTocV4PaginationWindows,
  measureVNextTocV4,
  paginateVNextNestedColumnsV4,
  paginateVNextTableRowsV1,
  paginateVNextTextBlockV4Lines,
  paginateVNextTocV4,
  parseVNextDocumentV4HeadingPageMap,
  projectVNextTableRendererCommandsV1,
  resolveVNextTocV4PageReferences,
  type DocumentNodeV4Target,
  type VNextColumnsV4ChildFragmentSource,
  type VNextColumnsV4Geometry,
  type VNextColumnsV4NestedInput,
  type VNextTablePreparedCellV1,
  type VNextTablePreparedRowsResultV1,
  type VNextTableRendererStyleProfileV1,
  type VNextTextBlockV4MeasuredLinesResult,
  type VNextTocV4MeasurementSpec,
} from "../../src/index.js"
import { VNEXT_INTEGRATED_STRESS_EXPECTED_BLOCKERS } from "./v4IntegratedStressSmoke.js"

export type V4IntegratedStressScaleProfile = "medium" | "large"

const PROFILE = {
  medium: { textLineCount: 600, columnsFragmentCount: 600, tableBodyRowCount: 100, tocHeadingCount: 100 },
  large: { textLineCount: 6_000, columnsFragmentCount: 6_000, tableBodyRowCount: 1_000, tocHeadingCount: 1_000 },
} as const

type AcceptedLines = Extract<VNextTextBlockV4MeasuredLinesResult, { status: "accepted" }>
type ReadyTable = Extract<VNextTablePreparedRowsResultV1, { status: "ready" }>

function acceptedLines(count: number): AcceptedLines {
  const lines = Array.from({ length: count }, (_, index) => ({
    index, startOffset: index, endOffset: index + 1, text: `L${index}`,
    widthPt: 100, heightPt: 10,
    sourceStart: {
      textBlockId: "scale-text", inlineId: "scale-text-run", authoredOffset: index,
      resolvedOffset: index, affinity: "forward" as const,
    },
    sourceEnd: {
      textBlockId: "scale-text", inlineId: "scale-text-run", authoredOffset: index + 1,
      resolvedOffset: index + 1, affinity: "backward" as const,
    },
  }))
  return {
    source: "vnext-text-block-v4-measurement", version: 1, status: "accepted",
    textBlockId: "scale-text", lines, issues: [],
    summary: { lineCount: count, renderedLength: count, totalHeightPt: count * 10 },
  }
}

function columnsSource(count: number): VNextColumnsV4ChildFragmentSource {
  const point = (offset: number) => ({
    textBlockId: "columns-scale-text", inlineId: "columns-scale-run",
    authoredOffset: offset, resolvedOffset: offset, affinity: "forward" as const,
  })
  return {
    source: "vnext-columns-v4-fragments", version: 1, kind: "text-block-lines",
    nodeId: "columns-scale-text", keepPolicy: "allow-split",
    candidates: Array.from({ length: count }, (_, fragmentIndex) => ({
      fragmentId: `columns-scale-text:line-${fragmentIndex}`, nodeId: "columns-scale-text",
      fragmentIndex, sourceKind: "text-line" as const, heightPt: 10, breakAfter: true as const,
      sourceStart: point(fragmentIndex), sourceEnd: point(fragmentIndex + 1),
    })),
    prefixHeightsPt: Array.from({ length: count + 1 }, (_, index) => index * 10),
    totalHeightPt: count * 10, fingerprint: `columns-scale-text:${count}:10`,
  }
}

function columnsGeometry(columnsId: string, columnId: string): VNextColumnsV4Geometry {
  return {
    columnsId, sectionId: "scale-section", availableWidthPt: 240, gapPt: 0,
    contentWidthPt: 240,
    tracks: [{ columnId, columnIndex: 0, widthShare: 100, xOffsetPt: 0, widthPt: 240 }],
    fingerprint: `${columnsId}:240:${columnId}`,
  }
}

function columnsInput(count: number): VNextColumnsV4NestedInput {
  const depthThree: VNextColumnsV4NestedInput = {
    geometry: columnsGeometry("scale-columns-3", "scale-column-3"),
    lanes: [{
      columnId: "scale-column-3",
      items: [{ kind: "fragments", nodeId: "columns-scale-text", source: columnsSource(count) }],
    }],
  }
  const depthTwo: VNextColumnsV4NestedInput = {
    geometry: columnsGeometry("scale-columns-2", "scale-column-2"),
    lanes: [{ columnId: "scale-column-2", items: [{ kind: "columns", nodeId: "scale-columns-3", columns: depthThree }] }],
  }
  return {
    geometry: columnsGeometry("scale-columns-1", "scale-column-1"),
    lanes: [{ columnId: "scale-column-1", items: [{ kind: "columns", nodeId: "scale-columns-2", columns: depthTwo }] }],
  }
}

function tableCell(id: string, authored: boolean): VNextTablePreparedCellV1 {
  return {
    sourceCellId: id,
    cellIdentity: authored
      ? { kind: "authored-cell", sourceCellId: id }
      : { kind: "resolved-cell", cellInstanceId: `celli_${id}` },
    columnStart: 0, colSpan: 1, xOffsetPt: 0, outerWidthPt: 400, contentWidthPt: 400,
    insetsPt: { top: 0, right: 0, bottom: 0, left: 0 }, children: [], verticalAlign: "top",
    candidates: [{
      candidateId: `${id}:line-0`, nodeId: `${id}-text`, candidateIndex: 0,
      kind: "text-line", atomic: false, text: id, widthPt: 20, heightPt: 20, breakAfter: true,
      sourceStart: {
        textBlockId: `${id}-text`, inlineId: `${id}-inline`, authoredOffset: 0,
        resolvedOffset: 0, affinity: "forward",
      },
      sourceEnd: {
        textBlockId: `${id}-text`, inlineId: `${id}-inline`, authoredOffset: 1,
        resolvedOffset: 1, affinity: "backward",
      },
    }],
    prefixHeightsPt: [0, 20], contentHeightPt: 20, outerHeightPt: 20,
    completeWhenEmpty: false, fingerprint: JSON.stringify([id, 20]),
  }
}

function preparedTable(bodyRowCount: number): ReadyTable {
  const header = {
    kind: "prepared-authored-row" as const, rowIndex: 0, sourceRowId: "scale-header-row",
    rowSourceId: "scale-header-source", rowTemplateId: "scale-header-template",
    role: "header" as const, breakPolicy: "strict-keep" as const, minimumFirstFragmentHeightPt: 0,
    cells: [tableCell("scale-header-cell", true)], maximumCellOuterHeightPt: 20,
    fingerprint: "scale-header-fingerprint",
  }
  const bodyRows = Array.from({ length: bodyRowCount }, (_, index) => ({
    kind: "prepared-materialized-row" as const, rowIndex: index + 1,
    rowInstanceId: `rowi_${String(index + 1).padStart(12, "0")}`,
    rowSourceId: "scale-items-source", rowTemplateId: "scale-body-template",
    itemKey: `item-${index + 1}`, role: "body" as const, breakPolicy: "allow" as const,
    minimumFirstFragmentHeightPt: 0, cells: [tableCell(`scale-body-cell-${index}`, false)],
    maximumCellOuterHeightPt: 20, fingerprint: `scale-body-${index + 1}`,
  }))
  const rows = [header, ...bodyRows]
  return {
    source: "vnext-table-prepared-cell", contractVersion: 1, status: "ready",
    documentId: "scale-document", instanceRevision: 1, tableId: "scale-table",
    tableDefinitionId: "scale-table-definition", geometryFingerprint: "scale-table-geometry",
    rows, fingerprint: JSON.stringify(rows.map((row) => row.fingerprint)),
    work: {
      rowCount: rows.length, authoredRowCount: 1, materializedRowCount: bodyRowCount,
      cellCount: rows.length, candidateCount: rows.length,
    },
    execution: { measurement: "accepted-input", pagination: "not-run", rendering: "not-run" }, issues: [],
  }
}

function tableStyle(): VNextTableRendererStyleProfileV1 {
  return {
    contractVersion: 1, kind: "table-render-style-profile", profileId: "integrated-scale-table",
    outerBorder: { style: "solid", widthPt: 1, color: "111827" },
    internalRowBorder: { style: "solid", widthPt: 0.5, color: "CBD5E1" },
    internalColumnBorder: { style: "none", widthPt: 0, color: "000000" },
    defaultCellBackground: null,
    rowBackgrounds: { header: null, body: null, footer: null, "empty-state": null, "repeated-header": null },
    textColorFallback: "0F172A", missingMediaPolicy: "block",
  }
}

function tocDocument(headingCount: number): DocumentNodeV4Target {
  const nodes: Record<string, any> = {
    body: {
      id: "body", type: "zone", role: "body",
      childIds: ["scale-toc", ...Array.from({ length: headingCount }, (_, index) => `scale-heading-${index}`)],
    },
    "scale-toc": { id: "scale-toc", type: "toc", props: { title: "Contents" } },
  }
  for (let index = 0; index < headingCount; index += 1) nodes[`scale-heading-${index}`] = {
    id: `scale-heading-${index}`, type: "text-block",
    role: { role: "heading", level: (index % 6) + 1 }, props: {},
    children: [{ id: `scale-heading-${index}-text`, type: "text", text: `Heading ${index}` }],
  }
  const margin = { value: 40, unit: "pt" as const }
  return {
    version: 4,
    document: { id: "scale-document", sections: [{
      id: "scale-section", type: "section",
      page: {
        size: "A4", orientation: "portrait",
        margin: { top: margin, right: margin, bottom: margin, left: margin },
      },
      zoneIds: ["body"], nodes,
    }] },
  }
}

function tocSpec(headingCount: number): VNextTocV4MeasurementSpec {
  const capacityDigits = String(headingCount).length
  return {
    availableWidthPt: 480, availableHeightPt: 700, measurementProfileId: `integrated-scale-toc-${headingCount}`,
    titleStyleKey: "toc-title", pageNumberStyleKey: "toc-page",
    entryStyleKeyByLevel: { "1": "toc-1", "2": "toc-2", "3": "toc-3", "4": "toc-4", "5": "toc-5", "6": "toc-6" },
    indentPtByLevel: { "1": 0, "2": 12, "3": 24, "4": 36, "5": 48, "6": 60 },
    pageNumberColumnWidthPt: 36, pageNumberCapacityDigits: capacityDigits,
    labelToLeaderGapPt: 4, minimumLeaderWidthPt: 12, leaderToPageNumberGapPt: 4,
    titleGapAfterPt: 0, rowGapPt: 0,
    maximumEntryCount: headingCount, maximumMeasuredLineCount: headingCount + 2,
  }
}

export function runV4IntegratedStressScale(profile: V4IntegratedStressScaleProfile) {
  const workload = PROFILE[profile]

  const textInput = acceptedLines(workload.textLineCount)
  const textBefore = JSON.stringify(textInput)
  const text = paginateVNextTextBlockV4Lines(textInput, { pageBodyHeightPt: 240 })
  if (text.status !== "paginated") throw new Error("integrated scale Text-block blocked")

  const columnsSourceInput = columnsInput(workload.columnsFragmentCount)
  const columnsBefore = JSON.stringify(columnsSourceInput)
  const columns = paginateVNextNestedColumnsV4({
    columns: columnsSourceInput, pageBodyHeightPt: 240, maximumPageCount: 300,
  })
  if (columns.status !== "paginated") throw new Error("integrated scale Columns blocked")

  const tableInput = preparedTable(workload.tableBodyRowCount)
  const tableBefore = JSON.stringify(tableInput)
  const table = paginateVNextTableRowsV1({
    prepared: tableInput, headerPolicy: "repeat-leading-headers",
    pageBodyHeightPt: 100, maximumPageCount: 300, maximumRowPlanCount: 2_000,
  })
  if (table.status !== "paginated") throw new Error("integrated scale Table blocked")
  const tableRenderer = projectVNextTableRendererCommandsV1({
    contractVersion: 1, kind: "table-renderer-projection-request",
    sectionId: "scale-section", zoneId: "body",
    expectedPaginationFingerprint: table.fingerprint, pagination: table,
    pageOrigins: table.pages.map((page) => ({ pageIndex: page.pageIndex, xPt: 20, yPt: 30 })),
    styleProfile: tableStyle(),
  })
  if (tableRenderer.status !== "consumable") throw new Error("integrated scale Table renderer facts blocked")

  const tocSource = tocDocument(workload.tocHeadingCount)
  const tocBefore = JSON.stringify(tocSource)
  const tocSemantic = collectVNextTocV4Semantics(tocSource)
  const tocMeasurement = measureVNextTocV4({
    semantic: tocSemantic, tocNodeId: "scale-toc", spec: tocSpec(workload.tocHeadingCount),
    textMeasurer: createApproximateVNextTextMeasurer({ charWidthPt: 6, lineHeightPt: 14 }),
  })
  const tocPagination = paginateVNextTocV4({
    measurement: tocMeasurement, pageBodyHeightPt: 100, maximumPageCount: 300,
  })
  const tocManifest = finalizeVNextTocV4PaginationWindows({
    measurement: tocMeasurement, windows: [tocPagination],
  })
  const headingPageMap = parseVNextDocumentV4HeadingPageMap({
    source: "vnext-document-v4-heading-page-map", contractVersion: 1,
    kind: "document-v4-heading-page-map", documentId: "scale-document",
    documentPaginationFingerprint: `synthetic-integrated-scale-pages-${profile}`,
    status: "complete", pageCount: workload.tocHeadingCount,
    entries: Array.from({ length: workload.tocHeadingCount }, (_, index) => ({
      headingNodeId: `scale-heading-${index}`, sectionId: "scale-section",
      sourceFragmentId: `synthetic:scale-heading-${index}:first-fragment`,
      pageIndex: index, pageNumber: index + 1,
    })),
  })
  if (tocManifest.status !== "ready" || headingPageMap.status !== "ready") {
    throw new Error("integrated scale TOC retained inputs blocked")
  }
  const tocResolution = resolveVNextTocV4PageReferences({
    semantic: tocSemantic, measurement: tocMeasurement,
    paginationManifest: tocManifest.manifest, headingPageMap: headingPageMap.map,
    tocNodeId: "scale-toc",
  })
  if (tocSemantic.status === "blocked" || tocMeasurement.status !== "measured"
    || tocPagination.status === "blocked" || tocResolution.status !== "resolved") {
    throw new Error("integrated scale TOC lane blocked")
  }

  const sourceMutationCount = [
    JSON.stringify(textInput) === textBefore,
    JSON.stringify(columnsSourceInput) === columnsBefore,
    JSON.stringify(tableInput) === tableBefore,
    JSON.stringify(tocSource) === tocBefore,
  ].filter((unchanged) => !unchanged).length
  const facts = {
    profile,
    workload,
    lanes: {
      text: {
        localPageCount: text.summary.pageCount, lineCount: text.summary.lineCount,
        fragmentCount: text.summary.fragmentCount,
      },
      columns: {
        localPageCount: columns.pages.length,
        work: columns.workFacts,
      },
      table: {
        localPageCount: table.summary.pageCount,
        bodyRowCount: workload.tableBodyRowCount,
        work: table.work,
      },
      tableRendererFacts: {
        localPageCount: tableRenderer.summary.pageCount,
        work: tableRenderer.work,
      },
      toc: {
        localPageCount: tocPagination.pages.length,
        headingCount: tocSemantic.summary.headingSourceCount,
        semanticWork: tocSemantic.work,
        measurementWork: tocMeasurement.work,
        paginationWork: tocPagination.work,
        resolutionWork: tocResolution.work,
        resolutionSerializedBytes: JSON.stringify(tocResolution).length,
        syntheticHeadingPageMap: true as const,
      },
    },
    sourceMutationCount,
    blockers: VNEXT_INTEGRATED_STRESS_EXPECTED_BLOCKERS,
    integratedPageCount: null,
  }
  return { ...facts, fingerprint: JSON.stringify(facts) }
}
