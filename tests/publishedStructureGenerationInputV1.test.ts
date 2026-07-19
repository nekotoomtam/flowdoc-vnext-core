import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextPublishedStructureGenerationDataContractV1,
  createVNextPublishedStructureMappingProfileV1,
  planVNextPublishedStructureGenerationInputV1,
  type VNextDocumentInstanceIdentityV1,
  type VNextPublishedCollectionItemContractV1,
  type VNextPublishedFieldContractV1,
  type VNextPublishedStructureGenerationDataContractV1,
  type VNextPublishedStructureGenerationInputRequestV1,
  type VNextPublishedStructureMappingProfileV1,
  type VNextPublishedStructureVersionIdentityV1,
  type VNextPublishedStructureVersionRefV1,
} from "../src/index.js"
import {
  FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID,
  createFlowDocUatStructureDefinitionV1,
} from "../packages/uat-realdoc/src/index.js"

const hash = (value: string): string => `sha256:${value.repeat(64).slice(0, 64)}`
const hex = (value: string): string => value.repeat(64).slice(0, 64)

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function structure(): VNextPublishedStructureVersionIdentityV1 {
  return {
    contractVersion: 1,
    kind: "published-structure-version",
    structureId: "structure-dynamic-report",
    structureVersionId: "structure-dynamic-report-v3",
    versionOrdinal: 3,
    sourceDraft: {
      structureId: "structure-dynamic-report",
      draftId: "draft-dynamic-report",
      revision: 9,
    },
  }
}

function structureRef(value = structure()): VNextPublishedStructureVersionRefV1 {
  return {
    structureId: value.structureId,
    structureVersionId: value.structureVersionId,
    versionOrdinal: value.versionOrdinal,
  }
}

function fieldContract(
  owner = structureRef(),
  reverse = false,
): VNextPublishedFieldContractV1 {
  const entries = [
    ["report.title", { key: "report.title", label: "Title", type: "text" as const }],
    ["report.logo", { key: "report.logo", label: "Logo", type: "image" as const }],
    ["report.items", { key: "report.items", label: "Items", type: "collection" as const }],
  ] as const
  return {
    contractVersion: 1,
    kind: "published-field-contract",
    fieldContractId: "fields-dynamic-report-v3",
    owner,
    registry: { version: 1, fields: Object.fromEntries(reverse ? [...entries].reverse() : entries) },
  }
}

function itemContract(owner = structureRef()): VNextPublishedCollectionItemContractV1 {
  return {
    contractVersion: 1,
    kind: "published-collection-item-contract",
    collectionItemContractId: "items-dynamic-report-v3",
    publishedFieldContractId: "fields-dynamic-report-v3",
    owner,
    collections: {
      "report.items": {
        collectionFieldKey: "report.items",
        fields: {
          name: { key: "name", label: "Name", type: "text", required: true },
          amount: { key: "amount", label: "Amount", type: "number", required: true },
        },
      },
    },
  }
}

function dataContract(reverse = false): VNextPublishedStructureGenerationDataContractV1 {
  return createVNextPublishedStructureGenerationDataContractV1({
    dataContractId: "generation-data-dynamic-report-v3",
    publishedStructure: structure(),
    publishedStructureFingerprint: hash("1"),
    fieldContract: fieldContract(structureRef(), reverse),
    collectionItemContract: itemContract(),
  })
}

function instance(): VNextDocumentInstanceIdentityV1 {
  return {
    contractVersion: 1,
    kind: "document-instance",
    instanceId: "generation-instance-001",
    revision: 0,
    structureVersion: structureRef(),
  }
}

function directRequest(): VNextPublishedStructureGenerationInputRequestV1 {
  const exactInstance = instance()
  return {
    contractVersion: 1,
    kind: "published-structure-generation-input-request",
    dataContract: dataContract(),
    instance: exactInstance,
    input: {
      kind: "canonical-snapshot-input",
      dataSnapshot: {
        contractVersion: 1,
        kind: "instance-data-snapshot",
        dataSnapshotId: "data-generation-instance-001-r0",
        instance: clone(exactInstance),
        data: {
          version: 2,
          values: {
            "report.title": "Confidential dynamic report",
            "report.logo": null,
          },
        },
      },
      collectionSnapshots: [{
        contractVersion: 1,
        kind: "table-collection-snapshot",
        collectionSnapshotId: "collections-generation-instance-001-r0",
        snapshotRevision: 0,
        instance: clone(exactInstance),
        collections: {
          "report.items": {
            collectionFieldKey: "report.items",
            items: [
              { itemKey: "item-001", values: { name: "Private item", amount: 42 } },
            ],
          },
        },
      }],
      mediaSnapshot: {
        contractVersion: 1,
        kind: "instance-media-snapshot",
        mediaSnapshotId: "media-generation-instance-001-r0",
        instance: clone(exactInstance),
        registry: { version: 1, images: {} },
      },
    },
  }
}

