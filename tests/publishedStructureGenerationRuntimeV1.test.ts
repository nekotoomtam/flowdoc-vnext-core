import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextPublishedStructureGenerationDataContractV1,
  createVNextPublishedStructureJsonPayloadDescriptorV1,
  createVNextPublishedStructureMappingProfileV1,
  runVNextPublishedStructureGenerationRuntimeV1,
  type VNextDocumentInstanceIdentityV1,
  type VNextPublishedCollectionItemContractV1,
  type VNextPublishedFieldContractV1,
  type VNextPublishedStructureCanonicalSnapshotInputV1,
  type VNextPublishedStructureGenerationDataContractV1,
  type VNextPublishedStructureGenerationInputRequestV1,
  type VNextPublishedStructureMappingRuntimeV1,
  type VNextPublishedStructureVersionIdentityV1,
} from "../src/index.js"
import {
  FLOWDOC_UAT_GENERATION_MAPPER_IMPLEMENTATION_FINGERPRINT,
  FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID,
  adaptFlowDocUatSemanticNoPagesSectionV1,
  createFlowDocUatGenerationMapperV1,
  createFlowDocUatStructureDefinitionV1,
  flowDocUatPublishedStructureRefV1,
  type FlowDocUatSemanticNoPagesAdapterInputV1,
} from "../packages/uat-realdoc/src/index.js"

const hash = (value: string): string => `sha256:${value.repeat(64).slice(0, 64)}`

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function structure(): VNextPublishedStructureVersionIdentityV1 {
  return {
    contractVersion: 1,
    kind: "published-structure-version",
    structureId: "structure-runtime-report",
    structureVersionId: "structure-runtime-report-v1",
    versionOrdinal: 1,
    sourceDraft: {
      structureId: "structure-runtime-report",
      draftId: "draft-runtime-report",
      revision: 4,
    },
  }
}

function owner() {
  const value = structure()
  return {
    structureId: value.structureId,
    structureVersionId: value.structureVersionId,
    versionOrdinal: value.versionOrdinal,
  }
}

function fields(): VNextPublishedFieldContractV1 {
  return {
    contractVersion: 1,
    kind: "published-field-contract",
    fieldContractId: "fields-runtime-report-v1",
    owner: owner(),
    registry: {
      version: 1,
      fields: {
        "report.title": { key: "report.title", label: "Title", type: "text" },
        "report.logo": { key: "report.logo", label: "Logo", type: "image" },
        "report.items": { key: "report.items", label: "Items", type: "collection" },
      },
    },
  }
}

function itemContract(): VNextPublishedCollectionItemContractV1 {
  return {
    contractVersion: 1,
    kind: "published-collection-item-contract",
    collectionItemContractId: "items-runtime-report-v1",
    publishedFieldContractId: "fields-runtime-report-v1",
    owner: owner(),
    collections: {
      "report.items": {
        collectionFieldKey: "report.items",
        fields: {
          name: { key: "name", label: "Name", type: "text", required: true },
          amount: { key: "amount", label: "Amount", type: "number", required: true },
          note: { key: "note", label: "Note", type: "text", required: false, fallback: "n/a" },
        },
      },
    },
  }
}

function dataContract(): VNextPublishedStructureGenerationDataContractV1 {
  return createVNextPublishedStructureGenerationDataContractV1({
    dataContractId: "generation-runtime-report-v1",
    publishedStructure: structure(),
    publishedStructureFingerprint: hash("1"),
    fieldContract: fields(),
    collectionItemContract: itemContract(),
  })
}

function instance(): VNextDocumentInstanceIdentityV1 {
  return {
    contractVersion: 1,
    kind: "document-instance",
    instanceId: "runtime-report-instance-001",
    revision: 0,
    structureVersion: owner(),
  }
}

