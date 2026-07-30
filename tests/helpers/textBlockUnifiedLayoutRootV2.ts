import type {
  VNextTextBlockUnifiedLayoutRootBuildInputV2,
} from "../../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import {
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
} from "../../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1,
} from "../../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  acceptedInlineImageEvidenceFixture,
  type InlineImageFlowFixtureOptions,
} from "./textBlockInlineImageFlowV2.js"

export const ROOT_V2_TEST_WORK_POLICY =
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B1_V1

export function unifiedLayoutRootBuildInputFixtureV2(
  options: InlineImageFlowFixtureOptions = {},
): VNextTextBlockUnifiedLayoutRootBuildInputV2 {
  const source = acceptedInlineImageEvidenceFixture(options)
  return {
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: options.entries ?? [],
  }
}

export function acceptedUnifiedLayoutRootFixtureV2(
  options: InlineImageFlowFixtureOptions = {},
) {
  const input = unifiedLayoutRootBuildInputFixtureV2(options)
  const result = createVNextTextBlockUnifiedLayoutRootCompleteInternalV2(
    input,
    ROOT_V2_TEST_WORK_POLICY,
  )
  if (result.status !== "accepted") {
    throw new Error(`Root V2 fixture blocked: ${JSON.stringify(result.issues)}`)
  }
  return { ...result, input }
}
