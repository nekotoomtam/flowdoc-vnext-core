import { createHash } from "node:crypto"
import {
  DocumentNodeV4TargetSchema,
  VNextPublishedCollectionItemContractV1Schema,
  VNextPublishedFieldContractV1Schema,
  VNextPublishedStaticMediaV1Schema,
  VNextPublishedStructureVersionIdentityV1Schema,
  VNextPublishedStyleCatalogV1Schema,
  VNextStructurePolicySetV1Schema,
  VNextTableDefinitionV1Schema,
  VNextPublishedTableContentBindingContractV1Schema,
  createVNextTableContentSourcePlanV1,
  validateVNextDocumentV4Structure,
  validateVNextTableContentContractsV1,
  type DocumentNodeV4Target,
  type InlineNodeV4Target,
  type TextBlockNodeV4Target,
  type VNextPublishedCollectionItemContractV1,
  type VNextPublishedFieldContractV1,
  type VNextPublishedStaticMediaV1,
  type VNextPublishedStructureVersionIdentityV1,
  type VNextPublishedStructureVersionRefV1,
  type VNextPublishedStyleCatalogV1,
  type VNextPublishedTableContentBindingContractV1,
  type VNextStructurePolicySetV1,
  type VNextTableDefinitionV1,
} from "@flowdoc/vnext-core"

export const FLOWDOC_UAT_STRUCTURE_DEFINITION_VERSION = 1 as const
export const FLOWDOC_UAT_STRUCTURE_ID = "structure-uat-record" as const
export const FLOWDOC_UAT_STRUCTURE_VERSION_ID = "structure-uat-record-v1" as const

export type FlowDocUatRegionKind = "fixed" | "data-bound" | "repeated" | "instance-editable" | "generated"

export interface FlowDocUatStructureRegionV1 {
  regionId: string
  kind: FlowDocUatRegionKind
  nodeIds: string[]
  collectionFieldKey: string | null
}

export interface FlowDocUatStructureDefinitionV1 {
  contractVersion: typeof FLOWDOC_UAT_STRUCTURE_DEFINITION_VERSION
  kind: "uat-structure-definition"
  structure: VNextPublishedStructureVersionIdentityV1
  starterDocument: DocumentNodeV4Target
  policySet: VNextStructurePolicySetV1
  fieldContract: VNextPublishedFieldContractV1
  collectionItemContract: VNextPublishedCollectionItemContractV1
  styleCatalog: VNextPublishedStyleCatalogV1
  staticMedia: VNextPublishedStaticMediaV1
  tables: {
    requirements: {
      definition: VNextTableDefinitionV1
      bindingContract: VNextPublishedTableContentBindingContractV1
    }
    screenshots: {
      definition: VNextTableDefinitionV1
      bindingContract: VNextPublishedTableContentBindingContractV1
    }
  }
  regions: FlowDocUatStructureRegionV1[]
  instanceEditableBindings: Array<
    | { scope: "document-field"; fieldKey: string }
    | { scope: "collection-item-field"; collectionFieldKey: string; itemFieldKey: string }
  >
  ownership: {
    sourceAdapterOwns: ["source-shape-validation", "data-projection", "source-provenance"]
    structureOwns: ["starter-graph", "field-contracts", "table-contracts", "styles", "composition-intent"]
    downstreamOwns: ["instance-identity", "resolution", "measurement", "pagination", "artifact"]
  }
  contracts: {
    canonicalCoreNodeTypesOnly: true
    sourceSchemaInCanonicalCore: false
    packageSchemaChanged: false
    documentSchemaChanged: false
    materializationExecuted: false
    paginationExecuted: false
    rendererExecuted: false
    productionBinding: false
  }
  summary: {
    sectionCount: number
    nodeCount: number
    fieldCount: number
    collectionCount: number
    tableDefinitionCount: number
    regionCount: number
    instanceEditableBindingCount: number
  }
  structureFingerprint: string
}

function mm(value: number) {
  return { value, unit: "mm" as const }
}

function text(id: string, value: string): InlineNodeV4Target {
  return { id, type: "text", text: value }
}

function fieldRef(id: string, key: string, label?: string): InlineNodeV4Target {
  return { id, type: "field-ref", key, ...(label == null ? {} : { label }) }
}

