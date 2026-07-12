import { describe, expect, it } from "vitest"
import {
  createVNextTableCellGeometryV1,
  createVNextTableTextMeasurementPreparationV1,
  type VNextPublishedStyleCatalogV1,
  type VNextTableContentMaterializationResultV1,
  type VNextTableDefinitionV1,
} from "../src/index.js"

const owner = {
  structureId: "orders",
  structureVersionId: "orders-v1",
  versionOrdinal: 1,
}

function definition(): VNextTableDefinitionV1 {
  return {
    contractVersion: 1,
    kind: "table-definition",
    tableDefinitionId: "orders-definition",
    owner: { kind: "published-structure-version", ref: { ...owner } },
    tableId: "orders-table",
    headerPolicy: "no-repeat",
    columns: [{ columnId: "label", widthShare: 40 }, { columnId: "value", widthShare: 60 }],
    rowSources: [{
      kind: "collection-rows",
      rowSourceId: "items-source",
      collectionFieldKey: "items",
      rowTemplateId: "item-template",
      role: "body",
      emptyPolicy: { kind: "header-only" },
    }],
    rowTemplates: {
      "item-template": {
        rowTemplateId: "item-template",
        sourceRowId: "item-row",
        breakPolicy: "allow",
        cells: [{ cellId: "item-cell", columnStart: 0, colSpan: 2, rowSpan: 1 }],
      },
    },
  }
}

function styleCatalog(): VNextPublishedStyleCatalogV1 {
  return {
    contractVersion: 1,
    kind: "published-style-catalog",
    catalogId: "styles-v1",
    owner: { ...owner },
    styles: {
      body: { key: "body", runStyle: { fontFamilyKey: "sarabun" } },
    },
  }
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
    rows: [{
      kind: "materialized-content",
      rowInstanceId: "rowi_000000000001",
      rowSourceId: "items-source",
      rowTemplateId: "item-template",
      itemKey: "item-1",
      cells: [{
        sourceCellId: "item-cell",
        cellInstanceId: "celli_000000000001",
        childIds: ["nodei_000000000001"],
        nodes: {
          "nodei_000000000001": {
            id: "nodei_000000000001",
            type: "text-block",
            role: { role: "paragraph" },
            props: { textStyleId: "body" },
            children: [
              { id: "inli_000000000001", type: "text", text: "Item " },
              { id: "inli_000000000002", type: "field-ref", key: "description" },
              {
                id: "inli_000000000003",
                type: "inline-image",
                source: { kind: "image-field-ref", fieldKey: "photo" },
                accessibility: { kind: "decorative" },
                frame: {
                  width: { value: 10, unit: "mm" },
                  height: { value: 5, unit: "mm" },
                  fit: "contain",
                },
                verticalAlign: "baseline",
              },
            ],
          },
        },
      }],
    }],
    bindings: {
      text: [{
        kind: "text",
        resolvedPlacementId: "inli_000000000002",
        sourcePlacementId: "description",
        scope: "collection-item-field",
        fieldKey: "description",
        collectionFieldKey: "items",
        itemKey: "item-1",
        value: "Keyboard",
        valueSource: "item-snapshot",
      }],
      images: [{
        kind: "image",
        resolvedPlacementId: "inli_000000000003",
        sourcePlacementId: "photo",
        scope: "collection-item-field",
        fieldKey: "photo",
        collectionFieldKey: "items",
        itemKey: "item-1",
        assetId: "photo-1",
        assetOwner: "instance-media",
        valueSource: "item-snapshot",
      }],
    },
    provenance: [],
    work: {
      rowCount: 1,
      materializedRowCount: 1,
      authoredReferenceRowCount: 0,
      cellCount: 1,
      clonedNodeCount: 1,
      clonedInlineCount: 3,
      textBindingCount: 1,
      imageBindingCount: 1,
      sourcePlanDocumentRootScans: 1,
      materializationDocumentRootScans: 1,
    },
    execution: {
      identityAllocation: "not-run",
      authoredGraphMutation: false,
      mediaFetch: "not-run",
      measurement: "not-run",
      pagination: "not-run",
      rendering: "not-run",
    },
    issues: [],
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
      layoutProfileId: "table-layout-v1",
      defaultInsetsPt: { top: 4, right: 8, bottom: 4, left: 8 },
      insetsByRowTemplate: {},
    },
  })
}

