import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type { VNextPdfMeasuredDrawContractResultV1 } from "../renderer/pdfMeasuredDrawContractV1.js"

export const VNEXT_PDF_EXPORT_HANDOFF_V1_SOURCE = "vnext-pdf-export-handoff" as const
export const VNEXT_PDF_EXPORT_HANDOFF_V1_VERSION = 1 as const

const SHA256 = /^sha256:[a-f0-9]{64}$/u
const BARE_SHA256 = /^[a-f0-9]{64}$/u

export interface VNextPdfExportSourceIdentityV1 {
  documentId: string
  documentRevision: number
  documentFingerprint: string
  sourcePackageId: string | null
  sessionId: string | null
}

export interface VNextPdfExportRequestV1 {
  source: typeof VNEXT_PDF_EXPORT_HANDOFF_V1_SOURCE
  contractVersion: typeof VNEXT_PDF_EXPORT_HANDOFF_V1_VERSION
  kind: "pdf-export-request"
  exportRequestId: string
  artifactId: string
  requestedAt: string
  expectedSource: VNextPdfExportSourceIdentityV1
  measuredDrawContract: {
    source: "vnext-pdf-measured-draw-contract"
    contractVersion: 1
    fingerprint: string
    contentFingerprint: string
    rendererProfileId: string
    measurementProfileId: string
    pageCount: number
  }
  output: {
    format: "pdf"
    mediaType: "application/pdf"
  }
  constraints: {
    consumesMeasuredDrawContract: true
    mayRemeasure: false
    mayRepaginate: false
    mayRelayout: false
    mayRegroupSemantics: false
    productionBinding: false
  }
  requestFingerprint: string
}

export interface VNextPdfExportIssueV1 {
  severity: "error"
  code: string
  path: string
  message: string
}

export type VNextPdfExportRequestResultV1 =
  | {
      status: "ready"
      request: VNextPdfExportRequestV1
      issues: []
    }
  | {
      status: "blocked"
      request: null
      issues: VNextPdfExportIssueV1[]
    }

export interface VNextPdfExportRendererInputV1 {
  exportRequestId: string
  artifactId: string
  measuredDrawContract: Extract<VNextPdfMeasuredDrawContractResultV1, { status: "consumable" }>
  sourceContractFingerprint: string
  sourceContractContentFingerprint: string
}

interface VNextPdfExportHandoffContractsV1 {
  consumes: "vnext-pdf-measured-draw-contract-v1"
  sourceRevisionPinned: true
  sourceFingerprintPinned: true
  rendererProfilePinned: true
  measurementProfilePinned: true
  contractContentPinned: true
  mayRemeasure: false
  mayRepaginate: false
  mayRelayout: false
  mayRegroupSemantics: false
}

interface VNextPdfExportHandoffExecutionV1 {
  rendererExecution: false
  pdfBytesProduced: false
  fileWrites: false
  storageWrites: false
  backendRoute: false
  workerOrQueue: false
  productionBinding: false
}

export type VNextPdfExportHandoffResultV1 =
  | {
      source: typeof VNEXT_PDF_EXPORT_HANDOFF_V1_SOURCE
      contractVersion: typeof VNEXT_PDF_EXPORT_HANDOFF_V1_VERSION
      kind: "pdf-export-handoff"
      status: "ready"
      request: VNextPdfExportRequestV1
      currentSource: VNextPdfExportSourceIdentityV1
      rendererInput: VNextPdfExportRendererInputV1
      handoffFingerprint: string
      contracts: VNextPdfExportHandoffContractsV1
      execution: VNextPdfExportHandoffExecutionV1
      issues: []
    }
  | {
      source: typeof VNEXT_PDF_EXPORT_HANDOFF_V1_SOURCE
      contractVersion: typeof VNEXT_PDF_EXPORT_HANDOFF_V1_VERSION
      kind: "pdf-export-handoff"
      status: "blocked"
      request: VNextPdfExportRequestV1
      currentSource: VNextPdfExportSourceIdentityV1
      rendererInput: null
      handoffFingerprint: null
      contracts: VNextPdfExportHandoffContractsV1
      execution: VNextPdfExportHandoffExecutionV1
      issues: VNextPdfExportIssueV1[]
    }

