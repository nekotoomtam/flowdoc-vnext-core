import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextPdfExportHandoffV1,
  createVNextPdfExportReceiptV1,
  createVNextPdfExportRequestV1,
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfExportRenderEvidenceV1,
  type VNextPdfExportSourceIdentityV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../src/index.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function contract() {
  return createVNextPdfMeasuredDrawContractV1(readJson<VNextPdfMeasuredDrawContractRequestV1>(
    "fixtures/pdf-pilot-thai-one-page-request.v1.json",
  ))
}

function source(overrides: Partial<VNextPdfExportSourceIdentityV1> = {}): VNextPdfExportSourceIdentityV1 {
  return {
    documentId: "document:thai-one-page",
    documentRevision: 7,
    documentFingerprint: `sha256:${"1".repeat(64)}`,
    sourcePackageId: "package:thai-one-page",
    sessionId: null,
    ...overrides,
  }
}

function readyRequest() {
  const measured = contract()
  const result = createVNextPdfExportRequestV1({
    exportRequestId: "export-request:thai-one-page",
    artifactId: "artifact:thai-one-page",
    requestedAt: "2026-07-17T14:00:00.000Z",
    source: source(),
    measuredDrawContract: measured,
  })
  if (result.status !== "ready") throw new Error(JSON.stringify(result.issues))
  return { measured, request: result.request }
}

function renderedEvidence(
  input: ReturnType<typeof readyRequest>,
  overrides: Partial<Extract<VNextPdfExportRenderEvidenceV1, { status: "rendered" }>> = {},
): Extract<VNextPdfExportRenderEvidenceV1, { status: "rendered" }> {
  return {
    status: "rendered",
    artifactId: input.request.artifactId,
    format: "pdf",
    mediaType: "application/pdf",
    byteLength: 1234,
    sha256: "a".repeat(64),
    pageCount: input.request.measuredDrawContract.pageCount,
    rendererProfileId: input.request.measuredDrawContract.rendererProfileId,
    measurementProfileId: input.request.measuredDrawContract.measurementProfileId,
    sourceContractFingerprint: input.request.measuredDrawContract.fingerprint,
    sourceContractContentFingerprint: input.request.measuredDrawContract.contentFingerprint,
    ...overrides,
  }
}