describe("table text measurement preparation v1", () => {
  it("prepares cloned collection text with exact geometry, bindings, style, and pins", () => {
    const content = materialization()
    const before = JSON.stringify(content)
    const result = createVNextTableTextMeasurementPreparationV1({
      definition: definition(),
      materialization: content,
      geometry: geometry(),
      styleCatalog: styleCatalog(),
      sectionId: "main",
      measurementProfileId: "thai-primary-v1",
    })

    expect(result.status).toBe("ready")
    if (result.status !== "ready") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.requestsByTextBlockId["nodei_000000000001"]).toMatchObject({
      rowIdentity: { kind: "resolved-row", rowInstanceId: "rowi_000000000001" },
      cellIdentity: { kind: "resolved-cell", cellInstanceId: "celli_000000000001" },
      sourceCellId: "item-cell",
      request: {
        documentId: "instance-1",
        instanceRevision: 7,
        sectionId: "main",
        availableWidthPt: 384,
        measurementProfileId: "thai-primary-v1",
        styleKey: "body",
        renderedText: `Item Keyboard\uFFFC`,
      },
    })
    expect(result.requestsByTextBlockId["nodei_000000000001"].request.runs.map((run) => [
      run.inlineId, run.kind, run.renderedText,
    ])).toEqual([
      ["inli_000000000001", "text", "Item "],
      ["inli_000000000002", "resolved-field", "Keyboard"],
      ["inli_000000000003", "inline-image", "\uFFFC"],
    ])
    expect(result.work).toEqual({
      rowCount: 1,
      materializedRowCount: 1,
      authoredReferenceRowCount: 0,
      cellCount: 1,
      visitedNodeCount: 1,
      textMeasurementRequestCount: 1,
    })
    expect(result.execution.measurement).toBe("not-run")
    expect(JSON.stringify(content)).toBe(before)
  })

  it("blocks missing cloned bindings before measurement", () => {
    const content = materialization()
    content.bindings.text = []
    expect(createVNextTableTextMeasurementPreparationV1({
      definition: definition(), materialization: content, geometry: geometry(),
      styleCatalog: styleCatalog(), sectionId: "main", measurementProfileId: "profile",
    })).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "resolved-field-binding-missing", textBlockId: "nodei_000000000001" })],
    })
  })

  it("blocks style owner and geometry drift", () => {
    const catalog = styleCatalog()
    catalog.owner.structureVersionId = "other-version"
    const wrongGeometry = geometry()
    if (wrongGeometry.status === "ready") wrongGeometry.geometry.tableDefinitionId = "other-definition"

    expect(createVNextTableTextMeasurementPreparationV1({
      definition: definition(), materialization: materialization(), geometry: geometry(),
      styleCatalog: catalog, sectionId: "main", measurementProfileId: "profile",
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "style-owner-mismatch" })] })
    expect(createVNextTableTextMeasurementPreparationV1({
      definition: definition(), materialization: materialization(), geometry: wrongGeometry,
      styleCatalog: styleCatalog(), sectionId: "main", measurementProfileId: "profile",
    })).toMatchObject({ status: "blocked", issues: [expect.objectContaining({ code: "geometry-definition-mismatch" })] })
  })

  it("leaves authored-reference rows on the existing resolved document path", () => {
    const content = materialization()
    content.rows = [{ kind: "authored-content-reference", sourceRowId: "header-row", cells: [] }]
    const result = createVNextTableTextMeasurementPreparationV1({
      definition: definition(), materialization: content, geometry: geometry(),
      styleCatalog: styleCatalog(), sectionId: "main", measurementProfileId: "profile",
    })

    expect(result).toMatchObject({
      status: "ready",
      requestsByTextBlockId: {},
      work: { materializedRowCount: 0, authoredReferenceRowCount: 1, textMeasurementRequestCount: 0 },
    })
  })
})
