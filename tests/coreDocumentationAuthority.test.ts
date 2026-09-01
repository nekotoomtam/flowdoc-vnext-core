import { access, readdir, readFile } from "node:fs/promises"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

const projectRoot = process.cwd()
const retiredSuperpowersMarkdown = [
  "docs/superpowers/plans/2026-07-21-text-block-complete-geometry-boundary.md",
  "docs/superpowers/specs/2026-07-21-persistent-text-block-spatial-flow-design.md",
  "docs/superpowers/specs/2026-07-27-initial-text-block-authored-box-geometry-design.md",
  "docs/superpowers/specs/2026-07-27-inline-image-line-box-geometry-design.md",
] as const
const retiredHiddenSuperpowersMarkdown = [
  ".superpowers/sdd/2026-07-31-unified-incremental-root-transition-5b-1-corrective/collision-fix-report.md",
  ".superpowers/sdd/2026-07-31-unified-incremental-root-transition-5b-1-corrective/delivery-fix-report.md",
  ".superpowers/sdd/2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective/final-review-verdict.md",
  ".superpowers/sdd/2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective/final-verification.md",
  ".superpowers/sdd/2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective/source-envelope-verification.md",
] as const
const retiredProjectMarkdown = [
  "docs/project/CURRENT_STATE.md",
  "docs/project/ROADMAP.md",
  "docs/project/RISK_REGISTER.md",
  "docs/project/KNOWN_UNKNOWNS.md",
] as const
const retiredProjectDocumentIds = [
  "DOC-CORE-PROJECT-CURRENT-STATE",
  "DOC-CORE-PROJECT-ROADMAP",
  "DOC-CORE-PROJECT-RISK-REGISTER",
  "DOC-CORE-PROJECT-KNOWN-UNKNOWNS",
] as const
const boundedRuntimePlanMarkdown = [
  "docs/BACKEND_GENERATION_RUNTIME_PLAN.md",
  "docs/FRONTEND_AUTHORING_RUNTIME_PLAN.md",
  "docs/KEY_REGISTRY_BINDING_PLAN.md",
  "docs/LIVE_LAYOUT_AND_EXACT_GENERATION_PLAN.md",
] as const
const boundedRenderApiPlanningMarkdown = [
  "docs/RENDER_API_CONTRACT_PLANNING_GATE.md",
  "docs/RENDER_API_RESPONSE_STATUS_CONTRACT_GATE.md",
  "docs/RUNTIME_BINDING_IMPLEMENTATION_PLANNING_GATE.md",
] as const
const boundedRenderApiContractMarkdown = [
  "docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md",
  "docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md",
  "docs/RENDER_READINESS_VALIDATION_POLICY_GATE.md",
  "docs/ARTIFACT_POINTER_JOB_STATUS_PLACEHOLDER_POLICY_GATE.md",
  "docs/RENDER_API_ERROR_BLOCKER_VOCABULARY_GATE.md",
  "docs/RENDER_API_CONTRACT_CLOSE_AUDIT.md",
] as const
const boundedCanonicalGeneratedMarkdown = [
  "docs/DOCUMENT_MAP.md",
  "docs/GLOSSARY.md",
  "docs/GLOSSARY_TH.md",
  "docs/versions/0_1/VERSION_OVERVIEW.md",
  "docs/versions/0_1/CAPABILITY_SET.md",
] as const
const boundedCanonicalVersionMarkdown = [
  ...boundedCanonicalGeneratedMarkdown,
  "docs/versions/0_1/COMPATIBILITY.md",
] as const
const activeReferenceFiles = [
  "docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md",
  "tests/liveDraftMr1CompleteGeometryBoundary.test.ts",
  "tests/liveDraftMr1AuthoredBoxGeometry4a.test.ts",
  "tests/liveDraftMr1InlineImageGeometry4b.test.ts",
] as const

