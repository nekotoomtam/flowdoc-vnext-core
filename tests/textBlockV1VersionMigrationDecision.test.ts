import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  VNEXT_ACTIVE_DOCUMENT_VERSION,
  VNEXT_ACTIVE_PACKAGE_VERSION,
  VNEXT_TEXT_BLOCK_V1_TARGET_DOCUMENT_VERSION,
  VNEXT_TEXT_BLOCK_V1_VERSION_POLICY,
  safeParseFlowDocPackageV2DocumentVNext,
} from "../src/index.js"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

function fixturePackage(): Record<string, unknown> {
  return JSON.parse(readText("fixtures/product-report-vnext-minimal.flowdoc.json")) as Record<string, unknown>
}

describe("Text-block v1 version and migration decision", () => {
  it("publishes a JSON-safe active, target, and migration policy", () => {
    expect(VNEXT_ACTIVE_PACKAGE_VERSION).toBe(2)
    expect(VNEXT_ACTIVE_DOCUMENT_VERSION).toBe(3)
    expect(VNEXT_TEXT_BLOCK_V1_TARGET_DOCUMENT_VERSION).toBe(4)
    expect(VNEXT_TEXT_BLOCK_V1_VERSION_POLICY).toEqual({
      status: "decision-only",
      active: { packageVersion: 2, documentVersion: 3 },
      target: {
        packageVersion: 3,
        documentVersion: 4,
        packageVersionCondition: "image-registry-requires-package-envelope-change",
      },
      migration: {
        mode: "explicit-copy-forward",
        automaticReadNormalization: false,
        sourceMutation: false,
        coreOwnsSemanticPlan: true,
        backendOwnsRevisionedPersistence: true,
      },
      activationBlockers: [
        "v4-mutation-layout-render-support",
      ],
    })
    expect(JSON.parse(JSON.stringify(VNEXT_TEXT_BLOCK_V1_VERSION_POLICY))).toEqual(VNEXT_TEXT_BLOCK_V1_VERSION_POLICY)
  })

  it("keeps the active parser strict to document v3", () => {
    const pack = fixturePackage()
    const document = pack.document as Record<string, unknown>
    document.version = 4

    const result = safeParseFlowDocPackageV2DocumentVNext(pack)

    expect(result).toMatchObject({ ok: false, reason: "unsupported-version" })
    if (!result.ok) {
      expect(result.issues.map((issue) => issue.path)).toContain("document.version")
    }
  })

  it("anchors active schema literals to the public version policy", () => {
    const documentSource = readText("src/schema/document.ts")
    const packageSource = readText("src/persistence/package.ts")

    expect(documentSource).toContain("z.literal(VNEXT_ACTIVE_DOCUMENT_VERSION)")
    expect(packageSource).toContain("z.literal(VNEXT_ACTIVE_PACKAGE_VERSION)")
    expect(packageSource).not.toContain("normaliz")
    expect(packageSource).not.toContain("migration")
  })

  it("locks migration ownership, activation gates, and repository navigation", () => {
    const decision = readText("docs/TEXT_BLOCK_V1_VERSION_MIGRATION_DECISION.md")
    const workspaceBoundary = readText("docs/WORKSPACE_BOUNDARY.md")
    const legacyGate = readText("docs/LEGACY_MIGRATION_GATE.md")
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    for (const section of [
      "## Active And Target Matrix",
      "## Why Document V4",
      "## Package Version Rule",
      "## V3 Compatibility Policy",
      "## Migration Contract",
      "## Activation Gates",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) {
      expect(decision).toContain(section)
    }

    expect(decision).toContain("Core owns the pure semantic migration plan")
    expect(decision).toMatch(/Backend owns\s+revision checks/)
    expect(decision).toContain("Editor owns user intent")
    expect(decision).toContain("must not mutate its v3 input")
    expect(workspaceBoundary).toContain("migration between two accepted canonical versions")
    expect(workspaceBoundary).toContain("never become a silent package-read compatibility adapter")
    expect(legacyGate).toContain("## Canonical Version Migration Exception")
    expect(legacyGate).toContain("Prototype, legacy-editor, and never-canonical shapes do not qualify")
    expect(readme).toContain("docs/TEXT_BLOCK_V1_VERSION_MIGRATION_DECISION.md")
    expect(ledger).toContain("| 251 | Text-block v1 version and migration decision | done |")
    expect(ledger).toContain("## Phase 251 Text-block v1 Version And Migration Decision")
  })
})
