import { createHash } from "node:crypto"
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import type { FlowDocCanonicalReportLineBreakingBundleV1 } from "../src/canonicalReportLineBreaking.js"
import type { FlowDocCanonicalReportMeasuredCompositionBundleV1 } from "../src/canonicalReportMeasuredComposition.js"
import type {
  FlowDocCanonicalReportNativeShapingBundleV1,
  FlowDocCanonicalReportNativeShapingFontManifestV1,
} from "../src/canonicalReportNativeShaping.js"
import {
  createFlowDocCanonicalReportPaginationInputsBundleV1,
  createFlowDocCanonicalReportPaginationInputsPlanV1,
  createFlowDocCanonicalReportPaginationInputsRawEvidenceV1,
  validateFlowDocCanonicalReportPaginationInputsBundleV1,
  type FlowDocCanonicalReportPaginationInputsBundleV1,
} from "../src/canonicalReportPaginationInputs.js"
import type { FlowDocCanonicalReportSectionReconciliationBundleV1 } from "../src/canonicalReportSectionReconciliation.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../src/canonicalReportTableProjection.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

function requireFile(path: string, label: string): string {
  if (!existsSync(path)) throw new Error(`${label} does not exist: ${path}`)
  return path
}

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex")
}

function buildNativeTextTools(repoRoot: string): { shaper: string; segmenter: string } {
  const packageRoot = resolve(repoRoot, "packages/text-engine-rust-wasm")
  const result = spawnSync("cargo", [
    "build",
    "--quiet",
    "--manifest-path",
    resolve(packageRoot, "rust-shaper/Cargo.toml"),
    "--bins",
  ], {
    cwd: packageRoot,
    encoding: "utf8",
  })
  if (result.status !== 0) throw new Error(`generated footer native tools build failed:\n${result.stderr || result.stdout}`)
  const executable = (name: string) => resolve(
    packageRoot,
    "rust-shaper/target/debug",
    process.platform === "win32" ? `${name}.exe` : name,
  )
  return {
    shaper: requireFile(executable("flowdoc-rustybuzz-smoke"), "rustybuzz native shaper"),
    segmenter: requireFile(executable("flowdoc-icu4x-line-segmenter"), "ICU4X native line segmenter"),
  }
}

function executeFooter(
  repoRoot: string,
  tools: { shaper: string; segmenter: string },
  plan: ReturnType<typeof createFlowDocCanonicalReportPaginationInputsPlanV1>,
) {
  const native = plan.generatedFooter.nativeExecution
  const fontPath = requireFile(resolve(repoRoot, native.fontAssetPath), native.fontId)
  const actualHash = sha256File(fontPath)
  if (actualHash !== native.fontSha256) throw new Error(`generated footer font hash mismatch: ${actualHash}`)
  const shape = spawnSync(tools.shaper, [fontPath, native.renderedText, native.fontId], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  })
  if (shape.status !== 0) throw new Error(`generated footer shaping failed:\n${shape.stderr || shape.stdout}`)
  const shapeOutput = JSON.parse(shape.stdout)
  shapeOutput.fontPath = native.fontAssetPath
  const segment = spawnSync(tools.segmenter, [native.renderedText], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  })
  if (segment.status !== 0) throw new Error(`generated footer segmentation failed:\n${segment.stderr || segment.stdout}`)
  return { shapeOutput, segmentOutput: JSON.parse(segment.stdout) }
}

