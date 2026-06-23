import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

describe("vNext five-lane project progress index", () => {
  it("summarizes all five lanes with phase coverage and production gaps", () => {
    const index = readText("docs/FIVE_LANE_PROJECT_PROGRESS_INDEX.md")

    expect(index).toContain("Status: Phase 131 five-lane project progress index and roadmap audit.")
    expect(index).toContain("## Summary")
    expect(index).toContain("Viewport / Virtualization")
    expect(index).toContain("Structural Runtime")
    expect(index).toContain("WYSIWYG / Editing")
    expect(index).toContain("Backend / API / Persistence")
    expect(index).toContain("Exact Output / Renderer")
    expect(index).toContain("| Viewport / Virtualization | 45-68 |")
    expect(index).toContain("| Structural Runtime | 69-77 |")
    expect(index).toContain("| WYSIWYG / Editing | 36-42, 78-85, 116-130 |")
    expect(index).toContain("| Backend / API / Persistence | 86-92 plus 129 |")
    expect(index).toContain("| Exact Output / Renderer | 93-115 |")
    expect(index).toContain("Remaining Before Production")
    expect(index).toContain("primary contenteditable input")
    expect(index).toContain("concrete PDF/DOCX bytes")
    expect(index).toContain("storage adapters and schemas")
  })

  it("links each lane to the current evidence documents", () => {
    const index = readText("docs/FIVE_LANE_PROJECT_PROGRESS_INDEX.md")
    const viewportAudit = readText("docs/TEMPLATE_BUILDER_VIEWPORT_LARGE_DOCUMENT_AUDIT.md")
    const structuralAudit = readText("docs/TEMPLATE_BUILDER_STRUCTURAL_RUNTIME_CLOSE_AUDIT.md")
    const wysiwygAudit = readText("docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md")
    const persistenceAudit = readText("docs/PERSISTENCE_CLOSE_AUDIT.md")
    const exactAudit = readText("docs/EXACT_OUTPUT_CLOSE_AUDIT.md")
    const textEngineAudit = readText("docs/TEXT_ENGINE_ADAPTER_LANE_CLOSE_AUDIT.md")
    const rustybuzzCorpus = readText("docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_BOUNDARY.md")

    expect(viewportAudit).toContain("Status: Phase 68 behavior audit.")
    expect(structuralAudit).toContain("Status: Phase 77 close audit.")
    expect(wysiwygAudit).toContain("Status: Phase 130 rich inline live/exact parity audit.")
    expect(persistenceAudit).toContain("Status: Phase 92 close audit.")
    expect(exactAudit).toContain("Status: Phase 99 close audit.")
    expect(textEngineAudit).toContain("Status: Phase 111 close audit.")
    expect(rustybuzzCorpus).toContain("Status: Phase 115 rustybuzz smoke corpus boundary.")
    expect(index).toContain("docs/TEMPLATE_BUILDER_VIEWPORT_LARGE_DOCUMENT_AUDIT.md")
    expect(index).toContain("docs/TEMPLATE_BUILDER_STRUCTURAL_RUNTIME_CLOSE_AUDIT.md")
    expect(index).toContain("docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md")
    expect(index).toContain("docs/PERSISTENCE_CLOSE_AUDIT.md")
    expect(index).toContain("docs/EXACT_OUTPUT_CLOSE_AUDIT.md")
    expect(index).toContain("docs/TEXT_ENGINE_ADAPTER_LANE_CLOSE_AUDIT.md")
    expect(index).toContain("docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_BOUNDARY.md")
  })

  it("keeps the project index honest about non-goals", () => {
    const index = readText("docs/FIVE_LANE_PROJECT_PROGRESS_INDEX.md")

    expect(index).toContain("It is not an implementation phase")
    expect(index).toContain("No lane should be called production-complete")
    expect(index).toContain("No runtime behavior changed")
    expect(index).toContain("No backend route, storage adapter, renderer artifact output, collaboration")
    expect(index).toContain("production contenteditable input")
    expect(index).toContain("Collaboration and offline replay remain cross-lane unknowns")
  })

  it("records Phase 131 in README, roadmap, and ledger", () => {
    const readme = readText("README.md")
    const roadmap = readText("docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const ledger = readText("docs/PHASE_LEDGER.md")

    expect(readme).toContain("docs/FIVE_LANE_PROJECT_PROGRESS_INDEX.md")
    expect(readme).toContain("Five-lane project progress index")
    expect(roadmap).toContain("## Phase 131: Five-Lane Project Progress Index")
    expect(roadmap).toContain("future phase planning can use the index")
    expect(ledger).toContain("| 131 | Five-lane project progress index | done |")
    expect(ledger).toContain("## Phase 131 Five-Lane Project Progress Index")
  })
})
