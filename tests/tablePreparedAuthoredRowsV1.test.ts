import { describe, expect, it } from "vitest"
import {
  acceptVNextTextBlockV4MeasuredLines,
  createVNextTableAuthoredTextMeasurementPreparationV1,
  createVNextTableCellGeometryV1,
  createVNextTablePreparedAuthoredCellsV1,
  createVNextTablePreparedMaterializedCellsV1,
  createVNextTablePreparedRowsV1,
  createVNextTableTextFragmentEvidenceV1,
  type VNextResolvedDocumentV1,
  type VNextTableContentMaterializationResultV1,
  type VNextTableDefinitionV1,
  type VNextTableTextFragmentEvidenceResultV1,
} from "../src/index.js"

function definition(): VNextTableDefinitionV1 {
  return {
    contractVersion: 1,
    kind: "table-definition",
    tableDefinitionId: "report-table-definition",
    owner: {
      kind: "published-structure-version",
      ref: { structureId: "report", structureVersionId: "report-v1", versionOrdinal: 1 },
    },
    tableId: "report-table",
    headerPolicy: "repeat-leading-headers",
    columns: [{ columnId: "content", widthShare: 100 }],
    rowSources: [{
      kind: "static-row",
      rowSourceId: "header-source",
      rowTemplateId: "header-template",
      role: "header",
    }],
    rowTemplates: {
      "header-template": {
        rowTemplateId: "header-template",
        sourceRowId: "header-row",
        breakPolicy: "strict-keep",
        minHeightPt: 18,
        cells: [{ cellId: "header-cell", columnStart: 0, colSpan: 1, rowSpan: 1 }],
      },
    },
  }
}

function geometry() {
  return createVNextTableCellGeometryV1({
    contractVersion: 1,
    kind: "table-cell-geometry-request",
    definition: definition(),
    tableContentWidthPt: 300,
    layoutProfile: {
      contractVersion: 1,
      kind: "table-cell-layout-profile",
      layoutProfileId: "layout-v1",
      defaultInsetsPt: { top: 3, right: 5, bottom: 3, left: 5 },
      insetsByRowTemplate: {},
    },
  })
}

function materialization(): Extract<VNextTableContentMaterializationResultV1, { status: "materialized" }> {
  return {
    source: "vnext-table-content-materialization",
    contractVersion: 1,
    status: "materialized",
    documentId: "instance-1",
    tableId: "report-table",
    tableDefinitionId: "report-table-definition",
    instanceRevision: 5,
    resolutionInputFingerprint: "resolution-5",
    rows: [{
      kind: "authored-content-reference",
      sourceRowId: "header-row",
      cells: [{
        sourceCellId: "header-cell", verticalAlign: "top", childIds: ["header-text", "header-logo"],
      }],
    }],
    bindings: { text: [], images: [] },
    provenance: [],
    work: {
      rowCount: 1, materializedRowCount: 0, authoredReferenceRowCount: 1, cellCount: 1,
      clonedNodeCount: 0, clonedInlineCount: 0, textBindingCount: 0, imageBindingCount: 0,
      sourcePlanDocumentRootScans: 1, materializationDocumentRootScans: 1,
    },
    execution: {
      identityAllocation: "not-run", authoredGraphMutation: false, mediaFetch: "not-run",
      measurement: "not-run", pagination: "not-run", rendering: "not-run",
    },
    issues: [],
  }
}

