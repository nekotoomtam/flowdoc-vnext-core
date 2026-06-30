import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("measurement evidence summary manifest gate", () => {
  it("defines the JSON-safe top-level manifest contract", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md")

    expect(doc).toContain("Status: Phase 185 measurement evidence summary manifest gate.")
    expect(doc).toContain("## Manifest Contract")
    expect(doc).toContain("`manifestVersion`: `1`.")
    expect(doc).toContain("`matrixId`: `v1-measurement-fixture-evidence-matrix-v1`.")
    expect(doc).toContain("`corpusId`: `v1-measurement-evidence-corpus-v1`.")
    expect(doc).toContain("`policyRevision`: `v1-measurement-evidence-policy-v1`.")
    expect(doc).toContain("`measurementProfileId`: the exact profile represented")
    expect(doc).toContain("`rawEvidenceIncluded`: must be `false`.")
    expect(doc).toContain("`manifestStatus`: aggregate `accepted`, `warning`, `blocked`, or `unknown`.")
  })

  it("defines fixture summaries, digest, parity, drift, status, and retention shape", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md")

    expect(doc).toContain("## Fixture Summary Shape")
    expect(doc).toContain("`fixtureId`: stable Phase 184 fixture id.")
    expect(doc).toContain("`scenarioIds`: stable scenario/sample ids")
    expect(doc).toContain("`gateType`: `release-gating` or `exploratory`.")
    expect(doc).toContain("`factCoverage`: per-fact `present`, `missing`, or `not-required`.")
    expect(doc).toContain("## Digest Identity Summary")
    expect(doc).toContain('"status": "pinned | pending | missing | stale"')
    expect(doc).toContain("## Native/WASM Parity Summary")
    expect(doc).toContain('"status": "matching | mismatched | not-run | missing | stale"')
    expect(doc).toContain("## Renderer-Backed Drift Summary")
    expect(doc).toContain('"tolerance"')
    expect(doc).toContain("## Missing-Evidence Status")
    expect(doc).toContain("The manifest aggregate status must be the most severe")
    expect(doc).toContain("## Retention Pointer Shape")
    expect(doc).toContain('"includedInRoot": false')
  })

  it("includes a bounded unknown example and replacement blockers", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md")

    expect(doc).toContain("## Minimal JSON-Safe Example")
    expect(doc).toContain('"manifestId": "measurement-evidence-summary-manifest-v1"')
    expect(doc).toContain('"fixtureId": "v1-measure-thai-line-break-core"')
    expect(doc).toContain('"status": "unknown"')
    expect(doc).toContain('"replacementBlockers": ["release-gating-summaries-missing"]')
    expect(doc).toContain("The example is intentionally `unknown`.")
    expect(doc).toContain("## Replacement Blockers")
    expect(doc).toContain("every release-gating fixture row must have an `accepted` status")
    expect(doc).toContain("a later binding phase must explicitly accept replacement")
  })

  it("keeps raw evidence, runtime execution, and production binding out of scope", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")
    const coreIndex = readText("../src/index.ts")

    expect(doc).toContain("This is a manifest-shape gate only.")
    expect(doc).toContain("No `measureVNextText(...)` default replacement.")
    expect(doc).toContain("No pagination mutation.")
    expect(doc).toContain("No production renderer-backed measurement binding.")
    expect(doc).toContain("No external text-engine execution in core.")
    expect(doc).toContain("No raw evidence in root tests/docs.")
    expect(doc).toContain("No production PDF/DOCX renderer.")
    expect(doc).toContain("No backend route/server/storage/auth/authz behavior.")
    expect(doc).toContain("No production contenteditable implementation.")
    expect(doc).toContain("No package/document schema change.")
    expect(doc).toContain("No collaboration/offline behavior.")
    expect(doc).toContain("No legacy editor runtime copy.")
    expect(coreMeasurement).not.toContain("MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
  })

  it("advances current pointers to the summary manifest fixture stub gate", () => {
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")

    expect(currentStatus).toContain("Status: updated after Template Publish Accepted Version Metadata Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("Text Engine WASM Toolchain Version Compatibility Gate.")
    expect(currentStatus).toContain("measurement-evidence-summary-manifest-v1")
    expect(currentStatus).toContain("Raw native/WASM/renderer evidence remains outside root tests/docs.")

    expect(nextPointer).toContain("Status: current after Template Publish Accepted Version Metadata Gate.")
    expect(nextPointer).toContain("Text Engine WASM Bindgen Export Dependency Gate.")
    expect(nextPointer).toContain("No raw evidence in root tests/docs.")
    expect(nextPointer).toContain("No raw evidence in root tests/docs.")
  })

  it("documents Phase 185 in the README, roadmap, and ledger", () => {
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(readme).toContain("Measurement evidence summary manifest gate")
    expect(readme).toContain("docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md")
    expect(ledger).toContain("| 185 | Measurement evidence summary manifest gate | done |")
    expect(ledger).toContain("## Phase 185 Measurement Evidence Summary Manifest Gate")
    expect(roadmap).toContain("## Phase 185: Measurement Evidence Summary Manifest Gate")
    expect(roadmap).toContain("Historical Phase 185 Handoff")
    expect(roadmap).toContain("Phase 186: Measurement Evidence Summary Manifest Fixture Stub Gate")
    expect(roadmap).toContain("Historical Phase 184 Handoff")
  })

  it("keeps required audit report sections visible", () => {
    const doc = readText("../docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md")

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