export type VNextPdfExportRenderEvidenceV1 =
  | {
      status: "rendered"
      artifactId: string
      format: "pdf"
      mediaType: "application/pdf"
      byteLength: number
      sha256: string
      pageCount: number
      rendererProfileId: string
      measurementProfileId: string
      sourceContractFingerprint: string
      sourceContractContentFingerprint: string
    }
  | {
      status: "blocked"
      issues: Array<{
        code: string
        path: string
        message: string
      }>
    }

export interface VNextPdfExportReceiptV1 {
  source: typeof VNEXT_PDF_EXPORT_HANDOFF_V1_SOURCE
  contractVersion: typeof VNEXT_PDF_EXPORT_HANDOFF_V1_VERSION
  kind: "pdf-export-receipt"
  status: "rendered"
  exportRequestId: string
  requestFingerprint: string
  handoffFingerprint: string
  sourceIdentity: VNextPdfExportSourceIdentityV1
  artifact: {
    artifactId: string
    format: "pdf"
    mediaType: "application/pdf"
    byteLength: number
    sha256: string
    pageCount: number
    storageStatus: "not-stored"
    storageKey: null
  }
  rendererProfileId: string
  measurementProfileId: string
  sourceContractFingerprint: string
  sourceContractContentFingerprint: string
  contracts: {
    mayRelayout: false
    carriesBytes: false
    storageWrites: false
    artifactManifestProjection: "pending-storage-binding"
    productionBinding: false
  }
  receiptFingerprint: string
}

export type VNextPdfExportReceiptResultV1 =
  | {
      status: "accepted"
      receipt: VNextPdfExportReceiptV1
      issues: []
    }
  | {
      status: "blocked"
      receipt: null
      issues: VNextPdfExportIssueV1[]
    }

function issue(code: string, path: string, message: string): VNextPdfExportIssueV1 {
  return { severity: "error", code, path, message }
}

function nonBlank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function validDate(value: unknown): value is string {
  return nonBlank(value) && !Number.isNaN(Date.parse(value))
}

function sameSourceIdentity(
  left: VNextPdfExportSourceIdentityV1,
  right: VNextPdfExportSourceIdentityV1,
): boolean {
  return left.documentId === right.documentId
    && left.documentRevision === right.documentRevision
    && left.documentFingerprint === right.documentFingerprint
    && left.sourcePackageId === right.sourcePackageId
    && left.sessionId === right.sessionId
}

function contractContentFingerprint(contract: VNextPdfMeasuredDrawContractResultV1): string {
  return createVNextCompactFingerprint(JSON.stringify(contract))
}

function requestFacts(request: Omit<VNextPdfExportRequestV1, "requestFingerprint">) {
  return request
}

function requestFingerprint(request: Omit<VNextPdfExportRequestV1, "requestFingerprint">): string {
  return createVNextCompactFingerprint(JSON.stringify(requestFacts(request)))
}

function handoffContracts(): VNextPdfExportHandoffContractsV1 {
  return {
    consumes: "vnext-pdf-measured-draw-contract-v1",
    sourceRevisionPinned: true,
    sourceFingerprintPinned: true,
    rendererProfilePinned: true,
    measurementProfilePinned: true,
    contractContentPinned: true,
    mayRemeasure: false,
    mayRepaginate: false,
    mayRelayout: false,
    mayRegroupSemantics: false,
  }
}

function handoffExecution(): VNextPdfExportHandoffExecutionV1 {
  return {
    rendererExecution: false,
    pdfBytesProduced: false,
    fileWrites: false,
    storageWrites: false,
    backendRoute: false,
    workerOrQueue: false,
    productionBinding: false,
  }
}

function validateSourceIdentity(
  source: VNextPdfExportSourceIdentityV1,
  path: string,
  issues: VNextPdfExportIssueV1[],
): void {
  if (!nonBlank(source.documentId)) {
    issues.push(issue("source-document-id-invalid", `${path}.documentId`, "documentId must be nonblank"))
  }
  if (!Number.isInteger(source.documentRevision) || source.documentRevision < 0) {
    issues.push(issue(
      "source-document-revision-invalid",
      `${path}.documentRevision`,
      "documentRevision must be a nonnegative integer",
    ))
  }
  if (!nonBlank(source.documentFingerprint)) {
    issues.push(issue(
      "source-document-fingerprint-invalid",
      `${path}.documentFingerprint`,
      "documentFingerprint must be nonblank",
    ))
  }
  if (source.sourcePackageId != null && !nonBlank(source.sourcePackageId)) {
    issues.push(issue(
      "source-package-id-invalid",
      `${path}.sourcePackageId`,
      "sourcePackageId must be null or nonblank",
    ))
  }
  if (source.sessionId != null && !nonBlank(source.sessionId)) {
    issues.push(issue("source-session-id-invalid", `${path}.sessionId`, "sessionId must be null or nonblank"))
  }
  if (source.sourcePackageId == null && source.sessionId == null) {
    issues.push(issue(
      "source-owner-missing",
      path,
      "sourcePackageId or sessionId must identify the export source owner",
    ))
  }
}