function createQa(bundle: FlowDocCanonicalReportPaginationInputsBundleV1) {
  const byFamily = ["text-flow", "table-flow", "media-flow"].map((family) => ({
    family,
    inputCount: bundle.familyPaginationInputs.filter((input) => input.family === family).length,
    uniqueMeasurementOwnerCount: new Set(bundle.familyPaginationInputs
      .filter((input) => input.family === family)
      .map((input) => input.measurementOwnerFingerprint)).size,
    initialCursorCount: bundle.familyPaginationInputs.filter((input) => input.family === family).length,
  }))
  const footer = bundle.generatedFooterMeasurement
  return {
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2c-i-canonical-report-pagination-inputs-qa-v1",
    phaseId: bundle.phaseId,
    status: "accepted-family-inputs-and-footer-capacity-proof-pagination-not-run",
    sourceFingerprints: {
      projection: bundle.sourceProjectionFingerprint,
      nativeShaping: bundle.sourceNativeShapingFingerprint,
      lineBreaking: bundle.sourceLineBreakingFingerprint,
      measuredComposition: bundle.sourceMeasuredCompositionFingerprint,
      sectionReconciliation: bundle.sourceSectionReconciliationFingerprint,
      fontManifest: bundle.sourceFontManifestFingerprint,
      rawEvidence: bundle.sourceRawEvidenceFingerprint,
    },
    planFingerprint: bundle.planFingerprint,
    bundleFingerprint: bundle.bundleFingerprint,
    coreCompositionManifestFingerprint: bundle.coreCompositionManifest.fingerprint,
    byFamily,
    generatedFooter: {
      sourceSectionId: footer.sourceSectionId,
      zoneId: footer.zoneId,
      textBlockId: footer.textBlockId,
      pageNumberInlineId: footer.pageNumberInlineId,
      renderedCapacitySample: footer.measurementRequest.renderedText,
      capacityDigits: footer.pageNumberPolicy.capacityDigits,
      maximumPageNumber: footer.pageNumberPolicy.maximumPageNumber,
      lineCount: footer.accepted.summary.lineCount,
      widthPt: footer.lineBoxes[0]?.widthPt,
      heightPt: footer.accepted.summary.totalHeightPt,
      reservedHeightPt: footer.reservedHeightPt,
      reservedSlackPt: footer.reservedSlackPt,
      glyphCount: footer.nativeEvidence.glyphCount,
      missingGlyphCount: footer.nativeEvidence.missingGlyphCount,
      evidenceFingerprint: footer.evidenceFingerprint,
    },
    summary: bundle.summary,
    executionGate: {
      status: "pagination-inputs-ready-document-transition-blocked",
      everyBodyRootBound: bundle.summary.familyInputCount === bundle.summary.bodyItemCount,
      everyPlaceholderMeasurementOwnerReplaced:
        bundle.summary.measurementOwnerReplacementCount === bundle.summary.bodyItemCount,
      exactInitialCursorsCreated: true,
      tableHeaderPolicyPinned: "repeat-leading-headers",
      generatedFooterCapacityMeasured: true,
      actualPageNumbersExpanded: false,
      familyPaginationExecuted: false,
      documentCompositionTransitionExecuted: false,
      pageAssignmentExecuted: false,
      pdfRendered: false,
      blockers: bundle.downstreamBlockers,
    },
    ownership: bundle.ownership,
    boundary: bundle.execution,
    nextPhase: "PDF-PILOT-08B-R2C-J bounded document composition transition and pagination execution",
  }
}

export function buildCanonicalReportPaginationInputs(): {
  bundlePath: string
  rawPath: string
  qaPath: string
} {
  const repoRoot = resolve(import.meta.dirname, "../../..")
  const input = {
    projection: readJson<FlowDocCanonicalReportTableProjectionBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-table-projection.v1.json"),
    ),
    nativeShaping: readJson<FlowDocCanonicalReportNativeShapingBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-native-shaping.v1.json"),
    ),
    lineBreaking: readJson<FlowDocCanonicalReportLineBreakingBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-line-breaking.v1.json"),
    ),
    measuredComposition: readJson<FlowDocCanonicalReportMeasuredCompositionBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-measured-composition.v1.json"),
    ),
    sectionReconciliation: readJson<FlowDocCanonicalReportSectionReconciliationBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-section-reconciliation.v1.json"),
    ),
    fontManifest: readJson<FlowDocCanonicalReportNativeShapingFontManifestV1>(
      resolve(repoRoot, "assets/fonts/font-assets.v1.json"),
    ),
  }
  const plan = createFlowDocCanonicalReportPaginationInputsPlanV1(input)
  const tools = buildNativeTextTools(repoRoot)
  const execution = executeFooter(repoRoot, tools, plan)
  const raw = createFlowDocCanonicalReportPaginationInputsRawEvidenceV1(plan, execution)
  const bundle = createFlowDocCanonicalReportPaginationInputsBundleV1(input, raw)
  const rebuilt = createFlowDocCanonicalReportPaginationInputsBundleV1(input, raw)
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report pagination-input bundle is not deterministic.")
  }
  const validation = validateFlowDocCanonicalReportPaginationInputsBundleV1(bundle, input, raw)
  if (validation.status !== "valid") {
    throw new Error(`Generated canonical report pagination-input bundle is invalid: ${JSON.stringify(validation.issues)}`)
  }

  const bundlePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-pagination-inputs.v1.json")
  const rawPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-pagination-inputs-raw.v1.json",
  )
  const qaPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-pagination-inputs-qa.v1.json",
  )
  for (const path of [bundlePath, rawPath, qaPath]) mkdirSync(dirname(path), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(rawPath, `${JSON.stringify(raw, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify(createQa(bundle), null, 2)}\n`, "utf8")
  return { bundlePath, rawPath, qaPath }
}
