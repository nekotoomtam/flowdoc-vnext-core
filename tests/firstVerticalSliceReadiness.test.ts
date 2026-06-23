import { existsSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function fileExists(path: string): boolean {
  return existsSync(new URL(path, import.meta.url))
}

describe("first vertical slice RC plan", () => {
  it("declares the single-user RC path without production launch claims", () => {
    const doc = readText("../docs/FIRST_VERTICAL_SLICE_RC_PLAN.md")

    expect(doc).toContain("Status: Phase 145 first vertical slice release candidate plan.")
    expect(doc).toContain("canonical template/report document")
    expect(doc).toContain("field binding")
    expect(doc).toContain("browser-local authoring session")
    expect(doc).toContain("rich inline edit can mark exact generation stale")
    expect(doc).toContain("renderer-backed measurement evidence")
    expect(doc).toContain("minimal text-only PDF artifact")
    expect(doc).toContain("artifact manifest")
    expect(doc).toContain("artifact job records")
    expect(doc).toContain("storage adapter boundary")
    expect(doc).toContain("The slice is single-user and evidence-driven.")
    expect(doc).toContain("It is not a production launch.")
  })

  it("keeps blocked production and collaboration claims explicit", () => {
    const doc = readText("../docs/FIRST_VERTICAL_SLICE_RC_PLAN.md")

    expect(doc).toContain("No collaboration.")
    expect(doc).toContain("No offline conflict resolution.")
    expect(doc).toContain("No full production WYSIWYG input implementation.")
    expect(doc).toContain("No default pagination measurement replacement.")
    expect(doc).toContain("No concrete server route.")
    expect(doc).toContain("No concrete database or object store choice.")
    expect(doc).toContain("No full PDF fidelity.")
    expect(doc).toContain("No DOCX output.")
    expect(doc).toContain("No package/document schema change.")
    expect(doc).toContain("No parent editor runtime flip.")
  })

  it("anchors the RC plan to required prior evidence boundaries", () => {
    const doc = readText("../docs/FIRST_VERTICAL_SLICE_RC_PLAN.md")
    const requiredDocs = [
      "../docs/KEY_REGISTRY_BINDING_PLAN.md",
      "../docs/LIVE_LAYOUT_AND_EXACT_GENERATION_PLAN.md",
      "../docs/BACKEND_GENERATION_RUNTIME_PLAN.md",
      "../docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_BRIDGE_BOUNDARY.md",
      "../docs/TEMPLATE_BUILDER_RICH_INLINE_UNDO_REDO_REPLAY_BOUNDARY.md",
      "../docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md",
      "../docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md",
      "../docs/THAI_LINE_BREAK_EVIDENCE_BOUNDARY.md",
      "../docs/TEXT_ENGINE_LINE_WRAP_EVIDENCE_BOUNDARY.md",
      "../docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md",
      "../docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md",
      "../docs/PDF_RENDERER_SPIKE_PACKAGE_BOUNDARY.md",
      "../docs/ARTIFACT_MANIFEST_BOUNDARY.md",
      "../docs/ARTIFACT_API_ROUTE_BOUNDARY.md",
      "../docs/ARTIFACT_JOB_BOUNDARY.md",
      "../docs/STORAGE_ADAPTER_BOUNDARY.md",
      "../docs/PRODUCT_EDITOR_INTEGRATION_SMOKE_BOUNDARY.md",
      "../docs/BROWSER_TIMING_SMOKE_BOUNDARY.md",
      "../docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md",
      "../docs/RICH_INLINE_OPERATION_DECISION_BOUNDARY.md",
    ]

    for (const path of requiredDocs) {
      expect(fileExists(path)).toBe(true)
      expect(doc).toContain(path.replace("../", ""))
    }
  })

  it("documents Phase 145 in the phase trail", () => {
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(readme).toContain("First vertical slice RC plan")
    expect(readme).toContain("docs/FIRST_VERTICAL_SLICE_RC_PLAN.md")
    expect(ledger).toContain("| 145 | First vertical slice release candidate plan | done |")
    expect(roadmap).toContain("## Phase 145: First Vertical Slice Release Candidate Plan")
  })
})
