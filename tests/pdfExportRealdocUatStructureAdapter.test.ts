import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  VNEXT_DOCUMENT_V4_AUTHORED_NODE_TYPES,
  VNextInstanceDataSnapshotV1Schema,
  VNextInstanceMediaSnapshotV1Schema,
  VNextTableCollectionSnapshotV1Schema,
  validateVNextDocumentV4Structure,
  createVNextTableContentSourcePlanV1,
  validateVNextTableContentContractsV1,
  type VNextDocumentInstanceIdentityV1,
} from "../src/index.js"
import {
  adaptFlowDocUatSemanticNoPagesSectionV1,
  createFlowDocUatStructureDefinitionV1,
  flowDocUatPublishedStructureRefV1,
  type FlowDocUatImageResourceInputV1,
  type FlowDocUatSemanticNoPagesAdapterInputV1,
  type UatSemanticNoPagesDocumentV1,
} from "../packages/uat-realdoc/src/index.js"

function semanticDocument(): UatSemanticNoPagesDocumentV1 {
  const requirementIds = ["REQ-SYNTH-001", "REQ-SYNTH-002"]
  const screenshotIds = ["synthetic_section_2_1_img_001", "synthetic_section_2_1_img_002"]
  return {
    document: {
      title: "User Acceptance Record",
      project: "Synthetic UAT",
      version: "1",
      author: "FlowDoc",
      updated_date: "19/07/2569",
      source_file_name: "synthetic.pdf",
      total_pages: 9,
      extraction_schema: "uat_semantic_no_pages_v1",
    },
    modules: [{
      module_id: "2_master_data",
      module_number: "2",
      title: "Master Data",
      description: "",
      sections: [{
        section_id: "2.1_ward_registry",
        section_number: "2.1",
        title: "ทะเบียนข้อมูลตัวอย่าง",
        description: "Ward Registry",
        has_requirements: true,
        screenshot_ids: screenshotIds,
        requirements: requirementIds.map((requirementId, index) => ({
          requirement_id: requirementId,
          feature_text: index === 0 ? "ข้อความภาษาไทย\nบรรทัดที่สอง" : "Second feature",
          feature_bullets: index === 0 ? ["หัวข้อหนึ่ง", "หัวข้อสอง"] : [],
          element_types: index === 0 ? ["Functional", "Security"] : ["Functional"],
          accept_status: "blank",
          remark: "",
          linked_screenshot_ids: screenshotIds,
        })),
        screenshots: screenshotIds.map((screenshotId, index) => ({
          screenshot_id: screenshotId,
          file: `images/${screenshotId}.png`,
          caption: `Screenshot ${index + 1}`,
          description: index === 0 ? "คำอธิบายภาพ" : "Second screenshot",
          scope: "section",
          linked_requirement_ids: requirementIds,
          match_basis: "same_section_related_image_block",
          confidence: "medium",
          image_metadata: {
            display_width: 377.953,
            display_height: 212.598,
            source_width: 1920,
            source_height: 1080,
            pixel_width: index === 0 ? 945 : 640,
            pixel_height: index === 0 ? 532 : 360,
          },
        })),
      }],
    }],
  }
}

function resources(): FlowDocUatImageResourceInputV1[] {
  return [
    {
      sourcePath: "images/synthetic_section_2_1_img_001.png",
      mediaType: "image/png",
      byteLength: 1000,
      sha256: "a".repeat(64),
      pixelWidth: 945,
      pixelHeight: 532,
    },
    {
      sourcePath: "images/synthetic_section_2_1_img_002.png",
      mediaType: "image/png",
      byteLength: 800,
      sha256: "b".repeat(64),
      pixelWidth: 640,
      pixelHeight: 360,
    },
  ]
}

function instance(): VNextDocumentInstanceIdentityV1 {
  return {
    contractVersion: 1,
    kind: "document-instance",
    instanceId: "instance-uat-synthetic-section-2-1",
    revision: 0,
    structureVersion: flowDocUatPublishedStructureRefV1(),
  }
}

