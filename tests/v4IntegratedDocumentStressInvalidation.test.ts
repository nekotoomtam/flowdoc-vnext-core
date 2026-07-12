import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  collectVNextTocV4Semantics,
  compareVNextTocV4Semantics,
  createVNextTablePreparedCellImpactV1,
} from "../src/index.js"
import {
  createV4IntegratedStressSmokeBundle,
  runV4IntegratedStressSmoke,
  type V4IntegratedStressSmokeBundle,
} from "./helpers/v4IntegratedStressSmoke.js"

type SmokeResult = ReturnType<typeof runV4IntegratedStressSmoke>
type LaneName = keyof SmokeResult["lanes"]

function cloneBundle(bundle: V4IntegratedStressSmokeBundle): V4IntegratedStressSmokeBundle {
  return structuredClone(bundle)
}

function changedLanes(before: SmokeResult, after: SmokeResult): LaneName[] {
  return (Object.keys(before.lanes) as LaneName[]).filter((lane) => (
    before.lanes[lane].evidenceFingerprint !== after.lanes[lane].evidenceFingerprint
  ))
}

function mutateHeading(bundle: V4IntegratedStressSmokeBundle): void {
  const title = bundle.document.document.sections[0].nodes.title
  if (title.type !== "text-block" || title.children[0]?.type !== "text") throw new Error("title fixture missing")
  title.children[0].text = "Changed Product Report for "
}

function mutateMeasuredTitle(bundle: V4IntegratedStressSmokeBundle): void {
  bundle.measuredTextByNodeId.title.lines[0].text = "changed-title-line"
}

function mutateColumnsMeasurement(bundle: V4IntegratedStressSmokeBundle): void {
  const measured = bundle.measuredTextByNodeId["summary-left-text"]
  measured.lines[0].heightPt += 5
  measured.summary.totalHeightPt += 5
}

function mutateTableCell(bundle: V4IntegratedStressSmokeBundle): void {
  const row = bundle.preparedTable.rows[1]
  const cell = row.cells[0]
  cell.candidates[0].heightPt = 50
  cell.prefixHeightsPt = [0, 50, 110]
  cell.contentHeightPt = 110
  cell.outerHeightPt = 120
  cell.fingerprint = JSON.stringify([cell.sourceCellId, cell.candidates, cell.prefixHeightsPt])
  row.maximumCellOuterHeightPt = 120
  row.fingerprint = JSON.stringify([row.rowIndex, ...row.cells.map((item) => item.fingerprint)])
  bundle.preparedTable.fingerprint = JSON.stringify(bundle.preparedTable.rows.map((item) => item.fingerprint))
}

describe("v4 integrated document localized invalidation stress", () => {
  it("limits an authored heading edit to TOC evidence and reports exact semantic invalidation", () => {
    const beforeBundle = createV4IntegratedStressSmokeBundle()
    const afterBundle = cloneBundle(beforeBundle)
    mutateHeading(afterBundle)
    const before = runV4IntegratedStressSmoke(beforeBundle)
    const after = runV4IntegratedStressSmoke(afterBundle)

    expect(changedLanes(before, after)).toEqual(["toc"])
    expect(compareVNextTocV4Semantics({
      before: collectVNextTocV4Semantics(beforeBundle.document),
      after: collectVNextTocV4Semantics(afterBundle.document),
    })).toMatchObject({
      status: "changed", affectedTocNodeIds: ["toc-smoke"], affectedHeadingNodeIds: ["title"],
      summary: { labelChangedEntryCount: 1 },
      invalidation: {
        semanticEntries: true, tocMeasurementNodeIds: ["toc-smoke"],
        pagination: true, renderer: true,
        pageReferenceRefresh: "all-entries-in-affected-tocs",
      },
      contracts: { measurement: "not-run", pagination: "not-run", rendering: "not-run" },
    })
    expect(after.blockers).toEqual(before.blockers)
    expect(after.integratedPageCount).toBeNull()
  })

  it.each([
    ["measured Text-block", mutateMeasuredTitle, ["text"]],
    ["Columns measurement", mutateColumnsMeasurement, ["columns"]],
    ["prepared Table cell", mutateTableCell, ["table", "tableRendererFacts"]],
  ] as const)("limits one %s edit to its observed dependent lanes", (_name, mutate, expected) => {
    const baseline = createV4IntegratedStressSmokeBundle()
    const changed = cloneBundle(baseline)
    mutate(changed)
    const before = runV4IntegratedStressSmoke(baseline)
    const after = runV4IntegratedStressSmoke(changed)
    expect(changedLanes(before, after)).toEqual(expected)
    expect(after.blockers).toEqual(before.blockers)
    expect(after.integratedPageCount).toBeNull()
  })

  it("uses the Table impact contract to retain row scope and invalidate measurement through render", () => {
    expect(createVNextTablePreparedCellImpactV1({
      tableId: "detail-table", changeKind: "item-value",
      affectedRows: [{ rowKey: "rowi_smoke_body", sourceCellIds: ["detail-body-cell-a"] }],
    })).toMatchObject({
      status: "ready", scope: "rows", earliestAffectedRowIndex: null,
      affectedRows: [{ rowKey: "rowi_smoke_body", sourceCellIds: ["detail-body-cell-a"] }],
      invalidationLanes: ["measurement", "preparation", "pagination", "render"],
      retainedFacts: { preparedFingerprint: false, measurementEvidence: false },
    })
  })

  it("keeps Phase 362 invalidation evidence and limitations discoverable", () => {
    const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")
    const doc = read("../docs/V4_INTEGRATED_DOCUMENT_STRESS_INVALIDATION_MATRIX.md")
    expect(doc).toContain("authored heading label")
    expect(doc).toContain("prepared Table body-cell height")
    expect(doc).toContain("integratedPageCount=null")
    expect(doc).toContain("## Evidence Fingerprints")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(read("../README.md")).toContain("Phase 362 stresses four localized edits")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 362 proves localized invalidation")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 362 V4 Integrated Document Stress Invalidation Matrix")
  })
})
