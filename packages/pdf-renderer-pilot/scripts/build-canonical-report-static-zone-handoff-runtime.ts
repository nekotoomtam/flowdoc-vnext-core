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
import type { FlowDocCanonicalReportPaginationExecutionBundleV1 } from "../src/canonicalReportPaginationExecution.js"
import type { FlowDocCanonicalReportPaginationInputsBundleV1 } from "../src/canonicalReportPaginationInputs.js"
import {
  createFlowDocCanonicalReportStaticZoneHandoffBundleV1,
  createFlowDocCanonicalReportStaticZoneHandoffPlanV1,
  createFlowDocCanonicalReportStaticZoneRawEvidenceV1,
  validateFlowDocCanonicalReportStaticZoneHandoffBundleV1,
  type FlowDocCanonicalReportStaticZoneHandoffBundleV1,
  type FlowDocCanonicalReportStaticZoneRawEvidenceV1,
} from "../src/canonicalReportStaticZoneHandoff.js"
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
  if (result.status !== 0) throw new Error(`static-zone native tools build failed:\n${result.stderr || result.stdout}`)
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

function executeFooters(
  repoRoot: string,
  tools: { shaper: string; segmenter: string },
  plan: ReturnType<typeof createFlowDocCanonicalReportStaticZoneHandoffPlanV1>,
): FlowDocCanonicalReportStaticZoneRawEvidenceV1["executions"] {
  return plan.actualFooters.map((footer) => {
    const native = footer.nativeExecution
    const fontPath = requireFile(resolve(repoRoot, native.fontAssetPath), native.fontId)
    const actualHash = sha256File(fontPath)
    if (actualHash !== native.fontSha256) throw new Error(`static-zone footer font hash mismatch: ${actualHash}`)
    const shape = spawnSync(tools.shaper, [fontPath, native.renderedText, native.fontId], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    })
    if (shape.status !== 0) throw new Error(`static-zone footer shaping failed on page ${footer.pageNumber}:\n${shape.stderr || shape.stdout}`)
    const shapeOutput = JSON.parse(shape.stdout)
    shapeOutput.fontPath = native.fontAssetPath
    const segment = spawnSync(tools.segmenter, [native.renderedText], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    })
    if (segment.status !== 0) throw new Error(`static-zone footer segmentation failed on page ${footer.pageNumber}:\n${segment.stderr || segment.stdout}`)
    return {
      pageIndex: footer.pageIndex,
      pageNumber: footer.pageNumber,
      shapeRequestId: native.shapeRequestId,
      shapeOutput,
      segmentRequestId: native.segmentRequestId,
      segmentOutput: JSON.parse(segment.stdout),
    }
  })
}

function createQa(bundle: FlowDocCanonicalReportStaticZoneHandoffBundleV1) {
  return {
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2c-k-canonical-report-static-zone-handoff-qa-v1",
    phaseId: bundle.phaseId,
    status: "accepted-actual-page-numbers-and-static-zone-renderer-handoff-body-pending",
    sourceFingerprints: {
      projection: bundle.sourceProjectionFingerprint,
      nativeShaping: bundle.sourceNativeShapingFingerprint,
      lineBreaking: bundle.sourceLineBreakingFingerprint,
      measuredComposition: bundle.sourceMeasuredCompositionFingerprint,
      paginationInputs: bundle.sourcePaginationInputsFingerprint,
      paginationExecution: bundle.sourcePaginationExecutionFingerprint,
      pagePlan: bundle.sourcePagePlanFingerprint,
      fontManifest: bundle.sourceFontManifestFingerprint,
      rawEvidence: bundle.sourceRawEvidenceFingerprint,
    },
    planFingerprint: bundle.planFingerprint,
    bundleFingerprint: bundle.bundleFingerprint,
    measuredDrawContractFingerprint: bundle.rendererHandoff.measuredDrawContract.fingerprint,
    placementPolicy: bundle.placementPolicy,
    summary: bundle.summary,
    pages: bundle.pages.map((page) => ({
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
      headerText: page.header.renderedText,
      footerText: page.footer.renderedText,
      headerBounds: page.header.paintBounds,
      footerBounds: page.footer.paintBounds,
      headerGlyphCount: page.header.glyphs.length,
      footerGlyphCount: page.footer.glyphs.length,
      footerMeasurementFingerprint: page.footer.acceptedMeasurementFingerprint,
      pageFingerprint: page.pageFingerprint,
    })),
    executionGate: {
      status: "static-zones-consumable-full-document-handoff-blocked",
      authoritativePageCountRetained: bundle.summary.pageCount === 13,
      actualPageNumbersExpanded: bundle.summary.actualPageNumbersExpanded,
      pageSpecificHeaderInstancesBuilt: bundle.summary.headerInstanceCount === bundle.summary.pageCount,
      pageSpecificFooterInstancesBuilt: bundle.summary.footerInstanceCount === bundle.summary.pageCount,
      footerCapacityHeld: bundle.summary.footerCapacityHeld,
      missingGlyphCount: bundle.summary.missingGlyphCount,
      staticZoneMeasuredDrawContractConsumable: bundle.summary.rendererHandoffConsumable,
      bodyDisplayListBuilt: false,
      fullDocumentMeasuredDrawContractBuilt: false,
      pdfRendered: false,
      blockers: bundle.downstreamBlockers,
    },
    ownership: bundle.ownership,
    boundary: bundle.execution,
    nextPhase: "PDF-PILOT-08B-R2C-L measured body display list and full renderer contract merge",
  }
}

export function buildCanonicalReportStaticZoneHandoff(): {
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
    paginationInputs: readJson<FlowDocCanonicalReportPaginationInputsBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-pagination-inputs.v1.json"),
    ),
    paginationExecution: readJson<FlowDocCanonicalReportPaginationExecutionBundleV1>(
      resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-pagination-execution.v1.json"),
    ),
    fontManifest: readJson<FlowDocCanonicalReportNativeShapingFontManifestV1>(
      resolve(repoRoot, "assets/fonts/font-assets.v1.json"),
    ),
  }
  const plan = createFlowDocCanonicalReportStaticZoneHandoffPlanV1(input)
  const tools = buildNativeTextTools(repoRoot)
  const executions = executeFooters(repoRoot, tools, plan)
  const raw = createFlowDocCanonicalReportStaticZoneRawEvidenceV1(plan, executions)
  const bundle = createFlowDocCanonicalReportStaticZoneHandoffBundleV1(input, raw)
  const rebuilt = createFlowDocCanonicalReportStaticZoneHandoffBundleV1(input, raw)
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report static-zone handoff is not deterministic.")
  }
  const validation = validateFlowDocCanonicalReportStaticZoneHandoffBundleV1(bundle, input, raw)
  if (validation.status !== "valid") {
    throw new Error(`Generated static-zone handoff bundle is invalid: ${JSON.stringify(validation.issues)}`)
  }

  const bundlePath = resolve(repoRoot, "fixtures/pdf-pilot-canonical-report-static-zone-handoff.v1.json")
  const rawPath = resolve(repoRoot, "packages/pdf-renderer-pilot/fixtures/canonical-report-static-zone-raw.v1.json")
  const qaPath = resolve(repoRoot, "packages/pdf-renderer-pilot/fixtures/canonical-report-static-zone-handoff-qa.v1.json")
  for (const path of [bundlePath, rawPath, qaPath]) mkdirSync(dirname(path), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(rawPath, `${JSON.stringify(raw, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify(createQa(bundle), null, 2)}\n`, "utf8")
  return { bundlePath, rawPath, qaPath }
}
