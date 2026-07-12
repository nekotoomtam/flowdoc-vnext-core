import { describe, expect, it } from "vitest"
import {
  createVNextTableCellGeometryV1,
  createVNextTablePreparedMaterializedCellsV1,
  type VNextTableContentMaterializationResultV1,
  type VNextTableDefinitionV1,
  type VNextTableTextFragmentEvidenceResultV1,
} from "../src/index.js"

function definition(): VNextTableDefinitionV1 {
  return {
    contractVersion: 1,
    kind: "table-definition",
    tableDefinitionId: "orders-definition",
    owner: {
      kind: "published-structure-version",
      ref: { structureId: "orders", structureVersionId: "orders-v1", versionOrdinal: 1 },
    },
    tableId: "orders-table",
    headerPolicy: "no-repeat",
    columns: [{ columnId: "content", widthShare: 100 }],
    rowSources: [
      { kind: "static-row", rowSourceId: "header-source", rowTemplateId: "header-template", role: "header" },
      {
        kind: "collection-rows", rowSourceId: "items-source", collectionFieldKey: "items",
        rowTemplateId: "item-template", role: "body", emptyPolicy: { kind: "header-only" },
      },
    ],
    rowTemplates: {
      "header-template": {
        rowTemplateId: "header-template", sourceRowId: "header-row", breakPolicy: "strict-keep",
        cells: [{ cellId: "header-cell", columnStart: 0, colSpan: 1, rowSpan: 1 }],
      },
      "item-template": {
        rowTemplateId: "item-template", sourceRowId: "item-row", breakPolicy: "prefer-keep", minHeightPt: 20,
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
    tableContentWidthPt: 200,
    layoutProfile: {
      contractVersion: 1,
      kind: "table-cell-layout-profile",
      layoutProfileId: "table-layout-v1",
      defaultInsetsPt: { top: 4, right: 6, bottom: 4, left: 6 },
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
    tableId: "orders-table",
    tableDefinitionId: "orders-definition",
    instanceRevision: 7,
    resolutionInputFingerprint: "resolution-7",
    rows: [
      { kind: "authored-content-reference", sourceRowId: "header-row", cells: [] },
      {
        kind: "materialized-content",
        rowInstanceId: "rowi_000000000001",
        rowSourceId: "items-source",
        rowTemplateId: "item-template",
        itemKey: "item-1",
        cells: [{
          sourceCellId: "item-cell",
          cellInstanceId: "celli_000000000001",
          childIds: ["text-1", "image-1", "divider-1", "spacer-1"],
          nodes: {
            "text-1": {
              id: "text-1", type: "text-block", role: { role: "paragraph" }, props: {},
              children: [{ id: "inline-1", type: "text", text: "Item" }],
            },
            "image-1": {
              id: "image-1", type: "image",
              source: { kind: "image-field-ref", fieldKey: "photo" },
              accessibility: { kind: "decorative" },
              props: {
                frame: {
                  width: { value: 20, unit: "mm" }, height: { value: 10, unit: "mm" }, fit: "contain",
                },
                align: "left",
              },
            },
            "divider-1": {
              id: "divider-1", type: "divider",
              props: {
                color: "CBD5E1", thickness: { value: 1, unit: "pt" },
                marginBefore: { value: 2, unit: "pt" }, marginAfter: { value: 3, unit: "pt" }, style: "solid",
              },
            },
            "spacer-1": { id: "spacer-1", type: "spacer", props: { height: 4 } },
          },
        }],
      },
    ],
    bindings: {
      text: [],
      images: [{
        kind: "image", resolvedPlacementId: "image-1", sourcePlacementId: "source-image",
        scope: "collection-item-field", fieldKey: "photo", collectionFieldKey: "items", itemKey: "item-1",
        assetId: "photo-1", assetOwner: "instance-media", valueSource: "item-snapshot",
      }],
    },
    provenance: [],
    work: {
      rowCount: 2, materializedRowCount: 1, authoredReferenceRowCount: 1, cellCount: 1,
      clonedNodeCount: 4, clonedInlineCount: 1, textBindingCount: 0, imageBindingCount: 1,
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
  return {
    source: "vnext-table-text-fragment-evidence",
    contractVersion: 1,
    status: "ready",
    documentId: "instance-1",
    instanceRevision: 7,
    tableId: "orders-table",
    tableDefinitionId: "orders-definition",
    geometryFingerprint: readyGeometry.geometry.fingerprint,
    measurementProfileId: "profile-v1",
    fragmentSourcesByTextBlockId: {
      "text-1": {
        source: "vnext-table-text-fragment-evidence",
        contractVersion: 1,
        kind: "text-block-lines",
        nodeId: "text-1",
        rowIdentity: { kind: "resolved-row", rowInstanceId: "rowi_000000000001" },
        cellIdentity: { kind: "resolved-cell", cellInstanceId: "celli_000000000001" },
        sourceCellId: "item-cell",
        availableWidthPt: 188,
        measurementProfileId: "profile-v1",
        candidates: [{
          candidateId: "text-1:table-line-0", nodeId: "text-1", candidateIndex: 0,
          kind: "text-line", heightPt: 12, breakAfter: true,
          sourceStart: {
            textBlockId: "text-1", inlineId: "inline-1", authoredOffset: 0,
            resolvedOffset: 0, affinity: "forward",
          },
          sourceEnd: {
            textBlockId: "text-1", inlineId: "inline-1", authoredOffset: 4,
            resolvedOffset: 4, affinity: "backward",
          },
        }],
        prefixHeightsPt: [0, 12],
        totalHeightPt: 12,
        fingerprint: "text-fragment-1",
      },
    },
    work: { requestCount: 1, measuredLineCount: 1, candidateCount: 1 },
    execution: { measurement: "accepted-external", pagination: "not-run", rendering: "not-run" },
    issues: [],
  }
}

describe("prepared materialized Table cells v1", () => {
  it("assembles ordered text and atomic candidates with exact prefix heights", () => {
    const content = materialization()
    const before = JSON.stringify(content)
    const result = createVNextTablePreparedMaterializedCellsV1({
      definition: definition(), materialization: content, geometry: geometry(), textEvidence: textEvidence(),
    })

    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.authoredReferenceRowsPending).toBe(1)
    expect(result.rows[0]).toMatchObject({
      rowIndex: 1,
      rowInstanceId: "rowi_000000000001",
      breakPolicy: "prefer-keep",
      minimumFirstFragmentHeightPt: 20,
      cells: [{
        sourceCellId: "item-cell",
        contentWidthPt: 188,
        prefixHeightsPt: [0, 12, 40.346457, 46.346457, 50.346457],
        contentHeightPt: 50.346457,
        outerHeightPt: 58.346457,
      }],
    })
    expect(result.rows[0].cells[0].candidates.map((candidate) => [candidate.kind, candidate.atomic])).toEqual([
      ["text-line", false], ["image", true], ["divider", true], ["spacer", true],
    ])
    expect(result.rows[0].cells[0].children.map((child) => [
      child.kind, child.candidateStartIndex, child.candidateEndIndexExclusive,
    ])).toEqual([
      ["text-block-lines", 0, 1], ["image", 1, 2], ["divider", 2, 3], ["spacer", 3, 4],
    ])
    expect(result.work).toEqual({
      inputRowCount: 2, preparedRowCount: 1, preparedCellCount: 1, visitedNodeCount: 4,
      textLineCandidateCount: 1, atomicCandidateCount: 3, candidateCount: 4,
    })
    expect(result.execution.pagination).toBe("not-run")
    expect(JSON.stringify(content)).toBe(before)
  })

  it("blocks stale text context and missing block-image bindings", () => {
    const staleText = textEvidence()
    staleText.fragmentSourcesByTextBlockId["text-1"].availableWidthPt = 100
    const missingImage = materialization()
    missingImage.bindings.images = []

    expect(createVNextTablePreparedMaterializedCellsV1({
      definition: definition(), materialization: materialization(), geometry: geometry(), textEvidence: staleText,
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "text-fragment-context-mismatch" })] })
    expect(createVNextTablePreparedMaterializedCellsV1({
      definition: definition(), materialization: missingImage, geometry: geometry(), textEvidence: textEvidence(),
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "missing-block-image-binding" })] })
  })

  it("blocks images wider than the cell and unsupported child families", () => {
    const wide = materialization()
    const row = wide.rows[1]
    if (row.kind !== "materialized-content") throw new Error("fixture row missing")
    const image = row.cells[0].nodes["image-1"]
    if (image.type !== "image") throw new Error("fixture image missing")
    image.props.frame.width = { value: 300, unit: "pt" }
    const unsupported = materialization()
    const unsupportedRow = unsupported.rows[1]
    if (unsupportedRow.kind !== "materialized-content") throw new Error("fixture row missing")
    unsupportedRow.cells[0].childIds = ["toc-1"]
    unsupportedRow.cells[0].nodes = { "toc-1": { id: "toc-1", type: "toc", props: {} } }

    expect(createVNextTablePreparedMaterializedCellsV1({
      definition: definition(), materialization: wide, geometry: geometry(), textEvidence: textEvidence(),
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "image-frame-exceeds-cell-width" })] })
    expect(createVNextTablePreparedMaterializedCellsV1({
      definition: definition(), materialization: unsupported, geometry: geometry(), textEvidence: {
        ...textEvidence(), fragmentSourcesByTextBlockId: {}, work: { requestCount: 0, measuredLineCount: 0, candidateCount: 0 },
      },
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "unsupported-table-cell-child" })] })
  })
})
