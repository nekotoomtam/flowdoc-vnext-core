import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import {
  createFlowDocCanonicalReportLineBreakingBundleV1,
  createFlowDocCanonicalReportLineBreakingPlanV1,
  createFlowDocCanonicalReportNativeLineSegmentEvidenceBundleV1,
  validateFlowDocCanonicalReportLineBreakingBundleV1,
  type FlowDocCanonicalReportLineBreakingBundleV1,
  type FlowDocCanonicalReportNativeLineSegmentExecutionV1,
  type FlowDocCanonicalReportTypographyCalibrationManifestV1,
} from "../src/canonicalReportLineBreaking.js"
import type { FlowDocCanonicalReportNativeShapingBundleV1 } from "../src/canonicalReportNativeShaping.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

function requireFile(path: string, label: string): string {
  if (!existsSync(path)) throw new Error(`${label} does not exist: ${path}`)
  return path
}

function buildNativeSegmenter(repoRoot: string): string {
  const packageRoot = resolve(repoRoot, "packages/text-engine-rust-wasm")
  const result = spawnSync("cargo", [
    "build",
    "--quiet",
    "--manifest-path",
    resolve(packageRoot, "rust-shaper/Cargo.toml"),
    "--bin",
    "flowdoc-icu4x-line-segmenter",
  ], {
    cwd: packageRoot,
    encoding: "utf8",
  })
  if (result.status !== 0) {
    throw new Error(`ICU4X native line segmenter build failed:\n${result.stderr || result.stdout}`)
  }
  return requireFile(
    resolve(
      packageRoot,
      "rust-shaper/target/debug",
      process.platform === "win32" ? "flowdoc-icu4x-line-segmenter.exe" : "flowdoc-icu4x-line-segmenter",
    ),
    "ICU4X native line segmenter",
  )
}

function executePlan(
  repoRoot: string,
  executablePath: string,
  plan: ReturnType<typeof createFlowDocCanonicalReportLineBreakingPlanV1>,
): FlowDocCanonicalReportNativeLineSegmentExecutionV1[] {
  return plan.segmentRequests.map((request) => {
    const result = spawnSync(executablePath, [request.text], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    })
    if (result.status !== 0) {
      throw new Error(`ICU4X segmentation failed for ${request.segmentRequestId}:\n${result.stderr || result.stdout}`)
    }
    return { segmentRequestId: request.segmentRequestId, rawOutput: JSON.parse(result.stdout) }
  })
}

function createQa(bundle: FlowDocCanonicalReportLineBreakingBundleV1) {
  const byStyle = Object.values(bundle.measurements.reduce<Record<string, {
    styleKey: string
    measurementCount: number
    lineCount: number
    multiLineMeasurementCount: number
    overflowLineCount: number
  }>>((groups, measurement) => {
    const group = groups[measurement.styleKey] ?? {
      styleKey: measurement.styleKey,
      measurementCount: 0,
      lineCount: 0,
      multiLineMeasurementCount: 0,
      overflowLineCount: 0,
    }
    group.measurementCount += 1
    group.lineCount += measurement.summary.lineCount
    group.multiLineMeasurementCount += measurement.summary.lineCount > 1 ? 1 : 0
    group.overflowLineCount += measurement.summary.overflowLineCount
    groups[group.styleKey] = group
    return groups
  }, {}))
  return {
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2c-e-canonical-report-line-breaking-qa-v1",
    phaseId: bundle.phaseId,
    status: "accepted-native-line-box-evidence-only",
    sourceFingerprints: {
      nativeShaping: bundle.sourceNativeShapingFingerprint,
      typographyCalibration: bundle.sourceTypographyCalibrationFingerprint,
      rawSegmentation: bundle.sourceRawSegmentationFingerprint,
    },
    planFingerprint: bundle.planFingerprint,
    bundleFingerprint: bundle.bundleFingerprint,
    profileBinding: bundle.profileBinding,
    lineHeightBindings: bundle.lineHeightBindings,
    byStyle,
    overflowMeasurements: bundle.measurements
      .filter((measurement) => measurement.summary.overflowLineCount > 0)
      .map((measurement) => ({
        measurementVariantId: measurement.measurementVariantId,
        styleKey: measurement.styleKey,
        availableWidthPt: measurement.availableWidthPt,
        text: measurement.renderedText,
        overflowLineCount: measurement.summary.overflowLineCount,
      })),
    summary: bundle.summary,
    executionGate: {
      status: "native-line-box-evidence-accepted-vertical-layout-blocked",
      nativeShapingConsumed: true,
      nativeIcu4xSegmentationExecuted: true,
      lineHeightsBound: true,
      utf16BreakOffsetsMapped: true,
      everyMeasurementGlyphCoveredExactlyOnce:
        bundle.summary.measurementGlyphCount === bundle.summary.coveredGlyphCount,
      lineBoxesCreated: true,
      productionBinding: false,
      blockers: bundle.downstreamBlockers,
    },
    boundary: bundle.execution,
    nextPhase: "PDF-PILOT-08B-R2C-F line-box acceptance and vertical block/table composition readiness",
  }
}

export function buildCanonicalReportLineBreaking(): {
  bundlePath: string
  rawPath: string
  qaPath: string
} {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const input = {
    nativeShaping: readJson<FlowDocCanonicalReportNativeShapingBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-native-shaping.v1.json"),
    ),
    typographyCalibration: readJson<FlowDocCanonicalReportTypographyCalibrationManifestV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-typography-calibration.v1.json"),
    ),
  }
  const plan = createFlowDocCanonicalReportLineBreakingPlanV1(input)
  const executablePath = buildNativeSegmenter(repoRoot)
  const executions = executePlan(repoRoot, executablePath, plan)
  const raw = createFlowDocCanonicalReportNativeLineSegmentEvidenceBundleV1(plan, executions)
  const bundle = createFlowDocCanonicalReportLineBreakingBundleV1(input, raw)
  const rebuilt = createFlowDocCanonicalReportLineBreakingBundleV1(input, raw)
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report line-breaking bundle is not deterministic.")
  }
  if (validateFlowDocCanonicalReportLineBreakingBundleV1(bundle, input, raw).status !== "valid") {
    throw new Error("Generated canonical report line-breaking bundle is invalid.")
  }

  const bundlePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-line-breaking.v1.json")
  const rawPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-line-segmentation-raw.v1.json",
  )
  const qaPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-line-breaking-qa.v1.json",
  )
  for (const path of [bundlePath, rawPath, qaPath]) mkdirSync(dirname(path), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(rawPath, `${JSON.stringify(raw, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify(createQa(bundle), null, 2)}\n`, "utf8")
  return { bundlePath, rawPath, qaPath }
}