function textBlock(
  id: string,
  role: TextBlockNodeV4Target["role"],
  children: InlineNodeV4Target[],
  textStyleId: string,
): TextBlockNodeV4Target {
  return { id, type: "text-block", role, props: { textStyleId }, children }
}

function publishedIdentity(): VNextPublishedStructureVersionIdentityV1 {
  return {
    contractVersion: 1,
    kind: "published-structure-version",
    structureId: FLOWDOC_UAT_STRUCTURE_ID,
    structureVersionId: FLOWDOC_UAT_STRUCTURE_VERSION_ID,
    versionOrdinal: 1,
    sourceDraft: {
      structureId: FLOWDOC_UAT_STRUCTURE_ID,
      draftId: "draft-uat-record-v1",
      revision: 1,
    },
  }
}

export function flowDocUatPublishedStructureRefV1(): VNextPublishedStructureVersionRefV1 {
  return {
    structureId: FLOWDOC_UAT_STRUCTURE_ID,
    structureVersionId: FLOWDOC_UAT_STRUCTURE_VERSION_ID,
    versionOrdinal: 1,
  }
}

function starterDocument(): DocumentNodeV4Target {
  const nodes: DocumentNodeV4Target["document"]["sections"][number]["nodes"] = {
    "uat-header-zone": {
      id: "uat-header-zone", type: "zone", role: "header", childIds: ["uat-header-title"],
    },
    "uat-header-title": textBlock(
      "uat-header-title", { role: "label" },
      [fieldRef("uat-header-title-field", "uat.document.title", "Document title")], "uat-header",
    ),
    "uat-footer-zone": {
      id: "uat-footer-zone", type: "zone", role: "footer", childIds: ["uat-footer-page-number"],
    },
    "uat-footer-page-number": textBlock(
      "uat-footer-page-number", { role: "label" },
      [text("uat-footer-page-label", "Page "), { id: "uat-footer-page-value", type: "page-number" }], "uat-footer",
    ),
    "uat-body-zone": {
      id: "uat-body-zone", type: "zone", role: "body",
      childIds: [
        "uat-module-heading",
        "uat-section-heading",
        "uat-section-description",
        "uat-requirements-table",
        "uat-screenshots-heading",
        "uat-screenshots-table",
        "uat-approval-divider",
        "uat-approval-table",
      ],
    },
    "uat-module-heading": textBlock(
      "uat-module-heading", { role: "heading", level: 1 },
      [
        fieldRef("uat-module-number-field", "uat.module.number", "Module number"),
        text("uat-module-heading-separator", " "),
        fieldRef("uat-module-title-field", "uat.module.title", "Module title"),
      ], "uat-module-heading",
    ),
    "uat-section-heading": textBlock(
      "uat-section-heading", { role: "heading", level: 2 },
      [
        fieldRef("uat-section-number-field", "uat.section.number", "Section number"),
        text("uat-section-heading-separator", " "),
        fieldRef("uat-section-title-field", "uat.section.title", "Section title"),
      ], "uat-section-heading",
    ),
    "uat-section-description": textBlock(
      "uat-section-description", { role: "paragraph" },
      [fieldRef("uat-section-description-field", "uat.section.description", "Section description")], "uat-body",
    ),
    "uat-requirements-table": {
      id: "uat-requirements-table", type: "table",
      props: { headerRowCount: 1, repeatHeaderRows: true, align: "center", marginTop: mm(3), marginBottom: mm(5) },
      columns: [{ width: mm(18.6) }, { width: mm(111.6) }, { width: mm(27.9) }, { width: mm(27.9) }],
      rowIds: ["uat-requirements-header-row", "uat-requirement-template-row"],
    },
    "uat-requirements-header-row": {
      id: "uat-requirements-header-row", type: "table-row", props: { allowBreak: false },
      cellIds: ["uat-req-header-id-cell", "uat-req-header-feature-cell", "uat-req-header-accept-cell", "uat-req-header-remark-cell"],
    },
    "uat-req-header-id-cell": {
      id: "uat-req-header-id-cell", type: "table-cell", props: { verticalAlign: "middle" }, childIds: ["uat-req-header-id-text"],
    },
    "uat-req-header-id-text": textBlock(
      "uat-req-header-id-text", { role: "label" }, [text("uat-req-header-id-label", "Req no.")], "uat-table-header",
    ),
    "uat-req-header-feature-cell": {
      id: "uat-req-header-feature-cell", type: "table-cell", props: { verticalAlign: "middle" }, childIds: ["uat-req-header-feature-text"],
    },
    "uat-req-header-feature-text": textBlock(
      "uat-req-header-feature-text", { role: "label" }, [text("uat-req-header-feature-label", "Features List")], "uat-table-header",
    ),
    "uat-req-header-accept-cell": {
      id: "uat-req-header-accept-cell", type: "table-cell", props: { verticalAlign: "middle" }, childIds: ["uat-req-header-accept-text"],
    },
    "uat-req-header-accept-text": textBlock(
      "uat-req-header-accept-text", { role: "label" }, [text("uat-req-header-accept-label", "Accept")], "uat-table-header",
    ),
    "uat-req-header-remark-cell": {
      id: "uat-req-header-remark-cell", type: "table-cell", props: { verticalAlign: "middle" }, childIds: ["uat-req-header-remark-text"],
    },
    "uat-req-header-remark-text": textBlock(
      "uat-req-header-remark-text", { role: "label" }, [text("uat-req-header-remark-label", "Remark")], "uat-table-header",
    ),
    "uat-requirement-template-row": {
      id: "uat-requirement-template-row", type: "table-row", props: { allowBreak: true },
      cellIds: ["uat-req-id-cell", "uat-req-feature-cell", "uat-req-accept-cell", "uat-req-remark-cell"],
    },
    "uat-req-id-cell": {
      id: "uat-req-id-cell", type: "table-cell", props: { verticalAlign: "top" }, childIds: ["uat-req-id-text"],
    },
    "uat-req-id-text": textBlock(
      "uat-req-id-text", { role: "paragraph" },
      [fieldRef("uat-req-id-placement", "requirement_id", "Requirement id")], "uat-table-body",
    ),
    "uat-req-feature-cell": {
      id: "uat-req-feature-cell", type: "table-cell", props: { verticalAlign: "top" }, childIds: ["uat-req-feature-text"],
    },
    "uat-req-feature-text": textBlock(
      "uat-req-feature-text", { role: "paragraph" },
      [fieldRef("uat-req-feature-placement", "feature_text", "Feature text")], "uat-table-body",
    ),
    "uat-req-accept-cell": {
      id: "uat-req-accept-cell", type: "table-cell", props: { verticalAlign: "top" }, childIds: ["uat-req-accept-text"],
    },
    "uat-req-accept-text": textBlock(
      "uat-req-accept-text", { role: "paragraph" },
      [fieldRef("uat-req-accept-placement", "accept_status", "Accept status")], "uat-table-body",
    ),
    "uat-req-remark-cell": {
      id: "uat-req-remark-cell", type: "table-cell", props: { verticalAlign: "top" }, childIds: ["uat-req-remark-text"],
    },
    "uat-req-remark-text": textBlock(
      "uat-req-remark-text", { role: "paragraph" },
      [fieldRef("uat-req-remark-placement", "remark", "Remark")], "uat-table-body",
    ),
    "uat-screenshots-heading": textBlock(
      "uat-screenshots-heading", { role: "heading", level: 3 },
      [text("uat-screenshots-heading-text", "Screenshots")], "uat-section-heading",
    ),
    "uat-screenshots-table": {
      id: "uat-screenshots-table", type: "table",
      props: { headerRowCount: 0, repeatHeaderRows: false, align: "center", marginTop: mm(2), marginBottom: mm(5) },
      columns: [{ width: mm(186) }], rowIds: ["uat-screenshot-template-row"],
    },
    "uat-screenshot-template-row": {
      id: "uat-screenshot-template-row", type: "table-row", props: { allowBreak: true }, cellIds: ["uat-screenshot-cell"],
    },
    "uat-screenshot-cell": {
      id: "uat-screenshot-cell", type: "table-cell", props: { verticalAlign: "top" },
      childIds: ["uat-screenshot-caption", "uat-screenshot-image", "uat-screenshot-description"],
    },
    "uat-screenshot-caption": textBlock(
      "uat-screenshot-caption", { role: "caption" },
      [fieldRef("uat-screenshot-caption-placement", "caption", "Screenshot caption")], "uat-caption",
    ),
    "uat-screenshot-image": {
      id: "uat-screenshot-image", type: "image",
      source: { kind: "image-field-ref", fieldKey: "image" },
      accessibility: { kind: "described", altText: "UAT screenshot" },
      props: { frame: { width: mm(170), height: mm(100), fit: "contain" }, align: "center" },
    },
    "uat-screenshot-description": textBlock(
      "uat-screenshot-description", { role: "note" },
      [fieldRef("uat-screenshot-description-placement", "description", "Screenshot description")], "uat-body",
    ),
    "uat-approval-divider": {
      id: "uat-approval-divider", type: "divider",
      props: {
        color: "64748B", thickness: { value: 0.5, unit: "pt" },
        marginBefore: { value: 8, unit: "pt" }, marginAfter: { value: 8, unit: "pt" }, style: "solid",
      },
    },
    "uat-approval-table": {
      id: "uat-approval-table", type: "table", props: { headerRowCount: 0, repeatHeaderRows: false },
      columns: [{ width: mm(93) }, { width: mm(93) }], rowIds: ["uat-approval-row"],
    },
    "uat-approval-row": {
      id: "uat-approval-row", type: "table-row", props: { allowBreak: false },
      cellIds: ["uat-approval-name-cell", "uat-approval-date-cell"],
    },
    "uat-approval-name-cell": {
      id: "uat-approval-name-cell", type: "table-cell", props: { verticalAlign: "bottom" }, childIds: ["uat-approval-name"],
    },
    "uat-approval-name": textBlock(
      "uat-approval-name", { role: "paragraph" },
      [text("uat-approval-name-label", "Approved By: "), fieldRef("uat-approval-name-field", "uat.approval.name")], "uat-body",
    ),
    "uat-approval-date-cell": {
      id: "uat-approval-date-cell", type: "table-cell", props: { verticalAlign: "bottom" }, childIds: ["uat-approval-date"],
    },
    "uat-approval-date": textBlock(
      "uat-approval-date", { role: "paragraph" },
      [text("uat-approval-date-label", "Date: "), fieldRef("uat-approval-date-field", "uat.approval.date")], "uat-body",
    ),
  }

  return {
    version: 4,
    document: {
      id: "structure-uat-record-v1-starter",
      meta: { title: "UAT Record Structure" },
      sections: [{
        id: "uat-main-section",
        type: "section",
        page: {
          size: "A4", orientation: "portrait",
          margin: { top: mm(20), right: mm(12), bottom: mm(16), left: mm(12) },
          headerReserved: 42,
          footerReserved: 24,
          headerFooterHorizontalMode: "body",
          pageNumberStart: 1,
        },
        zoneIds: ["uat-header-zone", "uat-body-zone", "uat-footer-zone"],
        nodes,
      }],
    },
  }
}