type Manifest = {
  canonicalRoots: string[]
  documents: Array<{
    documentId: string
    path: string
  }>
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function listFiles(root: string): Promise<string[]> {
  if (!(await pathExists(root))) return []
  const entries = await readdir(root, { withFileTypes: true })
  const children = await Promise.all(entries.map(async (entry) => {
    const path = join(root, entry.name)
    if (entry.isDirectory()) return listFiles(path)
    return entry.isFile() ? [path] : []
  }))
  return children.flat().sort()
}

async function listMarkdownFiles(relativeDir: string): Promise<string[]> {
  const files = await listFiles(join(projectRoot, relativeDir))
  return files
    .filter((path) => path.endsWith(".md"))
    .map((path) => relative(projectRoot, path).replaceAll("\\", "/"))
}

function normalize(value: string): string {
  return value.replace(/\s+/gu, " ")
}

describe("Core documentation authority", () => {
  it("keeps FlowDoc-wide plans in Project Control instead of Core docs/superpowers", async () => {
    for (const path of retiredSuperpowersMarkdown) {
      await expect(pathExists(join(projectRoot, path)), path).resolves.toBe(false)
    }
    await expect(listMarkdownFiles("docs/superpowers")).resolves.toEqual([])

    const agents = normalize(await readFile(join(projectRoot, "AGENTS.md"), "utf8"))
    expect(agents).toContain("Documentation Authority")
    expect(agents).toContain("flowdoc-documentation-authority-policy.md")
    expect(agents).toContain(
      "Do not create product-repository `docs/superpowers/plans` or `docs/superpowers/specs` files for FlowDoc-wide truth",
    )

    const staleReferences = []
    for (const relativePath of activeReferenceFiles) {
      const text = await readFile(join(projectRoot, relativePath), "utf8")
      if (text.includes("docs/superpowers/")) {
        staleReferences.push(relativePath)
      }
    }
    expect(staleReferences).toEqual([])

    const handoff = normalize(await readFile(
      join(projectRoot, "docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md"),
      "utf8",
    ))
    expect(handoff).toContain("Project Control")
    expect(handoff).toContain("text-block/OVERVIEW.md")
    expect(handoff).toContain("live-draft/geometry-and-scene-projection.md")
    expect(handoff).toContain("historical superpowers sources are retired")
  })

  it("keeps hidden superpowers SDD Markdown retired from Core", async () => {
    for (const path of retiredHiddenSuperpowersMarkdown) {
      await expect(pathExists(join(projectRoot, path)), path).resolves.toBe(false)
    }
    await expect(listMarkdownFiles(".superpowers")).resolves.toEqual([])

    const agents = normalize(await readFile(join(projectRoot, "AGENTS.md"), "utf8"))
    expect(agents).toContain("Project Control is the canonical home for FlowDoc-wide shared understanding")
    expect(agents).toContain("Core Markdown may remain only for Core-owned implementation")
  })

  it("keeps Core docs/project state, roadmap, risk, and unknown docs retired into Project Control", async () => {
    for (const path of retiredProjectMarkdown) {
      await expect(pathExists(join(projectRoot, path)), path).resolves.toBe(false)
    }
    await expect(listMarkdownFiles("docs/project")).resolves.toEqual([])

    const manifest = JSON.parse(await readFile(join(projectRoot, "docs/manifest.json"), "utf8")) as Manifest
    expect(manifest.canonicalRoots).not.toContain("docs/project")

    const retiredIds = new Set<string>(retiredProjectDocumentIds)
    const activeRetiredRows = manifest.documents.filter((document) => (
      document.path.startsWith("docs/project/")
      || retiredIds.has(document.documentId)
    ))
    expect(activeRetiredRows).toEqual([])

    const currentStatus = normalize(await readFile(join(projectRoot, "docs/CURRENT_STATUS.md"), "utf8"))
    const nextPhasePointer = normalize(await readFile(join(projectRoot, "docs/NEXT_PHASE_POINTER.md"), "utf8"))
    const phaseLedger = normalize(await readFile(join(projectRoot, "docs/PHASE_LEDGER.md"), "utf8"))
    const documentMap = normalize(await readFile(join(projectRoot, "docs/DOCUMENT_MAP.md"), "utf8"))

    for (const pointer of [currentStatus, nextPhasePointer, phaseLedger]) {
      expect(pointer).toContain("Project Control")
      expect(pointer).toContain("core-project-docs-retirement-2026-09-01.md")
    }
    expect(documentMap).not.toContain("docs/project/")
  })

  it("keeps surviving Core runtime plan docs bounded to Core-local implementation context", async () => {
    for (const path of boundedRuntimePlanMarkdown) {
      const text = normalize(await readFile(join(projectRoot, path), "utf8"))
      expect(text, path).toContain("Authority Boundary")
      expect(text, path).toContain("Owner repository: Core.")
      expect(text, path).toContain("Core-local implementation context")
      expect(text, path).toContain("Project Control owns FlowDoc-wide Work, Phase, Checklist, Evidence, Risk, Unknown, Roadmap, and cleanup state.")
      expect(text, path).toContain("flowdoc-documentation-authority-cleanup")
      expect(text, path).toContain("core-runtime-plan-boundary-2026-09-01.md")
      expect(text, path).toContain("does not promote Core, Backend, Editor, compatibility, frontend readiness, FlowDoc product truth, or map truth")
    }
  })

  it("keeps surviving Render API planning gates bounded to Core-local implementation context", async () => {
    for (const path of boundedRenderApiPlanningMarkdown) {
      const text = normalize(await readFile(join(projectRoot, path), "utf8"))
      expect(text, path).toContain("Authority Boundary")
      expect(text, path).toContain("Owner repository: Core.")
      expect(text, path).toContain("Core-local implementation context")
      expect(text, path).toContain("Project Control owns FlowDoc-wide Work, Phase, Checklist, Evidence, Risk, Unknown, Roadmap, and cleanup state.")
      expect(text, path).toContain("flowdoc-documentation-authority-cleanup")
      expect(text, path).toContain("core-render-api-planning-boundary-2026-09-01.md")
      expect(text, path).toContain("does not promote Core, Backend, Editor, compatibility, frontend readiness, FlowDoc product truth, or map truth")
    }
  })

  it("keeps surviving Render API contract gates bounded to Core-local implementation context", async () => {
    for (const path of boundedRenderApiContractMarkdown) {
      const text = normalize(await readFile(join(projectRoot, path), "utf8"))
      expect(text, path).toContain("Authority Boundary")
      expect(text, path).toContain("Owner repository: Core.")
      expect(text, path).toContain("Core-local implementation context")
      expect(text, path).toContain("Project Control owns FlowDoc-wide Work, Phase, Checklist, Evidence, Risk, Unknown, Roadmap, and cleanup state.")
      expect(text, path).toContain("flowdoc-documentation-authority-cleanup")
      expect(text, path).toContain("core-render-api-contract-boundary-2026-09-01.md")
      expect(text, path).toContain("does not promote Core, Backend, Editor, compatibility, frontend readiness, FlowDoc product truth, or map truth")
    }
  })

  it("keeps surviving canonical generated and version docs bounded to Core-owned documentation context", async () => {
    for (const path of boundedCanonicalVersionMarkdown) {
      const text = normalize(await readFile(join(projectRoot, path), "utf8"))
      expect(text, path).toContain("Authority Boundary")
      expect(text, path).toContain("Owner repository: Core.")
      expect(text, path).toContain("Project Control owns FlowDoc-wide Work, Phase, Checklist, Evidence, Risk, Unknown, Roadmap, documentation authority, product terminology, compatibility promotion, and cleanup state.")
      expect(text, path).toContain("flowdoc-product-development-resumption > flowdoc-documentation-authority-cleanup")
      expect(text, path).toContain("core-generated-docs-boundary-2026-09-01.md")
      expect(text, path).toContain("does not promote Core, Backend, Editor, compatibility, release readiness, frontend readiness, FlowDoc product truth, Project Control terminology authority, or map truth")
    }

    for (const path of boundedCanonicalGeneratedMarkdown) {
      const text = normalize(await readFile(join(projectRoot, path), "utf8"))
      expect(text, path).toContain("Core-owned generated documentation view")
    }

    const compatibility = normalize(await readFile(join(projectRoot, "docs/versions/0_1/COMPATIBILITY.md"), "utf8"))
    expect(compatibility).toContain("Core-owned authored compatibility metadata and non-claim prose")
  })
})
