import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import type { FlowDocCanonicalReportLineBreakingBundleV1 } from "../src/canonicalReportLineBreaking.js"
import {
  createFlowDocCanonicalReportMeasuredCompositionBundleV1,
  createFlowDocCanonicalReportMeasuredCompositionPlanV1,
  validateFlowDocCanonicalReportMeasuredCompositionBundleV1,
  type FlowDocCanonicalReportMeasuredCompositionBundleV1,
} from "../src/canonicalReportMeasuredComposition.js"
import type { FlowDocCanonicalReportNativeShapingBundleV1 } from "../src/canonicalReportNativeShaping.js"
import type { FlowDocCanonicalReportTableProjectionBundleV1 } from "../src/canonicalReportTableProjection.js"

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function createQa(bundle: FlowDocCanonicalReportMeasuredCompositionBundleV1) {
  const byZone = bundle.zoneFlows.map((flow) => ({
    sectionId: flow.sectionId,
    zoneRole: flow.zoneRole,
    flowNodeCount: flow.entries.length,
    readyNodeCount: flow.readyNodeCount,
    deferredNodeCount: flow.deferredNodeCount,
    naturalHeightWithoutSpacingPt: flow.naturalHeightWithoutSpacingPt,
    interBlockSpacing: flow.interBlockSpacing,
    coordinates: flow.coordinates,
  }))
  const byTable = bundle.preparedTables.map((table) => ({
    projectionId: table.projectionId,
    collectionFieldKey: table.collectionFieldKey,
    tableId: table.tableId,
    rowCount: table.summary.rowCount,
    authoredRowCount: table.summary.authoredRowCount,
    materializedRowCount: table.summary.materializedRowCount,
    cellCount: table.summary.cellCount,
    textLineCandidateCount: table.summary.textLineCandidateCount,
    multiLineCellCount: table.summary.multiLineCellCount,
    naturalTableHeightPt: table.summary.naturalTableHeightPt,
    minimumNaturalRowHeightPt: table.summary.minimumNaturalRowHeightPt,
    maximumNaturalRowHeightPt: table.summary.maximumNaturalRowHeightPt,
    preparedRowsFingerprintSha256: sha256(table.preparedRows.fingerprint),
  }))
  const tallestRows = bundle.preparedTables
    .flatMap((table) => table.naturalRows.map((row) => ({
      projectionId: table.projectionId,
      tableId: table.tableId,
      rowIndex: row.rowIndex,
      rowIdentity: row.rowIdentity,
      role: row.role,
      naturalWholeRowHeightPt: row.naturalWholeRowHeightPt,
      maximumCellOuterHeightPt: row.maximumCellOuterHeightPt,
      multiLineCellCount: row.multiLineCellCount,
      tallestSourceCellIds: row.tallestSourceCellIds,
    })))
    .sort((left, right) => (
      right.naturalWholeRowHeightPt - left.naturalWholeRowHeightPt
      || left.projectionId.localeCompare(right.projectionId)
      || left.rowIndex - right.rowIndex
    ))
    .slice(0, 12)
  return {
    qaVersion: 1,
    qaId: "pdf-pilot-08b-r2c-f-canonical-report-measured-composition-qa-v1",
    phaseId: bundle.phaseId,
    status: "accepted-natural-block-and-prepared-table-row-evidence-only",
    sourceFingerprints: {
      projection: bundle.sourceProjectionFingerprint,
      nativeShaping: bundle.sourceNativeShapingFingerprint,
      lineBreaking: bundle.sourceLineBreakingFingerprint,
    },
    planFingerprint: bundle.planFingerprint,
    bundleFingerprint: bundle.bundleFingerprint,
    byZone,
    byTable,
    tallestRows,
    summary: bundle.summary,
    executionGate: {
      status: "natural-composition-evidence-accepted-vertical-placement-blocked",
      everyConsumerAcceptedByCore:
        bundle.summary.sourceConsumerCount === bundle.summary.coreAcceptedConsumerCount,
      documentBlocksMeasured: true,
      fixedImageFramesDerived: true,
      tableTextFragmentsAccepted: true,
      tableCellsPrepared: true,
      tableRowsPrepared: true,
      orderedZoneFlowInventoried: true,
      interBlockSpacingBound: false,
      coordinatesAssigned: false,
      paginationExecuted: false,
      pdfRendered: false,
      blockers: bundle.downstreamBlockers,
    },
    ownership: bundle.ownership,
    boundary: bundle.execution,
    nextPhase: "PDF-PILOT-08B-R2C-G vertical flow spacing and page-capacity composition",
  }
}

export function buildCanonicalReportMeasuredComposition(): {
  bundlePath: string
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
  }
  const plan = createFlowDocCanonicalReportMeasuredCompositionPlanV1(input)
  const bundle = createFlowDocCanonicalReportMeasuredCompositionBundleV1(input)
  const rebuilt = createFlowDocCanonicalReportMeasuredCompositionBundleV1(input)
  if (bundle.planFingerprint !== plan.planFingerprint) {
    throw new Error("Canonical report measured-composition plan identity drifted.")
  }
  if (JSON.stringify(bundle) !== JSON.stringify(rebuilt)) {
    throw new Error("Canonical report measured-composition bundle is not deterministic.")
  }
  const validation = validateFlowDocCanonicalReportMeasuredCompositionBundleV1(bundle, input)
  if (validation.status !== "valid") {
    throw new Error(`Generated canonical report measured-composition bundle is invalid: ${JSON.stringify(validation.issues)}`)
  }

  const bundlePath = resolve(
    repoRoot,
    "fixtures/pdf-pilot-canonical-report-measured-composition.v1.json",
  )
  const qaPath = resolve(
    repoRoot,
    "packages/pdf-renderer-pilot/fixtures/canonical-report-measured-composition-qa.v1.json",
  )
  for (const path of [bundlePath, qaPath]) mkdirSync(dirname(path), { recursive: true })
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8")
  writeFileSync(qaPath, `${JSON.stringify(createQa(bundle), null, 2)}\n`, "utf8")
  return { bundlePath, qaPath }
}