function canonicalInput(
  exactInstance = instance(),
  values: { title?: unknown; name?: unknown; amount?: unknown } = {},
): VNextPublishedStructureCanonicalSnapshotInputV1 {
  return {
    kind: "canonical-snapshot-input",
    dataSnapshot: {
      contractVersion: 1,
      kind: "instance-data-snapshot",
      dataSnapshotId: "runtime-report-data-r0",
      instance: clone(exactInstance),
      data: {
        version: 2,
        values: {
          "report.title": (values.title ?? "Confidential runtime report") as string,
        },
      },
    },
    collectionSnapshots: [{
      contractVersion: 1,
      kind: "table-collection-snapshot",
      collectionSnapshotId: "runtime-report-collections-r0",
      snapshotRevision: 0,
      instance: clone(exactInstance),
      collections: {
        "report.items": {
          collectionFieldKey: "report.items",
          items: [{
            itemKey: "item-001",
            values: {
              name: (values.name ?? "Private item") as string,
              amount: (values.amount ?? 42) as number,
            },
          }],
        },
      },
    }],
    mediaSnapshot: {
      contractVersion: 1,
      kind: "instance-media-snapshot",
      mediaSnapshotId: "runtime-report-media-r0",
      instance: clone(exactInstance),
      registry: { version: 1, images: {} },
    },
  }
}

function directRequest(
  input = canonicalInput(),
  contract = dataContract(),
): VNextPublishedStructureGenerationInputRequestV1 {
  return {
    contractVersion: 1,
    kind: "published-structure-generation-input-request",
    dataContract: contract,
    instance: instance(),
    input,
  }
}

const execution = {
  kind: "named-adapter" as const,
  adapterId: "runtime-report-json-adapter",
  adapterVersion: 1,
  implementationFingerprint: hash("2"),
}

const declarativeExecution = {
  kind: "declarative-mapping" as const,
  mappingLanguageId: "flowdoc-map",
  mappingLanguageVersion: 1,
  definitionFingerprint: hash("7"),
  executorFingerprint: hash("8"),
}

function adaptedRequest(payloadText: string): VNextPublishedStructureGenerationInputRequestV1 {
  const contract = dataContract()
  return {
    contractVersion: 1,
    kind: "published-structure-generation-input-request",
    dataContract: contract,
    instance: instance(),
    input: {
      kind: "adapted-payload-input",
      payload: createVNextPublishedStructureJsonPayloadDescriptorV1("runtime-payload-001", payloadText),
      mappingProfile: createVNextPublishedStructureMappingProfileV1({
        mappingProfileId: "runtime-report-json-v1",
        mappingProfileVersion: 1,
        owner: owner(),
        sourceContract: {
          sourceContractId: "runtime-report-source-v1",
          sourceContractVersion: 1,
          schemaFingerprint: hash("3"),
        },
        target: {
          dataContractId: contract.dataContractId,
          dataContractFingerprint: contract.dataContractFingerprint,
        },
        execution,
      }),
    },
  }
}

function mapper(): VNextPublishedStructureMappingRuntimeV1 {
  return {
    execution,
    map: (payload, context) => {
      const source = payload as { title: string; name: string; amount: number }
      return {
        status: "mapped",
        canonicalInput: canonicalInput(context.instance, source),
        warnings: [{ code: "source-note-normalized", path: "$.name" }],
      }
    },
  }
}