function mappingProfile(options: {
  owner?: VNextPublishedStructureVersionRefV1
  targetId?: string
  targetFingerprint?: string
  execution?: "named-adapter" | "declarative-mapping"
} = {}): VNextPublishedStructureMappingProfileV1 {
  const target = dataContract()
  return createVNextPublishedStructureMappingProfileV1({
    mappingProfileId: "external-report-json-v2",
    mappingProfileVersion: 2,
    owner: options.owner ?? structureRef(),
    sourceContract: {
      sourceContractId: "external-report-payload",
      sourceContractVersion: 2,
      schemaFingerprint: hash("2"),
    },
    target: {
      dataContractId: options.targetId ?? target.dataContractId,
      dataContractFingerprint: options.targetFingerprint ?? target.dataContractFingerprint,
    },
    execution: options.execution === "declarative-mapping"
      ? {
          kind: "declarative-mapping",
          mappingLanguageId: "flowdoc-map",
          mappingLanguageVersion: 1,
          definitionFingerprint: hash("3"),
          executorFingerprint: hash("4"),
        }
      : {
          kind: "named-adapter",
          adapterId: "external-report-adapter",
          adapterVersion: 2,
          implementationFingerprint: hash("5"),
        },
  })
}

function adaptedRequest(
  profile = mappingProfile(),
): VNextPublishedStructureGenerationInputRequestV1 {
  return {
    contractVersion: 1,
    kind: "published-structure-generation-input-request",
    dataContract: dataContract(),
    instance: instance(),
    input: {
      kind: "adapted-payload-input",
      payload: {
        payloadId: "payload-external-report-001",
        mediaType: "application/json",
        byteLength: 2048,
        byteSha256: hex("6"),
      },
      mappingProfile: profile,
    },
  }
}

