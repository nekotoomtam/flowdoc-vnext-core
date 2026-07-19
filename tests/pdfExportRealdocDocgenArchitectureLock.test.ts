import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8")
}

describe("PDF-EXPORT-REALDOC-E.0 DocGen architecture lock", () => {
  it("retains Structure authoring and API-driven generation as separate product roles", () => {
    const doc = readText("../docs/PDF_EXPORT_REALDOC_DOCGEN_ARCHITECTURE_LOCK.md")

    for (const section of [
      "## Decision",
      "## Two JSON Families",
      "## Field And Presentation Separation",
      "## Book-Form Composition",
      "## Pre-Test Boundary",
      "## Document Instance Role",
      "## Repository Ownership",
      "## 69C Evidence Mapping",
      "## REALDOC-E Order",
      "## Acceptance Invariants",
      "## Explicitly Not Changed",
      "## PASS",
      "## RISK",
      "## UNKNOWN",
      "## Next Phase",
    ]) expect(doc).toContain(section)

    expect(doc).toMatch(/Editor authors Structure Definition draft/)
    expect(doc).toMatch(/external API supplies data and asset references/)
    expect(doc).toMatch(/This is a pre-test caller of the DocGen pipeline/i)
    expect(doc).toMatch(/not the primary instance\s+authoring product/i)
  })

  it("separates fields, presentation, caller data, and final geometry", () => {
    const doc = readText("../docs/PDF_EXPORT_REALDOC_DOCGEN_ARCHITECTURE_LOCK.md")

    expect(doc).toMatch(/A field definition does not own an absolute page coordinate/)
    expect(doc).toMatch(/One field value\s+may be placed more than once/)
    expect(doc).toMatch(/payload does not supply page numbers, table-cell coordinates, renderer\s+commands, styles/i)
    expect(doc).toMatch(/caller payload and the Editor DOM are never page-layout truth/)
    expect(doc).toMatch(/Generic repeat, conditional, and mixed long-document expansion are not yet\s+accepted/i)
  })

  it("keeps the 69C adapter as evidence rather than canonical schema", () => {
    const doc = readText("../docs/PDF_EXPORT_REALDOC_DOCGEN_ARCHITECTURE_LOCK.md")

    expect(doc).toContain("`uatStructureDefinition.ts`")
    expect(doc).toContain("`uatSemanticNoPagesAdapter.ts`")
    expect(doc).toContain("`uatSectionResolution.ts`")
    expect(doc).toContain("`uatMeasuredExport.ts`")
    expect(doc).toMatch(/69C UAT source remains one demanding test dataset/)
    expect(doc).toMatch(/No fixed global UAT, invoice, or form field list enters Core/)
  })

  it("updates the retained roadmap and phase trail without activating production", () => {
    const roadmap = readText("../docs/PDF_EXPORT_REAL_DOCUMENT_ROADMAP.md")
    const localLock = readText("../docs/PDF_EXPORT_LOCAL_FIRST_ARCHITECTURE_LOCK.md")
    const handoff = readText("../docs/PDF_REAL_EXPORT_HANDOFF.md")
    const measured = readText("../docs/PDF_EXPORT_REALDOC_UAT_MEASURED_EXPORT.md")
    const normalization = readText("../docs/PDF_EXPORT_REALDOC_IMPORTED_SOFT_WRAP_NORMALIZATION.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const map = readText("../docs/CROSS_REPO_OPERATING_MAP.md")

    expect(roadmap).toContain("### REALDOC-E.0 DocGen Architecture Realignment (Accepted)")
    expect(roadmap).toContain("### REALDOC-E.3 Bounded Local Backend DocGen Admission (Accepted)")
    expect(roadmap).toContain("### REALDOC-E.4 Admitted Local Artifact Lifecycle (Accepted)")
    expect(roadmap).toContain("### REALDOC-E.5.0 Document Workspace Product Contract (Accepted)")
    expect(roadmap).toContain("### REALDOC-E.5.1-E.5.9 Editor Pre-Test And E.6 Cross-Repo Acceptance")
    expect(localLock).toContain("REALDOC-E.0 now realigns")
    expect(handoff).toContain("`PDF-EXPORT-REALDOC-E.0` realigns")
    expect(measured).toContain("`PDF-EXPORT-REALDOC-E.1` Published Structure generation input")
    expect(normalization).toContain("REALDOC-E.0 later locks the corrected DocGen boundary")
    expect(measured).not.toContain("`PDF-EXPORT-REALDOC-E` Editor workflow")
    expect(normalization).not.toContain("`PDF-EXPORT-REALDOC-E` Editor workflow")
    expect(readme).toContain("PDF export REALDOC-E.0 realigns")
    expect(ledger).toContain("## PDF-EXPORT-REALDOC-E.0 DocGen Architecture Realignment")
    expect(map).toContain("PDF export REALDOC-E.0 reconnects")
    expect(map).toContain("PDF export REALDOC-E.3 wraps that boundary")
    expect(map).toContain("PDF export REALDOC-E.5.0 locks the Editor product surface")
    expect(ledger).toContain("## PDF-EXPORT-REALDOC-E.3 Bounded Local Backend DocGen Admission")
    expect(ledger).toContain("## PDF-EXPORT-REALDOC-E.5.0 Document Workspace Product Contract")
    expect(docRuntimeClaims(roadmap)).toEqual([])
  })
})

function docRuntimeClaims(roadmap: string): string[] {
  const e0 = roadmap.split("### REALDOC-E.0 DocGen Architecture Realignment (Accepted)")[1]
    ?.split("### REALDOC-E.1 Published Structure Generation Input (Accepted)")[0] ?? ""
  return ["route activated", "renderer promoted", "production ready"].filter((claim) => e0.includes(claim))
}
