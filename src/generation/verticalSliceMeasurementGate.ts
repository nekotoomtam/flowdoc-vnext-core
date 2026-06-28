import type {
  VNextVerticalSliceRcDigestStatus,
  VNextVerticalSliceRcMeasurementSummary,
  VNextVerticalSliceRcMeasurementStatus,
  VNextVerticalSliceRcParityStatus,
} from "./verticalSliceRc.js"

export const VNEXT_VERTICAL_SLICE_MEASUREMENT_GATE_SOURCE = "vnext-vertical-slice-measurement-gate"
export const VNEXT_VERTICAL_SLICE_MEASUREMENT_GATE_MODE = "rc-measurement-selection-drift-gate"

export type VNextVerticalSliceMeasurementGateStatus = "accepted" | "warning" | "blocked"
export type VNextVerticalSliceMeasurementGateIssueSeverity = "warning" | "blocking"

export interface VNextVerticalSliceMeasurementDraftSummary {
  measurementProfileId: string
  lineBoxCount: number
  widthPt: number
  heightPt: number
}

export interface VNextVerticalSliceMeasurementRuntimeSummary {
  digestStatus: VNextVerticalSliceRcDigestStatus
  nativeWasmParityStatus: VNextVerticalSliceRcParityStatus
}

export interface VNextVerticalSliceMeasurementDriftTolerance {
  maxWidthDriftPt: number
  maxHeightDriftPt: number
  maxLineCountDrift: number
  overTolerance: "warning" | "blocked"
}

export interface VNextVerticalSliceMeasurementGateInput {
  measurementProfileId: string
  rendererProfileId: string
  rendererBacked: VNextVerticalSliceMeasurementDraftSummary
  approximate: VNextVerticalSliceMeasurementDraftSummary
  runtime: VNextVerticalSliceMeasurementRuntimeSummary
  tolerance: VNextVerticalSliceMeasurementDriftTolerance
}

export interface VNextVerticalSliceMeasurementGateIssue {
  severity: VNextVerticalSliceMeasurementGateIssueSeverity
  code: string
  path: string
  message: string
}

export interface VNextVerticalSliceMeasurementGateResult {
  source: typeof VNEXT_VERTICAL_SLICE_MEASUREMENT_GATE_SOURCE
  mode: typeof VNEXT_VERTICAL_SLICE_MEASUREMENT_GATE_MODE
  status: VNextVerticalSliceMeasurementGateStatus
  summary: VNextVerticalSliceRcMeasurementSummary
  issues: readonly VNextVerticalSliceMeasurementGateIssue[]
  tolerance: VNextVerticalSliceMeasurementDriftTolerance
  contracts: {
    summaryOnly: true
    defaultMeasurementReplacement: false
    productionBinding: false
    externalPackageImports: false
    rendererExecution: false
    paginationMutation: false
    packageSchemaChange: false
  }
}

