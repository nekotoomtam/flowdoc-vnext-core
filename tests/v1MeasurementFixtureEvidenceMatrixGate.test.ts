import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("v1 measurement fixture evidence matrix gate", () => {
  it("selects stable matrix, corpus, profile, and evidence ownership ids", () => {
    const doc = readText("../docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md")

    expect(doc).toContain("Status: Phase 184 v1 measurement fixture evidence matrix gate.")
    expect(doc).toContain("Matrix id: `v1-measurement-fixture-evidence-matrix-v1`.")
    expect(doc).toContain("Corpus id: `v1-measurement-evidence-corpus-v1`.")
    expect(doc).toContain("Policy revision: `v1-measurement-evidence-policy-v1`.")
    expect(doc).toContain("Baseline profile alias: `measurement-profile-v1:thai-rustybuzz-icu4x-v1`.")
    expect(doc).toContain("Production identity profile")
    expect(doc).toContain("Output shape: `glyph-line-box-v1`.")
    expect(doc).toContain("Raw evidence owner: external/package-local evidence lane.")
    expect(doc).toContain("Root evidence owner: JSON-safe docs/tests summaries only.")
  })

  it("defines required summary facts and release-gating matrix rows", () => {
    const doc = readText("../docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md")

    expect(doc).toContain("## Required Fact Vocabulary")
    expect(doc).toContain("`glyph-facts`: glyph id, glyph advance, and glyph offset facts.")
    expect(doc).toContain("`cluster-map`: glyph cluster to UTF-16 text offset mapping.")
    expect(doc).toContain("`text-range`: UTF-16 start/end offsets")
    expect(doc).toContain("`line-boxes`: line boxes with UTF-16 text ranges")
    expect(doc).toContain("`total-size`: total measured width and height.")
    expect(doc).toContain("`line-count`: number of measured lines.")
    expect(doc).toContain("`drift-summary`: approximate/default versus renderer-backed")
    expect(doc).toContain("`parity-summary`: native/WASM digest and parity status")

    expect(doc).toContain("`v1-measure-latin-product-paragraphs`")
    expect(doc).toContain("`v1-measure-thai-line-break-core`")
    expect(doc).toContain("`v1-measure-mixed-latin-thai-title`")
    expect(doc).toContain("`v1-measure-styled-inline-font-map`")
    expect(doc).toContain("`v1-measure-field-chip-adjacency`")
    expect(doc).toContain("`v1-measure-table-cell-constrained`")
    expect(doc).toContain("`v1-measure-repeated-header-table-lines`")
    expect(doc).toContain("`v1-measure-width-narrow-wide-pair`")
    expect(doc).toContain("`v1-measure-multiline-forced-break`")
    expect(doc).toContain("`v1-measure-large-document-long-block`")
    expect(doc).toContain("`v1-measure-renderer-backed-drift-summary`")
    expect(doc).toContain("`v1-measure-digest-parity-summary`")
  })

  it("marks exploratory coverage and missing-evidence statuses", () => {
    const doc = readText("../docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md")

    expect(doc).toContain("## Exploratory Coverage")
    expect(doc).toContain("`v1-explore-page-summary-label`")
    expect(doc).toContain("`v1-explore-thai-currency-number`")
    expect(doc).toContain("`v1-explore-browser-worker-wasm-targets`")
    expect(doc).toContain("`v1-explore-pdf-fidelity-probe`")
    expect(doc).toContain("## Missing-Evidence Status Policy")
    expect(doc).toContain("`accepted`: release-gating fixture has the required profile")
    expect(doc).toContain("`warning`: exploratory fixture is missing drift or parity")
    expect(doc).toContain("`blocked`: release-gating fixture is missing line boxes")
    expect(doc).toContain("`unknown`: raw evidence, digest, parity, profile identity")
    expect(doc).toContain("Warnings and unknowns may support internal analysis only.")
  })

  it("keeps raw evidence outside core and production binding out of scope", () => {
    const doc = readText("../docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")
    const coreIndex = readText("../src/index.ts")

    expect(doc).toContain("## Raw Evidence Boundary")
    expect(doc).toContain("Raw rustybuzz, WASM, ICU4X, browser, renderer, and PDF probe outputs stay out")
    expect(doc).toContain("Root tests must not require browser drivers, WASM loading")
    expect(doc).toContain("No `measureVNextText(...)` default replacement.")
    expect(doc).toContain("No pagination mutation.")
    expect(doc).toContain("No production renderer-backed measurement binding.")
    expect(doc).toContain("No external text-engine execution in core.")
    expect(doc).toContain("No production PDF/DOCX renderer.")
    expect(doc).toContain("No backend route/server/storage/auth/authz behavior.")
    expect(doc).toContain("No production contenteditable implementation.")
    expect(doc).toContain("No package/document schema change.")
    expect(doc).toContain("No collaboration/offline behavior.")
    expect(doc).toContain("No legacy editor runtime copy.")
    expect(coreMeasurement).not.toContain("V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
  })

  it("advances current pointers to the summary manifest gate", () => {
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")

    expect(currentStatus).toContain("Status: updated after Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("`v1-measurement-evidence-corpus-v1`")
    expect(currentStatus).toContain("keeps raw evidence outside core")

    expect(nextPointer).toContain("Status: current after Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(nextPointer).toContain("Text Engine WASM Toolchain Rust Upgrade Execution Gate.")
    expect(nextPointer).toContain("No raw native/WASM evidence in root tests/docs.")
    expect(nextPointer).toContain("No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.")
  })

  it("documents Phase 184 in the README, roadmap, and ledger", () => {
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(readme).toContain("V1 measurement fixture evidence matrix gate")
    expect(readme).toContain("docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md")
    expect(ledger).toContain("| 184 | V1 measurement fixture evidence matrix gate | done |")
    expect(ledger).toContain("## Phase 184 V1 Measurement Fixture Evidence Matrix Gate")
    expect(roadmap).toContain("## Phase 184: V1 Measurement Fixture Evidence Matrix Gate")
    expect(roadmap).toContain("Historical Phase 184 Handoff")
    expect(roadmap).toContain("Phase 185: Measurement Evidence Summary Manifest Gate")
    expect(roadmap).toContain("Historical Phase 183 Handoff")
  })

  it("keeps required audit report sections visible", () => {
    const doc = readText("../docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
  })
})
