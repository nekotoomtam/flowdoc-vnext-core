import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextPdfExportHandoffV1,
  createVNextPdfExportProductionAdmissionV1,
  createVNextPdfExportProductionBaselineV1,
  createVNextPdfExportProductionRenderCompletionV1,
  createVNextPdfExportReceiptV1,
  createVNextPdfExportRequestV1,
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfExportProductionPolicyV1,
  type VNextPdfExportSourceIdentityV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../src/index.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function source(revision = 7): VNextPdfExportSourceIdentityV1 {
  return {
    documentId: "document:production-lifecycle",
    documentRevision: revision,
    documentFingerprint: `sha256:${revision.toString(16).padStart(64, "0")}`,
    sourcePackageId: "package:production-lifecycle",
    sessionId: null,
  }
}

function policy(overrides: Partial<VNextPdfExportProductionPolicyV1> = {}): VNextPdfExportProductionPolicyV1 {
  return {
    policyId: "pdf-production-lifecycle-v1",
    maxAttempts: 2,
    executionDeadlineMs: 120_000,
    resources: {
      maxPageCount: 100,
      maxPaintCommandCount: 100_000,
      maxGlyphCount: 1_000_000,
      maxFontAssetCount: 16,
      maxImageAssetCount: 50,
      maxSingleImagePixelCount: 25_000_000,
      maxTotalImagePixelCount: 250_000_000,
      maxOutputByteLength: 100_000_000,
    },
    ...overrides,
  }
}

function phaseT(revision = 7, byteLength = 17_594) {
  const measuredDrawContract = createVNextPdfMeasuredDrawContractV1(
    readJson<VNextPdfMeasuredDrawContractRequestV1>(
      "fixtures/pdf-pilot-thai-one-page-request.v1.json",
    ),
  )
  const requestResult = createVNextPdfExportRequestV1({
    exportRequestId: `export:production-lifecycle:${revision}`,
    artifactId: `artifact:production-lifecycle:${revision}`,
    requestedAt: "2026-07-18T09:00:00.000Z",
    source: source(revision),
    measuredDrawContract,
  })
  if (requestResult.status !== "ready") throw new Error(JSON.stringify(requestResult.issues))
  const handoff = createVNextPdfExportHandoffV1({
    request: requestResult.request,
    currentSource: source(revision),
    measuredDrawContract,
  })
  const receiptResult = createVNextPdfExportReceiptV1({
    handoff,
    renderEvidence: {
      status: "rendered",
      artifactId: requestResult.request.artifactId,
      format: "pdf",
      mediaType: "application/pdf",
      byteLength,
      sha256: "a".repeat(64),
      pageCount: requestResult.request.measuredDrawContract.pageCount,
      rendererProfileId: requestResult.request.measuredDrawContract.rendererProfileId,
      measurementProfileId: requestResult.request.measuredDrawContract.measurementProfileId,
      sourceContractFingerprint: requestResult.request.measuredDrawContract.fingerprint,
      sourceContractContentFingerprint: requestResult.request.measuredDrawContract.contentFingerprint,
    },
  })
  if (receiptResult.status !== "accepted") throw new Error(JSON.stringify(receiptResult.issues))
  return {
    request: requestResult.request,
    measuredDrawContract,
    receipt: receiptResult.receipt,
  }
}

function admission(revision = 7, selectedPolicy = policy()) {
  const input = phaseT(revision)
  const result = createVNextPdfExportProductionAdmissionV1({
    admissionId: `admission:production-lifecycle:${revision}`,
    request: input.request,
    currentSource: source(revision),
    measuredDrawContract: input.measuredDrawContract,
    policy: selectedPolicy,
  })
  if (result.status !== "admitted") throw new Error(JSON.stringify(result.issues))
  return { ...input, admission: result.admission }
}

