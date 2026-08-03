import {
  createVNextTextBlockUnifiedLayoutRoot5B2CompleteInternalV1,
} from "../../src/layout/textBlockUnifiedLayoutRootV2.js"
import {
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
} from "../../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  unifiedLayoutRootBuildInputFixtureV2,
} from "./textBlockUnifiedLayoutRootV2.js"

export function admitted5B2RootFixture(input: Parameters<
  typeof unifiedLayoutRootBuildInputFixtureV2
>[0] = {}) {
  const result = createVNextTextBlockUnifiedLayoutRoot5B2CompleteInternalV1({
    buildInput: unifiedLayoutRootBuildInputFixtureV2(input),
    constructionKind: "complete-bootstrap",
    workPolicy:
      VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1,
  })
  if (result.status !== "accepted") {
    throw new Error(`5B-2 Root fixture blocked: ${JSON.stringify(result.issues)}`)
  }
  return result.root
}

export const FIVE_B2_TEST_POLICY =
  VNEXT_TEXT_BLOCK_UNIFIED_LAYOUT_WORK_POLICY_5B2_CALIBRATION_TEST_ONLY_INTERNAL_V1