function input(): FlowDocUatSemanticNoPagesAdapterInputV1 {
  return {
    source: {
      sourceSetId: "uat-synthetic-source",
      sourceBundleFingerprint: `sha256:${"1".repeat(64)}`,
      semanticMap: {
        fileName: "synthetic_semantic_no_pages.json",
        byteLength: 2048,
        sha256: "2".repeat(64),
      },
    },
    semanticDocument: semanticDocument(),
    sectionNumber: "2.1",
    instance: instance(),
    imageResources: resources(),
  }
}

describe("PDF-EXPORT-REALDOC-B UAT Structure Definition", () => {
  it("builds a source-neutral governed structure entirely from accepted Core node and table contracts", () => {
    const structure = createFlowDocUatStructureDefinitionV1()
    const graph = validateVNextDocumentV4Structure(structure.starterDocument)

    expect(graph).toMatchObject({ status: "valid", issues: [] })
    expect(structure).toMatchObject({
      contractVersion: 1,
      kind: "uat-structure-definition",
      structure: {
        kind: "published-structure-version",
        structureId: "structure-uat-record",
        structureVersionId: "structure-uat-record-v1",
        versionOrdinal: 1,
      },
      summary: {
        sectionCount: 1,
        fieldCount: 17,
        collectionCount: 2,
        tableDefinitionCount: 2,
        regionCount: 6,
        instanceEditableBindingCount: 4,
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
    })
    expect(structure.structureFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    const nodeTypes = new Set(structure.starterDocument.document.sections.flatMap(
      (section) => Object.values(section.nodes).map((node) => node.type),
    ))
    expect([...nodeTypes].every((nodeType) => VNEXT_DOCUMENT_V4_AUTHORED_NODE_TYPES.includes(nodeType))).toBe(true)

    for (const table of Object.values(structure.tables)) {
      expect(validateVNextTableContentContractsV1({
        definition: table.definition,
        fieldContract: structure.fieldContract,
        itemContract: structure.collectionItemContract,
        bindingContract: table.bindingContract,
      })).toMatchObject({ status: "ready", issues: [] })
      expect(createVNextTableContentSourcePlanV1({
        document: structure.starterDocument,
        definition: table.definition,
        fieldContract: structure.fieldContract,
        itemContract: structure.collectionItemContract,
        bindingContract: table.bindingContract,
      })).toMatchObject({ status: "ready", issues: [] })
    }
    expect(structure.tables.requirements.definition).toMatchObject({
      headerPolicy: "repeat-leading-headers",
      columns: [
        { columnId: "requirement-id", widthShare: 10 },
        { columnId: "feature-text", widthShare: 60 },
        { columnId: "accept-status", widthShare: 15 },
        { columnId: "remark", widthShare: 15 },
      ],
    })
  })

  it("returns independent deterministic structure values", () => {
    const first = createFlowDocUatStructureDefinitionV1()
    const second = createFlowDocUatStructureDefinitionV1()
    expect(second).toEqual(first)

    first.starterDocument.document.meta!.title = "mutated"
    first.regions.push({ regionId: "mutated", kind: "fixed", nodeIds: [], collectionFieldKey: null })
    expect(createFlowDocUatStructureDefinitionV1()).toEqual(second)
  })
})

describe("PDF-EXPORT-REALDOC-B UAT semantic no-pages adapter", () => {
  it("projects scalar, requirement, screenshot, media, relation, and provenance facts without running layout", () => {
    const result = adaptFlowDocUatSemanticNoPagesSectionV1(input())

    expect(result).toMatchObject({
      status: "ready-with-warnings",
      issues: [],
      bundle: {
        contractVersion: 1,
        kind: "uat-section-data-bundle",
        adapterId: "flowdoc-uat-semantic-no-pages-adapter-v1",
        sourceSet: { selectedSectionNumber: "2.1" },
        instance: { instanceId: "instance-uat-synthetic-section-2-1", revision: 0 },
        semantic: {
          module: { moduleNumber: "2", title: "Master Data" },
          section: { sectionNumber: "2.1", title: "ทะเบียนข้อมูลตัวอย่าง" },
          relations: {
            linkGranularity: "section-all-to-all",
            screenshotPlacement: "unresolved-source-order-only",
            screenshotOrder: ["synthetic_section_2_1_img_001", "synthetic_section_2_1_img_002"],
          },
        },
        ownership: {
          adapterOwns: ["source-shape-validation", "data-projection", "source-provenance"],
          adapterMustNotOwn: expect.arrayContaining(["instance-allocation", "structure-layout", "pagination", "pdf-bytes"]),
        },
        execution: {
          materialization: "not-run",
          resolution: "not-run",
          measurement: "not-run",
          pagination: "not-run",
          pdfRendering: "not-run",
        },
        summary: {
          scalarValueCount: 15,
          requirementCount: 2,
          screenshotCount: 2,
          collectionItemCount: 4,
          mediaAssetCount: 2,
          sourceImageByteLength: 1800,
          sourceImagePixelCount: 733140,
        },
      },
    })
    if (result.status !== "ready-with-warnings") throw new Error("adapter must pass")
    expect(result.warnings.map((item) => item.code)).toEqual([
      "page-geometry-unavailable",
      "screenshot-placement-unresolved",
      "section-all-to-all-links",
    ])
    expect(result.bundle.semantic.requirements[0]).toMatchObject({
      requirementId: "REQ-SYNTH-001",
      featureBullets: ["หัวข้อหนึ่ง", "หัวข้อสอง"],
      elementTypes: ["Functional", "Security"],
      linkedScreenshotIds: ["synthetic_section_2_1_img_001", "synthetic_section_2_1_img_002"],
    })
    expect(result.bundle.provenance.scalars["uat.section.title"].sourcePointer).toBe(
      "synthetic_semantic_no_pages.json#/modules/0/sections/0/title",
    )
    expect(result.bundle.collectionSnapshot.collections["uat.requirements"].items[0].values).toMatchObject({
      requirement_id: "REQ-SYNTH-001",
      feature_text: "ข้อความภาษาไทย\nบรรทัดที่สอง",
      element_types: "Functional, Security",
      accept_status: "blank",
      remark: "",
    })
    expect(result.bundle.collectionSnapshot.collections["uat.screenshots"].items[0].values.image).toEqual({
      kind: "image-asset-ref",
      assetId: "uat-image-synthetic_section_2_1_img_001",
    })
    expect(result.bundle.mediaSnapshot.registry.images["uat-image-synthetic_section_2_1_img_001"]).toMatchObject({
      byteLength: 1000,
      digest: { algorithm: "sha256", value: "a".repeat(64) },
      intrinsic: { widthPx: 945, heightPx: 532 },
    })
    expect(VNextInstanceDataSnapshotV1Schema.safeParse(result.bundle.dataSnapshot).success).toBe(true)
    expect(VNextTableCollectionSnapshotV1Schema.safeParse(result.bundle.collectionSnapshot).success).toBe(true)
    expect(VNextInstanceMediaSnapshotV1Schema.safeParse(result.bundle.mediaSnapshot).success).toBe(true)
    expect(JSON.stringify(result.bundle)).not.toContain("xPt")
    expect(JSON.stringify(result.bundle)).not.toContain("yPt")
    expect(result.bundle.bundleFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
  })

  it("is deterministic and does not retain mutable caller values", () => {
    const source = input()
    const first = adaptFlowDocUatSemanticNoPagesSectionV1(source)
    const second = adaptFlowDocUatSemanticNoPagesSectionV1(source)
    expect(second).toEqual(first)
    if (first.status !== "ready-with-warnings" || second.status !== "ready-with-warnings") {
      throw new Error("adapter must pass")
    }

    source.semanticDocument.modules[0].sections[0].requirements[0].feature_text = "changed after adaptation"
    first.bundle.semantic.requirements[0].featureBullets.push("mutated output")
    expect(second.bundle.collectionSnapshot.collections["uat.requirements"].items[0].values.feature_text).toBe(
      "ข้อความภาษาไทย\nบรรทัดที่สอง",
    )
    expect(second.bundle.semantic.requirements[0].featureBullets).toEqual(["หัวข้อหนึ่ง", "หัวข้อสอง"])
  })

  it("fails closed on missing resources, metadata drift, or non-reciprocal links", () => {
    const missing = input()
    missing.imageResources.pop()
    const missingResult = adaptFlowDocUatSemanticNoPagesSectionV1(missing)
    expect(missingResult).toMatchObject({ status: "blocked", bundle: null, warnings: [] })
    expect(missingResult.issues.map((item) => item.code)).toContain("missing-image-resource")

    const dimensions = input()
    dimensions.imageResources[0].pixelWidth += 1
    const dimensionResult = adaptFlowDocUatSemanticNoPagesSectionV1(dimensions)
    expect(dimensionResult.issues.map((item) => item.code)).toContain("image-metadata-mismatch")

    const relation = input()
    relation.semanticDocument.modules[0].sections[0].screenshots[0].linked_requirement_ids.pop()
    const relationResult = adaptFlowDocUatSemanticNoPagesSectionV1(relation)
    expect(relationResult.issues.map((item) => item.code)).toContain("non-reciprocal-screenshot-link")

    const requirementFlag = input()
    requirementFlag.semanticDocument.modules[0].sections[0].has_requirements = false
    const requirementFlagResult = adaptFlowDocUatSemanticNoPagesSectionV1(requirementFlag)
    expect(requirementFlagResult.issues.map((item) => item.code)).toContain("section-requirement-flag-mismatch")

    const duplicateLink = input()
    duplicateLink.semanticDocument.modules[0].sections[0].requirements[0].linked_screenshot_ids.push(
      "synthetic_section_2_1_img_001",
    )
    const duplicateLinkResult = adaptFlowDocUatSemanticNoPagesSectionV1(duplicateLink)
    expect(duplicateLinkResult.issues.map((item) => item.code)).toContain("duplicate-linked-screenshot")
  })

  it("rejects source-shape extensions and a mismatched Structure Version", () => {
    const extended = input() as any
    extended.semanticDocument.modules[0].sections[0].legacy_page = 121
    const extendedResult = adaptFlowDocUatSemanticNoPagesSectionV1(extended)
    expect(extendedResult).toMatchObject({ status: "blocked", bundle: null })
    expect(extendedResult.issues.some((item) => (
      item.code === "unrecognized_keys" && item.path.endsWith("sections[0]")
    ))).toBe(true)

    const mismatched = input()
    mismatched.instance.structureVersion.structureVersionId = "structure-other-v1"
    const mismatchResult = adaptFlowDocUatSemanticNoPagesSectionV1(mismatched)
    expect(mismatchResult).toMatchObject({
      status: "blocked",
      bundle: null,
      issues: [{ code: "structure-version-mismatch", path: "instance.structureVersion" }],
    })
  })

  it("retains content-free evidence from the exact external section 2.1 source", () => {
    const evidence = JSON.parse(readFileSync(resolve(
      process.cwd(),
      "packages/uat-realdoc/fixtures/69c-section-2-1-adapter-evidence.v1.json",
    ), "utf8"))

    expect(evidence).toMatchObject({
      evidenceVersion: 1,
      phaseId: "PDF-EXPORT-REALDOC-B",
      status: "accepted",
      structure: {
        structureId: "structure-uat-record",
        structureVersionId: "structure-uat-record-v1",
        structureFingerprint: "sha256:3c7a6f62837994db864f4d91a4b4cb746825ec4cff7529b84ff28166192345f4",
        summary: { nodeCount: 41, fieldCount: 17, collectionCount: 2, tableDefinitionCount: 2 },
      },
      adapter: {
        adapterId: "flowdoc-uat-semantic-no-pages-adapter-v1",
        bundleFingerprint: "sha256:d348842d94f31a60240ee668c77f3d9775c5d2bb6eb4b38fed5dc2eea91e7fe9",
        selectedSectionNumber: "2.1",
        summary: {
          scalarValueCount: 15,
          requirementCount: 10,
          screenshotCount: 7,
          collectionItemCount: 17,
          mediaAssetCount: 7,
          featureTextCharacterCount: 4833,
          sourceImageByteLength: 1117389,
          sourceImagePixelCount: 3494022,
        },
        linkGranularity: "section-all-to-all",
        screenshotPlacement: "unresolved-source-order-only",
      },
      canonicalInputs: { dataSnapshot: true, collectionSnapshot: true, mediaSnapshot: true },
      contracts: {
        sourceContentRetainedInEvidence: false,
        sourceSpecificSchemaAddedToCore: false,
        instanceAllocatedByAdapter: false,
        materializationExecuted: false,
        productionBinding: false,
      },
    })
    expect(JSON.stringify(evidence)).not.toContain("feature_text")
    expect(JSON.stringify(evidence)).not.toContain("linked_requirement_ids")
  })
})
