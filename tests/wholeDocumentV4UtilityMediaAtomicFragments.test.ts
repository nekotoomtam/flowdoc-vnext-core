import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8")

describe("whole-document v4 Utility/Media atomic fragment publication", () => {
  const doc = read("../docs/WHOLE_DOCUMENT_V4_UTILITY_MEDIA_ATOMIC_FRAGMENTS.md")

  it("publishes explicit flow, atomic image, failure, and ownership policy", () => {
    for (const section of [
      "## Evidence And Public API",
      "## Common Flow Effect",
      "## Atomic Evidence",
      "### Page Break",
      "### Divider",
      "### Spacer",
      "### Block Image",
      "## Atomic Cursor",
      "## Atomic Pagination",
      "## Common Fragment-Window Adapter",
      "## Image Page Policy",
      "## Failure And Recovery",
      "## Scale Evidence",
      "## Responsibility Boundary",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) expect(doc).toContain(section)

    expect(doc).toContain("never auto-scale, crop, split, decode, or render")
    expect(doc).toContain("intentionalBlankWhenPageEmpty=true")
    expect(doc).toContain("1,000 independent Spacer nodes")
    expect(doc).toContain("Columns, Table, and TOC do not yet emit common windows")
  })

  it("keeps Phase 369 and the family-adapter readiness direction discoverable", () => {
    const index = read("../src/index.ts")
    expect(index).toContain('export * from "./pagination/atomicBlockV4Evidence.js"')
    expect(index).toContain('export * from "./pagination/atomicBlockV4Pagination.js"')
    expect(index).toContain('export * from "./composition/atomicBlockFragmentWindowV1.js"')
    expect(read("../README.md")).toContain("Phase 369 adds Utility/Media atomic common windows")
    expect(read("../docs/CROSS_REPO_OPERATING_MAP.md")).toContain("Phase 369 adds Utility/Media atomic evidence")
    expect(read("../docs/PHASE_LEDGER.md")).toContain("## Phase 369 Utility And Media V4 Atomic Fragment Contracts")
    expect(doc).toContain("Open the Columns/Table/TOC Common Adapter Readiness Lock")
  })
})