function uatAdapterInput(): FlowDocUatSemanticNoPagesAdapterInputV1 {
  const requirementId = "REQ-E2-001"
  const screenshotId = "e2_img_001"
  return {
    source: {
      sourceSetId: "uat-e2-source",
      sourceBundleFingerprint: hash("4"),
      semanticMap: {
        fileName: "uat_e2_semantic.json",
        byteLength: 4096,
        sha256: "5".repeat(64),
      },
    },
    semanticDocument: {
      document: {
        title: "UAT E2 secret title",
        project: "FlowDoc",
        version: "1",
        author: "FlowDoc",
        updated_date: "2026-07-19",
        source_file_name: "uat-e2.pdf",
        total_pages: 2,
        extraction_schema: "uat_semantic_no_pages_v1",
      },
      modules: [{
        module_id: "module_e2",
        module_number: "2",
        title: "Module E2",
        description: "Runtime parity",
        sections: [{
          section_id: "section_e2_1",
          section_number: "2.1",
          title: "Runtime mapping",
          description: "Direct and adapted parity",
          has_requirements: true,
          screenshot_ids: [screenshotId],
          requirements: [{
            requirement_id: requirementId,
            feature_text: "Secret requirement text",
            feature_bullets: ["runtime"],
            element_types: ["Functional"],
            accept_status: "blank",
            remark: "",
            linked_screenshot_ids: [screenshotId],
          }],
          screenshots: [{
            screenshot_id: screenshotId,
            file: `images/${screenshotId}.png`,
            caption: "E2 screenshot",
            description: "Runtime evidence",
            scope: "section",
            linked_requirement_ids: [requirementId],
            match_basis: "same_section_related_image_block",
            confidence: "medium",
            image_metadata: {
              display_width: 400,
              display_height: 240,
              source_width: 800,
              source_height: 480,
              pixel_width: 800,
              pixel_height: 480,
            },
          }],
        }],
      }],
    },
    sectionNumber: "2.1",
    instance: {
      contractVersion: 1,
      kind: "document-instance",
      instanceId: "uat-e2-instance-001",
      revision: 0,
      structureVersion: flowDocUatPublishedStructureRefV1(),
    },
    imageResources: [{
      sourcePath: `images/${screenshotId}.png`,
      mediaType: "image/png",
      byteLength: 1200,
      sha256: "a".repeat(64),
      pixelWidth: 800,
      pixelHeight: 480,
    }],
  }
}

