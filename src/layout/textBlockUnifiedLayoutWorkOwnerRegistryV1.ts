import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2,
} from "./textBlockUnifiedLayoutEvidenceWorkOwnerRegistryV2.js"

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_UNIT_IDS_INTERNAL_V1 =
  Object.freeze([
    "admission-authority-lookups",
    "source-coverage-nodes",
    "source-coverage-items",
    "evidence-request-descriptors",
    "evidence-context-atoms",
    "evidence-material-descriptors",
    "evidence-producer-descriptors",
    "evidence-runtime-invocations",
    "evidence-runtime-input-scalars",
    "evidence-glyphs",
    "evidence-clusters",
    "evidence-breaks",
    "evidence-guards",
    "evidence-proof-facts",
    "evidence-response-facts",
    "evidence-acceptance-descriptors",
    "evidence-acceptance-comparisons",
    "evidence-acceptance-registrations",
    "source-items",
    "source-tree-lookup-nodes",
    "source-tree-path-copy-nodes",
    "source-leaf-slots",
    "source-index-nodes",
    "source-index-entries",
    "source-index-comparisons",
    "source-style-nodes",
    "source-style-buckets",
    "source-style-entries",
    "flow-nodes",
    "flow-atoms",
    "flow-path-copy-nodes",
    "break-lookup-nodes",
    "break-path-copy-nodes",
    "break-boundary-entries",
    "break-groups",
    "break-created-nodes",
    "spatial-alias-authority-lookups",
    "spatial-alias-registrations",
    "line-seed-lookup-nodes",
    "line-tree-lookup-nodes",
    "line-break-groups",
    "line-flow-atoms",
    "line-placement-atoms",
    "line-source-lookup-nodes",
    "line-source-entries",
    "line-fragments",
    "line-records",
    "recomputed-lines",
    "line-cover-proof-nodes",
    "line-cover-path-nodes",
    "line-splice-copied-nodes",
    "line-splice-created-nodes",
    "reconvergence-summary-nodes",
    "geometry-recomputed-lines",
    "geometry-fragments",
    "scene-lookup-nodes",
    "scene-path-copy-nodes",
    "scene-replacement-chunks",
    "scene-created-nodes",
    "delivery-retain-cover-nodes",
    "delivery-operations",
    "atomic-root-authority-lookups",
    "atomic-root-registrations",
    "fallback-previous-logical-items",
    "fallback-complete-logical-items",
    "fallback-logical-spans",
    "complete-source-items",
    "complete-flow-atoms",
    "complete-break-boundaries",
    "complete-spatial-entries",
    "complete-lines",
    "complete-scene-chunks",
    "complete-delivery-operations",
    "complete-root-registrations",
    "oracle-logical-items",
    "oracle-break-boundaries",
    "oracle-lines",
    "oracle-scene-chunks",
    "oracle-delivery-operations",
    "oracle-comparisons",
  ] as const)

export type VNextTextBlockUnifiedLayout5B2WorkUnitInternalV1 =
  typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_UNIT_IDS_INTERNAL_V1[number]

export type VNextTextBlockUnifiedLayout5B2SourceWorkUnitInternalV1 =
  | "source-items"
  | "source-tree-lookup-nodes"
  | "source-tree-path-copy-nodes"
  | "source-leaf-slots"
  | "source-index-nodes"
  | "source-index-entries"
  | "source-index-comparisons"
  | "source-style-nodes"
  | "source-style-buckets"
  | "source-style-entries"

export interface VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1 {
  readonly unit: VNextTextBlockUnifiedLayout5B2WorkUnitInternalV1
  readonly owner:
    | "core-admission" | "core-preflight" | "core-materialization"
    | "producer" | "core-acceptance" | "source-tree"
    | "source-index" | "source-style" | "plan-b-flow"
    | "plan-b-break" | "plan-b-spatial" | "plan-c-line"
    | "plan-c-reconvergence" | "plan-c-geometry" | "plan-d-scene"
    | "plan-d-delivery" | "plan-d-root" | "plan-d-fallback"
    | "plan-d-complete" | "plan-d-oracle"
  readonly stage:
    | "admission" | "preflight" | "evidence" | "source" | "flow"
    | "break" | "spatial" | "line" | "reconvergence" | "geometry"
    | "scene" | "delivery" | "atomic-root" | "fallback"
    | "complete" | "oracle"
  readonly ledger:
    | "incrementalCandidateWork"
    | "completeFallbackWork"
    | "completeOracleWork"
  readonly exactBase:
    | "sourceItems" | "flowAtoms" | "breakBoundaries" | "lines"
    | "sceneChunks" | "logicalItems" | "registrations"
  readonly firstObservableBoundary:
    `before-${VNextTextBlockUnifiedLayout5B2WorkUnitInternalV1}`
  readonly activationPlan: "foundation" | "A" | "B" | "C" | "D"
}

