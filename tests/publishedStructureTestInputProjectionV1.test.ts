import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextPublishedStructureGenerationDataContractV1,
  projectVNextPublishedStructureTestInputV1,
  type VNextPublishedStructureTestInputProjectionRequestV1,
} from "../src/index.js"
import {
  createFlowDocUatStructureDefinitionV1,
  flowDocUatPublishedStructureRefV1,
} from "../packages/uat-realdoc/src/index.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function hash(seed: string): string {
  return `sha256:${seed.repeat(64).slice(0, 64)}`
}

function request(): VNextPublishedStructureTestInputProjectionRequestV1 {
  const uat = createFlowDocUatStructureDefinitionV1()
  return {
    contractVersion: 1,
    kind: "published-structure-test-input-projection-request",
    structure: {
      owner: flowDocUatPublishedStructureRefV1(),
      structureFingerprint: uat.structureFingerprint,
      document: uat.starterDocument,
    },
    dataContract: createVNextPublishedStructureGenerationDataContractV1({
      dataContractId: "uat-generation-data-v1",
      publishedStructure: uat.structure,
      publishedStructureFingerprint: uat.structureFingerprint,
      fieldContract: uat.fieldContract,
      collectionItemContract: uat.collectionItemContract,
    }),
    tables: [uat.tables.requirements, uat.tables.screenshots],
  }
}