function fieldContract(owner: VNextPublishedStructureVersionRefV1): VNextPublishedFieldContractV1 {
  const fields: VNextPublishedFieldContractV1["registry"]["fields"] = {}
  const add = (key: string, label: string, type: "text" | "number" | "date" | "collection") => {
    fields[key] = { key, label, type }
  }
  add("uat.document.title", "Document title", "text")
  add("uat.document.project", "Project", "text")
  add("uat.document.version", "Version", "text")
  add("uat.document.author", "Author", "text")
  add("uat.document.updated_date", "Updated date", "date")
  add("uat.document.source_file_name", "Source file", "text")
  add("uat.document.total_pages", "Source page count", "number")
  add("uat.module.number", "Module number", "text")
  add("uat.module.title", "Module title", "text")
  add("uat.module.description", "Module description", "text")
  add("uat.section.number", "Section number", "text")
  add("uat.section.title", "Section title", "text")
  add("uat.section.description", "Section description", "text")
  add("uat.approval.name", "Approved by", "text")
  add("uat.approval.date", "Approval date", "date")
  add("uat.requirements", "Requirements", "collection")
  add("uat.screenshots", "Screenshots", "collection")
  return {
    contractVersion: 1,
    kind: "published-field-contract",
    fieldContractId: "uat-record-fields-v1",
    owner,
    registry: { version: 1, fields },
  }
}

