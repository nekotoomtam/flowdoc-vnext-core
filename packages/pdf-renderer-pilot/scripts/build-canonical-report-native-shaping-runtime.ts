import { createHash } from "node:crypto"
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import type { FlowDocCanonicalReportDataBundleV1 } from "../src/canonicalReportDataAdapter.js"
import type { FlowDocCanonicalReportDisplayFormattingBundleV1 } from "../src/canonicalReportDisplayFormatting.js"
import type { FlowDocCanonicalReportMeasurementRequestHandoffBundleV1 } from "../src/canonicalReportMeasurementRequestHandoff.js"
import {
  createFlowDocCanonicalReportNativeRawEvidenceBundleV1,
  createFlowDocCanonicalReportNativeShapingBundleV1,
  createFlowDocCanonicalReportNativeShapingPlanV1,
  validateFlowDocCanonicalReportNativeShapingBundleV1,
  type FlowDocCanonicalReportNativeRawExecutionV1,
  type FlowDocCanonicalReportNativeShapingBundleV1,
  type FlowDocCanonicalReportNativeShapingFontManifestV1,
} from "../src/canonicalReportNativeShaping.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../src/canonicalReportTableProjection.js"
import type { FlowDocCanonicalReportTemplateResolutionBundleV1 } from "../src/canonicalReportTemplateResolution.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex")
}

function requireFile(path: string, label: string): string {
  if (!existsSync(path)) throw new Error(`${label} does not exist: ${path}`)
  return path
}

function buildNativeShaper(repoRoot: string): string {
  const packageRoot = resolve(repoRoot, "packages/text-engine-rust-wasm")
  const result = spawnSync("cargo", [
    "build",
    "--quiet",
    "--manifest-path",
    resolve(packageRoot, "rust-shaper/Cargo.toml"),
  ], {
    cwd: packageRoot,
    encoding: "utf8",
  })
  if (result.status !== 0) {
    throw new Error(`rustybuzz native shaper build failed:\n${result.stderr || result.stdout}`)
  }
  return requireFile(
    resolve(
      packageRoot,
      "rust-shaper/target/debug",
      process.platform === "win32" ? "flowdoc-rustybuzz-smoke.exe" : "flowdoc-rustybuzz-smoke",
    ),
    "rustybuzz native shaper",
  )
}

function executePlan(
  repoRoot: string,
  executablePath: string,
  plan: ReturnType<typeof createFlowDocCanonicalReportNativeShapingPlanV1>,
): FlowDocCanonicalReportNativeRawExecutionV1[] {
  return plan.shapeRequests.map((request) => {
    const fontPath = requireFile(resolve(repoRoot, request.fontAssetPath), request.fontId)
    const actualHash = sha256File(fontPath)
    if (actualHash !== request.fontSha256) {
      throw new Error(`registered font hash mismatch for ${request.fontId}: ${actualHash}`)
    }
    const result = spawnSync(executablePath, [fontPath, request.text, request.fontId], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    })
    if (result.status !== 0) {
      throw new Error(`rustybuzz shaping failed for ${request.shapeRequestId}:\n${result.stderr || result.stdout}`)
    }
    const rawOutput = JSON.parse(result.stdout)
    rawOutput.fontPath = request.fontAssetPath
    return { shapeRequestId: request.shapeRequestId, rawOutput }
  })
}

function createQa(bundle: FlowDocCanonicalReportNativeShapingBundleV1) {
  const byFont = Object.values(bundle.shapeExecutions.reduce<Record<string, {
    fontId: string
    shapeExecutionCount: number
    glyphCount: number
    missingGlyphCount: number
  }>>((groups, execution) => {
    const group = groups[execution.shapeRequest.fontId] ?? {
      fontId: execution.shapeRequest.fontId,
      shapeExecutionCount: 0,
      glyphCount: 0,
      missingGlyphCount: 0,
    }
    group.shapeExecutionCount += 1
    group.glyphCount += execution.summary.glyphCount
    group.missingGlyphCount += execution.summary.missingGlyphCount
    groups[group.fontId] = group
    return groups
  }, {}))
  return {
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2c-d-canonical-report-native-shaping-qa-v1",
    phaseId: bundle.phaseId,
    status: "accepted-native-shaping-only",
    sourceFingerprints: {
      data: bundle.sourceDataBundleFingerprint,
      template: bundle.sourceTemplateBundleFingerprint,
      formatting: bundle.sourceFormattingBundleFingerprint,
      measurementHandoff: bundle.sourceMeasurementHandoffFingerprint,
      projection: bundle.sourceProjectionFingerprint,
      rawEvidence: bundle.sourceRawEvidenceFingerprint,
    },
    planFingerprint: bundle.planFingerprint,
    bundleFingerprint: bundle.bundleFingerprint,
    profileBinding: bundle.profileBinding,
    styleBindings: bundle.styleBindings,
    byFont,
    summary: bundle.summary,
    executionGate: {
      status: "native-glyph-evidence-accepted-line-breaking-blocked",
      nativeShapingExecuted: true,
      allFontsHashVerified: true,
      missingGlyphCount: bundle.summary.missingGlyphCount,
      lineBreakingExecuted: false,
      lineBoxesCreated: false,
      productionBinding: false,
      blockers: bundle.downstreamBlockers,
    },
    boundary: bundle.execution,
    nextPhase: "PDF-PILOT-08B-R2C-E concrete ICU4X and line-height binding for line-break execution",
  }
}

export function buildCanonicalReportNativeShaping(): {
  bundlePath: string
  rawPath: string
  qaPath: string
} {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const input = {
    dataBundle: readJson<FlowDocCanonicalReportDataBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-data-bundle.v1.json"),
    ),
    templateBundle: readJson<FlowDocCanonicalReportTemplateResolutionBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-template-resolution.v1.json"),
    ),
    formattingBundle: readJson<FlowDocCanonicalReportDisplayFormattingBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-display-formatting.v1.json"),
    ),
    measurementHandoff: readJson<FlowDocCanonicalReportMeasurementRequestHandoffBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-measurement-handoff.v1.json"),
    ),
    projectionBundle: readJson<FlowDocCanonicalReportTableProjectionBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-table-projection.v1.json"),
    ),
    fontManifest: readJson<FlowDocCanonicalReportNativeShapingFontManifestV1>(
      resolve(repoRoot, "assets/fonts/font-assets.v1.json"),
    ),
  }
  const plan = createFlowDocCanonicalReportNativeShapingPlanV1(input)
  const executablePath = buildNativeShaper(repoRoot)
  const executions = executePlan(repoRoot, executablePath, plan)
  const raw = createFlowDocCanonicalReportNativeRawEvidenceBundleV1(plan, executions)
  const bundle = createFlowDocCanonicalReportNativeShapingBundleV1(input, raw)
  const rebuilt = createFlowDocCanonicalReportNativeShapingBundleV1(input, raw)
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report native shaping bundle is not deterministic.")
  }
  if (validateFlowDocCanonicalReportNativeShapingBundleV1(bundle, input, raw).status !== "valid") {
    throw new Error("Generated canonical report native shaping bundle is invalid.")
  }

  const bundlePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-native-shaping.v1.json")
  const rawPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-native-shaping-raw.v1.json",
  )
  const qaPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-native-shaping-qa.v1.json",
  )
  for (const path of [bundlePath, rawPath, qaPath]) mkdirSync(dirname(path), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(rawPath, `${JSON.stringify(raw, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify(createQa(bundle), null, 2)}\n`, "utf8")
  return { bundlePath, rawPath, qaPath }
}