const row = <U extends VNextTextBlockUnifiedLayout5B2WorkUnitInternalV1>(
  input: Omit<VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1,
    "unit" | "firstObservableBoundary"> & { readonly unit: U },
) => Object.freeze({
  ...input,
  firstObservableBoundary: `before-${input.unit}` as `before-${U}`,
})

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_FOUNDATION_OWNER_ROWS_INTERNAL_V1 =
  Object.freeze([
    row({ unit: "admission-authority-lookups", owner: "core-admission", stage: "admission", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "foundation" }),
    row({ unit: "source-coverage-nodes", owner: "core-preflight", stage: "preflight", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "foundation" }),
    row({ unit: "source-coverage-items", owner: "core-preflight", stage: "preflight", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "foundation" }),
  ] as const)

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_EVIDENCE_OWNER_ROWS_INTERNAL_V1 =
  Object.freeze(VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2.map(
    (evidence) => row({
      ...evidence,
      unit: evidence.unit as VNextTextBlockUnifiedLayout5B2WorkUnitInternalV1,
      exactBase: "sourceItems",
      activationPlan: "foundation",
    }),
  ))

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_SOURCE_OWNER_ROWS_INTERNAL_V1 =
  Object.freeze([
    row({ unit: "source-items", owner: "source-tree", stage: "source", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "A" }),
    row({ unit: "source-tree-lookup-nodes", owner: "source-tree", stage: "source", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "A" }),
    row({ unit: "source-tree-path-copy-nodes", owner: "source-tree", stage: "source", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "A" }),
    row({ unit: "source-leaf-slots", owner: "source-tree", stage: "source", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "A" }),
    row({ unit: "source-index-nodes", owner: "source-index", stage: "source", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "A" }),
    row({ unit: "source-index-entries", owner: "source-index", stage: "source", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "A" }),
    row({ unit: "source-index-comparisons", owner: "source-index", stage: "source", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "A" }),
    row({ unit: "source-style-nodes", owner: "source-style", stage: "source", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "A" }),
    row({ unit: "source-style-buckets", owner: "source-style", stage: "source", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "A" }),
    row({ unit: "source-style-entries", owner: "source-style", stage: "source", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "A" }),
  ] as const)

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_B_OWNER_ROWS_INTERNAL_V1 =
  Object.freeze([
    row({ unit: "flow-nodes", owner: "plan-b-flow", stage: "flow", ledger: "incrementalCandidateWork", exactBase: "flowAtoms", activationPlan: "B" }),
    row({ unit: "flow-atoms", owner: "plan-b-flow", stage: "flow", ledger: "incrementalCandidateWork", exactBase: "flowAtoms", activationPlan: "B" }),
    row({ unit: "flow-path-copy-nodes", owner: "plan-b-flow", stage: "flow", ledger: "incrementalCandidateWork", exactBase: "flowAtoms", activationPlan: "B" }),
    row({ unit: "break-lookup-nodes", owner: "plan-b-break", stage: "break", ledger: "incrementalCandidateWork", exactBase: "breakBoundaries", activationPlan: "B" }),
    row({ unit: "break-path-copy-nodes", owner: "plan-b-break", stage: "break", ledger: "incrementalCandidateWork", exactBase: "breakBoundaries", activationPlan: "B" }),
    row({ unit: "break-boundary-entries", owner: "plan-b-break", stage: "break", ledger: "incrementalCandidateWork", exactBase: "breakBoundaries", activationPlan: "B" }),
    row({ unit: "break-groups", owner: "plan-b-break", stage: "break", ledger: "incrementalCandidateWork", exactBase: "breakBoundaries", activationPlan: "B" }),
    row({ unit: "break-created-nodes", owner: "plan-b-break", stage: "break", ledger: "incrementalCandidateWork", exactBase: "breakBoundaries", activationPlan: "B" }),
    row({ unit: "spatial-alias-authority-lookups", owner: "plan-b-spatial", stage: "spatial", ledger: "incrementalCandidateWork", exactBase: "registrations", activationPlan: "B" }),
    row({ unit: "spatial-alias-registrations", owner: "plan-b-spatial", stage: "spatial", ledger: "incrementalCandidateWork", exactBase: "registrations", activationPlan: "B" }),
  ] as const)

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_C_OWNER_ROWS_INTERNAL_V1 =
  Object.freeze([
    row({ unit: "line-seed-lookup-nodes", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
    row({ unit: "line-tree-lookup-nodes", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
    row({ unit: "line-break-groups", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
    row({ unit: "line-flow-atoms", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "flowAtoms", activationPlan: "C" }),
    row({ unit: "line-placement-atoms", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "flowAtoms", activationPlan: "C" }),
    row({ unit: "line-source-lookup-nodes", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "C" }),
    row({ unit: "line-source-entries", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "sourceItems", activationPlan: "C" }),
    row({ unit: "line-fragments", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
    row({ unit: "line-records", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
    row({ unit: "recomputed-lines", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
    row({ unit: "line-cover-proof-nodes", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
    row({ unit: "line-cover-path-nodes", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
    row({ unit: "line-splice-copied-nodes", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
    row({ unit: "line-splice-created-nodes", owner: "plan-c-line", stage: "line", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
    row({ unit: "reconvergence-summary-nodes", owner: "plan-c-reconvergence", stage: "reconvergence", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
    row({ unit: "geometry-recomputed-lines", owner: "plan-c-geometry", stage: "geometry", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
    row({ unit: "geometry-fragments", owner: "plan-c-geometry", stage: "geometry", ledger: "incrementalCandidateWork", exactBase: "lines", activationPlan: "C" }),
  ] as const)

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_D_OWNER_ROWS_INTERNAL_V1 =
  Object.freeze([
    row({ unit: "scene-lookup-nodes", owner: "plan-d-scene", stage: "scene", ledger: "incrementalCandidateWork", exactBase: "sceneChunks", activationPlan: "D" }),
    row({ unit: "scene-path-copy-nodes", owner: "plan-d-scene", stage: "scene", ledger: "incrementalCandidateWork", exactBase: "sceneChunks", activationPlan: "D" }),
    row({ unit: "scene-replacement-chunks", owner: "plan-d-scene", stage: "scene", ledger: "incrementalCandidateWork", exactBase: "sceneChunks", activationPlan: "D" }),
    row({ unit: "scene-created-nodes", owner: "plan-d-scene", stage: "scene", ledger: "incrementalCandidateWork", exactBase: "sceneChunks", activationPlan: "D" }),
    row({ unit: "delivery-retain-cover-nodes", owner: "plan-d-delivery", stage: "delivery", ledger: "incrementalCandidateWork", exactBase: "sceneChunks", activationPlan: "D" }),
    row({ unit: "delivery-operations", owner: "plan-d-delivery", stage: "delivery", ledger: "incrementalCandidateWork", exactBase: "sceneChunks", activationPlan: "D" }),
    row({ unit: "atomic-root-authority-lookups", owner: "plan-d-root", stage: "atomic-root", ledger: "incrementalCandidateWork", exactBase: "registrations", activationPlan: "D" }),
    row({ unit: "atomic-root-registrations", owner: "plan-d-root", stage: "atomic-root", ledger: "incrementalCandidateWork", exactBase: "registrations", activationPlan: "D" }),
    row({ unit: "fallback-previous-logical-items", owner: "plan-d-fallback", stage: "fallback", ledger: "completeFallbackWork", exactBase: "logicalItems", activationPlan: "D" }),
    row({ unit: "fallback-complete-logical-items", owner: "plan-d-fallback", stage: "fallback", ledger: "completeFallbackWork", exactBase: "logicalItems", activationPlan: "D" }),
    row({ unit: "fallback-logical-spans", owner: "plan-d-fallback", stage: "fallback", ledger: "completeFallbackWork", exactBase: "logicalItems", activationPlan: "D" }),
    row({ unit: "complete-source-items", owner: "plan-d-complete", stage: "complete", ledger: "completeFallbackWork", exactBase: "sourceItems", activationPlan: "D" }),
    row({ unit: "complete-flow-atoms", owner: "plan-d-complete", stage: "complete", ledger: "completeFallbackWork", exactBase: "flowAtoms", activationPlan: "D" }),
    row({ unit: "complete-break-boundaries", owner: "plan-d-complete", stage: "complete", ledger: "completeFallbackWork", exactBase: "breakBoundaries", activationPlan: "D" }),
    row({ unit: "complete-spatial-entries", owner: "plan-d-complete", stage: "complete", ledger: "completeFallbackWork", exactBase: "registrations", activationPlan: "D" }),
    row({ unit: "complete-lines", owner: "plan-d-complete", stage: "complete", ledger: "completeFallbackWork", exactBase: "lines", activationPlan: "D" }),
    row({ unit: "complete-scene-chunks", owner: "plan-d-complete", stage: "complete", ledger: "completeFallbackWork", exactBase: "sceneChunks", activationPlan: "D" }),
    row({ unit: "complete-delivery-operations", owner: "plan-d-complete", stage: "complete", ledger: "completeFallbackWork", exactBase: "sceneChunks", activationPlan: "D" }),
    row({ unit: "complete-root-registrations", owner: "plan-d-complete", stage: "complete", ledger: "completeFallbackWork", exactBase: "registrations", activationPlan: "D" }),
    row({ unit: "oracle-logical-items", owner: "plan-d-oracle", stage: "oracle", ledger: "completeOracleWork", exactBase: "logicalItems", activationPlan: "D" }),
    row({ unit: "oracle-break-boundaries", owner: "plan-d-oracle", stage: "oracle", ledger: "completeOracleWork", exactBase: "breakBoundaries", activationPlan: "D" }),
    row({ unit: "oracle-lines", owner: "plan-d-oracle", stage: "oracle", ledger: "completeOracleWork", exactBase: "lines", activationPlan: "D" }),
    row({ unit: "oracle-scene-chunks", owner: "plan-d-oracle", stage: "oracle", ledger: "completeOracleWork", exactBase: "sceneChunks", activationPlan: "D" }),
    row({ unit: "oracle-delivery-operations", owner: "plan-d-oracle", stage: "oracle", ledger: "completeOracleWork", exactBase: "sceneChunks", activationPlan: "D" }),
    row({ unit: "oracle-comparisons", owner: "plan-d-oracle", stage: "oracle", ledger: "completeOracleWork", exactBase: "logicalItems", activationPlan: "D" }),
  ] as const)

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1 =
  Object.freeze([
    ...VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_FOUNDATION_OWNER_ROWS_INTERNAL_V1,
    ...VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_EVIDENCE_OWNER_ROWS_INTERNAL_V1,
    ...VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_SOURCE_OWNER_ROWS_INTERNAL_V1,
    ...VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_B_OWNER_ROWS_INTERNAL_V1,
    ...VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_C_OWNER_ROWS_INTERNAL_V1,
    ...VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_D_OWNER_ROWS_INTERNAL_V1,
  ] as const satisfies readonly VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1[])

const allowedLedgers = new Set<VNextTextBlockUnifiedLayout5B2WorkOwnerRowInternalV1["ledger"]>([
  "incrementalCandidateWork",
  "completeFallbackWork",
  "completeOracleWork",
])

const ownerSlices = [
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_FOUNDATION_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_EVIDENCE_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_SOURCE_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_B_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_C_OWNER_ROWS_INTERNAL_V1,
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_PLAN_D_OWNER_ROWS_INTERNAL_V1,
] as const

if (ownerSlices.some((slice) => slice.length === 0)) {
  throw new Error("5B-2 owner slices must not be empty")
}
if (VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1.length
  !== VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_UNIT_IDS_INTERNAL_V1.length) {
  throw new Error("5B-2 owner row and unit-ID counts differ")
}
const ownerUnits = VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1
  .map((entry) => entry.unit)
if (new Set(ownerUnits).size !== ownerUnits.length) {
  throw new Error("5B-2 owner units must be unique")
}
if (VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_ROWS_INTERNAL_V1.some(
  (entry) => !allowedLedgers.has(entry.ledger),
)) {
  throw new Error("5B-2 owner rows include an unknown ledger")
}
if (ownerUnits.some((unit, index) => (
  unit !== VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2_OWNER_UNIT_IDS_INTERNAL_V1[index]
))) {
  throw new Error("5B-2 owner row order differs from the unit-ID topology")
}
