import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

describe("core session package snapshot split", () => {
  it("documents the retained snapshot helper and compatibility storage record", () => {
    const doc = readText("docs/CORE_SESSION_PACKAGE_SNAPSHOT_SPLIT.md")
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

    expect(doc).toContain("createVNextSessionPackageSnapshot")
    expect(doc).toContain("createVNextSessionStorageRecord")
    expect(doc).toContain("storageKey")
    expect(doc).toContain('storageStatus: "not-written"')
    expect(doc).toContain("No public export removed")
  })

  it("keeps the retained helper public through the existing authoring module export", () => {
    const index = readText("src/index.ts")
    const source = readText("src/authoring/sessionStorage.ts")

    expect(index).toContain("./authoring/sessionStorage.js")
    expect(source).toContain("VNEXT_SESSION_PACKAGE_SNAPSHOT_SOURCE")
    expect(source).toContain("VNEXT_SESSION_PACKAGE_SNAPSHOT_MODE")
    expect(source).toContain("createVNextSessionPackageSnapshot")
    expect(source).toContain("createVNextSessionStorageRecord")
  })

  it("aligns split-map and navigation docs with the session split", () => {
    const splitMap = readText("docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md")
    const sessionBoundary = readText("docs/SESSION_STORAGE_BOUNDARY.md")
    const retention = readText("docs/CORE_RETENTION_MAP.md")
    const consumerMap = readText("docs/CORE_SERVICE_CONSUMER_MAP.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(splitMap).toContain("session package snapshot split is complete")
    expect(sessionBoundary).toContain("createVNextSessionPackageSnapshot")
    expect(retention).toContain("createVNextSessionPackageSnapshot")
    expect(consumerMap).toContain("createVNextSessionPackageSnapshot")
    expect(readme).toContain("Core Session Package Snapshot Split")
    expect(readme).toContain("docs/CORE_SESSION_PACKAGE_SNAPSHOT_SPLIT.md")
    expect(ledger).toContain("| 233 | Core session package snapshot split | done |")
    expect(ledger).toContain("## Phase 233 Core Session Package Snapshot Split")
  })
})