function validateRequestContract(
  request: VNextPdfExportRequestV1,
  issues: VNextPdfExportIssueV1[],
): void {
  if (!nonBlank(request.exportRequestId)) {
    issues.push(issue("export-request-id-invalid", "request.exportRequestId", "exportRequestId must be nonblank"))
  }
  if (!nonBlank(request.artifactId)) {
    issues.push(issue("artifact-id-invalid", "request.artifactId", "artifactId must be nonblank"))
  }
  if (!validDate(request.requestedAt)) {
    issues.push(issue("requested-at-invalid", "request.requestedAt", "requestedAt must be a parseable date"))
  }
  if (request.measuredDrawContract.source !== "vnext-pdf-measured-draw-contract"
    || request.measuredDrawContract.contractVersion !== 1) {
    issues.push(issue(
      "measured-contract-reference-invalid",
      "request.measuredDrawContract",
      "request must reference the measured draw contract v1",
    ))
  }
  if (!SHA256.test(request.measuredDrawContract.fingerprint)
    || !SHA256.test(request.measuredDrawContract.contentFingerprint)) {
    issues.push(issue(
      "measured-contract-reference-fingerprint-invalid",
      "request.measuredDrawContract",
      "contract and content fingerprints must be SHA-256 identities",
    ))
  }
  if (!nonBlank(request.measuredDrawContract.rendererProfileId)
    || !nonBlank(request.measuredDrawContract.measurementProfileId)
    || !Number.isInteger(request.measuredDrawContract.pageCount)
    || request.measuredDrawContract.pageCount <= 0) {
    issues.push(issue(
      "measured-contract-reference-facts-invalid",
      "request.measuredDrawContract",
      "request must pin nonblank profiles and a positive page count",
    ))
  }
  if (request.output.format !== "pdf" || request.output.mediaType !== "application/pdf") {
    issues.push(issue("export-output-invalid", "request.output", "request output must be application/pdf"))
  }
  if (request.constraints.consumesMeasuredDrawContract !== true
    || request.constraints.mayRemeasure !== false
    || request.constraints.mayRepaginate !== false
    || request.constraints.mayRelayout !== false
    || request.constraints.mayRegroupSemantics !== false
    || request.constraints.productionBinding !== false) {
    issues.push(issue(
      "export-constraints-invalid",
      "request.constraints",
      "request must preserve the no-remeasure, no-repagination, no-relayout export boundary",
    ))
  }
}

function validateConsumableContract(
  contract: VNextPdfMeasuredDrawContractResultV1,
  path: string,
  issues: VNextPdfExportIssueV1[],
): contract is Extract<VNextPdfMeasuredDrawContractResultV1, { status: "consumable" }> {
  if (contract.status !== "consumable") {
    issues.push(issue("measured-contract-blocked", path, "PDF export requires a consumable measured draw contract"))
    return false
  }
  if (!SHA256.test(contract.fingerprint)) {
    issues.push(issue(
      "measured-contract-fingerprint-invalid",
      `${path}.fingerprint`,
      "measured draw contract fingerprint must be a sha256 identity",
    ))
  }
  if (!nonBlank(contract.rendererProfileId)) {
    issues.push(issue("renderer-profile-id-invalid", `${path}.rendererProfileId`, "rendererProfileId must be nonblank"))
  }
  if (!nonBlank(contract.measurementProfileId)) {
    issues.push(issue(
      "measurement-profile-id-invalid",
      `${path}.measurementProfileId`,
      "measurementProfileId must be nonblank",
    ))
  }
  if (contract.pages.length <= 0 || contract.summary.pageCount !== contract.pages.length) {
    issues.push(issue("measured-contract-page-count-invalid", `${path}.pages`, "measured page count must be positive and exact"))
  }
  if (contract.contracts.mayRelayout !== false) {
    issues.push(issue("measured-contract-relayout-forbidden", `${path}.contracts.mayRelayout`, "PDF export forbids renderer relayout"))
  }
  if (contract.execution.productionBinding !== false) {
    issues.push(issue(
      "measured-contract-production-binding",
      `${path}.execution.productionBinding`,
      "Phase T does not accept a production-bound measured contract",
    ))
  }
  return true
}