export function evaluateVNextVerticalSliceMeasurementGate(
  input: VNextVerticalSliceMeasurementGateInput,
): VNextVerticalSliceMeasurementGateResult {
  const issues: VNextVerticalSliceMeasurementGateIssue[] = []
  const widthDriftPt = round(input.rendererBacked.widthPt - input.approximate.widthPt)
  const heightDriftPt = round(input.rendererBacked.heightPt - input.approximate.heightPt)
  const lineCountDrift = input.rendererBacked.lineBoxCount - input.approximate.lineBoxCount

  if (input.measurementProfileId.trim().length === 0) {
    issues.push(issue("blocking", "missing-measurement-profile-id", "measurementProfileId", "measurementProfileId is required"))
  }
  if (input.rendererProfileId.trim().length === 0) {
    issues.push(issue("blocking", "missing-renderer-profile-id", "rendererProfileId", "rendererProfileId is required"))
  }
  if (input.rendererBacked.measurementProfileId !== input.measurementProfileId) {
    issues.push(issue("blocking", "renderer-backed-profile-mismatch", "rendererBacked.measurementProfileId", "renderer-backed summary must match measurementProfileId"))
  }
  if (input.approximate.measurementProfileId !== input.measurementProfileId) {
    issues.push(issue("blocking", "approximate-profile-mismatch", "approximate.measurementProfileId", "approximate summary must match measurementProfileId"))
  }
  if (input.rendererBacked.lineBoxCount <= 0) {
    issues.push(issue("blocking", "missing-renderer-backed-line-boxes", "rendererBacked.lineBoxCount", "renderer-backed summary must include line boxes"))
  }
  if (input.approximate.lineBoxCount <= 0) {
    issues.push(issue("blocking", "missing-approximate-line-boxes", "approximate.lineBoxCount", "approximate summary must include line boxes"))
  }

  addDriftIssue(issues, input.tolerance.overTolerance, "width-drift-over-tolerance", "widthDriftPt", Math.abs(widthDriftPt), input.tolerance.maxWidthDriftPt)
  addDriftIssue(issues, input.tolerance.overTolerance, "height-drift-over-tolerance", "heightDriftPt", Math.abs(heightDriftPt), input.tolerance.maxHeightDriftPt)
  addDriftIssue(issues, input.tolerance.overTolerance, "line-count-drift-over-tolerance", "lineCountDrift", Math.abs(lineCountDrift), input.tolerance.maxLineCountDrift)

  if (input.runtime.digestStatus !== "present") {
    issues.push(issue("warning", "digest-not-pinned", "runtime.digestStatus", `digest status is ${input.runtime.digestStatus}`))
  }
  if (input.runtime.nativeWasmParityStatus === "mismatch") {
    issues.push(issue("blocking", "native-wasm-parity-mismatch", "runtime.nativeWasmParityStatus", "native/WASM parity mismatch blocks the RC measurement gate"))
  } else if (input.runtime.nativeWasmParityStatus !== "matched") {
    issues.push(issue("warning", "native-wasm-parity-not-proved", "runtime.nativeWasmParityStatus", `native/WASM parity status is ${input.runtime.nativeWasmParityStatus}`))
  }

  const hasBlocking = issues.some((item) => item.severity === "blocking")
  const hasWarning = issues.some((item) => item.severity === "warning")
  const status: VNextVerticalSliceMeasurementGateStatus = hasBlocking ? "blocked" : hasWarning ? "warning" : "accepted"
  const summaryStatus: VNextVerticalSliceRcMeasurementStatus = status === "accepted" ? "accepted" : status

  return {
    source: VNEXT_VERTICAL_SLICE_MEASUREMENT_GATE_SOURCE,
    mode: VNEXT_VERTICAL_SLICE_MEASUREMENT_GATE_MODE,
    status,
    summary: {
      status: summaryStatus,
      measurementProfileId: input.measurementProfileId,
      rendererProfileId: input.rendererProfileId,
      lineBoxCount: input.rendererBacked.lineBoxCount > 0 ? input.rendererBacked.lineBoxCount : null,
      widthDriftPt,
      heightDriftPt,
      lineCountDrift,
      digestStatus: input.runtime.digestStatus,
      nativeWasmParityStatus: input.runtime.nativeWasmParityStatus,
    },
    issues,
    tolerance: input.tolerance,
    contracts: {
      summaryOnly: true,
      defaultMeasurementReplacement: false,
      productionBinding: false,
      externalPackageImports: false,
      rendererExecution: false,
      paginationMutation: false,
      packageSchemaChange: false,
    },
  }
}

function addDriftIssue(
  issues: VNextVerticalSliceMeasurementGateIssue[],
  overTolerance: "warning" | "blocked",
  code: string,
  path: string,
  actual: number,
  allowed: number,
): void {
  if (actual <= allowed) return
  issues.push(issue(overTolerance === "blocked" ? "blocking" : "warning", code, path, `drift ${actual} exceeds tolerance ${allowed}`))
}

function issue(
  severity: VNextVerticalSliceMeasurementGateIssueSeverity,
  code: string,
  path: string,
  message: string,
): VNextVerticalSliceMeasurementGateIssue {
  return { severity, code, path, message }
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}
