import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("measurement digest parity drift hardening gate", () => {
  it("defines digest identity and retention expectations", () => {
    const doc = readText("../docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md")

    expect(doc).toContain("Status: Phase 183 measurement digest parity drift hardening gate.")
    expect(doc).toContain("## Required Digest Identity And Retention")
    expect(doc).toContain("`measurementProfileId` pinned")
    expect(doc).toContain("rustybuzz revision, ICU4X revision, ICU4X data revision")
    expect(doc).toContain("font asset ids and sha256 hashes")
    expect(doc).toContain("WASM artifact digest with `digestStatus: pinned`")
    expect(doc).toContain("raw native evidence, raw WASM evidence")
    expect(doc).toContain("resets parity and drift acceptance to `unknown`")
  })

  it("defines native/WASM parity and drift escalation policy", () => {
    const doc = readText("../docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md")

    expect(doc).toContain("## Native/WASM Parity Acceptance Criteria")
    expect(doc).toContain("runtime identity status is `parity-ready`")
    expect(doc).toContain("compared facts include glyph id, glyph advance")
    expect(doc).toContain("parity report status is `matching`")
    expect(doc).toContain("## Drift Threshold Policy")
    expect(doc).toContain("| accepted | Within approved per-profile tolerances | 0 for required release fixtures |")
    expect(doc).toContain("| warning | Over tolerance on non-release exploratory fixtures")
    expect(doc).toContain("| blocked | Over tolerance on any required release fixture |")
    expect(doc).toContain("| unknown | Missing digest, parity, profile, fixture, or raw evidence |")
    expect(doc).toContain("non-zero line-count drift on required release fixtures as blocked")
  })

  it("defines required v1 evidence and replacement blockers", () => {
    const doc = readText("../docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md")

    expect(doc).toContain("## Required V1 Measurement Evidence")
    expect(doc).toContain("canonical product report fixture paragraphs")
    expect(doc).toContain("Thai text and Thai line-break corpus samples")
    expect(doc).toContain("mixed Latin/Thai text")
    expect(doc).toContain("styled inline runs across style keys")
    expect(doc).toContain("atomic field-ref / field-chip adjacency")
    expect(doc).toContain("table-cell text measurement")
    expect(doc).toContain("long text-block cases used by large-document acceptance tests")
    expect(doc).toContain("## Blockers Before Replacing `measureVNextText(...)`")
    expect(doc).toContain("pagination cache/invalidation behavior has a separate migration plan")
    expect(doc).toContain("production rollout, rollback, telemetry")
  })

  it("keeps measurement binding and runtime execution out of scope", () => {
    const doc = readText("../docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md")
    const coreMeasurement = readText("../src/pagination/textMeasurement.ts")
    const coreIndex = readText("../src/index.ts")

    expect(doc).toContain("This is a gate and decision boundary only.")
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
    expect(coreMeasurement).toContain("createApproximateVNextTextMeasurer")
    expect(coreMeasurement).not.toContain("MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE")
    expect(coreIndex).not.toContain("text-engine-rust-wasm")
  })

  it("advances current pointers to the v1 fixture evidence matrix gate", () => {
    const currentStatus = readText("../docs/CURRENT_STATUS.md")
    const nextPointer = readText("../docs/NEXT_PHASE_POINTER.md")

    expect(currentStatus).toContain("Status: updated after Phase 187.")
    expect(currentStatus).toContain(
      "Phase 187: Measurement Evidence Coverage Gap Triage Gate.",
    )
    expect(currentStatus).toContain(
      "Phase 188: Text Engine Runtime Identity Digest Evidence Builder Gate.",
    )
    expect(currentStatus).toContain("digest identity is pinned")
    expect(currentStatus).toContain("native/WASM parity is matching")
    expect(currentStatus).toContain("Do not execute external text engines in core.")

    expect(nextPointer).toContain("Status: current after Phase 187.")
    expect(nextPointer).toContain(
      "Phase 188: Text Engine Runtime Identity Digest Evidence Builder Gate.",
    )
    expect(nextPointer).toContain("No real native/WASM evidence in root core.")
    expect(nextPointer).toContain("No external text-engine execution in core.")
  })

  it("documents Phase 183 in the README, roadmap, and ledger", () => {
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(readme).toContain("Measurement digest parity drift hardening gate")
    expect(readme).toContain("docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md")
    expect(ledger).toContain("| 183 | Measurement digest parity drift hardening gate | done |")
    expect(ledger).toContain("## Phase 183 Measurement Digest Parity Drift Hardening Gate")
    expect(roadmap).toContain("## Phase 183: Measurement Digest Parity Drift Hardening Gate")
    expect(roadmap).toContain("Historical Phase 183 Handoff")
    expect(roadmap).toContain("Phase 184: V1 Measurement Fixture Evidence Matrix Gate")
    expect(roadmap).toContain("Historical Phase 182 Handoff")
  })

  it("keeps required audit report sections visible", () => {
    const doc = readText("../docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md")

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
