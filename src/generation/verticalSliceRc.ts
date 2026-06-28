export const VNEXT_VERTICAL_SLICE_RC_SOURCE = "vnext-vertical-slice-rc"
export const VNEXT_VERTICAL_SLICE_RC_MODE = "input-driven-rc-report-boundary"

export type VNextVerticalSliceRcReadinessStatus = "ready" | "ready-with-risks" | "blocked"

export type VNextVerticalSliceRcEvidenceStatus =
  | "pass"
  | "risk"
  | "unknown"
  | "blocked"
  | "not-run"

export type VNextVerticalSliceRcEvidenceLane =
  | "canonical-package"
  | "key-data-diagnostics"
  | "authoring-session"
  | "rich-inline-commit"
  | "exact-generation"
  | "measurement"
  | "artifact"
  | "artifact-job"
  | "storage"

export type VNextVerticalSliceRcExactGenerationStatus = "stale" | "unchanged" | "unknown"

export type VNextVerticalSliceRcMeasurementStatus = "accepted" | "warning" | "blocked" | "not-run"
export type VNextVerticalSliceRcDigestStatus = "present" | "missing" | "not-run"
export type VNextVerticalSliceRcParityStatus = "matched" | "mismatch" | "missing" | "not-run"
export type VNextVerticalSliceRcArtifactStatus = "rendered" | "planned" | "failed" | "blocked" | "not-run"
export type VNextVerticalSliceRcStorageStatus = "accepted" | "conflict" | "blocked" | "not-run"

export type VNextVerticalSliceRcJsonValue =
  | null
  | boolean
  | number
  | string
  | readonly VNextVerticalSliceRcJsonValue[]
  | { readonly [key: string]: VNextVerticalSliceRcJsonValue }

export interface VNextVerticalSliceRcEvidenceSummary {
  lane: VNextVerticalSliceRcEvidenceLane
  status: VNextVerticalSliceRcEvidenceStatus
  summary: string
  issues?: readonly string[]
  facts?: { readonly [key: string]: VNextVerticalSliceRcJsonValue }
}

export interface VNextVerticalSliceRcExactGenerationSummary {
  status: VNextVerticalSliceRcExactGenerationStatus
  reason: string
}

export interface VNextVerticalSliceRcMeasurementSummary {
  status: VNextVerticalSliceRcMeasurementStatus
  measurementProfileId: string
  rendererProfileId: string
  lineBoxCount: number | null
  widthDriftPt: number | null
  heightDriftPt: number | null
  lineCountDrift: number | null
  digestStatus: VNextVerticalSliceRcDigestStatus
  nativeWasmParityStatus: VNextVerticalSliceRcParityStatus
}

export interface VNextVerticalSliceRcArtifactSummary {
  status: VNextVerticalSliceRcArtifactStatus
  artifactId: string
  format: "pdf" | "docx" | "unknown"
  mediaType: string | null
  byteLength: number | null
  sha256: string | null
  digestStatus: VNextVerticalSliceRcDigestStatus
  storageStatus: string
  spikeGrade: boolean
}

export interface VNextVerticalSliceRcStorageCollectionSummary {
  kind: string
  status: VNextVerticalSliceRcStorageStatus
  key: string
  revision: number | null
  writeStatus?: string
}

export interface VNextVerticalSliceRcStorageSummary {
  status: VNextVerticalSliceRcStorageStatus
  collections: readonly VNextVerticalSliceRcStorageCollectionSummary[]
}

export interface VNextVerticalSliceRcReportInput {
  rcId: string
  packageId: string
  sessionId: string
  scenarioId?: string | null
  measurementProfileId: string
  rendererProfileId: string
  artifactId: string
  exactGeneration: VNextVerticalSliceRcExactGenerationSummary
  measurement: VNextVerticalSliceRcMeasurementSummary
  artifact: VNextVerticalSliceRcArtifactSummary
  storage: VNextVerticalSliceRcStorageSummary
  evidence: readonly VNextVerticalSliceRcEvidenceSummary[]
  pass?: readonly string[]
  risk?: readonly string[]
  unknown?: readonly string[]
  intentionallyNotProductionReady?: readonly string[]
}

