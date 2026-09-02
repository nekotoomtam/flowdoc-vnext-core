import { describe, expect, it } from "vitest"
import {
  createVNextPublishedStructureGenerationDataContractV1,
  createVNextPublishedStructurePdfBoundaryPlanV1,
  runVNextPublishedStructureGenerationRuntimeV1,
  type VNextDocumentInstanceIdentityV1,
  type VNextPublishedCollectionItemContractV1,
  type VNextPublishedFieldContractV1,
  type VNextPublishedStructureCanonicalSnapshotInputV1,
  type VNextPublishedStructureGenerationDataContractV1,
  type VNextPublishedStructureGenerationInputRequestV1,
  type VNextPublishedStructureGenerationRuntimeReadyV1,
  type VNextPublishedStructureGenerationRuntimeResultV1,
  type VNextPublishedStructureVersionIdentityV1,
  type VNextPublishedStructureVersionRefV1,
} from "../src/index.js"

const hash = (value: string): string => `sha256:${value.repeat(64).slice(0, 64)}`

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function structure(): VNextPublishedStructureVersionIdentityV1 {
  return {
    contractVersion: 1,
    kind: "published-structure-version",
    structureId: "structure-first-delivery-report",
    structureVersionId: "structure-first-delivery-report-v1",
    versionOrdinal: 1,
    sourceDraft: {
      structureId: "structure-first-delivery-report",
      draftId: "draft-first-delivery-report",
      revision: 3,
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

function fieldContract(): VNextPublishedFieldContractV1 {
  return {
    contractVersion: 1,
    kind: "published-field-contract",
    fieldContractId: "fields-first-delivery-report-v1",
    owner: structureRef(),
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
    collectionItemContractId: "items-first-delivery-report-v1",
    publishedFieldContractId: "fields-first-delivery-report-v1",
    owner: structureRef(),
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

function dataContract(): VNextPublishedStructureGenerationDataContractV1 {
  return createVNextPublishedStructureGenerationDataContractV1({
    dataContractId: "generation-data-first-delivery-report-v1",
    publishedStructure: structure(),
    publishedStructureFingerprint: hash("1"),
    fieldContract: fieldContract(),
    collectionItemContract: itemContract(),
  })
}

function instance(): VNextDocumentInstanceIdentityV1 {
  return {
    contractVersion: 1,
    kind: "document-instance",
    instanceId: "first-delivery-instance-001",
    revision: 0,
    structureVersion: structureRef(),
  }
}

function canonicalInput(
  values: { title?: unknown; name?: unknown; amount?: unknown } = {},
): VNextPublishedStructureCanonicalSnapshotInputV1 {
  const exactInstance = instance()
  return {
    kind: "canonical-snapshot-input",
    dataSnapshot: {
      contractVersion: 1,
      kind: "instance-data-snapshot",
      dataSnapshotId: "first-delivery-data-r0",
      instance: clone(exactInstance),
      data: {
        version: 2,
        values: {
          "report.title": (values.title ?? "Secret first delivery report") as string,
          "report.logo": null,
        },
      },
    },
    collectionSnapshots: [{
      contractVersion: 1,
      kind: "table-collection-snapshot",
      collectionSnapshotId: "first-delivery-collections-r0",
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
      mediaSnapshotId: "first-delivery-media-r0",
      instance: clone(exactInstance),
      registry: { version: 1, images: {} },
    },
  }
}

function directRequest(
  input = canonicalInput(),
): VNextPublishedStructureGenerationInputRequestV1 {
  return {
    contractVersion: 1,
    kind: "published-structure-generation-input-request",
    dataContract: dataContract(),
    instance: instance(),
    input,
  }
}

function readyRuntime(): VNextPublishedStructureGenerationRuntimeReadyV1 {
  const result = runVNextPublishedStructureGenerationRuntimeV1(directRequest())
  if (result.status === "blocked") throw new Error(JSON.stringify(result.diagnostics.issues))
  return result
}

function boundaryInput(runtime: VNextPublishedStructureGenerationRuntimeResultV1 = readyRuntime()) {
  return {
    generationRuntime: runtime,
    publishedStructure: {
      structureVersion: structureRef(),
      structureFingerprint: hash("1"),
    },
    pdfExport: {
      exportRequestId: "export-request:first-delivery-001",
      artifactId: "artifact:first-delivery-001",
      requestedAt: "2026-09-02T01:00:00.000Z",
    },
    sourceOwner: {
      sourcePackageId: "package:first-delivery",
      sessionId: null,
    },
    profiles: {
      materializationProfileId: "materialization:core-document-v1",
      resolutionProfileId: "resolution:core-scoped-v1",
      measurementProfileId: "measurement:thai-text-v1",
      paginationProfileId: "pagination:flowdoc-page-v1",
      rendererProfileId: "renderer:pdf-measured-v1",
    },
  }
}

describe("Published Structure PDF boundary v1", () => {
  it("plans a deterministic, content-free path from accepted generation input toward PDF handoff", () => {
    const runtime = readyRuntime()
    const first = createVNextPublishedStructurePdfBoundaryPlanV1(boundaryInput(runtime))
    const second = createVNextPublishedStructurePdfBoundaryPlanV1(boundaryInput(runtime))

    expect(first).toEqual(second)
    expect(first).toMatchObject({
      source: "vnext-published-structure-pdf-boundary",
      contractVersion: 1,
      kind: "published-structure-pdf-boundary-plan-result",
      status: "ready",
      issues: [],
      plan: {
        source: "vnext-published-structure-pdf-boundary",
        contractVersion: 1,
        kind: "published-structure-pdf-boundary-plan",
        status: "ready",
        output: { format: "pdf", mediaType: "application/pdf" },
        sourceOwner: {
          sourcePackageId: "package:first-delivery",
          sessionId: null,
        },
        generation: {
          runtimeSource: "vnext-published-structure-generation-runtime",
          runtimeStatus: "ready",
          runtimeReceiptFingerprint: runtime.receiptFingerprint,
          inputPlanFingerprint: runtime.planFingerprint,
          canonicalInputFingerprint: runtime.canonicalInputFingerprint,
          canonicalContentFingerprint: runtime.canonicalContentFingerprint,
        },
        instance: instance(),
        publishedStructure: {
          structureVersion: structureRef(),
          structureFingerprint: hash("1"),
        },
        stages: {
          generationRuntime: "accepted",
          materialization: "required-not-run",
          resolution: "required-not-run",
          measurement: "required-not-run",
          pagination: "required-not-run",
          pdfMeasuredDrawContract: "required-not-run",
          pdfExportRequest: "blocked-until-measured-draw-contract",
          pdfExportHandoff: "blocked-until-pdf-export-request",
          rendererExecution: "external-not-run",
          artifactPersistence: "backend-not-run",
        },
        prerequisites: {
          pdfExportRequest: {
            requiresSourceDocumentFingerprint: true,
            requiresConsumableMeasuredDrawContract: true,
          },
          pdfExportHandoff: {
            consumes: "vnext-pdf-measured-draw-contract-v1",
            sourceRevisionPinned: true,
            sourceFingerprintPinned: true,
          },
        },
        contracts: {
          contentFreePlan: true,
          rawPayloadRetained: false,
          businessValuesRetained: false,
          consumesPublishedStructureRuntimeReceipt: true,
          requiresPdfMeasuredDrawContractBeforeHandoff: true,
          layoutFactsAcceptedFromCaller: false,
          rendererFactsAcceptedFromCaller: false,
          backendOwnsApiKeysAndStorage: true,
          rendererOwnsPdfBytes: true,
          productionBinding: false,
        },
        execution: {
          materialization: false,
          resolution: false,
          measurement: false,
          pagination: false,
          pdfMeasuredDrawContract: false,
          pdfExportRequestCreated: false,
          pdfExportHandoffCreated: false,
          rendererExecution: false,
          pdfBytesProduced: false,
          storageWrites: false,
          backendRoute: false,
          workerOrQueue: false,
          apiKeyExposure: false,
          productionBinding: false,
        },
      },
    })
    if (first.status === "blocked") throw new Error(JSON.stringify(first.issues))
    expect(first.plan.planFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(JSON.stringify(first)).not.toContain("Secret first delivery report")
    expect(JSON.stringify(first)).not.toContain("Private item")
  })

  it("blocks before PDF planning when the generation runtime is blocked", () => {
    const runtime = runVNextPublishedStructureGenerationRuntimeV1(
      directRequest(canonicalInput({ title: 123 })),
    )
    expect(runtime.status).toBe("blocked")

    const result = createVNextPublishedStructurePdfBoundaryPlanV1(boundaryInput(runtime))

    expect(result).toMatchObject({
      status: "blocked",
      plan: null,
      issues: [expect.objectContaining({
        code: "generation-runtime-blocked",
        path: "generationRuntime",
      })],
    })
    expect(JSON.stringify(result)).not.toContain("Private item")
    expect(JSON.stringify(result)).not.toContain("Secret first delivery report")
  })

  it("fails closed on missing owner, artifact, request, date, and profile pins", () => {
    const result = createVNextPublishedStructurePdfBoundaryPlanV1({
      ...boundaryInput(),
      pdfExport: {
        exportRequestId: "",
        artifactId: "",
        requestedAt: "not-a-date",
      },
      sourceOwner: {
        sourcePackageId: null,
        sessionId: null,
      },
      profiles: {
        materializationProfileId: "",
        resolutionProfileId: "",
        measurementProfileId: "",
        paginationProfileId: "",
        rendererProfileId: "",
      },
    })

    expect(result.status).toBe("blocked")
    expect(result.plan).toBeNull()
    expect(result.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "export-request-id-invalid",
      "artifact-id-invalid",
      "requested-at-invalid",
      "source-owner-missing",
      "profile-id-invalid",
    ]))
  })
})
