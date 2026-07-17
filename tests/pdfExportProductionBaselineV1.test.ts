import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextPdfExportHandoffV1,
  createVNextPdfExportProductionBaselineV1,
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
    documentId: "document:production-baseline",
    documentRevision: revision,
    documentFingerprint: `sha256:${revision.toString(16).padStart(64, "0")}`,
    sourcePackageId: "package:production-baseline",
    sessionId: null,
  }
}

function policy(overrides: Partial<VNextPdfExportProductionPolicyV1> = {}): VNextPdfExportProductionPolicyV1 {
  return {
    policyId: "pdf-production-baseline-v1",
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

function phaseT(revision = 7) {
  const measured = createVNextPdfMeasuredDrawContractV1(readJson<VNextPdfMeasuredDrawContractRequestV1>(
    "fixtures/pdf-pilot-thai-one-page-request.v1.json",
  ))
  const requestResult = createVNextPdfExportRequestV1({
    exportRequestId: `export:production-baseline:${revision}`,
    artifactId: `artifact:production-baseline:${revision}`,
    requestedAt: "2026-07-17T12:00:00.000Z",
    source: source(revision),
    measuredDrawContract: measured,
  })
  if (requestResult.status !== "ready") throw new Error(JSON.stringify(requestResult.issues))
  const handoff = createVNextPdfExportHandoffV1({
    request: requestResult.request,
    currentSource: source(revision),
    measuredDrawContract: measured,
  })
  const receiptResult = createVNextPdfExportReceiptV1({
    handoff,
    renderEvidence: {
      status: "rendered",
      artifactId: requestResult.request.artifactId,
      format: "pdf",
      mediaType: "application/pdf",
      byteLength: 17_594,
      sha256: "a".repeat(64),
      pageCount: requestResult.request.measuredDrawContract.pageCount,
      rendererProfileId: requestResult.request.measuredDrawContract.rendererProfileId,
      measurementProfileId: requestResult.request.measuredDrawContract.measurementProfileId,
      sourceContractFingerprint: requestResult.request.measuredDrawContract.fingerprint,
      sourceContractContentFingerprint: requestResult.request.measuredDrawContract.contentFingerprint,
    },
  })
  if (receiptResult.status !== "accepted") throw new Error(JSON.stringify(receiptResult.issues))
  return { request: requestResult.request, measuredDrawContract: measured, receipt: receiptResult.receipt }
}

describe("PDF export production baseline v1", () => {
  it("accepts a bounded policy while keeping production activation explicitly blocked", () => {
    const input = phaseT()
    const first = createVNextPdfExportProductionBaselineV1({
      baselineId: "baseline:thai-one-page:7",
      ...input,
      policy: policy(),
    })
    const second = createVNextPdfExportProductionBaselineV1({
      baselineId: "baseline:thai-one-page:7",
      ...input,
      policy: policy(),
    })

    expect(first).toMatchObject({
      status: "accepted",
      baseline: {
        source: "vnext-pdf-export-production-baseline",
        contractVersion: 1,
        kind: "pdf-export-production-baseline",
        exportIdentity: {
          exportRequestId: input.request.exportRequestId,
          artifactId: input.request.artifactId,
          requestFingerprint: input.request.requestFingerprint,
          receiptFingerprint: input.receipt.receiptFingerprint,
        },
        idempotency: {
          backendKeyRequired: true,
          scope: "source-revision-request-contract-and-policy",
          duplicateInFlight: "return-existing-operation",
          duplicateTerminal: "return-existing-receipt",
          conflictingPayload: "reject",
          stageKeysDerivedByBackend: true,
        },
        lifecycle: {
          maxAttempts: 2,
          executionDeadlineMs: 120000,
          cancellationCheckpoints: ["before-handoff", "before-render", "before-persist"],
          midRenderCancellationRequired: true,
          drainPolicy: "reject-new-then-finish-or-cancel-in-flight",
          automaticLoop: false,
        },
        resources: {
          actual: {
            pageCount: 1,
            paintCommandCount: 4,
            glyphCount: 54,
            fontAssetCount: 1,
            imageAssetCount: 0,
            outputByteLength: 17594,
          },
          allWithinLimits: true,
          postRenderByteLimitRequired: true,
        },
        storage: {
          projectionTargets: ["artifact-manifest", "artifact-job"],
          commitOrder: [
            "write-content-addressed-bytes",
            "verify-byte-length-and-sha256",
            "compare-and-swap-artifact-manifest",
            "compare-and-swap-artifact-job",
          ],
          metadataBeforeBytes: false,
          writesExecuted: false,
        },
        observability: {
          sourceTextAllowed: false,
          pdfBytesAllowed: false,
          sinkBound: false,
        },
        activation: {
          status: "blocked",
          satisfiedBindings: [],
          productionBinding: false,
        },
        contracts: {
          baselineOnly: true,
          revalidatesPhaseTReceipt: true,
          backendOwnsRuntimePolicy: true,
          workerExecution: false,
          storageWrites: false,
          backendRoute: false,
          productionBinding: false,
        },
      },
      issues: [],
    })
    if (first.status !== "accepted" || second.status !== "accepted") throw new Error("baseline must pass")
    expect(first.baseline.activation.requiredBindings).toEqual(expect.arrayContaining([
      "backend-idempotency-binding",
      "cooperative-cancellation",
      "worker-lifecycle-binding",
      "durable-byte-storage",
      "observability-sink",
      "authorization-and-tenancy",
      "production-renderer-profile-promotion",
    ]))
    expect(first.baseline.idempotency.payloadFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(first.baseline.baselineFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(second.baseline).toEqual(first.baseline)
    expect(JSON.stringify(first.baseline)).not.toContain("สรุปผล OCR ภาษาไทย")

    ;(first.baseline.activation.requiredBindings as unknown as string[]).push("mutated-binding")
    const rebuilt = createVNextPdfExportProductionBaselineV1({
      baselineId: "baseline:thai-one-page:7",
      ...input,
      policy: policy(),
    })
    if (rebuilt.status !== "accepted") throw new Error("rebuilt baseline must pass")
    expect(rebuilt.baseline.activation.requiredBindings).toHaveLength(10)
  })

  it("changes the idempotency payload identity when the exact source request changes", () => {
    const firstInput = phaseT(7)
    const secondInput = phaseT(8)
    const first = createVNextPdfExportProductionBaselineV1({
      baselineId: "baseline:7",
      ...firstInput,
      policy: policy(),
    })
    const second = createVNextPdfExportProductionBaselineV1({
      baselineId: "baseline:8",
      ...secondInput,
      policy: policy(),
    })
    if (first.status !== "accepted" || second.status !== "accepted") throw new Error("baselines must pass")
    expect(second.baseline.idempotency.payloadFingerprint).not.toBe(first.baseline.idempotency.payloadFingerprint)

    const changedPolicy = createVNextPdfExportProductionBaselineV1({
      baselineId: "baseline:7-policy-2",
      ...firstInput,
      policy: policy({ executionDeadlineMs: 180_000 }),
    })
    if (changedPolicy.status !== "accepted") throw new Error("changed policy baseline must pass")
    expect(changedPolicy.baseline.idempotency.payloadFingerprint).not.toBe(first.baseline.idempotency.payloadFingerprint)
  })

  it("fails closed when measured or rendered resource facts exceed policy", () => {
    const input = phaseT()
    const result = createVNextPdfExportProductionBaselineV1({
      baselineId: "baseline:too-small",
      ...input,
      policy: policy({
        resources: {
          maxPageCount: 1,
          maxPaintCommandCount: 3,
          maxGlyphCount: 53,
          maxFontAssetCount: 1,
          maxImageAssetCount: 0,
          maxSingleImagePixelCount: 1,
          maxTotalImagePixelCount: 1,
          maxOutputByteLength: 17_593,
        },
      }),
    })

    expect(result).toMatchObject({ status: "blocked", baseline: null })
    expect(result.issues.filter((item) => item.code === "production-resource-limit-exceeded").map((item) => item.path)).toEqual([
      "resources.actual.paintCommandCount",
      "resources.actual.glyphCount",
      "resources.actual.outputByteLength",
    ])
  })

  it("blocks unbounded policy values and changed Phase T receipt identity", () => {
    const invalidPolicyInput = phaseT()
    const invalidPolicy = createVNextPdfExportProductionBaselineV1({
      baselineId: " ",
      ...invalidPolicyInput,
      policy: policy({
        policyId: " ",
        maxAttempts: 6,
        executionDeadlineMs: 900_001,
      }),
    })
    expect(invalidPolicy.status).toBe("blocked")
    expect(invalidPolicy.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "production-baseline-id-invalid",
      "production-policy-id-invalid",
      "production-policy-limit-invalid",
    ]))

    const receiptInput = phaseT()
    receiptInput.receipt.artifact.byteLength += 1
    const changedReceipt = createVNextPdfExportProductionBaselineV1({
      baselineId: "baseline:changed-receipt",
      ...receiptInput,
      policy: policy(),
    })
    expect(changedReceipt).toMatchObject({ status: "blocked", baseline: null })
    expect(changedReceipt.issues.map((item) => item.code)).toContain("phase-t-receipt-content-mismatch")

    const receiptMetadataInput = phaseT()
    receiptMetadataInput.receipt.requestFingerprint = `sha256:${"b".repeat(64)}`
    const changedReceiptMetadata = createVNextPdfExportProductionBaselineV1({
      baselineId: "baseline:changed-receipt-metadata",
      ...receiptMetadataInput,
      policy: policy(),
    })
    expect(changedReceiptMetadata).toMatchObject({ status: "blocked", baseline: null })
    expect(changedReceiptMetadata.issues.map((item) => item.code)).toContain("phase-t-receipt-content-mismatch")
  })

  it("blocks measured-contract content drift before calculating a baseline", () => {
    const input = phaseT()
    if (input.measuredDrawContract.status !== "consumable") throw new Error("expected consumable contract")
    input.measuredDrawContract.pages[0].commands[0].paintOrder = 99
    const result = createVNextPdfExportProductionBaselineV1({
      baselineId: "baseline:contract-drift",
      ...input,
      policy: policy(),
    })
    expect(result).toMatchObject({ status: "blocked", baseline: null })
    expect(result.issues.map((item) => item.code)).toContain("phase-t-handoff-invalid")
  })

  it("retains canonical budget evidence and keeps Core free of backend execution", () => {
    const evidence = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-production-baseline.v1.json",
    )
    const source = readFileSync(resolve(
      process.cwd(),
      "src/generation/pdfExportProductionBaselineV1.ts",
    ), "utf8")

    expect(evidence).toMatchObject({
      evidenceVersion: 1,
      phaseId: "PDF-EXPORT-U",
      status: "accepted",
      phaseTIdentity: {
        artifactSha256: "c4d09f0dfd66e1e3983bc679602fdc7d397de30edcb4f93fac3a0fa0c422960b",
        deterministicBytes: true,
      },
      baseline: {
        resources: {
          actual: {
            pageCount: 13,
            paintCommandCount: 1814,
            glyphCount: 15732,
            fontAssetCount: 2,
            imageAssetCount: 5,
            maxSingleImagePixelCount: 2130048,
            totalImagePixelCount: 9150048,
            outputByteLength: 1212656,
          },
          allWithinLimits: true,
        },
        activation: { status: "blocked", productionBinding: false },
        contracts: {
          workerExecution: false,
          deadlineExecution: false,
          cancellationExecution: false,
          storageWrites: false,
          backendRoute: false,
          productionBinding: false,
        },
      },
      activationDecision: {
        status: "blocked",
        blockerCount: 10,
        productionBinding: false,
      },
      executionBoundary: {
        pdfRenderedInThisPhase: false,
        evidenceFixtureWriteOnly: true,
      },
    })
    expect(evidence.baseline.idempotency.payloadFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(evidence.baseline.baselineFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(source).not.toMatch(/node:fs|node:http|worker_threads|setTimeout|setInterval|fetch\(|@flowdoc\/internal-alpha-runner|@flowdoc\/pdf-renderer-pilot/u)
  })
})