function collectionItemContract(
  owner: VNextPublishedStructureVersionRefV1,
): VNextPublishedCollectionItemContractV1 {
  return {
    contractVersion: 1,
    kind: "published-collection-item-contract",
    collectionItemContractId: "uat-record-collection-items-v1",
    publishedFieldContractId: "uat-record-fields-v1",
    owner,
    collections: {
      "uat.requirements": {
        collectionFieldKey: "uat.requirements",
        fields: {
          requirement_id: { key: "requirement_id", label: "Requirement id", type: "text", required: true },
          feature_text: { key: "feature_text", label: "Features List", type: "text", required: true },
          element_types: { key: "element_types", label: "Element types", type: "text", required: true },
          accept_status: { key: "accept_status", label: "Accept", type: "enum", required: true },
          remark: { key: "remark", label: "Remark", type: "text", required: true },
          linked_screenshot_ids: { key: "linked_screenshot_ids", label: "Linked screenshots", type: "text", required: true },
        },
      },
      "uat.screenshots": {
        collectionFieldKey: "uat.screenshots",
        fields: {
          screenshot_id: { key: "screenshot_id", label: "Screenshot id", type: "text", required: true },
          caption: { key: "caption", label: "Caption", type: "text", required: true },
          description: { key: "description", label: "Description", type: "text", required: true },
          image: { key: "image", label: "Image", type: "image", required: true },
          linked_requirement_ids: { key: "linked_requirement_ids", label: "Linked requirements", type: "text", required: true },
          match_basis: { key: "match_basis", label: "Match basis", type: "enum", required: true },
          confidence: { key: "confidence", label: "Confidence", type: "enum", required: true },
        },
      },
    },
  }
}

