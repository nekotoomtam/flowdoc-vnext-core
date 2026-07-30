import { createVNextCompactFingerprint } from "../../src/fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../../src/fingerprint/canonicalJson.js"
import type {
  VNextTextBlockUnifiedLayoutRootBuildInputV2,
} from "../../src/layout/textBlockUnifiedLayoutRootContractV2.js"
import {
  createVNextTextBlockUnifiedLayoutRootCompleteInternalV2,
} from "../../src/layout/textBlockUnifiedLayoutRootV2.js"
import type {
  VNextTextBlockUnifiedLayoutWorkPolicyV1,
} from "../../src/layout/textBlockUnifiedLayoutWorkPolicyV1.js"
import {
  acceptedInlineImageEvidenceFixture,
  type InlineImageFlowFixtureOptions,
} from "./textBlockInlineImageFlowV2.js"

const workPolicyFacts = {
  source: "vnext-text-block-unified-layout-work-policy-v1" as const,
  contractVersion: 1 as const,
  checkpoint: "5B-1" as const,
  stages: Object.freeze([]),
}

export const ROOT_V2_TEST_WORK_POLICY:
VNextTextBlockUnifiedLayoutWorkPolicyV1 = Object.freeze({
  ...workPolicyFacts,
  fingerprint: createVNextCompactFingerprint(
    stringifyVNextCanonicalJson(workPolicyFacts),
  ),
})

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
