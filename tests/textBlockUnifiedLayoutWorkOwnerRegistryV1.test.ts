import { describe, expect, it } from "vitest"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_EVIDENCE_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_FOUNDATION_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_B_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_C_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_D_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_SOURCE_OWNER_ROWS_INTERNAL_V1,
} from "../src/layout/textBlockUnifiedLayoutWorkOwnerRegistryV1.js"

const EXPECTED_80_ROWS = [
  ["admission-authority-lookups", "core-admission", "admission", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["source-coverage-nodes", "core-preflight", "preflight", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["source-coverage-items", "core-preflight", "preflight", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-request-descriptors", "core-preflight", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-context-atoms", "core-materialization", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-material-descriptors", "core-materialization", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-producer-descriptors", "producer", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-runtime-invocations", "producer", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-runtime-input-scalars", "producer", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-glyphs", "producer", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-clusters", "producer", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-breaks", "producer", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-guards", "producer", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-proof-facts", "producer", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-response-facts", "producer", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-acceptance-descriptors", "core-acceptance", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-acceptance-comparisons", "core-acceptance", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["evidence-acceptance-registrations", "core-acceptance", "evidence", "incrementalCandidateWork", "sourceItems", "foundation"],
  ["source-items", "source-tree", "source", "incrementalCandidateWork", "sourceItems", "A"],
  ["source-tree-lookup-nodes", "source-tree", "source", "incrementalCandidateWork", "sourceItems", "A"],
  ["source-tree-path-copy-nodes", "source-tree", "source", "incrementalCandidateWork", "sourceItems", "A"],
  ["source-leaf-slots", "source-tree", "source", "incrementalCandidateWork", "sourceItems", "A"],
  ["source-index-nodes", "source-index", "source", "incrementalCandidateWork", "sourceItems", "A"],
  ["source-index-entries", "source-index", "source", "incrementalCandidateWork", "sourceItems", "A"],
  ["source-index-comparisons", "source-index", "source", "incrementalCandidateWork", "sourceItems", "A"],
  ["source-style-nodes", "source-style", "source", "incrementalCandidateWork", "sourceItems", "A"],
  ["source-style-buckets", "source-style", "source", "incrementalCandidateWork", "sourceItems", "A"],
  ["source-style-entries", "source-style", "source", "incrementalCandidateWork", "sourceItems", "A"],
  ["flow-nodes", "plan-b-flow", "flow", "incrementalCandidateWork", "flowAtoms", "B"],
  ["flow-atoms", "plan-b-flow", "flow", "incrementalCandidateWork", "flowAtoms", "B"],
  ["flow-path-copy-nodes", "plan-b-flow", "flow", "incrementalCandidateWork", "flowAtoms", "B"],
  ["break-lookup-nodes", "plan-b-break", "break", "incrementalCandidateWork", "breakBoundaries", "B"],
  ["break-path-copy-nodes", "plan-b-break", "break", "incrementalCandidateWork", "breakBoundaries", "B"],
  ["break-boundary-entries", "plan-b-break", "break", "incrementalCandidateWork", "breakBoundaries", "B"],
  ["break-groups", "plan-b-break", "break", "incrementalCandidateWork", "breakBoundaries", "B"],
  ["break-created-nodes", "plan-b-break", "break", "incrementalCandidateWork", "breakBoundaries", "B"],
  ["spatial-alias-authority-lookups", "plan-b-spatial", "spatial", "incrementalCandidateWork", "registrations", "B"],
  ["spatial-alias-registrations", "plan-b-spatial", "spatial", "incrementalCandidateWork", "registrations", "B"],
  ["line-seed-lookup-nodes", "plan-c-line", "line", "incrementalCandidateWork", "lines", "C"],
  ["line-tree-lookup-nodes", "plan-c-line", "line", "incrementalCandidateWork", "lines", "C"],
  ["line-break-groups", "plan-c-line", "line", "incrementalCandidateWork", "lines", "C"],
  ["line-flow-atoms", "plan-c-line", "line", "incrementalCandidateWork", "flowAtoms", "C"],
  ["line-placement-atoms", "plan-c-line", "line", "incrementalCandidateWork", "flowAtoms", "C"],
  ["line-source-lookup-nodes", "plan-c-line", "line", "incrementalCandidateWork", "sourceItems", "C"],
  ["line-source-entries", "plan-c-line", "line", "incrementalCandidateWork", "sourceItems", "C"],
  ["line-fragments", "plan-c-line", "line", "incrementalCandidateWork", "lines", "C"],
  ["line-records", "plan-c-line", "line", "incrementalCandidateWork", "lines", "C"],
  ["recomputed-lines", "plan-c-line", "line", "incrementalCandidateWork", "lines", "C"],
  ["line-cover-proof-nodes", "plan-c-line", "line", "incrementalCandidateWork", "lines", "C"],
  ["line-cover-path-nodes", "plan-c-line", "line", "incrementalCandidateWork", "lines", "C"],
  ["line-splice-copied-nodes", "plan-c-line", "line", "incrementalCandidateWork", "lines", "C"],
  ["line-splice-created-nodes", "plan-c-line", "line", "incrementalCandidateWork", "lines", "C"],
  ["reconvergence-summary-nodes", "plan-c-reconvergence", "reconvergence", "incrementalCandidateWork", "lines", "C"],
  ["geometry-recomputed-lines", "plan-c-geometry", "geometry", "incrementalCandidateWork", "lines", "C"],
  ["geometry-fragments", "plan-c-geometry", "geometry", "incrementalCandidateWork", "lines", "C"],
  ["scene-lookup-nodes", "plan-d-scene", "scene", "incrementalCandidateWork", "sceneChunks", "D"],
  ["scene-path-copy-nodes", "plan-d-scene", "scene", "incrementalCandidateWork", "sceneChunks", "D"],
  ["scene-replacement-chunks", "plan-d-scene", "scene", "incrementalCandidateWork", "sceneChunks", "D"],
  ["scene-created-nodes", "plan-d-scene", "scene", "incrementalCandidateWork", "sceneChunks", "D"],
  ["delivery-retain-cover-nodes", "plan-d-delivery", "delivery", "incrementalCandidateWork", "sceneChunks", "D"],
  ["delivery-operations", "plan-d-delivery", "delivery", "incrementalCandidateWork", "sceneChunks", "D"],
  ["atomic-root-authority-lookups", "plan-d-root", "atomic-root", "incrementalCandidateWork", "registrations", "D"],
  ["atomic-root-registrations", "plan-d-root", "atomic-root", "incrementalCandidateWork", "registrations", "D"],
  ["fallback-previous-logical-items", "plan-d-fallback", "fallback", "completeFallbackWork", "logicalItems", "D"],
  ["fallback-complete-logical-items", "plan-d-fallback", "fallback", "completeFallbackWork", "logicalItems", "D"],
  ["fallback-logical-spans", "plan-d-fallback", "fallback", "completeFallbackWork", "logicalItems", "D"],
  ["complete-source-items", "plan-d-complete", "complete", "completeFallbackWork", "sourceItems", "D"],
  ["complete-flow-atoms", "plan-d-complete", "complete", "completeFallbackWork", "flowAtoms", "D"],
  ["complete-break-boundaries", "plan-d-complete", "complete", "completeFallbackWork", "breakBoundaries", "D"],
  ["complete-spatial-entries", "plan-d-complete", "complete", "completeFallbackWork", "registrations", "D"],
  ["complete-lines", "plan-d-complete", "complete", "completeFallbackWork", "lines", "D"],
  ["complete-scene-chunks", "plan-d-complete", "complete", "completeFallbackWork", "sceneChunks", "D"],
  ["complete-delivery-operations", "plan-d-complete", "complete", "completeFallbackWork", "sceneChunks", "D"],
  ["complete-root-registrations", "plan-d-complete", "complete", "completeFallbackWork", "registrations", "D"],
  ["oracle-logical-items", "plan-d-oracle", "oracle", "completeOracleWork", "logicalItems", "D"],
  ["oracle-break-boundaries", "plan-d-oracle", "oracle", "completeOracleWork", "breakBoundaries", "D"],
  ["oracle-lines", "plan-d-oracle", "oracle", "completeOracleWork", "lines", "D"],
  ["oracle-scene-chunks", "plan-d-oracle", "oracle", "completeOracleWork", "sceneChunks", "D"],
  ["oracle-delivery-operations", "plan-d-oracle", "oracle", "completeOracleWork", "sceneChunks", "D"],
  ["oracle-comparisons", "plan-d-oracle", "oracle", "completeOracleWork", "logicalItems", "D"],
] as const

describe("Phase 5B-2 private work-owner topology", () => {
  it("locks the exact ordered 80-row 5B-2 owner topology", () => {
    const rows = VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1
    const expectedUnits = EXPECTED_80_ROWS.map(([unit]) => unit)

    expect(rows).toHaveLength(80)
    expect(rows.map((row) => row.unit)).toEqual(expectedUnits)
    expect(new Set(rows.map((row) => row.unit)).size).toBe(80)
    expect(rows.map((row) => row.firstObservableBoundary))
      .toEqual(expectedUnits.map((unit) => `before-${unit}`))
    expect(rows.map((row) => [
      row.unit,
      row.owner,
      row.stage,
      row.ledger,
      row.exactBase,
      row.activationPlan,
    ])).toEqual(EXPECTED_80_ROWS)
  })

  it("keeps the closed slices at their exact design lengths", () => {
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_FOUNDATION_OWNER_ROWS_INTERNAL_V1)
      .toHaveLength(3)
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_EVIDENCE_OWNER_ROWS_INTERNAL_V1)
      .toHaveLength(15)
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_SOURCE_OWNER_ROWS_INTERNAL_V1)
      .toHaveLength(10)
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_B_OWNER_ROWS_INTERNAL_V1)
      .toHaveLength(10)
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_C_OWNER_ROWS_INTERNAL_V1)
      .toHaveLength(17)
    expect(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_D_OWNER_ROWS_INTERNAL_V1)
      .toHaveLength(25)
    expect(new Set(rowsLedgers())).toEqual(new Set([
      "incrementalCandidateWork",
      "completeFallbackWork",
      "completeOracleWork",
    ]))
  })
})

function rowsLedgers() {
  return VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1
    .map((row) => row.ledger)
}