export interface VNextVerticalSliceRcReport {
  source: typeof VNEXT_VERTICAL_SLICE_RC_SOURCE
  mode: typeof VNEXT_VERTICAL_SLICE_RC_MODE
  status: VNextVerticalSliceRcReadinessStatus
  rcId: string
  scenarioId: string | null
  packageId: string
  sessionId: string
  singleUser: true
  productionReady: false
  measurementProfileId: string
  rendererProfileId: string
  artifactId: string
  exactGeneration: VNextVerticalSliceRcExactGenerationSummary
  measurement: VNextVerticalSliceRcMeasurementSummary
  artifact: VNextVerticalSliceRcArtifactSummary
  storage: VNextVerticalSliceRcStorageSummary
  evidence: readonly VNextVerticalSliceRcEvidenceSummary[]
  pass: readonly string[]
  risk: readonly string[]
  unknown: readonly string[]
  failBlocker: readonly string[]
  intentionallyNotProductionReady: readonly string[]
  contracts: {
    jsonSafe: true
    inputDriven: true
    singleUserOnly: true
    uiImplementation: false
    serverRoute: false
    workerOrQueue: false
    storageWrites: false
    browserApis: false
    rendererExecution: false
    externalPackageImports: false
    productionBinding: false
    packageSchemaChange: false
  }
}

export const VNEXT_VERTICAL_SLICE_RC_REQUIRED_EVIDENCE_LANES: readonly VNextVerticalSliceRcEvidenceLane[] = [
  "canonical-package",
  "key-data-diagnostics",
  "authoring-session",
  "rich-inline-commit",
  "exact-generation",
  "measurement",
  "artifact",
  "artifact-job",
  "storage",
]

const DEFAULT_NOT_PRODUCTION_READY: readonly string[] = [
  "single-user RC evidence only",
  "not production launch ready",
  "no collaboration/offline semantics",
  "no default pagination measurement replacement",
  "no concrete storage backend",
  "no production PDF fidelity",
  "no production WYSIWYG input implementation",
  "no package/document schema change",
]

export function createVNextVerticalSliceRcReport(input: VNextVerticalSliceRcReportInput): VNextVerticalSliceRcReport {
  const pass = uniqueList(input.pass)
  const risk = uniqueList(input.risk)
  const unknown = uniqueList(input.unknown)
  const failBlocker: string[] = []
  const evidence = normalizeEvidence(input.evidence, failBlocker)

  requireNonEmpty("rcId", input.rcId, failBlocker)
  requireNonEmpty("packageId", input.packageId, failBlocker)
  requireNonEmpty("sessionId", input.sessionId, failBlocker)
  requireNonEmpty("measurementProfileId", input.measurementProfileId, failBlocker)
  requireNonEmpty("rendererProfileId", input.rendererProfileId, failBlocker)
  requireNonEmpty("artifactId", input.artifactId, failBlocker)

  if (input.measurement.measurementProfileId !== input.measurementProfileId) {
    failBlocker.push("measurement summary profile must match measurementProfileId")
  }
  if (input.measurement.rendererProfileId !== input.rendererProfileId) {
    failBlocker.push("measurement summary renderer profile must match rendererProfileId")
  }
  if (input.artifact.artifactId !== input.artifactId) {
    failBlocker.push("artifact summary id must match artifactId")
  }
  if (input.exactGeneration.status !== "stale") {
    failBlocker.push("exact generation status must be stale for the RC edit")
  }
  if (input.measurement.status === "blocked") {
    failBlocker.push("measurement summary is blocked")
  } else if (input.measurement.status === "not-run") {
    unknown.push("measurement summary has not run")
  } else if (input.measurement.status === "warning") {
    risk.push("measurement summary has warnings")
  }
  if (input.measurement.digestStatus !== "present") {
    unknown.push(`measurement digest status is ${input.measurement.digestStatus}`)
  }
  if (input.measurement.nativeWasmParityStatus !== "matched") {
    unknown.push(`native/WASM parity status is ${input.measurement.nativeWasmParityStatus}`)
  }
  if (input.artifact.status === "blocked" || input.artifact.status === "failed") {
    failBlocker.push(`artifact summary is ${input.artifact.status}`)
  } else if (input.artifact.status === "not-run" || input.artifact.status === "planned") {
    unknown.push(`artifact summary is ${input.artifact.status}`)
  }
  if (input.artifact.status === "rendered" && (input.artifact.byteLength == null || input.artifact.byteLength <= 0)) {
    failBlocker.push("rendered artifact summary requires positive byteLength")
  }
  if (input.artifact.digestStatus !== "present") {
    unknown.push(`artifact digest status is ${input.artifact.digestStatus}`)
  }
  if (!input.artifact.spikeGrade) {
    risk.push("artifact summary is not marked spike-grade")
  }
  if (input.storage.status === "blocked" || input.storage.status === "conflict") {
    failBlocker.push(`storage summary is ${input.storage.status}`)
  } else if (input.storage.status === "not-run") {
    unknown.push("storage summary has not run")
  }

  collectEvidence(evidence, pass, risk, unknown, failBlocker)
  collectMissingLanes(evidence, failBlocker)

  const status: VNextVerticalSliceRcReadinessStatus =
    failBlocker.length > 0 ? "blocked" : risk.length > 0 || unknown.length > 0 ? "ready-with-risks" : "ready"

  return {
    source: VNEXT_VERTICAL_SLICE_RC_SOURCE,
    mode: VNEXT_VERTICAL_SLICE_RC_MODE,
    status,
    rcId: input.rcId,
    scenarioId: input.scenarioId ?? null,
    packageId: input.packageId,
    sessionId: input.sessionId,
    singleUser: true,
    productionReady: false,
    measurementProfileId: input.measurementProfileId,
    rendererProfileId: input.rendererProfileId,
    artifactId: input.artifactId,
    exactGeneration: input.exactGeneration,
    measurement: input.measurement,
    artifact: input.artifact,
    storage: input.storage,
    evidence,
    pass,
    risk: uniqueList(risk),
    unknown: uniqueList(unknown),
    failBlocker: uniqueList(failBlocker),
    intentionallyNotProductionReady: uniqueList([
      ...DEFAULT_NOT_PRODUCTION_READY,
      ...(input.intentionallyNotProductionReady ?? []),
    ]),
    contracts: {
      jsonSafe: true,
      inputDriven: true,
      singleUserOnly: true,
      uiImplementation: false,
      serverRoute: false,
      workerOrQueue: false,
      storageWrites: false,
      browserApis: false,
      rendererExecution: false,
      externalPackageImports: false,
      productionBinding: false,
      packageSchemaChange: false,
    },
  }
}