describe("Published Structure test-input projection v1", () => {
  it("projects the UAT Structure in first-placement order without losing unplaced contract fields", () => {
    const input = request()
    const before = JSON.stringify(input)
    const result = projectVNextPublishedStructureTestInputV1(input)

    expect(result.status).toBe("ready")
    if (result.status !== "ready") return
    expect(JSON.stringify(input)).toBe(before)
    expect(result.owner).toEqual(flowDocUatPublishedStructureRefV1())
    expect(result.dataContract).toMatchObject({
      dataContractId: "uat-generation-data-v1",
      fieldContractId: "uat-record-fields-v1",
      collectionItemContractId: "uat-record-collection-items-v1",
    })
    expect(result.fields.map((field) => field.key).slice(0, 10)).toEqual([
      "uat.document.title",
      "uat.module.number",
      "uat.module.title",
      "uat.section.number",
      "uat.section.title",
      "uat.section.description",
      "uat.requirements",
      "uat.screenshots",
      "uat.approval.name",
      "uat.approval.date",
    ])
    expect(result.groups).toEqual([
      {
        kind: "section",
        groupId: "section:uat-main-section",
        sectionId: "uat-main-section",
        sectionIndex: 0,
        fieldKeys: [
          "uat.document.title",
          "uat.module.number",
          "uat.module.title",
          "uat.section.number",
          "uat.section.title",
          "uat.section.description",
          "uat.requirements",
          "uat.screenshots",
          "uat.approval.name",
          "uat.approval.date",
        ],
      },
      {
        kind: "unplaced",
        groupId: "unplaced",
        fieldKeys: [
          "uat.document.author",
          "uat.document.project",
          "uat.document.source_file_name",
          "uat.document.total_pages",
          "uat.document.updated_date",
          "uat.document.version",
          "uat.module.description",
        ],
      },
    ])
    expect(result.summary).toMatchObject({
      documentFieldCount: 17,
      placedDocumentFieldCount: 10,
      unplacedDocumentFieldCount: 7,
      collectionFieldCount: 2,
      collectionItemFieldCount: 13,
      placedCollectionItemFieldCount: 7,
      imageFieldCount: 1,
    })
    expect(result.execution).toEqual({
      valueCollection: "not-run",
      snapshotCreation: "not-run",
      validation: "not-run",
      materialization: "not-run",
      resolution: "not-run",
      artifact: "not-run",
    })
    expect(result.contracts).toMatchObject({
      uiNeutral: true,
      oneDocumentValuePerFieldKey: true,
      presentationPlacementControlsInputIdentity: false,
      businessValuesAccepted: false,
      productionBinding: false,
    })
    expect(result.projectionFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
  })

  it("projects exact collection required/default facts and explicit missing scalar constraints", () => {
    const input = request()
    const itemContract = clone(input.dataContract.collectionItemContract!)
    itemContract.collections["uat.requirements"].fields.remark.required = false
    itemContract.collections["uat.requirements"].fields.remark.fallback = "Not supplied"
    input.dataContract = createVNextPublishedStructureGenerationDataContractV1({
      dataContractId: input.dataContract.dataContractId,
      publishedStructure: input.dataContract.publishedStructure,
      publishedStructureFingerprint: input.dataContract.publishedStructureFingerprint,
      fieldContract: input.dataContract.fieldContract,
      collectionItemContract: itemContract,
    })

    const result = projectVNextPublishedStructureTestInputV1(input)
    expect(result.status).toBe("ready")
    if (result.status !== "ready") return

    const approvalDate = result.fields.find((field) => field.key === "uat.approval.date")!
    expect(approvalDate.constraints).toEqual({
      required: {
        status: "metadata-unavailable",
        reason: "not-represented-by-generation-data-contract",
      },
      defaultValue: {
        status: "metadata-unavailable",
        reason: "not-represented-by-generation-data-contract",
      },
      allowedValues: { status: "not-applicable" },
      valueFormat: {
        status: "metadata-unavailable",
        reason: "not-represented-by-generation-data-contract",
      },
    })

    const requirements = result.fields.find((field) => field.key === "uat.requirements")!
    expect(requirements.collection).not.toBeNull()
    expect(requirements.collection!.repeat).toMatchObject({
      supported: true,
      itemOrder: "snapshot-array-order",
      minimumItems: { status: "metadata-unavailable" },
      maximumItems: { status: "metadata-unavailable" },
    })
    expect(requirements.collection!.itemFields.map((field) => field.key)).toEqual([
      "requirement_id",
      "feature_text",
      "accept_status",
      "remark",
      "element_types",
      "linked_screenshot_ids",
    ])
    expect(requirements.collection!.itemFields.find((field) => field.key === "accept_status")!.constraints)
      .toMatchObject({
        required: { status: "available", value: true },
        defaultValue: { status: "absent" },
        allowedValues: { status: "metadata-unavailable" },
      })
    expect(requirements.collection!.itemFields.find((field) => field.key === "remark")!.constraints)
      .toMatchObject({
        required: { status: "available", value: false },
        defaultValue: { status: "available", value: "Not supplied" },
      })

    const screenshots = result.fields.find((field) => field.key === "uat.screenshots")!
    const image = screenshots.collection!.itemFields.find((field) => field.key === "image")!
    expect(image.constraints.required).toEqual({
      status: "available",
      source: "collection-item-contract",
      value: true,
    })
    expect(image.imageAssetInput).toEqual({
      valueKind: "image-asset-ref",
      assetRegistry: "instance-media-snapshot-v1",
      referencedAssetMustExist: true,
      publishedAssetFallback: "unsupported-without-static-media-owner-binding",
    })
  })

  it("keeps one value identity for repeated placements and stays record-order deterministic", () => {
    const input = request()
    const section = input.structure.document.document.sections[0]
    const description = section.nodes["uat-section-description"]
    if (description.type !== "text-block") throw new Error("expected section description text block")
    description.children.push({
      id: "uat-document-title-second-placement",
      type: "field-ref",
      key: "uat.document.title",
    })
    input.structure.structureFingerprint = hash("a")
    input.dataContract = createVNextPublishedStructureGenerationDataContractV1({
      dataContractId: input.dataContract.dataContractId,
      publishedStructure: input.dataContract.publishedStructure,
      publishedStructureFingerprint: input.structure.structureFingerprint,
      fieldContract: input.dataContract.fieldContract,
      collectionItemContract: input.dataContract.collectionItemContract,
    })

    const first = projectVNextPublishedStructureTestInputV1(input)
    expect(first.status).toBe("ready")
    if (first.status !== "ready") return
    const titleFields = first.fields.filter((field) => field.key === "uat.document.title")
    expect(titleFields).toHaveLength(1)
    expect(titleFields[0].placement).toMatchObject({
      status: "placed",
      placementCount: 2,
      firstPlacement: { placementId: "uat-header-title-field", documentOrder: 0 },
    })

    const reordered = clone(input)
    reordered.tables.reverse()
    reordered.dataContract.fieldContract.registry.fields = Object.fromEntries(
      Object.entries(reordered.dataContract.fieldContract.registry.fields).reverse(),
    )
    for (const shape of Object.values(reordered.dataContract.collectionItemContract!.collections)) {
      shape.fields = Object.fromEntries(Object.entries(shape.fields).reverse())
    }
    const second = projectVNextPublishedStructureTestInputV1(reordered)
    expect(second).toEqual(first)
  })

  it("blocks owner, fingerprint, collection-shape, and missing binding drift", () => {
    const wrongOwner = request()
    wrongOwner.structure.owner.structureVersionId = "other-version"
    expect(projectVNextPublishedStructureTestInputV1(wrongOwner)).toMatchObject({
      status: "blocked",
      issues: [{ code: "structure-owner-mismatch" }],
    })

    const wrongFingerprint = request()
    wrongFingerprint.structure.structureFingerprint = hash("f")
    expect(projectVNextPublishedStructureTestInputV1(wrongFingerprint)).toMatchObject({
      status: "blocked",
      issues: [{ code: "structure-fingerprint-mismatch" }],
    })

    const noItems = request()
    noItems.dataContract = createVNextPublishedStructureGenerationDataContractV1({
      dataContractId: noItems.dataContract.dataContractId,
      publishedStructure: noItems.dataContract.publishedStructure,
      publishedStructureFingerprint: noItems.dataContract.publishedStructureFingerprint,
      fieldContract: noItems.dataContract.fieldContract,
      collectionItemContract: null,
    })
    const missingItems = projectVNextPublishedStructureTestInputV1(noItems)
    expect(missingItems.status).toBe("blocked")
    expect(missingItems.issues.some((issue) => issue.code === "missing-collection-item-contract")).toBe(true)

    const noTables = request()
    noTables.tables = []
    const missingBindings = projectVNextPublishedStructureTestInputV1(noTables)
    expect(missingBindings.status).toBe("blocked")
    expect(missingBindings.issues.some((issue) => issue.code === "unknown-document-field")).toBe(true)
  })

  it("keeps the Core implementation free of frontend implementation vocabulary", () => {
    const source = readFileSync(
      new URL("../src/generation/publishedStructureTestInputProjectionV1.ts", import.meta.url),
      "utf8",
    )
    for (const forbidden of ["React", "CSS", "component", "panel", "screen coordinate", "form control"]) {
      expect(source).not.toContain(forbidden)
    }
  })

  it("retains the E.5.3 boundary and E.5.4 handoff without claiming Preview execution", () => {
    const doc = readFileSync(
      new URL("../docs/PDF_EXPORT_REALDOC_TEST_INPUT_PROJECTION.md", import.meta.url),
      "utf8",
    )
    const publicExports = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")
    const formHandoff = readFileSync(
      new URL("../docs/PDF_EXPORT_REALDOC_TEMPORARY_FORM_HANDOFF.md", import.meta.url),
      "utf8",
    )

    for (const section of [
      "## Exact Pins",
      "## Field Identity And Order",
      "## Constraint Facts",
      "## Collections And Images",
      "## Fail-Closed Coverage",
      "## 69C Evidence",
      "## Explicitly Not Changed",
      "## Next Phase",
    ]) expect(doc).toContain(section)
    expect(doc).toContain("`PDF-EXPORT-REALDOC-E.5.4`")
    expect(doc).toMatch(/no test values and\s+runs no mapping, snapshot creation, validation, materialization, resolution/)
    expect(publicExports).toContain(
      'export * from "./generation/publishedStructureTestInputProjectionV1.js"',
    )
    expect(ledger).toContain("## PDF-EXPORT-REALDOC-E.5.3 Core Test-Input Projection")
    expect(ledger).toContain("## PDF-EXPORT-REALDOC-E.5.4 Temporary Generated Form")
    expect(formHandoff).toContain("Status: `PDF-EXPORT-REALDOC-E.5.4` accepted")
    expect(formHandoff).toContain("`PDF-EXPORT-REALDOC-E.5.5`")
    expect(doc).not.toContain("Preview execution is active")
    expect(doc).not.toContain("production is ready")
  })
})