describe("PDF export production lifecycle v1", () => {
  it("admits exact pre-render work and derives the Phase U idempotency identity without a receipt", () => {
    const input = phaseT()
    const first = createVNextPdfExportProductionAdmissionV1({
      admissionId: "admission:thai-one-page:7",
      request: input.request,
      currentSource: source(),
      measuredDrawContract: input.measuredDrawContract,
      policy: policy(),
    })
    const second = createVNextPdfExportProductionAdmissionV1({
      admissionId: "admission:thai-one-page:7",
      request: input.request,
      currentSource: source(),
      measuredDrawContract: input.measuredDrawContract,
      policy: policy(),
    })
    const baseline = createVNextPdfExportProductionBaselineV1({
      baselineId: "baseline:thai-one-page:7",
      ...input,
      policy: policy(),
    })

    expect(first).toMatchObject({
      status: "admitted",
      admission: {
        source: "vnext-pdf-export-production-admission",
        contractVersion: 1,
        kind: "pdf-export-production-admission",
        exportIdentity: {
          exportRequestId: input.request.exportRequestId,
          artifactId: input.request.artifactId,
          sourceIdentity: source(),
        },
        resources: {
          measured: {
            pageCount: 1,
            paintCommandCount: 4,
            glyphCount: 54,
            fontAssetCount: 1,
            imageAssetCount: 0,
          },
          measuredWithinLimits: true,
          outputByteLength: "pending-render",
        },
        contracts: {
          preRenderAdmission: true,
          rendererExecution: false,
          storageWrites: false,
          backendRoute: false,
          productionBinding: false,
        },
      },
      issues: [],
    })
    if (first.status !== "admitted" || second.status !== "admitted" || baseline.status !== "accepted") {
      throw new Error("production admission and baseline must pass")
    }
    expect(second.admission).toEqual(first.admission)
    expect(first.admission.idempotency.payloadFingerprint).toBe(
      baseline.baseline.idempotency.payloadFingerprint,
    )
    expect(first.admission.admissionFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
  })

  it("blocks stale source and measured resource overflow before renderer execution", () => {
    const input = phaseT()
    const stale = createVNextPdfExportProductionAdmissionV1({
      admissionId: "admission:stale",
      request: input.request,
      currentSource: source(8),
      measuredDrawContract: input.measuredDrawContract,
      policy: policy(),
    })
    expect(stale).toMatchObject({ status: "blocked", admission: null })
    expect(stale.issues.map((item) => item.message).join(" ")).toContain("source-revision-drift")

    const tooSmall = createVNextPdfExportProductionAdmissionV1({
      admissionId: "admission:too-small",
      request: input.request,
      currentSource: source(),
      measuredDrawContract: input.measuredDrawContract,
      policy: policy({
        resources: {
          ...policy().resources,
          maxPaintCommandCount: 3,
          maxGlyphCount: 53,
        },
      }),
    })
    expect(tooSmall).toMatchObject({ status: "blocked", admission: null })
    expect(tooSmall.issues.filter((item) => item.code === "production-resource-limit-exceeded").map(
      (item) => item.path,
    )).toEqual([
      "resources.actual.paintCommandCount",
      "resources.actual.glyphCount",
    ])
  })

  it("changes admission payload identity when the exact request or policy changes", () => {
    const first = admission(7)
    const changedSource = admission(8)
    const changedPolicy = admission(7, policy({ executionDeadlineMs: 180_000 }))

    expect(changedSource.admission.idempotency.payloadFingerprint).not.toBe(
      first.admission.idempotency.payloadFingerprint,
    )
    expect(changedPolicy.admission.idempotency.payloadFingerprint).not.toBe(
      first.admission.idempotency.payloadFingerprint,
    )
  })

  it("accepts an exact render receipt only as ready for persistence", () => {
    const input = admission()
    const result = createVNextPdfExportProductionRenderCompletionV1({
      completionId: "completion:thai-one-page:7",
      admission: input.admission,
      request: input.request,
      measuredDrawContract: input.measuredDrawContract,
      receipt: input.receipt,
    })

    expect(result).toMatchObject({
      status: "ready-for-persistence",
      completion: {
        source: "vnext-pdf-export-production-render-completion",
        contractVersion: 1,
        kind: "pdf-export-production-render-completion",
        admissionFingerprint: input.admission.admissionFingerprint,
        idempotencyPayloadFingerprint: input.admission.idempotency.payloadFingerprint,
        artifact: {
          byteLength: 17_594,
          sha256: "a".repeat(64),
          storageStatus: "not-stored",
          storageKey: null,
        },
        storage: {
          nextAction: "persist-content-addressed-bytes",
          metadataBeforeBytes: false,
          writesExecuted: false,
        },
        contracts: {
          postRenderValidation: true,
          exactAdmissionRevalidated: true,
          exactReceiptRevalidated: true,
          readyForPersistence: true,
          carriesBytes: false,
          byteContentVerified: false,
          storageWrites: false,
          productionBinding: false,
        },
      },
      issues: [],
    })
    if (result.status !== "ready-for-persistence") throw new Error("render completion must pass")
    expect(result.completion.completionFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(result.completion).not.toHaveProperty("bytes")
    expect(result.completion.artifact).not.toHaveProperty("bytes")
  })

  it("blocks admission drift, receipt drift, and post-render byte overflow", () => {
    const driftedAdmissionInput = admission()
    driftedAdmissionInput.admission.lifecycle.maxAttempts = 3
    const driftedAdmission = createVNextPdfExportProductionRenderCompletionV1({
      completionId: "completion:drifted-admission",
      admission: driftedAdmissionInput.admission,
      request: driftedAdmissionInput.request,
      measuredDrawContract: driftedAdmissionInput.measuredDrawContract,
      receipt: driftedAdmissionInput.receipt,
    })
    expect(driftedAdmission).toMatchObject({ status: "blocked", completion: null })
    expect(driftedAdmission.issues.map((item) => item.code)).toContain(
      "production-admission-content-mismatch",
    )

    const driftedReceiptInput = admission()
    driftedReceiptInput.receipt.artifact.byteLength += 1
    const driftedReceipt = createVNextPdfExportProductionRenderCompletionV1({
      completionId: "completion:drifted-receipt",
      admission: driftedReceiptInput.admission,
      request: driftedReceiptInput.request,
      measuredDrawContract: driftedReceiptInput.measuredDrawContract,
      receipt: driftedReceiptInput.receipt,
    })
    expect(driftedReceipt).toMatchObject({ status: "blocked", completion: null })
    expect(driftedReceipt.issues.map((item) => item.code)).toContain(
      "phase-t-receipt-content-mismatch",
    )

    const overflowInput = phaseT(7, 17_595)
    const overflowAdmission = createVNextPdfExportProductionAdmissionV1({
      admissionId: "admission:byte-overflow",
      request: overflowInput.request,
      currentSource: source(),
      measuredDrawContract: overflowInput.measuredDrawContract,
      policy: policy({
        resources: {
          ...policy().resources,
          maxOutputByteLength: 17_594,
        },
      }),
    })
    if (overflowAdmission.status !== "admitted") throw new Error("pre-render admission must defer bytes")
    const overflow = createVNextPdfExportProductionRenderCompletionV1({
      completionId: "completion:byte-overflow",
      admission: overflowAdmission.admission,
      ...overflowInput,
    })
    expect(overflow).toMatchObject({ status: "blocked", completion: null })
    expect(overflow.issues).toContainEqual(expect.objectContaining({
      code: "production-resource-limit-exceeded",
      path: "resources.actual.outputByteLength",
    }))
  })
})