describe("PDF export handoff v1", () => {
  it("pins source revision and exact measured contract content in a deterministic request", () => {
    const first = readyRequest()
    const second = readyRequest()

    expect(first.request).toEqual(second.request)
    expect(first.request).toMatchObject({
      source: "vnext-pdf-export-handoff",
      contractVersion: 1,
      kind: "pdf-export-request",
      expectedSource: source(),
      measuredDrawContract: {
        fingerprint: first.measured.status === "consumable" ? first.measured.fingerprint : null,
        rendererProfileId: first.request.measuredDrawContract.rendererProfileId,
        pageCount: 1,
      },
      output: { format: "pdf", mediaType: "application/pdf" },
      constraints: {
        consumesMeasuredDrawContract: true,
        mayRemeasure: false,
        mayRepaginate: false,
        mayRelayout: false,
        mayRegroupSemantics: false,
        productionBinding: false,
      },
    })
    expect(first.request.measuredDrawContract.contentFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(first.request.requestFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
  })

  it("hands the exact consumable contract to a renderer without executing or writing", () => {
    const input = readyRequest()
    const before = JSON.stringify(input)
    const result = createVNextPdfExportHandoffV1({
      request: input.request,
      currentSource: source(),
      measuredDrawContract: input.measured,
    })

    expect(result).toMatchObject({
      status: "ready",
      rendererInput: {
        exportRequestId: input.request.exportRequestId,
        artifactId: input.request.artifactId,
        sourceContractFingerprint: input.request.measuredDrawContract.fingerprint,
        sourceContractContentFingerprint: input.request.measuredDrawContract.contentFingerprint,
      },
      contracts: {
        consumes: "vnext-pdf-measured-draw-contract-v1",
        sourceRevisionPinned: true,
        contractContentPinned: true,
        mayRemeasure: false,
        mayRepaginate: false,
        mayRelayout: false,
        mayRegroupSemantics: false,
      },
      execution: {
        rendererExecution: false,
        pdfBytesProduced: false,
        fileWrites: false,
        storageWrites: false,
        backendRoute: false,
        workerOrQueue: false,
        productionBinding: false,
      },
      issues: [],
    })
    if (result.status !== "ready") throw new Error(JSON.stringify(result.issues))
    expect(result.rendererInput.measuredDrawContract).toBe(input.measured)
    expect(result.handoffFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(JSON.stringify(input)).toBe(before)
  })

  it("accepts matching renderer evidence as a metadata-only receipt", () => {
    const input = readyRequest()
    const handoff = createVNextPdfExportHandoffV1({
      request: input.request,
      currentSource: source(),
      measuredDrawContract: input.measured,
    })
    const result = createVNextPdfExportReceiptV1({
      handoff,
      renderEvidence: renderedEvidence(input),
    })

    expect(result).toMatchObject({
      status: "accepted",
      receipt: {
        status: "rendered",
        exportRequestId: input.request.exportRequestId,
        sourceIdentity: source(),
        artifact: {
          artifactId: input.request.artifactId,
          byteLength: 1234,
          sha256: "a".repeat(64),
          pageCount: 1,
          storageStatus: "not-stored",
          storageKey: null,
        },
        contracts: {
          mayRelayout: false,
          carriesBytes: false,
          storageWrites: false,
          artifactManifestProjection: "pending-storage-binding",
          productionBinding: false,
        },
      },
      issues: [],
    })
    if (result.status !== "accepted") throw new Error(JSON.stringify(result.issues))
    expect(result.receipt).not.toHaveProperty("bytes")
    expect(result.receipt.receiptFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
  })

  it("fails closed on stale source, request tampering, and in-memory contract drift", () => {
    const stale = readyRequest()
    const staleResult = createVNextPdfExportHandoffV1({
      request: stale.request,
      currentSource: source({ documentRevision: 8 }),
      measuredDrawContract: stale.measured,
    })
    expect(staleResult.status).toBe("blocked")
    expect(staleResult.issues.map((item) => item.code)).toContain("source-revision-drift")

    const tampered = readyRequest()
    tampered.request.artifactId = "artifact:tampered"
    const tamperedResult = createVNextPdfExportHandoffV1({
      request: tampered.request,
      currentSource: source(),
      measuredDrawContract: tampered.measured,
    })
    expect(tamperedResult.status).toBe("blocked")
    expect(tamperedResult.issues.map((item) => item.code)).toContain("export-request-fingerprint-mismatch")

    const content = readyRequest()
    if (content.measured.status !== "consumable") throw new Error("expected consumable contract")
    content.measured.pages[0].commands[0].paintOrder = 99
    const contentResult = createVNextPdfExportHandoffV1({
      request: content.request,
      currentSource: source(),
      measuredDrawContract: content.measured,
    })
    expect(contentResult.status).toBe("blocked")
    expect(contentResult.issues.map((item) => item.code)).toContain("measured-contract-content-mismatch")
  })

  it("blocks malformed requests, blocked renderer evidence, and receipt identity drift", () => {
    const blockedContract = contract()
    if (blockedContract.status !== "consumable") throw new Error("expected consumable contract")
    const blockedRequest = createVNextPdfExportRequestV1({
      exportRequestId: "",
      artifactId: "",
      requestedAt: "not-a-date",
      source: source({ sourcePackageId: null }),
      measuredDrawContract: { ...blockedContract, status: "blocked", pages: null, fontAssets: null, imageAssets: null, fingerprint: null, summary: null, issues: [] },
    })
    expect(blockedRequest.status).toBe("blocked")
    expect(blockedRequest.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "export-request-id-invalid",
      "artifact-id-invalid",
      "requested-at-invalid",
      "source-owner-missing",
      "measured-contract-blocked",
    ]))

    const input = readyRequest()
    const handoff = createVNextPdfExportHandoffV1({
      request: input.request,
      currentSource: source(),
      measuredDrawContract: input.measured,
    })
    const rendererBlocked = createVNextPdfExportReceiptV1({
      handoff,
      renderEvidence: {
        status: "blocked",
        issues: [{ code: "font-missing", path: "fontResources", message: "font bytes are missing" }],
      },
    })
    expect(rendererBlocked).toMatchObject({
      status: "blocked",
      receipt: null,
      issues: [expect.objectContaining({ code: "renderer-blocked" })],
    })

    const drifted = createVNextPdfExportReceiptV1({
      handoff,
      renderEvidence: renderedEvidence(input, {
        artifactId: "artifact:wrong",
        byteLength: 0,
        sha256: "INVALID",
        pageCount: 2,
        rendererProfileId: "renderer:wrong",
        measurementProfileId: "measurement:wrong",
        sourceContractFingerprint: `sha256:${"2".repeat(64)}`,
        sourceContractContentFingerprint: `sha256:${"3".repeat(64)}`,
      }),
    })
    expect(drifted.status).toBe("blocked")
    expect(drifted.issues.map((item) => item.code)).toEqual(expect.arrayContaining([
      "artifact-id-mismatch",
      "artifact-byte-length-invalid",
      "artifact-sha256-invalid",
      "artifact-page-count-mismatch",
      "artifact-renderer-profile-mismatch",
      "artifact-measurement-profile-mismatch",
      "artifact-contract-fingerprint-mismatch",
      "artifact-contract-content-mismatch",
    ]))

    if (handoff.status !== "ready") throw new Error("expected ready handoff")
    handoff.rendererInput.artifactId = "artifact:mutated-after-handoff"
    const mutatedHandoff = createVNextPdfExportReceiptV1({
      handoff,
      renderEvidence: renderedEvidence(input),
    })
    expect(mutatedHandoff).toMatchObject({ status: "blocked", receipt: null })
    expect(mutatedHandoff.issues.map((item) => item.code)).toContain("export-handoff-identity-mismatch")
  })
})
