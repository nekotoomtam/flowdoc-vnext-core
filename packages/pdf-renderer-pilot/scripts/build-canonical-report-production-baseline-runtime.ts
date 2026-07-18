import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import {
  createVNextPdfExportProductionBaselineV1,
  type VNextPdfExportProductionPolicyV1,
  type VNextPdfExportReceiptV1,
  type VNextPdfExportRequestV1,
} from "@flowdoc/vnext-core"
import type { FlowDocCanonicalReportBodyDisplayListBundleV1 } from "../src/full.js"

interface PhaseTExportEvidence {
  phaseId: "PDF-EXPORT-T"
  status: "rendered"
  request: VNextPdfExportRequestV1
  receipt: VNextPdfExportReceiptV1
  deterministicRebuild: {
    unchanged: true
    sha256: string
    receiptFingerprint: string
  }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

export function buildCanonicalReportProductionBaseline(): { evidencePath: string } {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const body = readJson<FlowDocCanonicalReportBodyDisplayListBundleV1>(resolve(
    repoRoot,
    "fixtures/pdf-pilot-canonical-report-body-display-list.v1.json",
  ))
  const phaseT = readJson<PhaseTExportEvidence>(resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-real-export-handoff.v1.json",
  ))
  const policy: VNextPdfExportProductionPolicyV1 = {
    policyId: "canonical-pdf-production-baseline-v1",
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
  }
  const result = createVNextPdfExportProductionBaselineV1({
    baselineId: "baseline:ocr-benchmark:inv_9437125258:revision-1",
    request: phaseT.request,
    measuredDrawContract: body.rendererHandoff.measuredDrawContract,
    receipt: phaseT.receipt,
    policy,
  })
  if (result.status !== "accepted") {
    throw new Error(`PDF production baseline blocked: ${JSON.stringify(result.issues)}`)
  }

  const evidencePath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-production-baseline.v1.json",
  )
  mkdirSync(dirname(evidencePath), { recursive: true })
  writeFileSync(evidencePath, `${JSON.stringify({
    evidenceVersion: 1,
    phaseId: "PDF-EXPORT-U",
    status: result.status,
    phaseTIdentity: {
      phaseId: phaseT.phaseId,
      requestFingerprint: phaseT.request.requestFingerprint,
      receiptFingerprint: phaseT.receipt.receiptFingerprint,
      artifactSha256: phaseT.receipt.artifact.sha256,
      deterministicBytes: phaseT.deterministicRebuild.unchanged,
    },
    baseline: result.baseline,
    activationDecision: {
      status: result.baseline.activation.status,
      productionBinding: result.baseline.activation.productionBinding,
      blockerCount: result.baseline.activation.requiredBindings.length,
      blockers: result.baseline.activation.requiredBindings,
      reason: "baseline-and-resource-envelope-accepted-but-runtime-bindings-are-not-proven",
    },
    ownership: {
      core: "identity-resource-and-readiness-facts",
      backend: "idempotency-deadline-cancellation-worker-storage-observability-authz",
      renderer: "bounded-byte-execution-and-production-profile-qualification",
    },
    executionBoundary: {
      pdfRenderedInThisPhase: false,
      workerExecution: false,
      storageWrites: false,
      manifestOrJobMutation: false,
      backendRoute: false,
      productionActivation: false,
      evidenceFixtureWriteOnly: true,
    },
    nextDecision: "review-cross-repo-production-binding-order-before-PDF-EXPORT-V",
  }, null, 2)}\n`, "utf8")
  return { evidencePath }
}