function collectEvidence(
  evidence: readonly VNextVerticalSliceRcEvidenceSummary[],
  pass: string[],
  risk: string[],
  unknown: string[],
  failBlocker: string[],
): void {
  for (const item of evidence) {
    const summary = `${item.lane}: ${item.summary}`
    if (item.status === "pass") pass.push(summary)
    if (item.status === "risk") risk.push(summary)
    if (item.status === "unknown" || item.status === "not-run") unknown.push(summary)
    if (item.status === "blocked") failBlocker.push(summary)
    for (const issue of item.issues ?? []) {
      if (item.status === "blocked") failBlocker.push(`${item.lane}: ${issue}`)
      else if (item.status === "risk") risk.push(`${item.lane}: ${issue}`)
      else unknown.push(`${item.lane}: ${issue}`)
    }
  }
}

function collectMissingLanes(evidence: readonly VNextVerticalSliceRcEvidenceSummary[], failBlocker: string[]): void {
  const seen = new Set(evidence.map((item) => item.lane))
  for (const lane of VNEXT_VERTICAL_SLICE_RC_REQUIRED_EVIDENCE_LANES) {
    if (!seen.has(lane)) failBlocker.push(`missing RC evidence lane: ${lane}`)
  }
}

function normalizeEvidence(
  evidence: readonly VNextVerticalSliceRcEvidenceSummary[],
  failBlocker: string[],
): readonly VNextVerticalSliceRcEvidenceSummary[] {
  const seen = new Set<VNextVerticalSliceRcEvidenceLane>()
  return evidence.map((item) => {
    if (seen.has(item.lane)) failBlocker.push(`duplicate RC evidence lane: ${item.lane}`)
    seen.add(item.lane)
    return {
      lane: item.lane,
      status: item.status,
      summary: item.summary,
      issues: uniqueList(item.issues),
      facts: item.facts ?? {},
    }
  })
}

function requireNonEmpty(field: string, value: string, failBlocker: string[]): void {
  if (value.trim().length === 0) failBlocker.push(`${field} is required`)
}

function uniqueList(values: readonly string[] | undefined): string[] {
  const result: string[] = []
  const seen = new Set<string>()
  for (const value of values ?? []) {
    const normalized = value.trim()
    if (normalized.length === 0 || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }
  return result
}
