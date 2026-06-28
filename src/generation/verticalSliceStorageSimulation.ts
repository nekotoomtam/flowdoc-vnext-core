import type {
  VNextStorageRecordKind,
  VNextStorageWriteResult,
  VNextStorageWriteStatus,
} from "../persistence/storageAdapter.js"
import type {
  VNextVerticalSliceRcStorageCollectionSummary,
  VNextVerticalSliceRcStorageStatus,
  VNextVerticalSliceRcStorageSummary,
} from "./verticalSliceRc.js"

export const VNEXT_VERTICAL_SLICE_STORAGE_SIMULATION_SOURCE = "vnext-vertical-slice-storage-simulation"
export const VNEXT_VERTICAL_SLICE_STORAGE_SIMULATION_MODE = "rc-storage-contract-simulation-summary"

export type VNextVerticalSliceStorageSimulationStatus = "accepted" | "conflict" | "blocked"

export interface VNextVerticalSliceStorageSimulationWriteInput {
  kind: VNextStorageRecordKind
  key: string
  result: VNextStorageWriteResult<unknown>
}

export interface VNextVerticalSliceStorageSimulationInput {
  expectedCollections: readonly VNextStorageRecordKind[]
  writes: readonly VNextVerticalSliceStorageSimulationWriteInput[]
}

export interface VNextVerticalSliceStorageSimulationIssue {
  severity: "blocking"
  code: string
  path: string
  message: string
}

export interface VNextVerticalSliceStorageSimulationResult {
  source: typeof VNEXT_VERTICAL_SLICE_STORAGE_SIMULATION_SOURCE
  mode: typeof VNEXT_VERTICAL_SLICE_STORAGE_SIMULATION_MODE
  status: VNextVerticalSliceStorageSimulationStatus
  summary: VNextVerticalSliceRcStorageSummary
  issues: readonly VNextVerticalSliceStorageSimulationIssue[]
  contracts: {
    summaryOnly: true
    usesStorageAdapterResults: true
    testLocalMockOnly: true
    concreteBackend: null
    storageWrites: false
    authzExecution: false
    serverRoute: false
    packageSchemaChange: false
  }
}

export function summarizeVNextVerticalSliceStorageSimulation(
  input: VNextVerticalSliceStorageSimulationInput,
): VNextVerticalSliceStorageSimulationResult {
  const issues: VNextVerticalSliceStorageSimulationIssue[] = []
  const summaries: VNextVerticalSliceRcStorageCollectionSummary[] = []
  const seen = new Set<VNextStorageRecordKind>()

  for (const [index, write] of input.writes.entries()) {
    if (seen.has(write.kind)) {
      issues.push(issue("duplicate-write-kind", `writes[${index}].kind`, `duplicate storage write kind: ${write.kind}`))
    }
    seen.add(write.kind)
    summaries.push(summaryFromWrite(write, index, issues))
  }

  for (const kind of input.expectedCollections) {
    if (!seen.has(kind)) {
      issues.push(issue("missing-expected-collection", "expectedCollections", `missing storage simulation write for ${kind}`))
      summaries.push({
        kind,
        status: "blocked",
        key: "",
        revision: null,
        writeStatus: "missing",
      })
    }
  }

  const summaryStatus = summarizeStatus(summaries, issues)

  return {
    source: VNEXT_VERTICAL_SLICE_STORAGE_SIMULATION_SOURCE,
    mode: VNEXT_VERTICAL_SLICE_STORAGE_SIMULATION_MODE,
    status: summaryStatus,
    summary: {
      status: summaryStatus,
      collections: summaries,
    },
    issues,
    contracts: {
      summaryOnly: true,
      usesStorageAdapterResults: true,
      testLocalMockOnly: true,
      concreteBackend: null,
      storageWrites: false,
      authzExecution: false,
      serverRoute: false,
      packageSchemaChange: false,
    },
  }
}

function summaryFromWrite(
  write: VNextVerticalSliceStorageSimulationWriteInput,
  index: number,
  issues: VNextVerticalSliceStorageSimulationIssue[],
): VNextVerticalSliceRcStorageCollectionSummary {
  const status = statusFromWrite(write.result.status)
  if (write.result.ok && write.result.record.kind !== write.kind) {
    issues.push(issue("write-kind-mismatch", `writes[${index}].kind`, "write result record kind must match declared kind"))
  }
  if (write.result.ok && write.result.record.key !== write.key) {
    issues.push(issue("write-key-mismatch", `writes[${index}].key`, "write result record key must match declared key"))
  }
  if (!write.result.ok) {
    for (const writeIssue of write.result.issues) {
      issues.push(issue(writeIssue.code, `writes[${index}].result.${writeIssue.path}`, writeIssue.message))
    }
  }

  return {
    kind: write.kind,
    status,
    key: write.result.record?.key ?? write.key,
    revision: write.result.record?.revision ?? null,
    writeStatus: write.result.status,
  }
}

function statusFromWrite(status: VNextStorageWriteStatus): VNextVerticalSliceRcStorageStatus {
  if (status === "written" || status === "idempotent-replay") return "accepted"
  if (status === "conflict") return "conflict"
  return "blocked"
}

function summarizeStatus(
  summaries: readonly VNextVerticalSliceRcStorageCollectionSummary[],
  issues: readonly VNextVerticalSliceStorageSimulationIssue[],
): VNextVerticalSliceStorageSimulationStatus {
  if (summaries.some((item) => item.status === "blocked")) return "blocked"
  if (summaries.some((item) => item.status === "conflict")) return "conflict"
  if (issues.length > 0) return "blocked"
  return "accepted"
}

function issue(code: string, path: string, message: string): VNextVerticalSliceStorageSimulationIssue {
  return {
    severity: "blocking",
    code,
    path,
    message,
  }
}