function requirementTableDefinition(owner: VNextPublishedStructureVersionRefV1): VNextTableDefinitionV1 {
  return {
    contractVersion: 1,
    kind: "table-definition",
    tableDefinitionId: "uat-requirements-table-definition-v1",
    owner: { kind: "published-structure-version", ref: owner },
    tableId: "uat-requirements-table",
    headerPolicy: "repeat-leading-headers",
    columns: [
      { columnId: "requirement-id", widthShare: 10 },
      { columnId: "feature-text", widthShare: 60 },
      { columnId: "accept-status", widthShare: 15 },
      { columnId: "remark", widthShare: 15 },
    ],
    rowSources: [
      { kind: "static-row", rowSourceId: "uat-requirements-header-source", rowTemplateId: "uat-requirements-header", role: "header" },
      {
        kind: "collection-rows", rowSourceId: "uat-requirements-collection-source",
        collectionFieldKey: "uat.requirements", rowTemplateId: "uat-requirement-body", role: "body",
        emptyPolicy: { kind: "header-only" },
      },
    ],
    rowTemplates: {
      "uat-requirements-header": {
        rowTemplateId: "uat-requirements-header", sourceRowId: "uat-requirements-header-row", breakPolicy: "strict-keep",
        cells: [
          { cellId: "uat-req-header-id-cell", columnStart: 0, colSpan: 1, rowSpan: 1 },
          { cellId: "uat-req-header-feature-cell", columnStart: 1, colSpan: 1, rowSpan: 1 },
          { cellId: "uat-req-header-accept-cell", columnStart: 2, colSpan: 1, rowSpan: 1 },
          { cellId: "uat-req-header-remark-cell", columnStart: 3, colSpan: 1, rowSpan: 1 },
        ],
      },
      "uat-requirement-body": {
        rowTemplateId: "uat-requirement-body", sourceRowId: "uat-requirement-template-row", breakPolicy: "allow",
        cells: [
          { cellId: "uat-req-id-cell", columnStart: 0, colSpan: 1, rowSpan: 1 },
          { cellId: "uat-req-feature-cell", columnStart: 1, colSpan: 1, rowSpan: 1 },
          { cellId: "uat-req-accept-cell", columnStart: 2, colSpan: 1, rowSpan: 1 },
          { cellId: "uat-req-remark-cell", columnStart: 3, colSpan: 1, rowSpan: 1 },
        ],
      },
    },
  }
}