function resolvedDocument(): VNextResolvedDocumentV1 {
  return {
    source: "vnext-resolved-document",
    contractVersion: 1,
    status: "resolved",
    instanceId: "instance-1",
    instanceRevision: 5,
    structureVersionId: "report-v1",
    document: {
      version: 4,
      document: {
        id: "instance-1",
        sections: [{
          id: "main",
          type: "section",
          page: {
            size: "A4", orientation: "portrait",
            margin: {
              top: { value: 20, unit: "mm" }, right: { value: 20, unit: "mm" },
              bottom: { value: 20, unit: "mm" }, left: { value: 20, unit: "mm" },
            },
          },
          zoneIds: ["body"],
          nodes: {
            body: { id: "body", type: "zone", role: "body", childIds: ["report-table"] },
            "report-table": {
              id: "report-table", type: "table", props: { headerRowCount: 1 },
              columns: [{ width: { value: 300, unit: "pt" } }], rowIds: ["header-row"],
            },
            "header-row": { id: "header-row", type: "table-row", props: {}, cellIds: ["header-cell"] },
            "header-cell": {
              id: "header-cell", type: "table-cell", props: {}, childIds: ["header-text", "header-logo"],
            },
            "header-text": {
              id: "header-text", type: "text-block", role: { role: "paragraph" }, props: {},
              children: [
                { id: "header-label", type: "text", text: "Customer " },
                { id: "customer-name", type: "field-ref", key: "customer.name" },
              ],
            },
            "header-logo": {
              id: "header-logo", type: "image",
              source: { kind: "image-field-ref", fieldKey: "company.logo" },
              accessibility: { kind: "decorative" },
              props: {
                frame: {
                  width: { value: 20, unit: "pt" }, height: { value: 10, unit: "pt" }, fit: "contain",
                },
                align: "left",
              },
            },
          },
        }],
      },
    },
    pins: {
      fieldContractId: "fields-v1", styleCatalogId: "styles-v1",
      staticMediaRegistryId: "static-v1", dataSnapshotId: "data-r5", instanceMediaSnapshotId: "media-r5",
    },
    bindings: {
      fields: [{
        inlineId: "customer-name", textBlockId: "header-text", fieldKey: "customer.name",
        value: "Acme", valueSource: "data-snapshot",
      }],
      images: [{
        placementId: "header-logo", fieldKey: "company.logo", assetId: "logo-1",
        assetOwner: "instance-media", valueSource: "data-snapshot",
      }],
      styles: [],
    },
    resources: {
      staticMedia: { version: 1, images: {} },
      instanceMedia: { version: 1, images: {} },
    },
    execution: {
      inputFetch: "not-run", authoredGraphMutation: false, generatedExpansion: "not-run",
      pagination: "not-run", rendering: "not-run",
    },
    issues: [],
  }
}

function emptyCollectionTextEvidence(): Extract<VNextTableTextFragmentEvidenceResultV1, { status: "ready" }> {
  const readyGeometry = geometry()
  if (readyGeometry.status !== "ready") throw new Error("fixture geometry blocked")
  return {
    source: "vnext-table-text-fragment-evidence",
    contractVersion: 1,
    status: "ready",
    documentId: "instance-1",
    instanceRevision: 5,
    tableId: "report-table",
    tableDefinitionId: "report-table-definition",
    geometryFingerprint: readyGeometry.geometry.fingerprint,
    measurementProfileId: "profile-v1",
    fragmentSourcesByTextBlockId: {},
    work: { requestCount: 0, measuredLineCount: 0, candidateCount: 0 },
    execution: { measurement: "accepted-external", pagination: "not-run", rendering: "not-run" },
    issues: [],
  }
}

function authoredEvidence() {
  const preparation = createVNextTableAuthoredTextMeasurementPreparationV1({
    definition: definition(),
    materialization: materialization(),
    geometry: geometry(),
    resolvedDocument: resolvedDocument(),
    measurementProfileId: "profile-v1",
  })
  if (preparation.status !== "ready") throw new Error(preparation.issues.map((item) => item.message).join("\n"))
  const request = preparation.requestsByTextBlockId["header-text"].request
  const measured = acceptVNextTextBlockV4MeasuredLines(request, [{
    index: 0, startOffset: 0, endOffset: request.renderedText.length,
    text: request.renderedText, widthPt: 100, heightPt: 12,
  }])
  if (measured.status !== "accepted") throw new Error("fixture measured lines blocked")
  const evidence = createVNextTableTextFragmentEvidenceV1({
    preparation,
    evidenceByTextBlockId: { "header-text": { request, measured } },
  })
  if (evidence.status !== "ready") throw new Error(evidence.issues.map((item) => item.message).join("\n"))
  return { preparation, evidence }
}