describe("Published Structure generation runtime v1", () => {
  it("validates direct snapshots and applies only typed collection-item defaults", () => {
    const request = directRequest()
    const before = JSON.stringify(request)
    const result = runVNextPublishedStructureGenerationRuntimeV1(request)

    expect(result.status).toBe("ready-with-warnings")
    if (result.status === "blocked") throw new Error("direct runtime blocked")
    expect(result.lane).toBe("direct")
    expect(result.execution).toMatchObject({ mapping: "not-required", runtimeValidation: "run-valid" })
    expect(result.nextStep).toBe("materialization")
    expect(result.diagnostics.summary).toMatchObject({
      scalarValueCount: 1,
      collectionSnapshotCount: 1,
      collectionItemCount: 1,
      defaultAppliedCount: 1,
    })
    expect(result.canonicalInput.collectionSnapshots[0]!
      .collections["report.items"]!.items[0]!.values.note).toBe("n/a")
    expect(result.contracts).toMatchObject({
      sameValidatorForDirectAndAdapted: true,
      rawPayloadRetained: false,
      diagnosticsContainBusinessValues: false,
      scalarFieldDefinitionFallbackApplied: false,
      productionBinding: false,
    })
    expect(JSON.stringify(request)).toBe(before)
  })

  it("converges adapted and direct inputs on the exact canonical snapshot fingerprint", () => {
    const payloadText = JSON.stringify({
      title: "Confidential runtime report",
      name: "Private item",
      amount: 42,
    })
    const direct = runVNextPublishedStructureGenerationRuntimeV1(directRequest())
    const adapted = runVNextPublishedStructureGenerationRuntimeV1(adaptedRequest(payloadText), {
      adaptedInput: { payloadText, mapper: mapper() },
    })

    expect(direct.status).not.toBe("blocked")
    expect(adapted.status).toBe("ready-with-warnings")
    if (direct.status === "blocked" || adapted.status === "blocked") throw new Error("parity runtime blocked")
    expect(adapted.execution).toMatchObject({ mapping: "executed", runtimeValidation: "run-valid" })
    expect(adapted.canonicalInputFingerprint).toBe(direct.canonicalInputFingerprint)
    expect(adapted.canonicalInput).toEqual(direct.canonicalInput)
    expect(JSON.stringify(adapted.diagnostics)).not.toContain("Confidential runtime report")
    expect(JSON.stringify(adapted.diagnostics)).not.toContain("Private item")
    expect(JSON.stringify(adapted)).not.toContain(payloadText)
  })

  it("accepts an exact declarative execution identity through the same injected runtime boundary", () => {
    const payloadText = JSON.stringify({
      title: "Confidential runtime report",
      name: "Private item",
      amount: 42,
    })
    const request = adaptedRequest(payloadText)
    if (request.input.kind !== "adapted-payload-input") throw new Error("adapted fixture changed")
    request.input.mappingProfile = createVNextPublishedStructureMappingProfileV1({
      mappingProfileId: "runtime-report-declarative-v1",
      mappingProfileVersion: 1,
      owner: owner(),
      sourceContract: {
        sourceContractId: "runtime-report-source-v1",
        sourceContractVersion: 1,
        schemaFingerprint: hash("3"),
      },
      target: {
        dataContractId: request.dataContract.dataContractId,
        dataContractFingerprint: request.dataContract.dataContractFingerprint,
      },
      execution: declarativeExecution,
    })
    const namedMapper = mapper()
    const result = runVNextPublishedStructureGenerationRuntimeV1(request, {
      adaptedInput: {
        payloadText,
        mapper: { execution: declarativeExecution, map: namedMapper.map },
      },
    })

    expect(result.status).not.toBe("blocked")
    expect(result.execution).toMatchObject({ mapping: "executed", runtimeValidation: "run-valid" })
  })

  it("fails closed on payload identity, mapper identity, and redacts thrown errors", () => {
    const payloadText = JSON.stringify({ title: "secret-a", name: "Private item", amount: 42 })
    const changedText = JSON.stringify({ title: "secret-b", name: "Private item", amount: 42 })
    const drift = runVNextPublishedStructureGenerationRuntimeV1(adaptedRequest(payloadText), {
      adaptedInput: { payloadText: changedText, mapper: mapper() },
    })
    const wrongMapper = mapper()
    wrongMapper.execution = { ...execution, adapterVersion: 2 }
    const identity = runVNextPublishedStructureGenerationRuntimeV1(adaptedRequest(payloadText), {
      adaptedInput: { payloadText, mapper: wrongMapper },
    })
    const failedMapper = mapper()
    failedMapper.map = () => { throw new Error("PRIVATE SOURCE VALUE") }
    const failed = runVNextPublishedStructureGenerationRuntimeV1(adaptedRequest(payloadText), {
      adaptedInput: { payloadText, mapper: failedMapper },
    })

    expect(drift).toMatchObject({
      status: "blocked",
      diagnostics: { issues: [expect.objectContaining({ code: "payload-fingerprint-mismatch" })] },
    })
    expect(identity).toMatchObject({
      status: "blocked",
      diagnostics: { issues: [expect.objectContaining({ code: "mapping-execution-identity-mismatch" })] },
    })
    expect(failed).toMatchObject({
      status: "blocked",
      execution: { mapping: "failed" },
      diagnostics: { issues: [expect.objectContaining({ code: "mapping-execution-failed" })] },
    })
    expect(JSON.stringify(failed.diagnostics)).not.toContain("PRIVATE SOURCE VALUE")
  })

  it("requires exact adapted runtime inputs and rechecks mapped snapshot identity", () => {
    const payloadText = JSON.stringify({ title: "secret", name: "Private item", amount: 42 })
    const missing = runVNextPublishedStructureGenerationRuntimeV1(adaptedRequest(payloadText))
    const invalidJsonText = "{"
    const invalidJson = runVNextPublishedStructureGenerationRuntimeV1(adaptedRequest(invalidJsonText), {
      adaptedInput: { payloadText: invalidJsonText, mapper: mapper() },
    })
    const byteLength = runVNextPublishedStructureGenerationRuntimeV1(adaptedRequest(payloadText), {
      adaptedInput: { payloadText: "{}", mapper: mapper() },
    })
    const unexpected = runVNextPublishedStructureGenerationRuntimeV1(directRequest(), {
      adaptedInput: { payloadText, mapper: mapper() },
    })
    const wrongSnapshotMapper = mapper()
    wrongSnapshotMapper.map = (payload, context) => {
      const source = payload as { title: string; name: string; amount: number }
      const wrongInstance = clone(context.instance)
      wrongInstance.revision = 1
      return {
        status: "mapped",
        canonicalInput: canonicalInput(wrongInstance, source),
        warnings: [],
      }
    }
    const wrongSnapshot = runVNextPublishedStructureGenerationRuntimeV1(adaptedRequest(payloadText), {
      adaptedInput: { payloadText, mapper: wrongSnapshotMapper },
    })

    expect(missing.diagnostics.issues[0]?.code).toBe("missing-adapted-runtime")
    expect(invalidJson.diagnostics.issues[0]?.code).toBe("invalid-json-payload")
    expect(byteLength.diagnostics.issues[0]?.code).toBe("payload-byte-length-mismatch")
    expect(unexpected.diagnostics.issues[0]?.code).toBe("unexpected-adapted-runtime")
    expect(wrongSnapshot).toMatchObject({
      status: "blocked",
      execution: { mapping: "executed", runtimeValidation: "run-blocked" },
    })
    expect(wrongSnapshot.diagnostics.issues.map((item) => item.code)).toContain("invalid-canonical-input")
  })

  it("blocks incompatible scalar, media, and required collection item values", () => {
    const scalar = canonicalInput()
    scalar.dataSnapshot.data.values["report.title"] = 123
    const image = canonicalInput()
    image.dataSnapshot.data.values["report.logo"] = { kind: "image-asset-ref", assetId: "missing-logo" }
    const missing = canonicalInput()
    delete missing.collectionSnapshots[0]!.collections["report.items"]!.items[0]!.values.name
    const nullRequired = canonicalInput()
    nullRequired.collectionSnapshots[0]!.collections["report.items"]!.items[0]!.values.name = null
    const itemType = canonicalInput()
    itemType.collectionSnapshots[0]!.collections["report.items"]!.items[0]!.values.amount = "forty-two"

    const cases = [
      [scalar, "invalid-scalar-value-type"],
      [image, "missing-instance-media"],
      [missing, "missing-required-collection-item-field"],
      [nullRequired, "required-collection-item-value-null"],
      [itemType, "invalid-collection-item-value-type"],
    ] as const
    cases.forEach(([input, code]) => {
      const result = runVNextPublishedStructureGenerationRuntimeV1(directRequest(input))
      expect(result.status).toBe("blocked")
      expect(result.diagnostics.issues.map((item) => item.code)).toContain(code)
      expect(result.execution.runtimeValidation).toBe("run-blocked")
    })
  })

  it("blocks published image defaults until static-media binding is explicit", () => {
    const collectionContract = itemContract()
    collectionContract.collections["report.items"]!.fields.avatar = {
      key: "avatar",
      label: "Avatar",
      type: "image",
      required: false,
      fallback: { kind: "published-asset-ref", assetId: "published-avatar" },
    }
    const contract = createVNextPublishedStructureGenerationDataContractV1({
      dataContractId: "generation-runtime-report-image-default-v1",
      publishedStructure: structure(),
      publishedStructureFingerprint: hash("1"),
      fieldContract: fields(),
      collectionItemContract: collectionContract,
    })
    const result = runVNextPublishedStructureGenerationRuntimeV1(directRequest(canonicalInput(), contract))

    expect(result).toMatchObject({
      status: "blocked",
      execution: { runtimeValidation: "run-blocked" },
      diagnostics: {
        issues: [expect.objectContaining({ code: "unsupported-published-image-default" })],
      },
    })
  })

  it("keeps mapping rejection diagnostics content-free and rejects invalid envelopes", () => {
    const payloadText = JSON.stringify({ privateValue: "do not leak" })
    const rejectedMapper = mapper()
    rejectedMapper.map = () => ({
      status: "blocked",
      canonicalInput: null,
      issues: [{ code: "source-required", path: "$.ข้อมูล.ชื่อ" }],
    })
    const invalidMapper = mapper()
    invalidMapper.map = () => ({ rawJson: { privateValue: "do not leak" } })

    const rejected = runVNextPublishedStructureGenerationRuntimeV1(adaptedRequest(payloadText), {
      adaptedInput: { payloadText, mapper: rejectedMapper },
    })
    const invalid = runVNextPublishedStructureGenerationRuntimeV1(adaptedRequest(payloadText), {
      adaptedInput: { payloadText, mapper: invalidMapper },
    })

    expect(rejected).toMatchObject({
      status: "blocked",
      execution: { mapping: "blocked", runtimeValidation: "not-run" },
      diagnostics: {
        issues: [expect.objectContaining({
          code: "mapping-rejected",
          detailCode: "source-required",
          path: "$.ข้อมูล.ชื่อ",
        })],
      },
    })
    expect(invalid).toMatchObject({
      status: "blocked",
      execution: { mapping: "failed" },
      diagnostics: { issues: [expect.objectContaining({ code: "invalid-mapping-result" })] },
    })
    expect(JSON.stringify(rejected.diagnostics)).not.toContain("do not leak")
    expect(JSON.stringify(invalid.diagnostics)).not.toContain("do not leak")
  })

  it("proves the isolated UAT mapper reaches the same canonical snapshots as its direct lane", () => {
    const adapterInput = uatAdapterInput()
    const adaptedBundle = adaptFlowDocUatSemanticNoPagesSectionV1(adapterInput)
    if (adaptedBundle.status === "blocked") throw new Error("UAT fixture must adapt")
    const { instance: exactInstance, ...externalPayload } = adapterInput
    const payloadText = JSON.stringify(externalPayload)
    const uat = createFlowDocUatStructureDefinitionV1()
    const contract = createVNextPublishedStructureGenerationDataContractV1({
      dataContractId: "uat-e2-generation-data-v1",
      publishedStructure: uat.structure,
      publishedStructureFingerprint: uat.structureFingerprint,
      fieldContract: uat.fieldContract,
      collectionItemContract: uat.collectionItemContract,
    })
    const profile = createVNextPublishedStructureMappingProfileV1({
      mappingProfileId: "uat-semantic-no-pages-e2-v1",
      mappingProfileVersion: 1,
      owner: flowDocUatPublishedStructureRefV1(),
      sourceContract: {
        sourceContractId: "uat_semantic_no_pages_v1",
        sourceContractVersion: 1,
        schemaFingerprint: hash("6"),
      },
      target: {
        dataContractId: contract.dataContractId,
        dataContractFingerprint: contract.dataContractFingerprint,
      },
      execution: {
        kind: "named-adapter",
        adapterId: FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID,
        adapterVersion: 1,
        implementationFingerprint: FLOWDOC_UAT_GENERATION_MAPPER_IMPLEMENTATION_FINGERPRINT,
      },
    })
    const directRequest: VNextPublishedStructureGenerationInputRequestV1 = {
      contractVersion: 1,
      kind: "published-structure-generation-input-request",
      dataContract: contract,
      instance: exactInstance,
      input: {
        kind: "canonical-snapshot-input",
        dataSnapshot: adaptedBundle.bundle.dataSnapshot,
        collectionSnapshots: [adaptedBundle.bundle.collectionSnapshot],
        mediaSnapshot: adaptedBundle.bundle.mediaSnapshot,
      },
    }
    const adaptedRequest: VNextPublishedStructureGenerationInputRequestV1 = {
      contractVersion: 1,
      kind: "published-structure-generation-input-request",
      dataContract: contract,
      instance: exactInstance,
      input: {
        kind: "adapted-payload-input",
        payload: createVNextPublishedStructureJsonPayloadDescriptorV1("uat-e2-payload", payloadText),
        mappingProfile: profile,
      },
    }

    const direct = runVNextPublishedStructureGenerationRuntimeV1(directRequest)
    const adapted = runVNextPublishedStructureGenerationRuntimeV1(adaptedRequest, {
      adaptedInput: { payloadText, mapper: createFlowDocUatGenerationMapperV1() },
    })

    expect(direct.status).not.toBe("blocked")
    expect(adapted.status).not.toBe("blocked")
    if (direct.status === "blocked" || adapted.status === "blocked") throw new Error("UAT parity blocked")
    expect(adapted.canonicalInputFingerprint).toBe(direct.canonicalInputFingerprint)
    expect(adapted.canonicalInput).toEqual(direct.canonicalInput)
    expect(adapted.diagnostics.summary).toMatchObject({ collectionItemCount: 2, mediaAssetCount: 1 })
    expect(JSON.stringify(adapted.diagnostics)).not.toContain("Secret requirement text")
  })

  it("keeps accepted E.2 evidence aligned without activating downstream runtime", () => {
    const read = (relativePath: string): string => readFileSync(
      new URL(relativePath, import.meta.url),
      "utf8",
    )
    const runtimeDoc = read("../docs/PDF_EXPORT_REALDOC_GENERATION_RUNTIME.md")
    const roadmap = read("../docs/PDF_EXPORT_REAL_DOCUMENT_ROADMAP.md")
    const architectureLock = read("../docs/PDF_EXPORT_REALDOC_DOCGEN_ARCHITECTURE_LOCK.md")
    const readme = read("../README.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    const operatingMap = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const exports = read("../src/index.ts")
    const uatExports = read("../packages/uat-realdoc/src/index.ts")

    for (const section of [
      "## Payload Admission",
      "## Mapping Runtime",
      "## Shared Validation",
      "## Default Policy",
      "## Content-Free Diagnostics",
      "## UAT Parity Evidence",
      "## Fail-Closed Coverage",
      "## Explicitly Not Changed",
      "## PASS",
      "## RISK",
      "## UNKNOWN",
      "## Next Phase",
    ]) expect(runtimeDoc).toContain(section)

    expect(runtimeDoc).toMatch(/Both input families converge through one canonical validator/)
    expect(runtimeDoc).toMatch(/Production remains NO-GO/)
    expect(roadmap).toContain("### REALDOC-E.2 Generation Mapping And Validation Runtime (Accepted)")
    expect(architectureLock).toMatch(/E\.2 now\s+accepts exact payload\/mapper execution/)
    expect(readme).toContain("PDF export REALDOC-E.2 adds pure runtime mapping and validation")
    expect(ledger).toContain("## PDF-EXPORT-REALDOC-E.2 Generation Mapping And Validation Runtime")
    expect(operatingMap).toContain("PDF export REALDOC-E.2 executes that boundary")
    expect(exports).toContain('export * from "./generation/publishedStructureGenerationRuntimeV1.js"')
    expect(uatExports).toContain('export * from "./uatGenerationMapper.js"')
    expect(runtimeDoc).toContain("## Backend E.3 Handoff Evidence")
    expect(runtimeDoc).toContain("`PDF-EXPORT-REALDOC-E.4` now binds one Backend-admitted 69C canonical record")
    expect(roadmap).toContain("### REALDOC-E.3 Bounded Local Backend DocGen Admission (Accepted)")

    for (const claim of ["backend route activated", "materialization executed", "production ready"]) {
      expect(runtimeDoc.toLowerCase()).not.toContain(claim)
    }
  })
})