function requirementBinding(owner: VNextPublishedStructureVersionRefV1): VNextPublishedTableContentBindingContractV1 {
  const item = (sourcePlacementId: string, itemFieldKey: string) => ({
    sourcePlacementId,
    placementKind: "text-field-ref" as const,
    binding: { scope: "collection-item-field" as const, collectionFieldKey: "uat.requirements", itemFieldKey },
  })
  return {
    contractVersion: 1,
    kind: "published-table-content-binding-contract",
    tableContentBindingContractId: "uat-requirements-table-bindings-v1",
    owner,
    tableDefinitionId: "uat-requirements-table-definition-v1",
    tableId: "uat-requirements-table",
    rowTemplates: {
      "uat-requirement-body": {
        rowTemplateId: "uat-requirement-body",
        placements: {
          "uat-req-id-placement": item("uat-req-id-placement", "requirement_id"),
          "uat-req-feature-placement": item("uat-req-feature-placement", "feature_text"),
          "uat-req-accept-placement": item("uat-req-accept-placement", "accept_status"),
          "uat-req-remark-placement": item("uat-req-remark-placement", "remark"),
        },
      },
    },
  }
}

function screenshotTableDefinition(owner: VNextPublishedStructureVersionRefV1): VNextTableDefinitionV1 {
  return {
    contractVersion: 1,
    kind: "table-definition",
    tableDefinitionId: "uat-screenshots-table-definition-v1",
    owner: { kind: "published-structure-version", ref: owner },
    tableId: "uat-screenshots-table",
    headerPolicy: "no-repeat",
    columns: [{ columnId: "screenshot", widthShare: 100 }],
    rowSources: [{
      kind: "collection-rows", rowSourceId: "uat-screenshots-collection-source",
      collectionFieldKey: "uat.screenshots", rowTemplateId: "uat-screenshot-body", role: "body",
      emptyPolicy: { kind: "hide-table" },
    }],
    rowTemplates: {
      "uat-screenshot-body": {
        rowTemplateId: "uat-screenshot-body", sourceRowId: "uat-screenshot-template-row", breakPolicy: "prefer-keep",
        cells: [{ cellId: "uat-screenshot-cell", columnStart: 0, colSpan: 1, rowSpan: 1 }],
      },
    },
  }
}

function screenshotBinding(owner: VNextPublishedStructureVersionRefV1): VNextPublishedTableContentBindingContractV1 {
  return {
    contractVersion: 1,
    kind: "published-table-content-binding-contract",
    tableContentBindingContractId: "uat-screenshots-table-bindings-v1",
    owner,
    tableDefinitionId: "uat-screenshots-table-definition-v1",
    tableId: "uat-screenshots-table",
    rowTemplates: {
      "uat-screenshot-body": {
        rowTemplateId: "uat-screenshot-body",
        placements: {
          "uat-screenshot-caption-placement": {
            sourcePlacementId: "uat-screenshot-caption-placement", placementKind: "text-field-ref",
            binding: { scope: "collection-item-field", collectionFieldKey: "uat.screenshots", itemFieldKey: "caption" },
          },
          "uat-screenshot-image": {
            sourcePlacementId: "uat-screenshot-image", placementKind: "image-field-ref",
            binding: { scope: "collection-item-field", collectionFieldKey: "uat.screenshots", itemFieldKey: "image" },
          },
          "uat-screenshot-description-placement": {
            sourcePlacementId: "uat-screenshot-description-placement", placementKind: "text-field-ref",
            binding: { scope: "collection-item-field", collectionFieldKey: "uat.screenshots", itemFieldKey: "description" },
          },
        },
      },
    },
  }
}

