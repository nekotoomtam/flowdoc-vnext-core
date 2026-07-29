import type { VNextTextBlockUnifiedLayoutRootResultV1 } from "../../src/layout/textBlockUnifiedLayoutRootContractV1.js"
import {
  createVNextTextBlockUnifiedLayoutRootV1,
} from "../../src/layout/textBlockUnifiedLayoutRootV1.js"
import {
  acceptedInlineImageEvidenceFixture,
  type InlineImageFlowFixtureOptions,
} from "./textBlockInlineImageFlowV2.js"

export function acceptedUnifiedLayoutRootFixtureV1(
  options: InlineImageFlowFixtureOptions = {},
): Extract<VNextTextBlockUnifiedLayoutRootResultV1, { status: "accepted" }> {
  const source = acceptedInlineImageEvidenceFixture(options)
  const result = createVNextTextBlockUnifiedLayoutRootV1({
    inputAuthority: "core-synthetic-qa-only",
    initialFlow: source.initialFlow,
    evidence: source.evidence,
    spatialEntries: options.entries ?? [],
  })
  if (result.status !== "accepted") throw new Error("unified root fixture blocked")
  return result
}
