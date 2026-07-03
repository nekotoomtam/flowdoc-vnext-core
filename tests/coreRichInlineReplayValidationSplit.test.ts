import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("core rich inline replay validation split", () => {
  it("documents the retained validation helpers and historical compatibility records", () => {
    const doc = readText("docs/CORE_RICH_INLINE_REPLAY_VALIDATION_SPLIT.md")
    const requiredSections = [
      "## Purpose",
      "## Retained Core Contract",
      "## Compatibility Record",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
    ]

    for (const section of requiredSections) {
      expect(doc).toContain(section)
    }

    expect(doc).toContain("createVNextRichInlineReplayPatchValidation")
    expect(doc).toContain("createVNextRichInlineReplayValidation")
    expect(doc).toContain("createVNextRichInlineReplayPatchRecord")
    expect(doc).toContain("createVNextRichInlineSessionPersistenceRecord")
    expect(doc).toContain('storageStatus: "not-written"')
    expect(doc).toContain("removed from source in Phase 246")
  })

  it("keeps the retained helpers public through the existing authoring module export", () => {
    const index = readText("src/index.ts")
    const source = readText("src/authoring/richInlineSessionPersistence.ts")

    expect(index).toContain("./authoring/richInlineSessionPersistence.js")
    expect(source).toContain("VNEXT_RICH_INLINE_REPLAY_VALIDATION_SOURCE")
    expect(source).toContain("VNEXT_RICH_INLINE_REPLAY_VALIDATION_MODE")
    expect(source).toContain("createVNextRichInlineReplayPatchValidation")
    expect(source).toContain("createVNextRichInlineReplayValidation")
    expect(source).toContain("createVNextRichInlineReplayPatchRecord")
    expect(source).not.toContain("createVNextRichInlineSessionPersistenceRecord")
  })

  it("aligns split-map and navigation docs with the rich inline split", () => {
    const splitMap = readText("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")
    const boundary = readText("docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md")
    const retention = readText("docs/CORE_RETENTION_MAP.md")
    const consumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(splitMap).toContain("rich-inline replay validation split is complete")
    expect(boundary).toContain("createVNextRichInlineReplayValidation")
    expect(retention).toContain("createVNextRichInlineReplayValidation")
    expect(consumerMap).toContain("createVNextRichInlineReplayValidation")
    expect(readme).toContain("Core Rich Inline Replay Validation Split")
    expect(readme).toContain("docs/CORE_RICH_INLINE_REPLAY_VALIDATION_SPLIT.md")
    expect(ledger).toContain("| 234 | Core rich inline replay validation split | done |")
    expect(ledger).toContain("## Phase 234 Core Rich Inline Replay Validation Split")
  })
})