function styleCatalog(owner: VNextPublishedStructureVersionRefV1): VNextPublishedStyleCatalogV1 {
  const style = (
    key: string,
    fontSize: number,
    fontWeight: "normal" | "bold" = "normal",
    textColor = "111827",
  ) => ({
    key,
    runStyle: {
      fontSize: { value: fontSize, unit: "pt" as const },
      fontFamilyKey: "flowdoc-thai-sans",
      fontWeight,
      textColor,
    },
  })
  return {
    contractVersion: 1,
    kind: "published-style-catalog",
    catalogId: "uat-record-styles-v1",
    owner,
    styles: {
      "uat-header": style("uat-header", 10, "bold", "334155"),
      "uat-footer": style("uat-footer", 9, "normal", "475569"),
      "uat-module-heading": style("uat-module-heading", 18, "bold"),
      "uat-section-heading": style("uat-section-heading", 15, "bold"),
      "uat-body": style("uat-body", 12),
      "uat-table-header": style("uat-table-header", 11, "bold"),
      "uat-table-body": style("uat-table-body", 11),
      "uat-caption": style("uat-caption", 11, "bold"),
    },
  }
}

function structurePolicy(owner: VNextPublishedStructureVersionRefV1): VNextStructurePolicySetV1 {
  return {
    contractVersion: 1,
    kind: "structure-policy-set",
    policySetId: "uat-record-policy-v1",
    owner: { kind: "published-structure-version", ref: owner },
    defaultPolicyKey: "uat-governed",
    policies: {
      "uat-governed": {
        key: "uat-governed",
        nodeActions: [],
        allowedStyleKeys: [
          "uat-header", "uat-footer", "uat-module-heading", "uat-section-heading",
          "uat-body", "uat-table-header", "uat-table-body", "uat-caption",
        ],
        children: {
          actions: [],
          allowedChildTypes: ["text-block", "table", "divider", "image"],
          minChildren: 0,
          maxChildren: null,
        },
      },
    },
    nodeBindings: {},
  }
}

function fingerprint(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex")}`
}

function validateAcceptedStructure(bundle: Omit<FlowDocUatStructureDefinitionV1, "structureFingerprint">): void {
  VNextPublishedStructureVersionIdentityV1Schema.parse(bundle.structure)
  DocumentNodeV4TargetSchema.parse(bundle.starterDocument)
  VNextStructurePolicySetV1Schema.parse(bundle.policySet)
  VNextPublishedFieldContractV1Schema.parse(bundle.fieldContract)
  VNextPublishedCollectionItemContractV1Schema.parse(bundle.collectionItemContract)
  VNextPublishedStyleCatalogV1Schema.parse(bundle.styleCatalog)
  VNextPublishedStaticMediaV1Schema.parse(bundle.staticMedia)
  VNextTableDefinitionV1Schema.parse(bundle.tables.requirements.definition)
  VNextTableDefinitionV1Schema.parse(bundle.tables.screenshots.definition)
  VNextPublishedTableContentBindingContractV1Schema.parse(bundle.tables.requirements.bindingContract)
  VNextPublishedTableContentBindingContractV1Schema.parse(bundle.tables.screenshots.bindingContract)

  const structure = validateVNextDocumentV4Structure(bundle.starterDocument)
  if (structure.status !== "valid") throw new Error(`invalid UAT starter graph: ${JSON.stringify(structure.issues)}`)
  const styleKeys = new Set(Object.keys(bundle.styleCatalog.styles))
  const missingStyleReferences = bundle.starterDocument.document.sections.flatMap((section) => (
    Object.values(section.nodes).flatMap((node) => (
      node.type === "text-block" && node.props.textStyleId != null && !styleKeys.has(node.props.textStyleId)
        ? [{ nodeId: node.id, textStyleId: node.props.textStyleId }]
        : []
    ))
  ))
  if (missingStyleReferences.length > 0) {
    throw new Error(`invalid UAT style references: ${JSON.stringify(missingStyleReferences)}`)
  }
  for (const table of Object.values(bundle.tables)) {
    const validation = validateVNextTableContentContractsV1({
      definition: table.definition,
      fieldContract: bundle.fieldContract,
      itemContract: bundle.collectionItemContract,
      bindingContract: table.bindingContract,
    })
    if (validation.status !== "ready") throw new Error(`invalid UAT table contract: ${JSON.stringify(validation.issues)}`)
    const sourcePlan = createVNextTableContentSourcePlanV1({
      document: bundle.starterDocument,
      definition: table.definition,
      fieldContract: bundle.fieldContract,
      itemContract: bundle.collectionItemContract,
      bindingContract: table.bindingContract,
    })
    if (sourcePlan.status !== "ready") {
      throw new Error(`invalid UAT table source graph: ${JSON.stringify(sourcePlan.issues)}`)
    }
  }
}

