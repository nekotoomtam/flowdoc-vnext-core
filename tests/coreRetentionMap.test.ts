import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function readText(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8")
}

function collectFiles(dir: string, predicate: (path: string) => boolean): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    const stat = statSync(path)

    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "dist" || entry === "coverage") return []
      return collectFiles(path, predicate)
    }

    return predicate(path) ? [path] : []
  })
}

function repoPath(path: string): string {
  return relative(repoRoot, path).replace(/\\/g, "/")
}

describe("core retention map", () => {
  it("documents the move-and-retain rule for every service-shaped audit area", () => {
    const doc = readText("docs/CORE_RETENTION_MAP.md")
    const audit = readText("docs/CORE_SERVICE_CONCERN_AUDIT.md")
    const requiredSections = [
      "## Move + Retain Rule",
      "## Retention Matrix",
      "## De-export Preconditions",
      "## Boundary Guards",
      "## Next Implementation Order",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
    ]
    const requiredEvidence = [
      "src/generation/apiRoute.ts",
      "src/generation/artifactApiRoute.ts",
      "src/generation/runtime.ts",
      "src/generation/artifactManifest.ts",
      "src/generation/artifactJob.ts",
      "src/persistence/storageAdapter.ts",
      "src/authoring/sessionStorage.ts",
      "src/authoring/richInlineSessionPersistence.ts",
      "src/workflow/submissionState.ts",
      "src/editorBridge/runtime.ts",
      "packages/storage-file-json",
      "packages/internal-alpha-runner",
      "flowdoc-vnext-backend",
    ]

    for (const section of requiredSections) {
      expect(doc).toContain(section)
    }
    for (const evidence of requiredEvidence) {
      expect(doc).toContain(evidence)
    }

    expect(doc).toContain("backend owns")
    expect(doc).toContain("core retains")
    expect(doc).toContain("temporary duplicate")
    expect(doc).toContain("split-before-move")
    expect(doc).toContain("Do not remove public exports only because backend P1 exists.")
    expect(audit).toContain("## Recommended Next Patch")
    expect(audit).toContain("Start with P1, not P2.")
  })

  it("keeps currently exported service-shaped modules marked as temporary retention work", () => {
    const doc = readText("docs/CORE_RETENTION_MAP.md")
    const index = readText("src/index.ts")
    const temporaryExports = [
      "./generation/apiRoute.js",
      "./generation/artifactApiRoute.js",
      "./authoring/sessionStorage.js",
      "./authoring/richInlineSessionPersistence.js",
      "./workflow/submissionState.js",
    ]

    for (const exportedPath of temporaryExports) {
      expect(index).toContain(exportedPath)
    }

    expect(doc).toContain("temporary duplicate until backend route parity")
    expect(doc).toContain("split-before-move")
    expect(doc).toContain("Do not remove public exports only because backend P1 exists.")
    expect(doc).toContain("Editor/backend consumers no longer import the service-shaped core export.")
  })

  it("guards exported core source from concrete backend packages and server IO", () => {
    const sourceFiles = collectFiles(join(repoRoot, "src"), (path) => path.endsWith(".ts"))
    const forbiddenPatterns = [
      /@flowdoc\/storage-file-json/,
      /@flowdoc\/internal-alpha-runner/,
      /@flowdoc\/pdf-renderer-spike/,
      /node:fs(?:\/promises)?/,
      /node:http/,
      /node:https/,
      /from\s+["'](?:express|fastify|koa|hono|@nestjs\/common)["']/,
      /\bcreateServer\(/,
      /\.listen\(/,
      /\bwriteFile\(/,
      /\bcreateWriteStream\(/,
      /\bappendFile\(/,
      /\bmkdir\(/,
      /\brm\(/,
    ]
    const violations = sourceFiles.flatMap((path) => {
      const source = readFileSync(path, "utf8")
      return forbiddenPatterns.some((pattern) => pattern.test(source)) ? [repoPath(path)] : []
    })

    expect(violations).toEqual([])
  })

  it("keeps retained pure contracts explicit in source while backend owns execution", () => {
    const storage = readText("src/persistence/storageAdapter.ts")
    const artifactJob = readText("src/generation/artifactJob.ts")
    const artifactManifest = readText("src/generation/artifactManifest.ts")
    const generationRuntime = readText("src/generation/runtime.ts")
    const sessionStorage = readText("src/authoring/sessionStorage.ts")
    const richInlinePersistence = readText("src/authoring/richInlineSessionPersistence.ts")
    const submissionState = readText("src/workflow/submissionState.ts")

    expect(storage).toContain("interfaceOnly: true")
    expect(storage).toContain("concreteBackend: null")
    expect(artifactJob).toContain("durableRecordOnly: true")
    expect(artifactJob).toContain("workerExecution: false")
    expect(artifactJob).toContain("rendererExecution: false")
    expect(artifactJob).toContain("storageWrites: false")
    expect(artifactManifest).toContain('storageStatus: "not-written"')
    expect(artifactManifest).toContain("storageWrites: false")
    expect(generationRuntime).toContain('mode: "readiness-only"')
    expect(generationRuntime).toContain("artifact: null")
    expect(sessionStorage).toContain("serializeFlowDocPackageV2DocumentVNext")
    expect(sessionStorage).toContain('storageStatus: "not-written"')
    expect(richInlinePersistence).toContain('backendApi: "not-called"')
    expect(richInlinePersistence).toContain('executionStatus: "not-run"')
    expect(submissionState).toContain('storageWrite: "not-written"')
    expect(submissionState).toContain('routeDispatch: "not-run"')
  })

  it("publishes the retention map in repo navigation", () => {
    const readme = readText("README.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(readme).toContain("Core Retention Map")
    expect(readme).toContain("docs/CORE_RETENTION_MAP.md")
    expect(readme).toContain("Core Service Concern Audit")
    expect(readme).toContain("docs/CORE_SERVICE_CONCERN_AUDIT.md")
    expect(ledger).toContain("| 225 | Core retention map | done |")
    expect(ledger).toContain("## Phase 225 Core Retention Map")
    expect(ledger).toContain("move-and-retain")
  })
})