describe("prepared authored Table rows v1", () => {
  it("uses Resolved Document bindings and merges a complete ordered row stream", () => {
    const authored = authoredEvidence()
    expect(authored.preparation.requestsByTextBlockId["header-text"].request).toMatchObject({
      documentId: "instance-1",
      instanceRevision: 5,
      availableWidthPt: 290,
      measurementProfileId: "profile-v1",
      renderedText: "Customer Acme",
    })
    expect(authored.preparation.requestsByTextBlockId["header-text"]).toMatchObject({
      rowIdentity: { kind: "authored-row", sourceRowId: "header-row" },
      cellIdentity: { kind: "authored-cell", sourceCellId: "header-cell" },
    })
    const authoredCells = createVNextTablePreparedAuthoredCellsV1({
      definition: definition(), materialization: materialization(), geometry: geometry(),
      resolvedDocument: resolvedDocument(), textEvidence: authored.evidence,
    })
    expect(authoredCells.status).toBe("ready")
    if (authoredCells.status !== "ready") throw new Error(authoredCells.issues.map((item) => item.message).join("\n"))
    expect(authoredCells.rows[0]).toMatchObject({
      kind: "prepared-authored-row",
      rowIndex: 0,
      sourceRowId: "header-row",
      role: "header",
      breakPolicy: "strict-keep",
      minimumFirstFragmentHeightPt: 18,
      cells: [{
        cellIdentity: { kind: "authored-cell", sourceCellId: "header-cell" },
        verticalAlign: "top",
        prefixHeightsPt: [0, 12, 22],
        contentHeightPt: 22,
        outerHeightPt: 28,
      }],
    })
    expect(authoredCells.rows[0].cells[0].candidates.map((candidate) => [candidate.kind, candidate.atomic])).toEqual([
      ["text-line", false], ["image", true],
    ])

    const materializedCells = createVNextTablePreparedMaterializedCellsV1({
      definition: definition(), materialization: materialization(), geometry: geometry(),
      textEvidence: emptyCollectionTextEvidence(),
    })
    const combined = createVNextTablePreparedRowsV1({
      materialization: materialization(), materializedCells, authoredCells,
    })
    expect(combined).toMatchObject({
      status: "ready",
      rows: [{ kind: "prepared-authored-row", sourceRowId: "header-row" }],
      work: { rowCount: 1, authoredRowCount: 1, materializedRowCount: 0, cellCount: 1, candidateCount: 2 },
      execution: { pagination: "not-run", rendering: "not-run" },
    })
  })

  it("blocks stale Resolved Document revisions and incomplete row assembly", () => {
    const stale = resolvedDocument()
    stale.instanceRevision = 4
    expect(createVNextTableAuthoredTextMeasurementPreparationV1({
      definition: definition(), materialization: materialization(), geometry: geometry(),
      resolvedDocument: stale, measurementProfileId: "profile-v1",
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "resolved-document-scope-mismatch" })] })

    const materializedCells = createVNextTablePreparedMaterializedCellsV1({
      definition: definition(), materialization: materialization(), geometry: geometry(),
      textEvidence: emptyCollectionTextEvidence(),
    })
    const missingAuthored = {
      source: "vnext-table-prepared-cell" as const,
      contractVersion: 1 as const,
      status: "ready" as const,
      documentId: "instance-1",
      instanceRevision: 5,
      tableId: "report-table",
      tableDefinitionId: "report-table-definition",
      geometryFingerprint: materializedCells.status === "ready" ? materializedCells.geometryFingerprint : "",
      rows: [],
      work: {
        inputRowCount: 1, preparedRowCount: 0, preparedCellCount: 0, visitedNodeCount: 0,
        textLineCandidateCount: 0, atomicCandidateCount: 0, candidateCount: 0,
      },
      execution: { measurement: "accepted-input" as const, pagination: "not-run" as const, rendering: "not-run" as const },
      issues: [] as [],
    }
    expect(createVNextTablePreparedRowsV1({
      materialization: materialization(), materializedCells, authoredCells: missingAuthored,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "missing-prepared-row" })] })
  })
})
