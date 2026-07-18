import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  createVNextPdfExportRequestV1,
  createVNextPdfMeasuredDrawContractV1,
  type VNextPdfExportSourceIdentityV1,
  type VNextPdfMeasuredDrawContractRequestV1,
} from "../src/index.js"
import {
  executeFlowDocPdfExportHandoffV1,
  type FlowDocPdfRendererPilotFontResource,
} from "../packages/pdf-renderer-pilot/src/full.js"

interface SubsetManifest {
  subsetId: string
  fontId: string
  postScriptName: string
  subsetPrefix: string
  source: { path: string }
  subset: { path: string; sha256: string }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as T
}

function measuredContract() {
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

function fontResource(): FlowDocPdfRendererPilotFontResource {
  const manifest = readJson<SubsetManifest>(
    "packages/pdf-renderer-pilot/fixtures/font-subset-manifest.v1.json",
  )
  return {
    fontId: manifest.fontId,
    subsetId: manifest.subsetId,
    subsetPrefix: manifest.subsetPrefix,
    postScriptName: manifest.postScriptName,
    subsetSha256: manifest.subset.sha256,
    sourceBytes: readFileSync(resolve(process.cwd(), manifest.source.path)),
    subsetBytes: readFileSync(resolve(process.cwd(), manifest.subset.path)),
  }
}

function readyRequest() {
  const measured = measuredContract()
  const result = createVNextPdfExportRequestV1({
    exportRequestId: "export:thai-one-page:7",
    artifactId: "artifact:thai-one-page:7",
    requestedAt: "2026-07-17T12:00:00.000Z",
    source: source(),
    measuredDrawContract: measured,
  })
  if (result.status !== "ready") throw new Error(JSON.stringify(result.issues))
  return { request: result.request, measured }
}

describe("Phase T real PDF export handoff", () => {
  it("returns actual deterministic PDF bytes only after the Core receipt accepts every identity pin", () => {
    const input = readyRequest()
    const first = executeFlowDocPdfExportHandoffV1({
      request: input.request,
      currentSource: source(),
      measuredDrawContract: input.measured,
      fontResources: [fontResource()],
      rendererMode: "thai-one-page",
    })
    const second = executeFlowDocPdfExportHandoffV1({
      request: input.request,
      currentSource: source(),
      measuredDrawContract: input.measured,
      fontResources: [fontResource()],
      rendererMode: "thai-one-page",
    })

    expect(first).toMatchObject({
      source: "flowdoc-pdf-export-execution",
      contractVersion: 1,
      status: "rendered",
      rendererExecuted: true,
      handoff: { status: "ready" },
      renderer: {
        status: "rendered",
        artifact: { artifactId: input.request.artifactId, storageStatus: "not-stored" },
      },
      receipt: {
        status: "rendered",
        artifact: {
          artifactId: input.request.artifactId,
          storageStatus: "not-stored",
          storageKey: null,
        },
        contracts: {
          carriesBytes: false,
          storageWrites: false,
          productionBinding: false,
        },
      },
      contracts: {
        consumesCoreHandoff: true,
        returnsCoreReceipt: true,
        mayRemeasure: false,
        mayRepaginate: false,
        mayRelayout: false,
        mayRegroupSemantics: false,
        fileWrites: false,
        storageWrites: false,
        backendRoute: false,
        workerOrQueue: false,
        productionBinding: false,
      },
      issues: [],
    })
    if (first.status !== "rendered" || second.status !== "rendered") throw new Error("export must render")
    expect(Buffer.from(first.bytes).subarray(0, 8).toString("ascii")).toBe("%PDF-1.7")
    expect(first.receipt.artifact.byteLength).toBe(first.bytes.byteLength)
    expect(first.receipt.artifact.sha256).toBe(createHash("sha256").update(first.bytes).digest("hex"))
    expect(first.receipt).not.toHaveProperty("bytes")
    expect(second.bytes).toEqual(first.bytes)
    expect(second.receipt).toEqual(first.receipt)
  })

  it("blocks stale source identity before the renderer can execute", () => {
    const input = readyRequest()
    const result = executeFlowDocPdfExportHandoffV1({
      request: input.request,
      currentSource: source({ documentRevision: 8 }),
      measuredDrawContract: input.measured,
      fontResources: [fontResource()],
      rendererMode: "thai-one-page",
    })

    expect(result).toMatchObject({
      status: "blocked",
      rendererExecuted: false,
      renderer: { status: "not-run", artifact: null },
      receipt: null,
      bytes: null,
    })
    expect(result.issues.map((item) => item.code)).toContain("source-revision-drift")
  })

  it("discards renderer output when resources are incomplete and never creates a partial receipt", () => {
    const input = readyRequest()
    const result = executeFlowDocPdfExportHandoffV1({
      request: input.request,
      currentSource: source(),
      measuredDrawContract: input.measured,
      fontResources: [],
      rendererMode: "thai-one-page",
    })

    expect(result).toMatchObject({
      status: "blocked",
      rendererExecuted: true,
      handoff: { status: "ready" },
      renderer: { status: "blocked", artifact: null },
      receipt: null,
      bytes: null,
    })
    expect(result.issues.map((item) => item.code)).toContain("renderer-blocked")
  })

  it("retains canonical revision, contract, renderer, byte, and receipt evidence", () => {
    const evidence = readJson<any>(
      "packages/pdf-renderer-pilot/fixtures/canonical-report-real-export-handoff.v1.json",
    )

    expect(evidence).toMatchObject({
      evidenceVersion: 1,
      phaseId: "PDF-EXPORT-T",
      status: "rendered",
      sourceIdentity: {
        documentId: "instance-ocr-benchmark-inv_9437125258-2026-07-16",
        documentRevision: 1,
        documentFingerprint: "sha256:96c48b7287fc0c5532059cf8ad4ff135df5f07fb63bfe6bf6054e150775a8b67",
      },
      request: {
        measuredDrawContract: {
          fingerprint: "sha256:020881c6099d8eec5e73d5558efa0c0d65de67599aa99e82f8cbf9d62e4e6917",
          contentFingerprint: "sha256:5f28958947715a3a9bdc006a73688bf8226f782047db5f5c53ffe0349dbd8b78",
          rendererProfileId: "pdf-pilot-08b-r2c-l-full-document-v1",
          pageCount: 13,
        },
      },
      renderer: {
        status: "rendered",
        artifact: {
          byteLength: 1212656,
          sha256: "c4d09f0dfd66e1e3983bc679602fdc7d397de30edcb4f93fac3a0fa0c422960b",
          storageStatus: "not-stored",
        },
      },
      receipt: {
        status: "rendered",
        artifact: {
          pageCount: 13,
          byteLength: 1212656,
          sha256: "c4d09f0dfd66e1e3983bc679602fdc7d397de30edcb4f93fac3a0fa0c422960b",
          storageStatus: "not-stored",
          storageKey: null,
        },
      },
      deterministicRebuild: { unchanged: true },
      executionBoundary: {
        actualPdfBytesReturned: true,
        pdfBytesRetainedInEvidence: false,
        backendRoute: false,
        workerOrQueue: false,
        productionBinding: false,
      },
      nextPhase: "PDF-EXPORT-U production-hardening baseline",
    })
    expect(evidence.receipt).not.toHaveProperty("bytes")
  })
})