describe("Published Structure generation input v1", () => {
  it("creates deterministic data and mapping contracts independent of record insertion order", () => {
    const normal = dataContract()
    const reversed = dataContract(true)
    const declarative = mappingProfile({ execution: "declarative-mapping" })

    expect(reversed.dataContractFingerprint).toBe(normal.dataContractFingerprint)
    expect(normal.snapshotContracts).toEqual({
      dataSnapshot: "instance-data-snapshot-v1",
      collectionSnapshot: "table-collection-snapshot-v1",
      mediaSnapshot: "instance-media-snapshot-v1",
    })
    expect(mappingProfile().profileFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(declarative.execution.kind).toBe("declarative-mapping")
    expect(declarative.policies).toMatchObject({
      canonicalSnapshotOutputOnly: true,
      layoutFactsAccepted: false,
      rendererFactsAccepted: false,
      browserExecutionAuthoritative: false,
    })
  })

  it("plans direct canonical snapshots without retaining business values", () => {
    const request = directRequest()
    const before = JSON.stringify(request)
    const first = planVNextPublishedStructureGenerationInputV1(request)
    const second = planVNextPublishedStructureGenerationInputV1(clone(request))

    expect(first.status).toBe("planned")
    if (first.status !== "planned" || second.status !== "planned") throw new Error("direct input blocked")
    expect(first).toEqual(second)
    expect(first.nextStep).toBe("runtime-validation")
    expect(first.input).toMatchObject({
      kind: "canonical-snapshot-input",
      status: "runtime-validation-required",
      dataSnapshot: { valueCount: 2 },
      mediaSnapshot: { assetCount: 0 },
    })
    expect(first.dataContract.collectionFieldKeys).toEqual(["report.items"])
    expect(first.execution).toMatchObject({ mapping: "not-required", runtimeValidation: "not-run" })
    expect(JSON.stringify(first)).not.toContain("Confidential dynamic report")
    expect(JSON.stringify(first)).not.toContain("Private item")
    expect(JSON.stringify(request)).toBe(before)
  })

  it("plans adapted payload identity without accepting raw JSON or executing mapping", () => {
    const result = planVNextPublishedStructureGenerationInputV1(adaptedRequest())

    expect(result.status).toBe("planned")
    if (result.status !== "planned") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.nextStep).toBe("mapping")
    expect(result.input).toMatchObject({
      kind: "adapted-payload-input",
      status: "mapping-required",
      mappingProfile: {
        mappingProfileId: "external-report-json-v2",
        executionKind: "named-adapter",
      },
    })
    expect(result.execution).toMatchObject({
      mapping: "required-not-run",
      runtimeValidation: "not-run",
      resolution: "not-run",
      artifact: "not-run",
    })
    expect(result.contracts).toMatchObject({
      rawPayloadRetainedInPlan: false,
      layoutFactsAcceptedFromCaller: false,
      rendererFactsAcceptedFromCaller: false,
      productionBinding: false,
    })

    const withRawPayload = clone(adaptedRequest()) as unknown as Record<string, unknown>
    const adapted = withRawPayload.input as Record<string, unknown>
    adapted.rawJson = { forbidden: true }
    expect(planVNextPublishedStructureGenerationInputV1(withRawPayload)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-request", path: "input" })],
    })
  })

  it("fails closed on snapshot, field, collection, instance, and unknown layout drift", () => {
    const wrongInstance = directRequest()
    wrongInstance.instance.structureVersion.structureVersionId = "other-version"
    const wrongSnapshot = directRequest()
    wrongSnapshot.input.kind === "canonical-snapshot-input"
      && (wrongSnapshot.input.dataSnapshot.instance.revision = 1)
    const unknownField = directRequest()
    unknownField.input.kind === "canonical-snapshot-input"
      && (unknownField.input.dataSnapshot.data.values.unknown = "value")
    const scalarCollection = directRequest()
    scalarCollection.input.kind === "canonical-snapshot-input"
      && (scalarCollection.input.dataSnapshot.data.values["report.items"] = "forbidden")
    const duplicateCollection = directRequest()
    if (duplicateCollection.input.kind === "canonical-snapshot-input") {
      const extra = clone(duplicateCollection.input.collectionSnapshots[0]!)
      extra.collectionSnapshotId = "collections-generation-instance-001-extra"
      duplicateCollection.input.collectionSnapshots.push(extra)
    }
    const unknownItemField = directRequest()
    if (unknownItemField.input.kind === "canonical-snapshot-input") {
      unknownItemField.input.collectionSnapshots[0]!.collections["report.items"]!.items[0]!.values.extra = true
    }
    const layout = clone(directRequest()) as unknown as Record<string, unknown>
    layout.layout = { page: "A4" }

    const cases = [
      [wrongInstance, "instance-structure-version-mismatch"],
      [wrongSnapshot, "snapshot-instance-mismatch"],
      [unknownField, "unknown-data-field"],
      [scalarCollection, "collection-field-in-scalar-data"],
      [duplicateCollection, "duplicate-collection-field-key"],
      [unknownItemField, "unknown-collection-item-field"],
      [layout, "invalid-request"],
    ] as const
    cases.forEach(([candidate, code]) => {
      const result = planVNextPublishedStructureGenerationInputV1(candidate)
      expect(result.status).toBe("blocked")
      if (result.status === "blocked") expect(result.issues.map((item) => item.code)).toContain(code)
    })
  })

  it("fails closed on fingerprint, mapping owner, and mapping target drift", () => {
    const fingerprintDrift = directRequest()
    fingerprintDrift.dataContract.dataContractFingerprint = hash("f")
    const wrongOwner = structureRef()
    wrongOwner.structureVersionId = "structure-other-v1"
    const ownerMismatch = adaptedRequest(mappingProfile({ owner: wrongOwner }))
    const targetMismatch = adaptedRequest(mappingProfile({ targetId: "other-data-contract" }))

    expect(planVNextPublishedStructureGenerationInputV1(fingerprintDrift)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "invalid-request", path: "dataContract.dataContractFingerprint" })],
    })
    expect(planVNextPublishedStructureGenerationInputV1(ownerMismatch)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "mapping-owner-version-mismatch" })],
    })
    expect(planVNextPublishedStructureGenerationInputV1(targetMismatch)).toMatchObject({
      status: "blocked",
      issues: [expect.objectContaining({ code: "mapping-target-contract-mismatch" })],
    })
  })

  it("accepts the UAT Structure through the generic adapted-input contract", () => {
    const uat = createFlowDocUatStructureDefinitionV1()
    const owner = {
      structureId: uat.structure.structureId,
      structureVersionId: uat.structure.structureVersionId,
      versionOrdinal: uat.structure.versionOrdinal,
    }
    const contract = createVNextPublishedStructureGenerationDataContractV1({
      dataContractId: "uat-record-generation-data-v1",
      publishedStructure: uat.structure,
      publishedStructureFingerprint: uat.structureFingerprint,
      fieldContract: uat.fieldContract,
      collectionItemContract: uat.collectionItemContract,
    })
    const profile = createVNextPublishedStructureMappingProfileV1({
      mappingProfileId: "uat-semantic-no-pages-v1",
      mappingProfileVersion: 1,
      owner,
      sourceContract: {
        sourceContractId: "uat_semantic_no_pages_v1",
        sourceContractVersion: 1,
        schemaFingerprint: hash("7"),
      },
      target: {
        dataContractId: contract.dataContractId,
        dataContractFingerprint: contract.dataContractFingerprint,
      },
      execution: {
        kind: "named-adapter",
        adapterId: FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID,
        adapterVersion: 1,
        implementationFingerprint: hash("8"),
      },
    })
    const result = planVNextPublishedStructureGenerationInputV1({
      contractVersion: 1,
      kind: "published-structure-generation-input-request",
      dataContract: contract,
      instance: {
        contractVersion: 1,
        kind: "document-instance",
        instanceId: "uat-generation-pretest-001",
        revision: 0,
        structureVersion: owner,
      },
      input: {
        kind: "adapted-payload-input",
        payload: {
          payloadId: "uat-section-2-1-test-payload",
          mediaType: "application/json",
          byteLength: 4096,
          byteSha256: hex("9"),
        },
        mappingProfile: profile,
      },
    })

    expect(result.status).toBe("planned")
    if (result.status !== "planned") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.nextStep).toBe("mapping")
    expect(result.dataContract.collectionFieldKeys).toEqual(["uat.requirements", "uat.screenshots"])
    expect(result.input).toMatchObject({
      kind: "adapted-payload-input",
      mappingProfile: { executionKind: "named-adapter" },
    })
  })

  it("keeps the accepted E.1 evidence aligned without claiming runtime activation", () => {
    const read = (relativePath: string): string => readFileSync(
      new URL(relativePath, import.meta.url),
      "utf8",
    )
    const contractDoc = read("../docs/PDF_EXPORT_REALDOC_PUBLISHED_STRUCTURE_GENERATION_INPUT.md")
    const roadmap = read("../docs/PDF_EXPORT_REAL_DOCUMENT_ROADMAP.md")
    const architectureLock = read("../docs/PDF_EXPORT_REALDOC_DOCGEN_ARCHITECTURE_LOCK.md")
    const readme = read("../README.md")
    const ledger = read("../docs/PHASE_LEDGER.md")
    const operatingMap = read("../docs/CROSS_REPO_OPERATING_MAP.md")
    const publicExports = read("../src/index.ts")

    for (const section of [
      "## FlowDoc-Owned Data Contract",
      "## Direct Canonical Input",
      "## Adapted Payload Input",
      "## Plan Evidence",
      "## UAT Compatibility Evidence",
      "## Explicitly Not Changed",
      "## PASS",
      "## RISK",
      "## UNKNOWN",
      "## Next Phase",
    ]) expect(contractDoc).toContain(section)

    expect(contractDoc).toContain("runtime-validation-required")
    expect(contractDoc).toContain("mapping-required")
    expect(contractDoc).toMatch(/Raw JSON is deliberately not part of the Core request schema/)
    expect(contractDoc).toMatch(/Production\s+remains NO-GO/)
    expect(roadmap).toContain("### REALDOC-E.1 Published Structure Generation Input (Accepted)")
    expect(architectureLock).toMatch(/E\.1 now accepts the pure Published Structure generation input/)
    expect(readme).toContain("PDF export REALDOC-E.1 adds a pure Published Structure generation input")
    expect(ledger).toContain("## PDF-EXPORT-REALDOC-E.1 Published Structure Generation Input")
    expect(operatingMap).toContain("PDF export REALDOC-E.1 adds the pure Core boundary")
    expect(publicExports).toContain('export * from "./generation/publishedStructureGenerationInputV1.js"')

    for (const claim of ["route activated", "runtime mapping accepted", "production ready"]) {
      expect(contractDoc.toLowerCase()).not.toContain(claim)
    }
  })
})