export function createFlowDocUatStructureDefinitionV1(): FlowDocUatStructureDefinitionV1 {
  const structure = publishedIdentity()
  const owner = flowDocUatPublishedStructureRefV1()
  const starter = starterDocument()
  const fields = fieldContract(owner)
  const items = collectionItemContract(owner)
  const requirements = {
    definition: requirementTableDefinition(owner),
    bindingContract: requirementBinding(owner),
  }
  const screenshots = {
    definition: screenshotTableDefinition(owner),
    bindingContract: screenshotBinding(owner),
  }
  const regions: FlowDocUatStructureRegionV1[] = [
    { regionId: "uat-header", kind: "fixed", nodeIds: ["uat-header-zone"], collectionFieldKey: null },
    { regionId: "uat-section-identity", kind: "data-bound", nodeIds: ["uat-module-heading", "uat-section-heading", "uat-section-description"], collectionFieldKey: null },
    { regionId: "uat-requirements", kind: "repeated", nodeIds: ["uat-requirements-table"], collectionFieldKey: "uat.requirements" },
    { regionId: "uat-screenshots", kind: "repeated", nodeIds: ["uat-screenshots-heading", "uat-screenshots-table"], collectionFieldKey: "uat.screenshots" },
    { regionId: "uat-approval", kind: "instance-editable", nodeIds: ["uat-approval-table"], collectionFieldKey: null },
    { regionId: "uat-footer", kind: "generated", nodeIds: ["uat-footer-zone"], collectionFieldKey: null },
  ]
  const instanceEditableBindings: FlowDocUatStructureDefinitionV1["instanceEditableBindings"] = [
    { scope: "collection-item-field", collectionFieldKey: "uat.requirements", itemFieldKey: "accept_status" },
    { scope: "collection-item-field", collectionFieldKey: "uat.requirements", itemFieldKey: "remark" },
    { scope: "document-field", fieldKey: "uat.approval.name" },
    { scope: "document-field", fieldKey: "uat.approval.date" },
  ]
  const nodeCount = Object.keys(starter.document.sections[0].nodes).length
  const unsigned: Omit<FlowDocUatStructureDefinitionV1, "structureFingerprint"> = {
    contractVersion: FLOWDOC_UAT_STRUCTURE_DEFINITION_VERSION,
    kind: "uat-structure-definition",
    structure,
    starterDocument: starter,
    policySet: structurePolicy(owner),
    fieldContract: fields,
    collectionItemContract: items,
    styleCatalog: styleCatalog(owner),
    staticMedia: {
      contractVersion: 1,
      kind: "published-static-media",
      mediaRegistryId: "uat-record-static-media-v1",
      owner,
      registry: { version: 1, images: {} },
    },
    tables: { requirements, screenshots },
    regions,
    instanceEditableBindings,
    ownership: {
      sourceAdapterOwns: ["source-shape-validation", "data-projection", "source-provenance"],
      structureOwns: ["starter-graph", "field-contracts", "table-contracts", "styles", "composition-intent"],
      downstreamOwns: ["instance-identity", "resolution", "measurement", "pagination", "artifact"],
    },
    contracts: {
      canonicalCoreNodeTypesOnly: true,
      sourceSchemaInCanonicalCore: false,
      packageSchemaChanged: false,
      documentSchemaChanged: false,
      materializationExecuted: false,
      paginationExecuted: false,
      rendererExecuted: false,
      productionBinding: false,
    },
    summary: {
      sectionCount: starter.document.sections.length,
      nodeCount,
      fieldCount: Object.keys(fields.registry.fields).length,
      collectionCount: Object.keys(items.collections).length,
      tableDefinitionCount: 2,
      regionCount: regions.length,
      instanceEditableBindingCount: instanceEditableBindings.length,
    },
  }
  validateAcceptedStructure(unsigned)
  return { ...unsigned, structureFingerprint: fingerprint(unsigned) }
}