export function createVNextPdfExportRequestV1(input: {
  exportRequestId: string
  artifactId: string
  requestedAt: string
  source: VNextPdfExportSourceIdentityV1
  measuredDrawContract: VNextPdfMeasuredDrawContractResultV1
}): VNextPdfExportRequestResultV1 {
  const issues: VNextPdfExportIssueV1[] = []
  if (!nonBlank(input.exportRequestId)) {
    issues.push(issue("export-request-id-invalid", "exportRequestId", "exportRequestId must be nonblank"))
  }
  if (!nonBlank(input.artifactId)) {
    issues.push(issue("artifact-id-invalid", "artifactId", "artifactId must be nonblank"))
  }
  if (!validDate(input.requestedAt)) {
    issues.push(issue("requested-at-invalid", "requestedAt", "requestedAt must be a parseable date"))
  }
  validateSourceIdentity(input.source, "source", issues)
  validateConsumableContract(input.measuredDrawContract, "measuredDrawContract", issues)
  if (input.measuredDrawContract.status !== "consumable" || issues.length > 0) {
    return { status: "blocked", request: null, issues }
  }

  const unsigned: Omit<VNextPdfExportRequestV1, "requestFingerprint"> = {
    source: VNEXT_PDF_EXPORT_HANDOFF_V1_SOURCE,
    contractVersion: VNEXT_PDF_EXPORT_HANDOFF_V1_VERSION,
    kind: "pdf-export-request",
    exportRequestId: input.exportRequestId,
    artifactId: input.artifactId,
    requestedAt: input.requestedAt,
    expectedSource: structuredClone(input.source),
    measuredDrawContract: {
      source: input.measuredDrawContract.source,
      contractVersion: input.measuredDrawContract.contractVersion,
      fingerprint: input.measuredDrawContract.fingerprint,
      contentFingerprint: contractContentFingerprint(input.measuredDrawContract),
      rendererProfileId: input.measuredDrawContract.rendererProfileId,
      measurementProfileId: input.measuredDrawContract.measurementProfileId,
      pageCount: input.measuredDrawContract.pages.length,
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
  }
  return {
    status: "ready",
    request: { ...unsigned, requestFingerprint: requestFingerprint(unsigned) },
    issues: [],
  }
}

function blockedHandoff(
  request: VNextPdfExportRequestV1,
  currentSource: VNextPdfExportSourceIdentityV1,
  issues: VNextPdfExportIssueV1[],
): VNextPdfExportHandoffResultV1 {
  return {
    source: VNEXT_PDF_EXPORT_HANDOFF_V1_SOURCE,
    contractVersion: VNEXT_PDF_EXPORT_HANDOFF_V1_VERSION,
    kind: "pdf-export-handoff",
    status: "blocked",
    request,
    currentSource,
    rendererInput: null,
    handoffFingerprint: null,
    contracts: handoffContracts(),
    execution: handoffExecution(),
    issues,
  }
}

export function createVNextPdfExportHandoffV1(input: {
  request: VNextPdfExportRequestV1
  currentSource: VNextPdfExportSourceIdentityV1
  measuredDrawContract: VNextPdfMeasuredDrawContractResultV1
}): VNextPdfExportHandoffResultV1 {
  const issues: VNextPdfExportIssueV1[] = []
  const { request } = input
  if (request.source !== VNEXT_PDF_EXPORT_HANDOFF_V1_SOURCE
    || request.contractVersion !== VNEXT_PDF_EXPORT_HANDOFF_V1_VERSION
    || request.kind !== "pdf-export-request") {
    issues.push(issue("export-request-contract-invalid", "request", "request must use the PDF export v1 contract"))
  }
  validateRequestContract(request, issues)
  const { requestFingerprint: suppliedFingerprint, ...unsignedRequest } = request
  if (requestFingerprint(unsignedRequest) !== suppliedFingerprint) {
    issues.push(issue("export-request-fingerprint-mismatch", "request.requestFingerprint", "request content fingerprint drifted"))
  }
  validateSourceIdentity(request.expectedSource, "request.expectedSource", issues)
  validateSourceIdentity(input.currentSource, "currentSource", issues)
  if (!sameSourceIdentity(request.expectedSource, input.currentSource)) {
    issues.push(issue("source-revision-drift", "currentSource", "current source identity differs from the requested revision"))
  }
  validateConsumableContract(input.measuredDrawContract, "measuredDrawContract", issues)
  if (input.measuredDrawContract.status === "consumable") {
    const expected = request.measuredDrawContract
    const contentFingerprint = contractContentFingerprint(input.measuredDrawContract)
    if (input.measuredDrawContract.fingerprint !== expected.fingerprint) {
      issues.push(issue("measured-contract-fingerprint-mismatch", "measuredDrawContract.fingerprint", "measured contract identity drifted"))
    }
    if (contentFingerprint !== expected.contentFingerprint) {
      issues.push(issue("measured-contract-content-mismatch", "measuredDrawContract", "measured contract content drifted"))
    }
    if (input.measuredDrawContract.rendererProfileId !== expected.rendererProfileId) {
      issues.push(issue("renderer-profile-mismatch", "measuredDrawContract.rendererProfileId", "renderer profile differs from the export request"))
    }
    if (input.measuredDrawContract.measurementProfileId !== expected.measurementProfileId) {
      issues.push(issue("measurement-profile-mismatch", "measuredDrawContract.measurementProfileId", "measurement profile differs from the export request"))
    }
    if (input.measuredDrawContract.pages.length !== expected.pageCount) {
      issues.push(issue("page-count-mismatch", "measuredDrawContract.pages", "page count differs from the export request"))
    }
  }
  if (issues.length > 0 || input.measuredDrawContract.status !== "consumable") {
    return blockedHandoff(request, input.currentSource, issues)
  }

  const rendererInput: VNextPdfExportRendererInputV1 = {
    exportRequestId: request.exportRequestId,
    artifactId: request.artifactId,
    measuredDrawContract: input.measuredDrawContract,
    sourceContractFingerprint: request.measuredDrawContract.fingerprint,
    sourceContractContentFingerprint: request.measuredDrawContract.contentFingerprint,
  }
  const fingerprint = createVNextCompactFingerprint(JSON.stringify({
    requestFingerprint: request.requestFingerprint,
    currentSource: input.currentSource,
    sourceContractFingerprint: rendererInput.sourceContractFingerprint,
    sourceContractContentFingerprint: rendererInput.sourceContractContentFingerprint,
  }))
  return {
    source: VNEXT_PDF_EXPORT_HANDOFF_V1_SOURCE,
    contractVersion: VNEXT_PDF_EXPORT_HANDOFF_V1_VERSION,
    kind: "pdf-export-handoff",
    status: "ready",
    request,
    currentSource: structuredClone(input.currentSource),
    rendererInput,
    handoffFingerprint: fingerprint,
    contracts: handoffContracts(),
    execution: handoffExecution(),
    issues: [],
  }
}

export function createVNextPdfExportReceiptV1(input: {
  handoff: VNextPdfExportHandoffResultV1
  renderEvidence: VNextPdfExportRenderEvidenceV1
}): VNextPdfExportReceiptResultV1 {
  const issues: VNextPdfExportIssueV1[] = []
  if (input.handoff.status !== "ready") {
    issues.push(issue("export-handoff-blocked", "handoff", "render receipt requires a ready export handoff"))
  } else {
    const revalidated = createVNextPdfExportHandoffV1({
      request: input.handoff.request,
      currentSource: input.handoff.currentSource,
      measuredDrawContract: input.handoff.rendererInput.measuredDrawContract,
    })
    if (revalidated.status !== "ready") {
      revalidated.issues.forEach((handoffIssue, index) => issues.push(issue(
        "export-handoff-revalidation-blocked",
        `handoff.issues[${index}].${handoffIssue.path}`,
        `${handoffIssue.code}: ${handoffIssue.message}`,
      )))
    } else if (input.handoff.handoffFingerprint !== revalidated.handoffFingerprint
      || input.handoff.rendererInput.exportRequestId !== revalidated.rendererInput.exportRequestId
      || input.handoff.rendererInput.artifactId !== revalidated.rendererInput.artifactId
      || input.handoff.rendererInput.sourceContractFingerprint
        !== revalidated.rendererInput.sourceContractFingerprint
      || input.handoff.rendererInput.sourceContractContentFingerprint
        !== revalidated.rendererInput.sourceContractContentFingerprint) {
      issues.push(issue(
        "export-handoff-identity-mismatch",
        "handoff",
        "handoff identity or renderer input drifted after validation",
      ))
    }
  }
  if (input.renderEvidence.status === "blocked") {
    input.renderEvidence.issues.forEach((renderIssue, index) => issues.push(issue(
      "renderer-blocked",
      `renderEvidence.issues[${index}].${renderIssue.path}`,
      `${renderIssue.code}: ${renderIssue.message}`,
    )))
  }
  if (issues.length > 0 || input.handoff.status !== "ready" || input.renderEvidence.status !== "rendered") {
    return { status: "blocked", receipt: null, issues }
  }

  const { handoff, renderEvidence } = input
  const request = handoff.request
  if (renderEvidence.artifactId !== request.artifactId) {
    issues.push(issue("artifact-id-mismatch", "renderEvidence.artifactId", "renderer artifact differs from the export request"))
  }
  if (renderEvidence.format !== "pdf" || renderEvidence.mediaType !== "application/pdf") {
    issues.push(issue("artifact-format-mismatch", "renderEvidence", "renderer must return application/pdf evidence"))
  }
  if (!Number.isInteger(renderEvidence.byteLength) || renderEvidence.byteLength <= 0) {
    issues.push(issue("artifact-byte-length-invalid", "renderEvidence.byteLength", "rendered byte length must be positive"))
  }
  if (!BARE_SHA256.test(renderEvidence.sha256)) {
    issues.push(issue("artifact-sha256-invalid", "renderEvidence.sha256", "rendered artifact requires a lowercase SHA-256 digest"))
  }
  if (renderEvidence.pageCount !== request.measuredDrawContract.pageCount) {
    issues.push(issue("artifact-page-count-mismatch", "renderEvidence.pageCount", "rendered page count differs from the export request"))
  }
  if (renderEvidence.rendererProfileId !== request.measuredDrawContract.rendererProfileId) {
    issues.push(issue("artifact-renderer-profile-mismatch", "renderEvidence.rendererProfileId", "rendered profile differs from the export request"))
  }
  if (renderEvidence.measurementProfileId !== request.measuredDrawContract.measurementProfileId) {
    issues.push(issue("artifact-measurement-profile-mismatch", "renderEvidence.measurementProfileId", "rendered measurement profile differs from the export request"))
  }
  if (renderEvidence.sourceContractFingerprint !== handoff.rendererInput.sourceContractFingerprint) {
    issues.push(issue("artifact-contract-fingerprint-mismatch", "renderEvidence.sourceContractFingerprint", "renderer consumed a different contract identity"))
  }
  if (renderEvidence.sourceContractContentFingerprint !== handoff.rendererInput.sourceContractContentFingerprint) {
    issues.push(issue("artifact-contract-content-mismatch", "renderEvidence.sourceContractContentFingerprint", "renderer consumed different contract content"))
  }
  if (issues.length > 0) return { status: "blocked", receipt: null, issues }

  const facts = {
    source: VNEXT_PDF_EXPORT_HANDOFF_V1_SOURCE,
    contractVersion: VNEXT_PDF_EXPORT_HANDOFF_V1_VERSION,
    kind: "pdf-export-receipt" as const,
    status: "rendered" as const,
    exportRequestId: request.exportRequestId,
    requestFingerprint: request.requestFingerprint,
    handoffFingerprint: handoff.handoffFingerprint,
    sourceIdentity: structuredClone(handoff.currentSource),
    artifact: {
      artifactId: renderEvidence.artifactId,
      format: "pdf" as const,
      mediaType: "application/pdf" as const,
      byteLength: renderEvidence.byteLength,
      sha256: renderEvidence.sha256,
      pageCount: renderEvidence.pageCount,
      storageStatus: "not-stored" as const,
      storageKey: null,
    },
    rendererProfileId: renderEvidence.rendererProfileId,
    measurementProfileId: renderEvidence.measurementProfileId,
    sourceContractFingerprint: renderEvidence.sourceContractFingerprint,
    sourceContractContentFingerprint: renderEvidence.sourceContractContentFingerprint,
    contracts: {
      mayRelayout: false as const,
      carriesBytes: false as const,
      storageWrites: false as const,
      artifactManifestProjection: "pending-storage-binding" as const,
      productionBinding: false as const,
    },
  }
  return {
    status: "accepted",
    receipt: {
      ...facts,
      receiptFingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
    },
    issues: [],
  }
}
