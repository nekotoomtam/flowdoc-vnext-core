import type {
  VNextTextBlockUnifiedLayoutStageUnitV1,
} from "./textBlockUnifiedLayoutTransitionContractV1.js"

export const VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2 =
  Object.freeze([
    { stage: "evidence", unit: "evidence-request-descriptors", owner: "core-preflight", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-context-atoms", owner: "core-materialization", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-material-descriptors", owner: "core-materialization", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-producer-descriptors", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-runtime-invocations", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-runtime-input-scalars", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-glyphs", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-clusters", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-breaks", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-guards", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-proof-facts", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-response-facts", owner: "producer", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-acceptance-descriptors", owner: "core-acceptance", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-acceptance-comparisons", owner: "core-acceptance", ledger: "incrementalCandidateWork" },
    { stage: "evidence", unit: "evidence-acceptance-registrations", owner: "core-acceptance", ledger: "incrementalCandidateWork" },
  ] as const satisfies readonly {
    readonly stage: "evidence"
    readonly unit: VNextTextBlockUnifiedLayoutStageUnitV1
    readonly owner:
      | "core-preflight"
      | "core-materialization"
      | "producer"
      | "core-acceptance"
    readonly ledger: "incrementalCandidateWork"
  }[])

export type VNextTextBlockUnifiedLayout5B2AEvidenceUnitInternalV2 =
  typeof VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_5B2A_EVIDENCE_OWNER_ROWS_INTERNAL_V2[number]["unit"]
